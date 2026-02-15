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
  iconBg: string;
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
      gradient: 'from-[hsl(213_60%_50%)] to-[hsl(200_70%_55%)]',
      iconBg: 'bg-[hsl(213_60%_50%/0.12)]',
      emoji: '📖',
    },
    {
      icon: PenTool,
      title: 'Practice',
      description: 'MCQs by difficulty — easy, medium, hard',
      path: '/practice',
      gradient: 'from-[hsl(145_50%_38%)] to-[hsl(160_50%_45%)]',
      iconBg: 'bg-[hsl(145_50%_38%/0.12)]',
      emoji: '✍️',
    },
    {
      icon: ClipboardCheck,
      title: 'Test',
      description: 'Chapter, Mixed, PYQ & Adaptive tests',
      path: '/test',
      gradient: 'from-[hsl(280_50%_55%)] to-[hsl(260_55%_60%)]',
      iconBg: 'bg-[hsl(280_50%_55%/0.12)]',
      emoji: '📋',
    },
    {
      icon: RotateCcw,
      title: 'Revision',
      description: 'Quick notes, formula sheets & flashcards',
      path: '/revision',
      gradient: 'from-[hsl(32_79%_57%)] to-[hsl(25_85%_55%)]',
      iconBg: 'bg-[hsl(32_79%_57%/0.12)]',
      emoji: '🔄',
    },
    {
      icon: Video,
      title: 'Lecture SETU',
      description: 'Convert any lecture video into structured notes',
      path: '/lecture-setu',
      gradient: 'from-[hsl(350_65%_55%)] to-[hsl(330_60%_55%)]',
      iconBg: 'bg-[hsl(350_65%_55%/0.12)]',
      emoji: '🎬',
      badge: 'New',
    },
    {
      icon: MessageCircle,
      title: 'Ask Jeetu Bhaiya',
      description: 'Your personal AI mentor — doubts, strategy & motivation',
      path: '/ask-jeetu',
      gradient: 'from-primary to-[hsl(213_28%_25%)]',
      iconBg: 'bg-primary/10',
      emoji: '💬',
      span: true,
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track progress, accuracy & time trends',
      path: '/analytics',
      gradient: 'from-[hsl(180_50%_40%)] to-[hsl(195_60%_45%)]',
      iconBg: 'bg-[hsl(180_50%_40%/0.12)]',
      emoji: '📊',
    },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{actions.length} tools</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action, i) => (
          <div
            key={action.path + action.title}
            className={cn(
              "relative group cursor-pointer overflow-hidden animate-fade-in",
              "rounded-2xl border border-border/80 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
              "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent/30",
              action.span && "col-span-2",
              `stagger-${i + 1}`
            )}
            onClick={() => navigate(action.path)}
            style={{ opacity: 0 }}
          >
            {/* Colored top accent bar */}
            <div className={cn("h-1.5 w-full bg-gradient-to-r", action.gradient)} />

            {/* Hover glow */}
            <div className={cn(
              "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 bg-gradient-to-br",
              action.gradient
            )} />

            {badge(action)}

            <div className="relative p-4 sm:p-5 flex flex-col gap-3">
              {/* Icon + Emoji row */}
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                  "transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg",
                  action.gradient
                )}>
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl opacity-40 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">
                  {action.emoji}
                </span>
              </div>

              {/* Text */}
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-accent transition-colors leading-tight">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                  {action.description}
                </p>
              </div>

              {/* Bottom arrow */}
              <div className="flex items-center justify-end mt-auto">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  "bg-secondary/80 group-hover:bg-accent/20"
                )}>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

function badge(action: ActionItem) {
  if (!action.badge) return null;
  return (
    <span className="absolute top-4 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-white z-10">
      {action.badge}
    </span>
  );
}
