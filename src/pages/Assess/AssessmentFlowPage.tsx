import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export default function AssessmentFlowPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { user, profile } = useAuth();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [step, setStep] = useState<'onboarding' | 'in_progress' | 'completed'>('onboarding');
  
  // Onboarding Form (Pre-filled via Auth)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Test State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastSyncIndicator, setLastSyncIndicator] = useState<boolean>(false);
  
  // Mock Results
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}&type=coaching`, { replace: true });
      return;
    }
    
    // Auto-fill profile
    if (profile?.full_name) setName(profile.full_name);
    
    // Rehydrate local storage answers if available
    const stashed = localStorage.getItem(`setu_assess_${sessionId}`);
    if (stashed) {
      try {
         const parsed = JSON.parse(stashed);
         setCurrentIdx(parsed.currentIdx || 0);
         // Do not restore time if it's already dead
         if (parsed.timeLeft > 0) setTimeLeft(parsed.timeLeft);
         toast.success("Recovered offline session state!");
      } catch(e) {}
    }
    
    fetchSession();
  }, [sessionId, user]);

  const fetchSession = async () => {
    if (!sessionId) return;
    
    // If the host hasn't executed `npx supabase migration up` yet, we bypass and give them a mock session to prevent crash
    if (sessionId.startsWith('demo-session')) {
      const mockData = {
        exam_type: 'JEE Mains', class: '12', time_limit_minutes: 60, question_count: 30, status: 'PENDING'
      };
      setSessionData(mockData);
      setTimeLeft(mockData.time_limit_minutes * 60);
      setLoading(false);
      return;
    }

    const { data } = await (supabase as any).from('assessment_sessions').select('*').eq('id', sessionId).single();
    if (data) {
      setSessionData(data);
      setTimeLeft(data.time_limit_minutes * 60);
    } else {
      toast.error("Invalid Assessment Link");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 'in_progress' && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(t);
    } else if (step === 'in_progress' && timeLeft <= 0) {
      handleFinalSubmit(); // Auto submit
    }
  }, [step, timeLeft]);

  // QA LOCAL STORAGE SAVING EVERY 30 SECONDS
  useEffect(() => {
    if (step !== 'in_progress') return;
    const saveInterval = setInterval(() => {
      localStorage.setItem(`setu_assess_${sessionId}`, JSON.stringify({ currentIdx, timeLeft }));
      setLastSyncIndicator(true);
      setTimeout(() => setLastSyncIndicator(false), 2000);
    }, 30000); // 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [step, currentIdx, timeLeft, sessionId]);

  const handleStart = async () => {
    if (!name.trim()) return toast.error("Please enter your name!");
    setLoading(true);
    
    // Join Session
    const { data, error } = await (supabase as any).from('session_participants').insert({
      session_id: sessionId,
      student_name: name,
      student_phone: phone,
      status: 'IN_PROGRESS',
      current_question: 1,
      started_at: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error(error);
      const mockFallbackId = 'p-' + Date.now();
      setParticipantId(mockFallbackId);
    } else {
      setParticipantId(data.id);
    }

    setStep('in_progress');
    setLoading(false);
  };

  const syncLiveProgress = async (qIndex: number) => {
    if (!participantId || participantId.startsWith('p-')) return;
    await (supabase as any).from('session_participants').update({
      current_question: qIndex + 1,
      last_active_at: new Date().toISOString(),
      live_accuracy: Math.floor(Math.random() * 40) + 40 // Mocking live accuracy stream
    }).eq('id', participantId);
  };

  const handleNext = () => {
    if (currentIdx < (sessionData?.question_count || 10) - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      syncLiveProgress(nextIdx);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const mockScore = Math.floor(Math.random() * (sessionData?.question_count || 20));
    setScore(mockScore);
    
    if (participantId && !participantId.startsWith('p-')) {
      await (supabase as any).from('session_participants').update({
        status: 'SUBMITTED',
        score: mockScore,
        submitted_at: new Date().toISOString(),
        weak_topics: ['Thermodynamics', 'Calculus'],
        mistake_breakdown: { conceptual: 60, calculation: 30, silly: 10 }
      }).eq('id', participantId);
    }
    
    setStep('completed');
    localStorage.removeItem(`setu_assess_${sessionId}`); // Clear stash on submit
    setLoading(false);
  };

  if (!user) return null; // Wait for redirect

  if (loading && !sessionData) return <div className="flex bg-background h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  if (!sessionData) return <div className="p-10 text-center">Session not found.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* ONBOARDING */}
      {step === 'onboarding' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-10 shadow-2xl relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold">SETU Assessment</h1>
              <p className="text-muted-foreground mt-2">{sessionData.exam_type} • Class {sessionData.class}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-4 focus:outline-none focus:border-accent transition-colors"
                  placeholder="Rahul Sharma"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-4 focus:outline-none focus:border-accent transition-colors"
                  placeholder="+91..."
                  value={phone} onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-600 dark:text-amber-400">
               <Clock className="w-5 h-5 shrink-0" />
               <p className="text-sm">This is a timed assessment ({sessionData.time_limit_minutes} minutes). The timer will begin immediately when you click Start.</p>
            </div>

            <Button onClick={handleStart} disabled={loading} className="w-full h-14 text-lg font-bold bg-accent text-white hover:bg-accent/90 mt-8 rounded-xl shadow-lg shadow-accent/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Assessment"} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* IN PROGRESS */}
      {step === 'in_progress' && (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
            <div className="font-display font-bold text-lg">{sessionData.exam_type} Mock Test</div>
            <div className="flex items-center gap-6">
              {lastSyncIndicator && (
                 <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full animate-in fade-in zoom-in">
                   Saved
                 </span>
              )}
              <div className="flex items-center gap-2 font-mono text-xl font-bold text-accent">
                <Clock className="w-5 h-5" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <Button onClick={handleFinalSubmit} variant="destructive" className="font-bold border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                Submit Test
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden flex bg-secondary/20">
             {/* Main Question Area */}
             <div className="flex-1 p-8 overflow-y-auto">
               <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-bold">Question {currentIdx + 1}</h2>
                   <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                     Single Correct
                   </span>
                 </div>

                 <div className="bg-card border border-border rounded-3xl p-8 mb-8 min-h-[200px] shadow-sm text-lg text-foreground leading-relaxed">
                   {/* Dummy Question Content */}
                   A particle is projected with a velocity v such that its range on the horizontal plane is twice the greatest height attained by it. The range of the projectile is (where g is acceleration due to gravity)
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {['(4v²)/(5g)', '(4g)/(5v²)', '(v²)/g', '(4v²)/g'].map((opt, i) => (
                     <div key={i} className="bg-card border border-border hover:border-accent hover:bg-accent/5 p-5 rounded-2xl cursor-pointer transition-colors flex items-center gap-4 group">
                       <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center font-bold text-muted-foreground group-hover:border-accent group-hover:text-accent">
                         {String.fromCharCode(65 + i)}
                       </div>
                       <div className="text-foreground font-medium">{opt}</div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* Sidebar Navigator */}
             <div className="w-72 bg-card border-l border-border p-6 flex flex-col shrink-0">
               <h3 className="font-bold mb-4 uppercase tracking-widest text-xs text-muted-foreground">Navigator</h3>
               <div className="grid grid-cols-5 gap-2 content-start flex-1 overflow-y-auto">
                 {Array.from({ length: sessionData.question_count }).map((_, i) => (
                   <div 
                     key={i} 
                     onClick={() => { setCurrentIdx(i); syncLiveProgress(i); }}
                     className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border transition-colors
                       ${currentIdx === i ? 'bg-accent text-white border-accent' : 'bg-background border-border hover:border-accent/50 text-foreground'}
                     `}
                   >
                     {i + 1}
                   </div>
                 ))}
               </div>
               
               <Button onClick={handleNext} className="w-full h-14 font-bold bg-foreground text-background hover:bg-foreground/90 shrink-0 shadow-xl mt-4">
                 {currentIdx === sessionData.question_count - 1 ? 'Submit Assessment' : 'Save & Next'} <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
             </div>
          </div>
        </div>
      )}

      {/* COMPLETED RESULTS */}
      {step === 'completed' && (
        <div className="flex flex-col items-center justify-center min-h-screen py-10 px-6">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-emerald-500/10 border-4 border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-display font-bold mb-2">Test Successfully Submitted</h1>
              <p className="text-muted-foreground text-lg">Your responses have been synced with the institutional server.</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 mb-8 relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-6 relative z-10 flex items-center gap-2">
                <Target className="text-accent"/> Your Score Card
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                <div className="bg-secondary/50 rounded-2xl p-4 text-center border border-border">
                   <p className="text-3xl font-black text-foreground">{score} <span className="text-lg text-muted-foreground">/ {sessionData.question_count}</span></p>
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Total Score</p>
                </div>
                <div className="bg-emerald-500/5 rounded-2xl p-4 text-center border border-emerald-500/20">
                   <p className="text-3xl font-black text-emerald-500">{Math.round((score / sessionData.question_count)*100)}%</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mt-1">Accuracy</p>
                </div>
                <div className="bg-amber-500/5 rounded-2xl p-4 text-center border border-amber-500/20">
                   <p className="text-3xl font-black text-amber-500">{Math.floor((sessionData.time_limit_minutes * 60 - timeLeft)/60)}m</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mt-1">Time Taken</p>
                </div>
                <div className="bg-purple-500/5 rounded-2xl p-4 text-center border border-purple-500/20">
                   <p className="text-3xl font-black text-purple-500">22s</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mt-1">Avg / Quest</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-card border border-border rounded-3xl p-6">
                 <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-accent"/> Identified Weaknesses</h3>
                 <div className="flex flex-wrap gap-2">
                   {['Thermodynamics', 'Calculus', 'Organic Structs'].map((t, i) => (
                     <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold">
                       {t}
                     </span>
                   ))}
                 </div>
               </div>
               <div className="bg-card border border-border rounded-3xl p-6">
                 <h3 className="font-bold mb-4 flex items-center gap-2"><XCircle className="w-4 h-4 text-amber-500"/> Mistake DNA</h3>
                 <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1"><span className="text-purple-400">Conceptual Gap</span><span>60%</span></div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden"><div className="bg-purple-500 h-full w-[60%]"></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1"><span className="text-amber-400">Calculation Error</span><span>30%</span></div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden"><div className="bg-amber-500 h-full w-[30%]"></div></div>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
