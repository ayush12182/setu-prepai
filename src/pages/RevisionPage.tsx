import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  FileText, 
  ListChecks, 
  Table, 
  Zap, 
  BookOpen,
  ArrowRight,
  PenTool,
  Sparkles,
  Clock,
  Target,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FormulaSheet from '@/components/revision/FormulaSheet';
import DifferenceTables from '@/components/revision/DifferenceTables';
import QuickQuiz from '@/components/revision/QuickQuiz';
import OnePageNotes from '@/components/revision/OnePageNotes';
import HandwrittenNotesAnalysis from '@/components/revision/HandwrittenNotesAnalysis';

type RevisionMode = 'home' | 'notes' | 'formulas' | 'tables' | 'quiz' | 'handwritten';

const RevisionPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<RevisionMode>('home');
  const navigate = useNavigate();

  const revisionModes = [
    {
      id: 'notes' as RevisionMode,
      icon: FileText,
      title: '1-Page Notes',
      description: 'AI-generated condensed chapter notes — everything you need on one page',
      action: 'Generate Notes',
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/10',
      emoji: '📝',
    },
    {
      id: 'handwritten' as RevisionMode,
      icon: PenTool,
      title: 'Analyze My Notes',
      description: 'Upload your handwritten notes and let AI teach you from them',
      action: 'Upload Notes',
      gradient: 'from-violet-500 to-purple-500',
      bgGlow: 'bg-violet-500/10',
      emoji: '✍️',
    },
    {
      id: 'formulas' as RevisionMode,
      icon: ListChecks,
      title: 'Formula Sheets',
      description: 'Every important formula organized by chapter — no more hunting',
      action: 'View Formulas',
      gradient: 'from-emerald-500 to-green-500',
      bgGlow: 'bg-emerald-500/10',
      emoji: '📐',
    },
    {
      id: 'tables' as RevisionMode,
      icon: Table,
      title: 'Difference Tables',
      description: 'Confused between similar concepts? Compare them side by side',
      action: 'View Tables',
      gradient: 'from-orange-500 to-amber-500',
      bgGlow: 'bg-orange-500/10',
      emoji: '⚖️',
    },
    {
      id: 'quiz' as RevisionMode,
      icon: Zap,
      title: '1-Mark Questions',
      description: 'Rapid-fire quick questions to test your revision in seconds',
      action: 'Start Quiz',
      gradient: 'from-rose-500 to-pink-500',
      bgGlow: 'bg-rose-500/10',
      emoji: '⚡',
    }
  ];

  const lastDayChecklist = [
    { subject: 'physics', label: 'Physics', icon: '⚛️', items: [
      { name: 'Formulas', slug: 'formulas' },
      { name: 'Derivations', slug: 'derivations' },
      { name: 'PYQ Patterns', slug: 'pyq-patterns' },
      { name: 'Numerical Tips', slug: 'numerical-tips' },
    ]},
    { subject: 'chemistry', label: 'Chemistry', icon: '🧪', items: [
      { name: 'Reactions', slug: 'reactions' },
      { name: 'Named Reactions', slug: 'named-reactions' },
      { name: 'Periodic Table', slug: 'periodic-table' },
      { name: 'Organic Mechanisms', slug: 'organic-mechanisms' },
    ]},
    { subject: 'maths', label: 'Maths', icon: '📊', items: [
      { name: 'Integration', slug: 'integration' },
      { name: 'Limits', slug: 'limits' },
      { name: 'Coordinate Geometry', slug: 'coordinate-geometry' },
      { name: 'Vectors', slug: 'vectors' },
    ]},
  ];

  const renderContent = () => {
    switch (activeMode) {
      case 'notes': return <OnePageNotes onBack={() => setActiveMode('home')} />;
      case 'handwritten': return <HandwrittenNotesAnalysis onBack={() => setActiveMode('home')} />;
      case 'formulas': return <FormulaSheet onBack={() => setActiveMode('home')} />;
      case 'tables': return <DifferenceTables onBack={() => setActiveMode('home')} />;
      case 'quiz': return <QuickQuiz onBack={() => setActiveMode('home')} />;
      default: return null;
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
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-8 sm:p-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Exam Ready Mode
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Revision Hub
              </h1>
              <p className="text-white/60 text-base max-w-md">
                Everything you need for last-minute revision — notes, formulas, quick tests, all in one place.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              {[
                { icon: Clock, label: 'Quick Revise', value: '15 min' },
                { icon: Target, label: 'Accuracy', value: '85%+' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
                  <stat.icon className="w-4 h-4 text-accent mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[11px] text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revision Mode Cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            Choose Your Revision Tool
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {revisionModes.map((mode, i) => (
              <div 
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "relative group bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1 hover:border-accent/30 overflow-hidden",
                  i === 0 && "sm:col-span-2 lg:col-span-1"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Hover glow */}
                <div className={cn(
                  "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  mode.bgGlow
                )} />
                
                <div className="relative">
                  {/* Icon + Emoji */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                      mode.gradient
                    )}>
                      <mode.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{mode.emoji}</span>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-foreground mb-1.5 group-hover:text-accent transition-colors">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{mode.description}</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  >
                    {mode.action}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Day Checklist */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--setu-navy-light))] p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Last Day Revision Checklist</h2>
                <p className="text-white/40 text-sm">Tick off as you revise — stay on track!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {lastDayChecklist.map((subj) => (
                <div key={subj.subject} className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h4 className="font-semibold mb-3 text-accent flex items-center gap-2">
                    <span className="text-lg">{subj.icon}</span>
                    {subj.label}
                  </h4>
                  <ul className="space-y-2.5">
                    {subj.items.map((item, i) => (
                      <li
                        key={i}
                        onClick={() => navigate(`/revision/${subj.subject}/${item.slug}`)}
                        className="flex items-center gap-3 text-sm text-white/70 group/item cursor-pointer hover:text-accent hover:bg-white/5 rounded-lg px-2 py-1.5 -mx-2 transition-all"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-accent/60 group-hover/item:translate-x-0.5 transition-transform" />
                        <span className="font-medium">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mentor Tip */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-6">
          <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 select-none">💡</div>
          <div className="relative flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Jeetu Bhaiya's Revision Strategy</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Beta, exam se 1 din pehle naya kuch mat padho. Sirf revision karo — 
                formula sheets dekho, PYQ patterns yaad karo, aur confident raho. 
                Sleep is important — kam se kam 6 ghante ki neend lo!
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RevisionPage;
