import React from 'react';
import { BookOpen, Loader2, RefreshCw, Sparkles, Zap, Target, BookMarked, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StructuredNotes } from '@/hooks/useSubchapterNotes';
import { 
  FormulaCard, 
  ConceptCard, 
  GraphCard, 
  MistakeCard, 
  PYQTriggerCard, 
  QuickRevisionBox 
} from '@/components/revision/PremiumNotesComponents';

interface NotesSectionProps {
  notes: StructuredNotes | null;
  isLoading: boolean;
  error: string | null;
  subchapterName: string;
  chapterName: string;
  subject: string;
  onGenerate: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  isLoading,
  error,
  subchapterName,
  chapterName,
  subject,
  onGenerate,
}) => {
  // Empty state
  if (!notes && !isLoading && !error) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-prepentrance-saffron/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-prepentrance-saffron" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          1-Day Exam Revision Sheet
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Premium topper-style short notes with perfect visual hierarchy. Highly compressed, formula-first, and optimized for fast recall.
        </p>
        <Button onClick={onGenerate} className="bg-gradient-to-r from-prepentrance-saffron to-prepentrance-saffron/80 text-white">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Sheet
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-prepentrance-saffron border-t-transparent animate-spin" />
          <h3 className="text-lg font-semibold text-foreground">Preparing Premium Notes</h3>
          <p className="text-sm text-muted-foreground max-w-sm text-center">
            Compressing {subchapterName} into a high-yield, 5-minute visual revision sheet...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-xl p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={onGenerate} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Notes rendered
  return (
    <div className="bg-background rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-prepentrance-saffron/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-prepentrance-saffron" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">Revision Sheet</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{notes?.chapter || subchapterName}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onGenerate}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Regenerate
        </Button>
      </div>

      {notes && (
        <div className="space-y-10">
          {/* Quick Revision Box */}
          {notes.quickRevision && notes.quickRevision.length > 0 && (
            <QuickRevisionBox points={notes.quickRevision} />
          )}

          {/* Formulas */}
          {notes.formulaCards && notes.formulaCards.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Important Formulas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.formulaCards.map((f, i) => (
                  <FormulaCard key={i} delay={i * 0.1} {...f} />
                ))}
              </div>
            </section>
          )}

          {/* Core Concepts */}
          {notes.concepts && notes.concepts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookMarked className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-foreground">Core Concepts</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {notes.concepts.map((c, i) => (
                  <ConceptCard key={i} delay={i * 0.1} {...c} />
                ))}
              </div>
            </section>
          )}

          {/* Graphs / Visuals */}
          {notes.graphs && notes.graphs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-bold text-foreground">Visual Memory</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {notes.graphs.map((g, i) => (
                  <GraphCard key={i} delay={i * 0.1} {...g} />
                ))}
              </div>
            </section>
          )}

          {/* PYQ Triggers */}
          {notes.pyqTriggers && notes.pyqTriggers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">PYQ Pattern Triggers</h3>
              </div>
              <div className="space-y-3">
                {notes.pyqTriggers.map((t, i) => (
                  <PYQTriggerCard key={i} delay={i * 0.1} {...t} />
                ))}
              </div>
            </section>
          )}

          {/* Common Mistakes */}
          {notes.mistakes && notes.mistakes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-foreground">Common Mistakes</h3>
              </div>
              <div className="space-y-4">
                {notes.mistakes.map((m, i) => (
                  <MistakeCard key={i} delay={i * 0.1} {...m} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Mentor signature */}
      <div className="mt-12 pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-widest">
          — DESIGNED BY PrepEntrance MENTOR —
        </p>
      </div>
    </div>
  );
};
