import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, Layers, ClipboardList, MessageSquare,
  LineChart, UserPlus, Settings, Menu, X, LogOut, ChevronLeft, BookOpen, Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export const B2BSidebarLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: t('teacherSidebar.overview'), path: '/b2b' },
    { icon: Users, label: t('teacherSidebar.students'), path: '/b2b/students' },
    { icon: Layers, label: t('teacherSidebar.batches'), path: '/b2b/batches' },
    { icon: MessageSquare, label: t('teacherSidebar.commune'), path: '/batch-commune' },
    { icon: BookOpen, label: t('teacherSidebar.studyMaterials'), path: '/b2b/materials' },
    { icon: ClipboardList, label: t('teacherSidebar.tests'), path: '/b2b/tests' },
    { icon: LineChart, label: t('teacherSidebar.analytics'), path: '/b2b/analytics' },
    { icon: Brain, label: t('teacherSidebar.studentAnalytics'), path: '/teacher/student-analytics' },
    { icon: UserPlus, label: t('teacherSidebar.inviteStudents'), path: '/b2b/invite' },
    { icon: Settings, label: t('teacherSidebar.settings'), path: '/b2b/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="font-display font-black tracking-tighter text-xl scale-y-110">SETU.</span>
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">Teacher</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-foreground">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        className={cn(
          "fixed md:sticky top-0 h-screen w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-black tracking-tighter text-2xl scale-y-110">SETU.</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full mt-1">{t('teacherSidebar.portal')}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            // Check if active (handle exact match for overview, prefix for others)
            const isActive = item.path === '/b2b' 
              ? location.pathname === '/b2b' || location.pathname === '/b2b/'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20 shadow-[0_0_15px_rgba(var(--accent),0.1)]'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border border border-transparent'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="mb-4">
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-secondary/50 border border-border">
             <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-xs">
               {(profile?.institution_name || profile?.full_name || 'T')[0].toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-foreground truncate">
                 {profile?.institution_name || profile?.full_name || 'Teacher'}
               </p>
               <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground truncate">
                 {profile?.user_type?.replace('b2b_', '') || 'Teacher'}
               </p>
             </div>
          </div>
          
          <Button variant="ghost" onClick={signOut} className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
            <LogOut size={16} className="mr-2" /> {t('teacherSidebar.signOut')}
          </Button>
          
          <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground mt-1">
            <Link to="/student-hub">
              <ChevronLeft size={16} className="mr-2" /> {t('teacherSidebar.viewStudentApp')}
            </Link>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col min-h-screen overflow-x-hidden">
        {/* Page Header (desktop invisible, just spacing. Mobile has topbar) */}
        <div className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
