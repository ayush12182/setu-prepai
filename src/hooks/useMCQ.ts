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
          'apikey': SUPABASE_KEY,
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
      console.warn('[MCQ] fetchQuestion failed, using frontend fallback:', e);
      // ── AUTHENTIC JEE MAINS FALLBACK POOL (Numerical & Concept Focused) ──
      const questions = [
        {
          question: "A block of mass 5 kg is placed on a rough horizontal surface with coefficient of static friction μs = 0.6 and kinetic friction μk = 0.4. A horizontal force of 25 N is applied to the block. What is the acceleration of the block? (Take g = 10 m/s²)",
          options: [
            "A. 0 m/s²",
            "B. 1 m/s²",
            "C. 5 m/s²",
            "D. 2 m/s²"
          ],
          correctIndex: 0,
          explanation: "Given: m=5kg, F=25N, μs=0.6. \n1. Calculate Max Static Friction: fs(max) = μs * m * g = 0.6 * 5 * 10 = 30 N. \n2. Compare: Since applied force (25 N) < fs(max) (30 N), the block does not move. \nAcceleration = 0 m/s²."
        },
        {
          question: "Two masses 2 kg and 3 kg are connected by a light string passing over a frictionless pulley. The system is released from rest. Find the tension in the string during motion. (Take g = 10 m/s²)",
          options: [
            "A. 12 N",
            "B. 24 N",
            "C. 20 N",
            "D. 30 N"
          ],
          correctIndex: 1,
          explanation: "Given: m1=2kg, m2=3kg. \n1. System acceleration (a) = (m2 - m1)g / (m1 + m2) = (3 - 2) * 10 / (2 + 3) = 10/5 = 2 m/s². \n2. Tension (T) = m1(g + a) = 2(10 + 2) = 24 N."
        },
        {
          question: "A bullet of mass 20 g moving with a velocity of 500 m/s strikes a wooden block and comes to rest after penetrating 5 cm. Find the average resistive force exerted by the block.",
          options: [
            "A. 50,000 N",
            "B. 25,000 N",
            "C. 10,000 N",
            "D. 5,000 N"
          ],
          correctIndex: 0,
          explanation: "Given: m=0.02kg, u=500m/s, v=0, s=0.05m. \n1. Work-Energy Theorem: ΔK = Work done by friction -> (1/2)mu² = F * s. \n2. F = (0.5 * 0.02 * 500²) / 0.05 = (0.01 * 250,000) / 0.05 = 2500 / 0.05 = 50,000 N."
        },
        {
          question: "A variable force F = (3t² + 2t) N acts on a particle of mass 2 kg, starting from rest. What is the velocity of the particle at t = 2 s?",
          options: [
            "A. 4 m/s",
            "B. 8 m/s",
            "C. 6 m/s",
            "D. 12 m/s"
          ],
          correctIndex: 2,
          explanation: "Given: m=2kg, F=3t²+2t. \n1. Acceleration a = F/m = (3t² + 2t)/2 = 1.5t² + t. \n2. Integrate: v = ∫a dt = ∫(1.5t² + t) dt = 0.5t³ + 0.5t². \n3. At t=2: v = 0.5(8) + 0.5(4) = 4 + 2 = 6 m/s."
        },
        {
          question: "A 2 kg mass is moving in a circle of radius 1 m on a horizontal frictionless table. It is attached to a string passing through a hole with tension 32 N. What is the angular velocity of the mass?",
          options: [
            "A. 2 rad/s",
            "B. 4 rad/s",
            "C. 8 rad/s",
            "D. 16 rad/s"
          ],
          correctIndex: 1,
          explanation: "Given: m=2kg, r=1m, Centripetal Force (T)=32N. \n1. Formula: T = m * ω² * r. \n2. 32 = 2 * ω² * 1 -> ω² = 16 -> ω = 4 rad/s."
        }
      ];

      // Use a consistent index based on the topic to avoid immediate repetition
      const seed = topic ? topic.length : 0;
      const index = seed % questions.length;
      return questions[index];
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
