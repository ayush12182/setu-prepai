import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Layers, LogIn, ExternalLink, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useB2BManager } from '@/hooks/useB2BManager';
import { Button } from '@/components/ui/button';

export default function JoinBatchPage() {
  const { inviteCode } = useParams(); // which is actually the batchId from the invite_link generator
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { joinBatchById, loading } = useB2BManager();
  
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'verified' | 'invalid' | 'joined'>('loading');

  useEffect(() => {
    if (!inviteCode) {
      setStatus('invalid');
      return;
    }

    if (!user) {
      // Unauthenticated -> Redirect to auth with return URL and explicitly tag as coaching
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}&type=coaching`, { replace: true });
      return;
    }

    verifyInvite();
  }, [inviteCode, user]);

  const verifyInvite = async () => {
    try {
      // Find batch by ID (inviteCode is batchId in our link generator)
      const { data: batchData, error: batchErr } = await (supabase as any).from('batches')
        .select('*')
        .eq('id', inviteCode)
        .eq('is_active', true)
        .single();

      const batch = batchData as any;
      if (batchErr || !batch) throw new Error('Invalid invite link');
      
      setBatchInfo(batch);

      // Get org details optionally
      if (batch.organization_id) {
        const { data: org } = await (supabase as any).from('organizations').select('*').eq('id', batch.organization_id).single();
        if (org) setOrgInfo(org);
      }

      setStatus('verified');

    } catch (err) {
      setStatus('invalid');
    }
  };

  const handleJoin = async () => {
    if (!batchInfo) return;
    const success = await joinBatchById(batchInfo.id);
    if (success) {
      setStatus('joined');
      setTimeout(() => {
        navigate('/dashboard'); // Take them to B2C Student Dashboard
      }, 2000);
    }
  };

  if (!user) return null; // Redirecting in useEffect

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <span className="font-display font-black tracking-tighter text-2xl scale-y-110">SETU.</span>
      </div>

      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
             <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
             <p className="text-muted-foreground text-sm font-bold tracking-widest uppercase">Verifying link...</p>
          </motion.div>
        )}

        {status === 'invalid' && (
          <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
             <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
               <XCircle size={32} />
             </div>
             <h2 className="text-xl font-bold text-foreground mb-2">Invalid Invite</h2>
             <p className="text-sm text-muted-foreground mb-6">This batch invite link is invalid, expired, or the batch has been archived.</p>
             <Button onClick={() => navigate('/dashboard')} className="w-full bg-card border border-border text-foreground rounded-xl">Go Home</Button>
          </motion.div>
        )}

        {status === 'verified' && batchInfo && (
          <motion.div key="verified" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-xl">
             <div className="text-center mb-8">
               <div className="w-16 h-16 rounded-3xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                 <Layers size={32} />
               </div>
               <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{orgInfo?.name || 'Classroom Invite'}</h3>
               <h2 className="text-3xl font-display font-bold text-foreground leading-tight mt-1">You've been invited to join <span className="text-accent">{batchInfo.name}</span></h2>
             </div>

             <div className="bg-secondary/50 rounded-2xl p-4 border border-border mb-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold uppercase">
                   {profile?.full_name?.[0] || 'U'}
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Joining as</p>
                   <p className="font-bold text-foreground">{profile?.full_name || 'Student'}</p>
                 </div>
                 <LogIn className="w-4 h-4 text-muted-foreground ml-auto" />
               </div>
             </div>

             <Button 
               onClick={handleJoin} 
               disabled={loading}
               className="w-full h-14 rounded-2xl bg-accent text-white font-bold text-lg shadow-[0_4px_20px_rgba(var(--accent),0.25)] hover:shadow-[0_4px_25px_rgba(var(--accent),0.4)] transition-all flex items-center justify-center"
             >
               {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Join Batch <ChevronRight className="ml-1" /></>}
             </Button>

             <p className="text-center text-[10px] text-muted-foreground mt-4">By joining, your mentor can track your assessment progress.</p>
          </motion.div>
        )}

        {status === 'joined' && (
          <motion.div key="joined" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
             <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 size={36} />
             </div>
             <h2 className="text-2xl font-bold text-foreground mb-2">Successfully Joined!</h2>
             <p className="text-sm text-muted-foreground">Heading to your dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
