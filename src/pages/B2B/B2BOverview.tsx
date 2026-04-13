import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Target, Layers, BarChart3, Loader2 } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

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
      if (!orgId) {
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase as any).rpc('get_b2b_overview_stats', {
        p_organization_id: orgId
      });

      if (error) throw error;

      setStats({
        totalStudents: data.totalStudents,
        activeBatches: data.activeBatches,
        testsCreated: data.testsCreated,
        avgAccuracy: data.avgAccuracy,
      });

      setBatches(data.batches || []);

      const topicAccuracyData = (data.topicAccuracy || [])
        .map((t: any, i: number) => ({
          ...t,
          topic: t.topic.charAt(0).toUpperCase() + t.topic.slice(1),
          color: COLORS[i % COLORS.length],
        }))
        .sort((a: any, b: any) => b.accuracy - a.accuracy)
        .slice(0, 6);

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
      toast.error('Failed to load dashboard analytics');
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
