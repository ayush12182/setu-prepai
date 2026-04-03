// B2BBatches.tsx
import React from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Layers, Plus, Users, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function B2BBatches() {
  const batches = [
    { id: 'b1', name: 'JEE 2026 – Alpha', subject: 'Physics + Maths', students: 32, mentor: 'Dr. Mehta', avgAccuracy: 64, status: 'active' },
    { id: 'b2', name: 'JEE 2026 – Beta', subject: 'All Subjects', students: 28, mentor: 'Mrs. Kapoor', avgAccuracy: 71, status: 'active' }
  ];

  return (
    <B2BSidebarLayout title="Batches">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Manage Batches</h1>
            <p className="text-muted-foreground mt-1 text-sm">View or create class groups.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-accent/30 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${b.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{b.status}</span>
                <div className="text-right"><p className="text-2xl font-bold">{b.avgAccuracy}%</p><p className="text-[10px] text-muted-foreground">avg accuracy</p></div>
              </div>
              <h3 className="text-lg font-bold">{b.name}</h3>
              <p className="text-xs text-muted-foreground">{b.subject}</p>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Users size={12} /> {b.students}</div>
                <div className="flex items-center gap-1"><GraduationCap size={12} /> {b.mentor}</div>
              </div>
              <Button variant="ghost" className="w-full mt-4 justify-between group">
                Analytics <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
          <button className="bg-card/50 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-accent/40 hover:bg-accent/5 transition-all group min-h-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform"><Plus size={24} /></div>
            <p className="font-bold text-muted-foreground group-hover:text-foreground">Create New Batch</p>
          </button>
        </div>
      </div>
    </B2BSidebarLayout>
  );
}
