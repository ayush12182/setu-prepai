import React from 'react';
import { motion } from 'framer-motion';

const COACHING_DATA = [
  { name: 'Allen', logo: '/logos/allen.png' },
  { name: 'Physics Wallah', logo: '/logos/pw.png' },
  { name: 'Unacademy', logo: '/logos/unacademy.png' },
  { name: 'Motion Education', logo: '/logos/motion.png' },
  { name: 'VMC Classes', logo: '/logos/vmc.png' },
];

const CoachingMarquee: React.FC = () => {
  // Triple the data to ensure seamless loop
  const marqueeItems = [...COACHING_DATA, ...COACHING_DATA, ...COACHING_DATA];

  return (
    <section className="relative py-16 bg-[#07111F] overflow-hidden border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 mb-12 text-center">
        <p className="text-white/70 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]">
          Trusted by Teachers and Students of
        </p>
      </div>

      <div className="relative flex items-center">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-64 bg-gradient-to-r from-[#07111F] via-[#07111F]/80 to-transparent z-10 pointer-events-none" />
        
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-64 bg-gradient-to-l from-[#07111F] via-[#07111F]/80 to-transparent z-10 pointer-events-none" />

        <motion.div 
          className="flex whitespace-nowrap items-center gap-20 sm:gap-32 px-10"
          animate={{
            x: ["0%", "-33.33%"]
          }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity
          }}
        >
          {marqueeItems.map((item, i) => (
            <div 
              key={i}
              className="flex items-center justify-center min-w-[120px] sm:min-w-[180px] hover:scale-110 transition-transform duration-300"
            >
              <img 
                src={item.logo} 
                alt={item.name} 
                className="h-10 sm:h-14 w-auto object-contain brightness-110 contrast-110"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoachingMarquee;
