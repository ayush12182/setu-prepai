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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/learn', icon: BookOpen, label: 'Learn', emoji: '📖' },
  { path: '/practice', icon: PenTool, label: 'Practice', emoji: '✏️' },
  { path: '/test', icon: ClipboardCheck, label: 'Test', emoji: '📝' },
  { path: '/revision', icon: RotateCcw, label: 'Revision', emoji: '🔄' },
  { path: '/lecture-setu', icon: Video, label: 'Lecture SETU', emoji: '🎬' },
  { path: '/ask-jeetu', icon: MessageCircle, label: 'Ask Jeetu Bhaiya', emoji: '💬' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', emoji: '📊' },
  { path: '/profile', icon: User, label: 'My Profile', emoji: '👤' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0 lg:shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'linear-gradient(180deg, hsl(213 40% 16%) 0%, hsl(213 45% 12%) 50%, hsl(213 50% 10%) 100%)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(36_80%_55%)] to-[hsl(36_90%_45%)] flex items-center justify-center shadow-lg shadow-[hsl(36_80%_55%)/0.3]">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl text-white tracking-wide">SETU</h1>
                  <p className="text-[11px] text-white/50 font-medium tracking-wider uppercase">JEE Prep Mentor</p>
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

          {/* Divider with glow */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative',
                    'text-white/80 hover:text-white font-medium',
                    isActive
                      ? 'bg-gradient-to-r from-[hsl(36_80%_55%)] to-[hsl(36_90%_48%)] text-white font-semibold shadow-lg shadow-[hsl(36_80%_55%)/0.25]'
                      : 'hover:bg-white/[0.06]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0',
                      isActive
                        ? 'bg-white/20'
                        : 'bg-white/[0.06] group-hover:bg-white/10'
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                    {isActive && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mentor Card */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl p-4 border border-white/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(36_80%_55%)]" />
                <p className="text-white/50 text-[11px] font-semibold tracking-wider uppercase">Your Mentor</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(36_80%_55%)/0.3] to-[hsl(36_90%_45%)/0.1] flex items-center justify-center border border-[hsl(36_80%_55%)/0.3]">
                  <span className="text-[hsl(36_80%_55%)] font-bold text-sm">JB</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Jeetu Bhaiya</p>
                  <p className="text-white/40 text-xs">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
