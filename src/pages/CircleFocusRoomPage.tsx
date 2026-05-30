import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFocusRoom } from '@/hooks/useCircleRooms';
import { CATEGORY_STYLES, MessageCategory } from '@/data/circlesData';
import {
  ArrowLeft, Users, Clock, Send, Circle, ShieldAlert, Share2, Loader2, Target, Flame, Expand, Trophy, Zap, MessageCircle, Image as ImageIcon, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return format(date, 'h:mm a');
}

// ─── Intent Modal ────────────────────────────────────────────────────────
const IntentModal: React.FC<{ open: boolean; onSumbit: (intent: string) => void }> = ({ open, onSumbit }) => {
  const [intent, setIntent] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intent.trim().length < 3) {
      toast.error('Enter a specific goal for this session');
      return;
    }
    onSumbit(intent.trim());
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-white/10 [&>button]:hidden outline-none">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(234,88,12,0.2)]">
            <Target className="w-8 h-8 text-accent" />
          </div>
          <DialogTitle className="text-center text-2xl font-serif text-white">What's the target?</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-center text-white/50 text-sm">Declare your goal. Once you enter, there's no going back until it's done.</p>
          <Input 
            autoFocus
            placeholder="e.g., Complete 50 Integration PYQs"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="h-12 text-center text-lg bg-white/5 border-white/10 text-white focus:border-accent/50 placeholder:text-white/20"
          />
          <Button type="submit" className="w-full h-12 text-base font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-0">
            Lock Target & Enter Arena
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Doubt Preview Modal ───────────────────────────────────────────────────
const DoubtPreviewModal: React.FC<{
  file: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  onCancel: () => void;
  onSend: (text: string) => void;
}> = ({ file, previewUrl, isUploading, onCancel, onSend }) => {
  const [caption, setCaption] = useState('');

  if (!file || !previewUrl) return null;

  const handleSend = () => {
    onSend(caption);
    setCaption('');
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && !isUploading && onCancel()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 outline-none p-0 overflow-hidden">
        <div className="relative">
          <img src={previewUrl} alt="Preview" className="w-full max-h-[60vh] object-contain bg-black/50" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
              <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
              <p className="text-white font-medium">Uploading Doubt...</p>
            </div>
          )}
        </div>
        <div className="p-4 space-y-4">
          <Input 
            placeholder="Add context to your doubt (e.g. 'bhai iska step 2 kaise aaya?')"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-accent/50"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isUploading} className="bg-transparent border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isUploading} className="bg-gradient-to-r from-accent to-amber-600 text-white border-0 shadow-lg shadow-accent/20">
              <Send className="w-4 h-4 mr-2" /> Send Doubt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Message Bubble ────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: import('@/hooks/useCircleRooms').CommuneMessage; currentUserId?: string }> = ({ msg, currentUserId }) => {
  const catStyle = CATEGORY_STYLES.find(c => c.label === msg.category);
  const isUser = msg.user_id === currentUserId;

  const imageMatch = msg.content.match(/!\[IMAGE\]\((.*?)\)([\s\S]*)/);
  const imageUrl = imageMatch ? imageMatch[1] : null;
  const textContent = imageMatch ? imageMatch[2].trim() : msg.content;

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold shadow-lg',
        isUser ? 'bg-gradient-to-br from-accent to-amber-600 text-white' : 'bg-white/10 text-white/80'
      )}>
        {msg.user_name.charAt(0).toUpperCase()}
      </div>

      <div className={cn('flex-1 max-w-[85%]', isUser && 'items-end flex flex-col')}>
        <div className={cn('flex items-center gap-2 mb-1.5', isUser && 'flex-row-reverse')}>
          <span className={cn("text-xs font-bold", isUser ? 'text-accent' : 'text-white/80')}>{isUser ? 'You' : msg.user_name}</span>
          <span className="text-[10px] text-white/30">{timeAgo(msg.created_at)}</span>
        </div>

        {catStyle && (
          <div className={cn('flex items-center gap-1 mb-1.5', isUser && 'self-end')}>
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm',
              catStyle.color, catStyle.bg, catStyle.border
            )}>
              {catStyle.icon} {catStyle.label}
            </span>
          </div>
        )}

        <div className={cn(
          'rounded-2xl p-3.5 text-sm text-white/90 leading-relaxed shadow-sm space-y-2',
          isUser
            ? 'bg-accent/20 border border-accent/30 rounded-tr-sm'
            : 'bg-white/5 border border-white/10 rounded-tl-sm'
        )}>
          {imageUrl && (
            <img src={imageUrl} alt="Doubt Attachment" className="max-w-full rounded-xl object-contain max-h-[300px] bg-black/20" />
          )}
          {textContent && <p className="whitespace-pre-wrap">{textContent}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Category Selector ─────────────────────────────────────────────────────
const CategorySelector: React.FC<{ selected: MessageCategory | null; onSelect: (c: MessageCategory) => void; }> = ({ selected, onSelect }) => (
  <div className="flex gap-2 flex-wrap pb-2">
    {CATEGORY_STYLES.map(cat => (
      <button
        key={cat.label}
        onClick={() => onSelect(cat.label)}
        className={cn(
          'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all uppercase tracking-wide',
          selected === cat.label
            ? cn(cat.color, cat.bg, cat.border, 'ring-1 ring-current/50 shadow-md')
            : 'text-white/40 border-white/10 bg-white/5 hover:text-white/80 hover:bg-white/10'
        )}
      >
        {cat.icon} {cat.label}
      </button>
    ))}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
const CircleFocusRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, members, room, studentCount, remainingMinutes, sendMessage, uploadImage, loading } = useFocusRoom(roomId ?? '');

  const [messageText, setMessageText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory | null>('Doubt');
  const feedRef = useRef<HTMLDivElement>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [joinedAt] = useState<number>(Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Pressure Banner timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - joinedAt) / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [joinedAt]);

  const canSend = !!selectedCategory && messageText.trim().length > 0 && remainingMinutes > 0;

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!canSend || !selectedCategory) return;
    sendMessage(selectedCategory, messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setSelectedCategory('Doubt'); // Force doubt category for images
    }
    if (e.target) e.target.value = '';
  };

  const handleImageSend = async (captionText: string) => {
    if (!selectedImage || !user) return;
    setIsUploading(true);
    
    // Default to 'Doubt' category specifically for images
    const activeCategory = selectedCategory || 'Doubt';
    
    try {
      const url = await uploadImage(selectedImage);
      if (url) {
        await sendMessage(activeCategory, `![IMAGE](${url})\n${captionText}`);
      }
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
  };

  if (!user) {
    return (
      <MainLayout title="PrepEntrance Commune">
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <ShieldAlert className="w-12 h-12 text-white/20" />
          <p className="text-white/50 text-lg">You must be logged in to enter the Arena.</p>
          <Button onClick={() => navigate('/auth')} className="bg-white text-black hover:bg-white/90 font-bold px-8">Login</Button>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout title="PrepEntrance Commune">
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-accent animate-spin" />
            <Flame className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white/50 text-sm font-medium tracking-widest uppercase">Breaching the Room...</p>
        </div>
      </MainLayout>
    );
  }

  if (!room) {
    return (
      <MainLayout title="PrepEntrance Commune">
        <div className="flex flex-col items-center justify-center py-32 gap-5 text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
            <ShieldAlert className="w-10 h-10 text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white">Room Expired</h2>
          <p className="text-white/40 max-w-sm">This study session has officially ended. Time to find a new one.</p>
          <Button className="bg-white hover:bg-white/90 text-black font-semibold mt-2" onClick={() => navigate('/circles')}>
            Return to Lobby
          </Button>
        </div>
      </MainLayout>
    );
  }

  const minsRemaining = Math.max(0, Math.floor(remainingMinutes));
  const isExpiring = minsRemaining <= 10;

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    navigate('/circles');
  };

  return (
    <MainLayout title={room.title} fullHeight={true}>
      {/* Intent Modal overlay blocks everything until set */}
      <IntentModal open={intent === null} onSumbit={setIntent} />
      
      {/* Doubt Preview Modal */}
      <DoubtPreviewModal 
        file={selectedImage}
        previewUrl={imagePreviewUrl}
        isUploading={isUploading}
        onCancel={() => { setSelectedImage(null); setImagePreviewUrl(null); }}
        onSend={handleImageSend}
      />
      
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileSelect} />
      
      {/* Exit Summary Modal */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 outline-none">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <Flame className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-center text-2xl font-serif text-white">Leaving the Arena?</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2 text-center">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
               <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Session Summary</h3>
               <p className="text-white text-lg">You studied <span className="text-accent font-bold">{elapsedMinutes} minutes</span> with <span className="text-emerald-400 font-bold">{studentCount} students</span>. 🔥</p>
               {intent && <p className="text-white/50 text-sm mt-3 border-t border-white/5 pt-3">Target: {intent}</p>}
            </div>
            <p className="text-white/80 font-medium">Come back at 9 PM — peak study time.</p>
            <div className="flex gap-3">
              <Button onClick={() => setShowExitDialog(false)} variant="outline" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                Stay & Grind
              </Button>
              <Button onClick={confirmExit} className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] border-0">
                End Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col h-screen bg-slate-950 overflow-hidden relative">
        {/* Ambient Blur */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* ── Top Focus Bar ── */}
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 h-16 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExit}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-white font-serif">{room.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{studentCount} Active Warriors</span>
                <span className="text-white/20 text-xs">•</span>
                <span className="text-[10px] uppercase font-bold text-white/40">{room.subject.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {elapsedMinutes > 0 ? `No one has left for ${elapsedMinutes}m 🔥` : 'Room is blazing hot 🔥'}
            </span>
            <Button
              size="sm"
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-medium"
              onClick={async () => {
                const url = `${window.location.origin}/circles/${roomId}`;
                const text = `Join me in "${room.title}" on PrepEntrance Commune! 📚🔥`;
                try {
                  if (navigator.share) await navigator.share({ title: 'PrepEntrance Commune', text, url });
                  else { navigator.clipboard.writeText(`${text}\n${url}`); toast.success('Invite link copied! 🎉'); }
                } catch { /* cancelled */ }
              }}
            >
              <Share2 className="w-4 h-4 text-white/70" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          </div>
        </div>

        {/* ── Main Layout Split ── */}
        <div className="flex-1 flex overflow-hidden z-10">
          
          {/* ── LEFT / MAIN: Timer & Focus ── */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative border-r border-white/5 shadow-[inset_-20px_0_40px_rgba(0,0,0,0.2)]">
            
            {/* The Massive Timer */}
            <div className="text-center w-full max-w-lg relative group">
              <div className={cn(
                "absolute inset-0 bg-accent/20 rounded-full blur-[100px] transition-opacity duration-1000",
                isExpiring ? "bg-red-500/30 blur-[120px] animate-pulse" : ""
              )} />
              
              <div className="relative mb-2 inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-white/60 uppercase tracking-widest mx-auto">
                <Clock className="w-4 h-4" /> Time Remaining
              </div>
              
              <div className={cn(
                "text-[100px] sm:text-[140px] lg:text-[180px] leading-none font-bold tracking-tighter tabular-nums drop-shadow-2xl transition-colors duration-500",
                isExpiring ? "text-red-500 bg-clip-text" : "text-white bg-gradient-to-b from-white to-white/60 bg-clip-text"
              )}>
                {String(Math.floor(remainingMinutes / 60)).padStart(2, '0')}:{String(Math.floor(remainingMinutes % 60)).padStart(2, '0')}
              </div>
              
              <div className="mt-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-amber-600" />
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">My Target</h3>
                <p className="text-white text-xl sm:text-2xl font-serif">{intent || 'Setting target...'}</p>
                <button onClick={handleExit} className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                  <Expand className="w-4 h-4" /> Give Up For Now?
                </button>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Chat Engine & Leaderboard ── */}
          <div className="w-full sm:w-[350px] lg:w-[400px] flex-shrink-0 flex flex-col bg-black/20 backdrop-blur-md">
            
            {/* Leaderboard Snippet */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs mb-3">
                <Trophy className="w-4 h-4" /> Top Focusers
              </div>
              <div className="space-y-2">
                {/* Fake/Real local leaderboard items for social proof */}
                {members.slice(0, 3).map((m, idx) => (
                   <div key={m.id || idx} className="flex items-center justify-between text-sm py-1">
                     <div className="flex items-center gap-2">
                       <span className={cn("w-4 text-center font-bold", idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : "text-amber-600")}>
                         {idx + 1}
                       </span>
                       <span className="text-white/80 font-medium truncate max-w-[120px]">{m.name}</span>
                     </div>
                     <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 shadow-sm">
                       🔥 {12 + Math.floor(Math.random()*15)}m
                     </span>
                   </div>
                ))}
              </div>
            </div>

            {/* Chat Feed */}
            <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-medium">Absolute silence in here.</p>
                  <p className="text-white/20 text-xs mt-1">Break it with a doubt or tip.</p>
                </div>
              )}
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} currentUserId={user?.id} />
              ))}
            </div>

            {/* Composer */}
            <div className="p-4 bg-white/[0.03] border-t border-white/5 backdrop-blur-lg">
              <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
              
              <div className="relative flex items-center bg-black/40 rounded-xl border border-white/10 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all shadow-inner group py-0.5">
                
                {/* Upload Buttons */}
                <div className="flex items-center gap-1 pl-2">
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    title="Camera"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    title="Gallery"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={1}
                  placeholder={selectedCategory ? `Message as ${user?.user_metadata?.full_name || 'Student'}...` : 'Select category to type ↑'}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={remainingMinutes <= 0 || !selectedCategory}
                  className={cn(
                    'flex-1 resize-none bg-transparent px-2 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none scrollbar-none',
                    (!selectedCategory || remainingMinutes <= 0) && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{ height: '48px' }}
                />
                <Button
                  size="sm"
                  disabled={!canSend}
                  onClick={handleSend}
                  className={cn(
                    'mr-1.5 h-9 w-9 p-0 rounded-lg flex-shrink-0 transition-all cursor-pointer',
                    canSend
                      ? 'bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg hover:shadow-accent/30 hover:scale-105'
                      : 'bg-white/10 text-white/20'
                  )}
                >
                  <Send className={cn("w-4 h-4 ml-0.5", canSend ? "fill-current" : "")} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CircleFocusRoomPage;
