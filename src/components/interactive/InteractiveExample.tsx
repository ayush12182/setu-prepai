import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MathLine } from '@/utils/mathRenderer';
import { ChevronDown, Sparkles, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

export interface InteractiveExampleProps {
  id: string;
  question: string;
  hints: string[];
  thinkTime: string;
  steps: string[];
  finalAnswer: string;
  alternativeMethod?: string;
  commonMistakes?: string[];
}

export const InteractiveExample: React.FC<InteractiveExampleProps> = ({
  id,
  question,
  hints,
  thinkTime,
  steps,
  finalAnswer,
  alternativeMethod,
  commonMistakes
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  // Steps:
  // 0: Question only
  // 1 to hints.length: Hints revealed
  // hints.length + 1: Think Time revealed
  // hints.length + 2 to hints.length + 1 + steps.length: Steps revealed
  // Final: Answer and optional extras (alternative, common mistakes) revealed

  const totalStates = 1 + hints.length + 1 + steps.length + 1; // states counting from 0

  const handleNext = () => {
    if (currentStep < totalStates - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="my-8 space-y-4">
      <Card className="border border-border bg-card shadow-md rounded-2xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <span className="text-body-sm font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Solved Illustration (Interactive)
          </span>
          {currentStep > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
        <CardContent className="p-6 space-y-6 text-left">
          {/* 1. Question */}
          <div className="space-y-2">
            <span className="text-caption font-bold text-muted-foreground uppercase tracking-wider">Question</span>
            <div className="text-body-lg font-bold text-foreground">
              <MathLine>{question}</MathLine>
            </div>
          </div>

          {/* 2. Hints */}
          {hints.map((hint, idx) => {
            const isRevealed = currentStep >= 1 + idx;
            if (!isRevealed) return null;
            return (
              <div key={idx} className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-caption font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Hint {idx + 1}</span>
                <p className="text-body-sm text-foreground font-semibold">
                  <MathLine>{hint}</MathLine>
                </p>
              </div>
            );
          })}

          {/* 3. Think Time Checkpoint */}
          {currentStep >= 1 + hints.length && thinkTime && (
            <div className="p-4 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-caption font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <HelpCircle className="w-4 h-4" /> Think Time
              </span>
              <p className="text-body-sm italic font-bold text-amber-950 dark:text-amber-100">
                <MathLine>{thinkTime}</MathLine>
              </p>
            </div>
          )}

          {/* 4. Steps */}
          {steps.map((step, idx) => {
            const isRevealed = currentStep >= 1 + hints.length + 1 + idx;
            if (!isRevealed) return null;
            return (
              <div key={idx} className="pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-caption font-extrabold text-muted-foreground uppercase tracking-widest">Step {idx + 1}</span>
                <p className="text-body-md text-foreground font-bold leading-relaxed">
                  <MathLine>{step}</MathLine>
                </p>
              </div>
            );
          })}

          {/* 5. Final Answer */}
          {currentStep >= totalStates - 1 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <span className="text-caption font-bold text-primary uppercase tracking-wider">Final Answer:</span>
                <span className="text-body-lg font-black text-foreground">
                  <MathLine>{finalAnswer}</MathLine>
                </span>
              </div>

              {alternativeMethod && (
                <div className="pt-3 border-t border-border/40">
                  <span className="text-caption font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Alternative Method</span>
                  <p className="text-body-sm text-foreground font-medium">
                    <MathLine>{alternativeMethod}</MathLine>
                  </p>
                </div>
              )}

              {commonMistakes && commonMistakes.length > 0 && (
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <span className="text-caption font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1">
                    <AlertCircle className="w-4 h-4" /> Common Mistakes to Avoid
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-body-sm text-foreground font-medium">
                    {commonMistakes.map((mistake, mIdx) => (
                      <li key={mIdx}><MathLine>{mistake}</MathLine></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Stepper Buttons */}
          {currentStep < totalStates - 1 && (
            <Button
              onClick={handleNext}
              className="w-full h-11 bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-md rounded-xl flex items-center justify-center gap-1.5"
            >
              {currentStep === 0 && 'View Hint 1'}
              {currentStep > 0 && currentStep < hints.length && `View Hint ${currentStep + 1}`}
              {currentStep === hints.length && 'Enter Think Time'}
              {currentStep === hints.length + 1 && 'Solve: Step 1'}
              {currentStep > hints.length + 1 && currentStep < totalStates - 2 && `Solve: Step ${currentStep - hints.length}`}
              {currentStep === totalStates - 2 && 'Reveal Final Answer'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
