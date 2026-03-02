import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Settings, Globe, LogIn, LogOut, User, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, LanguageMode } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode, ExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

const languageLabels: Record<LanguageMode, string> = {
  english: 'English',
  hinglish: 'Hinglish',
  hindi: 'हिंदी',
  kannada: 'ಕನ್ನಡ',
  telugu: 'తెలుగు',
  punjabi: 'ਪੰਜਾਬੀ',
  marathi: 'मराठी',
  tamil: 'தமிழ்',
  gujarati: 'ગુજરાતી',
};

const examLabels: Record<ExamMode, { label: string; emoji: string }> = {
  jee: { label: 'JEE', emoji: '⚡' },
  neet: { label: 'NEET', emoji: '🧬' },
  cuet: { label: 'CUET', emoji: '🎯' },
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title = 'SETU' }) => {
  const { language, setLanguage } = useLanguage();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { examMode, setExamMode } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();
  const navigate = useNavigate();

  const handleExamChange = async (mode: ExamMode) => {
    if (mode === examMode) return;
    const examLabelMap: Record<ExamMode, string> = { jee: 'JEE Main', neet: 'NEET', cuet: 'CUET' };
    setExamMode(mode);
    try {
      await updateProfile({ target_exam: examLabelMap[mode] });
      toast.success(`Switched to ${mode.toUpperCase()} Mode ${examLabels[mode].emoji}`);
    } catch {
      toast.error('Failed to switch exam mode');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Link to="/dashboard" className="flex items-center">
            <img src="/setu-logo.png" alt="SETU" className="h-12 w-auto rounded-lg shadow-sm hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Exam Mode Switcher — hidden in foundation mode */}
          {!isFoundation ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{examLabels[examMode].emoji} {examLabels[examMode].label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(examLabels) as ExamMode[]).map((mode) => (
                  <DropdownMenuItem
                    key={mode}
                    onClick={() => handleExamChange(mode)}
                    className={examMode === mode ? 'bg-secondary font-medium' : ''}
                  >
                    {examLabels[mode].emoji} {examLabels[mode].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/15 text-accent">
              📚 {classLabel} • Foundation
            </span>
          )}

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">{languageLabels[language]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(languageLabels) as LanguageMode[]).map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? 'bg-secondary font-medium' : ''}
                >
                  {languageLabels[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-white text-xs font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{profile?.full_name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="font-medium cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="font-medium">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive font-medium">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2 font-medium">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
