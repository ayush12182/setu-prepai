// StudentHubPage — PrepEntrance Batch Home
// Premium EdTech learning-first design
// 4 Sections: Batch Header → Continue Learning → Subjects → Quick Actions

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronRight, Play, BookOpen, PenTool, ClipboardCheck,
  RotateCcw, Brain, BarChart3, ArrowRight, Clock,
  Atom, FlaskConical, Calculator, Leaf, GraduationCap, TrendingUp, Zap
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetBiologyChapters } from '@/data/neetSyllabus';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SubjectConfig {
  key: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  accent: string;
  ring: string;
  chapters: number;
  route: string;
  firstChapter: { id: string; name: string };
}

interface ContinueLearning {
  subject: string;
  subjectLabel: string;
  chapterId: string;
  chapterName: string;
  chapterNum: string;
  tab: string;
  accent: string;
  IconName: string;
}

// ─── Subject configs ─────────────────────────────────────────────────────────
const JEE_SUBJECTS: SubjectConfig[] = [
  {
    key: 'physics', label: 'Physics', Icon: Atom,
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', accent: '#2563EB', ring: 'ring-blue-100',
    chapters: physicsChapters.length, route: '/learn/physics',
    firstChapter: { id: physicsChapters[0].id, name: physicsChapters[0].name },
  },
  {
    key: 'chemistry', label: 'Chemistry', Icon: FlaskConical,
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', accent: '#059669', ring: 'ring-emerald-100',
    chapters: chemistryChapters.length, route: '/learn/chemistry',
    firstChapter: { id: chemistryChapters[0].id, name: chemistryChapters[0].name },
  },
  {
    key: 'maths', label: 'Mathematics', Icon: Calculator,
    color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', accent: '#7C3AED', ring: 'ring-violet-100',
    chapters: mathsChapters.length, route: '/learn/maths',
    firstChapter: { id: mathsChapters[0].id, name: mathsChapters[0].name },
  },
];

const NEET_SUBJECTS: SubjectConfig[] = [
  {
    key: 'physics', label: 'Physics', Icon: Atom,
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', accent: '#2563EB', ring: 'ring-blue-100',
    chapters: physicsChapters.length, route: '/learn/physics',
    firstChapter: { id: physicsChapters[0].id, name: physicsChapters[0].name },
  },
  {
    key: 'chemistry', label: 'Chemistry', Icon: FlaskConical,
    color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', accent: '#EA580C', ring: 'ring-orange-100',
    chapters: chemistryChapters.length, route: '/learn/chemistry',
    firstChapter: { id: chemistryChapters[0].id, name: chemistryChapters[0].name },
  },
  {
    key: 'biology', label: 'Biology', Icon: Leaf,
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', accent: '#059669', ring: 'ring-emerald-100',
    chapters: neetBiologyChapters.length, route: '/learn/biology',
    firstChapter: { id: neetBiologyChapters[0].id, name: neetBiologyChapters[0].name },
  },
];

const CUET_SUBJECTS: SubjectConfig[] = [
  {
    key: 'maths', label: 'Mathematics', Icon: Calculator,
    color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', accent: '#7C3AED', ring: 'ring-violet-100',
    chapters: mathsChapters.length, route: '/learn/maths',
    firstChapter: { id: mathsChapters[0].id, name: mathsChapters[0].name },
  },
  {
    key: 'physics', label: 'Physics', Icon: Atom,
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', accent: '#2563EB', ring: 'ring-blue-100',
    chapters: physicsChapters.length, route: '/learn/physics',
    firstChapter: { id: physicsChapters[0].id, name: physicsChapters[0].name },
  },
  {
    key: 'chemistry', label: 'Chemistry', Icon: FlaskConical,
    color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', accent: '#EA580C', ring: 'ring-orange-100',
    chapters: chemistryChapters.length, route: '/learn/chemistry',
    firstChapter: { id: chemistryChapters[0].id, name: chemistryChapters[0].name },
  },
];

const QUICK_ACTIONS = [
  { label: 'Practice',    Icon: PenTool,        route: '/practice',          color: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-100' },
  { label: 'Tests',       Icon: ClipboardCheck, route: '/test',              color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-100' },
  { label: 'Revision',    Icon: RotateCcw,      route: '/revision',          color: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-100' },
  { label: 'AI Mentor',   Icon: Brain,          route: '/ask-prepentrance',  color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100' },
  { label: 'Performance', Icon: BarChart3,      route: '/analytics',         color: 'text-slate-600',  bg: 'bg-slate-100',  border: 'border-slate-200' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function getSubjectProgress(subject: string) {
  try { return Math.min(100, Math.max(0, Number(localStorage.getItem(`progress_${subject}`) || '0'))); }
  catch { return 0; }
}

function getSubjectIcon(iconName: string) {
  switch (iconName) {
    case 'Atom': return Atom;
    case 'FlaskConical': return FlaskConical;
    case 'Calculator': return Calculator;
    case 'Leaf': return Leaf;
    default: return BookOpen;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentHubPage() {
  const navigate   = useNavigate();
  const { profile } = useAuth();
  const { isNeet, isCuet, examMode } = useExamMode();
  const { studentClass, classLabel } = useClassContext();

  const firstName  = profile?.full_name?.split(' ')[0] || 'Scholar';
  const batchName  = localStorage.getItem('batch_name') || profile?.cohortName || 'Aarambh 2028';
  const examLabel  = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';
  const classStage = localStorage.getItem('academic_stage') || (studentClass && studentClass > 0 ? String(studentClass) : '11');
  const classChip  = classStage === 'dropper' || classStage === '0' ? 'Dropper' : `Class ${classStage}`;

  const subjects   = isNeet ? NEET_SUBJECTS : isCuet ? CUET_SUBJECTS : JEE_SUBJECTS;
  const totalChapters = subjects.reduce((a, s) => a + s.chapters, 0);

  const [continueLearn, setContinueLearn] = useState<ContinueLearning | null>(null);
  const [progresses, setProgresses]       = useState<Record<string, number>>({});

  useEffect(() => {
    const p: Record<string, number> = {};
    subjects.forEach(s => { p[s.key] = getSubjectProgress(s.key); });
    setProgresses(p);

    try {
      const raw = localStorage.getItem('last_chapter');
      if (raw) setContinueLearn(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const overallPct = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + (progresses[s.key] ?? 0), 0) / subjects.length)
    : 0;

  const completedChapters = Math.round(totalChapters * overallPct / 100);

  // Exam badge colors
  const examBadgeClass = isNeet
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : isCuet
    ? 'bg-violet-100 text-violet-700 border-violet-200'
    : 'bg-blue-100 text-blue-700 border-blue-200';

  const examDotClass = isNeet ? 'bg-emerald-500' : isCuet ? 'bg-violet-500' : 'bg-blue-500';

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">

        {/* ═══════════════════════════════════════════
            SECTION 1 — BATCH HEADER
        ═══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

          {/* Greeting */}
          <div className="mb-4">
            <h1 className="text-title-lg font-bold text-slate-900">{getGreeting(firstName)} 👋</h1>
            <p className="text-slate-500 text-body-sm font-medium mt-1">Ready to study? Let's pick up where you left off.</p>
          </div>

          {/* Batch card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              {/* Left: Batch info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                <p className="text-caption font-semibold text-slate-400 mb-0.5">Your Batch</p>
                  <h2 className="text-title-md font-bold text-slate-900 leading-none">{batchName}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn('text-caption font-bold px-2.5 py-0.5 rounded-full border', examBadgeClass)}>
                      <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', examDotClass)} />
                      {examLabel}
                    </span>
                    <span className="text-caption font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {classChip}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="flex items-center gap-5 sm:gap-8 shrink-0">
                <div className="text-center">
                  <p className="text-title-lg font-bold text-slate-900">{totalChapters}</p>
                  <p className="text-caption text-slate-400 font-medium mt-0.5">Chapters</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="text-title-lg font-bold text-blue-600">{overallPct}%</p>
                  <p className="text-caption text-slate-400 font-medium mt-0.5">Completed</p>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                <div className="hidden sm:block">
                  {/* Mini progress ring */}
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#2563EB" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - overallPct / 100)}`}
                        strokeLinecap="round" className="transition-all duration-700" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-caption font-bold text-slate-700">{overallPct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            SECTION 2 — CONTINUE LEARNING
        ═══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.07 }}>
          <p className="text-body-lg font-bold text-slate-800 mb-3">Continue Learning</p>

          {continueLearn ? (() => {
            const ContinueIcon = getSubjectIcon(continueLearn.IconName ?? 'BookOpen');
            return (
              <button
                onClick={() => navigate(`/learn/${continueLearn.subject}/${continueLearn.chapterId}`)}
                className="w-full text-left group"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {/* Subject icon */}
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                        <ContinueIcon className="w-7 h-7 text-white" />
                      </div>

                      {/* Chapter info */}
                      <div>
                        <p className="text-caption font-semibold text-slate-400">
                          {continueLearn.subjectLabel} · {continueLearn.chapterNum}
                        </p>
                        <h3 className="text-title-md font-bold text-slate-900 mt-0.5 leading-tight">
                          {continueLearn.chapterName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-slate-400 text-caption font-medium">
                            Last visited: <span className="text-slate-600 font-semibold">{continueLearn.tab}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0">
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-body-sm shadow-sm group-hover:bg-blue-700 transition-colors">
                        <Play className="w-4 h-4 fill-current" />
                        <span className="hidden sm:inline">Resume Learning</span>
                        <span className="sm:hidden">Resume</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })() : (
            // No previous chapter — show start CTA
            <button
              onClick={() => navigate(subjects[0]?.route ?? '/learn/physics')}
              className="w-full text-left group"
            >
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-caption font-semibold text-slate-400">
                        {subjects[0]?.label} · Chapter 01
                      </p>
                      <h3 className="text-title-md font-bold text-slate-900 mt-0.5">
                        {subjects[0]?.firstChapter?.name ?? 'Kinematics'}
                      </h3>
                      <p className="text-slate-400 text-caption font-medium mt-1.5">
                        Start here — your first chapter is ready
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-body-sm shadow-sm group-hover:bg-blue-700 transition-colors">
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">Start Learning</span>
                      <span className="sm:hidden">Start</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════
            SECTION 3 — SUBJECTS GRID
        ═══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-lg font-bold text-slate-800">Subjects</p>
            <p className="text-caption text-slate-400 font-medium">{subjects.length} subjects</p>
          </div>

          <div className={cn(
            'grid gap-4',
            subjects.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
          )}>
            {subjects.map((subject, i) => {
              const progress = progresses[subject.key] ?? 0;
              const SubIcon = subject.Icon;

              return (
                <motion.button
                  key={subject.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17 + i * 0.06 }}
                  onClick={() => navigate(subject.route)}
                  className={cn(
                    'bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left',
                    'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 group',
                    `hover:ring-2 ${subject.ring}`
                  )}
                >
                  {/* Icon */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 border', subject.bg, subject.border)}>
                    <SubIcon className={cn('w-6 h-6', subject.color)} />
                  </div>

                  {/* Name + chapters */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-slate-900 font-bold text-body-md leading-tight">{subject.label}</h3>
                      <p className="text-slate-400 text-caption font-medium mt-0.5">{subject.chapters} chapters</p>
                    </div>
                    <ChevronRight className={cn('w-4 h-4 mt-1 shrink-0 text-slate-300 group-hover:translate-x-0.5 transition-all')}
                      style={{ color: progress > 0 ? subject.accent : undefined }} />
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-caption font-semibold" style={{ color: subject.accent }}>
                        {progress}% complete
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(2, progress)}%`, background: subject.accent }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            SECTION 4 — QUICK ACTIONS
        ═══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.28 }}>
          <p className="text-body-lg font-bold text-slate-800 mb-3">Quick Access</p>

          <div className="grid grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const ActionIcon = action.Icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.route)}
                  className={cn(
                    'bg-white border border-slate-200 rounded-2xl py-4 px-2 shadow-sm',
                    'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 group',
                    'flex flex-col items-center gap-2.5'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', action.bg, action.border)}>
                    <ActionIcon className={cn('w-5 h-5', action.color)} />
                  </div>
                  <span className="text-caption font-bold text-slate-600 group-hover:text-slate-900 text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

      </div>
    </MainLayout>
  );
}
