import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Target, TrendingUp, AlertTriangle, Zap, BrainCircuit,
  Fingerprint, BarChart3, ChevronRight, GraduationCap, Search,
  ArrowUpRight, ArrowDownRight, Activity, X, BookOpen, Clock,
  Lightbulb, AlertCircle, CheckCircle2, Send, SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StudentHeatmap } from '@/components/dashboard/StudentHeatmap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line,
} from 'recharts';
import { useTargetedPractice } from '@/hooks/useTargetedPractice';
import { StudentProgressView } from '@/components/student/StudentProgressView';
import { ShieldCheck } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */
const BATCH_STATS = {
  name: 'JEE 2026 — Newton Advanced',
  studentCount: 32,
  avgAccuracy: 64,
  reflectionRate: 82,
  perceptionGap: 18,
  totalQuestions: 1240,
};

// Mock diagnostic integrity scores per student
const MOCK_INTEGRITY: Record<string, { score: number; tabSwitches: number; fullscreenExits: number; copyAttempts: number; cameraInactive: number }> = {
  '1': { score: 98, tabSwitches: 0, fullscreenExits: 0, copyAttempts: 0, cameraInactive: 10 },
  '2': { score: 72, tabSwitches: 3, fullscreenExits: 2, copyAttempts: 1, cameraInactive: 60 },
  '3': { score: 88, tabSwitches: 1, fullscreenExits: 1, copyAttempts: 0, cameraInactive: 20 },
  '4': { score: 95, tabSwitches: 0, fullscreenExits: 1, copyAttempts: 0, cameraInactive: 0 },
  '5': { score: 41, tabSwitches: 8, fullscreenExits: 4, copyAttempts: 6, cameraInactive: 120 },
};

const MOCK_STUDENTS = [
  {
    id: '1', name: 'Arjun Singh', accuracy: 78, reflection: 95, status: 'stable' as const, topGap: 'None', attempts: 320,
    weakSubtopics: [], confidenceMismatches: 2,
    mistakeBreakdown: { conceptual: 15, calculation: 22, silly: 10, guessed: 3 },
    progressOverTime: [60, 65, 70, 73, 76, 78],
    subtopicAccuracy: [
      { name: 'Friction', accuracy: 85 }, { name: 'Rotation', accuracy: 79 }, { name: 'SHM', accuracy: 74 }, { name: 'Optics', accuracy: 80 },
    ],
  },
  {
    id: '2', name: 'Priya Sharma', accuracy: 42, reflection: 40, status: 'at-risk' as const, topGap: 'SHM Concepts', attempts: 180,
    weakSubtopics: ['SHM', 'Thermodynamics', 'Electrostatics'],
    confidenceMismatches: 23,
    mistakeBreakdown: { conceptual: 55, calculation: 20, silly: 15, guessed: 10 },
    progressOverTime: [48, 44, 45, 42, 40, 42],
    subtopicAccuracy: [
      { name: 'Friction', accuracy: 58 }, { name: 'Rotation', accuracy: 45 }, { name: 'SHM', accuracy: 28 }, { name: 'Thermodynamics', accuracy: 31 },
    ],
  },
  {
    id: '3', name: 'Rohit Kumar', accuracy: 65, reflection: 88, status: 'improving' as const, topGap: 'Calculation Errors', attempts: 260,
    weakSubtopics: ['Optics', 'Waves'],
    confidenceMismatches: 8,
    mistakeBreakdown: { conceptual: 20, calculation: 55, silly: 18, guessed: 7 },
    progressOverTime: [50, 55, 58, 60, 63, 65],
    subtopicAccuracy: [
      { name: 'Friction', accuracy: 75 }, { name: 'Optics', accuracy: 51 }, { name: 'SHM', accuracy: 68 }, { name: 'Waves', accuracy: 49 },
    ],
  },
  {
    id: '4', name: 'Sneha Reddy', accuracy: 54, reflection: 72, status: 'stable' as const, topGap: 'Rotation', attempts: 140,
    weakSubtopics: ['Rotation'],
    confidenceMismatches: 7,
    mistakeBreakdown: { conceptual: 35, calculation: 30, silly: 25, guessed: 10 },
    progressOverTime: [50, 51, 53, 52, 54, 54],
    subtopicAccuracy: [
      { name: 'Friction', accuracy: 68 }, { name: 'Rotation', accuracy: 38 }, { name: 'SHM', accuracy: 60 }, { name: 'Optics', accuracy: 72 },
    ],
  },
  {
    id: '5', name: 'Anish Gupta', accuracy: 31, reflection: 25, status: 'critical' as const, topGap: 'Multiple Topics', attempts: 85,
    weakSubtopics: ['SHM', 'Rotation', 'Thermodynamics', 'Optics'],
    confidenceMismatches: 41,
    mistakeBreakdown: { conceptual: 60, calculation: 22, silly: 12, guessed: 6 },
    progressOverTime: [40, 37, 35, 32, 30, 31],
    subtopicAccuracy: [
      { name: 'Friction', accuracy: 40 }, { name: 'Rotation', accuracy: 25 }, { name: 'SHM', accuracy: 22 }, { name: 'Thermodynamics', accuracy: 28 },
    ],
  },
];

type Student = typeof MOCK_STUDENTS[0];

const PERCEPTION_DATA = [
  { subject: 'Mechanics',    actual: 45, perceived: 70 },
  { subject: 'Electro',     actual: 65, perceived: 80 },
  { subject: 'Optics',      actual: 75, perceived: 75 },
  { subject: 'Thermal',     actual: 30, perceived: 60 },
  { subject: 'Modern',      actual: 80, perceived: 85 },
];

const MISTAKE_DISTRIBUTION = [
  { name: 'Conceptual', value: 45, color: '#ef4444' },
  { name: 'Calculation', value: 25, color: '#f59e0b' },
  { name: 'Silly',       value: 20, color: '#3b82f6' },
  { name: 'Guessed',     value: 10, color: '#8b5cf6' },
];

const STATUS_STYLES = {
  stable:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  improving: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'at-risk': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical:  'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.25)]',
};

/* ─────────────────────────────────────────────────────────────
   ASSIGN PRACTICE MODAL
───────────────────────────────────────────────────────────── */
interface AssignPracticeModalProps {
  student: Student;
  onClose: () => void;
}

function AssignPracticeModal({ student, onClose }: AssignPracticeModalProps) {
  const [subtopic, setSubtopic] = useState(student.weakSubtopics[0] || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState(10);
  const [done, setDone] = useState(false);
  const { assignPractice, isAssigning } = useTargetedPractice();

  const handleAssign = async () => {
    if (!subtopic.trim()) return;
    
    // Extracted primary topic assuming it's linked, else generic default
    const topic = 'Assigned Area'; 
    const reason = student.confidenceMismatches > 10 ? 'Conceptual gap detected with high confidence' : undefined;

    const success = await assignPractice({
      studentId: student.id,
      topic,
      subtopic,
      difficulty,
      count,
      reason
    });

    if (success) {
      setDone(true);
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
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
        className="relative z-10 bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" /> Assign Targeted Practice
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">For {student.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {!done ? (
            <div className="space-y-4">
              {/* Auto-suggested pills from weakSubtopics */}
              {student.weakSubtopics.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">AI-suggested weak areas</p>
                  <div className="flex flex-wrap gap-2">
                    {student.weakSubtopics.map(ws => (
                      <button
                        key={ws}
                        onClick={() => setSubtopic(ws)}
                        className={cn(
                          'text-xs font-bold px-3 py-1.5 rounded-xl border transition-all',
                          subtopic === ws
                            ? 'bg-accent text-white border-accent shadow-sm shadow-accent/20'
                            : 'bg-secondary/50 text-muted-foreground border-border hover:border-accent/40 hover:text-foreground'
                        )}
                      >
                        {ws}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Subtopic</label>
                <input
                  id="assign-subtopic"
                  value={subtopic}
                  onChange={e => setSubtopic(e.target.value)}
                  placeholder="e.g. Friction, SHM…"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Difficulty</label>
                  <div className="flex gap-1.5">
                    {(['easy', 'medium', 'hard'] as const).map(d => (
                      <button
                        key={d}
                        id={`difficulty-${d}`}
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize',
                          difficulty === d
                            ? d === 'easy' ? 'bg-emerald-500 text-white border-emerald-500'
                              : d === 'medium' ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-red-500 text-white border-red-500'
                            : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground'
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Questions</label>
                  <input
                    id="assign-count"
                    type="number"
                    min={5} max={30}
                    value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>

              {/* Confidence mismatch warning */}
              {student.confidenceMismatches > 10 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">{student.confidenceMismatches}</span> confidence mismatches detected — student answered with high confidence but got wrong. This indicates a <span className="font-bold">conceptual gap</span>, not carelessness.
                  </p>
                </div>
              )}

              <Button
                id="assign-btn"
                onClick={handleAssign}
                disabled={isAssigning || !subtopic.trim()}
                className="w-full h-11 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/20"
              >
                <Send size={14} className="mr-2" /> 
                {isAssigning ? 'Assigning...' : `Assign ${count} Questions`}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-3xl">
                ✓
              </div>
              <h3 className="text-lg font-bold text-foreground">Practice Assigned!</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                {student.name} will see {count} <strong>{difficulty}</strong> questions on <strong>{subtopic}</strong> next time they open the practice section.
              </p>
              <Button onClick={onClose} className="mt-1 rounded-xl bg-accent text-white px-8">Done</Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STUDENT DEEP-DIVE DRAWER
───────────────────────────────────────────────────────────── */
function StudentDeepDive({ student, onClose }: { student: Student; onClose: () => void }) {
  const [showAssign, setShowAssign] = useState(false);

  const progressData = student.progressOverTime.map((v, i) => ({
    day: `D${i + 1}`, accuracy: v,
  }));

  const mistakeData = [
    { name: 'Conceptual', value: student.mistakeBreakdown.conceptual, color: '#ef4444' },
    { name: 'Calculation', value: student.mistakeBreakdown.calculation, color: '#f59e0b' },
    { name: 'Silly', value: student.mistakeBreakdown.silly, color: '#3b82f6' },
    { name: 'Guessed', value: student.mistakeBreakdown.guessed, color: '#8b5cf6' },
  ];

  const hasConceptualGap = student.confidenceMismatches > 10;

  return (
    <>
      <AnimatePresence>
        {showAssign && <AssignPracticeModal student={student} onClose={() => setShowAssign(false)} />}
      </AnimatePresence>

      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        onClick={onClose}
      />

      <motion.aside
        key="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.45 }}
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl z-40 overflow-y-auto"
      >
        {/* Drawer header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 text-accent text-sm font-bold flex items-center justify-center">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg leading-none">{student.name}</h2>
              <span className={cn('text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border', STATUS_STYLES[student.status])}>
                {student.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="open-assign"
              onClick={() => setShowAssign(true)}
              size="sm"
              className="rounded-xl bg-accent text-white h-9 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Target size={13} /> Assign Practice
            </Button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── INTEGRITY SCORE (AI Proctoring) ── */}
          {MOCK_INTEGRITY[student.id] && (() => {
            const integ = MOCK_INTEGRITY[student.id];
            const scoreColor = integ.score >= 80 ? 'text-emerald-400' : integ.score >= 60 ? 'text-amber-400' : 'text-red-400';
            const scoreBg = integ.score >= 80 ? 'bg-emerald-500/5 border-emerald-500/20' : integ.score >= 60 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20';
            return (
              <div className={`rounded-2xl border p-4 ${scoreBg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${scoreColor}`} />
                    <span className="text-sm font-bold text-foreground">Diagnostic Integrity Score</span>
                  </div>
                  <span className={`text-2xl font-black ${scoreColor}`}>{integ.score}%</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Tab Switches', value: integ.tabSwitches, icon: '🔀', bad: integ.tabSwitches > 2 },
                    { label: 'Fullscreen Exit', value: integ.fullscreenExits, icon: '⛶', bad: integ.fullscreenExits > 1 },
                    { label: 'Copy Attempts', value: integ.copyAttempts, icon: '📋', bad: integ.copyAttempts > 0 },
                    { label: 'Cam Inactive', value: `${integ.cameraInactive}s`, icon: '📷', bad: integ.cameraInactive > 30 },
                  ].map(v => (
                    <div key={v.label} className={`rounded-xl p-2 text-center ${v.bad ? 'bg-red-500/10' : 'bg-secondary/30'}`}>
                      <p className="text-base">{v.icon}</p>
                      <p className={`text-sm font-black ${v.bad ? 'text-red-400' : 'text-foreground'}`}>{v.value}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{v.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── CRITICAL ALERT: Conceptual Gap ── */}
          {hasConceptualGap && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-400 text-sm">⚠️ Conceptual Gap Detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {student.name} answered <span className="text-red-400 font-bold">{student.confidenceMismatches} questions</span> with{' '}
                  <strong>high confidence</strong> but got them <strong>wrong</strong>. This is not carelessness — they genuinely have a flawed mental model.
                </p>
                {student.weakSubtopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {student.weakSubtopics.map(ws => (
                      <span key={ws} className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">{ws}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── QUICK STATS ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Accuracy', value: `${student.accuracy}%`, color: student.accuracy >= 65 ? 'emerald' : student.accuracy >= 50 ? 'amber' : 'red' },
              { label: 'Attempts', value: student.attempts, color: 'blue' },
              { label: 'Conf. Mismatches', value: student.confidenceMismatches, color: hasConceptualGap ? 'red' : 'muted' },
            ].map(s => (
              <div key={s.label} className="bg-secondary/30 rounded-2xl p-3 text-center border border-border">
                <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{s.label}</p>
                <p className={cn('text-2xl font-display font-bold mt-1', `text-${s.color}-400`)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── PROGRESS TREND ── */}
          <div className="bg-secondary/20 rounded-2xl p-5 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Accuracy Trend (Last 6 Sessions)
            </h3>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-popover border border-border p-2 rounded-xl text-xs font-bold">
                        {payload[0].value}%
                      </div>
                    ) : null}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── SUBTOPIC ACCURACY BARS ── */}
          <div className="bg-secondary/20 rounded-2xl p-5 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Topic Mastery Heatmap
            </h3>
            
            <StudentHeatmap 
               data={[{
                 name: 'Current Syllabus',
                 subtopics: student.subtopicAccuracy.map(st => ({
                   name: st.name,
                   accuracy: st.accuracy,
                   attempts: Math.floor(student.attempts / student.subtopicAccuracy.length)
                 }))
               }]}
               className="!p-0 !border-0 bg-transparent shadow-none"
            />
          </div>

          {/* ── MISTAKE ATTRIBUTION ── */}
          <div className="bg-secondary/20 rounded-2xl p-5 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Mistake Pattern
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {mistakeData.map(m => (
                <div key={m.name} className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-card/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    <span className="text-xs font-semibold text-muted-foreground">{m.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{m.value}%</span>
                </div>
              ))}
            </div>
            {student.mistakeBreakdown.conceptual > 40 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                <Lightbulb size={13} />
                <span><strong>{student.mistakeBreakdown.conceptual}%</strong> conceptual mistakes — fundamentals need reinforcement, not just more practice.</span>
              </div>
            )}
          </div>

        </div>
      </motion.aside>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const MentorDashboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() =>
    MOCK_STUDENTS.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  return (
    <MainLayout title="Mentor Dashboard">
      <AnimatePresence>
        {selectedStudent && (
          <StudentDeepDive
            key={selectedStudent.id}
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 lg:px-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold uppercase tracking-widest text-accent">Institutional Analytics</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">{BATCH_STATS.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              High-precision behavioral monitoring. Identify conceptual gaps <em>before</em> scores drop.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-border bg-card shadow-sm h-11 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filter Batch
            </Button>
            <Button className="rounded-xl bg-accent text-white shadow-lg shadow-accent/20 h-11 flex items-center gap-2 px-6">
              Download Report <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── BATCH PULSE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Target, color: 'blue', label: 'Batch Accuracy', value: '64.2%',
              sub: 'JEE Advanced Target: 55%', badge: '+4.2%', up: true,
            },
            {
              icon: Fingerprint, color: 'emerald', label: 'Reflection Rate', value: '82.1%',
              sub: 'Measure of Self-Awareness', badge: '+12%', up: true,
            },
            {
              icon: BrainCircuit, color: 'orange', label: 'Perception Gap', value: '18.4%',
              sub: 'Silly Mistake Persistence', badge: '↑8%', up: false,
            },
            {
              icon: Activity, color: 'purple', label: 'Stamina Avg', value: '74m',
              sub: 'Time before accuracy drop', badge: 'Healthy', up: true,
            },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-border/80 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${card.color}-500/10 text-${card.color}-500`)}>
                    <Icon size={20} />
                  </div>
                  <div className={cn('flex items-center text-xs font-bold gap-1 px-1.5 py-0.5 rounded',
                    card.up ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                  )}>
                    {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {card.badge}
                  </div>
                </div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest mb-1">{card.label}</p>
                <h3 className="text-3xl font-display font-bold text-foreground">{card.value}</h3>
                <p className="text-[10px] text-muted-foreground mt-2">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── ANALYTICS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Perception vs Reality */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" /> Perception vs. Reality Matrix
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Batch confidence against AI-detected conceptual gaps</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5 text-accent"><div className="w-2 h-2 rounded-full bg-accent" /> Perceived</div>
                <div className="flex items-center gap-1.5 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-400" /> Actual</div>
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PERCEPTION_DATA} layout="vertical" barSize={10} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    dataKey="subject" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload?.length) return (
                        <div className="bg-popover border border-border p-3 rounded-xl shadow-xl">
                          <p className="text-xs font-bold text-foreground mb-2">{payload[0].payload.subject}</p>
                          <p className="text-[10px] flex justify-between gap-4">
                            <span className="text-muted-foreground">Perceived:</span>
                            <span className="text-accent font-bold">{payload[1]?.value}%</span>
                          </p>
                          <p className="text-[10px] flex justify-between gap-4">
                            <span className="text-muted-foreground">Actual:</span>
                            <span className="text-blue-400 font-bold">{payload[0]?.value}%</span>
                          </p>
                          <p className="text-orange-400 text-[9px] font-bold border-t border-border mt-1.5 pt-1.5">
                            ⚠️ {(Number(payload[1]?.value) - Number(payload[0]?.value)).toFixed(0)}% gap
                          </p>
                        </div>
                      );
                      return null;
                    }}
                  />
                  <Bar dataKey="actual" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="perceived" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mistake composition */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Mistake Attribution
            </h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MISTAKE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                    {MISTAKE_DISTRIBUTION.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-popover border border-border px-3 py-1.5 rounded-lg text-[10px] font-bold text-foreground">
                        {payload[0].name}: {payload[0].value}%
                      </div>
                    ) : null}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MISTAKE_DISTRIBUTION.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STUDENT LIST & RISK SCANNER ── */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" /> Batch Members
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="mentor-student-search"
                type="text"
                placeholder="Search student..."
                className="bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/20 text-muted-foreground text-[10px] uppercase font-bold tracking-widest border-b border-border">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Reflection</th>
                  <th className="px-6 py-4">Conf. Mismatches</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Top Gap</th>
                  <th className="px-6 py-4 text-right">Deep Dive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-accent/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-sm text-foreground">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{student.accuracy}%</span>
                        <div className="w-14 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${student.accuracy}%`, background: student.accuracy >= 65 ? '#10b981' : student.accuracy >= 50 ? '#f59e0b' : '#ef4444' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-xs font-bold',
                        student.reflection > 70 ? 'text-emerald-400' : student.reflection > 50 ? 'text-amber-400' : 'text-red-400'
                      )}>{student.reflection}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-xs font-bold',
                        student.confidenceMismatches > 15 ? 'text-red-400' : student.confidenceMismatches > 5 ? 'text-amber-400' : 'text-emerald-400'
                      )}>{student.confidenceMismatches}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border', STATUS_STYLES[student.status])}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">{student.topGap}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-8 px-3 hover:bg-accent hover:text-white transition-all"
                        onClick={e => { e.stopPropagation(); setSelectedStudent(student); }}
                      >
                        <Eye size={13} className="mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-secondary/10 border-t border-border flex justify-center">
            <button className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors flex items-center gap-2">
              View All {BATCH_STATS.studentCount} Students <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default MentorDashboardPage;
