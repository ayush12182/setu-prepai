import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Camera, ImagePlus, X, Volume2, Loader2, Play, Pause, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { getGreetingByLanguage } from '@/lib/jeetuBhaiya';
import { useJeetuChat } from '@/hooks/useJeetuChat';

import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// Welcome video path
const WELCOME_VIDEO_PATH = "/videos/jeetu-welcome.mp4";
const WELCOME_VIDEO_STORAGE_KEY = "jeetu-welcome-video-seen";

const JEE_MOTIVATION_QUOTES = [
  "Beta, ek baar man bana lo — JEE karna hai. Phir har roz uthna, padhna, practice karna automatic ho jayega. Consistency hi result deti hai, shortcut nahi.",
  "Padhai mein struggle feel ho raha hai? Good. Matlab tu grow kar raha hai. Jis cheez mein struggle nahi, usme grow bhi nahi hota. Laga reh.",
  "Topper wo nahi hota jo har cheez jaanta hai. Topper wo hota hai jo galti karta hai, samajhta hai, aur dobara galti nahi karta. PYQ solve karo, samjho, aage badho.",
  "Aaj ka ek chapter, kal ka ek advantage. Sab kuch ek saath nahi hoga. Aaj jo padha, wo exam mein kuch na kuch kaam aayega. Trust the process.",
  "Phone rakh. Sirf 25 minute — ek concept, ek focus. Phir break le. Tujhe poora syllabus aaj nahi khatam karna. Bas aaj ka kaam kar le.",
  "JEE Main mein 89 marks ka weightage hai — Maths, Physics, Chemistry. Har chapter ek chance hai. Weak chapter chhodna matlab marks chhodna hai.",
  "Failure se mat darna. PYQs mein dekh — same concept baar baar aata hai. Jo baar baar aata hai, use master kar le. Baaki khud ho jayega.",
];

const NEET_MOTIVATION_QUOTES = [
  "Beta, NEET ki race lambi hai. Har din NCERT ke panno se dosti karo. Wo kitabein hi tumhe safeda kurta dilayengi.",
  "Biology ke diagrams ko sirf dekho mat, unhe feel karo. Chemistry ki reactions tab tak likho jab tak hathon ko yaad na ho jaye.",
  "Mock tests mein score kam aaya? Darna mat. Ye tests tumhe batate hain kahan sudharna hai. Har galti ek lesson hai.",
  "Consistency is key. Roz 10 ghante ki jagah roz 6 ghante padho, lekin bina kisi break ke, roz.",
  "Physics se darr lagta hai? Concepts ko pakdo, formulae khud-ba-khud yaad ho jayenge. Practice will make you perfect.",
  "Medical seat sirf mehnat mangti hai. Aaj ki neend sacrifice karoge to kal hazaron ki jaan bachaoge.",
  "NCERT hi tumhara Bible hai, Gita hai, aur Quran hai. Uske ek bhi corner ko mat chhodo.",
];

// Local motivation audio/video files
const MOTIVATION_AUDIO_PATH = '/audio/jeetu-motivation.mp3';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'motivation';
  content: string;
  timestamp: Date;
  image?: string;
  mediaType?: 'audio' | 'video';
  mediaUrl?: string;
}

const MotivationBubble: React.FC<{ message: Message }> = ({ message }) => {
  const [localPlaying, setLocalPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (localPlaying) {
      mediaRef.current?.pause();
      setLocalPlaying(false);
    } else {
      mediaRef.current?.play().catch(() => {
        toast.info("Media file not found. Here is the quote:", {
          description: message.content,
          duration: 5000
        });
      });
      setLocalPlaying(true);
      if (!hasListened) setHasListened(true);
    }
  };

  return (
    <div className="flex justify-center w-full my-4 animate-fade-in group">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg transition-all duration-300 cursor-pointer max-w-[95%]",
          "bg-white border border-setu-saffron/10",
          "hover:shadow-setu-saffron/20 hover:border-setu-saffron/30",
          localPlaying && "ring-2 ring-setu-saffron/20 shadow-xl scale-[1.02]"
        )}
        onClick={togglePlay}
      >
        {/* Small Mentor Avatar with pulsing indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-setu-saffron to-setu-saffron-dark flex items-center justify-center border border-white/20 shadow-sm">
            <span className="text-white font-bold text-[10px]">JB</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-setu-success animate-pulse"></span>
        </div>

        {/* Play Indicator / Waveform */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-setu-saffron/10 text-setu-saffron flex-shrink-0">
          {localPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </div>

        {/* Minimalist Text Label */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground/90 truncate italic leading-relaxed">
            "{message.content}"
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-bold text-setu-saffron uppercase tracking-widest leading-none">
              {localPlaying ? "Listened — keep going." : "Jeetu ki Seekh"}
            </span>
            {hasListened && !localPlaying && (
              <CheckCircle2 className="w-2.5 h-2.5 text-setu-success" />
            )}
          </div>
        </div>

        <audio
          ref={mediaRef as any}
          src={message.mediaUrl}
          onEnded={() => setLocalPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  );
};

const AskJeetuPage: React.FC = () => {
  const { language } = useLanguage();
  const { isNeet } = useExamMode();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading, error } = useJeetuChat();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getGreetingByLanguage(language),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(() => {
    return !localStorage.getItem(WELCOME_VIDEO_STORAGE_KEY);
  });
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const injectMotivationMessage = useCallback(() => {
    const quotes = isNeet ? NEET_MOTIVATION_QUOTES : JEE_MOTIVATION_QUOTES;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const newMsg: Message = {
      id: 'motiv-' + Date.now(),
      role: 'motivation',
      content: randomQuote,
      timestamp: new Date(),
      mediaType: 'audio',
      mediaUrl: MOTIVATION_AUDIO_PATH
    };

    setMessages(prev => [...prev, newMsg]);
  }, [isNeet]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getGreetingByLanguage(language),
        timestamp: new Date()
      }]);
    }
  }, [language]);

  const jeeQuickQuestions = [
    "Rotation vs Revolution kya difference hai?",
    "Integration by parts kab use karna chahiye?",
    "Organic reactions kaise yaad karein?",
    "JEE Advanced Physics kaise prepare karein?"
  ];

  const neetQuickQuestions = [
    "Cell aur Organism mein kya difference hai?",
    "Krebs cycle explain karo simply",
    "Genetics ki important topics kaunsi hain NEET ke liye?",
    "NEET ke liye Biology kaise prepare karein?"
  ];

  const quickQuestions = isNeet ? neetQuickQuestions : jeeQuickQuestions;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSendWithText = async (textToSend: string) => {
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend || (selectedImage ? '📷 Image shared' : ''),
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);

    const chatHistory = messages
      .filter(m => m.role !== 'motivation' && (m.role !== 'assistant' || messages.indexOf(m) > 0 || messages.length > 1))
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    chatHistory.push({ role: 'user', content: textToSend });

    let assistantContent = '';

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('streaming-')) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, {
          id: 'streaming-' + Date.now(),
          role: 'assistant' as const,
          content: assistantContent,
          timestamp: new Date()
        }];
      });
    };

    await sendMessage(chatHistory, updateAssistant, () => {
      setMessages(prev =>
        prev.map(m =>
          m.id.startsWith('streaming-')
            ? { ...m, id: Date.now().toString() }
            : m
        )
      );
    });
  };

  const handleSend = async () => {
    await handleSendWithText(input);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
          {i < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <MainLayout title="Ask Jeetu Bhaiya">
      <Dialog
        open={showWelcomeVideo}
        onOpenChange={(open) => {
          if (!open) {
            localStorage.setItem(WELCOME_VIDEO_STORAGE_KEY, 'true');
          }
          setShowWelcomeVideo(open);
        }}
      >
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black border-none" aria-describedby={undefined}>
          <VisuallyHidden>
            <DialogTitle>Jeetu Bhaiya Welcome Message</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            <div className="aspect-video">
              <video
                ref={videoRef}
                src={WELCOME_VIDEO_PATH}
                autoPlay
                muted={videoMuted}
                playsInline
                controls
                className="w-full h-full object-cover"
                onEnded={() => {
                  localStorage.setItem(WELCOME_VIDEO_STORAGE_KEY, 'true');
                  setShowWelcomeVideo(false);
                }}
              />
            </div>

            <div className="absolute bottom-14 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-setu-saffron to-setu-saffron-light flex items-center justify-center">
                    <span className="text-white font-bold text-sm">JB</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Jeetu Bhaiya</h3>
                    <p className="text-white/70 text-sm">Welcome Message</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      localStorage.setItem(WELCOME_VIDEO_STORAGE_KEY, 'true');
                      setShowWelcomeVideo(false);
                    }}
                    className="bg-setu-saffron hover:bg-setu-saffron/90 text-white rounded-full px-4"
                  >
                    Start Chatting
                  </Button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem(WELCOME_VIDEO_STORAGE_KEY, 'true');
                setShowWelcomeVideo(false);
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-t-2xl p-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-setu-saffron to-setu-saffron-light flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">JB</span>
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card bg-setu-success"></span>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg text-foreground">Jeetu Bhaiya</h2>
            <p className="text-sm text-setu-success flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Online • Your {isNeet ? 'NEET' : 'JEE'} Mentor
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            AI-Powered
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-secondary/30 p-4 space-y-4">
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              {message.role !== 'motivation' && (
                <div
                  className={cn(
                    'flex animate-fade-in',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-setu-saffron/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <span className="text-setu-saffron font-bold text-xs">JB</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md shadow-sm'
                    )}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attached"
                        className="max-w-full rounded-lg mb-2 max-h-48 object-contain"
                      />
                    )}

                    <div className={cn(
                      'text-sm leading-relaxed whitespace-pre-wrap',
                      message.role === 'assistant' && 'text-foreground'
                    )}>
                      {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-setu-saffron/20 flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-setu-saffron font-bold text-xs">JB</span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="space-y-3 pt-4">
              <p className="text-xs text-muted-foreground font-medium">
                💡 Quick doubts to get started:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className={cn(
                      'text-sm bg-card border border-border rounded-xl px-4 py-2',
                      'hover:border-setu-saffron hover:bg-setu-saffron/5 transition-all duration-200',
                      'text-left'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-card border border-border rounded-b-2xl p-4 relative">
          {messages.filter(m => m.role === 'motivation').length > 0 && (
            <div className="absolute bottom-full left-0 right-0 px-4 pb-2 z-20 pointer-events-none">
              <div className="pointer-events-auto max-w-lg mx-auto">
                <MotivationBubble message={messages.filter(m => m.role === 'motivation').slice(-1)[0]} />
              </div>
            </div>
          )}

          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={selectedImage}
                alt="Selected"
                className="max-h-32 rounded-lg border border-border"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={injectMotivationMessage}
              className="flex-shrink-0 rounded-xl border-setu-saffron/30 text-setu-saffron hover:bg-setu-saffron/10"
              title="Jeetu Bhaiya ki Seekh suniye"
            >
              <Volume2 className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-shrink-0 rounded-xl"
              disabled={isLoading}
              title="Take photo"
            >
              <Camera className="w-5 h-5" />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apna doubt yahan likho..."
              className="min-h-[48px] max-h-32 resize-none rounded-xl flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <Button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="btn-hero flex-shrink-0 rounded-xl px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            📷 Photo upload • ⌨️ Type your doubt
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AskJeetuPage;
