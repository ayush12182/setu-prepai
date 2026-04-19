import React, { useState, useEffect } from 'react';
import { useLearningEngine, LearningNode } from '@/hooks/useLearningEngine';
import { useExamMode } from '@/contexts/ExamModeContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Target, Zap, BookOpen, Atom, FlaskConical, Calculator, Dna, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PracticeTreeExplorerProps {
  onSelectNode: (node: LearningNode) => void;
}

const subjectIconMap: Record<string, any> = {
  physics: Atom,
  chemistry: FlaskConical,
  maths: Calculator,
  biology: Dna,
};

const subjectColorMap: Record<string, string> = {
  physics: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
  chemistry: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
  maths: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
  biology: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20',
};

const NodeItem: React.FC<{ 
  node: LearningNode; 
  level: number;
  onSelect: (node: LearningNode) => void;
}> = ({ node, level, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<LearningNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchNodes } = useLearningEngine(node.exam_type);

  const toggleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded && children.length === 0) {
      setLoading(true);
      const data = await fetchNodes(node.id);
      setChildren(data);
      setLoading(false);
    }
    setIsExpanded(!isExpanded);
  };

  const isLeaf = node.type === 'subtopic';

  return (
    <div className={cn("rounded-xl border border-transparent transition-all", isExpanded && "border-border bg-secondary/10 mb-2")}>
      <div 
        onClick={toggleExpand}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors rounded-xl group",
          level === 0 && "py-4 bg-card border border-border"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            isExpanded ? "bg-accent text-primary" : "bg-accent/10 text-accent group-hover:bg-accent/20"
          )}>
            {level === 0 ? (
              React.createElement(subjectIconMap[node.name.toLowerCase()] || BookOpen, { size: 18 })
            ) : isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </div>
          <div>
            <p className={cn("font-bold text-foreground", level === 0 ? "text-lg" : "text-sm")}>{node.name}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{node.type}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-primary transition-all opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(node);
            }}
          >
            Start Practice
          </Button>
          {!isLeaf && (
            <div className="text-muted-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && children.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-6 pr-2 pb-2"
          >
            {children.map(child => (
              <NodeItem key={child.id} node={child} level={level + 1} onSelect={onSelect} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PracticeTreeExplorer: React.FC<PracticeTreeExplorerProps> = ({ onSelectNode }) => {
  const { isNeet, isCuet } = useExamMode();
  const examType = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';
  const { fetchNodes, loading, error } = useLearningEngine(examType);
  const [subjects, setSubjects] = useState<LearningNode[]>([]);

  useEffect(() => {
    fetchNodes(null).then(setSubjects);
  }, [examType]);

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Mapping your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-destructive/10 border border-destructive/20 text-center">
        <p className="text-destructive font-bold mb-2">Error loading syllabus</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-foreground mb-2">Flexible Learning Engine</h2>
        <p className="text-muted-foreground">Choose any unit, chapter, or topic to start an adaptive session.</p>
      </div>

      <div className="space-y-4">
        {subjects.map(subject => (
          <NodeItem key={subject.id} node={subject} level={0} onSelect={onSelectNode} />
        ))}
      </div>
    </div>
  );
};
