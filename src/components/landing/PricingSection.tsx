import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const STUDENT_FEATURES = [
  'Daily AI Study Plans',
  'Unlimited Practice Tests',
  'Ask AI Mentor (Unlimited)',
  'Snap & Solve (50/month)',
  'Rank Predictor',
  'Formula Sheets Access',
];

const INSTITUTE_FEATURES = [
  'Everything in Student Plan',
  'Teacher Dashboard',
  'Student Analytics',
  'Custom Batch Management',
  'Priority Support',
  'B2B Onboarding Support',
];

const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate('/signup');
  };

  const handleContactSales = () => {
    navigate('/signup');
  };

  return (
    <section id="pricing" className="py-24 bg-white select-none border-t border-[#F0EDE6]/40 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FF6B00]/[0.01] blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FF6B00]/[0.02] blur-[100px] pointer-events-none animate-pulse-soft" />

      <div className="max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* Header Section */}
        <div className="text-center max-w-xl mx-auto mb-16 sm:mb-20">
          <p className="text-xs font-bold uppercase tracking-[2.5px] text-[#FF6B00] mb-3 font-sans">
            PRICING OPTIONS
          </p>
          <h2 className="text-3xl sm:text-[44px] font-display font-black text-[#0D1117] leading-tight tracking-tight">
            Simple, Honest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#E55A00]">Pricing.</span>
          </h2>
          <p className="text-[#374151] text-base sm:text-lg font-sans mt-3 font-medium">
            No hidden fees. Free trial for 7 days. Cancel anytime.
          </p>
        </div>

        {/* 2-Card Grid Layout (Student vs Institute) - Max Width 900px */}
        <div className="grid md:grid-cols-2 gap-8 max-w-[860px] mx-auto items-stretch">
          
          {/* Card 1 — Student Plan (Featured & Glowing) */}
          <div
            style={{ contentVisibility: 'auto' }}
            className="reveal relative flex flex-col justify-between rounded-[24px] bg-white border-2 border-[#FF6B00] p-8 sm:p-10 shadow-[0_16px_40px_rgba(255,107,0,0.08)] hover:shadow-[0_20px_48px_rgba(255,107,0,0.14)] hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group"
          >
            {/* Glow Aura backdrop inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/[0.02] to-transparent pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              {/* Saffron "Most Popular" Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFF0E6] text-[#FF6B00] text-xs font-extrabold font-sans tracking-wide">
                <Star className="w-3.5 h-3.5 fill-[#FF6B00]" />
                Most Popular
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0D1117] font-display">Student Plan</h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-[52px] font-display font-black text-[#0D1117] tracking-tight leading-none">₹349</span>
                <span className="text-base font-bold text-[#475569] font-sans">/month</span>
              </div>
              <p className="text-[11.5px] text-[#6B7280] font-sans font-bold pl-0.5">
                Billed monthly. Complete features unlocked.
              </p>

              {/* Divider */}
              <div className="border-t border-[#F0EDE6]/80" />

              {/* Features vector check list */}
              <ul className="space-y-4 pt-2">
                {STUDENT_FEATURES.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#374151] text-[15px] font-sans font-bold">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA: Start Free Trial */}
            <div className="pt-8 relative z-10">
              <button
                onClick={handleStartTrial}
                className="w-full py-4 rounded-xl bg-[#FF6B00] hover:bg-gradient-to-r hover:from-[#FF6B00] hover:to-[#E55A00] text-white font-display font-black text-base transition-all duration-200 active:scale-[0.98] border-none shadow-md shadow-[#FF6B00]/10 cursor-pointer"
              >
                Start Free Trial →
              </button>
            </div>
          </div>

          {/* Card 2 — Institute Plan */}
          <div
            style={{ contentVisibility: 'auto' }}
            className="reveal relative flex flex-col justify-between rounded-[24px] bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] p-8 sm:p-10 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:border-violet-500/30 hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group"
          >
            <div className="space-y-6 relative z-10">
              {/* Purple "For Coaching Centers" Badge */}
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#F3F0FF] text-[#6D28D9] text-xs font-extrabold font-sans tracking-wide">
                🏫 For Coaching Centers
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0D1117] font-display">Institute Plan</h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-[52px] font-display font-black text-[#0D1117] tracking-tight leading-none">₹349</span>
                <span className="text-base font-bold text-[#475569] font-sans">/student/month</span>
              </div>
              <p className="text-[11.5px] text-[#6B7280] font-sans font-bold pl-0.5">
                Min. 10 students. Managed onboarding included.
              </p>

              {/* Divider */}
              <div className="border-t border-[#F0EDE6]/80" />

              {/* Features vector check list */}
              <ul className="space-y-4 pt-2">
                {INSTITUTE_FEATURES.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#374151] text-[15px] font-sans font-bold">
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA: Contact Sales */}
            <div className="pt-8 relative z-10">
              <button
                onClick={handleContactSales}
                className="w-full py-4 rounded-xl bg-white border border-[#D1D5DB] text-[#475569] hover:text-[#6D28D9] hover:border-[#6D28D9] hover:bg-[#F3F0FF]/30 font-display font-black text-base transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Contact Sales →
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
