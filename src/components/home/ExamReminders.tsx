import React from 'react';
import { Calendar, Clock, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useClassContext } from '@/contexts/ClassContext';
import { cn } from '@/lib/utils';

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
  const { isFoundation } = useClassContext();

  const nextExam = getNextExam(examMode, isFoundation);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((nextExam.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const urgency = daysLeft <= 30 ? 'critical' : daysLeft <= 90 ? 'warning' : 'normal';

  if (isFoundation && daysLeft <= 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#0c141d] via-[#1e2a3a] to-[#0c141d] rounded-2xl p-5 relative overflow-hidden border border-white/10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/15 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            urgency === 'critical' ? "bg-red-500/20" : "bg-accent/20"
          )}>
            {urgency === 'critical' ? (
              <Flame className="w-5 h-5 text-red-400" />
            ) : (
              <Calendar className="w-5 h-5 text-accent" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white text-sm">
                {isFoundation ? 'Upcoming Exam' : 'Next Exam'}
              </h3>
              {urgency === 'critical' && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-bold rounded-full uppercase border border-red-500/30">
                  {daysLeft <= 7 ? 'This Week!' : 'Coming Soon'}
                </span>
              )}
            </div>
            <p className="text-white font-medium text-sm mb-2 truncate">{nextExam.name}</p>
            <div className="flex items-center gap-4 text-xs text-white/50">
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
            className="shrink-0 text-xs btn-hero h-8"
            onClick={() => navigate(isFoundation ? '/revision' : '/test')}
          >
            {isFoundation ? 'Revise' : 'Prepare'}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {daysLeft <= 90 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>Today</span>
              <span>{nextExam.name}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  urgency === 'critical' ? "bg-red-500" : urgency === 'warning' ? "bg-accent" : "bg-primary"
                )}
                style={{ width: `${Math.max(5, Math.min(95, ((90 - daysLeft) / 90) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamReminders;
