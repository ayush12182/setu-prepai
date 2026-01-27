import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Question {
  id: string;
  subchapter_id: string;
  chapter_id: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  concept_tested: string;
  common_mistake: string | null;
}

export interface SimilarQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  difficulty_note: string;
}

export const usePracticeQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async (
    subchapterId: string,
    subchapterName: string,
    chapterId: string,
    chapterName: string,
    subject: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 5
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: {
          subchapterId,
          subchapterName,
          chapterId,
          chapterName,
          subject,
          difficulty,
          count
        }
      });

      if (fnError) throw fnError;
      
      if (data.error) {
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

      setQuestions(data.questions);
      return data.questions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load questions';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSimilarQuestions = async (
    conceptTested: string,
    subchapterName: string,
    subject: string,
    originalQuestion: string
  ): Promise<SimilarQuestion[] | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-similar-questions', {
        body: {
          conceptTested,
          subchapterName,
          subject,
          originalQuestion,
          count: 3
        }
      });

      if (fnError) throw fnError;
      if (data.error) {
        toast.error(data.error);
        return null;
      }

      return data.questions;
    } catch (err) {
      toast.error('Failed to get similar questions');
      return null;
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
    generateQuestions,
    getSimilarQuestions,
    recordAttempt
  };
};

export const usePracticeStats = () => {
  const [stats, setStats] = useState({
    totalQuestionsSolved: 0,
    accuracy: 0,
    avgTimeSeconds: 0,
    chaptersPracticed: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_practice_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const accuracy = data.total_questions_solved > 0 
          ? Math.round((data.total_correct / data.total_questions_solved) * 100)
          : 0;
        const avgTime = data.total_questions_solved > 0
          ? Math.round(data.total_time_seconds / data.total_questions_solved)
          : 0;

        setStats({
          totalQuestionsSolved: data.total_questions_solved,
          accuracy,
          avgTimeSeconds: avgTime,
          chaptersPracticed: data.chapters_practiced?.length || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, fetchStats };
};
