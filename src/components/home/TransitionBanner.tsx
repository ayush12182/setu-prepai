import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransitionBannerProps {
  message: string;
}

export const TransitionBanner: React.FC<TransitionBannerProps> = ({ message }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(270,70%,55%)] to-[hsl(210,80%,55%)] p-6 text-white shadow-lg">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg leading-tight mb-1">Advanced Learning Unlocked!</h3>
          <p className="text-white/80 text-sm">{message}</p>
        </div>
        <Button
          variant="secondary"
          className="shrink-0 gap-1.5 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
        >
          Explore <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
