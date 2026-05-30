import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { getFormulasBySubject } from '@/data/cleanFormulas';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { renderFormula } from '@/lib/formulaRenderer';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormulaSheetProps {
  onBack: () => void;
}

interface FormulaEntry {
  formula: string;
  explanation: string;
  examTip: string;
}

interface ChapterFormulaGroup {
  chapter: string;
  formulas: FormulaEntry[];
}

// Static fallbacks for CUET
const cuetFallbackFormulas: Record<string, ChapterFormulaGroup[]> = {
  economics: [
    { chapter: 'Microeconomics', formulas: [
      { formula: 'Ed = %ΔQd / %ΔP', explanation: 'Price Elasticity of Demand', examTip: 'Ed > 1 = elastic, Ed < 1 = inelastic' },
      { formula: 'TC = TFC + TVC', explanation: 'Total Cost = Fixed + Variable', examTip: 'TFC remains constant at all output levels' },
    ]},
    { chapter: 'Macroeconomics', formulas: [
      { formula: 'GDP = C + I + G + (X - M)', explanation: 'Expenditure method of national income', examTip: 'Most common formula in CUET economics' },
      { formula: 'Money Multiplier = 1 / CRR', explanation: 'Credit creation by banks', examTip: 'Higher CRR = lower multiplier' },
    ]},
  ],
  accountancy: [
    { chapter: 'Partnership Accounts', formulas: [
      { formula: 'Goodwill = Average Profit × No. of Years Purchase', explanation: 'Average profits method', examTip: 'Super Profit Method also asked' },
      { formula: 'New Ratio = Old Ratio - Sacrificing Ratio', explanation: 'On admission of partner', examTip: 'Gaining ratio = New ratio - Old ratio' },
    ]},
  ],
  general_test: [
    { chapter: 'Quantitative Aptitude', formulas: [
      { formula: 'SI = P × R × T / 100', explanation: 'Simple Interest', examTip: 'Compare with CI for 2 years' },
      { formula: 'Speed = Distance / Time', explanation: 'Basic speed formula', examTip: 'Avg speed = 2S₁S₂/(S₁+S₂)' },
    ]},
  ],
  english: [
    { chapter: 'Grammar Rules', formulas: [
      { formula: 'Subject-Verb Agreement: Singular subject → singular verb', explanation: 'Basic grammar rule', examTip: '"Each of" takes singular verb' },
      { formula: 'Active → Passive: Object + be + V3 + by + Subject', explanation: 'Voice change', examTip: 'Tense of "be" matches original' },
    ]},
  ],
  business_studies: [
    { chapter: 'Financial Management', formulas: [
      { formula: 'Working Capital = Current Assets - Current Liabilities', explanation: 'Short-term financial health', examTip: 'Positive WC = good liquidity' },
    ]},
  ],
};

const neetBiologyFallback: ChapterFormulaGroup[] = [
  { chapter: 'Cell Biology', formulas: [
    { formula: 'Cell Theory: All living things = cells', explanation: 'Schleiden, Schwann & Virchow', examTip: 'Virchow added "cells from cells"' },
    { formula: 'DNA → RNA → Protein (Central Dogma)', explanation: 'Flow of genetic information', examTip: 'Exception: reverse transcriptase' },
  ]},
  { chapter: 'Genetics', formulas: [
    { formula: 'Genotypic ratio (monohybrid): 1:2:1', explanation: 'AA : Aa : aa', examTip: 'Phenotypic = 3:1' },
    { formula: 'Hardy-Weinberg: p² + 2pq + q² = 1', explanation: 'Allele frequencies', examTip: 'Calculate genotype frequencies' },
  ]},
  { chapter: 'Human Physiology', formulas: [
    { formula: 'Cardiac Output = HR × SV', explanation: 'Heart Rate × Stroke Volume', examTip: 'Normal CO ≈ 5 L/min' },
  ]},
];

const FormulaSheet: React.FC<FormulaSheetProps> = ({ onBack }) => {
  const { isNeet, isCuet, examMode } = useExamMode();
  const { language } = useLanguage();

  const getSubjects = (): { key: string; label: string }[] => {
    if (isCuet) return [
      { key: 'economics', label: 'Economics' }, { key: 'accountancy', label: 'Accountancy' },
      { key: 'general_test', label: 'General Test' }, { key: 'english', label: 'English' },
      { key: 'business_studies', label: 'Business Studies' },
    ];
    if (isNeet) return [
      { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'biology', label: 'Biology' },
    ];
    return [
      { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'maths', label: 'Maths' },
    ];
  };

  const subjects = getSubjects();
  const [activeSubject, setActiveSubject] = useState<string>(subjects[0].key);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [aiChapters, setAiChapters] = useState<ChapterFormulaGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState<Record<string, boolean>>({});

  const getFallbackChapters = (): ChapterFormulaGroup[] => {
    if (isCuet) return cuetFallbackFormulas[activeSubject] || [];
    if (activeSubject === 'biology') return neetBiologyFallback;
    return getFormulasBySubject(activeSubject as 'physics' | 'chemistry' | 'maths');
  };

  const generateAIFormulas = async (subject: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-revision-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'formulas',
          subject,
          examMode: isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setAiChapters(result.data);
        setHasGenerated(prev => ({ ...prev, [subject]: true }));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Could not generate fresh content. Showing saved formulas.');
    } finally {
      setIsLoading(false);
    }
  };

  const chapters = (hasGenerated[activeSubject] && aiChapters) ? aiChapters : getFallbackChapters();

  const subjectColors: Record<string, string> = {
    physics: 'bg-physics text-white', chemistry: 'bg-chemistry text-white', maths: 'bg-maths text-white',
    biology: 'bg-green-600 text-white', economics: 'bg-amber-500 text-white', accountancy: 'bg-teal-500 text-white',
    general_test: 'bg-purple-500 text-white', english: 'bg-indigo-500 text-white', business_studies: 'bg-orange-500 text-white',
  };

  const subjectBorders: Record<string, string> = {
    physics: 'border-physics', chemistry: 'border-chemistry', maths: 'border-maths',
    biology: 'border-green-500', economics: 'border-amber-500', accountancy: 'border-teal-500',
    general_test: 'border-purple-500', english: 'border-indigo-500', business_studies: 'border-orange-500',
  };

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    toast.success('Formula copied!');
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleSubjectChange = (key: string) => {
    setActiveSubject(key);
    setExpandedChapter(null);
    if (!hasGenerated[key]) setAiChapters(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-xl font-bold">{isCuet ? 'Key Concepts & Formulas' : 'Formula Sheets'}</h2>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={() => generateAIFormulas(activeSubject)}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {hasGenerated[activeSubject] ? 'Refresh' : 'Generate Fresh'}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {subjects.map((subject) => (
          <Button
            key={subject.key}
            variant={activeSubject === subject.key ? 'default' : 'outline'}
            onClick={() => handleSubjectChange(subject.key)}
            className={cn(activeSubject === subject.key && (subjectColors[subject.key] || ''))}
          >
            {subject.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Generating fresh {isCuet ? 'concepts' : 'formulas'}...</span>
        </div>
      ) : (
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
          {chapters.map((chapter) => (
            <div key={chapter.chapter} className={cn('bg-card border-l-4 rounded-xl overflow-hidden', subjectBorders[activeSubject] || 'border-primary')}>
              <button
                onClick={() => setExpandedChapter(expandedChapter === chapter.chapter ? null : chapter.chapter)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{chapter.chapter}</h3>
                  <p className="text-sm text-muted-foreground">{chapter.formulas.length} {isCuet ? 'key concepts' : 'formulas'}</p>
                </div>
                <ChevronLeft className={cn('w-5 h-5 text-muted-foreground transition-transform', expandedChapter === chapter.chapter ? 'rotate-90' : '-rotate-90')} />
              </button>

              {expandedChapter === chapter.chapter && (
                <div className="border-t border-border p-4 space-y-4">
                  {chapter.formulas.map((item, i) => (
                    <div key={i} className="bg-secondary/30 rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">{isCuet ? 'Concept:' : 'Formula:'}</p>
                          <code className="text-base font-mono text-foreground font-medium">{renderFormula(item.formula)}</code>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => copyFormula(item.formula)}>
                          {copiedFormula === item.formula ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Explanation:</p>
                        <p className="text-sm text-foreground">{item.explanation}</p>
                      </div>
                      <div className="bg-prepentrance-saffron/10 rounded-lg px-3 py-2">
                        <p className="text-xs text-prepentrance-saffron font-medium mb-1">When to use in exam:</p>
                        <p className="text-sm text-foreground">{item.examTip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {chapters.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-8">
          No formulas available. Click "Generate Fresh" to create AI-powered content!
        </div>
      )}
    </div>
  );
};

export default FormulaSheet;
