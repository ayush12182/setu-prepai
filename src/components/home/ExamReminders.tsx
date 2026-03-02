import React from 'react';
import { Calendar, Clock, Trophy, Flame, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useClassContext } from '@/contexts/ClassContext';
import { cn } from '@/lib/utils';

// JEE, NEET & CUET Schedules
const EXAM_SCHEDULE: Record<string, { name: string; date: Date; endDate: Date }[]> = {
  jee: [
    { name: 'JEE Mains 2026 Session 1', date: new Date('2026-01-22'), endDate: new Date('2026-01-30') },
    { name: 'JEE Mains 2026 Session 2', date: new Date('2026-04-01'), endDate: new Date('2026-04-15') },
    { name: 'JEE Advanced 2026', date: new Date('2026-05-18'), endDate: new Date('2026-05-18') },
  ],
  neet: [
    { name: 'NEET UG 2026', date: new Date('2026-05-03'), endDate: new Date('2026-05-03') },
    { name: 'NEET UG 2027', date: new Date('2027-05-02'), endDate: new Date('2027-05-02') },
  ],
  cuet: [
    { name: 'CUET UG 2026', date: new Date('2026-05-15'), endDate: new Date('2026-06-05') },
    { name: 'CUET UG 2027', date: new Date('2027-05-15'), endDate: new Date('2027-06-05') },
  ],
};

// School exam schedule
const SCHOOL_SCHEDULE = [
  { name: 'Unit Test 1', date: new Date('2026-07-15'), endDate: new Date('2026-07-20') },
  { name: 'Half-Yearly Exam', date: new Date('2026-10-01'), endDate: new Date('2026-10-10') },
  { name: 'Unit Test 2', date: new Date('2027-01-10'), endDate: new Date('2027-01-15') },
  { name: 'Annual Exam', date: new Date('2027-03-01'), endDate: new Date('2027-03-15') },
];

const getNextExam = (mode: string, isFoundation: boolean) => {
  const now = new Date();
  const sessions = isFoundation ? SCHOOL_SCHEDULE : (EXAM_SCHEDULE[mode] || EXAM_SCHEDULE.jee);
  for (const exam of sessions) {
    if (exam.endDate >= now) return exam;
  }
  return sessions[sessions.length - 1];
};

const ExamReminders: React.FC = () => {
  const navigate = useNavigate();
  const { examMode } = useExamMode();
  const { profile } = useAuth();
  const { isFoundation, classLabel } = useClassContext();

  const nextExam = getNextExam(examMode, isFoundation);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((nextExam.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const urgency = daysLeft <= 30 ? 'critical' : daysLeft <= 90 ? 'warning' : 'normal';

  // For foundation, don't show if no school schedule is upcoming
  if (isFoundation && daysLeft <= 0) return null;

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all",
      urgency === 'critical' ? "border-destructive/40 bg-destructive/5" :
      urgency === 'warning' ? "border-accent/40 bg-accent/5" :
      "border-border bg-card"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            urgency === 'critical' ? "bg-destructive/20" :
            urgency === 'warning' ? "bg-accent/20" :
            "bg-primary/10"
          )}>
            {urgency === 'critical' ? (
              <Flame className="w-6 h-6 text-destructive" />
            ) : (
              <Calendar className="w-6 h-6 text-accent" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-sm">
                {isFoundation ? 'Upcoming Exam' : 'Next Exam'}
              </h3>
              {urgency === 'critical' && (
                <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-[10px] font-bold rounded-full uppercase">
                  {daysLeft <= 7 ? 'This Week!' : 'Coming Soon'}
                </span>
              )}
            </div>

            <p className="text-foreground font-medium text-base mb-2">{nextExam.name}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysLeft} days left
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {nextExam.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="shrink-0 text-xs"
            onClick={() => navigate(isFoundation ? '/revision' : '/test')}
          >
            {isFoundation ? 'Revise' : 'Prepare'}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Progress bar */}
        {daysLeft <= 90 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Today</span>
              <span>{nextExam.name}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  urgency === 'critical' ? "bg-destructive" :
                  urgency === 'warning' ? "bg-accent" :
                  "bg-primary"
                )}
                style={{ width: `${Math.max(5, Math.min(95, ((90 - daysLeft) / 90) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamReminders;
