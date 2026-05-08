import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Flame, Target, BarChart3, Trophy, Play, ArrowRight,
  CalendarDays, ChevronRight, Zap, Eye, TrendingUp, Users,
  Clock, Sparkles, BookOpen, Loader2, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useStudentStats } from '@/hooks/useStudentStats';
import { useBatchInfo } from '@/hooks/useBatchInfo';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { AssignedContent } from '@/components/student/AssignedContent';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────
function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-white/25">{label}</p>
        <p className="text-lg font-black text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────
const StudentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { examMode } = useExamMode();

  const { streak, todayDone, accuracy, loading: statsLoading } = useStudentStats();
  const { info: batch, loading: batchLoading } = useBatchInfo();

  const [mentorName, setMentorName] = useState('');
  const [todayFocus, setTodayFocus] = useState<{ topic: string; description: string; time: string } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // ── Data Fetch ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setPageLoading(true);
    try {
      // Refresh profile to pick up teacher_id after batch join
      const { data: latest } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      const currentProfile = latest ?? profile;

      // Mentor name
      if (currentProfile?.teacher_id) {
        const { data: mentor } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', currentProfile.teacher_id)
          .maybeSingle();
        if (mentor?.full_name) setMentorName(mentor.full_name);
      }

      // Today's teacher-assigned task
      if (currentProfile?.teacher_id) {
        const { data: tasks } = await supabase
          .from('teacher_tasks' as any)
          .select('*, learning_nodes(name)')
          .eq('teacher_id', currentProfile.teacher_id)
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

  // ── Exam Data ─────────────────────────────────────────────────
  const examData = useMemo(() => {
    if (examMode === 'neet') return { name: 'NEET UG 2026', date: '3 May 2026', target: '2026-05-03', advice: 'NCERT Biology is king. Daily Physics practice is non-negotiable.' };
    if (examMode === 'cuet') return { name: 'CUET UG 2026', date: '11 May 2026', target: '2026-05-11', advice: 'Domain subjects + NCERT. Don\'t skip General Test reasoning.' };
    return { name: 'JEE Advanced 2026', date: '24 May 2026', target: '2026-05-24', advice: 'Concepts over shortcuts. Advanced problems every day, no exceptions.' };
  }, [examMode]);

  const daysLeft = daysUntil(examData.target);

  // ── Loading State ─────────────────────────────────────────────
  if (pageLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student';
  const greeting = mentorName
    ? `${mentorName}'s Classroom`
    : profile?.teacher_id
    ? 'Your Classroom'
    : 'Your Dashboard';

  return (
    <MainLayout>
      <div className="min-h-screen pb-28 pt-20 lg:pt-24" style={{ background: '#06080D' }}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">

          {/* ── ZONE 1: HERO ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {/* Pill badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 w-fit mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Active Learning</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Welcome back, <span className="text-accent">{firstName}</span> 👋
                </h1>
                <p className="text-white/40 text-sm font-medium mt-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0 text-white/30" />
                  {greeting}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-3">
                <StatPill icon={Flame} label="Streak" value={`${streak}d`} color="bg-orange-500/10 text-orange-400" />
                <StatPill icon={Target} label="Today" value={`${todayDone} Qs`} color="bg-blue-500/10 text-blue-400" />
                <StatPill icon={BarChart3} label="Accuracy" value={`${accuracy}%`} color="bg-emerald-500/10 text-emerald-400" />
                {batch && (
                  <StatPill icon={Users} label="Batch" value={`${batch.totalStudents} students`} color="bg-purple-500/10 text-purple-400" />
                )}
              </div>
            </div>
          </motion.div>

          {/* ── ZONE 2+3: MAIN GRID ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT COLUMN ─────────────────────────────────────── */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Today's Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-[2rem] overflow-hidden border border-white/[0.07] group hover:border-accent/30 transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, #0D1422 0%, #0A1018 50%, #080D14 100%)',
                }}
              >
                {/* Glow orb */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 p-8 lg:p-10">
                  {/* Section label */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Today's Mission</span>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                    <div className="flex-1 space-y-4">
                      {todayFocus ? (
                        <>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                              Assigned by your mentor
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white mt-3 group-hover:text-accent transition-colors duration-500">
                              {todayFocus.topic}
                            </h2>
                          </div>
                          <p className="text-white/50 text-sm leading-relaxed font-medium max-w-xl">
                            {todayFocus.description}
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-1.5 text-white/30">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold uppercase tracking-widest">Suggested: {todayFocus.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/30">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold uppercase tracking-widest">Mentor tracking</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white group-hover:text-accent transition-colors duration-500">
                            Start Your Daily Practice
                          </h2>
                          <p className="text-white/40 text-sm leading-relaxed max-w-xl">
                            No specific topic assigned today. Practice any subject to keep your streak alive and improve your accuracy.
                          </p>
                        </>
                      )}

                      {/* Impact line */}
                      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent/5 border border-accent/15 w-fit mt-2">
                        <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0" />
                        <p className="text-white/60 text-xs font-medium">
                          {streak > 0
                            ? `${streak}-day streak! Keep the momentum going 🔥`
                            : 'Start today to build your streak!'}
                        </p>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3 min-w-[220px] w-full lg:w-auto">
                      <Button
                        onClick={() => navigate('/practice')}
                        className="h-14 rounded-2xl bg-accent text-primary hover:bg-accent/90 font-black text-base gap-2.5 shadow-xl shadow-accent/25 transition-all duration-300 hover:scale-[1.02] w-full"
                      >
                        <Play className="fill-current w-4 h-4" />
                        Start Practice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/learn')}
                        className="h-12 rounded-2xl border-white/10 hover:bg-white/5 text-white font-bold text-sm w-full"
                      >
                        Browse Syllabus
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Assigned Content — Tests + Materials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AssignedContent />
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN: QUICK ACTIONS & LEADERBOARD ────────────────────────── */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* Leaderboard Widget */}
              {batch && batch.dailyLeaderboard && batch.dailyLeaderboard.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card/40 backdrop-blur-sm border border-white/10 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Today's Leaders
                  </h3>
                  <div className="space-y-3">
                    {batch.dailyLeaderboard.map((student, idx) => (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
                          idx === 2 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/30' :
                          'bg-white/5 text-white/50 border border-white/10'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${student.id === user?.id ? 'text-accent' : 'text-white'}`}>
                            {student.id === user?.id ? 'You' : student.name}
                          </p>
                        </div>
                        <div className="text-xs font-bold text-white/70 bg-white/10 px-2 py-1 rounded-md">
                          {student.questions} Qs
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Exam Countdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-[2rem] border border-white/[0.07] p-7 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300"
                style={{ background: 'linear-gradient(160deg, #0E1520 0%, #090F1A 100%)' }}
              >
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-1">Days Left</p>
                    <p className="text-5xl font-black text-orange-400/80 leading-none">{daysLeft}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-1">Upcoming Exam</p>
                    <h3 className="text-xl font-black text-white">{examData.name}</h3>
                    <p className="text-xs text-white/35 mt-0.5">{examData.date}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <p className="text-[11px] leading-relaxed text-orange-200/50 italic font-medium">
                      "{examData.advice}"
                    </p>
                  </div>

                  {/* Urgency bar */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[9px] text-white/25 font-bold uppercase tracking-wider">Time remaining</span>
                      <span className="text-[9px] text-white/25 font-bold uppercase tracking-wider">{daysLeft} / 365 days</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (daysLeft / 365) * 100)}%`,
                          background: daysLeft < 15
                            ? 'linear-gradient(90deg, #EF4444, #F87171)'
                            : daysLeft < 60
                            ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                            : 'linear-gradient(90deg, #10B981, #34D399)',
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => navigate('/practice')}
                    className="w-full h-11 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-widest mt-1"
                  >
                    Prepare Now <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>

              {/* My Batch Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-[2rem] border border-white/[0.07] overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #0D1422 0%, #080E18 100%)' }}
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.05] flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">My Batch</p>
                    {batchLoading ? (
                      <div className="h-4 w-28 bg-white/[0.05] rounded animate-pulse mt-1" />
                    ) : (
                      <h3 className="text-base font-black text-white mt-0.5">{batch?.batchName ?? 'Your Batch'}</h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400">Live</span>
                  </div>
                </div>

                {/* Mentor row */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-white/[0.05]">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(batch?.mentorName ?? 'Mentor')}&backgroundColor=1e293b`}
                      alt="Mentor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {batchLoading ? (
                      <>
                        <div className="h-3 w-24 bg-white/[0.05] rounded animate-pulse mb-1.5" />
                        <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
                      </>
                    ) : (
                      <>
                        <p className="text-white font-semibold text-sm truncate">{batch?.mentorName ?? 'Your Mentor'}</p>
                        <p className="text-white/35 text-[11px] truncate">Batch Mentor</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-1 rounded-lg shrink-0">
                    <Eye className="w-3 h-3" />
                    Watching
                  </div>
                </div>

                {/* Batch Stats */}
                <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                  {[
                    { label: 'Students', value: batchLoading ? null : batch?.totalStudents ?? 0, color: '#60A5FA' },
                    { label: 'Active Today', value: batchLoading ? null : batch?.practicingToday ?? 0, color: '#10B981' },
                    {
                      label: 'Total Qs',
                      value: batchLoading ? null : batch?.totalQuestionsAttempted ?? 0,
                      fmt: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v),
                      color: '#A78BFA',
                    },
                  ].map(({ label, value, color, fmt }: any) => (
                    <div key={label} className="px-4 py-4 text-center">
                      <p className="text-[9px] font-black uppercase tracking-wider text-white/25 mb-2">{label}</p>
                      {value === null ? (
                        <div className="h-7 w-10 mx-auto bg-white/[0.05] rounded animate-pulse" />
                      ) : (
                        <p className="font-black text-2xl leading-none" style={{ color }}>
                          {fmt ? fmt(value) : value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer CTA */}
                <div className="px-6 pb-6 pt-3">
                  <button
                    onClick={() => navigate('/my-batch')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors border border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03]"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Full Analytics Report
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-[2rem] border border-white/[0.07] p-6"
                style={{ background: 'linear-gradient(160deg, #0D1422 0%, #080E18 100%)' }}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-4">Quick Actions</p>
                <div className="space-y-2.5">
                  {[
                    { icon: BookOpen, label: 'Study Notes', sub: 'Chapter summaries', path: '/learn', color: 'text-blue-400 bg-blue-500/10' },
                    { icon: CalendarDays, label: 'Full Analytics', sub: 'My batch report', path: '/my-batch', color: 'text-purple-400 bg-purple-500/10' },
                    { icon: Users, label: 'Batch Commune', sub: 'Live group study', path: '/batch-commune', color: 'text-emerald-400 bg-emerald-500/10' },
                    { icon: Flame, label: 'SOS Help', sub: 'Ping batch for help', onClick: async () => {
                      if (!batch) return toast.error("You need a batch to send an SOS!");
                      toast.promise(
                        (async () => {
                          const { data: room } = await supabase.from('commune_rooms').select('id').eq('title', `BATCH_${batch.batchId}`).maybeSingle();
                          if (!room?.id) throw new Error("Batch room not initialized yet. Open Batch Commune first.");
                          
                          const { error } = await supabase.from('commune_messages').insert({
                            room_id: room.id,
                            user_id: user?.id,
                            user_name: profile?.full_name || 'Student',
                            category: 'SOS',
                            content: 'I need help with my practice questions!'
                          });
                          if (error) throw error;
                        })(),
                        {
                          loading: 'Sending SOS...',
                          success: 'SOS sent to Batch Commune! 🚨',
                          error: (err) => err.message || 'Failed to send SOS'
                        }
                      );
                    }, color: 'text-rose-400 bg-rose-500/10' },
                    { icon: Sparkles, label: 'AI Teachers', sub: 'Live AI sessions', path: '/ai-teachers', color: 'text-accent bg-accent/10' },
                  ].map(({ icon: Icon, label, sub, path, color, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick ? onClick : () => navigate(path!)}
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200 text-left group"
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{label}</p>
                        <p className="text-white/30 text-xs">{sub}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                    </button>
                  ))}
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
