import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX, Sparkles } from 'lucide-react';

const examPills = ['JEE Main', 'JEE Advanced', 'NEET', 'UCEED', 'CA Foundation'];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative pt-28 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fb] via-white to-[#fff7ed]" />
      
      {/* Static decorative orbs with CSS animations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-[#e07a3a]/15 to-[#e07a3a]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

      {/* Geometric patterns */}
      <div className="absolute top-32 right-20 w-4 h-4 bg-[#e07a3a]/30 rotate-45" />
      <div className="absolute top-48 right-32 w-2 h-2 bg-[#1e3a5f]/30 rotate-45" />
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-[#1e3a5f]/20 rotate-45" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1e3a5f]/10 to-[#e07a3a]/10 border border-[#1e3a5f]/10 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#e07a3a]" />
              <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wide">For JEE & NEET Aspirants</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#1e3a5f] leading-[1.1] mb-6">
              Content is everywhere.
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-[#e07a3a] to-[#d06a2a] bg-clip-text text-transparent">
                  Mentorship is not.
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#e07a3a] to-[#d06a2a] rounded-full" />
              </span>
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
                className="group h-13 px-7 text-base font-semibold bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] text-white hover:from-[#2a4a6f] hover:to-[#3a5a7f] rounded-xl shadow-lg shadow-[#1e3a5f]/25 hover:shadow-xl hover:shadow-[#1e3a5f]/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-13 px-7 text-base font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl backdrop-blur-sm transition-all duration-300"
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
                  className="px-3.5 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-gray-600 text-sm font-medium border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1e3a5f]/20 hover:scale-105 transition-all duration-200 cursor-default"
                >
                  {exam}
                </span>
              ))}
            </div>
          </div>

          {/* Right - Video */}
          <div className="flex flex-col items-center gap-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Lead-in Card */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-5 shadow-lg shadow-gray-100/50 max-w-[340px] hover:scale-[1.02] hover:-translate-y-1 transition-transform duration-300">
              <p className="text-lg font-semibold text-[#1e3a5f] leading-snug mb-2">
                Give us 21 days honestly
              </p>
              <p className="text-gray-500 text-sm">
                You'll finally feel clarity instead of confusion.
              </p>
            </div>
            
            {/* Video Frame */}
            <div className="relative w-full max-w-[480px] group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1e3a5f]/20 via-[#e07a3a]/20 to-[#1e3a5f]/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-white/20">
                <iframe
                  src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                  title="SETU Preview"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all shadow-lg hover:scale-105"
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
  );
};
