import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-24 px-6 sm:px-12 overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Pricing
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Pricing Coming Soon
          </h2>

          <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <PartyPopper className="h-8 w-8 text-accent" />
              <span className="text-2xl sm:text-3xl font-bold text-primary">FREE</span>
              <PartyPopper className="h-8 w-8 text-accent" />
            </div>

            <p className="text-secondary-foreground text-lg mb-2">
              Enjoy the <span className="text-accent font-semibold">complete free plan</span> until then!
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              All features. No credit card. No limits. Just start preparing.
            </p>

            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-14 px-8 text-base font-semibold bg-accent text-primary hover:bg-accent/90 rounded-xl shadow-[0_0_30px_rgba(232,154,60,0.3)] hover:shadow-[0_0_40px_rgba(232,154,60,0.4)] transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Free — No Card Required
            </Button>
          </div>

          <p className="text-muted-foreground text-sm">
            We'll notify you when pricing plans are ready. No surprises.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
