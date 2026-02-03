import React from 'react';
import { Route, Brain, Target } from 'lucide-react';

const pillars = [
  {
    icon: Route,
    title: 'Structured Path',
    description: 'Chapter → Subchapter → Practice → Analysis',
  },
  {
    icon: Brain,
    title: 'Thinks Like Your Teacher',
    description: 'Explains concepts step-by-step, in a calm coaching tone.',
  },
  {
    icon: Target,
    title: 'Exam-Accurate Testing',
    description: '3-hour JEE Main-style tests every 21 days.',
  },
];

export const PillarsSection: React.FC = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Clean background */}
      <div className="absolute inset-0 bg-background" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
            What makes SETU work?
          </h2>
          <p className="text-secondary-foreground text-lg max-w-md mx-auto">
            Three simple pillars. No gimmicks.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="group relative bg-card border border-border rounded-2xl p-7 shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon - Navy background */}
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-[0_4px_12px_rgba(30,42,58,0.25)] group-hover:scale-105 transition-transform">
                <pillar.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                {pillar.title}
              </h3>
              <p className="text-secondary-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
