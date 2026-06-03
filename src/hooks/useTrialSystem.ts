import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface TrialStatus {
    plan: 'none' | 'trial' | 'pro';
    trialStartDate: string | null;
    trialEndDate: string | null;
    trialDaysRemaining: number;
    trialHoursRemaining: number;
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    isTrialExpired: boolean;
    isTrialActive: boolean;
    hasAccess: boolean;
    referralCode: string | null;
    bonusDays: number;
}

const DEFAULT_TRIAL_STATUS: TrialStatus = {
    plan: 'none',
    trialStartDate: null,
    trialEndDate: null,
    trialDaysRemaining: 0,
    trialHoursRemaining: 0,
    daysLeft: 0,
    hoursLeft: 0,
    minutesLeft: 0,
    isTrialExpired: false,
    isTrialActive: false,
    hasAccess: false,
    referralCode: null,
    bonusDays: 0,
};

// Rollout date for grandfathering existing users
const ROLLOUT_DATE = new Date('2026-06-03T17:15:00.000Z');

export const useTrialSystem = () => {
    const { profile, subscription, loading: authLoading, refreshProfile } = useAuth();
    const [trialStatus, setTrialStatus] = useState<TrialStatus>(DEFAULT_TRIAL_STATUS);
    const [localLoading, setLocalLoading] = useState(false);

    const computeStatus = useCallback((): TrialStatus => {
        if (authLoading || !profile) {
            return DEFAULT_TRIAL_STATUS;
        }

        // 1. Check for Grandfathering (Account created before deployment)
        const accountCreatedAt = profile.created_at ? new Date(profile.created_at) : new Date();
        const isGrandfathered = accountCreatedAt < ROLLOUT_DATE;

        // 2. Check for B2B organization/school/coaching or teacher/admin bypass
        const isB2B = !!profile.organization_id || !!profile.teacher_id;
        const isTeacherOrAdmin = profile.user_type === 'teacher' || profile.user_type === 'admin';

        // 3. Pro status checks:
        // - Stripe subscription active
        // - profile subscription_status is explicitly active
        // - Grandfathered
        // - B2B (Organization / School student / Teacher / Admin)
        const isPremium = subscription.subscribed || 
                          profile.subscription_status === 'active' || 
                          isGrandfathered || 
                          isB2B || 
                          isTeacherOrAdmin;

        if (isPremium) {
            return {
                plan: 'pro',
                trialStartDate: null,
                trialEndDate: null,
                trialDaysRemaining: 0,
                trialHoursRemaining: 0,
                daysLeft: 0,
                hoursLeft: 0,
                minutesLeft: 0,
                isTrialExpired: false,
                isTrialActive: false,
                hasAccess: true,
                referralCode: profile.user_id ? `PrepEntrance-${profile.user_id.replace(/-/g, '').slice(0, 8).toUpperCase()}` : null,
                bonusDays: 0,
            };
        }

        // 4. Trial status calculations
        const subStatus = profile.subscription_status || 'trial';
        const trialStart = profile.trial_started_at;
        const trialEnd = profile.trial_ends_at;

        if (subStatus === 'trial' && trialEnd) {
            const now = new Date();
            const end = new Date(trialEnd);
            const msRemaining = end.getTime() - now.getTime();
            
            const totalHoursRemaining = Math.max(0, msRemaining / (1000 * 60 * 60));
            const daysLeft = Math.floor(totalHoursRemaining / 24);
            const hoursLeft = Math.floor(totalHoursRemaining % 24);
            const minutesLeft = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const isExpired = msRemaining <= 0;

            const referralCode = profile.user_id ? `PrepEntrance-${profile.user_id.replace(/-/g, '').slice(0, 8).toUpperCase()}` : null;

            return {
                plan: 'trial',
                trialStartDate: trialStart,
                trialEndDate: trialEnd,
                trialDaysRemaining: isExpired ? 0 : Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24))),
                trialHoursRemaining: Math.ceil(totalHoursRemaining),
                daysLeft,
                hoursLeft,
                minutesLeft,
                isTrialExpired: isExpired,
                isTrialActive: !isExpired,
                hasAccess: !isExpired,
                referralCode,
                bonusDays: 0, // Bonus days are already added to trial_ends_at server-side
            };
        }

        // Default fallback (no trial set yet)
        return {
            ...DEFAULT_TRIAL_STATUS,
            referralCode: profile.user_id ? `PrepEntrance-${profile.user_id.replace(/-/g, '').slice(0, 8).toUpperCase()}` : null,
        };
    }, [profile, subscription, authLoading]);

    // Recalculate status when profile, subscription or loading state changes
    useEffect(() => {
        setTrialStatus(computeStatus());
    }, [computeStatus]);

    // Periodically update the countdown (e.g., every minute)
    useEffect(() => {
        if (trialStatus.plan !== 'trial' || trialStatus.isTrialExpired) return;

        const interval = setInterval(() => {
            setTrialStatus(computeStatus());
        }, 60000);

        return () => clearInterval(interval);
    }, [trialStatus.plan, trialStatus.isTrialExpired, computeStatus]);

    const activateTrial = useCallback(async () => {
        setLocalLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const now = new Date();
            const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            const { error } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'trial',
                    trial_started_at: now.toISOString(),
                    trial_ends_at: end.toISOString()
                })
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success('🎉 Trial activated! You have 3 days of full access.');
            if (refreshProfile) {
                await refreshProfile();
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to activate trial';
            toast.error(msg);
        } finally {
            setLocalLoading(false);
        }
    }, [refreshProfile]);

    const upgradeToPro = useCallback(async () => {
        setLocalLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const { error } = await supabase
                .from('profiles')
                .update({ subscription_status: 'active' })
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success('🚀 Welcome to PrepEntrance Pro!');
            if (refreshProfile) {
                await refreshProfile();
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to upgrade';
            toast.error(msg);
        } finally {
            setLocalLoading(false);
        }
    }, [refreshProfile]);

    const extendTrial = useCallback(async (days: number) => {
        setLocalLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const currentEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : new Date();
            const newEndsAt = new Date(currentEndsAt.getTime() + days * 24 * 60 * 60 * 1000);

            const { error } = await supabase
                .from('profiles')
                .update({ trial_ends_at: newEndsAt.toISOString() })
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success(`+${days} bonus day${days > 1 ? 's' : ''} added to your trial! 🎁`);
            if (refreshProfile) {
                await refreshProfile();
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to extend trial';
            toast.error(msg);
        } finally {
            setLocalLoading(false);
        }
    }, [profile, refreshProfile]);

    const redeemReferral = useCallback(async (code: string) => {
        setLocalLoading(true);
        try {
            if (!code.startsWith('PrepEntrance-') || code.length < 10) {
                toast.error('Invalid referral code');
                return;
            }
            await extendTrial(1);
            toast.success('Referral redeemed! +1 day added.');
        } catch {
            toast.error('Failed to redeem referral');
        } finally {
            setLocalLoading(false);
        }
    }, [extendTrial]);

    return {
        trialStatus,
        loading: authLoading || localLoading,
        activateTrial,
        upgradeToPro,
        extendTrial,
        redeemReferral,
        refreshStatus: refreshProfile || (async () => {}),
    };
};
