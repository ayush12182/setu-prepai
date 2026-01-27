import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { getSubchaptersByChapterId, Subchapter } from '@/data/subchapters';
import { 
  ChevronRight, 
  ChevronDown,
  Atom,
  FlaskConical,
  Calculator,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubchapterSelectorProps {
  onSelect: (subchapter: Subchapter, chapter: Chapter, subject: string) => void;
}

const SubchapterSelector: React.FC<SubchapterSelectorProps> = ({ onSelect }) => {
  const [selectedSubject, setSelectedSubject] = useState<'physics' | 'chemistry' | 'maths' | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const subjects = [
    { 
      id: 'physics' as const, 
      name: 'Physics', 
      chapters: physicsChapters, 
      icon: Atom,
      color: 'bg-physics text-white',
      hoverColor: 'hover:bg-physics/10 hover:border-physics/50'
    },
    { 
      id: 'chemistry' as const, 
      name: 'Chemistry', 
      chapters: chemistryChapters, 
      icon: FlaskConical,
      color: 'bg-chemistry text-white',
      hoverColor: 'hover:bg-chemistry/10 hover:border-chemistry/50'
    },
    { 
      id: 'maths' as const, 
      name: 'Mathematics', 
      chapters: mathsChapters, 
      icon: Calculator,
      color: 'bg-maths text-white',
      hoverColor: 'hover:bg-maths/10 hover:border-maths/50'
    }
  ];

  const getChaptersForSubject = () => {
    if (!selectedSubject) return [];
    const subject = subjects.find(s => s.id === selectedSubject);
    return subject?.chapters || [];
  };

  return (
    <div className="space-y-6">
      {/* Subject Selection */}
      {!selectedSubject && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Choose a Subject</h2>
            <p className="text-muted-foreground">Select a subject to start practicing MCQs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={cn(
                  'p-6 rounded-xl border-2 border-border transition-all',
                  subject.hoverColor
                )}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', subject.color)}>
                  <subject.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{subject.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {subject.chapters.length} chapters
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Chapter & Subchapter Selection */}
      {selectedSubject && (
        <>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedSubject(null);
                setExpandedChapter(null);
              }}
            >
              ← Back to Subjects
            </Button>
            <span className="text-sm font-medium text-muted-foreground capitalize">
              {selectedSubject}
            </span>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Select a Topic</h2>
            <p className="text-sm text-muted-foreground">Choose a specific topic to practice</p>
          </div>

          <div className="space-y-2">
            {getChaptersForSubject().map((chapter) => {
              const subchapters = getSubchaptersByChapterId(chapter.id);
              const isExpanded = expandedChapter === chapter.id;

              return (
                <div key={chapter.id} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{chapter.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subchapters.length} subtopics • {chapter.weightage} Weightage
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && subchapters.length > 0 && (
                    <div className="border-t border-border bg-secondary/30">
                      {subchapters.map((subchapter) => (
                        <button
                          key={subchapter.id}
                          onClick={() => onSelect(subchapter, chapter, selectedSubject)}
                          className="w-full p-3 pl-12 flex items-center justify-between hover:bg-secondary transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{subchapter.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {subchapter.jeeAsks[0]}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {isExpanded && subchapters.length === 0 && (
                    <div className="border-t border-border bg-secondary/30 p-4 text-center">
                      <p className="text-sm text-muted-foreground">Topics coming soon...</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SubchapterSelector;
