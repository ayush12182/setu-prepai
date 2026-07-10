import React, { useState } from 'react';
import { MathLine } from '@/utils/mathRenderer';
import { ChevronDown, ChevronRight, Star, AlertTriangle, Zap, Tag, BookOpen, Link, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PremiumFormulaData {
  id: string;
  title: string;
  latex: string;
  variables: { symbol: string; meaning: string; unit: string }[];
  used_for: string;
  difficulty: string;
  importance: number;
  jee_frequency: string;
  common_mistake?: string;
  shortcut?: string;
  derivation?: string;
  related_formulas?: string[];
  prerequisite_concepts?: string[];
  topic: string;
  tags?: string[];
}

interface PremiumFormulaCardProps {
  formula: PremiumFormulaData;
  categoryColor?: string;
}

export const PremiumFormulaCard: React.FC<PremiumFormulaCardProps> = ({ formula, categoryColor = 'blue' }) => {
  const [expanded, setExpanded] = useState(false);

  const colorStyles: Record<string, { border: string, bg: string, text: string, iconBg: string }> = {
    blue: { border: 'border-l-blue-500', bg: 'bg-white', text: 'text-blue-700', iconBg: 'bg-blue-50 text-blue-500' },
    green: { border: 'border-l-emerald-500', bg: 'bg-white', text: 'text-emerald-700', iconBg: 'bg-emerald-50 text-emerald-500' },
    purple: { border: 'border-l-purple-500', bg: 'bg-white', text: 'text-purple-700', iconBg: 'bg-purple-50 text-purple-500' },
    orange: { border: 'border-l-orange-500', bg: 'bg-white', text: 'text-orange-700', iconBg: 'bg-orange-50 text-orange-500' },
    red: { border: 'border-l-rose-500', bg: 'bg-white', text: 'text-rose-700', iconBg: 'bg-rose-50 text-rose-500' },
  };

  const style = colorStyles[categoryColor] || colorStyles.blue;

  const getDifficultyBadge = (diff: string) => {
    if (!diff) return 'bg-gray-100 text-gray-600';
    const d = diff.toLowerCase();
    if (d.includes('very high') || d.includes('hard')) return 'bg-rose-100 text-rose-600';
    if (d.includes('high')) return 'bg-orange-100 text-orange-600';
    if (d.includes('medium')) return 'bg-amber-100 text-amber-600';
    return 'bg-emerald-100 text-emerald-600';
  };

  return (
    <div className={cn(
      "bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group",
      "border-l-4", style.border
    )}>
      {/* Top Main Row */}
      <div 
        className="flex flex-col xl:flex-row p-5 gap-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Left: Icon, Title, Formula */}
        <div className="flex-1 min-w-[240px] flex gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", style.iconBg)}>
            <svg className="w-6 h-6 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-[15px] mb-2">{formula.title}</h4>
            <div className="text-xl font-medium text-gray-800">
              <MathLine>{`$${formula.latex.trim().replace(/^(\$\$|\$|\\\[|\\\()/, '').replace(/(\$\$|\$|\\\]|\\\))$/, '').trim()}$`}</MathLine>
            </div>
          </div>
        </div>

        {/* Center: Variables */}
        <div className="flex-1 min-w-[150px] xl:border-l xl:border-gray-100 xl:pl-6">
          <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase">Where,</p>
          <ul className="space-y-1">
            {formula.variables?.map((v, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>
                  <MathLine>{`$${v.symbol}$`}</MathLine> = {v.meaning} {v.unit ? `(${v.unit})` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Used For & Meta */}
        <div className="flex-1 min-w-[150px] xl:border-l xl:border-gray-100 xl:pl-6 relative flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase">Used For</p>
            <p className="text-sm text-gray-700 leading-snug">{formula.used_for}</p>
          </div>
          
          <div className="absolute top-0 right-0 flex items-center gap-3">
             <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", getDifficultyBadge(formula.difficulty))}>
               {formula.difficulty || 'Medium'}
             </span>
             <div className="flex gap-0.5">
               {Array.from({ length: 5 }).map((_, i) => (
                 <Star key={i} className={cn("w-3.5 h-3.5", i < (formula.importance || 3) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />
               ))}
             </div>
          </div>

          <div className="mt-4 flex justify-end items-center text-gray-400 group-hover:text-gray-600 transition-colors">
            <span className="text-[11px] font-medium mr-1">{expanded ? 'Hide Details' : 'View Details'}</span>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-2 duration-300 space-y-6">
          
          {/* Top Row of Expanded: Mistakes & Shortcuts */}
          <div className="flex flex-col md:flex-row gap-6">
            {formula.common_mistake && (
              <div className="flex-1 bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider">Common Mistake</h5>
                </div>
                <p className="text-sm text-rose-900/80">{formula.common_mistake}</p>
              </div>
            )}

            {formula.shortcut && (
              <div className="flex-1 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-amber-600">
                  <Zap className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider">Shortcut Trick</h5>
                </div>
                <p className="text-sm text-amber-900/80">{formula.shortcut}</p>
              </div>
            )}
          </div>

          {/* Bottom Row of Expanded: Derivation, Prerequisites & Related */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Derivation */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:col-span-1">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <BookOpen className="w-4 h-4" />
                <h5 className="font-bold text-xs uppercase tracking-wider">Derivation Note</h5>
              </div>
              <p className="text-sm text-gray-600 leading-snug">
                {formula.derivation || "Standard definition or fundamental law."}
              </p>
            </div>

            {/* Prerequisites & Related */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:col-span-1">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Library className="w-4 h-4" />
                <h5 className="font-bold text-xs uppercase tracking-wider">Prerequisites</h5>
              </div>
              {formula.prerequisite_concepts && formula.prerequisite_concepts.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
                  {formula.prerequisite_concepts.map(p => <li key={p}>{p}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">Basic arithmetic</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 md:col-span-1">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Link className="w-4 h-4" />
                <h5 className="font-bold text-xs uppercase tracking-wider">Related Formulas</h5>
              </div>
              {formula.related_formulas && formula.related_formulas.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
                  {formula.related_formulas.map(r => <li key={r}>{r}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">None mapped</p>
              )}
            </div>

          </div>

          {/* Metadata Footer */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200/50">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-400 uppercase">Topic:</span>
              <span className="text-sm font-semibold text-gray-700">{formula.topic}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">JEE Frequency:</span>
              <span className="text-sm font-semibold text-gray-700">{formula.jee_frequency || 'Medium'}</span>
            </div>
            {formula.tags && formula.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formula.tags.map(t => (
                  <span key={t} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
