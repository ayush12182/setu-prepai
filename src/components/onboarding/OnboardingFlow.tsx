import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Check, Loader2, 
  Rocket, Brain, Zap, GraduationCap, Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage, LanguageMode } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;
type StreamType = 'jee' | 'neet' | 'cuet' | '';

// Custom Glow Background for Clean Light-style depth matching the landing theme
const GlowBg: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden bg-gradient-to-tr from-slate-50 via-white to-blue-50/20">
    <div className="absolute top-[-20%] left-1/4 w-[750px] h-[750px] rounded-full bg-blue-500/[0.03] blur-[150px]" />
    <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.03] blur-[130px]" />
    {/* Clean subtle dot grid overlay */}
    <div className="absolute inset-0 opacity-[0.4]" style={{
      backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
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
          {/* Logo Badge */}
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
              We construct your isolated academic tracker based strictly on your target exam, class, and study preferences.
            </p>
          </div>

          <div className="pt-6 space-y-4">
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
        { key: 'neet' as StreamType, title: 'NEET Core', desc: 'Physics · Chemistry · Biology', icon: Zap, keybind: '2' },
        { key: 'cuet' as StreamType, title: 'CUET Domain Prep', desc: 'Domain Subjects · General Test', icon: GraduationCap, keybind: '3' },
      ];

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-slate-900 text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              What is your target exam?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              Your syllabus timelines and mock tests will adapt directly to this goal.
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
                      <s.icon className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className={cn('font-extrabold text-sm sm:text-base leading-snug', isSelected ? 'text-blue-900' : 'text-slate-800')}>{s.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5 font-sans font-semibold">{s.desc}</p>
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
            <h2 className="text-slate-900 text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              What is your current class?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              We compile your mock tests and study milestones based on class.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {classes.map((c) => {
              const isSelected = studentClass === c.key;
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
                  </div>

                  <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-3 pt-4 shrink-0">
            <button
              onClick={() => go(2, -1)}
              className="w-1/3 h-14 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-sm font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={!studentClass}
              onClick={() => go(4)}
              className="flex-1 h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10"
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
            <h2 className="text-slate-900 text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
              Select your Language
            </h2>
            <p className="text-slate-550 text-xs sm:text-sm font-sans font-medium leading-relaxed">
              We sync your notes, lectures, and mock question sheets to this language.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {languages.map((lang) => {
              const isSelected = prefLanguage === lang.key;
              return (
                <button
                  key={lang.key}
                  onClick={() => setPrefLanguage(lang.key)}
                  className={cn(
                    'w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-205 cursor-pointer select-none group',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-slate-100/30'
                  )}
                >
                  <div>
                    <p className={cn('font-extrabold text-sm sm:text-base leading-snug', isSelected ? 'text-blue-900' : 'text-slate-800')}>{lang.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5 font-sans font-semibold">{lang.desc}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                      Key {lang.keybind}
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
              onClick={() => go(3, -1)}
              className="w-1/3 h-14 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-sm font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleStartSynthesis}
              className="flex-1 h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10"
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
        <div className="space-y-8 py-8 text-center animate-pulse-soft">
          <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto shadow-sm relative z-10">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>

          <div className="space-y-3">
            <h2 className="text-slate-900 text-2xl font-black font-display tracking-tight leading-snug">
              Creating Your Engine
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium max-w-xs mx-auto leading-relaxed">
              PrepEntrance is initializing your personalized dashboard modules.
            </p>
          </div>

          {/* Animated phase status blocks */}
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
      {/* Visual background overlays */}
      <GlowBg />
      
      <div className="w-full max-w-[480px] relative z-10 space-y-6 py-8">
        
        {/* Dynamic progress bar indicator at top */}
        {step < 5 && (
          <div className="w-full h-1.5 bg-slate-100 border border-slate-200/60 rounded-full overflow-hidden select-none shrink-0">
            <motion.div
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        )}

        {/* Premium light-themed glassmorphic card container */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/80 p-7 sm:p-9 relative">
          
          {/* Close button at top right */}
          {step < 5 && (
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
