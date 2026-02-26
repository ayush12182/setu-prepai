import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ChapterStat {
  id: string;
  name: string;
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
  timeSpent: number;
  sessions: number;
}

interface ChapterBreakdownProps {
  chapters: ChapterStat[];
}

const getStrength = (accuracy: number) => {
  if (accuracy >= 80) return { label: 'Strong', color: 'bg-setu-success/15 text-setu-success border-setu-success/30', icon: CheckCircle2 };
  if (accuracy >= 60) return { label: 'Moderate', color: 'bg-setu-saffron/15 text-setu-saffron border-setu-saffron/30', icon: Minus };
  return { label: 'Weak', color: 'bg-setu-error/15 text-setu-error border-setu-error/30', icon: AlertTriangle };
};

export const ChapterBreakdown: React.FC<ChapterBreakdownProps> = ({ chapters }) => {
  const [sortBy, setSortBy] = useState<'accuracy' | 'questions'>('accuracy');
  const [showAll, setShowAll] = useState(false);

  const sorted = [...chapters].sort((a, b) =>
    sortBy === 'accuracy' ? a.accuracy - b.accuracy : b.total - a.total
  );

  const displayed = showAll ? sorted : sorted.slice(0, 10);

  if (chapters.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-3">Chapter-wise Breakdown</h3>
        <p className="text-sm text-muted-foreground text-center py-4">Complete practice sessions to see chapter analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Chapter-wise Breakdown</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('accuracy')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${sortBy === 'accuracy' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            By Accuracy
          </button>
          <button
            onClick={() => setSortBy('questions')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${sortBy === 'questions' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            By Questions
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {displayed.map((ch) => {
          const strength = getStrength(ch.accuracy);
          return (
            <div key={ch.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{ch.name}</p>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${strength.color}`}>
                    {strength.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{ch.subject} • {ch.total} questions • {ch.sessions} sessions</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${ch.accuracy >= 60 ? 'text-setu-success' : 'text-setu-error'}`}>
                  {ch.accuracy}%
                </p>
                <p className="text-[10px] text-muted-foreground">{ch.correct}/{ch.total}</p>
              </div>
            </div>
          );
        })}
      </div>

      {chapters.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1"
        >
          {showAll ? (
            <>Show Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show All {chapters.length} Chapters <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
};
