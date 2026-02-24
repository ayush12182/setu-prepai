import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Users, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useCircleRooms } from '@/hooks/useCircleRooms';

export const CirclesDashboardCard: React.FC = () => {
  const navigate = useNavigate();
  const { examMode } = useExamMode();
  const { roomStates } = useCircleRooms(examMode);

  const totalOnline = roomStates.reduce((sum, rs) => sum + rs.studentCount, 0);
  const topRooms = [...roomStates]
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 3);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.06)] group">
      <div className="h-1.5 w-full bg-gradient-to-r from-[hsl(32_79%_57%)] via-[hsl(350_65%_55%)] to-[hsl(280_50%_55%)]" />
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(32_79%_57%)] to-[hsl(350_65%_55%)] flex items-center justify-center shadow-md flex-shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-tight">SETU Commune</h3>
              <p className="text-xs text-muted-foreground">Real-time study rooms with peers.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">{totalOnline}</span>
            <Users className="w-3 h-3 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          {topRooms.length > 0 ? topRooms.map(rs => (
            <div
              key={rs.room.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
              onClick={() => navigate(`/circles/${rs.room.id}`)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">{rs.room.title}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                {rs.studentCount} online
              </span>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground text-center py-3">No active rooms. Create one!</p>
          )}
        </div>

        <Button
          className="w-full gap-2 bg-gradient-to-r from-[hsl(32_79%_57%)] to-[hsl(25_85%_55%)] text-white hover:opacity-90 transition-opacity shadow-md"
          onClick={() => navigate('/circles')}
        >
          <Flame className="w-4 h-4" />
          Join a Focus Room
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </div>
  );
};
