import React, { useState } from 'react';
import { TrendingUp, Plus, X, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/neetSyllabus';
import { ChapterSelection } from '@/hooks/useTestQuestions';
import { toast } from 'sonner';
import { useExamMode } from '@/contexts/ExamModeContext';


interface MixedTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (chapters: ChapterSelection[]) => void;
}

const MixedTestDialog: React.FC<MixedTestDialogProps> = ({
  open,
  onOpenChange,
  onStart
}) => {
  const { isNeet } = useExamMode();
  const subjectsData = isNeet
    ? [
      { id: 'physics', name: 'Physics', chapters: neetPhysicsChapters, color: 'bg-physics/20 text-physics' },
      { id: 'chemistry', name: 'Chemistry', chapters: neetChemistryChapters, color: 'bg-chemistry/20 text-chemistry' },
      { id: 'biology', name: 'Biology', chapters: neetBiologyChapters, color: 'bg-green-500/20 text-green-700' },
    ]
    : [
      { id: 'physics', name: 'Physics', chapters: physicsChapters, color: 'bg-physics/20 text-physics' },
      { id: 'chemistry', name: 'Chemistry', chapters: chemistryChapters, color: 'bg-chemistry/20 text-chemistry' },
      { id: 'maths', name: 'Mathematics', chapters: mathsChapters, color: 'bg-maths/20 text-maths' },
    ];
  const [selectedChapters, setSelectedChapters] = useState<ChapterSelection[]>([]);
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const currentSubjectData = subjectsData.find(s => s.id === currentSubject);

  const handleAddChapter = () => {
    if (!currentSubject || !currentChapter) {
      toast.error('Please select a subject and chapter');
      return;
    }

    // Check if already added
    if (selectedChapters.some(c => c.chapterId === currentChapter)) {
      toast.error('This chapter is already added');
      return;
    }

    const chapter = currentSubjectData?.chapters.find(c => c.id === currentChapter);
    if (!chapter) return;

    setSelectedChapters([...selectedChapters, {
      chapterId: chapter.id,
      chapterName: chapter.name,
      subject: currentSubject
    }]);

    setCurrentChapter('');
  };

  const handleRemoveChapter = (chapterId: string) => {
    setSelectedChapters(selectedChapters.filter(c => c.chapterId !== chapterId));
  };

  const handleStart = () => {
    if (selectedChapters.length < 2) {
      toast.error('Please select at least 2 chapters for a mixed test');
      return;
    }
    onStart(selectedChapters);
    setSelectedChapters([]);
    setCurrentSubject('');
    setCurrentChapter('');
  };

  const getSubjectColor = (subject: string) => {
    return subjectsData.find(s => s.id === subject)?.color || 'bg-muted';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Mixed Test
          </DialogTitle>
          <DialogDescription>
            Select multiple chapters from any subject (minimum 2)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected Chapters */}
          {selectedChapters.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Chapters ({selectedChapters.length})</label>
              <div className="flex flex-wrap gap-2">
                {selectedChapters.map((chapter) => (
                  <Badge
                    key={chapter.chapterId}
                    variant="secondary"
                    className={`${getSubjectColor(chapter.subject)} flex items-center gap-1 pr-1`}
                  >
                    {chapter.chapterName}
                    <button
                      onClick={() => handleRemoveChapter(chapter.chapterId)}
                      className="ml-1 rounded-full hover:bg-foreground/10 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                ~{selectedChapters.length * 5} questions will be generated
              </p>
            </div>
          )}

          {/* Add Chapter Form */}
          <div className="space-y-3 p-4 border border-dashed border-border rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={currentSubject} onValueChange={(val) => {
                setCurrentSubject(val);
                setCurrentChapter('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectsData.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentSubject && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Chapter</label>
                <Select value={currentChapter} onValueChange={setCurrentChapter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSubjectData?.chapters
                      .filter(c => !selectedChapters.some(sc => sc.chapterId === c.id))
                      .map(chapter => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddChapter}
              disabled={!currentSubject || !currentChapter}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleStart}
            disabled={selectedChapters.length < 2}
          >
            Start Mixed Test ({selectedChapters.length} chapters)
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MixedTestDialog;
