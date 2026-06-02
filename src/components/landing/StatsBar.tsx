import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, BookOpen, Star } from 'lucide-react';

interface StatProps {
  Icon: React.ComponentType<any>;
  target: number;
  suffix: string;
  label: string;
  decimals?: number;
}

const CountUpStat: React.FC<StatProps> = ({ Icon, target, suffix, label, decimals = 0 }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;
    const duration = 1800; // 1800ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuad curve: progress * (2 - progress)
      const easeProgress = progress * (2 - progress);
      const currentVal = easeProgress * target;

      setValue(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, target]);

  const formattedValue = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div 
      ref={ref} 
      className="flex flex-col items-center text-center bg-white/70 backdrop-blur-md border-[1.5px] border-[#F0EDE6] rounded-2xl py-7 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(255,107,0,0.04)] hover:border-[#FF6B00]/30 hover:translate-y-[-4px] transition-all duration-300 border-b-[3.5px] border-b-[#FF6B00] space-y-3 shrink-0 reveal"
    >
      {/* Colored icon background circle */}
      <div className="w-12 h-12 rounded-full bg-[#FFF0E6]/90 text-[#FF6B00] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 hover:scale-105">
        <Icon className="w-6 h-6 stroke-[1.8]" />
      </div>

      {/* Number */}
      <span className="text-3xl sm:text-[38px] font-display font-black text-[#FF6B00] tracking-tight leading-none">
        {formattedValue}
        {suffix}
      </span>

      {/* Label */}
      <span className="text-[#374151] text-sm sm:text-[15px] font-sans font-bold tracking-normal leading-normal">
        {label}
      </span>
    </div>
  );
};

const StatsBar: React.FC = () => {
  return (
    <section className="relative w-full bg-[#FAFAF7] border-t-2 border-b-2 border-[#F0EDE6] py-10 select-none">
      <div className="max-w-7xl mx-auto px-5 sm:px-20">
        {/* Grid layout with gaps between stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CountUpStat 
            Icon={Users} 
            target={2400} 
            suffix="+" 
            label="Registered Students" 
          />
          <CountUpStat 
            Icon={BookOpen} 
            target={180000} 
            suffix="+" 
            label="Study Sessions" 
          />
          <CountUpStat 
            Icon={Star} 
            target={96.8} 
            suffix="%" 
            label="Satisfaction Rate" 
            decimals={1}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
