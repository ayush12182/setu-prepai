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
          {[...COACHING_DATA, ...COACHING_DATA, ...COACHING_DATA].map((item, i) => (
            <div 
              key={i}
              className="mx-12 flex items-center justify-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default select-none"
            >
              <img 
                src={item.logo} 
                alt={item.name} 
                className="h-8 sm:h-10 object-contain"
                onError={(e) => {
                  // Fallback to text if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const text = document.createElement('span');
                    text.innerText = item.name;
                    text.className = 'text-xl font-bold text-white/20';
                    parent.appendChild(text);
                  }
                }}
              />
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
