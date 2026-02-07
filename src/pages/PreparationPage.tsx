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
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

type SubjectKey = 'physics' | 'chemistry' | 'maths';

const subjectConfig = {
  physics: {
    icon: Atom,
    label: 'Physics',
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/10',
    dotColor: 'bg-blue-500',
    emoji: '⚛️',
    chapters: physicsChapters,
    getByClass: getPhysicsChapterIdsByClass,
  },
  chemistry: {
    icon: FlaskConical,
    label: 'Chemistry',
    gradient: 'from-emerald-500 to-green-500',
    bgGlow: 'bg-emerald-500/10',
    dotColor: 'bg-emerald-500',
    emoji: '🧪',
    chapters: chemistryChapters,
    getByClass: getChemistryChapterIdsByClass,
  },
  maths: {
    icon: Calculator,
    label: 'Mathematics',
    gradient: 'from-violet-500 to-purple-500',
    bgGlow: 'bg-violet-500/10',
    dotColor: 'bg-violet-500',
    emoji: '📐',
    chapters: mathsChapters,
    getByClass: getMathsChapterIdsByClass,
  },
};

const PreparationPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('11');

  const getChaptersForSubject = (subject: SubjectKey, classLevel: ClassLevel) => {
    const config = subjectConfig[subject];
    const chapterIds = config.getByClass(classLevel);
    return chapterIds.map(id => getChapterById(id)).filter(Boolean);
  };

  const SubjectSection = ({ subject }: { subject: SubjectKey }) => {
    const config = subjectConfig[subject];
    const Icon = config.icon;
    const chapters = getChaptersForSubject(subject, selectedClass);

    return (
      <div className="relative bg-card border border-border rounded-2xl overflow-hidden group">
        {/* Hover glow */}
        <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500", config.bgGlow)} />

        <div className="relative p-5 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md", config.gradient)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{config.label}</h3>
              <p className="text-xs text-muted-foreground">{chapters.length} chapters in Class {selectedClass}</p>
            </div>
            <span className="ml-auto text-xl opacity-60">{config.emoji}</span>
          </div>
        </div>

        <div className="p-3 space-y-1.5 max-h-[400px] overflow-y-auto">
          {chapters.map((chapter) => (
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
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5",
                    chapter?.weightage === 'High' && "border-red-200 text-red-600 bg-red-50",
                    chapter?.weightage === 'Medium' && "border-amber-200 text-amber-600 bg-amber-50",
                    chapter?.weightage === 'Low' && "border-gray-200 text-gray-500 bg-gray-50"
                  )}
                >
                  {chapter?.weightage}
                </Badge>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout title="Preparation">
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Full Syllabus
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              JEE Preparation
            </h1>
            <p className="text-white/60 text-base max-w-lg">
              Complete syllabus organized class-wise. Pick a topic, learn with AI notes, and track your progress.
            </p>
          </div>
        </div>

        {/* Class Tabs */}
        <Tabs defaultValue="11" onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
            <TabsTrigger value="11" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <GraduationCap className="w-4 h-4" />
              Class 11
            </TabsTrigger>
            <TabsTrigger value="12" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <GraduationCap className="w-4 h-4" />
              Class 12
            </TabsTrigger>
          </TabsList>

          {['11', '12'].map((cls) => (
            <TabsContent key={cls} value={cls} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <SubjectSection subject="physics" />
                <SubjectSection subject="chemistry" />
                <SubjectSection subject="maths" />
              </div>
            </TabsContent>
          ))}
        </Tabs>

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
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">JEE Previous Year Questions</h3>
                <p className="text-sm text-muted-foreground mb-3">2015–2024 PYQs organized by chapter and difficulty</p>
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
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">JEE Tutorial Sessions</h3>
                <p className="text-sm text-muted-foreground mb-3">Premium Kota-style notes curated by toppers and mentors</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-accent/10 text-accent border-0 text-xs">Premium Notes</Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Coming Soon
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
