// B2BBatches.tsx — Full spec-compliant batch system
import React, { useEffect, useState, useCallback } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import {
  Layers, Plus, Users, GraduationCap, ChevronRight,
  Loader2, X, Ticket, Copy, CheckCircle2, AlertCircle,
  RefreshCw, Trash2, BarChart2, FileText
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

const B2BBatches: React.FC = () => {
  const { user, profile } = useAuth();
  const { createBatch, loading: creating } = useB2BManager();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  const defaultExam = 'JEE_MAINS';
  const [form, setForm] = useState({ name: '', targetExam: defaultExam, description: '' });

  useEffect(() => { if (user) fetchBatches(); }, [user]);

  const isAdmin = profile?.user_type === 'admin';

  // ─── Fetch all batches for this teacher (SPEC) ───────────────
  const fetchBatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('batches').select('*');
      
      // Teachers only see their assigned batches; Admins see ALL
      if (!isAdmin) {
        query = query.eq('teacher_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const enriched = await Promise.all(
        (data || []).map(async (b: any) => {
          const { count } = await supabase
            .from('batch_students')
            .select('*', { count: 'exact', head: true })
            .eq('batch_id', b.id);
          return { ...b, studentCount: count || 0, accuracy: 0 };
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Batch name is required');

    const result = await createBatch(form.name.trim(), 'All Subjects', user?.id, form.targetExam, form.description);
    if (!result) return; 

    const newBatch: Batch = {
      ...result,
      studentCount: 0,
      accuracy: 0,
    };
    
    setBatches(prev => [newBatch, ...prev]);
    setShowCreate(false);
    setForm({ name: '', targetExam: defaultExam, description: '' });
    toast.success('Batch created successfully!');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied!');
  };

  return (
    <B2BSidebarLayout title="Manage Batches">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Batches</h1>
          <p className="text-white/40 text-sm mt-1">{batches.length} batches · Each batch has a unique join code for students</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Plus className="w-4 h-4" /> New Batch
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
      ) : batches.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
          <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No active batches</h3>
          <p className="text-white/40 text-sm mt-1 mb-6">Create your first batch to start inviting students</p>
          <Button onClick={() => setShowCreate(true)} variant="outline" className="border-white/10 text-white hover:bg-white/5">Create Batch</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => (
            <div key={batch.id} className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 hover:bg-white/[0.05] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active</div>
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{batch.target_exam || 'JEE'}</div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{batch.name}</h3>
              <p className="text-white/30 text-xs mb-6">Created {new Date(batch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

              <div className="bg-black/20 rounded-2xl p-4 mb-6 border border-white/[0.05]">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2">Join Code</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-white tracking-widest ml-1">{batch.join_code}</span>
                  <div className="flex gap-1">
                    <button onClick={() => copyCode(batch.join_code)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 transition-colors"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => toast.info('Auto-refreshing code...')} className="p-2 hover:bg-white/10 rounded-lg text-white/40 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                <div className="flex items-center gap-2 text-white/40">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{batch.studentCount} students</span>
                </div>
                <button className="text-orange-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">Invite students <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          
          <button onClick={() => setShowCreate(true)} className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-white/[0.02] hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Plus className="w-6 h-6 text-white/20" /></div>
            <span className="text-white/40 font-bold">New Batch</span>
          </button>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-white mb-2">Create New Batch</h2>
            <p className="text-white/40 text-sm mb-6">A join code is automatically generated</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Batch Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50" placeholder="e.g. JEE 2026 Warriors" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Target Exam *</label>
                <select value={form.targetExam} onChange={e => setForm(f => ({ ...f, targetExam: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 appearance-none">
                  {Object.entries(EXAM_CONFIG).map(([id, cfg]) => <option key={id} value={id}>{cfg.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Description (Optional)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50" placeholder="e.g. Crash course batch for JEE 2026 droppers" rows={3} />
              </div>
              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-400/80 leading-relaxed font-medium">A unique 6-character join code will be auto-generated for this batch</p>
              </div>
              <Button type="submit" disabled={creating} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl text-md font-bold">
                {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '🚀 Create Batch'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </B2BSidebarLayout>
  );
};

export default B2BBatches;
