import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Check, BookOpen, Sparkles, Target, AlertTriangle, Beaker, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getFormulasBySubject } from '@/data/cleanFormulas';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { renderFormula } from '@/lib/formulaRenderer';

type SubjectKey = 'physics' | 'chemistry' | 'maths';

const subjectLabels: Record<SubjectKey, string> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  maths: 'Maths',
};

const subjectIcons: Record<SubjectKey, string> = {
  physics: '⚛️',
  chemistry: '🧪',
  maths: '📊',
};

const subjectGradients: Record<SubjectKey, string> = {
  physics: 'from-blue-600 to-cyan-500',
  chemistry: 'from-emerald-600 to-green-500',
  maths: 'from-orange-500 to-amber-500',
};

const getChapters = (subject: SubjectKey): Chapter[] => {
  switch (subject) {
    case 'physics': return physicsChapters;
    case 'chemistry': return chemistryChapters;
    case 'maths': return mathsChapters;
  }
};

const RevisionTopicPage: React.FC = () => {
  const { subject, topic } = useParams<{ subject: string; topic: string }>();
  const navigate = useNavigate();
  const [copiedFormula, setCopiedFormula] = React.useState<string | null>(null);

  const subjectKey = subject as SubjectKey;
  const topicSlug = topic || '';

  const topicLabel = topicSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const chapters = useMemo(() => getChapters(subjectKey), [subjectKey]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(text);
    toast.success('Copied!');
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // ── FORMULAS ──
  const renderFormulas = () => {
    const formulaChapters = getFormulasBySubject(subjectKey);
    return (
      <div className="space-y-4">
        {formulaChapters.map((ch) => (
          <div key={ch.chapter} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className={cn("px-5 py-3 bg-gradient-to-r text-white font-semibold text-sm", subjectGradients[subjectKey])}>
              {ch.chapter} — {ch.formulas.length} formulas
            </div>
            <div className="p-4 space-y-3">
              {ch.formulas.map((f, i) => (
                <div key={i} className="bg-secondary/30 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-sm font-mono text-foreground font-medium flex-1">
                      {renderFormula(f.formula)}
                    </code>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyText(f.formula)}>
                      {copiedFormula === f.formula ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.explanation}</p>
                  <div className="bg-accent/10 rounded px-2.5 py-1.5">
                    <p className="text-xs text-accent font-medium">Exam tip: {f.examTip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── DERIVATIONS / KEY FORMULAS ──
  const renderDerivations = () => (
    <div className="space-y-4">
      {chapters.map((ch) => (
        <div key={ch.id} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className={cn("px-5 py-3 bg-gradient-to-r text-white font-semibold text-sm", subjectGradients[subjectKey])}>
            {ch.name}
          </div>
          <div className="p-4 space-y-2">
            {ch.keyFormulas.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-2.5">
                <span className="text-accent font-bold text-xs w-6">{i + 1}.</span>
                <code className="text-sm font-mono text-foreground">{renderFormula(f)}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ── PYQ PATTERNS ──
  const renderPYQPatterns = () => (
    <div className="space-y-4">
      {chapters.map((ch) => (
        <div key={ch.id} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className={cn("px-5 py-3 bg-gradient-to-r text-white font-semibold text-sm flex items-center justify-between", subjectGradients[subjectKey])}>
            <span>{ch.name}</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{ch.pyqData.total} PYQs</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                <div className="font-bold text-red-600 text-lg">{ch.pyqData.postCovid}</div>
                <div className="text-muted-foreground">Post-2020</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                <div className="font-bold text-blue-600 text-lg">{ch.pyqData.preCovid}</div>
                <div className="text-muted-foreground">2010–2019</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="font-bold text-muted-foreground text-lg">{ch.pyqData.legacy}</div>
                <div className="text-muted-foreground">Legacy</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Trending Concepts:</p>
              <div className="flex flex-wrap gap-1.5">
                {ch.pyqData.trendingConcepts.map((c, i) => (
                  <span key={i} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── EXAM TIPS / NUMERICAL TIPS ──
  const renderTips = () => (
    <div className="space-y-4">
      {chapters.map((ch) => (
        <div key={ch.id} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className={cn("px-5 py-3 bg-gradient-to-r text-white font-semibold text-sm", subjectGradients[subjectKey])}>
            {ch.name}
          </div>
          <div className="p-4 space-y-2">
            {ch.examTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-accent/5 border border-accent/10 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ── TOPICS (for Maths-specific or Chemistry-specific) ──
  const renderTopics = () => {
    // Filter chapters relevant to the topic slug
    const topicMap: Record<string, string[]> = {
      'integration': ['math-9'],
      'limits': ['math-8'],
      'coordinate-geometry': ['math-5', 'math-6', 'math-7'],
      'vectors': ['math-10'],
      'reactions': ['chem-1', 'chem-2', 'chem-3', 'chem-4', 'chem-5', 'chem-6'],
      'named-reactions': ['chem-11', 'chem-12', 'chem-13', 'chem-14'],
      'periodic-table': ['chem-7', 'chem-8', 'chem-9', 'chem-10'],
      'organic-mechanisms': ['chem-11', 'chem-12', 'chem-13', 'chem-14'],
    };

    const relevantIds = topicMap[topicSlug];
    const filtered = relevantIds ? chapters.filter((c) => relevantIds.includes(c.id)) : chapters;

    return (
      <div className="space-y-4">
        {filtered.map((ch) => (
          <div key={ch.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className={cn("px-5 py-3 bg-gradient-to-r text-white font-semibold text-sm", subjectGradients[subjectKey])}>
              {ch.name}
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">{ch.weightage} Weightage</span>
            </div>
            <div className="p-4 space-y-3">
              {/* Topics */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Topics:</p>
                <div className="flex flex-wrap gap-1.5">
                  {ch.topics.map((t, i) => (
                    <span key={i} className="text-xs bg-secondary px-2.5 py-1 rounded-full font-medium text-foreground">{t}</span>
                  ))}
                </div>
              </div>
              {/* Key Formulas */}
              {ch.keyFormulas.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Formulas:</p>
                  <div className="space-y-1.5">
                    {ch.keyFormulas.map((f, i) => (
                      <code key={i} className="block text-xs font-mono text-foreground bg-secondary/40 rounded px-3 py-1.5">{renderFormula(f)}</code>
                    ))}
                  </div>
                </div>
              )}
              {/* Exam Tips */}
              {ch.examTips.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Exam Tips:</p>
                  {ch.examTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <Target className="w-3 h-3 text-accent shrink-0 mt-1" />
                      <p className="text-xs text-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* PYQ Info */}
              <div className="flex flex-wrap gap-2 text-xs">
                {ch.pyqData.trendingConcepts.map((c, i) => (
                  <span key={i} className="bg-accent/10 text-accent px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Decide what to render based on topic
  const renderBody = () => {
    switch (topicSlug) {
      case 'formulas':
        return renderFormulas();
      case 'derivations':
        return renderDerivations();
      case 'pyq-patterns':
        return renderPYQPatterns();
      case 'numerical-tips':
        return renderTips();
      // Chemistry & Maths specific topics
      case 'reactions':
      case 'named-reactions':
      case 'periodic-table':
      case 'organic-mechanisms':
      case 'integration':
      case 'limits':
      case 'coordinate-geometry':
      case 'vectors':
        return renderTopics();
      default:
        return renderTopics();
    }
  };

  const totalItems = useMemo(() => {
    if (topicSlug === 'formulas') {
      return getFormulasBySubject(subjectKey).reduce((sum, ch) => sum + ch.formulas.length, 0);
    }
    if (topicSlug === 'derivations') {
      return chapters.reduce((sum, ch) => sum + ch.keyFormulas.length, 0);
    }
    if (topicSlug === 'pyq-patterns') {
      return chapters.reduce((sum, ch) => sum + ch.pyqData.total, 0);
    }
    if (topicSlug === 'numerical-tips') {
      return chapters.reduce((sum, ch) => sum + ch.examTips.length, 0);
    }
    return chapters.length;
  }, [topicSlug, subjectKey, chapters]);

  return (
    <MainLayout title="Revision">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-r p-6 sm:p-8", subjectGradients[subjectKey])}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
          </div>
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => navigate('/revision')} className="text-white/80 hover:text-white hover:bg-white/10 mb-3 -ml-2">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Revision
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{subjectIcons[subjectKey]}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {subjectLabels[subjectKey]} — {topicLabel}
              </h1>
            </div>
            <p className="text-white/70 text-sm">
              {totalItems} items across all chapters • One tap, everything you need
            </p>
          </div>
        </div>

        {/* Content */}
        {renderBody()}

        {/* Bottom tip */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Jeetu Bhaiya says:</span>{' '}
            Beta, ek baar ye sab dekh lo aur fir directly PYQs lagao. Revision ka matlab hai — recall, not re-learn!
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default RevisionTopicPage;
