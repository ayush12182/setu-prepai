import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Crown, Medal, Star, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  student_id: string;
  full_name: string;
  avatar_url: string | null;
  score: number;
  accuracy: number;
  questions_attempted: number;
  rank: number;
}

interface BatchWelcomeScreenProps {
  teacherName: string;
  batchName: string;
  batchId: string;
  totalStudents: number;
  onContinue: () => void;
}

const RANK_STYLES: Record<number, { icon: React.ReactNode; color: string; bg: string }> = {
  1: { icon: <Crown className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
  2: { icon: <Medal className="w-4 h-4" />, color: 'text-slate-300', bg: 'bg-slate-400/10 border-slate-400/30' },
  3: { icon: <Medal className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-700/10 border-amber-700/30' },
};

export const BatchWelcomeScreen: React.FC<BatchWelcomeScreenProps> = ({
  teacherName,
  batchName,
  batchId,
  totalStudents,
  onContinue,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loadingLB, setLoadingLB] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.functions.invoke('get-batch-leaderboard', {
          body: { batch_id: batchId, student_id: user?.id, limit: 10 },
        });
        if (!error && data) {
          setLeaderboard(data.leaderboard ?? []);
          setMyRank(data.my_rank ?? null);
        }
      } catch { /* silent */ }
      finally { setLoadingLB(false); }
    };
    fetchLeaderboard();
  }, [batchId]);

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-accent/[0.07] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-emerald-500/[0.05] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md space-y-5"
      >
        {/* Header card */}
        <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-7 border border-white/[0.08] shadow-2xl text-center space-y-4">
          {/* Success ring */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.15 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto"
          >
            <Star className="w-9 h-9 text-emerald-400" />
          </motion.div>

          <div>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">
              Successfully Joined
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
              Welcome to<br />
              <span className="text-accent">{teacherName}'s</span> batch
            </h1>
          </div>

          <div className="bg-white/[0.04] rounded-2xl px-5 py-3 border border-white/[0.06] space-y-1">
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Batch</p>
            <p className="text-white font-semibold text-lg">{batchName}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <Users className="w-4 h-4" />
            <span><span className="font-bold text-white">{totalStudents}</span> students in this batch</span>
          </div>
        </div>

        {/* Leaderboard card */}
        <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-6 border border-white/[0.08] shadow-2xl">
          <div className="flex items-center gap-2.5 mb-5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-white text-base">Batch Leaderboard</h2>
            {myRank !== null && (
              <span className="ml-auto text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                Your rank: #{myRank}
              </span>
            )}
          </div>

          {loadingLB ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-white/30" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm">Be the first to climb the ranks!</p>
              <p className="text-white/20 text-xs mt-1">Start practicing to appear on the leaderboard.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => {
                const rank = entry.rank ?? i + 1;
                const style = RANK_STYLES[rank];
                return (
                  <motion.div
                    key={entry.student_id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                      style ? style.bg : 'bg-white/[0.03] border-white/[0.06]'
                    )}
                  >
                    {/* Rank badge */}
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                      style ? cn(style.color, 'border', style.bg) : 'text-white/40 bg-white/[0.05] border border-white/10'
                    )}>
                      {style ? style.icon : rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-black text-accent shrink-0">
                      {entry.avatar_url
                        ? <img src={entry.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        : initials(entry.full_name || 'S')}
                    </div>

                    {/* Name + stats */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{entry.full_name}</p>
                      <p className="text-[10px] text-white/30">
                        {entry.questions_attempted} Qs · {entry.accuracy.toFixed(0)}% accuracy
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className={cn('text-sm font-black', style?.color ?? 'text-white/70')}>
                        {entry.score.toFixed(0)}
                      </p>
                      <p className="text-[9px] text-white/20 uppercase tracking-wider">pts</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          onClick={onContinue}
          className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-primary font-bold text-base shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
        >
          Start Learning <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};
