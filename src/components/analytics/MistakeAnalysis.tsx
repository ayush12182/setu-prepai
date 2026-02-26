import React from 'react';
import { AlertTriangle, Brain, TrendingDown } from 'lucide-react';

export interface MistakePattern {
  concept: string;
  chapter: string;
  subject: string;
  wrongCount: number;
  totalAttempts: number;
  accuracy: number;
}

interface MistakeAnalysisProps {
  patterns: MistakePattern[];
  weakChapters: { name: string; accuracy: number; subject: string }[];
}

export const MistakeAnalysis: React.FC<MistakeAnalysisProps> = ({ patterns, weakChapters }) => {
  return (
    <div className="space-y-4">
      {/* Mistake Patterns by Concept */}
      <div className="bg-card border border-setu-error/20 rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Brain className="w-5 h-5 text-setu-error" />
          Where You're Making Mistakes
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Concepts where you've answered incorrectly the most</p>

        {patterns.length > 0 ? (
          <div className="space-y-3">
            {patterns.slice(0, 8).map((p, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-setu-error/5 border border-setu-error/10">
                <div className="w-8 h-8 rounded-full bg-setu-error/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-setu-error">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.concept}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.chapter} • {p.subject}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-setu-error">{p.wrongCount} wrong</p>
                  <p className="text-[10px] text-muted-foreground">{p.accuracy}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Practice more to see mistake patterns.</p>
        )}
      </div>

      {/* Weak Chapters Focus */}
      <div className="bg-setu-warning/5 border border-setu-warning/20 rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-setu-warning" />
          Priority Focus Areas
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Chapters below 60% accuracy — focus here first</p>

        {weakChapters.length > 0 ? (
          <div className="grid gap-2">
            {weakChapters.map((ch, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{ch.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{ch.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-setu-error rounded-full" style={{ width: `${ch.accuracy}%` }} />
                  </div>
                  <span className="text-sm font-bold text-setu-error w-10 text-right">{ch.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            No weak chapters detected yet. Keep practicing!
          </p>
        )}
      </div>
    </div>
  );
};
