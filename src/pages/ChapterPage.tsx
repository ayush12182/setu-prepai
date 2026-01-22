import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getChapterById } from '@/data/syllabus';
import { 
  ArrowLeft, 
  BookOpen, 
  PenTool, 
  ClipboardCheck, 
  BarChart3,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ChapterPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learn');

  const chapter = chapterId ? getChapterById(chapterId) : null;

  if (!chapter) {
    return (
      <MainLayout title="Chapter Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chapter not found</p>
          <Button onClick={() => navigate('/learn')} className="mt-4">
            Back to Learn
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={chapter.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                chapter.weightage === 'High' ? 'bg-setu-saffron/10 text-setu-saffron' :
                chapter.weightage === 'Medium' ? 'bg-setu-warning/10 text-setu-warning' :
                'bg-muted text-muted-foreground'
              )}>
                {chapter.weightage} Weightage
              </span>
              <span className="text-xs text-muted-foreground">
                PYQ Frequency: {chapter.pyqFrequency}/10
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {chapter.name}
            </h1>
            <p className="text-muted-foreground capitalize">{chapter.subject}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="learn" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2">
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </TabsTrigger>
          </TabsList>

          {/* LEARN Tab */}
          <TabsContent value="learn" className="mt-6 space-y-6">
            {/* Topics Overview */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-setu-saffron" />
                Topics in this Chapter
              </h3>
              <div className="flex flex-wrap gap-2">
                {chapter.topics.map((topic) => (
                  <span 
                    key={topic}
                    className="px-3 py-1.5 bg-secondary text-sm rounded-lg text-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Mentor Tip */}
            <div className="mentor-tip">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-setu-saffron mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Jeetu Bhaiya's Tip</p>
                  <p className="text-muted-foreground text-sm">
                    Beta, {chapter.name} mein concept clarity sabse important hai. 
                    Pehle theory samjho, phir formulas, phir PYQs solve karo. 
                    Ye chapter {chapter.weightage.toLowerCase()} weightage ka hai, so isko seriously lo!
                  </p>
                </div>
              </div>
            </div>

            {/* Key Formulas */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Key Formulas</h3>
              <div className="space-y-3">
                <div className="p-3 bg-secondary rounded-lg font-mono text-sm">
                  v = u + at
                </div>
                <div className="p-3 bg-secondary rounded-lg font-mono text-sm">
                  s = ut + (1/2)at²
                </div>
                <div className="p-3 bg-secondary rounded-lg font-mono text-sm">
                  v² = u² + 2as
                </div>
              </div>
            </div>

            {/* Common Traps */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-setu-warning" />
                Common Traps to Avoid
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-setu-error">✗</span>
                  Mixing up scalar and vector quantities
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-setu-error">✗</span>
                  Forgetting to consider direction in projectile motion
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-setu-error">✗</span>
                  Using wrong sign convention for acceleration
                </li>
              </ul>
            </div>

            {/* Generate Notes Button */}
            <Button className="w-full btn-hero py-6 text-lg">
              Generate AI Notes for this Chapter
            </Button>
          </TabsContent>

          {/* PRACTICE Tab */}
          <TabsContent value="practice" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <div className="w-12 h-12 rounded-lg bg-setu-success/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h4 className="font-semibold mb-1">Level 1: Concept MCQs</h4>
                <p className="text-sm text-muted-foreground">Basic understanding check</p>
                <p className="text-xs text-setu-success mt-2">20 Questions</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <div className="w-12 h-12 rounded-lg bg-setu-warning/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold mb-1">Level 2: JEE Main</h4>
                <p className="text-sm text-muted-foreground">Previous year pattern</p>
                <p className="text-xs text-setu-warning mt-2">25 Questions</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <div className="w-12 h-12 rounded-lg bg-setu-error/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🔥</span>
                </div>
                <h4 className="font-semibold mb-1">Level 3: Advanced</h4>
                <p className="text-sm text-muted-foreground">JEE Advanced level</p>
                <p className="text-xs text-setu-error mt-2">15 Questions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <h4 className="font-semibold mb-1">Integer Type Questions</h4>
                <p className="text-sm text-muted-foreground">Numerical answer practice</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <h4 className="font-semibold mb-1">Match the Following</h4>
                <p className="text-sm text-muted-foreground">Matrix match questions</p>
              </div>
            </div>
          </TabsContent>

          {/* TEST Tab */}
          <TabsContent value="test" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <h4 className="font-semibold mb-2">Chapter Test</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  30 questions • 60 minutes • All topics covered
                </p>
                <Button className="w-full">Start Test</Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <h4 className="font-semibold mb-2">PYQ-Only Test</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  20 questions • Previous year questions only
                </p>
                <Button variant="outline" className="w-full">Start Test</Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <h4 className="font-semibold mb-2">Mixed Test</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Combines multiple chapters for revision
                </p>
                <Button variant="outline" className="w-full">Configure Test</Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <h4 className="font-semibold mb-2">Adaptive Test</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  AI picks questions based on your weak areas
                </p>
                <Button variant="outline" className="w-full">Start Adaptive</Button>
              </div>
            </div>
          </TabsContent>

          {/* ANALYZE Tab */}
          <TabsContent value="analyze" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-setu-saffron mb-2">68%</p>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-foreground mb-2">42</p>
                <p className="text-sm text-muted-foreground">Questions Attempted</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-setu-success mb-2">1.2 min</p>
                <p className="text-sm text-muted-foreground">Avg. Time/Question</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold mb-4">Mistake Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conceptual Errors</span>
                  <span className="text-sm font-medium text-setu-error">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Calculation Mistakes</span>
                  <span className="text-sm font-medium text-setu-warning">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Silly Mistakes</span>
                  <span className="text-sm font-medium text-setu-success">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Time Pressure</span>
                  <span className="text-sm font-medium text-muted-foreground">20%</span>
                </div>
              </div>
            </div>

            <div className="mentor-tip">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-setu-saffron mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Improvement Suggestion</p>
                  <p className="text-muted-foreground text-sm">
                    Beta, conceptual errors zyada hain. Pehle theory dobara padho, 
                    especially {chapter.topics[0]} aur {chapter.topics[1]}. 
                    Phir Level 1 MCQs se start karo.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ChapterPage;
