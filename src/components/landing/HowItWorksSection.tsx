import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Target, BarChart3 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Pick Your Chapter',
    description: 'Choose from the complete JEE syllabus. Every chapter broken into focused subchapters.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'Learn with Jeetu Bhaiya',
    description: 'Get concept notes, formulas, and mentor-style explanations — like sitting in a Kota classroom.',
  },
  {
    number: '03',
    icon: Target,
    title: 'Practice & Test',
    description: 'Solve AI-generated questions, PYQs, and take chapter tests. Difficulty adapts to you.',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Review & Repeat',
    description: 'See your weak spots, revise smartly, and take a full Major Test every 21 days.',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-24 px-6 sm:px-12 overflow-hidden bg-primary">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-80 h-80 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Four steps. That's it. No complicated setup.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative group"
            >
              {/* Connector line (hidden on last item and mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%+0.5rem)] w-[calc(100%-3rem)] h-px border-t-2 border-dashed border-white/20" />
              )}

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                {/* Number */}
                <span className="text-accent/60 text-sm font-bold tracking-wider mb-4 block">
                  STEP {step.number}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-6 w-6 text-accent" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
