import { StudentAnalyticsData } from './analyticsSimulation';
import { AIDiagnosisReport } from './diagnosisEngine';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type PracticeMode = 'Focus' | 'WeaknessAttack' | 'SmartMixed';
export type TestMode = 'FullMock' | 'WeaknessBased' | 'SpeedRun';

export interface DailyMission {
  title: string;
  description: string;
  targetChapter: string;
  questionCount: number;
  rewardPoints: number;
  isCompleted: boolean;
}

export interface AdaptiveQuestion {
  id: string;
  chapter: string;
  concept: string;
  difficulty: DifficultyLevel;
  expectedTimeSeconds: number;
  mistakeTags: string[]; // e.g., 'Conceptual', 'Silly', 'Time'
}

export interface SessionSummary {
  accuracyChange: number; // e.g. +12
  overallAccuracy: number;
  behavioralFlag: string | null; // e.g. "You rushed 4 questions."
  nextActionRecommend: string; // e.g. "Review Coordinate Geometry before continuing."
  completedQuestions: number;
}

/**
 * INTELLIGENT ROUTER: Generates the Daily Mission based on the AI Diagnosis.
 * It directly attacks the #1 blocked chapter identified by the Priority Engine.
 */
export function generateDailyMission(report: AIDiagnosisReport | null): DailyMission {
  if (!report || !report.isReliable || report.topWeakChapters.length === 0) {
    return {
      title: "Diagnostic Required",
      description: "Complete a mock test to unlock AI missions.",
      targetChapter: "Mixed Concept",
      questionCount: 15,
      rewardPoints: 50,
      isCompleted: false
    };
  }

  const primaryBlocker = report.topWeakChapters[0];

  return {
    title: `Fix ${primaryBlocker.chapter}`,
    description: `You are losing ${primaryBlocker.marksLost} marks here. Let's fix this leak today.`,
    targetChapter: primaryBlocker.chapter,
    questionCount: 10,
    rewardPoints: 100,
    isCompleted: false
  };
}

/**
 * ADAPTIVE DIFFICULTY SCALING (MOCK)
 * Simulated logic showing how the engine assesses a student's rolling accuracy 
 * to dial difficulty up or down mid-session.
 */
export function scaleDifficulty(recentAccuracy: number, currentDifficulty: DifficultyLevel): DifficultyLevel {
  if (recentAccuracy >= 80) {
    if (currentDifficulty === 'Easy') return 'Medium';
    if (currentDifficulty === 'Medium') return 'Hard';
  }
  if (recentAccuracy <= 40) {
    if (currentDifficulty === 'Hard') return 'Medium';
    if (currentDifficulty === 'Medium') return 'Easy';
  }
  return currentDifficulty; // Stay the same if 41-79%
}

/**
 * SESSION EVALUATOR
 * Analyzes a completed session to generate the post-match behavioral summary.
 */
export function evaluateSession(
  mode: PracticeMode | TestMode, 
  accuracy: number, 
  avgTime: number, 
  expectedAvgTime: number
): SessionSummary {
  
  let behavioralFlag: string | null = null;
  if (avgTime < (expectedAvgTime * 0.5) && accuracy < 60) {
    behavioralFlag = "You rushed heavily. Your average time was half the expected time, destroying accuracy.";
  } else if (avgTime > (expectedAvgTime * 1.5) && accuracy < 60) {
    behavioralFlag = "You are overthinking. High time spent with low accuracy indicates a core conceptual gap.";
  } else if (accuracy >= 80) {
    behavioralFlag = "Excellent pacing and accuracy. You have mastered this tier.";
  }

  let nextAction = "";
  if (mode === 'SpeedRun') {
    nextAction = "Take a 10 minute break, then review exactly which questions forced you to guess.";
  } else if (accuracy < 50) {
    nextAction = "Stop practicing. Go back to Lecture SETU and review the theory.";
  } else {
    nextAction = "Progress to Hard difficulty questions in the next session.";
  }

  return {
    accuracyChange: accuracy > 60 ? +8 : -4, // Mock change
    overallAccuracy: accuracy,
    behavioralFlag,
    nextActionRecommend: nextAction,
    completedQuestions: mode === 'SpeedRun' ? 50 : 15
  };
}
