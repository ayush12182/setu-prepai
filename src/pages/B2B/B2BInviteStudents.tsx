import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, RefreshCw, Users, ShieldCheck, Ticket, Pencil, Check, X } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Button } from '@/components/ui/button';
import { useB2BManager } from '@/hooks/useB2BManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function B2BInviteStudents() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { createBatch } = useB2BManager();

  useEffect(() => { if (user) fetchBatches(); }, [user]);

  const fetchBatches = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setBatches(data);
        setSelectedBatch(data[0]);
      }
    } catch (err: any) {
      toast.error(`Could not load batches: ${err.message}`);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied!');
  };

  return (
    <B2BSidebarLayout title="Invite Students">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Invite Students</h1>
          <p className="text-white/40 text-sm mt-1">Get your unique join code to onboard your class</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 space-y-8">
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 block">Select Batch</label>
              <div className="space-y-3">
                {batches.map(batch => (
                  <button
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      selectedBatch?.id === batch.id
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'border-white/[0.05] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{batch.name}</span>
                      {selectedBatch?.id === batch.id && <ShieldCheck className="w-4 h-4 text-orange-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedBatch && (
              <div className="pt-4 space-y-6">
                <div className="bg-black/20 rounded-2xl p-6 border border-white/[0.05] text-center">
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-3 text-center">Batch Join Code</p>
                  <span className="text-4xl font-mono font-bold text-white tracking-[0.3em] block mb-6">{selectedBatch.join_code}</span>
                  <Button onClick={() => copyCode(selectedBatch.join_code)} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 h-12 rounded-xl">
                    <Copy className="w-4 h-4" /> Copy Code
                  </Button>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-400/80 leading-relaxed">Students will enter this code during signup to automatically join your <b>{selectedBatch.name}</b> batch.</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/[0.08] rounded-3xl p-8">
               <h3 className="text-lg font-bold text-white mb-4">How it works?</h3>
               <div className="space-y-4">
                 {[
                   { step: 1, text: 'Share your unique join code with your students.' },
                   { step: 2, text: 'Students enter the code when they create their PrepEntrance accounts.' },
                   { step: 3, text: 'They are automatically added to your batch for tracking.' }
                 ].map(s => (
                   <div key={s.step} className="flex gap-4 items-start">
                     <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{s.step}</span>
                     <p className="text-white/60 text-sm leading-relaxed">{s.text}</p>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>
    </B2BSidebarLayout>
  );
}
