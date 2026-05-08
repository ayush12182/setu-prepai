import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useBatchInfo } from '@/hooks/useBatchInfo';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, Eye, Target,
  ClipboardList, Users, Hash, Activity, ChevronRight,
  Minus, CheckCircle2, Clock, BarChart2, Zap
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';

// ── Dummy data (replace with real hooks) ────────────────────────
const PERF = {
  accuracy: 68,
  questionsLast7d: 142,
  rank: 12,
  batchSize: 60,
  accuracyTrend: +6,           // +/- percentage points vs last week
  consistencyLevel: 'Moderate' as 'High' | 'Moderate' | 'Low',
  weakAreas: [
    { subject: 'Integration', accuracy: 42, tag: 'Critical' },
    { subject: 'Organic Chemistry', accuracy: 51, tag: 'Frequent errors' },
    { subject: 'Electrostatics', accuracy: 55, tag: 'Borderline' },
  ],
  nextTestDays: 4,
  readiness: 61,
  readinessBlocker: 'Maths',
  readinessTarget: 75,
  lastTestScore: 74,
  lastTestTotal: 100,
  lastSessionAccuracy: 71,
  improvement: '+6% accuracy this week',
  percentileAhead: 40,
  radarData: [
    { topic: 'Mechanics', score: 75, fullMark: 100 },
    { topic: 'Electrostatics', score: 55, fullMark: 100 },
    { topic: 'Organic', score: 62, fullMark: 100 },
    { topic: 'Calculus', score: 85, fullMark: 100 },
    { topic: 'Algebra', score: 45, fullMark: 100 },
  ]
};

// ── Helpers ─────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.05] ${className}`} />
);

function AccuracyBadge({ pct }: { pct: number }) {
  const isGood = pct >= 70;
  const isAvg = pct >= 50;
  const color = isGood ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
                isAvg ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 
                'text-rose-400 border-rose-500/30 bg-rose-500/10';
  const label = isGood ? 'Good' : isAvg ? 'Average' : 'Weak';
  
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${color}`}>
      {label}
    </span>
  );
}

function TrendChip({ delta }: { delta: number }) {
  if (delta === 0) return (
    <span className="flex items-center gap-1 text-white/40 text-[11px] font-bold uppercase tracking-wider">
      <Minus className="w-3.5 h-3.5" /> No change
    </span>
  );
  const up = delta > 0;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${up ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{delta}% vs last week
    </span>
  );
}

const consistencyMeta = {
  High:     { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  Moderate: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
  Low:      { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    dot: 'bg-rose-400' },
};

// ── Component ────────────────────────────────────────────────────
const MyBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { info: batch, loading: batchLoading } = useBatchInfo();
  const cm = consistencyMeta[PERF.consistencyLevel];

  return (
    <MainLayout>
      <div className="min-h-screen pb-28" style={{ background: '#07111F' }}>

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="px-5 pt-16 lg:pt-24 pb-8 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[#FF9B54] text-[10px] font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B54] animate-pulse" />
              Performance Analytics
            </p>
            <h1 className="text-white font-black text-4xl tracking-tight">Your Report</h1>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto px-5 space-y-6">

          {/* ══════════════════════════════════════════════════════
              1. PERFORMANCE SNAPSHOT — HERO
          ══════════════════════════════════════════════════════ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden border border-white/[0.08]"
            style={{ background: 'linear-gradient(145deg, #0D1624 0%, #080D16 100%)' }}
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9B54]/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.04] relative z-10">
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Last 7 Days</p>
                <h2 className="text-white font-bold text-lg">Performance Snapshot</h2>
              </div>
              <TrendChip delta={PERF.accuracyTrend} />
            </div>

            {/* Three metrics */}
            <div className="grid grid-cols-3 divide-x divide-white/[0.04] relative z-10">
              {/* Accuracy */}
              <div className="px-6 py-6 group">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Accuracy</p>
                  <AccuracyBadge pct={PERF.accuracy} />
                </div>
                <p className="text-white font-black text-4xl tracking-tighter">
                  {PERF.accuracy}<span className="text-white/30 text-xl font-bold ml-1">%</span>
                </p>
              </div>

              {/* Questions */}
              <div className="px-6 py-6">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">Attempted</p>
                <p className="text-white font-black text-4xl tracking-tighter">{PERF.questionsLast7d}</p>
                <p className="text-white/30 text-[10px] font-medium mt-1">questions total</p>
              </div>

              {/* Rank */}
              <div className="px-6 py-6">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">Batch Rank</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-[#FF9B54] font-black text-4xl tracking-tighter">#{PERF.rank}</p>
                  <p className="text-white/30 text-sm font-bold">/{PERF.batchSize}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════
              1.5 SKILL RADAR (SPIDER WEB)
          ══════════════════════════════════════════════════════ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-3xl overflow-hidden border border-white/[0.08] relative"
            style={{ background: 'linear-gradient(145deg, #0A121E 0%, #060A10 100%)' }}
          >
            <div className="px-6 pt-6 pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-[#FF9B54]" />
                <h2 className="text-white font-bold text-lg">Topic Mastery Radar</h2>
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em] mb-4">Analyze your balance across key subjects</p>
            </div>
            <div className="h-64 w-full pt-4 pb-2 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PERF.radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0D1624', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#FF9B54' }}
                  />
                  <Radar name="Accuracy" dataKey="score" stroke="#FF9B54" strokeWidth={2} fill="#FF9B54" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════
              2. NEXT TEST READINESS
          ══════════════════════════════════════════════════════ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl overflow-hidden border border-white/[0.08] relative"
            style={{ background: 'linear-gradient(145deg, #0A121E 0%, #060A10 100%)' }}
          >
            <div className="px-6 py-6">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF9B54]/10 border border-[#FF9B54]/20 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-[#FF9B54]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Assessment</p>
                    <p className="text-white font-bold text-base">Next Test Readiness</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-3xl tracking-tighter leading-none">
                    {PERF.readiness}<span className="text-white/30 text-lg font-bold">%</span>
                  </p>
                  <p className="text-[#FF9B54] text-[10px] font-bold uppercase tracking-wider mt-1.5 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> Test in {PERF.nextTestDays} days
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6 relative">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">
                  <span>Current: {PERF.readiness}%</span>
                  <span>Target: {PERF.readinessTarget}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#FF9B54]/80 to-[#FF9B54] transition-all duration-1000"
                    style={{ width: `${PERF.readiness}%` }} />
                </div>
                {/* Target marker */}
                <div className="absolute top-6 bottom-0 w-0.5 bg-white z-10" style={{ left: `${PERF.readinessTarget}%` }}>
                  <div className="absolute -top-1.5 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#07111F]" />
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-2xl p-2 pl-4">
                <p className="text-white/60 text-xs">
                  Improve <span className="text-white font-bold">{PERF.readinessBlocker}</span> to reach target.
                </p>
                <button
                  onClick={() => navigate('/practice')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#07111F] bg-[#FF9B54] hover:bg-[#ffaa6d] transition-all"
                >
                  <Target className="w-3.5 h-3.5" />
                  Prepare Now
                </button>
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════
              3. WEAK AREAS
          ══════════════════════════════════════════════════════ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 px-2">Priority Focus Areas</p>
            <div className="space-y-3">
              {PERF.weakAreas.map((area, i) => {
                const isCritical = area.accuracy < 50;
                const color = isCritical ? 'text-rose-400' : 'text-amber-400';
                const bg = isCritical ? 'bg-rose-500/10' : 'bg-amber-500/10';
                const border = isCritical ? 'border-rose-500/20' : 'border-amber-500/20';
                const fill = isCritical ? '#fb7185' : '#fbbf24';

                return (
                  <div key={area.subject}
                    className="rounded-2xl p-5 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.03] transition-colors relative overflow-hidden group">
                    
                    {/* Background subtle glow for critical items */}
                    {isCritical && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50" />}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-base">{area.subject}</h3>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${bg} ${color} ${border}`}>
                            {area.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[200px] h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${area.accuracy}%`, background: fill }} />
                          </div>
                          <span className={`text-xs font-bold ${color}`}>{area.accuracy}% acc.</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/practice')}
                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${bg} ${color} ${border} hover:opacity-80`}>
                        Fix Now <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════
              4. MENTOR VISIBILITY PANEL
          ══════════════════════════════════════════════════════ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-3xl p-6 border border-[#6366f1]/20 bg-[#6366f1]/[0.03] relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#6366f1]/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-5">
              <Eye className="w-4 h-4 text-[#818CF8]" />
              <p className="text-[#818CF8] text-[11px] font-black uppercase tracking-widest">Mentor Visibility</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#07111F]/50 rounded-2xl p-4 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Accuracy Trend</span>
                </div>
                <TrendChip delta={PERF.accuracyTrend} />
              </div>

              <div className="bg-[#07111F]/50 rounded-2xl p-4 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Consistency</span>
                </div>
                <span className={`flex items-center w-fit gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${cm.bg} ${cm.border} ${cm.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cm.dot}`} />
                  {PERF.consistencyLevel}
                </span>
              </div>
            </div>

            <p className="text-[#818CF8]/60 text-[10px] mt-4 leading-relaxed font-medium">
              Your mentor sees this data before every class. Consistent practice directly impacts the quality of your personalized guidance.
            </p>
          </motion.div>

          {/* ══════════════════════════════════════════════════════
              5. BATCH INFO — LIVE DATA
          ══════════════════════════════════════════════════════ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 px-2">Batch Overview</p>
            <div className="rounded-3xl overflow-hidden border border-white/[0.05] bg-white/[0.02]">

              {/* Mentor row */}
              <div className="px-6 py-5 flex items-center gap-4 border-b border-white/[0.05]">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#0D1520]">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(batch?.mentorName ?? 'Mentor')}&backgroundColor=1e293b`}
                    alt="Mentor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {batchLoading ? (
                    <>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </>
                  ) : (
                    <>
                      <p className="text-white font-bold text-base truncate">{batch?.mentorName ?? 'Your Mentor'}</p>
                      <p className="text-white/40 text-xs truncate">{batch?.batchName ?? 'My Batch'}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                {[
                  { icon: Users,    label: 'Enrolled',    color: '#60A5FA', value: batchLoading ? null : batch?.totalStudents ?? 0 },
                  { icon: Zap,      label: 'Active Today',color: '#FF9B54', value: batchLoading ? null : batch?.practicingToday ?? 0 },
                  { icon: Hash,     label: 'Total Qs',    color: '#A78BFA',
                    value: batchLoading ? null : batch?.totalQuestionsAttempted ?? 0,
                    fmt: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v) },
                ].map(({ icon: Icon, label, color, value, fmt }) => (
                  <div key={label} className="px-5 py-6 text-center group">
                    <div className="w-8 h-8 mx-auto rounded-full mb-3 flex items-center justify-center transition-colors"
                      style={{ background: `${color}10`, color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {value === null
                      ? <Skeleton className="h-6 w-12 mx-auto mb-1" />
                      : <p className="font-black text-2xl tracking-tight text-white group-hover:scale-105 transition-transform">
                          {fmt ? fmt(value as number) : value}
                        </p>
                    }
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-1.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="h-8" />
        </div>
      </div>
    </MainLayout>
  );
};

export default MyBatchPage;
