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
  Download,
  Sparkles,
  Star,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ClassLevel = '11' | '12';
type SubjectKey = 'physics' | 'chemistry' | 'maths';

// Premium notes structure - will be populated with actual content
const tutorialNotes = {
  physics: {
    '11': [
      { id: 'phy-11-1', title: 'Kinematics Complete Notes', status: 'coming-soon', pages: 45 },
      { id: 'phy-11-2', title: 'Laws of Motion Masterclass', status: 'coming-soon', pages: 38 },
      { id: 'phy-11-3', title: 'Work Energy Power Notes', status: 'coming-soon', pages: 42 },
      { id: 'phy-11-4', title: 'Rotational Motion Deep Dive', status: 'coming-soon', pages: 55 },
      { id: 'phy-11-5', title: 'Gravitation & SHM Bundle', status: 'coming-soon', pages: 48 },
      { id: 'phy-11-6', title: 'Thermodynamics Complete', status: 'coming-soon', pages: 40 },
    ],
    '12': [
      { id: 'phy-12-1', title: 'Electrostatics Mastery', status: 'coming-soon', pages: 52 },
      { id: 'phy-12-2', title: 'Current Electricity Notes', status: 'coming-soon', pages: 44 },
      { id: 'phy-12-3', title: 'Magnetism & EMI Complete', status: 'coming-soon', pages: 58 },
      { id: 'phy-12-4', title: 'Optics Full Coverage', status: 'coming-soon', pages: 50 },
      { id: 'phy-12-5', title: 'Modern Physics Bundle', status: 'coming-soon', pages: 46 },
    ],
  },
  chemistry: {
    '11': [
      { id: 'chem-11-1', title: 'Mole Concept & Stoichiometry', status: 'coming-soon', pages: 35 },
      { id: 'chem-11-2', title: 'Atomic Structure Notes', status: 'coming-soon', pages: 40 },
      { id: 'chem-11-3', title: 'Chemical Bonding Complete', status: 'coming-soon', pages: 55 },
      { id: 'chem-11-4', title: 'Thermodynamics & Equilibrium', status: 'coming-soon', pages: 48 },
      { id: 'chem-11-5', title: 'GOC Foundation', status: 'coming-soon', pages: 60 },
      { id: 'chem-11-6', title: 'Hydrocarbons Deep Dive', status: 'coming-soon', pages: 52 },
    ],
    '12': [
      { id: 'chem-12-1', title: 'Electrochemistry Complete', status: 'coming-soon', pages: 38 },
      { id: 'chem-12-2', title: 'Chemical Kinetics Notes', status: 'coming-soon', pages: 32 },
      { id: 'chem-12-3', title: 'p-Block Elements Mastery', status: 'coming-soon', pages: 65 },
      { id: 'chem-12-4', title: 'Coordination Chemistry', status: 'coming-soon', pages: 45 },
      { id: 'chem-12-5', title: 'Organic Reactions Bundle', status: 'coming-soon', pages: 70 },
    ],
  },
  maths: {
    '11': [
      { id: 'math-11-1', title: 'Quadratic Equations Complete', status: 'coming-soon', pages: 42 },
      { id: 'math-11-2', title: 'Complex Numbers Mastery', status: 'coming-soon', pages: 38 },
      { id: 'math-11-3', title: 'Sequences & Series Notes', status: 'coming-soon', pages: 45 },
      { id: 'math-11-4', title: 'P&C and Binomial Bundle', status: 'coming-soon', pages: 50 },
      { id: 'math-11-5', title: 'Straight Lines Complete', status: 'coming-soon', pages: 35 },
      { id: 'math-11-6', title: 'Trigonometry Full Coverage', status: 'coming-soon', pages: 55 },
    ],
    '12': [
      { id: 'math-12-1', title: 'Conic Sections Mastery', status: 'coming-soon', pages: 60 },
      { id: 'math-12-2', title: 'Limits & Continuity Notes', status: 'coming-soon', pages: 40 },
      { id: 'math-12-3', title: 'Differentiation Complete', status: 'coming-soon', pages: 55 },
      { id: 'math-12-4', title: 'Integration Mastery', status: 'coming-soon', pages: 65 },
      { id: 'math-12-5', title: 'Vectors & 3D Geometry', status: 'coming-soon', pages: 50 },
      { id: 'math-12-6', title: 'Matrices & Determinants', status: 'coming-soon', pages: 45 },
    ],
  },
};

const subjectConfig = {
  physics: {
    icon: Atom,
    label: 'Physics',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  chemistry: {
    icon: FlaskConical,
    label: 'Chemistry',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  maths: {
    icon: Calculator,
    label: 'Mathematics',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
};

const TutorialSessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('11');
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('maths');

  const notes = tutorialNotes[selectedSubject][selectedClass];
  const config = subjectConfig[selectedSubject];
  const Icon = config.icon;

  return (
    <MainLayout title="Tutorial Sessions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-display font-semibold text-foreground">
                JEE Tutorial Sessions
              </h1>
            </div>
            <p className="text-text-secondary max-w-2xl">
              Premium Kota-style notes curated from Allen, Resonance & PW. Each PDF is crafted 
              like a senior mentor wrote it before your exam.
            </p>
          </div>
          <Badge className="bg-accent/10 text-accent border-accent/30">
            <Star className="w-3 h-3 mr-1" />
            Premium Content
          </Badge>
        </div>

        {/* Class & Subject Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Class Toggle */}
          <Tabs defaultValue="11" onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="11" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <GraduationCap className="w-4 h-4 mr-2" />
                Class 11
              </TabsTrigger>
              <TabsTrigger value="12" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <GraduationCap className="w-4 h-4 mr-2" />
                Class 12
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Subject Buttons */}
          <div className="flex gap-2">
            {(Object.keys(subjectConfig) as SubjectKey[]).map((key) => {
              const cfg = subjectConfig[key];
              const SubjectIcon = cfg.icon;
              return (
                <Button
                  key={key}
                  variant={selectedSubject === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(key)}
                  className={cn(
                    selectedSubject === key && "bg-primary text-primary-foreground"
                  )}
                >
                  <SubjectIcon className="w-4 h-4 mr-2" />
                  {cfg.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className={cn(
                "card-elevated transition-all",
                note.status === 'coming-soon' && "opacity-75"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bgColor)}>
                    <FileText className={cn("w-6 h-6", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">{note.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                      <span>{note.pages} pages</span>
                      <span>•</span>
                      <span>PDF</span>
                    </div>
                    
                    {note.status === 'coming-soon' ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Lock className="w-3 h-3 mr-1" />
                        Coming Soon
                      </Badge>
                    ) : (
                      <Button size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Request Section */}
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload Demo PDF for Review
            </h3>
            <p className="text-text-secondary mb-4 max-w-md mx-auto">
              Share your current notes with us and we'll analyze the structure, 
              identify improvements, and create an enhanced Kota-style version.
            </p>
            <p className="text-sm text-text-muted italic">
              "Bhai, apna PDF bhejo - hum usko coaching level ka bana denge"
            </p>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
            <CheckCircle2 className="w-5 h-5 text-setu-success" />
            <span className="text-sm text-foreground">PYQ-focused content</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
            <CheckCircle2 className="w-5 h-5 text-setu-success" />
            <span className="text-sm text-foreground">Plain text formulas</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
            <CheckCircle2 className="w-5 h-5 text-setu-success" />
            <span className="text-sm text-foreground">Jeetu Bhaiya style</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TutorialSessionsPage;
