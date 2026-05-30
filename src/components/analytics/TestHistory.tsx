import React from 'react';
import { FileText, Trophy, Clock } from 'lucide-react';
import { format } from 'date-fns';

export interface TestRecord {
  id: string;
  date: string;
  score: number | null;
  maxScore: number | null;
  physicsScore: number | null;
  chemistryScore: number | null;
  mathsScore: number | null;
  timeSeconds: number;
  percentile: number | null;
}

interface TestHistoryProps {
  tests: TestRecord[];
}

export const TestHistory: React.FC<TestHistoryProps> = ({ tests }) => {
  if (tests.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-physics" />
          Major Test History
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">No major tests completed yet. Take your first full-length test!</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-prepentrance-saffron" />
        Major Test History
      </h3>

      <div className="space-y-3">
        {tests.map((test, idx) => {
          const scorePercent = test.score && test.maxScore ? Math.round((test.score / test.maxScore) * 100) : 0;
          const timeMins = Math.round(test.timeSeconds / 60);
          return (
            <div key={test.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Test #{tests.length - idx}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(test.date), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{test.score ?? 0}/{test.maxScore ?? 300}</p>
                  <p className="text-xs text-muted-foreground">{scorePercent}% • {timeMins} min</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-md bg-physics/10">
                  <p className="text-xs text-muted-foreground">Physics</p>
                  <p className="text-sm font-bold text-physics">{test.physicsScore ?? 0}</p>
                </div>
                <div className="text-center p-2 rounded-md bg-chemistry/10">
                  <p className="text-xs text-muted-foreground">Chemistry</p>
                  <p className="text-sm font-bold text-chemistry">{test.chemistryScore ?? 0}</p>
                </div>
                <div className="text-center p-2 rounded-md bg-maths/10">
                  <p className="text-xs text-muted-foreground">Maths</p>
                  <p className="text-sm font-bold text-maths">{test.mathsScore ?? 0}</p>
                </div>
              </div>

              {test.percentile && (
                <p className="text-xs text-prepentrance-saffron mt-2 text-center font-medium">
                  Est. Percentile: {test.percentile}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
