import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startSubscriptionCheckout } from '@/lib/paymentEngine';
import { Loader2 } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

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

  return (
    <section className="relative py-32 px-6 sm:px-12 overflow-hidden bg-setu-navy">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-conic from-accent via-transparent to-accent opacity-20 rounded-full blur-3xl"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px),
                            linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Start your journey today
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to start the
            <br />
            <span className="text-accent">right way?</span>
          </h2>

          {/* Subtext */}
          <p className="text-white/70 text-lg sm:text-xl max-w-lg mx-auto mb-10">
            From Class 6 foundations to JEE/NEET/CUET success — join students who found clarity with SETU.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            disabled={isProcessing}
            onClick={handleTrialClick}
            className="group h-16 px-10 text-lg font-semibold bg-accent text-primary hover:bg-accent/90 rounded-2xl shadow-[0_0_60px_rgba(232,154,60,0.4)] hover:shadow-[0_0_80px_rgba(232,154,60,0.5)] transition-all duration-300 hover:-translate-y-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Connecting...
              </>
            ) : (
              'Start Learning for ₹49'
            )}
            <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform" />
          </Button>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/50 text-sm">
            <span>✓ 7-Day Full Access</span>
            <span>✓ Cancel anytime</span>
            <span>✓ No hidden charges</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
