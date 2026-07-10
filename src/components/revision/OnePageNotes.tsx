import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/neetSyllabus';
import { getAllCuetChapters, CUET_SUBJECTS } from '@/data/cuetSyllabus';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';
import { MathLine, processNotesContent } from '@/utils/mathRenderer';
import { RevisionRenderer } from './renderers/RevisionRenderer';

interface OnePageNotesProps {
  onBack: () => void;
}

const OnePageNotes: React.FC<OnePageNotesProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { language } = useLanguage();
  const { isNeet, isCuet, examMode } = useExamMode();

  const getSubSubjects = () => {
    const botanyChapters = neetBiologyChapters.filter(c =>
      ['neet-bio-1', 'neet-bio-3', 'neet-bio-4', 'neet-bio-5', 'neet-bio-9'].includes(c.id)
    );
    const zoologyChapters = neetBiologyChapters.filter(c =>
      ['neet-bio-2', 'neet-bio-6', 'neet-bio-7', 'neet-bio-8', 'neet-bio-10'].includes(c.id)
    );
    return { botanyChapters, zoologyChapters };
  };

  const getCuetGroups = () => {
    const allCuet = getAllCuetChapters();
    const groups: { subject: string; label: string; chapters: Chapter[]; color: string }[] = [];
    const subjectMap = new Map<string, Chapter[]>();

    allCuet.forEach(ch => {
      const key = ch.subject as string;
      if (!subjectMap.has(key)) subjectMap.set(key, []);
      subjectMap.get(key)!.push(ch);
    });

    const colorMap: Record<string, string> = {
      english: 'border-indigo-500',
      general_test: 'border-purple-500',
      economics: 'border-amber-500',
      accountancy: 'border-teal-500',
      business_studies: 'border-orange-500',
      political_science: 'border-rose-500',
      history: 'border-yellow-500',
      geography: 'border-cyan-500',
      psychology: 'border-pink-500',
      sociology: 'border-lime-500',
    };

    subjectMap.forEach((chapters, key) => {
      const meta = CUET_SUBJECTS.find(s => s.key === key);
      groups.push({
        subject: key,
        label: meta?.label || key,
        chapters,
        color: colorMap[key] || 'border-primary',
      });
    });

    return groups;
  };

  const getFilteredChapters = () => {
    if (isCuet) {
      const groups = getCuetGroups();
      if (activeFilter === 'all') return groups.map(g => ({ subject: g.label, chapters: g.chapters, color: g.color }));
      const match = groups.find(g => g.subject === activeFilter);
      return match ? [{ subject: match.label, chapters: match.chapters, color: match.color }] : [];
    }

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

  const getFilterTabs = (): { key: string; label: string }[] => {
    if (isCuet) {
      const groups = getCuetGroups();
      return [{ key: 'all', label: 'All Chapters' }, ...groups.map(g => ({ key: g.subject, label: g.label }))];
    }
    if (isNeet) {
      return [
        { key: 'all', label: 'All Chapters' },
        { key: 'physics', label: 'Physics' },
        { key: 'chemistry', label: 'Chemistry' },
        { key: 'botany', label: 'Botany' },
        { key: 'zoology', label: 'Zoology' },
      ];
    }
    return [
      { key: 'all', label: 'All Chapters' },
      { key: 'physics', label: 'Physics' },
      { key: 'chemistry', label: 'Chemistry' },
      { key: 'maths', label: 'Maths' },
    ];
  };

  const subjectBadgeColors: Record<string, string> = {
    physics: 'bg-physics/10 text-physics',
    chemistry: 'bg-chemistry/10 text-chemistry',
    maths: 'bg-maths/10 text-maths',
    biology: 'bg-emerald-500/10 text-emerald-500',
    botany: 'bg-emerald-500/10 text-emerald-500',
    zoology: 'bg-orange-500/10 text-orange-500',
    english: 'bg-indigo-500/10 text-indigo-500',
    general_test: 'bg-purple-500/10 text-purple-500',
    economics: 'bg-amber-500/10 text-amber-500',
    accountancy: 'bg-teal-500/10 text-teal-500',
    business_studies: 'bg-orange-500/10 text-orange-500',
    political_science: 'bg-rose-500/10 text-rose-500',
    history: 'bg-yellow-500/10 text-yellow-500',
    geography: 'bg-cyan-500/10 text-cyan-500',
    psychology: 'bg-pink-500/10 text-pink-500',
    sociology: 'bg-lime-500/10 text-lime-500',
  };

  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const [notesJson, setNotesJson] = useState<any>(null);

  const generateNotes = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsGeneratingNotes(true);
    setNotesJson(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const token = session?.access_token || anonKey;

      // READ-ONLY: Fetch published notes from permanent content repository
      // Students NEVER call generate-notes — only get-chapter-content
      const params = new URLSearchParams({
        chapterId: chapter.id,
        examType: isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
        language: language || 'english',
      });
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-chapter-content?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': anonKey,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          toast.info('Notes for this chapter are being prepared by our expert faculty. Check back soon!');
          setIsGeneratingNotes(false);
          setSelectedChapter(null);
          return;
        }
        throw new Error('Failed to fetch notes');
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        let parsedNotes = responseData.data;
        // The edge function returns the full database row. The JSON for OnePageNotes is stored in revision_notes.
        if (responseData.data.revision_notes) {
          parsedNotes = typeof responseData.data.revision_notes === 'string' 
            ? JSON.parse(responseData.data.revision_notes) 
            : responseData.data.revision_notes;
        } else if (responseData.data.raw_content) {
          try { parsedNotes = JSON.parse(responseData.data.raw_content); } catch (e) {}
        }
        setNotesJson(parsedNotes);
      } else {
        throw new Error('Invalid data received');
      }
    } catch (error) {
      console.error(`Error fetching notes:`, error);
      toast.error('Notes are not available yet. Our team is preparing them.');
      setSelectedChapter(null);
    } finally {
      setIsGeneratingNotes(false);
    }
  };


  const generateFallbackNotes = (chapter: Chapter): string => {
    const formattedFormulas = chapter.keyFormulas.map(f => f.replace(/=/g, ' = '));
    const examName = isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE';

    let subjectContext = '';
    if (isCuet) {
      subjectContext = `NCERT Class 12 based chapter. ${examName} mein direct definitions aur facts se questions aate hain. Focus on key terms and concepts.`;
    } else if (chapter.subject === 'physics') {
      subjectContext = `Yeh chapter physics ke core concepts cover karta hai. ${examName} mein direct questions aate hain, especially numerical type.`;
    } else if (chapter.subject === 'chemistry') {
      subjectContext = `Is chapter mein important reactions aur concepts hain jo ${examName} mein regularly pooche jaate hain.`;
    } else if (chapter.subject === 'maths') {
      subjectContext = 'Mathematics ka yeh chapter problem solving ke liye bahut important hai. Formulas yaad karo aur practice karo.';
    } else {
      subjectContext = `Yeh chapter biology ka foundation hai. ${examName} mein line-by-line NCERT se questions aate hain.`;
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
1. Pehle saare concepts ek baar likh ke dekho
2. Previous years ke questions solve karo
3. Common mistakes wali list dekh lo

Beta, itna clear ho gaya na? Ab practice karo, bas wahi exam hai.`;
  };

  const renderNotes = (content: string) => { return null; } // Deprecated text rendering

  if (selectedChapter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedChapter(null); setNotes(''); }}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold">{selectedChapter.name}</h2>
              <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize',
                subjectBadgeColors[selectedChapter.subject as string] || 'bg-primary/10 text-primary'
              )}>
                {CUET_SUBJECTS.find(s => s.key === selectedChapter.subject as string)?.label || selectedChapter.subject}
              </span>
            </div>
          </div>
        </div>

          <div className="bg-gradient-to-b from-[#111827] to-[#0A0F1C] border border-blue-500/10 rounded-2xl max-h-[75vh] overflow-y-auto shadow-2xl relative">
            {isGeneratingNotes && !notesJson ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Generating Premium Infographic...</h3>
                <p className="text-sm text-blue-400 max-w-sm text-center">Synthesizing formula SVGs, concept maps, and high-yield data into a JSON schema (5-10s).</p>
                {/* Simulated Shimmer Skeleton layout */}
                <div className="w-full max-w-4xl mt-12 space-y-6 opacity-30">
                   <div className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
                   <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-1 h-64 bg-white/5 rounded-2xl animate-pulse"></div>
                      <div className="col-span-2 h-64 bg-white/5 rounded-2xl animate-pulse"></div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {notesJson && <RevisionRenderer jsonOutput={notesJson} chapter={selectedChapter} />}
              </div>
            )}
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">1-Page Notes</h2>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        {getFilterTabs().map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "rounded-full transition-all duration-300 font-medium px-5",
              activeFilter === tab.key 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-transparent hover:shadow-xl hover:shadow-primary/30 hover:scale-105" 
                : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="space-y-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
        {getFilteredChapters().map((group, groupIdx) => (
          <div key={group.subject} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${groupIdx * 100}ms` }}>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="font-bold text-xl text-foreground">
                {group.subject}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground">
                {group.chapters.length} chapters
              </span>
              <div className={cn('h-px flex-1 bg-gradient-to-r to-transparent', group.color.replace('border-', 'from-'))} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => generateNotes(chapter)}
                  className="group relative flex flex-col text-left bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative flex-1 w-full">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-[15px] text-foreground leading-tight group-hover:text-primary transition-colors pr-2">
                        {chapter.name}
                      </h4>
                      <span className={cn(
                        'text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full shrink-0',
                        chapter.weightage === 'High' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                          chapter.weightage === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      )}>
                        {chapter.weightage}
                      </span>
                    </div>
                    
                    <p className="text-[13px] text-muted-foreground mb-4">
                      {chapter.topics.length} topics • {chapter.keyFormulas.length} formulas
                    </p>
                  </div>
                  
                  <div className="relative flex items-center justify-between w-full mt-auto pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      {chapter.pyqData.postCovid} PYQs
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-primary/10 px-3 py-1.5 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Notes
                      <ArrowRight className="w-3 h-3 ml-0.5" />
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
