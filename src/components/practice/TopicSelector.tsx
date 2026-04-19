import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
}

interface TopicSelectorProps {
  onSelect: (id: string, name: string) => void;
  examType?: string;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelect, examType = 'JEE' }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    const { data } = await supabase
      .from('learning_nodes')
      .select('*')
      .order('sort_order', { ascending: true });
    
    setNodes(data || []);
    setLoading(false);
  };

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNodes = (parentId: string | null = null, level: number = 0) => {
    const children = nodes.filter(n => n.parent_id === parentId);
    if (children.length === 0) return null;

    return (
      <div className={cn("space-y-1", level > 0 && "ml-4 border-l border-border pl-2")}>
        {children.map(node => {
          const isExpanded = expanded[node.id];
          const hasChildren = nodes.some(n => n.parent_id === node.id);

          return (
            <div key={node.id}>
              <div 
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-accent/5 cursor-pointer transition-all",
                  node.type === 'root' ? "bg-secondary/50 font-black" : "font-medium"
                )}
                onClick={() => hasChildren ? toggle(node.id) : onSelect(node.id, node.name)}
              >
                <div className="flex items-center gap-2">
                  {hasChildren ? (
                    isExpanded ? <ChevronDown className="w-4 h-4 text-accent" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : <div className="w-4" />}
                  {node.type === 'root' ? <Layers className="w-4 h-4 text-accent" /> : <BookOpen className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm">{node.name}</span>
                </div>
                {!hasChildren && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-accent hover:text-accent" onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.id, node.name);
                  }}>
                    Select
                  </Button>
                )}
              </div>
              {isExpanded && renderNodes(node.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="p-4 text-center text-xs font-bold text-muted-foreground">Loading Curriculum...</div>;

  return (
    <div className="bg-secondary/20 rounded-2xl p-4 max-h-[400px] overflow-y-auto border border-border mt-2">
      {renderNodes()}
    </div>
  );
};
