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
import { Mail, Phone, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number');

type AuthMode = 'login' | 'signup' | 'phone' | 'otp' | 'forgot-password';
type OnboardingStep = 0 | 1 | 2 | 3;

interface OnboardingData {
  studentClass: string;
  examGoal: string;
}

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

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    studentClass: '',
    examGoal: '',
  });

  // Check if user needs onboarding
  // We check profile.class because target_exam has a DB default ('JEE Main'),
  // so Google OAuth users would skip onboarding otherwise.
  useEffect(() => {
    if (user && !authLoading) {
      if (showOnboarding) return; // Already in onboarding, don't redirect
      if (profile && !profile.class) {
        // Profile exists but onboarding wasn't completed (class is only set during onboarding)
        setShowOnboarding(true);
      } else if (profile?.class) {
        // Onboarding was completed — go to dashboard
        navigate('/dashboard');
      }
      // If profile is null (still loading from trigger), wait for next render
    }
  }, [user, profile, authLoading, navigate, showOnboarding]);

  const validateEmail = (value: string) => {
    try {
      emailSchema.parse(value);
      setErrors(prev => ({ ...prev, email: '' }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, email: e.errors[0].message }));
      }
      return false;
    }
  };

  const validatePassword = (value: string) => {
    try {
      passwordSchema.parse(value);
      setErrors(prev => ({ ...prev, password: '' }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, password: e.errors[0].message }));
      }
      return false;
    }
  };

  const validatePhone = (value: string) => {
    try {
      phoneSchema.parse(value);
      setErrors(prev => ({ ...prev, phone: '' }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, phone: e.errors[0].message }));
      }
      return false;
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email) || !validatePassword(password)) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, fullName);
        toast.success('Account ban gaya! Ab thoda apne baare mein batao.');
        setShowOnboarding(true);
        setOnboardingStep(1);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      toast.error(error.message || 'Kuch gadbad ho gayi, phir try karo');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google login mein problem hai');
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } catch (error: any) {
      toast.error(error.message || 'Apple login mein problem hai');
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone)) return;

    setLoading(true);
    try {
      await signInWithPhone(phone);
      toast.success('OTP bhej diya! Check karo.');
      setMode('otp');
    } catch (error: any) {
      toast.error(error.message || 'OTP bhejne mein problem hui');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Poora OTP daalo');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phone, otp);
    } catch (error: any) {
      toast.error(error.message || 'OTP galat hai, check karo');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success('Password reset link sent! Check your email.');
      setMode('login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const isFoundationClass = () => {
    const cls = parseInt(onboardingData.studentClass);
    return !isNaN(cls) && cls >= 6 && cls <= 10;
  };

  const getStudentLevel = () => {
    const cls = parseInt(onboardingData.studentClass);
    if (isNaN(cls)) return '11-12'; // dropper
    if (cls <= 8) return '6-8';
    if (cls <= 10) return '9-10';
    return '11-12';
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      const studentLevel = getStudentLevel();
      const examGoal = isFoundationClass() ? 'Foundation' : onboardingData.examGoal;
      
      // Set exam mode based on goal
      if (examGoal === 'NEET') {
        setExamMode('neet');
      } else if (examGoal === 'CUET') {
        setExamMode('cuet');
      } else {
        setExamMode('jee');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      await updateProfile({
        target_exam: examGoal,
        class: onboardingData.studentClass,
        student_level: studentLevel,
      });
      toast.success('Chalo shuru karte hain! 🎯');
      navigate('/diagnostic-test');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error('Profile update mein problem hui, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === 1 && !onboardingData.studentClass) {
      toast.error('Please select your class');
      return;
    }
    if (onboardingStep === 2 && !onboardingData.examGoal) {
      toast.error('Please select your goal');
      return;
    }

    if (onboardingStep === 1) {
      if (isFoundationClass()) {
        // Class 6-10: skip goal selection, go straight to complete
        handleOnboardingComplete();
      } else {
        // Class 11-12 / Dropper: show goal selection
        setOnboardingStep(2);
      }
    } else if (onboardingStep === 2) {
      handleOnboardingComplete();
    }
  };

  const totalSteps = isFoundationClass() || !onboardingData.studentClass ? 1 : 2;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Onboarding Flow
  if (showOnboarding && user) {
    return (
      <div className="min-h-screen bg-setu-navy relative overflow-hidden flex flex-col">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>

        {/* Header */}
        <header className="relative z-10 p-4 sm:p-6">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-primary font-bold text-sm">S</span>
            </div>
            <span className="font-serif font-semibold text-white">SETU</span>
          </div>
        </header>

        {/* Onboarding Content */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${step <= onboardingStep ? 'bg-accent' : 'bg-white/15'}`}
                />
              ))}
            </div>

            <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              {/* Step 1: Class Selection */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-white mb-2">
                      Choose Your Current Class
                    </h2>
                    <p className="text-white/60">
                      This determines your entire learning experience.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: '6', label: 'Class 6', emoji: '🌱' },
                      { value: '7', label: 'Class 7', emoji: '🌿' },
                      { value: '8', label: 'Class 8', emoji: '📐' },
                      { value: '9', label: 'Class 9', emoji: '📖' },
                      { value: '10', label: 'Class 10', emoji: '🎯' },
                      { value: '11', label: 'Class 11', emoji: '🚀' },
                      { value: '12', label: 'Class 12', emoji: '⚡' },
                      { value: 'dropper', label: 'Dropper', emoji: '💪' },
                    ].map((cls) => (
                      <button
                        key={cls.value}
                        onClick={() => setOnboardingData(prev => ({ ...prev, studentClass: cls.value, examGoal: '' }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${onboardingData.studentClass === cls.value
                          ? 'border-accent bg-accent/10'
                          : 'border-white/10 hover:border-white/25 bg-white/[0.03]'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cls.emoji}</span>
                          <span className="font-medium text-white text-sm">{cls.label}</span>
                          {onboardingData.studentClass === cls.value && (
                            <Check className="h-4 w-4 text-accent ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Goal Selection (Only for 11-12 / Dropper) */}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-white mb-2">
                      Select Your Goal
                    </h2>
                    <p className="text-white/60">
                      This shapes your syllabus, tests, and roadmap.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { value: 'JEE Main', label: 'JEE Preparation', desc: 'NIT, IIIT, IIT admissions', emoji: '⚡' },
                      { value: 'NEET', label: 'NEET Preparation', desc: 'Medical college admissions', emoji: '🧬' },
                      { value: 'CUET', label: 'CUET Preparation', desc: 'Central university admissions', emoji: '🎯' },
                      { value: 'Foundation', label: 'School + Boards Focus', desc: 'Excel in academics first', emoji: '📚' },
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setOnboardingData(prev => ({ ...prev, examGoal: goal.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${onboardingData.examGoal === goal.value
                          ? 'border-accent bg-accent/10'
                          : 'border-white/10 hover:border-white/25 bg-white/[0.03]'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{goal.emoji}</span>
                            <div>
                              <span className="font-medium text-white">{goal.label}</span>
                              <p className="text-sm text-white/50">{goal.desc}</p>
                            </div>
                          </div>
                          {onboardingData.examGoal === goal.value && (
                            <Check className="h-5 w-5 text-accent" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-8">
                {onboardingStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setOnboardingStep((prev) => (prev - 1) as OnboardingStep)}
                    className="flex-1 h-12 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleOnboardingNext}
                  disabled={loading}
                  className="flex-1 h-12 bg-accent hover:bg-accent/90 text-primary font-semibold"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (onboardingStep === 1 && isFoundationClass()) || onboardingStep === 2 ? (
                    "Take Diagnostic Test 🧠"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Foundation info for Class 6-10 */}
            {onboardingStep === 1 && isFoundationClass() && (
              <div className="mt-6 bg-white/[0.04] rounded-xl p-4 border border-white/10">
                <p className="text-white/70 text-sm leading-relaxed">
                  🧠 <span className="text-accent font-medium">Foundation Mode:</span> We'll take a short diagnostic test to identify your strong and weak concepts, then build a personalized learning roadmap.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-setu-navy relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-primary font-bold text-sm">S</span>
            </div>
            <span className="font-serif font-semibold text-white">SETU</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-2">
              Personalized Learning Mode
            </h2>
            <p className="text-white/60">
              For Class 6–12 academics and JEE, NEET & CUET preparation.
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {/* Back button for phone/otp/forgot-password modes */}
            {(mode === 'phone' || mode === 'otp' || mode === 'forgot-password') && (
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to login</span>
              </button>
            )}

            {/* Social Login Buttons */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base gap-3 mb-3 border-white/15 text-white hover:bg-white/10 bg-white/[0.04]"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base gap-3 mb-3 border-white/15 text-white hover:bg-white/10 bg-white/[0.04]"
                  onClick={handleAppleAuth}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base gap-3 border-white/15 text-white hover:bg-white/10 bg-white/[0.04]"
                  onClick={() => setMode('phone')}
                  disabled={loading}
                >
                  <Phone className="h-5 w-5" />
                  Continue with Phone
                </Button>

                <div className="my-6 flex items-center gap-4">
                  <Separator className="flex-1 bg-white/10" />
                  <span className="text-sm text-white/40">or</span>
                  <Separator className="flex-1 bg-white/10" />
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            {/* Email/Password Form */}
            {(mode === 'login' || mode === 'signup') && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-accent"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) validateEmail(e.target.value);
                      }}
                      onBlur={() => email && validateEmail(email)}
                      className="h-12 pl-10 border-2 bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-accent"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) validatePassword(e.target.value);
                      }}
                      onBlur={() => password && validatePassword(password)}
                      className="h-12 pr-10 bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-white/50">{errors.password}</p>
                  )}
                </div>

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-sm text-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-primary shadow-lg shadow-accent/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : mode === 'signup' ? (
                    'Create Account'
                  ) : (
                    'Continue with Email'
                  )}
                </Button>

                {/* Toggle Login/Signup */}
                <p className="text-center text-sm text-white/50 pt-2">
                  {mode === 'login' ? (
                    <>
                      New here?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="text-accent font-medium hover:underline"
                      >
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-accent font-medium hover:underline"
                      >
                        Login
                      </button>
                    </>
                  )}
                </p>
              </form>
            )}

            {/* Phone Form */}
            {mode === 'phone' && (
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) validatePhone(e.target.value);
                      }}
                      onBlur={() => phone && validatePhone(phone)}
                      className="h-12 pl-10 border-2 bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-accent"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-400">{errors.phone}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-primary shadow-lg shadow-accent/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            )}

            {/* OTP Form */}
            {mode === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-white/60 mb-4">
                    Enter the 6-digit code sent to {phone}
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-primary shadow-lg shadow-accent/20"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <p className="text-center text-sm text-white/50">
                  Didn't receive it?{' '}
                  <button
                    onClick={() => handlePhoneAuth({ preventDefault: () => { } } as React.FormEvent)}
                    className="text-accent hover:underline"
                    disabled={loading}
                  >
                    Resend
                  </button>
                </p>
              </div>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-serif text-xl font-semibold text-white mb-2">
                    Reset your password
                  </h3>
                  <p className="text-sm text-white/60">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) validateEmail(e.target.value);
                      }}
                      onBlur={() => email && validateEmail(email)}
                      className="h-12 pl-10 border-2 bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-accent"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-primary shadow-lg shadow-accent/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <p className="text-center text-sm text-white/50 pt-2">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-accent font-medium hover:underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center">
        <p className="text-xs text-white/30">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;
