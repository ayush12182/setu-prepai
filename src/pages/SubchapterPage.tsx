// SubchapterPage - Smallest learning unit in SETU
// Follows: Subject → Chapter → Subchapter → Learn/Practice/Test/Analyze
// With Jeetu Bhaiya-style notes generation and PDF download

import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSubchapterById } from '@/data/subchapters';
import { getChapterById } from '@/data/syllabus';
import { useSubchapterNotes } from '@/hooks/useSubchapterNotes';
import { NotesSection } from '@/components/subchapter/NotesSection';
import TestExecution from '@/components/test/TestExecution';
import IntegerTypePractice from '@/components/practice/IntegerTypePractice';
import MatchTheFollowing from '@/components/practice/MatchTheFollowing';
import {
  BookOpen,
  Target,
  FileText,
  BarChart3,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Sparkles
} from 'lucide-react';

const SubchapterPage: React.FC = () => {
  const { subchapterId } = useParams<{ subchapterId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'learn';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeTest, setActiveTest] = useState<{ type: 'chapter' | 'pyq' } | null>(null);
  const [activePracticeMode, setActivePracticeMode] = useState<'integer' | 'match' | null>(null);

  const subchapter = subchapterId ? getSubchapterById(subchapterId) : undefined;
  const chapter = subchapter ? getChapterById(subchapter.chapterId) : undefined;

  const { notes, isLoading, error, generateNotes } = useSubchapterNotes();

  if (!subchapter || !chapter) {
    return (
      <MainLayout title="Not Found">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Subchapter not found</p>
          <Button onClick={() => navigate('/learn')}>Back to Learn</Button>
        </div>
      </MainLayout>
    );
  }

  const handleGenerateNotes = () => {
    generateNotes(subchapter, chapter.name, chapter.subject);
  };

  const subjectColors: Record<string, string> = {
    physics: 'from-physics/20 to-physics/5 border-physics/30',
    chemistry: 'from-chemistry/20 to-chemistry/5 border-chemistry/30',
    maths: 'from-maths/20 to-maths/5 border-maths/30'
  };

  const subjectTextColors: Record<string, string> = {
    physics: 'text-physics',
    chemistry: 'text-chemistry',
    maths: 'text-maths'
  };

  return (
    <MainLayout title={subchapter.name}>
      <div className="space-y-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate('/learn')}
            className="hover:text-foreground transition-colors"
          >
            Learn
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/chapter/${chapter.id}`)}
            className="hover:text-foreground transition-colors capitalize"
          >
            {chapter.name}
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">{subchapter.name}</span>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/chapter/${chapter.id}`)}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {chapter.name}
        </Button>

        {/* Subchapter Title Card */}
        <div className={`bg-gradient-to-br ${subjectColors[chapter.subject]} border rounded-xl p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${subjectTextColors[chapter.subject]} capitalize mb-1`}>
                {chapter.subject} • {chapter.name}
              </p>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {subchapter.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerateNotes}
                disabled={isLoading}
                className="bg-gradient-to-r from-setu-saffron to-setu-saffron/80 text-white"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {isLoading ? 'Generating...' : 'Get Notes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs: Learn / Practice / Test / Analyze */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== LEARN TAB ==================== */}
          <TabsContent value="learn" className="mt-6 space-y-6">

            {/* AI Generated Notes Section */}
            <NotesSection
              notes={notes}
              isLoading={isLoading}
              error={error}
              subchapterName={subchapter.name}
              chapterName={chapter.name}
              subject={chapter.subject}
              onGenerate={handleGenerateNotes}
            />

            {/* Quick Reference Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* A. What JEE Asks */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${subjectTextColors[chapter.subject]} bg-current/10 flex items-center justify-center`}>
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">What JEE Asks</h3>
                </div>
                <ul className="space-y-1.5">
                  {subchapter.jeeAsks.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-setu-success mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* C. Common Mistakes */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-setu-error/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-setu-error" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">Common Mistakes</h3>
                </div>
                <ul className="space-y-1.5">
                  {subchapter.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-setu-error mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-foreground">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* B. Post-2020 PYQ Focus */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-setu-saffron/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-setu-saffron" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Post-2020 PYQ Focus</h3>
                  <p className="text-xs text-muted-foreground">Recent exam trends</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Trends</h4>
                  <ul className="space-y-1">
                    {subchapter.pyqFocus.trends.map((item, index) => (
                      <li key={index} className="text-xs text-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Patterns</h4>
                  <ul className="space-y-1">
                    {subchapter.pyqFocus.patterns.map((item, index) => (
                      <li key={index} className="text-xs text-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Traps</h4>
                  <ul className="space-y-1">
                    {subchapter.pyqFocus.traps.map((item, index) => (
                      <li key={index} className="text-xs text-setu-error">⚠ {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* E. Jeetu Bhaiya Line */}
            <div className="bg-gradient-to-r from-setu-saffron/10 to-setu-green/10 border border-setu-saffron/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-setu-saffron mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-setu-saffron mb-1">Jeetu Bhaiya Says:</p>
                  <p className="text-foreground italic text-sm">"{subchapter.jeetuLine}"</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ==================== PRACTICE TAB ==================== */}
          <TabsContent value="practice" className="mt-6 space-y-6">
            {activePracticeMode === 'integer' ? (
              <IntegerTypePractice
                subchapterName={subchapter.name}
                chapterName={chapter.name}
                subject={chapter.subject}
                onBack={() => setActivePracticeMode(null)}
              />
            ) : activePracticeMode === 'match' ? (
              <MatchTheFollowing
                subchapterName={subchapter.name}
                chapterName={chapter.name}
                subject={chapter.subject}
                onBack={() => setActivePracticeMode(null)}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover group"
                    onClick={() => navigate(`/practice?subchapter=${subchapterId}&difficulty=easy`)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-setu-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <h4 className="font-semibold text-foreground">Level 1: Concept</h4>
                    <p className="text-sm text-muted-foreground mt-1">Basic understanding MCQs</p>
                    <p className="text-xs text-setu-success font-medium mt-2">15 Questions • Easy</p>
                  </div>

                  <div
                    className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover group"
                    onClick={() => navigate(`/practice?subchapter=${subchapterId}&difficulty=medium`)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-setu-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="font-semibold text-foreground">Level 2: Exam Pattern</h4>
                    <p className="text-sm text-muted-foreground mt-1">Previous year pattern</p>
                    <p className="text-xs text-setu-warning font-medium mt-2">20 Questions • Medium</p>
                  </div>

                  <div
                    className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover group"
                    onClick={() => navigate(`/practice?subchapter=${subchapterId}&difficulty=hard`)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-setu-error/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <h4 className="font-semibold text-foreground">Level 3: Advanced</h4>
                    <p className="text-sm text-muted-foreground mt-1">Competition level</p>
                    <p className="text-xs text-setu-error font-medium mt-2">15 Questions • Hard</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover"
                    onClick={() => setActivePracticeMode('integer')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🔢</span>
                      <h4 className="font-semibold">Integer Type</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Numerical answer practice</p>
                    <p className="text-xs text-primary font-medium mt-2">5 Questions • Type your answer</p>
                  </div>
                  <div
                    className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover"
                    onClick={() => setActivePracticeMode('match')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🔗</span>
                      <h4 className="font-semibold">Match the Following</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Matrix matching practice</p>
                    <p className="text-xs text-primary font-medium mt-2">3 Sets • Click to match</p>
                  </div>
                </div>

                {/* Mentor Tip */}
                <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium">Tip:</span> Start with Level 1 to build foundation, then tackle Integer Type and Match the Following for exam-pattern mastery.
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          {/* ==================== TEST TAB ==================== */}
          <TabsContent value="test" className="mt-6 space-y-6">
            {activeTest ? (
              <TestExecution
                config={{
                  type: activeTest.type === 'pyq' ? 'pyq' : 'chapter',
                  chapters: activeTest.type === 'chapter' ? [{
                    chapterId: chapter.id,
                    chapterName: chapter.name,
                    subject: chapter.subject,
                    subchapterId: subchapter.id,
                    subchapterName: subchapter.name
                  }] : undefined,
                  subject: activeTest.type === 'pyq' ? chapter.subject : undefined,
                  questionCount: activeTest.type === 'pyq' ? 10 : undefined,
                }}
                onComplete={() => setActiveTest(null)}
                onExit={() => setActiveTest(null)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover"
                  onClick={() => setActiveTest({ type: 'chapter' })}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-physics/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-physics" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Subchapter Test</h4>
                      <p className="text-sm text-muted-foreground">15 mins • 10 Questions</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Quick test covering all concepts from {subchapter.name}
                  </p>
                </div>

                <div
                  className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover"
                  onClick={() => setActiveTest({ type: 'pyq' })}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-setu-saffron/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-setu-saffron" />
                    </div>
                    <div>
                      <h4 className="font-semibold">PYQ Test</h4>
                      <p className="text-sm text-muted-foreground">20 mins • Past Year Questions</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real JEE questions from this topic
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ==================== ANALYZE TAB ==================== */}
          <TabsContent value="analyze" className="mt-6 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Performance in {subchapter.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Questions Attempted</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-muted-foreground">--</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-muted-foreground">--</p>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-muted-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Tests Taken</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-6">
                Start practicing to see your analytics here!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SubchapterPage;
