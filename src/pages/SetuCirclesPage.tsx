import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCircleRooms, RoomState } from '@/hooks/useCircleRooms';
import {
  JEE_SUBJECTS,
  NEET_SUBJECTS,
  STUDY_MODES,
  StudyMode,
  CircleSubject,
} from '@/data/circlesData';
import {
  Search, Users, Clock, Flame, BookOpen, ChevronRight, Zap, Share2, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// ─── Create Room Dialog ────────────────────────────────────────────────────

const CreateRoomDialog: React.FC<{
  subjects: CircleSubject[];
  onCreate: (title: string, subject: string, studyMode: string, duration: number) => void;
}> = ({ subjects, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.key || '');
  const [studyMode, setStudyMode] = useState('doubts');
  const [duration, setDuration] = useState(60);

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Enter a room title');
      return;
    }
    onCreate(title.trim(), subject, studyMode, duration);
    setTitle('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground h-9">
          <Plus className="w-4 h-4" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Study Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Topic / Title</label>
            <Input
              placeholder="e.g. Electrostatics — Gauss Law Doubts"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSubject(s.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    subject === s.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Study Mode</label>
            <div className="flex flex-wrap gap-2">
              {STUDY_MODES.filter(m => m.key !== 'all').map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setStudyMode(mode.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    studyMode === mode.key
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    duration === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={handleCreate}>
            Create Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
      {subject && (
        <div className={cn('h-1 w-full bg-gradient-to-r', subject.color)} />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-sm text-foreground leading-snug group-hover:text-accent transition-colors">
            {rs.room.title}
          </h4>
          <button
            onClick={(e) => shareRoom(rs.room.id, rs.room.title, e)}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-secondary/80 hover:bg-accent/10 hover:text-accent flex items-center justify-center transition-colors text-muted-foreground"
            title="Invite friends"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {rs.studentCount} online
          </span>
          <span className="flex items-center gap-1">
            <Clock className={cn('w-3.5 h-3.5', isExpiring && 'text-orange-400')} />
            <span className={isExpiring ? 'text-orange-400 font-medium' : ''}>
              {remaining > 0 ? `${remaining}m left` : 'expiring'}
            </span>
          </span>
          {subject && (
            <span className="ml-auto">
              {subject.icon} {subject.label}
            </span>
          )}
        </div>

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
            onClick={(e) => shareRoom(rs.room.id, rs.room.title, e)}
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
  const { user } = useAuth();

  const subjects = isNeet ? NEET_SUBJECTS : JEE_SUBJECTS;
  const { roomStates, createRoom } = useCircleRooms(examMode);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [activeMode, setActiveMode] = useState<StudyMode>('all');

  const totalLive = roomStates.reduce((sum, rs) => sum + rs.studentCount, 0);

  const filteredRooms = useMemo(() => {
    return roomStates.filter(rs => {
      const matchesSearch = !searchQuery ||
        rs.room.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = activeSubject === 'all' || rs.room.subject === activeSubject;
      const matchesMode = activeMode === 'all' || rs.room.study_mode === activeMode;
      const isActive = rs.remainingMinutes > 0;
      return matchesSearch && matchesSubject && matchesMode && isActive;
    });
  }, [roomStates, searchQuery, activeSubject, activeMode]);

  const topRooms = [...filteredRooms]
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 12);

  const getSubjectForRoom = (rs: RoomState) =>
    subjects.find(s => s.key === rs.room.subject);

  if (!user) {
    return (
      <MainLayout title="SETU Commune">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Flame className="w-12 h-12 text-accent" />
          <p className="text-muted-foreground text-center">Please login to access SETU Commune.</p>
          <Button onClick={() => navigate('/auth')}>Login</Button>
        </div>
      </MainLayout>
    );
  }

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
              Real-time study rooms powered by SETU. Join a room or create your own.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white text-sm font-semibold">
                  {totalLive} students online
                </span>
                <Users className="w-4 h-4 text-white/60" />
              </div>
              <CreateRoomDialog subjects={subjects} onCreate={createRoom} />
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

        {/* ── Active Rooms ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Active Rooms</h2>
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
              <p className="text-sm text-muted-foreground mb-3">
                No active rooms yet. Be the first to create one!
              </p>
              <CreateRoomDialog subjects={subjects} onCreate={createRoom} />
            </div>
          )}
        </section>

        {/* ── Subject Filters ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
          </div>
          <div className="flex flex-wrap gap-2">
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

        {/* ── Study Modes ── */}
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

        <div className="text-center py-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            🔒 Rooms expire automatically. Only authenticated SETU students can participate.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default SetuCirclesPage;
