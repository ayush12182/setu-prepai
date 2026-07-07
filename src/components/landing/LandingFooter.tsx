import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';

const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const socials = [
    { Icon: Instagram, href: 'https://instagram.com/prepentrance', label: 'Instagram' },
    { Icon: Twitter, href: 'https://twitter.com/prepentrance', label: 'Twitter' },
    { Icon: Youtube, href: 'https://youtube.com/prepentrance', label: 'YouTube' },
    { Icon: Linkedin, href: 'https://linkedin.com/company/prepentrance', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-[#0D1117] text-[#F9FAFB] pt-[60px] pb-[32px] px-5 md:px-[80px] font-sans selection:bg-[#FF6B00] selection:text-[#0D1117] relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 items-start">
          
          {/* Col 1 — Brand */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              {/* Official PrepEntrance Logo Badge */}
              <div className="brand-logo-container rounded-lg w-9 h-9 shrink-0">
                <img 
                  src="/prepentrance-logo.png" 
                  alt="PrepEntrance Logo" 
                  className="brand-logo-img" 
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-black text-xl tracking-wide text-white">
                  PrepEntrance
                </span>
                <span className="text-[8px] text-slate-400 font-extrabold tracking-[0.2em] mt-1 uppercase">
                  Prepare. Perform. Succeed.
                </span>
              </div>
            </div>
            <p className="font-sans font-normal text-xs text-[#9CA3AF] mt-[10px]">
              Your Complete Exam Prep Partner
            </p>
            <div className="flex items-center gap-4 mt-[16px]">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-[#9CA3AF] hover:text-[#FF6B00] transition-colors duration-200 cursor-pointer"
                >
                  <social.Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Product */}
          <div className="flex flex-col items-start">
            <h4 className="font-sans font-semibold text-[12px] text-[#6B7280] uppercase tracking-wider mb-[16px]">
              Product
            </h4>
            <div className="flex flex-col gap-2 font-sans font-normal text-sm text-[#9CA3AF]">
              <button 
                onClick={() => handleScrollTo('hero')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Home
              </button>
              <button 
                onClick={() => handleScrollTo('features')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                AI Mentor
              </button>
              <button 
                onClick={() => handleScrollTo('features')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => handleScrollTo('pricing')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Test Series
              </button>
              <button 
                onClick={() => handleScrollTo('pricing')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleScrollTo('hero')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                About Us
              </button>
            </div>
          </div>

          {/* Col 3 — Support */}
          <div className="flex flex-col items-start">
            <h4 className="font-sans font-semibold text-[12px] text-[#6B7280] uppercase tracking-wider mb-[16px]">
              Support
            </h4>
            <div className="flex flex-col gap-2 font-sans font-normal text-sm text-[#9CA3AF]">
              <a 
                href="mailto:support@prepentrance.com"
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Contact Us
              </a>
              <button 
                onClick={() => navigate('/privacy')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-white text-left block transition-colors duration-200"
              >
                Refund Policy
              </button>
            </div>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="border-t border-[#1F2937] pt-[24px] mt-[40px] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[13px] text-[#6B7280]">
          <p>© 2025 PrepEntrance. All rights reserved.</p>
          <p>Made with ❤️ for Indian students</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
