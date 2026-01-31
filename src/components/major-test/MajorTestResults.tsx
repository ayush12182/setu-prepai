import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MajorTestQuestion, MajorTestAnswer, ChapterAnalysis } from '@/hooks/useMajorTest';
import { cn } from '@/lib/utils';

interface SubjectStats {
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
}

interface TestResults {
  totalScore: number;
  maxScore: number;
  percentile: number;
  physics: SubjectStats;
  chemistry: SubjectStats;
  maths: SubjectStats;
  chapterAnalysis: ChapterAnalysis[];
}

interface MajorTestResultsProps {
  results: TestResults;
  questions: MajorTestQuestion[];
  answers: Map<string, MajorTestAnswer>;
  totalTime: number;
  onViewMentorMessage: () => void;
  onGoHome: () => void;
}

const MajorTestResults: React.FC<MajorTestResultsProps> = ({
  results,
  questions,
  answers,
  totalTime,
  onViewMentorMessage,
  onGoHome
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'physics': return 'text-blue-600 bg-blue-50';
      case 'chemistry': return 'text-green-600 bg-green-50';
      case 'maths': return 'text-purple-600 bg-purple-50';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'strong': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'weak': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  // Group chapters by strength
  const strongChapters = results.chapterAnalysis.filter(c => c.strengthLevel === 'strong');
  const weakChapters = results.chapterAnalysis.filter(c => c.strengthLevel === 'weak');
  const moderateChapters = results.chapterAnalysis.filter(c => c.strengthLevel === 'moderate');

  // Calculate error types
  const calculateErrors = () => {
    let silly = 0, conceptual = 0, guessing = 0;
    
    answers.forEach((answer, questionId) => {
      if (answer.selectedOption && answer.selectedOption !== answer.correctOption) {
        // Time < 30s = likely guessing
        if (answer.timeSpent < 30) {
          guessing++;
        } else if (answer.timeSpent < 60) {
          silly++;
        } else {
          conceptual++;
        }
      }
    });
    
    return { silly, conceptual, guessing };
  };

  const errors = calculateErrors();

  // Get accuracy percentage
  const accuracy = results.maxScore > 0 
    ? Math.round((results.totalScore / results.maxScore) * 100) 
    : 0;

  const totalCorrect = results.physics.correct + results.chemistry.correct + results.maths.correct;
  const totalIncorrect = results.physics.incorrect + results.chemistry.incorrect + results.maths.incorrect;
  const totalUnattempted = results.physics.unattempted + results.chemistry.unattempted + results.maths.unattempted;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Major Test Results
          </h1>
          <p className="text-muted-foreground">
            Detailed analysis of your JEE Main simulation
          </p>
        </div>

        {/* Score Overview */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Score */}
            <div className="text-center p-6 bg-primary/5 rounded-xl">
              <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
              <div className="text-4xl font-bold text-primary mb-1">
                {results.totalScore}
              </div>
              <div className="text-sm text-muted-foreground">
                out of {results.maxScore}
              </div>
            </div>

            {/* Percentile */}
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <BarChart3 className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-green-600 mb-1">
                {results.percentile.toFixed(1)}
              </div>
              <div className="text-sm text-green-700">
                Percentile (Est.)
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Target className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {totalIncorrect + totalCorrect > 0 
                  ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-blue-700">
                Accuracy
              </div>
            </div>

            {/* Time */}
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <Clock className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-600 mb-1">
                {formatTime(totalTime)}
              </div>
              <div className="text-sm text-purple-700">
                Total Time
              </div>
            </div>
          </div>

          {/* Question Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-lg font-medium text-green-600">{totalCorrect} Correct</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-lg font-medium text-red-600">{totalIncorrect} Incorrect</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg font-medium text-muted-foreground">{totalUnattempted} Unattempted</span>
            </div>
          </div>
        </div>

        {/* Subject-wise Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Physics', stats: results.physics, color: 'blue' },
            { name: 'Chemistry', stats: results.chemistry, color: 'green' },
            { name: 'Maths', stats: results.maths, color: 'purple' }
          ].map(subject => (
            <div 
              key={subject.name}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="font-semibold text-lg mb-4">{subject.name}</h3>
              <div className="text-3xl font-bold text-foreground mb-2">
                {subject.stats.score} / 120
              </div>
              <Progress 
                value={(subject.stats.score / 120) * 100} 
                className="h-2 mb-4"
              />
              <div className="grid grid-cols-3 text-center text-sm">
                <div>
                  <div className="font-bold text-green-600">{subject.stats.correct}</div>
                  <div className="text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="font-bold text-red-600">{subject.stats.incorrect}</div>
                  <div className="text-muted-foreground">Wrong</div>
                </div>
                <div>
                  <div className="font-bold text-muted-foreground">{subject.stats.unattempted}</div>
                  <div className="text-muted-foreground">Skip</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Analysis */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Error Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600">{errors.silly}</div>
              <div className="text-sm text-amber-700">Silly Mistakes</div>
              <div className="text-xs text-muted-foreground mt-1">Quick errors, knew the concept</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{errors.conceptual}</div>
              <div className="text-sm text-red-700">Conceptual Errors</div>
              <div className="text-xs text-muted-foreground mt-1">Need to revisit fundamentals</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">{errors.guessing}</div>
              <div className="text-sm text-gray-700">Guessing Errors</div>
              <div className="text-xs text-muted-foreground mt-1">Answered too quickly</div>
            </div>
          </div>
        </div>

        {/* Chapter Analysis */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Chapter-wise Performance
          </h3>

          {/* Strong Chapters */}
          {strongChapters.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">Strong Chapters ({strongChapters.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {strongChapters.map(chapter => (
                  <div 
                    key={chapter.chapterId}
                    className="p-3 bg-green-50 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-green-800">{chapter.chapterName}</span>
                    <span className="text-xs text-green-600">{chapter.accuracy.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Chapters */}
          {weakChapters.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-700">Weak Chapters - Focus Here ({weakChapters.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {weakChapters.map(chapter => (
                  <div 
                    key={chapter.chapterId}
                    className="p-3 bg-red-50 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-red-800">{chapter.chapterName}</span>
                    <span className="text-xs text-red-600">{chapter.accuracy.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderate Chapters */}
          {moderateChapters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-700">Needs Improvement ({moderateChapters.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {moderateChapters.map(chapter => (
                  <div 
                    key={chapter.chapterId}
                    className="p-3 bg-yellow-50 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-yellow-800">{chapter.chapterName}</span>
                    <span className="text-xs text-yellow-600">{chapter.accuracy.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={onGoHome}>
            Back to Dashboard
          </Button>
          <Button onClick={onViewMentorMessage} className="bg-primary text-primary-foreground">
            View Jeetu Bhaiya's Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MajorTestResults;
