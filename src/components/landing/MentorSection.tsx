import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, BookOpen } from 'lucide-react';

const mentorCards = [
  {
    title: 'Plans your study',
    desc: 'Daily + weekly realistic plan based on your capacity',
    icon: Clock,
  },
  {
    title: 'Breaks syllabus into priorities',
    desc: 'Clear roadmap, not overwhelming lists',
    icon: Target,
  },
  {
    title: 'Tells you what matters',
    desc: 'High weightage topics first, low priority later',
    icon: TrendingUp,
  },
  {
    title: 'Keeps you accountable',
    desc: 'No fake motivation, just honest tracking',
    icon: BookOpen,
  },
];

const stats = [
  { value: '9/10', label: 'Teacher', highlight: false },
  { value: '10/10', label: 'Human', highlight: false },
  { value: '11/10', label: 'Agony Aunt', highlight: true },
];

export const MentorSection: React.FC = () => {
  return (
    <section id="mentor-section" className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#1a3355] to-[#162a45]" />
      
      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-[#e07a3a]/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Geometric patterns */}
      <div className="absolute top-32 right-40 w-3 h-3 bg-[#e07a3a]/40 rotate-45" />
      <div className="absolute top-48 right-60 w-2 h-2 bg-white/20 rotate-45" />
      <div className="absolute bottom-40 left-32 w-4 h-4 bg-[#e07a3a]/30 rotate-45" />

      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-[#e07a3a]/20 text-[#e07a3a] text-sm font-semibold uppercase tracking-wide mb-4"
          >
            Your Personal Mentor
          </motion.p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Meet <span className="bg-gradient-to-r from-[#e07a3a] to-[#f09a5a] bg-clip-text text-transparent">Jeetu Bhaiya</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Not a chatbot. Not a teacher. A mentor who thinks with you.
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-12"
          >
            {stats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className={`text-4xl font-bold mb-1 ${stat.highlight ? 'text-[#e07a3a]' : 'text-white'}`}>
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm font-medium">{stat.label}</div>
                </motion.div>
                {i < stats.length - 1 && (
                  <div className="w-px h-12 bg-white/10" />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* Mentor Cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {mentorCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e07a3a]/0 to-[#e07a3a]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-start gap-4">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e07a3a] to-[#d06a2a] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#e07a3a]/20"
                >
                  <card.icon className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-1 group-hover:text-[#e07a3a] transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                    {card.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-14"
        >
          <blockquote className="text-xl text-white/60 italic font-medium">
            "Focused on results, not motivation quotes."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};
