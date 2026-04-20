import React from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Chapter } from '@/data/syllabus';

interface TrendingConceptsProps {
  chapter: Chapter;
}

const subjectStyles: Record<string, { bg: string; text: string }> = {
  physics: { bg: 'bg-physics/10 hover:bg-physics/20', text: 'text-physics' },
  chemistry: { bg: 'bg-chemistry/10 hover:bg-chemistry/20', text: 'text-chemistry' },
  maths: { bg: 'bg-maths/10 hover:bg-maths/20', text: 'text-maths' }
};

export const TrendingConcepts: React.FC<TrendingConceptsProps> = ({ chapter }) => {
  if (chapter.pyqData.trendingConcepts.length === 0) return null;

  const styles = subjectStyles[chapter.subject] || subjectStyles.physics;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <TrendingUp className={cn('w-5 h-5', styles.text)} />
          Trending in PYQs
        </h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Focus on these
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {chapter.pyqData.trendingConcepts.map((concept, index) => (
          <motion.span 
            key={concept}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className={cn(
              'px-3 py-1.5 text-sm rounded-full cursor-default transition-colors',
              styles.bg, styles.text
            )}
          >
            {concept}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};
