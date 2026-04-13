import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Atom, FlaskConical, FunctionSquare, ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TEACHERS = [
  {
    id: 'pk-sir',
    name: 'P.K. Sir',
    subject: 'Physics',
    icon: Atom,
    description: 'Master mechanics and electromagnetism with dead simple real-life analogies. Perfect for visual learners.',
    accent: '#3B82F6',
    bgLight: 'bg-blue-500/10',
    borderLight: 'border-blue-500/20',
  },
  {
    id: 'vk-sir',
    name: 'V.K. Sir',
    subject: 'Chemistry',
    icon: FlaskConical,
    description: 'Make organic chemistry feel like magic. Memorize periodic trends naturally with his proven mnemonics.',
    accent: '#10B981',
    bgLight: 'bg-emerald-500/10',
    borderLight: 'border-emerald-500/20',
  },
  {
    id: 'ak-sir',
    name: 'A.K. Sir',
    subject: 'Mathematics',
    icon: FunctionSquare,
    description: 'Fast, sharp, and elegant solutions. Learn the geometric intuition behind calculus before jumping to formulas.',
    accent: '#F59E0B',
    bgLight: 'bg-amber-500/10',
    borderLight: 'border-amber-500/20',
  }
];

const AITeachersDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useExamMode();

  return (
    <MainLayout title="AI Teachers">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 border border-accent/30">
              <Sparkles className="w-8 h-8 text-accent shrink-0" />
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground !leading-tight">
              Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-foreground">AI Teacher</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-base max-w-xl">
              Immersive, interactive 1-on-1 teaching rooms tailored for {config.label}.
              Sit down, pick a topic, and learn as if you are in a real classroom.
            </p>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEACHERS.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/teaching-room/${teacher.id}`)}
              className={cn(
                "group relative bg-card border rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-300",
                "hover:shadow-2xl hover:-translate-y-1",
                teacher.borderLight
              )}
            >
              {/* Dynamic hover backdrop */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${teacher.accent}15 0%, transparent 100%)` }}
              />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", teacher.bgLight)}>
                    <teacher.icon size={26} color={teacher.accent} />
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    teacher.bgLight
                  )} style={{ color: teacher.accent }}>
                    {teacher.subject}
                  </div>
                </div>

                <h3 className="font-display font-bold text-2xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  {teacher.name}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">
                  {teacher.description}
                </p>

                <div className="mt-auto">
                  <Button 
                    className="w-full justify-between rounded-xl px-4 py-6 font-bold shadow-none border hover:bg-background"
                    style={{ borderColor: `${teacher.accent}40`, color: teacher.accent }}
                    variant="outline"
                  >
                    Enter Classroom
                    <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2" style={{ backgroundColor: `${teacher.accent}20` }}>
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AITeachersDirectoryPage;
