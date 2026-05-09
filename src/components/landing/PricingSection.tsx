import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';

const FEATURES = [
  'Full AI Learning Access',
  'JEE / NEET / CUET Preparation',
  'Adaptive Practice Engine',
  'Mock Test Analytics',
  'AI Revision Engine',
  'Personalized Roadmaps',
];

const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-28 relative">
      <div className="absolute inset-0 bg-[#0E1726]/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(255,155,84,0.05),transparent)]" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF9B54] mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Simple Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-[#94A3B8] text-lg"
          >
            Everything required for serious preparation.
          </motion.p>
        </div>

        {/* Centered card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md mx-auto"
        >
          <div className="relative rounded-3xl border border-[#FF9B54]/25 bg-gradient-to-b from-[#0E1726] to-[#07111F] p-8 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,155,84,0.12),transparent)] pointer-events-none" />

            {/* Badge */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF9B54]/15 border border-[#FF9B54]/30">
                <Zap className="h-3.5 w-3.5 text-[#FF9B54]" />
                <span className="text-xs font-bold text-[#FF9B54] tracking-wide">Launch Offer</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-6xl font-bold text-white tracking-tight">₹349</span>
                <div className="pb-2">
                  <span className="text-[#94A3B8] line-through text-xl">₹1,000</span>
                  <p className="text-xs text-[#94A3B8]">per month</p>
                </div>
              </div>
              <p className="text-[#FF9B54] text-sm font-medium">For limited users</p>
            </div>

            {/* Features */}
            <ul className="space-y-3.5 mb-8">
              {FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF9B54]/15 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-[#FF9B54] stroke-[2.5]" />
                  </div>
                  <span className="text-[#94A3B8] text-sm">{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full py-4 rounded-2xl bg-[#FF9B54] text-[#07111F] font-bold text-base hover:bg-[#ffaa6e] transition-all shadow-xl shadow-[#FF9B54]/30 hover:shadow-[#FF9B54]/50 hover:-translate-y-0.5 duration-200"
            >
              Get Early Access
            </button>

            <p className="text-center text-xs text-[#94A3B8]/60 mt-5">
              Price increases after early access slots are filled.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
