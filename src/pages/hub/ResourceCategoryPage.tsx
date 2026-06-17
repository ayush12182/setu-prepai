import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, ChevronLeft, SlidersHorizontal, X,
  ArrowUpDown, Grid2x2, List, Lock
} from 'lucide-react';
import { HubLayout } from '@/components/hub/HubLayout';
import { ExamTabs } from '@/components/hub/ExamTabs';
import { ClassTabs } from '@/components/hub/ClassTabs';
import { SubjectFilter } from '@/components/hub/SubjectFilter';
import { ResourceCard } from '@/components/hub/ResourceCard';
import { useResources, useBookmarks } from '@/hooks/useResources';
import { useAuth } from '@/contexts/AuthContext';
import {
  EXAM_META, RESOURCE_TYPE_META,
  type Exam, type ClassLevel, type ResourceType, type Difficulty,
} from '@/types/hub';

function parseParams(exam?: string, cls?: string, cat?: string) {
  const validExam = (s?: string): Exam =>
    s === 'neet' ? 'neet' : s === 'cuet' ? 'cuet' : 'jee';
  const parseClass = (s?: string): ClassLevel => {
    if (s === 'class-12') return '12';
    if (s === 'droppers') return 'dropper';
    return '11';
  };
  const parseType = (s?: string): ResourceType => {
    if (s === 'pyq') return 'pyq';
    if (s === 'test') return 'test';
    if (s === 'revision') return 'revision';
    return 'notes';
  };
  return { exam: validExam(exam), cls: parseClass(cls), type: parseType(cat) };
}

const CLASS_LABEL: Record<ClassLevel, string> = { '11': 'Class 11', '12': 'Class 12', dropper: 'Droppers' };

// ─── Filter sidebar (desktop) / Sheet (mobile) ─────────────────────────────────
const FilterPanel: React.FC<{
  exam: Exam;
  difficulty: Difficulty | '';
  language: string;
  onDifficulty: (d: Difficulty | '') => void;
  onLanguage: (l: string) => void;
  onClose?: () => void;
}> = ({ exam, difficulty, language, onDifficulty, onLanguage, onClose }) => {
  const meta = EXAM_META[exam];
  return (
    <div className="space-y-5">
      {onClose && (
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">Filters</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-white/50" /></button>
        </div>
      )}

      {/* Difficulty */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Difficulty</p>
        <div className="space-y-1">
          {(['', 'easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => onDifficulty(d)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: difficulty === d ? meta.bg : 'transparent',
                color: difficulty === d ? meta.color : 'rgba(255,255,255,0.5)',
              }}
            >
              {d === '' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Language</p>
        <div className="space-y-1">
          {[
            { key: '', label: 'All Languages' },
            { key: 'english', label: 'English' },
            { key: 'hindi', label: 'Hindi' },
            { key: 'hinglish', label: 'Hinglish' },
          ].map(l => (
            <button
              key={l.key}
              onClick={() => onLanguage(l.key)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: language === l.key ? meta.bg : 'transparent',
                color: language === l.key ? meta.color : 'rgba(255,255,255,0.5)',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ResourceCategoryPage: React.FC = () => {
  const { exam: examParam, class: classParam, category } = useParams<{
    exam: string; class: string; category: string;
  }>();
  const navigate = useNavigate();
  const { exam, cls, type } = parseParams(examParam, classParam, category);
  const { user } = useAuth();

  const [activeSubject, setActiveSubject] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState<'latest' | 'views'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { resources, loading } = useResources({
    exam,
    class: cls,
    resourceType: type,
    subject: activeSubject || undefined,
    difficulty: difficulty || undefined,
    language: language || undefined,
  });

  const sorted = [...resources].sort((a, b) => {
    if (sort === 'views') return b.view_count - a.view_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const { bookmarks, toggle: toggleBookmark } = useBookmarks(user?.id ?? null);
  const typeMeta = RESOURCE_TYPE_META[type];
  const examMeta = EXAM_META[exam];
  const CLASS_URL: Record<ClassLevel, string> = { '11': 'class-11', '12': 'class-12', dropper: 'droppers' };

  return (
    <HubLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Top nav */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <ExamTabs activeExam={exam} activeClass={cls} />
          <div className="sm:ml-4">
            <ClassTabs activeExam={exam} activeClass={cls} category={category} />
          </div>
        </div>

        {/* Breadcrumb + header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/${exam}/${CLASS_URL[cls]}`)}
            className="flex items-center gap-1 text-xs mb-3 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {examMeta.label} {CLASS_LABEL[cls]}
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: typeMeta.bg }}
            >
              {typeMeta.icon}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{typeMeta.label}</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {examMeta.label} {CLASS_LABEL[cls]} · {sorted.length} resources
              </p>
            </div>
          </div>
        </div>

        {/* Subject filter */}
        <div className="mb-4">
          <SubjectFilter activeExam={exam} activeSubject={activeSubject} onChange={setActiveSubject} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(o => !o)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>

          <div className="flex-1" />

          {/* Sort */}
          <button
            onClick={() => setSort(s => s === 'latest' ? 'views' : 'latest')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
          >
            <ArrowUpDown className="w-3 h-3" />
            {sort === 'latest' ? 'Latest' : 'Most Viewed'}
          </button>

          {/* View mode */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['grid', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{
                  background: viewMode === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: viewMode === v ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {v === 'grid' ? <Grid2x2 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside
            className="hidden lg:block w-52 shrink-0 rounded-2xl p-4 self-start sticky top-20"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <FilterPanel
              exam={exam}
              difficulty={difficulty}
              language={language}
              onDifficulty={setDifficulty}
              onLanguage={setLanguage}
            />
          </aside>

          {/* Mobile filter drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="relative w-72 h-full p-5 overflow-auto"
                style={{ background: '#111827' }}
              >
                <FilterPanel
                  exam={exam}
                  difficulty={difficulty}
                  language={language}
                  onDifficulty={d => { setDifficulty(d); setMobileFiltersOpen(false); }}
                  onLanguage={l => { setLanguage(l); setMobileFiltersOpen(false); }}
                  onClose={() => setMobileFiltersOpen(false)}
                />
              </motion.div>
            </div>
          )}

          {/* Resource grid */}
          <div className="flex-1 min-w-0">
            {!user ? (
              <div 
                className="relative overflow-hidden rounded-2xl p-8 text-center max-w-2xl mx-auto my-8 shadow-lg"
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.08)' 
                }}
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner"
                    style={{ 
                      color: typeMeta.color, 
                      backgroundColor: typeMeta.bg, 
                      border: '1.5px solid rgba(255,255,255,0.1)' 
                    }}
                  >
                    <Lock className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">Unlock All {typeMeta.label}</h3>
                  <p className="text-xs font-semibold max-w-md mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Access our complete curated library of study guides, practice sets, worksheets, and quick-revision cheatsheets designed to optimize your prep.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => navigate('/signup')} 
                      className="px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: typeMeta.color, color: '#000' }}
                    >
                      Create Free Account
                    </button>
                    <button 
                      onClick={() => navigate('/auth')} 
                      className="px-6 py-2.5 bg-transparent border font-extrabold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                      style={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: typeMeta.color }} />
              </div>
            ) : sorted.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <span className="text-4xl mb-3">📭</span>
                <p className="text-sm font-medium text-white mb-1">No resources found</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Try removing filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sorted.map((r, i) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    isBookmarked={bookmarks.has(r.id)}
                    onBookmark={user ? toggleBookmark : undefined}
                    onView={r2 => r2.content_url && window.open(r2.content_url, '_blank')}
                    delay={i * 0.04}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span className="text-2xl shrink-0">{typeMeta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {r.subject} · {r.chapter} · {r.pages ? `${r.pages}p` : ''}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: typeMeta.bg, color: typeMeta.color }}
                    >{r.sub_type ?? typeMeta.label}</span>
                    {r.content_url && (
                      <a href={r.content_url} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                        style={{ background: typeMeta.bg, color: typeMeta.color }}>
                        View
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </HubLayout>
  );
};

export default ResourceCategoryPage;
