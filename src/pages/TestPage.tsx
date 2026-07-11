import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import {
  Search, Atom, FlaskConical, Calculator,
  ChevronRight, ArrowRight, Play, Trophy,
  Flame, Brain, BookOpen, CheckCircle2, Lock,
  Clock, Target, TrendingUp, Zap, Star,
  AlignLeft, LayoutGrid, BarChart3, Layers,
  RotateCcw, Filter, SortAsc, Sparkles,
  AlertTriangle, ChevronDown, ChevronUp,
  FileText, ClipboardList, RefreshCw, Award,
  Activity, Shield, Swords
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useAuth } from '@/contexts/AuthContext';
import ChapterTestDialog from '@/components/test/ChapterTestDialog';
import MixedTestDialog from '@/components/test/MixedTestDialog';
import PYQTestDialog from '@/components/test/PYQTestDialog';
import TestExecution from '@/components/test/TestExecution';
import { ChapterSelection } from '@/hooks/useTestQuestions';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ExecutableTestType = 'chapter' | 'mixed' | 'pyq' | 'adaptive';

interface TestConfig {
  type: ExecutableTestType;
  chapters?: ChapterSelection[];
  subject?: string;
  yearRange?: { start: number; end: number };
  questionCount?: number;
  timeLimitSeconds?: number;
}

interface ChapterData {
  id: string;
  name: string;
  emoji: string;
  mastery: number;
  questionsSolved: number;
  questionsTotal: number;
  pyqsCount: number;
  testsAttempted: number;
  lastScore: number | null;
  lastAttempt: string;
  status: 'strong' | 'average' | 'weak';
  difficulty: 'easy' | 'medium' | 'hard';
  keywords: string[];
}

type SubjectKey = 'physics' | 'chemistry' | 'mathematics';

// ─── Subject colours ───────────────────────────────────────────────────────────

const SUBJECT_META: Record<SubjectKey, {
  label: string; Icon: React.FC<{ className?: string }>;
  color: string; bg: string; border: string; accent: string; dotColor: string;
}> = {
  physics: {
    label: 'Physics',
    Icon: Atom,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    accent: '#2563EB',
    dotColor: 'bg-blue-500',
  },
  chemistry: {
    label: 'Chemistry',
    Icon: FlaskConical,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: '#059669',
    dotColor: 'bg-emerald-500',
  },
  mathematics: {
    label: 'Mathematics',
    Icon: Calculator,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    accent: '#7C3AED',
    dotColor: 'bg-violet-500',
  },
};

// ─── Chapter Data ──────────────────────────────────────────────────────────────

const PHYSICS_CHAPTERS: ChapterData[] = [
  { id: 'ph-units', name: 'Units & Dimensions', emoji: '📐', mastery: 92, questionsSolved: 45, questionsTotal: 50, pyqsCount: 36, testsAttempted: 3, lastScore: 92, lastAttempt: '2 days ago', status: 'strong', difficulty: 'easy', keywords: ['dimensional analysis', 'significant figures'] },
  { id: 'ph-kin1d', name: 'Motion in One Dimension', emoji: '📈', mastery: 74, questionsSolved: 32, questionsTotal: 50, pyqsCount: 30, testsAttempted: 2, lastScore: 74, lastAttempt: '3 days ago', status: 'average', difficulty: 'easy', keywords: ['velocity', 'acceleration'] },
  { id: 'ph-proj', name: 'Projectile Motion', emoji: '⚽', mastery: 80, questionsSolved: 28, questionsTotal: 50, pyqsCount: 30, testsAttempted: 2, lastScore: 80, lastAttempt: '4 days ago', status: 'strong', difficulty: 'medium', keywords: ['range', 'trajectory'] },
  { id: 'ph-nlm', name: "Laws of Motion (NLM)", emoji: '📦', mastery: 63, questionsSolved: 38, questionsTotal: 75, pyqsCount: 45, testsAttempted: 2, lastScore: 63, lastAttempt: '5 days ago', status: 'average', difficulty: 'medium', keywords: ['friction', 'tension'] },
  { id: 'ph-wep', name: 'Work, Power & Energy', emoji: '⚡', mastery: 61, questionsSolved: 24, questionsTotal: 50, pyqsCount: 30, testsAttempted: 2, lastScore: 61, lastAttempt: '1 week ago', status: 'average', difficulty: 'medium', keywords: ['kinetic energy', 'work theorem'] },
  { id: 'ph-com', name: 'Center of Mass & Collisions', emoji: '💥', mastery: 52, questionsSolved: 19, questionsTotal: 50, pyqsCount: 24, testsAttempted: 1, lastScore: 52, lastAttempt: '2 weeks ago', status: 'average', difficulty: 'hard', keywords: ['momentum', 'coefficient of restitution'] },
  { id: 'ph-rot', name: 'Rotational Motion', emoji: '🌀', mastery: 29, questionsSolved: 12, questionsTotal: 60, pyqsCount: 48, testsAttempted: 1, lastScore: 29, lastAttempt: '1 day ago', status: 'weak', difficulty: 'hard', keywords: ['moment of inertia', 'torque'] },
  { id: 'ph-grav', name: 'Gravitation', emoji: '🪐', mastery: 85, questionsSolved: 40, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 85, lastAttempt: '2 days ago', status: 'strong', difficulty: 'easy', keywords: ["Kepler's laws", 'escape velocity'] },
  { id: 'ph-thermo', name: 'Thermodynamics', emoji: '🔥', mastery: 41, questionsSolved: 18, questionsTotal: 50, pyqsCount: 36, testsAttempted: 1, lastScore: 41, lastAttempt: '2 days ago', status: 'weak', difficulty: 'medium', keywords: ['Carnot engine', 'entropy'] },
  { id: 'ph-shm', name: 'Simple Harmonic Motion', emoji: '⏱️', mastery: 44, questionsSolved: 20, questionsTotal: 50, pyqsCount: 30, testsAttempted: 1, lastScore: 44, lastAttempt: '3 days ago', status: 'weak', difficulty: 'medium', keywords: ['restoring force', 'spring-block'] },
  { id: 'ph-estatic', name: 'Electrostatics', emoji: '⚡', mastery: 43, questionsSolved: 16, questionsTotal: 60, pyqsCount: 45, testsAttempted: 1, lastScore: 43, lastAttempt: '1 week ago', status: 'weak', difficulty: 'hard', keywords: ["Coulomb's law", "Gauss's law"] },
  { id: 'ph-cap', name: 'Capacitors', emoji: '🔋', mastery: 66, questionsSolved: 23, questionsTotal: 50, pyqsCount: 36, testsAttempted: 2, lastScore: 66, lastAttempt: '5 days ago', status: 'average', difficulty: 'medium', keywords: ['capacitance', 'RC circuit'] },
  { id: 'ph-cur', name: 'Current Electricity', emoji: '🔌', mastery: 78, questionsSolved: 39, questionsTotal: 60, pyqsCount: 42, testsAttempted: 3, lastScore: 78, lastAttempt: '3 days ago', status: 'strong', difficulty: 'medium', keywords: ["Kirchhoff's laws", 'Wheatstone bridge'] },
  { id: 'ph-mag', name: 'Magnetic Effects of Current', emoji: '🧲', mastery: 53, questionsSolved: 21, questionsTotal: 50, pyqsCount: 36, testsAttempted: 1, lastScore: 53, lastAttempt: '1 week ago', status: 'average', difficulty: 'hard', keywords: ['Biot-Savart', 'Lorentz force'] },
  { id: 'ph-emi', name: 'Electromagnetic Induction', emoji: '🔄', mastery: 60, questionsSolved: 24, questionsTotal: 50, pyqsCount: 30, testsAttempted: 2, lastScore: 60, lastAttempt: '2 weeks ago', status: 'average', difficulty: 'medium', keywords: ["Faraday's law", 'self inductance'] },
  { id: 'ph-optics', name: 'Ray Optics & Instruments', emoji: '🔍', mastery: 68, questionsSolved: 27, questionsTotal: 50, pyqsCount: 42, testsAttempted: 2, lastScore: 68, lastAttempt: '6 days ago', status: 'average', difficulty: 'hard', keywords: ["Snell's law", 'TIR'] },
  { id: 'ph-modern', name: 'Modern Physics', emoji: '⚛️', mastery: 76, questionsSolved: 38, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 76, lastAttempt: '4 days ago', status: 'strong', difficulty: 'easy', keywords: ['photoelectric effect', 'radioactivity'] },
  { id: 'ph-semi', name: 'Semiconductor Electronics', emoji: '💾', mastery: 88, questionsSolved: 44, questionsTotal: 50, pyqsCount: 36, testsAttempted: 3, lastScore: 88, lastAttempt: '2 days ago', status: 'strong', difficulty: 'easy', keywords: ['PN junction', 'transistor'] },
];

const CHEMISTRY_CHAPTERS: ChapterData[] = [
  { id: 'ch-mole', name: 'Mole Concept & Stoichiometry', emoji: '🧪', mastery: 90, questionsSolved: 40, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 90, lastAttempt: '3 days ago', status: 'strong', difficulty: 'medium', keywords: ['stoichiometry', 'molarity'] },
  { id: 'ch-atom', name: 'Structure of Atom', emoji: '⚛️', mastery: 78, questionsSolved: 31, questionsTotal: 50, pyqsCount: 36, testsAttempted: 2, lastScore: 78, lastAttempt: '5 days ago', status: 'strong', difficulty: 'medium', keywords: ['Bohr model', 'quantum numbers'] },
  { id: 'ch-bond', name: 'Chemical Bonding', emoji: '🤝', mastery: 65, questionsSolved: 26, questionsTotal: 50, pyqsCount: 36, testsAttempted: 2, lastScore: 65, lastAttempt: '1 week ago', status: 'average', difficulty: 'hard', keywords: ['hybridization', 'VSEPR'] },
  { id: 'ch-thermo', name: 'Chemical Thermodynamics', emoji: '🔥', mastery: 35, questionsSolved: 14, questionsTotal: 50, pyqsCount: 30, testsAttempted: 1, lastScore: 35, lastAttempt: '1 day ago', status: 'weak', difficulty: 'hard', keywords: ['entropy', 'Gibbs free energy'] },
  { id: 'ch-equil', name: 'Chemical & Ionic Equilibrium', emoji: '⚖️', mastery: 58, questionsSolved: 20, questionsTotal: 50, pyqsCount: 36, testsAttempted: 1, lastScore: 58, lastAttempt: '2 weeks ago', status: 'average', difficulty: 'hard', keywords: ['pH', 'buffer solution'] },
  { id: 'ch-electro', name: 'Electrochemistry', emoji: '🔋', mastery: 72, questionsSolved: 33, questionsTotal: 50, pyqsCount: 36, testsAttempted: 2, lastScore: 72, lastAttempt: '5 days ago', status: 'average', difficulty: 'hard', keywords: ['Nernst equation', 'electrolysis'] },
  { id: 'ch-kinetic', name: 'Chemical Kinetics', emoji: '⏱️', mastery: 80, questionsSolved: 38, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 80, lastAttempt: '2 days ago', status: 'strong', difficulty: 'medium', keywords: ['rate law', 'Arrhenius'] },
  { id: 'ch-periodic', name: 'Periodic Table & Periodicity', emoji: '📅', mastery: 85, questionsSolved: 42, questionsTotal: 50, pyqsCount: 36, testsAttempted: 3, lastScore: 85, lastAttempt: '3 days ago', status: 'strong', difficulty: 'easy', keywords: ['ionization energy', 'atomic radius'] },
  { id: 'ch-pblock', name: 'p-Block Elements', emoji: '🧱', mastery: 50, questionsSolved: 15, questionsTotal: 50, pyqsCount: 30, testsAttempted: 1, lastScore: 50, lastAttempt: '2 weeks ago', status: 'average', difficulty: 'hard', keywords: ['allotropes', 'halogens'] },
  { id: 'ch-goc', name: 'General Organic Chemistry', emoji: '🧬', mastery: 83, questionsSolved: 40, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 83, lastAttempt: '4 days ago', status: 'strong', difficulty: 'hard', keywords: ['resonance', 'hyperconjugation'] },
  { id: 'ch-carbo', name: 'Aldehydes, Ketones & Acids', emoji: '🍭', mastery: 48, questionsSolved: 16, questionsTotal: 50, pyqsCount: 30, testsAttempted: 1, lastScore: 48, lastAttempt: '1 day ago', status: 'weak', difficulty: 'hard', keywords: ['aldol condensation', 'Cannizzaro'] },
  { id: 'ch-biomol', name: 'Biomolecules & Polymers', emoji: '🍎', mastery: 91, questionsSolved: 44, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 91, lastAttempt: '2 days ago', status: 'strong', difficulty: 'easy', keywords: ['amino acids', 'polymers'] },
];

const MATHEMATICS_CHAPTERS: ChapterData[] = [
  { id: 'ma-sets', name: 'Sets, Relations & Functions', emoji: '🔢', mastery: 29, questionsSolved: 10, questionsTotal: 50, pyqsCount: 30, testsAttempted: 1, lastScore: 29, lastAttempt: '1 day ago', status: 'weak', difficulty: 'medium', keywords: ['domain', 'range'] },
  { id: 'ma-trig', name: 'Trigonometry', emoji: '📐', mastery: 72, questionsSolved: 35, questionsTotal: 50, pyqsCount: 36, testsAttempted: 2, lastScore: 72, lastAttempt: '4 days ago', status: 'average', difficulty: 'medium', keywords: ['identities', 'inverse trig'] },
  { id: 'ma-cplx', name: 'Complex Numbers', emoji: '🌀', mastery: 61, questionsSolved: 28, questionsTotal: 50, pyqsCount: 30, testsAttempted: 2, lastScore: 61, lastAttempt: '1 week ago', status: 'average', difficulty: 'medium', keywords: ['Argand plane', 'De Moivre'] },
  { id: 'ma-quad', name: 'Quadratic Equations', emoji: '📊', mastery: 84, questionsSolved: 42, questionsTotal: 50, pyqsCount: 36, testsAttempted: 3, lastScore: 84, lastAttempt: '3 days ago', status: 'strong', difficulty: 'easy', keywords: ['discriminant', 'Vieta formulas'] },
  { id: 'ma-seq', name: 'Sequences & Series', emoji: '🔗', mastery: 76, questionsSolved: 38, questionsTotal: 50, pyqsCount: 36, testsAttempted: 3, lastScore: 76, lastAttempt: '5 days ago', status: 'strong', difficulty: 'medium', keywords: ['AP', 'GP', 'HP'] },
  { id: 'ma-perm', name: 'Permutations & Combinations', emoji: '🎲', mastery: 55, questionsSolved: 22, questionsTotal: 50, pyqsCount: 30, testsAttempted: 1, lastScore: 55, lastAttempt: '1 week ago', status: 'average', difficulty: 'medium', keywords: ['factorial', 'arrangement'] },
  { id: 'ma-binom', name: 'Binomial Theorem', emoji: '🔬', mastery: 67, questionsSolved: 30, questionsTotal: 50, pyqsCount: 30, testsAttempted: 2, lastScore: 67, lastAttempt: '6 days ago', status: 'average', difficulty: 'medium', keywords: ['coefficients', 'middle term'] },
  { id: 'ma-mat', name: 'Matrices & Determinants', emoji: '🗃️', mastery: 79, questionsSolved: 39, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 79, lastAttempt: '3 days ago', status: 'strong', difficulty: 'medium', keywords: ['rank', 'inverse'] },
  { id: 'ma-coor', name: 'Coordinate Geometry', emoji: '📍', mastery: 70, questionsSolved: 34, questionsTotal: 50, pyqsCount: 42, testsAttempted: 2, lastScore: 70, lastAttempt: '4 days ago', status: 'average', difficulty: 'hard', keywords: ['conic sections', 'locus'] },
  { id: 'ma-calc', name: 'Limits, Continuity & Derivatives', emoji: '∫', mastery: 45, questionsSolved: 18, questionsTotal: 60, pyqsCount: 45, testsAttempted: 1, lastScore: 45, lastAttempt: '2 days ago', status: 'weak', difficulty: 'hard', keywords: ['L\'Hôpital', 'chain rule'] },
  { id: 'ma-integ', name: 'Integration & Area', emoji: '📐', mastery: 38, questionsSolved: 15, questionsTotal: 60, pyqsCount: 45, testsAttempted: 1, lastScore: 38, lastAttempt: '1 day ago', status: 'weak', difficulty: 'hard', keywords: ['by parts', 'definite integral'] },
  { id: 'ma-prob', name: 'Probability', emoji: '🎯', mastery: 88, questionsSolved: 44, questionsTotal: 50, pyqsCount: 42, testsAttempted: 3, lastScore: 88, lastAttempt: '2 days ago', status: 'strong', difficulty: 'medium', keywords: ['Bayes theorem', 'conditional'] },
];

// MOCK MAPPING MOVED INSIDE COMPONENT FOR DYNAMIC UPDATES

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Circular mastery ring — Apple Fitness-inspired */
const MasteryRing: React.FC<{ value: number; size?: number; strokeWidth?: number }> = ({
  value, size = 52, strokeWidth = 4,
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[11px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
};

/** Stat metric card */
const MetricCard: React.FC<{
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; bg: string; border: string;
}> = ({ label, value, sub, icon, color, bg, border }) => (
  <div className={cn('bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3', border)}>
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-caption text-slate-400 font-medium truncate">{label}</p>
      <p className={cn('text-title-md font-bold leading-none mt-0.5', color)}>{value}</p>
      {sub && <p className="text-caption text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/** Difficulty badge */
const DifficultyBadge: React.FC<{ level: 'easy' | 'medium' | 'hard' }> = ({ level }) => {
  const styles = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    hard: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider', styles[level])}>
      {level}
    </span>
  );
};

/** Status dot */
const StatusDot: React.FC<{ status: 'strong' | 'average' | 'weak' }> = ({ status }) => {
  const color = { strong: 'bg-emerald-500', average: 'bg-amber-400', weak: 'bg-red-500' }[status];
  return <span className={cn('inline-block w-2 h-2 rounded-full', color)} />;
};

// ─── TEST TYPES DATA ──────────────────────────────────────────────────────────

const TEST_TYPES = [
  {
    id: 'chapter',
    label: 'Chapter Tests',
    icon: BookOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    description: 'Deep-dive into one chapter at a time. Ideal for targeted mastery.',
    questions: '25–45 Qs',
    duration: '45–60 min',
    progress: 68,
  },
  {
    id: 'part',
    label: 'Part Tests',
    icon: Layers,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    description: 'Multi-chapter tests covering a broad topic segment.',
    questions: '50–75 Qs',
    duration: '90 min',
    progress: 42,
  },
  {
    id: 'revision',
    label: 'Revision Tests',
    icon: RotateCcw,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    description: 'Quick 15-question reinforcement tests for previously attempted chapters.',
    questions: '15–20 Qs',
    duration: '20–30 min',
    progress: 55,
  },
  {
    id: 'mock',
    label: 'Full Syllabus Mocks',
    icon: Swords,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    description: 'Complete JEE-pattern paper with Physics + Chemistry + Mathematics.',
    questions: '90 Qs',
    duration: '180 min',
    progress: 20,
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isNeet, isCuet } = useExamMode();
  const { profile } = useAuth();

  const [activeSubject, setActiveSubject] = useState<SubjectKey>('physics');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'strong' | 'average' | 'weak'>('all');
  const [demoRefreshCounter, setDemoRefreshCounter] = useState(0);

  const ALL_CHAPTERS = useMemo(() => {
    let demoStats: Record<string, any> = {};
    try {
      const raw = localStorage.getItem('demo_chapter_stats');
      if (raw) demoStats = JSON.parse(raw);
    } catch (e) {}

    const applyStats = (chapters: ChapterData[]): ChapterData[] => chapters.map(ch => {
      const s = demoStats[ch.id];
      if (s) {
        return {
          ...ch,
          mastery: s.mastery || 0,
          questionsSolved: s.questionsSolved || 0,
          pyqsCount: ch.pyqsCount,
          testsAttempted: s.testsAttempted || 0,
          lastScore: s.lastScore || 0,
          lastAttempt: 'Just now',
          status: s.mastery >= 70 ? 'strong' : s.mastery >= 50 ? 'average' : 'weak',
        };
      }
      return {
        ...ch,
        mastery: 0,
        questionsSolved: 0,
        pyqsCount: 0,
        testsAttempted: 0,
        lastScore: null,
        lastAttempt: 'Not attempted',
        status: 'average',
      };
    });

    return {
      physics: applyStats(PHYSICS_CHAPTERS),
      chemistry: applyStats(CHEMISTRY_CHAPTERS),
      mathematics: applyStats(MATHEMATICS_CHAPTERS),
    } as Record<SubjectKey, ChapterData[]>;
  }, [demoRefreshCounter]);

  // Dialog states
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showMixedSelect, setShowMixedSelect] = useState(false);
  const [showPYQSelect, setShowPYQSelect] = useState(false);
  const [activeTest, setActiveTest] = useState<TestConfig | null>(null);

  const subjectKeys = Object.keys(ALL_CHAPTERS) as SubjectKey[];

  // Aggregate subject stats
  const subjectStats = useMemo(() =>
    subjectKeys.map(key => {
      const chapters = ALL_CHAPTERS[key];
      const totalQ = chapters.reduce((a, c) => a + c.questionsSolved, 0);
      const totalMaxQ = chapters.reduce((a, c) => a + c.questionsTotal, 0);
      const avgMastery = Math.round(chapters.reduce((a, c) => a + c.mastery, 0) / chapters.length);
      const completed = chapters.filter(c => c.mastery >= 70).length;
      return { key, avgMastery, completed, total: chapters.length, totalQ, totalMaxQ };
    }), []);

  // Overall stats
  const allChapters = useMemo(() => Object.values(ALL_CHAPTERS).flat(), []);
  const overallStats = useMemo(() => {
    const avgMastery = Math.round(allChapters.reduce((a, c) => a + c.mastery, 0) / allChapters.length);
    const testsAttempted = allChapters.reduce((a, c) => a + c.testsAttempted, 0);
    const strong = allChapters.filter(c => c.status === 'strong').length;
    const weak = allChapters.filter(c => c.status === 'weak').length;
    return { avgMastery, testsAttempted, strong, weak, total: allChapters.length };
  }, [allChapters]);

  // Active chapters
  const activeChapters = useMemo(() => {
    let list = ALL_CHAPTERS[activeSubject];
    if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.keywords.some(k => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeSubject, searchQuery, filterStatus]);

  const weakChapters = useMemo(() =>
    allChapters.filter(c => c.mastery > 0 && c.mastery < 50).slice(0, 3), [allChapters]);
  const strongChapters = useMemo(() =>
    allChapters.filter(c => c.mastery >= 70).slice(0, 3), [allChapters]);

  // Last attempted chapter
  const lastAttempted = useMemo(() =>
    [...allChapters].filter(c => c.testsAttempted > 0).sort((a, b) => b.testsAttempted - a.testsAttempted).slice(0, 3), [allChapters]);

  const handleStartTest = useCallback((chapter: ChapterData) => {
    setActiveTest({
      type: 'chapter',
      chapters: [{ chapterId: chapter.id, chapterName: chapter.name, subject: activeSubject }],
      subject: activeSubject,
      questionCount: 25,
      timeLimitSeconds: 2700,
    });
  }, [activeSubject]);

  if (activeTest) {
    return (
      <TestExecution
        config={activeTest}
        onComplete={() => { setActiveTest(null); setDemoRefreshCounter(c => c + 1); toast.success('Test completed!'); }}
        onExit={() => { setActiveTest(null); setDemoRefreshCounter(c => c + 1); }}
      />
    );
  }

  return (
    <MainLayout>
      {/* Dialogs */}
      {showChapterSelect && (
        <ChapterTestDialog
          isOpen={showChapterSelect}
          onClose={() => setShowChapterSelect(false)}
          onStart={(config) => { setShowChapterSelect(false); setActiveTest(config); }}
        />
      )}
      {showMixedSelect && (
        <MixedTestDialog
          isOpen={showMixedSelect}
          onClose={() => setShowMixedSelect(false)}
          onStart={(config) => { setShowMixedSelect(false); setActiveTest(config); }}
        />
      )}
      {showPYQSelect && (
        <PYQTestDialog
          isOpen={showPYQSelect}
          onClose={() => setShowPYQSelect(false)}
          onStart={(config) => { setShowPYQSelect(false); setActiveTest(config); }}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6 pb-20">

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — PAGE HEADER
        ══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Left: Title */}
            <div>
              <h1 className="text-heading-lg font-bold text-slate-900">Tests</h1>
              <p className="text-body-sm text-slate-500 font-medium mt-1">
                Chapter-wise assessments to measure your preparation
              </p>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-body-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 shadow-sm w-52 transition-all"
                />
              </div>

              {/* Quick-start buttons */}
              <button
                onClick={() => setShowMixedSelect(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-body-sm font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:-translate-y-px transition-all duration-150"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Mixed Test</span>
              </button>
              <button
                onClick={() => setShowPYQSelect(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-body-sm font-bold rounded-xl shadow-sm hover:border-blue-300 hover:text-blue-700 hover:-translate-y-px transition-all duration-150"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">PYQ Test</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — OVERVIEW METRIC CARDS
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.07 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <MetricCard
            label="Total Chapters"
            value={overallStats.total}
            sub={`${overallStats.strong} mastered`}
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            color="text-slate-900"
            bg="bg-blue-50"
            border="border-blue-100"
          />
          <MetricCard
            label="Tests Attempted"
            value={overallStats.testsAttempted}
            sub="across all subjects"
            icon={<ClipboardList className="w-5 h-5 text-violet-600" />}
            color="text-slate-900"
            bg="bg-violet-50"
            border="border-violet-100"
          />
          <MetricCard
            label="Avg. Mastery"
            value={`${overallStats.avgMastery}%`}
            sub={overallStats.avgMastery >= 70 ? 'On Track 🎯' : 'Needs Work'}
            icon={<Target className="w-5 h-5 text-emerald-600" />}
            color={overallStats.avgMastery >= 70 ? 'text-emerald-600' : 'text-amber-600'}
            bg="bg-emerald-50"
            border="border-emerald-100"
          />
          <MetricCard
            label="Weak Chapters"
            value={overallStats.weak}
            sub="need attention"
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
            color="text-red-500"
            bg="bg-red-50"
            border="border-red-100"
          />
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — SUBJECT NAVIGATION TABS
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }}
          className="grid grid-cols-3 gap-3"
        >
          {subjectKeys.map(key => {
            const meta = SUBJECT_META[key];
            const stats = subjectStats.find(s => s.key === key)!;
            const SubIcon = meta.Icon;
            const isActive = activeSubject === key;
            return (
              <button
                key={key}
                onClick={() => { setActiveSubject(key); setExpandedId(null); setFilterStatus('all'); }}
                className={cn(
                  'relative rounded-2xl p-4 border text-left transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20 text-white'
                    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
                )}
              >
                {/* Icon + label */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center border shrink-0',
                    isActive ? 'bg-white/20 border-white/30' : cn(meta.bg, meta.border)
                  )}>
                    <SubIcon className={cn('w-4 h-4', isActive ? 'text-white' : meta.color)} />
                  </div>
                  <span className={cn('text-body-sm font-bold', isActive ? 'text-white' : 'text-slate-800')}>
                    {meta.label}
                  </span>
                </div>

                {/* Stats */}
                <div className={cn('text-caption font-medium', isActive ? 'text-blue-100' : 'text-slate-500')}>
                  {stats.completed}/{stats.total} chapters done
                </div>

                {/* Progress bar */}
                <div className={cn('mt-2.5 h-1.5 rounded-full overflow-hidden', isActive ? 'bg-white/20' : 'bg-slate-100')}>
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', isActive ? 'bg-white' : '')}
                    style={{
                      width: `${stats.avgMastery}%`,
                      background: isActive ? undefined : meta.accent,
                    }}
                  />
                </div>
                <div className={cn('text-caption font-bold mt-1', isActive ? 'text-white' : 'text-slate-600')}>
                  {stats.avgMastery}% avg mastery
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — INTELLIGENCE WIDGETS (3 columns)
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.17 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {/* Resume Last Test */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Play className="w-4 h-4 text-blue-600" />
              <span className="text-body-sm font-bold text-slate-800">Recently Attempted</span>
            </div>
            <div className="space-y-2">
              {lastAttempted.length > 0 ? (
                lastAttempted.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => handleStartTest(ch)}
                    className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{ch.emoji}</span>
                      <span className="text-caption font-semibold text-slate-700 truncate">{ch.name}</span>
                    </div>
                    <span className="text-caption font-bold text-blue-600 shrink-0 group-hover:underline">Resume</span>
                  </button>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-caption font-medium border-2 border-dashed border-slate-100 rounded-xl">
                  Take your first test to see history
                </div>
              )}
            </div>
          </div>

          {/* Weak Chapters */}
          <div className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-body-sm font-bold text-slate-800">Weak Chapters</span>
            </div>
            <div className="space-y-2">
              {weakChapters.length > 0 ? (
                weakChapters.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => { setActiveSubject(Object.keys(ALL_CHAPTERS).find(s => ALL_CHAPTERS[s as SubjectKey].some(c => c.id === ch.id)) as SubjectKey); handleStartTest(ch); }}
                    className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-red-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{ch.emoji}</span>
                      <span className="text-caption font-semibold text-slate-700 truncate">{ch.name}</span>
                    </div>
                    <span className="text-caption font-bold text-red-500 shrink-0">{ch.mastery}%</span>
                  </button>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-caption font-medium border-2 border-dashed border-red-50 rounded-xl">
                  No weak areas identified yet
                </div>
              )}
            </div>
          </div>

          {/* AI Recommended */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-body-sm font-bold text-slate-800">AI Recommended</span>
            </div>
            <div className="space-y-2">
              {weakChapters.length > 0 ? (
                weakChapters.slice(0, 2).map(ch => (
                  <div key={ch.id} className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{ch.emoji}</span>
                      <span className="text-caption font-bold text-slate-800 truncate">{ch.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Practice 15 targeted questions to boost mastery by ~20%
                    </p>
                    <button
                      onClick={() => handleStartTest(ch)}
                      className="mt-2 text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      Start → AI Practice Set
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-blue-400/70 text-caption font-medium border-2 border-dashed border-blue-100 rounded-xl">
                  Start practicing to get recommendations
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — CHAPTER LIST
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.22 }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <p className="text-body-lg font-bold text-slate-800">
                {SUBJECT_META[activeSubject].label} Chapters
              </p>
              <span className="text-caption font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {activeChapters.length}
              </span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1">
              {(['all', 'strong', 'average', 'weak'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={cn(
                    'text-caption font-bold px-3 py-1 rounded-full border capitalize transition-all',
                    filterStatus === f
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter cards */}
          <div className="space-y-2">
            <AnimatePresence>
              {activeChapters.map((ch, idx) => {
                const isExpanded = expandedId === ch.id;
                const meta = SUBJECT_META[activeSubject];

                return (
                  <motion.div
                    key={ch.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ delay: idx * 0.025 }}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200"
                  >
                    {/* Card main row */}
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedId(isExpanded ? null : ch.id)}
                    >
                      <div className="flex items-center gap-3 p-4">

                        {/* Left: Icon + Name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center text-xl border shrink-0',
                            meta.bg, meta.border
                          )}>
                            {ch.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusDot status={ch.status} />
                              <h3 className="text-body-sm font-bold text-slate-900 leading-tight">{ch.name}</h3>
                              <DifficultyBadge level={ch.difficulty} />
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-caption text-slate-400">
                              <span>{ch.questionsSolved}/{ch.questionsTotal} solved</span>
                              <span>·</span>
                              <span>{ch.pyqsCount} PYQs</span>
                              <span>·</span>
                              <span>{ch.testsAttempted} tests</span>
                              {ch.lastScore !== null && (
                                <>
                                  <span>·</span>
                                  <span>Last: <span className="font-bold text-slate-600">{ch.lastScore}%</span></span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Mastery ring + CTA */}
                        <div className="flex items-center gap-3 shrink-0">
                          <MasteryRing value={ch.mastery} size={52} />
                          <div
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-caption font-bold rounded-xl hover:bg-blue-700 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleStartTest(ch); }}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span className="hidden sm:inline">Test</span>
                          </div>
                          <div className="text-slate-300">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                              {[
                                { label: 'Questions Solved', value: `${ch.questionsSolved}/${ch.questionsTotal}`, color: 'text-slate-900' },
                                { label: 'PYQs Covered', value: ch.pyqsCount, color: 'text-slate-900' },
                                { label: 'Tests Attempted', value: ch.testsAttempted, color: 'text-slate-900' },
                                { label: 'Last Attempt', value: ch.lastAttempt, color: 'text-slate-900' },
                              ].map(s => (
                                <div key={s.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                  <p className="text-caption text-slate-400 font-medium">{s.label}</p>
                                  <p className={cn('text-body-sm font-bold mt-0.5', s.color)}>{s.value}</p>
                                </div>
                              ))}
                            </div>

                            {/* Progress bar */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-caption font-semibold text-slate-500">Chapter Progress</span>
                                <span className="text-caption font-bold" style={{ color: meta.accent }}>{ch.mastery}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${ch.mastery}%` }}
                                  transition={{ duration: 0.7, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: meta.accent }}
                                />
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleStartTest(ch)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-caption font-bold rounded-xl hover:bg-blue-700 transition-colors"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                Start Chapter Test
                              </button>
                              <button
                                onClick={() => { setShowPYQSelect(true); }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-caption font-bold rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors"
                              >
                                <Trophy className="w-3.5 h-3.5" />
                                PYQ Test
                              </button>
                              <button
                                onClick={() => navigate(`/learn/${activeSubject}/${ch.id}`)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-caption font-bold rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                Study Chapter
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {activeChapters.length === 0 && (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-body-sm font-bold text-slate-500">No chapters found</p>
                <p className="text-caption text-slate-400 mt-1">Try a different search or filter</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — TEST TYPE CARDS
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.28 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-lg font-bold text-slate-800">Test Formats</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEST_TYPES.map(tt => {
              const TIcon = tt.icon;
              return (
                <div
                  key={tt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 group cursor-pointer"
                  onClick={() => {
                    if (tt.id === 'chapter') setShowChapterSelect(true);
                    else if (tt.id === 'mock' || tt.id === 'part') setShowMixedSelect(true);
                    else if (tt.id === 'revision') setShowPYQSelect(true);
                  }}
                >
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border mb-3', tt.bg, tt.border)}>
                    <TIcon className={cn('w-5 h-5', tt.color)} />
                  </div>
                  <h3 className="text-body-sm font-bold text-slate-900 mb-1">{tt.label}</h3>
                  <p className="text-caption text-slate-400 font-medium mb-3 leading-snug">{tt.description}</p>

                  <div className="flex items-center justify-between text-caption text-slate-500 mb-3">
                    <span>{tt.questions}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tt.duration}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-semibold text-slate-400">Attempted</span>
                      <span className="text-[10px] font-bold text-slate-600">{tt.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${tt.progress}%`, background: tt.color.replace('text-', 'var(--tw-') }}
                      />
                    </div>
                  </div>

                  <div className={cn(
                    'mt-3 flex items-center gap-1 text-caption font-bold',
                    tt.color,
                    'group-hover:underline'
                  )}>
                    Start Now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — MASTERY OVERVIEW (Strong / Weak split)
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.34 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Strong Chapters */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-body-sm font-bold text-slate-800">Strong Chapters</p>
                <p className="text-caption text-slate-400">Mastery ≥ 75%</p>
              </div>
              <span className="ml-auto text-caption font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {strongChapters.length}
              </span>
            </div>
            <div className="space-y-2">
              {strongChapters.map(ch => (
                <div key={ch.id} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{ch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-slate-700 truncate">{ch.name}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${ch.mastery}%` }} />
                    </div>
                  </div>
                  <span className="text-caption font-bold text-emerald-600 shrink-0">{ch.mastery}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Chapters */}
          <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-body-sm font-bold text-slate-800">Chapters to Improve</p>
                <p className="text-caption text-slate-400">Mastery &lt; 50%</p>
              </div>
              <span className="ml-auto text-caption font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                {weakChapters.length}
              </span>
            </div>
            <div className="space-y-2">
              {weakChapters.map(ch => (
                <div key={ch.id} className="flex items-center gap-3 group">
                  <span className="text-lg shrink-0">{ch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-slate-700 truncate">{ch.name}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full bg-red-400 transition-all duration-700" style={{ width: `${ch.mastery}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartTest(ch)}
                    className="text-caption font-bold text-blue-600 shrink-0 hover:underline"
                  >
                    Practice
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </MainLayout>
  );
};

export default TestPage;
