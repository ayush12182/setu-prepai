import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Check, ArrowRight, FileText, ClipboardList, Sparkles, Calendar, BookOpen, Loader2 
} from 'lucide-react';
import LandingNav from '@/components/landing/LandingNav';
import { useResources, useBookmarks } from '@/hooks/useResources';
import { useAuth } from '@/contexts/AuthContext';
import { EXAM_META, type Exam, type ClassLevel } from '@/types/hub';
import { ResourceCard } from '@/components/hub/ResourceCard';

// Helper to parse URL params
function parseParams(exam?: string, cls?: string): { exam: Exam; cls: ClassLevel } {
  const validExam = (s?: string): Exam =>
    s === 'neet' ? 'neet' : s === 'cuet' ? 'cuet' : 'jee';
  const parseClass = (s?: string): ClassLevel => {
    if (s === 'class-12') return '12';
    if (s === 'droppers') return 'dropper';
    return '11';
  };
  return { exam: validExam(exam), cls: parseClass(cls) };
}

// Exam Details Copy mapping
const EXAM_DETAILS = {
  jee: {
    title: 'JEE Main & Advanced 2027 Online Coaching and Complete Preparation',
    desc: 'Crack IIT JEE with India\'s complete AI-powered learning workspace. Get structured academic schedules, live doubt-solving sessions, comprehensive mock test series (AITS), detailed performance diagnostics, and 24x7 guidance from our AI Prep Mentor.',
    cohortName: 'LAKSHYA JEE 2.0 2027',
    cohortTag: 'Class 12 + JEE Prep • Ab Ek Saath',
    themeColor: '#2563eb',
    gradient: 'from-blue-600 to-indigo-700',
    hoverBorder: 'hover:border-blue-200',
    lightBg: 'bg-blue-50/50',
    bulletColor: 'text-blue-500',
    badgeBg: 'bg-blue-600'
  },
  neet: {
    title: 'NEET UG 2027 Online Coaching and Complete Medical Entrance Prep',
    desc: 'Prepare for NEET UG with interactive visual content, NCERT-focused learning schedules, chapter-wise daily practice sets (DPPs), mock tests on official pattern, and instant AI doubt clearing for Physics, Chemistry, Botany, and Zoology.',
    cohortName: 'LAKSHYA NEET 2.0 2027',
    cohortTag: 'Class 12 + NEET Prep • Ab Ek Saath',
    themeColor: '#10b981',
    gradient: 'from-emerald-600 to-teal-700',
    hoverBorder: 'hover:border-emerald-200',
    lightBg: 'bg-emerald-50/50',
    bulletColor: 'text-emerald-500',
    badgeBg: 'bg-emerald-600'
  },
  cuet: {
    title: 'CUET 2027 Complete General Test, Domain Subjects & Languages Prep',
    desc: 'Achieve admission to top Central Universities with customized study materials, domain-specific mock exams, general aptitude preparation kits, language papers revision schedules, and AI mentor accountability checklists.',
    cohortName: 'AAROHAN CUET 2.0 2027',
    cohortTag: 'Domain Subjects + GT + English Prep',
    themeColor: '#8b5cf6',
    gradient: 'from-purple-600 to-indigo-700',
    hoverBorder: 'hover:border-purple-200',
    lightBg: 'bg-purple-50/50',
    bulletColor: 'text-purple-500',
    badgeBg: 'bg-purple-600'
  }
};

const ExamHubPage: React.FC = () => {
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  const examParam = parts[0];
  const classParam = parts[1] || (examParam === 'cuet' ? 'class-12' : 'class-11');
  
  const { exam, cls } = parseParams(examParam, classParam);
  const { user } = useAuth();

  const details = EXAM_DETAILS[exam];
  const meta = EXAM_META[exam];

  const [activeSubject, setActiveSubject] = useState('');
  const [search, setSearch] = useState('');

  const { resources, loading } = useResources({
    exam,
    class: cls,
    subject: activeSubject || undefined,
    search: search || undefined,
  });

  const { bookmarks, toggle: toggleBookmark } = useBookmarks(user?.id ?? null);

  // Tabs for main exams
  const examTabs = [
    { key: 'jee', label: 'IIT JEE' },
    { key: 'neet', label: 'NEET UG' },
    { key: 'cuet', label: 'CUET (UG)' },
  ];

  // Cohort Class filter
  const classFilter = [
    { key: 'class-11', label: 'Class 11' },
    { key: 'class-12', label: 'Class 12' },
    { key: 'droppers', label: 'Droppers' },
  ];

  const handleClassChange = (newCls: string) => {
    navigate(`/${exam}/${newCls}`);
  };

  const handleView = (r: any) => {
    if (r.content_url) window.open(r.content_url, '_blank');
  };

  // Scroll to Free Study Materials section
  const handleScrollToMaterials = () => {
    const el = document.getElementById('study-materials');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Premium Header */}
      <LandingNav />

      {/* Breadcrumb Trail */}
      <div className="bg-slate-50 border-b border-slate-100 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="cursor-pointer hover:text-[#2563EB]" onClick={() => navigate('/')}>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 capitalize">{exam === 'jee' ? 'IIT JEE' : exam.toUpperCase()}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-bold">Preparation Hub</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Core Tab Switcher */}
        <div className="flex border-b border-slate-100 gap-6 mb-8">
          {examTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(`/${tab.key}`)}
              className={`pb-3 font-extrabold text-sm border-b-2 transition-all cursor-pointer ${
                exam === tab.key
                  ? `border-[${details.themeColor}] text-slate-900`
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              style={exam === tab.key ? { borderBottomColor: details.themeColor } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Promo Hero Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start mb-10">
          
          {/* Left Column: Heading Copy */}
          <div className="lg:col-span-5 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {details.title}
            </h1>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {details.desc}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                ⚡ AI-First Learning
              </span>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                🎯 Exam Syllabus Mapped
              </span>
            </div>
          </div>

          {/* Right Column: Premium Promo Banner Card */}
          <div className="lg:col-span-7">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${details.gradient} text-white shadow-lg p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center`}>
              
              {/* Decorative graphic background */}
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Banner Left: Details */}
              <div className="flex-1 space-y-4 z-10">
                <div>
                  <span className={`inline-block text-[10px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded ${details.badgeBg}`}>
                    PrepEntrance Cohort
                  </span>
                  <h3 className="text-2xl font-black mt-2 tracking-tight">{details.cohortName}</h3>
                  <p className="text-xs font-bold text-white/80">{details.cohortTag}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-white stroke-[3]" /> Live Lectures</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-white stroke-[3]" /> DPP Discussion</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-white stroke-[3]" /> Mock Tests & AITS</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-white stroke-[3]" /> AI Mentor Support</div>
                  <div className="flex items-center gap-1.5 col-span-2"><Check className="w-3.5 h-3.5 text-white stroke-[3]" /> Digital Preparation Kit</div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div>
                    <span className="text-2xl font-black">₹349</span>
                    <span className="text-[10px] font-bold opacity-80 ml-0.5">/month</span>
                  </div>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    Enroll Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Banner Right: Student Image */}
              <div className="w-36 h-36 shrink-0 relative flex items-center justify-center bg-white/10 rounded-full border border-white/20 p-2 overflow-hidden shadow-inner">
                <img 
                  src="/images/student_standing.png" 
                  alt="Student Standing" 
                  className="h-28 w-auto object-contain mt-3 hover:scale-105 transition-transform duration-300"
                />
              </div>

            </div>
          </div>

        </div>

        {/* 4 Action Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          
          {/* Card 1: PDF Bank */}
          <div 
            onClick={handleScrollToMaterials}
            className="bg-rose-50/50 hover:bg-rose-50 border-2 border-rose-100/30 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">PDF Bank</h4>
              <p className="text-[11px] font-medium text-slate-500">Access free notes & revision sheets</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 mt-4">
              Access PDF Bank <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Test Series */}
          <div 
            onClick={() => navigate(user ? '/test' : '/auth')}
            className="bg-emerald-50/50 hover:bg-emerald-50 border-2 border-emerald-100/30 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Test Series</h4>
              <p className="text-[11px] font-medium text-slate-500">Explore pattern mock tests & keys</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 mt-4">
              Explore Tests <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: AI Mentor */}
          <div 
            onClick={() => navigate(user ? '/ask-prepentrance' : '/auth')}
            className="bg-amber-50/50 hover:bg-amber-50 border-2 border-amber-100/30 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">AI Mentor</h4>
              <p className="text-[11px] font-medium text-slate-500">24x7 instant doubt solving tutor</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 mt-4">
              Talk to Mentor <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Study Planner */}
          <div 
            onClick={() => navigate(user ? '/student-hub' : '/auth')}
            className="bg-blue-50/50 hover:bg-blue-50 border-2 border-blue-100/30 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Study Planner</h4>
              <p className="text-[11px] font-medium text-slate-500">Track milestones & study daily plans</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 mt-4">
              Open Planner <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Free Study Materials Section */}
        <div id="study-materials" className="border-t border-slate-100 pt-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Free PDF Bank & Study Materials</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Select class and filters to explore dynamic resources</p>
            </div>

            {/* Class tabs switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {classFilter.map((cf) => (
                <button
                  key={cf.key}
                  onClick={() => handleClassChange(cf.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    classParam === cf.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter strip */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveSubject('')}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeSubject === ''
                  ? `bg-slate-900 text-white border-slate-900`
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Subjects
            </button>
            {meta.subjects.map((sub) => (
              <button
                key={sub.key}
                onClick={() => setActiveSubject(sub.key)}
                className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeSubject === sub.key
                    ? `bg-slate-900 text-white border-slate-900`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Search bar inside section */}
          <div className="max-w-md mb-6">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search formulas, PYQs, and topic notes..."
                className="w-full text-xs font-semibold px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
            </div>
          </div>

          {/* Resources listing */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: details.themeColor }} />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <BookOpen className="w-8 h-8 text-slate-400 mb-3" />
              <p className="text-sm font-bold text-slate-900">No resources found</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Try selecting a different subject, class tab, or refining your search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((r, i) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  isBookmarked={bookmarks.has(r.id)}
                  onBookmark={user ? toggleBookmark : undefined}
                  onView={handleView}
                  delay={i * 0.05}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center h-12">
                  <img src="/prepentrance-logo.png" alt="PrepEntrance Logo" className="h-8 w-auto object-contain" />
                </div>
                <div>
                  <span className="font-sans font-bold text-lg text-white tracking-tight">PrepEntrance</span>
                  <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mt-1">Practice. Analyze. Improve.</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                AI-first personalized practice workspace built to help students crack competitive exams like JEE, NEET and CUET.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Exams</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-semibold">
                <li><a onClick={() => navigate('/jee')} className="hover:text-white transition-colors cursor-pointer">IIT JEE</a></li>
                <li><a onClick={() => navigate('/neet')} className="hover:text-white transition-colors cursor-pointer">NEET UG</a></li>
                <li><a onClick={() => navigate('/cuet')} className="hover:text-white transition-colors cursor-pointer">CUET (UG)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-semibold">
                <li><a onClick={handleScrollToMaterials} className="hover:text-white transition-colors cursor-pointer">PDF Notes Bank</a></li>
                <li><a onClick={() => navigate('/signup')} className="hover:text-white transition-colors cursor-pointer">Practice Sets</a></li>
                <li><a onClick={() => navigate('/signup')} className="hover:text-white transition-colors cursor-pointer">Test Series</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-semibold">
                <li><a onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</a></li>
                <li><a href="mailto:support@prepentrance.com" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500">
            <span>© {new Date().getFullYear()} PrepEntrance. All rights reserved.</span>
            <span>Made with ❤️ for Indian students</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExamHubPage;
