import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFocusRoom } from '@/hooks/useCircleRooms';
import { CATEGORY_STYLES, CategoryStyle, MessageCategory } from '@/data/circlesData';
import { BadgeChip } from '@/components/circles/ReputationBadge';
import {
    ArrowLeft, Users, Clock, Send, Star, Circle, AlertCircle, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { format } from 'date-fns';

// ─── Helper: format time ago ──────────────────────────────────────────────

function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return format(date, 'h:mm a');
}

// ─── Message Bubble ────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: import('@/data/circlesData').CircleMessage }> = ({ msg }) => {
    const [upvoted, setUpvoted] = useState(false);
    const catStyle = CATEGORY_STYLES.find(c => c.label === msg.category);
    const isUser = msg.senderId === 'user';
    const isMentor = msg.isMentor;

    if (isMentor) {
        return (
            <div className={cn(
                'flex gap-3 px-1 animate-fade-in',
                msg.isModeration && 'opacity-80'
            )}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-[hsl(32_85%_50%)] flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-accent">{msg.senderName}</span>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(msg.timestamp)}</span>
                        {msg.isModeration && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                Moderation
                            </span>
                        )}
                    </div>
                    <div className={cn(
                        'rounded-xl rounded-tl-none p-3 text-sm border',
                        msg.isModeration
                            ? 'bg-orange-500/5 border-orange-500/20 text-foreground'
                            : 'bg-accent/5 border-accent/20 text-foreground'
                    )}>
                        {msg.text}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'flex gap-3 px-1 animate-fade-in',
            isUser && 'flex-row-reverse'
        )}>
            {/* Avatar */}
            <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold',
                isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
            )}>
                {msg.senderName.charAt(0)}
            </div>

            <div className={cn('flex-1 max-w-[80%]', isUser && 'items-end flex flex-col')}>
                {/* Header */}
                <div className={cn('flex items-center gap-1.5 mb-1', isUser && 'flex-row-reverse')}>
                    <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>
                    {!isUser && <BadgeChip points={msg.senderPoints} />}
                    <span className="text-[10px] text-muted-foreground">{timeAgo(msg.timestamp)}</span>
                </div>

                {/* Category tag */}
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

                {/* Message */}
                <div className={cn(
                    'rounded-xl p-3 text-sm text-foreground border',
                    isUser
                        ? 'bg-primary/5 border-primary/20 rounded-tr-none'
                        : 'bg-card border-border/80 rounded-tl-none'
                )}>
                    {msg.text}
                </div>

                {/* Upvote */}
                {!isUser && (
                    <button
                        className={cn(
                            'flex items-center gap-1 text-[10px] mt-1 px-2 py-0.5 rounded-full transition-all',
                            upvoted
                                ? 'text-accent bg-accent/10'
                                : 'text-muted-foreground hover:text-accent hover:bg-accent/5'
                        )}
                        onClick={() => setUpvoted(v => !v)}
                    >
                        <Star className={cn('w-3 h-3', upvoted && 'fill-accent text-accent')} />
                        {msg.upvotes + (upvoted ? 1 : 0)} helpful
                    </button>
                )}
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
                <span className="font-medium text-destructive">This room has expired. Discussion is archived.</span>
            </div>
        );
    }

    return (
        <div className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b text-sm transition-colors',
            isExpiring
                ? 'bg-orange-500/8 border-orange-400/20'
                : 'bg-secondary/50 border-border/60'
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
    const { isNeet } = useExamMode();
    const { messages, members, room, studentCount, remainingMinutes, sendMessage } = useFocusRoom(roomId ?? '');

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
        // Keep category selected for quick follow-up
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!room) {
        return (
            <MainLayout title="SETU Circles">
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <AlertCircle className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Room not found or has expired.</p>
                    <Button variant="outline" onClick={() => navigate('/circles')}>
                        Back to Circles
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={room.topic}>
            <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto -mt-2">

                {/* ── Back + room info header ── */}
                <div className="flex items-center gap-3 pb-3 border-b border-border/60 mb-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:text-foreground flex-shrink-0"
                        onClick={() => navigate('/circles')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Circles
                    </Button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                                <Circle className="w-2 h-2 fill-current" />
                                Live
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {studentCount} students
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Timer banner ── */}
                <TimerBanner remaining={remainingMinutes} topic={room.topic} />

                {/* ── Main split layout ── */}
                <div className="flex-1 flex overflow-hidden mt-0 gap-0">

                    {/* ── LEFT: Discussion Feed ── */}
                    <div className="flex-1 flex flex-col overflow-hidden border-r border-border/60">

                        {/* Feed area */}
                        <div
                            ref={feedRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
                        >
                            {messages.map(msg => (
                                <MessageBubble key={msg.id} msg={msg} />
                            ))}
                        </div>

                        {/* ── Composer ── */}
                        <div className="border-t border-border/60 p-3 bg-card/80 backdrop-blur-sm space-y-2.5">
                            {/* Category selector — mandatory */}
                            <div className="flex items-start gap-2">
                                <span className="text-xs text-muted-foreground pt-1.5 flex-shrink-0">Tag:</span>
                                <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
                            </div>

                            {!selectedCategory && (
                                <p className="text-[11px] text-muted-foreground pl-8">
                                    Select a category before sending your message ↑
                                </p>
                            )}

                            {/* Text input + Send */}
                            <div className="flex gap-2 items-end">
                                <textarea
                                    rows={2}
                                    placeholder={
                                        selectedCategory
                                            ? `Share your ${selectedCategory.toLowerCase()}...`
                                            : 'Select a category first'
                                    }
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={remainingMinutes <= 0}
                                    className={cn(
                                        'flex-1 resize-none rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                                        'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50',
                                        'transition-all',
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

                    {/* ── RIGHT: Members Panel ── */}
                    <div className="w-56 xl:w-64 flex-shrink-0 flex flex-col overflow-hidden hidden sm:flex">
                        <div className="p-3 border-b border-border/60 bg-secondary/30">
                            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-accent" />
                                Active Members ({members.filter(m => m.isOnline).length})
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {members.map(member => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[hsl(213_28%_35%)] flex items-center justify-center text-[11px] font-bold text-white">
                                            {member.name.charAt(0)}
                                        </div>
                                        {member.isOnline && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                                        )}
                                    </div>

                                    {/* Name + badge */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                                        <BadgeChip points={member.points} size="sm" />
                                    </div>
                                </div>
                            ))}

                            {/* Study Together CTA */}
                            <div className="pt-3 px-1">
                                <p className="text-[10px] text-muted-foreground text-center mb-2">
                                    Want to focus together?
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-7 gap-1"
                                    onClick={() => {
                                        toast.success('Private focus room opened! Study together started 📚');
                                    }}
                                >
                                    👥 Study Together
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
