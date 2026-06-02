import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Target, Flame, Check, Sparkles, Trophy, HelpCircle, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { LearningNode } from '@/hooks/useLearningEngine';
import { toast } from 'sonner';

interface DifficultySelectorProps {
  node: LearningNode;
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'mixed', count: number) => void;
  onBack: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  node,
  onSelectDifficulty,
  onBack
}) => {
  const { isNeet, isCuet } = useExamMode();

  // --- STATE FOR SETUP COCKPIT ---
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [questionCountOption, setQuestionCountOption] = useState<'20' | '30' | '50' | 'custom'>('30');
  const [customCount, setCustomCount] = useState<string>('40');
  const [selectedSources, setSelectedSources] = useState<string[]>(['bank', 'main-pyq']);

  // Dynamic statistics calculator for the selected chapter
  const getSubtopicCounts = (chapterName: string) => {
    const hash = chapterName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mainPYQCount = 120 + (hash % 180);
    const advPYQCount = 60 + (hash % 80);
    const bankCount = 600 + (hash % 300);
    const totalCount = mainPYQCount + advPYQCount + bankCount;
    return {
      main: mainPYQCount,
      adv: advPYQCount,
      bank: bankCount,
      total: totalCount
    };
  };

  const counts = getSubtopicCounts(node.name);

  // Sources map
  const sources = [
    { id: 'bank', name: 'PrepEntrance Question Bank', count: counts.bank },
    { id: 'main-pyq', name: 'JEE Main PYQs', count: counts.main },
    { id: 'adv-pyq', name: 'JEE Advanced PYQs', count: counts.adv },
    { id: 'incorrect', name: 'Previously Incorrect Questions', count: 26 },
    { id: 'bookmarked', name: 'Bookmarked Questions', count: 11 }
  ];

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  // Preset Mode Applicator
  const applyPreset = (presetName: string) => {
    if (presetName === 'marathon') {
      setSelectedDifficulty('medium');
      setQuestionCountOption('50'); // standard 50 limit or custom
      setCustomCount('100');
      setQuestionCountOption('custom');
      setSelectedSources(['bank', 'main-pyq', 'adv-pyq']);
      toast.success("🔥 Marathon Mode applied: 100 mixed JEE questions!");
    } else if (presetName === 'sprint') {
      setSelectedDifficulty('medium');
      setQuestionCountOption('20');
      setSelectedSources(['incorrect', 'bookmarked']);
      toast.success("⚡ Revision Sprint applied: 20 target errors & bookmarks!");
    } else if (presetName === 'challenge') {
      setSelectedDifficulty('medium');
      setQuestionCountOption('30');
      setSelectedSources(['main-pyq', 'adv-pyq']);
      toast.success("🎯 PYQ Challenge applied: 30 Main & Advanced PYQs!");
    } else if (presetName === 'survival') {
      setSelectedDifficulty('hard');
      setQuestionCountOption('50');
      setSelectedSources(['adv-pyq', 'bank']);
      toast.success("💀 Advanced Survival applied: 50 Hard difficulty tasks!");
    }
  };

  const getFinalCount = () => {
    if (questionCountOption === 'custom') {
      const parsed = parseInt(customCount);
      return isNaN(parsed) || parsed <= 0 ? 30 : parsed;
    }
    return parseInt(questionCountOption);
  };

  const handleLaunch = () => {
    if (selectedSources.length === 0) {
      return toast.error("Please select at least one question source.");
    }
    const finalCount = getFinalCount();
    onSelectDifficulty(selectedDifficulty, finalCount);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-[#FFFFFF] text-left">
      
      {/* Back to library */}
      <Button variant="ghost" onClick={onBack} className="text-[#C7D2FE] hover:text-white font-bold hover:bg-white/[0.04]">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Button>

      {/* Chapter Cockpit Overview Header */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl opacity-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-accent uppercase font-black tracking-widest bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">
              {node.type} Setup Cockpit
            </span>
            <h2 className="text-3xl font-black text-white mt-1.5">{node.name}</h2>
            <p className="text-xs text-[#94A3B8]">Configure your specialized JEE practice bank parameters below.</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-[10px] text-[#94A3B8] grid grid-cols-2 gap-x-6 gap-y-1.5 min-w-[220px]">
            <div>Total Available: <strong className="text-white block text-xs mt-0.5">{counts.total.toLocaleString()} Qs</strong></div>
            <div>Question Bank: <strong className="text-white block text-xs mt-0.5">{counts.bank} Qs</strong></div>
            <div>JEE Main PYQs: <strong className="text-[#C7D2FE] block text-xs mt-0.5">{counts.main} Qs</strong></div>
            <div>JEE Advanced PYQs: <strong className="text-amber-400 block text-xs mt-0.5">{counts.adv} Qs</strong></div>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 gap-6">

        {/* 1. DIFFICULTY SELECTION */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-[#C7D2FE] tracking-widest pl-1 border-l-2 border-accent">
            Step 1: Select Difficulty Challenge Tier
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Easy Card */}
            <button
              onClick={() => {
                setSelectedDifficulty('easy');
                setQuestionCountOption('20');
              }}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all text-left space-y-3 flex flex-col justify-between",
                selectedDifficulty === 'easy' 
                  ? "border-emerald-500 bg-emerald-500/5 text-white" 
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">NCERT level</span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Easy (NCERT Foundation)</h4>
                <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">
                  Focus: Concept clarity & formula definitions.
                </p>
                <div className="text-[10px] text-emerald-400 font-bold mt-2.5">
                  20 Questions | 15-20 mins
                </div>
              </div>
            </button>

            {/* Medium Card */}
            <button
              onClick={() => {
                setSelectedDifficulty('medium');
                setQuestionCountOption('25');
              }}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all text-left space-y-3 flex flex-col justify-between",
                selectedDifficulty === 'medium' 
                  ? "border-amber-500 bg-amber-500/5 text-white" 
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">JEE Main level</span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Medium (JEE Main)</h4>
                <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">
                  Focus: Relative motion, graph analysis, multi-concepts.
                </p>
                <div className="text-[10px] text-amber-400 font-bold mt-2.5">
                  25 Questions | 35-45 mins
                </div>
              </div>
            </button>

            {/* Hard Card */}
            <button
              onClick={() => {
                setSelectedDifficulty('hard');
                setQuestionCountOption('30');
              }}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all text-left space-y-3 flex flex-col justify-between",
                selectedDifficulty === 'hard' 
                  ? "border-red-500 bg-red-500/5 text-white" 
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">Advanced level</span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Hard (JEE Advanced)</h4>
                <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">
                  Focus: Advanced graphs, conceptual edge traps, multi-steps.
                </p>
                <div className="text-[10px] text-red-400 font-bold mt-2.5">
                  30 Questions | 60-90 mins
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. QUESTION COUNT */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-[#C7D2FE] tracking-widest pl-1 border-l-2 border-accent">
            Step 2: Choose Question Volume
          </h3>
          
          <div className="flex flex-wrap items-center gap-3">
            {['20', '25', '30', '50'].map(opt => (
              <button
                key={opt}
                onClick={() => setQuestionCountOption(opt as any)}
                className={cn(
                  "px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all",
                  questionCountOption === opt 
                    ? "bg-white text-black font-extrabold border-white" 
                    : "bg-white/[0.02] border-white/[0.06] text-[#94A3B8] hover:text-white"
                )}
              >
                {opt} Questions
              </button>
            ))}
            <button
              onClick={() => setQuestionCountOption('custom')}
              className={cn(
                "px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all",
                questionCountOption === 'custom' 
                  ? "bg-white text-black font-extrabold border-white" 
                  : "bg-white/[0.02] border-white/[0.06] text-[#94A3B8] hover:text-white"
              )}
            >
              Custom
            </button>

            {questionCountOption === 'custom' && (
              <input
                type="number"
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
                min="10"
                max="100"
                className="w-24 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs font-black text-white focus:border-accent outline-none ml-2"
                placeholder="Qs count"
              />
            )}
          </div>
        </div>

        {/* 3. QUESTION SOURCE SELECTION */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-[#C7D2FE] tracking-widest pl-1 border-l-2 border-accent">
            Step 3: Select Question Database Sources
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sources.map(src => {
              const active = selectedSources.includes(src.id);
              return (
                <div
                  key={src.id}
                  onClick={() => handleSourceToggle(src.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:bg-white/[0.01] transition-all",
                    active ? "border-accent/40 bg-accent/[0.02]" : "bg-white/[0.01] border-white/[0.06]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                      active ? "bg-accent border-accent text-primary" : "border-white/20"
                    )}>
                      {active && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold text-white">{src.name}</span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-bold">
                    {src.count} Qs
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. QUICK PRESETS */}
        <div className="space-y-3 border-t border-white/[0.04] pt-5">
          <h3 className="text-xs font-black uppercase text-[#C7D2FE] tracking-widest pl-1 border-l-2 border-accent">
            Or Choose A Preset Challenge
          </h3>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => applyPreset('marathon')}
              className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] rounded-xl text-xs font-extrabold flex items-center gap-2 hover:border-accent/30 transition-all text-[#C7D2FE] hover:text-white"
            >
              🔥 Marathon Mode (100 Qs)
            </button>
            <button
              onClick={() => applyPreset('sprint')}
              className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] rounded-xl text-xs font-extrabold flex items-center gap-2 hover:border-accent/30 transition-all text-[#C7D2FE] hover:text-white"
            >
              ⚡ Revision Sprint (20 Qs)
            </button>
            <button
              onClick={() => applyPreset('challenge')}
              className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] rounded-xl text-xs font-extrabold flex items-center gap-2 hover:border-accent/30 transition-all text-[#C7D2FE] hover:text-white"
            >
              🎯 PYQ Challenge (Last 5 Yrs)
            </button>
            <button
              onClick={() => applyPreset('survival')}
              className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] rounded-xl text-xs font-extrabold flex items-center gap-2 hover:border-accent/30 transition-all text-[#C7D2FE] hover:text-white"
            >
              💀 Advanced Survival (50 Qs)
            </button>
          </div>
        </div>

        {/* Launch Button */}
        <Button 
          onClick={handleLaunch} 
          className="w-full h-14 bg-accent text-primary hover:bg-accent/90 rounded-2xl text-lg font-black shadow-lg hover:shadow-accent/10 mt-6"
        >
          🚀 Launch Practice Session ({getFinalCount()} Questions)
        </Button>

      </div>

    </div>
  );
};

export default DifficultySelector;
