import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFocusRoom, PresenceMember } from '@/hooks/useCircleRooms';
import { CATEGORY_STYLES, MessageCategory } from '@/data/circlesData';
import {
  ArrowLeft, Users, Clock, Send, Circle, AlertCircle, Share2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

// ─── Helper: format time ago ──────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return format(date, 'h:mm a');
}

// ─── Message Bubble ────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: import('@/hooks/useCircleRooms').CommuneMessage; currentUserId?: string }> = ({ msg, currentUserId }) => {
  const catStyle = CATEGORY_STYLES.find(c => c.label === msg.category);
  const isUser = msg.user_id === currentUserId;

  return (
    <div className={cn('flex gap-3 px-1 animate-fade-in', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
      )}>
        {msg.user_name.charAt(0).toUpperCase()}
      </div>

      <div className={cn('flex-1 max-w-[80%]', isUser && 'items-end flex flex-col')}>
        <div className={cn('flex items-center gap-1.5 mb-1', isUser && 'flex-row-reverse')}>
          <span className="text-xs font-semibold text-foreground">{isUser ? 'You' : msg.user_name}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(msg.created_at)}</span>
        </div>

        {catStyle && (
          <div className={cn('flex items-center gap-1 mb-1', isUser && 'self-end')}>
            <span className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
              catStyle.color, catStyle.bg, catStyle.border
            )}>
              {catStyle.icon} {catStyle.label}
            </span>
          </div>
        )}

        <div className={cn(
          'rounded-xl p-3 text-sm text-foreground border',
          isUser
            ? 'bg-primary/5 border-primary/20 rounded-tr-none'
            : 'bg-card border-border/80 rounded-tl-none'
        )}>
          {msg.content}
        </div>
      </div>
    </div>
  );
};

// ─── Category Selector ─────────────────────────────────────────────────────

const CategorySelector: React.FC<{
  selected: MessageCategory | null;
  onSelect: (c: MessageCategory) => void;
}> = ({ selected, onSelect }) => (
  <div className="flex gap-1.5 flex-wrap">
    {CATEGORY_STYLES.map(cat => (
      <button
        key={cat.label}
        onClick={() => onSelect(cat.label)}
        className={cn(
          'text-xs font-medium px-2.5 py-1 rounded-full border transition-all',
          selected === cat.label
            ? cn(cat.color, cat.bg, cat.border, 'ring-1 ring-current/30')
            : 'text-muted-foreground border-border bg-secondary/50 hover:text-foreground'
        )}
      >
        {cat.icon} {cat.label}
      </button>
    ))}
  </div>
);

// ─── Timer Banner ──────────────────────────────────────────────────────────

const TimerBanner: React.FC<{ remaining: number; topic: string }> = ({ remaining, topic }) => {
  const mins = Math.round(remaining);
  const isExpiring = mins <= 15;

  if (mins <= 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 text-sm">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="font-medium text-destructive">This room has expired.</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2.5 border-b text-sm transition-colors',
      isExpiring ? 'bg-orange-500/8 border-orange-400/20' : 'bg-secondary/50 border-border/60'
    )}>
      <Clock className={cn('w-3.5 h-3.5', isExpiring ? 'text-orange-400' : 'text-muted-foreground')} />
      <span className={cn('font-medium truncate', isExpiring ? 'text-orange-500' : 'text-foreground')}>
        {topic}
      </span>
      <span className={cn('ml-auto text-xs font-semibold flex-shrink-0', isExpiring ? 'text-orange-500' : 'text-muted-foreground')}>
        closes in {mins}m
      </span>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────

const CircleFocusRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, members, room, studentCount, remainingMinutes, sendMessage, loading } = useFocusRoom(roomId ?? '');

  const [messageText, setMessageText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const canSend = !!selectedCategory && messageText.trim().length > 0 && remainingMinutes > 0;

  // Auto-scroll on new message
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

  if (!user) {
    return (
      <MainLayout title="SETU Commune">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Please login to join this study room.</p>
          <Button onClick={() => navigate('/auth')}>Login</Button>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout title="SETU Commune">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-muted-foreground text-sm">Joining room...</p>
        </div>
      </MainLayout>
    );
  }

  if (!room) {
    return (
      <MainLayout title="SETU Commune">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Room not found or has expired.</p>
          <Button variant="outline" onClick={() => navigate('/circles')}>
            Back to Commune
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={room.title}>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto -mt-2">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 pb-3 border-b border-border/60 mb-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => navigate('/circles')}
          >
            <ArrowLeft className="w-4 h-4" />
            Commune
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                <Circle className="w-2 h-2 fill-current" />
                Live
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                {studentCount} online
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-7"
            onClick={async () => {
              const url = `${window.location.origin}/circles/${roomId}`;
              const shareData = {
                title: 'Join me on SETU Commune!',
                text: `Let's study "${room?.title}" together! 📚🔥`,
                url,
              };
              try {
                if (navigator.share && navigator.canShare?.(shareData)) {
                  await navigator.share(shareData);
                } else {
                  await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
                  toast.success('Invite link copied! 🎉');
                }
              } catch { /* cancelled */ }
            }}
          >
            <Share2 className="w-3 h-3" />
            Invite
          </Button>
        </div>

        {/* ── Timer ── */}
        <TimerBanner remaining={remainingMinutes} topic={room.title} />

        {/* ── Main split ── */}
        <div className="flex-1 flex overflow-hidden mt-0 gap-0">

          {/* ── LEFT: Chat ── */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-border/60">
            <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <p>No messages yet. Start the discussion! 💬</p>
                </div>
              )}
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} currentUserId={user?.id} />
              ))}
            </div>

            {/* ── Composer ── */}
            <div className="border-t border-border/60 p-3 bg-card/80 backdrop-blur-sm space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground pt-1.5 flex-shrink-0">Tag:</span>
                <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
              </div>

              {!selectedCategory && (
                <p className="text-[11px] text-muted-foreground pl-8">
                  Select a category before sending ↑
                </p>
              )}

              <div className="flex gap-2 items-end">
                <textarea
                  rows={2}
                  placeholder={selectedCategory ? `Share your ${selectedCategory.toLowerCase()}...` : 'Select a category first'}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={remainingMinutes <= 0}
                  className={cn(
                    'flex-1 resize-none rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all',
                    !selectedCategory && 'opacity-50 cursor-not-allowed'
                  )}
                />
                <Button
                  size="sm"
                  disabled={!canSend}
                  onClick={handleSend}
                  className={cn(
                    'h-10 w-10 p-0 rounded-xl flex-shrink-0',
                    canSend
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Members ── */}
          <div className="w-56 xl:w-64 flex-shrink-0 flex flex-col overflow-hidden hidden sm:flex">
            <div className="p-3 border-b border-border/60 bg-secondary/30">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" />
                Online ({members.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {members.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Waiting for students...</p>
              )}
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[hsl(213_28%_35%)] flex items-center justify-center text-[11px] font-bold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                    {member.studying && (
                      <p className="text-[10px] text-muted-foreground truncate">📖 {member.studying}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Invite CTA */}
              <div className="pt-3 px-1 space-y-2">
                <p className="text-[10px] text-muted-foreground text-center">
                  Invite your friends to study together!
                </p>
                <Button
                  size="sm"
                  className="w-full text-xs h-8 gap-1.5 bg-gradient-to-r from-accent to-[hsl(25_85%_55%)] text-white hover:opacity-90"
                  onClick={async () => {
                    const url = `${window.location.origin}/circles/${roomId}`;
                    const text = `Join me in "${room?.title}" on SETU Commune! 📚🔥`;
                    try {
                      if (navigator.share) {
                        await navigator.share({ title: 'SETU Commune', text, url });
                      } else {
                        await navigator.clipboard.writeText(`${text}\n${url}`);
                        toast.success('Invite link copied! 🎉');
                      }
                    } catch { /* cancelled */ }
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Invite Friends
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
