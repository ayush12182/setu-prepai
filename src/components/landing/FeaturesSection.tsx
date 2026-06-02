import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bot, Trophy, BarChart3, ArrowRight, Check, Sparkles, Clock, Star } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/signup');
  };

  return (
    <section id="features" className="py-24 bg-white select-none border-t border-[#F0EDE6]/40 relative overflow-hidden">
      {/* Visual Accent Ambient Orbs */}
      <div className="absolute top-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FF6B00]/[0.01] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF6B00]/[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[2.5px] text-[#FF6B00] mb-3 font-sans">
            WHAT YOU GET
          </p>
          <h2 className="text-3xl sm:text-[44px] font-display font-black text-[#0D1117] leading-tight tracking-tight">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#E55A00]">Crack the Exam.</span>
          </h2>
          <p className="text-[#374151] text-base sm:text-lg font-sans mt-3 font-medium">
            One platform. Integrated tools. Zero distractions.
          </p>
        </div>

        {/* 4-Card Premium Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-12">
          
          {/* Card 1: Adaptive Study Planner (Col span 7 - Large Bento Box) */}
          <div className="md:col-span-7 rounded-3xl bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] p-8 shadow-sm hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative min-h-[380px] group">
            
            {/* Background Saffron Orb */}
            <div className="absolute bottom-[-15%] right-[-15%] w-48 h-48 rounded-full bg-[#FF6B00]/[0.03] blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-300" />
            
            {/* Top Text Details */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center mb-5 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Calendar className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0D1117] font-display mb-2 leading-snug">
                Adaptive Study Planner
              </h3>
              <p className="text-[#374151] text-sm sm:text-[15px] font-sans leading-relaxed max-w-[90%] font-medium">
                Our active AI scheduling algorithms dynamically map your custom syllabus timeline. As you complete topics, your schedule auto-adjusts to clear backlogs instantly.
              </p>
            </div>

            {/* Simulated UI Mockup (Checklists) */}
            <div className="mt-8 bg-white border border-[#F0EDE6] rounded-2xl p-4 shadow-sm relative z-10 w-full max-w-[95%] shrink-0">
              <div className="flex items-center justify-between border-b border-[#F0EDE6]/60 pb-2 mb-3">
                <span className="text-[10px] font-extrabold text-[#6B7280] tracking-wider uppercase">Weekly Milestones</span>
                <span className="text-[10px] font-extrabold text-emerald-500">75% Done</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-sans font-bold text-slate-400 line-through">Physics: Mechanics Revision</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center shrink-0 border border-[#FF6B00]/25">
                    <Clock className="w-3 h-3 animate-pulse" />
                  </div>
                  <span className="text-[11.5px] font-sans font-bold text-[#0D1117]">Active: Chemistry Thermodynamics</span>
                </div>
              </div>
            </div>

          </div>

          {/* Card 2: 24/7 AI Mentor (Col span 5 - Medium Bento Box) */}
          <div className="md:col-span-5 rounded-3xl bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] p-8 shadow-sm hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative min-h-[380px] group">
            
            {/* Background Saffron Orb */}
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 rounded-full bg-[#FF6B00]/[0.02] blur-[30px] pointer-events-none" />

            {/* Top Text Details */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center mb-5 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Bot className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0D1117] font-display mb-2 leading-snug">
                24/7 Generative AI Mentor
              </h3>
              <p className="text-[#374151] text-sm sm:text-[15px] font-sans leading-relaxed font-medium">
                Upload notes or type queries to receive instant, step-by-step math breakdowns and physics formula resolutions. Guided study assistance, available day and night.
              </p>
            </div>

            {/* Simulated Chat Interface */}
            <div className="mt-8 bg-white border border-[#F0EDE6] rounded-2xl p-4 shadow-sm w-full space-y-2 shrink-0">
              <div className="bg-[#1E293B] text-white p-2.5 rounded-2xl rounded-tr-none text-[10.5px] font-sans font-medium max-w-[90%] self-end ml-auto">
                Explain Snell's Law in optics.
              </div>
              <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/25 text-[#FF6B00] p-2.5 rounded-2xl rounded-tl-none text-[10.5px] font-sans font-semibold max-w-[92%]">
                n₁ sin(θ₁) = n₂ sin(θ₂) ✓
              </div>
            </div>

          </div>

          {/* Card 3: Real-Time Exam Engine (Col span 5 - Medium Bento Box) */}
          <div className="md:col-span-5 rounded-3xl bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] p-8 shadow-sm hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative min-h-[380px] group">
            
            {/* Background Saffron Orb */}
            <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 rounded-full bg-[#FF6B00]/[0.02] blur-[30px] pointer-events-none" />

            {/* Top Text Details */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center mb-5 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Trophy className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0D1117] font-display mb-2 leading-snug">
                Mock Exam Engine
              </h3>
              <p className="text-[#374151] text-sm sm:text-[15px] font-sans leading-relaxed font-medium">
                Simulate real JEE and NEET test constraints. Solve 10,000+ chapter-wise PYQs inside a locked-down, high-performance mock exam workspace built to eliminate test anxiety.
              </p>
            </div>

            {/* Timer Mockup */}
            <div className="mt-8 bg-white border border-[#F0EDE6] rounded-2xl p-4 shadow-sm flex items-center justify-between w-full shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider">JEE Main Simulation</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-500 font-mono text-[10px] font-black">
                02:44:59
              </span>
            </div>

          </div>

          {/* Card 4: AI Rank Predictor & Analytics (Col span 7 - Large Bento Box) */}
          <div className="md:col-span-7 rounded-3xl bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] p-8 shadow-sm hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative min-h-[380px] group">
            
            {/* Background Saffron Orb */}
            <div className="absolute top-[-15%] left-[-15%] w-48 h-48 rounded-full bg-[#FF6B00]/[0.03] blur-[40px] pointer-events-none" />

            {/* Top Text Details */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center mb-5 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
                <BarChart3 className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0D1117] font-display mb-2 leading-snug">
                Analytics & Rank Predictor
              </h3>
              <p className="text-[#374151] text-sm sm:text-[15px] font-sans leading-relaxed max-w-[90%] font-medium">
                Uncover weak areas instantly. Our predictive algorithms analyze test velocity, revision consistency, and exam accuracies to project your expected All India Rank (AIR) in real time.
              </p>
            </div>

            {/* Score trend mockup graph */}
            <div className="mt-8 bg-white border border-[#F0EDE6] rounded-2xl p-4 shadow-sm w-full max-w-[95%] shrink-0 flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider mb-0.5">Syllabus Score</p>
                <p className="text-lg font-black text-[#FF6B00]">156/180</p>
              </div>

              <div className="w-[60%] h-10">
                <svg className="w-full h-full" viewBox="0 0 150 40">
                  <path
                    d="M 5 35 L 40 28 L 75 18 L 110 12 L 145 5"
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="5" cy="35" r="2.5" fill="#3B82F6" />
                  <circle cx="40" cy="28" r="2.5" fill="#3B82F6" />
                  <circle cx="75" cy="18" r="2.5" fill="#3B82F6" />
                  <circle cx="110" cy="12" r="2.5" fill="#3B82F6" />
                  <circle cx="145" cy="5" r="3.5" fill="#FF6B00" stroke="white" strokeWidth="1" />
                </svg>
              </div>
            </div>

          </div>

        </div>

        {/* Dynamic final CTA button below bento grid */}
        <div className="flex flex-col items-center justify-center text-center mt-16 reveal">
          <button
            onClick={handleStartFree}
            className="group text-sm font-sans font-extrabold px-8 py-4 rounded-xl bg-[#FF6B00] hover:bg-gradient-to-r hover:from-[#FF6B00] hover:to-[#E55A00] text-white hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#FF6B00]/10 flex items-center gap-2 cursor-pointer"
          >
            Explore All Features
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
