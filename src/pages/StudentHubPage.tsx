import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, BarChart3, ChevronRight,
  Layers, Target, Zap, Brain, ShieldCheck,
  ClipboardList, ArrowRight, Play, Link, Eye,
  GraduationCap, Users, FileText, Sparkles, Plus
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

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const StudentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  // Fall back to auth user metadata when profile hasn't reloaded yet (e.g. right after onboarding)
  const targetExam = profile?.target_exam || (user as any)?.user_metadata?.target_exam || null;
  const streamSubjects = getSubjectsForExam(targetExam);

  const DEMO_NOTES = streamSubjects.map(s => ({
    subject: s.label, color: s.color, bg: s.bg,
    chapters: s.chapters.map((ch, i) => ({ ...ch, completed: i === 0 }))
  }));
  const DEMO_PRACTICE = streamSubjects.flatMap(s =>
    s.chapters.slice(0, 2).map(ch => ({
      subject: s.label, topic: ch.title, subtopic: ch.title,
      difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
      qCount: 20 + Math.floor(Math.random() * 20),
    }))
  );

  const [expandedSubject, setExpandedSubject] = useState<string | null>(streamSubjects[0]?.label || null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [myBatches, setMyBatches] = useState<any[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<Record<string, any>>({});
  const [realMaterials, setRealMaterials] = useState<any[]>([]);
  const [realTests, setRealTests] = useState<any[]>([]);
  const { loading: joiningBatch } = useB2BManager();

  useEffect(() => {
    if (!user) return;
    loadStudentBatchData();
  }, [user]);

  const loadStudentBatchData = async () => {
    try {
      const { data: batches } = await (supabase.from as any)('batch_members')
        .select('batch_id, batches(*)')
        .eq('student_id', user?.id);

      const batchList = (batches || []).map((b: any) => b.batches).filter(Boolean);
      setMyBatches(batchList);

      if (batchList.length > 0) {
        const batchIds = batchList.map((b: any) => b.id);
        const mentorIds = [...new Set(batchList.map((b: any) => b.mentor_id).filter(Boolean))];

        // Fetch teacher profiles
        if (mentorIds.length > 0) {
          const { data: teachers } = await (supabase as any)
            .from('profiles').select('user_id, full_name').in('user_id', mentorIds);
          const tMap: Record<string, any> = {};
          (teachers || []).forEach((t: any) => { tMap[t.user_id] = t; });
          setTeacherProfiles(tMap);
        }

        const { data: materials } = await (supabase.from as any)('batch_materials')
          .select('*').in('batch_id', batchIds);
        setRealMaterials(materials || []);

        const { data: tests } = await (supabase.from as any)('assessment_sessions')
          .select('*').in('batch_id', batchIds).eq('status', 'ACTIVE');
        setRealTests(tests || []);
      }
    } catch (err) {
      console.error('Error loading student hub data:', err);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode || joinCode.length !== 6) {
      toast.error('Please enter a 6-digit join code'); return;
    }
    setJoiningCode(true);
    const result = await joinTeacherByCode(joinCode);
    if (result.success) {
      toast.success(result.message);
      setShowJoinModal(false); setJoinCode('');
      loadStudentBatchData();
    } else {
      toast.error(result.message);
    }
    setJoiningCode(false);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const primaryBatch = myBatches[0];
  const primaryTeacher = primaryBatch ? teacherProfiles[primaryBatch.mentor_id] : null;

  const TABS = [
    { id: 'notes' as Tab, label: 'My Notes', emoji: '📚' },
    { id: 'practice' as Tab, label: 'Practice', emoji: '✏️' },
    { id: 'progress' as Tab, label: 'Progress', emoji: '📊' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground text-sm leading-tight truncate">
                {primaryBatch ? primaryBatch.name : 'SETU Student Hub'}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {primaryTeacher
                  ? `👨‍🏫 ${primaryTeacher.full_name} • Welcome, ${displayName}`
                  : `Welcome, ${displayName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
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
              variant="outline" size="sm"
              onClick={() => setShowJoinModal(true)}
              className="h-8 rounded-xl border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 text-[11px] font-bold px-3"
            >
              <Plus className="w-3 h-3 mr-1" /> Join Batch
            </Button>
          </div>
        </div>
      </div>

      {/* ── BATCH BANNER (if enrolled) ── */}
      {primaryBatch && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    Enrolled
                  </span>
                  <span className="text-[10px] text-muted-foreground">{primaryBatch.subject || targetExam || 'All Subjects'}</span>
                </div>
                <p className="font-bold text-foreground text-base mt-0.5 truncate">{primaryBatch.name}</p>
                {primaryTeacher && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Mentor: <span className="text-foreground font-semibold ml-0.5">{primaryTeacher.full_name}</span>
                  </p>
                )}
              </div>
              {myBatches.length > 1 && (
                <span className="text-xs text-muted-foreground shrink-0">+{myBatches.length - 1} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4 pb-20">

        {/* ── JOIN MODAL ── */}
        <AnimatePresence>
          {showJoinModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !joiningCode && setShowJoinModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm p-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">Join Classroom</h2>
                  <p className="text-xs text-muted-foreground mt-1">Enter the 6-digit code provided by your mentor</p>
                </div>
                <input
                  type="text" value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX" maxLength={6}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 font-mono text-2xl tracking-[0.25em] text-center text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-accent/40 mb-4"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setShowJoinModal(false)} disabled={joiningCode}>Cancel</Button>
                  <Button className="flex-1 h-11 rounded-xl bg-accent text-white font-bold" onClick={handleJoinByCode} disabled={joiningCode || joinCode.length !== 6}>
                    {joiningCode ? 'Joining...' : 'Join'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ═══════════ NOTES TAB ═══════════ */}
          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-4">

          {/* ── No-batch CTA ── */}
              {myBatches.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-amber-500/5 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">Join your batch to unlock teacher content</p>
                      <p className="text-xs text-muted-foreground mt-1">Enter the 6-digit code your mentor shared — notes, live tests, and mentor assignments will appear here.</p>
                      <Button
                        size="sm"
                        onClick={() => setShowJoinModal(true)}
                        className="mt-3 h-9 px-4 bg-accent text-white font-bold rounded-xl text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Enter Join Code
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {realMaterials.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-bold text-foreground">
                      From {primaryTeacher?.full_name || 'Your Mentor'}
                      {primaryBatch && <span className="text-muted-foreground font-normal ml-1">· {primaryBatch.name}</span>}
                    </h3>
                  </div>
                  {realMaterials.map(mat => (
                    <div key={mat.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-accent/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{mat.title}</p>
                          <p className="text-[10px] text-muted-foreground">{mat.subject} • {mat.chapter} • {mat.type?.toUpperCase()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => mat.url && window.open(mat.url, '_blank')} className="gap-2 h-8 text-xs font-bold text-accent hover:bg-accent/10">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* General syllabus */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">
                      {targetExam || 'General'} Syllabus
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border">Live</span>
                </div>

                {DEMO_NOTES.map(subject => (
                  <div key={subject.subject} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedSubject(expandedSubject === subject.subject ? null : subject.subject)}
                      className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center', subject.bg)}>
                          <BookOpen className={cn('w-4 h-4', subject.color)} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-foreground text-sm">{subject.subject}</p>
                          <p className="text-[10px] text-muted-foreground">
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
                              <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                                chapter.completed ? 'bg-emerald-500 border-emerald-500' : 'border-border')}>
                                {chapter.completed && <span className="text-[7px] text-white font-bold">✓</span>}
                              </div>
                              <span className={cn('text-sm font-medium', chapter.completed ? 'text-muted-foreground line-through' : 'text-foreground')}>
                                {chapter.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{chapter.pages} pages</span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══════════ PRACTICE TAB ═══════════ */}
          {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-4">

              {/* Assigned live tests */}
              {realTests.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-bold text-foreground">
                      Assigned by {primaryTeacher?.full_name || 'Mentor'}
                      {primaryBatch && <span className="text-muted-foreground font-normal ml-1">· {primaryBatch.name}</span>}
                    </h3>
                  </div>
                  {realTests.map(test => (
                    <div key={test.id} className="bg-card border-2 border-accent/25 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-accent/50 transition-all shadow-lg shadow-accent/5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent">LIVE TEST</span>
                          <span className="text-[10px] text-muted-foreground">{test.exam_type}</span>
                        </div>
                        <p className="font-bold text-sm text-foreground">{test.metadata?.subchapterName || 'Topic Assessment'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{test.question_count} Questions • {test.time_limit_minutes} min</p>
                      </div>
                      <Button onClick={() => navigate(`/assess/${test.id}`)} size="sm"
                        className="h-10 px-4 rounded-xl bg-accent text-white font-bold hover:scale-105 transition-all shadow-lg shadow-accent/20 shrink-0">
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Today's Goal", value: '20 Qs', icon: Target, color: 'text-accent' },
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

              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Self Practice</h2>
                <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border">AI Adaptive</span>
              </div>

              <div className="space-y-3">
                {DEMO_PRACTICE.map(topic => (
                  <div key={`${topic.subject}-${topic.subtopic}`}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-accent/30 transition-all group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', DIFF_COLORS[topic.difficulty])}>
                          {topic.difficulty}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{topic.subject}</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">{topic.subtopic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{topic.topic} • {topic.qCount} questions</p>
                    </div>
                    <Button onClick={() => navigate('/practice')} size="sm"
                      className="h-9 w-9 p-0 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all group-hover:scale-110 shrink-0">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5 flex flex-col hover:border-accent/50 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <p className="text-sm font-bold">Adaptive Sprints</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">AI selects questions based on your weakness map. Closes conceptual gaps intelligently.</p>
                  <Button onClick={() => navigate('/practice?mode=adaptive')} className="w-full bg-accent text-white font-bold">Start Sprint</Button>
                </div>
                <div className="bg-secondary/40 border border-border rounded-2xl p-5 flex flex-col hover:border-muted-foreground/30 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm font-bold">Static Mock Exam</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-1">Full pattern exams. Fixed questions, timed environment, mirroring the real exam.</p>
                  <Button variant="outline" onClick={() => navigate('/practice?mode=static')} className="w-full font-bold">Take Full Test</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ PROGRESS TAB ═══════════ */}
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 mt-4">

              {/* My Batches */}
              {myBatches.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" /> My Batches & Mentors
                  </h3>
                  {myBatches.map((b: any, i: number) => {
                    const teacher = teacherProfiles[b.mentor_id];
                    return (
                      <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shrink-0">
                          <span className="text-base font-black text-accent">{b.name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{b.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {teacher ? `👨‍🏫 ${teacher.full_name}` : 'Mentor'} · {b.subject || 'All Subjects'}
                          </p>
                        </div>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-muted-foreground text-center">📊 Your mentor sees your progress in real time</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-accent/10 to-amber-500/5 border border-accent/20 rounded-2xl p-5">
                  <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4 text-accent" /> Join a Batch
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">Enter the 6-digit code shared by your mentor.</p>
                  <div className="flex gap-2">
                    <input
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. JB7K2X" maxLength={6}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                    />
                    <Button onClick={handleJoinByCode} disabled={joiningCode} className="bg-accent text-white px-5">
                      {joiningCode ? '⏳' : 'Join'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">My Progress</h2>
                <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg border border-border uppercase tracking-wider">Live</span>
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
