import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
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
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/biologySyllabus';
import { getSubchaptersByChapterId } from '@/data/subchapters';
import { ChapterSelection } from '@/hooks/useTestQuestions';
import { toast } from 'sonner';
import { useExamMode } from '@/contexts/ExamModeContext';


interface ChapterTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (chapter: ChapterSelection) => void;
}

const ChapterTestDialog: React.FC<ChapterTestDialogProps> = ({
  open,
  onOpenChange,
  onStart
}) => {
  const { isNeet } = useExamMode();
  const subjectsData = isNeet
    ? [
      { id: 'physics', name: 'Physics', chapters: neetPhysicsChapters },
      { id: 'chemistry', name: 'Chemistry', chapters: neetChemistryChapters },
      { id: 'biology', name: 'Biology', chapters: neetBiologyChapters },
    ]
    : [
      { id: 'physics', name: 'Physics', chapters: physicsChapters },
      { id: 'chemistry', name: 'Chemistry', chapters: chemistryChapters },
      { id: 'maths', name: 'Mathematics', chapters: mathsChapters },
    ];
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const selectedSubjectData = subjectsData.find(s => s.id === selectedSubject);

  const handleStart = () => {
    if (!selectedSubject || !selectedChapter) {
      toast.error('Please select a subject and chapter');
      return;
    }

    const chapter = selectedSubjectData?.chapters.find(c => c.id === selectedChapter);
    if (!chapter) {
      toast.error('Chapter not found');
      return;
    }

    const subchapters = getSubchaptersByChapterId(selectedChapter);
    const firstSubchapter = subchapters?.[0];

    onStart({
      chapterId: chapter.id,
      chapterName: chapter.name,
      subject: selectedSubject,
      subchapterId: firstSubchapter?.id,
      subchapterName: firstSubchapter?.name
    });

    // Reset selections
    setSelectedSubject('');
    setSelectedChapter('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Chapter Test
          </DialogTitle>
          <DialogDescription>
            Choose a subject and chapter for your test
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Select value={selectedSubject} onValueChange={(val) => {
              setSelectedSubject(val);
              setSelectedChapter('');
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

          {selectedSubject && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chapter</label>
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubjectData?.chapters.map(chapter => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className="w-full mt-4"
            onClick={handleStart}
            disabled={!selectedSubject || !selectedChapter}
          >
            Start Chapter Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterTestDialog;
