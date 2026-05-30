import React from 'react';
import { Calendar, Flame } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';

export interface DayActivity {
  date: Date;
  questions: number;
  correct: number;
}

interface PracticeTimelineProps {
  last30Days: DayActivity[];
  streak: number;
}

export const PracticeTimeline: React.FC<PracticeTimelineProps> = ({ last30Days, streak }) => {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const activity = last30Days.find(d => isSameDay(d.date, date));
    return { date, questions: activity?.questions ?? 0, correct: activity?.correct ?? 0 };
  });

  const maxQ = Math.max(...days.map(d => d.questions), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Last 30 Days Activity
        </h3>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-prepentrance-saffron/10 border border-prepentrance-saffron/20">
            <Flame className="w-4 h-4 text-prepentrance-saffron" />
            <span className="text-sm font-bold text-prepentrance-saffron">{streak} day streak</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 items-end h-24">
        {days.map((day, i) => {
          const height = day.questions > 0 ? Math.max((day.questions / maxQ) * 100, 8) : 4;
          const accuracy = day.questions > 0 ? day.correct / day.questions : 0;
          const color = day.questions === 0
            ? 'bg-secondary'
            : accuracy >= 0.7 ? 'bg-prepentrance-success' : accuracy >= 0.5 ? 'bg-prepentrance-saffron' : 'bg-prepentrance-error';

          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              <div
                className={`w-full rounded-sm ${color} transition-all duration-300 group-hover:opacity-80`}
                style={{ height: `${height}%` }}
              />
              {/* Tooltip */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-popover border border-border rounded-lg px-2 py-1 shadow-md whitespace-nowrap">
                <p className="text-[10px] font-medium text-foreground">{format(day.date, 'dd MMM')}</p>
                <p className="text-[10px] text-muted-foreground">{day.questions} Q • {day.correct} ✓</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">{format(subDays(today, 29), 'dd MMM')}</span>
        <span className="text-[10px] text-muted-foreground">Today</span>
      </div>

      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-prepentrance-success" /><span className="text-[10px] text-muted-foreground">≥70%</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-prepentrance-saffron" /><span className="text-[10px] text-muted-foreground">50-70%</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-prepentrance-error" /><span className="text-[10px] text-muted-foreground">&lt;50%</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-secondary" /><span className="text-[10px] text-muted-foreground">No activity</span></div>
      </div>
    </div>
  );
};
