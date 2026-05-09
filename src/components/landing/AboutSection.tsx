import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, BrainCircuit, Target, BookOpenCheck, GraduationCap } from 'lucide-react';

const trustCards = [
  {
    icon: <Users className="w-6 h-6 text-blue-400" />,
    title: "52+ Verified Teachers",
    desc: "Learn from the best minds in the country.",
    delay: 0.1
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-violet-400" />,
    title: "AI-Powered Learning",
    desc: "Adaptive algorithms that learn your weaknesses.",
    delay: 0.2
  },
  {
    icon: <Target className="w-6 h-6 text-cyan-400" />,
    title: "Competitive Focused",
    desc: "Zero fluff, purely exam-oriented preparation.",
    delay: 0.3
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-fuchsia-400" />,
    title: "JEE, NEET & Boards",
    desc: "Comprehensive tracks for all major Indian exams.",
    delay: 0.4
  },
  {
    icon: <BookOpenCheck className="w-6 h-6 text-indigo-400" />,
    title: "Smart Revision",
    desc: "Formula-first short notes and pyq triggers.",
    delay: 0.5
  },
  {
    icon: <Sparkles className="w-6 h-6 text-sky-400" />,
    title: "Student-First",
    desc: "Designed around your focus, memory and retention.",
    delay: 0.6
  }
];

const AboutSection: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-[#07111F]">
      
      {/* Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium tracking-wide text-gray-300">
              Built by students. Backed by mentors. Designed for aspirants.
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8"
          >
            Who Are We?
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-3xl leading-relaxed"
          >
            Setu is an AI-powered learning platform built to simplify competitive exam preparation for students across India. We combine structured learning, mentorship, adaptive practice, and smart revision tools to help aspirants study better — not longer.
          </motion.p>
        </div>

        {/* BENTO GRID - TRUST CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {trustCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: card.delay }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <div className="relative h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SECTION 2: WHAT ARE WE BUILDING */}
        <div className="flex flex-col lg:flex-row gap-16 items-center mb-16">
          <div className="flex-1 space-y-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white"
            >
              What Are We Building?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 leading-relaxed"
            >
              We are building the future learning ecosystem for Indian students — where AI, mentorship, and proven teaching methods work together.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 leading-relaxed"
            >
              Instead of endless PDFs and random YouTube videos, Setu gives students smart revision notes, personalized practice, adaptive test analysis, AI doubt solving, exam-focused paths, and guidance from top educators.
            </motion.p>
          </div>

          {/* VISION CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-1 w-full"
          >
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-gradient-xy" />
              
              {/* Glass Card */}
              <div className="relative p-12 rounded-[2rem] bg-black/60 backdrop-blur-xl border border-white/10 overflow-hidden">
                
                {/* Subtle Grid Background inside card */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
                
                {/* Floating Particles (CSS Animation simulated) */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full blur-[1px] animate-pulse" />
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-violet-400 rounded-full blur-[1px] animate-ping" />
                <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-cyan-400/30 rounded-full blur-[2px] animate-bounce" />

                <div className="relative z-10">
                  <Sparkles className="w-10 h-10 text-white/40 mb-8" />
                  <h3 className="text-2xl md:text-3xl font-medium leading-relaxed text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                    "Our mission is to make high-quality competitive exam preparation accessible, structured, and affordable for every student in India."
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
