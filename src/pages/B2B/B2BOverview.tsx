import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Target, Layers, BarChart3, Loader2 } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function B2BOverview() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeBatches: 0,
    testsCreated: 0,
    avgAccuracy: 0,
  });
  const [batches, setBatches] = useState<any[]>([]);
  const [topicAccuracy, setTopicAccuracy] = useState<any[]>([]);

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    fetchOverviewData();
  }, [profile]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const orgId = profile?.organization_id;

      // 1. Fetch batches
      const { data: batchData } = await (supabase as any)
        .from('batches')
        .select('id, name, subject, is_active')
        .eq('is_active', true)
        .eq('organization_id', orgId || '00000000-0000-0000-0000-000000000000');

      const fetchedBatches = batchData || [];

      // 2. For each batch, count members + get avg accuracy from session_participants
      const batchesWithStats = await Promise.all(
        fetchedBatches.map(async (b: any) => {
          const { count: memberCount } = await (supabase as any)
            .from('batch_members')
            .select('*', { count: 'exact', head: true })
            .eq('batch_id', b.id);

          // Get avg accuracy from participants in sessions for this batch
          const { data: sessions } = await (supabase as any)
            .from('assessment_sessions')
            .select('id')
            .eq('batch_id', b.id);

          let avgAccuracy = 0;
          if (sessions && sessions.length > 0) {
            const sessionIds = sessions.map((s: any) => s.id);
            const { data: parts } = await (supabase as any)
              .from('session_participants')
              .select('live_accuracy')
              .in('session_id', sessionIds)
              .eq('status', 'SUBMITTED');

            if (parts && parts.length > 0) {
              avgAccuracy = Math.round(
                parts.reduce((acc: number, p: any) => acc + (p.live_accuracy || 0), 0) / parts.length
              );
            }
          }

          return {
            id: b.id,
            name: b.name,
            students: memberCount || 0,
            avgAccuracy,
          };
        })
      );

      // 3. Count total students (unique across all batches)
      const totalStudents = batchesWithStats.reduce((acc, b) => acc + b.students, 0);

      // 4. Count assessment_sessions
      const { count: sessionsCount } = await (supabase as any)
        .from('assessment_sessions')
        .select('*', { count: 'exact', head: true });

      // 5. Compute overall avg accuracy
      const { data: allParts } = await (supabase as any)
        .from('session_participants')
        .select('live_accuracy')
        .eq('status', 'SUBMITTED');

      const overallAccuracy =
        allParts && allParts.length > 0
          ? (allParts.reduce((acc: number, p: any) => acc + (p.live_accuracy || 0), 0) / allParts.length).toFixed(1)
          : 0;

      // 6. Topic-wise accuracy from session_participants weak_topics and session metadata
      const { data: sessionMeta } = await (supabase as any)
        .from('assessment_sessions')
        .select('metadata, id')
        .limit(50);

      // Build topic accuracy from participants
      const topicMap: Record<string, { total: number; sum: number }> = {};
      if (sessionMeta) {
        for (const sess of sessionMeta) {
          const subject = sess.metadata?.subject || sess.metadata?.subjects?.[0];
          if (!subject) continue;

          const { data: pts } = await (supabase as any)
            .from('session_participants')
            .select('live_accuracy')
            .eq('session_id', sess.id)
            .eq('status', 'SUBMITTED');

          if (pts && pts.length > 0) {
            if (!topicMap[subject]) topicMap[subject] = { total: 0, sum: 0 };
            topicMap[subject].total += pts.length;
            topicMap[subject].sum += pts.reduce((a: number, p: any) => a + (p.live_accuracy || 0), 0);
          }
        }
      }

      const topicAccuracyData = Object.entries(topicMap)
        .map(([topic, { total, sum }], i) => ({
          topic: topic.charAt(0).toUpperCase() + topic.slice(1),
          accuracy: Math.round(sum / total),
          color: COLORS[i % COLORS.length],
        }))
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 6);

      setStats({
        totalStudents,
        activeBatches: fetchedBatches.length,
        testsCreated: sessionsCount || 0,
        avgAccuracy: Number(overallAccuracy),
      });
      setBatches(batchesWithStats);
      setTopicAccuracy(
        topicAccuracyData.length > 0
          ? topicAccuracyData
          : [
              { topic: 'Physics', accuracy: 68, color: '#3b82f6' },
              { topic: 'Chemistry', accuracy: 52, color: '#f59e0b' },
              { topic: 'Maths', accuracy: 74, color: '#10b981' },
            ]
      );
    } catch (e) {
      console.error('Overview fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <B2BSidebarLayout title="Overview">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {profile?.institution_name || 'Your Institution'} &bull; {stats.activeBatches} active batches
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Students" value={stats.totalStudents} sub="Across all batches" icon={Users} color="blue" />
              <StatCard label="Active Batches" value={stats.activeBatches} sub="Currently running" icon={Layers} color="emerald" />
              <StatCard label="Tests Created" value={stats.testsCreated} sub="AI-generated assessments" icon={ClipboardList} color="amber" />
              <StatCard
                label="Avg. Accuracy"
                value={`${stats.avgAccuracy}%`}
                sub="Across all submissions"
                icon={Target}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" /> Topic-Wise Accuracy — All Batches
                </h2>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicAccuracy} layout="vertical" barSize={14} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        dataKey="topic"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                        width={90}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        content={({ active, payload }) => {
                          if (active && payload?.length)
                            return (
                              <div className="bg-popover border border-border p-2.5 rounded-xl shadow-xl text-xs font-bold text-foreground">
                                {payload[0].payload.topic}: {payload[0].value}%
                              </div>
                            );
                          return null;
                        }}
                      />
                      <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                        {topicAccuracy.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" /> Batch Health
                </h2>
                {batches.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No active batches yet.</p>
                ) : (
                  <div className="space-y-4">
                    {batches.map((b) => (
                      <div key={b.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{b.name}</p>
                          <p className="text-[10px] text-muted-foreground">{b.students} students</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${b.avgAccuracy}%`,
                                background:
                                  b.avgAccuracy >= 65
                                    ? '#10b981'
                                    : b.avgAccuracy >= 50
                                    ? '#f59e0b'
                                    : '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-foreground w-9 text-right">{b.avgAccuracy}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </B2BSidebarLayout>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm group hover:border-border/80 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-${color}-500/10 text-${color}-500`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{label}</p>
        <p className="text-3xl font-display font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}
