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
import { Loader2, Target, Zap, Clock, Brain, Swords, Crosshair, Shuffle, Camera, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { Button } from '@/components/ui/button';
import { generateMockAnalytics } from '@/lib/analyticsSimulation';
import { generateDiagnosticReport } from '@/lib/diagnosisEngine';
import { generateDailyMission, DailyMission } from '@/lib/adaptiveEngine';
import { SnapAndSolveModal } from '@/components/practice/SnapAndSolveModal';

type PracticeMode = 'practice' | 'test';

type PracticeState =
  | { step: 'select-mode' }
  | { step: 'select-topic' }
  | { step: 'select-difficulty'; subchapter: Subchapter; chapter: Chapter; subject: string }
  | { step: 'quiz'; subchapter: Subchapter; chapter: Chapter; subject: string; difficulty: 'easy' | 'medium' | 'hard'; adaptiveMode?: string }
  | { step: 'results'; subchapter: Subchapter; chapter: Chapter; subject: string; difficulty: 'easy' | 'medium' | 'hard'; result: QuizResult }
  | { step: 'test-results'; subchapter: Subchapter; chapter: Chapter; subject: string; difficulty: 'easy' | 'medium' | 'hard'; answers: TestAnswer[]; totalTime: number };

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation } = useClassContext();
  const [state, setState] = useState<PracticeState>({ step: 'select-mode' });
  const [initialized, setInitialized] = useState(false);
  const [mode, setMode] = useState<PracticeMode>('practice');
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);

  const { questions, loading, error, generateQuestions, getSimilarQuestions, recordAttempt } = usePracticeQuestions();

  useEffect(() => {
    // Generate the adaptive mission for today
    const simData = generateMockAnalytics(isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE');
    const diagReport = generateDiagnosticReport(simData);
    setMission(generateDailyMission(diagReport));
  }, [isNeet, isCuet]);

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

  const handleSubchapterSelect = (subchapter: Subchapter, chapter: Chapter, subject: string) => {
    setState({ step: 'select-difficulty', subchapter, chapter, subject });
  };

  const handleDifficultySelect = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (state.step !== 'select-difficulty') return;
    const { subchapter, chapter, subject } = state;
    setState({ step: 'quiz', subchapter, chapter, subject, difficulty });
    await generateQuestions(subchapter.id, subchapter.name, chapter.id, chapter.name, subject, difficulty, 5);
  };

  // --- ADAPTIVE LAUNCHERS ---
  const launchAdaptiveSession = async (title: string, modeName: string, intensity: 'easy' | 'medium' | 'hard' = 'medium') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockChapter: Chapter = { id: 'adaptive', name: title, subject: 'Mixed' as any };
    const mockSub: Subchapter = { id: 'adaptive-sub', chapterId: 'adaptive', name: title, jeeAsks: [], pyqFocus: { trends:[], patterns:[], traps:[] }, commonMistakes: [], jeetuLine: "Show me what you got." };
    
    setState({ step: 'quiz', subchapter: mockSub, chapter: mockChapter, subject: mockChapter.subject, difficulty: intensity, adaptiveMode: modeName });
    await generateQuestions(mockSub.id, modeName, mockChapter.id, title, mockChapter.subject, intensity, 10);
  };

  const handleQuizComplete = (result: QuizResult) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'results', result });
  };

  const handleTestComplete = (answers: TestAnswer[], totalTime: number) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'test-results', answers, totalTime });
  };

  const handleRetry = async () => {
    if (state.step !== 'results' && state.step !== 'test-results') return;
    const { subchapter, chapter, subject, difficulty } = state;
    setState({ step: 'quiz', subchapter, chapter, subject, difficulty });
    await generateQuestions(subchapter.id, subchapter.name, chapter.id, chapter.name, subject, difficulty, 5);
  };

  const handleGetSimilar = async (question: { concept_tested: string; question_text: string }) => {
    if (state.step !== 'quiz') return null;
    return getSimilarQuestions(question.concept_tested, state.subchapter.name, state.subject, question.question_text);
  };

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
                onClick={() => setState({ step: 'select-topic' })}
                className="bg-card border border-border rounded-2xl p-6 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Crosshair className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">Focus Practice</h4>
                <p className="text-muted-foreground text-sm">Manually select a weak subject or chapter to drill down specific concepts.</p>
              </div>

              <div 
                onClick={() => launchAdaptiveSession('Weakness Attack', 'Weakness Extraction')}
                className="bg-card border border-border rounded-2xl p-6 hover:border-red-500/50 hover:bg-red-500/5 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Swords className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">Weakness Attack</h4>
                <p className="text-muted-foreground text-sm">AI generates questions spanning entirely across your historical conceptual mistakes.</p>
              </div>

              <div 
                onClick={() => launchAdaptiveSession('Smart Mixed Practice', 'Adaptive Mixed Subject')}
                className="bg-card border border-border rounded-2xl p-6 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shuffle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">Smart Mixed Practice</h4>
                <p className="text-muted-foreground text-sm">A balanced, exam-like mix of Easy, Medium, and Hard questions across all topics.</p>
              </div>

            </div>
          </div>
        )}

        {state.step === 'select-topic' && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Select Topic</h2>
              <Button variant="outline" onClick={() => setState({ step: 'select-mode' })}>Back to Modes</Button>
            </div>
            <SubchapterSelector onSelect={handleSubchapterSelect} />
          </div>
        )}

        {state.step === 'select-difficulty' && (
          <DifficultySelector subchapter={state.subchapter} chapter={state.chapter} subject={state.subject} onSelectDifficulty={handleDifficultySelect} onBack={() => setState({ step: 'select-topic' })} />
        )}

        {state.step === 'quiz' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-6" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {state.adaptiveMode ? `Adapting Engine for ${state.adaptiveMode}...` : 'Generating AI Questions...'}
                </h2>
                <p className="text-muted-foreground text-sm">Selecting the perfect difficulty tier based on your accuracy.</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => handleDifficultySelect(state.difficulty)} variant="outline">Try again</Button>
              </div>
            ) : questions.length > 0 ? (
              <QuizInterface questions={questions} subchapterName={state.subchapter.name} difficulty={state.difficulty} onComplete={handleQuizComplete} onGetSimilar={handleGetSimilar} onRecordAttempt={recordAttempt} />
            ) : null}
          </>
        )}

        {state.step === 'results' && (
          <QuizResults result={state.result} subchapterName={state.subchapter.name} difficulty={state.difficulty} onRetry={handleRetry} onChangeDifficulty={() => setState({ step: 'select-difficulty', subchapter: state.subchapter, chapter: state.chapter, subject: state.subject })} onGoHome={() => setState({ step: 'select-mode' })} />
        )}

      </div>
      
      {isSnapModalOpen && <SnapAndSolveModal onClose={() => setIsSnapModalOpen(false)} />}
    </MainLayout>
  );
};

export default PracticePage;
