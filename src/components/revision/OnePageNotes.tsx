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

  const [activeTab, setActiveTab] = useState<'notes' | 'visual'>('notes');
  const [visualHtml, setVisualHtml] = useState<string>('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  const generateNotes = async (chapter: Chapter, mode: 'notes' | 'visual' = 'notes') => {
    setSelectedChapter(chapter);
    if (mode === 'notes') {
      setIsGeneratingNotes(true);
      setNotes('');
    } else {
      setIsGeneratingVisual(true);
      setVisualHtml('');
    }

    try {
      // Get user session token for Edge Function auth
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          chapterName: chapter.name,
          subject: chapter.subject,
          topics: chapter.topics,
          formulas: chapter.keyFormulas,
          examTips: chapter.examTips,
          pyqData: chapter.pyqData,
          language,
          examMode: isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
          mode
        }),
      });

      if (!response.ok) throw new Error('Failed to generate notes');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

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
                fullContent += content;
                if (mode === 'notes') {
                  setNotes(fullContent);
                } else {
                  setVisualHtml(fullContent);
                }
              }
            } catch { /* Skip invalid JSON */ }
          }
        }
      }
    } catch (error) {
      console.error(`Error generating ${mode}:`, error);
      toast.error(`Failed to generate ${mode === 'notes' ? 'revision notes' : 'visual formula sheet'}. Showing offline version.`);
      if (mode === 'notes') {
        const fallbackNotes = generateFallbackNotes(chapter);
        setNotes(fallbackNotes);
      } else {
        const fallbackHtml = generateFallbackVisualHtml(chapter);
        setVisualHtml(fallbackHtml);
      }
    } finally {
      if (mode === 'notes') {
        setIsGeneratingNotes(false);
      } else {
        setIsGeneratingVisual(false);
      }
    }
  };

  const generateFallbackVisualHtml = (chapter: Chapter): string => {
    const examName = isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE Main + Advanced';
    const cards = chapter.keyFormulas.map((f, i) => {
      let svg = '';
      if (i % 3 === 0) {
        svg = `<svg viewBox="0 0 120 60" width="100%" height="100%"><line x1="10" y1="30" x2="110" y2="30" stroke="#1a1a2e" stroke-width="1.5"/><line x1="10" y1="5" x2="10" y2="55" stroke="#1a1a2e" stroke-width="1.5"/><path d="M10,30 C35,0 35,0 60,30 C85,60 85,60 110,30" stroke="#FF6B00" stroke-width="2" fill="none"/></svg>`;
      } else if (i % 3 === 1) {
        svg = `<svg viewBox="0 0 120 60" width="100%" height="100%"><circle cx="60" cy="30" r="20" stroke="#1a1a2e" stroke-width="1.5" fill="none"/><line x1="60" y1="30" x2="80" y2="30" stroke="#FF6B00" stroke-width="2"/><text x="65" y="25" font-size="8" font-family="Plus Jakarta Sans" fill="#FF6B00">r</text></svg>`;
      } else {
        svg = `<svg viewBox="0 0 120 60" width="100%" height="100%"><line x1="20" y1="50" x2="90" y2="50" stroke="#1a1a2e" stroke-width="1.5"/><line x1="90" y1="50" x2="90" y2="10" stroke="#1a1a2e" stroke-width="1.5"/><line x1="20" y1="50" x2="90" y2="10" stroke="#FF6B00" stroke-width="2"/><text x="50" y="58" font-size="8" font-family="Plus Jakarta Sans" fill="#1a1a2e">R</text><text x="94" y="32" font-size="8" font-family="Plus Jakarta Sans" fill="#1a1a2e">X</text></svg>`;
      }

      return `
      <div class="card">
        <div>
          <div class="card-header">
            <div class="number-badge">${i + 1}</div>
            <div class="formula-name">${f.split('=')[0]?.trim() || 'Core Concept'}</div>
          </div>
          <div class="formula-body">
            <div class="formula-text">${f.replace(/=/g, ' = ')}</div>
            <div class="diagram-container">${svg}</div>
          </div>
        </div>
        <div class="meaning">
          Concept: Labeled parameters for ${chapter.name} curriculum. ⚠ Make sure you check dimensions and signs!
        </div>
      </div>`;
    }).join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #FDFAF4;
      --text-color: #1A1A2E;
      --accent-color: #FF6B00;
      --card-bg: #FFFFFF;
      --border-color: #E8E0D0;
      --muted-text: #5E5E7A;
    }
    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 24px;
      line-height: 1.5;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px dashed var(--border-color);
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    .logo {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 28px;
      color: var(--accent-color);
    }
    .title-area h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 24px;
      color: var(--text-color);
    }
    .meta-info {
      font-size: 13px;
      font-weight: 500;
      color: var(--muted-text);
      text-transform: uppercase;
    }
    .formula-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    @media (max-width: 768px) {
      .formula-grid { grid-template-columns: 1fr; }
    }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-left: 4px solid var(--accent-color);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .number-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--accent-color);
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 16px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }
    .formula-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 18px;
      font-weight: 700;
    }
    .formula-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }
    .formula-text {
      font-size: 20px;
      font-weight: 700;
      color: var(--accent-color);
    }
    .diagram-container {
      width: 120px;
      height: 60px;
    }
    .meaning {
      font-size: 13px;
      color: var(--muted-text);
      border-top: 1px solid #F5EFEB;
      padding-top: 10px;
      margin-top: auto;
    }
    footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 16px;
      border-top: 2px dashed var(--border-color);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      color: var(--muted-text);
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">PrepEntrance</div>
    <div class="title-area">
      <h1>${chapter.name} Formula Sheet</h1>
    </div>
    <div class="meta-info">${examName}</div>
  </header>
  <main class="formula-grid">
    ${cards}
  </main>
  <footer>setulearning.in</footer>
</body>
</html>`;
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

  const renderNotes = (content: string) =>
    processNotesContent(content, (line, key) => {
      const t = line.trim();
      if (t.startsWith('# '))  return <h1  key={key} className="text-xl font-bold mt-0 mb-4"><MathLine>{t.slice(2)}</MathLine></h1>;
      if (t.startsWith('## ')) return <h2  key={key} className="text-lg font-semibold mt-6 mb-3 text-primary"><MathLine>{t.slice(3)}</MathLine></h2>;
      if (t.startsWith('### ')) return <h3 key={key} className="text-base font-medium mt-4 mb-2"><MathLine>{t.slice(4)}</MathLine></h3>;
      if (t.startsWith('• ') || t.startsWith('- ') || t.startsWith('* ')) return <p key={key} className="ml-4 my-1">• <MathLine>{t.slice(2)}</MathLine></p>;
      if (t.startsWith('⚡') || t.startsWith('💡')) return <p key={key} className="ml-4 my-1 text-prepentrance-saffron font-medium"><MathLine>{t}</MathLine></p>;
      if (t.startsWith('---')) return <hr key={key} className="my-4 border-border" />;
      if (t.match(/^\d+\./)) return <p key={key} className="ml-4 my-1"><MathLine>{t}</MathLine></p>;
      if (t) return <p key={key} className="my-2"><MathLine>{t}</MathLine></p>;
      return <br key={key} />;
    });

  if (selectedChapter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedChapter(null); setNotes(''); setVisualHtml(''); setActiveTab('notes'); }}>
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

          <div className="flex bg-muted p-1 rounded-lg gap-1 border border-border">
            <Button
              variant={activeTab === 'notes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('notes')}
              className="flex items-center gap-1.5 text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Smart Revision Notes
            </Button>
            <Button
              variant={activeTab === 'visual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('visual');
                if (!visualHtml) {
                  generateNotes(selectedChapter, 'visual');
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Visual Formula Sheet
            </Button>
          </div>
        </div>

        {activeTab === 'notes' ? (
          <div className="bg-card border border-border rounded-xl p-6 max-h-[70vh] overflow-y-auto shadow-sm">
            {isGeneratingNotes && notes === '' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Generating comprehensive NCERT-aligned notes...</span>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderNotes(notes)}
                {isGeneratingNotes && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-0 h-[70vh] overflow-hidden relative shadow-sm">
            {isGeneratingVisual && visualHtml === '' ? (
              <div className="flex flex-col items-center justify-center h-full py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <span className="text-sm text-muted-foreground font-medium">Drawing handwritten visual cards & SVGs...</span>
              </div>
            ) : (
              <iframe
                srcDoc={visualHtml}
                className="w-full h-full border-none bg-[#FDFAF4]"
                title="Visual Formula Sheet"
                sandbox="allow-scripts"
              />
            )}
          </div>
        )}
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
