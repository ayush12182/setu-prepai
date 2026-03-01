import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Brain, Clock, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticQuestion {
  id: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  difficulty: string;
  skill_tested: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  prerequisite_topic: string | null;
}

const DiagnosticTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selected: string; correct: string; isCorrect: boolean; time: number }[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testComplete, setTestComplete] = useState(false);
  const [generatingProfile, setGeneratingProfile] = useState(false);

  const studentLevel = profile?.student_level || '11-12';

  // Map student level to grade_range
  const gradeRange = studentLevel === '6-8' ? '6-8' : studentLevel === '9-10' ? '9-10' : '11-12';

  const loadQuestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch questions from bank for this grade range
      const { data: bankQuestions, error } = await supabase
        .from('diagnostic_questions')
        .select('*')
        .eq('grade_range', gradeRange)
        .limit(100);

      if (error) throw error;

      if (!bankQuestions || bankQuestions.length === 0) {
        // Generate questions via AI if bank is empty
        const { data: generated, error: genError } = await supabase.functions.invoke('generate-diagnostic-test', {
          body: { gradeRange, studentLevel, count: 25 }
        });
        if (genError) throw genError;
        if (generated?.questions) {
          setQuestions(generated.questions);
        } else {
          toast.error('Could not generate questions. Please try again.');
          return;
        }
      } else {
        // Shuffle and pick 25 questions, balanced across subjects and difficulties
        const shuffled = bankQuestions.sort(() => Math.random() - 0.5).slice(0, 25);
        setQuestions(shuffled as DiagnosticQuestion[]);
      }

      // Create attempt record
      const { data: attempt, error: attemptError } = await supabase
        .from('diagnostic_attempts')
        .insert({ user_id: user.id, student_level: studentLevel, total_questions: 25 })
        .select()
        .single();

      if (attemptError) throw attemptError;
      setAttemptId(attempt.id);
      setQuestionStartTime(Date.now());
    } catch (err) {
      console.error('Failed to load diagnostic test:', err);
      toast.error('Failed to load test. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, gradeRange, studentLevel]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswer = async (option: string) => {
    if (showResult || !attemptId) return;
    setSelectedOption(option);
    setShowResult(true);

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correct_option;

    // Record answer
    const answer = {
      questionId: currentQ.id,
      selected: option,
      correct: currentQ.correct_option,
      isCorrect,
      time: timeTaken,
    };
    setAnswers(prev => [...prev, answer]);

    // Save to DB
    try {
      await supabase.from('diagnostic_answers').insert({
        attempt_id: attemptId,
        question_id: currentQ.id,
        selected_option: option,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
        difficulty_at_time: currentQ.difficulty,
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      handleTestComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    }
  };

  const handleTestComplete = async () => {
    setTestComplete(true);
    setGeneratingProfile(true);

    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.time, 0);

    try {
      // Update attempt
      await supabase.from('diagnostic_attempts').update({
        status: 'completed',
        correct_answers: totalCorrect,
        total_time_seconds: totalTime,
        completed_at: new Date().toISOString(),
      }).eq('id', attemptId!);

      // Generate learning profile via AI
      const { data: profileData, error: profileError } = await supabase.functions.invoke('generate-learning-profile', {
        body: {
          attemptId,
          answers,
          questions,
          studentLevel,
          gradeRange,
        }
      });

      if (profileError) throw profileError;

      if (profileData?.profile) {
        // Save learning profile
        await supabase.from('learning_profiles').upsert({
          user_id: user!.id,
          diagnostic_attempt_id: attemptId!,
          concept_score: profileData.profile.concept_score,
          accuracy_score: profileData.profile.accuracy_score,
          speed_score: profileData.profile.speed_score,
          confidence_score: profileData.profile.confidence_score,
          weak_topics: profileData.profile.weak_topics,
          strong_topics: profileData.profile.strong_topics,
          prerequisite_gaps: profileData.profile.prerequisite_gaps,
          overall_level: profileData.profile.overall_level,
        });
      }

      toast.success('Your learning profile is ready!');
    } catch (err) {
      console.error('Failed to generate profile:', err);
      toast.error('Profile generation failed. You can retake the test later.');
    } finally {
      setGeneratingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="w-12 h-12 text-accent mx-auto animate-pulse" />
          <h2 className="text-xl font-semibold text-foreground">Preparing Your Diagnostic Test</h2>
          <p className="text-muted-foreground">We're building a personalized assessment just for you...</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
        </div>
      </div>
    );
  }

  if (testComplete) {
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((totalCorrect / answers.length) * 100);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="p-8 text-center space-y-6">
            {generatingProfile ? (
              <>
                <Sparkles className="w-12 h-12 text-accent mx-auto animate-pulse" />
                <h2 className="text-2xl font-bold text-foreground">Analyzing Your Results</h2>
                <p className="text-muted-foreground">
                  AI is building your personalized learning profile...
                </p>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
                  <Brain className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Diagnostic Complete!</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{totalCorrect}/{answers.length}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(answers.reduce((s, a) => s + a.time, 0) / 60)}m
                    </p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate('/learning-profile')}
                  className="w-full gap-2"
                >
                  View Your Learning Profile
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">No Questions Available</h2>
          <p className="text-muted-foreground">We're still building the question bank for your level. Please check back soon.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent" />
              <span className="font-semibold text-foreground text-sm">Diagnostic Assessment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Q {currentIndex + 1}/{questions.length}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Meta */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium">
                {currentQ.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                {currentQ.topic}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                currentQ.difficulty === 'easy' ? 'bg-green-500/15 text-green-500' :
                currentQ.difficulty === 'hard' ? 'bg-red-500/15 text-red-500' :
                'bg-yellow-500/15 text-yellow-500'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg font-medium text-foreground mb-6 leading-relaxed">
              {currentQ.question_text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optionText = currentQ[`option_${opt.toLowerCase()}` as keyof DiagnosticQuestion] as string;
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correct_option;

                let borderClass = 'border-border hover:border-accent/50';
                if (showResult) {
                  if (isCorrect) borderClass = 'border-green-500 bg-green-500/10';
                  else if (isSelected && !isCorrect) borderClass = 'border-red-500 bg-red-500/10';
                  else borderClass = 'border-border opacity-50';
                } else if (isSelected) {
                  borderClass = 'border-accent bg-accent/10';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${borderClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                        showResult && isCorrect ? 'bg-green-500 text-white' :
                        showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                        isSelected ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {showResult && isCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                         showResult && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> :
                         opt}
                      </span>
                      <span className="text-foreground pt-1">{optionText}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                </div>
                <Button onClick={handleNext} className="w-full gap-2" size="lg">
                  {currentIndex + 1 >= questions.length ? 'Finish Test' : 'Next Question'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiagnosticTestPage;
