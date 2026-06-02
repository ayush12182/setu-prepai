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
import ConfidenceRating from './ConfidenceRating';
import { QuestionRenderer } from './QuestionRenderer';

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
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
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
  // Use practice question if available, otherwise use the base question
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
    
    // Record the attempt using unified b2b/b2c stats engine
    onRecordAttempt(currentQuestion.id, selectedAnswer, correct, timeTaken, confidence!);

    if (correct) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setResults(prev => ({ ...prev, wrong: [...prev.wrong, currentQuestion as any] }));
      // Auto-fetch similar questions for wrong answers
      setLoadingSimilar(true);
      const similar = await onGetSimilar(currentQuestion as any);
      setSimilarQuestions(similar);
      setLoadingSimilar(false);
    }
  }, [selectedAnswer, currentQuestion, questionStartTime, onRecordAttempt, onGetSimilar, isAnswerCorrect, confidence]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setShowExplanation(false);
      setSimilarQuestions(null);
      setPracticeQuestion(null);
      setSimilarQueueIndex(0);
      setConfidence(null);
    } else {
      // Quiz complete
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
      // Don't trigger if user is typing
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (!hasSubmitted) {
        if (currentQuestion.type !== 'NUMERICAL') {
            if (e.key === '1') setSelectedAnswer('A');
            if (e.key === '2') setSelectedAnswer('B');
            if (e.key === '3') setSelectedAnswer('C');
            if (e.key === '4') setSelectedAnswer('D');
        }
        if (e.key === 'Enter' && selectedAnswer !== null && confidence) {
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
  }, [hasSubmitted, selectedAnswer, confidence, currentQuestion.type, handleSubmit, handleNext]);

  const diffStars = difficulty === 'hard' ? '★★★★☆' : difficulty === 'medium' ? '★★★☆☆' : '★★☆☆☆';

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6 text-[#FFFFFF] text-left">
      {/* Top Header Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#C7D2FE] uppercase">
            <span>JEE Practice</span>
            <span className="text-white/20">/</span>
            <span>{subchapterName}</span>
            <span className="text-white/20">/</span>
            <span className="text-white font-extrabold">{currentQuestion.concept_tested || 'Gauss Law'}</span>
          </div>
          <div className="text-[11px] text-[#94A3B8] font-bold">
            Difficulty: <span className="text-amber-400 font-extrabold">{diffStars}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white">
            Q {currentIndex + 1} / {questions.length}
          </span>
          {currentQuestion.is_verified ? (
            <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              ✓ Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-violet-400 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20">
              ⚡ AI Generated
            </span>
          )}
        </div>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 bg-white/[0.04]" />

      {/* Main Grid: Question vs Stats Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Question Renderer & Actions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-white/[0.06] rounded-3xl p-6 sm:p-8">
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
              {selectedAnswer !== null && (
                <ConfidenceRating 
                  selected={confidence}
                  onSelect={setConfidence}
                />
              )}
              <Button 
                onClick={handleSubmit} 
                disabled={selectedAnswer === null || !confidence}
                className="w-full h-12 text-base transition-all rounded-xl shadow-lg bg-accent text-primary hover:bg-accent/90 font-bold"
              >
                {selectedAnswer === null ? 'Select or enter an answer' : !confidence ? 'Rate your confidence' : 'Submit Answer'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Result Banner */}
              <div className={cn(
                'p-4 rounded-xl flex items-center gap-3',
                isCurrentCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-destructive/10 border border-destructive/30'
              )}>
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-emerald-400">Correct! 🎉</p>
                      <p className="text-xs text-[#C7D2FE]">Concept: {currentQuestion.concept_tested}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-500">Incorrect</p>
                      <p className="text-xs text-[#94A3B8]">
                        Analyzing your mistake helps you learn faster.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Explanation Toggle */}
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors rounded-xl text-left"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm">Solution & Explanation</span>
                </div>
                {showExplanation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showExplanation && (
                <div className="bg-white/[0.01] border border-white/[0.06] rounded-xl p-4 space-y-4">
                  <div>
                    <h4 className="font-black text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">Step-by-Step Solution</h4>
                    <div className="text-[#FFFFFF] text-sm leading-relaxed whitespace-pre-wrap">
                      {currentQuestion.explanation}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2.5 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <BookOpen className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Concept Tested</p>
                      <p className="text-xs text-[#C7D2FE] mt-0.5">{currentQuestion.concept_tested}</p>
                    </div>
                  </div>

                  {currentQuestion.common_mistake && (
                    <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-500">Common Mistake</p>
                        <p className="text-xs text-[#C7D2FE] mt-0.5">{currentQuestion.common_mistake}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Re-attempt & Similar Questions */}
              {!isCurrentCorrect && (
                <div className="space-y-3">
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
                      setConfidence(null);
                      setQuestionStartTime(Date.now());
                    }}
                    disabled={!similarQuestions || similarQuestions.length === 0}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={cn('w-4 h-4 text-accent', loadingSimilar && 'animate-spin')} />
                    <span className="font-bold text-xs text-accent">
                      {loadingSimilar ? 'Loading new question...' : 'Try Similar Question'}
                    </span>
                  </button>

                  {loadingSimilar ? (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
                      <p className="text-xs text-[#94A3B8]">Finding similar questions...</p>
                    </div>
                  ) : similarQuestions && similarQuestions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-black uppercase text-[#C7D2FE] tracking-wider mb-1 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" /> Practice Similar Questions
                      </div>
                      {similarQuestions.map((sq, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-accent/40 transition-colors cursor-pointer text-left">
                          <p className="text-xs font-semibold text-[#FFFFFF] mb-2">{sq.question_text}</p>
                          <p className="text-[10px] text-[#94A3B8]">
                            Answer: {sq.correct_option} • {sq.difficulty_note}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              <Button onClick={handleNext} className="w-full h-12 text-base bg-white text-black hover:bg-white/90 font-bold rounded-xl shadow-lg">
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
        <div className="lg:col-span-4 bg-card border border-white/[0.06] rounded-3xl p-6 space-y-6 sticky top-24 text-left">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C7D2FE] border-b border-white/[0.06] pb-3 mb-4">
              Session Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                <span className="text-[10px] text-[#94A3B8] uppercase font-black tracking-wider">Correct</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{results.correct}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                <span className="text-[10px] text-[#94A3B8] uppercase font-black tracking-wider">Wrong</span>
                <div className="text-2xl font-black text-red-400 mt-1">{results.wrong.length}</div>
              </div>
            </div>

            <div className="mt-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8] font-bold">Accuracy</span>
                <span className="text-[#FFFFFF] font-black">
                  {Math.round((results.correct / Math.max(1, currentIndex + (hasSubmitted ? 1 : 0))) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.round((results.correct / Math.max(1, currentIndex + (hasSubmitted ? 1 : 0))) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3 mt-1">
                <span className="text-[#94A3B8] font-bold">Total Time</span>
                <span className="text-[#FFFFFF] font-black flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" /> {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-[10px] text-[#94A3B8] leading-relaxed">
            <span className="font-extrabold text-white block mb-1">Keyboard Shortcuts:</span>
            • Press <kbd className="bg-white/[0.08] text-white px-1.5 py-0.5 rounded text-[9px] font-black border border-white/10">1</kbd>, <kbd className="bg-white/[0.08] text-white px-1.5 py-0.5 rounded text-[9px] font-black border border-white/10">2</kbd>, <kbd className="bg-white/[0.08] text-white px-1.5 py-0.5 rounded text-[9px] font-black border border-white/10">3</kbd>, <kbd className="bg-white/[0.08] text-white px-1.5 py-0.5 rounded text-[9px] font-black border border-white/10">4</kbd> to select option.<br />
            • Press <kbd className="bg-white/[0.08] text-white px-1.5 py-0.5 rounded text-[9px] font-black border border-white/10">Enter</kbd> to submit/next.
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizInterface;
