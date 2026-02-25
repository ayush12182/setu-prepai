import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';

interface DifferenceTablesProps {
  onBack: () => void;
}

const jeeOnlyTables = [
  {
    title: 'Differentiation vs Integration', subject: 'maths',
    items: [
      { aspect: 'Operation', left: 'Finding rate of change', right: 'Finding area under curve' },
      { aspect: 'Symbol', left: 'd/dx or f\'(x)', right: '∫f(x)dx' },
      { aspect: 'Power Rule', left: 'xⁿ → nxⁿ⁻¹', right: 'xⁿ → xⁿ⁺¹/(n+1)' },
      { aspect: 'Relation', left: 'Inverse of integration', right: 'Inverse of differentiation' },
    ]
  },
  {
    title: 'Permutation vs Combination', subject: 'maths',
    items: [
      { aspect: 'Order', left: 'Matters', right: 'Does not matter' },
      { aspect: 'Formula', left: 'ⁿPᵣ = n!/(n-r)!', right: 'ⁿCᵣ = n!/[r!(n-r)!]' },
      { aspect: 'Use case', left: 'Arrangements', right: 'Selections' },
      { aspect: 'Example', left: 'Ranking 3 from 10', right: 'Choosing 3 from 10' },
    ]
  }
];

const neetOnlyTables = [
  {
    title: 'Mitosis vs Meiosis', subject: 'biology',
    items: [
      { aspect: 'Occurs in', left: 'Somatic cells', right: 'Germ cells' },
      { aspect: 'Divisions', left: '1 division', right: '2 divisions' },
      { aspect: 'Daughter cells', left: '2 diploid cells', right: '4 haploid cells' },
      { aspect: 'Purpose', left: 'Growth / repair', right: 'Sexual reproduction' },
    ]
  },
  {
    title: 'Arteries vs Veins', subject: 'biology',
    items: [
      { aspect: 'Direction', left: 'Away from heart', right: 'Toward heart' },
      { aspect: 'Blood type', left: 'Oxygenated (except pulmonary)', right: 'Deoxygenated (except pulmonary)' },
      { aspect: 'Wall', left: 'Thick & elastic', right: 'Thin & less elastic' },
      { aspect: 'Valves', left: 'Absent', right: 'Present' },
    ]
  },
  {
    title: 'C3 vs C4 Plants', subject: 'biology',
    items: [
      { aspect: 'First stable product', left: '3-PGA (3 carbon)', right: 'OAA (4 carbon)' },
      { aspect: 'CO₂ fixation enzyme', left: 'RuBisCO', right: 'PEP carboxylase' },
      { aspect: 'Photorespiration', left: 'High', right: 'Negligible' },
      { aspect: 'Example', left: 'Wheat, Rice, Oats', right: 'Sugarcane, Maize, Sorghum' },
    ]
  }
];

const cuetTables = [
  {
    title: 'Micro vs Macroeconomics', subject: 'economics',
    items: [
      { aspect: 'Scope', left: 'Individual units (firm, consumer)', right: 'Economy as a whole' },
      { aspect: 'Focus', left: 'Price determination, demand-supply', right: 'National income, inflation, employment' },
      { aspect: 'Example', left: 'Price of wheat in a market', right: 'GDP of India' },
      { aspect: 'Key concept', left: 'Consumer equilibrium', right: 'Aggregate demand & supply' },
    ]
  },
  {
    title: 'Revenue Deficit vs Fiscal Deficit', subject: 'economics',
    items: [
      { aspect: 'Definition', left: 'Revenue Expenditure - Revenue Receipts', right: 'Total Expenditure - Total Receipts (excl. borrowings)' },
      { aspect: 'Indicates', left: 'Govt spending more on day-to-day expenses', right: 'Total borrowing needs of govt' },
      { aspect: 'Formula', left: 'RD = RE - RR', right: 'FD = TE - TR (non-debt)' },
      { aspect: 'Concern', left: 'Using borrowed funds for consumption', right: 'Overall fiscal health' },
    ]
  },
  {
    title: 'Fayol vs Taylor', subject: 'business_studies',
    items: [
      { aspect: 'Focus', left: 'General management principles', right: 'Scientific management' },
      { aspect: 'Approach', left: 'Top-down (manager level)', right: 'Bottom-up (shop floor)' },
      { aspect: 'Applicability', left: 'Universal — all types of organizations', right: 'Mainly industrial/factory settings' },
      { aspect: 'Key Idea', left: '14 Principles of Management', right: 'Time & Motion Study' },
    ]
  },
  {
    title: 'Money Market vs Capital Market', subject: 'business_studies',
    items: [
      { aspect: 'Duration', left: 'Short-term (up to 1 year)', right: 'Long-term (over 1 year)' },
      { aspect: 'Instruments', left: 'T-bills, Commercial Paper, CD', right: 'Shares, Debentures, Bonds' },
      { aspect: 'Risk', left: 'Low', right: 'Comparatively higher' },
      { aspect: 'Liquidity', left: 'High', right: 'Moderate' },
    ]
  },
  {
    title: 'Partnership vs Company', subject: 'accountancy',
    items: [
      { aspect: 'Registration', left: 'Optional', right: 'Compulsory' },
      { aspect: 'Members', left: 'Min 2, Max 50', right: 'Min 2 (Pvt) / 7 (Public), no max for public' },
      { aspect: 'Liability', left: 'Unlimited', right: 'Limited to shares held' },
      { aspect: 'Transferability', left: 'With consent of all partners', right: 'Shares freely transferable (public)' },
    ]
  },
  {
    title: 'Formal vs Informal Communication', subject: 'business_studies',
    items: [
      { aspect: 'Channel', left: 'Official chain of command', right: 'Grapevine / unofficial' },
      { aspect: 'Speed', left: 'Slow (follows hierarchy)', right: 'Fast (no fixed path)' },
      { aspect: 'Reliability', left: 'High — documented', right: 'Low — can be distorted' },
      { aspect: 'Example', left: 'Memos, reports, notices', right: 'Casual talks, rumors' },
    ]
  },
  {
    title: 'Deductive vs Inductive Reasoning', subject: 'general_test',
    items: [
      { aspect: 'Direction', left: 'General → Specific', right: 'Specific → General' },
      { aspect: 'Approach', left: 'Top-down', right: 'Bottom-up' },
      { aspect: 'Conclusion', left: 'Certain (if premises true)', right: 'Probable' },
      { aspect: 'Example', left: 'All birds fly; sparrow is bird; sparrow flies', right: 'Sparrows fly, eagles fly → all birds fly' },
    ]
  },
];

const commonTables = [
  {
    title: 'Rotation vs Revolution', subject: 'physics',
    items: [
      { aspect: 'Definition', left: 'Body spins on its own axis', right: 'Body moves around another object' },
      { aspect: 'Axis', left: 'Internal axis', right: 'External axis' },
      { aspect: 'Example', left: 'Earth spinning (day/night)', right: 'Earth around Sun (year)' },
      { aspect: 'Formula', left: 'ω = dθ/dt', right: 'T = 2πr/v' },
    ]
  },
  {
    title: 'Elastic vs Inelastic Collision', subject: 'physics',
    items: [
      { aspect: 'KE', left: 'Conserved', right: 'Not conserved' },
      { aspect: 'Momentum', left: 'Conserved', right: 'Conserved' },
      { aspect: 'e value', left: 'e = 1', right: 'e < 1 (0 for perfectly inelastic)' },
      { aspect: 'Example', left: 'Ideal gas molecules', right: 'Clay balls colliding' },
    ]
  },
  {
    title: 'SHM vs Uniform Circular Motion', subject: 'physics',
    items: [
      { aspect: 'Path', left: 'Straight line (1D)', right: 'Circle (2D)' },
      { aspect: 'Projection', left: 'SHM is projection of UCM', right: 'UCM projects to SHM' },
      { aspect: 'Acceleration', left: 'a = -ω²x (towards mean)', right: 'a = ω²r (towards center)' },
      { aspect: 'Velocity', left: 'Max at mean position', right: 'Constant magnitude' },
    ]
  },
  {
    title: 'Ionic vs Covalent Bond', subject: 'chemistry',
    items: [
      { aspect: 'Formation', left: 'Electron transfer', right: 'Electron sharing' },
      { aspect: 'Between', left: 'Metal + Non-metal', right: 'Non-metal + Non-metal' },
      { aspect: 'Melting Point', left: 'High', right: 'Low to moderate' },
      { aspect: 'Conductivity', left: 'Conducts when molten/dissolved', right: 'Usually non-conductor' },
    ]
  },
  {
    title: 'SN1 vs SN2 Reaction', subject: 'chemistry',
    items: [
      { aspect: 'Mechanism', left: 'Two-step (carbocation)', right: 'One-step (concerted)' },
      { aspect: 'Rate', left: 'Rate = k[substrate]', right: 'Rate = k[substrate][nucleophile]' },
      { aspect: 'Substrate', left: '3° > 2° > 1°', right: '1° > 2° > 3°' },
      { aspect: 'Stereochemistry', left: 'Racemization', right: 'Inversion (Walden)' },
    ]
  },
];

const DifferenceTables: React.FC<DifferenceTablesProps> = ({ onBack }) => {
  const { isNeet, isCuet } = useExamMode();
  const [activeSubject, setActiveSubject] = useState<string>('all');

  const differenceTables = isCuet
    ? cuetTables
    : isNeet
      ? [...commonTables, ...neetOnlyTables]
      : [...commonTables, ...jeeOnlyTables];

  const filteredTables = activeSubject === 'all'
    ? differenceTables
    : differenceTables.filter(t => t.subject === activeSubject);

  const subjectColors: Record<string, string> = {
    physics: 'border-physics',
    chemistry: 'border-chemistry',
    maths: 'border-maths',
    biology: 'border-green-500',
    economics: 'border-amber-500',
    business_studies: 'border-orange-500',
    accountancy: 'border-teal-500',
    general_test: 'border-purple-500',
  };

  const getSubjects = (): { key: string; label: string }[] => {
    if (isCuet) {
      const uniqueSubjects = [...new Set(cuetTables.map(t => t.subject))];
      const labelMap: Record<string, string> = {
        economics: 'Economics', business_studies: 'Business Studies',
        accountancy: 'Accountancy', general_test: 'General Test',
      };
      return [{ key: 'all', label: 'All' }, ...uniqueSubjects.map(s => ({ key: s, label: labelMap[s] || s }))];
    }
    if (isNeet) return [{ key: 'all', label: 'All' }, { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'biology', label: 'Biology' }];
    return [{ key: 'all', label: 'All' }, { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'maths', label: 'Maths' }];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Difference Tables</h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        {getSubjects().map((subject) => (
          <Button
            key={subject.key}
            variant={activeSubject === subject.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSubject(subject.key)}
          >
            {subject.label}
          </Button>
        ))}
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {filteredTables.map((table, idx) => (
          <div key={idx} className={cn('bg-card border-l-4 rounded-xl p-4', subjectColors[table.subject] || 'border-primary')}>
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
    </div>
  );
};

export default DifferenceTables;
