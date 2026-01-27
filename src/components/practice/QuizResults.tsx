import React from 'react';
import { Button } from '@/components/ui/button';
import { Question } from '@/hooks/usePracticeQuestions';
import { QuizResult } from './QuizInterface';
import { 
  Trophy, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizResultsProps {
  result: QuizResult;
  subchapterName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onRetry: () => void;
  onChangeDifficulty: () => void;
  onGoHome: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  subchapterName,
  difficulty,
  onRetry,
  onChangeDifficulty,
  onGoHome
}) => {
  const accuracy = Math.round((result.correct / result.totalQuestions) * 100);
  const avgTimePerQuestion = Math.round(result.timeTakenSeconds / result.totalQuestions);
  
  const getPerformanceLevel = () => {
    if (accuracy >= 80) return { label: 'Excellent!', color: 'text-setu-success', emoji: '🏆' };
    if (accuracy >= 60) return { label: 'Good Job!', color: 'text-setu-saffron', emoji: '👍' };
    if (accuracy >= 40) return { label: 'Keep Practicing', color: 'text-setu-warning', emoji: '💪' };
    return { label: 'Needs Work', color: 'text-destructive', emoji: '📚' };
  };

  const performance = getPerformanceLevel();

  const getRecommendation = () => {
    if (accuracy >= 80 && difficulty !== 'hard') {
      return { text: 'Ready for harder questions!', action: 'Increase Difficulty', type: 'success' };
    }
    if (accuracy < 50 && difficulty !== 'easy') {
      return { text: 'Try easier questions first', action: 'Decrease Difficulty', type: 'warning' };
    }
    if (accuracy < 50) {
      return { text: 'Review the concepts before practicing', action: 'Read Notes', type: 'info' };
    }
    return { text: 'Good progress! Keep practicing', action: 'Practice More', type: 'neutral' };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Performance Header */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{performance.emoji}</div>
        <h2 className={cn('text-3xl font-bold', performance.color)}>
          {performance.label}
        </h2>
        <p className="text-muted-foreground mt-2">{subchapterName}</p>
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
          <p className="text-2xl font-bold text-setu-success">{result.correct}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <XCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{result.incorrect}</p>
          <p className="text-xs text-muted-foreground">Incorrect</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-setu-saffron" />
          <p className="text-2xl font-bold text-setu-saffron">{avgTimePerQuestion}s</p>
          <p className="text-xs text-muted-foreground">Avg Time</p>
        </div>
      </div>

      {/* Recommendation */}
      <div className={cn(
        'p-4 rounded-xl border flex items-center gap-3',
        recommendation.type === 'success' && 'bg-setu-success/10 border-setu-success/30',
        recommendation.type === 'warning' && 'bg-setu-warning/10 border-setu-warning/30',
        recommendation.type === 'info' && 'bg-primary/10 border-primary/30',
        recommendation.type === 'neutral' && 'bg-secondary border-border'
      )}>
        <Trophy className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">{recommendation.text}</p>
      </div>

      {/* Wrong Questions Review */}
      {result.wrongQuestions.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-setu-warning" />
            Questions to Review ({result.wrongQuestions.length})
          </h3>
          <div className="space-y-4">
            {result.wrongQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                      {q.question_text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-setu-success/10 text-setu-success px-2 py-0.5 rounded">
                        Correct: {q.correct_option}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {q.concept_tested}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jeetu Bhaiya Tip */}
      <div className="bg-gradient-to-r from-setu-saffron/10 to-setu-green/10 border border-setu-saffron/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-setu-saffron flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {accuracy >= 80 
              ? "Bahut badhiya beta! Ab ek level upar try karo."
              : accuracy >= 50
              ? "Accha hai, lekin jo galat hua usse revise karo. Phir practice karo."
              : "Pehle notes padho, concepts samjho. Phir practice karo. Shortcuts nahi chalte."
            }
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button variant="outline" onClick={onGoHome} className="h-12">
          <Home className="w-4 h-4 mr-2" />
          Back to Practice
        </Button>
        <Button variant="outline" onClick={onChangeDifficulty} className="h-12">
          Change Difficulty
        </Button>
        <Button onClick={onRetry} className="h-12">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
