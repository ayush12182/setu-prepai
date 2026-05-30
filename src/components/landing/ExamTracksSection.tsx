import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, FlaskConical, Building2 } from 'lucide-react';

const TRACKS = [
  {
    Icon: BookOpen,
    exam: 'IIT JEE',
    label: 'JEE Main & Advanced',
    tagline: 'Engineering Entrance · India\'s most competitive exam',
    classes: ['Class 11', 'Class 12', 'Dropper Year'],
    subjects: ['Physics', 'Chemistry', 'Maths'],
    stat: '~12 lakh aspirants annually',
    color: '#FF9B54',
    gradient: 'from-[#FF9B54]/12 via-[#f07020]/6 to-transparent',
    borderHover: 'group-hover:border-[#FF9B54]/45',
    tagBg: 'bg-[#FF9B54]/10 text-[#FF9B54] border-[#FF9B54]/25',
    path: '/auth?exam=jee',
  },
  {
    Icon: FlaskConical,
    exam: 'NEET UG',
    label: 'NEET',
    tagline: 'Medical Entrance · Class 11–12 Biology stream',
    classes: ['Class 11', 'Class 12', 'Dropper Year'],
    subjects: ['Physics', 'Chemistry', 'Biology'],
    stat: '~23 lakh aspirants annually',
    color: '#34d399',
    gradient: 'from-emerald-500/12 via-teal-500/6 to-transparent',
    borderHover: 'group-hover:border-emerald-500/45',
    tagBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    path: '/auth?exam=neet',
  },
  {
    Icon: Building2,
    exam: 'CUET UG',
    label: 'CUET',
    tagline: 'Central University Entrance · Domain + General Test',
    classes: ['Class 12'],
    subjects: ['General Test', 'Domain Subjects', 'Language'],
    stat: '~14 lakh aspirants annually',
    color: '#a78bfa',
    gradient: 'from-violet-500/12 via-purple-500/6 to-transparent',
    borderHover: 'group-hover:border-violet-500/45',
    tagBg: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
    path: '/auth?exam=cuet',
  },
];

const ExamTracksSection: React.FC = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="exams" className="py-24 relative">
      {/* Section BG */}
      <div className="absolute inset-0 bg-[#08121E]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,155,84,0.04),transparent)]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF9B54] mb-4"
          >
            Choose Your Path
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Built for Every Exam
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="text-[#94A3B8] text-lg max-w-lg mx-auto leading-relaxed"
          >
            Select your target — PrepEntrance adapts the entire preparation engine to your syllabus, exam pattern, and timeline.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {TRACKS.map((t, i) => (
            <motion.div
              key={t.exam}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              onClick={() => navigate(t.path)}
              className={`group relative rounded-3xl border border-white/[0.08] ${t.borderHover} bg-[#0C1825]/80 overflow-hidden cursor-pointer transition-all duration-400`}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Gradient wash */}
              <div className={`absolute inset-0 bg-gradient-to-b ${t.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${t.color}80, transparent)` }}
              />

              <div className="relative p-8">
                {/* Icon + exam tag */}
                <div className="flex items-start justify-between mb-7">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: t.color + '15',
                      border: `1.5px solid ${t.color}30`,
                      boxShadow: hovered === i ? `0 0 20px ${t.color}20` : 'none',
                      transition: 'box-shadow 0.3s',
                    }}
                  >
                    <t.Icon className="h-6 w-6" style={{ color: t.color }} />
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${t.tagBg}`}>
                    {t.exam}
                  </span>
                </div>

                {/* Title + tagline */}
                <h3 className="text-white font-bold text-2xl mb-2 leading-tight">{t.label}</h3>
                <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">{t.tagline}</p>

                {/* Classes */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {t.classes.map(c => (
                    <span
                      key={c}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
                      style={{
                        borderColor: t.color + '25',
                        color: t.color + 'bb',
                        background: t.color + '0d',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-1.5 mb-7">
                  {t.subjects.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-[11px] text-white/40 bg-white/[0.04] border border-white/[0.06]">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06] mb-5" />

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">{t.stat}</span>
                  <motion.div
                    animate={{ x: hovered === i ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: t.color }}
                  >
                    Start Preparing
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-[#94A3B8]/40 text-xs mt-10"
        >
          PrepEntrance AI personalizes the full preparation system — syllabus, practice, revision, and analytics — for your selected exam.
        </motion.p>
      </div>
    </section>
  );
};

export default ExamTracksSection;
