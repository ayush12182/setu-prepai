import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  FileText, 
  ListChecks, 
  Table, 
  Zap, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FormulaSheet from '@/components/revision/FormulaSheet';
import DifferenceTables from '@/components/revision/DifferenceTables';
import QuickQuiz from '@/components/revision/QuickQuiz';
import OnePageNotes from '@/components/revision/OnePageNotes';

type RevisionMode = 'home' | 'notes' | 'formulas' | 'tables' | 'quiz';

const RevisionPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<RevisionMode>('home');

  const revisionModes = [
    {
      id: 'notes' as RevisionMode,
      icon: FileText,
      title: '1-Page Notes',
      description: 'AI-generated condensed chapter notes',
      action: 'Generate Notes',
      color: 'bg-physics/10 text-physics'
    },
    {
      id: 'formulas' as RevisionMode,
      icon: ListChecks,
      title: 'Formula Sheets',
      description: 'All important formulas in one place',
      action: 'View Formulas',
      color: 'bg-chemistry/10 text-chemistry'
    },
    {
      id: 'tables' as RevisionMode,
      icon: Table,
      title: 'Difference Tables',
      description: 'Compare similar concepts side by side',
      action: 'View Tables',
      color: 'bg-maths/10 text-maths'
    },
    {
      id: 'quiz' as RevisionMode,
      icon: Zap,
      title: '1-Mark Questions',
      description: 'Quick questions for rapid revision',
      action: 'Start Quiz',
      color: 'bg-setu-saffron/10 text-setu-saffron'
    }
  ];

  const lastDayChecklist = [
    { subject: 'Physics', items: ['Formulas', 'Derivations', 'PYQ Patterns', 'Numerical Tips'] },
    { subject: 'Chemistry', items: ['Reactions', 'Named Reactions', 'Periodic Table', 'Organic Mechanisms'] },
    { subject: 'Maths', items: ['Integration', 'Limits', 'Coordinate Geometry', 'Vectors'] }
  ];

  const renderContent = () => {
    switch (activeMode) {
      case 'notes':
        return <OnePageNotes onBack={() => setActiveMode('home')} />;
      case 'formulas':
        return <FormulaSheet onBack={() => setActiveMode('home')} />;
      case 'tables':
        return <DifferenceTables onBack={() => setActiveMode('home')} />;
      case 'quiz':
        return <QuickQuiz onBack={() => setActiveMode('home')} />;
      default:
        return null;
    }
  };

  if (activeMode !== 'home') {
    return (
      <MainLayout title="Revision">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Revision">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Revision Mode
          </h1>
          <p className="text-muted-foreground">
            Quick revision tools for exam day preparation
          </p>
        </div>

        {/* Revision Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {revisionModes.map((mode) => (
            <div 
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className="bg-card border border-border rounded-xl p-6 card-hover cursor-pointer group"
            >
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                mode.color
              )}>
                <mode.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{mode.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {mode.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>

        {/* Last Day Checklist */}
        <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-setu-saffron" />
            <h2 className="text-xl font-bold">Last Day Revision Checklist</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lastDayChecklist.map((subject) => (
              <div key={subject.subject}>
                <h4 className="font-semibold mb-3 text-setu-saffron">{subject.subject}</h4>
                <ul className="space-y-2">
                  {subject.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-white/30 bg-transparent"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Tip */}
        <div className="mentor-tip">
          <p className="font-medium text-foreground mb-1">💡 Jeetu Bhaiya's Revision Strategy</p>
          <p className="text-muted-foreground text-sm">
            Beta, exam se 1 din pehle naya kuch mat padho. Sirf revision karo - 
            formula sheets dekho, PYQ patterns yaad karo, aur confident raho. 
            Sleep is important - kam se kam 6 ghante ki neend lo!
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default RevisionPage;
