// SubchapterPage - Smallest learning unit in PrepEntrance
// Follows: Subject → Chapter → Subchapter → Learn/Practice/Test/Analyze
// With PrepEntrance Mentor-style notes generation and PDF download

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { useExamMode } from '@/contexts/ExamModeContext';
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
import { useClassContext } from '@/contexts/ClassContext';

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
  const { isNeet } = useExamMode();
  const { isFoundation } = useClassContext();
  const examMode = isFoundation ? 'Foundation' : (isNeet ? 'NEET' : 'JEE');

  const { notes, isLoading, error, generateNotes } = useSubchapterNotes();

  // ── Analytics state ──────────────────────────────────────────
  const [analytics, setAnalytics] = useState<{
    attempted: number;
    correct: number;
    avgTime: number;
    testsTaken: number;
  } | null>(null);

  useEffect(() => {
    if (!subchapter) return;
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Fetch all attempts for questions in this subchapter
      const { data } = await supabase
        .from('question_attempts')
        .select('is_correct, time_taken_seconds, questions!inner(subchapter_id)')
        .eq('user_id', user.id)
        .eq('questions.subchapter_id', subchapter.id);
      if (data && data.length > 0) {
        const correct = data.filter((a: { is_correct?: boolean; time_taken_seconds?: number }) => a.is_correct).length;
        const totalTime = data.reduce((sum: number, a: { is_correct?: boolean; time_taken_seconds?: number }) => sum + (a.time_taken_seconds || 0), 0);
        // Count distinct test sessions by grouping (rough heuristic: every 10 attempts = 1 test)
        setAnalytics({
          attempted: data.length,
          correct,
          avgTime: Math.round(totalTime / data.length),
          testsTaken: Math.max(1, Math.floor(data.length / 8)),
        });
      } else {
        setAnalytics({ attempted: 0, correct: 0, avgTime: 0, testsTaken: 0 });
      }
    };
    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subchapter?.id]);

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
    generateNotes(subchapter, chapter.name, chapter.subject, examMode);
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
                className="bg-gradient-to-r from-prepentrance-saffron to-prepentrance-saffron/80 text-white"
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
              {/* A. What JEE Asks (Hidden in Foundation) */}
              {!isFoundation && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${subjectTextColors[chapter.subject]} bg-current/10 flex items-center justify-center`}>
                      <Target className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">What {isNeet ? 'NEET' : 'JEE'} Asks</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {subchapter.jeeAsks.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-prepentrance-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* C. Common Mistakes */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-prepentrance-error/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-prepentrance-error" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">Common Mistakes</h3>
                </div>
                <ul className="space-y-1.5">
                  {subchapter.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-prepentrance-error mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-foreground">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* B. Post-2020 PYQ Focus (Hidden in Foundation) */}
            {!isFoundation && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-prepentrance-saffron/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-prepentrance-saffron" />
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
                        <li key={index} className="text-xs text-prepentrance-error">⚠ {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* E. PrepEntrance Mentor Line */}
            <div className="bg-gradient-to-r from-prepentrance-saffron/10 to-prepentrance-green/10 border border-prepentrance-saffron/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-prepentrance-saffron mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-prepentrance-saffron mb-1">PrepEntrance Mentor Says:</p>
                  <p className="text-foreground italic text-sm">"{subchapter.setuLine || subchapter.setuLine}"</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ==================== PRACTICE TAB ==================== */}
          <TabsContent value="practice" className="mt-6 space-y-6">
            {activePracticeMode === 'integer' ? (
              <IntegerTypePractice
                subchapterId={subchapter.id}
                subchapterName={subchapter.name}
                chapterId={chapter.id}
                chapterName={chapter.name}
                subject={chapter.subject}
                examMode={examMode}
                onBack={() => setActivePracticeMode(null)}
              />
            ) : activePracticeMode === 'match' ? (
              <MatchTheFollowing
                subchapterId={subchapter.id}
                subchapterName={subchapter.name}
                chapterId={chapter.id}
                chapterName={chapter.name}
                subject={chapter.subject}
                examMode={examMode}
                onBack={() => setActivePracticeMode(null)}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-6 cursor-pointer card-hover group transition-all duration-200 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                    onClick={() => navigate(`/practice?subchapter=${subchapterId}&difficulty=easy`)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <h4 className="font-bold text-emerald-950">
                      {isFoundation ? 'Level 1: Basic Understanding' : 'Level 1: Concept'}
                    </h4>
                    <p className="text-sm text-emerald-800/80 mt-1">
                      {isFoundation ? 'Direct understanding questions' : 'Basic understanding MCQs'}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold mt-2.5">15 Questions • Easy</p>
                  </div>

                  <div
                    className="bg-amber-500/5 border border-amber-500/25 rounded-xl p-6 cursor-pointer card-hover group transition-all duration-200 hover:bg-amber-500/10 hover:border-amber-500/50"
                    onClick={() => navigate(`/practice?subchapter=${subchapterId}&difficulty=medium`)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-amber-500/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="font-bold text-amber-950">
                      {isFoundation ? 'Level 2: Application' : 'Level 2: Exam Pattern'}
                    </h4>
                    <p className="text-sm text-amber-800/80 mt-1">
                      {isFoundation ? 'Use the concept in real situations' : 'Previous year pattern'}
                    </p>
                    <p className="text-xs text-amber-600 font-bold mt-2.5">20 Questions • Medium</p>
                  </div>

                  <div
                    className="bg-red-500/5 border border-red-500/25 rounded-xl p-6 cursor-pointer card-hover group transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/50"
                    onClick={() => navigate(`/practice?subchapter=${subchapterId}&difficulty=hard`)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <h4 className="font-bold text-red-950">
                      {isFoundation ? 'Level 3: Advanced Thinking' : 'Level 3: Advanced'}
                    </h4>
                    <p className="text-sm text-red-800/80 mt-1">
                      {isFoundation ? 'Challenge questions requiring reasoning' : 'Competition level'}
                    </p>
                    <p className="text-xs text-red-600 font-bold mt-2.5">15 Questions • Hard</p>
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
                  chapters: [{
                    chapterId: chapter.id,
                    chapterName: chapter.name,
                    subject: chapter.subject,
                    subchapterId: subchapter.id,
                    subchapterName: subchapter.name
                  }],
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
                    <div className="w-12 h-12 rounded-lg bg-prepentrance-saffron/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-prepentrance-saffron" />
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
              <h3 className="font-semibold text-foreground mb-6">Your Performance in {subchapter.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">{analytics?.attempted ?? '—'}</p>
                  <p className="text-sm text-muted-foreground mt-1">Questions Attempted</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">
                    {analytics && analytics.attempted > 0
                      ? `${Math.round((analytics.correct / analytics.attempted) * 100)}%`
                      : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Accuracy</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">
                    {analytics && analytics.avgTime > 0 ? `${analytics.avgTime}s` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Avg Time / Q</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">{analytics?.testsTaken ?? '—'}</p>
                  <p className="text-sm text-muted-foreground mt-1">Tests Taken</p>
                </div>
              </div>
              {analytics && analytics.attempted === 0 && (
                <p className="text-sm text-muted-foreground text-center mt-6">
                  Start practicing to see your analytics here!
                </p>
              )}
              {analytics && analytics.attempted > 0 && (
                <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Progress Summary</p>
                  <p className="text-xs text-muted-foreground">
                    You've answered {analytics.correct} out of {analytics.attempted} questions correctly in this topic.
                    {analytics.correct / analytics.attempted >= 0.7
                      ? ' Great work! You are mastering this topic.'
                      : ' Keep practicing to improve your accuracy.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SubchapterPage;
