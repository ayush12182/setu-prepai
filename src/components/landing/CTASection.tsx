import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-accent/5 to-white" />
      
      {/* Subtle decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
          Ready to start the <span className="bg-gradient-to-r from-accent to-[hsl(26_90%_55%)] bg-clip-text text-transparent">right way</span>?
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
          Join thousands of students who found clarity with SETU.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="group h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-[hsl(213_31%_22%)] rounded-xl shadow-xl shadow-primary/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
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
