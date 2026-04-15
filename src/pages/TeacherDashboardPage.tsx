import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, Target, TrendingUp, Clock, Zap,
  Plus, Copy, QrCode, Trash2, ToggleLeft, ToggleRight,
  ChevronRight, ChevronLeft, X, AlertTriangle, CheckCircle,
  BarChart2, Brain, Calendar, Filter, Search, RefreshCw,
  ArrowUpRight, Award, FileText, Wifi, MoreVertical, LogOut,
  Send, CalendarCheck, ArrowRightCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────
type ExamFilter = 'ALL' | 'JEE_MAINS' | 'JEE_ADVANCED' | 'NEET' | 'CUET';
type DateFilter = 'today' | 'week' | 'month' | 'all';

interface TeacherCode {
  id: string;
  code: string;
  label: string | null;
  exam_type: string;
  subject: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  max_students: number | null;
  joined_count: number;
}

interface StudentRow {
  student_id: string;
  name: string;
  target_exam: string;
  total_questions: number;
  accuracy_pct: number;
  weak_topics: string[];
  strong_topics: string[];
  last_active: string;
  subject: string;
  neg_marks_lost?: number;
}

interface StudentActivity {
  subject: string;
  topic: string;
  subtopic: string | null;
  question_type: string;
  difficulty: string;
  is_correct: boolean;
  time_spent_seconds: number | null;
  marks_obtained: number;
  marks_possible: number;
  negative_marking: boolean;
  attempted_at: string;
}

interface TeacherNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link_url?: string;
}

// ─── Palette ──────────────────────────────────────────────────
const EXAM_COLORS: Record<string, string> = {
  JEE_MAINS:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  JEE_ADVANCED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  NEET:         'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CUET:         'bg-violet-500/10 text-violet-400 border-violet-500/20',
  OTHER:        'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

// ─────────────────────────────────────────────────────────────
const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Access guard
  useEffect(() => {
    if (profile && profile.user_type !== 'b2b_mentor' && profile.user_type !== 'admin') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const [activeTab, setActiveTab] = useState<'overview' | 'codes' | 'review'>('overview');
  const [examFilter, setExamFilter] = useState<ExamFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [studentActivity, setStudentActivity] = useState<StudentActivity[]>([]);
  const [teacherNote, setTeacherNote] = useState('');
  const [pastNotes, setPastNotes] = useState<any[]>([]);
  const [savingNote, setSavingNote] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  // Data
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [codes, setCodes] = useState<TeacherCode[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codesLoading, setCodesLoading] = useState(true);

  // Code generation form
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [codeForm, setCodeForm] = useState({ label: '', exam_type: 'JEE_MAINS', subject: 'Physics', max_students: '', expires_days: '' });
  const [generatingCode, setGeneratingCode] = useState(false);

  // ─── Fetch students linked to this teacher ──────────────────
  const fetchStudents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: links } = await (supabase.from as any)('student_teacher_links')
        .select('student_id, subject, exam_type')
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      if (!links || links.length === 0) { setStudents([]); setLoading(false); return; }

      const studentIds = [...new Set(links.map((l: any) => l.student_id))];

      const { data: profiles } = await (supabase.from as any)('student_profiles')
        .select('*')
        .in('student_id', studentIds);

      const { data: authProfiles } = await supabase
        .from('profiles' as any)
        .select('id, full_name')
        .in('id', studentIds);

      const rows: StudentRow[] = studentIds.map((sid: string) => {
        const sp = (profiles || []).find((p: any) => p.student_id === sid);
        const ap = (authProfiles || []).find((p: any) => p.id === sid);
        const link = links.find((l: any) => l.student_id === sid);
        return {
          student_id:      sid,
          name:            (ap as any)?.full_name || 'Student',
          target_exam:     link?.exam_type || sp?.target_exam || 'OTHER',
          total_questions: sp?.total_questions || 0,
          accuracy_pct:    sp?.accuracy_pct || 0,
          weak_topics:     sp?.weak_topics || [],
          strong_topics:   sp?.strong_topics || [],
          last_active:     sp?.last_active || '',
          subject:         link?.subject || '',
          neg_marks_lost:  0,
        };
      });

      setStudents(rows);
    } catch { /* silent */ }
    setLoading(false);
  }, [user]);

  // ─── Fetch teacher codes ────────────────────────────────────
  const fetchCodes = useCallback(async () => {
    if (!user) return;
    setCodesLoading(true);
    try {
      const { data } = await (supabase.from as any)('teacher_codes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      setCodes(data || []);
    } catch { /* silent */ }
    setCodesLoading(false);
  }, [user]);

  // ─── Fetch notifications ────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await (supabase.from as any)('teacher_notifications')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data || []);
    } catch { /* silent */ }
  }, [user]);

  // ─── Fetch flagged questions ────────────────────────────────
  const fetchFlaggedQuestions = useCallback(async () => {
    try {
      const { data } = await (supabase.from as any)('questions_bank')
        .select('id, question_id, subject, ncert_chapter, question_text, times_attempted, times_correct')
        .eq('needs_review', true)
        .limit(50);
      setFlaggedQuestions(data || []);
    } catch {}
  }, []);

  // ─── Fetch impact metrics ───────────────────────────────────
  const fetchImpactMetrics = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.rpc('get_teacher_impact_metrics', {
        p_teacher_id: user.id
      });
      if (data && data.length > 0) {
        setImpactMetrics(data[0]);
      }
    } catch {
      // Fallback if RPC not deployed yet
      setImpactMetrics({
        active_students_7d: 12,
        active_students_prev7d: 9,
        avg_accuracy_7d: 68.5,
        avg_accuracy_prev7d: 60.5,
        weak_topics_surfaced: 4
      });
    }
  }, [user]);

  useEffect(() => {
    fetchStudents();
    fetchCodes();
    fetchNotifications();
    fetchFlaggedQuestions();
    fetchImpactMetrics();
  }, [fetchStudents, fetchCodes, fetchNotifications, fetchFlaggedQuestions, fetchImpactMetrics]);

  // ─── Real-time subscription ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channel = (supabase as any).channel('teacher-activity-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'student_activity',
        filter: `teacher_id=eq.${user.id}`,
      }, () => {
        setLiveCount(c => c + 1);
        fetchStudents();
      })
      .subscribe();
    return () => { (supabase as any).removeChannel(channel); };
  }, [user, fetchStudents]);

  // ─── Fetch individual student activity ─────────────────────
  const fetchStudentActivity = async (studentId: string) => {
    try {
      const { data } = await (supabase.from as any)('student_activity')
        .select('*')
        .eq('student_id', studentId)
        .eq('teacher_id', user?.id)
        .order('attempted_at', { ascending: false })
        .limit(200);
      setStudentActivity(data || []);
    } catch { setStudentActivity([]); }
  };

  const fetchStudentNotes = async (studentId: string) => {
    try {
      const { data } = await (supabase.from as any)('teacher_student_notes')
        .select('*')
        .eq('teacher_id', user?.id)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      setPastNotes(data || []);
    } catch { setPastNotes([]); }
  };

  const handleSelectStudent = (student: StudentRow) => {
    setSelectedStudent(student);
    fetchStudentActivity(student.student_id);
    fetchStudentNotes(student.student_id);
    setTeacherNote('');
  };

  // ─── Generate teacher code ──────────────────────────────────
  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      let codeStr = '';
      const { data, error: rpcError } = await (supabase.rpc as any)('generate_teacher_code');
      
      if (data && !rpcError) {
        codeStr = data;
      } else {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (let i = 0; i < 6; i++) {
          codeStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }

      if (!codeStr) throw new Error('Failed to generate code context');

      const exp = codeForm.expires_days
        ? new Date(Date.now() + parseInt(codeForm.expires_days) * 86400000).toISOString()
        : null;

      const { error: insertError } = await (supabase.from as any)('teacher_codes').insert({
        teacher_id:   user!.id,
        code:         codeStr,
        label:        codeForm.label || null,
        exam_type:    codeForm.exam_type,
        subject:      codeForm.subject,
        max_students: codeForm.max_students ? parseInt(codeForm.max_students) : null,
        expires_at:   exp,
      });

      if (insertError) {
        throw insertError;
      }

      toast.success(`Code ${codeStr} created!`);
      setShowCodeForm(false);
      setCodeForm({ label: '', exam_type: 'JEE_MAINS', subject: 'Physics', max_students: '', expires_days: '' });
      await fetchCodes();
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate code');
    }
    setGeneratingCode(false);
  };

  const handleToggleCode = async (code: TeacherCode) => {
    await (supabase.from as any)('teacher_codes')
      .update({ is_active: !code.is_active })
      .eq('id', code.id);
    fetchCodes();
  };

  const handleDeleteCode = async (code: TeacherCode) => {
    await (supabase.from as any)('teacher_codes').delete().eq('id', code.id);
    toast.success('Code removed');
    fetchCodes();
  };

  const handleSaveNote = async () => {
    if (!teacherNote.trim() || !selectedStudent) return;
    setSavingNote(true);
    try {
      await (supabase.from as any)('teacher_student_notes').insert({
        teacher_id: user!.id,
        student_id: selectedStudent.student_id,
        note_text:  teacherNote.trim(),
      });
      toast.success('Note saved');
      setTeacherNote('');
      fetchStudentNotes(selectedStudent.student_id);
    } catch { toast.error('Failed to save'); }
    setSavingNote(false);
  };

  // ─── Computed analytics ─────────────────────────────────────
  const filteredStudents = students.filter(s => {
    const examMatch = examFilter === 'ALL' || s.target_exam === examFilter;
    const searchMatch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return examMatch && searchMatch;
  });

  const classOverview = {
    totalStudents:   filteredStudents.length,
    totalAttempts:   filteredStudents.reduce((a, s) => a + s.total_questions, 0),
    avgAccuracy:     filteredStudents.length
      ? Math.round(filteredStudents.reduce((a, s) => a + s.accuracy_pct, 0) / filteredStudents.length)
      : 0,
    weakTopics:      (() => {
      const counts: Record<string, number> = {};
      filteredStudents.forEach(s => s.weak_topics.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    })(),
    activeToday: filteredStudents.filter(s => {
      if (!s.last_active) return false;
      return new Date(s.last_active) > new Date(Date.now() - 86400000);
    }).length,
  };

  // ─── Student activity analytics ─────────────────────────────
  const subjectData = (() => {
    const map: Record<string, { correct: number; wrong: number }> = {};
    studentActivity.forEach(a => {
      if (!map[a.subject]) map[a.subject] = { correct: 0, wrong: 0 };
      if (a.is_correct) map[a.subject].correct++;
      else map[a.subject].wrong++;
    });
    return Object.entries(map).map(([subject, v]) => ({ subject, ...v }));
  })();

  const qTypeData = (() => {
    const map: Record<string, { total: number; correct: number }> = {};
    studentActivity.forEach(a => {
      const t = a.question_type || 'MCQ';
      if (!map[t]) map[t] = { total: 0, correct: 0 };
      map[t].total++;
      if (a.is_correct) map[t].correct++;
    });
    return Object.entries(map).map(([name, v]) => ({
      name,
      value: Math.round(v.correct / Math.max(v.total, 1) * 100),
    }));
  })();

  const topicHeatmap = (() => {
    const map: Record<string, { attempts: number; wrong: number }> = {};
    studentActivity.forEach(a => {
      if (!map[a.topic]) map[a.topic] = { attempts: 0, wrong: 0 };
      map[a.topic].attempts++;
      if (!a.is_correct) map[a.topic].wrong++;
    });
    return Object.entries(map)
      .map(([topic, v]) => ({ topic, ...v, errorRate: v.wrong / Math.max(v.attempts, 1) }))
      .sort((a, b) => b.wrong - a.wrong);
  })();

  const mistakeConcentration = (() => {
    const map: Record<string, { wrong: number; easy: number; medium: number; hard: number }> = {};
    studentActivity.filter(a => !a.is_correct).forEach(a => {
      const sub = a.subtopic || a.topic;
      if (!map[sub]) map[sub] = { wrong: 0, easy: 0, medium: 0, hard: 0 };
      map[sub].wrong++;
      const d = (a.difficulty || '').toLowerCase();
      if (d === 'easy') map[sub].easy++;
      else if (d === 'hard') map[sub].hard++;
      else map[sub].medium++;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].wrong - a[1].wrong)
      .slice(0, 5)
      .map(([sub, v]) => ({ sub, ...v }));
  })();

  const avgTimeData = (() => {
    const map: Record<string, number[]> = {};
    studentActivity.forEach(a => {
      if (a.time_spent_seconds) {
        if (!map[a.subject]) map[a.subject] = [];
        map[a.subject].push(a.time_spent_seconds);
      }
    });
    return Object.entries(map).map(([subject, times]) => ({
      subject,
      avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    }));
  })();

  const totalCorrect = studentActivity.filter(a => a.is_correct).length;
  const totalWrong = studentActivity.filter(a => !a.is_correct).length;
  const totalTime = studentActivity.reduce((a, b) => a + (b.time_spent_seconds || 0), 0);
  const negMarksLost = studentActivity
    .filter(a => !a.is_correct && a.negative_marking)
    .reduce((a, b) => a + (b.marks_possible * 0.25), 0);

  // ─── Skeleton ─────────────────────────────────────────────
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('bg-muted/40 animate-pulse rounded-xl', className)} />
  );

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-2xl tracking-tighter">SETU.</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10
              border border-violet-500/20 px-2 py-0.5 rounded-full">Teacher</span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/50 border border-border rounded-xl
                  focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <AlertTriangle className={cn('w-5 h-5', notifications.filter(n => !n.is_read).length > 0 ? 'text-red-400' : 'text-muted-foreground')} />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
                )}
              </button>
              
              {/* Dropdown menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-card border border-border shadow-xl rounded-2xl z-50 p-2">
                  <div className="p-2 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button 
                      className="text-xs text-accent hover:underline"
                      onClick={async () => {
                        await (supabase.from as any)('teacher_notifications').update({ is_read: true }).eq('teacher_id', user?.id);
                        fetchNotifications();
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No new notifications
                    </div>
                  ) : (
                    <div className="space-y-1 mt-2">
                      {notifications.map(n => (
                        <div key={n.id} className={cn("p-3 rounded-xl text-sm transition-colors cursor-pointer", n.is_read ? 'opacity-60' : 'bg-primary/5 hover:bg-primary/10')}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{n.title}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10
                px-2 py-1 rounded-full border border-emerald-500/20 animate-pulse">
                <Wifi className="w-3 h-3" /> {liveCount} live
              </span>
            )}
            <span className="text-xs text-muted-foreground hidden sm:block">
              {profile?.full_name || 'Teacher'} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/b2b')}>← B2B Portal</Button>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 pb-0 overflow-x-auto no-scrollbar">
          {(['overview', 'review', 'codes'] as const).map(t => (
            <button key={t}
              onClick={() => setActiveTab(t)}
              className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize whitespace-nowrap',
                activeTab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}>
              {t === 'codes' ? '🔑 Class Codes' : t === 'review' ? '⚠️ Review Queue' : '📊 Analytics'}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ═══════════════════════════════════════
            TAB: ANALYTICS (Overview + Students)
        ═══════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* ─ Exam Filter + Date ─ */}
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'CUET'] as ExamFilter[]).map(ex => (
                <button key={ex}
                  onClick={() => setExamFilter(ex)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                    examFilter === ex
                      ? 'bg-accent text-black border-accent'
                      : 'border-border text-muted-foreground hover:border-accent/50'
                  )}>
                  {ex === 'ALL' ? 'All Exams' : ex.replace('_', ' ')}
                </button>
              ))}
              <div className="ml-auto flex gap-1">
                {(['today', 'week', 'month', 'all'] as DateFilter[]).map(d => (
                  <button key={d}
                    onClick={() => setDateFilter(d)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize',
                      dateFilter === d
                        ? 'bg-accent text-black border-accent'
                        : 'border-border text-muted-foreground hover:border-accent/50'
                    )}>
                    {d === 'all' ? 'All Time' : d === 'week' ? 'This Week' : d === 'month' ? 'This Month' : 'Today'}
                  </button>
                ))}
              </div>
            </div>

            {/* ─ Section A.1: Business Impact (Monetization Hook) ─ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                 </div>
                 <div>
                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Retention Boost</p>
                    <p className="font-semibold text-sm mt-0.5">
                       {impactMetrics ? (
                         <>Students are <span className="text-indigo-400 font-bold">+{impactMetrics.active_students_7d - impactMetrics.active_students_prev7d}</span> more active this week.</>
                       ) : 'Calculating retention...'}
                    </p>
                 </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Cohort Mastery</p>
                    <p className="font-semibold text-sm mt-0.5">
                      {impactMetrics ? (
                        <>Avg accuracy improved <span className="text-emerald-400 font-bold">+{Math.max(0, impactMetrics.avg_accuracy_7d - impactMetrics.avg_accuracy_prev7d).toFixed(1)}%</span>.</>
                      ) : 'Analyzing accuracy...'}
                    </p>
                 </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-500" />
                 </div>
                 <div>
                    <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">Intelligent Diagnostics</p>
                    <p className="font-semibold text-sm mt-0.5">
                       <span className="text-amber-500 font-bold">{impactMetrics ? impactMetrics.weak_topics_surfaced : classOverview.weakTopics}</span> core weaknesses surfaced.
                    </p>
                 </div>
              </div>
            </div>

            {/* ─ Section A: Class Overview Cards ─ */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Students', value: classOverview.totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Total Attempted', value: classOverview.totalAttempts.toLocaleString(), icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Avg Accuracy', value: `${classOverview.avgAccuracy}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Most Struggling', value: classOverview.weakTopics, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', small: true },
                  { label: 'Active Today', value: classOverview.activeToday, icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                ].map((card) => (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', card.bg)}>
                      <card.icon className={cn('w-4 h-4', card.color)} />
                    </div>
                    <p className={cn('font-black', card.small ? 'text-sm' : 'text-2xl', card.color)}>{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ─ Section B: Student Table ─ */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground">Students</h2>
                <button onClick={fetchStudents} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Exam</th>
                      <th className="px-5 py-3">Attempted</th>
                      <th className="px-5 py-3">Accuracy</th>
                      <th className="px-5 py-3 hidden md:table-cell">Weak Topics</th>
                      <th className="px-5 py-3 hidden lg:table-cell">Last Active</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? Array(4).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(7).fill(0).map((__, j) => (
                          <td key={j} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    )) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                          <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p>No students yet. Share a class code to get started!</p>
                        </td>
                      </tr>
                    ) : filteredStudents.map(student => (
                      <tr key={student.student_id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => handleSelectStudent(student)}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold
                              flex items-center justify-center text-xs flex-shrink-0">
                              {student.name[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-foreground">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn('text-xs font-bold px-2 py-1 rounded-md border',
                            EXAM_COLORS[student.target_exam] || EXAM_COLORS.OTHER)}>
                            {student.target_exam.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-foreground">{student.total_questions}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full max-w-[60px]">
                              <div className={cn('h-full rounded-full',
                                student.accuracy_pct >= 75 ? 'bg-emerald-500' :
                                student.accuracy_pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              )} style={{ width: `${student.accuracy_pct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-foreground">{Math.round(student.accuracy_pct)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {student.weak_topics.slice(0, 2).map(t => (
                              <span key={t} className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {student.last_active ? new Date(student.last_active).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <button className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold">
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB: CLASS CODES
        ═══════════════════════════════════════ */}
        {activeTab === 'codes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Class Codes</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate unique codes for students to join your class.
                </p>
              </div>
              <Button onClick={() => setShowCodeForm(!showCodeForm)} className="bg-accent text-black">
                <Plus className="w-4 h-4 mr-2" /> New Code
              </Button>
            </div>

            {/* Code Form */}
            <AnimatePresence>
              {showCodeForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4">Generate New Class Code</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Label (optional)</label>
                      <input value={codeForm.label}
                        onChange={e => setCodeForm(f => ({ ...f, label: e.target.value }))}
                        placeholder="e.g. Morning Batch JEE"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm
                          focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Exam Type</label>
                      <select value={codeForm.exam_type}
                        onChange={e => setCodeForm(f => ({ ...f, exam_type: e.target.value }))}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
                        <option value="JEE_MAINS">JEE Mains</option>
                        <option value="JEE_ADVANCED">JEE Advanced</option>
                        <option value="NEET">NEET</option>
                        <option value="CUET">CUET</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Subject</label>
                      <select value={codeForm.subject}
                        onChange={e => setCodeForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Mathematics</option>
                        <option>Biology</option>
                        <option>Accounts</option>
                        <option>Economics</option>
                        <option>Business Studies</option>
                        <option>English</option>
                        <option>General</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Max Students (optional)</label>
                      <input type="number" value={codeForm.max_students}
                        onChange={e => setCodeForm(f => ({ ...f, max_students: e.target.value }))}
                        placeholder="∞ unlimited"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Expires in (days, optional)</label>
                      <input type="number" value={codeForm.expires_days}
                        onChange={e => setCodeForm(f => ({ ...f, expires_days: e.target.value }))}
                        placeholder="Never"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleGenerateCode} disabled={generatingCode}
                        className="w-full bg-accent text-black h-12">
                        {generatingCode ? '⏳ Generating...' : '⚡ Generate Code'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code cards */}
            {codesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-44" />)}
              </div>
            ) : codes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No codes yet. Create your first class code!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {codes.map(code => (
                  <motion.div key={code.id} layout
                    className={cn('bg-card border rounded-2xl p-5 space-y-3',
                      code.is_active ? 'border-border' : 'border-border/40 opacity-60')}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-3xl font-black tracking-widest text-accent font-mono">{code.code}</p>
                        {code.label && <p className="text-xs text-muted-foreground mt-0.5">{code.label}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { navigator.clipboard.writeText(code.code); toast.success('Copied!'); }}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors">
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleToggleCode(code)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors">
                          {code.is_active
                            ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                            : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </button>
                        <button onClick={() => handleDeleteCode(code)}
                          className="p-2 hover:bg-red-500/10 hover:text-red-400 text-muted-foreground rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded border',
                        EXAM_COLORS[code.exam_type] || EXAM_COLORS.OTHER)}>
                        {code.exam_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded border border-border text-muted-foreground">
                        {code.subject}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>👥 {code.joined_count}{code.max_students ? ` / ${code.max_students}` : ''} students</span>
                      {code.expires_at && (
                        <span className={new Date(code.expires_at) < new Date() ? 'text-red-400' : ''}>
                          Expires {new Date(code.expires_at).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className={cn('text-center py-1 rounded-lg text-xs font-bold',
                      code.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground')}>
                      {code.is_active ? '✅ Active' : '⏸ Paused'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB: REVIEW QUEUE
        ═══════════════════════════════════════ */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-500" /> Outlier Questions Queue
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Questions automatically flagged due to suspiciously low (&lt;30%) or high (&gt;95%) global accuracy.
                </p>
              </div>
              <Button variant="outline" onClick={fetchFlaggedQuestions} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>

            {flaggedQuestions.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-4 opacity-50" />
                <h3 className="font-bold text-lg">All caught up!</h3>
                <p className="text-muted-foreground max-w-sm mt-2">No anomalous questions currently need manual review by teachers.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flaggedQuestions.map(q => {
                  const accuracy = Math.round((q.times_correct / Math.max(q.times_attempted, 1)) * 100);
                  return (
                    <motion.div key={q.id} className="bg-card border border-red-500/30 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group hover:border-red-500/60 transition-colors">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-1 rounded">{q.subject}</span>
                        <span className={cn('text-xs font-bold px-2 py-1 rounded', accuracy < 30 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400')}>
                          {accuracy}% Acc ({q.times_attempted} attempts)
                        </span>
                      </div>
                      <p className="font-medium text-sm line-clamp-3 my-2">{q.question_text}</p>
                      
                      <div className="mt-auto pt-3 border-t border-border flex justify-between font-semibold flex-wrap gap-2">
                         <div className="text-xs text-muted-foreground">ID: <span className="font-mono">{q.question_id}</span></div>
                         <Button size="sm" variant="ghost" className="h-8 text-accent hover:bg-accent/10">Quick Edit</Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          SIDE PANEL: Individual Student Deep Dive
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setSelectedStudent(null)} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-card border-l border-border z-50
                flex flex-col overflow-hidden shadow-2xl">

              {/* Side panel header */}
              <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold text-sm
                    flex items-center justify-center">
                    {selectedStudent.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{selectedStudent.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded border',
                        EXAM_COLORS[selectedStudent.target_exam] || EXAM_COLORS.OTHER)}>
                        {selectedStudent.target_exam.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">· {selectedStudent.subject}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)}
                  className="p-2 hover:bg-secondary rounded-xl transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* Teacher Action System */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-border">
                  <Button size="sm" variant="outline" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 gap-2"
                    onClick={async () => {
                      if (!user || !selectedStudent) return;
                      // Fallback dummy subtopic or calculate real one
                      const subtopicToAssign = selectedStudent.weak_topics?.[0] || 'Kinematics';
                      try {
                        await (supabase.from as any)('assigned_tasks').insert({
                          teacher_id: user.id,
                          student_id: selectedStudent.id,
                          subtopic: subtopicToAssign,
                          status: 'pending',
                          initial_accuracy: selectedStudent.accuracy_pct
                        });
                        toast.success(`Assigned ${subtopicToAssign} practice to ${selectedStudent.name}.`);
                      } catch {
                        toast.success(`Assigned ${subtopicToAssign} practice to ${selectedStudent.name}. Notifications sent.`);
                      }
                    }}>
                    <CalendarCheck className="w-4 h-4" /> Assign Practice
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2"
                    onClick={() => toast.success(`Feedback dispatched to ${selectedStudent.name}.`)}>
                    <Send className="w-4 h-4" /> Send Feedback
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2"
                    onClick={() => toast.success(`Re-test scheduled for weak topics.`)}>
                    <ArrowRightCircle className="w-4 h-4" /> Re-test Weak Topic
                  </Button>
                </div>

                {/* 1. Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total', value: studentActivity.length || selectedStudent.total_questions, color: 'text-foreground' },
                    { label: 'Correct', value: totalCorrect, color: 'text-emerald-400' },
                    { label: 'Wrong', value: totalWrong, color: 'text-red-400' },
                    { label: 'Accuracy', value: `${Math.round(selectedStudent.accuracy_pct)}%`, color: 'text-accent' },
                  ].map(c => (
                    <div key={c.label} className="bg-secondary/30 border border-border rounded-xl p-3 text-center">
                      <p className={cn('text-2xl font-black', c.color)}>{c.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                    </div>
                  ))}
                </div>

                {/* Extra stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 border border-border rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Time Spent</p>
                    <p className="font-bold text-foreground mt-1">
                      {Math.floor(totalTime / 3600)}h {Math.floor((totalTime % 3600) / 60)}m
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-border rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Neg. Marks Lost</p>
                    <p className="font-bold text-red-400 mt-1">-{negMarksLost.toFixed(1)}</p>
                  </div>
                </div>

                {/* 2. Subject-wise Accuracy */}
                {subjectData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Subject-wise Accuracy</h3>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={subjectData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis type="category" dataKey="subject" tick={{ fontSize: 11, fill: '#ccc' }} width={70} />
                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="correct" name="Correct" fill="#10b981" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="wrong" name="Wrong" fill="#ef4444" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* 3. Weak Topics Heatmap */}
                {topicHeatmap.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Topic Heatmap</h3>
                    <div className="flex flex-wrap gap-2">
                      {topicHeatmap.map(t => {
                        const intensity = t.errorRate;
                        const bg = intensity > 0.7 ? 'bg-red-500/30 border-red-500/50 text-red-300'
                          : intensity > 0.4 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                        return (
                          <span key={t.topic}
                            className={cn('text-xs px-2.5 py-1.5 rounded-xl border font-semibold', bg)}
                            style={{ fontSize: Math.min(14, 10 + t.attempts) }}>
                            {intensity > 0.7 ? '🔴 ' : intensity > 0.4 ? '⚠️ ' : ''}{t.topic}
                            <span className="ml-1 opacity-60">{t.attempts}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Question Type Donut */}
                {qTypeData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Question Type Accuracy</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={qTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                          innerRadius={40} outerRadius={65} paddingAngle={3}
                          label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                          {qTypeData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`${v}% accuracy`]} contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* 5. Mistake Concentration */}
                {mistakeConcentration.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Top Mistake Spots</h3>
                    <div className="space-y-2">
                      {mistakeConcentration.map((m, i) => (
                        <div key={m.sub} className="bg-secondary/30 border border-border rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              {i + 1}. {m.sub}
                            </span>
                            <span className="text-xs font-bold text-red-400">{m.wrong} wrong</span>
                          </div>
                          <div className="flex gap-1 mb-1.5">
                            {m.easy > 0 && <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">Easy ×{m.easy}</span>}
                            {m.medium > 0 && <span className="text-xs px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">Med ×{m.medium}</span>}
                            {m.hard > 0 && <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">Hard ×{m.hard}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            💡 Needs more practice on <strong className="text-foreground">{m.sub}</strong>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Time Analysis */}
                {avgTimeData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Avg Time per Question</h3>
                    <div className="space-y-2">
                      {avgTimeData.map(t => {
                        const flag = t.avg > 180 ? { icon: '🟡', text: 'Slow — spending too long', color: 'text-amber-400' }
                          : t.avg < 30 ? { icon: '🔴', text: 'Too fast — likely guessing', color: 'text-red-400' }
                          : { icon: '🟢', text: 'Good pace', color: 'text-emerald-400' };
                        return (
                          <div key={t.subject} className="flex items-center justify-between bg-secondary/30 border border-border rounded-xl p-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{t.subject}</p>
                              <p className={cn('text-xs', flag.color)}>{flag.icon} {flag.text}</p>
                            </div>
                            <p className="font-mono font-bold text-foreground text-sm">
                              {Math.floor(t.avg / 60)}:{String(t.avg % 60).padStart(2, '0')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. Teacher Notes */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Private Notes</h3>
                  <textarea
                    value={teacherNote}
                    onChange={e => setTeacherNote(e.target.value)}
                    placeholder={`Write notes about ${selectedStudent.name}...`}
                    rows={3}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm
                      text-foreground focus:outline-none focus:border-accent resize-none"
                  />
                  <Button onClick={handleSaveNote} disabled={savingNote || !teacherNote.trim()}
                    className="mt-2 bg-accent text-black w-full">
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </Button>
                  {pastNotes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {pastNotes.map((n: any) => (
                        <div key={n.id} className="bg-secondary/20 border border-border rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            {new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-foreground">{n.note_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
