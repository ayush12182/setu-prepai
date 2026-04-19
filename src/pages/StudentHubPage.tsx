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
import { useExamMode } from '@/contexts/ExamModeContext';
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
  const { user, profile } = useAuth();
  const { examMode } = useExamMode();
  
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const { streak: realStreak, todayDone: realTodayDone, loading: statsLoading } = useStudentStats();
  const { days_left: cycleDaysLeft } = useStudentCycle();
  const [loading, setLoading] = useState(true);
  const [mentorName, setMentorName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // REFRESH: Fetch latest profile to ensure teacher_id is picked up after join
      let currentProfile = profile;
      if (user) {
        const { data: latest } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (latest) currentProfile = latest;
      }

      const { data: tasks } = await supabase
        .from('teacher_tasks' as any)
        .select('*, learning_nodes(name)')
        .eq('teacher_id', currentProfile?.teacher_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (tasks && tasks.length > 0) {
        setAssignedTasks(tasks);
      }

      // Fetch mentor name
      if (currentProfile?.teacher_id) {
        console.log("Fetching mentor details for teacher_id:", currentProfile.teacher_id);
        const { data: mentor, error: mentorErr } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', currentProfile.teacher_id)
          .maybeSingle();
        
        if (mentorErr) console.error("Mentor fetch error:", mentorErr);
        if (mentor) {
          console.log("Mentor found:", mentor.full_name);
          setMentorName(mentor.full_name);
        }
      } else {
        console.warn("No teacher_id found in profile for mentor greeting.");
      }
    } catch (err) {
      console.error("Critical Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const examData = useMemo(() => {
    if (examMode === 'neet') {
      return {
        name: 'NEET UG 2026',
        date: '3 May 2026',
        daysLeft: calculateDaysLeft('2026-05-03'),
        advice: '"Biology NCERT multiple times read karo. Physics practice ko mat chhodo. You can do it!"'
      };
    }
    if (examMode === 'cuet') {
      return {
        name: 'CUET UG 2026',
        date: '11 May 2026',
        daysLeft: calculateDaysLeft('2026-05-11'),
        advice: '"Domain subjects ke liye NCERT focus karo, aur General Test ko ignore mat karna. Reasoning is key!"'
      };
    }
    return {
      name: 'JEE Advanced 2026',
      date: '24 May 2026',
      daysLeft: calculateDaysLeft('2026-05-24'),
      advice: '"Concepts pe focus karo. Advanced level problems solve karna shuru karo. Time to push limits!"'
    };
  }, [examMode]);

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const todayFocus = assignedTasks[0] || {
    learning_nodes: { name: 'Electrical Instruments' },
    description: 'Focus on Meter bridge working - Potentiometer for EMF comparison',
    suggested_time: '2h 30m'
  };


  return (
    <MainLayout fullHeight>
      <div className="min-h-full bg-[#0F1117] text-white p-4 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Greeting Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-[#1A1F2C] rounded-[2rem] p-8 lg:p-10 border border-white/[0.05] overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Dashboard</span>
                </div>
                <div>
                  <h3 className="text-white/60 text-base font-medium mb-1">
                    {mentorName 
                      ? `Welcome back to ${mentorName}'s Classroom! 👋` 
                      : profile?.teacher_id 
                      ? "Welcome back to your Teacher's Classroom! 👋"
                      : `Welcome back, ${profile?.full_name?.split(' ')[0] || 'Student'}! 👋`}
                  </h3>
                  <h1 className="text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
                    Your personalized learning <br className="hidden lg:block" /> path is ready for today
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Streak</p>
                    <p className="text-lg font-black">{realStreak} Days</p>
                  </div>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Solved</p>
                    <p className="text-lg font-black">{realTodayDone} Qs Today</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Today's Focus Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 bg-[#1A1F2C] rounded-[2rem] p-8 lg:p-10 border border-white/[0.05] relative overflow-hidden group hover:border-accent/30 transition-all duration-500"
            >
              <div className="absolute top-6 left-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.05]">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Today's Focus</span>
                </div>
              </div>

              <div className="mt-12 space-y-8">
                <div>
                  <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter mb-4 group-hover:text-accent transition-colors duration-500 italic">
                    {todayFocus.learning_nodes?.name || todayFocus.title}
                  </h2>
                  <p className="text-white/40 text-lg font-medium flex items-center gap-2">
                    Physics • <span className="text-white/80">Current Electricity</span>
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <p className="text-white/70 leading-relaxed font-medium">
                      {todayFocus.description || 'Focus on depth understanding today.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white/40">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Suggested: {todayFocus.suggested_time || '2h 30m'}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/practice')}
                    className="w-full sm:w-auto px-10 h-14 rounded-2xl bg-accent hover:bg-accent/90 text-primary font-black text-lg shadow-xl shadow-accent/20 group-hover:scale-105 transition-all duration-300"
                  >
                    Start Now <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Right Column Countdowns */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              
              {/* Upcoming Exam Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 bg-white/[0.03] rounded-[2rem] p-8 border border-white/[0.05] relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 text-orange-500/60 font-black italic">
                    <Flame className="w-4 h-4" />
                    <span className="text-4xl">{examData.daysLeft}</span>
                    <span className="text-sm self-end pb-1">Days Left</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-white/25 uppercase tracking-widest mb-1">Upcoming Exam</p>
                    <h4 className="text-xl font-black">{examData.name}</h4>
                    <p className="text-xs text-white/40 mt-1">{examData.date}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <p className="text-[11px] leading-relaxed text-orange-200/60 italic font-medium">
                      {examData.advice}
                    </p>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest"
                  >
                    Start Preparing <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* 21-Day Cycle Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 bg-white/[0.03] rounded-[2rem] p-8 border border-white/[0.05] relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 text-blue-500/60 font-black italic">
                    <Clock className="w-4 h-4" />
                    <span className="text-4xl">8</span>
                    <span className="text-sm self-end pb-1">Days Left</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-white/25 uppercase tracking-widest mb-1 font-sans">21 Day Cycle</p>
                    <h4 className="text-xl font-black">Major Test</h4>
                    <p className="text-xs text-white/40 mt-1">Test Date: 25 Feb 2026 • <span className="text-blue-400">Cycle 1</span></p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[11px] leading-relaxed text-blue-200/60 italic font-medium">
                      "Major Test ke liye prepare ho raha hai? Daily practice karte raho, bhai!"
                    </p>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest"
                  >
                    View Details <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentHubPage;
