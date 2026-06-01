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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#FAFAF7] px-6 sm:px-20 py-16 sm:py-20 pb-12 sm:pb-16 grain-overlay select-none">
      
      {/* Decorative Warm Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF6B00]/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#FF6B00]/[0.02] blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto w-full z-10">
        {/* Layout: 2-column, 55/45 split, responsive single-column on mobile */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          
          {/* LEFT PANEL: Friendly, warm text & copy (55% width equivalent) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 text-left"
          >
            {/* Pill Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FFD4B3] bg-[#FFF0E6] text-xs sm:text-sm font-semibold text-[#FF6B00] font-sans">
                🎯 JEE · NEET · CUET Preparation
              </span>
            </motion.div>

            {/* Headline (Nunito, 900 weight, 52px, leading 1.15) */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-[52px] font-display font-black text-[#0D1117] leading-[1.15] tracking-tight">
                Your Complete <br />
                <span className="text-[#FF6B00]">AI Study Partner</span> <br />
                for Every Exam.
              </h1>
            </motion.div>

            {/* Subtext (Inter 400, 18px, muted) */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-xl font-sans"
            >
              Structured plans, mock tests, PYQs, and an AI mentor — all in one place.
            </motion.p>

            {/* CTA row (Start Free Trial, See How It Works) */}
            <motion.div 
              variants={itemVariants}
              className="space-y-4 pt-2"
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Primary Button */}
                <button
                  onClick={handleStartFree}
                  className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#FF6B00] text-white font-display font-extrabold text-base hover:bg-[#E55A00] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF6B00]/15"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                {/* Secondary Button */}
                <button
                  onClick={handleSeeHowItWorks}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-transparent border-1.5 border-[#D1D5DB] text-[#0D1117] font-display font-bold text-base hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all duration-200"
                >
                  ▷ See How It Works
                </button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#9CA3AF] font-sans pt-1">
                <span>✓ No credit card required</span>
                <span className="text-gray-300">|</span>
                <span>✓ Free for 7 days</span>
                <span className="text-gray-300">|</span>
                <span>✓ Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT PANEL: Illustrated Card Cluster */}
          <div className="relative w-full z-20">
            <StudyVisual />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
