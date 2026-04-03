/**
 * MCQCard.tsx
 *
 * Slide-up MCQ card. Shows one question at a time with 4 options.
 * After answer → shows correct/wrong with explanation.
 * "Skip" always visible.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, ChevronRight, SkipForward, Loader2, Trophy, AlertCircle 
} from 'lucide-react';
import { MCQState, MistakeType, ConfidenceLevel } from '@/hooks/useMCQ';

interface MCQCardProps {
  mcq: MCQState;
  accentColor: string;
  onSelectAnswer: (index: number) => void;
  onSetMistake: (type: MistakeType) => void;
  onSetConfidence: (level: ConfidenceLevel) => void;
  onNext: () => void;
  onSkip: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const MCQCard: React.FC<MCQCardProps> = ({
  mcq, accentColor, onSelectAnswer, onSetMistake, onSetConfidence, onNext, onSkip,
}) => {
  const isVisible = (mcq.status !== 'idle' || !!mcq.error) && mcq.status !== 'complete';

  return (
    <AnimatePresence mode="wait">
      {/* Quiz Completion State */}
      {mcq.status === 'complete' ? (
        <motion.div
          key="complete"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full rounded-2xl p-6 text-center shadow-xl border border-white/10"
          style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)' }}
        >
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-3xl mx-auto mb-4">🏆</div>
          <h4 className="text-white font-bold text-lg mb-1">Quiz Complete!</h4>
          <p className="text-white/60 text-sm mb-6">
            You got {mcq.totalCorrect} out of {mcq.totalAttempted} right.
          </p>
          <button
            onClick={onSkip}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all text-white shadow-lg shadow-emerald-500/20"
            style={{ background: accentColor }}
          >
            Wonderful, let's continue!
          </button>
        </motion.div>
      ) : (
        isVisible && (
          <motion.div
            key="active-quiz"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full z-30 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}30` }}
                  >
                    {mcq.currentDifficulty} · Q{mcq.questionNumber}/5
                  </div>
                </div>
                <button
                  onClick={onSkip}
                  className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  <SkipForward className="w-3 h-3" />
                  Skip Quiz
                </button>
              </div>

              {/* Loading State */}
              {mcq.status === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-white/50">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: accentColor }} />
                  <span className="text-sm">Generating question...</span>
                </div>
              )}

              {/* Error State */}
              {mcq.status === 'idle' && mcq.error && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-xs text-red-400/80 mb-3 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                    {mcq.error}
                  </p>
                  <button
                    onClick={onSkip}
                    className="text-[10px] text-white/40 hover:text-white/70 transition-colors underline"
                  >
                    Close assessment
                  </button>
                </div>
              )}

              {/* Active Quiz Content */}
              {(mcq.status === 'active' || mcq.status === 'feedback') && mcq.currentQuestion && (
                <motion.div 
                  key={mcq.questionNumber}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Question text */}
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {mcq.currentQuestion.question}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2">
                    {mcq.currentQuestion.options.map((option, i) => {
                      const isSelected = mcq.selectedIndex === i;
                      const isCorrect  = i === mcq.currentQuestion!.correctIndex;
                      const showResult = mcq.status === 'feedback';

                      let borderColor = 'rgba(255,255,255,0.1)';
                      let bg = 'rgba(255,255,255,0.04)';
                      let textColor = 'rgba(255,255,255,0.75)';

                      if (showResult) {
                        if (isCorrect) {
                          borderColor = '#34D399'; bg = 'rgba(52,211,153,0.12)'; textColor = '#34D399';
                        } else if (isSelected && !isCorrect) {
                          borderColor = '#F87171'; bg = 'rgba(248,113,113,0.12)'; textColor = '#F87171';
                        }
                      } else if (isSelected) {
                        borderColor = accentColor; bg = `${accentColor}18`;
                      }

                      return (
                        <motion.button
                          key={i}
                          whileHover={mcq.status === 'active' ? { scale: 1.01 } : {}}
                          whileTap={mcq.status === 'active' ? { scale: 0.99 } : {}}
                          onClick={() => mcq.status === 'active' && onSelectAnswer(i)}
                          disabled={mcq.status !== 'active'}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm"
                          style={{ border: `1px solid ${borderColor}`, background: bg, color: textColor }}
                        >
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{ background: `${borderColor}30`, border: `1px solid ${borderColor}` }}
                          >
                            {OPTION_LABELS[i]}
                          </span>
                          <span className="flex-1 leading-snug">{option}</span>
                          {showResult && isCorrect && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0 text-red-400" />}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Feedback + explanation */}
                  {mcq.status === 'feedback' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 pt-2"
                    >
                      {/* Result banner */}
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                        style={{
                          background: mcq.isCorrect ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                          border: `1px solid ${mcq.isCorrect ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                          color: mcq.isCorrect ? '#34D399' : '#F87171',
                        }}
                      >
                        {mcq.isCorrect
                          ? <><CheckCircle className="w-4 h-4" /> Correct!</>
                          : <><XCircle className="w-4 h-4" /> Explanation:</>}
                      </div>

                      {/* Explanation */}
                      <div className="space-y-4 px-1 pb-2">
                        {mcq.currentQuestion.solution_steps && mcq.currentQuestion.solution_steps.length > 0 ? (
                          <div className="space-y-2">
                             <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Step-by-step Solution</p>
                             <ul className="text-xs text-white/70 leading-relaxed list-decimal list-inside space-y-1">
                               {mcq.currentQuestion.solution_steps.map((step, idx) => (
                                 <li key={idx}>{step}</li>
                               ))}
                             </ul>
                          </div>
                        ) : (
                          <p className="text-xs text-white/50 leading-relaxed">
                            {mcq.currentQuestion.explanation}
                          </p>
                        )}

                        {mcq.currentQuestion.common_mistake && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                             <div className="flex items-center gap-1.5 mb-1 text-red-400">
                               <AlertCircle className="w-3.5 h-3.5" />
                               <span className="text-[10px] uppercase font-bold tracking-widest">Where students go wrong ({mcq.currentQuestion.mistake_type || 'Common Error'})</span>
                             </div>
                             <p className="text-xs text-red-200/80 leading-relaxed">{mcq.currentQuestion.common_mistake}</p>
                          </div>
                        )}

                        {mcq.currentQuestion.concept && (
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] px-2 py-1 bg-white/5 text-white/50 rounded-md border border-white/10 uppercase tracking-wider font-bold">
                               Concept: {mcq.currentQuestion.concept}
                             </span>
                           </div>
                        )}
                      </div>

                      {/* --- CONFIDENCE TRACKING --- */}
                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2">How confident were you?</p>
                        <div className="flex gap-2">
                          {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((level) => (
                            <button
                              key={level}
                              onClick={() => onSetConfidence(level)}
                              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all uppercase tracking-wider"
                              style={{
                                background: mcq.confidenceLevel === level ? `${accentColor}20` : 'transparent',
                                borderColor: mcq.confidenceLevel === level ? accentColor : 'rgba(255,255,255,0.1)',
                                color: mcq.confidenceLevel === level ? accentColor : 'rgba(255,255,255,0.4)',
                              }}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* --- MISTAKE CLASSIFICATION (Only for incorrect) --- */}
                      {mcq.isCorrect === false && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                          <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2">Why did you get this wrong?</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'conceptual', label: 'Concept not clear' },
                              { id: 'calculation', label: 'Calculation mistake' },
                              { id: 'silly', label: 'Silly mistake' },
                              { id: 'guessed', label: 'I guessed it' },
                            ].map((m) => (
                              <button
                                key={m.id}
                                onClick={() => onSetMistake(m.id as MistakeType)}
                                className="px-3 py-2 rounded-lg text-[10px] font-bold border transition-all text-left"
                                style={{
                                  background: mcq.selectedMistake === m.id ? `${accentColor}20` : 'rgba(255,255,255,0.03)',
                                  borderColor: mcq.selectedMistake === m.id ? accentColor : 'rgba(255,255,255,0.05)',
                                  color: mcq.selectedMistake === m.id ? accentColor : 'rgba(255,255,255,0.5)',
                                }}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* --- INLINE FRICTION PROMPT --- */}
                      {mcq.hasShownFriction && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="px-3 py-2 rounded-lg border flex items-center gap-2 animate-bounce-subtle"
                          style={{ background: `${accentColor}10`, borderColor: `${accentColor}30` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                          <p className="text-[11px] font-medium" style={{ color: accentColor }}>
                            Helps us pinpoint exactly where you’re losing marks
                          </p>
                        </motion.div>
                      )}

                      {/* Next button */}
                      <button
                        onClick={onNext}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ background: accentColor, color: '#fff' }}
                      >
                        {mcq.questionNumber >= 5 ? 'Finish Session' : 'Next Question'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};
