import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, CheckCircle2, BookmarkPlus, FolderPlus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParsedQuestionResult } from '@/lib/visionEngine';

interface AISolutionCardProps {
  data: ParsedQuestionResult;
  onClose: () => void;
}

export const AISolutionCard: React.FC<AISolutionCardProps> = ({ data, onClose }) => {
  return (
    <div className="bg-background flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto h-[80vh] overflow-hidden rounded-3xl border border-border shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-6 z-10 w-8 h-8 flex items-center justify-center bg-secondary/80 rounded-full hover:bg-secondary transition-colors font-bold text-foreground">
        ✕
      </button>

      {/* LEFT PANEL: Extracted Question */}
      <div className="w-full md:w-[40%] bg-card p-8 overflow-y-auto border-r border-border shrink-0 font-sans">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold font-display tracking-tight text-foreground">Extracted Question</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg uppercase tracking-widest">{data.subject}</span>
          <span className="px-3 py-1 bg-secondary border border-border text-foreground text-xs font-bold rounded-lg uppercase tracking-widest">{data.chapter}</span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-lg">Difficulty: {data.difficulty}/5</span>
        </div>

        <div className="p-6 bg-secondary/30 border border-border rounded-2xl text-lg text-foreground leading-relaxed shadow-inner">
          <p>{data.question_text}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-xs tracking-widest uppercase font-bold text-muted-foreground flex items-center gap-2 mb-3">
            <Tag size={14} /> AI Tagging
          </h3>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent font-bold text-sm rounded-xl">
              {data.concept_tag}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-border bg-secondary hover:border-accent hover:text-accent">
            <FolderPlus className="w-4 h-4 mr-2" /> Add to Question Bank
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-border bg-secondary hover:border-red-500 hover:text-red-500">
            <BookmarkPlus className="w-4 h-4 mr-2" /> Save to Error Journal
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: Solution Steps */}
      <div className="flex-1 bg-background p-8 overflow-y-auto relative">
         <h2 className="text-2xl font-bold font-display text-foreground mb-8 border-b border-border pb-4">Step-by-Step Solution</h2>
         
         <div className="space-y-6">
           {data.solution_steps.map((step, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.2 }}
               key={idx} 
               className="flex gap-4"
             >
               <div className="w-8 h-8 shrink-0 rounded-full bg-accent text-primary font-bold flex items-center justify-center mt-1 shadow-md">
                 {idx + 1}
               </div>
               <div className="flex-1 bg-card border border-border p-5 rounded-2xl">
                 <h4 className="font-bold text-foreground mb-2">{step.step}</h4>
                 <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{step.explanation}</p>
               </div>
             </motion.div>
           ))}
         </div>

         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: data.solution_steps.length * 0.2 }}
           className="mt-8"
         >
           <div className="bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-emerald-500/5">
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 mb-1 flex items-center gap-1"><CheckCircle2 size={14}/> Final Answer</p>
               <p className="text-2xl font-bold">{data.correct_answer}</p>
             </div>
             <div className="text-right">
               <p className="text-xs font-bold text-emerald-600/70 mb-1">Estimated Time</p>
               <p className="font-bold font-mono">{Math.floor(data.avg_time_seconds / 60)}:{(data.avg_time_seconds % 60).toString().padStart(2, '0')}s</p>
             </div>
           </div>
           
           <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex gap-4 text-amber-600 dark:text-amber-400">
             <AlertTriangle className="w-6 h-6 shrink-0" />
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-amber-600/70 mb-1 flex items-center gap-2">
                 Common {data.mistake_type} Mistake
               </p>
               <p className="font-medium text-sm leading-relaxed">{data.common_mistake}</p>
             </div>
           </div>
         </motion.div>
      </div>
    </div>
  );
};
