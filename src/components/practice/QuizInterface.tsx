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
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizInterfaceProps {
  questions: Question[];
  subchapterName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (results: QuizResult) => void;
  onGetSimilar: (question: Question) => Promise<SimilarQuestion[] | null>;
  onRecordAttempt: (questionId: string, selected: 'A' | 'B' | 'C' | 'D', isCorrect: boolean, time: number) => void;
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
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
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

  const baseQuestion = questions[currentIndex];
  // Use practice question if available, otherwise use the base question
  const currentQuestion = practiceQuestion ? {
    ...baseQuestion,
    question_text: practiceQuestion.question_text,
    option_a: practiceQuestion.option_a,
    option_b: practiceQuestion.option_b,
    option_c: practiceQuestion.option_c,
    option_d: practiceQuestion.option_d,
    correct_option: practiceQuestion.correct_option as 'A' | 'B' | 'C' | 'D',
    explanation: practiceQuestion.explanation
  } : baseQuestion;
  const isCorrect = selectedOption === currentQuestion?.correct_option;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleOptionSelect = (option: 'A' | 'B' | 'C' | 'D') => {
    if (hasSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedOption || !currentQuestion) return;

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    setTotalTime(prev => prev + timeTaken);
    setHasSubmitted(true);

    const correct = selectedOption === currentQuestion.correct_option;
    
    // Record the attempt
    onRecordAttempt(currentQuestion.id, selectedOption, correct, timeTaken);

    if (correct) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setResults(prev => ({ ...prev, wrong: [...prev.wrong, currentQuestion] }));
      // Auto-fetch similar questions for wrong answers
      setLoadingSimilar(true);
      const similar = await onGetSimilar(currentQuestion);
      setSimilarQuestions(similar);
      setLoadingSimilar(false);
    }
  }, [selectedOption, currentQuestion, questionStartTime, onRecordAttempt, onGetSimilar]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setShowExplanation(false);
      setSimilarQuestions(null);
      setPracticeQuestion(null);
      setSimilarQueueIndex(0);
    } else {
      // Quiz complete
      onComplete({
        totalQuestions: questions.length,
        correct: results.correct + (isCorrect ? 1 : 0),
        incorrect: results.wrong.length + (isCorrect ? 0 : 1),
        timeTakenSeconds: totalTime,
        wrongQuestions: isCorrect ? results.wrong : [...results.wrong, currentQuestion]
      });
    }
  };

  const getOptionClass = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!hasSubmitted) {
      return selectedOption === option 
        ? 'border-primary bg-primary/5' 
        : 'border-border hover:border-muted-foreground/50';
    }

    if (option === currentQuestion.correct_option) {
      return 'border-setu-success bg-setu-success/10';
    }
    if (selectedOption === option && option !== currentQuestion.correct_option) {
      return 'border-destructive bg-destructive/10';
    }
    return 'border-border opacity-50';
  };

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Q {currentIndex + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-foreground leading-relaxed">
          {currentQuestion.question_text}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
          const optionText = {
            A: currentQuestion.option_a,
            B: currentQuestion.option_b,
            C: currentQuestion.option_c,
            D: currentQuestion.option_d
          }[opt];

          return (
            <button
              key={opt}
              onClick={() => handleOptionSelect(opt)}
              disabled={hasSubmitted}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3',
                getOptionClass(opt),
                !hasSubmitted && 'cursor-pointer'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0',
                selectedOption === opt ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              )}>
                {opt}
              </span>
              <span className="pt-1">{optionText}</span>
              {hasSubmitted && opt === currentQuestion.correct_option && (
                <CheckCircle className="w-5 h-5 text-setu-success ml-auto flex-shrink-0" />
              )}
              {hasSubmitted && selectedOption === opt && opt !== currentQuestion.correct_option && (
                <XCircle className="w-5 h-5 text-destructive ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit / Next Button */}
      {!hasSubmitted ? (
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedOption}
          className="w-full h-12 text-base"
        >
          Submit Answer
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Result Banner */}
          <div className={cn(
            'p-4 rounded-xl flex items-center gap-3',
            isCorrect ? 'bg-setu-success/10 border border-setu-success/30' : 'bg-destructive/10 border border-destructive/30'
          )}>
            {isCorrect ? (
              <>
                <CheckCircle className="w-6 h-6 text-setu-success" />
                <div>
                  <p className="font-semibold text-setu-success">Correct! 🎉</p>
                  <p className="text-sm text-muted-foreground">Concept: {currentQuestion.concept_tested}</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Incorrect</p>
                  <p className="text-sm text-muted-foreground">
                    Correct answer: {currentQuestion.correct_option}
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
              <Lightbulb className="w-5 h-5 text-setu-saffron" />
              <span className="font-medium">Solution & Explanation</span>
            </div>
            {showExplanation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showExplanation && (
            <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">STEP-BY-STEP SOLUTION</h4>
                <p className="text-foreground whitespace-pre-wrap">{currentQuestion.explanation}</p>
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
                    setPracticeQuestion(similarQuestions[nextIndex]);
                    setSimilarQueueIndex(prev => prev + 1);
                  }
                  setSelectedOption(null);
                  setHasSubmitted(false);
                  setShowExplanation(false);
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
