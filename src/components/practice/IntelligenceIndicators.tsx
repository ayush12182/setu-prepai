import React from 'react';
import { cn } from '@/lib/utils';
import { Target, Zap, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StabilityIndicatorProps {
  score: number | null;
  attempts: number;
  size?: 'sm' | 'md';
}

export const NodeStabilityIndicator: React.FC<StabilityIndicatorProps> = ({ score, attempts, size = 'sm' }) => {
  if (attempts === 0 || score === null) {
     return <div className={cn("rounded-full bg-muted/30 border border-border/50", size === 'sm' ? "w-2 h-2" : "w-3 h-3")} title="Untouched" />;
  }

  const isRed = score < 0.6 && attempts >= 5;
  const isYellow = score < 0.8 && !isRed;
  const isGreen = score >= 0.8;

  return (
    <div className="flex items-center gap-1.5">
       <div className={cn(
         "rounded-full animate-pulse transition-all",
         size === 'sm' ? "w-2.5 h-2.5" : "w-4 h-4",
         isRed ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
         isYellow ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : 
         "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
       )} />
       {size === 'md' && (
         <span className={cn(
           "text-[10px] font-black uppercase tracking-tighter",
           isRed ? "text-red-400" : isYellow ? "text-amber-400" : "text-green-400"
         )}>
           {isRed ? 'Critical' : isYellow ? 'Improving' : 'Mastered'}
         </span>
       )}
    </div>
  );
};

export const TrendIndicator: React.FC<{ score: number | null }> = ({ score }) => {
  if (score === null) return <Minus className="w-3 h-3 text-muted-foreground" />;
  if (score > 0.7) return <TrendingUp className="w-3 h-3 text-green-400" />;
  return <TrendingDown className="w-3 h-3 text-red-400" />;
};
