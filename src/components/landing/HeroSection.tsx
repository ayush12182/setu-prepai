import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import StudyVisual from '@/components/landing/StudyVisual';

/* ── Minimalist Particle Canvas (highly optimized for clean background) ── */
const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.1, dy: (Math.random() - 0.5) * 0.1,
      a: Math.random() * 0.2 + 0.05,
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
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" />;
};

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const scrollToBatches = () => {
    document.getElementById('batches')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#07111F] py-16 lg:py-24">
      {/* Premium Background gradients */}
      <div className="absolute inset-0 bg-[#07111F]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(255,155,84,0.09),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_70%,rgba(59,130,246,0.05),transparent)]" />
      <div className="absolute inset-0 opacity-[0.022]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />
      <ParticleCanvas />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full z-10">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-20 items-center">

          {/* ── LEFT: Typography & Clear Hierarchy ── */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9B54]/30 bg-[#FF9B54]/8 text-xs font-bold text-[#FF9B54] tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B54] animate-pulse" />
                Structured Batches & Prep Courses
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}>
              <h1 className="text-3xl sm:text-5xl lg:text-[3.2rem] font-extrabold text-white leading-[1.1] tracking-[-0.02em] font-display">
                Your Complete Roadmap to
              </h1>
              <h2 className="text-3xl sm:text-5xl lg:text-[3.2rem] font-extrabold text-white/85 leading-[1.1] tracking-[-0.02em] mt-1 font-display">
                JEE, NEET & CUET Success
              </h2>
            </motion.div>

            {/* Subhead */}
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
              className="text-lg text-[#94A3B8] leading-relaxed max-w-lg font-sans"
            >
              Structured batches, daily study plans, mock tests, PYQs, revision schedules, and AI-powered guidance in one place.
            </motion.p>

            {/* Flagship Batches mini cards */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="space-y-2.5">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Flagship Prep Courses:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: '🎯', label: 'PE Foundation', sub: 'Class 11 · JEE/NEET', bg: 'hover:border-orange-500/35' },
                  { icon: '🚀', label: 'PE Accelerator', sub: 'Class 12 · JEE/NEET', bg: 'hover:border-blue-500/35' },
                  { icon: '⚡', label: 'PE Momentum', sub: 'Dropper · JEE/NEET', bg: 'hover:border-emerald-500/35' }
                ].map(b => (
                  <div key={b.label} className={`px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.07] flex items-start gap-3 shadow-md hover:bg-white/[0.04] transition-all duration-300 ${b.bg}`}>
                    <span className="text-lg shrink-0 mt-0.5">{b.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-xs">{b.label}</span>
                      <span className="text-[9px] text-[#FF9B54] font-bold mt-0.5">{b.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToBatches}
                className="group flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl bg-[#FF9B54] text-[#07111F] font-black text-base hover:brightness-110 transition-all shadow-[0_0_40px_rgba(255,155,84,0.2)] hover:-translate-y-0.5 duration-200"
              >
                Explore Batches
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="flex items-center justify-center gap-2 px-6 py-4.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white font-bold text-base hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Free Trial
              </button>
            </motion.div>

            {/* Target outcome universities */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="space-y-2 pt-2">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Target Institutions:</p>
              <div className="flex flex-wrap gap-4 text-white/50 text-xs font-black uppercase tracking-wider">
                <span className="hover:text-white transition-colors">IITs</span>
                <span className="text-white/15">•</span>
                <span className="hover:text-white transition-colors">AIIMS</span>
                <span className="text-white/15">•</span>
                <span className="hover:text-white transition-colors">NITs</span>
                <span className="text-white/15">•</span>
                <span className="hover:text-white transition-colors">IISERs</span>
                <span className="text-white/15">•</span>
                <span className="hover:text-white transition-colors">Top Universities</span>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT — Aspirational Study Scene ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block flex-1"
          >
            <StudyVisual />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
