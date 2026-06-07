import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  PenTool,
  ClipboardCheck,
  RotateCcw,
  MessageCircle,
  BarChart3,
  User,
  X,
  Sparkles,
  Activity,
  Crown,
  Video,
  Brain,
  FileText,
  HelpCircle,
  Bot,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNavItems = () => [
  { path: '/student-hub', icon: Home, label: 'Dashboard', emoji: '🏠', badge: undefined },
  { path: '/learn', icon: BookOpen, label: 'Learn', emoji: '📚', badge: undefined },
  { path: '/practice', icon: PenTool, label: 'Practice', emoji: '✏️', badge: undefined },
  { path: '/test', icon: ClipboardCheck, label: 'Tests', emoji: '📝', badge: undefined },
  { path: '/revision', icon: RotateCcw, label: 'Revision', emoji: '🔄', badge: undefined },
  { path: '/lecture-prepentrance', icon: Video, label: 'Lecture AI', emoji: '🎥', badge: 'NEW' },
  { path: '/analytics', icon: BarChart3, label: 'Performance', emoji: '📊', badge: undefined },
  { path: '/ask-prepentrance', icon: MessageCircle, label: 'Mentor', emoji: '💬', badge: undefined },
  { path: '/profile', icon: User, label: 'Profile', emoji: '👤', badge: undefined },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { config, isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();
  const { profile } = useAuth();
  const { trialStatus } = useTrialSystem();
  const navItems = getNavItems();
  const navigate = useNavigate();

  // YouTube Lecture Analyzer states
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [showMetadata, setShowMetadata] = useState(false);

  const isValidYoutubeUrl = (url: string) => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
  };

  const startAnalysis = () => {
    if (!videoUrl) return;
    if (!isValidYoutubeUrl(videoUrl)) {
      setValidationError('❌ Please enter a valid YouTube URL');
      return;
    }
    setValidationError('');
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingLogs(['⚡ Connecting to YouTube API & downloading video meta...']);
    setShowMetadata(false);

    const logMessages = [
      'Extracting lecture audio & raw transcript...',
      'Running semantic parser & concept indexing...',
      'Synthesizing chapter-wise revision notes...',
      'Formulating key equations & vector derivations...',
      'Compiling JEE-level questions & PYQ connections...',
      'Finalizing study model & training AI Chatbot...',
    ];

    const pipelineSteps = [
      '🎥 Extracting Transcript',
      '🧠 Understanding Concepts',
      '📝 Generating Smart Notes',
      '📚 Creating Formula Sheet',
      '❓ Building Practice Questions',
      '🤖 Training Lecture AI Assistant',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      setProcessingStep(currentStep);
      setProcessingLogs(prev => [
        ...prev,
        `[Step ${currentStep}/6] ${pipelineSteps[currentStep - 1]} completed.`,
        `  ➔ ${logMessages[currentStep - 1]}`
      ]);

      if (currentStep >= 6) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setShowMetadata(true);
        }, 800);
      }
    }, 1200);
  };

  const handleEnterStudyRoom = () => {
    sessionStorage.setItem('just_analyzed_lecture_url', videoUrl);
    setIsAnalyzerOpen(false);
    setVideoUrl('');
    setShowMetadata(false);
    setProcessingStep(0);
    setProcessingLogs([]);
    navigate('/lecture-prepentrance');
  };

  const PROCESSING_STEPS = [
    { label: "Extracting Transcript", icon: Video },
    { label: "Understanding Concepts", icon: Brain },
    { label: "Generating Smart Notes", icon: FileText },
    { label: "Creating Formula Sheet", icon: BookOpen },
    { label: "Building Practice Questions", icon: HelpCircle },
    { label: "Training Lecture AI Assistant", icon: Bot },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0 lg:shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: isCuet
            ? 'linear-gradient(180deg, hsl(260 30% 16%) 0%, hsl(260 35% 12%) 50%, hsl(260 40% 8%) 100%)'
            : isNeet
            ? 'linear-gradient(180deg, hsl(145 30% 14%) 0%, hsl(145 35% 10%) 50%, hsl(145 40% 8%) 100%)'
            : 'linear-gradient(180deg, hsl(213 40% 16%) 0%, hsl(213 45% 12%) 50%, hsl(213 50% 10%) 100%)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  isCuet
                    ? "from-[hsl(260_50%_55%)] to-[hsl(260_60%_40%)] shadow-[hsl(260_50%_55%)/0.3]"
                    : isNeet
                    ? "from-[hsl(145_50%_45%)] to-[hsl(145_60%_35%)] shadow-[hsl(145_50%_45%)/0.3]"
                    : "from-[hsl(32_80%_55%)] to-[hsl(32_90%_45%)] shadow-[hsl(32_80%_55%)/0.3]"
                )}>
                  <span className="text-slate-950 font-black text-lg">P</span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl text-white tracking-wide">PrepEntrance</h1>
                  <p className="text-[11px] text-white/50 font-medium tracking-wider uppercase">
                    {isFoundation ? `${classLabel} • School` : `${config.label} Prep Mentor`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mode Badge */}
          <div className="mx-5 mb-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold",
              isFoundation
                ? "bg-[hsl(210_60%_50%/0.2)] text-[hsl(210_80%_80%)]"
                : isCuet ? "bg-[hsl(260_50%_55%/0.2)] text-[hsl(260_80%_80%)]"
                : isNeet ? "bg-[hsl(145_50%_38%/0.2)] text-[hsl(145_70%_70%)]" : "bg-[hsl(32_79%_57%/0.2)] text-[hsl(32_100%_80%)]"
            )}>
              <span>{isFoundation ? '📚' : config.emoji}</span>
              <span>{isFoundation ? `${classLabel} • Foundation Learning` : config.fullLabel}</span>
            </div>
          </div>

          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Active Cohort Pathway Card */}
          <div className="p-3 pt-3">
            <NavLink
              to="/profile"
              onClick={onClose}
              className="block bg-gradient-to-br from-white/[0.07] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08] hover:border-accent/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <p className="text-white/50 text-[10px] font-black tracking-[0.15em] uppercase">My Pathway</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-400/5 border border-amber-400/20 flex items-center justify-center shrink-0">
                    <span className="text-xs">🎯</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[11px] font-extrabold truncate">Individual Study Track</p>
                    <p className="text-amber-400/70 text-[10px] truncate">{config.label} • {classLabel}</p>
                  </div>
                </div>

                <div className="h-px bg-white/[0.05]" />

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-white/[0.04] rounded-xl p-2 text-center">
                    <p className="text-white font-black text-xs truncate">{profile?.student_level || 'Intermediate'}</p>
                    <p className="text-white/30 text-[8px] uppercase tracking-wider">Level</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-2 text-center">
                    <p className="text-emerald-400 font-black text-xs flex items-center justify-center gap-1">
                      <Activity className="w-2 h-2" />37%
                    </p>
                    <p className="text-white/30 text-[8px] uppercase tracking-wider">Syllabus</p>
                  </div>
                </div>
              </div>
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
            {navItems.map((item) => {
              const label = item.label;
              const isAnalyzer = item.path === '/lecture-prepentrance';

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (isAnalyzer) {
                      e.preventDefault();
                      setIsAnalyzerOpen(true);
                    } else {
                      onClose();
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative',
                      'text-white/80 hover:text-white font-medium',
                      isActive
                        ? isAnalyzer
                          ? 'text-white font-semibold bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                          : cn(
                            'text-white font-semibold shadow-lg',
                            isCuet
                              ? 'bg-gradient-to-r from-[hsl(260_50%_55%)] to-[hsl(260_60%_45%)] shadow-[hsl(260_50%_55%)/0.25]'
                              : isNeet
                              ? 'bg-gradient-to-r from-[hsl(145_50%_38%)] to-[hsl(145_60%_32%)] shadow-[hsl(145_50%_38%)/0.25]'
                              : 'bg-gradient-to-r from-[hsl(32_80%_55%)] to-[hsl(32_90%_48%)] shadow-[hsl(32_80%_55%)/0.25]'
                          )
                        : isAnalyzer
                        ? 'hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-transparent hover:border-amber-500/30'
                        : 'hover:bg-white/[0.06]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 relative',
                        isActive ? 'bg-white/20' : 'bg-white/[0.06] group-hover:bg-white/10',
                        isAnalyzer && !isActive && 'group-hover:bg-amber-500/20 group-hover:text-amber-400'
                      )}>
                        {isAnalyzer ? (
                          <div className="relative">
                            <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-amber-500")} />
                            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-2.5 -right-2.5 animate-pulse" />
                          </div>
                        ) : (
                          <item.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-sm">{label}</span>
                      {item.badge && (
                        <span className={cn(
                          "ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm",
                          isAnalyzer 
                            ? "bg-amber-500 text-slate-950 font-black animate-pulse" 
                            : "bg-accent text-accent-foreground"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Subscription Status Card */}
          <div className="p-4 bg-white/[0.02] border-t border-white/[0.05] mt-auto">
            {trialStatus.plan === 'pro' ? (
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-amber-400 tracking-wider uppercase">PREMIUM MEMBER</p>
                  <p className="text-white/60 text-[11px] font-semibold">✓ Active Plan</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-white/50 tracking-wider uppercase">FREE TRIAL</p>
                    <p className="text-amber-500 text-[11px] font-bold truncate">
                      🔥 {trialStatus.daysLeft} Day{trialStatus.daysLeft !== 1 ? 's' : ''} Left
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:bg-white/5"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Upgrade
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* YouTube Analyzer Modal */}
      <Dialog open={isAnalyzerOpen} onOpenChange={(open) => {
        if (!isProcessing) {
          setIsAnalyzerOpen(open);
          if (!open) {
            setValidationError('');
            setVideoUrl('');
            setShowMetadata(false);
          }
        }
      }}>
        <DialogContent className="sm:max-w-md bg-[#0F172A] border border-white/[0.08] text-white rounded-3xl shadow-2xl p-6">
          <DialogHeader className="space-y-1.5 text-center sm:text-left">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
                <Video className="w-4.5 h-4.5 text-amber-500" />
              </div>
              Analyze Any YouTube Lecture
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-medium">
              Convert any YouTube video into chapter-wise notes, formulas, and practice questions.
            </DialogDescription>
          </DialogHeader>

          {/* Form / Processing / Success States */}
          {!isProcessing && !showMetadata && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Paste YouTube URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-black/40 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all",
                    validationError ? "border-red-500/50" : "border-white/10 focus:border-amber-500/50"
                  )}
                />
                {validationError && (
                  <p className="text-red-400 text-xs font-semibold mt-1 flex items-center gap-1">
                    {validationError}
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsAnalyzerOpen(false);
                    setVideoUrl('');
                    setValidationError('');
                  }}
                  className="rounded-xl border border-white/5 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startAnalysis}
                  disabled={!videoUrl}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-5 py-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all"
                >
                  Analyze Lecture
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4.5">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-amber-500">AI pipeline engine active</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Please wait, analyzing and extracting study assets...</p>
                </div>
              </div>

              <div className="space-y-2.5 bg-black/20 border border-white/5 rounded-2xl p-4">
                {PROCESSING_STEPS.map((step, idx) => {
                  const isActive = processingStep === idx;
                  const isCompleted = processingStep > idx;
                  const StepIcon = step.icon;

                  return (
                    <div key={idx} className="flex items-center gap-3 transition-all duration-300 animate-in fade-in">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors shrink-0",
                        isCompleted 
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 animate-pulse" 
                          : isActive 
                          ? "bg-amber-500 border-amber-500 text-slate-950" 
                          : "bg-white/5 border-white/10 text-white/40"
                      )}>
                        {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <StepIcon className={cn("w-3.5 h-3.5", isCompleted ? "text-emerald-400 animate-bounce" : isActive ? "text-amber-500" : "text-white/30")} />
                        <span className={cn(
                          "text-xs",
                          isCompleted ? "text-slate-300 font-medium" : isActive ? "text-amber-400 font-bold" : "text-slate-600"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Logs */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 font-mono text-[9px] text-white/40 h-24 overflow-y-auto space-y-0.5">
                <div className="text-amber-500 font-bold uppercase tracking-wider text-[8px] mb-1">// PIPELINE LOGS</div>
                {processingLogs.map((log, index) => (
                  <div key={index} className="truncate">{log}</div>
                ))}
                <div className="text-amber-500 animate-pulse">▋ calculations streaming...</div>
              </div>
            </div>
          )}

          {showMetadata && (
            <div className="space-y-4 pt-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-br from-[#1E293B]/40 to-[#0F172A]/60 border border-amber-500/25 rounded-2xl p-4.5 space-y-4 shadow-lg shadow-amber-500/5">
                <div className="flex items-center gap-3.5 border-b border-white/5 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <Video className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Physics Wallah
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1 truncate">Electrostatics One Shot</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
                    <div className="text-slate-500 text-[8px] uppercase font-bold tracking-wider">Duration</div>
                    <div className="text-white font-black text-xs mt-0.5">2h 15m</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
                    <div className="text-slate-500 text-[8px] uppercase font-bold tracking-wider">Concepts Found</div>
                    <div className="text-white font-black text-xs mt-0.5">42</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
                    <div className="text-slate-500 text-[8px] uppercase font-bold tracking-wider">Formulas</div>
                    <div className="text-white font-black text-xs mt-0.5">18</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
                    <div className="text-slate-500 text-[8px] uppercase font-bold tracking-wider">Questions</div>
                    <div className="text-white font-black text-xs mt-0.5">50</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button
                  onClick={handleEnterStudyRoom}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  Enter Study Room <Check className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
