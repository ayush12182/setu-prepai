import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { getAllSubchapters, Subchapter } from '@/data/subchapters';
import {
  Calendar, Target, ChevronRight, Clock, BookOpen,
  Flame, CheckCircle2, Circle, Zap, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DayPlan {
  day: number;
  subject: string;
  subjectId: string;
  chapter: string;
  chapterId: string;
  subchapter: string;
  subchapterId: string;
  task: string;
  difficulty: string;
  isToday: boolean;
  isPast: boolean;
}

const allChapters: (Chapter & { subjectName: string })[] = [
  ...physicsChapters.map(c => ({ ...c, subjectName: 'Physics' })),
  ...chemistryChapters.map(c => ({ ...c, subjectName: 'Chemistry' })),
  ...mathsChapters.map(c => ({ ...c, subjectName: 'Maths' })),
];

const subjectColors: Record<string, string> = {
  Physics: 'bg-blue-500/15 text-blue-700 border-blue-200',
  Chemistry: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
  Maths: 'bg-violet-500/15 text-violet-700 border-violet-200',
};

const subjectDotColors: Record<string, string> = {
  Physics: 'bg-blue-500',
  Chemistry: 'bg-emerald-500',
  Maths: 'bg-violet-500',
};

const generateSchedule = (
  cycleStart: Date,
  completedSubchapters: Set<string>
): DayPlan[] => {
  const allSubs = getAllSubchapters();

  // Prioritize: high-weightage incomplete chapters
  const weightageOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  const incomplete = allSubs.filter(s => !completedSubchapters.has(s.id));
  const pool = incomplete.length > 0 ? incomplete : allSubs;

  const sorted = [...pool].sort((a, b) => {
    const ca = allChapters.find(c => c.id === a.chapterId);
    const cb = allChapters.find(c => c.id === b.chapterId);
    return (weightageOrder[ca?.weightage || 'Low'] || 2) - (weightageOrder[cb?.weightage || 'Low'] || 2);
  });

  // Distribute across 21 days, rotating subjects
  const subjects = ['Physics', 'Chemistry', 'Maths'];
  const bySubject: Record<string, typeof sorted> = {
    Physics: sorted.filter(s => allChapters.find(c => c.id === s.chapterId)?.subjectName === 'Physics'),
    Chemistry: sorted.filter(s => allChapters.find(c => c.id === s.chapterId)?.subjectName === 'Chemistry'),
    Maths: sorted.filter(s => allChapters.find(c => c.id === s.chapterId)?.subjectName === 'Maths'),
  };

  const counters = { Physics: 0, Chemistry: 0, Maths: 0 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plans: DayPlan[] = [];

  for (let day = 1; day <= 21; day++) {
    // Day 7, 14 = revision; Day 21 = Major Test
    if (day === 21) {
      plans.push({
        day,
        subject: 'All',
        subjectId: 'all',
        chapter: 'Major Test',
        chapterId: 'major-test',
        subchapter: '3-Hour Full JEE Simulation',
        subchapterId: 'major-test',
        task: 'Full-length JEE Main test — 90 questions, 180 minutes',
        difficulty: 'Hard',
        isToday: isSameDay(cycleStart, day, today),
        isPast: isPastDay(cycleStart, day, today),
      });
      continue;
    }

    if (day === 7 || day === 14) {
      plans.push({
        day,
        subject: 'All',
        subjectId: 'all',
        chapter: 'Revision Day',
        chapterId: 'revision',
        subchapter: 'Revise Week ' + (day === 7 ? '1' : '2') + ' topics',
        subchapterId: 'revision',
        task: 'Quick quiz + formula review for all topics covered this week',
        difficulty: 'Medium',
        isToday: isSameDay(cycleStart, day, today),
        isPast: isPastDay(cycleStart, day, today),
      });
      continue;
    }

    // Rotate subjects: P, C, M, P, C, M...
    const subjectIdx = (day - 1) % 3;
    const subjectName = subjects[subjectIdx];
    const subPool = bySubject[subjectName];
    const idx = counters[subjectName] % Math.max(subPool.length, 1);
    const sub = subPool[idx];
    counters[subjectName]++;

    if (!sub) continue;

    const chapter = allChapters.find(c => c.id === sub.chapterId);
    if (!chapter) continue;

    plans.push({
      day,
      subject: subjectName,
      subjectId: chapter.subject,
      chapter: chapter.name,
      chapterId: chapter.id,
      subchapter: sub.name,
      subchapterId: sub.id,
      task: sub.jeetuLine || `Focus on ${sub.name}`,
      difficulty: chapter.difficulty,
      isToday: isSameDay(cycleStart, day, today),
      isPast: isPastDay(cycleStart, day, today),
    });
  }

  return plans;
};

function isSameDay(cycleStart: Date, day: number, today: Date): boolean {
  const d = new Date(cycleStart);
  d.setDate(d.getDate() + day - 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
}

function isPastDay(cycleStart: Date, day: number, today: Date): boolean {
  const d = new Date(cycleStart);
  d.setDate(d.getDate() + day - 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

export const TwentyOneDayPlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: activeCycle } = useQuery({
    queryKey: ['active-major-test-cycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('major_test_cycles')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: completedIds } = useQuery({
    queryKey: ['completed-subchapters', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('subchapter_id, correct_answers, total_questions')
        .eq('user_id', user!.id);
      if (!sessions) return new Set<string>();
      const map: Record<string, { c: number; t: number }> = {};
      sessions.forEach(s => {
        if (!map[s.subchapter_id]) map[s.subchapter_id] = { c: 0, t: 0 };
        map[s.subchapter_id].c += s.correct_answers;
        map[s.subchapter_id].t += s.total_questions;
      });
      const done = new Set<string>();
      Object.entries(map).forEach(([id, { c, t }]) => {
        if (t >= 5 || (t > 0 && c / t >= 0.6)) done.add(id);
      });
      return done;
    },
  });

  const cycleStart = activeCycle ? new Date(activeCycle.start_date) : new Date();
  const schedule = useMemo(
    () => generateSchedule(cycleStart, completedIds || new Set()),
    [activeCycle, completedIds]
  );

  const todayIndex = schedule.findIndex(d => d.isToday);
  const currentWeek = todayIndex >= 0 ? Math.floor(todayIndex / 7) : 0;

  // Show current week + peek into next
  const weekStart = currentWeek * 7;
  const visibleDays = schedule.slice(weekStart, weekStart + 7);

  const cycleNumber = activeCycle?.cycle_number || 1;
  const daysCompleted = schedule.filter(d => d.isPast).length;

  return (
    <section className="space-y-6">
      {/* Why 21 Days Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[hsl(213_28%_22%)] to-primary p-8 border border-white/5">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              21-Day Cycle {cycleNumber}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Why 21 Days?
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: Brain,
                title: 'Science-Backed',
                desc: '21 days is the minimum time to build a habit. Consistent daily practice rewires your brain for exam success.',
              },
              {
                icon: Target,
                title: 'Focused Cycles',
                desc: 'Each cycle covers all 3 subjects systematically. No topic left behind, no random studying.',
              },
              {
                icon: Zap,
                title: 'Test → Improve → Repeat',
                desc: 'Every cycle ends with a full JEE simulation. Your weak areas become next cycle\'s focus.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <item.icon className="w-5 h-5 text-accent mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${(daysCompleted / 21) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-white/80">
              {daysCompleted}/21 days
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Week {currentWeek + 1} Schedule
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your personalized daily topics
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => navigate('/major-test')}
          >
            Full Plan
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="space-y-2">
          {visibleDays.map((plan) => (
            <div
              key={plan.day}
              className={cn(
                'flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 cursor-pointer group',
                plan.isToday
                  ? 'bg-accent/10 border border-accent/30 shadow-sm'
                  : plan.isPast
                    ? 'bg-muted/50 opacity-70'
                    : 'hover:bg-secondary/60 border border-transparent'
              )}
              onClick={() => {
                if (plan.subchapterId === 'major-test') navigate('/major-test');
                else if (plan.subchapterId === 'revision') navigate('/revision');
                else navigate(`/subchapter/${plan.subchapterId}`);
              }}
            >
              {/* Day Number */}
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0',
                plan.isToday
                  ? 'bg-accent text-primary'
                  : plan.isPast
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-secondary text-foreground'
              )}>
                {plan.isPast ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : plan.isToday ? (
                  <Flame className="w-5 h-5" />
                ) : (
                  `D${plan.day}`
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm text-foreground truncate">
                    {plan.subchapter}
                  </span>
                  {plan.isToday && (
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-primary">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {plan.chapter}
                </p>
              </div>

              {/* Subject Badge */}
              <div className={cn(
                'shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border',
                subjectColors[plan.subject] || 'bg-muted text-muted-foreground'
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full', subjectDotColors[plan.subject] || 'bg-muted-foreground')} />
                {plan.subject}
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </div>
          ))}
        </div>

        {/* Week Navigation */}
        <div className="flex justify-center gap-2 mt-5">
          {[0, 1, 2].map((week) => (
            <button
              key={week}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                currentWeek === week
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              Week {week + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
