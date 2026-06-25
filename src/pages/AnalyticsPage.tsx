import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { fetchRealAnalytics, RealAnalyticsData, MINIMUM_RELIABLE_ATTEMPTS } from '@/services/realAnalytics';
import { Target, TrendingUp, AlertTriangle, Zap, ArrowRight, BrainCircuit, BookOpen, User, BarChart3, Fingerprint, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RankPredictorCard } from '@/components/analytics/RankPredictorCard';
import { getRecoveryAnalytics, getChapterMasteryStatuses } from '@/services/studentIntelligence';


const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { isNeet, isCuet } = useExamMode();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<RealAnalyticsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const analytics = await fetchRealAnalytics(user.id);
        setData(analytics);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (isLoading || !data) {
    return (
      <MainLayout title="AI Academic Coach">
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
            <div>
              <h2 className="text-xl font-bold font-display text-foreground">Analyzing Your Performance...</h2>
              <p className="text-muted-foreground text-sm">Fetching your real attempt history.</p>
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

  // Gate: not enough data to show reliable analytics
  if (!data.isReliable) {
    return (
      <MainLayout title="AI Academic Coach">
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 border border-border">
            <AlertTriangle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Not enough data yet.</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You've attempted <strong className="text-foreground">{data.totalAttempted}</strong> questions so far.
            The AI Coach needs at least <strong className="text-foreground">{MINIMUM_RELIABLE_ATTEMPTS}</strong> attempts
            to generate reliable insights — so the analysis isn't noise.
          </p>
          <p className="text-muted-foreground/70 text-sm mb-8">
            {MINIMUM_RELIABLE_ATTEMPTS - data.totalAttempted} more questions needed to unlock your full diagnosis.
          </p>
          {/* Mini progress bar */}
          <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{data.totalAttempted}/{MINIMUM_RELIABLE_ATTEMPTS}</span>
            </div>
            <div className="h-2 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (data.totalAttempted / MINIMUM_RELIABLE_ATTEMPTS) * 100)}%` }}
              />
            </div>
          </div>
          <Button onClick={() => navigate('/practice')} className="bg-accent text-primary-foreground font-bold h-12 px-8 hover:bg-accent/90">
            Start a Practice Session
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Derive weak/strong chapters across all subjects
  const allChapters = data.subjects.flatMap(s => s.chapters);
  const weakest = allChapters.filter(c => c.accuracy < 50).sort((a, b) => a.accuracy - b.accuracy)[0];
  const rootCause = data.mistakeProfile.conceptual >= 40
    ? 'Conceptual gaps are your primary blocker'
    : data.mistakeProfile.silly >= 35
    ? 'Rushing is causing preventable silly mistakes'
    : 'Mixed error pattern — review each wrong answer carefully';

  const examLabel = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';

  return (
    <MainLayout title="AI Academic Coach">
      <div className="space-y-8 pb-12 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold uppercase tracking-widest text-accent">Real Data Analysis</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Your Academic Profile</h1>
            <p className="text-muted-foreground mt-1">
              Based on {data.totalAttempted} real question attempts.
            </p>
          </div>
        </div>

        {/* Rank Predictor */}
        <div className="mb-6">
          <RankPredictorCard
            score={Math.round(data.overallAccuracy * (isNeet ? 720 : 300) / 100)}
            maxScore={isNeet ? 720 : 300}
            exam={isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE_MAINS'}
            previousRank={undefined}
          />
        </div>

        {/* Top 3 Priority Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1: Weakest Chapter */}
          <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-red-500 font-bold uppercase tracking-wider text-xs">Weakest Chapter</h3>
            </div>
            {weakest ? (
              <>
                <p className="text-foreground text-lg font-serif mb-1">{weakest.name}</p>
                <p className="text-muted-foreground text-xs mb-3 font-medium">{weakest.subject} · {weakest.accuracy}% accuracy · {weakest.attempts} attempts</p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No weak chapters found yet — keep practicing!</p>
            )}
          </div>

          {/* Card 2: Mistake Pattern */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-amber-500" />
              <h3 className="text-amber-500 font-bold uppercase tracking-wider text-xs">Error Pattern</h3>
            </div>
            <p className="text-foreground text-lg font-serif mb-1">{rootCause}</p>
            <p className="text-muted-foreground text-xs font-medium">Top error: Conceptual {data.mistakeProfile.conceptual}% · Silly {data.mistakeProfile.silly}%</p>
          </div>

          {/* Card 3: Reflection Rate */}
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-2 mb-3">
              <Fingerprint className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">Reflection Rate</h3>
            </div>
            <p className="text-foreground text-2xl font-display font-bold mb-1">{data.reflectionRate}%</p>
            <p className="text-muted-foreground text-xs font-medium">
              {data.reflectionRate >= 60
                ? 'Great self-awareness! Keep diagnosing your mistakes.'
                : 'Diagnose more wrong answers to improve your self-awareness.'}
            </p>
          </div>

        </div>

        {/* Overall Accuracy Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Overall {examLabel} Accuracy</p>
            <p className="text-4xl font-display font-bold text-foreground">{data.overallAccuracy}%</p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Attempted</p>
              <p className="text-2xl font-bold text-foreground">{data.totalAttempted.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Subjects</p>
              <p className="text-2xl font-bold text-foreground">{data.subjects.length}</p>
            </div>
          </div>
        </div>

        {/* Deep Diagnostics Tabs */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            Diagnostic Evidence
          </h2>

          <Tabs defaultValue="heatmaps" className="w-full">
            <TabsList className="bg-secondary border border-border p-1 rounded-xl mb-6 flex flex-wrap">
              <TabsTrigger value="heatmaps" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Chapter Breakdown</TabsTrigger>
              <TabsTrigger value="behavioral" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Mistake Analysis</TabsTrigger>
              <TabsTrigger value="real-attempts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Recent History</TabsTrigger>
              <TabsTrigger value="student-intelligence" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-sm">Student Intelligence V2</TabsTrigger>
            </TabsList>


            {/* Chapter Heatmaps — real data */}
            <TabsContent value="heatmaps" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {data.subjects.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No subject data yet. Start practicing to see your chapter breakdown.</p>
              ) : (
                data.subjects.map((subject) => (
                  <div key={subject.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{subject.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest bg-secondary px-2 py-0.5 rounded border border-border">
                        {subject.accuracy}% overall · {subject.totalAttempted} questions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subject.chapters.map(ch => {
                        const isWeak = ch.accuracy < 50;
                        const isStrong = ch.accuracy >= 75;
                        const label = isWeak ? 'MUST FIX 🔥' : isStrong ? 'STRONG ✅' : 'IMPROVE ⚠️';
                        return (
                          <div
                            key={ch.name}
                            title={`Accuracy: ${ch.accuracy}% | Attempts: ${ch.attempts}`}
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
                            </div>
                            <div className="text-[8px] uppercase font-bold opacity-60 mt-0.5 tracking-wider">{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Mistake Analysis — real data */}
            <TabsContent value="behavioral" className="animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-purple-500" />
                    <h3 className="text-foreground font-bold">Mistake Distribution</h3>
                  </div>
                  <p className="text-muted-foreground text-xs mb-4">Based on your self-diagnosed wrong answers.</p>
                  <div className="space-y-3">
                    {[
                      { l: 'Conceptual', v: data.mistakeProfile.conceptual, c: 'bg-red-500' },
                      { l: 'Calculation', v: data.mistakeProfile.calculation, c: 'bg-amber-500' },
                      { l: 'Silly Mistakes', v: data.mistakeProfile.silly, c: 'bg-blue-500' },
                      { l: 'Guessed', v: data.mistakeProfile.guess, c: 'bg-purple-500' },
                    ].map(m => (
                      <div key={m.l}>
                        <div className="flex justify-between text-[11px] font-bold text-muted-foreground mb-1">
                          <span>{m.l}</span>
                          <span>{m.v}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", m.c)} style={{ width: `${m.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {allChapters.length === 0 && (
                    <p className="text-muted-foreground/60 text-xs mt-4">Diagnose your wrong answers during practice to populate this chart.</p>
                  )}
                </div>

                <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <h3 className="text-foreground font-bold">Subject Performance</h3>
                  </div>
                  <div className="space-y-4">
                    {data.subjects.map(s => (
                      <div key={s.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground font-medium">{s.name}</span>
                          <span className={cn(
                            "font-bold",
                            s.accuracy >= 70 ? "text-emerald-500" : s.accuracy >= 50 ? "text-amber-500" : "text-red-500"
                          )}>{s.accuracy}%</span>
                        </div>
                        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700",
                              s.accuracy >= 70 ? "bg-emerald-500" : s.accuracy >= 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${s.accuracy}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.totalAttempted} questions attempted</p>
                      </div>
                    ))}
                    {data.subjects.length === 0 && (
                      <p className="text-muted-foreground text-sm">No subject data yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Real Attempt History */}
            <TabsContent value="real-attempts" className="animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-3">
                {data.recentAttempts.map((att: any, idx: number) => (
                  <div key={idx} className="bg-secondary/40 border border-border p-4 rounded-xl flex items-center justify-between group hover:bg-secondary/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border",
                        att.is_correct ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                      )}>
                        {att.is_correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">{att.questions?.question_text || 'Practice Question'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                            {att.questions?.chapter || att.questions?.topic || 'General'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {new Date(att.attempted_at).toLocaleDateString()}
                          </span>
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

                {data.recentAttempts.length === 0 && (
                  <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground">No attempt history yet.</p>
                    <Button onClick={() => navigate('/practice')} variant="outline" className="mt-4">
                      Start Practicing
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Student Intelligence V2 Tab */}
            <TabsContent value="student-intelligence" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 text-left">
              {(() => {
                const recovery = getRecoveryAnalytics();
                const mockChapters = data.subjects.flatMap(s => s.chapters.map(c => ({
                  id: c.name,
                  name: c.name,
                  concepts: [
                    c.name + " Fundamentals",
                    c.name + " Advanced Application",
                    c.name + " Graphical Analysis"
                  ]
                })));
                const masteryStatuses = getChapterMasteryStatuses(examLabel, mockChapters);

                return (
                  <div className="space-y-6">
                    {/* Recovery Analytics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">First Attempt Accuracy</span>
                        <p className="text-3xl font-black text-emerald-700 mt-1">{recovery.firstAttemptAccuracy}%</p>
                        <p className="text-xs text-muted-foreground mt-2">Accuracy achieved on initial question attempts.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-blue-400">Post-Remediation Accuracy</span>
                        <p className="text-3xl font-black text-blue-700 mt-1">{recovery.postRemediationAccuracy}%</p>
                        <p className="text-xs text-muted-foreground mt-2">Accuracy achieved on follow-up practice questions.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 dark:text-purple-400">Concept Recovery Rate</span>
                        <p className="text-3xl font-black text-purple-700 mt-1">{recovery.conceptRecoveryPct}%</p>
                        <p className="text-xs text-muted-foreground mt-2">Percent of weak concepts successfully recovered.</p>
                      </div>
                    </div>

                    {/* Concept Mastery Heatmap */}
                    <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Concept Mastery Heatmap</h3>
                      <p className="text-xs text-muted-foreground">Classifying specific sub-concept levels across all studied chapters.</p>
                      
                      <div className="space-y-4">
                        {mockChapters.map(chapter => {
                          const status = masteryStatuses[chapter.id];
                          return (
                            <div key={chapter.id} className="space-y-2 border-b border-border/60 pb-3 last:border-b-0">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{chapter.name}</span>
                                <div className="flex gap-2 text-[9px] font-black uppercase">
                                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Mastered: {status?.mastered || 0}</span>
                                  <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Improving: {status?.improving || 0}</span>
                                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Weak: {status?.weak || 0}</span>
                                  <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Critical: {status?.critical || 0}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {chapter.concepts.map(concept => {
                                  // Simple deterministic colors for mockup if cache is empty
                                  const cacheVal = localStorage.getItem('prepentrance_concept_mastery');
                                  const mastery = cacheVal ? JSON.parse(cacheVal)[concept] : null;
                                  
                                  let color = 'bg-slate-100 dark:bg-slate-850 border-slate-200 text-slate-500'; // Not Started
                                  if (mastery) {
                                    if (mastery.level === 'Mastered') color = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450';
                                    else if (mastery.level === 'Improving') color = 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-450';
                                    else if (mastery.level === 'Weak') color = 'bg-amber-500/10 border-amber-500/20 text-amber-650 dark:text-amber-450';
                                    else if (mastery.level === 'Critical') color = 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-450';
                                  }
                                  return (
                                    <span key={concept} className={cn("px-2 py-1 rounded text-[10px] font-bold border", color)}>
                                      {concept}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Misconception Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-card border border-border rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Top Misconceptions Triggered</h4>
                        <div className="space-y-2">
                          <div className="p-3 bg-secondary/30 rounded-xl border border-border flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-slate-800">Sign Convention Swap</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Recurrence Rate: High</p>
                            </div>
                            <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded">Freq: 8</span>
                          </div>
                          <div className="p-3 bg-secondary/30 rounded-xl border border-border flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-slate-800">Formula Variable Misalignment</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Recurrence Rate: Medium</p>
                            </div>
                            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded">Freq: 5</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-card border border-border rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Concept Recovery Overview</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold">Overall Recovery rate</span>
                            <span className="text-slate-800 font-black">{recovery.conceptRecoveryPct}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${recovery.conceptRecoveryPct}%` }} />
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Recovery rate shows the percentage of concepts that moved out of Critical or Weak levels after completing follow-up remediation practice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>

        </div>

        {/* Action CTA */}
        {weakest && (
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Your next focus area</p>
              <p className="text-foreground font-bold text-lg">{weakest.name} · {weakest.accuracy}% accuracy</p>
              <p className="text-muted-foreground text-sm">{weakest.subject}</p>
            </div>
            <Button onClick={() => navigate('/practice')} className="bg-accent text-primary-foreground hover:bg-accent/90 shrink-0">
              <Zap className="w-4 h-4 mr-2" />
              Practice This Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
