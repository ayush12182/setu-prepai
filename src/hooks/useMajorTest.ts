import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';

// ─── Types ─────────────────────────────────────────────────────────────────

export type QuestionType = 'mcq' | 'integer';
export type SubjectName = 'physics' | 'chemistry' | 'maths';

export interface MajorTestQuestion {
  id: string;
  questionNumber: number;
  subject: SubjectName;
  section: 'A' | 'B'; // A = MCQ (1-20), B = Integer (21-25)
  questionType: QuestionType;
  chapterId: string;
  chapterName: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D'; // For MCQ
  correctNumerical?: number; // For integer type
  toleranceRange?: number; // e.g. ±0.01
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  conceptTested: string;
}

export interface MajorTestAnswer {
  questionId: string;
  questionNumber: number;
  subject: string;
  questionType: QuestionType;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null; // For MCQ
  numericalAnswer: number | null; // For integer type
  correctOption: 'A' | 'B' | 'C' | 'D';
  correctNumerical?: number;
  toleranceRange?: number;
  isMarkedReview: boolean;
  timeSpent: number;
}

export interface MajorTestCycle {
  id: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  testDate: string;
  isActive: boolean;
}

export interface MajorTestAttempt {
  id: string;
  cycleId: string;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'auto_submitted' | 'abandoned';
  tabSwitchCount: number;
  score?: number;
  percentileEstimate?: number;
}

export interface ChapterAnalysis {
  chapterId: string;
  chapterName: string;
  subject: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  avgTime: number;
  strengthLevel: 'strong' | 'moderate' | 'weak';
}

// ─── Scoring helpers ───────────────────────────────────────────────────────

export function isAnswerCorrect(answer: MajorTestAnswer): boolean {
  if (answer.questionType === 'integer') {
    if (answer.numericalAnswer === null) return false;
    const tolerance = answer.toleranceRange ?? 0;
    const correct = answer.correctNumerical ?? 0;
    return Math.abs(answer.numericalAnswer - correct) <= tolerance;
  }
  return answer.selectedOption === answer.correctOption;
}

export function isAnswered(answer: MajorTestAnswer): boolean {
  if (answer.questionType === 'integer') return answer.numericalAnswer !== null;
  return answer.selectedOption !== null;
}

export function calculateScore(answer: MajorTestAnswer): number {
  if (!isAnswered(answer)) return 0; // unattempted = 0
  if (isAnswerCorrect(answer)) return 4; // correct = +4
  // Incorrect: MCQ = -1, Integer = 0
  return answer.questionType === 'mcq' ? -1 : 0;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useMajorTest = () => {
  const [questions, setQuestions] = useState<MajorTestQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<string, MajorTestAnswer>>(new Map());
  const [currentAttempt, setCurrentAttempt] = useState<MajorTestAttempt | null>(null);
  const [activeCycle, setActiveCycle] = useState<MajorTestCycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(180 * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch active cycle ────────────────────────────────────────────────
  const fetchActiveCycle = async () => {
    const { data } = await supabase
      .from('major_test_cycles')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setActiveCycle({
        id: data.id,
        cycleNumber: data.cycle_number,
        startDate: data.start_date,
        endDate: data.end_date,
        testDate: data.test_date,
        isActive: data.is_active,
      });
    }
    return data;
  };

  // ── Check for existing in-progress attempt ────────────────────────────
  const checkExistingAttempt = async (userId: string) => {
    const { data } = await supabase
      .from('major_test_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .maybeSingle();
    return data;
  };

  // ── Generate 75 questions (25 per subject: 20 MCQ + 5 Integer) ────────
  const generateQuestions = async (): Promise<MajorTestQuestion[]> => {
    setLoading(true);
    setError(null);

    try {
      const allQuestions: MajorTestQuestion[] = [];

      const getRandomChapters = (chapters: typeof physicsChapters, count: number) => {
        const shuffled = [...chapters].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      };

      const physicsSelected = getRandomChapters(physicsChapters, 5);
      const chemistrySelected = getRandomChapters(chemistryChapters, 5);
      const mathsSelected = getRandomChapters(mathsChapters, 5);

      const subjects: { name: SubjectName; chapters: typeof physicsChapters }[] = [
        { name: 'physics', chapters: physicsSelected },
        { name: 'chemistry', chapters: chemistrySelected },
        { name: 'maths', chapters: mathsSelected },
      ];

      for (const subject of subjects) {
        const subjectQuestions: MajorTestQuestion[] = [];

        // Fetch existing questions from DB
        for (const chapter of subject.chapters) {
          const { data: existingQuestions } = await supabase
            .from('questions')
            .select('*')
            .eq('chapter_id', chapter.id)
            .limit(8);

          if (existingQuestions) {
            const shuffled = existingQuestions.sort(() => Math.random() - 0.5);
            for (const q of shuffled) {
              subjectQuestions.push({
                id: q.id,
                questionNumber: 0, // renumbered later
                subject: subject.name,
                section: 'A',
                questionType: 'mcq',
                chapterId: chapter.id,
                chapterName: chapter.name,
                questionText: q.question_text,
                optionA: q.option_a,
                optionB: q.option_b,
                optionC: q.option_c,
                optionD: q.option_d,
                correctOption: q.correct_option as 'A' | 'B' | 'C' | 'D',
                difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
                explanation: q.explanation,
                conceptTested: q.concept_tested,
              });
            }
          }
        }

        // If not enough, generate via edge function
        const questionsNeeded = 25 - subjectQuestions.length;
        if (questionsNeeded > 0) {
          const { data } = await supabase.functions.invoke('generate-questions', {
            body: {
              chapterId: subject.chapters[0].id,
              chapterName: subject.chapters[0].name,
              subject: subject.name,
              difficulty: 'medium',
              count: questionsNeeded,
            },
          });

          if (data?.questions) {
            for (const q of data.questions) {
              subjectQuestions.push({
                id: q.id || crypto.randomUUID(),
                questionNumber: 0,
                subject: subject.name,
                section: 'A',
                questionType: 'mcq',
                chapterId: subject.chapters[0].id,
                chapterName: subject.chapters[0].name,
                questionText: q.question_text,
                optionA: q.option_a,
                optionB: q.option_b,
                optionC: q.option_c,
                optionD: q.option_d,
                correctOption: q.correct_option,
                difficulty: q.difficulty,
                explanation: q.explanation,
                conceptTested: q.concept_tested,
              });
            }
          }
        }

        // Take exactly 25: first 20 = Section A (MCQ), last 5 = Section B (Integer)
        const trimmed = subjectQuestions.slice(0, 25);
        trimmed.forEach((q, idx) => {
          if (idx >= 20) {
            q.section = 'B';
            q.questionType = 'integer';
            // Generate a plausible numerical answer from the correct MCQ option index
            q.correctNumerical = parseNumericalFromQuestion(q);
            q.toleranceRange = 0.01;
          }
        });

        allQuestions.push(...trimmed);
      }

      // Renumber: Physics 1-25, Chemistry 26-50, Maths 51-75
      let num = 1;
      const finalQuestions = allQuestions.map(q => ({ ...q, questionNumber: num++ }));

      setQuestions(finalQuestions);
      return finalQuestions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ── Start test (with resume support) ──────────────────────────────────
  const startTest = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Please login to take the test');

      // Check for existing in-progress attempt → resume
      const existing = await checkExistingAttempt(user.id);
      if (existing) {
        // Resume the existing attempt
        setCurrentAttempt({
          id: existing.id,
          cycleId: existing.cycle_id,
          startedAt: existing.started_at,
          status: 'in_progress',
          tabSwitchCount: existing.tab_switch_count,
        });
        setTabSwitchCount(existing.tab_switch_count);

        // Calculate remaining time
        const elapsed = Math.floor((Date.now() - new Date(existing.started_at).getTime()) / 1000);
        const remaining = Math.max(0, 180 * 60 - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          // Time expired, auto-submit
          toast.info('Your test time has expired. Auto-submitting...');
          // Generate questions to show results
          await generateQuestions();
          return true;
        }

        // Regenerate questions for display
        await generateQuestions();

        // Load saved answers
        const { data: savedAnswers } = await supabase
          .from('major_test_answers')
          .select('*')
          .eq('attempt_id', existing.id);

        if (savedAnswers && savedAnswers.length > 0) {
          const restoredAnswers = new Map<string, MajorTestAnswer>();
          for (const sa of savedAnswers) {
            const q = questions.find(qq => qq.id === sa.question_id);
            restoredAnswers.set(sa.question_id, {
              questionId: sa.question_id,
              questionNumber: sa.question_number,
              subject: sa.subject,
              questionType: q?.questionType ?? 'mcq',
              selectedOption: sa.selected_option as 'A' | 'B' | 'C' | 'D' | null,
              numericalAnswer: null, // numerical answers stored in selected_option as string
              correctOption: sa.correct_option as 'A' | 'B' | 'C' | 'D',
              isMarkedReview: sa.is_marked_review ?? false,
              timeSpent: sa.time_spent_seconds,
            });
          }
          setAnswers(restoredAnswers);
        }

        toast.info('Resuming your in-progress test');
        return true;
      }

      // Fresh test start
      let cycle = await fetchActiveCycle();
      if (!cycle) {
        const { data: newCycle } = await supabase
          .from('major_test_cycles')
          .insert({
            cycle_number: 1,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            test_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            is_active: true,
          })
          .select()
          .single();
        cycle = newCycle;
      }

      const generatedQuestions = await generateQuestions();
      if (generatedQuestions.length === 0) {
        throw new Error('Failed to generate test questions');
      }

      const { data: attempt, error: attemptError } = await supabase
        .from('major_test_attempts')
        .insert({
          user_id: user.id,
          cycle_id: cycle?.id,
          status: 'in_progress',
          tab_switch_count: 0,
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      setCurrentAttempt({
        id: attempt.id,
        cycleId: attempt.cycle_id,
        startedAt: attempt.started_at,
        status: 'in_progress',
        tabSwitchCount: 0,
      });

      // Initialize answers map
      const initialAnswers = new Map<string, MajorTestAnswer>();
      for (const q of generatedQuestions) {
        initialAnswers.set(q.id, {
          questionId: q.id,
          questionNumber: q.questionNumber,
          subject: q.subject,
          questionType: q.questionType,
          selectedOption: null,
          numericalAnswer: null,
          correctOption: q.correctOption,
          correctNumerical: q.correctNumerical,
          toleranceRange: q.toleranceRange,
          isMarkedReview: false,
          timeSpent: 0,
        });

        await supabase.from('major_test_answers').insert({
          attempt_id: attempt.id,
          question_id: q.id,
          question_number: q.questionNumber,
          subject: q.subject,
          correct_option: q.questionType === 'integer'
            ? String(q.correctNumerical ?? 0)
            : q.correctOption,
          is_marked_review: false,
          time_spent_seconds: 0,
        });
      }
      setAnswers(initialAnswers);
      setTimeRemaining(180 * 60);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start test';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Update MCQ answer ─────────────────────────────────────────────────
  const updateAnswer = useCallback((questionId: string, option: 'A' | 'B' | 'C' | 'D' | null) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(questionId);
      if (existing) {
        newAnswers.set(questionId, { ...existing, selectedOption: option });
      }
      return newAnswers;
    });
  }, []);

  // ── Update numerical answer ───────────────────────────────────────────
  const updateNumericalAnswer = useCallback((questionId: string, value: number | null) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(questionId);
      if (existing) {
        newAnswers.set(questionId, { ...existing, numericalAnswer: value });
      }
      return newAnswers;
    });
  }, []);

  // ── Mark for review ───────────────────────────────────────────────────
  const toggleMarkReview = useCallback((questionId: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(questionId);
      if (existing) {
        newAnswers.set(questionId, { ...existing, isMarkedReview: !existing.isMarkedReview });
      }
      return newAnswers;
    });
  }, []);

  // ── Update time spent on question ─────────────────────────────────────
  const updateTimeSpent = useCallback((questionId: string, seconds: number) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(questionId);
      if (existing) {
        newAnswers.set(questionId, { ...existing, timeSpent: existing.timeSpent + seconds });
      }
      return newAnswers;
    });
  }, []);

  // ── Auto-save answers ─────────────────────────────────────────────────
  const autoSave = useCallback(async () => {
    if (!currentAttempt) return;

    try {
      const answersArray = Array.from(answers.values());
      for (const answer of answersArray) {
        const savedOption = answer.questionType === 'integer'
          ? (answer.numericalAnswer !== null ? String(answer.numericalAnswer) : null)
          : answer.selectedOption;
        const correct = answer.questionType === 'integer'
          ? isAnswerCorrect(answer)
          : answer.selectedOption === answer.correctOption;

        await supabase
          .from('major_test_answers')
          .update({
            selected_option: savedOption,
            is_marked_review: answer.isMarkedReview,
            time_spent_seconds: answer.timeSpent,
            is_correct: isAnswered(answer) ? correct : null,
            answered_at: isAnswered(answer) ? new Date().toISOString() : null,
          })
          .eq('attempt_id', currentAttempt.id)
          .eq('question_id', answer.questionId);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [currentAttempt, answers]);

  // ── Handle tab switch ─────────────────────────────────────────────────
  const handleTabSwitch = useCallback(async () => {
    const newCount = tabSwitchCount + 1;
    setTabSwitchCount(newCount);

    if (currentAttempt) {
      await supabase
        .from('major_test_attempts')
        .update({ tab_switch_count: newCount })
        .eq('id', currentAttempt.id);
    }

    if (newCount === 1) {
      toast.warning('Warning 1: Tab switch detected! Do not leave the test window.');
    } else if (newCount === 2) {
      toast.error('Warning 2: One more switch and your test will be auto-submitted!');
    } else if (newCount >= 3) {
      await submitTest('auto_submitted');
    }

    return newCount;
  }, [tabSwitchCount, currentAttempt]);

  // ── Submit test ───────────────────────────────────────────────────────
  const submitTest = async (status: 'completed' | 'auto_submitted' = 'completed') => {
    if (!currentAttempt) return null;

    setLoading(true);
    try {
      await autoSave();

      const answersArray = Array.from(answers.values());

      const calculateSubjectScore = (subjectAnswers: MajorTestAnswer[]) => {
        let correct = 0, incorrect = 0, unattempted = 0, score = 0;
        for (const a of subjectAnswers) {
          if (!isAnswered(a)) {
            unattempted++;
          } else if (isAnswerCorrect(a)) {
            correct++;
            score += 4;
          } else {
            incorrect++;
            // Negative marking only for MCQ
            score += a.questionType === 'mcq' ? -1 : 0;
          }
        }
        return { correct, incorrect, unattempted, score };
      };

      const physicsStats = calculateSubjectScore(answersArray.filter(a => a.subject === 'physics'));
      const chemistryStats = calculateSubjectScore(answersArray.filter(a => a.subject === 'chemistry'));
      const mathsStats = calculateSubjectScore(answersArray.filter(a => a.subject === 'maths'));

      const totalScore = physicsStats.score + chemistryStats.score + mathsStats.score;
      const maxScore = 300;

      const percentile = Math.min(99.9, Math.max(0, (totalScore / maxScore) * 100 + Math.random() * 10));

      const { error: updateError } = await supabase
        .from('major_test_attempts')
        .update({
          completed_at: new Date().toISOString(),
          status,
          total_time_seconds: (180 * 60) - timeRemaining,
          score: totalScore,
          max_score: maxScore,
          physics_score: physicsStats.score,
          physics_correct: physicsStats.correct,
          physics_incorrect: physicsStats.incorrect,
          physics_unattempted: physicsStats.unattempted,
          chemistry_score: chemistryStats.score,
          chemistry_correct: chemistryStats.correct,
          chemistry_incorrect: chemistryStats.incorrect,
          chemistry_unattempted: chemistryStats.unattempted,
          maths_score: mathsStats.score,
          maths_correct: mathsStats.correct,
          maths_incorrect: mathsStats.incorrect,
          maths_unattempted: mathsStats.unattempted,
          percentile_estimate: percentile,
        })
        .eq('id', currentAttempt.id);

      if (updateError) throw updateError;

      // Chapter analysis
      const chapterMap = new Map<string, ChapterAnalysis>();

      for (const q of questions) {
        const answer = answers.get(q.id);
        if (!answer) continue;

        let analysis = chapterMap.get(q.chapterId);
        if (!analysis) {
          analysis = {
            chapterId: q.chapterId,
            chapterName: q.chapterName,
            subject: q.subject,
            totalQuestions: 0,
            correct: 0,
            incorrect: 0,
            unattempted: 0,
            accuracy: 0,
            avgTime: 0,
            strengthLevel: 'moderate',
          };
          chapterMap.set(q.chapterId, analysis);
        }

        analysis.totalQuestions++;
        if (!isAnswered(answer)) {
          analysis.unattempted++;
        } else if (isAnswerCorrect(answer)) {
          analysis.correct++;
        } else {
          analysis.incorrect++;
        }
        analysis.avgTime += answer.timeSpent;
      }

      for (const [_, analysis] of chapterMap) {
        analysis.accuracy = analysis.totalQuestions > 0
          ? (analysis.correct / analysis.totalQuestions) * 100
          : 0;
        analysis.avgTime = analysis.totalQuestions > 0
          ? Math.round(analysis.avgTime / analysis.totalQuestions)
          : 0;
        analysis.strengthLevel = analysis.accuracy >= 70 ? 'strong'
          : analysis.accuracy >= 40 ? 'moderate'
          : 'weak';

        await supabase.from('major_test_chapter_analysis').insert({
          attempt_id: currentAttempt.id,
          chapter_id: analysis.chapterId,
          chapter_name: analysis.chapterName,
          subject: analysis.subject,
          total_questions: analysis.totalQuestions,
          correct: analysis.correct,
          incorrect: analysis.incorrect,
          unattempted: analysis.unattempted,
          accuracy: analysis.accuracy,
          avg_time_seconds: analysis.avgTime,
          strength_level: analysis.strengthLevel,
        });
      }

      return {
        totalScore,
        maxScore,
        percentile,
        physics: physicsStats,
        chemistry: chemistryStats,
        maths: mathsStats,
        chapterAnalysis: Array.from(chapterMap.values()),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit test';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ── Previous attempts ─────────────────────────────────────────────────
  const getPreviousAttempts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return [];

    const { data } = await supabase
      .from('major_test_attempts')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['completed', 'auto_submitted'])
      .order('completed_at', { ascending: false })
      .limit(5);

    return data || [];
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  // ── Start auto-save and timer when test is active ─────────────────────
  useEffect(() => {
    if (currentAttempt && currentAttempt.status === 'in_progress') {
      autoSaveInterval.current = setInterval(autoSave, 10000);

      timerInterval.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitTest('auto_submitted');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [currentAttempt, autoSave]);

  return {
    questions,
    answers,
    currentAttempt,
    activeCycle,
    loading,
    error,
    timeRemaining,
    tabSwitchCount,
    startTest,
    updateAnswer,
    updateNumericalAnswer,
    toggleMarkReview,
    updateTimeSpent,
    handleTabSwitch,
    submitTest,
    getPreviousAttempts,
    fetchActiveCycle,
  };
};

// ─── Helper: extract a numerical value from a question ──────────────────

function parseNumericalFromQuestion(q: MajorTestQuestion): number {
  // Try to extract a number from the correct option text
  const optionKey = `option${q.correctOption}` as keyof MajorTestQuestion;
  const optionText = String(q[optionKey] ?? '');
  const match = optionText.match(/-?\d+(\.\d+)?/);
  if (match) return parseFloat(match[0]);
  // Fallback: random integer 1-100
  return Math.floor(Math.random() * 100) + 1;
}
