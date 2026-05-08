import React from 'react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: "SETU helped me identify exactly where I was losing marks. Within two weeks I could see the difference in my mock scores.",
    name: "Arjun S.",
    tag: "JEE Main Aspirant · Class 12",
    initials: "AS",
    color: "#FF9B54",
  },
  {
    quote: "The weakness detection is genuinely useful. It doesn't just tell you what you got wrong — it shows you the pattern.",
    name: "Priya M.",
    tag: "NEET Aspirant · Class 12",
    initials: "PM",
    color: "#60a5fa",
  },
  {
    quote: "I used to revise everything randomly. Now I have a structured daily plan and my accuracy in Chemistry has improved significantly.",
    name: "Rohan K.",
    tag: "CUET Aspirant · Class 12",
    initials: "RK",
    color: "#34d399",
  },
];

const TestimonialsSection: React.FC = () => (
  <section id="testimonials" className="py-28 relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(59,130,246,0.04),transparent)]" />
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="text-center max-w-xl mx-auto mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF9B54] mb-4"
        >
          Testimonials
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/[0.08] bg-[#0E1726]/60 p-7 transition-all duration-300 group hover:border-white/[0.14]"
          >
            {/* Quote mark */}
            <div className="text-4xl font-serif text-white/10 leading-none mb-4 select-none">"</div>

            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 group-hover:text-white/70 transition-colors">
              {t.quote}
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: t.color + '22', border: `1.5px solid ${t.color}44` }}
              >
                {t.initials}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{t.name}</p>
                <p className="text-[#94A3B8] text-xs">{t.tag}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
