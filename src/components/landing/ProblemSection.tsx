import React from 'react';
import { motion } from 'framer-motion';
import { X, HelpCircle } from 'lucide-react';

const problemsLeft = [
  'Too many videos',
  'Too many PDFs',
  'Too many opinions',
  'Too many apps',
];

const problemsRight = [
  'What to study first',
  'What to skip',
  'How deeply to study a topic',
  'Whether they are on the right track',
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4"
          >
            The Reality Check
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e3a5f] mb-4">
            The Real Problem
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            It's not about studying more. It's about studying <span className="font-semibold text-[#1e3a5f]">right</span>.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="group relative bg-gradient-to-br from-red-50 to-red-50/50 border border-red-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-red-100/50 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-100/0 to-red-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-200"
                >
                  <X className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#1e3a5f]">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsLeft.map((problem, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 group/item"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm text-red-500 font-bold flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                      ×
                    </span>
                    <span className="text-gray-700 font-medium">{problem}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="group relative bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 to-amber-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200"
                >
                  <HelpCircle className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#1e3a5f]">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsRight.map((problem, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 group/item"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm text-amber-500 font-bold flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                      ?
                    </span>
                    <span className="text-gray-700 font-medium">{problem}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
