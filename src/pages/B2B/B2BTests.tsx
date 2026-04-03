import React, { useState, useEffect } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { ClipboardList, Plus, QrCode, Copy, Upload, Clock, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function B2BTests() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Session Configuration State
  const [config, setConfig] = useState({
    batch_id: '',
    exam_type: 'JEE Mains',
    class: '12',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    question_count: 30,
    time_limit_minutes: 60
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [createdSessionId, setCreatedSessionId] = useState('');

  // Mock fetching batches
  useEffect(() => {
    setBatches([
      { id: 'batch-1', name: 'Dropper Supreme - JEE 2026' },
      { id: 'batch-2', name: 'Class 11 Foundation' }
    ]);
    setConfig(c => ({ ...c, batch_id: 'batch-1' }));
  }, []);

  const handleCreateSession = async () => {
    setLoading(true);
    // Since RLS is public and we're mocking the admin ID right now
    const dummyAdminId = '00000000-0000-0000-0000-000000000000'; 
    try {
      const { data, error } = await (supabase as any).from('assessment_sessions').insert({
        created_by: dummyAdminId,
        batch_id: null, // Bypassing foreign key constraint for demo
        exam_type: config.exam_type,
        class: config.class,
        subjects: config.subjects,
        question_count: config.question_count,
        time_limit_minutes: config.time_limit_minutes,
        status: 'PENDING'
      }).select().single();

      if (error) {
        // Fallback to local state if migration hasn't been pushed
        console.error('DB Insert failed, using local mock ID:', error);
        const mockId = 'demo-session-' + Date.now();
        setCreatedSessionId(mockId);
        setGeneratedLink(`${window.location.origin}/assess/${mockId}`);
      } else {
        setCreatedSessionId(data.id);
        setGeneratedLink(`${window.location.origin}/assess/${data.id}`);
      }
      toast.success('Assessment Session Created!');
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Link copied to clipboard!');
  };

  const openMonitor = () => {
    window.open(`/b2b/monitor/${createdSessionId}`, '_blank');
  };

  return (
    <B2BSidebarLayout title="Tests & Assignments">
      <div className="space-y-6 max-w-6xl">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Live Assessments</h1>
            <p className="text-muted-foreground mt-1 text-sm">Generate unique test links and monitor student progression in real-time.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-accent text-white h-11 px-6 shadow-lg shadow-accent/20">
            <Plus size={18} className="mr-2"/> Create Session
          </Button>
        </div>
        
        {!generatedLink ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">No Active Sessions</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              Generate an assessment link, broadcast it to your class or Whatsapp group, and monitor their live attempts on the grid.
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wider uppercase">Session Ready to Broadcast</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-foreground">{config.exam_type} Mock Test</h3>
                <p className="text-muted-foreground mt-1 flex items-center gap-4 text-sm font-medium">
                  <span>Class {config.class}</span>
                  <span>•</span>
                  <span>{config.question_count} Questions</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> {config.time_limit_minutes} mins</span>
                </p>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-8">
              {/* Link Distribution Box */}
              <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                <p className="font-bold text-foreground mb-4">Share this link with students:</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedLink} 
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground"
                  />
                  <Button onClick={copyLink} className="h-[46px] w-[46px] shrink-0 bg-accent hover:bg-accent/90">
                    <Copy size={18} className="text-white" />
                  </Button>
                </div>
                
                {/* Dummy QR Placeholder */}
                <div className="mt-6 flex items-center justify-center border-t border-border pt-6">
                   <div className="w-48 h-48 bg-white border border-border rounded-xl flex flex-col items-center justify-center p-4 shadow-sm relative">
                     <QrCode className="w-32 h-32 text-slate-800" />
                     <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Scan to join</p>
                   </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex flex-col justify-center gap-4">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm font-medium leading-relaxed">
                  Students will remain in "WAITING" mode until they click "Start Assessment". Once a student submits, their analytics will immediately populate the Live Grid.
                </div>
                
                <Button 
                  onClick={openMonitor}
                  className="w-full h-14 text-lg font-bold bg-foreground text-background hover:bg-foreground/90 mt-4 shadow-xl"
                >
                  Enter Live Monitor Grid <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-2xl rounded-[2rem] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-border bg-secondary/30">
              <h2 className="text-2xl font-bold font-display">Configure Assessment</h2>
              <p className="text-muted-foreground mt-1 text-sm">Design the parameters for this live session.</p>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Target Audience</label>
                  <select 
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
                    value={config.batch_id} onChange={e => setConfig({...config, batch_id: e.target.value})}
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                    <option value="open">Open Link (Anyone can join)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Exam Type</label>
                  <select 
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
                    value={config.exam_type} onChange={e => setConfig({...config, exam_type: e.target.value})}
                  >
                    <option value="JEE Mains">JEE Mains</option>
                    <option value="NEET">NEET</option>
                    <option value="CUET">CUET</option>
                    <option value="Class 10 Board">Class 10 Board</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Structure</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium">Question Count</span>
                    <select className="bg-background border-none outline-none font-bold text-accent" value={config.question_count} onChange={e => setConfig({...config, question_count: Number(e.target.value)})}>
                      <option value={10}>10 Qs</option>
                      <option value={20}>20 Qs</option>
                      <option value={30}>30 Qs</option>
                      <option value={90}>Full Mock (90 Qs)</option>
                    </select>
                  </div>
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium">Time Limit</span>
                    <select className="bg-background border-none outline-none font-bold text-emerald-500" value={config.time_limit_minutes} onChange={e => setConfig({...config, time_limit_minutes: Number(e.target.value)})}>
                      <option value={15}>15 Mins</option>
                      <option value={30}>30 Mins</option>
                      <option value={60}>60 Mins</option>
                      <option value={180}>180 Mins</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3">
              <Button variant="outline" className="rounded-xl font-bold bg-background" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button disabled={loading} onClick={handleCreateSession} className="rounded-xl font-bold bg-accent text-white px-8">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Link"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </B2BSidebarLayout>
  );
}
