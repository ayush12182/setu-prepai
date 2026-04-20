import React from 'react';
import { Star, GraduationCap, Users, Zap, BookOpen, Trophy, Brain } from 'lucide-react';

const BG = 'hsl(222,25%,9%)';

const TICKER_ITEMS = [
    { icon: GraduationCap, text: "Approved by Kota's Best Faculties" },
    { icon: Users, text: 'Made by Students, for Students' },
    { icon: Star, text: 'Trusted by 10,000+ Learners' },
    { icon: Brain, text: 'AI-Powered Adaptive Learning' },
    { icon: Trophy, text: 'Top Rated Exam Prep Platform' },
    { icon: BookOpen, text: 'Full JEE · NEET · CUET Coverage' },
    { icon: Zap, text: '24×7 AI Mentor Access' },
    // duplicate set so the loop is seamless
    { icon: GraduationCap, text: "Approved by Kota's Best Faculties" },
    { icon: Users, text: 'Made by Students, for Students' },
    { icon: Star, text: 'Trusted by 10,000+ Learners' },
    { icon: Brain, text: 'AI-Powered Adaptive Learning' },
    { icon: Trophy, text: 'Top Rated Exam Prep Platform' },
    { icon: BookOpen, text: 'Full JEE · NEET · CUET Coverage' },
    { icon: Zap, text: '24×7 AI Mentor Access' },
];

export const MarqueeTicker: React.FC = () => (
    <div
        className="relative w-full overflow-hidden py-3"
        style={{
            background: BG,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
    >
        {/* Left fade */}
        <div
            className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
            style={{ background: `linear-gradient(to right, ${BG}, transparent)` }}
        />
        {/* Right fade */}
        <div
            className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
            style={{ background: `linear-gradient(to left, ${BG}, transparent)` }}
        />

        <div
            className="flex whitespace-nowrap"
            style={{ animation: 'ticker 35s linear infinite', willChange: 'transform' }}
        >
            {TICKER_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                    <span
                        key={i}
                        className="inline-flex items-center gap-2.5 px-7 text-[13px] font-medium text-white/45 hover:text-white/70 transition-colors shrink-0"
                    >
                        <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                        {item.text}
                        <span className="ml-5 text-white/15">•</span>
                    </span>
                );
            })}
        </div>

        <style>{`
      @keyframes ticker {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `}</style>
    </div>
);
