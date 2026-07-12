import React, { useState, useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingNav from '@/components/landing/LandingNav';
import { AarambhIllustration, AarohanIllustration, ShikharIllustration } from '@/components/landing/BatchIllustrations';
import {
  Bot, LineChart, Brain, Clock, ChevronRight, Check, FileText, Users, Trophy,
  ChevronLeft, Settings, Plus, Building, Facebook, Instagram, Youtube, Twitter,
  Star, ArrowRight, TrendingUp, Calendar, Zap, CheckCircle2, BookOpen, HelpCircle,
  Target, MessageSquare, BarChart2, Layers, Sparkles, MapPin, Rocket, Shield,
  Atom, Stethoscope, Headphones,
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
// FloatingStars removed — decorative noise with no consumer value

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

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
          1. HERO SECTION
      \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section className="bg-white border-b border-slate-100 pt-6 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] items-center gap-0">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-4 py-10 pr-8 z-10 relative">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold tracking-widest shadow-sm">
                <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
                AI-POWERED PREPARATION PLATFORM
              </div>

              {/* Headline — safe zone, NEVER overlapped by image */}
              <h1 className="text-display-lg font-bold text-slate-900 leading-[1.08] tracking-tight">
                Crack JEE, NEET <br />
                &amp; CUET with <br />
                <span className="text-blue-600">
                  AI-Powered Learning
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-[15px] text-slate-500 leading-relaxed font-normal max-w-xs">
                Smart study plans, PYQs, mock tests &amp; AI doubt solving to help you study better, not just harder.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/signup')}
                  id="hero-cta-primary"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 active:scale-[0.98]"
                >
                  Start Your Preparation <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {}}
                  id="hero-cta-secondary"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-700 font-bold text-sm hover:text-blue-600 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center shrink-0">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-blue-600 border-b-[5px] border-b-transparent ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Trust microcopy */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Instant Access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Cancel Anytime
                </span>
              </div>

              {/* Compact inline stats panel */}
              <div className="flex items-start gap-0 pt-2 border-t border-slate-100">
                <div className="flex-1 flex flex-col gap-0.5 pr-4 border-r border-slate-100">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div className="text-[16px] font-black text-slate-900 leading-none">1 Lakh+</div>
                  <div className="text-[10px] font-medium text-slate-400 leading-tight">Aspirants Trust Us</div>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 px-4 border-r border-slate-100">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <div className="text-[16px] font-black text-slate-900 leading-none">10K+</div>
                  <div className="text-[10px] font-medium text-slate-400 leading-tight">Mock Tests Daily</div>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 px-4 border-r border-slate-100">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <div className="text-[16px] font-black text-slate-900 leading-none">50 Lakh+</div>
                  <div className="text-[10px] font-medium text-slate-400 leading-tight">PYQs Practiced</div>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 pl-4">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <div className="text-[16px] font-black text-slate-900 leading-none">4.8/5</div>
                  <div className="text-[10px] font-medium text-slate-400 leading-tight">Student Rating</div>
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN: Wide landscape illustration ── */}
            <div className="relative w-full flex items-end justify-end overflow-hidden" style={{ height: '520px' }}>
              <img
                src="/images/hero_wide.png"
                alt="PrepEntrance students studying with AI-powered platform, laptop dashboard, PYQ books"
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  /* Soft left edge fade — text region is completely clear */
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 12%, black 28%, black 100%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 12%, black 28%, black 100%)',
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURE STRIP
      ══════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0 md:divide-x divide-slate-100 bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl py-4">
            
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left px-5 gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900 leading-tight">AI Study Planner</div>
                <div className="text-[11px] font-medium text-slate-500 leading-snug mt-0.5">Personalized plan for your success</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left px-5 gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900 leading-tight">Smart Practice</div>
                <div className="text-[11px] font-medium text-slate-500 leading-snug mt-0.5">AI-generated questions &amp; PYQ practice</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left px-5 gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900 leading-tight">Mock Test Series</div>
                <div className="text-[11px] font-medium text-slate-500 leading-snug mt-0.5">Real exam interface &amp; analysis</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left px-5 gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900 leading-tight">AI Doubt Solving</div>
                <div className="text-[11px] font-medium text-slate-500 leading-snug mt-0.5">24×7 AI + Expert Doubt Support</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left px-5 gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900 leading-tight">Performance Tracker</div>
                <div className="text-[11px] font-medium text-slate-500 leading-snug mt-0.5">Detailed analytics to improve every day</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          2. OUR EXAMS
      ══════════════════════════════════ */}
      <section id="exams" className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-px w-12 bg-slate-200" />
              <h2 className="text-heading-lg font-bold text-slate-900">Our Exams</h2>
              <span className="h-px w-12 bg-slate-200" />
            </div>
            <p className="text-body-md text-slate-500 font-medium">Choose your exam goal. We'll help you get there.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* JEE CARD */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden min-h-[340px]">
              <div className="flex flex-col sm:flex-row gap-6 relative z-10 mb-6 flex-1">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                    <Atom className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">ENGINEERING</span>
                  </div>
                  
                  <h3 className="text-[40px] font-extrabold text-slate-900 leading-none tracking-tight group-hover:text-blue-600 transition-colors">JEE</h3>
                  
                  <p className="text-body-sm text-slate-600 font-medium leading-relaxed max-w-[240px]">
                    Gateway to IITs, NITs & Top Engineering Colleges
                  </p>
                  
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-blue-600 block mb-2 tracking-widest uppercase">Career Paths</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400" />Computer Science</div>
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400" />Mechanical Engineering</div>
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400" />Electrical Engineering</div>
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400" />AI & Data Science</div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex w-1/3 relative shrink-0 items-end justify-center">
                  <div className="absolute inset-0 bg-blue-50/50 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="/images/card_jee.png" 
                      alt="JEE Engineering" 
                      className="w-[120%] h-[120%] object-contain opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300 drop-shadow-md"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/jee')}
                className="relative z-10 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-body-md hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-600/20 active:scale-[0.98]"
              >
                Explore JEE <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* NEET CARD */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden min-h-[340px]">
              <div className="flex flex-col sm:flex-row gap-6 relative z-10 mb-6 flex-1">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">MEDICAL</span>
                  </div>
                  
                  <h3 className="text-[40px] font-extrabold text-slate-900 leading-none tracking-tight group-hover:text-emerald-600 transition-colors">NEET</h3>
                  
                  <p className="text-body-sm text-slate-600 font-medium leading-relaxed max-w-[240px]">
                    Gateway to AIIMS, JIPMER & Premier Medical Colleges
                  </p>
                  
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-emerald-600 block mb-2 tracking-widest uppercase">Career Paths</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-400" />MBBS</div>
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-400" />Pharmacy</div>
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-400" />BDS</div>
                      <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-400" />Healthcare Science</div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex w-1/3 relative shrink-0 items-end justify-center">
                  <div className="absolute inset-0 bg-emerald-50/50 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="/images/card_neet.png" 
                      alt="NEET Medical" 
                      className="w-[120%] h-[120%] object-contain opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300 drop-shadow-md"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/neet')}
                className="relative z-10 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-body-md hover:bg-emerald-700 transition-all duration-200 shadow-md shadow-emerald-600/20 active:scale-[0.98]"
              >
                Explore NEET <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* ══════════════════════════════════
          4. OUR BATCHES
      ══════════════════════════════════ */}
      <section id="batches" className="py-16 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="h-[2px] w-8 bg-blue-600 rounded-full" />
              <h2 className="text-heading-lg font-extrabold text-slate-900 tracking-tight">Our Batches</h2>
              <span className="h-[2px] w-8 bg-orange-500 rounded-full" />
            </div>
            <p className="text-body-md text-slate-500 font-medium">Choose the perfect plan for your JEE / NEET preparation journey.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AARAMBH */}
            <div className="relative bg-white border border-blue-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              <div className="p-5 flex-1 flex flex-col xl:flex-row gap-4 border-b border-slate-100 bg-gradient-to-br from-white to-blue-50/30">
                {/* Left Identity */}
                <div className="flex-1 flex flex-col items-start">
                  <div className="bg-blue-600 text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded mb-3">
                    1 MONTH PLAN
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight mb-1">AARAMBH</h3>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-blue-700 mb-2">START YOUR PREPARATION</div>
                  
                  <div className="text-[10px] font-bold text-slate-500 mb-3">
                    JEE <span className="mx-1 text-slate-300">|</span> NEET <span className="mx-1 text-slate-300">|</span> CUET
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {['AI Plan', 'PYQs', 'DPPs', 'AI Mentor'].map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded border border-blue-100 bg-white text-[10px] font-bold text-slate-600">{c}</span>
                    ))}
                  </div>
                </div>
                
                {/* Right Dashboard */}
                <div className="w-full xl:w-[150px] shrink-0 bg-white rounded-xl border border-blue-100 p-3 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-blue-600 mb-2 uppercase tracking-widest">DAY 01 PLAN</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-1"><span>Physics</span><span className="text-blue-600">35%</span></div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[35%] rounded-full" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-1"><span>Chemistry</span><span className="text-blue-600">60%</span></div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[60%] rounded-full" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-1"><span>Mathematics</span><span className="text-blue-600">45%</span></div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[45%] rounded-full" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[8px] font-bold text-slate-500">
                    <span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> DPP 01</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 45 min</span>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 flex items-center justify-between bg-white">
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">₹349 <span className="text-xs font-bold text-slate-500">/ month</span></div>
                </div>
                <button onClick={() => navigate('/batches/aarambh')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors">
                  Explore Aarambh <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AAROHAN */}
            <div className="relative bg-white border border-purple-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-4 bg-purple-600 text-white text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-b shadow-sm z-10 flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-white" /> MOST POPULAR
              </div>
              
              <div className="p-5 flex-1 flex flex-col xl:flex-row gap-4 border-b border-slate-100 bg-gradient-to-br from-white to-purple-50/30">
                {/* Left Identity */}
                <div className="flex-1 flex flex-col items-start mt-2 xl:mt-0">
                  <div className="bg-purple-600 text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded mb-3">
                    12 MONTH PLAN
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight mb-1">AAROHAN</h3>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-purple-700 mb-2">BOOST YOUR RANK</div>
                  
                  <div className="text-[10px] font-bold text-slate-500 mb-3">
                    JEE <span className="mx-1 text-slate-300">|</span> CLASS 12
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {['Mock Tests', 'PYQs', 'Rank Predictor', 'AI Mentor'].map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded border border-purple-100 bg-white text-[10px] font-bold text-slate-600">{c}</span>
                    ))}
                  </div>
                </div>
                
                {/* Right Dashboard */}
                <div className="w-full xl:w-[160px] shrink-0 bg-white rounded-xl border border-purple-100 p-3 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-purple-600 mb-2 uppercase tracking-widest">MOCK TEST PROGRESS</div>
                    <div className="flex items-end justify-between h-12 mb-1 px-1">
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[9px] font-bold text-slate-700">142</div>
                        <div className="w-4 bg-purple-200 rounded-t-sm" style={{ height: '30px' }} />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[9px] font-bold text-slate-700">181</div>
                        <div className="w-4 bg-purple-400 rounded-t-sm" style={{ height: '38px' }} />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[9px] font-bold text-purple-700">213</div>
                        <div className="w-4 bg-purple-600 rounded-t-sm" style={{ height: '48px' }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-[7px] font-bold text-slate-400 uppercase">
                      <span>Mock 01</span><span>Mock 05</span><span>Mock 10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-3 pt-2 border-t border-slate-100 text-center">
                    <div>
                      <div className="text-[7px] font-bold text-slate-400">PYQ Acc.</div>
                      <div className="text-[10px] font-bold text-slate-700">84%</div>
                    </div>
                    <div>
                      <div className="text-[7px] font-bold text-slate-400">Physics</div>
                      <div className="text-[10px] font-bold text-emerald-600">+12%</div>
                    </div>
                    <div>
                      <div className="text-[7px] font-bold text-slate-400">Weak Ch.</div>
                      <div className="text-[10px] font-bold text-rose-600">06</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 flex items-center justify-between bg-white">
                <div className="flex flex-col">
                  <div className="text-[10px] font-bold text-slate-400 line-through">₹4,188</div>
                  <div className="text-2xl font-black text-slate-900 leading-none flex items-end gap-1">
                    ₹3,839 <span className="text-xs font-bold text-slate-500 pb-0.5">/ 12 months</span>
                  </div>
                </div>
                <button onClick={() => navigate('/batches/aarohan')} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors">
                  Explore Aarohan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SHIKHAR */}
            <div className="relative bg-white border border-orange-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              <div className="p-5 flex-1 flex flex-col xl:flex-row gap-4 border-b border-slate-100 bg-gradient-to-br from-white to-orange-50/30">
                {/* Left Identity */}
                <div className="flex-1 flex flex-col items-start">
                  <div className="bg-orange-500 text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded mb-3">
                    24 MONTH PLAN
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight mb-1">SHIKHAR</h3>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-orange-600 mb-2">ACHIEVE SELECTION</div>
                  
                  <div className="text-[10px] font-bold text-slate-500 mb-3">
                    JEE <span className="mx-1 text-slate-300">|</span> NEET
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {['Full Syllabus Tests', 'Rank Predictor', 'Personal Mentorship'].map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded border border-orange-100 bg-white text-[10px] font-bold text-slate-600">{c}</span>
                    ))}
                  </div>
                </div>
                
                {/* Right Dashboard */}
                <div className="w-full xl:w-[150px] shrink-0 bg-white rounded-xl border border-orange-100 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <div className="text-[9px] font-bold text-orange-600 mb-3 uppercase tracking-widest">LATEST TEST RESULT</div>
                    
                    <div className="space-y-2 relative z-10">
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Percentile</div>
                        <div className="text-sm font-black text-orange-600">99.46%ile</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">AIR (All India Rank)</div>
                        <div className="text-sm font-black text-slate-800">1,243</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Score</div>
                        <div className="text-sm font-black text-slate-800">275 <span className="text-[10px] font-bold text-slate-400">/ 300</span></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Background Trophy / Element */}
                  <div className="absolute -right-2 -bottom-2 opacity-20 pointer-events-none">
                    <Trophy className="w-20 h-20 text-orange-500" />
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 flex items-center justify-between bg-white">
                <div className="flex flex-col">
                  <div className="text-[10px] font-bold text-slate-400 line-through">₹8,376</div>
                  <div className="text-2xl font-black text-slate-900 leading-none flex items-end gap-1">
                    ₹7,329 <span className="text-xs font-bold text-slate-500 pb-0.5">/ 24 months</span>
                  </div>
                </div>
                <button onClick={() => navigate('/batches/shikhar')} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors">
                  Explore Shikhar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Trust Strip */}
          <div className="mt-8 mb-4 rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between p-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Item 1 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Expert Faculty</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">Learn from top teachers<br/>from Kota.</p>
              </div>
            </div>
            
            {/* Item 2 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <TrendingUp className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Proven Results</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">Trusted by lakhs of<br/>aspirants across India.</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Structured Preparation</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">Study, practice & test in<br/>perfect sequence.</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">24×7 Doubt Support</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">AI + Human experts<br/>whenever you need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. SUCCESS JOURNEY
      ══════════════════════════════════ */}
      <section id="journey" className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-caption font-bold text-blue-600 tracking-widest uppercase mb-2">How It Works</p>
            <h2 className="text-heading-lg font-extrabold text-slate-900 leading-tight">Your Success Journey</h2>
            <p className="text-body-md text-slate-500 font-normal mt-2 max-w-xl">A structured, AI-guided path from where you are to where you want to be.</p>
          </div>

          {/* Steps — vertical timeline on mobile, horizontal on desktop */}
          <div className="relative">
            {/* Desktop connector line */}
            <div className="hidden md:block absolute top-6 left-[9%] right-[9%] h-px bg-slate-100 z-0" />

            <div className="grid md:grid-cols-5 gap-y-8 gap-x-4 relative z-10">
              {journeySteps.map((s, i) => (
                <div key={i} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 md:text-center">
                  {/* Number circle */}
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                    <span className="text-white font-black text-body-sm">{s.step}</span>
                  </div>
                  <div>
                    <h4 className="text-title-sm font-bold text-slate-900 leading-tight mb-1">{s.title}</h4>
                    <p className="text-body-sm font-normal text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key capabilities strip */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {[
              { icon: <Bot className="w-5 h-5" />, label: 'AI-Powered Learning' },
              { icon: <FileText className="w-5 h-5" />, label: 'Unlimited Practice' },
              { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Personalised Plans' },
              { icon: <BarChart2 className="w-5 h-5" />, label: 'Detailed Analytics' },
              { icon: <Clock className="w-5 h-5" />, label: '24×7 AI Mentor' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white px-5 py-4">
                <div className="text-blue-600 shrink-0">{b.icon}</div>
                <span className="text-body-sm font-semibold text-slate-700">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. TESTIMONIALS — EMBLA AUTOPLAY
      ══════════════════════════════════ */}
      <section id="testimonials" className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-caption font-bold text-blue-600 tracking-widest uppercase mb-2">Student Reviews</p>
              <h2 className="text-heading-lg font-extrabold text-slate-900">What Students Say</h2>
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
                    className={`group h-full bg-white border rounded-xl p-6 flex flex-col gap-4
                      transition-all duration-300 ease-out cursor-default
                      hover:-translate-y-1 hover:shadow-md
                      ${ i === activeSlide
                        ? 'border-blue-200 shadow-md'
                        : 'border-slate-100 shadow-sm hover:border-slate-200'
                      }`}
                    style={{ minHeight: '210px' }}
                  >
                    {/* Stars — SVG, no emoji */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-body-sm text-slate-600 font-normal leading-relaxed flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        {/* Initials avatar */}
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-caption font-black text-blue-600">{t.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-body-sm font-semibold text-slate-900">{t.name}</div>
                          <div className="text-caption font-medium text-slate-400 mt-0.5">{t.subtitle}</div>
                        </div>
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
                { val: '25L+', desc: 'Students Trust Us', icon: <Users className="w-5 h-5" /> },
                { val: '10,000+', desc: 'Practice Questions', icon: <FileText className="w-5 h-5" /> },
                { val: '500+', desc: 'Chapter Tests', icon: <BookOpen className="w-5 h-5" /> },
                { val: '24×7', desc: 'AI Mentor Support', icon: <Bot className="w-5 h-5" /> },
                { val: 'Top Results', desc: 'Every Year', icon: <Trophy className="w-5 h-5" /> }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 shadow-inner text-left">
                  <div className="text-blue-300 shrink-0">{stat.icon}</div>
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
