import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TodaysFocus } from '@/components/home/TodaysFocus';
import { QuickActions } from '@/components/home/QuickActions';
import { SyllabusTracker } from '@/components/home/SyllabusTracker';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

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
            <>
              <p className="text-muted-foreground mb-1">Welcome back, {displayName}! 👋</p>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {getMentorName()} ready hai tumhari help ke liye
              </h1>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-1">Welcome to Study Setu!</p>
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                {getMentorName()} is here to help
              </h1>
              <Link to="/auth">
                <Button className="btn-hero gap-2">
                  <LogIn className="h-4 w-4" />
                  Login kar lo bhai
                </Button>
              </Link>
            </>
          )}
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
