import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useCircleRooms, RoomState } from '@/hooks/useCircleRooms';
import {
    JEE_SUBJECTS,
    NEET_SUBJECTS,
    STUDY_MODES,
    StudyMode,
    CircleSubject,
} from '@/data/circlesData';
import {
    Search, Users, Clock, Flame, BookOpen, ChevronRight, Zap, Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── Room Card ─────────────────────────────────────────────────────────────

const shareRoom = async (roomId: string, topic: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/circles/${roomId}`;
    const shareData = {
        title: `Join me on SETU Commune!`,
        text: `Let's study "${topic}" together on SETU Commune! 📚🔥`,
        url,
    };

    try {
        if (navigator.share && navigator.canShare?.(shareData)) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
            toast.success('Invite link copied! Share it with your friends 🎉');
        }
    } catch {
        // User cancelled share dialog
    }
};

const RoomCard: React.FC<{ rs: RoomState; subject?: CircleSubject; onJoin: () => void }> = ({
    rs, subject, onJoin,
}) => {
    const remaining = Math.round(rs.remainingMinutes);
    const isExpiring = remaining <= 15;

    return (
        <div
            className={cn(
                'group relative rounded-xl border bg-card overflow-hidden',
                'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
                isExpiring ? 'border-orange-400/40' : 'border-border/80',
            )}
            onClick={onJoin}
        >
            {/* Subject color top stripe */}
            {subject && (
                <div className={cn('h-1 w-full bg-gradient-to-r', subject.color)} />
            )}

            <div className="p-4">
                {/* Topic + invite */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-foreground leading-snug group-hover:text-accent transition-colors">
                        {rs.room.topic}
                    </h4>
                    <button
                        onClick={(e) => shareRoom(rs.room.id, rs.room.topic, e)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg bg-secondary/80 hover:bg-accent/10 hover:text-accent flex items-center justify-center transition-colors text-muted-foreground"
                        title="Invite friends"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {rs.studentCount} students
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className={cn('w-3.5 h-3.5', isExpiring && 'text-orange-400')} />
                        <span className={isExpiring ? 'text-orange-400 font-medium' : ''}>
                            closes in {remaining > 0 ? `${remaining}m` : 'soon'}
                        </span>
                    </span>
                    {subject && (
                        <span className="ml-auto">
                            {subject.icon} {subject.label}
                        </span>
                    )}
                </div>

                {/* Join + Invite buttons */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="flex-1 gap-1.5 h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={e => { e.stopPropagation(); onJoin(); }}
                    >
                        Join Room
                        <ChevronRight className="w-3 h-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 px-2.5"
                        onClick={(e) => shareRoom(rs.room.id, rs.room.topic, e)}
                    >
                        <Share2 className="w-3 h-3" />
                        Invite
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────

const SetuCirclesPage: React.FC = () => {
    const navigate = useNavigate();
    const { examMode, isNeet } = useExamMode();

    const subjects = isNeet ? NEET_SUBJECTS : JEE_SUBJECTS;
    const allRoomStates = useCircleRooms(examMode);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubject, setActiveSubject] = useState<string>('all');
    const [activeMode, setActiveMode] = useState<StudyMode>('all');

    const totalLive = allRoomStates.reduce((sum, rs) => sum + rs.studentCount, 0);

    const filteredRooms = useMemo(() => {
        return allRoomStates.filter(rs => {
            const matchesSearch = !searchQuery ||
                rs.room.topic.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSubject = activeSubject === 'all' || rs.room.subject === activeSubject;
            const matchesMode = activeMode === 'all' || rs.room.studyMode === activeMode;
            const isActive = rs.remainingMinutes > 0;
            return matchesSearch && matchesSubject && matchesMode && isActive;
        });
    }, [allRoomStates, searchQuery, activeSubject, activeMode]);

    const topRooms = [...filteredRooms]
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 6);

    const getSubjectForRoom = (rs: RoomState) =>
        subjects.find(s => s.key === rs.room.subject);

    return (
        <MainLayout title="SETU Commune">
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">

                {/* ── Hero Header ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-7">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                                <Flame className="w-3.5 h-3.5" />
                                SETU Commune
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                                {isNeet ? '🧬 NEET' : '⚡ JEE'} Only
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Study Together, Score Higher</h1>
                        <p className="text-white/70 text-sm mb-5">
                            Your peers are solving the same doubts. Join a live focus room.
                        </p>

                        {/* Live counter + Invite CTA */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-white text-sm font-semibold">
                                    {totalLive.toLocaleString()} students studying right now
                                </span>
                                <Users className="w-4 h-4 text-white/60" />
                            </div>
                            <Button
                                size="sm"
                                className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm h-9"
                                onClick={() => {
                                    const url = `${window.location.origin}/circles`;
                                    const text = `Join me on SETU Commune! Study with real students preparing for ${isNeet ? 'NEET' : 'JEE'}. 📚🔥`;
                                    if (navigator.share) {
                                        navigator.share({ title: 'SETU Commune', text, url });
                                    } else {
                                        navigator.clipboard.writeText(`${text}\n${url}`);
                                        toast.success('Invite link copied! 🎉');
                                    }
                                }}
                            >
                                <Share2 className="w-4 h-4" />
                                Invite Friends
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Search Bar ── */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search topic or chapter..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all text-sm"
                    />
                </div>

                {/* ── Section 1: Active Now ── */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-accent" />
                        <h2 className="text-lg font-semibold text-foreground">Active Now</h2>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {topRooms.length} rooms
                        </span>
                    </div>

                    {topRooms.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topRooms.map(rs => (
                                <RoomCard
                                    key={rs.room.id}
                                    rs={rs}
                                    subject={getSubjectForRoom(rs)}
                                    onJoin={() => navigate(`/circles/${rs.room.id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center rounded-xl border border-dashed border-border">
                            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No rooms match your filters. Try a different subject or mode.
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-3"
                                onClick={() => { setActiveSubject('all'); setActiveMode('all'); setSearchQuery(''); }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </section>

                {/* ── Section 2: Subject Filters ── */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-accent" />
                        <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* All tab */}
                        <button
                            onClick={() => setActiveSubject('all')}
                            className={cn(
                                'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                                activeSubject === 'all'
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                            )}
                        >
                            🔍 All
                        </button>
                        {subjects.map(sub => (
                            <button
                                key={sub.key}
                                onClick={() => setActiveSubject(sub.key)}
                                className={cn(
                                    'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                                    activeSubject === sub.key
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                                )}
                            >
                                {sub.icon} {sub.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Section 3: Study Modes ── */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-5 h-5 text-accent" />
                        <h2 className="text-lg font-semibold text-foreground">Study Mode</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {STUDY_MODES.map(mode => (
                            <button
                                key={mode.key}
                                onClick={() => setActiveMode(mode.key)}
                                className={cn(
                                    'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                                    activeMode === mode.key
                                        ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                                        : 'bg-card text-muted-foreground border-border hover:border-accent/30 hover:text-foreground'
                                )}
                            >
                                {mode.icon} {mode.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Footer note ── */}
                <div className="text-center py-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                        🔒 Rooms are temporary and expire automatically. All discussions stay focused on exam preparation.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};

export default SetuCirclesPage;
