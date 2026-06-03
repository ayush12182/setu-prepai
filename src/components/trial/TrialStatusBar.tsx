import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { useAuth } from '@/contexts/AuthContext';
import { startSubscriptionCheckout } from '@/lib/paymentEngine';
import { toast } from 'sonner';

export const TrialStatusBar: React.FC = () => {
    const { trialStatus } = useTrialSystem();
    const { user } = useAuth();
    const [isDismissed, setIsDismissed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Check if user dismissed it in this session
    useEffect(() => {
        const dismissed = sessionStorage.getItem('dismiss_trial_banner') === 'true';
        setIsDismissed(dismissed);
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('dismiss_trial_banner', 'true');
        setIsDismissed(true);
    };

    const handleUpgrade = async () => {
        if (!user) {
            toast.error('User not logged in');
            return;
        }
        setIsProcessing(true);
        toast.info('Connecting securely to Cashfree Payments...');
        try {
            await startSubscriptionCheckout(249.00, user);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to initialize checkout');
        } finally {
            setIsProcessing(false);
        }
    };

    if (trialStatus.plan !== 'trial' || !trialStatus.isTrialActive || isDismissed) {
        return null;
    }

    const { daysLeft, hoursLeft, minutesLeft } = trialStatus;
    const isCritical = daysLeft === 0; // Less than 24 hours remaining

    return (
        <div className={`relative w-full border-b transition-all duration-300 ${
            isCritical 
                ? 'border-red-500/20 bg-gradient-to-r from-red-950/40 via-orange-950/20 to-red-950/40' 
                : 'border-amber-500/10 bg-gradient-to-r from-amber-950/30 via-slate-900/40 to-amber-950/30'
        }`}>
            {/* Ambient subtle glow background */}
            <div className={`absolute top-0 right-1/4 w-96 h-full opacity-20 blur-3xl pointer-events-none rounded-full ${
                isCritical ? 'bg-red-500/10' : 'bg-amber-500/10'
            }`} />

            <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs md:text-sm relative z-10">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider shrink-0 ${
                        isCritical 
                            ? 'bg-red-500/20 text-red-400 animate-pulse' 
                            : 'bg-amber-500/10 text-amber-400'
                    }`}>
                        🔥 Free Trial Active
                    </span>

                    <span className="text-white/40 hidden sm:inline">|</span>

                    <span className={`flex items-center gap-1.5 font-medium truncate ${
                        isCritical ? 'text-red-300 font-bold' : 'text-slate-300'
                    }`}>
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${isCritical ? 'text-red-400 animate-spin-slow' : 'text-amber-400'}`} />
                        {isCritical ? (
                            <span>Last Day! Only <strong className="text-red-400">{hoursLeft} hours {minutesLeft}m</strong> remaining</span>
                        ) : (
                            <span>
                                <strong>{daysLeft} Day{daysLeft !== 1 ? 's' : ''} {hoursLeft} Hour{hoursLeft !== 1 ? 's' : ''}</strong> remaining
                            </span>
                        )}
                        <span className="text-white/40 hidden md:inline ml-1 font-normal">• Premium features will lock afterwards</span>
                    </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        size="sm"
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className={`h-7.5 px-3.5 text-xs font-bold rounded-lg transition-all duration-300 shadow-md ${
                            isCritical
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/10 hover:shadow-amber-500/20'
                        }`}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                            <Sparkles className="w-3 h-3 mr-1" />
                        )}
                        Upgrade ₹249/mo
                    </Button>

                    <button 
                        onClick={handleDismiss}
                        className="text-white/40 hover:text-white/80 transition-colors p-1"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
