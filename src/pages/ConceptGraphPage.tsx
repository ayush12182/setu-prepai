import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Brain, Lock, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface ConceptNode {
  id: string;
  topic: string;
  subject: string;
  status: 'mastered' | 'weak' | 'locked';
  accuracy: number;
  prerequisites: string[];
  dependents: string[];
}

const CONCEPT_MAP: Record<string, { subject: string; prerequisites: string[] }> = {
  'Basic Algebra': { subject: 'Mathematics', prerequisites: [] },
  'Linear Equations': { subject: 'Mathematics', prerequisites: ['Basic Algebra'] },
  'Quadratic Equations': { subject: 'Mathematics', prerequisites: ['Linear Equations'] },
  'Coordinate Geometry': { subject: 'Mathematics', prerequisites: ['Linear Equations'] },
  'Trigonometry': { subject: 'Mathematics', prerequisites: ['Basic Algebra'] },
  'Calculus Basics': { subject: 'Mathematics', prerequisites: ['Quadratic Equations', 'Trigonometry'] },
  'Integration': { subject: 'Mathematics', prerequisites: ['Calculus Basics'] },
  'Vectors': { subject: 'Mathematics', prerequisites: ['Coordinate Geometry', 'Trigonometry'] },
  'Mechanics Basics': { subject: 'Physics', prerequisites: ['Basic Algebra'] },
  'Kinematics': { subject: 'Physics', prerequisites: ['Mechanics Basics', 'Calculus Basics'] },
  'Laws of Motion': { subject: 'Physics', prerequisites: ['Kinematics'] },
  'Work Energy Power': { subject: 'Physics', prerequisites: ['Laws of Motion'] },
  'Thermodynamics': { subject: 'Physics', prerequisites: ['Mechanics Basics'] },
  'Electrostatics': { subject: 'Physics', prerequisites: ['Vectors', 'Calculus Basics'] },
  'Atomic Structure': { subject: 'Chemistry', prerequisites: [] },
  'Chemical Bonding': { subject: 'Chemistry', prerequisites: ['Atomic Structure'] },
  'Periodic Table': { subject: 'Chemistry', prerequisites: ['Atomic Structure'] },
  'Organic Chemistry Basics': { subject: 'Chemistry', prerequisites: ['Chemical Bonding'] },
  'Mole Concept': { subject: 'Chemistry', prerequisites: ['Basic Algebra'] },
  'Chemical Equilibrium': { subject: 'Chemistry', prerequisites: ['Mole Concept'] },
};

const ConceptGraphPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { config } = useExamMode();
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    const loadMastery = async () => {
      if (!user) return;
      try {
        // Get learning profile for weak/strong topics
        const { data: profile } = await supabase
          .from('learning_profiles')
          .select('weak_topics, strong_topics, prerequisite_gaps')
          .eq('user_id', user.id)
          .maybeSingle();

        const weakTopics = (profile?.weak_topics as string[]) || [];
        const strongTopics = (profile?.strong_topics as string[]) || [];
        const gaps = (profile?.prerequisite_gaps as string[]) || [];

        // Build nodes
        const conceptNodes: ConceptNode[] = Object.entries(CONCEPT_MAP).map(([topic, info]) => {
          const isStrong = strongTopics.some(t => topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(topic.toLowerCase()));
          const isWeak = weakTopics.some(t => topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(topic.toLowerCase()));
          const isGap = gaps.some(t => topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(topic.toLowerCase()));

          // Check if prerequisites are met
          const prereqsMet = info.prerequisites.every(prereq => {
            const prereqIsStrong = strongTopics.some(t => prereq.toLowerCase().includes(t.toLowerCase()));
            return prereqIsStrong || !weakTopics.some(t => prereq.toLowerCase().includes(t.toLowerCase()));
          });

          let status: 'mastered' | 'weak' | 'locked' = 'weak';
          if (isStrong) status = 'mastered';
          else if (isGap || !prereqsMet) status = 'locked';

          const dependents = Object.entries(CONCEPT_MAP)
            .filter(([, v]) => v.prerequisites.includes(topic))
            .map(([k]) => k);

          return {
            id: topic,
            topic,
            subject: info.subject,
            status,
            accuracy: isStrong ? 85 : isWeak ? 35 : 50,
            prerequisites: info.prerequisites,
            dependents,
          };
        });

        setNodes(conceptNodes);
      } catch (err) {
        console.error('Failed to load concept graph:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMastery();
  }, [user]);

  const subjects = ['all', ...new Set(nodes.map(n => n.subject))];
  const filteredNodes = selectedSubject === 'all' ? nodes : nodes.filter(n => n.subject === selectedSubject);

  const statusConfig = {
    mastered: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/30', label: 'Mastered' },
    weak: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30', label: 'Needs Work' },
    locked: { icon: Lock, color: 'text-muted-foreground', bg: 'bg-muted/50 border-border', label: 'Locked' },
  };

  const stats = {
    mastered: nodes.filter(n => n.status === 'mastered').length,
    weak: nodes.filter(n => n.status === 'weak').length,
    locked: nodes.filter(n => n.status === 'locked').length,
  };

  if (loading) {
    return (
      <MainLayout title="Concept Graph">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Concept Graph">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-accent" />
              Knowledge Map
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your concept mastery visualization — unlock topics by strengthening prerequisites
            </p>
          </div>
          <Button onClick={() => navigate('/learning-roadmap')} className="gap-2">
            View Roadmap <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center border-green-500/20">
            <p className="text-2xl font-bold text-green-500">{stats.mastered}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </Card>
          <Card className="p-4 text-center border-orange-500/20">
            <p className="text-2xl font-bold text-orange-500">{stats.weak}</p>
            <p className="text-xs text-muted-foreground">Needs Work</p>
          </Card>
          <Card className="p-4 text-center border-border">
            <p className="text-2xl font-bold text-muted-foreground">{stats.locked}</p>
            <p className="text-xs text-muted-foreground">Locked</p>
          </Card>
        </div>

        {/* Subject Filter */}
        <div className="flex gap-2 flex-wrap">
          {subjects.map(s => (
            <Button
              key={s}
              variant={selectedSubject === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject(s)}
            >
              {s === 'all' ? 'All Subjects' : s}
            </Button>
          ))}
        </div>

        {/* Concept Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNodes.map((node, i) => {
            const config = statusConfig[node.status];
            const Icon = config.icon;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`p-4 border-2 ${config.bg} transition-all hover:shadow-md ${node.status === 'locked' ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <h3 className="font-semibold text-foreground text-sm">{node.topic}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                      {node.subject}
                    </span>
                  </div>
                  
                  {node.prerequisites.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-muted-foreground mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {node.prerequisites.map(p => {
                          const prereqNode = nodes.find(n => n.id === p);
                          const isMet = prereqNode?.status === 'mastered';
                          return (
                            <span key={p} className={`px-1.5 py-0.5 rounded text-[10px] ${isMet ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {p}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    {node.status !== 'locked' && (
                      <span className="text-xs text-muted-foreground">{node.accuracy}% mastery</span>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default ConceptGraphPage;
