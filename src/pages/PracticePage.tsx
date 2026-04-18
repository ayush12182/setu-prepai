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
import { ArrowRight, Loader2, Target, Zap, Clock, Brain, Swords, Crosshair, Shuffle, Camera, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { Button } from '@/components/ui/button';
import { generateMockAnalytics } from '@/lib/analyticsSimulation';
import { generateDiagnosticReport } from '@/lib/diagnosisEngine';
import { generateDailyMission, generateDailyMissionAsync, DailyMission } from '@/lib/adaptiveEngine';
import { SnapAndSolveModal } from '@/components/practice/SnapAndSolveModal';

type PracticeMode = 'practice' | 'test';

type PracticeState =
  | { step: 'select-mode' }
  | { step: 'select-topic'; mode: 'focus' | 'weakness' | 'mixed' }
  | { step: 'select-difficulty'; subchapter: Subchapter | null; chapter: Chapter | null; subject: string | null; adaptiveMode?: string }
  | { step: 'quiz'; subchapter: Subchapter | null; chapter: Chapter | null; subject: string | null; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; adaptiveMode?: string }
  | { step: 'results'; subchapter: Subchapter | null; chapter: Chapter | null; subject: string | null; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; result: QuizResult }
  | { step: 'test-results'; subchapter: Subchapter | null; chapter: Chapter | null; subject: string | null; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; answers: TestAnswer[]; totalTime: number };

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
    if (subchapterId) {
      const subchapter = getSubchapterById(subchapterId);
      if (subchapter) {
        const chapter = getChapterById(subchapter.chapterId);
        if (chapter) {
          setState({ step: 'select-difficulty', subchapter, chapter, subject: chapter.subject });
        }
      }
    }
    setInitialized(true);
  }, [searchParams, initialized]);

  const handleSubchapterSelect = (subchapter: Subchapter | null, chapter: Chapter | null, subject: string | null) => {
    if (state.step === 'select-topic') {
      const modeName = state.mode === 'weakness' ? 'Weakness Extraction' : state.mode === 'mixed' ? 'Adaptive Mixed Subject' : undefined;
      setState({ step: 'select-difficulty', subchapter, chapter, subject, adaptiveMode: modeName });
    }
  };

  const handleDifficultySelect = async (difficulty: 'easy' | 'medium' | 'hard' | 'mixed') => {
    if (state.step !== 'select-difficulty') return;
    const { subchapter, chapter, subject, adaptiveMode } = state;
    setState({ step: 'quiz', subchapter, chapter, subject, difficulty, adaptiveMode });
    
    // For now use B2C practice question fetcher, we will upgrade this to AssessmentEngine
    if (subchapter && chapter && subject) {
      await generateQuestions(subchapter.id, adaptiveMode || subchapter.name, chapter.id, chapter.name, subject, difficulty === 'mixed' ? 'medium' : difficulty, 10, examParam);
    } else {
      // Overall mode
      const mockChapter = { id: 'adaptive', name: 'Overall Syllabus', subject: 'Mixed' } as unknown as Chapter;
      const mockSub = { id: 'adaptive-sub', chapterId: 'adaptive', name: 'Overall Syllabus', jeeAsks: [], pyqFocus: { trends:[], patterns:[], traps:[] }, commonMistakes: [], jeetuLine: "Show me what you got." } as unknown as Subchapter;
      await generateQuestions(mockSub.id, adaptiveMode || 'Mixed', mockChapter.id, mockChapter.name, mockChapter.subject, difficulty === 'mixed' ? 'medium' : difficulty, 10, examParam);
    }
  };

  // --- ADAPTIVE LAUNCHERS ---
  const launchTopicSelection = (mode: 'focus' | 'weakness' | 'mixed') => {
    setState({ step: 'select-topic', mode });
  };

  const launchAdaptiveSession = async (title: string, modeName: string, intensity: 'easy' | 'medium' | 'hard' | 'mixed' = 'medium') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockChapter = { id: 'adaptive', name: title, subject: 'Mixed' } as unknown as Chapter;
    const mockSub = { id: 'adaptive-sub', chapterId: 'adaptive', name: title, jeeAsks: [], pyqFocus: { trends:[], patterns:[], traps:[] }, commonMistakes: [], jeetuLine: "Show me what you got." } as unknown as Subchapter;
    
    setState({ step: 'quiz', subchapter: mockSub, chapter: mockChapter, subject: mockChapter.subject, difficulty: intensity, adaptiveMode: modeName });
    await generateQuestions(mockSub.id, modeName, mockChapter.id, title, mockChapter.subject, intensity === 'mixed' ? 'medium' : intensity, 10, examParam);
  };

  const handleQuizComplete = (result: QuizResult) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'results', result });

    // Submit the practice report via Edge Function
    if (state.chapter && state.subject) {
      const answers = questions.map(q => {
        const isWrong = result.wrongQuestions.some(wq => wq.id === q.id);
        return {
          topic: q.concept_tested || state.chapter!.name,
          subtopic: q.subchapter_id,
          isCorrect: !isWrong
        };
      });

      submitPracticeReport(
        isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
        state.subject,
        state.chapter.name,
        state.subchapter?.name,
        result.totalQuestions,
        result.correct,
        result.timeTakenSeconds,
        answers,
        state.adaptiveMode === 'task' ? state.subchapter?.name : undefined // passing task identifier if we launched a task
      );
    }
  };

  const handleTestComplete = (answers: TestAnswer[], totalTime: number) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'test-results', answers, totalTime });
  };

  const handleRetry = async () => {
    if (state.step !== 'results' && state.step !== 'test-results') return;
    const { subchapter, chapter, subject, difficulty } = state;
    setState({ step: 'quiz', subchapter, chapter, subject, difficulty });
    if (subchapter && chapter && subject) {
      await generateQuestions(subchapter.id, subchapter.name, chapter.id, chapter.name, subject, difficulty === 'mixed' ? 'medium' : difficulty, 10, examParam);
    } else {
      await generateQuestions('adaptive-sub', 'Mixed', 'adaptive', 'Overall Syllabus', 'Mixed', difficulty === 'mixed' ? 'medium' : difficulty, 10, examParam);
    }
  };

  const handleGetSimilar = async (question: { concept_tested: string; question_text: string }) => {
    if (state.step !== 'quiz') return null;
    return getSimilarQuestions(question.concept_tested, state.subchapter?.name || 'Mixed', state.subject || 'Mixed', question.question_text);
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

            {/* Practice Modes Grid */}
            <h3 className="text-xl font-bold text-foreground mb-4">Practice Modes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div 
                onClick={() => launchTopicSelection('focus')}
                className="bg-card border border-border rounded-2xl p-6 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Crosshair className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">Focus Practice</h4>
                <p className="text-muted-foreground text-sm">Manually select a weak subject or chapter to drill down specific concepts.</p>
              </div>

              <div 
                onClick={() => launchTopicSelection('weakness')}
                className="bg-card border border-border rounded-2xl p-6 hover:border-red-500/50 hover:bg-red-500/5 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Swords className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">Weakness Attack</h4>
                <p className="text-muted-foreground text-sm">AI generates questions spanning entirely across your historical conceptual mistakes.</p>
              </div>

              <div 
                onClick={() => launchTopicSelection('mixed')}
                className="bg-card border border-border rounded-2xl p-6 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shuffle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">Smart Mixed Practice</h4>
                <p className="text-muted-foreground text-sm">A balanced, exam-like mix of Easy, Medium, and Hard questions across your chapters.</p>
              </div>

            </div>
          </div>
        )}

        {state.step === 'select-topic' && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Target your {state.mode === 'weakness' ? 'Weakness Attack' : state.mode === 'mixed' ? 'Mixed Practice' : 'Focus Session'}
              </h2>
              <Button variant="outline" onClick={() => setState({ step: 'select-mode' })}>Back to Modes</Button>
            </div>
            
            {(state.mode === 'weakness' || state.mode === 'mixed') && (
              <div 
                onClick={() => handleSubchapterSelect(null, null, null)}
                className="mb-6 bg-gradient-to-r from-accent/20 to-transparent border border-accent/30 rounded-xl p-5 hover:border-accent hover:shadow-[0_0_20px_rgba(var(--accent),0.15)] cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Overall Syllabus (Auto-pilot)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Let AI dynamically track your weaknesses and mix concepts across all subjects.</p>
                </div>
                <Button variant="ghost" className="group-hover:bg-accent group-hover:text-primary-foreground">
                  Start Overall
                </Button>
              </div>
            )}
            
            <SubchapterSelector onSelect={handleSubchapterSelect} />
          </div>
        )}

        {state.step === 'select-difficulty' && (
          <DifficultySelector subchapter={state.subchapter!} chapter={state.chapter!} subject={state.subject!} onSelectDifficulty={handleDifficultySelect} onBack={() => setState({ step: 'select-mode' })} />
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
              {/* Skeleton cards */}
              <div className="w-full max-w-2xl mt-8 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-muted rounded-xl" />
                      <div className="h-10 bg-muted rounded-xl" />
                      <div className="h-10 bg-muted rounded-xl" />
                      <div className="h-10 bg-muted rounded-xl" />
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
            <QuizInterface questions={questions} subchapterName={state.subchapter?.name || 'Mixed Syllabus'} difficulty={state.difficulty === 'mixed' ? 'medium' : state.difficulty} onComplete={handleQuizComplete} onGetSimilar={handleGetSimilar} onRecordAttempt={recordAttempt} />
          ) : null}
          </>
        )}

        {state.step === 'results' && (
          <QuizResults result={state.result} subchapterName={state.subchapter?.name || 'Mixed Syllabus'} difficulty={state.difficulty === 'mixed' ? 'medium' : state.difficulty} onRetry={handleRetry} onChangeDifficulty={() => setState({ step: 'select-difficulty', subchapter: state.subchapter, chapter: state.chapter, subject: state.subject })} onGoHome={() => setState({ step: 'select-mode' })} />
        )}

      </div>
      
      {isSnapModalOpen && <SnapAndSolveModal onClose={() => setIsSnapModalOpen(false)} />}
    </MainLayout>
  );
};

export default PracticePage;
