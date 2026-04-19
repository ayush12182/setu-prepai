// B2BBatches.tsx — Full classroom system with optimistic UI
import React, { useEffect, useState, useCallback } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import {
  Layers, Plus, Users, GraduationCap, ChevronRight,
  Loader2, X, Ticket, Copy, CheckCircle2, AlertCircle,
  RefreshCw, Trash2, BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useB2BManager } from '@/hooks/useB2BManager';
import { toast } from 'sonner';
import { EXAM_CONFIG } from '@/config/examConfig';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────
interface Batch {
  id: string;
  name: string;
  subject: string | null;
  target_exam: string | null;
  join_code: string;
  is_active: boolean;
  created_at: string;
  organization_id: string | null;
  teacher_id: string | null;
  studentCount: number;
  accuracy: number;
}

const EXAM_OPTIONS = [
  { value: 'JEE_MAINS',    label: 'JEE Main' },
  { value: 'JEE_ADVANCED', label: 'JEE Advanced' },
  { value: 'NEET',         label: 'NEET' },
  { value: 'CUET',         label: 'CUET' },
  { value: 'OTHER',        label: 'Other / General' },
];

// ─── Component ────────────────────────────────────────────────
export default function B2BBatches() {
  const { profile, user } = useAuth();
  const { createBatch, generateInviteDetails, loading: creating } = useB2BManager();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [regeneratingCodeFor, setRegeneratingCodeFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Derive default exam from teacher profile
  const defaultExam = (() => {
    const te = (profile?.target_exam || '').toUpperCase();
    if (te.includes('CUET')) return 'CUET';
    if (te.includes('NEET')) return 'NEET';
    if (te.includes('ADVANCED')) return 'JEE_ADVANCED';
    if (te.includes('JEE')) return 'JEE_MAINS';
    return 'JEE_MAINS';
  })();

  const [form, setForm] = useState({
    name: '',
    targetExam: defaultExam,
    description: '',
  });

  useEffect(() => {
    fetchBatches();
  }, [user]);

  // ─── Fetch all batches for this teacher ─────────────────────
  const fetchBatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Query by teacher's user ID directly — no org dependency
      const { data, error } = await (supabase as any)
        .from('batches')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as any[];

      // Enrich with student counts in parallel
      const enriched = await Promise.all(
        rows.map(async (b: any) => {
          let studentCount = 0;
          try {
            const { count } = await (supabase as any)
              .from('batch_members')
              .select('*', { count: 'exact', head: true })
              .eq('batch_id', b.id);
            studentCount = count || 0;
          } catch { /* non-fatal */ }

          return {
            id: b.id,
            name: b.name,
            subject: b.subject || null,
            target_exam: b.target_exam || null,
            join_code: b.join_code || null,
            is_active: b.is_active,
            created_at: b.created_at,
            organization_id: b.organization_id || null,
            teacher_id: b.teacher_id || null,
            studentCount,
            accuracy: 0, 
          } as Batch;
        })
      );

      setBatches(enriched);
    } catch (e: any) {
      console.error('fetchBatches error:', e);
      toast.error(`Could not load batches: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ─── Create batch + auto-generate join code ──────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Batch name is required'); return; }

    const result = await createBatch(form.name.trim(), 'All Subjects', user?.id, form.targetExam, form.description);
    if (!result) return; 

    // createBatch already generates join_code and organization_id
    const newBatch: Batch = {
      id: result.id,
      name: result.name,
      subject: result.subject || null,
      target_exam: result.target_exam || form.targetExam || null,
      join_code: result.join_code,
      is_active: true,
      created_at: result.created_at || new Date().toISOString(),
      organization_id: result.organization_id || null,
      teacher_id: result.teacher_id || user?.id || null,
      studentCount: 0,
      accuracy: 0,
    };
    
    setBatches(prev => [newBatch, ...prev]);
    setShowCreate(false);
    setForm({ name: '', targetExam: defaultExam, description: '' });
    
    // Explicitly refresh after a short delay to ensure DB sync
    setTimeout(fetchBatches, 500);
  };

  // ─── Regenerate join code for existing batch ─────────────────
  const handleRegenerateCode = async (batch: Batch) => {
    setRegeneratingCodeFor(batch.id);
    try {
      let newCode: string;
      const { data: codeData } = await (supabase.rpc as any)('generate_teacher_code');
      newCode = codeData || Array.from({ length: 6 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('');

      const { error } = await (supabase as any)
        .from('batches')
        .update({ join_code: newCode })
        .eq('id', batch.id);

      if (error) throw error;

      // Instant UI update
      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, join_code: newCode } : b));
      toast.success(`Code regenerated: ${newCode}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to regenerate code');
    } finally {
      setRegeneratingCodeFor(null);
    }
  };

  // ─── Delete batch ────────────────────────────────────────────
  const handleDelete = async (batchId: string) => {
    if (!confirm('Delete this batch? Students will no longer see it.')) return;
    setDeletingId(batchId);
    try {
      const { error } = await (supabase as any)
        .from('batches')
        .update({ is_active: false })
        .eq('id', batchId);
      if (error) throw error;
      setBatches(prev => prev.filter(b => b.id !== batchId));
      toast.success('Batch deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete batch');
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied!`);
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <B2BSidebarLayout title="Batches">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Manage Batches</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {batches.length} batch{batches.length !== 1 ? 'es' : ''} · Each batch has a unique join code for students
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent/90 gap-2">
            <Plus size={16} /> New Batch
          </Button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !creating && setShowCreate(false)} />
            <div className="relative z-10 bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Create New Batch</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">A join code is automatically generated</p>
                </div>
                <button onClick={() => setShowCreate(false)}
                  className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    Batch Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required autoFocus
                    placeholder="e.g. JEE 2026 – Alpha Batch"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    Target Exam <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.targetExam}
                    onChange={e => setForm({ ...form, targetExam: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  >
                    {EXAM_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    Description <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <input
                    placeholder="e.g. Crash course batch for JEE 2026 droppers"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="pt-1 p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs text-accent/80">
                  ✨ A unique 6-character join code will be auto-generated for this batch
                </div>
                <Button type="submit" disabled={creating} className="w-full h-12 bg-accent text-white font-bold rounded-xl">
                  {creating ? <Loader2 className="animate-spin" size={16} /> : '🚀 Create Batch'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Main content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card/50 border-2 border-dashed border-border rounded-3xl group cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all"
               onClick={() => setShowCreate(true)}>
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Batches Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-center text-sm">
              Create your first batch to start inviting students and conducting assessments.
            </p>
            <Button className="mt-6 bg-accent" onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}>
              Create Your First Batch
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Batch cards */}
            {batches.map(b => {
              const examLabel = EXAM_OPTIONS.find(e => e.value === b.target_exam)?.label || b.target_exam || 'General';
              const isRegenning = regeneratingCodeFor === b.id;
              const isDeleting = deletingId === b.id;

              return (
                <div key={b.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-accent/30 transition-all flex flex-col group/card">

                  {/* Card header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1.5">
                      {b.join_code ? (
                        <span className="flex items-center gap-1 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                          <CheckCircle2 size={9} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 w-fit">
                          <AlertCircle size={9} /> Needs Setup
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{examLabel}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button
                        onClick={() => toast.info('Edit functionality coming soon')}
                        className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors"
                      >
                         <Layers size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        disabled={isDeleting}
                        className="w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground flex items-center justify-center transition-colors"
                      >
                        {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Batch name */}
                  <h3 className="text-lg font-bold text-foreground leading-tight mb-1">{b.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <div className="flex-1 min-h-[12px]" />

                  {/* Join Code slot */}
                  <div className="mt-4">
                    {b.join_code ? (
                      <div className="p-3 bg-secondary/30 border border-border rounded-2xl relative group/code">
                        <p className="text-[9px] text-muted-foreground uppercase font-black mb-1">Join Code</p>
                        <div className="flex items-center justify-between">
                          <p onClick={() => copyCode(b.join_code!)} 
                             className="text-xl font-mono font-bold text-accent tracking-widest cursor-pointer hover:opacity-80 transition-opacity">
                            {b.join_code}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => copyCode(b.join_code!)}
                              className="w-8 h-8 rounded-lg hover:bg-accent/10 hover:text-accent text-muted-foreground flex items-center justify-center transition-colors"
                              title="Copy code"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => handleRegenerateCode(b)}
                              disabled={isRegenning}
                              className="w-8 h-8 rounded-lg hover:bg-accent/10 hover:text-accent text-muted-foreground flex items-center justify-center transition-colors"
                              title="Regenerate code"
                            >
                              {isRegenning ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleRegenerateCode(b)}
                        disabled={isRegenning}
                        className="w-full bg-accent/5 hover:bg-accent/10 text-accent border border-accent/20 font-bold gap-2 h-11 rounded-2xl"
                      >
                        {isRegenning ? <Loader2 size={14} className="animate-spin" /> : <Ticket size={14} />}
                        Generate Join Code
                      </Button>
                    )}
                  </div>

                  {/* Footer stats */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span className="font-bold text-foreground">{b.studentCount}</span> students
                    </div>
                    <button
                      onClick={() => window.location.href = `/b2b/invite`}
                      className="flex items-center gap-1 text-accent hover:underline font-semibold"
                    >
                      Invite students <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* New Batch card (tail end) */}
            <button
              onClick={() => setShowCreate(true)}
              className="bg-card/30 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:border-accent/40 hover:bg-accent/5 transition-all group min-h-[220px]"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/10 group-hover:text-accent transition-all">
                <Plus size={20} />
              </div>
              <p className="font-bold text-muted-foreground group-hover:text-foreground">New Batch</p>
            </button>
          </div>
        )}
      </div>
    </B2BSidebarLayout>
  );
}
