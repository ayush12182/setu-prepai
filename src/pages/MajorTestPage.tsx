import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMajorTest, ChapterAnalysis } from '@/hooks/useMajorTest';
import MajorTestWarning from '@/components/major-test/MajorTestWarning';
import MajorTestExam from '@/components/major-test/MajorTestExam';
import MajorTestResults from '@/components/major-test/MajorTestResults';
import MajorTestMentorMessage from '@/components/major-test/MajorTestMentorMessage';
import { Loader2 } from 'lucide-react';
import { useExamMode } from '@/contexts/ExamModeContext';

type TestPhase = 'warning' | 'loading' | 'exam' | 'results' | 'mentor';

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
  const { isNeet } = useExamMode();
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
    toggleMarkReview,
    updateTimeSpent,
    handleTabSwitch,
    submitTest
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

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleViewMentor = () => {
    setPhase('mentor');
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  // Loading state
  if (phase === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            {phase === 'loading' && !questions.length
              ? 'Preparing your Major Test...'
              : 'Submitting your test...'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Generating {isNeet ? '180 NEET-level' : '90 JEE-level'} questions
          </p>
        </div>
      </div>
    );
  }

  // Warning phase
  if (phase === 'warning') {
    return (
      <MajorTestWarning
        onStart={handleStartTest}
        onCancel={handleCancel}
        loading={loading}
      />
    );
  }

  // Exam phase
  if (phase === 'exam' && questions.length > 0) {
    return (
      <MajorTestExam
        questions={questions}
        answers={answers}
        timeRemaining={timeRemaining}
        tabSwitchCount={tabSwitchCount}
        onUpdateAnswer={updateAnswer}
        onToggleMarkReview={toggleMarkReview}
        onUpdateTimeSpent={updateTimeSpent}
        onTabSwitch={handleTabSwitch}
        onSubmit={handleSubmitTest}
      />
    );
  }

  // Results phase
  if (phase === 'results' && results) {
    return (
      <MajorTestResults
        results={results}
        questions={questions}
        answers={answers}
        totalTime={totalTimeUsed}
        onViewMentorMessage={handleViewMentor}
        onGoHome={handleGoHome}
      />
    );
  }

  // Mentor message phase
  if (phase === 'mentor' && results) {
    const weakChapters = results.chapterAnalysis.filter(c => c.strengthLevel === 'weak');
    const strongChapters = results.chapterAnalysis.filter(c => c.strengthLevel === 'strong');

    return (
      <MajorTestMentorMessage
        score={results.totalScore}
        maxScore={results.maxScore}
        percentile={results.percentile}
        weakChapters={weakChapters}
        strongChapters={strongChapters}
        onContinue={handleContinue}
      />
    );
  }

  return null;
};

export default MajorTestPage;
