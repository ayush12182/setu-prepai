import React from 'react';
import { Atom, FlaskConical, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subject } from '@/data/syllabus';

interface SubjectCardProps {
  subject: Subject;
  chaptersCount: number;
  progress: number;
  onClick?: () => void;
}

const subjectConfig = {
  physics: {
    icon: Atom,
    label: 'Physics',
    color: 'bg-physics',
    gradient: 'from-physics to-blue-400'
  },
  chemistry: {
    icon: FlaskConical,
    label: 'Chemistry',
    color: 'bg-chemistry',
    gradient: 'from-chemistry to-emerald-400'
  },
  maths: {
    icon: Calculator,
    label: 'Mathematics',
    color: 'bg-maths',
    gradient: 'from-maths to-purple-400'
  }
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  chaptersCount,
  progress,
  onClick
}) => {
  const config = subjectConfig[subject];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl p-6 cursor-pointer card-hover',
        'bg-gradient-to-br', config.gradient,
        'text-white'
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-7 h-7" />
          </div>
          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
            {chaptersCount} Chapters
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2">{config.label}</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
