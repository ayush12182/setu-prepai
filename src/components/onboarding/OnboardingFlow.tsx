import React, { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Loader2, Copy, Share2,
  Users, GraduationCap, BookOpen, Sparkles, Rocket,
  Brain, Zap, ShieldCheck, XCircle, CheckCircle2,
  Building2, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type Track = 'student' | 'teacher';
type CodeState = 'idle' | 'checking' | 'valid' | 'invalid';

interface BatchInfo {
  batch_id: string;
  batch_name: string;
  teacher_name: string;
  exam_type: string;
  total_students: number;
}

interface Props {
  initialUserType?: Track;
  skipToJoinCode?: boolean;
  onComplete?: () => void;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const STREAMS = [
  { value: 'jee',        label: 'JEE Main & Advanced', sub: 'Physics · Chemistry · Maths',      emoji: '🚀', color: 'amber'   },
  { value: 'neet',       label: 'NEET',                sub: 'Physics · Chemistry · Biology',    emoji: '🔬', color: 'green'   },
  { value: 'foundation', label: 'SETU Foundation',     sub: 'Maths · Science · Mental Ability', emoji: '🧠', color: 'teal'    },
  { value: 'cuet',       label: 'CUET',                sub: 'General Test · Language · Domains', emoji: '🏛️', color: 'violet'  },
  { value: 'commerce',   label: 'Commerce / CA',       sub: 'Accounts · Eco · Business Studies', emoji: '📊', color: 'blue'    },
];

const FOUNDATION_CLASSES = [
  { value: '6', label: 'Class 6', tag: 'Foundation' },
  { value: '7', label: 'Class 7', tag: 'Foundation' },
  { value: '8', label: 'Class 8', tag: 'Foundation' },
  { value: '9', label: 'Class 9', tag: 'Board Prep' },
  { value: '10', label: 'Class 10', tag: 'Board Prep' },
];
const SENIOR_CLASSES = [
  { value: '11', label: 'Class 11', tag: 'Just Starting' },
  { value: '12', label: 'Class 12', tag: 'Board + Entrance' },
  { value: '13', label: 'Dropper', tag: 'Full Focus Year' },
];

const EXAM_MAP: Record<string, string> = {
  jee: 'JEE Main', neet: 'NEET', foundation: 'Foundation', cuet: 'CUET', commerce: 'CA Foundation',
};

// ─── Slide animation variants ─────────────────────────────────────────────────

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 340, damping: 30 } },
  exit:  (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0, transition: { duration: 0.18 } }),
};

// ─── Micro-components ─────────────────────────────────────────────────────────

const GlowBg: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full bg-amber-500/[0.06] blur-[160px]" />
    <div className="absolute -bottom-20 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.05] blur-[140px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-500/[0.03] blur-[100px]" />
  </div>
);

const Logo: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
      <BookOpen className="w-4.5 h-4.5 text-white" />
    </div>
    <span className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>SETU</span>
  </div>
);

const StepDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        animate={{ width: i === current ? 24 : 8, opacity: i <= current ? 1 : 0.25 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn('h-1.5 rounded-full', i <= current ? 'bg-amber-400' : 'bg-white/20')}
      />
    ))}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/30 p-7 sm:p-8', className)}>
    {children}
  </div>
);

const PrimaryBtn: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  className?: string;
}> = ({ onClick, disabled, loading, children, type = 'button', className }) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    whileHover={!disabled && !loading ? { y: -2, boxShadow: '0 8px 32px rgba(245,158,11,0.35)' } : {}}
    whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
    className={cn(
      'w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors',
      'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
      'shadow-lg shadow-amber-500/25',
      className,
    )}
  >
    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
  </motion.button>
);

const GhostBtn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full h-11 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all text-sm font-medium"
  >
    {children}
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const OnboardingFlow: React.FC<Props> = ({ initialUserType, skipToJoinCode, onComplete }) => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { setExamMode } = useExamMode();

  // Track & step
  const [track, setTrack] = useState<Track | null>(initialUserType ?? null);
  const [step, setStep] = useState(skipToJoinCode ? 1 : 0);
  const [dir, setDir] = useState(1);

  // Shared loading
  const [saving, setSaving] = useState(false);

  // Student state
  const [joinCode, setJoinCode] = useState('');
  const [codeState, setCodeState] = useState<CodeState>('idle');
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [stream, setStream] = useState('');
  const [studentClass, setStudentClass] = useState('');

  // Teacher state
  const [institutionName, setInstitutionName] = useState('');
  const [teacherExam, setTeacherExam] = useState('');
  const [batchName, setBatchName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const codeDebounce = useRef<NodeJS.Timeout>();

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const go = (newStep: number, direction = 1) => {
    setDir(direction);
    setStep(newStep);
  };

  const totalStudentSteps = skipToJoinCode ? 2 : 4; // role → code → goal → done
  const totalTeacherSteps = 4; // role → identity → batch → code

  // ─── Join code validation (with direct-DB fallback) ──────────────────────────

  const validateCode = useCallback(async (raw: string) => {
    const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length < 6) { setCodeState('idle'); return; }
    setCodeState('checking');
    setBatchInfo(null);

    try {
      // 1. Try edge function
      const { data, error } = await supabase.functions.invoke('validate-join-code', {
        body: { join_code: code },
      });

      if (!error && data && !data.error) {
        setCodeState('valid');
        setBatchInfo(data);
        return;
      }

      // 2. Edge function failed (bad deploy, column error, etc.) — query DB directly
      const { data: batch, error: batchErr } = await supabase
        .from('batches' as any)
        .select('id, name, teacher_id, target_exam')
        .eq('join_code', code)
        .maybeSingle();

      if (batchErr || !batch) { setCodeState('invalid'); return; }

      const b = batch as any;

      // Resolve teacher display name
      const { data: tp } = await supabase
        .from('profiles')
        .select('full_name, institution_name')
        .eq('user_id', b.teacher_id)
        .maybeSingle();

      // Student count
      const { count } = await supabase
        .from('student_batch_map' as any)
        .select('*', { count: 'exact', head: true })
        .eq('batch_id', b.id);

      setCodeState('valid');
      setBatchInfo({
        batch_id: b.id,
        batch_name: b.name,
        teacher_name: (tp as any)?.institution_name || (tp as any)?.full_name || 'Your Teacher',
        exam_type: b.target_exam || 'JEE',
        total_students: count ?? 0,
      });
    } catch {
      setCodeState('invalid');
    }
  }, []);

  const handleCodeChange = (raw: string) => {
    const val = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setJoinCode(val);
    setCodeState('idle');
    setBatchInfo(null);
    clearTimeout(codeDebounce.current);
    if (val.length >= 6) {
      codeDebounce.current = setTimeout(() => validateCode(val), 500);
    }
  };

  // ─── Student completion ────────────────────────────────────────────────────

  const completeStudent = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const examGoal = EXAM_MAP[stream] ?? 'JEE Main';
      const cls = studentClass || '11';
      let level = '11-12';
      if (stream === 'foundation') {
        const n = parseInt(cls);
        level = n <= 8 ? '6-8' : '9-10';
      }

      if (stream === 'jee') setExamMode('jee');
      else if (stream === 'neet') setExamMode('neet');
      else if (stream === 'cuet') setExamMode('cuet');
      else setExamMode('jee');

      await updateProfile({
        target_exam: examGoal,
        class: cls,
        student_level: level,
        user_type: 'student',
      });

      // Join batch (try edge function, fall back to direct insert)
      if (batchInfo) {
        const { data: joinData, error: joinErr } = await supabase.functions.invoke('validate-join-code', {
          body: { join_code: joinCode.toUpperCase(), student_id: user.id },
        });

        if (joinErr || joinData?.error) {
          // Fallback: insert directly into student_batch_map
          const { error: mapErr } = await supabase
            .from('student_batch_map' as any)
            .upsert(
              { student_id: user.id, batch_id: batchInfo.batch_id },
              { onConflict: 'student_id,batch_id', ignoreDuplicates: true } as any
            );
          if (mapErr) {
            // Non-fatal — the batch was already validated, proceed anyway
            console.warn('[OnboardingFlow] student_batch_map insert fallback failed:', mapErr.message);
          }
          // Update profile teacher linkage
          await supabase
            .from('profiles')
            .update({ teacher_id: (batchInfo as any).teacher_id ?? null } as any)
            .eq('user_id', user.id);
        }
      }

      await refreshProfile();
      onComplete?.();
      navigate('/student-hub');
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Teacher — create batch ────────────────────────────────────────────────

  const createTeacherBatch = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // generate unique code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];

      const payload = {
        name: batchName.trim() || `${institutionName || 'My'} Batch`,
        target_exam: teacherExam || 'JEE_MAINS',
        teacher_id: user.id,
        join_code: code,
        description: `Batch for ${teacherExam || 'JEE'}`,
      };

      const { data, error } = await supabase.rpc('create_batch_v2' as any, {
        p_name: payload.name,
        p_teacher_id: payload.teacher_id,
        p_join_code: payload.join_code,
        p_target_exam: payload.target_exam,
        p_description: payload.description,
        p_subject: teacherExam || 'JEE',
      });

      if (error) {
        // Fallback direct insert
        const { data: direct, error: directErr } = await supabase
          .from('batches' as any)
          .insert(payload)
          .select('join_code')
          .single();
        if (directErr) throw directErr;
        setGeneratedCode((direct as any).join_code || code);
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        setGeneratedCode(row?.join_code || code);
      }

      go(3);
    } catch (e: any) {
      toast.error(e.message || 'Batch creation failed.');
    } finally {
      setSaving(false);
    }
  };

  const completeTeacher = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const examGoal = EXAM_MAP[teacherExam] ?? 'JEE Main';
      const displayName = institutionName.trim() || null;
      await updateProfile({
        user_type: 'teacher',
        target_exam: examGoal,
        institution_name: displayName,
        full_name: displayName || undefined,
      } as any);
      await refreshProfile();
      onComplete?.();
      navigate('/b2b');
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied!');
  };

  // ─── Render steps ─────────────────────────────────────────────────────────

  const currentSteps = track === 'teacher' ? totalTeacherSteps : totalStudentSteps;
  const displayStep = skipToJoinCode ? step - 1 : step; // so dots start at 0 for skip case

  const renderStep = () => {
    // ── STEP 0: Choose Role ──────────────────────────────────────────────────
    if (step === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">Welcome to SETU</p>
            <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              How are you joining?
            </h1>
            <p className="text-white/40 text-sm">Choose your role to get started</p>
          </div>

          <div className="space-y-3 mt-2">
            {/* Student */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setTrack('student'); go(1); }}
              className="w-full p-5 rounded-2xl border border-white/[0.08] hover:border-amber-400/30 hover:bg-amber-400/[0.03] transition-all text-left flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 group-hover:bg-amber-400/20 transition-colors">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-base" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>I'm a Student</p>
                <p className="text-white/40 text-sm mt-0.5">I have a teacher's batch code</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
            </motion.button>

            {/* Teacher */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setTrack('teacher'); go(1); }}
              className="w-full p-5 rounded-2xl border border-white/[0.08] hover:border-violet-400/30 hover:bg-violet-400/[0.03] transition-all text-left flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center shrink-0 group-hover:bg-violet-400/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-base" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>I'm a Teacher</p>
                <p className="text-white/40 text-sm mt-0.5">I'll create a batch for my students</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
            </motion.button>
          </div>
        </div>
      );
    }

    // ── STUDENT STEP 1: Enter code ────────────────────────────────────────────
    if (step === 1 && track === 'student') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.15em]">Required</span>
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Enter your class code
            </h1>
            <p className="text-white/40 text-sm">Get this 6-character code from your teacher</p>
          </div>

          {/* Code input */}
          <div className={cn(
            'rounded-2xl border p-5 space-y-4 transition-all duration-300',
            codeState === 'valid'    ? 'border-emerald-500/40 bg-emerald-500/[0.04] shadow-[0_0_24px_rgba(16,185,129,0.1)]' :
            codeState === 'invalid'  ? 'border-red-500/30 bg-red-500/[0.03]' :
            codeState === 'checking' ? 'border-amber-400/30 bg-amber-400/[0.03]' :
            'border-white/[0.08]'
          )}>
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={joinCode}
                maxLength={8}
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="K8ZX2W"
                className="w-full h-16 bg-white/[0.04] border border-white/[0.1] rounded-xl text-center text-2xl text-white font-mono tracking-[0.5em] placeholder:text-white/15 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all pr-14"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {codeState === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-amber-400" />}
                {codeState === 'valid'    && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}><CheckCircle2 className="w-5 h-5 text-emerald-400" /></motion.div>}
                {codeState === 'invalid'  && <XCircle className="w-5 h-5 text-red-400" />}
              </div>
            </div>

            {codeState === 'invalid' && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" /> Invalid code. Check with your teacher.
              </motion.p>
            )}

            {/* Batch preview on valid */}
            {codeState === 'valid' && batchInfo && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">Batch Found</p>
                  <p className="text-white font-semibold truncate">{batchInfo.batch_name}</p>
                  <p className="text-white/40 text-xs">by {batchInfo.teacher_name} · {batchInfo.total_students} students</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </motion.div>
            )}
          </div>

          <p className="text-center text-xs text-white/25">
            Don't have a code? Ask your teacher to generate one from their dashboard.
          </p>

          <PrimaryBtn
            disabled={codeState !== 'valid'}
            onClick={() => go(2)}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </PrimaryBtn>

          {!skipToJoinCode && (
            <GhostBtn onClick={() => go(0, -1)}>
              <ArrowLeft className="w-4 h-4 inline mr-1.5" />Back
            </GhostBtn>
          )}
        </div>
      );
    }

    // ── STUDENT STEP 2: Goal selection (stream + class) ───────────────────────
    if (step === 2 && track === 'student') {
      const classes = stream === 'foundation' ? FOUNDATION_CLASSES : SENIOR_CLASSES;
      return (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Set your goal
            </h1>
            <p className="text-white/40 text-sm">We'll personalise everything for you</p>
          </div>

          {/* Stream */}
          <div className="space-y-2">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Exam / Program</p>
            <div className="space-y-2">
              {STREAMS.map(s => {
                const selected = stream === s.value;
                return (
                  <motion.button
                    key={s.value}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setStream(s.value); setStudentClass(''); }}
                    className={cn(
                      'w-full px-4 py-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200',
                      selected
                        ? 'border-amber-400/40 bg-amber-400/[0.06] ring-1 ring-amber-400/20'
                        : 'border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.02]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-7 shrink-0">{s.emoji}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{s.label}</p>
                        <p className="text-white/35 text-xs">{s.sub}</p>
                      </div>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                      selected ? 'bg-amber-400 border-amber-400' : 'border-white/20'
                    )}>
                      {selected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Class — shown only when stream selected */}
          <AnimatePresence>
            {stream && (
              <motion.div
                key="class-grid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2 overflow-hidden"
              >
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Your class</p>
                <div className="grid grid-cols-3 gap-2">
                  {classes.map(c => {
                    const sel = studentClass === c.value;
                    return (
                      <button
                        key={c.value}
                        onClick={() => setStudentClass(c.value)}
                        className={cn(
                          'py-3 rounded-xl border text-center transition-all duration-200',
                          sel ? 'border-amber-400/50 bg-amber-400/[0.08] text-amber-400' : 'border-white/[0.07] text-white/60 hover:border-white/20 hover:text-white'
                        )}
                      >
                        <p className="font-bold text-sm">{c.label}</p>
                        <p className="text-[10px] mt-0.5 opacity-60">{c.tag}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <PrimaryBtn
            disabled={!stream || !studentClass}
            loading={saving}
            onClick={completeStudent}
          >
            {saving ? 'Setting up...' : <><Sparkles className="w-5 h-5" /> Launch my learning</>}
          </PrimaryBtn>

          <GhostBtn onClick={() => go(1, -1)}>
            <ArrowLeft className="w-4 h-4 inline mr-1.5" />Back
          </GhostBtn>
        </div>
      );
    }

    // ── TEACHER STEP 1: Identity ────────────────────────────────────────────
    if (step === 1 && track === 'teacher') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Set up your portal
            </h1>
            <p className="text-white/40 text-sm">Tell us about your institute</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider">Institute / Coaching name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  autoFocus
                  type="text"
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                  placeholder="e.g. Momentum Academy"
                  className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all pl-11 pr-4 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider">Primary exam you teach</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STREAMS.map(s => {
                  const sel = teacherExam === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setTeacherExam(s.value)}
                      className={cn(
                        'py-3 px-3 rounded-xl border text-left transition-all duration-200',
                        sel ? 'border-violet-400/50 bg-violet-400/[0.08] ring-1 ring-violet-400/20' : 'border-white/[0.07] hover:border-white/[0.14]'
                      )}
                    >
                      <span className="text-base block mb-0.5">{s.emoji}</span>
                      <p className={cn('text-xs font-semibold truncate', sel ? 'text-violet-300' : 'text-white/70')}>{s.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <PrimaryBtn
            disabled={!teacherExam}
            onClick={() => go(2)}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </PrimaryBtn>

          <GhostBtn onClick={() => go(0, -1)}>
            <ArrowLeft className="w-4 h-4 inline mr-1.5" />Back
          </GhostBtn>
        </div>
      );
    }

    // ── TEACHER STEP 2: Create batch ──────────────────────────────────────────
    if (step === 2 && track === 'teacher') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Create your first batch
            </h1>
            <p className="text-white/40 text-sm">Students will join using a unique code</p>
          </div>

          <div className="space-y-2">
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider">Batch name</label>
            <input
              autoFocus
              type="text"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              placeholder={`e.g. ${EXAM_MAP[teacherExam] ?? 'JEE'} 2026 Batch A`}
              className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/20 transition-all px-4 text-sm"
            />
          </div>

          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <p className="text-white/50 text-xs leading-relaxed">
              A unique join code will be generated for this batch. Share it with your students so they can join.
            </p>
          </div>

          <PrimaryBtn
            loading={saving}
            onClick={createTeacherBatch}
            className="from-violet-400 to-violet-500 shadow-violet-500/25"
          >
            Generate Join Code <Rocket className="w-5 h-5" />
          </PrimaryBtn>

          <GhostBtn onClick={() => go(1, -1)}>
            <ArrowLeft className="w-4 h-4 inline mr-1.5" />Back
          </GhostBtn>
        </div>
      );
    }

    // ── TEACHER STEP 3: Show join code ─────────────────────────────────────────
    if (step === 3 && track === 'teacher') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Batch Created!</p>
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Your join code
            </h1>
            <p className="text-white/40 text-sm">Share this with your students</p>
          </div>

          {/* Code display */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.1] p-6 text-center space-y-4">
            <div className="font-mono text-4xl font-black tracking-[0.4em] text-amber-400 select-all">
              {generatedCode}
            </div>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={copyCode}
                className="flex-1 h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  try {
                    await navigator.share({ title: 'Join my SETU batch', text: `Use code ${generatedCode} to join my batch on SETU.` });
                  } catch {
                    copyCode();
                  }
                }}
                className="flex-1 h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Share2 className="w-4 h-4" /> Share
              </motion.button>
            </div>
          </div>

          <div className="bg-violet-500/[0.07] rounded-2xl border border-violet-500/15 p-4 space-y-2">
            {[
              'Students enter this code in the SETU app to join',
              'You can find it anytime in your Batches section',
              'Create more batches from your dashboard',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-white/50">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                {tip}
              </div>
            ))}
          </div>

          <PrimaryBtn
            loading={saving}
            onClick={completeTeacher}
            className="from-violet-400 to-violet-500 shadow-violet-500/25"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </PrimaryBtn>
        </div>
      );
    }

    return null;
  };

  // ─── Layout ────────────────────────────────────────────────────────────────

  const isTeacher = track === 'teacher';

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col relative overflow-hidden">
      <GlowBg />

      <header className="relative z-10 p-5 sm:p-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Logo />
          {step > 0 && (
            <StepDots
              total={isTeacher ? totalTeacherSteps : totalStudentSteps}
              current={Math.min(step - 1, (isTeacher ? totalTeacherSteps : totalStudentSteps) - 1)}
            />
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={`${track ?? 'role'}-${step}`}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </Card>

          {/* Security note */}
          <div className="mt-5 flex items-center justify-center gap-2 text-white/10">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[10px] tracking-wide">Secured with Supabase Auth</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingFlow;
