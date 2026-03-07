import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, Phone, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Check, BookOpen, GraduationCap, Sparkles, Rocket, Zap, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number');

type AuthMode = 'login' | 'signup' | 'phone' | 'otp' | 'forgot-password';
type OnboardingStep = 0 | 1 | 2 | 3;
type ProgramType = 'foundation' | 'jee_core' | 'jee_advanced' | '';

interface OnboardingData {
  program: ProgramType;
  studentClass: string;
  examGoal: string;
}

const PROGRAM_OPTIONS = [
  {
    value: 'foundation' as ProgramType,
    label: 'SETU Foundation',
    desc: 'Conceptual learning in Maths & Science',
    badge: 'Classes 6–10',
    emoji: '🧠',
    icon: Brain,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    accentColor: 'text-emerald-400',
  },
  {
    value: 'jee_core' as ProgramType,
    label: 'SETU JEE Core',
    desc: 'JEE Main + Advanced fundamentals',
    badge: 'Class 11',
    emoji: '🚀',
    icon: Rocket,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-400',
  },
  {
    value: 'jee_advanced' as ProgramType,
    label: 'SETU JEE Advanced',
    desc: 'Advanced problem solving & full mock tests',
    badge: 'Class 12',
    emoji: '⚡',
    icon: Zap,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    accentColor: 'text-violet-400',
  },
];

const FOUNDATION_CLASS_OPTIONS = [
  { value: '6', label: 'Class 6', emoji: '🌱', tag: 'Foundation' },
  { value: '7', label: 'Class 7', emoji: '🌿', tag: 'Foundation' },
  { value: '8', label: 'Class 8', emoji: '📐', tag: 'Foundation' },
  { value: '9', label: 'Class 9', emoji: '📖', tag: 'Board Prep' },
  { value: '10', label: 'Class 10', emoji: '🎯', tag: 'Board Prep' },
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

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    program: '',
    studentClass: '',
    examGoal: '',
  });

  useEffect(() => {
    if (user && !authLoading) {
      if (showOnboarding) return;
      if (profile && !profile.class) {
        setShowOnboarding(true);
      } else if (profile?.class) {
        navigate('/dashboard');
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
        toast.success('Account created! Let\'s set up your learning profile 🎯');
        setShowOnboarding(true);
        setOnboardingStep(1);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong, please try again');
    } finally { setLoading(false); }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try { await signInWithGoogle(); } catch (error: any) { toast.error(error.message || 'Google login failed'); setLoading(false); }
  };
  const handleAppleAuth = async () => {
    setLoading(true);
    try { await signInWithApple(); } catch (error: any) { toast.error(error.message || 'Apple login failed'); setLoading(false); }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    setLoading(true);
    try { await signInWithPhone(phone); toast.success('OTP sent! Check your phone.'); setMode('otp'); }
    catch (error: any) { toast.error(error.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try { await verifyOTP(phone, otp); } catch (error: any) { toast.error(error.message || 'Invalid OTP'); }
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
    } catch (error: any) { toast.error(error.message || 'Failed to send reset link'); }
    finally { setLoading(false); }
  };

  const isFoundationProgram = () => onboardingData.program === 'foundation';

  const getStudentLevel = () => {
    const cls = parseInt(onboardingData.studentClass);
    if (isNaN(cls)) return '11-12';
    if (cls <= 8) return '6-8';
    if (cls <= 10) return '9-10';
    return '11-12';
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      let examGoal = 'Foundation';
      let studentClass = onboardingData.studentClass;

      if (onboardingData.program === 'jee_core') {
        examGoal = 'JEE Main';
        studentClass = '11';
      } else if (onboardingData.program === 'jee_advanced') {
        examGoal = 'JEE Main';
        studentClass = '12';
      }

      if (examGoal === 'JEE Main') setExamMode('jee');
      else setExamMode('jee'); // Foundation mode handled by ClassContext

      const studentLevel = getStudentLevel();

      await new Promise(resolve => setTimeout(resolve, 500));
      await updateProfile({
        target_exam: examGoal,
        class: studentClass,
        student_level: studentLevel,
      });

      // Also store program in user metadata
      await supabase.auth.updateUser({
        data: { program: onboardingData.program }
      });

      toast.success('All set! Let\'s begin your journey 🚀');
      navigate('/diagnostic-test');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error('Profile update failed, please try again');
    } finally { setLoading(false); }
  };

  const handleOnboardingNext = () => {
    // Step 1: Program selection
    if (onboardingStep === 1 && !onboardingData.program) {
      toast.error('Please select your program');
      return;
    }
    // Step 2: Class selection (Foundation only)
    if (onboardingStep === 2 && !onboardingData.studentClass) {
      toast.error('Please select your class');
      return;
    }

    if (onboardingStep === 1) {
      if (isFoundationProgram()) {
        setOnboardingStep(2); // Go to class selection
      } else {
        handleOnboardingComplete(); // JEE Core/Advanced auto-completes
      }
    } else if (onboardingStep === 2) {
      handleOnboardingComplete();
    }
  };

  const totalSteps = isFoundationProgram() ? 2 : 1;

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
  if (showOnboarding && user) {
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
              {/* Step 1: Program Selection */}
              {onboardingStep === 1 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">Step 1 of {totalSteps}</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                      Choose your Program
                    </h2>
                    <p className="text-white/50 text-sm">
                      Your entire learning journey adapts to this
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PROGRAM_OPTIONS.map((prog) => {
                      const selected = onboardingData.program === prog.value;
                      const IconComp = prog.icon;
                      return (
                        <button
                          key={prog.value}
                          onClick={() => setOnboardingData(prev => ({ ...prev, program: prog.value, studentClass: '', examGoal: '' }))}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 group
                            ${selected
                              ? `${prog.borderColor} bg-gradient-to-br ${prog.color} shadow-lg`
                              : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prog.color} flex items-center justify-center shrink-0`}>
                              <IconComp className={`w-6 h-6 ${selected ? prog.accentColor : 'text-white/60'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-white text-base">{prog.label}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${selected ? `${prog.accentColor} bg-white/10` : 'text-white/30 bg-white/5'}`}>
                                  {prog.badge}
                                </span>
                              </div>
                              <span className="text-sm text-white/50">{prog.desc}</span>
                            </div>
                            {selected && (
                              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                                <Check className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Foundation Class Selection */}
              {onboardingStep === 2 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Step 2 of 2</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                      What class are you in?
                    </h2>
                    <p className="text-white/50 text-sm">
                      We'll load the exact NCERT syllabus for your class
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {FOUNDATION_CLASS_OPTIONS.map((cls) => {
                      const selected = onboardingData.studentClass === cls.value;
                      return (
                        <button
                          key={cls.value}
                          onClick={() => setOnboardingData(prev => ({ ...prev, studentClass: cls.value }))}
                          className={`relative p-3.5 rounded-2xl border-2 text-left transition-all duration-200 group
                            ${selected
                              ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                              : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cls.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-white text-sm block">{cls.label}</span>
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${selected ? 'text-emerald-400' : 'text-white/30'}`}>
                                {cls.tag}
                              </span>
                            </div>
                            {selected && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
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

              {/* Nav buttons */}
              <div className="flex items-center gap-3 mt-7">
                {onboardingStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setOnboardingStep((prev) => (prev - 1) as OnboardingStep)}
                    className="flex-1 h-12 rounded-xl border-white/15 text-white hover:bg-white/10 bg-transparent"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                )}
                <Button
                  onClick={handleOnboardingNext}
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white font-semibold shadow-lg shadow-accent/25 transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : onboardingStep === 2 ? (
                    <>Start Diagnostic Test <ArrowRight className="h-4 w-4 ml-2" /></>
                  ) : isFoundationProgram() ? (
                    <>Select Class <ArrowRight className="h-4 w-4 ml-2" /></>
                  ) : (
                    <>Start Diagnostic Test <ArrowRight className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>

            {/* Program hint */}
            {onboardingStep === 1 && onboardingData.program === 'foundation' && (
              <div className="mt-5 flex items-start gap-3 bg-emerald-500/[0.08] rounded-2xl p-4 border border-emerald-500/15">
                <span className="text-lg mt-0.5">🧠</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-emerald-400 font-medium">SETU Foundation:</span> Build strong fundamentals in Maths & Science from Class 6–10. Perfect preparation for JEE, NEET & Olympiads — without competitive pressure.
                </p>
              </div>
            )}
            {onboardingStep === 1 && onboardingData.program === 'jee_core' && (
              <div className="mt-5 flex items-start gap-3 bg-amber-500/[0.08] rounded-2xl p-4 border border-amber-500/15">
                <span className="text-lg mt-0.5">🚀</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-amber-400 font-medium">JEE Core (Class 11):</span> Master Physics, Chemistry & Mathematics fundamentals with a structured 21-day cycle approach.
                </p>
              </div>
            )}
            {onboardingStep === 1 && onboardingData.program === 'jee_advanced' && (
              <div className="mt-5 flex items-start gap-3 bg-violet-500/[0.08] rounded-2xl p-4 border border-violet-500/15">
                <span className="text-lg mt-0.5">⚡</span>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-violet-400 font-medium">JEE Advanced (Class 12):</span> Advanced problem solving, full mock tests, and targeted weak-area elimination for top-tier ranks.
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-accent/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 p-5 sm:p-6">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20">
              <BookOpen className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-serif font-bold text-lg text-white tracking-wide">SETU</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Welcome */}
          <div className="text-center mb-7">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              {mode === 'signup' ? 'Start Your Journey' : 'Welcome Back'}
            </h2>
            <p className="text-white/45 text-sm">
              Class 6–12 Academics • JEE • NEET • CUET
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
            {/* Back button */}
            {(mode === 'phone' || mode === 'otp' || mode === 'forgot-password') && (
              <button onClick={() => setMode('login')} className="flex items-center gap-2 text-white/40 hover:text-white/70 mb-5 transition-colors text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>
            )}

            {/* Social */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <Button type="button" variant="outline" className="h-11 gap-2 border-white/10 text-white hover:bg-white/10 bg-white/[0.04] rounded-xl text-sm" onClick={handleGoogleAuth} disabled={loading}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="h-11 gap-2 border-white/10 text-white hover:bg-white/10 bg-white/[0.04] rounded-xl text-sm" onClick={handleAppleAuth} disabled={loading}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                    Apple
                  </Button>
                </div>

                <Button type="button" variant="outline" className="w-full h-11 gap-2 border-white/10 text-white hover:bg-white/10 bg-white/[0.04] rounded-xl text-sm" onClick={() => setMode('phone')} disabled={loading}>
                  <Phone className="h-4 w-4" /> Continue with Phone
                </Button>

                <div className="my-5 flex items-center gap-3">
                  <Separator className="flex-1 bg-white/[0.08]" />
                  <span className="text-xs text-white/30 uppercase tracking-wider">or</span>
                  <Separator className="flex-1 bg-white/[0.08]" />
                </div>
              </>
            )}

            {/* Email form */}
            {(mode === 'login' || mode === 'signup') && (
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-white/60 text-xs">Full Name</Label>
                    <Input id="fullName" type="text" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="h-11 rounded-xl bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-accent focus:ring-accent/20" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/60 text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <Input id="email" type="email" placeholder="email@example.com" value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) validateEmail(e.target.value); }}
                      onBlur={() => email && validateEmail(email)}
                      className="h-11 pl-10 rounded-xl bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-accent" />
                  </div>
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-white/60 text-xs">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) validatePassword(e.target.value); }}
                      onBlur={() => password && validatePassword(password)}
                      className="h-11 pr-10 rounded-xl bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-accent" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-white/40">{errors.password}</p>}
                </div>

                {mode === 'login' && (
                  <div className="text-right">
                    <button type="button" onClick={() => setMode('forgot-password')} className="text-xs text-accent/80 hover:text-accent hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white shadow-lg shadow-accent/20" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </Button>

                <p className="text-center text-xs text-white/40 pt-1">
                  {mode === 'login' ? (
                    <>New here? <button type="button" onClick={() => setMode('signup')} className="text-accent font-medium hover:underline">Create account</button></>
                  ) : (
                    <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-accent font-medium hover:underline">Sign in</button></>
                  )}
                </p>
              </form>
            )}

            {/* Phone */}
            {mode === 'phone' && (
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-white/60 text-xs">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone}
                      onChange={(e) => { setPhone(e.target.value); if (errors.phone) validatePhone(e.target.value); }}
                      onBlur={() => phone && validatePhone(phone)}
                      className="h-11 pl-10 rounded-xl bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-accent" />
                  </div>
                  {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg shadow-accent/20" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                </Button>
              </form>
            )}

            {/* OTP */}
            {mode === 'otp' && (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-white/50 mb-4">Enter the 6-digit code sent to {phone}</p>
                </div>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button onClick={handleVerifyOTP} className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg shadow-accent/20" disabled={loading || otp.length !== 6}>
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
                  <p className="text-sm text-white/45">We'll send you a reset link</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email" className="text-white/60 text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <Input id="reset-email" type="email" placeholder="email@example.com" value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) validateEmail(e.target.value); }}
                      onBlur={() => email && validateEmail(email)}
                      className="h-11 pl-10 rounded-xl bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-accent" />
                  </div>
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg shadow-accent/20" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                </Button>
                <p className="text-center text-xs text-white/40 pt-1">
                  Remember? <button type="button" onClick={() => setMode('login')} className="text-accent font-medium hover:underline">Sign in</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-4 text-center">
        <p className="text-[11px] text-white/20">By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </footer>
    </div>
  );
};

export default AuthPage;
