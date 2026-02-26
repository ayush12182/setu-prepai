import React from 'react';
import { TrendingUp, Target, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface OverviewCardsProps {
  overallScore: number;
  questionsDone: number;
  studyTimeHours: number;
  weakChapters: number;
  totalCorrect: number;
  totalIncorrect: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  overallScore, questionsDone, studyTimeHours, weakChapters, totalCorrect, totalIncorrect,
}) => {
  const cards = [
    { icon: TrendingUp, value: `${overallScore}%`, label: 'Overall Accuracy', color: 'text-setu-success', bg: 'bg-setu-success/10' },
    { icon: Target, value: `${questionsDone}`, label: 'Questions Solved', color: 'text-physics', bg: 'bg-physics/10' },
    { icon: CheckCircle2, value: `${totalCorrect}`, label: 'Correct', color: 'text-setu-success', bg: 'bg-setu-success/10' },
    { icon: XCircle, value: `${totalIncorrect}`, label: 'Incorrect', color: 'text-setu-error', bg: 'bg-setu-error/10' },
    { icon: Clock, value: `${studyTimeHours}h`, label: 'Study Time', color: 'text-setu-saffron', bg: 'bg-setu-saffron/10' },
    { icon: AlertTriangle, value: `${weakChapters}`, label: 'Weak Chapters', color: 'text-setu-warning', bg: 'bg-setu-warning/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-card border border-border rounded-xl p-4 text-center">
          <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mx-auto mb-2`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
        </div>
      ))}
    </div>
  );
};
