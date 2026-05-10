import React from 'react';

const COACHING_NAMES = [
  'Allen',
  'Physics Wallah',
  'Unacademy',
  'Motion Education',
  'VMC Classes',
];

const CoachingMarquee: React.FC = () => {
  return (
    <section className="relative py-10 bg-[#07111F] overflow-hidden border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 mb-8 text-center">
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
          Trusted by Teachers and Students of
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div 
          className="flex whitespace-nowrap animate-marquee items-center"
          style={{ animationDuration: '30s' }}
        >
          {[...COACHING_NAMES, ...COACHING_NAMES, ...COACHING_NAMES].map((name, i) => (
            <div 
              key={i}
              className="mx-12 text-2xl sm:text-3xl font-black text-white/20 hover:text-white/40 transition-colors cursor-default select-none tracking-tight font-display"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Gradient Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#07111F] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#07111F] to-transparent z-10" />
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </section>
  );
};

export default CoachingMarquee;
