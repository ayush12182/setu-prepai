import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EXAM_META, type Exam, type ClassLevel } from '@/types/hub';

interface ClassTabsProps {
  activeExam: Exam;
  activeClass: ClassLevel;
  category?: string;
}

const CLASS_URL: Record<ClassLevel, string> = {
  '11': 'class-11',
  '12': 'class-12',
  dropper: 'droppers',
};

export const ClassTabs: React.FC<ClassTabsProps> = ({ activeExam, activeClass, category }) => {
  const navigate = useNavigate();
  const meta = EXAM_META[activeExam];

  return (
    <div className="flex gap-2 flex-wrap">
      {meta.classes.map(cls => {
        const isActive = cls.key === activeClass;
        const url = `/${activeExam}/${CLASS_URL[cls.key]}${category ? `/${category}` : ''}`;
        return (
          <button
            key={cls.key}
            onClick={() => navigate(url)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: isActive ? meta.color : 'rgba(255,255,255,0.06)',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${isActive ? meta.color : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {cls.label}
          </button>
        );
      })}
    </div>
  );
};
