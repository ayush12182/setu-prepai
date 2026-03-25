/**
 * SessionReport.tsx
 *
 * Full-screen session summary report modal.
 * Shown when student clicks "Finish Session".
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Eye, BookOpen, Bot, Target, TrendingUp, AlertCircle, CheckCheck } from 'lucide-react';
import { CompiledSessionReport } from '@/hooks/useSessionTracker';
import { getClosingFeedback } from '@/lib/closingFeedback';
import { LanguageMode } from '@/contexts/LanguageContext';

interface SessionReportProps {
  report: CompiledSessionReport;
  language: LanguageMode;
  teacherName: string;
  accentColor: string;
  onClose: () => void;
  onNewSession: () => void;
}

function formatDuration(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 p-3 rounded-xl"
      style={{ background: `${color}10`, border: `1px solid ${color}25` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      {sub && <p className="text-[10px] text-white/40">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* Lightweight engagement timeline — simple vertical bars */
function EngagementTimeline({ timeline, accentColor }: {
  timeline: { t: number; score: number }[]; accentColor: string;
}) {
  if (timeline.length < 2) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Engagement Timeline</p>
      <div className="flex items-end gap-0.5 h-10">
        {timeline.map((pt, i) => {
          const h = Math.max(4, (pt.score / 100) * 40);
          const col = pt.score >= 65 ? '#34D399' : pt.score >= 35 ? '#F59E0B' : '#F87171';
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              className="flex-1 rounded-sm"
              style={{ backgroundColor: col, minWidth: 2 }}
              title={`${pt.t}s: ${pt.score}%`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-white/25 mt-1">
        <span>Start</span><span>End</span>
      </div>
    </div>
  );
}

export const SessionReport: React.FC<SessionReportProps> = ({
  report, language, teacherName, accentColor, onClose, onNewSession,
}) => {
  const totalTopics    = report.topicsCovered.length;
  const activeMs       = Math.round(report.totalDurationMs * (report.attentivePercent / 100));
  const idleMs         = report.totalDurationMs - activeMs;
  const feedbackMsg    = getClosingFeedback(
    { engagementScore: report.engagementScore, distractedPercent: report.distractedPercent },
    language,
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 30 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #0d1520 0%, #070e1a 100%)',
            border: `1px solid ${accentColor}30`,
            boxShadow: `0 0 60px ${accentColor}15`,
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
            style={{
              background: 'linear-gradient(180deg, #0d1520 80%, transparent)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div>
              <h2 className="text-base font-black text-white">Session Complete 🎓</h2>
              <p className="text-xs text-white/40">{teacherName} · {new Date(report.sessionStartAt).toLocaleTimeString()}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-5">
            {/* ─ Time cards ─ */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard icon={Clock} label="Total" value={formatDuration(report.totalDurationMs)} color={accentColor} />
              <StatCard icon={Eye}   label="Active" value={formatDuration(activeMs)} color="#34D399" />
              <StatCard icon={Clock} label="Idle" value={formatDuration(idleMs)} color="#F87171" />
            </div>

            {/* ─ Engagement ─ */}
            <div
              className="p-3 rounded-xl space-y-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                👁 Attention
              </p>
              <MiniBar value={report.attentivePercent}  color="#34D399" label="Attentive" />
              <MiniBar value={report.distractedPercent} color="#F59E0B" label="Distracted" />
              <EngagementTimeline timeline={report.engagementTimeline} accentColor={accentColor} />
            </div>

            {/* ─ Learning Metrics ─ */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={BookOpen} label="Topics"
                value={`${totalTopics}`}
                sub={report.topicsCovered.map(t => t.topic).slice(0, 2).join(', ') + (totalTopics > 2 ? '…' : '')}
                color="#818CF8"
              />
              <StatCard
                icon={Bot} label="Interactions"
                value={`${report.questionsAsked}`}
                sub={`${report.voiceInteractions} voice · ${report.typedInteractions} typed`}
                color="#38BDF8"
              />
            </div>

            {/* ─ MCQ Performance ─ */}
            {report.totalMCQAttempted > 0 && (
              <div
                className="p-3 rounded-xl space-y-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  🧪 MCQ Performance
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-black" style={{ color: report.overallAccuracy >= 70 ? '#34D399' : '#F59E0B' }}>
                      {report.overallAccuracy}%
                    </p>
                    <p className="text-[9px] text-white/40">Accuracy</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <MiniBar value={report.overallAccuracy} color={report.overallAccuracy >= 70 ? '#34D399' : '#F59E0B'} label={`${report.totalMCQCorrect}/${report.totalMCQAttempted} correct`} />
                  </div>
                </div>

                {report.weakTopics.length > 0 && (
                  <div
                    className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-red-400">Revise These Topics</p>
                      <p className="text-[10px] text-white/50">{report.weakTopics.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─ Key Insights ─ */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Key Insights</p>
              {report.attentivePercent >= 70 && (
                <Insight icon={CheckCheck} text={`You stayed focused for ${report.attentivePercent}% of the session — great!`} color="#34D399" />
              )}
              {report.distractedPercent > 30 && (
                <Insight icon={AlertCircle} text={`You were distracted ${report.distractedPercent}% of the time — try a quieter environment.`} color="#F87171" />
              )}
              {report.overallAccuracy >= 80 && report.totalMCQAttempted > 0 && (
                <Insight icon={Target} text={`Excellent MCQ accuracy (${report.overallAccuracy}%) — you've mastered these concepts!`} color="#34D399" />
              )}
              {totalTopics > 0 && (
                <Insight icon={TrendingUp} text={`${totalTopics} topic${totalTopics > 1 ? 's' : ''} covered: ${report.topicsCovered.map(t => t.topic).join(' → ')}`} color="#818CF8" />
              )}
            </div>

            {/* ─ AI Mentor Feedback ─ */}
            {feedbackMsg && (
              <div
                className="p-3.5 rounded-xl"
                style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25` }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
                  💬 {teacherName} says
                </p>
                <p className="text-sm text-white/80 italic leading-relaxed">"{feedbackMsg}"</p>
              </div>
            )}

            {/* ─ Actions ─ */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/60 hover:bg-white/5 transition-all"
              >
                Back to Session
              </button>
              <button
                onClick={onNewSession}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: accentColor }}
              >
                New Session 🚀
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function Insight({ icon: Icon, text, color }: { icon: React.ElementType; text: string; color: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
      <p className="text-xs text-white/60 leading-snug">{text}</p>
    </div>
  );
}
