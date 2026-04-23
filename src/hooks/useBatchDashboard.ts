import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  questionsAttempted: number;
  accuracy: number;
  rank: number;
}

export interface TopicInsight {
  subject: string;
  count: number;
  pct: number;          // % of total attempts
  accuracy: number;     // 0–100
}

export interface BatchDashboard {
  // Identity
  batchId: string;
  batchName: string;
  mentorName: string;

  // Counts
  totalStudents: number;
  activeToday: number;
  inactive3Days: number;
  inactive5Days: number;

  // Health score breakdown (0–100 each)
  practiceRate: number;    // % active in last 7 days
  accuracyRate: number;    // avg correctness
  consistencyScore: number;// avg streak behavior
  healthScore: number;     // weighted composite

  // Smart insights
  topTopic: TopicInsight | null;
  needsWork: TopicInsight | null;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
}

export function useBatchDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<BatchDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    load();
  }, [user]);

  const load = async () => {
    try {
      // ── 1. Student's batch ──────────────────────────────────────
      const { data: map } = await supabase
        .from('student_batch_map')
        .select('batch_id, batches(id, name, teacher_id)')
        .eq('student_id', user!.id)
        .maybeSingle();

      if (!map?.batches) { setLoading(false); return; }

      const batch = map.batches as any;
      const batchId: string = batch.id;
      const batchName: string = batch.name;
      const teacherId: string = batch.teacher_id;

      // ── 2. Foundation queries ───────────────────────────────────
      const [mentorRes, membersRes, leaderboardRes] = await Promise.all([
        supabase.from('profiles').select('full_name, institution_name').eq('user_id', teacherId).maybeSingle(),
        supabase.from('student_batch_map').select('student_id').eq('batch_id', batchId),
        supabase
          .from('batch_leaderboard')
          .select('student_id, score, accuracy, questions_attempted, consistency_score, rank')
          .eq('batch_id', batchId)
          .order('rank', { ascending: true })
          .limit(10),
      ]);

      const mentorName: string =
        (mentorRes.data as any)?.institution_name ||
        (mentorRes.data as any)?.full_name ||
        'Your Mentor';

      const memberIds: string[] = (membersRes.data ?? []).map((m: any) => m.student_id);
      const totalStudents = memberIds.length;

      if (totalStudents === 0) {
        setData({ batchId, batchName, mentorName, totalStudents: 0, activeToday: 0, inactive3Days: 0, inactive5Days: 0, practiceRate: 0, accuracyRate: 0, consistencyScore: 0, healthScore: 0, topTopic: null, needsWork: null, leaderboard: [] });
        setLoading(false);
        return;
      }

      // ── 3. Date boundaries ──────────────────────────────────────
      const now = Date.now();
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const day3Ago = new Date(now - 3 * 86400000).toISOString();
      const day5Ago = new Date(now - 5 * 86400000).toISOString();
      const day7Ago = new Date(now - 7 * 86400000).toISOString();
      const day30Ago = new Date(now - 30 * 86400000).toISOString();

      // ── 4. Activity & topic queries ─────────────────────────────
      const [todayRes, week7Res, attemptsRes] = await Promise.all([
        // Who practiced today
        supabase.from('question_attempts').select('user_id').in('user_id', memberIds).gte('attempted_at', todayStart.toISOString()),
        // Who practiced in last 7 days (for practice rate)
        supabase.from('question_attempts').select('user_id').in('user_id', memberIds).gte('attempted_at', day7Ago),
        // All attempts (30 days) with subject + correctness
        supabase.from('question_attempts')
          .select('user_id, is_correct, attempted_at, questions(subject)')
          .in('user_id', memberIds)
          .gte('attempted_at', day30Ago)
          .limit(2000),
      ]);

      const todayActive = new Set((todayRes.data ?? []).map((r: any) => r.user_id));
      const week7Active = new Set((week7Res.data ?? []).map((r: any) => r.user_id));
      const attempts = (attemptsRes.data ?? []) as any[];

      // ── 5. Inactive detection ────────────────────────────────────
      // Students with no attempt in last 3 / 5 days
      const recentActive3 = new Set(
        attempts.filter(a => a.attempted_at >= day3Ago).map(a => a.user_id)
      );
      const recentActive5 = new Set(
        attempts.filter(a => a.attempted_at >= day5Ago).map(a => a.user_id)
      );
      const inactive3Days = memberIds.filter(id => !recentActive3.has(id)).length;
      const inactive5Days = memberIds.filter(id => !recentActive5.has(id)).length;

      // ── 6. Health score components ────────────────────────────────
      const practiceRate = totalStudents > 0 ? Math.round((week7Active.size / totalStudents) * 100) : 0;

      // Accuracy from leaderboard aggregate
      const lbRows = (leaderboardRes.data ?? []) as any[];
      const avgAccuracy = lbRows.length > 0
        ? Math.round(lbRows.reduce((s, r) => s + (r.accuracy ?? 0), 0) / lbRows.length)
        : 0;
      const avgConsistency = lbRows.length > 0
        ? Math.round(lbRows.reduce((s, r) => s + (r.consistency_score ?? 0), 0) / lbRows.length)
        : 0;

      // Weighted: practice 40%, accuracy 35%, consistency 25%
      const healthScore = Math.round(practiceRate * 0.40 + avgAccuracy * 0.35 + Math.min(avgConsistency, 100) * 0.25);

      // ── 7. Topic insights ─────────────────────────────────────────
      const subjectStats: Record<string, { total: number; correct: number }> = {};
      for (const row of attempts) {
        const subj: string = row.questions?.subject;
        if (!subj) continue;
        if (!subjectStats[subj]) subjectStats[subj] = { total: 0, correct: 0 };
        subjectStats[subj].total++;
        if (row.is_correct) subjectStats[subj].correct++;
      }

      const totalAttempts = attempts.length || 1;
      const topicList: TopicInsight[] = Object.entries(subjectStats).map(([subject, s]) => ({
        subject,
        count: s.total,
        pct: Math.round((s.total / totalAttempts) * 100),
        accuracy: Math.round((s.correct / s.total) * 100),
      }));

      const topTopic = topicList.sort((a, b) => b.count - a.count)[0] ?? null;
      const needsWork = topicList.filter(t => t.total >= 5).sort((a, b) => a.accuracy - b.accuracy)[0] ?? null;

      // ── 8. Leaderboard top 3 + names ────────────────────────────
      const top3 = lbRows.slice(0, 3);
      let leaderboard: LeaderboardEntry[] = [];
      if (top3.length > 0) {
        const ids = top3.map((r: any) => r.student_id);
        const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', ids);
        const nameMap: Record<string, string> = {};
        for (const p of (profiles ?? []) as any[]) nameMap[p.user_id] = p.full_name;
        leaderboard = top3.map((r: any, i: number) => ({
          studentId: r.student_id,
          name: nameMap[r.student_id] ?? `Student ${i + 1}`,
          questionsAttempted: r.questions_attempted ?? 0,
          accuracy: Math.round(r.accuracy ?? 0),
          rank: r.rank ?? i + 1,
        }));
      }

      setData({
        batchId, batchName, mentorName,
        totalStudents, activeToday: todayActive.size,
        inactive3Days, inactive5Days,
        practiceRate, accuracyRate: avgAccuracy,
        consistencyScore: avgConsistency,
        healthScore,
        topTopic, needsWork,
        leaderboard,
      });
    } catch (err) {
      console.error('[useBatchDashboard]', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading };
}
