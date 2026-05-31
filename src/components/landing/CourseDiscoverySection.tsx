import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical, GraduationCap, ArrowRight, Flame } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  exams: string[]; // e.g. ['JEE Main', 'JEE Advanced']
  targetYear: string;
  classes: string[]; // e.g. ['11th']
  startDate: string;
  status: 'Upcoming' | 'Live';
  bannerGradient: string;
  badgeColor: string;
  accentColor: 'jee' | 'neet' | 'cuet';
  benefits: string[];
  journeyPath: string[];
  tagline: string;
}

const MOCK_BATCHES: Batch[] = [
  {
    id: 'pe-foundation-jee-2027',
    name: 'PE Foundation JEE 2027',
    exams: ['JEE Main', 'JEE Advanced'],
    targetYear: '2027',
    classes: ['11th'],
    startDate: 'Starts June 15',
    status: 'Upcoming',
    bannerGradient: 'from-blue-700 via-indigo-800 to-orange-600',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    accentColor: 'jee',
    benefits: [
      'Daily Syllabus-Aligned Planners',
      'Weekly Standard Mock Tests',
      '24/7 AI Doubt Solver Access',
      'Real-time Performance Reports'
    ],
    journeyPath: ['Class 11', 'Class 12', 'JEE 2027'],
    tagline: '2 YEAR INTEGRATED PROGRAM'
  },
  {
    id: 'pe-foundation-neet-2027',
    name: 'PE Foundation NEET 2027',
    exams: ['NEET'],
    targetYear: '2027',
    classes: ['11th'],
    startDate: 'Starts June 18',
    status: 'Upcoming',
    bannerGradient: 'from-emerald-700 via-teal-800 to-emerald-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accentColor: 'neet',
    benefits: [
      'Full NCERT Bio-drills',
      'Weekly NEET Pattern Mocks',
      'Interactive Conceptual Notes',
      'AI-driven Personal Tracker'
    ],
    journeyPath: ['Class 11', 'Board Prep', 'NEET 2027'],
    tagline: '2 YEAR COMPLETE PATHWAY'
  },
  {
    id: 'pe-accelerator-jee-2026',
    name: 'PE Accelerator JEE 2026',
    exams: ['JEE Main', 'JEE Advanced'],
    targetYear: '2026',
    classes: ['12th'],
    startDate: 'Ongoing · Batch Active',
    status: 'Live',
    bannerGradient: 'from-blue-700 via-sky-800 to-amber-500',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    accentColor: 'jee',
    benefits: [
      'Class 12 Syllabus Acceleration',
      'Backlog Revision of Class 11',
      'Weekly Advanced Level Mocks',
      'AI Performance Diagnostic'
    ],
    journeyPath: ['Class 12', 'Revision Planners', 'JEE 2026'],
    tagline: '1 YEAR EXPEDITED BATCH'
  },
  {
    id: 'pe-accelerator-neet-2026',
    name: 'PE Accelerator NEET 2026',
    exams: ['NEET'],
    targetYear: '2026',
    classes: ['12th'],
    startDate: 'Ongoing · Batch Active',
    status: 'Live',
    bannerGradient: 'from-emerald-700 via-teal-800 to-green-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accentColor: 'neet',
    benefits: [
      'Syllabus Coverage by Experts',
      'Regular Part & Full Tests',
      'AI Question-bank Exercises',
      'All India NEET Test Rank'
    ],
    journeyPath: ['Class 12', 'Full Revision', 'NEET 2026'],
    tagline: '1 YEAR SUCCESS COURSE'
  },
  {
    id: 'pe-momentum-jee-2026',
    name: 'PE Momentum JEE 2026',
    exams: ['JEE Main', 'JEE Advanced'],
    targetYear: '2026',
    classes: ['Dropper'],
    startDate: 'Ongoing · Batch Active',
    status: 'Live',
    bannerGradient: 'from-indigo-700 via-blue-800 to-orange-600',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    accentColor: 'jee',
    benefits: [
      'Complete Syllabus in 8 Months',
      'High-yield PYQ Test Drills',
      'Focused Weakness Correction',
      'National Percentile Estimator'
    ],
    journeyPath: ['Dropper Prep', 'Mock Test Drills', 'JEE 2026'],
    tagline: 'DROPPER RANK EXPANDER'
  },
  {
    id: 'pe-momentum-neet-2026',
    name: 'PE Momentum NEET 2026',
    exams: ['NEET'],
    targetYear: '2026',
    classes: ['Dropper'],
    startDate: 'Ongoing · Batch Active',
    status: 'Live',
    bannerGradient: 'from-emerald-700 via-teal-800 to-emerald-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accentColor: 'neet',
    benefits: [
      'Comprehensive Core Lectures',
      'Exhaustive NCERT Review',
      'Daily Formula Worksheets',
      'AI Doubt Solver Support'
    ],
    journeyPath: ['Dropper Prep', 'Intense Drills', 'NEET 2026'],
    tagline: 'DROPPER SCORE OPTIMIZER'
  },
  {
    id: 'pe-elite-cuet-2026',
    name: 'PE Elite CUET 2026',
    exams: ['CUET'],
    targetYear: '2026',
    classes: ['12th', 'Dropper'],
    startDate: 'Ongoing · Batch Active',
    status: 'Live',
    bannerGradient: 'from-violet-750 via-purple-850 to-fuchsia-600',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    accentColor: 'cuet',
    benefits: [
      'CUET Domain Subject Master',
      'General Test Prep Modules',
      'Sectional Language Drills',
      'Percentile Maximizer Mocks'
    ],
    journeyPath: ['CUET Topics', 'Test Series', 'CUET 2026'],
    tagline: 'CENTRAL UNIV PREMIER BATCH'
  },
  {
    id: 'pe-foundation-cuet-2027',
    name: 'PE Foundation CUET 2027',
    exams: ['CUET'],
    targetYear: '2027',
    classes: ['11th'],
    startDate: 'Starts July 1',
    status: 'Upcoming',
    bannerGradient: 'from-violet-700 via-indigo-800 to-purple-600',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    accentColor: 'cuet',
    benefits: [
      'Concept Mastery Foundations',
      'Integrated Board Exam Prep',
      'Aptitude & Logical Practice',
      'AI Prep Planner Guidelines'
    ],
    journeyPath: ['Class 11', 'Domain Mastery', 'CUET 2027'],
    tagline: '2 YEAR PREPARATION STAGE'
  }
];

const EXAMS = [
  { id: 'all-exams', label: 'All Exams', icon: GraduationCap },
  { id: 'JEE Main', label: 'JEE Main', icon: BookOpen },
  { id: 'JEE Advanced', label: 'JEE Advanced', icon: BookOpen },
  { id: 'NEET', label: 'NEET', icon: FlaskConical },
  { id: 'CUET', label: 'CUET', icon: GraduationCap }
];

const CLASSES = ['All', '11th', '12th', 'Dropper'];

const CourseDiscoverySection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<string>('all-exams');
  const [selectedClass, setSelectedClass] = useState<string>('All');

  const filteredBatches = MOCK_BATCHES.filter(batch => {
    const examMatch = selectedExam === 'all-exams' || batch.exams.includes(selectedExam);
    const classMatch = selectedClass === 'All' || batch.classes.includes(selectedClass);
    return examMatch && classMatch;
  });

  return (
    <section id="batches" className="py-24 relative bg-[#07111F]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,155,84,0.03),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_10%_80%,rgba(59,130,246,0.03),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9B54]/10 border border-[#FF9B54]/20 text-[#FF9B54] text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            Active Batches & Courses
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Find Your Perfect Batch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="text-[#94A3B8] text-base sm:text-lg leading-relaxed"
          >
            Select your target exam and academic stage to discover structured, syllabus-oriented courses with live practice sessions, planners, and test series.
          </motion.p>
        </div>

        {/* Filters Panel */}
        <div className="mb-12 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          
          {/* Exam Selector */}
          <div className="mb-8">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">1. Browse by Exam</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {EXAMS.map(exam => {
                const isSelected = selectedExam === exam.id;
                return (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#FF9B54] text-[#07111F] border-[#FF9B54] shadow-lg shadow-[#FF9B54]/20 scale-[1.02]'
                        : 'bg-white/[0.03] text-white/70 border-white/[0.08] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <exam.icon className="h-4.5 w-4.5 shrink-0" />
                    {exam.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Selector */}
          <div>
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">2. Choose Your Academic Stage</h3>
            <div className="flex flex-wrap gap-2.5">
              {CLASSES.map(cls => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                        : 'bg-white/[0.03] text-white/60 border-white/[0.08] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Batches Grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredBatches.map((batch, index) => (
              <motion.div
                key={batch.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group relative rounded-3xl border bg-[#0C1825]/90 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl shadow-black/60 ${
                  batch.accentColor === 'jee'
                    ? 'border-[#3b82f6]/20 hover:border-[#FF9B54]/55'
                    : batch.accentColor === 'neet'
                    ? 'border-emerald-500/20 hover:border-emerald-400/55'
                    : 'border-violet-500/20 hover:border-violet-400/55'
                }`}
              >
                {/* Visual Poster Banner */}
                <div className={`relative h-44 w-full bg-gradient-to-br ${batch.bannerGradient} flex flex-col justify-between p-5 overflow-hidden`}>
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />
                  
                  {/* Top Accent Strip */}
                  <div className="flex items-start justify-between relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-black/40 backdrop-blur-md text-white border border-white/15">
                      <span className={`w-1.5 h-1.5 rounded-full ${batch.status === 'Upcoming' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                      {batch.status === 'Upcoming' ? 'New Batch · Applications Open' : 'Live & Active · Join Ongoing'}
                    </span>
                    
                    <span className="text-[9px] bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white/80 font-black border border-white/10 tracking-widest uppercase">
                      {batch.tagline}
                    </span>
                  </div>

                  {/* Banner Info */}
                  <div className="relative z-10 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                      PrepEntrance Academic Course
                    </p>
                    <h4 className="text-2xl font-black text-white leading-none tracking-tight uppercase">
                      {batch.name}
                    </h4>
                  </div>
                  
                  {/* Light shine accent overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  
                  <div className="space-y-5">
                    {/* Stage & Year Badges */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 font-semibold text-[11px]">
                        🎓 {batch.classes[0]} Stage
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-black text-[11px] tracking-wider uppercase ${
                        batch.accentColor === 'jee'
                          ? 'from-[#3b82f6]/20 to-[#FF9B54]/20 text-[#FF9B54] border border-[#FF9B54]/30 bg-[#FF9B54]/5'
                          : batch.accentColor === 'neet'
                          ? 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 bg-emerald-500/5'
                          : 'from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30 bg-violet-500/5'
                      }`}>
                        🎯 Target {batch.targetYear}
                      </span>
                    </div>

                    {/* Benefit checklist items */}
                    <div className="space-y-2.5">
                      {batch.benefits.map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-xs text-white/85">
                          <span className={`font-black text-xs mt-0.5 shrink-0 ${
                            batch.accentColor === 'jee'
                              ? 'text-[#FF9B54]'
                              : batch.accentColor === 'neet'
                              ? 'text-emerald-400'
                              : 'text-violet-400'
                          }`}>
                            ✓
                          </span>
                          <span className="leading-snug">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {/* Preparation Journey Indicator */}
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5 mb-5 space-y-2.5">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-white/40">
                        <span>Preparation Journey</span>
                        <span className="text-white/60">Stage Route</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        {batch.journeyPath.map((pathItem, pIdx) => (
                          <React.Fragment key={pIdx}>
                            <span className="text-[10px] text-white/70 font-semibold truncate max-w-[80px]">
                              {pathItem}
                            </span>
                            {pIdx < batch.journeyPath.length - 1 && (
                              <span className="text-white/20 text-[9px] shrink-0">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Status Strip */}
                    <div className="flex items-center justify-between text-[11px] text-white/50 mb-5">
                      <span className="font-semibold">{batch.startDate}</span>
                      <span className="font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Enrollments Open
                      </span>
                    </div>

                    {/* Action CTA */}
                    <button
                      onClick={() => navigate(`/auth?batch=${encodeURIComponent(batch.name)}`)}
                      className={`w-full group/btn flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl text-xs font-black transition-all duration-300 hover:shadow-lg ${
                        batch.accentColor === 'jee'
                          ? 'bg-[#FF9B54] text-[#07111F] hover:brightness-110 shadow-[#FF9B54]/10'
                          : batch.accentColor === 'neet'
                          ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/10'
                          : 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-500/10'
                      }`}
                    >
                      Explore Batch & Enroll
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {filteredBatches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-white/30" />
              </div>
              <p className="text-white/80 font-bold text-base mb-1">No Batches Found</p>
              <p className="text-[#94A3B8]/60 text-xs max-w-sm leading-relaxed">
                We are actively curating new batches for this exam and stage combination. Click reset or select another category to explore live batches.
              </p>
              <button
                onClick={() => { setSelectedExam('all-exams'); setSelectedClass('All'); }}
                className="mt-4 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-white hover:bg-white/[0.1] transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CourseDiscoverySection;
