import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ChallengeCard {
  id: string;
  category: string;
  title: string;
  howItHelps: string;
  illustration: React.ReactNode;
  bgClass: string;
  accentBg: string;
  accentText: string;
}

const ChallengeSection: React.FC = () => {
  const navigate = useNavigate();

  const handleFreeTrial = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/signup');
  };

  const handleHowItHelps = (e: React.MouseEvent) => {
    e.stopPropagation();
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cards: ChallengeCard[] = [
    {
      id: 'material',
      category: 'Study Material',
      title: 'Scattered Notes & Incomplete Lectures',
      howItHelps: 'Centralize your textbooks, checklists, sync logs, and syllabus progress into one single, organized study path.',
      bgClass: 'bg-[#FAFFFE]',
      accentBg: 'bg-[#0EA5E9]',
      accentText: 'text-[#0EA5E9]',
      illustration: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular abstract backdrop representing central tracking */}
          <circle cx="60" cy="60" r="45" fill="#0EA5E9" fillOpacity="0.04" />
          <circle cx="60" cy="60" r="28" fill="#0EA5E9" fillOpacity="0.08" />
          
          {/* Organized timeline system */}
          <g transform="translate(15, 30) rotate(-6)">
            <rect x="0" y="0" width="70" height="55" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1.8" />
            <line x1="10" y1="15" x2="45" y2="15" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="26" x2="60" y2="26" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="36" x2="50" y2="36" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          <g transform="translate(45, 36) rotate(4)">
            <rect x="0" y="0" width="70" height="55" rx="8" fill="white" stroke="#0EA5E9" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 4px 12px rgba(14,165,233,0.12))' }} />
            <line x1="10" y1="15" x2="52" y2="15" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="26" x2="36" y2="26" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="36" x2="60" y2="36" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
            <circle cx="60" cy="15" r="3.5" fill="#0EA5E9" />
          </g>
          
          {/* Floating symbols */}
          <circle cx="10" cy="42" r="4.5" fill="#FF6B00" />
          <circle cx="105" cy="95" r="6" fill="#0EA5E9" fillOpacity="0.25" />
          <text x="96" y="52" fill="#FF6B00" fontFamily="sans-serif" fontSize="16" fontWeight="bold">?</text>
        </svg>
      )
    },
    {
      id: 'tests',
      category: 'Practice Tests',
      title: 'Afraid of Mock Tests?',
      howItHelps: 'Build real test-taking confidence through guided practice simulations and stress-free dashboard analytics.',
      bgClass: 'bg-[#FFFAF5]',
      accentBg: 'bg-[#FF6B00]',
      accentText: 'text-[#FF6B00]',
      illustration: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="45" fill="#FF6B00" fillOpacity="0.04" />
          
          {/* Circular anxiety performance indicator gauge */}
          <circle cx="60" cy="60" r="28" stroke="#E2E8F0" strokeWidth="4" />
          <circle cx="60" cy="60" r="28" stroke="#FF6B00" strokeWidth="4" strokeDasharray="180" strokeDashoffset="105" strokeLinecap="round" />
          
          {/* Blinking countdown timer */}
          <g transform="translate(10, 20)">
            <rect x="0" y="0" width="50" height="18" rx="9" fill="#FFF5F5" stroke="#EF4444" strokeWidth="1.2" />
            <circle cx="10" cy="9" r="3" fill="#EF4444" className="animate-pulse" />
            <text x="18" y="12" fill="#EF4444" fontFamily="monospace" fontSize="8" fontWeight="bold">04:59</text>
          </g>
          
          {/* Scoring metric alert popup card */}
          <g transform="translate(75, 70) rotate(-3)">
            <rect x="0" y="0" width="50" height="34" rx="6" fill="white" stroke="#1E293B" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.06))' }} />
            <circle cx="25" cy="17" r="7" fill="#EF4444" fillOpacity="0.08" />
            <text x="23" y="21" fill="#EF4444" fontFamily="sans-serif" fontSize="10" fontWeight="900">!</text>
          </g>
        </svg>
      )
    },
    {
      id: 'formulas',
      category: 'Formula Sheets',
      title: 'Forgetting Important Formulas?',
      howItHelps: 'Retain key mathematical and chemical models with AI spaced-repetition schedules that help formulas stick.',
      bgClass: 'bg-[#F5F5FF]',
      accentBg: 'bg-[#8B5CF6]',
      accentText: 'text-[#8B5CF6]',
      illustration: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="45" fill="#8B5CF6" fillOpacity="0.04" />
          
          {/* Dark glassmorphic equation chalkboard */}
          <rect x="15" y="25" width="90" height="70" rx="10" fill="#0F172A" stroke="#8B5CF6" strokeWidth="2" style={{ filter: 'drop-shadow(0 6px 18px rgba(139,92,246,0.12))' }} />
          
          {/* Scientific floating details */}
          <text x="26" y="46" fill="#FFFFFF" fontFamily="monospace" fontSize="10" fontWeight="bold">E = mc²</text>
          <text x="26" y="64" fill="#A78BFA" fontFamily="monospace" fontSize="8">Δx·Δp ≥ ℏ/2</text>
          <text x="26" y="80" fill="#34D399" fontFamily="monospace" fontSize="8">PV = nRT</text>
          
          {/* Concept molecules */}
          <g transform="translate(80, 75) scale(0.7)">
            <ellipse cx="20" cy="20" rx="18" ry="6" transform="rotate(35 20 20)" stroke="#FF6B00" strokeWidth="1" fill="none" />
            <ellipse cx="20" cy="20" rx="18" ry="6" transform="rotate(125 20 20)" stroke="#8B5CF6" strokeWidth="1" fill="none" />
            <circle cx="20" cy="20" r="3" fill="#FF6B00" />
          </g>
        </svg>
      )
    },
    {
      id: 'backlog',
      category: 'Backlog Removal',
      title: 'Backlogs Getting Bigger Every Week?',
      howItHelps: 'Identify missed goals instantly and convert delayed chapters into a structured recovery plan.',
      bgClass: 'bg-[#FFF5F5]',
      accentBg: 'bg-[#EF4444]',
      accentText: 'text-[#EF4444]',
      illustration: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="45" fill="#EF4444" fillOpacity="0.04" />
          
          {/* Heavy pending task layer stack */}
          <g transform="translate(30, 24)">
            <rect x="0" y="70" width="60" height="8" rx="2" fill="#1E293B" stroke="#374151" strokeWidth="1.8" />
            <rect x="4" y="60" width="52" height="8" rx="2" fill="#475569" stroke="#374151" strokeWidth="1.8" />
            <rect x="8" y="50" width="44" height="8" rx="2" fill="#64748B" stroke="#374151" strokeWidth="1.8" />
            <rect x="12" y="40" width="36" height="8" rx="2" fill="#94A3B8" stroke="#374151" strokeWidth="1.8" />
            <rect x="9" y="30" width="35" height="8" rx="2" fill="#FCA5A5" stroke="#EF4444" strokeWidth="1.8" transform="rotate(4 17 34)" />
            <rect x="16" y="20" width="26" height="8" rx="2" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.8" transform="rotate(-6 22 24)" />
          </g>
          
          {/* Warning vector arrow */}
          <path d="M 18 35 L 18 65 M 13 60 L 18 65 L 23 60" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="27" r="2.5" fill="#EF4444" />
        </svg>
      )
    },
    {
      id: 'revision',
      category: 'Revision Plans',
      title: 'Revision Without Direction',
      howItHelps: 'Eliminate confusion with automated calendar roadmaps, target ticks, and personalized daily goals.',
      bgClass: 'bg-[#F5FFF8]',
      accentBg: 'bg-[#10B981]',
      accentText: 'text-[#10B981]',
      illustration: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="45" fill="#10B981" fillOpacity="0.04" />
          
          {/* Organized calendar milestone card */}
          <rect x="22" y="30" width="76" height="60" rx="8" fill="white" stroke="#10B981" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 4px 12px rgba(16,185,129,0.08))' }} />
          <rect x="22" y="30" width="76" height="16" rx="8" fill="#10B981" />
          <rect x="22" y="38" width="76" height="8" fill="#10B981" />
          
          <circle cx="32" cy="38" r="2" fill="white" />
          <circle cx="88" cy="38" r="2" fill="white" />
          
          {/* Revision timeline curved route */}
          <path d="M 32 75 Q 60 55, 88 75" stroke="#E2E8F0" strokeWidth="3" fill="none" />
          <path d="M 32 75 Q 60 55, 60 63" stroke="#FF6B00" strokeWidth="3" fill="none" />
          
          {/* Milestone nodes */}
          <circle cx="32" cy="75" r="4.5" fill="#10B981" stroke="white" strokeWidth="1.5" />
          <circle cx="60" cy="63" r="4.5" fill="#FF6B00" stroke="white" strokeWidth="1.5" />
          <circle cx="88" cy="75" r="4.5" fill="#E2E8F0" stroke="white" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'mentorship',
      category: 'AI Mentorship',
      title: 'Preparing Alone?',
      howItHelps: 'Stay constantly supported with 24/7 conceptual checkups and instant explanation feedback loops.',
      bgClass: 'bg-[#FFF8F0]',
      accentBg: 'bg-[#F59E0B]',
      accentText: 'text-[#F59E0B]',
      illustration: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="45" fill="#F59E0B" fillOpacity="0.04" />
          
          {/* Centralized neural brain core */}
          <rect x="35" y="35" width="50" height="50" rx="25" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.12))' }} />
          
          <circle cx="60" cy="60" r="10" fill="#3B82F6" fillOpacity="0.18" />
          <circle cx="60" cy="60" r="4.5" fill="#FF6B00" />
          
          {/* Concept solved chat widgets */}
          <g transform="translate(10, 15) rotate(-6)">
            <rect x="0" y="0" width="46" height="24" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1.2" />
            <text x="6" y="15" fill="#64748B" fontFamily="sans-serif" fontSize="8" fontWeight="bold">Doubt?</text>
          </g>
          
          <g transform="translate(75, 78) rotate(4)">
            <rect x="0" y="0" width="50" height="24" rx="6" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.2" />
            <text x="6" y="15" fill="white" fontFamily="sans-serif" fontSize="8" fontWeight="black">Solved! ✓</text>
          </g>
          
          {/* Signal orbits */}
          <path d="M 42 60 L 25 32" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 78 60 L 92 78" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      )
    }
  ];

  return (
    <section id="challenges" className="py-20 bg-[#FAFAF7] select-none font-sans">
      <div className="max-w-7xl mx-auto px-5 sm:px-20">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-sans font-extrabold uppercase tracking-[2px] text-[#FF6B00] mb-3">
            IDENTIFY YOUR PROBLEM
          </p>
          <h2 className="text-3xl sm:text-[42px] font-sans font-extrabold text-[#0D1117] leading-tight">
            What's Your Biggest <span className="text-[#FF6B00]">Challenge?</span>
          </h2>
          <p className="text-[#6B7280] text-base sm:text-[17px] font-sans font-medium mt-3 leading-relaxed">
            PrepEntrance has a dedicated AI solution for every problem.
          </p>
        </div>

        {/* 2x3 Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate('/signup')}
              style={{ 
                contentVisibility: 'auto',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="reveal group flex flex-col justify-between rounded-[24px] bg-white border-[1.5px] border-[#F0EDE6] shadow-md shadow-gray-200/50 hover:translate-y-[-6px] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] cursor-pointer overflow-hidden relative min-h-[460px]"
            >
              {/* Colored accent bar at top */}
              <div className={`w-full h-1 ${card.accentBg} rounded-t-[24px] group-hover:h-[6px] transition-all duration-200 shrink-0`} />

              {/* Large visual occupying top 50% of the card */}
              <div className={`w-full h-[200px] ${card.bgClass} flex items-center justify-center relative shrink-0 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/[0.02]" />
                <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                  {card.illustration}
                </div>
              </div>

              {/* Card copywriting details */}
              <div className="p-6 pb-4 flex flex-col justify-between flex-1 relative min-h-[220px]">
                <div className="relative z-10">
                  {/* Category label */}
                  <span className="text-[11px] font-sans font-extrabold uppercase tracking-[1.5px] text-[#6B7280]">
                    {card.category}
                  </span>

                  {/* Bold Headline (Inter/Plus Jakarta Sans) */}
                  <h3 className="text-xl sm:text-[22px] font-sans font-extrabold text-[#0D1117] leading-tight mt-2 mb-3 line-clamp-2">
                    {card.title}
                  </h3>

                  {/* Subheadline (Inter/Plus Jakarta Sans) */}
                  <p className="text-sm font-sans font-medium text-[#6B7280] leading-relaxed line-clamp-3">
                    {card.howItHelps}
                  </p>
                </div>
              </div>

              {/* Bottom CTA Row (always at bottom, padding 12px 20px, border-top 1px, background rgba(255,255,255,0.5)) */}
              <div className="relative z-10 mt-auto py-3 px-5 border-t border-black/[0.06] bg-white/50 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={handleHowItHelps}
                  className={`text-[13px] font-sans font-bold ${card.accentText} flex items-center gap-0.5 hover:underline`}
                >
                  See How It Works →
                </button>
                
                <button
                  onClick={handleFreeTrial}
                  className="px-[18px] py-2 rounded-lg bg-[#FF6B00] hover:bg-[#E55A00] text-white font-sans font-bold text-xs border-none shadow-sm transition-colors duration-150"
                >
                  Solve This Problem
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ChallengeSection;
