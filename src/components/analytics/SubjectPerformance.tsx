import React from 'react';

interface SubjectScore {
  name: string;
  score: number;
  correct: number;
  total: number;
  color: string;
}

interface SubjectPerformanceProps {
  subjectScores: SubjectScore[];
}

export const SubjectPerformance: React.FC<SubjectPerformanceProps> = ({ subjectScores }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Subject-wise Performance</h3>
      <div className="space-y-5">
        {subjectScores.map((subject) => (
          <div key={subject.name}>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground">{subject.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{subject.correct}/{subject.total} correct</span>
                <span className="text-sm font-semibold text-foreground">{subject.score}%</span>
              </div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${subject.color} rounded-full transition-all duration-700`}
                style={{ width: `${Math.max(subject.score, 2)}%` }}
              />
            </div>
          </div>
        ))}
        {subjectScores.every(s => s.score === 0) && (
          <p className="text-sm text-muted-foreground text-center py-2">Practice questions to see subject performance.</p>
        )}
      </div>
    </div>
  );
};
