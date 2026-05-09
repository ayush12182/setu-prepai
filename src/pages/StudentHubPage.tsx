import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Play, BookOpen, PenTool, ClipboardCheck, MessageCircle, BarChart3,
  ChevronRight, Zap, Target, Flame, Users, CalendarDays, Eye, Sparkles,
  TrendingUp, AlertTriangle, Activity, Loader2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useStudentStats } from '@/hooks/useStudentStats';
import { useBatchInfo } from '@/hooks/useBatchInfo';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { AssignedContent } from '@/components/student/AssignedContent';
import { toast } from 'sonner';

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function StudentHubPage() {
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
      const { data: latest } = await supabase.from('profiles').select('*').eq('user_id', user!.id).maybeSingle();
      const currentProfile = latest ?? profile;

      if (currentProfile?.teacher_id) {
        const { data: mentor } = await supabase.from('profiles').select('full_name').eq('user_id', currentProfile.teacher_id).maybeSingle();
        if (mentor?.full_name) setMentorName(mentor.full_name);

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

  if (pageLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const batchName = batch?.batchName || 'Foundation Batch 2025';

  return (
    <MainLayout>
      <div className="min-h-screen pb-28 pt-8" style={{ background: '#06080D' }}>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
          
          {/* ── PW-STYLE HERO BANNER ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-2xl overflow-hidden relative mb-8"
            style={{
              background: 'linear-gradient(135deg, #111A28 0%, #0A1018 100%)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {/* Subtle background waves/texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(255,155,84,0.1) 0%, transparent 50%), radial-gradient(circle at 0% 0%, rgba(59,130,246,0.1) 0%, transparent 50%)'
            }} />
            
            <div className="px-8 py-10 relative z-10 flex flex-col justify-center min-h-[160px]">
              <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-2">Your Batch</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight flex items-center gap-3 cursor-pointer group">
                  {batchName}
                  <ChevronRight className="w-6 h-6 text-white/30 group-hover:text-white transition-colors mt-1" />
                </h1>
              </div>
            </div>
          </motion.div>

          {/* ── BATCH OFFERINGS (QUICK LINKS) ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-lg font-bold text-white mb-4">Batch Offerings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'All Classes', icon: BookOpen, path: '/learn', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { label: 'All Tests', icon: ClipboardCheck, path: '/test', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                { label: 'My Doubts', icon: MessageCircle, path: '/ask-jeetu', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              ].map(item => (
                <div 
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-white/90 group-hover:text-white">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── UPCOMING EVENTS & DASHBOARD ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-white mb-4">Upcoming Events</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Main Tasks */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Today's Mission Card */}
                <div className="rounded-[1.5rem] overflow-hidden border border-white/[0.07] bg-card p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Today's Focus</span>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                    <div className="flex-1 space-y-3">
                      {todayFocus ? (
                        <>
                          <h3 className="text-2xl font-bold text-white tracking-tight">{todayFocus.topic}</h3>
                          <p className="text-white/50 text-sm leading-relaxed max-w-lg">{todayFocus.description}</p>
                          <div className="flex items-center gap-3 text-white/30 pt-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{todayFocus.time}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold text-white tracking-tight">Mixed Adaptive Practice</h3>
                          <p className="text-white/50 text-sm leading-relaxed max-w-lg">No specific topic assigned today. Let's practice mixed concepts to improve accuracy.</p>
                        </>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate('/practice')}
                      className="h-12 px-8 rounded-xl bg-accent text-primary hover:bg-accent/90 font-bold text-sm shadow-xl shadow-accent/20 w-full lg:w-auto"
                    >
                      Start Practicing
                    </Button>
                  </div>
                </div>

                {/* Assigned Content */}
                <AssignedContent />
              </div>

              {/* RIGHT COLUMN: Stats & Tools */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Student Stats Mini-Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Flame className="w-5 h-5 text-orange-400 mb-2" />
                    <p className="text-xl font-black text-white leading-none">{streak}d</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Streak</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <BarChart3 className="w-5 h-5 text-emerald-400 mb-2" />
                    <p className="text-xl font-black text-white leading-none">{accuracy}%</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Accuracy</p>
                  </div>
                </div>

                {/* Live Leaderboard Snippet */}
                {batch?.dailyLeaderboard && batch.dailyLeaderboard.length > 0 && (
                  <div className="bg-card border border-white/[0.05] rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-yellow-400" /> Leaderboard
                    </h3>
                    <div className="space-y-2">
                      {batch.dailyLeaderboard.slice(0, 3).map((student, idx) => (
                        <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                          <span className={`text-xs font-black ${idx === 0 ? 'text-yellow-400' : 'text-white/30'}`}>#{idx + 1}</span>
                          <span className={`text-sm font-medium flex-1 truncate ${student.id === user?.id ? 'text-accent' : 'text-white/70'}`}>
                            {student.id === user?.id ? 'You' : student.name}
                          </span>
                          <span className="text-xs text-white/40">{student.questions} Qs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Extra Tools List */}
                <div className="bg-card border border-white/[0.05] rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Explore More</p>
                  <div className="space-y-1">
                    {[
                      { icon: Users, label: 'Batch Commune', path: '/batch-commune' },
                      { icon: Sparkles, label: 'AI Teachers', path: '/ai-teachers' },
                      { icon: BarChart3, label: 'Full Analytics', path: '/analytics' },
                    ].map(link => (
                      <div 
                        key={link.label}
                        onClick={() => navigate(link.path)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <link.icon className="w-4 h-4 text-white/40 group-hover:text-accent transition-colors" />
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{link.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </MainLayout>
  );
}
