import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formulas = ['E = mc²', 'F = ma', '∫ dx', 'Σ n²', 'λ = h/p', 'PV = nRT', 'DNA 🧬', '∇ × B'];

const formulaPositions = [
  { left: '10%', top: '15%' }, { left: '22%', top: '70%' },
  { left: '75%', top: '20%' }, { left: '85%', top: '65%' },
  { left: '50%', top: '80%' }, { left: '60%', top: '12%' },
  { left: '35%', top: '45%' }, { left: '90%', top: '40%' },
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [currentWord, setCurrentWord] = useState(0);

  const words = ['Mentor', 'Guide', 'Coach', 'Teacher'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-primary">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/80 to-primary z-10" />
        <iframe
          src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
          title="SETU Background"
          className="absolute inset-0 w-[300%] h-[300%] -top-[100%] -left-[100%] opacity-30"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Static Grid Pattern */}
      <div className="absolute inset-0 z-[5] opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--accent)/0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--accent)/0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* CSS-only Floating Formulas */}
      <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none">
        {formulas.map((formula, i) => (
          <div
            key={formula}
            className="absolute text-white/15 font-mono text-lg sm:text-2xl animate-float-slow"
            style={{
              ...formulaPositions[i],
              animationDelay: `${i * 1.2}s`,
            }}
          >
            {formula}
          </div>
        ))}
      </div>

      {/* Static Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] z-[2]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/8 rounded-full blur-[120px] z-[2]" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 pt-20">
        <div className="max-w-5xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Built for JEE & NEET aspirants
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6"
          >
            <span className="block">Your AI</span>
            <span className="block mt-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block text-accent"
                >
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="block mt-2 text-white/90">for Exam Success</span>
          </motion.h1>

          {/* Value Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mb-4 leading-relaxed"
          >
            Don't spend <span className="text-accent font-semibold">₹1,00,000</span> on JEE/NEET preparation when smart guidance can start at just <span className="text-accent font-semibold">₹149</span>.
          </motion.p>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl lg:text-2xl text-white/70 max-w-2xl mb-3 leading-relaxed"
          >
            Not random AI. A mentor who understands your syllabus,
            <br className="hidden sm:block" />
            tracks your progress, and guides like <span className="text-accent font-semibold">a real teacher</span>.
          </motion.p>

          {/* Supporting line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-sm sm:text-base text-white/50 max-w-2xl mb-10 leading-relaxed"
          >
            High-quality exam mentorship shouldn't be expensive. SETU brings structured guidance at a price every aspirant can afford.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start gap-4 mb-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="group h-14 px-8 text-lg font-semibold bg-accent text-primary hover:bg-accent/90 rounded-xl shadow-[0_0_40px_rgba(232,154,60,0.4)] hover:shadow-[0_0_60px_rgba(232,154,60,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              Start Learning for ₹149
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg font-medium border-2 border-white/30 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 rounded-xl transition-all duration-300"
              onClick={() => {
                document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust subtext + badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-3 mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
              Student-Friendly Pricing
            </span>
            <span className="text-white/50 text-sm">Affordable AI mentorship designed for serious aspirants.</span>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-8 sm:gap-12"
          >
            {[
              { value: '21', label: 'Day Cycles' },
              { value: '50K+', label: 'PYQs Covered' },
              { value: '3', label: 'Hour Tests' },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Trust Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 text-sm text-white/40 max-w-2xl leading-relaxed"
          >
            Built with insights from aspirants across India's leading coaching institutes — guided by experienced faculty mentors.
          </motion.p>
        </div>
      </div>

      {/* Sound Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2 animate-bounce" style={{ animationDuration: '2s' }}>
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
