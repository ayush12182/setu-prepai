import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, FileText, ClipboardCheck, Zap, Bot,
  ArrowRight,
} from 'lucide-react';
import { EXAM_META, type Exam, type ClassLevel, type ResourceType } from '@/types/hub';

interface CategoryGridProps {
  activeExam: Exam;
  activeClass: ClassLevel;
  counts?: Record<ResourceType, number>;
}

const CLASS_URL: Record<ClassLevel, string> = {
  '11': 'class-11', '12': 'class-12', dropper: 'droppers',
};

const CATEGORIES: Array<{
  type: ResourceType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  subItems: string[];
}> = [
  {
    type: 'notes',
    label: 'Notes',
    description: 'Chapter, Short, NCERT & Handwritten Notes',
    icon: BookOpen,
    color: '#3B82F6',
    subItems: ['Chapter Notes', 'Short Notes', 'NCERT Notes', 'Handwritten'],
  },
  {
    type: 'pyq',
    label: 'PYQs',
    description: 'Previous Year Questions with detailed solutions',
    icon: FileText,
    color: '#F59E0B',
    subItems: ['Chapterwise', 'Yearwise', 'Topicwise'],
  },
  {
    type: 'test',
    label: 'Tests',
    description: 'Chapter Tests, Subject Tests & Full Mocks',
    icon: ClipboardCheck,
    color: '#EF4444',
    subItems: ['Chapter Test', 'Subject Test', 'Full Mock'],
  },
  {
    type: 'revision',
    label: 'Revision',
    description: 'Formula Sheets, Mind Maps & One-Shots',
    icon: Zap,
    color: '#8B5CF6',
    subItems: ['Formula Sheet', 'Mind Map', 'One Shot', 'Quick Revision'],
  },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ activeExam, activeClass, counts = {} }) => {
  const navigate = useNavigate();
  const examMeta = EXAM_META[activeExam];
  const classPath = CLASS_URL[activeClass];

  return (
    <div className="space-y-4">
      {/* 4 Category tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const count = counts[cat.type] ?? 0;
          return (
            <motion.button
              key={cat.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              onClick={() => navigate(`/${activeExam}/${classPath}/${cat.type}`)}
              className="relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 group"
              style={{
                background: `${cat.color}0D`,
                border: `1px solid ${cat.color}25`,
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glow blob */}
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: cat.color }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${cat.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: cat.color }} />
              </div>
              <h3 className="font-bold text-white text-base mb-1">{cat.label}</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {cat.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {cat.subItems.slice(0, 2).map(item => (
                    <span
                      key={item}
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                      style={{ background: `${cat.color}15`, color: cat.color }}
                    >{item}</span>
                  ))}
                  {cat.subItems.length > 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      +{cat.subItems.length - 2}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" style={{ color: cat.color }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* AI Mentor CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        onClick={() => navigate('/ask-prepentrance')}
        className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 group"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(239,68,68,0.08) 100%)',
          border: '1px solid rgba(249,115,22,0.2)',
        }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}>
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-0.5">AI Mentor</h3>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Ask doubts, get instant explanations, generate practice questions
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold shrink-0"
          style={{ color: '#F97316' }}>
          Try free <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </motion.button>
    </div>
  );
};
