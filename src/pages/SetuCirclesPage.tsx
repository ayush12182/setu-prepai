import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCircleRooms, RoomState } from '@/hooks/useCircleRooms';
import { JEE_SUBJECTS, NEET_SUBJECTS, CircleSubject } from '@/data/circlesData';
import { Users, Clock, Flame, BookOpen, ChevronRight, Zap, Share2, Plus, MessageCircle, Swords, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getSimulatedLiveCount, useActivityFeed } from '@/lib/communeSimulation';

// ─── Create Room Dialog ────────────────────────────────────────────────────
const CreateRoomDialog: React.FC<{
  subjects: CircleSubject[];
  onCreate: (title: string, subject: string, studyMode: string, duration: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  defaultMode?: string;
}> = ({ subjects, onCreate, open, setOpen, defaultMode = 'doubts' }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.key || '');
  const [studyMode, setStudyMode] = useState(defaultMode);
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    if (open) setStudyMode(defaultMode);
  }, [open, defaultMode]);

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
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Start a Study Session 🔥</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">What are you studying?</label>
            <Input
              placeholder="e.g. HC Verma Chapter 3, Integration PYQs..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-secondary/50 border-border focus:border-accent/50"
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
                      ? 'bg-accent/20 text-accent border-accent/50 shadow-[0_0_10px_rgba(234,88,12,0.2)]'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Duration</label>
            <div className="flex gap-2">
              {[25, 50, 90, 120].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    duration === d
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {d}m {d === 25 || d === 50 ? '🍅' : ''}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full h-11 text-base font-semibold bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white shadow-lg shadow-accent/20 border-0" onClick={handleCreate}>
            Enter Arena ⚡
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
  const text = `Join me in "${topic}" on SETU Commune! 📚🔥`;
  if (navigator.share) {
    navigator.share({ title: 'SETU Commune', text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`);
    toast.success('Invite link copied! 🔥');
  }
};

const ActiveRoomCard: React.FC<{ rs: RoomState; subject?: CircleSubject; onJoin: () => void }> = ({
  rs, subject, onJoin,
}) => {
  const remaining = Math.round(rs.remainingMinutes);
  const isExpiring = remaining <= 10;

  return (
    <div
      className={cn(
        'group relative rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col',
        'transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,88,12,0.15)] hover:-translate-y-1 cursor-pointer hover:border-accent/40',
        isExpiring ? 'border-orange-500/40' : 'border-border/60',
      )}
      onClick={onJoin}
    >
      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-base text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
              {rs.room.title}
            </h4>
            {subject && (
              <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-1.5 inline-block px-1.5 py-0.5 rounded", subject.color, "bg-opacity-20")}>
                {subject.icon} {subject.label}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {rs.studentCount} working
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Clock className={cn('w-3.5 h-3.5', isExpiring && 'text-orange-400')} />
              <span className={isExpiring ? 'text-orange-400' : ''}>
                {remaining > 0 ? `${remaining}m left` : 'expiring'}
              </span>
            </span>
          </div>
          
          <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-accent group-hover:bg-accent/20 group-hover:border-accent/30 transition-all">
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
      
      {/* Background gradient hint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-accent/10 transition-colors" />
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
  
  // Simulated stats
  const [liveCount, setLiveCount] = useState(0);
  const events = useActivityFeed(4);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [defaultCreateMode, setDefaultCreateMode] = useState('focus');

  useEffect(() => {
    setLiveCount(getSimulatedLiveCount());
    const interval = setInterval(() => setLiveCount(getSimulatedLiveCount()), 60000);
    return () => clearInterval(interval);
  }, []);

  const totalLiveStudents = liveCount + roomStates.reduce((sum, rs) => sum + rs.studentCount, 0);

  const handleQuickJoin = () => {
    // Find the room with the most students that still has time
    const bestRoom = [...roomStates].sort((a, b) => b.studentCount - a.studentCount).find(r => r.remainingMinutes > 5);
    if (bestRoom) {
      navigate(`/circles/${bestRoom.room.id}`);
    } else {
      // Open create dialog to start the first room
      setDefaultCreateMode('focus');
      setCreateDialogOpen(true);
      toast.info("No active rooms right now! Be the first to start the grind. 🔥");
    }
  };

  const openCategoryCreate = (mode: string) => {
    // If a room of this mode exists, join it, else create
    const modeRoom = [...roomStates].sort((a,b) => b.studentCount - a.studentCount).find(r => r.room.study_mode === mode && r.remainingMinutes > 5);
    if (modeRoom) {
      navigate(`/circles/${modeRoom.room.id}`);
    } else {
      setDefaultCreateMode(mode);
      setCreateDialogOpen(true);
    }
  };

  if (!user) {
    return (
      <MainLayout title="SETU Commune">
        <div className="flex flex-col items-center justify-center py-32 gap-5 px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(234,88,12,0.15)]">
            <Flame className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif">Enter the Commune Arena</h2>
          <p className="text-white/50 max-w-sm leading-relaxed">Login to join live study sessions, compete with peers, and stay focused.</p>
          <Button onClick={() => navigate('/auth')} className="h-12 px-8 rounded-xl font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2">
            Login to Access
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="SETU Commune">
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 pb-20">
        
        {/* ── Hero Lobby Dashboard ── */}
        <div className="relative border-b border-white/5 overflow-hidden">
          {/* Ambient Backgrounds */}
          <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-accent/[0.07] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-indigo-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider pr-1">
                  {totalLiveStudents} Grinding Live
                </span>
              </div>
              
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Don't study alone.<br/>
                Compete. Focus. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-400">Win. 🔥</span>
              </h1>
              
              <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                Join a live room, declare your target, and race against the clock. The ultimate Allen-style environment inside your screen.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button 
                  onClick={handleQuickJoin} 
                  className="w-full sm:w-auto h-14 px-8 rounded-xl text-lg font-bold bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_40px_rgba(234,88,12,0.4)] border-0 transition-all hover:-translate-y-1"
                >
                  <Zap className="w-5 h-5 mr-2 fill-current" />
                  Quick Join
                </Button>
                
                <Button 
                  onClick={() => {
                    setDefaultCreateMode('focus');
                    setCreateDialogOpen(true);
                  }}
                  variant="outline" 
                  className="w-full sm:w-auto h-14 px-8 rounded-xl text-base font-semibold border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Session
                </Button>
              </div>
            </div>

            {/* Right Content - Activity Feed */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <Activity className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-white/90 text-sm tracking-wide">Live Feed</h3>
                </div>
                
                <div className="space-y-4 h-[200px] overflow-hidden relative">
                  {/* Fading gradient for scrolling effect list */}
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0f172a] to-transparent z-10" />
                  
                  {events.map((ev) => (
                    <div key={ev.id} className="flex gap-3 items-start animate-fade-in slide-in-from-top-2">
                       <div className="w-2 h-2 rounded-full bg-accent/80 mt-1.5 shrink-0" />
                       <p className="text-sm text-white/70 leading-snug">
                         <span dangerouslySetInnerHTML={{ __html: ev.message.replace(ev.message.split(' ')[0], `<span class="text-white font-medium">${ev.message.split(' ')[0]}</span>`) }} />
                         <span className="block text-[10px] text-white/40 mt-0.5">Just now</span>
                       </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          
          {/* ── Room Categories ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Target className="w-6 h-6 text-accent" />
                Select Arena
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Focus Room */}
              <button 
                onClick={() => openCategoryCreate('focus')}
                className="text-left group bg-gradient-to-b from-indigo-500/10 to-indigo-500/5 hover:from-indigo-500/20 hover:to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-indigo-100 mb-1">Focus Room</h3>
                <p className="text-sm text-indigo-200/60 leading-snug mb-4">Absolute silence. Deep work. Pin drop focus.</p>
                <div className="flex items-center text-xs font-semibold text-indigo-400 mt-auto">
                  Enter <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              {/* Doubt Room */}
              <button 
                onClick={() => openCategoryCreate('doubts')}
                className="text-left group bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-emerald-100 mb-1">Doubt Room</h3>
                <p className="text-sm text-emerald-200/60 leading-snug mb-4">Stuck? Discuss and resolve concepts together.</p>
                <div className="flex items-center text-xs font-semibold text-emerald-400 mt-auto">
                  Enter <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              {/* Test Mode */}
              <button 
                onClick={() => openCategoryCreate('test')}
                className="text-left group bg-gradient-to-b from-rose-500/10 to-rose-500/5 hover:from-rose-500/20 hover:to-rose-500/10 border border-rose-500/20 rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                  <Swords className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-rose-100 mb-1">Test Mode</h3>
                <p className="text-sm text-rose-200/60 leading-snug mb-4">Compete live with peers. Exam hall pressure.</p>
                <div className="flex items-center text-xs font-semibold text-rose-400 mt-auto">
                  Enter <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              {/* Revision Sprint */}
              <button 
                onClick={() => openCategoryCreate('sprint')}
                className="text-left group bg-gradient-to-b from-amber-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-amber-500/10 border border-amber-500/20 rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                  <Clock className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-amber-100 mb-1">Revision Sprint</h3>
                <p className="text-sm text-amber-200/60 leading-snug mb-4">30-min intense timed revision bursts.</p>
                <div className="flex items-center text-xs font-semibold text-amber-400 mt-auto">
                  Enter <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </section>

          {/* ── Active Live Rooms ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Users className="w-6 h-6 text-accent" />
                Currently Active Rooms
              </h2>
              <span className="text-xs font-semibold text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {roomStates.length} live
              </span>
            </div>

            {roomStates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {roomStates.map(rs => (
                  <ActiveRoomCard
                    key={rs.room.id}
                    rs={rs}
                    subject={subjects.find(s => s.key === rs.room.subject)}
                    onJoin={() => navigate(`/circles/${rs.room.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Flame className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/60 text-lg font-medium mb-2">
                  No rooms right now… be the first one to start a session 🔥
                </p>
                <p className="text-white/40 text-sm mb-6">
                  Students usually join within 2–3 minutes of a room opening.
                </p>
                <Button 
                  onClick={() => {
                    setDefaultCreateMode('focus');
                    setCreateDialogOpen(true);
                  }}
                  className="bg-white hover:bg-white/90 text-black font-semibold h-11 px-6 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" /> Start First Session
                </Button>
              </div>
            )}
          </section>

        </div>
      </div>
      
      <CreateRoomDialog
        subjects={subjects}
        onCreate={createRoom}
        open={createDialogOpen}
        setOpen={setCreateDialogOpen}
        defaultMode={defaultCreateMode}
      />
    </MainLayout>
  );
};

export default SetuCirclesPage;
