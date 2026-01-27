import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center hover:scale-[1.02] transition-transform">
          <img src="/setu-logo.png" alt="SETU" className="h-12 w-auto rounded-lg shadow-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="text-gray-600 hover:text-[#1e3a5f] font-medium"
          >
            Login
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] text-white hover:from-[#2a4a6f] hover:to-[#3a5a7f] shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl transition-all duration-300 font-medium"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
