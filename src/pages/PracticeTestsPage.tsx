import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import {
  ArrowRight, CheckCircle2, Target, BarChart2, Zap, Clock, Shield, Sparkles,
  BookOpen, Brain, TrendingUp, AlertCircle, ChevronRight, Award, Trophy, Play
} from 'lucide-react';

export const PracticeTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jee' | 'neet' | 'cuet'>('jee');

  useEffect(() => {
    document.title = "Practice Tests | PrepEntrance — Prepare. Perform. Succeed.";
    window.scrollTo({ top: 0 });
  }, []);

  // Mock Question Database for Interactive Exam Mockup
  const mockQuestions = {
    jee: {
      subject: "Mathematics",
      chapter: "Quadratic Equations",
      question: "If the roots of the equation x² - px + q = 0 differ by unity, then which of the following relations holds true?",
      options: [
        "p² = 4q + 1",
        "p² = 4q - 1",
        "q² = 4p + 1",
        "q² = 4p - 1"
      ],
      correctAnswer: 0,
      timeElapsed: "01:24:45",
      totalQuestions: 90
    },
    neet: {
      subject: "Biology",
      chapter: "Genetics & Evolution",
      question: "Which of the following nitrogenous bases is unique to RNA and replaces thymine found in DNA molecules?",
      options: [
        "Adenine",
        "Guanine",
        "Cytosine",
        "Uracil"
      ],
      correctAnswer: 3,
      timeElapsed: "02:10:12",
      totalQuestions: 200
    },
    cuet: {
      subject: "General English",
      chapter: "Vocabulary & Comprehension",
      question: "Identify the word that is nearest in meaning to the term 'EPHEMERAL' as used in formal literature.",
      options: [
        "Permanent and long-lasting",
        "Transient or short-lived",
        "Beautiful and charming",
        "Dangerous and volatile"
      ],
      correctAnswer: 1,
      timeElapsed: "00:32:18",
      totalQuestions: 50
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans">
      <LandingNav />

      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 border-b border-slate-100 pt-16 pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
            AI-POWERED TESTING ENGINE
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight max-w-4xl mx-auto tracking-tight">
            Practice Like the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Real Exam
            </span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Get the ultimate exam-day advantage. Experience real JEE, NEET, and CUET test environments combined with instant AI diagnostic feedback.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-98"
            >
              Start Free Practice Test
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. TEST TYPES GRID SECTION */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Designed for Complete Mastery
            </h2>
            <p className="text-slate-500 font-medium">
              We break preparation down into granular stages to ensure you build absolute concept confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Chapter Tests",
                description: "Test your learning immediately after completing any chapter. Pinpoint micro-level misunderstandings.",
                icon: <BookOpen className="w-6 h-6 text-blue-600" />,
                bg: "bg-blue-50/50 border-blue-100"
              },
              {
                title: "Topic Tests",
                description: "Targeted sub-chapter question sets for concepts that require deep reinforcing or repetitive practice.",
                icon: <Target className="w-6 h-6 text-indigo-600" />,
                bg: "bg-indigo-50/50 border-indigo-100"
              },
              {
                title: "Full-Length Mocks",
                description: "Simulate exact exam duration, interface, marking scheme, and pressure. Perfect your time management.",
                icon: <Trophy className="w-6 h-6 text-violet-600" />,
                bg: "bg-violet-50/50 border-violet-100"
              },
              {
                title: "Previous Year Papers",
                description: "Practice actual past papers from JEE, NEET, and CUET with detailed AI-written step-by-step explanations.",
                icon: <Award className="w-6 h-6 text-emerald-600" />,
                bg: "bg-emerald-50/50 border-emerald-100"
              }
            ].map((test, index) => (
              <div key={index} className={`p-8 border rounded-2xl ${test.bg} space-y-4 hover:translate-y-[-4px] transition-all duration-300`}>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-xs">
                  {test.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{test.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE MOCK TEST PLAYGROUND */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Test Interfaces Built For Accuracy
            </h2>
            <p className="text-slate-500 font-medium">
              Toggle between exams below to inspect our hyper-realistic test environment. No unfamiliar screens on exam day.
            </p>
          </div>

          {/* Exam switcher tabs */}
          <div className="flex justify-center gap-2 p-1 bg-slate-200/60 rounded-xl max-w-md mx-auto mb-10 border border-slate-200">
            {(['jee', 'neet', 'cuet'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'jee' ? 'JEE Main' : tab === 'neet' ? 'NEET UG' : 'CUET (UG)'}
              </button>
            ))}
          </div>

          {/* Screen mockup structure */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto text-slate-200">
            {/* Header bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
                <span className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
                <span className="text-xs text-slate-400 font-bold ml-2 uppercase tracking-widest">
                  PrepEntrance Test Workspace v2
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="text-red-400">{mockQuestions[activeTab].timeElapsed}</span>
              </div>
            </div>

            {/* Content workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[400px]">
              {/* Question Screen */}
              <div className="lg:col-span-3 p-8 border-r border-slate-800 space-y-6 bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <div>
                    <span className="text-[11px] font-black uppercase text-blue-500 tracking-wider">
                      {mockQuestions[activeTab].subject}
                    </span>
                    <h4 className="text-sm text-slate-400 font-bold mt-0.5">
                      {mockQuestions[activeTab].chapter}
                    </h4>
                  </div>
                  <span className="text-xs bg-slate-900 px-2.5 py-1 rounded-md text-slate-400 font-bold">
                    Question 04 of {mockQuestions[activeTab].totalQuestions}
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-[15px] font-medium leading-relaxed text-slate-100">
                    {mockQuestions[activeTab].question}
                  </p>
                </div>

                {/* Option selection */}
                <div className="grid grid-cols-1 gap-3.5 pt-4">
                  {mockQuestions[activeTab].options.map((opt, i) => (
                    <button
                      key={i}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                        i === mockQuestions[activeTab].correctAnswer
                          ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                        i === mockQuestions[activeTab].correctAnswer
                          ? 'border-blue-400 text-blue-400 bg-blue-500/20'
                          : 'border-slate-700 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Side Panel */}
              <div className="p-6 bg-slate-900/30 flex flex-col justify-between">
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Question Palette
                  </h5>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 20 }).map((_, i) => {
                      let statusBg = 'bg-slate-800 text-slate-500 border border-slate-700/50';
                      if (i === 3) statusBg = 'bg-blue-600 text-white font-bold'; // Selected
                      else if (i < 3) statusBg = 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'; // Answered
                      else if (i === 4) statusBg = 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-400'; // Marked for review

                      return (
                        <div
                          key={i}
                          className={`h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${statusBg}`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Answered:</span>
                    <span className="text-emerald-400">3</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Not Answered:</span>
                    <span className="text-slate-400">16</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Marked for Review:</span>
                    <span className="text-yellow-400">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-400">
              <div className="flex gap-2.5">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">Mark for Review</button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">Clear Response</button>
              </div>
              <div className="flex gap-2.5">
                <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">Previous</button>
                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Save & Next</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE & DIAGNOSTIC ANALYTICS PREVIEW */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <BarChart2 className="w-3.5 h-3.5" />
                Intelligent Diagnostic Analytics
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Know Exactly What to Focus on Next
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Traditional mocks just give you a score. PrepEntrance gives you a diagnostic blueprint. Our backend maps every question to its exact syllabus sub-topic, analyzing your speed, error patterns, and conceptual gaps.
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: "Weak Topic Detection", desc: "Instantly flags topics where your accuracy falls below 60%." },
                  { title: "Accuracy Tracking", desc: "Deep metrics segmenting performance by easy, medium, and difficult thresholds." },
                  { title: "Time Management Analysis", desc: "Flags questions where you spent 2x the average student's time." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard Mock Visual */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 relative z-10">
                <div>
                  <h4 className="font-bold text-slate-900">Personal Insights Dashboard</h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Recent Mock Test Analysis</p>
                </div>
                <span className="text-[10px] bg-slate-200 px-2 py-1 rounded-md text-slate-600 font-black uppercase">JEE Target 2027</span>
              </div>

              {/* Progress and indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-center space-y-2">
                  <span className="text-xs text-slate-400 font-extrabold uppercase">Readiness</span>
                  <div className="text-2xl font-black text-slate-900 flex items-center justify-center gap-1">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    74%
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold block">+3% from last week</span>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-center space-y-2">
                  <span className="text-xs text-slate-400 font-extrabold uppercase">Accuracy</span>
                  <div className="text-2xl font-black text-slate-900">82.4%</div>
                  <span className="text-[9px] text-slate-500 font-bold block">Target threshold 85%</span>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-center space-y-2">
                  <span className="text-xs text-slate-400 font-extrabold uppercase">Avg. Time / Q</span>
                  <div className="text-2xl font-black text-slate-900">48s</div>
                  <span className="text-[9px] text-emerald-600 font-bold block">12s faster than average</span>
                </div>
              </div>

              {/* Diagnostic Gaps Checklist */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5">
                <h5 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">AI Detection Gaps</h5>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-800">Permutations & Combinations (Math)</span>
                    <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-[10px]">Critical Gaps (42% Acc)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[42%]" />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-bold pt-1.5">
                    <span className="text-slate-800">Newton's Laws of Motion (Physics)</span>
                    <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-[10px]">Moderate Gaps (68% Acc)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full w-[68%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI INSIGHTS DIALOGUE PREVIEW */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual Chat Mockup on the Left */}
            <div className="space-y-4 bg-slate-950 rounded-2xl border border-slate-800 p-6 md:p-8 text-slate-300 shadow-xl max-w-lg mx-auto w-full">
              <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">AI Study Assistant</h4>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    Online &amp; Analyzing
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 text-xs font-medium">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-300">
                  👋 \"Based on your last Mock Test, your overall score is 218/300. You displayed high mastery in Organic Chemistry, but got stuck on 4 questions involving <b>Thermodynamics</b>. Would you like a personalized revision worksheet for this?\"
                </div>

                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-xl p-3 max-w-[80%]">
                    Yes please, include 10 medium and 5 hard questions.
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-300 space-y-2">
                  <p>🚀 \"Worksheet generated! Here is your custom study recommendation:\"</p>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-200">Thermodynamics Custom Practice</span>
                    <button className="text-blue-400 hover:underline flex items-center gap-0.5">Start <Play className="w-2.5 h-2.5 fill-blue-400" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Content on the Right */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                Personalized AI Insights
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Personalized Recommendations After Every Single Test
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                You never have to guess what syllabus section to study next. Our AI analysis maps your answers against our structured repository, building automated revisions, mock adjustments, and custom exercises just for you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-900">Custom Worksheets</h4>
                  <p className="text-slate-500 text-xs font-medium">Auto-generated practice sets focusing purely on your gaps.</p>
                </div>
                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-900">Adaptive Revisions</h4>
                  <p className="text-slate-500 text-xs font-medium">Re-attempts of questions you solved incorrectly or slowly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA CONVERSION CARD */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 md:p-14 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Unlock Complete Exam Readiness Today
              </h2>
              <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                Join thousands of students building consistency, mastering tough topics, and cracking their exams with PrepEntrance's adaptive testing suite.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-all shadow-lg active:scale-98"
                >
                  Start Free Practice Test
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-4 bg-slate-900/60 border border-slate-700 hover:border-slate-500 font-bold rounded-xl transition-all active:scale-98"
                >
                  View Pricing Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="brand-logo-container rounded-xl w-12 h-12 bg-white flex items-center justify-center">
                  <img 
                    src="/prepentrance-logo.png" 
                    alt="PrepEntrance Logo" 
                    className="brand-logo-img" 
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-[20px] text-white tracking-tight">PrepEntrance</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-[0.18em] uppercase mt-0.5">Prepare. Perform. Succeed.</span>
                </div>
              </div>
              <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-xs">
                AI-first personalized practice workspace built to help students crack JEE, NEET and CUET.
              </p>
            </div>

            {/* Exams */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Exams</h4>
              <ul className="space-y-2.5">
                {['JEE', 'NEET', 'CUET'].map((e) => (
                  <li key={e}>
                    <button onClick={() => navigate(`/${e.toLowerCase()}`)} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">{e}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('/blog')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Blog</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Study Material</button>
                </li>
                <li>
                  <button onClick={() => navigate('/practice-tests')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Mock Tests</button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Company</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('/blog')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">About</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Contact</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Careers</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-semibold text-slate-500">
            <span>© {new Date().getFullYear()} PrepEntrance. All rights reserved.</span>
            <div className="flex gap-5">
              <button onClick={() => navigate('/privacy')} className="hover:text-slate-300 transition-colors">Privacy Policy</button>
              <button onClick={() => navigate('/terms')} className="hover:text-slate-300 transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PracticeTestsPage;
