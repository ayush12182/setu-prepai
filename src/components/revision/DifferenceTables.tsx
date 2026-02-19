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
    title: 'Differentiation vs Integration',
    subject: 'maths',
    items: [
      { aspect: 'Operation', left: 'Finding rate of change', right: 'Finding area under curve' },
      { aspect: 'Symbol', left: 'd/dx or f\'(x)', right: '∫f(x)dx' },
      { aspect: 'Power Rule', left: 'xⁿ → nxⁿ⁻¹', right: 'xⁿ → xⁿ⁺¹/(n+1)' },
      { aspect: 'Relation', left: 'Inverse of integration', right: 'Inverse of differentiation' },
    ]
  },
  {
    title: 'Permutation vs Combination',
    subject: 'maths',
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
    title: 'Mitosis vs Meiosis',
    subject: 'biology',
    items: [
      { aspect: 'Occurs in', left: 'Somatic cells', right: 'Germ cells' },
      { aspect: 'Divisions', left: '1 division', right: '2 divisions' },
      { aspect: 'Daughter cells', left: '2 diploid cells', right: '4 haploid cells' },
      { aspect: 'Purpose', left: 'Growth / repair', right: 'Sexual reproduction' },
    ]
  },
  {
    title: 'Arteries vs Veins',
    subject: 'biology',
    items: [
      { aspect: 'Direction', left: 'Away from heart', right: 'Toward heart' },
      { aspect: 'Blood type', left: 'Oxygenated (except pulmonary)', right: 'Deoxygenated (except pulmonary)' },
      { aspect: 'Wall', left: 'Thick & elastic', right: 'Thin & less elastic' },
      { aspect: 'Valves', left: 'Absent', right: 'Present' },
    ]
  },
  {
    title: 'C3 vs C4 Plants',
    subject: 'biology',
    items: [
      { aspect: 'First stable product', left: '3-PGA (3 carbon)', right: 'OAA (4 carbon)' },
      { aspect: 'CO₂ fixation enzyme', left: 'RuBisCO', right: 'PEP carboxylase' },
      { aspect: 'Photorespiration', left: 'High', right: 'Negligible' },
      { aspect: 'Example', left: 'Wheat, Rice, Oats', right: 'Sugarcane, Maize, Sorghum' },
    ]
  }
];

const commonTables = [
  {
    title: 'Rotation vs Revolution',
    subject: 'physics',
    items: [
      { aspect: 'Definition', left: 'Body spins on its own axis', right: 'Body moves around another object' },
      { aspect: 'Axis', left: 'Internal axis', right: 'External axis' },
      { aspect: 'Example', left: 'Earth spinning (day/night)', right: 'Earth around Sun (year)' },
      { aspect: 'Formula', left: 'ω = dθ/dt', right: 'T = 2πr/v' },
    ]
  },
  {
    title: 'Elastic vs Inelastic Collision',
    subject: 'physics',
    items: [
      { aspect: 'KE', left: 'Conserved', right: 'Not conserved' },
      { aspect: 'Momentum', left: 'Conserved', right: 'Conserved' },
      { aspect: 'e value', left: 'e = 1', right: 'e < 1 (0 for perfectly inelastic)' },
      { aspect: 'Example', left: 'Ideal gas molecules', right: 'Clay balls colliding' },
    ]
  },
  {
    title: 'SHM vs Uniform Circular Motion',
    subject: 'physics',
    items: [
      { aspect: 'Path', left: 'Straight line (1D)', right: 'Circle (2D)' },
      { aspect: 'Projection', left: 'SHM is projection of UCM', right: 'UCM projects to SHM' },
      { aspect: 'Acceleration', left: 'a = -ω²x (towards mean)', right: 'a = ω²r (towards center)' },
      { aspect: 'Velocity', left: 'Max at mean position', right: 'Constant magnitude' },
    ]
  },
  {
    title: 'Ionic vs Covalent Bond',
    subject: 'chemistry',
    items: [
      { aspect: 'Formation', left: 'Electron transfer', right: 'Electron sharing' },
      { aspect: 'Between', left: 'Metal + Non-metal', right: 'Non-metal + Non-metal' },
      { aspect: 'Melting Point', left: 'High', right: 'Low to moderate' },
      { aspect: 'Conductivity', left: 'Conducts when molten/dissolved', right: 'Usually non-conductor' },
    ]
  },
  {
    title: 'SN1 vs SN2 Reaction',
    subject: 'chemistry',
    items: [
      { aspect: 'Mechanism', left: 'Two-step (carbocation)', right: 'One-step (concerted)' },
      { aspect: 'Rate', left: 'Rate = k[substrate]', right: 'Rate = k[substrate][nucleophile]' },
      { aspect: 'Substrate', left: '3° > 2° > 1°', right: '1° > 2° > 3°' },
      { aspect: 'Stereochemistry', left: 'Racemization', right: 'Inversion (Walden)' },
    ]
  },
];

const DifferenceTables: React.FC<DifferenceTablesProps> = ({ onBack }) => {
  const { isNeet } = useExamMode();
  const [activeSubject, setActiveSubject] = useState<string>('all');

  const differenceTables = isNeet
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
  };

  const subjects = isNeet
    ? ['all', 'physics', 'chemistry', 'biology']
    : ['all', 'physics', 'chemistry', 'maths'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Difference Tables</h2>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {subjects.map((subject) => (
          <Button
            key={subject}
            variant={activeSubject === subject ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSubject(subject)}
            className="capitalize"
          >
            {subject === 'all' ? 'All Subjects' : subject}
          </Button>
        ))}
      </div>

      {/* Tables */}
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {filteredTables.map((table, idx) => (
          <div
            key={idx}
            className={cn(
              'bg-card border-l-4 rounded-xl p-4',
              subjectColors[table.subject]
            )}
          >
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
