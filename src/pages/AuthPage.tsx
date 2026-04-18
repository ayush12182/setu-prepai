import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, Phone, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Check, BookOpen, GraduationCap, Sparkles, Rocket, Zap, Brain, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { EXAM_CONFIG, STREAM_TO_EXAM } from '@/config/examConfig';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number');

type AuthMode = 'login' | 'signup' | 'phone' | 'otp' | 'forgot-password';
type OnboardingStep = 0 | 1 | 2 | 3;
type StreamType = 'foundation' | 'jee' | 'neet' | 'cuet' | 'commerce' | '';

interface OnboardingData {
  userType: 'b2c_student' | 'b2b_student' | 'b2b_mentor';
  institutionName?: string;
  referenceCode?: string;
  stream: StreamType;
  studentClass: string;
  examGoal: string;
}

const STREAM_OPTIONS = [
  {
    value: 'foundation' as StreamType,
    label: 'SETU Foundation',
    subjects: 'Maths, Science, Mental Ability',
    badge: 'Classes 6–10',
    emoji: '🧠',
    icon: Brain,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    accentColor: 'text-emerald-400',
  },
  {
    value: 'jee' as StreamType,
    label: 'JEE Main & Advanced',
    subjects: 'Physics, Chemistry, Mathematics',
    badge: 'Class 11–12',
    emoji: '🚀',
    icon: Rocket,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-400',
  },
  {
    value: 'neet' as StreamType,
    label: 'NEET',
    subjects: 'Physics, Chemistry, Biology',
    badge: 'Class 11–12',
    emoji: '🔬',
    icon: Zap,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    accentColor: 'text-green-400',
  },
  {
    value: 'cuet' as StreamType,
    label: 'CUET',
    subjects: 'General Test, Language, Domains',
    badge: 'Class 12',
    emoji: '🏛️',
    icon: GraduationCap,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    accentColor: 'text-violet-400',
  },
  {
    value: 'commerce' as StreamType,
    label: 'Commerce / CA Foundation',
    subjects: 'Accounts, Economics, Business Studies',
    badge: 'Class 11–12',
    emoji: '📊',
    icon: Sparkles,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-400',
  },
];

const FOUNDATION_CLASS_OPTIONS = [
  { value: '6', label: 'Class 6', emoji: '🌱', tag: 'Foundation' },
  { value: '7', label: 'Class 7', emoji: '🌿', tag: 'Foundation' },
  { value: '8', label: 'Class 8', emoji: '📐', tag: 'Foundation' },
  { value: '9', label: 'Class 9', emoji: '📖', tag: 'Board Prep' },
  { value: '10', label: 'Class 10', emoji: '🎯', tag: 'Board Prep' },
];

const SENIOR_CLASS_OPTIONS = [
  { value: '11', label: 'Class 11', emoji: '📚', tag: 'Just Starting' },
  { value: '12', label: 'Class 12', emoji: '🎯', tag: 'Board + Entrance' },
  { value: '13', label: 'Dropper / Repeater', emoji: '🔁', tag: 'Full Focus Year' },
];

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signInWithPhone, verifyOTP, updateProfile, loading: authLoading } = useAuth();
  const { setExamMode } = useExamMode();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    const typeParam = searchParams.get('type');
    const orgName = searchParams.get('org_name');
    const orgId = searchParams.get('org_id');
    
    return {
      userType: typeParam === 'coaching' || orgId || orgName ? 'b2b_student' : 'b2c_student',
      institutionName: orgName || undefined,
      stream: '',
      studentClass: '',
      examGoal: '',
    };
  });

  // Start at step 0 (who are you?) unless auto-detected as B2B from URL
  const getInitialStep = (): OnboardingStep => {
    const typeParam = searchParams.get('type');
    const orgName = searchParams.get('org_name');
    if (typeParam === 'coaching' || orgName) return 1; // Already know they're coaching
    return 0;
  };
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(getInitialStep());

  const isFoundationStream = () => onboardingData.stream === 'foundation';

  useEffect(() => {
    if (user && !authLoading) {
      if (showOnboarding) return;
      if (profile) {
        if (profile.user_type === 'b2b_mentor' || profile.user_type === 'b2b_institution' || profile.user_type === 'admin') {
          navigate('/teacher-dashboard');
          return;
        }

        if (profile.user_type === 'b2b_student') {
          navigate('/student-hub');
          return;
        }

        if (!profile.class) {
          setShowOnboarding(true);
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [user, profile, authLoading, navigate, showOnboarding]);

  const validateEmail = (value: string) => {
    try { emailSchema.parse(value); setErrors(prev => ({ ...prev, email: '' })); return true; }
    catch (e) { if (e instanceof z.ZodError) setErrors(prev => ({ ...prev, email: e.errors[0].message })); return false; }
  };
  const validatePassword = (value: string) => {
    try { passwordSchema.parse(value); setErrors(prev => ({ ...prev, password: '' })); return true; }
    catch (e) { if (e instanceof z.ZodError) setErrors(prev => ({ ...prev, password: e.errors[0].message })); return false; }
  };
  const validatePhone = (value: string) => {
    try { phoneSchema.parse(value); setErrors(prev => ({ ...prev, phone: '' })); return true; }
    catch (e) { if (e instanceof z.ZodError) setErrors(prev => ({ ...prev, phone: e.errors[0].message })); return false; }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email) || !validatePassword(password)) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, fullName);
        
        // Force sign in immediately after sign up to guarantee an active local session 
        // (fixes Supabase quirk where session is sometimes null immediately after signup)
        try {
          await signInWithEmail(email, password);
        } catch (signInErr) {
          console.warn("Auto sign-in after sign-up failed, user may need to log in manually", signInErr);
        }

        // If they came from the b2b_student onboarding path (code already set),
        // go straight to completion — no need to show onboarding screens again.
        if (onboardingData.userType === 'b2b_student' && onboardingData.institutionName) {
          toast.success("Account created! Joining your batch... 🎯");
          setShowOnboarding(true); // Keep true so handleOnboardingComplete can run
          await handleOnboardingComplete();
          return;
        }

        toast.success('Account created! Let\'s set up your learning profile 🎯');
        setShowOnboarding(true);
        setOnboardingStep(getInitialStep());
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong, please try again';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try { await signInWithGoogle(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Google login failed'); setLoading(false); }
  };
  const handleAppleAuth = async () => {
    setLoading(true);
    try { await signInWithApple(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Apple login failed'); setLoading(false); }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    setLoading(true);
    try { await signInWithPhone(phone); toast.success('OTP sent! Check your phone.'); setMode('otp'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try { await verifyOTP(phone, otp); } catch (error) { toast.error(error instanceof Error ? error.message : 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` });
      if (error) throw error;
      toast.success('Reset link sent! Check your email.');
      setMode('login');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to send reset link'); }
    finally { setLoading(false); }
  };

  const isFoundationProgram = () => onboardingData.stream === 'foundation';

  const getStudentLevel = () => {
    if (onboardingData.stream !== 'foundation') return '11-12';
    const cls = parseInt(onboardingData.studentClass);
    if (isNaN(cls)) return '11-12';
    if (cls <= 8) return '6-8';
    if (cls <= 10) return '9-10';
    return '11-12';
  };

  const getExamGoalFromStream = (stream: StreamType): string => {
    return STREAM_TO_EXAM[stream as string] ?? 'JEE Main';
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      // --- Teacher: auto-create org, save profile ---
      if (onboardingData.userType === 'b2b_mentor') {
        const examGoal = getExamGoalFromStream(onboardingData.stream as StreamType) || 'JEE Main';
        
        // Create an organization for this teacher
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        let orgId: string | null = null;
        if (currentUser) {
          const displayName = fullName || currentUser.email?.split('@')[0] || 'Teacher';
          const institutionLabel = onboardingData.institutionName?.trim() || `${displayName.split(' ')[0]}'s Institute`;
          // slug must be unique — use timestamp suffix
          const slug = institutionLabel.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40) + '-' + Date.now();
          const { data: newOrg, error: orgErr } = await (supabase as any)
            .from('organizations')
            .insert({ name: institutionLabel, slug, created_by: currentUser.id })
            .select('id')
            .single();
          if (!orgErr && newOrg) {
            orgId = (newOrg as any).id;
          } else {
            console.warn('Org insert error (non-fatal):', orgErr?.message);
          }
        }

        await updateProfile({
          target_exam: examGoal,
          class: null,           // Teachers don't have a class — avoids DB constraint
          user_type: 'b2b_mentor',
          institution_name: onboardingData.institutionName?.trim() || null,
          organization_id: orgId,
        } as any);

        // Persist in auth metadata
        await supabase.auth.updateUser({ data: { user_type: 'b2b_mentor', organization_id: orgId, target_exam: examGoal } });

        toast.success('Teacher portal ready! Welcome to SETU 👨\u200d\uD83C\uDFEB');
        navigate('/b2b');
        return;
      }

      // If coaching student with a join code — actually join the batch right here
      if (onboardingData.userType === 'b2b_student') {
        const joinCode = (onboardingData.institutionName || '').trim().toUpperCase();
        if (!joinCode || joinCode.length < 6) {
          toast.error('Please enter a valid 6-character batch code from your mentor');
          setLoading(false);
          return;
        }
        // Join the batch — this also sets target_exam + org_id
        const { joinTeacherByCode } = await import('@/lib/studentActivity');
        const joinResult = await joinTeacherByCode(joinCode);
        if (!joinResult.success) {
          // Code invalid — stop and show error
          toast.error(joinResult.message || 'Invalid batch code. Get the correct code from your teacher.');
          setLoading(false);
          return;
        }
        // Batch joined — profile already updated with target_exam by joinTeacherByCode
        // Update user_type in context
        await supabase.auth.updateUser({ data: { user_type: 'b2b_student' } });
        await updateProfile({ user_type: 'b2b_student' } as any);
        toast.success(`${joinResult.message} Let's begin 🚀`);
        navigate('/student-hub');
        return;
      }

      const stream = onboardingData.stream;

      const examGoal = getExamGoalFromStream(stream as StreamType);
      const studentClass = onboardingData.studentClass || '11';

      // Set exam mode FIRST so context is correct immediately after navigation
      if (stream === 'jee') setExamMode('jee');
      else if (stream === 'neet') setExamMode('neet');
      else if (stream === 'cuet') setExamMode('cuet');
      else setExamMode('jee');

      const studentLevel = getStudentLevel();

      await new Promise(resolve => setTimeout(resolve, 300));
      await updateProfile({
        target_exam: examGoal,
        class: studentClass,
        student_level: studentLevel,
        user_type: onboardingData.userType,
        institution_name: onboardingData.institutionName || null,
      });

      // Persist exam in auth metadata so it's available immediately without profile refetch
      await supabase.auth.updateUser({ data: { target_exam: examGoal, user_type: onboardingData.userType } });


      // Inject Mock Priority Task so they can immediately test the Outcomes Engine
      if (onboardingData.userType === 'b2c_student') {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await (supabase.from as any)('assigned_tasks').insert({
              student_id: user.id,
              teacher_id: user.id, // Bypass FK by assigning to self
              topic: examGoal === 'NEET' ? 'Cell Biology' : 'Kinematics',
              subtopic: examGoal === 'NEET' ? 'Cell Cycle and Cell Division' : 'Motion in 1D',
              status: 'pending',
              initial_accuracy: 45.5,
            });
          }
        } catch (e) {
          console.warn('Mock task creation failed', e);
        }
      }

      toast.success('All set! Let\'s begin your journey 🚀');
      
      // Route by user type after onboarding
      if (onboardingData.userType === 'b2b_student') {
        navigate('/student-hub');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      const errMsg = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Unknown error';
      toast.error(`Profile update failed: ${errMsg}`);
    } finally { setLoading(false); }
  };

  const handleOnboardingNext = async () => {
    // ── Coaching Student: validate code format at Step 0, then show inline auth ──
    if (onboardingStep === 0 && onboardingData.userType === 'b2b_student') {
      const joinCode = (onboardingData.institutionName || '').trim().toUpperCase();
      if (!joinCode || joinCode.length < 6) {
        toast.error('Please enter the 6-character batch code from your teacher');
        return;
      }
      // Step 3 = inline signup form inside onboarding (showOnboarding stays true)
      setOnboardingStep(3);
      return;
    }

    // ── Teacher: go to exam selection ──
    if (onboardingStep === 0 && onboardingData.userType === 'b2b_mentor') {
      setOnboardingStep(1);
      return;
    }

    // ── Teacher at exam step: no class step needed, complete immediately ──
    if (onboardingStep === 1 && onboardingData.userType === 'b2b_mentor') {
      if (!onboardingData.stream) {
        toast.error('Please select the exam you teach');
        return;
      }
      handleOnboardingComplete();
      return;
    }

    if (onboardingStep === 0 && !onboardingData.userType) {
      toast.error('Please select your role');
      return;
    }
    if (onboardingStep === 1 && !onboardingData.stream) {
      toast.error('Please select your stream');
      return;
    }
    if (onboardingStep === 2 && !onboardingData.studentClass) {
      toast.error('Please select your class');
      return;
    }

    if (onboardingStep === 0) setOnboardingStep(1);
    else if (onboardingStep === 1) {
      if (onboardingData.userType === 'b2b_mentor') {
        handleOnboardingComplete();
      } else {
        setOnboardingStep(2);
      }
    }
    else if (onboardingStep === 2) handleOnboardingComplete();
  };



  const totalSteps = 3;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── ONBOARDING ───
  // Note: We render onboarding even if user hasn't fully synced to context yet 
  // because Supabase session sync can have a slight delay after signup.
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-accent/[0.07] rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/[0.05] rounded-full blur-[120px]" />
        </div>

        <header className="relative z-10 p-5 sm:p-6">
          <div className="max-w-lg mx-auto flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20">
              <BookOpen className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-serif font-bold text-lg text-white tracking-wide">SETU</span>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                  <div className={`h-full rounded-full transition-all duration-500 ${step <= onboardingStep ? 'bg-gradient-to-r from-accent to-amber-500 w-full' : 'w-0'}`} />
                </div>
              ))}
            </div>

            <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
              {/* Step 0: Coaching or Individual */}
              {onboardingStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mt-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Welcome to SETU
                    </h2>
                    <p className="text-white/40 text-sm">
                      Let's set up your learning experience
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Individual Student */}
                    <button
                      onClick={() => setOnboardingData(prev => ({ ...prev, userType: 'b2c_student', institutionName: undefined }))}
                      className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-4
                        ${onboardingData.userType === 'b2c_student'
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                          : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        onboardingData.userType === 'b2c_student' ? 'bg-accent/20' : 'bg-white/[0.06]'
                      }`}>
                        <Users className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-base">Individual Student</p>
                        <p className="text-xs text-white/40 mt-0.5">Studying on my own, self-paced</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        onboardingData.userType === 'b2c_student' ? 'bg-accent border-accent' : 'border-white/20'
                      }`}>
                        {onboardingData.userType === 'b2c_student' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </button>

                    {/* Coaching Student */}
                    <button
                      onClick={() => setOnboardingData(prev => ({ ...prev, userType: 'b2b_student' }))}
                      className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-4
                        ${onboardingData.userType === 'b2b_student'
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                          : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        onboardingData.userType === 'b2b_student' ? 'bg-accent/20' : 'bg-white/[0.06]'
                      }`}>
                        <Building2 className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-base">Coaching Student</p>
                        <p className="text-xs text-white/40 mt-0.5">Enrolled in a coaching centre / institute</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        onboardingData.userType === 'b2b_student' ? 'bg-accent border-accent' : 'border-white/20'
                      }`}>
                        {onboardingData.userType === 'b2b_student' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </button>

                    {/* Coaching name field */}
                    {onboardingData.userType === 'b2b_student' && (
                      <div className="mt-2 pt-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5 block">Batch Join Code (6 characters — from your mentor)</label>
                        <input
                          type="text"
                          placeholder="e.g. K8ZX2W"
                          value={onboardingData.institutionName || ''}
                          maxLength={6}
                          onChange={e => setOnboardingData(prev => ({ ...prev, institutionName: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all font-mono tracking-widest"
                        />
                        <p className="text-[11px] text-white/30 mt-1.5">Ask your teacher for the 6-digit code from their dashboard</p>
                      </div>
                    )}


                    {/* Teacher / Mentor Card */}
                    <button
                      onClick={() => setOnboardingData(prev => ({ ...prev, userType: 'b2b_mentor', institutionName: undefined }))}
                      className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-4
                        ${onboardingData.userType === 'b2b_mentor'
                          ? 'border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/30'
                          : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        onboardingData.userType === 'b2b_mentor' ? 'bg-violet-500/20' : 'bg-white/[0.06]'
                      }`}>
                        <GraduationCap className="w-6 h-6 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-base">Teacher / Mentor</p>
                        <p className="text-xs text-white/40 mt-0.5">I teach students and manage a batch</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        onboardingData.userType === 'b2b_mentor' ? 'bg-violet-500 border-violet-500' : 'border-white/20'
                      }`}>
                        {onboardingData.userType === 'b2b_mentor' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </button>

                    {/* Teacher name/school field */}
                    {onboardingData.userType === 'b2b_mentor' && (
                      <div className="mt-2 pt-2 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                        <p className="text-xs text-violet-300/80 leading-relaxed">
                          👨‍🏫 You'll get access to the <span className="font-bold text-violet-300">Teacher Portal</span> where you can manage students, create tests, and distribute chapter-wise notes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 1: Stream/Exam Selection */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  {/* Clean, minimalist header */}
                  <div className="text-center space-y-1 mt-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {onboardingData.userType === 'b2b_mentor' ? 'Which exam do you teach?' : 'Choose Your Goal'}
                    </h2>
                    <p className="text-white/40 text-sm">
                      {onboardingData.userType === 'b2b_mentor'
                        ? 'Your teacher dashboard will adapt to this exam'
                        : 'Select one to personalize your journey'}
                    </p>
                  </div>

                  {/* Flat stream cards sequence */}
                  <div className="space-y-3 max-h-[420px] overflow-y-auto px-1 pb-1">
                    {STREAM_OPTIONS.map((stream) => {
                      const selected = onboardingData.stream === stream.value;
                      return (
                        <button
                          key={stream.value}
                          onClick={() => setOnboardingData(prev => ({ ...prev, stream: stream.value, studentClass: '', examGoal: '' }))}
                          className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between
                            ${selected
                              ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                              : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] bg-white/[0.01]'
                            }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white text-base tracking-tight">{stream.label}</span>
                            <span className="text-xs text-white/40">{stream.subjects}</span>
                          </div>
                          
                          {/* Selection indicator */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                            ${selected ? 'border-accent bg-accent text-white' : 'border-white/20'}`}
                          >
                            {selected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Class Selection — Foundation gets 6-10, others get 11-12 */}
              {onboardingStep === 2 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                      <GraduationCap className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">Step 2 of 2</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                      Which class are you in?
                    </h2>
                    <p className="text-white/50 text-sm">
                      {isFoundationProgram() ? "We'll load your exact NCERT syllabus" : 'Your assessment will be tailored to your class'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(isFoundationProgram() ? FOUNDATION_CLASS_OPTIONS : SENIOR_CLASS_OPTIONS).map((cls) => {
                      const selected = onboardingData.studentClass === cls.value;
                      return (
                        <button
                          key={cls.value}
                          onClick={() => setOnboardingData(prev => ({ ...prev, studentClass: cls.value }))}
                          className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200
                            ${selected
                              ? 'border-accent/60 bg-accent/10 shadow-lg shadow-accent/10'
                              : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cls.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-white text-base block">{cls.label}</span>
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${selected ? 'text-accent' : 'text-white/30'}`}>
                                {cls.tag}
                              </span>
                            </div>
                            {selected && (
                              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Inline Auth (B2B Student — post code validation) */}
              {onboardingStep === 3 && onboardingData.userType === 'b2b_student' && (
                <div className="space-y-5">
                  <div className="text-center space-y-1 mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-2">
                      <Check className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">Code accepted: {onboardingData.institutionName}</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Create your account
                    </h2>
                    <p className="text-white/40 text-sm">You'll be added to your teacher's batch automatically</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5 block">Full Name</label>
                      <input
                        type="text" placeholder="Your name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5 block">Email</label>
                      <input
                        type="email" placeholder="you@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5 block">Password</label>
                      <input
                        type="password" placeholder="Min 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!fullName.trim()) { toast.error('Enter your name'); return; }
                      if (!validateEmail(email)) { toast.error('Enter a valid email'); return; }
                      if (!validatePassword(password)) { toast.error('Password must be at least 6 characters'); return; }
                      setLoading(true);
                      try {
                        await signUpWithEmail(email, password, fullName);
                        try { await signInWithEmail(email, password); } catch {}
                        toast.success('Account created! Joining your batch...');
                        await handleOnboardingComplete();
                      } catch (err: any) {
                        // If account already exists, sign in and join
                        if (err?.message?.includes('already')) {
                          try {
                            await signInWithEmail(email, password);
                            await handleOnboardingComplete();
                          } catch {
                            toast.error('Sign in failed. Check your password.');
                          }
                        } else {
                          toast.error(err?.message || 'Account creation failed');
                        }
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                    className="w-full h-14 rounded-xl bg-accent hover:bg-accent/90 text-[hsl(213,28%,20%)] font-bold text-base shadow-[0_0_20px_rgba(232,154,60,0.2)] transition-all"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Join Batch & Start Learning <ArrowRight className="h-5 w-5 ml-2" /></>}
                  </Button>

                  <p className="text-center text-xs text-white/30">
                    Already have an account?{' '}
                    <button
                      onClick={async () => {
                        if (!validateEmail(email) || !validatePassword(password)) { toast.error('Enter email and password'); return; }
                        setLoading(true);
                        try {
                          await signInWithEmail(email, password);
                          await handleOnboardingComplete();
                        } catch (err: any) {
                          toast.error(err?.message || 'Login failed');
                        } finally { setLoading(false); }
                      }}
                      className="text-accent underline font-medium"
                    >
                      Sign in instead
                    </button>
                  </p>
                </div>
              )}

              {onboardingStep !== 3 && (<>
              <div className="mt-8 mb-4 text-center">
                <p className="text-xs font-medium text-white/40">
                  Takes 10–15 mins • No marks • AI-powered report
                </p>
              </div>

              {/* Nav buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleOnboardingNext}
                  disabled={loading || (onboardingStep === 1 && !onboardingData.stream) || (onboardingStep === 2 && !onboardingData.studentClass)}
                  className="w-full h-14 rounded-xl bg-accent hover:bg-accent/90 text-[hsl(213,28%,20%)] font-bold text-lg shadow-[0_0_20px_rgba(232,154,60,0.2)] hover:shadow-[0_0_30px_rgba(232,154,60,0.3)] transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : onboardingStep === 2 ? (
                    <>Start Assessment <ArrowRight className="h-5 w-5 ml-2" /></>
                  ) : (
                    <>Next <ArrowRight className="h-5 w-5 ml-2" /></>
                  )}
                </Button>
                
                {onboardingStep > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setOnboardingStep((prev) => (prev - 1) as OnboardingStep)}
                    className="w-full h-10 text-white/50 hover:text-white hover:bg-white/5 rounded-xl"
                  >
                    Back
                  </Button>
                )}
              </div>
            </div>
            </>)}


            {/* Stream hints */}
            {onboardingStep === 1 && onboardingData.stream === 'foundation' && (
              <div className="mt-4 flex items-start gap-3 bg-emerald-500/[0.08] rounded-2xl p-4 border border-emerald-500/15">
                <span className="text-lg mt-0.5">🧠</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-emerald-400 font-medium">SETU Foundation:</span> Build strong fundamentals in Maths & Science from Class 6–10. Perfect preparation for JEE, NEET & Olympiads — without competitive pressure.
                </p>
              </div>
            )}
            {onboardingStep === 1 && onboardingData.stream === 'jee' && (
              <div className="mt-4 flex items-start gap-3 bg-amber-500/[0.08] rounded-2xl p-4 border border-amber-500/15">
                <span className="text-lg mt-0.5">🚀</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-amber-400 font-medium">JEE Main & Advanced:</span> Master Physics, Chemistry & Mathematics with adaptive practice, CAT-style diagnostics, and 10k+ verified questions.
                </p>
              </div>
            )}
            {onboardingStep === 1 && onboardingData.stream === 'neet' && (
              <div className="mt-4 flex items-start gap-3 bg-green-500/[0.08] rounded-2xl p-4 border border-green-500/15">
                <span className="text-lg mt-0.5">🔬</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-green-400 font-medium">NEET:</span> Biology, Physics and Chemistry questions curated for NEET. Adaptive diagnostics identify your weak chapters instantly.
                </p>
              </div>
            )}
            {onboardingStep === 1 && onboardingData.stream === 'cuet' && (
              <div className="mt-4 flex items-start gap-3 bg-violet-500/[0.08] rounded-2xl p-4 border border-violet-500/15">
                <span className="text-lg mt-0.5">🏛️</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-violet-400 font-medium">CUET:</span> Subject-specific practice for Central University entrance. English, domain subjects, and general test tailored to your stream.
                </p>
              </div>
            )}
            {onboardingStep === 1 && onboardingData.stream === 'commerce' && (
              <div className="mt-4 flex items-start gap-3 bg-blue-500/[0.08] rounded-2xl p-4 border border-blue-500/15">
                <span className="text-lg mt-0.5">📊</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-blue-400 font-medium">Commerce / CA Foundation:</span> Deeply adaptive questions in Accounts, Economics and Business Studies. Built for Class 11–12 and CA Foundation aspirants.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ─── LOGIN / SIGNUP ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex">
      {/* ── LEFT BRANDING PANEL (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-10 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-accent/[0.12] rounded-full blur-[180px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-violet-500/[0.08] rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif font-bold text-2xl text-white tracking-wide">SETU</span>
          </button>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-serif text-3xl xl:text-4xl font-semibold text-white leading-tight mb-4">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">Learning Engine</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-md">
              Foundation for Class 6–12. Built for JEE, NEET & CUET.
            </p>
          </div>

          {/* Program pills */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.12] border border-emerald-500/20 text-sm text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Foundation (6–10)
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/[0.12] border border-amber-500/20 text-sm text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              JEE Core (11)
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.12] border border-violet-500/20 text-sm text-violet-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              JEE Advanced (12)
            </span>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: '🧠', text: 'AI Diagnostic → Personalized Roadmap' },
              { icon: '📝', text: 'Smart Notes + 3-Level Practice System' },
              { icon: '🔄', text: '21-Day Cycle-Based Preparation' },
              { icon: '📊', text: 'Real-time Analytics & Weak Area Detection' },
            ].map((feat) => (
              <div key={feat.text} className="flex items-center gap-3">
                <span className="text-lg">{feat.icon}</span>
                <span className="text-white/60 text-sm">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['bg-accent', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'].map((bg, i) => (
              <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white`}>
                {['A', 'S', 'R', 'P'][i]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white/70 text-sm font-medium">Trusted by students</p>
            <p className="text-white/30 text-xs">Building India's smartest learners</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top branding */}
        <header className="lg:hidden relative z-10 p-5 sm:p-6">
          <div className="max-w-md mx-auto flex items-center gap-2.5">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-serif font-bold text-lg text-white tracking-wide">SETU</span>
            </button>
          </div>
        </header>

        {/* Background glow for form side */}
        <div className="absolute inset-0 pointer-events-none lg:left-[45%]">
          <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-accent/[0.05] rounded-full blur-[150px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
        </div>

        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome heading */}
            <div className="text-center mb-8">
              {/* SETU Logo — desktop right panel */}
              <div className="hidden lg:flex items-center justify-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/25">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-serif font-bold text-xl text-white tracking-wide">SETU</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-5">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">
                  {mode === 'signup' ? 'Get started for free' : 'Welcome back'}
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
                {mode === 'signup' ? 'Create Your Account' : 'Sign In'}
              </h2>
              <p className="text-white/40 text-sm">
                Foundation for Class 6–12. Built for JEE, NEET & CUET.
              </p>
            </div>

            {/* Auth Card */}
            <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl p-7 sm:p-8 border border-white/[0.07] shadow-2xl shadow-black/20">
              {/* Back button */}
              {(mode === 'phone' || mode === 'otp' || mode === 'forgot-password') && (
                <button onClick={() => setMode('login')} className="flex items-center gap-2 text-white/40 hover:text-white/70 mb-5 transition-colors text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </button>
              )}

              {/* Social logins */}
              {(mode === 'login' || mode === 'signup') && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Button type="button" variant="outline"
                      className="h-12 gap-2.5 border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] rounded-xl text-sm font-medium transition-all duration-200"
                      onClick={handleGoogleAuth} disabled={loading}
                    >
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Google
                    </Button>
                    <Button type="button" variant="outline"
                      className="h-12 gap-2.5 border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] rounded-xl text-sm font-medium transition-all duration-200"
                      onClick={handleAppleAuth} disabled={loading}
                    >
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                      Apple
                    </Button>
                  </div>

                  <Button type="button" variant="outline"
                    className="w-full h-12 gap-2.5 border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] rounded-xl text-sm font-medium transition-all duration-200"
                    onClick={() => setMode('phone')} disabled={loading}
                  >
                    <Phone className="h-4 w-4" /> Continue with Phone
                  </Button>

                  <div className="my-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
                    <span className="text-[11px] text-white/25 uppercase tracking-[0.15em] font-medium">or continue with email</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
                  </div>
                </>
              )}

              {/* Email form */}
              {(mode === 'login' || mode === 'signup') && (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white/50 text-xs font-medium uppercase tracking-wider">Full Name</Label>
                      <Input id="fullName" type="text" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="h-12 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-accent/50 focus:ring-accent/10 focus:bg-white/[0.06] transition-all" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/50 text-xs font-medium uppercase tracking-wider">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="email" type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => { setEmail(e.target.value); if (errors.email) validateEmail(e.target.value); }}
                        onBlur={() => email && validateEmail(email)}
                        className="h-12 pl-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-accent/50 focus:ring-accent/10 focus:bg-white/[0.06] transition-all" />
                    </div>
                    {errors.email && <p className="text-xs text-red-400/80 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-white/50 text-xs font-medium uppercase tracking-wider">Password</Label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => setMode('forgot-password')} className="text-[11px] text-accent/70 hover:text-accent transition-colors">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                        onChange={(e) => { setPassword(e.target.value); if (errors.password) validatePassword(e.target.value); }}
                        onBlur={() => password && validatePassword(password)}
                        className="h-12 pr-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-accent/50 focus:ring-accent/10 focus:bg-white/[0.06] transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-white/35">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:shadow-xl hover:shadow-accent/25 mt-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
                  </Button>

                  <p className="text-center text-sm text-white/35 pt-2">
                    {mode === 'login' ? (
                      <>Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-accent font-semibold hover:underline underline-offset-2">Sign up</button></>
                    ) : (
                      <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-accent font-semibold hover:underline underline-offset-2">Sign in</button></>
                    )}
                  </p>
                </form>
              )}

              {/* Phone */}
              {mode === 'phone' && (
                <form onSubmit={handlePhoneAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/50 text-xs font-medium uppercase tracking-wider">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone}
                        onChange={(e) => { setPhone(e.target.value); if (errors.phone) validatePhone(e.target.value); }}
                        onBlur={() => phone && validatePhone(phone)}
                        className="h-12 pl-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-accent/50 focus:ring-accent/10 focus:bg-white/[0.06] transition-all" />
                    </div>
                    {errors.phone && <p className="text-xs text-red-400/80">{errors.phone}</p>}
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg shadow-accent/20" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                  </Button>
                </form>
              )}

              {/* OTP */}
              {mode === 'otp' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <p className="text-sm text-white/50 mb-5">Enter the 6-digit code sent to <span className="text-white/80 font-medium">{phone}</span></p>
                  </div>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={handleVerifyOTP} className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg shadow-accent/20" disabled={loading || otp.length !== 6}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify OTP'}
                  </Button>
                  <p className="text-center text-xs text-white/40">
                    Didn't receive it? <button onClick={() => handlePhoneAuth({ preventDefault: () => { } } as React.FormEvent)} className="text-accent hover:underline" disabled={loading}>Resend</button>
                  </p>
                </div>
              )}

              {/* Forgot Password */}
              {mode === 'forgot-password' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center mb-3">
                    <h3 className="font-serif text-xl font-bold text-white mb-1.5">Reset Password</h3>
                    <p className="text-sm text-white/40">We'll send you a magic link to reset</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-white/50 text-xs font-medium uppercase tracking-wider">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="reset-email" type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => { setEmail(e.target.value); if (errors.email) validateEmail(e.target.value); }}
                        onBlur={() => email && validateEmail(email)}
                        className="h-12 pl-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-accent/50 focus:ring-accent/10 focus:bg-white/[0.06] transition-all" />
                    </div>
                    {errors.email && <p className="text-xs text-red-400/80">{errors.email}</p>}
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg shadow-accent/20" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                  </Button>
                  <p className="text-center text-xs text-white/35 pt-1">
                    Remember? <button type="button" onClick={() => setMode('login')} className="text-accent font-semibold hover:underline">Sign in</button>
                  </p>
                </form>
              )}
            </div>

            {/* Security badge */}
            <div className="mt-5 flex items-center justify-center gap-2 text-white/15">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-[10px] tracking-wide">Secured with Supabase Auth • 256-bit encryption</span>
            </div>
          </div>
        </main>

        <footer className="relative z-10 p-4 text-center">
          <p className="text-[11px] text-white/15">
            By continuing, you agree to our <button className="hover:text-white/30 underline underline-offset-2 transition-colors">Terms of Service</button> and <button className="hover:text-white/30 underline underline-offset-2 transition-colors">Privacy Policy</button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage;
