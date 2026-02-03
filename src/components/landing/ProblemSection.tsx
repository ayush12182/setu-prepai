import React from 'react';
import { X, HelpCircle } from 'lucide-react';

const problemsLeft = [
  'Too many videos',
  'Too many PDFs',
  'Too many opinions',
  'Too many apps',
];

const problemsRight = [
  'What to study first',
  'What to skip',
  'How deeply to study a topic',
  'Whether they are on the right track',
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-semibold mb-4">
            The Reality Check
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
            The Real Problem
          </h2>
          <p className="text-secondary-foreground text-lg max-w-lg mx-auto">
            It's not about studying more. It's about studying <span className="font-semibold text-primary">right</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Too much */}
          <div className="group relative bg-card border border-destructive/20 rounded-2xl p-7 shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center shadow-lg">
                <X className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary">
                Students have too much of...
              </h3>
            </div>
            <ul className="space-y-4">
              {problemsLeft.map((problem, i) => (
                <li key={i} className="flex items-center gap-4 group/item">
                  <span className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-sm text-destructive font-bold flex-shrink-0 group-hover/item:scale-110 transition-transform">
                    ×
                  </span>
                  <span className="text-primary font-medium">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Don't know */}
          <div className="group relative bg-card border border-accent/30 rounded-2xl p-7 shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary">
                But they don't know...
              </h3>
            </div>
            <ul className="space-y-4">
              {problemsRight.map((problem, i) => (
                <li key={i} className="flex items-center gap-4 group/item">
                  <span className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-sm text-accent font-bold flex-shrink-0 group-hover/item:scale-110 transition-transform">
                    ?
                  </span>
                  <span className="text-primary font-medium">{problem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
