import React from 'react';
import { Calendar, Clock, Trophy, Flame, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// JEE & NEET Schedules
const EXAM_SCHEDULE = {
  jee: [
    { name: 'JEE Mains 2026 Session 1', date: new Date('2026-01-22'), endDate: new Date('2026-01-30') },
    { name: 'JEE Mains 2026 Session 2', date: new Date('2026-04-01'), endDate: new Date('2026-04-15') },
    { name: 'JEE Advanced 2026', date: new Date('2026-05-18'), endDate: new Date('2026-05-18') },
  ],
  neet: [
    { name: 'NEET UG 2026', date: new Date('2026-05-03'), endDate: new Date('2026-05-03') }, // First Sunday of May
    { name: 'NEET UG 2027', date: new Date('2027-05-02'), endDate: new Date('2027-05-02') },
  ]
};

const getNextExam = (mode: 'jee' | 'neet') => {
  const now = new Date();
  const sessions = EXAM_SCHEDULE[mode];
  for (const exam of sessions) {
    if (exam.endDate > now) {
      return exam;
    }
  }
  return sessions[sessions.length - 1];
};

const getDaysRemaining = (targetDate: Date): number => {
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getMotivationalMessage = (daysLeft: number, examType: 'jee' | 'neet' | 'major'): string => {
  if (examType === 'major') {
    if (daysLeft <= 3) return "Major Test close! Revise high-weightage topics. 🎯";
    return "Major Test preparation on track? Keep pushing!";
  }

  // JEE/NEET messages
  if (daysLeft <= 7) return "Final sprint! Focus on high-weightage topics only. You got this! 💪";
  if (daysLeft <= 30) return "One month left. Daily Mock Test + Analysis is mandatory.";
  return "Consistently stick to the plan. Daily improvement adds up.";
};

export const ExamReminders: React.FC = () => {
  const navigate = useNavigate();
  const { isNeet } = useExamMode();
  const { user } = useAuth();
  const examModeKey = isNeet ? 'neet' : 'jee';

  // Compute major test date from user's account creation + 21 days
  // (cycles forward: cycle_start_date metadata overrides created_at)
  const getCycleMajorTestDate = (): Date => {
    const cycleStartMeta = user?.user_metadata?.cycle_start_date;
    const base = cycleStartMeta
      ? new Date(cycleStartMeta)
      : user?.created_at
        ? new Date(user.created_at)
        : new Date();
    base.setHours(0, 0, 0, 0);
    // Find how many complete 21-day cycles have elapsed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSince = Math.max(0, Math.floor((today.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)));
    const cycleIdx = Math.floor(daysSince / 21); // current cycle index (0-based)
    // Major test is end of CURRENT cycle (day 21)
    const testDate = new Date(base);
    testDate.setDate(base.getDate() + cycleIdx * 21 + 21);
    return testDate;
  };

  const nextExam = getNextExam(examModeKey);
  const daysLeft = getDaysRemaining(nextExam.date);
  const examMessage = getMotivationalMessage(daysLeft, examModeKey);

  const majorTestDate = getCycleMajorTestDate();
  const majorTestDaysLeft = getDaysRemaining(majorTestDate);
  // Keep days left >= 0 display logic, but compute from real cycle date
  const majorTestMessage = getMotivationalMessage(majorTestDaysLeft, 'major');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const themeColor = isNeet ? 'emerald' : 'amber';
  const ThemeIcon = isNeet ? Calendar : Trophy;

  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      {/* Exam Reminder Card */}
      <Card className={cn(
        "overflow-hidden relative border-opacity-20",
        isNeet ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
      )}>
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10",
          isNeet ? "bg-emerald-500" : "bg-amber-500"
        )} />

        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg bg-opacity-20",
                isNeet ? "bg-emerald-500/20" : "bg-amber-500/20"
              )}>
                <ThemeIcon className={cn("w-5 h-5", isNeet ? "text-emerald-500" : "text-amber-500")} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">UPCOMING EXAM</p>
                <h3 className="font-semibold text-foreground">{nextExam.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("flex items-center gap-1 text-2xl font-bold",
                isNeet ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              )}>
                <Flame className="w-4 h-4" />
                <span>{daysLeft}</span>
              </div>
              <p className="text-xs text-muted-foreground">days left</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(nextExam.date)}{nextExam.date.getTime() !== nextExam.endDate.getTime() ? ` - ${formatDate(nextExam.endDate)}` : ''}</span>
          </div>

          <div className={cn("rounded-lg p-3 mb-3",
            isNeet ? "bg-emerald-500/10" : "bg-amber-500/10"
          )}>
            <p className={cn("text-sm font-medium leading-relaxed",
              isNeet ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
            )}>
              💡 {examMessage}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn("w-full hover:bg-opacity-10",
              isNeet ? "border-emerald-500/30 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300" : "border-amber-500/30 hover:bg-amber-500 text-amber-700 dark:text-amber-300"
            )}
            onClick={() => navigate('/learn')}
          >
            Start Preparing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Major Test Reminder - Reusing existing generic styling or could adapt too */}
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
            {/* Days left badge — always computed from cycle */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary">
                <Flame className="w-4 h-4" />
                <span className="text-2xl font-bold">{Math.max(0, majorTestDaysLeft)}</span>
              </div>
              <p className="text-xs text-muted-foreground">days left</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            <span>Test Date: {formatDate(majorTestDate)}</span>
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
            {majorTestDaysLeft <= 0 ? 'Take Test Now' : 'View Schedule'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
