import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamMode, ExamMode } from '@/contexts/ExamModeContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const examOptions = [
  {
    mode: 'jee' as ExamMode,
    title: 'JEE',
    subtitle: 'Mains & Advanced',
    description: 'Engineering entrance — Physics, Chemistry, Mathematics',
    emoji: '⚡',
    gradient: 'from-[hsl(213_40%_16%)] to-[hsl(213_50%_10%)]',
    border: 'border-[hsl(32_79%_57%/0.4)]',
    activeBorder: 'border-[hsl(32_79%_57%)]',
    accentBg: 'bg-[hsl(32_79%_57%/0.15)]',
    accentText: 'text-[hsl(32_79%_57%)]',
    ring: 'ring-[hsl(32_79%_57%/0.5)]',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    target: 'Deep problem-solving & advanced concepts',
  },
  {
    mode: 'neet' as ExamMode,
    title: 'NEET',
    subtitle: 'UG Medical',
    description: 'Medical entrance — Biology, Chemistry, Physics',
    emoji: '🧬',
    gradient: 'from-[hsl(145_30%_16%)] to-[hsl(145_40%_10%)]',
    border: 'border-[hsl(145_50%_38%/0.4)]',
    activeBorder: 'border-[hsl(145_50%_38%)]',
    accentBg: 'bg-[hsl(145_50%_38%/0.15)]',
    accentText: 'text-[hsl(145_50%_38%)]',
    ring: 'ring-[hsl(145_50%_38%/0.5)]',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    target: 'NCERT mastery & conceptual clarity',
  },
  {
    mode: 'cuet' as ExamMode,
    title: 'CUET',
    subtitle: 'UG Entrance',
    description: 'University entrance — Domain, Language & General Test',
    emoji: '🎯',
    gradient: 'from-[hsl(260_30%_16%)] to-[hsl(260_40%_10%)]',
    border: 'border-[hsl(260_50%_55%/0.4)]',
    activeBorder: 'border-[hsl(260_50%_55%)]',
    accentBg: 'bg-[hsl(260_50%_55%/0.15)]',
    accentText: 'text-[hsl(260_50%_55%)]',
    ring: 'ring-[hsl(260_50%_55%/0.5)]',
    subjects: ['English', 'General Test', 'Domain Subjects'],
    target: 'Speed, accuracy & NCERT recall',
  },
];

const ExamSelectionPage: React.FC = () => {
  const { setExamMode } = useExamMode();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ExamMode>('jee');

  const handleContinue = () => {
    setExamMode(selected);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--setu-navy-light))] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-wide">SETU</h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Choose Your Preparation Path
          </h2>
          <p className="text-muted-foreground text-sm">
            Your entire platform experience will adapt to your exam
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {examOptions.map((opt) => (
            <motion.button
              key={opt.mode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(opt.mode)}
              className={cn(
                "relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 border-2",
                "bg-gradient-to-br",
                opt.gradient,
                selected === opt.mode
                  ? cn(opt.activeBorder, "shadow-xl ring-2 ring-offset-2 ring-offset-background", opt.ring)
                  : cn(opt.border, "opacity-70 hover:opacity-100")
              )}
            >
              {selected === opt.mode && (
                <div className="absolute top-3 right-3">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", opt.accentBg)}>
                    <Sparkles className={cn("w-3.5 h-3.5", opt.accentText)} />
                  </div>
                </div>
              )}

              <span className="text-3xl mb-2 block">{opt.emoji}</span>
              <h3 className="text-xl font-bold text-white mb-0.5">{opt.title}</h3>
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-2">{opt.subtitle}</p>
              <p className="text-white/70 text-xs mb-3">{opt.description}</p>
              <p className="text-white/40 text-[10px] italic mb-3">{opt.target}</p>

              <div className="flex flex-wrap gap-1.5">
                {opt.subjects.map((s) => (
                  <span key={s} className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", opt.accentBg, opt.accentText)}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Continue */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleContinue}
            className="gap-2 px-8 text-base font-semibold"
          >
            Continue as {selected.toUpperCase()}
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            You can switch exam mode anytime from settings
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ExamSelectionPage;
