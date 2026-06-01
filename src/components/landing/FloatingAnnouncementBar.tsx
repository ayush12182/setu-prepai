import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const FloatingAnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="relative w-full h-[44px] bg-[#FF6B00] flex items-center justify-between px-4 sm:px-10 z-50 select-none">
      {/* Left side: X dismiss button (white) */}
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1 rounded-full text-white hover:bg-white/10 transition-colors shrink-0"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4 stroke-[2.5]" />
      </button>

      {/* Center Text (Clean English Only) */}
      <div className="flex-1 text-center font-sans font-medium text-sm text-white px-2 truncate">
        🎯 Early Access is LIVE — AI Prep for JEE, NEET & CUET at just <span className="font-extrabold font-display">₹249/month</span>
      </div>

      {/* Right side: [Claim Now →] button (white bg, saffron text, rounded) */}
      <button
        onClick={() => navigate('/signup')}
        className="shrink-0 px-3.5 py-1 rounded-md bg-white hover:bg-white/95 text-[#FF6B00] text-xs font-bold transition-all duration-150 active:scale-[0.98] shadow-sm"
      >
        Claim Now →
      </button>
    </div>
  );
};

export default FloatingAnnouncementBar;
