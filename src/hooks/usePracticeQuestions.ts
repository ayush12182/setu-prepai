import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { logStudentActivity } from '@/lib/studentActivity';

// The interface expected by QuizInterface components
export interface Question {
  id: string;
  subchapter_id: string; // mapped to subtopic
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
  is_verified?: boolean;
  generation_model?: string;
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

const mapQuestionBankToInterface = (qbItem: any): Question => {
  return {
    id: qbItem.question_id,
    subchapter_id: qbItem.subtopic || qbItem.ncert_chapter || 'adaptive',
    chapter_id: qbItem.ncert_chapter || 'adaptive',
    subject: qbItem.subject,
    difficulty: qbItem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
    question_text: qbItem.question_text,
    option_a: qbItem.options?.A || qbItem.options?.a || '',
    option_b: qbItem.options?.B || qbItem.options?.b || '',
    option_c: qbItem.options?.C || qbItem.options?.c || '',
    option_d: qbItem.options?.D || qbItem.options?.d || '',
    correct_option: qbItem.correct_option as 'A' | 'B' | 'C' | 'D',
    explanation: qbItem.explanation?.short || qbItem.explanation || '',
    concept_tested: qbItem.micro_concept || qbItem.topic || 'General',
    common_mistake: qbItem.distractor_logic ? JSON.stringify(qbItem.distractor_logic) : null,
    is_verified: qbItem.is_verified,
    generation_model: qbItem.generation_model,
  };
};

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
    count: number = 5,
    exam: string = 'CUET'
  ) => {
    setLoading(true);
    setError(null);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const CapDifficulty = capitalize(difficulty);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Try to fetch strictly using the RPC priority hybrid loader
      const { data: rpcQuestions, error: rpcErr } = await supabase.rpc('serve_practice_questions', {
        p_student_id: user.id,
        p_exam: exam,
        p_subject: subject,
        p_chapter: chapterName,
        p_subtopic: subchapterName,
        p_count: count,
        p_difficulty: CapDifficulty,
      });

      if (rpcErr) {
        console.error("RPC Error:", rpcErr);
        throw new Error("Failed to fetch questions from bank.");
      }

      let qbData = rpcQuestions || [];

      // 2. If ZERO available, wait max 4s while triggering background gen
      if (qbData.length === 0) {
        toast.info("No questions found, triggering AI generator...");
        
        // Trigger Edge Function Sync to wait max N seconds
        const genPromise = supabase.functions.invoke('generate-cuet-questions', {
          body: {
            exam,
            subject,
            chapter: chapterName,
            subtopic: subchapterName,
            difficulty_mix: difficulty === 'easy' ? { Easy: 100, Medium: 0, Hard: 0 } 
                         : difficulty === 'hard' ? { Easy: 0, Medium: 0, Hard: 100 }
                         : { Easy: 0, Medium: 100, Hard: 0 },
            count: count,
            exam_stage: 'practice',
            save_to_db: true,
          }
        });

        // Promise that resolves early if AI is fast, or throws Timeout after 4s
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timeout'), 4000));
        
        try {
          const { data: genData } = await Promise.race([genPromise, timeoutPromise]) as any;
          if (genData?.success && genData.questions?.length > 0) {
            // Re-fetch from RPC to get the saved ones to maintain same format
            const { data: refetched } = await supabase.rpc('serve_practice_questions', {
              p_student_id: user.id, p_exam: exam, p_subject: subject, p_chapter: chapterName, p_subtopic: subchapterName, p_count: count, p_difficulty: CapDifficulty
            });
            qbData = refetched || [];
          }
        } catch (e) {
          // Timeout reached, the Edge function is still running in background.
          // Don't error out, just return empty array if still 0.
        }
      } else if (qbData.length < count) {
        // We have some questions, but not enough! Fire off generator IN BACKGROUND (non-blocking)
        toast.info(`Found ${qbData.length} available questions. Generating more in the background!`);
        supabase.functions.invoke('generate-cuet-questions', {
          body: {
            exam, subject, chapter: chapterName, subtopic: subchapterName,
            difficulty_mix: difficulty === 'easy' ? { Easy: 100, Medium: 0, Hard: 0 } 
                         : difficulty === 'hard' ? { Easy: 0, Medium: 0, Hard: 100 }
                         : { Easy: 0, Medium: 100, Hard: 0 },
            count: count - qbData.length,
            exam_stage: 'practice',
            save_to_db: true,
          }
        }).catch(err => console.error("Background AI failed:", err));
      }

      if (qbData.length === 0) {
        setError('No questions currently available. AI is generating them, please refresh in 10 seconds.');
        setLoading(false);
        return [];
      }

      // Map and Shuffle
      const qs = qbData.map((q: any) => {
        const mapped = mapQuestionBankToInterface(q);
        return shuffleQuestionOptions(mapped as any) as unknown as Question;
      });

      setQuestions(qs);
      return qs;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load questions';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitPracticeReport = async (
    exam: string,
    subject: string,
    chapter: string,
    subtopic: string | undefined,
    totalQuestions: number,
    correctCount: number,
    timeSpentSeconds: number,
    answers: Array<{ topic: string; subtopic: string; isCorrect: boolean }>,
    taskId?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase.functions.invoke('submit-practice-report', {
        body: {
          exam, subject, chapter, subtopic,
          total_questions: totalQuestions,
          correct_count: correctCount,
          time_spent_seconds: timeSpentSeconds,
          answers,
          task_id: taskId
        }
      });
      if (error) console.error("Submit Practice Report edge function error:", error);
    } catch (e) {
      console.error("Submit practice report failed:", e);
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

      return (data.questions as SimilarQuestion[]).map(q => shuffleQuestionOptions(q as any) as unknown as SimilarQuestion);
    } catch (err) {
      toast.error('Failed to get similar questions');
      return null;
    }
  };

  const recordAttempt = async (
    questionId: string,
    selectedOption: 'A' | 'B' | 'C' | 'D',
    isCorrect: boolean,
    timeTakenSeconds: number,
    confidenceLevel: 'low' | 'medium' | 'high',
    context?: {
      subject?: string;
      topic?: string;
      subtopic?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      exam_stage?: 'practice' | 'mock_test' | 'chapter_test' | 'previous_year';
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Existing: log to user_mcq_attempts (b2c stats component)
      await supabase.from('user_mcq_attempts' as any).insert({
        user_id: user.id,
        question_id: questionId,
        is_correct: isCorrect,
        time_taken_ms: timeTakenSeconds * 1000,
        confidence_level: confidenceLevel,
        user_selected_mistake: 'none',
        ai_predicted_mistake: 'none'
      });

      // Bridge to teacher analytics and adaptive system
      if (context?.subject && context?.topic) {
        logStudentActivity({
          question_id:        questionId,
          subject:            context.subject,
          topic:              context.topic,
          subtopic:           context.subtopic,
          difficulty:         context.difficulty === 'easy' ? 'Easy' : context.difficulty === 'hard' ? 'Hard' : 'Medium',
          exam_stage:         context.exam_stage ?? 'practice',
          is_correct:         isCorrect,
          time_spent_seconds: timeTakenSeconds,
          question_type:      'MCQ',
        });
      }
    } catch (err) {
      console.error('Failed to record attempt:', err);
    }
  };

  return {
    questions,
    loading,
    error,
    generateQuestions,
    submitPracticeReport,
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
