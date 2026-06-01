import React from 'react';

const ITEMS = [
  '📐 Mathematics',
  '⚗️ Chemistry',
  '⚡ Physics',
  '🧬 Biology',
  '📖 English',
  '🗺️ Geography',
  '📊 Economics',
  '🔬 Science',
];

const SubjectTicker: React.FC = () => {
  // Repeat items 3 times for a flawless seamless loop
  const tickerItems = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="w-full bg-[#FF6B00] h-[44px] overflow-hidden flex items-center select-none relative z-15 shadow-sm">
      <style>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee-scroll 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="animate-marquee items-center">
        {tickerItems.map((item, idx) => (
          <div key={idx} className="flex items-center shrink-0">
            <span className="text-white font-sans font-semibold text-sm px-8 whitespace-nowrap">
              {item}
            </span>
            {/* White bullet separator, except for very last item if we want, but since it loops, always add it */}
            <span className="text-white/60 font-sans font-black text-sm select-none shrink-0">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectTicker;
