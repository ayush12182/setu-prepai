import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BatchInfo {
  batchId: string;
  batchName: string;
  mentorName: string;
  totalStudents: number;
  practicingToday: number;
  totalQuestionsAttempted: number;
  mostStudiedTopic: string;
  mostMistakenTopic: string;
  dailyLeaderboard?: { id: string; name: string; questions: number }[];
}

export function useBatchInfo() {
  const { user } = useAuth();
  const [info, setInfo] = useState<BatchInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchBatchInfo();
  }, [user]);

  const fetchBatchInfo = async () => {
    try {
      // 1. Get student's batch
      const { data: map } = await supabase
        .from('student_batch_map')
        .select('batch_id, batches(id, name, teacher_id)')
        .eq('student_id', user!.id)
        .maybeSingle();

      if (!map || !map.batches) { setLoading(false); return; }

      const batch = map.batches as any;
      const batchId = batch.id;
      const batchName = batch.name;
      const teacherId = batch.teacher_id;

      // 2. Parallel: mentor name + total students + batch member ids
      const [mentorRes, countRes, membersRes] = await Promise.all([
        supabase.from('profiles').select('full_name, institution_name').eq('user_id', teacherId).maybeSingle(),
        supabase.from('student_batch_map').select('*', { count: 'exact', head: true }).eq('batch_id', batchId),
        supabase.from('student_batch_map').select('student_id').eq('batch_id', batchId),
      ]);

      const mentorName =
        (mentorRes.data as any)?.institution_name ||
        (mentorRes.data as any)?.full_name ||
        'Your Mentor';
      const totalStudents = countRes.count ?? 0;
      const memberIds = (membersRes.data ?? []).map((m: any) => m.student_id);

      if (memberIds.length === 0) {
        setInfo({ batchId, batchName, mentorName, totalStudents, practicingToday: 0, totalQuestionsAttempted: 0, mostStudiedTopic: '—', mostMistakenTopic: '—' });
        setLoading(false);
        return;
      }

      // 3. Today's date boundary
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // 4. Parallel: practicing today + attempt topics + total count
      const [todayRes, attemptsRes, wrongRes, totalQRes] = await Promise.all([
        // Students with at least one attempt today
        supabase
          .from('question_attempts')
          .select('user_id')
          .in('user_id', memberIds)
          .gte('attempted_at', todayStart.toISOString()),
        // All attempts for topic analysis (last 30 days)
        supabase
          .from('question_attempts')
          .select('question_id, questions(subject)')
          .in('user_id', memberIds)
          .gte('attempted_at', new Date(Date.now() - 30 * 86400000).toISOString())
          .limit(500),
        // Wrong attempts for most mistaken topic
        supabase
          .from('question_attempts')
          .select('question_id, questions(subject)')
          .in('user_id', memberIds)
          .eq('is_correct', false)
          .gte('attempted_at', new Date(Date.now() - 30 * 86400000).toISOString())
          .limit(500),
        // Total questions attempted by the whole batch (all time)
        supabase
          .from('question_attempts')
          .select('*', { count: 'exact', head: true })
          .in('user_id', memberIds),
      ]);

      // Count unique students practicing today and build leaderboard
      const practicingToday = new Set((todayRes.data ?? []).map((r: any) => r.user_id)).size;
      
      const todayCounts: Record<string, number> = {};
      (todayRes.data ?? []).forEach((r: any) => {
        todayCounts[r.user_id] = (todayCounts[r.user_id] || 0) + 1;
      });

      // Create a map of member IDs to names
      const memberNames: Record<string, string> = {};
      (membersRes.data ?? []).forEach((m: any) => {
        memberNames[m.student_id] = (m.profiles as any)?.full_name || 'Student';
      });

      const dailyLeaderboard = Object.entries(todayCounts)
        .map(([id, count]) => ({ id, name: memberNames[id] || 'Student', questions: count }))
        .sort((a, b) => b.questions - a.questions)
        .slice(0, 5); // Top 5

      // Most studied topic
      const subjectCount: Record<string, number> = {};
      for (const row of (attemptsRes.data ?? []) as any[]) {
        const subj = row.questions?.subject;
        if (subj) subjectCount[subj] = (subjectCount[subj] || 0) + 1;
      }
      const mostStudiedTopic = Object.entries(subjectCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

      // Most commonly mistaken topic
      const wrongCount: Record<string, number> = {};
      for (const row of (wrongRes.data ?? []) as any[]) {
        const subj = row.questions?.subject;
        if (subj) wrongCount[subj] = (wrongCount[subj] || 0) + 1;
      }
      const mostMistakenTopic = Object.entries(wrongCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

      const totalQuestionsAttempted = totalQRes.count ?? 0;
      setInfo({ 
        batchId, 
        batchName, 
        mentorName, 
        totalStudents, 
        practicingToday, 
        totalQuestionsAttempted, 
        mostStudiedTopic, 
        mostMistakenTopic,
        dailyLeaderboard
      });
    } catch (err) {
      console.error('[useBatchInfo]', err);
    } finally {
      setLoading(false);
    }
  };

  return { info, loading };
}
