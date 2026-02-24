import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TodaysFocus } from "@/components/home/TodaysFocus";
import { SmartSuggestion } from "@/components/home/SmartSuggestion";
import { QuickActions } from "@/components/home/QuickActions";
import { SyllabusTracker } from "@/components/home/SyllabusTracker";
import { ExamReminders } from "@/components/home/ExamReminders";
import { TwentyOneDayPlan } from "@/components/home/TwentyOneDayPlan";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useExamMode } from "@/contexts/ExamModeContext";
import { JeeSubModeSelector } from "@/components/ui/JeeSubModeSelector";
import { Sparkles, Flame, ArrowRightLeft } from "lucide-react";
import { useTodaysFocus } from "@/hooks/useTodaysFocus";
import { CirclesDashboardCard } from "@/components/circles/CirclesDashboardCard";
import { toast } from "sonner";

const Index: React.FC = () => {
  const { getMentorName, language } = useLanguage();
  const { user, profile, updateProfile } = useAuth();
  const { config, isNeet, examMode, setExamMode } = useExamMode();

  const handleExamModeSwitch = async () => {
    const newMode = isNeet ? 'jee' : 'neet';
    const newExamLabel = isNeet ? 'JEE Main' : 'NEET';
    setExamMode(newMode);
    try {
      await updateProfile({ target_exam: newExamLabel });
      toast.success(isNeet ? 'Switched to JEE Mode ⚡' : 'Switched to NEET Mode 🧬');
    } catch {
      toast.error('Could not update profile');
    }
  };

  // Use the refactored hook that returns both focus types
  const { dailyFocus, smartFocus, isLoading, streak } = useTodaysFocus();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Bhai";

  const getGreeting = () => {
    const mentorName = getMentorName();
    switch (language) {
      case 'english':
        return isNeet ? "Your NEET Mentor is ready to help you." : `${mentorName} is ready to help you.`;
      case 'hindi':
        return isNeet ? "आपका NEET मेंटर तैयार है आपकी मदद के लिए।" : `${mentorName} तैयार है आपकी मदद के लिए।`;
      case 'kannada':
        return isNeet ? "ನಿಮ್ಮ NEET ಮೆಂಟರ್ ಸಹಾಯಕ್ಕೆ ಸಿದ್ಧ." : `${mentorName} ಸಹಾಯಕ್ಕೆ ಸಿದ್ಧ.`;
      case 'telugu':
        return isNeet ? "మీ NEET మెంటార్ సహాయానికి సిద్ధంగా ఉన్నారు." : `${mentorName} సహాయానికి సిద్ధంగా ఉన్నారు.`;
      case 'punjabi':
        return isNeet ? "ਤੁਹਾਡਾ NEET ਮੈਂਟਰ ਮਦਦ ਲਈ ਤਿਆਰ ਹੈ।" : `${mentorName} ਮਦਦ ਲਈ ਤਿਆਰ ਹੈ।`;
      case 'marathi':
        return isNeet ? "तुमचा NEET मेंटर मदतीसाठी तयार आहे." : `${mentorName} मदतीसाठी तयार आहे.`;
      case 'tamil':
        return isNeet ? "உங்கள் NEET வழிகாட்டி உதவ தயாராக உள்ளார்." : `${mentorName} உதவ தயாராக உள்ளார்.`;
      case 'gujarati':
        return isNeet ? "તમારો NEET મેન્ટર મદદ માટે તૈયાર છે." : `${mentorName} મદદ માટે તૈયાર છે.`;
      default:
        return isNeet ? "Your NEET Mentor ready hai tumhari help ke liye" : `${mentorName} ready hai tumhari help ke liye`;
    }
  };

  return (
    <MainLayout title="SETU">
      <div className="space-y-10">
        {/* ── Section 1: Welcome Hero ── */}
        {user && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--setu-navy-light))] p-8 sm:p-10">
            {/* ... background elements ... */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5" />
                    Dashboard
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                    {config.emoji} {config.label} Mode
                  </span>
                  {/* Exam mode switch button */}
                  <button
                    onClick={handleExamModeSwitch}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all cursor-pointer border border-white/10 hover:border-white/20"
                    title={isNeet ? 'Switch to JEE' : 'Switch to NEET'}
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    Switch to {isNeet ? 'JEE' : 'NEET'}
                  </button>
                  {/* JEE Sub-mode selector — only visible in JEE mode */}
                  <div className="bg-white/10 rounded-xl p-0.5">
                    <JeeSubModeSelector />
                  </div>
                </div>
                <p className="text-white/60 text-sm font-medium mb-1">Welcome back, {displayName}! 👋</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {getGreeting()}
                </h1>
              </div>

              <div className="flex gap-3">
                {/* Cycle Day */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
                  <div className="text-xl font-extrabold text-white leading-none">{dailyFocus?.cycleDay ?? 1}</div>
                  <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">Day / 21</div>
                  <div className="w-full bg-white/10 rounded-full h-1 mt-1.5">
                    <div
                      className="bg-accent h-1 rounded-full transition-all"
                      style={{ width: `${((dailyFocus?.cycleDay ?? 1) / 21) * 100}%` }}
                    />
                  </div>
                </div>
                {/* Streak */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
                  <div className="text-xl font-extrabold text-white leading-none flex items-center justify-center gap-1">
                    🔥 {streak > 0 ? streak : 0}
                  </div>
                  <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                    {streak > 0 ? 'Day Streak' : 'No Streak'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Section 2: Today's Focus & Smart Suggestion ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Always show Daily Focus - PRIMARY */}
            <TodaysFocus data={dailyFocus} isLoading={isLoading} streak={streak} />

            {/* Show Smart Suggestion if available - SECONDARY */}
            {smartFocus && <SmartSuggestion data={smartFocus} />}

            {/* ── Section 3: SETU Circles Dashboard Card ── */}
            <CirclesDashboardCard />
          </div>

          <div className="lg:col-span-2">
            <ExamReminders />
          </div>
        </div>

        {/* ── Section 3: 21-Day Cycle Plan ── */}
        <TwentyOneDayPlan />

        {/* ── Section 4: Quick Actions ── */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Quick Actions
          </h2>
          <QuickActions />
        </section>

        {/* ── Section 5: Syllabus Tracker ── */}
        <SyllabusTracker />
      </div>
    </MainLayout>
  );
};

export default Index;
