import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  BookOpen, 
  Brain, 
  Target,
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { Subchapter } from '@/data/subchapters';

interface SubchapterCardProps {
  subchapter: Subchapter;
  index: number;
  subject: string;
  isCompleted?: boolean;
}

const subjectStyles = {
  physics: {
    bg: 'bg-physics/5 hover:bg-physics/10',
    border: 'border-physics/20 hover:border-physics/40',
    accent: 'text-physics',
    badge: 'bg-physics/10 text-physics',
    gradient: 'from-physics/20 to-physics/5'
  },
  chemistry: {
    bg: 'bg-chemistry/5 hover:bg-chemistry/10',
    border: 'border-chemistry/20 hover:border-chemistry/40',
    accent: 'text-chemistry',
    badge: 'bg-chemistry/10 text-chemistry',
    gradient: 'from-chemistry/20 to-chemistry/5'
  },
  maths: {
    bg: 'bg-maths/5 hover:bg-maths/10',
    border: 'border-maths/20 hover:border-maths/40',
    accent: 'text-maths',
    badge: 'bg-maths/10 text-maths',
    gradient: 'from-maths/20 to-maths/5'
  }
};

export const SubchapterCard: React.FC<SubchapterCardProps> = ({
  subchapter,
  index,
  subject,
  isCompleted = false
}) => {
  const navigate = useNavigate();
  const styles = subjectStyles[subject as keyof typeof subjectStyles] || subjectStyles.physics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'group relative bg-card border-2 rounded-2xl p-5 cursor-pointer',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        styles.border,
        isCompleted && 'ring-2 ring-setu-success/30'
      )}
      onClick={() => navigate(`/subchapter/${subchapter.id}`)}
    >
      {/* Top Row - Number & Status */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg',
          'transition-all duration-300',
          styles.badge
        )}>
          {index + 1}
        </div>
        
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-setu-success/10 text-setu-success flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Done
            </span>
          )}
          <ChevronRight className={cn(
            'w-5 h-5 text-muted-foreground transition-all duration-300',
            'group-hover:translate-x-1',
            `group-hover:${styles.accent}`
          )} />
        </div>
      </div>

      {/* Title */}
      <h4 className={cn(
        'font-semibold text-foreground text-lg mb-2 transition-colors',
        `group-hover:${styles.accent}`
      )}>
        {subchapter.name}
      </h4>

      {/* What JEE Asks - Preview */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {subchapter.jeeAsks[0]}
      </p>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5" />
          {subchapter.jeeAsks.length} concepts
        </span>
        <span className="flex items-center gap-1">
          <Brain className="w-3.5 h-3.5" />
          {subchapter.commonMistakes.length} traps
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          ~25 min
        </span>
      </div>

      {/* Quick Actions - Show on Hover */}
      <div className={cn(
        'flex items-center gap-2 pt-3 border-t border-border',
        'opacity-70 group-hover:opacity-100 transition-opacity'
      )}>
        <Button 
          size="sm" 
          variant="ghost"
          className={cn('flex-1 h-9 text-xs', styles.bg)}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/subchapter/${subchapter.id}?tab=learn`);
          }}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          Learn
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          className={cn('flex-1 h-9 text-xs', styles.bg)}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/subchapter/${subchapter.id}?tab=practice`);
          }}
        >
          <Target className="w-3.5 h-3.5 mr-1.5" />
          Practice
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          className={cn('flex-1 h-9 text-xs', styles.bg)}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/subchapter/${subchapter.id}?tab=test`);
          }}
        >
          <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
          Test
        </Button>
      </div>

      {/* Jeetu Line - Motivational */}
      {subchapter.jeetuLine && (
        <div className={cn(
          'mt-3 pt-3 border-t border-dashed border-border',
          'text-xs italic text-muted-foreground'
        )}>
          💡 {subchapter.jeetuLine}
        </div>
      )}
    </motion.div>
  );
};
