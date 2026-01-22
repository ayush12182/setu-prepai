import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TodaysFocus } from '@/components/home/TodaysFocus';
import { QuickActions } from '@/components/home/QuickActions';
import { SyllabusTracker } from '@/components/home/SyllabusTracker';
import { useLanguage } from '@/contexts/LanguageContext';

const Index: React.FC = () => {
  const { getGreeting, getMentorName } = useLanguage();

  return (
    <MainLayout title="SETU">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in" style={{ opacity: 0 }}>
          <p className="text-muted-foreground mb-1">Welcome back!</p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {getMentorName()} is here to help
          </h1>
        </div>

        {/* Today's Focus */}
        <div className="animate-fade-in stagger-1" style={{ opacity: 0 }}>
          <TodaysFocus />
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <QuickActions />
        </section>

        {/* Syllabus Tracker */}
        <div className="animate-fade-in stagger-2" style={{ opacity: 0 }}>
          <SyllabusTracker />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
