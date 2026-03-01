import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, BookOpen, Rocket, Trophy } from 'lucide-react';

const stages = [
  {
    icon: Sprout,
    stage: 'Stage 1',
    title: 'Class 6–8',
    subtitle: 'Foundation Building',
    points: ['Concept foundation in Maths & Science', 'Logical thinking & problem solving', 'Building strong learning habits'],
    gradient: 'from-[hsl(145,60%,45%)] to-[hsl(170,70%,45%)]',
    bgGlow: 'bg-[hsl(145,60%,45%)]',
  },
  {
    icon: BookOpen,
    stage: 'Stage 2',
    title: 'Class 9–10',
    subtitle: 'Academic Mastery',
    points: ['Board exam preparation', 'Weakness analysis & remediation', 'Olympiad & NTSE readiness'],
    gradient: 'from-[hsl(210,80%,55%)] to-[hsl(230,70%,60%)]',
    bgGlow: 'bg-[hsl(210,80%,55%)]',
  },
  {
    icon: Rocket,
    stage: 'Stage 3',
    title: 'Class 11–12',
    subtitle: 'Competitive Alignment',
    points: ['Advanced PCM / PCB learning', 'Board + competitive balance', 'Deep concept mastery'],
    gradient: 'from-[hsl(270,70%,60%)] to-[hsl(300,60%,55%)]',
    bgGlow: 'bg-[hsl(270,70%,60%)]',
  },
  {
    icon: Trophy,
    stage: 'Stage 4',
    title: 'JEE / NEET / CUET',
    subtitle: 'Exam Readiness',
    points: ['Adaptive testing & CAT engine', 'Performance analytics', 'Full-length mock exams'],
    gradient: 'from-accent to-[hsl(15,80%,55%)]',
    bgGlow: 'bg-accent',
  },
];

export const LearningJourneySection: React.FC = () => {
  return (
    <section className="relative py-28 px-6 sm:px-12 overflow-hidden bg-primary">
      {/* Background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-white rounded-full blur-[150px]" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-5 tracking-wide">
            One Continuous Path
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            The Complete
            <br />
            <span className="text-accent">Learning Journey</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Not separate products. A seamless evolution from foundations to competitive success.
          </p>
        </motion.div>

        {/* Journey Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(145,60%,45%)/0.3] via-[hsl(270,70%,60%)/0.3] to-[hsl(var(--accent))/0.3] -translate-y-1/2 z-0" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500 overflow-hidden z-10"
              >
                {/* Glow */}
                <div className={`absolute -bottom-16 -right-16 w-32 h-32 ${stage.bgGlow} rounded-full opacity-0 group-hover:opacity-[0.1] blur-3xl transition-all duration-500`} />

                {/* Stage label */}
                <span className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-3 block">
                  {stage.stage}
                </span>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stage.icon className="h-5 w-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors duration-300">
                  {stage.title}
                </h3>
                <p className="text-sm text-accent/80 font-medium mb-4">{stage.subtitle}</p>

                <ul className="space-y-2">
                  {stage.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/50 group-hover:text-white/65 transition-colors">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-accent/60 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Arrow connector on larger screens */}
                {i < 3 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <span className="text-accent text-xs">→</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
