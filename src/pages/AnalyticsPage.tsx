import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { generateMockAnalytics, StudentAnalyticsData } from '@/lib/analyticsSimulation';
import { generateDiagnosticReport, AIDiagnosisReport } from '@/lib/diagnosisEngine';
import { Target, TrendingUp, AlertTriangle, Zap, ArrowRight, BrainCircuit, Clock, BookOpen, User, BarChart3, Fingerprint, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RankPredictorCard } from '@/components/analytics/RankPredictorCard';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { isNeet, isCuet } = useExamMode();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [report, setReport] = useState<AIDiagnosisReport | null>(null);
  const [realAttempts, setRealAttempts] = useState<any[]>([]);
  const [reflectionRate, setReflectionRate] = useState(0);

  useEffect(() => {
    const loadDiagnostics = async () => {
      if (!user) return;
      setIsLoading(true);
      
      try {
        // 1. Fetch real attempts from Supabase
        const { data: attempts, error } = await (supabase
          .from('user_mcq_attempts' as any)
          .select('*, questions(*)')
          .eq('user_id', user.id)
          .order('attempted_at', { ascending: false }) as any);

        if (!error && attempts) {
          setRealAttempts(attempts);
          
          // 2. Calculate Reflection Rate
          const incorrectAttempts = attempts.filter((a: any) => !a.is_correct);
          const diagnosedAttempts = incorrectAttempts.filter((a: any) => !a.mistake_skipped && a.user_selected_mistake);
          const rate = incorrectAttempts.length > 0 ? (diagnosedAttempts.length / incorrectAttempts.length) * 100 : 0;
          setReflectionRate(rate);
        }

        // 3. Fallback/Mock for advanced analytics (Simulator)
        const examType = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';
        const simData = generateMockAnalytics(examType);
        const diagReport = generateDiagnosticReport(simData);
        
        setData(simData);
        setReport(diagReport);
      } catch (err) {
        console.error('Error loading diagnostics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiagnostics();
  }, [user, isNeet, isCuet]);

  const handleActionClick = (act: import('@/lib/diagnosisEngine').AIAction) => {
    if (act.actionType === 'practice_chapter') {
      navigate('/practice');
    } else if (act.actionType === 'fix_mistakes') {
      navigate('/ask-jeetu');
    } else if (act.actionType === 'focus_sprint') {
      navigate('/circles');
    }
  };

  if (isLoading || !data || !report) {
    return (
      <MainLayout title="AI Academic Coach">
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
            <div>
              <h2 className="text-xl font-bold font-display text-foreground">Analyzing Your Brain...</h2>
              <p className="text-muted-foreground text-sm">Processing 1,000+ data points to find your exact weak spots.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <Skeleton className="h-40 rounded-2xl bg-secondary" />
            <Skeleton className="h-40 rounded-2xl bg-secondary" />
            <Skeleton className="h-40 rounded-2xl bg-secondary" />
          </div>
          <Skeleton className="h-64 rounded-2xl bg-secondary mt-6" />
        </div>
      </MainLayout>
    );
  }

  // Data Reliability Check (Not enough Attempts)
  if (!report.isReliable) {
    return (
      <MainLayout title="AI Academic Coach">
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 border border-border">
            <AlertTriangle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Not enough data to diagnose.</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            The AI Coach requires at least 100 questions of combined test and practice data across subjects to confidently identify your real blockers. Right now, it might just be statistical noise.
          </p>
          <Button onClick={() => navigate('/practice')} className="bg-primary text-primary-foreground font-bold h-12 px-8 hover:bg-primary/90">
            Start a Practice Session
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="AI Academic Coach">
      <div className="space-y-8 pb-12 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold uppercase tracking-widest text-accent">Diagnosis Complete</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              The Focus Zone
            </h1>
            <p className="text-muted-foreground mt-1">
              Stop practicing blindly. Here is exactly what is holding your score back.
            </p>
          </div>
        </div>

        {/* ─── RANK PREDICTOR: LIVE STATUS ─── */}
        <div className="mb-6">
           <RankPredictorCard 
             score={(() => {
                const max = isNeet ? 720 : 300;
                const volMultiplier = Math.min(data.questionsAttempted / 2000, 1);
                const timeMultiplier = Math.min(data.totalTimeStudied / 3000, 1);
                const notesMultiplier = Math.min(data.notesStudied / 80, 1);
                
                const baseScore = data.overallAccuracy * (max / 100);
                const behavioralBoost = baseScore * ((volMultiplier * 0.15) + (timeMultiplier * 0.05) + (notesMultiplier * 0.05));
                return Math.min(baseScore + behavioralBoost, max);
             })()} 
             maxScore={isNeet ? 720 : 300} 
             exam={isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE_MAINS'} 
             previousRank={280000 - (data.questionsAttempted * 10)} 
           />
        </div>

        {/* ─── THE FOCUS ZONE: Top Priorities ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Weakest Link */}
          <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-red-500 font-bold uppercase tracking-wider text-xs">Priority #1 Fix</h3>
            </div>
            <p className="text-foreground text-lg font-serif mb-1">{report.whatToFixFirst}</p>
            <p className="text-muted-foreground text-xs mb-3 font-medium">{report.problemSummary}</p>
            <p className="text-muted-foreground/50 text-[10px] uppercase font-bold tracking-widest">{report.confidenceMessage}</p>
          </div>

          {/* Card 2: Mistake Profile */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-amber-500" />
              <h3 className="text-amber-500 font-bold uppercase tracking-wider text-xs">Behavioral Flaw</h3>
            </div>
            <p className="text-foreground text-lg font-serif mb-1">{report.rootCause}</p>
            <p className="text-muted-foreground text-xs mb-3 font-medium">This is an entirely fixable pattern. Slow down.</p>
            <p className="text-muted-foreground/50 text-[10px] uppercase font-bold tracking-widest">{report.confidenceMessage}</p>
          </div>

          {/* Card 3: Reflection Rate */}
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-2 mb-3">
              <Fingerprint className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">Reflection Rate</h3>
            </div>
            <p className="text-foreground text-2xl font-display font-bold mb-1">{reflectionRate.toFixed(0)}%</p>
            <p className="text-muted-foreground text-xs mb-3 font-medium">Of your mistakes are self-diagnosed. Keep it up!</p>
            <p className="text-muted-foreground/50 text-[10px] uppercase font-bold tracking-widest">Self-Awareness Metric</p>
          </div>

        </div>

        {/* ─── JEETU BHAIYA MENTOR RESPONSE ─── */}
        {/* We keep this explicitly dark-themed because Jeetu's card is a premium focal point */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-accent/50 to-border shadow-xl">
          <div className="absolute inset-0 bg-accent/5 blur-xl rounded-3xl pointer-events-none" />
          <div className="bg-slate-950 rounded-[23px] p-6 lg:p-8 relative overflow-hidden">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20 border-2 border-slate-950">
                <span className="text-white font-display font-bold text-xl">JB</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-4">Mentor's Verdict</h2>
                <div className="text-white/90 whitespace-pre-wrap leading-relaxed font-medium">
                  {report.jeetuMessage}
                </div>
                
                {/* Action Loop Buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {report.priorityActions.map((act, i) => (
                    <Button 
                      key={i}
                      onClick={() => handleActionClick(act)}
                      variant={i === 0 ? 'default' : 'outline'}
                      className={cn(
                        "rounded-xl font-bold tracking-wide transition-all",
                        i === 0 
                          ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      )}
                    >
                      {i === 0 ? <Zap className="w-4 h-4 mr-2 text-amber-500" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                      {act.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── DEEP DIAGNOSTICS (Heatmaps & Behavioral) ─── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            Diagnostic Evidence
          </h2>
          
          <Tabs defaultValue="heatmaps" className="w-full">
            <TabsList className="bg-secondary border border-border p-1 rounded-xl mb-6">
              <TabsTrigger value="heatmaps" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Chapter Heatmaps</TabsTrigger>
              <TabsTrigger value="behavioral" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Mistake Analysis</TabsTrigger>
              <TabsTrigger value="real-attempts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Real History</TabsTrigger>
              <TabsTrigger value="story" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Weekly Story</TabsTrigger>
            </TabsList>

            <TabsContent value="heatmaps" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {data.subjects.map((subject, idx) => (
                <div key={subject.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{subject.name}</h4>
                    {report.benchmarks[idx] && (
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest bg-secondary px-2 py-0.5 rounded border border-border">
                        {report.benchmarks[idx].message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subject.chapters.map(ch => {
                      const isWeak = ch.accuracy < 50;
                      const isStrong = ch.accuracy >= 75;
                      const label = isWeak ? 'MUST FIX 🔥' : isStrong ? 'STRONG ✅' : 'IMPROVE ⚠️';
                      
                      return (
                        <div 
                          key={ch.name} 
                          title={`Accuracy: ${ch.accuracy}% | Attempts: ${ch.attempts} | Avg Time: ${ch.behavior.avgTimeSeconds}s`}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-semibold border backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer relative group bg-card",
                            isWeak ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" :
                            isStrong ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            {ch.name} 
                            <span className="opacity-50 ml-1">{ch.accuracy}%</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-black/80 text-white px-1.5 py-0.5 rounded text-[9px] absolute -top-3 right-0 -translate-y-full whitespace-nowrap z-10 shadow-lg">
                              {ch.attempts} attempts
                            </span>
                          </div>
                          <div className="text-[8px] uppercase font-bold opacity-60 mt-0.5 tracking-wider">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="behavioral" className="animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <h3 className="text-foreground font-bold">AI vs User Perception</h3>
                  </div>
                  <p className="text-muted-foreground text-xs mb-6">
                    Mismatches identify "Blind Spots" — where you think you know the concept but are failing.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Behavioral Alignment</span>
                      <span className="font-bold text-accent">84% Match</span>
                    </div>
                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: '84%' }} />
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-1">Top Perception Gap</p>
                      <p className="text-xs text-foreground font-medium">You identified "Silly Mistake" 3 times in SHM where the AI detected a "Conceptual Gap".</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-purple-500" />
                    <h3 className="text-foreground font-bold">Mistake Distribution</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { l: 'Conceptual', v: 42, c: 'bg-red-500' },
                      { l: 'Calculation', v: 28, c: 'bg-amber-500' },
                      { l: 'Silly Mistakes', v: 18, c: 'bg-blue-500' },
                      { l: 'Guessed', v: 12, c: 'bg-purple-500' },
                    ].map(m => (
                      <div key={m.l}>
                        <div className="flex justify-between text-[11px] font-bold text-muted-foreground mb-1">
                          <span>{m.l}</span>
                          <span>{m.v}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", m.c)} style={{ width: `${m.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="real-attempts" className="animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-3">
                {realAttempts.slice(0, 10).map((att: any, idx: number) => (
                  <div key={idx} className="bg-secondary/40 border border-border p-4 rounded-xl flex items-center justify-between group hover:bg-secondary/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border",
                        att.is_correct ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                      )}>
                        {att.is_correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">{att.questions?.question_text || 'Assessment Question'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{att.questions?.topic}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-[10px] font-medium text-muted-foreground">{new Date(att.attempted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={cn(
                         "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                         att.confidence_level === 'high' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                         att.confidence_level === 'medium' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                         "text-red-500 border-red-500/20 bg-red-500/5"
                       )}>
                         {att.confidence_level || 'No Data'}
                       </span>
                    </div>
                  </div>
                ))}
                
                {realAttempts.length === 0 && (
                  <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground">
                    No persistent attempts tracked yet. Start a quiz in the teaching room!
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="story" className="animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-secondary/50 border border-border rounded-2xl p-6 max-w-2xl">
                <h3 className="text-foreground font-bold mb-3">Your Progress Narrative</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {report.weeklyStory}
                </p>
              </div>
            </TabsContent>

          </Tabs>
        </div>

      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
