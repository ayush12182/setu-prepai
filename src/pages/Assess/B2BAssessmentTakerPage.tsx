import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessmentEngine } from '@/hooks/useAssessmentEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import {
  Clock, Brain, CheckCircle2, XCircle, ArrowRight, Loader2,
  AlertTriangle, BarChart3, Target, Zap, Trophy, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { joinTeacherByCode } from '@/lib/studentActivity';
import { ShieldCheck, Key, LogIn, UserPlus } from 'lucide-react';

type TakerState = 'loading' | 'enrolling' | 'intro' | 'active' | 'review' | 'complete';

export default function B2BAssessmentTakerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const engine = useAssessmentEngine();

  const [takerState, setTakerState] = useState<TakerState>('loading');
  const [sessionConfig, setSessionConfig] = useState<any>(null);
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── LOAD SESSION ───
  useEffect(() => {
    if (!sessionId) return;
    loadSession();
  }, [sessionId, user]);

  const loadSession = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assessment_sessions')
        .select('*, batches(id, name, join_code)')
        .eq('id', sessionId)
        .maybeSingle();

      if (error || !data) {
        // Fallback for demo
        setTakerState('intro');
        return;
      }

      setSessionConfig(data);
      const batch = (data as any).batches;

      if (batch) {
        setBatchInfo(batch);
        
        // CHECK ENROLLMENT
        if (user) {
          const { data: member } = await (supabase.from as any)('batch_students')
            .select('id')
            .eq('batch_id', batch.id)
            .eq('student_id', user.id)
            .maybeSingle();

          if (member) {
            setTakerState('intro');
          } else {
            setTakerState('enrolling');
          }
        } else {
          // No user, must join/login
          setTakerState('enrolling');
        }
      } else {
        setTakerState('intro');
      }
    } catch {
      setTakerState('intro');
    }
  };

  const handleJoinBatch = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    const result = await joinTeacherByCode(joinCode);
    if (result.success) {
      toast.success('Successfully joined batch!');
      loadSession(); // Re-verify and move to intro
    } else {
      toast.error(result.message);
    }
    setJoining(false);
  };

  // ─── COUNTDOWN TIMER ───
  const startTimer = useCallback((minutes: number) => {
    setTimeLeft(minutes * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (timeExpired && takerState === 'active') {
      toast.error('Time is up! Submitting your test…');
      setTakerState('complete');
    }
  }, [timeExpired, takerState]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ─── START TEST ───
  const handleStart = async () => {
    if (!sessionConfig) return;
    const cfg = sessionConfig.metadata || {};
    setTakerState('active');
    startTimer(sessionConfig.time_limit_minutes || 30);

    await engine.startSession({
      subchapterId: cfg.subchapterId || sessionId!,
      subchapterName: cfg.subchapterName || 'Test',
      chapterId: cfg.chapterId || 'demo',
      chapterName: cfg.chapterName || 'General',
      subject: cfg.subject || 'physics',
      difficulty: cfg.difficulty || 'mixed',
      examMode: (cfg.examType || sessionConfig.exam_type || 'JEE') as any,
      batchSize: 10,
      sessionId: sessionId,
    });

    // UPDATE ASSIGNMENT STATUS (Requirement 1)
    if (user && sessionId) {
      try {
        await (supabase.from as any)('student_assessments')
          .update({ 
            status: 'in_progress', 
            started_at: new Date().toISOString() 
          })
          .eq('student_id', user.id)
          .eq('assessment_id', sessionId);
      } catch (e) {
        console.warn('Could not update status to in_progress:', e);
      }
    }
  };

  // ─── ANSWER ───
  const handleAnswer = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (showResult) return;
    setSelectedOption(opt);
    setShowResult(true);
  };

  const handleNext = async () => {
    if (!selectedOption) return;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    await engine.submitAnswer(selectedOption, timeTaken);
    setSelectedOption(null);
    setShowResult(false);
    setQuestionStartTime(Date.now());

    const answeredSoFar = engine.totalAnswered + 1;
    const totalRequired = sessionConfig?.question_count || 20;

    if (answeredSoFar >= totalRequired) {
      clearInterval(timerRef.current!);
      setTakerState('complete');
      
      // MARK COMPLETED (Requirement 1)
      if (user && sessionId) {
        try {
          await (supabase.from as any)('student_assessments')
            .update({ 
              status: 'completed', 
              completed_at: new Date().toISOString() 
            })
            .eq('student_id', user.id)
            .eq('assessment_id', sessionId);
        } catch (e) {
          console.warn('Could not update status to completed:', e);
        }
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalRequired = sessionConfig?.question_count || 20;
  const progress = (engine.totalAnswered / totalRequired) * 100;
  const isLowTime = timeLeft < 120;

  // ─── ENROLLING VIEW ───
  if (takerState === 'enrolling') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Join {batchInfo?.name || 'Classroom'}</h2>
              <p className="text-white/50 text-xs mt-1">This assessment is privatly held for this batch. Enter your join code to proceed.</p>
            </div>

            {!user ? (
               <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
                   <p className="text-xs text-amber-200/70 leading-relaxed">
                     <LogIn className="w-3 h-3 inline mr-1" /> <strong>Authentication Required</strong>: Please sign in or create an account to join this batch and track your progress.
                   </p>
                 </div>
                 <Button onClick={() => navigate('/auth', { state: { returnTo: window.location.pathname }})} className="w-full h-12 bg-white text-black font-bold">
                   Sign In to Continue
                 </Button>
               </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block text-left px-1">6-Digit Join Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="text"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-xl tracking-[0.2em] focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleJoinBatch} 
                  disabled={joining || joinCode.length !== 6}
                  className="w-full h-12 bg-accent text-white font-bold"
                >
                  {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join & Start Test'}
                </Button>
                <p className="text-[10px] text-white/30">Ask your teacher if you don't have the code.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── LOADING ───
  if (takerState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" />
          <p className="text-white/50">Loading assessment…</p>
        </div>
      </div>
    );
  }

  // ─── INTRO ───
  if (takerState === 'intro') {
    const cfg = sessionConfig?.metadata || {};
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{cfg.subchapterName || 'Assessment'}</h1>
              <p className="text-white/50 text-sm mt-1">{cfg.examType || sessionConfig?.exam_type} · AI-Generated Questions</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Target, label: `${totalRequired} Questions`, color: 'text-accent' },
                { icon: Clock, label: `${sessionConfig?.time_limit_minutes || 30} Min`, color: 'text-amber-400' },
                { icon: Shield, label: 'No Repeat Qs', color: 'text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <item.icon className={cn('w-5 h-5 mx-auto mb-1.5', item.color)} />
                  <p className="text-[10px] text-white/60 font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              {[
                '📌 Each question is AI-generated and unique to this session',
                '⚡ Questions load continuously — no waiting',
                '✅ +4 marks correct · 0 negative marking',
              ].map(item => (
                <p key={item} className="text-xs text-white/50">{item}</p>
              ))}
            </div>

            <Button
              onClick={handleStart}
              disabled={engine.loading}
              className="w-full h-14 bg-gradient-to-r from-accent to-amber-600 text-white font-bold text-base gap-2 rounded-xl"
            >
              {engine.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Start Test <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── ACTIVE TEST ───
  if (takerState === 'active') {
    const q = engine.currentQuestion;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-white">
                  {sessionConfig?.metadata?.subchapterName || 'Assessment'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/40">Q{engine.totalAnswered + 1} of {totalRequired}</span>
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-sm font-bold',
                  isLowTime ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/[0.06] text-white/70'
                )}>
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          {engine.loading && !q ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-3" />
              <p className="text-white/40 text-sm">AI generating your questions…</p>
            </div>
          ) : !q ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-sm">Preparing next question…</p>
              {engine.prefetching && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-3 text-accent" />}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={engine.currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                {/* Difficulty badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border',
                    q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  )}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-white/30">{q.concept_tested}</span>
                </div>

                {/* Question */}
                <h2 className="text-lg font-medium text-white mb-6 leading-relaxed">{q.question_text}</h2>

                {/* Options */}
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => {
                    const optText = q[`option_${opt.toLowerCase()}` as keyof typeof q] as string;
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === q.correct_option;

                    let cls = 'border-white/[0.08] hover:border-accent/40';
                    if (showResult) {
                      if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/10';
                      else if (isSelected && !isCorrect) cls = 'border-red-500 bg-red-500/10';
                      else cls = 'border-white/[0.04] opacity-40';
                    } else if (isSelected) cls = 'border-accent bg-accent/10';

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        disabled={showResult}
                        className={cn('w-full p-4 rounded-xl border-2 text-left transition-all', cls)}
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0',
                            showResult && isCorrect ? 'bg-emerald-500 text-white' :
                            showResult && isSelected ? 'bg-red-500 text-white' :
                            isSelected ? 'bg-accent text-white' : 'bg-white/[0.06] text-white/50'
                          )}>
                            {showResult && isCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                             showResult && isSelected ? <XCircle className="w-4 h-4" /> : opt}
                          </span>
                          <span className="text-white/80 pt-1 text-sm">{optText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation + Next */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <p className="text-sm font-semibold text-emerald-400 mb-1">Explanation</p>
                      <p className="text-sm text-white/60 leading-relaxed">{q.explanation}</p>
                    </div>
                    <Button
                      onClick={handleNext}
                      className="w-full h-12 bg-gradient-to-r from-accent to-amber-600 text-white font-bold gap-2"
                    >
                      {engine.totalAnswered + 1 >= totalRequired ? 'Finish Test' : 'Next Question'}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // ─── COMPLETE ───
  if (takerState === 'complete') {
    const correct = engine.correctCount;
    const total = engine.totalAnswered;
    const acc = engine.accuracy;
    const score = correct * 4; // +4/0

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 space-y-6 text-center">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto',
              acc >= 70 ? 'bg-emerald-500/15' : acc >= 45 ? 'bg-amber-500/15' : 'bg-red-500/15'
            )}>
              {acc >= 70 ? <Trophy className="w-8 h-8 text-emerald-400" /> :
               acc >= 45 ? <Target className="w-8 h-8 text-amber-400" /> :
               <Brain className="w-8 h-8 text-red-400" />}
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {acc >= 70 ? 'Excellent! 🏆' : acc >= 45 ? 'Good Attempt 👍' : 'Keep Practising 💪'}
              </h2>
              <p className="text-white/40 text-sm mt-1">{sessionConfig?.metadata?.subchapterName || 'Assessment Complete'}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Score', value: `+${score}` },
                { label: 'Accuracy', value: `${acc}%` },
                { label: 'Correct', value: `${correct}/${total}` },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/[0.05]">
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
              <p className="text-xs text-white/50 leading-relaxed">
                {acc >= 70
                  ? '🎯 Outstanding! You have strong command of this topic. Challenge yourself with harder questions next time.'
                  : acc >= 45
                  ? '📖 Solid attempt. Review the explanations for the questions you missed and practice again.'
                  : '🔄 Keep going! Read the chapter notes, understand the concepts, then reattempt this topic.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="flex-1 h-12 text-white/60 border border-white/10 hover:bg-white/5"
              >
                Retake Test
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 h-12 bg-accent text-white font-bold"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
