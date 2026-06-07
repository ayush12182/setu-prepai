import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentStats {
  accuracy: number;
  totalSolved: number;
  streak: number;
  todayDone: number;
  weakTopic?: string;
  lastActivityTopic?: string;
  loading: boolean;
}

export const useStudentStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    accuracy: 0,
    totalSolved: 0,
    streak: 0,
    todayDone: 0,
    loading: true
  });

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStats(prev => ({ ...prev, loading: true }));

      // 1. Total Accuracy & Solved from user_practice_stats
      const { data: totals } = await supabase
        .from('user_practice_stats')
        .select('total_questions_solved, total_correct')
        .eq('user_id', user.id)
        .maybeSingle();

      // 2. Today's count & Streak from session_participants
      // We only need the dates and accuracy for streak/today info
      const { data: sessions } = await supabase
        .from('session_participants')
        .select('submitted_at, status')
        .eq('student_id', user.id)
        .eq('status', 'SUBMITTED')
        .order('submitted_at', { ascending: false })
        .limit(100);

      let accuracy = 0;
      let totalSolved = 0;
      if (totals) {
        totalSolved = totals.total_questions_solved || 0;
        accuracy = totalSolved > 0 
          ? Math.round(((totals.total_correct || 0) / totalSolved) * 100) 
          : 0;
      }

      let todayDone = 0;
      let streak = 0;
      
      if (sessions && sessions.length > 0) {
        const today = new Date().toDateString();
        todayDone = sessions.filter(s => s.submitted_at && new Date(s.submitted_at).toDateString() === today).length;
        
        // Compute streak
        const uniqueDates = Array.from(new Set(
          sessions
            .filter(s => s.submitted_at)
            .map(s => new Date(s.submitted_at!).toDateString())
        ));

        if (uniqueDates.length > 0) {
          const hasToday = uniqueDates[0] === today;
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          const hasYesterday = uniqueDates.some(d => d === yesterday);

          if (hasToday || hasYesterday) {
            streak = 1;
            const current = hasToday ? new Date() : new Date(Date.now() - 86400000);
            
            for (let i = 1; i < 30; i++) {
              const prevDate = new Date(current.getTime() - i * 86400000).toDateString();
              if (uniqueDates.includes(prevDate)) {
                streak++;
              } else {
                break;
              }
            }
          }
        }
      }

      setStats({
        accuracy,
        totalSolved,
        streak,
        todayDone,
        weakTopic: undefined,
        lastActivityTopic: undefined,
        loading: true
      });

      // 3. Fetch most recent report for weak topic / context
      const { data: latestReport } = await supabase
        .from('practice_reports')
        .select('chapter, weak_topics')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setStats({
        accuracy,
        totalSolved,
        streak,
        todayDone,
        weakTopic: latestReport?.weak_topics?.[0],
        lastActivityTopic: latestReport?.chapter,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching student stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refreshStats: fetchStats };
};
