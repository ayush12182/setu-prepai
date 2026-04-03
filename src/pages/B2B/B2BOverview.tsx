import React from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Target, Layers, BarChart3 } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Mock Data
const ORG = { name: 'Newton Academy', plan: 'pro', city: 'Kota', totalStudents: 124, activeBatches: 4 };
const BATCHES = [
  { id: 'b1', name: 'JEE 2026 – Alpha', students: 32, avgAccuracy: 64 },
  { id: 'b2', name: 'JEE 2026 – Beta', students: 28, avgAccuracy: 71 },
  { id: 'b3', name: 'JEE 2027 – Gamma', students: 36, avgAccuracy: 58 },
  { id: 'b4', name: 'Crash Course', students: 28, avgAccuracy: 47 },
];
const TOPIC_ACCURACY = [
  { topic: 'Mechanics', accuracy: 68, color: '#3b82f6' },
  { topic: 'Electrostatics', accuracy: 52, color: '#f59e0b' },
  { topic: 'Optics', accuracy: 74, color: '#10b981' },
  { topic: 'Thermal', accuracy: 41, color: '#ef4444' },
  { topic: 'Modern Physics', accuracy: 79, color: '#8b5cf6' },
  { topic: 'Calculus', accuracy: 60, color: '#06b6d4' },
];

export default function B2BOverview() {
  return (
    <B2BSidebarLayout title="Overview">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {ORG.city} &bull; {ORG.totalStudents} students &bull; {ORG.activeBatches} active batches
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard label="Total Students" value={ORG.totalStudents} sub="Across all batches" icon={Users} color="blue" />
          <StatCard label="Active Batches" value={ORG.activeBatches} sub="3 mentors assigned" icon={Layers} color="emerald" />
          <StatCard label="Tests Created" value="12" sub="2 scheduled this week" icon={ClipboardList} color="amber" />
          <StatCard label="Avg. Accuracy" value="62.7%" sub="+3.2% vs last week" icon={Target} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" /> Topic-Wise Accuracy — All Batches
            </h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOPIC_ACCURACY} layout="vertical" barSize={14} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} width={90} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={({ active, payload }) => {
                    if (active && payload?.length) return (
                      <div className="bg-popover border border-border p-2.5 rounded-xl shadow-xl text-xs font-bold text-foreground">
                        {payload[0].payload.topic}: {payload[0].value}%
                      </div>
                    ); return null;
                  }} />
                  <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                    {TOPIC_ACCURACY.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Batch Health
            </h2>
            <div className="space-y-4">
              {BATCHES.map(b => (
                <div key={b.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{b.name}</p>
                    <p className="text-[10px] text-muted-foreground">{b.students} students</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${b.avgAccuracy}%`, background: b.avgAccuracy >= 65 ? '#10b981' : b.avgAccuracy >= 50 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <span className="text-xs font-bold text-foreground w-9 text-right">{b.avgAccuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
