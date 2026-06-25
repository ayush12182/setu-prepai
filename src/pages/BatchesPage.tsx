import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import { Check, ArrowRight, Clock, Users, Globe, Smartphone } from 'lucide-react';

const batches = [
  // JEE
  {
    slug: 'aarambh-2028',
    exam: 'jee',
    name: 'AARAMBH 2028',
    tag: 'Class 11 Students',
    tagBg: 'bg-blue-600',
    headline: 'Your JEE Journey Starts Here.',
    sub: 'Built for Class 11 students beginning their IIT JEE preparation from the ground up.',
    mountain: '/images/mountain_blue.png',
    overlayFrom: '#0f1e4a',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    borderColor: 'border-blue-200',
    accentText: 'text-blue-600',
    duration: '2 Years',
    target: 'JEE Main + Advanced 2028',
    highlights: ['Concept Building', 'NCERT Mastery', 'PYQ Exposure', 'AI Guided Learning'],
    checkColor: '#60a5fa',
    classLevel: '11'
  },
  {
    slug: 'aarohan-2027',
    exam: 'jee',
    name: 'AAROHAN 2027',
    tag: 'Class 12 Students',
    tagBg: 'bg-purple-600',
    headline: 'The Year That Decides Your Rank.',
    sub: 'Designed for Class 12 students targeting JEE 2027 while managing Board exams.',
    mountain: '/images/mountain_purple.png',
    overlayFrom: '#2e0766',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    borderColor: 'border-purple-200',
    accentText: 'text-purple-600',
    duration: '1 Year',
    target: 'JEE Main + Advanced 2027',
    highlights: ['Boards + JEE Balance', 'High Weightage Chapters', 'Revision Framework', 'PYQ Analysis'],
    checkColor: '#a855f7',
    classLevel: '12'
  },
  {
    slug: 'shikhar-2027',
    exam: 'jee',
    name: 'SHIKHAR 2027',
    tag: 'Droppers Batch',
    tagBg: 'bg-orange-500',
    headline: 'One More Year. One Last Shot.',
    sub: 'Built for serious JEE droppers who want a structured, high-intensity final attempt.',
    mountain: '/images/mountain_orange.png',
    overlayFrom: '#431407',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-orange-500 hover:bg-orange-600',
    borderColor: 'border-orange-200',
    accentText: 'text-orange-600',
    duration: '1 Year',
    target: 'JEE Main + Advanced 2027',
    highlights: ['Fast-Paced Schedule', 'High Intensity Practice', 'PYQ-First Strategy', 'AI Accountability'],
    checkColor: '#fb923c',
    classLevel: 'dropper'
  },

  // NEET
  {
    slug: 'aarambh-neet-2028',
    exam: 'neet',
    name: 'AARAMBH NEET 2028',
    tag: 'Class 11 Students',
    tagBg: 'bg-emerald-600',
    headline: 'Your Medical Journey Starts Here.',
    sub: 'Built for Class 11 students beginning their NEET UG preparation with focus on foundations.',
    mountain: '/images/mountain_blue.png',
    overlayFrom: '#064e3b',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    borderColor: 'border-emerald-200',
    accentText: 'text-emerald-600',
    duration: '2 Years',
    target: 'NEET UG 2028',
    highlights: ['Biology NCERT Deep-Dive', 'Physics & Chemistry Concepts', 'Diagram-based practice', 'AI Doubt Solver'],
    checkColor: '#34d399',
    classLevel: '11'
  },
  {
    slug: 'aarohan-neet-2027',
    exam: 'neet',
    name: 'AAROHAN NEET 2027',
    tag: 'Class 12 Students',
    tagBg: 'bg-emerald-700',
    headline: 'Master NEET UG in One Year.',
    sub: 'Comprehensive Class 12 & Boards coverage with parallel NEET UG practice and mock trials.',
    mountain: '/images/mountain_purple.png',
    overlayFrom: '#065f46',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-emerald-700 hover:bg-emerald-800',
    borderColor: 'border-emerald-300',
    accentText: 'text-emerald-700',
    duration: '1 Year',
    target: 'NEET UG 2027',
    highlights: ['Boards + NEET Balancing', 'High Weightage Chapters', 'Detailed NCERT Analytics', 'PYQ Question bank'],
    checkColor: '#10b981',
    classLevel: '12'
  },
  {
    slug: 'shikhar-neet-2027',
    exam: 'neet',
    name: 'SHIKHAR NEET 2027',
    tag: 'Droppers Batch',
    tagBg: 'bg-teal-600',
    headline: 'Unlock Your Dream Medical Seat.',
    sub: 'Designed for NEET droppers wanting rigorous gap coverage, weakness analytics and speed building.',
    mountain: '/images/mountain_orange.png',
    overlayFrom: '#115e59',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-teal-600 hover:bg-teal-700',
    borderColor: 'border-teal-200',
    accentText: 'text-teal-600',
    duration: '1 Year',
    target: 'NEET UG 2027',
    highlights: ['Gap Repair focus', 'Speed and accuracy drills', 'Complete Biology NCERT tests', '24x7 AI Mentor support'],
    checkColor: '#14b8a6',
    classLevel: 'dropper'
  },

  // CUET
  {
    slug: 'aarambh-cuet-2028',
    exam: 'cuet',
    name: 'AARAMBH CUET 2028',
    tag: 'Class 11 Students',
    tagBg: 'bg-purple-600',
    headline: 'Target Central Universities Early.',
    sub: 'For Class 11 students building core domain fundamentals and general aptitude early.',
    mountain: '/images/mountain_blue.png',
    overlayFrom: '#4c1d95',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    borderColor: 'border-purple-200',
    accentText: 'text-purple-600',
    duration: '2 Years',
    target: 'CUET UG 2028',
    highlights: ['Domain Fundamentals', 'General Test Prep', 'Language foundations', 'AI Study Planner'],
    checkColor: '#c084fc',
    classLevel: '11'
  },
  {
    slug: 'aarohan-cuet-2027',
    exam: 'cuet',
    name: 'AAROHAN CUET 2027',
    tag: 'Class 12 Students',
    tagBg: 'bg-indigo-600',
    headline: 'Crack CUET Domain & General Tests.',
    sub: 'Focused preparation for Domain Subjects, General Aptitude and Languages for Class 12.',
    mountain: '/images/mountain_purple.png',
    overlayFrom: '#3730a3',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-indigo-600 hover:bg-indigo-700',
    borderColor: 'border-indigo-200',
    accentText: 'text-indigo-600',
    duration: '1 Year',
    target: 'CUET UG 2027',
    highlights: ['Domain + Language + General Test', 'Class 12 Board overlap', 'CUET mock test simulator', 'AI revision engine'],
    checkColor: '#818cf8',
    classLevel: '12'
  },
  {
    slug: 'shikhar-cuet-2027',
    exam: 'cuet',
    name: 'SHIKHAR CUET 2027',
    tag: 'Droppers Batch',
    tagBg: 'bg-violet-600',
    headline: 'Get into Your Dream Central College.',
    sub: 'Full-year syllabus acceleration and mock test drill series for CUET droppers and gap-year takers.',
    mountain: '/images/mountain_orange.png',
    overlayFrom: '#5c10a3',
    price: '₹349',
    unit: '/month',
    btnBg: 'bg-violet-600 hover:bg-violet-700',
    borderColor: 'border-violet-200',
    accentText: 'text-violet-600',
    duration: '1 Year',
    target: 'CUET UG 2027',
    highlights: ['Rigorous Domain Syllabus', 'Full-Length GT Mock Tests', 'Personalized daily planning', 'AI gap tracking'],
    checkColor: '#a78bfa',
    classLevel: 'dropper'
  }
];

const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = React.useState<'all' | 'jee' | 'neet' | 'cuet'>('all');
  const [selectedClass, setSelectedClass] = React.useState<'all' | '11' | '12' | 'dropper'>('all');

  React.useEffect(() => {
    document.title = "Explore Batches | PrepEntrance";
    window.scrollTo({ top: 0 });
  }, []);

  const filteredBatches = React.useMemo(() => {
    return batches.filter((b) => {
      const examMatch = selectedExam === 'all' || b.exam === selectedExam;
      const classMatch = selectedClass === 'all' || b.classLevel === selectedClass;
      return examMatch && classMatch;
    });
  }, [selectedExam, selectedClass]);

  const examTabs = [
    { key: 'all', label: 'All Exams' },
    { key: 'jee', label: 'IIT JEE' },
    { key: 'neet', label: 'NEET UG' },
    { key: 'cuet', label: 'CUET (UG)' },
  ] as const;

  const classTabs = [
    { key: 'all', label: 'All Classes' },
    { key: '11', label: 'Class 11' },
    { key: '12', label: 'Class 12' },
    { key: 'dropper', label: 'Droppers' },
  ] as const;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <LandingNav />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#312e81] py-10 px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">PrepEntrance</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Choose Your Batch</h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl mx-auto">
            AI-powered exam preparation batches for JEE, NEET, and CUET.
            Start free, upgrade anytime.
          </p>
          
          {/* Filtering Controls */}
          <div className="space-y-4 mt-6">
            {/* Exam Filter tabs */}
            <div className="flex justify-center gap-2 flex-wrap">
              {examTabs.map((t) => (
                <button 
                  key={t.key} 
                  onClick={() => setSelectedExam(t.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${selectedExam === t.key ? 'bg-white text-blue-700 border-white' : 'border-white/30 text-white/70 hover:border-white hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Class Filter tabs */}
            <div className="flex justify-center gap-2 flex-wrap">
              {classTabs.map((t) => (
                <button 
                  key={t.key} 
                  onClick={() => setSelectedClass(t.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${selectedClass === t.key ? 'bg-white/90 text-slate-800 border-white' : 'border-white/10 text-white/50 hover:border-white/40 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Batch Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {filteredBatches.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500 font-bold text-sm">No batches found matching the filters.</p>
            <button 
              onClick={() => { setSelectedExam('all'); setSelectedClass('all'); }}
              className="mt-3 text-xs text-blue-600 font-extrabold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-7">
            {filteredBatches.map((b) => (
              <div key={b.slug} className={`border-2 ${b.borderColor} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col`}>
                {/* Mountain card image */}
                <div className="relative h-48 overflow-hidden">
                  <img src={b.mountain} alt={b.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold text-white ${b.tagBg} mb-1.5`}>{b.tag}</span>
                    <h2 className="sr-only">{b.name}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-4 leading-relaxed">{b.sub}</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {b.duration}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Globe className="w-3.5 h-3.5" /> Web + Mobile
                    </div>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {b.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                        <Check className="w-3.5 h-3.5 stroke-[3]" style={{ color: b.checkColor }} />
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Price + CTA */}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <span className={`text-2xl font-black ${b.accentText}`}>{b.price}</span>
                        <span className="text-slate-400 text-xs font-bold ml-1">{b.unit}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border">{b.target}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/batches/${b.slug}`)}
                      className={`w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${b.btnBg}`}
                    >
                      View Batch Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA banner */}
      <div className="bg-slate-50 border-t border-slate-100 py-10 px-4 text-center">
        <p className="text-slate-600 text-sm font-medium mb-3">Not sure which batch to join?</p>
        <button
          onClick={() => navigate('/signup')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
        >
          Start Free Diagnostic Test
        </button>
      </div>
    </div>
  );
};

export default BatchesPage;
