import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface DifferenceTablesProps {
  onBack: () => void;
}

interface DiffTable {
  title: string;
  subject?: string;
  items: { aspect: string; left: string; right: string }[];
}

// Static fallbacks
const cuetFallbackTables: DiffTable[] = [
  { title: 'Micro vs Macroeconomics', subject: 'economics', items: [
    { aspect: 'Scope', left: 'Individual units', right: 'Economy as a whole' },
    { aspect: 'Focus', left: 'Price, demand-supply', right: 'National income, inflation' },
    { aspect: 'Example', left: 'Price of wheat', right: 'GDP of India' },
  ]},
  { title: 'Fayol vs Taylor', subject: 'business_studies', items: [
    { aspect: 'Focus', left: 'General management', right: 'Scientific management' },
    { aspect: 'Approach', left: 'Top-down', right: 'Bottom-up (shop floor)' },
    { aspect: 'Key Idea', left: '14 Principles', right: 'Time & Motion Study' },
  ]},
  { title: 'Money Market vs Capital Market', subject: 'business_studies', items: [
    { aspect: 'Duration', left: 'Short-term (≤1 year)', right: 'Long-term (>1 year)' },
    { aspect: 'Instruments', left: 'T-bills, CP, CD', right: 'Shares, Debentures' },
    { aspect: 'Risk', left: 'Low', right: 'Higher' },
  ]},
  { title: 'Partnership vs Company', subject: 'accountancy', items: [
    { aspect: 'Registration', left: 'Optional', right: 'Compulsory' },
    { aspect: 'Liability', left: 'Unlimited', right: 'Limited to shares' },
    { aspect: 'Transferability', left: 'Consent needed', right: 'Freely transferable' },
  ]},
];

const jeeFallbackTables: DiffTable[] = [
  { title: 'Elastic vs Inelastic Collision', subject: 'physics', items: [
    { aspect: 'KE', left: 'Conserved', right: 'Not conserved' },
    { aspect: 'Momentum', left: 'Conserved', right: 'Conserved' },
    { aspect: 'e value', left: 'e = 1', right: 'e < 1' },
  ]},
  { title: 'SN1 vs SN2 Reaction', subject: 'chemistry', items: [
    { aspect: 'Mechanism', left: 'Two-step', right: 'One-step' },
    { aspect: 'Rate', left: 'k[substrate]', right: 'k[substrate][nucleophile]' },
    { aspect: 'Stereochemistry', left: 'Racemization', right: 'Inversion' },
  ]},
  { title: 'Differentiation vs Integration', subject: 'maths', items: [
    { aspect: 'Operation', left: 'Rate of change', right: 'Area under curve' },
    { aspect: 'Power Rule', left: 'xⁿ → nxⁿ⁻¹', right: 'xⁿ → xⁿ⁺¹/(n+1)' },
  ]},
];

const neetFallbackTables: DiffTable[] = [
  { title: 'Mitosis vs Meiosis', subject: 'biology', items: [
    { aspect: 'Occurs in', left: 'Somatic cells', right: 'Germ cells' },
    { aspect: 'Daughter cells', left: '2 diploid', right: '4 haploid' },
    { aspect: 'Purpose', left: 'Growth/repair', right: 'Sexual reproduction' },
  ]},
  { title: 'Ionic vs Covalent Bond', subject: 'chemistry', items: [
    { aspect: 'Formation', left: 'Electron transfer', right: 'Electron sharing' },
    { aspect: 'Melting Point', left: 'High', right: 'Low to moderate' },
  ]},
];

const DifferenceTables: React.FC<DifferenceTablesProps> = ({ onBack }) => {
  const { isNeet, isCuet } = useExamMode();
  const { language } = useLanguage();
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [aiTables, setAiTables] = useState<DiffTable[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const getFallbackTables = (): DiffTable[] => {
    return isCuet ? cuetFallbackTables : isNeet ? [...jeeFallbackTables.filter(t => t.subject !== 'maths'), ...neetFallbackTables] : jeeFallbackTables;
  };

  const generateAITables = async () => {
    setIsLoading(true);
    try {
      const subject = activeSubject === 'all' ? (isCuet ? 'all CUET subjects' : isNeet ? 'Physics, Chemistry, Biology' : 'Physics, Chemistry, Maths') : activeSubject;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-revision-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'difference_tables',
          subject,
          examMode: isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed');
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setAiTables(result.data);
        setHasGenerated(true);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Could not generate. Showing saved tables.');
    } finally {
      setIsLoading(false);
    }
  };

  const allTables = hasGenerated && aiTables ? aiTables : getFallbackTables();
  const filteredTables = activeSubject === 'all' ? allTables : allTables.filter(t => t.subject === activeSubject);

  const subjectColors: Record<string, string> = {
    physics: 'border-physics', chemistry: 'border-chemistry', maths: 'border-maths',
    biology: 'border-green-500', economics: 'border-amber-500', business_studies: 'border-orange-500',
    accountancy: 'border-teal-500', general_test: 'border-purple-500',
  };

  const getSubjects = (): { key: string; label: string }[] => {
    if (isCuet) {
      const unique = [...new Set(allTables.map(t => t.subject).filter(Boolean))];
      const labelMap: Record<string, string> = {
        economics: 'Economics', business_studies: 'Business Studies',
        accountancy: 'Accountancy', general_test: 'General Test',
      };
      return [{ key: 'all', label: 'All' }, ...unique.map(s => ({ key: s!, label: labelMap[s!] || s! }))];
    }
    if (isNeet) return [{ key: 'all', label: 'All' }, { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'biology', label: 'Biology' }];
    return [{ key: 'all', label: 'All' }, { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'maths', label: 'Maths' }];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-xl font-bold">Difference Tables</h2>
        </div>
        <Button variant="outline" size="sm" onClick={generateAITables} disabled={isLoading} className="gap-2">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {hasGenerated ? 'Refresh' : 'Generate Fresh'}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {getSubjects().map((subject) => (
          <Button
            key={subject.key}
            size="sm"
            onClick={() => setActiveSubject(subject.key)}
            className={cn(
              activeSubject === subject.key 
                ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-[#FF6B00]" 
                : "bg-[rgba(251,146,60,0.08)] border-[rgba(251,146,60,0.25)] text-white hover:bg-[rgba(251,146,60,0.15)] hover:border-[rgba(251,146,60,0.4)] hover:text-white"
            )}
          >
            {subject.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Generating fresh comparison tables...</span>
        </div>
      ) : (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {filteredTables.map((table, idx) => (
            <div key={idx} className={cn('bg-card border-l-4 rounded-xl p-4', subjectColors[table.subject || ''] || 'border-primary')}>
              <h3 className="font-semibold text-lg mb-4">{table.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground">Aspect</th>
                      <th className="text-left py-2 px-3">{table.title.split(' vs ')[0]}</th>
                      <th className="text-left py-2 px-3">{table.title.split(' vs ')[1]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.items.map((item, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2 px-3 font-medium text-muted-foreground">{item.aspect}</td>
                        <td className="py-2 px-3">{item.left}</td>
                        <td className="py-2 px-3">{item.right}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DifferenceTables;
