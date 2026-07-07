import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { 
  Mail, Phone, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Check, 
  BookOpen, GraduationCap, Sparkles, Rocket, Zap, Brain, Users, Building, 
  ShieldCheck, XCircle, Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { EXAM_CONFIG, STREAM_TO_EXAM } from '@/config/examConfig';
import { cn } from '@/lib/utils';
import { BatchWelcomeScreen } from '@/components/batch/BatchWelcomeScreen';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number');

type AuthMode = 'login' | 'signup' | 'phone' | 'otp' | 'forgot-password';
type OnboardingStep = 0 | 1 | 2 | 3 | 4;
type StreamType = 'foundation' | 'jee' | 'neet' | 'cuet' | 'commerce' | '';

interface OnboardingData {
  userType: 'student' | 'teacher';
  institutionName?: string;
  referenceCode?: string;
  stream: StreamType;
  studentClass: string;
  examGoal: string;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, profile, refreshProfile, signInWithEmail, signUpWithEmail, 
    signInWithGoogle, signInWithApple, signInWithPhone, verifyOTP, 
    updateProfile, loading: authLoading, profileLoading
  } = useAuth();
  const { setExamMode } = useExamMode();

  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => {
    const modeParam = searchParams.get('mode');
    return modeParam === 'signup' ? 'signup' : 'login';
  });

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup' || modeParam === 'login') {
      setMode(modeParam as AuthMode);
    }
  }, [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Join-code validation state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinCodeState, setJoinCodeState] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [joinCodeResult, setJoinCodeResult] = useState<{
    batch_id: string;
    batch_name: string;
    teacher_name: string;
    exam_type: string;
    stream: string;
    subject: string;
    total_students: number;
  } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    return {
      userType: 'student',
      stream: '',
      studentClass: '',
      examGoal: '',
    };
  });

  useEffect(() => {
    // Wait for both auth and profile loading to complete before making routing decisions
    if (user && !authLoading && !profileLoading) {
      if (showOnboarding || showWelcome) return;

      if (profile) {
        if (profile.class) {
          navigate('/student-hub', { replace: true });
          return;
        } else {
          console.log("Incomplete student profile, staying in onboarding.");
          setShowOnboarding(true);
          return;
        }
      } else {
        // profile is null (not loading anymore) -> need onboarding
        console.log("No profile found after load, showing onboarding.");
        setShowOnboarding(true);
        return;
      }
    }
  }, [user, profile, authLoading, profileLoading, navigate, showOnboarding, showWelcome]);

  const validateEmail = (value: string) => {
    try { 
      emailSchema.parse(value); 
      setErrors(prev => ({ ...prev, email: '' })); 
      return true; 
    } catch (e) { 
      if (e instanceof z.ZodError) setErrors(prev => ({ ...prev, email: e.errors[0].message })); 
      return false; 
    }
  };

  const validatePassword = (value: string) => {
    try { 
      passwordSchema.parse(value); 
      setErrors(prev => ({ ...prev, password: '' })); 
      return true; 
    } catch (e) { 
      if (e instanceof z.ZodError) setErrors(prev => ({ ...prev, password: e.errors[0].message })); 
      return false; 
    }
  };

  const validatePhone = (value: string) => {
    try { 
      phoneSchema.parse(value); 
      setErrors(prev => ({ ...prev, phone: '' })); 
      return true; 
    } catch (e) { 
      if (e instanceof z.ZodError) setErrors(prev => ({ ...prev, phone: e.errors[0].message })); 
      return false; 
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Apple authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }
        await handleUnifiedSignup();
      } else {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      // Check if it requires email verification
      if (error?.message?.includes('Email not confirmed')) {
        setVerificationEmail(email);
        setAwaitingVerification(true);
      } else {
        toast.error(error instanceof Error ? error.message : 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    setLoading(true);
    try {
      await signInWithPhone(phone);
      toast.success('OTP sent successfully!');
      setMode('otp');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      await verifyOTP(phone, otp);
      toast.success('OTP verified successfully!');
      
      // Sync sessions
      await new Promise(r => setTimeout(r, 600));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleOnboardingComplete();
      } else {
        navigate('/student-hub');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid OTP'); 
    } finally {
      setLoading(false);
    }
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
    } catch (error) { 
      toast.error(error instanceof Error ? error.message : 'Failed to send reset link'); 
    } finally {
      setLoading(false);
    }
  };

  const getExamGoalFromStream = (stream: StreamType): string => {
    return STREAM_TO_EXAM[stream as string] ?? 'JEE Main';
  };

  const handleUnifiedSignup = async () => {
    if (!fullName.trim()) { toast.error('Enter your name'); return; }
    if (!validateEmail(email)) { toast.error('Enter a valid email'); return; }
    if (!validatePassword(password)) { toast.error('Password must be at least 6 characters'); return; }
    
    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, user_type: onboardingData.userType } }
      });
      
      if (signUpError) {
        if (signUpError.message.includes('already')) {
          await signInWithEmail(email, password);
        } else {
          throw signUpError;
        }
      }

      await new Promise(r => setTimeout(r, 800));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await signInWithEmail(email, password);
        await new Promise(r => setTimeout(r, 500));
      }

      toast.success('Account ready! Finalizing your setup...');
      await handleOnboardingComplete();

    } catch (error: any) {
      const msg = error.message || 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      const stream = onboardingData.stream as StreamType;
      const examGoal = getExamGoalFromStream(onboardingData.stream as StreamType);
      const studentClass = onboardingData.studentClass || '11';

      if (stream === 'jee') setExamMode('jee');
      else if (stream === 'neet') setExamMode('neet');
      else if (stream === 'cuet') setExamMode('cuet');
      else setExamMode('jee');

      await updateProfile({
        target_exam: examGoal,
        class: studentClass,
        student_level: 'Intermediate',
        user_type: 'student',
      });

      await refreshProfile();
      await supabase.auth.updateUser({ data: { target_exam: examGoal, user_type: 'student' } });

      // Inject Mock Task for first-time students
      const { data: latestProfile } = await supabase.from('profiles').select('id').single();
      if (latestProfile) {
        try {
          await supabase.from('assigned_tasks').insert({
            student_id: latestProfile.id,
            teacher_id: latestProfile.id,
            topic: examGoal === 'NEET' ? 'Cell Biology' : 'Kinematics',
            subtopic: examGoal === 'NEET' ? 'Cell Cycle and Cell Division' : 'Motion in 1D',
            status: 'pending',
            initial_accuracy: 45.5,
          });
        } catch (e) {
          console.warn('Mock task creation failed(non-fatal)');
        }
      }

      toast.success('All set! Let\'s begin your journey 🚀');
      navigate('/student-hub');

    } catch (error: any) {
      const errMsg = error.message || 'Profile setup failed. Please try again.';
      toast.error(`Onboarding failed: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── EMAIL VERIFICATION GATE ───
  if (awaitingVerification) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50/50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-1/4 w-[700px] h-[700px] rounded-full bg-blue-500/[0.02] blur-[150px]" />
          <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.02] blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.4]" style={{
            backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />
        </div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/80 p-7 sm:p-9 text-slate-800 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto">
              <Mail className="h-9 w-9 text-blue-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Check your inbox</h2>
              <p className="text-slate-500 text-sm">We sent a verification link to</p>
              <p className="text-blue-650 font-bold text-base">{verificationEmail}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 text-left space-y-3">
              {[
                { n: '1', text: 'Open the email from PrepEntrance' },
                { n: '2', text: 'Click "Verify your email"' },
                { n: '3', text: 'You\'ll be redirected back to sign in' },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-650 text-xs font-black">{s.n}</span>
                  </div>
                  <span className="text-slate-600 text-sm font-semibold">{s.text}</span>
                </div>
              ))}
            </div>

            <p className="text-slate-400 text-xs">Can't find it? Check your spam folder.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await supabase.auth.resend({ type: 'signup', email: verificationEmail });
                    toast.success('Verification email resent!');
                  } catch { toast.error('Could not resend email.'); }
                  finally { setLoading(false); }
                }}
                disabled={loading}
                className="w-full h-12 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-sm transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend verification email'}
              </button>
              <button
                onClick={() => { setAwaitingVerification(false); setMode('login'); }}
                className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
              >
                ← Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── WELCOME SCREEN (post batch-join) ───
  if (showWelcome && joinCodeResult) {
    const handleWelcomeContinue = async () => {
      await refreshProfile();
      navigate('/student-hub');
    };
    return (
      <BatchWelcomeScreen
        teacherName={joinCodeResult.teacher_name}
        batchName={joinCodeResult.batch_name}
        batchId={joinCodeResult.batch_id}
        totalStudents={joinCodeResult.total_students}
        onContinue={handleWelcomeContinue}
      />
    );
  }

  // ─── ONBOARDING FLOW ───
  if (showOnboarding) {
    const initialType = onboardingData.userType as 'student' | 'teacher' | undefined;
    const typeParam = searchParams.get('type');
    const computedInitialType = initialType || (typeParam as 'student' | 'teacher') || undefined;
    
    return (
      <OnboardingFlow
        initialUserType={computedInitialType}
        skipToJoinCode={!!computedInitialType}
      />
    );
  }

  // ─── LOGIN / SIGNUP MODAL PAGE ───
  if (user && !authLoading && profile?.class) {
    return null; // Skip rendering auth UI if redirecting
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-50/50">
      {/* Soft visual background glows matching the onboarding theme */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/4 w-[700px] h-[700px] rounded-full bg-blue-500/[0.02] blur-[150px]" />
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.02] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.4]" style={{
          backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/80 p-7 sm:p-9 relative text-slate-800">
          
          {/* Close button at top right */}
          <button 
            onClick={() => navigate('/')} 
            className="absolute right-6 top-6 p-1.5 rounded-full border border-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Central Illustration Graphic */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="42" fill="rgba(37, 99, 235, 0.03)" stroke="rgba(37, 99, 235, 0.05)" strokeWidth="1" />
                <circle cx="50" cy="50" r="32" fill="rgba(37, 99, 235, 0.05)" />
                {/* Smartphone device shape */}
                <rect x="36" y="24" width="28" height="52" rx="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
                <line x1="46" y1="28" x2="54" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                {/* Custom Blue Gradient Logo Overlay */}
                <circle cx="50" cy="50" r="11" fill="url(#blue-grad)" />
                <text x="47.2" y="54" fill="#ffffff" fontSize="11" fontWeight="950" fontFamily="sans-serif">P</text>
                <defs>
                  <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2 className="text-2xl font-black text-slate-905 tracking-tight leading-none mb-2">
              {mode === 'signup' ? 'Create Your Account' : (mode === 'login' ? 'Welcome Back' : 'Sign In')}
            </h2>
            <p className="text-slate-500 text-xs font-semibold max-w-xs leading-relaxed">
              Foundation for Class 6–12. Built for JEE, NEET & CUET.
            </p>
          </div>

          {/* Social Logins */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Button type="button" variant="outline"
                  className="h-12 gap-2.5 border-slate-205 text-slate-700 hover:bg-slate-50 bg-white rounded-xl text-sm font-semibold transition-all duration-200"
                  onClick={handleGoogleAuth} disabled={loading}
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google
                </Button>
                <Button type="button" variant="outline"
                  className="h-12 gap-2.5 border-slate-205 text-slate-700 hover:bg-slate-50 bg-white rounded-xl text-sm font-semibold transition-all duration-200"
                  onClick={handleAppleAuth} disabled={loading}
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                  Apple
                </Button>
              </div>

              <Button type="button" variant="outline"
                className="w-full h-12 gap-2.5 border-slate-205 text-slate-700 hover:bg-slate-50 bg-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-xs"
                onClick={() => setMode('phone')} disabled={loading}
              >
                <Phone className="h-4 w-4 text-blue-500" /> Continue with Phone
              </Button>

              <div className="my-5 flex items-center gap-4 select-none">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-bold">or continue with email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </>
          )}

          {/* Email/Password Form */}
          {(mode === 'login' || mode === 'signup') && (
            <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-slate-500 text-xs font-bold uppercase tracking-wider">Full Name</Label>
                  <Input id="fullName" type="text" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100 transition-all font-sans font-semibold text-sm" />
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-500 text-xs font-bold uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) validateEmail(e.target.value); }}
                    onBlur={() => email && validateEmail(email)}
                    className="h-12 pl-11 rounded-xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100 transition-all font-sans font-semibold text-sm" />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-bold flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-500 text-xs font-bold uppercase tracking-wider">Password</Label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot-password')} className="text-[11px] font-bold text-blue-600 hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) validatePassword(e.target.value); }}
                    onBlur={() => password && validatePassword(password)}
                    className="h-12 pr-11 rounded-xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100 transition-all font-sans font-semibold text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 transition-all duration-200 mt-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-slate-500 pt-2 font-semibold">
                {mode === 'login' ? (
                  <>Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-blue-600 font-bold hover:underline">Sign up</button></>
                ) : (
                  <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-blue-600 font-bold hover:underline">Sign in</button></>
                )}
              </p>
            </form>
          )}

          {/* Phone Form */}
          {mode === 'phone' && (
            <form onSubmit={handlePhoneAuth} className="space-y-4 text-left">
              <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 mb-3 transition-colors text-xs font-bold">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
              
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-500 text-xs font-bold uppercase tracking-wider">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (errors.phone) validatePhone(e.target.value); }}
                    onBlur={() => phone && validatePhone(phone)}
                    className="h-12 pl-11 rounded-xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100 transition-all font-sans font-semibold text-sm" />
                </div>
                {errors.phone && <p className="text-xs text-red-500 font-bold">{errors.phone}</p>}
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send OTP'}
              </Button>
            </form>
          )}

          {/* OTP Form */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5 text-center">
              <button type="button" onClick={() => setMode('phone')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 mb-3 transition-colors text-xs font-bold mx-auto">
                <ArrowLeft className="h-3.5 w-3.5" /> Change Phone Number
              </button>

              <p className="text-sm text-slate-500 font-semibold mb-4">Enter the 6-digit code sent to <span className="text-slate-800 font-bold">{phone}</span></p>
              
              <div className="flex justify-center my-4 font-sans font-bold">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} className="border-slate-200 text-slate-800 font-bold" />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button type="submit" className="w-full h-12 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10" disabled={loading || otp.length !== 6}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Verify OTP'}
              </Button>
              <p className="text-center text-xs text-slate-400 font-semibold">
                Didn't receive it? <button type="button" onClick={() => handlePhoneAuth({ preventDefault: () => { } } as React.FormEvent)} className="text-blue-600 font-bold hover:underline" disabled={loading}>Resend</button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
              <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 mb-3 transition-colors text-xs font-bold">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>

              <div className="text-center mb-3">
                <h3 className="text-lg font-black text-slate-900 mb-1">Reset Password</h3>
                <p className="text-xs font-semibold text-slate-400">We'll send you a link to reset your password</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-slate-500 text-xs font-bold uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <Input id="reset-email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) validateEmail(e.target.value); }}
                    onBlur={() => email && validateEmail(email)}
                    className="h-12 pl-11 rounded-xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100 transition-all font-sans font-semibold text-sm" />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email}</p>}
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {/* Privacy Terms Footer */}
          <div className="mt-8 text-center text-xs font-semibold text-slate-400 select-none leading-relaxed">
            By continuing you agree to our{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-bold">Terms of use</button>
            {' '}&{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-bold">Privacy Policy</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
