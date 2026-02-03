import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5] to-white" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-primary leading-[1.1] mb-6">
              Content is everywhere.
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-accent to-[hsl(26_90%_55%)] bg-clip-text text-transparent">
                  Mentorship is not.
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-accent to-[hsl(26_90%_55%)] rounded-full opacity-60" />
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-4 leading-relaxed">
              SETU is not just notes or videos.
              <br />
              <span className="text-foreground font-medium">
                It is a mentor that tells you what to study, how much to study, and when to move on.
              </span>
            </p>

            {/* Mentor positioning */}
            <p className="text-base text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8 italic">
              Not a chatbot. Not random AI.
              <br />
              A mentor that thinks with you — like <span className="text-accent font-semibold not-italic">Jeetu Bhaiya</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="group h-14 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-[hsl(213_31%_22%)] rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-medium border-2 border-border text-foreground hover:bg-secondary hover:border-primary/30 rounded-xl transition-all duration-300"
                onClick={() => {
                  document.getElementById('mentor-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>

            {/* Exams Section */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Built for serious aspirants
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {['JEE Main', 'JEE Advanced', 'NEET', 'UCEED', 'CA Foundation'].map((exam) => (
                  <span
                    key={exam}
                    className="px-4 py-2 rounded-lg bg-card text-foreground text-sm font-medium border border-border shadow-xs hover:shadow-sm hover:border-primary/20 transition-all duration-200"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Video */}
          <div className="flex flex-col items-center gap-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            {/* Lead-in Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card max-w-[360px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <p className="text-xl font-semibold text-primary leading-snug mb-2">
                Give us 21 honest days.
              </p>
              <p className="text-muted-foreground">
                We'll give you direction for your exam.
              </p>
            </div>
            
            {/* Video Frame */}
            <div className="relative w-full max-w-[480px] group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/15 to-primary/10 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative w-full overflow-hidden">
                {/* Video title */}
                <p className="text-center text-sm font-medium text-primary mb-3">
                  Why SETU is different
                </p>
                <div className="aspect-video rounded-2xl overflow-hidden bg-primary shadow-2xl border border-primary/20">
                  <iframe
                    src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                    title="SETU Preview"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-white transition-all shadow-lg hover:scale-105"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                {/* Video caption */}
                <p className="text-center text-sm text-muted-foreground mt-3">
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
