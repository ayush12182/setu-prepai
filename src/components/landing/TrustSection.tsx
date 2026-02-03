import React from 'react';

const trustStats = [
  { value: '21 Days', label: 'To feel the difference' },
  { value: '1 Mentor', label: 'Who understands you' },
  { value: '100% Focus', label: 'On what matters' },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="relative py-16 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8">
          {trustStats.map((stat) => (
            <div
              key={stat.label}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2 group-hover:text-accent transition-colors duration-300">
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
