import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { getChapterById } from '@/data/syllabus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, Download, Copy, CheckCircle2, 
  BookOpen, Layers, Zap, BrainCircuit, AlertTriangle, Calculator, Sparkles, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { cn } from '@/lib/utils';

type SmartMode = 'default' | 'beginner' | 'advanced' | 'formulas_only' | 'mistakes_only' | 'revision';

const ChapterNotesPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // AI States
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAttemptedGen, setHasAttemptedGen] = useState(false);
  const [activeSmartMode, setActiveSmartMode] = useState<SmartMode>('default');

  const { language } = useLanguage();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();

  const chapter = chapterId ? getChapterById(chapterId) : null;

  useEffect(() => {
    if (chapter && !hasAttemptedGen) {
      generateNotes('default');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, hasAttemptedGen]);

  const generateNotes = async (mode: SmartMode) => {
    if (!chapter) return;
    setIsGenerating(true);
    setHasAttemptedGen(true);
    setActiveSmartMode(mode);
    setNotes('');

    try {
      // Get user session token for Edge Function auth
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          chapterName: chapter.name,
          subject: chapter.subject,
          topics: chapter.topics || [],
          smartMode: mode,
          language,
          examMode: isFoundation ? `Class ${classLabel} (Foundation)` : isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE'
        }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          toast.error("You need to deploy the new generate-notes Edge Function to enable Kota Mode!");
          setIsGenerating(false);
          return;
        }
        throw new Error('Failed to generate notes');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');
      const decoder = new TextDecoder();
      let fullNotes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) { 
                fullNotes += content; 
                setNotes(fullNotes); 
              }
            } catch { /* Skip invalid JSON */ }
          }
        }
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error('Failed to generate AI notes. Please verify your internet connection.');
      setNotes(`## ⚠️ AI Temporarily Unavailable\nBhai thoda wait kar le, system update ho raha hai. Please try again in a few minutes.`);
    } finally {
      setIsGenerating(false);
    }
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
    { id: 'default', label: 'Default Notes', icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { id: 'beginner', label: 'Explain like Beginner', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'advanced', label: 'Advanced Depth', icon: BrainCircuit, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { id: 'formulas_only', label: 'Only Formulas', icon: Calculator, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'mistakes_only', label: 'Only Mistakes', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'revision', label: '1 Min Revision', icon: Zap, color: 'text-accent', bg: 'bg-accent/10' },
  ] as const;

  const renderNotes = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-display font-bold mt-2 mb-6 text-foreground border-b border-border pb-2">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className={`text-xl font-bold mt-10 mb-4 flex items-center gap-3 text-foreground bg-secondary/50 p-3 rounded-xl border border-border`}>
        <Layers className="w-5 h-5 text-accent shrink-0" />
        {line.slice(3)}
      </h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-6 mb-2 text-foreground/90 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" />{line.slice(4)}</h3>;
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 my-2 text-muted-foreground list-disc marker:text-accent font-medium leading-relaxed">{line.slice(2).replace(/\*\*/g, '')}</li>;
      if (line.startsWith('⚡') || line.startsWith('💡')) return <p key={i} className="ml-0 my-5 text-accent font-semibold bg-accent/5 p-4 rounded-xl border border-accent/20 leading-relaxed shadow-sm flex items-start gap-3"><span className="text-xl shrink-0 mt-0.5">{line.substring(0,2)}</span><span>{line.substring(2).replace(/\*\*/g, '')}</span></p>;
      if (line.startsWith('---')) return <hr key={i} className="my-8 border-border/60" />;
      if (line.match(/^\d+\./)) return <p key={i} className="ml-2 my-3 font-bold text-foreground/90">{line.replace(/\*\*/g, '')}</p>;
      if (line.trim()) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return <p key={i} className="my-4 text-muted-foreground leading-relaxed text-base">
          {parts.map((p, x) => p.startsWith('**') && p.endsWith('**') ? <strong key={x} className="font-bold text-foreground/90 bg-primary/5 px-1 rounded">{p.slice(2, -2)}</strong> : p)}
        </p>;
      }
      return <br key={i} />;
    });
  };

  return (
    <MainLayout title={`Notes: ${chapter.name}`}>
      <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-0">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 mt-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/chapter/${chapter.id}`)} className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chapter
            </Button>
            <h1 className="text-4xl font-display font-bold text-foreground mb-3">
              {chapter.name}
            </h1>
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

        {/* Smart Toolbar */}
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-border py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:rounded-2xl sm:border-x shadow-sm">
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
                      ? `bg-foreground text-background shadow-md` 
                      : `bg-secondary hover:bg-secondary/80 text-foreground border border-border`
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
                Your AI Coach is currently compiling {activeSmartMode === 'default' ? 'the ultimate chapter blueprint' : `the specific '${smartModes.find(m => m.id === activeSmartMode)?.label}' view`}...
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
