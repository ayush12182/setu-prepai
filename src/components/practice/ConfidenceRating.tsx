import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConfidenceLevel } from '@/hooks/useMCQ';

interface ConfidenceRatingProps {
  selected: ConfidenceLevel | null;
  onSelect: (level: ConfidenceLevel) => void;
  disabled?: boolean;
  compact?: boolean;
}

const CONFIDENCE_OPTIONS: {
  level: ConfidenceLevel;
  label: string;
  emoji: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  textColor: string;
  bgSelected: string;
  borderSelected: string;
}[] = [
  {
    level: 'low',
    label: 'Not Sure',
    emoji: '😅',
    description: 'I was guessing',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-red-600/10',
    glow: 'shadow-red-500/20',
    textColor: 'text-red-400',
    bgSelected: 'bg-red-500/15',
    borderSelected: 'border-red-500/50',
  },
  {
    level: 'medium',
    label: 'Somewhat',
    emoji: '🤔',
    description: 'Had a feeling',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-amber-600/10',
    glow: 'shadow-amber-500/20',
    textColor: 'text-amber-400',
    bgSelected: 'bg-amber-500/15',
    borderSelected: 'border-amber-500/50',
  },
  {
    level: 'high',
    label: 'Confident',
    emoji: '💪',
    description: 'I knew this',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-600/10',
    glow: 'shadow-emerald-500/20',
    textColor: 'text-emerald-400',
    bgSelected: 'bg-emerald-500/15',
    borderSelected: 'border-emerald-500/50',
  },
];

/**
 * ConfidenceRating
 *
 * Post-answer confidence capture UI.
 * Renders as compact (inline row) or full (stacked cards).
 * Feeds into useMCQ → user_mcq_attempts.confidence_level
 */
const ConfidenceRating: React.FC<ConfidenceRatingProps> = ({
  selected,
  onSelect,
  disabled = false,
  compact = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('w-full', compact ? '' : 'mt-4')}
    >
      {!compact && (
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <span className="w-4 h-px bg-border" />
          How confident were you?
          <span className="w-4 h-px bg-border" />
        </p>
      )}

      <div className={cn('flex gap-2', compact ? 'justify-start' : 'justify-center')}>
        {CONFIDENCE_OPTIONS.map((opt) => {
          const isSelected = selected === opt.level;

          return (
            <motion.button
              key={opt.level}
              id={`confidence-${opt.level}`}
              onClick={() => !disabled && onSelect(opt.level)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                compact
                  ? 'px-3 py-1.5 gap-0.5 flex-row text-xs min-w-[80px]'
                  : 'px-4 py-3 gap-1.5 flex-1 text-sm min-h-[70px]',
                disabled && 'cursor-not-allowed opacity-60',
                !disabled && 'cursor-pointer',
                isSelected
                  ? cn(opt.bgSelected, opt.borderSelected, 'shadow-lg', opt.glow)
                  : 'bg-card/60 border-border hover:border-border/80 hover:bg-card',
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="confidence-selection"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'transparent' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}

              <span className={cn('relative z-10', compact ? 'mr-1.5 text-base' : 'text-xl')}>
                {opt.emoji}
              </span>

              <span
                className={cn(
                  'relative z-10 font-bold leading-none',
                  isSelected ? opt.textColor : 'text-foreground/80',
                  compact ? 'text-xs' : 'text-sm',
                )}
              >
                {opt.label}
              </span>

              {!compact && (
                <span
                  className={cn(
                    'relative z-10 text-[10px] font-medium leading-none',
                    isSelected ? opt.textColor : 'text-muted-foreground',
                  )}
                >
                  {opt.description}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ConfidenceRating;
