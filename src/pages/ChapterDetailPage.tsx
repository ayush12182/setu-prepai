// ChapterDetailPage — /learn/:subject/:chapterId
// PW-style split layout: Left chapter nav + Right 6-tab content

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Play, FileText, PenTool, ClipboardCheck,
  RotateCcw, Brain, ChevronRight, ChevronLeft, Check,
  Clock, BookOpen, Zap, Star, Download, ExternalLink,
  MessageSquare, Sparkles, Target, BarChart3, CalendarDays,
  Atom, FlaskConical, Calculator, Leaf, Lock, CheckCircle2,
  Eye, Lightbulb, HelpCircle, TrendingUp, Layers, AlertTriangle
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  physicsChapters, chemistryChapters, mathsChapters,
  getChapterById, Chapter
} from '@/data/syllabus';
import { neetBiologyChapters } from '@/data/neetSyllabus';
import { useExamMode } from '@/contexts/ExamModeContext';
import { trackChapterVisit, trackNotesRead } from '@/utils/activityTracker';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = 'notes' | 'practice' | 'tests' | 'revision' | 'ai-mentor';
type SubjectKey = 'physics' | 'chemistry' | 'maths' | 'biology';

// ─── Config ──────────────────────────────────────────────────────────────────
const SUBJECT_CONFIG: Record<SubjectKey, {
  label: string; icon: React.FC<{ className?: string }>;
  color: string; bg: string; border: string; accent: string;
}> = {
  physics:   { label: 'Physics',     icon: Atom,         color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',   accent: '#3b82f6' },
  chemistry: { label: 'Chemistry',   icon: FlaskConical, color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-200', accent: '#f97316' },
  maths:     { label: 'Mathematics', icon: Calculator,   color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200', accent: '#8b5cf6' },
  biology:   { label: 'Biology',     icon: Leaf,         color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: '#10b981' },
};

const TABS: { key: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'notes',      label: 'Notes',     icon: FileText },
  { key: 'practice',   label: 'Practice',  icon: PenTool },
  { key: 'tests',      label: 'Tests',     icon: ClipboardCheck },
  { key: 'revision',   label: 'Revision',  icon: RotateCcw },
  { key: 'ai-mentor',  label: 'Ask PrepEntrance', icon: Brain },
];

function getChapters(subject: string): Chapter[] {
  switch (subject) {
    case 'physics': return physicsChapters;
    case 'chemistry': return chemistryChapters;
    case 'maths': return mathsChapters;
    case 'biology': return neetBiologyChapters;
    default: return [];
  }
}



// ─── Notes content ────────────────────────────────────────────────────────────
const NOTE_TYPES = [
  { key: 'default',       icon: BookOpen,      label: 'Complete Notes',       desc: 'Theory, illustrations, solved examples & exam insights', color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    emoji: '📘' },
  { key: 'formulas_only', icon: Zap,           label: 'Formula Sheet',        desc: 'Formula cards with variables & usage details',     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   emoji: '⚡' },
  { key: 'pyqs',          icon: Star,          label: 'PYQ Insights',         desc: 'Exam appearance logs and topper focus areas',       color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200',  emoji: '🎯' },
  { key: 'mistakes_only', icon: AlertTriangle, label: 'Common Mistakes',   desc: 'Concept traps resolved with clear fixes',           color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     emoji: '❌' },
  { key: 'revision',      icon: RotateCcw,     label: 'Quick Revision',       desc: 'Rapid 5-minute study recall summaries',             color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200',  emoji: '📝' },
  { key: 'ask_ai',        icon: Brain,         label: 'Ask PrepEntrance',     desc: 'AI Study Assistant chatbot for doubts',             color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', emoji: '🤖' },
];

// ─── Practice sets ────────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  Easy:   { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Medium: { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  Hard:   { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500' },
};

// ─── AI Mentor features ───────────────────────────────────────────────────────
const AI_FEATURES = [
  { icon: HelpCircle,    label: 'Doubt Solving',        desc: 'Ask any concept doubt and get instant explanation', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', route: '/ask-prepentrance' },
  { icon: Lightbulb,     label: 'Concept Explanation',  desc: 'Deep dive into any topic with AI-powered clarity', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', route: '/ask-prepentrance' },
  { icon: Sparkles,      label: 'Question Generation',  desc: 'Generate custom practice questions on any topic', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', route: '/ask-prepentrance' },
  { icon: CalendarDays,  label: 'Study Planning',       desc: 'Get a personalized study plan for this chapter', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', route: '/ask-prepentrance' },
  { icon: BarChart3,     label: 'Performance Analysis', desc: 'Understand your weak points in this chapter', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', route: '/analytics' },
];

// ─── Revision types ───────────────────────────────────────────────────────────
const REVISION_TYPES = [
  { icon: Zap,      label: 'Formula Revision',       desc: 'Review all formulas with usage examples', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { icon: Layers,   label: 'Flashcards',             desc: 'Swipe-based concept recall cards',        color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  { icon: Eye,      label: 'Quick Revision Sheet',   desc: '5-min complete chapter summary',          color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const NotesTab: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      {/* Chapter Snapshot Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <BookOpen className="w-4 h-4 text-blue-600 animate-pulse" /> Chapter Snapshot: What you'll learn
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-600">
          {chapter.topics.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Study Materials · {chapter.name}
      </p>

      {NOTE_TYPES.map((note) => {
        const Icon = note.icon;
        return (
          <button
            key={note.label}
            onClick={() => {
              if (note.key === 'ask_ai') {
                navigate(`/ask-prepentrance?chapter=${chapter.id}`);
              } else {
                // Mark notes as read when student clicks any study material
                trackNotesRead(chapter.id, chapter.subject, chapter.name);
                navigate(`/chapter/${chapter.id}/notes?mode=${note.key}`);
              }
            }}
            className={cn(
              'w-full flex items-center justify-between p-4 bg-white border rounded-xl',
              'hover:shadow-sm transition-all duration-200 group text-left',
              note.border
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', note.bg, note.border)}>
                <span className="text-base mr-0.5">{note.emoji}</span>
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm">{note.label}</p>
                <p className="text-slate-450 text-xs font-semibold text-slate-500 mt-0.5">{note.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn('text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider', note.bg, note.color, note.border)}>
                {note.key === 'ask_ai' ? 'Chat' : 'AI'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500 transition-all" />
            </div>
          </button>
        );
      })}

      {/* Key Formulas inline */}
      {chapter.keyFormulas.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Formulas Quick Recall</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chapter.keyFormulas.slice(0, 4).map((formula, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-xl font-mono text-xs text-slate-700">
                {formula}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PracticeTab: React.FC<{ chapter: Chapter; accent: string }> = ({ chapter, accent }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* Topic-wise practice */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Topic-wise Practice</p>
        <div className="space-y-2">
          {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
            const cfg = DIFFICULTY_CONFIG[diff];
            const qCount = diff === 'Easy' ? 25 : diff === 'Medium' ? 40 : 20;
            return (
              <button
                key={diff}
                onClick={() => navigate(`/practice?chapter=${chapter.id}&difficulty=${diff.toLowerCase()}`)}
                className={cn('w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-all group text-left', cfg.border)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                  <div>
                    <p className="text-slate-900 font-bold text-sm">{diff}</p>
                    <p className="text-slate-400 text-xs font-medium">{qCount} questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', cfg.bg, cfg.color, cfg.border)}>
                    Start
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Adaptive Practice */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Adaptive Practice</p>
        <button
          onClick={() => navigate('/practice/adaptive')}
          className="w-full flex items-center justify-between p-5 rounded-xl text-left hover:shadow-md transition-all group border border-transparent"
          style={{ background: `${accent}0F`, borderColor: `${accent}33` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}20` }}>
              <Sparkles className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">AI Adaptive Practice</p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Questions adjust to your level in real-time</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm"
            style={{ background: accent }}>
            Try Now <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Topics list */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Practice by Topic</p>
        <div className="space-y-1.5">
          {chapter.topics.map((topic, i) => (
            <button
              key={i}
              onClick={() => navigate(`/practice?chapter=${chapter.id}&topic=${encodeURIComponent(topic)}`)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group text-left"
            >
              <span className="text-slate-700 font-medium text-sm">{topic}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const TestsTab: React.FC<{ chapter: Chapter; accent: string }> = ({ chapter, accent }) => {
  const navigate = useNavigate();
  const testTypes = [
    { label: 'Chapter Test', desc: `Full chapter assessment · 30 questions · 60 min`, icon: ClipboardCheck, route: `/test?chapter=${chapter.id}`, featured: true },
    { label: 'Subject Test', desc: 'Combined subject assessment · 60 questions', icon: Target, route: '/test', featured: false },
    { label: 'Full Length Mock', desc: 'Complete exam simulation · 180 questions · 3 hrs', icon: BarChart3, route: '/test', featured: false },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Assessment Center · {chapter.name}
      </p>
      {testTypes.map((test) => {
        const Icon = test.icon;
        return (
          <button
            key={test.label}
            onClick={() => navigate(test.route)}
            className={cn(
              'w-full flex items-center justify-between p-5 rounded-xl text-left transition-all group',
              test.featured
                ? 'border border-transparent hover:shadow-md'
                : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm'
            )}
            style={test.featured ? { background: `${accent}0F`, borderColor: `${accent}33` } : {}}
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border shrink-0')}
                style={test.featured ? { background: `${accent}20`, borderColor: `${accent}33` } : { background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <Icon className="w-5 h-5" style={{ color: test.featured ? accent : '#64748b' }} />
              </div>
              <div>
                <p className={cn('font-extrabold text-sm', test.featured ? 'text-slate-900' : 'text-slate-800')}>
                  {test.label}
                  {test.featured && <span className="ml-2 text-[10px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: accent }}>RECOMMENDED</span>}
                </p>
                <p className="text-slate-400 text-xs font-medium mt-0.5">{test.desc}</p>
              </div>
            </div>
            <div className={cn('shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-sm', test.featured ? 'text-white' : 'text-slate-600 bg-slate-100 border border-slate-200')}
              style={test.featured ? { background: accent } : {}}>
              Start <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        );
      })}

      {/* PYQ Data */}
      {chapter.pyqData.total > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 font-bold text-sm">Previous Year Questions</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-amber-900 font-black text-xl">{chapter.pyqData.total}</p>
              <p className="text-amber-600 text-xs font-medium">Total PYQs</p>
            </div>
            <div className="text-center border-x border-amber-200">
              <p className="text-amber-900 font-black text-xl">{chapter.pyqData.postCovid}</p>
              <p className="text-amber-600 text-xs font-medium">Post 2020</p>
            </div>
            <div className="text-center">
              <p className="text-amber-900 font-black text-xl">{chapter.pyqData.preCovid}</p>
              <p className="text-amber-600 text-xs font-medium">2010–2020</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RevisionTab: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Revision Resources · {chapter.name}
      </p>

      {REVISION_TYPES.map((rev) => {
        const Icon = rev.icon;
        return (
          <button
            key={rev.label}
            onClick={() => navigate(`/revision/${chapter.subject}/${encodeURIComponent(chapter.name)}`)}
            className={cn('w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-all group text-left', rev.border)}
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border shrink-0', rev.bg, rev.border)}>
                <Icon className={cn('w-5 h-5', rev.color)} />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm">{rev.label}</p>
                <p className="text-slate-400 text-xs font-medium mt-0.5">{rev.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500 transition-all shrink-0" />
          </button>
        );
      })}

      {/* Exam Tips */}
      {chapter.examTips.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Exam Tips</p>
          <div className="space-y-2">
            {chapter.examTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-black shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-slate-700 text-sm font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AIMentorTab: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        AI-Powered Learning · {chapter.name}
      </p>
      {AI_FEATURES.map((feat) => {
        const Icon = feat.icon;
        return (
          <button
            key={feat.label}
            onClick={() => navigate(feat.route)}
            className={cn('w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-all group text-left', feat.border)}
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border shrink-0', feat.bg, feat.border)}>
                <Icon className={cn('w-5 h-5', feat.color)} />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm">{feat.label}</p>
                <p className="text-slate-400 text-xs font-medium mt-0.5">{feat.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shrink-0"
              style={{ background: '#3b82f6' }}>
              <Sparkles className="w-3 h-3" /> Ask AI
            </div>
          </button>
        );
      })}

      {/* Quick prompt box */}
      <div className="mt-4 bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-xl p-4">
        <p className="text-slate-700 font-bold text-sm mb-2">Ask about {chapter.name}</p>
        <button
          onClick={() => navigate('/ask-prepentrance')}
          className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-400 text-sm">Explain {chapter.topics[0]}...</span>
          <Sparkles className="w-4 h-4 text-blue-500 ml-auto shrink-0" />
        </button>
      </div>
    </div>
  );
};

// Helper function to return standard exam question weightage
const getQuestionsAskedText = (subject: string, examType: 'NEET' | 'CUET' | 'JEE', weightage: string) => {
  const w = weightage || 'Medium';
  if (examType === 'NEET') {
    return w === 'High' ? 'NEET: 3-4 questions' : w === 'Medium' ? 'NEET: 2 questions' : 'NEET: 1 question';
  } else if (examType === 'CUET') {
    return w === 'High' ? 'CUET: 4-5 questions' : w === 'Medium' ? 'CUET: 2-3 questions' : 'CUET: 1-2 questions';
  } else {
    return w === 'High' ? 'JEE Main: 1-2 | Advanced: 1' : w === 'Medium' ? 'JEE Main: 1 | Advanced: 0-1' : 'JEE Main: 0-1 | Advanced: 0';
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ChapterDetailPage: React.FC = () => {
  const { subject = 'physics', chapterId } = useParams<{ subject: string; chapterId: string }>();
  const navigate = useNavigate();
  const { isNeet, isCuet } = useExamMode();

  const config = SUBJECT_CONFIG[subject as SubjectKey] ?? SUBJECT_CONFIG.physics;
  const SubjectIcon = config.icon;
  const chapters = getChapters(subject);
  const chapter = chapterId ? getChapterById(chapterId) : null;

  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [leftOpen, setLeftOpen] = useState(true);

  const currentIdx = chapter ? chapters.findIndex(ch => ch.id === chapterId) : 0;
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  // Track chapter visit & update dashboard via activityTracker
  useEffect(() => {
    if (!chapter) return;
    trackChapterVisit({
      subject,
      subjectLabel: config.label,
      chapterId: chapter.id,
      chapterName: chapter.name,
      chapterNum: `CH-${String(currentIdx + 1).padStart(2, '0')}`,
      tab: TABS.find(t => t.key === activeTab)?.label ?? 'Notes',
      accent: config.accent,
      bg: `${config.accent}15`,
    });
    // If student opened Notes tab, mark notes as read
    if (activeTab === 'notes') {
      trackNotesRead(chapter.id, subject, chapter.name);
    }
  }, [chapter?.id, activeTab]);

  if (!chapter) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 font-medium">Chapter not found.</p>
            <button
              onClick={() => navigate(`/learn/${subject}`)}
              className="mt-4 text-blue-600 font-bold text-sm hover:underline"
            >← Back to {config.label}</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const chNum = `CH-${String(currentIdx + 1).padStart(2, '0')}`;
  const examType = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';

  return (
    <MainLayout fullHeight>
      <div className="h-full flex bg-slate-50 overflow-hidden">

        {/* ── Left Chapter Nav ─────────────────────────────────────────────── */}
        <aside className={cn(
          'shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden transition-all duration-300',
          leftOpen ? 'w-[280px]' : 'w-0 lg:w-14'
        )}>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            {leftOpen && (
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', config.bg, `border ${config.border}`)}>
                  <SubjectIcon className={cn('w-4 h-4', config.color)} />
                </div>
                <span className="text-sm font-black text-slate-900 truncate">{config.label}</span>
              </div>
            )}
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors ml-auto"
            >
              {leftOpen ? <ChevronLeft className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>

          {/* Back to subject */}
          {leftOpen && (
            <button
              onClick={() => navigate(`/learn/${subject}`)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Chapters
            </button>
          )}

          {/* Chapter list */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {chapters.map((ch, i) => {
              const isActive = ch.id === chapterId;
              const num = `${String(i + 1).padStart(2, '0')}`;
              return (
                <button
                  key={ch.id}
                  onClick={() => navigate(`/learn/${subject}/${ch.id}`)}
                  className={cn(
                    'w-full text-left rounded-lg px-3 py-2.5 transition-all group',
                    isActive
                      ? 'text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  style={isActive ? { background: config.accent } : {}}
                  title={!leftOpen ? ch.name : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      'text-[10px] font-black w-6 shrink-0 text-center',
                      isActive ? 'text-white/80' : 'text-slate-400'
                    )}>
                      {num}
                    </span>
                    {leftOpen && (
                      <span className="text-xs font-semibold truncate">{ch.name}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Right Content Area ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Chapter header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{chNum} · {config.label}</p>
                <h1 className="text-xl font-black text-slate-900 mt-0.5">{chapter.name}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={cn('text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border',
                    chapter.weightage === 'High' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                    chapter.weightage === 'Medium' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                    'text-slate-600 bg-slate-50 border-slate-200'
                  )}>
                    {chapter.weightage} Weightage
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-blue-700 bg-blue-50 border-blue-200 uppercase tracking-wider">
                    {isNeet ? 'NEET Prep' : isCuet ? 'CUET Domains' : 'JEE Main + Advanced'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-500 font-semibold">
                  <span className="bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
                    Questions Asked: {getQuestionsAskedText(chapter.subject, examType, chapter.weightage)}
                  </span>
                  <span className="bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
                    Study Time: 5 Hours
                  </span>
                  <span className="bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
                    Difficulty: {chapter.difficulty}
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 font-black">
                    Based on NCERT + PYQ Analysis
                  </span>
                </div>
              </div>

              {/* Prev/Next nav */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={!prevChapter}
                  onClick={() => prevChapter && navigate(`/learn/${subject}/${prevChapter.id}`)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  disabled={!nextChapter}
                  onClick={() => nextChapter && navigate(`/learn/${subject}/${nextChapter.id}`)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all',
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    )}
                    style={isActive ? { background: config.accent } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'notes'     && <NotesTab     chapter={chapter} />}
                  {activeTab === 'practice'  && <PracticeTab  chapter={chapter} accent={config.accent} />}
                  {activeTab === 'tests'     && <TestsTab     chapter={chapter} accent={config.accent} />}
                  {activeTab === 'revision'  && <RevisionTab  chapter={chapter} />}
                  {activeTab === 'ai-mentor' && <AIMentorTab  chapter={chapter} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <button
              disabled={!prevChapter}
              onClick={() => prevChapter && navigate(`/learn/${subject}/${prevChapter.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {prevChapter ? prevChapter.name : 'Previous'}
              </span>
            </button>

            <span className="text-xs font-bold text-slate-400">{currentIdx + 1} / {chapters.length}</span>

            <button
              disabled={!nextChapter}
              onClick={() => nextChapter && navigate(`/learn/${subject}/${nextChapter.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
              style={{ background: config.accent }}
            >
              <span className="hidden sm:inline">
                {nextChapter ? nextChapter.name : 'Next'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default ChapterDetailPage;
