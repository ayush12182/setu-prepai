import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { getFormulasBySubject, ChapterFormulas } from '@/data/cleanFormulas';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { renderFormula } from '@/lib/formulaRenderer';

interface FormulaSheetProps {
  onBack: () => void;
}

type Subject = 'physics' | 'chemistry' | 'maths';

const FormulaSheet: React.FC<FormulaSheetProps> = ({ onBack }) => {
  const [activeSubject, setActiveSubject] = useState<Subject>('physics');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const chapters = getFormulasBySubject(activeSubject);

  const subjectColors: Record<Subject, string> = {
    physics: 'bg-physics text-white',
    chemistry: 'bg-chemistry text-white',
    maths: 'bg-maths text-white'
  };

  const subjectBorders: Record<Subject, string> = {
    physics: 'border-physics',
    chemistry: 'border-chemistry',
    maths: 'border-maths'
  };

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    toast.success('Formula copied!');
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const toggleChapter = (chapterName: string) => {
    setExpandedChapter(expandedChapter === chapterName ? null : chapterName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Formula Sheets</h2>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2">
        {(['physics', 'chemistry', 'maths'] as Subject[]).map((subject) => (
          <Button
            key={subject}
            variant={activeSubject === subject ? 'default' : 'outline'}
            onClick={() => { setActiveSubject(subject); setExpandedChapter(null); }}
            className={cn(
              'capitalize',
              activeSubject === subject && subjectColors[subject]
            )}
          >
            {subject}
          </Button>
        ))}
      </div>

      {/* Chapters */}
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        {chapters.map((chapter) => (
          <div 
            key={chapter.chapter} 
            className={cn(
              'bg-card border-l-4 rounded-xl overflow-hidden',
              subjectBorders[activeSubject]
            )}
          >
            {/* Chapter Header */}
            <button
              onClick={() => toggleChapter(chapter.chapter)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{chapter.chapter}</h3>
                <p className="text-sm text-muted-foreground">{chapter.formulas.length} formulas</p>
              </div>
              <ChevronLeft className={cn(
                'w-5 h-5 text-muted-foreground transition-transform',
                expandedChapter === chapter.chapter ? 'rotate-90' : '-rotate-90'
              )} />
            </button>

            {/* Formulas */}
            {expandedChapter === chapter.chapter && (
              <div className="border-t border-border p-4 space-y-4">
                {chapter.formulas.map((item, i) => (
                  <div 
                    key={i}
                    className="bg-secondary/30 rounded-lg p-4 space-y-2"
                  >
                    {/* Formula */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Formula:</p>
                        <code className="text-base font-mono text-foreground font-medium">
                          {renderFormula(item.formula)}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => copyFormula(item.formula)}
                      >
                        {copiedFormula === item.formula ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Explanation */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Explanation:</p>
                      <p className="text-sm text-foreground">{item.explanation}</p>
                    </div>

                    {/* Exam Tip */}
                    <div className="bg-setu-saffron/10 rounded-lg px-3 py-2">
                      <p className="text-xs text-setu-saffron font-medium mb-1">When to use in exam:</p>
                      <p className="text-sm text-foreground">{item.examTip}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        {activeSubject === 'physics' && 'Physics: 12 chapters, 70+ formulas'}
        {activeSubject === 'chemistry' && 'Chemistry: 6 chapters, 30+ formulas'}
        {activeSubject === 'maths' && 'Maths: 12 chapters, 60+ formulas'}
      </div>
    </div>
  );
};

export default FormulaSheet;
