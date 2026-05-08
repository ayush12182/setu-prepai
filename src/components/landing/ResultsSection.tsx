import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Animated counter hook ── */
const useCounter = (target: number, duration = 2000) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const pct = Math.min((Date.now() - start) / duration, 1);
          const eased = 1 - Math.pow(1 - pct, 3);
          setVal(Math.round(eased * target));
          if (pct < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return { val, ref };
};

const STATS = [
  { target: 50000,  suffix: '+', label: 'AI Questions',      sub: 'Across JEE · NEET · CUET',    bg: 'from-[#FF9B54]/10 to-amber-600/5',   border: 'border-[#FF9B54]/15', val_color: 'text-[#FF9B54]' },
  { target: 104,    suffix: '+', label: 'Curriculum Topics',  sub: 'Mapped to exact exam patterns', bg: 'from-blue-500/10 to-blue-600/5',     border: 'border-blue-500/15',  val_color: 'text-blue-400' },
  { target: 40,     suffix: '%', label: 'Better Retention',   sub: 'Via spaced repetition AI',      bg: 'from-emerald-500/10 to-teal-500/5',  border: 'border-emerald-500/15', val_color: 'text-emerald-400' },
  { target: 3,      suffix: 'x', label: 'Faster Improvement', sub: 'Vs unguided self-study',        bg: 'from-violet-500/10 to-purple-500/5', border: 'border-violet-500/15', val_color: 'text-violet-400' },
];

const StatCard: React.FC<(typeof STATS)[0]> = ({ target, suffix, label, sub, bg, border, val_color }) => {
  const { val, ref } = useCounter(target);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border ${border} bg-gradient-to-b ${bg} p-8 text-center transition-all duration-300 group cursor-default`}
    >
      <p className={`text-5xl sm:text-6xl font-black tracking-tight mb-2 ${val_color}`}>
        {target >= 1000 ? `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}K` : val}{suffix}
      </p>
      <p className="text-white font-semibold text-base mb-1">{label}</p>
      <p className="text-[#94A3B8] text-xs">{sub}</p>
    </motion.div>
  );
};

const ResultsSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section id="results" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(255,155,84,0.04),transparent)]" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF9B54] mb-3"
          >
            Platform Stats
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Built for Performance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="text-[#94A3B8] text-lg max-w-xl mx-auto"
          >
            Every metric is a result of precision engineering, not marketing.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* CTA under stats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#FF9B54] to-[#f07020] text-[#07111F] font-bold text-base hover:brightness-110 transition-all shadow-xl shadow-[#FF9B54]/25 hover:-translate-y-0.5 duration-200"
          >
            Get Started Free
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ResultsSection;
