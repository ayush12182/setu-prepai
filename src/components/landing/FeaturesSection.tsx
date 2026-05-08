import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, BarChart3, RefreshCw, FileText } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'Adaptive Learning Engine',
    desc: 'AI dynamically changes difficulty based on student performance, ensuring every session is optimally challenging.',
    color: 'from-violet-500/10 to-purple-500/5',
    border: 'border-violet-500/15 hover:border-violet-500/30',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  {
    icon: Target,
    title: 'Weakness Detection',
    desc: 'Automatically identifies conceptual gaps across chapters and subjects with pinpoint accuracy.',
    color: 'from-red-500/10 to-rose-500/5',
    border: 'border-red-500/15 hover:border-red-500/30',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
  },
  {
    icon: Zap,
    title: 'Smart Practice System',
    desc: 'Practice is curated based on accuracy and retention patterns — not just syllabus order.',
    color: 'from-[#FF9B54]/10 to-amber-500/5',
    border: 'border-[#FF9B54]/15 hover:border-[#FF9B54]/30',
    iconBg: 'bg-[#FF9B54]/10',
    iconColor: 'text-[#FF9B54]',
  },
  {
    icon: BarChart3,
    title: 'AI Performance Analytics',
    desc: 'Detailed exam-level insights, subject trends, and chapter-wise performance breakdowns.',
    color: 'from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/15 hover:border-blue-500/30',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: RefreshCw,
    title: 'Precision Revision',
    desc: 'Revision plans generated automatically based on spaced repetition and test proximity.',
    color: 'from-emerald-500/10 to-teal-500/5',
    border: 'border-emerald-500/15 hover:border-emerald-500/30',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: FileText,
    title: 'Mock Test Intelligence',
    desc: 'Full-length test analytics with detailed improvement recommendations and rank trajectory.',
    color: 'from-pink-500/10 to-fuchsia-500/5',
    border: 'border-pink-500/15 hover:border-pink-500/30',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
  },
];

const FeaturesSection: React.FC = () => (
  <section id="features" className="py-28 relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(255,155,84,0.04),transparent)]" />
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-18">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF9B54] mb-4"
        >
          Capabilities
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5"
        >
          Built for Serious Aspirants
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-[#94A3B8] text-lg leading-relaxed"
        >
          Every feature is designed around one goal — improving your rank.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className={`relative rounded-2xl border bg-gradient-to-br ${f.color} ${f.border} p-7 transition-all duration-300 cursor-default group`}
          >
            <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
              <f.icon className={`h-5 w-5 ${f.iconColor}`} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2.5 leading-snug">{f.title}</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">{f.desc}</p>
            {/* Hover shimmer */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.02] to-transparent" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
