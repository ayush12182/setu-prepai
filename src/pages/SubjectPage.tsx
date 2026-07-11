import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Search, BookOpen, CheckCircle2,
  Atom, FlaskConical, Calculator, Leaf, 
  ChevronRight, Library, FileText, Check, Trophy, Target, BarChart, 
  Map, Bookmark, PlayCircle, HelpCircle, GraduationCap, PenTool, ClipboardCheck
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  physicsChapters, chemistryChapters, mathsChapters,
  Chapter, APPROVED_CHAPTERS
import { neetBiologyChapters } from '@/data/neetSyllabus';
import { safePercent, safeNumber } from '@/lib/utils';

type SubjectKey = 'physics' | 'chemistry' | 'maths' | 'biology';

const SUBJECT_CONFIG: Record<SubjectKey, {
  label: string; icon: React.FC<any>; 
  color: string; bg: string; 
  accent: string; gradient: string; shadow: string;
}> = {
  physics: {
    label: 'Physics', icon: Atom,
    color: 'text-blue-600', bg: 'bg-blue-50',
    accent: '#2563EB', gradient: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/20'
  },
  chemistry: {
    label: 'Chemistry', icon: FlaskConical,
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    accent: '#059669', gradient: 'from-emerald-500 to-teal-700', shadow: 'shadow-emerald-500/20'
  },
  maths: {
    label: 'Mathematics', icon: Calculator,
    color: 'text-violet-600', bg: 'bg-violet-50',
    accent: '#7C3AED', gradient: 'from-violet-600 to-purple-800', shadow: 'shadow-violet-500/20'
  },
  biology: {
    label: 'Biology', icon: Leaf,
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    accent: '#059669', gradient: 'from-emerald-500 to-green-700', shadow: 'shadow-emerald-500/20'
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
    return safePercent(raw);
  } catch { return 0; }
}

type FilterTab = 'all' | 'in-progress' | 'completed' | 'bookmarked' | 'high-weightage';

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
      filter === 'completed' ? prog === 100 : 
      filter === 'high-weightage' ? ch.weightage === 'High' : true;
    return matchSearch && matchFilter;
  });

  const completedCount = chapters.filter(ch => (progresses[ch.id] ?? 0) === 100).length;
  const highWeightageCount = chapters.filter(ch => ch.weightage === 'High').length;
  const sumProgress = chapters.reduce((acc, ch) => acc + safePercent(progresses[ch.id]), 0);
  const overallProgress = chapters.length > 0
    ? safePercent(Math.round(sumProgress / chapters.length))
    : 0;

  const handleChapterClick = (chapter: Chapter) => {
    navigate(`/learn/${subject}/${chapter.id}`);
  };

  return (
    <MainLayout>
      <div className="relative max-w-[1440px] mx-auto pb-24 px-4 lg:px-8 pt-4">

        {/* ── Subject Switcher ────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
          {(['physics', 'chemistry', 'maths'] as SubjectKey[]).map(tabKey => {
            const isActive = subject === tabKey;
            const tabConfig = SUBJECT_CONFIG[tabKey];
            const TabIcon = tabConfig.icon;
            return (
              <button
                key={tabKey}
                onClick={() => navigate(`/learn/${tabKey}`)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-bold border transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0',
                  isActive
                    ? `bg-slate-900 text-white border-transparent shadow-md hover:scale-[1.02]`
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <TabIcon className={cn("w-4 h-4", isActive ? 'text-white' : tabConfig.color)} />
                {tabConfig.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-8">
            {/* ── Premium Hero Section ────────────────────────────────────────── */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[24px] bg-white border border-slate-200/60 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-slate-100/30 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
                
                <div className="flex-1 z-10">
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 font-bold text-xs uppercase tracking-widest", config.bg, config.color)}>
                    <SubjectIcon className="w-3.5 h-3.5" /> {config.label} Class 11 & 12
                  </div>
                  <h1 className="text-[34px] md:text-[42px] font-[800] text-slate-900 leading-[1.15] tracking-tight mb-4">
                    Master concepts with <br className="hidden md:block"/> structured classroom notes.
                  </h1>
                  <p className="text-[16px] text-slate-500 font-medium max-w-xl leading-relaxed">
                    AI practice, adaptive tests, smart revision, and deep performance tracking built directly into your syllabus.
                  </p>
                </div>
                
                {/* 3D Illustration Placeholder */}
                <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-full blur-3xl animate-pulse" style={{ backgroundImage: `linear-gradient(to bottom right, ${config.accent}, transparent)` }} />
                  <div className={cn("w-full h-full bg-gradient-to-br rounded-[32px] shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-500", config.gradient, config.shadow)}>
                    <SubjectIcon className="w-24 h-24 text-white drop-shadow-md" />
                  </div>
                </div>

              </div>
            </motion.div>

            {/* ── Statistics Section ──────────────────────────────────────────── */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { title: 'Total Chapters', val: chapters.length, icon: Library, color: 'text-blue-600', bg: 'bg-blue-50' },
                { title: 'Completed', val: completedCount, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { title: 'Progress', val: `${overallProgress}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
                { title: 'High Weightage', val: highWeightageCount, icon: Trophy, color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200/60 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110', stat.bg)}>
                      <stat.icon className={cn('w-4.5 h-4.5', stat.color)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-[800] text-slate-900 tracking-tight">{stat.val}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* ── Search & Filters ────────────────────────────────────────────── */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row items-center gap-4 bg-white/50 backdrop-blur-sm border border-slate-200/60 p-2 rounded-[20px] shadow-sm sticky top-16 z-30"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chapters, topics, concepts..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 pl-12 pr-14 bg-white border border-slate-200/60 rounded-xl text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 font-medium transition-all shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
                  <kbd className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">K</kbd>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-slate-100/50 rounded-xl scrollbar-hide border border-slate-200/50">
                {(['all', 'in-progress', 'completed', 'high-weightage'] as FilterTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={cn(
                      'relative px-5 h-10 rounded-lg text-xs font-bold transition-all duration-300 capitalize whitespace-nowrap',
                      filter === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    )}
                  >
                    {filter === tab && (
                      <motion.div layoutId="activePill" className="absolute inset-0 bg-white shadow-sm rounded-lg border border-slate-200/60 z-0" />
                    )}
                    <span className="relative z-10">{tab.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Chapter Cards ───────────────────────────────────────────────── */}
            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((chapter, idx) => {
                  const progress = progresses[chapter.id] ?? 0;
                  const isCompleted = progress === 100;
                  const chNum = String(chapters.indexOf(chapter) + 1).padStart(2, '0');
                  
                  return (
                    <motion.div
                      key={chapter.id}
                      layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      onClick={() => handleChapterClick(chapter)}
                      className="group flex flex-col sm:flex-row items-center gap-6 bg-white border border-slate-200/60 rounded-[24px] p-5 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer hover:-translate-y-[2px]"
                    >
                      {/* Number block */}
                      <div className="flex items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                        <span className="text-xl font-[900] text-slate-300 group-hover:text-blue-500">{chNum}</span>
                      </div>
                      
                      {/* Chapter Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-[20px] font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{chapter.name}</h2>
                          {chapter.weightage === 'High' && (
                            <span className="px-2 py-1 rounded border border-amber-200 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider shrink-0">
                              High Weightage
                            </span>
                          )}
                          {true && (
                            <span className="px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        
                        {/* Resources Icons */}
                        <div className="flex items-center gap-5 mt-2 text-slate-400">
                          <div className="flex items-center gap-1.5" title="Notes">
                            <BookOpen className="w-4 h-4" /> <span className="text-xs font-semibold">Notes</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Practice">
                            <PenTool className="w-4 h-4" /> <span className="text-xs font-semibold">Practice</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Tests">
                            <ClipboardCheck className="w-4 h-4" /> <span className="text-xs font-semibold">Tests</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress & Time */}
                      <div className="flex items-center gap-8 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex-1 sm:w-32">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                            <span className="text-xs font-black" style={{ color: isCompleted ? '#059669' : config.accent }}>{progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full" 
                              style={{ background: isCompleted ? '#059669' : config.accent }}
                            />
                          </div>
                        </div>
                        
                        <div className="hidden sm:block">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Time</div>
                          <div className="text-sm font-bold text-slate-700">5h 30m</div>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors shrink-0">
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {filtered.length === 0 && (
                <div className="text-center py-24 bg-slate-50/50 rounded-[24px] border border-slate-200 border-dashed">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold text-lg">No chapters found</p>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>

          </div>

          {/* ── Right Floating Dock (Desktop Only) ───────────────────────────── */}
          <div className="hidden xl:block w-20 shrink-0">
            <div className="sticky top-24 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[24px] py-4 shadow-sm flex flex-col items-center gap-2">
              {[
                { icon: Map, label: 'Mind Map', color: 'text-amber-500', bg: 'hover:bg-amber-50 hover:text-amber-600' },
                { icon: FileText, label: 'Formulas', color: 'text-blue-500', bg: 'hover:bg-blue-50 hover:text-blue-600' },
                { icon: Bookmark, label: 'Bookmarks', color: 'text-emerald-500', bg: 'hover:bg-emerald-50 hover:text-emerald-600' },
                { icon: GraduationCap, label: 'Syllabus', color: 'text-violet-500', bg: 'hover:bg-violet-50 hover:text-violet-600' },
              ].map((tool, i) => (
                <button key={i} className={cn("group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 text-slate-400", tool.bg)}>
                  <tool.icon className={cn("w-5 h-5 transition-colors")} />
                  {/* Tooltip */}
                  <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                    {tool.label}
                    {/* Tooltip triangle */}
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default SubjectPage;
