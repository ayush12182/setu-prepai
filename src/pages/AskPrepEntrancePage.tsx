import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Camera, ImagePlus, X, Volume2, Loader2, Play, Pause, CheckCircle2, Flame, BookOpen, AlertTriangle, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { getGreetingByLanguage } from '@/lib/prepentranceMentor';
import { usePrepEntranceChat } from '@/hooks/usePrepEntranceChat';
import { useClassContext } from '@/contexts/ClassContext';
import { useStudentStats } from '@/hooks/useStudentStats';


import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { renderProseNotes } from '@/utils/mathRenderer';

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

const FOUNDATION_MOTIVATION_QUOTES = [
  "Padhai mein maza aana chahiye! Naye concepts ko samjho, ratto mat. Curiosity hi sabse badi taaqat hai.",
  "Galti karna achhi baat hai, kyonki galti se hi seekhte hain. Bas ek hi galti do baar mat karna.",
  "Roz thoda practice karo, aur khelna bhi utna hi zaroori hai. Balance maintain karo.",
  "Science hamaare aas-paas hai. Dekho, pucho 'Kyon? Kaise?' aur apne teachers se sawal pucho.",
  "Maths koi darr nahi hai, maths toh ek puzzle hai. Aur puzzles solve karna kisse pasand nahi?",
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
          "bg-white border border-purple-500/10",
          "hover:shadow-purple-500/20 hover:border-purple-500/30",
          localPlaying && "ring-2 ring-purple-500/20 shadow-xl scale-[1.02]"
        )}
        onClick={togglePlay}
      >
        {/* Small Mentor Avatar with pulsing indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border border-white/20 shadow-sm">
            <span className="text-white font-bold text-[10px]">JM</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-prepentrance-success animate-pulse"></span>
        </div>

        {/* Play Indicator / Waveform */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex-shrink-0">
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
            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest leading-none">
              {localPlaying ? "Listened — keep going." : "PrepEntrance Mentor Advice"}
            </span>
            {hasListened && !localPlaying && (
              <CheckCircle2 className="w-2.5 h-2.5 text-prepentrance-success" />
            )}
          </div>
        </div>

        <audio
          ref={mediaRef as React.LegacyRef<HTMLAudioElement>}
          src={message.mediaUrl}
          onEnded={() => setLocalPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  );
};

const AskPrepEntrancePage: React.FC = () => {
  const { language } = useLanguage();
  const { isNeet, examMode } = useExamMode();
  const { aiContext } = useClassContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFoundation = aiContext?.learning_mode === 'foundation';
  const { sendMessage, isLoading, error } = usePrepEntranceChat();
  const { streak, weakTopic, lastActivityTopic, accuracy, totalSolved } = useStudentStats();

  const KOTA_MENTOR_GREETING = `🧑‍🏫 PrepEntrance Mentor
JEE Physics • Chemistry • Maths

Photo bhejo
Question type karo
Ya chapter batao

Main solution ke saath approach bhi samjhaunga.`;

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('prepentrance-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: Record<string, unknown>) => ({ ...m, timestamp: new Date(String(m.timestamp)) }));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [
      {
        id: '1',
        role: 'assistant',
        content: KOTA_MENTOR_GREETING,
        timestamp: new Date()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('prepentrance-chat-history', JSON.stringify(messages));
  }, [messages]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(() => {
    return !localStorage.getItem(WELCOME_VIDEO_STORAGE_KEY);
  });
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [thinkingState, setThinkingState] = useState("Thinking...");

  useEffect(() => {
    if (!isLoading) {
      setThinkingState("Thinking...");
      return;
    }
    const states = ["Thinking...", "Analyzing question...", "Solving..."];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setThinkingState(states[idx]);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const injectMotivationMessage = useCallback(() => {
    let quotes = JEE_MOTIVATION_QUOTES;
    if (isFoundation) quotes = FOUNDATION_MOTIVATION_QUOTES;
    else if (isNeet) quotes = NEET_MOTIVATION_QUOTES;

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
  }, [isNeet, isFoundation]);

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
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{
          ...prev[0],
          content: KOTA_MENTOR_GREETING,
          timestamp: new Date()
        }];
      }
      return prev;
    });
  }, [language]);

  const jeeQuickQuestions = [
    "Rotation vs Revolution kya difference hai?",
    "Integration by parts kab use karna chahiye?",
    "Organic reactions kaise yaad karein?",
    "JEE Advanced Physics kaise prepare karein?"
  ];

  const foundationQuickQuestions = [
    "Photosynthesis kaise hota hai?",
    "Fractions ko kaise add karte hain?",
    "Solar system ke planets ke naam kya hain?",
    "HCF aur LCM mein kya difference hai?"
  ];

  const neetQuickQuestions = [
    "Mitochondria ka function kya hai?",
    "Human heart mein kitne chambers hote hain?",
    "Cell cycle stages kya hain?",
    "Photosynthesis ki equation kya hai?"
  ];

  let quickQuestions = jeeQuickQuestions;
  if (isFoundation) quickQuestions = foundationQuickQuestions;
  else if (isNeet) quickQuestions = neetQuickQuestions;

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
      .map(m => {
        if (m.role === 'user' && m.image) {
          return {
            role: 'user' as const,
            content: [
              { type: 'text', text: m.content },
              { type: 'image_url', image_url: { url: m.image } }
            ]
          };
        }
        return { role: m.role as 'user' | 'assistant', content: m.content };
      });

    if (selectedImage) {
      chatHistory.push({
        role: 'user',
        content: [
          { type: 'text', text: textToSend || 'Please explain this.' },
          { type: 'image_url', image_url: { url: selectedImage } }
        ]
      });
    } else {
      chatHistory.push({ role: 'user', content: textToSend });
    }

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

    // @ts-ignore
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

  return (
    <MainLayout title="Ask PrepEntrance Mentor">
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
            <DialogTitle>PrepEntrance Mentor Welcome Message</DialogTitle>
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-prepentrance-saffron to-prepentrance-saffron-light flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SM</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">PrepEntrance Mentor</h3>
                    <p className="text-white/70 text-sm">Welcome Message</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      localStorage.setItem(WELCOME_VIDEO_STORAGE_KEY, 'true');
                      setShowWelcomeVideo(false);
                    }}
                    className="bg-prepentrance-saffron hover:bg-prepentrance-saffron/90 text-white rounded-full px-4"
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

      <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
        {/* LEFT SIDEBAR: Student JEE Journey Context */}
        <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 overflow-y-auto pr-1">
          {/* Streak Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-300" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Streak</p>
                <h4 className="text-xl font-extrabold text-foreground">{streak || 0} Days Study Streak</h4>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {streak > 0 ? "You're doing great! Keep the momentum alive." : "Start practicing today to build your streak!"}
            </p>
          </div>

          {/* Current Chapter Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Chapter</p>
                <h4 className="text-sm font-bold text-foreground truncate max-w-[160px]">
                  {lastActivityTopic || (isNeet ? 'Human Physiology' : isFoundation ? 'Motion & Forces' : 'Kinematics')}
                </h4>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] text-muted-foreground">Target Score: <span className="font-bold text-foreground">99%ile</span></p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          {/* Weak Topics Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Weak Areas</p>
                <h4 className="text-xs font-bold text-foreground">Need Attention</h4>
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <div className="text-[11px] text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 px-2.5 py-1.5 rounded-lg font-medium leading-relaxed">
                ⚠️ {weakTopic || (isNeet ? 'Cell Division Phases, Plant Hormones' : 'Friction Constraints, Limits Indeterminate Forms')}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Ask mentor doubts on these topics to strengthen concepts.</p>
            </div>
          </div>

          {/* Recent Tests Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Recent Tests</p>
                <h4 className="text-sm font-bold text-foreground">Practice Stats</h4>
              </div>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-semibold text-emerald-600">{accuracy || 68}%</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Solved</span>
                <span className="font-semibold text-foreground">{totalSolved || 14} Qs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Accuracy</span>
                <span className="font-semibold text-foreground">80%</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Chat Arena (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-card border-b border-border p-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">JM</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card bg-prepentrance-success animate-pulse"></span>
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-base text-foreground">
                PrepEntrance Mentor
              </h2>
              <p className="text-xs text-prepentrance-success flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-prepentrance-success animate-pulse inline-block" />
                Online • Your {isFoundation ? 'School' : isNeet ? 'NEET' : 'JEE'} Mentor
              </p>
            </div>
            <div className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 px-2.5 py-1 rounded-full font-bold">
              🟢 Responds in ~5 sec
            </div>
          </div>

          {/* Messages */}
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
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <span className="text-purple-500 font-bold text-xs">JM</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-prepentrance-saffron to-prepentrance-saffron-dark text-white rounded-2xl rounded-tr-none px-5 py-3.5 max-w-[60%] shadow-sm font-medium text-[15px]'
                          : 'bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] shadow-sm text-sm'
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
                        'leading-relaxed whitespace-pre-wrap',
                        message.role === 'assistant' ? 'text-foreground' : 'text-white'
                      )}>
                        {message.role === 'assistant' ? renderProseNotes(message.content) : message.content}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start animate-fade-in items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-500 font-bold text-xs">JM</span>
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground animate-pulse">{thinkingState}</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}

            {messages.length === 1 && !isLoading && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  <span>💡</span> Quick doubts to get started:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className={cn(
                        'text-xs bg-[rgba(251,146,60,0.08)] border border-[rgba(251,146,60,0.25)] text-white rounded-xl px-3.5 py-2 text-left font-medium',
                        'hover:border-[rgba(251,146,60,0.4)] hover:bg-[rgba(251,146,60,0.15)] transition-all duration-200 shadow-sm'
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

          {/* Footer Area */}
          <div className="bg-card border-t border-border p-4 relative">
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
                className="flex-shrink-0 rounded-xl bg-[rgba(251,146,60,0.08)] border border-[rgba(251,146,60,0.25)] text-white hover:bg-[rgba(251,146,60,0.15)] hover:border-[rgba(251,146,60,0.4)]"
                title="PrepEntrance Mentor ki Seekh suniye"
              >
                <Volume2 className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 rounded-xl bg-[rgba(251,146,60,0.08)] border border-[rgba(251,146,60,0.25)] text-white hover:bg-[rgba(251,146,60,0.15)] hover:border-[rgba(251,146,60,0.4)]"
                disabled={isLoading}
                title="Upload from gallery"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-shrink-0 rounded-xl bg-[rgba(251,146,60,0.08)] border border-[rgba(251,146,60,0.25)] text-white hover:bg-[rgba(251,146,60,0.15)] hover:border-[rgba(251,146,60,0.4)]"
                disabled={isLoading}
                title="Take photo"
              >
                <Camera className="w-5 h-5" />
              </Button>

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isNeet
                    ? "Stuck on a question? Paste it here or ask NEET Biology, Chemistry or Physics..."
                    : isFoundation
                    ? "Stuck on a question? Ask me anything..."
                    : "Ask me anything about JEE Physics, Chemistry or Maths..."
                }
                rows={2}
                className="min-h-[60px] max-h-32 resize-none rounded-xl flex-1 text-white font-medium bg-[#111827] border-[#334155] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-orange-500 placeholder:text-slate-500"
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
                className="btn-primary-cta flex-shrink-0 rounded-xl px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              🖼️ Media • 📷 Camera • ⌨️ Type your doubt
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AskPrepEntrancePage;
