import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Quote, Clock, Target, TrendingUp, BookOpen } from 'lucide-react';

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

export const MentorSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section id="mentor-section" className="relative py-24 px-6 sm:px-12 overflow-hidden bg-primary">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white rounded-full blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6">
              Meet Your Mentor
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Content is everywhere.
              <br />
              <span className="text-accent">Mentorship is not.</span>
            </h2>

            <div className="relative pl-6 border-l-2 border-accent/50 mb-8">
              <Quote className="absolute -left-3 -top-1 w-6 h-6 text-accent" />
              <p className="text-white/80 text-lg leading-relaxed italic">
                "Padhai sirf notes se nahi hoti. Ek mentor chahiye jo tumhe samjhe,
                tumhari galtiyon ko pakde, aur sahi direction de."
              </p>
              <p className="text-accent font-medium mt-4">— Jeetu Bhaiya's Philosophy</p>
            </div>

            {/* Mentor Cards - Compact */}
            <div className="grid grid-cols-2 gap-3">
              {mentorCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <card.icon className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">{card.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative Frame */}
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/30 to-white/10 rounded-3xl blur-xl" />
            
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <iframe
                src={`https://www.youtube.com/embed/TMgBq8BvLcM?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=TMgBq8BvLcM&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                title="SETU Mentor"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-xl border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">21 Days</div>
                  <div className="text-sm text-muted-foreground">to see the difference</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
