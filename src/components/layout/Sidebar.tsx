import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  PenTool,
  ClipboardCheck,
  RotateCcw,
  Video,
  MessageCircle,
  BarChart3,
  User,
  X,
  Sparkles,
  Users,
  Building2,
  Settings,
  TrendingUp,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBatchInfo } from '@/hooks/useBatchInfo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNavItems = () => [
  { path: '/student-hub', icon: Home, label: 'Dashboard', emoji: '🏠', badge: undefined },
  { path: '/learn', icon: BookOpen, label: 'Learn', emoji: '📚', badge: undefined },
  { path: '/practice', icon: PenTool, label: 'Practice', emoji: '✏️', badge: undefined },
  { path: '/test', icon: ClipboardCheck, label: 'Test', emoji: '📝', badge: undefined },
  { path: '/revision', icon: RotateCcw, label: 'Revision', emoji: '🔄', badge: undefined },
  { path: '/lecture-setu', icon: Video, label: 'Lecture SETU', emoji: '🎬', badge: undefined },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', emoji: '📊', badge: undefined },
  { path: '/profile', icon: User, label: 'My Profile', emoji: '👤', badge: undefined },
  { path: '/ask-jeetu', icon: MessageCircle, label: 'Your Mentor', emoji: '💬', badge: undefined },
];

const getB2BNavItems = (isMentor: boolean, isInstitution: boolean) => [
  ...(isMentor ? [{ path: '/teacher', icon: Users, label: 'Mentor Dashboard', emoji: '🎓', badge: 'B2B' }] : []),
  ...(isInstitution ? [{ path: '/institution', icon: Building2, label: 'Institution Hub', emoji: '🏫', badge: 'B2B' }, { path: '/settings/org', icon: Settings, label: 'Org Settings', emoji: '⚙️', badge: 'Admin' }] : []),
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { config, isNeet, isCuet } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();
  const { isMentor, isInstitution } = useAuth();
  const { info: batchInfo, loading: batchLoading } = useBatchInfo();
  const navItems = getNavItems();
  const b2bItems = getB2BNavItems(isMentor, isInstitution);

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
                    : "from-[hsl(36_80%_55%)] to-[hsl(36_90%_45%)] shadow-[hsl(36_80%_55%)/0.3]"
                )}>
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl text-white tracking-wide">SETU</h1>
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

          {/* My Batch Card - above nav, visible for students */}
          {!isMentor && !isInstitution && (
            <div className="p-3 pt-3">
              <NavLink
                to="/my-batch"
                onClick={onClose}
                className="block bg-gradient-to-br from-white/[0.07] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08] hover:border-accent/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                  <p className="text-white/50 text-[10px] font-black tracking-[0.15em] uppercase">My Batch</p>
                </div>

                {batchLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-3 bg-white/[0.05] rounded animate-pulse" />
                    ))}
                  </div>
                ) : batchInfo ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(batchInfo.mentorName)}&backgroundColor=b6e3f4`}
                          alt="Mentor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-[11px] font-bold truncate">{batchInfo.mentorName}</p>
                        <p className="text-accent/70 text-[10px] truncate">{batchInfo.batchName}</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-white/[0.04] rounded-xl p-2 text-center">
                        <p className="text-white font-black text-sm">{batchInfo.totalStudents}</p>
                        <p className="text-white/30 text-[9px] uppercase tracking-wider">Students</p>
                      </div>
                      <div className="bg-emerald-500/10 rounded-xl p-2 text-center">
                        <p className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1">
                          <Activity className="w-2.5 h-2.5" />{batchInfo.practicingToday}
                        </p>
                        <p className="text-white/30 text-[9px] uppercase tracking-wider">Active Today</p>
                      </div>
                    </div>

                    {batchInfo.mostStudiedTopic !== '—' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 bg-blue-500/10 rounded-lg px-2 py-1.5">
                          <TrendingUp className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[8px] text-white/30 uppercase tracking-wider">Top Topic</p>
                            <p className="text-[10px] text-blue-300 font-semibold truncate">{batchInfo.mostStudiedTopic}</p>
                          </div>
                        </div>
                        {batchInfo.mostMistakenTopic !== '—' && (
                          <div className="flex items-center gap-1.5 bg-red-500/10 rounded-lg px-2 py-1.5">
                            <AlertTriangle className="w-2.5 h-2.5 text-red-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[8px] text-white/30 uppercase tracking-wider">Needs Work</p>
                              <p className="text-[10px] text-red-300 font-semibold truncate">{batchInfo.mostMistakenTopic}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor&backgroundColor=b6e3f4" alt="Mentor" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Class Mentor</p>
                      <p className="text-white/40 text-[10px]">Active guidance</p>
                    </div>
                  </div>
                )}
              </NavLink>
            </div>
          )}

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
                            : 'bg-gradient-to-r from-[hsl(36_80%_55%)] to-[hsl(36_90%_48%)] shadow-[hsl(36_80%_55%)/0.25]'
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

          {/* B2B Nav (Role-Aware) */}
          {b2bItems.length > 0 && (
            <>
              <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-1" />
              <div className="px-3 pb-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/25 px-1 mb-1">Institution</p>
                <nav className="space-y-0.5">
                  {b2bItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => cn(
                        'group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative',
                        'text-white/80 hover:text-white font-medium',
                        isActive
                          ? 'bg-gradient-to-r from-accent/80 to-accent/60 text-white font-semibold shadow-lg shadow-accent/20'
                          : 'hover:bg-white/[0.06]'
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.06] group-hover:bg-white/10 transition-all">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{item.label}</span>
                      <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-accent/20 text-accent/90">
                        {item.badge}
                      </span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </>
          )}

        </div>
      </aside>
    </>
  );
};
