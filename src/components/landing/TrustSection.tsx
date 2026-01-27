import React from 'react';

const trustStats = [
  { value: '21 Days', label: 'To feel the difference' },
  { value: '1 Mentor', label: 'Who understands you' },
  { value: '100% Focus', label: 'On what matters' },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
      
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8">
          {trustStats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl sm:text-5xl font-bold text-[#1e3a5f] mb-2 group-hover:text-[#e07a3a] transition-colors duration-300">
                {stat.value}
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
