import React from 'react';
import { Atom, FlaskConical, Calculator, Dna, BookOpenCheck, Brain, TrendingUp, Globe, GraduationCap, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectCardProps {
  subject: string;
  chaptersCount: number;
  progress: number;
  onClick?: () => void;
}

const subjectConfig: Record<string, { icon: any; label: string; color: string; gradient: string }> = {
  physics: { icon: Atom, label: 'Physics', color: 'bg-physics', gradient: 'from-physics to-blue-400' },
  chemistry: { icon: FlaskConical, label: 'Chemistry', color: 'bg-chemistry', gradient: 'from-chemistry to-emerald-400' },
  maths: { icon: Calculator, label: 'Mathematics', color: 'bg-maths', gradient: 'from-maths to-purple-400' },
  biology: { icon: Dna, label: 'Biology', color: 'bg-green-600', gradient: 'from-green-500 to-emerald-400' },
  // CUET subjects
  english: { icon: BookOpenCheck, label: 'English', color: 'bg-sky-500', gradient: 'from-sky-500 to-blue-400' },
  hindi: { icon: BookOpenCheck, label: 'Hindi', color: 'bg-orange-500', gradient: 'from-orange-500 to-red-400' },
  general_test: { icon: Brain, label: 'General Test', color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-400' },
  economics: { icon: TrendingUp, label: 'Economics', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-400' },
  accountancy: { icon: Calculator, label: 'Accountancy', color: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-400' },
  business_studies: { icon: Globe, label: 'Business Studies', color: 'bg-purple-500', gradient: 'from-purple-500 to-indigo-400' },
  political_science: { icon: GraduationCap, label: 'Political Science', color: 'bg-rose-500', gradient: 'from-rose-500 to-pink-400' },
  history: { icon: BookOpen, label: 'History', color: 'bg-amber-600', gradient: 'from-amber-600 to-yellow-400' },
  geography: { icon: Globe, label: 'Geography', color: 'bg-teal-500', gradient: 'from-teal-500 to-cyan-400' },
  psychology: { icon: Brain, label: 'Psychology', color: 'bg-violet-500', gradient: 'from-violet-500 to-purple-400' },
  sociology: { icon: GraduationCap, label: 'Sociology', color: 'bg-pink-500', gradient: 'from-pink-500 to-rose-400' },
  mathematics: { icon: Calculator, label: 'Mathematics', color: 'bg-maths', gradient: 'from-maths to-purple-400' },
};

const defaultConfig = { icon: BookOpen, label: 'Subject', color: 'bg-gray-500', gradient: 'from-gray-500 to-gray-400' };

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, chaptersCount, progress, onClick }) => {
  const config = subjectConfig[subject] || { ...defaultConfig, label: subject.replace('_', ' ') };
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn('relative overflow-hidden rounded-xl p-6 cursor-pointer card-hover', 'bg-gradient-to-br', config.gradient)}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            {chaptersCount} Chapters
          </span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{config.label}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80 font-medium">Progress</span>
            <span className="font-semibold text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
