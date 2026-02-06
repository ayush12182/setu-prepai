import React from 'react';
import { Lightbulb, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Chapter } from '@/data/syllabus';

interface JeetuTipProps {
  chapter: Chapter;
  subchapterCount: number;
}

export const JeetuTip: React.FC<JeetuTipProps> = ({ chapter, subchapterCount }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-setu-saffron/5 to-primary/5 border border-setu-saffron/20 rounded-2xl p-6"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-setu-saffron/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      
      <div className="relative flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-setu-saffron/20 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-setu-saffron" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-foreground">Jeetu Bhaiya says...</p>
            <Lightbulb className="w-4 h-4 text-setu-saffron" />
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Beta, <span className="font-medium text-foreground">{chapter.name}</span> mein{' '}
            <span className="font-medium text-foreground">{subchapterCount} topics</span> hain. 
            Ek ek karke master karo. 
            {chapter.weightage === 'High' && (
              <span className="text-setu-saffron font-medium"> Yeh HIGH weightage chapter hai — isko seriously lo.</span>
            )}
            {' '}Har topic mein pehle <span className="font-medium">Learn</span> → phir <span className="font-medium">Practice</span> → finally <span className="font-medium">Test</span>. 
            Shortcuts mat lo, consistency se result aata hai! 🎯
          </p>
        </div>
      </div>
    </motion.div>
  );
};
