import React, { useState, useEffect } from 'react';
import { useTestQuestions, ChapterSelection } from '@/hooks/useTestQuestions';
import TestModeQuiz, { TestAnswer } from '@/components/practice/TestModeQuiz';
import TestResults from '@/components/practice/TestResults';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestConfig {
  type: 'chapter' | 'mixed' | 'pyq' | 'adaptive';
  chapters?: ChapterSelection[];
  subject?: string;
  yearRange?: { start: number; end: number };
  questionCount?: number;
}

interface TestExecutionProps {
  config: TestConfig;
  onComplete: () => void;
  onExit: () => void;
}

const TestExecution: React.FC<TestExecutionProps> = ({
  config,
  onComplete,
  onExit
}) => {
  const [step, setStep] = useState<'loading' | 'quiz' | 'results'>('loading');
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [totalTime, setTotalTime] = useState(0);

  const {
    questions,
    loading,
    error,
    fetchMixedTestQuestions,
    fetchPYQQuestions,
    fetchAdaptiveQuestions,
    recordAttempt
  } = useTestQuestions();

  const loadQuestions = async () => {
    let result;
    
    switch (config.type) {
      case 'chapter':
        if (config.chapters && config.chapters.length > 0) {
          result = await fetchMixedTestQuestions(config.chapters, 10);
        }
        break;
      case 'mixed':
        if (config.chapters && config.chapters.length > 0) {
          result = await fetchMixedTestQuestions(config.chapters, 5);
        }
        break;
      case 'pyq':
        result = await fetchPYQQuestions(
          config.subject,
          undefined,
          config.yearRange,
          config.questionCount || 25
        );
        break;
      case 'adaptive':
        result = await fetchAdaptiveQuestions(config.questionCount || 15);
        break;
    }

    if (result && result.length > 0) {
      setStep('quiz');
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [config]);

  const handleTestComplete = (answers: TestAnswer[], time: number) => {
    setTestAnswers(answers);
    setTotalTime(time);
    setStep('results');
  };

  const handleRetry = async () => {
    setStep('loading');
    setTestAnswers([]);
    setTotalTime(0);
    await loadQuestions();
  };

  const getTestTitle = () => {
    switch (config.type) {
      case 'chapter':
        return config.chapters?.[0]?.chapterName || 'Chapter Test';
      case 'mixed':
        return `Mixed Test (${config.chapters?.length || 0} chapters)`;
      case 'pyq':
        return `PYQ Test ${config.yearRange ? `(${config.yearRange.start}-${config.yearRange.end})` : ''}`;
      default:
        return 'Test';
    }
  };

  // Loading state
  if (step === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          Preparing your {config.type === 'pyq' ? 'PYQ' : config.type} test...
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {config.type === 'pyq' 
            ? 'Fetching previous year questions...'
            : 'Generating JEE-style questions...'}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-10 h-10 text-destructive mb-4" />
        <p className="text-destructive mb-4">{error}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExit}>
            Back to Tests
          </Button>
          <Button onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Quiz state
  if (step === 'quiz' && questions.length > 0) {
    return (
      <TestModeQuiz
        questions={questions}
        subchapterName={getTestTitle()}
        difficulty="medium"
        onComplete={handleTestComplete}
        onRecordAttempt={recordAttempt}
      />
    );
  }

  // Results state
  if (step === 'results') {
    return (
      <TestResults
        answers={testAnswers}
        subchapterName={getTestTitle()}
        difficulty="medium"
        totalTime={totalTime}
        onRetry={handleRetry}
        onChangeDifficulty={onComplete}
        onGoHome={onComplete}
        onPracticeMistakes={onComplete}
      />
    );
  }

  // No questions found
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">No questions found for this test configuration.</p>
      <Button variant="outline" onClick={onExit}>
        Back to Tests
      </Button>
    </div>
  );
};

export default TestExecution;
