import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';

const PracticePage: React.FC = () => {
  const navigate = useNavigate();

  const subjects = [
    { subject: 'physics' as const, chapters: physicsChapters, progress: 35 },
    { subject: 'chemistry' as const, chapters: chemistryChapters, progress: 42 },
    { subject: 'maths' as const, chapters: mathsChapters, progress: 28 }
  ];

  return (
    <MainLayout title="Practice">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Practice MCQs
          </h1>
          <p className="text-muted-foreground">
            Choose a subject to start practicing questions by level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <SubjectCard
              key={s.subject}
              subject={s.subject}
              chaptersCount={s.chapters.length}
              progress={s.progress}
              onClick={() => navigate(`/learn?subject=${s.subject}`)}
            />
          ))}
        </div>

        {/* Practice Stats */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Your Practice Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">247</p>
              <p className="text-sm text-muted-foreground">Questions Solved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-setu-success">72%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-setu-saffron">1.5 min</p>
              <p className="text-sm text-muted-foreground">Avg Time</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-physics">15</p>
              <p className="text-sm text-muted-foreground">Chapters Done</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PracticePage;
