import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TodaysFocus } from '@/components/home/TodaysFocus';
import { QuickActions } from '@/components/home/QuickActions';
import { SyllabusTracker } from '@/components/home/SyllabusTracker';
import { ExamReminders } from '@/components/home/ExamReminders';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { getGreeting, getMentorName } = useLanguage();
  const { user, profile } = useAuth();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Bhai';

  return (
    <MainLayout title="SETU">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in" style={{ opacity: 0 }}>
          {user ? (
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <p className="text-secondary-foreground text-sm font-medium mb-1">
                Welcome back, {displayName}! 👋
              </p>
              <h1 className="text-2xl font-semibold text-foreground leading-tight">
                {getMentorName()} ready hai tumhari help ke liye
              </h1>
            </div>
          ) : null}
        </div>

        {/* Exam Reminders */}
        <div className="animate-fade-in stagger-1" style={{ opacity: 0 }}>
          <ExamReminders />
        </div>

        {/* Today's Focus */}
        <div className="animate-fade-in stagger-2" style={{ opacity: 0 }}>
          <TodaysFocus />
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <QuickActions />
        </section>

        {/* Syllabus Tracker */}
        <div className="animate-fade-in stagger-3" style={{ opacity: 0 }}>
          <SyllabusTracker />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
