import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface GridSubject {
  name: string;
  subtopics: {
    name: string;
    accuracy: number;
    attempts: number;
  }[];
}

interface StudentHeatmapProps {
  data: GridSubject[];
  className?: string;
}

export const StudentHeatmap: React.FC<StudentHeatmapProps> = ({ data, className }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className={cn("bg-card border border-border rounded-3xl p-6 shadow-sm overflow-x-auto", className)}>
      <h3 className="text-sm font-bold text-foreground mb-4">Topic Mastery Heatmap</h3>
      <div className="min-w-max space-y-6">
        {data.map((subject, sIdx) => (
          <div key={subject.name}>
            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-2">
              {subject.name}
            </p>
            <div className="flex gap-2 pb-2">
              {subject.subtopics.map((sub, idx) => {
                const isWeak = sub.accuracy < 50;
                const isAverage = sub.accuracy >= 50 && sub.accuracy < 75;
                const isStrong = sub.accuracy >= 75;

                return (
                  <motion.div
                    key={sub.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (sIdx * 0.1) + (idx * 0.05) }}
                    className={cn(
                      "group relative flex-none w-28 h-20 rounded-2xl border p-3 flex flex-col justify-between transition-colors hover:border-foreground/20 cursor-crosshair",
                      isWeak ? "bg-red-500/10 border-red-500/20 text-red-500" :
                      isAverage ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}
                  >
                    <p className="text-[10px] font-bold leading-tight line-clamp-2">
                      {sub.name}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] opacity-70 font-medium">{sub.attempts} attempts</span>
                      <span className="text-xs font-black">{sub.accuracy}%</span>
                    </div>

                    {/* Hover tooltip for drill-down context */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[110%] w-48 bg-popover border border-border rounded-xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      <p className="text-xs font-bold text-foreground mb-1">{sub.name}</p>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>Accuracy:</span>
                        <span className="font-bold text-foreground">{sub.accuracy}%</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Total Practice:</span>
                        <span className="font-bold text-foreground">{sub.attempts} q</span>
                      </div>
                      
                      {isWeak && (
                        <p className="text-[9px] uppercase font-bold tracking-widest text-red-400 mt-2 border-t border-border pt-1">
                          ⚠️ Action Required
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-[10px] uppercase font-bold tracking-widest">
        <div className="flex items-center gap-1.5 text-red-400"><div className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/30" /> Weak (&lt;50%)</div>
        <div className="flex items-center gap-1.5 text-amber-500"><div className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/30" /> Average (50-74%)</div>
        <div className="flex items-center gap-1.5 text-emerald-500"><div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30" /> Strong (75%+)</div>
      </div>
    </div>
  );
};
