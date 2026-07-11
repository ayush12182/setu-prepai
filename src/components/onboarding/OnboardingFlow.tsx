import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Loader2,
  Rocket, Brain, Zap, Award, Sparkles,
  BookOpen, Users, Star, ChevronRight, Trophy,
  MapPin, Phone, Building, GraduationCap, User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type OnboardingStep = 1 | 2 | 3 | 4;
type StreamType = 'jee' | 'neet' | '';
type PlanType = 'aarambh' | 'aarohan' | 'shikher' | '';

const EXAM_LABELS: Record<string, string> = {
  jee: 'JEE Main & Advanced',
  neet: 'NEET',
};

const PLAN_DETAILS = {
  aarambh: { title: 'Aarambh', duration: '1 month', questions: '2,500 questions', color: 'blue' },
  aarohan: { title: 'Aarohan', duration: '12 months', questions: '5,000 questions', color: 'emerald', popular: true },
  shikher: { title: 'Shikher', duration: '24 months', questions: '10,000+ questions', color: 'violet' }
};

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

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { setExamMode } = useExamMode();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [dir, setDir] = useState(1);

  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    mobile: '+91 ',
    city: '',
    class: '',
    institute: ''
  });

  const [stream, setStream] = useState<StreamType>('');
  const [plan, setPlan] = useState<PlanType>('');

  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);

  const go = (newStep: OnboardingStep, direction = 1) => {
    setDir(direction);
    setStep(newStep);
  };

  const handleStartSynthesis = async () => {
    if (!user) return;
    setIsCompiling(true);
    go(4); // loading screen

    const phaseDelays = [900, 900, 900, 700];
    for (let i = 0; i < phaseDelays.length; i++) {
      await new Promise((r) => setTimeout(r, phaseDelays[i]));
      setLoadingPhase((prev) => prev + 1);
    }

    try {
      let examGoal = 'JEE Main';
      let dbExam = 'JEE';
      if (stream === 'neet') { examGoal = 'NEET'; dbExam = 'NEET'; }

      if (stream === 'jee') setExamMode('jee');
      else if (stream === 'neet') setExamMode('neet');

      // Update auth metadata
      await supabase.auth.updateUser({ 
        data: { 
          target_exam: examGoal, 
          user_type: 'student',
          onboarding_completed: true 
        } 
      });

      // Update profiles
      await updateProfile({
        target_exam: examGoal,
        class: formData.class,
        student_level: 'Intermediate',
        user_type: 'student',
        onboarding_completed: true,
        subscription_plan: plan,
      });

      // Upsert student_profiles
      const baseProfile = {
        student_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: user.email,
        mobile: formData.mobile,
        city: formData.city,
        institute_name: formData.institute || null,
        class: formData.class,
        target_exam: examGoal,
        subscription_plan: plan,
        onboarding_completed: true,
        current_level: 'Intermediate',
        physics_level: 'Intermediate',
        chemistry_level: 'Intermediate',
        maths_level: 'Intermediate',
        biology_level: 'Intermediate',
        last_active: new Date().toISOString(),
      };
      
      await supabase.from('student_profiles').upsert(baseProfile);

      localStorage.setItem('batch_name', plan);
      localStorage.setItem('exam_type', dbExam);
      localStorage.setItem('academic_stage', formData.class);

      await refreshProfile();
      setShowWelcomeScreen(true);
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong during setup.');
      setIsCompiling(false);
      go(3, -1);
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) return toast.error('First name is required');
    if (!formData.mobile.trim() || formData.mobile === '+91 ') return toast.error('Mobile number is required');
    if (!formData.city.trim()) return toast.error('City is required');
    if (!formData.class) return toast.error('Please select your class');
    go(2);
  };

  // ─── WELCOME SCREEN ────────────────────────────────────────────────
  if (showWelcomeScreen) {
    const examLabel = EXAM_LABELS[stream] ?? stream.toUpperCase();
    const examColors: Record<string, any> = {
      jee:  { accent: '#60a5fa', glow: 'rgba(59,130,246,0.15)', icon: '🚀' },
      neet: { accent: '#34d399', glow: 'rgba(16,185,129,0.15)', icon: '🧬' },
    };
    const colors = examColors[stream] ?? examColors.jee;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: colors.glow }} />
          <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'rgba(16,185,129,0.05)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md space-y-4">
          <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-8 border border-white/[0.08] shadow-2xl text-center space-y-5">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }} className="w-24 h-24 rounded-full border-2 flex items-center justify-center mx-auto text-5xl" style={{ borderColor: colors.accent, background: colors.glow }}>
              {colors.icon}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: colors.accent }}>You're All Set ✓</p>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Welcome aboard,<br /><span style={{ color: colors.accent }}>{formData.firstName}!</span></h1>
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xs mx-auto">Your personalized PrepEntrance dashboard is ready.</p>
            </motion.div>
          </div>

          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} onClick={async () => { await refreshProfile(); window.location.href = '/student-hub'; }} className="w-full h-16 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-white" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`, boxShadow: `0 8px 32px ${colors.glow}` }}>
            <Sparkles className="w-5 h-5" /> Enter Dashboard <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    // ════════════════ STEP 1: Details ════════════════
    if (step === 1) {
      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2 mb-4">
            <h2 className="text-slate-900 text-2xl font-black font-display tracking-tight leading-snug">About You</h2>
            <p className="text-slate-500 text-xs font-sans font-medium">Let's set up your personalized profile.</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-500 text-[10px] font-bold uppercase">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="pl-9 h-11 bg-slate-50" placeholder="First Name" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-500 text-[10px] font-bold uppercase">Last Name</Label>
                <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-11 bg-slate-50" placeholder="Last Name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-500 text-[10px] font-bold uppercase">Email (Read-only)</Label>
              <Input value={user?.email || ''} readOnly className="h-11 bg-slate-100 text-slate-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-500 text-[10px] font-bold uppercase">Mobile *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="pl-9 h-11 bg-slate-50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-500 text-[10px] font-bold uppercase">City *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="pl-9 h-11 bg-slate-50" placeholder="e.g. Kota" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-500 text-[10px] font-bold uppercase">Academic Class *</Label>
              <div className="grid grid-cols-3 gap-2">
                {['11', '12', 'dropper'].map(cls => (
                  <button key={cls} onClick={() => setFormData({...formData, class: cls})} className={cn("h-11 rounded-lg border text-sm font-bold transition-all", formData.class === cls ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
                    {cls === 'dropper' ? 'Dropper' : `Class ${cls}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-500 text-[10px] font-bold uppercase">Institute (Optional)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={formData.institute} onChange={e => setFormData({...formData, institute: e.target.value})} className="pl-9 h-11 bg-slate-50" placeholder="e.g. ALLEN, PW, DPS, Self Study" />
              </div>
            </div>
          </div>

          <button onClick={validateStep1} className="w-full h-12 mt-4 rounded-xl font-display font-extrabold text-sm flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    // ════════════════ STEP 2: SELECT EXAM ════════════════
    if (step === 2) {
      const streams = [
        { key: 'jee' as StreamType, title: 'JEE Main & Advanced', desc: 'Physics · Chemistry · Mathematics', icon: Rocket },
        { key: 'neet' as StreamType, title: 'NEET', desc: 'Physics · Chemistry · Biology', icon: Zap },
      ];

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-slate-900 text-2xl font-black font-display tracking-tight leading-snug">Target Exam</h2>
            <p className="text-slate-500 text-xs font-sans font-medium">Select your primary target examination.</p>
          </div>

          <div className="space-y-3 pt-2">
            {streams.map((s) => {
              const isSelected = stream === s.key;
              return (
                <button key={s.key} onClick={() => setStream(s.key)} className={cn('w-full p-4.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group', isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-slate-50/60 hover:border-slate-200')}>
                  <div className="flex items-center gap-4">
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors', isSelected ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400')}><s.icon className="w-5 h-5" /></div>
                    <div>
                      <p className={cn('font-black text-base', isSelected ? 'text-blue-900' : 'text-slate-900')}>{s.title}</p>
                      <p className="text-slate-500 text-xs font-semibold">{s.desc}</p>
                    </div>
                  </div>
                  <div className={cn('w-5 h-5 rounded-full border flex items-center justify-center transition-all', isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300')}>
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => go(1, -1)} className="w-1/3 h-14 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold flex items-center justify-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button disabled={!stream} onClick={() => go(3)} className="flex-1 h-14 rounded-2xl font-extrabold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40">Continue <ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 3: PLAN ════════════════
    if (step === 3) {
      const plans: {key: PlanType; details: any}[] = [
        { key: 'aarambh', details: PLAN_DETAILS.aarambh },
        { key: 'aarohan', details: PLAN_DETAILS.aarohan },
        { key: 'shikher', details: PLAN_DETAILS.shikher },
      ];

      return (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-slate-900 text-2xl font-black font-display tracking-tight leading-snug">Choose Your Plan</h2>
            <p className="text-slate-500 text-xs font-sans font-medium">Select a subscription plan based on your needs.</p>
          </div>

          <div className="space-y-3 pt-2">
            {plans.map((p) => {
              const isSelected = plan === p.key;
              const d = p.details;
              return (
                <button key={p.key} onClick={() => setPlan(p.key)} className={cn('w-full relative p-4 rounded-2xl border text-left transition-all cursor-pointer group', isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-slate-50/60 hover:border-slate-200')}>
                  {d.popular && <div className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Most Popular</div>}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={cn('font-black text-lg', isSelected ? 'text-blue-900' : 'text-slate-900')}>{d.title}</p>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 rounded">{d.duration}</span>
                      </div>
                      <p className="text-slate-500 text-xs font-semibold mt-1 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> {d.questions}</p>
                    </div>
                    <div className={cn('w-5 h-5 rounded-full border flex items-center justify-center transition-all', isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300')}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => go(2, -1)} className="w-1/3 h-14 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold flex items-center justify-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button disabled={!plan} onClick={handleStartSynthesis} className="flex-1 h-14 rounded-2xl font-extrabold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40">Start My Journey <ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>
      );
    }

    // ════════════════ STEP 4: SYNTHESIS LOADING ════════════════
    if (step === 4) {
      const examLabel = EXAM_LABELS[stream] ?? 'Your Exam';
      const phases = [
        { icon: Brain, label: 'Verifying your profile details...' },
        { icon: Award, label: `Setting up ${examLabel} ${PLAN_DETAILS[plan as keyof typeof PLAN_DETAILS]?.title || ''} plan...` },
        { icon: Rocket, label: 'Building your personalized workspace...' },
        { icon: Star, label: 'All set! Opening your dashboard...' },
      ];

      return (
        <div className="space-y-8 py-8 text-center animate-pulse-soft">
          <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto shadow-sm relative z-10"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
          <div className="space-y-3">
            <h2 className="text-slate-900 text-2xl font-black font-display tracking-tight leading-snug">Setting Up Your Dashboard</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium max-w-xs mx-auto leading-relaxed">Configuring your personalized PrepEntrance workspace. This takes just a moment.</p>
          </div>
          <div className="space-y-3 max-w-sm mx-auto text-left bg-slate-50 border border-slate-100 rounded-3xl p-5 relative z-10">
            {phases.map((p, idx) => {
              const isActive = loadingPhase === idx;
              const isDone = loadingPhase > idx;
              return (
                <div key={idx} className={cn('flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300', isActive ? 'bg-blue-50 border-blue-100 shadow-xs' : 'opacity-40 border-transparent')}>
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border', isDone ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : (isActive ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200/60 text-slate-400'))}>
                    {isDone ? <Check className="w-4 h-4 stroke-[3.5]" /> : <p.icon className={cn('w-4 h-4', isActive && 'animate-pulse')} />}
                  </div>
                  <span className={cn('text-[12.5px] font-sans font-bold leading-none tracking-normal', isDone ? 'text-slate-400 line-through' : (isActive ? 'text-blue-900 font-extrabold' : 'text-slate-550'))}>{p.label}</span>
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
        {step < 4 && (
          <div className="w-full h-1.5 bg-slate-100 border border-slate-200/60 rounded-full overflow-hidden select-none shrink-0">
            <motion.div animate={{ width: `${(step / 3) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} className="h-full bg-blue-600 rounded-full" />
          </div>
        )}
        {step < 4 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400 font-bold">Step {step} of 3</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn('w-1.5 h-1.5 rounded-full transition-all', step >= s ? 'bg-blue-600' : 'bg-slate-200')} />
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/80 p-7 sm:p-9 relative">
          {step < 4 && (
            <button onClick={() => navigate('/')} className="absolute right-6 top-6 p-1.5 rounded-full border border-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer z-20">✕</button>
          )}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit">{renderStep()}</motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
