import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, BarChart3, ChevronRight, Brain,
  Target, Zap, ShieldCheck, ClipboardList, ArrowRight,
  Play, Link, Eye, GraduationCap, Users, FileText,
  Sparkles, Plus, CheckCircle2, Clock, Circle, LogOut,
  ChevronDown, Trophy, AlertCircle
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

const DIFF_COLORS: Record<string, string> = {
  easy:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard:   'bg-red-500/10 text-red-400 border-red-500/20',
};

const TASK_STATUS_CONFIG = {
  pending:     { label: 'Not Started', color: 'text-muted-foreground',  bg: 'bg-muted/30',           Icon: Circle,        dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'text-amber-400',         bg: 'bg-amber-500/5',         Icon: Clock,         dot: 'bg-amber-400' },
  completed:   { label: 'Completed',   color: 'text-emerald-400',        bg: 'bg-emerald-500/5',       Icon: CheckCircle2,  dot: 'bg-emerald-400' },
};

// ─── Component ────────────────────────────────────────────────
const StudentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Exam context
  const targetExam = profile?.target_exam || (user as any)?.user_metadata?.target_exam || null;
  const streamSubjects = getSubjectsForExam(targetExam);

  // Data state
  const [myTeachers, setMyTeachers] = useState<any[]>([]);           // student_teacher_links joined with teacher profile
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);     // assigned_tasks table
  const [myBatches, setMyBatches] = useState<any[]>([]);
  const [realMaterials, setRealMaterials] = useState<any[]>([]);
  const [realTests, setRealTests] = useState<any[]>([]);

  // UI state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(streamSubjects[0]?.label || null);

  // --- Demo practice data (uses exam subjects) ---
  const DEMO_PRACTICE = streamSubjects.flatMap(s =>
    s.chapters.slice(0, 2).map(ch => ({
      subject: s.label, topic: ch.title, subtopic: ch.title,
      difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
      qCount: 20 + Math.floor(Math.random() * 20),
    }))
  );

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const primaryTeacher = myTeachers[0] || null;

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  const loadAll = async () => {
    try {
      // 1. Teacher links
      const { data: links } = await (supabase.from as any)('student_teacher_links')
        .select('teacher_id, exam_type, joined_at, is_active')
        .eq('student_id', user!.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (links && links.length > 0) {
        const teacherIds = links.map((l: any) => l.teacher_id);
        const { data: tProfiles } = await (supabase as any)
          .from('profiles').select('user_id, full_name, institution_name').in('user_id', teacherIds);
        const tMap: Record<string, any> = {};
        (tProfiles || []).forEach((t: any) => { tMap[t.user_id] = t; });

        setMyTeachers(links.map((l: any) => ({
          ...l,
          teacherProfile: tMap[l.teacher_id] || null,
        })));
      } else {
        setMyTeachers([]);
      }

      // 2. Assigned tasks
      const { data: tasks } = await (supabase.from as any)('assigned_tasks')
        .select('*')
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setAssignedTasks(tasks || []);

      // 3. Batches (for material/tests)
      const { data: batches } = await (supabase.from as any)('batch_members')
        .select('batch_id, batches(*)')
        .eq('student_id', user!.id);
      const batchList = (batches || []).map((b: any) => b.batches).filter(Boolean);
      setMyBatches(batchList);

      if (batchList.length > 0) {
        const batchIds = batchList.map((b: any) => b.id);
        const { data: materials } = await (supabase.from as any)('batch_materials').select('*').in('batch_id', batchIds);
        setRealMaterials(materials || []);
        const { data: tests } = await (supabase.from as any)('assessment_sessions')
          .select('*').in('batch_id', batchIds).eq('status', 'ACTIVE');
        setRealTests(tests || []);
      }
    } catch (err) {
      console.error('Error loading student hub:', err);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode || joinCode.length < 6) { toast.error('Enter a 6-character code'); return; }
    setJoiningCode(true);
    const result = await joinTeacherByCode(joinCode);
    if (result.success) {
      toast.success(result.message);
      setShowJoinModal(false); setJoinCode('');
      await refreshProfile();
      loadAll();
    } else {
      toast.error(result.message);
    }
    setJoiningCode(false);
  };

  const TABS = [
    { id: 'home' as Tab,     label: 'Home',     emoji: '🏠' },
    { id: 'practice' as Tab, label: 'Practice', emoji: '✏️' },
    { id: 'progress' as Tab, label: 'Progress', emoji: '📊' },
  ];

  // ─── Stats (from assigned tasks) ─────────────────────────
  const completedTasks = assignedTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = assignedTasks.filter(t => t.status === 'pending').length;
  const avgAccuracy = assignedTasks.length
    ? Math.round(assignedTasks.reduce((a, t) => a + (t.initial_accuracy || 0), 0) / assignedTasks.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground text-sm leading-tight truncate">
                {primaryTeacher?.teacherProfile?.full_name ? `Learning under ${primaryTeacher.teacherProfile.full_name}` : 'SETU Student Hub'}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {targetExam ? `${targetExam} • ` : ''}{displayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
                  <span>{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowJoinModal(true)}
              className="h-8 rounded-xl border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 text-[11px] font-bold px-3">
              <Plus className="w-3 h-3 mr-1" /> Join
            </Button>
          </div>
        </div>
      </div>

      {/* ── JOIN MODAL ── */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !joiningCode && setShowJoinModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-xl font-bold">Join a Teacher</h2>
                <p className="text-xs text-muted-foreground mt-1">Enter the 6-character code from your teacher</p>
              </div>
              <input
                type="text" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="XXXXXX" maxLength={6} autoFocus
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 font-mono text-2xl tracking-[0.25em] text-center text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-accent/40 mb-4"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-11 rounded-xl"
                  onClick={() => setShowJoinModal(false)} disabled={joiningCode}>Cancel</Button>
                <Button className="flex-1 h-11 rounded-xl bg-accent text-white font-bold"
                  onClick={handleJoinByCode} disabled={joiningCode || joinCode.length < 6}>
                  {joiningCode ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-20 space-y-0">
        <AnimatePresence mode="wait">

          {/* ═══════════ HOME TAB ═══════════ */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* 1. Connected Teacher Banner */}
              {primaryTeacher ? (
                <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-4 mt-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Enrolled</span>
                        <span className="text-[10px] text-muted-foreground">{primaryTeacher.exam_type || targetExam}</span>
                      </div>
                      <p className="font-bold text-foreground text-sm">
                        {primaryTeacher.teacherProfile?.full_name || 'Your Teacher'}
                      </p>
                      {primaryTeacher.teacherProfile?.institution_name && (
                        <p className="text-xs text-muted-foreground">{primaryTeacher.teacherProfile.institution_name}</p>
                      )}
                    </div>
                    {myTeachers.length > 1 && (
                      <span className="text-xs text-muted-foreground shrink-0">+{myTeachers.length - 1} more</span>
                    )}
                  </div>
                </div>
              ) : (
                // No teacher — CTA to join
                <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-amber-500/5 p-5 mt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">Connect with your teacher</p>
                      <p className="text-xs text-muted-foreground mt-1">Enter the 6-character code your teacher shared — their assignments, tests, and notes will appear here.</p>
                      <Button size="sm" onClick={() => setShowJoinModal(true)}
                        className="mt-3 h-9 px-4 bg-accent text-white font-bold rounded-xl text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Enter Join Code
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Today's Tasks — PRIORITY BLOCK */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-accent" />
                    Today's Tasks
                    {pendingTasks > 0 && (
                      <span className="ml-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                        {pendingTasks} pending
                      </span>
                    )}
                  </h2>
                  <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border">
                    Assigned by teacher
                  </span>
                </div>

                {assignedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {assignedTasks.slice(0, 5).map((task: any) => {
                      const cfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.pending;
                      return (
                        <div key={task.id}
                          className={cn('rounded-2xl border p-4 flex items-center gap-3 transition-all hover:border-accent/30', cfg.bg,
                            task.status === 'pending' ? 'border-border' : task.status === 'completed' ? 'border-emerald-500/20' : 'border-amber-500/20'
                          )}>
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            task.status === 'completed' ? 'bg-emerald-500/15' : task.status === 'in_progress' ? 'bg-amber-500/15' : 'bg-muted/30')}>
                            <cfg.Icon className={cn('w-5 h-5', cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{task.topic}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {task.subtopic || 'Practice Set'} • Accuracy: {task.initial_accuracy ?? '—'}%
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
                    {assignedTasks.length > 5 && (
                      <button onClick={() => {}} className="w-full text-xs text-accent font-semibold py-2 hover:underline">
                        View all {assignedTasks.length} tasks →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-secondary/20 p-5 text-center">
                    <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {primaryTeacher ? 'Check back soon — your teacher will assign tasks here' : 'Join your teacher to receive assignments'}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Live Tests from Teacher */}
              {realTests.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" /> Live Tests
                  </h2>
                  {realTests.map((test: any) => (
                    <div key={test.id} className="bg-card border-2 border-accent/25 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg shadow-accent/5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent">LIVE</span>
                          <span className="text-[10px] text-muted-foreground">{test.exam_type}</span>
                        </div>
                        <p className="font-bold text-sm">{test.metadata?.subchapterName || 'Topic Assessment'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{test.question_count} Questions • {test.time_limit_minutes} min</p>
                      </div>
                      <Button onClick={() => navigate(`/assess/${test.id}`)} size="sm"
                        className="h-10 px-4 rounded-xl bg-accent text-white font-bold hover:scale-105 transition-all shrink-0">
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Performance Snapshot */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" /> Performance Snapshot
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Tasks Done',  value: completedTasks.toString(), icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Pending',     value: pendingTasks.toString(),   icon: Clock,        color: 'text-amber-400' },
                    { label: 'Avg Accuracy',value: `${avgAccuracy}%`,         icon: Target,       color: 'text-accent' },
                  ].map(card => (
                    <div key={card.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                      <card.icon className={cn('w-5 h-5 mx-auto mb-1.5', card.color)} />
                      <p className="font-black text-foreground text-xl">{card.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{card.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. AI Practice CTA */}
              <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">AI Practice</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Personalized questions based on your weak areas</p>
                  <Button size="sm" onClick={() => setActiveTab('practice')}
                    className="mt-3 h-9 px-4 bg-accent text-white font-bold rounded-xl text-xs">
                    Generate Practice →
                  </Button>
                </div>
              </div>

              {/* 6. Join Another Teacher */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Link className="w-4 h-4 text-muted-foreground" /> Join Another Teacher
                  </p>
                </div>
                <div className="flex gap-2">
                  <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="Enter code" maxLength={6}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent/40 uppercase tracking-widest"
                  />
                  <Button onClick={handleJoinByCode} disabled={joiningCode || joinCode.length < 6}
                    className="bg-accent text-white px-4 rounded-xl font-bold text-sm">
                    {joiningCode ? '...' : 'Join'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ PRACTICE TAB ═══════════ */}
          {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-4">

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Today's Goal", value: '20 Qs', icon: Target, color: 'text-accent' },
                  { label: 'Attempted',    value: '14',    icon: ClipboardList, color: 'text-emerald-400' },
                  { label: 'Accuracy',     value: '71%',   icon: Zap, color: 'text-amber-400' },
                ].map(card => (
                  <div key={card.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                    <card.icon className={cn('w-5 h-5 mx-auto mb-1.5', card.color)} />
                    <p className="font-black text-foreground text-lg">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Self Practice</h2>
                <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border">AI Adaptive</span>
              </div>

              <div className="space-y-3">
                {DEMO_PRACTICE.map(topic => (
                  <div key={`${topic.subject}-${topic.subtopic}`}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-accent/30 transition-all group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', DIFF_COLORS[topic.difficulty])}>
                          {topic.difficulty}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{topic.subject}</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">{topic.subtopic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{topic.topic} • {topic.qCount} questions</p>
                    </div>
                    <Button onClick={() => navigate('/practice')} size="sm"
                      className="h-9 w-9 p-0 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all group-hover:scale-110 shrink-0">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

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
                    <p className="text-sm font-bold">Static Mock Exam</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">Full pattern exams. Timed environment.</p>
                  <Button variant="outline" onClick={() => navigate('/practice?mode=static')} className="w-full font-bold">Take Full Test</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ PROGRESS TAB ═══════════ */}
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-4">

              {/* Teachers / Batches */}
              {myTeachers.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" /> My Teachers
                  </h3>
                  {myTeachers.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-base font-black text-accent">
                          {t.teacherProfile?.full_name?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {t.teacherProfile?.full_name || 'Teacher'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.exam_type || targetExam} • Joined {new Date(t.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground text-center">📊 Your teacher sees your progress in real time</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5">
                  <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4 text-accent" /> Join a Teacher
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">Enter the 6-character code shared by your teacher.</p>
                  <div className="flex gap-2">
                    <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. JB7K2X" maxLength={6}
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
