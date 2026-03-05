import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TodaysFocus } from "@/components/home/TodaysFocus";
import { ExamMode } from "@/contexts/ExamModeContext";
import { SmartSuggestion } from "@/components/home/SmartSuggestion";
import { QuickActions } from "@/components/home/QuickActions";
import { SyllabusTracker } from "@/components/home/SyllabusTracker";
import ExamReminders from "@/components/home/ExamReminders";
import { TwentyOneDayPlan } from "@/components/home/TwentyOneDayPlan";
import { MajorTestCountdown } from "@/components/home/MajorTestCountdown";
import { WeakTopicsCard } from "@/components/home/WeakTopicsCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useExamMode } from "@/contexts/ExamModeContext";
import { useClassContext } from "@/contexts/ClassContext";
import { JeeSubModeSelector } from "@/components/ui/JeeSubModeSelector";
import { Sparkles, Flame, BookOpen, Target, TrendingUp, Brain } from "lucide-react";
import { useTodaysFocus } from "@/hooks/useTodaysFocus";
import { useProgressiveLearning } from "@/hooks/useProgressiveLearning";
import { CirclesDashboardCard } from "@/components/circles/CirclesDashboardCard";
import { TransitionBanner } from "@/components/home/TransitionBanner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const { getMentorName, language } = useLanguage();
  const { user, profile, updateProfile } = useAuth();
  const { config, isNeet, isCuet, examMode, setExamMode } = useExamMode();
  const { isFoundation, classLabel } = useClassContext();
  const navigate = useNavigate();

  const { dailyFocus, smartFocus, isLoading, streak } = useTodaysFocus();
  const { transitionMessage, isReadyForTransition } = useProgressiveLearning();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Bhai";

  const getGreeting = () => {
    if (isFoundation) {
      return language === 'hindi' ? 'आज कुछ नया सीखते हैं!' : "Let's learn something new today!";
    }
    const mentorName = getMentorName();
    const mentorLabel = isCuet ? 'CUET Mentor' : isNeet ? 'NEET Mentor' : mentorName;
    return language === 'hindi'
      ? `${mentorLabel} तैयार है आपकी मदद के लिए।`
      : `${mentorLabel} is ready to help you.`;
  };

  return (
    <MainLayout title={isFoundation ? "Learning Dashboard" : "SETU"}>
      <div className="space-y-6">
        {/* ── Section 1: Welcome Hero ── */}
        {user && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--setu-navy))] via-[hsl(var(--setu-navy-light))] to-[hsl(var(--setu-navy-dark))] p-8 sm:p-10">
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
                    {isFoundation ? 'Learning' : 'Dashboard'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                    {isFoundation ? `📚 ${classLabel} • Foundation` : `${config.emoji} ${config.label} Mode`}
                  </span>
                  {!isFoundation && (
                    <div className="bg-white/10 rounded-xl p-0.5">
                      <JeeSubModeSelector />
                    </div>
                  )}
                </div>
                <p className="text-white/60 text-sm font-medium mb-1">Welcome back, {displayName}! 👋</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {getGreeting()}
                </h1>
              </div>

              <div className="flex gap-3">
                {!isFoundation && (
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
                )}
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

        {/* ── FOUNDATION MODE DASHBOARD (Class 6-10) ── */}
        {isFoundation ? (
          <>
            {isReadyForTransition && transitionMessage && (
              <TransitionBanner message={transitionMessage} />
            )}

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Your Learning Tools
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Brain, label: 'Concept Map', desc: 'Visualize your mastery', path: '/concept-graph', color: 'from-[hsl(270,70%,60%)] to-[hsl(300,60%,55%)]' },
                  { icon: Target, label: 'Learning Assessment', desc: 'Find your gaps', path: '/diagnostic-test', color: 'from-accent to-[hsl(15,80%,55%)]' },
                  { icon: TrendingUp, label: 'Weekly Plan', desc: 'Your learning plan', path: '/learning-roadmap', color: 'from-[hsl(145,60%,45%)] to-[hsl(170,70%,45%)]' },
                  { icon: BookOpen, label: 'My Profile', desc: 'Your strengths', path: '/learning-profile', color: 'from-[hsl(210,80%,55%)] to-[hsl(230,70%,60%)]' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="group bg-card border border-border rounded-xl p-5 text-left hover:border-accent/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{action.label}</h3>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 flex flex-col gap-6">
                <TodaysFocus data={dailyFocus} isLoading={isLoading} streak={streak} />
                {smartFocus && <SmartSuggestion data={smartFocus} />}
              </div>
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    Chapter Mastery
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Chapter Understanding</span>
                      <span className="font-medium text-foreground">Building...</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full w-1/4 transition-all" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Complete your learning assessment to see your personalized mastery map.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <SyllabusTracker />
          </>
        ) : (
          <>
            {/* ── COMPETITIVE MODE DASHBOARD ── */}

            {/* Row 1: Today's Focus (wide) + Right sidebar (Major Test + Exam) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <TodaysFocus data={dailyFocus} isLoading={isLoading} streak={streak} />
                {smartFocus && <SmartSuggestion data={smartFocus} />}
              </div>
              <div className="flex flex-col gap-4">
                <MajorTestCountdown />
                <ExamReminders />
                <CirclesDashboardCard />
              </div>
            </div>

            {/* Row 2: Weak Topics */}
            <WeakTopicsCard />

            {/* Row 3: Quick Actions (full width, centered) */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Actions</h2>
              </div>
              <QuickActions />
            </div>

            {/* Row 3: 21-Day Plan */}
            <TwentyOneDayPlan />

            {/* Row 4: Syllabus */}
            <SyllabusTracker />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
