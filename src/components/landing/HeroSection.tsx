import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Clean background - Soft Off-White */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Main Headline - Deep Navy */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-primary leading-[1.1] mb-6">
              Content is everywhere.
              <br />
              <span className="relative">
                <span className="text-accent">
                  Mentorship is not.
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-accent rounded-full" />
              </span>
            </h1>

            {/* Subheading - Calm Grey */}
            <p className="text-lg sm:text-xl text-secondary-foreground max-w-lg mx-auto lg:mx-0 mb-4 leading-relaxed">
              SETU is not just notes or videos.
              <br />
              <span className="text-primary font-medium">
                It is a mentor that tells you what to study, how much to study, and when to move on.
              </span>
            </p>

            {/* Mentor positioning */}
            <p className="text-base text-secondary-foreground max-w-md mx-auto lg:mx-0 mb-8 italic">
              Not a chatbot. Not random AI.
              <br />
              A mentor that thinks with you — like <span className="text-accent font-semibold not-italic">Jeetu Bhaiya</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
              {/* Primary Button - Deep Navy */}
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="group h-14 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-[hsl(213_32%_14%)] rounded-xl shadow-[0_6px_18px_rgba(30,42,58,0.25)] hover:shadow-[0_8px_24px_rgba(30,42,58,0.35)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              {/* Secondary Button - Navy Border */}
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-medium border-2 border-primary text-primary bg-transparent hover:bg-primary/5 rounded-xl transition-all duration-300"
                onClick={() => {
                  document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>

            {/* Exams Section */}
            <div className="space-y-3">
              {/* Muted Label */}
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Built for serious aspirants
              </p>
              {/* Exam Tabs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {['JEE Main', 'JEE Advanced', 'NEET', 'UCEED', 'CA Foundation'].map((exam, i) => (
                  <span
                    key={exam}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-default ${
                      i === 0 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-card text-primary border-primary/30 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Video */}
          <div className="flex flex-col items-center gap-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            {/* 21 Days Card - Light Saffron Tint */}
            <div className="bg-[hsl(32_100%_96%)] border border-accent rounded-2xl p-6 shadow-[0_6px_18px_rgba(0,0,0,0.06)] max-w-[360px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
              <p className="text-xl font-semibold text-primary leading-snug mb-2">
                Give us 21 honest days.
              </p>
              <p className="text-secondary-foreground">
                We'll give you direction for your exam.
              </p>
            </div>
            
            {/* Video Frame */}
            <div className="relative w-full max-w-[480px] group">
              <div className="relative w-full overflow-hidden">
                {/* Video title */}
                <p className="text-center text-sm font-medium text-primary mb-3">
                  Why SETU is different
                </p>
                {/* Video with navy border */}
                <div className="aspect-video rounded-2xl overflow-hidden bg-primary shadow-[0_6px_18px_rgba(0,0,0,0.06)] border-2 border-primary">
                  <iframe
                    src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                    title="SETU Preview"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-card flex items-center justify-center text-primary hover:bg-card/90 transition-all shadow-lg hover:scale-105"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                {/* Caption - Calm Grey */}
                <p className="text-center text-sm text-secondary-foreground mt-3">
                  Built with real JEE students. Designed like Kota classrooms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
