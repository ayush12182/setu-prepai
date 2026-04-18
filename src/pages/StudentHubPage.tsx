import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, BarChart3, ChevronRight, Brain,
  Target, Zap, ShieldCheck, ClipboardList, ArrowRight,
  Play, Link, Eye, GraduationCap, Users, FileText,
  Sparkles, Plus, CheckCircle2, Clock, Circle, LogOut,
  Trophy, AlertCircle, BookMarked, FlameKindling, Flame,
  TrendingUp, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StudentProgressView } from '@/components/student/StudentProgressView';
import { toast } from 'sonner';
import { getSubjectsForExam } from '@/lib/streamSubjects';
import { joinTeacherByCode } from '@/lib/studentActivity';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────
type Tab = 'home' | 'practice' | 'progress';

interface TeacherContext {
  teacherName: string;
  batchName: string;
  examType: string;
  institutionName?: string;
  joinedAt?: string;
}

const DIFF_COLORS: Record<string, string> = {
  easy:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard:   'bg-red-500/10 text-red-400 border-red-500/20',
};

const TASK_STATUS_CONFIG = {
  pending:     { label: 'Not Started', color: 'text-muted-foreground',  bg: 'bg-muted/30',     Icon: Circle,       dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'text-amber-400',         bg: 'bg-amber-500/5',  Icon: Clock,        dot: 'bg-amber-400' },
  completed:   { label: 'Completed',   color: 'text-emerald-400',        bg: 'bg-emerald-500/5', Icon: CheckCircle2, dot: 'bg-emerald-400' },
};

// ─── Component ────────────────────────────────────────────────
const StudentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Primary teacher context (from DB)
  const [teacherCtx, setTeacherCtx] = useState<TeacherContext | null>(null);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);

  // Locked exam from teacher (falls back to profile)
  const [lockedExam, setLockedExam] = useState<string | null>(null);

  // Data
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [realTests, setRealTests] = useState<any[]>([]);
  const [practiceStats, setPracticeStats] = useState({ attempted: 0, accuracy: 0 });

  // UI
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  // Derive subjects FROM locked exam (teacher-controlled)
  const effectiveExam = lockedExam || profile?.target_exam || (user as any)?.user_metadata?.target_exam || null;
  const streamSubjects = getSubjectsForExam(effectiveExam);

  const PRACTICE_TOPICS = streamSubjects.flatMap(s =>
    s.chapters.slice(0, 2).map(ch => ({
      subject: s.label, topic: ch.title,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
      qCount: 15 + Math.floor(Math.random() * 25),
      color: s.color, emoji: s.emoji,
    }))
  );

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // ── 1. Fetch teacher links ──────────────────────────────
      const { data: links } = await (supabase.from as any)('student_teacher_links')
        .select('teacher_id, exam_type, subject, joined_at, is_active')
        .eq('student_id', user!.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      // ── 2. Fetch batch memberships (for batch name + exam) ──
      const { data: batchMemberships } = await (supabase.from as any)('batch_members')
        .select('batch_id, joined_at, batches(id, name, target_exam, subject, mentor_id, is_active)')
        .eq('student_id', user!.id);

      const myBatches = (batchMemberships || [])
        .map((bm: any) => bm.batches)
        .filter(Boolean);

      // ── 3. Resolve primary teacher + context ───────────────
      const teacherIds = [
        ...(links || []).map((l: any) => l.teacher_id),
        ...myBatches.map((b: any) => b.mentor_id).filter(Boolean),
      ].filter((v, i, a) => v && a.indexOf(v) === i); // unique

      let tProfiles: any[] = [];
      if (teacherIds.length > 0) {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('user_id, full_name, institution_name')
          .in('user_id', teacherIds);
        tProfiles = data || [];
      }
      const tMap: Record<string, any> = {};
      tProfiles.forEach((t: any) => { tMap[t.user_id] = t; });

      // Build teacher list combining links + batch routes
      const teacherList: any[] = [];
      if (links && links.length > 0) {
        links.forEach((l: any) => {
          // Find matching batch if any
          const matchBatch = myBatches.find((b: any) => b.mentor_id === l.teacher_id);
          teacherList.push({
            teacher_id: l.teacher_id,
            exam_type: l.exam_type || matchBatch?.target_exam,
            batch_name: matchBatch?.name || null,
            joined_at: l.joined_at,
            profile: tMap[l.teacher_id] || null,
          });
        });
      } else if (myBatches.length > 0) {
        // Joined via batch code but no teacher_link entry — use batch data
        myBatches.forEach((b: any) => {
          if (b.mentor_id) {
            teacherList.push({
              teacher_id: b.mentor_id,
              exam_type: b.target_exam || b.subject,
              batch_name: b.name,
              joined_at: null,
              profile: tMap[b.mentor_id] || null,
            });
          }
        });
      }

      setAllTeachers(teacherList);

      // Set primary teacher context
      if (teacherList.length > 0) {
        const primary = teacherList[0];
        const ctx: TeacherContext = {
          teacherName: primary.profile?.full_name || 'Your Teacher',
          batchName: primary.batch_name || 'Your Batch',
          examType: primary.exam_type || effectiveExam || 'General',
          institutionName: primary.profile?.institution_name || undefined,
          joinedAt: primary.joined_at,
        };
        setTeacherCtx(ctx);
        setLockedExam(ctx.examType); // 🔒 Lock exam to teacher's choice
      }

      // ── 4. Assigned tasks ───────────────────────────────────
      const { data: tasks } = await (supabase.from as any)('assigned_tasks')
        .select('*')
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setAssignedTasks(tasks || []);

      // ── 5. Live tests from teacher batches ──────────────────
      if (myBatches.length > 0) {
        const batchIds = myBatches.map((b: any) => b.id);
        const { data: tests } = await (supabase.from as any)('assessment_sessions')
          .select('*').in('batch_id', batchIds).eq('status', 'ACTIVE');
        setRealTests(tests || []);
      }

      // ── 6. Practice stats from session_participants ─────────
      try {
        const { data: sessions } = await (supabase.from as any)('session_participants')
          .select('live_accuracy, status')
          .eq('student_id', user!.id)
          .eq('status', 'SUBMITTED')
          .limit(50);
        if (sessions && sessions.length > 0) {
          const acc = Math.round(sessions.reduce((a: number, s: any) => a + (s.live_accuracy || 0), 0) / sessions.length);
          setPracticeStats({ attempted: sessions.length, accuracy: acc });
        }
      } catch { /* non-critical */ }

    } catch (err) {
      console.error('Error loading student hub:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode || joinCode.length < 6) { toast.error('Enter a 6-character code'); return; }
    setJoiningCode(true);
    const result = await joinTeacherByCode(joinCode.toUpperCase().trim());
    if (result.success) {
      toast.success(result.message);
      setJoinCode('');
      setShowJoinInput(false);
      await refreshProfile();
      loadAll();
    } else {
      toast.error(result.message);
    }
    setJoiningCode(false);
  };

  const TABS = [
    { id: 'home' as Tab,     label: 'Home',     icon: '🏠' },
    { id: 'practice' as Tab, label: 'Practice', icon: '✏️' },
    { id: 'progress' as Tab, label: 'Progress', icon: '📊' },
  ];

  const completedTasks = assignedTasks.filter(t => t.status === 'completed').length;
  const pendingTasks   = assignedTasks.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand + context */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground text-sm leading-tight truncate">
                {teacherCtx ? `${teacherCtx.teacherName}'s Classroom` : 'SETU Student Hub'}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {teacherCtx ? `${teacherCtx.examType} • ${teacherCtx.batchName}` : displayName}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-0">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════
              HOME TAB
          ═══════════════════════════════════════════════════ */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-2">

              {/* ── SECTION 1: Teacher Identity Banner ── */}
              {loading ? (
                <div className="h-20 rounded-2xl bg-secondary/30 animate-pulse" />
              ) : teacherCtx ? (
                <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/12 via-accent/6 to-transparent p-4">
                  {/* Subtle glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <div className="relative flex items-center gap-4">
                    {/* Avatar initial */}
                    <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/30 flex items-center justify-center shrink-0 w-[52px] h-[52px]">
                      <span className="font-black text-accent text-xl">
                        {teacherCtx.teacherName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Enrolled pill */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          ✓ Enrolled
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">{teacherCtx.examType}</span>
                      </div>
                      <p className="font-bold text-foreground text-base leading-tight">
                        {teacherCtx.teacherName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Batch: <span className="text-foreground/70 font-semibold">{teacherCtx.batchName}</span>
                        {teacherCtx.institutionName && ` • ${teacherCtx.institutionName}`}
                      </p>
                    </div>
                    {allTeachers.length > 1 && (
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] text-muted-foreground">+{allTeachers.length - 1} more</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // No teacher — CTA
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">Connect with your teacher</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Enter the 6-character code your teacher shared — their assignments, tests and notes will appear here instantly.
                      </p>
                      {showJoinInput ? (
                        <div className="flex gap-2">
                          <input
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            placeholder="e.g. A3WAVB" maxLength={8} autoFocus
                            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-accent/40 uppercase"
                          />
                          <Button onClick={handleJoinByCode} disabled={joiningCode || joinCode.length < 6}
                            className="bg-accent text-white px-4 rounded-xl font-bold">
                            {joiningCode ? '...' : 'Join'}
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setShowJoinInput(true)}
                          className="h-9 px-4 bg-accent text-white font-bold rounded-xl text-xs">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Enter Join Code
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECTION 2: Big CTA — Start Learning ── */}
              {teacherCtx && (
                <button
                  onClick={() => setActiveTab('practice')}
                  className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-amber-500 p-5 text-left group hover:shadow-2xl hover:shadow-accent/25 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
                        {effectiveExam} • {teacherCtx.batchName}
                      </p>
                      <p className="font-black text-white text-xl">
                        Continue Practice →
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {streamSubjects.length} subjects • AI adaptive
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      <Flame className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </button>
              )}

              {/* ── SECTION 3: Today's Tasks ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-accent" />
                    Today's Tasks
                    {pendingTasks > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                        {pendingTasks} pending
                      </span>
                    )}
                  </h2>
                  {teacherCtx && (
                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border">
                      by teacher
                    </span>
                  )}
                </div>

                {assignedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {assignedTasks.slice(0, 5).map((task: any) => {
                      const cfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.pending;
                      return (
                        <div key={task.id}
                          className={cn('rounded-2xl border p-4 flex items-center gap-3 transition-all hover:border-accent/30', cfg.bg,
                            task.status === 'completed' ? 'border-emerald-500/20' : task.status === 'in_progress' ? 'border-amber-500/20' : 'border-border'
                          )}>
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            task.status === 'completed' ? 'bg-emerald-500/15' : task.status === 'in_progress' ? 'bg-amber-500/15' : 'bg-muted/30')}>
                            <cfg.Icon className={cn('w-5 h-5', cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{task.topic}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {task.subtopic || 'Practice Set'}
                              {task.initial_accuracy != null ? ` • Baseline: ${task.initial_accuracy}%` : ''}
                            </p>
                          </div>
                          <Button size="sm"
                            onClick={() => navigate('/practice')}
                            disabled={task.status === 'completed'}
                            className={cn('h-9 px-3 rounded-xl text-xs font-bold shrink-0',
                              task.status === 'completed'
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-accent text-white hover:scale-105 transition-all shadow-lg shadow-accent/20'
                            )}>
                            {task.status === 'completed' ? '✓ Done' : task.status === 'in_progress' ? 'Resume' : 'Start →'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Smart empty state
                  <div className="rounded-2xl border border-border bg-secondary/20 p-5">
                    {teacherCtx ? (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                          <ClipboardList className="w-5 h-5 text-muted-foreground opacity-50" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">No tasks yet</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Your teacher hasn't assigned tasks yet — practise independently in the meantime.
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setActiveTab('practice')}
                          className="h-9 px-3 bg-accent text-white font-bold rounded-xl text-xs shrink-0">
                          Practice →
                        </Button>
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">Join your teacher to receive assignments</p>
                    )}
                  </div>
                )}
              </div>

              {/* ── SECTION 4: Live Tests ── */}
              {realTests.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" /> Live Tests
                  </h2>
                  {realTests.map((test: any) => (
                    <div key={test.id} className="bg-card border-2 border-accent/25 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent">LIVE</span>
                          <span className="text-[10px] text-muted-foreground">{test.exam_type}</span>
                        </div>
                        <p className="font-bold text-sm">{test.metadata?.subchapterName || 'Topic Assessment'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{test.question_count} Q • {test.time_limit_minutes} min</p>
                      </div>
                      <Button onClick={() => navigate(`/assess/${test.id}`)} size="sm"
                        className="h-10 px-4 rounded-xl bg-accent text-white font-bold hover:scale-105 transition-all shrink-0">
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── SECTION 5: Performance Snapshot ── */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" /> Performance
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Tasks Done',  value: completedTasks || '—', icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Sessions',    value: practiceStats.attempted || '—', icon: Target,       color: 'text-accent' },
                    { label: 'Accuracy',    value: practiceStats.accuracy ? `${practiceStats.accuracy}%` : '—', icon: TrendingUp, color: 'text-amber-400' },
                  ].map(card => (
                    <div key={card.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                      <card.icon className={cn('w-5 h-5 mx-auto mb-1.5', card.color)} />
                      <p className="font-black text-foreground text-xl">{card.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{card.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SECTION 6: AI Practice CTA ── */}
              <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">AI Adaptive Practice</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Personalized questions for <span className="text-foreground font-semibold">{effectiveExam || 'your exam'}</span>
                  </p>
                  <Button size="sm" onClick={() => setActiveTab('practice')}
                    className="mt-3 h-9 px-4 bg-accent text-white font-bold rounded-xl text-xs">
                    Generate Practice →
                  </Button>
                </div>
              </div>

              {/* ── SECTION 7: Join Another Teacher ── */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <button
                  onClick={() => setShowJoinInput(v => !v)}
                  className="flex items-center justify-between w-full text-sm font-bold text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-muted-foreground" /> Join Another Teacher
                  </span>
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
                {showJoinInput && (
                  <div className="flex gap-2 mt-3">
                    <input value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Enter code" maxLength={8}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent/40 uppercase tracking-widest"
                    />
                    <Button onClick={handleJoinByCode} disabled={joiningCode || joinCode.length < 6}
                      className="bg-accent text-white px-4 rounded-xl font-bold text-sm">
                      {joiningCode ? '...' : 'Join'}
                    </Button>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════
              PRACTICE TAB — Exam-locked subjects
          ═══════════════════════════════════════════════════ */}
          {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-4">

              {/* Exam lock badge */}
              {effectiveExam && (
                <div className="flex items-center gap-2 px-3 py-2 bg-accent/8 border border-accent/20 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
                  <p className="text-xs text-foreground font-semibold">
                    Locked to <span className="text-accent">{effectiveExam}</span>
                    {teacherCtx ? ` (set by ${teacherCtx.teacherName})` : ''}
                  </p>
                </div>
              )}

              {/* Session stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Today's Goal", value: '20 Qs', icon: Target,       color: 'text-accent' },
                  { label: 'Sessions',     value: practiceStats.attempted || '0', icon: ClipboardList, color: 'text-emerald-400' },
                  { label: 'Accuracy',     value: practiceStats.accuracy ? `${practiceStats.accuracy}%` : '—', icon: Zap, color: 'text-amber-400' },
                ].map(card => (
                  <div key={card.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                    <card.icon className={cn('w-5 h-5 mx-auto mb-1.5', card.color)} />
                    <p className="font-black text-foreground text-lg">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Practice topics (locked to teacher's exam) */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Self Practice</h2>
                <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border">AI Adaptive</span>
              </div>

              <div className="space-y-2.5">
                {PRACTICE_TOPICS.map((topic, i) => (
                  <div key={i}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-accent/30 transition-all group cursor-pointer"
                    onClick={() => navigate('/practice')}>
                    <div className="flex items-center gap-3">
                      <div className="text-xl shrink-0">{topic.emoji}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', DIFF_COLORS[topic.difficulty])}>
                            {topic.difficulty}
                          </span>
                          <span className={cn('text-[10px] font-semibold', topic.color)}>{topic.subject}</span>
                        </div>
                        <p className="font-bold text-sm text-foreground">{topic.topic}</p>
                        <p className="text-xs text-muted-foreground">{topic.qCount} questions</p>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                      <Play className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <p className="text-sm font-bold">Adaptive Sprints</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">AI selects questions based on your weakness map.</p>
                  <Button onClick={() => navigate('/practice?mode=adaptive')} className="w-full bg-accent text-white font-bold">Start Sprint</Button>
                </div>
                <div className="bg-secondary/40 border border-border rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm font-bold">Full Mock Test</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">Timed exam environment. Full pattern.</p>
                  <Button variant="outline" onClick={() => navigate('/practice?mode=static')} className="w-full font-bold">Take Full Test</Button>
                </div>
              </div>

            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════
              PROGRESS TAB
          ═══════════════════════════════════════════════════ */}
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-4">

              {/* My Teachers */}
              {allTeachers.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" /> My Teachers
                  </h3>
                  {allTeachers.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-base font-black text-accent">
                          {t.profile?.full_name?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {t.profile?.full_name || 'Teacher'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.exam_type || effectiveExam}
                          {t.batch_name ? ` • ${t.batch_name}` : ''}
                          {t.joined_at ? ` • Joined ${new Date(t.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground text-center">📊 Your teacher can see your progress in real time</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-accent/30 bg-accent/5 p-5">
                  <p className="text-sm font-bold mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4 text-accent" /> Join a Teacher
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">Enter the 6-character code shared by your teacher.</p>
                  <div className="flex gap-2">
                    <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. A3WAVB" maxLength={8}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent/50"
                    />
                    <Button onClick={handleJoinByCode} disabled={joiningCode} className="bg-accent text-white px-5">
                      {joiningCode ? '⏳' : 'Join'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">My Progress</h2>
                <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg border border-border uppercase tracking-wider">Live</span>
              </div>
              <StudentProgressView />

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentHubPage;
