import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function ComingSoonModal({ isOpen, onClose, title, description }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-xl p-6">
        <DialogHeader className="space-y-3 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-1">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex justify-center w-full">
          <Button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
          >
            Got it
            <ArrowRight className="w-4 h-4 ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
