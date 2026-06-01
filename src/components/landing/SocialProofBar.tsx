import React from 'react';

const SocialProofBar: React.FC = () => {
  const items = [
    { type: 'target', label: 'IITs' },
    { type: 'star', label: '⭐ 5-Star AI Mentorship' },
    { type: 'target', label: 'AIIMS' },
    { type: 'quote', label: '"Bhaiya, mechanics clear ho gaya!" — Rohit, JEE Aspirant' },
    { type: 'target', label: 'NITs' },
    { type: 'star', label: '⚡ 98.7% Accuracy Jump' },
    { type: 'target', label: 'IISER' },
    { type: 'quote', label: '"Daily plan follow kiya aur score 150+ badh gaya!" — Sneha, NEET' },
    { type: 'target', label: 'Top Universities' },
    { type: 'quote', label: '"No more backlogs, SETU is like a real dost." — Dev, Class 11' },
  ];

  // Double the list to make seamless scrolling loop possible
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="relative py-4.5 bg-[#121422] border-t border-b border-white/[0.05] overflow-hidden select-none">
      {/* Soft gradient masks on left and right to fade the edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0D0F1A] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0D0F1A] to-transparent z-10 pointer-events-none" />

      {/* Marquee Ticker Track */}
      <div className="flex w-max items-center animate-[marquee_28s_linear_infinite] gap-12 text-[#F5F0E8] font-sans">
        {tickerItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 whitespace-nowrap shrink-0">
            {item.type === 'target' && (
              <span className="text-sm font-black tracking-widest text-[#F5F0E8]/70 uppercase hover:text-[#FF6B00] transition-colors duration-200">
                {item.label}
              </span>
            )}

            {item.type === 'star' && (
              <span className="px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/25 text-[10px] sm:text-xs font-bold text-[#FF6B00]">
                {item.label}
              </span>
            )}

            {item.type === 'quote' && (
              <span className="px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] sm:text-xs text-[#F5F0E8]/85 font-medium italic">
                {item.label}
              </span>
            )}

            {/* Separator Bullet */}
            <span className="text-[#FF6B00]/30 font-black text-xs shrink-0 ml-4">•</span>
          </div>
        ))}
      </div>

      {/* Tailwind inline animation keyframe config overlay */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
      `}</style>
    </div>
  );
};

export default SocialProofBar;
