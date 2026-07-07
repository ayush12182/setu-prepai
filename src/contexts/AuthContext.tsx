import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { toast } from 'sonner';

// ─── DEV BYPASS ──────────────────────────────────────────────────────────────
const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === 'true';

const MOCK_PROFILE = {
  id: 'dev-student-001',
  user_id: 'dev-student-001',
  full_name: 'Dev Student',
  phone: null,
  avatar_url: null,
  class: '12',
  target_exam: 'JEE Advanced',
  student_level: 'advanced',
  user_type: 'student' as const,
  organization_id: 'dev-org-001',
  institution_name: 'Dev School',
  teacher_id: 'dev-teacher-001',
  teacher_code: 'DEV123',
  subjects: ['Physics', 'Chemistry', 'Mathematics'],
  mentor_name: 'Dev Teacher',
  mentor_avatar: null,
  diagnostic_completed: true,
  exam_goal: 'JEE Advanced',
};

const MOCK_USER = {
  id: 'dev-student-001',
  email: 'dev@prepentrance.ai',
  user_metadata: { full_name: 'Dev Student', user_type: 'student' },
} as unknown as User;

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  class: string | null;
  target_exam: string | null;
  student_level: string | null;
  user_type: 'student' | 'teacher' | 'admin' | 'b2b_institution' | null;
  organization_id: string | null;
  institution_name: string | null;
  teacher_id: string | null;
  teacher_code: string | null;
  subjects: string[] | null;
  mentor_name?: string | null;
  mentor_avatar?: string | null;
  // Subscription & trial fields
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled' | null;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  // Profile metadata
  created_at?: string | null;
  updated_at?: string | null;
  // Student personalisation
  target_year?: string | null;
  cohortName?: string | null;
  diagnostic_completed?: boolean | null;
  exam_goal?: string | null;
}


interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  subscription: SubscriptionState;
  /** Convenience getter — defaults to 'student' if not set */
  userType: Profile['user_type'];
  isMentor: boolean;
  isInstitution: boolean;
  isB2C: boolean;
  isB2BStudent: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  checkSubscription: () => Promise<void>;
  /** Force re-fetch the profile from DB — call after user_type changes (e.g. joining a batch) */
  refreshProfile: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    loading: false,
  });

  const fetchProfile = async (userId: string) => {
    if (DEV_BYPASS) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[AuthContext] Error getting auth user for profile fetch:', userError.message);
      }

      // 1. Try to fetch existing profile
      const { data: initialData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let data = initialData;

      // 2. AUTO-RECOVERY: If no profile exists, create it immediately
      if (!data && !error) {
        console.log(`[AuthContext] No profile for ${userId}, auto-creating...`);
        const { data: newData, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: user?.user_metadata?.full_name || 'New User',
            user_type: user?.user_metadata?.user_type || 'student'
          })
          .select()
          .single();
        
        if (!createError) data = newData;
        else console.error('[AuthContext] Auto-creation failed:', createError.message);
      }

      const dbData = data as any;
      const meta = user?.user_metadata || {};
      
      const profileData: Profile = {
        ...dbData,
        id: dbData?.id || userId,
        user_id: userId,
        full_name: dbData?.full_name || meta.full_name || 'User',
        user_type: dbData?.user_type || meta.user_type || null,
        organization_id: dbData?.organization_id || meta.organization_id || null,
        teacher_id: dbData?.teacher_id || null,
      };

      // 3. Fetch Mentor Details if linked
      if (profileData.teacher_id) {
        const { data: mentor } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', profileData.teacher_id)
          .maybeSingle();
        
        if (mentor) {
          profileData.mentor_name = mentor.full_name;
          profileData.mentor_avatar = mentor.avatar_url;
        }
      }

      setProfile(profileData);

    } catch (error) {
      console.error('[AuthContext] Unexpected fatal error fetching profile:', error);
    }
  };

  const checkSubscription = useCallback(async () => {
    if (DEV_BYPASS) return;
    try {
      setSubscription(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        // Silently handle - subscription check is non-critical
        console.warn('Subscription check skipped:', error.message);
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }
      setSubscription({
        subscribed: data?.subscribed ?? false,
        productId: data?.product_id ?? null,
        subscriptionEnd: data?.subscription_end ?? null,
        loading: false,
      });
    } catch (error) {
      console.warn('Subscription check failed silently');
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (DEV_BYPASS) return;
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setSubscription({ subscribed: false, productId: null, subscriptionEnd: null, loading: false });
        }

        if (event === 'SIGNED_IN') {
          // No toast on sign-in — SIGNED_IN fires on every token refresh too
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, []);

  // Check subscription when user is available
  useEffect(() => {
    if (DEV_BYPASS) return;
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Auto-refresh subscription every 60 seconds
  useEffect(() => {
    if (DEV_BYPASS || !user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      }
    });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      }
    });
    if (error) throw error;
  };

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Signed out successfully.');
    localStorage.removeItem('preferredLanguage');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    // 1. Update Auth Metadata first as it's the most robust storage for B2B fields
    const metadataUpdates: any = {};
    if (updates.user_type) metadataUpdates.user_type = updates.user_type;
    if (updates.institution_name !== undefined) metadataUpdates.institution_name = updates.institution_name;
    if (updates.organization_id) metadataUpdates.organization_id = updates.organization_id;

    if (Object.keys(metadataUpdates).length > 0) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });
      if (metaError) console.error('[AuthContext] Error updating auth metadata:', metaError);
    }

    // 2. Update profiles table — use .update() to avoid INSERT path issues
    const rawUpdates: any = { ...updates, updated_at: new Date().toISOString() };
    const dbUpdates: any = Object.fromEntries(
      Object.entries(rawUpdates).filter(([, v]) => v !== undefined && v !== null)
    );

    try {
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) {
        if (error.code === 'PGRST204' || error.message?.includes('column')) {
          console.warn('DB Column missing, falling back to metadata storage only.');
        } else {
          throw error;
        }
      }
    } catch (error) {
      const err = error as any;
      if (err.code === 'PGRST204' || err.message?.includes('column')) {
        console.warn('Database column not found, but metadata updated successfully.');
      } else {
        console.error('Profile update error:', error);
        throw error;
      }
    }

    await fetchProfile(user.id);
  };

  const userType = profile?.user_type || null;
  const isMentor = userType === 'teacher' || userType === 'admin' || userType === 'b2b_institution';
  const isInstitution = isMentor;
  const isB2C = userType === 'student' && !profile?.teacher_id;
  const isB2BStudent = userType === 'student' && !!profile?.teacher_id;

  // ── DEV BYPASS: short-circuit the whole auth system return ──
  if (DEV_BYPASS) {
    const noop = async () => {};
    return (
      <AuthContext.Provider
        value={{
          user: MOCK_USER,
          session: null,
          profile: MOCK_PROFILE as any,
          loading: false,
          subscription: { subscribed: true, productId: null, subscriptionEnd: null, loading: false },
          userType: 'student',
          isMentor: false,
          isInstitution: false,
          isB2C: false,
          isB2BStudent: true,
          signInWithEmail: noop as any,
          signUpWithEmail: noop as any,
          signInWithGoogle: noop,
          signInWithApple: noop,
          signInWithPhone: noop as any,
          verifyOTP: noop as any,
          signOut: noop,
          updateProfile: noop as any,
          checkSubscription: noop,
          refreshProfile: noop,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        subscription,
        userType,
        isMentor,
        isInstitution,
        isB2C,
        isB2BStudent,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithPhone,
        verifyOTP,
        signOut,
        updateProfile,
        checkSubscription,
        refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
