import React from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Users, Search, Eye } from 'lucide-react';

export default function B2BStudents() {
  const students = [
    { id: '1', name: 'Arjun Singh', batch: 'JEE 2026 – Alpha', accuracy: 78, status: 'stable' },
    { id: '2', name: 'Priya Sharma', batch: 'JEE 2026 – Beta', accuracy: 42, status: 'at-risk' }
  ];

  return (
    <B2BSidebarLayout title="Students">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Students</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor student progress and identify risks.</p>
        </div>
        
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border">
             <div className="relative w-full max-w-sm">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <input type="text" placeholder="Search students..." className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent/40" />
             </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-secondary/20 text-muted-foreground text-[10px] uppercase font-bold tracking-widest border-b border-border">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map(s => (
                 <tr key={s.id} className="hover:bg-accent/5">
                   <td className="px-6 py-4 font-bold">{s.name}</td>
                   <td className="px-6 py-4 text-xs text-muted-foreground">{s.batch}</td>
                   <td className="px-6 py-4 font-bold text-accent">{s.accuracy}%</td>
                   <td className="px-6 py-4 text-xs uppercase">{s.status}</td>
                   <td className="px-6 py-4 text-right">
                     <button className="text-accent hover:text-white hover:bg-accent p-2 rounded-lg transition-colors"><Eye size={16}/></button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </B2BSidebarLayout>
  );
}
