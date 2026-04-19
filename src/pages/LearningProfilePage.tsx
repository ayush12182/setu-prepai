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
  metadata?: {
    mistake_patterns?: {
      conceptual?: string;
      calculation?: string;
    };
    time_analysis?: string;
    subject_performance?: Record<string, string>;
    action_plan?: {
      what_to_study?: string;
      where_to_start?: string;
      practice_plan?: string;
    };
  };
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
          const profileData = data as any;
          setProfile({
            concept_score: Number(profileData.concept_score) || 0,
            accuracy_score: Number(profileData.accuracy_score) || 0,
            speed_score: Number(profileData.speed_score) || 0,
            confidence_score: Number(profileData.confidence_score) || 0,
            weak_topics: (profileData.weak_topics as string[]) || [],
            strong_topics: (profileData.strong_topics as string[]) || [],
            prerequisite_gaps: (profileData.prerequisite_gaps as string[]) || [],
            overall_level: (profileData.overall_level as string) || 'beginner',
            metadata: (profileData.metadata as any) || {},
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
      desc: 'SETU connects you with experienced teachers from top institutes who provide live doubt sessions, concept clarity calls, and personalized teachering — just like a classroom, but flexible.',
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">Foundation Assessment Report</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/25">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">Your Learning Profile</h1>
          <p className="text-white/50 text-base mb-6">Based on your diagnostic assessment</p>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${level.color}`}>
            {level.emoji} {profile.overall_level.charAt(0).toUpperCase() + profile.overall_level.slice(1)} Level
          </span>
        </motion.div>

        {/* ═══════════ OVERALL SCORE RING ═══════════ */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="p-8 mb-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent blur-2xl" />
            <div className="relative w-32 h-32 mx-auto mb-5">
              <svg className="w-32 h-32 -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.08]" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${avgScore * 2.64} 264`} strokeLinecap="round" className="text-accent drop-shadow-[0_0_8px_rgba(232,154,60,0.8)] transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white drop-shadow-md">{avgScore}%</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium mt-0.5">Overall</span>
              </div>
            </div>
            <p className="text-white/40 text-sm font-medium">Composite score across all cognitive dimensions</p>
          </div>
        </motion.div>

        {/* ═══════════ SUBJECT WISE PERFORMANCE ═══════════ */}
        {profile.metadata?.subject_performance && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" /> Subject Proficiency
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(profile.metadata.subject_performance).map(([subj, level]) => (
                  <div key={subj} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <p className="text-white/40 text-[10px] mb-1">{subj}</p>
                    <span className={`text-xs font-bold uppercase ${
                      level === 'strong' ? 'text-emerald-400' :
                      level === 'weak' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ AI ANALYSIS: MISTAKE PATTERNS & TIME ═══════════ */}
        {(profile.metadata?.mistake_patterns || profile.metadata?.time_analysis) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
              <h4 className="text-[11px] font-bold text-white/40 uppercase mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Mistake Patterns
              </h4>
              <p className="text-xs text-white/70 leading-relaxed italic">
                {profile.metadata?.mistake_patterns?.conceptual || profile.metadata?.mistake_patterns?.calculation || "Analyzing your cognitive footprint..."}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
              <h4 className="text-[11px] font-bold text-white/40 uppercase mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Time Analysis
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {profile.metadata?.time_analysis || "Consistent response times detected across core topics."}
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════ AI ACTION PLAN ═══════════ */}
        {profile.metadata?.action_plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-accent/10 via-amber-600/5 to-transparent border border-accent/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-16 h-16 text-accent" />
              </div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Your Foundation Roadmap
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-accent uppercase mb-1">What to study</h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {profile.metadata.action_plan.what_to_study}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 p-3 rounded-xl bg-accent/10 border border-accent/10">
                    <h4 className="text-[10px] font-bold text-accent uppercase mb-1">Where to start</h4>
                    <p className="text-sm font-semibold text-white">
                      {profile.metadata.action_plan.where_to_start}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase mb-2">Practice Plan</h4>
                  <p className="text-xs text-white/60 leading-relaxed italic">
                    {profile.metadata.action_plan.practice_plan}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ SCORE CARDS ═══════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {scores.map((score, i) => (
            <motion.div key={score.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
              <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${score.bg} opacity-50 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500`} />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl ${score.bg} border border-white/5 flex items-center justify-center shadow-inner`}>
                      <score.icon className={`w-4 h-4 ${score.color}`} />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">{score.label}</span>
                  </div>

                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-bold text-white tracking-tight">{Math.round(score.value)}%</span>
                  </div>

                  <div className={`h-1.5 rounded-full overflow-hidden ${score.track}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-1000 relative`}
                      style={{ width: `${score.value}%`, backgroundColor: 'currentColor', color: `var(--${score.color.split('-')[1]})` }}
                    >
                      <div className="absolute inset-0 bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══════════ AREAS TO IMPROVE ═══════════ */}
        {profile.weak_topics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="p-6 mb-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 hover:from-amber-500/15 hover:to-amber-500/10 border border-amber-500/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-10 -translate-y-10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center -ml-1 shadow-inner shadow-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-50 text-base">Areas to Improve</h3>
                    <p className="text-amber-200/50 text-[11px] font-medium uppercase tracking-wider">Priority Focus Zones</p>
                  </div>
                  <span className="ml-auto text-xs font-medium text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full shadow-sm">
                    {profile.weak_topics.length} topics
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.weak_topics.map((topic) => (
                    <span key={topic} className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-sm font-medium border border-amber-500/20 hover:border-amber-400/40 transition-colors shadow-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ STRENGTHS ═══════════ */}
        {profile.strong_topics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <div className="p-6 mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/15 hover:to-emerald-500/10 border border-emerald-500/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-10 -translate-y-10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center -ml-1 shadow-inner shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-50 text-base">Your Strengths</h3>
                    <p className="text-emerald-200/50 text-[11px] font-medium uppercase tracking-wider">Mastered Concepts</p>
                  </div>
                  <span className="ml-auto text-xs font-medium text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full shadow-sm">
                    {profile.strong_topics.length} topics
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.strong_topics.map((topic) => (
                    <span key={topic} className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 text-sm font-medium border border-emerald-500/20 hover:border-emerald-400/40 transition-colors shadow-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ PREREQUISITE GAPS ═══════════ */}
        {profile.prerequisite_gaps.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="p-6 mb-8 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 hover:from-rose-500/15 hover:to-rose-500/10 border border-rose-500/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-10 -translate-y-10" />
              <div className="relative">
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center -ml-1 shrink-0 shadow-inner shadow-rose-500/20">
                    <Target className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rose-50 text-base">Prerequisite Gaps</h3>
                    <p className="text-rose-200/70 text-xs mt-1 leading-relaxed">These foundational concepts need attention before moving forward to advanced chapters.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-12">
                  {profile.prerequisite_gaps.map((gap) => (
                    <span key={gap} className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-sm font-medium border border-rose-500/20 hover:border-rose-400/40 transition-colors shadow-sm">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
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
              <div className={`p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 overflow-hidden relative group`}>
                <div className={`absolute top-0 right-0 w-40 h-40 ${section.bg} blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 translate-x-10 -translate-y-10`} />
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${section.bg} border border-white/5 flex items-center justify-center shrink-0 shadow-inner`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div className="pt-0.5">
                      <h3 className="font-semibold text-white text-base mb-1.5">{section.title}</h3>
                      <p className="text-white/40 text-xs leading-relaxed max-w-sm">{section.desc}</p>
                    </div>
                  </div>
                  <div className="ml-16 space-y-2">
                    {section.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-white/60 text-xs">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══════════ TEACHER + AI COMPARISON ═══════════ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <div className="p-6 mb-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <h3 className="font-semibold text-white text-sm text-center mb-5 tracking-wide uppercase opacity-80">The Best of Both Worlds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-sky-500/[0.04] border border-sky-500/10 space-y-3">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-sky-500/10">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-semibold text-sky-50">Real Teachers</span>
                </div>
                {['Deep concept clarity', 'Emotional support', 'Exam strategy', 'Motivation & teachering'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span className="text-xs text-white/50 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/10 space-y-3">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-violet-500/10">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-violet-50">AI Enhancement</span>
                </div>
                {['24/7 instant help', 'Adaptive practice', 'Memory-based revision', 'Progress tracking'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span className="text-xs text-white/50 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 p-3 rounded-lg bg-accent/[0.08] border border-accent/15 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-xs text-accent font-semibold tracking-wide">Together = Personalized learning that actually works</p>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ WHAT HAPPENS NEXT ═══════════ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <div className="p-6 mb-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] relative">
            <h3 className="font-semibold text-white text-base mb-6 flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-accent" />
              What Happens Next
            </h3>
            <div className="space-y-5 relative">
              <div className="absolute left-4 top-4 bottom-4 w-px bg-white/5" />
              {[
                { step: '1', title: 'Your Personalized Roadmap', desc: 'AI creates a week-by-week plan targeting your weak zones first', icon: BookOpen },
                { step: '2', title: 'Smart Practice Sessions', desc: 'Questions adapt to your level — easy when you\'re learning, harder as you grow', icon: Zap },
                { step: '3', title: 'Teacher Check-ins', desc: 'Regular sessions with real teachers to review your progress and guide strategy', icon: Video },
                { step: '4', title: 'Continuous Brain Mapping', desc: 'Your profile updates as you learn — SETU keeps getting smarter about you', icon: Brain },
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-slate-900 flex items-center justify-center shrink-0 text-accent text-sm font-bold shadow-sm backdrop-blur-md">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <p className="text-white text-sm font-semibold mb-0.5">{item.title}</p>
                    <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
      </div >
    </div >
  );
};

export default LearningProfilePage;
