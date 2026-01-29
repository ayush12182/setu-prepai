import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '@/hooks/usePracticeQuestions';
import { 
  Clock, 
  ArrowRight,
  ArrowLeft,
  Flag,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestModeQuizProps {
  questions: Question[];
  subchapterName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (answers: TestAnswer[], timeTakenSeconds: number) => void;
  onRecordAttempt: (questionId: string, selected: 'A' | 'B' | 'C' | 'D', isCorrect: boolean, time: number) => void;
}

export interface TestAnswer {
  question: Question;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  timeTakenSeconds: number;
}

const TestModeQuiz: React.FC<TestModeQuizProps> = ({
  questions,
  subchapterName,
  difficulty,
  onComplete,
  onRecordAttempt
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, 'A' | 'B' | 'C' | 'D'>>(new Map());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentQuestion = questions[currentIndex];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentIndex, option);
      return newAnswers;
    });
  };

  const handleToggleFlag = () => {
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(currentIndex)) {
        newFlagged.delete(currentIndex);
      } else {
        newFlagged.add(currentIndex);
      }
      return newFlagged;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJumpTo = (index: number) => {
    setCurrentIndex(index);
  };

  const handleSubmitTest = useCallback(() => {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const avgTimePerQ = Math.round(totalTime / questions.length);
    
    const testAnswers: TestAnswer[] = questions.map((q, idx) => {
      const selected = answers.get(idx) || null;
      const isCorrect = selected === q.correct_option;
      
      // Record each attempt
      if (selected) {
        onRecordAttempt(q.id, selected, isCorrect, avgTimePerQ);
      }
      
      return {
        question: q,
        selectedOption: selected,
        isCorrect,
        timeTakenSeconds: avgTimePerQ
      };
    });
    
    onComplete(testAnswers, totalTime);
  }, [answers, questions, startTime, onComplete, onRecordAttempt]);

  const selectedOption = answers.get(currentIndex);
  const answeredCount = answers.size;

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
            TEST MODE
          </span>
          <span className="text-sm text-muted-foreground">{subchapterName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-mono bg-secondary px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-setu-saffron" />
            <span className="font-semibold">{formatTime(elapsedTime)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(answeredCount / questions.length) * 100} className="h-2" />

      {/* Question Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleJumpTo(idx)}
            className={cn(
              'w-8 h-8 rounded-lg text-sm font-medium transition-all',
              idx === currentIndex && 'ring-2 ring-primary',
              answers.has(idx) 
                ? 'bg-setu-success/20 text-setu-success' 
                : 'bg-secondary text-muted-foreground',
              flagged.has(idx) && 'ring-2 ring-setu-warning'
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <span className="text-sm text-muted-foreground">Question {currentIndex + 1}</span>
          <button
            onClick={handleToggleFlag}
            className={cn(
              'p-2 rounded-lg transition-colors',
              flagged.has(currentIndex) 
                ? 'bg-setu-warning/20 text-setu-warning' 
                : 'hover:bg-secondary text-muted-foreground'
            )}
            title="Flag for review"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
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
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer',
                selectedOption === opt 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0',
                selectedOption === opt ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              )}>
                {opt}
              </span>
              <span className="pt-1">{optionText}</span>
              {selectedOption === opt && (
                <CheckCircle className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="h-12"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentIndex < questions.length - 1 ? (
          <Button onClick={handleNext} className="flex-1 h-12">
            Next Question
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmitTest} 
            className="flex-1 h-12 bg-setu-success hover:bg-setu-success/90"
          >
            Submit Test
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Unanswered Warning */}
      {answeredCount < questions.length && currentIndex === questions.length - 1 && (
        <p className="text-center text-sm text-setu-warning">
          ⚠️ {questions.length - answeredCount} question(s) unanswered
        </p>
      )}
    </div>
  );
};

export default TestModeQuiz;
