import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { useSyllabusProgress } from '@/hooks/useSyllabusProgress';
import { Skeleton } from '@/components/ui/skeleton';

export const SyllabusTracker: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useSyllabusProgress();

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {progress.map((subjectData) => (
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
