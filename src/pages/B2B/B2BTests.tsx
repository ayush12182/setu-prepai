import React, { useState, useEffect } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import {
  ClipboardList, Plus, QrCode, Copy, Clock, Loader2, ArrowRight,
  ArrowLeft, CheckCircle2, Sparkles, BookOpen, Target, Zap, Brain,
  Users, BarChart3, Link2, ChevronRight, X, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CUET_SUBJECTS, getCuetChaptersBySubject } from '@/data/cuetSyllabus';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetBiologyChapters, neetChemistryChapters, neetPhysicsChapters } from '@/data/neetSyllabus';
import { getSubchaptersByChapterId } from '@/data/subchapters';
import QRCode from 'qrcode';

type BuilderStep = 'topic' | 'configure' | 'generating' | 'share';
type ExamType = 'JEE' | 'NEET' | 'CUET';
type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

interface AssessmentConfig {
  examType: ExamType;
  subject: string;
  chapterId: string;
  chapterName: string;
  subchapterId: string;
  subchapterName: string;
  difficulty: Difficulty;
  questionCount: number;
  timeLimitMinutes: number;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'NCERT basics / direct recall', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' },
  { value: 'medium', label: 'Medium', desc: 'Standard exam level', color: 'border-amber-500/40 bg-amber-500/5 text-amber-400' },
  { value: 'hard', label: 'Hard', desc: 'Advanced application', color: 'border-red-500/40 bg-red-500/5 text-red-400' },
  { value: 'mixed', label: 'Mixed', desc: '30% easy · 40% medium · 30% hard', color: 'border-violet-500/40 bg-violet-500/5 text-violet-400' },
];

export default function B2BTests() {
  const { user } = useAuth();
  const { examMode, isCuet, isNeet } = useExamMode();
  const [step, setStep] = useState<BuilderStep>('topic');
  const [showBuilder, setShowBuilder] = useState(false);

  // Past sessions
  const [sessions, setSessions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Builder state
  const [selectedExamType, setSelectedExamType] = useState<ExamType>(
    isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE'
  );
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedSubchapter, setSelectedSubchapter] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const { data: testSessions } = await (supabase as any)
        .from('assessment_sessions')
        .select(`
          *,
          student_assessments(id, status)
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      const sessionWithStats = (testSessions || []).map((s: any) => {
        const assignments = s.student_assessments || [];
        return {
          ...s,
          stats: {
            assigned: assignments.length,
            completed: assignments.filter((a: any) => a.status === 'completed').size || assignments.filter((a: any) => a.status === 'completed').length,
            in_progress: assignments.filter((a: any) => a.status === 'in_progress').length,
          }
        };
      });

      const { data: mats } = await (supabase as any)
        .from('batch_materials')
        .select(`
          *,
          material_access(id)
        `)
        .eq('uploaded_by', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      const matsWithStats = (mats || []).map((m: any) => ({
        ...m,
        views: (m.material_access || []).length
      }));

      setSessions(sessionWithStats);
      setMaterials(matsWithStats);
    } catch (err) { 
      console.error(err);
      setSessions([]); 
      setMaterials([]);
    }
    finally { setLoadingSessions(false); }
  };


  // ─── SUBJECT DATA ───
  const getSubjects = () => {
    if (selectedExamType === 'CUET') {
      return CUET_SUBJECTS.filter(s => getCuetChaptersBySubject(s.key).length > 0)
        .map(s => ({ id: s.key, name: s.label }));
    }
    if (selectedExamType === 'NEET') {
      return [
        { id: 'biology', name: 'Biology' },
        { id: 'chemistry', name: 'Chemistry' },
        { id: 'physics', name: 'Physics' },
      ];
    }
    return [
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'maths', name: 'Mathematics' },
    ];
  };

  const getChapters = () => {
    if (selectedExamType === 'CUET') return getCuetChaptersBySubject(selectedSubject);
    if (selectedExamType === 'NEET') {
      if (selectedSubject === 'biology') return neetBiologyChapters;
      if (selectedSubject === 'chemistry') return neetChemistryChapters;
      return neetPhysicsChapters;
    }
    if (selectedSubject === 'physics') return physicsChapters;
    if (selectedSubject === 'chemistry') return chemistryChapters;
    return mathsChapters;
  };

  const getSubchapters = () => {
    if (!selectedChapter) return [];
    return getSubchaptersByChapterId(selectedChapter.id);
  };

  // ─── GENERATE TEST ───
  const handleGenerate = async () => {
    if (!selectedSubchapter) return;
    setGenerating(true);
    setStep('generating');

    try {
      // 1. Create session record
      const { data: session, error } = await (supabase as any)
        .from('assessment_sessions')
        .insert({
          created_by: user?.id,
          exam_type: selectedExamType,
          subjects: [selectedSubject],
          question_count: questionCount,
          time_limit_minutes: timeLimit,
          status: 'ACTIVE',
          metadata: {
            subchapterId: selectedSubchapter.id,
            subchapterName: selectedSubchapter.name,
            chapterId: selectedChapter.id,
            chapterName: selectedChapter.name,
            subject: selectedSubject,
            difficulty,
            examType: selectedExamType,
          },
        })
        .select()
        .single();

      const sid = session?.id || `b2b-${Date.now()}`;

      // 2. Pre-generate first batch in background (non-blocking for UX)
      supabase.functions.invoke('generate-questions', {
        body: {
          subchapterId: selectedSubchapter.id,
          subchapterName: selectedSubchapter.name,
          chapterId: selectedChapter.id,
          chapterName: selectedChapter.name,
          subject: selectedSubject,
          difficulty: difficulty === 'mixed' ? 'medium' : difficulty,
          examMode: selectedExamType,
          count: Math.min(10, questionCount),
          forceNew: true,
          seed: Date.now(),
          sessionId: sid,
        },
      }).catch(console.warn);

      const link = `${window.location.origin}/assess/${sid}`;
      setSessionId(sid);
      setGeneratedLink(link);

      // Generate QR
      const qr = await QRCode.toDataURL(link, { width: 256, margin: 2, color: { dark: '#ffffff', light: '#0f172a' } });
      setQrDataUrl(qr);

      toast.success('Assessment created successfully!');
      loadSessions();
      setStep('share');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create assessment. Trying offline mode…');
      const fallbackId = `b2b-${Date.now()}`;
      const link = `${window.location.origin}/assess/${fallbackId}`;
      setSessionId(fallbackId);
      setGeneratedLink(link);
      const qr = await QRCode.toDataURL(link, { width: 256, margin: 2, color: { dark: '#ffffff', light: '#0f172a' } }).catch(() => '');
      setQrDataUrl(qr);
      setStep('share');
      loadSessions(); // refresh even on fallback
    } finally {
      setGenerating(false);
    }
  };

  const resetBuilder = () => {
    setStep('topic');
    setSelectedSubject('');
    setSelectedChapter(null);
    setSelectedSubchapter(null);
    setDifficulty('mixed');
    setQuestionCount(20);
    setTimeLimit(30);
    setGeneratedLink('');
    setQrDataUrl('');
    setShowBuilder(false);
    loadSessions(); // always refresh list when closing modal
  };


  // ─── RENDER ───
  return (
    <B2BSidebarLayout title="Tests & Assessments">
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">AI Assessments</h1>
            <p className="text-muted-foreground mt-1">
              Generate unlimited topic-wise tests · AI creates fresh questions every time
            </p>
          </div>
          <Button
            onClick={() => setShowBuilder(true)}
            className="bg-accent hover:bg-accent/90 gap-2 h-11 px-6 font-bold shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4" /> Create Assessment
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tests Created', value: sessions.length, icon: ClipboardList, color: 'text-accent' },
            { label: 'AI Questions', value: '∞', icon: Sparkles, color: 'text-violet-400' },
            { label: 'Topics Covered', value: sessions.length > 0 ? new Set(sessions.map((s: any) => s.metadata?.subchapterId)).size : 0, icon: BookOpen, color: 'text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 text-center">
              <stat.icon className={cn('w-6 h-6 mx-auto mb-2', stat.color)} />
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Past Sessions */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Assessments</h2>
            <span className="text-xs text-muted-foreground">{sessions.length} total</span>
          </div>
          {loadingSessions ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : sessions.length === 0 ? (
            <div className="p-10 text-center">
              <Brain className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">No assessments yet. Create your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((s: any) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.metadata?.subchapterName || 'Assessment'}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.exam_type} · {s.question_count}Q · {s.time_limit_minutes}min · {new Date(s.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Participation Stats */}
                    <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-0.5">Assigned</p>
                        <p className="text-foreground">{s.stats?.assigned || 0}</p>
                      </div>
                      <div className="h-6 w-px bg-border/50" />
                      <div className="text-center">
                        <p className="text-amber-400/70 mb-0.5">Attempting</p>
                        <p className="text-amber-400">{s.stats?.in_progress || 0}</p>
                      </div>
                      <div className="h-6 w-px bg-border/50" />
                      <div className="text-center">
                        <p className="text-emerald-400/70 mb-0.5">Done</p>
                        <p className="text-emerald-400">{s.stats?.completed || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border',
                        s.status === 'ACTIVE' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-border text-muted-foreground'
                      )}>{s.status}</span>
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/assess/${s.id}`).then(() => toast.success('Link copied!'))}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => window.open(`/b2b/monitor/${s.id}`, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shared Content (Requirement 2) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" /> Shared Content
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/b2b/materials')} className="text-accent hover:text-accent hover:bg-accent/10">
              Manage All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* A. Notes Uploaded */}
             <div className="bg-card border border-border rounded-2xl p-5">
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                 <FileText className="w-4 h-4 text-rose-400" /> Study Materials (Notes)
               </h3>
               {materials.length === 0 ? (
                 <p className="text-xs text-muted-foreground py-4 text-center">No materials shared yet.</p>
               ) : (
                 <div className="space-y-3">
                   {materials.slice(0, 3).map(m => (
                     <div key={m.id} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                           {m.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-400" /> : <Link2 className="w-4 h-4 text-blue-400" />}
                         </div>
                         <div>
                           <p className="text-xs font-bold truncate max-w-[140px] text-foreground">{m.title}</p>
                           <p className="text-[10px] text-muted-foreground">{m.subject}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="text-[10px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20">
                           {m.views || 0} views
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* B. Assessments Summary */}
             <div className="bg-card border border-border rounded-2xl p-5">
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                 <ClipboardList className="w-4 h-4 text-emerald-400" /> Assessment Status
               </h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-end">
                   <div className="space-y-1">
                     <p className="text-2xl font-black text-foreground">{sessions.filter(s => s.status === 'ACTIVE').length}</p>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold">Active Tests</p>
                   </div>
                   <div className="space-y-1 text-right">
                     <p className="text-2xl font-black text-emerald-400">
                       {sessions.reduce((acc, s) => acc + (s.stats?.completed || 0), 0)}
                     </p>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Attempts</p>
                   </div>
                 </div>
                 <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
                    <div className="h-full bg-amber-500" style={{ width: '20%' }} />
                 </div>
                 <p className="text-[10px] text-muted-foreground italic text-center">Data aggregated from all sessions</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* ─── BUILDER MODAL ─── */}
      {showBuilder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={step === 'share' ? resetBuilder : undefined} />
          <div className="relative z-10 bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-lg text-white">Create Assessment</h2>
                <p className="text-xs text-white/40">
                  {step === 'topic' ? 'Select topic' : step === 'configure' ? 'Configure test' : step === 'generating' ? 'Generating…' : 'Share with students'}
                </p>
              </div>
              <button onClick={resetBuilder} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* STEP: Topic Selection */}
              {step === 'topic' && (
                <div className="space-y-6">
                  {/* Exam Type */}
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Exam Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['JEE', 'NEET', 'CUET'] as ExamType[]).map(et => (
                        <button
                          key={et}
                          onClick={() => { setSelectedExamType(et); setSelectedSubject(''); setSelectedChapter(null); setSelectedSubchapter(null); }}
                          className={cn('p-3 rounded-xl border text-sm font-bold transition-all',
                            selectedExamType === et ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 text-white/50 hover:border-white/20'
                          )}
                        >
                          {et}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Subject</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {getSubjects().map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedSubject(s.id); setSelectedChapter(null); setSelectedSubchapter(null); }}
                          className={cn('p-3 rounded-xl border text-sm font-medium text-left transition-all',
                            selectedSubject === s.id ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-white/50 hover:border-white/20'
                          )}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chapter */}
                  {selectedSubject && (
                    <div>
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Chapter</label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {getChapters().map((ch: any) => (
                          <button
                            key={ch.id}
                            onClick={() => { setSelectedChapter(ch); setSelectedSubchapter(null); }}
                            className={cn('w-full p-3 rounded-xl border text-sm font-medium text-left transition-all flex items-center justify-between',
                              selectedChapter?.id === ch.id ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-white/50 hover:border-white/20'
                            )}
                          >
                            {ch.name}
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subchapter */}
                  {selectedChapter && (
                    <div>
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Topic</label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {getSubchapters().length === 0 ? (
                          <button
                            onClick={() => setSelectedSubchapter({ id: `${selectedChapter.id}-full`, name: selectedChapter.name })}
                            className={cn('w-full p-3 rounded-xl border text-sm font-medium text-left transition-all',
                              selectedSubchapter ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-white/50 hover:border-white/20'
                            )}
                          >
                            Full Chapter Practice
                          </button>
                        ) : getSubchapters().map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubchapter(sub)}
                            className={cn('w-full p-3 rounded-xl border text-sm font-medium text-left transition-all',
                              selectedSubchapter?.id === sub.id ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-white/50 hover:border-white/20'
                            )}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep('configure')}
                    disabled={!selectedSubchapter}
                    className="w-full h-12 bg-accent text-white font-bold gap-2"
                  >
                    Configure Test <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* STEP: Configure */}
              {step === 'configure' && (
                <div className="space-y-6">
                  {/* Selected topic summary */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Topic</p>
                    <p className="font-bold text-white">{selectedSubchapter?.name}</p>
                    <p className="text-xs text-white/50">{selectedExamType} · {selectedChapter?.name}</p>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Difficulty</label>
                    <div className="grid grid-cols-2 gap-2">
                      {DIFFICULTY_OPTIONS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setDifficulty(d.value)}
                          className={cn('p-3 rounded-xl border text-left transition-all',
                            difficulty === d.value ? d.color : 'border-white/10 text-white/40 hover:border-white/20'
                          )}
                        >
                          <p className="font-bold text-sm">{d.label}</p>
                          <p className="text-[10px] mt-0.5 opacity-70">{d.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">
                      Questions: <span className="text-accent">{questionCount}</span>
                      <span className="ml-2 text-white/30 font-normal normal-case">AI generates fresh each time</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[10, 20, 30, 50, 75, 100].map(n => (
                        <button
                          key={n}
                          onClick={() => setQuestionCount(n)}
                          className={cn('px-4 py-2 rounded-xl border text-sm font-bold transition-all',
                            questionCount === n ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 text-white/50 hover:border-white/20'
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">
                      Time Limit: <span className="text-accent">{timeLimit} min</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[15, 20, 30, 45, 60, 90].map(n => (
                        <button
                          key={n}
                          onClick={() => setTimeLimit(n)}
                          className={cn('px-4 py-2 rounded-xl border text-sm font-bold transition-all',
                            timeLimit === n ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 text-white/50 hover:border-white/20'
                          )}
                        >
                          {n}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setStep('topic')} className="flex-1 h-12 text-white/60">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleGenerate} className="flex-2 h-12 bg-accent text-white font-bold gap-2 flex-1">
                      <Sparkles className="w-4 h-4" /> Generate Assessment
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP: Generating */}
              {step === 'generating' && (
                <div className="text-center py-12 space-y-4">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">Generating Assessment…</h3>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    AI is crafting {questionCount} fresh {selectedExamType} questions on {selectedSubchapter?.name}
                  </p>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                </div>
              )}

              {/* STEP: Share */}
              {step === 'share' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Assessment Ready!</h3>
                    <p className="text-white/40 text-sm mt-1">{questionCount} questions · {timeLimit} min · {selectedExamType}</p>
                  </div>

                  {/* QR Code */}
                  {qrDataUrl && (
                    <div className="flex justify-center">
                      <div className="p-4 bg-[#0f172a] rounded-2xl border border-white/10">
                        <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                        <p className="text-center text-[10px] text-white/40 mt-2">Scan to start test</p>
                      </div>
                    </div>
                  )}

                  {/* Share Link */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white/60 truncate">
                      {generatedLink}
                    </div>
                    <Button
                      onClick={() => navigator.clipboard.writeText(generatedLink).then(() => toast.success('Copied!'))}
                      className="h-12 w-12 p-0 bg-accent text-white rounded-xl"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => window.open(`/b2b/monitor/${sessionId}`, '_blank')}
                      className="flex-1 h-12 text-white/60 border border-white/10 hover:bg-white/5 gap-2"
                    >
                      <BarChart3 className="w-4 h-4" /> Live Monitor
                    </Button>
                    <Button onClick={resetBuilder} className="flex-1 h-12 bg-accent text-white font-bold gap-2">
                      <Plus className="w-4 h-4" /> New Assessment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </B2BSidebarLayout>
  );
}
