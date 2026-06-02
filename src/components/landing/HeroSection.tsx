import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import StudyVisual from '@/components/landing/StudyVisual';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/signup');
  };

  const handleSeeHowItWorks = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Staggered fade + slide-up variants on mount (100ms delays)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FAFAF7] px-6 sm:px-20 py-20 sm:py-24 pb-16 sm:pb-20 select-none">
      
      {/* Premium Venture-Backed Grid Overlay & Glowing Radial Saffron Halo */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(13,17,23,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(13,17,23,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-[#FF6B00]/[0.07] to-transparent blur-[140px] pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#FF6B00]/[0.03] to-transparent blur-[130px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto w-full z-10">
        {/* Layout: 2-column, 52/48 split, responsive single-column on mobile */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          
          {/* LEFT PANEL: High-converting SaaS copy & CTAs */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-7 text-left"
          >
            {/* Floating Saffron Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF6B00]/25 bg-[#FFF0E6]/85 text-xs sm:text-[13px] font-extrabold text-[#FF6B00] font-sans tracking-wide shadow-sm hover:scale-[1.02] transition-transform cursor-default">
                🎯 The Complete AI Prep Partner for JEE & NEET
              </span>
            </motion.div>
 
            {/* Premium Typographic Headline */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-[56px] font-display font-black text-[#0D1117] leading-[1.12] tracking-tight">
                The Smarter Way <br />
                To Crack Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#E55A00] drop-shadow-sm">Dream College.</span>
              </h1>
            </motion.div>
 
            {/* Highly Readable Paragraph Copy */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg text-[#374151] leading-relaxed max-w-xl font-sans font-medium"
            >
              Structured study planners, realistic mock exams, custom backlog checklists, and an advanced 24/7 AI Mentor — all synchronized in one premium, high-performance workspace dashboard.
            </motion.p>
 
            {/* CTA Buttons Row */}
            <motion.div 
              variants={itemVariants}
              className="space-y-4 pt-2"
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Primary Saffron Button */}
                <button
                  onClick={handleStartFree}
                  className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#FF6B00] text-white font-display font-extrabold text-base hover:bg-gradient-to-r hover:from-[#FF6B00] hover:to-[#E55A00] hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#FF6B00]/15 cursor-pointer"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                
                {/* Secondary Ghost Button */}
                <button
                  onClick={handleSeeHowItWorks}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/40 backdrop-blur-sm border border-[#D1D5DB] text-[#0D1117] font-display font-bold text-base hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-white/80 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  ▷ Watch Product Demo
                </button>
              </div>
 
              {/* Trust Indicators Strip */}
              <div className="flex flex-wrap gap-4 text-xs font-bold text-[#6B7280] font-sans pt-2 opacity-95">
                <span>✓ No credit card required</span>
                <span className="text-gray-300">|</span>
                <span>✓ Free for 7 days</span>
                <span className="text-gray-300">|</span>
                <span>✓ Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
 
          {/* RIGHT PANEL: Floating SaaS Interactive Playground */}
          <div className="relative w-full z-20">
            <StudyVisual />
          </div>
 
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
