import { useState, useCallback, useRef, useEffect } from 'react';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface UseVoiceChatOptions {
  onTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

interface UseVoiceChatResult {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSupported: boolean;
}

export const useVoiceChat = ({
  onTranscript,
  onFinalTranscript,
  onSpeakStart,
  onSpeakEnd,
}: UseVoiceChatOptions): UseVoiceChatResult => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    'speechSynthesis' in window;

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Hindi for Hinglish support
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      onTranscript(currentTranscript);
      
      // Reset silence timeout on new speech
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Auto-send after 2 seconds of silence (for final transcript)
      if (finalTranscript) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (isListening && finalTranscript.trim()) {
            onFinalTranscript(finalTranscript.trim());
            setTranscript('');
            stopListening();
          }
        }, 1500);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };
    
    recognition.onend = () => {
      // Restart if we're still supposed to be listening
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      recognition.stop();
    };
  }, [isSupported, isListening, onTranscript, onFinalTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    // Stop speaking if Jeetu is talking
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    setTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started
    }
  }, [isSpeaking]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setIsListening(false);
    recognitionRef.current.stop();
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    
    // Stop listening while speaking
    if (isListening) {
      stopListening();
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown, etc.)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\n+/g, '. ')
      .replace(/[#*_]/g, '')
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure for calm, friendly voice
    utterance.lang = 'hi-IN'; // Hindi for Hinglish
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 1.0;
    
    // Try to find a good Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi')) || 
                       voices.find(v => v.lang.includes('en-IN')) ||
                       voices[0];
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakStart?.();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakEnd?.();
      synthRef.current = null;
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      onSpeakEnd?.();
      synthRef.current = null;
    };
    
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isListening, stopListening, onSpeakStart, onSpeakEnd]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    onSpeakEnd?.();
  }, [onSpeakEnd]);

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported,
  };
};
