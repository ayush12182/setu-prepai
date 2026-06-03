import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Check, Shield, Zap, Sparkles, BrainCircuit, Users, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { startSubscriptionCheckout } from '@/lib/paymentEngine';
import { useToast } from '@/hooks/use-toast';

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (amount: number) => {
    try {
      if (!user) {
        toast({ title: 'Login Required', description: 'Please login to upgrade your account', variant: 'destructive' });
        return;
      }
      setIsProcessing(true);
      toast({ title: 'Connecting to Bank...', description: 'Securing connection via Cashfree Payments.' });
      
      await startSubscriptionCheckout(amount, user);
      
      // If modal opens, control returns to user. IsProcessing reset to false.
      setIsProcessing(false);
    } catch (err: unknown) {
      setIsProcessing(false);
      toast({ title: 'Payment Error', description: err instanceof Error ? err.message : 'Failed to initialize checkout', variant: 'destructive' });
    }
  };

  return (
    <MainLayout title="Upgrade to PrepEntrance Pro">
      <div className="max-w-6xl mx-auto py-12 px-6">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-bold uppercase tracking-widest text-xs border border-accent/20 mb-4">
            <Shield className="w-3.5 h-3.5" /> Secure Checkout
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Unlock your <span className="text-accent">Ultimate Rank</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upgrade to PrepEntrance Pro to unlock the AI Academic Coach, hyper-personalized Adaptive Mock Tests, and unlimited access to the Commune Focus Rooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 animate-fade-in" style={{ animationDelay: '100ms' }}>
          
          {/* Free Tier */}
          <div className="bg-card border border-border rounded-3xl p-8 hover:border-accent/40 transition-all duration-300 relative">
            <h3 className="text-2xl font-bold text-foreground mb-2">Basic Learner</h3>
            <p className="text-muted-foreground mb-6">Everything you need to start.</p>
            <div className="mb-8">
              <span className="text-4xl font-display font-bold text-foreground">₹0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {[
                'Standard Chapter Questions',
                'Basic Concept Summaries',
                'Access to Public Lectures',
              ].map(feat => (
                <li key={feat} className="flex items-start gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> {feat}
                </li>
              ))}
              <li className="flex items-start gap-3 text-muted-foreground/50 line-through">
                <Check className="w-5 h-5 opacity-0 shrink-0 mt-0.5" /> AI Academic Coach Engine
              </li>
              <li className="flex items-start gap-3 text-muted-foreground/50 line-through">
                <Check className="w-5 h-5 opacity-0 shrink-0 mt-0.5" /> Unlimited PrepEntrance Commune Access
              </li>
            </ul>
            
            <Button variant="outline" className="w-full rounded-xl h-14 font-bold" disabled>
              Current Plan
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-950 border border-border rounded-3xl p-8 relative shadow-2xl overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="absolute top-0 right-8 bg-accent text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-b-xl shadow-lg">
              Most Popular
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> PrepEntrance Pro
              </h3>
              <p className="text-white/60 mb-6">The definitive unfair advantage.</p>
              
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-white">₹249</span>
                <span className="text-white/50 font-medium">/month</span>
              </div>
              
              <ul className="space-y-5 mb-10">
                {[
                  { text: 'Full AI Academic Coach Analytics', icon: BrainCircuit, color: 'text-amber-400' },
                  { text: 'Adaptive Diagnostic Testing Engine', icon: Target, color: 'text-emerald-400' },
                  { text: 'Unlimited Commune Focus Rooms', icon: Users, color: 'text-blue-400' },
                  { text: 'Personalized Daily Study Missions', icon: Zap, color: 'text-rose-400' },
                ].map(feat => (
                  <li key={feat.text} className="flex items-start gap-3 text-white/90 font-medium">
                    <feat.icon className={`w-5 h-5 shrink-0 mt-0.5 ${feat.color}`} /> {feat.text}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleCheckout(249.00)} 
                disabled={isProcessing}
                className="w-full bg-accent text-primary-foreground border-none rounded-xl h-14 font-bold text-lg hover:bg-accent/90 shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-[1.02] transition-all"
              >
                {isProcessing ? 'Connecting...' : 'Upgrade Now'} 🚀
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <p className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5" /> Secured deeply by
          </p>
          {/* A generic badge to signify cashfree since we don't have an SVG asset locally */}
          <div className="h-8 flex font-display font-bold items-center gap-1 text-xl tracking-tight text-[#5F259F]">
            CASHFREE PAYMENTS
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;
