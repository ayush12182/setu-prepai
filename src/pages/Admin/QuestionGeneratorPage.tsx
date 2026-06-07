import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle, XCircle, RefreshCw, Save,
  ChevronDown, ChevronUp, Eye, EyeOff, ShieldCheck,
  BookOpen, Zap, AlertTriangle, Filter, Download,
  ClipboardCheck, BarChart2, Layers, Upload, FileText, Edit3
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

// Helper to load external scripts dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
};

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

// ─── AI Question Card Component ───────────────────────────────
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

// ─── PDF Parsed Question Card Component ────────────────────────
const ParsedPdfQuestionCard: React.FC<{
  q: any;
  index: number;
  onVerify: () => void;
  onDiscard: () => void;
  onUpdate: (updatedQ: any, index: number) => void;
  savingId: string | null;
}> = ({ q, index, onVerify, onDiscard, onUpdate, savingId }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Helper to convert options (which might be array, object or separate fields) into a clean array of 4 strings
  const getOptionsArray = useCallback((optionsVal: any, item: any): string[] => {
    if (Array.isArray(optionsVal)) {
      return [...optionsVal];
    }
    if (optionsVal && typeof optionsVal === 'object') {
      return [
        optionsVal.A || optionsVal['0'] || item.option_a || '',
        optionsVal.B || optionsVal['1'] || item.option_b || '',
        optionsVal.C || optionsVal['2'] || item.option_c || '',
        optionsVal.D || optionsVal['3'] || item.option_d || ''
      ];
    }
    return [
      item.option_a || '',
      item.option_b || '',
      item.option_c || '',
      item.option_d || ''
    ];
  }, []);

  // Helper to find the correct option index (0 to 3) from correct_answer / correct_option
  const getCorrectIndex = useCallback((item: any): number => {
    if (typeof item.correct_index === 'number') {
      return item.correct_index;
    }
    const answer = (item.correct_answer || item.correct_option || '').trim().toUpperCase();
    if (answer === 'A' || answer === '0') return 0;
    if (answer === 'B' || answer === '1') return 1;
    if (answer === 'C' || answer === '2') return 2;
    if (answer === 'D' || answer === '3') return 3;
    
    // Check if options array contains the correct answer directly
    const opts = getOptionsArray(item.options, item);
    const idx = opts.indexOf(item.correct_answer || item.correct_option);
    if (idx !== -1) return idx;
    
    return 0;
  }, [getOptionsArray]);

  const [editForm, setEditForm] = useState<any>(() => {
    const optsArray = getOptionsArray(q.options, q);
    const correctIdx = getCorrectIndex(q);
    return {
      ...q,
      options: optsArray,
      correct_index: correctIdx
    };
  });

  React.useEffect(() => {
    const optsArray = getOptionsArray(q.options, q);
    const correctIdx = getCorrectIndex(q);
    setEditForm({
      ...q,
      options: optsArray,
      correct_index: correctIdx
    });
  }, [q, getOptionsArray, getCorrectIndex]);

  const handleSave = () => {
    // Map options array back to object format for DB
    const keys = ['A', 'B', 'C', 'D'];
    const optionsObj: Record<string, string> = {};
    editForm.options.forEach((opt: string, idx: number) => {
      optionsObj[keys[idx]] = opt;
    });

    const correctAns = keys[editForm.correct_index] || 'A';

    const updatedQ = {
      ...editForm,
      options: optionsObj,
      correct_answer: correctAns,
      correct_option: correctAns, // also sync legacy
    };
    onUpdate(updatedQ, index);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const optsArray = getOptionsArray(q.options, q);
    const correctIdx = getCorrectIndex(q);
    setEditForm({
      ...q,
      options: optsArray,
      correct_index: correctIdx
    });
    setIsEditing(false);
  };

  const formatDifficulty = (diff: string) => {
    if (!diff) return 'Medium';
    const d = diff.toLowerCase();
    if (d === 'easy') return '🟢 Easy';
    if (d === 'medium') return '🟡 Medium';
    if (d === 'hard') return '🔴 Hard';
    return diff;
  };

  const getDiffColor = (diff: string) => {
    if (!diff) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    const d = diff.toLowerCase();
    if (d === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (d === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  return (
    <motion.div
      layout
      className={cn(
        'bg-card border rounded-2xl overflow-hidden border-border',
        q.is_verified && 'border-emerald-500/40'
      )}
    >
      {isEditing ? (
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-xs font-bold text-orange-400">Edit Mode (Question #{index + 1})</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 text-xs border border-border">Cancel</Button>
              <Button size="sm" onClick={handleSave} className="h-7 text-xs bg-orange-400 hover:bg-orange-300 text-black font-bold"><Save className="w-3 h-3 mr-1" /> Save Temp</Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Question Text</label>
              <textarea
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                value={editForm.question_text || ''}
                onChange={e => setEditForm({ ...editForm, question_text: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(editForm.options || ['', '', '', '']).map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-opt-${q.id}`}
                    checked={editForm.correct_index === i}
                    onChange={() => setEditForm({ ...editForm, correct_index: i })}
                    className="accent-accent"
                  />
                  <input
                    className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent"
                    value={opt}
                    onChange={e => {
                      const newOpts = [...(editForm.options || ['', '', '', ''])];
                      newOpts[i] = e.target.value;
                      setEditForm({ ...editForm, options: newOpts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Difficulty</label>
                <select
                  className="w-full bg-secondary/50 border border-border rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-accent"
                  value={editForm.difficulty || 'medium'}
                  onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Subtopic</label>
                <input
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
                  value={editForm.subtopic || editForm.subchapter_id || ''}
                  onChange={e => setEditForm({ ...editForm, subtopic: e.target.value, subchapter_id: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Concept</label>
                <input
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
                  value={editForm.concept || editForm.concept_tested || ''}
                  onChange={e => setEditForm({ ...editForm, concept: e.target.value, concept_tested: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Mistake Type</label>
                <select
                  className="w-full bg-secondary/50 border border-border rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-accent"
                  value={editForm.mistake_type || 'None'}
                  onChange={e => setEditForm({ ...editForm, mistake_type: e.target.value })}
                >
                  <option value="None">None</option>
                  <option value="Conceptual">Conceptual</option>
                  <option value="Calculation">Calculation</option>
                  <option value="Silly">Silly</option>
                  <option value="Guessed">Guessed</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Time (seconds)</label>
                <input
                  type="number"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
                  value={editForm.avg_time_seconds || editForm.avg_time_taken || 120}
                  onChange={e => setEditForm({ ...editForm, avg_time_seconds: parseInt(e.target.value) || 120, avg_time_taken: parseInt(e.target.value) || 120 })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Brief Explanation</label>
              <textarea
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-accent"
                value={editForm.explanation || ''}
                onChange={e => setEditForm({ ...editForm, explanation: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Solution Steps (one step per line)</label>
              <textarea
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-accent"
                value={Array.isArray(editForm.solution_steps) ? editForm.solution_steps.join('\n') : editForm.solution_steps || ''}
                onChange={e => setEditForm({ ...editForm, solution_steps: e.target.value.split('\n') })}
                rows={3}
                placeholder="Step 1...&#13;Step 2..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Card header */}
          <div className="p-4 flex items-start gap-3">
            <span className="text-xs font-mono text-muted-foreground mt-0.5 flex-shrink-0">
              #{index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded border', getDiffColor(q.difficulty))}>
                  {formatDifficulty(q.difficulty)}
                </span>
                <span className="text-xs px-2 py-0.5 bg-secondary/50 border border-border rounded text-muted-foreground">
                  {q.subject} • {q.subtopic || q.subchapter_id || 'General'}
                </span>
                {(q.concept || q.concept_tested) && (
                  <span className="text-xs px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded">
                    🏷️ {q.concept || q.concept_tested}
                  </span>
                )}
                {q.is_verified && (
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-bold">
                    ✅ Live & Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed font-medium">{q.question_text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Chapter: {q.chapter || q.chapter_id || 'Unknown'} · Class: {q.class || q.ncert_class || '11/12'} · ⏱ {q.avg_time_seconds || q.avg_time_taken || 120}s
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <button onClick={() => setExpanded(e => !e)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {/* Expandable details */}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-border">
                <div className="p-4 space-y-4">
                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getOptionsArray(q.options, q).map((opt: string, i: number) => (
                      <div key={i}
                        className={cn('flex items-start gap-2 p-2.5 rounded-xl border text-sm',
                          i === getCorrectIndex(q)
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-secondary/30 border-border text-muted-foreground'
                        )}>
                        <span className={cn('font-bold text-xs flex-shrink-0',
                          i === getCorrectIndex(q) ? 'text-emerald-400' : 'text-muted-foreground')}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="bg-secondary/20 border border-border rounded-xl p-3 space-y-2">
                    <p className="text-xs font-bold text-accent uppercase tracking-wider">Explanation</p>
                    <p className="text-sm text-foreground">{q.explanation}</p>
                    {q.solution_steps && q.solution_steps.length > 0 && (
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        {q.solution_steps.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                      </ol>
                    )}
                    {q.common_mistake && (
                      <p className="text-xs text-amber-400 bg-amber-500/5 rounded px-2 py-1">
                        ⚠️ <strong>Common Mistake:</strong> {q.common_mistake}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card footer actions */}
          <div className="border-t border-border px-4 py-3 flex flex-wrap items-center gap-2 bg-card">
            {!q.is_verified ? (
              <>
                <Button size="sm" onClick={onVerify} disabled={savingId === q.id}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verify & Publish
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}
                  className="text-xs h-7 border border-border">
                  <Edit3 className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={onDiscard} disabled={savingId === q.id}
                  className="text-xs h-7 text-red-400 hover:text-red-300">
                  <XCircle className="w-3 h-3 mr-1" /> Discard
                </Button>
              </>
            ) : (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Live in Question Bank
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────
const QuestionGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<'generate' | 'pdf-parse' | 'pending-review'>('generate');
  const [pendingQs, setPendingQs] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [uploadStyle, setUploadStyle] = useState<'ALLEN' | 'RESONANCE' | 'FIITJEE' | 'PYQ' | 'STANDARD'>('STANDARD');

  // Admin guard
  React.useEffect(() => {
    if (profile && profile.user_type !== 'admin' && profile.user_type !== 'teacher') {
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

  // ─ PDF Extract state ─
  const [pdfMetadata, setPdfMetadata] = useState({
    exam: 'JEE_MAINS',
    subject: 'Physics',
    userClass: '12' as '11' | '12' | 'dropper'
  });
  const [uploading, setUploading] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [extractedQs, setExtractedQs] = useState<any[]>([]);

  const subjects = [...(EXAM_SUBJECTS[exam]?.class11 || []), ...(EXAM_SUBJECTS[exam]?.class12 || [])];
  const uniqueSubjects = [...new Set(subjects)];
  const chapters = (NCERT_CHAPTERS[subject]?.[ncertClass] || []);

  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  // Fetch files from database pdf_sources table
  const fetchPdfFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase
        .from('pdf_sources')
        .select('*')
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      setPdfFiles(data || []);
    } catch (err: any) {
      console.error('Failed to list PDFs:', err);
      toast.error('Could not list PDF files from database');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'pdf-parse') {
      fetchPdfFiles();
    }
  }, [activeTab, fetchPdfFiles]);

  // Upload handler for PDFs (saves record to pdf_sources)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('question-papers')
        .upload(fileName, file);
        
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('question-papers')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('pdf_sources')
        .insert({
          file_name: fileName,
          file_url: publicUrl,
          source_style: uploadStyle
        });

      if (dbError) throw dbError;

      toast.success('PDF uploaded and registered successfully!');
      fetchPdfFiles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  // Pending questions review handlers
  const fetchPendingQuestions = useCallback(async () => {
    setLoadingPending(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('verification_status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingQs(data || []);
    } catch (err: any) {
      console.error('Failed to list pending questions:', err);
      toast.error('Could not list pending questions from database');
    } finally {
      setLoadingPending(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'pending-review') {
      fetchPendingQuestions();
    }
  }, [activeTab, fetchPendingQuestions]);

  const handleVerifyPending = async (id: string, index: number) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('questions')
        .update({ verification_status: 'APPROVED', is_verified: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Question approved and published!');
      setPendingQs(prev => prev.filter((_, i) => i !== index));
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve question');
    } finally {
      setSavingId(null);
    }
  };

  const handleDiscardPending = async (id: string, index: number) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Question deleted successfully');
      setPendingQs(prev => prev.filter((_, i) => i !== index));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete question');
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdatePending = async (updatedQ: any, index: number) => {
    setSavingId(updatedQ.id);
    try {
      const { id, ...updates } = updatedQ;
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setPendingQs(prev => prev.map((q, i) => i === index ? updatedQ : q));
      toast.success('Changes saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSavingId(null);
    }
  };

  // Select PDF and run client-side extraction using PDF.js CDN
  const handleSelectFile = async (file: any) => {
    setSelectedFile(file);
    setExtractedText('');
    setExtractProgress(0);
    setExtractedQs([]);
    
    setExtracting(true);
    try {
      // 1. Download file blob from Storage
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from('question-papers')
        .download(file.file_name || file.name);
        
      if (downloadError) throw downloadError;
      
      // 2. Extract text client-side
      const arrayBuffer = await fileBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      let text = '';
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
        setExtractProgress(Math.round((i / numPages) * 100));
      }
      
      if (!text.trim()) {
        throw new Error('Extracted text is empty. The PDF might be scanned or image-only.');
      }
      
      setExtractedText(text);
      toast.success(`Successfully extracted ${text.length} characters of text!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to extract text from PDF');
    } finally {
      setExtracting(false);
    }
  };

  // Invoke parse-questions-ai edge function
  const handleParseText = async () => {
    if (!extractedText.trim()) {
      toast.error('No text extracted yet');
      return;
    }
    
    setParsing(true);
    setExtractedQs([]);
    try {
      const { data, error } = await supabase.functions.invoke('parse-questions-ai', {
        body: {
          rawText: extractedText,
          source: 'PDF_UPLOAD',
          exam: pdfMetadata.exam,
          subject: pdfMetadata.subject,
          userClass: pdfMetadata.userClass
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        setExtractedQs(data.data || []);
        toast.success(`Successfully parsed ${data.count} questions!`);
      } else {
        throw new Error(data.error || 'Parsing failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to parse questions via AI');
    } finally {
      setParsing(false);
    }
  };

  // PDF Question verify/publish handler
  const handleVerifyPdfQuestion = async (id: string, index: number) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('questions')
        .update({ is_verified: true })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Question verified and live!');
      setExtractedQs(prev => prev.map((q, i) => i === index ? { ...q, is_verified: true } : q));
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify question');
    } finally {
      setSavingId(null);
    }
  };

  // PDF Question discard/delete handler
  const handleDiscardPdfQuestion = async (id: string, index: number) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Question discarded and removed.');
      setExtractedQs(prev => prev.filter((_, i) => i !== index));
    } catch (err: any) {
      toast.error(err.message || 'Failed to discard question');
    } finally {
      setSavingId(null);
    }
  };

  // PDF Question inline update handler
  const handleUpdatePdfQuestion = async (updatedQ: any, index: number) => {
    setSavingId(updatedQ.id);
    try {
      const { id, ...updates } = updatedQ;
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      setExtractedQs(prev => prev.map((q, i) => i === index ? updatedQ : q));
      toast.success('Changes saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSavingId(null);
    }
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl tracking-tighter">PrepEntrance.</span>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10
              border border-orange-500/20 px-2 py-0.5 rounded-full">Question Generator</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/qc')}>QC Panel</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teacher-dashboard')}>← Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab switcher */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={cn(
              "px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative",
              activeTab === 'generate' ? "border-orange-400 text-orange-400 font-extrabold" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Generate via AI
          </button>
          <button
            onClick={() => setActiveTab('pdf-parse')}
            className={cn(
              "px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative",
              activeTab === 'pdf-parse' ? "border-orange-400 text-orange-400 font-extrabold" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Extract from PDF
          </button>
          <button
            onClick={() => setActiveTab('pending-review')}
            className={cn(
              "px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative",
              activeTab === 'pending-review' ? "border-orange-400 text-orange-400 font-extrabold" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Pending Review
            {pendingQs.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-xs font-bold bg-orange-500 text-black rounded-full">
                {pendingQs.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="flex flex-col lg:flex-row gap-8">
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
        )}

        {activeTab === 'pdf-parse' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Left Sidebar: PDF Ingestion Config ── */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h2 className="font-bold text-foreground">PDF Extraction Config</h2>

                {/* Source Style Selector */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Source PDF Style</label>
                  <select
                    value={uploadStyle}
                    onChange={e => setUploadStyle(e.target.value as any)}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent mb-1"
                  >
                    <option value="STANDARD">Standard/Default</option>
                    <option value="ALLEN">Allen Style</option>
                    <option value="RESONANCE">Resonance Style</option>
                    <option value="FIITJEE">FIITJEE Style</option>
                    <option value="PYQ">PYQ Style</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Target Exam</label>
                  <select
                    value={pdfMetadata.exam}
                    onChange={e => setPdfMetadata(prev => ({ ...prev, exam: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="JEE_MAINS">JEE Mains</option>
                    <option value="NEET">NEET</option>
                    <option value="CUET">CUET (UG)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Target Subject</label>
                  <select
                    value={pdfMetadata.subject}
                    onChange={e => setPdfMetadata(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Maths">Maths</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Target Class</label>
                  <select
                    value={pdfMetadata.userClass}
                    onChange={e => setPdfMetadata(prev => ({ ...prev, userClass: e.target.value as any }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                    <option value="dropper">Dropper</option>
                  </select>
                </div>

                {/* Upload Section */}
                <div className="border-t border-border pt-4">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Upload New PDF</label>
                  <div className="relative border-2 border-dashed border-border hover:border-orange-500/30 rounded-xl p-4 transition-all text-center cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
                        <span className="text-xs font-semibold">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-semibold">Choose PDF File</span>
                        <span className="text-[10px] text-muted-foreground">or drag and drop here</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bucket Files Listing */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Uploaded PDFs</label>
                    <button onClick={fetchPdfFiles} disabled={loadingFiles} className="p-1 hover:bg-secondary rounded transition-colors">
                      <RefreshCw className={cn("w-3 h-3 text-muted-foreground", loadingFiles && "animate-spin")} />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {loadingFiles ? (
                      <div className="text-xs text-muted-foreground text-center py-4">Listing files...</div>
                    ) : pdfFiles.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-4">No PDFs in storage.</div>
                    ) : (
                      pdfFiles.map((file) => {
                        const isSelected = selectedFile?.name === file.name;
                        const sizeMB = (file.metadata?.size / (1024 * 1024)).toFixed(2);
                        return (
                          <button
                            key={file.id || file.name}
                            onClick={() => handleSelectFile(file)}
                            disabled={extracting}
                            className={cn(
                              "w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-1",
                              isSelected
                                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                : "bg-secondary/20 border-border hover:border-orange-500/20 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <div className="font-semibold truncate flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{file.name.replace(/^\d+_/, '')}</span>
                            </div>
                            <div className="flex justify-between text-[10px] opacity-75">
                              <span>{sizeMB} MB</span>
                              <span>{new Date(file.created_at).toLocaleDateString()}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Right Content Area: Extracted Text & Ingestion Results ── */}
            <main className="flex-1 space-y-4 min-w-0">
              {/* Empty state when nothing selected */}
              {!selectedFile && extractedQs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Ingest via PDF Question Paper</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Select a PDF from the sidebar list (or upload a new one) to extract text client-side, and then trigger Claude to parse questions.
                  </p>
                </div>
              )}

              {/* Text extraction progress */}
              {extracting && (
                <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
                  <div>
                    <h4 className="font-bold">Extracting PDF Text content...</h4>
                    <p className="text-xs text-muted-foreground mt-1">Downloading file and running text layout engine in browser</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 max-w-xs mx-auto">
                    <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{ width: `${extractProgress}%` }} />
                  </div>
                  <span className="text-xs font-mono">{extractProgress}% Complete</span>
                </div>
              )}

              {/* Text preview & Parse trigger button */}
              {selectedFile && !extracting && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-border">
                    <div>
                      <h3 className="font-bold text-foreground truncate max-w-md">
                        Selected: {selectedFile.name.replace(/^\d+_/, '')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Size: {(selectedFile.metadata?.size / (1024 * 1024)).toFixed(2)} MB · {extractedText.length} characters extracted
                      </p>
                    </div>
                    <Button
                      onClick={handleParseText}
                      disabled={parsing || !extractedText}
                      className="bg-orange-400 hover:bg-orange-300 text-black font-bold h-10 px-6 shrink-0"
                    >
                      {parsing ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting & Parsing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4 fill-black text-black" /> Run Claude Parser
                        </span>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Extracted Content Preview</label>
                    <div className="bg-secondary/35 border border-border rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {extractedText.slice(0, 1000)}
                      {extractedText.length > 1000 && `\n\n... [Preview Truncated: ${extractedText.length - 1000} characters remaining]`}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading AI parsing */}
              {parsing && (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                      <div className="h-5 w-24 bg-muted rounded mb-3" />
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                  <p className="text-center text-sm text-muted-foreground animate-pulse">
                    🧠 Claude is analyzing questions structure, extracting options and solutions...
                  </p>
                </div>
              )}

              {/* Parsed questions preview */}
              {extractedQs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-foreground">AI Parsed Questions ({extractedQs.length})</h3>
                    <span className="text-xs text-muted-foreground">Pending manual verification & publish</span>
                  </div>
                  
                  <div className="space-y-3">
                    {extractedQs.map((q, i) => (
                      <ParsedPdfQuestionCard
                        key={q.id || i}
                        q={q}
                        index={i}
                        savingId={savingId}
                        onVerify={() => handleVerifyPdfQuestion(q.id, i)}
                        onDiscard={() => handleDiscardPdfQuestion(q.id, i)}
                        onUpdate={(updatedForm) => handleUpdatePdfQuestion(updatedForm, i)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {activeTab === 'pending-review' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground">Pending Review Queue</h2>
                <p className="text-sm text-muted-foreground">AI generated questions that need verification before going live.</p>
              </div>
              <button 
                onClick={fetchPendingQuestions} 
                disabled={loadingPending}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 border border-border px-3 py-1.5 rounded-lg transition-all"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loadingPending && "animate-spin")} />
                Refresh Queue
              </button>
            </div>

            {loadingPending ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                    <div className="h-5 w-24 bg-muted rounded mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : pendingQs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-2xl bg-card">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Queue is Clear!</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  All AI generated questions have been reviewed and published.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingQs.map((q, i) => (
                  <ParsedPdfQuestionCard
                    key={q.id || i}
                    q={q}
                    index={i}
                    savingId={savingId}
                    onVerify={() => handleVerifyPending(q.id, i)}
                    onDiscard={() => handleDiscardPending(q.id, i)}
                    onUpdate={(updatedForm) => handleUpdatePending(updatedForm, i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGeneratorPage;
