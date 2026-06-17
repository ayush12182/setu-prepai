import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import {
  Check, ArrowRight, Clock, Globe, Smartphone, Bot, BarChart2, FileText,
  Target, Brain, Users, Star, ChevronDown, ChevronUp, Zap, Trophy,
  BookOpen, TrendingUp, CheckCircle2, X, Layers,
} from 'lucide-react';

/* ─── BATCH DATA ─── */
const BATCH_DATA: Record<string, BatchConfig> = {
  'aarambh-2028': {
    slug: 'aarambh-2028',
    name: 'AARAMBH 2028',
    tag: 'Class 11 Students',
    tagBg: 'bg-blue-600',
    accentColor: '#2563eb',
    accentLight: '#eff6ff',
    accentBorder: '#bfdbfe',
    accentText: 'text-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    mountain: '/images/mountain_blue.png',
    headline: 'Your JEE Journey Starts Here.',
    subheadline: 'Built for Class 11 students beginning their IIT JEE preparation. Build unshakeable fundamentals from Day 1.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '2 Years', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'JEE Main + Advanced 2028', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'Hinglish', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Most students fail because they don\'t build strong fundamentals in Class 11.',
    whyPoints: ['Concept Building from scratch', 'NCERT Mastery for every chapter', 'PYQ Exposure from Day 1', 'Daily Practice with AI feedback', 'AI Guided Learning path'],
    syllabus: {
      Physics: ['Units & Dimensions', 'Kinematics', 'Laws of Motion', 'Work, Power & Energy', 'Centre of Mass', 'Rotational Motion', 'SHM', 'Waves'],
      Chemistry: ['Mole Concept', 'Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 'Chemical Equilibrium'],
      Mathematics: ['Sets & Relations', 'Trigonometry', 'Functions', 'Quadratic Equations', 'Sequences & Series', 'Straight Lines'],
    },
    roadmap: [
      { period: 'Month 1–4', phase: 'Foundation', desc: 'Build strong concept base across all subjects.' },
      { period: 'Month 5–8', phase: 'Problem Solving', desc: 'Apply concepts with increasing difficulty levels.' },
      { period: 'Month 9–16', phase: 'Advanced Questions', desc: 'JEE Advanced level problems and PYQ practice.' },
      { period: 'Month 17–24', phase: 'JEE Mock Tests', desc: 'Full-length mock tests and rank improvement.' },
    ],
    faqs: [
      { q: 'Is this batch right for me if I\'m in Class 11?', a: 'Yes. Aarambh is designed specifically for Class 11 students who are starting JEE preparation. We start from basics and build up systematically.' },
      { q: 'How is PrepEntrance different from offline coaching?', a: 'PrepEntrance uses AI to personalize your study plan daily. No fixed batches — you learn at your own pace with adaptive questions and 24/7 doubt support.' },
      { q: 'Do I need any prior JEE knowledge?', a: 'Not at all. Aarambh starts from Class 11 NCERT level and builds up progressively to JEE Advanced level.' },
      { q: 'Can I use this on my phone?', a: 'Yes. PrepEntrance is fully mobile-optimized. Practice, attend AI mentor sessions and take tests on any device.' },
      { q: 'What happens after I enroll?', a: 'You\'ll take a Diagnostic Test. Based on your results, our AI will create a personalized 2-year study plan and daily targets.' },
    ],
    testimonials: [
      { name: 'Rohan Verma', exam: 'JEE 2024 Aspirant', text: 'Started Class 11 completely clueless. Aarambh structured everything for me. The AI mentor explains better than any teacher I\'ve had.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
      { name: 'Ananya Sharma', exam: 'Class 11 Student', text: 'Daily targets keep me on track. I\'ve never been this consistent before. The personalized plan is genuinely different for everyone.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
      { name: 'Kartik Mehta', exam: 'JEE Main 2024', text: 'The mock tests are exactly like the real exam. Percentile tracking after each test keeps you motivated to improve.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'aarohan-2027': {
    slug: 'aarohan-2027',
    name: 'AAROHAN 2027',
    tag: 'Class 12 Students',
    tagBg: 'bg-purple-600',
    accentColor: '#7c3aed',
    accentLight: '#f5f3ff',
    accentBorder: '#ddd6fe',
    accentText: 'text-purple-600',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    mountain: '/images/mountain_purple.png',
    headline: 'The Year That Decides Your Rank.',
    subheadline: 'Designed for Class 12 students targeting JEE 2027. Balance Boards with JEE — without compromising either.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '1 Year', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'JEE Main + Advanced 2027', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'Hinglish', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Class 12 is the most critical year — and most students waste it trying to manage too much.',
    whyPoints: ['Boards + JEE Balance strategy', 'High Weightage Chapter focus', 'Smart Revision Framework', 'PYQ-first practice approach', 'Full JEE Advanced strategy'],
    syllabus: {
      Physics: ['Electrostatics', 'Current Electricity', 'Magnetism', 'EMI & AC Circuits', 'Optics', 'Modern Physics', 'Semiconductors'],
      Chemistry: ['Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'Coordination Compounds', 'Organic Chemistry'],
      Mathematics: ['Inverse Trigonometry', 'Matrices & Determinants', 'Continuity & Differentiability', 'Integration', 'Differential Equations', '3D Geometry', 'Probability'],
    },
    roadmap: [
      { period: 'June–Aug', phase: 'Complete Syllabus', desc: 'Finish all Class 12 chapters with JEE-level problems.' },
      { period: 'Sept–Nov', phase: 'Advanced Practice', desc: 'High-difficulty PYQs, topic tests and analysis.' },
      { period: 'Dec–Feb', phase: 'Revision', desc: 'AI-powered revision of weak chapters and short notes.' },
      { period: 'March–April', phase: 'Mock Test Phase', desc: 'Full-length JEE mocks with rank prediction.' },
    ],
    faqs: [
      { q: 'Can I balance Board prep with this?', a: 'Yes. Aarohan\'s AI plan automatically allocates time between Boards and JEE based on your upcoming exam dates.' },
      { q: 'I have a weak foundation from Class 11. Will this work?', a: 'Absolutely. Aarohan includes quick-revision modules for important Class 11 topics that are critical for JEE.' },
      { q: 'How many hours per day is required?', a: 'The AI adapts to your pace. Most students put in 4–6 hours daily. You can set your own daily target.' },
      { q: 'Are Board exam topics covered?', a: 'Yes. Class 12 Board syllabus is fully covered as part of the JEE preparation — Boards and JEE topics overlap significantly.' },
      { q: 'What if I miss a few days?', a: 'The AI automatically reschedules your plan. You won\'t fall behind permanently — the plan adapts to your pace.' },
    ],
    testimonials: [
      { name: 'Priya Singh', exam: 'JEE 2024 Aspirant', text: 'Aarohan\'s Board + JEE balance strategy saved my year. I scored 92% in Boards AND got a decent JEE percentile.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
      { name: 'Ravi Kumar', exam: 'JEE Main 2024', text: 'The revision modules before JEE were incredibly focused. Only high-weightage topics — no time wasted.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
      { name: 'Sneha Patel', exam: 'Class 12 Student', text: 'Personalized study plan every single day. It knows which chapters I\'m weak in and targets them relentlessly.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'shikhar-2027': {
    slug: 'shikhar-2027',
    name: 'SHIKHAR 2027',
    tag: 'Droppers Batch',
    tagBg: 'bg-orange-500',
    accentColor: '#ea580c',
    accentLight: '#fff7ed',
    accentBorder: '#fed7aa',
    accentText: 'text-orange-600',
    btnBg: 'bg-orange-500 hover:bg-orange-600',
    mountain: '/images/mountain_orange.png',
    headline: 'One More Year. One Last Shot. One Better Rank.',
    subheadline: 'Built for serious JEE droppers who want a structured, high-intensity year with no shortcuts and maximum results.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '1 Year', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'JEE Main + Advanced 2027', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'Hinglish', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Droppers fail not because they lack intelligence — they fail because they lack structure and accountability.',
    whyPoints: ['Fast-paced revision schedule', 'High intensity daily practice', 'PYQ-first learning strategy', 'Advanced JEE-level test series', 'AI daily accountability check-ins'],
    syllabus: {
      Physics: ['Complete Mechanics Review', 'Electrostatics & Current', 'Magnetism', 'Optics & Modern Physics', 'Full JEE PYQ Practice'],
      Chemistry: ['Physical Chemistry Deep Dive', 'Organic Reactions & Mechanisms', 'Inorganic for JEE Advanced', 'PYQ Analysis by Chapter'],
      Mathematics: ['Calculus Mastery', 'Algebra & Complex Numbers', 'Coordinate Geometry', 'Permutation & Probability', 'Advanced PYQ Sets'],
    },
    roadmap: [
      { period: 'Phase 1 (Month 1–3)', phase: 'Repair Weaknesses', desc: 'AI diagnosis identifies exact weak chapters. Focused repair before anything else.' },
      { period: 'Phase 2 (Month 4–7)', phase: 'Advanced Problem Solving', desc: 'JEE Advanced level problems, PYQ analysis, speed drills.' },
      { period: 'Phase 3 (Month 8–12)', phase: 'Full Mock Tests', desc: 'Weekly full-length mocks, rank tracking, final revision sprints.' },
    ],
    faqs: [
      { q: 'I dropped last year and scored 85 percentile. Is Shikhar right for me?', a: 'Yes. Shikhar is designed for students targeting a significant rank improvement. Whether you want a top NIT or IIT, the AI adapts to your target.' },
      { q: 'How is the schedule for droppers different?', a: 'Shikhar runs at a faster pace with higher intensity. More tests, more PYQs, more accountability check-ins. It assumes you already have a basic understanding.' },
      { q: 'Will the AI know my weak areas from last year?', a: 'Yes. After a Diagnostic Test, the AI maps your exact gaps and creates a personalized 90-day weakness repair plan before advancing.' },
      { q: 'Are there live sessions or is it fully self-paced?', a: 'Fully AI-powered self-paced. You can study at any time — the AI mentor is available 24/7 for doubt solving and concept explanation.' },
      { q: 'What if my motivation drops midway?', a: 'Daily AI check-ins, streak tracking and performance badges keep you accountable. You\'ll also see your rank prediction improve every week.' },
    ],
    testimonials: [
      { name: 'Aman Khan', exam: 'JEE 2024 Dropper', text: 'Dropped once. Shikhar gave me a structured plan that removed every excuse. Consistent practice made all the difference.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' },
      { name: 'Deepak Rawat', exam: 'JEE Advanced 2024', text: 'The 90-day weakness repair phase was exactly what I needed. Pinpointed every chapter I was avoiding.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
      { name: 'Meera Joshi', exam: 'JEE Dropper 2023', text: 'I was skeptical about an AI platform. But the personalization is real — my plan genuinely changes every week based on my performance.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'aarambh-neet-2028': {
    slug: 'aarambh-neet-2028',
    name: 'AARAMBH NEET 2028',
    tag: 'Class 11 NEET',
    tagBg: 'bg-emerald-600',
    accentColor: '#10b981',
    accentLight: '#f0fdf4',
    accentBorder: '#bbf7d0',
    accentText: 'text-emerald-600',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    mountain: '/images/mountain_blue.png',
    headline: 'Your Medical Journey Starts Here.',
    subheadline: 'Built for Class 11 students starting their NEET UG preparation. Build concrete conceptual foundations in Biology, Physics and Chemistry.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '2 Years', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'NEET UG 2028', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'Hinglish', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'A weak foundation in Class 11 Biology & Physics is the #1 reason aspirants fail NEET.',
    whyPoints: ['Complete NCERT Biology word-by-word mastery', 'Mechanics & Physical Chemistry base building', 'Interactive visual and diagram-based learning', 'Daily practice questions with AI feedback', 'AI Guided learning paths'],
    syllabus: {
      Physics: ['Physical World & Measurement', 'Kinematics', 'Laws of Motion', 'Work, Energy & Power', 'Rotational Motion', 'Gravitation'],
      Chemistry: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding', 'Thermodynamics'],
      Biology: ['The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 'Cell: The Unit of Life', 'Biomolecules'],
    },
    roadmap: [
      { period: 'Month 1–4', phase: 'Foundation', desc: 'Focus heavily on basic NCERT concepts, basic math for physics, and cell biology.' },
      { period: 'Month 5–8', phase: 'Core Topics', desc: 'Cover mechanics, chemical bonding, plant and animal diversity.' },
      { period: 'Month 9–16', phase: 'Advanced NCERT & PYQs', desc: 'Attempt medium-to-hard NEET pattern questions and previous years questions.' },
      { period: 'Month 17–24', phase: 'Full Practice & Mocks', desc: 'Run full-length mock tests and analyze weaknesses using AI mentor.' },
    ],
    faqs: [
      { q: 'Is this batch suitable for NEET Class 11 students?', a: 'Yes. Aarambh NEET is designed precisely for Class 11 students starting from basics and covering NCERT thoroughly.' },
      { q: 'How does PrepEntrance AI help medical students?', a: 'Visual graphics, 24/7 AI explanation of botanical/zoological terms, and adaptive physics numerical solver tailored for medical students.' },
      { q: 'Do we get mock tests on official NEET pattern?', a: 'Yes. Get unlimited AI-generated mock tests simulating the official NEET UG pattern.' },
    ],
    testimonials: [
      { name: 'Dr. Shruti Iyer', exam: 'NEET Qualified 2025', text: 'Visual diagrams explanation by the AI mentor made Zoology so easy. Highly recommend Aarambh NEET batch!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'aarohan-neet-2027': {
    slug: 'aarohan-neet-2027',
    name: 'AAROHAN NEET 2027',
    tag: 'Class 12 NEET',
    tagBg: 'bg-emerald-700',
    accentColor: '#047857',
    accentLight: '#f0fdf4',
    accentBorder: '#a7f3d0',
    accentText: 'text-emerald-700',
    btnBg: 'bg-emerald-700 hover:bg-emerald-800',
    mountain: '/images/mountain_purple.png',
    headline: 'Master NEET UG & Boards in Parallel.',
    subheadline: 'Balance Class 12 Boards syllabus while aggressively training on NEET UG high-weightage topics and full-length mocks.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '1 Year', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'NEET UG 2027', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'Hinglish', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Aarohan NEET balances board preparations with high-intensity medical entrance practice.',
    whyPoints: ['Boards + NEET balance planner', 'High weightage Human Physiology and Genetics focus', 'NCERT revision engine and summaries', 'Previous year papers mock simulation', 'Instant AI doubt support for botany & zoology'],
    syllabus: {
      Physics: ['Electrostatics', 'Current Electricity', 'Magnetic Effects of Current', 'Electromagnetic Induction & AC', 'Optics', 'Modern Physics'],
      Chemistry: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'd and f Block Elements', 'Coordination Compounds', 'Organic Chemistry'],
      Biology: ['Reproduction', 'Genetics and Evolution', 'Biology in Human Welfare', 'Biotechnology and its Applications', 'Ecology and Environment'],
    },
    roadmap: [
      { period: 'Month 1–3', phase: 'Class 12 Completion', desc: 'Finish Class 12 NCERT and board preparation chapters.' },
      { period: 'Month 4–6', phase: 'Class 11 Revision', desc: 'Run revision schedules for crucial Class 11 NEET topics.' },
      { period: 'Month 7–9', phase: 'Speed Sprints', desc: 'Focus on time management, diagram flashcards, and physics calculations.' },
      { period: 'Month 10–12', phase: 'NEET Simulator Mocks', desc: 'Solve weekly official-pattern mocks with detailed AI tracking.' },
    ],
    faqs: [
      { q: 'Will this help with my board exams?', a: 'Absolutely. The Board syllabus is completely nested within the NEET UG syllabus. Our AI schedules balance both.' },
      { q: 'Is there a revision path for Class 11?', a: 'Yes. Quick revision guides and practice sets for Class 11 topics are fully included.' },
    ],
    testimonials: [
      { name: 'Sameer Patel', exam: 'NEET UG 2025 Aspirant', text: 'Genetics and Biotechnology concepts were so tough, but the interactive AI explainers cleared my doubts instantly.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'shikhar-neet-2027': {
    slug: 'shikhar-neet-2027',
    name: 'SHIKHAR NEET 2027',
    tag: 'Droppers NEET',
    tagBg: 'bg-teal-600',
    accentColor: '#0d9488',
    accentLight: '#f0fdfa',
    accentBorder: '#99f6e4',
    accentText: 'text-teal-600',
    btnBg: 'bg-teal-600 hover:bg-teal-700',
    mountain: '/images/mountain_orange.png',
    headline: 'Your Second Attempt. Your Dream Medical Seat.',
    subheadline: 'Rigorous gap repair, weakness analytics, speed drills and high-intensity NEET UG coaching for droppers.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '1 Year', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'NEET UG 2027', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'Hinglish', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Droppers need target gap mapping, not standard batch lectures.',
    whyPoints: ['AI-driven weakness diagnosis and gap repair plan', 'NCERT word-by-word query bank', 'Physics calculations speed sprint', 'Teal-themed customized student dashboard', '24x7 instant AI doubts resolving'],
    syllabus: {
      Physics: ['Complete Physics NCERT Revision', 'High-Weightage Mechanics & Electromagnetism', 'Calculations Speed Drills'],
      Chemistry: ['Physical, Organic and Inorganic Revision', 'Chemical Kinetics & Coordination deep dives', 'Formula Cheat Sheets'],
      Biology: ['Human & Plant Physiology Deep Revision', 'Genetics, Ecology & Biotech Intensive', 'Diagram Labeling Worksheets'],
    },
    roadmap: [
      { period: 'Phase 1', phase: 'Weakness Repair', desc: 'Identify syllabus gaps using diagnostic test and clear key topics first.' },
      { period: 'Phase 2', phase: 'Speed & Accuracy', desc: 'Daily timed practice, NCERT-focused drills, and mock chapters.' },
      { period: 'Phase 3', phase: 'NEET Mock Simulation', desc: 'Full length NEET mock tests, answer key evaluation and analytics.' },
    ],
    faqs: [
      { q: 'Is this batch faster than normal?', a: 'Yes. Shikhar NEET is tailored for droppers, focusing on testing, analytics, and target conceptual gap repairs.' },
    ],
    testimonials: [
      { name: 'Dr. Rahul Bose', exam: 'NEET UG Dropper', text: 'Improved from 480 to 655 marks. The AI analysis of weak chapters was extremely precise.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'aarambh-cuet-2028': {
    slug: 'aarambh-cuet-2028',
    name: 'AARAMBH CUET 2028',
    tag: 'Class 11 CUET',
    tagBg: 'bg-purple-600',
    accentColor: '#7c3aed',
    accentLight: '#f5f3ff',
    accentBorder: '#ddd6fe',
    accentText: 'text-purple-600',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    mountain: '/images/mountain_blue.png',
    headline: 'Your CUET Journey Starts Here.',
    subheadline: 'Designed for Class 11 students targeting top Central Universities. Build domain and general aptitude base early.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '2 Years', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'CUET UG 2028', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'English / Hindi', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Targeting top universities like DU, BHU or JNU requires strategic domain preparation early.',
    whyPoints: ['Domain subjects core foundation building', 'General Test (Aptitude + GK) early building', 'Language paper practice engines', 'AI Study scheduling for high retention', '24x7 AI Mentor doubts resolver'],
    syllabus: {
      'Domain Subjects': ['Physics/Chemistry/Maths Core', 'Commerce (Accounts/BST) Core', 'Humanities Foundations'],
      'General Test': ['Quantitative Aptitude Basics', 'Logical Reasoning', 'Current Affairs & GK'],
      'Language': ['English Vocabulary', 'Reading Comprehension', 'Grammar Basics'],
    },
    roadmap: [
      { period: 'Month 1–6', phase: 'Aptitude & Language', desc: 'Strengthen quantitative reasoning, analytical thinking and language vocab.' },
      { period: 'Month 7–16', phase: 'Domain Building', desc: 'Synchronize Class 11 domain subjects with CUET pattern.' },
      { period: 'Month 17–24', phase: 'CUET Mocks', desc: 'Simulated Domain tests and GT papers with AI analysis.' },
    ],
    faqs: [
      { q: 'Why start CUET prep in Class 11?', a: 'Building General Aptitude and domain conceptual clarity early ensures you can handle boards and entrance tests seamlessly.' },
    ],
    testimonials: [
      { name: 'Kunal Sen', exam: 'CUET 2025 JNU Admit', text: 'Started early. Got a perfect score in General Test and got into my dream language program.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'aarohan-cuet-2027': {
    slug: 'aarohan-cuet-2027',
    name: 'AAROHAN CUET 2027',
    tag: 'Class 12 CUET',
    tagBg: 'bg-indigo-600',
    accentColor: '#4f46e5',
    accentLight: '#eef2ff',
    accentBorder: '#c7d2fe',
    accentText: 'text-indigo-600',
    btnBg: 'bg-indigo-600 hover:bg-indigo-700',
    mountain: '/images/mountain_purple.png',
    headline: 'Boards + CUET Workspace.',
    subheadline: 'Optimized Class 12 Boards study schedule with parallel Domain Subjects prep, Language tests, and General Test mocks.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '1 Year', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'CUET UG 2027', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'English / Hindi', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Aarohan CUET ensures you don\'t compromise Boards score while prepping for top central colleges.',
    whyPoints: ['Class 12 NCERT board overlap maps', 'Domain mock exams mapping', 'General Test speed sprints', 'Revision schedules and formula cheatsheets', 'Instant AI mentor support'],
    syllabus: {
      'Domain Subjects': ['Class 12 Physics/Chem/Maths', 'Class 12 Accounts/BST/Economics', 'Class 12 History/PolScience/Geography'],
      'General Test': ['Advanced Aptitude Questions', 'Data Interpretation', 'Analytical reasoning'],
      'Language': ['Reading Comprehension level 2', 'Verbal Ability', 'Synonyms & Antonyms'],
    },
    roadmap: [
      { period: 'Month 1–4', phase: 'Domain & Boards', desc: 'Finish Class 12 domain topics aligning with NCERT board syllabi.' },
      { period: 'Month 5–8', phase: 'General Test focus', desc: 'Intensive practicing of quantitative and logical aptitude.' },
      { period: 'Month 9–12', phase: 'CUET simulator phase', desc: 'Take full-length mock tests on official NTA testing interfaces.' },
    ],
    faqs: [
      { q: 'Is Board syllabus same as CUET Domain syllabus?', a: 'Yes. CUET Domain syllabus matches Class 12 NCERT CBSE syllabus. We prepare you for both simultaneously.' },
    ],
    testimonials: [
      { name: 'Aditi Roy', exam: 'SRCC Admit 2025', text: 'PrepEntrance mock tests are exactly like NTA portal. The board overlap plans saved my commerce papers!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },

  'shikhar-cuet-2027': {
    slug: 'shikhar-cuet-2027',
    name: 'SHIKHAR CUET 2027',
    tag: 'Droppers CUET',
    tagBg: 'bg-violet-600',
    accentColor: '#7c3aed',
    accentLight: '#f5f3ff',
    accentBorder: '#ddd6fe',
    accentText: 'text-purple-600',
    btnBg: 'bg-violet-600 hover:bg-violet-700',
    mountain: '/images/mountain_orange.png',
    headline: 'Your Dream Central University College Seat.',
    subheadline: 'Full-syllabus domain acceleration, mock test drilling and customized study targets for CUET droppers and gap-year takers.',
    price: '₹349',
    priceLabel: '/ month',
    stats: [
      { label: 'Duration', value: '1 Year', icon: <Clock className="w-4 h-4" /> },
      { label: 'Target Exam', value: 'CUET UG 2027', icon: <Target className="w-4 h-4" /> },
      { label: 'Language', value: 'English / Hindi', icon: <Globe className="w-4 h-4" /> },
      { label: 'Mode', value: 'AI Self Study', icon: <Bot className="w-4 h-4" /> },
      { label: 'Access', value: 'Web + Mobile', icon: <Smartphone className="w-4 h-4" /> },
    ],
    whyHeadline: 'Droppers need precision revision, weak topic detection and mock simulator drilling.',
    whyPoints: ['Intensive Domain revision guides', 'General Test mock schedules', 'Language verbal ability drills', 'AI daily accountability planning', '24x7 instant AI mentor support'],
    syllabus: {
      'Domain Subjects': ['Quick revision domain modules', 'High difficulty domain sheets', 'Chapter test archives'],
      'General Test': ['Daily quantitative puzzles', 'GK database updates', 'Logical mock chapters'],
      'Language': ['Speed reading drills', 'Vocabulary flash cards', 'Mock verbal sets'],
    },
    roadmap: [
      { period: 'Phase 1', phase: 'Weakness Repair', desc: 'Find domain gaps and clear basic formulas/GK.' },
      { period: 'Phase 2', phase: 'Speed Drills', desc: 'Timed General Test sets and language papers.' },
      { period: 'Phase 3', phase: 'Official Simulators', desc: 'Full length mock tests on official NTA layout.' },
    ],
    faqs: [
      { q: 'Is this suitable for CUET drop year?', a: 'Yes, it provides the exact structure and rigorous testing needed to secure a top college admission.' },
    ],
    testimonials: [
      { name: 'Varun Das', exam: 'CUET Dropper', text: 'Secured Hindu College (DU) after taking a drop year. The AI study plans kept me completely disciplined.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' },
    ],
  },
};

interface BatchConfig {
  slug: string; name: string; tag: string; tagBg: string;
  accentColor: string; accentLight: string; accentBorder: string; accentText: string; btnBg: string;
  mountain: string; headline: string; subheadline: string;
  price: string; priceLabel: string;
  stats: { label: string; value: string; icon: React.ReactNode }[];
  whyHeadline: string; whyPoints: string[];
  syllabus: Record<string, string[]>;
  roadmap: { period: string; phase: string; desc: string }[];
  faqs: { q: string; a: string }[];
  testimonials: { name: string; exam: string; text: string; avatar: string }[];
}

const FEATURES = [
  { icon: <Bot className="w-5 h-5" />, title: 'AI Mentor', desc: '24×7 doubt solving', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { icon: <Zap className="w-5 h-5" />, title: 'Smart Practice', desc: 'Unlimited AI-generated questions', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { icon: <FileText className="w-5 h-5" />, title: 'Mock Tests', desc: 'JEE-pattern full tests', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { icon: <BarChart2 className="w-5 h-5" />, title: 'Analytics', desc: 'Know your weak chapters', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { icon: <Target className="w-5 h-5" />, title: 'Personalized Plan', desc: 'Generated daily by AI', color: 'text-rose-600 bg-rose-50 border-rose-100' },
  { icon: <Brain className="w-5 h-5" />, title: 'Revision Engine', desc: 'AI revision schedules', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
];

const COMPARISON = [
  { feature: 'Study Plan', coaching: 'Same plan for everyone', pe: 'AI-generated daily plan' },
  { feature: 'Practice Questions', coaching: 'Fixed question bank', pe: 'Unlimited AI-generated' },
  { feature: 'Learning Style', coaching: 'Fixed batch schedule', pe: 'Adaptive difficulty' },
  { feature: 'Doubt Support', coaching: 'Limited hours', pe: '24×7 AI Mentor' },
  { feature: 'Performance Analytics', coaching: 'Manual test review', pe: 'AI deep analytics' },
  { feature: 'Cost', coaching: '₹1,00,000+ /year', pe: '₹349 /month' },
];

const PROMISES = [
  'Daily Accountability check-ins',
  'Consistent personalized practice',
  'Adaptive learning path',
  'Full performance tracking',
  '24×7 AI Mentor support',
];

/* ─── FAQ Item ─── */
const FAQItem: React.FC<{ q: string; a: string; accentColor: string }> = ({ q, a, accentColor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-[14px] font-semibold text-slate-900 pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
          {a}
        </div>
      )}
    </div>
  );
};

/* ─── MAIN COMPONENT ─── */
const BatchDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const batch = slug ? BATCH_DATA[slug] : null;

  React.useEffect(() => {
    if (batch) {
      document.title = `${batch.name} Batch | PrepEntrance — Prepare. Perform. Succeed.`;
      window.scrollTo({ top: 0 });
    }
  }, [batch]);
  if (!batch) return <Navigate to="/batches" replace />;

  const accentStyle = { color: batch.accentColor };
  const accentBgStyle = { backgroundColor: batch.accentLight, borderColor: batch.accentBorder };

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <LandingNav />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-slate-700">Home</button>
          <span>›</span>
          <button onClick={() => navigate('/batches')} className="hover:text-slate-700">Batches</button>
          <span>›</span>
          <span style={accentStyle} className="font-bold">{batch.name}</span>
        </nav>
      </div>

      {/* ══ HERO ══ */}
      <section className="py-8 lg:py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-center">
            {/* Left */}
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${batch.tagBg}`}>{batch.tag}</span>
                <span className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-full">
                  {batch.slug.includes('neet') ? 'NEET Prep' : batch.slug.includes('cuet') ? 'CUET Prep' : 'JEE Prep'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                {batch.name}<br />
                <span style={accentStyle}>{batch.headline}</span>
              </h1>
              <p className="text-[15px] text-slate-500 leading-relaxed max-w-xl">{batch.subheadline}</p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => navigate('/signup')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-md active:scale-[0.98] ${batch.btnBg}`}
                  style={{ boxShadow: `0 4px 14px ${batch.accentColor}40` }}
                >
                  Enroll Now <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  <Bot className="w-4 h-4" style={accentStyle} /> Talk to AI Mentor
                </button>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Free 7-day trial</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Cancel anytime</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />No long-term lock-in</span>
              </div>
            </div>

            {/* Right — Mountain card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: '340px' }}>
              <img src={batch.mountain} alt={batch.name} className="w-full h-full object-cover absolute inset-0" style={{ minHeight: '340px' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-black text-white mb-1">{batch.name}</h2>
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold text-white ${batch.tagBg} mb-4`}>{batch.tag}</span>
                {/* Stats grid in card */}
                <div className="grid grid-cols-2 gap-2">
                  {batch.stats.slice(0, 4).map((s, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-semibold mb-0.5">
                        <span style={accentStyle}>{s.icon}</span>{s.label}
                      </div>
                      <div className="text-white text-xs font-extrabold">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BATCH STATS STRIP ══ */}
      <div className="border-b border-slate-100" style={accentBgStyle}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {batch.stats.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <span style={accentStyle}>{s.icon}</span>
                <span className="font-semibold text-slate-500">{s.label}:</span>
                <span className="font-extrabold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ WHY THIS BATCH ══ */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-3" style={accentStyle}>WHY {batch.name}?</div>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-6">{batch.whyHeadline}</h2>
              <p className="text-sm text-slate-500 mb-6">
                {batch.name} focuses on building the exact skills that top rankers have. Every session, every test, every plan is designed to move you closer to your target.
              </p>
              <ul className="space-y-3">
                {batch.whyPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: batch.accentColor + '20', border: `1.5px solid ${batch.accentColor}` }}>
                      <Check className="w-3 h-3 stroke-[3.5]" style={accentStyle} />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Student image */}
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="w-[280px] h-[340px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                  <img src="/images/student_standing.png" alt="PrepEntrance Student" className="w-full h-full object-cover object-top" />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-white border-2 rounded-2xl px-4 py-3 shadow-xl" style={{ borderColor: batch.accentBorder }}>
                  <div className="text-xl font-black" style={accentStyle}>10,000+</div>
                  <div className="text-[11px] font-semibold text-slate-500">Active Students</div>
                </div>
                <div className="absolute -top-3 -left-3 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-700">AI Mentor Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU GET ══ */}
      <section className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={accentStyle}>WHAT YOU GET</div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Everything You Need to Crack {batch.slug.includes('neet') ? 'NEET' : batch.slug.includes('cuet') ? 'CUET' : 'JEE'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <div className={`w-11 h-11 rounded-xl border mx-auto flex items-center justify-center mb-3 ${f.color}`}>{f.icon}</div>
                <h3 className="text-[13px] font-extrabold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SYLLABUS ══ */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={accentStyle}>COMPLETE SYLLABUS</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Everything Covered. Nothing Skipped.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(batch.syllabus).map(([subject, topics]) => (
              <div key={subject} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 font-extrabold text-sm text-white" style={{ backgroundColor: batch.accentColor }}>
                  {subject}
                </div>
                <ul className="p-4 space-y-2">
                  {topics.map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: batch.accentColor }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 font-semibold mt-5">+ More chapters added monthly. Full syllabus available after enrollment.</p>
        </div>
      </section>

      {/* ══ SUCCESS ROADMAP ══ */}
      <section className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={accentStyle}>SUCCESS ROADMAP</div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Your Step-by-Step Path to {batch.slug.includes('neet') ? 'NEET' : batch.slug.includes('cuet') ? 'CUET' : 'JEE'} Success
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-200 hidden sm:block" style={{ left: '28px' }} />
            <div className="space-y-6">
              {batch.roadmap.map((step, i) => (
                <div key={i} className="flex gap-6 items-start relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 z-10 shadow-lg" style={{ backgroundColor: batch.accentColor }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="text-[11px] font-black uppercase tracking-wider mb-1" style={accentStyle}>{step.period}</div>
                    <h3 className="text-[15px] font-extrabold text-slate-900 mb-1.5">{step.phase}</h3>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ══ */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={accentStyle}>WHY PREPENTRANCE IS DIFFERENT</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Stop Paying ₹1 Lakh for Coaching That Doesn't Personalize</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-3 text-sm font-extrabold">
              <div className="px-5 py-3.5 bg-slate-50 text-slate-700 border-b border-slate-200">Feature</div>
              <div className="px-5 py-3.5 bg-slate-50 text-slate-400 border-b border-slate-200 text-center">Offline Coaching</div>
              <div className="px-5 py-3.5 text-white text-center border-b" style={{ backgroundColor: batch.accentColor }}>PrepEntrance</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} border-b border-slate-100 last:border-0`}>
                <div className="px-5 py-3.5 font-semibold text-slate-800">{row.feature}</div>
                <div className="px-5 py-3.5 text-slate-400 font-medium flex items-center justify-center gap-2">
                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />{row.coaching}
                </div>
                <div className="px-5 py-3.5 font-semibold flex items-center justify-center gap-2" style={accentStyle}>
                  <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />{row.pe}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RESULTS PROMISE ══ */}
      <section className="py-10 border-b border-slate-100" style={accentBgStyle}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-3" style={accentStyle}>RESULTS PROMISE</div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">We Don't Promise Ranks. We Promise Process.</h2>
              <p className="text-sm text-slate-500 mb-5">Rank is the output. Our job is to make sure your input — preparation quality, consistency and smart work — is at the highest level.</p>
              <ul className="space-y-2.5">
                {PROMISES.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                    <CheckCircle2 className="w-4.5 h-4.5 shrink-0" style={accentStyle} /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '10K+', label: 'Active Students' },
                { num: '50L+', label: 'Questions Practiced' },
                { num: '98%', label: 'Daily Plan Completion' },
                { num: '4.8★', label: 'Student Rating' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
                  <div className="text-2xl font-black mb-1" style={accentStyle}>{stat.num}</div>
                  <div className="text-xs font-semibold text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={accentStyle}>STUDENT STORIES</div>
            <h2 className="text-2xl font-extrabold text-slate-900">What Students Say About {batch.name}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {batch.testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[13px] text-slate-600 italic leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{t.name}</div>
                    <div className="text-[11px] font-semibold text-slate-400">{t.exam}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={accentStyle}>FAQ</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {batch.faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} accentColor={batch.accentColor} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING CTA ══ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-xs font-black uppercase tracking-widest mb-3" style={accentStyle}>ENROLL TODAY</div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Start Your {batch.tag.includes('Droppers') ? 'Final' : batch.slug.includes('neet') ? 'NEET' : batch.slug.includes('cuet') ? 'CUET' : 'JEE'} Journey for Just {batch.price}
          </h2>
          <p className="text-slate-500 text-sm mb-6">No long-term commitment. Cancel anytime. Start with a free diagnostic test.</p>

          {/* Pricing card */}
          <div className="inline-block border-2 rounded-2xl p-8 mb-6 text-left shadow-xl" style={{ borderColor: batch.accentColor }}>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-black" style={accentStyle}>{batch.price}</span>
              <span className="text-slate-400 text-base font-bold mb-1">{batch.priceLabel}</span>
            </div>
            <div className="text-xs text-slate-500 font-semibold mb-5">Billed monthly. Cancel anytime.</div>
            <ul className="space-y-2 mb-6">
              {['AI Mentor 24/7', 'Unlimited Practice Questions', 'Full Mock Test Series', 'Personalized Daily Study Plan', 'Performance Analytics Dashboard', 'Mobile App Access'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Check className="w-4 h-4 stroke-[3]" style={accentStyle} /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/signup')}
              className={`w-full py-3.5 rounded-xl text-white font-extrabold text-base transition-all shadow-lg active:scale-[0.98] ${batch.btnBg}`}
              style={{ boxShadow: `0 4px 16px ${batch.accentColor}50` }}
            >
              Start Your Prep Journey Today
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">🔒 Secure payment · Free 7-day trial · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ══ ENROLLMENT BANNER ══ */}
      <div className="py-10 px-4 text-white text-center" style={{ background: `linear-gradient(120deg, ${batch.accentColor} 0%, #312e81 100%)` }}>
        <h2 className="text-2xl font-extrabold mb-2">Your Competition Is Already Preparing.</h2>
        <p className="text-sm text-white/80 mb-5 font-medium">Every day you wait is a day they're ahead. Start now.</p>
        <button
          onClick={() => navigate('/signup')}
          className="px-8 py-3.5 bg-white font-extrabold text-sm rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] shadow-xl"
          style={accentStyle}
        >
          Enroll in {batch.name} — {batch.price}/mo
        </button>
      </div>

      {/* Simple Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-400 font-semibold">
        © {new Date().getFullYear()} PrepEntrance. All rights reserved.
        <span className="mx-3">·</span>
        <button onClick={() => navigate('/privacy')} className="hover:text-slate-600">Privacy Policy</button>
        <span className="mx-3">·</span>
        <button onClick={() => navigate('/terms')} className="hover:text-slate-600">Terms of Service</button>
      </footer>
    </div>
  );
};

export default BatchDetailPage;
