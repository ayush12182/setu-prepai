import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';

/* ─── Mentor / Leadership data ─────────────────────────────────── */
const FOUNDER = {
  name: 'Ayush Dixit',
  role: 'Founder, PrepEntrance',
  initials: 'AD',
  color: '#FF9B54',
  bio: 'Focused on building an AI-powered academic system that helps students prepare with clarity, precision, and intelligent guidance instead of information overload.',
};

const MENTORS = [
  { name: 'Madhu Pinapaty',      initials: 'MP', color: '#60a5fa' },
  { name: 'Partha Chalawagali',  initials: 'PC', color: '#34d399' },
  { name: 'Rohan D Rendalkar',   initials: 'RR', color: '#a78bfa' },
];

const Avatar: React.FC<{ initials: string; color: string; size?: 'lg' | 'sm' }> = ({ initials, color, size = 'lg' }) => {
  const sz = size === 'lg' ? 'w-20 h-20 text-xl' : 'w-14 h-14 text-sm';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color}33, ${color}11)`,
        border: `2px solid ${color}40`,
        boxShadow: `0 0 24px ${color}18`,
      }}
    >
      {initials}
    </div>
  );
};

const LeadershipSection: React.FC = () => (
  <section id="leadership" className="py-28 relative">
    <div className="absolute inset-0 bg-[#0E1726]/30" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,155,84,0.04),transparent)]" />
    <div className="max-w-5xl mx-auto px-5 sm:px-8 relative">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF9B54] mb-4"
        >
          Leadership
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5"
        >
          Built by People Who Understand
          <br />
          <span className="bg-gradient-to-r from-[#FF9B54] to-[#ffcc94] bg-clip-text text-transparent">
            Competitive Preparation.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-[#94A3B8] text-lg leading-relaxed"
        >
          PrepEntrance is being developed with a vision to make exam preparation more structured,
          data-driven, and intelligently personalized for every student.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Founder card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="relative rounded-2xl border border-white/[0.09] bg-gradient-to-b from-[#0E1726] to-[#07111F] p-8 shadow-xl shadow-black/30 transition-all duration-300 group overflow-hidden"
        >
          {/* Subtle orange glow on hover */}
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,155,84,0.06),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Top row */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar initials={FOUNDER.initials} color={FOUNDER.color} size="lg" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF9B54] mb-1">Founder</p>
              <h3 className="text-white font-bold text-xl">{FOUNDER.name}</h3>
              <p className="text-[#94A3B8] text-sm">{FOUNDER.role}</p>
            </div>
          </div>

          <div className="h-px bg-white/[0.06] mb-6" />

          <p className="text-[#94A3B8] text-sm leading-relaxed italic">
            "{FOUNDER.bio}"
          </p>
        </motion.div>

        {/* Guidance card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="relative rounded-2xl border border-white/[0.09] bg-gradient-to-b from-[#0E1726] to-[#07111F] p-8 shadow-xl shadow-black/30 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(96,165,250,0.04),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#94A3B8] mb-1">Under the Guidance of</p>
            <h3 className="text-white font-bold text-xl">Strategic Advisors</h3>
          </div>

          <div className="h-px bg-white/[0.06] mb-6" />

          <div className="space-y-5 mb-6">
            {MENTORS.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <Avatar initials={m.initials} color={m.color} size="sm" />
                <div>
                  <p className="text-white font-semibold text-sm">{m.name}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="h-px bg-white/[0.06] mb-5" />

          <p className="text-[#94A3B8] text-sm leading-relaxed italic">
            "Providing strategic guidance, product direction, and mentorship in building
            a scalable AI-driven learning ecosystem."
          </p>
        </motion.div>
      </div>

      {/* Trust Validation Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 sm:mt-24"
      >
        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.01] p-8 sm:p-10 backdrop-blur-md overflow-hidden group">
          {/* Soft ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,155,84,0.03),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
              Reviewed and validated by experienced educators from India’s leading coaching institutes.
            </h3>
            <p className="text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              PrepEntrance’s learning architecture and preparation methodology have been evaluated and approved by 50+ teachers and academic mentors associated with top competitive exam coaching ecosystems across India.
            </p>
          </div>

          <div className="relative z-10 grid sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Metric Card 1 */}
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 text-center transition-colors hover:bg-white/[0.04]">
              <p className="text-2xl font-black text-[#FF9B54] mb-1">50+</p>
              <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Educators Reviewed</p>
            </div>
            
            {/* Metric Card 2 */}
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 text-center transition-colors hover:bg-white/[0.04]">
              <p className="text-xl font-black text-white mb-1.5 flex items-center justify-center gap-2 mt-0.5">
                JEE <span className="text-white/20">•</span> NEET <span className="text-white/20">•</span> CUET
              </p>
              <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Preparation Focused</p>
            </div>

            {/* Metric Card 3 */}
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 text-center transition-colors hover:bg-white/[0.04]">
              <p className="text-lg font-black text-white mb-2 mt-1">AI + Academic Strategy</p>
              <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Learning Framework</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default LeadershipSection;
