import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PenTool,
  ClipboardCheck,
  RotateCcw,
  Video,
  MessageCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { FeatureCard } from '@/components/ui/FeatureCard';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Target,
      title: "Today's Focus",
      description: 'Continue where you left off',
      path: '/learn',
      variant: 'accent' as const,
      badge: 'Recommended'
    },
    {
      icon: BookOpen,
      title: 'Learn',
      description: 'AI-generated notes & concepts',
      path: '/learn'
    },
    {
      icon: PenTool,
      title: 'Practice',
      description: 'MCQs by difficulty level',
      path: '/practice'
    },
    {
      icon: ClipboardCheck,
      title: 'Test',
      description: 'Chapter & mixed tests',
      path: '/test'
    },
    {
      icon: RotateCcw,
      title: 'Revision',
      description: 'Quick notes & formula sheets',
      path: '/revision'
    },
    {
      icon: Video,
      title: 'Lecture SETU',
      description: 'Convert videos to notes',
      path: '/lecture-setu',
      badge: 'New'
    },
    {
      icon: MessageCircle,
      title: 'Ask Jeetu Bhaiya',
      description: 'Your personal mentor',
      path: '/ask-jeetu',
      variant: 'primary' as const
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track your progress',
      path: '/analytics'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <div
          key={action.path + action.title}
          className={`animate-fade-in stagger-${index + 1}`}
          style={{ opacity: 0 }}
        >
          <FeatureCard
            icon={action.icon}
            title={action.title}
            description={action.description}
            onClick={() => navigate(action.path)}
            variant={action.variant}
            badge={action.badge}
          />
        </div>
      ))}
    </div>
  );
};
