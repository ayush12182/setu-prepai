import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TestAnswer } from './TestModeQuiz';
import { 
  Trophy, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  BookOpen,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JeeQuestion, JeeOption, JeeSolution } from '@/lib/jeeMathRenderer';

interface TestResultsProps {
  answers: TestAnswer[];
  subchapterName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalTime: number;
  onRetry: () => void;
  onChangeDifficulty: () => void;
  onGoHome: () => void;
  onPracticeMistakes: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({
  answers,
  subchapterName,
  difficulty,
  totalTime,
  onRetry,
  onChangeDifficulty,
  onGoHome,
  onPracticeMistakes
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const correct = answers.filter(a => a.isCorrect).length;
  const incorrect = answers.filter(a => !a.isCorrect && a.selectedOption).length;
  const unanswered = answers.filter(a => !a.selectedOption).length;
  const totalQuestions = answers.length;
  const accuracy = Math.round((correct / totalQuestions) * 100);
  const avgTimePerQuestion = Math.round(totalTime / totalQuestions);

  const wrongAnswers = answers.filter(a => !a.isCorrect);
  
  const getPerformanceLevel = () => {
    if (accuracy >= 80) return { label: 'Excellent!', color: 'text-setu-success', emoji: '🏆', message: 'Outstanding performance! You\'ve mastered this topic.' };
    if (accuracy >= 60) return { label: 'Good Job!', color: 'text-setu-saffron', emoji: '👍', message: 'Solid understanding. A bit more practice will make it perfect.' };
    if (accuracy >= 40) return { label: 'Keep Practicing', color: 'text-setu-warning', emoji: '💪', message: 'You\'re getting there! Focus on the concepts you missed.' };
    return { label: 'Needs Work', color: 'text-destructive', emoji: '📚', message: 'Review the fundamentals before attempting more questions.' };
  };

  const performance = getPerformanceLevel();

  const toggleExpand = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Group wrong answers by concept
  const conceptGroups = wrongAnswers.reduce((acc, answer) => {
    const concept = answer.question.concept_tested;
    if (!acc[concept]) {
      acc[concept] = [];
    }
    acc[concept].push(answer);
    return acc;
  }, {} as Record<string, TestAnswer[]>);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Performance Header */}
      <div className="text-center py-8 bg-gradient-to-b from-card to-background rounded-2xl border border-border">
        <div className="text-6xl mb-4">{performance.emoji}</div>
        <h2 className={cn('text-3xl font-bold mb-2', performance.color)}>
          {performance.label}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto px-4">
          {performance.message}
        </p>
        <p className="text-sm text-muted-foreground mt-4">{subchapterName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-setu-success" />
          <p className="text-2xl font-bold text-setu-success">{correct}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <XCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{incorrect + unanswered}</p>
          <p className="text-xs text-muted-foreground">Incorrect</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-setu-saffron" />
          <p className="text-2xl font-bold text-setu-saffron">{avgTimePerQuestion}s</p>
          <p className="text-xs text-muted-foreground">Avg Time</p>
        </div>
      </div>

      {/* Concept-wise Analysis */}
      {Object.keys(conceptGroups).length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-setu-warning" />
            Weak Concepts to Focus On
          </h3>
          <div className="space-y-2">
            {Object.entries(conceptGroups).map(([concept, questions]) => (
              <div 
                key={concept}
                className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="font-medium">{concept}</span>
                </div>
                <span className="text-sm text-destructive font-medium">
                  {questions.length} mistake{questions.length > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Mistake Analysis */}
      {wrongAnswers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Detailed Mistake Analysis ({wrongAnswers.length})
          </h3>
          <div className="space-y-4">
            {wrongAnswers.map((answer, idx) => {
              const isExpanded = expandedQuestions.has(idx);
              const q = answer.question;
              
              return (
                <div 
                  key={idx} 
                  className="border border-border rounded-xl overflow-hidden"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="w-full p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <JeeQuestion 
                        question={q.question_text}
                        className="font-medium text-foreground line-clamp-2"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {answer.selectedOption ? (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                            Your answer: {answer.selectedOption}
                          </span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            Not answered
                          </span>
                        )}
                        <span className="text-xs bg-setu-success/10 text-setu-success px-2 py-0.5 rounded">
                          Correct: {q.correct_option}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 border-t border-border">
                      {/* Options */}
                      <div className="space-y-2">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const optionText = {
                            A: q.option_a,
                            B: q.option_b,
                            C: q.option_c,
                            D: q.option_d
                          }[opt];
                          
                          const isCorrectOpt = opt === q.correct_option;
                          const isSelected = opt === answer.selectedOption;
                          
                          return (
                            <div
                              key={opt}
                              className={cn(
                                'p-3 rounded-lg flex items-start gap-2 text-sm',
                                isCorrectOpt && 'bg-setu-success/10 border border-setu-success/30',
                                isSelected && !isCorrectOpt && 'bg-destructive/10 border border-destructive/30',
                                !isCorrectOpt && !isSelected && 'bg-secondary/50'
                              )}
                            >
                              <span className="font-semibold">{opt}.</span>
                              <JeeOption option={optionText} className="flex-1" />
                              {isCorrectOpt && <CheckCircle className="w-4 h-4 text-setu-success" />}
                              {isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-destructive" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-setu-saffron mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">Solution</p>
                            <JeeSolution solution={q.explanation} className="text-muted-foreground" />
                          </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                          <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Concept Tested</p>
                            <p className="text-sm text-muted-foreground">{q.concept_tested}</p>
                          </div>
                        </div>

                        {q.common_mistake && (
                          <div className="flex items-start gap-2 p-3 bg-setu-warning/10 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-setu-warning mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Common Mistake</p>
                              <p className="text-sm text-muted-foreground">{q.common_mistake}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Jeetu Bhaiya Tip */}
      <div className="bg-gradient-to-r from-setu-saffron/10 to-setu-green/10 border border-setu-saffron/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-setu-saffron flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {accuracy >= 80 
              ? "Bahut badhiya beta! Ab ek level upar try karo. JEE Advanced level lagao."
              : accuracy >= 50
              ? "Accha attempt tha. Jo galat hua, usse ache se dekho - concept samjho, common mistakes note karo. Phir practice karo."
              : "Pehle notes padho, concepts crystal clear karo. Har galti se seekho - yahi real preparation hai. Phir dobara attempt karo."
            }
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="outline" onClick={onGoHome} className="h-12">
          <Home className="w-4 h-4 mr-2" />
          Back to Practice
        </Button>
        <Button variant="outline" onClick={onChangeDifficulty} className="h-12">
          Change Difficulty
        </Button>
        {wrongAnswers.length > 0 && (
          <Button 
            onClick={onPracticeMistakes} 
            className="h-12 bg-setu-warning hover:bg-setu-warning/90 sm:col-span-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Practice Similar Questions on Weak Concepts
          </Button>
        )}
        <Button onClick={onRetry} className="h-12 sm:col-span-2">
          <RotateCcw className="w-4 h-4 mr-2" />
          Take Test Again
        </Button>
      </div>
    </div>
  );
};

export default TestResults;
