import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX, Sparkles } from 'lucide-react';

const examPills = ['JEE Main', 'JEE Advanced', 'NEET', 'UCEED', 'CA Foundation'];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative pt-28 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fb] via-white to-[#fff7ed]" />
      
      {/* Decorative floating orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 rounded-full blur-3xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-[#e07a3a]/15 to-[#e07a3a]/5 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Geometric patterns */}
      <div className="absolute top-32 right-20 w-4 h-4 bg-[#e07a3a]/30 rotate-45" />
      <div className="absolute top-48 right-32 w-2 h-2 bg-[#1e3a5f]/30 rotate-45" />
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-[#1e3a5f]/20 rotate-45" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1e3a5f]/10 to-[#e07a3a]/10 border border-[#1e3a5f]/10 mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-[#e07a3a]" />
              <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wide">For JEE & NEET Aspirants</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#1e3a5f] leading-[1.1] mb-6"
            >
              Content is everywhere.
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-[#e07a3a] to-[#d06a2a] bg-clip-text text-transparent">
                  Mentorship is not.
                </span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#e07a3a] to-[#d06a2a] rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Competitive exams are cracked by clarity, discipline and right direction — not more videos.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10"
            >
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
            </motion.div>

            {/* Exam Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2"
            >
              {examPills.map((exam, index) => (
                <motion.span
                  key={exam}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-3.5 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-gray-600 text-sm font-medium border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1e3a5f]/20 transition-all duration-200 cursor-default"
                >
                  {exam}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Lead-in Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-5 shadow-lg shadow-gray-100/50 max-w-[340px]"
            >
              <p className="text-lg font-semibold text-[#1e3a5f] leading-snug mb-2">
                Give us 21 days honestly
              </p>
              <p className="text-gray-500 text-sm">
                You'll finally feel clarity instead of confusion.
              </p>
            </motion.div>
            
            {/* Video Frame */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative w-full max-w-[480px] group"
            >
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
