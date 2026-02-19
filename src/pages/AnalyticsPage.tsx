import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TrendingUp, Target, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useSyllabusProgress } from '@/hooks/useSyllabusProgress';
import { getAllSubchapters } from '@/data/subchapters';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/neetSyllabus';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  overallScore: number;
  questionsDone: number;
  studyTimeHours: number;
  weakChapters: number;
  subjectScores: { name: string; score: number; color: string }[];
  focusAreas: { name: string; accuracy: number }[];
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { isNeet } = useExamMode();
  const { progress } = useSyllabusProgress();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) { setIsLoading(false); return; }

      try {
        // Fetch practice stats
        const { data: stats } = await supabase
          .from('user_practice_stats')
          .select('total_correct, total_questions_solved, total_time_seconds')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch practice sessions for per-subject & per-chapter breakdown
        const { data: sessions } = await supabase
          .from('practice_sessions')
          .select('subchapter_id, correct_answers, total_questions, total_time_seconds')
          .eq('user_id', user.id);

        // Fetch major test attempts
        const { data: tests } = await supabase
          .from('major_test_attempts')
          .select('score, max_score, physics_score, chemistry_score, maths_score, total_time_seconds')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        const allSubchapters = getAllSubchapters();
        const allChapters = isNeet
          ? [...neetPhysicsChapters, ...neetChemistryChapters, ...neetBiologyChapters]
          : [...physicsChapters, ...chemistryChapters, ...mathsChapters];

        // Build chapter-level accuracy from sessions
        const chapterStats: Record<string, { correct: number; total: number; name: string; subject: string }> = {};

        (sessions || []).forEach(s => {
          const sub = allSubchapters.find(sc => sc.id === s.subchapter_id);
          if (!sub) return;
          const chapter = allChapters.find(c => c.id === sub.chapterId);
          if (!chapter) return;
          if (!chapterStats[chapter.id]) {
            chapterStats[chapter.id] = { correct: 0, total: 0, name: chapter.name, subject: chapter.subject || '' };
          }
          chapterStats[chapter.id].correct += s.correct_answers;
          chapterStats[chapter.id].total += s.total_questions;
        });

        // Subject scores from practice sessions
        const thirdSubject = isNeet ? 'biology' : 'maths';
        const subjectAgg: Record<string, { correct: number; total: number }> = {
          physics: { correct: 0, total: 0 },
          chemistry: { correct: 0, total: 0 },
          [thirdSubject]: { correct: 0, total: 0 },
        };

        Object.values(chapterStats).forEach(ch => {
          const subj = ch.subject || thirdSubject;
          if (subjectAgg[subj] !== undefined) {
            subjectAgg[subj].correct += ch.correct;
            subjectAgg[subj].total += ch.total;
          }
        });

        const subjectScores = isNeet
          ? [
            { name: 'Physics', score: subjectAgg.physics.total > 0 ? Math.round((subjectAgg.physics.correct / subjectAgg.physics.total) * 100) : 0, color: 'bg-physics' },
            { name: 'Chemistry', score: subjectAgg.chemistry.total > 0 ? Math.round((subjectAgg.chemistry.correct / subjectAgg.chemistry.total) * 100) : 0, color: 'bg-chemistry' },
            { name: 'Biology', score: subjectAgg.biology?.total > 0 ? Math.round((subjectAgg.biology.correct / subjectAgg.biology.total) * 100) : 0, color: 'bg-green-500' },
          ]
          : [
            { name: 'Physics', score: subjectAgg.physics.total > 0 ? Math.round((subjectAgg.physics.correct / subjectAgg.physics.total) * 100) : 0, color: 'bg-physics' },
            { name: 'Chemistry', score: subjectAgg.chemistry.total > 0 ? Math.round((subjectAgg.chemistry.correct / subjectAgg.chemistry.total) * 100) : 0, color: 'bg-chemistry' },
            { name: 'Mathematics', score: subjectAgg.maths?.total > 0 ? Math.round((subjectAgg.maths.correct / subjectAgg.maths.total) * 100) : 0, color: 'bg-maths' },
          ];

        // Weak chapters: < 60% accuracy with at least some attempts
        const weakChaptersList = Object.values(chapterStats)
          .filter(ch => ch.total >= 3 && (ch.correct / ch.total) < 0.6)
          .sort((a, b) => (a.correct / a.total) - (b.correct / b.total));

        const focusAreas = weakChaptersList.slice(0, 5).map(ch => ({
          name: ch.name,
          accuracy: Math.round((ch.correct / ch.total) * 100),
        }));

        const totalCorrect = stats?.total_correct || 0;
        const totalQ = stats?.total_questions_solved || 0;
        const totalTimeSec = stats?.total_time_seconds || 0;
        const testTimeSec = (tests || []).reduce((sum, t) => sum + (t.total_time_seconds || 0), 0);

        setData({
          overallScore: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
          questionsDone: totalQ,
          studyTimeHours: Math.round((totalTimeSec + testTimeSec) / 3600),
          weakChapters: weakChaptersList.length,
          subjectScores,
          focusAreas,
        });
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout title="Analytics">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  const d = data || { overallScore: 0, questionsDone: 0, studyTimeHours: 0, weakChapters: 0, subjectScores: [], focusAreas: [] };

  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Your Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your progress and identify weak areas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <TrendingUp className="w-8 h-8 text-setu-success mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{d.overallScore}%</p>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <Target className="w-8 h-8 text-physics mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{d.questionsDone}</p>
            <p className="text-sm text-muted-foreground">Questions Done</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <Clock className="w-8 h-8 text-setu-saffron mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{d.studyTimeHours}h</p>
            <p className="text-sm text-muted-foreground">Study Time</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <AlertTriangle className="w-8 h-8 text-setu-warning mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{d.weakChapters}</p>
            <p className="text-sm text-muted-foreground">Weak Chapters</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Subject-wise Performance</h3>
          <div className="space-y-4">
            {d.subjectScores.map((subject) => (
              <div key={subject.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{subject.name}</span>
                  <span className="text-sm text-muted-foreground">{subject.score}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subject.color} rounded-full transition-all duration-500`}
                    style={{ width: `${subject.score}%` }}
                  />
                </div>
              </div>
            ))}
            {d.subjectScores.every(s => s.score === 0) && (
              <p className="text-sm text-muted-foreground text-center py-2">Practice questions to see your subject-wise performance here.</p>
            )}
          </div>
        </div>

        <div className="bg-setu-warning/10 border border-setu-warning/30 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-setu-warning" />
            Focus Areas
          </h3>
          {d.focusAreas.length > 0 ? (
            <ul className="space-y-2">
              {d.focusAreas.map((area) => (
                <li key={area.name} className="text-sm">• {area.name} - {area.accuracy}% accuracy</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Complete more practice sessions to identify your weak areas.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
