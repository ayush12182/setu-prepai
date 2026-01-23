import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getChapterById, Chapter } from '@/data/syllabus';
import { 
  ArrowLeft, 
  BookOpen, 
  PenTool, 
  ClipboardCheck, 
  BarChart3,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  Sparkles,
  Loader2,
  ChevronLeft,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

const ChapterPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learn');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const chapter = chapterId ? getChapterById(chapterId) : null;

  const generateNotes = async (chapterData: Chapter) => {
    setShowNotes(true);
    setIsGenerating(true);
    setNotes('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          chapterName: chapterData.name,
          subject: chapterData.subject,
          topics: chapterData.topics,
          formulas: chapterData.keyFormulas,
          examTips: chapterData.examTips,
          pyqData: chapterData.pyqData
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
          throw new Error('Rate limit exceeded');
        }
        if (response.status === 402) {
          toast.error('Credits exhausted. Please add credits.');
          throw new Error('Credits exhausted');
        }
        throw new Error('Failed to generate notes');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullNotes = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullNotes += content;
              setNotes(fullNotes);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      if (!notes) {
        toast.error('Failed to generate notes. Showing offline version.');
        const fallbackNotes = generateFallbackNotes(chapterData);
        setNotes(fallbackNotes);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackNotes = (chapterData: Chapter): string => {
    return `${chapterData.name.toUpperCase()}

1. Chapter ka matlab
Yeh chapter ${chapterData.subject} ke important concepts cover karta hai. JEE mein isse regularly questions aate hain.

2. Exam syllabus (JEE focused)
${chapterData.topics.map(t => `- ${t}`).join('\n')}

3. Important formulas (PLAIN TEXT ONLY)
${chapterData.keyFormulas.map(f => `- ${f}`).join('\n')}

4. Important results / facts
- Post-2020: ${chapterData.pyqData.postCovid} questions aaye hain
- Trending: ${chapterData.pyqData.trendingConcepts.join(', ')}

5. Common mistakes
${chapterData.examTips.map(t => `- ${t}`).join('\n')}

6. Post-COVID PYQ focus
- 2020-2025: ${chapterData.pyqData.postCovid} questions (HIGH PRIORITY)
- Total: ${chapterData.pyqData.total} questions

7. Last-day revision plan
- Step 1: Saare formulas ek baar likh ke dekho
- Step 2: Previous 5 years ke PYQs solve karo
- Step 3: Common mistakes list check karo

Bas beta, itna yaad rakho. Ab PYQs lagao, wahi exam hai.`;
  };

  const downloadAsPdf = async () => {
    if (!notes || !chapter) return;
    
    setIsDownloading(true);
    toast.info('Preparing PDF...');
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(chapter.name, margin, yPosition);
      yPosition += 10;
      
      // Subject badge
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Subject: ${chapter.subject.toUpperCase()}`, margin, yPosition);
      yPosition += 10;
      
      // Separator line
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Notes content
      doc.setFontSize(11);
      const lines = notes.split('\n');
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        if (line.match(/^\d+\.\s/)) {
          // Section headers
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          yPosition += 3;
        } else if (line.toUpperCase() === line && line.trim().length > 0 && !line.startsWith('-')) {
          // Chapter title in content
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
        }
        
        if (line.trim()) {
          const textLines = doc.splitTextToSize(line, maxWidth);
          for (const textLine of textLines) {
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(textLine, margin, yPosition);
            yPosition += 5;
          }
        } else {
          yPosition += 3;
        }
      }
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`SETU JEE Prep - ${chapter.name} | Page ${i} of ${totalPages}`, margin, pageHeight - 8);
      }
      
      doc.save(`${chapter.name.replace(/\s+/g, '_')}_Notes.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderNotes = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.match(/^\d+\.\s/)) {
        return <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-primary">{line}</h3>;
      }
      if (line.startsWith('- ')) {
        return <p key={i} className="ml-4 my-1">• {line.slice(2)}</p>;
      }
      if (line.toUpperCase() === line && line.trim().length > 0 && !line.startsWith('-')) {
        return <h2 key={i} className="text-lg font-bold mt-0 mb-3">{line}</h2>;
      }
      if (line.trim()) {
        return <p key={i} className="my-1 text-muted-foreground">{line}</p>;
      }
      return <br key={i} />;
    });
  };

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

  // Show generated notes view
  if (showNotes) {
    return (
      <MainLayout title={`${chapter.name} - Notes`}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => { setShowNotes(false); setNotes(''); }}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold">{chapter.name}</h2>
                <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize',
                  chapter.subject === 'physics' ? 'bg-physics/10 text-physics' :
                  chapter.subject === 'chemistry' ? 'bg-chemistry/10 text-chemistry' :
                  'bg-maths/10 text-maths'
                )}>
                  {chapter.subject}
                </span>
              </div>
            </div>
            
            {/* Download PDF Button */}
            {notes && !isGenerating && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadAsPdf}
                disabled={isDownloading}
                className="gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 max-h-[70vh] overflow-y-auto">
            {isGenerating && notes === '' ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Generating notes...</span>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none bg-card p-4">
                {renderNotes(notes)}
                {isGenerating && (
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                )}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={chapter.name}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
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
              <span>PYQ (2020+): {chapter.pyqData.postCovid}</span>
              <span>•</span>
              <span>Total PYQ: {chapter.pyqData.total}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary h-12">
            <TabsTrigger value="learn" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== LEARN TAB ==================== */}
          <TabsContent value="learn" className="mt-6 space-y-6">
            {/* Topics Overview */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-setu-saffron" />
                Topics in this Chapter
              </h3>
              <div className="flex flex-wrap gap-2">
                {chapter.topics.map((topic) => (
                  <span 
                    key={topic}
                    className="px-3 py-1.5 bg-secondary text-sm rounded-lg text-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* PYQ Insights */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-physics" />
                PYQ Analysis
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-setu-saffron/10 rounded-lg">
                  <p className="text-2xl font-bold text-setu-saffron">{chapter.pyqData.postCovid}</p>
                  <p className="text-xs text-muted-foreground">2020-2025</p>
                  <p className="text-xs text-setu-saffron font-medium">HIGH PRIORITY</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{chapter.pyqData.preCovid}</p>
                  <p className="text-xs text-muted-foreground">2010-2019</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-muted-foreground">{chapter.pyqData.legacy}</p>
                  <p className="text-xs text-muted-foreground">Before 2010</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Trending Concepts:</p>
                <div className="flex flex-wrap gap-2">
                  {chapter.pyqData.trendingConcepts.map((concept) => (
                    <span 
                      key={concept}
                      className="px-3 py-1 bg-physics/10 text-physics text-xs rounded-full"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mentor Tip */}
            <div className="mentor-tip">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-setu-saffron mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">Jeetu Bhaiya's Tip</p>
                  <p className="text-muted-foreground text-sm">
                    Beta, {chapter.name} mein concept clarity sabse important hai. 
                    {chapter.weightage === 'High' && ' Yeh HIGH weightage chapter hai — har saal question aata hai.'}
                    {chapter.difficulty === 'Hard' && ' Thoda tough hai, but step-by-step karo toh easy ho jaata hai.'}
                    {' '}Pehle theory samjho, phir formulas, phir PYQs solve karo.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Formulas */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-setu-warning" />
                Key Formulas
              </h3>
              <div className="space-y-2">
                {chapter.keyFormulas.map((formula, i) => (
                  <div key={i} className="p-3 bg-secondary rounded-lg font-mono text-sm">
                    {formula}
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Tips / Common Traps */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-setu-warning" />
                Exam Tips & Traps
              </h3>
              <ul className="space-y-3">
                {chapter.examTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-setu-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
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

            {/* Generate Notes Button */}
            <Button 
              className="w-full btn-hero py-6 text-lg gap-2"
              onClick={() => generateNotes(chapter)}
            >
              <Sparkles className="w-5 h-5" />
              Generate AI Notes for this Chapter
            </Button>
          </TabsContent>

          {/* ==================== PRACTICE TAB ==================== */}
          <TabsContent value="practice" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover group">
                <div className="w-12 h-12 rounded-lg bg-setu-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌱</span>
                </div>
                <h4 className="font-semibold mb-1">Level 1: Concept MCQs</h4>
                <p className="text-sm text-muted-foreground mb-2">Basic understanding check</p>
                <p className="text-xs text-setu-success font-medium">20 Questions • Easy</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover group">
                <div className="w-12 h-12 rounded-lg bg-setu-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold mb-1">Level 2: JEE Main</h4>
                <p className="text-sm text-muted-foreground mb-2">Previous year pattern</p>
                <p className="text-xs text-setu-warning font-medium">25 Questions • Medium</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover group">
                <div className="w-12 h-12 rounded-lg bg-setu-error/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔥</span>
                </div>
                <h4 className="font-semibold mb-1">Level 3: JEE Advanced</h4>
                <p className="text-sm text-muted-foreground mb-2">Advanced thinking</p>
                <p className="text-xs text-setu-error font-medium">15 Questions • Hard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🔢</span>
                  <h4 className="font-semibold">Integer Type</h4>
                </div>
                <p className="text-sm text-muted-foreground">Numerical answer practice</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🔗</span>
                  <h4 className="font-semibold">Match the Following</h4>
                </div>
                <p className="text-sm text-muted-foreground">Matrix match questions</p>
              </div>
            </div>

            {/* Mentor Tip for Practice */}
            <div className="mentor-tip">
              <p className="text-sm">
                <strong>Jeetu Bhaiya:</strong> Beta, Level 1 skip mat karna. 
                Concept clear nahi toh Level 2-3 mein galti hogi. 
                Pehle foundation, phir speed.
              </p>
            </div>
          </TabsContent>

          {/* ==================== TEST TAB ==================== */}
          <TabsContent value="test" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Chapter Test</h4>
                    <p className="text-xs text-muted-foreground">Full chapter coverage</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 60 min</span>
                  <span>30 Questions</span>
                </div>
                <Button className="w-full">Start Test</Button>
              </div>

              <div className="bg-card border border-setu-saffron/30 rounded-xl p-6 card-hover bg-setu-saffron/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-setu-saffron/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-setu-saffron" />
                  </div>
                  <div>
                    <h4 className="font-semibold">PYQ Test (2020+)</h4>
                    <p className="text-xs text-setu-saffron font-medium">HIGH PRIORITY</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 45 min</span>
                  <span>{chapter.pyqData.postCovid} Questions</span>
                </div>
                <Button className="w-full btn-hero">Start PYQ Test</Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-lg">🔀</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Mixed Test</h4>
                    <p className="text-xs text-muted-foreground">With related chapters</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Combines with prerequisite chapters for revision
                </p>
                <Button variant="outline" className="w-full">Configure Test</Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Adaptive Test</h4>
                    <p className="text-xs text-muted-foreground">Based on your weak areas</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  AI picks questions you struggle with
                </p>
                <Button variant="outline" className="w-full">Start Adaptive</Button>
              </div>
            </div>
          </TabsContent>

          {/* ==================== ANALYZE TAB ==================== */}
          <TabsContent value="analyze" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-setu-saffron mb-1">68%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-foreground mb-1">42</p>
                <p className="text-xs text-muted-foreground">Attempted</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-setu-success mb-1">1.2m</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-physics mb-1">B+</p>
                <p className="text-xs text-muted-foreground">Chapter Status</p>
              </div>
            </div>

            {/* Mistake Analysis */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold mb-4">Mistake Patterns</h4>
              <div className="space-y-4">
                {[
                  { type: 'Conceptual Errors', percent: 35, color: 'bg-setu-error' },
                  { type: 'Calculation Mistakes', percent: 25, color: 'bg-setu-warning' },
                  { type: 'Silly Mistakes', percent: 20, color: 'bg-setu-success' },
                  { type: 'Time Pressure', percent: 20, color: 'bg-muted-foreground' }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{item.type}</span>
                      <span className="text-sm font-medium">{item.percent}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concept Gaps */}
            <div className="bg-setu-warning/10 border border-setu-warning/30 rounded-xl p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-setu-warning" />
                Concept Gaps Identified
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-setu-warning rounded-full"></span>
                  {chapter.topics[0]} — 45% accuracy
                </li>
                {chapter.topics[1] && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-setu-warning rounded-full"></span>
                    {chapter.topics[1]} — 52% accuracy
                  </li>
                )}
              </ul>
            </div>

            {/* Mentor Improvement Suggestion */}
            <div className="mentor-tip">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-setu-saffron mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">Improvement Plan</p>
                  <p className="text-muted-foreground text-sm">
                    Beta, conceptual errors zyada hain. 
                    {chapter.topics[0]} dobara padho. 
                    Theory clear karo, phir Level 1 MCQs se start karo. 
                    Speed baad mein aayegi, pehle accuracy badhao.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ChapterPage;
