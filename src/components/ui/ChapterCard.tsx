import React from 'react';
import { ChevronRight, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Chapter, Weightage, Difficulty } from '@/data/syllabus';

interface ChapterCardProps {
  chapter: Chapter;
  progress?: number;
  onClick?: () => void;
}

const weightageColors: Record<Weightage, string> = {
  High: 'bg-setu-saffron/10 text-setu-saffron border-setu-saffron/30',
  Medium: 'bg-setu-warning/10 text-setu-warning border-setu-warning/30',
  Low: 'bg-muted text-muted-foreground border-border'
};

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'text-setu-success',
  Medium: 'text-setu-warning',
  Hard: 'text-setu-error'
};

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  progress = 0,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-xl p-4 cursor-pointer card-hover',
        'group transition-all duration-300'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full border',
              weightageColors[chapter.weightage]
            )}>
              {chapter.weightage} Weightage
            </span>
            <span className={cn('text-xs font-medium', difficultyColors[chapter.difficulty])}>
              {chapter.difficulty}
            </span>
          </div>
          
          <h4 className="font-semibold text-foreground group-hover:text-setu-saffron transition-colors truncate">
            {chapter.name}
          </h4>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {chapter.topics.length} Topics
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              PYQ: {chapter.pyqData.postCovid} (2020+)
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">{progress}%</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-setu-saffron group-hover:translate-x-1 transition-all" />
        </div>
      </div>
      
      {progress > 0 && (
        <div className="mt-3 progress-setu">
          <div className="progress-setu-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};
