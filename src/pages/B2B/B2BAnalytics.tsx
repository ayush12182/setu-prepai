import React from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { BarChart3, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const PERCEPTION_DATA = [
  { subject: 'Mechanics', actual: 45, perceived: 70 },
  { subject: 'Electro', actual: 65, perceived: 80 },
  { subject: 'Optics', actual: 75, perceived: 75 },
  { subject: 'Thermal', actual: 30, perceived: 60 },
  { subject: 'Modern', actual: 80, perceived: 85 },
];

const MISTAKE_DISTRIBUTION = [
  { name: 'Conceptual', value: 45, color: '#ef4444' },
  { name: 'Calculation', value: 25, color: '#f59e0b' },
  { name: 'Silly', value: 20, color: '#3b82f6' },
  { name: 'Guessed', value: 10, color: '#8b5cf6' },
];

export default function B2BAnalytics() {
  return (
    <B2BSidebarLayout title="Analytics">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Deep insights into student mastery and engagement.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Perception vs Reality */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" /> Perception vs. Reality Matrix
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Batch confidence against AI-detected conceptual gaps</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest hidden sm:flex">
                <div className="flex items-center gap-1.5 text-accent"><div className="w-2 h-2 rounded-full bg-accent" /> Perceived</div>
                <div className="flex items-center gap-1.5 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-400" /> Actual</div>
              </div>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PERCEPTION_DATA} layout="vertical" barSize={10} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    dataKey="subject" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload?.length) return (
                        <div className="bg-popover border border-border p-3 rounded-xl shadow-xl">
                          <p className="text-xs font-bold text-foreground mb-2">{payload[0].payload.subject}</p>
                          <p className="text-[10px] flex justify-between gap-4">
                            <span className="text-muted-foreground">Perceived:</span>
                            <span className="text-accent font-bold">{payload[1]?.value}%</span>
                          </p>
                          <p className="text-[10px] flex justify-between gap-4">
                            <span className="text-muted-foreground">Actual:</span>
                            <span className="text-blue-400 font-bold">{payload[0]?.value}%</span>
                          </p>
                        </div>
                      );
                      return null;
                    }}
                  />
                  <Bar dataKey="actual" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="perceived" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mistake composition */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Mistake Attribution
            </h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MISTAKE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                    {MISTAKE_DISTRIBUTION.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-popover border border-border px-3 py-1.5 rounded-lg text-[10px] font-bold text-foreground">
                        {payload[0].name}: {payload[0].value}%
                      </div>
                    ) : null}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MISTAKE_DISTRIBUTION.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </B2BSidebarLayout>
  );
}
