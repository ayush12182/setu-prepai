import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { getFormulasBySubject, ChapterFormulas } from '@/data/cleanFormulas';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { renderFormula } from '@/lib/formulaRenderer';
import { useExamMode } from '@/contexts/ExamModeContext';

interface FormulaSheetProps {
  onBack: () => void;
}

type JeeSubject = 'physics' | 'chemistry' | 'maths';
type NeetSubject = 'physics' | 'chemistry' | 'biology';
type Subject = JeeSubject | NeetSubject;

const neetBiologyFormulas: ChapterFormulas[] = [
  {
    chapter: 'Cell Biology',
    subject: 'biology',
    formulas: [
      { formula: 'Cell Theory: All living things = cells', explanation: 'Schleiden, Schwann & Virchow', examTip: 'Virchow added "cells from cells"' },
      { formula: 'DNA → RNA → Protein (Central Dogma)', explanation: 'Flow of genetic information', examTip: 'Know exceptions: reverse transcriptase in retroviruses' },
    ]
  },
  {
    chapter: 'Genetics',
    subject: 'biology',
    formulas: [
      { formula: 'Genotypic ratio (monohybrid): 1:2:1', explanation: 'AA : Aa : aa from Aa × Aa cross', examTip: 'Phenotypic ratio is 3:1 for dominant/recessive' },
      { formula: 'Phenotypic ratio (dihybrid): 9:3:3:1', explanation: 'From AaBb × AaBb', examTip: 'Classic Mendelian dihybrid ratio' },
      { formula: 'Hardy-Weinberg: p² + 2pq + q² = 1', explanation: 'p + q = 1 where p = freq(A), q = freq(a)', examTip: 'Used to calculate allele/genotype frequencies' },
    ]
  },
  {
    chapter: 'Photosynthesis',
    subject: 'biology',
    formulas: [
      { formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', explanation: 'Overall equation for photosynthesis', examTip: 'Light energy drives this reaction' },
      { formula: 'Z-scheme: PS II → e⁻ transport → PS I', explanation: 'Electron flow in light reactions', examTip: 'Water splits at PS II, NADPH formed at PS I' },
    ]
  },
  {
    chapter: 'Human Physiology',
    subject: 'biology',
    formulas: [
      { formula: 'Cardiac Output = HR × SV', explanation: 'Heart Rate × Stroke Volume', examTip: 'Normal CO ≈ 5 L/min' },
      { formula: 'GFR ≈ 125 mL/min', explanation: 'Glomerular Filtration Rate in humans', examTip: '180 L/day filtered, 1.5 L excreted as urine' },
    ]
  }
];

const FormulaSheet: React.FC<FormulaSheetProps> = ({ onBack }) => {
  const { isNeet } = useExamMode();

  const jeeSubjects: JeeSubject[] = ['physics', 'chemistry', 'maths'];
  const neetSubjects: NeetSubject[] = ['physics', 'chemistry', 'biology'];

  const [activeSubject, setActiveSubject] = useState<Subject>(isNeet ? 'biology' : 'physics');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const getChapters = (): ChapterFormulas[] => {
    if (activeSubject === 'biology') return neetBiologyFormulas;
    return getFormulasBySubject(activeSubject as JeeSubject);
  };

  const chapters = getChapters();

  const subjectColors: Record<Subject, string> = {
    physics: 'bg-physics text-white',
    chemistry: 'bg-chemistry text-white',
    maths: 'bg-maths text-white',
    biology: 'bg-green-600 text-white',
  };

  const subjectBorders: Record<Subject, string> = {
    physics: 'border-physics',
    chemistry: 'border-chemistry',
    maths: 'border-maths',
    biology: 'border-green-500',
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

  const subjects = isNeet ? neetSubjects : jeeSubjects;

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
        {subjects.map((subject) => (
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
        {activeSubject === 'biology' && 'Biology: Key concepts, diagrams & mnemonics'}
      </div>
    </div>
  );
};

export default FormulaSheet;
