import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, HelpCircle, BookOpen, Target, Clock, TrendingUp, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);

  const examPills = ['JEE Main', 'JEE Advanced', 'NEET', 'UCEED', 'CA Foundation'];

  const problemsLeft = [
    'Too many videos',
    'Too many PDFs',
    'Too many opinions',
    'Too many apps',
  ];

  const problemsRight = [
    'What to study first',
    'What to skip',
    'How deeply to study a topic',
    'Whether they are on the right track',
  ];

  const mentorPills = ['Calm', 'Honest', 'Disciplined', 'Supportive'];

  const mentorCards = [
    {
      title: 'Plans your study',
      desc: 'Daily + weekly realistic plan based on your capacity',
      icon: Clock,
    },
    {
      title: 'Breaks syllabus into priorities',
      desc: 'Clear roadmap, not overwhelming lists',
      icon: Target,
    },
    {
      title: 'Tells you what matters',
      desc: 'High weightage topics first, low priority later',
      icon: TrendingUp,
    },
    {
      title: 'Keeps you accountable',
      desc: 'No fake motivation, just honest tracking',
      icon: BookOpen,
    },
  ];

  const trustPoints = [
    'No distractions, only study',
    'Structured daily guidance',
    'Real exam-focused approach',
  ];

  const ratings = [
    { label: 'TEACHER', score: '9/10' },
    { label: 'HUMAN', score: '10/10' },
    { label: 'AGONY AUNT', score: '11/10' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f0]/95 backdrop-blur-sm border-b border-gray-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2d2d2d] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-serif font-semibold text-xl text-[#2d2d2d]">SETU</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="gap-2 font-medium border-2 border-[#2d2d2d] text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-white"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section - Notebook Paper Style */}
      <section className="relative pt-24 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Notebook grid background */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `
            linear-gradient(#2d2d2d 1px, transparent 1px),
            linear-gradient(90deg, #2d2d2d 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }} />
        
        {/* Scattered formulas - decorative */}
        <div className="absolute top-32 left-8 text-[#2d2d2d]/20 font-mono text-sm rotate-[-8deg] hidden lg:block">
          E = mc²
        </div>
        <div className="absolute top-48 right-12 text-[#2d2d2d]/15 font-mono text-xs rotate-[5deg] hidden lg:block">
          F = ma
        </div>
        <div className="absolute bottom-32 left-16 text-[#2d2d2d]/15 font-mono text-xs rotate-[-3deg] hidden lg:block">
          ∫ f(x)dx
        </div>
        <div className="absolute top-64 left-1/4 text-[#2d2d2d]/10 font-mono text-sm rotate-[12deg] hidden lg:block">
          PV = nRT
        </div>
        <div className="absolute bottom-48 right-1/4 text-[#2d2d2d]/15 font-mono text-xs rotate-[-6deg] hidden lg:block">
          Δ = b² - 4ac
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left">
              {/* Handwritten-style badge */}
              <div className="inline-block mb-6 px-4 py-2 bg-[#fff9c4] border-2 border-[#2d2d2d]/20 rotate-[-1deg] shadow-sm">
                <span className="font-mono text-sm text-[#2d2d2d] font-medium">SETU — Bridge to Exam Success</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2d2d2d] leading-tight mb-6">
                Content is everywhere.
                <br />
                <span className="relative">
                  <span className="text-[#2d2d2d]">Mentorship is not.</span>
                  {/* Underline decoration */}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-lg sm:text-xl text-[#4a4a4a] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Competitive exams are cracked by clarity, discipline and right direction — not more videos.
              </p>

              {/* Trust Points */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                {trustPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#2d2d2d]">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{point}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="h-14 px-10 text-base font-semibold gap-2 bg-[#2d2d2d] text-white hover:bg-[#1a1a1a] shadow-lg hover:shadow-xl transition-all"
                >
                  Start with Jeetu Bhaiya
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-base font-medium border-2 border-[#2d2d2d] text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-white"
                  onClick={() => {
                    document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See how it works
                </Button>
              </div>

              {/* Exam Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-sm text-[#6a6a6a] mr-2">Preparing for:</span>
                {examPills.map((exam) => (
                  <span
                    key={exam}
                    className="px-3 py-1.5 rounded-sm bg-white text-[#2d2d2d] text-sm font-medium border border-[#2d2d2d]/20 shadow-xs"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Video with Lead-in */}
            <div className="flex flex-col items-center lg:items-end gap-6">
              {/* Sticky note style lead-in */}
              <div className="relative bg-[#fff9c4] p-5 rotate-[2deg] shadow-md max-w-[320px] border-b-4 border-[#e6d85c]">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#f0e68c]/60 rounded-sm" />
                <p className="font-mono text-base font-medium text-[#2d2d2d] leading-snug">
                  Before you start, we just need{' '}
                  <span className="underline decoration-2 decoration-accent">21 days</span> from you.
                </p>
                <p className="font-mono text-sm text-[#4a4a4a] mt-2 leading-relaxed">
                  Give these 21 days honestly —
                  and you'll finally feel <strong>clarity</strong> instead of confusion.
                </p>
                <p className="font-mono text-sm text-accent font-bold mt-3">👇 Watch this first.</p>
              </div>
              
              {/* Video Frame - Polaroid style */}
              <div className="relative group rotate-[-1deg]">
                <div className="bg-white p-3 pb-12 shadow-xl border border-gray-200">
                  <div className="relative w-[260px] sm:w-[300px] aspect-[9/16] overflow-hidden bg-[#2d2d2d]">
                    <iframe
                      src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                      title="SETU Preview"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    {/* Mute/Unmute Button */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#2d2d2d] hover:bg-white transition-colors shadow-lg"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Polaroid caption */}
                  <p className="absolute bottom-3 left-0 right-0 text-center font-mono text-xs text-[#6a6a6a]">
                    21 Days Challenge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 bg-white relative">
        {/* Notebook holes decoration */}
        <div className="absolute left-4 top-0 bottom-0 hidden lg:flex flex-col justify-center gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full border-2 border-gray-300 bg-[#f5f5f0]" />
          ))}
        </div>
        
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2d2d2d] mb-4">
              The Real Problem
            </h2>
            <p className="text-lg text-[#4a4a4a] max-w-2xl mx-auto font-mono">
              It's not about studying more. It's about studying <span className="underline decoration-accent decoration-2">right</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            {/* Left Column - Problems */}
            <div className="bg-[#f5f5f0] rounded-none p-6 sm:p-8 border-2 border-[#2d2d2d]/10 relative">
              {/* Tape decoration */}
              <div className="absolute -top-3 left-8 w-16 h-6 bg-[#e8d4a8]/80 rotate-[-2deg]" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-none bg-red-100 flex items-center justify-center border border-red-200">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-mono text-lg font-bold text-[#2d2d2d]">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsLeft.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-none bg-red-100 flex items-center justify-center text-sm text-red-500 font-bold font-mono flex-shrink-0">
                      ✗
                    </span>
                    <span className="text-[#2d2d2d] font-mono">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Questions */}
            <div className="bg-[#f5f5f0] rounded-none p-6 sm:p-8 border-2 border-[#2d2d2d]/10 relative">
              {/* Tape decoration */}
              <div className="absolute -top-3 right-8 w-16 h-6 bg-[#e8d4a8]/80 rotate-[2deg]" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-none bg-amber-100 flex items-center justify-center border border-amber-200">
                  <HelpCircle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-mono text-lg font-bold text-[#2d2d2d]">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsRight.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-none bg-amber-100 flex items-center justify-center text-sm text-amber-600 font-bold font-mono flex-shrink-0">
                      ?
                    </span>
                    <span className="text-[#2d2d2d] font-mono">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Section - Chalkboard Style */}
      <section id="mentor-section" className="py-20 px-4 sm:px-6 bg-[#2d2d2d] relative overflow-hidden">
        {/* Chalk dust texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />
        
        {/* Chalk formulas decoration */}
        <div className="absolute top-20 left-8 text-white/10 font-mono text-sm rotate-[-5deg] hidden lg:block">
          ∮ B·dl = μ₀I
        </div>
        <div className="absolute bottom-32 right-12 text-white/10 font-mono text-xs rotate-[8deg] hidden lg:block">
          λ = h/mv
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            {/* Chalk-style badge */}
            <div className="inline-block mb-4 px-4 py-2 border-2 border-dashed border-white/30">
              <span className="font-mono text-sm text-white/80">Your Personal Mentor</span>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              Meet Jeetu Bhaiya
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto font-mono">
              Not a chatbot. Not a teacher. A mentor who thinks with you.
            </p>

            {/* Ratings - Kota Factory style */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {ratings.map((rating, i) => (
                <div key={i} className="text-left">
                  <span className="font-mono text-white/90 font-bold text-lg">{rating.label}</span>
                  <span className="font-mono text-accent font-bold text-lg ml-2">— {rating.score}</span>
                </div>
              ))}
            </div>

            {/* Mentor Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {mentorPills.map((pill) => (
                <span
                  key={pill}
                  className="px-4 py-2 bg-white/10 text-white text-sm font-mono border border-white/20"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Mentor Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {mentorCards.map((card, i) => (
              <div
                key={i}
                className="bg-white/5 p-6 border border-white/10 hover:bg-white/10 hover:border-accent/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <card.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-white text-lg mb-1">{card.title}</h4>
                    <p className="text-white/60 font-mono text-sm">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote - Sticky note style */}
          <div className="flex justify-center">
            <div className="bg-[#fff9c4] p-6 rotate-[1deg] shadow-lg max-w-md border-b-4 border-[#e6d85c]">
              <blockquote className="font-mono text-lg text-[#2d2d2d] italic text-center">
                "Focused on results, not motivation quotes."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-[#f5f5f0] relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `
            linear-gradient(#2d2d2d 1px, transparent 1px),
            linear-gradient(90deg, #2d2d2d 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }} />
        
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2d2d2d] mb-4">
            Ready to start the right way?
          </h2>
          <p className="text-lg text-[#4a4a4a] mb-8 font-mono">
            21 days. One mentor. Complete clarity.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="h-14 px-10 text-base font-semibold gap-2 bg-[#2d2d2d] text-white hover:bg-[#1a1a1a] shadow-lg hover:shadow-xl transition-all"
          >
            Start with Jeetu Bhaiya
            <ArrowRight className="h-5 w-5" />
          </Button>
          
          <p className="text-sm text-[#6a6a6a] mt-6 font-mono">
            No spam. No distractions. Only study.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-gray-300 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2d2d2d] flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-mono text-sm text-[#2d2d2d]">
              SETU — Bridge to Exam Success
            </span>
          </div>
          <p className="text-sm text-[#6a6a6a] font-mono">
            Built for serious students, by serious mentors.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
