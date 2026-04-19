import React, { useState, useEffect } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Users, Search, Eye, Loader2, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StudentRow {
  id: string;
  student_id: string;
  full_name: string;
  batch_name: string;
  batch_id: string;
  accuracy: number;
  total_attempted: number;
  status: 'stable' | 'at-risk' | 'top';
  joined_at: string;
}

export default function B2BStudents() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [profile]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const teacherId = profile?.user_id;

      // 1. Get all batches for this teacher (SPEC)
      const { data: batchData } = await (supabase as any)
        .from('batches')
        .select('id, name')
        .eq('is_active', true)
        .eq('teacher_id', teacherId);

      if (!batchData || batchData.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 2. Get all batch members
      const batchIds = batchData.map((b: any) => b.id);
      const { data: memberData } = await (supabase as any)
        .from('batch_students')
        .select('student_id, batch_id, joined_at')
        .in('batch_id', batchIds);

      if (!memberData || memberData.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 3. Get profiles for all students
      const studentIds = memberData.map((m: any) => m.student_id);
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', studentIds);

      const profileMap: Record<string, string> = {};
      (profileData || []).forEach((p: any) => {
        profileMap[p.user_id] = p.full_name || 'Unknown';
      });

      // 4. Get accuracy from session_participants
      const { data: allSessions } = await (supabase as any)
        .from('assessment_sessions')
        .select('id')
        .in('batch_id', batchIds);

      const sessionIds = (allSessions || []).map((s: any) => s.id);
      const accuracyMap: Record<string, { sum: number; count: number }> = {};

      if (sessionIds.length > 0) {
        const { data: parts } = await (supabase as any)
          .from('session_participants')
          .select('student_id, live_accuracy')
          .in('session_id', sessionIds)
          .eq('status', 'SUBMITTED');

        (parts || []).forEach((p: any) => {
          if (!p.student_id) return;
          if (!accuracyMap[p.student_id]) accuracyMap[p.student_id] = { sum: 0, count: 0 };
          accuracyMap[p.student_id].sum += p.live_accuracy || 0;
          accuracyMap[p.student_id].count += 1;
        });
      }

      const batchMap: Record<string, string> = {};
      batchData.forEach((b: any) => { batchMap[b.id] = b.name; });

      const rows: StudentRow[] = memberData.map((m: any) => {
        const accData = accuracyMap[m.student_id];
        const accuracy = accData ? Math.round(accData.sum / accData.count) : 0;
        const total = accData?.count || 0;
        const status: StudentRow['status'] = accuracy >= 70 ? 'top' : accuracy >= 45 ? 'stable' : 'at-risk';

        return {
          id: `${m.batch_id}-${m.student_id}`,
          student_id: m.student_id,
          full_name: profileMap[m.student_id] || 'Unknown Student',
          batch_name: batchMap[m.batch_id] || 'Unknown Batch',
          batch_id: m.batch_id,
          accuracy,
          total_attempted: total,
          status,
          joined_at: m.joined_at,
        };
      });

      setStudents(rows);
    } catch (e) {
      console.error(e);
     } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.batch_name.toLowerCase().includes(search.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: StudentRow['status'] }) => {
    if (status === 'top') return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
        <CheckCircle size={10} /> Top Performer
      </span>
    );
    if (status === 'at-risk') return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
        <AlertTriangle size={10} /> At Risk
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
        <TrendingUp size={10} /> Stable
      </span>
    );
  };

  return (
    <B2BSidebarLayout title="Students">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Students</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor student progress and identify at-risk performers.</p>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Students', value: students.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'At Risk', value: students.filter(s => s.status === 'at-risk').length, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Top Performers', value: students.filter(s => s.status === 'top').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students or batches..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent/40"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">
                {students.length === 0 ? 'No students have joined your batches yet.' : 'No students match your search.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-secondary/20 text-muted-foreground text-[10px] uppercase font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Tests Taken</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                          {s.full_name[0]?.toUpperCase()}
                        </div>
                        <span className="font-bold text-sm">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{s.batch_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.accuracy}%`,
                              background: s.accuracy >= 70 ? '#10b981' : s.accuracy >= 45 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="font-bold text-sm text-accent">{s.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{s.total_attempted}</td>
                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-accent hover:text-white hover:bg-accent p-2 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </B2BSidebarLayout>
  );
}
