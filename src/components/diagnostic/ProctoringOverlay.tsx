import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Maximize, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';

export interface ProctoringEvent {
  type: 'tab_switch' | 'fullscreen_exit' | 'copy_attempt' | 'camera_inactive' | 'camera_denied' | 'face_missing';
  timestamp: number;
  detail?: string;
}

export interface ProctoringState {
  tabSwitchCount: number;
  fullscreenExitCount: number;
  copyAttemptCount: number;
  cameraInactiveSeconds: number;
  events: ProctoringEvent[];
  integrityScore: number;
}

interface ProctoringOverlayProps {
  onStateChange: (state: ProctoringState) => void;
  enabled?: boolean;
}

const calcIntegrity = (s: ProctoringState) =>
  Math.max(0,
    100
    - Math.min(s.tabSwitchCount, 10) * 5
    - Math.min(s.fullscreenExitCount, 5) * 4
    - Math.min(s.copyAttemptCount, 10) * 3
    - Math.min(Math.floor(s.cameraInactiveSeconds / 30), 10) * 2
  );

export const ProctoringOverlay: React.FC<ProctoringOverlayProps> = ({
  onStateChange,
  enabled = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInactiveRef = useRef(0);
  const [camStatus, setCamStatus] = useState<'requesting' | 'active' | 'denied' | 'inactive'>('requesting');
  const [faceStatus, setFaceStatus] = useState<'detecting' | 'present' | 'missing'>('detecting');
  const faceMissingSecsRef = useRef(0);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [tabWarningCount, setTabWarningCount] = useState(0);
  const [warningTimeout, setWarningTimeout] = useState(0);
  const warningActiveRef = useRef(false);

  const stateRef = useRef<ProctoringState>({
    tabSwitchCount: 0,
    fullscreenExitCount: 0,
    copyAttemptCount: 0,
    cameraInactiveSeconds: 0,
    events: [],
    integrityScore: 100,
  });

  const addEvent = useCallback((type: ProctoringEvent['type'], detail?: string) => {
    const ev: ProctoringEvent = { type, timestamp: Date.now(), detail };
    stateRef.current = {
      ...stateRef.current,
      events: [...stateRef.current.events, ev],
      tabSwitchCount: type === 'tab_switch' ? stateRef.current.tabSwitchCount + 1 : stateRef.current.tabSwitchCount,
      fullscreenExitCount: type === 'fullscreen_exit' ? stateRef.current.fullscreenExitCount + 1 : stateRef.current.fullscreenExitCount,
      copyAttemptCount: type === 'copy_attempt' ? stateRef.current.copyAttemptCount + 1 : stateRef.current.copyAttemptCount,
    };
    stateRef.current.integrityScore = calcIntegrity(stateRef.current);
    onStateChange({ ...stateRef.current });
  }, [onStateChange]);

  // Request camera
  useEffect(() => {
    if (!enabled) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream;
        setCamStatus('active');
      })
      .catch(() => {
        setCamStatus('denied');
        addEvent('camera_denied', 'User denied camera access');
      });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [enabled, addEvent]);

  // Attach stream to video element when camStatus is active
  useEffect(() => {
    if (camStatus === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camStatus]);

  // Face detection — uses browser FaceDetector API with canvas fallback
  useEffect(() => {
    if (!enabled || camStatus !== 'active') return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let detector: any = null;

    // Try native FaceDetector first
    if (typeof (window as any).FaceDetector !== 'undefined') {
      try { detector = new (window as any).FaceDetector({ fastMode: true }); } catch {}
    }

    const checkFace = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        if (detector) {
          const faces = await detector.detect(video);
          const hasFace = faces.length > 0;
          setFaceStatus(hasFace ? 'present' : 'missing');
          if (!hasFace) {
            faceMissingSecsRef.current += 3;
            if (faceMissingSecsRef.current >= 15) {
              addEvent('face_missing', `Face absent for ${faceMissingSecsRef.current}s`);
              faceMissingSecsRef.current = 0; // Reset after logging
            }
          } else {
            faceMissingSecsRef.current = 0;
          }
        } else {
          // Fallback: canvas pixel variance — if not enough variation, assume no face
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          const px = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
          if (px) {
            let sum = 0, sumSq = 0;
            for (let i = 0; i < px.length; i += 16) sum += px[i];
            const mean = sum / (px.length / 16);
            for (let i = 0; i < px.length; i += 16) sumSq += (px[i] - mean) ** 2;
            const variance = sumSq / (px.length / 16);
            setFaceStatus(variance > 200 ? 'present' : 'missing');
          }
        }
      } catch { setFaceStatus('present'); } // On error, assume present
    };

    const interval = setInterval(checkFace, 3000);
    return () => clearInterval(interval);
  }, [enabled, camStatus, addEvent]);

  // Request full screen on start
  useEffect(() => {
    if (!enabled) return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setShowFullscreenPrompt(true);
      });
    }
  }, [enabled]);

  // Tab visibility & focus change detector
  useEffect(() => {
    if (!enabled) return;
    const handleAway = () => {
      if ((document.hidden || !document.hasFocus()) && !warningActiveRef.current) {
        warningActiveRef.current = true;
        addEvent('tab_switch', 'Student switched away from test tab/window');
        setTabWarningCount(c => c + 1);
        setShowTabWarning(true);
        setWarningTimeout(3); // 3 second penalty
      }
    };
    
    document.addEventListener('visibilitychange', handleAway);
    window.addEventListener('blur', handleAway);
    return () => {
      document.removeEventListener('visibilitychange', handleAway);
      window.removeEventListener('blur', handleAway);
    };
  }, [enabled, addEvent]);

  // Penalty timer
  useEffect(() => {
    if (warningTimeout > 0) {
      const timer = setTimeout(() => setWarningTimeout(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [warningTimeout]);

  const dismissWarning = () => {
    setShowTabWarning(false);
    setTimeout(() => { warningActiveRef.current = false; }, 500); // Small buffer to prevent instant re-trigger
  };

  // Fullscreen exit detector
  useEffect(() => {
    if (!enabled) return;
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        addEvent('fullscreen_exit', 'Exited fullscreen mode');
        setShowFullscreenPrompt(true);
      } else {
        setShowFullscreenPrompt(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [enabled, addEvent]);

  // Copy/paste prevention
  useEffect(() => {
    if (!enabled) return;
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addEvent('copy_attempt', 'Copy attempt on question text');
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [enabled, addEvent]);

  // Camera inactive counter (every 30s of no camera = flag)
  useEffect(() => {
    if (!enabled || camStatus !== 'active') return;
    const interval = setInterval(() => {
      const track = streamRef.current?.getVideoTracks()[0];
      if (!track || track.readyState !== 'live') {
        cameraInactiveRef.current += 5;
        stateRef.current = {
          ...stateRef.current,
          cameraInactiveSeconds: cameraInactiveRef.current,
        };
        stateRef.current.integrityScore = calcIntegrity(stateRef.current);
        onStateChange({ ...stateRef.current });
        setCamStatus('inactive');
        addEvent('camera_inactive', `Camera inactive for ${cameraInactiveRef.current}s`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [enabled, camStatus, addEvent, onStateChange]);

  if (!enabled) return null;

  const integrityScore = stateRef.current.integrityScore;
  const scoreColor = integrityScore >= 80 ? 'text-emerald-400' : integrityScore >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = integrityScore >= 80 ? 'bg-emerald-500/20 border-emerald-500/30' : integrityScore >= 60 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-red-500/20 border-red-500/30';

  return (
    <>
      {/* Camera Widget — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* Integrity score pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${scoreBg} ${scoreColor}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          Integrity: {integrityScore}%
        </div>

        {/* Camera feed */}
        <div className="relative w-28 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
          {camStatus === 'active' || camStatus === 'inactive' ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-1 left-1 flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  faceStatus === 'present' ? 'bg-emerald-400 animate-pulse' :
                  faceStatus === 'missing' ? 'bg-red-400 animate-pulse' :
                  'bg-amber-400 animate-pulse'
                }`} />
                <span className="text-[9px] text-white/60 font-medium">
                  {faceStatus === 'present' ? 'Face ✓' : faceStatus === 'missing' ? 'No Face' : 'Live'}
                </span>
              </div>
              {faceStatus === 'missing' && (
                <div className="absolute inset-0 border-2 border-red-500/70 rounded-xl animate-pulse pointer-events-none" />
              )}
              <div className="absolute top-1 right-1">
                <Eye className="w-3 h-3 text-white/40" />
              </div>
            </>
          ) : camStatus === 'requesting' ? (
            <div className="flex items-center justify-center h-full">
              <Camera className="w-6 h-6 text-white/30 animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <CameraOff className="w-5 h-5 text-red-400" />
              <span className="text-[9px] text-white/40">No Camera</span>
            </div>
          )}
        </div>
      </div>

      {/* Aggressive Tab Switch Warning Banner */}
      <AnimatePresence>
        {showTabWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center shadow-2xl"
          >
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6 animate-pulse">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">WARNING: TEST COMPROMISED</h2>
            <p className="text-xl text-red-200 mb-8 max-w-2xl font-medium">
              You navigated away from the assessment screen. This is a strict violation of proctoring rules. 
              Further violations will result in auto-submission and cancellation of your test.
            </p>
            
            <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-6 w-full max-w-md mb-8 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-red-300 font-medium">Recorded Violation:</span>
                <span className="text-white font-bold">Focus Lost / Tab Switch</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-300 font-medium">Total Violations:</span>
                <span className="text-white font-bold">{tabWarningCount}</span>
              </div>
            </div>

            <button
              onClick={dismissWarning}
              disabled={warningTimeout > 0}
              className={`px-10 py-4 rounded-xl font-bold text-lg transition-all ${
                warningTimeout > 0 
                  ? 'bg-red-500/20 text-red-200 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]'
              }`}
            >
              {warningTimeout > 0 ? `Wait ${warningTimeout}s to return` : 'I Understand, Return to Test'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Prompt */}
      <AnimatePresence>
        {showFullscreenPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-sm text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto">
                <Maximize className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Fullscreen Required</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                This proctored test must be taken in fullscreen mode to ensure integrity.
                Please return to fullscreen to continue.
              </p>
              <button
                onClick={() => {
                  document.documentElement.requestFullscreen().then(() => {
                    setShowFullscreenPrompt(false);
                  });
                }}
                className="w-full py-3 px-6 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
              >
                <Maximize className="w-4 h-4 inline mr-2" />
                Return to Fullscreen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
