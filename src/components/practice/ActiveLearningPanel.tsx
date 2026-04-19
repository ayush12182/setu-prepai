import React from 'react';
import { LearningNode } from '@/hooks/useLearningEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, Zap, Clock, BookOpen, ArrowRight, History, Flame, Trophy } from 'lucide-react';
import { NodeStabilityIndicator } from './IntelligenceIndicators';
import { cn } from '@/lib/utils';

interface ActiveLearningPanelProps {
  node: LearningNode;
  onStartPractice: (node: LearningNode, difficulty: string) => void;
}

export const ActiveLearningPanel: React.FC<ActiveLearningPanelProps> = ({ node, onStartPractice }) => {
  const score = (node as any).weak_score;
  const attempts = (node as any).total_attempts || 0;
  
  const isRed = score !== null && score < 0.6 && attempts >= 5;
  const isMastered = score !== null && score >= 0.8;

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-xl border-l border-border p-6 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-tighter text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            {node.type} Logic
          </span>
          <NodeStabilityIndicator score={score} attempts={attempts} size="md" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-1 leading-tight">{node.name}</h2>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <History className="w-3 h-3" /> Last practiced: {(node as any).last_attempted_at ? new Date((node as any).last_attempted_at).toLocaleDateString() : 'Never'}
        </p>
      </div>

      {/* Stability Insight (The AI Reason) */}
      <Card className="p-4 bg-secondary/30 border-border/50 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Stability Insight</h3>
        <p className="text-sm text-foreground leading-relaxed">
          {isRed 
            ? "Your accuracy dropped significantly in the last 10 questions. We recommend focusing on fundamentals before attempting hard problems."
            : isMastered
            ? "Subject mastery achieved. You are hitting 80%+ accuracy with consistent speed. Ready for PYQs and Time Attacks."
            : attempts === 0
            ? "Untouched territory. Start with easy conceptual MCQs to build your baseline."
            : "Stability is improving. Focus on reducing 'silly mistakes' to reach the Mastered tier."}
        </p>
      </Card>

      {/* Action Decision Points */}
      <div className="space-y-3 mt-auto">
        <h3 className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Critical Actions</h3>
        
        {isRed ? (
          <Button 
            onClick={() => onStartPractice(node, 'easy')}
            className="w-full bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl font-bold gap-2"
          >
            <Zap className="w-4 h-4" /> Rescue Fundamentals
          </Button>
        ) : isMastered ? (
          <Button 
            onClick={() => onStartPractice(node, 'hard')}
            className="w-full bg-green-500 hover:bg-green-600 text-white h-12 rounded-xl font-bold gap-2"
          >
             <Trophy className="w-4 h-4" /> Start Challenge Mode
          </Button>
        ) : (
          <Button 
            onClick={() => onStartPractice(node, 'medium')}
            className="w-full bg-accent text-primary h-12 rounded-xl font-bold gap-2 shadow-lg shadow-accent/20"
          >
            <History className="w-4 h-4" /> Continue Practice
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold uppercase h-10 border-border/50">
            <BookOpen className="w-3 h-3 mr-2" /> Revision
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold uppercase h-10 border-border/50">
            <Flame className="w-3 h-3 mr-2" /> Key Topics
          </Button>
        </div>
      </div>
    </div>
  );
};
