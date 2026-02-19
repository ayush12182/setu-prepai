import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  exam: string;
  class: string;
  weakSubject: string;
  dailyHours: string;
  coaching: string;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithPhone, verifyOTP, updateProfile, loading: authLoading } = useAuth();
  
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
    exam: '',
    class: '',
    weakSubject: '',
    dailyHours: '',
    coaching: '',
  });

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !authLoading) {
      // Check if profile is complete
      if (profile && !profile.target_exam) {
        setShowOnboarding(true);
      } else if (profile?.target_exam) {
        navigate('/dashboard');
      }
    }
  }, [user, profile, authLoading, navigate]);

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

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      // Set exam mode based on selection
      const isNeet = onboardingData.exam === 'NEET';
      localStorage.setItem('examMode', isNeet ? 'neet' : 'jee');
      
      await updateProfile({
        target_exam: onboardingData.exam,
        class: onboardingData.class as '11' | '12' | 'dropper',
      });
      toast.success('Chalo shuru karte hain! 🎯');
      navigate(isNeet ? '/dashboard' : '/dashboard');
    } catch (error: any) {
      toast.error('Profile update mein problem hui');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === 1 && !onboardingData.exam) {
      toast.error('Please select your target exam');
      return;
    }
    if (onboardingStep === 2 && !onboardingData.class) {
      toast.error('Please select your class');
      return;
    }
    if (onboardingStep === 3 && !onboardingData.dailyHours) {
      toast.error('Please select study hours');
      return;
    }
    if (onboardingStep === 4 && !onboardingData.coaching) {
      toast.error('Please select coaching status');
      return;
    }
    if (onboardingStep === 5 && !onboardingData.weakSubject) {
      toast.error('Please select your weak subject');
      return;
    }
    
    if (onboardingStep < 5) {
      setOnboardingStep((prev) => (prev + 1) as OnboardingStep);
    } else {
      handleOnboardingComplete();
    }
  };

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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-serif font-semibold text-foreground">SETU</span>
          </div>
        </header>

        {/* Onboarding Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    step <= onboardingStep ? 'bg-accent' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-card">
              {/* Step 1: Exam */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                      Which exam are you preparing for?
                    </h2>
                    <p className="text-text-secondary">
                      This helps us customize your syllabus and strategy.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: 'JEE Main', label: 'JEE Main', desc: 'NIT, IIIT, GFTI admissions' },
                      { value: 'JEE Advanced', label: 'JEE Advanced', desc: 'IIT admissions' },
                      { value: 'Both', label: 'Both Main + Advanced', desc: 'Complete JEE preparation' },
                      { value: 'NEET', label: 'NEET UG', desc: 'Medical college admissions' },
                    ].map((exam) => (
                      <button
                        key={exam.value}
                        onClick={() => setOnboardingData(prev => ({ ...prev, exam: exam.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          onboardingData.exam === exam.value
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-foreground">{exam.label}</span>
                            <p className="text-sm text-text-muted">{exam.desc}</p>
                          </div>
                          {onboardingData.exam === exam.value && (
                            <Check className="h-5 w-5 text-accent" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Class */}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                      Which class are you in?
                    </h2>
                    <p className="text-text-secondary">
                      Your study plan will be adjusted accordingly.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: '11', label: 'Class 11', desc: '2 years for complete preparation' },
                      { value: '12', label: 'Class 12', desc: onboardingData.exam === 'NEET' ? 'Board + NEET balance mode' : 'Board + JEE balance mode' },
                      { value: 'dropper', label: 'Dropper', desc: onboardingData.exam === 'NEET' ? 'Full focus on NEET' : 'Full focus on JEE' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setOnboardingData(prev => ({ ...prev, class: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          onboardingData.class === option.value
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-foreground">{option.label}</span>
                            <p className="text-sm text-text-muted">{option.desc}</p>
                          </div>
                          {onboardingData.class === option.value && (
                            <Check className="h-5 w-5 text-accent" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Daily Study Hours */}
              {onboardingStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                      How many hours can you study daily?
                    </h2>
                    <p className="text-text-secondary">
                      Be honest - we'll plan realistically.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: '2-4', label: '2-4 hours', desc: 'Part-time preparation' },
                      { value: '4-6', label: '4-6 hours', desc: 'Balanced schedule' },
                      { value: '6-8', label: '6-8 hours', desc: 'Serious preparation' },
                      { value: '8+', label: '8+ hours', desc: 'Full-time dedication' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setOnboardingData(prev => ({ ...prev, dailyHours: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          onboardingData.dailyHours === option.value
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-foreground">{option.label}</span>
                            <p className="text-sm text-text-muted">{option.desc}</p>
                          </div>
                          {onboardingData.dailyHours === option.value && (
                            <Check className="h-5 w-5 text-accent" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Coaching Status */}
              {onboardingStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                      Are you enrolled in any coaching?
                    </h2>
                    <p className="text-text-secondary">
                      This helps us complement your learning.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: 'offline', label: 'Offline Coaching', desc: 'Allen, Resonance, FIITJEE, etc.' },
                      { value: 'online', label: 'Online Coaching', desc: 'PW, Unacademy, Vedantu, etc.' },
                      { value: 'self', label: 'Self Study', desc: 'Books + YouTube + SETU' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setOnboardingData(prev => ({ ...prev, coaching: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          onboardingData.coaching === option.value
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-foreground">{option.label}</span>
                            <p className="text-sm text-text-muted">{option.desc}</p>
                          </div>
                          {onboardingData.coaching === option.value && (
                            <Check className="h-5 w-5 text-accent" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Weak Subject */}
              {onboardingStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                      Which subject needs the most work?
                    </h2>
                    <p className="text-text-secondary">
                      We'll prioritize this in your dashboard.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(onboardingData.exam === 'NEET'
                      ? [
                          { value: 'biology', label: 'Biology', desc: 'Botany, Zoology, NCERT-based', color: 'bg-green-500' },
                          { value: 'physics', label: 'Physics', desc: 'Concepts + numericals', color: 'bg-blue-500' },
                          { value: 'chemistry', label: 'Chemistry', desc: 'Organic, Inorganic, Physical', color: 'bg-emerald-500' },
                        ]
                      : [
                          { value: 'physics', label: 'Physics', desc: 'Concepts + numericals', color: 'bg-blue-500' },
                          { value: 'chemistry', label: 'Chemistry', desc: 'Organic, Inorganic, Physical', color: 'bg-emerald-500' },
                          { value: 'maths', label: 'Mathematics', desc: 'Calculus, Algebra, Coordinate', color: 'bg-amber-500' },
                        ]
                    ).map((subject) => (
                      <button
                        key={subject.value}
                        onClick={() => setOnboardingData(prev => ({ ...prev, weakSubject: subject.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          onboardingData.weakSubject === subject.value
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                            <div>
                              <span className="font-medium text-foreground">{subject.label}</span>
                              <p className="text-sm text-text-muted">{subject.desc}</p>
                            </div>
                          </div>
                          {onboardingData.weakSubject === subject.value && (
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
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleOnboardingNext}
                  disabled={loading}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : onboardingStep === 5 ? (
                    "Let's Start"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-serif font-semibold text-foreground">SETU</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-2">
              Start your preparation the right way
            </h2>
            <p className="text-muted-foreground">
              No spam. No distractions. Only study.
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-card">
            {/* Back button for phone/otp/forgot-password modes */}
            {(mode === 'phone' || mode === 'otp' || mode === 'forgot-password') && (
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
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
                  className="w-full h-12 text-base gap-3 mb-3"
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
                  className="w-full h-12 text-base gap-3"
                  onClick={() => setMode('phone')}
                  disabled={loading}
                >
                  <Phone className="h-5 w-5" />
                  Continue with Phone
                </Button>

                <div className="my-6 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            {/* Email/Password Form */}
            {(mode === 'login' || mode === 'signup') && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                    className="h-12 pl-10 border-2 focus:border-primary"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-muted-foreground">{errors.password}</p>
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
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-setu-navy-light shadow-sm"
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
                <p className="text-center text-sm text-muted-foreground pt-2">
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                      className="h-12 pl-10 border-2 focus:border-primary"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-setu-navy-light shadow-sm"
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
                  <p className="text-sm text-muted-foreground mb-4">
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
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-setu-navy-light shadow-sm"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive it?{' '}
                  <button
                    onClick={() => handlePhoneAuth({ preventDefault: () => {} } as React.FormEvent)}
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
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Reset your password
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                      className="h-12 pl-10 border-2 focus:border-primary"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-setu-navy-light shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
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
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;
