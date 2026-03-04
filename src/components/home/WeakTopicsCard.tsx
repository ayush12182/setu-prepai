import React from 'react';
import { ChevronRight, TrendingDown, AlertTriangle } from 'lucide-react';
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
  Physics: 'bg-blue-400',
  Chemistry: 'bg-emerald-400',
  Maths: 'bg-violet-400',
  Biology: 'bg-green-400',
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
      const agg: Record<string, { correct: number; total: number }> = {};
      sessions.forEach(s => {
        if (!agg[s.subchapter_id]) agg[s.subchapter_id] = { correct: 0, total: 0 };
        agg[s.subchapter_id].correct += s.correct_answers;
        agg[s.subchapter_id].total += s.total_questions;
      });

      const weak: WeakTopic[] = [];
      Object.entries(agg).forEach(([subId, stats]) => {
        if (stats.total < 3) return;
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        if (accuracy >= 60) return;

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
    <div className="bg-gradient-to-br from-[#0c141d] via-[#1e2a3a] to-[#0c141d] rounded-2xl relative overflow-hidden border border-white/10 shadow-xl">
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/15 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Needs More Practice</h3>
              <p className="text-[10px] text-white/40">Topics below 60% accuracy</p>
            </div>
          </div>
          <span className="text-xs font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
            {weakTopics.length} weak
          </span>
        </div>

        {/* Topic list */}
        <div className="divide-y divide-white/5">
          {weakTopics.map((topic) => (
            <button
              key={topic.subchapterId}
              onClick={() => navigate(`/subchapter/${topic.subchapterId}`)}
              className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left group"
            >
              <div className={cn("w-2 h-2 rounded-full shrink-0", subjectDots[topic.subject] || 'bg-white/40')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate group-hover:text-[hsl(35_100%_83%)] transition-colors">
                  {topic.subchapterName}
                </p>
                <p className="text-[10px] text-white/40">
                  {topic.subject} • {topic.chapterName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={cn(
                  "text-sm font-bold",
                  topic.accuracy < 30 ? "text-red-400" : "text-amber-400"
                )}>
                  {topic.accuracy}%
                </span>
                <p className="text-[10px] text-white/40">{topic.totalAttempts} Qs</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-[hsl(35_100%_83%)] hover:text-[hsl(35_100%_90%)] hover:bg-white/5"
            onClick={() => navigate('/analytics')}
          >
            View Full Analysis →
          </Button>
        </div>
      </div>
    </div>
  );
};
