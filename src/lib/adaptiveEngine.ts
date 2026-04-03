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

export function generateDailyMission(diagReport: any): DailyMission {
  // Graceful fallback for the demo UI
  return {
    title: "Overcome " + (diagReport?.weak_areas?.[0] || "Kinematics"),
    description: "Your recent accuracy dipped in this particular topic. Let's tackle 10 focused questions to bridge the conceptual gap.",
    targetChapter: diagReport?.weak_areas?.[0] || "Kinematics",
    questionCount: 10
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
    const targetSubtopic = await this.getNextSubtopic(studentId);

    let query = (supabase as any).from('questions').select('*').eq('is_verified', true);
    
    if (targetSubtopic) {
        // Bias heavily toward their weakness but allow a mix to prevent extreme frustration.
        // For simplicity, we just pull from the weak subtopic in this engine version.
        query = query.eq('subtopic', targetSubtopic);
    }
    
    // In production, we'd use `.order('RANDOM()')` via an RPC. 
    // Here we use updated_at to spoof some randomness or just take the top rows.
    query = query.limit(count);

    const { data } = await query;
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
