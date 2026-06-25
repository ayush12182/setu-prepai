// SubjectPage — /learn/:subject
// Shows all chapters for a subject with PW-style numbered list + progress

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ChevronRight, Search, BookOpen, CheckCircle2,
  Atom, FlaskConical, Calculator, Leaf, Lock, PlayCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  physicsChapters, chemistryChapters, mathsChapters,
  getChaptersBySubject, Chapter
} from '@/data/syllabus';
import { neetBiologyChapters } from '@/data/neetSyllabus';

// ─── Config ──────────────────────────────────────────────────────────────────
type SubjectKey = 'physics' | 'chemistry' | 'maths' | 'biology';

const SUBJECT_CONFIG: Record<SubjectKey, {
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  accent: string;
  accentLight: string;
}> = {
  physics: {
    label: 'Physics', icon: Atom,
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200',
    accent: '#2563EB', accentLight: '#EFF6FF',
  },
  chemistry: {
    label: 'Chemistry', icon: FlaskConical,
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
    accent: '#059669', accentLight: '#ECFDF5',
  },
  maths: {
    label: 'Mathematics', icon: Calculator,
    color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200',
    accent: '#7C3AED', accentLight: '#F5F3FF',
  },
  biology: {
    label: 'Biology', icon: Leaf,
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
    accent: '#059669', accentLight: '#ECFDF5',
  },
};

function getChapters(subject: string): Chapter[] {
  switch (subject) {
    case 'physics': return physicsChapters;
    case 'chemistry': return chemistryChapters;
    case 'maths': return mathsChapters;
    case 'biology': return neetBiologyChapters;
    default: return [];
  }
}

function getChapterProgress(chapterId: string): number {
  try {
    const raw = localStorage.getItem(`ch_progress_${chapterId}`);
    return raw ? Math.min(100, Math.max(0, Number(raw))) : 0;
  } catch { return 0; }
}

type FilterTab = 'all' | 'in-progress' | 'completed';

// ─── Component ────────────────────────────────────────────────────────────────
const SubjectPage: React.FC = () => {
  const { subject = 'physics' } = useParams<{ subject: string }>();
  const navigate = useNavigate();

  const config = SUBJECT_CONFIG[subject as SubjectKey] ?? SUBJECT_CONFIG.physics;
  const chapters = getChapters(subject);
  const SubjectIcon = config.icon;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [progresses, setProgresses] = useState<Record<string, number>>({});

  useEffect(() => {
    const p: Record<string, number> = {};
    chapters.forEach(ch => { p[ch.id] = getChapterProgress(ch.id); });
    setProgresses(p);
  }, [subject]);

  const filtered = chapters.filter(ch => {
    const matchSearch = search === '' || ch.name.toLowerCase().includes(search.toLowerCase());
    const prog = progresses[ch.id] ?? 0;
    const matchFilter =
      filter === 'all' ? true :
      filter === 'in-progress' ? (prog > 0 && prog < 100) :
      filter === 'completed' ? prog === 100 : true;
    return matchSearch && matchFilter;
  });

  const completedCount = chapters.filter(ch => (progresses[ch.id] ?? 0) === 100).length;
  const inProgressCount = chapters.filter(ch => { const p = progresses[ch.id] ?? 0; return p > 0 && p < 100; }).length;
  const overallProgress = chapters.length > 0
    ? Math.round(chapters.reduce((acc, ch) => acc + (progresses[ch.id] ?? 0), 0) / chapters.length)
    : 0;

  const handleChapterClick = (chapter: Chapter, index: number) => {
    // Save last visited
    try {
      localStorage.setItem('last_chapter', JSON.stringify({
        subject,
        subjectLabel: config.label,
        chapterId: chapter.id,
        chapterName: chapter.name,
        chapterNum: `CH-${String(index + 1).padStart(2, '0')}`,
        tab: 'Notes',
        color: config.accent,
        bg: config.accentLight,
      }));
    } catch { /* ignore */ }
    navigate(`/learn/${subject}/${chapter.id}`);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-20">

          {/* ── Back + Header ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('/student-hub')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              My Batch
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0', config.bg, `border ${config.border}`)}>
                    <SubjectIcon className={cn('w-7 h-7', config.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-0.5">Subject</p>
                    <h1 className="text-2xl font-black text-slate-900">{config.label}</h1>
                    <p className="text-slate-500 text-sm font-medium">
                      {chapters.length} chapters · {completedCount} completed · {inProgressCount} in progress
                    </p>
                  </div>
                </div>

                {/* Overall progress ring */}
                <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke={config.accent} strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - overallProgress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-slate-900 font-black text-sm">{overallProgress}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Complete</p>
                </div>
              </div>

              {/* Mobile progress bar */}
              <div className="mt-4 sm:hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 font-medium">Overall progress</span>
                  <span className="text-xs font-bold" style={{ color: config.accent }}>{overallProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, background: config.accent }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Search + Filter ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chapters..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 font-medium transition-all"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'in-progress', 'completed'] as FilterTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={cn(
                    'px-4 h-11 rounded-xl text-xs font-bold border transition-all capitalize whitespace-nowrap',
                    filter === tab
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  )}
                  style={filter === tab ? { background: config.accent } : {}}
                >
                  {tab === 'in-progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Chapter List ─────────────────────────────────────────────────── */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No chapters found</p>
              </div>
            ) : (
              filtered.map((chapter, idx) => {
                const progress = progresses[chapter.id] ?? 0;
                const isCompleted = progress === 100;
                const isInProgress = progress > 0 && progress < 100;
                const chNum = `CH-${String(chapters.indexOf(chapter) + 1).padStart(2, '0')}`;

                return (
                  <motion.button
                    key={chapter.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + idx * 0.025 }}
                    onClick={() => handleChapterClick(chapter, chapters.indexOf(chapter))}
                    className={cn(
                      'w-full bg-white border rounded-xl px-5 py-4 text-left shadow-sm',
                      'hover:shadow-md transition-all duration-200 group',
                      isCompleted ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Chapter number / status */}
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors',
                        isCompleted
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                          : isInProgress
                          ? 'border text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-500'
                      )}
                      style={isInProgress ? { background: config.accent, borderColor: config.accent } : {}}
                      >
                        {isCompleted
                          ? <CheckCircle2 className="w-5 h-5" />
                          : <span>{chNum.split('-')[1]}</span>
                        }
                      </div>

                      {/* Chapter info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400">{chNum}</p>
                            <p className={cn(
                              'font-extrabold text-sm mt-0.5 transition-colors',
                              isCompleted ? 'text-emerald-800' : 'text-slate-900 group-hover:text-slate-700'
                            )}>
                              {chapter.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs font-medium mt-1">
                              <span>{chapter.topics.length + 4} Resources</span>
                              <span className="text-slate-300">•</span>
                              <span>Updated 2 days ago</span>
                              {chapter.weightage === 'High' && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                    High Weightage
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <ChevronRight className={cn(
                            'w-4 h-4 shrink-0 mt-1 group-hover:translate-x-0.5 transition-all',
                            isCompleted ? 'text-emerald-400' : 'text-slate-300'
                          )} />
                        </div>

                        {/* Progress bar */}
                        {progress > 0 && (
                          <div className="mt-2.5">
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${progress}%`,
                                  background: isCompleted ? '#10b981' : config.accent
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
      </div>
    </MainLayout>
  );
};

export default SubjectPage;
