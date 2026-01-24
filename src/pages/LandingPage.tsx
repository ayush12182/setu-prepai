import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, AlertTriangle, HelpCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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
    },
    {
      title: 'Breaks syllabus into priorities',
      desc: 'Clear roadmap, not overwhelming lists',
    },
    {
      title: 'Tells you what matters',
      desc: 'High weightage topics first, low priority later',
    },
    {
      title: 'Keeps you accountable',
      desc: 'No fake motivation, just honest tracking',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-serif font-semibold text-lg text-foreground">SETU</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
            SETU — Bridge to Exam Success
          </Badge>

          {/* Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6">
            Content is everywhere.
            <br />
            <span className="text-muted-foreground">Mentorship is not.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Competitive exams are cracked by clarity, discipline and right direction — not more videos.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-12 px-8 text-base gap-2 bg-primary hover:bg-primary/90"
            >
              Start with Jeetu Bhaiya
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-8 text-base text-muted-foreground"
              onClick={() => {
                document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See how it works
            </Button>
          </div>

          {/* Exam Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {examPills.map((exam) => (
              <span
                key={exam}
                className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
              >
                {exam}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 bg-secondary/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Column - Problems */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsLeft.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-xs text-destructive font-medium">
                      ×
                    </span>
                    {problem}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Questions */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsRight.map((problem, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent font-medium">
                      ?
                    </span>
                    {problem}
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
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Meet Jeetu Bhaiya
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Not a chatbot. Not a teacher. A mentor who thinks with you.
            </p>

            {/* Mentor Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {mentorPills.map((pill) => (
                <span
                  key={pill}
                  className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
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
                className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{card.title}</h4>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="text-center">
            <blockquote className="font-serif text-xl sm:text-2xl text-muted-foreground italic max-w-2xl mx-auto">
              "Focused on results, not motivation quotes."
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
            Ready to start the right way?
          </h2>
          <p className="text-lg opacity-80 mb-8">
            No spam. No distractions. Only study.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="h-12 px-8 text-base gap-2"
          >
            Start with Jeetu Bhaiya
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">S</span>
            </div>
            <span className="font-serif text-sm text-muted-foreground">
              SETU — Bridge to Exam Success
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for serious students, by serious mentors.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
