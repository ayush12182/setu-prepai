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

// ─── Component ────────────────────────────────────────────────
const StudentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    console.log("[SETU] Universal Deployment v2.1 — Active");
  }, []);

  const [teacherCtx, setTeacherCtx] = useState<TeacherContext | null>(null);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [lockedExam, setLockedExam] = useState<string | null>(null);

  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [assignedAssessments, setAssignedAssessments] = useState<any[]>([]);
  const [sharedMaterials, setSharedMaterials] = useState<any[]>([]);
  const [realTests, setRealTests] = useState<any[]>([]);

  const { 
    accuracy: realAccuracy, 
    streak: realStreak, 
    totalSolved: realTotalSolved, 
    todayDone: realTodayDone,
    weakTopic,
    loading: statsLoading 
  } = useStudentStats();

  const {
    days_left: cycleDaysLeft,
    is_test_day: isCycleTestDay
  } = useStudentCycle();

  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const effectiveExam = lockedExam || profile?.target_exam || (user as any)?.user_metadata?.target_exam || null;
  const streamSubjects = getSubjectsForExam(effectiveExam);

  const PRACTICE_TOPICS = useMemo(() => {
    if (!streamSubjects || !Array.isArray(streamSubjects)) return [];
    return streamSubjects.flatMap(s =>
      s.chapters.slice(0, 2).map(ch => ({
        subject: s.label, topic: ch.title,
        difficulty: 'medium',
        qCount: 20,
        color: s.color, emoji: s.emoji,
      }))
    );
  }, [effectiveExam, streamSubjects]);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: links } = await supabase.from('student_teacher_links' as any).select('*').eq('student_id', user!.id);
      const { data: batchMemberships } = await supabase.from('batch_members' as any).select('batches(*)').eq('student_id', user!.id);
      const myBatches = (batchMemberships || []).map((bm: any) => bm.batches).filter(Boolean);

      if (links && links.length > 0) {
        const { data: tProfile } = await supabase.from('profiles').select('*').eq('user_id', links[0].teacher_id).single();
        if (tProfile) {
          setTeacherCtx({
            teacherName: tProfile.full_name,
            batchName: 'Your Batch',
            examType: links[0].exam_type || effectiveExam || 'General'
          });
        }
      }

      const { data: tasks } = await supabase.from('assigned_tasks' as any).select('*').eq('student_id', user!.id).limit(10);
      setAssignedTasks(tasks || []);

      const { data: tests } = await supabase.from('student_assessments' as any).select('*, assessment_sessions(*)').eq('student_id', user!.id).eq('status', 'not_started');
      setAssignedAssessments(tests || []);

      const { data: sharedMats } = await supabase.from('batch_materials' as any).select('*').limit(5);
      setSharedMaterials(sharedMats || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode) return;
    setJoiningCode(true);
    const result = await joinTeacherByCode(joinCode.toUpperCase());
    if (result.success) {
      toast.success(result.message);
      loadAll();
    } else {
      toast.error(result.message);
    }
    setJoiningCode(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const isB2C = profile?.user_type === 'b2c_student';

  if (!isB2C && !teacherCtx) {
    return (
      <MainLayout title="Student Hub">
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <GraduationCap className="w-16 h-16 mx-auto text-accent" />
          <h2 className="text-xl font-bold">Join your Class</h2>
          <div className="flex gap-2">
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} className="flex-1 border p-3 rounded-xl" placeholder="Code" />
            <Button onClick={handleJoinByCode} disabled={joiningCode} className="bg-accent">Join</Button>
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
    <MainLayout title="Student Hub">
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/10 to-background p-8">
                <h2 className="text-2xl font-black mb-2">Welcome back, {profile?.full_name || 'Student'}</h2>
                <p className="text-muted-foreground mb-6">Continue your journey towards {effectiveExam || 'success'}.</p>
                <Button onClick={() => navigate('/practice')} size="lg" className="bg-accent text-primary font-bold px-8 rounded-xl">Start Learning</Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Today', value: `${realTodayDone}/20`, icon: Target, color: 'text-accent' },
                  { label: 'Streak', value: `${realStreak} Days`, icon: Flame, color: 'text-orange-400' },
                  { label: 'Accuracy', value: `${realAccuracy}%`, icon: Zap, color: 'text-emerald-400' },
                  { label: 'Exam', value: effectiveExam || 'SETU', icon: Lock, color: 'text-amber-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 text-center">
                    <stat.icon className={cn('w-5 h-5 mx-auto mb-2', stat.color)} />
                    <p className="text-lg font-black">{stat.value}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {assignedTasks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground">Missions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedTasks.map((task: any) => (
                      <div key={task.id} onClick={() => navigate('/practice')} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center cursor-pointer">
                        <p className="font-bold text-sm">{task.topic}</p>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRACTICE_TOPICS.map((topic, i) => (
                <div key={i} onClick={() => navigate('/practice')} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{topic.emoji}</span>
                    <p className="font-bold text-sm">{topic.topic}</p>
                  </div>
                  <Play className="w-4 h-4 text-accent" />
                </div>
              ))}
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
