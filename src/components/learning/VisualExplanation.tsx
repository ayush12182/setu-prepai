import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Brain, Zap, AlertCircle, 
  ChevronRight, ArrowRight, CheckCircle2, XCircle,
  HelpCircle, Sparkles, Lightbulb, TrendingUp,
  Target, BarChart3, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Scene {
  scene: number;
  description: string;
  visuals: string;
}

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: 'easy' | 'medium';
  visual_hint: string;
}

interface VisualData {
  animation_scenes: Scene[];
  script: string;
  misconception_demo: {
    wrong_view: string;
    correction_steps: string[];
  };
  interaction: {
    type: 'slider' | 'drag' | 'toggle';
    description: string;
    goal: string;
  };
  validation_questions: Question[];
  confidence_prompt: string;
  mastery_logic: {
    '3_correct': string;
    '2_correct': string;
    'less_than_2': string;
  };
}

export const VisualExplanation: React.FC<{ data: VisualData; onComplete?: (mastery: string) => void }> = ({ data, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [validationFinished, setValidationFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [postConfidence, setPostConfidence] = useState<string | null>(null);
  const [level2Data, setLevel2Data] = useState<any>(null);
  const [loadingLevel2, setLoadingLevel2] = useState(false);

  const totalScenes = data.animation_scenes.length;

  const triggerLevel2 = async () => {
    setLoadingLevel2(true);
    try {
      const { data: res, error } = await supabase.functions.invoke('generate-level-2-intervention', {
        body: {
          topic: "Current Topic", 
          subconcept: "Current Subconcept",
          previousWeaknessType: "Misconception",
          validationScore: score,
          confidenceAfterAttempt: postConfidence || 'Low'
        }
      });
      if (error) throw error;
      setLevel2Data(res);
    } catch (err) {
      console.error('Failed Level 2:', err);
      toast.error('Failed to generate deeper explanation');
    } finally {
      setLoadingLevel2(false);
    }
  };

  const nextScene = () => {
    if (currentStep < totalScenes - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowValidation(true);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const isCorrect = optionIdx === data.validation_questions[currentQuestionIdx].correct_answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      toast.success('Correct! Concept crystal clear.');
    } else {
      toast.error('Not quite. Think about the animation again.');
    }

    setUserAnswers([...userAnswers, optionIdx]);

    if (currentQuestionIdx < data.validation_questions.length - 1) {
      setTimeout(() => setCurrentQuestionIdx(prev => prev + 1), 1000);
    } else {
      setTimeout(() => setValidationFinished(true), 1000);
    }
  };

  const getMasteryResult = () => {
    if (score === 3) return { status: 'Concept Fixed', text: data.mastery_logic['3_correct'], color: 'text-emerald-400' };
    if (score === 2) return { status: 'Partial Understanding', text: data.mastery_logic['2_correct'], color: 'text-amber-400' };
    return { status: 'Needs Reinforcement', text: data.mastery_logic['less_than_2'], color: 'text-rose-400' };
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4">
      {/* 🎬 ANIMATION STAGE */}
      {!showValidation ? (
        <>
          <Card className="relative aspect-video bg-slate-900 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-accent/10" />
            
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight max-w-xl mx-auto">
                    {data.animation_scenes[currentStep].visuals}
                  </h3>
                  <p className="text-white/40 text-sm font-medium max-w-md mx-auto italic">
                    {data.animation_scenes[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Scene {currentStep + 1} / {totalScenes}</span>
                <div className="flex gap-1">
                  {data.animation_scenes.map((_, i) => (
                    <div key={i} className={cn("h-1 w-4 rounded-full transition-all", i <= currentStep ? "bg-accent" : "bg-white/10")} />
                  ))}
                </div>
              </div>
              <Button 
                onClick={nextScene}
                className="bg-accent hover:bg-accent/90 text-primary font-black px-6 h-12 rounded-2xl shadow-lg shadow-accent/20"
              >
                {currentStep === totalScenes - 1 ? 'Start Validation' : 'Next Scene'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              <div className="relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-4">
                <p className="text-xl text-white/90 font-medium leading-relaxed italic">
                  "{data.script}"
                </p>
              </div>
            </div>
            <div className="md:col-span-4">
              <Card className="h-full bg-rose-500/5 border-rose-500/10 rounded-[2.5rem] p-8 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <h4 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em]">Misconception</h4>
                </div>
                <p className="text-xs text-rose-200/60 leading-relaxed">{data.misconception_demo.wrong_view}</p>
                <div className="pt-2 border-t border-rose-500/10">
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Fix</p>
                   {data.misconception_demo.correction_steps.slice(0, 1).map((step, i) => (
                     <p key={i} className="text-xs text-emerald-200/60 leading-relaxed">• {step}</p>
                   ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : !validationFinished ? (
        /* 🔁 VALIDATION FLOW */
        <Card className="p-10 rounded-[3rem] bg-[#0D1117] border-white/5 shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Validation Check</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Question {currentQuestionIdx + 1} of 3</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-accent font-black">{score}</span>
              <span className="text-white/20 font-black"> / 3</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
               <span className={cn(
                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                 data.validation_questions[currentQuestionIdx].difficulty === 'easy' 
                   ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                   : "bg-amber-500/10 text-amber-400 border-amber-500/20"
               )}>
                 {data.validation_questions[currentQuestionIdx].difficulty}
               </span>
               <h4 className="text-xl font-bold text-white/90 leading-tight">
                 {data.validation_questions[currentQuestionIdx].question}
               </h4>
               <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-3">
                 <Lightbulb className="w-5 h-5 text-accent shrink-0" />
                 <p className="text-xs text-accent/80 font-medium italic">Hint: {data.validation_questions[currentQuestionIdx].visual_hint}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {data.validation_questions[currentQuestionIdx].options.map((opt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => handleAnswer(i)}
                  className="h-16 justify-start px-6 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-accent/30 text-white/70 hover:text-white transition-all text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 font-black text-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* 📊 MASTERY & CONFIDENCE RECHECK */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <Card className="p-12 rounded-[3rem] bg-gradient-to-br from-slate-900 to-black border-white/5 text-center space-y-8 shadow-2xl">
            <div className="w-24 h-24 rounded-[2rem] bg-accent/20 flex items-center justify-center mx-auto shadow-xl shadow-accent/10">
              <Trophy className="w-12 h-12 text-accent" />
            </div>
            
            <div className="space-y-2">
              <h3 className={cn("text-4xl font-black tracking-tight", getMasteryResult().color)}>
                {getMasteryResult().status}
              </h3>
              <p className="text-white/60 text-lg font-medium max-w-lg mx-auto">
                {getMasteryResult().text}
              </p>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em]">
                {data.confidence_prompt}
              </p>
              <div className="flex justify-center gap-4">
                {['Low', 'Medium', 'High'].map((lvl) => (
                  <Button
                    key={lvl}
                    variant="outline"
                    onClick={() => {
                      setPostConfidence(lvl);
                      onComplete?.(getMasteryResult().status);
                      toast.success(`Confidence set to ${lvl}! Dashboard updated.`);
                    }}
                    className={cn(
                      "h-14 px-8 rounded-2xl border-white/10 font-bold uppercase tracking-widest transition-all",
                      postConfidence === lvl ? "bg-accent text-primary border-accent" : "text-white/60 hover:border-white/30"
                    )}
                  >
                    {lvl}
                  </Button>
                ))}
              </div>
            </div>

            {score < 3 && postConfidence && !level2Data && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8">
                <Button 
                  onClick={triggerLevel2}
                  disabled={loadingLevel2}
                  className="bg-amber-500 hover:bg-amber-600 text-primary font-black px-10 h-16 rounded-[2rem] shadow-xl shadow-amber-500/20 gap-3"
                >
                  {loadingLevel2 ? <RefreshCw className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  I'm still a bit confused. Explain differently!
                </Button>
              </motion.div>
            )}

            {level2Data && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="pt-12 text-left space-y-10"
              >
                <div className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-black text-white">Simplified Concept</h4>
                  </div>
                  <p className="text-lg text-white/80 leading-relaxed italic border-l-4 border-blue-500/30 pl-6">
                    {level2Data.alternate_explanation}
                  </p>
                  <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">The Intuitive Unit</p>
                    <p className="text-sm text-white/70">{level2Data.simplified_concept}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-emerald-500" />
                    <h4 className="text-xl font-black text-white">Guided Solved Example</h4>
                  </div>
                  <Card className="p-8 rounded-[2.5rem] bg-[#1a1f2e] border-white/5 whitespace-pre-line text-white/80 font-medium leading-relaxed">
                    {level2Data.solved_example}
                  </Card>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Teacher Insight</p>
                    <p className="text-sm text-amber-200/60">{level2Data.teacher_insight}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M19 3v4M5 7h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7zM12 17v4m-3 0h6" />
  </svg>
);
