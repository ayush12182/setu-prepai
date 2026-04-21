import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { generateQuestionsGemini } from '@/lib/gemini';

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  concept_tested: string;
  common_mistake: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssessmentConfig {
  subchapterId: string;
  subchapterName: string;
  chapterId: string;
  chapterName: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  examMode: 'JEE' | 'NEET' | 'CUET';
  batchSize?: number;       // questions per fetch (default 10)
  sessionId?: string;       // B2B session ID for tagging
}

export interface AssessmentAttempt {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeTakenSeconds: number;
}

const BATCH_SIZE = 10;
const PREFETCH_THRESHOLD = 3; // fetch next batch when this many remain

export const useAssessmentEngine = () => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [sessionActive, setSessionActive] = useState(false);

  // Track seen question IDs to avoid repeats forever
  const seenIds = useRef<Set<string>>(new Set());
  const configRef = useRef<AssessmentConfig | null>(null);
  const prefetchQueued = useRef(false);

  const pickDifficulty = (mixed: boolean): 'easy' | 'medium' | 'hard' => {
    if (!mixed) return 'medium';
    const r = Math.random();
    if (r < 0.3) return 'easy';
    if (r < 0.7) return 'medium';
    return 'hard';
  };

  /** Fetch a batch of fresh questions from AI */
  const fetchBatch = useCallback(async (
    cfg: AssessmentConfig,
    forceNew: boolean = true
  ): Promise<AssessmentQuestion[]> => {
    const difficulty = cfg.difficulty === 'mixed'
      ? pickDifficulty(true)
      : cfg.difficulty;

    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: {
        subchapterId: cfg.subchapterId,
        subchapterName: cfg.subchapterName,
        chapterId: cfg.chapterId,
        chapterName: cfg.chapterName,
        subject: cfg.subject,
        difficulty,
        examMode: cfg.examMode,
        count: cfg.batchSize || BATCH_SIZE,
        forceNew,
        excludeIds: Array.from(seenIds.current),
        seed: Date.now(),
        sessionId: cfg.sessionId,
      },
    });

    if (error || data?.error || !data?.questions?.length) {
      // Frontend Gemini fallback
      const topic = `${cfg.chapterName} — ${cfg.subchapterName}`;
      const geminiQs = await generateQuestionsGemini(topic, cfg.examMode, difficulty, cfg.batchSize || BATCH_SIZE);
      const mapped = geminiQs.map(q => ({
        id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option as 'A' | 'B' | 'C' | 'D',
        explanation: q.explanation,
        concept_tested: q.concept_tested,
        common_mistake: null,
        difficulty: q.difficulty,
      })) as AssessmentQuestion[];
      mapped.forEach(q => seenIds.current.add(q.id));
      return mapped;
    }

    const qs = (data.questions as AssessmentQuestion[])
      .filter(q => !seenIds.current.has(q.id))
      .map(q => shuffleQuestionOptions(q as any) as unknown as AssessmentQuestion);

    qs.forEach(q => seenIds.current.add(q.id));
    return qs;
  }, []);

  /** Start a new infinite assessment session */
  const startSession = useCallback(async (cfg: AssessmentConfig) => {
    setLoading(true);
    setQuestions([]);
    setAttempts([]);
    setCurrentIndex(0);
    seenIds.current = new Set();
    prefetchQueued.current = false;
    configRef.current = cfg;

    try {
      const batch = await fetchBatch(cfg, true);
      setQuestions(batch);
      setSessionActive(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  }, [fetchBatch]);

  /** Prefetch the next batch in the background */
  const prefetchNextBatch = useCallback(async () => {
    if (!configRef.current || prefetchQueued.current || prefetching) return;
    prefetchQueued.current = true;
    setPrefetching(true);
    try {
      const batch = await fetchBatch(configRef.current, true);
      setQuestions(prev => [...prev, ...batch]);
    } catch {
      // Silent fail — user won't notice if prefetch fails
    } finally {
      setPrefetching(false);
      prefetchQueued.current = false;
    }
  }, [fetchBatch, prefetching]);

  /** Call this after student answers a question */
  const submitAnswer = useCallback(async (
    selectedOption: 'A' | 'B' | 'C' | 'D',
    timeTakenSeconds: number
  ) => {
    const question = questions[currentIndex];
    if (!question) return;

    const isCorrect = selectedOption === question.correct_option;
    const attempt: AssessmentAttempt = {
      questionId: question.id,
      selectedOption,
      isCorrect,
      timeTakenSeconds,
    };

    setAttempts(prev => [...prev, attempt]);

    // Background: record to DB
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from('user_mcq_attempts').insert({
          user_id: user.id,
          question_id: question.id,
          is_correct: isCorrect,
          time_taken_ms: timeTakenSeconds * 1000,
          confidence_level: 'medium',
          user_selected_mistake: 'none',
          ai_predicted_mistake: isCorrect ? 'none' : 'conceptual',
        });
      }
    } catch { /* silent */ }

    const nextIndex = currentIndex + 1;
    const remaining = questions.length - nextIndex;

    // Prefetch when running low
    if (remaining <= PREFETCH_THRESHOLD && !prefetchQueued.current) {
      prefetchNextBatch();
    }

    setCurrentIndex(nextIndex);
  }, [questions, currentIndex, prefetchNextBatch]);

  const endSession = useCallback(() => {
    setSessionActive(false);
  }, []);

  const currentQuestion = questions[currentIndex] ?? null;
  const hasMore = currentIndex < questions.length;
  const totalAnswered = attempts.length;
  const correctCount = attempts.filter(a => a.isCorrect).length;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return {
    // State
    currentQuestion,
    currentIndex,
    questions,
    loading,
    prefetching,
    sessionActive,
    attempts,
    hasMore,

    // Stats
    totalAnswered,
    correctCount,
    accuracy,

    // Actions
    startSession,
    submitAnswer,
    endSession,
  };
};
