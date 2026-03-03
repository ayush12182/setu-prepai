import React from 'react';
import { AlertTriangle, ChevronRight, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getAllSubchapters } from '@/data/subchapters';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { neetBiologyChapters, neetChemistryChapters, neetPhysicsChapters } from '@/data/neetSyllabus';
import { useExamMode } from '@/contexts/ExamModeContext';
import { cn } from '@/lib/utils';

interface WeakTopic {
  subchapterId: string;
  subchapterName: string;
  chapterName: string;
  subject: string;
  accuracy: number;
  totalAttempts: number;
}

const subjectDots: Record<string, string> = {
  Physics: 'bg-blue-500',
  Chemistry: 'bg-emerald-500',
  Maths: 'bg-violet-500',
  Biology: 'bg-green-500',
};

export const WeakTopicsCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNeet } = useExamMode();

  const { data: weakTopics = [] } = useQuery({
    queryKey: ['weak-topics', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('subchapter_id, correct_answers, total_questions')
        .eq('user_id', user!.id);

      if (!sessions || sessions.length === 0) return [];

      const allChapters: (Chapter & { subjectName: string })[] = [
        ...physicsChapters.map(c => ({ ...c, subjectName: 'Physics' })),
        ...chemistryChapters.map(c => ({ ...c, subjectName: 'Chemistry' })),
        ...(isNeet
          ? [
              ...neetBiologyChapters.map(c => ({ ...c, subjectName: 'Biology' })),
              ...neetPhysicsChapters.map(c => ({ ...c, subjectName: 'Physics' })),
              ...neetChemistryChapters.map(c => ({ ...c, subjectName: 'Chemistry' })),
            ]
          : mathsChapters.map(c => ({ ...c, subjectName: 'Maths' }))),
      ];

      const allSubs = getAllSubchapters();

      // Aggregate by subchapter
      const agg: Record<string, { correct: number; total: number }> = {};
      sessions.forEach(s => {
        if (!agg[s.subchapter_id]) agg[s.subchapter_id] = { correct: 0, total: 0 };
        agg[s.subchapter_id].correct += s.correct_answers;
        agg[s.subchapter_id].total += s.total_questions;
      });

      const weak: WeakTopic[] = [];
      Object.entries(agg).forEach(([subId, stats]) => {
        if (stats.total < 3) return; // need minimum attempts
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        if (accuracy >= 60) return; // not weak

        const sub = allSubs.find(s => s.id === subId);
        const chapter = allChapters.find(c => c.id === sub?.chapterId);
        if (!sub || !chapter) return;

        weak.push({
          subchapterId: sub.id,
          subchapterName: sub.name,
          chapterName: chapter.name,
          subject: chapter.subjectName,
          accuracy,
          totalAttempts: stats.total,
        });
      });

      return weak.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
    },
  });

  if (weakTopics.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Needs More Practice</h3>
            <p className="text-[10px] text-muted-foreground">Topics below 60% accuracy</p>
          </div>
        </div>
        <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
          {weakTopics.length} weak
        </span>
      </div>

      <div className="divide-y divide-border">
        {weakTopics.map((topic) => (
          <button
            key={topic.subchapterId}
            onClick={() => navigate(`/subchapter/${topic.subchapterId}`)}
            className="w-full px-5 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left group"
          >
            <div className={cn("w-2 h-2 rounded-full shrink-0", subjectDots[topic.subject] || 'bg-muted-foreground')} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                {topic.subchapterName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {topic.subject} • {topic.chapterName}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className={cn(
                "text-sm font-bold",
                topic.accuracy < 30 ? "text-destructive" : "text-amber-500"
              )}>
                {topic.accuracy}%
              </span>
              <p className="text-[10px] text-muted-foreground">{topic.totalAttempts} Qs</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-accent hover:text-accent"
          onClick={() => navigate('/analytics')}
        >
          View Full Analysis →
        </Button>
      </div>
    </div>
  );
};
