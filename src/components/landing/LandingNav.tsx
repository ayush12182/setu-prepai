import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',        id: 'hero' },
  { label: 'AI Mentor',   id: 'challenges' },
  { label: 'Features',    id: 'features' },
  { label: 'Test Series', id: 'pricing' },
  { label: 'Pricing',     id: 'pricing' },
  { label: 'About Us',    id: 'footer' },
];

const LandingNav: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Track active section and navbar scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = NAV_LINKS.map(link => link.id);
      const uniqueSections = Array.from(new Set(sections));
      
      for (const sectionId of uniqueSections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If section is currently centered or occupying the top viewport segment
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollTo(id);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full h-20 transition-all duration-300 flex items-center font-sans select-none border-b border-[#F0EDE6]/30 ${
        scrolled 
          ? 'bg-white/85 backdrop-blur-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)]' 
          : 'bg-white/95 backdrop-blur-md'
      }`}
      aria-label="Main Navigation"
    >
      {/* 80px padding on desktop (px-5 sm:px-20 matches 80px) */}
      <div className="max-w-7xl mx-auto px-5 sm:px-20 w-full flex items-center justify-between">
        
        {/* Left: Brand Lockup (Logo increased 35% to h-11 w-11, spacing gaps matched) */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-lg"
          aria-label="PrepEntrance Home"
        >
          <img 
            src="/prepentrance-logo.png" 
            alt="PrepEntrance Logo" 
            className="h-11 w-11 object-contain transition-transform duration-200 group-hover:scale-105" 
          />
          <span className="font-sans font-bold text-[20px] text-[#0D1117] tracking-tight leading-none">
            PrepEntrance
          </span>
        </button>

        {/* Center: nav links with motion active orange underlines */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map(l => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.id)}
              onKeyDown={(e) => handleKeyDown(e, l.id)}
              className={`relative py-1 text-[15px] font-semibold transition-colors duration-200 focus:outline-none focus-visible:text-[#FF6B00] ${
                activeSection === l.id ? 'text-[#FF6B00]' : 'text-[#374151] hover:text-[#FF6B00]'
              }`}
              aria-label={`Scroll to ${l.label}`}
            >
              {l.label}
              {activeSection === l.id && (
                <motion.span
                  layoutId="activeNavUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Premium Unicorn startup buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Ghost button, scale 1.03 on hover, fill orange on hover */}
          <button
            onClick={() => navigate('/login')}
            className="text-[14px] font-bold px-5 py-2.5 rounded-lg border-[1.5px] border-[#FF6B00] text-[#FF6B00] bg-transparent hover:bg-[#FF6B00] hover:text-white hover:scale-[1.03] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            aria-label="Log in to your account"
          >
            Login
          </button>
          
          {/* Solid orange button with gradient hover, slight lift, premium shadow */}
          <button
            onClick={() => navigate('/signup')}
            className="text-[14px] font-bold px-[22px] py-2.5 rounded-lg bg-[#FF6B00] hover:bg-gradient-to-r hover:from-[#FF6B00] hover:to-[#E55A00] text-white hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-[#FF6B00]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            aria-label="Start your free trial"
          >
            Free Trial →
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-[#0D1117] hover:text-[#FF6B00] transition-colors focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile DrawerOverlay slides from right */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white border-l border-[#F0EDE6] p-6 flex flex-col gap-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans font-extrabold text-[#0D1117] text-lg">Menu</span>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full text-[#0D1117]/60 hover:bg-black/5 focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {NAV_LINKS.map(l => (
                  <button 
                    key={l.label} 
                    onClick={() => scrollTo(l.id)}
                    className={`text-left py-2.5 text-base font-bold font-sans border-b border-[#F0EDE6]/50 transition-colors focus:outline-none ${
                      activeSection === l.id ? 'text-[#FF6B00]' : 'text-[#374151] hover:text-[#FF6B00]'
                    }`}
                    aria-label={`Scroll to ${l.label}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[#F0EDE6]/55">
                <button 
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-lg border-[1.5px] border-[#FF6B00] text-[#FF6B00] font-bold text-center hover:bg-[#FFF5EF] transition-all"
                  aria-label="Log in page"
                >
                  Login
                </button>
                <button 
                  onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-lg bg-[#FF6B00] text-white font-bold text-center hover:bg-[#E55A00] transition-all shadow-md shadow-[#FF6B00]/10"
                  aria-label="Sign up page"
                >
                  Free Trial →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNav;
