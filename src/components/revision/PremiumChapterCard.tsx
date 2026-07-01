import React from 'react';
import { Star, Clock, Target, Sparkles, Bookmark, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chapter } from '@/data/syllabus';

interface PremiumChapterCardProps {
  chapter: Chapter;
  meta: any;
  isAdmin: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onClick: () => void;
}

export const PremiumChapterCard: React.FC<PremiumChapterCardProps> = ({
  chapter,
  meta,
  isAdmin,
  isGenerating,
  onGenerate,
  onClick
}) => {
  const isGenerated = !!meta;

  const colorStyles: Record<string, { badge: string; shadow: string }> = {
    physics: { badge: 'bg-blue-100 text-blue-700', shadow: 'hover:shadow-blue-500/10' },
    chemistry: { badge: 'bg-emerald-100 text-emerald-700', shadow: 'hover:shadow-emerald-500/10' },
    maths: { badge: 'bg-purple-100 text-purple-700', shadow: 'hover:shadow-purple-500/10' },
    biology: { badge: 'bg-rose-100 text-rose-700', shadow: 'hover:shadow-rose-500/10' },
  };

  const subjectKey = chapter.subject.toLowerCase();
  const style = colorStyles[subjectKey] || colorStyles.physics;

  const stars = chapter.weightage === 'High' ? 5 : chapter.weightage === 'Medium' ? 3 : 2;

  if (!isGenerated) {
    return (
      <div className="bg-white/50 border border-dashed border-gray-200 rounded-[18px] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group h-full min-h-[220px]">
        <h3 className="font-bold text-lg text-gray-400 mb-2">{chapter.name}</h3>
        <p className="text-xs text-gray-400 mb-4 px-4">Coming Soon...</p>
        
        {isAdmin && (
          <button 
            onClick={(e) => { e.stopPropagation(); onGenerate(); }}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full shadow-sm text-sm hover:bg-gray-50 transition-colors"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
            Generate Formula Library
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[18px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-500 flex flex-col relative overflow-hidden",
        "hover:-translate-y-1 hover:border-gray-200",
        style.shadow
      )}
    >
      {/* Premium Background Accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-gray-50 to-transparent rounded-full transition-transform duration-700 group-hover:scale-110 opacity-50" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
               <Star key={i} className={cn("w-3.5 h-3.5", i < stars ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200")} />
            ))}
          </div>
          
          <div className="flex gap-2">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", style.badge)}>
              {chapter.weightage} Weightage
            </span>
          </div>
        </div>

        {/* Chapter Name */}
        <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-5">
          {meta.chapter_name}
        </h3>

        {/* Big Numbers (Formulas & Must Know) */}
        <div className="flex gap-6 mb-6">
           <div className="flex flex-col">
             <span className="text-3xl font-black text-gray-900 tracking-tight leading-none">{meta.formula_count}</span>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Formulas</span>
           </div>
           <div className="w-px bg-gray-100" />
           <div className="flex flex-col">
             <span className="text-3xl font-black text-rose-500 tracking-tight leading-none">{meta.high_priority_formula_count}</span>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Must Know</span>
           </div>
        </div>

        {/* Sub-stats (Expected Qs, Revision Time, Difficulty) */}
        <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-50 mt-auto">
          <div className="flex flex-col">
             <span className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Target className="w-2.5 h-2.5"/> Qs</span>
             <span className="text-xs font-semibold text-gray-700">{meta.expected_questions}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> Time</span>
             <span className="text-xs font-semibold text-gray-700">{meta.revision_time_mins}m</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">Diff</span>
             <span className="text-xs font-semibold text-gray-700">{chapter.difficulty}</span>
          </div>
        </div>

        {/* Footer: Progress & Bookmark */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden max-w-[80px]">
               <div className="bg-emerald-400 h-full rounded-full" style={{ width: '0%' }} />
            </div>
            <span className="text-[10px] font-medium text-gray-400">0%</span>
          </div>
          <div className="flex gap-2">
            <Bookmark className="w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors" />
            <CircleCheck className="w-4 h-4 text-gray-300 hover:text-emerald-500 transition-colors" />
          </div>
        </div>

      </div>
    </div>
  );
};
