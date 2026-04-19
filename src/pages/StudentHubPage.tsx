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
      const { data: batchMemberships } = await supabase.from('batch_students' as any).select('batches(*)').eq('student_id', user!.id);
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

  const isB2C = profile?.user_type === 'student';

  if (!isB2C && !teacherCtx) {
    return (
      <MainLayout title="Student Hub">
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <GraduationCap className="w-16 h-16 mx-auto text-accent" />
          <h2 className="text-xl font-bold">Join your Class</h2>
          <div className="flex gap-2">
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="flex-1 border p-3 rounded-xl" placeholder="Code" />
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
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border w-max">
          {TABS.map((tab) => (
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

        {/* Home Tab Content */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Mentor Header (New Moat) */}
            <div className="flex items-center justify-between bg-card/50 backdrop-blur-md border border-border rounded-2xl p-4 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 overflow-hidden">
                  <span className="text-accent font-bold">AK</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Mentor</p>
                  <h3 className="text-sm font-black text-foreground">{teacherCtx?.teacherName || 'Dr. Anil Kumar'} 👨‍⚕️</h3>
                </div>
              </div>
              <div className="bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-lg">
                <p className="text-[11px] font-bold text-accent">"Focus on NCERT diagrams today."</p>
              </div>
            </div>

            {/* 21-Day Mission Hero (Dopamine Loop) */}
            <div className="relative group overflow-hidden rounded-3xl border-2 border-accent/30 bg-gradient-to-br from-accent/15 via-background to-background p-8 shadow-xl shadow-accent/5">
              <div className="absolute top-0 right-0 p-4">
                <Flame className="w-12 h-12 text-accent/20 animate-pulse" />
              </div>
              
              <div className="max-w-2xl relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-accent text-primary text-[11px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-accent/20">
                    Day {21 - (cycleDaysLeft || 18)}/21 🔥
                  </span>
                  <span className="text-sm font-bold text-accent italic">NEET Recovery Mode</span>
                </div>
                
                <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                  Today's Mission: <br/>
                  <span className="text-accent underline decoration-accent/30 underline-offset-8">Cell Cycle & Kinematics</span>
                </h2>
                
                {/* Progress Bar */}
                <div className="space-y-2 mb-8 max-w-sm">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>MISSION PROGRESS</span>
                    <span>40%</span>
                  </div>
                  <div className="h-3 bg-secondary/50 rounded-full overflow-hidden border border-border">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      className="h-full bg-gradient-to-r from-accent to-accent/60"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/practice')} 
                  size="lg" 
                  className="bg-accent text-primary font-black px-10 rounded-2xl h-14 text-lg shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:scale-105 transition-all"
                >
                  Continue Today's Plan <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Daily Action System (Checklist Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> Today's Primary Tasks
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {assignedTasks.length > 0 ? assignedTasks.map((task: any, i) => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                          task.status === 'completed' 
                            ? "bg-emerald-500/5 border-emerald-500/20 opacity-70" 
                            : "bg-card border-border hover:border-accent/40"
                        )}
                        onClick={() => navigate('/practice')}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            task.status === 'completed' ? "bg-emerald-500/20 text-emerald-500" : "bg-secondary text-muted-foreground group-hover:bg-accent/20 group-hover:text-accent"
                          )}>
                            {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className={cn("font-bold text-sm", task.status === 'completed' ? "line-through text-muted-foreground" : "text-foreground")}>
                              {task.topic} {task.subtopic ? `— ${task.subtopic}` : ''}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">{task.difficulty} Difficulty</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    )) : (
                      <div className="p-10 border border-dashed border-border rounded-2xl text-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">No tasks assigned today. Check back later!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* New from Teacher Section */}
                {sharedMaterials.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> New from your Teacher
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sharedMaterials.map((mat, i) => (
                        <div 
                          key={i} 
                          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary transition-all">
                            {mat.material_type === 'note' ? <BookOpen className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{mat.title || 'Shared Material'}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">{mat.material_type} • Just shared</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats & Streak (Engagement Hooks) */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Performance Status
                </h3>
                <div className="space-y-3">
                  <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Flame className="w-24 h-24 text-orange-500" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Current Streak</p>
                    <div className="flex items-end gap-2">
                      <h4 className="text-3xl font-black text-orange-400">{realStreak}</h4>
                      <p className="text-sm font-bold text-orange-400/60 pb-1">Days</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">🔥 Ahead of 63% students this week</p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">7-Day Accuracy</p>
                    <div className="flex items-end gap-2">
                      <h4 className="text-3xl font-black text-emerald-400">{realAccuracy}%</h4>
                      <TrendingUp className="w-5 h-5 text-emerald-400/60 pb-1" />
                    </div>
                    <div className="h-1.5 bg-secondary/50 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${realAccuracy}%` }} />
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-accent uppercase mb-1">AI Recommendation</p>
                    <p className="text-xs font-bold leading-relaxed">
                      Your accuracy in <span className="text-accent underline">Kinematics</span> dropped by 5%. Practice 10 more MCQs before 11 PM.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Practice Tab Content */}
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRACTICE_TOPICS.map((topic, i) => (
              <div key={i} onClick={() => navigate('/practice')} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{topic.emoji}</span>
                  <p className="font-bold text-sm">{topic.topic}</p>
                </div>
                <Play className="w-4 h-4 text-accent" />
              </div>
            ))}
          </div>
        )}

        {/* Progress Tab Content */}
        {activeTab === 'progress' && (
          <div>
            <StudentProgressView />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentHubPage;
