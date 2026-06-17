import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'JEE', href: '/jee' },
  { label: 'NEET', href: '/neet' },
  { label: 'CUET', href: '/cuet' },
  { label: 'AI Tutor', href: '#ai-tutor' },
  { label: 'Practice Tests', href: '#practice-tests' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#blog' },
];

const LandingNav: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(href.substring(1));
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full h-20 transition-all duration-350 flex items-center font-sans border-b ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-100'
          : 'bg-white border-slate-100'
      }`}
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex items-center justify-between">
        
        {/* Left: Brand Logo Lockup */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3.5 group focus:outline-none"
          aria-label="PrepEntrance Home"
        >
          {/* Official PrepEntrance Logo Badge */}
          <div className="brand-logo-container rounded-xl w-[52px] h-[52px]">
            <img 
              src="/prepentrance-logo.png" 
              alt="PrepEntrance Logo" 
              className="brand-logo-img" 
            />
          </div>
          {/* Logo Name & Tagline */}
          <div className="flex flex-col items-start leading-none text-left">
            <span className="font-sans font-bold text-[24px] text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors duration-200">
              PrepEntrance
            </span>
            <span className="text-[8.5px] text-slate-500 font-extrabold tracking-[0.2em] mt-1.5 uppercase">
              Prepare. Perform. Succeed.
            </span>
          </div>
        </button>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-[14.5px] font-semibold text-[#475569] hover:text-[#2563eb] transition-colors duration-200 focus:outline-none"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right: Auth Action Buttons */}
        <div className="hidden md:flex items-center gap-3.5">
          <button
            onClick={() => navigate('/login')}
            className="text-[14px] font-bold px-4.5 py-2 rounded-lg border border-slate-200 text-[#1e293b] hover:bg-slate-50 transition-colors focus:outline-none"
          >
            Login
          </button>
          
          <button
            onClick={() => navigate('/signup')}
            className="text-[14px] font-bold px-5 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors shadow-sm focus:outline-none"
          >
            Sign Up Free
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 text-[#334155] hover:text-[#2563eb] transition-colors focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white border-l border-slate-100 p-6 flex flex-col gap-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1e293b] text-lg">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-50"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 pt-2">
                {NAV_LINKS.map(link => (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    className="text-left py-2 text-base font-bold text-slate-600 hover:text-[#2563eb] border-b border-slate-50 transition-colors focus:outline-none"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full py-2.5 rounded-lg border border-slate-200 text-[#1e293b] font-bold text-center hover:bg-slate-50"
                >
                  Login
                </button>
                <button
                  onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                  className="w-full py-2.5 rounded-lg bg-[#2563eb] text-white font-bold text-center hover:bg-[#1d4ed8]"
                >
                  Sign Up Free
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
