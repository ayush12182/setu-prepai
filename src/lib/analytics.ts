import { supabase } from '@/integrations/supabase/client';

export interface StudentStats {
  student_id: string;
  full_name: string;
  total_questions: number;
  correct_questions: number;
  total_time_seconds: number;
  accuracy: number;
  points: number;
}

/**
 * Aggregates practice activity for a set of students
 */
export async function getStudentBatchStats(studentIds: string[]): Promise<Record<string, Partial<StudentStats>>> {
  if (!studentIds.length) return {};

  const { data: activity, error } = await supabase
    .from('student_activity')
    .select('user_id, is_correct, time_spent_seconds')
    .in('user_id', studentIds)
    .eq('activity_type', 'practice');

  if (error) {
    console.error('[Analytics] Error fetching batch activity:', error);
    return {};
  }

  const stats: Record<string, any> = {};

  activity.forEach((log: any) => {
    const userId = log.user_id;
    
    if (!stats[userId]) {
      stats[userId] = {
        total_questions: 0,
        correct_questions: 0,
        total_time_seconds: 0,
      };
    }

    stats[userId].total_questions += 1;
    if (log.is_correct) {
      stats[userId].correct_questions += 1;
    }
    stats[userId].total_time_seconds += (log.time_spent_seconds || 0);
  });

  // Calculate derivatives
  Object.keys(stats).forEach(id => {
    const s = stats[id];
    s.accuracy = s.total_questions > 0 ? Math.round((s.correct_questions / s.total_questions) * 100) : 0;
    // Points formula: 10 per correct, 2 per attempt
    s.points = (s.correct_questions * 10) + (s.total_questions * 2);
  });

  return stats;
}

/**
 * Formats seconds into a human readable string (e.g. 1h 20m or 45m)
 */
export function formatTimeSpent(seconds: number): string {
  if (!seconds || seconds < 0) return '0m';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
