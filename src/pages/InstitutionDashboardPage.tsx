import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, ClipboardList, BarChart3, Plus, Search, Filter,
  ChevronRight, CheckCircle2, Clock, Zap, Sparkles, BookOpen,
  Brain, Target, TrendingUp, ArrowUpRight, MoreHorizontal, Play,
  SlidersHorizontal, X, GraduationCap, FlaskConical, Atom,
  FunctionSquare, Badge, Award, AlertCircle, Layers, AlertTriangle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useB2BManager } from '@/hooks/useB2BManager';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts';
import { generateBatchInsights, StudentInsightData } from '@/lib/insightEngine';

/* ─────────────────────────────────────────────────────────────
   MOCK DATA  (Replace with Supabase queries in production)
───────────────────────────────────────────────────────────── */
const ORG = {
  name: 'Newton Academy',
  plan: 'pro' as const,
  city: 'Kota',
  totalStudents: 124,
  activeBatches: 4,
};

const BATCHES = [
  { id: 'b1', name: 'JEE 2026 – Alpha', subject: 'Physics + Maths', students: 32, mentor: 'Dr. Mehta', avgAccuracy: 64, status: 'active' as const },
  { id: 'b2', name: 'JEE 2026 – Beta',  subject: 'All Subjects',   students: 28, mentor: 'Mrs. Kapoor', avgAccuracy: 71, status: 'active' as const },
  { id: 'b3', name: 'JEE 2027 – Gamma', subject: 'Chemistry Focus', students: 36, mentor: 'Mr. Sharma', avgAccuracy: 58, status: 'active' as const },
  { id: 'b4', name: 'Crash Course',     subject: 'Mixed',           students: 28, mentor: 'Dr. Mehta',  avgAccuracy: 47, status: 'paused' as const },
];

const STUDENTS = [
  { id: 's1', name: 'Arjun Singh',   batch: 'JEE 2026 – Alpha', accuracy: 78, attempts: 320, topGap: 'None', status: 'stable' as const },
  { id: 's2', name: 'Priya Sharma',  batch: 'JEE 2026 – Beta',  accuracy: 42, attempts: 180, topGap: 'SHM Concepts', status: 'at-risk' as const },
  { id: 's3', name: 'Rohit Kumar',   batch: 'JEE 2026 – Alpha', accuracy: 65, attempts: 260, topGap: 'Calculation Errors', status: 'improving' as const },
  { id: 's4', name: 'Sneha Reddy',   batch: 'JEE 2027 – Gamma', accuracy: 54, attempts: 140, topGap: 'Rotation', status: 'stable' as const },
  { id: 's5', name: 'Anish Gupta',   batch: 'Crash Course',     accuracy: 31, attempts: 85,  topGap: 'Multiple Topics', status: 'critical' as const },
  { id: 's6', name: 'Kavya Nair',    batch: 'JEE 2026 – Beta',  accuracy: 82, attempts: 440, topGap: 'None', status: 'stable' as const },
];

const BATCH_DISTRIBUTION = [
  { range: '0-20%', students: 2 },
  { range: '21-40%', students: 4 },
  { range: '41-60%', students: 28 },
  { range: '61-80%', students: 45 },
  { range: '81-100%', students: 18 },
];

const TOPIC_ACCURACY = [
  { topic: 'Mechanics',     accuracy: 68, color: '#3b82f6' },
  { topic: 'Electrostatics', accuracy: 52, color: '#f59e0b' },
  { topic: 'Optics',        accuracy: 74, color: '#10b981' },
  { topic: 'Thermal',       accuracy: 41, color: '#ef4444' },
  { topic: 'Modern Physics', accuracy: 79, color: '#8b5cf6' },
  { topic: 'Calculus',      accuracy: 60, color: '#06b6d4' },
];

const TESTS: { id: string; title: string; batch: string; mode: 'ai_generated' | 'manual'; subject: string; questions: number; scheduled: string; status: 'draft' | 'live' | 'completed' }[] = [
  { id: 't1', title: 'Mechanics Full Test', batch: 'JEE 2026 – Alpha', mode: 'ai_generated', subject: 'Physics', questions: 20, scheduled: 'Mar 31, 2026', status: 'draft' },
  { id: 't2', title: 'Organic Chemistry Sprint', batch: 'JEE 2026 – Beta', mode: 'manual', subject: 'Chemistry', questions: 15, scheduled: 'Apr 2, 2026', status: 'live' },
  { id: 't3', title: 'Calculus Crash Test', batch: 'Crash Course', mode: 'ai_generated', subject: 'Maths', questions: 10, scheduled: 'Mar 28, 2026', status: 'completed' },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

type Tab = 'overview' | 'batches' | 'students' | 'tests';

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm group hover:border-border/80 transition-colors">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', `bg-${color}-500/10 text-${color}-500`)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{label}</p>
        <p className="text-3xl font-display font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  stable:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  improving: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'at-risk': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical:  'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]',
};

const TEST_STATUS_STYLES = {
  draft:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
  live:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

/* ─────────────────────────────────────────────────────────────
   CREATE TEST MODAL
───────────────────────────────────────────────────────────── */
interface CreateTestModalProps { onClose: () => void; }

function CreateTestModal({ onClose }: CreateTestModalProps) {
  const [mode, setMode] = useState<'ai_generated' | 'manual' | null>(null);
  const [form, setForm] = useState({
    title: '', batch: BATCHES[0].id, subject: 'Physics', topic: '', subtopic: '', difficulty: 'medium' as const, count: 10,
  });
  const [step, setStep] = useState<'pick-mode' | 'configure' | 'done'>('pick-mode');
  const { createTest, loading } = useB2BManager();

  const handleCreateTest = async () => {
    if (!form.title) return;
    
    const success = await createTest({
      batch_id: form.batch,
      title: form.title,
      mode: mode || 'ai_generated',
      subject: form.subject,
      topic: form.topic,
      subtopic: form.subtopic,
      difficulty: form.difficulty,
      question_count: form.count
    });

    if (success) {
      setStep('done');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        className="relative z-10 bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" /> Create Test
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Assign to a batch</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {step === 'pick-mode' && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground mb-4">Choose test creation mode:</p>
              <button
                id="test-mode-ai"
                onClick={() => { setMode('ai_generated'); setStep('configure'); }}
                className="w-full flex items-start gap-4 p-4 rounded-2xl border border-border hover:border-accent/50 hover:bg-accent/5 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Brain size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">AI-Generated Test</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pick a topic, difficulty, and count. AI builds the question set instantly.</p>
                </div>
                <ChevronRight size={16} className="ml-auto self-center text-muted-foreground group-hover:text-accent transition-colors" />
              </button>

              <button
                id="test-mode-manual"
                onClick={() => { setMode('manual'); setStep('configure'); }}
                className="w-full flex items-start gap-4 p-4 rounded-2xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">Manual Selection</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Hand-pick specific questions from the verified question bank.</p>
                </div>
                <ChevronRight size={16} className="ml-auto self-center text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
          )}

          {step === 'configure' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep('pick-mode')} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  ← Back
                </button>
                <span className="text-xs font-bold text-accent uppercase tracking-widest">
                  {mode === 'ai_generated' ? '⚡ AI Generated' : '🔧 Manual'}
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Test Title</label>
                <input
                  id="test-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Mechanics Full Test"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              {/* Batch */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Batch</label>
                <select
                  id="test-batch"
                  value={form.batch}
                  onChange={e => setForm(f => ({ ...f, batch: e.target.value }))}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {BATCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {mode === 'ai_generated' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Topic</label>
                      <input
                        id="test-topic"
                        value={form.topic}
                        onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                        placeholder="e.g. Mechanics"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Subtopic</label>
                      <input
                        id="test-subtopic"
                        value={form.subtopic}
                        onChange={e => setForm(f => ({ ...f, subtopic: e.target.value }))}
                        placeholder="e.g. Friction"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Difficulty</label>
                      <select
                        id="test-difficulty"
                        value={form.difficulty}
                        onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as any }))}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      >
                        {['easy', 'medium', 'hard', 'mixed'].map(d => (
                          <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Questions</label>
                      <input
                        id="test-count"
                        type="number"
                        min={5} max={50}
                        value={form.count}
                        onChange={e => setForm(f => ({ ...f, count: Number(e.target.value) }))}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                  </div>
                </>
              )}

              {mode === 'manual' && (
                <div className="bg-secondary/30 rounded-xl p-4 border border-border text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Question Bank</p>
                  <p className="text-xs">After saving, you'll be taken to the question picker with filters for topic, subtopic, difficulty, and tags.</p>
                </div>
              )}

              <Button
                id="test-create-btn"
                onClick={handleCreateTest}
                disabled={loading || !form.title.trim()}
                className="w-full h-11 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/20 mt-2"
              >
                {loading ? 'Creating...' : mode === 'ai_generated' ? <><Zap size={15} className="mr-2" /> Generate Test</> : <><SlidersHorizontal size={15} className="mr-2" /> Pick Questions</>}
              </Button>
            </div>
          )}

          {step === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground">Test Created!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your test has been saved as a draft. You can schedule and publish it from the Tests tab.
              </p>
              <Button onClick={onClose} className="mt-2 rounded-xl bg-accent text-white px-8">
                Done
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const InstitutionDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [searchStudents, setSearchStudents] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  
  // Prompt UI state for creating batches
  const { createBatch, loading: creatingBatch } = useB2BManager();
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [batchForm, setBatchForm] = useState({ name: '', subject: '' });

  const handleCreateBatch = async () => {
    if (!batchForm.name || !batchForm.subject) return;
    const res = await createBatch(batchForm.name, batchForm.subject);
    if (res) {
      setShowCreateBatch(false);
      setBatchForm({ name: '', subject: '' });
      // In production, trigger a refetch of BATCHES here
    }
  };

  const filteredStudents = useMemo(() =>
    STUDENTS.filter(s =>
      (selectedBatch === 'all' || s.batch === BATCHES.find(b => b.id === selectedBatch)?.name) &&
      s.name.toLowerCase().includes(searchStudents.toLowerCase())
    ),
    [searchStudents, selectedBatch]
  );

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',  label: 'Overview',  icon: BarChart3 },
    { id: 'batches',   label: 'Batches',   icon: Users },
    { id: 'students',  label: 'Students',  icon: GraduationCap },
    { id: 'tests',     label: 'Tests',     icon: ClipboardList },
  ];

  return (
    <MainLayout title="Institution Dashboard">
      <AnimatePresence>
        {showCreateTest && <CreateTestModal onClose={() => setShowCreateTest(false)} />}
      </AnimatePresence>

      <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4 lg:px-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-accent" />
              <span className="text-xs font-black uppercase tracking-widest text-accent">B2B Institution</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-accent/10 text-accent border-accent/20">
                {ORG.plan.toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">{ORG.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {ORG.city} &bull; {ORG.totalStudents} students &bull; {ORG.activeBatches} active batches
            </p>
          </div>
          <Button
            id="create-test-btn"
            onClick={() => setShowCreateTest(true)}
            className="h-11 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/20 px-6 flex items-center gap-2"
          >
            <Plus size={16} /> Create Test
          </Button>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-secondary/30 p-1 rounded-2xl w-fit border border-border">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Students"   value={ORG.totalStudents} sub="Across all batches"           icon={Users}        color="blue" />
              <StatCard label="Active Batches"   value={ORG.activeBatches} sub="3 mentors assigned"          icon={Layers}       color="emerald" />
              <StatCard label="Tests Created"    value={TESTS.length}      sub="2 scheduled this week"       icon={ClipboardList} color="amber" />
              <StatCard label="Avg. Accuracy"    value="62.7%"             sub="+3.2% vs last week"          icon={Target}        color="purple" />
            </div>

            {/* Topic accuracy chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" /> Topic-Wise Accuracy — All Batches
                </h2>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TOPIC_ACCURACY} layout="vertical" barSize={14} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        dataKey="topic"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                        width={90}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        content={({ active, payload }) => {
                          if (active && payload?.length) return (
                            <div className="bg-popover border border-border p-2.5 rounded-xl shadow-xl text-xs font-bold text-foreground">
                              {payload[0].payload.topic}: {payload[0].value}%
                            </div>
                          );
                          return null;
                        }}
                      />
                      <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                        {TOPIC_ACCURACY.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {TOPIC_ACCURACY.map(t => (
                    <div key={t.topic} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                      <span className="text-[10px] text-muted-foreground font-medium">{t.topic}</span>
                      <span className="text-[10px] font-bold text-foreground ml-auto">{t.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch health summary */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" /> Batch Health
                </h2>
                <div className="space-y-3">
                  {BATCHES.map(b => (
                    <div key={b.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{b.name}</p>
                        <p className="text-[10px] text-muted-foreground">{b.students} students</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${b.avgAccuracy}%`,
                              background: b.avgAccuracy >= 65 ? '#10b981' : b.avgAccuracy >= 50 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground w-9 text-right">{b.avgAccuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">At-Risk Students</p>
                  {STUDENTS.filter(s => s.status === 'critical' || s.status === 'at-risk').map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full', s.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-500')} />
                        <span className="text-xs font-medium text-foreground">{s.name}</span>
                      </div>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full border',
                        s.status === 'critical' ? STATUS_STYLES.critical : STATUS_STYLES['at-risk']
                      )}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-500" /> Batch Performance Clusters
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Distribution of student accuracy</p>
                </div>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-red-500/50" /> At-Risk</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-amber-500/50" /> Average</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500/50" /> Top Performers</div>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BATCH_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="20%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="90%" stopColor="#10b981" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                         if (active && payload?.length) return (
                           <div className="bg-popover border border-border p-2.5 rounded-xl text-xs font-bold text-foreground shadow-xl">
                             {payload[0].value} Students in {payload[0].payload.range}
                           </div>
                         );
                         return null;
                      }}
                    />
                    <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights & Performance Distribution Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Insight Engine */}
              <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10" />
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" /> Auto Insight Engine
                </h2>
                <div className="space-y-3 relative z-10">
                  {(() => {
                    const mappedStudents: StudentInsightData[] = STUDENTS.map(s => ({
                      id: s.id, name: s.name, accuracy: s.accuracy, reflection: 50, // mock
                      confidenceMismatches: s.status === 'critical' ? 25 : 5, 
                      weakSubtopics: [s.topGap],
                      mistakeBreakdown: { conceptual: s.status === 'critical' ? 55 : 20, calculation: 20, silly: 20, guessed: 5 },
                      totalAttempts: s.attempts
                    }));
                    const insights = generateBatchInsights(mappedStudents);

                    return insights.map((insight, idx) => (
                      <div key={idx} className={cn("p-3 rounded-2xl border text-xs", 
                        insight.type === 'critical' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                        insight.type === 'alert' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                        insight.type === 'positive' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                        "bg-secondary border-border text-foreground"
                      )}>
                        {insight.type === 'critical' && <AlertCircle className="w-4 h-4 mb-1.5 inline-block mr-1" />}
                        {insight.type === 'alert' && <AlertTriangle className="w-4 h-4 mb-1.5 inline-block mr-1" />}
                        <span className="font-medium leading-relaxed">{insight.text}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
                 <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                   <Award className="w-4 h-4 text-amber-500" /> Leaderboard — Top Performers
                 </h2>
                 <div className="space-y-2">
                   {STUDENTS.sort((a,b) => b.accuracy - a.accuracy).slice(0, 4).map((s, idx) => (
                     <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs", 
                           idx === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]" :
                           idx === 1 ? "bg-slate-300/20 text-slate-400 border border-slate-300/30" :
                           idx === 2 ? "bg-amber-700/20 text-amber-600 border border-amber-700/30" :
                           "bg-secondary text-muted-foreground"
                         )}>
                           #{idx + 1}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-foreground">{s.name}</p>
                           <p className="text-[10px] text-muted-foreground">{s.batch}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-black text-foreground">{s.accuracy}%</p>
                         <p className="text-[10px] text-muted-foreground">{s.attempts} attempts</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ BATCHES TAB ══ */}
        {activeTab === 'batches' && (
          <motion.div
            key="batches"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {BATCHES.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-accent/30 transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border',
                        b.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      )}>
                        {b.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{b.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-foreground">{b.avgAccuracy}%</p>
                    <p className="text-[10px] text-muted-foreground">avg accuracy</p>
                  </div>
                </div>

                <div className="h-1.5 bg-border rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${b.avgAccuracy}%`,
                      background: b.avgAccuracy >= 65 ? '#10b981' : b.avgAccuracy >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Users size={12} />{b.students} students</div>
                  <div className="flex items-center gap-1"><GraduationCap size={12} />{b.mentor}</div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 rounded-xl hover:bg-accent hover:text-white transition-all font-semibold"
                >
                  View Batch Analytics <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            ))}

            {/* Add new batch */}
            <button 
              onClick={() => setShowCreateBatch(true)}
              className="bg-card/50 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-accent/40 hover:bg-accent/5 transition-all group cursor-pointer min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Create New Batch</p>
            </button>
          </motion.div>
        )}

        {/* ── CREATE BATCH MODAL ── */}
        <AnimatePresence>
          {showCreateBatch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateBatch(false)} />
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative z-10 bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
                 <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2"><Layers className="w-5 h-5 text-accent" /> New Batch</h2>
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Batch Name</label>
                   <input value={batchForm.name} onChange={e => setBatchForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. JEE 2026 Alpha" className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Subject Focus</label>
                   <input value={batchForm.subject} onChange={e => setBatchForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. PCM" className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
                 </div>
                 <Button onClick={handleCreateBatch} disabled={creatingBatch || !batchForm.name} className="w-full h-11 bg-accent text-white font-bold rounded-xl shadow-lg mt-4">
                   {creatingBatch ? 'Creating...' : 'Create Batch'}
                 </Button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══ STUDENTS TAB ══ */}
        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="student-search"
                  type="text"
                  placeholder="Search student..."
                  value={searchStudents}
                  onChange={e => setSearchStudents(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <select
                id="batch-filter"
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="all">All Batches</option>
                {BATCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/20 text-muted-foreground text-[10px] uppercase font-bold tracking-widest border-b border-border">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Batch</th>
                      <th className="px-6 py-4">Attempts</th>
                      <th className="px-6 py-4">Accuracy</th>
                      <th className="px-6 py-4">Top Gap</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="hover:bg-accent/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-bold text-foreground">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">{s.batch}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{s.attempts}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{s.accuracy}%</span>
                            <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${s.accuracy}%`, background: s.accuracy >= 65 ? '#10b981' : s.accuracy >= 50 ? '#f59e0b' : '#ef4444' }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">{s.topGap}</td>
                        <td className="px-6 py-4">
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border', STATUS_STYLES[s.status])}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="rounded-lg h-8 px-3 hover:bg-accent hover:text-white transition-all text-xs">
                            Report <ChevronRight size={12} className="ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ TESTS TAB ══ */}
        {activeTab === 'tests' && (
          <motion.div
            key="tests"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-foreground">All Tests</h2>
              <Button
                onClick={() => setShowCreateTest(true)}
                size="sm"
                className="h-9 rounded-xl bg-accent text-white font-bold flex items-center gap-2 px-4"
              >
                <Plus size={14} /> New Test
              </Button>
            </div>

            <div className="space-y-3">
              {TESTS.map(t => (
                <div key={t.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-sm hover:border-border/80 transition-colors">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    t.mode === 'ai_generated' ? 'bg-accent/10 text-accent' : 'bg-blue-500/10 text-blue-400'
                  )}>
                    {t.mode === 'ai_generated' ? <Brain size={20} /> : <SlidersHorizontal size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-sm">{t.title}</h3>
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border', TEST_STATUS_STYLES[t.status])}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users size={10} />{t.batch}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen size={10} />{t.questions} questions</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />{t.scheduled}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {t.status === 'draft' && (
                      <Button size="sm" className="h-8 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                        <Play size={11} /> Publish
                      </Button>
                    )}
                    {t.status === 'completed' && (
                      <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">
                        View Results <ArrowUpRight size={11} className="ml-1" />
                      </Button>
                    )}
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </MainLayout>
  );
};

export default InstitutionDashboardPage;
