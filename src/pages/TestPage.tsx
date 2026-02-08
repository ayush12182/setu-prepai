import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Clock, Target, TrendingUp, Zap, ArrowRight, Trophy, Shield, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
      description: 'Full JEE Main simulation — 3 hours, 90 questions, no pause. The real deal.',
      icon: Trophy,
      time: '180 min',
      questions: '90',
      action: 'major' as TestType,
      highlight: true,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
      badge: 'Every 21 Days',
      emoji: '🏆',
    },
    {
      title: 'Chapter Test',
      description: 'Focus on one chapter — test depth of understanding',
      icon: Target,
      time: '30-60 min',
      questions: '20-30',
      action: 'chapter' as TestType,
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/10',
      emoji: '🎯',
    },
    {
      title: 'Mixed Test',
      description: 'Combine chapters for comprehensive multi-topic revision',
      icon: TrendingUp,
      time: '60-90 min',
      questions: '40-60',
      action: 'mixed' as TestType,
      gradient: 'from-emerald-500 to-green-500',
      bgGlow: 'bg-emerald-500/10',
      emoji: '📊',
    },
    {
      title: 'PYQ Test',
      description: 'Real previous year questions from 2004–2024',
      icon: Clock,
      time: '45 min',
      questions: '25',
      action: 'pyq' as TestType,
      gradient: 'from-violet-500 to-purple-500',
      bgGlow: 'bg-violet-500/10',
      emoji: '📚',
    },
    {
      title: 'Adaptive Test',
      description: 'AI picks questions based on your weak areas',
      icon: Zap,
      time: 'Varies',
      questions: 'Personalized',
      action: 'adaptive' as TestType,
      gradient: 'from-rose-500 to-pink-500',
      bgGlow: 'bg-rose-500/10',
      emoji: '⚡',
    }
  ];

  const handleStartTest = (action: TestType) => {
    switch (action) {
      case 'major': navigate('/major-test'); break;
      case 'chapter': setShowChapterSelect(true); break;
      case 'mixed': setShowMixedSelect(true); break;
      case 'pyq': setShowPYQSelect(true); break;
      case 'adaptive':
        import('sonner').then(({ toast }) => {
          toast.info('Adaptive Test coming soon! We\'re analyzing your weak areas.');
        });
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
      <MainLayout title="Test">
        <TestExecution config={activeTest} onComplete={handleTestComplete} onExit={handleTestComplete} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Test">
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  Battle Mode
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Test Arena
              </h1>
              <p className="text-white/60 text-base max-w-md">
                Challenge yourself with timed, exam-style tests. Every test brings you closer to your rank.
              </p>
            </div>

            <div className="flex gap-4">
              {[
                { label: 'Test Types', value: '5' },
                { label: 'PYQs', value: '20yr' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center min-w-[80px]">
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[11px] text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            Choose Your Test
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testTypes.map((test, i) => (
              <div
                key={i}
                className={cn(
                  "relative group bg-card border rounded-2xl p-6 cursor-pointer transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1 overflow-hidden",
                  test.highlight
                    ? "border-accent/40 sm:col-span-2 hover:border-accent/60"
                    : "border-border hover:border-accent/30"
                )}
                onClick={() => handleStartTest(test.action)}
              >
                {/* Hover glow */}
                <div className={cn(
                  "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  test.bgGlow
                )} />

                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md shrink-0",
                        test.gradient
                      )}>
                        <test.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors">{test.title}</h3>
                          {test.badge && (
                            <span className="px-2 py-0.5 bg-accent/15 text-accent text-xs rounded-full font-medium">{test.badge}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">⏱ {test.time}</span>
                          <span className="flex items-center gap-1">📝 {test.questions} questions</span>
                        </div>
                        <Button
                          size="sm"
                          className="group-hover:bg-accent group-hover:text-primary transition-all duration-300"
                        >
                          {test.highlight ? 'Take Major Test' : 'Start Test'}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 hidden sm:block">{test.emoji}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Tip */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-6">
          <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 select-none">🎯</div>
          <div className="relative flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Jeetu Bhaiya's Test Strategy</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Beta, test dene se mat daro. Galtiyan honi chahiye — lekin wahi galti dobaara nahi honi chahiye.
                Har test ke baad analysis karo, weak areas note karo, aur next time better karo!
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChapterTestDialog open={showChapterSelect} onOpenChange={setShowChapterSelect} onStart={handleStartChapterTest} />
      <MixedTestDialog open={showMixedSelect} onOpenChange={setShowMixedSelect} onStart={handleStartMixedTest} />
      <PYQTestDialog open={showPYQSelect} onOpenChange={setShowPYQSelect} onStart={handleStartPYQTest} />
    </MainLayout>
  );
};

export default TestPage;
