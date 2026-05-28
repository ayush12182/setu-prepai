import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { getChapterById } from '@/data/syllabus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, Download, Copy, CheckCircle2,
  BookOpen, Layers, Zap, BrainCircuit, AlertTriangle, Calculator, Sparkles,
  GraduationCap, RotateCcw, Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { cn } from '@/lib/utils';
import { MathLine, processNotesContent } from '@/utils/mathRenderer';

type SmartMode = 'default' | 'beginner' | 'advanced' | 'formulas_only' | 'mistakes_only' | 'revision';

const SMART_MODE_META: Record<SmartMode, { label: string; loaderText: string }> = {
  default:       { label: 'Hybrid Mode',     loaderText: 'Building full structured notes (Concept → Formulas → Practice)...' },
  beginner:      { label: 'Tuition Mode',    loaderText: 'Preparing step-by-step beginner-friendly explanation...' },
  advanced:      { label: 'Coaching Mode',   loaderText: 'Generating Kota-style fast notes with shortcuts & tricks...' },
  formulas_only: { label: 'Formula Bank',    loaderText: 'Compiling all formulas with conditions and tricks...' },
  mistakes_only: { label: 'Common Mistakes', loaderText: 'Identifying traps and common errors for your exam...' },
  revision:      { label: '1-Min Revision',  loaderText: 'Building a rapid revision flash sheet...' },
};

// Extracts \boxed{...} contents, handles one level of nested braces
function extractFormulas(content: string): string[] {
  const results: string[] = [];
  const re = /\\boxed\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const f = m[1].trim();
    if (f) results.push(f);
  }
  return [...new Set(results)];
}

const LEVEL_STYLES = {
  1: { wrapper: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  2: { wrapper: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500' },
  3: { wrapper: 'bg-red-500/10 text-red-600 dark:text-red-400',         dot: 'bg-red-500' },
} as const;

const ChapterNotesPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [hasAttemptedGen, setHasAttemptedGen] = useState(false);
  const [activeSmartMode, setActiveSmartMode] = useState<SmartMode>('default');

  const { language } = useLanguage();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();

  const chapter = chapterId ? getChapterById(chapterId) : null;

  useEffect(() => {
    if (chapter && !hasAttemptedGen) {
      generateNotes('default');
    } else if (!chapter) {
      setIsGenerating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  const generateNotes = async (mode: SmartMode) => {
    if (!chapter) return;
    setIsGenerating(true);
    setHasAttemptedGen(true);
    setActiveSmartMode(mode);
    setNotes('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const token = session?.access_token || anonKey;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          chapterName: chapter.name,
          subject: chapter.subject,
          topics: chapter.topics || [],
          smartMode: mode,
          language,
          examMode: isFoundation ? `Class ${classLabel} (Foundation)` : isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[ChapterNotesPage] Edge function error:', response.status, errText);
        if (response.status === 429 || errText.includes('429')) {
          toast.error('AI Quota Exceeded. Showing offline notes. Please try again in 30 seconds.');
        } else {
          toast.error('Notes engine temporarily unavailable. Showing offline version.');
        }
        setNotes(buildFallbackNotes(chapter));
        setIsGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');
      const decoder = new TextDecoder();
      let fullNotes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullNotes += content;
                setNotes(fullNotes);
              }
            } catch { /* skip invalid JSON */ }
          }
        }
      }

      if (!fullNotes) {
        console.warn('[ChapterNotesPage] Stream completed with no content, using fallback');
        setNotes(buildFallbackNotes(chapter));
      }

    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error('Failed to generate AI notes. Showing offline version.');
      setNotes(buildFallbackNotes(chapter));
    } finally {
      setIsGenerating(false);
    }
  };

  const buildFallbackNotes = (ch: ReturnType<typeof getChapterById>) => {
    if (!ch) return '';
    const examName = isFoundation ? `Class ${classLabel}` : isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE';
    return `# ${ch.name}

## Key Topics
${ch.topics.map(t => `- ${t}`).join('\n')}

## Key Formulas
${ch.keyFormulas.length > 0 ? ch.keyFormulas.map(f => `- ${f}`).join('\n') : 'Focus on conceptual understanding for this chapter.'}

## Exam Tips (${examName})
${ch.examTips.map(t => `- ${t}`).join('\n')}

## PYQ Focus
- Post-2020: ${ch.pyqData.postCovid} questions from this chapter
- Trending: ${ch.pyqData.trendingConcepts.join(', ')}

⚡ **AI Notes unavailable offline.** Sign in and try again for full Kota-coach notes.`;
  };

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

  const subjectStr = chapter.subject as string;
  const subjectAccent = subjectStr === 'mathematics' ? 'text-violet-500 bg-violet-500/10 border-violet-500/20' :
    subjectStr === 'science' || subjectStr === 'physics' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
      subjectStr === 'social_science' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
        'text-sky-500 bg-sky-500/10 border-sky-500/20';

  const handleCopy = () => {
    navigator.clipboard.writeText(`Notes for ${chapter.name}\n\n${notes}`);
    setCopied(true);
    toast.success('Notes copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    toast.success('Downloading PDF... (To be implemented)');
  };

  const smartModes = [
    { id: 'default',       label: '🔀 Hybrid Mode',     icon: BookOpen,      color: 'text-sky-500' },
    { id: 'beginner',      label: '📖 Tuition Mode',    icon: GraduationCap, color: 'text-emerald-500' },
    { id: 'advanced',      label: '⚡ Coaching Mode',   icon: Zap,           color: 'text-amber-500' },
    { id: 'formulas_only', label: '🧮 Formula Bank',    icon: Calculator,    color: 'text-violet-500' },
    { id: 'mistakes_only', label: '⚠️ Common Mistakes', icon: AlertTriangle, color: 'text-red-500' },
    { id: 'revision',      label: '⚡ 1-Min Revision',  icon: RotateCcw,     color: 'text-accent' },
  ] as const;

  const renderNotes = (content: string) =>
    processNotesContent(content, (line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;

      // Level badges
      const levelMatch = trimmed.match(/^#{1,3}\s*Level\s*([123])\s*[\u2014\u2013-]?\s*(.*)/i);
      if (levelMatch) {
        const lvl = parseInt(levelMatch[1]) as 1 | 2 | 3;
        const style = LEVEL_STYLES[lvl];
        return (
          <h3 key={i} className={cn('text-lg font-bold mt-8 mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl', style.wrapper)}>
            <div className={cn('w-2 h-2 rounded-full', style.dot)} />
            <MathLine>{levelMatch[2].trim() || `Level ${lvl}`}</MathLine>
          </h3>
        );
      }

      // JEE Tip callout
      if (/^(?:\*\*)?JEE Tip:?(?:\*\*)?/i.test(trimmed)) {
        const tipText = trimmed.replace(/^\*?\*?JEE Tip:?\*?\*?\s*/i, '');
        return (
          <div key={i} className="my-6 p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl">
            <p className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4" /> JEE Tip
            </p>
            <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
              <MathLine>{tipText}</MathLine>
            </p>
          </div>
        );
      }

      // Structured solution fields
      if (trimmed.startsWith('**Given:**'))   return <p key={i} className="my-2"><strong className="text-foreground">Given:</strong> <MathLine>{trimmed.replace('**Given:**', '').trim()}</MathLine></p>;
      if (trimmed.startsWith('**To find:**')) return <p key={i} className="my-2"><strong className="text-foreground">To find:</strong> <MathLine>{trimmed.replace('**To find:**', '').trim()}</MathLine></p>;
      if (trimmed.startsWith('**Concept:**')) return (
        <p key={i} className="my-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-semibold">
          <Layers className="w-4 h-4" /> Concept: <MathLine>{trimmed.replace('**Concept:**', '').trim()}</MathLine>
        </p>
      );
      if (trimmed.startsWith('**Solution:**')) return <p key={i} className="mt-4 mb-2 font-bold text-foreground">Solution:</p>;
      if (trimmed.startsWith('**Answer:**')) return (
        <div key={i} className="my-4 p-4 bg-secondary/30 rounded-xl border border-border flex flex-wrap items-center gap-4">
          <strong className="text-foreground">Answer:</strong>
          <div className="text-lg overflow-x-auto"><MathLine>{trimmed.replace('**Answer:**', '').trim()}</MathLine></div>
        </div>
      );

      if (/^Step \d+:/i.test(trimmed)) return <p key={i} className="my-2 ml-4 text-muted-foreground"><MathLine>{trimmed}</MathLine></p>;

      if (trimmed.startsWith('# ')) return (
        <h1 key={i} className="text-3xl font-display font-bold mt-2 mb-6 text-foreground border-b border-border pb-2">
          <MathLine>{trimmed.slice(2)}</MathLine>
        </h1>
      );
      if (trimmed.startsWith('## ')) return (
        <h2 key={i} className="text-xl font-bold mt-10 mb-4 flex items-center gap-3 text-foreground bg-secondary/50 p-3 rounded-xl border border-border">
          <Layers className="w-5 h-5 text-accent shrink-0" />
          <MathLine>{trimmed.slice(3)}</MathLine>
        </h2>
      );
      if (trimmed.startsWith('### ')) return (
        <h3 key={i} className="text-lg font-bold mt-6 mb-2 text-foreground/90 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <MathLine>{trimmed.slice(4)}</MathLine>
        </h3>
      );

      if (trimmed.startsWith('\u2022 ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) return (
        <li key={i} className="ml-6 my-2 text-muted-foreground list-disc marker:text-accent font-medium leading-relaxed">
          <MathLine>{trimmed.slice(2)}</MathLine>
        </li>
      );

      if (trimmed.startsWith('\u26a1') || trimmed.startsWith('\ud83d\udca1')) return (
        <p key={i} className="ml-0 my-5 text-accent font-semibold bg-accent/5 p-4 rounded-xl border border-accent/20 leading-relaxed shadow-sm flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">{trimmed.substring(0, 2)}</span>
          <span><MathLine>{trimmed.substring(2)}</MathLine></span>
        </p>
      );

      if (trimmed.startsWith('---')) return <hr key={i} className="my-8 border-border/60" />;

      if (trimmed.match(/^\d+\./)) return (
        <p key={i} className="ml-2 my-3 font-bold text-foreground/90 overflow-x-auto">
          <MathLine>{trimmed}</MathLine>
        </p>
      );

      return (
        <p key={i} className="my-4 text-muted-foreground leading-relaxed text-base overflow-x-auto">
          <MathLine>{trimmed}</MathLine>
        </p>
      );
    });

  const formulas = extractFormulas(notes);

  return (
    <MainLayout title={`Notes: ${chapter.name}`}>
      <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 mt-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/chapter/${chapter.id}`)} className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chapter
            </Button>
            <h1 className="text-4xl font-display font-bold text-foreground mb-3">{chapter.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${subjectAccent}`}>
                {chapter.subject.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-accent/30 bg-accent/10 text-accent flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Kota-Level Coach
              </span>
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold uppercase tracking-widest border border-border">
                {isFoundation ? `Class ${classLabel}` : isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE Main & Adv'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none h-11" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="default" className="flex-1 sm:flex-none h-11" onClick={handleDownload} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              Save PDF
            </Button>
          </div>
        </div>

        {/* Sticky Toolbar + Formula Quick Reference */}
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-border py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:rounded-2xl sm:border-x shadow-sm">
          {formulas.length > 0 && (
            <div className="mb-4 pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Formula Quick Reference</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {formulas.map((f, idx) => (
                  <div key={idx} className="shrink-0 px-4 py-2 bg-background rounded-lg border border-border shadow-sm flex items-center justify-center">
                    <MathLine>{`$${f}$`}</MathLine>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {smartModes.map(mode => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => generateNotes(mode.id as SmartMode)}
                  disabled={isGenerating}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 disabled:opacity-50",
                    activeSmartMode === mode.id
                      ? "bg-foreground text-background shadow-md"
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

        {/* Main Notes Area */}
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
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">Distilling Output...</h3>
              <p className="text-muted-foreground text-center max-w-sm text-lg">
                {SMART_MODE_META[activeSmartMode].loaderText}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border border-border/80 shadow-xl min-h-[500px] overflow-hidden rounded-3xl">
                <CardContent className="p-8 sm:p-12 relative bg-background">
                  <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none">
                    {renderNotes(notes)}
                    {isGenerating && <span className="inline-block w-3 h-5 bg-accent animate-pulse ml-2 align-middle rounded-sm" />}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        {!isGenerating && notes !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center pt-10 gap-4"
          >
            <Button variant="outline" size="lg" className="h-14 font-bold rounded-2xl border-border bg-card shadow-sm" onClick={() => navigate(`/practice?chapter=${chapter.id}`)}>
              Test Concepts in Practice
            </Button>
            <Button variant="default" size="lg" className="h-14 font-bold rounded-2xl shadow-lg shadow-primary/20" onClick={() => navigate(`/test?chapter=${chapter.id}`)}>
              Take Formal Chapter Test
            </Button>
          </motion.div>
        )}

      </div>
    </MainLayout>
  );
};

export default ChapterNotesPage;
