import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Clock, Target, TrendingUp, Zap, ArrowRight, Trophy, Shield, Sparkles, Brain, Flame, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChapterTestDialog from '@/components/test/ChapterTestDialog';
import MixedTestDialog from '@/components/test/MixedTestDialog';
import PYQTestDialog from '@/components/test/PYQTestDialog';
import TestExecution from '@/components/test/TestExecution';
import { ChapterSelection } from '@/hooks/useTestQuestions';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';

type TestType = 'chapter' | 'mixed' | 'pyq' | 'adaptive' | 'major' | 'weakness' | 'speed';
type ExecutableTestType = 'chapter' | 'mixed' | 'pyq' | 'adaptive';

interface TestConfig {
  type: ExecutableTestType;
  chapters?: ChapterSelection[];
  subject?: string;
  yearRange?: { start: number; end: number };
  questionCount?: number;
  timeLimitSeconds?: number;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showMixedSelect, setShowMixedSelect] = useState(false);
  const [showPYQSelect, setShowPYQSelect] = useState(false);
  const [activeTest, setActiveTest] = useState<TestConfig | null>(null);

  // Foundation test types — NO major test, NO competitive labels
  const foundationTestTypes = [
    {
      title: 'Chapter Test',
      description: `Test your understanding of a single ${classLabel} chapter`,
      icon: Target,
      time: '20-30 min',
      questions: '15-20',
      action: 'chapter' as TestType,
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/10',
      emoji: '🎯',
    },
    {
      title: 'Weakness Attack Test',
      description: 'A custom test generated directly from your lowest-scoring topics',
      icon: Flame,
      time: '30-45 min',
      questions: '20',
      action: 'weakness' as TestType,
      gradient: 'from-red-500 to-rose-500',
      bgGlow: 'bg-red-500/10',
      emoji: '🔥',
    },
    {
      title: 'Smart Mixed Test',
      description: 'AI picks questions balanced across your syllabus',
      icon: Zap,
      time: '45 min',
      questions: '30',
      action: 'adaptive' as TestType,
      gradient: 'from-purple-500 to-pink-500',
      bgGlow: 'bg-purple-500/10',
      emoji: '⚡',
    },
  ];

  // Competitive test types
  const majorTestDesc = isCuet
    ? 'Full CUET UG simulation — timed sections, NCERT-level MCQs. Test your speed and accuracy.'
    : isNeet
      ? 'Full NEET UG simulation — 3 hours, 180 questions, no pause. The real deal.'
      : 'Full JEE Main simulation — 3 hours, 90 questions, no pause. The real deal.';
  const majorTestQuestions = isCuet ? '200' : isNeet ? '180' : '90';

  const competitiveTestTypes = [
    {
      title: 'Full Mock Test',
      description: majorTestDesc,
      icon: Trophy,
      time: '180 min',
      questions: majorTestQuestions,
      action: 'major' as TestType,
      highlight: true,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
      badge: 'Highly Recommended',
      emoji: '🏆',
    },
    {
      title: 'Weakness-Based Test',
      description: 'High ROI. A brutal custom mock generated exclusively from your bottom 3 chapters.',
      icon: Flame,
      time: '60 min',
      questions: '30',
      action: 'weakness' as TestType,
      gradient: 'from-red-500 to-rose-600',
      bgGlow: 'bg-red-500/10',
      emoji: '🔥',
    },
    {
      title: 'Speed Run Test',
      description: 'Crucial for CUET & NEET. Strict time limits to force you to manage time pressure.',
      icon: Timer,
      time: '45 min',
      questions: '50',
      action: 'speed' as TestType,
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/10',
      emoji: '⏱️',
    },
    {
      title: 'PYQ Test',
      description: 'Real previous year questions to gauge actual exam standard.',
      icon: Clock,
      time: '45 min',
      questions: '25',
      action: 'pyq' as TestType,
      gradient: 'from-violet-500 to-purple-500',
      bgGlow: 'bg-violet-500/10',
      emoji: '📚',
    },
    {
      title: 'Chapter/Mixed Test',
      description: 'Classic format. Manually select chapters or subjects to test.',
      icon: TrendingUp,
      time: 'Custom',
      questions: 'Custom',
      action: 'mixed' as TestType,
      gradient: 'from-emerald-500 to-green-500',
      bgGlow: 'bg-emerald-500/10',
      emoji: '📊',
    }
  ];

  const testTypes = isFoundation ? foundationTestTypes : competitiveTestTypes;

  const handleStartTest = (action: TestType) => {
    switch (action) {
      case 'major': navigate('/major-test'); break;
      case 'chapter': setShowChapterSelect(true); break;
      case 'mixed': setShowMixedSelect(true); break;
      case 'pyq': setShowPYQSelect(true); break;
      case 'weakness':
        setActiveTest({ type: 'adaptive', questionCount: 30 }); // Engine will bias this to weaknesses
        break;
      case 'speed':
        setActiveTest({ type: 'adaptive', questionCount: 50, timeLimitSeconds: 45 * 60 });
        break;
      case 'adaptive':
        setActiveTest({ type: 'adaptive', questionCount: 15 });
        break;
    }
  };

  const handleStartChapterTest = (chapter: ChapterSelection) => {
    setShowChapterSelect(false);
    setActiveTest({ type: 'chapter', chapters: [chapter], questionCount: 10 });
  };

  const handleStartMixedTest = (chapters: ChapterSelection[]) => {
    setShowMixedSelect(false);
    setActiveTest({ type: 'mixed', chapters, questionCount: chapters.length * 5 });
  };

  const handleStartPYQTest = (config: { subject?: string; yearRange: { start: number; end: number }; count: number }) => {
    setShowPYQSelect(false);
    setActiveTest({ type: 'pyq', subject: config.subject, yearRange: config.yearRange, questionCount: config.count });
  };

  const handleTestComplete = () => setActiveTest(null);

  if (activeTest) {
    return (
      <MainLayout title="Test Execution">
        <TestExecution config={activeTest} onComplete={handleTestComplete} onExit={handleTestComplete} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isFoundation ? 'Chapter Test' : 'Test Engine'}>
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-accent/20 border border-border p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest border border-accent/20">
                  <Shield className="w-3.5 h-3.5" />
                  {isFoundation ? 'Test Mode' : 'Examination Engine'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">
                {isFoundation ? 'Chapter Tests' : 'Mock Test Arena'}
              </h1>
              <p className="text-white/60 text-lg max-w-lg">
                {isFoundation
                  ? `Test your understanding of ${classLabel} chapters. Every test helps you learn better!`
                  : 'Highly specialized test modes designed to expose conceptual gaps and destroy time pressure.'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            {isFoundation ? 'Choose Your Test' : 'Select Testing Protocol'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testTypes.map((test, i) => (
              <div
                key={i}
                className={cn(
                  "relative group bg-card border rounded-2xl p-6 cursor-pointer transition-all duration-300",
                  "hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                  (test as any).highlight
                    ? "border-accent/40 lg:col-span-3 hover:border-accent/60"
                    : "border-border hover:border-accent/30"
                )}
                onClick={() => handleStartTest(test.action)}
              >
                <div className={cn(
                  "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  test.bgGlow
                )} />

                <div className="relative flex items-start gap-4 h-full">
                  <div className="flex items-center justify-between w-full h-full">
                    <div className="flex items-start gap-5 flex-1 h-full flex-col sm:flex-row">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0",
                        test.gradient
                      )}>
                        <test.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl text-foreground group-hover:text-accent transition-colors">{test.title}</h3>
                            {(test as any).badge && (
                              <span className="px-2.5 py-0.5 bg-accent/20 text-accent text-[10px] rounded-full font-bold uppercase tracking-widest border border-accent/20">{(test as any).badge}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{test.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.time}</span>
                            <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {test.questions} Qs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChapterTestDialog open={showChapterSelect} onOpenChange={setShowChapterSelect} onStart={handleStartChapterTest} />
      <MixedTestDialog open={showMixedSelect} onOpenChange={setShowMixedSelect} onStart={handleStartMixedTest} />
      {!isFoundation && <PYQTestDialog open={showPYQSelect} onOpenChange={setShowPYQSelect} onStart={handleStartPYQTest} />}
    </MainLayout>
  );
};

export default TestPage;
