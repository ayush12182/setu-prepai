import React from "react";
import { Target, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { TodaysFocusData } from "@/hooks/useTodaysFocus";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface TodaysFocusProps {
  data: TodaysFocusData | null;
  isLoading?: boolean;
}

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

  return (
    <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[hsl(35_100%_83%)]" />
              <span className="text-sm font-medium text-white/80">Today's Focus</span>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-1">{data.subchapter}</h2>
            <p className="text-white/70 text-sm font-medium">{data.subject} • {data.chapter}</p>
          </div>
        </div>

        {/* Mentor tip */}
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-4 border border-white/10">
          <p className="text-[hsl(35_100%_83%)] text-sm font-medium leading-relaxed">
            {`💡 ${language === "hinglish" || language === "hindi" ? data.taskHinglish : data.task}`}
          </p>
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

