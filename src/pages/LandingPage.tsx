import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, HelpCircle, BookOpen, Target, Clock, TrendingUp, Volume2, VolumeX, CheckCircle2, Sparkles } from 'lucide-react';

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

      {/* Hero Section - Dramatic Navy Background */}
      <section className="relative pt-24 pb-24 px-4 sm:px-6 bg-primary overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Gradient accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                SETU — Bridge to Exam Success
              </Badge>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
                Content is everywhere.
                <br />
                <span className="text-accent">Mentorship is not.</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Competitive exams are cracked by clarity, discipline and right direction — not more videos.
              </p>

              {/* Trust Points */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                {trustPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-primary-foreground/90">
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
                  className="h-14 px-10 text-base font-semibold gap-2 bg-accent text-accent-foreground hover:bg-setu-saffron-dark shadow-lg hover:shadow-xl transition-all"
                >
                  Start with Jeetu Bhaiya
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-base font-medium border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                  onClick={() => {
                    document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See how it works
                </Button>
              </div>

              {/* Exam Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-sm text-primary-foreground/60 mr-2">Preparing for:</span>
                {examPills.map((exam) => (
                  <span
                    key={exam}
                    className="px-3 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm font-medium border border-primary-foreground/20"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Video with Lead-in */}
            <div className="flex flex-col items-center lg:items-end gap-6">
              {/* Lead-in Message */}
              <div className="text-center lg:text-right max-w-[340px] animate-fade-in">
                <p className="font-serif text-xl sm:text-2xl font-bold text-primary-foreground leading-snug">
                  Before you start, we just need{' '}
                  <span className="text-accent">21 days</span> from you.
                </p>
                <p className="text-base text-primary-foreground/70 mt-3 leading-relaxed">
                  Give these 21 days honestly —<br />
                  and you'll finally feel <span className="font-medium text-primary-foreground">clarity</span> instead of confusion.
                </p>
                <p className="text-sm text-accent font-medium mt-4 animate-pulse-soft">👇 Watch this first. Then we begin.</p>
              </div>
              
              {/* Video Frame with Glow */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-accent/30 via-accent/20 to-accent/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                
                <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-4 border-card/20 bg-card">
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
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-lg border border-border"
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

      {/* Problem Section - Warm Background */}
      <section className="py-20 px-4 sm:px-6 bg-background relative">
        {/* Decorative line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              The Real Problem
            </h2>
            <p className="text-lg text-secondary-foreground max-w-2xl mx-auto">
              It's not about studying more. It's about studying right.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            {/* Left Column - Problems */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border hover:shadow-lg transition-shadow">
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
                  <li key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="w-7 h-7 rounded-full bg-destructive/15 flex items-center justify-center text-sm text-destructive font-bold flex-shrink-0">
                      ×
                    </span>
                    <span className="text-foreground font-medium">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Questions */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border hover:shadow-lg transition-shadow">
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
                  <li key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-sm text-accent font-bold flex-shrink-0">
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

      {/* Mentor Section - Navy with Texture */}
      <section id="mentor-section" className="py-20 px-4 sm:px-6 bg-primary relative overflow-hidden">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
        
        <div className="relative max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-1.5 text-sm font-semibold bg-accent/20 text-accent border-accent/30">
              Your Personal Mentor
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Meet Jeetu Bhaiya
            </h2>
            <p className="text-lg text-primary-foreground/70 max-w-xl mx-auto">
              Not a chatbot. Not a teacher. A mentor who thinks with you.
            </p>

            {/* Mentor Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {mentorPills.map((pill, i) => (
                <span
                  key={pill}
                  className="px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-semibold border border-accent/30 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
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
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10 hover:bg-primary-foreground/15 hover:border-accent/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <card.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-foreground text-lg mb-1">{card.title}</h4>
                    <p className="text-primary-foreground/70">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="text-center">
            <div className="inline-block bg-primary-foreground/5 rounded-2xl px-8 py-6 border border-primary-foreground/10">
              <blockquote className="font-serif text-xl sm:text-2xl text-accent italic">
                "Focused on results, not motivation quotes."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to start the right way?
          </h2>
          <p className="text-lg text-secondary-foreground mb-8">
            21 days. One mentor. Complete clarity.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="h-14 px-10 text-base font-semibold gap-2 bg-primary text-primary-foreground hover:bg-setu-navy-light shadow-lg hover:shadow-xl transition-all"
          >
            Start with Jeetu Bhaiya
            <ArrowRight className="h-5 w-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            No spam. No distractions. Only study.
          </p>
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
