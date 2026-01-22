import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { physicsChapters, chemistryChapters, mathsChapters, Subject, Chapter } from '@/data/syllabus';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnePageNotesProps {
  onBack: () => void;
}

const OnePageNotes: React.FC<OnePageNotesProps> = ({ onBack }) => {
  const [activeSubject, setActiveSubject] = useState<Subject>('physics');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getChapters = () => {
    switch (activeSubject) {
      case 'physics': return physicsChapters;
      case 'chemistry': return chemistryChapters;
      case 'maths': return mathsChapters;
    }
  };

  const subjectColors = {
    physics: 'bg-physics text-white',
    chemistry: 'bg-chemistry text-white',
    maths: 'bg-maths text-white'
  };

  const generateNotes = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
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
          chapterName: chapter.name,
          subject: chapter.subject,
          topics: chapter.topics,
          formulas: chapter.keyFormulas,
          examTips: chapter.examTips
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullNotes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullNotes += content;
                setNotes(fullNotes);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error('Failed to generate notes. Please try again.');
      
      // Fallback to local notes
      const fallbackNotes = generateFallbackNotes(chapter);
      setNotes(fallbackNotes);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackNotes = (chapter: Chapter): string => {
    return `# ${chapter.name} - Quick Revision Notes

## Key Topics
${chapter.topics.map(t => `• ${t}`).join('\n')}

## Important Formulas
${chapter.keyFormulas.map(f => `• ${f}`).join('\n')}

## Exam Tips
${chapter.examTips.map(t => `⚡ ${t}`).join('\n')}

## PYQ Analysis
- Total questions asked: ${chapter.pyqData.total}
- Post-2020 (HIGH PRIORITY): ${chapter.pyqData.postCovid}
- Trending concepts: ${chapter.pyqData.trendingConcepts.join(', ')}

---
💡 Focus on post-2020 PYQs for exam pattern!`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={selectedChapter ? () => setSelectedChapter(null) : onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">
          {selectedChapter ? selectedChapter.name : '1-Page Notes'}
        </h2>
      </div>

      {!selectedChapter ? (
        <>
          {/* Subject Tabs */}
          <div className="flex gap-2">
            {(['physics', 'chemistry', 'maths'] as Subject[]).map((subject) => (
              <Button
                key={subject}
                variant={activeSubject === subject ? 'default' : 'outline'}
                onClick={() => setActiveSubject(subject)}
                className={cn(
                  'capitalize',
                  activeSubject === subject && subjectColors[subject]
                )}
              >
                {subject}
              </Button>
            ))}
          </div>

          {/* Chapter List */}
          <div className="grid gap-3 max-h-[55vh] overflow-y-auto pr-2">
            {getChapters().map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => generateNotes(chapter)}
                className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{chapter.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {chapter.topics.length} topics • {chapter.keyFormulas.length} formulas
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Generated Notes */
        <div className="bg-card border border-border rounded-xl p-6 max-h-[65vh] overflow-y-auto">
          {isGenerating && notes === '' ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Generating notes...</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {notes.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-xl font-bold mt-0 mb-4">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-lg font-semibold mt-6 mb-3 text-primary">{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-base font-medium mt-4 mb-2">{line.slice(4)}</h3>;
                }
                if (line.startsWith('• ') || line.startsWith('- ')) {
                  return <p key={i} className="ml-4 my-1">• {line.slice(2)}</p>;
                }
                if (line.startsWith('⚡')) {
                  return <p key={i} className="ml-4 my-1 text-setu-saffron">{line}</p>;
                }
                if (line.startsWith('---')) {
                  return <hr key={i} className="my-4 border-border" />;
                }
                if (line.trim()) {
                  return <p key={i} className="my-2">{line}</p>;
                }
                return null;
              })}
              {isGenerating && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnePageNotes;
