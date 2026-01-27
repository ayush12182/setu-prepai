import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    'No distractions',
    'Daily guidance',
    'Exam-focused',
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg text-[#1a1a1a] tracking-tight">SETU</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="font-medium text-[#1a1a1a] hover:bg-gray-100"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left">
              {/* Eyebrow */}
              <p className="text-sm font-medium text-[#666] mb-4 tracking-wide uppercase">
                Bridge to Exam Success
              </p>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#1a1a1a] leading-[1.1] mb-6 tracking-tight">
                Content is everywhere.
                <br />
                <span className="text-[#e07a3a]">Mentorship is not.</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg text-[#555] max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Competitive exams are cracked by clarity, discipline and right direction — not more videos.
              </p>

              {/* Trust Points */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mb-10">
                {trustPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#e07a3a]" />
                    <span className="text-sm text-[#444] font-medium">{point}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-12">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="h-12 px-8 text-base font-medium gap-2 bg-[#1a1a1a] text-white hover:bg-[#333] rounded-lg"
                >
                  Start with Jeetu Bhaiya
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 px-8 text-base font-medium text-[#555] hover:text-[#1a1a1a] hover:bg-gray-100 rounded-lg"
                  onClick={() => {
                    document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See how it works
                </Button>
              </div>

              {/* Exam Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {examPills.map((exam) => (
                  <span
                    key={exam}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-[#444] text-sm font-medium"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Video */}
            <div className="flex flex-col items-center lg:items-end gap-5">
              {/* Lead-in text */}
              <div className="text-center lg:text-right max-w-[320px]">
                <p className="text-xl font-semibold text-[#1a1a1a] leading-snug">
                  Before you start, we just need <span className="text-[#e07a3a]">21 days</span> from you.
                </p>
                <p className="text-[#666] mt-2 text-sm">
                  Give these 21 days honestly — and you'll finally feel clarity instead of confusion.
                </p>
              </div>
              
              {/* Video Frame */}
              <div className="relative">
                <div className="w-[280px] sm:w-[300px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-[#1a1a1a]">
                  <iframe
                    src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                    title="SETU Preview"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1a1a1a] hover:bg-white transition-colors shadow-lg"
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
      <section className="py-20 px-4 sm:px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
              The Real Problem
            </h2>
            <p className="text-[#666] text-lg">
              It's not about studying more. It's about studying right.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="bg-[#fafafa] rounded-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-[#1a1a1a]">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsLeft.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs text-red-500 font-medium flex-shrink-0">
                      ×
                    </span>
                    <span className="text-[#444]">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column */}
            <div className="bg-[#fafafa] rounded-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-[#1a1a1a]">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsRight.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-600 font-medium flex-shrink-0">
                      ?
                    </span>
                    <span className="text-[#444]">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section id="mentor-section" className="py-20 px-4 sm:px-6 bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <p className="text-[#e07a3a] text-sm font-medium uppercase tracking-wide mb-3">
              Your Personal Mentor
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Meet Jeetu Bhaiya
            </h2>
            <p className="text-white/60 text-lg max-w-lg mx-auto">
              Not a chatbot. Not a teacher. A mentor who thinks with you.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">9/10</div>
                <div className="text-white/50 text-sm mt-1">Teacher</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10/10</div>
                <div className="text-white/50 text-sm mt-1">Human</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-[#e07a3a]">11/10</div>
                <div className="text-white/50 text-sm mt-1">Agony Aunt</div>
              </div>
            </div>
          </div>

          {/* Mentor Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {mentorCards.map((card, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#e07a3a]/20 flex items-center justify-center flex-shrink-0">
                    <card.icon className="h-5 w-5 text-[#e07a3a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{card.title}</h4>
                    <p className="text-white/50 text-sm">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="text-center mt-14">
            <blockquote className="text-xl text-white/80 italic">
              "Focused on results, not motivation quotes."
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-[#fafafa]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4 tracking-tight">
            Ready to start the right way?
          </h2>
          <p className="text-[#666] text-lg mb-8">
            21 days. One mentor. Complete clarity.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="h-12 px-8 text-base font-medium gap-2 bg-[#1a1a1a] text-white hover:bg-[#333] rounded-lg"
          >
            Start with Jeetu Bhaiya
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm text-[#999] mt-6">
            No spam. No distractions. Only study.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white font-medium text-xs">S</span>
            </div>
            <span className="text-sm text-[#444]">SETU</span>
          </div>
          <p className="text-sm text-[#999]">
            Built for serious students, by serious mentors.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
