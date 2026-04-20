import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Loader2, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentBatchStats } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  accuracy: number;
  questions: number;
  isCurrentUser: boolean;
}

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get the current user's batch
      const { data: membership } = await supabase
        .from('batch_students' as any)
        .select('batch_id')
        .eq('student_id', user.id)
        .maybeSingle();

      if (!membership) {
        setEntries([]);
        return;
      }

      // 2. Get all students in the same batch
      const { data: batchMates } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', 
          (await supabase
            .from('batch_students' as any)
            .select('student_id')
            .eq('batch_id', membership.batch_id)
          ).data?.map(m => m.student_id) || []
        );

      if (!batchMates || batchMates.length === 0) return;

      // 3. Aggregate stats
      const stats = await getStudentBatchStats(batchMates.map(m => m.user_id));

      // 4. Map and sort
      const unsorted = batchMates.map(m => ({
        name: m.full_name || 'Student',
        points: stats[m.user_id]?.points || 0,
        accuracy: stats[m.user_id]?.accuracy || 0,
        questions: stats[m.user_id]?.total_questions || 0,
        isCurrentUser: m.user_id === user.id
      }));

      const sorted = unsorted.sort((a, b) => b.points - a.points);
      
      const ranked = sorted.map((e, idx) => ({
        ...e,
        rank: idx + 1
      }));

      setEntries(ranked.slice(0, 50)); // Top 50
      
      const myRank = ranked.find(r => r.isCurrentUser)?.rank;
      if (myRank) setUserRank(myRank);

    } catch (err) {
      console.error('[Leaderboard] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-accent" />
      <p className="text-white/40 text-sm font-medium">Syncing batch performance...</p>
    </div>
  );

  if (entries.length === 0) return (
    <div className="p-12 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
      <Trophy className="w-12 h-12 mx-auto text-white/20 mb-4" />
      <h3 className="text-xl font-bold mb-2">No Batch Ranking Yet</h3>
      <p className="text-white/40 text-sm max-w-xs mx-auto">
        Join a batch using your teacher's code to see where you stand among peers.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end pb-8">
        {entries[1] && (
          <div className="flex flex-col items-center gap-3 order-1">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-slate-400/20 flex items-center justify-center border-2 border-slate-400/30">
                <Medal className="w-8 h-8 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 bg-slate-400 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold truncate max-w-[80px]">{entries[1].name}</p>
              <p className="text-[10px] text-slate-400 font-black">{entries[1].points} PTS</p>
            </div>
          </div>
        )}
        
        {entries[0] && (
          <div className="flex flex-col items-center gap-4 order-2 pb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center border-4 border-amber-500/30">
                <Crown className="w-10 h-10 text-amber-500" />
              </div>
              <div className="absolute -top-3 -right-3 bg-amber-500 text-amber-900 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ring-4 ring-background">1</div>
            </div>
            <div className="text-center">
              <p className="text-lg font-black truncate max-w-[120px] text-amber-500">{entries[0].name}</p>
              <p className="text-xs text-amber-500/60 font-black">{entries[0].points} PTS</p>
            </div>
          </div>
        )}

        {entries[2] && (
          <div className="flex flex-col items-center gap-3 order-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-orange-600/20 flex items-center justify-center border-2 border-orange-600/30">
                <Medal className="w-8 h-8 text-orange-600" />
              </div>
              <div className="absolute -top-2 -right-2 bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">3</div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold truncate max-w-[80px]">{entries[2].name}</p>
              <p className="text-[10px] text-orange-600 font-black">{entries[2].points} PTS</p>
            </div>
          </div>
        )}
      </div>

      {/* Full List */}
      <div className="bg-white/[0.03] rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Rank</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Student</th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Accuracy</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.map((entry) => (
              <tr 
                key={entry.rank}
                className={cn(
                  "hover:bg-white/[0.02] transition-colors",
                  entry.isCurrentUser && "bg-accent/10 hover:bg-accent/10"
                )}
              >
                <td className="px-6 py-4">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                    entry.rank <= 3 ? "bg-white/10 text-white" : "text-white/30"
                  )}>
                    {entry.rank}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className={cn("text-sm font-bold", entry.isCurrentUser && "text-accent")}>
                    {entry.name} {entry.isCurrentUser && "(You)"}
                  </p>
                  <p className="text-[10px] text-white/30 font-medium">
                    {entry.questions} Questions Solved
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                   <div className="flex items-center justify-center gap-1.5">
                      <Target className="w-3 h-3 text-white/20" />
                      <span className="text-sm font-bold">{entry.accuracy}%</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-accent">
                    <Zap className="w-3 h-3 fill-accent" />
                    <span className="text-sm font-black tracking-tight">{entry.points}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
