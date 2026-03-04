import React from 'react';
import { Calendar, Zap, ArrowRight } from 'lucide-react';
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

  const cycleDay = activeCycle
    ? Math.max(1, Math.min(21, Math.ceil((now.getTime() - new Date(activeCycle.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1))
    : 1;
  const progressPercent = Math.round((cycleDay / 21) * 100);

  return (
    <div className="bg-gradient-to-br from-[#0c141d] via-[#1e2a3a] to-[#0c141d] rounded-2xl p-5 relative overflow-hidden border border-white/10 shadow-xl group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
      {/* Decorative glows */}
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none",
        urgency === 'critical' ? "bg-red-500/15" : urgency === 'warning' ? "bg-amber-500/15" : "bg-accent/10"
      )} />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/15 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              urgency === 'critical' ? "bg-red-500/20" : "bg-accent/20"
            )}>
              <Zap className={cn(
                "w-5 h-5",
                urgency === 'critical' ? "text-red-400" : "text-accent"
              )} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">21-Day Cycle</p>
              <h3 className="font-bold text-white text-sm">Major Test</h3>
            </div>
          </div>

          {/* Days counter */}
          <div className="text-right">
            <div className={cn(
              "text-3xl font-black leading-none",
              urgency === 'critical' ? "text-red-400" : urgency === 'warning' ? "text-amber-400" : "text-white"
            )}>
              {daysUntilTest}
            </div>
            <p className="text-[10px] text-white/50 font-medium mt-0.5">days left</p>
          </div>
        </div>

        {/* Cycle progress */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-white/50 mb-1.5 font-medium">
            <span>Day {cycleDay} of 21</span>
            <span>{examLabel}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                urgency === 'critical' ? "bg-red-500" : "bg-accent"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Test date & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {testDate
                ? testDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'Day 21'}
            </span>
          </div>
          <Button
            size="sm"
            className={cn(
              "text-xs gap-1 h-8",
              urgency === 'critical'
                ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                : "btn-hero"
            )}
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
