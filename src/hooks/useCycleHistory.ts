import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface WeakChapter {
  chapterId: string;
  subject: string;
  accuracy: number;
  weakConcepts: string[];
}

export interface CycleHistoryEntry {
  id: string;
  cycle_number: number;
  cycle_start_date: string;
  cycle_end_date: string;
  total_questions_attempted: number;
  total_correct: number;
  overall_accuracy: number;
  physics_accuracy: number;
  chemistry_accuracy: number;
  maths_accuracy: number;
  biology_accuracy: number;
  weak_chapters: WeakChapter[];
  strong_chapters: WeakChapter[];
  skipped_chapters: any[];
  major_test_score: number | null;
  major_test_percentile: number | null;
  exam_mode: string;
}

/**
 * Analyzes a student's performance during a cycle to identify weak/strong chapters.
 */
const analyzePerformance = async (userId: string, cycleStartDate: Date, cycleEndDate: Date) => {
  const startISO = cycleStartDate.toISOString();
  const endISO = cycleEndDate.toISOString();

  // Fetch practice sessions within the cycle window
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('subchapter_id, correct_answers, total_questions, total_time_seconds')
    .eq('user_id', userId)
    .gte('started_at', startISO)
    .lte('started_at', endISO);

  // Fetch question attempts within the cycle window
  const { data: attempts } = await supabase
    .from('question_attempts')
    .select('question_id, is_correct, questions(chapter_id, subject, concept_tested)')
    .eq('user_id', userId)
    .gte('attempted_at', startISO)
    .lte('attempted_at', endISO)
    .limit(500);

  // Fetch major test attempt in this cycle
  const { data: majorTest } = await supabase
    .from('major_test_attempts')
    .select('score, max_score, percentile_estimate, physics_correct, physics_incorrect, chemistry_correct, chemistry_incorrect, maths_correct, maths_incorrect')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Aggregate chapter-level stats from question_attempts
  const chapterStats: Record<string, { correct: number; total: number; subject: string; concepts: string[] }> = {};
  const subjectStats: Record<string, { correct: number; total: number }> = {
    physics: { correct: 0, total: 0 },
    chemistry: { correct: 0, total: 0 },
    maths: { correct: 0, total: 0 },
    biology: { correct: 0, total: 0 },
  };

  let totalQ = 0, totalCorrect = 0, totalTime = 0;

  if (attempts) {
    for (const a of attempts) {
      const q = a.questions as any;
      if (!q) continue;
      const key = q.chapter_id;
      const subj = (q.subject || '').toLowerCase();
      if (!chapterStats[key]) {
        chapterStats[key] = { correct: 0, total: 0, subject: q.subject, concepts: [] };
      }
      chapterStats[key].total++;
      totalQ++;
      if (a.is_correct) {
        chapterStats[key].correct++;
        totalCorrect++;
      } else if (q.concept_tested) {
        chapterStats[key].concepts.push(q.concept_tested);
      }
      if (subjectStats[subj]) {
        subjectStats[subj].total++;
        if (a.is_correct) subjectStats[subj].correct++;
      }
    }
  }

  if (sessions) {
    for (const s of sessions) {
      totalTime += s.total_time_seconds;
    }
  }

  // Classify chapters as weak (<60% accuracy) or strong (>=75%)
  const weakChapters: WeakChapter[] = [];
  const strongChapters: WeakChapter[] = [];

  for (const [chapterId, stats] of Object.entries(chapterStats)) {
    if (stats.total < 2) continue;
    const accuracy = Math.round((stats.correct / stats.total) * 100);
    const entry: WeakChapter = {
      chapterId,
      subject: stats.subject,
      accuracy,
      weakConcepts: [...new Set(stats.concepts)].slice(0, 5),
    };
    if (accuracy < 60) weakChapters.push(entry);
    else if (accuracy >= 75) strongChapters.push(entry);
  }

  weakChapters.sort((a, b) => a.accuracy - b.accuracy);
  strongChapters.sort((a, b) => b.accuracy - a.accuracy);

  const safeDiv = (c: number, t: number) => t > 0 ? Math.round((c / t) * 100) : 0;

  return {
    totalQ,
    totalCorrect,
    totalTime,
    overallAccuracy: safeDiv(totalCorrect, totalQ),
    physicsAccuracy: safeDiv(subjectStats.physics.correct, subjectStats.physics.total),
    chemistryAccuracy: safeDiv(subjectStats.chemistry.correct, subjectStats.chemistry.total),
    mathsAccuracy: safeDiv(subjectStats.maths.correct, subjectStats.maths.total),
    biologyAccuracy: safeDiv(subjectStats.biology.correct, subjectStats.biology.total),
    weakChapters,
    strongChapters,
    majorTestScore: majorTest?.score ?? null,
    majorTestMaxScore: majorTest?.max_score ?? 300,
    majorTestPercentile: majorTest?.percentile_estimate ?? null,
  };
};

export const useCycleHistory = () => {
  const { user } = useAuth();
  const { isNeet } = useExamMode();
  const queryClient = useQueryClient();
  const [history, setHistory] = useState<CycleHistoryEntry[]>([]);
  const [latestWeakChapters, setLatestWeakChapters] = useState<WeakChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing cycle history
  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('student_cycle_history')
        .select('*')
        .eq('user_id', user.id)
        .order('cycle_number', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setHistory(data as any);
        // Latest cycle's weak chapters become priority for next cycle
        const latest = data[0];
        setLatestWeakChapters((latest.weak_chapters as unknown as WeakChapter[]) || []);
      }
      setIsLoading(false);
    };
    fetch();
  }, [user]);

  /**
   * Save performance data for a completed cycle and auto-advance to the next one.
   */
  const completeCycleAndAdvance = useCallback(async (
    cycleNumber: number,
    cycleStartDate: Date,
    cycleEndDate: Date
  ) => {
    if (!user) return;

    try {
      // Analyze performance during this cycle
      const perf = await analyzePerformance(user.id, cycleStartDate, cycleEndDate);

      // Upsert cycle history
      const { error } = await supabase.from('student_cycle_history').upsert({
        user_id: user.id,
        cycle_number: cycleNumber,
        cycle_start_date: cycleStartDate.toISOString().split('T')[0],
        cycle_end_date: cycleEndDate.toISOString().split('T')[0],
        total_questions_attempted: perf.totalQ,
        total_correct: perf.totalCorrect,
        overall_accuracy: perf.overallAccuracy,
        total_study_time_seconds: perf.totalTime,
        physics_accuracy: perf.physicsAccuracy,
        chemistry_accuracy: perf.chemistryAccuracy,
        maths_accuracy: perf.mathsAccuracy,
        biology_accuracy: perf.biologyAccuracy,
        weak_chapters: perf.weakChapters as any,
        strong_chapters: perf.strongChapters as any,
        major_test_score: perf.majorTestScore,
        major_test_max_score: perf.majorTestMaxScore,
        major_test_percentile: perf.majorTestPercentile,
        exam_mode: isNeet ? 'neet' : 'jee',
      }, { onConflict: 'user_id,cycle_number' });

      if (error) console.error('Failed to save cycle history:', error);

      // Advance cycle start date
      const nextStart = new Date(cycleEndDate);
      nextStart.setDate(nextStart.getDate() + 1);
      await supabase.auth.updateUser({
        data: { cycle_start_date: nextStart.toISOString() },
      });

      // Update local state
      setLatestWeakChapters(perf.weakChapters);

      // Invalidate queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['completed-subchapters'] });
      await queryClient.invalidateQueries({ queryKey: ['active-major-test-cycle'] });
      await queryClient.invalidateQueries({ queryKey: ['syllabus-progress'] });
      await queryClient.invalidateQueries({ queryKey: ['todays-focus'] });

      toast.success(
        `📊 Cycle ${cycleNumber} saved! ${perf.weakChapters.length} weak areas identified → Cycle ${cycleNumber + 1} will target them.`
      );

      return perf;
    } catch (err) {
      console.error('Cycle completion error:', err);
      toast.error('Failed to save cycle data');
    }
  }, [user, isNeet, queryClient]);

  return {
    history,
    latestWeakChapters,
    isLoading,
    completeCycleAndAdvance,
  };
};
