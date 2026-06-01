import React from 'react';
import { motion } from 'framer-motion';

const StudyVisual: React.FC = () => {
  // Staggered fade and slide-up animations for the unified premium dashboard container
  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] },
    },
  };

  return (
    <div className="relative w-full h-[450px] select-none flex items-center justify-center overflow-visible font-sans px-2">
      {/* Subtle radial backdrop glow */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 60% 50%, rgba(255, 107, 0, 0.07) 0%, transparent 70%)',
        }}
      />

      {/* Unified High-Fidelity Mock Dashboard Panel */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[500px] h-[390px] bg-[#0F172A] border-[2px] border-slate-800 rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden relative z-20 group hover:border-[#FF6B00]/40 transition-all duration-300"
      >
        {/* 1. Header Window Control Bar (Mac style) */}
        <div className="w-full h-10 bg-[#1E293B] px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4444] opacity-80" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] opacity-80" />
            <span className="w-3 h-3 rounded-full bg-[#10B981] opacity-80" />
          </div>
          <span className="text-[11px] font-sans font-bold tracking-wider text-slate-400 select-none">
            PrepEntrance AI OS v1.2
          </span>
          <div className="w-12 h-1 bg-slate-700/50 rounded-full" />
        </div>

        {/* 2. Main Dashboard Split-Screen Workspace */}
        <div className="flex-1 flex w-full overflow-hidden">
          
          {/* LEFT SECTION: AI Mentor Chat Interface (50% Width) */}
          <div className="w-[52%] border-r border-slate-800 flex flex-col justify-between p-3.5 bg-[#0B0F19]/90 select-none">
            {/* AI Status pill */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#FF6B00] flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white text-[9px] font-black font-sans leading-none">AI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-sans font-black text-white leading-none tracking-wide">
                  AI STUDY PARTNER
                </span>
                <span className="text-[8px] font-sans font-semibold text-emerald-400 leading-none mt-0.5">
                  • Online (24/7)
                </span>
              </div>
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 flex flex-col gap-3 justify-center">
              <div className="bg-slate-800/60 border border-slate-700/20 px-3 py-2 rounded-xl rounded-bl-none text-slate-300 font-sans text-[11px] leading-relaxed max-w-[90%]">
                <span className="text-[#FF6B00] font-sans font-extrabold text-[9px] block mb-0.5">QUESTION</span>
                How do I resolve relative velocity in Kinematics?
              </div>
              
              <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 px-3 py-2 rounded-xl rounded-tr-none text-white font-sans text-[11px] leading-relaxed max-w-[92%] self-end">
                <span className="text-[#FF6B00] font-sans font-extrabold text-[9px] block mb-0.5">AI MENTOR</span>
                When objects move along the same line, relative velocity is simply the difference between their velocities. Let's solve! ✓
              </div>
            </div>

            {/* Simulated typing area */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 font-sans font-semibold">
                Ask doubts here...
              </span>
              <span className="w-5 h-5 rounded-md bg-[#FF6B00]/25 flex items-center justify-center text-[#FF6B00] text-xs font-black">
                ➔
              </span>
            </div>
          </div>

          {/* RIGHT SECTION: Metrics, Tracker & Charts (48% Width) */}
          <div className="w-[48%] flex flex-col justify-between p-3.5 bg-[#0F172A] gap-3 overflow-y-auto select-none">
            
            {/* 1. Today's Study Plan list */}
            <div className="bg-slate-800/35 border border-slate-800/60 rounded-xl p-2.5 flex flex-col gap-1.5">
              <span className="text-[8px] font-sans font-extrabold text-[#FF6B00] uppercase tracking-wider block mb-0.5 leading-none">
                TODAY'S STUDY PLAN
              </span>
              
              <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-slate-300 leading-none">
                <span className="text-emerald-400 shrink-0">✓</span>
                <span className="line-through text-slate-500">Physics PYQs Ch.4</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-slate-300 leading-none">
                <span className="text-[#FF6B00] shrink-0 font-black">⚡</span>
                <span>Organic Chem revision</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-slate-500 leading-none">
                <span className="shrink-0">•</span>
                <span>Coordinate Math check</span>
              </div>
            </div>

            {/* 2. Progress Tracker & Rank Predictor (Grid) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Syllabus Progress */}
              <div className="bg-slate-800/35 border border-slate-800/60 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[7px] font-sans font-black text-slate-500 uppercase tracking-wider block mb-1">
                  SYLLABUS
                </span>
                <span className="text-sm font-sans font-black text-emerald-400 leading-none">
                  78%
                </span>
                <span className="text-[8px] font-sans font-semibold text-slate-400 mt-1">
                  Complete
                </span>
              </div>

              {/* Rank Prediction */}
              <div className="bg-slate-800/35 border border-slate-800/60 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[7px] font-sans font-black text-slate-500 uppercase tracking-wider block mb-1">
                  PREDICTED RANK
                </span>
                <span className="text-[12px] font-sans font-black text-[#FF6B00] leading-none">
                  AIR 1,420
                </span>
                <span className="text-[8px] font-sans font-semibold text-slate-400 mt-1">
                  JEE Target
                </span>
              </div>
            </div>

            {/* 3. Mock Test Score Chart (Mini SVG line graph) */}
            <div className="bg-slate-800/35 border border-slate-800/60 rounded-xl p-2.5 flex flex-col gap-1.5 flex-1 justify-between min-h-[90px]">
              <div className="flex items-center justify-between select-none">
                <span className="text-[8px] font-sans font-extrabold text-slate-400 uppercase tracking-wider">
                  MOCK EXAM SCORE TREND
                </span>
                <span className="text-[10px] font-sans font-black text-emerald-400 leading-none">
                  142/180
                </span>
              </div>

              {/* SVG Mock Test scores graph (85 ➔ 110 ➔ 125 ➔ 142!) */}
              <div className="w-full h-8 relative select-none">
                <svg className="w-full h-full" viewBox="0 0 160 40">
                  {/* Grid Lines */}
                  <line x1="0" y1="35" x2="160" y2="35" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="20" x2="160" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="5" x2="160" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Score line graph */}
                  <path
                    d="M 5 35 L 45 28 L 85 18 L 125 15 L 155 5"
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Score gradient fill */}
                  <path
                    d="M 5 35 L 45 28 L 85 18 L 125 15 L 155 5 L 155 40 L 5 40 Z"
                    fill="url(#score-gradient)"
                    opacity="0.12"
                  />
                  
                  {/* Node circles */}
                  <circle cx="5" cy="35" r="2.5" fill="#3B82F6" />
                  <circle cx="45" cy="28" r="2.5" fill="#3B82F6" />
                  <circle cx="85" cy="18" r="2.5" fill="#3B82F6" />
                  <circle cx="125" cy="15" r="2.5" fill="#3B82F6" />
                  <circle cx="155" cy="5" r="3.5" fill="#FF6B00" stroke="white" strokeWidth="1" />

                  <defs>
                    <linearGradient id="score-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B00" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default StudyVisual;
