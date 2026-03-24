import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Atom,
  Calculator,
  FlaskConical,
  GraduationCap,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen,
  Dna,
  BookOpenCheck,
  Globe,
  Brain,
  Microscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import {
  physicsChapters,
  chemistryChapters,
  mathsChapters,
  getChapterById
} from '@/data/syllabus';
import {
  getPhysicsChapterIdsByClass,
  getChemistryChapterIdsByClass,
  getMathsChapterIdsByClass,
  type ClassLevel
} from '@/data/syllabusClass';
import {
  neetBiologyChapters,
  neetChemistryChapters,
  neetPhysicsChapters,
} from '@/data/neetSyllabus';
import {
  CUET_SUBJECTS,
  getCuetChaptersBySubject,
  getCuetSubjectsByCategory,
  type CuetSubjectCategory,
} from '@/data/cuetSyllabus';
import { getSchoolSubjects, getSchoolChapters } from '@/data/schoolSyllabus';

type SubjectKey = 'physics' | 'chemistry' | 'maths' | 'biology';

const jeeSubjectConfig = {
  physics: { icon: Atom, label: 'Physics', gradient: 'from-blue-500 to-cyan-500', bgGlow: 'bg-blue-500/10', dotColor: 'bg-blue-500', emoji: '⚛️' },
  chemistry: { icon: FlaskConical, label: 'Chemistry', gradient: 'from-emerald-500 to-green-500', bgGlow: 'bg-emerald-500/10', dotColor: 'bg-emerald-500', emoji: '🧪' },
  maths: { icon: Calculator, label: 'Mathematics', gradient: 'from-violet-500 to-purple-500', bgGlow: 'bg-violet-500/10', dotColor: 'bg-violet-500', emoji: '📐' },
};

const neetSubjectConfig = {
  biology: { icon: Dna, label: 'Biology', gradient: 'from-green-500 to-emerald-600', bgGlow: 'bg-green-500/10', dotColor: 'bg-green-500', emoji: '🧬' },
  chemistry: { icon: FlaskConical, label: 'Chemistry', gradient: 'from-amber-500 to-orange-500', bgGlow: 'bg-amber-500/10', dotColor: 'bg-amber-500', emoji: '🧪' },
  physics: { icon: Atom, label: 'Physics', gradient: 'from-blue-500 to-cyan-500', bgGlow: 'bg-blue-500/10', dotColor: 'bg-blue-500', emoji: '⚛️' },
};

const schoolSubjectIconMap: Record<string, React.ElementType> = {
  mathematics: Calculator,
  science: Microscope,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
};

const cuetCategoryConfig: Record<CuetSubjectCategory, { label: string; icon: React.ElementType; gradient: string; description: string }> = {
  language: { label: 'Language Tests', icon: BookOpenCheck, gradient: 'from-sky-500 to-blue-500', description: 'English, Hindi & more' },
  domain: { label: 'Domain Subjects', icon: GraduationCap, gradient: 'from-violet-500 to-purple-600', description: 'NCERT-based subjects' },
  general: { label: 'General Test', icon: Brain, gradient: 'from-amber-500 to-orange-500', description: 'Reasoning, GK & Aptitude' },
};

const cuetSubjectIconMap: Record<string, { icon: React.ElementType; gradient: string; dotColor: string }> = {
  english: { icon: BookOpenCheck, gradient: 'from-sky-500 to-blue-500', dotColor: 'bg-sky-500' },
  hindi: { icon: BookOpenCheck, gradient: 'from-orange-400 to-red-500', dotColor: 'bg-orange-500' },
  general_test: { icon: Brain, gradient: 'from-amber-500 to-orange-500', dotColor: 'bg-amber-500' },
  economics: { icon: TrendingUp, gradient: 'from-emerald-500 to-green-500', dotColor: 'bg-emerald-500' },
  accountancy: { icon: Calculator, gradient: 'from-blue-500 to-cyan-500', dotColor: 'bg-blue-500' },
  business_studies: { icon: Globe, gradient: 'from-purple-500 to-indigo-500', dotColor: 'bg-purple-500' },
  political_science: { icon: GraduationCap, gradient: 'from-rose-500 to-pink-500', dotColor: 'bg-rose-500' },
  history: { icon: BookOpen, gradient: 'from-amber-600 to-yellow-500', dotColor: 'bg-amber-600' },
  geography: { icon: Globe, gradient: 'from-teal-500 to-cyan-500', dotColor: 'bg-teal-500' },
  psychology: { icon: Brain, gradient: 'from-violet-500 to-purple-500', dotColor: 'bg-violet-500' },
  sociology: { icon: GraduationCap, gradient: 'from-pink-500 to-rose-500', dotColor: 'bg-pink-500' },
  physics: { icon: Atom, gradient: 'from-blue-500 to-cyan-500', dotColor: 'bg-blue-500' },
  chemistry: { icon: FlaskConical, gradient: 'from-emerald-500 to-green-500', dotColor: 'bg-emerald-500' },
  mathematics: { icon: Calculator, gradient: 'from-violet-500 to-purple-500', dotColor: 'bg-violet-500' },
  biology: { icon: Dna, gradient: 'from-green-500 to-emerald-600', dotColor: 'bg-green-500' },
};

const PreparationPage: React.FC = () => {
  const navigate = useNavigate();
  const { isNeet, isCuet, config: examConfig } = useExamMode();
  const { isFoundation, studentClass, classLabel } = useClassContext();
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('11');
  const [cuetCategory, setCuetCategory] = useState<CuetSubjectCategory>('domain');

  const getJeeChapters = (subject: 'physics' | 'chemistry' | 'maths', cls: ClassLevel) => {
    const getByClass = { physics: getPhysicsChapterIdsByClass, chemistry: getChemistryChapterIdsByClass, maths: getMathsChapterIdsByClass }[subject];
    return getByClass(cls).map(id => getChapterById(id)).filter(Boolean);
  };

  const getNeetChapters = (subject: 'biology' | 'chemistry' | 'physics') => {
    return { biology: neetBiologyChapters, chemistry: neetChemistryChapters, physics: neetPhysicsChapters }[subject];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SubjectSection = ({ subject, chapters, config }: { subject: string; chapters: any[]; config: Record<string, unknown> }) => {
    const Icon = config.icon as React.ElementType;
    return (
      <div className="relative bg-card border border-border rounded-2xl overflow-hidden group">
        <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500", config.bgGlow || 'bg-primary/10')} />
        <div className="relative p-5 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md", config.gradient)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{config.label}</h3>
              <p className="text-xs text-muted-foreground">{chapters.length} chapters</p>
            </div>
            <span className="ml-auto text-xl opacity-60">{config.emoji || ''}</span>
          </div>
        </div>
        <div className="p-3 space-y-1.5 max-h-[400px] overflow-y-auto">
          {chapters.map((chapter: { id: string; name: string; weightage?: string }) => (
            <button
              key={chapter?.id}
              onClick={() => navigate(`/chapter/${chapter?.id}`)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all group/item"
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                <span className="text-sm font-medium text-foreground text-left">{chapter?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {chapter?.weightage && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5",
                      chapter?.weightage === 'High' && "border-red-200 text-red-600 bg-red-50",
                      chapter?.weightage === 'Medium' && "border-amber-200 text-amber-600 bg-amber-50",
                      chapter?.weightage === 'Low' && "border-gray-200 text-gray-500 bg-gray-50"
                    )}
                  >
                    {isFoundation ? (chapter?.weightage === 'High' ? 'Important' : chapter?.weightage) : chapter?.weightage}
                  </Badge>
                )}
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ========== FOUNDATION MODE ==========
  if (isFoundation) {
    const subjects = getSchoolSubjects(studentClass);
    return (
      <MainLayout title="Learn">
        <div className="space-y-8">
          {/* Hero Header - Foundation */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--setu-navy))] via-[hsl(var(--setu-navy-light))] to-[hsl(var(--setu-navy-dark))] p-8 sm:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  {classLabel} Topics
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                  📚 School Curriculum
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{classLabel} Learning</h1>
              <p className="text-white/60 text-base max-w-lg">
                Your complete {classLabel} syllabus organized by subject. Pick a chapter, learn with AI notes, and master every concept.
              </p>
            </div>
          </div>

          {/* School Subjects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {subjects.map((subj) => {
              const chapters = getSchoolChapters(studentClass, subj.key);
              const Icon = schoolSubjectIconMap[subj.key] || BookOpen;
              return (
                <SubjectSection
                  key={subj.key}
                  subject={subj.key}
                  chapters={chapters}
                  config={{
                    icon: Icon,
                    label: subj.label,
                    gradient: subj.gradient,
                    dotColor: subj.dotColor,
                    bgGlow: `${subj.dotColor}/10`,
                    emoji: subj.emoji,
                  }}
                />
              );
            })}
          </div>

          {/* Quick Access - Foundation friendly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="relative overflow-hidden bg-card border border-accent/20 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              onClick={() => navigate('/revision')}
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                    Quick Revision
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    One-page notes, formula sheets, and quick quizzes for {classLabel}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-accent/10 text-accent border-0 text-xs">Smart Notes</Badge>
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 15 min
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              onClick={() => navigate('/practice')}
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                    Practice Questions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Practice questions from {classLabel} syllabus to strengthen concepts
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">School Level</Badge>
                    <Badge variant="outline" className="text-xs">Topic-wise</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ========== COMPETITIVE MODE (original) ==========
  const examLabel = isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE';
  const heroDescription = isCuet
    ? 'Complete CUET syllabus organized by category. NCERT-aligned, speed-focused preparation.'
    : isNeet
      ? 'Complete NEET syllabus with Biology, Chemistry & Physics. NCERT-aligned, diagram-focused.'
      : 'Complete syllabus organized class-wise. Pick a topic, learn with AI notes, and track your progress.';

  return (
    <MainLayout title="Preparation">
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--setu-navy))] via-[hsl(var(--setu-navy-light))] to-[hsl(var(--setu-navy-dark))] p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Full Syllabus
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                {examConfig.emoji} {examConfig.label}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{examLabel} Preparation</h1>
            <p className="text-white/60 text-base max-w-lg">{heroDescription}</p>
          </div>
        </div>

        {/* Content */}
        {isCuet ? (
          <Tabs defaultValue="domain" onValueChange={(v) => setCuetCategory(v as CuetSubjectCategory)}>
            <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted/50">
              {(['domain', 'language', 'general'] as CuetSubjectCategory[]).map(cat => {
                const cfg = cuetCategoryConfig[cat];
                const CatIcon = cfg.icon;
                return (
                  <TabsTrigger key={cat} value={cat} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
                    <CatIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {(['domain', 'language', 'general'] as CuetSubjectCategory[]).map(cat => (
              <TabsContent key={cat} value={cat} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {getCuetSubjectsByCategory(cat).map(subj => {
                    const chapters = getCuetChaptersBySubject(subj.key);
                    const iconCfg = cuetSubjectIconMap[subj.key] || { icon: BookOpen, gradient: 'from-gray-500 to-gray-600', dotColor: 'bg-gray-500' };
                    if (chapters.length === 0) return null;
                    return (
                      <SubjectSection
                        key={subj.key}
                        subject={subj.key}
                        chapters={chapters}
                        config={{ icon: iconCfg.icon, label: subj.label, gradient: iconCfg.gradient, dotColor: iconCfg.dotColor, bgGlow: `${iconCfg.dotColor}/10` }}
                      />
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : isNeet ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SubjectSection subject="biology" chapters={getNeetChapters('biology')} config={neetSubjectConfig.biology} />
            <SubjectSection subject="chemistry" chapters={getNeetChapters('chemistry')} config={neetSubjectConfig.chemistry} />
            <SubjectSection subject="physics" chapters={getNeetChapters('physics')} config={neetSubjectConfig.physics} />
          </div>
        ) : (
          <Tabs defaultValue="11" onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
              <TabsTrigger value="11" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <GraduationCap className="w-4 h-4" /> Class 11
              </TabsTrigger>
              <TabsTrigger value="12" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <GraduationCap className="w-4 h-4" /> Class 12
              </TabsTrigger>
            </TabsList>
            {['11', '12'].map((cls) => (
              <TabsContent key={cls} value={cls} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <SubjectSection subject="physics" chapters={getJeeChapters('physics', cls as ClassLevel)} config={jeeSubjectConfig.physics} />
                  <SubjectSection subject="chemistry" chapters={getJeeChapters('chemistry', cls as ClassLevel)} config={jeeSubjectConfig.chemistry} />
                  <SubjectSection subject="maths" chapters={getJeeChapters('maths', cls as ClassLevel)} config={jeeSubjectConfig.maths} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            onClick={() => navigate('/practice?mode=pyq')}
          >
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {isCuet ? 'CUET Previous Year Questions' : isNeet ? 'NEET Previous Year Questions' : 'JEE Previous Year Questions'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {isCuet ? 'CUET PYQs organized by subject and NCERT alignment' : isNeet ? 'NEET PYQs organized by chapter and NCERT alignment' : '2015–2024 PYQs organized by chapter and difficulty'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">2000+ Questions</Badge>
                  <Badge variant="outline" className="text-xs">Topic-wise</Badge>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden bg-card border border-accent/20 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            onClick={() => navigate('/tutorial-sessions')}
          >
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {isCuet ? 'CUET Study Sessions' : isNeet ? 'NEET Tutorial Sessions' : 'JEE Tutorial Sessions'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {isCuet ? 'NCERT-concise notes designed for CUET speed preparation' : isNeet ? 'NCERT-focused notes curated by top NEET educators' : 'Premium Kota-style notes curated by toppers and mentors'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-accent/10 text-accent border-0 text-xs">Premium Notes</Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Coming Soon
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PreparationPage;
