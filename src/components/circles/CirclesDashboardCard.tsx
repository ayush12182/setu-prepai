import React from 'react';
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
    <div className="bg-gradient-to-br from-[#0c141d] via-[#1e2a3a] to-[#0c141d] rounded-2xl relative overflow-hidden border border-white/10 shadow-xl">
      {/* Decorative glows */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/15 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(32_79%_57%)] to-[hsl(350_65%_55%)] flex items-center justify-center shadow-md flex-shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">SETU Commune</h3>
              <p className="text-[10px] text-white/40">Real-time study rooms with peers</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">{totalOnline}</span>
            <Users className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          {topRooms.length > 0 ? topRooms.map(rs => (
            <div
              key={rs.room.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"
              onClick={() => navigate(`/circles/${rs.room.id}`)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                <span className="text-xs font-medium text-white/80 truncate">{rs.room.title}</span>
              </div>
              <span className="text-[10px] text-white/40 ml-2 flex-shrink-0">
                {rs.studentCount} online
              </span>
            </div>
          )) : (
            <p className="text-xs text-white/40 text-center py-3">No active rooms. Create one!</p>
          )}
        </div>

        <Button
          size="sm"
          className="w-full gap-2 btn-hero text-xs h-9"
          onClick={() => navigate('/circles')}
        >
          <Flame className="w-3.5 h-3.5" />
          Join a Focus Room
          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
        </Button>
      </div>
    </div>
  );
};
