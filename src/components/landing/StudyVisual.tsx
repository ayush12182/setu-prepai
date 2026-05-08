import React from 'react';
import { motion } from 'framer-motion';

/* Floating indicator card */
const FloatCard: React.FC<{
  icon: string; text: string; sub?: string;
  delay: number; x: string; y: string; color: string;
}> = ({ icon, text, sub, delay, x, y, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    style={{ left: x, top: y }}
    className="absolute z-20"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border backdrop-blur-xl shadow-xl"
      style={{
        background: 'rgba(14,23,38,0.82)',
        borderColor: color + '30',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}18`,
      }}
    >
      <span className="text-base shrink-0">{icon}</span>
      <div>
        <p className="text-white text-xs font-semibold leading-tight">{text}</p>
        {sub && <p className="text-[10px] mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </motion.div>
  </motion.div>
);

/* Laptop screen content — SETU AI roadmap */
const SetuScreen: React.FC = () => (
  <div className="w-full h-full bg-[#07111F] rounded-t-xl overflow-hidden p-4 space-y-3">
    {/* Top bar */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/setu-logo.png" alt="" className="h-5 w-5 object-contain" />
        <span className="text-white text-xs font-bold tracking-wider">SETU</span>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">AI Active</span>
    </div>

    {/* AI message */}
    <div className="rounded-xl bg-[#FF9B54]/8 border border-[#FF9B54]/15 p-3">
      <p className="text-[10px] text-[#FF9B54]/70 mb-1 font-semibold uppercase tracking-wider">SETU AI</p>
      <p className="text-white text-[11px] leading-relaxed">
        Your Electrostatics score dropped to 34%. I've prioritized it in today's plan with targeted MCQs.
      </p>
    </div>

    {/* Study path nodes */}
    <div className="space-y-1.5">
      <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">JEE Physics · Week 4</p>
      {[
        { label: 'Laws of Motion',    done: true,  pct: 100 },
        { label: 'Work & Energy',     done: true,  pct: 87  },
        { label: 'Electrostatics',    done: false, pct: 34, active: true },
        { label: 'Current Electricity',done: false, pct: 0  },
      ].map(t => (
        <div key={t.label} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg ${t.active ? 'bg-[#FF9B54]/10 border border-[#FF9B54]/20' : 'bg-white/[0.02]'}`}>
          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${t.done ? 'bg-emerald-500 border-emerald-500' : t.active ? 'border-[#FF9B54]' : 'border-white/20'}`}>
            {t.done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            {t.active && <div className="w-1.5 h-1.5 bg-[#FF9B54] rounded-full animate-pulse" />}
          </div>
          <span className={`text-[10px] flex-1 ${t.active ? 'text-[#FF9B54]' : t.done ? 'text-white/50 line-through' : 'text-white/40'}`}>{t.label}</span>
          <span className={`text-[9px] font-bold ${t.done ? 'text-emerald-400' : t.active ? 'text-[#FF9B54]' : 'text-white/20'}`}>{t.pct}%</span>
        </div>
      ))}
    </div>

    {/* Mock score mini chart */}
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
      <div className="flex justify-between mb-2">
        <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">Mock Score Trend</span>
        <span className="text-[9px] text-emerald-400 font-bold">↑ +12%</span>
      </div>
      <div className="flex items-end gap-1 h-7">
        {[42, 51, 49, 63, 60, 72, 74].map((h, i) => (
          <motion.div key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.8 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
            style={{ height: `${h}%`, transformOrigin: 'bottom' }}
            className={`flex-1 rounded-sm ${i === 6 ? 'bg-[#FF9B54]' : 'bg-white/[0.1]'}`}
          />
        ))}
      </div>
    </div>
  </div>
);

/* Main study visual */
const StudyVisual: React.FC = () => (
  <div className="relative w-full h-[540px] select-none">
    {/* Ambient desk lamp glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[320px] rounded-full bg-[#FF9B54]/[0.07] blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-10 w-[200px] h-[200px] rounded-full bg-blue-500/[0.04] blur-3xl pointer-events-none" />

    {/* ── Laptop body ── */}
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-1/2 top-8 -translate-x-1/2 w-[340px]"
    >
      {/* Screen bezel */}
      <div className="rounded-xl overflow-hidden border border-white/[0.12] shadow-2xl shadow-black/70"
        style={{ boxShadow: '0 0 60px rgba(255,155,84,0.08), 0 24px 80px rgba(0,0,0,0.7)' }}>
        {/* Browser chrome */}
        <div className="bg-[#0D1520] px-3 py-2 flex items-center gap-1.5 border-b border-white/[0.07]">
          {['#ef4444','#f59e0b','#22c55e'].map(c => (
            <div key={c} className="w-2 h-2 rounded-full" style={{ background: c + '99' }} />
          ))}
          <div className="flex-1 mx-2 bg-white/[0.05] rounded h-4 flex items-center px-2">
            <span className="text-[8px] text-white/25">setu.ai/dashboard</span>
          </div>
        </div>
        {/* Screen */}
        <div className="h-[310px]">
          <SetuScreen />
        </div>
      </div>
      {/* Laptop base */}
      <div className="h-3 bg-gradient-to-b from-[#1a2535] to-[#131f2e] rounded-b-xl border-x border-b border-white/[0.08] mx-1" />
      <div className="h-1 bg-[#0a1320] rounded-b-xl mx-4 opacity-60" />
      {/* Desk surface reflection */}
      <div className="mt-1 mx-8 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </motion.div>

    {/* ── Desk surface ── */}
    <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0a1525]/80 to-transparent rounded-b-2xl" />

    {/* ── Floating book stack (left) ── */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="absolute bottom-16 left-6 space-y-0.5"
    >
      {[
        { w: 44, col: '#1e3a5f', h: 6 },
        { w: 40, col: '#2d1a4a', h: 5 },
        { w: 48, col: '#1a3a2a', h: 7 },
      ].map((b, i) => (
        <div key={i} className="rounded-sm" style={{ width: b.w, height: b.h, background: b.col, border: '1px solid rgba(255,255,255,0.06)' }} />
      ))}
    </motion.div>

    {/* ── Coffee mug (right) ── */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.55, duration: 0.7 }}
      className="absolute bottom-16 right-8"
    >
      <div className="w-8 h-9 rounded-b-lg border border-white/[0.12] bg-gradient-to-b from-[#1e2a3a] to-[#131d2a] relative">
        <div className="absolute -right-2.5 top-2 w-2.5 h-4 rounded-r-full border border-white/[0.1] bg-transparent" />
        <div className="absolute top-1 left-1 right-1 h-1 rounded-full bg-[#FF9B54]/20" />
      </div>
      <div className="h-0.5 w-10 -ml-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mt-0.5" />
    </motion.div>

    {/* ── Floating indicator cards ── */}
    <FloatCard icon="🔴" text="Weakest Topic" sub="Electrostatics · 34%" delay={0.7} x="2%" y="10%" color="#ef4444" />
    <FloatCard icon="✅" text="Mock Accuracy" sub="+12% this week" delay={0.9} x="62%" y="4%" color="#34d399" />
    <FloatCard icon="🤖" text="AI Plan Generated" sub="8 tasks for today" delay={1.1} x="60%" y="62%" color="#FF9B54" />
    <FloatCard icon="⏰" text="Revision Due" sub="Optics · 2 days left" delay={1.3} x="-2%" y="55%" color="#a78bfa" />
  </div>
);

export default StudyVisual;
