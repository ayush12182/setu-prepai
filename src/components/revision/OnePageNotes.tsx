import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/neetSyllabus';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';

interface OnePageNotesProps {
  onBack: () => void;
}

type SubjectFilter = 'all' | 'physics' | 'chemistry' | 'maths' | 'botany' | 'zoology';

const OnePageNotes: React.FC<OnePageNotesProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<SubjectFilter>('all');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { language } = useLanguage();

  const allChapters = {
    physics: physicsChapters,
    chemistry: chemistryChapters,
    maths: mathsChapters
  };

  const { isNeet } = useExamMode();

  const getSubSubjects = () => {
    // Split NEET Biology into Botany and Zoology
    const botanyChapters = neetBiologyChapters.filter(c =>
      ['neet-bio-1', 'neet-bio-3', 'neet-bio-4', 'neet-bio-5', 'neet-bio-9'].includes(c.id)
    );
    const zoologyChapters = neetBiologyChapters.filter(c =>
      ['neet-bio-2', 'neet-bio-6', 'neet-bio-7', 'neet-bio-8', 'neet-bio-10'].includes(c.id)
    );
    return { botanyChapters, zoologyChapters };
  };

  const getFilteredChapters = () => {
    if (activeFilter === 'all') {
      if (isNeet) {
        const { botanyChapters, zoologyChapters } = getSubSubjects();
        return [
          { subject: 'Physics', chapters: neetPhysicsChapters, color: 'border-physics' },
          { subject: 'Chemistry', chapters: neetChemistryChapters, color: 'border-chemistry' },
          { subject: 'Botany', chapters: botanyChapters, color: 'border-emerald-500' },
          { subject: 'Zoology', chapters: zoologyChapters, color: 'border-orange-500' }
        ];
      }
      return [
        { subject: 'Physics', chapters: physicsChapters, color: 'border-physics' },
        { subject: 'Chemistry', chapters: chemistryChapters, color: 'border-chemistry' },
        { subject: 'Maths', chapters: mathsChapters, color: 'border-maths' }
      ];
    }

    const { botanyChapters, zoologyChapters } = getSubSubjects();

    const subjectMap: Record<string, any> = {
      physics: { subject: 'Physics', chapters: isNeet ? neetPhysicsChapters : physicsChapters, color: 'border-physics' },
      chemistry: { subject: 'Chemistry', chapters: isNeet ? neetChemistryChapters : chemistryChapters, color: 'border-chemistry' },
      maths: { subject: 'Maths', chapters: mathsChapters, color: 'border-maths' },
      botany: { subject: 'Botany', chapters: botanyChapters, color: 'border-emerald-500' },
      zoology: { subject: 'Zoology', chapters: zoologyChapters, color: 'border-orange-500' }
    };

    return subjectMap[activeFilter] ? [subjectMap[activeFilter]] : [];
  };

  const subjectBadgeColors: Record<string, string> = {
    physics: 'bg-physics/10 text-physics',
    chemistry: 'bg-chemistry/10 text-chemistry',
    maths: 'bg-maths/10 text-maths',
    biology: 'bg-emerald-500/10 text-emerald-500', // Default fallback
    botany: 'bg-emerald-500/10 text-emerald-500',
    zoology: 'bg-orange-500/10 text-orange-500'
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
          examTips: chapter.examTips,
          pyqData: chapter.pyqData,
          pyqData: chapter.pyqData,
          language,
          examMode: isNeet ? 'NEET' : 'JEE'
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
      toast.error('Failed to generate notes. Showing offline version.');

      // Fallback to local notes
      const fallbackNotes = generateFallbackNotes(chapter);
      setNotes(fallbackNotes);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackNotes = (chapter: Chapter): string => {
    // Keep formulas in standard notation, just ensure basic readability
    const formattedFormulas = chapter.keyFormulas.map(f => {
      return f.replace(/=/g, ' = '); // Just ensure spacing around equals
    });

    const examName = isNeet ? 'NEET' : 'JEE';
    const biologyContext = 'Yeh chapter biology ka foundation hai. NEET mein line-by-line NCERT se questions aate hain. Diagrams aur examples ratt lo.';

    let subjectContext = '';
    if (chapter.subject === 'physics') {
      subjectContext = `Yeh chapter physics ke core concepts cover karta hai. ${examName} mein direct questions aate hain, especially numerical type.`;
    } else if (chapter.subject === 'chemistry') {
      subjectContext = `Is chapter mein important reactions aur concepts hain jo ${examName} mein regularly pooche jaate hain.`;
    } else if (chapter.subject === 'maths') {
      subjectContext = 'Mathematics ka yeh chapter problem solving ke liye bahut important hai. Formulas yaad karo aur practice karo.';
    } else {
      subjectContext = biologyContext;
    }

    return `${chapter.name.toUpperCase()}

What this chapter is about
${subjectContext}

Chapter syllabus (exam-oriented)
${chapter.topics.map(t => `- ${t}`).join('\n')}

What ${examName} actually asks from this chapter
Post-2020 mein ${chapter.pyqData.postCovid} questions aaye hain is chapter se. Trending concepts: ${chapter.pyqData.trendingConcepts.join(', ')}.

Core ideas you must remember
${chapter.topics.slice(0, 5).map(t => `- ${t} ka basic concept samjho`).join('\n')}

Key formulas / Concepts
${formattedFormulas.length > 0 ? formattedFormulas.map(f => `- ${f}`).join('\n') : 'No specific formulas. Focus on definitions and diagrams.'}

Common mistakes students make
${chapter.examTips.map(t => `- ${t}`).join('\n')}

PYQ focus (Post-COVID priority)
- 2020-2025: ${chapter.pyqData.postCovid} questions (HIGH PRIORITY)
- Total questions: ${chapter.pyqData.total}
- Focus areas: ${chapter.pyqData.trendingConcepts.join(', ')}

How to revise in last 24 hours
1. Pehle saare concepts/formulas ek baar likh ke dekho
2. Previous 5 years ke PYQs solve karo
3. Common mistakes wali list dekh lo

Beta, itna clear ho gaya na? Ab PYQs lagao, bas wahi exam hai.`;
  };

  const renderNotes = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold mt-0 mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold mt-6 mb-3 text-primary">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-medium mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        return <p key={i} className="ml-4 my-1">• {line.slice(2)}</p>;
      }
      if (line.startsWith('⚡') || line.startsWith('💡')) {
        return <p key={i} className="ml-4 my-1 text-setu-saffron font-medium">{line}</p>;
      }
      if (line.startsWith('---')) {
        return <hr key={i} className="my-4 border-border" />;
      }
      if (line.match(/^\d+\./)) {
        return <p key={i} className="ml-4 my-1">{line}</p>;
      }
      if (line.trim()) {
        return <p key={i} className="my-2">{line}</p>;
      }
      return <br key={i} />;
    });
  };

  // Viewing generated notes for a chapter
  if (selectedChapter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedChapter(null); setNotes(''); }}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{selectedChapter.name}</h2>
            <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize',
              subjectBadgeColors[selectedChapter.subject] || subjectBadgeColors['biology']
            )}>
              {selectedChapter.subject}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 max-h-[70vh] overflow-y-auto">
          {isGenerating && notes === '' ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Generating comprehensive notes...</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {renderNotes(notes)}
              {isGenerating && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chapter selection view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">1-Page Notes</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(isNeet
          ? ['all', 'physics', 'chemistry', 'botany', 'zoology'] as SubjectFilter[]
          : ['all', 'physics', 'chemistry', 'maths'] as SubjectFilter[]
        ).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="capitalize"
          >
            {filter === 'all' ? 'All Chapters' : filter}
          </Button>
        ))}
      </div>

      {/* Chapters by Subject */}
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
        {getFilteredChapters().map((group) => (
          <div key={group.subject}>
            <h3 className={cn(
              'font-semibold text-lg mb-4 pb-2 border-b-2',
              group.color
            )}>
              {group.subject} ({group.chapters.length} chapters)
            </h3>
            <div className="grid gap-3">
              {group.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => generateNotes(chapter)}
                  className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{chapter.name}</h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          chapter.weightage === 'High' ? 'bg-red-500/10 text-red-500' :
                            chapter.weightage === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-green-500/10 text-green-500'
                        )}>
                          {chapter.weightage}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {chapter.topics.length} topics • {chapter.keyFormulas.length} formulas • {chapter.pyqData.postCovid} recent PYQs
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnePageNotes;
