import { supabase } from "@/integrations/supabase/client";

export function evaluateSession(mode: string, accuracy: number, avgTime: number, baselineTime: number) {
  let accuracyChange = 0;
  let behavioralFlag = null;
  let nextActionRecommend = '';

  if (accuracy >= 80) {
    accuracyChange = 5;
    nextActionRecommend = 'Move up to Hard difficulty for this subtopic.';
  } else if (accuracy >= 50) {
    accuracyChange = 2;
    if (avgTime > baselineTime) {
      behavioralFlag = 'You are taking longer than the ideal time. Focus on speed.';
      nextActionRecommend = 'Review formulas and practice timed drills.';
    } else {
      nextActionRecommend = 'Solid pace. Review mistakes and push for 80%.';
    }
  } else {
    accuracyChange = -3;
    behavioralFlag = 'Accuracy drop detected. Potential conceptual gap.';
    nextActionRecommend = 'Switch to study mode and re-read the chapter notes.';
  }

  return { accuracyChange, behavioralFlag, nextActionRecommend };
}

export interface DailyMission {
  title: string;
  description: string;
  targetChapter: string;
  questionCount: number;
}

export type ExamType = 'JEE' | 'NEET' | 'CUET';

// Rotating topic pools — cycles daily so new users always get a fresh mission
const ROTATING_TOPICS: Record<ExamType, string[]> = {
  JEE: [
    'Kinematics', 'Thermodynamics', 'Electrostatics', 'Organic Chemistry',
    'Coordinate Geometry', 'Integration', 'Waves & Sound', 'Electrochemistry',
    'Rotational Motion', 'Chemical Bonding', 'Matrices & Determinants', 'Optics',
  ],
  NEET: [
    'Human Physiology', 'Genetics & Evolution', 'Cell Biology', 'Plant Kingdom',
    'Laws of Motion', 'Chemical Thermodynamics', 'Reproduction in Organisms',
    'Ecology', 'Biomolecules', 'Organic Chemistry', 'Human Reproduction', 'Photosynthesis',
  ],
  CUET: [
    'Consumer Behaviour & Demand Analysis', 'Journal Entries & Ledger',
    'Business Environment', 'National Income Accounting',
    'Marketing Management', 'Depreciation & Provisions',
    'Money & Banking', 'Forms of Business Organisation',
    'Elasticity of Demand', 'Financial Statements', 'Consumer Protection', 'Indian Economy',
  ],
};

/** Returns a deterministic index based on today's date — rotates daily */
function getDailyIndex(poolLength: number): number {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % poolLength;
}

/** Sync fallback — used when Supabase is unavailable */
export function generateDailyMission(diagReport: any, examType: ExamType = 'JEE'): DailyMission {
  const pool = ROTATING_TOPICS[examType];
  const dailyFallback = pool[getDailyIndex(pool.length)];
  const targetTopic = diagReport?.weak_areas?.[0] || diagReport?.whatToFixFirst || dailyFallback;
  return {
    title: 'Overcome ' + targetTopic,
    description: "Your recent accuracy dipped in this particular topic. Let's tackle 10 focused questions to bridge the conceptual gap.",
    targetChapter: targetTopic,
    questionCount: 10,
  };
}

/** Async version — pulls REAL worst topic from Supabase attempt history */
export async function generateDailyMissionAsync(
  userId: string,
  examType: ExamType = 'JEE'
): Promise<DailyMission> {
  const pool = ROTATING_TOPICS[examType];
  const dailyFallback = pool[getDailyIndex(pool.length)];

  try {
    // Find the topic with the lowest accuracy from real attempts
    const { data: attempts, error } = await (supabase as any)
      .from('user_mcq_attempts')
      .select('questions(topic, subject), is_correct')
      .eq('user_id', userId)
      .not('questions', 'is', null)
      .order('attempted_at', { ascending: false })
      .limit(200);

    if (!error && attempts && attempts.length > 0) {
      // Aggregate accuracy per topic
      const topicMap: Record<string, { correct: number; total: number }> = {};
      for (const a of attempts) {
        const topic = a.questions?.topic;
        if (!topic) continue;
        if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
        topicMap[topic].total++;
        if (a.is_correct) topicMap[topic].correct++;
      }
      // Find the weakest topic (min accuracy, min 3 attempts for reliability)
      const weakest = Object.entries(topicMap)
        .filter(([, s]) => s.total >= 3)
        .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))[0];

      if (weakest) {
        return {
          title: 'Overcome ' + weakest[0],
          description: `You've got ${Math.round((weakest[1].correct / weakest[1].total) * 100)}% accuracy here. Let's close that gap with 10 targeted questions.`,
          targetChapter: weakest[0],
          questionCount: 10,
        };
      }
    }
  } catch (err) {
    console.warn('Daily mission: falling back to rotating pool', err);
  }

  // No real data — use rotating daily topic
  return {
    title: 'Overcome ' + dailyFallback,
    description: "Today's focus topic. Tackle 10 questions to strengthen this concept.",
    targetChapter: dailyFallback,
    questionCount: 10,
  };
}

export class AdaptiveEngine {
  /**
   * Evaluates the student's weakness map and returns the next target subtopic.
   */
  static async getNextSubtopic(studentId: string): Promise<string | null> {
    const { data: map, error } = await (supabase as any)
      .from('student_weakness_map')
      .select('*')
      .eq('student_id', studentId)
      .order('accuracy_percent', { ascending: true }) // Lowest accuracy first
      .limit(1)
      .single();

    if (error || !map) return null;
    return map.subtopic;
  }

  /**
   * Fetches an adaptive question batch.
   * If the student has weaknesses, it targets them dynamically.
   * Otherwise, it loads a curated set of random verified questions.
   */
  static async generateAdaptiveSprint(studentId: string, count: number = 20): Promise<any[]> {
    const { data: map, error } = await (supabase as any)
      .from('student_weakness_map')
      .select('*')
      .eq('student_id', studentId)
      .order('accuracy_percent', { ascending: true }) // Lowest accuracy first
      .limit(1)
      .single();

    let query = (supabase as any)
      .from('questions')
      .select('*')
      .eq('verification_status', 'APPROVED');
    
    if (map) {
      query = query.eq('subchapter_id', map.subtopic);
      
      // Dynamic difficulty scaling based on student accuracy
      const accuracy = map.accuracy_percent;
      if (accuracy >= 80) {
        // High accuracy -> serve Harder questions (difficulty_score >= 65)
        query = query.gte('difficulty_score', 65);
      } else if (accuracy < 50) {
        // Low accuracy -> serve Easier questions (difficulty_score < 35)
        query = query.lt('difficulty_score', 35);
      } else {
        // Medium accuracy -> serve Medium questions (difficulty_score between 35 and 65)
        query = query.between('difficulty_score', 35, 65);
      }
    }
    
    query = query.limit(count);

    const { data } = await query;
    
    // Fallback: if not enough matching range, grab any approved questions for this subtopic
    if (data && data.length < count && map) {
      const { data: fallbackData } = await (supabase as any)
        .from('questions')
        .select('*')
        .eq('verification_status', 'APPROVED')
        .eq('subchapter_id', map.subtopic)
        .limit(count);
      return fallbackData || data || [];
    }
    
    return data || [];
  }
  
  /**
   * Core recursive hook: Once a student answers a question, we update their weakness map.
   */
  static async logAttemptAndUpdateMap(studentId: string, question: any, isCorrect: boolean, timeSeconds: number) {
     // 1. Log attempt
     await (supabase as any).from('user_mcq_attempts').insert({
       user_id: studentId,
       question_id: question.id,
       is_correct: isCorrect,
       time_taken_ms: timeSeconds * 1000,
       ai_predicted_mistake: isCorrect ? 'none' : question.mistake_type || 'conceptual',
       selected_option: -1 // Assume caught separately
     });

     // 2. Fetch existing weakness entry
     const { data: existing } = await (supabase as any).from('student_weakness_map').select('*').eq('student_id', studentId).eq('subtopic', question.subtopic).single();

     if (existing) {
        // Recalculate rolling accuracy
        const newAttempts = existing.attempts_count + 1;
        const correctCount = (existing.accuracy_percent / 100) * existing.attempts_count;
        const newAccuracy = ((correctCount + (isCorrect ? 1 : 0)) / newAttempts) * 100;
        
        // Recalculate moving average time
        const newAvgTime = ((existing.avg_time_seconds * existing.attempts_count) + timeSeconds) / newAttempts;

        await (supabase as any).from('student_weakness_map').update({
           accuracy_percent: newAccuracy,
           avg_time_seconds: Math.round(newAvgTime),
           attempts_count: newAttempts,
           last_attempted: new Date().toISOString()
        }).eq('id', existing.id);

     } else {
        // First time seeing this subtopic
        await (supabase as any).from('student_weakness_map').insert({
           student_id: studentId,
           subtopic: question.subtopic,
           accuracy_percent: isCorrect ? 100 : 0,
           avg_time_seconds: timeSeconds,
           attempts_count: 1
        });
     }
  }
}
