import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Chapter } from '@/data/syllabus';
import { motion } from 'framer-motion';

interface ChapterHeaderProps {
  chapter: Chapter;
  subchapterCount: number;
}

const subjectGradients: Record<string, string> = {
  physics: 'from-physics/20 via-physics/10 to-transparent',
  chemistry: 'from-chemistry/20 via-chemistry/10 to-transparent',
  maths: 'from-maths/20 via-maths/10 to-transparent'
};

const subjectColors: Record<string, string> = {
  physics: 'text-physics',
  chemistry: 'text-chemistry',
  maths: 'text-maths'
};

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({ chapter, subchapterCount }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Gradient Background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50',
        subjectGradients[chapter.subject]
      )} />
      
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <button 
            onClick={() => navigate('/learn')}
            className="hover:text-foreground transition-colors"
          >
            Learn
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/learn?subject=${chapter.subject}`)}
            className={cn('hover:text-foreground transition-colors capitalize', subjectColors[chapter.subject])}
          >
            {chapter.subject}
          </button>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{chapter.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Back Button */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Chapter Info */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={cn(
                'text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5',
                chapter.weightage === 'High' 
                  ? 'bg-setu-saffron/10 text-setu-saffron border-setu-saffron/30' 
                  : chapter.weightage === 'Medium' 
                    ? 'bg-setu-warning/10 text-setu-warning border-setu-warning/30'
                    : 'bg-muted text-muted-foreground border-border'
              )}>
                <Flame className="w-3 h-3" />
                {chapter.weightage} Priority
              </span>
              <span className={cn(
                'text-xs font-semibold px-3 py-1 rounded-full',
                chapter.difficulty === 'Hard' ? 'bg-setu-error/10 text-setu-error' :
                chapter.difficulty === 'Medium' ? 'bg-setu-warning/10 text-setu-warning' :
                'bg-setu-success/10 text-setu-success'
              )}>
                {chapter.difficulty}
              </span>
              {chapter.chemistryType && (
                <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {chapter.chemistryType}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              {chapter.name}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className={cn('capitalize font-medium', subjectColors[chapter.subject])}>
                {chapter.subject}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {subchapterCount} Topics
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {chapter.pyqData.postCovid} PYQs (2020+)
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center p-4 bg-gradient-to-br from-setu-saffron/10 to-setu-saffron/5 rounded-xl border border-setu-saffron/20">
            <p className="text-2xl font-bold text-setu-saffron">{chapter.pyqData.postCovid}</p>
            <p className="text-xs text-muted-foreground mt-1">Recent PYQs</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-xl border border-border">
            <p className="text-2xl font-bold text-foreground">{chapter.pyqData.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Total PYQs</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-xl border border-border">
            <p className="text-2xl font-bold text-foreground">{subchapterCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Topics</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
