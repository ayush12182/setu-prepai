import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, HelpCircle, BookOpen, Target, Clock, TrendingUp, Volume2, VolumeX, Check } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg text-[#1e3a5f]">SETU</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-gray-600 hover:text-[#1e3a5f]"
            >
              Login
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/auth')}
              className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-[#f8f9fb] to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 mb-6">
                <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wide">For JEE & NEET Aspirants</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#1e3a5f] leading-[1.15] mb-6">
                Content is everywhere.
                <br />
                <span className="text-[#e07a3a]">Mentorship is not.</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                Competitive exams are cracked by clarity, discipline and right direction — not more videos.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="h-12 px-6 text-base font-medium bg-[#1e3a5f] text-white hover:bg-[#2a4a6f] rounded-lg shadow-sm"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => {
                    document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </Button>
              </div>

              {/* Exam Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {examPills.map((exam) => (
                  <span
                    key={exam}
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-sm font-medium"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Video */}
            <div className="flex flex-col items-center gap-5">
              {/* Lead-in Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm max-w-[340px]">
                <p className="text-lg font-semibold text-[#1e3a5f] leading-snug mb-2">
                  Give us 21 days honestly
                </p>
                <p className="text-gray-500 text-sm">
                  You'll finally feel clarity instead of confusion.
                </p>
              </div>
              
              {/* Video Frame */}
              <div className="relative">
                <div className="w-[260px] sm:w-[280px] aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 shadow-xl border border-gray-200">
                  <iframe
                    src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                    title="SETU Preview"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-md"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-4">
              The Real Problem
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              It's not about studying more. It's about studying right.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#1e3a5f]">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-3">
                {problemsLeft.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs text-red-600 font-medium flex-shrink-0">
                      ×
                    </span>
                    <span className="text-gray-600">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#1e3a5f]">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-3">
                {problemsRight.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-600 font-medium flex-shrink-0">
                      ?
                    </span>
                    <span className="text-gray-600">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section id="mentor-section" className="py-20 px-4 sm:px-6 bg-[#1e3a5f]">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <p className="text-[#e07a3a] text-sm font-semibold uppercase tracking-wide mb-3">
              Your Personal Mentor
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Meet Jeetu Bhaiya
            </h2>
            <p className="text-white/60 text-lg max-w-md mx-auto">
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
                className="bg-white/10 rounded-xl p-5 border border-white/10 hover:bg-white/[0.15] transition-colors"
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
          <div className="text-center mt-12">
            <blockquote className="text-xl text-white/70 italic">
              "Focused on results, not motivation quotes."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#1e3a5f] mb-1">21 Days</div>
              <p className="text-gray-500 text-sm">To feel the difference</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1e3a5f] mb-1">1 Mentor</div>
              <p className="text-gray-500 text-sm">Who understands you</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1e3a5f] mb-1">100% Focus</div>
              <p className="text-gray-500 text-sm">On what matters</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-4">
            Ready to start the right way?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Join thousands of students who found clarity with SETU.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-12 px-6 text-base font-medium bg-[#1e3a5f] text-white hover:bg-[#2a4a6f] rounded-lg shadow-sm"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1e3a5f] flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm text-gray-600">SETU</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2024 SETU. Built for serious students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
