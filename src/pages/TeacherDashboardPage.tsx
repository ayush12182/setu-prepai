import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight, Sparkles, GraduationCap, Atom, FlaskConical, FunctionSquare, Clock, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useExamMode } from '@/contexts/ExamModeContext';

/* ────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────── */
const teachers = [
  {
    id: 'pk-sir',
    name: 'P.K. Sir',
    subject: 'Physics',
    tagline: 'Master of Mechanics & Electrostatics',
    experience: '12+ years JEE experience',
    rating: 4.9,
    reviews: 3240,
    status: 'live' as const,
    icon: Atom,
    students: '3.2K',
    topics: ["Newton's Laws", 'Electrostatics', 'Optics', 'Modern Physics'],
    accent: 'hsl(213 60% 55%)',
    accentMuted: 'hsl(213 60% 55% / 0.15)',
    accentBorder: 'hsl(213 60% 55% / 0.25)',
    accentText: 'hsl(213 80% 75%)',
  },
  {
    id: 'vk-sir',
    name: 'V.K. Sir',
    subject: 'Chemistry',
    tagline: 'Organic & Physical Chemistry Expert',
    experience: '10+ years JEE experience',
    rating: 4.8,
    reviews: 2890,
    status: 'available' as const,
    icon: FlaskConical,
    students: '2.8K',
    topics: ['Organic Reactions', 'Thermodynamics', 'Equilibrium', 'Electrochemistry'],
    accent: 'hsl(145 50% 45%)',
    accentMuted: 'hsl(145 50% 45% / 0.15)',
    accentBorder: 'hsl(145 50% 45% / 0.25)',
    accentText: 'hsl(145 60% 70%)',
  },
  {
    id: 'ak-sir',
    name: 'A.K. Sir',
    subject: 'Maths',
    tagline: 'Calculus & Algebra Specialist',
    experience: '15+ years JEE experience',
    rating: 4.9,
    reviews: 4150,
    status: 'available' as const,
    icon: FunctionSquare,
    students: '4.1K',
    topics: ['Integration', 'Matrices', 'Coordinate Geometry', 'Limits'],
    accent: 'hsl(32 79% 57%)',
    accentMuted: 'hsl(32 79% 57% / 0.15)',
    accentBorder: 'hsl(32 79% 57% / 0.25)',
    accentText: 'hsl(32 100% 80%)',
  },
];

/* ────────────────────────────────────────────────
   TEACHER CARD — matches SETU dark sidebar palette
──────────────────────────────────────────────── */
function TeacherCard({ teacher, index }: { teacher: typeof teachers[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const Icon = teacher.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: hovered
          ? 'linear-gradient(145deg, hsl(213 25% 18%) 0%, hsl(213 25% 15%) 100%)'
          : 'linear-gradient(145deg, hsl(213 25% 16%) 0%, hsl(213 25% 13%) 100%)',
        border: `1px solid ${hovered ? teacher.accentBorder : 'hsl(213 20% 22%)'}`,
        boxShadow: hovered ? `0 8px 32px hsl(0 0% 0% / 0.35), 0 0 0 1px ${teacher.accentBorder}` : '0 2px 8px hsl(0 0% 0% / 0.2)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Colour stripe at top */}
      <div className="h-1 w-full" style={{ background: teacher.accent }} />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: teacher.accentMuted, border: `1px solid ${teacher.accentBorder}` }}
          >
            <Icon size={26} style={{ color: teacher.accent }} />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Status badge */}
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={
                teacher.status === 'live'
                  ? { background: 'hsl(0 65% 48% / 0.15)', color: 'hsl(0 80% 72%)', border: '1px solid hsl(0 65% 48% / 0.3)' }
                  : { background: teacher.accentMuted, color: teacher.accentText, border: `1px solid ${teacher.accentBorder}` }
              }
            >
              {teacher.status === 'live' ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Live Now</>
              ) : (
                <><Clock size={9} />Available</>
              )}
            </span>

            {/* Subject badge */}
            <span
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
              style={{ background: teacher.accentMuted, color: teacher.accentText, border: `1px solid ${teacher.accentBorder}` }}
            >
              {teacher.subject}
            </span>
          </div>
        </div>

        {/* Teacher info */}
        <div>
          <h3 className="text-base font-bold text-white">{teacher.name}</h3>
          <p className="text-sm mt-0.5 font-medium" style={{ color: teacher.accentText }}>{teacher.tagline}</p>
          <p className="text-xs text-white/40 mt-1">{teacher.experience}</p>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={12} fill="hsl(32 90% 65%)" color="hsl(32 90% 65%)" />
            <span className="text-sm font-bold text-white">{teacher.rating}</span>
            <span className="text-xs text-white/40">({(teacher.reviews / 1000).toFixed(1)}K)</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Users size={10} />
            <span>{teacher.students} students</span>
          </div>
        </div>

        {/* Topic chips */}
        <div className="flex flex-wrap gap-1">
          {teacher.topics.map(t => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: 'hsl(213 20% 22%)', color: 'hsl(213 10% 65%)' }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'hsl(213 20% 22%)' }} />

        {/* CTA */}
        <button
          onClick={() => navigate(`/teaching-room/${teacher.id}`)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          style={{
            background: hovered ? teacher.accent : teacher.accentMuted,
            color: hovered ? '#0f172a' : teacher.accentText,
            border: `1px solid ${hovered ? 'transparent' : teacher.accentBorder}`,
          }}
        >
          Start Learning
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────
   STATS BAR
──────────────────────────────────────────────── */
const stats = [
  { value: '3', label: 'AI Teachers', icon: GraduationCap, color: 'hsl(213 60% 65%)' },
  { value: '500+', label: 'Topics Covered', icon: Zap, color: 'hsl(32 90% 65%)' },
  { value: '10K+', label: 'Students Learning', icon: Users, color: 'hsl(145 60% 60%)' },
];

/* ────────────────────────────────────────────────
   PAGE
──────────────────────────────────────────────── */
const TeacherDashboardPage: React.FC = () => {
  const { config } = useExamMode();

  return (
    <MainLayout title="AI Teachers">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(32_79%_57%/0.15)] flex items-center justify-center">
              <GraduationCap size={16} className="text-accent" />
            </div>
            <h1 className="text-xl font-bold text-foreground">AI Teachers</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[hsl(32_79%_57%/0.12)] text-accent border border-accent/20">
              <Sparkles size={10} />
              Powered by AI
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Choose your subject teacher. Ask doubts, get explanations, learn like you're in a real classroom.
          </p>
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-3 gap-3"
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'hsl(213 25% 16%)', border: '1px solid hsl(213 20% 22%)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: s.color.replace(')', ' / 0.15)').replace('hsl(', 'hsl(') }}
                >
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-base font-extrabold text-white leading-none">{s.value}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── Teacher cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t, i) => <TeacherCard key={t.id} teacher={t} index={i} />)}
        </div>

        <p className="text-center text-xs text-muted-foreground pb-2">
          SETU AI Teachers are available 24/7 • All explanations are JEE-aligned
        </p>
      </div>
    </MainLayout>
  );
};

export default TeacherDashboardPage;
