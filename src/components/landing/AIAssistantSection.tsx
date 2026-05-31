import React from 'react';
import { motion } from 'framer-motion';
import { Brain, HelpCircle, Sparkles, BarChart3, RotateCcw } from 'lucide-react';

const AI_Mentoring_Features = [
  {
    icon: HelpCircle,
    title: '24/7 Academic Doubt Solver',
    desc: 'Stuck on a tough Physics numerical or Chemistry equation? Snap a photo or type it in to get step-by-step guidance instantly.',
    color: '#FF9B54',
    bg: 'bg-[#FF9B54]/10',
    border: 'border-[#FF9B54]/25',
    text: 'text-[#FF9B54]'
  },
  {
    icon: BarChart3,
    title: 'Precision Weakness Analysis',
    desc: 'Our helper engine tracks your mock test responses to pinpoint specific sub-topics where you lose marks, showing exactly what to study next.',
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    text: 'text-blue-400'
  },
  {
    icon: RotateCcw,
    title: 'Spaced Revision Triggers',
    desc: 'PrepEntrance automatically triggers custom formula cards and short notes revisions based on memory retention models before you forget them.',
    color: '#34d399',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-400'
  }
];

const AIAssistantSection: React.FC = () => {
  return (
    <section id="ai-engine" className="py-24 relative bg-[#07111F]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(96,165,250,0.02),transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-20 items-center">
          
          {/* Left Column: Copy & Feature cards */}
          <div className="space-y-10">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Personalized Assistant
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5 leading-[1.1]"
              >
                Your Personal AI Study Copilot
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.14 }}
                className="text-[#94A3B8] text-base sm:text-lg leading-relaxed"
              >
                PrepEntrance integrates a supportive academic assistant that reviews your preparation data, solves doubts instantly, and triggers structured, timely revision lists. It works quietly in the background to ensure you build a precision rank.
              </motion.p>
            </div>

            {/* Feature lists */}
            <div className="space-y-6">
              {AI_Mentoring_Features.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className={`w-11 h-11 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className={`h-5 w-5 ${feat.text}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#FF9B54] transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: High Fidelity Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/[0.08] bg-[#0E1726]/80 p-6 shadow-2xl shadow-black/60 relative overflow-hidden group"
          >
            {/* Soft glow wash */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/[0.01] to-[#FF9B54]/[0.01] pointer-events-none" />

            {/* Chrome Bar */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                  <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c + '80' }} />
                ))}
              </div>
              <span className="text-[10px] text-white/30 font-semibold tracking-wider uppercase">Doubt Solver & Assistant Dashboard</span>
              <div className="w-8 h-2 rounded bg-white/[0.05]" />
            </div>

            {/* Chat/Doubt Mockup */}
            <div className="space-y-4">
              
              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  U
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.05] p-3 max-w-[85%] text-xs text-white/80 leading-relaxed">
                  How do I solve for the equivalent resistance in this balanced Wheatstone bridge circuit?
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF9B54]/10 border border-[#FF9B54]/25 flex items-center justify-center shrink-0">
                  <Brain className="h-4 w-4 text-[#FF9B54]" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-blue-500/5 border border-blue-500/15 p-4 max-w-[85%] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#FF9B54] font-bold tracking-wider uppercase">AI Academic Assistant</span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">Solved</span>
                  </div>
                  
                  <p className="text-xs text-white/90 leading-relaxed font-medium">
                    Since the bridge is balanced (P/Q = R/S), the potential difference across the central galvanometer arm is zero. Thus, no current flows through it.
                  </p>

                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] space-y-1.5">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Step-by-Step Resolution:</p>
                    <ol className="list-decimal list-inside text-[11px] text-white/70 space-y-1">
                      <li>Identify P = 10 Ω, Q = 10 Ω and R = 10 Ω, S = 10 Ω.</li>
                      <li>Remove the central resistance arm (Rg) from the circuit.</li>
                      <li>Calculate equivalent resistance of upper series path: 10 + 10 = 20 Ω.</li>
                      <li>Calculate equivalent resistance of lower series path: 10 + 10 = 20 Ω.</li>
                      <li>Solve the parallel combination: R_eq = (20 × 20) / (20 + 20) = 10 Ω.</li>
                    </ol>
                  </div>

                  <p className="text-[10px] text-white/35">
                    Suggested chapters: Current Electricity · Wheatstone Bridge Concepts
                  </p>
                </div>
              </div>

              {/* Retention mini graph */}
              <div className="rounded-xl bg-[#07111F] border border-white/[0.06] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Memory Retention Curve</p>
                  <span className="text-[9px] text-[#34d399] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Optimal Revision Level</span>
                </div>
                <div className="h-10 flex items-end gap-1 px-1">
                  {[90, 85, 78, 62, 45, 88, 80].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`flex-1 rounded-sm ${i === 4 ? 'bg-[#FF9B54]' : i === 5 ? 'bg-blue-400' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[8px] text-white/30">
                  <span>Day 1 (Learn)</span>
                  <span className="text-[#FF9B54] font-bold">Day 5 (AI Revision Triggered)</span>
                  <span>Day 7 (Retained)</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;
