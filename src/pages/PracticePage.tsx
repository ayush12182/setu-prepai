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
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const [state, setState] = useState<PracticeState>({ step: 'select-topic' });
  const [initialized, setInitialized] = useState(false);
  const [mode, setMode] = useState<PracticeMode>('practice');
  
  const { 
    questions, 
    loading, 
    error, 
    generateQuestions, 
    getSimilarQuestions,
    recordAttempt 
  } = usePracticeQuestions();

  const { stats, fetchStats } = usePracticeStats();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Handle URL parameters for direct navigation from subchapter page or test page
  useEffect(() => {
    if (initialized) return;
    
    const subchapterId = searchParams.get('subchapter');
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const modeParam = searchParams.get('mode');
    
    // Set mode from URL parameter
    if (modeParam === 'test') {
      setMode('test');
    }
    
    if (subchapterId) {
      const subchapter = getSubchapterById(subchapterId);
      if (subchapter) {
        const chapter = getChapterById(subchapter.chapterId);
        if (chapter) {
          if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
            // Auto-start quiz with selected difficulty
            setState({ step: 'quiz', subchapter, chapter, subject: chapter.subject, difficulty });
            generateQuestions(
              subchapter.id,
              subchapter.name,
              chapter.id,
              chapter.name,
              chapter.subject,
              difficulty,
              modeParam === 'test' ? 10 : 5 // More questions for test mode
            );
          } else {
            // Show difficulty selector
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
    
    // Start loading questions
    setState({ step: 'quiz', subchapter, chapter, subject, difficulty });
    
    await generateQuestions(
      subchapter.id,
      subchapter.name,
      chapter.id,
      chapter.name,
      subject,
      difficulty,
      mode === 'test' ? 10 : 5 // More questions for test mode
    );
  };

  // Handle practice mode completion
  const handleQuizComplete = (result: QuizResult) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'results', result });
    fetchStats();
  };

  // Handle test mode completion
  const handleTestComplete = (answers: TestAnswer[], totalTime: number) => {
    if (state.step !== 'quiz') return;
    setState({ ...state, step: 'test-results', answers, totalTime });
    fetchStats();
  };

  const handleRetry = async () => {
    if (state.step !== 'results' && state.step !== 'test-results') return;
    const { subchapter, chapter, subject, difficulty } = state;
    
    setState({ step: 'quiz', subchapter, chapter, subject, difficulty });
    
    await generateQuestions(
      subchapter.id,
      subchapter.name,
      chapter.id,
      chapter.name,
      subject,
      difficulty,
      mode === 'test' ? 10 : 5
    );
  };

  const handleChangeDifficulty = () => {
    if (state.step !== 'results' && state.step !== 'test-results') return;
    setState({ 
      step: 'select-difficulty', 
      subchapter: state.subchapter, 
      chapter: state.chapter, 
      subject: state.subject 
    });
  };

  const handlePracticeMistakes = () => {
    // Switch to practice mode for the same topic
    setMode('practice');
    if (state.step === 'test-results') {
      handleRetry();
    }
  };

  const handleGetSimilar = async (question: any) => {
    if (state.step !== 'quiz') return null;
    return getSimilarQuestions(
      question.concept_tested,
      state.subchapter.name,
      state.subject,
      question.question_text
    );
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}.${Math.round((seconds % 60) / 6)} min`;
  };

  return (
    <MainLayout title={mode === 'test' ? 'Test' : 'Practice'}>
      <div className="max-w-4xl mx-auto">
        {/* Stats Bar - Show on topic selection */}
        {state.step === 'select-topic' && user && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Your Practice Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalQuestionsSolved}</p>
                <p className="text-xs text-muted-foreground">Questions Solved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-setu-success">{stats.accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-setu-saffron">{formatTime(stats.avgTimeSeconds)}</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-physics">{stats.chaptersPracticed}</p>
                <p className="text-xs text-muted-foreground">Topics Done</p>
              </div>
            </div>
          </div>
        )}

        {/* Topic Selection */}
        {state.step === 'select-topic' && (
          <SubchapterSelector onSelect={handleSubchapterSelect} />
        )}

        {/* Difficulty Selection */}
        {state.step === 'select-difficulty' && (
          <DifficultySelector
            subchapter={state.subchapter}
            chapter={state.chapter}
            subject={state.subject}
            onSelectDifficulty={handleDifficultySelect}
            onBack={() => setState({ step: 'select-topic' })}
          />
        )}

        {/* Quiz */}
        {state.step === 'quiz' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {mode === 'test' ? 'Preparing your test...' : 'Generating JEE-style questions...'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={() => handleDifficultySelect(state.difficulty)}
                  className="text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : questions.length > 0 ? (
              mode === 'test' ? (
                <TestModeQuiz
                  questions={questions}
                  subchapterName={state.subchapter.name}
                  difficulty={state.difficulty}
                  onComplete={handleTestComplete}
                  onRecordAttempt={recordAttempt}
                />
              ) : (
                <QuizInterface
                  questions={questions}
                  subchapterName={state.subchapter.name}
                  difficulty={state.difficulty}
                  onComplete={handleQuizComplete}
                  onGetSimilar={handleGetSimilar}
                  onRecordAttempt={recordAttempt}
                />
              )
            ) : null}
          </>
        )}

        {/* Practice Mode Results */}
        {state.step === 'results' && (
          <QuizResults
            result={state.result}
            subchapterName={state.subchapter.name}
            difficulty={state.difficulty}
            onRetry={handleRetry}
            onChangeDifficulty={handleChangeDifficulty}
            onGoHome={() => setState({ step: 'select-topic' })}
          />
        )}

        {/* Test Mode Results */}
        {state.step === 'test-results' && (
          <TestResults
            answers={state.answers}
            subchapterName={state.subchapter.name}
            difficulty={state.difficulty}
            totalTime={state.totalTime}
            onRetry={handleRetry}
            onChangeDifficulty={handleChangeDifficulty}
            onGoHome={() => {
              setMode('practice');
              setState({ step: 'select-topic' });
            }}
            onPracticeMistakes={handlePracticeMistakes}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PracticePage;
