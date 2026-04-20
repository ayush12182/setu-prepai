import React, { useState, useEffect } from 'react';
import { useLearningEngine, LearningNode } from '@/hooks/useLearningEngine';
import { usePracticeStore } from '@/store/practiceStore';
import { useExamMode } from '@/contexts/ExamModeContext';
import { ChevronRight, ChevronDown, Loader2, ArrowRight, Sparkles } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NodeStabilityIndicator } from './IntelligenceIndicators';
import { STATIC_CHAPTER_TOPICS } from '@/data/staticTopics';

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-red-400',
};

const WEIGHTAGE_DOT: Record<string, string> = {
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-muted-foreground',
};

function makeStaticNodes(chapterNode: LearningNode): LearningNode[] {
  const topics = STATIC_CHAPTER_TOPICS[chapterNode.name];
  if (!topics?.length) return [];
  return topics.map((t, i) => ({
    id: `static-${chapterNode.id}-${i}`,
    parent_id: chapterNode.id,
    name: t.name,
    type: 'topic' as const,
    exam_type: chapterNode.exam_type,
    subject_node_id: null,
    sort_order: i + 1,
    difficulty_level: t.difficulty,
    weightage_estimate: t.weightage,
    ai_generated: false,
  }));
}

const NodeItem: React.FC<{
  node: LearningNode;
  level: number;
  subjectName: string;
  onSelect: (node: LearningNode) => void;
}> = ({ node, level, subjectName, onSelect }) => {
  const { expandedNodeIds, toggleNode, selectedNode } = usePracticeStore();
  const [children, setChildren] = useState<LearningNode[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'generating' | 'done'>('idle');
  const { fetchNodes, generateSubtopicsForChapter } = useLearningEngine(node.exam_type);

  const isExpanded = expandedNodeIds.has(node.id);
  const isSelected = selectedNode?.id === node.id;
  const isLeaf = node.type === 'subtopic' || node.id.startsWith('static-');

  useEffect(() => {
    if (isExpanded && loadState === 'idle') {
      loadChildren();
    }
  }, [isExpanded]);

  const loadChildren = async () => {
    setLoadState('loading');

    // Static nodes have no real DB children — skip fetch
    if (node.id.startsWith('static-')) {
      setLoadState('done');
      return;
    }

    const data = await fetchNodes(node.id);

    if (data.length === 0 && node.type === 'chapter') {
      // Try static fallback first (instant)
      const staticNodes = makeStaticNodes(node);
      if (staticNodes.length > 0) {
        setChildren(staticNodes);
        setLoadState('done');
        // Fire AI generation in background to enrich with DB data
        setLoadState('generating');
        const generated = await generateSubtopicsForChapter(node, subjectName);
        if (generated.length > 0) setChildren(generated);
        setLoadState('done');
      } else {
        // No static fallback — try AI generation directly
        setLoadState('generating');
        const generated = await generateSubtopicsForChapter(node, subjectName);
        setChildren(generated);
        setLoadState('done');
      }
    } else {
      setChildren(data);
      setLoadState('done');
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode(node.id);
  };

  return (
    <div className={cn('w-full transition-all duration-300', isExpanded && 'mb-3')}>
      <div
        onClick={() => onSelect(node)}
        className={cn(
          'group relative flex items-center justify-between py-3 px-4 cursor-pointer transition-all rounded-xl',
          isSelected
            ? 'bg-accent/15 border-l-4 border-accent shadow-inner translate-x-1'
            : 'hover:bg-secondary/40',
          level === 0 ? 'bg-secondary/20 border border-border/40 mb-2' : 'border-b border-border/10'
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
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
                {loadState === 'loading' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}

            <div className="truncate">
              <p
                className={cn(
                  'font-bold text-foreground truncate',
                  level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs font-medium'
                )}
              >
                {node.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-70">
                  {node.type}
                </p>
                {node.difficulty_level && (
                  <span className={cn('text-[9px] font-bold uppercase', DIFFICULTY_COLOR[node.difficulty_level])}>
                    {node.difficulty_level}
                  </span>
                )}
                {node.weightage_estimate && (
                  <span className="flex items-center gap-0.5">
                    <span className={cn('w-1.5 h-1.5 rounded-full', WEIGHTAGE_DOT[node.weightage_estimate])} />
                    <span className="text-[9px] text-muted-foreground capitalize">{node.weightage_estimate}</span>
                  </span>
                )}
                {node.ai_generated && (
                  <Sparkles className="w-2.5 h-2.5 text-violet-400 opacity-70" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {(node as any).total_attempts > 0 && (
            <span className="text-[10px] font-black text-muted-foreground bg-border/20 px-1.5 py-0.5 rounded">
              {Math.round(((node as any).weak_score || 0) * 100)}%
            </span>
          )}
          {loadState === 'generating' && isExpanded && (
            <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
          )}
          <ArrowRight
            className={cn(
              'w-4 h-4 text-accent transition-all',
              isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0'
            )}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden ml-6 mt-1 border-l border-border/20"
          >
            {loadState === 'loading' ? (
              <div className="flex items-center gap-2 py-3 pl-4">
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Loading topics...</p>
              </div>
            ) : children.length > 0 ? (
              <div className="py-1">
                {children.map((child) => (
                  <NodeItem
                    key={child.id}
                    node={child}
                    level={level + 1}
                    subjectName={subjectName}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ) : loadState === 'done' ? (
              <p className="text-[10px] text-muted-foreground italic py-2 pl-4">No sub-topics available.</p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PracticeTreeExplorer: React.FC<{ onSelect: (node: LearningNode) => void }> = ({
  onSelect,
}) => {
  const { isNeet, isCuet } = useExamMode();
  const examType = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';
  const { fetchNodes, loading } = useLearningEngine(examType);
  const [subjects, setSubjects] = useState<LearningNode[]>([]);

  useEffect(() => {
    setSubjects([]);
    fetchNodes(null).then(setSubjects);
  }, [examType]);

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-6" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Calculating personalized learning paths...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {subjects.map((subject) => (
        <NodeItem
          key={subject.id}
          node={subject}
          level={0}
          subjectName={subject.name}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
