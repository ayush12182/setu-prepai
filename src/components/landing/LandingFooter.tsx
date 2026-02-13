import React from 'react';
import { motion } from 'framer-motion';
import setuLogo from '@/assets/setu-logo.png';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative py-12 px-6 sm:px-12 bg-primary border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center"
          >
<img 
              src={setuLogo} 
              alt="SETU" 
              className="h-10 w-auto rounded-lg brightness-0 invert" 
            />
          </motion.div>

        {/* Links */}
          <div className="flex items-center gap-8">
            <a href="/privacy" className="text-white/50 hover:text-white text-sm font-medium transition-colors">Privacy</a>
            <a href="/terms" className="text-white/50 hover:text-white text-sm font-medium transition-colors">Terms</a>
            <a href="mailto:support@setu.app" className="text-white/50 hover:text-white text-sm font-medium transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/40">
            © 2024 SETU. Built for serious students.
          </p>
        </div>
      </div>
    </footer>
  );
};
