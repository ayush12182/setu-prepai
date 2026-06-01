import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    <section id="pricing" className="py-20 bg-white select-none">
      <div className="max-w-7xl mx-auto px-5 sm:px-20">
        
        {/* Header Section */}
        <div className="text-center max-w-xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-[42px] font-display font-black text-[#0D1117] leading-tight">
            Simple, Honest Pricing
          </h2>
          <p className="text-[#6B7280] text-base sm:text-lg font-sans mt-3">
            No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* 2-Card Grid Layout (Student vs Institute) - Max Width 900px */}
        <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto items-stretch">
          
          {/* Card 1 — Student Plan (Featured) */}
          <div
            style={{ contentVisibility: 'auto' }}
            className="reveal relative flex flex-col justify-between rounded-[20px] bg-white border-2 border-[#FF6B00] p-9 shadow-md overflow-hidden"
          >
            <div className="space-y-5">
              {/* Saffron "Most Popular" Badge */}
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#FFF0E6] text-[#FF6B00] text-xs font-bold font-sans">
                ⭐ Most Popular
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#0D1117] font-display">Student Plan</h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-[48px] font-display font-black text-[#0D1117] tracking-tight">₹249</span>
                <span className="text-sm font-bold text-[#6B7280] font-sans">/month</span>
              </div>
              <p className="text-xs text-[#9CA3AF] font-sans font-semibold pl-0.5">
                Billed monthly. Cancel anytime.
              </p>

              {/* Divider */}
              <div className="border-t border-[#F0EDE6]" />

              {/* Features checkmark emoji list */}
              <ul className="space-y-3.5 pt-2">
                {STUDENT_FEATURES.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[#374151] text-[15px] font-sans font-medium">
                    <span className="text-base shrink-0 select-none">✅</span>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA: Start Free Trial */}
            <div className="pt-8">
              <button
                onClick={handleStartTrial}
                className="w-full py-4 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-display font-bold text-base transition-all duration-150 active:scale-[0.98] border-none shadow-md shadow-[#FF6B00]/10 cursor-pointer"
              >
                Start Free Trial →
              </button>
            </div>
          </div>

          {/* Card 2 — Institute Plan */}
          <div
            style={{ contentVisibility: 'auto' }}
            className="reveal relative flex flex-col justify-between rounded-[20px] bg-[#FAFAF7] border-[1.5px] border-[#E5E7EB] p-9 shadow-sm overflow-hidden"
          >
            <div className="space-y-5">
              {/* Purple "For Coaching Centers" Badge */}
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#F3F0FF] text-[#6D28D9] text-xs font-bold font-sans">
                🏫 For Coaching Centers
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#0D1117] font-display">Institute Plan</h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-[48px] font-display font-black text-[#0D1117] tracking-tight">₹349</span>
                <span className="text-sm font-bold text-[#6B7280] font-sans">/student/month</span>
              </div>
              <p className="text-xs text-[#9CA3AF] font-sans font-semibold pl-0.5">
                Min. 10 students. Annual billing.
              </p>

              {/* Divider */}
              <div className="border-t border-[#F0EDE6]" />

              {/* Features checkmark emoji list */}
              <ul className="space-y-3.5 pt-2">
                {INSTITUTE_FEATURES.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[#374151] text-[15px] font-sans font-medium">
                    <span className="text-base shrink-0 select-none">✅</span>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA: Contact Us */}
            <div className="pt-8">
              <button
                onClick={handleContactSales}
                className="w-full py-4 rounded-xl bg-transparent border-[1.5px] border-[#6D28D9] text-[#6D28D9] font-display font-bold text-base hover:bg-[#F3F0FF] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Contact Us →
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
