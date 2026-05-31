import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Users, CalendarDays, ClipboardCheck, BarChart4, Trophy } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Select Exam',
    desc: 'Choose your target stream — JEE (Main/Advanced), NEET UG, or CUET based on your college aspirations.',
    icon: Compass,
    color: '#FF9B54',
    bg: 'bg-[#FF9B54]/10',
    border: 'border-[#FF9B54]/25',
    text: 'text-[#FF9B54]'
  },
  {
    step: '02',
    title: 'Join Batch',
    desc: 'Enroll in a structured interactive preparation batch optimized for your year and class track.',
    icon: Users,
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    text: 'text-blue-400'
  },
  {
    step: '03',
    title: 'Follow Study Plan',
    desc: 'Access day-wise structured planners, video resources, conceptual short notes, and practice worksheets.',
    icon: CalendarDays,
    color: '#a78bfa',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    text: 'text-violet-400'
  },
  {
    step: '04',
    title: 'Take Tests',
    desc: 'Evaluate understanding with high-quality chapter tests, part tests, and regular national level mock exams.',
    icon: ClipboardCheck,
    color: '#34d399',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-400'
  },
  {
    step: '05',
    title: 'Track Progress',
    desc: 'Review extensive personal performance reports to pinpoint weaknesses and accuracy gaps.',
    icon: BarChart4,
    color: '#facc15',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    text: 'text-amber-400'
  },
  {
    step: '06',
    title: 'Achieve College',
    desc: 'Perfect your scores through continuous focused revision, crack your final exam, and secure your target college.',
    icon: Trophy,
    color: '#f43f5e',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    text: 'text-rose-400'
  }
];

const PrepJourneySection: React.FC = () => {
  return (
    <section id="journey" className="py-24 relative bg-[#07111F]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(59,130,246,0.03),transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF9B54] mb-4"
          >
            Syllabus to Success
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Your Preparation Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="text-[#94A3B8] text-base sm:text-lg leading-relaxed"
          >
            Cracking competitive national exams requires a structured plan. Here is the step-by-step roadmap you will follow on PrepEntrance.
          </motion.p>
        </div>

        {/* Journey Flow Desktop & Mobile */}
        <div className="relative">
          
          {/* Timeline connecting line (Desktop only) */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-[#FF9B54] via-blue-500 to-rose-500 opacity-20 -translate-y-1/2 hidden lg:block" />

          {/* Steps Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="group relative rounded-2xl border border-white/[0.06] bg-[#0E1726]/60 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-white/[0.12] transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
                >
                  <div>
                    {/* Top row with step number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-2xl font-black opacity-30 group-hover:opacity-60 transition-opacity`} style={{ color: s.color }}>
                        {s.step}
                      </span>
                      <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${s.text}`} />
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#FF9B54] transition-colors leading-tight">
                      {s.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-white/50 text-[11px] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {/* Flow Arrow (Desktop & Mobile helpers) */}
                  <div className="mt-6 flex items-center gap-1.5 text-[10px] font-bold text-white/30 group-hover:text-white/60 transition-colors">
                    <span>Step {s.step}</span>
                    {idx < STEPS.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 ml-auto text-white/20 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner below flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
            <span className="text-white/60 text-xs sm:text-sm font-semibold">
              Ready to start your journey? Choose an exam above or enroll in a batch.
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PrepJourneySection;
