import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';

export const SyllabusTracker: React.FC = () => {
  const navigate = useNavigate();

  const subjects = [
    {
      subject: 'physics' as const,
      chaptersCount: physicsChapters.length,
      progress: 35
    },
    {
      subject: 'chemistry' as const,
      chaptersCount: chemistryChapters.length,
      progress: 42
    },
    {
      subject: 'maths' as const,
      chaptersCount: mathsChapters.length,
      progress: 28
    }
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Syllabus Tracker</h2>
        <button 
          onClick={() => navigate('/learn')}
          className="text-sm text-setu-saffron hover:underline font-medium"
        >
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.subject}
            subject={subject.subject}
            chaptersCount={subject.chaptersCount}
            progress={subject.progress}
            onClick={() => navigate(`/learn?subject=${subject.subject}`)}
          />
        ))}
      </div>
    </section>
  );
};
