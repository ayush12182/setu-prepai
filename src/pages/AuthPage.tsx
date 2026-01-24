import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, Phone, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number');

type AuthMode = 'login' | 'signup' | 'phone' | 'otp' | 'forgot';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithPhone, verifyOTP, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

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
        toast.success('Account ban gaya! 🎉 Ab login kar lo.');
        setMode('login');
      } else {
        await signInWithEmail(email, password);
        navigate('/');
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
      toast.success('OTP bhej diya! 📱 Check karo.');
      setMode('otp');
    } catch (error: any) {
      toast.error(error.message || 'OTP bhejne mein problem hui');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Poora OTP daalo bhai');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phone, otp);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'OTP galat hai, check karo');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    toast.info('Guest mode mein limited access milega');
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Study Setu</h1>
              <p className="text-xs text-muted-foreground">JEE Prep with Jeetu Bhaiya</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            {mode === 'login' && (
              <>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                  Wapas aa gaye? 🙂
                </h2>
                <p className="text-muted-foreground">
                  Chalo continue karte hain preparation.
                </p>
              </>
            )}
            {mode === 'signup' && (
              <>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                  Welcome to Study Setu 📚
                </h2>
                <p className="text-muted-foreground">
                  Jeetu Bhaiya ready hai tumhari help ke liye.
                </p>
              </>
            )}
            {mode === 'phone' && (
              <>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                  Phone se login karo 📱
                </h2>
                <p className="text-muted-foreground">
                  OTP aayega, bas verify kar lena.
                </p>
              </>
            )}
            {mode === 'otp' && (
              <>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                  OTP daalo 🔐
                </h2>
                <p className="text-muted-foreground">
                  {phone} pe OTP bheja hai
                </p>
              </>
            )}
          </div>

          {/* Auth Card */}
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border">
            {/* Back button for phone/otp modes */}
            {(mode === 'phone' || mode === 'otp') && (
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </button>
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
                      placeholder="Tumhara naam"
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
                      placeholder="tumhara@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) validateEmail(e.target.value);
                      }}
                      onBlur={() => validateEmail(email)}
                      className="h-12 pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-muted-foreground">{errors.email}</p>
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
                      onBlur={() => validatePassword(password)}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm text-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 btn-hero text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : mode === 'signup' ? (
                    'Create Account'
                  ) : (
                    'Login'
                  )}
                </Button>
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
                      onBlur={() => validatePhone(phone)}
                      className="h-12 pl-10"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-muted-foreground">{errors.phone}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 btn-hero text-base"
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
                  className="w-full h-12 btn-hero text-base"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  OTP nahi aaya?{' '}
                  <button
                    onClick={handlePhoneAuth}
                    className="text-accent hover:underline"
                    disabled={loading}
                  >
                    Resend
                  </button>
                </p>
              </div>
            )}

            {/* Divider and alternate options */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="my-6 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-sm text-muted-foreground">ya phir</span>
                  <Separator className="flex-1" />
                </div>

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base gap-3"
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

                {/* Phone Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base gap-3 mt-3"
                  onClick={() => setMode('phone')}
                  disabled={loading}
                >
                  <Phone className="h-5 w-5" />
                  Continue with Phone
                </Button>

                {/* Toggle Login/Signup */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                  {mode === 'login' ? (
                    <>
                      Naya hai?{' '}
                      <button
                        onClick={() => setMode('signup')}
                        className="text-accent font-medium hover:underline"
                      >
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Pehle se account hai?{' '}
                      <button
                        onClick={() => setMode('login')}
                        className="text-accent font-medium hover:underline"
                      >
                        Login karo
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Guest Mode */}
          <div className="text-center mt-6">
            <button
              onClick={handleContinueAsGuest}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue as guest (limited access)
            </button>
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
