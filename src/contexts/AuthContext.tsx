import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  class: string | null;
  target_exam: string | null;
  student_level: string | null;
  user_type: 'b2c_student' | 'b2b_student' | 'b2b_mentor' | 'b2b_institution' | 'admin' | null;
  organization_id: string | null;
  institution_name: string | null;
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
  /** Convenience getter — defaults to 'b2c_student' if not set */
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile from DB:', error);
      }

      // Merge data from database and auth metadata
      // Auth metadata is set immediately on onboarding; DB might lag slightly
      const dbData = data as any;
      const meta = user?.user_metadata || {};
      const profileData: any = {
        ...dbData,
        user_type: meta.user_type || dbData?.user_type || 'b2c_student',
        target_exam: meta.target_exam || dbData?.target_exam || null,
        institution_name: meta.institution_name || dbData?.institution_name || null,
        organization_id: meta.organization_id || dbData?.organization_id || null,
      };

      setProfile(profileData);

    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkSubscription = useCallback(async () => {
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
          toast.success('Welcome back bhai 👋 Jeetu Bhaiya ready hai.');
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
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Auto-refresh subscription every 60 seconds
  useEffect(() => {
    if (!user) return;
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
        redirectTo: window.location.origin,
      }
    });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
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
    toast.success('Phir milenge bhai! 👋');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    // 1. Update Auth Metadata first as it's the most robust storage for B2B fields
    const metadataUpdates: any = {};
    if (updates.user_type) metadataUpdates.user_type = updates.user_type;
    if (updates.institution_name !== undefined) metadataUpdates.institution_name = updates.institution_name;

    if (Object.keys(metadataUpdates).length > 0) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });
      if (metaError) console.error('Error updating metadata:', metaError);
    }

    // 2. Attempt to update profiles table
    // We filter out institution_name and user_type if they are known to be missing in some environments
    const dbUpdates: any = { ...updates };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('user_id', user.id)
        .select();

      // If update matched no rows, insert instead
      if (!data || data.length === 0) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, ...dbUpdates } as any);
        
        if (insertError) {
          // If the error is specifically about missing columns, we ignore it as we have metadata fallback
          if (insertError.code === 'PGRST204' || insertError.message?.includes('column')) {
            console.warn('DB Column missing, falling back to metadata storage only.');
          } else {
            throw insertError;
          }
        }
      } else if (error) {
        if (error.code === 'PGRST204' || error.message?.includes('column')) {
          console.warn('DB Column missing, falling back to metadata storage only.');
        } else {
          throw error;
        }
      }
    } catch (error) {
      // Catch PGRST204 (Missing Column) and other generic DB errors
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

  const userType = profile?.user_type ?? 'b2c_student';
  const isMentor = userType === 'b2b_mentor' || userType === 'admin';
  const isInstitution = userType === 'b2b_institution' || userType === 'admin';
  const isB2C = userType === 'b2c_student';
  const isB2BStudent = userType === 'b2b_student';

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
