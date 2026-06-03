import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialSystem } from '@/hooks/useTrialSystem';

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

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative',
                      'text-white/80 hover:text-white font-medium',
                      isActive
                        ? cn(
                          'text-white font-semibold shadow-lg',
                          isCuet
                            ? 'bg-gradient-to-r from-[hsl(260_50%_55%)] to-[hsl(260_60%_45%)] shadow-[hsl(260_50%_55%)/0.25]'
                            : isNeet
                            ? 'bg-gradient-to-r from-[hsl(145_50%_38%)] to-[hsl(145_60%_32%)] shadow-[hsl(145_50%_38%)/0.25]'
                            : 'bg-gradient-to-r from-[hsl(32_80%_55%)] to-[hsl(32_90%_48%)] shadow-[hsl(32_80%_55%)/0.25]'
                        )
                        : 'hover:bg-white/[0.06]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0',
                        isActive ? 'bg-white/20' : 'bg-white/[0.06] group-hover:bg-white/10'
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{label}</span>
                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground shadow-sm">
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
    </>
  );
};
