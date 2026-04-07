import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question } from './usePracticeQuestions';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { useExamMode } from '@/contexts/ExamModeContext';

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

          if (!fnError && data?.questions) {
            const mappedQuestions = data.questions.map(shuffleQuestionOptions);
            allQuestions.push(...mappedQuestions);
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

      const { data, error: fnError } = await supabase.functions.invoke('generate-pyq-questions', {
        body: {
          subject,
          chapterId,
          yearRange: yearRange || defaultYearRange,
          count,
          examMode: examModeUpper,
        }
      });

      if (fnError) throw fnError;

      if (data?.error) {
        setError(data.error);
        toast.error(data.error);
        return null;
      }

      if (data?.questions) {
        const mappedQuestions = data.questions.map(shuffleQuestionOptions);
        setQuestions(mappedQuestions);
        return mappedQuestions;
      }

      // Fallback: inform user no PYQs available
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
      const { data, error: fnError } = await supabase.functions.invoke('generate-adaptive-test', {
        body: { count }
      });

      if (fnError) throw fnError;

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Too many requests. Please wait a moment.');
        } else if (data.error.includes('credits')) {
          toast.error('AI credits exhausted. Please try again later.');
        } else {
          toast.error(data.error);
        }
        setError(data.error);
        return null;
      }

      if (data?.questions && data.questions.length > 0) {
        const mappedQuestions = (data.questions as Question[]).map(shuffleQuestionOptions);
        setQuestions(mappedQuestions);
        return mappedQuestions;
      }

      toast.error('No questions generated');
      return null;
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
