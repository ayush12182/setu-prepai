import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, RefreshCw, Users, ShieldCheck, Ticket, Pencil, Check, X } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Button } from '@/components/ui/button';
import { useB2BManager } from '@/hooks/useB2BManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function B2BInviteStudents() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { generateInviteDetails, loading } = useB2BManager();

  useEffect(() => { fetchBatches(); }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const fetchBatches = async () => {
    try {
      const { data } = await (supabase as any)
        .from('batches').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setBatches(data); setSelectedBatch(data[0]);
      } else {
        const mock = { id: 'demo-batch-1', name: 'Dropper Supreme - JEE 2026', subject: 'All Subjects', invite_link: null, join_code: null };
        setBatches([mock]); setSelectedBatch(mock);
      }
    } catch {
      const mock = { id: 'demo-batch-1', name: 'Dropper Supreme - JEE 2026', subject: 'All Subjects', invite_link: null, join_code: null };
      setBatches([mock]); setSelectedBatch(mock);
    }
  };

  const startEditing = (batch: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(batch.id);
    setEditName(batch.name);
  };

  const cancelEditing = () => { setEditingId(null); setEditName(''); };

  const saveName = async (batch: any) => {
    if (!editName.trim() || editName === batch.name) { cancelEditing(); return; }
    setSavingName(true);
    try {
      if (!batch.id.startsWith('demo')) {
        const { error } = await (supabase as any).from('batches').update({ name: editName.trim() }).eq('id', batch.id);
        if (error) throw error;
      }
      const updated = { ...batch, name: editName.trim() };
      setBatches(prev => prev.map(b => b.id === batch.id ? updated : b));
      if (selectedBatch?.id === batch.id) setSelectedBatch(updated);
      toast.success('Batch name updated!');
    } catch {
      toast.error('Failed to update batch name');
    }
    setSavingName(false);
    setEditingId(null);
  };

  const handleGenerate = async () => {
    if (!selectedBatch) return;
    if (selectedBatch.id.startsWith('demo')) {
      const updated = { ...selectedBatch, join_code: 'Z8X9WQ', invite_link: `${window.location.origin}/join/Z8X9WQ` };
      setSelectedBatch(updated);
      setBatches(batches.map(b => b.id === updated.id ? updated : b));
      return;
    }
    const updated = await generateInviteDetails(selectedBatch.id);
    if (updated) {
      setSelectedBatch(updated as any);
      setBatches(batches.map(b => b.id === (updated as any).id ? updated : b));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <B2BSidebarLayout title="Invite Students">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Invite Students</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate unique invite links and classroom codes for your students to join batches directly.
          </p>
        </div>

        {batches.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-10 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold">No active batches</h3>
            <p className="text-sm text-muted-foreground mt-2">Create a batch first to invite students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Batch Selector ── */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-foreground mb-4">Target Batch</h2>
              <div className="space-y-3">
                {batches.map(b => (
                  <div
                    key={b.id}
                    onClick={() => { if (editingId !== b.id) setSelectedBatch(b); }}
                    className={`w-full flex items-center gap-3 p-4 border rounded-2xl transition-all cursor-pointer group ${
                      selectedBatch?.id === b.id
                        ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                        : 'border-border bg-secondary/30 hover:border-accent/40'
                    }`}
                  >
                    {/* Name / Inline Input */}
                    <div className="flex-1 min-w-0">
                      {editingId === b.id ? (
                        <input
                          ref={editInputRef}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveName(b);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          onClick={e => e.stopPropagation()}
                          className="w-full bg-transparent border-b-2 border-accent text-foreground font-bold text-sm focus:outline-none py-0.5"
                          placeholder="Batch name..."
                        />
                      ) : (
                        <span className="font-bold text-foreground text-sm block truncate">{b.name}</span>
                      )}
                      <span className="text-xs text-muted-foreground mt-0.5 block">{b.subject || 'All Subjects'}</span>
                    </div>

                    {/* Edit / Save / Cancel */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      {editingId === b.id ? (
                        <>
                          <button
                            onClick={() => saveName(b)}
                            disabled={savingName}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={e => startEditing(b, e)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                          title="Rename batch"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
                <Pencil size={10} /> Hover a batch and click the pencil to rename
              </p>
            </div>

            {/* ── Credentials Panel ── */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-accent" /> Join Credentials
              </h2>

              {selectedBatch ? (
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Classroom Join Code (6-digit)</label>
                    {selectedBatch.join_code ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 font-mono font-bold text-2xl tracking-[0.25em] text-center text-foreground">
                          {selectedBatch.join_code}
                        </div>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl" onClick={() => copyToClipboard(selectedBatch.join_code, 'Join code')}>
                          <Copy size={20} />
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-secondary/50 border border-border border-dashed rounded-xl p-4 text-center text-muted-foreground text-sm">No code generated yet</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Direct Invite Link (Share on WhatsApp/Email)</label>
                    {selectedBatch.invite_link ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 font-mono text-sm text-foreground truncate">
                          {selectedBatch.invite_link}
                        </div>
                        <Button variant="outline" size="icon" className="h-[46px] w-[46px] rounded-xl shrink-0" onClick={() => copyToClipboard(selectedBatch.invite_link, 'Invite link')}>
                          <Link2 size={18} />
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-secondary/50 border border-border border-dashed rounded-xl p-4 text-center text-muted-foreground text-sm">No link generated yet</div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-border">
                    <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/20">
                      {loading ? <RefreshCw className="mr-2 animate-spin" size={16} /> : <RefreshCw className="mr-2" size={16} />}
                      {selectedBatch.join_code ? 'Regenerate Credentials' : 'Generate Invite Link & Code'}
                    </Button>
                  </div>

                  <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-400 font-medium">
                      Students automatically skip onboarding and are placed into "{selectedBatch.name}" when successful.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center opacity-50">
                  <p className="text-sm">Select a batch to view or generate invites.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </motion.div>
    </B2BSidebarLayout>
  );
}
