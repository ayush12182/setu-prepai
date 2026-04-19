import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Chapter, getChapterById } from '@/data/syllabus';
import { Subchapter, getSubchapterById } from '@/data/subchapters';
import { usePracticeQuestions } from '@/hooks/usePracticeQuestions';
import SubchapterSelector from '@/components/practice/SubchapterSelector';
import DifficultySelector from '@/components/practice/DifficultySelector';
import QuizInterface, { QuizResult } from '@/components/practice/QuizInterface';
import QuizResults from '@/components/practice/QuizResults';
import TestModeQuiz, { TestAnswer } from '@/components/practice/TestModeQuiz';
import TestResults from '@/components/practice/TestResults';
import { ArrowRight, Loader2, Target, Zap, Clock, Brain, Swords, Crosshair, Shuffle, Camera, Filter, Dna, FlaskConical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { Button } from '@/components/ui/button';
import { generateMockAnalytics } from '@/lib/analyticsSimulation';
import { generateDiagnosticReport } from '@/lib/diagnosisEngine';
import { generateDailyMission, generateDailyMissionAsync, DailyMission } from '@/lib/adaptiveEngine';
import { SnapAndSolveModal } from '@/components/practice/SnapAndSolveModal';
import { useStudentCycle } from '@/hooks/useStudentCycle';
import { PracticeTreeExplorer } from '@/components/practice/PracticeTreeExplorer';
import { LearningNode } from '@/hooks/useLearningEngine';

type PracticeMode = 'practice' | 'test';

type PracticeState =
  | { step: 'select-mode' }
  | { step: 'select-topic'; mode: 'focus' | 'weakness' | 'mixed' }
  | { step: 'select-difficulty'; node: LearningNode; adaptiveMode?: string }
  | { step: 'quiz'; node: LearningNode; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; adaptiveMode?: string }
  | { step: 'results'; node: LearningNode; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; result: QuizResult }
  | { step: 'test-results'; node: LearningNode; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; answers: TestAnswer[]; totalTime: number };

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation } = useClassContext();
  const [state, setState] = useState<PracticeState>({ step: 'select-mode' });
  const [initialized, setInitialized] = useState(false);
  const [mode, setMode] = useState<PracticeMode>('practice');
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);

  const { questions, loading, error, generationStatus, generateQuestions, submitPracticeReport, getSimilarQuestions, recordAttempt } = usePracticeQuestions();
  const { markComplete: markCycleComplete } = useStudentCycle();

  // Derive correct exam string from context
  const examParam = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE_MAINS';

  useEffect(() => {
    if (!user?.id) return;
    // Generate mission from REAL attempt history (async), falls back to date-rotating pool
    const examType = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';
    generateDailyMissionAsync(user.id, examType).then(setMission);

    // Fetch assigned tasks specifically for this user
    const fetchTasks = async () => {
      const { data } = await (supabase.from as any)('assigned_tasks')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'pending')
        .limit(3);
      if (data && data.length > 0) setPendingTasks(data);
    };
    fetchTasks();
  }, [user?.id, isNeet, isCuet]);

  useEffect(() => {
    if (initialized) return;
    const subchapterId = searchParams.get('subchapter');
    const modeParam = searchParams.get('mode');

    if (subchapterId) {
      // Legacy support or fallback
      const subchapter = getSubchapterById(subchapterId);
      if (subchapter) {
        const chapter = getChapterById(subchapter.chapterId);
        if (chapter) {
          const mockNode: LearningNode = { id: subchapter.id, name: subchapter.name, type: 'subtopic', parent_id: chapter.id, exam_type: examParam, subject_node_id: null, sort_order: 0 };
          setState({ step: 'select-difficulty', node: mockNode });
        }
      }
    } else if (modeParam === 'full-syllabus') {
      launchAdaptiveSession('Full Syllabus Test', 'Full Syllabus (21-Day)', 'mixed');
    }
    setInitialized(true);
  }, [searchParams, initialized]);

  const handleNodeSelect = (node: LearningNode) => {
    if (state.step === 'select-topic') {
      const modeName = state.mode === 'weakness' ? 'Weakness Extraction' : state.mode === 'mixed' ? 'Adaptive Mixed Subject' : undefined;
      setState({ step: 'select-difficulty', node, adaptiveMode: modeName });
    }
  };

  const handleDifficultySelect = async (difficulty: 'easy' | 'medium' | 'hard' | 'mixed') => {
    if (state.step !== 'select-difficulty') return;
    const { node, adaptiveMode } = state;
    setState({ step: 'quiz', node, difficulty, adaptiveMode });
    
    // Trigger question generation for the selected node
    generateQuestions(node.id, difficulty === 'mixed' ? 'medium' : difficulty, 10, examParam);
  };

  // --- ADAPTIVE LAUNCHERS ---
  const launchTopicSelection = (mode: 'focus' | 'weakness' | 'mixed') => {
    setState({ step: 'select-topic', mode });
  };

  const launchAdaptiveSession = async (title: string, modeName: string, intensity: 'easy' | 'medium' | 'hard' | 'mixed' = 'medium') => {
    const mockNode: LearningNode = { id: 'adaptive', name: title, type: 'root', parent_id: null, exam_type: examParam, subject_node_id: null, sort_order: 0 };
    
    setState({ step: 'quiz', node: mockNode, difficulty: intensity, adaptiveMode: modeName });
    generateQuestions(mockNode.id, intensity === 'mixed' ? 'medium' : intensity, 10, examParam);
  };

  const handleQuizComplete = (result: QuizResult) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'results', result });

    // Submit the practice report via Edge Function
    if (state.node) {
      const answers = questions.map(q => {
        const isWrong = result.wrongQuestions.some(wq => wq.id === q.id);
        return {
          topic: q.concept_tested || state.node!.name,
          subtopic: q.subchapter_id || state.node!.id,
          isCorrect: !isWrong
        };
      });

      submitPracticeReport(
        isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
        state.node.name,
        state.node.name,
        state.node.name,
        result.totalQuestions,
        result.correct,
        result.timeTakenSeconds,
        answers,
        state.adaptiveMode === 'task' ? state.node.name : undefined // passing task identifier if we launched a task
      );

      // ── 21-Day Cycle Completion ──
      if (state.adaptiveMode === 'Full Syllabus (21-Day)') {
        markCycleComplete();
      }
    }
  };

  const handleTestComplete = (answers: TestAnswer[], totalTime: number) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'test-results', answers, totalTime });
  };

  const handleRetry = async () => {
    if (state.step !== 'results' && state.step !== 'test-results') return;
    const { node, difficulty } = state;
    setState({ step: 'quiz', node, difficulty });
    generateQuestions(node.id, difficulty === 'mixed' ? 'medium' : difficulty, 10, examParam);
  };

  const handleGetSimilar = async (question: { concept_tested: string; question_text: string }) => {
    if (state.step !== 'quiz') return null;
    return getSimilarQuestions(question.concept_tested, state.node?.name || 'Mixed', 'Mixed', question.question_text);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading your practice space...</p>
      </div>
    );
  }

  return (
    <MainLayout title={isFoundation ? 'School Practice' : 'Adaptive Practice'}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {state.step === 'select-mode' && mission && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Training Center</h1>
                <p className="text-muted-foreground mt-1 text-lg">Your adaptive practice engine tailored by AI.</p>
              </div>
              <Button onClick={() => setIsSnapModalOpen(true)} className="gap-2 h-12 rounded-xl bg-accent text-primary font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all">
                <Camera size={20} /> Snap & Solve
              </Button>
            </div>

            {/* Assigned Tasks / Recommendations */}
            {pendingTasks.length > 0 && (
              <div 
                onClick={() => launchAdaptiveSession(pendingTasks[0].subtopic, 'task')}
                className="bg-card border-2 border-accent/50 rounded-3xl p-6 mb-6 cursor-pointer group hover:bg-accent/5 transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between z-10 relative">
                  <div>
                    <span className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest mb-1">
                      <Target className="w-4 h-4" /> Priority assigned by Teacher
                    </span>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-amber-500 transition-colors">
                      {pendingTasks[0].subtopic} Review
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Complete this targeted practice to improve your baseline accuracy.</p>
                  </div>
                  <Button className="shrink-0 rounded-xl font-bold" variant="outline">
                    Start Task <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Daily Mission Hero */}
            <div 
              onClick={() => launchAdaptiveSession(mission.targetChapter, `Fix ${mission.targetChapter} (Mission)`)}
              className="bg-gradient-to-r from-accent/10 via-amber-500/5 to-transparent border border-accent/30 rounded-3xl p-8 mb-10 cursor-pointer group hover:border-accent/60 hover:shadow-[0_0_30px_rgba(255,184,0,0.15)] transition-all overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent">
                      <Target className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-bold uppercase tracking-widest text-accent">Daily Mission</span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">{mission.title}</h2>
                  <p className="text-muted-foreground text-lg max-w-xl">{mission.description}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Est. Time: {mission.questionCount * 2} mins
                  </p>
                </div>
                <Button className="bg-accent text-primary-foreground rounded-2xl px-10 py-8 text-xl font-bold shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
                  Start Mission <Zap className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </div>

            {/* Subject-Centric Practice Grid (NEET Focus) */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" /> Master Your Subjects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'biology', name: 'Biology', icon: Dna, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { id: 'physics', name: 'Physics', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                  ].map((sub, i) => (
                    <div 
                      key={i} 
                      className={cn("bg-card border-2 rounded-3xl p-6 transition-all", sub.border)}
                    >
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg", sub.bg, sub.color)}>
                        <sub.icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-black mb-4">{sub.name}</h4>
                      
                      <div className="space-y-2">
                        <button 
                          onClick={() => launchTopicSelection('focus')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-xs font-bold group"
                        >
                          Chapter-wise Practice
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
                        </button>
                        <button 
                          onClick={() => launchAdaptiveSession(`${sub.name} PYQs`, 'PYQ', 'hard')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/10 transition-all text-xs font-bold text-orange-400 group"
                        >
                          Previous Year Questions (PYQs)
                          <Target className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => launchTopicSelection('weakness')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all text-xs font-bold text-red-400 group"
                        >
                          AI Weakness Attack
                          <Zap className="w-3 h-3 animate-pulse" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Modes Section */}
              <div className="bg-secondary/20 p-8 rounded-3xl border border-border/50">
                <h3 className="text-lg font-black text-foreground mb-4">Advanced Training Modes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => launchTopicSelection('mixed')}
                    className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shuffle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Smart Mixed Practice</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">All Subjects • Adaptive Mix</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => launchAdaptiveSession('Weakness Extraction', 'Weakness Extraction', 'hard')}
                    className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Swords className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Global Weakness Attack</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">AI Driven • Error History</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {state.step === 'select-topic' && (
            <PracticeTreeExplorer onSelectNode={handleNodeSelect} />
        )}

        {state.step === 'select-difficulty' && (
          <DifficultySelector node={state.node!} onSelectDifficulty={handleDifficultySelect} onBack={() => setState({ step: 'select-mode' })} />
        )}

        {state.step === 'quiz' && (
          <>
            {loading ? (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-6" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                {generationStatus === 'generating'
                  ? 'Generating your personalized questions...'
                  : generationStatus === 'polling'
                  ? 'AI is hard at work — almost ready...'
                  : state.adaptiveMode ? `Adapting Engine for ${state.adaptiveMode}...` : 'Loading Questions...'}
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs text-center">
                {generationStatus === 'polling'
                  ? 'Questions are being compiled and quality-checked. This takes up to 30 seconds on first run.'
                  : 'Selecting the perfect difficulty tier based on your accuracy.'}
              </p>
              {/* Premium Skeleton Loader */}
              <div className="w-full max-w-3xl mt-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-muted rounded-full w-32 animate-pulse" />
                  <div className="h-4 bg-muted rounded-full w-24 animate-pulse" />
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    <div className="h-5 bg-muted rounded-xl w-5/6 mb-4" />
                    <div className="h-3 bg-muted rounded-xl w-1/2 mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="h-14 bg-muted/50 rounded-2xl border border-dashed border-muted" />
                      <div className="h-14 bg-muted/50 rounded-2xl border border-dashed border-muted" />
                      <div className="h-14 bg-muted/50 rounded-2xl border border-dashed border-muted" />
                      <div className="h-14 bg-muted/50 rounded-2xl border border-dashed border-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error === 'generation_failed' ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Generation timed out</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                AI question generation can take up to 60 seconds on cold start. Click retry to try again.
              </p>
              <Button
                onClick={() => handleDifficultySelect(state.difficulty)}
                className="bg-accent text-primary-foreground rounded-xl font-bold"
              >
                Retry Generation
              </Button>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => handleDifficultySelect(state.difficulty)} variant="outline">Try again</Button>
            </div>
          ) : questions.length > 0 ? (
            <QuizInterface 
              questions={questions} 
              subchapterName={state.node?.name || 'Mixed Syllabus'} 
              difficulty={state.difficulty === 'mixed' ? 'medium' : state.difficulty} 
              onComplete={handleQuizComplete} 
              onGetSimilar={handleGetSimilar} 
              onRecordAttempt={(qId, sel, corr, time, conf) => recordAttempt(qId, sel, corr, time, conf, {
                subject: state.node?.id === 'adaptive' ? 'Mixed' : undefined,
                topic: state.node?.name,
                batch_id: profile?.batch_id // Inject batch context
              })} 
            />
          ) : null}
          </>
        )}

        {state.step === 'results' && (
          <QuizResults result={state.result} subchapterName={state.node?.name || 'Mixed Syllabus'} difficulty={state.difficulty === 'mixed' ? 'medium' : state.difficulty} onRetry={handleRetry} onChangeDifficulty={() => setState({ step: 'select-difficulty', node: state.node })} onGoHome={() => setState({ step: 'select-mode' })} />
        )}

      </div>
      
      {isSnapModalOpen && <SnapAndSolveModal onClose={() => setIsSnapModalOpen(false)} />}
    </MainLayout>
  );
};

export default PracticePage;
