import React, { useState, useEffect } from 'react';
import { useLearningEngine, LearningNode } from '@/hooks/useLearningEngine';
import { usePracticeStore } from '@/store/practiceStore';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Target, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DecisionTreeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LearningNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchSemantic } = useLearningEngine('NEET'); // Default exam for demo
  const { expandPath, setSelectedNode, toggleNode } = usePracticeStore();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      const data = await searchSemantic(query);
      setResults(data);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (node: LearningNode) => {
    // 1. In a real system, we'd fetch the breadcrumb path from nodes
    // For now, we simulate path expansion or just toggle parents
    if (node.parent_id) {
       expandPath([node.parent_id]);
    }
    
    // 2. Select the node to open the right panel
    setSelectedNode(node);
    
    // 3. Clear search
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8 z-50">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-accent transition-colors" />
        <Input 
          placeholder="Search topics, keywords (e.g. Mitochondria, SI Units)..."
          className="pl-11 h-14 rounded-2xl bg-secondary/30 border-border/50 focus:bg-secondary/50 focus:border-accent/40 shadow-xl transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-accent" />}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 left-0 right-0 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-2 overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {results.map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleSelect(node)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{node.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                        {node.type}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
