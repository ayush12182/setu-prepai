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
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/neetSyllabus';
import { getSubchaptersByChapterId } from '@/data/subchapters';
import { ChapterSelection } from '@/hooks/useTestQuestions';
import { toast } from 'sonner';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { getSchoolSubjects, getSchoolChapters } from '@/data/schoolSyllabus';
import { getCuetChaptersBySubject, CUET_SUBJECTS } from '@/data/cuetSyllabus';


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
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, studentClass } = useClassContext();

  const subjectsData = isFoundation
    ? getSchoolSubjects(studentClass).map(s => ({
      id: s.key,
      name: s.label,
      chapters: getSchoolChapters(studentClass, s.key).map(c => ({ id: c.id, name: c.name }))
    }))
    : isCuet
      ? CUET_SUBJECTS.map(s => {
          let chapters = getCuetChaptersBySubject(s.key);
          if (chapters.length === 0) {
            if (s.key === 'physics') chapters = neetPhysicsChapters;
            else if (s.key === 'chemistry') chapters = neetChemistryChapters;
            else if (s.key === 'biology') chapters = neetBiologyChapters;
            else if (s.key === 'mathematics' || s.key === 'maths') chapters = mathsChapters;
          }
          return { id: s.key, name: s.label, chapters };
        })
      : isNeet
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
  const [selectedStyle, setSelectedStyle] = useState<string>('MIXED');
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
      subchapterName: firstSubchapter?.name,
      selectedStyle: selectedStyle
    });

    // Reset selections
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedStyle('MIXED');
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

          {selectedChapter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Style</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIXED">Mixed / Standard Style</SelectItem>
                  <SelectItem value="PYQ">JEE Main PYQ Style</SelectItem>
                  <SelectItem value="ALLEN">Allen Style</SelectItem>
                  <SelectItem value="RESONANCE">Resonance Style</SelectItem>
                  <SelectItem value="FIITJEE">FIITJEE Style</SelectItem>
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
