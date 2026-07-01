import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RefreshCw, Loader2, BookOpen, Search, Filter, Book, Flame, Zap, CircleCheck, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getChaptersBySubject, Chapter } from '@/data/syllabus';
import { neetPhysicsChapters, neetChemistryChapters, neetBiologyChapters } from '@/data/neetSyllabus';
import { getAllCuetChapters } from '@/data/cuetSyllabus';
import { PremiumChapterCard } from './PremiumChapterCard';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface FormulaSheetProps {
  onBack: () => void;
}

const FormulaSheet: React.FC<FormulaSheetProps> = ({ onBack }) => {
  const { isNeet, isCuet } = useExamMode();
  const { language } = useLanguage();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = !!session?.user; 

  const getSubjects = (): { key: string; label: string }[] => {
    if (isCuet) return [
      { key: 'economics', label: 'Economics' }, { key: 'accountancy', label: 'Accountancy' },
      { key: 'general_test', label: 'General Test' }, { key: 'english', label: 'English' },
      { key: 'business_studies', label: 'Business Studies' },
    ];
    if (isNeet) return [
      { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'biology', label: 'Biology' },
    ];
    return [
      { key: 'physics', label: 'Physics' }, { key: 'chemistry', label: 'Chemistry' }, { key: 'maths', label: 'Maths' },
    ];
  };

  const subjects = getSubjects();
  const [activeSubject, setActiveSubject] = useState<string>(subjects[0].key);
  
  // State
  const [dbMetadata, setDbMetadata] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const getSyllabusChapters = (): Chapter[] => {
    if (isCuet) return getAllCuetChapters().filter(c => c.subject === activeSubject) as Chapter[];
    if (isNeet) {
       if (activeSubject === 'physics') return neetPhysicsChapters as Chapter[];
       if (activeSubject === 'chemistry') return neetChemistryChapters as Chapter[];
       if (activeSubject === 'biology') return neetBiologyChapters as Chapter[];
    }
    return getChaptersBySubject(activeSubject as any);
  };

  const syllabusChapters = getSyllabusChapters();

  const fetchChapterMetadata = async (subject: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('revision_chapter_metadata')
        .select('*')
        .eq('subject', subject);

      if (error) throw error;
      
      const metadataMap: Record<string, any> = {};
      data?.forEach(row => {
        metadataMap[row.chapter_name.toLowerCase()] = row;
      });
      setDbMetadata(metadataMap);
    } catch (err) {
      console.error("Failed to fetch chapter metadata:", err);
      toast.error("Could not load formula library.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapterMetadata(activeSubject);
  }, [activeSubject]);

  const generateAIFormulas = async (subject: string, chapter: string) => {
    setIsGenerating(chapter);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-revision-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'formulas',
          subject,
          chapter,
          examMode: isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');
      
      toast.success(`Knowledge base updated for ${chapter}!`);
      await fetchChapterMetadata(activeSubject);
      
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error(`Could not generate formulas for ${chapter}.`);
    } finally {
      setIsGenerating(null);
    }
  };

  // Memoized Global Statistics
  const globalStats = useMemo(() => {
    let totalFormulas = 0;
    let mustKnow = 0;
    let totalTime = 0;
    let generatedCount = 0;

    Object.values(dbMetadata).forEach(meta => {
      totalFormulas += meta.formula_count || 0;
      mustKnow += meta.high_priority_formula_count || 0;
      totalTime += meta.revision_time_mins || 0;
      generatedCount += 1;
    });

    const avgTime = generatedCount > 0 ? Math.round(totalTime / generatedCount) : 0;

    return { totalFormulas, mustKnow, avgTime, generatedCount };
  }, [dbMetadata]);

  // Memoized Filters
  const filteredChapters = useMemo(() => {
    return syllabusChapters.filter(chapter => {
      const meta = dbMetadata[chapter.name.toLowerCase()];
      
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!chapter.name.toLowerCase().includes(q)) return false;
      }

      // Filter
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Most Important') return chapter.weightage === 'High';
      if (activeFilter === 'Quick Revision') return meta && meta.revision_time_mins < 10;
      if (activeFilter === 'Needs Generation') return !meta;
      if (activeFilter === 'Generated') return !!meta;
      
      return true;
    });
  }, [syllabusChapters, dbMetadata, searchQuery, activeFilter]);

  const filterOptions = ['All', 'Most Important', 'Quick Revision', 'Generated', 'Needs Generation'];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="bg-white shadow-sm border border-gray-100 hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{isCuet ? 'Key Concepts Library' : 'Formula Library'}</h2>
            <p className="text-gray-500 font-medium mt-1 text-sm">Premium curated knowledge base for {subjects.find(s => s.key === activeSubject)?.label}</p>
          </div>
        </div>
      </div>

      {/* Global Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Book className="w-5 h-5" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900 leading-none">{globalStats.totalFormulas}</div>
            <div className="text-xs font-bold text-gray-400 uppercase mt-1">Total Formulas</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Star className="w-5 h-5" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900 leading-none">{globalStats.mustKnow}</div>
            <div className="text-xs font-bold text-gray-400 uppercase mt-1">Must Know</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><Clock className="w-5 h-5" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900 leading-none">{globalStats.avgTime}m</div>
            <div className="text-xs font-bold text-gray-400 uppercase mt-1">Avg Revision</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><CircleCheck className="w-5 h-5" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900 leading-none">{globalStats.generatedCount}<span className="text-gray-300 text-lg">/{syllabusChapters.length}</span></div>
            <div className="text-xs font-bold text-gray-400 uppercase mt-1">Chapters Ready</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex gap-2 p-1 bg-gray-100/50 rounded-full border border-gray-200/50">
          {subjects.map((subject) => (
            <button
              key={subject.key}
              onClick={() => setActiveSubject(subject.key)}
              className={cn(
                "rounded-full transition-all duration-300 font-semibold px-6 py-2 text-sm",
                activeSubject === subject.key 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {subject.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search chapters..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200 shadow-sm rounded-full"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(opt => (
          <Button
            key={opt}
            size="sm"
            variant="outline"
            onClick={() => setActiveFilter(opt)}
            className={cn(
              "rounded-full text-xs font-medium border-gray-200 transition-all shadow-sm",
              activeFilter === opt 
                ? "bg-gray-900 text-white border-transparent hover:bg-gray-800" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {opt}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
             <div key={i} className="h-64 bg-white border border-gray-100 rounded-[18px] animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-gray-500 font-medium">No chapters match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredChapters.map((chapter) => {
            const meta = dbMetadata[chapter.name.toLowerCase()];
            
            return (
              <PremiumChapterCard
                key={chapter.id || chapter.name}
                chapter={chapter}
                meta={meta}
                isAdmin={isAdmin}
                isGenerating={isGenerating === chapter.name}
                onGenerate={() => generateAIFormulas(activeSubject, chapter.name)}
                onClick={() => {
                  if (meta) {
                    navigate(`/revision/formulas/${activeSubject}/${encodeURIComponent(chapter.name)}`);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormulaSheet;
