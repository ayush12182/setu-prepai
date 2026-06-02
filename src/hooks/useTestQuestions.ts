import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question } from './usePracticeQuestions';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { generateQuestionsGemini } from '@/lib/gemini';

function generateOfflineMockQuestions(
  topicName: string,
  exam: string,
  difficulty: string,
  count: number
): Question[] {
  const templates = [
    {
      q: "Which of the following represents the primary fundamental principle observed in {topic} under standard {exam} conditions?",
      a: "Direct proportional relationship between key state variables",
      b: "Inversely quadratic dependency at extreme values",
      c: "Completely independent behaviour regardless of system scale",
      d: "Exponential decay with respect to spatial coordinates"
    },
    {
      q: "Consider a practical application of {topic} where the input scaling factor is doubled. How does this affect the output response?",
      a: "The response scales linearly with the factor",
      b: "The response remains invariant due to conservation laws",
      c: "The response quadruples according to the power law",
      d: "The response decreases asymptotically to zero"
    },
    {
      q: "What is the key limitation or common experimental constraint when analyzing {topic}?",
      a: "High sensitivity to external ambient perturbations",
      b: "Lack of proper deterministic mathematical models",
      c: "Difficulty in initialising the precise initial states",
      d: "Excessive calculation overhead in standard simulations"
    },
    {
      q: "Which of the following statements is mathematically or conceptually correct regarding {topic}?",
      a: "The net state variation is path-independent in closed systems",
      b: "It is strictly a non-conservative, open-loop process",
      c: "Dynamic equilibrium can never be achieved in practical runs",
      d: "The standard coefficient is always negative at room temperature"
    },
    {
      q: "During a standard high-difficulty evaluation of {topic}, why do most students incorrectly predict a zero-state outcome?",
      a: "Neglecting the higher-order boundary effects",
      b: "Confusing sign conventions in vector summation",
      c: "Incorrect conversion of units under SI standards",
      d: "Assuming linear behavior instead of log-normal response"
    }
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length];
    const qText = template.q.replace(/{topic}/g, topicName).replace(/{exam}/g, exam);
    return {
      id: `offline-${Date.now()}-${i}`,
      node_id: topicName,
      type: 'MCQ',
      exam_type: exam,
      difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      question_text: qText,
      options: {
        A: template.a,
        B: template.b,
        C: template.c,
        D: template.d
      },
      answer: 'A',
      explanation: `Concept analysis of ${topicName}: Option A is correct because the standard core definition in ${exam} curriculum dictates a direct, linear dependency under normalized constraints. Other options represent common misconception traps related to boundary conditions.`,
      concept_tested: topicName,
      option_a: template.a,
      option_b: template.b,
      option_c: template.c,
      option_d: template.d,
      correct_option: 'A'
    };
  });
}

export interface ChapterSelection {
  chapterId: string;
  chapterName: string;
  subject: string;
  subchapterId?: string;
  subchapterName?: string;
}

export const useTestQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { examMode, isCuet, isNeet } = useExamMode();
  const examModeUpper = examMode.toUpperCase() as 'JEE' | 'NEET' | 'CUET';

  // Fetch questions for mixed test (multiple chapters)
  const fetchMixedTestQuestions = async (
    chapters: ChapterSelection[],
    questionsPerChapter: number = 5
  ) => {
    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const allQuestions: Question[] = [];

      // Fetch questions from each chapter
      for (const chapter of chapters) {
        // First try to get existing questions from database
        let query = supabase
          .from('questions')
          .select('*')
          .eq('chapter_id', chapter.chapterId);

        if (chapter.subchapterId) {
          query = query.eq('subchapter_id', chapter.subchapterId);
        }

        const { data: existingQuestions, error: fetchError } = await query.limit(questionsPerChapter);

        if (fetchError) {
          console.error('Error fetching questions for chapter:', chapter.chapterId, fetchError);
          continue;
        }

        if (existingQuestions && existingQuestions.length > 0) {
          // Shuffle and take required number
          let shuffled = existingQuestions.sort(() => Math.random() - 0.5);
          shuffled = (shuffled.slice(0, questionsPerChapter) as Question[]).map(shuffleQuestionOptions);
          allQuestions.push(...shuffled);
        } else {
          // Generate questions if none exist
          let generatedData = null;
          let generatedError = null;
          try {
            const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
              body: {
                subchapterId: chapter.subchapterId || chapter.chapterId,
                subchapterName: chapter.subchapterName || chapter.chapterName,
                chapterId: chapter.chapterId,
                chapterName: chapter.chapterName,
                subject: chapter.subject,
                difficulty: 'medium',
                count: questionsPerChapter,
                examMode: examModeUpper,
              }
            });
            generatedData = data;
            generatedError = fnError;
          } catch (invokeErr) {
            console.warn('Failed to invoke generate-questions edge function:', invokeErr);
            generatedError = invokeErr;
          }

          if (!generatedError && generatedData?.questions) {
            const mappedQuestions = generatedData.questions.map(shuffleQuestionOptions);
            allQuestions.push(...mappedQuestions);
          } else {
            // Frontend Gemini fallback
            try {
              const geminiQs = await generateQuestionsGemini(
                chapter.chapterName, examModeUpper, 'medium', questionsPerChapter
              );
              allQuestions.push(...(geminiQs as any[]));
            } catch (geminiErr) {
              console.warn('Test questions AI generation offline, launching simulator:', geminiErr);
              const mockQs = generateOfflineMockQuestions(chapter.chapterName, examModeUpper, 'medium', questionsPerChapter);
              allQuestions.push(...mockQs);
            }
          }
        }
      }

      // Shuffle all questions
      const shuffledAll = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledAll);
      return shuffledAll;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load questions';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch PYQ (Previous Year Questions) - questions with pyq_year set
  const fetchPYQQuestions = async (
    subject?: string,
    chapterId?: string,
    yearRange?: { start: number; end: number },
    count: number = 25
  ) => {
    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      let query = supabase
        .from('questions')
        .select('*')
        .not('pyq_year', 'is', null);

      // Filter by subject if specified
      if (subject) {
        query = query.eq('subject', subject.toLowerCase());
      }

      // Filter by chapter if specified
      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      }

      // Filter by year range if specified
      if (yearRange) {
        query = query.gte('pyq_year', yearRange.start).lte('pyq_year', yearRange.end);
      }

      const { data: pyqQuestions, error: fetchError } = await query.limit(count);

      if (fetchError) {
        throw fetchError;
      }

      if (pyqQuestions && pyqQuestions.length > 0) {
        // Shuffle the questions order, then shuffle options per question
        let shuffled = pyqQuestions.sort(() => Math.random() - 0.5) as Question[];
        shuffled = shuffled.map(shuffleQuestionOptions);
        setQuestions(shuffled);
        return shuffled;
      }

      // If no PYQs found, generate PYQ-style questions using the correct exam mode
      const defaultYearRange = isCuet
        ? { start: 2022, end: 2024 }
        : isNeet
        ? { start: 2013, end: 2024 }
        : { start: 2004, end: 2024 };

      let generatedData = null;
      let generatedError = null;
      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-pyq-questions', {
          body: {
            subject,
            chapterId,
            yearRange: yearRange || defaultYearRange,
            count,
            examMode: examModeUpper,
          }
        });
        generatedData = data;
        generatedError = fnError;
      } catch (invokeErr) {
        console.warn('Failed to invoke generate-pyq-questions edge function:', invokeErr);
        generatedError = invokeErr;
      }

      if (generatedError || generatedData?.error) {
        // Frontend Gemini fallback for PYQ-style questions
        try {
          const geminiQs = await generateQuestionsGemini(
            subject || examModeUpper, examModeUpper, 'medium', count
          );
          setQuestions(geminiQs as any[]);
          return geminiQs as any[];
        } catch (geminiErr) {
          console.warn('PYQ AI generation offline, launching simulator:', geminiErr);
          toast.info('API keys offline. Launching high-fidelity local simulator.');
          const mockQs = generateOfflineMockQuestions(subject || examModeUpper, examModeUpper, 'medium', count);
          setQuestions(mockQs);
          return mockQs;
        }
      }

      if (data?.questions) {
        const mappedQuestions = data.questions.map(shuffleQuestionOptions);
        setQuestions(mappedQuestions);
        return mappedQuestions;
      }

      toast.info(`No PYQs found. Generating ${examMode}-style questions...`);
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load PYQ questions';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch adaptive questions based on user's weak areas
  const fetchAdaptiveQuestions = async (count: number = 15) => {
    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      let generatedData = null;
      let generatedError = null;
      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-adaptive-test', {
          body: { count }
        });
        generatedData = data;
        generatedError = fnError;
      } catch (invokeErr) {
        console.warn('Failed to invoke generate-adaptive-test edge function:', invokeErr);
        generatedError = invokeErr;
      }

      if (generatedError || generatedData?.error || !generatedData?.questions?.length) {
        // Frontend Gemini fallback for adaptive test
        try {
          const geminiQs = await generateQuestionsGemini(
            examModeUpper, examModeUpper, 'mixed', count
          );
          setQuestions(geminiQs as any[]);
          return geminiQs as any[];
        } catch (geminiErr) {
          console.warn('Adaptive AI generation offline, launching simulator:', geminiErr);
          toast.info('API keys offline. Launching high-fidelity local simulator.');
          const mockQs = generateOfflineMockQuestions('Adaptive Practice', examModeUpper, 'medium', count);
          setQuestions(mockQs);
          return mockQs;
        }
      }

      const mappedQuestions = (data.questions as Question[]).map(shuffleQuestionOptions);
      setQuestions(mappedQuestions);
      return mappedQuestions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate adaptive test';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const recordAttempt = async (
    questionId: string,
    selectedOption: 'A' | 'B' | 'C' | 'D',
    isCorrect: boolean,
    timeTakenSeconds: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('question_attempts').insert({
        user_id: user.id,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_taken_seconds: timeTakenSeconds
      });
    } catch (err) {
      console.error('Failed to record attempt:', err);
    }
  };

  return {
    questions,
    loading,
    error,
    fetchMixedTestQuestions,
    fetchPYQQuestions,
    fetchAdaptiveQuestions,
    recordAttempt,
    setQuestions
  };
};
