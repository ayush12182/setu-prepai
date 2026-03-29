/**
 * MCQCard.tsx
 *
 * Slide-up MCQ card. Shows one question at a time with 4 options.
 * After answer → shows correct/wrong with explanation.
 * "Skip" always visible.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, SkipForward, Loader2, Trophy } from 'lucide-react';
import { MCQState } from '@/hooks/useMCQ';

interface MCQCardProps {
  mcq: MCQState;
  accentColor: string;
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
  onSkip: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const MCQCard: React.FC<MCQCardProps> = ({
  mcq, accentColor, onSelectAnswer, onNext, onSkip,
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
                <div className="space-y-4">
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
                      <p className="text-xs text-white/50 leading-relaxed px-1">
                        {mcq.currentQuestion.explanation}
                      </p>

                      {/* Next button */}
                      <button
                        onClick={onNext}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: accentColor, color: '#fff' }}
                      >
                        {mcq.questionNumber >= 5 ? 'Finish Session' : 'Next Question'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};
