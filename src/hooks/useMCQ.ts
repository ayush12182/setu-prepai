/**
 * useMCQ.ts
 *
 * State machine for the adaptive MCQ system.
 * States: idle → loading → active → feedback → complete
 *
 * Adaptive logic:
 *   - Correct → increase difficulty (up to hard)
 *   - Wrong   → maintain or drop difficulty
 */

import { useState, useRef, useCallback } from 'react';
import { LanguageMode } from '@/contexts/LanguageContext';

// ────────────────────────────────────────
//  Types
// ────────────────────────────────────────

export type MCQDifficulty = 'easy' | 'medium' | 'hard';
export type MCQStatus = 'idle' | 'loading' | 'active' | 'feedback' | 'complete';

export interface MCQQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MCQState {
  status: MCQStatus;
  currentQuestion: MCQQuestion | null;
  currentDifficulty: MCQDifficulty;
  questionNumber: number;       // 1-based, max TOTAL_QUESTIONS
  selectedIndex: number | null; // user's answer
  isCorrect: boolean | null;
  error: string | null;
  // Session totals
  totalCorrect: number;
  totalAttempted: number;
}

export interface UseMCQReturn {
  mcq: MCQState;
  startMCQ: (topic: string, subject: string) => Promise<void>;
  selectAnswer: (index: number) => void;
  nextQuestion: () => Promise<void>;
  skipMCQ: () => void;
  resetMCQ: () => void;
  onMCQResult: (topic: string, correct: boolean) => void; // callback injected externally
}

// ────────────────────────────────────────
//  Constants
// ────────────────────────────────────────
const TOTAL_QUESTIONS = 5;
const MCQ_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-mcq`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const DIFFICULTY_UP: Record<MCQDifficulty, MCQDifficulty> = {
  easy: 'medium', medium: 'hard', hard: 'hard',
};
const DIFFICULTY_DOWN: Record<MCQDifficulty, MCQDifficulty> = {
  easy: 'easy', medium: 'easy', hard: 'medium',
};

const INITIAL_STATE: MCQState = {
  status: 'idle',
  currentQuestion: null,
  currentDifficulty: 'easy',
  questionNumber: 0,
  selectedIndex: null,
  isCorrect: null,
  error: null,
  totalCorrect: 0,
  totalAttempted: 0,
};

// ────────────────────────────────────────
//  Hook
// ────────────────────────────────────────
export function useMCQ(
  language: LanguageMode,
  onResult: (topic: string, correct: boolean) => void,
): UseMCQReturn {
  const [mcq, setMCQ] = useState<MCQState>(INITIAL_STATE);
  const topicRef          = useRef<string>('');
  const subjectRef        = useRef<string>('');
  const previousQsRef     = useRef<string[]>([]);  // avoid repeat questions

  const fetchQuestion = useCallback(async (
    topic: string,
    subject: string,
    difficulty: MCQDifficulty,
    questionNum: number,
  ): Promise<MCQQuestion | null> => {
    try {
      const res = await fetch(MCQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          topic,
          subject,
          difficulty,
          language,
          previousQuestions: previousQsRef.current,
        }),
      });
      if (!res.ok) throw new Error(`MCQ API error: ${res.status}`);
      const q: MCQQuestion = await res.json();
      previousQsRef.current.push(q.question);
      return q;
    } catch (e) {
      console.error('[MCQ] fetchQuestion error:', e);
      return null;
    }
  }, [language]);

  const startMCQ = useCallback(async (topic: string, subject: string) => {
    topicRef.current     = topic;
    subjectRef.current   = subject;
    previousQsRef.current = [];

    setMCQ(s => ({ ...s, status: 'loading', error: null, questionNumber: 1,
      currentDifficulty: 'easy', selectedIndex: null, isCorrect: null,
      totalCorrect: 0, totalAttempted: 0 }));

    const q = await fetchQuestion(topic, subject, 'easy', 1);
    if (!q) {
      setMCQ(s => ({ ...s, status: 'idle', error: 'Could not generate question. Try again.' }));
      return;
    }
    setMCQ(s => ({ ...s, status: 'active', currentQuestion: q }));
  }, [fetchQuestion]);

  const selectAnswer = useCallback((index: number) => {
    setMCQ(s => {
      if (s.status !== 'active' || !s.currentQuestion) return s;
      const isCorrect = index === s.currentQuestion.correctIndex;
      onResult(topicRef.current, isCorrect);
      return {
        ...s,
        status: 'feedback',
        selectedIndex: index,
        isCorrect,
        totalCorrect:   s.totalCorrect   + (isCorrect ? 1 : 0),
        totalAttempted: s.totalAttempted + 1,
        // Adapt difficulty
        currentDifficulty: isCorrect ? DIFFICULTY_UP[s.currentDifficulty] : DIFFICULTY_DOWN[s.currentDifficulty],
      };
    });
  }, [onResult]);

  const nextQuestion = useCallback(async () => {
    const current = mcq;
    if (current.questionNumber >= TOTAL_QUESTIONS) {
      setMCQ(s => ({ ...s, status: 'complete' }));
      return;
    }
    setMCQ(s => ({
      ...s,
      status: 'loading',
      selectedIndex: null,
      isCorrect: null,
      questionNumber: s.questionNumber + 1,
    }));

    const q = await fetchQuestion(
      topicRef.current,
      subjectRef.current,
      current.currentDifficulty,
      current.questionNumber + 1,
    );
    if (!q) {
      setMCQ(s => ({ ...s, status: 'complete' }));
      return;
    }
    setMCQ(s => ({ ...s, status: 'active', currentQuestion: q }));
  }, [mcq, fetchQuestion]);

  const skipMCQ = useCallback(() => {
    setMCQ(s => ({ ...s, status: 'idle' }));
  }, []);

  const resetMCQ = useCallback(() => {
    setMCQ(INITIAL_STATE);
    previousQsRef.current = [];
  }, []);

  return { mcq, startMCQ, selectAnswer, nextQuestion, skipMCQ, resetMCQ, onMCQResult: onResult };
}
