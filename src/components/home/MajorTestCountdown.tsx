import React from 'react';
import { Calendar, Clock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useExamMode } from '@/contexts/ExamModeContext';
import { cn } from '@/lib/utils';

export const MajorTestCountdown: React.FC = () => {
  const navigate = useNavigate();
  const { examMode } = useExamMode();

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

  // Calculate days until test
  const testDate = activeCycle?.test_date ? new Date(activeCycle.test_date) : null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let daysUntilTest = 0;
  if (testDate) {
    const td = new Date(testDate);
    td.setHours(0, 0, 0, 0);
    daysUntilTest = Math.max(0, Math.ceil((td.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const examLabel = examMode === 'neet' ? 'NEET Simulation' : examMode === 'cuet' ? 'CUET Simulation' : 'JEE Simulation';
  const urgency = daysUntilTest <= 3 ? 'critical' : daysUntilTest <= 7 ? 'warning' : 'normal';

  // Cycle progress
  const cycleDay = activeCycle
    ? Math.max(1, Math.min(21, Math.ceil((now.getTime() - new Date(activeCycle.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1))
    : 1;
  const progressPercent = Math.round((cycleDay / 21) * 100);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border-2 p-5",
      urgency === 'critical'
        ? "border-destructive/50 bg-gradient-to-br from-destructive/10 via-destructive/5 to-card"
        : urgency === 'warning'
        ? "border-accent/40 bg-gradient-to-br from-accent/10 via-accent/5 to-card"
        : "border-border bg-card"
    )}>
      {/* Decorative glow */}
      {urgency !== 'normal' && (
        <div className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none",
          urgency === 'critical' ? "bg-destructive/20" : "bg-accent/20"
        )} />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              urgency === 'critical' ? "bg-destructive/20" : "bg-accent/20"
            )}>
              <Zap className={cn(
                "w-5 h-5",
                urgency === 'critical' ? "text-destructive" : "text-accent"
              )} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">21-Day Cycle</p>
              <h3 className="font-bold text-foreground text-sm">Major Test</h3>
            </div>
          </div>

          {/* Days counter */}
          <div className="text-right">
            <div className={cn(
              "text-3xl font-black leading-none",
              urgency === 'critical' ? "text-destructive" : urgency === 'warning' ? "text-accent" : "text-foreground"
            )}>
              {daysUntilTest}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">days left</p>
          </div>
        </div>

        {/* Cycle progress */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-medium">
            <span>Day {cycleDay} of 21</span>
            <span>{examLabel}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                urgency === 'critical' ? "bg-destructive" : "bg-accent"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Test date & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {testDate
                ? testDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'Day 21'}
            </span>
          </div>
          <Button
            size="sm"
            variant={urgency === 'critical' ? 'destructive' : 'default'}
            className="text-xs gap-1 h-8"
            onClick={() => navigate('/major-test')}
          >
            {urgency === 'critical' ? 'Take Test' : 'Prepare'}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
