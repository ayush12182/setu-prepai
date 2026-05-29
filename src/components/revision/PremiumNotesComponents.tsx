import React from 'react';
import { motion } from 'framer-motion';
import { BlockMath } from 'react-katex';
import { AlertTriangle, Lightbulb, Zap, LineChart, Target, HelpCircle } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { MathLine } from '@/utils/mathRenderer';

interface FormulaCardProps {
  name: string;
  formula: string;
  variables: string;
  usage: string;
  delay?: number;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({ name, formula, variables, usage, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Target className="w-24 h-24" />
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">{name}</h4>
    </div>
    
    <div className="bg-background/50 border border-border/50 rounded-xl p-4 mb-4 flex justify-center text-lg">
      <BlockMath math={formula} />
    </div>
    
    <div className="space-y-2">
      <div className="text-xs">
        <span className="font-semibold text-muted-foreground uppercase">Variables:</span>{' '}
        <span className="text-foreground/80"><MathLine>{variables}</MathLine></span>
      </div>
      <div className="text-xs">
        <span className="font-semibold text-muted-foreground uppercase">Usage:</span>{' '}
        <span className="text-emerald-500 dark:text-emerald-400 font-medium"><MathLine>{usage}</MathLine></span>
      </div>
    </div>
  </motion.div>
);

interface ConceptCardProps {
  title: string;
  description: string;
  delay?: number;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-start gap-3 bg-secondary/20 border border-secondary/30 rounded-xl p-4"
  >
    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
      <Lightbulb className="w-4 h-4 text-blue-500" />
    </div>
    <div>
      <h4 className="font-semibold text-foreground text-sm mb-1"><MathLine>{title}</MathLine></h4>
      <p className="text-xs text-muted-foreground leading-relaxed"><MathLine>{description}</MathLine></p>
    </div>
  </motion.div>
);

interface GraphCardProps {
  title: string;
  description: string;
  delay?: number;
}

export const GraphCard: React.FC<GraphCardProps> = ({ title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center"
  >
    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
      <LineChart className="w-6 h-6 text-purple-500" />
    </div>
    <h4 className="font-semibold text-foreground text-sm mb-2">{title}</h4>
    <p className="text-xs text-muted-foreground">{description}</p>
  </motion.div>
);

interface MistakeCardProps {
  wrong: string;
  right: string;
  why: string;
  delay?: number;
}

export const MistakeCard: React.FC<MistakeCardProps> = ({ wrong, right, why, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden"
  >
    <div className="bg-red-50 dark:bg-red-950/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <span className="text-xs font-bold uppercase text-red-500 tracking-wider">Don't Do This</span>
      </div>
      <p className="text-sm text-red-700 dark:text-red-300 line-through opacity-80"><MathLine>{wrong}</MathLine></p>
    </div>
    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-bold uppercase text-emerald-500 tracking-wider">Do This</span>
      </div>
      <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-2"><MathLine>{right}</MathLine></p>
      <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 flex items-start gap-1">
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span><MathLine>{why}</MathLine></span>
      </div>
    </div>
  </motion.div>
);

interface PYQTriggerCardProps {
  pattern: string;
  action: string;
  delay?: number;
}

export const PYQTriggerCard: React.FC<PYQTriggerCardProps> = ({ pattern, action, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4"
  >
    <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">IF</div>
    <div className="flex-1 text-sm font-medium text-foreground"><MathLine>{pattern}</MathLine></div>
    <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">THEN</div>
    <div className="flex-1 text-sm font-bold text-amber-600 dark:text-amber-400"><MathLine>{action}</MathLine></div>
  </motion.div>
);

export const QuickRevisionBox: React.FC<{ points: string[] }> = ({ points }) => (
  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <Zap className="w-6 h-6 text-indigo-500" />
      <h3 className="text-lg font-bold text-foreground">30-Second Final Recall</h3>
    </div>
    <ul className="space-y-2">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          <span className="text-sm font-medium text-foreground/80"><MathLine>{point}</MathLine></span>
        </li>
      ))}
    </ul>
  </div>
);
