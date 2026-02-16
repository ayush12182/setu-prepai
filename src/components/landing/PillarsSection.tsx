import React from 'react';
import { Route, Brain, Target, Clock, BookOpen, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const pillars = [
  {
    icon: Route,
    title: 'Structured Path',
    description: 'Chapter → Subchapter → Practice → Analysis. Every step planned.',
    gradient: 'from-[hsl(210,80%,55%)] to-[hsl(190,80%,50%)]',
    bgGlow: 'bg-[hsl(210,80%,55%)]',
    number: '01',
  },
  {
    icon: Brain,
    title: 'AI That Thinks Like a Teacher',
    description: 'Explains concepts step-by-step, in a calm coaching tone.',
    gradient: 'from-[hsl(270,70%,60%)] to-[hsl(330,70%,60%)]',
    bgGlow: 'bg-[hsl(270,70%,60%)]',
    number: '02',
  },
  {
    icon: Target,
    title: 'Exam-Accurate Testing',
    description: '3-hour JEE Main-style tests every 21 days.',
    gradient: 'from-accent to-[hsl(15,80%,55%)]',
    bgGlow: 'bg-accent',
    number: '03',
  },
  {
    icon: Clock,
    title: '21-Day Cycles',
    description: 'Time-bound preparation with clear milestones.',
    gradient: 'from-[hsl(150,60%,45%)] to-[hsl(170,70%,45%)]',
    bgGlow: 'bg-[hsl(150,60%,45%)]',
    number: '04',
  },
  {
    icon: BookOpen,
    title: 'PYQ-First Approach',
    description: 'Learn from 15+ years of previous year questions.',
    gradient: 'from-[hsl(40,90%,55%)] to-accent',
    bgGlow: 'bg-[hsl(40,90%,55%)]',
    number: '05',
  },
  {
    icon: Trophy,
    title: 'Track Your Growth',
    description: 'Detailed analytics on every topic and test.',
    gradient: 'from-[hsl(240,60%,60%)] to-[hsl(270,70%,60%)]',
    bgGlow: 'bg-[hsl(240,60%,60%)]',
    number: '06',
  },
];

export const PillarsSection: React.FC = () => {
  return (
    <section id="features" className="relative py-28 px-6 sm:px-12 overflow-hidden bg-primary">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white rounded-full blur-[150px]" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-5 tracking-wide">
            Why SETU Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Six pillars that make
            <br />
            <span className="text-accent">preparation actually work</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Not random features. A system designed for results.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500 overflow-hidden"
            >
              {/* Hover Glow */}
              <div className={`absolute -bottom-20 -right-20 w-40 h-40 ${pillar.bgGlow} rounded-full opacity-0 group-hover:opacity-[0.08] blur-3xl transition-all duration-500`} />

              {/* Number watermark */}
              <span className="absolute top-5 right-6 text-6xl font-black text-white/[0.03] group-hover:text-white/[0.06] transition-all duration-500 select-none">
                {pillar.number}
              </span>

              {/* Icon */}
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-5 shadow-lg shadow-white/5 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                <pillar.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="relative text-lg font-semibold text-white mb-2 group-hover:text-accent transition-colors duration-300">
                {pillar.title}
              </h3>
              <p className="relative text-white/50 text-sm leading-relaxed group-hover:text-white/65 transition-colors duration-300">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
