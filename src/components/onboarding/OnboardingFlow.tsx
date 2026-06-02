import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Check, Loader2, 
  Sparkles, Rocket, Brain, Zap, GraduationCap, Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage, LanguageMode } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;
type StreamType = 'jee' | 'neet' | 'cuet' | '';

// Custom Glow Background for Immersive Linear-style depth
const GlowBg: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#06080D]">
    <div className="absolute top-[-20%] left-1/4 w-[750px] h-[750px] rounded-full bg-[#FF6B00]/[0.05] blur-[150px]" />
    <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/[0.04] blur-[130px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#FF6B00]/[0.02] blur-[110px]" />
    {/* Clean subtle dot grid overlay */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `radial-gradient(circle, #FF6B00 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }} />
  </div>
);

// Slide animation variants
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
  const { setLanguage } = useLanguage();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [dir, setDir] = useState(1);
  
  // Selections State
  const [stream, setStream] = useState<StreamType>('');
  const [studentClass, setStudentClass] = useState('');
  const [prefLanguage, setPrefLanguage] = useState<LanguageMode>('english');

  // Loading Synthesis State
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);

  const go = (newStep: OnboardingStep, direction = 1) => {
    setDir(direction);
    setStep(newStep);
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we are in the compiling loading screen, ignore keypresses
      if (isCompiling) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        // Continue actions
        if (step === 1) go(2);
        else if (step === 2 && stream) go(3);
        else if (step === 3 && studentClass) go(4);
        else if (step === 4) handleStartSynthesis();
      }

      // Handle card selections via number keys (1, 2, 3)
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const index = parseInt(e.key) - 1;
        if (step === 2) {
          const streams: StreamType[] = ['jee', 'neet', 'cuet'];
          setStream(streams[index]);
        } else if (step === 3) {
          const classes = ['11', '12', 'dropper'];
          setStudentClass(classes[index]);
        } else if (step === 4) {
          const langs: LanguageMode[] = ['english', 'hinglish', 'hindi'];
          setPrefLanguage(langs[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, stream, studentClass, prefLanguage, isCompiling]);

  // AI Classroom Synthesis phases
  const handleStartSynthesis = async () => {
    if (!user) return;
    setIsCompiling(true);
    go(5);

    // Cycle through visual database synthesis phases
    const phaseDelays = [1000, 1000, 1000, 800];
    for (let i = 0; i < phaseDelays.length; i++) {
      await new Promise((r) => setTimeout(r, phaseDelays[i]));
      setLoadingPhase((prev) => prev + 1);
    }

    // Upsert into Supabase profile tables
    try {
      let examGoal = 'JEE Main';
      let dbExam = 'JEE';
      if (stream === 'neet') {
        examGoal = 'NEET';
        dbExam = 'NEET';
      } else if (stream === 'cuet') {
        examGoal = 'CUET';
        dbExam = 'CUET';
      }

      const cls = studentClass || '11';
      const targetYearInt = cls === '11' ? 2028 : (cls === '12' ? 2027 : 2027);

      // Set exam mode and language
      if (stream === 'jee') setExamMode('jee');
      else if (stream === 'neet') setExamMode('neet');
      else if (stream === 'cuet') setExamMode('cuet');

      setLanguage(prefLanguage);
      localStorage.setItem('preferredLanguage', prefLanguage);

      const { data: cohortData } = await supabase
        .from('cohorts')
        .select('id')
        .eq('exam', dbExam)
        .eq('class', cls === 'dropper' ? 'dropper' : cls)
        .eq('target_year', targetYearInt)
        .maybeSingle();

      const cohortId = cohortData?.id || null;

      // Update auth profile
      await updateProfile({
        target_exam: examGoal,
        class: cls,
        student_level: 'Intermediate',
        user_type: 'student',
      });

      // Synchronize in student_profiles
      await supabase.from('student_profiles').upsert({
        student_id: user.id,
        name: user.user_metadata?.full_name || null,
        target_exam: examGoal,
        class: cls,
        target_year: targetYearInt,
        current_level: 'Intermediate',
        cohort_id: cohortId,
        physics_level: 'Intermediate',
        chemistry_level: 'Intermediate',
        maths_level: stream === 'neet' ? 'Intermediate' : 'Intermediate',
        biology_level: stream === 'neet' ? 'Intermediate' : 'Intermediate',
        last_active: new Date().toISOString(),
      });

      await refreshProfile();
      
      // Inject Mock Task for first-time B2C students
      try {
        await supabase.from('assigned_tasks').insert({
          student_id: user.id,
          teacher_id: user.id,
          topic: examGoal === 'NEET' ? 'Cell Biology' : 'Kinematics',
          subtopic: examGoal === 'NEET' ? 'Cell Cycle and Cell Division' : 'Motion in 1D',
          status: 'pending',
          initial_accuracy: 50.0,
        });
      } catch (e) {
        console.warn('First task creation skipped');
      }

      toast.success("Workspace synced! Opening classroom door...");
      
      // Load student hub
      setTimeout(() => {
        window.location.href = '/student-hub';
      }, 500);

    } catch (e: any) {
      toast.error(e.message || 'Something went wrong during setup.');
      setIsCompiling(false);
      go(4, -1);
    }
  };

  const renderStep = () => {
    // ════════════════ STEP 1: WELCOME & BEGIN ════════════════
    if (step === 1) {
      return (
        <div className="space-y-7 text-center py-6">
          <div className="w-20 h-20 rounded-3xl bg-[#FF6B00]/10 border border-[#FF6B00]/25 flex items-center justify-center mx-auto mb-6 shadow-md shadow-[#FF6B00]/5 animate-pulse-soft">
            <Sparkles className="w-10 h-10 text-[#FF6B00]" />
          </div>
          
          <div className="space-y-3">
            <span className="text-[#FF6B00] text-xs font-black uppercase tracking-[0.25em] block leading-none">
              Welcome to PrepEntrance
            </span>
            <h1 className="text-white text-3xl sm:text-[38px] font-black leading-tight tracking-tight font-display">
              Let's Personalize <br />Your Preparation.
            </h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-sans font-medium">
              We construct your isolated academic tracker based strictly on your target exam, class, and study preferences.
            </p>
          </div>

          <div className="pt-6 space-y-4">
            <button
              onClick={() => go(2)}
              className="w-full h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white shadow-lg shadow-[#FF6B00]/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <span className="text-slate-500 text-[10px] font-sans font-bold block">
              Press <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono font-bold">Enter</span> to begin
            </span>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 2: SELECT EXAM ════════════════
    if (step === 2) {
      const streams = [
        { key: 'jee' as StreamType, title: 'JEE Main & Advanced', desc: 'Physics · Chemistry · Mathematics', icon: Rocket, keybind: '1' },
        { key: 'neet' as StreamType, title: 'NEET Core', desc: 'Physics · Chemistry · Biology', icon: Zap, keybind: '2' },
        { key: 'cuet' as StreamType, title: 'CUET Domain Prep', desc: 'Domain Subjects · General Test', icon: GraduationCap, keybind: '3' },
      ];

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-white text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              What is your target exam?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              Your syllabus timelines and mock tests will adapt directly to this goal.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {streams.map((s) => {
              const isSelected = stream === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setStream(s.key)}
                  className={cn(
                    'w-full p-4.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer select-none group',
                    isSelected
                      ? 'border-[#FF6B00]/40 bg-[#FF6B00]/[0.06] shadow-[0_8px_24px_rgba(255,107,0,0.04)]'
                      : 'border-white/[0.05] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors shadow-sm',
                      isSelected ? 'bg-[#FF6B00]/10 border-[#FF6B00]/25 text-[#FF6B00]' : 'bg-white/[0.03] border-white/[0.06] text-slate-400 group-hover:text-slate-300'
                    )}>
                      <s.icon className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-white font-extrabold text-sm sm:text-base leading-snug">{s.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 font-sans font-semibold">{s.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                      Key {s.keybind}
                    </span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200',
                      isSelected ? 'bg-[#FF6B00] border-[#FF6B00] scale-105' : 'border-slate-700/60'
                    )}>
                      {isSelected && <Check className="w-3 text-white stroke-[4]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-4 shrink-0">
            <button
              onClick={() => go(1, -1)}
              className="w-1/3 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04] text-sm font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={!stream}
              onClick={() => go(3)}
              className="flex-1 h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-[#FF6B00]/10"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 3: SELECT CLASS ════════════════
    if (step === 3) {
      const classes = [
        { key: '11', label: 'Class 11', desc: 'Foundation Core Prep', keybind: '1' },
        { key: '12', label: 'Class 12', desc: 'Board + Targeted Mock Prep', keybind: '2' },
        { key: 'dropper', label: 'Dropper / Repeater', desc: 'Full Spaced Revision', keybind: '3' },
      ];

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-white text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              What is your current class?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              We compile your mock tests and study milestones based on class.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {classes.map((c) => {
              const isSelected = studentClass === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setStudentClass(c.key)}
                  className={cn(
                    'w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer select-none group',
                    isSelected
                      ? 'border-[#FF6B00]/40 bg-[#FF6B00]/[0.06] shadow-[0_8px_24px_rgba(255,107,0,0.04)]'
                      : 'border-white/[0.05] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                  )}
                >
                  <div>
                    <p className="text-white font-extrabold text-sm sm:text-base leading-snug">{c.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5 font-sans font-semibold">{c.desc}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                      Key {c.keybind}
                    </span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200',
                      isSelected ? 'bg-[#FF6B00] border-[#FF6B00] scale-105' : 'border-slate-700/60'
                    )}>
                      {isSelected && <Check className="w-3 text-white stroke-[4]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-4 shrink-0">
            <button
              onClick={() => go(2, -1)}
              className="w-1/3 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04] text-sm font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={!studentClass}
              onClick={() => go(4)}
              className="flex-1 h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-[#FF6B00]/10"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 4: STUDY LANGUAGE ════════════════
    if (step === 4) {
      const languages: { key: LanguageMode; label: string; desc: string; keybind: string }[] = [
        { key: 'english', label: 'English medium', desc: 'Pure English theory, revision sheets & practice', keybind: '1' },
        { key: 'hinglish', label: 'Hinglish medium', desc: 'Hybrid Hindi explanation + English keynotes', keybind: '2' },
        { key: 'hindi', label: 'Hindi medium', desc: 'complete हिंदी माध्यम curriculum', keybind: '3' },
      ];

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-white text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              Select your Language
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              We sync your notes, lectures, and mock question sheets to this language.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {languages.map((lang) => {
              const isSelected = prefLanguage === lang.key;
              return (
                <button
                  key={lang.key}
                  onClick={() => setPrefLanguage(lang.key)}
                  className={cn(
                    'w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer select-none group',
                    isSelected
                      ? 'border-[#FF6B00]/40 bg-[#FF6B00]/[0.06] shadow-[0_8px_24px_rgba(255,107,0,0.04)]'
                      : 'border-white/[0.05] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                  )}
                >
                  <div>
                    <p className="text-white font-extrabold text-sm sm:text-base leading-snug">{lang.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5 font-sans font-semibold">{lang.desc}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                      Key {lang.keybind}
                    </span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200',
                      isSelected ? 'bg-[#FF6B00] border-[#FF6B00] scale-105' : 'border-slate-700/60'
                    )}>
                      {isSelected && <Check className="w-3 text-white stroke-[4]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-4 shrink-0">
            <button
              onClick={() => go(3, -1)}
              className="w-1/3 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04] text-sm font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleStartSynthesis}
              className="flex-1 h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-[#FF6B00]/10"
            >
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 5: PREMIUM DYNAMIC SYNTHESIS LOADING ════════════════
    if (step === 5) {
      const phases = [
        { icon: Brain, label: 'Securing your isolated prep classroom...' },
        { icon: Rocket, label: 'Synthesizing adaptive JEE/NEET study roadmaps...' },
        { icon: Zap, label: 'Configuring your 24/7 AI Mentor index...' },
        { icon: Award, label: 'Workspace synced! Opening classroom door...' },
      ];

      return (
        <div className="space-y-8 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/25 flex items-center justify-center mx-auto shadow-md relative z-10 animate-spin">
            <Loader2 className="w-10 h-10 text-[#FF6B00]" />
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-2xl font-black font-display tracking-tight leading-snug">
              Creating Your Engine
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans font-medium max-w-xs mx-auto leading-relaxed">
              PrepEntrance is initializing your personalized dashboard modules.
            </p>
          </div>

          {/* Animated phase status blocks */}
          <div className="space-y-3 max-w-sm mx-auto text-left bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 relative z-10">
            {phases.map((p, idx) => {
              const isActive = loadingPhase === idx;
              const isDone = loadingPhase > idx;
              const Icon = p.icon;

              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300',
                    isActive ? 'bg-[#FF6B00]/10 border border-[#FF6B00]/20' : 'opacity-40 border border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                    isDone ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 
                    (isActive ? 'bg-[#FF6B00]/10 border-[#FF6B00]/25 text-[#FF6B00]' : 'bg-white/5 border-white/10 text-slate-500')
                  )}>
                    {isDone ? <Check className="w-4 h-4 stroke-[3.5]" /> : <Icon className={cn('w-4 h-4', isActive && 'animate-pulse')} />}
                  </div>
                  <span className={cn(
                    'text-[12.5px] font-sans font-bold leading-none tracking-normal',
                    isDone ? 'text-slate-400 line-through' : (isActive ? 'text-white' : 'text-slate-500')
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
      {/* Visual background overlays */}
      <GlowBg />
      
      <div className="w-full max-w-[480px] relative z-10 space-y-6 py-8">
        
        {/* Dynamic horizontal progress bar indicator at top */}
        {step < 5 && (
          <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden select-none shrink-0">
            <motion.div
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="h-full bg-gradient-to-r from-[#FF6B00] to-[#E55A00] rounded-full"
            />
          </div>
        )}

        {/* Premium glassmorphic card container */}
        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/40 p-7 sm:p-9">
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
