import React from 'react';
import { Calendar, Clock, Trophy, Flame, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// JEE Mains 2026 Schedule (approximate dates)
const JEE_MAINS_SESSIONS = [
  { name: 'JEE Mains 2026 Session 1', date: new Date('2026-01-22'), endDate: new Date('2026-01-30') },
  { name: 'JEE Mains 2026 Session 2', date: new Date('2026-04-01'), endDate: new Date('2026-04-15') },
  { name: 'JEE Advanced 2026', date: new Date('2026-05-18'), endDate: new Date('2026-05-18') },
  { name: 'JEE Mains 2027 Session 1', date: new Date('2027-01-20'), endDate: new Date('2027-01-28') },
];

const getNextJeeExam = () => {
  const now = new Date();
  for (const exam of JEE_MAINS_SESSIONS) {
    if (exam.endDate > now) {
      return exam;
    }
  }
  return JEE_MAINS_SESSIONS[JEE_MAINS_SESSIONS.length - 1];
};

const getDaysRemaining = (targetDate: Date): number => {
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getMotivationalMessage = (daysLeft: number, examType: 'jee' | 'major'): string => {
  if (examType === 'jee') {
    if (daysLeft <= 7) {
      return "Bhai, ab final sprint hai. Revision pe focus, naya mat padho. You've got this! 💪";
    } else if (daysLeft <= 30) {
      return "Ek mahina hai, bhai. Daily 10 questions minimum. Consistency > Speed. Chal shuru karte hain!";
    } else if (daysLeft <= 60) {
      return "2 mahine hain abhi. Weak topics identify karo aur attack karo. Time hai!";
    } else {
      return "Bhai, preparation journey hai, destination nahi. Daily thoda karo, results automatic aayenge.";
    }
  } else {
    if (daysLeft <= 3) {
      return "Major Test aa raha hai! Revision mode on karo. Ye test tera real assessment hai. 🎯";
    } else if (daysLeft <= 7) {
      return "Ek hafte mein Major Test hai. Formula sheets revise karo, mock lagao!";
    } else {
      return "Major Test ke liye prepare ho raha hai? Daily practice karte raho, bhai!";
    }
  }
};

export const ExamReminders: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch active major test cycle
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
    }
  });

  const nextJeeExam = getNextJeeExam();
  const jeeDaysLeft = getDaysRemaining(nextJeeExam.date);
  const jeeMessage = getMotivationalMessage(jeeDaysLeft, 'jee');

  const majorTestDate = activeCycle ? new Date(activeCycle.test_date) : null;
  const majorTestDaysLeft = majorTestDate ? getDaysRemaining(majorTestDate) : null;
  const majorTestMessage = majorTestDaysLeft !== null ? getMotivationalMessage(majorTestDaysLeft, 'major') : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* JEE Mains Reminder */}
      <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">UPCOMING EXAM</p>
                <h3 className="font-semibold text-foreground">{nextJeeExam.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4" />
                <span className="text-2xl font-bold">{jeeDaysLeft}</span>
              </div>
              <p className="text-xs text-muted-foreground">days left</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(nextJeeExam.date)} - {formatDate(nextJeeExam.endDate)}</span>
          </div>

          <div className="bg-amber-500/10 rounded-lg p-3 mb-3">
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
              💡 {jeeMessage}
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300"
            onClick={() => navigate('/learn')}
          >
            Start Preparing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Major Test Reminder */}
      <Card className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-indigo-500/10 border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">21-DAY CYCLE</p>
                <h3 className="font-semibold text-foreground">Major Test</h3>
              </div>
            </div>
            {majorTestDaysLeft !== null && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Flame className="w-4 h-4" />
                  <span className="text-2xl font-bold">{majorTestDaysLeft}</span>
                </div>
                <p className="text-xs text-muted-foreground">days left</p>
              </div>
            )}
          </div>

          {majorTestDate ? (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="w-3 h-3" />
                <span>Test Date: {formatDate(majorTestDate)}</span>
                {activeCycle && (
                  <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Cycle {activeCycle.cycle_number}
                  </span>
                )}
              </div>

              <div className="bg-primary/10 rounded-lg p-3 mb-3">
                <p className="text-sm text-primary font-medium leading-relaxed">
                  🎯 {majorTestMessage}
                </p>
              </div>

              <Button 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/major-test')}
              >
                {majorTestDaysLeft !== null && majorTestDaysLeft <= 0 ? 'Take Test Now' : 'View Details'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <div className="bg-primary/10 rounded-lg p-3 mb-3">
                <p className="text-sm text-primary font-medium leading-relaxed">
                  🎯 Major Test abhi schedule nahi hai. Jaldi ek naya cycle start hoga!
                </p>
              </div>

              <Button 
                size="sm" 
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
                onClick={() => navigate('/major-test')}
              >
                Check Major Test
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
