import React from 'react';
import { Brain, Target, Clock } from 'lucide-react';

const COLUMNS = [
  {
    Icon: Brain,
    title: 'AI That Actually Understands You',
    desc: 'Not just answers — our AI explains the WHY behind every concept.',
  },
  {
    Icon: Target,
    title: 'Built for Indian Exams',
    desc: 'JEE, NEET, CUET patterns. NTA-aligned questions. NCERT-based concepts.',
  },
  {
    Icon: Clock,
    title: '24/7 Without Judgment',
    desc: 'Ask the same doubt 10 times. No shame. No waiting. Always available.',
  },
];

const WhyUs: React.FC = () => {
  return (
    <section id="why-us" className="bg-[#FAFAF7] py-20 select-none">
      <div className="max-w-7xl mx-auto px-5 sm:px-20">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-[42px] font-display font-black text-[#0D1117] leading-tight">
            Why choose <span className="text-[#FF6B00]">PrepEntrance?</span>
          </h2>
        </div>

        {/* 3-column comparison layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {COLUMNS.map((col, idx) => (
            <div 
              key={idx}
              className="reveal flex flex-col items-center text-center bg-white border-[1.5px] border-[#F0EDE6] rounded-2xl p-7 shadow-sm hover:border-[#FF6B00]/30 transition-all duration-200"
            >
              {/* Icon 40px circle bg #FFF0E6, icon 20px saffron */}
              <div className="w-10 h-10 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#FF6B00] mb-4 shrink-0 shadow-sm">
                <col.Icon className="w-5 h-5 stroke-[1.8]" />
              </div>

              {/* Title: Nunito 700 18px #0D1117 */}
              <h3 className="font-display font-bold text-lg text-[#0D1117] mb-3 leading-snug">
                {col.title}
              </h3>

              {/* Desc: Inter 400 14px #6B7280 line-height 1.6 */}
              <p className="font-sans font-normal text-[14px] text-[#6B7280] leading-[1.6]">
                {col.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyUs;
