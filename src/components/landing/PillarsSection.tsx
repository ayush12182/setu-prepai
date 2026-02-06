import React from 'react';
import { Route, Brain, Target, Clock, BookOpen, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const pillars = [
  {
    icon: Route,
    title: 'Structured Path',
    description: 'Chapter → Subchapter → Practice → Analysis. Every step planned.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'AI That Thinks Like a Teacher',
    description: 'Explains concepts step-by-step, in a calm coaching tone.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Target,
    title: 'Exam-Accurate Testing',
    description: '3-hour JEE Main-style tests every 21 days.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Clock,
    title: '21-Day Cycles',
    description: 'Time-bound preparation with clear milestones.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: BookOpen,
    title: 'PYQ-First Approach',
    description: 'Learn from 15+ years of previous year questions.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Trophy,
    title: 'Track Your Growth',
    description: 'Detailed analytics on every topic and test.',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const PillarsSection: React.FC = () => {
  return (
    <section id="features" className="relative py-24 px-6 sm:px-12 overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why SETU Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Built Different
          </h2>
          <p className="text-secondary-foreground text-lg max-w-xl mx-auto">
            Six pillars that make exam preparation actually work.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-accent/50 transition-all duration-300 overflow-hidden"
            >
              {/* Hover Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <pillar.icon className="h-7 w-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="relative text-xl font-semibold text-primary mb-3 group-hover:text-accent transition-colors duration-300">
                {pillar.title}
              </h3>
              <p className="relative text-secondary-foreground leading-relaxed">
                {pillar.description}
              </p>

              {/* Corner Accent */}
              <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${pillar.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
