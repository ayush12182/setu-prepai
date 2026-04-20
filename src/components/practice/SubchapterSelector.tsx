import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClassContext } from '@/contexts/ClassContext';
import { getSchoolSubjects, getSchoolChapters } from '@/data/schoolSyllabus';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { getSubchaptersByChapterId, Subchapter } from '@/data/subchapters';
import {
  ChevronRight,
  ChevronDown,
  Atom,
  FlaskConical,
  Calculator,
  Target,
  Dna,
  BookOpenCheck,
  Brain,
  TrendingUp,
  Globe,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useExamMode } from '@/contexts/ExamModeContext';
import { neetBiologyChapters, neetChemistryChapters, neetPhysicsChapters } from '@/data/neetSyllabus';
import { CUET_SUBJECTS, getCuetChaptersBySubject } from '@/data/cuetSyllabus';
import { cn } from '@/lib/utils';

interface SubchapterSelectorProps {
  onSelect: (subchapter: Subchapter, chapter: Chapter, subject: string) => void;
}

const cuetIconMap: Record<string, any> = {
  english: BookOpenCheck, hindi: BookOpenCheck, general_test: Brain,
  economics: TrendingUp, accountancy: Calculator, business_studies: Globe,
  political_science: GraduationCap, history: BookOpen, geography: Globe,
  psychology: Brain, sociology: GraduationCap,
  physics: Atom, chemistry: FlaskConical, mathematics: Calculator, biology: Dna,
};

const cuetColorMap: Record<string, { color: string; hoverColor: string }> = {
  english: { color: 'bg-sky-500 text-white', hoverColor: 'hover:bg-sky-500/10 hover:border-sky-500/50' },
  hindi: { color: 'bg-orange-500 text-white', hoverColor: 'hover:bg-orange-500/10 hover:border-orange-500/50' },
  general_test: { color: 'bg-amber-500 text-white', hoverColor: 'hover:bg-amber-500/10 hover:border-amber-500/50' },
  economics: { color: 'bg-emerald-500 text-white', hoverColor: 'hover:bg-emerald-500/10 hover:border-emerald-500/50' },
  accountancy: { color: 'bg-blue-500 text-white', hoverColor: 'hover:bg-blue-500/10 hover:border-blue-500/50' },
  business_studies: { color: 'bg-purple-500 text-white', hoverColor: 'hover:bg-purple-500/10 hover:border-purple-500/50' },
  political_science: { color: 'bg-rose-500 text-white', hoverColor: 'hover:bg-rose-500/10 hover:border-rose-500/50' },
  history: { color: 'bg-amber-600 text-white', hoverColor: 'hover:bg-amber-600/10 hover:border-amber-600/50' },
  geography: { color: 'bg-teal-500 text-white', hoverColor: 'hover:bg-teal-500/10 hover:border-teal-500/50' },
  psychology: { color: 'bg-violet-500 text-white', hoverColor: 'hover:bg-violet-500/10 hover:border-violet-500/50' },
  sociology: { color: 'bg-pink-500 text-white', hoverColor: 'hover:bg-pink-500/10 hover:border-pink-500/50' },
};

const SubchapterSelector: React.FC<SubchapterSelectorProps> = ({ onSelect }) => {
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, studentClass } = useClassContext();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const getSubjects = () => {
    if (isCuet) {
      return CUET_SUBJECTS
        .filter(s => getCuetChaptersBySubject(s.key).length > 0)
        .map(s => ({
          id: s.key,
          name: s.label,
          chapters: getCuetChaptersBySubject(s.key) as Chapter[],
          icon: cuetIconMap[s.key] || BookOpen,
          color: cuetColorMap[s.key]?.color || 'bg-gray-500 text-white',
          hoverColor: cuetColorMap[s.key]?.hoverColor || 'hover:bg-gray-500/10 hover:border-gray-500/50',
        }));
    }
    if (isNeet) {
      return [
        { id: 'biology', name: 'Biology', chapters: neetBiologyChapters as Chapter[], icon: Dna, color: 'bg-emerald-500 text-white', hoverColor: 'hover:bg-emerald-500/10 hover:border-emerald-500/50' },
        { id: 'chemistry', name: 'Chemistry', chapters: neetChemistryChapters as Chapter[], icon: FlaskConical, color: 'bg-chemistry text-white', hoverColor: 'hover:bg-chemistry/10 hover:border-chemistry/50' },
        { id: 'physics', name: 'Physics', chapters: neetPhysicsChapters as Chapter[], icon: Atom, color: 'bg-physics text-white', hoverColor: 'hover:bg-physics/10 hover:border-physics/50' },
      ];
    }
    if (isFoundation) {
      const colorMap: Record<string, { color: string; hoverColor: string }> = {
        mathematics: { color: 'bg-violet-500 text-white', hoverColor: 'hover:bg-violet-500/10 hover:border-violet-500/50' },
        science: { color: 'bg-emerald-500 text-white', hoverColor: 'hover:bg-emerald-500/10 hover:border-emerald-500/50' },
        english: { color: 'bg-sky-500 text-white', hoverColor: 'hover:bg-sky-500/10 hover:border-sky-500/50' },
        social_science: { color: 'bg-amber-500 text-white', hoverColor: 'hover:bg-amber-500/10 hover:border-amber-500/50' },
        physics: { color: 'bg-blue-500 text-white', hoverColor: 'hover:bg-blue-500/10 hover:border-blue-500/50' },
        chemistry: { color: 'bg-emerald-500 text-white', hoverColor: 'hover:bg-emerald-500/10 hover:border-emerald-500/50' },
        biology: { color: 'bg-green-500 text-white', hoverColor: 'hover:bg-green-500/10 hover:border-green-500/50' },
      };
      const iconMap: Record<string, any> = { mathematics: Calculator, science: FlaskConical, english: BookOpenCheck, social_science: Globe, physics: Atom, chemistry: FlaskConical, biology: Dna };
      return getSchoolSubjects(studentClass).map(s => ({
        id: s.key,
        name: s.label,
        chapters: getSchoolChapters(studentClass, s.key) as Chapter[],
        icon: iconMap[s.key] || BookOpen,
        color: colorMap[s.key]?.color || 'bg-gray-500 text-white',
        hoverColor: colorMap[s.key]?.hoverColor || 'hover:bg-gray-500/10 hover:border-gray-500/50',
      }));
    }
    return [
      { id: 'physics', name: 'Physics', chapters: physicsChapters, icon: Atom, color: 'bg-physics text-white', hoverColor: 'hover:bg-physics/10 hover:border-physics/50' },
      { id: 'chemistry', name: 'Chemistry', chapters: chemistryChapters, icon: FlaskConical, color: 'bg-chemistry text-white', hoverColor: 'hover:bg-chemistry/10 hover:border-chemistry/50' },
      { id: 'maths', name: 'Mathematics', chapters: mathsChapters, icon: Calculator, color: 'bg-maths text-white', hoverColor: 'hover:bg-maths/10 hover:border-maths/50' },
    ];
  };

  const subjects = getSubjects();

  const getChaptersForSubject = () => {
    if (!selectedSubject) return [];
    const subject = subjects.find(s => s.id === selectedSubject);
    return subject?.chapters || [];
  };

  return (
    <div className="space-y-6">
      {!selectedSubject && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Choose a Subject</h2>
            <p className="text-muted-foreground">Select a subject to start practicing MCQs</p>
          </div>
          <div className={cn("grid gap-4", isCuet ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3")}>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={cn('p-6 rounded-xl border-2 border-border transition-all', subject.hoverColor)}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', subject.color)}>
                  <subject.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{subject.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{subject.chapters.length} chapters</p>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedSubject && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => { setSelectedSubject(null); setExpandedChapter(null); }}>
              ← Back to Subjects
            </Button>
            <span className="text-sm font-medium text-muted-foreground capitalize">{selectedSubject.replace('_', ' ')}</span>
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
                        <p className="text-xs text-muted-foreground">{subchapters.length} subtopics • {chapter.weightage} Weightage</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
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
                            <p className="text-xs text-muted-foreground line-clamp-1">{subchapter.jeeAsks[0]}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {isExpanded && subchapters.length === 0 && (
                    <div className="border-t border-border bg-secondary/30">
                      <button
                        onClick={() => onSelect(
                          {
                            id: `${chapter.id}-full`,
                            chapterId: chapter.id,
                            name: `Complete Chapter`,
                            jeeAsks: ["Foundation Practice"],
                            pyqFocus: { trends: [], patterns: [], traps: [] },
                            commonMistakes: [],
                            jeetuLine: "Practice makes perfect."
                          },
                          chapter,
                          selectedSubject
                        )}
                        className="w-full text-left p-3 pl-12 flex items-center justify-between hover:bg-secondary transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">Complete Chapter Practice</p>
                          <p className="text-xs text-muted-foreground">Test all concepts from this chapter</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
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
