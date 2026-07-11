import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question, SimilarQuestion } from '@/hooks/usePracticeQuestions';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Lightbulb,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceLevel } from '@/hooks/useMCQ';
import { QuestionRenderer } from './QuestionRenderer';
import { MathMarkdownRenderer } from '@/components/ui/MathMarkdownRenderer';
import { recordRemediationSuccess } from '@/services/studentIntelligence';
import { Link } from 'react-router-dom';


interface QuizInterfaceProps {
  questions: Question[];
  subchapterName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (results: QuizResult) => void;
  onGetSimilar: (question: Question) => Promise<SimilarQuestion[] | null>;
  onRecordAttempt: (questionId: string, selected: any, isCorrect: boolean, time: number, confidence: ConfidenceLevel) => void;
}

export interface QuizResult {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  timeTakenSeconds: number;
  wrongQuestions: Question[];
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({
  questions,
  subchapterName,
  difficulty,
  onComplete,
  onGetSimilar,
  onRecordAttempt
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[] | null>(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [results, setResults] = useState<{ correct: number; wrong: Question[] }>({
    correct: 0,
    wrong: []
  });
  const [practiceQuestion, setPracticeQuestion] = useState<SimilarQuestion | null>(null);
  const [similarQueueIndex, setSimilarQueueIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const baseQuestion = questions[currentIndex];
  const currentQuestion = practiceQuestion ? {
    ...baseQuestion,
    question_text: practiceQuestion.question_text,
    options: {
        A: practiceQuestion.option_a,
        B: practiceQuestion.option_b,
        C: practiceQuestion.option_c,
        D: practiceQuestion.option_d,
    },
    answer: practiceQuestion.correct_option,
    explanation: practiceQuestion.explanation
  } : baseQuestion;

  const isAnswerCorrect = useCallback((val: any) => {
    if (currentQuestion.type === 'NUMERICAL') {
        const input = parseFloat(val);
        if (typeof currentQuestion.answer === 'number') {
            return Math.abs(input - currentQuestion.answer) < 0.01;
        }
        if (typeof currentQuestion.answer === 'object' && 'min' in (currentQuestion.answer as any)) {
            const range = currentQuestion.answer as { min: number; max: number };
            return input >= range.min && input <= range.max;
        }
    }
    return val === currentQuestion.answer;
  }, [currentQuestion]);

  const isCurrentCorrect = isAnswerCorrect(selectedAnswer);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    setTotalTime(prev => prev + timeTaken);
    setHasSubmitted(true);

    const correct = isAnswerCorrect(selectedAnswer);
    
    // Record the attempt defaulting confidence to 'medium' to reduce friction
    onRecordAttempt(currentQuestion.id, selectedAnswer, correct, timeTaken, 'medium');

    if (correct) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
      if (practiceQuestion) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && currentQuestion.misconception_id) {
          recordRemediationSuccess(user.id, currentQuestion.concept_tested, currentQuestion.misconception_id, true);
        }
      }
    } else {
      setResults(prev => ({ ...prev, wrong: [...prev.wrong, currentQuestion as any] }));
      if (practiceQuestion) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && currentQuestion.misconception_id) {
          recordRemediationSuccess(user.id, currentQuestion.concept_tested, currentQuestion.misconception_id, false);
        }
      }
      setLoadingSimilar(true);
      const similar = await onGetSimilar(currentQuestion as any);
      setSimilarQuestions(similar);
      setLoadingSimilar(false);
    }
  }, [selectedAnswer, currentQuestion, questionStartTime, onRecordAttempt, onGetSimilar, isAnswerCorrect, practiceQuestion]);


  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setShowExplanation(false);
      setSimilarQuestions(null);
      setPracticeQuestion(null);
      setSimilarQueueIndex(0);
    } else {
      onComplete({
        totalQuestions: questions.length,
        correct: results.correct + (isCurrentCorrect ? 1 : 0),
        incorrect: results.wrong.length + (isCurrentCorrect ? 0 : 1),
        timeTakenSeconds: totalTime,
        wrongQuestions: isCurrentCorrect ? results.wrong : [...results.wrong, currentQuestion as any]
      });
    }
  }, [currentIndex, questions.length, results.correct, results.wrong, isCurrentCorrect, totalTime, currentQuestion, onComplete]);

  // Keyboard Shortcuts hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (!hasSubmitted) {
        if (currentQuestion.type !== 'NUMERICAL') {
            if (e.key === '1') setSelectedAnswer('A');
            if (e.key === '2') setSelectedAnswer('B');
            if (e.key === '3') setSelectedAnswer('C');
            if (e.key === '4') setSelectedAnswer('D');
        }
        if (e.key === 'Enter' && selectedAnswer !== null) {
          handleSubmit();
        }
      } else {
        if (e.key === 'Enter') {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSubmitted, selectedAnswer, currentQuestion.type, handleSubmit, handleNext]);

  const activeDifficulty = currentQuestion?.difficulty || difficulty;
  const diffStars = activeDifficulty === 'hard' ? '★★★★☆' : activeDifficulty === 'medium' ? '★★★☆☆' : '★★☆☆☆';

  // ── Derive breadcrumb metadata from the CURRENT QUESTION, not from cached navigation state ──
  // node_id carries the chapter/topic slug; concept_tested carries the specific concept.
  // We format the raw slug into a human-readable label.
  const formatSlug = (slug: string): string =>
    slug
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();

  const questionChapter = currentQuestion.node_id
    ? formatSlug(currentQuestion.node_id)
    : subchapterName;
  const questionTopic = currentQuestion.concept_tested
    ? currentQuestion.concept_tested
    : questionChapter;
  const questionExamType = (currentQuestion.exam_type || 'JEE').replace('_', ' ');

  // Dev-only: warn if the displayed breadcrumb diverges from the question's own metadata
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const expectedChapter = currentQuestion.node_id ? formatSlug(currentQuestion.node_id) : subchapterName;
    const expectedTopic = currentQuestion.concept_tested || expectedChapter;
    if (expectedChapter !== subchapterName || expectedTopic !== subchapterName) {
      console.warn('[Practice UI] Metadata derived from question — not from navigation state', {
        question_node_id: currentQuestion.node_id,
        question_concept: currentQuestion.concept_tested,
        question_exam_type: currentQuestion.exam_type,
        requested_subchapterName: subchapterName,
        displayedChapter: expectedChapter,
        displayedTopic: expectedTopic,
      });
    }
  }, [currentIndex, currentQuestion.node_id, currentQuestion.concept_tested, subchapterName]);

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6 text-slate-900 text-left">
      {/* Top Header Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-500 uppercase">
            <span>{questionExamType} Practice</span>
            <span className="text-slate-300">/</span>
            <span>{questionChapter}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-extrabold">{questionTopic}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold">
            Difficulty: <span className="text-amber-500 font-extrabold">{diffStars}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700">
            Q {currentIndex + 1} / {questions.length}
          </span>
          {currentQuestion.is_verified ? (
            <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              ✓ Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
              ⚡ AI Generated
            </span>
          )}
        </div>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 bg-slate-100" />

      {/* Main Grid: Question vs Stats Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Question Renderer & Actions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <QuestionRenderer 
              question={currentQuestion as any}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={setSelectedAnswer}
              disabled={hasSubmitted}
              showResult={hasSubmitted}
            />
          </div>

          {!hasSubmitted ? (
            <div className="space-y-4 animate-fade-in">
              <Button 
                onClick={handleSubmit} 
                disabled={selectedAnswer === null}
                className="w-full h-12 text-base transition-all rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none"
              >
                Submit Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Result Banner */}
              <div className={cn(
                'p-4 rounded-xl flex items-center gap-3',
                isCurrentCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' : 'bg-rose-50 border border-rose-200 text-rose-950'
              )}>
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-700">Correct! 🎉</p>
                      <p className="text-xs text-slate-500">Concept: {currentQuestion.concept_tested}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-rose-600" />
                    <div>
                      <p className="font-semibold text-rose-700">Incorrect</p>
                      <p className="text-xs text-slate-500">
                        Analyzing your mistake helps you learn faster.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Explanation Toggle */}
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors rounded-xl text-left"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800">Solution & Mentor Recovery Flow</span>
                </div>
                {showExplanation ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>

              {showExplanation && (
                <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 space-y-4 text-left">
                  {/* Step-by-Step Solution */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-4">
                    <MathMarkdownRenderer content={currentQuestion.explanation || ''} isSolution={true} />
                  </div>
                  
                  {/* Misconception Diagnosis */}
                  {!isCurrentCorrect && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                      <p className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> Misconception Diagnosis
                      </p>
                      <p className="text-xs text-rose-950 font-medium">
                        {currentQuestion.option_misconceptions?.[selectedAnswer] ? (
                          <>Detected Trap: <strong>{currentQuestion.option_misconceptions[selectedAnswer]}</strong></>
                        ) : (
                          <>Incorrect option chosen. Reinforcing standard conceptual foundation.</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Teacher Insight */}
                  <div className="p-4 bg-violet-50 border border-violet-150 rounded-xl space-y-2">
                    <p className="text-xs font-black uppercase text-violet-800 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600" /> Kota Faculty Teacher Insight
                    </p>
                    <p className="text-xs text-violet-950 italic leading-relaxed">
                      "Beta, always establish coordinate direction axes first before constructing the equations. Double check for calculation and sign traps!"
                    </p>
                  </div>

                  {/* Formula Reminder */}
                  <div className="p-4 bg-amber-50 border border-amber-150 rounded-xl space-y-2">
                    <p className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" /> Formula Reminder
                    </p>
                    <p className="text-xs text-amber-950 font-mono">
                      Check variables and dimensional compatibility for concept: {currentQuestion.concept_tested}
                    </p>
                  </div>

                  {/* Notes Integration Reference Link */}
                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Need a Quick Revision?</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Explore curated theory notes & formulas.</p>
                    </div>
                    <Link
                      to={`/chapter/${currentQuestion.node_id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/notes?mode=formulas`}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Read Notes
                    </Link>
                  </div>
                </div>
              )}

              {/* Re-attempt & Similar / Harder Questions */}
              {!isCurrentCorrect && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (similarQuestions && similarQuestions.length > 0) {
                        const nextIndex = similarQueueIndex % similarQuestions.length;
                        const sq = similarQuestions[nextIndex];
                        setPracticeQuestion(sq);
                        setSimilarQueueIndex(prev => prev + 1);
                      }
                      setSelectedAnswer(null);
                      setHasSubmitted(false);
                      setShowExplanation(false);
                      setQuestionStartTime(Date.now());
                    }}
                    disabled={!similarQuestions || similarQuestions.length === 0}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={cn('w-4 h-4 text-blue-700', loadingSimilar && 'animate-spin')} />
                    <span className="font-bold text-xs text-blue-700">
                      {loadingSimilar ? 'Loading new question...' : 'Try Similar Question'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (similarQuestions && similarQuestions.length > 0) {
                        // Load harder variant
                        const nextIndex = (similarQueueIndex + 1) % similarQuestions.length;
                        const sq = {
                          ...similarQuestions[nextIndex],
                          difficulty_note: 'Harder Follow-up Question',
                          difficulty: 'hard' as any
                        };
                        setPracticeQuestion(sq);
                        setSimilarQueueIndex(prev => prev + 2);
                      }
                      setSelectedAnswer(null);
                      setHasSubmitted(false);
                      setShowExplanation(false);
                      setQuestionStartTime(Date.now());
                    }}
                    disabled={!similarQuestions || similarQuestions.length === 0}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-purple-50 hover:bg-purple-100/80 border border-purple-250 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-xs text-purple-700">
                      Harder Follow-up Question
                    </span>
                  </button>
                </div>
              )}


              <Button onClick={handleNext} className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100">
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'View Results'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Session Stats Sidebar */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 sticky top-24 text-left shadow-sm">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 border-b border-slate-100 pb-3 mb-4">
              Session Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                <span className="text-[10px] text-emerald-700 uppercase font-black tracking-wider">Correct</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">{results.correct}</div>
              </div>
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                <span className="text-[10px] text-rose-700 uppercase font-black tracking-wider">Wrong</span>
                <div className="text-2xl font-black text-rose-600 mt-1">{results.wrong.length}</div>
              </div>
            </div>

            <div className="mt-4 bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Accuracy</span>
                <span className="text-slate-800 font-black">
                  {Math.round((results.correct / Math.max(1, currentIndex + (hasSubmitted ? 1 : 0))) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.round((results.correct / Math.max(1, currentIndex + (hasSubmitted ? 1 : 0))) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-3 mt-1">
                <span className="text-slate-500 font-bold">Total Time</span>
                <span className="text-slate-800 font-black flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-[10px] text-slate-500 leading-relaxed">
            <span className="font-extrabold text-slate-700 block mb-1">Keyboard Shortcuts:</span>
            • Press <kbd className="bg-white text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black border border-slate-200 shadow-xs">1</kbd>, <kbd className="bg-white text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black border border-slate-200 shadow-xs">2</kbd>, <kbd className="bg-white text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black border border-slate-200 shadow-xs">3</kbd>, <kbd className="bg-white text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black border border-slate-200 shadow-xs">4</kbd> to select option.<br />
            • Press <kbd className="bg-white text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black border border-slate-200 shadow-xs">Enter</kbd> to submit/next.
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizInterface;
