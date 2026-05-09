import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Brain, Zap, Target } from 'lucide-react';
import StudyVisual from '@/components/landing/StudyVisual';

/* ── Particle canvas ── */
const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.15, dy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.3 + 0.06,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,155,84,${p.a})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" />;
};

/* ── Dashboard mockup removed — see StudyVisual ── */
const _Unused: React.FC = () => (
  <div className="relative">
    <div className="absolute -inset-10 bg-[#FF9B54]/6 blur-3xl rounded-full pointer-events-none" />
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.1] bg-[#0D1520]/90 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden"
    >
      {/* Chrome bar */}
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="flex gap-1.5">
          {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c + 'aa' }} />)}
        </div>
        <div className="flex-1 mx-4 h-5 rounded bg-white/[0.05] flex items-center px-3">
          <span className="text-[10px] text-white/25">setu.ai · dashboard</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs">Good morning, Arjun 👋</p>
            <p className="text-white font-semibold text-sm">Your JEE prep is on track</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25">
            <span className="text-emerald-400 text-xs font-bold">Day 14 🔥</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { l: 'Accuracy', v: '74%', c: 'text-[#FF9B54]', trend: '↑ +4%' },
            { l: 'Syllabus', v: '62%', c: 'text-blue-400',  trend: '↑ +8%' },
            { l: 'Rank est.', v: '11.2K', c: 'text-violet-400', trend: '↓ improving' },
          ].map(s => (
            <div key={s.l} className="rounded-xl bg-white/[0.04] border border-white/[0.05] p-3">
              <p className="text-[9px] text-white/40 mb-1 uppercase tracking-wider">{s.l}</p>
              <p className={`text-lg font-bold leading-none ${s.c}`}>{s.v}</p>
              <p className="text-[9px] text-white/30 mt-1">{s.trend}</p>
            </div>
          ))}
        </div>

        {/* Weak topics */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
          <p className="text-xs font-semibold text-white/60 mb-3">🔍 Needs Attention</p>
          <div className="space-y-2.5">
            {[
              { n: 'Rotational Motion', p: 32, c: '#ef4444' },
              { n: 'Electrochemistry',  p: 49, c: '#FF9B54' },
              { n: 'Limits & Continuity', p: 58, c: '#facc15' },
            ].map(t => (
              <div key={t.n}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-white/55">{t.n}</span>
                  <span className="text-[10px]" style={{ color: t.c }}>{t.p}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.p}%` }}
                    transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: t.c }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's plan */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
          <p className="text-xs font-semibold text-white/60 mb-3">🎯 AI Plan · Today</p>
          <div className="space-y-1.5">
            {[
              { t: 'Revise Rotational Motion', tag: 'Priority', col: 'text-red-400 bg-red-500/10' },
              { t: 'Practice 20 Electrochem MCQs', tag: 'AI Pick', col: 'text-[#FF9B54] bg-[#FF9B54]/10' },
              { t: 'Full Mock — Physics', tag: 'Scheduled', col: 'text-blue-400 bg-blue-500/10' },
            ].map((i, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
                  <span className="text-[11px] text-white/65">{i.t}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${i.col}`}>{i.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score trend mini chart */}
        <div className="flex items-end gap-1.5 h-8 px-1">
          {[38, 45, 52, 48, 63, 67, 74].map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + i * 0.07, ease: 'easeOut' }}
              style={{ height: `${h}%`, transformOrigin: 'bottom' }}
              className={`flex-1 rounded-sm ${i === 6 ? 'bg-[#FF9B54]' : 'bg-white/[0.1]'}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-white/30 text-center">Mock Test Score Trend ↑</p>
      </div>
    </motion.div>
  </div>
);

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-[#07111F]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(255,155,84,0.09),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_70%,rgba(59,130,246,0.05),transparent)]" />
      <div className="absolute inset-0 opacity-[0.022]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />
      <ParticleCanvas />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-20 items-center">

          {/* ── LEFT ── */}
          <div className="space-y-7">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9B54]/30 bg-[#FF9B54]/8 text-xs font-bold text-[#FF9B54] tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B54] animate-pulse" />
                AI Academic Operating System
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}>
              <h1 className="text-[3.4rem] sm:text-6xl lg:text-[4.2rem] font-extrabold text-white leading-[1.04] tracking-[-0.02em]">
                Structured Preparation.
              </h1>
              <h2 className="text-[3.4rem] sm:text-6xl lg:text-[4.2rem] font-extrabold text-white/85 leading-[1.04] tracking-[-0.02em] mt-1">
                Better Results.
              </h2>
            </motion.div>

            {/* Sub */}
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
              className="text-lg text-[#94A3B8] leading-relaxed max-w-lg">
              SETU's AI engine identifies your weaknesses, adapts your learning path, and builds a precision strategy for JEE, NEET, and CUET.
            </motion.p>

            {/* Exam pills */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap gap-2">
              {[
                { label: 'JEE Main & Advanced', icon: '🚀', path: '/auth?exam=jee' },
                { label: 'NEET',                icon: '🔬', path: '/auth?exam=neet' },
                { label: 'CUET',                icon: '🏛️', path: '/auth?exam=cuet' },
              ].map(e => (
                <button key={e.label} onClick={() => navigate(e.path)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/[0.1] bg-white/[0.04] text-white/70 text-xs font-semibold hover:border-[#FF9B54]/50 hover:text-[#FF9B54] hover:bg-[#FF9B54]/5 transition-all">
                  {e.icon} {e.label}
                </button>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-1">
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#FF9B54] text-[#07111F] font-bold text-base hover:brightness-110 transition-all shadow-[0_0_40px_rgba(255,155,84,0.2)] hover:shadow-[0_0_60px_rgba(255,155,84,0.3)] hover:-translate-y-1 duration-200"
              >
                Start 3-Day Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-white/40 text-[11px] font-medium mt-3 ml-2">
                No credit card required.
              </p>
            </motion.div>

            {/* Trust */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-5 pt-2 flex-wrap">
              {[
                { icon: Brain,  text: 'AI-Powered Study Plans' },
                { icon: Target, text: 'JEE / NEET / CUET Focused' },
                { icon: Zap,    text: 'Adaptive Revision System' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-2 text-white/50 text-xs font-medium">
                  <f.icon className="h-3.5 w-3.5 text-white/40" />
                  {f.text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT — Dashboard ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <StudyVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
