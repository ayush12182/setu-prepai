import React from 'react';
import { motion } from 'framer-motion';

const trustStats = [
  { value: '21', unit: 'Days', label: 'To feel the difference' },
  { value: '50K', unit: '+', label: 'PYQs in our database' },
  { value: '100', unit: '%', label: 'Syllabus coverage' },
  { value: '1', unit: '', label: 'Mentor who gets you' },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="relative py-20 px-6 sm:px-12 overflow-hidden bg-background">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-primary">
            Numbers that matter
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {trustStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="mb-2">
                <span className="text-5xl sm:text-6xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
                  {stat.value}
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-accent">
                  {stat.unit}
                </span>
              </div>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};
