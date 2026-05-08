import React from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Target, BarChart3, Layers } from 'lucide-react';

const ITEMS = [
  { icon: Brain,     label: 'Adaptive AI Learning' },
  { icon: Target,    label: '50K+ Questions' },
  { icon: BookOpen,  label: 'Real Exam Patterns' },
  { icon: Layers,    label: 'Weakness Tracking' },
  { icon: BarChart3, label: 'Mock Test Intelligence' },
];

const TrustStrip: React.FC = () => (
  <section className="relative border-y border-white/[0.06] bg-[#0E1726]/60 backdrop-blur-sm py-5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-y-4 gap-x-8">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="flex items-center gap-2.5 text-[#94A3B8] hover:text-white transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FF9B54]/10 border border-[#FF9B54]/20 flex items-center justify-center group-hover:bg-[#FF9B54]/15 transition-colors">
              <item.icon className="h-3.5 w-3.5 text-[#FF9B54]" />
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustStrip;
