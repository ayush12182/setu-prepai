import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AccuracyPieChartProps {
  totalCorrect: number;
  totalIncorrect: number;
  subjectScores: { name: string; correct: number; total: number; color: string }[];
}

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)', 'hsl(220, 14%, 80%)'];

export const AccuracyPieChart: React.FC<AccuracyPieChartProps> = ({
  totalCorrect, totalIncorrect, subjectScores,
}) => {
  const unattempted = 0;
  const overallData = [
    { name: 'Correct', value: totalCorrect },
    { name: 'Incorrect', value: totalIncorrect },
  ].filter(d => d.value > 0);

  const total = totalCorrect + totalIncorrect;

  const subjectData = subjectScores
    .filter(s => s.total > 0)
    .map(s => ({
      name: s.name,
      value: s.total,
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }));

  if (total === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <h3 className="font-semibold text-foreground mb-2">Accuracy Breakdown</h3>
        <p className="text-sm text-muted-foreground py-8">Practice questions to see your accuracy chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Accuracy Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Pie */}
        <div className="flex flex-col items-center">
          <div className="w-full h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {overallData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [`${value} questions`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{Math.round((totalCorrect / total) * 100)}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
              <span className="text-xs text-muted-foreground">Correct ({totalCorrect})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[1] }} />
              <span className="text-xs text-muted-foreground">Incorrect ({totalIncorrect})</span>
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        {subjectData.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {subjectData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={['hsl(220, 70%, 55%)', 'hsl(160, 60%, 45%)', 'hsl(35, 90%, 55%)'][index % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} Qs (${props.payload.accuracy}% accuracy)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {subjectData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ['hsl(220, 70%, 55%)', 'hsl(160, 60%, 45%)', 'hsl(35, 90%, 55%)'][i % 3] }}
                  />
                  <span className="text-xs text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
