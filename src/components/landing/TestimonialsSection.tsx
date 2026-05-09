import React from 'react';
import { motion } from 'framer-motion';

const TESTIMONIALS_ROW_1 = [
  {
    quote: "SETU helped me identify exactly where I was losing marks. Within two weeks I could see the difference in my mock scores.",
    name: "Arjun S.",
    tag: "JEE Main Aspirant",
    initials: "AS",
    color: "#FF9B54",
  },
  {
    quote: "The weakness detection is genuinely useful. It doesn't just tell you what you got wrong — it shows you the pattern.",
    name: "Priya M.",
    tag: "NEET Aspirant",
    initials: "PM",
    color: "#60a5fa",
  },
  {
    quote: "I used to revise everything randomly. Now I have a structured daily plan and my accuracy in Chemistry has improved significantly.",
    name: "Rohan K.",
    tag: "CUET Aspirant",
    initials: "RK",
    color: "#34d399",
  },
  {
    quote: "The 1-page smart revision notes are a lifesaver. I revised the entire Optics chapter in just 5 minutes before my test.",
    name: "Sneha D.",
    tag: "Board Student",
    initials: "SD",
    color: "#c084fc",
  },
  {
    quote: "The AI mentor explains physics concepts better than my coaching teacher. No fluff, just pure clarity.",
    name: "Vikram R.",
    tag: "JEE Advanced Aspirant",
    initials: "VR",
    color: "#f472b6",
  },
];

const TESTIMONIALS_ROW_2 = [
  {
    quote: "I was stuck at 450 in NEET mocks. SETU's diagnostic engine pinpointed my gaps in Plant Physiology. Scored 580 last week!",
    name: "Ananya T.",
    tag: "NEET Aspirant",
    initials: "AT",
    color: "#2dd4bf",
  },
  {
    quote: "The best part is how it tracks my time allocation. I realized I was spending way too much time on easy questions.",
    name: "Kabir M.",
    tag: "JEE Main Aspirant",
    initials: "KM",
    color: "#fbbf24",
  },
  {
    quote: "CUET pattern questions are hard to find. The AI generates authentic, NCERT-based MCQs that perfectly match the real exam.",
    name: "Riya P.",
    tag: "CUET Aspirant",
    initials: "RP",
    color: "#818cf8",
  },
  {
    quote: "Being able to just ask the AI mentor to simplify a complex Organic Chemistry reaction changed the game for me.",
    name: "Aditya V.",
    tag: "JEE Aspirant",
    initials: "AV",
    color: "#e879f9",
  },
  {
    quote: "It feels like having a personal tutor who knows exactly what I need to study today. Highly recommended for self-studiers.",
    name: "Meera J.",
    tag: "NEET Aspirant",
    initials: "MJ",
    color: "#a3e635",
  },
];

const TestimonialCard = ({ t }: { t: any }) => (
  <div className="w-[350px] sm:w-[400px] shrink-0 rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-7 transition-all duration-300 hover:border-white/[0.2] hover:bg-[#0E1726] mx-3">
    <div className="text-4xl font-serif text-white/10 leading-none mb-4 select-none">"</div>
    <p className="text-[#94A3B8] text-sm sm:text-base leading-relaxed mb-6">
      {t.quote}
    </p>
    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ backgroundColor: t.color + '22', border: `1px solid ${t.color}44` }}
      >
        {t.initials}
      </div>
      <div>
        <p className="text-white text-sm font-semibold">{t.name}</p>
        <p className="text-[#94A3B8] text-xs">{t.tag}</p>
      </div>
    </div>
  </div>
);

const TestimonialsSection: React.FC = () => (
  <section id="testimonials" className="py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(59,130,246,0.04),transparent)]" />
    
    <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
      <div className="text-center max-w-xl mx-auto mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF9B54] mb-4"
        >
          Validation
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-white tracking-tight"
        >
          What Aspirants Say
        </motion.h2>
      </div>
    </div>

    {/* Marquee Track 1 (Left to Right) */}
    <div className="relative flex overflow-x-hidden group mb-6">
      <div 
        className="flex whitespace-nowrap group-hover:[animation-play-state:paused]"
        style={{ animation: 'marquee 40s linear infinite' }}
      >
        {[...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_1].map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>

    {/* Marquee Track 2 (Right to Left) */}
    <div className="relative flex overflow-x-hidden group">
      <div 
        className="flex whitespace-nowrap group-hover:[animation-play-state:paused]"
        style={{ animation: 'marquee-reverse 45s linear infinite' }}
      >
        {[...TESTIMONIALS_ROW_2, ...TESTIMONIALS_ROW_2, ...TESTIMONIALS_ROW_2].map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>

    {/* Left/Right Fades */}
    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#07111F] to-transparent z-20" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#07111F] to-transparent z-20" />

    <style>{`
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
      @keyframes marquee-reverse {
        0% { transform: translateX(-33.333%); }
        100% { transform: translateX(0); }
      }
    `}</style>
  </section>
);

export default TestimonialsSection;
