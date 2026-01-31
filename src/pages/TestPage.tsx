import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Clock, Target, TrendingUp, Zap, ChevronRight, Trophy } from 'lucide-react';
import ChapterTestDialog from '@/components/test/ChapterTestDialog';
import MixedTestDialog from '@/components/test/MixedTestDialog';
import PYQTestDialog from '@/components/test/PYQTestDialog';
import TestExecution from '@/components/test/TestExecution';
import { ChapterSelection } from '@/hooks/useTestQuestions';

type TestType = 'chapter' | 'mixed' | 'pyq' | 'adaptive' | 'major';
type ExecutableTestType = 'chapter' | 'mixed' | 'pyq' | 'adaptive';

interface TestConfig {
  type: ExecutableTestType;
  chapters?: ChapterSelection[];
  subject?: string;
  yearRange?: { start: number; end: number };
  questionCount?: number;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showMixedSelect, setShowMixedSelect] = useState(false);
  const [showPYQSelect, setShowPYQSelect] = useState(false);
  const [activeTest, setActiveTest] = useState<TestConfig | null>(null);

  const testTypes = [
    {
      title: 'Major Test',
      description: 'Full JEE Main simulation - 3 hours, 90 questions, no pause',
      icon: Trophy,
      time: '180 min',
      questions: '90',
      action: 'major' as TestType,
      highlight: true
    },
    {
      title: 'Chapter Test',
      description: 'Test your understanding of a single chapter',
      icon: Target,
      time: '30-60 min',
      questions: '20-30',
      action: 'chapter' as TestType
    },
    {
      title: 'Mixed Test',
      description: 'Combine multiple chapters for comprehensive revision',
      icon: TrendingUp,
      time: '60-90 min',
      questions: '40-60',
      action: 'mixed' as TestType
    },
    {
      title: 'PYQ Test',
      description: 'Practice with previous year questions (2004-2024)',
      icon: Clock,
      time: '45 min',
      questions: '25',
      action: 'pyq' as TestType
    },
    {
      title: 'Adaptive Test',
      description: 'AI selects questions based on your weak areas',
      icon: Zap,
      time: 'Varies',
      questions: 'Personalized',
      action: 'adaptive' as TestType
    }
  ];

  const handleStartTest = (action: TestType) => {
    switch (action) {
      case 'major':
        navigate('/major-test');
        break;
      case 'chapter':
        setShowChapterSelect(true);
        break;
      case 'mixed':
        setShowMixedSelect(true);
        break;
      case 'pyq':
        setShowPYQSelect(true);
        break;
      case 'adaptive':
        import('sonner').then(({ toast }) => {
          toast.info('Adaptive Test coming soon! We\'re analyzing your weak areas.');
        });
        break;
    }
  };

  const handleStartChapterTest = (chapter: ChapterSelection) => {
    setShowChapterSelect(false);
    setActiveTest({
      type: 'chapter',
      chapters: [chapter],
      questionCount: 10
    });
  };

  const handleStartMixedTest = (chapters: ChapterSelection[]) => {
    setShowMixedSelect(false);
    setActiveTest({
      type: 'mixed',
      chapters,
      questionCount: chapters.length * 5
    });
  };

  const handleStartPYQTest = (config: { subject?: string; yearRange: { start: number; end: number }; count: number }) => {
    setShowPYQSelect(false);
    setActiveTest({
      type: 'pyq',
      subject: config.subject,
      yearRange: config.yearRange,
      questionCount: config.count
    });
  };

  const handleTestComplete = () => {
    setActiveTest(null);
  };

  // If a test is active, show the test execution view
  if (activeTest) {
    return (
      <TestExecution
        config={activeTest}
        onComplete={handleTestComplete}
        onExit={handleTestComplete}
      />
    );
  }

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
              className={`bg-card border rounded-xl p-6 card-hover ${
                test.highlight 
                  ? 'border-primary/50 ring-2 ring-primary/20 md:col-span-2' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  test.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                }`}>
                  <test.icon className={`w-6 h-6 ${test.highlight ? '' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{test.title}</h3>
                    {test.highlight && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        Every 21 Days
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{test.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                    <span>⏱ {test.time}</span>
                    <span>📝 {test.questions} questions</span>
                  </div>
                  <button
                    className={`w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                      test.highlight 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    onClick={() => handleStartTest(test.action)}
                  >
                    {test.highlight ? 'Take Major Test' : 'Start Test'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter Test Dialog */}
      <ChapterTestDialog
        open={showChapterSelect}
        onOpenChange={setShowChapterSelect}
        onStart={handleStartChapterTest}
      />

      {/* Mixed Test Dialog */}
      <MixedTestDialog
        open={showMixedSelect}
        onOpenChange={setShowMixedSelect}
        onStart={handleStartMixedTest}
      />

      {/* PYQ Test Dialog */}
      <PYQTestDialog
        open={showPYQSelect}
        onOpenChange={setShowPYQSelect}
        onStart={handleStartPYQTest}
      />
    </MainLayout>
  );
};

export default TestPage;
