import React from 'react';
import { Star, GraduationCap, Users, Zap, BookOpen, Trophy, Brain } from 'lucide-react';

const TICKER_ITEMS = [
    { icon: GraduationCap, text: 'Approved by Kota\'s Best Faculties' },
    { icon: Users, text: 'Made by Students, for Students' },
    { icon: Star, text: 'Trusted by 10,000+ Learners' },
    { icon: Brain, text: 'AI-Powered Adaptive Learning' },
    { icon: Trophy, text: 'Top Rated Exam Prep Platform' },
    { icon: BookOpen, text: 'Full JEE · NEET · CUET Coverage' },
    { icon: Zap, text: '24×7 AI Mentor Access' },
    { icon: GraduationCap, text: 'Approved by Kota\'s Best Faculties' },
    { icon: Users, text: 'Made by Students, for Students' },
    { icon: Star, text: 'Trusted by 10,000+ Learners' },
    { icon: Brain, text: 'AI-Powered Adaptive Learning' },
    { icon: Trophy, text: 'Top Rated Exam Prep Platform' },
    { icon: BookOpen, text: 'Full JEE · NEET · CUET Coverage' },
    { icon: Zap, text: '24×7 AI Mentor Access' },
];

export const MarqueeTicker: React.FC = () => {
    return (
        <div className="relative w-full overflow-hidden py-3 border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-background to-transparent" />

            <div
                className="flex gap-0 whitespace-nowrap"
                style={{
                    animation: 'marquee 35s linear infinite',
                    willChange: 'transform',
                }}
            >
                {TICKER_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <span
                            key={i}
                            className="inline-flex items-center gap-2.5 px-6 text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors shrink-0"
                        >
                            <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                            {item.text}
                            <span className="ml-4 text-white/15">•</span>
                        </span>
                    );
                })}
            </div>

            <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
};
