import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, CheckCircle2, XCircle, RotateCcw, Clock,
  Flame, Target, Brain, Zap, ArrowLeft, ChevronDown, BookOpen, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateQuestions } from '@/services/questionGenerator';
import { QuestionStatusWidget } from '@/components/practice/QuestionStatusWidget';
import { checkAIAvailability } from '@/utils/aiAvailability';

// ─── Types ────────────────────────────────────────────────────
type Exam = 'JEE_MAINS' | 'JEE_ADVANCED' | 'NEET' | 'CUET';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Step = 'select-exam' | 'select-subject' | 'select-topic' | 'practice';
type AnswerState = 'unanswered' | 'correct' | 'wrong';

interface Question {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;    // A/B/C/D
  explanation_text: string;
  concept_tested: string;
  difficulty: Difficulty;
  is_variant: boolean;
  parent_question_id?: string | null;
}

interface CurriculumItem {
  topic: string;
  subtopic: string;
}

interface SessionStats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

// ─── Constants ────────────────────────────────────────────────
const EXAM_SUBJECTS: Record<Exam, string[]> = {
  JEE_MAINS:    ['Physics', 'Chemistry', 'Mathematics'],
  JEE_ADVANCED: ['Physics', 'Chemistry', 'Mathematics'],
  NEET:         ['Biology', 'Chemistry', 'Physics'],
  CUET:         ['English', 'General Test', 'Accounts', 'Economics', 'Business Studies'],
};

const EXAM_LABELS: Record<Exam, string> = {
  JEE_MAINS:    'JEE Mains',
  JEE_ADVANCED: 'JEE Advanced',
  NEET:         'NEET UG',
  CUET:         'CUET UG',
};

const EXAM_COLORS: Record<Exam, string> = {
  JEE_MAINS:    'from-amber-500 to-orange-500',
  JEE_ADVANCED: 'from-orange-500 to-red-600',
  NEET:         'from-emerald-500 to-green-600',
  CUET:         'from-violet-500 to-purple-600',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy:   'text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Hard:   'text-red-400 bg-red-500/10',
};

// ─── Helper: log attempt ──────────────────────────────────────
async function logAttempt(
  studentId: string,
  q: Question,
  selected: string,
  exam: Exam,
  subject: string,
  topic: string,
  subtopic: string,
  timeSpent: number
) {
  try {
    await (supabase as any).from('student_question_attempts').insert({
      student_id:         studentId,
      question_id:        q.question_id,
      exam,
      subject,
      topic,
      subtopic,
      difficulty:         q.difficulty,
      selected_answer:    selected,
      correct_answer:     q.correct_answer,
      is_correct:         selected === q.correct_answer,
      time_spent_seconds: Math.round(timeSpent),
      is_variant_attempt: q.is_variant,
      parent_question_id: q.parent_question_id || null,
    });
  } catch (e) {
    console.warn('Attempt logging failed silently:', e);
  }
}

// ─── Option Button ────────────────────────────────────────────
const OptionButton = ({
  letter, text, state, selected, correct, onClick
}: {
  letter: string; text: string;
  state: AnswerState; selected: boolean; correct: boolean;
  onClick: () => void;
}) => {
  const base = "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 font-medium text-sm";
  const unanswered = "border-border hover:border-accent/50 hover:bg-accent/5 cursor-pointer";
  const isCorrect   = "border-emerald-500 bg-emerald-500/10 text-emerald-300 cursor-default";
  const isWrong     = "border-red-500 bg-red-500/10 text-red-300 cursor-default";
  const neutral     = "border-border/30 text-muted-foreground/40 cursor-default";

  let cls = unanswered;
  if (state !== 'unanswered') {
    if (correct) cls = isCorrect;
    else if (selected) cls = isWrong;
    else cls = neutral;
  }

  return (
    <motion.button
      className={cn(base, cls)}
      onClick={state === 'unanswered' ? onClick : undefined}
      whileHover={state === 'unanswered' ? { scale: 1.01 } : {}}
      whileTap={state === 'unanswered' ? { scale: 0.99 } : {}}
    >
      <span className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2",
        state === 'unanswered' ? "border-border" : correct ? "border-emerald-500 bg-emerald-500/20" : selected ? "border-red-500 bg-red-500/20" : "border-border/20"
      )}>
        {state !== 'unanswered' && correct ? <CheckCircle2 size={14} /> : state !== 'unanswered' && selected ? <XCircle size={14} /> : letter}
      </span>
      <span>{text}</span>
    </motion.button>
  );
};

// ─── Main Component ───────────────────────────────────────────
export default function AdaptivePracticePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<Step>('select-exam');
  const [selectedExam, setSelectedExam] = useState<Exam>('JEE_MAINS');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

  // Curriculum
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [subtopics, setSubtopics] = useState<string[]>([]);

  // Practice state
  const [question, setQuestion] = useState<Question | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [nextLoading, setNextLoading] = useState(false);
  const [generationMode, setGenerationMode] = useState<'ai' | 'offline' | 'recovery' | 'idle' | 'fetching'>('idle');
  const [aiAvailabilityMode, setAiAvailabilityMode] = useState<'ai' | 'offline' | 'recovery' | 'idle' | 'fetching'>('fetching');
  const [weakChapters, setWeakChapters] = useState<string[]>([]);
  const [errorQ, setErrorQ] = useState<string | null>(null);

  const questionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    checkAIAvailability().then(res => {
      setAiAvailabilityMode(res.mode);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('student_question_attempts' as any)
      .select('topic, is_correct')
      .eq('student_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const topicStats: Record<string, { total: number; correct: number }> = {};
          data.forEach((att: any) => {
            if (!topicStats[att.topic]) {
              topicStats[att.topic] = { total: 0, correct: 0 };
            }
            topicStats[att.topic].total += 1;
            if (att.is_correct) topicStats[att.topic].correct += 1;
          });

          const weak = Object.entries(topicStats)
            .map(([topic, stats]) => ({
              topic,
              accuracy: stats.correct / stats.total
            }))
            .sort((a, b) => a.accuracy - b.accuracy)
            .map(x => x.topic);

          setWeakChapters(weak);
        }
      });
  }, [user]);

  // ── Fetch curriculum when exam+subject selected ────────────
  useEffect(() => {
    if (!selectedExam || !selectedSubject) return;
    (supabase as any)
      .from('exam_curriculum')
      .select('topic, subtopic')
      .eq('exam', selectedExam)
      .eq('subject', selectedSubject)
      .order('order_index')
      .then(({ data }: any) => {
        if (data) {
          setCurriculum(data);
          const uniqueTopics = [...new Set(data.map((d: any) => d.topic))] as string[];
          setTopics(uniqueTopics);
          setSelectedTopic(uniqueTopics[0] || '');
        }
      });
  }, [selectedExam, selectedSubject]);

  // ── Update subtopics when topic changes ────────────────────
  useEffect(() => {
    if (!selectedTopic) return;
    const subs = curriculum
      .filter(c => c.topic === selectedTopic)
      .map(c => c.subtopic);
    setSubtopics(subs);
    setSelectedSubtopic(subs[0] || '');
  }, [selectedTopic, curriculum]);

  // ── Generate question ──────────────────────────────────────
  const generateQuestion = useCallback(async (variantOf?: string) => {
    if (!selectedExam || !selectedSubject || !selectedTopic || !selectedSubtopic) return;
    setLoadingQ(true);
    setErrorQ(null);
    setAnswerState('unanswered');
    setSelectedAnswer('');
    setShowExplanation(false);
    setQuestion(null);
    setGenerationMode('fetching');

    try {
      let targetTopic = selectedTopic;
      if (!targetTopic && weakChapters.length > 0) {
        targetTopic = weakChapters[0];
      }

      const result = await generateQuestions({
        exam: selectedExam,
        subject: selectedSubject,
        chapter: targetTopic,
        subchapter: selectedSubtopic,
        difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        count: 1,
        variantOf
      });

      if (result.questions && result.questions.length > 0) {
        const unifiedQ = result.questions[0];
        const mappedQ: Question = {
          question_id: unifiedQ.question_id,
          question_text: unifiedQ.question_text,
          option_a: unifiedQ.option_a,
          option_b: unifiedQ.option_b,
          option_c: unifiedQ.option_c,
          option_d: unifiedQ.option_d,
          correct_answer: unifiedQ.correct_answer || (unifiedQ.answer as string),
          explanation_text: unifiedQ.explanation_text || unifiedQ.explanation,
          concept_tested: unifiedQ.concept_tested,
          difficulty: (unifiedQ.difficulty.charAt(0).toUpperCase() + unifiedQ.difficulty.slice(1)) as Difficulty,
          is_variant: unifiedQ.is_variant,
          parent_question_id: unifiedQ.parent_question_id,
          difficultyScore: unifiedQ.difficultyScore,
          conceptCoverage: unifiedQ.conceptCoverage,
          jeeRelevanceScore: unifiedQ.jeeRelevanceScore
        };
        setQuestion(mappedQ);
        setGenerationMode(result.generationMode);
        questionStartTime.current = Date.now();
      } else {
        throw new Error('No questions returned');
      }
    } catch (err: any) {
      console.error('Error generating adaptive question:', err);
      setErrorQ(err.message || 'Failed to generate question');
      toast.error('Failed to generate question.');
    } finally {
      setLoadingQ(false);
    }
  }, [selectedExam, selectedSubject, selectedTopic, selectedSubtopic, difficulty, weakChapters]);

  // ── Handle answer selection ────────────────────────────────
  const handleAnswer = useCallback(async (letter: string) => {
    if (!question || answerState !== 'unanswered' || !user) return;

    const timeSpent = (Date.now() - questionStartTime.current) / 1000;
    const isCorrect = letter === question.correct_answer;

    setSelectedAnswer(letter);
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    setShowExplanation(true);

    // Log attempt silently
    logAttempt(user.id, question, letter, selectedExam, selectedSubject, selectedTopic, selectedSubtopic, timeSpent);

    // Update stats
    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        total: prev.total + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });

    // Pre-fetch next question in background
    if (isCorrect) {
      setNextLoading(true);
    }
  }, [question, answerState, user, selectedExam, selectedSubject, selectedTopic, selectedSubtopic]);

  // ── Next question ──────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (!question) return;
    const wasWrong = answerState === 'wrong';
    await generateQuestion(wasWrong ? question.question_id : undefined);
    setNextLoading(false);
  }, [question, answerState, generateQuestion]);

  // ─── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step !== 'practice' || !question || answerState === 'unanswered') return;
      if (e.key === 'Enter' || e.key === ' ') handleNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, question, answerState, handleNext]);

  // ─── Start practice ────────────────────────────────────────
  const startPractice = () => {
    setStats({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
    setStep('practice');
    generateQuestion();
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const options: [string, string][] = question ? [
    ['A', question.option_a],
    ['B', question.option_b],
    ['C', question.option_c],
    ['D', question.option_d],
  ] : [];

  // ─── RENDER: Step — Exam Selection ───────────────────────
  if (step === 'select-exam') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10">
              <Brain size={28} className="text-accent" />
            </div>
            <h1 className="text-4xl font-display font-black tracking-tight">Adaptive Practice</h1>
            <p className="text-muted-foreground">Questions that adapt to you in real-time.</p>
            <div className="flex justify-center">
              <QuestionStatusWidget mode={aiAvailabilityMode} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(EXAM_LABELS) as [Exam, string][]).map(([key, label]) => (
              <motion.button
                key={key}
                onClick={() => { setSelectedExam(key); setSelectedSubject(EXAM_SUBJECTS[key][0]); setStep('select-subject'); }}
                className="p-6 rounded-2xl border-2 border-border hover:border-accent/50 text-left bg-card transition-all group relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${EXAM_COLORS[key]} transition-opacity`} />
                <p className="font-black text-xl">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{EXAM_SUBJECTS[key].join(' · ')}</p>
                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-accent transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Step — Subject ───────────────────────────────
  if (step === 'select-subject') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          <button onClick={() => setStep('select-exam')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">{EXAM_LABELS[selectedExam]}</p>
              <h2 className="text-3xl font-bold">Pick a Subject</h2>
            </div>
            <QuestionStatusWidget mode={aiAvailabilityMode} className="scale-90" />
          </div>
          <div className="space-y-3">
            {EXAM_SUBJECTS[selectedExam].map(sub => (
              <motion.button
                key={sub}
                onClick={() => { setSelectedSubject(sub); setStep('select-topic'); }}
                className="w-full p-5 rounded-2xl border-2 border-border hover:border-accent/50 text-left bg-card flex items-center justify-between group transition-all"
                whileHover={{ x: 4 }}
              >
                <span className="font-bold text-lg">{sub}</span>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Step — Topic / Subtopic ─────────────────────
  if (step === 'select-topic') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          <button onClick={() => setStep('select-subject')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">{EXAM_LABELS[selectedExam]} · {selectedSubject}</p>
              <h2 className="text-3xl font-bold">Choose Topic</h2>
            </div>
            <QuestionStatusWidget mode={aiAvailabilityMode} className="scale-90" />
          </div>

          {/* Topic dropdown */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Topic</label>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="w-full bg-card border-2 border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
            >
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Subtopic */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Subtopic</label>
            <div className="grid grid-cols-1 gap-2">
              {subtopics.map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedSubtopic(st)}
                  className={cn(
                    "p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all",
                    selectedSubtopic === st
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-border/80"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                    difficulty === d ? "border-accent bg-accent text-black" : "border-border text-muted-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={startPractice}
            disabled={!selectedSubtopic}
            className="w-full h-14 bg-accent text-black font-bold text-base rounded-xl"
          >
            Start Practice <Zap size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── RENDER: Practice ────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button onClick={() => setStep('select-topic')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm shrink-0">
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">{selectedSubtopic}</span>
          </button>

          {/* Sticky Status Widget */}
          <QuestionStatusWidget mode={generationMode} className="scale-90" />

          {/* Stats strip */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Target size={14} className="text-accent" />
              <span className="font-bold">{accuracy}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={14} className={stats.streak >= 3 ? 'text-orange-400' : 'text-muted-foreground'} />
              <span className="font-bold">{stats.streak}</span>
            </div>
            <div className="text-muted-foreground">
              {stats.correct}/{stats.total}
            </div>
          </div>

          <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", DIFFICULTY_COLORS[difficulty])}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Fallback Banner */}
        {(generationMode === 'offline' || generationMode === 'recovery') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl border text-sm font-medium flex items-center gap-3",
              generationMode === 'offline'
                ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                : "bg-red-500/10 border-red-500/20 text-red-300"
            )}
          >
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">
                {generationMode === 'offline' 
                  ? 'AI generation unavailable. Using PrepEntrance Smart Offline Generator.' 
                  : 'Complete system offline. Operating in Recovery Mode.'}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                We are serving offline questions tailored to your requested topic to keep your momentum going.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {errorQ && (
          <div className="text-center py-20 bg-card border border-border rounded-3xl p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Generation Error</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {errorQ}
            </p>
            <Button
              onClick={() => generateQuestion()}
              className="bg-accent text-black font-bold"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading skeleton */}
        {loadingQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="h-4 w-24 bg-secondary rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="h-4 w-4/5 bg-secondary rounded" />
                <div className="h-4 w-3/5 bg-secondary rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[0,1,2,3].map(i => <div key={i} className="h-16 bg-card border border-border rounded-2xl animate-pulse" />)}
            </div>
            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Generating question...
            </div>
          </motion.div>
        )}

        {/* Question card */}
        <AnimatePresence mode="wait">
          {!loadingQ && question && (
            <motion.div
              key={question.question_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Variant badge */}
              {question.is_variant && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 w-fit"
                >
                  <RotateCcw size={14} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">Variant — same concept, new twist</span>
                </motion.div>
              )}

              {/* Question card */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", DIFFICULTY_COLORS[question.difficulty])}>
                    {question.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">{question.concept_tested}</span>
                </div>
                <p className="text-foreground font-medium leading-relaxed text-base">
                  {question.question_text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {options.map(([letter, text]) => (
                  <OptionButton
                    key={letter}
                    letter={letter}
                    text={text}
                    state={answerState}
                    selected={selectedAnswer === letter}
                    correct={letter === question.correct_answer}
                    onClick={() => handleAnswer(letter)}
                  />
                ))}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "rounded-2xl p-5 border",
                      answerState === 'correct'
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {answerState === 'correct'
                          ? <CheckCircle2 size={16} className="text-emerald-400" />
                          : <XCircle size={16} className="text-red-400" />
                        }
                        <span className={cn("text-sm font-bold", answerState === 'correct' ? 'text-emerald-400' : 'text-red-400')}>
                          {answerState === 'correct' ? 'Correct!' : `Wrong — Correct answer: ${question.correct_answer}`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {question.explanation_text}
                      </p>
                      {answerState === 'wrong' && (
                        <p className="text-xs text-amber-400/80 mt-3 flex items-center gap-1">
                          <RotateCcw size={11} /> A variant question is loading to reinforce this concept...
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleNext}
                      disabled={nextLoading}
                      className="w-full h-12 mt-4 bg-accent text-black font-bold rounded-xl gap-2"
                    >
                      {nextLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Preparing next...</>
                      ) : answerState === 'wrong' ? (
                        <><RotateCcw size={16} /> Try Variant <ChevronRight size={14} /></>
                      ) : (
                        <>Next Question <ChevronRight size={14} /></>
                      )}
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground mt-2">
                      Press Enter or Space for next question
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Streak celebration */}
              <AnimatePresence>
                {answerState === 'correct' && stats.streak > 0 && stats.streak % 5 === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    <p className="text-2xl font-black text-accent">🔥 {stats.streak} streak!</p>
                    <p className="text-sm text-muted-foreground">You're on fire!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session summary when no question yet */}
        {!loadingQ && !question && stats.total > 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-6">{stats.correct}/{stats.total} correct · {accuracy}% accuracy · Best streak: {stats.bestStreak}</p>
            <Button onClick={() => generateQuestion()} className="bg-accent text-black font-bold">
              Keep Going <Zap size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
