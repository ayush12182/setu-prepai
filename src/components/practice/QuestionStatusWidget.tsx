import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldAlert, Sparkles, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusWidgetMode = 'ai' | 'offline' | 'recovery' | 'idle' | 'fetching';

interface QuestionStatusWidgetProps {
  mode: StatusWidgetMode;
  className?: string;
}

export const QuestionStatusWidget: React.FC<QuestionStatusWidgetProps> = ({ mode, className }) => {
  const config = {
    ai: {
      text: 'AI Question Generation Active',
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
      dot: 'bg-emerald-400',
      icon: Sparkles
    },
    offline: {
      text: 'Smart Offline Generator Active',
      color: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
      dot: 'bg-amber-400',
      icon: Cpu
    },
    recovery: {
      text: 'Recovery Mode',
      color: 'text-red-400 bg-red-400/10 border-red-500/20',
      dot: 'bg-red-400 animate-pulse',
      icon: ShieldAlert
    },
    idle: {
      text: 'System Ready',
      color: 'text-slate-400 bg-slate-400/10 border-slate-500/20',
      dot: 'bg-slate-400',
      icon: Wifi
    },
    fetching: {
      text: 'Verifying System Access...',
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20',
      dot: 'bg-indigo-400 animate-ping',
      icon: Sparkles
    }
  };

  const current = config[mode] || config.idle;
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md shadow-lg transition-all",
        current.color,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {mode === 'ai' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        {mode === 'fetching' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", current.dot)}></span>
      </span>
      <Icon size={12} className="shrink-0" />
      <span>{current.text}</span>
    </motion.div>
  );
};
