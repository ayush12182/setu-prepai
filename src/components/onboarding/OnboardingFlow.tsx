import React, { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Loader2, Copy, Share2,
  Users, GraduationCap, BookOpen, Sparkles, Rocket,
  Brain, Zap, ShieldCheck, XCircle, CheckCircle2,
  Building2, ChevronRight, Languages, Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage, LanguageMode } from '@/contexts/LanguageContext';
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
  stream: string;
  subject: string;
  total_students: number;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const STREAMS = [
  { value: 'jee',        label: 'JEE',        sub: 'Physics · Chemistry · Mathematics',      emoji: '⚡', color: 'amber'   },
  { value: 'neet',       label: 'NEET',       sub: 'Physics · Chemistry · Biology',    emoji: '🧬', color: 'green'   },
  { value: 'cuet',       label: 'CUET',       sub: 'Languages · NCERT Domain Subjects · General Test', emoji: '🎯', color: 'blue'    },
];

const SENIOR_CLASSES = [
  { value: '11', label: 'Class 11', tag: 'Foundation Prep' },
  { value: '12', label: 'Class 12', tag: 'Board + Entrance Prep' },
  { value: 'dropper', label: 'Dropper', tag: 'Full Revision Focus' },
];

const TEACHER_SUBJECTS = [
  { value: 'physics',   label: 'Physics',        emoji: '⚡' },
  { value: 'chemistry', label: 'Chemistry',      emoji: '🧪' },
  { value: 'maths',     label: 'Mathematics',    emoji: '📐' },
  { value: 'biology',   label: 'Biology',        emoji: '🔬' },
  { value: 'english',   label: 'English',        emoji: '📝' },
  { value: 'commerce',  label: 'Commerce',       emoji: '📊' },
];

const TEACHER_GOALS = [
  { value: 'test_analysis',  label: 'Assign & analyse tests',      emoji: '📋' },
  { value: 'performance',    label: 'Track student performance',   emoji: '📈' },
  { value: 'materials',      label: 'Share study materials',       emoji: '📚' },
  { value: 'batches',        label: 'Manage multiple batches',     emoji: '👥' },
  { value: 'all',            label: 'All of the above',            emoji: '🚀' },
];

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

const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <div className={`flex flex-col items-center gap-2 ${size === 'lg' ? '' : 'flex-row gap-2.5'}`}>
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg",
      size === 'lg' ? "w-16 h-16 shadow-amber-500/10" : "w-8 h-8 shadow-amber-500/5"
    )}>
      <span className={cn("text-slate-950 font-black", size === 'lg' ? "text-2xl" : "text-sm")}>P</span>
    </div>
    <span
      className={cn('text-white font-black tracking-widest uppercase', size === 'lg' ? 'text-2xl' : 'text-base')}
      style={{ fontFamily: 'Sora, Inter, sans-serif', letterSpacing: '0.2em' }}
    >
      PrepEntrance
    </span>
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
  <div className={cn('bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/40 p-6 sm:p-8', className)}>
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
      'w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-colors',
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

const OnboardingFlow: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { setExamMode } = useExamMode();
  const { setLanguage } = useLanguage();

  // Track & step (1 to 7 for students)
  const [track, setTrack] = useState<Track | null>(null);
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  // Shared loading
  const [saving, setSaving] = useState(false);

  // Student rebrand-onboarding state
  const [stream, setStream] = useState(''); // Screen 2: Select Exam ('jee' | 'neet' | 'cuet')
  const [studentClass, setStudentClass] = useState(''); // Screen 3: Select Class ('11' | '12' | 'dropper')
  const [targetYear, setTargetYear] = useState(''); // Screen 4: Target Year ('2027' | '2028')
  const [prefLanguage, setPrefLanguage] = useState<LanguageMode>('english'); // Screen 5: Language Preference
  const [joinCode, setJoinCode] = useState(''); // Join via batch code trigger
  const [isCoaching, setIsCoaching] = useState(false);
  const [codeState, setCodeState] = useState<CodeState>('idle');
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);

  // Screen 6: Diagnostic Assessment State
  const [currentDiagIdx, setCurrentDiagIdx] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState<Record<number, number>>({});

  // Dynamic diagnostic questions based on chosen exam stream
  const diagQuestions = React.useMemo(() => {
    if (stream === 'neet') {
      return [
        {
          id: 1,
          subject: 'physics',
          question: "A car travels at 20 m/s for 10 seconds. What is its displacement under constant speed?",
          options: ["100 meters", "200 meters", "50 meters", "400 meters"],
          correct: 1
        },
        {
          id: 2,
          subject: 'chemistry',
          question: "Which of the following processes represents a chemical change?",
          options: ["Melting of ice", "Rusting of iron nail", "Boiling of water", "Dissolving sugar in water"],
          correct: 1
        },
        {
          id: 3,
          subject: 'biology',
          question: "Which cell organelle is famously known as the powerhouse of the cell?",
          options: ["Mitochondria", "Nucleus", "Ribosome", "Lysosome"],
          correct: 0
        }
      ];
    } else if (stream === 'cuet') {
      return [
        {
          id: 1,
          subject: 'maths',
          question: "If 2x + 5 = 15, what is the value of x?",
          options: ["3", "5", "4", "10"],
          correct: 1
        },
        {
          id: 2,
          subject: 'chemistry',
          question: "Find the synonym of the word 'Abundant'.",
          options: ["Scarce", "Plentiful", "Rare", "Empty"],
          correct: 1
        },
        {
          id: 3,
          subject: 'physics',
          question: "A body stays at rest unless acted upon by a external force. Which law is this?",
          options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Kepler's Law"],
          correct: 0
        }
      ];
    } else { // default to jee
      return [
        {
          id: 1,
          subject: 'physics',
          question: "A car travels at 20 m/s for 10 seconds. What is its displacement under constant speed?",
          options: ["100 meters", "200 meters", "50 meters", "400 meters"],
          correct: 1
        },
        {
          id: 2,
          subject: 'chemistry',
          question: "Which of the following processes represents a chemical change?",
          options: ["Melting of ice", "Rusting of iron nail", "Boiling of water", "Dissolving sugar in water"],
          correct: 1
        },
        {
          id: 3,
          subject: 'maths',
          question: "If A = {1, 2} and B = {3, 4}, what is the union of sets A and B?",
          options: ["{1, 2, 3, 4}", "{1, 2}", "{3, 4}", "Empty Set {}"],
          correct: 0
        }
      ];
    }
  }, [stream]);

  // Teacher state
  const [institutionName, setInstitutionName] = useState('');
  const [teacherExam, setTeacherExam] = useState('');
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [teacherGoals, setTeacherGoals] = useState<string[]>([]);
  const [batchName, setBatchName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const go = (newStep: number, direction = 1) => {
    setDir(direction);
    setStep(newStep);
  };

  // ─── Join code validation ─────────────────────────────────────────────────

  const handleCodeChange = async (val: string) => {
    const clean = val.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    setJoinCode(clean);
    
    if (clean.length < 6) {
      setCodeState('idle');
      return;
    }
    
    setCodeState('checking');
    try {
      const { data, error } = await supabase.functions.invoke('validate-join-code', {
        body: { join_code: clean },
      });

      if (!error && data && data.valid) {
        setCodeState('valid');
        setBatchInfo(data);
        // Auto-assign stream/class based on batch code
        const detectedStream = data.stream || 'jee';
        setStream(detectedStream);
        setStudentClass(data.student_class || '11');
        setTargetYear(data.target_year ? String(data.target_year) : '2028');
        toast.success("Valid Batch Code!");
      } else {
        setCodeState('invalid');
      }
    } catch {
      setCodeState('invalid');
    }
  };

  // ─── Student complete profile upsert ─────────────────────────────────────────

  const completeStudent = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // 1. Identify levels based on diagnostic MCQ scores
      const pAns = diagAnswers[0];
      const cAns = diagAnswers[1];
      const mAns = diagAnswers[2];

      const pLvl = pAns === diagQuestions[0].correct ? 'Advanced' : 'Beginner';
      const cLvl = cAns === diagQuestions[1].correct ? 'Advanced' : 'Beginner';
      const mLvl = mAns === diagQuestions[2].correct ? 'Advanced' : 'Beginner';

      const overallLvl = (pLvl === 'Advanced' && cLvl === 'Advanced') ? 'Advanced' : 'Intermediate';

      let examGoal = 'JEE';
      let dbExam = 'JEE';
      if (stream === 'neet') {
        examGoal = 'NEET';
        dbExam = 'NEET';
      } else if (stream === 'cuet') {
        examGoal = 'CUET';
        dbExam = 'CUET';
      }

      const cls = studentClass || '11';
      const targetYearInt = parseInt(targetYear || '2028');

      // Sync language preference in state/context
      setLanguage(prefLanguage);
      localStorage.setItem('preferredLanguage', prefLanguage);

      // Query database matching cohort_id
      const { data: cohortData } = await supabase
        .from('cohorts')
        .select('id')
        .eq('exam', dbExam)
        .eq('class', cls === 'dropper' ? 'dropper' : cls)
        .eq('target_year', targetYearInt)
        .maybeSingle();

      const cohortId = cohortData?.id || null;

      // Update basic profiles
      await updateProfile({
        target_exam: examGoal,
        class: cls,
        student_level: overallLvl,
        user_type: 'student',
      });

      // Upsert into student_profiles table (including newly migrated subject levels)
      await supabase.from('student_profiles').upsert({
        student_id: user.id,
        name: user.user_metadata?.full_name || null,
        target_exam: examGoal,
        class: cls,
        target_year: targetYearInt,
        current_level: overallLvl,
        cohort_id: cohortId,
        physics_level: pLvl,
        chemistry_level: cLvl,
        maths_level: stream === 'neet' ? 'Intermediate' : mLvl,
        biology_level: stream === 'neet' ? mLvl : 'Intermediate',
        last_active: new Date().toISOString(),
      });

      // Join batch if applicable
      if (isCoaching && batchInfo) {
        await supabase
          .from('student_batch_map' as any)
          .insert({ student_id: user.id, batch_id: batchInfo.batch_id });
      }

      await refreshProfile();
      toast.success("Welcome aboard! Preparing classroom...");
      
      // Navigate to student hub
      setTimeout(() => {
        window.location.href = '/student-hub';
      }, 1500);

    } catch (e: any) {
      toast.error(e.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  // ─── Teacher — create batch ────────────────────────────────────────────────

  const createTeacherBatch = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { data, error } = await supabase
        .from('batches' as any)
        .insert({
          name: batchName || 'New Batch',
          mentor_id: user.id,
          join_code: code,
          target_exam: teacherExam || 'JEE',
          description: `PrepEntrance Class Batch for ${teacherExam}`,
        })
        .select('id')
        .single();

      if (error) throw error;

      setGeneratedCode(code);
      await updateProfile({ user_type: 'teacher' });
      await refreshProfile();
      go(4); // navigate to display code
    } catch (e: any) {
      toast.error(e.message || 'Could not create batch.');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── STEP RENDER LOGIC ──────────────────────────────────────────────────────

  const renderStep = () => {
    // ════════════════ SCREEN 1: WELCOME SCREEN ════════════════
    if (step === 1 && !track) {
      return (
        <div className="space-y-6 text-center">
          <Logo size="lg" />
          <div className="space-y-3 pt-4">
            <p className="text-amber-400 text-xs font-black uppercase tracking-[0.25em]">Personalized Learning Ecosystem</p>
            <h1 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Personalized Preparation for JEE, NEET & CUET
            </h1>
            <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
              Step into an isolated digital classroom designed strictly around your target exam, class, and milestones.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <PrimaryBtn onClick={() => { setTrack('student'); go(2); }}>
              Start Setup <ArrowRight className="w-5 h-5" />
            </PrimaryBtn>
            
            <button 
              onClick={() => { setTrack('teacher'); go(1); }}
              className="text-white/40 hover:text-white/70 text-xs font-semibold tracking-wider uppercase py-2 transition-colors"
            >
              Are you a Teacher? Create Batch ➔
            </button>
          </div>
        </div>
      );
    }

    // ════════════════ SCREEN 2: SELECT EXAM ════════════════
    if (step === 2 && track === 'student') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Step 2 of 7</p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Which exam are you preparing for?
            </h1>
            <p className="text-white/40 text-sm">Your learning scope will be locked to this exam.</p>
          </div>

          <div className="space-y-2.5">
            {STREAMS.map(s => {
              const selected = stream === s.value;
              return (
                <motion.button
                  key={s.value}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => setStream(s.value)}
                  className={cn(
                    'w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200',
                    selected
                      ? 'border-amber-400/40 bg-amber-400/[0.06] ring-1 ring-amber-400/10'
                      : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.01]'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">{s.emoji}</span>
                    <div>
                      <p className="text-white font-extrabold text-sm sm:text-base">{s.label}</p>
                      <p className="text-white/30 text-xs mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-amber-400 border-amber-400' : 'border-white/20'
                  )}>
                    {selected && <Check className="w-3 text-slate-950 stroke-[3]" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="pt-2">
            {/* Batch Code Entry Bridge */}
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs text-white/40 font-medium">Joined a coaching batch?</span>
              <button 
                onClick={() => { setIsCoaching(true); go(99); }}
                className="text-xs text-amber-400 font-extrabold hover:underline"
              >
                Enter Batch Code ➔
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => { setTrack(null); go(1, -1); }}>
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </GhostBtn>
            <PrimaryBtn disabled={!stream} onClick={() => go(3)}>
              Continue <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ════════════════ BATCH CODE BRIDGE SCREEN ════════════════
    if (step === 99 && track === 'student') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enter your Batch Code
            </h1>
            <p className="text-white/40 text-sm">Enter the 6-character code provided by your coaching center.</p>
          </div>

          <div className={cn(
            'rounded-2xl border p-5 space-y-4 transition-all duration-300',
            codeState === 'valid'    ? 'border-emerald-500/40 bg-emerald-500/[0.04] shadow-[0_0_24px_rgba(16,185,129,0.15)]' :
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
                className="w-full h-16 bg-white/[0.04] border border-white/[0.1] rounded-xl text-center text-2xl text-white font-mono tracking-[0.5em] placeholder:text-white/10 focus:outline-none focus:border-amber-400/40 transition-all pr-14"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {codeState === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-amber-400" />}
                {codeState === 'valid'    && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {codeState === 'invalid'  && <XCircle className="w-5 h-5 text-red-400" />}
              </div>
            </div>

            {codeState === 'valid' && batchInfo && (
              <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">Batch Found</p>
                  <p className="text-white font-bold truncate text-sm">{batchInfo.batch_name}</p>
                  <p className="text-white/40 text-[11px]">Mentor: {batchInfo.teacher_name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => { setIsCoaching(false); go(2, -1); }}>
              Cancel
            </GhostBtn>
            <PrimaryBtn disabled={codeState !== 'valid'} onClick={() => go(7)}>
              Continue to Cohort <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ════════════════ SCREEN 3: SELECT CLASS ════════════════
    if (step === 3 && track === 'student') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Step 3 of 7</p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Which class are you studying in?
            </h1>
            <p className="text-white/40 text-sm">We construct your isolated academic tracker based on class.</p>
          </div>

          <div className="space-y-2">
            {SENIOR_CLASSES.map(c => {
              const selected = studentClass === c.value;
              return (
                <motion.button
                  key={c.value}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => {
                    setStudentClass(c.value);
                    // Screen 4 auto-suggestion logic based on class:
                    if (c.value === '11') setTargetYear('2028');
                    else setTargetYear('2027');
                  }}
                  className={cn(
                    'w-full p-4.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200',
                    selected 
                      ? 'border-amber-400/50 bg-amber-400/[0.08] text-amber-400' 
                      : 'border-white/[0.06] text-white/70 hover:border-white/20 hover:bg-white/[0.01]'
                  )}
                >
                  <div>
                    <p className="font-extrabold text-sm sm:text-base">{c.label}</p>
                    <p className="text-[11px] opacity-50 mt-0.5">{c.tag}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-amber-400 border-amber-400' : 'border-white/20'
                  )}>
                    {selected && <Check className="w-3 text-slate-950 stroke-[3]" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => go(2, -1)}>
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </GhostBtn>
            <PrimaryBtn disabled={!studentClass} onClick={() => go(4)}>
              Continue <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ════════════════ SCREEN 4: TARGET YEAR ════════════════
    if (step === 4 && track === 'student') {
      const suggestedYear = studentClass === '11' ? '2028' : '2027';
      const optionalYears = ['2027', '2028', '2029'].filter(y => y !== suggestedYear);
      const displayYears = [suggestedYear, ...optionalYears];

      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Step 4 of 7</p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Select your Target Year
            </h1>
            <p className="text-white/40 text-sm">
              Suggested: <span className="text-amber-400 font-bold">{suggestedYear}</span> (based on your Class {studentClass})
            </p>
          </div>

          <div className="space-y-2.5">
            {displayYears.map((y, idx) => {
              const selected = targetYear === y;
              const isSuggested = idx === 0;
              return (
                <motion.button
                  key={y}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => setTargetYear(y)}
                  className={cn(
                    'w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200',
                    selected 
                      ? 'border-amber-400/50 bg-amber-400/[0.08] text-amber-400' 
                      : 'border-white/[0.06] text-white/70 hover:border-white/20 hover:bg-white/[0.01]'
                  )}
                >
                  <div>
                    <p className="font-extrabold text-sm sm:text-base">{y} Aspirant</p>
                    <p className="text-[11px] opacity-50 mt-0.5">{isSuggested ? 'Standard Suggested Target Year' : 'Alternate target year path'}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isSuggested && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black uppercase rounded px-2 py-0.5 tracking-wider">
                        Suggested
                      </span>
                    )}
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                      selected ? 'bg-amber-400 border-amber-400' : 'border-white/20'
                    )}>
                      {selected && <Check className="w-3 text-slate-950 stroke-[3]" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => go(3, -1)}>
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </GhostBtn>
            <PrimaryBtn disabled={!targetYear} onClick={() => go(5)}>
              Continue <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ════════════════ SCREEN 5: LANGUAGE PREFERENCE ════════════════
    if (step === 5 && track === 'student') {
      const languages: { key: LanguageMode; label: string; sub: string }[] = [
        { key: 'english', label: 'English', sub: 'Entire theory & notes in pure English' },
        { key: 'hinglish', label: 'Hinglish', sub: 'Concepts explained in interactive Hindi + English' },
        { key: 'hindi', label: 'Hindi', sub: 'हिंदी माध्यम - complete Hindi curriculum' }
      ];

      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Step 5 of 7</p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Select your Language Preference
            </h1>
            <p className="text-white/40 text-sm">We translate all lectures, notes, and study material to this language.</p>
          </div>

          <div className="space-y-2.5">
            {languages.map(lang => {
              const selected = prefLanguage === lang.key;
              return (
                <motion.button
                  key={lang.key}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => setPrefLanguage(lang.key)}
                  className={cn(
                    'w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200',
                    selected 
                      ? 'border-amber-400/50 bg-amber-400/[0.08] text-amber-400' 
                      : 'border-white/[0.06] text-white/70 hover:border-white/20 hover:bg-white/[0.01]'
                  )}
                >
                  <div>
                    <p className="font-extrabold text-sm sm:text-base">{lang.label}</p>
                    <p className="text-[11px] opacity-55 mt-0.5">{lang.sub}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-amber-400 border-amber-400' : 'border-white/20'
                  )}>
                    {selected && <Check className="w-3 text-slate-950 stroke-[3]" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => go(4, -1)}>
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </GhostBtn>
            <PrimaryBtn onClick={() => go(6)}>
              Continue <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ════════════════ SCREEN 6: DIAGNOSTIC ASSESSMENT ════════════════
    if (step === 6 && track === 'student') {
      const activeQ = diagQuestions[currentDiagIdx];
      const selectedOption = diagAnswers[currentDiagIdx];

      const handleAnswerSelect = (optionIdx: number) => {
        setDiagAnswers(prev => ({ ...prev, [currentDiagIdx]: optionIdx }));
      };

      const handleNextQuestion = () => {
        if (currentDiagIdx < diagQuestions.length - 1) {
          setCurrentDiagIdx(prev => prev + 1);
        } else {
          // Finished Diagnostic test! Go to Cohort assignment
          go(7);
        }
      };

      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Step 6 of 7: Diagnostic</p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Adaptive Concept Benchmark
            </h1>
            <p className="text-white/40 text-sm">
              Answering these brief conceptual benchmarks sets your starting profile and predicts your initial AIR range.
            </p>
          </div>

          {/* Question card */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 font-black uppercase px-2 py-0.5 rounded tracking-widest">
                {activeQ.subject.toUpperCase()} Evaluation
              </span>
              <span className="text-xs text-white/35 font-bold">
                Question {currentDiagIdx + 1} of {diagQuestions.length}
              </span>
            </div>

            <p className="text-white text-sm sm:text-base font-semibold leading-relaxed pt-2">
              {activeQ.question}
            </p>

            <div className="space-y-2 pt-3">
              {activeQ.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerSelect(oIdx)}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-200 text-sm',
                      isSelected
                        ? 'border-amber-400 bg-amber-400/5 text-amber-400 font-bold'
                        : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] text-white/70'
                    )}
                  >
                    <span>{opt}</span>
                    <div className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                      isSelected ? 'bg-amber-400 border-amber-400' : 'border-white/10'
                    )}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => {
              if (currentDiagIdx > 0) setCurrentDiagIdx(prev => prev - 1);
              else go(5, -1);
            }}>
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </GhostBtn>
            <PrimaryBtn 
              disabled={selectedOption === undefined}
              onClick={handleNextQuestion}
            >
              {currentDiagIdx === diagQuestions.length - 1 ? 'Analyze Performance' : 'Next Question'} <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ════════════════ SCREEN 7: COHORT ASSIGNMENT ════════════════
    if (step === 7 && track === 'student') {
      const examName = stream.toUpperCase();
      const className = studentClass === 'dropper' ? 'Dropper' : `Class ${studentClass}`;
      const cohortName = `${examName} ${targetYear} ${className}`;

      return (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>

          <div className="space-y-3">
            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> System Configured successfully
            </p>
            <h1 className="text-white text-3xl font-black tracking-tight" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              🎉 Welcome to {cohortName} Cohort
            </h1>
            <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
              Your isolated classroom and study paths are ready. Standard syllabus limits and tests are synced to your target year.
            </p>
          </div>

          {/* Cohort Stats summary */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 text-left space-y-4 max-w-sm mx-auto">
            <h3 className="text-xs font-bold text-white/55 uppercase tracking-wider">Cohort Enrollment Details</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span className="text-white/40">Class & Exam:</span>
                <span className="font-bold text-white">{examName} | {className}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span className="text-white/40">Target Year:</span>
                <span className="font-bold text-white">{targetYear} Goal</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span className="text-white/40">Language:</span>
                <span className="font-bold text-white uppercase">{prefLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Diagnostic Benchmark:</span>
                <span className="font-bold text-amber-400">Intermediate Classroom Assigned</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <PrimaryBtn loading={saving} onClick={completeStudent}>
              {saving ? 'Opening Classroom Door...' : <><Rocket className="w-5 h-5" /> Launch My Classroom</>}
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ── TEACHER STEP 1: Set up portal ──────────────────────────────────────────
    if (step === 1 && track === 'teacher') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Set up your portal
            </h1>
            <p className="text-white/40 text-sm">Tell us about your organization or coaching institute</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Organization/Coaching Name</label>
              <input
                autoFocus
                type="text"
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                placeholder="Allen, Physics Wallah, Resonance etc."
                className="w-full h-13 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white text-sm focus:outline-none focus:border-amber-400/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Exam Category</label>
              <div className="grid grid-cols-3 gap-2">
                {['JEE', 'NEET', 'CUET'].map(e => {
                  const selected = teacherExam === e;
                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setTeacherExam(e)}
                      className={cn(
                        'h-12 rounded-xl border text-sm font-bold transition-all',
                        selected ? 'border-amber-400 bg-amber-400/5 text-amber-400' : 'border-white/[0.08] hover:border-white/20 text-white/70'
                      )}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => { setTrack(null); go(1, -1); }}>
              Back
            </GhostBtn>
            <PrimaryBtn disabled={!institutionName || !teacherExam} onClick={() => go(2)}>
              Continue <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ── TEACHER STEP 2: Choose Subjects ─────────────────────────────────────────
    if (step === 2 && track === 'teacher') {
      const toggleSubject = (val: string) => {
        setTeacherSubjects(prev =>
          prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]
        );
      };

      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Select Subjects
            </h1>
            <p className="text-white/40 text-sm">Which subjects do you teach in your batch?</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TEACHER_SUBJECTS.map(s => {
              const selected = teacherSubjects.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleSubject(s.value)}
                  className={cn(
                    'p-4 rounded-xl border text-left flex items-center justify-between transition-all',
                    selected ? 'border-amber-400 bg-amber-400/5 text-amber-400 font-bold' : 'border-white/[0.08] text-white/70 hover:border-white/20'
                  )}
                >
                  <span className="text-sm">{s.emoji} {s.label}</span>
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                    selected ? 'bg-amber-400 border-amber-400' : 'border-white/20'
                  )}>
                    {selected && <Check className="w-3 text-slate-950 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => go(1, -1)}>
              Back
            </GhostBtn>
            <PrimaryBtn disabled={teacherSubjects.length === 0} onClick={() => go(3)}>
              Continue <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ── TEACHER STEP 3: Create Batch ────────────────────────────────────────────
    if (step === 3 && track === 'teacher') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Create your Classroom Batch
            </h1>
            <p className="text-white/40 text-sm">Students will use this batch to join your isolated classroom.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Classroom Batch Name</label>
            <input
              autoFocus
              type="text"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              placeholder="e.g. JEE 2026 Achiever Batch"
              className="w-full h-13 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white text-sm focus:outline-none focus:border-amber-400/40"
            />
          </div>

          <div className="flex gap-3">
            <GhostBtn onClick={() => go(2, -1)}>
              Back
            </GhostBtn>
            <PrimaryBtn loading={saving} disabled={!batchName} onClick={createTeacherBatch}>
              {saving ? 'Creating Batch...' : 'Generate Batch Code'}
            </PrimaryBtn>
          </div>
        </div>
      );
    }

    // ── TEACHER STEP 4: Display Code & Finish ──────────────────────────────────
    if (step === 4 && track === 'teacher') {
      return (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-white text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              Classroom Batch is Live!
            </h1>
            <p className="text-white/40 text-sm">Share this unique batch code with your students so they can join.</p>
          </div>

          {/* Batch Code Display Box */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 space-y-4 max-w-xs mx-auto">
            <div className="text-3xl font-black text-amber-400 font-mono tracking-widest uppercase">
              {generatedCode}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" onClick={copyCode} className="h-9 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white flex items-center gap-2">
                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </div>

          <PrimaryBtn onClick={() => { window.location.href = '/b2b'; }}>
            Launch Teacher Portal <ArrowRight className="w-4 h-4" />
          </PrimaryBtn>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#06080D] relative flex items-center justify-center p-4">
      <GlowBg />
      
      <div className="w-full max-w-[480px] relative z-10 space-y-6 py-10">
        <div className="flex items-center justify-between px-2">
          {/* Only display dots for active steps */}
          {track === 'student' && step > 1 && step <= 7 && (
            <StepDots total={6} current={step - 2} />
          )}
          {track === 'teacher' && step <= 4 && (
            <StepDots total={4} current={step - 1} />
          )}
        </div>

        <Card>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`${track}-${step}`}
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
      </div>
    </div>
  );
};

export default OnboardingFlow;
