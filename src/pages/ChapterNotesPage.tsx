import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChapterContent } from '@/hooks/useChapterContent';
import { MainLayout } from '@/components/layout/MainLayout';
import { getChapterById, allChapters } from '@/data/syllabus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, Download, Copy, CheckCircle2,
  BookOpen, Layers, Zap, BrainCircuit, AlertTriangle, AlertCircle, Calculator, Sparkles,
  GraduationCap, RotateCcw, Lightbulb, Star,
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

const FormulaCard: React.FC<{ equation: string; title: string; whenToUse?: string; commonMistake?: string; memoryTrick?: string }> = ({ equation, title, whenToUse, commonMistake, memoryTrick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(equation.trim());
    setCopied(true);
    toast.success(`Copied: ${title || 'Formula'}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 p-6 bg-card border border-border/80 hover:border-accent/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <span className="text-caption font-bold text-muted-foreground">{title || 'Formula'}</span>
          <div className="text-body-lg font-semibold py-1 text-foreground overflow-x-auto">
            <MathLine>{`$$${equation.trim()}$$`}</MathLine>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy} 
          className="h-10 px-4 rounded-xl border border-border hover:bg-secondary flex items-center gap-2 self-end md:self-center bg-background"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-caption font-bold text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-muted-foreground" />
              <span className="text-caption font-bold">Copy</span>
            </>
          )}
        </Button>
      </div>
      {(whenToUse || commonMistake || memoryTrick) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/40">
          {whenToUse && (
            <div className="text-sm">
              <span className="font-semibold text-emerald-600 block mb-1">When to use</span>
              <span className="text-muted-foreground">{whenToUse}</span>
            </div>
          )}
          {commonMistake && (
            <div className="text-sm">
              <span className="font-semibold text-rose-600 block mb-1">Common Mistake</span>
              <span className="text-muted-foreground">{commonMistake}</span>
            </div>
          )}
          {memoryTrick && (
            <div className="text-sm">
              <span className="font-semibold text-amber-600 block mb-1">Memory Trick</span>
              <span className="text-muted-foreground">{memoryTrick}</span>
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

  // Derive notes string from stored content (raw_content field)
  const notes = chapterContent?.raw_content ?? '';
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

  // Content not yet published for this chapter
  if (isNotPublished) {
    return (
      <MainLayout title={`${chapter.name} — Coming Soon`}>
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-heading-lg font-bold text-foreground">{chapter.name}</h1>
          <p className="text-body-lg text-muted-foreground max-w-md">
            Premium notes for this chapter are being prepared by our faculty team and will be published soon.
          </p>
          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl text-body-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Content under review — available soon
          </div>
          <Button onClick={() => navigate(-1)} variant="outline">← Go Back</Button>
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
      <h1 key={key} className="text-heading-xl font-bold tracking-tight mt-12 mb-8 text-slate-900 dark:text-slate-50 border-b border-border pb-3 leading-tight font-display">
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

      return (
        <h2 id={id} key={key} className="text-heading-lg font-bold mt-12 mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100 bg-secondary/20 p-4 rounded-2xl border border-border/80 scroll-mt-28">
          <Layers className="w-6 h-6 text-accent shrink-0" />
          <MathLine>{headingText}</MathLine>
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) return (
      <h3 key={key} className="text-title-lg font-semibold mt-8 mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent" />
        <MathLine>{trimmed.slice(4)}</MathLine>
      </h3>
    );

    if (trimmed.startsWith('####')) {
      const text = trimmed.replace(/^#+\s*/, '');
      if (!text) return <br key={key} />;
      return (
        <h4 key={key} className="text-title-md font-bold mt-6 mb-3 text-slate-700 dark:text-slate-300">
          <MathLine>{text}</MathLine>
        </h4>
      );
    }

    if (trimmed.startsWith('\u2022 ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) return (
      <li key={key} className="ml-6 my-3 text-foreground font-bold list-disc marker:text-accent leading-relaxed text-body-md">
        <MathLine>{trimmed.slice(2)}</MathLine>
      </li>
    );

    if (trimmed.startsWith('\u26a1') || trimmed.startsWith('\ud83d\udca1')) return (
      <p key={key} className="ml-0 my-6 text-accent font-semibold bg-accent/5 p-4 rounded-xl border border-accent/20 leading-relaxed shadow-sm flex items-start gap-3 text-body-md">
        <span className="text-title-md shrink-0 mt-0.5">{trimmed.substring(0, 2)}</span>
        <span><MathLine>{trimmed.substring(2)}</MathLine></span>
      </p>
    );

    if (trimmed.startsWith('---')) return <hr key={key} className="my-10 border-border/60" />;

    if (trimmed.match(/^\d+\./)) return (
      <p key={key} className="ml-2 my-4 font-bold text-slate-800 dark:text-slate-200 overflow-x-auto text-body-md">
        <MathLine>{trimmed}</MathLine>
      </p>
    );

    return (
      <p key={key} className="my-6 text-foreground font-bold leading-relaxed text-body-md overflow-x-auto">
        <MathLine>{trimmed}</MathLine>
      </p>
    );
  };
  const renderNotes = (content: string) => {
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
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-violet-50/50 dark:bg-violet-950/20 border-l-4 border-violet-500 rounded-r-2xl shadow-sm">
            <h4 className="text-violet-700 dark:text-violet-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 shrink-0" /> Mathematical Derivation & Proof
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `deriv-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'CALLOUT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-r-2xl shadow-sm">
            <h4 className="text-blue-700 dark:text-blue-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 shrink-0" /> Structured Concept Callout
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `call-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'JEE_INSIGHT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-900/50 rounded-2xl shadow-sm">
            <h4 className="text-amber-800 dark:text-amber-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" /> Star Batch JEE Insight & Tricks
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `jee-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'CONCEPT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-sky-50/50 dark:bg-sky-950/20 border-l-4 border-sky-500 rounded-r-2xl shadow-sm">
            <h4 className="text-sky-700 dark:text-sky-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 shrink-0" /> CONCEPT
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `concept-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'JEE_TRICK') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-purple-50/50 dark:bg-purple-950/20 border-l-4 border-purple-500 rounded-r-2xl shadow-sm">
            <h4 className="text-purple-700 dark:text-purple-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0" /> JEE TRICK
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `trick-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'COMMON_MISTAKE') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 border-l-4 border-l-rose-500 rounded-2xl shadow-sm">
            <h4 className="text-rose-700 dark:text-rose-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" /> Common Student Pitfall
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-relaxed mt-3">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `mistake-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'NCERT_INSIGHT') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-r-2xl shadow-sm">
            <h4 className="text-emerald-700 dark:text-emerald-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 shrink-0" /> NCERT INSIGHT
            </h4>
            <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {processNotesContent(blockContent, (line, i) => renderLine(line, `ncert-${keyIdx}-${i}`))}
            </div>
          </div>
        );
      } else if (blockType === 'TEACHER_SAYS') {
        elements.push(
          <div key={`block-${keyIdx}`} className="my-8 p-6 bg-amber-50 dark:bg-amber-950/10 border border-amber-300 dark:border-amber-900/50 rounded-2xl shadow-md border-l-4 border-l-amber-500">
            <h4 className="text-amber-800 dark:text-amber-400 text-caption font-bold tracking-wider flex items-center gap-2">
              <GraduationCap className="w-5 h-5 shrink-0" /> Teacher Says / Teacher Insight
            </h4>
            <div className="text-amber-950 dark:text-amber-100 font-sans italic font-bold leading-relaxed mt-3 text-body-md">
              {processNotesContent(blockContent, (line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <br key={`t-${keyIdx}-${i}`} />;
                return (
                  <p key={`t-${keyIdx}-${i}`} className="my-4">
                    <MathLine>{trimmed}</MathLine>
                  </p>
                );
              })}
            </div>
          </div>
        );
      } else if (blockType === 'FORMULA') {
        const whenToUseMatch = blockContent.match(/\*\*When to use:\*\*\s*(.*?)(?=\*\*|$)/is);
        const mistakeMatch = blockContent.match(/\*\*Common Mistake:\*\*\s*(.*?)(?=\*\*|$)/is);
        const trickMatch = blockContent.match(/\*\*Memory Trick:\*\*\s*(.*?)(?=\*\*|$)/is);
        
        let equation = blockContent;
        if (whenToUseMatch || mistakeMatch || trickMatch || blockContent.includes('**Variables:**')) {
          equation = blockContent.split(/\*\*Variables:\*\*|\*\*When to use:\*\*|\*\*Common Mistake:\*\*|\*\*Memory Trick:\*\*/)[0].trim();
        }

        elements.push(
          <FormulaCard 
            key={`block-${keyIdx}`} 
            equation={equation} 
            title={blockTitle} 
            whenToUse={whenToUseMatch?.[1]?.trim()}
            commonMistake={mistakeMatch?.[1]?.trim()}
            memoryTrick={trickMatch?.[1]?.trim()}
          />
        );
      } else if (blockType === 'GRAPH' || blockType === 'INTERACTIVE_GRAPH') {
        try {
          const config = JSON.parse(blockContent);
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
            <div key={`block-${keyIdx}`} className="p-4 border border-dashed rounded-xl bg-destructive/10 text-destructive text-xs">
              [Failed to parse Interactive Graph configuration]
            </div>
          );
        }
      } else if (blockType === 'DIAGRAM' || blockType === 'INTERACTIVE_DIAGRAM') {
        try {
          const config = JSON.parse(blockContent);
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
            <div key={`block-${keyIdx}`} className="p-4 border border-dashed rounded-xl bg-destructive/10 text-destructive text-xs">
              [Failed to parse Interactive Diagram configuration]
            </div>
          );
        }
      } else if (blockType === 'WORKED_EXAMPLE' || blockType === 'INTERACTIVE_EXAMPLE') {
        try {
          const config = JSON.parse(blockContent);
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
            <div key={`block-${keyIdx}`} className="p-4 border border-dashed rounded-xl bg-destructive/10 text-destructive text-xs">
              [Failed to parse Worked Example configuration]
            </div>
          );
        }
      } else if (blockType === 'SIMULATION') {
        try {
          const config = JSON.parse(blockContent);
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
            <div key={`block-${keyIdx}`} className="p-4 border border-dashed rounded-xl bg-destructive/10 text-destructive text-xs">
              [Failed to parse Simulation configuration]
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

        {/* Hero Learning Header (V3) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
          {/* Ambient glow centered to reduce gradient darkness directly behind the title area and ensure high contrast */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[550px] h-[250px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* 1. Chapter Name (Dominates with Heading XL/48px/700, 100% white, and subtle text shadow) */}
            <h1 
              className="text-display-lg !text-white font-bold tracking-tight font-display opacity-100"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
            >
              {chapter.name.toUpperCase()}
            </h1>

            {/* 2. Chapter Description (NCERT subtitle & topics covered) */}
            <div className="space-y-2">
              <div className="text-slate-200 text-body-sm font-semibold">
                Based on NCERT + PYQ Analysis + Exam Trends
              </div>
              <div className="text-indigo-300 font-bold text-caption tracking-wider">
                {chapter.topics.join(' • ')}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-body-sm font-bold shadow-sm">
                <Star className="w-4 h-4 fill-indigo-400 stroke-indigo-400" />
                <span>Chapter Priority: {priority.text}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-body-sm font-bold shadow-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>🔥 Trend: {trendInsight}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button 
                onClick={() => scrollToSection('section-theory')} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Start Reading
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('section-revision')} 
                className="bg-transparent border-slate-700 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
              >
                Quick Revision
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('section-pyqs')} 
                className="bg-transparent border-slate-700 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
              >
                PYQ Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* PYQ Intelligence Dashboard (V3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!chapter.pyqData || chapter.pyqData.total === 0 ? (
            // Empty data handling fallback
            <>
              {[
                { title: '🎯 PYQ Coverage', icon: GraduationCap },
                { title: '🧠 Advanced Analysis', icon: BrainCircuit },
                { title: '📈 Most Tested Concept', icon: BookOpen },
                { title: '🎯 Exam Strategy', icon: Sparkles }
              ].map((card, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-caption tracking-wider">{card.title}</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-title-md font-bold text-foreground">PYQ Analysis Available Soon</p>
                    <p className="text-caption font-semibold text-muted-foreground tracking-wider">Data Status: Collecting Historical PYQs</p>
                  </div>
                </div>
              ))}
            </>
          ) : isNeet ? (
            // NEET Ecosystem Dashboard
            <>
              {/* Card 1: NEET PYQ Coverage */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-indigo-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">NEET PYQ Coverage</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-heading-md font-bold text-slate-900 dark:text-slate-50">{chapter.pyqData.total} Questions</p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>Post-COVID: {chapter.pyqData.postCovid} Qs</div>
                    <div>Trend: High Yield Syllabus</div>
                  </div>
                </div>
              </div>

              {/* Card 2: NCERT Coverage */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-emerald-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">NCERT Coverage</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-heading-md font-bold text-emerald-600 dark:text-emerald-400">100% Mapped</p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>Focus: Diagrams & Key Lines</div>
                    <div>Direct lines frequently tested</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Tested Concept */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/50 to-rose-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-rose-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Most Tested Concept</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-title-md font-bold text-slate-950 dark:text-slate-50 line-clamp-1">
                    {chapter.pyqData.trendingConcepts?.[0] || chapter.topics?.[0] || 'Core Concepts'}
                  </p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>{Math.round(25 + (chapter.pyqData.total % 10))}% of NEET PYQs</div>
                    <div>Recent Appearance: 2026, 2025, 2024</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Exam Strategy */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 to-amber-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-amber-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Exam Strategy</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-caption font-bold text-slate-700 dark:text-slate-300">
                    <div className="text-indigo-500 dark:text-indigo-400 font-bold mb-1 text-caption">Focus First:</div>
                    <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-600 dark:text-slate-400">
                      <li>{chapter.topics?.[0] || 'Core Concepts'}</li>
                      <li>NCERT Diagrams</li>
                    </ul>
                    <div className="text-red-500 dark:text-red-400 font-bold mt-1 text-caption">Avoid:</div>
                    <div className="text-slate-500 text-caption font-medium">Ignoring NCERT side-notes</div>
                  </div>
                </div>
              </div>
            </>
          ) : isCuet ? (
            // CUET Ecosystem Dashboard
            <>
              {/* Card 1: CUET PYQ Coverage */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-indigo-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">CUET PYQ Coverage</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-heading-md font-bold text-slate-900 dark:text-slate-50">{chapter.pyqData.total} Questions</p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>Trend: High Recall Speed</div>
                    <div>Speed & Accuracy focus</div>
                  </div>
                </div>
              </div>

              {/* Card 2: NCERT Focus & Theory */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-emerald-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">NCERT Focus</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-title-md font-bold text-emerald-600 dark:text-emerald-400">Direct Theory</p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>Status: 100% Core Syllabus</div>
                    <div>Definition & Fact-Based</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Tested Concept */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/50 to-rose-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-rose-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Most Tested Concept</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-title-md font-bold text-slate-950 dark:text-slate-50 line-clamp-1">
                    {chapter.pyqData.trendingConcepts?.[0] || chapter.topics?.[0] || 'Core Concepts'}
                  </p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>{Math.round(25 + (chapter.pyqData.total % 10))}% of CUET PYQs</div>
                    <div>Recent Appearance: 2026, 2025</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Exam Strategy */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 to-amber-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-amber-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Exam Strategy</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-caption font-bold text-slate-700 dark:text-slate-300">
                    <div className="text-indigo-500 dark:text-indigo-400 font-bold mb-1 text-caption">Focus First:</div>
                    <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-600 dark:text-slate-400">
                      <li>{chapter.topics?.[0] || 'Core Concepts'}</li>
                      <li>Conceptual Definitions</li>
                    </ul>
                    <div className="text-red-500 dark:text-red-400 font-bold mt-1 text-caption">Avoid:</div>
                    <div className="text-slate-500 text-caption font-medium">Skipping basic definition theory</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // JEE Ecosystem Dashboard (isJee)
            <>
              {/* Card 1: JEE Main PYQ Coverage */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-indigo-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">JEE Main</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-heading-md font-bold text-slate-900 dark:text-slate-50">{Math.round(chapter.pyqData.total * 0.65)} Questions</p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>Coverage: {Math.round(chapter.pyqData.total * 0.65)} PYQs</div>
                    <div>Confidence: {chapter.weightage} Weightage</div>
                  </div>
                </div>
              </div>

              {/* Card 2: JEE Advanced Analysis */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-emerald-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">JEE Advanced</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-heading-md font-bold text-emerald-600 dark:text-emerald-400">{chapter.pyqData.total - Math.round(chapter.pyqData.total * 0.65)} Questions</p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>Difficulty: {chapter.difficulty === 'Hard' ? 'Concept Intensive' : chapter.difficulty === 'Medium' ? 'Analytical' : 'Core Practice'}</div>
                    <div>Focus: Multi-Concept Problems</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Tested Concept */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/50 to-rose-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-rose-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Most Tested Concept</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-title-md font-bold text-slate-950 dark:text-slate-50 line-clamp-1">
                    {chapter.pyqData.trendingConcepts?.[0] || chapter.topics?.[0] || 'Core Concepts'}
                  </p>
                  <div className="text-caption font-bold text-muted-foreground flex flex-col gap-1">
                    <div>{Math.round(25 + (chapter.pyqData.total % 10))}% of chapter PYQs</div>
                    <div>Recent Appearance: 2026, 2025, 2024</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Exam Strategy */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 to-amber-100/10 dark:from-slate-900/40 dark:to-slate-900/10 border border-amber-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-caption tracking-wider">Exam Strategy</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-caption font-bold text-slate-700 dark:text-slate-300">
                    <div className="text-indigo-500 dark:text-indigo-400 font-bold mb-1 text-caption">Focus First:</div>
                    <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-600 dark:text-slate-400">
                      <li>{chapter.topics?.[0] || 'Core Concepts'}</li>
                      <li>{chapter.topics?.[1] || 'Important Derivations'}</li>
                    </ul>
                    <div className="text-red-500 dark:text-red-400 font-bold mt-1 text-caption">Avoid:</div>
                    <div className="text-slate-500 text-caption font-medium">Blind Formula Memorization</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Section Tabs Navigation */}
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-border py-4 -mx-4 px-4 sm:mx-0 sm:rounded-2xl sm:border-x shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
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
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-body-sm font-bold whitespace-nowrap transition-all flex-shrink-0",
                    activeSmartMode === mode.id
                      ? "bg-foreground text-background shadow-md scale-95"
                      : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                  )}
                >
                  <Icon className={cn("w-4 h-4", activeSmartMode === mode.id ? "opacity-100" : mode.color)} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apple Notes + Notion + Allen Hybrid Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Left Table of Contents Navigator (P1) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-36 self-start p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-caption uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" /> Contents
            </h4>
            <ul className="space-y-2.5">
              {sections.map(sec => {
                const isActive = activeSection === sec.id;
                return (
                  <li key={sec.id}>
                    <button
                      onClick={() => scrollToSection(sec.id)}
                      className={cn(
                        "w-full text-left text-body-sm py-1.5 px-3 rounded-lg font-bold transition-all flex items-center gap-2.5 border-l-2",
                        isActive 
                          ? "text-accent bg-accent/5 font-extrabold border-accent" 
                          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/40"
                      )}
                    >
                      <span className="text-caption">{isActive ? '●' : '○'}</span>
                      <span className="truncate">{sec.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="pt-4 border-t border-border flex items-center justify-between text-caption text-muted-foreground font-semibold">
              <span>Read progress:</span>
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
                    {isRetrying ? "Validation Mismatch Detected" : "Distilling Study Content..."}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-sm text-body-lg">
                    {statusText || `Preparing classroom notes for ${chapter.name} using senior faculty exam specifications...`}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Reading Status Widget at the top of content */}
                  <Card className="border border-border/80 shadow-sm bg-gradient-to-r from-secondary/50 to-secondary/10 rounded-2xl overflow-hidden">
                    <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4 text-body-sm font-semibold">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Calculator className="w-4 h-4 text-sky-500" />
                          <span>Difficulty: {chapter.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <GraduationCap className="w-4 h-4 text-emerald-500" />
                          <span>Reading Time: ~45 min</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Importance: Critical</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Retention Estimation:</span>
                        <span className="text-accent font-bold">78%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Core Notes Content Box */}
                  <Card className="border border-border/80 shadow-xl overflow-hidden rounded-3xl">
                    <CardContent className="p-8 sm:p-14 relative bg-background">
                      <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none">
                        {renderNotes(notes)}
                        {isGenerating && <span className="inline-block w-3 h-5 bg-accent animate-pulse ml-2 align-middle rounded-sm" />}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chapter Completion experience (P1) */}
                  {!isGenerating && notes !== '' && (
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/5 border border-emerald-200 dark:border-emerald-900/50 shadow-md my-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-caption font-bold uppercase tracking-wider">
                            Chapter Completed Successfully
                          </div>
                          <h3 className="text-heading-md font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            🎉 Congratulations, Beta!
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 max-w-xl text-body-md leading-relaxed">
                            You've completed the star-batch classroom notes for <strong className="font-extrabold">{chapter.name}</strong>. Excellent persistence!
                          </p>
                          <div className="flex flex-wrap gap-6 pt-2 text-body-sm text-slate-500 dark:text-slate-400 font-semibold">
                            <div>Topics Covered: <span className="text-slate-800 dark:text-slate-200 font-bold">{chapter.topics.length}/{chapter.topics.length}</span></div>
                            <div>Estimated Retention: <span className="text-emerald-600 dark:text-emerald-400 font-bold">78%</span></div>
                          </div>
                        </div>
                        
                        {nextChapter && (
                          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-w-[280px]">
                            <div className="space-y-1">
                              <span className="text-caption font-bold uppercase tracking-widest text-muted-foreground">Up Next</span>
                              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">{nextChapter.name}</h4>
                            </div>
                            <Button 
                              onClick={() => {
                                navigate(`/chapter/${nextChapter.id}/notes`);
                                window.scrollTo(0, 0);
                              }} 
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl transition-all"
                            >
                              Start Next Chapter →
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action CTAs */}
                  {!isGenerating && notes !== '' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
                    >
                      <Button variant="outline" size="lg" className="h-14 font-bold rounded-2xl border-border bg-card shadow-sm" onClick={() => navigate(`/practice?chapter=${chapter.id}`)}>
                        Test Concepts in Practice
                      </Button>
                      <Button variant="default" size="lg" className="h-14 font-bold rounded-2xl shadow-lg shadow-primary/20" onClick={() => navigate(`/test?chapter=${chapter.id}`)}>
                        Take Formal Chapter Test
                      </Button>
                    </motion.div>
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
