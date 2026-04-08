import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle, XCircle, RefreshCw, Save,
  ChevronDown, ChevronUp, Eye, EyeOff, ShieldCheck,
  BookOpen, Zap, AlertTriangle, Filter, Download,
  ClipboardCheck, BarChart2, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────
interface GeneratedQuestion {
  question_id:            string;
  exam:                   string;
  section:                string;
  subject:                string;
  ncert_class:            number;
  ncert_chapter:          string;
  ncert_chapter_number:   number;
  topic:                  string;
  subtopic:               string;
  difficulty:             'Easy' | 'Medium' | 'Hard';
  question_type:          string;
  exam_stage:             string;
  question_text:          string;
  options:                Record<string, string>;
  correct_option:         string;
  explanation:            { short: string; detailed_steps: string[]; ncert_reference: string };
  distractor_logic:       Record<string, string>;
  tags:                   string[];
  estimated_time_seconds: number;
  pyq_similar:            boolean;
  pyq_year_reference:     string | null;
  is_verified?:           boolean;
  _quality:               {
    passed:                boolean;
    uniqueness:            boolean;
    answer_verified:       boolean;
    ncert_aligned:         boolean;
    distractor_quality:    boolean;
    language_standard:     boolean;
    difficulty_calibrated: boolean;
    notes:                 string[];
  };
  _saved:                 boolean;
  _attempt:               number;
  _approved?:             boolean;
  _rejected?:             boolean;
}

// ─── Static config ─────────────────────────────────────────────
const EXAM_SUBJECTS: Record<string, { class11: string[]; class12: string[] }> = {
  CUET: {
    class11: ['Physics','Chemistry','Mathematics','Biology','Accountancy','Business Studies','Economics','History','Political Science','Geography','Psychology','General Test'],
    class12: ['Physics','Chemistry','Mathematics','Biology','Accountancy','Business Studies','Economics','History','Political Science','Geography','Psychology'],
  },
  JEE_MAINS: { class11: ['Physics','Chemistry','Mathematics'], class12: ['Physics','Chemistry','Mathematics'] },
  NEET:      { class11: ['Physics','Chemistry','Biology'],     class12: ['Physics','Chemistry','Biology'] },
};

const NCERT_CHAPTERS: Record<string, Record<number, string[]>> = {
  Physics: {
    11: ['Physical World','Units & Measurement','Motion in a Straight Line','Motion in a Plane','Laws of Motion','Work, Energy & Power','System of Particles & Rotational Motion','Gravitation','Mechanical Properties of Solids','Mechanical Properties of Fluids','Thermal Properties of Matter','Thermodynamics','Kinetic Theory','Oscillations','Waves'],
    12: ['Electric Charges & Fields','Electrostatic Potential & Capacitance','Current Electricity','Moving Charges & Magnetism','Magnetism & Matter','Electromagnetic Induction','Alternating Current','Electromagnetic Waves','Ray Optics','Wave Optics','Dual Nature of Radiation & Matter','Atoms','Nuclei','Semiconductor Electronic Devices','Communication Systems'],
  },
  Chemistry: {
    11: ['Basic Concepts of Chemistry','Structure of Atom','Classification of Elements','Chemical Bonding & Molecular Structure','States of Matter','Thermodynamics','Equilibrium','Redox Reactions','Hydrogen','s-Block Elements','p-Block Elements','Organic Chemistry — Basic Principles','Hydrocarbons','Environmental Chemistry'],
    12: ['Solid State','Solutions','Electrochemistry','Chemical Kinetics','Surface Chemistry','General Principles of Isolation','p-Block Elements','d & f Block Elements','Coordination Compounds','Haloalkanes & Haloarenes','Alcohols Phenols & Ethers','Aldehydes Ketones & Carboxylic Acids','Amines','Biomolecules','Polymers','Chemistry in Everyday Life'],
  },
  Mathematics: {
    11: ['Sets','Relations & Functions','Trigonometric Functions','Complex Numbers & Quadratic Equations','Linear Inequalities','Permutations & Combinations','Binomial Theorem','Sequences & Series','Straight Lines','Conic Sections','Introduction to 3D Geometry','Limits & Derivatives','Statistics','Probability'],
    12: ['Relations & Functions','Inverse Trigonometric Functions','Matrices','Determinants','Continuity & Differentiability','Application of Derivatives','Integrals','Application of Integrals','Differential Equations','Vector Algebra','3D Geometry','Linear Programming','Probability'],
  },
  Biology: {
    11: ['Living World','Biological Classification','Plant Kingdom','Animal Kingdom','Morphology of Flowering Plants','Anatomy of Flowering Plants','Structural Organisation in Animals','Cell: The Unit of Life','Biomolecules','Cell Cycle & Division','Transport in Plants','Mineral Nutrition','Photosynthesis','Respiration in Plants','Plant Growth & Development','Digestion & Absorption','Breathing & Exchange of Gases','Body Fluids & Circulation','Excretory Products','Locomotion & Movement','Neural Control','Chemical Coordination'],
    12: ['Reproduction in Organisms','Sexual Reproduction in Flowering Plants','Human Reproduction','Reproductive Health','Principles of Inheritance','Molecular Basis of Inheritance','Evolution','Human Health & Disease','Strategies for Enhancement in Food Production','Microbes in Human Welfare','Biotechnology: Principles & Processes','Biotechnology & its Applications','Organisms & Populations','Ecosystem','Biodiversity & Conservation','Environmental Issues'],
  },
  Accountancy: {
    11: ['Introduction to Accounting','Theory Base of Accounting','Recording Transactions','Trial Balance & Errors','Depreciation, Provisions & Reserves','Bills of Exchange','Financial Statements: Non-Manufacturing','Accounts from Incomplete Records','Computers in Accounting'],
    12: ['Accounting for Partnership: Basic Concepts','Change in Profit Sharing Ratio','Admission of Partner','Retirement/Death of Partner','Dissolution of Partnership','Accounting for Share Capital','Issue & Redemption of Debentures','Financial Statements of a Company','Analysis of Financial Statements','Accounting Ratios','Cash Flow Statement'],
  },
  'Business Studies': {
    11: ['Business, Trade & Commerce','Forms of Business Organisation','Public, Private & Global Enterprises','Business Services','Emerging Modes of Business','Social Responsibility','Formation of a Company','Sources of Business Finance','Small Business','Internal Trade','International Business'],
    12: ['Nature & Significance of Management','Principles of Management','Business Environment','Planning','Organising','Staffing','Directing','Controlling','Financial Management','Financial Markets','Marketing','Consumer Protection'],
  },
  Economics: {
    11: ['Introduction (Micro)','Consumer Equilibrium & Demand','Production & Costs','Theory of Firm Under Perfect Competition','Market Equilibrium','Non-Competitive Markets','Introduction (Macro)','National Income Accounting','Money & Banking','Income Determination','Government Budget & Economy','Open Economy Macroeconomics'],
    12: ['Introduction (Micro)','Consumer Equilibrium & Demand','Producer Behaviour & Supply','Forms of Market','Price Determination','Open Economy Macroeconomics','National Income','Money & Banking','Government Budget','Balance of Payments'],
  },
  History: {
    11: [],
    12: ['Bricks, Beads & Bones (Harappan Civilisation)','Kings, Farmers & Towns (Early States)','Kinship, Caste & Class','Thinkers, Beliefs & Buildings','Through the Eyes of Travellers','Bhakti-Sufi Traditions','An Imperial Capital: Vijayanagara','Peasants, Zamindars & the State','Kings & Chronicles (Mughal Court)','Colonialism & the Countryside','Rebels & the Raj (1857)','Colonial Cities','Mahatma Gandhi & the National Movement','Understanding Partition','Framing the Constitution'],
  },
};

const QUESTION_TYPES = ['TYPE_A','TYPE_B','TYPE_C','TYPE_D','TYPE_E','TYPE_F'];
const DIFFICULTY_LABELS: Record<string, string> = { Easy: '🟢 Easy', Medium: '🟡 Medium', Hard: '🔴 Hard' };
const TYPE_LABELS: Record<string, string> = {
  TYPE_A: 'TYPE_A — Factual', TYPE_B: 'TYPE_B — Statement', TYPE_C: 'TYPE_C — Match',
  TYPE_D: 'TYPE_D — A/R', TYPE_E: 'TYPE_E — Numeric', TYPE_F: 'TYPE_F — Comprehension',
};
const DIFF_COLORS: Record<string, string> = {
  Easy:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard:   'bg-red-500/10 text-red-400 border-red-500/20',
};

// ─── Question Card Component ──────────────────────────────────
const QuestionCard: React.FC<{
  q: GeneratedQuestion;
  index: number;
  onApprove: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  onVerify: () => void;
  savingId: string | null;
}> = ({ q, index, onApprove, onReject, onRegenerate, onVerify, savingId }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDistractor, setShowDistractor] = useState(false);

  const gate = q._quality;
  const allPass = gate.passed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card border rounded-2xl overflow-hidden',
        q._approved ? 'border-emerald-500/40' :
        q._rejected ? 'border-red-500/20 opacity-50' :
        allPass ? 'border-border' : 'border-amber-500/30'
      )}>

      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        <span className="text-xs font-mono text-muted-foreground mt-0.5 flex-shrink-0">
          #{index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded border', DIFF_COLORS[q.difficulty])}>
              {DIFFICULTY_LABELS[q.difficulty]}
            </span>
            <span className="text-xs px-2 py-0.5 bg-secondary/50 border border-border rounded text-muted-foreground">
              {TYPE_LABELS[q.question_type] || q.question_type}
            </span>
            {q.pyq_similar && (
              <span className="text-xs px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded">
                PYQ {q.pyq_year_reference}
              </span>
            )}
            {q._approved && (
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-bold">
                ✅ Approved
              </span>
            )}
            {q.is_verified && (
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded font-bold">
                🔵 Verified
              </span>
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed font-medium">{q.question_text}</p>
          <p className="text-xs text-muted-foreground mt-1">{q.ncert_chapter} · {q.topic} · ⏱ {q.estimated_time_seconds}s</p>
        </div>

        {/* Quality gate badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {allPass
            ? <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Gate ✓</span>
            : <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Gate ✗</span>
          }
          <button onClick={() => setExpanded(e => !e)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-border">
            <div className="p-4 space-y-4">

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['A','B','C','D'].map(opt => (
                  <div key={opt}
                    className={cn('flex items-start gap-2 p-2.5 rounded-xl border text-sm',
                      opt === q.correct_option
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-secondary/30 border-border text-muted-foreground'
                    )}>
                    <span className={cn('font-bold text-xs flex-shrink-0',
                      opt === q.correct_option ? 'text-emerald-400' : 'text-muted-foreground')}>
                      {opt}.
                    </span>
                    <span>{q.options[opt]}</span>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="bg-secondary/20 border border-border rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Explanation</p>
                <p className="text-sm text-foreground">{q.explanation?.short}</p>
                {q.explanation?.detailed_steps?.length > 0 && (
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    {q.explanation.detailed_steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                )}
                {q.explanation?.ncert_reference && (
                  <p className="text-xs text-violet-400">📖 {q.explanation.ncert_reference}</p>
                )}
              </div>

              {/* Distractor logic toggle */}
              <div>
                <button onClick={() => setShowDistractor(d => !d)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  {showDistractor ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showDistractor ? 'Hide' : 'Show'} distractor logic
                </button>
                {showDistractor && q.distractor_logic && (
                  <div className="mt-2 space-y-1.5">
                    {Object.entries(q.distractor_logic).map(([opt, reason]) => (
                      <div key={opt} className="text-xs bg-red-500/5 border border-red-500/10 rounded-lg p-2">
                        <span className="font-bold text-red-400">Option {opt}:</span>{' '}
                        <span className="text-muted-foreground">{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality gate detail */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {([
                  ['uniqueness', 'Unique'],
                  ['answer_verified', 'Answer ✓'],
                  ['ncert_aligned', 'NCERT ✓'],
                  ['distractor_quality', 'Distractors ✓'],
                  ['language_standard', 'Language ✓'],
                  ['difficulty_calibrated', 'Difficulty ✓'],
                ] as [keyof typeof gate, string][]).map(([key, label]) => (
                  <div key={key} className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-lg',
                    gate[key] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                    {gate[key] ? '✓' : '✗'} {label}
                  </div>
                ))}
              </div>
              {gate.notes.length > 0 && (
                <div className="space-y-1">
                  {gate.notes.map((n, i) => (
                    <p key={i} className="text-xs text-amber-400 bg-amber-500/5 rounded px-2 py-1">{n}</p>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {q.tags?.map(t => (
                  <span key={t} className="text-xs px-1.5 py-0.5 bg-secondary/50 rounded text-muted-foreground">#{t}</span>
                ))}
              </div>

              {/* ID */}
              <p className="text-xs font-mono text-muted-foreground/50">{q.question_id}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {!q._rejected && (
        <div className="border-t border-border px-4 py-3 flex flex-wrap items-center gap-2 bg-card">
          {!q._approved ? (
            <>
              <Button size="sm" onClick={onApprove}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" /> Approve & Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onRegenerate}
                className="text-xs h-7 border border-border">
                <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
              </Button>
              <Button size="sm" variant="ghost" onClick={onReject}
                className="text-xs h-7 text-red-400 hover:text-red-300">
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onVerify} disabled={q.is_verified || savingId === q.question_id}
              className={cn('h-7 text-xs', q.is_verified ? 'bg-blue-600' : 'bg-secondary border border-border hover:bg-secondary/80')}>
              <ShieldCheck className="w-3 h-3 mr-1" />
              {q.is_verified ? 'Human Verified ✓' : 'Mark as Verified'}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────
const QuestionGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Admin guard
  React.useEffect(() => {
    if (profile && profile.user_type !== 'admin' && profile.user_type !== 'b2b_mentor') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // ─ Form state ─
  const [exam,     setExam]     = useState('CUET');
  const [ncertClass, setNcertClass] = useState<11|12>(11);
  const [subject,  setSubject]  = useState('Physics');
  const [chapter,  setChapter]  = useState('');
  const [topic,    setTopic]    = useState('');
  const [count,    setCount]    = useState(5);
  const [examStage, setExamStage] = useState('practice');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['TYPE_A','TYPE_B','TYPE_D']);
  const [diffMix,  setDiffMix]  = useState({ Easy: 40, Medium: 45, Hard: 15 });

  // ─ Results state ─
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ requested: number; passed: number; saved: number } | null>(null);
  const [filterType, setFilterType]  = useState<string>('all');
  const [filterDiff, setFilterDiff]  = useState<string>('all');

  const subjects = [...(EXAM_SUBJECTS[exam]?.class11 || []), ...(EXAM_SUBJECTS[exam]?.class12 || [])];
  const uniqueSubjects = [...new Set(subjects)];
  const chapters = (NCERT_CHAPTERS[subject]?.[ncertClass] || []);

  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  // ─── Generate ─────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!chapter) { toast.error('Select a chapter'); return; }
    if (diffMix.Easy + diffMix.Medium + diffMix.Hard !== 100) {
      toast.error('Difficulty mix must add up to 100%');
      return;
    }

    setGenerating(true);
    setQuestions([]);
    setStats(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const chapterIdx = chapters.indexOf(chapter) + 1;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cuet-questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            exam,
            subject,
            chapter,
            topic: topic || null,
            ncert_class: ncertClass,
            ncert_chapter_number: chapterIdx,
            difficulty_mix: diffMix,
            question_types: selectedTypes.length > 0 ? selectedTypes : undefined,
            count,
            exam_stage: examStage,
            save_to_db: true,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.questions) {
        throw new Error(data.error || 'Generation failed');
      }

      setQuestions(data.questions.map((q: any) => ({ ...q, _approved: q._saved, _rejected: false })));
      setStats({ requested: data.requested, passed: data.passed, saved: data.saved });
      toast.success(`Generated ${data.passed} questions (${data.saved} saved to DB)`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate questions');
    }

    setGenerating(false);
  };

  // ─── Approve (save) one question ─────────────────────────
  const handleApprove = useCallback(async (q: GeneratedQuestion, idx: number) => {
    setSavingId(q.question_id);
    try {
      const { error } = await (supabase.from as any)('questions_bank').upsert(
        {
          question_id:           q.question_id,
          exam:                  q.exam,
          section:               q.section ?? 'Domain',
          subject:               q.subject,
          ncert_class:           q.ncert_class,
          ncert_chapter:         q.ncert_chapter,
          ncert_chapter_number:  q.ncert_chapter_number,
          topic:                 q.topic,
          subtopic:              q.subtopic,
          difficulty:            q.difficulty,
          question_type:         q.question_type,
          exam_stage:            q.exam_stage,
          question_text:         q.question_text,
          options:               q.options,
          correct_option:        q.correct_option,
          explanation:           q.explanation,
          distractor_logic:      q.distractor_logic,
          tags:                  q.tags ?? [],
          estimated_time_seconds: q.estimated_time_seconds,
          pyq_similar:           q.pyq_similar,
          pyq_year_reference:    q.pyq_year_reference,
          quality_gate_passed:   true,
          is_verified:           false,
        },
        { onConflict: 'question_id' }
      );
      if (error) throw error;
      setQuestions(prev => prev.map((x, i) => i === idx ? { ...x, _approved: true } : x));
      toast.success('Question saved to question bank!');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    }
    setSavingId(null);
  }, []);

  // ─── Reject one question ─────────────────────────────────
  const handleReject = (idx: number) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, _rejected: true } : q));
  };

  // ─── Regenerate one question ──────────────────────────────
  const handleRegenerate = async (idx: number) => {
    const q = questions[idx];
    setSavingId(q.question_id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cuet-questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            exam, subject, chapter, topic: topic || null,
            ncert_class: ncertClass,
            difficulty_mix: { [q.difficulty]: 100, Easy: 0, Medium: 0, Hard: 0 },
            question_types: [q.question_type],
            count: 1,
            exam_stage: examStage,
            save_to_db: false,
          }),
        }
      );
      const data = await res.json();
      const newQ = data.questions?.[0];
      if (newQ) {
        setQuestions(prev => prev.map((x, i) => i === idx ? { ...newQ, _approved: false, _rejected: false } : x));
        toast.success('Question regenerated');
      } else {
        toast.error('Regeneration failed');
      }
    } catch { toast.error('Regeneration failed'); }
    setSavingId(null);
  };

  // ─── Mark as human-verified ───────────────────────────────
  const handleVerify = async (q: GeneratedQuestion, idx: number) => {
    setSavingId(q.question_id);
    try {
      const { error } = await (supabase.from as any)('questions_bank')
        .update({ is_verified: true })
        .eq('question_id', q.question_id);
      if (error) throw error;
      setQuestions(prev => prev.map((x, i) => i === idx ? { ...x, is_verified: true } : x));
      toast.success('Marked as human verified!');
    } catch { toast.error('Verify failed'); }
    setSavingId(null);
  };

  // ─── Bulk approve all passing questions ───────────────────
  const handleBulkApprove = async () => {
    const toApprove = questions.filter(q => q._quality.passed && !q._approved && !q._rejected);
    if (toApprove.length === 0) { toast.info('No passing questions to approve'); return; }

    toast.info(`Saving ${toApprove.length} questions...`);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q._quality.passed && !q._approved && !q._rejected) {
        await handleApprove(q, i);
      }
    }
    toast.success(`Bulk approved ${toApprove.length} questions`);
  };

  const filteredQs = questions.filter(q => {
    if (filterType !== 'all' && q.question_type !== filterType) return false;
    if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
    return true;
  });

  const approvedCount = questions.filter(q => q._approved).length;
  const rejectedCount = questions.filter(q => q._rejected).length;
  const passingCount  = questions.filter(q => q._quality.passed).length;

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl tracking-tighter">SETU.</span>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10
              border border-orange-500/20 px-2 py-0.5 rounded-full">Question Generator</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/qc')}>QC Panel</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teacher-dashboard')}>← Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* ── Left: Form ── */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-foreground">Generate Questions</h2>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Exam</label>
              <select value={exam} onChange={e => setExam(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent">
                <option value="CUET">CUET (UG)</option>
                <option value="JEE_MAINS">JEE Mains</option>
                <option value="NEET">NEET</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">NCERT Class</label>
              <div className="flex gap-2">
                {[11, 12].map(c => (
                  <button key={c} onClick={() => setNcertClass(c as 11|12)}
                    className={cn('flex-1 py-2 rounded-xl border text-sm font-bold transition-all',
                      ncertClass === c ? 'bg-accent text-black border-accent' : 'border-border text-muted-foreground hover:border-accent/50')}>
                    Class {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Subject</label>
              <select value={subject} onChange={e => { setSubject(e.target.value); setChapter(''); }}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent">
                {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Chapter</label>
              <select value={chapter} onChange={e => setChapter(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent">
                <option value="">Select chapter...</option>
                {chapters.map((ch, i) => <option key={ch} value={ch}>Ch {i+1}: {ch}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Topic (optional)</label>
              <input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Equations of Motion"
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Exam Stage</label>
              <select value={examStage} onChange={e => setExamStage(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent">
                <option value="practice">Practice</option>
                <option value="chapter_test">Chapter Test</option>
                <option value="mock_test">Mock Test</option>
                <option value="pyq_style">PYQ Style ⚡</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Question Types</label>
              <div className="flex flex-wrap gap-1.5">
                {QUESTION_TYPES.map(t => (
                  <button key={t} onClick={() => toggleType(t)}
                    className={cn('text-xs px-2 py-1 rounded-lg border transition-all',
                      selectedTypes.includes(t) ? 'bg-accent text-black border-accent' : 'border-border text-muted-foreground hover:border-accent/50')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Difficulty Mix (%)</label>
              <div className="space-y-2">
                {(['Easy','Medium','Hard'] as const).map(d => (
                  <div key={d} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-14">{d}</span>
                    <input type="range" min={0} max={100} value={diffMix[d]}
                      onChange={e => setDiffMix(prev => ({ ...prev, [d]: parseInt(e.target.value) }))}
                      className="flex-1 accent-orange-400" />
                    <span className={cn('text-xs font-mono w-8 text-right font-bold',
                      d === 'Easy' ? 'text-emerald-400' : d === 'Medium' ? 'text-amber-400' : 'text-red-400')}>
                      {diffMix[d]}%
                    </span>
                  </div>
                ))}
                <p className={cn('text-xs', diffMix.Easy + diffMix.Medium + diffMix.Hard === 100 ? 'text-emerald-400' : 'text-red-400')}>
                  Total: {diffMix.Easy + diffMix.Medium + diffMix.Hard}% {diffMix.Easy + diffMix.Medium + diffMix.Hard !== 100 ? '⚠️ must be 100%' : '✓'}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Count (max 20)</label>
              <input type="number" min={1} max={20} value={count}
                onChange={e => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>

            <Button onClick={handleGenerate} disabled={generating || !chapter}
              className="w-full bg-accent text-black h-12 font-bold">
              {generating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Generate {count} Questions
                </span>
              )}
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-accent" /> Batch Stats
              </h3>
              {[
                { label: 'Requested', value: stats.requested, color: 'text-foreground' },
                { label: 'Passed Gate', value: passingCount, color: 'text-emerald-400' },
                { label: 'Saved to DB', value: stats.saved, color: 'text-blue-400' },
                { label: 'Approved', value: approvedCount, color: 'text-emerald-400' },
                { label: 'Rejected', value: rejectedCount, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className={cn('font-bold', s.color)}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── Right: Results ── */}
        <main className="flex-1 space-y-4 min-w-0">
          {questions.length > 0 && (
            <>
              {/* Controls bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">
                  {filteredQs.length} of {questions.length} questions
                </span>
                <div className="flex gap-1 ml-auto">
                  <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
                    className="text-xs bg-secondary/50 border border-border rounded-lg px-2 py-1.5 focus:outline-none">
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="text-xs bg-secondary/50 border border-border rounded-lg px-2 py-1.5 focus:outline-none">
                    <option value="all">All Types</option>
                    {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Button onClick={handleBulkApprove} size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs">
                    <ClipboardCheck className="w-3 h-3 mr-1" />
                    Bulk Approve ({passingCount - approvedCount})
                  </Button>
                </div>
              </div>

              {/* Question cards */}
              <div className="space-y-3">
                {filteredQs.map((q, i) => (
                  <QuestionCard
                    key={q.question_id + i}
                    q={q}
                    index={i}
                    savingId={savingId}
                    onApprove={() => handleApprove(q, questions.indexOf(q))}
                    onReject={() => handleReject(questions.indexOf(q))}
                    onRegenerate={() => handleRegenerate(questions.indexOf(q))}
                    onVerify={() => handleVerify(q, questions.indexOf(q))}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!generating && questions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Configure the exam, subject, and chapter on the left, then click Generate.
                Every question goes through a 6-point quality gate before saving.
              </p>
            </div>
          )}

          {/* Loading state */}
          {generating && (
            <div className="space-y-3">
              {Array(count).fill(0).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              ))}
              <p className="text-center text-sm text-muted-foreground animate-pulse">
                🧠 Claude is generating {count} CUET-quality questions...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default QuestionGeneratorPage;
