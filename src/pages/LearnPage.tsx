import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { ChapterCard } from '@/components/ui/ChapterCard';
import { Button } from '@/components/ui/button';
import { 
  physicsChapters, 
  chemistryChapters, 
  mathsChapters,
  type Subject,
  type Chapter
} from '@/data/syllabus';
import { cn } from '@/lib/utils';

const LearnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSubject = (searchParams.get('subject') as Subject) || null;
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(initialSubject);

  const subjects = [
    { subject: 'physics' as const, chapters: physicsChapters, progress: 35 },
    { subject: 'chemistry' as const, chapters: chemistryChapters, progress: 42 },
    { subject: 'maths' as const, chapters: mathsChapters, progress: 28 }
  ];

  const getChapters = (): Chapter[] => {
    if (!selectedSubject) return [];
    const subjectData = subjects.find(s => s.subject === selectedSubject);
    return subjectData?.chapters || [];
  };

  return (
    <MainLayout title="Learn">
      <div className="space-y-6">
        {/* Subject Selection */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            {selectedSubject ? 'Select Chapter' : 'Select Subject'}
          </h1>
          <p className="text-muted-foreground">
            {selectedSubject 
              ? 'Choose a chapter to start learning with AI-powered notes'
              : 'Pick a subject to explore chapters and topics'
            }
          </p>
        </div>

        {/* Back Button */}
        {selectedSubject && (
          <Button 
            variant="ghost" 
            onClick={() => setSelectedSubject(null)}
            className="text-muted-foreground"
          >
            ← Back to Subjects
          </Button>
        )}

        {/* Subject Cards */}
        {!selectedSubject && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map((s, index) => (
              <div 
                key={s.subject}
                className={`animate-fade-in stagger-${index + 1}`}
                style={{ opacity: 0 }}
              >
                <SubjectCard
                  subject={s.subject}
                  chaptersCount={s.chapters.length}
                  progress={s.progress}
                  onClick={() => setSelectedSubject(s.subject)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Chapter List */}
        {selectedSubject && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getChapters().map((chapter, index) => (
              <div 
                key={chapter.id}
                className={`animate-fade-in stagger-${Math.min(index + 1, 8)}`}
                style={{ opacity: 0 }}
              >
                <ChapterCard
                  chapter={chapter}
                  progress={Math.floor(Math.random() * 60)}
                  onClick={() => navigate(`/chapter/${chapter.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LearnPage;
