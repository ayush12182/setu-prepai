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

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function geminiGenerateQuestions(
  topicName: string,
  exam: string,
  difficulty: string,
  count: number
): Promise<Question[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set');

  const systemPrompt = `You are an expert ${exam} exam question setter. Generate exactly ${count} high-quality MCQs for the topic "${topicName}". Difficulty: ${difficulty}. Return ONLY a JSON object with a "questions" array. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.`;

  const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: { temperature: 0.4, response_mime_type: 'application/json' },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const raw = await res.json();
  const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  const parsed: { questions: any[] } = JSON.parse(text);

  return (parsed.questions || []).map((q: any, i: number) => ({
    id: `gemini-${Date.now()}-${i}`,
    node_id: topicName,
    type: 'MCQ' as QuestionType,
    exam_type: exam,
    difficulty: (q.difficulty || difficulty).toLowerCase() as 'easy' | 'medium' | 'hard',
    question_text: q.question_text,
    options: { A: q.option_a || '', B: q.option_b || '', C: q.option_c || '', D: q.option_d || '' },
    answer: q.correct_option,
    explanation: q.explanation || '',
    concept_tested: q.concept_tested || topicName,
  }));
}

export const usePracticeQuestions = () => {
  const [questions, setQuestions]           = useState<Question[]>([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');

  const generateQuestions = async (
    nodeId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 10,
    exam: string = 'JEE',
    nodeName?: string
  ) => {
    setLoading(true);
    setError(null);
    setGenerationStatus('generating');
    setQuestions([]);

    const topicName = nodeName || nodeId;
    const effectiveDifficulty = difficulty || 'medium';

    // PRIMARY: edge function (server-side Gemini, no client key needed)
    try {
      setGenerationStatus('fetching');
      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: {
          examMode: exam,
          subject: exam,
          chapterName: topicName,
          subchapterName: topicName,
          difficulty: effectiveDifficulty,
          count,
        }
      });

      if (fnError) throw fnError;

      const rawQs: Question[] = (data?.questions || []).map((q: any, i: number) => ({
        id: q.id || `fn-${Date.now()}-${i}`,
        node_id: nodeId,
        type: 'MCQ' as QuestionType,
        exam_type: exam,
        difficulty: (q.difficulty || effectiveDifficulty).toLowerCase() as 'easy' | 'medium' | 'hard',
        question_text: q.question_text,
        options: { A: q.option_a || '', B: q.option_b || '', C: q.option_c || '', D: q.option_d || '' },
        answer: q.correct_option,
        explanation: q.explanation || '',
        concept_tested: q.concept_tested || topicName,
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct_option: q.correct_option,
      }));

      if (rawQs.length === 0) throw new Error('No questions returned');

      setQuestions(rawQs);
      setGenerationStatus('completed');
      return rawQs;
    } catch (err) {
      // FALLBACK: direct Gemini from frontend (requires VITE_GEMINI_API_KEY)
      try {
        const qs = await geminiGenerateQuestions(topicName, exam, effectiveDifficulty, count);
        setQuestions(qs);
        setGenerationStatus('completed');
        return qs;
      } catch (fallbackErr) {
        const message = fallbackErr instanceof Error ? fallbackErr.message : 'Failed to load questions';
        setGenerationStatus('failed');
        setError(message);
        toast.error('Failed to load questions. Try again in a moment.');
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionsForNode = async (
    nodeId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed',
    count: number = 10,
    exam: string = 'JEE',
    nodeName?: string
  ) => {
    return generateQuestions(nodeId, difficulty === 'mixed' ? 'medium' : difficulty, count, exam, nodeName);
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
