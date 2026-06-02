import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Play, BookOpen, ClipboardCheck, MessageCircle, BarChart3,
  ChevronRight, Zap, Target, Flame, CalendarDays, Eye, Sparkles,
  TrendingUp, AlertTriangle, Activity, Loader2, Clock, CheckCircle2, ArrowRight,
  TrendingDown, Info, Trophy, HelpCircle, GraduationCap, RefreshCw, X, ChevronDown, Check, ArrowUpRight,
  Users, Star, AlertCircle, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';
import { useStudentStats } from '@/hooks/useStudentStats';
import { useBatchInfo } from '@/hooks/useBatchInfo';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentHubPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isNeet, isCuet, isJee, config: examConfig } = useExamMode();
  const { isFoundation, classLabel, studentClass } = useClassContext();

  const { streak, todayDone, accuracy, loading: statsLoading } = useStudentStats();
  const { info: batch, loading: batchLoading } = useBatchInfo();

  const [pageLoading, setPageLoading] = useState(false);

  // ─── 5-STAGE DASHBOARD EVOLUTIONARY STATE ───
  // 0 = Day 0: Setup, 1 = Day 1: Diagnostic, 2 = Day 3: Momentum, 3 = Day 7: First AIR, 4 = Day 30: Command Center
  const [dashboardStage, setDashboardStage] = useState(4); 

  // --- STAGE 0 SETUP STATES ---
  const [selectedExam, setSelectedExam] = useState('JEE');
  const [selectedClass, setSelectedClass] = useState('Class 12');
  const [selectedYear, setSelectedYear] = useState('2028');
  
  // Star Strengths (1-5)
  const [phyStrength, setPhyStrength] = useState(2);
  const [chemStrength, setChemStrength] = useState(3);
  const [mathStrength, setMathStrength] = useState(1);
  
  const [studyHours, setStudyHours] = useState('5');
  const [targetGoal, setTargetGoal] = useState('Top 20k AIR');
  
  // Roadmap creation loading sequence state
  const [isBuildingRoadmap, setIsBuildingRoadmap] = useState(false);
  const [roadmapStep, setRoadmapStep] = useState(0);
  const roadmapLoadingTexts = [
    "Analyzing PCM Strength levels...",
    "Generating Mathematics personal schedule...",
    "Creating Physics Kinematics & Mechanics targets...",
    "Initializing Chemistry Bonding diagnostic notes...",
    "Assembling your personalized mission roadmap..."
  ];

  // --- DYNAMIC STUDY PLAN CHECKLIST STATES ---
  // Toggling these tasks updates rankings, momentum, and next recommended actions in real-time
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete Functions Notes & Formulas', done: false, type: 'revision', rankImpact: 120, duration: '45m', link: '/subchapter/math-1-1' },
    { id: 2, text: 'Solve Motion in 1D Practice DPP', done: false, type: 'practice', rankImpact: 90, duration: '30m', link: '/subchapter/phy-1-1' },
    { id: 3, text: 'Review Chemical Bonding Revision Card', done: false, type: 'revision', rankImpact: 60, duration: '15m', link: '/subchapter/chem-1-1' }
  ]);

  // Handle checking off checklist items
  const toggleChecklistItem = (id: number) => {
    setTasks(prev =>
      prev.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    );
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (!task.done) {
        toast.success(`Mission task completed! Projected AIR improved by +${task.rankImpact} ranks.`);
      } else {
        toast.info("Task reset.");
      }
    }
  };

  // Calculations for Dynamic Rank Engine
  const baseProjectedAIR = dashboardStage === 3 ? 48000 : 24350;
  const targetAIR = 20000;
  const baseConfidence = dashboardStage === 3 ? 42 : 78;
  const baseMomentum = 68;

  const totalRankGain = tasks.filter(t => t.done).reduce((acc, curr) => acc + curr.rankImpact, 0);
  const currentProjectedAIR = baseProjectedAIR - totalRankGain;
  const yesterdayAIR = currentProjectedAIR + 1780;
  const currentGap = currentProjectedAIR - targetAIR;
  const currentConfidence = baseConfidence + tasks.filter(t => t.done).length * 2;
  const currentMomentum = baseMomentum + tasks.filter(t => t.done).length * 8;
  const todayPotentialGain = tasks.filter(t => !t.done).reduce((acc, curr) => acc + curr.rankImpact, 0);
  const nextTargetAIR = currentProjectedAIR - todayPotentialGain;

  // AI Mentor Dialog popup state
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [mentorSpeech, setMentorSpeech] = useState("Mechanics is hurting your AIR. Want a 30-minute recovery plan?");
  const [mentorReplies, setMentorReplies] = useState<Array<{ q: string; a: string }>>([
    {
      q: "Why is my AIR dropping?",
      a: "Look, your consistency is solid (92%), but your accuracy in electromagnetism has dipped. Let's spend 20 minutes on the formula sheets today. Don't stress, standard errors happen to the best of us!"
    },
    {
      q: "Which chapter should I do today?",
      a: "You have Functions at 68% and it is a high-weightage topic for JEE. Finish the remaining 32% today to grab those crucial easy marks!"
    },
    {
      q: "Can I reach 99 percentile?",
      a: "Bilkul! You've already jumped 2,100 ranks this week. If you maintain this 91/100 momentum score for another 4 weeks, a 99 percentile is absolutely within your grasp."
    }
  ]);
  const [activeReply, setActiveReply] = useState<string | null>(null);

  // Why Projected AIR Explainer tooltip state
  const [showExplainer, setShowExplainer] = useState(false);

  // Heatmap June Activity
  const heatmapData = [
    { day: 1, hours: 4.5 }, { day: 2, hours: 6.0 }, { day: 3, hours: 5.5 }, { day: 4, hours: 0 }, { day: 5, hours: 7.2 },
    { day: 6, hours: 8.0 }, { day: 7, hours: 6.5 }, { day: 8, hours: 4.0 }, { day: 9, hours: 5.0 }, { day: 10, hours: 7.8 },
    { day: 11, hours: 0 }, { day: 12, hours: 6.4 }, { day: 13, hours: 5.2 }, { day: 14, hours: 6.8 }, { day: 15, hours: 8.2 },
    { day: 16, hours: 7.5 }, { day: 17, hours: 0 }, { day: 18, hours: 5.8 }, { day: 19, hours: 6.2 }, { day: 20, hours: 7.0 },
    { day: 21, hours: 8.5 }, { day: 22, hours: 6.9 }, { day: 23, hours: 5.4 }, { day: 24, hours: 4.8 }, { day: 25, hours: 6.1 },
    { day: 26, hours: 7.9 }, { day: 27, hours: 0 }, { day: 28, hours: 6.5 }, { day: 29, hours: 7.0 }, { day: 30, hours: 8.1 }
  ];

  // Inverted Recharts Rank Graph Data
  const chartData = [
    { date: 'Week 1', rank: 52000 },
    { date: 'Week 2', rank: 44000 },
    { date: 'Week 3', rank: 38000 },
    { date: 'Week 4', rank: 31000 },
    { date: 'Today', rank: currentProjectedAIR }
  ];

  // Diagnostic Test Form Submission (Simulates Roadmap creation)
  const handleBuildRoadmap = () => {
    setIsBuildingRoadmap(true);
    setRoadmapStep(0);

    const stepInterval = setInterval(() => {
      setRoadmapStep(prev => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setIsBuildingRoadmap(false);
            setDashboardStage(1); // auto-transition to Day 1
            toast.success("JEE Study Mission Created Successfully!");
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  // Get Dynamic Greeting based on selected Lifecycle stage and streaks
  const getContextualGreeting = () => {
    if (dashboardStage === 0) {
      return "👋 Welcome to PrepEntrance, Ayush";
    }
    if (dashboardStage === 1) {
      return "Good Evening Ayush 👋 | We know very little about your preparation right now. Let's discover your strengths.";
    }
    if (dashboardStage === 2) {
      return "🔥 Subject Analysis Underway | We are analyzing your study sessions to validate your strengths.";
    }
    if (dashboardStage === 3) {
      return "🚀 Starting Point Identified | First rank projection unlocked based on your diagnostic mock scores.";
    }
    return "⚡ 43 Days Until JEE Main | Focus Areas: Electrostatics, Modern Physics, Functions.";
  };

  const examLabel = isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE';
  const classTagLabel = classLabel || (studentClass ? `Class ${studentClass}` : 'Class 12');
  const currentLevelStr = isFoundation ? 'Foundation' : 'Advanced';
  const currentYear = profile?.target_year || '2028';
  const batchCohortName = profile?.cohortName || (isNeet ? 'NEET Class 11' : isCuet ? 'CUET Class 12' : 'JEE Class 11');

  return (
    <MainLayout>
      <div className="min-h-screen pb-28 pt-6 bg-[#06080D] text-white">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-8 space-y-8">

          {/* ⚙️ TEST CONTROLLER HEADER: switch lifecycle stages */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Developer Debug tools</span>
              <h3 className="text-xs font-black text-white/60 mt-1">TEST 5-STAGE EVOLUTIONARY LIFECYCLE:</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { s: 0, label: "Day 0: Setup Form" },
                { s: 1, label: "Day 1: Diagnostic" },
                { s: 2, label: "Day 3: Momentum" },
                { s: 3, label: "Day 7: First AIR" },
                { s: 4, label: "Day 30: Command Center" }
              ].map((stage) => (
                <button
                  key={stage.s}
                  onClick={() => {
                    setDashboardStage(stage.s);
                    // reset checklist state for testing consistency
                    setTasks(prev => prev.map(t => ({ ...t, done: false })));
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    dashboardStage === stage.s 
                      ? 'bg-accent text-primary shadow-lg shadow-accent/20' 
                      : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC CONTEXTUAL GREETING BANNER */}
          <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 uppercase tracking-widest bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl text-center">
            {getContextualGreeting()}
          </div>

          {/* ════════════════ STAGE 0: SETUP & DIAGNOSTIC SLIDERS ════════════════ */}
          <AnimatePresence mode="wait">
            {dashboardStage === 0 && (
              <motion.div
                key="stage0"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Onboarding Wizard Form */}
                <div className="rounded-3xl border border-white/[0.06] bg-card p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
                  <div className="text-center space-y-2 border-b border-white/[0.06] pb-5">
                    <h2 className="text-2xl font-black text-white">Let's build your personalized JEE roadmap</h2>
                    <p className="text-xs text-white/50">Answer these quick metrics and create your customized, state-driven timetable mission.</p>
                  </div>

                  {isBuildingRoadmap ? (
                    /* Loading Pipeline */
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-accent" />
                      <h4 className="text-sm font-black text-white">{roadmapLoadingTexts[roadmapStep]}</h4>
                      <div className="h-1.5 w-64 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${(roadmapStep + 1) * 20}%` }} />
                      </div>
                    </div>
                  ) : (
                    /* Slider Elements */
                    <div className="space-y-6">
                      
                      {/* 1. Droplist selectors */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-wider">Exam Category</label>
                          <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-accent outline-none">
                            <option value="JEE">JEE (Advanced)</option>
                            <option value="NEET">NEET (Medical)</option>
                            <option value="CUET">CUET (University)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-wider">Class Grade</label>
                          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-accent outline-none">
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                            <option value="Dropper">Dropper</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-wider">Target Year</label>
                          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-accent outline-none">
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                          </select>
                        </div>
                      </div>

                      {/* 2. Star Strength Sliders (Option 1) */}
                      <div className="space-y-4 border-t border-white/[0.06] pt-5">
                        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Specify Your PCM Strengths:</h4>
                        
                        {/* Physics Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white/80">Physics Strength</span>
                            <span className="flex text-amber-400 gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={cn("w-3.5 h-3.5", i < phyStrength ? "fill-amber-400" : "text-white/10")} />
                              ))}
                            </span>
                          </div>
                          <input type="range" min="1" max="5" value={phyStrength} onChange={(e) => setPhyStrength(Number(e.target.value))} className="w-full accent-accent bg-white/[0.04] h-1 rounded-lg outline-none" />
                        </div>

                        {/* Chemistry Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white/80">Chemistry Strength</span>
                            <span className="flex text-amber-400 gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={cn("w-3.5 h-3.5", i < chemStrength ? "fill-amber-400" : "text-white/10")} />
                              ))}
                            </span>
                          </div>
                          <input type="range" min="1" max="5" value={chemStrength} onChange={(e) => setChemStrength(Number(e.target.value))} className="w-full accent-accent bg-white/[0.04] h-1 rounded-lg outline-none" />
                        </div>

                        {/* Maths Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white/80">Mathematics Strength</span>
                            <span className="flex text-amber-400 gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={cn("w-3.5 h-3.5", i < mathStrength ? "fill-amber-400" : "text-white/10")} />
                              ))}
                            </span>
                          </div>
                          <input type="range" min="1" max="5" value={mathStrength} onChange={(e) => setMathStrength(Number(e.target.value))} className="w-full accent-accent bg-white/[0.04] h-1 rounded-lg outline-none" />
                        </div>
                      </div>

                      {/* 3. Hours and Goals */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-wider">How many hours can you study daily?</label>
                          <div className="grid grid-cols-4 gap-2">
                            {['3', '5', '7', '9+'].map(h => (
                              <button key={h} onClick={() => setStudyHours(h)} className={`py-2 text-center text-xs font-bold rounded-xl border transition-colors ${studyHours === h ? 'bg-accent text-primary border-accent' : 'bg-black/20 border-white/5 hover:bg-white/[0.03]'}`}>
                                {h} Hrs
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-wider">Target Goal Goalpost</label>
                          <select value={targetGoal} onChange={(e) => setTargetGoal(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-accent outline-none">
                            <option value="95 Percentile">95 Percentile</option>
                            <option value="98 Percentile">98 Percentile</option>
                            <option value="99 Percentile">99 Percentile</option>
                            <option value="Top 20k AIR">Top 20,000 AIR</option>
                            <option value="Top 10k AIR">Top 10,000 AIR</option>
                          </select>
                        </div>
                      </div>

                      {/* Build button */}
                      <Button onClick={handleBuildRoadmap} className="w-full bg-accent text-primary hover:bg-accent/90 font-bold py-4 rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2">
                        🚀 Build My Mission <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════ STAGE 1: DIAGNOSTIC COMPLETED (NO AIR DISPLAY) ════════════════ */}
          <AnimatePresence mode="wait">
            {dashboardStage === 1 && (
              <motion.div
                key="stage1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Diagnostics Outcomes & Missions */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Welcome diagnostic summary */}
                    <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0F1D19] to-[#060A08] p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-white/[0.06]">
                        <div className="space-y-1">
                          <h2 className="text-xl font-black text-white flex items-center gap-2">
                            📍 Starting Point Identified
                          </h2>
                          <p className="text-xs text-white/60">
                            We've created an initial study plan. Your real roadmap will become more accurate after your first diagnostic test.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Learning About You */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/70 uppercase font-black tracking-wider flex items-center gap-1.5">
                              🤖 Learning About You
                            </span>
                            <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-black">
                              CONFIDENCE: 22%
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-white/40">
                              <span>Data Collected</span>
                              <span className="font-extrabold text-white">18%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: '18%' }} />
                            </div>
                          </div>

                          <div className="space-y-1 text-[10px] text-white/50 border-t border-white/5 pt-3">
                            <div className="flex justify-between text-left">
                              <span>Confidence Level:</span>
                              <span className="text-red-400 font-extrabold">Low (Questionnaire Only)</span>
                            </div>
                            <div className="flex justify-between text-left mt-1">
                              <span>Next Step:</span>
                              <span className="text-white font-extrabold">Diagnostic Test #1 (20 mins)</span>
                            </div>
                          </div>
                        </div>

                        {/* Self-Assessment Validation Box */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                          <span className="text-xs text-white/70 uppercase font-black tracking-wider">
                            Initial Self Assessment
                          </span>
                          <div className="space-y-2 pt-1 text-left">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/60">Chemistry</span>
                              <span className="text-emerald-400 font-bold">Appears Strong (Low Confidence)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/60">Physics</span>
                              <span className="text-amber-400 font-bold">Moderate (Low Confidence)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/60">Mathematics</span>
                              <span className="text-red-400 font-bold">Needs Validation (Low Confidence)</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-white/35 italic border-t border-white/5 pt-2 text-center">
                            We'll validate this assessment through mock tests and practice sets.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Today's schedule mission */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-6 space-y-5">
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">🎯 Today's Mission</h3>
                          <p className="text-xs text-white/40">Initial Day 1 syllabus sequence based on strengths.</p>
                        </div>
                        <span className="text-[10px] text-accent font-bold uppercase tracking-wider bg-accent/15 border border-accent/20 px-2 py-0.5 rounded-full">
                          Est. Time: 2h 35m
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex justify-between items-center text-xs">
                          <span>1. Mathematics: <strong className="text-white">Functions Introduction</strong> (Basic Level)</span>
                          <span className="text-white/40">45m</span>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 justify-between flex items-center text-xs">
                          <span>2. Mathematics: <strong className="text-white">Basic Algebra &amp; Graphs</strong></span>
                          <span className="text-white/40">30m</span>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 justify-between flex items-center text-xs">
                          <span>3. Physics: <strong className="text-white">Motion in 1D Velocity</strong></span>
                          <span className="text-white/40">45m</span>
                        </div>
                      </div>

                      <Button onClick={() => setDashboardStage(2)} className="w-full bg-accent text-primary hover:bg-accent/90 font-bold py-3.5 rounded-xl shadow-lg mt-3 flex items-center justify-center gap-2">
                        ▶ Start Mission
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Timeline */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mission Milestones</h3>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5">✓</span>
                          <div>
                            <p className="text-xs font-bold text-white">Roadmap Initialization</p>
                            <p className="text-[10px] text-white/40">Completed star questionnaire</p>
                          </div>
                        </div>
                        <div className="flex gap-3 animate-pulse">
                          <span className="w-5 h-5 rounded-full bg-accent text-primary flex items-center justify-center text-xs font-black shrink-0 mt-0.5">→</span>
                          <div>
                            <p className="text-xs font-bold text-white">Diagnostic Test #1</p>
                            <p className="text-[10px] text-amber-500 font-bold">Unlocking initial diagnostic score</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-white/30 text-left">
                          <span className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white/50">Rank Projection</p>
                            <p className="text-[9px] uppercase font-black text-amber-500/80">Available after:</p>
                            <ul className="text-[10px] text-white/40 space-y-0.5 list-disc list-inside">
                              <li>3 Study Sessions (0/3 done)</li>
                              <li>1 Diagnostic Test (0/1 done)</li>
                              <li>2 Practice Sets (0/2 done)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════ STAGE 2: MISSION MOMENTUM (DAY 3: ACCUMULATING DATA, NO AIR) ════════════════ */}
          <AnimatePresence mode="wait">
            {dashboardStage === 2 && (
              <motion.div
                key="stage2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Momentum & Daily Targets */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Welcome completion banner */}
                    <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0F1E19] to-[#060D0B] p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-white/[0.06]">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Engagement Status</span>
                          <h2 className="text-xl font-extrabold text-white mt-1.5">Subject Analysis Underway</h2>
                          <p className="text-xs text-white/40">We are gathering initial performance data to validate your profile. 5 sessions completed.</p>
                        </div>
                        <span className="text-3xl">📊</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Learning about you progress */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/70 uppercase font-black tracking-wider flex items-center gap-1.5">
                              🤖 Learning About You
                            </span>
                            <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-black">
                              CONFIDENCE: 67%
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-white/40">
                              <span>Data Collected</span>
                              <span className="font-extrabold text-white">45%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: '45%' }} />
                            </div>
                          </div>

                          <div className="space-y-1 text-[10px] text-white/50 border-t border-white/5 pt-3">
                            <div className="flex justify-between text-left">
                              <span>Based On:</span>
                              <span className="text-white font-bold text-right">
                                • 4 Practice Sets<br />
                                • 2 Mock Tests<br />
                                • 8 Study Sessions
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Subject Analysis (67% confidence) */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                          <span className="text-xs text-white/70 uppercase font-black tracking-wider">
                            Subject Analysis
                          </span>
                          <div className="space-y-2 pt-1 text-left">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/60">Chemistry</span>
                              <span className="text-emerald-400 font-bold">Strong (68% accuracy)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/60">Physics</span>
                              <span className="text-amber-400 font-bold">Moderate (54% accuracy)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/60">Mathematics</span>
                              <span className="text-red-400 font-bold">Needs Focus (38% accuracy)</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-white/35 italic border-t border-white/5 pt-2 text-center">
                            Based on your test answers. Validation index is rising.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Today's dynamic mission tracker */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">🎯 Today's Mission</h3>
                        <span className="text-xs text-accent font-bold bg-accent/10 border border-accent/20 rounded-lg px-2.5 py-1">
                          {tasks.filter(t => t.done).length}/{tasks.length} Completed
                        </span>
                      </div>

                      <div className="space-y-3">
                        {tasks.map(item => (
                          <div 
                            key={item.id}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                              item.done 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-white/60' 
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white hover:border-white/10'
                            }`}
                          >
                            <div className="pt-0.5">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                item.done 
                                ? 'bg-emerald-500 border-emerald-400 text-white' 
                                : 'border-white/20 hover:border-accent'
                              }`}>
                                {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex-1 space-y-1">
                              <p className={`text-sm font-semibold ${item.done ? 'line-through text-white/40' : ''}`}>{item.text}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  item.type === 'revision' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                }`}>
                                  {item.type}
                                </span>
                                <span className="text-[10px] text-white/30 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {item.duration}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs text-white/30 uppercase font-black tracking-wider bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                                +{item.rankImpact} Ranks Expected
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Momentum score gauge */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4 text-center">
                      <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Active Metric</span>
                      <h3 className="text-md font-bold text-white">Mission Momentum</h3>
                      
                      {/* Premium dial widget */}
                      <div className="h-40 flex items-center justify-center relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="50" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                          <motion.circle 
                            cx="64" 
                            cy="64" 
                            r="50" 
                            stroke="hsl(var(--accent))" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={314}
                            animate={{ strokeDashoffset: 314 - (314 * currentMomentum) / 100 }}
                            transition={{ duration: 0.5 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-white">{currentMomentum}</span>
                          <span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Score</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed max-w-xs mx-auto">
                        Your study consistency, completed DPPs, and video watched ratios generate a comprehensive 100-point Momentum index.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════ STAGE 3: FIRST AIR PROJECTION (DAY 7: LOW CONFIDENCE PREDICTOR) ════════════════ */}
          <AnimatePresence mode="wait">
            {dashboardStage === 3 && (
              <motion.div
                key="stage3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Initial low-confidence AIR Command Center & checklist */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* First Projected AIR banner */}
                    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#1C160C] to-[#0A0805] p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-white/[0.06]">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">First AIR Predictor Unlocked</span>
                          <h2 className="text-xl font-extrabold text-white mt-1.5">Projected Rank Outcome</h2>
                          <p className="text-xs text-white/40 mt-0.5">Mock results registered. Predictions are initial and will stabilize.</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded">
                            Low Confidence ({currentConfidence}%)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-4 text-left">
                          <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">Initial AIR</span>
                          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 mt-1">
                            AIR {currentProjectedAIR.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-4 text-left">
                          <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">Average Mock Score</span>
                          <div className="text-2xl font-black text-white mt-1">112 / 300</div>
                        </div>
                        <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-4 text-left">
                          <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">Mock Accuracy</span>
                          <div className="text-2xl font-black text-white mt-1">63%</div>
                        </div>
                      </div>

                      {/* Evidence Log Panel */}
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-amber-500">
                          <span>Evidence Log (Stability Indicator)</span>
                          <span>Confidence: {currentConfidence}%</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] text-white/50 pt-1 text-left">
                          <div className="flex flex-col">
                            <span className="text-white font-bold">1. Mock Tests</span>
                            <span>• 2 Tests attempted</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold">2. Study Sessions</span>
                            <span>• 8 Study sessions completed</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold">3. Practice Sets</span>
                            <span>• 4 Practice sets done</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-white/30 pt-1.5 border-t border-white/5 italic text-center">
                          Projections will stabilize and confidence will climb to ~89% after you complete 15+ more mock tests and 80+ study hours.
                        </p>
                      </div>
                    </div>

                    {/* Today's mission with Simulator */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-6 space-y-5">
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">🎯 Today's Mission</h3>
                          <p className="text-xs text-white/40">Complete tasks to simulate expected projection improvements.</p>
                        </div>
                        <span className="text-xs text-accent font-bold bg-accent/10 border border-accent/20 rounded-lg px-2.5 py-1">
                          {tasks.filter(t => t.done).length}/{tasks.length} Done
                        </span>
                      </div>

                      <div className="space-y-3">
                        {tasks.map(item => (
                          <div 
                            key={item.id}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                              item.done 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-white/60' 
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white hover:border-white/10'
                            }`}
                          >
                            <div className="pt-0.5">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                item.done 
                                ? 'bg-emerald-500 border-emerald-400 text-white' 
                                : 'border-white/20 hover:border-accent'
                              }`}>
                                {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex-1 space-y-1">
                              <p className={`text-sm font-semibold ${item.done ? 'line-through text-white/40' : ''}`}>{item.text}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  item.type === 'revision' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-amber-500/90 flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                +{item.rankImpact} AIR Gain
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Timeline progress */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Syllabus Insights</h3>
                      <div className="space-y-4 text-xs">
                        <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                          <span className="font-bold text-white block">Next Milestones:</span>
                          <span className="text-white/40 mt-1 block">Unlock high confidence projections on Day 30 by attempting 10 more topic tests.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════ STAGE 4: FULL PERSONALIZED MISSION CONTROL (DAY 30) ════════════════ */}
          <AnimatePresence mode="wait">
            {dashboardStage === 4 && (
              <motion.div
                key="stage4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* AIR Command Center (Hero Zone) */}
                <div
                  className="rounded-3xl border border-white/[0.06] overflow-hidden relative p-6 sm:p-8 lg:p-10"
                  style={{
                    background: 'linear-gradient(135deg, #0A111C 0%, #06080E 100%)',
                    boxShadow: '0 10px 30px -15px rgba(0,0,0,0.7)'
                  }}
                >
                  {/* Ambient radial glow */}
                  <div 
                    className="absolute right-0 top-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, hsl(32, 90%, 55%) 0%, transparent 70%)' }}
                  />
                  
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/[0.04] border border-white/[0.08] text-white/95 shadow-sm">
                          {examConfig.emoji} {batchCohortName}
                        </span>
                        <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/20">
                          {classTagLabel} • {currentLevelStr}
                        </span>
                      </div>
                      
                      {/* Countdown clocks */}
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                          🗓 JEE Main 2028: <span className="font-extrabold text-white">432 Days Left</span>
                        </span>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1.5">✓ You are ahead of schedule</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        🚀 JEE Mission Control
                      </h1>
                      <p className="text-sm text-white/50 font-medium">
                        {examLabel} {currentYear} | {batch?.batchName || 'Foundation Batch'}
                      </p>
                    </div>

                    {/* Outcome Predictor cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-visible group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40 uppercase font-black tracking-wider">Current Projection</span>
                          <button 
                            onClick={() => setShowExplainer(!showExplainer)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Why this rank? Click for diagnostics."
                          >
                            <Info className="w-4.5 h-4.5" />
                          </button>
                        </div>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 mt-2">
                          AIR {currentProjectedAIR.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-white/35 mt-1 flex items-center gap-1.5">
                          Yesterday: <span className="text-white/50 font-bold">{yesterdayAIR.toLocaleString()}</span>
                          <span className="text-emerald-400 font-bold flex items-center">
                            <TrendingDown className="w-3 h-3 mr-0.5" /> +{(yesterdayAIR - currentProjectedAIR).toLocaleString()} ranks
                          </span>
                        </div>

                        {/* Explainable Rank Diagnostics Card */}
                        <AnimatePresence>
                          {showExplainer && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute left-0 top-full mt-2 w-72 bg-[#0F172A] border border-white/10 rounded-2xl p-4 shadow-2xl z-30 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase text-amber-400">Why {currentProjectedAIR.toLocaleString()}?</h4>
                                <button onClick={() => setShowExplainer(false)} className="text-white/40 hover:text-white">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-[10px] text-white/60 leading-relaxed">
                                Calculated in real-time from active indicators. Strengths in Algebra are offset by lower accuracy in Electromagnetism.
                              </p>
                              <div className="space-y-1.5 border-t border-white/5 pt-2 text-[10px] text-left">
                                <div className="flex justify-between">
                                  <span className="text-white/40">Evidence Base:</span>
                                  <span className="text-emerald-400 font-bold">High Stability (84% Confidence)</span>
                                </div>
                                <div className="space-y-1 text-white/60 mt-1 pl-1">
                                  <div>• 17 Mock Tests Attempted</div>
                                  <div>• 84 Total Study Hours</div>
                                  <div>• 3,120 Questions Solved</div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-xs text-white/40 uppercase font-black tracking-wider">Target AIR Goal</span>
                        <div className="text-3xl font-black text-white mt-2">
                          &lt; {targetAIR.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-white/35 mt-1">
                          Committed target
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                        <span className="text-xs text-white/40 uppercase font-black tracking-wider">Gap Remaining</span>
                        <div className="text-3xl font-black text-red-400 mt-2">
                          {currentGap.toLocaleString()} Ranks
                        </div>
                        <div className="text-[10px] text-white/35 mt-1">
                          To reach target zone
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/40 uppercase font-black tracking-wider">Confidence</span>
                          <span className="text-[10px] text-amber-500 font-bold">Momentum: 91/100</span>
                        </div>
                        <div className="text-3xl font-black text-white mt-2">
                          {currentConfidence}%
                        </div>
                        <div className="text-[10px] text-white/35 mt-1">
                          Updated 12 mins ago
                        </div>
                      </div>
                    </div>

                    {/* Battle Mode progress bar */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-2 mt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-white/70">⚔ Battle Mode: You vs Target AIR</span>
                        <span className="font-black text-amber-400">{currentGap.toLocaleString()} Ranks to Target</span>
                      </div>
                      <div className="h-3 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04] relative">
                        <motion.div 
                          layout
                          className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"
                          style={{ width: `${Math.max(10, Math.min(100, (1 - currentGap / baseProjectedAIR) * 100))}%` }}
                        />
                        <div className="absolute inset-y-0 right-[20%] w-0.5 bg-white/30" />
                      </div>
                    </div>

                    {/* Dynamic Action Callout Banner */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                        <p className="text-xs text-white/80 font-medium">
                          Finish today's mission to advance your projection: 
                          <span className="text-white font-extrabold ml-1">AIR {currentProjectedAIR.toLocaleString()}</span>
                          <span className="text-amber-400 font-extrabold mx-1.5">➔</span>
                          <span className="text-emerald-400 font-extrabold">AIR {nextTargetAIR.toLocaleString()}</span>
                          <span className="text-emerald-400 font-bold ml-1.5">(+{todayPotentialGain} ranks!)</span>
                        </p>
                      </div>
                      {todayPotentialGain > 0 && (
                        <Button 
                          onClick={() => navigate('/subchapter/math-1-1')}
                          size="sm"
                          className="bg-accent text-primary hover:bg-accent/90 rounded-lg text-xs font-bold font-display shadow-lg shrink-0 w-full sm:w-auto"
                        >
                          Complete Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main page layout splits */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column content */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Continue learning */}
                    <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1524] to-[#060A12] p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 rounded-full">Next Recommended Action</span>
                          <h3 className="text-lg font-extrabold text-white mt-1.5">Continue Learning: Functions</h3>
                          <p className="text-xs text-white/50 mt-0.5">
                            Syllabus Progress: <span className="text-white font-bold">68%</span> | Remaining: <span className="text-white font-bold">32 mins</span>
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/subchapter/math-1-1')} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-5">▶ Continue Learning</Button>
                    </div>

                    {/* Checklist */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-6 lg:p-8 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">🎯 Today's Mission</h3>
                        <span className="text-xs text-accent font-bold bg-accent/10 border border-accent/20 rounded-lg px-2.5 py-1">
                          {tasks.filter(t => t.done).length}/{tasks.length} Completed
                        </span>
                      </div>

                      <div className="space-y-3">
                        {tasks.map(item => (
                          <div 
                            key={item.id}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                              item.done 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-white/60' 
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white hover:border-white/10'
                            }`}
                          >
                            <div className="pt-0.5">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                item.done 
                                ? 'bg-emerald-500 border-emerald-400 text-white' 
                                : 'border-white/20 hover:border-accent'
                              }`}>
                                {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex-1 space-y-1">
                              <p className={`text-sm font-semibold ${item.done ? 'line-through text-white/40' : ''}`}>{item.text}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  item.type === 'revision' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {item.done ? (
                                <span className="text-xs font-bold text-emerald-400">✓ +{item.rankImpact} ranks gained</span>
                              ) : (
                                <span className="text-xs font-bold text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                  +{item.rankImpact} AIR Gain
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Smart Revision */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-6 space-y-6">
                      <h3 className="text-md font-bold text-white flex items-center gap-2">📚 Smart Revision Center</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#130E0F] border border-red-500/20 rounded-2xl p-4 space-y-4">
                          <span className="text-[9px] font-black uppercase text-red-400 bg-red-400/10 px-2 py-0.5 rounded">🔥 Weakest Topic</span>
                          <h4 className="text-md font-extrabold text-white">Electrostatics</h4>
                          <div className="grid grid-cols-3 gap-1 pt-2">
                            <Button onClick={() => navigate('/subchapter/phy-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">Notes</Button>
                            <Button onClick={() => navigate('/subchapter/phy-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">Formulas</Button>
                            <Button onClick={() => navigate('/subchapter/phy-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">PYQs</Button>
                          </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-4">
                          <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">🎯 High Weightage</span>
                          <h4 className="text-md font-extrabold text-white">Functions</h4>
                          <div className="grid grid-cols-3 gap-1 pt-2">
                            <Button onClick={() => navigate('/subchapter/math-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">Notes</Button>
                            <Button onClick={() => navigate('/subchapter/math-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">Formulas</Button>
                            <Button onClick={() => navigate('/subchapter/math-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">PYQs</Button>
                          </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-4">
                          <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">⚡ Decaying Concept</span>
                          <h4 className="text-md font-extrabold text-white">Chemical Bonding</h4>
                          <div className="grid grid-cols-3 gap-1 pt-2">
                            <Button onClick={() => navigate('/subchapter/chem-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">Notes</Button>
                            <Button onClick={() => navigate('/subchapter/chem-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">Formulas</Button>
                            <Button onClick={() => navigate('/subchapter/chem-1-1')} variant="outline" size="sm" className="text-[10px] px-0 h-8 rounded-lg border-white/10 text-white/80">PYQs</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column content */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Weekly Wins */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">🏆 Weekly Wins</h3>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                          <span className="text-white/40 block">Chapters</span>
                          <span className="text-lg font-black text-white mt-1 block">+4</span>
                        </div>
                        <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                          <span className="text-white/40 block">AIR Improved</span>
                          <span className="text-lg font-black text-emerald-400 mt-1 block">-{totalRankGain > 0 ? totalRankGain.toLocaleString() : '2,100'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expected outcomes */}
                    <div className="rounded-3xl border border-white/[0.06] bg-[#0F1E19] p-5 space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">🎯 If Exam Was Today</h3>
                      <div className="space-y-3.5 bg-black/40 border border-white/[0.05] rounded-2xl p-4 text-xs">
                        <div className="flex justify-between border-b border-white/[0.05] pb-2">
                          <span>Percentile</span>
                          <span className="font-extrabold text-emerald-400">96.4 – 97.1</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.05] pb-2">
                          <span>Projected AIR</span>
                          <span className="font-extrabold text-emerald-400">{currentProjectedAIR.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Rank line graph */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                      <h3 className="text-sm font-bold text-white">📊 Weekly Rank Movement</h3>
                      <div className="h-44 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                            <YAxis reversed={true} domain={[15000, 60000]} stroke="rgba(255,255,255,0.3)" fontSize={9} />
                            <Tooltip />
                            <Area type="monotone" dataKey="rank" name="Projected AIR" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#colorRank)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Study Heatmap */}
                    <div className="rounded-3xl border border-white/[0.06] bg-card p-5 space-y-4">
                      <h3 className="text-sm font-bold text-white">📅 Consistency Index</h3>
                      <div className="grid grid-cols-7 gap-1.5 p-1 bg-black/20 border border-white/5 rounded-xl">
                        {heatmapData.map((d) => (
                          <div 
                            key={d.day}
                            className={cn(
                              "w-full aspect-square rounded-md transition-all cursor-pointer bg-white/[0.04]",
                              d.hours > 0 && d.hours <= 4.5 ? "bg-accent/25" :
                              d.hours > 4.5 && d.hours <= 6.5 ? "bg-accent/50" :
                              d.hours > 6.5 && d.hours <= 7.5 ? "bg-accent/75" :
                              d.hours > 7.5 ? "bg-accent" : ""
                            )}
                            title={`June ${d.day}: ${d.hours} Hours`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Subject Detail Progression */}
                    <div className="space-y-3.5">
                      {[
                        { subject: 'Physics', progress: 42, color: 'from-blue-500 to-cyan-400 bg-blue-500/5 border-blue-500/10', colorText: 'text-blue-400', weakest: 'Electrostatics', potential: '+230 Ranks' },
                        { subject: 'Chemistry', progress: 38, color: 'from-emerald-500 to-teal-400 bg-emerald-500/5 border-emerald-500/10', colorText: 'text-emerald-400', weakest: 'Chemical Bonding', potential: '+120 Ranks' },
                        { subject: 'Mathematics', progress: 31, color: 'from-violet-500 to-purple-400 bg-violet-500/5 border-violet-500/10', colorText: 'text-violet-400', weakest: 'Functions', potential: '+190 Ranks' }
                      ].map(subj => (
                        <div key={subj.subject} className={`rounded-2xl border ${subj.color} p-4 space-y-3`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white">{subj.subject}</span>
                            <span className={subj.colorText}>{subj.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${subj.progress}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-white/40">
                            <span>Weakest: <strong className="text-white/80">{subj.weakest}</strong></span>
                            <span className="text-emerald-400 font-bold">⚡ {subj.potential}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🧠 FLOATING HUMANIZED AI MENTOR (JEETU BHAIYA) */}
          <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
              {isMentorOpen ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-80 sm:w-96 bg-[#0E1524] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <span className="text-xl">🧠</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-amber-500">Jeetu Bhaiya AI</h4>
                        <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online Guidance
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsMentorOpen(false);
                        setActiveReply(null);
                      }} 
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                      "{activeReply ? activeReply : mentorSpeech}"
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-white/35 font-bold mb-1">Select doubt to ask:</p>
                    {mentorReplies.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveReply(r.a)}
                        className="w-full text-left bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-amber-500/30 transition-all rounded-xl p-3 text-xs font-bold text-white/80 hover:text-white flex items-center justify-between gap-2"
                      >
                        <span>{r.q}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    {activeReply && (
                      <Button 
                        onClick={() => setActiveReply(null)}
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-white/50 h-8"
                      >
                        Back to main
                      </Button>
                    )}
                    <Button 
                      onClick={() => navigate('/ask-prepentrance')}
                      size="sm"
                      className="bg-amber-500 text-primary hover:bg-amber-400 rounded-lg text-[10px] font-bold h-8"
                    >
                      Ask custom question
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.button 
                  onClick={() => setIsMentorOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-amber-500 text-primary flex items-center justify-center shadow-xl shadow-amber-500/20 border-2 border-amber-400 group"
                >
                  <span className="text-2xl">🧠</span>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow">
                    1
                  </span>
                  <span className="absolute right-full mr-3 bg-[#0F172A] border border-white/10 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                    Jeetu Bhaiya is online
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
