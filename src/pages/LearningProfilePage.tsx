import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Loader2, RotateCcw } from 'lucide-react';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">No Learning Profile Found</h2>
          <p className="text-muted-foreground">Take the diagnostic test first to generate your profile.</p>
          <Button onClick={() => navigate('/diagnostic-test')} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Take Diagnostic Test
          </Button>
        </Card>
      </div>
    );
  }

  const scores = [
    { label: 'Concept Understanding', value: profile.concept_score, icon: Brain, color: 'text-blue-500' },
    { label: 'Accuracy', value: profile.accuracy_score, icon: Target, color: 'text-green-500' },
    { label: 'Speed', value: profile.speed_score, icon: Zap, color: 'text-yellow-500' },
    { label: 'Confidence', value: profile.confidence_score, icon: TrendingUp, color: 'text-purple-500' },
  ];

  const levelColors: Record<string, string> = {
    beginner: 'bg-red-500/15 text-red-500',
    intermediate: 'bg-yellow-500/15 text-yellow-500',
    advanced: 'bg-green-500/15 text-green-500',
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Your Learning Profile</h1>
          <p className="text-muted-foreground">Based on your diagnostic assessment</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${levelColors[profile.overall_level] || levelColors.beginner}`}>
            {profile.overall_level.charAt(0).toUpperCase() + profile.overall_level.slice(1)} Level
          </span>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 gap-3">
          {scores.map((score, i) => (
            <motion.div
              key={score.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <score.icon className={`w-5 h-5 ${score.color}`} />
                  <span className="text-sm font-medium text-foreground">{score.label}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-foreground">{Math.round(score.value)}%</span>
                  </div>
                  <Progress value={score.value} className="h-2" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weak Topics */}
        {profile.weak_topics.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-foreground">Areas to Improve</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.weak_topics.map((topic) => (
                  <span key={topic} className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-sm font-medium border border-orange-500/20">
                    {topic}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Strong Topics */}
        {profile.strong_topics.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-foreground">Your Strengths</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.strong_topics.map((topic) => (
                  <span key={topic} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                    {topic}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Prerequisite Gaps */}
        {profile.prerequisite_gaps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-foreground">Prerequisite Gaps</h3>
              </div>
              <p className="text-sm text-muted-foreground">These foundational topics need attention before moving forward:</p>
              <div className="flex flex-wrap gap-2">
                {profile.prerequisite_gaps.map((gap) => (
                  <span key={gap} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
                    {gap}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full gap-2"
          >
            Start Your Personalized Journey
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default LearningProfilePage;
