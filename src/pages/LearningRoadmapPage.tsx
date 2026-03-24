import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Map, Loader2, RefreshCw, CheckCircle2, Circle, ArrowRight, Sparkles, Target, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface RoadmapWeek {
  id: string;
  week_number: number;
  title: string;
  focus_area: string;
  topics: { name: string; type: string; duration: string; completed?: boolean }[];
  status: string;
}

const LearningRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmap = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('learning_roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true });

      if (error) throw error;
      setRoadmap((data || []).map(d => ({
        ...d,
        topics: (d.topics as { name: string; type: string; duration: string; completed?: boolean }[]) || [],
      })));
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRoadmap(); }, [user]);

  const generateRoadmap = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning-roadmap', {
        body: { userId: user.id },
      });
      if (error) throw error;
      if (data?.roadmap) {
        // Save generated roadmap weeks
        for (const week of data.roadmap) {
          await supabase.from('learning_roadmaps').insert({
            user_id: user.id,
            week_number: week.week_number,
            title: week.title,
            focus_area: week.focus_area,
            topics: week.topics,
            status: 'pending',
          });
        }
        toast.success('Your personalized roadmap is ready!');
        await fetchRoadmap();
      }
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTopic = async (weekId: string, topicIndex: number) => {
    const week = roadmap.find(w => w.id === weekId);
    if (!week) return;
    const updatedTopics = [...week.topics];
    updatedTopics[topicIndex] = { ...updatedTopics[topicIndex], completed: !updatedTopics[topicIndex].completed };

    await supabase.from('learning_roadmaps')
      .update({ topics: updatedTopics })
      .eq('id', weekId);

    setRoadmap(prev => prev.map(w => w.id === weekId ? { ...w, topics: updatedTopics } : w));
  };

  const weekIcons: Record<string, typeof Target> = {
    'Fix prerequisite gaps': Target,
    'Concept reinforcement': BookOpen,
    'Applied practice': Sparkles,
  };

  if (loading) {
    return (
      <MainLayout title="Learning Roadmap">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Learning Roadmap">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Map className="w-6 h-6 text-accent" />
              Your Learning Path
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated weekly roadmap based on your diagnostic results
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/concept-graph')} size="sm">
              Concept Graph
            </Button>
            <Button onClick={generateRoadmap} disabled={generating} className="gap-2" size="sm">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {roadmap.length > 0 ? 'Regenerate' : 'Generate Roadmap'}
            </Button>
          </div>
        </div>

        {roadmap.length === 0 ? (
          <Card className="p-8 text-center space-y-4">
            <Map className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">No Roadmap Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {user ? 'Generate your personalized learning roadmap based on your diagnostic test results.' : 'Take the diagnostic test first to get your personalized roadmap.'}
            </p>
            <Button onClick={generateRoadmap} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate My Roadmap
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {roadmap.map((week, wi) => {
              const completedCount = week.topics.filter(t => t.completed).length;
              const progress = week.topics.length > 0 ? (completedCount / week.topics.length) * 100 : 0;
              const FocusIcon = weekIcons[week.focus_area] || Target;

              return (
                <motion.div
                  key={week.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: wi * 0.1 }}
                >
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${progress === 100 ? 'bg-green-500/15' : 'bg-accent/15'}`}>
                          {progress === 100 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <FocusIcon className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Week {week.week_number}: {week.title}</h3>
                          <p className="text-xs text-muted-foreground">{week.focus_area}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {completedCount}/{week.topics.length}
                      </span>
                    </div>

                    <Progress value={progress} className="h-2" />

                    <div className="space-y-2">
                      {week.topics.map((topic, ti) => (
                        <button
                          key={ti}
                          onClick={() => toggleTopic(week.id, ti)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          {topic.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${topic.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {topic.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{topic.type} · {topic.duration}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LearningRoadmapPage;
