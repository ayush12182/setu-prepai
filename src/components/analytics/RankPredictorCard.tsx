import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Target, Building2, Flame } from 'lucide-react';
import { predictRank, ExamTarget, RankPrediction } from '@/lib/rankEngine';

interface RankPredictorCardProps {
  score: number;
  maxScore: number;
  exam: ExamTarget;
  previousRank?: number; // Optional: to show improvement
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

export const RankPredictorCard: React.FC<RankPredictorCardProps> = ({ score, maxScore, exam, previousRank }) => {
  const [prediction, setPrediction] = useState<RankPrediction | null>(null);

  useEffect(() => {
    const p = predictRank(score, maxScore, exam);
    setPrediction(p);
  }, [score, maxScore, exam]);

  if (!prediction) return null;

  const isImproving = previousRank !== undefined && prediction.rank < previousRank;
  const rankDiff = previousRank ? Math.abs(previousRank - prediction.rank) : 0;
  
  const isTopTier = prediction.percentile >= 90;
  const isMidTier = prediction.percentile >= 70 && prediction.percentile < 90;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-2xl"
    >
      {/* Decorative Blur */}
      <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 pointer-events-none 
        ${isTopTier ? 'bg-emerald-500' : isMidTier ? 'bg-amber-500' : 'bg-red-500'}`} 
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-xs font-bold font-display">
            <Trophy className="w-4 h-4 text-accent" /> Live AI Rank Predictor
          </div>
          <span className="px-3 py-1 bg-secondary rounded-full text-xs font-bold uppercase tracking-widest text-foreground border border-border">
            {exam.replace('_', ' ')}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Estimated Rank</p>
            <div className="text-5xl md:text-7xl font-display font-black text-foreground tabular-nums tracking-tighter flex items-center gap-2">
              <span className="text-accent/50 text-4xl">#</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                {formatNumber(prediction.rank)}
              </motion.span>
            </div>
          </div>
          
          <div className="mb-2">
            <p className="text-muted-foreground text-sm font-medium">
              Based on your score of <span className="text-foreground font-bold">{Math.round(score)}/{maxScore}</span>
            </p>
          </div>
        </div>

        {/* Motivational Trend Line */}
        {previousRank && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-8 font-bold text-sm
            ${isImproving ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
          >
            {isImproving ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {isImproving ? (
              <span>🔥 You've climbed {formatNumber(rankDiff)} ranks! Keep going!</span>
            ) : (
              <span>Rough patch. You slipped {formatNumber(rankDiff)} ranks. Let's fix your weak spots.</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           <div className="bg-secondary/50 border border-border rounded-2xl p-4">
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                <Target size={14}/> Percentile
              </p>
              <p className="text-xl font-bold">{prediction.percentile} %ile</p>
              <p className="text-[10px] text-muted-foreground mt-1 tracking-wider">TOP {(100 - prediction.percentile).toFixed(1)}% OF STUDENTS</p>
           </div>
           <div className="bg-secondary/50 border border-border rounded-2xl p-4">
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                <Building2 size={14}/> College Bracket
              </p>
              <p className="text-lg font-bold text-accent truncate">{prediction.collegeProjection}</p>
           </div>
        </div>

        {/* Multi-tier Progress Bar */}
        <div className="w-full">
           <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
             <span>Top 100</span>
             <span>Out of {formatNumber(prediction.totalCandidates)} Aspirants</span>
           </div>
           <div className="h-4 w-full bg-secondary rounded-full overflow-hidden relative">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${prediction.percentile}%` }}
               transition={{ duration: 1.5, ease: 'easeOut' }}
               className={`h-full absolute left-0 ${isTopTier ? 'bg-emerald-500' : isMidTier ? 'bg-amber-500' : 'bg-red-500'}`}
             />
             <div className="absolute top-0 right-0 h-full w-[4px] bg-white opacity-50" />
           </div>
        </div>

      </div>
    </motion.div>
  );
};
