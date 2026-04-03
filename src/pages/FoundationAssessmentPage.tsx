import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClassContext } from '@/contexts/ClassContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Brain, Clock, CheckCircle2, XCircle, ArrowRight, Sparkles, Lightbulb, Target, ShieldCheck, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { ProctoringOverlay, ProctoringState } from '@/components/diagnostic/ProctoringOverlay';
import { getASATDiagnosticQuestions } from '@/data/diagnosticQuestions';

export interface FoundationQuestion {
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
  [key: string]: unknown;
}

const FoundationAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { diagnosticCompleted } = useClassContext();

  // Redirect if test already completed
  useEffect(() => {
    if (diagnosticCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [diagnosticCompleted, navigate]);

  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<FoundationQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selected: string; correct: string; isCorrect: boolean; time: number; subject: string; topic: string; difficulty: string; skill_tested: string }[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testComplete, setTestComplete] = useState(false);
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [testStartTimestamp, setTestStartTimestamp] = useState(Date.now());

  const studentClass = profile?.class || '11';
  const studentLevel = profile?.student_level || '11-12';
  
  // Stream from onboarding metadata
  const stream: string = (user as any)?.user_metadata?.stream || 'jee';

  // Proctoring state
  const [proctoringState, setProctoringState] = useState<ProctoringState>({
    tabSwitchCount: 0, fullscreenExitCount: 0, copyAttemptCount: 0,
    cameraInactiveSeconds: 0, events: [], integrityScore: 100,
  });
  const isProctored = !['foundation'].includes(stream);
  const TOTAL_QUESTIONS = questions.length || 30; // Fallback to 30

  const loadQuestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // STEP 1: Load questions instantly from local bank — zero network wait
    let pool = getASATDiagnosticQuestions(stream) as FoundationQuestion[];
    pool = pool.map(q => shuffleQuestionOptions(q as any) as unknown as FoundationQuestion);
    setQuestions(pool);

    // STEP 2: Use a temp attempt ID immediately so the test can start
    const tempId = crypto.randomUUID();
    setAttemptId(tempId);
    setQuestionStartTime(Date.now());
    setTestStartTimestamp(Date.now());

    // Hide loader immediately — test is ready
    setLoading(false);

    // STEP 3: Create DB record in the background (non-blocking)
    supabase
      .from('diagnostic_attempts')
      .insert({ user_id: user.id, student_level: studentLevel, total_questions: pool.length })
      .select()
      .single()
      .then(({ data: attempt, error }) => {
        if (!error && attempt) {
          setAttemptId(attempt.id); // Swap temp ID for real DB ID
        } else {
          console.warn('Attempt record failed (will use temp ID):', error);
        }
      });
  }, [user, stream, studentLevel]);

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

    const answer = { 
      questionId: currentQ.id, 
      selected: option, 
      correct: currentQ.correct_option, 
      isCorrect, 
      time: timeTaken,
      subject: currentQ.subject,
      topic: currentQ.topic,
      difficulty: currentQ.difficulty,
      skill_tested: currentQ.skill_tested
    };
    setAnswers(prev => [...prev, answer]);

    try {
      await supabase.from('diagnostic_answers').insert({
        attempt_id: attemptId,
        question_id: currentQ.id || crypto.randomUUID(), // fallback for unsaved edge fn questions
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
    if (answers.length >= TOTAL_QUESTIONS || currentIndex + 1 >= questions.length) {
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

    // No negative marking applied
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.time, 0);

    try {
      await supabase.from('diagnostic_attempts').update({
        status: 'completed',
        correct_answers: totalCorrect,
        total_time_seconds: totalTime,
        completed_at: new Date().toISOString(),
        // @ts-ignore stream & proctoring fields
        stream,
        tab_switch_count: proctoringState.tabSwitchCount,
        fullscreen_exit_count: proctoringState.fullscreenExitCount,
        copy_attempt_count: proctoringState.copyAttemptCount,
        camera_inactive_seconds: proctoringState.cameraInactiveSeconds,
        proctoring_events: proctoringState.events,
      }).eq('id', attemptId!);

      // Update Edge Function call to trigger new AI Report format
      const { data: profileData, error: profileError } = await supabase.functions.invoke('generate-learning-profile', {
        body: { attemptId, answers, questions, stream }
      });

      if (profileError) throw profileError;

      if (profileData?.profile) {
        await supabase.from('learning_profiles').upsert({
          user_id: user!.id,
          diagnostic_attempt_id: attemptId!,
          diagnostic_completed: true,
          concept_score: profileData.profile.concept_score,
          accuracy_score: profileData.profile.accuracy_score,
          speed_score: profileData.profile.speed_score,
          confidence_score: profileData.profile.confidence_score,
          weak_topics: profileData.profile.weak_topics,
          strong_topics: profileData.profile.strong_topics,
          prerequisite_gaps: profileData.profile.prerequisite_gaps,
          overall_level: profileData.profile.overall_level,
          metadata: {
            action_plan: profileData.profile.metadata?.action_plan || profileData.profile.action_plan,
            mistake_patterns: profileData.profile.metadata?.mistake_patterns || profileData.profile.mistake_patterns,
            time_analysis: profileData.profile.metadata?.time_analysis || "",
            subject_performance: profileData.profile.metadata?.subject_performance || {},
          }
        });

        // @ts-ignore
        await supabase.from('profiles').update({ diagnostic_completed: true }).eq('user_id', user!.id);
      }

      toast.success('Your Foundation Report is ready!');
    } catch (err) {
      console.error('Failed to generate profile:', err);
      toast.error('Report generation failed. You can retake the test later.');
    } finally {
      setGeneratingProfile(false);
    }
  };

  // ─── INTRO SCREEN ───
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-accent/[0.05] rounded-full blur-[160px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 lg:py-20 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="mb-12 lg:mb-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Brain className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent tracking-wide uppercase">Pre-Preparation Phase</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-5xl font-bold text-white mb-5 leading-[1.15]">
                Welcome to your <br className="hidden sm:block" /> <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent underline decoration-accent/30 pr-2">Foundation Assessment</span>
              </h1>
              <p className="text-white/50 text-base sm:text-lg max-w-lg leading-relaxed mb-6">
                Before you begin your Class 11 journey, let's map out your Class 10 prerequisite knowledge. We identify your conceptual gaps so you can start strong.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Button
                  size="lg"
                  onClick={() => { setTestStarted(true); setLoading(true); }}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white font-semibold shadow-[0_0_40px_rgba(232,154,60,0.3)] hover:shadow-[0_0_60px_rgba(232,154,60,0.4)] transition-all duration-300 text-base gap-2"
                >
                  Start Assessment <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="flex sm:flex-col gap-4 sm:gap-1 text-white/40 text-[11px] font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-white/30" /> ~45 minutes</span>
                  <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-white/30" /> Exactly 30 questions</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-white/30" /> No negative marks</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent rounded-3xl blur-2xl" />
            <div className="relative space-y-4">
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-white/80 mb-4 px-1">What we map</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
                    <Lightbulb className="h-5 w-5 text-amber-400 mb-3" />
                    <h4 className="font-semibold text-white/90 text-[13px] mb-1">Subject Proficiency</h4>
                    <p className="text-white/40 text-[11px]">Exact breakdown of where you stand per subject.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
                    <Brain className="h-5 w-5 text-violet-400 mb-3" />
                    <h4 className="font-semibold text-white/90 text-[13px] mb-1">Mistake Patterns</h4>
                    <p className="text-white/40 text-[11px]">Identifying if you make calculation vs conceptual errors.</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
        <ProctoringOverlay enabled={isProctored} onStateChange={setProctoringState} />
        
        <div className="text-center space-y-6 max-w-md relative z-10 mt-[-10vh]">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <Brain className="w-12 h-12 text-accent" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white leading-tight">Preparing Your Assessment</h2>
            <p className="text-white/40 text-sm">Building your custom 30-question entrance pack...</p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-center gap-3 text-xs font-medium text-white/30 uppercase tracking-widest">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Generating Questions</span>
            </div>
            
            {isProctored && (
              <div className="flex items-center justify-center gap-3 text-xs font-medium text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
                <span>Camera & Proctoring Initializing</span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-white/20 italic pt-8 uppercase tracking-tighter">
            AI is analyzing your stream requirements to select the best Class 10 fundamentals.
          </p>
        </div>
      </div>
    );
  }

  // ─── COMPLETE ───
  if (testComplete) {
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((s, a) => s + a.time, 0);

    return (
       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
          <Card className="p-6 sm:p-8 text-center space-y-5 bg-white/[0.04] border-white/[0.08] backdrop-blur-md">
            {generatingProfile ? (
              <>
                <Sparkles className="w-12 h-12 text-accent mx-auto animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Generating AI Report</h2>
                <p className="text-white/40 text-sm">Analyzing subjects, weakness topics, and drawing your action plan…</p>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-white">Assessment Complete! 🎉</h2>
                
                <div className="grid grid-cols-3 gap-3 my-6">
                  <div className="p-3 rounded-xl bg-white/[0.05]">
                    <p className="text-xl font-bold text-white">{Math.round((totalCorrect / answers.length) * 100)}%</p>
                    <p className="text-[10px] text-white/40">Accuracy</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.05]">
                    <p className="text-xl font-bold text-white">+{totalCorrect * 4}</p>
                    <p className="text-[10px] text-white/40">Score (+4/0)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.05]">
                    <p className="text-xl font-bold text-white">{Math.round(totalTime / 60)}m</p>
                    <p className="text-[10px] text-white/40">Time</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => navigate('/learning-profile')}
                  className="w-full gap-2 bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white"
                >
                  View Full Detailed Report <ArrowRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── ACTIVE TEST ───
  const currentQ = questions[currentIndex];
  const progress = (answers.length / TOTAL_QUESTIONS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ProctoringOverlay enabled={isProctored} onStateChange={setProctoringState} />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent" />
              <span className="font-semibold text-white text-sm">Foundation Assessment</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Q{answers.length + 1} of {TOTAL_QUESTIONS}</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Meta tags */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium uppercase tracking-wide">
                  {currentQ.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/50 text-xs">
                  {currentQ.topic}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/60 capitalize`}>
                  {currentQ.difficulty || 'medium'}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg font-medium text-white mb-6 leading-relaxed">
                {currentQ.question_text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optionText = currentQ[`option_${opt.toLowerCase()}` as keyof FoundationQuestion] as string;
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQ.correct_option;

                  let borderClass = 'border-white/[0.08] hover:border-accent/40';
                  if (showResult) {
                    if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-500/10';
                    else if (isSelected && !isCorrect) borderClass = 'border-rose-500 bg-rose-500/10';
                    else borderClass = 'border-white/[0.04] opacity-40';
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
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${showResult && isCorrect ? 'bg-emerald-500 text-white' :
                          showResult && isSelected && !isCorrect ? 'bg-rose-500 text-white' :
                            isSelected ? 'bg-accent text-white' : 'bg-white/[0.06] text-white/50'
                          }`}>
                          {showResult && isCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                            showResult && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> :
                              opt}
                        </span>
                        <span className="text-white/80 pt-1 text-sm">{optionText}</span>
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
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <p className="text-sm text-white/50 leading-relaxed"><span className="text-emerald-400 font-bold block mb-1">Explanation</span> {currentQ.explanation}</p>
                  </div>
                  <Button
                    onClick={handleNext}
                    className="w-full gap-2 bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white"
                    size="lg"
                  >
                    {currentIndex + 1 >= TOTAL_QUESTIONS ? 'Finish Assessment' : 'Next Question'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FoundationAssessmentPage;
