import React from 'react';
import { motion } from 'framer-motion';
import { Target, ClipboardCheck, Sparkles, GraduationCap } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Target, title: 'Syllabus Aligned', desc: 'NCERT & PYQ standard' },
  { icon: ClipboardCheck, title: 'Rigorous Testing', desc: 'All India mocks & part tests' },
  { icon: Sparkles, title: 'Personalized Planners', desc: 'Built for systematic progress' },
  { icon: GraduationCap, title: 'Target Universities', desc: 'IITs, AIIMS, NITs, IISERs' }
];

const CoachingMarquee: React.FC = () => {
  return (
    <section className="relative py-12 bg-[#07111F] overflow-hidden border-y border-white/[0.06]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(59,130,246,0.02),transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-5 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side Label */}
        <div className="text-center md:text-left space-y-1.5 max-w-sm">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Academic Quality Standard</p>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
            Built for JEE, NEET & CUET Aspirants
          </h3>
          <p className="text-white/50 text-xs font-semibold">
            Designed using proven preparation methodologies.
          </p>
        </div>

        {/* Right Side: Showcase Highlights grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto flex-1 max-w-3xl">
          {HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between hover:border-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                  <Icon className="h-4.5 w-4.5 text-blue-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-white font-bold text-xs leading-none">{item.title}</p>
                  <p className="text-white/40 text-[9px] font-medium leading-tight mt-1">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CoachingMarquee;
