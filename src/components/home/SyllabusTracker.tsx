import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { useSyllabusProgress } from '@/hooks/useSyllabusProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { useExamMode } from '@/contexts/ExamModeContext';

export const SyllabusTracker: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useSyllabusProgress();
  const { isCuet } = useExamMode();

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Syllabus Tracker</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  // For CUET, show top subjects (limit to 6 for dashboard)
  const displayProgress = isCuet ? progress.slice(0, 6) : progress;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Syllabus Tracker</h2>
        <button 
          onClick={() => navigate('/learn')}
          className="text-sm text-accent hover:text-setu-saffron-dark font-medium transition-colors"
        >
          View All
        </button>
      </div>
      
      <div className={`grid gap-4 ${isCuet ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
        {displayProgress.map((subjectData) => (
          <SubjectCard
            key={subjectData.subject}
            subject={subjectData.subject}
            chaptersCount={subjectData.chaptersCount}
            progress={subjectData.progress}
            onClick={() => navigate(`/learn?subject=${subjectData.subject}`)}
          />
        ))}
      </div>
    </section>
  );
};
