import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';

export interface MajorTestQuestion {
  id: string;
  questionNumber: number;
  subject: 'physics' | 'chemistry' | 'maths';
  chapterId: string;
  chapterName: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  conceptTested: string;
}

export interface MajorTestAnswer {
  questionId: string;
  questionNumber: number;
  subject: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  correctOption: 'A' | 'B' | 'C' | 'D';
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

export const useMajorTest = () => {
  const [questions, setQuestions] = useState<MajorTestQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<string, MajorTestAnswer>>(new Map());
  const [currentAttempt, setCurrentAttempt] = useState<MajorTestAttempt | null>(null);
  const [activeCycle, setActiveCycle] = useState<MajorTestCycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(180 * 60); // 3 hours in seconds
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch active cycle
  const fetchActiveCycle = async () => {
    const { data, error } = await supabase
      .from('major_test_cycles')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (data) {
      setActiveCycle({
        id: data.id,
        cycleNumber: data.cycle_number,
        startDate: data.start_date,
        endDate: data.end_date,
        testDate: data.test_date,
        isActive: data.is_active
      });
    }
    return data;
  };

  // Check for existing in-progress attempt
  const checkExistingAttempt = async (userId: string) => {
    const { data } = await supabase
      .from('major_test_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .single();
    
    return data;
  };

  // Generate 90 questions (30 per subject)
  const generateQuestions = async (): Promise<MajorTestQuestion[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const allQuestions: MajorTestQuestion[] = [];
      let questionNumber = 1;
      
      // Get random chapters from each subject
      const getRandomChapters = (chapters: typeof physicsChapters, count: number) => {
        const shuffled = [...chapters].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      };
      
      const physicsSelected = getRandomChapters(physicsChapters, 6);
      const chemistrySelected = getRandomChapters(chemistryChapters, 6);
      const mathsSelected = getRandomChapters(mathsChapters, 6);
      
      // Generate questions for each subject
      const subjects = [
        { name: 'physics', chapters: physicsSelected },
        { name: 'chemistry', chapters: chemistrySelected },
        { name: 'maths', chapters: mathsSelected }
      ];
      
      for (const subject of subjects) {
        // First try to fetch existing questions from database
        for (const chapter of subject.chapters) {
          const { data: existingQuestions } = await supabase
            .from('questions')
            .select('*')
            .eq('chapter_id', chapter.id)
            .limit(5);
          
          if (existingQuestions && existingQuestions.length > 0) {
            const shuffled = existingQuestions.sort(() => Math.random() - 0.5);
            for (const q of shuffled.slice(0, 5)) {
              allQuestions.push({
                id: q.id,
                questionNumber: questionNumber++,
                subject: subject.name as 'physics' | 'chemistry' | 'maths',
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
                conceptTested: q.concept_tested
              });
            }
          }
        }
        
        // If we don't have enough questions, generate more
        const questionsNeeded = 30 - allQuestions.filter(q => q.subject === subject.name).length;
        if (questionsNeeded > 0) {
          // Call edge function to generate questions
          const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
            body: {
              chapterId: subject.chapters[0].id,
              chapterName: subject.chapters[0].name,
              subject: subject.name,
              difficulty: 'medium',
              count: questionsNeeded
            }
          });
          
          if (data?.questions) {
            for (const q of data.questions) {
              allQuestions.push({
                id: q.id || crypto.randomUUID(),
                questionNumber: questionNumber++,
                subject: subject.name as 'physics' | 'chemistry' | 'maths',
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
                conceptTested: q.concept_tested
              });
            }
          }
        }
      }
      
      // Ensure we have exactly 90 questions (30 per subject)
      const physicsQuestions = allQuestions.filter(q => q.subject === 'physics').slice(0, 30);
      const chemistryQuestions = allQuestions.filter(q => q.subject === 'chemistry').slice(0, 30);
      const mathsQuestions = allQuestions.filter(q => q.subject === 'maths').slice(0, 30);
      
      // Renumber questions
      let num = 1;
      const finalQuestions = [...physicsQuestions, ...chemistryQuestions, ...mathsQuestions].map(q => ({
        ...q,
        questionNumber: num++
      }));
      
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

  // Start a new test attempt
  const startTest = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to take the test');
      
      // Check for existing attempt
      const existing = await checkExistingAttempt(user.id);
      if (existing) {
        throw new Error('You already have a test in progress');
      }
      
      // Get or create active cycle
      let cycle = await fetchActiveCycle();
      if (!cycle) {
        // Create a new cycle
        const { data: newCycle } = await supabase
          .from('major_test_cycles')
          .insert({
            cycle_number: 1,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            test_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            is_active: true
          })
          .select()
          .single();
        cycle = newCycle;
      }
      
      // Generate questions
      const generatedQuestions = await generateQuestions();
      if (generatedQuestions.length === 0) {
        throw new Error('Failed to generate test questions');
      }
      
      // Create attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('major_test_attempts')
        .insert({
          user_id: user.id,
          cycle_id: cycle?.id,
          status: 'in_progress',
          tab_switch_count: 0
        })
        .select()
        .single();
      
      if (attemptError) throw attemptError;
      
      setCurrentAttempt({
        id: attempt.id,
        cycleId: attempt.cycle_id,
        startedAt: attempt.started_at,
        status: 'in_progress',
        tabSwitchCount: 0
      });
      
      // Initialize answers map
      const initialAnswers = new Map<string, MajorTestAnswer>();
      for (const q of generatedQuestions) {
        initialAnswers.set(q.id, {
          questionId: q.id,
          questionNumber: q.questionNumber,
          subject: q.subject,
          selectedOption: null,
          correctOption: q.correctOption,
          isMarkedReview: false,
          timeSpent: 0
        });
        
        // Insert answer record
        await supabase.from('major_test_answers').insert({
          attempt_id: attempt.id,
          question_id: q.id,
          question_number: q.questionNumber,
          subject: q.subject,
          correct_option: q.correctOption,
          is_marked_review: false,
          time_spent_seconds: 0
        });
      }
      setAnswers(initialAnswers);
      
      // Start timer
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

  // Update answer
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

  // Mark for review
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

  // Update time spent on question
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

  // Auto-save answers
  const autoSave = useCallback(async () => {
    if (!currentAttempt) return;
    
    try {
      const answersArray = Array.from(answers.values());
      for (const answer of answersArray) {
        await supabase
          .from('major_test_answers')
          .update({
            selected_option: answer.selectedOption,
            is_marked_review: answer.isMarkedReview,
            time_spent_seconds: answer.timeSpent,
            is_correct: answer.selectedOption === answer.correctOption,
            answered_at: answer.selectedOption ? new Date().toISOString() : null
          })
          .eq('attempt_id', currentAttempt.id)
          .eq('question_id', answer.questionId);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [currentAttempt, answers]);

  // Handle tab switch
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

  // Submit test
  const submitTest = async (status: 'completed' | 'auto_submitted' = 'completed') => {
    if (!currentAttempt) return null;
    
    setLoading(true);
    try {
      await autoSave();
      
      // Calculate scores
      const answersArray = Array.from(answers.values());
      
      const physicsAnswers = answersArray.filter(a => a.subject === 'physics');
      const chemistryAnswers = answersArray.filter(a => a.subject === 'chemistry');
      const mathsAnswers = answersArray.filter(a => a.subject === 'maths');
      
      const calculateSubjectScore = (subjectAnswers: MajorTestAnswer[]) => {
        let correct = 0, incorrect = 0, unattempted = 0;
        for (const a of subjectAnswers) {
          if (a.selectedOption === null) {
            unattempted++;
          } else if (a.selectedOption === a.correctOption) {
            correct++;
          } else {
            incorrect++;
          }
        }
        // JEE Main scoring: +4 for correct, -1 for incorrect, 0 for unattempted
        const score = (correct * 4) - (incorrect * 1);
        return { correct, incorrect, unattempted, score };
      };
      
      const physicsStats = calculateSubjectScore(physicsAnswers);
      const chemistryStats = calculateSubjectScore(chemistryAnswers);
      const mathsStats = calculateSubjectScore(mathsAnswers);
      
      const totalScore = physicsStats.score + chemistryStats.score + mathsStats.score;
      const maxScore = 300; // 75 questions × 4 marks
      
      // Estimate percentile (rough approximation)
      const percentile = Math.min(99.9, Math.max(0, (totalScore / maxScore) * 100 + Math.random() * 10));
      
      // Update attempt
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
          percentile_estimate: percentile
        })
        .eq('id', currentAttempt.id);
      
      if (updateError) throw updateError;
      
      // Calculate chapter-wise analysis
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
            strengthLevel: 'moderate'
          };
          chapterMap.set(q.chapterId, analysis);
        }
        
        analysis.totalQuestions++;
        if (answer.selectedOption === null) {
          analysis.unattempted++;
        } else if (answer.selectedOption === answer.correctOption) {
          analysis.correct++;
        } else {
          analysis.incorrect++;
        }
        analysis.avgTime += answer.timeSpent;
      }
      
      // Finalize and save chapter analysis
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
          strength_level: analysis.strengthLevel
        });
      }
      
      return {
        totalScore,
        maxScore,
        percentile,
        physics: physicsStats,
        chemistry: chemistryStats,
        maths: mathsStats,
        chapterAnalysis: Array.from(chapterMap.values())
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

  // Get previous attempts for comparison
  const getPreviousAttempts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  // Start auto-save and timer when test is active
  useEffect(() => {
    if (currentAttempt && currentAttempt.status === 'in_progress') {
      // Auto-save every 10 seconds
      autoSaveInterval.current = setInterval(autoSave, 10000);
      
      // Timer
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
    toggleMarkReview,
    updateTimeSpent,
    handleTabSwitch,
    submitTest,
    getPreviousAttempts,
    fetchActiveCycle
  };
};
