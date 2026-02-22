import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CircleSuggestion } from '@/data/circlesData';
import { useExamMode } from '@/contexts/ExamModeContext';
import { JEE_SUGGESTIONS, NEET_SUGGESTIONS } from '@/data/circlesData';

interface SmartCircleSuggestionProps {
    override?: CircleSuggestion; // optional: pass a specific suggestion (e.g., from analytics)
}

export const SmartCircleSuggestion: React.FC<SmartCircleSuggestionProps> = ({ override }) => {
    const navigate = useNavigate();
    const { isNeet } = useExamMode();

    const suggestions = isNeet ? NEET_SUGGESTIONS : JEE_SUGGESTIONS;
    // Rotate through suggestions by time of day (stable across renders)
    const hourSlot = Math.floor(new Date().getHours() / 4) % suggestions.length;
    const suggestion = override ?? suggestions[hourSlot];

    if (!suggestion) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-950/40 via-amber-950/35 to-orange-950/40 p-5 shadow-lg">
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="text-xs font-bold text-orange-300 uppercase tracking-wide">
                        Smart Circle Suggestion
                    </span>
                </div>

                <p className="text-sm font-medium text-foreground leading-relaxed mb-1">
                    You struggled with{' '}
                    <span className="font-bold text-orange-300">{suggestion.chapterName}</span>.
                </p>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{suggestion.studentCount} students are discussing it right now.</span>
                </p>

                <Button
                    size="sm"
                    className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25"
                    onClick={() => navigate(`/circles/${suggestion.roomId}`)}
                >
                    Join Circle
                    <ArrowRight className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
};
