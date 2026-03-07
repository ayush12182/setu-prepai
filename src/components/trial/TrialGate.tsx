import React from 'react';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { TrialExpiredScreen } from './TrialExpiredScreen';

interface TrialGateProps {
    children: React.ReactNode;
}

export const TrialGate: React.FC<TrialGateProps> = ({ children }) => {
    const { trialStatus } = useTrialSystem();

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

    // No plan (new user who hasn't activated trial yet) → let them through
    // The trial activation prompt will be shown separately
    return <>{children}</>;
};
