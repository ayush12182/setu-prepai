import React from 'react';
import { Lightbulb, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Chapter } from '@/data/syllabus';

interface PrepEntranceTipProps {
  chapter: Chapter;
  subchapterCount: number;
}

export const PrepEntranceTip: React.FC<PrepEntranceTipProps> = ({ chapter, subchapterCount }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm"
    >
      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-foreground">Pro Tip</p>
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            This chapter contains <span className="font-medium text-foreground">{subchapterCount} topics</span>. 
            Master them sequentially. 
            {chapter.weightage === 'High' && (
              <span className="text-prepentrance-saffron font-medium"> This is a high weightage chapter — focus on thorough coverage.</span>
            )}
            {' '}For each topic, ensure you complete the <span className="font-medium text-foreground">Learn</span> module, then test your understanding with <span className="font-medium text-foreground">Practice</span> questions. Consistency is key to success.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
