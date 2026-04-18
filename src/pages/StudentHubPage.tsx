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

  useEffect(() => {
    console.log("[SETU] Universal Deployment v2.1 — Active");
  }, []);

  // Primary teacher context (from DB)
  const [teacherCtx, setTeacherCtx] = useState<TeacherContext | null>(null);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);

  // Locked exam from teacher (falls back to profile)
  const [lockedExam, setLockedExam] = useState<string | null>(null);

  // Data
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [assignedAssessments, setAssignedAssessments] = useState<any[]>([]);
  const [sharedMaterials, setSharedMaterials] = useState<any[]>([]);
  const [realTests, setRealTests] = useState<any[]>([]);

  // Real Data Hooks
  const { 
    accuracy: realAccuracy, 
    streak: realStreak, 
    totalSolved: realTotalSolved, 
    todayDone: realTodayDone,
    weakTopic,
    lastActivityTopic,
    loading: statsLoading 
  } = useStudentStats();

  const {
    days_left: cycleDaysLeft,
    is_test_day: isCycleTestDay,
    loading: cycleLoading
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
      // 1. Fetch teacher links
      const { data: links } = await supabase.from('student_teacher_links' as any)
        .select('teacher_id, exam_type, subject, joined_at, is_active')
        .eq('student_id', user!.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      // 2. Fetch batch memberships
      const { data: batchMemberships } = await supabase.from('batch_members' as any)
        .select('batch_id, joined_at, batches(id, name, target_exam, subject, mentor_id, is_active)')
        .eq('student_id', user!.id);

      const myBatches = (batchMemberships || [])
        .map((bm: any) => bm.batches)
        .filter(Boolean);

      // 3. Resolve primary teacher + context
      const teacherIds = [
        ...(links || []).map((l: any) => l.teacher_id),
        ...myBatches.map((b: any) => b.mentor_id).filter(Boolean),
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      let tProfiles: any[] = [];
      if (teacherIds.length > 0) {
        const { data } = await supabase
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
      
      const isB2C = profile?.user_type === 'b2c_student';

      if (teacherList.length > 0) {
        const primary = teacherList[0];
        const rawName = primary.profile?.full_name;
        const isGeneric = !rawName || 
                         rawName.toLowerCase() === 'xyz' || 
                         rawName.toLowerCase().includes('teacher') ||
                         rawName.toLowerCase() === 'your mentor';

        if (!isGeneric) {
          const ctx: TeacherContext = {
            teacherName: rawName!,
            batchName: primary.batch_name || 'Your Batch',
            examType: primary.exam_type || effectiveExam || 'General',
            institutionName: primary.profile?.institution_name || undefined,
            coachingName: primary.profile?.coaching_name || undefined,
            joinedAt: primary.joined_at,
          };
          setTeacherCtx(ctx);
          setLockedExam(ctx.examType);
        } else if (isB2C) {
          setTeacherCtx({
            teacherName: 'AI SETU Mentor',
            batchName: 'Self-Study Mode',
            examType: effectiveExam || 'General'
          });
        }
      } else if (isB2C) {
        setTeacherCtx({
          teacherName: 'AI SETU Mentor',
          batchName: 'Self-Study Mode',
          examType: effectiveExam || 'General'
        });
      }

      // tasks
      const { data: tasks } = await supabase.from('assigned_tasks' as any)
        .select('*')
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setAssignedTasks(tasks || []);

      // assessments
      const { data: assignedTests } = await supabase.from('student_assessments' as any)
        .select('*, assessment_sessions(*)')
        .eq('student_id', user!.id)
        .eq('status', 'not_started')
        .order('assigned_at', { ascending: false });
      setAssignedAssessments(assignedTests || []);

      // materials
      const { data: sharedMats } = await supabase.from('batch_materials' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setSharedMaterials(sharedMats || []);

      // batch tests
      if (myBatches.length > 0) {
        const batchIds = myBatches.map((b: any) => b.id);
        const { data: tests } = await supabase.from('assessment_sessions' as any)
          .select('*').in('batch_id', batchIds).eq('status', 'ACTIVE');
        setRealTests(tests || []);
      }

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

  const trackMaterialAccess = async (materialId: string, url: string) => {
    try {
      await supabase.from('material_access' as any).upsert({
        material_id: materialId,
        student_id: user!.id,
        first_viewed_at: new Date().toISOString(),
      }, { onConflict: 'material_id, student_id' });
    } catch (e) { console.warn('Access log failed:', e); }

    if (url) window.open(url, '_blank');
  };

  const smartHint = useMemo(() => {
    if (isCycleTestDay) return { text: "Today is your Full Syllabus Test day. Give it your best shot!" };
    if (weakTopic) return { text: `Focus on ${weakTopic} today — your accuracy is slightly lower here.` };
    if (realStreak >= 7) return { text: "You've been consistent — try a mixed test today to switch things up." };
    if (realAccuracy > 0 && realAccuracy < 60) return { text: "Accuracy is below 60%. Try practicing Easy level questions for a bit." };
    return { text: `Keep going — consistent daily practice is the fastest path to success.` };
  }, [isCycleTestDay, weakTopic, realStreak, realAccuracy]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground text-sm">Loading your hub...</p>
      </div>
    );
  }

  const isB2C = profile?.user_type === 'b2c_student';

  if (!loading && !isB2C && (!teacherCtx || !teacherCtx.batchName)) {
    return (
      <MainLayout title="Student Hub">
        <div className="max-w-2xl mx-auto py-10 px-4 text-center">
          <div className="rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-10">
            <GraduationCap className="w-16 h-16 text-accent mx-auto mb-5" />
            <h2 className="text-xl font-bold mb-2">Connect with your Teacher</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter the 6-character code your teacher shared to access your personalized classroom.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A3WAVB" maxLength={8} className="flex-1 bg-background border border-border rounded-xl px-4 py-3" />
              <Button onClick={handleJoinByCode} disabled={joiningCode} className="bg-accent text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-accent/20">
                {joiningCode ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Class'}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const TABS = [
    { id: 'home' as Tab,     label: 'Home',     icon: '🏠' },
    { id: 'practice' as Tab, label: 'Practice', icon: '✏️' },
    { id: 'progress' as Tab, label: 'Progress', icon: '📊' },
  ];

  return (
    <MainLayout title={teacherCtx?.teacherName ? `${teacherCtx.teacherName}'s Classroom` : 'Student Hub'}>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        
        {/* TABS */}
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* HERO */}
              <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/10 via-background to-background p-8 group">
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
                    {isCycleTestDay ? "Milestone: Full Test Ready" : "Let's continue your prep"}
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-6 leading-relaxed">
                    {isCycleTestDay 
                      ? "Your 21-day cycle test is ready. This benchmarks your total syllabus progress."
                      : `Set your daily target and start practicing ${effectiveExam || 'concepts'} today.`}
                  </p>
                  <Button 
                    onClick={() => navigate(isCycleTestDay ? '/practice?mode=full-syllabus' : '/practice')} 
                    size="lg"
                    className="bg-accent text-primary font-bold px-8 rounded-2xl shadow-xl shadow-accent/20 transition-all hover:scale-105"
                  >
                    {isCycleTestDay ? "Start Full Test" : "Start Practice"}
                  </Button>
                </div>
              </div>

              {/* STATS STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Weekly Goal', value: `${realTodayDone}/20`, icon: Target, color: 'text-accent' },
                  { label: 'Streaks', value: `${realStreak} Days`, icon: Flame, color: 'text-orange-400' },
                  { label: 'Accuracy', value: `${realAccuracy}%`, icon: Zap, color: 'text-emerald-400' },
                  { label: 'Target Exam', value: effectiveExam || 'SETU', icon: Lock, color: 'text-amber-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                    <stat.icon className={cn('w-5 h-5 mb-2', stat.color)} />
                    <p className="text-lg font-black">{stat.value}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* HINT */}
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/10 px-5 py-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <p className="text-sm font-medium">{smartHint.text}</p>
              </div>

              {/* TEACHER CARD */}
              {teacherCtx && (
                <div className="flex items-center gap-4 rounded-3xl border border-border bg-card/30 p-4">
                  <GraduationCap className="w-10 h-10 text-accent" />
                  <div>
                    <p className="font-bold text-sm">{teacherCtx.teacherName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{teacherCtx.batchName} • {teacherCtx.examType}</p>
                  </div>
                </div>
              )}

              {/* MISSIONS */}
              {assignedTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">Assigned Tasks</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedTasks.slice(0, 4).map((task: any) => (
                      <div key={task.id} onClick={() => navigate('/practice')} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-accent/30 transition-all cursor-pointer">
                        <div>
                          <p className="font-bold text-sm">{task.topic}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{task.subtopic || 'Session'}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASSESSMENTS */}
              {assignedAssessments.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">Assigned Tests</h2>
                  {assignedAssessments.map((assignment: any) => {
                    const test = assignment.assessment_sessions;
                    if (!test) return null;
                    return (
                      <div key={assignment.id} className="bg-card border-2 border-accent/20 rounded-2xl p-4 flex items-center justify-between group">
                        <div>
                          <p className="font-bold text-sm">{test.metadata?.subchapterName || 'Assessment'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{test.exam_type} • {test.question_count} Q</p>
                        </div>
                        <Button onClick={() => navigate(`/assess/${test.id}`)} size="sm" className="bg-accent">Begin</Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* JOIN TEACHER */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <button onClick={() => setShowJoinInput(v => !v)} className="flex items-center justify-between w-full text-sm font-bold">
                  <span className="flex items-center gap-2"><Link className="w-4 h-4" /> Join Another Teacher</span>
                  <Plus className="w-4 h-4" />
                </button>
                {showJoinInput && (
                  <div className="flex gap-2 mt-3">
                    <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm" placeholder="Code" maxLength={8} />
                    <Button onClick={handleJoinByCode} className="bg-accent">Join</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRACTICE_TOPICS.map((topic, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-accent/30 transition-all cursor-pointer" onClick={() => navigate('/practice')}>
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{topic.emoji}</div>
                      <div>
                        <p className="font-bold text-sm">{topic.topic}</p>
                        <p className="text-[10px] font-semibold text-accent uppercase tracking-wider">{topic.subject}</p>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-accent" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StudentProgressView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default StudentHubPage;
