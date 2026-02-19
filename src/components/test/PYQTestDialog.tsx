import React, { useState } from 'react';
import { Clock, ChevronRight, Calendar, BookOpen } from 'lucide-react';
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
import { Slider } from '@/components/ui/slider';
import { useExamMode } from '@/contexts/ExamModeContext';

interface PYQTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (config: { subject?: string; yearRange: { start: number; end: number }; count: number }) => void;
}


const yearPresets = [
  { label: 'Last 5 Years (2020-2024)', start: 2020, end: 2024 },
  { label: 'Last 10 Years (2015-2024)', start: 2015, end: 2024 },
  { label: 'Last 15 Years (2010-2024)', start: 2010, end: 2024 },
  { label: 'All Time (2004-2024)', start: 2004, end: 2024 },
];

const PYQTestDialog: React.FC<PYQTestDialogProps> = ({
  open,
  onOpenChange,
  onStart
}) => {
  const { isNeet } = useExamMode();
  const subjectsData = isNeet
    ? [
      { id: 'all', name: 'All Subjects (Mixed)' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'biology', name: 'Biology' },
    ]
    : [
      { id: 'all', name: 'All Subjects (Mixed)' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'maths', name: 'Mathematics' },
    ];
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [yearPreset, setYearPreset] = useState<number>(1); // Default to last 10 years
  const [questionCount, setQuestionCount] = useState<number>(25);

  const currentYearRange = yearPresets[yearPreset];

  const handleStart = () => {
    onStart({
      subject: selectedSubject === 'all' ? undefined : selectedSubject,
      yearRange: { start: currentYearRange.start, end: currentYearRange.end },
      count: questionCount
    });
    // Reset to defaults
    setSelectedSubject('all');
    setYearPreset(1);
    setQuestionCount(25);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            PYQ Test (Previous Year Questions)
          </DialogTitle>
          <DialogDescription>
            Practice with actual JEE Mains & Advanced questions from 2004-2024
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Subject
            </label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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

          {/* Year Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Year Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {yearPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setYearPreset(idx)}
                  className={`p-3 rounded-lg border text-sm text-left transition-colors ${yearPreset === idx
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  <span className="font-medium">{preset.start}-{preset.end}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {preset.end - preset.start + 1} years
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Number of Questions</label>
              <span className="text-sm font-bold text-primary">{questionCount}</span>
            </div>
            <Slider
              value={[questionCount]}
              onValueChange={(val) => setQuestionCount(val[0])}
              min={10}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 (Quick)</span>
              <span>25 (Standard)</span>
              <span>50 (Full)</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-secondary/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              📝 {questionCount} questions from {currentYearRange.label.split('(')[0].trim()}
              {selectedSubject !== 'all' && ` • ${subjectsData.find(s => s.id === selectedSubject)?.name}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated time: ~{Math.round(questionCount * 2)} minutes
            </p>
          </div>

          <Button className="w-full" onClick={handleStart}>
            Start PYQ Test
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PYQTestDialog;
