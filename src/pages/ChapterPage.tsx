// ChapterPage - Shows subchapters (topics) for a chapter
// Hierarchy: Subject → Chapter → Subchapter → Learn/Practice/Test/Analyze
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getChapterById } from '@/data/syllabus';
import { getSubchaptersByChapterId, Subchapter } from '@/data/subchapters';
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ChapterPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();

  const chapter = chapterId ? getChapterById(chapterId) : null;
  const subchapters = chapterId ? getSubchaptersByChapterId(chapterId) : [];

  if (!chapter) {
    return (
      <MainLayout title="Chapter Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chapter not found</p>
          <Button onClick={() => navigate('/learn')} className="mt-4">
            Back to Learn
          </Button>
        </div>
      </MainLayout>
    );
  }

  const subjectColors: Record<string, string> = {
    physics: 'from-physics/20 to-physics/5 border-physics/30',
    chemistry: 'from-chemistry/20 to-chemistry/5 border-chemistry/30',
    maths: 'from-maths/20 to-maths/5 border-maths/30'
  };

  const subjectTextColors: Record<string, string> = {
    physics: 'text-physics',
    chemistry: 'text-chemistry',
    maths: 'text-maths'
  };

  const subjectBgColors: Record<string, string> = {
    physics: 'bg-physics/10 hover:bg-physics/20',
    chemistry: 'bg-chemistry/10 hover:bg-chemistry/20',
    maths: 'bg-maths/10 hover:bg-maths/20'
  };

  return (
    <MainLayout title={chapter.name}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => navigate('/learn')}
            className="hover:text-foreground transition-colors"
          >
            Learn
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/learn?subject=${chapter.subject}`)}
            className="hover:text-foreground transition-colors capitalize"
          >
            {chapter.subject}
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">{chapter.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full border',
                chapter.weightage === 'High' ? 'bg-setu-saffron/10 text-setu-saffron border-setu-saffron/30' :
                chapter.weightage === 'Medium' ? 'bg-setu-warning/10 text-setu-warning border-setu-warning/30' :
                'bg-muted text-muted-foreground border-border'
              )}>
                {chapter.weightage} Weightage
              </span>
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                chapter.difficulty === 'Hard' ? 'text-setu-error' :
                chapter.difficulty === 'Medium' ? 'text-setu-warning' :
                'text-setu-success'
              )}>
                {chapter.difficulty}
              </span>
              {chapter.chemistryType && (
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                  {chapter.chemistryType}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {chapter.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="capitalize">{chapter.subject}</span>
              <span>•</span>
              <span>{subchapters.length} Subchapters</span>
              <span>•</span>
              <span>PYQ (2020+): {chapter.pyqData.postCovid}</span>
            </div>
          </div>
        </div>

        {/* Chapter Overview Card */}
        <div className={`bg-gradient-to-br ${subjectColors[chapter.subject]} border rounded-xl p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-setu-saffron">{chapter.pyqData.postCovid}</p>
              <p className="text-xs text-muted-foreground">Post-2020 PYQs</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{chapter.pyqData.total}</p>
              <p className="text-xs text-muted-foreground">Total PYQs</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{subchapters.length}</p>
              <p className="text-xs text-muted-foreground">Subchapters</p>
            </div>
          </div>
        </div>

        {/* Subchapters Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Select a Subchapter to Study
            </h2>
          </div>

          {subchapters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subchapters.map((subchapter, index) => (
                <SubchapterCard 
                  key={subchapter.id} 
                  subchapter={subchapter}
                  index={index}
                  subjectColor={subjectBgColors[chapter.subject]}
                  textColor={subjectTextColors[chapter.subject]}
                  onClick={() => navigate(`/subchapter/${subchapter.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-xl p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-setu-warning mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">Subchapters for this chapter are being prepared.</p>
              <p className="text-sm text-muted-foreground">Check back soon or explore other chapters!</p>
            </div>
          )}
        </div>

        {/* Trending Concepts */}
        {chapter.pyqData.trendingConcepts.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-physics" />
              Trending PYQ Concepts
            </h3>
            <div className="flex flex-wrap gap-2">
              {chapter.pyqData.trendingConcepts.map((concept) => (
                <span 
                  key={concept}
                  className={cn('px-3 py-1.5 text-xs rounded-full', subjectBgColors[chapter.subject], subjectTextColors[chapter.subject])}
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Formulas Preview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-setu-warning" />
            Key Formulas (Chapter Overview)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {chapter.keyFormulas.slice(0, 6).map((formula, i) => (
              <div key={i} className="p-3 bg-secondary rounded-lg font-mono text-sm">
                {formula}
              </div>
            ))}
          </div>
          {chapter.keyFormulas.length > 6 && (
            <p className="text-sm text-muted-foreground mt-3">
              + {chapter.keyFormulas.length - 6} more formulas (see in subchapters)
            </p>
          )}
        </div>

        {/* Jeetu Bhaiya Tip */}
        <div className="bg-gradient-to-r from-setu-saffron/10 to-setu-green/10 border border-setu-saffron/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-setu-saffron mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">Jeetu Bhaiya's Tip</p>
              <p className="text-muted-foreground text-sm">
                Beta, {chapter.name} mein {subchapters.length} subchapters hain. Ek ek karke master karo. 
                {chapter.weightage === 'High' && ' Yeh HIGH weightage chapter hai — skip mat karna.'}
                {' '}Har subchapter mein Learn → Practice → Test karo. Shortcuts mat lo.
              </p>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        {chapter.prerequisites.length > 0 && (
          <div className="bg-secondary/50 border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3">Prerequisites</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Complete these chapters first for better understanding:
            </p>
            <div className="flex flex-wrap gap-2">
              {chapter.prerequisites.map((prereq) => {
                const prereqChapter = getChapterById(prereq);
                return prereqChapter ? (
                  <Button
                    key={prereq}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/chapter/${prereq}`)}
                  >
                    {prereqChapter.name}
                  </Button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// Subchapter Card Component
interface SubchapterCardProps {
  subchapter: Subchapter;
  index: number;
  subjectColor: string;
  textColor: string;
  onClick: () => void;
}

const SubchapterCard: React.FC<SubchapterCardProps> = ({ 
  subchapter, 
  index, 
  subjectColor, 
  textColor,
  onClick 
}) => {
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-xl p-5 cursor-pointer transition-all duration-200",
        "hover:border-primary/50 hover:shadow-md group"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
            subjectColor, textColor
          )}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {subchapter.name}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {subchapter.jeeAsks[0]}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{subchapter.jeeAsks.length} key concepts</span>
              <span>•</span>
              <span>{subchapter.commonMistakes.length} traps to avoid</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </div>
  );
};

export default ChapterPage;
