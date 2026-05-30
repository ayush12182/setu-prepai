import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Play, BookOpen, PenTool, ClipboardCheck, MessageCircle, BarChart3,
  ChevronRight, Zap, Target, Flame, Users, CalendarDays, Eye, Sparkles,
  TrendingUp, AlertTriangle, Activity, Loader2, Clock, CheckCircle, ArrowRight,
  TrendingDown, Info, Megaphone, Trophy, HelpCircle, GraduationCap, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useStudentStats } from '@/hooks/useStudentStats';
import { useBatchInfo } from '@/hooks/useBatchInfo';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { AssignedContent } from '@/components/student/AssignedContent';
import { toast } from 'sonner';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentHubPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isNeet, isCuet, isJee, config: examConfig } = useExamMode();
  const { isFoundation, classLabel, studentClass } = useClassContext();

  const { streak, todayDone, accuracy, loading: statsLoading } = useStudentStats();
  const { info: batch, loading: batchLoading } = useBatchInfo();

  // Dynamic state loaded from DB
  const [studentProfile, setStudentProfile] = useState<{
    cohortName?: string;
    class?: string;
    target_year?: number;
    current_level?: string;
  } | null>(null);

  const [todayFocus, setTodayFocus] = useState<{ topic: string; description: string; time: string } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Today's Plan Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Watch Video Lecture 3 on Laws of Motion', done: false, type: 'lecture' },
    { id: 2, text: 'Solve Newton\'s Laws DPP 1 (15 Questions)', done: false, type: 'practice' },
    { id: 3, text: 'Review Friction Formula Sheet & Short Notes', done: false, type: 'revision' }
  ]);

  // Handle checking items off Today's Study Plan
  const toggleChecklistItem = (id: number) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    );
    toast.success("Study task updated!");
  };

  // ── Data Fetch ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setPageLoading(true);
    try {
      // 1. Fetch from student_profiles with cohort details
      const { data: spData, error: spError } = await supabase
        .from('student_profiles')
        .select('*, cohorts(name)')
        .eq('student_id', user!.id)
        .maybeSingle();

      if (spData) {
        setStudentProfile({
          cohortName: spData.cohorts?.name || undefined,
          class: spData.class,
          target_year: spData.target_year,
          current_level: spData.current_level
        });
      }

      // 2. Fetch assigned task if exists
      const latestProfile = spData || profile;
      if (latestProfile?.teacher_id) {
        const { data: tasks } = await supabase
          .from('teacher_tasks' as any)
          .select('*, learning_nodes(name)')
          .eq('teacher_id', latestProfile.teacher_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (tasks && tasks.length > 0) {
          const t = tasks[0];
          setTodayFocus({
            topic: t.learning_nodes?.name ?? 'Today\'s Focus',
            description: t.description ?? 'Practice the topic your mentor assigned.',
            time: t.suggested_time ?? '2h',
          });
        }
      }
    } catch (err) {
      console.error('[StudentHubPage] loadData error:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const currentYear = studentProfile?.target_year || (isNeet ? 2027 : isCuet ? 2027 : 2028);
  const examLabel = isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE';
  
  // Cohort display details: e.g. "JEE 2028 | Class 11 | Foundation Batch"
  const batchCohortName = studentProfile?.cohortName || (isNeet ? `NEET Class 11` : isCuet ? `CUET Class 12` : `JEE Class 11`);
  const classTagLabel = studentProfile?.class === 'dropper' ? 'Dropper' : studentProfile?.class ? `Class ${studentProfile.class}` : classLabel;
  const currentLevelStr = studentProfile?.current_level || 'Intermediate';

  // Dynamic projected rank
  const projectedRankText = isCuet 
    ? '98.5 – 99.2 Percentile' 
    : isNeet 
    ? 'AIR 12,000 – 16,000' 
    : 'AIR 18,000 – 25,000';

  // 15 days accuracy trend chart data
  const chartData = [
    { date: '16 May', accuracy: 64 },
    { date: '18 May', accuracy: 68 },
    { date: '20 May', accuracy: 65 },
    { date: '22 May', accuracy: 72 },
    { date: '24 May', accuracy: 70 },
    { date: '26 May', accuracy: 74 },
    { date: '28 May', accuracy: 76 },
    { date: 'Today', accuracy: accuracy || 76 }
  ];

  if (pageLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen pb-28 pt-6 bg-[#06080D] text-white">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-8 space-y-8">

          {/* ════════════════ 1. HERO SECTION ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-white/[0.06] overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #0A111C 0%, #06080E 100%)',
              boxShadow: '0 10px 30px -15px rgba(0,0,0,0.7)'
            }}
          >
            {/* Ambient Accent Radial Glow (Color adapt based on exam track) */}
            <div 
              className="absolute right-0 top-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{
                background: isNeet 
                  ? 'radial-gradient(circle, hsl(145, 80%, 50%) 0%, transparent 70%)'
                  : isCuet 
                  ? 'radial-gradient(circle, hsl(260, 80%, 50%) 0%, transparent 70%)' 
                  : 'radial-gradient(circle, hsl(32, 90%, 55%) 0%, transparent 70%)'
              }}
            />
            
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              {/* Profile Greeting and Cohort Pill */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/[0.04] border border-white/[0.08] text-white/95 shadow-sm">
                    {examConfig.emoji} {batchCohortName}
                  </span>
                  <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/20">
                    {classTagLabel} • {currentLevelStr}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70">{profile?.full_name || 'Ayush'}</span>
                </h1>
                <p className="text-sm text-white/50 font-medium">
                  {examLabel} {currentYear} | {batch?.batchName || 'Foundation Batch'}
                </p>
              </div>

              {/* Performance Metrics: Streak and Target Indicators */}
              <div className="flex items-center gap-4 sm:gap-6">
                
                {/* Streak widget */}
                <div 
                  className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-orange-500/30 transition-all cursor-pointer group shadow-inner"
                  onClick={() => navigate('/revision')}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-2xl font-black leading-none text-white tracking-tight">{streak || 5}d</div>
                    <div className="text-[10px] text-white/40 uppercase font-black tracking-wider mt-0.5">Study Streak</div>
                  </div>
                </div>

                {/* Target progress widget */}
                <div 
                  className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-accent/30 transition-all cursor-pointer group shadow-inner"
                  onClick={() => navigate('/practice')}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-black leading-none text-white tracking-tight">{todayDone ? '3/3' : '2/3'}</div>
                    <div className="text-[10px] text-white/40 uppercase font-black tracking-wider mt-0.5">Daily Targets</div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

          {/* ════════════════ 2. RANK PROJECTION WIDGET ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-3xl border border-amber-500/20 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #18140B 0%, #090805 100%)',
              boxShadow: '0 8px 30px -15px rgba(245,158,11,0.15)'
            }}
          >
            <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
              
              <div className="space-y-2 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-400 font-bold text-xs uppercase tracking-[0.2em]">
                  <Trophy className="w-4 h-4 text-amber-400" /> Outcomes Analytics
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Current Rank Projection</h2>
                <p className="text-xs text-white/50 max-w-md">
                  Calculated dynamically from accuracy trends, overall consistency index, and current syllabus completion.
                </p>
              </div>

              {/* Big Golden AIR Projection */}
              <div className="flex flex-col items-center justify-center lg:items-end text-center lg:text-right">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
                  {projectedRankText}
                </div>
                <div className="text-xs font-bold text-amber-500/70 tracking-wider uppercase mt-1">
                  Target: {examLabel} {currentYear} Goal
                </div>
              </div>

              {/* Stats Breakdown Checklists */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 w-full lg:w-auto">
                <div className="text-center">
                  <div className="text-lg font-black text-white">{accuracy || 76}%</div>
                  <div className="text-[9px] text-white/40 uppercase font-bold tracking-wider mt-0.5">Accuracy</div>
                </div>
                <div className="text-center border-x border-white/[0.06] px-4">
                  <div className="text-lg font-black text-white">92%</div>
                  <div className="text-[9px] text-white/40 uppercase font-bold tracking-wider mt-0.5">Consistency</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-white">37%</div>
                  <div className="text-[9px] text-white/40 uppercase font-bold tracking-wider mt-0.5">Syllabus</div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* ════════════════ 3. SYLLABUS PROGRESS ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" /> Syllabus Progress
              </h2>
              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-1">
                Your Academic Identity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  subject: isNeet ? 'Biology' : isCuet ? 'English & Languages' : 'Physics', 
                  progress: isNeet ? 46 : isCuet ? 52 : 42, 
                  color: 'from-blue-500 to-cyan-400 shadow-[0_2px_10px_rgba(59,130,246,0.15)]',
                  bgGlow: 'bg-blue-500/5', 
                  borderColor: 'border-blue-500/10 hover:border-blue-500/30',
                  accentColor: 'text-blue-400',
                  chapterStr: isNeet ? '12/28 Chapters' : isCuet ? '8/15 Chapters' : '9/22 Chapters'
                },
                { 
                  subject: 'Chemistry', 
                  progress: 38, 
                  color: 'from-emerald-500 to-teal-400 shadow-[0_2px_10px_rgba(16,185,129,0.15)]',
                  bgGlow: 'bg-emerald-500/5', 
                  borderColor: 'border-emerald-500/10 hover:border-emerald-500/30',
                  accentColor: 'text-emerald-400',
                  chapterStr: isNeet ? '11/30 Chapters' : isCuet ? '6/16 Chapters' : '8/21 Chapters'
                },
                { 
                  subject: isNeet ? 'Physics' : isCuet ? 'General Test Aptitude' : 'Mathematics', 
                  progress: 31, 
                  color: 'from-violet-500 to-purple-400 shadow-[0_2px_10px_rgba(139,92,246,0.15)]',
                  bgGlow: 'bg-violet-500/5', 
                  borderColor: 'border-violet-500/10 hover:border-violet-500/30',
                  accentColor: 'text-violet-400',
                  chapterStr: isNeet ? '9/22 Chapters' : isCuet ? '5/16 Chapters' : '8/26 Chapters'
                }
              ].map(subj => (
                <div 
                  key={subj.subject}
                  onClick={() => navigate('/learn')}
                  className={`rounded-2xl border ${subj.borderColor} ${subj.bgGlow} p-5 space-y-4 hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white/90 group-hover:text-white transition-colors">{subj.subject}</span>
                    <span className={`text-xs font-bold ${subj.accentColor}`}>{subj.chapterStr}</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Completion bar progress */}
                    <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${subj.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${subj.color}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/40">
                      <span>Completion Percentage</span>
                      <span className="font-extrabold text-white/80">{subj.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ════════════════ 4. NEXT MILESTONE ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-3xl border border-white/[0.06] bg-card p-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Personalized Next Milestone
                </h3>
                <p className="text-xs text-white/40">
                  Follow the exact recommended chapter sequence mapped by elite Kota teachers.
                </p>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/learn')}
                className="rounded-lg border-white/[0.08] hover:bg-white/[0.04] text-xs font-bold text-white/80"
              >
                View Syllabus Roadmap <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Timeline diagram */}
              <div className="lg:col-span-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex-1 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Mastered</p>
                    <p className="text-sm text-white/80 font-bold truncate">1. Units & Dimensions</p>
                  </div>
                </div>

                <div className="text-center text-white/20 hidden sm:block">➔</div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex-1 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Mastered</p>
                    <p className="text-sm text-white/80 font-bold truncate">2. Motion in 1D</p>
                  </div>
                </div>

                <div className="text-center text-white/20 hidden sm:block">➔</div>

                <div className="bg-accent/15 border border-accent/20 rounded-xl p-3 flex-1 flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 shadow-[0_0_10px_hsl(var(--accent-hue)_80%_50%/0.3)]">
                    <span className="text-primary text-xs font-black animate-ping">→</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-accent/80 uppercase tracking-wider font-extrabold">Next Milestone</p>
                    <p className="text-sm text-white font-extrabold truncate">3. Laws of Motion</p>
                  </div>
                </div>

              </div>

              {/* Action card */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Estimated completion</div>
                  <div className="text-md font-bold text-white mt-0.5">8 Days (June 8)</div>
                </div>
                <Button 
                  onClick={() => navigate(`/chapter/physics-ch-3`)}
                  className="rounded-xl bg-accent text-primary hover:bg-accent/90 font-bold text-xs px-4"
                >
                  Start Chapter <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ════════════════ TWO COLUMN LAYOUT ════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ─── LEFT COLUMN (Today's Study Plan, Continue, Tests) ─── */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 5. TODAY'S STUDY PLAN */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-white">Today's Study Plan</h3>
                      <p className="text-xs text-white/40">Complete these structured daily tasks to hit your weekly target.</p>
                    </div>
                  </div>
                  <span className="text-xs text-accent font-bold bg-accent/10 border border-accent/20 rounded-lg px-2.5 py-1">
                    {checklist.filter(c => c.done).length}/{checklist.length} Completed
                  </span>
                </div>

                {/* Checklist targets */}
                <div className="space-y-3">
                  {checklist.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                        item.done 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-white/60' 
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white'
                      }`}
                    >
                      <div className="pt-0.5">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          item.done 
                          ? 'bg-emerald-500 border-emerald-400 text-white' 
                          : 'border-white/20 hover:border-accent'
                        }`}>
                          {item.done && <span className="text-xs font-black">✓</span>}
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <p className={`text-sm font-semibold ${item.done ? 'line-through text-white/40' : ''}`}>{item.text}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            item.type === 'lecture' ? 'bg-blue-500/10 text-blue-400' :
                            item.type === 'practice' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.type === 'lecture' ? '45m' : item.type === 'practice' ? '30m' : '15m'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-white/10 shrink-0 self-center" />
                    </div>
                  ))}
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Legacy assigned homework integration */}
                <AssignedContent />
              </div>

              {/* 6. CONTINUE LEARNING */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-6 space-y-4">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Play className="w-4.5 h-4.5 text-blue-400" /> Continue Learning
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => navigate('/chapter/physics-ch-3/notes')}
                    className="bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Physics notes</p>
                      <p className="text-sm font-bold text-white truncate">Friction Short Notes</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Resumed 12 mins ago</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-all shrink-0" />
                  </div>

                  <div 
                    onClick={() => navigate('/lecture-prepentrance')}
                    className="bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Video Lecture</p>
                      <p className="text-sm font-bold text-white truncate">Newton's Laws Video L2</p>
                      <p className="text-[10px] text-white/30 mt-0.5">70% Completed • Physics</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-all shrink-0" />
                  </div>
                </div>
              </div>

              {/* 7. UPCOMING TESTS */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-4.5 h-4.5 text-purple-400" /> Upcoming Scheduled Tests
                  </h3>
                  <span className="text-xs text-purple-400 font-bold">1 Test Scheduled</span>
                </div>

                <div 
                  onClick={() => navigate('/test')}
                  className="bg-gradient-to-br from-[#120F1C] to-[#0A0812] border border-purple-500/10 hover:border-purple-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Major Test Series</span>
                        <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 rounded font-black px-1 py-0.5 tracking-wider uppercase animate-pulse">AITS</span>
                      </div>
                      <h4 className="text-md font-extrabold text-white mt-1 group-hover:text-purple-300 transition-colors">JEE Main Full Mock Syllabus Test - 1</h4>
                      <p className="text-xs text-white/40 mt-0.5">300 Marks | 3 Hours | Physics, Chemistry, Maths</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/[0.06] pt-3 sm:pt-0">
                    <div>
                      <p className="text-[9px] text-white/30 uppercase tracking-wider font-bold text-right">Starts in</p>
                      <p className="text-sm font-black text-amber-400 text-right">2 Days, 4 Hours</p>
                    </div>
                    <Button 
                      size="sm"
                      className="rounded-lg bg-purple-600 text-white hover:bg-purple-500 font-bold text-xs"
                    >
                      Syllabus
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* ─── RIGHT COLUMN (Revision Queue, Weak, Insights, Trends) ─── */}
            <div className="lg:col-span-4 space-y-6">

              {/* 8. REVISION QUEUE */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" /> Spaced Revision Queue
                </h3>
                
                <div className="space-y-2">
                  {[
                    { topic: 'Units & Dimensions', subject: 'Physics', decay: 'Practice due in 1 day', status: 'high' },
                    { topic: 'Basic Mathematics & Vectors', subject: 'Physics', decay: 'Decaying (Practiced 14d ago)', status: 'medium' }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate('/revision')}
                      className="bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40">{item.subject}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                        </div>
                        <p className="text-sm font-bold text-white truncate mt-0.5">{item.topic}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{item.decay}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 9. WEAK TOPICS */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Action Required: Weak Topics
                </h3>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  These topics have accuracy scores below 60%. Strengthen them through targeted practice.
                </p>

                <div className="space-y-2">
                  {[
                    { topic: 'Vector Addition', subject: 'Physics', accuracy: 52 },
                    { topic: 'Mole Concept stoichiometry', subject: 'Chemistry', accuracy: 48 }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate('/practice')}
                      className="bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] rounded-xl p-3 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-white/35 font-bold uppercase">{item.subject}</span>
                        <p className="text-xs font-bold text-white truncate mt-0.5">{item.topic}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-red-400">{item.accuracy}%</p>
                        <p className="text-[8px] text-white/30 uppercase tracking-wider font-semibold">Accuracy</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 10. PERFORMANCE INSIGHTS (COACH'S NOTES) */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" /> Performance Insights
                </h3>

                <div className="space-y-4">
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-extrabold uppercase px-1.5 py-0.5 rounded">Mechanics</span>
                      <span className="text-[10px] text-white/40 font-semibold">2 hours ago</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-medium">
                      Your Mechanics accuracy dropped from <span className="text-red-400 font-bold">74%</span> to <span className="text-red-400 font-bold">61%</span>. We highly recommend reviewing **Friction** before the upcoming scheduled test on Sunday.
                    </p>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold uppercase px-1.5 py-0.5 rounded">Chemistry Consistency</span>
                      <span className="text-[10px] text-white/40 font-semibold">Yesterday</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-medium">
                      Physical Chemistry consistency index is outstanding! Your Organic Chemistry accuracy is up by **8%** this week. Keep up the momentum!
                    </p>
                  </div>
                </div>
              </div>

              {/* 11. ACCURACY TRENDS */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" /> 15-Day Accuracy Trends
                </h3>
                
                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          borderColor: 'rgba(255,255,255,0.1)', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="accuracy" 
                        name="Accuracy %"
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorAccuracy)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 12. BATCH ANNOUNCEMENTS */}
              <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-orange-400" /> Batch Announcements
                </h3>

                <div className="space-y-3">
                  <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-orange-400 font-bold uppercase">Class Teacher</span>
                      <span className="text-[9px] text-white/30">May 29</span>
                    </div>
                    <p className="text-xs font-bold text-white">Laws of Motion DPP 1 solutions uploaded</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Written solutions and explanation files are uploaded. Open Practice menu to view.
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-indigo-400 font-bold uppercase">Administration</span>
                      <span className="text-[9px] text-white/30">May 28</span>
                    </div>
                    <p className="text-xs font-bold text-white">Sunday Major Mock Test rescheduled</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Please note: Sunday mock test will start at 10:00 AM instead of 9:00 AM due to maintenance.
                    </p>
                  </div>
                </div>
              </div>

              {/* 13. MENTOR ACCESS CARD (SECONDARY) */}
              <div 
                onClick={() => navigate('/ask-prepentrance')}
                className="rounded-3xl border border-white/[0.06] bg-card p-5 flex items-center justify-between gap-4 hover:border-accent/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white">Need Guidance? Talk to Mentor</h4>
                    <p className="text-[10px] text-white/40 truncate">Clear doubts, request planner customization, or ask advice.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 shrink-0 transition-transform" />
              </div>

            </div>

          </div>

        </div>
      </div>
    </MainLayout>
  );
}
