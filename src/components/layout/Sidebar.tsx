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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/practice', icon: PenTool, label: 'Practice' },
  { path: '/test', icon: ClipboardCheck, label: 'Test' },
  { path: '/revision', icon: RotateCcw, label: 'Revision' },
  { path: '/lecture-setu', icon: Video, label: 'Lecture SETU' },
  { path: '/ask-jeetu', icon: MessageCircle, label: 'Ask Jeetu Bhaiya' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-primary z-50 transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-setu-saffron flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-white">SETU</h1>
                <p className="text-xs text-white/60">JEE Prep Mentor</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'text-white/70 hover:text-white hover:bg-white/10',
                    isActive && 'bg-setu-saffron text-white font-medium'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/60 text-xs mb-2">Your Mentor</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-setu-saffron/20 flex items-center justify-center">
                  <span className="text-setu-saffron font-bold">JB</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Jeetu Bhaiya</p>
                  <p className="text-white/50 text-xs">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
