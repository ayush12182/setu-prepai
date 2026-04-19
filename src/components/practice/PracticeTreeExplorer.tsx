import React, { useState, useEffect } from 'react';
import { useLearningEngine, LearningNode } from '@/hooks/useLearningEngine';
import { usePracticeStore } from '@/store/practiceStore';
import { ChevronRight, ChevronDown, BookOpen, Target, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NodeStabilityIndicator } from './IntelligenceIndicators';

const NodeItem: React.FC<{ 
  node: LearningNode; 
  level: number;
  onSelect: (node: LearningNode) => void;
}> = ({ node, level, onSelect }) => {
  const { expandedNodeIds, toggleNode, selectedNode } = usePracticeStore();
  const [children, setChildren] = useState<LearningNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchNodes } = useLearningEngine(node.exam_type);

  const isExpanded = expandedNodeIds.has(node.id);
  const isSelected = selectedNode?.id === node.id;
  const isLeaf = node.type === 'subtopic';

  useEffect(() => {
    if (isExpanded && children.length === 0) {
      loadChildren();
    }
  }, [isExpanded]);

  const loadChildren = async () => {
    setLoading(true);
    const data = await fetchNodes(node.id);
    setChildren(data);
    setLoading(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode(node.id);
  };

  const handleSelectNode = () => {
    onSelect(node);
  };

  return (
    <div className={cn(
      "w-full transition-all duration-300",
      isExpanded && "mb-3"
    )}>
      {/* Node Row */}
      <div 
        onClick={handleSelectNode}
        className={cn(
          "group relative flex items-center justify-between py-3 px-4 cursor-pointer transition-all rounded-xl",
          isSelected ? "bg-accent/15 border-l-4 border-accent shadow-inner translate-x-1" : "hover:bg-secondary/40",
          level === 0 ? "bg-secondary/20 border border-border/40 mb-2" : "border-b border-border/10"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Stability Dot */}
          <NodeStabilityIndicator 
            score={(node as any).weak_score} 
            attempts={(node as any).total_attempts || 0} 
          />
          
          <div className="flex items-center gap-2">
            {!isLeaf && (
              <button 
                onClick={handleToggle}
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-accent/20 text-muted-foreground group-hover:text-foreground transition-all"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                  isExpanded ? <ChevronDown size={14} className="rotate-0 transition-transform" /> : <ChevronRight size={14} />
                }
              </button>
            )}
            <div className="truncate">
               <p className={cn(
                 "font-bold text-foreground truncate",
                 level === 0 ? "text-base" : level === 1 ? "text-sm" : "text-xs font-medium"
               )}>
                 {node.name}
               </p>
               <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-70">
                 {node.type}
               </p>
            </div>
          </div>
        </div>

        {/* Action / Context */}
        <div className="flex items-center gap-3 shrink-0">
          {(node as any).total_attempts > 0 && (
             <span className="text-[10px] font-black text-muted-foreground bg-border/20 px-1.5 py-0.5 rounded">
               {Math.round(((node as any).weak_score || 0) * 100)}%
             </span>
          )}
          <ArrowRight className={cn(
            "w-4 h-4 text-accent transition-all",
            isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"
          )} />
        </div>
      </div>

      {/* Children Section */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden ml-6 mt-1 border-l border-border/20"
          >
            {children.length > 0 ? (
              <div className="py-1">
                {children.map(child => (
                   <NodeItem key={child.id} node={child} level={level + 1} onSelect={onSelect} />
                ))}
              </div>
            ) : !loading && (
              <p className="text-[10px] text-muted-foreground italic py-2 pl-4">No sub-topics available.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PracticeTreeExplorer: React.FC<{ onSelect: (node: LearningNode) => void }> = ({ onSelect }) => {
  const { fetchNodes, loading, error } = useLearningEngine('NEET');
  const [subjects, setSubjects] = useState<LearningNode[]>([]);

  useEffect(() => {
    fetchNodes(null).then(setSubjects);
  }, []);

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-6" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Calculating personalized learning paths...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {subjects.map(subject => (
        <NodeItem key={subject.id} node={subject} level={0} onSelect={onSelect} />
      ))}
    </div>
  );
};
