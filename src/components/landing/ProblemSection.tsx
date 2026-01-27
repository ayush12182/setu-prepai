import React from 'react';
import { X, HelpCircle } from 'lucide-react';

const problemsLeft = [
  'Too many videos',
  'Too many PDFs',
  'Too many opinions',
  'Too many apps',
];

const problemsRight = [
  'What to study first',
  'What to skip',
  'How deeply to study a topic',
  'Whether they are on the right track',
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4">
            The Reality Check
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e3a5f] mb-4">
            The Real Problem
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            It's not about studying more. It's about studying <span className="font-semibold text-[#1e3a5f]">right</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="group relative bg-gradient-to-br from-red-50 to-red-50/50 border border-red-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-red-100/50 hover:-translate-y-1 transition-all duration-300">
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-200">
                  <X className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f]">
                  Students have too much of...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsLeft.map((problem, i) => (
                  <li key={i} className="flex items-center gap-4 group/item">
                    <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm text-red-500 font-bold flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                      ×
                    </span>
                    <span className="text-gray-700 font-medium">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="group relative bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-amber-100/50 hover:-translate-y-1 transition-all duration-300">
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f]">
                  But they don't know...
                </h3>
              </div>
              <ul className="space-y-4">
                {problemsRight.map((problem, i) => (
                  <li key={i} className="flex items-center gap-4 group/item">
                    <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm text-amber-500 font-bold flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                      ?
                    </span>
                    <span className="text-gray-700 font-medium">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
