import React from 'react';

const COACHING_DATA = [
  { name: 'Allen', logo: '/logos/allen.png' },
  { name: 'Physics Wallah', logo: '/logos/pw.png' },
  { name: 'Unacademy', logo: '/logos/unacademy.png' },
  { name: 'Motion Education', logo: '/logos/motion.png' },
  { name: 'VMC Classes', logo: '/logos/vmc.png' },
];

const CoachingMarquee: React.FC = () => {
  return (
    <section className="relative py-12 bg-[#07111F] overflow-hidden border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 mb-10 text-center">
        <p className="text-white/60 text-sm font-bold uppercase tracking-[0.25em]">
          Trusted by Teachers and Students of
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group py-4">
        <div 
          className="flex whitespace-nowrap animate-marquee items-center"
          style={{ animationDuration: '40s' }}
        >
          {[...COACHING_DATA, ...COACHING_DATA, ...COACHING_DATA, ...COACHING_DATA, ...COACHING_DATA].map((item, i) => (
            <div 
              key={i}
              className="mx-14 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default select-none"
            >
              <img 
                src={item.logo} 
                alt={item.name} 
                className="h-10 sm:h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Gradient Fades for a premium look */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#07111F] via-[#07111F]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#07111F] via-[#07111F]/80 to-transparent z-10" />
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-20%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default CoachingMarquee;
