import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HubLayoutProps {
  children: React.ReactNode;
}

export const HubLayout: React.FC<HubLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#06080D', color: '#E8EAF0' }}>
      {/* Top Nav */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(6,8,13,0.92)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#F97316,#EF4444)' }}
            >S</div>
            <span className="font-bold text-white text-[15px] hidden sm:block">PrepEntrance</span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {[
              { label: 'JEE', path: '/jee/class-11', color: '#3B82F6' },
              { label: 'NEET', path: '/neet/class-11', color: '#10B981' },
              { label: 'CUET', path: '/cuet/class-12', color: '#8B5CF6' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = `${item.color}20`; (e.target as HTMLElement).style.color = item.color; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
              >{item.label}</button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/ask-prepentrance')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)' }}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Mentor
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#F97316,#EF4444)' }}
            >Login</button>
            <button
              className="md:hidden p-1.5 rounded-lg"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onClick={() => setMobileMenuOpen(o => !o)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-3 flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {[
              { label: 'JEE', path: '/jee/class-11', color: '#3B82F6' },
              { label: 'NEET', path: '/neet/class-11', color: '#10B981' },
              { label: 'CUET', path: '/cuet/class-12', color: '#8B5CF6' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-center"
                style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}30` }}
              >{item.label}</button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2025 PrepEntrance Prep — JEE · NEET · CUET preparation resources
        </p>
      </footer>
    </div>
  );
};
