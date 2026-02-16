import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Loader2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceAI, VoiceMode } from '@/hooks/useVoiceAI';
import { toast } from 'sonner';

type Message = { role: 'user' | 'assistant'; content: string };

interface VoiceChatProps {
  chatHistory: Message[];
  onUserMessage: (text: string) => void;
  onAssistantDelta: (chunk: string) => void;
  onAssistantDone: (fullText: string) => void;
}

export const VoiceChatButton: React.FC<VoiceChatProps> = ({
  chatHistory,
  onUserMessage,
  onAssistantDelta,
  onAssistantDone,
}) => {
  const {
    isListening,
    isSpeaking,
    isProcessing,
    voiceMode,
    setVoiceMode,
    liveTranscript,
    startListening,
    stopListening,
    stopAndProcess,
    stopAudio,
  } = useVoiceAI();

  const [isActive, setIsActive] = useState(false);

  const handleStartVoice = useCallback(async () => {
    try {
      setIsActive(true);
      await startListening(
        chatHistory,
        onUserMessage,
        onAssistantDelta,
        onAssistantDone,
      );
    } catch (e) {
      toast.error('Microphone access denied. Please allow mic permission.');
      setIsActive(false);
    }
  }, [chatHistory, startListening, onUserMessage, onAssistantDelta, onAssistantDone]);

  const handleStopAndSend = useCallback(async () => {
    await stopAndProcess(
      chatHistory,
      onUserMessage,
      onAssistantDelta,
      onAssistantDone,
    );
  }, [chatHistory, stopAndProcess, onUserMessage, onAssistantDelta, onAssistantDone]);

  const handleEndSession = useCallback(() => {
    stopListening();
    stopAudio();
    setIsActive(false);
  }, [stopListening, stopAudio]);

  const toggleMode = useCallback(() => {
    setVoiceMode(voiceMode === 'push-to-talk' ? 'continuous' : 'push-to-talk');
  }, [voiceMode, setVoiceMode]);

  // Not active - show mic button to start
  if (!isActive && !isListening && !isSpeaking && !isProcessing) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleStartVoice}
          className="flex-shrink-0 rounded-xl relative group"
          title="Start voice chat"
        >
          <Mic className="w-5 h-5 text-setu-saffron" />
        </Button>
      </div>
    );
  }

  // Active voice session
  return (
    <div className="flex flex-col items-center w-full">
      {/* Live transcript */}
      {liveTranscript && (
        <div className="w-full mb-3 px-3 py-2 bg-secondary/50 rounded-xl text-sm text-muted-foreground italic animate-fade-in">
          🎙️ "{liveTranscript}"
        </div>
      )}

      {/* Status & Controls */}
      <div className="flex items-center gap-3 w-full">
        {/* Mode toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMode}
          className="text-xs text-muted-foreground"
          title={voiceMode === 'push-to-talk' ? 'Switch to continuous' : 'Switch to push-to-talk'}
        >
          <Radio className="w-3 h-3 mr-1" />
          {voiceMode === 'push-to-talk' ? 'PTT' : 'Auto'}
        </Button>

        <div className="flex-1 flex justify-center">
          {/* Main voice button */}
          {isListening && (
            <button
              onClick={voiceMode === 'push-to-talk' ? handleStopAndSend : undefined}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
                'bg-gradient-to-br from-red-500 to-red-600 text-white',
                'hover:scale-105 active:scale-95',
                // Pulse animation when listening
                'relative'
              )}
              title={voiceMode === 'push-to-talk' ? 'Tap to send' : 'Listening...'}
            >
              {/* Pulse rings */}
              <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
              <span className="absolute inset-[-4px] rounded-full border-2 border-red-400/40 animate-pulse" />
              <Mic className="w-7 h-7 relative z-10" />
            </button>
          )}

          {isProcessing && (
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-setu-saffron to-setu-saffron-light shadow-lg">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          )}

          {isSpeaking && (
            <button
              onClick={stopAudio}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
                'bg-gradient-to-br from-setu-saffron to-setu-saffron-light text-white',
                'hover:scale-105 active:scale-95',
                'relative'
              )}
              title="Tap to stop speaking"
            >
              {/* Speaking animation */}
              <span className="absolute inset-[-4px] rounded-full border-2 border-setu-saffron/40 animate-pulse" />
              <Volume2 className="w-7 h-7 relative z-10" />
            </button>
          )}
        </div>

        {/* End session */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEndSession}
          className="text-xs text-destructive hover:text-destructive"
        >
          <PhoneOff className="w-3 h-3 mr-1" />
          End
        </Button>
      </div>

      {/* Status text */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {isListening && voiceMode === 'push-to-talk' && '🎙️ Listening... Tap mic to send'}
        {isListening && voiceMode === 'continuous' && '🎙️ Listening... Will auto-send after pause'}
        {isProcessing && '🧠 Jeetu Bhaiya soch raha hai...'}
        {isSpeaking && '🔊 Jeetu Bhaiya bol raha hai... Tap to stop'}
      </p>
    </div>
  );
};
