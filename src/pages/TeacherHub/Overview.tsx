import React, { useEffect, useState } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Copy, 
  Check, 
  TrendingUp, 
  BookOpen,
  ArrowUpRight,
  ExternalLink,
  Ticket,
  Plus,
  Loader2,
  Link
} from 'lucide-react';
import { toast } from 'sonner';
import { ensureTeacherCode } from '@/lib/mentorEngine';
import { supabase } from '@/integrations/supabase/client';

export default function B2BMainDashboard() {
  const { profile } = useAuth();
  const [batchCode, setBatchCode] = useState<string>('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [stats, setStats] = useState({
    activeStudents: 0,
    tasksPushed: 0,
    avgAccuracy: 0
  });

  useEffect(() => {
    const init = async () => {
      if (profile?.user_id) {
          // 1. Fetch active batch code
          const { data: batches } = await supabase
            .from('batches')
            .select('join_code')
            .eq('teacher_id', profile.user_id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (batches && batches.length > 0) {
            setBatchCode(batches[0].join_code);
          }

          // 2. Simple stats fetch
          const { count: studentCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', profile.user_id);
          
          const { count: taskCount } = await supabase
            .from('teacher_tasks' as any)
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', profile.user_id);

          setStats({
              activeStudents: studentCount || 0,
              tasksPushed: taskCount || 0,
              avgAccuracy: 74 // Mock for now
          });
      }
    };
    init();
  }, [profile]);

  const handleGenerateCode = async () => {
    setLoadingCode(true);
    try {
      // Create a default batch to generate a code
      const { createBatch } = await import('@/hooks/useB2BManager');
      // Note: useB2BManager is a hook, but we need it here. 
      // Actually, it's better to use the RPC directly or just let them go to the Batches page.
      // But for "WOW" factor, let's create a "General Batch" if they have none.
      
      const generateUniqueCode = async (): Promise<string> => {
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
        return code;
      };

      const newJoinCode = await generateUniqueCode();
      const { error } = await supabase.from('batches').insert({
        name: 'General Batch',
        teacher_id: profile?.user_id,
        join_code: newJoinCode,
        target_exam: profile?.target_exam || 'JEE_MAINS'
      });

      if (error) throw error;
      setBatchCode(newJoinCode);
      toast.success("Class Code generated successfully!");
    } catch (err: any) {
      toast.error("Failed to generate code: " + err.message);
    } finally {
      setLoadingCode(false);
    }
  };

  const copyRefLink = () => {
    const link = `${window.location.origin}/auth?ref=${profile?.user_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <B2BSidebarLayout title="Overview">
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Teacher Hub</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your students and guide their practice.</p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Invite Card */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-accent to-accent/80 rounded-3xl p-8 text-primary relative overflow-hidden shadow-2xl shadow-accent/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-primary">
                  <Ticket className="w-6 h-6" /> Class Invite Code
                </h2>
                <p className="text-primary/70 max-w-md font-medium">
                  Students can join your batch by entering this 6-character code during onboarding.
                </p>
                <div className="mt-6 flex items-center gap-4 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-sm">
                  <span className="px-4 py-2 font-mono font-bold text-2xl tracking-widest text-primary">
                    {batchCode || '------'}
                  </span>
                  <div className="h-8 w-px bg-white/20" />
                  {batchCode ? (
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(batchCode);
                        toast.success("Code copied!");
                      }}
                      variant="ghost"
                      className="hover:bg-white/20 text-primary font-bold transition-all"
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Code
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleGenerateCode}
                      disabled={loadingCode}
                      variant="ghost"
                      className="hover:bg-white/20 text-primary font-bold transition-all"
                    >
                      {loadingCode ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                      Generate Code
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                 <div className="bg-white/20 p-4 rounded-2xl flex items-center gap-4 border border-white/30 text-primary">
                    <div className="text-3xl font-black">{stats.activeStudents}</div>
                    <div className="text-xs uppercase font-black opacity-80 leading-tight">Linked<br/>Students</div>
                 </div>
                 <Button 
                   onClick={copyRefLink}
                   className="bg-white text-accent font-black h-12 rounded-xl border-none hover:bg-neutral-100 flex items-center gap-2"
                 >
                   Copy Invite Link <Link className="w-4 h-4" />
                 </Button>
              </div>
            </div>
            {/* Decoration Circles */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col justify-between hover:border-accent/30 transition-all cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Target className="w-6 h-6" />
              </div>
              <TrendingUp className="text-emerald-500 w-5 h-5" />
            </div>
            <div>
              <p className="text-4xl font-black text-foreground mb-1">{stats.avgAccuracy}%</p>
              <p className="text-muted-foreground font-bold text-sm">Class Productivity</p>
            </div>
          </div>
        </div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-secondary/30 border border-border rounded-3xl p-8 hover:bg-secondary/50 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                   <BookOpen className="w-8 h-8 text-accent mb-4" />
                   <h3 className="text-xl font-black mb-2">Resource Center</h3>
                   <p className="text-muted-foreground">Assign specific topics (Learning Nodes) as high-priority tasks.</p>
                </div>
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0 hover:bg-accent hover:text-primary">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between">
                 <span className="text-sm font-black text-accent">{stats.tasksPushed} Active Tasks</span>
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-secondary" />)}
                 </div>
              </div>
           </div>

           <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 hover:bg-emerald-500/10 transition-all">
              <div className="flex items-start justify-between">
                <div>
                   <Users className="w-8 h-8 text-emerald-500 mb-4" />
                   <h3 className="text-xl font-black mb-2">Student Insights</h3>
                   <p className="text-muted-foreground">Deep analytics on conceptual gaps across all your linked students.</p>
                </div>
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0 hover:bg-emerald-500/20 text-emerald-500">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-8 bg-emerald-500/10 rounded-2xl p-4 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">3 Students need attention today</span>
              </div>
           </div>
        </div>
      </div>
    </B2BSidebarLayout>
  );
}
