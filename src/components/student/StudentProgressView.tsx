import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Target, Clock, BookOpen, CheckCircle2,
  BarChart3, AlertCircle, ChevronDown, ChevronUp, History
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttemptRow {
  id: string;
  created_at: string;
  is_correct: boolean;
  topic: string;
  subtopic: string;
  time_taken_seconds: number;
  confidence_level: string | null;
  subject: string;
}

interface WeakTopic {
  subtopic: string;
  wrong_count: number;
  total: number;
  accuracy: number;
}

interface ProgressData {
  totalAttempts: number;
  accuracy: number;
  accuracyBySubject: Record<string, { correct: number; total: number }>;
  weakTopics: WeakTopic[];
  recentAttempts: AttemptRow[];
  streakDays: number;
  last7DayAttempts: number;
}

interface StudentProgressViewProps {
  studentId?: string; // if undefined, uses auth user
  batchRank?: number;
  batchTotal?: number;
  showDrillDown?: boolean; // for teacher view with full layers
  compact?: boolean;
}

const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Chemistry: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Mathematics: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Maths: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Accounts: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Economics: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Business Studies': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Biology: 'text-green-400 bg-green-500/10 border-green-500/20',
};

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  studentId,
  batchRank,
  batchTotal,
  showDrillDown = false,
  compact = false,
}) => {
  const { user } = useAuth();
  const targetId = studentId || user?.id;
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drillLayer, setDrillLayer] = useState<'summary' | 'recent' | 'full'>('summary');
  const [recentPage, setRecentPage] = useState(0);

  useEffect(() => {
    if (!targetId) return;
    fetchProgress();
  }, [targetId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      // Fetch all attempts — cast to any to bypass schema type lag
      const { data: attempts } = await (supabase as any)
        .from('user_mcq_attempts')
        .select('id,created_at,is_correct,topic,subtopic,time_taken_seconds,confidence_level,subject')
        .eq('user_id', targetId!)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!attempts) { setLoading(false); return; }

      const totalAttempts = attempts.length;
      const correctCount = attempts.filter(a => a.is_correct).length;
      const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

      // By subject
      const subjectMap: Record<string, { correct: number; total: number }> = {};
      attempts.forEach(a => {
        const sub = a.subject || 'Unknown';
        if (!subjectMap[sub]) subjectMap[sub] = { correct: 0, total: 0 };
        subjectMap[sub].total++;
        if (a.is_correct) subjectMap[sub].correct++;
      });

      // Weak topics
      const topicMap: Record<string, { wrong: number; total: number }> = {};
      attempts.forEach(a => {
        const key = `${a.subtopic || a.topic}`;
        if (!topicMap[key]) topicMap[key] = { wrong: 0, total: 0 };
        topicMap[key].total++;
        if (!a.is_correct) topicMap[key].wrong++;
      });

      const weakTopics: WeakTopic[] = Object.entries(topicMap)
        .map(([subtopic, v]) => ({
          subtopic,
          wrong_count: v.wrong,
          total: v.total,
          accuracy: Math.round(((v.total - v.wrong) / v.total) * 100),
        }))
        .filter(t => t.total >= 3 && t.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 8);

      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const last7DayAttempts = attempts.filter(a => new Date(a.created_at) > sevenDaysAgo).length;

      setData({
        totalAttempts,
        accuracy,
        accuracyBySubject: subjectMap,
        weakTopics,
        recentAttempts: attempts as AttemptRow[],
        streakDays: 0, // placeholder
        last7DayAttempts,
      });
    } catch (err) {
      console.error('Failed to fetch student progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No attempt data found yet.</p>
      </div>
    );
  }

  const accuracyColor = data.accuracy >= 70 ? 'text-emerald-400' : data.accuracy >= 50 ? 'text-amber-400' : 'text-red-400';
  const accuracyBg = data.accuracy >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' : data.accuracy >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  const PAGE_SIZE = 50;
  const recentSlice = data.recentAttempts.slice(recentPage * PAGE_SIZE, (recentPage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* ── Summary KPIs ── */}
      <div className={cn('grid gap-3', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4')}>
        <div className={cn('rounded-2xl border p-4', accuracyBg)}>
          <p className={cn('text-2xl font-black', accuracyColor)}>{data.accuracy}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">Accuracy</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-2xl font-black text-foreground">{data.totalAttempts}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Attempts</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-2xl font-black text-foreground">{data.last7DayAttempts}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Last 7 Days</p>
        </div>
        {batchRank && batchTotal ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-2xl font-black text-accent">#{batchRank}</p>
            <p className="text-xs text-muted-foreground mt-0.5">of {batchTotal} in batch</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-2xl font-black text-foreground">{data.weakTopics.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Weak Topics</p>
          </div>
        )}
      </div>

      {/* ── Per-Subject Accuracy ── */}
      {Object.keys(data.accuracyBySubject).length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" /> Accuracy by Subject
          </h3>
          <div className="space-y-3">
            {Object.entries(data.accuracyBySubject)
              .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
              .map(([subject, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              const colorCls = SUBJECT_COLORS[subject] || 'text-foreground bg-secondary border-border';
              return (
                <div key={subject} className="flex items-center gap-3">
                  <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border min-w-[90px] text-center', colorCls)}>
                    {subject}
                  </span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-10 text-right">{pct}%</span>
                  <span className="text-[10px] text-muted-foreground">{stats.total}q</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Weak Topics ── */}
      {data.weakTopics.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" /> Weak Topics
          </h3>
          <div className="space-y-2">
            {data.weakTopics.map((topic, i) => (
              <div key={topic.subtopic} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-muted-foreground w-4">#{i + 1}</span>
                  <span className="text-xs font-medium text-foreground">{topic.subtopic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${topic.accuracy}%` }} />
                  </div>
                  <span className="text-xs font-bold text-red-400 w-8 text-right">{topic.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Drill-Down Layer (Teacher View) ── */}
      {showDrillDown && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Layer tabs */}
          <div className="flex border-b border-border">
            {(['summary', 'recent', 'full'] as const).map(layer => (
              <button
                key={layer}
                onClick={() => setDrillLayer(layer)}
                className={cn('flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors', drillLayer === layer
                  ? 'bg-accent/10 text-accent border-b-2 border-accent'
                  : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {layer === 'summary' ? '📊 Summary' : layer === 'recent' ? '🕑 Recent 200' : '📁 Full History'}
              </button>
            ))}
          </div>

          <div className="p-5">
            {drillLayer === 'summary' && (
              <p className="text-sm text-muted-foreground">Switch to Recent or Full History to see individual attempt logs.</p>
            )}

            {(drillLayer === 'recent' || drillLayer === 'full') && (
              <div className="space-y-2">
                <div className="grid grid-cols-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-2">
                  <span className="col-span-2">Topic</span>
                  <span className="text-center">Correct</span>
                  <span className="text-center">Time</span>
                  <span className="text-right">Date</span>
                </div>
                {(drillLayer === 'recent' ? data.recentAttempts.slice(0, 200) : recentSlice).map((attempt) => (
                  <div key={attempt.id} className="grid grid-cols-5 text-xs py-1.5 border-b border-border/30 hover:bg-secondary/20 transition-colors items-center">
                    <span className="col-span-2 text-foreground truncate font-medium">{attempt.subtopic || attempt.topic}</span>
                    <span className="text-center">
                      {attempt.is_correct
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                        : <AlertCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />
                      }
                    </span>
                    <span className="text-center text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-0.5" />{attempt.time_taken_seconds}s
                    </span>
                    <span className="text-right text-muted-foreground text-[10px]">
                      {new Date(attempt.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))}
                {drillLayer === 'full' && data.recentAttempts.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setRecentPage(p => Math.max(0, p - 1))}
                      disabled={recentPage === 0}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Page {recentPage + 1} of {Math.ceil(data.recentAttempts.length / PAGE_SIZE)}
                    </span>
                    <button
                      onClick={() => setRecentPage(p => p + 1)}
                      disabled={(recentPage + 1) * PAGE_SIZE >= data.recentAttempts.length}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
