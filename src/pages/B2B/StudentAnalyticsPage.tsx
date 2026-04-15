import React, { useState, useEffect, useRef } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Target, Brain, TrendingDown, Flame, Clock, BarChart3,
  AlertTriangle, CheckCircle2, Loader2, RefreshCw, RotateCcw, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudentAnalytics {
  studentId: string;
  name: string;
  today: number;
  week: number;
  allTime: number;
  accuracy: number;
  avgTime: number;
  weakTopics: { topic: string; accuracy: number }[];
  subjectAccuracy: { subject: string; accuracy: number; attempts: number }[];
  variantTriggers: { topic: string; subtopic: string; count: number }[];
}

// ─── Color helpers ────────────────────────────────────────────
const accuracyColor = (acc: number) =>
  acc >= 70 ? 'text-emerald-400' :
  acc >= 45 ? 'text-amber-400' :
  'text-red-400';

const accuracyBg = (acc: number) =>
  acc >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' :
  acc >= 45 ? 'bg-amber-500/10 border-amber-500/20' :
  'bg-red-500/10 border-red-500/20';

export default function StudentAnalyticsPage() {
  const { profile, user } = useAuth();
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);
  const [realtimeEvents, setRealtimeEvents] = useState<string[]>([]);
  const channelRef = useRef<any>(null);

  // ── Fetch all linked students ──────────────────────────────
  const fetchStudents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get linked students via student_teacher_links
      const { data: links } = await (supabase as any)
        .from('student_teacher_links')
        .select('student_id')
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      if (!links?.length) { setLoading(false); return; }

      const ids: string[] = links.map((l: any) => l.student_id);

      // Get profiles
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', ids);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { nameMap[p.user_id] = p.full_name || 'Unknown'; });

      // Get analytics for each student via RPC
      const analyticsArr: StudentAnalytics[] = await Promise.all(
        ids.map(async (studentId) => {
          const { data: rpcData } = await (supabase as any)
            .rpc('get_student_analytics', { p_teacher_id: user.id, p_student_id: studentId });

          const d = rpcData || {};
          return {
            studentId,
            name: nameMap[studentId] || 'Unknown',
            today:    d.today    ?? 0,
            week:     d.week     ?? 0,
            allTime:  d.allTime  ?? 0,
            accuracy: d.accuracy ?? 0,
            avgTime:  d.avgTime  ?? 0,
            weakTopics:      d.weakTopics      || [],
            subjectAccuracy: d.subjectAccuracy || [],
            variantTriggers: d.variantTriggers || [],
          };
        })
      );

      setStudents(analyticsArr.sort((a, b) => b.allTime - a.allTime));
      if (analyticsArr.length > 0 && !selectedStudent) {
        setSelectedStudent(analyticsArr[0]);
      }
    } catch (e) {
      console.error('Failed to fetch student analytics', e);
    }
    setLoading(false);
  };

  // ── Setup Realtime subscription ────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchStudents();

    channelRef.current = supabase
      .channel('teacher-student-attempts')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'student_question_attempts' },
        (payload: any) => {
          const r = payload.new;
          const msg = `📝 ${r.subject || '—'} · ${r.topic || '—'} · ${r.is_correct ? '✅' : '❌'}`;
          setRealtimeEvents(prev => [msg, ...prev.slice(0, 9)]);
          // Refresh analytics silently
          fetchStudents();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user]);

  const sel = selectedStudent;

  return (
    <B2BSidebarLayout title="Student Analytics">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Student Analytics</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Real-time practice performance across all linked students.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStudents} className="gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>

        {/* Realtime feed */}
        {realtimeEvents.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Activity
            </p>
            <div className="space-y-1">
              {realtimeEvents.map((msg, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-muted-foreground">
                  {msg}
                </motion.p>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={28} />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <Users size={40} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Students Yet</h2>
            <p className="text-muted-foreground text-sm">Share your teacher code to get students linked to your dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Student list */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Students ({students.length})</p>
              {students.map(s => (
                <button
                  key={s.studentId}
                  onClick={() => setSelectedStudent(s)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all",
                    sel?.studentId === s.studentId
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30 bg-card"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm">{s.name}</p>
                    <span className={cn("text-xs font-black", accuracyColor(s.accuracy))}>
                      {s.accuracy}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Today: {s.today}</span>
                    <span>Week: {s.week}</span>
                    <span>All: {s.allTime}</span>
                  </div>
                  {/* Mini accuracy bar */}
                  <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", s.accuracy >= 70 ? "bg-emerald-500" : s.accuracy >= 45 ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-2 space-y-5">
              {!sel ? (
                <div className="border border-dashed border-border rounded-3xl p-12 text-center text-muted-foreground">
                  Select a student to view analytics
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Today', value: sel.today, icon: Zap, color: 'text-blue-400' },
                      { label: 'This Week', value: sel.week, icon: Flame, color: 'text-orange-400' },
                      { label: 'All Time', value: sel.allTime, icon: Brain, color: 'text-violet-400' },
                      { label: 'Accuracy', value: `${sel.accuracy}%`, icon: Target, color: accuracyColor(sel.accuracy) },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="bg-card border border-border rounded-2xl p-4">
                        <Icon size={16} className={cn("mb-2", color)} />
                        <p className={cn("text-2xl font-bold", color)}>{value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Subject Accuracy Chart */}
                  {sel.subjectAccuracy.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <BarChart3 size={15} className="text-accent" /> Accuracy by Subject
                      </h3>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={sel.subjectAccuracy} barSize={24}>
                          <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                          <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                          <Bar dataKey="accuracy" fill="hsl(var(--accent))" radius={[6,6,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Weak Topics */}
                  {sel.weakTopics.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <AlertTriangle size={15} className="text-red-400" /> Struggling Topics (Accuracy &lt; 50%)
                      </h3>
                      <div className="space-y-2">
                        {sel.weakTopics.map((wt, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{wt.topic}</p>
                            </div>
                            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: `${wt.accuracy}%` }} />
                            </div>
                            <span className="text-xs font-bold text-red-400 w-10 text-right">{wt.accuracy}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Variant triggers = weak spots */}
                  {sel.variantTriggers.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <RotateCcw size={15} className="text-amber-400" /> Variant Hotspots (Weak Concepts)
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        These are the sub-topics that triggered the most variant regenerations — i.e., {sel.name.split(' ')[0]} struggled here repeatedly.
                      </p>
                      <div className="space-y-2">
                        {sel.variantTriggers.map((vt, i) => (
                          <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border", accuracyBg(30))}>
                            <div>
                              <p className="text-sm font-semibold">{vt.subtopic}</p>
                              <p className="text-xs text-muted-foreground">{vt.topic}</p>
                            </div>
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                              {vt.count}× retried
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Avg time stat */}
                  <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Clock size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average time per question</p>
                      <p className="text-xl font-bold">{sel.avgTime}s</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {sel.avgTime < 30 ? '⚡ Very fast' : sel.avgTime < 90 ? '✅ Optimal' : '🐢 Spending too long'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </B2BSidebarLayout>
  );
}
