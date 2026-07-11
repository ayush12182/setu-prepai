import React, { useState, useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingNav from '@/components/landing/LandingNav';
import {
  Bot, LineChart, Brain, Clock, ChevronRight, Check, FileText, Users, Trophy,
  ChevronLeft, Settings, Plus, Building, Facebook, Instagram, Youtube, Twitter,
  Star, ArrowRight, TrendingUp, Calendar, Zap, CheckCircle2, BookOpen, HelpCircle,
  Target, MessageSquare, BarChart2, Layers, Sparkles, MapPin, Rocket, Shield,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const testimonials = [
  {
    text: 'PrepEntrance made my preparation much more structured. The AI mentor and practice sessions helped me identify weak chapters quickly.',
    name: 'Mehul Mishra',
    exam: 'JEE Aspirant',
    badge: 'JEE',
    subtitle: 'JEE Aspirant',
  },
  {
    text: 'The personalized roadmap kept me consistent every day. The analytics clearly showed where I needed improvement.',
    name: 'Akshat Saxena',
    exam: 'JEE Aspirant',
    badge: 'JEE',
    subtitle: 'JEE Aspirant',
  },
  {
    text: 'The chapter-wise practice and detailed explanations saved me a lot of revision time. Highly recommended.',
    name: 'Gauri Sharma',
    exam: 'NEET Aspirant',
    badge: 'NEET',
    subtitle: 'NEET Aspirant',
  },
  {
    text: 'I loved the adaptive practice feature. Questions automatically became tougher as my accuracy improved.',
    name: 'Stuti Saxena',
    exam: 'JEE Aspirant',
    badge: 'JEE',
    subtitle: 'JEE Aspirant',
  },
  {
    text: 'PrepEntrance made CUET preparation much simpler with topic-wise tests and instant AI analysis.',
    name: 'Unnati Gupta',
    exam: 'CUET Aspirant',
    badge: 'CUET',
    subtitle: 'CUET Aspirant',
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
    mainName: 'AARAMBH',
    year: '1 Month',
    name: 'Aarambh Plan',
    subtitle: 'For Quick Access',
    mission: '"The journey begins."',
    label: '1 Month Plan',
    labelBg: 'bg-blue-950/30 border border-blue-500/10 text-blue-300/75',
    btnBg: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.45)]',
    mountain: '/images/mountain_blue.png',
    objectPosition: 'center 25%',
    accent: '#60a5fa',
    checkColor: '#60a5fa',
    shadowColor: 'rgba(59,130,246,0.25)',
    hoverShadow: 'rgba(59,130,246,0.45)',
    borderColor: 'rgba(59,130,246,0.3)',
    glowClass: 'glow-title-aarambh',
    accentColor: '#2563eb',
    particleColor: 'rgba(245,158,11,0.6)',
    price: '₹349',
    period: '/ month',
    slug: 'aarambh',
    btnText: 'Explore Aarambh →',
    features: ['1 month complete access', '2,500+ practice questions', 'Daily AI Study Plans', 'Ask AI Mentor'],
  },
  {
    mainName: 'AAROHAN',
    year: '12 Months',
    name: 'Aarohan Plan',
    subtitle: 'Most Popular',
    mission: '"Rise above the competition."',
    label: '12 Month Plan',
    labelBg: 'bg-purple-950/30 border border-purple-500/10 text-purple-300/75',
    btnBg: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-[0_4px_20px_rgba(168,85,247,0.25)] hover:shadow-[0_6px_25px_rgba(168,85,247,0.45)]',
    mountain: '/images/mountain_purple.png',
    objectPosition: '85% 18%',
    accent: '#a855f7',
    checkColor: '#c084fc',
    shadowColor: 'rgba(168,85,247,0.25)',
    hoverShadow: 'rgba(168,85,247,0.45)',
    borderColor: 'rgba(168,85,247,0.3)',
    glowClass: 'glow-title-aarohan',
    accentColor: '#a855f7',
    particleColor: 'rgba(59,130,246,0.6)',
    price: '₹3,839',
    period: '/ year',
    slug: 'aarohan',
    btnText: 'Explore Aarohan →',
    features: ['1 year complete access', '5,000+ practice questions', 'Rank Predictor included', 'Unlimited AI Mentor'],
  },
  {
    mainName: 'SHIKHAR',
    year: '24 Months',
    name: 'Shikhar Plan',
    subtitle: 'Best Value',
    mission: '"Reach the peak."',
    label: '24 Month Plan',
    labelBg: 'bg-orange-950/30 border border-orange-500/10 text-orange-300/75',
    btnBg: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-[0_4px_20px_rgba(249,115,22,0.25)] hover:shadow-[0_6px_25px_rgba(249,115,22,0.45)]',
    mountain: '/images/mountain_orange.png',
    objectPosition: 'center 18%',
    accent: '#fb923c',
    checkColor: '#fb923c',
    shadowColor: 'rgba(249,115,22,0.25)',
    hoverShadow: 'rgba(249,115,22,0.45)',
    borderColor: 'rgba(249,115,22,0.3)',
    glowClass: 'glow-title-shikhar',
    accentColor: '#fb923c',
    particleColor: 'rgba(168,85,247,0.6)',
    price: '₹7,329',
    period: '/ 2 years',
    slug: 'shikhar',
    btnText: 'Explore Shikhar →',
    features: ['2 years complete access', '10,000+ practice questions', 'Complete Mock Test Series', 'Unlimited AI Mentor'],
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

const collegesData = {
  engineering: [
    { name: 'IIT Bombay', tag: 'Engineering Excellence', img: '/images/colleges/iit_bombay.jpg' },
    { name: 'IIT Delhi', tag: 'Engineering Excellence', img: '/images/colleges/iit_delhi.jpg' },
    { name: 'IIT Madras', tag: 'Engineering Excellence', img: '/images/colleges/iit_madras.jpg' },
    { name: 'IIT Kanpur', tag: 'Engineering Excellence', img: '/images/colleges/iit_kanpur.jpg' },
    { name: 'IIT Kharagpur', tag: 'Engineering Excellence', img: '/images/colleges/iit_kharagpur.jpg' },
  ],
  medical: [
    { name: 'AIIMS Delhi', tag: 'Medical Excellence', img: '/images/colleges/aiims_delhi.jpg' },
    { name: 'AIIMS Bhopal', tag: 'Medical Excellence', img: '/images/colleges/aiims_bhopal.jpg' },
    { name: 'AIIMS Jodhpur', tag: 'Medical Excellence', img: '/images/colleges/aiims_jodhpur.jpg' },
    { name: 'AIIMS Rishikesh', tag: 'Medical Excellence', img: '/images/colleges/aiims_rishikesh.jpg' },
    { name: 'AIIMS Bhubaneswar', tag: 'Medical Excellence', img: '/images/colleges/aiims_bhubaneswar.jpg' },
  ],
  universities: [
    { name: 'Delhi University', tag: 'Academic Excellence', img: '/images/colleges/delhi_university.jpg' },
    { name: 'BHU', tag: 'Academic Excellence', img: '/images/colleges/bhu.jpg' },
    { name: 'JNU', tag: 'Academic Excellence', img: '/images/colleges/jnu.jpg' },
    { name: 'University of Hyderabad', tag: 'Academic Excellence', img: '/images/colleges/hyderabad_university.jpg' },
    { name: 'Jamia Millia Islamia', tag: 'Academic Excellence', img: '/images/colleges/jamia_millia.jpg' },
  ]
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCollegesTab, setActiveCollegesTab] = useState<'engineering' | 'medical' | 'universities'>('engineering');

  // ── Embla carousel ────────────────────────────────────────────
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 1 },
      '(min-width: 1024px)': { slidesToScroll: 1 }
    }
  });

  const { user, profile, loading: authLoading, profileLoading } = useAuth();
  
  useEffect(() => {
    // If the user has logged in but hasn't completed onboarding (no target exam),
    // they should be redirected to the auth flow to complete it.
    if (!authLoading && !profileLoading && user) {
      if (!profile?.target_exam && !profile?.class) {
        navigate('/auth', { replace: true });
      }
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  const [activeSlide, setActiveSlide] = useState(0);
  const isHoveredRef = useRef(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (!isHoveredRef.current && emblaApi) emblaApi.scrollNext();
    }, 3500);
  }, [emblaApi]);

  // Sync dot index when Embla scrolls
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveSlide(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    startAutoplay();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, startAutoplay]);

  // Clean up on unmount
  useEffect(() => () => { if (autoplayRef.current) clearInterval(autoplayRef.current); }, []);

  const scrollPrev = useCallback(() => { emblaApi?.scrollPrev(); startAutoplay(); }, [emblaApi, startAutoplay]);
  const scrollNext = useCallback(() => { emblaApi?.scrollNext(); startAutoplay(); }, [emblaApi, startAutoplay]);
  const scrollTo   = useCallback((i: number) => { emblaApi?.scrollTo(i); startAutoplay(); }, [emblaApi, startAutoplay]);

  const badgeColors: Record<string, string> = {
    JEE:  'bg-blue-50    text-blue-700    border-blue-200',
    NEET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CUET: 'bg-purple-50  text-purple-700  border-purple-200',
  };

  React.useEffect(() => {
    document.title = "PrepEntrance — Your Complete AI Exam Prep Partner";
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-caption font-bold tracking-wide shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                AI-Powered Preparation Platform
              </div>

              {/* Headline */}
              <h1 className="text-display-lg font-bold text-slate-900 leading-[1.1] tracking-tight">
                Crack JEE, NEET &amp; CUET with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  AI-Powered Learning
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-body-md text-slate-500 leading-relaxed max-w-lg font-normal">
                Practice smarter with personalized study plans, AI doubt solving, mock tests, performance analytics and adaptive learning.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => navigate('/signup')}
                  id="hero-cta-primary"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-body-sm transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98]"
                >
                  Start Free Practice Test
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  id="hero-cta-secondary"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 font-bold text-body-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm active:scale-[0.98]"
                >
                  <Bot className="w-4 h-4 text-blue-600" />
                  Talk To AI Mentor
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-body-sm font-semibold text-slate-500">
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
              <div className="hidden md:block absolute left-0 top-[8%] z-20 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl w-[195px]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-caption font-bold text-slate-700 tracking-wide">JEE Main Mock Test</span>
                  <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-caption font-bold text-slate-400 mb-0.5">Overall Score</div>
                <div className="text-heading-md font-bold text-slate-900 leading-none mb-2.5">156<span className="text-body-md font-bold text-slate-400">/300</span></div>
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div>
                    <div className="text-caption font-bold text-slate-400 mb-0.5">Percentile</div>
                    <div className="text-body-sm font-bold text-slate-900">92.4</div>
                  </div>
                  <div>
                    <div className="text-caption font-bold text-slate-400 mb-0.5">Pred. Rank</div>
                    <div className="text-body-sm font-bold text-slate-900">1235</div>
                  </div>
                </div>
                {/* Mini bar graph */}
                <div className="flex gap-1 items-end h-9 mb-2.5">
                  {[35, 60, 42, 75, 50, 90, 68].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, backgroundColor: i === 5 ? '#2563eb' : '#bfdbfe' }} />
                  ))}
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-caption font-bold">
                  ✓ Excellent Performance!
                </span>
              </div>

              {/* AI Mentor card — overlaps on right side */}
              <div className="hidden md:block absolute right-0 top-[12%] z-20 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xl w-[215px]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-caption font-bold text-slate-800">AI Mentor</span>
                  </div>
                  <div className="flex gap-1.5 text-slate-300 text-caption font-bold">+ ✕</div>
                </div>
                <p className="text-body-sm text-slate-500 font-semibold bg-slate-50 rounded-lg px-2.5 py-2 mb-2.5">
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
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-100 bg-white text-caption font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-all"
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
                    className="w-full text-caption bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 pr-8 text-slate-400 font-medium"
                  />
                  <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Achievement badge floating */}
              <div className="hidden sm:flex absolute bottom-[12%] left-[5%] z-20 bg-white border border-amber-200 rounded-xl px-3 py-2 shadow-lg items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-body-md">🏆</div>
                <div>
                  <div className="text-caption font-bold text-slate-800">Top 5%</div>
                  <div className="text-caption font-semibold text-slate-400">Percentile Rank</div>
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
            <h2 className="text-heading-lg font-bold text-slate-900 text-center">Our Exams</h2>
            <span className="h-px w-12 bg-slate-200" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* JEE */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-6.5 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[310px]">
              {/* Subtle watermark background */}
              <div className="absolute right-3 bottom-3 w-20 h-20 pointer-events-none z-0">
                <img 
                  src="/images/card_jee.png" 
                  alt="JEE Watermark" 
                  className="w-full h-full object-contain opacity-15 group-hover:opacity-25 transition-all duration-300 group-hover:scale-105" 
                  style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(195deg) saturate(350%) brightness(95%)' }}
                />
              </div>
              
              <div className="relative z-10 space-y-3.5 text-left">
                {/* Top: Icon + Category */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-caption font-bold text-blue-600 tracking-wider">Engineering</span>
                </div>
                
                {/* Middle: Exam Name */}
                <h3 className="text-heading-md font-bold text-slate-900 leading-none">JEE</h3>
                
                {/* Description */}
                <p className="text-body-md text-slate-600 leading-relaxed font-normal">
                  Gateway to IITs, NITs & Top Engineering Colleges
                </p>
                
                {/* Career Paths */}
                <div className="pt-1">
                  <span className="text-caption font-bold text-slate-400 block mb-0.5">Career Paths</span>
                  <p className="text-body-sm font-semibold text-slate-500">
                    Software Engineering • AI • Core Engineering
                  </p>
                </div>
              </div>
              
              {/* Bottom: Explore Button */}
              <div className="relative z-10 pt-4">
                <button
                  onClick={() => navigate('/jee')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-bold text-body-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 active:scale-98"
                >
                  Explore JEE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* NEET */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-6.5 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[310px]">
              {/* Subtle watermark background */}
              <div className="absolute right-3 bottom-3 w-20 h-20 pointer-events-none z-0">
                <img 
                  src="/images/card_neet.png" 
                  alt="NEET Watermark" 
                  className="w-full h-full object-contain opacity-15 group-hover:opacity-25 transition-all duration-300 group-hover:scale-105" 
                  style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(90deg) saturate(350%) brightness(95%)' }}
                />
              </div>
              
              <div className="relative z-10 space-y-3.5 text-left">
                {/* Top: Icon + Category */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-caption font-bold text-emerald-600 tracking-wider">Medical</span>
                </div>
                
                {/* Middle: Exam Name */}
                <h3 className="text-heading-md font-bold text-slate-900 leading-none">NEET</h3>
                
                {/* Description */}
                <p className="text-body-md text-slate-600 leading-relaxed font-normal">
                  Gateway to AIIMS, JIPMER & Premier Medical Colleges
                </p>
                
                {/* Career Paths */}
                <div className="pt-1">
                  <span className="text-caption font-bold text-slate-400 block mb-0.5">Career Paths</span>
                  <p className="text-body-sm font-semibold text-slate-500">
                    Medicine (MBBS) • Dental (BDS) • Healthcare Science
                  </p>
                </div>
              </div>
              
              {/* Bottom: Explore Button */}
              <div className="relative z-10 pt-4">
                <button
                  onClick={() => navigate('/neet')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 font-bold text-body-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 active:scale-98"
                >
                  Explore NEET <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CUET */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-6.5 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[310px]">
              {/* Subtle watermark background */}
              <div className="absolute right-3 bottom-3 w-20 h-20 pointer-events-none z-0">
                <img 
                  src="/images/card_cuet.png" 
                  alt="CUET Watermark" 
                  className="w-full h-full object-contain opacity-15 group-hover:opacity-25 transition-all duration-300 group-hover:scale-105" 
                  style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(240deg) saturate(350%) brightness(95%)' }}
                />
              </div>
              
              <div className="relative z-10 space-y-3.5 text-left">
                {/* Top: Icon + Category */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-caption font-bold text-purple-600 tracking-wider">University Entrance</span>
                </div>
                
                {/* Middle: Exam Name */}
                <h3 className="text-heading-md font-bold text-slate-900 leading-none">CUET</h3>
                
                {/* Description */}
                <p className="text-body-md text-slate-600 leading-relaxed font-normal">
                  One Exam. Access to Hundreds of Top Central Universities.
                </p>
                
                {/* Career Paths */}
                <div className="pt-1">
                  <span className="text-caption font-bold text-slate-400 block mb-0.5">Career Paths</span>
                  <p className="text-body-sm font-semibold text-slate-500">
                    Liberal Arts • Science & Technology • Business & Commerce
                  </p>
                </div>
              </div>
              
              {/* Bottom: Explore Button */}
              <div className="relative z-10 pt-4">
                <button
                  onClick={() => navigate('/cuet')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-200 text-purple-600 font-bold text-body-sm hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-200 active:scale-98"
                >
                  Explore CUET <ArrowRight className="w-4 h-4" />
                </button>
              </div>
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
            <h2 className="text-heading-lg font-bold text-slate-900 text-center">Why Students Choose PrepEntrance?</h2>
            <span className="h-px w-12 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-xl p-6 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-200 space-y-4 cursor-default group"
              >
                <div className={`w-14 h-14 rounded-xl border mx-auto flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-title-md font-semibold text-slate-900 leading-snug">{f.title}</h3>
                <p className="text-body-md font-normal text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. OUR BATCHES
      ══════════════════════════════════ */}
      <section id="batches" className="py-20 bg-white border-b border-slate-100 relative overflow-hidden">
        {/* Subtle radial glow behind cards only */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),transparent_70%)] pointer-events-none" />

        <style>{`
          .glow-particle {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background-color: var(--glow-color, rgba(255,255,255,0.8));
            box-shadow: 0 0 8px var(--glow-color, rgba(255,255,255,0.8));
            opacity: 0;
          }
          @keyframes float-particle-1 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            30% { opacity: 0.6; }
            100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
          }
          @keyframes float-particle-2 {
            0% { transform: translateY(0) scale(1.2); opacity: 0; }
            40% { opacity: 0.8; }
            100% { transform: translateY(-160px) scale(0.2); opacity: 0; }
          }
          @keyframes float-particle-3 {
            0% { transform: translateY(0) scale(0.8); opacity: 0; }
            20% { opacity: 0.5; }
            100% { transform: translateY(-100px) scale(0.4); opacity: 0; }
          }
          .group:hover .animate-particle-1 { animation: float-particle-1 5s infinite linear; }
          .group:hover .animate-particle-2 { animation: float-particle-2 7s infinite linear; }
          .group:hover .animate-particle-3 { animation: float-particle-3 6s infinite linear; }

          .glow-title {
            text-shadow: 0 0 20px rgba(255,255,255,0.15);
            transition: text-shadow 0.3s ease-in-out;
          }
          .group:hover .glow-title-aarambh {
            text-shadow: 0 0 30px rgba(96,165,250,0.25);
          }
          .group:hover .glow-title-aarohan {
            text-shadow: 0 0 30px rgba(192,132,252,0.25);
          }
          .group:hover .glow-title-shikhar {
            text-shadow: 0 0 30px rgba(251,146,60,0.25);
          }
        `}</style>

        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Flanking lines with a continuous brand gradient flow (Blue -> Purple -> Orange) */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-purple-500/70" />
            <h2 className="text-heading-lg font-extrabold text-slate-900 text-center tracking-wider px-2">Our Batches</h2>
            <span className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-r from-purple-500/70 via-orange-500/30 to-orange-500/0" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {batches.map((b, i) => (
              <div
                key={i}
                className="relative rounded-2xl text-white overflow-hidden flex flex-col border transition-all duration-300 ease-out cursor-default group hover:-translate-y-2 hover:scale-[1.01] transform-gpu"
                style={{
                  minHeight: '570px',
                  borderColor: b.borderColor,
                  boxShadow: `0 0 20px ${b.shadowColor}`,
                  ['--glow-color' as any]: b.accent,
                  ['--hover-shadow' as any]: b.hoverShadow,
                  ['--border-glow' as any]: b.accent,
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = b.accent;
                  e.currentTarget.style.boxShadow = `0 0 60px ${b.hoverShadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = b.borderColor;
                  e.currentTarget.style.boxShadow = `0 0 20px ${b.shadowColor}`;
                }}
              >
                {/* Mountain background */}
                <img
                  src={b.mountain}
                  alt={b.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:brightness-[1.08] group-hover:saturate-[1.15]"
                  style={{ objectPosition: b.objectPosition }}
                />

                {/* Top reflection highlight (Apple-style) - Top 20% */}
                <div className="absolute top-0 inset-x-0 h-[20%] bg-gradient-to-b from-white/8 to-transparent pointer-events-none z-20" />

                {/* Top subtle overlay for badge and title readability */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

                {/* Bottom fade overlay to blend artwork naturally into CTA area (transparent -> rgba(0,0,0,0.75)) */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none" />

                {/* Cinematic Radial Light source behind the title */}
                <div 
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none blur-3xl opacity-[0.14]"
                  style={{ background: `radial-gradient(circle, ${b.accentColor} 0%, transparent 70%)` }}
                />

                {/* Floating Particles - Visible only on hover */}
                <div 
                  className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-0 group-hover:opacity-75 transition-opacity duration-500"
                  style={{ '--glow-color': b.particleColor } as React.CSSProperties}
                >
                  <span className="glow-particle animate-particle-1" style={{ left: '15%', top: '80%', width: '2px', height: '2px' }} />
                  <span className="glow-particle animate-particle-2" style={{ left: '45%', top: '75%', width: '3px', height: '3px' }} />
                  <span className="glow-particle animate-particle-3" style={{ left: '75%', top: '85%', width: '2.5px', height: '2.5px' }} />
                  <span className="glow-particle animate-particle-1" style={{ left: '30%', top: '90%', width: '3px', height: '3px', animationDelay: '1s' }} />
                  <span className="glow-particle animate-particle-2" style={{ left: '60%', top: '70%', width: '2px', height: '2px', animationDelay: '2s' }} />
                  <span className="glow-particle animate-particle-3" style={{ left: '85%', top: '80%', width: '3.5px', height: '3.5px', animationDelay: '0.5s' }} />
                  <span className="glow-particle animate-particle-1" style={{ left: '50%', top: '85%', width: '2.5px', height: '2.5px', animationDelay: '1.5s' }} />
                </div>

                {/* Card content - Changed pt-10 to pt-8 for super compact Apple top padding */}
                <div className="relative z-10 flex flex-col flex-1 p-6 pt-8">
                  {/* Top: Batch Badge - font-semibold and lower saturation */}
                  <div className="flex justify-between items-center w-full">
                    <span className={`inline-block px-3 py-1 rounded-md text-caption font-semibold ${b.labelBg} uppercase tracking-wider`}>
                      {b.label}
                    </span>
                  </div>

                  {/* Center: Hero/Mission details */}
                  <div className="flex flex-col justify-start items-center text-center mt-4">
                    <h3 className={`text-display-lg font-bold text-white tracking-tight leading-none drop-shadow-md glow-title ${b.glowClass}`}>
                      {b.mainName}
                    </h3>
                    <span className="text-title-lg font-semibold text-white/70 tracking-widest uppercase mt-1.5 drop-shadow-sm">
                      {b.year}
                    </span>
                    <p className="text-title-md font-semibold text-white/95 mt-3 drop-shadow-sm">
                      {b.subtitle}
                    </p>
                    <p className="text-body-md font-normal text-white/85 mt-2.5 max-w-[240px] drop-shadow-sm italic">
                      {b.mission}
                    </p>
                  </div>

                  {/* Spacer to push checklist/CTA down (min-h set to 50px for balanced compact layout) */}
                  <div className="flex-1 min-h-[50px]" />

                  {/* Bottom: Features, Pricing & CTA */}
                  <div className="mt-auto">
                    {/* Glassmorphic Features Container */}
                    <div 
                      className="rounded-xl py-2.5 px-4 mb-3.5 border"
                      style={{ 
                        background: 'rgba(0,0,0,0.25)', 
                        backdropFilter: 'blur(16px)', 
                        WebkitBackdropFilter: 'blur(16px)', 
                        borderColor: 'rgba(255,255,255,0.08)' 
                      }}
                    >
                      <ul className="space-y-1.5">
                        {b.features.map((feat, j) => (
                          <li key={j} className="flex items-center gap-2.5 text-body-sm font-semibold text-white/90">
                            <Check 
                              className="w-3.5 h-3.5 stroke-[3.5] shrink-0" 
                              style={{ color: b.checkColor }} 
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Secondary Pricing (Starting at ₹349/month) */}
                    <div className="text-center text-white/50 text-xs font-semibold mb-3.5">
                      Starting at <span className="text-white/90 font-extrabold">{b.price}</span>/month
                    </div>

                    {/* Premium CTA Button */}
                    <button
                      onClick={() => navigate(`/batches/${b.slug}`)}
                      className={`w-full py-3.5 rounded-xl text-white font-bold text-body-md tracking-wide transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer ${b.btnBg}`}
                    >
                      {b.btnText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Feature Strip (Light Glass Container) */}
          <div 
            className="mt-16 p-6 sm:p-8 rounded-2xl bg-slate-50/80 border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 text-slate-800"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-body-md font-bold text-slate-900">AI-Powered Learning</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Smart, Adaptive, Personal.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-body-md font-bold text-slate-900">Proven Results</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Top ranks. Every year.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-body-md font-bold text-slate-900">Personalized Roadmap</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Your path. Your pace.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-body-md font-bold text-slate-900">24×7 Support</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">We're always here.</p>
              </div>
            </div>
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
            <h2 className="text-heading-lg font-bold text-slate-900 text-center">Your Success Journey with PrepEntrance</h2>
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
                  <span className="text-caption font-bold text-blue-600 tracking-wider">Step {s.step}</span>
                  <h4 className="text-title-md font-bold text-slate-900 leading-tight">{s.title}</h4>
                  <p className="text-body-sm font-normal text-slate-400 max-w-[180px]">{s.desc}</p>
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
                  <span className="text-body-sm font-bold text-slate-700">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. TESTIMONIALS — EMBLA AUTOPLAY
      ══════════════════════════════════ */}
      <section id="testimonials" className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-slate-200" />
              <h2 className="text-heading-lg font-bold text-slate-900">What Students Say</h2>
              <span className="h-px w-10 bg-slate-200" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 hover:border-blue-300 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 hover:border-blue-300 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embla Viewport — pause on hover */}
          <div
            className="overflow-hidden py-4 -my-4"
            ref={emblaRef}
            onMouseEnter={() => { isHoveredRef.current = true; }}
            onMouseLeave={() => { isHoveredRef.current = false; }}
          >
            {/* Slide track */}
            <div className="flex gap-0">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  // Each slide:
                  // Desktop (md+)  → 33.33% wide → 3 cards visible
                  // Tablet (sm)    → 50%    wide → 2 cards visible
                  // Mobile (<sm)   → 100%   wide → 1 card visible
                  className="shrink-0 w-full sm:w-1/2 md:w-1/3 pl-5"
                >
                  <div
                    className={`group h-full bg-white border-2 rounded-xl p-5 flex flex-col gap-3
                      transition-all duration-300 ease-out cursor-default
                      hover:-translate-y-1.5 hover:shadow-xl
                      ${ i === activeSlide
                        ? 'border-blue-300 shadow-lg ring-2 ring-blue-50'
                        : 'border-slate-100 shadow-sm hover:border-blue-200'
                      }`}
                    style={{ minHeight: '190px' }}
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-body-sm text-slate-600 font-semibold leading-relaxed italic flex-1">
                      "{t.text}"
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <div className="text-body-sm font-bold text-slate-900">{t.name}</div>
                        <div className="text-caption font-semibold text-slate-400 mt-0.5">{t.subtitle}</div>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-caption font-bold tracking-wide ${badgeColors[t.badge] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {t.badge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === i ? 'bg-blue-600 w-6' : 'bg-slate-300 hover:bg-slate-400 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. DREAM COLLEGES FINAL CTA
      ══════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl border border-blue-950"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)' }}
          >
            {/* Absolute decorative gradient highlights */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative z-10">
              
              {/* Left Column: Heading and CTAs */}
              <div className="space-y-6 text-left">
                <h2 className="text-heading-xl font-bold text-white leading-tight">
                  Your Dream College Won't Wait.<br />
                  <span className="text-amber-400">Start Preparing Today.</span>
                </h2>
                <p className="text-body-md text-blue-200 font-semibold max-w-xl leading-relaxed">
                  Prepare with India's most advanced AI-powered learning platform.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-body-sm transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    Start Free Practice Test <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const featuresSec = document.getElementById('features');
                      if (featuresSec) {
                        featuresSec.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 text-white font-bold text-body-sm hover:bg-white/5 transition-all active:scale-[0.98]"
                  >
                    Explore AI Tutor
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5 text-caption font-bold text-blue-200/90 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span>No Credit Card Required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span>Instant Access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span>Cancel Anytime</span>
                  </div>
                </div>
              </div>

              {/* Right Column: College Grid Wall */}
              <div className="space-y-5">
                {/* Aspirational Header */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-caption text-amber-400/80 font-bold tracking-wider">‹ Dream. Prepare. Achieve. ›</span>
                </div>

                {/* Category Tabs */}
                <div className="flex justify-center p-1 rounded-2xl bg-white/5 border border-white/10 w-fit mx-auto">
                  {[
                    { key: 'engineering', label: 'Engineering' },
                    { key: 'medical', label: 'Medical' },
                    { key: 'universities', label: 'Universities' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveCollegesTab(tab.key as any)}
                      className={`px-4 py-2 rounded-xl text-caption font-bold tracking-wider transition-all duration-200 ${
                        activeCollegesTab === tab.key
                          ? 'bg-amber-400 text-slate-900 shadow-md'
                          : 'text-blue-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                {/* Dynamically Filtered Grid of 5 Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {collegesData[activeCollegesTab].map((col, index) => {
                    const colSpanClass = index < 3 
                      ? 'col-span-1 sm:col-span-2' 
                      : index === 3 
                        ? 'col-span-1 sm:col-span-3' 
                        : 'col-span-2 sm:col-span-3';

                    return (
                      <div 
                        key={col.name} 
                        className={`relative h-28 sm:h-32 rounded-2xl overflow-hidden group border border-white/5 ${colSpanClass} hover:scale-[1.05] hover:z-20 transition-all duration-300 ease-out shadow-inner cursor-pointer ${
                          activeCollegesTab === 'engineering' 
                            ? 'hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]' 
                            : activeCollegesTab === 'medical'
                              ? 'hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                              : 'hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                        }`}
                      >
                        <img 
                          src={col.img} 
                          alt={col.name} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                        />
                        {/* Consistent dark overlay for text readability (40-60%) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/30 z-10" />
                        
                        <div className="absolute bottom-2.5 left-3.5 z-20 text-left">
                          <h4 className="text-body-sm font-semibold text-white tracking-tight leading-none mb-1">{col.name}</h4>
                          <p className="text-caption font-bold text-amber-300 tracking-wider leading-none">{col.tag}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom: Statistics strip */}
            <div className="border-t border-white/10 mt-12 pt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { val: '25L+', desc: 'Students Trust Us', icon: '👥' },
                { val: '10,000+', desc: 'Practice Questions', icon: '📝' },
                { val: '500+', desc: 'Chapter Tests', icon: '📖' },
                { val: '24×7', desc: 'AI Mentor Support', icon: '🤖' },
                { val: 'Top Results', desc: 'Every Year', icon: '🏆' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 shadow-inner text-left">
                  <span className="text-title-md">{stat.icon}</span>
                  <div>
                    <div className="text-body-lg font-bold text-white leading-tight">{stat.val}</div>
                    <div className="text-caption font-bold text-blue-200 mt-0.5">{stat.desc}</div>
                  </div>
                </div>
              ))}
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
                <div className="brand-logo-container rounded-xl w-12 h-12">
                  <img 
                    src="/prepentrance-logo.png" 
                    alt="PrepEntrance Logo" 
                    className="brand-logo-img" 
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-title-md font-bold text-white tracking-tight">PrepEntrance</span>
                  <span className="text-caption font-bold text-slate-400 tracking-wider mt-0.5">Prepare. Perform. Succeed.</span>
                </div>
              </div>
              <p className="text-body-sm text-slate-400 font-medium leading-relaxed max-w-xs">
                AI-first personalized practice workspace built to help students crack JEE, NEET and CUET.
              </p>
              {/* Follow Us */}
              <div>
                <div className="text-caption font-bold text-slate-500 mb-2">Follow Us</div>
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
              <h4 className="text-caption font-bold text-white tracking-wider">Exams</h4>
              <ul className="space-y-2.5">
                {['JEE', 'NEET', 'CUET'].map((e) => (
                  <li key={e}>
                    <button onClick={() => navigate('/login')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">{e}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="text-caption font-bold text-white tracking-wider">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('/blog')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">Blog</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">Study Material</button>
                </li>
                <li>
                  <button onClick={() => navigate('/practice-tests')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">Mock Tests</button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-caption font-bold text-white tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('/blog')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">About Us</button>
                </li>
                <li>
                  <button onClick={() => navigate('/blog')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">Blog</button>
                </li>
                <li>
                  <button onClick={() => navigate('/contact')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">Contact Us</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-body-sm text-slate-400 font-semibold hover:text-white transition-colors">Careers</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption font-semibold text-slate-500">
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
