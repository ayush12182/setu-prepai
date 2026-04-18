import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, BarChart3, ChevronRight, Brain,
  Target, Zap, ShieldCheck, ClipboardList, ArrowRight,
  Play, Link, Eye, GraduationCap, Users, FileText,
  Sparkles, Plus, CheckCircle2, Clock, Circle, LogOut,
  Trophy, AlertCircle, BookMarked, FlameKindling, Flame,
  TrendingUp, Lock, Loader2, Rocket, CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StudentProgressView } from '@/components/student/StudentProgressView';
import { toast } from 'sonner';
import { getSubjectsForExam } from '@/lib/streamSubjects';
import { joinTeacherByCode } from '@/lib/studentActivity';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudentStats } from '@/hooks/useStudentStats';
import { useStudentCycle } from '@/hooks/useStudentCycle';

// ─── Types ────────────────────────────────────────────────────
type Tab = 'home' | 'practice' | 'progress';

interface TeacherContext {
  teacherName: string;
  batchName: string;
  examType: string;
  institutionName?: string;
  coachingName?: string;
  joinedAt?: string;
  teacherMessage?: string;
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

// ─── Skeleton Loader ──────────────────────────────────────────
const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={cn('rounded-2xl bg-secondary/30 animate-pulse', className)} />
);

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

  // Real Data Hooks
  const { 
    accuracy: realAccuracy, 
    streak: realStreak, 
    totalSolved: realTotalSolved, 
    todayDone: realTodayDone,
    loading: statsLoading 
  } = useStudentStats();

  const {
    days_left: cycleDaysLeft,
    is_test_day: isCycleTestDay,
    loading: cycleLoading,
    markComplete: markCycleComplete
  } = useStudentCycle();

  // UI
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  // Derive subjects FROM locked exam (teacher-controlled)
  const effectiveExam = lockedExam || profile?.target_exam || (user as any)?.user_metadata?.target_exam || null;
  const streamSubjects = getSubjectsForExam(effectiveExam);

  const PRACTICE_TOPICS = useMemo(() => {
    if (!streamSubjects || !Array.isArray(streamSubjects)) return [];
    return streamSubjects.flatMap(s =>
      s.chapters.slice(0, 2).map(ch => ({
        subject: s.label, topic: ch.title,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
        qCount: 15 + Math.floor(Math.random() * 25),
        color: s.color, emoji: s.emoji,
      }))
    );
  }, [effectiveExam]);

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
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      let tProfiles: any[] = [];
      if (teacherIds.length > 0) {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('user_id, full_name, institution_name, coaching_name')
          .in('user_id', teacherIds);
        tProfiles = data || [];
      }
      const tMap: Record<string, any> = {};
      tProfiles.forEach((t: any) => { tMap[t.user_id] = t; });

      const teacherList: any[] = [];
      if (links && links.length > 0) {
        links.forEach((l: any) => {
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

      if (teacherList.length > 0) {
        const primary = teacherList[0];
        const rawName = primary.profile?.full_name;
        // Clean 'xyz' or placeholder names
        const cleanName = (!rawName || rawName.toLowerCase() === 'xyz' || rawName.toLowerCase().includes('teacher')) 
          ? 'Your Mentor' 
          : rawName;

        const ctx: TeacherContext = {
          teacherName: cleanName,
          batchName: primary.batch_name || 'Your Batch',
          examType: primary.exam_type || effectiveExam || 'General',
          institutionName: primary.profile?.institution_name || undefined,
          coachingName: primary.profile?.coaching_name || undefined,
          joinedAt: primary.joined_at,
        };
        setTeacherCtx(ctx);
        setLockedExam(ctx.examType);
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

      // ── 6. Practice stats + streak moved to useStudentStats hook ──


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

  // ─── Derived data ───────────────────────────────────────────
  const completedTasks = assignedTasks.filter(t => t.status === 'completed').length;
  const pendingTasksList = assignedTasks.filter(t => t.status === 'pending');
  const inProgressTasks = assignedTasks.filter(t => t.status === 'in_progress');

  const resumeTask = inProgressTasks[0] || null;
  const nextMissionTask = pendingTasksList[0] || null;
  const dailyGoal = 20;
  // ── Smart Daily Hint  ──
  const smartHint = (() => {
    if (isCycleTestDay) return "Today is your Full Syllabus Test day. Give it your best shot!";
    if (realStreak >= 7) return "You've been consistent — try a mixed full-length test today.";
    if (realAccuracy > 0 && realAccuracy < 55) return `Your accuracy is ${realAccuracy}% — focus on fewer topics and consolidate first.`;
    if (realAccuracy >= 55 && realAccuracy < 75) return "A 20-minute targeted practice session can push your accuracy above 75%.";
    if (realTodayDone === 0 && realTotalSolved > 5) return "You haven't practiced today — even 10 questions keeps the momentum going.";
    if (realTodayDone > 0 && realTodayDone < dailyGoal) return `${realTodayDone} questions done — ${dailyGoal - realTodayDone} more to hit your daily goal.`;
    if (!effectiveExam) return null;
    return `Keep going — consistent daily practice is the fastest path to ${effectiveExam}.`;
  })();

  const isFullTestSoon = !isCycleTestDay && cycleDaysLeft <= 3;

  // ─── Guards ─────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading your hub...</p>
      </div>
    );
  }

  // No teacher connected — onboarding
  if (!loading && (!teacherCtx || !teacherCtx.batchName)) {
    return (
      <MainLayout title="Student Hub">
        <div className="max-w-2xl mx-auto py-10 px-4">
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-6 md:p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <GraduationCap className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Connect with your Teacher</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Enter the 6-character code your teacher shared to access your personalized classroom, assignments, and tests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
              <input 
                value={joinCode} 
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3WAVB" 
                maxLength={8}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent/50 shadow-sm"
              />
              <Button onClick={handleJoinByCode} disabled={joiningCode} className="w-full sm:w-auto bg-accent text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-accent/20">
                {joiningCode ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Class'}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ─── TABS ───────────────────────────────────────────────────
  const TABS = [
    { id: 'home' as Tab,     label: 'Home',     icon: '🏠' },
    { id: 'practice' as Tab, label: 'Practice', icon: '✏️' },
    { id: 'progress' as Tab, label: 'Progress', icon: '📊' },
  ];

  return (
    <MainLayout title={teacherCtx?.teacherName ? `${teacherCtx.teacherName}'s Classroom` : 'Student Hub'}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── HEADER TABS ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-1 bg-secondary/30 p-1.5 rounded-xl border border-border w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Exam Lock Badge (always visible) */}
          {effectiveExam && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/8 border border-accent/20 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-xs font-bold text-accent">{effectiveExam}</span>
              <span className="text-[10px] text-muted-foreground">Exam Locked</span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
              HOME TAB
          ═══════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* ── HERO: Today's Mission / Smart Resume / Full Syllabus Test ── */}
              {isCycleTestDay ? (
                // PRIORITY: 21-Day Full Syllabus Test
                <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent p-5 sm:p-6 group hover:shadow-xl hover:shadow-amber-500/10 transition-all">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 animate-pulse">
                        ⭐ Major Milestone
                      </span>
                      <span className="text-[10px] text-muted-foreground">Full Syllabus Test</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-foreground mb-1">
                      21-Day Cycle Test is Ready
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      Your standard full-length assessment is due. This test benchmarks your progress across all recent chapters.
                    </p>
                    <Button onClick={() => navigate('/practice?mode=full-syllabus')} size="lg"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-amber-500/30 group-hover:scale-[1.02] transition-all">
                      <Trophy className="w-5 h-5 mr-2" /> Start Full Test
                    </Button>
                  </div>
                </div>
              ) : resumeTask ? (
                // RESUME: unfinished session
                <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/12 via-amber-500/5 to-transparent p-5 sm:p-6 group hover:shadow-xl hover:shadow-amber-500/10 transition-all">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
                        ⏳ Continue
                      </span>
                      <span className="text-[10px] text-muted-foreground">{resumeTask.topic}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-foreground mb-1">
                      Resume: {resumeTask.subtopic || resumeTask.topic}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pick up where you left off — don't lose momentum.
                    </p>
                    <Button onClick={() => navigate('/practice')} size="lg"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-amber-500/30 group-hover:scale-[1.02] transition-all">
                      <Play className="w-5 h-5 mr-2" /> Continue Practice
                    </Button>
                  </div>
                </div>
              ) : nextMissionTask ? (
                // MISSION: assigned by teacher
                <div className="relative overflow-hidden rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/12 via-accent/5 to-transparent p-5 sm:p-6 group hover:shadow-xl hover:shadow-accent/10 transition-all">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent">
                        🎯 Today's Mission
                      </span>
                      {teacherCtx && (
                        <span className="text-[10px] text-muted-foreground">from {teacherCtx.teacherName}</span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-foreground mb-1">
                      {nextMissionTask.subtopic || nextMissionTask.topic}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> 10 Questions</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~20 min</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {nextMissionTask.topic}</span>
                    </div>
                    <Button onClick={() => navigate('/practice')} size="lg"
                      className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-accent/30 group-hover:scale-[1.02] transition-all">
                      <Rocket className="w-5 h-5 mr-2" /> Start Mission
                    </Button>
                  </div>
                </div>
              ) : (
                // FALLBACK: AI-powered practice CTA
                <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent p-5 sm:p-6 group hover:shadow-xl hover:shadow-accent/10 transition-all">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-accent/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent">
                        {realTodayDone > 0 ? '🔥 Keep Going' : '🚀 Start Today'}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-foreground mb-1">
                      {realTodayDone > 0
                        ? `You've done ${realTodayDone} today — keep the streak!`
                        : 'Ready to practice?'}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will generate personalized {effectiveExam || 'exam'} questions based on your weak areas.
                    </p>
                    <Button onClick={() => navigate('/practice')} size="lg"
                      className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-accent/30 group-hover:scale-[1.02] transition-all">
                      <Sparkles className="w-5 h-5 mr-2" /> Start Practice
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Teacher Context Card ── */}
              {teacherCtx && (
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-accent/30 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 border border-accent/25 flex items-center justify-center shrink-0">
                    <span className="font-black text-accent text-lg">
                      {(teacherCtx.teacherName || 'T').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground text-sm">
                        {teacherCtx.teacherName}
                        {teacherCtx.coachingName && (
                          <span className="text-muted-foreground font-normal"> — {teacherCtx.coachingName}</span>
                        )}
                      </p>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        ✓ Enrolled
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {teacherCtx.batchName} • <span className="text-accent font-semibold">{teacherCtx.examType}</span>
                    </p>
                    {teacherCtx.teacherMessage && (
                      <p className="text-xs text-foreground/70 mt-1.5 italic bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
                        💬 "{teacherCtx.teacherMessage}"
                      </p>
                    )}
                  </div>
                  {allTeachers.length > 1 && (
                    <span className="text-[10px] text-muted-foreground shrink-0">+{allTeachers.length - 1} more</span>
                  )}
                </div>
              )}

              {/* ── Daily Performance Ring + Streak + Stats + 21-day chip ── */}
              <div className="grid grid-cols-3 gap-3">
                {/* Daily Progress Ring */}
                <div className="bg-card border border-border rounded-2xl p-4 text-center hover:border-accent/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 relative overflow-hidden">
                  <div className="w-14 h-14 mx-auto mb-2 relative">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-border" />
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none"
                        className="text-accent"
                        strokeDasharray={`${Math.min(100, (realTodayDone / dailyGoal) * 100) * 1.508} 150.8`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground">
                      {Math.round((realTodayDone / dailyGoal) * 100)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Daily Goal</p>
                  {/* 21-day chip */}
                  {!isCycleTestDay && cycleDaysLeft <= 7 && (
                    <div className={`mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      isFullTestSoon
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : 'bg-secondary border-border text-muted-foreground'
                    }`}>
                      Next in {cycleDaysLeft}d
                    </div>
                  )}
                  {isCycleTestDay && (
                    <div className="mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-500 border-amber-600 text-white animate-pulse">
                      TEST DAY
                    </div>
                  )}
                </div>

                {/* Streak */}
                <div className="bg-card border border-border rounded-2xl p-4 text-center hover:border-accent/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-500/15 flex items-center justify-center">
                    <Flame className={cn('w-5 h-5', realStreak > 0 ? 'text-orange-400' : 'text-muted-foreground/40')} />
                  </div>
                  <p className="font-black text-foreground text-xl">{realStreak}</p>
                  <p className="text-[10px] text-muted-foreground">Day Streak</p>
                </div>

                {/* Accuracy */}
                <div className="bg-card border border-border rounded-2xl p-4 text-center hover:border-accent/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="font-black text-foreground text-xl">{realAccuracy}%</p>
                  <p className="text-[10px] text-muted-foreground">Accuracy</p>
                </div>
              </div>

              {/* ── Smart Daily Hint ── */}
              {smartHint && (
                <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 px-4 py-3">
                  <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/80 leading-relaxed">{smartHint}</p>
                </div>
              )}

              {/* ── Today's Tasks or Smart Empty ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-accent" />
                    Assigned Tasks
                    {pendingTasksList.length > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                        {pendingTasksList.length} pending
                      </span>
                    )}
                  </h2>
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
                  // Smart empty: CTA to practice
                  <div className="rounded-2xl border border-border bg-secondary/20 p-5 flex items-center gap-4 hover:border-accent/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">No tasks assigned yet</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Start practicing on your own — AI will adapt to your level.
                      </p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/practice')}
                      className="h-9 px-4 bg-accent text-white font-bold rounded-xl text-xs shrink-0">
                      Practice Now →
                    </Button>
                  </div>
                )}
              </div>

              {/* ── Live Tests ── */}
              {realTests.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" /> Live Tests
                  </h2>
                  {realTests.map((test: any) => (
                    <div key={test.id} className="bg-card border-2 border-accent/25 rounded-2xl p-4 flex items-center justify-between gap-3 hover:shadow-lg hover:border-accent/50 hover:scale-[1.01] transition-all">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent animate-pulse">LIVE</span>
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

              {/* ── Weakness Engine ── */}
              {realTotalSolved > 3 && realAccuracy < 70 && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-bold text-foreground">Focus Areas</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Your accuracy is {realAccuracy}% — focus on weak topics to improve.
                  </p>
                  <Button size="sm" onClick={() => navigate('/practice?mode=adaptive')}
                    className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 font-bold text-xs rounded-xl">
                    <Target className="w-3.5 h-3.5 mr-1.5" /> Practice Weak Areas
                  </Button>
                </div>
              )}

              {/* ── Join Another Teacher ── */}
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
                    Preparing for <span className="text-accent">{effectiveExam}</span>
                  </p>
                  {teacherCtx?.teacherName && (
                    <span className="text-[10px] text-muted-foreground ml-auto">(set by {teacherCtx.teacherName})</span>
                  )}
                </div>
              )}

              {/* Session stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Today's Goal", value: `${realTodayDone}/${dailyGoal}`, icon: Target,       color: 'text-accent' },
                  { label: 'Total Solved', value: realTotalSolved || '0', icon: ClipboardList, color: 'text-emerald-400' },
                  { label: 'Accuracy',     value: `${realAccuracy}%`, icon: Zap, color: 'text-amber-400' },
                ].map(card => (
                  <div key={card.label} className="bg-card border border-border rounded-2xl p-4 text-center hover:border-accent/30 hover:scale-[1.02] transition-all">
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
                <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <p className="text-sm font-bold">Adaptive Sprints</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">AI selects questions based on your weakness map.</p>
                  <Button onClick={() => navigate('/practice?mode=adaptive')} className="w-full bg-accent text-white font-bold">Start Sprint</Button>
                </div>
                <div className="bg-secondary/40 border border-border rounded-2xl p-5 flex flex-col hover:border-accent/30 hover:bg-secondary/60 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm font-bold">Full Mock Test</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">Timed exam environment. Full pattern.</p>
                  <Button variant="outline" onClick={() => navigate('/practice?mode=static')} className="w-full font-bold">Take Full Test</Button>
                </div>
                {/* 21-Day Full Syllabus Test */}
                <div className="sm:col-span-2 bg-secondary/30 border border-border rounded-2xl p-5 flex items-center justify-between gap-3 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CalendarDays className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold">Full Syllabus Test</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 uppercase tracking-wide">21-Day Cycle</span>
                        {isCycleTestDay && <span className="text-[9px] font-bold text-amber-500 animate-pulse">Test Day</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isCycleTestDay
                          ? 'Today is your major milestone test. Good luck!'
                          : `Next test in ${cycleDaysLeft} day${cycleDaysLeft !== 1 ? 's' : ''}. Standard full-length assessment.`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isCycleTestDay ? 'default' : 'outline'}
                    onClick={() => navigate('/practice?mode=full-syllabus')}
                    className={`shrink-0 font-bold text-xs rounded-xl h-9 px-4 ${isCycleTestDay ? 'bg-amber-500 text-white border-amber-500' : ''}`}
                  >
                    {isCycleTestDay ? 'Take Now' : 'Preview'}
                  </Button>
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
                    <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:border-accent/30 hover:shadow-lg transition-all">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-base font-black text-accent">
                          {t.profile?.full_name?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {(!t.profile?.full_name || t.profile.full_name.toLowerCase() === 'xyz') ? 'Your Mentor' : t.profile.full_name}
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
    </MainLayout>
  );
};

export default StudentHubPage;
