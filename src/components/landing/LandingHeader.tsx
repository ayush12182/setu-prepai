import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-primary/95 backdrop-blur-md border-b border-white/10 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center hover:scale-[1.02] transition-transform">
          <img src="/setu-logo.png" alt="SETU" className="h-10 sm:h-12 w-auto rounded-lg brightness-0 invert" />
        </div>
        
        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How it Works', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
          >
            Login
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/auth')}
            className="bg-accent text-primary hover:bg-accent/90 shadow-[0_0_20px_rgba(232,154,60,0.3)] hover:shadow-[0_0_30px_rgba(232,154,60,0.4)] transition-all duration-300 font-semibold"
          >
            Get Started
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
