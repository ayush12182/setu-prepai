import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { physicsChapters, chemistryChapters, mathsChapters, Subject } from '@/data/syllabus';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FormulaSheetProps {
  onBack: () => void;
}

const FormulaSheet: React.FC<FormulaSheetProps> = ({ onBack }) => {
  const [activeSubject, setActiveSubject] = useState<Subject>('physics');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const getChapters = () => {
    switch (activeSubject) {
      case 'physics': return physicsChapters;
      case 'chemistry': return chemistryChapters;
      case 'maths': return mathsChapters;
    }
  };

  const subjectColors = {
    physics: 'bg-physics text-white',
    chemistry: 'bg-chemistry text-white',
    maths: 'bg-maths text-white'
  };

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    toast.success('Formula copied!');
    setTimeout(() => setCopiedFormula(null), 2000);
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
            onClick={() => setActiveSubject(subject)}
            className={cn(
              'capitalize',
              activeSubject === subject && subjectColors[subject]
            )}
          >
            {subject}
          </Button>
        ))}
      </div>

      {/* Formulas by Chapter */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {getChapters().map((chapter) => (
          <div key={chapter.id} className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3">{chapter.name}</h3>
            <div className="grid gap-2">
              {chapter.keyFormulas.map((formula, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2 group"
                >
                  <code className="text-sm font-mono text-foreground">{formula}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyFormula(formula)}
                  >
                    {copiedFormula === formula ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormulaSheet;
