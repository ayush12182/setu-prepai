import { supabase } from '@/integrations/supabase/client';

export type MasteryLevel = 'Mastered' | 'Improving' | 'Weak' | 'Critical' | 'Not Started';

export interface ConceptMastery {
  concept: string;
  accuracy: number;
  attempts: number;
  weaknessScore: number; // Concept Weakness metric
  level: MasteryLevel;
  lastAttemptedAt?: string;
}

export interface MisconceptionRecord {
  misconceptionId: string;
  frequency: number;
  recurrence: number;
  recoveredCount: number;
}

export interface StudentAttempt {
  questionId: string;
  concept: string;
  isCorrect: boolean;
  selectedOption: string;
  correctOption: string;
  misconceptionId?: string;
  timeSpentSeconds: number;
  attemptedAt: string;
}

export interface StudentRecoverySession {
  concept: string;
  misconceptionId: string;
  firstAttemptCorrect: boolean;
  remediationSuccess: boolean;
  recoveryCompleted: boolean;
  updatedAt: string;
}

export interface StudentLearningProfile {
  overallAccuracy: number;
  avgTimePerQuestion: number;
  recoveryRate: number;
  totalAttemptsCount: number;
  lastUpdated: string;
  learningVelocity?: number;
  confidenceLevel?: number;
  masteryTrend?: string;
  averageSessionAccuracy?: number;
}

// Local cache keys
const MASTERY_KEY = 'prepentrance_concept_mastery';
const MISCONCEPTIONS_KEY = 'prepentrance_student_misconceptions';
const ATTEMPTS_KEY = 'prepentrance_student_attempts';
const RECOVERY_KEY = 'prepentrance_student_recovery';
const PROFILE_KEY = 'prepentrance_student_profile';

// Sync local cache helper
function getCache<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[studentIntelligence] localStorage write failed:', e);
  }
}

/**
 * Sync all data from Supabase to Local Storage (Cache)
 */
export async function syncFromSupabase(userId: string) {
  if (!userId) return;
  try {
    // 1. Mastery
    const { data: masteryData } = await supabase
      .from('student_concept_mastery' as any)
      .select('*')
      .eq('user_id', userId);
    if (masteryData) {
      const masteryCache: Record<string, ConceptMastery> = {};
      masteryData.forEach((row: any) => {
        masteryCache[row.concept] = {
          concept: row.concept,
          accuracy: row.accuracy,
          attempts: row.attempts,
          weaknessScore: row.weakness_score,
          level: row.level as MasteryLevel,
          lastAttemptedAt: row.last_attempted_at
        };
      });
      setCache(MASTERY_KEY, masteryCache);
    }

    // 2. Misconceptions
    const { data: miscData } = await supabase
      .from('student_misconceptions' as any)
      .select('*')
      .eq('user_id', userId);
    if (miscData) {
      const miscCache: Record<string, MisconceptionRecord> = {};
      miscData.forEach((row: any) => {
        miscCache[row.misconception_id] = {
          misconceptionId: row.misconception_id,
          frequency: row.frequency,
          recurrence: row.recurrence,
          recoveredCount: row.recovered_count
        };
      });
      setCache(MISCONCEPTIONS_KEY, miscCache);
    }

    // 3. Attempts
    const { data: attemptsData } = await supabase
      .from('student_attempts' as any)
      .select('*')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(100);
    if (attemptsData) {
      const attemptsCache = attemptsData.map((row: any) => ({
        questionId: row.question_id,
        concept: row.concept,
        isCorrect: row.is_correct,
        selectedOption: row.selected_option,
        correctOption: row.correct_option,
        misconceptionId: row.misconception_id,
        timeSpentSeconds: row.time_spent_seconds,
        attemptedAt: row.attempted_at
      }));
      setCache(ATTEMPTS_KEY, attemptsCache);
    }

    // 4. Recovery Sessions
    const { data: recData } = await supabase
      .from('student_recovery_sessions' as any)
      .select('*')
      .eq('user_id', userId);
    if (recData) {
      const recCache: Record<string, StudentRecoverySession> = {};
      recData.forEach((row: any) => {
        recCache[row.concept] = {
          concept: row.concept,
          misconceptionId: row.misconception_id,
          firstAttemptCorrect: row.first_attempt_correct,
          remediationSuccess: row.remediation_success,
          recoveryCompleted: row.recovery_completed,
          updatedAt: row.updated_at
        };
      });
      setCache(RECOVERY_KEY, recCache);
    }

    // 5. Profile
    const { data: profData } = await supabase
      .from('student_learning_profiles' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (profData) {
      const profileCache: StudentLearningProfile = {
        overallAccuracy: profData.overall_accuracy,
        avgTimePerQuestion: profData.avg_time_per_question,
        recoveryRate: profData.recovery_rate,
        totalAttemptsCount: profData.total_attempts_count,
        lastUpdated: profData.last_updated,
        learningVelocity: profData.learning_velocity || 0,
        confidenceLevel: profData.confidence_level || 0,
        masteryTrend: profData.mastery_trend || 'stable',
        averageSessionAccuracy: profData.average_session_accuracy || profData.overall_accuracy
      };
      setCache(PROFILE_KEY, profileCache);
    }
  } catch (err) {
    console.warn('[studentIntelligence] syncFromSupabase failed (falling back to cache):', err);
  }
}

/**
 * Record a student attempt (updates cache and syncs to Supabase)
 */
export async function recordStudentAttempt(
  userId: string,
  attempt: {
    questionId: string;
    concept: string;
    isCorrect: boolean;
    selectedOption: string;
    correctOption: string;
    misconceptionId?: string;
    timeSpentSeconds: number;
  }
) {
  const timestamp = new Date().toISOString();
  const attemptRow: StudentAttempt = {
    ...attempt,
    attemptedAt: timestamp
  };

  // 1. Update Attempts list
  const attempts = getCache<StudentAttempt[]>(ATTEMPTS_KEY, []);
  attempts.unshift(attemptRow);
  setCache(ATTEMPTS_KEY, attempts.slice(0, 100)); // Limit cache size to last 100

  // 2. Update Mastery Scores & Concept Weakness Engine
  const masteryMap = getCache<Record<string, ConceptMastery>>(MASTERY_KEY, {});
  const currentMastery = masteryMap[attempt.concept] || {
    concept: attempt.concept,
    accuracy: 0,
    attempts: 0,
    weaknessScore: 0,
    level: 'Not Started'
  };

  const newAttempts = currentMastery.attempts + 1;
  let newWeakness = currentMastery.weaknessScore;

  if (attempt.isCorrect) {
    // Correct answer helps reduce weakness (recovery)
    newWeakness = Math.max(0, newWeakness - 1);
  } else {
    // Wrong option -> weakness increases
    newWeakness = newWeakness + 1;
  }

  // Calculate new accuracy
  const conceptAttempts = attempts.filter(a => a.concept === attempt.concept);
  const correctCount = conceptAttempts.filter(a => a.isCorrect).length;
  const newAccuracy = Math.round((correctCount / conceptAttempts.length) * 100);

  // Mastery Levels: Mastered (>=80), Improving (60-80), Weak (40-60), Critical (<40), Not Started (0)
  let newLevel: MasteryLevel = 'Not Started';
  if (newAttempts > 0) {
    if (newAccuracy >= 80) newLevel = 'Mastered';
    else if (newAccuracy >= 60) newLevel = 'Improving';
    else if (newAccuracy >= 40) newLevel = 'Weak';
    else newLevel = 'Critical';
  }

  const updatedMastery: ConceptMastery = {
    concept: attempt.concept,
    accuracy: newAccuracy,
    attempts: newAttempts,
    weaknessScore: newWeakness,
    level: newLevel,
    lastAttemptedAt: timestamp
  };
  masteryMap[attempt.concept] = updatedMastery;
  setCache(MASTERY_KEY, masteryMap);

  // 3. Update Misconceptions if triggered
  const miscMap = getCache<Record<string, MisconceptionRecord>>(MISCONCEPTIONS_KEY, {});
  if (attempt.misconceptionId) {
    const currentMisc = miscMap[attempt.misconceptionId] || {
      misconceptionId: attempt.misconceptionId,
      frequency: 0,
      recurrence: 0,
      recoveredCount: 0
    };
    
    const wasTriggeredRecently = attempts.slice(1, 4).some(a => a.misconceptionId === attempt.misconceptionId);

    miscMap[attempt.misconceptionId] = {
      misconceptionId: attempt.misconceptionId,
      frequency: currentMisc.frequency + (attempt.isCorrect ? 0 : 1),
      recurrence: currentMisc.recurrence + (wasTriggeredRecently && !attempt.isCorrect ? 1 : 0),
      recoveredCount: currentMisc.recoveredCount + (attempt.isCorrect ? 1 : 0)
    };
    setCache(MISCONCEPTIONS_KEY, miscMap);
  }

  // 4. Update Recovery Sessions
  const recoveryMap = getCache<Record<string, StudentRecoverySession>>(RECOVERY_KEY, {});
  if (!attempt.isCorrect && attempt.misconceptionId) {
    recoveryMap[attempt.concept] = {
      concept: attempt.concept,
      misconceptionId: attempt.misconceptionId,
      firstAttemptCorrect: false,
      remediationSuccess: false,
      recoveryCompleted: false,
      updatedAt: timestamp
    };
    setCache(RECOVERY_KEY, recoveryMap);
  }

  // 5. Update Profile Stats
  const totalAttempts = attempts.length;
  const overallAccuracy = totalAttempts > 0
    ? Math.round((attempts.filter(a => a.isCorrect).length / totalAttempts) * 100)
    : 0;
  const avgTime = totalAttempts > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0) / totalAttempts)
    : 0;

  // Recovery Rate calculation
  const totalRecoverySessions = Object.values(recoveryMap).length;
  const successfulRecoveries = Object.values(recoveryMap).filter(r => r.recoveryCompleted).length;
  const recoveryRate = totalRecoverySessions > 0 ? Math.round((successfulRecoveries / totalRecoverySessions) * 100) : 0;

  const profile: StudentLearningProfile = {
    overallAccuracy,
    avgTimePerQuestion: avgTime,
    recoveryRate,
    totalAttemptsCount: totalAttempts,
    lastUpdated: timestamp,
    learningVelocity: Math.min(100, recoveryRate * 1.2), // Rough proxy for velocity
    confidenceLevel: overallAccuracy > 75 && avgTime < 60 ? 90 : (overallAccuracy > 50 ? 70 : 40),
    masteryTrend: totalAttempts > 10 ? (overallAccuracy >= 80 ? 'increasing' : 'stable') : 'stable',
    averageSessionAccuracy: overallAccuracy
  };
  setCache(PROFILE_KEY, profile);

  // Sync with Supabase (fire-and-forget background task)
  if (userId) {
    supabase.from('student_attempts' as any).insert({
      user_id: userId,
      question_id: attempt.questionId,
      concept: attempt.concept,
      is_correct: attempt.isCorrect,
      selected_option: attempt.selectedOption,
      correct_option: attempt.correctOption,
      misconception_id: attempt.misconceptionId || null,
      time_spent_seconds: attempt.timeSpentSeconds,
      attempted_at: timestamp
    }).then();

    supabase.from('student_concept_mastery' as any).upsert({
      user_id: userId,
      concept: attempt.concept,
      accuracy: newAccuracy,
      attempts: newAttempts,
      weakness_score: newWeakness,
      level: newLevel,
      last_attempted_at: timestamp
    }).then();

    if (attempt.misconceptionId) {
      const rec = miscMap[attempt.misconceptionId];
      supabase.from('student_misconceptions' as any).upsert({
        user_id: userId,
        misconception_id: attempt.misconceptionId,
        frequency: rec.frequency,
        recurrence: rec.recurrence,
        recovered_count: rec.recoveredCount
      }).then();
    }

    supabase.from('student_learning_profiles' as any).upsert({
      user_id: userId,
      overall_accuracy: overallAccuracy,
      avg_time_per_question: avgTime,
      recovery_rate: recoveryRate,
      total_attempts_count: totalAttempts,
      last_updated: timestamp,
      learning_velocity: profile.learningVelocity,
      confidence_level: profile.confidenceLevel,
      mastery_trend: profile.masteryTrend,
      average_session_accuracy: profile.averageSessionAccuracy
    }).then();
  }
}

/**
 * Record remediation outcome (recovers concept weakness)
 */
export async function recordRemediationSuccess(
  userId: string,
  concept: string,
  misconceptionId: string,
  wasSuccess: boolean
) {
  const timestamp = new Date().toISOString();
  
  // 1. Update weakness score
  const masteryMap = getCache<Record<string, ConceptMastery>>(MASTERY_KEY, {});
  if (masteryMap[concept]) {
    const current = masteryMap[concept];
    const newWeakness = wasSuccess ? Math.max(0, current.weaknessScore - 1) : current.weaknessScore + 1;
    masteryMap[concept] = {
      ...current,
      weaknessScore: newWeakness
    };
    setCache(MASTERY_KEY, masteryMap);

    if (userId) {
      supabase.from('student_concept_mastery' as any).upsert({
        user_id: userId,
        concept: concept,
        weakness_score: newWeakness,
        last_attempted_at: timestamp
      }).then();
    }
  }

  // 2. Update recovery session status
  const recoveryMap = getCache<Record<string, StudentRecoverySession>>(RECOVERY_KEY, {});
  if (recoveryMap[concept]) {
    recoveryMap[concept] = {
      ...recoveryMap[concept],
      remediationSuccess: wasSuccess,
      recoveryCompleted: wasSuccess,
      updatedAt: timestamp
    };
    setCache(RECOVERY_KEY, recoveryMap);

    if (userId) {
      supabase.from('student_recovery_sessions' as any).upsert({
        user_id: userId,
        concept: concept,
        misconception_id: misconceptionId,
        remediation_success: wasSuccess,
        recovery_completed: wasSuccess,
        updated_at: timestamp
      }).then();
    }
  }
}

/**
 * Returns chapter mastery configurations for local or global views
 */
export function getChapterMasteryStatuses(subject: string, chapters: any[]): Record<string, { mastered: number; improving: number; weak: number; critical: number; notStarted: number }> {
  const masteryMap = getCache<Record<string, ConceptMastery>>(MASTERY_KEY, {});
  const res: Record<string, { mastered: number; improving: number; weak: number; critical: number; notStarted: number }> = {};

  chapters.forEach(chapter => {
    let mastered = 0;
    let improving = 0;
    let weak = 0;
    let critical = 0;
    let notStarted = 0;

    const concepts = chapter.concepts || chapter.topics || [];
    concepts.forEach((c: string) => {
      const rec = masteryMap[c];
      if (!rec || rec.level === 'Not Started') notStarted++;
      else if (rec.level === 'Mastered') mastered++;
      else if (rec.level === 'Improving') improving++;
      else if (rec.level === 'Weak') weak++;
      else if (rec.level === 'Critical') critical++;
    });

    res[chapter.id || chapter.name] = { mastered, improving, weak, critical, notStarted };
  });

  return res;
}

/**
 * Fetch Recovery Analytics
 */
export function getRecoveryAnalytics() {
  const attempts = getCache<StudentAttempt[]>(ATTEMPTS_KEY, []);
  const recoveries = getCache<Record<string, StudentRecoverySession>>(RECOVERY_KEY, {});

  const totalIncorrect = attempts.filter(a => !a.isCorrect).length;
  const postRemediationCorrect = Object.values(recoveries).filter(r => r.recoveryCompleted).length;

  const firstAttemptAccuracy = attempts.length > 0
    ? Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100)
    : 0;

  const conceptRecoveryPct = totalIncorrect > 0
    ? Math.round((postRemediationCorrect / totalIncorrect) * 100)
    : 0;

  return {
    firstAttemptAccuracy,
    postRemediationAccuracy: firstAttemptAccuracy + Math.round((100 - firstAttemptAccuracy) * (conceptRecoveryPct / 100)),
    conceptRecoveryPct
  };
}

/**
 * Adaptive question selection selector mix
 * Priority: 40% Weak/Critical, 40% Improving, 20% Mastered
 */
export function getAdaptiveConceptSelection(
  allConcepts: string[],
  count: number = 10
): string[] {
  const masteryMap = getCache<Record<string, ConceptMastery>>(MASTERY_KEY, {});
  
  const weakOrCritical: string[] = [];
  const improving: string[] = [];
  const mastered: string[] = [];
  const notStarted: string[] = [];

  allConcepts.forEach(c => {
    const rec = masteryMap[c];
    if (!rec) notStarted.push(c);
    else if (rec.level === 'Weak' || rec.level === 'Critical') weakOrCritical.push(c);
    else if (rec.level === 'Improving') improving.push(c);
    else if (rec.level === 'Mastered') mastered.push(c);
    else notStarted.push(c);
  });

  // Treat notStarted as weak/critical to prioritize initial learning
  const weakPool = [...weakOrCritical, ...notStarted];
  const improvingPool = improving.length > 0 ? improving : weakPool;
  const masteredPool = mastered.length > 0 ? mastered : improvingPool;

  const selected: string[] = [];

  const targetWeakCount = Math.ceil(count * 0.4);
  const targetImprovingCount = Math.ceil(count * 0.4);
  const targetMasteredCount = count - targetWeakCount - targetImprovingCount;

  // Helper to sample from a pool
  const sample = (pool: string[], target: number) => {
    const list: string[] = [];
    if (pool.length === 0) return list;
    for (let i = 0; i < target; i++) {
      list.push(pool[i % pool.length]);
    }
    return list;
  };

  selected.push(...sample(weakPool, targetWeakCount));
  selected.push(...sample(improvingPool, targetImprovingCount));
  selected.push(...sample(masteredPool, targetMasteredCount));

  return selected.slice(0, count);
}
