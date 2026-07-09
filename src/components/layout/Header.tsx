// Header.tsx — Clean PrepEntrance Top Navigation
// Premium SaaS design: Minimal, high contrast, smooth interactions

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Globe, LogIn, LogOut, User, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, LanguageMode } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode, ExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

const languageLabels: Record<LanguageMode, string> = {
  english: 'English', hinglish: 'Hinglish', hindi: 'हिंदी', kannada: 'ಕನ್ನಡ',
  telugu: 'తెలుగు', punjabi: 'ਪੰਜਾਬੀ', marathi: 'मराठी', tamil: 'தமிழ்', gujarati: 'ગુજરાતી',
};

const examConfig: Record<ExamMode, { label: string; emoji: string; chip: string }> = {
  jee:  { label: 'JEE',  emoji: '⚡', chip: 'bg-[#F0F4FF] text-[#2563EB] hover:bg-[#E0EAFC] border-transparent' },
  neet: { label: 'NEET', emoji: '🧬', chip: 'bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] border-transparent' },
  cuet: { label: 'CUET', emoji: '🎯', chip: 'bg-[#F5F3FF] text-[#7C3AED] hover:bg-[#EDE9FE] border-transparent' },
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { language, setLanguage } = useLanguage();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { examMode, setExamMode, isLocked } = useExamMode();
  const { isFoundation, classLabel, studentClass } = useClassContext();
  const navigate = useNavigate();

  const ec = examConfig[examMode];
  const classDisplayLabel = isFoundation ? classLabel : (studentClass && studentClass > 0) ? `Class ${studentClass}` : classLabel;

  const handleExamChange = async (mode: ExamMode) => {
    if (mode === examMode) return;
    const examLabelMap: Record<ExamMode, string> = { jee: 'JEE Main', neet: 'NEET', cuet: 'CUET' };
    setExamMode(mode);
    try {
      await updateProfile({ target_exam: examLabelMap[mode] });
      toast.success(`Switched to ${mode.toUpperCase()} Mode`);
    } catch {
      toast.error('Failed to switch exam mode');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300">
      <div className="flex items-center justify-between h-14 px-4 lg:px-8 max-w-[1440px] mx-auto">

        {/* ── Left: Menu + Logo ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick}
            className="lg:hidden w-8 h-8 text-slate-600 hover:bg-slate-100 rounded-lg transition-transform active:scale-95">
            <Menu className="w-4.5 h-4.5" />
          </Button>

          <Link to="/student-hub" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative rounded-xl w-9 h-9 shrink-0 overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105">
              <img src="/prepentrance-logo.png" alt="PrepEntrance" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="font-[800] text-[17px] text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors duration-200">
                PrepEntrance
              </span>
              <span className="text-[9px] text-slate-400 font-bold tracking-[0.15em] mt-0.5 uppercase">
                Prepare · Perform · Succeed
              </span>
            </div>
          </Link>
        </div>

        {/* ── Right: Chips + Controls ───────────────────────────────────────── */}
        <div className="flex items-center gap-3">

          {/* Exam chip */}
          {!isFoundation ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isLocked}>
                <button className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200',
                  'hover:-translate-y-[1px] hover:shadow-sm focus:outline-none',
                  ec.chip, isLocked && 'opacity-60 cursor-default hover:-translate-y-0 hover:shadow-none'
                )}>
                  {isLocked && <Lock className="w-3 h-3 opacity-70" />}
                  <span>{ec.emoji} {ec.label}</span>
                </button>
              </DropdownMenuTrigger>
              {!isLocked && (
                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-xl w-40 p-1 animate-in fade-in zoom-in-95">
                  {(Object.keys(examConfig) as ExamMode[]).map((mode) => (
                    <DropdownMenuItem key={mode} onClick={() => handleExamChange(mode)}
                      className={cn('font-medium cursor-pointer text-sm rounded-lg transition-colors px-3 py-2', examMode === mode ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}>
                      <span className="mr-2">{examConfig[mode].emoji}</span> {examConfig[mode].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          ) : (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
              📚 {classLabel} · Foundation
            </span>
          )}

          {/* Class chip */}
          <span className="hidden sm:inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200/60 shadow-sm">
            {classDisplayLabel}
          </span>

          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/60 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 focus:outline-none">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                {languageLabels[language]}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-xl w-36 p-1 animate-in fade-in zoom-in-95">
              {(Object.keys(languageLabels) as LanguageMode[]).map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)}
                  className={cn('font-medium cursor-pointer text-sm rounded-lg transition-colors px-3 py-2', language === lang ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}>
                  {languageLabels[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-slate-200/80 mx-1 hidden sm:block" />

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200">
            <Bell className="w-4.5 h-4.5" />
            {/* Optional dot indicator */}
            {/* <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" /> */}
          </button>

          {/* Profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 hover:shadow-sm transition-all duration-200 focus:outline-none">
                  <Avatar className="h-6 w-6 border border-slate-100">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[10px] font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-bold text-slate-700">
                    {profile?.full_name?.split(' ')[0] || 'Student'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-2xl p-1 animate-in fade-in zoom-in-95 mt-1">
                <div className="px-3 py-3 border-b border-slate-100 mb-1">
                  <p className="text-sm font-bold text-slate-900">{profile?.full_name || 'Student'}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')}
                  className="font-semibold cursor-pointer text-sm text-slate-700 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                  <User className="w-4 h-4 mr-2.5 text-slate-400" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}
                  className="font-semibold cursor-pointer text-sm text-slate-700 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                  <Settings className="w-4 h-4 mr-2.5 text-slate-400" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem onClick={handleSignOut}
                  className="font-semibold cursor-pointer text-sm text-red-600 rounded-lg px-3 py-2 hover:bg-red-50 hover:text-red-700 transition-colors">
                  <LogOut className="w-4 h-4 mr-2.5" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full px-5 h-9 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-[1px]">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
