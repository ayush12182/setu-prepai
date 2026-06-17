import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import {
  Bot, LineChart, Brain, Clock, ChevronRight, Check, FileText, Users, Trophy,
  ChevronLeft, Settings, Plus, Building, Facebook, Instagram, Youtube, Twitter,
  Star, ArrowRight, TrendingUp, Calendar, Zap, CheckCircle2, BookOpen, HelpCircle,
  Target, MessageSquare, BarChart2, Layers, Sparkles, MapPin,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const testimonials = [
  {
    text: 'The AI mentor clears doubts in seconds and the mock tests are just like the real JEE exam!',
    name: 'Rohan Verma',
    exam: 'JEE Main 2024 Aspirant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80',
  },
  {
    text: 'PrepEntrance helped me stay consistent. The personalized plan is a game changer!',
    name: 'Priya Singh',
    exam: 'NEET 2024 Aspirant',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
  },
  {
    text: 'CUET preparation became so easy with topic tests and AI analysis. Highly recommended!',
    name: 'Aman Khan',
    exam: 'CUET 2024 Aspirant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80',
  },
];

const journeySteps = [
  { step: '01', title: 'Take Diagnostic Test', desc: 'Evaluate your current preparation level.', icon: <Clock className="w-5 h-5" /> },
  { step: '02', title: 'Get AI Analysis', desc: 'AI maps your strengths, weaknesses and gaps.', icon: <BarChart2 className="w-5 h-5" /> },
  { step: '03', title: 'Receive Personalized Plan', desc: 'Get a custom study plan tailored for you.', icon: <FileText className="w-5 h-5" /> },
  { step: '04', title: 'Practice Weak Chapters', desc: 'Focus on weak areas with adaptive practice.', icon: <Target className="w-5 h-5" /> },
  { step: '05', title: 'Improve Rank', desc: 'Track progress and achieve your dream rank.', icon: <Trophy className="w-5 h-5" /> },
];

const features = [
  { icon: <Bot className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600 border-blue-100', title: 'AI Mentor 24/7', desc: 'Instant doubt solving and concept explanation anytime.' },
  { icon: <LineChart className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', title: 'Smart Analytics', desc: 'Know exactly where you\'re losing marks with detailed performance insights.' },
  { icon: <FileText className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600 border-purple-100', title: 'Personalized Study Plan', desc: 'Daily targets and custom plans based on your strengths and weaknesses.' },
  { icon: <Users className="w-6 h-6" />, color: 'bg-amber-50 text-amber-600 border-amber-100', title: 'Mock Tests', desc: 'Exam-level JEE, NEET & CUET tests with real exam experience.' },
  { icon: <Target className="w-6 h-6" />, color: 'bg-rose-50 text-rose-600 border-rose-100', title: 'Rank Predictor', desc: 'Estimate your rank and track improvement before the real exam.' },
  { icon: <Brain className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', title: 'Adaptive Learning', desc: 'Questions become smarter as you improve, just like you.' },
];

const batches = [
  {
    name: 'AARAMBH 2028',
    label: 'Class 11 Students',
    labelBg: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-500',
    mountain: '/images/mountain_blue.png',
    accent: '#60a5fa',
    checkColor: '#60a5fa',
    price: '₹349',
    slug: 'aarambh-2028',
    features: ['AI Mentor Included', 'Mock Tests Included', 'Performance Tracking', 'Doubt Support 24/7'],
  },
  {
    name: 'AAROHAN 2027',
    label: 'Class 12 Students',
    labelBg: 'bg-purple-600',
    btnBg: 'bg-purple-600 hover:bg-purple-500',
    mountain: '/images/mountain_purple.png',
    accent: '#a855f7',
    checkColor: '#c084fc',
    price: '₹349',
    slug: 'aarohan-2027',
    features: ['AI Mentor Included', 'Mock Tests Included', 'Performance Tracking', 'Doubt Support 24/7'],
  },
  {
    name: 'SHIKHAR 2027',
    label: 'Droppers Batch',
    labelBg: 'bg-orange-500',
    btnBg: 'bg-orange-500 hover:bg-orange-400',
    mountain: '/images/mountain_orange.png',
    accent: '#fb923c',
    checkColor: '#fb923c',
    price: '₹349',
    slug: 'shikhar-2027',
    features: ['AI Mentor Included', 'Mock Tests Included', 'Performance Tracking', 'Doubt Support 24/7'],
  },
];

const socialProofStats = [
  { num: '10,000+', label: 'Practice Questions', icon: <FileText className="w-5 h-5" /> },
  { num: '500+', label: 'Chapter Tests', icon: <BookOpen className="w-5 h-5" /> },
  { num: '24×7', label: 'AI Mentor', icon: <Bot className="w-5 h-5" /> },
  { num: '3 Exams', label: 'JEE + NEET + CUET', icon: <Target className="w-5 h-5" /> },
  { num: 'Pan India', label: 'Students', icon: <MapPin className="w-5 h-5" /> },
];

/* ─────────────────────────────────────────────
   EXAM CARD ILLUSTRATIONS
───────────────────────────────────────────── */
const JEEIllustration = () => (
  <svg viewBox="0 0 160 120" fill="none" className="w-full h-full opacity-[0.07]">
    {/* Engineering structures */}
    <rect x="10" y="70" width="20" height="45" fill="#2563eb" />
    <rect x="15" y="55" width="10" height="20" fill="#2563eb" />
    <polygon points="20,40 5,60 35,60" fill="#2563eb" />
    <rect x="40" y="60" width="14" height="55" fill="#2563eb" />
    <rect x="42" y="45" width="10" height="18" fill="#2563eb" />
    <polygon points="47,30 37,50 57,50" fill="#2563eb" />
    <line x1="60" y1="80" x2="150" y2="80" stroke="#2563eb" strokeWidth="3" />
    <line x1="70" y1="80" x2="70" y2="55" stroke="#2563eb" strokeWidth="2" />
    <line x1="90" y1="80" x2="90" y2="40" stroke="#2563eb" strokeWidth="2" />
    <line x1="110" y1="80" x2="110" y2="55" stroke="#2563eb" strokeWidth="2" />
    <line x1="130" y1="80" x2="130" y2="65" stroke="#2563eb" strokeWidth="2" />
    <circle cx="120" cy="25" r="15" stroke="#2563eb" strokeWidth="2" />
    <line x1="120" y1="10" x2="120" y2="40" stroke="#2563eb" strokeWidth="1.5" />
    <line x1="105" y1="25" x2="135" y2="25" stroke="#2563eb" strokeWidth="1.5" />
    <path d="M130 100 Q140 90 150 100 Q140 110 130 100Z" fill="#2563eb" />
  </svg>
);

const NEETIllustration = () => (
  <svg viewBox="0 0 160 120" fill="none" className="w-full h-full opacity-[0.07]">
    {/* DNA helix */}
    <path d="M40 10 C50 25, 70 25, 80 40 C90 55, 110 55, 120 70 C110 85, 90 85, 80 100 C70 115, 50 115, 40 100" stroke="#059669" strokeWidth="2.5" fill="none" />
    <path d="M120 10 C110 25, 90 25, 80 40 C70 55, 50 55, 40 70 C50 85, 70 85, 80 100 C90 115, 110 115, 120 100" stroke="#059669" strokeWidth="2.5" fill="none" />
    <line x1="52" y1="24" x2="108" y2="20" stroke="#059669" strokeWidth="1.5" />
    <line x1="70" y1="38" x2="90" y2="42" stroke="#059669" strokeWidth="1.5" />
    <line x1="52" y1="56" x2="108" y2="60" stroke="#059669" strokeWidth="1.5" />
    <line x1="70" y1="74" x2="90" y2="78" stroke="#059669" strokeWidth="1.5" />
    <line x1="52" y1="90" x2="108" y2="86" stroke="#059669" strokeWidth="1.5" />
    {/* Stethoscope */}
    <circle cx="135" cy="35" r="12" stroke="#059669" strokeWidth="2" />
    <path d="M135 47 L135 65 C135 75, 145 75, 145 65 L145 55" stroke="#059669" strokeWidth="2" fill="none" />
    <circle cx="145" cy="50" r="6" stroke="#059669" strokeWidth="2" />
  </svg>
);

const CUETIllustration = () => (
  <svg viewBox="0 0 160 120" fill="none" className="w-full h-full opacity-[0.07]">
    {/* University building */}
    <rect x="30" y="60" width="100" height="55" fill="#7c3aed" />
    <polygon points="80,20 20,60 140,60" fill="#7c3aed" />
    <rect x="55" y="80" width="20" height="35" fill="#ffffff" />
    <rect x="85" y="80" width="20" height="20" fill="#ffffff" />
    <circle cx="80" cy="40" r="6" fill="#ffffff" />
    {/* Graduation cap */}
    <polygon points="115,15 145,25 115,35" fill="#7c3aed" />
    <rect x="128" y="25" width="4" height="18" fill="#7c3aed" />
    <circle cx="130" cy="43" r="5" fill="#7c3aed" />
    {/* Stars */}
    <text x="10" y="30" fontSize="12" fill="#7c3aed">★</text>
    <text x="140" y="80" fontSize="10" fill="#7c3aed">★</text>
    <text x="5" y="75" fontSize="8" fill="#7c3aed">★</text>
  </svg>
);

/* ─────────────────────────────────────────────
   FLOATING DECORATIVE ELEMENTS FOR HERO
───────────────────────────────────────────── */
const FloatingStars = () => (
  <>
    {/* Animated star decorations */}
    <div className="absolute top-4 right-12 animate-bounce" style={{ animationDuration: '3s' }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 1L12.47 7.27H19.51L13.9 11.18L16.18 17.51L10 13.27L3.82 17.51L6.1 11.18L0.49 7.27H7.53L10 1Z" fill="#FBBF24" opacity="0.8" />
      </svg>
    </div>
    <div className="absolute top-16 right-4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path d="M10 1L12.47 7.27H19.51L13.9 11.18L16.18 17.51L10 13.27L3.82 17.51L6.1 11.18L0.49 7.27H7.53L10 1Z" fill="#FBBF24" opacity="0.6" />
      </svg>
    </div>
    <div className="absolute bottom-20 right-6 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M10 1L12.47 7.27H19.51L13.9 11.18L16.18 17.51L10 13.27L3.82 17.51L6.1 11.18L0.49 7.27H7.53L10 1Z" fill="#A78BFA" opacity="0.7" />
      </svg>
    </div>
    {/* Upward trending arrow */}
    <div className="absolute top-8 left-[45%] opacity-50">
      <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
        <polyline points="2,28 12,18 22,22 36,6" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="30,4 38,4 38,12" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    {/* Circular graph deco */}
    <div className="absolute bottom-28 left-[40%] opacity-30">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="#10b981" strokeWidth="2" strokeDasharray="50 32" strokeLinecap="round" />
      </svg>
    </div>
  </>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <LandingNav />

      {/* ══════════════════════════════════
          1. HERO SECTION — PREMIUM
      ══════════════════════════════════ */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 pt-6 pb-0 lg:pt-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-4 lg:gap-0 items-end">

            {/* LEFT COLUMN */}
            <div className="space-y-5 pb-10 lg:pb-14 pt-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                AI-Powered Preparation Platform
              </div>

              {/* Headline */}
              <h1 className="text-[34px] sm:text-[42px] lg:text-[48px] font-black text-slate-900 leading-[1.1] tracking-tight">
                Crack JEE, NEET &amp; CUET with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  AI-Powered Learning
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-[15px] text-slate-500 leading-relaxed max-w-lg font-medium">
                Practice smarter with personalized study plans, AI doubt solving, mock tests, performance analytics and adaptive learning.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => navigate('/signup')}
                  id="hero-cta-primary"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98]"
                >
                  Start Free Practice Test
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  id="hero-cta-secondary"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm active:scale-[0.98]"
                >
                  <Bot className="w-4 h-4 text-blue-600" />
                  Talk To AI Mentor
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-[13px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel Anytime
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN — Premium Hero Visual */}
            <div className="relative flex justify-center items-end min-h-[500px] lg:min-h-[540px] select-none overflow-visible">

              {/* Decorative circle background */}
              <div
                className="absolute bottom-0 w-[420px] h-[420px] rounded-full"
                style={{ background: 'radial-gradient(circle, #eff6ff 0%, #e0e7ff 60%, transparent 100%)' }}
              />

              {/* Floating decorative elements */}
              <FloatingStars />

              {/* Student image — large and dominant */}
              <img
                src="/images/student_standing.png"
                alt="PrepEntrance Student"
                className="relative z-10 w-[320px] sm:w-[360px] lg:w-[380px] object-contain object-bottom"
                style={{ height: '490px', objectFit: 'contain', objectPosition: 'bottom center', filter: 'drop-shadow(0 20px 40px rgba(37,99,235,0.18))' }}
              />

              {/* Analytics card — overlaps the student (left) */}
              <div className="absolute left-0 top-[8%] z-20 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl w-[195px]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">JEE Main Mock Test</span>
                  <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 mb-0.5">Overall Score</div>
                <div className="text-[26px] font-black text-slate-900 leading-none mb-2.5">156<span className="text-base font-bold text-slate-400">/300</span></div>
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Percentile</div>
                    <div className="text-sm font-black text-slate-900">92.4</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Pred. Rank</div>
                    <div className="text-sm font-black text-slate-900">1235</div>
                  </div>
                </div>
                {/* Mini bar graph */}
                <div className="flex gap-1 items-end h-9 mb-2.5">
                  {[35, 60, 42, 75, 50, 90, 68].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, backgroundColor: i === 5 ? '#2563eb' : '#bfdbfe' }} />
                  ))}
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black">
                  ✓ Excellent Performance!
                </span>
              </div>

              {/* AI Mentor card — overlaps on right side */}
              <div className="absolute right-0 top-[12%] z-20 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xl w-[215px]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[12px] font-black text-slate-800">AI Mentor</span>
                  </div>
                  <div className="flex gap-1.5 text-slate-300 text-xs font-bold">+ ✕</div>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 rounded-lg px-2.5 py-2 mb-2.5">
                  Hi! How can I help you today?
                </p>
                <div className="space-y-1.5">
                  {[
                    { icon: <BookOpen className="w-3 h-3 text-blue-500" />, text: 'Explain this concept' },
                    { icon: <HelpCircle className="w-3 h-3 text-emerald-500" />, text: 'Solve a doubt' },
                    { icon: <Calendar className="w-3 h-3 text-purple-500" />, text: 'Generate study plan' },
                    { icon: <TrendingUp className="w-3 h-3 text-indigo-500" />, text: 'Analyze my performance' },
                  ].map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => navigate('/signup')}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-100 bg-white text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-all"
                    >
                      <div className="flex items-center gap-1.5">{pill.icon}<span>{pill.text}</span></div>
                      <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                    </button>
                  ))}
                </div>
                <div className="relative mt-2.5">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    disabled
                    className="w-full text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 pr-8 text-slate-400 font-medium"
                  />
                  <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Achievement badge floating */}
              <div className="absolute bottom-[12%] left-[5%] z-20 bg-white border border-amber-200 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-base">🏆</div>
                <div>
                  <div className="text-[10px] font-black text-slate-800">Top 5%</div>
                  <div className="text-[9px] font-semibold text-slate-400">Percentile Rank</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. OUR EXAMS
      ══════════════════════════════════ */}
      <section id="exams" className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-12 bg-slate-200" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Our Exams</h2>
            <span className="h-px w-12 bg-slate-200" />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* JEE */}
            <div className="bg-white border-2 border-slate-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-36 h-28 pointer-events-none">
                <JEEIllustration />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Engineering</span>
                  <h3 className="text-[28px] font-black text-slate-900 leading-none">JEE</h3>
                </div>
              </div>
              <ul className="space-y-2.5 mb-5">
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Check className="w-4 h-4 text-blue-500 stroke-[3]" /> JEE Main
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Check className="w-4 h-4 text-blue-500 stroke-[3]" /> JEE Advanced
                </li>
              </ul>
              <button
                onClick={() => navigate('/jee')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
              >
                Explore JEE <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* NEET */}
            <div className="bg-white border-2 border-slate-100 rounded-xl p-6 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-36 h-28 pointer-events-none">
                <NEETIllustration />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Medical</span>
                  <h3 className="text-[28px] font-black text-slate-900 leading-none">NEET</h3>
                </div>
              </div>
              <ul className="space-y-2.5 mb-5">
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> NEET UG
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-400 italic">
                  Physics · Chemistry · Biology
                </li>
              </ul>
              <button
                onClick={() => navigate('/neet')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-emerald-200 text-emerald-600 font-bold text-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200"
              >
                Explore NEET <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* CUET */}
            <div className="bg-white border-2 border-slate-100 rounded-xl p-6 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-36 h-28 pointer-events-none">
                <CUETIllustration />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border-2 border-purple-100 flex items-center justify-center text-purple-600">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">University Entrance</span>
                  <h3 className="text-[28px] font-black text-slate-900 leading-none">CUET</h3>
                </div>
              </div>
              <ul className="space-y-2.5 mb-5">
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Check className="w-4 h-4 text-purple-500 stroke-[3]" /> Common University Entrance Test
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-400 italic">
                  UG Admissions · Central Universities
                </li>
              </ul>
              <button
                onClick={() => navigate('/cuet')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-purple-200 text-purple-600 font-bold text-sm hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-200"
              >
                Explore CUET <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. WHY STUDENTS CHOOSE
      ══════════════════════════════════ */}
      <section id="features" className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-12 bg-slate-200" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-center">Why Students Choose PrepEntrance?</h2>
            <span className="h-px w-12 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-xl p-5 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-200 space-y-3 cursor-default group"
              >
                <div className={`w-12 h-12 rounded-xl border mx-auto flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-[13px] font-black text-slate-900 leading-snug">{f.title}</h3>
                <p className="text-[11.5px] font-medium text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. OUR BATCHES
      ══════════════════════════════════ */}
      <section id="batches" className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-12 bg-slate-200" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Our Batches</h2>
            <span className="h-px w-12 bg-slate-200" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {batches.map((b, i) => (
              <div
                key={i}
                className="relative rounded-2xl text-white overflow-hidden flex flex-col shadow-2xl hover:-translate-y-1 transition-transform duration-300"
                style={{ minHeight: '500px' }}
              >
                {/* Mountain background */}
                <img
                  src={b.mountain}
                  alt={b.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-black/85" />

                {/* Card content */}
                <div className="relative z-10 flex flex-col flex-1 p-6 pt-7">
                  {/* Batch name + badge */}
                  <div className="space-y-2 mb-auto">
                    <h3 className="text-[24px] font-black tracking-tight leading-tight drop-shadow-lg">{b.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-black text-white ${b.labelBg}`}>
                      {b.label}
                    </span>
                  </div>

                  {/* Mountain shows through */}
                  <div className="h-44" />

                  {/* Features */}
                  <ul className="space-y-2.5 mb-5">
                    {b.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-[13px] font-bold text-white/90">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: b.accent + '33', border: `1.5px solid ${b.checkColor}` }}
                        >
                          <Check className="w-3 h-3 stroke-[3.5]" style={{ color: b.checkColor }} />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-[32px] font-black drop-shadow-lg">{b.price}</span>
                    <span className="text-white/60 text-sm font-bold ml-1.5">/ month</span>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={() => navigate(`/batches/${b.slug}`)}
                    className={`w-full py-3 rounded-xl text-white font-black text-sm transition-all active:scale-[0.98] shadow-xl ${b.btnBg}`}
                  >
                    Explore Batch →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. SUCCESS JOURNEY
      ══════════════════════════════════ */}
      <section id="journey" className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="h-px w-12 bg-slate-200" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-center">Your Success Journey with PrepEntrance</h2>
            <span className="h-px w-12 bg-slate-200" />
          </div>

          {/* Steps */}
          <div className="relative">
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px border-t-2 border-dashed border-slate-200 z-0" />
            <div className="grid md:grid-cols-5 gap-6 relative z-10">
              {journeySteps.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-blue-600 shadow-sm hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step {s.step}</span>
                  <h4 className="text-[13px] font-black text-slate-900 leading-tight">{s.title}</h4>
                  <p className="text-[11px] font-medium text-slate-400 max-w-[140px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits strip */}
          <div className="mt-10 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
              {[
                { icon: <Bot className="w-6 h-6" />, label: 'AI-Powered Learning' },
                { icon: <FileText className="w-6 h-6" />, label: 'Unlimited Practice Questions' },
                { icon: <CheckCircle2 className="w-6 h-6" />, label: 'Personalized Study Plans' },
                { icon: <BarChart2 className="w-6 h-6" />, label: 'Detailed Analytics' },
                { icon: <Clock className="w-6 h-6" />, label: '24/7 AI Mentor' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="text-blue-600">{b.icon}</div>
                  <span className="text-xs font-bold text-slate-700">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. TESTIMONIALS
      ══════════════════════════════════ */}
      <section id="testimonials" className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-slate-200" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">What Students Say</h2>
              <span className="h-px w-10 bg-slate-200" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTestimonial((p) => (p + 1) % testimonials.length)}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`bg-white border-2 rounded-xl p-5 space-y-3 transition-all duration-200 ${
                  activeTestimonial === i
                    ? 'border-blue-300 shadow-lg ring-2 ring-blue-50'
                    : 'border-slate-100 shadow-sm opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[13px] text-slate-600 font-semibold leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                  <div>
                    <div className="text-sm font-black text-slate-900">{t.name}</div>
                    <div className="text-[11px] font-bold text-slate-400">{t.exam}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 rounded-full transition-all ${activeTestimonial === i ? 'bg-blue-600 w-5' : 'bg-slate-300 w-2'}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. SOCIAL PROOF STRIP
      ══════════════════════════════════ */}
      <section className="py-10 bg-gradient-to-r from-[#1e3a8a] to-[#312e81] border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {socialProofStats.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300">
                  {s.icon}
                </div>
                <div className="text-2xl font-black text-white">{s.num}</div>
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          8. FINAL CTA BANNER
      ══════════════════════════════════ */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: 'linear-gradient(120deg, #1e3a8a 0%, #312e81 100%)' }}
          >
            <div className="grid lg:grid-cols-[1fr_auto] items-center">
              {/* Left content */}
              <div className="p-8 sm:p-10 lg:p-12 space-y-4">
                <h2 className="text-2xl sm:text-[32px] font-black text-white leading-tight">
                  Your Competition Is Practicing.<br />Are You?
                </h2>
                <p className="text-sm text-blue-200 font-semibold max-w-md">
                  Join thousands of students preparing smarter with AI-powered learning.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => navigate('/signup')}
                    id="cta-banner-primary"
                    className="px-7 py-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm transition-all active:scale-[0.98] shadow-xl shadow-amber-500/30"
                  >
                    Start Free Practice Test
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    id="cta-banner-secondary"
                    className="px-7 py-3.5 rounded-lg border-2 border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all active:scale-[0.98]"
                  >
                    Explore AI Tutor
                  </button>
                </div>
              </div>

              {/* Right: student image */}
              <div className="hidden lg:block relative h-full min-h-[260px] w-[300px]">
                <img
                  src="/images/student_standing.png"
                  alt="Student"
                  className="absolute bottom-0 right-0 h-full w-full object-contain object-bottom"
                  style={{ filter: 'brightness(0.9)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          9. FOOTER — STRONG
      ══════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                {/* Official PrepEntrance Logo Badge */}
                <div className="bg-slate-950 p-2 rounded-xl shadow-md border border-slate-800/80 flex items-center justify-center h-12">
                  <img 
                    src="/prepentrance-logo.png" 
                    alt="PrepEntrance Logo" 
                    className="h-8 w-auto object-contain" 
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-[20px] text-white tracking-tight">PrepEntrance</span>
                  <span className="text-[9px] font-bold text-slate-500 tracking-[0.18em] uppercase mt-0.5">Practice. Analyze. Improve.</span>
                </div>
              </div>
              <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-xs">
                AI-first personalized practice workspace built to help students crack JEE, NEET and CUET.
              </p>
              {/* Follow Us */}
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Follow Us</div>
                <div className="flex gap-2.5">
                  {[
                    { icon: <Facebook className="w-4 h-4" />, label: 'Facebook' },
                    { icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
                    { icon: <Youtube className="w-4 h-4" />, label: 'YouTube' },
                    { icon: <Twitter className="w-4 h-4" />, label: 'Twitter' },
                  ].map((s) => (
                    <button key={s.label} aria-label={s.label} className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-700 transition-colors">
                      {s.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Exams */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Exams</h4>
              <ul className="space-y-2.5">
                {['JEE', 'NEET', 'CUET'].map((e) => (
                  <li key={e}>
                    <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">{e}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2.5">
                {['Blog', 'Study Material', 'Mock Tests'].map((e) => (
                  <li key={e}>
                    <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">{e}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Company</h4>
              <ul className="space-y-2.5">
                {['About', 'Contact', 'Careers'].map((e) => (
                  <li key={e}>
                    <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">{e}</button>
                  </li>
                ))}
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

export default LandingPage;
// Trigger build reload
