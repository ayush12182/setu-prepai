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
  Users,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useAuth } from '@/contexts/AuthContext';

interface ActionItem {
  icon: React.ElementType;
  title: string;
  description: string;
  path: string;
  gradient: string;
  emoji: string;
  badge?: string;
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { isNeet } = useExamMode();
  const { isFoundation } = useClassContext();
  const { isB2BStudent } = useAuth();

  const actions: ActionItem[] = isFoundation
    ? [
      { icon: BookOpen, title: 'Learn', description: 'Concept notes & explanations', path: '/learn', gradient: 'from-blue-500 to-cyan-500', emoji: '📖' },
      { icon: PenTool, title: 'Practice', description: 'Chapter-wise MCQs', path: '/practice', gradient: 'from-emerald-500 to-teal-500', emoji: '✍️' },
      { icon: ClipboardCheck, title: 'Test', description: 'Test your understanding', path: '/test', gradient: 'from-violet-500 to-purple-500', emoji: '📋' },
      { icon: RotateCcw, title: 'Revision', description: 'Quick notes & flashcards', path: '/revision', gradient: 'from-amber-500 to-orange-500', emoji: '🔄' },
      { icon: Video, title: 'Lecture SETU', description: 'Video → structured notes', path: '/lecture-setu', gradient: 'from-rose-500 to-pink-500', emoji: '🎬', badge: 'New' },
      { icon: MessageCircle, title: 'Ask Mentor', description: 'Any doubt, any time', path: '/ask-jeetu', gradient: 'from-primary to-[hsl(213_28%_25%)]', emoji: '💬' },
      { icon: BarChart3, title: 'Progress', description: 'Track your mastery', path: '/analytics', gradient: 'from-teal-500 to-cyan-500', emoji: '📊' },
    ]
    : [
      { icon: BookOpen, title: 'Learn', description: isNeet ? 'NCERT-aligned notes' : 'AI notes & concepts', path: '/learn', gradient: 'from-blue-500 to-cyan-500', emoji: '📖' },
      { icon: PenTool, title: 'Practice', description: isNeet ? 'NCERT MCQs' : 'MCQs by difficulty', path: '/practice', gradient: 'from-emerald-500 to-teal-500', emoji: '✍️' },
      { icon: ClipboardCheck, title: 'Test', description: isNeet ? 'Biology-heavy tests' : 'Chapter & PYQ tests', path: '/test', gradient: 'from-violet-500 to-purple-500', emoji: '📋' },
      { icon: RotateCcw, title: 'Revision', description: isNeet ? 'NCERT flashcards' : 'Formula sheets', path: '/revision', gradient: 'from-amber-500 to-orange-500', emoji: '🔄' },
      ...(!isB2BStudent ? [{ icon: Video, title: 'Lecture SETU', description: 'Video → structured notes', path: '/lecture-setu', gradient: 'from-rose-500 to-pink-500', emoji: '🎬', badge: 'New' }] as ActionItem[] : []),
      { icon: MessageCircle, title: isNeet ? 'Ask NEET Mentor' : 'Ask Jeetu Bhaiya', description: 'Doubts & strategy', path: '/ask-jeetu', gradient: 'from-primary to-[hsl(213_28%_25%)]', emoji: '💬' },
      { icon: BarChart3, title: 'Analytics', description: 'Accuracy & trends', path: '/analytics', gradient: 'from-teal-500 to-cyan-500', emoji: '📊' },
      ...(!isB2BStudent ? [{ icon: Users, title: 'SETU Circles', description: 'Live study rooms', path: '/circles', gradient: 'from-amber-500 via-rose-500 to-violet-500', emoji: '🔥', badge: 'Live' }] as ActionItem[] : []),
    ].filter(a => !isB2BStudent || !['/lecture-setu', '/circles', '/ai-teachers'].includes(a.path));

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.path + action.title}
            className={cn(
              "relative group text-left overflow-hidden rounded-xl",
              "bg-gradient-to-br from-[#0c141d] via-[#1e2a3a] to-[#0c141d]",
              "border border-white/10 shadow-lg",
              "transition-all duration-300 hover:shadow-[0_8px_30px_rgba(232,154,60,0.15)] hover:-translate-y-[3px] hover:border-white/20",
              "h-full"
            )}
            onClick={() => navigate(action.path)}
          >
            {/* Hover glow */}
            <div className={cn(
              "absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 bg-gradient-to-br",
              action.gradient
            )} />

            {/* Badge */}
            {action.badge && (
              <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-accent text-white z-10">
                {action.badge}
              </span>
            )}

            <div className="relative p-4 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-11 h-11 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
                  "transition-transform duration-300 group-hover:scale-110",
                  action.gradient
                )}>
                  <action.icon className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <span className="text-xl opacity-30 group-hover:opacity-80 group-hover:scale-110 transition-all duration-300">
                  {action.emoji}
                </span>
              </div>
              <div className="mt-auto">
                <h3 className="font-bold text-sm text-white group-hover:text-[hsl(35_100%_83%)] transition-colors leading-tight">
                  {action.title}
                </h3>
                <p className="text-[10px] text-white/45 leading-snug mt-0.5 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
