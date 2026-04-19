import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { logStudentActivity } from '@/lib/studentActivity';

// The interface expected by QuizInterface components
export type QuestionType = 'MCQ' | 'AR' | 'NUMERICAL';

export interface Question {
  id: string;
  node_id: string;
  type: QuestionType;
  exam_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string | number | { min: number; max: number };
  explanation: string;
  concept_tested: string;
  common_mistake?: string;
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
  // Adaptation for the new 'questions' table
  return {
    id: qbItem.id,
    node_id: qbItem.topic_id || 'adaptive',
    type: (qbItem.question_type || 'MCQ') as QuestionType,
    exam_type: qbItem.exam_type || 'JEE',
    difficulty: (qbItem.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard',
    question_text: qbItem.content?.question || qbItem.question_text,
    options: qbItem.content?.options || {
      A: qbItem.option_a || '',
      B: qbItem.option_b || '',
      C: qbItem.option_c || '',
      D: qbItem.option_d || ''
    },
    answer: qbItem.answer || qbItem.correct_option,
    explanation: qbItem.metadata?.explanation || qbItem.explanation || '',
    concept_tested: qbItem.metadata?.concept || qbItem.concept_tested || 'General',
    common_mistake: qbItem.metadata?.common_mistake,
    is_verified: qbItem.is_verified,
    generation_model: qbItem.metadata?.model,
  };
};

export type GenerationStatus = 'idle' | 'fetching' | 'generating' | 'polling' | 'completed' | 'failed';

export const usePracticeQuestions = () => {
  const [questions, setQuestions]           = useState<Question[]>([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');

  const generateQuestions = async (
    subchapterId: string,
    subchapterName: string,
    chapterId: string,
    chapterName: string,
    subject: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 5,
    exam: string = 'JEE_MAINS'
  ) => {
    setLoading(true);
    setError(null);
    setGenerationStatus('fetching');
    setQuestions([]);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const CapDifficulty = capitalize(difficulty);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const rpcParams = {
        p_student_id: user.id,
        p_exam:       exam,
        p_subject:    subject,
        p_chapter:    chapterName,
        p_subtopic:   subchapterName,
        p_count:      count,
        p_difficulty: CapDifficulty,
      };

      console.log(`[PracticeGen] Starting generation flow for ${subject} - ${chapterName} (${CapDifficulty})`);

      // ── 1. TRY CACHE FIRST ────────────────────────────────────────────────
      const { data: rpcQuestions } = await supabase.rpc('serve_practice_questions', rpcParams);
      
      if (rpcQuestions && rpcQuestions.length >= count) {
        console.log(`[PracticeGen] Found ${rpcQuestions.length} cached questions.`);
        const qs = rpcQuestions.map((q: any) => shuffleQuestionOptions(mapQuestionBankToInterface(q) as any) as unknown as Question);
        setQuestions(qs);
        setGenerationStatus('completed');
        setLoading(false);
        return qs;
      }

      // ── 2. CREATE JOB & TRIGGER AI ────────────────────────────────────────
      setGenerationStatus('generating');
      
      const { data: job, error: jobErr } = await supabase
        .from('bulk_generation_jobs')
        .insert({
          exam: (exam as any),
          subject,
          chapter: chapterName,
          difficulty: CapDifficulty as any,
          target_count: count,
          status: 'pending',
          created_by: user.id
        })
        .select()
        .single();

      if (jobErr) throw new Error(`Failed to create generation job: ${jobErr.message}`);

      // Fire and forget Edge Function
      supabase.functions.invoke('generate-cuet-questions', {
        body: {
          job_id: job.id,
          exam,
          subject,
          chapter: chapterName,
          subtopic: subchapterName,
          count,
        }
      }).catch(err => console.error("[PracticeGen] Function trigger error:", err));

      // ── 3. POLL JOB STATUS WITH 10s FAILSAFE ──────────────────────────────
      setGenerationStatus('polling');
      const POLL_INTERVAL = 2500;
      const FAILSAFE_MS = 10000;
      const MAX_TIMEOUT = 45000;
      const startTime = Date.now();
      let qbData: any[] = [];

      while (Date.now() - startTime < MAX_TIMEOUT) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
        const elapsed = Date.now() - startTime;

        // Check Job Status
        const { data: currentJob } = await supabase
          .from('bulk_generation_jobs')
          .select('status, error_message')
          .eq('id', job.id)
          .single();

        if (currentJob?.status === 'completed') {
          const { data: freshQs } = await supabase.rpc('serve_practice_questions', rpcParams);
          if (freshQs && freshQs.length > 0) {
            qbData = freshQs;
            break;
          }
        }

        if (currentJob?.status === 'failed') {
          throw new Error(currentJob.error_message || "AI generation failed");
        }

        // ── FAILSAFE: FALLBACK TO CERTIFIED QUESTIONS ───────────────────────
        if (elapsed > FAILSAFE_MS && qbData.length === 0) {
          console.warn(`[PracticeGen] Failsafe triggered after ${elapsed}ms. Fetching certified questions.`);
          toast.info("AI is taking a moment — serving high-quality verified questions instead.");
          
          // Pull certified questions for this subject/difficulty
          const { data: certified } = await supabase
            .from('questions_bank')
            .select('*')
            .eq('subject', subject)
            .eq('quality_gate_passed', true)
            .limit(count);

          if (certified && certified.length > 0) {
            qbData = certified;
            break;
          }
        }
      }

      if (qbData.length === 0) {
        throw new Error("Target timeout reached without questions.");
      }

      const qs = qbData.map((q: any) => shuffleQuestionOptions(mapQuestionBankToInterface(q) as any) as unknown as Question);
      setQuestions(qs);
      setGenerationStatus('completed');
      return qs;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load questions';
      setGenerationStatus('failed');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionsForNode = async (
    nodeId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed',
    count: number = 10,
    exam: string = 'JEE'
  ) => {
    setLoading(true);
    setError(null);
    setGenerationStatus('fetching');
    setQuestions([]);

    try {
      const { generateQuestionsForNode: apiFetch } = await import('@/lib/questionService');
      const rawQs = await apiFetch(nodeId, difficulty === 'mixed' ? 'medium' : difficulty, count, exam);
      
      const qs = rawQs.map(mapQuestionBankToInterface);
      setQuestions(qs);
      setGenerationStatus('completed');
      return qs;
    } catch (err: any) {
      setError(err.message);
      setGenerationStatus('failed');
      toast.error(err.message);
      return [];
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

      const { error } = await supabase.functions.invoke('submit-practice-report', {
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
        body: { conceptTested, subchapterName, subject, originalQuestion, count: 3 }
      });

      if (fnError) throw fnError;
      if (data.error) { toast.error(data.error); return null; }

      return (data.questions as SimilarQuestion[]).map(q =>
        shuffleQuestionOptions(q as any) as unknown as SimilarQuestion
      );
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
      batch_id?: string;
      organization_id?: string;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_mcq_attempts' as any).insert({
        user_id: user.id,
        question_id: questionId,
        is_correct: isCorrect,
        time_taken_ms: timeTakenSeconds * 1000,
        confidence_level: confidenceLevel,
        user_selected_mistake: 'none',
        ai_predicted_mistake: 'none'
      });

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
          batch_id:           context.batch_id,
          organization_id:    context.organization_id
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
    generationStatus,
    generateQuestions,
    generateQuestionsForNode,
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
      if (!user) { setLoading(false); return; }

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
