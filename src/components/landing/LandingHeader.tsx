import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center hover:scale-[1.02] transition-transform">
          <img src="/setu-logo.png" alt="SETU" className="h-12 w-auto rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="text-primary hover:text-primary hover:bg-primary/5 font-medium"
          >
            Login
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/auth')}
            className="bg-primary text-primary-foreground hover:bg-[hsl(213_32%_14%)] shadow-[0_4px_12px_rgba(30,42,58,0.2)] hover:shadow-[0_6px_16px_rgba(30,42,58,0.3)] transition-all duration-300 font-medium"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
