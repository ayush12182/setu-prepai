import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fff7ed]/30 to-white" />
      
      {/* Static decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#1e3a5f]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#e07a3a]/10 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] mb-6 shadow-xl shadow-[#1e3a5f]/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e3a5f] mb-4">
          Ready to start the <span className="bg-gradient-to-r from-[#e07a3a] to-[#d06a2a] bg-clip-text text-transparent">right way</span>?
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
          Join thousands of students who found clarity with SETU.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="group h-14 px-8 text-lg font-semibold bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] text-white hover:from-[#2a4a6f] hover:to-[#3a5a7f] rounded-xl shadow-xl shadow-[#1e3a5f]/25 hover:shadow-2xl hover:shadow-[#1e3a5f]/30 transition-all duration-300 hover:-translate-y-1"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-medium">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
