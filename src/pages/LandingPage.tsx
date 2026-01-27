import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle, HelpCircle, BookOpen, Target, Clock, TrendingUp, Volume2, VolumeX, CheckCircle2, Star, Zap } from 'lucide-react';

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
    { icon: Zap, text: 'No distractions' },
    { icon: Target, text: 'Daily guidance' },
    { icon: Star, text: 'Exam-focused' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e07a3a] to-[#d4532a] flex items-center justify-center shadow-lg shadow-[#e07a3a]/20">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-semibold text-lg text-white tracking-tight">SETU</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="font-medium border-white/20 text-white hover:bg-white hover:text-[#0a0a0a] transition-all duration-300"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-4 sm:px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#e07a3a]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#e07a3a]/10 rounded-full blur-[100px]" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#e07a3a] animate-pulse" />
                <span className="text-sm font-medium text-white/70">Bridge to Exam Success</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-8 tracking-tight">
                Content is
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">everywhere.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e07a3a] via-[#f09c5a] to-[#e07a3a]">
                  Mentorship is not.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-lg sm:text-xl text-white/50 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                Competitive exams are cracked by clarity, discipline and right direction — not more videos.
              </p>

              {/* Trust Points */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-10">
                {trustPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#e07a3a]/20 transition-colors duration-300">
                      <point.icon className="w-4 h-4 text-[#e07a3a]" />
                    </div>
                    <span className="text-sm text-white/60 font-medium group-hover:text-white/80 transition-colors duration-300">{point.text}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="h-14 px-8 text-base font-semibold gap-3 bg-gradient-to-r from-[#e07a3a] to-[#d4532a] text-white hover:from-[#f08a4a] hover:to-[#e4633a] rounded-xl shadow-lg shadow-[#e07a3a]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#e07a3a]/30 active:scale-[0.98] group"
                >
                  Start with Jeetu Bhaiya
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 px-8 text-base font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                  onClick={() => {
                    document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See how it works
                </Button>
              </div>

              {/* Exam Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-xs text-white/40 mr-2 uppercase tracking-wider">For</span>
                {examPills.map((exam) => (
                  <span
                    key={exam}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm font-medium border border-white/5 hover:border-[#e07a3a]/30 hover:text-white/80 transition-all duration-300 cursor-default"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Video */}
            <div className="flex flex-col items-center lg:items-end gap-6">
              {/* Lead-in text */}
              <div className="text-center lg:text-right max-w-[340px]">
                <p className="text-2xl font-semibold text-white leading-snug">
                  Before you start, we just need <span className="text-[#e07a3a]">21 days</span> from you.
                </p>
                <p className="text-white/40 mt-3 text-sm leading-relaxed">
                  Give these 21 days honestly — and you'll finally feel clarity instead of confusion.
                </p>
              </div>
              
              {/* Video Frame */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#e07a3a]/30 via-[#e07a3a]/20 to-[#e07a3a]/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-2xl shadow-black/50 transition-all duration-500 group-hover:border-[#e07a3a]/30 group-hover:scale-[1.02]">
                  <iframe
                    src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                    title="SETU Preview"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/10"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-4 sm:px-6 relative">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        
        <div className="relative max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">The Problem</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              The Real Problem
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              It's not about studying more. It's about studying <span className="text-[#e07a3a]">right</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-8 border border-white/10 backdrop-blur-sm hover:border-red-500/20 transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsLeft.map((problem, i) => (
                  <li key={i} className="flex items-center gap-4 group/item">
                    <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-sm text-red-400 font-medium flex-shrink-0 group-hover/item:bg-red-500/20 transition-colors duration-300">
                      ×
                    </span>
                    <span className="text-white/70 group-hover/item:text-white/90 transition-colors duration-300">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column */}
            <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-8 border border-white/10 backdrop-blur-sm hover:border-amber-500/20 transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsRight.map((problem, i) => (
                  <li key={i} className="flex items-center gap-4 group/item">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-sm text-amber-400 font-medium flex-shrink-0 group-hover/item:bg-amber-500/20 transition-colors duration-300">
                      ?
                    </span>
                    <span className="text-white/70 group-hover/item:text-white/90 transition-colors duration-300">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section id="mentor-section" className="py-24 px-4 sm:px-6 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e07a3a]/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e07a3a]/10 border border-[#e07a3a]/20 mb-6">
              <Star className="w-4 h-4 text-[#e07a3a]" />
              <span className="text-sm font-medium text-[#e07a3a]">Your Personal Mentor</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Meet Jeetu Bhaiya
            </h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto">
              Not a chatbot. Not a teacher. A mentor who thinks with you.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-10 mt-12">
              {[
                { score: '9/10', label: 'Teacher', highlight: false },
                { score: '10/10', label: 'Human', highlight: false },
                { score: '11/10', label: 'Agony Aunt', highlight: true },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className={`text-4xl font-bold transition-all duration-300 group-hover:scale-110 ${stat.highlight ? 'text-[#e07a3a]' : 'text-white'}`}>
                    {stat.score}
                  </div>
                  <div className="text-white/40 text-sm mt-2 group-hover:text-white/60 transition-colors duration-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor Cards */}
          <div className="grid sm:grid-cols-2 gap-5">
            {mentorCards.map((card, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl p-6 border border-white/10 hover:border-[#e07a3a]/30 transition-all duration-500 hover:-translate-y-1 group cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e07a3a]/20 to-[#e07a3a]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#e07a3a]/20">
                    <card.icon className="h-6 w-6 text-[#e07a3a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2 group-hover:text-[#e07a3a] transition-colors duration-300">{card.title}</h4>
                    <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="text-center mt-16">
            <div className="inline-block px-8 py-6 rounded-2xl bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/10">
              <blockquote className="text-xl sm:text-2xl text-white/80 italic font-light">
                "Focused on results, not motivation quotes."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#e07a3a]/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to start the <span className="text-[#e07a3a]">right way</span>?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            21 days. One mentor. Complete clarity.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="h-14 px-10 text-base font-semibold gap-3 bg-gradient-to-r from-[#e07a3a] to-[#d4532a] text-white hover:from-[#f08a4a] hover:to-[#e4633a] rounded-xl shadow-lg shadow-[#e07a3a]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#e07a3a]/30 active:scale-[0.98] group"
          >
            Start with Jeetu Bhaiya
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <p className="text-sm text-white/30 mt-8">
            No spam. No distractions. Only study.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e07a3a] to-[#d4532a] flex items-center justify-center">
              <span className="text-white font-semibold text-xs">S</span>
            </div>
            <span className="text-sm text-white/60">SETU</span>
          </div>
          <p className="text-sm text-white/30">
            Built for serious students, by serious mentors.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
