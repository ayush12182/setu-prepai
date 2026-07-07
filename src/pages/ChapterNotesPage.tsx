import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChapterContent } from '@/hooks/useChapterContent';
import { MainLayout } from '@/components/layout/MainLayout';
import { getChapterById, allChapters } from '@/data/syllabus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Download, Copy, CheckCircle2,
  BookOpen, Layers, Zap, BrainCircuit, AlertTriangle, AlertCircle, Calculator, Sparkles,
  GraduationCap, RotateCcw, Lightbulb, Star, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { cn } from '@/lib/utils';
import { MathLine, processNotesContent, normalizeMathDelimiters } from '@/utils/mathRenderer';
import { InteractiveGraph } from '@/components/interactive/InteractiveGraph';
import { InteractiveDiagram } from '@/components/interactive/InteractiveDiagram';
import { InteractiveExample } from '@/components/interactive/InteractiveExample';
import { SimulationEngine } from '@/components/interactive/SimulationEngine';

type SmartMode = 'default' | 'overview' | 'theory' | 'formulas' | 'concepts' | 'examples' | 'pyqs' | 'insights' | 'summary' | 'ask_ai';

const cleanJsonString = (str: string): string => {
  // Replace single backslashes with double backslashes, unless they escape a quote or another backslash
  return str.replace(/(?<!\\)\\(?!["\\])/g, '\\\\');
};

const CollapsibleDerivation: React.FC<{ content: string; keyIdx: number; renderLine: any }> = ({ content, keyIdx, renderLine }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="my-8 bg-violet-50/30 dark:bg-violet-950/10 border border-violet-200 dark:border-violet-900/50 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-5 text-left font-bold text-violet-800 dark:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all"
      >
        <span className="flex items-center gap-2.5 text-body-md">
          <Layers className="w-4 h-4 text-violet-500" />
          Mathematical Derivation & Proof
        </span>
        <span className="flex items-center gap-1 text-caption font-bold bg-violet-500/10 dark:bg-violet-500/25 px-3 py-1 rounded-full text-violet-700 dark:text-violet-300">
          {isOpen ? (
            <>
              Hide Derivation <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Show Derivation <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-violet-100 dark:border-violet-900/40 p-6"
          >
            <div className="prose prose-base dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-4">
              {processNotesContent(content, (line, i) => renderLine(line, `deriv-${keyIdx}-${i}`))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SMART_MODE_META: Record<SmartMode, { label: string; loaderText: string }> = {
  default:   { label: 'Complete Notes',       loaderText: 'Loading complete concept notes curated by senior Kota faculty...' },
  overview:  { label: 'Chapter Overview',     loaderText: 'Loading chapter overview and weightage...' },
  theory:    { label: 'Core Theory',          loaderText: 'Loading core theory and derivations...' },
  formulas:  { label: 'Formula Sheet',        loaderText: 'Loading key formulas and constraints...' },
  concepts:  { label: 'Important Concepts',   loaderText: 'Loading core concepts and edge-cases...' },
  examples:  { label: 'Solved Examples',      loaderText: 'Loading step-by-step solved illustrations...' },
  pyqs:      { label: 'PYQ Intelligence',     loaderText: 'Loading previous years exam trend analysis...' },
  insights:  { label: 'JEE Insights',         loaderText: 'Loading student common mistakes and shortcuts...' },
  summary:   { label: 'Chapter Summary',      loaderText: 'Loading quick revision summary...' },
  ask_ai:    { label: 'Ask AI Mentor',        loaderText: 'Redirecting to your PrepEntrance study assistant...' },
};

const LEVEL_STYLES = {
  1: { wrapper: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  2: { wrapper: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500' },
  3: { wrapper: 'bg-red-500/10 text-red-600 dark:text-red-400',         dot: 'bg-red-500' },
} as const;

const FormulaCard: React.FC<{ 
  equation: string; 
  title: string; 
  whenToUse?: string; 
  commonMistake?: string; 
  memoryTrick?: string;
  variables?: string;
  units?: string;
  whenNotToUse?: string;
  derivation?: string;
  physicalMeaning?: string;
  solvedExample?: string;
  relatedFormula?: string;
  isCompact?: boolean;
}> = ({ 
  equation, 
  title, 
  whenToUse, 
  commonMistake, 
  memoryTrick,
  variables,
  units,
  whenNotToUse,
  derivation,
  physicalMeaning,
  solvedExample,
  relatedFormula,
  isCompact
}) => {
  const [copied, setCopied] = useState(false);
  const [showDerivation, setShowDerivation] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(equation.trim());
    setCopied(true);
    toast.success(`Copied: ${title || 'Formula'}`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compact Quick Revision Mode
  if (isCompact) {
    return (
      <div className="my-4 p-4 bg-gradient-to-br from-indigo-50/10 via-background to-secondary/5 dark:from-slate-900/10 dark:via-background dark:to-secondary/5 border border-border/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-body-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{title || 'Formula'}</span>
            {copied ? (
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Copied!</span>
            ) : (
              <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-0.5 opacity-60 hover:opacity-100"><Copy className="w-3 h-3" /> Copy</button>
            )}
          </div>
          <div className="text-[18px] font-semibold py-0.5 text-foreground leading-relaxed">
            <MathLine>{`$${equation.trim()}$`}</MathLine>
          </div>
          <p className="text-caption text-muted-foreground font-medium"><strong className="font-semibold text-slate-700 dark:text-slate-300">Use:</strong> {physicalMeaning || whenToUse || "General physics equation"}</p>
        </div>
        {memoryTrick && (
          <div className="px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-lg text-body-xs text-amber-700 dark:text-amber-400 font-semibold self-start sm:self-center">
            💡 {memoryTrick}
          </div>
        )}
      </div>
    );
  }

  // Detailed Mode Card
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-indigo-50/10 via-background to-secondary/5 dark:from-slate-900/20 dark:via-background dark:to-secondary/5 border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
      
      {/* Header & Formula display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 text-left">
          <span className="text-body-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{title || 'Formula'}</span>
          <div className="text-[22px] font-semibold py-2 text-foreground overflow-x-auto leading-relaxed">
            <MathLine>{`$$${equation.trim()}$$`}</MathLine>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy} 
          className="h-9 px-3 rounded-xl border border-border hover:bg-secondary flex items-center gap-1.5 bg-background shadow-sm self-start md:self-center"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-body-xs font-bold text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-body-xs font-bold">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Physical Meaning */}
      {physicalMeaning && (
        <div className="text-body-sm text-left border-l-2 border-indigo-500/30 pl-4 py-0.5">
          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Physical Meaning:</span>
          <p className="text-muted-foreground leading-relaxed"><MathLine>{physicalMeaning}</MathLine></p>
        </div>
      )}

      {/* Variables & SI Units Grid */}
      {(variables || units) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/20 dark:bg-slate-900/30 rounded-xl border border-border/40 text-body-sm text-left">
          {variables && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Variables:</span>
              <p className="text-muted-foreground"><MathLine>{variables}</MathLine></p>
            </div>
          )}
          {units && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">SI Units:</span>
              <p className="text-muted-foreground"><MathLine>{units}</MathLine></p>
            </div>
          )}
        </div>
      )}

      {/* Contextual Usage Grid */}
      {(whenToUse || whenNotToUse || commonMistake || memoryTrick) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-border/40 text-body-sm text-left">
          {whenToUse && (
            <div>
              <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">When to use:</span>
              <span className="text-muted-foreground"><MathLine>{whenToUse}</MathLine></span>
            </div>
          )}
          {whenNotToUse && (
            <div>
              <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">When NOT to use:</span>
              <span className="text-muted-foreground"><MathLine>{whenNotToUse}</MathLine></span>
            </div>
          )}
          {commonMistake && (
            <div>
              <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">Common Mistake:</span>
              <span className="text-muted-foreground"><MathLine>{commonMistake}</MathLine></span>
            </div>
          )}
          {memoryTrick && (
            <div>
              <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">Memory Trick:</span>
              <span className="text-muted-foreground"><MathLine>{memoryTrick}</MathLine></span>
            </div>
          )}
        </div>
      )}

      {/* One Solved Example */}
      {solvedExample && (
        <div className="mt-2 p-4 bg-indigo-500/5 dark:bg-indigo-950/10 rounded-xl border border-indigo-500/10 text-body-sm text-left">
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block mb-1.5 uppercase tracking-wider text-body-xs">Solved Illustration:</span>
          <div className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            <MathLine>{solvedExample}</MathLine>
          </div>
        </div>
      )}

      {/* Related Formula */}
      {relatedFormula && (
        <div className="text-body-xs text-left text-muted-foreground/80 flex items-center gap-1.5 mt-1">
          <span className="font-bold uppercase tracking-wider">Related Equations:</span>
          <span className="font-medium"><MathLine>{relatedFormula}</MathLine></span>
        </div>
      )}

      {/* Collapsible derivation */}
      {derivation && (
        <div className="border-t border-border/40 pt-4 text-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDerivation(!showDerivation)}
            className="text-body-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/5 px-2.5 h-8 rounded-lg flex items-center gap-1.5"
          >
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showDerivation ? "rotate-180" : "")} />
            {showDerivation ? "Hide Derivation Proof" : "Show Step-by-Step Derivation"}
          </Button>
          {showDerivation && (
            <div className="mt-3 p-4 bg-indigo-500/5 dark:bg-indigo-950/10 rounded-xl border border-indigo-500/10 text-body-sm leading-relaxed text-slate-800 dark:text-slate-200 space-y-2 animate-in fade-in duration-200">
              <MathLine>{derivation}</MathLine>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const validateNotesContent = (
  content: string, 
  requestedChapterName: string, 
  requestedTopics: string[]
): { isValid: boolean; reason?: string } => {
  // 0. Minimum content length — reject if too short (template/fallback content is ~3-4k chars)
  //    Real AI-generated premium notes should be 8,000–30,000+ chars.
  const MIN_CONTENT_LENGTH = 6000;
  if (content.length < MIN_CONTENT_LENGTH) {
    return { 
      isValid: false, 
      reason: `Content too short (${content.length} chars). Minimum required: ${MIN_CONTENT_LENGTH}. Notes appear to be template/fallback, not AI-generated.` 
    };
  }

  // 1. Extract METADATA block
  const metadataRegex = /\[METADATA\]([\s\S]*?)\[\/METADATA\]/;
  const match = content.match(metadataRegex);
  if (!match) {
    return { isValid: false, reason: "Missing [METADATA] block" };
  }

  const metaText = match[1];
  const slugMatch = metaText.match(/chapter_slug:\s*(.*)/i);
  const nameMatch = metaText.match(/chapter_name:\s*(.*)/i);
  const subjectMatch = metaText.match(/subject:\s*(.*)/i);
  const topicMatch = metaText.match(/topic_tree:\s*(.*)/i);

  if (!slugMatch || !nameMatch || !subjectMatch || !topicMatch) {
    return { isValid: false, reason: "Metadata block is missing required keys (slug, name, subject, topic_tree)" };
  }

  const genSlug = slugMatch[1].trim();
  const genName = nameMatch[1].trim();
  const genSubject = subjectMatch[1].trim();
  const genTopicTree = topicMatch[1].trim();

  // 2. Exact match check (case-insensitive) for requested chapter name
  if (genName.toLowerCase() !== requestedChapterName.toLowerCase()) {
    return { 
      isValid: false, 
      reason: `Chapter name mismatch. Requested: "${requestedChapterName}", Generated: "${genName}"` 
    };
  }

  const lowerContent = content.toLowerCase();

  // 3. Custom Laws of Motion validation check
  if (requestedChapterName.toLowerCase() === "laws of motion") {
    const requiredNLM = ["newton", "friction", "free body", "pseudo force", "constraint", "newton's law"];
    // These terms should NOT appear in Laws of Motion notes (they signal wrong chapter content)
    // Note: keeping specific compound terms to avoid false positives (e.g. "potential energy" is valid in NLM)
    const forbiddenElectro = ["electrostatics", "capacitance", "gauss law", "coulomb's law", "electric flux", "dielectric"];

    const hasNLM = requiredNLM.some(term => lowerContent.includes(term));
    if (!hasNLM) {
      return { isValid: false, reason: "Laws of Motion content is missing key NLM concepts" };
    }

    const foundForbidden = forbiddenElectro.find(term => lowerContent.includes(term));
    if (foundForbidden) {
      return { 
        isValid: false, 
        reason: `Laws of Motion content contains forbidden electrostatics concept: "${foundForbidden}"` 
      };
    }
  }

  // 4. Formula visual QA validation
  // Strip math blocks first to inspect text segments
  const normalized = normalizeMathDelimiters(content);
  const textWithoutMath = normalized
    .replace(/\$\$([\s\S]*?)\$\$/g, '')
    .replace(/\$([^$\n]+?)\$/g, '');

  const latexCommandsToCheck = ['\\frac', '\\sum', '\\int', '\\alpha', '\\beta', '\\omega'];
  const foundRawLatex = latexCommandsToCheck.find(cmd => textWithoutMath.includes(cmd));
  
  if (foundRawLatex) {
    return { 
      isValid: false, 
      reason: `Raw LaTeX formula leak detected outside math delimiters: "${foundRawLatex}"` 
    };
  }

  return { isValid: true };
};

const ChapterNotesPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeSmartMode, setActiveSmartMode] = useState<SmartMode>('default');

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [activeSection, setActiveSection] = useState('section-theory');
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  const [formulaSearchQuery, setFormulaSearchQuery] = useState('');
  const [isQuickRevision, setIsQuickRevision] = useState(false);

  const { language } = useLanguage();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();

  const chapter = chapterId ? getChapterById(chapterId) : null;

  // Determine exam type for content lookup
  const examType = isFoundation ? 'FOUNDATION' : isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE';

  // ── Permanent Content Repository Hook ────────────────────────
  // Reads from chapter_content table. ZERO AI calls.
  // Cache: React Query (memory) → localStorage → DB read (~200ms)
  const {
    content: chapterContent,
    isLoading: isContentLoading,
    isNotPublished,
    error: contentError,
  } = useChapterContent(chapter?.id ?? null, examType, language);

  const buildFallbackNotes = (ch: typeof chapter) => {
    if (!ch) return '';
    
    // User requested exactly this text for Kinematics
    if (ch.id === 'phy-1') {
      return `[METADATA]
chapter_slug: kinematics
chapter_name: Kinematics
subject: physics
[/METADATA]

# KINEMATICS — Complete Master Notes
PrepEntrance Physics | JEE Main • JEE Advanced • NEET • Class 11 • Droppers

## 1. Chapter Overview

### Why Kinematics matters

Kinematics is the grammar of physics. Before you can analyze why something moves (dynamics, forces, energy), you must be fluent in describing how it moves — position, velocity, acceleration, and their relationships in time. Every later chapter borrows this language directly:

- **Laws of Motion:** F = ma requires you to already know what "a" means and how to extract it from a graph or equation.
- **Work, Energy, Power:** velocity appears inside every energy and power expression.
- **Circular Motion:** is kinematics wrapped around a curved path — same ideas, polar coordinates.
- **Rotational Mechanics:** angular kinematics is a direct copy-paste of linear kinematics with θ, ω, α replacing x, v, a.
- **SHM and Waves:** are kinematics of a very specific kind of accelerated motion (acceleration proportional to displacement).

[TEACHER_SAYS]
Students, kinematics forms the absolute foundation of your mechanics journey. Master the vector nature of velocity and acceleration, and graphical analysis, before moving to dynamics!
[/TEACHER_SAYS]

## 2. Learning Outcomes
- Distinguish between distance vs displacement, speed vs velocity.
- Solve 1D motion problems using the three equations of kinematics.
- Interpret v-t, x-t, and a-t graphs and extract physical quantities from their slopes and areas.
- Deconstruct 2D projectile motion into independent 1D motions.
- Analyze relative velocity in 1D and 2D (Rain-Man and River-Boat problems).

## 3. Complete Theory
[CONCEPT]
**Position, Velocity, and Acceleration**
Kinematics begins with defining a frame of reference. 
Position $\\vec{r}$ describes where an object is. 
Velocity $\\vec{v} = \\frac{d\\vec{r}}{dt}$ describes how fast position changes.
Acceleration $\\vec{a} = \\frac{d\\vec{v}}{dt}$ describes how fast velocity changes.
[/CONCEPT]

[DERIVATION]
**Deriving $v^2 = u^2 + 2as$**
Using calculus for constant acceleration:
$$a = \\frac{dv}{dt} = \\frac{dv}{dx} \\frac{dx}{dt} = v \\frac{dv}{dx}$$
Integrating both sides:
$$\\int_{u}^{v} v \\, dv = \\int_{0}^{s} a \\, dx$$
$$\\left[ \\frac{v^2}{2} \\right]_{u}^{v} = a [x]_{0}^{s}$$
$$\\frac{v^2 - u^2}{2} = as \\implies v^2 = u^2 + 2as$$
[/DERIVATION]

## 5. Formula Sheet
[FORMULA title="Equation of Trajectory"]
y = x \\tan \\theta - \\frac{gx^2}{2u^2 \\cos^2 \\theta}
**Variables:** $x, y$ = coordinates, $u$ = initial velocity, $\\theta$ = angle of projection.
**Physical Meaning:** Relates y and x independently of time, proving the path is a parabola.
**When to use:** When finding the height at a specific horizontal distance without calculating time.
**Common Mistake:** Forgetting to square $u$ and $\\cos\\theta$ in the denominator.
[/FORMULA]
`;
    }

    const topicListStr = ch.topics ? ch.topics.map(t => `- ${t}`).join('\n') : '';

    return `[METADATA]
chapter_slug: ${ch.id}
chapter_name: ${ch.name}
subject: ${ch.subject}
[/METADATA]

# ${ch.name.toUpperCase()} — Complete Master Notes
PrepEntrance ${ch.subject.charAt(0).toUpperCase() + ch.subject.slice(1)} | JEE Main • JEE Advanced • NEET

## 1. Chapter Overview

### Introduction to ${ch.name}
This chapter is a foundational pillar for your exam preparation. Understanding the physical and mathematical foundation of ${ch.name} is key to scoring high marks in JEE and NEET. Concept questions are regularly tested with high weightage, and the principles are frequently integrated with other topics.

[TEACHER_SAYS]
Students, focus on deriving the fundamental relations in ${ch.name} rather than just memorizing the formulas. Pay special attention to the edge cases and boundary conditions.
[/TEACHER_SAYS]

## 2. Learning Outcomes
- Master the fundamental definitions of the core topics.
- Develop intuition for problem-solving patterns in this chapter.
- Identify common traps set by examiners.

## 3. Complete Theory
[CONCEPT]
Every system in ${ch.name} has state parameters that dictate its behavior under external factors. Let us explore these properties systematically.
- Core topics covered in this study guide:
${topicListStr}
[/CONCEPT]

[NCERT_INSIGHT]
NCERT highlights the conceptual background, which is frequently tested in direct conceptual questions in JEE. Ensure you read the side-margin highlights of NCERT for these topics.
[/NCERT_INSIGHT]

## 5. Formula Sheet
[FORMULA title="General Solution Form"]
x(t) = A \\sin(\\omega t + \\phi)
**When to use:** This is a placeholder standard formula format.
[/FORMULA]

## 9. Common Mistakes
[COMMON_MISTAKE]
**Conceptual Trap:** Forgetting sign conventions when substituting values in vector equations is a major reason students lose marks. Always establish a coordinate system first!
[/COMMON_MISTAKE]

## 10. Shortcuts
[JEE_TRICK]
**Shortcut Trick:** When dealing with symmetric configurations, use superposition to find the net field/potential at the center. This reduces calculation time by 80%!
[/JEE_TRICK]
`;
  };

  // Derive notes string from stored content (raw_content field)
  // If not published, automatically generate a structured universal fallback notes layout
  const notes = chapterContent?.raw_content ?? (isNotPublished ? buildFallbackNotes(chapter) : '');
  const isGenerating = isContentLoading;

  // Upgraded Priority Engine (V3)
  // Score = pyqData.total + (weightage * 10) + (difficulty * 5) + advancedBonus
  const getChapterPriority = () => {
    if (!chapter) return { stars: '★★★', label: 'Moderate Priority', text: '★★★ Moderate Priority' };
    const pyqCount = chapter.pyqData?.total || 0;
    
    let weightVal = 2; // Medium default
    if (chapter.weightage === 'High') weightVal = 3;
    else if (chapter.weightage === 'Low') weightVal = 1;

    let diffVal = 2; // Medium default
    if (chapter.difficulty === 'Hard') diffVal = 3;
    else if (chapter.difficulty === 'Easy') diffVal = 1;

    const advancedBonus = (chapter.difficulty === 'Hard' && chapter.weightage === 'High') ? 10 : 0;
    const score = pyqCount + (weightVal * 10) + (diffVal * 5) + advancedBonus;

    if (score >= 60) return { stars: '★★★★★', label: 'Must Do Chapter', text: '★★★★★ Must Do' };
    if (score >= 40) return { stars: '★★★★', label: 'High Priority', text: '★★★★ High Priority' };
    if (score >= 25) return { stars: '★★★', label: 'Moderate Priority', text: '★★★ Moderate Priority' };
    if (score >= 15) return { stars: '★★', label: 'Low Priority', text: '★★ Low Priority' };
    return { stars: '★', label: 'Revision Only', text: '★ Revision Only' };
  };

  const priority = getChapterPriority();

  // Dynamic Trend Engine (V3)
  const getTrendInsight = () => {
    if (!chapter || !chapter.pyqData || !chapter.pyqData.trendingConcepts || chapter.pyqData.trendingConcepts.length === 0) {
      return 'PYQ Analysis Available Soon';
    }
    const concepts = chapter.pyqData.trendingConcepts;
    
    // Choose trend index deterministically based on chapter name length or similar
    const idx = (chapter.name.length) % concepts.length;
    const coreConcept = concepts[idx];
    
    if (chapter.subject === 'physics') {
      if (coreConcept.toLowerCase().includes('graph')) {
        return `Graph-based questions appearing more frequently`;
      }
      return `${coreConcept} questions increasing in recent years`;
    } else if (chapter.subject === 'chemistry') {
      if (coreConcept.toLowerCase().includes('mechanism') || coreConcept.toLowerCase().includes('reaction')) {
        return `Mechanism-based conceptual traps rising in frequency`;
      }
      return `${coreConcept} focus stable across papers`;
    } else {
      return `${coreConcept} dominates recent exam patterns`;
    }
  };

  const trendInsight = getTrendInsight();

  const sections = [
    { id: 'section-overview',         label: '1. Chapter Overview' },
    { id: 'section-outcomes',         label: '2. Learning Outcomes' },
    { id: 'section-theory',           label: '3. Complete Theory' },
    { id: 'section-visualization',    label: '4. Concept Visualization' },
    { id: 'section-formulas',         label: '5. Formula Sheet' },
    { id: 'section-graphs',           label: '6. Important Graphs' },
    { id: 'section-examples',         label: '7. Solved Examples' },
    { id: 'section-pyqs',             label: '8. PYQ Analysis' },
    { id: 'section-mistakes',         label: '9. Common Mistakes' },
    { id: 'section-shortcuts',        label: '10. Shortcuts' },
    { id: 'section-revision',         label: '11. Revision Sheet' },
    { id: 'section-summary',          label: '12. Chapter Summary' },
    { id: 'section-mindmap',          label: '13. Mind Map' },
    { id: 'section-examtips',         label: '14. Exam Tips' },
    { id: 'section-aiinsights',       label: '15. AI Insights' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -160; // offset for sticky navigation header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 1. Reading Progress
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = (window.pageYOffset / totalHeight) * 100;
            setScrollProgress(Math.min(100, Math.max(0, Math.round(progress))));
          }

          // 2. Floating Bar Visibility
          if (window.pageYOffset > 350) {
            setShowFloatingBar(true);
          } else {
            setShowFloatingBar(false);
          }

          // 3. Active Outline Scroll Spy
          const scrollPos = window.pageYOffset + 240;
          for (const sec of sections) {
            const el = document.getElementById(sec.id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.pageYOffset;
              const height = el.offsetHeight;
              if (scrollPos >= top && scrollPos < top + height) {
                if (activeSection !== sec.id) {
                  setActiveSection(sec.id);
                  let matchedMode: SmartMode = 'default';
                  if (sec.id === 'section-overview') matchedMode = 'overview';
                  else if (sec.id === 'section-theory') matchedMode = 'theory';
                  else if (sec.id === 'section-formulas') matchedMode = 'formulas';
                  else if (sec.id === 'section-concepts') matchedMode = 'concepts';
                  else if (sec.id === 'section-examples') matchedMode = 'examples';
                  else if (sec.id === 'section-pyqs') matchedMode = 'pyqs';
                  else if (sec.id === 'section-insights') matchedMode = 'insights';
                  else if (sec.id === 'section-summary') matchedMode = 'summary';
                  setActiveSmartMode(matchedMode);
                }
              }
            }
          }

          // 4. Track Completed Sections
          setCompletedSections(prev => {
            const updated = { ...prev };
            let changed = false;
            sections.forEach(sec => {
              const el = document.getElementById(sec.id);
              if (el) {
                const rect = el.getBoundingClientRect();
                // If section top has scrolled past 40% height of screen, mark as read
                if (rect.top < window.innerHeight * 0.4 && !updated[sec.id]) {
                  updated[sec.id] = true;
                  changed = true;
                }
              }
            });
            return changed ? updated : prev;
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle URL ?mode= param — set active smart mode + scroll to section
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode') as SmartMode;
    if (m && ['default', 'overview', 'theory', 'formulas', 'concepts', 'examples', 'pyqs', 'insights', 'summary'].includes(m)) {
      setActiveSmartMode(m);
    }
  }, []);

  useEffect(() => {
    if (notes && !isGenerating) {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mode') as SmartMode;
      if (m && m !== 'default') {
        const sectionMap: Record<string, string> = {
          overview: 'section-overview', theory: 'section-theory',
          formulas: 'section-formulas', concepts: 'section-concepts',
          examples: 'section-examples', pyqs: 'section-pyqs',
          insights: 'section-insights', summary: 'section-summary',
        };
        const sectionId = sectionMap[m];
        if (sectionId) setTimeout(() => scrollToSection(sectionId), 400);
      }
    }
  }, [notes, isGenerating]);

  // Admin generates content via the Admin → Content Generation panel.

  if (!chapter) {
    return (
      <MainLayout title="Notes Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">Chapter not found</p>
          <Button onClick={() => navigate('/learn')}>Back to Learn</Button>
        </div>
      </MainLayout>
    );
  }


  // Handle generic errors (e.g., DB errors, network issues)
  if (contentError && !isNotPublished) {
    return (
      <MainLayout title="Error Loading Notes">
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-4">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-heading-lg font-bold text-foreground">Failed to Load Notes</h1>
          <p className="text-body-lg text-muted-foreground max-w-md">
            We encountered an unexpected error while fetching the notes. Please try refreshing the page.
          </p>
          <p className="text-body-sm font-mono text-destructive bg-destructive/5 p-4 rounded-xl border border-destructive/20 max-w-lg overflow-auto">
            {contentError.message}
          </p>
          <Button onClick={() => window.location.reload()} variant="default">Refresh Page</Button>
        </div>
      </MainLayout>
    );
  }

  const subjectStr = chapter.subject as string;
  const subjectAccent = subjectStr === 'mathematics' ? 'text-violet-500 bg-violet-500/10 border-violet-500/20' :
    subjectStr === 'science' || subjectStr === 'physics' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
      subjectStr === 'social_science' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
        'text-sky-500 bg-sky-500/10 border-sky-500/20';

  const handleCopy = () => {
    const rawNotes = chapterContent?.raw_content || notes;
    const cleanedNotes = rawNotes.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/, '').trim();
    navigator.clipboard.writeText(`Notes for ${chapter.name}\n\n${cleanedNotes}`);
    setCopied(true);
    toast.success('Notes copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    toast.success('Downloading PDF... (To be implemented)');
  };

  const smartModes = [
    { id: 'overview',      label: '📋 Chapter Overview',     icon: BookOpen,      color: 'text-indigo-500' },
    { id: 'theory',        label: '📚 Core Theory',          icon: Layers,        color: 'text-sky-500' },
    { id: 'formulas',      label: '⚡ Formula Sheet',        icon: Zap,           color: 'text-amber-500' },
    { id: 'concepts',      label: '💡 Important Concepts',   icon: Lightbulb,     color: 'text-orange-500' },
    { id: 'examples',      label: '📝 Solved Examples',      icon: Calculator,    color: 'text-pink-500' },
    { id: 'pyqs',          label: '🎯 PYQ Section',          icon: Sparkles,      color: 'text-purple-500' },
    { id: 'insights',      label: '🔥 JEE Insights',         icon: Star,          color: 'text-red-500' },
    { id: 'summary',       label: '⚡ Chapter Summary',      icon: RotateCcw,     color: 'text-emerald-500' },
    { id: 'ask_ai',        label: '🤖 Ask AI Mentor',        icon: BrainCircuit,  color: 'text-emerald-500' },
  ] as const;

  const renderLine = (line: string, key: string | number) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={key} />;

    // Level badges
    const levelMatch = trimmed.match(/^#{1,3}\s*Level\s*([123])\s*[\u2014\u2013-]?\s*(.*)/i);
    if (levelMatch) {
      const lvl = parseInt(levelMatch[1]) as 1 | 2 | 3;
      const style = LEVEL_STYLES[lvl];
      return (
        <h3 key={key} className={cn('text-title-md font-bold mt-8 mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl', style.wrapper)}>
          <div className={cn('w-2 h-2 rounded-full', style.dot)} />
          <MathLine>{levelMatch[2].trim() || `Level ${lvl}`}</MathLine>
        </h3>
      );
    }

    // JEE Tip callout
    if (/^(?:\*\*)?JEE Tip:?(?:\*\*)?/i.test(trimmed)) {
      const tipText = trimmed.replace(/^\*?\*?JEE Tip:?\*?\*?\s*/i, '');
      return (
        <div key={key} className="my-6 p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl">
          <p className="text-amber-600 dark:text-amber-400 text-caption font-semibold flex items-center gap-2 mb-1">
            <Lightbulb className="w-4 h-4" /> JEE Tip
          </p>
          <p className="text-amber-800 dark:text-amber-200 text-body-sm leading-relaxed">
            <MathLine>{tipText}</MathLine>
          </p>
        </div>
      );
    }

    // Structured solution fields
    if (trimmed.startsWith('**Given:**'))   return <p key={key} className="my-2"><strong className="text-slate-900 dark:text-slate-100 font-extrabold text-body-md">Given:</strong> <MathLine>{trimmed.replace('**Given:**', '').trim()}</MathLine></p>;
    if (trimmed.startsWith('**To find:**')) return <p key={key} className="my-2"><strong className="text-slate-900 dark:text-slate-100 font-extrabold text-body-md">To find:</strong> <MathLine>{trimmed.replace('**To find:**', '').trim()}</MathLine></p>;
    if (trimmed.startsWith('**Concept:**')) return (
      <p key={key} className="my-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-body-sm font-semibold">
        <Layers className="w-4 h-4" /> Concept: <MathLine>{trimmed.replace('**Concept:**', '').trim()}</MathLine>
      </p>
    );
    if (trimmed.startsWith('**Solution:**')) return <p key={key} className="mt-4 mb-2 font-bold text-slate-900 dark:text-slate-100 text-body-md">Solution:</p>;
    if (trimmed.startsWith('**Answer:**')) return (
      <div key={key} className="my-4 p-4 bg-secondary/30 rounded-xl border border-border flex flex-wrap items-center gap-4">
        <strong className="text-slate-900 dark:text-slate-100 font-extrabold text-body-md">Answer:</strong>
        <div className="text-body-lg font-semibold overflow-x-auto"><MathLine>{trimmed.replace('**Answer:**', '').trim()}</MathLine></div>
      </div>
    );

    if (/^Step \d+:/i.test(trimmed)) return <p key={key} className="my-2 ml-4 text-muted-foreground text-body-sm"><MathLine>{trimmed}</MathLine></p>;

    if (trimmed.startsWith('# ')) return (
      <h1 key={key} className="text-[52px] font-bold tracking-tight mt-16 mb-8 text-slate-900 dark:text-slate-50 pb-3 leading-none font-display">
        <MathLine>{trimmed.slice(2)}</MathLine>
      </h1>
    );
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.slice(3).trim();
      let id: string | undefined = undefined;
      const lower = headingText.toLowerCase();
      if (lower.includes('overview')) {
        id = 'section-overview';
      } else if (lower.includes('learning outcomes')) {
        id = 'section-outcomes';
      } else if (lower.includes('theory')) {
        id = 'section-theory';
      } else if (lower.includes('visualization')) {
        id = 'section-visualization';
      } else if (lower.includes('formula')) {
        id = 'section-formulas';
      } else if (lower.includes('important graphs')) {
        id = 'section-graphs';
      } else if (lower.includes('solved examples') || lower.includes('examples')) {
        id = 'section-examples';
      } else if (lower.includes('pyq')) {
        id = 'section-pyqs';
      } else if (lower.includes('common mistakes')) {
        id = 'section-mistakes';
      } else if (lower.includes('shortcuts')) {
        id = 'section-shortcuts';
      } else if (lower.includes('revision sheet')) {
        id = 'section-revision';
      } else if (lower.includes('summary')) {
        id = 'section-summary';
      } else if (lower.includes('mind map')) {
        id = 'section-mindmap';
      } else if (lower.includes('exam tips')) {
        id = 'section-examtips';
      } else if (lower.includes('ai insights')) {
        id = 'section-aiinsights';
      }

      const SECTION_DESCRIPTIONS: Record<string, string> = {
        'section-overview': 'A high-level conceptual map of the chapter, connections, and JEE/NEET relevance.',
        'section-outcomes': 'Core concepts and problem-solving skills you must master in this chapter.',
        'section-theory': 'Kota-standard complete theoretical explanations with derivations and intuitive proofs.',
        'section-visualization': 'Real-world visual analogies and mental models to lock in the physics.',
        'section-formulas': 'Key mathematical equations, variables, and constraints for instant recall.',
        'section-graphs': 'Important physical relationships represented graphically with slider parameters.',
        'section-examples': 'Faculty-guided worked illustrations demonstrating step-by-step analytical paths.',
        'section-pyqs': 'Deep-dive analysis of actual questions from recent JEE Main, Advanced, & NEET.',
        'section-mistakes': 'Common conceptual traps, calculation pitfalls, and how AIR students avoid them.',
        'section-shortcuts': 'Rapid calculation tricks, dimension checking, and extreme-case elimination methods.',
        'section-revision': 'Quick summary sheet for last-minute recall before entering the exam hall.',
        'section-summary': 'A concise recap of the core principles and mathematical laws of the chapter.',
        'section-mindmap': 'Hierarchical conceptual connection map for absolute structural clarity.',
        'section-examtips': 'Strategic exam-day advice from India’s top coaching faculties.',
        'section-aiinsights': 'Custom Gemini-curated study pathways and personal focus areas.',
      };

      const desc = id ? SECTION_DESCRIPTIONS[id] : '';
      
      const numMatch = headingText.match(/^(\d+)\.\s*(.*)/);
      let displayNum = '';
      let displayTitle = headingText;
      if (numMatch) {
        const parsedNum = parseInt(numMatch[1]);
        displayNum = parsedNum < 10 ? `0${parsedNum}` : `${parsedNum}`;
        displayTitle = numMatch[2];
      }

      return (
        <div key={key} id={id} className="pt-16 pb-6 border-b border-border/60 scroll-mt-28 group text-left">
          <div className="flex items-baseline gap-3 mb-2">
            {displayNum && (
              <span className="text-[20px] font-extrabold text-sky-600 dark:text-sky-400 font-display">
                {displayNum}
              </span>
            )}
            <h2 className="text-[34px] font-bold tracking-tight font-display text-slate-900 dark:text-slate-100 leading-tight">
              <MathLine>{displayTitle}</MathLine>
            </h2>
          </div>
          {desc && (
            <p className="text-body-sm text-muted-foreground/80 font-medium leading-relaxed max-w-2xl mt-1">
              {desc}
            </p>
          )}
          {id === 'section-formulas' && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6 p-4 bg-sky-500/5 dark:bg-sky-950/10 rounded-2xl border border-sky-100/50 dark:border-sky-900/30 justify-between items-center">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search range, velocity, projectile..."
                  value={formulaSearchQuery}
                  onChange={(e) => setFormulaSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background border border-border focus:border-sky-500 focus:ring-sky-500/20 text-body-sm"
                />
              </div>
              {/* Quick Revision Switch */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-body-xs font-semibold text-muted-foreground">Quick Revision Mode</span>
                <button
                  type="button"
                  onClick={() => setIsQuickRevision(!isQuickRevision)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
                    isQuickRevision ? "bg-sky-600" : "bg-input"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                      isQuickRevision ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (trimmed.startsWith('### ')) return (
      <h3 key={key} className="text-[26px] font-bold mt-10 mb-4 text-slate-800 dark:text-slate-200 leading-snug">
        <MathLine>{trimmed.slice(4)}</MathLine>
      </h3>
    );

    if (trimmed.startsWith('####')) {
      const text = trimmed.replace(/^#+\s*/, '');
      if (!text) return <br key={key} />;
      return (
        <h4 key={key} className="text-title-md font-bold mt-8 mb-3 text-slate-700 dark:text-slate-300">
          <MathLine>{text}</MathLine>
        </h4>
      );
    }

    if (trimmed.startsWith('\u2022 ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) return (
      <li key={key} className="ml-6 my-4 text-slate-800 dark:text-slate-200 font-normal list-disc marker:text-indigo-500 dark:marker:text-indigo-400 leading-relaxed text-[18px]">
        <MathLine>{trimmed.slice(2)}</MathLine>
      </li>
    );

    if (trimmed.startsWith('\u26a1') || trimmed.startsWith('\ud83d\udca1')) return (
      <p key={key} className="ml-0 my-6 text-accent font-semibold bg-accent/5 p-4 rounded-xl border border-accent/20 leading-relaxed shadow-sm flex items-start gap-3 text-[18px]">
        <span className="text-title-md shrink-0 mt-0.5">{trimmed.substring(0, 2)}</span>
        <span><MathLine>{trimmed.substring(2)}</MathLine></span>
      </p>
    );

    if (trimmed.startsWith('---')) return <hr key={key} className="my-10 border-border/60" />;

    if (trimmed.match(/^\d+\./)) return (
      <li key={key} className="ml-6 my-4 text-slate-800 dark:text-slate-200 font-normal list-decimal marker:text-primary leading-relaxed text-[18px]">
        <MathLine>{trimmed.replace(/^\d+\.\s*/, '')}</MathLine>
      </li>
    );

    return (
      <p key={key} className="mb-6 leading-relaxed text-[18px] text-slate-800 dark:text-slate-200 font-normal">
        <MathLine>{trimmed}</MathLine>
      </p>
    );
  }; // end of renderLine

  const parseBlocks = (content: string) => {
    const cleanedContent = content.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/, '').trim();
    const blockRe = /\[(DERIVATION|SVG|CALLOUT|JEE_INSIGHT|CONCEPT|JEE_TRICK|COMMON_MISTAKE|NCERT_INSIGHT|TEACHER_SAYS|FORMULA|GRAPH|INTERACTIVE_GRAPH|DIAGRAM|INTERACTIVE_DIAGRAM|WORKED_EXAMPLE|INTERACTIVE_EXAMPLE|SIMULATION)(?:\s+title="([^"]+)")?\]([\s\S]*?)\[\/\1\]/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = blockRe.exec(cleanedContent)) !== null) {
      if (match.index > lastIndex) {
        const textSegment = cleanedContent.slice(lastIndex, match.index);
        const textElements = processNotesContent(textSegment, (line, i) => renderLine(line, `text-${keyIdx}-${i}`));
        elements.push(...textElements);
      }

      const blockType = match[1];
      const blockTitle = match[2] || '';
      const blockContent = match[3].trim();

      if (blockType === 'SVG') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 flex justify-center bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto" dangerouslySetInnerHTML={{ __html: blockContent }} />
        );
      } else if (blockType === 'DERIVATION') {
        elements.push(
          <CollapsibleDerivation 
            key={`block-${keyIdx}`} 
            content={blockContent} 
            keyIdx={keyIdx} 
            renderLine={renderLine} 
          />
        );
      } else if (blockType === 'CALLOUT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-500/5 dark:bg-sky-950/10 border border-sky-100/40 dark:border-sky-900/30 border-l-4 border-l-sky-600 rounded-r-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
            <h4 className="text-sky-800 dark:text-sky-400 text-body-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" /> Concept Callout
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-[1.8] mt-3 text-[18px] font-normal">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `call-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'JEE_INSIGHT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-500/5 dark:bg-sky-950/10 border border-dashed border-sky-300 dark:border-sky-900/40 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
            <h4 className="text-sky-800 dark:text-sky-400 text-body-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" /> Star Batch JEE Insight
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-[1.8] mt-3 text-[18px] font-normal">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `jee-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'CONCEPT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-500/5 dark:bg-sky-950/10 border border-sky-100/40 dark:border-sky-900/30 border-l-4 border-l-sky-600 rounded-r-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
            <h4 className="text-sky-850 dark:text-sky-400 text-body-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" /> Core Concept
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-[1.8] mt-3 text-[18px] font-normal">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `concept-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'JEE_TRICK') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-500/5 dark:bg-sky-950/10 border border-sky-100/40 dark:border-sky-900/30 border-l-4 border-l-sky-600 rounded-r-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
            <h4 className="text-sky-850 dark:text-sky-400 text-body-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" /> JEE Shortcut Trick
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-[1.8] mt-3 text-[18px] font-normal">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `trick-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'COMMON_MISTAKE') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-500/5 dark:bg-sky-950/10 border border-sky-100/40 dark:border-sky-900/30 border-l-4 border-l-sky-600 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
            <h4 className="text-sky-800 dark:text-sky-400 text-body-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" /> Common Pitfall to Avoid
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-[1.8] mt-3 text-[18px] font-normal">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `mistake-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'NCERT_INSIGHT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-500/5 dark:bg-sky-950/10 border border-sky-100/40 dark:border-sky-900/30 border-l-4 border-l-sky-600 rounded-r-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
            <h4 className="text-sky-800 dark:text-sky-400 text-body-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" /> NCERT Line Insight
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-[1.8] mt-3 text-[18px] font-normal">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `ncert-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'TEACHER_SAYS') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-500/5 dark:bg-sky-950/10 border border-sky-100/40 dark:border-sky-900/30 border-l-4 border-l-sky-600 shadow-[0_2px_12px_rgba(79,70,229,0.02)] flex gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-[20px] shrink-0 border border-sky-500/20">
              👨‍🏫
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-sky-600 dark:text-sky-400 text-body-sm font-extrabold uppercase tracking-wider">
                Teacher's Advice
              </h4>
              <div className="text-slate-800 dark:text-slate-200 italic font-medium leading-[1.8] text-[18px] border-l-2 border-sky-500/20 pl-4 py-1">
                {processNotesContent(blockContent, (line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <br key={`t-${keyIdx}-${i}`} />;
                  return (
                    <p key={`t-${keyIdx}-${i}`} className="my-3">
                      <MathLine>{trimmed}</MathLine>
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        );
      } else if (blockType === 'FORMULA') {
        const variablesMatch = blockContent.match(/\*\*Variables:\*\*\s*(.*?)(?=\*\*|$)/is);
        const unitsMatch = blockContent.match(/\*\*SI Units:\*\*\s*(.*?)(?=\*\*|$)/is);
        const physicalMeaningMatch = blockContent.match(/\*\*Physical Meaning:\*\*\s*(.*?)(?=\*\*|$)/is);
        const whenToUseMatch = blockContent.match(/\*\*When to use:\*\*\s*(.*?)(?=\*\*|$)/is);
        const whenNotToUseMatch = blockContent.match(/\*\*When not to use:\*\*\s*(.*?)(?=\*\*|$)/is) || blockContent.match(/\*\*When NOT to use:\*\*\s*(.*?)(?=\*\*|$)/is);
        const mistakeMatch = blockContent.match(/\*\*Common Mistake:\*\*\s*(.*?)(?=\*\*|$)/is) || blockContent.match(/\*\*Common Mistakes:\*\*\s*(.*?)(?=\*\*|$)/is);
        const trickMatch = blockContent.match(/\*\*Memory Trick:\*\*\s*(.*?)(?=\*\*|$)/is);
        const solvedExampleMatch = blockContent.match(/\*\*One Solved Example:\*\*\s*(.*?)(?=\*\*|$)/is) || blockContent.match(/\*\*Solved Example:\*\*\s*(.*?)(?=\*\*|$)/is);
        const relatedFormulaMatch = blockContent.match(/\*\*Related Formula:\*\*\s*(.*?)(?=\*\*|$)/is);
        const derivationMatch = blockContent.match(/\*\*Derivation:\*\*\s*(.*?)(?=\*\*|$)/is);
        
        let equation = blockContent;
        const splitKeywords = [
          '**Variables:**',
          '**SI Units:**',
          '**Physical Meaning:**',
          '**When to use:**',
          '**When NOT to use:**',
          '**When not to use:**',
          '**Memory Trick:**',
          '**Common Mistake:**',
          '**Common Mistakes:**',
          '**One Solved Example:**',
          '**Solved Example:**',
          '**Related Formula:**',
          '**Derivation:**'
        ];
        
        let firstKeywordIndex = -1;
        for (const kw of splitKeywords) {
          const idx = blockContent.indexOf(kw);
          if (idx !== -1 && (firstKeywordIndex === -1 || idx < firstKeywordIndex)) {
            firstKeywordIndex = idx;
          }
        }
        
        if (firstKeywordIndex !== -1) {
          equation = blockContent.substring(0, firstKeywordIndex).trim();
        }

        const isMatch = !formulaSearchQuery || 
          blockTitle.toLowerCase().includes(formulaSearchQuery.toLowerCase()) || 
          blockContent.toLowerCase().includes(formulaSearchQuery.toLowerCase());

        if (isMatch) {
          elements.push(
            <FormulaCard 
              key={`block-${keyIdx}`} 
              equation={equation} 
              title={blockTitle} 
              variables={variablesMatch?.[1]?.trim()}
              units={unitsMatch?.[1]?.trim()}
              physicalMeaning={physicalMeaningMatch?.[1]?.trim()}
              whenToUse={whenToUseMatch?.[1]?.trim()}
              whenNotToUse={whenNotToUseMatch?.[1]?.trim()}
              commonMistake={mistakeMatch?.[1]?.trim()}
              memoryTrick={trickMatch?.[1]?.trim()}
              solvedExample={solvedExampleMatch?.[1]?.trim()}
              relatedFormula={relatedFormulaMatch?.[1]?.trim()}
              derivation={derivationMatch?.[1]?.trim()}
              isCompact={isQuickRevision}
            />
          );
        }
      } else if (blockType === 'GRAPH' || blockType === 'INTERACTIVE_GRAPH') {
        try {
          const config = JSON.parse(cleanJsonString(blockContent));
          elements.push(
            <InteractiveGraph
              key={`block-${keyIdx}`}
              graphType={config.graphType}
              title={config.title || blockTitle}
              xAxis={config.xAxis}
              yAxis={config.yAxis}
              equation={config.equation}
              sliders={config.sliders || config.slider || {}}
            />
          );
        } catch (e) {
          console.warn('[ChapterNotesPage] InteractiveGraph parse failed, rendering fallback:', e);
          elements.push(
            <div key={`block-${keyIdx}`} className="p-5 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 text-body-sm flex flex-col gap-2 my-8 shadow-sm">
              <span className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Graph Visualisation Unavailable</span>
              <span className="text-muted-foreground">The interactive simulation configuration was slightly malformed. Our engineering team has been notified.</span>
            </div>
          );
        }
      } else if (blockType === 'DIAGRAM' || blockType === 'INTERACTIVE_DIAGRAM') {
        try {
          const config = JSON.parse(cleanJsonString(blockContent));
          elements.push(
            <InteractiveDiagram
              key={`block-${keyIdx}`}
              type={config.type}
              title={config.title || blockTitle}
            />
          );
        } catch (e) {
          console.warn('[ChapterNotesPage] InteractiveDiagram parse failed, rendering fallback:', e);
          elements.push(
            <div key={`block-${keyIdx}`} className="p-5 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 text-body-sm flex flex-col gap-2 my-8 shadow-sm">
              <span className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Interactive Diagram Unavailable</span>
              <span className="text-muted-foreground">The visual component configuration was slightly malformed.</span>
            </div>
          );
        }
      } else if (blockType === 'WORKED_EXAMPLE' || blockType === 'INTERACTIVE_EXAMPLE') {
        try {
          const config = JSON.parse(cleanJsonString(blockContent));
          elements.push(
            <InteractiveExample
              key={`block-${keyIdx}`}
              id={`example-${keyIdx}`}
              question={config.question}
              hints={config.hints}
              thinkTime={config.thinkTime}
              steps={config.steps}
              finalAnswer={config.finalAnswer}
              alternativeMethod={config.alternativeMethod}
              commonMistakes={config.commonMistakes}
            />
          );
        } catch (e) {
          console.warn('[ChapterNotesPage] InteractiveExample parse failed, rendering fallback:', e);
          elements.push(
            <div key={`block-${keyIdx}`} className="p-5 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 text-body-sm flex flex-col gap-2 my-8 shadow-sm">
              <span className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Solved Example Mismatch</span>
              <span className="text-muted-foreground">The step-by-step example could not be parsed properly.</span>
            </div>
          );
        }
      } else if (blockType === 'SIMULATION') {
        try {
          const config = JSON.parse(cleanJsonString(blockContent));
          elements.push(
            <SimulationEngine
              key={`block-${keyIdx}`}
              type={config.type}
              title={config.title || blockTitle}
            />
          );
        } catch (e) {
          console.warn('[ChapterNotesPage] SimulationEngine parse failed, rendering fallback:', e);
          elements.push(
            <div key={`block-${keyIdx}`} className="p-5 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 text-body-sm flex flex-col gap-2 my-8 shadow-sm">
              <span className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Interactive Simulation Unavailable</span>
              <span className="text-muted-foreground">The physics simulation engine config failed to load.</span>
            </div>
          );
        }
      }

      keyIdx++;
      lastIndex = blockRe.lastIndex;
    }

    if (lastIndex < cleanedContent.length) {
      const textSegment = cleanedContent.slice(lastIndex);
      const textElements = processNotesContent(textSegment, (line, i) => renderLine(line, `text-${keyIdx}-${i}`));
      elements.push(...textElements);
    }

    return elements;
  };

  const getNextChapter = () => {
    if (!chapter) return null;
    const siblingChapters = allChapters.filter(ch => ch.subject === chapter.subject);
    const index = siblingChapters.findIndex(ch => ch.id === chapter.id);
    if (index !== -1 && index < siblingChapters.length - 1) {
      return siblingChapters[index + 1];
    }
    return null;
  };

  const nextChapter = getNextChapter();

  return (
    <MainLayout title={`Notes: ${chapter.name}`}>
      {/* Floating Top Reading Progress Bar (P0) */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300 py-3.5 px-6 flex items-center justify-between",
        showFloatingBar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-3">
          <span className="font-bold text-body-sm text-foreground">{chapter.name}</span>
          <span className="text-caption text-muted-foreground">| Classroom Notes</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32 sm:w-48 bg-secondary rounded-full h-2 overflow-hidden border border-border">
            <div 
              className="bg-accent h-full transition-all duration-300 rounded-full" 
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <span className="text-caption font-bold text-foreground whitespace-nowrap">{scrollProgress}% completed</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-6 lg:px-8">

        {/* Back navigation */}
        <div className="pt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/chapter/${chapter.id}`)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chapter
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="default" size="sm" className="h-10" onClick={handleDownload} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              Save PDF
            </Button>
          </div>
        </div>

        {/* Hero Learning Header (V4) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/40 via-secondary/15 to-background dark:from-indigo-950/20 dark:via-secondary/5 dark:to-background text-foreground p-6 sm:p-8 shadow-sm border border-border/80">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Chapter Name */}
            <div className="space-y-1">
              <span className="text-caption font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Based on NCERT + PYQ Analysis + Exam Trends
              </span>
              <h1 className="text-heading-xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
                {chapter.name}
              </h1>
            </div>

            {/* Chapter Description */}
            <p className="text-body-sm font-semibold text-muted-foreground max-w-2xl leading-relaxed">
              Topics: {chapter.topics.join(' • ')}
            </p>

            <div className="flex flex-wrap gap-2.5 items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-body-xs font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-indigo-500 dark:fill-indigo-400 stroke-indigo-500 dark:stroke-indigo-400" />
                <span>Priority: {priority.text}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-body-xs font-bold shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>🔥 Trend: {trendInsight}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-body-xs font-bold shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Difficulty: {chapter.difficulty}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                onClick={() => scrollToSection('section-theory')} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 text-body-sm h-10"
              >
                Start Reading
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('section-revision')} 
                className="bg-background hover:bg-secondary border-border text-foreground font-bold px-5 py-2 rounded-xl transition-all text-body-sm h-10"
              >
                Quick Revision
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('section-pyqs')} 
                className="bg-background hover:bg-secondary border-border text-foreground font-bold px-5 py-2 rounded-xl transition-all text-body-sm h-10"
              >
                PYQ Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* PYQ Intelligence Dashboard (V3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {!chapter.pyqData || chapter.pyqData.total === 0 ? (
            // Empty data handling fallback
            <>
              {[
                { title: '🎯 PYQ Coverage', icon: GraduationCap },
                { title: '🧠 Advanced Analysis', icon: BrainCircuit },
                { title: '📈 Most Tested Concept', icon: BookOpen },
                { title: '🎯 Exam Strategy', icon: Sparkles }
              ].map((card, i) => (
                <div key={i} className="h-full p-6 rounded-2xl bg-gradient-to-br from-indigo-50/10 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-indigo-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground border border-border/40">
                      <card.icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-caption tracking-wider">{card.title}</h3>
                  </div>
                  <div className="space-y-1 mt-auto">
                    <p className="text-body-sm font-bold text-foreground">PYQ Analysis Available Soon</p>
                    <p className="text-caption font-semibold text-muted-foreground tracking-wider">Collecting Historical Data</p>
                  </div>
                </div>
              ))}
            </>
          ) : isNeet ? (
            // NEET Ecosystem Dashboard
            <>
              {/* Card 1: NEET PYQ Coverage */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-indigo-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-indigo-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">NEET PYQ Coverage</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-title-lg font-bold text-slate-900 dark:text-slate-50">{chapter.pyqData.total} Questions</p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>Post-COVID: {chapter.pyqData.postCovid} Qs</div>
                    <div>Trend: High Yield Syllabus</div>
                  </div>
                </div>
              </div>

              {/* Card 2: NCERT Coverage */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-emerald-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">NCERT Coverage</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-title-lg font-bold text-emerald-600 dark:text-emerald-400">100% Mapped</p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>Focus: Diagrams & Key Lines</div>
                    <div>Direct lines frequently tested</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Tested Concept */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-rose-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-rose-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-rose-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-500/10">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Most Tested Concept</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-body-sm font-bold text-slate-950 dark:text-slate-50 line-clamp-1">
                    {chapter.pyqData.trendingConcepts?.[0] || chapter.topics?.[0] || 'Core Concepts'}
                  </p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>{Math.round(25 + (chapter.pyqData.total % 10))}% of NEET PYQs</div>
                    <div>Recent: 2026, 2025, 2024</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Exam Strategy */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-amber-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-amber-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Exam Strategy</h3>
                </div>
                <div className="space-y-1.5 mt-auto">
                  <div className="text-caption font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block">Focus First:</span>
                    <span className="text-muted-foreground block truncate">{chapter.topics?.[0] || 'Core Concepts'}</span>
                    <span className="text-red-500 dark:text-red-400 font-bold block mt-1">Avoid:</span>
                    <span className="text-muted-foreground block truncate">Ignoring NCERT side-notes</span>
                  </div>
                </div>
              </div>
            </>
          ) : isCuet ? (
            // CUET Ecosystem Dashboard
            <>
              {/* Card 1: CUET PYQ Coverage */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-indigo-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-indigo-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">CUET PYQ Coverage</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-title-lg font-bold text-slate-900 dark:text-slate-50">{chapter.pyqData.total} Questions</p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>Trend: High Recall Speed</div>
                    <div>Speed & Accuracy focus</div>
                  </div>
                </div>
              </div>

              {/* Card 2: NCERT Focus & Theory */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-emerald-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">NCERT Focus</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-title-lg font-bold text-emerald-600 dark:text-emerald-400">Direct Theory</p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>Status: 100% Core Syllabus</div>
                    <div>Definition & Fact-Based</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Tested Concept */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-rose-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-rose-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-rose-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-500/10">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Most Tested Concept</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-body-sm font-bold text-slate-950 dark:text-slate-50 line-clamp-1">
                    {chapter.pyqData.trendingConcepts?.[0] || chapter.topics?.[0] || 'Core Concepts'}
                  </p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>{Math.round(25 + (chapter.pyqData.total % 10))}% of CUET PYQs</div>
                    <div>Recent Appearance: 2026, 2025</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Exam Strategy */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-amber-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-amber-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Exam Strategy</h3>
                </div>
                <div className="space-y-1.5 mt-auto">
                  <div className="text-caption font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block">Focus First:</span>
                    <span className="text-muted-foreground block truncate">{chapter.topics?.[0] || 'Core Concepts'}</span>
                    <span className="text-red-500 dark:text-red-400 font-bold block mt-1">Avoid:</span>
                    <span className="text-muted-foreground block truncate">Skipping basic definition theory</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // JEE Ecosystem Dashboard (isJee)
            <>
              {/* Card 1: JEE Main PYQ Coverage */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-indigo-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-indigo-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">JEE Main</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-title-lg font-bold text-slate-900 dark:text-slate-50">{Math.round(chapter.pyqData.total * 0.65)} Questions</p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>Coverage: {Math.round(chapter.pyqData.total * 0.65)} PYQs</div>
                    <div>Confidence: {chapter.weightage} Weightage</div>
                  </div>
                </div>
              </div>

              {/* Card 2: JEE Advanced Analysis */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-emerald-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">JEE Advanced</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-title-lg font-bold text-emerald-600 dark:text-emerald-400">{chapter.pyqData.total - Math.round(chapter.pyqData.total * 0.65)} Questions</p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>Difficulty: {chapter.difficulty === 'Hard' ? 'Concept Intensive' : 'Core Practice'}</div>
                    <div>Focus: Multi-Concept Problems</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Tested Concept */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-rose-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-rose-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-rose-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-500/10">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Most Tested Concept</h3>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-body-sm font-bold text-slate-950 dark:text-slate-50 line-clamp-1">
                    {chapter.pyqData.trendingConcepts?.[0] || chapter.topics?.[0] || 'Core Concepts'}
                  </p>
                  <div className="text-caption font-semibold text-muted-foreground flex flex-col gap-0.5">
                    <div>{Math.round(25 + (chapter.pyqData.total % 10))}% of chapter PYQs</div>
                    <div>Recent: 2026, 2025, 2024</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Exam Strategy */}
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-amber-50/20 via-background to-secondary/10 dark:from-slate-900/30 dark:via-background dark:to-secondary/5 border border-border/80 hover:border-amber-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Exam Strategy</h3>
                </div>
                <div className="space-y-1.5 mt-auto">
                  <div className="text-caption font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block">Focus First:</span>
                    <span className="text-muted-foreground block truncate">{chapter.topics?.[0] || 'Core Concepts'}</span>
                    <span className="text-red-500 dark:text-red-400 font-bold block mt-1">Avoid:</span>
                    <span className="text-muted-foreground block truncate">Blind Formula Memorization</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Segmented Navigation Tabs */}
        <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border/80 py-3 -mx-4 px-4 sm:mx-0">
          <div className="max-w-[860px] mx-auto flex items-center gap-1 p-1 bg-secondary/40 dark:bg-secondary/10 rounded-2xl border border-border/60 overflow-x-auto hide-scrollbar">
            {smartModes.map(mode => {
              const Icon = mode.icon;
              let targetSection = 'section-theory';
              if (mode.id === 'overview') targetSection = 'section-overview';
              else if (mode.id === 'theory') targetSection = 'section-theory';
              else if (mode.id === 'formulas') targetSection = 'section-formulas';
              else if (mode.id === 'concepts') targetSection = 'section-concepts';
              else if (mode.id === 'examples') targetSection = 'section-examples';
              else if (mode.id === 'pyqs') targetSection = 'section-pyqs';
              else if (mode.id === 'insights') targetSection = 'section-insights';
              else if (mode.id === 'summary') targetSection = 'section-summary';

              const isActive = activeSmartMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    if (mode.id === 'ask_ai') {
                      navigate(`/ask-prepentrance?chapter=${chapter.id}`);
                    } else {
                      scrollToSection(targetSection);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 relative",
                    isActive
                      ? "bg-background dark:bg-slate-900 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-border/40"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-indigo-600 dark:text-indigo-400" : mode.color)} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apple Notes + Notion + Allen Hybrid Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Left Table of Contents Navigator (P1 - Notion/Apple Books Hybrid) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-36 self-start p-2 bg-transparent space-y-5">
            <h4 className="font-bold text-caption uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2 pl-3">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> ON THIS PAGE
            </h4>
            <ul className="space-y-1 border-l border-border/60 ml-3.5 pl-3">
              {sections.map(sec => {
                const isActive = activeSection === sec.id;
                const isCompleted = completedSections[sec.id];
                return (
                  <li key={sec.id}>
                    <button
                      onClick={() => scrollToSection(sec.id)}
                      className={cn(
                        "w-full text-left text-body-sm py-1 px-2 rounded-lg transition-all flex items-center justify-between group",
                        isActive 
                          ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5 dark:bg-indigo-500/10" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 font-medium"
                      )}
                    >
                      <span className="truncate pr-2">{sec.label}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 opacity-100" />
                      ) : isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-muted-foreground/30 shrink-0 transition-colors" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="pt-3 border-t border-border/60 pl-3 flex items-center justify-between text-caption text-muted-foreground font-semibold">
              <span>Reading progress:</span>
              <span className="text-foreground font-bold">{scrollProgress}%</span>
            </div>
          </div>

          {/* Main Textbook Document Card */}
          <div className="lg:col-span-9 col-span-12 space-y-6">
            <AnimatePresence mode="wait">
              {isGenerating && notes === '' ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 bg-card border border-border rounded-3xl shadow-sm"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center mb-6 shadow-2xl shadow-accent/30 animate-pulse">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-accent animate-spin-slow" />
                    </div>
                  </div>
                  <h3 className="text-heading-md font-display font-bold text-foreground mb-3">
                    Distilling Study Content...
                  </h3>
                  <p className="text-muted-foreground text-center max-w-sm text-body-lg">
                    Preparing classroom notes for {chapter.name} using senior faculty exam specifications...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Core Notes Content Box (Continuous, borderless textbook flow) */}
                  <div className="bg-transparent relative">
                    <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-[860px] mx-auto space-y-10 leading-[1.8]">
                      {parseBlocks(notes)}
                      {isGenerating && <span className="inline-block w-3 h-5 bg-indigo-600 animate-pulse ml-2 align-middle rounded-sm" />}
                    </div>
                  </div>

                  {/* Chapter Completion Milestone UX (Level Mastery Card) */}
                  {!isGenerating && notes !== '' && (
                    <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 dark:from-emerald-500/10 dark:via-background dark:to-teal-500/5 border border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.03)] my-12 space-y-8 max-w-[860px] mx-auto text-left">
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-caption font-bold tracking-wider uppercase">
                          🎉 Chapter Completed
                        </span>
                        <h3 className="text-heading-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                          You have successfully completed {chapter.name}.
                        </h3>
                        <p className="text-muted-foreground text-body-sm">
                          Excellent work! You have completed all visual illustrations, formula reviews, and faculty insights for this chapter.
                        </p>
                      </div>

                      {/* Mastery Stats & Progress Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Star-Based Mastery Ratings */}
                        <div className="p-6 bg-secondary/30 dark:bg-slate-900/40 rounded-2xl border border-border/60 space-y-4">
                          <h4 className="font-bold text-body-xs uppercase tracking-wider text-muted-foreground">Chapter Mastery</h4>
                          <div className="space-y-3 font-semibold text-body-sm text-foreground">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-medium">Theory & Proofs</span>
                              <span className="text-amber-500 tracking-wider">★★★★★</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-medium">Formula Sheet</span>
                              <span className="text-amber-500 tracking-wider">★★★★★</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-medium">Solved Examples</span>
                              <span className="text-amber-500 tracking-wider">★★★★★</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-medium">Revision Sheet</span>
                              <span className="text-amber-500 tracking-wider">★★★★☆</span>
                            </div>
                            <div className="pt-3 border-t border-border flex items-center justify-between">
                              <span className="text-foreground font-bold">Overall Chapter Mastery</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-black text-body-md">82%</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress checklist checkmarks */}
                        <div className="p-6 bg-secondary/30 dark:bg-slate-900/40 rounded-2xl border border-border/60 flex flex-col justify-between">
                          <h4 className="font-bold text-body-xs uppercase tracking-wider text-muted-foreground mb-3">Milestone Progress</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2.5 text-body-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4.5 h-4.5" />
                              <span>Theory Covered</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-body-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4.5 h-4.5" />
                              <span>Formula Sheet Reviewed</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-body-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4.5 h-4.5" />
                              <span>Examples Solved</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-body-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4.5 h-4.5" />
                              <span>Revision Complete</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Level Mastery Strategic Action pathways */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-emerald-500/10">
                        {nextChapter ? (
                          <Button 
                            onClick={() => {
                              navigate(`/chapter/${nextChapter.id}/notes`);
                              window.scrollTo(0, 0);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 h-11 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex-1 text-body-sm"
                          >
                            Continue to {nextChapter.name} →
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 h-11 rounded-xl transition-all shadow-md flex-1 text-body-sm"
                          >
                            Go to Dashboard
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/practice?chapter=${chapter.id}`)}
                          className="bg-background hover:bg-secondary border-border text-foreground font-bold px-6 h-11 rounded-xl transition-all flex-1 text-body-sm"
                        >
                          Start Practice
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/test?chapter=${chapter.id}`)}
                          className="bg-background hover:bg-secondary border-border text-foreground font-bold px-6 h-11 rounded-xl transition-all flex-1 text-body-sm"
                        >
                          Start Test
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChapterNotesPage;
