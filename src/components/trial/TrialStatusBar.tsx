import React from 'react';
import { Clock, Gift, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrialSystem } from '@/hooks/useTrialSystem';

export const TrialStatusBar: React.FC = () => {
    const { trialStatus } = useTrialSystem();

    if (trialStatus.plan !== 'trial' || !trialStatus.isTrialActive) return null;

    const totalDays = 7 + trialStatus.bonusDays;
    const usedDays = totalDays - trialStatus.trialDaysRemaining;
    const progress = Math.min(100, (usedDays / totalDays) * 100);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/[0.08] via-amber-500/[0.05] to-accent/[0.08] p-4 sm:p-5 mb-6">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Timer */}
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">
                                Trial: {trialStatus.trialDaysRemaining} day{trialStatus.trialDaysRemaining !== 1 ? 's' : ''} remaining
                            </span>
                            {trialStatus.bonusDays > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                                    <Gift className="w-3 h-3" /> +{trialStatus.bonusDays} bonus
                                </span>
                            )}
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent to-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span>Progress tracked</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Full access</span>
                    </div>
                </div>

                {/* Upgrade CTA */}
                <Button
                    size="sm"
                    className="shrink-0 h-9 px-4 text-xs font-semibold bg-accent hover:bg-accent/90 text-primary rounded-lg"
                    onClick={() => window.location.hash = '#pricing'}
                >
                    Upgrade to Pro
                </Button>
            </div>
        </div>
    );
};
