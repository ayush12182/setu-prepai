import React, { useState } from 'react';
import { BookOpen, Check, Crown, Gift, Loader2, Share2, Sparkles, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { useAuth } from '@/contexts/AuthContext';
import { startSubscriptionCheckout } from '@/lib/paymentEngine';
import { toast } from 'sonner';

export const TrialExpiredScreen: React.FC = () => {
    const { trialStatus } = useTrialSystem();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showReferral, setShowReferral] = useState(false);

    const features = [
        'Unlimited practice questions',
        'Unlimited AI teacher explanations',
        'Full analytics & progress dashboard',
        'Adaptive learning & weak area targeting',
        'Mock tests & revision plans',
        'Personalized study roadmaps',
    ];

    const handleCopyReferral = () => {
        if (trialStatus.referralCode) {
            navigator.clipboard.writeText(trialStatus.referralCode);
            toast.success('Referral code copied!');
        }
    };

    const handleShare = () => {
        const text = `Join PrepEntrance — India's smartest learning platform! Use my code ${trialStatus.referralCode} to get started. 🚀`;
        if (navigator.share) {
            navigator.share({ title: 'Join PrepEntrance', text, url: 'https://setulearning.in' });
        } else {
            navigator.clipboard.writeText(text);
            toast.success('Share text copied to clipboard!');
        }
    };

    const handleCheckout = async () => {
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

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/30">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-serif font-bold text-xl text-white tracking-wide">PrepEntrance</span>
                </div>

                {/* Card */}
                <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl p-7 sm:p-9 border border-white/[0.07] shadow-2xl shadow-black/30">
                    {/* Header */}
                    <div className="text-center mb-7">
                        <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-8 h-8 text-accent" />
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                            Trial Ended
                        </h2>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Your 3-day PrepEntrance trial has ended. Continue learning with PrepEntrance Pro.
                        </p>
                    </div>

                    {/* Pro pricing */}
                    <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] mb-6">
                        <div className="flex items-baseline justify-center gap-2 mb-3">
                            <span className="text-lg text-white/30 line-through">₹999</span>
                            <span className="text-4xl font-bold text-accent">₹349</span>
                            <span className="text-white/40 text-sm">/ month</span>
                        </div>
                        <p className="text-center text-white/30 text-xs mb-4">
                            Early adopter pricing • Cancel anytime
                        </p>

                        {/* Features */}
                        <div className="space-y-2.5">
                            {features.map((f) => (
                                <div key={f} className="flex items-center gap-2.5">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="text-sm text-white/60">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upgrade CTA */}
                    <Button
                        className="w-full h-13 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 mb-3"
                        onClick={handleCheckout}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Upgrade to PrepEntrance Pro — ₹349/month
                    </Button>

                    {/* Referral */}
                    <button
                        className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors py-2"
                        onClick={() => setShowReferral(!showReferral)}
                    >
                        <Gift className="w-3.5 h-3.5 inline mr-1.5" />
                        Invite friends for extra trial days
                    </button>

                    {showReferral && trialStatus.referralCode && (
                        <div className="mt-3 bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-xs text-white/40 mb-3 text-center">
                                Invite 3 friends → Get +3 extra trial days
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/[0.05] rounded-lg px-3 py-2.5 text-sm text-white/70 font-mono text-center border border-white/[0.08]">
                                    {trialStatus.referralCode}
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-10 px-3 border-white/10 text-white/60 hover:bg-white/10"
                                    onClick={handleCopyReferral}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-10 px-3 bg-accent/20 text-accent hover:bg-accent/30"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

