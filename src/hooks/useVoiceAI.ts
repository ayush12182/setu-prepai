import { useState, useCallback, useRef } from 'react';
import { useJeetuChat } from './useJeetuChat';

type Message = { role: 'user' | 'assistant'; content: string };

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts-stream`;
const SCRIBE_TOKEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-scribe-token`;

export type VoiceMode = 'push-to-talk' | 'continuous';

export const useVoiceAI = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('push-to-talk');
  const [liveTranscript, setLiveTranscript] = useState('');

  const { sendMessage, isLoading: isChatLoading } = useJeetuChat();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scribeWsRef = useRef<WebSocket | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const playTTS = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      stopAudio();

      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error('TTS failed:', response.status);
        setIsSpeaking(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (e) {
      console.error('TTS playback error:', e);
      setIsSpeaking(false);
    }
  }, [stopAudio]);

  const getScribeToken = useCallback(async (): Promise<string | null> => {
    try {
      const resp = await fetch(SCRIBE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (!resp.ok) throw new Error('Failed to get scribe token');
      const { token } = await resp.json();
      return token;
    } catch (e) {
      console.error('Scribe token error:', e);
      return null;
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (scribeWsRef.current) {
      try { scribeWsRef.current.close(); } catch {}
      scribeWsRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startListening = useCallback(async (
    chatHistory: Message[],
    onTranscript: (text: string) => void,
    onAssistantDelta: (chunk: string) => void,
    onAssistantDone: (fullText: string) => void,
  ) => {
    // Stop any playing audio
    stopAudio();

    try {
      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      streamRef.current = stream;

      // Get scribe token
      const token = await getScribeToken();
      if (!token) {
        stream.getTracks().forEach(t => t.stop());
        throw new Error('Could not get transcription token');
      }

      setIsListening(true);
      isListeningRef.current = true;
      transcriptRef.current = '';
      setLiveTranscript('');

      // Connect to ElevenLabs Scribe WebSocket
      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/speech-to-text/ws?model_id=scribe_v2_realtime&language_code=hi&token=${token}`
      );
      scribeWsRef.current = ws;

      ws.onopen = () => {
        // Start sending audio via MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const buffer = await event.data.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };

        mediaRecorder.start(250); // Send chunks every 250ms
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'partial_transcript' && data.text) {
            setLiveTranscript(transcriptRef.current + data.text);
          }
          
          if (data.type === 'committed_transcript' && data.text) {
            transcriptRef.current += (transcriptRef.current ? ' ' : '') + data.text;
            setLiveTranscript(transcriptRef.current);

            // Reset silence timeout
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            
            // In push-to-talk, don't auto-send
            if (voiceMode === 'continuous') {
              silenceTimeoutRef.current = setTimeout(() => {
                if (isListeningRef.current && transcriptRef.current.trim()) {
                  finalizeSpeech(chatHistory, onTranscript, onAssistantDelta, onAssistantDone);
                }
              }, 2000);
            }
          }
        } catch {}
      };

      ws.onerror = (e) => {
        console.error('Scribe WS error:', e);
        stopListening();
      };

      ws.onclose = () => {
        // Only process if we were actively listening
      };

    } catch (e) {
      console.error('Start listening error:', e);
      stopListening();
      throw e;
    }
  }, [stopAudio, getScribeToken, voiceMode, stopListening]);

  const finalizeSpeech = useCallback(async (
    chatHistory: Message[],
    onTranscript: (text: string) => void,
    onAssistantDelta: (chunk: string) => void,
    onAssistantDone: (fullText: string) => void,
  ) => {
    const finalText = transcriptRef.current.trim();
    stopListening();

    if (!finalText) return;

    onTranscript(finalText);
    setLiveTranscript('');
    setIsProcessing(true);

    // Send to Jeetu Chat LLM
    const fullHistory = [...chatHistory, { role: 'user' as const, content: finalText }];
    let assistantFull = '';

    await sendMessage(
      fullHistory,
      (chunk) => {
        assistantFull += chunk;
        onAssistantDelta(chunk);
      },
      () => {
        setIsProcessing(false);
        onAssistantDone(assistantFull);
        // Auto-play TTS
        if (assistantFull.trim()) {
          playTTS(assistantFull);
        }
      }
    );
  }, [stopListening, sendMessage, playTTS]);

  // For push-to-talk: call this when user releases button
  const stopAndProcess = useCallback(async (
    chatHistory: Message[],
    onTranscript: (text: string) => void,
    onAssistantDelta: (chunk: string) => void,
    onAssistantDone: (fullText: string) => void,
  ) => {
    await finalizeSpeech(chatHistory, onTranscript, onAssistantDelta, onAssistantDone);
  }, [finalizeSpeech]);

  return {
    isListening,
    isSpeaking,
    isProcessing,
    isChatLoading,
    voiceMode,
    setVoiceMode,
    liveTranscript,
    startListening,
    stopListening,
    stopAndProcess,
    stopAudio,
    playTTS,
  };
};
