import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Map, Clock } from 'lucide-react';

const AIFeatures = [
  { icon: Map,         title: 'Concept Mastery Map',         desc: 'Visual graph of every concept and your mastery level across the full syllabus.' },
  { icon: TrendingUp,  title: 'Accuracy Trend Analysis',     desc: 'Track improvement over time with subject-wise accuracy curves.' },
  { icon: CheckCircle2,title: 'Predicted Rank Trajectory',   desc: 'AI-estimated rank based on your current performance and national data.' },
  { icon: Clock,       title: 'Time Allocation Intelligence', desc: 'Know exactly which chapters need more study time based on ROI.' },
];

/* Mini AI visualization card */
const AIVisual: React.FC = () => (
  <div className="relative">
    <div className="absolute -inset-6 bg-blue-500/5 rounded-3xl blur-3xl pointer-events-none" />
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60">AI Academic Engine</span>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">Live</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Mastery map */}
        <div className="space-y-2">
          <p className="text-xs text-white/50 font-medium mb-3">Concept Mastery · Chemistry</p>
          <div className="grid grid-cols-6 gap-1.5">
            {[85, 62, 91, 34, 78, 55, 70, 88, 42, 95, 67, 80, 30, 73, 59, 84, 48, 76].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
                title={`${v}%`}
                className="h-8 rounded-md flex items-end overflow-hidden"
                style={{
                  background: v > 75
                    ? `rgba(52,211,153,${v / 200 + 0.1})`
                    : v > 50
                    ? `rgba(255,155,84,${v / 200 + 0.1})`
                    : `rgba(239,68,68,${v / 200 + 0.1})`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2">
            {[{ c: 'bg-emerald-400', l: 'Mastered' }, { c: 'bg-[#FF9B54]', l: 'Learning' }, { c: 'bg-red-400', l: 'Weak' }].map(x => (
              <div key={x.l} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-sm ${x.c}`} />
                <span className="text-[10px] text-white/40">{x.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rank trajectory */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-white/60">Predicted JEE Rank</p>
            <span className="text-xs text-blue-400 font-semibold">Improving ↑</span>
          </div>
          <div className="flex items-end gap-1.5 h-14">
            {[
              { rank: 48000, col: 'bg-red-400/40' },
              { rank: 42000, col: 'bg-red-400/50' },
              { rank: 38000, col: 'bg-orange-400/60' },
              { rank: 31000, col: 'bg-[#FF9B54]/70' },
              { rank: 24000, col: 'bg-[#FF9B54]/80' },
              { rank: 18000, col: 'bg-amber-400' },
              { rank: 12000, col: 'bg-emerald-400' },
            ].map((b, i) => {
              const h = 100 - (b.rank / 50000) * 100;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i, ease: 'easeOut' }}
                  className={`flex-1 rounded-sm ${b.col}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-white/25">3 months ago</span>
            <span className="text-[9px] text-emerald-400 font-semibold">~12,000 rank</span>
          </div>
        </div>

        {/* Time intelligence */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-white/50 mb-2">Recommended Focus Hours This Week</p>
          {[
            { subject: 'Rotational Motion', hours: 4, urgency: 'High', col: 'bg-red-500' },
            { subject: 'Organic Chemistry', hours: 3, urgency: 'Medium', col: 'bg-[#FF9B54]' },
            { subject: 'Calculus', hours: 2, urgency: 'Low', col: 'bg-emerald-500' },
          ].map(item => (
            <div key={item.subject} className="flex items-center gap-3">
              <span className="text-[11px] text-white/50 w-36 truncate">{item.subject}</span>
              <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(item.hours / 5) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`h-full rounded-full ${item.col}`}
                />
              </div>
              <span className="text-[10px] text-white/30 w-10 text-right">{item.hours}h</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

const AIEngineSection: React.FC = () => (
  <section id="ai-engine" className="py-28 relative">
    <div className="absolute inset-0 bg-[#0E1726]/30" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_0%_50%,rgba(59,130,246,0.05),transparent)]" />
    <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        {/* Left */}
        <div className="space-y-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF9B54] mb-4"
            >
              AI Engine
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5"
            >
              The AI Engine Behind
              <br />
              <span className="bg-gradient-to-r from-[#FF9B54] to-[#ffcc94] bg-clip-text text-transparent">
                Better Ranks
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-[#94A3B8] text-lg leading-relaxed"
            >
              SETU's adaptive preparation system learns from every question you
              attempt. It identifies patterns in your mistakes and builds a
              precision plan to fix them — automatically.
            </motion.p>
          </div>

          <div className="space-y-5">
            {AIFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF9B54]/10 border border-[#FF9B54]/20 flex items-center justify-center shrink-0 group-hover:bg-[#FF9B54]/15 transition-colors">
                  <feat.icon className="h-4.5 w-4.5 text-[#FF9B54]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{feat.title}</p>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right */}
        <AIVisual />
      </div>
    </div>
  </section>
);

export default AIEngineSection;
