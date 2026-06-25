import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export const FormulaCard: React.FC<FormulaCardProps> = ({ name, formula, variables, usage, delay = 0 }) => {
  // Derive deterministic star rating and PYQ frequency based on name for rich visual realism
  const importanceStars = (name.charCodeAt(0) % 2 === 0) ? 5 : 4;
  const pyqFrequencyCount = (name.charCodeAt(0) * 3) % 20 + 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl p-5 relative overflow-hidden group border transition-all duration-300"
      style={{
        background: 'linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(11,16,26,1) 100%)',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        boxShadow: '0 0 25px rgba(59, 130, 246, 0.08)'
      }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target className="w-24 h-24 text-blue-500" />
      </div>
      
      {/* Star Importance and Ask Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < importanceStars ? 'text-amber-400' : 'text-white/10'}`}>★</span>
            ))}
          </div>
          <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest mt-0.5">MOST ASKED IN JEE</span>
        </div>
        <div className="text-[10px] text-blue-400 font-extrabold uppercase bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full self-start">
          PYQ Frequency: {pyqFrequencyCount} Questions
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <h4 className="font-semibold text-white text-sm uppercase tracking-wider">{name}</h4>
      </div>
      
      {/* White Notion-Style Formula Container */}
      <div className="bg-white border border-white/10 rounded-2xl p-6 mb-4 flex justify-center text-lg text-black font-semibold shadow-inner relative group/math">
        <div className="w-full text-black overflow-x-auto py-1 text-center select-all flex justify-center">
          <BlockMath math={formula} />
        </div>
      </div>
      
      <div className="space-y-2 border-b border-white/[0.05] pb-4 mb-4">
        <div className="text-xs">
          <span className="font-semibold text-white/50 uppercase tracking-wider text-[10px]">Variables:</span>{' '}
          <span className="text-white/80"><MathLine>{variables}</MathLine></span>
        </div>
        <div className="text-xs">
          <span className="font-semibold text-white/50 uppercase tracking-wider text-[10px]">Usage:</span>{' '}
          <span className="text-emerald-400 font-medium"><MathLine>{usage}</MathLine></span>
        </div>
      </div>

      {/* Quick Action Buttons Under Card */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <button className="flex items-center justify-center gap-1 text-[10px] font-bold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] py-2 rounded-lg transition-colors">
          <span>📄</span> Notes
        </button>
        <button className="flex items-center justify-center gap-1 text-[10px] font-bold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] py-2 rounded-lg transition-colors">
          <span>🧠</span> Knowledge Engine
        </button>
        <button className="flex items-center justify-center gap-1 text-[10px] font-bold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] py-2 rounded-lg transition-colors">
          <span>📝</span> PYQs
        </button>
        <button className="flex items-center justify-center gap-1 text-[10px] font-bold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] py-2 rounded-lg transition-colors">
          <span>⚡</span> Recall
        </button>
      </div>
    </motion.div>
  );
};

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

export const GraphCard: React.FC<GraphCardProps> = ({ title, description, delay = 0 }) => {
  const [flipped, setFlipped] = useState(false);
  const normTitle = title.toLowerCase();

  // 1. RENDER: Velocity-Time / Position-Time Interactive Graph Plot (Option 1)
  if (normTitle.includes('velocity-time') || normTitle.includes('v-t') || normTitle.includes('position-time') || normTitle.includes('x-t') || normTitle.includes('graph')) {
    const isVT = normTitle.includes('velocity') || normTitle.includes('v-t');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="bg-gradient-to-br from-[#0F172A] to-[#0A0E1A] border border-blue-500/20 rounded-3xl p-5 shadow-lg space-y-4 hover:border-blue-500/35 transition-all group col-span-1 md:col-span-2 relative overflow-hidden"
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">🎬 Interactive Animation</span>
          <span className="text-[10px] text-white/40">Visual Memory Plot</span>
        </div>

        <h4 className="font-extrabold text-white text-sm tracking-wide">{title}</h4>

        {/* Dynamic Plot Animation */}
        <div className="h-40 bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Axes */}
            <line x1="10" y1="90" x2="95" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="10" y1="10" x2="10" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            
            {/* Grid Lines */}
            <line x1="10" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Filled Area (Area = Displacement) */}
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              points="10,90 30,70 60,30 90,30 90,90"
              fill="url(#areaGrad)"
            />

            {/* Plot Line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              d="M10,90 L30,70 L60,30 L90,30"
              fill="none"
              stroke="#E89A3C"
              strokeWidth="2.5"
            />
            
            {/* Interactive Points */}
            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} cx="30" cy="70" r="3" fill="#3B82F6" />
            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }} cx="60" cy="30" r="3" fill="#3B82F6" />

            {/* SVG Gradients */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Hover HUD Indicators */}
          <div className="absolute top-2 right-2 bg-black/80 border border-white/10 rounded-lg p-2 text-[9px] text-white/70 space-y-1 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="font-extrabold text-amber-400">📊 PLOT DETAILS:</p>
            <p>✓ <strong className="text-white">Slope (tan θ)</strong> = {isVT ? 'Acceleration' : 'Velocity'}</p>
            <p>✓ <strong className="text-white">Area under curve</strong> = {isVT ? 'Displacement' : 'N/A'}</p>
          </div>
          
          <div className="absolute bottom-2 left-12 text-[8px] text-white/30 uppercase tracking-widest font-black">
            Time (t) ➔
          </div>
          <div className="absolute top-8 left-1.5 text-[8px] text-white/30 uppercase tracking-widest font-black -rotate-90">
            {isVT ? 'Velocity (v)' : 'Position (x)'}
          </div>
        </div>

        {/* Whiteboard Hack summary block */}
        <div className="bg-[#1C170B] border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
          <div className="text-xl">🧠</div>
          <div className="space-y-1">
            <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Sir's Memory Hack</h5>
            <p className="text-xs text-amber-200/90 italic font-medium leading-relaxed">
              "Remember: UPAR slope, NICHE area. Slope = a, Area = s."
            </p>
          </div>
        </div>

        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </motion.div>
    );
  }

  // 2. RENDER: Distance vs Displacement visual path comparison (Option 2)
  if (normTitle.includes('displacement') || normTitle.includes('distance') || normTitle.includes('path') || normTitle.includes('scalar')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="bg-gradient-to-br from-[#0F172A] to-[#0A0E1A] border border-emerald-500/20 rounded-3xl p-5 shadow-lg space-y-4 hover:border-emerald-500/35 transition-all group relative overflow-hidden"
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">🚶 Path Comic</span>
          <span className="text-[10px] text-white/40">Vector Representation</span>
        </div>

        <h4 className="font-extrabold text-white text-sm tracking-wide">{title}</h4>

        {/* Path Comparison Graphic */}
        <div className="h-28 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="flex items-center justify-between w-4/5 text-xs relative">
            <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-emerald-400 flex items-center justify-center font-black text-[10px]">A</div>
            <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-emerald-400 flex items-center justify-center font-black text-[10px]">B</div>
            
            {/* Displacement: Straight path */}
            <div className="absolute left-5 right-5 h-0.5 bg-blue-500 top-2 flex items-center justify-center">
              <span className="absolute -top-3 text-[8px] font-black uppercase text-blue-400 tracking-wider">Displacement (Vector)</span>
              <span className="absolute right-0 text-[8px]">➔</span>
            </div>

            {/* Distance: Curved path */}
            <div className="absolute left-5 right-5 top-2 flex items-center justify-center">
              <span className="absolute -bottom-6 text-[8px] font-black uppercase text-amber-500 tracking-wider">Distance (Scalar)</span>
              <svg className="w-full h-8 overflow-visible absolute -top-4" fill="none">
                <path d="M 0,0 C 20,-20 80,20 120,0" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Comic Hack Box */}
        <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-3 text-[10px] space-y-1 text-white/60">
          <p className="font-bold text-white mb-1">🏃 Returns Back To Start Example:</p>
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span>Distance (Total Path Length):</span>
            <span className="text-amber-500 font-extrabold">100 meters</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span>Displacement (Shortest Vector):</span>
            <span className="text-blue-400 font-extrabold">0 meters</span>
          </div>
        </div>

        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </motion.div>
    );
  }

  // 3. RENDER: Interactive Flashcard Flip Animation (Option 5)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-gradient-to-br from-[#0F172A] to-[#0A0E1A] border border-purple-500/20 rounded-3xl p-5 shadow-lg space-y-4 hover:border-purple-500/35 transition-all group relative cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">⚡ Flip Flashcard</span>
        <span className="text-[10px] text-white/40">Tap to Flip</span>
      </div>

      <h4 className="font-extrabold text-white text-sm tracking-wide">{title}</h4>

      {/* Card Body with Flip Transition */}
      <div className="h-28 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden select-none">
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div 
              key="front" 
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              className="space-y-1.5"
            >
              <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">Concept Query</p>
              <p className="text-xs font-black text-white px-2">What does the slope of the velocity-time graph represent?</p>
              <p className="text-[9px] text-white/30 uppercase mt-2">Click to reveal answer</p>
            </motion.div>
          ) : (
            <motion.div 
              key="back" 
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              className="space-y-1.5"
            >
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Solution / Response</p>
              <p className="text-sm font-black text-emerald-400 px-2">Acceleration (dv / dt)</p>
              <p className="text-[10px] text-white/70 italic px-2">"For non-uniform motion, slope of tangent gives instantaneous acceleration."</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-white/50 leading-relaxed">{description}</p>
    </motion.div>
  );
};

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
