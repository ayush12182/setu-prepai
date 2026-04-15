import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, StopCircle, RotateCcw, Database, ChevronDown, CheckCircle2,
  AlertTriangle, Loader2, BarChart3, Zap, BookOpen, FlaskConical, Calculator,
  Leaf, Globe, DollarSign, Briefcase, Languages, BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── Config ───────────────────────────────────────────────────
const EXAM_CONFIG: Record<string, {
  subjects: string[];
  targets: Record<string, number>;
  icon: React.ElementType;
  color: string;
  yearRange: [number, number];
}> = {
  JEE_MAINS: {
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    targets: { Physics: 1500, Chemistry: 1500, Mathematics: 1500 },
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    yearRange: [2002, 2024],
  },
  JEE_ADVANCED: {
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    targets: { Physics: 500, Chemistry: 500, Mathematics: 500 },
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    yearRange: [2013, 2024],
  },
  NEET: {
    subjects: ['Physics', 'Chemistry', 'Biology'],
    targets: { Physics: 1000, Chemistry: 1000, Biology: 1500 },
    icon: FlaskConical,
    color: 'from-green-500 to-emerald-500',
    yearRange: [2013, 2024],
  },
  CUET: {
    subjects: ['English', 'General Test', 'Accounts', 'Economics', 'Business Studies'],
    targets: { English: 500, 'General Test': 500, Accounts: 300, Economics: 300, 'Business Studies': 200 },
    icon: BookOpen,
    color: 'from-violet-500 to-purple-500',
    yearRange: [2022, 2024],
  },
};

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard', 'Mixed'];

interface Job {
  id: string;
  exam: string;
  subject: string;
  status: string;
  questions_generated: number;
  target_count: number;
  started_at: string | null;
  completed_at: string | null;
  job_log: any[];
  created_at: string;
}

interface LogEntry {
  topic: string;
  batch: number;
  status: 'success' | 'error' | 'parse_error' | 'insert_error';
  generated: number;
  error?: string;
}

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Physics: Zap,
  Chemistry: FlaskConical,
  Mathematics: Calculator,
  Biology: Leaf,
  English: Languages,
  'General Test': BrainCircuit,
  Accounts: DollarSign,
  Economics: BarChart3,
  'Business Studies': Briefcase,
};

export default function BulkPYQGenerator() {
  const [exam, setExam] = useState('JEE_MAINS');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState('Mixed');
  const [batchSize, setBatchSize] = useState(20);
  const [totalTarget, setTotalTarget] = useState(100);
  const [yearStart, setYearStart] = useState(2015);
  const [yearEnd, setYearEnd] = useState(2024);

  const [running, setRunning] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [totalInDB, setTotalInDB] = useState<number | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const examConfig = EXAM_CONFIG[exam];

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
    fetchTotalCount();
  }, []);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logEntries]);

  // Update subject when exam changes
  useEffect(() => {
    const subs = EXAM_CONFIG[exam]?.subjects || [];
    setSubject(subs[0] || 'Physics');
    const yr = EXAM_CONFIG[exam]?.yearRange || [2015, 2024];
    setYearStart(yr[0]);
    setYearEnd(yr[1]);
    setTotalTarget(Object.values(EXAM_CONFIG[exam]?.targets || {})[0] || 100);
  }, [exam]);

  const fetchTotalCount = async () => {
    const { count } = await (supabase as any)
      .from('questions_bank')
      .select('*', { count: 'exact', head: true });
    setTotalInDB(count ?? 0);
  };

  const fetchJobs = async () => {
    const { data } = await (supabase as any)
      .from('bulk_generation_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setJobs(data);
  };

  const pollJob = async (jobId: string) => {
    const { data } = await (supabase as any)
      .from('bulk_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (data) {
      setCurrentJob(data);
      setLogEntries(data.job_log || []);

      if (['completed', 'failed', 'cancelled'].includes(data.status)) {
        if (pollRef.current) clearInterval(pollRef.current);
        setRunning(false);
        fetchJobs();
        fetchTotalCount();
        toast.success(`Job ${data.status}! Generated ${data.questions_generated} questions.`);
      }
    }
  };

  const handleStart = async () => {
    if (running) return;
    setRunning(true);
    setLogEntries([]);
    setCurrentJob(null);

    try {
      // Create job record
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newJob, error: jobErr } = await (supabase as any)
        .from('bulk_generation_jobs')
        .insert({
          exam,
          subject,
          chapter: chapter || null,
          difficulty,
          year_start: yearStart,
          year_end: yearEnd,
          target_count: totalTarget,
          status: 'pending',
          created_by: user?.id,
        })
        .select()
        .single();

      if (jobErr || !newJob) throw new Error(jobErr?.message || 'Failed to create job');

      setCurrentJob(newJob);

      // Start polling
      pollRef.current = setInterval(() => pollJob(newJob.id), 2500);

      // Invoke edge function (fire & forget — it'll update the DB)
      supabase.functions.invoke('bulk-generate-pyqs', {
        body: {
          job_id: newJob.id,
          exam,
          subject,
          chapter: chapter || undefined,
          difficulty,
          year_start: yearStart,
          year_end: yearEnd,
          batch_size: batchSize,
          total_target: totalTarget,
        },
      }).then(({ error }) => {
        if (error) {
          console.error('Edge function error:', error);
          supabase.from('bulk_generation_jobs' as any)
            .update({ status: 'failed', error_message: error.message })
            .eq('id', newJob.id);
        }
      });

      toast.success('Bulk generation started! Watching for progress...');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start generation');
      setRunning(false);
    }
  };

  const handleCancel = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (currentJob) {
      await (supabase as any)
        .from('bulk_generation_jobs')
        .update({ status: 'cancelled', completed_at: new Date().toISOString() })
        .eq('id', currentJob.id);
    }
    setRunning(false);
    fetchJobs();
    toast.info('Job cancelled.');
  };

  const progress = currentJob
    ? Math.min(100, Math.round((currentJob.questions_generated / (currentJob.target_count || 1)) * 100))
    : 0;

  const ExamIcon = examConfig?.icon || BookOpen;

  const statusColor = (status: string) => {
    if (status === 'completed') return 'text-emerald-400 bg-emerald-500/10';
    if (status === 'running') return 'text-blue-400 bg-blue-500/10';
    if (status === 'failed') return 'text-red-400 bg-red-500/10';
    if (status === 'cancelled') return 'text-amber-400 bg-amber-500/10';
    return 'text-muted-foreground bg-secondary/50';
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight">
              🧠 Bulk PYQ Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Generate 10,000+ authentic exam questions powered by Claude AI
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl px-6 py-4 text-center">
            <p className="text-3xl font-bold text-accent">
              {totalInDB !== null ? totalInDB.toLocaleString() : '—'}
            </p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
              Questions in DB
            </p>
          </div>
        </div>

        {/* Target Distribution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(EXAM_CONFIG).map(([key, cfg]) => {
            const total = Object.values(cfg.targets).reduce((a, b) => a + b, 0);
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setExam(key)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  exam === key
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                    : 'border-border hover:border-accent/30 bg-card'
                }`}
              >
                <Icon size={20} className={exam === key ? 'text-accent' : 'text-muted-foreground'} />
                <p className="font-bold mt-2 text-sm">{key.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">{total.toLocaleString()} target Qs</p>
              </button>
            );
          })}
        </div>

        {/* Config Form */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ExamIcon size={18} className="text-accent" /> Generation Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Subject */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                disabled={running}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              >
                {examConfig?.subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Chapter (optional) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Chapter <span className="text-muted-foreground/50 normal-case font-normal">(optional — blank = all)</span>
              </label>
              <input
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                disabled={running}
                placeholder="e.g. Electrostatics, Genetics..."
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                disabled={running}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              >
                {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Year Range */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Year Start</label>
              <input
                type="number"
                value={yearStart}
                min={1998}
                max={2024}
                onChange={e => setYearStart(Number(e.target.value))}
                disabled={running}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Year End</label>
              <input
                type="number"
                value={yearEnd}
                min={yearStart}
                max={2024}
                onChange={e => setYearEnd(Number(e.target.value))}
                disabled={running}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              />
            </div>

            {/* Batch Size */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Batch Size <span className="text-muted-foreground/50 font-normal normal-case">(per AI call)</span>
              </label>
              <select
                value={batchSize}
                onChange={e => setBatchSize(Number(e.target.value))}
                disabled={running}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              >
                {[10, 15, 20, 25].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>

            {/* Total Target */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Total Target for This Run
              </label>
              <div className="flex gap-2 flex-wrap">
                {[50, 100, 200, 500, 1000].map(n => (
                  <button
                    key={n}
                    disabled={running}
                    onClick={() => setTotalTarget(n)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      totalTarget === n
                        ? 'bg-accent text-black border-accent'
                        : 'border-border text-muted-foreground hover:border-accent/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <input
                  type="number"
                  value={totalTarget}
                  min={10}
                  max={2000}
                  disabled={running}
                  onChange={e => setTotalTarget(Number(e.target.value))}
                  className="w-28 bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex gap-3 pt-2">
            {!running ? (
              <Button
                onClick={handleStart}
                className="bg-accent text-black font-bold h-12 px-8 rounded-xl gap-2"
              >
                <Play size={16} /> Start Bulk Generation
              </Button>
            ) : (
              <Button
                onClick={handleCancel}
                variant="destructive"
                className="h-12 px-8 rounded-xl gap-2"
              >
                <StopCircle size={16} /> Cancel Job
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => { fetchJobs(); fetchTotalCount(); }}
              className="h-12 px-4 rounded-xl gap-2"
            >
              <RotateCcw size={14} /> Refresh
            </Button>
          </div>
        </div>

        {/* Progress Panel */}
        <AnimatePresence>
          {currentJob && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-card border border-border rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">
                    {currentJob.exam.replace('_', ' ')} · {currentJob.subject}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {currentJob.questions_generated} / {currentJob.target_count} questions generated
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusColor(currentJob.status)}`}>
                  {currentJob.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${examConfig?.color || 'from-accent to-amber-500'}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">{progress}%</p>

              {/* Log */}
              <div className="bg-black/30 rounded-2xl p-4 max-h-52 overflow-y-auto font-mono text-xs space-y-1">
                {logEntries.length === 0 ? (
                  <p className="text-muted-foreground">Waiting for first batch...</p>
                ) : logEntries.map((entry, i) => (
                  <div key={i} className={`flex items-center gap-2 ${entry.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.status === 'success'
                      ? <CheckCircle2 size={12} />
                      : <AlertTriangle size={12} />}
                    <span className="text-white/60">[batch {entry.batch}]</span>
                    <span>{entry.topic}</span>
                    <span>→ +{entry.generated} questions</span>
                    {entry.error && <span className="text-red-400/70">({entry.error.slice(0, 60)})</span>}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Target Distribution Table */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" /> Target Distribution (10,000+ Questions)
          </h2>
          <div className="space-y-2">
            {Object.entries(EXAM_CONFIG).map(([examKey, cfg]) => (
              <div key={examKey}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-3 mb-2">
                  {examKey.replace('_', ' ')}
                </p>
                {Object.entries(cfg.targets).map(([sub, target]) => {
                  const Icon = SUBJECT_ICONS[sub] || Globe;
                  return (
                    <div key={sub} className="flex items-center gap-3 py-1.5">
                      <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon size={12} className="text-accent" />
                      </div>
                      <span className="text-sm flex-1">{sub}</span>
                      <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${cfg.color}`}
                          style={{ width: `${(target / 1500) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground w-12 text-right">
                        {target.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Grand Total Target</span>
            <span className="text-2xl font-bold text-accent">
              {Object.values(EXAM_CONFIG).flatMap(c => Object.values(c.targets)).reduce((a, b) => a + b, 0).toLocaleString()}+
            </span>
          </div>
        </div>

        {/* Past Jobs */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Database size={16} className="text-accent" /> Recent Jobs
            </h2>
            <Button variant="ghost" size="sm" onClick={fetchJobs} className="text-muted-foreground">
              <RotateCcw size={12} className="mr-1" /> Refresh
            </Button>
          </div>
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No jobs yet. Start your first generation above!</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/20 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-5 py-3 text-left">Exam</th>
                  <th className="px-5 py-3 text-left">Subject</th>
                  <th className="px-5 py-3 text-left">Generated</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-accent/5">
                    <td className="px-5 py-3 font-bold">{job.exam.replace('_', ' ')}</td>
                    <td className="px-5 py-3 text-muted-foreground">{job.subject}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-accent">{job.questions_generated}</span>
                      <span className="text-muted-foreground"> / {job.target_count}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {job.started_at ? new Date(job.started_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
