import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Users, Brain, AlertTriangle, TrendingUp, Search, ChevronDown, ChevronUp, Loader2, Shield, BarChart3, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface StudentData {
  user_id: string;
  full_name: string | null;
  student_level: string | null;
  target_exam: string | null;
  class: string | null;
  learning_profile: {
    concept_score: number;
    accuracy_score: number;
    speed_score: number;
    confidence_score: number;
    weak_topics: string[];
    strong_topics: string[];
    prerequisite_gaps: string[];
    overall_level: string;
  } | null;
  practice_stats: {
    total_questions_solved: number;
    total_correct: number;
    total_time_seconds: number;
  } | null;
}

interface AIInsight {
  student: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'weakness' | 'level'>('none');
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const hasTeacherRole = data?.some(r => r.role === 'admin' || r.role === 'moderator');
        setIsTeacher(!!hasTeacherRole);

        if (hasTeacherRole) {
          await loadStudents();
        }
      } catch (err) {
        console.error('Role check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, [user]);

  const loadStudents = async () => {
    try {
      // Fetch all student profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch learning profiles
      const { data: learningProfiles } = await supabase
        .from('learning_profiles')
        .select('*');

      // Fetch practice stats
      const { data: practiceStats } = await supabase
        .from('user_practice_stats')
        .select('*');

      const studentData: StudentData[] = (profiles || []).map(p => {
        const lp = learningProfiles?.find(l => l.user_id === p.user_id);
        const ps = practiceStats?.find(s => s.user_id === p.user_id);

        return {
          user_id: p.user_id,
          full_name: p.full_name,
          student_level: p.student_level,
          target_exam: p.target_exam,
          class: p.class,
          learning_profile: lp ? {
            concept_score: Number(lp.concept_score) || 0,
            accuracy_score: Number(lp.accuracy_score) || 0,
            speed_score: Number(lp.speed_score) || 0,
            confidence_score: Number(lp.confidence_score) || 0,
            weak_topics: (lp.weak_topics as string[]) || [],
            strong_topics: (lp.strong_topics as string[]) || [],
            prerequisite_gaps: (lp.prerequisite_gaps as string[]) || [],
            overall_level: (lp.overall_level as string) || 'beginner',
          } : null,
          practice_stats: ps ? {
            total_questions_solved: ps.total_questions_solved,
            total_correct: ps.total_correct,
            total_time_seconds: ps.total_time_seconds,
          } : null,
        };
      });

      setStudents(studentData);
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to load student data');
    }
  };

  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-teacher-insights', {
        body: { students: students.slice(0, 20) },
      });
      if (error) throw error;
      setAiInsights(data?.insights || []);
      toast.success('AI insights generated!');
    } catch (err) {
      console.error('Failed to generate insights:', err);
      toast.error('Failed to generate insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const filteredStudents = students.filter(s =>
    !searchQuery ||
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.target_exam?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group students by weakness
  const getGroupedStudents = () => {
    if (groupBy === 'none') return { 'All Students': filteredStudents };
    if (groupBy === 'level') {
      const groups: Record<string, StudentData[]> = {};
      filteredStudents.forEach(s => {
        const level = s.learning_profile?.overall_level || 'unassessed';
        if (!groups[level]) groups[level] = [];
        groups[level].push(s);
      });
      return groups;
    }
    // Group by weakness
    const weaknessGroups: Record<string, StudentData[]> = {};
    filteredStudents.forEach(s => {
      const weakTopics = s.learning_profile?.weak_topics || [];
      if (weakTopics.length === 0) {
        if (!weaknessGroups['No weaknesses identified']) weaknessGroups['No weaknesses identified'] = [];
        weaknessGroups['No weaknesses identified'].push(s);
      } else {
        weakTopics.forEach(topic => {
          if (!weaknessGroups[topic]) weaknessGroups[topic] = [];
          weaknessGroups[topic].push(s);
        });
      }
    });
    return weaknessGroups;
  };

  if (loading) {
    return (
      <MainLayout title="Teacher Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </MainLayout>
    );
  }

  if (!isTeacher) {
    return (
      <MainLayout title="Teacher Dashboard">
        <Card className="p-8 text-center space-y-4 max-w-md mx-auto mt-20">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
          <p className="text-muted-foreground">
            This dashboard is only available to teachers and administrators.
            Contact your admin to get teacher access.
          </p>
        </Card>
      </MainLayout>
    );
  }

  const grouped = getGroupedStudents();
  const totalStudents = students.length;
  const assessedStudents = students.filter(s => s.learning_profile).length;
  const avgAccuracy = assessedStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.learning_profile?.accuracy_score || 0), 0) / assessedStudents)
    : 0;
  const lowPerformers = students.filter(s => (s.learning_profile?.accuracy_score || 0) < 50).length;

  return (
    <MainLayout title="Teacher Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor student performance, identify gaps, and get AI-powered intervention suggestions
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Total Students</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Assessed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{assessedStudents}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Avg Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgAccuracy}%</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Need Attention</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{lowPerformers}</p>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-semibold text-foreground">AI Intervention Suggestions</h2>
            </div>
            <Button onClick={generateAIInsights} disabled={generatingInsights} size="sm" className="gap-2">
              {generatingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate
            </Button>
          </div>
          {aiInsights.length > 0 ? (
            <div className="space-y-2">
              {aiInsights.map((insight, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  insight.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
                  insight.priority === 'medium' ? 'border-orange-500/30 bg-orange-500/5' :
                  'border-green-500/30 bg-green-500/5'
                }`}>
                  <p className="text-sm font-medium text-foreground">{insight.student}</p>
                  <p className="text-sm text-muted-foreground">{insight.suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Generate" to get AI-powered teaching suggestions based on student data.</p>
          )}
        </Card>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(['none', 'weakness', 'level'] as const).map(g => (
              <Button key={g} variant={groupBy === g ? 'default' : 'outline'} size="sm" onClick={() => setGroupBy(g)}>
                {g === 'none' ? 'All' : g === 'weakness' ? 'By Weakness' : 'By Level'}
              </Button>
            ))}
          </div>
        </div>

        {/* Student Groups */}
        {Object.entries(grouped).map(([groupName, groupStudents]) => (
          <div key={groupName} className="space-y-3">
            {groupBy !== 'none' && (
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                {groupName}
                <span className="text-muted-foreground font-normal">({groupStudents.length})</span>
              </h3>
            )}
            {groupStudents.map((student, si) => {
              const isExpanded = expandedStudent === student.user_id;
              const accuracy = student.practice_stats
                ? Math.round((student.practice_stats.total_correct / Math.max(student.practice_stats.total_questions_solved, 1)) * 100)
                : 0;

              return (
                <motion.div
                  key={student.user_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: si * 0.02 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => setExpandedStudent(isExpanded ? null : student.user_id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                          <span className="text-accent font-semibold text-sm">
                            {(student.full_name || 'S')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{student.full_name || 'Unknown Student'}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.class ? `Class ${student.class}` : ''} · {student.target_exam || 'No exam'} · {student.learning_profile?.overall_level || 'Unassessed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {student.learning_profile && (
                          <div className="hidden sm:flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              (student.learning_profile.accuracy_score || 0) >= 70 ? 'bg-green-500/10 text-green-500' :
                              (student.learning_profile.accuracy_score || 0) >= 40 ? 'bg-orange-500/10 text-orange-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {Math.round(student.learning_profile.accuracy_score)}%
                            </span>
                          </div>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="border-t border-border p-4 space-y-4"
                      >
                        {student.learning_profile ? (
                          <>
                            {/* Scores */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { label: 'Concept', value: student.learning_profile.concept_score, color: 'text-blue-500' },
                                { label: 'Accuracy', value: student.learning_profile.accuracy_score, color: 'text-green-500' },
                                { label: 'Speed', value: student.learning_profile.speed_score, color: 'text-yellow-500' },
                                { label: 'Confidence', value: student.learning_profile.confidence_score, color: 'text-purple-500' },
                              ].map(s => (
                                <div key={s.label} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{s.label}</span>
                                    <span className={`font-medium ${s.color}`}>{Math.round(s.value)}%</span>
                                  </div>
                                  <Progress value={s.value} className="h-1.5" />
                                </div>
                              ))}
                            </div>

                            {/* Weakness Heatmap */}
                            {student.learning_profile.weak_topics.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Weak Areas</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {student.learning_profile.weak_topics.map(t => (
                                    <span key={t} className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs">{t}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {student.learning_profile.prerequisite_gaps.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Prerequisite Gaps</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {student.learning_profile.prerequisite_gaps.map(g => (
                                    <span key={g} className="px-2 py-1 rounded bg-orange-500/10 text-orange-500 text-xs">{g}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No diagnostic data available for this student.</p>
                        )}

                        {student.practice_stats && (
                          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">{student.practice_stats.total_questions_solved}</p>
                              <p className="text-[10px] text-muted-foreground">Questions Solved</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">{accuracy}%</p>
                              <p className="text-[10px] text-muted-foreground">Practice Accuracy</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">{Math.round(student.practice_stats.total_time_seconds / 3600)}h</p>
                              <p className="text-[10px] text-muted-foreground">Study Time</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No students found.</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default TeacherDashboardPage;
