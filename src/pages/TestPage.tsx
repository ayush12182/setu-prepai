import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Clock, Target, TrendingUp, Zap, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { getSubchaptersByChapterId } from '@/data/subchapters';
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

// Create structured subject data for the dropdown
const subjectsData = [
  { id: 'physics', name: 'Physics', chapters: physicsChapters },
  { id: 'chemistry', name: 'Chemistry', chapters: chemistryChapters },
  { id: 'maths', name: 'Mathematics', chapters: mathsChapters }
];

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  const testTypes = [
    {
      title: 'Chapter Test',
      description: 'Test your understanding of a single chapter',
      icon: Target,
      time: '30-60 min',
      questions: '20-30',
      action: 'chapter'
    },
    {
      title: 'Mixed Test',
      description: 'Combine multiple chapters for comprehensive revision',
      icon: TrendingUp,
      time: '60-90 min',
      questions: '40-60',
      action: 'mixed'
    },
    {
      title: 'PYQ Test',
      description: 'Practice with previous year questions only',
      icon: Clock,
      time: '45 min',
      questions: '25',
      action: 'pyq'
    },
    {
      title: 'Adaptive Test',
      description: 'AI selects questions based on your weak areas',
      icon: Zap,
      time: 'Varies',
      questions: 'Personalized',
      action: 'adaptive'
    }
  ];

  const handleStartTest = (action: string) => {
    switch (action) {
      case 'chapter':
        setShowChapterSelect(true);
        break;
      case 'mixed':
        toast.info('Mixed Test coming soon! For now, try Chapter Test.');
        break;
      case 'pyq':
        toast.info('PYQ Test coming soon! For now, try Chapter Test.');
        break;
      case 'adaptive':
        toast.info('Adaptive Test coming soon! For now, try Chapter Test.');
        break;
    }
  };

  const handleStartChapterTest = () => {
    if (!selectedSubject || !selectedChapter) {
      toast.error('Please select a subject and chapter');
      return;
    }
    
    // Find the first subchapter of the selected chapter
    const subchapters = getSubchaptersByChapterId(selectedChapter);
    
    if (subchapters && subchapters.length > 0) {
      const firstSubchapter = subchapters[0];
      navigate(`/practice?subchapter=${firstSubchapter.id}&difficulty=medium&mode=test`);
      setShowChapterSelect(false);
    } else {
      toast.error('No subchapters found for this chapter');
    }
  };

  const selectedSubjectData = subjectsData.find(s => s.id === selectedSubject);

  return (
    <MainLayout title="Test">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Take a Test
          </h1>
          <p className="text-muted-foreground">
            Challenge yourself with timed tests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testTypes.map((test, i) => (
            <div 
              key={i}
              className="bg-card border border-border rounded-xl p-6 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <test.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{test.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{test.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                    <span>⏱ {test.time}</span>
                    <span>📝 {test.questions} questions</span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleStartTest(test.action)}
                  >
                    Start Test
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter Selection Dialog */}
      <Dialog open={showChapterSelect} onOpenChange={setShowChapterSelect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Select Chapter
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
              onClick={handleStartChapterTest}
              disabled={!selectedSubject || !selectedChapter}
            >
              Start Chapter Test
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TestPage;
