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

  const difficultyColors = {
    easy: 'bg-setu-success/10 text-setu-success',
    medium: 'bg-setu-warning/10 text-setu-warning',
    hard: 'bg-destructive/10 text-destructive'
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', difficultyColors[difficulty])}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          <span className="text-sm text-muted-foreground">{subchapterName}</span>
        </div>
          {currentQuestion.is_verified ? (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          ) : currentQuestion.generation_model ? (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
              <Sparkles className="w-3 h-3" /> AI Generated
            </span>
          ) : null}
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
            <Clock className="w-4 h-4" />
            <span>Q {currentIndex + 1}/{questions.length}</span>
          </div>
      </div>

      {/* Progress */}
      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />

      {/* Questions Renderer */}
      <QuestionRenderer 
        question={currentQuestion as any}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={setSelectedAnswer}
        disabled={hasSubmitted}
        showResult={hasSubmitted}
      />

      {/* Submit / Next Button */}
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
            className="w-full h-12 text-base transition-all rounded-xl shadow-lg shadow-accent/20"
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
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-semibold text-emerald-500">Correct! 🎉</p>
                  <p className="text-sm text-muted-foreground">Concept: {currentQuestion.concept_tested}</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Incorrect</p>
                  <p className="text-sm text-muted-foreground">
                    Don't worry, analyzing your mistake helps you learn faster.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Explanation Toggle */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between p-4 bg-secondary rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              <span className="font-medium">Solution & Explanation</span>
            </div>
            {showExplanation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showExplanation && (
            <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">STEP-BY-STEP SOLUTION</h4>
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.explanation}
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Concept Tested</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.concept_tested}</p>
                </div>
              </div>

              {currentQuestion.common_mistake && (
                <div className="flex items-start gap-2 p-3 bg-setu-warning/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-setu-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Common Mistake</p>
                    <p className="text-sm text-muted-foreground">{currentQuestion.common_mistake}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Re-attempt & Similar Questions (for wrong answers) */}
          {!isCorrect && (
            <div className="space-y-3">
              {/* Try New Question Button */}
              <button
                onClick={() => {
                  // Pick next similar question from the queue
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
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={cn('w-4 h-4 text-primary', loadingSimilar && 'animate-spin')} />
                <span className="font-medium text-primary">
                  {loadingSimilar ? 'Loading new question...' : 'Try Similar Question'}
                </span>
              </button>

              <div className="flex items-center gap-2 mt-4">
                <RefreshCw className={cn('w-4 h-4', loadingSimilar && 'animate-spin')} />
                <span className="text-sm font-medium">Practice Similar Questions</span>
              </div>
              
              {loadingSimilar ? (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">Finding similar questions...</p>
                </div>
              ) : similarQuestions && similarQuestions.length > 0 ? (
                <div className="space-y-2">
                  {similarQuestions.map((sq, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer">
                      <p className="text-sm font-medium mb-2">{sq.question_text}</p>
                      <p className="text-xs text-muted-foreground">
                        Answer: {sq.correct_option} • {sq.difficulty_note}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <Button onClick={handleNext} className="w-full h-12 text-base">
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
  );
};

export default QuizInterface;
