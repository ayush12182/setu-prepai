/**
 * EngagementOverlay.tsx
 *
 * Unobtrusive camera widget for the AI Teacher session.
 * Shows a small student-facing camera preview with engagement state badge.
 * "Camera Off" disables tracking instantly.
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { EngagementState, SessionStats } from '@/hooks/useEngagementDetector';

interface EngagementOverlayProps {
  cameraStream: MediaStream | null;
  engagementScore: number;
  engagementState: EngagementState;
  facePresent: boolean;
  isPermissionGranted: boolean | null;
  isDetectorReady: boolean;
  onEnable: () => void;
  onDisable: () => void;
  isEnabled: boolean;
}

const STATE_CONFIG: Record<EngagementState, { label: string; color: string; dot: string }> = {
  focused:    { label: 'Focused',    color: 'text-emerald-400', dot: 'bg-emerald-400' },
  distracted: { label: 'Distracted', color: 'text-amber-400',   dot: 'bg-amber-400'   },
  away:       { label: 'Away',       color: 'text-red-400',     dot: 'bg-red-400'     },
  idle:       { label: 'Ready',      color: 'text-white/50',    dot: 'bg-white/30'    },
};

export const EngagementOverlay: React.FC<EngagementOverlayProps> = ({
  cameraStream,
  engagementScore,
  engagementState,
  facePresent,
  isPermissionGranted,
  isDetectorReady,
  onEnable,
  onDisable,
  isEnabled,
}) => {
  const previewRef = useRef<HTMLVideoElement>(null);

  // Wire the stream to the preview video element
  useEffect(() => {
    if (previewRef.current && cameraStream) {
      previewRef.current.srcObject = cameraStream;
      previewRef.current.play().catch(() => {});
    } else if (previewRef.current) {
      previewRef.current.srcObject = null;
    }
  }, [cameraStream]);

  const stateConfig = STATE_CONFIG[engagementState];

  return (
    <div className="relative">
      {/* ── Camera Preview Chip */}
      <div
        className="relative overflow-hidden rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm"
        style={{ width: 120, height: 90 }}
      >
        {/* Live stream */}
        <video
          ref={previewRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', opacity: cameraStream ? 1 : 0 }} // Mirror like a regular camera
        />

        {/* Placeholder when camera is off */}
        {!cameraStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <CameraOff className="w-5 h-5 text-white/30" />
            <span className="text-[10px] text-white/30 text-center">Camera Off</span>
          </div>
        )}

        {/* Permission denied banner */}
        {isPermissionGranted === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-950/80 p-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-[9px] text-red-300 text-center leading-tight">Camera access denied</span>
          </div>
        )}

        {/* Face detection dot (top-right) */}
        {isEnabled && isDetectorReady && (
          <div className="absolute top-1.5 right-1.5">
            <motion.div
              animate={{ scale: facePresent ? [1, 1.3, 1] : 1, opacity: facePresent ? 1 : 0.3 }}
              transition={{ repeat: facePresent ? Infinity : 0, duration: 1.5 }}
              className={`w-2 h-2 rounded-full ${facePresent ? 'bg-emerald-400' : 'bg-red-400'}`}
            />
          </div>
        )}
      </div>

      {/* ── Engagement State Badge */}
      {isEnabled && isDetectorReady && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 flex items-center gap-1.5 justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${stateConfig.dot}`}
          />
          <span className={`text-[10px] font-semibold ${stateConfig.color}`}>
            {stateConfig.label}
          </span>
          <span className="text-[9px] text-white/30">{engagementScore}%</span>
        </motion.div>
      )}

      {/* ── Toggle Button */}
      <div className="mt-1.5 flex justify-center">
        {isEnabled ? (
          <button
            onClick={onDisable}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <EyeOff className="w-3 h-3" />
            Turn Off
          </button>
        ) : (
          <button
            onClick={onEnable}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-white/50 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
          >
            <Eye className="w-3 h-3" />
            <Camera className="w-3 h-3" />
            Enable Focus Mode
          </button>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   SESSION STATS CARD (shown after session ends)
────────────────────────────────────────────── */

interface SessionStatsCardProps {
  stats: SessionStats;
  onDismiss: () => void;
}

export const SessionStatsCard: React.FC<SessionStatsCardProps> = ({ stats, onDismiss }) => {
  const minutes = Math.floor(stats.totalMs / 60000);
  const seconds = Math.floor((stats.totalMs % 60000) / 1000);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed bottom-6 right-6 z-50 bg-[#1a2535] border border-white/10 rounded-2xl p-4 shadow-2xl w-72"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Session Focus Report 📊</h3>
          <button onClick={onDismiss} className="text-white/40 hover:text-white text-xs">✕</button>
        </div>
        <p className="text-[11px] text-white/40 mb-3">
          Session: {minutes}m {seconds}s
        </p>

        {/* Bars */}
        <div className="space-y-2 mb-3">
          <StatBar label="Attentive" value={stats.attentivePercent} color="#34D399" />
          <StatBar label="Distracted" value={stats.distractedPercent} color="#F59E0B" />
        </div>

        {/* Simple score summary */}
        <p className="text-[11px] text-white/50 text-center mt-2">
          {stats.attentivePercent >= 70
            ? '🌟 Great focus today! Keep it up!'
            : stats.attentivePercent >= 45
            ? '💪 Good effort! Try to minimize distractions next session.'
            : '📱 Lots of distractions. Try a quieter spot next time!'}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
