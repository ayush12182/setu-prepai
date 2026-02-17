import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { getAllSubchapters } from '@/data/subchapters';
import {
  Calendar, Target, ChevronRight, Clock,
  Flame, CheckCircle2, Zap, Brain, Video, ArrowRight, Quote, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const jeetuQuotes = {
  english: [
    "Success is not about being the smartest — it's about being the most consistent.",
    "Don't study to score marks. Study to understand. Marks will follow.",
    "The difference between toppers and average students? Toppers revise. Again and again.",
    "Fear of failure is normal. But letting it stop you? That's the real failure.",
    "One chapter a day, one concept at a time. That's how JEE is cracked.",
    "Your competition is not others. It's the version of you that gave up yesterday.",
    "Shortcuts don't work in JEE. Honest effort does. Always.",
  ],
  hinglish: [
    "Success smart hone se nahi aata — consistent hone se aata hai.",
    "Marks ke liye mat padho. Samajhne ke liye padho. Marks khud aa jayenge.",
    "Toppers aur average students mein fark? Toppers revise karte hain. Baar baar.",
    "Failure ka darr normal hai. Par usse rukna? Yeh asli failure hai.",
    "Ek chapter roz, ek concept at a time. JEE aise crack hota hai.",
    "Tumhara competition dusre nahi hain. Wo tum ho jo kal haar maan gaye the.",
    "JEE mein shortcuts nahi chalte. Honest effort chalta hai. Hamesha.",
  ],
};

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
  const weightageOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  const incomplete = allSubs.filter(s => !completedSubchapters.has(s.id));
  const pool = incomplete.length > 0 ? incomplete : allSubs;

  const sorted = [...pool].sort((a, b) => {
    const ca = allChapters.find(c => c.id === a.chapterId);
    const cb = allChapters.find(c => c.id === b.chapterId);
    return (weightageOrder[ca?.weightage || 'Low'] || 2) - (weightageOrder[cb?.weightage || 'Low'] || 2);
  });

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
    if (day === 21) {
      plans.push({
        day, subject: 'All', subjectId: 'all',
        chapter: 'Major Test', chapterId: 'major-test',
        subchapter: '3-Hour Full JEE Simulation', subchapterId: 'major-test',
        task: 'Full-length JEE Main test — 90 questions, 180 minutes',
        difficulty: 'Hard',
        isToday: isSameDay(cycleStart, day, today),
        isPast: isPastDay(cycleStart, day, today),
      });
      continue;
    }

    if (day === 7 || day === 14) {
      plans.push({
        day, subject: 'All', subjectId: 'all',
        chapter: 'Revision Day', chapterId: 'revision',
        subchapter: 'Revise Week ' + (day === 7 ? '1' : '2') + ' topics',
        subchapterId: 'revision',
        task: 'Quick quiz + formula review for all topics covered this week',
        difficulty: 'Medium',
        isToday: isSameDay(cycleStart, day, today),
        isPast: isPastDay(cycleStart, day, today),
      });
      continue;
    }

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
      day, subject: subjectName, subjectId: chapter.subject,
      chapter: chapter.name, chapterId: chapter.id,
      subchapter: sub.name, subchapterId: sub.id,
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
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const isHinglish = language === 'hinglish' || language === 'hindi' || language === 'crisp';
  const quotes = isHinglish ? jeetuQuotes.hinglish : jeetuQuotes.english;
  const todayQuote = quotes[new Date().getDate() % quotes.length];

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

  const weekStart = selectedWeek * 7;
  const visibleDays = schedule.slice(weekStart, weekStart + 7);

  const cycleNumber = activeCycle?.cycle_number || 1;
  const daysCompleted = schedule.filter(d => d.isPast).length;

  const handleResetCycle = async () => {
    if (!user) return;
    setIsResetting(true);
    try {
      // Delete all practice sessions for this user
      await supabase.from('practice_sessions').delete().eq('user_id', user.id);
      // Reset user practice stats
      await supabase.from('user_practice_stats').update({
        total_questions_solved: 0,
        total_correct: 0,
        total_time_seconds: 0,
        chapters_practiced: [],
      }).eq('user_id', user.id);
      // Reset selected week
      setSelectedWeek(0);
      setShowResetConfirm(false);
      // Invalidate all relevant queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['completed-subchapters'] });
      await queryClient.invalidateQueries({ queryKey: ['syllabus-progress'] });
      await queryClient.invalidateQueries({ queryKey: ['practice-sessions'] });
      await queryClient.invalidateQueries({ queryKey: ['todays-focus'] });
      await queryClient.invalidateQueries({ queryKey: ['user-practice-stats'] });
    } catch (err) {
      console.error('Reset cycle error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Hero Banner — high contrast text */}
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(213_40%_12%)] p-8 border border-white/10">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              21-Day Cycle {cycleNumber}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {isHinglish ? 'Hume 21 honest din do.' : 'Give us 21 honest days.'}
          </h2>
          <p className="text-base sm:text-lg font-medium text-white/90 mb-4">
            {isHinglish ? 'Hum tumhe direction denge exam ke liye.' : "We'll give you direction for your exam."}
          </p>

          {/* Jeetu Bhaiya motivational quote */}
          <div className="flex items-start gap-3 mb-6 bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <Quote className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white/90 italic leading-relaxed">"{todayQuote}"</p>
              <p className="text-xs text-accent font-semibold mt-1.5">— Jeetu Bhaiya</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: Brain,
                title: 'Science-Backed',
                desc: '21 days builds a habit. Daily practice rewires your brain for exam success.',
              },
              {
                icon: Target,
                title: 'All 3 Subjects Covered',
                desc: 'Physics, Chemistry, Maths — systematically. No topic left behind.',
              },
              {
                icon: Zap,
                title: 'Test → Improve → Repeat',
                desc: 'Every cycle ends with a full JEE simulation. Weak areas become next cycle\'s focus.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <item.icon className="w-5 h-5 text-accent mb-2" />
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-[hsl(45_90%_55%)] rounded-full transition-all duration-700"
                style={{ width: `${(daysCompleted / 21) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white">
              {daysCompleted}/21 days
            </span>
          </div>
        </div>
      </div>

      {/* Lecture SETU Highlight */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl bg-accent/10 border border-accent/25 cursor-pointer group hover:bg-accent/15 transition-colors"
        onClick={() => navigate('/lecture-setu')}
      >
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
          <Video className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-foreground">
            Don't waste time watching full lectures
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Use <span className="font-semibold text-accent">Lecture SETU</span> — paste any YouTube link, get crisp notes in seconds. Study smarter, not longer.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Full 21-Day Timetable */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Your Complete 21-Day Timetable
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Every day planned — just follow the schedule
            </p>
          </div>
          <div className="relative">
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-destructive font-medium">Reset all progress?</span>
                <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={handleResetCycle} disabled={isResetting}>
                  {isResetting ? 'Resetting...' : 'Yes, Reset'}
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5" onClick={() => setShowResetConfirm(true)}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Cycle
              </Button>
            )}
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex gap-2 mb-5">
          {[0, 1, 2].map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border',
                selectedWeek === week
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
              )}
            >
              Week {week + 1}
              <span className="block text-[10px] font-normal opacity-70 mt-0.5">
                Day {week * 7 + 1}–{week * 7 + 7}
              </span>
            </button>
          ))}
        </div>

        {/* Day Cards */}
        <div className="space-y-2">
          {visibleDays.map((plan) => (
            <div
              key={plan.day}
              className={cn(
                'flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 cursor-pointer group border',
                plan.isToday
                  ? 'bg-accent/10 border-accent/30 shadow-sm'
                  : plan.isPast
                    ? 'bg-muted/40 border-transparent opacity-60'
                    : 'border-transparent hover:bg-secondary/60 hover:border-border'
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
                  <span className="font-semibold text-sm text-foreground truncate">
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
                'shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                subjectColors[plan.subject] || 'bg-muted text-muted-foreground'
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full', subjectDotColors[plan.subject] || 'bg-muted-foreground')} />
                {plan.subject}
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </div>
          ))}
        </div>

        {/* Week summary */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~2 hrs/day recommended
            </span>
          </div>
          {selectedWeek === 2 && (
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-accent text-primary hover:bg-accent/90"
              onClick={() => navigate('/major-test')}
            >
              <Target className="w-3.5 h-3.5" />
              Day 21: Major Test
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
