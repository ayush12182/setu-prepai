/**
 * useSessionTracker.ts
 *
 * Tracks all learning metrics during an AI Teacher session:
 *   - Session timing
 *   - Questions asked (typed + voice)
 *   - Topics covered
 *   - AI responses count
 *   - MCQ performance
 */

import { useRef, useCallback } from 'react';

// ────────────────────────────────────────
//  Types
// ────────────────────────────────────────

export type InteractionType = 'typed' | 'voice' | 'chip' | 'explain';

export interface MCQResult {
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface TopicEntry {
  chapter: string;
  topic: string;
  startedAt: number;
  durationMs: number;
}

export interface CompiledSessionReport {
  // Time
  sessionStartAt: number;
  totalDurationMs: number;

  // Interaction
  questionsAsked: number;
  typedInteractions: number;
  voiceInteractions: number;
  aiResponses: number;

  // Topics
  topicsCovered: TopicEntry[];
  currentChapter: string;
  currentTopic: string;

  // MCQ
  mcqResults: MCQResult[];
  totalMCQAttempted: number;
  totalMCQCorrect: number;
  overallAccuracy: number;
  weakTopics: string[];   // topics where accuracy < 60%

  // Engagement (populated externally from useEngagementDetector)
  engagementScore: number;
  attentivePercent: number;
  distractedPercent: number;
  engagementTimeline: { t: number; score: number }[];
}

export interface UseSessionTrackerReturn {
  recordInteraction: (type: InteractionType) => void;
  recordTopicChange: (chapter: string, topic: string) => void;
  recordAIResponse: () => void;
  recordMCQResult: (topic: string, correct: boolean) => void;
  compileReport: (engagementData: {
    engagementScore: number;
    attentivePercent: number;
    distractedPercent: number;
    engagementTimeline: { t: number; score: number }[];
  }) => CompiledSessionReport;
  resetSession: () => void;
}

// ────────────────────────────────────────
//  Hook
// ────────────────────────────────────────

export function useSessionTracker(): UseSessionTrackerReturn {
  const sessionStartRef    = useRef<number>(Date.now());
  const questionsRef       = useRef<number>(0);
  const typedRef           = useRef<number>(0);
  const voiceRef           = useRef<number>(0);
  const aiResponsesRef     = useRef<number>(0);
  const topicsCoveredRef   = useRef<TopicEntry[]>([]);
  const currentTopicRef    = useRef<{ chapter: string; topic: string; startedAt: number } | null>(null);
  const mcqResultsMapRef   = useRef<Map<string, { total: number; correct: number }>>(new Map());

  const recordInteraction = useCallback((type: InteractionType) => {
    if (type === 'typed' || type === 'chip' || type === 'explain') {
      questionsRef.current++;
      typedRef.current++;
    } else if (type === 'voice') {
      questionsRef.current++;
      voiceRef.current++;
    }
  }, []);

  const recordTopicChange = useCallback((chapter: string, topic: string) => {
    const now = Date.now();
    // Close out previous topic
    if (currentTopicRef.current) {
      const prev = currentTopicRef.current;
      topicsCoveredRef.current.push({
        chapter: prev.chapter,
        topic: prev.topic,
        startedAt: prev.startedAt,
        durationMs: now - prev.startedAt,
      });
    }
    // Start new topic
    currentTopicRef.current = { chapter, topic, startedAt: now };
  }, []);

  const recordAIResponse = useCallback(() => {
    aiResponsesRef.current++;
  }, []);

  const recordMCQResult = useCallback((topic: string, correct: boolean) => {
    const existing = mcqResultsMapRef.current.get(topic) ?? { total: 0, correct: 0 };
    mcqResultsMapRef.current.set(topic, {
      total:   existing.total + 1,
      correct: existing.correct + (correct ? 1 : 0),
    });
  }, []);

  const compileReport = useCallback((engagementData: {
    engagementScore: number;
    attentivePercent: number;
    distractedPercent: number;
    engagementTimeline: { t: number; score: number }[];
  }): CompiledSessionReport => {
    const now = Date.now();

    // Close open topic
    const topics = [...topicsCoveredRef.current];
    if (currentTopicRef.current) {
      const cur = currentTopicRef.current;
      topics.push({
        chapter: cur.chapter,
        topic: cur.topic,
        startedAt: cur.startedAt,
        durationMs: now - cur.startedAt,
      });
    }

    // MCQ aggregation
    const mcqResults: MCQResult[] = [];
    let totalMCQAttempted = 0;
    let totalMCQCorrect = 0;
    const weakTopics: string[] = [];

    mcqResultsMapRef.current.forEach((v, topic) => {
      const accuracy = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
      mcqResults.push({ topic, totalQuestions: v.total, correctAnswers: v.correct, accuracy });
      totalMCQAttempted += v.total;
      totalMCQCorrect   += v.correct;
      if (accuracy < 60) weakTopics.push(topic);
    });

    const overallAccuracy = totalMCQAttempted > 0
      ? Math.round((totalMCQCorrect / totalMCQAttempted) * 100) : 0;

    return {
      sessionStartAt:     sessionStartRef.current,
      totalDurationMs:    now - sessionStartRef.current,
      questionsAsked:     questionsRef.current,
      typedInteractions:  typedRef.current,
      voiceInteractions:  voiceRef.current,
      aiResponses:        aiResponsesRef.current,
      topicsCovered:      topics,
      currentChapter:     currentTopicRef.current?.chapter ?? '',
      currentTopic:       currentTopicRef.current?.topic ?? '',
      mcqResults,
      totalMCQAttempted,
      totalMCQCorrect,
      overallAccuracy,
      weakTopics,
      ...engagementData,
    };
  }, []);

  const resetSession = useCallback(() => {
    sessionStartRef.current  = Date.now();
    questionsRef.current     = 0;
    typedRef.current         = 0;
    voiceRef.current         = 0;
    aiResponsesRef.current   = 0;
    topicsCoveredRef.current = [];
    currentTopicRef.current  = null;
    mcqResultsMapRef.current = new Map();
  }, []);

  return { recordInteraction, recordTopicChange, recordAIResponse, recordMCQResult, compileReport, resetSession };
}
