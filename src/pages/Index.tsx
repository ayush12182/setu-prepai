import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TodaysFocus } from '@/components/home/TodaysFocus';
import { QuickActions } from '@/components/home/QuickActions';
import { SyllabusTracker } from '@/components/home/SyllabusTracker';
import { ExamReminders } from '@/components/home/ExamReminders';
import { TwentyOneDayPlan } from '@/components/home/TwentyOneDayPlan';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { Sparkles, Flame, Trophy, Zap } from 'lucide-react';

const Index: React.FC = () => {
  const { getMentorName } = useLanguage();
  const { user, profile } = useAuth();
  const { config, isNeet } = useExamMode();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Bhai';

  return (
    <MainLayout title="SETU">
      <div className="space-y-10">
        {/* ── Section 1: Welcome Hero ── */}
        {user && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-8 sm:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5" />
                    Dashboard
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                    {config.emoji} {config.label} Mode
                  </span>
                </div>
                <p className="text-white/60 text-sm font-medium mb-1">
                  Welcome back, {displayName}! 👋
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {isNeet ? 'Your NEET Mentor ready hai tumhari help ke liye' : `${getMentorName()} ready hai tumhari help ke liye`}
                </h1>
              </div>

              <div className="flex gap-3">
                {[
                  { icon: Trophy, label: 'Streak', value: '🔥 3 days' },
                  { icon: Zap, label: 'Today', value: '0 Qs' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center min-w-[80px]">
                    <div className="text-sm font-bold text-white">{stat.value}</div>
                    <div className="text-[11px] text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Section 2: Today's Focus + Exam Countdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TodaysFocus />
          </div>
          <div className="lg:col-span-2">
            <ExamReminders />
          </div>
        </div>

        {/* ── Section 3: 21-Day Cycle Plan ── */}
        <TwentyOneDayPlan />

        {/* ── Section 4: Quick Actions ── */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Quick Actions
          </h2>
          <QuickActions />
        </section>

        {/* ── Section 5: Syllabus Tracker ── */}
        <SyllabusTracker />
      </div>
    </MainLayout>
  );
};

export default Index;
