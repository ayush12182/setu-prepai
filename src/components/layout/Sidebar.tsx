// Sidebar.tsx — Premium SaaS Design
// Clean, modern, grouped navigation with a striking premium upgrade card

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Home, BookOpen, PenTool, ClipboardCheck, RotateCcw,
  MessageCircle, BarChart3, User, X, Sparkles, Activity,
  Crown, Video, Brain, FileText, HelpCircle, Bot,
  Check, Loader2, ChevronRight, Zap
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
import { ComingSoonModal } from '@/components/shared/ComingSoonModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Navigation Groups ───────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { path: '/student-hub', icon: Home, label: 'My Batch', isLearn: false },
    ]
  },
  {
    label: 'Learning',
    items: [
      { path: '/learn/physics', icon: BookOpen, label: 'Study', isLearn: true },
      { path: '/practice', icon: PenTool, label: 'Practice', isLearn: false },
      { path: '/test', icon: ClipboardCheck, label: 'Tests', isLearn: false },
      { path: '/revision', icon: RotateCcw, label: 'Revision', isLearn: false },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/study-ai', icon: Sparkles, label: 'Knowledge Engine', badge: 'NEW', isLearn: false },
      { path: '/analytics', icon: BarChart3, label: 'Performance', badge: 'AI', isLearn: false },
      { path: '/ask-prepentrance', icon: Bot, label: 'AI Mentor', badge: 'AI', isLearn: false },
    ]
  },
  {
    label: 'Account',
    items: [
      { path: '/profile', icon: User, label: 'Profile', isLearn: false },
    ]
  }
];

// ─── Component ────────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();
  const { profile } = useAuth();
  const { trialStatus } = useTrialSystem();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Coming Soon Modal State
  const [comingSoon, setComingSoon] = useState<{isOpen: boolean; title: string; description: string}>({
    isOpen: false, title: '', description: ''
  });

  const openComingSoon = (type: string) => {
    setComingSoon({
      isOpen: true,
      title: '🚀 Coming Soon',
      description: "This premium feature is currently under development. Stay tuned for an incredible learning experience!"
    });
  };

  React.useEffect(() => {
    const feature = searchParams.get('comingSoon');
    if (feature) {
      openComingSoon(feature);
      searchParams.delete('comingSoon');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // YouTube Analyzer State
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showMetadata, setShowMetadata] = useState(false);

  const batchName = localStorage.getItem('batch_name') || profile?.cohortName || 'Aarambh 2028';
  const examLabel = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col',
          'lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0 lg:shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: '#F8FAFC', borderRight: '1px solid rgba(226, 232, 240, 0.8)' }}
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden shadow-sm border border-slate-200/60 bg-white p-1">
              <img src="/prepentrance-logo.png" alt="PrepEntrance" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="font-[800] text-lg text-slate-900 tracking-tight leading-none">PrepEntrance</h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.1em] mt-1 uppercase">
                {isFoundation ? `${classLabel} · School` : `${examLabel} Platform`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}
            className="lg:hidden w-8 h-8 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Batch chip ────────────────────────────────────────────────────── */}
        <div className="px-5 pb-4 shrink-0">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm group cursor-pointer hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                <Crown className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{batchName}</p>
                <p className="text-[9px] font-semibold text-slate-500 truncate">{examLabel} • {classLabel}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-6 scrollbar-hide">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.label}
              </h4>
              {group.items.map((item) => {
                const isAnalyzer = item.path === '/study-ai';
                const isPathActive = location.pathname === item.path;
                const isLearnActive = item.isLearn && location.pathname.startsWith('/learn/');
                const isActive = isPathActive || isLearnActive;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={!item.isLearn}
                    onClick={(e) => {
                      if (item.badge === 'NEW' || item.badge === 'AI') {
                        e.preventDefault();
                        openComingSoon(item.label);
                        return;
                      }
                      if (isAnalyzer) {
                        e.preventDefault();
                        setIsAnalyzerOpen(true);
                      } else {
                        onClose();
                      }
                    }}
                    className={() => cn(
                      'group flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 relative w-full overflow-hidden',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 hover:scale-[1.02]'
                    )}
                  >
                    {() => (
                      <>
                        <div className={cn(
                          'w-6 h-6 flex items-center justify-center shrink-0 transition-all',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700',
                        )}>
                          {isAnalyzer ? (
                            <div className="relative">
                              <item.icon className={cn('w-4.5 h-4.5', isActive ? 'text-white' : 'text-blue-600')} />
                              <Sparkles className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500" />
                            </div>
                          ) : (
                            <item.icon className="w-4.5 h-4.5" />
                          )}
                        </div>

                        <span className={cn('text-sm flex-1 font-semibold', isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900')}>
                          {item.label}
                        </span>

                        {item.badge && (
                          <span className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase',
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : item.badge === 'NEW' 
                                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Premium Upgrade — Compact Banner ─────────────────────────────── */}
        <div className="px-3 pb-4 pt-2 shrink-0">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="relative w-full overflow-hidden rounded-xl px-3.5 py-3 text-white group cursor-pointer hover:shadow-lg transition-all duration-300 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}
          >
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:opacity-20 transition-opacity" />
            
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-bold text-sm leading-tight">Go Premium</p>
              <p className="text-white/70 text-[10px] font-medium truncate">Unlimited practice & AI</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors shrink-0" />
          </button>
        </div>
      </aside>

      <ComingSoonModal 
        isOpen={comingSoon.isOpen}
        onClose={() => setComingSoon(prev => ({ ...prev, isOpen: false }))}
        title={comingSoon.title}
        description={comingSoon.description}
      />
    </>
  );
};
