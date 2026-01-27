import React from 'react';
import { motion } from 'framer-motion';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative py-10 px-4 sm:px-6 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center"
        >
          <img src="/setu-logo.png" alt="SETU" className="h-10 w-auto rounded-lg shadow-sm" />
        </motion.div>
        <p className="text-sm text-gray-400 font-medium">
          © 2024 SETU. Built for serious students.
        </p>
      </div>
    </footer>
  );
};
