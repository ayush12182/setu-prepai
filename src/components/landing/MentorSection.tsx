import React from 'react';
import { Clock, Target, TrendingUp, BookOpen } from 'lucide-react';

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

const stats = [
  { value: '9/10', label: 'Teacher', highlight: false },
  { value: '10/10', label: 'Human', highlight: false },
  { value: '11/10', label: 'Agony Aunt', highlight: true },
];

export const MentorSection: React.FC = () => {
  return (
    <section id="mentor-section" className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Gradient background - Deep Navy */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(213_31%_15%)] to-[hsl(213_35%_12%)]" />
      
      {/* Subtle decorative orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold uppercase tracking-wide mb-4">
            Your Personal Mentor
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Meet <span className="bg-gradient-to-r from-accent to-[hsl(26_85%_75%)] bg-clip-text text-transparent">Jeetu Bhaiya</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Not a chatbot. Not a teacher. A mentor who thinks with you.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            {stats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <div className="text-center hover:scale-105 transition-transform">
                  <div className={`text-4xl font-bold mb-1 ${stat.highlight ? 'text-accent' : 'text-white'}`}>
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm font-medium">{stat.label}</div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-12 bg-white/10" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mentor Cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {mentorCards.map((card, i) => (
            <div
              key={i}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-[hsl(26_90%_55%)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-1 group-hover:text-accent transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                    {card.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Tagline */}
        <div className="text-center mt-14">
          <blockquote className="text-xl text-white/60 font-medium italic">
            "Focused on results, not motivation quotes."
          </blockquote>
        </div>
      </div>
    </section>
  );
};
