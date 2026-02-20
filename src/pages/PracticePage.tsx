import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Chapter, getChapterById } from '@/data/syllabus';
import { Subchapter, getSubchapterById } from '@/data/subchapters';
import { usePracticeQuestions, usePracticeStats } from '@/hooks/usePracticeQuestions';
import SubchapterSelector from '@/components/practice/SubchapterSelector';
import DifficultySelector from '@/components/practice/DifficultySelector';
import QuizInterface, { QuizResult } from '@/components/practice/QuizInterface';
import QuizResults from '@/components/practice/QuizResults';
import TestModeQuiz, { TestAnswer } from '@/components/practice/TestModeQuiz';
import TestResults from '@/components/practice/TestResults';
import { Loader2, Target, Zap, Clock, TrendingUp, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';

type PracticeMode = 'practice' | 'test';

type PracticeState =
  | { step: 'select-topic' }
  | { step: 'select-difficulty'; subchapter: Subchapter; chapter: Chapter; subject: string }
  | { step: 'quiz'; subchapter: Subchapter; chapter: Chapter; subject: string; difficulty: 'easy' | 'medium' | 'hard' }
  | { step: 'results'; subchapter: Subchapter; chapter: Chapter; subject: string; difficulty: 'easy' | 'medium' | 'hard'; result: QuizResult }
  | { step: 'test-results'; subchapter: Subchapter; chapter: Chapter; subject: string; difficulty: 'easy' | 'medium' | 'hard'; answers: TestAnswer[]; totalTime: number };

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isNeet } = useExamMode();
  const [state, setState] = useState<PracticeState>({ step: 'select-topic' });
  const [initialized, setInitialized] = useState(false);
  const [mode, setMode] = useState<PracticeMode>('practice');

  const { questions, loading, error, generateQuestions, getSimilarQuestions, recordAttempt } = usePracticeQuestions();
  const { stats, fetchStats } = usePracticeStats();

  useEffect(() => { if (user) fetchStats(); }, [user]);

  useEffect(() => {
    if (initialized) return;
    const subchapterId = searchParams.get('subchapter');
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const modeParam = searchParams.get('mode');
    if (modeParam === 'test') setMode('test');
    if (subchapterId) {
      const subchapter = getSubchapterById(subchapterId);
      if (subchapter) {
        const chapter = getChapterById(subchapter.chapterId);
        if (chapter) {
          if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
            setState({ step: 'quiz', subchapter, chapter, subject: chapter.subject, difficulty });
            generateQuestions(subchapter.id, subchapter.name, chapter.id, chapter.name, chapter.subject, difficulty, modeParam === 'test' ? 10 : 5);
          } else {
            setState({ step: 'select-difficulty', subchapter, chapter, subject: chapter.subject });
          }
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
    await generateQuestions(subchapter.id, subchapter.name, chapter.id, chapter.name, subject, difficulty, mode === 'test' ? 10 : 5);
  };

  const handleQuizComplete = (result: QuizResult) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'results', result });
    fetchStats();
  };

  const handleTestComplete = (answers: TestAnswer[], totalTime: number) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'test-results', answers, totalTime });
    fetchStats();
  };

  const handleRetry = async () => {
    if (state.step !== 'results' && state.step !== 'test-results') return;
    const { subchapter, chapter, subject, difficulty } = state;
    setState({ step: 'quiz', subchapter, chapter, subject, difficulty });
    await generateQuestions(subchapter.id, subchapter.name, chapter.id, chapter.name, subject, difficulty, mode === 'test' ? 10 : 5);
  };

  const handleChangeDifficulty = () => {
    if (state.step !== 'results' && state.step !== 'test-results') return;
    setState({ step: 'select-difficulty', subchapter: state.subchapter, chapter: state.chapter, subject: state.subject });
  };

  const handlePracticeMistakes = () => {
    setMode('practice');
    if (state.step === 'test-results') handleRetry();
  };

  const handleGetSimilar = async (question: any) => {
    if (state.step !== 'quiz') return null;
    return getSimilarQuestions(question.concept_tested, state.subchapter.name, state.subject, question.question_text);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}.${Math.round((seconds % 60) / 6)} min`;
  };

  return (
    <MainLayout title={mode === 'test' ? 'Test' : 'Practice'}>
      <div className="max-w-4xl mx-auto">
        {/* Stats Hero - Show on topic selection */}
        {state.step === 'select-topic' && user && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-8 mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                  <Brain className="w-3.5 h-3.5" />
                  Practice Mode
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Practice Arena</h1>
              <p className="text-white/50 text-sm mb-6 max-w-md">Select a topic, pick difficulty, and sharpen your skills with AI-generated {isNeet ? 'NEET' : 'JEE'} questions.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Target, value: stats.totalQuestionsSolved, label: 'Solved', color: 'text-white' },
                  { icon: TrendingUp, value: `${stats.accuracy}%`, label: 'Accuracy', color: 'text-emerald-400' },
                  { icon: Clock, value: formatTime(stats.avgTimeSeconds), label: 'Avg Time', color: 'text-accent' },
                  { icon: Zap, value: stats.chaptersPracticed, label: 'Topics', color: 'text-cyan-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
                    <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-[11px] text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.step === 'select-topic' && <SubchapterSelector onSelect={handleSubchapterSelect} />}

        {state.step === 'select-difficulty' && (
          <DifficultySelector subchapter={state.subchapter} chapter={state.chapter} subject={state.subject} onSelectDifficulty={handleDifficultySelect} onBack={() => setState({ step: 'select-topic' })} />
        )}

        {state.step === 'quiz' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">{mode === 'test' ? 'Preparing your test...' : `Generating ${isNeet ? 'NEET' : 'JEE'}-style questions...`}</p>
                <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <button onClick={() => handleDifficultySelect(state.difficulty)} className="text-primary hover:underline">Try again</button>
              </div>
            ) : questions.length > 0 ? (
              mode === 'test' ? (
                <TestModeQuiz questions={questions} subchapterName={state.subchapter.name} difficulty={state.difficulty} onComplete={handleTestComplete} onRecordAttempt={recordAttempt} />
              ) : (
                <QuizInterface questions={questions} subchapterName={state.subchapter.name} difficulty={state.difficulty} onComplete={handleQuizComplete} onGetSimilar={handleGetSimilar} onRecordAttempt={recordAttempt} />
              )
            ) : null}
          </>
        )}

        {state.step === 'results' && (
          <QuizResults result={state.result} subchapterName={state.subchapter.name} difficulty={state.difficulty} onRetry={handleRetry} onChangeDifficulty={handleChangeDifficulty} onGoHome={() => setState({ step: 'select-topic' })} />
        )}

        {state.step === 'test-results' && (
          <TestResults answers={state.answers} subchapterName={state.subchapter.name} difficulty={state.difficulty} totalTime={state.totalTime} onRetry={handleRetry} onChangeDifficulty={handleChangeDifficulty} onGoHome={() => { setMode('practice'); setState({ step: 'select-topic' }); }} onPracticeMistakes={handlePracticeMistakes} />
        )}
      </div>
    </MainLayout>
  );
};

export default PracticePage;
