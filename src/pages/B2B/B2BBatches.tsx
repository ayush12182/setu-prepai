// B2BBatches.tsx — Real data from Supabase
import React, { useEffect, useState } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Layers, Plus, Users, GraduationCap, ChevronRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useB2BManager } from '@/hooks/useB2BManager';
import { toast } from 'sonner';

export default function B2BBatches() {
  const { profile, user } = useAuth();
  const { createBatch, loading: creating } = useB2BManager();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', subject: 'Physics', targetExam: 'JEE' });
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [accuracyMap, setAccuracyMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchBatches();
  }, [profile]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const orgId = profile?.organization_id;
      const { data } = await (supabase as any)
        .from('batches')
        .select('*, profiles!batches_mentor_id_fkey(full_name)')
        .eq('is_active', true)
        .eq('organization_id', orgId || '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false });

      const rows = data || [];
      setBatches(rows);

      // Fetch member counts
      const counts: Record<string, number> = {};
      const accs: Record<string, number> = {};
      await Promise.all(
        rows.map(async (b: any) => {
          const { count } = await (supabase as any)
            .from('batch_members')
            .select('*', { count: 'exact', head: true })
            .eq('batch_id', b.id);
          counts[b.id] = count || 0;

          // Avg accuracy
          const { data: sessions } = await (supabase as any)
            .from('assessment_sessions')
            .select('id')
            .eq('batch_id', b.id);
          if (sessions && sessions.length > 0) {
            const ids = sessions.map((s: any) => s.id);
            const { data: pts } = await (supabase as any)
              .from('session_participants')
              .select('live_accuracy')
              .in('session_id', ids)
              .eq('status', 'SUBMITTED');
            if (pts && pts.length > 0) {
              accs[b.id] = Math.round(
                pts.reduce((a: number, p: any) => a + (p.live_accuracy || 0), 0) / pts.length
              );
            } else {
              accs[b.id] = 0;
            }
          } else {
            accs[b.id] = 0;
          }
        })
      );
      setMemberCounts(counts);
      setAccuracyMap(accs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Batch name is required'); return; }
    const result = await createBatch(form.name, form.subject);
    if (result) {
      setShowCreate(false);
      setForm({ name: '', subject: 'Physics', targetExam: 'JEE' });
      fetchBatches();
    }
  };

  return (
    <B2BSidebarLayout title="Batches">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Manage Batches</h1>
            <p className="text-muted-foreground mt-1 text-sm">View or create class groups for your students.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent/90 gap-2">
            <Plus size={16} /> New Batch
          </Button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <div className="relative z-10 bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Create New Batch</h2>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Batch Name</label>
                  <input
                    required
                    placeholder="e.g. JEE 2026 – Alpha"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Primary Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  >
                    {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'All Subjects'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Target Exam</label>
                  <select
                    value={form.targetExam}
                    onChange={e => setForm({ ...form, targetExam: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  >
                    {['JEE', 'NEET', 'CUET'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <Button type="submit" disabled={creating} className="w-full h-12 bg-accent text-white font-bold rounded-xl">
                  {creating ? <Loader2 className="animate-spin" size={16} /> : 'Create Batch'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map(b => {
              const acc = accuracyMap[b.id] ?? 0;
              const accColor = acc >= 65 ? 'text-emerald-400' : acc >= 50 ? 'text-amber-400' : 'text-red-400';
              return (
                <div key={b.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-accent/30 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">active</span>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${accColor}`}>{acc}%</p>
                      <p className="text-[10px] text-muted-foreground">avg accuracy</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">{b.name}</h3>
                  <p className="text-xs text-muted-foreground">{b.subject || 'All Subjects'} · {b.target_exam || 'JEE'}</p>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Users size={12} /> {memberCounts[b.id] ?? 0} students</div>
                    <div className="flex items-center gap-1"><GraduationCap size={12} /> {b.profiles?.full_name || 'Unassigned'}</div>
                  </div>
                  <Button variant="ghost" className="w-full mt-4 justify-between group" onClick={() => window.location.href = `/b2b/invite`}>
                    Invite Students <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              );
            })}

            <button
              onClick={() => setShowCreate(true)}
              className="bg-card/50 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-accent/40 hover:bg-accent/5 transition-all group min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <p className="font-bold text-muted-foreground group-hover:text-foreground">Create New Batch</p>
            </button>
          </div>
        )}
      </div>
    </B2BSidebarLayout>
  );
}
