import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useBatchInfo } from '@/hooks/useBatchInfo';
import {
  TrendingUp, TrendingDown, AlertTriangle, Eye, Target,
  ClipboardList, Users, Hash, Activity, ChevronRight,
  Minus, CheckCircle2, Clock, BarChart2,
} from 'lucide-react';

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
};

// ── Helpers ─────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.05] ${className}`} />
);

function AccuracyBadge({ pct }: { pct: number }) {
  const color = pct >= 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
  const label = pct >= 70 ? 'Good' : pct >= 50 ? 'Average' : 'Weak';
  return (
    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

function TrendChip({ delta }: { delta: number }) {
  if (delta === 0) return (
    <span className="flex items-center gap-1 text-white/40 text-xs font-semibold">
      <Minus className="w-3 h-3" /> No change
    </span>
  );
  const up = delta > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-[#10B981]' : 'text-[#F87171]'}`}>
      {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {up ? '+' : ''}{delta}% vs last week
    </span>
  );
}

const consistencyMeta = {
  High:     { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  dot: 'bg-[#10B981]' },
  Moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  dot: 'bg-[#F59E0B]' },
  Low:      { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   dot: 'bg-[#EF4444]' },
};

// ── Component ────────────────────────────────────────────────────
const MyBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { info: batch, loading: batchLoading } = useBatchInfo();
  const cm = consistencyMeta[PERF.consistencyLevel];

  return (
    <MainLayout>
      <div className="min-h-screen pb-28" style={{ background: '#06080D' }}>

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="px-4 pt-16 lg:pt-20 pb-5 max-w-lg mx-auto">
          <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.2em]">Performance Dashboard</p>
          <h1 className="text-white font-black text-2xl tracking-tight mt-0.5">Your Report</h1>
        </div>

        <div className="max-w-lg mx-auto px-4 space-y-3">

          {/* ══════════════════════════════════════════════════════
              1. PERFORMANCE SNAPSHOT — HERO
          ══════════════════════════════════════════════════════ */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #0D1422 0%, #080E18 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.05]">
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.18em]">Last 7 Days</p>
                <p className="text-white font-bold text-sm mt-0.5">Performance Snapshot</p>
              </div>
              <TrendChip delta={PERF.accuracyTrend} />
            </div>

            {/* Three metrics */}
            <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
              {/* Accuracy */}
              <div className="px-4 py-5">
                <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-2">Accuracy</p>
                <p className="text-white font-black text-3xl leading-none">
                  {PERF.accuracy}<span className="text-white/30 text-lg font-bold">%</span>
                </p>
                <AccuracyBadge pct={PERF.accuracy} />
              </div>

              {/* Questions */}
              <div className="px-4 py-5">
                <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-2">Questions</p>
                <p className="text-white font-black text-3xl leading-none">{PERF.questionsLast7d}</p>
                <p className="text-white/25 text-[10px] mt-1.5">attempted</p>
              </div>

              {/* Rank */}
              <div className="px-4 py-5">
                <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-2">Batch Rank</p>
                <div className="flex items-baseline gap-0.5">
                  <p className="text-white font-black text-3xl leading-none">{PERF.rank}</p>
                  <p className="text-white/30 text-sm font-bold">/{PERF.batchSize}</p>
                </div>
                <p className="text-white/25 text-[10px] mt-1.5">in your batch</p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              2. MENTOR VISIBILITY PANEL
          ══════════════════════════════════════════════════════ */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #0E1520 0%, #090F1A 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>

            <div className="px-5 py-4 flex items-center gap-2.5 border-b border-white/[0.05]">
              <Eye className="w-4 h-4 text-[#818CF8]" />
              <p className="text-[#818CF8] text-xs font-black uppercase tracking-widest">What your mentor sees</p>
            </div>

            <div className="px-5 py-4 space-y-3.5">

              {/* Accuracy trend */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <span className="text-white/60 text-sm">Accuracy trend</span>
                </div>
                <TrendChip delta={PERF.accuracyTrend} />
              </div>

              {/* Weak subjects */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F87171] shrink-0 mt-0.5" />
                  <span className="text-white/60 text-sm">Weak subjects</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end max-w-[55%]">
                  {PERF.weakAreas.slice(0, 2).map(w => (
                    <span key={w.subject}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-[#F87171]"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {w.subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Consistency */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <span className="text-white/60 text-sm">Consistency</span>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: cm.bg, border: `1px solid ${cm.border}`, color: cm.color }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cm.dot}`} />
                  {PERF.consistencyLevel}
                </span>
              </div>
            </div>

            <div className="px-5 pb-4">
              <p className="text-white/20 text-[10px] leading-relaxed">
                Your mentor reviews this data before every session. Improving accuracy and consistency directly impacts how they guide you.
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              3. WEAK AREAS
          ══════════════════════════════════════════════════════ */}
          <div>
            <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.18em] mb-2 px-1">Weak Areas</p>
            <div className="space-y-2">
              {PERF.weakAreas.map((area) => {
                const color = area.accuracy < 50 ? '#EF4444' : '#F59E0B';
                return (
                  <div key={area.subject}
                    className="rounded-xl flex items-center gap-4 px-4 py-3.5"
                    style={{ background: '#0D1422', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{area.subject}</p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                          {area.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 rounded-full bg-white/[0.05]">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${area.accuracy}%`, background: color }} />
                        </div>
                        <span className="text-[11px] font-bold shrink-0" style={{ color }}>
                          {area.accuracy}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/practice')}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
                      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                      Fix Now <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              4. NEXT TEST READINESS
          ══════════════════════════════════════════════════════ */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #0D1422 0%, #080E18 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>

            <div className="px-5 pt-5 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="w-4 h-4 text-white/30" />
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Next Test Readiness</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <p className="text-[#F59E0B] text-sm font-bold">
                    Test in {PERF.nextTestDays} day{PERF.nextTestDays !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Readiness dial */}
              <div className="text-right">
                <p className="text-white font-black text-3xl leading-none">
                  {PERF.readiness}<span className="text-white/30 text-lg font-bold">%</span>
                </p>
                <p className="text-white/30 text-[10px] mt-0.5">readiness</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-2">
              <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 relative"
                  style={{
                    width: `${PERF.readiness}%`,
                    background: PERF.readiness >= 75
                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                      : PERF.readiness >= 50
                      ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                      : 'linear-gradient(90deg, #EF4444, #F87171)',
                  }} />
              </div>
              {/* Target marker */}
              <div className="relative h-3">
                <div className="absolute top-0 w-px h-3 bg-white/20"
                  style={{ left: `${PERF.readinessTarget}%` }} />
                <p className="absolute top-0 text-white/20 text-[9px] font-bold"
                  style={{ left: `${PERF.readinessTarget}%`, transform: 'translateX(-50%)' }}>
                  {PERF.readinessTarget}%
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-1">
              <p className="text-white/40 text-xs">
                Improve <span className="text-white/70 font-semibold">{PERF.readinessBlocker}</span> to reach{' '}
                <span className="text-white/70 font-semibold">{PERF.readinessTarget}% readiness</span>
              </p>
              <button
                onClick={() => navigate('/practice')}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}>
                <Target className="w-4 h-4 text-[#F59E0B]" />
                <span>Prepare Now</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              5. RECENT PERFORMANCE
          ══════════════════════════════════════════════════════ */}
          <div>
            <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.18em] mb-2 px-1">Recent Performance</p>
            <div className="grid grid-cols-2 gap-2">

              <div className="rounded-xl px-4 py-4"
                style={{ background: '#0D1422', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-3">Last Test</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-white font-black text-3xl">{PERF.lastTestScore}</p>
                  <p className="text-white/25 text-sm font-bold">/{PERF.lastTestTotal}</p>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-[#60A5FA]"
                    style={{ width: `${(PERF.lastTestScore / PERF.lastTestTotal) * 100}%` }} />
                </div>
              </div>

              <div className="rounded-xl px-4 py-4"
                style={{ background: '#0D1422', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-3">Last Session</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-white font-black text-3xl">{PERF.lastSessionAccuracy}</p>
                  <p className="text-white/25 text-sm font-bold">%</p>
                </div>
                <AccuracyBadge pct={PERF.lastSessionAccuracy} />
              </div>

            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              6. CONTROLLED MOTIVATION
          ══════════════════════════════════════════════════════ */}
          <div className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ background: '#0D1422', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />
                <p className="text-white/70 text-sm">{PERF.improvement}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />
                <p className="text-white/70 text-sm">
                  You are ahead of <span className="text-white font-bold">{PERF.percentileAhead}%</span> of students in your batch
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              BATCH INFO — LIVE DATA
          ══════════════════════════════════════════════════════ */}
          <div>
            <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.18em] mb-2 px-1">My Batch</p>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: '#0D1422', border: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Mentor row */}
              <div className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.05]">
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(batch?.mentorName ?? 'Mentor')}&backgroundColor=1e293b`}
                    alt="Mentor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {batchLoading ? (
                    <>
                      <Skeleton className="h-3 w-28 mb-1.5" />
                      <Skeleton className="h-2.5 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-white font-semibold text-sm truncate">{batch?.mentorName ?? 'Your Mentor'}</p>
                      <p className="text-white/35 text-[11px] truncate">{batch?.batchName ?? 'My Batch'}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[#10B981] text-[10px] font-bold">Active</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                {[
                  { icon: Users,    label: 'Enrolled',  color: '#60A5FA', value: batchLoading ? null : batch?.totalStudents ?? 0 },
                  { icon: Activity, label: 'Active Today', color: '#10B981', value: batchLoading ? null : batch?.practicingToday ?? 0 },
                  { icon: Hash,     label: 'Total Qs',  color: '#A78BFA',
                    value: batchLoading ? null : batch?.totalQuestionsAttempted ?? 0,
                    fmt: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v) },
                ].map(({ icon: Icon, label, color, value, fmt }) => (
                  <div key={label} className="px-4 py-4 text-center">
                    <Icon className="w-3.5 h-3.5 mx-auto mb-2" style={{ color, opacity: 0.5 }} />
                    {value === null
                      ? <Skeleton className="h-6 w-10 mx-auto mb-1" />
                      : <p className="font-black text-xl leading-none" style={{ color }}>
                          {fmt ? fmt(value as number) : value}
                        </p>
                    }
                    <p className="text-white/20 text-[9px] uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </MainLayout>
  );
};

export default MyBatchPage;
