import React from 'react';
import { Target, Clock, Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const TodaysFocus: React.FC = () => {
  const { language } = useLanguage();

  const focusItem = {
    subject: 'Physics',
    chapter: 'Rotational Motion',
    task: language === 'hinglish' 
      ? 'Aaj rolling motion pe focus karo - PYQ bahut aate hain!'
      : 'Focus on rolling motion today - high PYQ frequency!',
    timeLeft: '2h 30m',
    streak: 7
  };

  return (
    <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-setu-saffron/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-setu-saffron" />
              <span className="text-sm font-medium text-white/80">Today's Focus</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{focusItem.chapter}</h2>
            <p className="text-white/70 text-sm">{focusItem.subject}</p>
          </div>
          
          <div className="flex items-center gap-1 bg-setu-saffron/20 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-setu-saffron" />
            <span className="text-sm font-semibold">{focusItem.streak} day streak</span>
          </div>
        </div>

        <p className="text-white/80 mb-4 mentor-tip bg-white/5 p-3 rounded-lg text-sm">
          💡 {focusItem.task}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Clock className="w-4 h-4" />
            <span>Suggested: {focusItem.timeLeft}</span>
          </div>
          
          <Button className="btn-hero gap-2">
            Start Now
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
