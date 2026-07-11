import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate('/signup');
  };

  return (
    <section id="pricing" className="py-24 bg-white select-none border-t border-[#F0EDE6]/40 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FF6B00]/[0.01] blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FF6B00]/[0.02] blur-[100px] pointer-events-none animate-pulse-soft" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        {/* Header Section */}
        <div className="text-center max-w-xl mx-auto mb-16 sm:mb-20">
          <p className="text-xs font-bold uppercase tracking-[2.5px] text-[#FF6B00] mb-3 font-sans">
            PREPENTRANCE BATCH PRICING
          </p>
          <h2 className="text-3xl sm:text-[44px] font-display font-black text-[#0D1117] leading-tight tracking-tight">
            Prep smarter. Practice more.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#E55A00]">Succeed with PrepEntrance.</span>
          </h2>
          <p className="text-[#374151] text-base sm:text-lg font-sans mt-3 font-medium">
            No hidden fees. Simple, honest pricing.
          </p>
        </div>

        {/* 3-Card Grid Layout */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* Card 1 — Aarambh */}
          <div
            className="relative flex flex-col justify-between rounded-[24px] bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] p-8 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:border-[#FF6B00]/30 hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group"
          >
            <div className="space-y-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-[#0D1117] font-display">Aarambh</h3>
                <p className="text-sm font-bold text-[#6B7280] font-sans">1 Month Plan</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl font-display font-black text-[#0D1117] tracking-tight leading-none">₹349</span>
                <span className="text-sm font-bold text-[#475569] font-sans">/ month</span>
              </div>
              <div className="h-[20px]" /> {/* Spacer to align with discounted cards */}

              {/* Divider */}
              <div className="border-t border-[#F0EDE6]/80" />

              {/* Features vector check list */}
              <ul className="space-y-4 pt-2">
                {[
                  '1 month complete access',
                  '2,500+ practice questions',
                  'Daily AI Study Plans',
                  'Ask AI Mentor'
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#374151] text-sm font-sans font-bold">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={handleSelectPlan}
                className="w-full py-3.5 rounded-xl bg-white border border-[#D1D5DB] text-[#475569] hover:text-[#FF6B00] hover:border-[#FF6B00] hover:bg-[#FFF0E6]/30 font-display font-black text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Get Aarambh
              </button>
            </div>
          </div>

          {/* Card 2 — Aarohan (Featured) */}
          <div
            className="relative flex flex-col justify-between rounded-[24px] bg-white border-2 border-[#FF6B00] p-8 shadow-[0_16px_40px_rgba(255,107,0,0.08)] hover:shadow-[0_20px_48px_rgba(255,107,0,0.14)] hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group transform md:scale-105 z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/[0.02] to-transparent pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] text-[#FF6B00] text-[10px] font-extrabold font-sans tracking-wide">
                <Star className="w-3 h-3 fill-[#FF6B00]" />
                Most Popular
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#0D1117] font-display">Aarohan</h3>
                <p className="text-sm font-bold text-[#6B7280] font-sans">12 Month Plan</p>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1 pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-black text-[#0D1117] tracking-tight leading-none">₹3,839</span>
                  <span className="text-sm font-bold text-[#475569] font-sans">/ year</span>
                  <span className="text-sm font-bold text-[#94A3B8] line-through decoration-2">₹4,188</span>
                </div>
                <p className="text-[11px] text-[#059669] font-sans font-bold pt-1">
                  Pay for 11 months, get 12 months access. Save ₹349.
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F0EDE6]/80" />

              {/* Features vector check list */}
              <ul className="space-y-4 pt-2">
                {[
                  '1 year complete access',
                  '5,000+ practice questions',
                  'Daily AI Study Plans',
                  'Ask AI Mentor (Unlimited)',
                  'Rank Predictor included'
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#374151] text-sm font-sans font-bold">
                    <div className="w-5 h-5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={handleSelectPlan}
                className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-gradient-to-r hover:from-[#FF6B00] hover:to-[#E55A00] text-white font-display font-black text-sm transition-all duration-200 active:scale-[0.98] border-none shadow-md shadow-[#FF6B00]/10 cursor-pointer"
              >
                Get Aarohan
              </button>
            </div>
          </div>

          {/* Card 3 — Shikhar */}
          <div
            className="relative flex flex-col justify-between rounded-[24px] bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] p-8 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:border-violet-500/30 hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group"
          >
            <div className="space-y-6 relative z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-[#F3F0FF] text-[#6D28D9] text-[10px] font-extrabold font-sans tracking-wide">
                🏆 Best Value
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#0D1117] font-display">Shikhar</h3>
                <p className="text-sm font-bold text-[#6B7280] font-sans">2 Year Complete Plan</p>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1 pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-black text-[#0D1117] tracking-tight leading-none">₹7,329</span>
                  <span className="text-sm font-bold text-[#475569] font-sans">/ 2 years</span>
                  <span className="text-sm font-bold text-[#94A3B8] line-through decoration-2">₹8,376</span>
                </div>
                <p className="text-[11px] text-[#059669] font-sans font-bold pt-1">
                  Pay for 21 months, get 24 months access. Save ₹1,047.
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F0EDE6]/80" />

              {/* Features vector check list */}
              <ul className="space-y-4 pt-2">
                {[
                  '2 years complete access',
                  '10,000+ practice questions',
                  'Daily AI Study Plans',
                  'Ask AI Mentor (Unlimited)',
                  'Complete Mock Test Series'
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#374151] text-sm font-sans font-bold">
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={handleSelectPlan}
                className="w-full py-3.5 rounded-xl bg-white border border-[#D1D5DB] text-[#475569] hover:text-[#6D28D9] hover:border-[#6D28D9] hover:bg-[#F3F0FF]/30 font-display font-black text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Get Shikhar
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
