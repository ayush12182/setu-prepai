import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import { Check, ArrowRight, Clock, Users, Globe, Smartphone } from 'lucide-react';

const batches = [
  {
    slug: 'aarambh-2028',
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
  },
  {
    slug: 'aarohan-2027',
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
  },
  {
    slug: 'shikhar-2027',
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
  },
];

const BatchesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <LandingNav />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#312e81] py-10 px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">PrepEntrance</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Choose Your Batch</h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl mx-auto">
            AI-powered JEE preparation batches for Class 11, Class 12 and Droppers.
            Start free, upgrade anytime.
          </p>
          {/* Tabs */}
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {['All Batches', 'Class 11', 'Class 12', 'Dropper'].map((t) => (
              <button key={t} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${t === 'All Batches' ? 'bg-white text-blue-700 border-white' : 'border-white/30 text-white/70 hover:border-white hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-7">
          {batches.map((b) => (
            <div key={b.slug} className={`border-2 ${b.borderColor} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col`}>
              {/* Mountain card image */}
              <div className="relative h-48 overflow-hidden">
                <img src={b.mountain} alt={b.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold text-white ${b.tagBg} mb-1.5`}>{b.tag}</span>
                  <h2 className="text-xl font-black text-white drop-shadow">{b.name}</h2>
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
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border">Target: {b.target}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/batches/${b.slug}`)}
                    className={`w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${b.btnBg}`}
                  >
                    View Batch Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA banner */}
      <div className="bg-slate-50 border-t border-slate-100 py-10 px-4 text-center">
        <p className="text-slate-600 text-sm font-medium mb-3">Not sure which batch to join?</p>
        <button
          onClick={() => navigate('/signup')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all"
        >
          Start Free Diagnostic Test
        </button>
      </div>
    </div>
  );
};

export default BatchesPage;
