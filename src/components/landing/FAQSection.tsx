import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'What exams does PrepEntrance cover?',
    answer: 'PrepEntrance covers JEE Mains, JEE Advanced, NEET UG, and CUET. Content is available for Class 11, Class 12, and Droppers. Foundation courses for Class 6–10 are also available.',
  },
  {
    question: 'Is the 3-day trial really free?',
    answer: 'Yes — no credit card required. Sign up, verify your email, and you get 3 full days of access to every feature: AI Teachers, Practice, Mock Tests, and Revision.',
  },
  {
    question: 'How is PrepEntrance different from YouTube or PDF notes?',
    answer: 'PrepEntrance combines AI-personalized practice (questions that adapt to your weak spots), live AI Teachers (voice + HeyGen avatar — like an interactive, exam-focused classroom), and real-time analytics that tell you exactly what to study next. Passive consumption is not learning.',
  },
  {
    question: 'What happens after my 3-day trial ends?',
    answer: 'After the trial, you can upgrade to PrepEntrance Pro for ₹349/month. You can also earn bonus trial days by referring friends — each successful referral adds 1 extra day.',
  },
  {
    question: 'How does the AI Teacher work?',
    answer: 'Each AI Teacher (P.K. Sir for Physics, V.K. Sir for Chemistry, A.K. Sir for Maths) has a unique personality and teaching style. You can talk to them by voice or text, ask doubts at any time, and they explain concepts like a highly-experienced teacher (NCERT + PYQ aligned) — with analogies, real examples, and step-by-step JEE solutions.',
  },
  {
    question: 'Can I use PrepEntrance on mobile?',
    answer: 'Yes. PrepEntrance is fully responsive and optimized for mobile browsers. A dedicated app is in development.',
  },
  {
    question: 'Is my progress saved if I switch devices?',
    answer: 'Yes. Your account is synced across devices via cloud storage. Your streak, practice history, and analytics are always up to date.',
  },
  {
    question: 'Do you support regional languages?',
    answer: 'Yes. The AI Teachers support 9 languages: English, Hinglish, Hindi, Kannada, Telugu, Punjabi, Marathi, Tamil, and Gujarati.',
  },
];

export const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 px-6 sm:px-12 bg-[#FAFAF7]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D1117] mb-4">
            Frequently asked questions
          </h2>
          <p className="text-[#0D1117]/60 text-lg max-w-lg mx-auto">
            Everything you need to know before you start.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left bg-white border border-[#0D1117]/10 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#FF6B00]/30 hover:shadow-sm transition-all duration-200 group"
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
              >
                <span className="text-[#0D1117] font-semibold text-sm sm:text-base leading-snug pr-2">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#FF6B00] shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white border border-t-0 border-[#0D1117]/10 rounded-b-2xl px-5 pb-5 pt-3 -mt-2">
                      <p className="text-[#0D1117]/70 text-sm leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-[#0D1117]/50 text-sm">
            Still have a question?{' '}
            <a
              href="mailto:support@prepentrance.com"
              className="text-[#FF6B00] font-semibold hover:underline"
            >
              Email our team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
