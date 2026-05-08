import React, { useEffect, useState } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Users, Target, Copy, TrendingUp, BookOpen,
  ArrowUpRight, ExternalLink, Ticket, Plus,
  Loader2, Clock, Sparkles, Link as LinkIcon,
  GraduationCap, BarChart3, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Batch {
  id: string;
  name: string;
  join_code: string;
  total_students?: number;
  target_exam?: string;
  created_at: string;
}

export default function B2BMainDashboard() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, tasksPushed: 0, avgAccuracy: 0 });
  const [codeCopied, setCodeCopied] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    if (!profile?.user_id) return;
    const init = async () => {
      setLoadingBatches(true);
      try {
        // Fetch all batches for this teacher
        const { data: batchData } = await supabase
          .from('batches')
          .select('id, name, join_code, total_students, target_exam, created_at')
          .eq('mentor_id', profile.user_id)
          .order('created_at', { ascending: false });

        if (batchData && batchData.length > 0) {
          setBatches(batchData as Batch[]);
          const primary = batchData[0] as Batch;
          setActiveBatch(primary);

          // Student count across all batches
          const { count: studentCount } = await supabase
            .from('student_batch_map' as any)
            .select('*', { count: 'exact', head: true })
            .in('batch_id', batchData.map((b: any) => b.id));

          setStats(prev => ({ ...prev, totalStudents: studentCount ?? 0 }));

          // Recent activity for primary batch
          const { data: activity } = await supabase
            .from('student_activity' as any)
            .select('*, profiles(full_name)')
            .eq('batch_id', primary.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (activity) setRecentActivity(activity);

          // Subscribe to real-time
          const channel = supabase
            .channel('teacher_live_feed')
            .on('postgres_changes', {
              event: 'INSERT', schema: 'public',
              table: 'student_activity',
              filter: `batch_id=eq.${primary.id}`,
            }, async (payload) => {
              const { data: student } = await supabase.from('profiles').select('full_name').eq('user_id', payload.new.student_id).single();
              const event = { ...payload.new, profiles: { full_name: student?.full_name || 'A Student' } };
              setRecentActivity(prev => [event, ...prev].slice(0, 5));
              toast.info(`${event.profiles.full_name} completed a practice session!`);
            })
            .subscribe();

          return () => supabase.removeChannel(channel);
        }
      } finally {
        setLoadingBatches(false);
      }
    };
    init();
  }, [profile?.user_id]);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const { data } = await supabase.from('batches').select('id').eq('join_code', code).maybeSingle();
        if (!data) isUnique = true;
        attempts++;
      }

      const batchName = profile?.institution_name
        ? `${profile.institution_name} Batch`
        : 'General Batch';

      const { data: newBatch, error } = await supabase
        .from('batches')
        .insert({
          name: batchName,
          teacher_id: profile?.user_id,
          join_code: code,
          target_exam: profile?.target_exam || 'JEE_MAINS',
        })
        .select()
        .single();

      if (error) throw error;
      setActiveBatch(newBatch as Batch);
      setBatches(prev => [newBatch as Batch, ...prev]);
      toast.success('New batch created with code ' + code);
    } catch (err: any) {
      toast.error('Failed to generate code: ' + err.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = async () => {
    if (!activeBatch?.join_code) return;
    await navigator.clipboard.writeText(activeBatch.join_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    toast.success('Code copied!');
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/auth?ref=${profile?.user_id}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim() || !activeBatch) return;
    setSendingBroadcast(true);
    try {
      const { data: room } = await supabase.from('commune_rooms').select('id').eq('title', `BATCH_${activeBatch.id}`).maybeSingle();
      let roomId = room?.id;
      if (!roomId) {
        const { data: newRoom, error } = await supabase.from('commune_rooms').insert({
          title: `BATCH_${activeBatch.id}`, subject: 'Batch General', study_mode: 'doubts', exam_type: activeBatch.target_exam || 'jee', created_by: profile!.user_id, expires_at: new Date('2036-01-01').toISOString()
        }).select('id').single();
        if (error) throw error;
        roomId = newRoom?.id;
      }

      if (roomId) {
        await supabase.from('commune_messages').insert({
          room_id: roomId,
          user_id: profile!.user_id,
          user_name: profile!.full_name || 'Teacher',
          category: 'Broadcast',
          content: broadcastText.trim()
        });
        toast.success("Broadcast sent and pinned in Batch Commune!");
        setBroadcastText('');
      }
    } catch (err: any) {
      toast.error('Failed to broadcast: ' + err.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const institutionName = profile?.institution_name || profile?.full_name || 'Your Institute';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <B2BSidebarLayout title="Overview">
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">{institutionName}</h1>
            <p className="text-muted-foreground mt-1">
              {batches.length > 0
                ? `${batches.length} batch${batches.length > 1 ? 'es' : ''} · ${stats.totalStudents} student${stats.totalStudents !== 1 ? 's' : ''} enrolled`
                : 'Set up your first batch to get started'}
            </p>
          </div>
          <Link to="/b2b/batches">
            <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-xl border-border text-muted-foreground hover:text-foreground">
              <GraduationCap className="w-4 h-4" /> Manage Batches
            </Button>
          </Link>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Active Batches', value: batches.length, icon: Layers2, color: 'text-violet-400', bg: 'bg-violet-400/10' },
            { label: 'Class Accuracy', value: `${stats.avgAccuracy}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Batch card + Activity ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Active Batch / Invite Card */}
            <div className="bg-gradient-to-br from-accent to-amber-600 rounded-3xl p-7 text-primary shadow-2xl shadow-accent/20 relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-8 top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket className="w-5 h-5 text-primary/70" />
                      <p className="text-primary/70 text-sm font-bold uppercase tracking-wider">Active Batch</p>
                    </div>
                    <h2 className="text-2xl font-black text-primary">
                      {activeBatch?.name || (loadingBatches ? '...' : 'No batch yet')}
                    </h2>
                    {activeBatch?.target_exam && (
                      <p className="text-primary/60 text-sm mt-0.5">{activeBatch.target_exam.replace('_', ' ')}</p>
                    )}
                  </div>

                  {/* Student count badge */}
                  <div className="bg-white/20 border border-white/30 rounded-2xl px-5 py-3 text-center shrink-0">
                    <p className="text-2xl font-black text-primary">{stats.totalStudents}</p>
                    <p className="text-[10px] uppercase font-black text-primary/70 tracking-widest mt-0.5">Students</p>
                  </div>
                </div>

                {/* Code display */}
                {activeBatch ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 backdrop-blur-sm">
                      <span className="font-mono font-black text-2xl tracking-[0.35em] text-primary">
                        {activeBatch.join_code}
                      </span>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-2 text-primary/80 hover:text-primary transition-colors text-sm font-bold"
                      >
                        {codeCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {codeCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <button
                      onClick={copyInviteLink}
                      className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl px-4 py-3 text-primary text-sm font-bold flex items-center gap-2 transition-colors shrink-0"
                    >
                      <LinkIcon className="w-4 h-4" /> Invite Link
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl px-5 py-3 text-primary font-bold flex items-center gap-2 transition-colors"
                  >
                    {generatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create First Batch
                  </button>
                )}

                {/* Batch switcher if multiple */}
                {batches.length > 1 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {batches.slice(0, 4).map(b => (
                      <button
                        key={b.id}
                        onClick={() => setActiveBatch(b)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                          activeBatch?.id === b.id
                            ? 'bg-white/25 border-white/40 text-primary'
                            : 'bg-white/10 border-white/20 text-primary/60 hover:bg-white/20'
                        )}
                      >
                        {b.name}
                      </button>
                    ))}
                    {batches.length > 4 && (
                      <Link to="/b2b/batches" className="text-primary/60 text-xs font-bold hover:text-primary transition-colors">
                        +{batches.length - 4} more
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Broadcast Megaphone Card */}
            <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-black text-base flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  Batch Megaphone
                </h3>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Pinned in Commune</span>
              </div>
              
              <div className="flex gap-3 relative z-10">
                <input
                  type="text"
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="E.g., Complete 50 Kinematics MCQs by tonight!"
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
                />
                <Button 
                  onClick={handleBroadcast} 
                  disabled={sendingBroadcast || !broadcastText.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6"
                >
                  {sendingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Broadcast 📢'}
                </Button>
              </div>
            </div>
          </div>

          {/* Student Pulse */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Student Pulse
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-1 rounded">Live</span>
            </div>

            <div className="flex-1 space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((event, i) => (
                  <div key={i} className="bg-secondary/40 rounded-xl p-3 hover:bg-secondary/70 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-foreground truncate">{event.profiles?.full_name || 'Student'}</span>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        event.is_correct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      )}>
                        {event.is_correct ? '✓' : '✗'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{event.topic}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1 flex items-center gap-1">
                      <Clock size={9} /> {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Waiting for activity...</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Students' activity appears here live</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Feature cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Resource Center */}
          <Link to="/b2b/materials" className="group bg-secondary/30 border border-border rounded-2xl p-6 hover:border-accent/30 hover:bg-secondary/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-black text-base mb-1">Study Materials</h3>
              <p className="text-sm text-muted-foreground">Upload and share notes, PDFs and videos with your batch.</p>
            </div>
            <div className="mt-4 flex items-center text-accent text-xs font-bold gap-1 group-hover:gap-2 transition-all">
              Manage Materials <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Tests */}
          <Link to="/b2b/tests" className="group bg-secondary/30 border border-border rounded-2xl p-6 hover:border-violet-500/30 hover:bg-secondary/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-black text-base mb-1">Assign Tests</h3>
              <p className="text-sm text-muted-foreground">Create and push AI-generated tests to your entire batch.</p>
            </div>
            <div className="mt-4 flex items-center text-violet-400 text-xs font-bold gap-1 group-hover:gap-2 transition-all">
              Go to Tests <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* AI Insights */}
          <Link to="/b2b/analytics" className="group bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.08] transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-black text-base mb-1">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Identify conceptual gaps across your class with collective analytics.</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Analytics Bridge Active</span>
            </div>
          </Link>
        </div>
      </div>
    </B2BSidebarLayout>
  );
}

// tiny local icon (Layers2 not in older lucide builds)
const Layers2 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /><path d="M12 2 2 7l10 5 10-5-10-5z" />
  </svg>
);
