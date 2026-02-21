import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Camera, ImagePlus, X, Volume2, Loader2 } from 'lucide-react';
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

const MOTIVATION_QUOTES: Record<string, string[]> = {
  hinglish: [
    "Abhi se thak gaye? Ek baar yeh sun lo 🔥",
    "Woh din bhi dekhenge jab tum hase aur sab roye 💪",
    "Haar ke baithne wale ko koi nahi puchta, uth aur laga reh!",
    "Topper bhi ek time pe average tha, bas usne chhoda nahi 📚",
    "Tera result tere mehnat ka receipt hai, likha ja raha hai ✍️",
    "Phone rakh, kitaab utha — future khud shukr karega 🎯",
    "Struggle temporary hai, regret permanent — choose wisely ⚡",
  ],
  english: [
    "Tired already? Listen to this once 🔥",
    "The day will come when you smile and others watch in awe 💪",
    "Nobody remembers the one who gave up — get up and keep going!",
    "Every topper was once average, they just never quit 📚",
    "Your result is a receipt of your hard work — it's being written ✍️",
    "Put the phone down, pick up the book — your future self will thank you 🎯",
    "Struggle is temporary, regret is permanent — choose wisely ⚡",
  ],
  hindi: [
    "अभी से थक गए? एक बार ये सुन लो 🔥",
    "वो दिन भी देखेंगे जब तुम हँसे और सब रोए 💪",
    "हार के बैठने वाले को कोई नहीं पूछता, उठ और लगा रह!",
    "टॉपर भी एक टाइम पे average था, बस उसने छोड़ा नहीं 📚",
    "तेरा रिज़ल्ट तेरी मेहनत की रसीद है, लिखा जा रहा है ✍️",
    "फ़ोन रख, किताब उठा — भविष्य खुद शुक्र करेगा 🎯",
    "संघर्ष अस्थायी है, पछतावा स्थायी — सोच-समझकर चुनो ⚡",
  ],
  kannada: [
    "ಈಗಲೇ ಸುಸ್ತಾಯ್ತಾ? ಒಂದ್ಸಲ ಇದು ಕೇಳು 🔥",
    "ಆ ದಿನ ಬರುತ್ತೆ — ನೀನು ನಗ್ತೀಯ, ಬಾಕಿಯವರು ನೋಡ್ತಾರೆ 💪",
    "ಬಿಟ್ಟವನನ್ನ ಯಾರೂ ಕೇಳಲ್ಲ — ಎದ್ದು ಮುಂದುವರಿ!",
    "ಪ್ರತಿ topper ಒಂದ್ಕಾಲದಲ್ಲಿ average ಇದ್ದ, ಆದ್ರೆ ಬಿಡಲಿಲ್ಲ 📚",
  ],
  telugu: [
    "ఇప్పుడే అలసిపోయావా? ఒక్కసారి ఇది విను 🔥",
    "ఆ రోజు వస్తుంది — నువ్వు నవ్వుతావ్, అందరూ చూస్తారు 💪",
    "వదిలేసిన వాడిని ఎవరూ అడగరు — లే, కొనసాగు!",
    "ప్రతి topper ఒకప్పుడు average — కానీ ఆగలేదు 📚",
  ],
  punjabi: [
    "ਹੁਣੇ ਥੱਕ ਗਏ? ਇੱਕ ਵਾਰ ਇਹ ਸੁਣੋ 🔥",
    "ਉਹ ਦਿਨ ਵੀ ਆਵੇਗਾ ਜਦੋਂ ਤੁਸੀਂ ਹੱਸੋਗੇ ਤੇ ਸਭ ਦੇਖਣਗੇ 💪",
    "ਹਾਰ ਕੇ ਬੈਠਣ ਵਾਲੇ ਨੂੰ ਕੋਈ ਨਹੀਂ ਪੁੱਛਦਾ — ਉੱਠ ਤੇ ਲੱਗਾ ਰਹਿ!",
    "ਹਰ topper ਇੱਕ ਟਾਈਮ ਤੇ average ਸੀ, ਬੱਸ ਉਸਨੇ ਛੱਡਿਆ ਨਹੀਂ 📚",
  ],
};

// Local motivation audio file
const MOTIVATION_AUDIO_PATH = '/audio/jeetu-motivation.mp3';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

const AskJeetuPage: React.FC = () => {
  const { language } = useLanguage();
  const { isNeet } = useExamMode();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading, error } = useJeetuChat();
  const [isPlayingMotivation, setIsPlayingMotivation] = useState(false);
  const motivAudioRef = useRef<HTMLAudioElement | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate motivational quote every 5 seconds
  useEffect(() => {
    const quotes = MOTIVATION_QUOTES[language] || MOTIVATION_QUOTES.hinglish;
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [language]);

  const currentQuote = (MOTIVATION_QUOTES[language] || MOTIVATION_QUOTES.hinglish)[quoteIndex % (MOTIVATION_QUOTES[language] || MOTIVATION_QUOTES.hinglish).length];

  const playMotivation = useCallback(() => {
    // If already playing, stop
    if (isPlayingMotivation && motivAudioRef.current) {
      motivAudioRef.current.pause();
      motivAudioRef.current.currentTime = 0;
      motivAudioRef.current = null;
      setIsPlayingMotivation(false);
      return;
    }
    const audio = new Audio(MOTIVATION_AUDIO_PATH);
    motivAudioRef.current = audio;
    setIsPlayingMotivation(true);
    audio.onended = () => { setIsPlayingMotivation(false); motivAudioRef.current = null; };
    audio.onerror = () => {
      setIsPlayingMotivation(false);
      motivAudioRef.current = null;
      const fallback = (MOTIVATION_QUOTES[language] || MOTIVATION_QUOTES.hinglish)[0];
      import('sonner').then(({ toast }) => toast.info(fallback, { duration: 8000 }));
    };
    audio.play().catch(() => {
      setIsPlayingMotivation(false);
      motivAudioRef.current = null;
    });
  }, [isPlayingMotivation]);


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
    // Check if user has already seen the welcome video
    return !localStorage.getItem(WELCOME_VIDEO_STORAGE_KEY);
  });
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Update greeting when language changes
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

    // Build message history for AI
    const chatHistory = messages
      .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0 || messages.length > 1)
      .map(m => ({ role: m.role, content: m.content }));

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
      // Finalize the message ID
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
      {/* Welcome Video Modal */}
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
            {/* Local Video Player */}
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

            {/* Controls Overlay */}
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
                  {/* Skip Button */}
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

            {/* Close Button */}
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
        {/* Chat Header */}
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-secondary/30 p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
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
                {/* Display attached image */}
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

                {/* Speak button for assistant messages */}
              </div>
            </div>
          ))}




          {/* Typing Indicator */}
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

          {/* Quick Questions - Show only at start */}
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

        {/* Input Area */}
        <div className="bg-card border border-border rounded-b-2xl p-4">
          {/* Motivation Quote Banner */}
          <button
            onClick={playMotivation}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 mb-3 rounded-xl border transition-all text-left',
              'border-setu-saffron/30 bg-gradient-to-r from-setu-saffron/5 to-transparent hover:from-setu-saffron/10',
              isPlayingMotivation && 'bg-setu-saffron/10 border-setu-saffron'
            )}
          >
            <Volume2 className={cn('w-4 h-4 flex-shrink-0 text-setu-saffron', isPlayingMotivation && 'animate-pulse')} />
            <span className="text-xs font-medium text-setu-saffron truncate flex-1">
              {currentQuote}
            </span>
          </button>
          {/* Image Preview */}
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

          {/* Hidden file inputs */}
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
            {/* Gallery Upload Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 rounded-xl"
              disabled={isLoading}
              title="Upload from gallery"
            >
              <ImagePlus className="w-5 h-5" />
            </Button>

            {/* Camera Button */}
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
