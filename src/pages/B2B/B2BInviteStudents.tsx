import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, RefreshCw, Users, ShieldCheck, Ticket } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Button } from '@/components/ui/button';
import { useB2BManager } from '@/hooks/useB2BManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function B2BInviteStudents() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const { generateInviteDetails, loading } = useB2BManager();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data } = await (supabase as any).from('batches').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setBatches(data);
        setSelectedBatch(data[0]);
      } else {
        // Fallback demo batch if DB is empty / migration unpushed
        const mockBatch = { id: 'demo-batch-1', name: 'Dropper Supreme - JEE 2026', subject: 'All Subjects', invite_link: null, join_code: null };
        setBatches([mockBatch]);
        setSelectedBatch(mockBatch);
      }
    } catch (e) {
      const mockBatch = { id: 'demo-batch-1', name: 'Dropper Supreme - JEE 2026', subject: 'All Subjects', invite_link: null, join_code: null };
      setBatches([mockBatch]);
      setSelectedBatch(mockBatch);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBatch) return;
    
    if (selectedBatch.id.startsWith('demo')) {
      const updated = { 
        ...selectedBatch, 
        join_code: 'Z8X9WQ', 
        invite_link: `${window.location.origin}/join/Z8X9WQ` 
      };
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
            
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-foreground mb-4">Target Batch</h2>
              <div className="space-y-4">
                {batches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBatch(b)}
                    className={`w-full flex flex-col p-4 text-left border rounded-2xl transition-all ${selectedBatch?.id === b.id ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : 'border-border bg-secondary/30 hover:border-accent/40'}`}
                  >
                    <span className="font-bold text-foreground">{b.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{b.subject || 'All Subjects'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-accent" /> Join Credentials
              </h2>

              {selectedBatch ? (
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  
                  {/* Join Code */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Classroom Join Code (6-digit)</label>
                    {selectedBatch.join_code ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 font-mono font-bold text-2xl tracking-[0.25em] text-center text-foreground">
                          {selectedBatch.join_code}
                        </div>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors" onClick={() => copyToClipboard(selectedBatch.join_code, 'Join code')}>
                          <Copy size={20} />
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-secondary/50 border border-border border-dashed rounded-xl p-4 text-center text-muted-foreground text-sm">
                        No code generated yet
                      </div>
                    )}
                  </div>

                  {/* Invite Link */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Direct Invite Link (Share on WhatsApp/Email)</label>
                    {selectedBatch.invite_link ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 font-mono text-sm text-foreground truncate overflow-hidden">
                          {selectedBatch.invite_link}
                        </div>
                        <Button variant="outline" size="icon" className="h-[46px] w-[46px] rounded-xl border-border shrink-0 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors" onClick={() => copyToClipboard(selectedBatch.invite_link, 'Invite link')}>
                          <Link2 size={18} />
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-secondary/50 border border-border border-dashed rounded-xl p-4 text-center text-muted-foreground text-sm">
                        No link generated yet
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-border">
                    <Button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/20"
                    >
                      {loading ? <RefreshCw className="mr-2 animate-spin" size={16} /> : <RefreshCw className="mr-2" size={16} />}
                      {selectedBatch.join_code ? 'Regenerate Credentials' : 'Generate Invite Link & Code'}
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mt-4">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-400 font-medium">Students automatically skip onboarding and are placed into "{selectedBatch.name}" when successful.</p>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
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
