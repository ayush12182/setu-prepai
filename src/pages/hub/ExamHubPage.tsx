import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, Clock, BookOpen, Sparkles } from 'lucide-react';
import { HubLayout } from '@/components/hub/HubLayout';
import { ExamTabs } from '@/components/hub/ExamTabs';
import { ClassTabs } from '@/components/hub/ClassTabs';
import { HubSearch } from '@/components/hub/HubSearch';
import { SubjectFilter } from '@/components/hub/SubjectFilter';
import { CategoryGrid } from '@/components/hub/CategoryGrid';
import { ResourceCard } from '@/components/hub/ResourceCard';
import { useResources, useBookmarks } from '@/hooks/useResources';
import { useAuth } from '@/contexts/AuthContext';
import { EXAM_META, type Exam, type ClassLevel } from '@/types/hub';

// ─── URL param parsing ────────────────────────────────────────────────────────
function parseParams(exam?: string, cls?: string): { exam: Exam; cls: ClassLevel } {
  const validExam = (s?: string): Exam =>
    s === 'neet' ? 'neet' : s === 'cuet' ? 'cuet' : 'jee';
  const parseClass = (s?: string): ClassLevel => {
    if (s === 'class-12') return '12';
    if (s === 'droppers') return 'dropper';
    return '11';
  };
  return { exam: validExam(exam), cls: parseClass(cls) };
}

// ─── Hero section ─────────────────────────────────────────────────────────────
const HubHero: React.FC<{ exam: Exam }> = ({ exam }) => {
  const meta = EXAM_META[exam];
  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-6"
      style={{
        background: `linear-gradient(135deg, ${meta.bg} 0%, rgba(6,8,13,0) 60%)`,
        border: `1px solid ${meta.border}`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: meta.color }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
          >
            {meta.emoji} {meta.label} Preparation Hub
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">
          SETU — Your Exam<br className="hidden sm:block" /> Preparation Hub
        </h1>
        <p className="text-sm sm:text-base mb-6 max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Notes, PYQs, Tests, Revision Resources and AI Doubt Solving for {meta.label} Aspirants.
        </p>
        <HubSearch activeExam={exam} />
      </div>
    </div>
  );
};

// ─── Stats strip ──────────────────────────────────────────────────────────────
const StatsStrip: React.FC<{ exam: Exam; count: number }> = ({ exam, count }) => {
  const meta = EXAM_META[exam];
  const stats = [
    { icon: BookOpen, label: `${count} Resources`, sub: 'Notes, PYQs, Tests' },
    { icon: TrendingUp, label: '10K+ Students', sub: 'Using SETU daily' },
    { icon: Clock, label: 'Updated May 2025', sub: 'Fresh content' },
    { icon: Sparkles, label: 'AI Mentor', sub: 'Instant doubts' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
              <Icon className="w-4 h-4" style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{s.label}</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ExamHubPage: React.FC = () => {
  const { exam: examParam, class: classParam } = useParams<{ exam: string; class: string }>();
  const navigate = useNavigate();
  const { exam, cls } = parseParams(examParam, classParam);
  const { user } = useAuth();

  const [activeSubject, setActiveSubject] = useState('');
  const [search, setSearch] = useState('');

  const { resources, loading } = useResources({
    exam,
    class: cls,
    subject: activeSubject || undefined,
    search: search || undefined,
  });

  const { bookmarks, toggle: toggleBookmark } = useBookmarks(user?.id ?? null);

  // Count per type for category tiles
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    resources.forEach(r => { c[r.resource_type] = (c[r.resource_type] ?? 0) + 1; });
    return c as any;
  }, [resources]);

  // Latest 6 resources for quick access strip
  const latestResources = resources.slice(0, 6);

  const handleView = (r: any) => {
    if (r.content_url) window.open(r.content_url, '_blank');
  };

  return (
    <HubLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Exam + Class nav */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <ExamTabs activeExam={exam} activeClass={cls} />
          <div className="sm:ml-4">
            <ClassTabs activeExam={exam} activeClass={cls} />
          </div>
        </div>

        {/* Hero */}
        <HubHero exam={exam} />

        {/* Stats */}
        <StatsStrip exam={exam} count={resources.length} />

        {/* Subject filters */}
        <div className="mb-6">
          <SubjectFilter activeExam={exam} activeSubject={activeSubject} onChange={setActiveSubject} />
        </div>

        {/* Category grid */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-white mb-4">Browse by Category</h2>
          <CategoryGrid activeExam={exam} activeClass={cls} counts={typeCounts} />
        </div>

        {/* Latest resources quick strip */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">
              {activeSubject
                ? `${EXAM_META[exam].subjects.find(s => s.key === activeSubject)?.label ?? activeSubject} Resources`
                : 'Latest Resources'}
            </h2>
            {resources.length > 6 && (
              <button
                onClick={() => navigate(`/${exam}/${classParam}/notes`)}
                className="text-xs font-semibold transition-colors"
                style={{ color: EXAM_META[exam].color }}
              >View All →</button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: EXAM_META[exam].color }} />
            </div>
          ) : latestResources.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <span className="text-4xl mb-3">📭</span>
              <p className="text-sm font-medium text-white mb-1">No resources yet</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Resources will appear here once uploaded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestResources.map((r, i) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  isBookmarked={bookmarks.has(r.id)}
                  onBookmark={user ? toggleBookmark : undefined}
                  onView={handleView}
                  delay={i * 0.06}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </HubLayout>
  );
};

export default ExamHubPage;
