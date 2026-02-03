import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
          Ready to start the <span className="text-accent">right way</span>?
        </h2>
        <p className="text-secondary-foreground text-lg mb-10 max-w-md mx-auto">
          Join thousands of students who found clarity with SETU.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="group h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-[hsl(213_32%_14%)] rounded-xl shadow-[0_6px_18px_rgba(30,42,58,0.25)] hover:shadow-[0_8px_24px_rgba(30,42,58,0.35)] transition-all duration-300 hover:-translate-y-1"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-secondary-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[hsl(var(--setu-success)/0.15)] flex items-center justify-center">
              <Check className="w-3 h-3 text-[hsl(var(--setu-success))]" />
            </div>
            <span className="font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[hsl(var(--setu-success)/0.15)] flex items-center justify-center">
              <Check className="w-3 h-3 text-[hsl(var(--setu-success))]" />
            </div>
            <span className="font-medium">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
