import React from "react";
import { Target, Clock, ChevronRight, Zap, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { TodaysFocusData } from "@/hooks/useTodaysFocus";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TodaysFocusProps {
  data: TodaysFocusData | null;
  isLoading?: boolean;
}

const weightageColors: Record<string, string> = {
  High: 'bg-red-500/20 text-red-300 border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Low: 'bg-green-500/20 text-green-300 border-green-500/30',
};

export const TodaysFocus: React.FC<TodaysFocusProps> = ({ data, isLoading = false }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6">
        <Skeleton className="h-6 w-32 mb-3 bg-white/20" />
        <Skeleton className="h-8 w-48 mb-2 bg-white/20" />
        <Skeleton className="h-4 w-24 mb-4 bg-white/20" />
        <Skeleton className="h-16 w-full mb-4 bg-white/20" />
        <Skeleton className="h-10 w-32 bg-white/20" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6">
        <p className="text-white">No focus topic available. Start practicing to unlock personalized recommendations!</p>
      </div>
    );
  }

  const handleStartNow = () => {
    navigate(`/subchapter/${data.subchapterId}`);
  };

  // Determine weightage level for color
  const weightageLevel = data.weightage.startsWith('High') ? 'High' : data.weightage.startsWith('Medium') ? 'Medium' : 'Low';

  return (
    <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Target className="w-5 h-5 text-[hsl(35_100%_83%)]" />
                <span className="text-sm font-medium text-white/80">Today's Focus</span>
              </div>
              {/* Cycle day badge */}
              {data.cycleDay && (
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-xs font-semibold border border-white/20">
                  Day {data.cycleDay} / 21
                </span>
              )}
              {/* Weightage pill */}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold border',
                weightageColors[weightageLevel]
              )}>
                <Zap className="w-3 h-3 inline mr-0.5" />
                {data.weightage}
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-1">{data.subchapter}</h2>
            <p className="text-white/70 text-sm font-medium">{data.subject} • {data.chapter}</p>
          </div>
        </div>

        {/* Mentor tip */}
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-3 border border-white/10">
          <p className="text-[hsl(35_100%_83%)] text-sm font-medium leading-relaxed">
            {`💡 ${language === "hinglish" || language === "hindi" ? data.taskHinglish : data.task}`}
          </p>
        </div>

        {/* Why study today + Board importance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <div className="bg-white/8 backdrop-blur-sm px-3 py-2.5 rounded-xl border border-white/10 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(35_100%_83%)] shrink-0 mt-0.5" />
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Why Today?</p>
              <p className="text-white/85 text-xs leading-snug">{data.whyStudyToday}</p>
            </div>
          </div>
          <div className="bg-white/8 backdrop-blur-sm px-3 py-2.5 rounded-xl border border-white/10 flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-[hsl(35_100%_83%)] shrink-0 mt-0.5" />
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Boards</p>
              <p className="text-white/85 text-xs leading-snug">{data.boardImportance}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Clock className="w-4 h-4" />
            <span>Suggested: {data.suggestedTime}</span>
          </div>

          <Button
            className="gap-2 h-10 px-5 btn-hero"
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
