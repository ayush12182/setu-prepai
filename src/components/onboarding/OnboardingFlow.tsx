import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Loader2,
  Rocket, Brain, Zap, GraduationCap, Award, Sparkles,
  BookOpen, Users, Star, ChevronRight, Trophy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;
type StreamType = 'jee' | 'neet' | 'cuet' | '';

// ─── Batch Mapping ───────────────────────────────────────────────────────────
const BATCH_MAP: Record<string, Record<string, { id: string; name: string }>> = {
  jee: {
    '11':      { id: 'aarambh_2028',      name: 'Aarambh 2028' },
    '12':      { id: 'aarohan_2027',      name: 'Aarohan 2027' },
    dropper:   { id: 'shikhar_2027',      name: 'Shikhar 2027' },
  },
  neet: {
    '11':      { id: 'aarambh_neet_2028', name: 'Aarambh NEET 2028' },
    '12':      { id: 'aarohan_neet_2027', name: 'Aarohan NEET 2027' },
    dropper:   { id: 'shikhar_neet_2027', name: 'Shikhar NEET 2027' },
  },
  cuet: {
    '11':      { id: 'aarambh_cuet_2028', name: 'Aarambh CUET 2028' },
    '12':      { id: 'aarohan_cuet_2027', name: 'Aarohan CUET 2027' },
  },
};

const getBatch = (stream: string, cls: string) =>
  BATCH_MAP[stream]?.[cls] ?? { id: 'aarambh_2028', name: 'Aarambh 2028' };

// ─── Exam display helpers ─────────────────────────────────────────────────────
const EXAM_LABELS: Record<string, string> = {
  jee: 'JEE Main & Advanced',
  neet: 'NEET',
  cuet: 'CUET',
};

const CLASS_LABELS: Record<string, string> = {
  '11': 'Class 11',
  '12': 'Class 12',
  dropper: 'Dropper / Repeater',
};

// ─── Glow Background ─────────────────────────────────────────────────────────
const GlowBg: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden bg-gradient-to-tr from-slate-50 via-white to-blue-50/20">
    <div className="absolute top-[-20%] left-1/4 w-[750px] h-[750px] rounded-full bg-blue-500/[0.03] blur-[150px]" />
    <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.03] blur-[130px]" />
    <div className="absolute inset-0 opacity-[0.4]" style={{
      backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }} />
  </div>
);

// ─── Slide variants ───────────────────────────────────────────────────────────
const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } }),
};

interface OnboardingFlowProps {
  initialUserType?: 'student' | 'teacher';
  skipToJoinCode?: boolean;
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ initialUserType, skipToJoinCode, onComplete }) => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { setExamMode } = useExamMode();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [dir, setDir] = useState(1);

  const [stream, setStream] = useState<StreamType>('');
  const [studentClass, setStudentClass] = useState('');

  // Loading synthesis state
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);

  // Welcome screen state (after batch assignment)
  const [assignedBatch, setAssignedBatch] = useState<{ id: string; name: string } | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);

  const go = (newStep: OnboardingStep, direction = 1) => {
    setDir(direction);
    setStep(newStep);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompiling || showWelcomeScreen) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (step === 1) go(2);
        else if (step === 2 && stream) go(3);
        else if (step === 3 && studentClass) handleStartSynthesis();
      }

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const index = parseInt(e.key) - 1;
        if (step === 2) {
          const streams: StreamType[] = ['jee', 'neet'];
          if (index < streams.length) setStream(streams[index]);
        } else if (step === 3) {
          const classes = ['11', '12', 'dropper'];
          setStudentClass(classes[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, stream, studentClass, isCompiling, showWelcomeScreen]);

  // ─── Main synthesis handler ───────────────────────────────────────────────
  const handleStartSynthesis = async () => {
    if (!user) return;
    setIsCompiling(true);
    go(4); // loading screen

    const batch = getBatch(stream, studentClass);
    setAssignedBatch(batch);

    // Visual phase animations
    const phaseDelays = [900, 900, 900, 700];
    for (let i = 0; i < phaseDelays.length; i++) {
      await new Promise((r) => setTimeout(r, phaseDelays[i]));
      setLoadingPhase((prev) => prev + 1);
    }

    try {
      let examGoal = 'JEE Main';
      let dbExam = 'JEE';
      if (stream === 'neet') { examGoal = 'NEET'; dbExam = 'NEET'; }
      else if (stream === 'cuet') { examGoal = 'CUET'; dbExam = 'CUET'; }

      const cls = studentClass || '11';
      const targetYearInt = cls === '11' ? 2028 : 2027;

      // Set global exam mode
      if (stream === 'jee') setExamMode('jee');
      else if (stream === 'neet') setExamMode('neet');
      else if (stream === 'cuet') setExamMode('cuet');

      // Persist to cohorts table
      const { data: cohortData } = await supabase
        .from('cohorts')
        .select('id')
        .eq('exam', dbExam)
        .eq('class', cls === 'dropper' ? 'dropper' : cls)
        .eq('target_year', targetYearInt)
        .maybeSingle();

      const cohortId = cohortData?.id || null;

      // Update profile
      await updateProfile({
        target_exam: examGoal,
        class: cls,
        student_level: 'Intermediate',
        user_type: 'student',
        // Store batch assignment in metadata if field exists
      });

      // Upsert student_profiles (try with extended batch columns, fallback to base)
      const baseProfile = {
        student_id: user.id,
        name: user.user_metadata?.full_name || null,
        target_exam: examGoal,
        class: cls,
        target_year: targetYearInt,
        current_level: 'Intermediate',
        cohort_id: cohortId,
        physics_level: 'Intermediate',
        chemistry_level: 'Intermediate',
        maths_level: 'Intermediate',
        biology_level: 'Intermediate',
        last_active: new Date().toISOString(),
      };
      try {
        await supabase.from('student_profiles').upsert({
          ...baseProfile,
          batch_id: batch.id,
          batch_name: batch.name,
          exam_type: dbExam,
          academic_stage: cls,
        });
      } catch {
        // Fallback: upsert without extended batch columns if schema not yet migrated
        await supabase.from('student_profiles').upsert(baseProfile);
      }
      // Store batch assignment in localStorage for immediate UI use
      localStorage.setItem('batch_id', batch.id);
      localStorage.setItem('batch_name', batch.name);
      localStorage.setItem('exam_type', dbExam);
      localStorage.setItem('academic_stage', cls);

      await refreshProfile();

      // Seed first task
      try {
        await supabase.from('assigned_tasks').insert({
          student_id: user.id,
          teacher_id: user.id,
          topic: examGoal === 'NEET' ? 'Cell Biology' : 'Kinematics',
          subtopic: examGoal === 'NEET' ? 'Cell Cycle and Cell Division' : 'Motion in 1D',
          status: 'pending',
          initial_accuracy: 50.0,
        });
      } catch {
        console.warn('First task creation skipped (non-fatal)');
      }

      // Show the batch welcome screen
      setShowWelcomeScreen(true);

    } catch (e: any) {
      toast.error(e.message || 'Something went wrong during setup.');
      setIsCompiling(false);
      go(3, -1);
    }
  };

  // ─── BATCH WELCOME SCREEN ────────────────────────────────────────────────
  if (showWelcomeScreen && assignedBatch) {
    const examLabel = EXAM_LABELS[stream] ?? stream.toUpperCase();
    const classLabel = CLASS_LABELS[studentClass] ?? studentClass;

    const examColors: Record<string, { accent: string; glow: string; badge: string; badgeLabel: string; icon: string }> = {
      jee:  { accent: '#60a5fa', glow: 'rgba(59,130,246,0.15)', badge: 'bg-blue-500/20 border-blue-400/50 text-white', badgeLabel: 'text-blue-200', icon: '🚀' },
      neet: { accent: '#34d399', glow: 'rgba(16,185,129,0.15)', badge: 'bg-emerald-500/20 border-emerald-400/50 text-white', badgeLabel: 'text-emerald-200', icon: '🧬' },
      cuet: { accent: '#a78bfa', glow: 'rgba(139,92,246,0.15)', badge: 'bg-violet-500/20 border-violet-400/50 text-white', badgeLabel: 'text-violet-200', icon: '🎓' },
    };
    const colors = examColors[stream] ?? examColors.jee;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ background: colors.glow }} />
          <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'rgba(16,185,129,0.05)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md space-y-4"
        >
          {/* ── Header card ── */}
          <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-8 border border-white/[0.08] shadow-2xl text-center space-y-5">
            {/* Animated success ring */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
              className="w-24 h-24 rounded-full border-2 flex items-center justify-center mx-auto text-5xl"
              style={{ borderColor: colors.accent, background: colors.glow }}
            >
              {colors.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
                Batch Assigned ✓
              </p>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">
                You're all set,<br />
                <span style={{ color: colors.accent }}>{user?.user_metadata?.full_name?.split(' ')[0] ?? 'Scholar'}!</span>
              </h1>
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                Your personalized PrepEntrance dashboard is ready with content tailored to your exam and stage.
              </p>
            </motion.div>
          </div>

          {/* ── Batch detail card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-6 border border-white/[0.08] shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Your PrepEntrance Batch</span>
            </div>

            {/* Batch name */}
            <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: `${colors.accent}33`, background: colors.glow }}>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Batch</p>
                <p className="text-white font-black text-xl leading-tight">{assignedBatch.name}</p>
              </div>
              <div className="text-3xl">🏅</div>
            </div>

            {/* Chips */}
            <div className="grid grid-cols-2 gap-3">
              <div className={cn('rounded-2xl border px-4 py-3 text-center shadow-inner', colors.badge)}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", colors.badgeLabel)}>Exam</p>
                <p className="font-black text-sm">{examLabel}</p>
              </div>
              <div className={cn('rounded-2xl border px-4 py-3 text-center shadow-inner', colors.badge)}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", colors.badgeLabel)}>Stage</p>
                <p className="font-black text-sm">{classLabel}</p>
              </div>
            </div>

            {/* What you'll get */}
            <div className="space-y-2 pt-1">
              {[
                { icon: BookOpen, text: 'Batch-specific syllabus & study plan' },
                { icon: Zap, text: 'Targeted mock tests & adaptive practice' },
                { icon: Brain, text: 'AI Mentor tuned to your exam & stage' },
                { icon: Users, text: 'PDFs, notes & resources for your batch' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.07 }}
                  className="flex items-center gap-3 text-white/60 text-sm"
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.06] border border-white/[0.08]">
                    <item.icon className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── CTA ── */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={async () => {
              await refreshProfile();
              window.location.href = '/student-hub';
            }}
            className="w-full h-16 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-white"
            style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`, boxShadow: `0 8px 32px ${colors.glow}` }}
          >
            <Sparkles className="w-5 h-5" />
            Enter Dashboard
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <p className="text-center text-white/20 text-xs font-medium">
            Your batch assignment is permanent and can be updated from profile settings.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Step rendering ───────────────────────────────────────────────────────
  const renderStep = () => {
    // ════════════════ STEP 1: WELCOME ════════════════
    if (step === 1) {
      return (
        <div className="space-y-7 text-center py-6">
          <div className="brand-logo-container rounded-3xl w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse-soft">
            <img
              src="/prepentrance-logo.png"
              alt="PrepEntrance Logo"
              className="brand-logo-img"
            />
          </div>

          <div className="space-y-3">
            <span className="text-blue-600 text-xs font-black uppercase tracking-[0.25em] block leading-none">
              Welcome to PrepEntrance
            </span>
            <h1 className="text-slate-900 text-3xl sm:text-[36px] font-black leading-tight tracking-tight font-display">
              Let's Personalize <br />Your Preparation.
            </h1>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-sans font-medium">
              Tell us your target exam and academic stage — we'll assign your dedicated batch instantly.
            </p>
          </div>

          {/* Step preview pills */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {['Select Exam', 'Select Stage', 'Get Assigned'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-900 bg-slate-50 border border-slate-200 shadow-sm rounded-full px-3 py-1">
                  {label}
                </span>
                {i < 2 && <ChevronRight className="w-3 h-3 text-slate-400" />}
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-4">
            <button
              onClick={() => go(2)}
              className="w-full h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <span className="text-slate-400 text-[10px] font-sans font-bold block">
              Press <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 font-mono font-bold">Enter</span> to begin
            </span>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 2: SELECT EXAM ════════════════
    if (step === 2) {
      const streams = [
        { key: 'jee' as StreamType, title: 'JEE Main & Advanced', desc: 'Physics · Chemistry · Mathematics', icon: Rocket, keybind: '1' },
        { key: 'neet' as StreamType, title: 'NEET', desc: 'Physics · Chemistry · Biology', icon: Zap, keybind: '2' },
      ];

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-slate-900 text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              Which exam are you targeting?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              Your batch, syllabus and mock tests will be built around this exam.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {streams.map((s) => {
              const isSelected = stream === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setStream(s.key)}
                  className={cn(
                    'w-full p-4.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-205 cursor-pointer select-none group',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-slate-100/30'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors shadow-xs',
                      isSelected ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200/60 text-slate-400 group-hover:text-slate-600'
                    )}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn('font-black text-base sm:text-lg leading-snug', isSelected ? 'text-blue-900' : 'text-slate-900')}>{s.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 font-sans font-semibold">{s.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                      Key {s.keybind}
                    </span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200',
                      isSelected ? 'bg-blue-600 border-blue-600 scale-105' : 'border-slate-300'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-4 shrink-0">
            <button
              onClick={() => go(1, -1)}
              className="w-1/3 h-14 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-sm font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={!stream}
              onClick={() => go(3)}
              className="flex-1 h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 3: SELECT ACADEMIC STAGE ════════════════
    if (step === 3) {
      // CUET doesn't have dropper
      const showDropper = stream !== 'cuet';
      const classes = [
        { key: '11', label: 'Class 11', desc: 'Two-year foundation preparation', keybind: '1' },
        { key: '12', label: 'Class 12', desc: 'Board + final exam targeted prep', keybind: '2' },
        ...(showDropper ? [{ key: 'dropper', label: 'Dropper / Repeater', desc: 'Full revision & intensive practice', keybind: '3' }] : []),
      ];

      // Preview batch assignment
      const previewBatch = studentClass ? getBatch(stream, studentClass) : null;

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-slate-900 text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              What is your academic stage?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              We'll assign your batch automatically based on your selection.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {classes.map((c) => {
              const isSelected = studentClass === c.key;
              const preview = getBatch(stream, c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => setStudentClass(c.key)}
                  className={cn(
                    'w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-205 cursor-pointer select-none group',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-slate-100/30'
                  )}
                >
                  <div>
                    <p className={cn('font-extrabold text-sm sm:text-base leading-snug', isSelected ? 'text-blue-900' : 'text-slate-800')}>{c.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5 font-sans font-semibold">{c.desc}</p>
                    <p className={cn('text-xs mt-1.5 font-bold', isSelected ? 'text-blue-600' : 'text-slate-300')}>
                      → {preview.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                      Key {c.keybind}
                    </span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200',
                      isSelected ? 'bg-blue-600 border-blue-600 scale-105' : 'border-slate-300'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live batch preview */}
          {previewBatch && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100"
            >
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Your Batch</p>
                <p className="text-blue-900 font-extrabold text-sm">{previewBatch.name}</p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3 pt-2 shrink-0">
            <button
              onClick={() => go(2, -1)}
              className="w-1/3 h-14 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-sm font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={!studentClass}
              onClick={handleStartSynthesis}
              className="flex-1 h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10"
            >
              Assign My Batch <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 4: SYNTHESIS LOADING ════════════════
    if (step === 4) {
      const batchName = assignedBatch?.name ?? 'Your Batch';
      const phases = [
        { icon: Brain, label: 'Verifying your exam profile...' },
        { icon: Award, label: `Assigning batch: ${batchName}...` },
        { icon: Rocket, label: 'Building your personalized dashboard...' },
        { icon: Star, label: 'All set! Opening your classroom...' },
      ];

      return (
        <div className="space-y-8 py-8 text-center animate-pulse-soft">
          <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto shadow-sm relative z-10">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>

          <div className="space-y-3">
            <h2 className="text-slate-900 text-2xl font-black font-display tracking-tight leading-snug">
              Setting Up Your Batch
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium max-w-xs mx-auto leading-relaxed">
              Configuring your personalized PrepEntrance workspace. This takes just a moment.
            </p>
          </div>

          <div className="space-y-3 max-w-sm mx-auto text-left bg-slate-50 border border-slate-100 rounded-3xl p-5 relative z-10">
            {phases.map((p, idx) => {
              const isActive = loadingPhase === idx;
              const isDone = loadingPhase > idx;
              const Icon = p.icon;

              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300',
                    isActive ? 'bg-blue-50 border-blue-100 shadow-xs' : 'opacity-40 border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                    isDone ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      (isActive ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200/60 text-slate-400')
                  )}>
                    {isDone ? <Check className="w-4 h-4 stroke-[3.5]" /> : <Icon className={cn('w-4 h-4', isActive && 'animate-pulse')} />}
                  </div>
                  <span className={cn(
                    'text-[12.5px] font-sans font-bold leading-none tracking-normal',
                    isDone ? 'text-slate-400 line-through' : (isActive ? 'text-blue-900 font-extrabold' : 'text-slate-550')
                  )}>
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <GlowBg />

      <div className="w-full max-w-[480px] relative z-10 space-y-6 py-8">

        {/* Progress bar: 3 real steps */}
        {step < 4 && (
          <div className="w-full h-1.5 bg-slate-100 border border-slate-200/60 rounded-full overflow-hidden select-none shrink-0">
            <motion.div
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        )}

        {/* Step counter */}
        {step < 4 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400 font-bold">
              Step {step} of 3
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn('w-1.5 h-1.5 rounded-full transition-all', step >= s ? 'bg-blue-600' : 'bg-slate-200')} />
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/80 p-7 sm:p-9 relative">

          {/* Close button */}
          {step < 4 && (
            <button
              onClick={() => navigate('/')}
              className="absolute right-6 top-6 p-1.5 rounded-full border border-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer z-20"
              aria-label="Close onboarding"
            >
              ✕
            </button>
          )}

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default OnboardingFlow;
