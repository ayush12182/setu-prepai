import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Brain, Clock, CheckCircle2, XCircle, ArrowRight, Sparkles, Lightbulb, Network, Gauge, Target, BookOpen } from 'lucide-react';
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

  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // CAT: Track current difficulty level
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionPool, setQuestionPool] = useState<DiagnosticQuestion[]>([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const loadQuestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch ALL questions from bank for this grade range (for CAT pool)
      const { data: bankQuestions, error } = await supabase
        .from('diagnostic_questions')
        .select('*')
        .eq('grade_range', gradeRange)
        .limit(200);

      if (error) throw error;

      let pool: DiagnosticQuestion[] = [];

      if (!bankQuestions || bankQuestions.length === 0) {
        // Generate questions via AI if bank is empty
        const { data: generated, error: genError } = await supabase.functions.invoke('generate-diagnostic-test', {
          body: { gradeRange, studentLevel, count: 40 }
        });
        if (genError) throw genError;
        if (generated?.questions) {
          pool = generated.questions;
        } else {
          toast.error('Could not generate questions. Please try again.');
          return;
        }
      } else {
        pool = bankQuestions.sort(() => Math.random() - 0.5) as DiagnosticQuestion[];
      }

      setQuestionPool(pool);

      // CAT: Start with medium difficulty question
      const firstQ = pool.find(q => q.difficulty === 'medium') || pool[0];
      setQuestions([firstQ]);

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

  // CAT: Select next question based on performance
  const selectNextCATQuestion = (wasCorrect: boolean) => {
    let newConsCorrect = wasCorrect ? consecutiveCorrect + 1 : 0;
    let newConsWrong = wasCorrect ? 0 : consecutiveWrong + 1;
    setConsecutiveCorrect(newConsCorrect);
    setConsecutiveWrong(newConsWrong);

    // Adjust difficulty based on CAT logic
    let nextDifficulty = currentDifficulty;
    if (newConsCorrect >= 2 && currentDifficulty === 'easy') nextDifficulty = 'medium';
    else if (newConsCorrect >= 2 && currentDifficulty === 'medium') nextDifficulty = 'hard';
    else if (newConsWrong >= 2 && currentDifficulty === 'hard') nextDifficulty = 'medium';
    else if (newConsWrong >= 2 && currentDifficulty === 'medium') nextDifficulty = 'easy';
    // If incorrect, also try shifting to prerequisite topic
    if (!wasCorrect) {
      const currentQ = questions[currentIndex];
      if (currentQ?.prerequisite_topic) {
        const prereqQ = questionPool.find(q =>
          q.topic.toLowerCase().includes(currentQ.prerequisite_topic!.toLowerCase()) &&
          !questions.some(asked => asked.id === q.id)
        );
        if (prereqQ) {
          setCurrentDifficulty(nextDifficulty);
          setQuestions(prev => [...prev, prereqQ]);
          return;
        }
      }
    }

    setCurrentDifficulty(nextDifficulty);

    // Find next question at the target difficulty that hasn't been asked
    const askedIds = new Set(questions.map(q => q.id));
    let candidates = questionPool.filter(q => q.difficulty === nextDifficulty && !askedIds.has(q.id));
    if (candidates.length === 0) {
      // Fallback to any unused question
      candidates = questionPool.filter(q => !askedIds.has(q.id));
    }
    if (candidates.length > 0) {
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      setQuestions(prev => [...prev, next]);
    }
  };

  useEffect(() => {
    if (testStarted) loadQuestions();
  }, [testStarted, loadQuestions]);

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
    const totalTarget = 25;
    if (answers.length >= totalTarget) {
      handleTestComplete();
    } else {
      // CAT: Select next question adaptively
      const lastAnswer = answers[answers.length - 1];
      selectNextCATQuestion(lastAnswer?.isCorrect || false);
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

  const INTRO_FEATURES = [
    { icon: Lightbulb, title: 'Concept Understanding', desc: 'We check if you truly understand fundamentals — not just memorized answers. Can you apply a concept in a new situation?', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Brain, title: 'Thinking Pattern', desc: 'We observe how you approach problems — logically or randomly, with confidence or hesitation. This reveals your problem-solving style.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Network, title: 'Concept Connections', desc: 'Learning is a network. We detect which foundations are missing and where gaps actually start — often in an earlier concept.', color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { icon: Gauge, title: 'Speed & Confidence', desc: 'Time per question, decision hesitation, accuracy under pressure — we estimate your learning pace and cognitive load tolerance.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Target, title: 'Strength & Weakness Map', desc: 'You won\'t get marks. You\'ll get a Learning Profile — strong zones (green), developing (orange), and foundation gaps (grey).', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  // ─── INTRO SCREEN ───
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[25%] w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-5">
              <Brain className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-accent">SETU Learning Diagnostic</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
              Understand How You <span className="text-accent">Think</span>,<br />Not Just What You Know
            </h1>
            <p className="text-white/45 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              This is not a marks-based test. We analyze your thinking patterns, concept clarity, and learning behavior to build your personalized profile.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="space-y-3 mb-8">
            {INTRO_FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <feat.icon className={`h-5 w-5 ${feat.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{feat.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Difference callout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 p-5 rounded-2xl bg-accent/[0.06] border border-accent/15 text-center"
          >
            <p className="text-white/50 text-xs mb-1">Normal tests ask: <span className="text-white/70">"How much did you score?"</span></p>
            <p className="text-accent font-semibold text-sm">SETU asks: "How does your brain learn best?"</p>
          </motion.div>

          {/* Result preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
          >
            <p className="text-white/60 text-xs mb-3 font-medium flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> After the test, your dashboard becomes personalized:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Topics to study first', 'Concepts to reinforce', 'Weekly improvement plan', 'Guidance for your style'].map(item => (
                <div key={item} className="flex items-center gap-2 text-white/40 text-[11px]">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center">
            <Button
              size="lg"
              onClick={() => { setTestStarted(true); setLoading(true); }}
              className="h-13 px-10 rounded-xl bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white font-semibold shadow-xl shadow-accent/25 text-base gap-2"
            >
              Begin Diagnostic <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-3 text-[11px] text-white/25">~15 minutes • 25 adaptive questions • No marks, only insights</p>
          </motion.div>
        </div>
      </div>
    );
  }

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
  const progress = ((answers.length + (showResult ? 0 : 0)) / 25) * 100;

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
              <span>Q {answers.length + 1}/25</span>
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
