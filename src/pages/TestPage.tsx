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
  AlertCircle
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
}

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
      score: attemptedFirst ? mastery : undefined
    },
    {
      id: `${chapterId}-t2`,
      name: `${chapterName} - Practice Set 2`,
      questions: 25,
      duration: 50,
      marks: 100,
      attempted: false
    },
    {
      id: `${chapterId}-t3`,
      name: `${chapterName} - PYQ Chapter Test`,
      questions: 20,
      duration: 40,
      marks: 80,
      attempted: false
    }
  ];
};

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();

  // Dialog states
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showMixedSelect, setShowMixedSelect] = useState(false);
  const [showPYQSelect, setShowPYQSelect] = useState(false);
  const [activeTest, setActiveTest] = useState<TestConfig | null>(null);

  // Sidebar selection
  const [activeCategory, setActiveCategory] = useState<string>('physics-pyq');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pill filter: 'all' | 'available' | 'attempted'
  const [pillFilter, setPillFilter] = useState<'all' | 'available' | 'attempted'>('all');

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
    { id: 'ch-units', name: 'Units and Dimensions', mastery: 92, lastAttempt: '2 days ago', status: 'green' },
    { id: 'ch-kin-1d', name: 'Motion in One Dimension', mastery: 74, lastAttempt: '3 days ago', status: 'green' },
    { id: 'ch-kin-2d', name: 'Motion in Two Dimensions (Projectile)', mastery: 80, lastAttempt: '4 days ago', status: 'green' },
    { id: 'ch-nlm', name: 'Laws of Motion (NLM)', mastery: 63, lastAttempt: '5 days ago', status: 'yellow' },
    { id: 'ch-wep', name: 'Work Power Energy (WEP)', mastery: 61, lastAttempt: '1 week ago', status: 'yellow' },
    { id: 'ch-com', name: 'Center of Mass & Collisions', mastery: 52, lastAttempt: '2 weeks ago', status: 'yellow' },
    { 
      id: 'ch-rotation', 
      name: 'Rotational Motion', 
      mastery: 29, 
      lastAttempt: '1 day ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 18, recommendedNotes: 'Focus on Moment of Inertia, Angular Momentum Conservation, and Pure Rolling equations.' }
    },
    { id: 'ch-gravitation', name: 'Gravitation', mastery: 85, lastAttempt: '2 days ago', status: 'green' },
    { id: 'ch-solids', name: 'Mechanical Properties of Solids', mastery: 58, lastAttempt: '1 week ago', status: 'yellow' },
    { id: 'ch-fluids', name: 'Mechanical Properties of Fluids', mastery: 64, lastAttempt: '6 days ago', status: 'yellow' },
    { id: 'ch-ktg', name: 'Kinetic Theory of Gases (KTG)', mastery: 70, lastAttempt: '4 days ago', status: 'green' },
    { 
      id: 'ch-thermodynamics', 
      name: 'Thermodynamics (Physics)', 
      mastery: 41, 
      lastAttempt: '2 days ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 10, recommendedNotes: 'Revise Carnot Cycle efficiency, P-V graphs work calculations, and First Law applications.' }
    },
    { 
      id: 'ch-shm', 
      name: 'Simple Harmonic Motion (SHM)', 
      mastery: 44, 
      lastAttempt: '3 days ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 12, recommendedNotes: 'Revise Spring-Block systems, energy equations, and combination of springs.' }
    },
    { id: 'ch-waves', name: 'Waves and Sound', mastery: 55, lastAttempt: '2 weeks ago', status: 'yellow' },
    { 
      id: 'ch-electrostatics', 
      name: 'Electrostatics', 
      mastery: 43, 
      lastAttempt: '1 week ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 14, recommendedNotes: 'Focus on Gausss Law flux calculations, Electric Potential, and dipole field equations.' }
    },
    { id: 'ch-capacitance', name: 'Capacitors', mastery: 66, lastAttempt: '5 days ago', status: 'yellow' },
    { id: 'ch-current-elec', name: 'Current Electricity', mastery: 78, lastAttempt: '3 days ago', status: 'green' },
    { id: 'ch-magnetism', name: 'Magnetic Effects of Current', mastery: 53, lastAttempt: '1 week ago', status: 'yellow' },
    { id: 'ch-emi', name: 'Electromagnetic Induction (EMI)', mastery: 60, lastAttempt: '2 weeks ago', status: 'yellow' },
    { id: 'ch-ac', name: 'Alternating Current (AC)', mastery: 62, lastAttempt: '1 week ago', status: 'yellow' },
    { id: 'ch-ray-optics', name: 'Ray Optics & Instruments', mastery: 68, lastAttempt: '6 days ago', status: 'yellow' },
    { id: 'ch-wave-optics', name: 'Wave Optics (YDSE)', mastery: 50, lastAttempt: '2 weeks ago', status: 'yellow' },
    { id: 'ch-modern-phys', name: 'Modern Physics (Atoms & Nuclei)', mastery: 76, lastAttempt: '4 days ago', status: 'green' },
    { id: 'ch-semiconductors', name: 'Semiconductor Electronics', mastery: 88, lastAttempt: '2 days ago', status: 'green' }
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
    { id: 'ch-mole', name: 'Basic Concepts of Chemistry (Mole Concept)', mastery: 90, lastAttempt: '3 days ago', status: 'green' },
    { id: 'ch-atomic', name: 'Structure of Atom', mastery: 78, lastAttempt: '5 days ago', status: 'green' },
    { id: 'ch-bonding', name: 'Chemical Bonding & Molecular Structure', mastery: 65, lastAttempt: '1 week ago', status: 'yellow' },
    { 
      id: 'ch-chem-thermo', 
      name: 'Chemical Thermodynamics', 
      mastery: 35, 
      lastAttempt: '1 day ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 12, recommendedNotes: 'Focus on entropy calculations, Gibbs free energy criterion, and Hess Law application.' }
    },
    { id: 'ch-equilibrium', name: 'Chemical & Ionic Equilibrium', mastery: 58, lastAttempt: '2 weeks ago', status: 'yellow' },
    { id: 'ch-solutions', name: 'Solutions & Colligative Properties', mastery: 67, lastAttempt: '4 days ago', status: 'yellow' },
    { id: 'ch-electro', name: 'Electrochemistry', mastery: 72, lastAttempt: '5 days ago', status: 'green' },
    { id: 'ch-kinetics', name: 'Chemical Kinetics', mastery: 80, lastAttempt: '2 days ago', status: 'green' },
    { id: 'ch-periodic', name: 'Periodic Table & Periodicity', mastery: 85, lastAttempt: '3 days ago', status: 'green' },
    { id: 'ch-pblock', name: 'p-Block Elements', mastery: 50, lastAttempt: '2 weeks ago', status: 'yellow' },
    { id: 'ch-dfblock', name: 'd- and f-Block Elements', mastery: 61, lastAttempt: '1 week ago', status: 'yellow' },
    { id: 'ch-coordination', name: 'Coordination Compounds', mastery: 74, lastAttempt: '6 days ago', status: 'green' },
    { id: 'ch-goc', name: 'General Organic Chemistry (GOC)', mastery: 83, lastAttempt: '4 days ago', status: 'green' },
    { id: 'ch-hydrocarbons', name: 'Hydrocarbons', mastery: 69, lastAttempt: '5 days ago', status: 'yellow' },
    { id: 'ch-haloalkanes', name: 'Haloalkanes & Haloarenes', mastery: 71, lastAttempt: '1 week ago', status: 'green' },
    { id: 'ch-alcohols', name: 'Alcohols, Phenols & Ethers', mastery: 63, lastAttempt: '2 weeks ago', status: 'yellow' },
    { 
      id: 'ch-carbonyl', 
      name: 'Aldehydes, Ketones & Carboxylic Acids', 
      mastery: 48, 
      lastAttempt: '1 day ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 14, recommendedNotes: 'Practice Aldol condensation, Cannizzaro reactions, and nucleophilic addition mechanisms.' }
    },
    { id: 'ch-amines', name: 'Amines & Nitrogen Compounds', mastery: 75, lastAttempt: '3 days ago', status: 'green' },
    { id: 'ch-biomolecules', name: 'Biomolecules & Polymers', mastery: 91, lastAttempt: '2 days ago', status: 'green' }
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
      aiRecommendation: { lostMarks: 8, recommendedNotes: 'Focus on domains, range boundaries, periodic behavior, and inverse mappings.' }
    },
    { id: 'ch-quadratics', name: 'Complex Numbers & Quadratic Equations', mastery: 62, lastAttempt: '1 week ago', status: 'yellow' },
    { id: 'ch-matrices', name: 'Matrices and Determinants', mastery: 85, lastAttempt: '6 days ago', status: 'green' },
    { 
      id: 'ch-pc', 
      name: 'Permutations and Combinations (P&C)', 
      mastery: 45, 
      lastAttempt: '3 days ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 12, recommendedNotes: 'Focus on grid path models, circular arrangements, and inclusion-exclusion principles.' }
    },
    { id: 'ch-binomial', name: 'Binomial Theorem', mastery: 70, lastAttempt: '5 days ago', status: 'green' },
    { id: 'ch-series', name: 'Sequence and Series (AP & GP)', mastery: 88, lastAttempt: '2 days ago', status: 'green' },
    { id: 'ch-lcd', name: 'Limits, Continuity & Differentiability', mastery: 68, lastAttempt: '4 days ago', status: 'yellow' },
    { id: 'ch-aod', name: 'Application of Derivatives (AOD)', mastery: 53, lastAttempt: '1 week ago', status: 'yellow' },
    { 
      id: 'ch-integration', 
      name: 'Indefinite & Definite Integration', 
      mastery: 49, 
      lastAttempt: '2 days ago', 
      status: 'red',
      aiRecommendation: { lostMarks: 16, recommendedNotes: 'Practice definite integration properties, reduction formulas, and integration by parts.' }
    },
    { id: 'ch-diff-eq', name: 'Differential Equations', mastery: 61, lastAttempt: '2 weeks ago', status: 'yellow' },
    { id: 'ch-lines', name: 'Straight Lines', mastery: 78, lastAttempt: '1 week ago', status: 'green' },
    { id: 'ch-circles', name: 'Circles', mastery: 64, lastAttempt: '5 days ago', status: 'yellow' },
    { id: 'ch-conics', name: 'Conic Sections (Parabola, Ellipse, Hyperbola)', mastery: 58, lastAttempt: '2 weeks ago', status: 'yellow' },
    { id: 'ch-vectors', name: 'Vector Algebra', mastery: 81, lastAttempt: '4 days ago', status: 'green' },
    { id: 'ch-3d', name: 'Three Dimensional Geometry (3D)', mastery: 75, lastAttempt: '3 days ago', status: 'green' },
    { id: 'ch-probability', name: 'Probability', mastery: 50, lastAttempt: '1 week ago', status: 'yellow' },
    { id: 'ch-trig', name: 'Trigonometric Functions & Equations', mastery: 72, lastAttempt: '2 weeks ago', status: 'green' },
    { id: 'ch-itf', name: 'Inverse Trigonometric Functions (ITF)', mastery: 67, lastAttempt: '1 week ago', status: 'yellow' }
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
      tests: [
        { id: 't-part11-1', name: 'Class 11 Part Test (QPT-1) - PCM', questions: 75, duration: 150, marks: 300, attempted: true, score: 165 },
        { id: 't-part11-2', name: 'Class 11 Part Test (QPT-2) - Mechanics Focus', questions: 45, duration: 90, marks: 180, attempted: false }
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
      tests: [
        { id: 't-full-1', name: 'Full Mock Test 1 (Closest to Real Exam)', questions: 90, duration: 180, marks: 300, attempted: true, score: 147 },
        { id: 't-full-2', name: 'Full Mock Test 2 (Advanced Traps)', questions: 90, duration: 180, marks: 300, attempted: false },
        { id: 't-full-3', name: 'Full Mock Test 3 (High Weightage Focus)', questions: 90, duration: 180, marks: 300, attempted: false }
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
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    if (activeCategory.includes('pyq')) return '📚 Previous Year Questions (PYQs)';
    if (activeCategory.includes('topic')) return '🎯 Topic & Chapter Mocks';
    if (activeCategory === 'part-test') return '🏆 Part Mocks (QPT)';
    return '🏆 Full Syllabus Mocks (QFT)';
  };

  const getSubjectEmoji = (cat: string) => {
    if (cat.includes('physics')) return '⚛';
    if (cat.includes('chemistry')) return '🧪';
    return '📐';
  };

  const getSubjectLabel = (cat: string) => {
    if (cat.includes('physics')) return 'Physics';
    if (cat.includes('chemistry')) return 'Chemistry';
    return 'Mathematics';
  };

  if (activeTest) {
    return (
      <MainLayout title="Test Arena">
        <TestExecution config={activeTest} onComplete={handleTestComplete} onExit={handleTestComplete} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Test Library">
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
        
        {/* ========================================================================= */}
        {/* HEADER GREETINGS                                                          */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-3xl font-display font-black text-white tracking-tight flex items-center gap-2">
              Ready for today's test?
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Attempt mock test sets, review score masteries, and resolve concept point leakages.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs text-slate-400 font-medium">
              Next Live Mock Paper: <span className="font-bold text-white">Sunday 9:00 AM</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SIDEBAR & DIRECTORY GRID LAYOUT                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: QUIZRR-STYLE VERTICAL SIDEBAR MENU */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* 1. PYQ categories */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block pl-2 mb-1.5">
                PYQ as Chapter-wise Tests
              </span>
              {[
                { id: 'physics-pyq', label: 'Physics PYQ', icon: '⚛' },
                { id: 'chemistry-pyq', label: 'Chemistry PYQ', icon: '🧪' },
                { id: 'maths-pyq', label: 'Mathematics PYQ', icon: '📐' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveCategory(item.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-between",
                    activeCategory === item.id 
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-350 shadow-md" 
                      : "bg-slate-955 border-slate-900 text-slate-400 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded">
                    Free
                  </span>
                </button>
              ))}
            </div>

            {/* 2. Mock exam categories */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block pl-2 mb-1.5">
                Mock Exams
              </span>
              {[
                { id: 'part-test', label: 'Part Tests (QPT)', icon: '🏆' },
                { id: 'full-mock', label: 'Full Syllabus Mock (QFT)', icon: '🏛' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveCategory(item.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-between",
                    activeCategory === item.id 
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-350 shadow-md" 
                      : "bg-slate-955 border-slate-900 text-slate-400 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>

            {/* 3. Topic mocks categories */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block pl-2 mb-1.5">
                Topic & Chapter Mocks
              </span>
              {[
                { id: 'physics-topic', label: 'Physics', icon: '⚛' },
                { id: 'chemistry-topic', label: 'Chemistry', icon: '🧪' },
                { id: 'maths-topic', label: 'Mathematics', icon: '📐' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveCategory(item.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-between",
                    activeCategory === item.id 
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-350 shadow-md" 
                      : "bg-slate-955 border-slate-900 text-slate-400 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: CHAPTER ACCORDIONS DIRECTORY */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Selected category overview card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-955 via-[#0a0e1c] to-slate-955 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {getCategoryTitle()}
                </div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span className="text-indigo-400">{getSubjectEmoji(activeCategory)}</span>
                  {activeCategory.includes('part') || activeCategory.includes('full') 
                    ? 'JEE Syllabus Level Assessments' 
                    : `${getSubjectLabel(activeCategory)} Core Syllabus`}
                </h2>
              </div>

              <div className="flex gap-4 border-l border-slate-800/80 pl-6 text-xs shrink-0">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Mocks</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activeCategorySummary.totalTests} Sets</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Attempts</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{activeCategorySummary.completed} Completed</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Mastery</div>
                  <div className="text-sm font-bold text-indigo-400 mt-0.5">{activeCategorySummary.mastery}%</div>
                </div>
              </div>
            </div>

            {/* Pill toggles & search bar row */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-850 self-start">
                {[
                  { id: 'all', label: 'All Chapters' },
                  { id: 'available', label: 'Available' },
                  { id: 'attempted', label: 'Attempted' }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setPillFilter(pill.id as any)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                      pillFilter === pill.id 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-955 border border-slate-850 rounded-xl text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

            </div>

            {/* Chapter list directory */}
            <div className="space-y-3">
              {filteredChapters.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 border border-slate-900 rounded-2xl text-slate-500 text-xs">
                  No matching chapters found.
                </div>
              ) : (
                filteredChapters.map((chapter) => {
                  const isExpanded = expandedChapterId === chapter.id;
                  
                  return (
                    <div 
                      key={chapter.id}
                      className={cn(
                        "rounded-xl border transition-all duration-300 overflow-hidden bg-slate-955/40",
                        isExpanded ? "border-indigo-500/25 shadow-md" : "border-slate-850 hover:border-slate-800"
                      )}
                    >
                      <div
                        onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                        className="w-full p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            chapter.status === 'green' ? "bg-emerald-500" : chapter.status === 'yellow' ? "bg-amber-450" : "bg-rose-500"
                          )} />
                          <div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                              {chapter.name}
                            </h3>
                            <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                              <span>Tests: {chapter.testsCount}</span>
                              <span>PYQs: {chapter.pyqsCount}</span>
                              <span>Last Attempt: {chapter.lastAttempt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Chapter Mastery</span>
                            <span className={cn(
                              "text-xs font-black",
                              chapter.status === 'green' ? "text-emerald-400" : chapter.status === 'yellow' ? "text-amber-400" : "text-rose-400"
                            )}>
                              {chapter.mastery}%
                            </span>
                          </div>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Accordion expanded test sets */}
                      {isExpanded && (
                        <div className="p-4 bg-black/25 border-t border-slate-900 space-y-4">
                          
                          {/* Syllabus progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              <span>Chapter Syllabus Progress</span>
                              <span>{Math.round((chapter.tests.filter(t => t.attempted).length / chapter.tests.length) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-905 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div 
                                className="bg-indigo-500 h-full rounded-full transition-all duration-700" 
                                style={{ width: `${(chapter.tests.filter(t => t.attempted).length / chapter.tests.length) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Weakness Alert Recommendation */}
                          {chapter.aiRecommendation && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-[#1c1212] to-slate-950 border border-red-500/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-1">
                                <h4 className="text-xs font-black text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                                  <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                                  AI Marks Recovery Suggestion
                                </h4>
                                <p className="text-xs text-slate-350 leading-relaxed">
                                  You lost <strong className="text-white">{chapter.aiRecommendation.lostMarks} marks</strong> from {chapter.name} in the last 3 syllabus mocks.
                                </p>
                                <p className="text-[11px] text-slate-450 leading-relaxed italic">
                                  {chapter.aiRecommendation.recommendedNotes}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleStartRecoveryPack(chapter)}
                                className="bg-red-650 hover:bg-red-750 text-white font-bold text-xs px-4 py-2.5 rounded-lg shrink-0"
                              >
                                Start Recovery Pack
                              </Button>
                            </div>
                          )}

                          {/* List of sets */}
                          <div className="space-y-2">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block pl-1">
                              Available Test Sets
                            </span>
                            {chapter.tests.map((test) => (
                              <div 
                                key={test.id}
                                className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                              >
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                                    {test.name}
                                  </h4>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>Questions: {test.questions} Qs</span>
                                    <span>Duration: {test.duration} Mins</span>
                                    <span>Total Marks: {test.marks}</span>
                                    {test.attempted && (
                                      <span className="text-emerald-400 flex items-center gap-1">
                                        ✓ Attempted ({test.score}% score)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2 self-stretch sm:self-auto justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleViewSyllabus(test, chapter)}
                                    className="bg-slate-900 border-slate-800 text-slate-400 hover:text-white font-bold text-[10px] px-3.5 py-1.5 h-auto rounded-lg uppercase tracking-wider"
                                  >
                                    View Syllabus
                                  </Button>
                                  <Button
                                    onClick={() => handleStartTestSet(test, chapter)}
                                    className="bg-indigo-650 hover:bg-indigo-750 text-white font-black text-[10px] px-4 py-1.5 h-auto rounded-lg uppercase tracking-wider"
                                  >
                                    Attempt Test
                                  </Button>
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

        </div>

      </div>

      {/* SYLLABUS MODAL */}
      {syllabusModalText && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-955 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-indigo-400">
              <Info className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Test Syllabus & Coverage</h3>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed">
              {syllabusModalText}
            </p>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSyllabusModalText(null)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-wider"
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
    </MainLayout>
  );
};

export default TestPage;
