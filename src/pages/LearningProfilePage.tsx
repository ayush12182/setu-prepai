import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Loader2, RotateCcw, GraduationCap, Bot, Clock, Users, Sparkles, BookOpen, MessageCircle, Video, HeadphonesIcon, Shield, Star, Calendar } from 'lucide-react';

interface LearningProfile {
  concept_score: number;
  accuracy_score: number;
  speed_score: number;
  confidence_score: number;
  weak_topics: string[];
  strong_topics: string[];
  prerequisite_gaps: string[];
  overall_level: string;
}

const LearningProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('learning_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProfile({
            concept_score: Number(data.concept_score) || 0,
            accuracy_score: Number(data.accuracy_score) || 0,
            speed_score: Number(data.speed_score) || 0,
            confidence_score: Number(data.confidence_score) || 0,
            weak_topics: (data.weak_topics as string[]) || [],
            strong_topics: (data.strong_topics as string[]) || [],
            prerequisite_gaps: (data.prerequisite_gaps as string[]) || [],
            overall_level: (data.overall_level as string) || 'beginner',
          });
        }
      } catch (err) {
        console.error('Failed to fetch learning profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4 max-w-md bg-white/[0.04] border-white/[0.08]">
          <Brain className="w-12 h-12 text-white/30 mx-auto" />
          <h2 className="text-xl font-semibold text-white">No Learning Profile Found</h2>
          <p className="text-white/40">Take the diagnostic assessment first to generate your profile.</p>
          <Button onClick={() => navigate('/diagnostic-test')} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Take Diagnostic Test
          </Button>
        </Card>
      </div>
    );
  }

  const scores = [
    { label: 'Concept Understanding', value: profile.concept_score, icon: Brain, color: 'text-sky-400', bg: 'bg-sky-500/10', track: 'bg-sky-500/20' },
    { label: 'Accuracy', value: profile.accuracy_score, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', track: 'bg-emerald-500/20' },
    { label: 'Speed', value: profile.speed_score, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', track: 'bg-amber-500/20' },
    { label: 'Confidence', value: profile.confidence_score, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10', track: 'bg-violet-500/20' },
  ];

  const levelConfig: Record<string, { color: string; emoji: string }> = {
    beginner: { color: 'bg-rose-500/15 text-rose-400 border-rose-500/20', emoji: '🌱' },
    intermediate: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', emoji: '🌿' },
    advanced: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', emoji: '🌳' },
  };

  const level = levelConfig[profile.overall_level] || levelConfig.beginner;
  const avgScore = Math.round((profile.concept_score + profile.accuracy_score + profile.speed_score + profile.confidence_score) / 4);

  const HELP_SECTIONS = [
    {
      icon: GraduationCap,
      title: 'Real Teachers, Real Guidance',
      desc: 'SETU connects you with experienced teachers from top institutes who provide live doubt sessions, concept clarity calls, and personalized mentoring — just like a classroom, but flexible.',
      features: ['1-on-1 doubt solving sessions', 'Weekly concept clarity calls', 'Personalized study plan reviews'],
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/15',
    },
    {
      icon: Bot,
      title: 'AI That Learns With You — 24×7',
      desc: 'Our AI doesn\'t just give answers — it understands your thinking pattern. It adapts questions, detects concept gaps, and builds a learning roadmap that evolves as you grow.',
      features: ['Adaptive practice — difficulty adjusts to you', 'Instant concept explanations in your language', 'Smart revision schedules based on memory science'],
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/15',
    },
    {
      icon: Clock,
      title: 'Never Stuck — Anytime Support',
      desc: 'Whether it\'s 2 PM or 2 AM, SETU is always available. AI handles instant queries while teachers are scheduled for deep learning sessions. You never have to wait to learn.',
      features: ['AI available 24/7 for instant help', 'Teacher sessions bookable on your schedule', 'Voice & text chat for natural learning'],
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/15',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* ═══════════ REPORT HEADER ═══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-4">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Diagnostic Report</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Your Learning Profile</h1>
          <p className="text-white/40 text-sm mb-3">Based on your diagnostic assessment</p>
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border ${level.color}`}>
            {level.emoji} {profile.overall_level.charAt(0).toUpperCase() + profile.overall_level.slice(1)} Level
          </span>
        </motion.div>

        {/* ═══════════ OVERALL SCORE RING ═══════════ */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 mb-4 bg-white/[0.04] border-white/[0.08] text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.06]" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${avgScore * 2.64} 264`} strokeLinecap="round" className="text-accent" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{avgScore}%</span>
                <span className="text-[9px] text-white/30 uppercase tracking-wider">Overall</span>
              </div>
            </div>
            <p className="text-white/35 text-xs">Composite score across all cognitive dimensions</p>
          </Card>
        </motion.div>

        {/* ═══════════ SCORE CARDS ═══════════ */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {scores.map((score, i) => (
            <motion.div key={score.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
              <Card className="p-4 space-y-3 bg-white/[0.04] border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${score.bg} flex items-center justify-center`}>
                    <score.icon className={`w-3.5 h-3.5 ${score.color}`} />
                  </div>
                  <span className="text-xs font-medium text-white/70">{score.label}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-2xl font-bold text-white">{Math.round(score.value)}%</span>
                  <div className={`h-1.5 rounded-full ${score.track}`}>
                    <div className={`h-full rounded-full transition-all duration-1000`} style={{ width: `${score.value}%`, background: `hsl(var(--accent))` }} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ═══════════ AREAS TO IMPROVE ═══════════ */}
        {profile.weak_topics.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card className="p-5 mb-4 space-y-3 bg-white/[0.04] border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white text-sm">Areas to Improve</h3>
                <span className="ml-auto text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{profile.weak_topics.length} topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.weak_topics.map((topic) => (
                  <span key={topic} className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/15">
                    {topic}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ═══════════ STRENGTHS ═══════════ */}
        {profile.strong_topics.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <Card className="p-5 mb-4 space-y-3 bg-white/[0.04] border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white text-sm">Your Strengths</h3>
                <span className="ml-auto text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{profile.strong_topics.length} topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.strong_topics.map((topic) => (
                  <span key={topic} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/15">
                    {topic}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ═══════════ PREREQUISITE GAPS ═══════════ */}
        {profile.prerequisite_gaps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Card className="p-5 mb-6 space-y-3 bg-white/[0.04] border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <h3 className="font-semibold text-white text-sm">Prerequisite Gaps</h3>
              </div>
              <p className="text-xs text-white/35">These foundational concepts need attention before moving forward:</p>
              <div className="flex flex-wrap gap-2">
                {profile.prerequisite_gaps.map((gap) => (
                  <span key={gap} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/15">
                    {gap}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ═══════════ DIVIDER ═══════════ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="my-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/15">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] font-medium text-accent uppercase tracking-wider">How SETU Helps You</span>
            </div>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </motion.div>

        {/* ═══════════ HOW SETU CAN HELP ═══════════ */}
        <div className="space-y-4 mb-6">
          {HELP_SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <Card className={`p-5 bg-white/[0.04] border ${section.border} overflow-hidden relative`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full" />
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center shrink-0`}>
                      <section.icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">{section.title}</h3>
                      <p className="text-white/40 text-xs leading-relaxed">{section.desc}</p>
                    </div>
                  </div>
                  <div className="ml-[52px] space-y-1.5">
                    {section.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                        <span className="text-white/50 text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ═══════════ TEACHER + AI COMPARISON ═══════════ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card className="p-5 mb-6 bg-white/[0.04] border-white/[0.08]">
            <h3 className="font-semibold text-white text-sm text-center mb-4">The Best of Both Worlds</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-sky-500/[0.06] border border-sky-500/10 space-y-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-white">Real Teachers</span>
                </div>
                {['Deep concept clarity', 'Emotional support', 'Exam strategy', 'Motivation & mentoring'].map(item => (
                  <div key={item} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-sky-400" />
                    <span className="text-[10px] text-white/45">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-3.5 rounded-xl bg-violet-500/[0.06] border border-violet-500/10 space-y-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-semibold text-white">AI Enhancement</span>
                </div>
                {['24/7 instant help', 'Adaptive practice', 'Memory-based revision', 'Progress tracking'].map(item => (
                  <div key={item} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-violet-400" />
                    <span className="text-[10px] text-white/45">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-lg bg-accent/[0.06] border border-accent/10 text-center">
              <p className="text-[11px] text-accent font-medium">Together = Personalized learning that actually works</p>
            </div>
          </Card>
        </motion.div>

        {/* ═══════════ WHAT HAPPENS NEXT ═══════════ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card className="p-5 mb-6 bg-white/[0.04] border-white/[0.08]">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              What Happens Next
            </h3>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Your Personalized Roadmap', desc: 'AI creates a week-by-week plan targeting your weak zones first', icon: BookOpen },
                { step: '2', title: 'Smart Practice Sessions', desc: 'Questions adapt to your level — easy when you\'re learning, harder as you grow', icon: Zap },
                { step: '3', title: 'Teacher Check-ins', desc: 'Regular sessions with real teachers to review your progress and guide strategy', icon: Video },
                { step: '4', title: 'Continuous Brain Mapping', desc: 'Your profile updates as you learn — SETU keeps getting smarter about you', icon: Brain },
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 text-accent text-xs font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{item.title}</p>
                    <p className="text-white/35 text-[11px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ═══════════ CTA ═══════════ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="space-y-3">
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full gap-2 h-13 bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white font-semibold shadow-xl shadow-accent/25"
          >
            Start Your Personalized Journey <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/learning-roadmap')}
            className="w-full gap-2 text-white/40 hover:text-white/60"
          >
            View Your Learning Roadmap <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-white/15 mt-6">SETU Learning Report • Generated for you • Updates as you learn</p>
      </div>
    </div>
  );
};

export default LearningProfilePage;
