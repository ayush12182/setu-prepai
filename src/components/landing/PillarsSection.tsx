import React from 'react';
import { Route, Brain, Target } from 'lucide-react';

const pillars = [
  {
    icon: Route,
    title: 'Structured Path',
    description: 'Chapter → Subchapter → Practice → Analysis',
    color: 'from-primary to-[hsl(213_31%_25%)]',
  },
  {
    icon: Brain,
    title: 'Thinks Like Your Teacher',
    description: 'Explains concepts step-by-step, in a calm coaching tone.',
    color: 'from-accent to-[hsl(26_90%_55%)]',
  },
  {
    icon: Target,
    title: 'Exam-Accurate Testing',
    description: '3-hour JEE Main-style tests every 21 days.',
    color: 'from-[hsl(145_50%_38%)] to-[hsl(145_50%_30%)]',
  },
];

export const PillarsSection: React.FC = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Clean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-secondary/30 to-white" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
            What makes SETU work?
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Three simple pillars. No gimmicks.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="group relative bg-card border border-border rounded-2xl p-7 shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                <pillar.icon className="h-7 w-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
