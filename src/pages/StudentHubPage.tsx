import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, BarChart3, ChevronRight,
  Layers, Target, Zap, Brain, ShieldCheck,
  ClipboardList, ArrowRight, Play, Link, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StudentProgressView } from '@/components/student/StudentProgressView';
import { useB2BManager } from '@/hooks/useB2BManager';
import { toast } from 'sonner';
import { getSubjectsForExam } from '@/lib/streamSubjects';
import { joinTeacherByCode } from '@/lib/studentActivity';
import { supabase } from '@/integrations/supabase/client';

type Tab = 'notes' | 'practice' | 'progress';



// ─── DIFFICULTY COLORS ───
const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const StudentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  // ─── Dynamic subjects based on student's target_exam ───
  const streamSubjects = getSubjectsForExam(profile?.target_exam);
  const DEMO_NOTES = streamSubjects.map(s => ({
    subject: s.label,
    color: s.color,
    bg: s.bg,
    chapters: s.chapters.map((ch, i) => ({ ...ch, completed: i === 0 }))
  }));
  const DEMO_PRACTICE = streamSubjects.flatMap(s =>
    s.chapters.slice(0, 2).map(ch => ({
      subject: s.label,
      topic: ch.title,
      subtopic: ch.title,
      difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
      qCount: 20 + Math.floor(Math.random() * 20),
    }))
  );

  const [expandedSubject, setExpandedSubject] = useState<string | null>(streamSubjects[0]?.label || null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [myTeachers, setMyTeachers] = useState<any[]>([]);
  const { joinBatchByCode, loading } = useB2BManager();

  // Fetch linked teachers
  useEffect(() => {
    if (!user) return;
    (supabase.from as any)('student_teacher_links')
      .select('teacher_id, subject, exam_type, joined_at')
      .eq('student_id', user.id)
      .eq('is_active', true)
      .then(({ data }: any) => setMyTeachers(data || []));
  }, [user]);

  const handleJoinTeacher = async () => {
    if (!joinCode.trim()) { toast.error('Enter a code'); return; }
    setJoiningCode(true);
    const result = await joinTeacherByCode(joinCode);
    if (result.success) {
      toast.success(result.message);
      setJoinCode('');
      // Refresh teachers
      if (user) {
        const { data } = await (supabase.from as any)('student_teacher_links')
          .select('teacher_id, subject, exam_type, joined_at')
          .eq('student_id', user.id)
          .eq('is_active', true);
        setMyTeachers(data || []);
      }
    } else {
      toast.error(result.message);
    }
    setJoiningCode(false);
  };

  const handleJoinByCode = async () => {
    if (!joinCode || joinCode.length !== 6) {
      toast.error('Please enter a 6-digit join code');
      return;
    }
    const batch = await joinBatchByCode(joinCode);
    if (batch) {
      setShowJoinModal(false);
      setJoinCode('');
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  const TABS = [
    { id: 'notes' as Tab, label: 'My Notes', icon: BookOpen, emoji: '📚' },
    { id: 'practice' as Tab, label: 'Practice', icon: PenTool, emoji: '✏️' },
    { id: 'progress' as Tab, label: 'My Progress', icon: BarChart3, emoji: '📊' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-base leading-tight">SETU Student Hub</h1>
              <p className="text-xs text-muted-foreground">Welcome, {displayName}</p>
            </div>
          </div>
          {/* Minimal nav — no distraction */}
          <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-xl border border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowJoinModal(true)}
            className="ml-2 h-9 rounded-xl border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 transition-colors font-bold text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1" /> Join Batch
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <AnimatePresence>
          {showJoinModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && setShowJoinModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative z-10 bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm p-6 overflow-hidden">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">Join Classroom</h2>
                  <p className="text-xs text-muted-foreground mt-1">Enter the 6-digit code provided by your mentor</p>
                </div>
                <div>
                  <input 
                    type="text" 
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX" 
                    maxLength={6}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 font-mono text-2xl tracking-[0.25em] text-center text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-accent/40 mb-4" 
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setShowJoinModal(false)} disabled={loading}>Cancel</Button>
                    <Button className="flex-1 h-11 rounded-xl bg-accent text-white font-bold" onClick={handleJoinByCode} disabled={loading || joinCode.length !== 6}>
                      {loading ? 'Joining...' : 'Join'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">

          {/* ═══════════ NOTES TAB ═══════════ */}
          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-foreground">Chapter-wise Notes</h2>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border">
                  {DEMO_NOTES.reduce((s, sub) => s + sub.chapters.filter(c => c.completed).length, 0)} / {DEMO_NOTES.reduce((s, sub) => s + sub.chapters.length, 0)} chapters read
                </span>
              </div>

              {DEMO_NOTES.map(subject => (
                <div key={subject.subject} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedSubject(expandedSubject === subject.subject ? null : subject.subject)}
                    className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', subject.bg)}>
                        <BookOpen className={cn('w-5 h-5', subject.color)} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{subject.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {subject.chapters.filter(c => c.completed).length}/{subject.chapters.length} chapters
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={cn('w-4 h-4 text-muted-foreground transition-transform', expandedSubject === subject.subject && 'rotate-90')} />
                  </button>

                  {expandedSubject === subject.subject && (
                    <div className="border-t border-border divide-y divide-border">
                      {subject.chapters.map(chapter => (
                        <button
                          key={chapter.title}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary/10 transition-colors text-left"
                          onClick={() => navigate('/learn')}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                              chapter.completed ? 'bg-emerald-500 border-emerald-500' : 'border-border'
                            )}>
                              {chapter.completed && <span className="text-[8px] text-white font-bold">✓</span>}
                            </div>
                            <span className={cn('text-sm font-medium', chapter.completed ? 'text-muted-foreground line-through' : 'text-foreground')}>
                              {chapter.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">{chapter.pages} pages</span>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* ═══════════ PRACTICE TAB ═══════════ */}
          {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-foreground">Practice Questions</h2>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border">
                  10k+ Verified
                </span>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Today\'s Goal', value: '20 Qs', icon: Target, color: 'text-accent' },
                  { label: 'Attempted', value: '14', icon: ClipboardList, color: 'text-emerald-400' },
                  { label: 'Accuracy', value: '71%', icon: Zap, color: 'text-amber-400' },
                ].map(card => (
                  <div key={card.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                    <card.icon className={cn('w-5 h-5 mx-auto mb-1.5', card.color)} />
                    <p className="font-black text-foreground text-lg">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Practice topic list */}
              <div className="space-y-3">
                {DEMO_PRACTICE.map(topic => (
                  <div key={`${topic.subject}-${topic.subtopic}`}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-accent/30 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', DIFF_COLORS[topic.difficulty])}>
                          {topic.difficulty}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">{topic.subject}</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">{topic.subtopic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{topic.topic} • {topic.qCount} questions</p>
                    </div>
                    <Button
                      onClick={() => navigate('/practice')}
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all group-hover:scale-110 shrink-0"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Test Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                
                <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5 flex flex-col h-full hover:border-accent/50 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <p className="text-sm font-bold text-foreground">Adaptive Sprints</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">
                    Short 20-question bursts dynamically selected by AI based on your weakness map. Daily practice to close your conceptual gaps.
                  </p>
                  <Button onClick={() => navigate('/practice?mode=adaptive')} className="w-full bg-accent text-white font-bold group-hover:shadow-[0_0_15px_rgba(var(--accent),0.3)] transition-all">
                    Start Sprint
                  </Button>
                </div>

                <div className="bg-secondary/40 border border-border rounded-2xl p-5 flex flex-col h-full hover:border-muted-foreground/30 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">Static Mock Exam</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">
                    Full JEE/NEET pattern exams. Fixed questions, timed environment, perfectly mirroring the real exam format for serious practice.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/practice?mode=static')} className="w-full font-bold group-hover:bg-secondary">
                    Take Full Test
                  </Button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ═══════════ PROGRESS TAB ═══════════ */}
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* Join Teacher */}
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-2xl p-5">
                <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                  <Link className="w-4 h-4 text-violet-400" /> Join Your Teacher
                </h2>
                <p className="text-xs text-muted-foreground mb-3">Enter the class code your teacher shared with you.</p>
                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NEET7K"
                    maxLength={6}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400/50"
                  />
                  <Button onClick={handleJoinTeacher} disabled={joiningCode} className="bg-violet-500 hover:bg-violet-400 text-white px-5">
                    {joiningCode ? '⏳' : 'Join'}
                  </Button>
                </div>
              </div>

              {/* My Teachers */}
              {myTeachers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">My Teachers</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {myTeachers.map((t: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-black flex items-center justify-center text-xs">T</div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{t.subject}</p>
                            <p className="text-xs text-muted-foreground">{(t.exam_type || '').replace('_', ' ')} · Joined {new Date(t.joined_at).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <span className="text-xs text-violet-400 font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Watching
                        </span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground text-center mt-1">📊 Your teacher can see your progress in real time</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">My Progress</h2>
                <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg border border-border uppercase tracking-wider">Live Data</span>
              </div>
              <StudentProgressView />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentHubPage;
