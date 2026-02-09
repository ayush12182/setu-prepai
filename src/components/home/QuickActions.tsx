import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PenTool,
  ClipboardCheck,
  RotateCcw,
  Video,
  MessageCircle,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionItem {
  icon: React.ElementType;
  title: string;
  description: string;
  path: string;
  gradient: string;
  bgGlow: string;
  emoji: string;
  badge?: string;
  span?: boolean;
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions: ActionItem[] = [
    {
      icon: BookOpen,
      title: 'Learn',
      description: 'AI-generated notes, concepts & visual explanations',
      path: '/learn',
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/10',
      emoji: '📖',
    },
    {
      icon: PenTool,
      title: 'Practice',
      description: 'MCQs by difficulty — easy, medium, hard',
      path: '/practice',
      gradient: 'from-emerald-500 to-green-500',
      bgGlow: 'bg-emerald-500/10',
      emoji: '✍️',
    },
    {
      icon: ClipboardCheck,
      title: 'Test',
      description: 'Chapter, Mixed, PYQ & Adaptive tests',
      path: '/test',
      gradient: 'from-violet-500 to-purple-500',
      bgGlow: 'bg-violet-500/10',
      emoji: '📋',
    },
    {
      icon: RotateCcw,
      title: 'Revision',
      description: 'Quick notes, formula sheets & flashcards',
      path: '/revision',
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-amber-500/10',
      emoji: '🔄',
    },
    {
      icon: Video,
      title: 'Lecture SETU',
      description: 'Convert any lecture video into structured notes',
      path: '/lecture-setu',
      gradient: 'from-rose-500 to-pink-500',
      bgGlow: 'bg-rose-500/10',
      emoji: '🎬',
      badge: 'New',
    },
    {
      icon: MessageCircle,
      title: 'Ask Jeetu Bhaiya',
      description: 'Your personal AI mentor — doubts, strategy & motivation',
      path: '/ask-jeetu',
      gradient: 'from-primary to-[hsl(213_28%_25%)]',
      bgGlow: 'bg-primary/10',
      emoji: '💬',
      span: true,
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track progress, accuracy & time trends',
      path: '/analytics',
      gradient: 'from-teal-500 to-cyan-600',
      bgGlow: 'bg-teal-500/10',
      emoji: '📊',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, i) => (
        <div
          key={action.path + action.title}
          className={cn(
            "relative group bg-card border border-border rounded-2xl p-5 cursor-pointer transition-all duration-300",
            "hover:shadow-lg hover:-translate-y-1 overflow-hidden animate-fade-in",
            action.span && "sm:col-span-2 lg:col-span-2",
            `stagger-${i + 1}`
          )}
          onClick={() => navigate(action.path)}
          style={{ opacity: 0 }}
        >
          {/* Hover glow */}
          <div className={cn(
            "absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            action.bgGlow
          )} />

          {badge(action)}

          <div className="relative flex items-start gap-4">
            <div className={cn(
              "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md shrink-0",
              "transition-transform duration-300 group-hover:scale-110",
              action.gradient
            )}>
              <action.icon className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground group-hover:text-accent transition-colors leading-tight mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {action.description}
              </p>
            </div>

            <div className="flex items-center self-center">
              <span className="text-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 hidden sm:block mr-1">
                {action.emoji}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function badge(action: ActionItem) {
  if (!action.badge) return null;
  return (
    <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-white z-10">
      {action.badge}
    </span>
  );
}
