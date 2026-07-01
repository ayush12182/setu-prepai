import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, RefreshCw, Loader2 } from 'lucide-react';
import { PremiumFormulaCard } from './PremiumFormulaCard';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumFormulaViewProps {
  chapterId?: string;
  chapterName: string;
  subject: string;
  onBack: () => void;
  onRefresh?: () => void;
}

export const PremiumFormulaView: React.FC<PremiumFormulaViewProps> = ({ 
  chapterId,
  chapterName, 
  subject, 
  onBack, 
  onRefresh, 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string>('All');
  const [formulas, setFormulas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const isAdmin = !!session?.user;

  const fetchFormulas = async () => {
    if (!chapterId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('revision_formulas')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('importance', { ascending: false });

      if (error) throw error;
      setFormulas(data || []);
    } catch (err) {
      console.error("Failed to fetch formulas:", err);
      toast.error("Could not load formulas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, [chapterId]);

  // Extract unique topics from the formulas
  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    formulas.forEach(f => {
      if (f.topic) topicSet.add(f.topic);
    });
    return ['All', ...Array.from(topicSet)];
  }, [formulas]);

  // Filter formulas based on search and topic
  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      const matchesTopic = activeTopic === 'All' || f.topic === activeTopic;
      if (!matchesTopic) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      
      return (
        f.title?.toLowerCase().includes(q) ||
        f.latex?.toLowerCase().includes(q) ||
        f.used_for?.toLowerCase().includes(q) ||
        f.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
        f.variables?.some((v: any) => v.meaning.toLowerCase().includes(q))
      );
    });
  }, [formulas, activeTopic, searchQuery]);

  // Determine accent colors based on subject
  const subjectStr = subject.toLowerCase();
  const getSubjectColor = () => {
    if (subjectStr.includes('physics')) return 'blue';
    if (subjectStr.includes('chemistry')) return 'green';
    if (subjectStr.includes('math')) return 'purple';
    return 'blue';
  };
  
  const categoryColor = getSubjectColor();
  const subjectBadgeColor = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700'
  }[categoryColor];

  return (
    <div className="w-full bg-slate-50 min-h-screen -mt-6 -mx-6 md:-mt-8 md:-mx-8 p-6 md:p-8 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 bg-white shadow-sm border border-gray-100 hover:bg-gray-50">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {chapterName}
                </h1>
                <span className="text-gray-400 font-medium">—</span>
                <span className="text-xl font-medium text-gray-500">Formula Sheet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider", subjectBadgeColor)}>
                  {subject}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {formulas.length} formulas total
                </span>
              </div>
            </div>
          </div>
          
          {isAdmin && onRefresh && (
            <Button 
              variant="outline" 
              onClick={() => {
                onRefresh();
                // Optionally wait and re-fetch, though parent might re-mount or trigger re-fetch
              }}
              className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Fresh
            </Button>
          )}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center">
          
          {/* Topic Chips */}
          <div className="flex gap-2 flex-wrap flex-1">
            {topics.map(topic => {
              const count = topic === 'All' ? formulas.length : formulas.filter(f => f.topic === topic).length;
              return (
                <Button
                  key={topic}
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTopic(topic)}
                  className={cn(
                    "rounded-full transition-all text-xs border-transparent shadow-sm",
                    activeTopic === topic 
                      ? "bg-gray-900 text-white hover:bg-gray-800" 
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {topic} <span className={cn("ml-1.5 opacity-60", activeTopic === topic ? "text-gray-300" : "text-gray-400")}>({count})</span>
                </Button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search formula, variable..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-200 shadow-sm rounded-full"
            />
          </div>

        </div>

        {/* FORMULAS LIST */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
             <p className="text-gray-500 font-medium">Loading premium formula sheet...</p>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No formulas found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {filteredFormulas.map((formula, i) => (
              <PremiumFormulaCard 
                key={formula.id || `f-${i}`} 
                formula={formula} 
                categoryColor={categoryColor}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
