import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Loader2, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { startSubscriptionCheckout } from '@/lib/paymentEngine';
import { useToast } from '@/hooks/use-toast';

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trialStatus, activateTrial, upgradeToPro, loading } = useTrialSystem();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const trialFeatures = [
    'Complete syllabus — Maths, Science & more',
    'AI-powered practice questions',
    'AI mentor explanations',
    'Adaptive tests & weakness analysis',
    'Student dashboard & progress tracking',
    'Full platform access for 7 days',
  ];

  const proFeatures = [
    'Everything in Trial, plus:',
    'Unlimited practice questions',
    'Unlimited AI explanations',
    'Full analytics & adaptive learning',
    'Mock tests & revision plans',
    'Priority support & new features',
  ];

  const handleTrialClick = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      setIsProcessing(true);
      toast({ title: 'Connecting to Bank...', description: 'Securing connection via Cashfree Payments.' });
      await startSubscriptionCheckout(49, user);
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      toast({ title: 'Payment Error', description: err.message || 'Failed to initialize checkout', variant: 'destructive' });
    }
  };

  const handleProClick = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      setIsProcessing(true);
      toast({ title: 'Connecting to Bank...', description: 'Securing connection via Cashfree Payments.' });
      await startSubscriptionCheckout(249, user);
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      toast({ title: 'Payment Error', description: err.message || 'Failed to initialize checkout', variant: 'destructive' });
    }
  };

  return (
    <section id="pricing" className="relative py-24 px-6 sm:px-12 overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3">
            Start Small,{' '}
            <span className="text-accent">Learn Big</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Try everything for ₹49. Love it? Continue with SETU Pro.
          </p>
        </motion.div>

        {/* 2-Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Trial Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-card border border-border rounded-2xl p-7 sm:p-8"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">SETU Starter</h3>
                <p className="text-muted-foreground text-xs">7-Day Full Access</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-4xl font-bold text-accent">₹49</span>
              <span className="text-muted-foreground text-sm">/ one-time</span>
            </div>

            <div className="space-y-2.5 mb-7">
              {trialFeatures.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>

            {trialStatus.plan === 'trial' && trialStatus.isTrialActive ? (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/15 text-accent text-sm font-semibold">
                  <Check className="h-4 w-4" />
                  Trial Active — {trialStatus.trialDaysRemaining} days left
                </span>
              </div>
            ) : (
              <Button
                onClick={handleTrialClick}
                disabled={loading || isProcessing || trialStatus.plan === 'pro'}
                className="w-full h-12 rounded-xl text-sm font-semibold bg-accent hover:bg-accent/90 text-primary shadow-lg shadow-accent/20 transition-all"
              >
                {loading || isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {user ? 'Start 7-Day Trial — ₹49' : 'Sign Up for ₹49'}
              </Button>
            )}
          </motion.div>

          {/* Pro Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-card border-2 border-accent/30 rounded-2xl p-7 sm:p-8"
          >
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent text-primary text-xs font-bold shadow-lg shadow-accent/30">
                <Crown className="w-3 h-3" /> Recommended
              </span>
            </div>

            <div className="flex items-center gap-2 mb-5 mt-2">
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Crown className="w-4.5 h-4.5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">SETU Pro</h3>
                <p className="text-muted-foreground text-xs">Unlimited Learning</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-lg text-muted-foreground line-through">₹500</span>
              <span className="text-4xl font-bold text-accent">₹249</span>
              <span className="text-muted-foreground text-sm">/ month</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium mb-5">🔥 50% off for early users</p>

            <div className="space-y-2.5 mb-7">
              {proFeatures.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>

            {trialStatus.plan === 'pro' ? (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/15 text-accent text-sm font-semibold">
                  <Check className="h-4 w-4" />
                  You're on SETU Pro!
                </span>
              </div>
            ) : (
              <Button
                onClick={handleProClick}
                disabled={loading || isProcessing}
                className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white shadow-lg shadow-accent/25 transition-all"
              >
                {loading || isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Upgrade to SETU Pro
              </Button>
            )}
          </motion.div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          Cancel anytime. No hidden charges. Just focused preparation.
        </p>
      </div>
    </section>
  );
};
