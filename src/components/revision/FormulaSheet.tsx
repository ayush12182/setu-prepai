import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { getFormulasBySubject } from '@/data/cleanFormulas';

interface FormulaEntry {
  formula: string;
  explanation: string;
  examTip: string;
}

interface ChapterFormulaGroup {
  chapter: string;
  subject: string;
  formulas: FormulaEntry[];
}
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { renderFormula } from '@/lib/formulaRenderer';
import { useExamMode } from '@/contexts/ExamModeContext';

interface FormulaSheetProps {
  onBack: () => void;
}

type Subject = string;

const neetBiologyFormulas: ChapterFormulaGroup[] = [
  {
    chapter: 'Cell Biology', subject: 'biology',
    formulas: [
      { formula: 'Cell Theory: All living things = cells', explanation: 'Schleiden, Schwann & Virchow', examTip: 'Virchow added "cells from cells"' },
      { formula: 'DNA → RNA → Protein (Central Dogma)', explanation: 'Flow of genetic information', examTip: 'Know exceptions: reverse transcriptase in retroviruses' },
    ]
  },
  {
    chapter: 'Genetics', subject: 'biology',
    formulas: [
      { formula: 'Genotypic ratio (monohybrid): 1:2:1', explanation: 'AA : Aa : aa from Aa × Aa cross', examTip: 'Phenotypic ratio is 3:1 for dominant/recessive' },
      { formula: 'Hardy-Weinberg: p² + 2pq + q² = 1', explanation: 'p + q = 1 where p = freq(A), q = freq(a)', examTip: 'Used to calculate allele/genotype frequencies' },
    ]
  },
  {
    chapter: 'Photosynthesis', subject: 'biology',
    formulas: [
      { formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', explanation: 'Overall equation for photosynthesis', examTip: 'Light energy drives this reaction' },
    ]
  },
  {
    chapter: 'Human Physiology', subject: 'biology',
    formulas: [
      { formula: 'Cardiac Output = HR × SV', explanation: 'Heart Rate × Stroke Volume', examTip: 'Normal CO ≈ 5 L/min' },
      { formula: 'GFR ≈ 125 mL/min', explanation: 'Glomerular Filtration Rate in humans', examTip: '180 L/day filtered, 1.5 L excreted as urine' },
    ]
  }
];

const cuetFormulas: Record<string, ChapterFormulaGroup[]> = {
  economics: [
    {
      chapter: 'Microeconomics', subject: 'economics',
      formulas: [
        { formula: 'Ed = %ΔQd / %ΔP', explanation: 'Price Elasticity of Demand', examTip: 'Ed > 1 = elastic, Ed < 1 = inelastic' },
        { formula: 'MR = ΔTR / ΔQ', explanation: 'Marginal Revenue', examTip: 'MR = MC at equilibrium for profit maximization' },
        { formula: 'TC = TFC + TVC', explanation: 'Total Cost = Fixed + Variable', examTip: 'TFC remains constant at all output levels' },
      ]
    },
    {
      chapter: 'Macroeconomics', subject: 'economics',
      formulas: [
        { formula: 'GDP = C + I + G + (X - M)', explanation: 'Expenditure method of national income', examTip: 'Most common formula in CUET economics' },
        { formula: 'Money Multiplier = 1 / CRR', explanation: 'Credit creation by banks', examTip: 'Higher CRR = lower multiplier = less lending' },
        { formula: 'Fiscal Deficit = Total Expenditure - Total Receipts (excl. borrowings)', explanation: 'Government borrowing requirement', examTip: 'Revenue deficit vs fiscal deficit — know the difference' },
      ]
    }
  ],
  accountancy: [
    {
      chapter: 'Partnership Accounts', subject: 'accountancy',
      formulas: [
        { formula: 'Goodwill = Average Profit × No. of Years Purchase', explanation: 'Average profits method', examTip: 'Super Profit Method also frequently asked' },
        { formula: 'Super Profit = Actual Profit - Normal Profit', explanation: 'Excess over normal returns', examTip: 'Normal Profit = Capital × Normal Rate of Return / 100' },
        { formula: 'New Ratio = Old Ratio - Sacrificing Ratio', explanation: 'On admission of partner', examTip: 'Gaining ratio = New ratio - Old ratio' },
      ]
    },
    {
      chapter: 'Company Accounts', subject: 'accountancy',
      formulas: [
        { formula: 'Current Ratio = Current Assets / Current Liabilities', explanation: 'Liquidity measure', examTip: 'Ideal ratio is 2:1' },
        { formula: 'Debt-Equity Ratio = Long-term Debt / Shareholders\' Funds', explanation: 'Capital structure indicator', examTip: 'Lower ratio = less risky' },
        { formula: 'Operating Ratio = (COGS + Operating Expenses) / Net Sales × 100', explanation: 'Efficiency of operations', examTip: 'Lower operating ratio = better profitability' },
      ]
    }
  ],
  general_test: [
    {
      chapter: 'Quantitative Aptitude', subject: 'general_test',
      formulas: [
        { formula: 'SI = P × R × T / 100', explanation: 'Simple Interest', examTip: 'Compare with CI for 2 years: CI - SI = P(R/100)²' },
        { formula: 'CI = P(1 + R/100)^T - P', explanation: 'Compound Interest', examTip: 'For 2 years: CI = SI + P(R/100)²' },
        { formula: 'Speed = Distance / Time', explanation: 'Basic speed formula', examTip: 'Average speed = 2S₁S₂/(S₁+S₂) for equal distances' },
        { formula: 'Profit% = (SP - CP) / CP × 100', explanation: 'Percentage profit calculation', examTip: 'If SP < CP, it\'s a loss' },
      ]
    }
  ],
  english: [
    {
      chapter: 'Grammar Rules', subject: 'english',
      formulas: [
        { formula: 'Subject-Verb Agreement: Singular subject → singular verb', explanation: 'Basic grammar rule', examTip: '"Each of" and "Every" take singular verbs' },
        { formula: 'Active → Passive: Object + be + V3 + by + Subject', explanation: 'Voice change formula', examTip: 'Tense of "be" matches the original tense' },
        { formula: 'Direct → Indirect: Change tense, pronoun, time/place words', explanation: 'Narration change rules', examTip: 'Universal truths don\'t change tense' },
      ]
    }
  ],
  business_studies: [
    {
      chapter: 'Financial Management', subject: 'business_studies',
      formulas: [
        { formula: 'Working Capital = Current Assets - Current Liabilities', explanation: 'Short-term financial health', examTip: 'Positive WC = good liquidity position' },
        { formula: 'Fixed Capital = Fixed Assets needed for business', explanation: 'Long-term investment needs', examTip: 'Depends on nature, scale & technology of business' },
      ]
    }
  ]
};

const FormulaSheet: React.FC<FormulaSheetProps> = ({ onBack }) => {
  const { isNeet, isCuet } = useExamMode();

  const getSubjects = (): { key: string; label: string }[] => {
    if (isCuet) {
      return [
        { key: 'economics', label: 'Economics' },
        { key: 'accountancy', label: 'Accountancy' },
        { key: 'general_test', label: 'General Test' },
        { key: 'english', label: 'English' },
        { key: 'business_studies', label: 'Business Studies' },
      ];
    }
    if (isNeet) {
      return [
        { key: 'physics', label: 'Physics' },
        { key: 'chemistry', label: 'Chemistry' },
        { key: 'biology', label: 'Biology' },
      ];
    }
    return [
      { key: 'physics', label: 'Physics' },
      { key: 'chemistry', label: 'Chemistry' },
      { key: 'maths', label: 'Maths' },
    ];
  };

  const subjects = getSubjects();
  const [activeSubject, setActiveSubject] = useState<string>(subjects[0].key);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const getChapters = (): ChapterFormulaGroup[] => {
    if (isCuet) return cuetFormulas[activeSubject] || [];
    if (activeSubject === 'biology') return neetBiologyFormulas;
    return getFormulasBySubject(activeSubject as 'physics' | 'chemistry' | 'maths');
  };

  const chapters = getChapters();

  const subjectColors: Record<string, string> = {
    physics: 'bg-physics text-white',
    chemistry: 'bg-chemistry text-white',
    maths: 'bg-maths text-white',
    biology: 'bg-green-600 text-white',
    economics: 'bg-amber-500 text-white',
    accountancy: 'bg-teal-500 text-white',
    general_test: 'bg-purple-500 text-white',
    english: 'bg-indigo-500 text-white',
    business_studies: 'bg-orange-500 text-white',
  };

  const subjectBorders: Record<string, string> = {
    physics: 'border-physics',
    chemistry: 'border-chemistry',
    maths: 'border-maths',
    biology: 'border-green-500',
    economics: 'border-amber-500',
    accountancy: 'border-teal-500',
    general_test: 'border-purple-500',
    english: 'border-indigo-500',
    business_studies: 'border-orange-500',
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
        <h2 className="text-xl font-bold">{isCuet ? 'Key Concepts & Formulas' : 'Formula Sheets'}</h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        {subjects.map((subject) => (
          <Button
            key={subject.key}
            variant={activeSubject === subject.key ? 'default' : 'outline'}
            onClick={() => { setActiveSubject(subject.key); setExpandedChapter(null); }}
            className={cn(activeSubject === subject.key && (subjectColors[subject.key] || ''))}
          >
            {subject.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        {chapters.map((chapter) => (
          <div
            key={chapter.chapter}
            className={cn('bg-card border-l-4 rounded-xl overflow-hidden', subjectBorders[activeSubject] || 'border-primary')}
          >
            <button
              onClick={() => toggleChapter(chapter.chapter)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{chapter.chapter}</h3>
                <p className="text-sm text-muted-foreground">{chapter.formulas.length} {isCuet ? 'key concepts' : 'formulas'}</p>
              </div>
              <ChevronLeft className={cn(
                'w-5 h-5 text-muted-foreground transition-transform',
                expandedChapter === chapter.chapter ? 'rotate-90' : '-rotate-90'
              )} />
            </button>

            {expandedChapter === chapter.chapter && (
              <div className="border-t border-border p-4 space-y-4">
                {chapter.formulas.map((item, i) => (
                  <div key={i} className="bg-secondary/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">{isCuet ? 'Concept:' : 'Formula:'}</p>
                        <code className="text-base font-mono text-foreground font-medium">
                          {renderFormula(item.formula)}
                        </code>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => copyFormula(item.formula)}>
                        {copiedFormula === item.formula ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Explanation:</p>
                      <p className="text-sm text-foreground">{item.explanation}</p>
                    </div>
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

      {chapters.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No formulas available for this subject yet. More coming soon!
        </div>
      )}
    </div>
  );
};

export default FormulaSheet;
