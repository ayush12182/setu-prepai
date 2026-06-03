import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Trophy, 
  Shield, 
  Sparkles, 
  Brain, 
  Flame, 
  Timer, 
  Calendar, 
  Activity, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  ChevronDown,
  ChevronRight,
  Search,
  Info,
  AlertCircle,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChapterTestDialog from '@/components/test/ChapterTestDialog';
import MixedTestDialog from '@/components/test/MixedTestDialog';
import PYQTestDialog from '@/components/test/PYQTestDialog';
import TestExecution from '@/components/test/TestExecution';
import { ChapterSelection } from '@/hooks/useTestQuestions';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { toast } from 'sonner';

type ExecutableTestType = 'chapter' | 'mixed' | 'pyq' | 'adaptive';

interface TestConfig {
  type: ExecutableTestType;
  chapters?: ChapterSelection[];
  subject?: string;
  yearRange?: { start: number; end: number };
  questionCount?: number;
  timeLimitSeconds?: number;
}

interface TestItem {
  id: string;
  name: string;
  questions: number;
  duration: number;
  marks: number;
  attempted: boolean;
  score?: number;
  yearsCovered?: string;
}

interface ChapterData {
  id: string;
  name: string;
  mastery: number;
  testsCount: number;
  pyqsCount: number;
  lastAttempt: string;
  status: 'green' | 'yellow' | 'red';
  aiRecommendation?: {
    lostMarks: number;
    recommendedNotes: string;
  };
  tests: TestItem[];
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  keywords: string[];
  questionsSolved: number;
  questionsRemaining: number;
  lastScore: number | null;
  pyqTimeline: Record<number, boolean>;
}

// Circular progress indicator component for Mastery (Light Mode Redesign)
const MasteryRing: React.FC<{ mastery: number; size?: number; strokeWidth?: number }> = ({ 
  mastery, 
  size = 44, 
  strokeWidth = 3.5 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (mastery / 100) * circumference;

  let strokeColor = 'stroke-rose-550';
  let textColor = 'text-rose-600';
  
  if (mastery >= 70) {
    strokeColor = 'stroke-emerald-500';
    textColor = 'text-emerald-600';
  } else if (mastery >= 50) {
    strokeColor = 'stroke-amber-500';
    textColor = 'text-amber-600';
  }

  return (
    <div className="relative flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="stroke-slate-200"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(strokeColor, "transition-all duration-700 ease-out")}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className={cn("absolute text-[10px] font-bold tracking-tighter", textColor)}>
        {mastery}%
      </span>
    </div>
  );
};

// Render PYQ checklist timeline coverage matrix (Light Mode Redesign)
const renderPYQTimeline = (timeline: Record<number, boolean>) => {
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  if (!timeline || Object.keys(timeline).length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">PYQ Years:</span>
      <div className="flex flex-wrap gap-1">
        {years.map(y => {
          const completed = timeline[y];
          return (
            <span
              key={y}
              className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded transition-all duration-300 border flex items-center gap-0.5 select-none",
                completed 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold" 
                  : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              <span>{y}</span>
              {completed && <span className="text-[8px] font-black text-emerald-600">✓</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Programmatic test set generator to avoid boilerplate and keep file compact
const generateChapterTests = (chapterId: string, chapterName: string, mastery: number): TestItem[] => {
  const attemptedFirst = mastery > 50;
  return [
    {
      id: `${chapterId}-t1`,
      name: `${chapterName} - Practice Set 1`,
      questions: 25,
      duration: 50,
      marks: 100,
      attempted: attemptedFirst,
      score: attemptedFirst ? mastery : undefined,
      yearsCovered: "2019-2021"
    },
    {
      id: `${chapterId}-t2`,
      name: `${chapterName} - Practice Set 2`,
      questions: 25,
      duration: 50,
      marks: 100,
      attempted: false,
      yearsCovered: "2022-2023"
    },
    {
      id: `${chapterId}-t3`,
      name: `${chapterName} - PYQ Chapter Test`,
      questions: 20,
      duration: 40,
      marks: 80,
      attempted: false,
      yearsCovered: "2024-2025"
    }
  ];
};

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();

  const getSubjectStats = (categoryId: string) => {
    let chaptersList: ChapterData[] = [];
    if (categoryId.includes('physics')) {
      chaptersList = physicsChapters;
    } else if (categoryId.includes('chemistry')) {
      chaptersList = chemistryChapters;
    } else if (categoryId.includes('maths') || categoryId.includes('mathematics')) {
      chaptersList = mathsChapters;
    } else if (categoryId === 'part-test') {
      chaptersList = partTestsChapters;
    } else if (categoryId === 'full-mock') {
      chaptersList = fullTestsChapters;
    }

    const totalTests = chaptersList.reduce((acc, ch) => acc + ch.testsCount, 0);
    const completed = chaptersList.reduce((acc, ch) => acc + ch.tests.filter(t => t.attempted).length, 0);
    const totalMastery = chaptersList.length > 0
      ? Math.round(chaptersList.reduce((acc, ch) => acc + ch.mastery, 0) / chaptersList.length)
      : 0;

    return { totalTests, completed, mastery: totalMastery };
  };

  // Dialog states
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showMixedSelect, setShowMixedSelect] = useState(false);
  const [showPYQSelect, setShowPYQSelect] = useState(false);
  const [activeTest, setActiveTest] = useState<TestConfig | null>(null);

  // Sidebar selection (clean light mode subjects)
  const [activeCategory, setActiveCategory] = useState<string>('physics');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pill filter: 'all' | 'available' | 'attempted' | 'resume'
  const [pillFilter, setPillFilter] = useState<'all' | 'available' | 'attempted' | 'resume'>('all');

  // Accordion expanded chapter
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>('ch-rotation');

  // Syllabus Modal popup details
  const [syllabusModalText, setSyllabusModalText] = useState<string | null>(null);

  // Static target chapters for adaptive weakness mock runs
  const weakChapters: ChapterSelection[] = [
    { chapterId: 'ch-rotation', chapterName: 'Rotational Motion', subject: 'physics' },
    { chapterId: 'ch-functions', chapterName: 'Functions & Relations', subject: 'mathematics' },
    { chapterId: 'ch-electrostatics', chapterName: 'Electrostatics', subject: 'physics' }
  ];

  // =========================================================================
  // COMPLETE PHYSICS SYLLABUS (24 CHAPTERS)
  // =========================================================================
  const physicsChaptersRaw = [
    { 
      id: 'ch-units', 
      name: 'Units and Dimensions', 
      mastery: 92, 
      lastAttempt: '2 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '📐',
      keywords: ["units", "dimensions", "significant figures", "dimensional analysis", "error analysis", "measurement"],
      questionsSolved: 45,
      questionsRemaining: 5,
      lastScore: 92,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-kin-1d', 
      name: 'Motion in One Dimension', 
      mastery: 74, 
      lastAttempt: '3 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '📈',
      keywords: ["speed", "velocity", "acceleration", "relative velocity", "v-t graph", "free fall", "distance", "displacement"],
      questionsSolved: 32,
      questionsRemaining: 18,
      lastScore: 74,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: true, 2025: false }
    },
    { 
      id: 'ch-kin-2d', 
      name: 'Motion in Two Dimensions (Projectile)', 
      mastery: 80, 
      lastAttempt: '4 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '⚽',
      keywords: ["projectile motion", "range", "trajectory", "horizontal projectile", "relative motion", "river boat problem", "rain man"],
      questionsSolved: 28,
      questionsRemaining: 22,
      lastScore: 80,
      pyqTimeline: { 2019: true, 2020: true, 2021: false, 2022: true, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-nlm', 
      name: 'Laws of Motion (NLM)', 
      mastery: 63, 
      lastAttempt: '5 days ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '📦',
      keywords: ["newtons laws", "force", "friction", "tension", "pulley system", "free body diagram", "fbd", "pseudo force", "inertia"],
      questionsSolved: 38,
      questionsRemaining: 37,
      lastScore: 63,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: true, 2023: false, 2024: true, 2025: true }
    },
    { 
      id: 'ch-wep', 
      name: 'Work Power Energy (WEP)', 
      mastery: 61, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '⚡',
      keywords: ["work done", "potential energy", "kinetic energy", "conservative force", "work energy theorem", "power", "elastic collision", "conservation of energy"],
      questionsSolved: 24,
      questionsRemaining: 26,
      lastScore: 61,
      pyqTimeline: { 2019: false, 2020: true, 2021: true, 2022: true, 2023: false, 2024: true, 2025: false }
    },
    { 
      id: 'ch-com', 
      name: 'Center of Mass & Collisions', 
      mastery: 52, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '💥',
      keywords: ["center of mass", "com", "linear momentum", "impulse", "elastic collision", "coefficient of restitution", "variable mass"],
      questionsSolved: 19,
      questionsRemaining: 31,
      lastScore: 52,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: false, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-rotation', 
      name: 'Rotational Motion', 
      mastery: 29, 
      lastAttempt: '1 day ago', 
      status: 'red',
      difficulty: 'hard' as const,
      emoji: '🌀',
      keywords: ["moment of inertia", "torque", "angular momentum", "rolling motion", "pure rolling", "angular acceleration", "rotational kinetic energy", "center of gravity"],
      questionsSolved: 12,
      questionsRemaining: 48,
      lastScore: 29,
      pyqTimeline: { 2019: false, 2020: false, 2021: true, 2022: false, 2023: false, 2024: true, 2025: false },
      aiRecommendation: { lostMarks: 18, recommendedNotes: 'Focus on Moment of Inertia, Angular Momentum Conservation, and Pure Rolling equations.' }
    },
    { 
      id: 'ch-gravitation', 
      name: 'Gravitation', 
      mastery: 85, 
      lastAttempt: '2 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '🪐',
      keywords: ["keplers laws", "gravitational force", "potential energy", "escape velocity", "orbital velocity", "satellite motion", "g value variation"],
      questionsSolved: 40,
      questionsRemaining: 10,
      lastScore: 85,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-solids', 
      name: 'Mechanical Properties of Solids', 
      mastery: 58, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'easy' as const,
      emoji: '🔩',
      keywords: ["youngs modulus", "elasticity", "stress", "strain", "hookes law", "bulk modulus", "shear modulus"],
      questionsSolved: 15,
      questionsRemaining: 15,
      lastScore: 58,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: false, 2023: true, 2024: true, 2025: false }
    },
    { 
      id: 'ch-fluids', 
      name: 'Mechanical Properties of Fluids', 
      mastery: 64, 
      lastAttempt: '6 days ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '💧',
      keywords: ["viscosity", "surface tension", "bernoullis principle", "pascals law", "hydrostatic pressure", "terminal velocity", "equation of continuity", "capillary rise"],
      questionsSolved: 22,
      questionsRemaining: 28,
      lastScore: 64,
      pyqTimeline: { 2019: false, 2020: true, 2021: true, 2022: true, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-ktg', 
      name: 'Kinetic Theory of Gases (KTG)', 
      mastery: 70, 
      lastAttempt: '4 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '🎈',
      keywords: ["ideal gas equation", "rms speed", "mean free path", "degrees of freedom", "specific heat capacity", "boltzmann constant", "pressure of gas"],
      questionsSolved: 35,
      questionsRemaining: 15,
      lastScore: 70,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: false }
    },
    { 
      id: 'ch-thermodynamics', 
      name: 'Thermodynamics (Physics)', 
      mastery: 41, 
      lastAttempt: '2 days ago', 
      status: 'red',
      difficulty: 'medium' as const,
      emoji: '🔥',
      keywords: ["carnot engine", "first law of thermodynamics", "adiabatic process", "isothermal process", "entropy", "work done in process", "second law of thermodynamics", "heat engine"],
      questionsSolved: 18,
      questionsRemaining: 32,
      lastScore: 41,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: true, 2023: false, 2024: true, 2025: false },
      aiRecommendation: { lostMarks: 10, recommendedNotes: 'Revise Carnot Cycle efficiency, P-V graphs work calculations, and First Law applications.' }
    },
    { 
      id: 'ch-shm', 
      name: 'Simple Harmonic Motion (SHM)', 
      mastery: 44, 
      lastAttempt: '3 days ago', 
      status: 'red',
      difficulty: 'medium' as const,
      emoji: '⏱️',
      keywords: ["simple pendulum", "spring block system", "shm equations", "restoring force", "damped oscillations", "resonance", "energy in shm"],
      questionsSolved: 20,
      questionsRemaining: 30,
      lastScore: 44,
      pyqTimeline: { 2019: false, 2020: true, 2021: false, 2022: true, 2023: true, 2024: false, 2025: true },
      aiRecommendation: { lostMarks: 12, recommendedNotes: 'Revise Spring-Block systems, energy equations, and combination of springs.' }
    },
    { 
      id: 'ch-waves', 
      name: 'Waves and Sound', 
      mastery: 55, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🔊',
      keywords: ["doppler effect", "standing waves", "wave speed", "organ pipe", "beats", "interference of waves", "intensity of sound", "string waves"],
      questionsSolved: 17,
      questionsRemaining: 33,
      lastScore: 55,
      pyqTimeline: { 2019: true, 2020: true, 2021: false, 2022: true, 2023: false, 2024: true, 2025: true }
    },
    { 
      id: 'ch-electrostatics', 
      name: 'Electrostatics', 
      mastery: 43, 
      lastAttempt: '1 week ago', 
      status: 'red',
      difficulty: 'hard' as const,
      emoji: '⚡',
      keywords: ["coulombs law", "electric field", "gausss law", "electric potential", "electrostatic potential energy", "dipole", "flux", "conductors"],
      questionsSolved: 16,
      questionsRemaining: 44,
      lastScore: 43,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: false, 2023: true, 2024: true, 2025: false },
      aiRecommendation: { lostMarks: 14, recommendedNotes: 'Focus on Gausss Law flux calculations, Electric Potential, and dipole field equations.' }
    },
    { 
      id: 'ch-capacitance', 
      name: 'Capacitors', 
      mastery: 66, 
      lastAttempt: '5 days ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '🔋',
      keywords: ["capacitance", "dielectric", "parallel plate capacitor", "energy stored in capacitor", "combination of capacitors", "rc circuit"],
      questionsSolved: 23,
      questionsRemaining: 27,
      lastScore: 66,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: false, 2024: true, 2025: true }
    },
    { 
      id: 'ch-current-elec', 
      name: 'Current Electricity', 
      mastery: 78, 
      lastAttempt: '3 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '🔌',
      keywords: ["ohms law", "kirchhoffs laws", "drift velocity", "wheatstone bridge", "potentiometer", "meter bridge", "temperature dependency", "internal resistance"],
      questionsSolved: 39,
      questionsRemaining: 21,
      lastScore: 78,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-magnetism', 
      name: 'Magnetic Effects of Current', 
      mastery: 53, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🧲',
      keywords: ["biot savart law", "ampere circuital law", "lorentz force", "cyclotron", "magnetic dipole moment", "galvanometer conversion", "solenoid", "toroid"],
      questionsSolved: 21,
      questionsRemaining: 29,
      lastScore: 53,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: true, 2023: false, 2024: true, 2025: false }
    },
    { 
      id: 'ch-emi', 
      name: 'Electromagnetic Induction (EMI)', 
      mastery: 60, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '🔄',
      keywords: ["faradays law", "lenz law", "self inductance", "mutual inductance", "motional emf", "eddy currents", "l-r circuit"],
      questionsSolved: 24,
      questionsRemaining: 26,
      lastScore: 60,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-ac', 
      name: 'Alternating Current (AC)', 
      mastery: 62, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '📈',
      keywords: ["lcr circuit", "resonance in ac", "power factor", "transformer", "rms voltage", "reactance", "impedance", "quality factor"],
      questionsSolved: 25,
      questionsRemaining: 25,
      lastScore: 62,
      pyqTimeline: { 2019: false, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: false }
    },
    { 
      id: 'ch-ray-optics', 
      name: 'Ray Optics & Instruments', 
      mastery: 68, 
      lastAttempt: '6 days ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🔍',
      keywords: ["snells law", "total internal reflection", "tir", "lens makers formula", "prism deviation", "microscope magnification", "telescope", "spherical mirrors"],
      questionsSolved: 27,
      questionsRemaining: 23,
      lastScore: 68,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: false, 2024: true, 2025: true }
    },
    { 
      id: 'ch-wave-optics', 
      name: 'Wave Optics (YDSE)', 
      mastery: 50, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🌊',
      keywords: ["youngs double slit experiment", "ydse", "fringe width", "coherent sources", "polarization", "brewsters law", "diffraction", "wavefront"],
      questionsSolved: 15,
      questionsRemaining: 15,
      lastScore: 50,
      pyqTimeline: { 2019: false, 2020: true, 2021: false, 2022: true, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-modern-phys', 
      name: 'Modern Physics (Atoms & Nuclei)', 
      mastery: 76, 
      lastAttempt: '4 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '⚛️',
      keywords: ["photoelectric effect", "work function", "de broglie wavelength", "bohr model", "radioactivity", "half life", "nuclear fission", "binding energy"],
      questionsSolved: 38,
      questionsRemaining: 12,
      lastScore: 76,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-semiconductors', 
      name: 'Semiconductor Electronics', 
      mastery: 88, 
      lastAttempt: '2 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '💾',
      keywords: ["pn junction diode", "zener diode", "transistor characteristics", "logic gates", "rectifier", "truth table", "intrinsic semiconductor"],
      questionsSolved: 44,
      questionsRemaining: 6,
      lastScore: 88,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    }
  ];

  const physicsChapters: ChapterData[] = useMemo(() => {
    return physicsChaptersRaw.map(ch => ({
      ...ch,
      testsCount: 3,
      pyqsCount: ch.mastery > 60 ? 36 : 24,
      status: ch.status as 'green' | 'yellow' | 'red',
      tests: generateChapterTests(ch.id, ch.name, ch.mastery)
    }));
  }, []);

  // =========================================================================
  // COMPLETE CHEMISTRY SYLLABUS (19 CHAPTERS)
  // =========================================================================
  const chemistryChaptersRaw = [
    { 
      id: 'ch-mole', 
      name: 'Basic Concepts of Chemistry (Mole Concept)', 
      mastery: 90, 
      lastAttempt: '3 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '🧪',
      keywords: ["mole concept", "stoichiometry", "empirical formula", "molarity", "molality", "limiting reagent"],
      questionsSolved: 40,
      questionsRemaining: 10,
      lastScore: 90,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-atomic', 
      name: 'Structure of Atom', 
      mastery: 78, 
      lastAttempt: '5 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '⚛️',
      keywords: ["bohr orbit", "quantum numbers", "photoelectric effect", "heisenberg uncertainty", "de broglie", "aufbau principle", "electronic configuration"],
      questionsSolved: 31,
      questionsRemaining: 19,
      lastScore: 78,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-bonding', 
      name: 'Chemical Bonding & Molecular Structure', 
      mastery: 65, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🤝',
      keywords: ["hybridization", "vespr theory", "dipole moment", "molecular orbital theory", "mot", "hydrogen bonding", "covalent bond"],
      questionsSolved: 26,
      questionsRemaining: 24,
      lastScore: 65,
      pyqTimeline: { 2019: true, 2020: true, 2021: false, 2022: true, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-chem-thermo', 
      name: 'Chemical Thermodynamics', 
      mastery: 35, 
      lastAttempt: '1 day ago', 
      status: 'red',
      difficulty: 'hard' as const,
      emoji: '🔥',
      keywords: ["entropy", "gibbs free energy", "enthalpy", "first law of thermodynamics", "hess law", "spontaneity", "heat capacity"],
      questionsSolved: 14,
      questionsRemaining: 36,
      lastScore: 35,
      pyqTimeline: { 2019: false, 2020: false, 2021: true, 2022: false, 2023: true, 2024: false, 2025: false },
      aiRecommendation: { lostMarks: 12, recommendedNotes: 'Focus on entropy calculations, Gibbs free energy criterion, and Hess Law application.' }
    },
    { 
      id: 'ch-equilibrium', 
      name: 'Chemical & Ionic Equilibrium', 
      mastery: 58, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '⚖️',
      keywords: ["le chatelier principle", "ph calculation", "solubility product", "ksp", "buffer solution", "hydrolysis of salts", "equilibrium constant"],
      questionsSolved: 20,
      questionsRemaining: 30,
      lastScore: 58,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: true, 2023: false, 2024: true, 2025: false }
    },
    { 
      id: 'ch-solutions', 
      name: 'Solutions & Colligative Properties', 
      mastery: 67, 
      lastAttempt: '4 days ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '🧪',
      keywords: ["raoults law", "henrys law", "osmotic pressure", "elevation in boiling point", "depression in freezing point", "vant hoff factor"],
      questionsSolved: 28,
      questionsRemaining: 22,
      lastScore: 67,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-electro', 
      name: 'Electrochemistry', 
      mastery: 72, 
      lastAttempt: '5 days ago', 
      status: 'green',
      difficulty: 'hard' as const,
      emoji: '🔋',
      keywords: ["nernst equation", "faradays laws of electrolysis", "molar conductivity", "kohlrausch law", "salt bridge", "galvanic cell", "fuel cell"],
      questionsSolved: 33,
      questionsRemaining: 17,
      lastScore: 72,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-kinetics', 
      name: 'Chemical Kinetics', 
      mastery: 80, 
      lastAttempt: '2 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '⏱️',
      keywords: ["order of reaction", "arrhenius equation", "half life period", "rate law", "activation energy", "first order reaction"],
      questionsSolved: 38,
      questionsRemaining: 12,
      lastScore: 80,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-periodic', 
      name: 'Periodic Table & Periodicity', 
      mastery: 85, 
      lastAttempt: '3 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '📅',
      keywords: ["ionization enthalpy", "electron gain enthalpy", "electronegativity", "atomic radius variation", "periodic trends", "shielding effect"],
      questionsSolved: 42,
      questionsRemaining: 8,
      lastScore: 85,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-pblock', 
      name: 'p-Block Elements', 
      mastery: 50, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🧱',
      keywords: ["inert pair effect", "allotropes of carbon", "nitrogen family", "halogens", "noble gases", "borax bead test"],
      questionsSolved: 15,
      questionsRemaining: 15,
      lastScore: 50,
      pyqTimeline: { 2019: false, 2020: true, 2021: false, 2022: true, 2023: true, 2024: false, 2025: false }
    },
    { 
      id: 'ch-dfblock', 
      name: 'd- and f-Block Elements', 
      mastery: 61, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '💎',
      keywords: ["lanthanoid contraction", "transition metals", "magnetic moment", "interstitial compounds", "potassium dichromate", "permanganate"],
      questionsSolved: 22,
      questionsRemaining: 18,
      lastScore: 61,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-coordination', 
      name: 'Coordination Compounds', 
      mastery: 74, 
      lastAttempt: '6 days ago', 
      status: 'green',
      difficulty: 'hard' as const,
      emoji: '🌐',
      keywords: ["ligands", "crystal field theory", "cft", "isomerism", "iupac nomenclature", "valence bond theory", "vbt", "magnetic properties"],
      questionsSolved: 35,
      questionsRemaining: 15,
      lastScore: 74,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: false }
    },
    { 
      id: 'ch-goc', 
      name: 'General Organic Chemistry (GOC)', 
      mastery: 83, 
      lastAttempt: '4 days ago', 
      status: 'green',
      difficulty: 'hard' as const,
      emoji: '🧬',
      keywords: ["inductive effect", "resonance", "hyperconjugation", "aromaticity", "electrophile", "nucleophile", "carbocation stability"],
      questionsSolved: 40,
      questionsRemaining: 10,
      lastScore: 83,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-hydrocarbons', 
      name: 'Hydrocarbons', 
      mastery: 69, 
      lastAttempt: '5 days ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '🛢️',
      keywords: ["alkanes", "alkenes", "alkynes", "ozonolysis", "markownikoff rule", "anti-markownikoff", "electrophilic addition"],
      questionsSolved: 28,
      questionsRemaining: 22,
      lastScore: 69,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-haloalkanes', 
      name: 'Haloalkanes & Haloarenes', 
      mastery: 71, 
      lastAttempt: '1 week ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '🧪',
      keywords: ["sn1 reaction", "sn2 reaction", "nucleophilic substitution", "grignard reagent", "wurtz reaction", "sandmeyer reaction"],
      questionsSolved: 32,
      questionsRemaining: 18,
      lastScore: 71,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: false }
    },
    { 
      id: 'ch-alcohols', 
      name: 'Alcohols, Phenols & Ethers', 
      mastery: 63, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '🍷',
      keywords: ["lucas test", "reimer tiemann reaction", "kolbe reaction", "williamson ether synthesis", "acidic strength of phenol"],
      questionsSolved: 24,
      questionsRemaining: 26,
      lastScore: 63,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: true, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-carbonyl', 
      name: 'Aldehydes, Ketones & Carboxylic Acids', 
      mastery: 48, 
      lastAttempt: '1 day ago', 
      status: 'red',
      difficulty: 'hard' as const,
      emoji: '🍭',
      keywords: ["aldol condensation", "cannizzaro reaction", "clemmensen reduction", "tollens test", "fehlings test", "nucleophilic addition"],
      questionsSolved: 16,
      questionsRemaining: 34,
      lastScore: 48,
      pyqTimeline: { 2019: false, 2020: true, 2021: false, 2022: true, 2023: false, 2024: true, 2025: false },
      aiRecommendation: { lostMarks: 14, recommendedNotes: 'Practice Aldol condensation, Cannizzaro reactions, and nucleophilic addition mechanisms.' }
    },
    { 
      id: 'ch-amines', 
      name: 'Amines & Nitrogen Compounds', 
      mastery: 75, 
      lastAttempt: '3 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '🧪',
      keywords: ["hoffmann bromamide", "carbylamine reaction", "diazo coupling", "hinsberg reagent", "basic strength of amines"],
      questionsSolved: 36,
      questionsRemaining: 14,
      lastScore: 75,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-biomolecules', 
      name: 'Biomolecules & Polymers', 
      mastery: 91, 
      lastAttempt: '2 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '🍎',
      keywords: ["glucose structure", "amino acids", "peptide bond", "dna rna", "addition polymers", "condensation polymers", "proteins"],
      questionsSolved: 44,
      questionsRemaining: 6,
      lastScore: 91,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    }
  ];

  const chemistryChapters: ChapterData[] = useMemo(() => {
    return chemistryChaptersRaw.map(ch => ({
      ...ch,
      testsCount: 3,
      pyqsCount: ch.mastery > 60 ? 30 : 20,
      status: ch.status as 'green' | 'yellow' | 'red',
      tests: generateChapterTests(ch.id, ch.name, ch.mastery)
    }));
  }, []);

  // =========================================================================
  // COMPLETE MATHEMATICS SYLLABUS (18 CHAPTERS)
  // =========================================================================
  const mathsChaptersRaw = [
    { 
      id: 'ch-functions', 
      name: 'Sets, Relations and Functions', 
      mastery: 29, 
      lastAttempt: '1 day ago', 
      status: 'red',
      difficulty: 'medium' as const,
      emoji: '📊',
      keywords: ["domain", "range", "one-one function", "onto function", "equivalence relation", "composite function", "periodic function"],
      questionsSolved: 12,
      questionsRemaining: 38,
      lastScore: 29,
      pyqTimeline: { 2019: false, 2020: false, 2021: true, 2022: false, 2023: false, 2024: true, 2025: false },
      aiRecommendation: { lostMarks: 8, recommendedNotes: 'Focus on domains, range boundaries, periodic behavior, and inverse mappings.' }
    },
    { 
      id: 'ch-quadratics', 
      name: 'Complex Numbers & Quadratic Equations', 
      mastery: 62, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🧮',
      keywords: ["roots of equation", "discriminant", "eulers form", "demoivres theorem", "conjugate", "modulus", "argument", "cube roots of unity"],
      questionsSolved: 24,
      questionsRemaining: 26,
      lastScore: 62,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-matrices', 
      name: 'Matrices and Determinants', 
      mastery: 85, 
      lastAttempt: '6 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '🔳',
      keywords: ["adjoint of matrix", "inverse of matrix", "cramers rule", "symmetric matrix", "skew symmetric", "system of linear equations"],
      questionsSolved: 40,
      questionsRemaining: 10,
      lastScore: 85,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-pc', 
      name: 'Permutations and Combinations (P&C)', 
      mastery: 45, 
      lastAttempt: '3 days ago', 
      status: 'red',
      difficulty: 'hard' as const,
      emoji: '🔢',
      keywords: ["permutations", "combinations", "circular arrangement", "grid path model", "inclusion exclusion", "derangement", "rank of word"],
      questionsSolved: 18,
      questionsRemaining: 32,
      lastScore: 45,
      pyqTimeline: { 2019: false, 2020: true, 2021: false, 2022: true, 2023: false, 2024: true, 2025: false },
      aiRecommendation: { lostMarks: 12, recommendedNotes: 'Focus on grid path models, circular arrangements, and inclusion-exclusion principles.' }
    },
    { 
      id: 'ch-binomial', 
      name: 'Binomial Theorem', 
      mastery: 70, 
      lastAttempt: '5 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '📈',
      keywords: ["general term", "binomial coefficients", "middle term", "fractional power expansion", "sum of coefficients"],
      questionsSolved: 32,
      questionsRemaining: 18,
      lastScore: 70,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-series', 
      name: 'Sequence and Series (AP & GP)', 
      mastery: 88, 
      lastAttempt: '2 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '⛓️',
      keywords: ["arithmetic progression", "geometric progression", "harmonic progression", "sum of infinite gp", "arithmetic geometric progression", "agp", "am gm inequality"],
      questionsSolved: 44,
      questionsRemaining: 6,
      lastScore: 88,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-lcd', 
      name: 'Limits, Continuity & Differentiability', 
      mastery: 68, 
      lastAttempt: '4 days ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '📉',
      keywords: ["lhopitals rule", "limits expansion", "continuity test", "differentiability test", "indeterminate forms", "sandwich theorem"],
      questionsSolved: 28,
      questionsRemaining: 22,
      lastScore: 68,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-aod', 
      name: 'Application of Derivatives (AOD)', 
      mastery: 53, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '📈',
      keywords: ["maxima and minima", "tangents and normals", "increasing decreasing functions", "rolles theorem", "mean value theorem", "rate of change"],
      questionsSolved: 21,
      questionsRemaining: 29,
      lastScore: 53,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: true, 2023: false, 2024: true, 2025: false }
    },
    { 
      id: 'ch-integration', 
      name: 'Indefinite & Definite Integration', 
      mastery: 49, 
      lastAttempt: '2 days ago', 
      status: 'red',
      difficulty: 'hard' as const,
      emoji: '∫',
      keywords: ["integration by parts", "partial fractions", "definite integral properties", "leibniz rule", "reduction formula", "integration substitution"],
      questionsSolved: 19,
      questionsRemaining: 31,
      lastScore: 49,
      pyqTimeline: { 2019: false, 2020: true, 2021: false, 2022: true, 2023: false, 2024: true, 2025: false },
      aiRecommendation: { lostMarks: 16, recommendedNotes: 'Practice definite integration properties, reduction formulas, and integration by parts.' }
    },
    { 
      id: 'ch-diff-eq', 
      name: 'Differential Equations', 
      mastery: 61, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '📉',
      keywords: ["variable separable", "homogeneous differential equation", "linear differential equation", "integrating factor", "order and degree"],
      questionsSolved: 24,
      questionsRemaining: 26,
      lastScore: 61,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: false, 2025: true }
    },
    { 
      id: 'ch-lines', 
      name: 'Straight Lines', 
      mastery: 78, 
      lastAttempt: '1 week ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '📏',
      keywords: ["slope of line", "angle between lines", "distance formula", "concurrency of lines", "family of lines", "orthocenter", "centroid"],
      questionsSolved: 39,
      questionsRemaining: 11,
      lastScore: 78,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-circles', 
      name: 'Circles', 
      mastery: 64, 
      lastAttempt: '5 days ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '⭕',
      keywords: ["equation of circle", "tangent to circle", "normal to circle", "radical axis", "orthogonal circles", "length of tangent"],
      questionsSolved: 26,
      questionsRemaining: 24,
      lastScore: 64,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: false, 2024: true, 2025: true }
    },
    { 
      id: 'ch-conics', 
      name: 'Conic Sections (Parabola, Ellipse, Hyperbola)', 
      mastery: 58, 
      lastAttempt: '2 weeks ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🍦',
      keywords: ["parabola standard equation", "ellipse eccentricity", "hyperbola asymptotes", "tangents to conics", "focal chord", "director circle"],
      questionsSolved: 20,
      questionsRemaining: 30,
      lastScore: 58,
      pyqTimeline: { 2019: true, 2020: false, 2021: true, 2022: true, 2023: false, 2024: true, 2025: false }
    },
    { 
      id: 'ch-vectors', 
      name: 'Vector Algebra', 
      mastery: 81, 
      lastAttempt: '4 days ago', 
      status: 'green',
      difficulty: 'easy' as const,
      emoji: '➡️',
      keywords: ["dot product", "cross product", "scalar triple product", "vector triple product", "collinearity", "coplanarity", "projection of vector"],
      questionsSolved: 40,
      questionsRemaining: 10,
      lastScore: 81,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-3d', 
      name: 'Three Dimensional Geometry (3D)', 
      mastery: 75, 
      lastAttempt: '3 days ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '🧱',
      keywords: ["direction cosines", "shortest distance between lines", "equation of plane", "angle between line and plane", "coplanar lines", "intersection of planes"],
      questionsSolved: 35,
      questionsRemaining: 15,
      lastScore: 75,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: false }
    },
    { 
      id: 'ch-probability', 
      name: 'Probability', 
      mastery: 50, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🎲',
      keywords: ["conditional probability", "bayes theorem", "binomial distribution", "independent events", "total probability theorem", "probability distribution"],
      questionsSolved: 15,
      questionsRemaining: 15,
      lastScore: 50,
      pyqTimeline: { 2019: false, 2020: true, 2021: false, 2022: true, 2023: true, 2024: false, 2025: false }
    },
    { 
      id: 'ch-trig', 
      name: 'Trigonometric Functions & Equations', 
      mastery: 72, 
      lastAttempt: '2 weeks ago', 
      status: 'green',
      difficulty: 'medium' as const,
      emoji: '📐',
      keywords: ["trigonometric identities", "compound angles", "general solution", "multiple angles", "heights and distances"],
      questionsSolved: 36,
      questionsRemaining: 14,
      lastScore: 72,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
    },
    { 
      id: 'ch-itf', 
      name: 'Inverse Trigonometric Functions (ITF)', 
      mastery: 67, 
      lastAttempt: '1 week ago', 
      status: 'yellow',
      difficulty: 'medium' as const,
      emoji: '🔄',
      keywords: ["principal value branch", "itf identities", "domain and range of itf", "itf properties"],
      questionsSolved: 28,
      questionsRemaining: 22,
      lastScore: 67,
      pyqTimeline: { 2019: true, 2020: true, 2021: true, 2022: false, 2023: true, 2024: false, 2025: true }
    }
  ];

  const mathsChapters: ChapterData[] = useMemo(() => {
    return mathsChaptersRaw.map(ch => ({
      ...ch,
      testsCount: 3,
      pyqsCount: ch.mastery > 60 ? 32 : 22,
      status: ch.status as 'green' | 'yellow' | 'red',
      tests: generateChapterTests(ch.id, ch.name, ch.mastery)
    }));
  }, []);

  // MOCK TESTS (Part and Full Mocks remain custom styled)
  const partTestsChapters: ChapterData[] = [
    {
      id: 'ch-part-11',
      name: 'Class 11 Mock Syllabus Mocks',
      mastery: 65,
      testsCount: 2,
      pyqsCount: 0,
      lastAttempt: '2 weeks ago',
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🏆',
      keywords: ['part mock', 'pcm', 'class 11'],
      questionsSolved: 75,
      questionsRemaining: 45,
      lastScore: 55,
      pyqTimeline: {},
      tests: [
        { id: 't-part11-1', name: 'Class 11 Part Test (QPT-1) - PCM', questions: 75, duration: 150, marks: 300, attempted: true, score: 165, yearsCovered: "2019-2023" },
        { id: 't-part11-2', name: 'Class 11 Part Test (QPT-2) - Mechanics Focus', questions: 45, duration: 90, marks: 180, attempted: false, yearsCovered: "2024-2025" }
      ]
    }
  ];

  const fullTestsChapters: ChapterData[] = [
    {
      id: 'ch-full-main',
      name: 'Full Syllabus Mock Tests',
      mastery: 49,
      testsCount: 3,
      pyqsCount: 0,
      lastAttempt: '1 week ago',
      status: 'yellow',
      difficulty: 'hard' as const,
      emoji: '🏛',
      keywords: ['full mock', 'syllabus assessment', 'main mock'],
      questionsSolved: 90,
      questionsRemaining: 180,
      lastScore: 49,
      pyqTimeline: {},
      tests: [
        { id: 't-full-1', name: 'Full Mock Test 1 (Closest to Real Exam)', questions: 90, duration: 180, marks: 300, attempted: true, score: 147, yearsCovered: "2019-2023" },
        { id: 't-full-2', name: 'Full Mock Test 2 (Advanced Traps)', questions: 90, duration: 180, marks: 300, attempted: false, yearsCovered: "2024" },
        { id: 't-full-3', name: 'Full Mock Test 3 (High Weightage Focus)', questions: 90, duration: 180, marks: 300, attempted: false, yearsCovered: "2025" }
      ]
    }
  ];

  // Category array resolver
  const getActiveChaptersList = (): ChapterData[] => {
    switch (activeCategory) {
      case 'physics-pyq':
      case 'physics-topic':
        return physicsChapters;
      case 'chemistry-pyq':
      case 'chemistry-topic':
        return chemistryChapters;
      case 'maths-pyq':
      case 'maths-topic':
        return mathsChapters;
      case 'part-test':
        return partTestsChapters;
      case 'full-mock':
        return fullTestsChapters;
      default:
        return physicsChapters;
    }
  };

  // Search & Filter Memo
  const filteredChapters = useMemo(() => {
    const chapters = getActiveChaptersList();
    return chapters.filter(ch => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesName = ch.name.toLowerCase().includes(searchLower);
      const matchesKeywords = ch.keywords && ch.keywords.some(kw => kw.toLowerCase().includes(searchLower));
      
      const matchesSearch = matchesName || matchesKeywords;
      if (!matchesSearch) return false;

      if (pillFilter === 'all') return true;
      
      const hasAttempted = ch.tests.some(t => t.attempted);
      const hasUnattempted = ch.tests.some(t => !t.attempted);

      if (pillFilter === 'attempted') return hasAttempted;
      if (pillFilter === 'available') return hasUnattempted;

      return true;
    });
  }, [activeCategory, searchQuery, pillFilter, physicsChapters, chemistryChapters, mathsChapters]);

  // Overall metadata summaries
  const activeCategorySummary = useMemo(() => {
    const chapters = getActiveChaptersList();
    const totalTests = chapters.reduce((acc, ch) => acc + ch.testsCount, 0);
    const completed = chapters.reduce((acc, ch) => acc + ch.tests.filter(t => t.attempted).length, 0);
    const totalMastery = chapters.length > 0
      ? Math.round(chapters.reduce((acc, ch) => acc + ch.mastery, 0) / chapters.length)
      : 0;

    return {
      totalTests,
      completed,
      remaining: totalTests - completed,
      mastery: totalMastery
    };
  }, [activeCategory, physicsChapters, chemistryChapters, mathsChapters]);

  const handleStartTestSet = (test: TestItem, chapter: ChapterData) => {
    const isMock = activeCategory === 'part-test' || activeCategory === 'full-mock';
    const targetConfig: TestConfig = {
      type: isMock ? 'adaptive' : 'chapter',
      questionCount: test.questions,
      timeLimitSeconds: test.duration * 60,
      chapters: [
        {
          chapterId: chapter.id,
          chapterName: chapter.name,
          subject: activeCategory.includes('physics') ? 'physics' : activeCategory.includes('chemistry') ? 'chemistry' : 'mathematics'
        }
      ]
    };

    setActiveTest(targetConfig);
    toast.success(`Attempting Mock: ${test.name}. Total Marks: ${test.marks}`);
  };

  const handleStartRecoveryPack = (chapter: ChapterData) => {
    const targetConfig: TestConfig = {
      type: 'mixed',
      questionCount: 20,
      timeLimitSeconds: 40 * 60,
      chapters: [
        {
          chapterId: chapter.id,
          chapterName: chapter.name,
          subject: activeCategory.includes('physics') ? 'physics' : activeCategory.includes('chemistry') ? 'chemistry' : 'mathematics'
        }
      ]
    };

    setActiveTest(targetConfig);
    toast.success(`Launching Score Recovery mock for ${chapter.name}.`);
  };

  const handleViewSyllabus = (test: TestItem, chapter: ChapterData) => {
    const isMock = activeCategory === 'part-test' || activeCategory === 'full-mock';
    if (isMock) {
      setSyllabusModalText(`Full syllabus coverage according to standard JEE Main guidelines. Includes Physics, Chemistry, and Mathematics sections. Total marks: ${test.marks}, Questions: ${test.questions}.`);
    } else {
      setSyllabusModalText(`Complete chapter syllabus for ${chapter.name}: covers core concepts, derivations, formulas, and targeted previous year question patterns. Total marks: ${test.marks}, Questions: ${test.questions}.`);
    }
  };

  const handleStartChapterTest = (chapter: ChapterSelection) => {
    setShowChapterSelect(false);
    setActiveTest({ type: 'chapter', chapters: [chapter], questionCount: 15 });
  };

  const handleStartMixedTest = (chapters: ChapterSelection[]) => {
    setShowMixedSelect(false);
    setActiveTest({ type: 'mixed', chapters, questionCount: chapters.length * 5 });
  };

  const handleStartPYQTest = (config: { subject?: string; yearRange: { start: number; end: number }; count: number }) => {
    setShowPYQSelect(false);
    setActiveTest({ type: 'pyq', subject: config.subject, yearRange: config.yearRange, questionCount: config.count });
  };

  const handleTestComplete = () => setActiveTest(null);

  const getCategoryTitle = () => {
    if (activeCategory === 'physics') return 'Physics';
    if (activeCategory === 'chemistry') return 'Chemistry';
    if (activeCategory === 'mathematics') return 'Mathematics';
    if (activeCategory === 'part-test') return 'Part Syllabus Mocks';
    return 'Full Syllabus Mocks';
  };

  const getSubjectEmoji = (cat: string) => {
    if (cat === 'physics') return '⚛';
    if (cat === 'chemistry') return '🧪';
    if (cat === 'mathematics') return '📐';
    if (cat === 'part-test') return '🏆';
    return '🏛';
  };

  const getSubjectLabel = (cat: string) => {
    if (cat === 'physics') return 'Physics';
    if (cat === 'chemistry') return 'Chemistry';
    return 'Mathematics';
  };

  if (activeTest) {
    return (
      <div className="light bg-[#FAFAFA] min-h-screen text-slate-800 font-sans">
        <TestExecution config={activeTest} onComplete={handleTestComplete} onExit={handleTestComplete} />
      </div>
    );
  }

  return (
    <div className="light bg-[#FAFAFA] min-h-screen text-slate-800 font-sans flex w-full">
      {/* LEFT SIDEBAR: FIXED SUBJECT NAVIGATION */}
      <aside className="w-80 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Branding */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
                <span className="text-white font-black text-lg">P</span>
              </div>
              <div>
                <h1 className="font-sans font-bold text-lg text-slate-800 tracking-wide">
                  Prep<span className="text-[#FF6B00]">Entrance</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Chapter-wise Test Portal
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Left Navigation list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block pl-2 mb-2">
                Core Subjects
              </span>
              {[
                { id: 'physics', label: 'Physics', icon: '⚛', color: 'text-blue-500' },
                { id: 'chemistry', label: 'Chemistry', icon: '🧪', color: 'text-emerald-500' },
                { id: 'mathematics', label: 'Mathematics', icon: '📐', color: 'text-amber-500' }
              ].map((item) => {
                const stats = getSubjectStats(item.id);
                const isActive = activeCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveCategory(item.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "w-full text-left px-3.5 py-3 text-xs font-bold rounded-xl border transition-all flex flex-col gap-1.5",
                      isActive 
                        ? "bg-orange-50 border-orange-200 text-[#FF6B00] shadow-sm" 
                        : "bg-white border-slate-150 text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2.5">
                        <span className={cn("text-base shrink-0", item.color)}>{item.icon}</span>
                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      </span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pl-1 mt-0.5">
                      <span>{stats.completed} / {stats.totalTests} Completed</span>
                      <span className="font-bold text-slate-700">{stats.mastery}% Mastery</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block pl-2 mb-2">
                Mock Exams
              </span>
              {[
                { id: 'part-test', label: 'Part Tests (QPT)', icon: '🏆', color: 'text-indigo-500' },
                { id: 'full-mock', label: 'Full Syllabus Mocks (QFT)', icon: '🏛', color: 'text-rose-500' }
              ].map((item) => {
                const stats = getSubjectStats(item.id);
                const isActive = activeCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveCategory(item.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "w-full text-left px-3.5 py-3 text-xs font-bold rounded-xl border transition-all flex flex-col gap-1.5",
                      isActive 
                        ? "bg-orange-50 border-orange-200 text-[#FF6B00] shadow-sm" 
                        : "bg-white border-slate-150 text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2.5">
                        <span className={cn("text-base shrink-0", item.color)}>{item.icon}</span>
                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      </span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pl-1 mt-0.5">
                      <span>{stats.completed} / {stats.totalTests} Completed</span>
                      <span className="font-bold text-slate-700">{stats.mastery}% Mastery</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Back to Dashboard Link at bottom */}
          <div className="p-4 border-t border-slate-100 shrink-0">
            <button
              onClick={() => navigate('/student-hub')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-850 text-xs font-bold transition-all uppercase tracking-wider"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT WORKSPACE */}
      <main className="flex-1 min-h-screen overflow-y-auto flex flex-col">
        {/* Top Header bar with search and filters */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          {/* Active Title */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{getSubjectEmoji(activeCategory)}</span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              {getCategoryTitle()}
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-1 max-w-xl justify-end">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chapters or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all"
              />
            </div>
          </div>
        </header>

        {/* Workspace body */}
        <div className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Filter Chips row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Chapters' },
                { id: 'available', label: 'Available' },
                { id: 'attempted', label: 'Attempted' },
                { id: 'resume', label: 'Resume Learning' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setPillFilter(pill.id as any)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm",
                    pillFilter === pill.id 
                      ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-sm shadow-[#FF6B00]/10" 
                      : "bg-[rgba(251,146,60,0.08)] border-[rgba(251,146,60,0.25)] text-white hover:bg-[rgba(251,146,60,0.15)] hover:border-[rgba(251,146,60,0.4)]"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {filteredChapters.length} Chapters Found
            </div>
          </div>

          {/* Chapter cards list */}
          <div className="space-y-4">
            {filteredChapters.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-450 text-sm font-semibold">
                No matching chapters found in this subject.
              </div>
            ) : (
              filteredChapters.map((chapter) => {
                const isExpanded = expandedChapterId === chapter.id;
                const completedTests = chapter.tests.filter(t => t.attempted).length;
                
                return (
                  <div 
                    key={chapter.id}
                    className={cn(
                      "rounded-xl border bg-white transition-all duration-200 overflow-hidden",
                      isExpanded
                        ? "border-[#FF6B00] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    )}
                  >
                    {/* Chapter Card Header */}
                    <div
                      onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                      className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Emoji thumbnail */}
                        <div className="text-2xl bg-slate-50 border border-slate-100 p-3 rounded-xl shrink-0 flex items-center justify-center">
                          {chapter.emoji}
                        </div>
                        
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-800 tracking-wide uppercase truncate">
                              {chapter.name}
                            </h3>
                            
                            {/* Difficulty Badge */}
                            <span className={cn(
                              "text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1",
                              chapter.difficulty === 'easy' 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                                : chapter.difficulty === 'medium'
                                  ? "bg-amber-50 border-amber-100 text-amber-600"
                                  : "bg-rose-50 border-rose-100 text-rose-600"
                            )}>
                              <span className={cn(
                                "w-1.2 h-1.2 rounded-full",
                                chapter.difficulty === 'easy' ? "bg-emerald-500" : chapter.difficulty === 'medium' ? "bg-amber-500" : "bg-rose-500"
                              )} />
                              {chapter.difficulty}
                            </span>

                            {/* Weak Area Alert Badge */}
                            {chapter.mastery < 60 && (
                              <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                ⚠️ Weak Area
                              </span>
                            )}
                          </div>

                          {/* Info metrics row */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-555 uppercase tracking-wider">
                            <span>Solved: <strong className="text-slate-800">{chapter.questionsSolved} Qs</strong></span>
                            <span>•</span>
                            <span>Remaining: <strong className="text-slate-800">{chapter.questionsRemaining} Qs</strong></span>
                            <span>•</span>
                            <span>Tests Completed: <strong className="text-slate-800">{completedTests} / {chapter.testsCount}</strong></span>
                            {chapter.pyqsCount > 0 && (
                              <>
                                <span>•</span>
                                <span>PYQs: <strong className="text-slate-800">{chapter.pyqsCount}</strong></span>
                              </>
                            )}
                            <span>•</span>
                            <span>Last Attempt: <strong className="text-slate-800">{chapter.lastAttempt}</strong></span>
                            {chapter.lastScore !== null && (
                              <>
                                <span>•</span>
                                <span className="text-[#FF6B00] font-extrabold">Last Score: {chapter.lastScore}%</span>
                              </>
                            )}
                          </div>

                          {/* PYQ Timeline matrix */}
                          {renderPYQTimeline(chapter.pyqTimeline)}
                        </div>
                      </div>

                      {/* Right part: MasteryRing & CTA */}
                      <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Mastery</span>
                            <span className={cn(
                              "text-xs font-black",
                              chapter.status === 'green' ? "text-emerald-600" : chapter.status === 'yellow' ? "text-amber-600" : "text-rose-600"
                            )}>
                              {chapter.mastery}%
                            </span>
                          </div>
                          <MasteryRing mastery={chapter.mastery} />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedChapterId(isExpanded ? null : chapter.id);
                          }}
                          className={cn(
                            "px-4 py-2.5 text-xs font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-all select-none",
                            isExpanded 
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-650"
                              : "bg-[#FF6B00] hover:bg-[#E05E00] text-white shadow-sm"
                          )}
                        >
                          <span>{isExpanded ? 'Collapse' : 'Continue'}</span>
                          <ArrowRight className={cn("w-3.5 h-3.5 transition-transform duration-300", isExpanded ? "rotate-90" : "")} />
                        </button>
                      </div>
                    </div>

                    {/* Accordion expanded test sets */}
                    {isExpanded && (
                      <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
                        {/* Syllabus progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            <span>Chapter Syllabus Progress</span>
                            <span>{Math.round((completedTests / chapter.tests.length) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#FF6B00] h-full rounded-full transition-all duration-500" 
                              style={{ width: `${(completedTests / chapter.tests.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* List of sets */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block pl-1">
                            Available Worksheets & Practice Sets
                          </span>
                          {chapter.tests.map((test) => (
                            <div 
                              key={test.id}
                              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                            >
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-800">
                                  {test.name}
                                </h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-505 uppercase tracking-wider">
                                  <span>Questions: {test.questions} Qs</span>
                                  <span>Duration: {test.duration} Mins</span>
                                  <span>Marks: {test.marks}</span>
                                  {test.yearsCovered && (
                                    <span>Coverage: {test.yearsCovered}</span>
                                  )}
                                  {test.attempted && (
                                    <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                      ✓ Attempted ({test.score}% score)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 self-stretch sm:self-auto justify-end shrink-0">
                                <Button
                                  variant="outline"
                                  onClick={() => handleViewSyllabus(test, chapter)}
                                  className="bg-white border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-[10px] px-3.5 py-1.5 h-auto rounded-lg uppercase tracking-wider"
                                >
                                  View Syllabus
                                </Button>
                                {test.attempted ? (
                                  <>
                                    <Button
                                      onClick={() => {
                                        toast.info(`Reviewing mistakes for ${test.name}`);
                                      }}
                                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-3.5 py-1.5 h-auto rounded-lg uppercase tracking-wider border-none"
                                    >
                                      Review Mistakes
                                    </Button>
                                    <Button
                                      onClick={() => handleStartTestSet(test, chapter)}
                                      className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-[10px] px-3.5 py-1.5 h-auto rounded-lg uppercase tracking-wider border-none"
                                    >
                                      Attempt Again
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    onClick={() => handleStartTestSet(test, chapter)}
                                    className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-[10px] px-4 py-1.5 h-auto rounded-lg uppercase tracking-wider border-none"
                                  >
                                    Attempt Test
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* SYLLABUS MODAL */}
      {syllabusModalText && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-800">
              <Info className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Test Syllabus & Coverage</h3>
            </div>
            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
              {syllabusModalText}
            </p>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSyllabusModalText(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-wider border-none"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Select Dialog settings hooks */}
      <ChapterTestDialog open={showChapterSelect} onOpenChange={setShowChapterSelect} onStart={handleStartChapterTest} />
      <MixedTestDialog open={showMixedSelect} onOpenChange={setShowMixedSelect} onStart={handleStartMixedTest} />
      {!isFoundation && <PYQTestDialog open={showPYQSelect} onOpenChange={setShowPYQSelect} onStart={handleStartPYQTest} />}
    </div>
  );
};

export default TestPage;
