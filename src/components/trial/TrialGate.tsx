import React, { useEffect } from 'react';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { TrialExpiredScreen } from './TrialExpiredScreen';
import { Loader2 } from 'lucide-react';

interface TrialGateProps {
    children: React.ReactNode;
}

export const TrialGate: React.FC<TrialGateProps> = ({ children }) => {
    const { trialStatus, activateTrial, loading } = useTrialSystem();

    useEffect(() => {
        if (trialStatus.plan === 'none' && !loading) {
            activateTrial();
        }
    }, [trialStatus.plan, activateTrial, loading]);

    // Pro users → full access
    if (trialStatus.plan === 'pro') {
        return <>{children}</>;
    }

    // Active trial → full access
    if (trialStatus.plan === 'trial' && trialStatus.isTrialActive) {
        return <>{children}</>;
    }

    // Trial expired → show upgrade screen
    if (trialStatus.plan === 'trial' && trialStatus.isTrialExpired) {
        return <TrialExpiredScreen />;
    }

    // No plan (activating) or loading → show spinner
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
    );
};
