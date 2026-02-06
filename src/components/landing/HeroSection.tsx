import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX, BookOpen, Brain, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating education elements
const FloatingElement: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, duration = 6, className, style }) => (
  <motion.div
    className={className}
    style={style}
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      y: [0, -30, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

// Animated formulas floating in background
const formulas = [
  'E = mc²',
  'F = ma',
  '∫ dx',
  'Σ n²',
  'λ = h/p',
  'PV = nRT',
  'd/dx',
  '∇ × B',
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

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 z-[5] opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--accent)/0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--accent)/0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Floating Formulas */}
      <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none">
        {formulas.map((formula, i) => (
          <FloatingElement
            key={formula}
            delay={i * 0.8}
            duration={8 + i}
            className={`absolute text-white/20 font-mono text-lg sm:text-2xl`}
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 15) % 70}%`,
            } as React.CSSProperties}
          >
            {formula}
          </FloatingElement>
        ))}
      </div>

      {/* Floating Education Icons */}
      <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none">
        <FloatingElement delay={0} duration={7} className="absolute top-[20%] left-[8%]">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 backdrop-blur-sm flex items-center justify-center border border-accent/30">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
        </FloatingElement>
        <FloatingElement delay={1.5} duration={8} className="absolute top-[30%] right-[10%]">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Brain className="w-7 h-7 text-white" />
          </div>
        </FloatingElement>
        <FloatingElement delay={2.5} duration={9} className="absolute bottom-[25%] left-[15%]">
          <div className="w-12 h-12 rounded-xl bg-accent/30 backdrop-blur-sm flex items-center justify-center border border-accent/40">
            <Target className="w-6 h-6 text-white" />
          </div>
        </FloatingElement>
        <FloatingElement delay={3} duration={6} className="absolute top-[60%] right-[20%]">
          <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
        </FloatingElement>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] z-[2]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] z-[2]" />

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
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4 }}
                  className="inline-block text-accent"
                >
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="block mt-2 text-white/90">for Exam Success</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl lg:text-2xl text-white/70 max-w-2xl mb-10 leading-relaxed"
          >
            Not random AI. A mentor who understands your syllabus,
            <br className="hidden sm:block" />
            tracks your progress, and guides like <span className="text-accent font-semibold">Jeetu Bhaiya</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="group h-14 px-8 text-lg font-semibold bg-accent text-primary hover:bg-accent/90 rounded-xl shadow-[0_0_40px_rgba(232,154,60,0.4)] hover:shadow-[0_0_60px_rgba(232,154,60,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              Start Free Trial
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
            ].map((stat, i) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Sound Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </motion.button>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};
