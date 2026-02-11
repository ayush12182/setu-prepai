import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  FileText, 
  Clock, 
  Bookmark, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Calculator,
  History,
  BookOpen,
  ChevronRight,
  Brain,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLectureNotes, LectureNote } from '@/hooks/useLectureNotes';
import { useLanguage } from '@/contexts/LanguageContext';

const LectureSetu: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const { language } = useLanguage();
  const { isProcessing, currentNote, notes, processLecture, fetchUserNotes } = useLectureNotes();

  useEffect(() => { fetchUserNotes(); }, []);

  const handleProcess = async () => {
    if (!videoUrl) return;
    await processLecture(videoUrl, language);
    setVideoUrl('');
  };

  const features = [
    { icon: FileText, title: 'Structured Notes', desc: 'AI converts lecture to exam-focused notes', gradient: 'from-blue-500 to-cyan-500', emoji: '📝' },
    { icon: Clock, title: 'Key Timestamps', desc: 'Important moments highlighted automatically', gradient: 'from-emerald-500 to-green-500', emoji: '⏱️' },
    { icon: Bookmark, title: 'Flashcards', desc: 'Auto-generated revision cards for spaced repetition', gradient: 'from-violet-500 to-purple-500', emoji: '🃏' },
  ];

  const benefits = [
    'Structured notes with key concepts highlighted',
    'Important timestamps for quick revision',
    'All formulas extracted in one place',
    'PYQ connections — which questions relate to this topic',
    '1-page revision summary',
    'Auto-generated flashcards for spaced repetition',
  ];

  return (
    <MainLayout title="Lecture SETU">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="relative text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" />
                AI-Powered Notes
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Lecture SETU
            </h1>
            <p className="text-white/60 text-base max-w-md mx-auto">
              Paste any YouTube lecture link and get structured notes, timestamps, formulas, and flashcards instantly.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 group">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Paste Lecture Link</h3>
                <p className="text-sm text-muted-foreground">YouTube video URL</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1"
                disabled={isProcessing}
              />
              <Button onClick={handleProcess} disabled={!videoUrl || isProcessing} className="gap-2">
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                ) : (
                  <>Process<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {currentNote && <LectureResults note={currentNote} />}

        {/* Features Grid (shown when no results) */}
        {!currentNote && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={cn("absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity", `bg-${feature.gradient.split(' ')[0].replace('from-', '')}/10`)} />
                <div className="relative text-center">
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center shadow-md", feature.gradient)}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  <span className="text-2xl mt-3 block opacity-50 group-hover:opacity-100 transition-opacity">{feature.emoji}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Previous Notes */}
        {notes.length > 0 && !currentNote && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <History className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Previous Lectures</h3>
            </div>
            <div className="p-3 space-y-2">
              {notes.slice(0, 5).map((note) => (
                <button
                  key={note.id}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group/item"
                >
                  {note.thumbnail_url && (
                    <img src={note.thumbnail_url} alt="" className="w-20 h-14 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground group-hover/item:text-accent transition-colors">{note.video_title || 'Untitled'}</p>
                    <p className="text-sm text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* What You Get */}
        {!currentNote && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--setu-navy-light))] p-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white">What You Get</h3>
              </div>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// Separate component for showing results
const LectureResults: React.FC<{ note: LectureNote }> = ({ note }) => {
  const [activeFlashcard, setActiveFlashcard] = useState(0);
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="space-y-6">
      {/* Video Header */}
      <Card className="border-border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {note.thumbnail_url && (
            <img src={note.thumbnail_url} alt="" className="w-full md:w-64 h-40 object-cover" />
          )}
          <CardContent className="p-4 flex-1">
            <h2 className="text-xl font-semibold mb-2">{note.video_title || 'Processed Lecture'}</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓ Notes Generated</Badge>
          </CardContent>
        </div>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="notes" className="flex items-center gap-2"><FileText className="w-4 h-4" />Notes</TabsTrigger>
          <TabsTrigger value="formulas" className="flex items-center gap-2"><Calculator className="w-4 h-4" />Formulas</TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2"><Bookmark className="w-4 h-4" />Flashcards</TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card className="border-border">
            <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
              {note.structured_notes ? <div className="whitespace-pre-wrap">{note.structured_notes}</div> : <p className="text-muted-foreground">No notes generated</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulas">
          <div className="grid gap-4">
            {note.formulas && note.formulas.length > 0 ? note.formulas.map((formula, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="font-mono text-lg mb-2 text-primary">{formula.formula}</div>
                  <div className="font-semibold">{formula.name}</div>
                  <div className="text-sm text-muted-foreground">{formula.usage}</div>
                </CardContent>
              </Card>
            )) : (
              <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">No formulas extracted from this lecture</CardContent></Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="flashcards">
          {note.flashcards && note.flashcards.length > 0 ? (
            <div className="space-y-4">
              <Card className="border-border cursor-pointer min-h-[200px] flex items-center justify-center" onClick={() => setShowBack(!showBack)}>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Card {activeFlashcard + 1} of {note.flashcards.length}</p>
                  <p className="text-lg font-medium">{showBack ? note.flashcards[activeFlashcard]?.back : note.flashcards[activeFlashcard]?.front}</p>
                  <p className="text-sm text-muted-foreground mt-4">Click to {showBack ? 'see question' : 'reveal answer'}</p>
                </CardContent>
              </Card>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => { setActiveFlashcard(Math.max(0, activeFlashcard - 1)); setShowBack(false); }} disabled={activeFlashcard === 0}>Previous</Button>
                <Button variant="outline" onClick={() => { setActiveFlashcard(Math.min(note.flashcards.length - 1, activeFlashcard + 1)); setShowBack(false); }} disabled={activeFlashcard === note.flashcards.length - 1}>Next</Button>
              </div>
            </div>
          ) : (
            <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">No flashcards generated from this lecture</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="summary">
          <Card className="border-border">
            <CardContent className="p-6">
              {note.one_page_summary ? <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">{note.one_page_summary}</div> : <p className="text-muted-foreground text-center">No summary generated</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PYQ Connections */}
      {note.pyq_connections && note.pyq_connections.length > 0 && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-lg">PYQ Connections</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {note.pyq_connections.map((pyq, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                <Badge variant="outline">{pyq.year}</Badge>
                <Badge variant="secondary">{pyq.exam}</Badge>
                <span className="text-sm">{pyq.topic}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LectureSetu;
