import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, AlertTriangle, HelpCircle, BookOpen, Target, Clock, TrendingUp, Volume2, VolumeX } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-base">S</span>
            </div>
            <span className="font-serif font-semibold text-xl text-foreground">SETU</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="gap-2 font-medium border-2 hover:bg-secondary"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold bg-accent/15 text-accent hover:bg-accent/20 border-0">
                SETU — Bridge to Exam Success
              </Badge>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Content is everywhere.
                <br />
                <span className="text-primary">Mentorship is not.</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg sm:text-xl text-secondary-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Competitive exams are cracked by clarity, discipline and right direction — not more videos.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="h-14 px-10 text-base font-semibold gap-2 bg-primary hover:bg-setu-navy-light shadow-md hover:shadow-lg transition-all"
                >
                  Start with Jeetu Bhaiya
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-base font-medium border-2 text-foreground hover:bg-secondary"
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
                    className="px-4 py-2 rounded-full bg-card text-foreground text-sm font-medium shadow-xs border border-border"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Video */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-4 border-card bg-card">
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
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-lg border border-border"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 bg-secondary/60">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            {/* Left Column - Problems */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsLeft.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-destructive/15 flex items-center justify-center text-sm text-destructive font-bold">
                      ×
                    </span>
                    <span className="text-foreground font-medium">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Questions */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsRight.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-sm text-accent font-bold">
                      ?
                    </span>
                    <span className="text-foreground font-medium">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section id="mentor-section" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Meet Jeetu Bhaiya
            </h2>
            <p className="text-lg text-secondary-foreground max-w-xl mx-auto">
              Not a chatbot. Not a teacher. A mentor who thinks with you.
            </p>

            {/* Mentor Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {mentorPills.map((pill) => (
                <span
                  key={pill}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold"
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
                className="jeetu-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <card.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg mb-1">{card.title}</h4>
                    <p className="text-secondary-foreground">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="text-center">
            <blockquote className="font-serif text-xl sm:text-2xl text-primary italic max-w-2xl mx-auto">
              "Focused on results, not motivation quotes."
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Ready to start the right way?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            No spam. No distractions. Only study.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="h-14 px-10 text-base font-semibold gap-2 bg-accent text-accent-foreground hover:bg-setu-saffron-dark shadow-lg"
          >
            Start with Jeetu Bhaiya
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">S</span>
            </div>
            <span className="font-serif text-sm text-foreground">
              SETU — Bridge to Exam Success
            </span>
          </div>
          <p className="text-sm text-secondary-foreground">
            Built for serious students, by serious mentors.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
