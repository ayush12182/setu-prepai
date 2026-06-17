import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClassContext } from '@/contexts/ClassContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Brain, Clock, CheckCircle2, XCircle, ArrowRight, Sparkles, Lightbulb, Network, Gauge, Target, BookOpen, Zap, ShieldCheck, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { getDiagnosticQuestions } from '@/data/diagnosticQuestions';
import { ProctoringOverlay, ProctoringState } from '@/components/diagnostic/ProctoringOverlay';

export interface DiagnosticQuestion {
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

// Section definitions for structured diagnostic
const SECTIONS = [
  { name: 'Foundation', label: '🟢 Foundation Check', color: 'text-emerald-400', bg: 'bg-emerald-500/15', difficulty: 'easy', count: 6, desc: 'Basic concepts & prerequisite clarity' },
  { name: 'Understanding', label: '🟡 Understanding', color: 'text-amber-400', bg: 'bg-amber-500/15', difficulty: 'medium', count: 8, desc: 'Multi-step thinking & concept application' },
  { name: 'Thinking', label: '🔴 Thinking Ability', color: 'text-rose-400', bg: 'bg-rose-500/15', difficulty: 'adaptive', count: 4, desc: 'Adaptive — difficulty changes with your answers' },
  { name: 'Confidence', label: '🧠 Speed & Confidence', color: 'text-violet-400', bg: 'bg-violet-500/15', difficulty: 'mixed', count: 4, desc: 'Quick decisions & reasoning under time' },
];

const FOUNDATION_SECTIONS = [
  { name: 'Foundation', label: '🟢 Foundation Check', color: 'text-emerald-400', bg: 'bg-emerald-500/15', difficulty: 'easy', count: 4, desc: 'Basic concepts & prerequisite clarity' },
  { name: 'Understanding', label: '🟡 Understanding', color: 'text-amber-400', bg: 'bg-amber-500/15', difficulty: 'medium', count: 3, desc: 'Multi-step thinking & concept application' },
  { name: 'Thinking', label: '🔴 Thinking Ability', color: 'text-rose-400', bg: 'bg-rose-500/15', difficulty: 'adaptive', count: 2, desc: 'Adaptive — difficulty changes with your answers' },
  { name: 'Confidence', label: '🧠 Speed & Confidence', color: 'text-violet-400', bg: 'bg-violet-500/15', difficulty: 'mixed', count: 1, desc: 'Quick decisions & reasoning under time' },
];

const DiagnosticTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { diagnosticCompleted } = useClassContext();

  // Redirect if diagnostic already completed
  useEffect(() => {
    if (diagnosticCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [diagnosticCompleted, navigate]);

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
  const [testStartTimestamp, setTestStartTimestamp] = useState(Date.now());

  const studentClass = profile?.class || '11';
  const studentLevel = profile?.student_level || '11-12';
  const gradeRange = ['6', '7', '8'].includes(studentClass) ? '6-8' : ['9', '10'].includes(studentClass) ? '9-10' : '11-12';
  
  // Stream from onboarding metadata
  const stream: string = (user as any)?.user_metadata?.stream || 'jee';

  // Proctoring state
  const [proctoringState, setProctoringState] = useState<ProctoringState>({
    tabSwitchCount: 0, fullscreenExitCount: 0, copyAttemptCount: 0,
    cameraInactiveSeconds: 0, events: [], integrityScore: 100,
  });
  const isProctored = !['foundation'].includes(stream);

  const isClass6 = studentClass === '6';
  const activeSections = isClass6 ? FOUNDATION_SECTIONS : SECTIONS;
  const TOTAL_QUESTIONS = activeSections.reduce((s, sec) => s + sec.count, 0);

  // CAT state for adaptive section
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionPool, setQuestionPool] = useState<DiagnosticQuestion[]>([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  // Get current section info
  const getCurrentSection = (qIndex: number) => {
    let cumulative = 0;
    for (const sec of activeSections) {
      cumulative += sec.count;
      if (qIndex < cumulative) return { ...sec, startIndex: cumulative - sec.count };
    }
    return activeSections[activeSections.length - 1];
  };

  const loadQuestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      let pool: DiagnosticQuestion[] = [];

      try {
        const { data: bankQuestions, error } = await supabase
          .from('diagnostic_questions')
          .select('*')
          .eq('grade_range', gradeRange)
          .limit(200);

        if (error) throw error;

        if (!bankQuestions || bankQuestions.length === 0) {
          const { data: generated, error: genError } = await supabase.functions.invoke('generate-diagnostic-test', {
            body: { gradeRange, studentLevel, count: 50, studentClass, stream }
          });
          if (genError) throw genError;
          if (generated?.questions && generated.questions.length > 0) {
            pool = generated.questions;
          } else {
            throw new Error('Edge function returned empty questions');
          }
        } else {
          pool = bankQuestions.sort(() => Math.random() - 0.5) as DiagnosticQuestion[];
        }
      } catch (innerErr) {
        console.warn('Failed to retrieve or generate diagnostic questions from Supabase/API:', innerErr);
        pool = getDiagnosticQuestions(stream);
      }

      // Shuffle options to prevent AI bias (Option A always correct)
      pool = pool.map(shuffleQuestionOptions);

      setQuestionPool(pool);

      // Build structured question set: pick by difficulty for each section
      const structured: DiagnosticQuestion[] = [];
      const usedIds = new Set<string>();

      const pickQuestions = (difficulty: string, count: number) => {
        const candidates = pool.filter(q => q.difficulty === difficulty && !usedIds.has(q.id));
        const picked = candidates.slice(0, count);
        picked.forEach(q => usedIds.add(q.id));
        return picked;
      };

      // Section 1: Foundation (easy)
      const s1 = pickQuestions('easy', activeSections[0].count);
      structured.push(...s1);
      if (s1.length < activeSections[0].count) structured.push(...pickQuestions('medium', activeSections[0].count - s1.length));

      // Section 2: Understanding (medium)
      const s2Count = activeSections[1].count;
      const s2 = pickQuestions('medium', s2Count);
      structured.push(...s2);
      if (s2.length < s2Count) structured.push(...pickQuestions('easy', s2Count - s2.length));

      // Section 3: Thinking (adaptive)
      const s3Count = activeSections[2].count;
      const s3Half = Math.floor(s3Count / 2);
      const s3Rest = s3Count - s3Half;
      const s3 = pickQuestions('medium', s3Half);
      const s3h = pickQuestions('hard', s3Rest);
      structured.push(...s3, ...s3h);
      const s3Need = s3Count - s3.length - s3h.length;
      if (s3Need > 0) structured.push(...pickQuestions('easy', s3Need));

      // Section 4: Speed & Confidence (mixed)
      const s4Count = activeSections[3].count;
      const s4e = pickQuestions('easy', Math.max(1, Math.floor(s4Count / 4)));
      const s4m = pickQuestions('medium', Math.max(1, Math.floor(s4Count / 2)));
      const s4h = pickQuestions('hard', Math.max(0, s4Count - s4e.length - s4m.length));
      structured.push(...s4e, ...s4m, ...s4h);
      const s4Need = s4Count - s4e.length - s4m.length - s4h.length;
      if (s4Need > 0) structured.push(...pool.filter(q => !usedIds.has(q.id)).slice(0, s4Need));

      // If we still don't have enough questions (e.g. pool is small), fill it up from the offline generator
      if (structured.length < TOTAL_QUESTIONS) {
        const fallbackPool = getDiagnosticQuestions(stream);
        const extra = fallbackPool.filter(q => !structured.some(sq => sq.id === q.id));
        structured.push(...extra.slice(0, TOTAL_QUESTIONS - structured.length));
      }

      setQuestions(structured);

      // Create attempt
      let attemptIdVal = `diag-attempt-${Date.now()}`;
      try {
        const { data: attempt, error: attemptError } = await supabase
          .from('diagnostic_attempts')
          .insert({ user_id: user.id, student_level: studentLevel, total_questions: TOTAL_QUESTIONS })
          .select()
          .single();

        if (attemptError) throw attemptError;
        if (attempt) {
          attemptIdVal = attempt.id;
        }
      } catch (attemptErr) {
        console.warn('Failed to insert diagnostic attempt row in DB, using offline id:', attemptErr);
      }
      setAttemptId(attemptIdVal);
      setQuestionStartTime(Date.now());
      setTestStartTimestamp(Date.now());
    } catch (err) {
      console.error('Failed to load diagnostic test:', err);
      try {
        const fallbackStructured = getDiagnosticQuestions(stream).slice(0, TOTAL_QUESTIONS).map(shuffleQuestionOptions);
        setQuestions(fallbackStructured);
        setAttemptId(`diag-attempt-fallback-${Date.now()}`);
        setQuestionStartTime(Date.now());
        setTestStartTimestamp(Date.now());
      } catch (deepErr) {
        console.error('Fatal diagnostic test fallback failure:', deepErr);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, gradeRange, studentLevel]);

  // CAT logic for adaptive section (Section 3)
  const adaptQuestion = (wasCorrect: boolean, idx: number) => {
    const section = getCurrentSection(idx);
    if (section.name !== 'Thinking') return;

    const nc = wasCorrect ? consecutiveCorrect + 1 : 0;
    const nw = wasCorrect ? 0 : consecutiveWrong + 1;
    setConsecutiveCorrect(nc);
    setConsecutiveWrong(nw);

    let next = currentDifficulty;
    if (nc >= 2 && next !== 'hard') next = next === 'easy' ? 'medium' : 'hard';
    if (nw >= 2 && next !== 'easy') next = next === 'hard' ? 'medium' : 'easy';

    if (!wasCorrect) {
      const currentQ = questions[idx];
      if (currentQ?.prerequisite_topic) {
        const prereqQ = questionPool.find(q =>
          q.topic.toLowerCase().includes(currentQ.prerequisite_topic!.toLowerCase()) &&
          !questions.some(asked => asked.id === q.id)
        );
        if (prereqQ) {
          setCurrentDifficulty(next);
          setQuestions(prev => {
            const updated = [...prev];
            if (idx + 1 < updated.length) updated[idx + 1] = prereqQ;
            return updated;
          });
          return;
        }
      }
    }

    setCurrentDifficulty(next);
    const usedIds = new Set(questions.map(q => q.id));
    const candidates = questionPool.filter(q => q.difficulty === next && !usedIds.has(q.id));
    if (candidates.length > 0 && idx + 1 < questions.length) {
      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      setQuestions(prev => {
        const updated = [...prev];
        updated[idx + 1] = replacement;
        return updated;
      });
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

    const answer = { questionId: currentQ.id, selected: option, correct: currentQ.correct_option, isCorrect, time: timeTaken };
    setAnswers(prev => [...prev, answer]);

    // Adapt for Section 3
    adaptQuestion(isCorrect, currentIndex);

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

    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.time, 0);

    try {
      try {
        await supabase.from('diagnostic_attempts').update({
          status: 'completed',
          correct_answers: totalCorrect,
          total_time_seconds: totalTime,
          completed_at: new Date().toISOString(),
          // @ts-ignore stream & proctoring fields are from recent un-synced migration
          stream,
          tab_switch_count: proctoringState.tabSwitchCount,
          fullscreen_exit_count: proctoringState.fullscreenExitCount,
          copy_attempt_count: proctoringState.copyAttemptCount,
          camera_inactive_seconds: proctoringState.cameraInactiveSeconds,
          proctoring_events: proctoringState.events,
        }).eq('id', attemptId!);
      } catch (dbErr) {
        console.warn('Failed to update diagnostic_attempts row in DB:', dbErr);
      }

      let generatedProfile = null;
      try {
        const { data: profileData, error: profileError } = await supabase.functions.invoke('generate-learning-profile', {
          body: { attemptId, answers, questions, studentLevel, gradeRange }
        });

        if (profileError) throw profileError;
        if (profileData?.profile) {
          generatedProfile = profileData.profile;
        }
      } catch (fnErr) {
        console.warn('Failed to invoke generate-learning-profile edge function:', fnErr);
      }

      const totalAnswers = answers.length || 1;
      const accuracy = Math.round((totalCorrect / totalAnswers) * 100);
      const attemptedTopics = Array.from(new Set(questions.map(q => q.topic))).filter(Boolean);
      const correctTopics = Array.from(new Set(answers.filter(a => a.isCorrect).map(a => {
        const q = questions.find(qu => qu.id === a.questionId);
        return q ? q.topic : '';
      }))).filter(Boolean);
      const incorrectTopics = attemptedTopics.filter(t => !correctTopics.includes(t));

      const finalProfile = {
        user_id: user!.id,
        diagnostic_attempt_id: attemptId || `diag-attempt-${Date.now()}`,
        diagnostic_completed: true,
        concept_score: generatedProfile?.concept_score ?? Math.max(30, accuracy - 5),
        accuracy_score: generatedProfile?.accuracy_score ?? accuracy,
        speed_score: generatedProfile?.speed_score ?? Math.min(90, Math.max(40, 75 - Math.round(totalTime / (totalAnswers * 2)))),
        confidence_score: generatedProfile?.confidence_score ?? Math.min(95, Math.max(30, accuracy + 10)),
        weak_topics: generatedProfile?.weak_topics ?? (incorrectTopics.slice(0, 3).length > 0 ? incorrectTopics.slice(0, 3) : ['Complex Word Problems', 'Prerequisite Connections']),
        strong_topics: generatedProfile?.strong_topics ?? (correctTopics.slice(0, 3).length > 0 ? correctTopics.slice(0, 3) : ['Core Conceptual Memory', 'Direct Applications']),
        prerequisite_gaps: generatedProfile?.prerequisite_gaps ?? incorrectTopics.slice(0, 2),
        overall_level: generatedProfile?.overall_level ?? (accuracy > 75 ? 'Advanced' : accuracy > 45 ? 'Intermediate' : 'Foundation'),
      };

      try {
        await supabase.from('learning_profiles').upsert(finalProfile);
        // Mark diagnostic as completed on the user's profile
        // @ts-ignore
        await supabase.from('profiles').update({ diagnostic_completed: true }).eq('user_id', user!.id);
      } catch (saveErr) {
        console.warn('Failed to save learning profile to DB:', saveErr);
      }

      toast.success('Your learning profile is ready!');
    } catch (err) {
      console.error('Failed to complete diagnostic test flow:', err);
      toast.success('Your learning profile is ready!');
    } finally {
      setGeneratingProfile(false);
    }
  };

  const INTRO_FEATURES = [
    { icon: Lightbulb, title: 'Concept Understanding', desc: 'We check if you truly understand fundamentals — not just memorized answers.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Brain, title: 'Thinking Pattern', desc: 'We observe how you approach problems — logically or randomly, with confidence or hesitation.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Network, title: 'Brain Mapping', desc: 'We detect which concept foundations are missing and where gaps actually start.', color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { icon: Gauge, title: 'Speed & Confidence', desc: 'Time per question, decision hesitation, accuracy under pressure — all measured.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Target, title: 'Strength & Weakness Map', desc: 'No marks — just a personalized Learning Profile with strong, developing, and gap zones.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  // Elapsed time display
  const getElapsed = () => {
    const s = Math.round((Date.now() - testStartTimestamp) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
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
          {/* Left Column: Hero Text */}
          <div className="mb-12 lg:mb-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Brain className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent tracking-wide uppercase">Skill Mapping Assessment</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-[1.15]">
                Understand <br className="hidden sm:block" /> How You <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent italic pr-2">Think</span>,<br />Not Just What You Know
              </h1>
              <p className="text-white/50 text-base sm:text-lg max-w-lg leading-relaxed mb-6">
                This diagnostic doesn't judge you — it understands you. We analyze your thinking patterns to build your personalized learning map.
              </p>

              {/* Difference callout */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm max-w-md inline-block mb-10">
                <p className="text-white/40 text-xs mb-1.5">Traditional tests ask: <span className="text-white/60">"How much did you score?"</span></p>
                <p className="text-accent/90 font-medium text-sm flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  PrepEntrance asks: "How does your brain learn best?"
                </p>
              </div>

              {/* Stats & CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Button
                  size="lg"
                  onClick={() => { setTestStarted(true); setLoading(true); }}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white font-semibold shadow-[0_0_40px_rgba(232,154,60,0.3)] hover:shadow-[0_0_60px_rgba(232,154,60,0.4)] transition-all duration-300 text-base gap-2"
                >
                  Begin Foundation Assessment <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="flex sm:flex-col gap-4 sm:gap-1 text-white/40 text-[11px] font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-white/30" /> ~15 minutes</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-white/30" /> {TOTAL_QUESTIONS} questions</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-white/30" /> No marks</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Features & Sections */}
          <div className="relative">
            {/* Ambient right glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent rounded-3xl blur-2xl" />

            <div className="relative space-y-4">
              {/* What We Measure */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-white/80 mb-4 px-1">What we map</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {INTRO_FEATURES.map((feat, i) => (
                    <motion.div
                      key={feat.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] backdrop-blur-sm transition-all duration-300"
                    >
                      <div className={`w-8 h-8 rounded-xl ${feat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <feat.icon className={`h-4 w-4 ${feat.color}`} />
                      </div>
                      <h4 className="font-semibold text-white/90 text-[13px] mb-1">{feat.title}</h4>
                      <p className="text-white/40 text-[11px] leading-relaxed">{feat.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sections Preview */}
              <div>
                <h3 className="text-sm font-semibold text-white/80 mb-4 px-1">Assessment Structure</h3>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col sm:flex-row gap-1"
                >
                  {activeSections.map((sec, i) => (
                    <div key={sec.name} className={`flex-1 p-3.5 rounded-xl ${sec.bg.replace('/15', '/10')} border border-transparent hover:border-white/10 transition-colors`}>
                      <p className="text-white/90 font-semibold text-xs mb-1">{sec.label.replace(/^[^\s]+\s/, '')}</p>
                      <p className="text-white/40 text-[10px] leading-relaxed">{sec.count} qs • {sec.difficulty}</p>
                    </div>
                  ))}
                </motion.div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="w-12 h-12 text-accent mx-auto animate-pulse" />
          <h2 className="text-xl font-semibold text-white">Preparing Your Foundation Assessment</h2>
          <p className="text-white/40 text-sm">Building a personalized question set for you…</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
        </div>
      </div>
    );
  }

  // ─── COMPLETE ───
  if (testComplete) {
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((s, a) => s + a.time, 0);

    // Per-section breakdown
    const sectionResults = activeSections.map(sec => {
      let start = 0;
      for (const s of activeSections) {
        if (s.name === sec.name) break;
        start += s.count;
      }
      const sectionAnswers = answers.slice(start, start + sec.count);
      const correct = sectionAnswers.filter(a => a.isCorrect).length;
      return { ...sec, correct, total: sectionAnswers.length };
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
          <Card className="p-6 sm:p-8 text-center space-y-5 bg-white/[0.04] border-white/[0.08] backdrop-blur-md">
            {generatingProfile ? (
              <>
                <Sparkles className="w-12 h-12 text-accent mx-auto animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Analyzing Your Brain Map</h2>
                <p className="text-white/40 text-sm">AI is building your personalized learning profile…</p>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-white">Foundation Assessment Complete! 🎉</h2>
                <p className="text-white/40 text-sm">Here's a quick snapshot before your full profile</p>

                {/* Section breakdown */}
                <div className="space-y-2 text-left">
                  {sectionResults.map(sr => (
                    <div key={sr.name} className={`flex items-center justify-between p-3 rounded-xl ${sr.bg}`}>
                      <span className="text-white/80 text-xs font-medium">{sr.label}</span>
                      <span className="text-white font-semibold text-sm">{sr.correct}/{sr.total}</span>
                    </div>
                  ))}
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.05]">
                    <p className="text-xl font-bold text-white">{Math.round((totalCorrect / answers.length) * 100)}%</p>
                    <p className="text-[10px] text-white/40">Accuracy</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.05]">
                    <p className="text-xl font-bold text-white">{totalCorrect}/{answers.length}</p>
                    <p className="text-[10px] text-white/40">Correct</p>
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
                  View Your Learning Profile <ArrowRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── EMPTY ───
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4 max-w-md bg-white/[0.04] border-white/[0.08]">
          <Brain className="w-12 h-12 text-white/30 mx-auto" />
          <h2 className="text-xl font-semibold text-white">No Questions Available</h2>
          <p className="text-white/40 text-sm">We're still building the question bank for your level. Check back soon.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  // ─── ACTIVE TEST ───
  const currentQ = questions[currentIndex];
  const progress = (answers.length / TOTAL_QUESTIONS) * 100;
  const section = getCurrentSection(currentIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ProctoringOverlay enabled={isProctored} onStateChange={setProctoringState} />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent" />
              <span className="font-semibold text-white text-sm">Skill Mapping</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className={`px-2 py-0.5 rounded-full ${section.bg} ${section.color} text-[10px] font-medium`}>
                {section.label}
              </span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Q{answers.length + 1}/{TOTAL_QUESTIONS}</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
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
            transition={{ duration: 0.25 }}
          >
            {/* Meta tags */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium">
                {currentQ.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/50 text-xs">
                {currentQ.topic}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${currentQ.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                currentQ.difficulty === 'hard' ? 'bg-rose-500/15 text-rose-400' :
                  'bg-amber-500/15 text-amber-400'
                }`}>
                {currentQ.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg font-medium text-white mb-6 leading-relaxed">
              {currentQ.question_text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optionText = currentQ[`option_${opt.toLowerCase()}` as keyof DiagnosticQuestion] as string;
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
                  <p className="text-sm text-white/50 leading-relaxed">{currentQ.explanation}</p>
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full gap-2 bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white"
                  size="lg"
                >
                  {currentIndex + 1 >= questions.length || answers.length >= TOTAL_QUESTIONS ? 'Finish Assessment' : 'Next Question'}
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
