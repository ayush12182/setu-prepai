/**
 * useEngagementDetector.ts
 *
 * Phase 1 MVP — Face presence and attention tracking using MediaPipe FaceDetector.
 * All processing is fully on-device (WASM). No raw video is sent to any server.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// ────────────────────────────────────────
//  Types
// ────────────────────────────────────────

export type EngagementState = 'focused' | 'distracted' | 'away' | 'idle';

export interface EngagementEvent {
  type: 'attention_drop' | 'attention_restored' | 'face_lost' | 'face_found';
  timestamp: number;
}

export interface SessionStats {
  totalMs: number;
  attentiveMs: number;
  distractedMs: number;
  attentivePercent: number;
  distractedPercent: number;
  engagementTimeline: { t: number; score: number }[];
}

export interface UseEngagementDetectorReturn {
  // Current state
  engagementScore: number;       // 0–100, smoothed
  engagementState: EngagementState;
  facePresent: boolean;
  isPermissionGranted: boolean | null; // null = not yet asked
  isDetectorReady: boolean;

  // Control
  startDetection: (videoEl: HTMLVideoElement) => Promise<void>;
  stopDetection: () => void;

  // Post-session
  sessionStats: SessionStats | null;

  // Camera stream (to display in preview)
  cameraStream: MediaStream | null;
}

// ────────────────────────────────────────
//  Constants
// ────────────────────────────────────────
const POLL_INTERVAL_MS = 600;      // MediaPipe inference every 600ms (lightweight)
const EMA_ALPHA = 0.3;             // Exponential moving average smoothing factor
const TIMELINE_SAMPLE_MS = 5000;   // Record score to timeline every 5s
const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

// ────────────────────────────────────────
//  Hook
// ────────────────────────────────────────
export function useEngagementDetector(): UseEngagementDetectorReturn {
  const [engagementScore, setEngagementScore]       = useState(100);
  const [engagementState, setEngagementState]       = useState<EngagementState>('idle');
  const [facePresent, setFacePresent]               = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);
  const [isDetectorReady, setIsDetectorReady]       = useState(false);
  const [cameraStream, setCameraStream]             = useState<MediaStream | null>(null);
  const [sessionStats, setSessionStats]             = useState<SessionStats | null>(null);

  const detectorRef        = useRef<FaceDetector | null>(null);
  const videoRef           = useRef<HTMLVideoElement | null>(null);
  const streamRef          = useRef<MediaStream | null>(null);
  const pollingRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const timelineTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const smoothedScoreRef   = useRef(100);

  // Session tracking (mutable refs to avoid stale closures)
  const sessionStartRef    = useRef<number | null>(null);
  const attentiveMsRef     = useRef(0);
  const distractedMsRef    = useRef(0);
  const lastTickRef        = useRef<number | null>(null);
  const timelineRef        = useRef<{ t: number; score: number }[]>([]);

  // ── Initialise MediaPipe Face Detector (lazy, on first call)
  const initDetector = useCallback(async () => {
    if (detectorRef.current) return; // already initialised
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
      detectorRef.current = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          // Tiny BlazeFace model — ~350KB
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });
      setIsDetectorReady(true);
    } catch (err) {
      console.error('[Engagement] MediaPipe init failed:', err);
      setIsDetectorReady(false);
    }
  }, []);

  // ── Start detection
  const startDetection = useCallback(async (videoEl: HTMLVideoElement) => {
    videoRef.current = videoEl;

    // Request camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
        audio: false,
      });
      setIsPermissionGranted(true);
      setCameraStream(stream);
      streamRef.current = stream;

      videoEl.srcObject = stream;
      await videoEl.play();
    } catch {
      setIsPermissionGranted(false);
      return;
    }

    // Initialise detector
    await initDetector();
    if (!detectorRef.current) return;

    // Reset session counters
    sessionStartRef.current  = Date.now();
    lastTickRef.current      = Date.now();
    attentiveMsRef.current   = 0;
    distractedMsRef.current  = 0;
    timelineRef.current      = [];
    smoothedScoreRef.current = 100;

    // Polling loop
    pollingRef.current = setInterval(() => {
      if (!detectorRef.current || !videoRef.current) return;

      const now = Date.now();
      const dt  = now - (lastTickRef.current ?? now);
      lastTickRef.current = now;

      try {
        const result = detectorRef.current.detectForVideo(videoRef.current!, now);
        const detected = result.detections.length > 0;
        setFacePresent(detected);

        // Raw score: 100 if face present, 0 if not
        const rawScore = detected ? 100 : 0;

        // Exponential moving average to smooth jitter
        smoothedScoreRef.current =
          EMA_ALPHA * rawScore + (1 - EMA_ALPHA) * smoothedScoreRef.current;

        const score = Math.round(smoothedScoreRef.current);
        setEngagementScore(score);

        // Classify state
        const state: EngagementState =
          score >= 70 ? 'focused' :
          score >= 40 ? 'distracted' :
          detected    ? 'distracted' : 'away';
        setEngagementState(state);

        // Accrue session time
        if (score >= 60) attentiveMsRef.current  += dt;
        else             distractedMsRef.current += dt;

      } catch {
        // Video not ready yet — skip
      }
    }, POLL_INTERVAL_MS);

    // Timeline sampler (every 5s)
    timelineTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - (sessionStartRef.current ?? Date.now());
      timelineRef.current.push({ t: Math.round(elapsed / 1000), score: Math.round(smoothedScoreRef.current) });
    }, TIMELINE_SAMPLE_MS);
  }, [initDetector]);

  // ── Stop detection and compute session stats
  const stopDetection = useCallback(() => {
    if (pollingRef.current)      clearInterval(pollingRef.current);
    if (timelineTimerRef.current) clearInterval(timelineTimerRef.current);

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraStream(null);

    // Compute final session stats
    if (sessionStartRef.current !== null) {
      const totalMs = Date.now() - sessionStartRef.current;
      const attentiveMs   = attentiveMsRef.current;
      const distractedMs  = distractedMsRef.current;

      setSessionStats({
        totalMs,
        attentiveMs,
        distractedMs,
        attentivePercent:   totalMs ? Math.round((attentiveMs  / totalMs) * 100) : 0,
        distractedPercent:  totalMs ? Math.round((distractedMs / totalMs) * 100) : 0,
        engagementTimeline: [...timelineRef.current],
      });
    }

    setEngagementScore(100);
    setEngagementState('idle');
    setFacePresent(false);
    sessionStartRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      detectorRef.current?.close();
    };
  }, [stopDetection]);

  return {
    engagementScore,
    engagementState,
    facePresent,
    isPermissionGranted,
    isDetectorReady,
    startDetection,
    stopDetection,
    sessionStats,
    cameraStream,
  };
}
