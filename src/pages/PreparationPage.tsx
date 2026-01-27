import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Atom, 
  Calculator, 
  FlaskConical, 
  GraduationCap,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock
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
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    chapters: physicsChapters,
    getByClass: getPhysicsChapterIdsByClass,
  },
  chemistry: {
    icon: FlaskConical,
    label: 'Chemistry',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    chapters: chemistryChapters,
    getByClass: getChemistryChapterIdsByClass,
  },
  maths: {
    icon: Calculator,
    label: 'Mathematics',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
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
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bgColor)}>
              <Icon className={cn("w-5 h-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{config.label}</CardTitle>
              <p className="text-sm text-text-secondary">{chapters.length} chapters in Class {selectedClass}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {chapters.map((chapter) => (
            <button
              key={chapter?.id}
              onClick={() => navigate(`/chapter/${chapter?.id}`)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                "hover:shadow-sm hover:border-primary/30 bg-background",
                config.borderColor
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", config.bgColor.replace('bg-', 'bg-').replace('-50', '-500'))} />
                <span className="text-sm font-medium text-foreground">{chapter?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    chapter?.weightage === 'High' && "border-red-200 text-red-600 bg-red-50",
                    chapter?.weightage === 'Medium' && "border-amber-200 text-amber-600 bg-amber-50",
                    chapter?.weightage === 'Low' && "border-gray-200 text-gray-600 bg-gray-50"
                  )}
                >
                  {chapter?.weightage}
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout title="Preparation">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground mb-1">
            JEE Preparation
          </h1>
          <p className="text-text-secondary">
            Complete syllabus organized class-wise. Pick a topic, learn with AI notes.
          </p>
        </div>

        {/* Class Tabs */}
        <Tabs defaultValue="11" onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
            <TabsTrigger value="11" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GraduationCap className="w-4 h-4 mr-2" />
              Class 11
            </TabsTrigger>
            <TabsTrigger value="12" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GraduationCap className="w-4 h-4 mr-2" />
              Class 12
            </TabsTrigger>
          </TabsList>

          <TabsContent value="11" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SubjectSection subject="physics" />
              <SubjectSection subject="chemistry" />
              <SubjectSection subject="maths" />
            </div>
          </TabsContent>

          <TabsContent value="12" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SubjectSection subject="physics" />
              <SubjectSection subject="chemistry" />
              <SubjectSection subject="maths" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* PYQ Section */}
          <Card 
            className="card-elevated cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/20"
            onClick={() => navigate('/practice?mode=pyq')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">JEE Previous Year Questions</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    2015-2024 PYQs organized by chapter and difficulty
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0">2000+ Questions</Badge>
                    <Badge variant="outline">Topic-wise</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutorial Sessions */}
          <Card 
            className="card-elevated cursor-pointer hover:shadow-lg transition-all border-2 border-accent/30 hover:border-accent/50"
            onClick={() => navigate('/tutorial-sessions')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">JEE Tutorial Sessions</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    Premium Kota-style notes curated by toppers and mentors
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-accent/10 text-accent border-0">Premium Notes</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PreparationPage;
