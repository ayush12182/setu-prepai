import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { getAllSubchapters } from '@/data/subchapters';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/neetSyllabus';
import { getAllCuetChapters } from '@/data/cuetSyllabus';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewCards } from '@/components/analytics/OverviewCards';
import { SubjectPerformance } from '@/components/analytics/SubjectPerformance';
import { ChapterBreakdown, type ChapterStat } from '@/components/analytics/ChapterBreakdown';
import { MistakeAnalysis, type MistakePattern } from '@/components/analytics/MistakeAnalysis';
import { TestHistory, type TestRecord } from '@/components/analytics/TestHistory';
import { PracticeTimeline, type DayActivity } from '@/components/analytics/PracticeTimeline';
import { AccuracyPieChart } from '@/components/analytics/AccuracyPieChart';
import { useStreak } from '@/hooks/useStreak';
import { subDays, isSameDay, parseISO } from 'date-fns';

interface SubjectScore {
  name: string;
  score: number;
  correct: number;
  total: number;
  color: string;
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { isNeet, isCuet } = useExamMode();
  const { streak } = useStreak();

  const [isLoading, setIsLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [questionsDone, setQuestionsDone] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalIncorrect, setTotalIncorrect] = useState(0);
  const [studyTimeHours, setStudyTimeHours] = useState(0);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [chapterStats, setChapterStats] = useState<ChapterStat[]>([]);
  const [weakChapters, setWeakChapters] = useState<{ name: string; accuracy: number; subject: string }[]>([]);
  const [mistakePatterns, setMistakePatterns] = useState<MistakePattern[]>([]);
  const [testHistory, setTestHistory] = useState<TestRecord[]>([]);
  const [last30Days, setLast30Days] = useState<DayActivity[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) { setIsLoading(false); return; }

      try {
        // Parallel data fetching
        const [statsRes, sessionsRes, testsRes, attemptsRes] = await Promise.all([
          supabase.from('user_practice_stats')
            .select('total_correct, total_questions_solved, total_time_seconds')
            .eq('user_id', user.id).maybeSingle(),
          supabase.from('practice_sessions')
            .select('subchapter_id, correct_answers, total_questions, total_time_seconds, started_at')
            .eq('user_id', user.id),
          supabase.from('major_test_attempts')
            .select('id, score, max_score, physics_score, chemistry_score, maths_score, total_time_seconds, completed_at, percentile_estimate, created_at')
            .eq('user_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }),
          supabase.from('question_attempts')
            .select('question_id, is_correct, attempted_at, questions(chapter_id, subject, concept_tested)')
            .eq('user_id', user.id).order('attempted_at', { ascending: false }).limit(1000),
        ]);

        const stats = statsRes.data;
        const sessions = sessionsRes.data || [];
        const tests = testsRes.data || [];
        const attempts = attemptsRes.data || [];

        const allSubchapters = getAllSubchapters();
        const allChapters = isCuet
          ? getAllCuetChapters()
          : isNeet
            ? [...neetPhysicsChapters, ...neetChemistryChapters, ...neetBiologyChapters]
            : [...physicsChapters, ...chemistryChapters, ...mathsChapters];

        // ═══ OVERVIEW ═══
        const tCorrect = stats?.total_correct || 0;
        const tQ = stats?.total_questions_solved || 0;
        const tTimeSec = stats?.total_time_seconds || 0;
        const testTimeSec = tests.reduce((sum, t) => sum + (t.total_time_seconds || 0), 0);
        setTotalCorrect(tCorrect);
        setTotalIncorrect(tQ - tCorrect);
        setQuestionsDone(tQ);
        setOverallScore(tQ > 0 ? Math.round((tCorrect / tQ) * 100) : 0);
        setStudyTimeHours(Math.round((tTimeSec + testTimeSec) / 3600));

        // ═══ CHAPTER-LEVEL STATS ═══
        const chMap: Record<string, { correct: number; total: number; name: string; subject: string; time: number; sessions: number }> = {};

        sessions.forEach(s => {
          const sub = allSubchapters.find(sc => sc.id === s.subchapter_id);
          if (!sub) return;
          const chapter = allChapters.find(c => c.id === sub.chapterId);
          if (!chapter) return;
          if (!chMap[chapter.id]) {
            chMap[chapter.id] = { correct: 0, total: 0, name: chapter.name, subject: chapter.subject || '', time: 0, sessions: 0 };
          }
          chMap[chapter.id].correct += s.correct_answers;
          chMap[chapter.id].total += s.total_questions;
          chMap[chapter.id].time += s.total_time_seconds;
          chMap[chapter.id].sessions += 1;
        });

        const chapterList: ChapterStat[] = Object.entries(chMap)
          .filter(([, v]) => v.total > 0)
          .map(([id, v]) => ({
            id,
            name: v.name,
            subject: v.subject,
            correct: v.correct,
            total: v.total,
            accuracy: Math.round((v.correct / v.total) * 100),
            timeSpent: v.time,
            sessions: v.sessions,
          }));
        setChapterStats(chapterList);

        // Weak chapters
        const weak = chapterList.filter(ch => ch.total >= 3 && ch.accuracy < 60)
          .sort((a, b) => a.accuracy - b.accuracy);
        setWeakChapters(weak.map(ch => ({ name: ch.name, accuracy: ch.accuracy, subject: ch.subject })));

        // ═══ SUBJECT SCORES ═══
        const subjectKeys = isCuet
          ? ['english', 'economics', 'general_test']
          : isNeet ? ['physics', 'chemistry', 'biology'] : ['physics', 'chemistry', 'maths'];
        const subjectAgg: Record<string, { correct: number; total: number }> = {};
        subjectKeys.forEach(k => { subjectAgg[k] = { correct: 0, total: 0 }; });

        Object.values(chMap).forEach(ch => {
          if (subjectAgg[ch.subject] !== undefined) {
            subjectAgg[ch.subject].correct += ch.correct;
            subjectAgg[ch.subject].total += ch.total;
          }
        });

        const makeScore = (key: string, label: string, color: string): SubjectScore => ({
          name: label,
          score: subjectAgg[key]?.total > 0 ? Math.round((subjectAgg[key].correct / subjectAgg[key].total) * 100) : 0,
          correct: subjectAgg[key]?.correct || 0,
          total: subjectAgg[key]?.total || 0,
          color,
        });

        const scores = isCuet
          ? [makeScore('english', 'English', 'bg-physics'), makeScore('economics', 'Economics', 'bg-chemistry'), makeScore('general_test', 'General Test', 'bg-setu-saffron')]
          : isNeet
            ? [makeScore('physics', 'Physics', 'bg-physics'), makeScore('chemistry', 'Chemistry', 'bg-chemistry'), makeScore('biology', 'Biology', 'bg-setu-success')]
            : [makeScore('physics', 'Physics', 'bg-physics'), makeScore('chemistry', 'Chemistry', 'bg-chemistry'), makeScore('maths', 'Mathematics', 'bg-maths')];
        setSubjectScores(scores);

        // ═══ MISTAKE PATTERNS from question_attempts ═══
        const conceptMistakes: Record<string, { concept: string; chapter: string; subject: string; wrong: number; total: number }> = {};

        attempts.forEach(a => {
          const q = a.questions as any;
          if (!q || !q.concept_tested) return;
          const key = `${q.concept_tested}__${q.chapter_id}`;
          if (!conceptMistakes[key]) {
            const ch = allChapters.find(c => c.id === q.chapter_id);
            conceptMistakes[key] = { concept: q.concept_tested, chapter: ch?.name || q.chapter_id, subject: q.subject, wrong: 0, total: 0 };
          }
          conceptMistakes[key].total++;
          if (!a.is_correct) conceptMistakes[key].wrong++;
        });

        const patterns: MistakePattern[] = Object.values(conceptMistakes)
          .filter(m => m.wrong >= 2)
          .map(m => ({
            concept: m.concept,
            chapter: m.chapter,
            subject: m.subject,
            wrongCount: m.wrong,
            totalAttempts: m.total,
            accuracy: Math.round(((m.total - m.wrong) / m.total) * 100),
          }))
          .sort((a, b) => b.wrongCount - a.wrongCount);
        setMistakePatterns(patterns);

        // ═══ TEST HISTORY ═══
        const testRecords: TestRecord[] = tests.map(t => ({
          id: t.id,
          date: t.completed_at || t.created_at,
          score: t.score,
          maxScore: t.max_score,
          physicsScore: t.physics_score,
          chemistryScore: t.chemistry_score,
          mathsScore: t.maths_score,
          timeSeconds: t.total_time_seconds,
          percentile: t.percentile_estimate,
        }));
        setTestHistory(testRecords);

        // ═══ 30-DAY ACTIVITY ═══
        const today = new Date();
        const dayMap: Record<string, DayActivity> = {};
        attempts.forEach(a => {
          const d = parseISO(a.attempted_at);
          const dayKey = d.toDateString();
          if (!dayMap[dayKey]) dayMap[dayKey] = { date: d, questions: 0, correct: 0 };
          dayMap[dayKey].questions++;
          if (a.is_correct) dayMap[dayKey].correct++;
        });
        // Also include sessions
        sessions.forEach(s => {
          const d = parseISO(s.started_at);
          const dayKey = d.toDateString();
          // sessions already counted via attempts, skip double-count
        });
        setLast30Days(Object.values(dayMap));

      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [user, isNeet, isCuet]);

  if (isLoading) {
    return (
      <MainLayout title="Analytics">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            Your Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into your preparation — mistakes, strengths, and improvement areas
          </p>
        </div>

        {/* Overview */}
        <OverviewCards
          overallScore={overallScore}
          questionsDone={questionsDone}
          studyTimeHours={studyTimeHours}
          weakChapters={weakChapters.length}
          totalCorrect={totalCorrect}
          totalIncorrect={totalIncorrect}
        />

        {/* Accuracy Pie Chart */}
        <AccuracyPieChart
          totalCorrect={totalCorrect}
          totalIncorrect={totalIncorrect}
          subjectScores={subjectScores}
        />

        {/* 30-Day Activity Timeline */}
        <PracticeTimeline last30Days={last30Days} streak={streak} />

        {/* Tabbed Deep Analysis */}
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="w-full justify-start bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="subjects" className="text-sm">Subjects</TabsTrigger>
            <TabsTrigger value="chapters" className="text-sm">Chapters</TabsTrigger>
            <TabsTrigger value="mistakes" className="text-sm">Mistakes</TabsTrigger>
            <TabsTrigger value="tests" className="text-sm">Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="mt-4">
            <SubjectPerformance subjectScores={subjectScores} />
          </TabsContent>

          <TabsContent value="chapters" className="mt-4">
            <ChapterBreakdown chapters={chapterStats} />
          </TabsContent>

          <TabsContent value="mistakes" className="mt-4">
            <MistakeAnalysis patterns={mistakePatterns} weakChapters={weakChapters} />
          </TabsContent>

          <TabsContent value="tests" className="mt-4">
            <TestHistory tests={testHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
