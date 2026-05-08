import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const MiniParticles: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const pts = Array.from({ length: 30 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.15, dy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.25 + 0.05,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,155,84,${p.a})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" />;
};

const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#07111F]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,155,84,0.1),transparent)]" />
      <MiniParticles />
      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-[#FF9B54]/20 bg-[#0E1726]/60 backdrop-blur-xl p-12 sm:p-16 shadow-2xl shadow-black/50"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9B54]/25 bg-[#FF9B54]/8 text-xs font-semibold text-[#FF9B54] tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B54] animate-pulse" />
            Next Generation AI Preparation
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Preparation Should Be
            <br />
            <span className="bg-gradient-to-r from-[#FF9B54] to-[#ffcc94] bg-clip-text text-transparent">
              Intelligent.
            </span>
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Join the next generation of AI-powered exam preparation for JEE, NEET, and CUET.
          </p>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="group inline-flex items-center gap-2.5 px-10 py-4.5 rounded-2xl bg-[#FF9B54] text-[#07111F] font-bold text-lg hover:bg-[#ffaa6e] transition-all shadow-2xl shadow-[#FF9B54]/30 hover:shadow-[#FF9B54]/50 hover:-translate-y-1 duration-200"
          >
            Start Now
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
