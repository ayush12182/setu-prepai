// StudentHubPage — PrepEntrance AI-First Learning OS
// Redesigned: AI Mentor Hero + Today's Mission + Premium Subject Cards + Journey Roadmap

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowRight, Clock, BookOpen, PenTool, ClipboardCheck,
  RotateCcw, Brain, BarChart3, Play, Zap, Target, Sparkles,
  Atom, FlaskConical, Calculator, Leaf, GraduationCap,
  TrendingUp, ChevronRight, Award, Flame, CheckCircle2,
  MapPin, Circle, Trophy, Star, MessageSquare
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getFirstChapterId } from '@/data/syllabusClass';
import { getChapterById } from '@/data/syllabus';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetBiologyChapters } from '@/data/neetSyllabus';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SubjectConfig {
  key: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  gradientFrom: string;
  gradientTo: string;
  accent: string;
  accentLight: string;
  chapters: number;
  route: string;
  firstChapter: { id: string; name: string };
  emoji: string;
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
    key: 'physics', label: 'Physics', Icon: Atom, emoji: '⚛️',
    color: 'text-blue-700', bg: 'bg-blue-50',
    gradientFrom: 'from-blue-500', gradientTo: 'to-indigo-600',
    accent: '#2563EB', accentLight: '#EFF6FF',
    chapters: physicsChapters.length, route: '/learn/physics',
    firstChapter: { id: physicsChapters[0].id, name: physicsChapters[0].name },
  },
  {
    key: 'chemistry', label: 'Chemistry', Icon: FlaskConical, emoji: '🧪',
    color: 'text-emerald-700', bg: 'bg-emerald-50',
    gradientFrom: 'from-emerald-500', gradientTo: 'to-teal-600',
    accent: '#059669', accentLight: '#ECFDF5',
    chapters: chemistryChapters.length, route: '/learn/chemistry',
    firstChapter: { id: chemistryChapters[0].id, name: chemistryChapters[0].name },
  },
  {
    key: 'maths', label: 'Mathematics', Icon: Calculator, emoji: '📐',
    color: 'text-violet-700', bg: 'bg-violet-50',
    gradientFrom: 'from-violet-500', gradientTo: 'to-purple-600',
    accent: '#7C3AED', accentLight: '#F5F3FF',
    chapters: mathsChapters.length, route: '/learn/maths',
    firstChapter: { id: mathsChapters[0].id, name: mathsChapters[0].name },
  },
];

const NEET_SUBJECTS: SubjectConfig[] = [
  {
    key: 'physics', label: 'Physics', Icon: Atom, emoji: '⚛️',
    color: 'text-blue-700', bg: 'bg-blue-50',
    gradientFrom: 'from-blue-500', gradientTo: 'to-indigo-600',
    accent: '#2563EB', accentLight: '#EFF6FF',
    chapters: physicsChapters.length, route: '/learn/physics',
    firstChapter: { id: physicsChapters[0].id, name: physicsChapters[0].name },
  },
  {
    key: 'chemistry', label: 'Chemistry', Icon: FlaskConical, emoji: '🧪',
    color: 'text-orange-700', bg: 'bg-orange-50',
    gradientFrom: 'from-orange-500', gradientTo: 'to-rose-600',
    accent: '#EA580C', accentLight: '#FFF7ED',
    chapters: chemistryChapters.length, route: '/learn/chemistry',
    firstChapter: { id: chemistryChapters[0].id, name: chemistryChapters[0].name },
  },
  {
    key: 'biology', label: 'Biology', Icon: Leaf, emoji: '🌿',
    color: 'text-emerald-700', bg: 'bg-emerald-50',
    gradientFrom: 'from-emerald-500', gradientTo: 'to-green-600',
    accent: '#059669', accentLight: '#ECFDF5',
    chapters: neetBiologyChapters.length, route: '/learn/biology',
    firstChapter: { id: neetBiologyChapters[0].id, name: neetBiologyChapters[0].name },
  },
];

const CUET_SUBJECTS: SubjectConfig[] = [
  {
    key: 'maths', label: 'Mathematics', Icon: Calculator, emoji: '📐',
    color: 'text-violet-700', bg: 'bg-violet-50',
    gradientFrom: 'from-violet-500', gradientTo: 'to-purple-600',
    accent: '#7C3AED', accentLight: '#F5F3FF',
    chapters: mathsChapters.length, route: '/learn/maths',
    firstChapter: { id: mathsChapters[0].id, name: mathsChapters[0].name },
  },
  {
    key: 'physics', label: 'Physics', Icon: Atom, emoji: '⚛️',
    color: 'text-blue-700', bg: 'bg-blue-50',
    gradientFrom: 'from-blue-500', gradientTo: 'to-indigo-600',
    accent: '#2563EB', accentLight: '#EFF6FF',
    chapters: physicsChapters.length, route: '/learn/physics',
    firstChapter: { id: physicsChapters[0].id, name: physicsChapters[0].name },
  },
  {
    key: 'chemistry', label: 'Chemistry', Icon: FlaskConical, emoji: '🧪',
    color: 'text-orange-700', bg: 'bg-orange-50',
    gradientFrom: 'from-orange-500', gradientTo: 'to-rose-600',
    accent: '#EA580C', accentLight: '#FFF7ED',
    chapters: chemistryChapters.length, route: '/learn/chemistry',
    firstChapter: { id: chemistryChapters[0].id, name: chemistryChapters[0].name },
  },
];

// ─── Journey milestones ───────────────────────────────────────────────────────
const JEE_JOURNEY = [
  { id: 'foundation', label: 'Foundation', sublabel: 'Units, Motion, Basic Math' },
  { id: 'mechanics', label: 'Mechanics', sublabel: 'Forces, Energy, Rotation' },
  { id: 'electricity', label: 'Electricity', sublabel: 'Electrostatics, Circuits' },
  { id: 'modern', label: 'Modern Physics', sublabel: 'Optics, Quantum, Nuclear' },
  { id: 'mock', label: 'Mock Tests', sublabel: 'Full-length JEE simulation' },
  { id: 'jee', label: 'JEE', sublabel: '🎯 Your goal' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting(name: string): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 5)  return { text: `Good night, ${name}`, emoji: '🌙' };
  if (h < 12) return { text: `Good morning, ${name}`, emoji: '☀️' };
  if (h < 17) return { text: `Good afternoon, ${name}`, emoji: '👋' };
  return { text: `Good evening, ${name}`, emoji: '🌆' };
}

function getSubjectProgress(subject: string): number {
  try { return Math.min(100, Math.max(0, Number(localStorage.getItem(`progress_${subject}`) || '0'))); }
  catch { return 0; }
}

function getStudyStreak(): number {
  try { return Number(localStorage.getItem('study_streak') || '0'); }
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

function getMissionChapter(subjects: SubjectConfig[], continueLearn: ContinueLearning | null, firstChapterName: string, firstSubject: SubjectConfig) {
  if (continueLearn) {
    return { subject: continueLearn.subjectLabel, chapter: continueLearn.chapterName, route: `/learn/${continueLearn.subject}/${continueLearn.chapterId}` };
  }
  return { subject: firstSubject.label, chapter: firstChapterName, route: `/learn/${firstSubject.key}/${firstSubject.firstChapter.id}` };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentHubPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isNeet, isCuet, examMode } = useExamMode();
  const { studentClass, classLabel } = useClassContext();

  const firstName  = profile?.full_name?.split(' ')[0] || 'Scholar';
  const batchName  = localStorage.getItem('batch_name') || profile?.cohortName || 'Aarambh 2028';
  const examLabel  = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';
  const classStage = localStorage.getItem('academic_stage') || (studentClass && studentClass > 0 ? String(studentClass) : '11');
  const classChip  = classStage === 'dropper' || classStage === '0' ? 'Dropper' : `Class ${classStage}`;

  const subjects      = isNeet ? NEET_SUBJECTS : isCuet ? CUET_SUBJECTS : JEE_SUBJECTS;
  const totalChapters = subjects.reduce((a, s) => a + s.chapters, 0);
  const firstSubject  = subjects[0];
  const firstChapterIdTarget = getFirstChapterId(firstSubject.key, classStage);
  const firstChapterNode     = firstChapterIdTarget ? getChapterById(firstChapterIdTarget) : null;
  const firstChapterName     = firstChapterNode?.name || firstSubject.firstChapter.name;

  const [continueLearn, setContinueLearn] = useState<ContinueLearning | null>(null);
  const [progresses, setProgresses]       = useState<Record<string, number>>({});
  const [streak]                          = useState<number>(getStudyStreak());

  const loadState = () => {
    const p: Record<string, number> = {};
    subjects.forEach(s => { p[s.key] = getSubjectProgress(s.key); });
    setProgresses(p);
    try {
      const raw = localStorage.getItem('last_chapter');
      if (raw) setContinueLearn(JSON.parse(raw));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadState();
    // Re-read state whenever a question is answered or notes are read
    const handler = () => loadState();
    window.addEventListener('prepentrance:activity', handler);
    return () => window.removeEventListener('prepentrance:activity', handler);
  }, []);

  const overallPct = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + (progresses[s.key] ?? 0), 0) / subjects.length)
    : 0;

  const completedChapters = Math.round(totalChapters * overallPct / 100);
  const remainingChapters = totalChapters - completedChapters;

  const mission = getMissionChapter(subjects, continueLearn, firstChapterName, firstSubject);

  // Personalized state
  const isNewStudent     = overallPct === 0 && !continueLearn;
  const isSyllabusAlmost = overallPct >= 85;
  const isCompleted      = overallPct >= 100;

  // Mentor message based on state
  const mentorMessage = useMemo(() => {
    if (isCompleted) return {
      headline: 'Syllabus Complete! 🏆',
      body: `Incredible work, ${firstName}. You've completed your entire syllabus. Now it's time to drill mock tests and perfect your speed & accuracy. The finish line is right there.`,
      highlight: 'Take a Mock Test Now',
    };
    if (isSyllabusAlmost) return {
      headline: `Final stretch, ${firstName}!`,
      body: `You're ${overallPct}% through your syllabus — so close. Students who finish the remaining ${remainingChapters} chapters in the next 2 weeks consistently see a rank jump of 5,000+.`,
      highlight: `${remainingChapters} chapters left`,
    };
    if (isNewStudent) return {
      headline: `Your journey begins today, ${firstName}.`,
      body: `Every IIT topper started exactly where you are. I recommend starting with ${firstSubject.label} · ${firstChapterName}. It's the perfect foundation and unlocks everything else.`,
      highlight: 'First chapter: ' + firstChapterName,
    };
    return {
      headline: continueLearn ? `Continue where you left off.` : `Let's build momentum today.`,
      body: continueLearn
        ? `Yesterday you were studying ${continueLearn.subjectLabel} · ${continueLearn.chapterName}. Completing this chapter today keeps you on track for your exam goal.`
        : `Consistent daily practice is the #1 predictor of JEE rank improvement. Even 45 minutes today compounds into massive results by exam day.`,
      highlight: continueLearn ? `Resume: ${continueLearn.chapterName}` : `Today's focus: ${mission.chapter}`,
    };
  }, [overallPct, isCompleted, isSyllabusAlmost, isNewStudent, firstName, continueLearn, mission]);

  // Journey progress (simplified 0-5 index)
  const journeyStep = Math.floor((overallPct / 100) * (JEE_JOURNEY.length - 1));

  const greeting = getGreeting(firstName);

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
  });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-5 pb-24">

        {/* ══════════════════════════════════════════════════
            HEADER — Greeting + Batch badge
        ══════════════════════════════════════════════════ */}
        <motion.div {...fade(0)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {greeting.text} {greeting.emoji}
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                {isNewStudent ? 'Your preparation starts now.' : isCompleted ? 'Syllabus complete. Now conquer the exam.' : 'Your AI mentor is ready.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{streak} day streak</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isNeet ? 'bg-emerald-500' : isCuet ? 'bg-violet-500' : 'bg-blue-500'
                )} />
                <span className="text-xs font-bold text-slate-700">{examLabel} · {classChip}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            HERO — TODAY'S MISSION CARD
        ══════════════════════════════════════════════════ */}
        <motion.div {...fade(0.07)}>
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%)',
            }}
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
              style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-2xl"
              style={{ background: 'white', transform: 'translate(-20%, 30%)' }} />

            <div className="relative p-7 sm:p-9">
              {/* Label */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Target className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white tracking-wide uppercase">Today's Mission</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-2">
                    {mission.subject} · {mission.chapter}
                  </h2>
                  <p className="text-blue-100 text-sm font-medium mb-6 max-w-md">
                    {isNewStudent
                      ? `Start your ${examLabel} journey here. This chapter is the gateway to everything else.`
                      : `Complete today's mission to stay ahead of your roadmap. Every chapter done is a step closer to your dream.`}
                  </p>

                  {/* Mission stats row */}
                  <div className="flex flex-wrap gap-4 mb-7">
                    {[
                      { icon: Clock,    value: '45 min',   label: 'Est. Time' },
                      { icon: BookOpen, value: '3',        label: 'Concepts' },
                      { icon: PenTool,  value: '20 Qs',    label: 'Practice' },
                      { icon: Target,   value: '75%',      label: 'Target Acc.' },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/15">
                        <Icon className="w-4 h-4 text-blue-200 shrink-0" />
                        <div>
                          <p className="text-white font-bold text-sm leading-none">{value}</p>
                          <p className="text-blue-200 text-xs font-medium mt-0.5">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expected gains */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-200" />
                      <span className="text-blue-100 text-sm font-semibold">+2% Syllabus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-300" />
                      <span className="text-blue-100 text-sm font-semibold">+150 XP</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(mission.route)}
                    className="group flex items-center gap-3 bg-white text-blue-700 font-black text-base px-7 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <Play className="w-5 h-5 fill-current shrink-0" />
                    {isNewStudent ? 'Begin Learning' : continueLearn ? 'Continue Learning' : 'Start Learning'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>

                {/* Overall Progress Ring — right side */}
                <div className="hidden lg:flex flex-col items-center gap-3 shrink-0">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                      <circle cx="56" cy="56" r="48" fill="none" stroke="white" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - overallPct / 100)}`}
                        strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-black text-2xl leading-none">{overallPct}%</span>
                      <span className="text-blue-200 text-xs font-medium mt-0.5">Complete</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{completedChapters}/{totalChapters}</p>
                    <p className="text-blue-200 text-xs font-medium">Chapters done</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            AI MENTOR CARD
        ══════════════════════════════════════════════════ */}
        <motion.div {...fade(0.13)}>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start gap-4">
              {/* Mentor Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Mentor</p>
                  <span className="text-xs text-slate-400 font-medium">· PrepEntrance Intelligence</span>
                </div>
                <h3 className="font-black text-slate-900 text-base leading-snug mb-2">
                  {mentorMessage.headline}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">
                  {mentorMessage.body}
                </p>

                {/* Highlight pill */}
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-700">{mentorMessage.highlight}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/ask-prepentrance')}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask AI
              </button>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            STATS ROW
        ══════════════════════════════════════════════════ */}
        <motion.div {...fade(0.18)}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Syllabus Done',
                value: `${overallPct}%`,
                sub: `${completedChapters} of ${totalChapters} chapters`,
                icon: GraduationCap,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                iconBg: 'bg-blue-100',
              },
              {
                label: 'Questions Solved',
                value: String(Number(localStorage.getItem('total_questions_solved') || 0)),
                sub: 'Total attempts',
                icon: PenTool,
                color: 'text-violet-600',
                bg: 'bg-violet-50',
                iconBg: 'bg-violet-100',
              },
              {
                label: 'Avg. Accuracy',
                value: `${Number(localStorage.getItem('avg_accuracy') || 0).toFixed(0)}%`,
                sub: 'Across all practice',
                icon: Target,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                iconBg: 'bg-emerald-100',
              },
              {
                label: 'Current Streak',
                value: `${streak}d`,
                sub: streak > 0 ? 'Keep it going! 🔥' : 'Start today',
                icon: Flame,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                iconBg: 'bg-orange-100',
              },
            ].map(({ label, value, sub, icon: Icon, color, bg, iconBg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', iconBg)}>
                  <Icon className={cn('w-4.5 h-4.5', color)} style={{ width: 18, height: 18 }} />
                </div>
                <p className="text-2xl font-black text-slate-900 leading-none">{value || '—'}</p>
                <p className="text-xs font-bold text-slate-700 mt-1">{label}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            SUBJECTS — Premium Learning Cards
        ══════════════════════════════════════════════════ */}
        <motion.div {...fade(0.24)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900">Your Subjects</h2>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{subjects.length} Subjects</span>
          </div>

          <div className={cn(
            'grid gap-4',
            subjects.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
          )}>
            {subjects.map((subject, i) => {
              const progress = progresses[subject.key] ?? 0;
              const SubIcon  = subject.Icon;
              const chapsDone = Math.round(subject.chapters * progress / 100);
              const currentChapter = continueLearn?.subject === subject.key
                ? continueLearn.chapterName
                : subject.firstChapter.name;

              return (
                <motion.button
                  key={subject.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.27 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => navigate(subject.route)}
                  className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                >
                  {/* Gradient accent top strip */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${subject.gradientFrom} ${subject.gradientTo} rounded-t-3xl`}
                  />

                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${subject.accent}22, ${subject.accent}44)`, border: `1px solid ${subject.accent}33` }}
                    >
                      <SubIcon className="w-6 h-6" style={{ color: subject.accent }} />
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                      style={{ background: subject.accentLight, color: subject.accent }}
                    >
                      {progress > 0 ? `${progress}% done` : 'Not started'}
                    </div>
                  </div>

                  {/* Subject name */}
                  <div className="mb-1">
                    <h3 className="text-lg font-black text-slate-900">{subject.emoji} {subject.label}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{subject.chapters} chapters · {chapsDone} complete</p>
                  </div>

                  {/* Current chapter */}
                  <div className="mt-3 mb-4 py-2.5 px-3 rounded-xl" style={{ background: subject.accentLight }}>
                    <p className="text-xs font-semibold" style={{ color: subject.accent }}>
                      {progress > 0 ? 'Current Chapter' : 'Start with'}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 leading-tight truncate">{currentChapter}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(progress > 0 ? 3 : 0, progress)}%`, background: `linear-gradient(90deg, ${subject.accent}, ${subject.accent}cc)` }}
                      />
                    </div>
                  </div>

                  {/* Continue CTA */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400 font-medium">{subject.chapters - chapsDone} chapters remaining</span>
                    <div
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all group-hover:gap-2.5"
                      style={{ color: subject.accent }}
                    >
                      Continue
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            2-COLUMN BOTTOM SECTION: Journey + Quick Access
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* ── Journey Roadmap ── */}
          <motion.div {...fade(0.33)}>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Your Journey</h2>
              </div>

              <div className="relative">
                {JEE_JOURNEY.map((step, i) => {
                  const isCompleted  = i < journeyStep;
                  const isCurrent    = i === journeyStep;
                  const isFuture     = i > journeyStep;
                  const isLast       = i === JEE_JOURNEY.length - 1;

                  return (
                    <div key={step.id} className="flex items-start gap-3 relative">
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className="absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2"
                          style={{
                            background: isCompleted
                              ? 'linear-gradient(to bottom, #2563EB, #2563EB)'
                              : 'linear-gradient(to bottom, #E2E8F0, #E2E8F0)',
                            height: '32px'
                          }}
                        />
                      )}

                      {/* Node */}
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all',
                        isCompleted ? 'bg-blue-600 shadow-md shadow-blue-200' : isCurrent ? 'bg-white border-2 border-blue-600 shadow-md shadow-blue-100' : 'bg-white border-2 border-slate-200'
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white fill-current" />
                        ) : isCurrent ? (
                          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                        ) : isLast ? (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-300" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn('pb-6 flex-1', isLast && 'pb-0')}>
                        <p className={cn(
                          'text-sm font-bold leading-none',
                          isCompleted ? 'text-blue-600' : isCurrent ? 'text-slate-900' : 'text-slate-400'
                        )}>
                          {step.label}
                          {isCurrent && <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">You are here</span>}
                        </p>
                        <p className={cn(
                          'text-xs font-medium mt-0.5',
                          isCurrent ? 'text-slate-500' : 'text-slate-400'
                        )}>
                          {step.sublabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Quick Access + Daily Goal ── */}
          <div className="space-y-4">
            {/* Daily Goal */}
            <motion.div {...fade(0.36)}>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Today's Goal</h2>
                </div>

                <div className="space-y-2.5 mb-4">
                  {[
                    { text: `Complete ${mission.chapter}`, done: false },
                    { text: 'Solve 20 Practice Questions', done: false },
                    { text: 'Achieve 70%+ Accuracy', done: false },
                  ].map(({ text, done }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <div className={cn(
                        'w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        done ? 'bg-emerald-500 border-emerald-500' : 'border-amber-400 bg-white'
                      )} style={{ width: 18, height: 18 }}>
                        {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={cn('text-sm font-semibold', done ? 'text-slate-400 line-through' : 'text-slate-700')}>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    <span className="text-xs font-bold text-amber-800">+150 XP</span>
                  </div>
                  <div className="w-px h-4 bg-amber-300" />
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-amber-800">+Roadmap Progress</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div {...fade(0.39)}>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">Quick Access</h2>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Practice',    Icon: PenTool,        route: '/practice',         color: 'text-violet-600', bg: 'bg-violet-50', iconBg: 'bg-violet-100' },
                    { label: 'Mock Test',   Icon: ClipboardCheck, route: '/test',             color: 'text-orange-600', bg: 'bg-orange-50', iconBg: 'bg-orange-100' },
                    { label: 'Revision',    Icon: RotateCcw,      route: '/revision',         color: 'text-teal-600',   bg: 'bg-teal-50',   iconBg: 'bg-teal-100' },
                    { label: 'AI Mentor',   Icon: Brain,          route: '/ask-prepentrance', color: 'text-indigo-600', bg: 'bg-indigo-50', iconBg: 'bg-indigo-100' },
                    { label: 'Analytics',  Icon: BarChart3,      route: '/analytics',        color: 'text-slate-600',  bg: 'bg-slate-50',  iconBg: 'bg-slate-100' },
                    { label: 'Progress',   Icon: Zap,            route: '/analytics',        color: 'text-blue-600',   bg: 'bg-blue-50',   iconBg: 'bg-blue-100' },
                  ].map(({ label, Icon, route, color, iconBg }) => (
                    <button
                      key={label}
                      onClick={() => navigate(route)}
                      className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105', iconBg)}>
                        <Icon className={cn('w-5 h-5', color)} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            PROGRESS EMOTIONAL CARD (bottom)
        ══════════════════════════════════════════════════ */}
        <motion.div {...fade(0.44)}>
          <div
            className="rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)', border: '1px solid #e0e8ff' }}
          >
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Your Progress</p>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {isCompleted
                  ? '🎉 Syllabus complete!'
                  : isSyllabusAlmost
                  ? `Almost there! ${remainingChapters} chapters to go.`
                  : `${remainingChapters} chapters stand between you and your dream college.`}
              </h3>
              <p className="text-slate-500 text-sm font-medium mt-1.5">
                {isCompleted
                  ? 'You\'ve completed all chapters. Now dominate the mock tests.'
                  : `You have completed ${completedChapters} of ${totalChapters} chapters. Every chapter completed is a rank gained.`}
              </p>
            </div>
            <button
              onClick={() => navigate(mission.route)}
              className="shrink-0 flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
            >
              {isCompleted ? 'Take Mock Test' : 'Continue →'}
            </button>
          </div>
        </motion.div>

      </div>
    </MainLayout>
  );
}
