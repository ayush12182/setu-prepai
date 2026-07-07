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
            await startSubscriptionCheckout(349.00, user);
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
    const isLastDay = daysLeft === 0;
    const isWarning = daysLeft === 1;
    const isAmber = daysLeft >= 2 && daysLeft <= 5;
    const isBlue = daysLeft > 5;

    // Dynamic styles based on urgency
    const bannerBg = isLastDay 
        ? 'bg-red-50 border-red-200' 
        : 'bg-gradient-to-r from-[#EEF4FF] to-[#F8FBFF] border-[#D6E4FF]';
        
    const timeColor = isLastDay || isWarning 
        ? 'text-red-600 font-bold' 
        : isAmber 
        ? 'text-amber-600 font-bold' 
        : 'text-blue-600 font-bold';
        
    const timeIconColor = isLastDay || isWarning ? 'text-red-500' : isAmber ? 'text-amber-500' : 'text-blue-500';

    return (
        <div className={`relative w-full border-b transition-all duration-300 ${bannerBg}`}>
            <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm relative z-10">
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] sm:text-xs text-blue-700 bg-blue-100/50 border border-blue-200 shrink-0">
                        ✨ Free Trial Active
                    </span>

                    <span className="text-slate-300 hidden sm:inline">|</span>
                    
                    <span className={`text-slate-700 font-medium hidden md:inline`}>
                        Enjoy all premium features.
                    </span>

                    <span className="text-slate-300 hidden md:inline">|</span>

                    <span className={`flex items-center gap-1.5 font-medium whitespace-nowrap ${timeColor}`}>
                        {isLastDay || isWarning ? (
                            <span className="flex items-center gap-1.5">
                                ⚠ {isLastDay ? 'Last day of your free trial!' : 'Trial ends soon!'} 
                                <strong className="ml-1">
                                    {isLastDay ? `${hoursLeft}h ${minutesLeft}m` : `${daysLeft}d ${hoursLeft}h`} remaining
                                </strong>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Clock className={`w-3.5 h-3.5 shrink-0 ${timeIconColor}`} />
                                ⏳ {daysLeft} Days {hoursLeft} Hours remaining
                            </span>
                        )}
                    </span>
                    
                    <span className="text-slate-500 hidden xl:inline ml-1 font-normal">• After your trial ends, you'll need a Premium plan to continue learning.</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <Button
                        size="sm"
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className="h-8 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-md hover:-translate-y-0.5"
                    >
                        {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Upgrade to Premium
                    </Button>

                    <button 
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors p-1.5"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
