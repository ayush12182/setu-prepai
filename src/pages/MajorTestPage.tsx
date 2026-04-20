import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMajorTest, ChapterAnalysis } from '@/hooks/useMajorTest';
import MajorTestWarning from '@/components/major-test/MajorTestWarning';
import MajorTestExam from '@/components/major-test/MajorTestExam';
import MajorTestResults from '@/components/major-test/MajorTestResults';
import MajorTestMentorMessage from '@/components/major-test/MajorTestMentorMessage';
import { Loader2 } from 'lucide-react';

type TestPhase = 'warning' | 'loading' | 'exam' | 'results' | 'teacher';

interface TestResultsData {
  totalScore: number;
  maxScore: number;
  percentile: number;
  physics: { correct: number; incorrect: number; unattempted: number; score: number };
  chemistry: { correct: number; incorrect: number; unattempted: number; score: number };
  maths: { correct: number; incorrect: number; unattempted: number; score: number };
  chapterAnalysis: ChapterAnalysis[];
}

const MajorTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<TestPhase>('warning');
  const [results, setResults] = useState<TestResultsData | null>(null);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);

  const {
    questions,
    answers,
    loading,
    timeRemaining,
    tabSwitchCount,
    startTest,
    updateAnswer,
    updateNumericalAnswer,
    toggleMarkReview,
    updateTimeSpent,
    handleTabSwitch,
    submitTest,
  } = useMajorTest();

  const handleStartTest = async () => {
    setPhase('loading');
    const success = await startTest();
    if (success) {
      setPhase('exam');
    } else {
      setPhase('warning');
    }
  };

  const handleSubmitTest = async () => {
    setPhase('loading');
    const result = await submitTest();
    if (result) {
      setTotalTimeUsed((180 * 60) - timeRemaining);
      setResults(result);
      setPhase('results');
      if (document.fullscreenElement) document.exitFullscreen();
    }
  };

  if (phase === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            {phase === 'loading' && !questions.length ? 'Preparing your Major Test...' : 'Submitting your test...'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Generating 75 NTA-pattern JEE questions (20 MCQ + 5 Integer per subject)
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'warning') {
    return <MajorTestWarning onStart={handleStartTest} onCancel={() => navigate('/dashboard')} loading={loading} />;
  }

  if (phase === 'exam' && questions.length > 0) {
    return (
      <MajorTestExam
        questions={questions}
        answers={answers}
        timeRemaining={timeRemaining}
        tabSwitchCount={tabSwitchCount}
        onUpdateAnswer={updateAnswer}
        onUpdateNumericalAnswer={updateNumericalAnswer}
        onToggleMarkReview={toggleMarkReview}
        onUpdateTimeSpent={updateTimeSpent}
        onTabSwitch={handleTabSwitch}
        onSubmit={handleSubmitTest}
      />
    );
  }

  if (phase === 'results' && results) {
    return (
      <MajorTestResults
        results={results}
        questions={questions}
        answers={answers}
        totalTime={totalTimeUsed}
        onViewMentorMessage={() => setPhase('teacher')}
        onGoHome={() => navigate('/dashboard')}
      />
    );
  }

  if (phase === 'teacher' && results) {
    const weakChapters = results.chapterAnalysis.filter(c => c.strengthLevel === 'weak');
    const strongChapters = results.chapterAnalysis.filter(c => c.strengthLevel === 'strong');
    return (
      <MajorTestMentorMessage
        score={results.totalScore}
        maxScore={results.maxScore}
        percentile={results.percentile}
        weakChapters={weakChapters}
        strongChapters={strongChapters}
        onContinue={() => navigate('/dashboard')}
      />
    );
  }

  return null;
};

export default MajorTestPage;
