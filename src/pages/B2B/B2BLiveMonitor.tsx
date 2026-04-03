import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Clock, Target, ArrowRight, Expand, Shrink, BookOpen, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function B2BLiveMonitor() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time events
    const channel = (supabase as any)
      .channel('live-monitor-grid')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` }, (payload: any) => {
        setParticipants(current => {
          const exists = current.find(p => p.id === payload.new.id);
          if (exists) {
            return current.map(p => p.id === payload.new.id ? payload.new : p);
          } else {
            return [...current, payload.new];
          }
        });
      })
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [sessionId]);

  const fetchData = async () => {
    if (!sessionId) return;
    
    if (sessionId.startsWith('demo-session')) {
       setSessionData({ status: 'LIVE', exam_type: 'JEE Mains Mock', class: '12', question_count: 30 });
       setParticipants([]);
       setLoading(false);
       return;
    }

    const { data: session } = await (supabase as any)
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (session) setSessionData(session);

    const { data: parts } = await (supabase as any)
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('started_at', { ascending: false });

    if (parts) setParticipants(parts);
    setLoading(false);
  };

  const terminateSession = async () => {
    if (!sessionId) return;
    await (supabase as any).from('assessment_sessions').update({ status: 'COMPLETED', ended_at: new Date().toISOString() }).eq('id', sessionId);
    setSessionData({...sessionData, status: 'COMPLETED'});
  };

  if (loading) return <B2BSidebarLayout title="Live Monitor"><div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div></B2BSidebarLayout>;
  if (!sessionData) return <B2BSidebarLayout title="Live Monitor"><div className="text-center py-20">Session not found.</div></B2BSidebarLayout>;

  // Computed Stats
  const activeCount = participants.filter(p => p.status === 'IN_PROGRESS').length;
  const submittedCount = participants.filter(p => p.status === 'SUBMITTED').length;
  const avgAccuracy = participants.length > 0 ? Math.round(participants.reduce((acc, p) => acc + (p.live_accuracy || 0), 0) / participants.length) : 0;
  
  const isCompleted = sessionData.status === 'COMPLETED';

  // Mock post-test data for Recharts
  const mistakeData = [
    { name: 'Conceptual', value: 45, color: '#a855f7' },
    { name: 'Calculation', value: 35, color: '#f59e0b' },
    { name: 'Silly', value: 20, color: '#ef4444' }
  ];

  const subjectPerfData = [
    { subject: 'Physics', avg: 72 },
    { subject: 'Chemistry', avg: 85 },
    { subject: 'Maths', avg: 61 }
  ];

  return (
    <B2BSidebarLayout title={`Live Monitor - ${sessionData.exam_type}`}>
      <div className="space-y-6 max-w-7xl">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isCompleted ? (
                <span className="px-3 py-1 bg-secondary border border-border text-foreground font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Session Ended
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE Session Active
                </span>
              )}
            </div>
            <h1 className="text-3xl font-display font-bold">{sessionData.exam_type} Mock</h1>
            <p className="text-muted-foreground mt-1 text-sm">Target: Class {sessionData.class} • {sessionData.question_count} Questions</p>
          </div>
          
          <div className="flex gap-4">
            {!isCompleted && (
               <Button onClick={terminateSession} variant="destructive" className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-colors">
                 Force End Session
               </Button>
            )}
          </div>
        </div>

        {/* Global Stats Row */}
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0"><Users size={24}/></div>
             <div>
               <p className="text-2xl font-bold font-display">{participants.length} <span className="text-sm font-normal text-muted-foreground mr-2">joined</span> {submittedCount} <span className="text-sm font-normal text-muted-foreground">submitted</span></p>
               <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Participation</p>
             </div>
           </div>
           
           <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shrink-0"><Target size={24}/></div>
             <div>
               <p className="text-2xl font-bold font-display text-accent">{avgAccuracy}%</p>
               <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Current Class Accuracy</p>
             </div>
           </div>

           <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0"><Clock size={24}/></div>
             <div>
               <p className="text-2xl font-bold font-display">{activeCount}</p>
               <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Students In-Progress</p>
             </div>
           </div>
        </div>

        {/* POST-SESSION AGGREGATES */}
        {isCompleted && (
          <div className="grid grid-cols-2 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
               <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs text-muted-foreground">Subject Wise Performance</h3>
               <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectPerfData}>
                      <XAxis dataKey="subject" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                      <Bar dataKey="avg" fill="#00e599" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
             <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
               <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs text-muted-foreground">Class Mistake Distribution</h3>
               <div className="h-48 flex items-center justify-center">
                 <ResponsiveContainer width="50%" height="100%">
                   <PieChart>
                     <Pie data={mistakeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none" dataKey="value">
                       {mistakeData.map((e, index) => <Cell key={index} fill={e.color} />)}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="w-1/2 space-y-3">
                    {mistakeData.map(m => (
                      <div key={m.name} className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{backgroundColor: m.color}}></div>
                         <p className="text-sm font-medium">{m.name}</p>
                         <p className="text-sm font-bold ml-auto">{m.value}%</p>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        <div className="mt-8">
           <h3 className="text-xl font-bold mb-4">{isCompleted ? 'Detailed Student Action Records' : 'Live Activity Grid'}</h3>
           {participants.length === 0 ? (
             <div className="bg-secondary/30 rounded-3xl border border-dashed border-border p-12 text-center">
                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin opacity-50" />
                <p className="font-medium text-foreground">Waiting for students to join the link...</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {participants.map(p => {
                 const isSub = p.status === 'SUBMITTED';
                 const isIdle = p.status === 'IN_PROGRESS' && React.useMemo(() => (new Date().getTime() - new Date(p.last_active_at).getTime() > 120000), [p.last_active_at]);
                 
                 const expanded = expandedStudentId === p.id;

                 return (
                   <div key={p.id} className={`bg-card border rounded-2xl transition-all overflow-hidden ${
                     isSub ? 'border-border' : isIdle ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-accent/40 shadow-[0_0_15px_rgba(0,229,153,0.15)]'
                   } ${expanded ? 'col-span-full md:col-span-full lg:col-span-full order-first' : ''}`}>
                     
                     <div className="p-5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center font-bold border border-border">
                           <User size={16} />
                         </div>
                         <div>
                           <p className="font-bold text-foreground lead-none">{p.student_name}</p>
                           <p className="text-xs text-muted-foreground">
                             {isSub ? "Submitted" : `Q ${p.current_question} / ${sessionData.question_count}`}
                           </p>
                         </div>
                       </div>
                       
                       <div className="flex flex-col items-end">
                         {isSub ? (
                           <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-2.5 py-1 rounded-md">
                             {p.score}/{sessionData.question_count}
                           </div>
                         ) : (
                           <div className="flex items-center gap-1.5 font-bold text-sm">
                             {isIdle ? <span className="text-amber-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Idle</span> : 
                             <span className="text-accent flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span> Active</span>}
                           </div>
                         )}

                         {isSub && (
                           <Button variant="ghost" size="sm" className="h-6 mt-2 text-xs" onClick={() => setExpandedStudentId(expanded ? null : p.id)}>
                             {expanded ? <Shrink size={12} className="mr-1"/> : <Expand size={12} className="mr-1"/>} {expanded ? 'Close' : 'Analysis'}
                           </Button>
                         )}
                       </div>
                     </div>

                     {/* Expanded Student Insights */}
                     {expanded && isSub && (
                       <div className="p-6 bg-secondary/30 border-t border-border grid grid-cols-3 gap-6 animate-in slide-in-from-top-4">
                         <div className="col-span-1 border-r border-border pr-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Topic Radar</p>
                            <div className="space-y-4">
                               {['Physics', 'Chemistry', 'Mathematics'].map(sub => (
                                 <div key={sub}>
                                   <div className="flex justify-between text-sm font-medium mb-1">
                                     <span>{sub}</span>
                                     <span>{Math.floor(Math.random() * 20)}/20</span>
                                   </div>
                                   <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/50">
                                     <div className="h-full bg-emerald-500" style={{width: `${Math.random() * 100}%`}}></div>
                                   </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="col-span-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Weaknesses Identified</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                              {p.weak_topics?.length > 0 ? p.weak_topics.map((wt: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-bold shadow-sm">
                                  {wt}
                                </span>
                              )) : (
                                <span className="text-sm text-muted-foreground italic">None detected</span>
                              )}
                            </div>

                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Mistake Breakdown</p>
                            <div className="flex bg-secondary border border-border rounded-xl h-4 overflow-hidden mb-2">
                               <div className="bg-purple-500 h-full transition-all" style={{width: `${p.mistake_breakdown.conceptual}%`}}></div>
                               <div className="bg-amber-500 h-full transition-all" style={{width: `${p.mistake_breakdown.calculation}%`}}></div>
                               <div className="bg-red-500 h-full transition-all" style={{width: `${p.mistake_breakdown.silly}%`}}></div>
                            </div>
                            <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Conceptual ({p.mistake_breakdown.conceptual}%)</span>
                               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Calc ({p.mistake_breakdown.calculation}%)</span>
                               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Silly ({p.mistake_breakdown.silly}%)</span>
                            </div>
                         </div>
                       </div>
                     )}

                   </div>
                 );
               })}
             </div>
           )}
        </div>

      </div>
    </B2BSidebarLayout>
  );
}
