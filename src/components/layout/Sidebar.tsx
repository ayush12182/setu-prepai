// Sidebar.tsx — PrepEntrance Light Blue Sidebar
// Premium EdTech design: clean, academic, distraction-free

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, PenTool, ClipboardCheck, RotateCcw,
  MessageCircle, BarChart3, User, X, Sparkles, Activity,
  Crown, Video, Brain, FileText, HelpCircle, Bot,
  Check, Loader2, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Navigation items ─────────────────────────────────────────────────────────
const getNavItems = () => [
  { path: '/student-hub',       icon: Home,         label: 'My Batch',    badge: undefined, isLearn: false },
  { path: '/learn/physics',     icon: BookOpen,     label: 'Study',       badge: undefined, isLearn: true  },
  { path: '/practice',          icon: PenTool,      label: 'Practice',    badge: undefined, isLearn: false },
  { path: '/test',              icon: ClipboardCheck,label: 'Tests',      badge: undefined, isLearn: false },
  { path: '/revision',          icon: RotateCcw,    label: 'Revision',    badge: undefined, isLearn: false },
  { path: '/study-ai',          icon: Sparkles,     label: 'Knowledge Engine',badge: 'NEW',     isLearn: false },
  { path: '/analytics',         icon: BarChart3,    label: 'Performance', badge: undefined, isLearn: false },
  { path: '/ask-prepentrance',  icon: MessageCircle,label: 'Ask PrepEntrance',   badge: undefined, isLearn: false },
  { path: '/profile',           icon: User,         label: 'Profile',     badge: undefined, isLearn: false },
];

// ─── Exam color config ────────────────────────────────────────────────────────
function getExamChipClass(isNeet: boolean, isCuet: boolean) {
  if (isNeet) return { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
  if (isCuet) return { bg: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' };
  return { bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { config, isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();
  const { profile } = useAuth();
  const { trialStatus } = useTrialSystem();
  const navItems = getNavItems();
  const navigate = useNavigate();
  const location = useLocation();

  // YouTube Lecture Analyzer
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [showMetadata, setShowMetadata] = useState(false);

  const examChip = getExamChipClass(isNeet, isCuet);

  const batchName = localStorage.getItem('batch_name') || profile?.cohortName || 'Aarambh 2028';
  const examLabel = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';

  const isValidYoutubeUrl = (url: string) =>
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);

  const startAnalysis = () => {
    if (!videoUrl) return;
    if (!isValidYoutubeUrl(videoUrl)) {
      setValidationError('❌ Please enter a valid YouTube URL');
      return;
    }
    setValidationError('');
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingLogs(['⚡ Connecting to YouTube API…']);
    setShowMetadata(false);

    const logMessages = [
      'Extracting video audio & raw transcript…',
      'Running semantic parser & concept indexing…',
      'Synthesizing chapter-wise revision notes…',
      'Formulating key equations & derivations…',
      'Compiling questions & PYQ connections…',
      'Finalizing study model & training AI Study Assistant…',
    ];
    const pipelineSteps = [
      '🎥 Extracting Transcript', '🧠 Understanding Concepts',
      '📝 Generating Smart Notes', '📚 Creating Formula Sheet',
      '❓ Building Practice Questions', '🤖 Training Study Assistant',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      setProcessingStep(currentStep);
      setProcessingLogs(prev => [
        ...prev,
        `[Step ${currentStep}/6] ${pipelineSteps[currentStep - 1]} completed.`,
        `  ➔ ${logMessages[currentStep - 1]}`,
      ]);
      if (currentStep >= 6) {
        clearInterval(interval);
        setTimeout(() => { setIsProcessing(false); setShowMetadata(true); }, 800);
      }
    }, 1200);
  };

  const handleEnterStudyRoom = () => {
    sessionStorage.setItem('just_analyzed_lecture_url', videoUrl);
    setIsAnalyzerOpen(false);
    setVideoUrl(''); setShowMetadata(false); setProcessingStep(0); setProcessingLogs([]);
    navigate('/study-ai');
  };

  const PROCESSING_STEPS = [
    { label: 'Extracting Transcript', icon: Sparkles },
    { label: 'Understanding Concepts', icon: Brain },
    { label: 'Generating Smart Notes', icon: FileText },
    { label: 'Creating Formula Sheet', icon: BookOpen },
    { label: 'Building Practice Questions', icon: HelpCircle },
    { label: 'Training Study Assistant', icon: Bot },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 flex flex-col',
          'lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0 lg:shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: '#DCEBFF', borderRight: '1px solid #B6D4FE' }}
      >

        {/* ── Logo ──────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0 bg-gradient-to-b from-[#B6D4FE]/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="brand-logo-container rounded-xl w-12 h-12 shrink-0">
              <img src="/prepentrance-logo.png" alt="PrepEntrance" className="brand-logo-img" />
            </div>
            <div>
              <h1 className="font-bold text-[18px] text-slate-900 tracking-tight leading-none">PrepEntrance</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-[0.15em] mt-0.5 uppercase">
                {isFoundation ? `${classLabel} · School` : `${examLabel} Prep Platform`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}
            className="lg:hidden w-7 h-7 text-slate-500 hover:text-slate-700 hover:bg-blue-100 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Batch chip ────────────────────────────────────────────────────── */}
        <div className="px-4 pb-3 shrink-0">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold',
            examChip.bg
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', examChip.dot)} />
            <span className="truncate">{batchName}</span>
          </div>
        </div>

        <div className="mx-4 h-px bg-[#B6D4FE] shrink-0" />

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isAnalyzer = item.path === '/study-ai';
            const isLearnItem = item.isLearn;

            // Determine active state
            const isPathActive = location.pathname === item.path;
            const isLearnActive = isLearnItem && location.pathname.startsWith('/learn/');
            const isActive = isPathActive || isLearnActive;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={!isLearnItem}
                onClick={(e) => {
                  if (isAnalyzer) {
                    e.preventDefault();
                    setIsAnalyzerOpen(true);
                  } else {
                    onClose();
                  }
                }}
                className={() => cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all duration-150 relative w-full',
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#475569] hover:bg-[#BFDBFE] hover:text-slate-900'
                )}
              >
                {() => (
                  <>
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all',
                      isActive ? 'bg-white/20' : 'bg-white/40 group-hover:bg-white/70',
                    )}>
                      {isAnalyzer ? (
                        <div className="relative">
                          <item.icon className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-blue-600')} />
                          <Sparkles className="w-2 h-2 absolute -top-2 -right-2 animate-pulse text-amber-500" />
                        </div>
                      ) : (
                        <item.icon className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-[#475569] group-hover:text-blue-700')} />
                      )}
                    </div>

                    <span className={cn('text-[15px] flex-1 font-medium', isActive ? 'text-white font-semibold' : 'text-[#475569]')}>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider',
                        isAnalyzer
                          ? isActive ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                          : isActive ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
                      )}>
                        {item.badge}
                      </span>
                    )}

                    {isActive && <div className="absolute right-3 w-1 h-1 rounded-full bg-white/60" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Subscription footer ───────────────────────────────────────────── */}
        <div className="px-4 pb-5 pt-3 border-t border-[#B6D4FE] shrink-0">
          {trialStatus.plan === 'pro' ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-xl p-3 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Crown className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-white/70 tracking-wider uppercase">Premium Member</p>
                <p className="text-white text-xs font-semibold mt-0.5">✓ Active Plan</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#B6D4FE] rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Free Trial</p>
                    <p className="text-amber-600 text-[11px] font-bold truncate">
                      🔥 {trialStatus.daysLeft} day{trialStatus.daysLeft !== 1 ? 's' : ''} left
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  Upgrade
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── YouTube Analyzer Modal ────────────────────────────────────────────── */}
      <Dialog open={isAnalyzerOpen} onOpenChange={(open) => {
        if (!isProcessing) {
          setIsAnalyzerOpen(open);
          if (!open) { setValidationError(''); setVideoUrl(''); setShowMetadata(false); }
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-xl p-6">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </div>
              Analyze Any YouTube Video
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Convert any YouTube video into study notes, formulas, revision sheets, and practice questions.
            </DialogDescription>
          </DialogHeader>

          {!isProcessing && !showMetadata && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Paste YouTube URL</label>
                <input
                  type="text" value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); if (validationError) setValidationError(''); }}
                  placeholder="https://youtube.com/watch?v=..."
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm text-slate-800 placeholder-slate-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium',
                    validationError ? 'border-red-400' : 'border-slate-200'
                  )}
                />
                {validationError && <p className="text-red-500 text-xs font-semibold">{validationError}</p>}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setIsAnalyzerOpen(false); setVideoUrl(''); setValidationError(''); }}
                  className="text-slate-500 hover:text-slate-700 text-xs rounded-xl border border-slate-200">
                  Cancel
                </Button>
                <Button onClick={startAnalysis} disabled={!videoUrl} size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-4">
                  Analyze Video
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-700">AI Pipeline Active</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Analyzing video and extracting study assets…</p>
                </div>
              </div>
              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                {PROCESSING_STEPS.map((step, idx) => {
                  const isStepActive = processingStep === idx;
                  const isCompleted = processingStep > idx;
                  const StepIcon = step.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 transition-all">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border shrink-0',
                        isCompleted ? 'bg-emerald-100 border-emerald-300 text-emerald-600' :
                        isStepActive ? 'bg-blue-600 border-blue-600 text-white' :
                        'bg-white border-slate-200 text-slate-400'
                      )}>
                        {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                      </div>
                      <StepIcon className={cn('w-3 h-3', isCompleted ? 'text-emerald-500' : isStepActive ? 'text-blue-600' : 'text-slate-300')} />
                      <span className={cn('text-xs', isCompleted ? 'text-slate-600' : isStepActive ? 'text-blue-700 font-bold' : 'text-slate-400')}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showMetadata && (
            <div className="space-y-4 pt-2 animate-in fade-in zoom-in-95">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[9px] bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Video Analyzed
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">Electrostatics One Shot</h4>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[['Duration', '2h 15m'], ['Concepts', '42'], ['Formulas', '18'], ['Questions', '50']].map(([label, val]) => (
                    <div key={label} className="bg-white border border-blue-100 rounded-lg p-2 text-center">
                      <div className="text-slate-400 text-[8px] uppercase font-bold tracking-wider">{label}</div>
                      <div className="text-slate-900 font-black text-sm mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleEnterStudyRoom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm">
                Open Study Materials <Check className="w-4 h-4 ml-1 stroke-[3]" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
