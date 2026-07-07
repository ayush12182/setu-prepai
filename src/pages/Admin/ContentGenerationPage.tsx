import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle, XCircle, RefreshCw,
  BookOpen, AlertTriangle, Clock, Eye,
  Layers, Zap, BarChart2, Globe, Archive,
  ChevronDown, ChevronUp, Filter, Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { allChapters } from '@/data/syllabus';

// ─── Types ────────────────────────────────────────────────────
interface ContentRecord {
  id: string;
  chapter_id: string;
  chapter_name: string;
  subject: string;
  exam_type: string;
  language: string;
  version: number;
  version_label: string;
  status: 'draft' | 'published' | 'archived';
  word_count: number | null;
  generation_model: string | null;
  source: string | null;
  published_at: string | null;
  updated_at: string;
  created_at: string;
}

interface ChapterWithContent {
  syllabusId: string;
  name: string;
  subject: string;
  records: ContentRecord[];
  latestPublished: ContentRecord | null;
  latestDraft: ContentRecord | null;
  hasContent: boolean;
}

const STATUS_STYLES = {
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  draft:     'bg-amber-500/10  text-amber-400  border-amber-500/30',
  archived:  'bg-zinc-500/10   text-zinc-400   border-zinc-500/30',
  missing:   'bg-red-500/10    text-red-400    border-red-500/30',
};

const SUBJECT_COLORS: Record<string, string> = {
  physics:   'text-sky-400 bg-sky-500/10',
  chemistry: 'text-emerald-400 bg-emerald-500/10',
  maths:     'text-violet-400 bg-violet-500/10',
  biology:   'text-green-400 bg-green-500/10',
};

// ─── Chapter Row Component ────────────────────────────────────
const ChapterRow: React.FC<{
  item: ChapterWithContent;
  onGenerate: (chapterId: string, chapterName: string, subject: string) => void;
  onPublish: (recordId: string) => void;
  onArchive: (recordId: string) => void;
  generating: string | null;
  publishing: string | null;
}> = ({ item, onGenerate, onPublish, onArchive, generating, publishing }) => {
  const [expanded, setExpanded] = useState(false);
  const published = item.latestPublished;
  const draft = item.latestDraft;

  const statusLabel = published ? 'published' : draft ? 'draft' : 'missing';
  const displayRecord = published || draft;

  return (
    <motion.div layout className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Subject badge */}
        <span className={cn('text-xs font-bold px-2 py-1 rounded-lg capitalize', SUBJECT_COLORS[item.subject] || 'text-muted-foreground bg-secondary')}>
          {item.subject}
        </span>

        {/* Chapter name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
          {displayRecord && (
            <p className="text-xs text-muted-foreground">
              v{displayRecord.version_label} · {displayRecord.word_count ? `${displayRecord.word_count.toLocaleString()} words` : 'words unknown'} · {displayRecord.generation_model || 'AI'}
            </p>
          )}
        </div>

        {/* Status badge */}
        <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border capitalize', STATUS_STYLES[statusLabel as keyof typeof STATUS_STYLES])}>
          {statusLabel === 'missing' ? '⚠ Not Generated' : statusLabel === 'published' ? '✓ Published' : '◷ Draft'}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Generate / Regenerate */}
          <Button
            size="sm"
            variant={item.hasContent ? 'outline' : 'default'}
            disabled={generating === item.syllabusId}
            onClick={() => onGenerate(item.syllabusId, item.name, item.subject)}
            className={cn('h-7 text-xs gap-1', !item.hasContent && 'bg-primary text-primary-foreground')}
          >
            {generating === item.syllabusId ? (
              <><RefreshCw className="w-3 h-3 animate-spin" /> Generating...</>
            ) : item.hasContent ? (
              <><RefreshCw className="w-3 h-3" /> Regenerate</>
            ) : (
              <><Play className="w-3 h-3" /> Generate</>
            )}
          </Button>

          {/* Publish draft */}
          {draft && !published && (
            <Button
              size="sm"
              disabled={publishing === draft.id}
              onClick={() => onPublish(draft.id)}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
            >
              {publishing === draft.id ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> Publishing...</>
              ) : (
                <><CheckCircle className="w-3 h-3" /> Publish</>
              )}
            </Button>
          )}

          {/* Archive published */}
          {published && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onArchive(published.id)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <Archive className="w-3 h-3" /> Archive
            </Button>
          )}

          <button onClick={() => setExpanded(e => !e)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Expanded version history */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Version History</p>
              {item.records.length === 0 ? (
                <p className="text-xs text-muted-foreground">No versions yet.</p>
              ) : (
                item.records.map(record => (
                  <div key={record.id} className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-xl border border-border">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-bold capitalize', STATUS_STYLES[record.status])}>
                      {record.status}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">v{record.version_label}</span>
                    <span className="text-xs text-muted-foreground flex-1">
                      {record.source} · {record.word_count ? `${record.word_count.toLocaleString()} words` : ''} · {new Date(record.updated_at).toLocaleDateString()}
                    </span>
                    {record.status === 'draft' && (
                      <Button size="sm" onClick={() => onPublish(record.id)}
                        className="h-6 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                        Publish this version
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Stats Card ───────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────
const ContentGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [chapters, setChapters] = useState<ChapterWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin guard
  useEffect(() => {
    if (profile && profile.user_type !== 'admin' && profile.user_type !== 'teacher') {
      navigate('/student-hub');
    }
  }, [profile, navigate]);

  // Load content records from DB and merge with syllabus
  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const { data: records, error } = await supabase
        .from('chapter_content')
        .select('id, chapter_id, chapter_name, subject, exam_type, language, version, version_label, status, word_count, generation_model, source, published_at, updated_at, created_at')
        .order('version', { ascending: false });

      if (error) throw error;

      // Group records by chapter_id
      const recordsByChapter: Record<string, ContentRecord[]> = {};
      for (const r of (records || [])) {
        if (!recordsByChapter[r.chapter_id]) recordsByChapter[r.chapter_id] = [];
        recordsByChapter[r.chapter_id].push(r as ContentRecord);
      }

      // Merge with all syllabus chapters
      const merged: ChapterWithContent[] = allChapters.map(ch => {
        // chapter_id in DB is slug-format of chapter name
        const slug = ch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const recs = recordsByChapter[ch.id] || recordsByChapter[slug] || [];
        const latestPublished = recs.find(r => r.status === 'published') || null;
        const latestDraft = recs.find(r => r.status === 'draft') || null;

        return {
          syllabusId: ch.id,
          name: ch.name,
          subject: ch.subject,
          records: recs,
          latestPublished,
          latestDraft,
          hasContent: recs.length > 0,
        };
      });

      setChapters(merged);
    } catch (err: any) {
      console.error('[ContentGen] Load error:', err);
      toast.error('Failed to load content status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  // Generate content for a chapter (admin-triggered)
  const handleGenerate = async (syllabusId: string, chapterName: string, subject: string) => {
    setGenerating(syllabusId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const token = session?.access_token || anonKey;

      // Find chapter topics from syllabus
      const syllabusChapter = allChapters.find(c => c.id === syllabusId);
      const topics = syllabusChapter?.topics || [];

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': anonKey,
          'x-admin-key': import.meta.env.VITE_ADMIN_SECRET || '',
        },
        body: JSON.stringify({
          chapterId: syllabusId,
          chapterName,
          subject,
          topics,
          examType: 'JEE',
          language: 'english',
          forceRegenerate: false,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || `HTTP ${response.status}`);
      }

      toast.success(`✅ ${chapterName} generated as Draft v${json.meta?.version || '?'}`);
      await loadContent();
    } catch (err: any) {
      console.error('[ContentGen] Generate error:', err);
      toast.error(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  // Publish a draft
  const handlePublish = async (recordId: string) => {
    setPublishing(recordId);
    try {
      // First archive any currently published version for this chapter
      const record = chapters.flatMap(c => c.records).find(r => r.id === recordId);
      if (!record) throw new Error('Record not found');

      // Archive current published versions for same chapter+exam+language
      await supabase
        .from('chapter_content')
        .update({ status: 'archived' })
        .eq('chapter_id', record.chapter_id)
        .eq('exam_type', record.exam_type)
        .eq('language', record.language)
        .eq('status', 'published');

      // Publish this version
      const { error } = await supabase
        .from('chapter_content')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', recordId);

      if (error) throw error;

      toast.success(`✅ ${record.chapter_name} v${record.version_label} is now Published`);
      await loadContent();
    } catch (err: any) {
      console.error('[ContentGen] Publish error:', err);
      toast.error(`Publish failed: ${err.message}`);
    } finally {
      setPublishing(null);
    }
  };

  // Archive a published version
  const handleArchive = async (recordId: string) => {
    try {
      const record = chapters.flatMap(c => c.records).find(r => r.id === recordId);
      if (!record) return;

      const { error } = await supabase
        .from('chapter_content')
        .update({ status: 'archived' })
        .eq('id', recordId);

      if (error) throw error;
      toast.success(`Archived ${record.chapter_name} v${record.version_label}`);
      await loadContent();
    } catch (err: any) {
      toast.error(`Archive failed: ${err.message}`);
    }
  };

  // Bulk generate all missing chapters
  const handleBulkGenerate = async () => {
    const missing = filteredChapters.filter(c => !c.hasContent);
    if (missing.length === 0) {
      toast.info('No missing chapters to generate');
      return;
    }
    toast.info(`Starting bulk generation for ${missing.length} chapters...`);
    for (const ch of missing.slice(0, 5)) { // limit to 5 at a time
      await handleGenerate(ch.syllabusId, ch.name, ch.subject);
    }
  };

  // Filter + search
  const filteredChapters = chapters.filter(ch => {
    const matchSubject = filterSubject === 'all' || ch.subject === filterSubject;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && !!ch.latestPublished) ||
      (filterStatus === 'draft' && !!ch.latestDraft && !ch.latestPublished) ||
      (filterStatus === 'missing' && !ch.hasContent);
    const matchSearch = !searchQuery || ch.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchStatus && matchSearch;
  });

  // Stats
  const totalPublished = chapters.filter(c => !!c.latestPublished).length;
  const totalDraft = chapters.filter(c => !!c.latestDraft && !c.latestPublished).length;
  const totalMissing = chapters.filter(c => !c.hasContent).length;
  const totalChapters = chapters.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Content Repository</h1>
              <p className="text-xs text-muted-foreground">AI generates once · Students read from DB · Zero latency</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadContent} className="gap-2 h-8">
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
            <Button size="sm" onClick={handleBulkGenerate} className="gap-2 h-8 bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3" /> Bulk Generate Missing
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Chapters" value={totalChapters} icon={<BookOpen className="w-5 h-5" />} color="bg-primary/10 text-primary" />
          <StatCard label="Published" value={totalPublished} icon={<CheckCircle className="w-5 h-5" />} color="bg-emerald-500/10 text-emerald-500" />
          <StatCard label="Drafts" value={totalDraft} icon={<Clock className="w-5 h-5" />} color="bg-amber-500/10 text-amber-500" />
          <StatCard label="Missing" value={totalMissing} icon={<AlertTriangle className="w-5 h-5" />} color="bg-red-500/10 text-red-500" />
        </div>

        {/* Progress bar */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Content Coverage</span>
            <span className="text-sm text-muted-foreground">
              {totalPublished}/{totalChapters} chapters published ({Math.round((totalPublished / totalChapters) * 100)}%)
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${(totalPublished / totalChapters) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Published</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Draft</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/60" /> Missing</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="bg-transparent text-sm text-foreground focus:outline-none"
            >
              <option value="all">All Subjects</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="maths">Mathematics</option>
              <option value="biology">Biology</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5">
            <BarChart2 className="w-3 h-3 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm text-foreground focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft (Unpublished)</option>
              <option value="missing">Missing</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] bg-card border border-border rounded-xl px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />

          <span className="text-xs text-muted-foreground ml-auto">
            {filteredChapters.length} chapters
          </span>
        </div>

        {/* Chapter list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-card border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No chapters match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChapters.map(item => (
              <ChapterRow
                key={item.syllabusId}
                item={item}
                onGenerate={handleGenerate}
                onPublish={handlePublish}
                onArchive={handleArchive}
                generating={generating}
                publishing={publishing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerationPage;
