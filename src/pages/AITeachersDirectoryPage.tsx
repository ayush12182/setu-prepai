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
    description: 'Master mechanics and electromagnetism with dead simple real-life analogies. Perfect for visual learners looking for NEET/JEE conceptual depth.',
    accent: '#3B82F6',
    accentSecondary: '#60A5FA',
    bgLight: 'bg-blue-500/10',
    borderLight: 'border-blue-500/20',
    specialty: 'Mechanics Guru',
  },
  {
    id: 'vk-sir',
    name: 'V.K. Sir',
    subject: 'Chemistry',
    icon: FlaskConical,
    description: 'Make organic chemistry feel like magic. Memorize periodic trends naturally with his proven mnemonics and high-yield NEET tips.',
    accent: '#10B981',
    accentSecondary: '#34D399',
    bgLight: 'bg-emerald-500/10',
    borderLight: 'border-emerald-500/20',
    specialty: 'Organic Specialist',
  },
  {
    id: 'ak-sir',
    name: 'A.K. Sir',
    subject: 'Mathematics',
    icon: FunctionSquare,
    description: 'Fast, sharp, and elegant solutions. Learn the geometric intuition behind calculus before jumping into formulas.',
    accent: '#F59E0B',
    accentSecondary: '#FBBF24',
    bgLight: 'bg-amber-500/10',
    borderLight: 'border-amber-500/20',
    specialty: 'Calculus Wizard',
  }
];

const AITeachersDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useExamMode();

  return (
    <MainLayout title="AI Mentor Hub">
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20 pt-4">
        {/* Immersive Header Section */}
        <div className="relative group perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-background to-accent/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
          
          <div className="relative z-10 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-14 overflow-hidden shadow-2xl">
            {/* Animated backdrop particles */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-accent animate-pulse" />
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center border border-accent/20 shadow-lg shadow-accent/10"
              >
                <Sparkles className="w-10 h-10 text-accent" />
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="font-display font-black text-4xl sm:text-6xl text-foreground tracking-tight leading-tight">
                  Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-accent-foreground">Personal AI Mentors</span>
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                  Step into interactive 1-on-1 teaching rooms tailored for <span className="text-foreground font-bold underline decoration-accent/40">{config.label}</span>. 
                  Real-time avatars, chalkboards, and smart feedback.
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-accent/60">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Streaming</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>AI Native</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Voice Interactive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Grid - Immersive Netflix Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {TEACHERS.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              onClick={() => navigate(`/teaching-room/${teacher.id}`)}
              className={cn(
                "group relative bg-[#0A0D14]/80 backdrop-blur-md border border-white/5 rounded-[2rem] cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02]",
                "hover:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] hover:border-white/20"
              )}
            >
              {/* Animated Gradient Border */}
              <div 
                className="absolute inset-x-0 bottom-0 h-1.5 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${teacher.accent}, transparent)` }}
              />

              {/* Dynamic Aura Backdrop */}
              <div 
                className="absolute -top-24 -left-24 w-64 h-64 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-[80px]"
                style={{ backgroundColor: teacher.accent }}
              />

              <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner", teacher.bgLight)}
                  >
                    <teacher.icon size={28} style={{ color: teacher.accent }} />
                  </motion.div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">Subject</span>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm",
                      teacher.bgLight
                    )} style={{ color: teacher.accent }}>
                      {teacher.subject}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-3xl text-foreground tracking-tight group-hover:text-accent transition-colors duration-300">
                      {teacher.name}
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <p className="inline-block text-[11px] font-bold text-accent/80 bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                    {teacher.specialty}
                  </p>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                    {teacher.description}
                  </p>
                </div>

                <div className="mt-auto pt-4">
                  <Button 
                    variant="ghost" 
                    className="w-full h-14 justify-between items-center rounded-2xl px-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 group-hover:border-accent/30 transition-all duration-300"
                  >
                    <span className="text-sm font-bold tracking-tight">Enter Classroom</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all">Start Session</span>
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500" 
                        style={{ backgroundColor: `${teacher.accent}20` }}
                      >
                        <Play className="w-4 h-4 ml-0.5" style={{ color: teacher.accent, fill: teacher.accent }} />
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Feature Bar */}
        <div className="flex flex-wrap justify-center gap-8 py-8 border-t border-white/5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium">Personalized Doubt Solving</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Atom className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Chapter-wise Mastery</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Play className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">Live AI Chalkboards</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AITeachersDirectoryPage;
