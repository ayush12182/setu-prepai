import React from "react";
import { Target, Clock, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const TodaysFocus: React.FC = () => {
  const { language } = useLanguage();

  const focusItem = {
    subject: "Physics",
    chapter: "Rotational Motion",
    task:
      language === "hinglish"
        ? "Aaj rolling motion pe focus karo - PYQ bahut aate hain!"
        : "Focus on rolling motion today - high PYQ frequency!",
    timeLeft: "2h 30m",
    streak: 7,
  };

  return (
    <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[hsl(35_100%_83%)]" />
              <span className="text-sm font-medium text-white/80">Today's Focus</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-1">{focusItem.chapter}</h2>
            <p className="text-white/70 text-sm font-medium">{focusItem.subject}</p>
          </div>

          <div className="flex items-center gap-1.5 bg-[hsl(35_100%_83%)/0.2] px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-[hsl(35_100%_83%)]" />
            <span className="text-sm font-semibold text-white">{focusItem.streak} day streak</span>
          </div>
        </div>

        {/* Mentor tip with proper contrast */}
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-4 border border-white/10">
          <p className="text-[hsl(35_100%_83%)] text-sm font-medium leading-relaxed">💡 {focusItem.task}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Clock className="w-4 h-4" />
            <span>Suggested: {focusItem.timeLeft}</span>
          </div>

          <Button className="btn-hero gap-2 h-10 px-5">
            <span className="font-medium">Start Now</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
