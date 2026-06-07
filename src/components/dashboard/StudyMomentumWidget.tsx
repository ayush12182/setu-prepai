import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Crown, ChevronDown, ChevronUp, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyMomentumWidgetProps {
  initialScore?: number;
  initialStreak?: number;
  className?: string;
}

export const StudyMomentumWidget: React.FC<StudyMomentumWidgetProps> = ({
  initialScore = 82, // Default to Elite (>80) for demonstration
  initialStreak = 14,
  className
}) => {
  const [score, setScore] = useState(initialScore);
  const [streak, setStreak] = useState(initialStreak);
  const [isHovered, setIsHovered] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [insightIdx, setInsightIdx] = useState(0);

  // AI Insights rotation
  const insights = [
    "Your consistency is strongest on weekdays but drops on Sundays.",
    "Completing one revision session tomorrow will push you into Elite Momentum.",
    "You're 4 days ahead of your projected syllabus completion."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIdx((prev) => (prev + 1) % insights.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const getTier = (s: number) => {
    if (s >= 80) return { name: 'Elite', color: 'text-purple-400', labelColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400' };
    if (s >= 60) return { name: 'Strong', color: 'text-emerald-400', labelColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
    if (s >= 30) return { name: 'Building', color: 'text-amber-400', labelColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
    return { name: 'Weak', color: 'text-red-400', labelColor: 'bg-red-500/10 border-red-500/30 text-red-400' };
  };

  const tier = getTier(score);
  const isElite = score >= 80;

  // Circular progress calculations
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // 30 Days Heatmap simulated data
  const heatmapLevels = [
    3, 4, 3, 2, 0, 3, 4, 2, 1, 3,
    0, 2, 3, 4, 4, 3, 0, 2, 3, 3,
    4, 3, 2, 1, 3, 4, 0, 3, 3, 4
  ];

  // Helper to color heatmap level
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-amber-500/20'; // Light Amber
      case 2: return 'bg-amber-500/50'; // Medium Amber
      case 3: return 'bg-amber-500/80'; // Strong Amber
      case 4: return 'bg-purple-600';    // Elite Purple
      default: return 'bg-[#1F2937]';    // Empty/Default
    }
  };

  // Trigger animation replay on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    setReplayKey((prev) => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "rounded-3xl border transition-all duration-300 p-6 flex flex-col gap-6 relative overflow-hidden bg-[#111827] w-full",
        isHovered
          ? "border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.18)] translate-y-[-2px]"
          : "border-amber-500/15 shadow-md",
        className
      )}
    >
      {/* Dynamic Background Halo for Elite Momentum */}
      {isElite && (
        <div 
          className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, #7C3AED 0%, #F59E0B 70%, transparent 100%)'
          }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center z-10">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-wide">
          🔥 Study Momentum
        </h3>
        <div className="flex items-center gap-2">
          {isElite && (
            <span className="flex items-center gap-1 text-[9px] bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
              <Crown className="w-3 h-3 text-purple-400 fill-purple-400" /> Elite Momentum
            </span>
          )}
          <span className={cn("text-[9px] border px-2 py-0.5 rounded-full font-black uppercase tracking-wider", tier.labelColor)}>
            {tier.name}
          </span>
        </div>
      </div>

      {/* Circular Progress & Streak Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center z-10">
        {/* Left Side: Ring Graphic */}
        <div className="flex flex-col items-center justify-center relative py-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-32 h-32 transform -rotate-90">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              {/* Back track */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#1F2937"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Active fill */}
              <motion.circle
                key={replayKey}
                cx="64"
                cy="64"
                r={radius}
                stroke="url(#ringGradient)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300",
                  isElite && "drop-shadow-[0_0_6px_rgba(124,58,237,0.6)]"
                )}
              />
            </svg>
            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white">{score}%</span>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-0.5">Consistent</span>
            </div>
          </div>
        </div>

        {/* Right Side: Streak & Rankings */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
              🔥 {streak} Day Streak
            </h4>
            <div className="text-xs text-[#94A3B8] font-bold flex items-center justify-center sm:justify-start gap-1">
              🏆 JEE Rank Potential
              <span className="h-3 w-px bg-white/10 mx-1" />
              <span className="text-amber-500 font-extrabold">Top 12% Consistency</span>
            </div>
          </div>

          {/* Daily Goal Target Progress */}
          <div className="bg-[#1F2937] rounded-2xl p-3.5 space-y-2 border border-white/5 text-left">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-extrabold uppercase text-[#94A3B8] tracking-wider">Today's Goal</span>
              <span className="text-emerald-400 font-black">2 Tasks Remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                />
              </div>
              <span className="text-[11px] font-mono font-black text-white shrink-0">7/10 Qs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Indicator Row */}
      <div className="flex items-center justify-between bg-[#1F2937]/50 rounded-2xl p-3 border border-white/5 z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Weekly Momentum Trend</span>
        </div>
        <span className="text-xs font-black text-emerald-400 flex items-center gap-0.5">
          ↗ +8% This Week
        </span>
      </div>

      {/* 30-Day GitHub Heatmap */}
      <div className="space-y-2 z-10">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-[#94A3B8] tracking-widest">Last 30 Days Activity</span>
          <span className="text-[10px] text-white/35 font-semibold">Study Habit Map</span>
        </div>
        <div className="grid grid-cols-10 gap-1.5 p-2 bg-black/20 border border-white/5 rounded-2xl">
          {heatmapLevels.map((lvl, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.01 }}
              whileHover={{ scale: 1.25, zIndex: 10 }}
              className={cn(
                "w-full aspect-square rounded-md transition-colors cursor-pointer relative group/tile",
                getLevelColor(lvl)
              )}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-popover border border-white/10 text-[9px] font-bold text-white shadow-xl opacity-0 pointer-events-none group-hover/tile:opacity-100 transition-opacity z-50 whitespace-nowrap">
                Day {idx + 1}: {lvl === 4 ? 'Elite Study (6+ hrs)' : lvl === 3 ? 'Strong Study (4-6 hrs)' : lvl === 2 ? 'Medium Study (2-4 hrs)' : lvl === 1 ? 'Light Study (<2 hrs)' : 'Rest Day'}
              </div>
            </motion.div>
          ))}
        </div>
        {/* Heatmap Legend */}
        <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-[#94A3B8] pt-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-[#1F2937]" />
          <div className="w-2.5 h-2.5 rounded bg-amber-500/20" />
          <div className="w-2.5 h-2.5 rounded bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded bg-purple-600" />
          <span>More</span>
        </div>
      </div>

      {/* AI Coach Card */}
      <div className="bg-[#1F2937] rounded-3xl p-4.5 border border-white/5 flex gap-3.5 items-start relative z-10 group/coach">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-lg text-amber-500 shrink-0 select-none">
          🧠
        </div>
        <div className="flex-1 space-y-1 overflow-hidden min-h-[44px] flex flex-col justify-center">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">AI Coach</span>
            <span className="text-[8px] bg-amber-500/20 text-white font-bold px-1.5 py-0.5 rounded">AUTO</span>
          </div>
          <div className="relative overflow-hidden w-full">
            <AnimatePresence mode="wait">
              <motion.p
                key={insightIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-slate-300 font-medium leading-relaxed"
              >
                "{insights[insightIdx]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Achievements Progress */}
      <div className="space-y-3 z-10 border-t border-white/5 pt-4">
        <h4 className="text-[10px] font-black uppercase text-[#94A3B8] tracking-widest">Achievements System</h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Badge 1: 30-Day Streak */}
          <div className="bg-[#1F2937] border border-white/5 rounded-2xl p-3.5 space-y-2.5 relative group/badge">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔥</span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-white">30-Day Streak</p>
                <p className="text-[9px] text-[#94A3B8]">In Progress</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: '70%' }} />
              </div>
              <p className="text-[9px] font-bold text-right text-amber-500">21 / 30 Days</p>
            </div>
          </div>

          {/* Badge 2: 100 Qs Solved */}
          <div className="bg-[#1F2937] border border-white/5 rounded-2xl p-3.5 space-y-2.5 relative group/badge">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚡</span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-white">100 Qs Solved</p>
                <p className="text-[9px] text-[#94A3B8]">In Progress</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '72%' }} />
              </div>
              <p className="text-[9px] font-bold text-right text-purple-400">72 / 100 Qs</p>
            </div>
          </div>

          {/* Unlocked Badges */}
          <div className="col-span-2 grid grid-cols-2 gap-3 opacity-60">
            <div className="bg-[#1F2937]/50 border border-white/5 rounded-2xl p-3 flex items-center gap-2.5">
              <span className="text-xl">🏅</span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-white">First Week Done</p>
                <p className="text-[9px] text-[#22C55E] font-black uppercase">Unlocked</p>
              </div>
            </div>
            <div className="bg-[#1F2937]/50 border border-white/5 rounded-2xl p-3 flex items-center gap-2.5">
              <span className="text-xl">🔥</span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-white">7-Day Streak</p>
                <p className="text-[9px] text-[#22C55E] font-black uppercase">Unlocked</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion breakdown */}
      <div className="border-t border-white/5 pt-4 z-10">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#94A3B8] hover:text-white transition-colors"
        >
          <span>Study Momentum Score Breakdown</span>
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-3"
            >
              <div className="bg-[#1F2937] rounded-2xl p-4.5 border border-white/5 space-y-3.5 text-xs text-slate-350">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Consistency Score Calculation</span>
                  <span className="text-white font-bold">Weighted Index</span>
                </div>
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between">
                    <span>📅 Daily Activity</span>
                    <span className="text-white font-bold font-mono">40% Weight</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📚 Revision Completion</span>
                    <span className="text-white font-bold font-mono">30% Weight</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚡ Practice Questions</span>
                    <span className="text-white font-bold font-mono">20% Weight</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏆 Mock Tests</span>
                    <span className="text-white font-bold font-mono">10% Weight</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/35 italic pt-2 border-t border-white/5">
                  Formula: Score = (Daily * 0.4) + (Rev * 0.3) + (Prac * 0.2) + (Mock * 0.1)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};
