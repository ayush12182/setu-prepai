/**
 * useEngagementDetector.ts
 *
 * Phase 1 MVP — Face presence + gaze/eye attention tracking using MediaPipe.
 * Uses FaceLandmarker for full eye + iris tracking (not just face presence).
 * All processing is fully on-device (WASM). No raw video is sent to any server.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';

// ────────────────────────────────────────
//  Types
// ────────────────────────────────────────

export type EngagementState = 'focused' | 'distracted' | 'away' | 'idle';

export interface SessionStats {
  totalMs: number;
  attentiveMs: number;
  distractedMs: number;
  attentivePercent: number;
  distractedPercent: number;
  engagementTimeline: { t: number; score: number }[];
}

export interface UseEngagementDetectorReturn {
  engagementScore: number;
  engagementState: EngagementState;
  facePresent: boolean;
  isPermissionGranted: boolean | null;
  isDetectorReady: boolean;
  startDetection: (videoEl: HTMLVideoElement) => Promise<void>;
  stopDetection: () => void;
  sessionStats: SessionStats | null;
  cameraStream: MediaStream | null;
}

// ────────────────────────────────────────
//  Constants — pinned version for stability
// ────────────────────────────────────────
const MP_VERSION = '0.10.14';
const WASM_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL = `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`;

const POLL_INTERVAL_MS = 200;      // 5 FPS is enough for engagement
const EMA_ALPHA = 0.25;
const TIMELINE_SAMPLE_MS = 5000;

// Iris landmark indices (MediaPipe FaceLandmarker 478-point model)
// Center of each iris: left = 468, right = 473
const LEFT_IRIS_CENTER  = 468;
const RIGHT_IRIS_CENTER = 473;
const LEFT_EYE_LEFT  = 33;  // left corner of left eye
const LEFT_EYE_RIGHT = 133; // right corner of left eye
const LEFT_EYE_TOP   = 159;
const LEFT_EYE_BOT   = 145;

// ────────────────────────────────────────
//  Gaze utilities
// ────────────────────────────────────────

/**
 * Returns a horizontal gaze ratio for one eye.
 * 0.5 = looking straight at screen, <0.3 or >0.7 = looking away
 */
function getGazeRatio(lm: NormalizedLandmark[]): number {
  const iris = lm[LEFT_IRIS_CENTER];
  const eyeL = lm[LEFT_EYE_LEFT];
  const eyeR = lm[LEFT_EYE_RIGHT];
  if (!iris || !eyeL || !eyeR) return 0.5;
  const eyeWidth = Math.abs(eyeR.x - eyeL.x);
  if (eyeWidth < 0.001) return 0.5;
  const ratio = (iris.x - eyeL.x) / eyeWidth;
  return ratio;
}

/**
 * Check if eyes are open (vertical eye openness).
 * Returns 0 (closed) to 1 (fully open)
 */
function getEyeOpenness(lm: NormalizedLandmark[]): number {
  const top = lm[LEFT_EYE_TOP];
  const bot = lm[LEFT_EYE_BOT];
  const eyeL = lm[LEFT_EYE_LEFT];
  const eyeR = lm[LEFT_EYE_RIGHT];
  if (!top || !bot || !eyeL || !eyeR) return 1;
  const eyeHeight = Math.abs(top.y - bot.y);
  const eyeWidth  = Math.abs(eyeR.x - eyeL.x);
  if (eyeWidth < 0.001) return 1;
  // Normalized aspect ratio — typically 0.2–0.4 when open, <0.1 when closed
  return Math.min(1, eyeHeight / eyeWidth / 0.35);
}

// ────────────────────────────────────────
//  Hook
// ────────────────────────────────────────
export function useEngagementDetector(): UseEngagementDetectorReturn {
  const [engagementScore, setEngagementScore]        = useState(100);
  const [engagementState, setEngagementState]        = useState<EngagementState>('idle');
  const [facePresent, setFacePresent]                = useState(false);
  const [isPermissionGranted, setIsPermissionGranted]= useState<boolean | null>(null);
  const [isDetectorReady, setIsDetectorReady]        = useState(false);
  const [cameraStream, setCameraStream]              = useState<MediaStream | null>(null);
  const [sessionStats, setSessionStats]              = useState<SessionStats | null>(null);

  const detectorRef       = useRef<FaceLandmarker | null>(null);
  const videoRef          = useRef<HTMLVideoElement | null>(null);
  const streamRef         = useRef<MediaStream | null>(null);
  const pollingRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const timelineTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const smoothedScoreRef  = useRef(100);
  const sessionStartRef   = useRef<number | null>(null);
  const attentiveMsRef    = useRef(0);
  const distractedMsRef   = useRef(0);
  const lastTickRef       = useRef<number | null>(null);
  const timelineRef       = useRef<{ t: number; score: number }[]>([]);

  // ── Init MediaPipe FaceLandmarker (with CPU fallback)
  const initDetector = useCallback(async () => {
    if (detectorRef.current) return;
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_CDN);

      // Try GPU first, fall back to CPU silently
      let detector: FaceLandmarker | null = null;
      try {
        detector = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      } catch {
        console.warn('[Engagement] GPU delegate failed, falling back to CPU');
        detector = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      }

      detectorRef.current = detector;
      setIsDetectorReady(true);
      console.log('[Engagement] FaceLandmarker ready ✅');
    } catch (err) {
      console.error('[Engagement] MediaPipe init failed:', err);
      setIsDetectorReady(false);
    }
  }, []);

  // ── Start detection
  const startDetection = useCallback(async (videoEl: HTMLVideoElement) => {
    videoRef.current = videoEl;

    // Camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });
      setIsPermissionGranted(true);
      setCameraStream(stream);
      streamRef.current = stream;
      videoEl.srcObject = stream;

      // Wait for video to actually have pixel data
      await new Promise<void>((resolve, reject) => {
        videoEl.onloadeddata = () => resolve();
        videoEl.onerror = () => reject(new Error('Video failed to load'));
        videoEl.play().catch(reject);
        // Safety timeout
        setTimeout(resolve, 3000);
      });
    } catch {
      setIsPermissionGranted(false);
      return;
    }

    await initDetector();
    if (!detectorRef.current) return;

    // Reset counters
    sessionStartRef.current  = Date.now();
    lastTickRef.current      = Date.now();
    attentiveMsRef.current   = 0;
    distractedMsRef.current  = 0;
    timelineRef.current      = [];
    smoothedScoreRef.current = 100;

    // ── Polling loop
    pollingRef.current = setInterval(() => {
      if (!detectorRef.current || !videoRef.current) return;
      const video = videoRef.current;

      // Guard: video must be playing and have data
      if (video.readyState < 2 || video.paused || video.videoWidth === 0) return;

      const now = Date.now();
      const dt  = now - (lastTickRef.current ?? now);
      lastTickRef.current = now;

      try {
        const result = detectorRef.current.detectForVideo(video, now);
        const hasLandmarks = result.faceLandmarks && result.faceLandmarks.length > 0;
        setFacePresent(hasLandmarks);

        let rawScore = 0;

        if (hasLandmarks) {
          const lm = result.faceLandmarks[0];

          // Eye gaze: 0.5 = looking at screen
          const gazeRatio    = getGazeRatio(lm);
          const gazeCentered = 1 - Math.min(1, Math.abs(gazeRatio - 0.5) / 0.25);

          // Eye openness
          const openness = getEyeOpenness(lm);

          // Iris presence (478-landmark model includes iris if available)
          const hasIris = lm[LEFT_IRIS_CENTER] !== undefined && lm[RIGHT_IRIS_CENTER] !== undefined;

          if (hasIris) {
            // Full score: weighted sum of face presence, gaze, eyes open
            rawScore = Math.round(
              0.40 * 100 +           // face is present (40%)
              0.40 * gazeCentered * 100 + // gaze toward screen (40%)
              0.20 * openness * 100        // eyes open (20%)
            );
          } else {
            // No iris data — just face presence
            rawScore = 65;
          }
        } else {
          rawScore = 0; // face not detected
        }

        // EMA smoothing
        smoothedScoreRef.current =
          EMA_ALPHA * rawScore + (1 - EMA_ALPHA) * smoothedScoreRef.current;

        const score = Math.round(Math.max(0, Math.min(100, smoothedScoreRef.current)));
        setEngagementScore(score);

        const state: EngagementState =
          score >= 65 ? 'focused' :
          score >= 35 ? 'distracted' : 'away';
        setEngagementState(state);

        if (score >= 55) attentiveMsRef.current  += dt;
        else             distractedMsRef.current += dt;

      } catch (e) {
        console.warn('[Engagement] Detection error (skipping frame):', e);
      }
    }, POLL_INTERVAL_MS);

    // Timeline sampler
    timelineTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - (sessionStartRef.current ?? Date.now());
      timelineRef.current.push({
        t: Math.round(elapsed / 1000),
        score: Math.round(smoothedScoreRef.current),
      });
    }, TIMELINE_SAMPLE_MS);
  }, [initDetector]);

  // ── Stop detection
  const stopDetection = useCallback(() => {
    if (pollingRef.current)      clearInterval(pollingRef.current);
    if (timelineTimerRef.current) clearInterval(timelineTimerRef.current);
    pollingRef.current = null;
    timelineTimerRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraStream(null);

    if (sessionStartRef.current !== null) {
      const totalMs        = Date.now() - sessionStartRef.current;
      const attentiveMs    = attentiveMsRef.current;
      const distractedMs   = distractedMsRef.current;
      setSessionStats({
        totalMs,
        attentiveMs,
        distractedMs,
        attentivePercent:  totalMs ? Math.round((attentiveMs  / totalMs) * 100) : 0,
        distractedPercent: totalMs ? Math.round((distractedMs / totalMs) * 100) : 0,
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
