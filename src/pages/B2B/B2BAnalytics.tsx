import React, { useState, useEffect } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { 
  Users, Target, AlertTriangle, TrendingUp, ChevronRight, 
  Search, Filter, Mail, Share2, UserPlus, Brain, Zap,
  BarChart3, PieChart, Activity, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface StudentAnalytics {
  id: string;
  full_name: string;
  user_id: string;
  score: number;
  accuracy: number;
  confidence: number;
  batch_suggestion: string;
  risk_flag: boolean;
  misconception_density: number;
  weak_topics: string[];
  overall_level: string;
  last_active: string;
}

const B2BAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classIntelligence, setClassIntelligence] = useState<any>(null);
  const [impactStories, setImpactStories] = useState<any[]>([]);
  const [loadingIntel, setLoadingIntel] = useState(false);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get all students linked to this teacher/institution
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, user_id, updated_at,
          learning_profiles (
            accuracy_score, confidence_score, batch_suggestion, 
            risk_flag, misconception_density, weak_topics, overall_level
          )
        `)
        .eq('teacher_id', user?.id);

      if (error) throw error;

      const formatted = (profiles || []).map(p => {
        const lp = p.learning_profiles;
        return {
          id: p.id,
          full_name: p.full_name || 'Unknown Student',
          user_id: p.user_id,
          score: lp?.accuracy_score || 0,
          accuracy: lp?.accuracy_score || 0,
          confidence: lp?.confidence_score || 0,
          batch_suggestion: lp?.batch_suggestion || 'Pending',
          risk_flag: lp?.risk_flag || false,
          misconception_density: lp?.misconception_density || 0,
          weak_topics: lp?.weak_topics || [],
          overall_level: lp?.overall_level || 'beginner',
          last_active: p.updated_at
        };
      });

      setStudents(formatted);
    } catch (err) {
      console.error('Fetch analytics error:', err);
      toast.error('Failed to load class analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassIntelligence = async () => {
    if (!students.length) return;
    setLoadingIntel(true);
    try {
      const { data, error } = await supabase.functions.invoke('aggregate-class-intelligence', {
        body: { classData: students }
      });
      if (error) throw error;
      setClassIntelligence(data);
    } catch (err) {
      console.error('Intel error:', err);
    } finally {
      setLoadingIntel(false);
    }
  };

  useEffect(() => {
    if (students.length > 0) fetchClassIntelligence();
  }, [students]);

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <B2BSidebarLayout title="Class Intelligence">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">
        
        {/* --- ZONE 1: OVERVIEW & HEATMAP --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Class Intelligence Dashboard</h1>
                <p className="text-white/40 text-sm font-medium mt-1">Real-time adaptive metrics for {students.length} students</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 w-64"
                  />
                </div>
                <Button variant="outline" className="border-white/10 text-white/60 gap-2 rounded-xl h-10">
                  <Filter className="w-4 h-4" /> Filter
                </Button>
              </div>
            </div>

            <Card className="bg-[#0D1117] border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Student Performance Matrix
                </h3>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/30">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> High Potential</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Recoverable</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> High Risk</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/25">Student Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/25 text-center">Score</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/25">Intelligence Phase</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/25">Suggested Batch</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/25">Risk Level</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/25 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map((student) => (
                      <motion.tr 
                        key={student.id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center font-black text-accent border border-accent/20">
                              {student.full_name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-accent transition-colors">{student.full_name}</p>
                              <p className="text-[10px] text-white/30 uppercase tracking-tighter">Last Active: {new Date(student.last_active).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center">
                            <p className={`text-sm font-black ${student.accuracy > 70 ? 'text-emerald-400' : student.accuracy > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {Math.round(student.accuracy)}%
                            </p>
                            <div className="w-16 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${student.accuracy > 70 ? 'bg-emerald-500' : student.accuracy > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${student.accuracy}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${student.weak_topics.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-xs font-bold text-white/60">
                              {student.weak_topics.length > 0 ? 'Adaptive Probing' : 'Baseline Clear'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            student.batch_suggestion.includes('Batch A') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            student.batch_suggestion.includes('Batch B') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {student.batch_suggestion}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {student.risk_flag ? (
                            <div className="flex items-center gap-1.5 text-rose-400">
                              <ShieldAlert className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">High Risk</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Stable</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg text-white/30 hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* --- RIGHT PANEL: QUICK STATS --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-[#0D1117] border-white/5 rounded-3xl p-8 space-y-8">
              <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em]">Class Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-2">
                  <Target className="w-5 h-5 text-accent" />
                  <p className="text-2xl font-black text-white">{Math.round(students.reduce((acc, s) => acc + s.accuracy, 0) / (students.length || 1))}%</p>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Avg Accuracy</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <p className="text-2xl font-black text-white">{students.filter(s => s.accuracy > 75).length}</p>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Top Performers</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Placement Distribution</p>
                  <PieChart className="w-4 h-4 text-white/20" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Batch A (Top)', count: students.filter(s => s.batch_suggestion.includes('Batch A')).length, color: 'bg-emerald-500' },
                    { label: 'Batch B (Intermediate)', count: students.filter(s => s.batch_suggestion.includes('Batch B')).length, color: 'bg-blue-500' },
                    { label: 'Batch C (Foundation)', count: students.filter(s => s.batch_suggestion.includes('Batch C')).length, color: 'bg-amber-500' }
                  ].map((b) => (
                    <div key={b.label} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-white/60">
                        <span>{b.label}</span>
                        <span>{b.count} Students</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${b.color}`} style={{ width: `${(b.count / (students.length || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-200/80 leading-relaxed font-medium">
                    {students.filter(s => s.risk_flag).length} students flagged for high risk. Immediate intervention recommended for Algebra prerequisites.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-amber-500/10 border-accent/20 rounded-3xl p-8 relative overflow-hidden group">
              <Zap className="absolute top-[-10px] right-[-10px] w-32 h-32 text-accent/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              <div className="relative z-10 space-y-4">
                <h4 className="text-lg font-black text-white">Auto-Generate Bridge Course</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Based on class-wide weak topics, I've prepared a 7-day module covering Linear Equations and Vector Fundamentals.
                </p>
                <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-black gap-2 h-12 rounded-xl shadow-xl shadow-accent/20">
                   Generate Bridge Course <ArrowRight className="w-4 h-4" />
                 </Button>
              </div>
            </Card>

            {classIntelligence && (
              <Card className="bg-[#0D1117] border-white/5 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-accent" />
                  <h3 className="text-sm font-black text-white/30 uppercase tracking-widest">Class Action Plan</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Immediate Revision</p>
                    <p className="text-xs text-white/70">{classIntelligence.teacher_plan.immediate_revision}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Grouping Strategy</p>
                    <p className="text-xs text-white/70">{classIntelligence.teacher_plan.grouping_strategy}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* --- ZONE 1.5: MISCONCEPTION HOTSPOTS --- */}
        {classIntelligence && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classIntelligence.misconception_hotspots.map((hotspot: any, i: number) => (
              <Card key={i} className="bg-amber-500/5 border-amber-500/10 rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">{hotspot.topic}</h4>
                </div>
                <p className="text-xs text-white/40 leading-relaxed italic">"{hotspot.common_wrong_thinking}"</p>
              </Card>
            ))}
          </div>
        )}

        {/* --- ZONE 2: STUDENT DETAIL MODAL (Phase 2 & 3 Intelligence) --- */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedStudent(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-6xl h-[90vh] bg-[#0D1117] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-8 lg:p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-accent/20 flex items-center justify-center font-black text-2xl text-accent border border-accent/30 shadow-lg shadow-accent/10">
                      {selectedStudent.full_name[0]}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight">{selectedStudent.full_name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                          ID: {selectedStudent.user_id.slice(0, 8)}
                        </span>
                        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                          selectedStudent.overall_level === 'advanced' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          selectedStudent.overall_level === 'intermediate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {selectedStudent.overall_level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 text-white/60 gap-2 h-12 rounded-2xl px-6">
                      <Share2 className="w-4 h-4" /> Share Report
                    </Button>
                    <Button 
                      onClick={() => setSelectedStudent(null)}
                      className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white p-0"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10 custom-scrollbar">
                  
                  {/* Phase 3: Accuracy vs Confidence Layer */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                      <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">Intelligence Segments</h4>
                          <div className="flex items-center gap-4 text-[9px] font-black uppercase text-white/20">
                            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-emerald-500" /> Strong</span>
                            <span className="flex items-center gap-1.5"><Brain className="w-3 h-3 text-amber-500" /> Misconception</span>
                            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-rose-500" /> Fragile</span>
                          </div>
                        </div>
                        
                        <div className="h-64 flex items-end justify-between gap-4 px-4">
                          {['Algebra', 'Mechanics', 'Thermodynamics', 'Calculus', 'Optics'].map((topic, i) => {
                            const h = [80, 45, 60, 30, 90][i];
                            const conf = [70, 90, 40, 20, 85][i];
                            const isMisconception = conf > h + 20;
                            const isFragile = h > conf + 30;

                            return (
                              <div key={topic} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="relative w-full flex items-end justify-center">
                                  {/* Accuracy Bar */}
                                  <motion.div 
                                    initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                    className={`w-10 rounded-t-xl transition-all duration-500 ${
                                      isMisconception ? 'bg-amber-500' : isFragile ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`}
                                  />
                                  {/* Confidence Indicator */}
                                  <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="absolute -top-8 w-12 text-center"
                                  >
                                    <p className="text-[10px] font-black text-white/40">{conf}%</p>
                                    <p className="text-[8px] font-bold text-white/20">CONF</p>
                                  </motion.div>
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-tighter text-center">{topic}</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                           <div className="space-y-4">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                               <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">High Misconception Flag</span>
                             </div>
                             <p className="text-xs text-white/40 leading-relaxed">
                               Student is highly confident in <span className="text-white">Mechanics</span> but accuracy is only 45%. This indicates deep conceptual confusion with sign conventions.
                             </p>
                           </div>
                           <div className="space-y-4">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                               <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Fragile Knowledge Flag</span>
                             </div>
                             <p className="text-xs text-white/40 leading-relaxed">
                               Student has 60% accuracy in <span className="text-white">Thermodynamics</span> but very low confidence (40%). Requires positive reinforcement and more solved examples.
                             </p>
                           </div>
                        </div>
                      </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                      <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-8 space-y-6">
                        <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Mistake Analysis</h4>
                        <div className="space-y-5">
                          {[
                            { label: 'Conceptual', value: Math.round(selectedStudent.misconception_density), color: 'text-amber-400', bg: 'bg-amber-400/10' },
                            { label: 'Calculation', value: 25, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                            { label: 'Interpretation', value: 15, color: 'text-blue-400', bg: 'bg-blue-400/10' }
                          ].map((m) => (
                            <div key={m.label} className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-white/40">{m.label} Errors</span>
                                <span className={m.color}>{m.value}%</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                                  className={`h-full ${m.color.replace('text', 'bg')}`} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <Brain className="w-5 h-5 text-accent" />
                          <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Adaptive Status</h4>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Quadratic Equations</span>
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest">Core Gap</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">
                            Probing failed at "Root Nature" level. Student lacks understanding of discriminant application.
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* ACTION PANEL (MOST IMPORTANT) */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">Intelligence-Driven Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Button className="h-20 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 flex flex-col items-center justify-center gap-1 group">
                        <UserPlus className="w-5 h-5 text-white/20 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Move to Batch A</span>
                      </Button>
                      <Button className="h-20 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 flex flex-col items-center justify-center gap-1 group">
                        <Zap className="w-5 h-5 text-white/20 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Send Bridge Course</span>
                      </Button>
                      <Button className="h-20 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 flex flex-col items-center justify-center gap-1 group">
                        <Mail className="w-5 h-5 text-white/20 group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Notify Parents</span>
                      </Button>
                      <Button className="h-20 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5 flex flex-col items-center justify-center gap-1 group">
                        <RefreshCw className="w-5 h-5 text-white/20 group-hover:text-rose-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Trigger Re-Test</span>
                      </Button>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                     <p className="text-xs font-bold text-white/60">Diagnostic Intelligence Synced</p>
                   </div>
                   <div className="flex gap-4">
                     <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="text-white/40 hover:text-white font-bold text-sm">
                       Close Analysis
                     </Button>
                     <Button className="bg-accent hover:bg-accent/90 text-primary font-black px-8 h-12 rounded-xl shadow-xl shadow-accent/20">
                       Approve Batch Suggestion
                     </Button>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </B2BSidebarLayout>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default B2BAnalytics;
