// Header.tsx — Clean PrepEntrance Top Navigation
// Light, minimal, academic — JEE/NEET/CUET chips, clean profile

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
  jee:  { label: 'JEE',  emoji: '⚡', chip: 'bg-blue-100 text-blue-700 border-blue-200' },
  neet: { label: 'NEET', emoji: '🧬', chip: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cuet: { label: 'CUET', emoji: '🎯', chip: 'bg-violet-100 text-violet-700 border-violet-200' },
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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">

        {/* ── Left: Menu + Logo ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick}
            className="lg:hidden w-8 h-8 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu className="w-4.5 h-4.5" />
          </Button>

          <Link to="/student-hub" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="brand-logo-container rounded-xl w-[42px] h-[42px] shrink-0">
              <img src="/prepentrance-logo.png" alt="PrepEntrance" className="brand-logo-img" />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="font-bold text-[18px] text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                PrepEntrance
              </span>
              <span className="text-[9px] text-slate-500 font-semibold tracking-[0.2em] mt-0.5 uppercase">
                Prepare · Perform · Succeed
              </span>
            </div>
          </Link>
        </div>

        {/* ── Right: Chips + Controls ───────────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Exam chip */}
          {!isFoundation ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isLocked}>
                <button className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all',
                  'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-300',
                  ec.chip, isLocked && 'opacity-60 cursor-default'
                )}>
                  {isLocked && <Lock className="w-3 h-3" />}
                  <span>{ec.emoji} {ec.label}</span>
                </button>
              </DropdownMenuTrigger>
              {!isLocked && (
                <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-lg rounded-xl">
                  {(Object.keys(examConfig) as ExamMode[]).map((mode) => (
                    <DropdownMenuItem key={mode} onClick={() => handleExamChange(mode)}
                      className={cn('font-medium cursor-pointer text-sm', examMode === mode && 'bg-blue-50 text-blue-700')}>
                      {examConfig[mode].emoji} {examConfig[mode].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          ) : (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              📚 {classLabel} · Foundation
            </span>
          )}

          {/* Class chip */}
          <span className="hidden sm:inline text-xs font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {classDisplayLabel}
          </span>

          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                <Globe className="w-3 h-3" />
                {languageLabels[language]}
                <span className="text-slate-400">▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-lg rounded-xl">
              {(Object.keys(languageLabels) as LanguageMode[]).map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)}
                  className={cn('font-medium cursor-pointer text-sm', language === lang && 'bg-blue-50 text-blue-700')}>
                  {languageLabels[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          {/* Profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-blue-600 text-white text-[9px] font-black">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                    {profile?.full_name?.split(' ')[0] || 'Student'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-lg rounded-xl">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{profile?.full_name || 'Student'}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')}
                  className="font-medium cursor-pointer text-sm text-slate-700">
                  <User className="w-4 h-4 mr-2 text-slate-400" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}
                  className="font-medium cursor-pointer text-sm text-slate-700">
                  <Settings className="w-4 h-4 mr-2 text-slate-400" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={handleSignOut}
                  className="font-medium cursor-pointer text-sm text-red-600 focus:text-red-700 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-4 h-8">
                <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
