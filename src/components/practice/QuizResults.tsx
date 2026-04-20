import React from 'react';
import { Button } from '@/components/ui/button';
import { QuizResult } from './QuizInterface';
import { evaluateSession } from '@/lib/adaptiveEngine';
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
  BrainCircuit,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankPredictorCard } from '@/components/analytics/RankPredictorCard';

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
  
  // Adaptive Evaluator Hook
  const summary = evaluateSession('SmartMixed', accuracy, avgTimePerQuestion, 60); // Baseline 60s

  const getPerformanceLevel = () => {
    if (accuracy >= 80) return { label: 'Excellent!', color: 'text-emerald-500', emoji: '🏆' };
    if (accuracy >= 60) return { label: 'Good Job!', color: 'text-amber-500', emoji: '👍' };
    if (accuracy >= 40) return { label: 'Keep Practicing', color: 'text-amber-500', emoji: '💪' };
    return { label: 'Needs Work', color: 'text-red-500', emoji: '📚' };
  };

  const performance = getPerformanceLevel();

  // Highlight weakest topic
  const weakTopics = result.wrongQuestions.reduce((acc, q) => {
    const concept = q.concept_tested || subchapterName;
    acc[concept] = (acc[concept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weakestConcept = Object.entries(weakTopics).sort((a, b) => b[1] - a[1])[0]?.[0] || subchapterName;
  const weakestCount = weakTopics[weakestConcept] || 0;
  // Estimate accuracy naively based on total
  const estAccuracy = Math.max(0, 100 - Math.round((weakestCount / Math.max(1, result.totalQuestions / 2)) * 100));

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pb-10">
      {/* Performance Header */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4 animate-bounce">{performance.emoji}</div>
        <h2 className={cn('text-4xl font-display font-bold', performance.color)}>
          {performance.label}
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">{subchapterName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
          <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-3xl font-bold text-foreground">{accuracy}%</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Accuracy</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
          <p className="text-3xl font-bold text-emerald-500">{result.correct}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Correct</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
          <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <p className="text-3xl font-bold text-red-500">{result.incorrect}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Incorrect</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
          <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
          <p className="text-3xl font-bold text-amber-500">{avgTimePerQuestion}s</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Avg Time</p>
        </div>
      </div>

      {/* ─── LIVE RANK PREDICTION ─── */}
      <div className="mt-8">
         <RankPredictorCard 
           score={Math.round((accuracy / 100) * 300)} // Mock scaled score
           maxScore={300}
           exam="JEE_MAINS"
         />
      </div>

      {/* ─── AI SESSION SUMMARY ─── */}
      <div className="bg-gradient-to-r from-accent/10 via-amber-500/5 to-transparent border border-accent/30 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-accent" />
          Session Intelligence
        </h3>

        <div className="space-y-4">
          
          {/* Weakness Detector */}
          {weakestCount > 0 && (
            <div className="flex items-start gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">You are weak in: <span className="text-red-500">{weakestConcept}</span></p>
                <p className="text-sm text-muted-foreground mt-1">
                  You missed {weakestCount} questions here. Estimated accuracy for this concept dropped to {estAccuracy}%.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 mt-4 pt-4 border-t border-border">
            <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Recommended Next Action</p>
              <p className="text-sm text-muted-foreground">Focus exclusively on your weak spots to immediately improve overall accuracy.</p>
            </div>
            <Button onClick={onRetry} className="bg-accent text-primary-foreground font-bold shrink-0 shadow-lg shadow-accent/20 hover:scale-105 transition-transform">
              Target {weakestConcept} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Wrong Questions Review */}
      {result.wrongQuestions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Mistake Analysis ({result.wrongQuestions.length})
          </h3>
          <div className="space-y-4">
            {result.wrongQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 bg-secondary/50 border border-border rounded-xl">
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-3 leading-relaxed">
                      {q.question_text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
                        Correct: {q.correct_option}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold border border-primary/20">
                        Concept: {q.concept_tested}
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
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-border rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-5">👨‍🏫</div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center flex-shrink-0 border-2 border-slate-950 shadow-lg shadow-accent/20">
            <span className="text-white font-display font-bold text-lg">JB</span>
          </div>
          <div>
            <p className="text-sm text-white/90 leading-relaxed font-medium mt-1">
              {accuracy >= 80 
                ? "Bahut badhiya beta! Ab ek level upar try karo. Easy questions se rank nahi aati."
                : accuracy >= 50
                ? "Accha hai, lekin jo galat hua usse abhi ke abhi revise karo. Move on nahi karna hai."
                : "Pehle notes padho, concepts samjho. Shortcuts mat dhundo, foundation weak hai abhi."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        <Button variant="outline" onClick={onGoHome} className="h-14 font-bold rounded-xl bg-card hover:bg-secondary border-border text-foreground transition-all">
          <Home className="w-4 h-4 mr-2" />
          End Session
        </Button>
        <Button variant="outline" onClick={onChangeDifficulty} className="h-14 font-bold rounded-xl bg-card hover:bg-secondary border-border text-foreground transition-all">
          Change Level
        </Button>
        <Button onClick={onRetry} className="h-14 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry Mistakes
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
