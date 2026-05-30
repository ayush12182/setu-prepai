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
import { Mail, Phone, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Check, BookOpen, GraduationCap, Sparkles, Rocket, Zap, Brain, Users, Building2, ShieldCheck, XCircle } from 'lucide-react';
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

const STREAM_OPTIONS = [
  {
    value: 'foundation' as StreamType,
    label: 'PrepEntrance Foundation',
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
  const { user, profile, isMentor, userType, refreshProfile, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signInWithPhone, verifyOTP, updateProfile, loading: authLoading } = useAuth();
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
    const typeParam = searchParams.get('type');
    const orgName = searchParams.get('org_name');
    const orgId = searchParams.get('org_id');
    const refParam = searchParams.get('ref') || searchParams.get('teacher_id');
    
    let resolvedUserType: 'student' | 'teacher' | undefined = undefined;
    if (typeParam === 'student' || typeParam === 'coaching' || orgId || orgName) resolvedUserType = 'student';
    else if (typeParam === 'teacher' || typeParam === 'institution') resolvedUserType = 'teacher';

    return {
      userType: resolvedUserType,
      institutionName: orgName || undefined,
      referenceCode: refParam || undefined,
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
      if (showOnboarding || showWelcome) return;

      // Redirected here because student has no batch yet — go straight to join-code step
      if (searchParams.get('require_batch') === '1' && profile?.user_type === 'student') {
        setShowOnboarding(true);
        setOnboardingStep(3);
        return;
      }

      if (profile) {
        if (isMentor) {
          navigate('/b2b');
          return;
        }

        if (profile.user_type === 'student') {
          if (profile.class) {
            navigate('/student-hub');
            return;
          } else {
            console.log("Incomplete student profile, staying in onboarding.");
            setShowOnboarding(true);
            return;
          }
        }

        if (!profile.class) {
          setShowOnboarding(true);
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [user, profile, authLoading, navigate, showOnboarding, showWelcome]);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email) || !validatePassword(password)) return;
    if (mode === 'signup' && !fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        // Sign up — Supabase will send a verification email
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, user_type: 'student' },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;

        // Show verification gate — do NOT sign in yet
        setVerificationEmail(email);
        setAwaitingVerification(true);
        toast.success('Account created! Check your email to verify your account.');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      console.error('Email Auth Error:', error);
      const msg = error instanceof Error ? error.message : 'Authentication failed. Please check your credentials and try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try { 
      await signInWithGoogle(); 
    } catch (error) { 
      toast.error(error instanceof Error ? error.message : 'Google login failed'); 
    } finally {
      setLoading(false); 
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    try { 
      await signInWithApple(); 
    } catch (error) { 
      toast.error(error instanceof Error ? error.message : 'Apple login failed'); 
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
      toast.success('OTP sent! Check your phone.'); 
      setMode('otp'); 
    } catch (error) { 
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP'); 
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try { 
      await verifyOTP(phone, otp); 
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

  /**
   * Unified Signup & Join Orchestrator
   * Ensures account creation, session sync, and batch join happen in order.
   */
  const handleUnifiedSignup = async () => {
    if (!fullName.trim()) { toast.error('Enter your name'); return; }
    if (!validateEmail(email)) { toast.error('Enter a valid email'); return; }
    if (!validatePassword(password)) { toast.error('Password must be at least 6 characters'); return; }
    
    setLoading(true);
    console.log("Starting unified signup for:", email);

    try {
      // 1. SIGNUP
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, user_type: onboardingData.userType } }
      });
      
      if (signUpError) {
        if (signUpError.message.includes('already')) {
          console.log("User already exists, attempting sign in recovery...");
          await signInWithEmail(email, password);
        } else {
          throw signUpError;
        }
      }

      // 2. SESSION SYNC WAIT
      // Give Supabase a moment to persist the session in local storage
      await new Promise(r => setTimeout(r, 800));

      // 3. SIGNIN VERIFICATION
      // Ensure we have an active session before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session after signup, forcing manual sign-in...");
        await signInWithEmail(email, password);
        await new Promise(r => setTimeout(r, 500));
      }

      toast.success('Account ready! Finalizing your setup...');
      
      // 4. ONBOARDING COMPLETION
      // This will handle profile creation, batch join, and redirect
      await handleOnboardingComplete();

    } catch (error: any) {
      console.error('CRITICAL Unified Signup Error:', error);
      // Give the user the exact message from Supabase (e.g., "User already registered")
      const msg = error.message || 'Signup failed. Please try again or contact support.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    console.log("Finalizing onboarding for user type:", onboardingData.userType);

    try {
      // 1. TEACHER PATH
      if (onboardingData.userType === 'teacher') {
        const examGoal = getExamGoalFromStream(onboardingData.stream as StreamType) || 'JEE Main';
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        let orgId: string | null = null;

        if (currentUser) {
          const displayName = fullName || currentUser.email?.split('@')[0] || 'Teacher';
          const institutionLabel = onboardingData.institutionName?.trim() || `${displayName.split(' ')[0]}'s Institute`;
          const slug = institutionLabel.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40) + '-' + Date.now();
          
          const { data: newOrg, error: orgErr } = await (supabase as any)
            .from('organizations')
            .insert({ name: institutionLabel, slug, created_by: currentUser.id })
            .select('id')
            .single();

          if (!orgErr && newOrg) orgId = (newOrg as any).id;
          else console.warn('Org insert error (non-fatal):', orgErr?.message);
        }

        await updateProfile({
          target_exam: examGoal,
          class: null,
          user_type: 'teacher',
          institution_name: onboardingData.institutionName?.trim() || null,
          organization_id: orgId,
        } as any);

        await supabase.auth.updateUser({ data: { user_type: 'teacher', organization_id: orgId, target_exam: examGoal } });
        toast.success('Teacher portal ready! Welcome to PrepEntrance 👨\u200d\uD83C\uDFEB');
        navigate('/b2b');
        return;
      }

      // 2. STUDENT PATH (Unified Coaching + Individual)
      // If student joined via teacher batch code, use batch's exam config
      const stream = (joinCodeResult?.stream || onboardingData.stream) as StreamType;
      const examGoal = joinCodeResult?.exam_type || getExamGoalFromStream(onboardingData.stream as StreamType);
      const studentClass = onboardingData.studentClass || '11';
      const studentLevel = getStudentLevel();

      // Set exam mode immediately
      if (stream === 'jee') setExamMode('jee');
      else if (stream === 'neet') setExamMode('neet');
      else if (stream === 'cuet') setExamMode('cuet');
      else setExamMode('jee');

      console.log("Updating student profile:", { examGoal, studentClass, studentLevel });

      // Create/Update profile
      await updateProfile({
        target_exam: examGoal,
        class: studentClass,
        student_level: studentLevel,
        user_type: 'student',
        institution_name: onboardingData.institutionName || null,
        teacher_id: onboardingData.referenceCode || null, // Auto-assign if ref present
      });

      // BATCH JOIN — validated code is REQUIRED; persist via edge function
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const joinCode = (onboardingData.institutionName || '').trim().toUpperCase();

      if (joinCode && currentUser) {
        console.log("Joining batch with code:", joinCode);
        const { data: joinData, error: joinErr } = await supabase.functions.invoke('validate-join-code', {
          body: { join_code: joinCode, student_id: currentUser.id },
        });

        if (joinErr || joinData?.error) {
          toast.error('Could not join batch. Please check your code and try again.');
          setLoading(false);
          return;
        }

        // Show welcome screen before navigating to student hub
        setJoinCodeResult(joinData);
        setShowWelcome(true);
        setLoading(false);
        return; // welcome screen handles final navigation
      }

      // Final synchronization
      await refreshProfile();
      await supabase.auth.updateUser({ data: { target_exam: examGoal, user_type: 'student' } });

      // Inject Mock Task for first-time students
      const { data: latestProfile } = await supabase.from('profiles').select('id').single();
      if (latestProfile) {
        try {
          await (supabase.from as any)('assigned_tasks').insert({
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
      console.error('CRITICAL Onboarding Failure:', error);
      const errMsg = error.message || 'Profile setup failed. Please refresh and try again.';
      toast.error(`Onboarding failed: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const validateJoinCode = useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (trimmed.length < 6) return;

    setJoinCodeState('checking');
    setJoinCodeResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-join-code', {
        body: { join_code: trimmed },
      });

      if (error || data?.error) {
        setJoinCodeState('invalid');
        setJoinCodeResult(null);
      } else {
        setJoinCodeState('valid');
        setJoinCodeResult(data);

        // ── AUTO-APPLY batch exam/stream to student profile ──────────────
        // Maps batch target_exam/stream → onboardingData so student
        // inherits teacher's config without manual selection.
        const examToStream: Record<string, string> = {
          'JEE': 'jee', 'JEE Main': 'jee', 'JEE Advanced': 'jee',
          'NEET': 'neet',
          'CUET': 'cuet',
          'Commerce': 'commerce', 'CA Foundation': 'commerce',
          'Foundation': 'foundation',
        };
        const detectedStream = data.stream ||
          examToStream[data.exam_type] ||
          'jee';

        setOnboardingData(prev => ({
          ...prev,
          institutionName: trimmed,         // join code stored here for batch join
          stream: detectedStream as StreamType,
          examGoal: data.exam_type,
        }));
      }
    } catch {
      setJoinCodeState('invalid');
    }
  }, []);

  const handleOnboardingNext = async () => {
    if (onboardingStep === 0) {
      if (!onboardingData.userType) {
        toast.error('Please select your role');
        return;
      }
      setOnboardingStep(1);
    } else if (onboardingStep === 1) {
      if (!onboardingData.stream) {
        toast.error('Please select your stream');
        return;
      }
      if (onboardingData.userType === 'teacher') {
        handleOnboardingComplete();
      } else {
        setOnboardingStep(2);
      }
    } else if (onboardingStep === 2) {
      if (!onboardingData.studentClass) {
        toast.error('Please select your class');
        return;
      }
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      // STRICT: student MUST have a validated join code
      if (onboardingData.userType === 'student' && joinCodeState !== 'valid') {
        toast.error('Please enter a valid teacher code to continue.');
        return;
      }
      handleOnboardingComplete();
    }
  };

  const totalSteps = 4;

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

  // ─── WELCOME SCREEN (post batch-join) ────────────────────────────────────
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

  // ─── ONBOARDING — new premium redesign ──────────────────────────────────────
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

  // ─── EMAIL VERIFICATION GATE ─────────────────────────────────────────────
  if (awaitingVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-9 w-9 text-accent" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-white mb-3">Check your inbox</h2>
          <p className="text-white/40 text-sm mb-2">
            We sent a verification link to
          </p>
          <p className="text-accent font-semibold text-base mb-6">{verificationEmail}</p>

          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-5 mb-6 text-left space-y-3">
            {[
              { n: '1', text: 'Open the email from PrepEntrance' },
              { n: '2', text: 'Click "Verify your email"' },
              { n: '3', text: 'You\'ll be redirected back to sign in' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent text-xs font-bold">{s.n}</span>
                </div>
                <span className="text-white/60 text-sm">{s.text}</span>
              </div>
            ))}
          </div>

          <p className="text-white/25 text-xs mb-5">Can't find it? Check your spam folder.</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await supabase.auth.resend({ type: 'signup', email: verificationEmail });
                  toast.success('Verification email resent!');
                } catch { toast.error('Could not resend. Try again in a moment.'); }
                finally { setLoading(false); }
              }}
              disabled={loading}
              className="w-full h-11 rounded-xl border border-white/[0.1] text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Resend verification email'}
            </button>
            <button
              onClick={() => { setAwaitingVerification(false); setMode('login'); }}
              className="text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
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
            <span className="font-serif font-bold text-2xl text-white tracking-wide">PrepEntrance</span>
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
              <span className="font-serif font-bold text-lg text-white tracking-wide">PrepEntrance</span>
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
              {/* PrepEntrance Logo — desktop right panel */}
              <div className="hidden lg:flex items-center justify-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/25">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-serif font-bold text-xl text-white tracking-wide">PrepEntrance</span>
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
