import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TrialStatus {
    plan: 'none' | 'trial' | 'pro';
    trialStartDate: string | null;
    trialEndDate: string | null;
    trialDaysRemaining: number;
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
    isTrialExpired: false,
    isTrialActive: false,
    hasAccess: false,
    referralCode: null,
    bonusDays: 0,
};

export const useTrialSystem = () => {
    const [trialStatus, setTrialStatus] = useState<TrialStatus>(DEFAULT_TRIAL_STATUS);
    const [loading, setLoading] = useState(false);

    const computeTrialStatus = (metadata: Record<string, unknown>): TrialStatus => {
        const plan = (metadata?.plan as string) || 'none';
        const trialStart = metadata?.trial_start as string | null;
        const bonusDays = (metadata?.bonus_days as number) || 0;
        const referralCode = (metadata?.referral_code as string) || null;

        if (plan === 'pro') {
            return {
                plan: 'pro',
                trialStartDate: null,
                trialEndDate: null,
                trialDaysRemaining: 0,
                isTrialExpired: false,
                isTrialActive: false,
                hasAccess: true,
                referralCode,
                bonusDays,
            };
        }

        if (plan === 'trial' && trialStart) {
            const start = new Date(trialStart);
            const totalDays = 3 + bonusDays;
            const end = new Date(start);
            end.setDate(end.getDate() + totalDays);

            const now = new Date();
            const msRemaining = end.getTime() - now.getTime();
            const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
            const isExpired = daysRemaining <= 0;

            return {
                plan: 'trial',
                trialStartDate: trialStart,
                trialEndDate: end.toISOString(),
                trialDaysRemaining: daysRemaining,
                isTrialExpired: isExpired,
                isTrialActive: !isExpired,
                hasAccess: !isExpired,
                referralCode,
                bonusDays,
            };
        }

        return { ...DEFAULT_TRIAL_STATUS, referralCode, bonusDays };
    };

    const refreshStatus = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setTrialStatus(DEFAULT_TRIAL_STATUS);
                return;
            }
            const metadata = user.user_metadata || {};
            setTrialStatus(computeTrialStatus(metadata));
        } catch {
            console.warn('Failed to refresh trial status');
        }
    }, []);

    const generateReferralCode = (userId: string): string => {
        const short = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
        return `PrepEntrance-${short}`;
    };

    const activateTrial = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const referralCode = generateReferralCode(user.id);
            const now = new Date().toISOString();

            const { error } = await supabase.auth.updateUser({
                data: {
                    plan: 'trial',
                    trial_start: now,
                    bonus_days: 0,
                    referral_code: referralCode,
                },
            });

            if (error) throw error;
            toast.success('🎉 Trial activated! You have 3 days of full access.');
            await refreshStatus();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to activate trial';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [refreshStatus]);

    const upgradeToPro = useCallback(async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { plan: 'pro' },
            });
            if (error) throw error;
            toast.success('🚀 Welcome to PrepEntrance Pro!');
            await refreshStatus();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to upgrade';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [refreshStatus]);

    const extendTrial = useCallback(async (days: number) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const currentBonus = (user.user_metadata?.bonus_days as number) || 0;
            const { error } = await supabase.auth.updateUser({
                data: { bonus_days: currentBonus + days },
            });
            if (error) throw error;
            toast.success(`+${days} bonus day${days > 1 ? 's' : ''} added to your trial! 🎁`);
            await refreshStatus();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to extend trial';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [refreshStatus]);

    const redeemReferral = useCallback(async (code: string) => {
        setLoading(true);
        try {
            // For now, just validate and grant bonus
            if (!code.startsWith('PrepEntrance-') || code.length < 10) {
                toast.error('Invalid referral code');
                return;
            }
            await extendTrial(1);
            toast.success('Referral redeemed! +1 day added.');
        } catch {
            toast.error('Failed to redeem referral');
        } finally {
            setLoading(false);
        }
    }, [extendTrial]);

    // Auto-refresh on mount
    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    return {
        trialStatus,
        loading,
        activateTrial,
        upgradeToPro,
        extendTrial,
        redeemReferral,
        refreshStatus,
    };
};
