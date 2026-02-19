import React from "react";
import { Target, Clock, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TodaysFocusData } from "@/hooks/useTodaysFocus";
import { useLanguage } from "@/contexts/LanguageContext";

interface SmartSuggestionProps {
    data: TodaysFocusData;
}

export const SmartSuggestion: React.FC<SmartSuggestionProps> = ({ data }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    const handleStartNow = () => {
        navigate(`/subchapter/${data.subchapterId}`);
    };

    return (
        <div className="bg-gradient-to-br from-orange-950 via-red-950 to-orange-950 text-white rounded-2xl p-6 relative overflow-hidden border border-orange-500/20 mb-6 shadow-lg shadow-orange-500/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Flame className="w-5 h-5 text-orange-400 fill-orange-400 animate-pulse" />
                            <span className="text-sm font-bold text-orange-100 uppercase tracking-wide">
                                Smart Suggestion for You
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1 leading-tight">
                            You struggled with <span className="text-orange-200">{data.subchapter}</span> recently.
                        </h2>

                        <p className="text-white/70 text-sm font-medium">
                            {data.subject} • {data.chapter}
                        </p>
                    </div>
                </div>

                {/* Mentor tip with proper contrast */}
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-4 border border-white/10">
                    <p className="text-[hsl(35_100%_83%)] text-sm font-medium leading-relaxed flex items-center gap-2">
                        <Target className="w-4 h-4 shrink-0" />
                        Try 5 targeted questions (3 min) to fix this gap.
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Suggested: 3m</span>
                    </div>

                    <Button
                        className="gap-2 h-10 px-5 bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20"
                        onClick={handleStartNow}
                    >
                        <span className="font-medium">Start Practice</span>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
