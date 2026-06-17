import { supabase } from '@/integrations/supabase/client';

export interface RealChapterStat {
  name: string;
  accuracy: number;
  attempts: number;
  subject: string;
}

export interface RealSubjectStat {
  name: string;
  accuracy: number;
  totalAttempted: number;
  chapters: RealChapterStat[];
}

export interface RealAnalyticsData {
  totalAttempted: number;
  overallAccuracy: number;
  reflectionRate: number;
  subjects: RealSubjectStat[];
  recentAttempts: any[];
  isReliable: boolean; // true when >= 20 attempts exist
  mistakeProfile: {
    conceptual: number;
    silly: number;
    guess: number;
    calculation: number;
  };
}

export const MINIMUM_RELIABLE_ATTEMPTS = 20;

/**
 * Fetches real analytics data from Supabase for a given user.
 * Falls back to structured empty state — never fabricates numbers.
 */
export async function fetchRealAnalytics(userId: string): Promise<RealAnalyticsData> {
  const empty: RealAnalyticsData = {
    totalAttempted: 0,
    overallAccuracy: 0,
    reflectionRate: 0,
    subjects: [],
    recentAttempts: [],
    isReliable: false,
    mistakeProfile: { conceptual: 0, silly: 0, guess: 0, calculation: 0 },
  };

  try {
    // 1. Fetch all MCQ attempts with question metadata
    const { data: attempts, error } = await (supabase
      .from('user_mcq_attempts' as any)
      .select('*, questions(topic, subject, chapter)')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(500) as any);

    if (error || !attempts || attempts.length === 0) {
      return empty;
    }

    const totalAttempted = attempts.length;
    const correctAttempts = attempts.filter((a: any) => a.is_correct).length;
    const overallAccuracy = totalAttempted > 0
      ? Math.round((correctAttempts / totalAttempted) * 100)
      : 0;

    // 2. Reflection rate: of wrong answers, how many were self-diagnosed?
    const wrongAttempts = attempts.filter((a: any) => !a.is_correct);
    const diagnosedAttempts = wrongAttempts.filter(
      (a: any) => !a.mistake_skipped && a.user_selected_mistake
    );
    const reflectionRate = wrongAttempts.length > 0
      ? Math.round((diagnosedAttempts.length / wrongAttempts.length) * 100)
      : 0;

    // 3. Mistake type breakdown
    const mistakeCounts = { conceptual: 0, silly: 0, guess: 0, calculation: 0 };
    diagnosedAttempts.forEach((a: any) => {
      const type = (a.user_selected_mistake || '').toLowerCase();
      if (type.includes('concept')) mistakeCounts.conceptual++;
      else if (type.includes('silly') || type.includes('careless')) mistakeCounts.silly++;
      else if (type.includes('guess')) mistakeCounts.guess++;
      else if (type.includes('calc')) mistakeCounts.calculation++;
      else mistakeCounts.conceptual++; // default
    });
    const totalMistakes = Object.values(mistakeCounts).reduce((a, b) => a + b, 0);
    const mistakeProfile = {
      conceptual: totalMistakes > 0 ? Math.round((mistakeCounts.conceptual / totalMistakes) * 100) : 0,
      silly: totalMistakes > 0 ? Math.round((mistakeCounts.silly / totalMistakes) * 100) : 0,
      guess: totalMistakes > 0 ? Math.round((mistakeCounts.guess / totalMistakes) * 100) : 0,
      calculation: totalMistakes > 0 ? Math.round((mistakeCounts.calculation / totalMistakes) * 100) : 0,
    };

    // 4. Group by subject → chapter
    const subjectMap: Record<string, Record<string, { correct: number; total: number }>> = {};
    attempts.forEach((a: any) => {
      const subject = a.questions?.subject || 'Unknown';
      const chapter = a.questions?.chapter || a.questions?.topic || 'General';
      if (!subjectMap[subject]) subjectMap[subject] = {};
      if (!subjectMap[subject][chapter]) subjectMap[subject][chapter] = { correct: 0, total: 0 };
      subjectMap[subject][chapter].total++;
      if (a.is_correct) subjectMap[subject][chapter].correct++;
    });

    const subjects: RealSubjectStat[] = Object.entries(subjectMap).map(([subjectName, chapters]) => {
      const chapterList: RealChapterStat[] = Object.entries(chapters).map(([chName, stats]) => ({
        name: chName,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        attempts: stats.total,
        subject: subjectName,
      }));

      const subjectTotal = chapterList.reduce((s, c) => s + c.attempts, 0);
      const subjectCorrect = chapterList.reduce((s, c) => s + Math.round(c.accuracy * c.attempts / 100), 0);

      return {
        name: subjectName,
        accuracy: subjectTotal > 0 ? Math.round((subjectCorrect / subjectTotal) * 100) : 0,
        totalAttempted: subjectTotal,
        chapters: chapterList.sort((a, b) => a.accuracy - b.accuracy), // worst first
      };
    });

    return {
      totalAttempted,
      overallAccuracy,
      reflectionRate,
      subjects,
      recentAttempts: attempts.slice(0, 10),
      isReliable: totalAttempted >= MINIMUM_RELIABLE_ATTEMPTS,
      mistakeProfile,
    };
  } catch (err) {
    console.error('[fetchRealAnalytics] Error:', err);
    return empty;
  }
}

/**
 * Fetches real study momentum from session data.
 * Momentum = 40% consistency + 30% questions done + 20% revision + 10% tests
 */
export async function fetchStudyMomentum(userId: string): Promise<{
  score: number;
  streak: number;
  consistency: number;
  questionsThisWeek: number;
}> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions } = await supabase
      .from('session_participants')
      .select('submitted_at')
      .eq('student_id', userId)
      .eq('status', 'SUBMITTED')
      .gte('submitted_at', sevenDaysAgo);

    const { data: attempts } = await (supabase
      .from('user_mcq_attempts' as any)
      .select('attempted_at')
      .eq('user_id', userId)
      .gte('attempted_at', sevenDaysAgo) as any);

    const activeDays = new Set(
      (sessions || []).map((s: any) => new Date(s.submitted_at).toDateString())
    ).size;

    const questionsThisWeek = (attempts || []).length;
    const consistency = Math.min(100, Math.round((activeDays / 7) * 100));
    const practiceFactor = Math.min(100, Math.round((questionsThisWeek / 50) * 100)); // 50 = weekly target

    // Streak calculation
    let streak = 0;
    const uniqueDates = Array.from(new Set(
      (sessions || []).map((s: any) => new Date(s.submitted_at).toDateString())
    )).sort().reverse();

    if (uniqueDates.length > 0) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const expected = new Date(Date.now() - i * 86400000).toDateString();
          if (uniqueDates[i] === expected) streak++;
          else break;
        }
      }
    }

    // Momentum score: 40% consistency + 30% practice + 20% revision(approx) + 10% streak factor
    const score = Math.round(
      0.4 * consistency +
      0.3 * practiceFactor +
      0.2 * Math.min(100, activeDays * 15) +
      0.1 * Math.min(100, streak * 10)
    );

    return { score: Math.min(100, score), streak, consistency, questionsThisWeek };
  } catch {
    return { score: 0, streak: 0, consistency: 0, questionsThisWeek: 0 };
  }
}
