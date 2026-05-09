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
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{
        background: 'rgba(11, 18, 30, 0.85)',
        borderColor: color + '30',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}18`,
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

/* New Exam Prep Screen Component */
const ExamPrepScreen: React.FC = () => (
  <div className="w-full h-full bg-[#07111F] rounded-t-xl overflow-hidden p-4 flex flex-col gap-3 relative">
    {/* Subtle grid texture overlay for 'notebook' feel */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

    {/* Top bar */}
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-2">
        <img src="/setu-logo.png" alt="" className="h-5 w-5 object-contain" />
        <span className="text-white text-[11px] font-bold tracking-wider">SETU PREP</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 font-bold uppercase tracking-wider">JEE Target: <span className="text-white">AIR &lt; 5000</span></span>
      </div>
    </div>

    {/* Hero Stats Row */}
    <div className="grid grid-cols-2 gap-2 relative z-10">
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-2.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1">Rank Projection</p>
        <p className="text-white font-bold text-lg leading-none">4,250 <span className="text-[10px] text-emerald-400 font-normal">↑ +350</span></p>
      </div>
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-2.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1">Study Timer</p>
        <p className="text-[#FF9B54] font-bold text-lg leading-none">02:45<span className="text-[10px] text-[#FF9B54]/50 font-normal ml-0.5">hrs</span></p>
      </div>
    </div>

    {/* Subject Progress */}
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 relative z-10">
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2.5">Subject Mastery</p>
      <div className="space-y-2">
        {[
          { subject: 'Physics', acc: 78, color: '#3b82f6' },
          { subject: 'Chemistry', acc: 62, color: '#FF9B54', active: true },
          { subject: 'Mathematics', acc: 51, color: '#ef4444' }
        ].map(s => (
          <div key={s.subject} className="flex items-center gap-2">
            <span className="text-[10px] text-white/60 w-[55px] font-medium">{s.subject}</span>
            <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full rounded-full relative" style={{ width: `${s.acc}%`, backgroundColor: s.color }}>
                 {s.active && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
              </div>
            </div>
            <span className="text-[9px] text-white/40 font-bold w-6 text-right">{s.acc}%</span>
          </div>
        ))}
      </div>
    </div>

    {/* AI Study Plan */}
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 relative z-10 flex-1">
      <div className="flex justify-between items-center mb-2.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#FF9B54]">Today's AI Targets</p>
        <span className="text-[8px] bg-[#FF9B54]/10 text-[#FF9B54] px-1.5 py-0.5 rounded font-bold">3/5 DONE</span>
      </div>
      <div className="space-y-1.5">
        {[
          { title: 'Revise Integration Formulas', type: 'REVISION', done: true },
          { title: 'Solve 20 PYQs: Thermodynamics', type: 'PYQ', done: true },
          { title: 'Fix Weakness: Electrostatics', type: 'FOCUS', active: true },
        ].map((t, i) => (
          <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg border ${t.active ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-transparent border-transparent'}`}>
            <div className={`w-3 h-3 rounded flex items-center justify-center shrink-0 border ${t.done ? 'bg-emerald-500/20 border-emerald-500/50' : t.active ? 'border-[#FF9B54]/50 bg-[#FF9B54]/10' : 'border-white/20'}`}>
              {t.done && <svg className="w-2 h-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              {t.active && <div className="w-1.5 h-1.5 rounded-full bg-[#FF9B54] animate-pulse" />}
            </div>
            <span className={`text-[10px] flex-1 truncate ${t.done ? 'text-white/30 line-through' : t.active ? 'text-white/90 font-medium' : 'text-white/50'}`}>{t.title}</span>
            <span className={`text-[8px] font-bold tracking-wider px-1 rounded ${t.type === 'PYQ' ? 'text-blue-400 bg-blue-500/10' : t.type === 'FOCUS' ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>{t.type}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* Main study visual */
const StudyVisual: React.FC = () => (
  <div className="relative w-full h-[540px] select-none">
    {/* Ambient desk lamp glow - less orange, more cool white/blue mix */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-blue-400/[0.03] blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-10 w-[200px] h-[200px] rounded-full bg-[#FF9B54]/[0.03] blur-3xl pointer-events-none" />

    {/* ── Laptop body ── */}
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-1/2 top-8 -translate-x-1/2 w-[350px] z-10"
    >
      {/* Screen bezel */}
      <div className="rounded-xl overflow-hidden border border-white/[0.1] bg-[#07111F] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.03)]">
        {/* Screen */}
        <div className="h-[330px]">
          <ExamPrepScreen />
        </div>
      </div>
      {/* Laptop base */}
      <div className="h-3 bg-gradient-to-b from-[#1a2535] to-[#131f2e] rounded-b-xl border-x border-b border-white/[0.08] mx-1" />
      <div className="h-1.5 bg-[#050a10] rounded-b-xl mx-4 opacity-80" />
      {/* Desk surface reflection */}
      <div className="mt-1 mx-8 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </motion.div>

    {/* ── Desk surface ── */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050A10]/90 to-transparent rounded-b-2xl pointer-events-none" />

    {/* ── Floating notebook (left) ── */}
    <motion.div
      initial={{ opacity: 0, x: -20, rotate: -5 }}
      animate={{ opacity: 1, x: 0, rotate: -2 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="absolute bottom-20 left-4 z-0 w-24 h-32 rounded bg-[#111A28] border border-white/[0.08] shadow-2xl flex"
    >
       <div className="w-1.5 h-full border-r border-black/30 bg-[#0A1019] rounded-l" />
       <div className="flex-1 px-2 py-3 space-y-2 opacity-20">
         <div className="h-0.5 w-full bg-white/50" />
         <div className="h-0.5 w-3/4 bg-white/50" />
         <div className="h-0.5 w-5/6 bg-white/50" />
       </div>
    </motion.div>

    {/* ── Books stack (right) ── */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.55, duration: 0.7 }}
      className="absolute bottom-16 right-8 z-0 space-y-1"
    >
      {[
        { w: 60, col: '#1e293b', h: 8, label: 'PHYSICS' },
        { w: 56, col: '#334155', h: 7, label: 'MATHS' },
        { w: 64, col: '#0f172a', h: 10, label: 'CHEMISTRY' },
      ].map((b, i) => (
        <div key={i} className="rounded flex items-center px-2" style={{ width: b.w, height: b.h, background: b.col, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[4px] font-black text-white/20 tracking-widest">{b.label}</span>
        </div>
      ))}
    </motion.div>

    {/* ── Floating indicator cards ── */}
    <FloatCard icon="🎯" text="Mock Test Rank" sub="Top 12% in batch" delay={0.7} x="2%" y="12%" color="#3b82f6" />
    <FloatCard icon="🔥" text="21-Day Streak" sub="Revision target hit" delay={0.9} x="62%" y="6%" color="#f59e0b" />
    <FloatCard icon="🧠" text="Weakness Targeted" sub="Electrostatics focus" delay={1.1} x="-2%" y="55%" color="#ef4444" />
    <FloatCard icon="📚" text="PYQs Completed" sub="Last 5 years done" delay={1.3} x="62%" y="65%" color="#10b981" />
  </div>
);

export default StudyVisual;
