import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

const EXAMS = [
  { label: 'JEE Main & Advanced', sub: 'Physics · Chemistry · Maths',   emoji: '🚀', path: '/auth?exam=jee' },
  { label: 'NEET',                sub: 'Physics · Chemistry · Biology', emoji: '🔬', path: '/auth?exam=neet' },
  { label: 'CUET',                sub: 'General Test · Domains',        emoji: '🏛️', path: '/auth?exam=cuet' },
];

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'AI Engine',    href: '#ai-engine' },
  { label: 'Results',      href: '#results' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Leadership',   href: '#leadership' },
];

const LandingNav: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (href: string) => {
    document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Top announcement strip ── */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-[#FF9B54]/90 via-[#f07020]/90 to-[#FF9B54]/90 text-[#07111F] text-center text-xs sm:text-sm font-semibold py-2.5 px-4 flex items-center justify-center gap-3 relative"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#07111F]/50 animate-pulse shrink-0" />
            🎓 Early Access is LIVE — AI Prep for JEE · NEET · CUET at just ₹349/month
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="ml-2 px-3 py-0.5 rounded-full bg-[#07111F]/20 hover:bg-[#07111F]/30 transition text-xs font-bold"
            >
              Claim Now →
            </button>
            <button
              onClick={() => setBannerVisible(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#07111F]/10 rounded-full transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main navbar ── */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#07111F]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-2xl shadow-black/40'
            : 'bg-[#07111F]/60 backdrop-blur-lg border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-4">

          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 shrink-0 group mr-2"
          >
            <img src="/setu-logo.png" alt="SETU" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg text-white tracking-wide hidden sm:block">SETU</span>
          </button>

          {/* All Exams dropdown */}
          <div className="relative">
            <button
              onClick={() => setExamOpen(!examOpen)}
              className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                examOpen
                  ? 'border-[#FF9B54]/50 bg-[#FF9B54]/10 text-[#FF9B54]'
                  : 'border-white/[0.12] text-white/80 hover:border-white/25 hover:text-white'
              }`}
            >
              All Exams
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${examOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {examOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 mt-2 w-72 rounded-2xl border border-white/[0.1] bg-[#0E1726]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden"
                  onMouseLeave={() => setExamOpen(false)}
                >
                  {EXAMS.map(e => (
                    <button
                      key={e.label}
                      onClick={() => { navigate(e.path); setExamOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.05] transition-colors text-left group border-b border-white/[0.04] last:border-0"
                    >
                      <span className="text-xl shrink-0">{e.emoji}</span>
                      <div>
                        <p className="text-white font-semibold text-sm group-hover:text-[#FF9B54] transition-colors">{e.label}</p>
                        <p className="text-[#94A3B8] text-xs">{e.sub}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(l => (
              <button
                key={l.label}
                onClick={() => scrollTo(l.href)}
                className="px-3.5 py-2 text-sm text-[#94A3B8] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <button
              onClick={() => navigate('/auth?type=teacher')}
              className="text-sm text-[#94A3B8] hover:text-white transition px-3 py-2"
            >
              Faculty Login
            </button>
            <button
              onClick={() => navigate('/auth?type=student')}
              className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9B54] to-[#f07020] text-[#07111F] hover:brightness-110 transition-all shadow-lg shadow-[#FF9B54]/25 hover:-translate-y-0.5 duration-200"
            >
              Student Login
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden ml-auto p-2 text-white/60 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="space-y-1.5 w-5">
              <span className={`block h-0.5 bg-current transition-all origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0E1726]/98 border-t border-white/[0.06] px-5 py-4 space-y-1 overflow-hidden"
            >
              {EXAMS.map(e => (
                <button key={e.label} onClick={() => { navigate(e.path); setMobileOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-white/[0.04] text-left">
                  <span>{e.emoji}</span>
                  <span className="text-white text-sm font-medium">{e.label}</span>
                </button>
              ))}
              <div className="my-2 border-t border-white/[0.06]" />
              {NAV_LINKS.map(l => (
                <button key={l.label} onClick={() => scrollTo(l.href)}
                  className="block w-full text-left px-3 py-2.5 text-sm text-[#94A3B8] hover:text-white rounded-lg">
                  {l.label}
                </button>
              ))}
              <div className="pt-3 space-y-2 border-t border-white/[0.06]">
                <button onClick={() => { navigate('/auth?type=teacher'); setMobileOpen(false); }}
                  className="w-full py-2.5 text-sm text-center text-[#94A3B8] hover:text-white">Faculty Login</button>
                <button onClick={() => { navigate('/auth?type=student'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF9B54] to-[#f07020] text-[#07111F] font-bold text-sm">
                  Student Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default LandingNav;
