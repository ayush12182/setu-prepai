import React from 'react';
import { EXAM_META, type Exam } from '@/types/hub';

interface SubjectFilterProps {
  activeExam: Exam;
  activeSubject: string;
  onChange: (subject: string) => void;
}

export const SubjectFilter: React.FC<SubjectFilterProps> = ({ activeExam, activeSubject, onChange }) => {
  const meta = EXAM_META[activeExam];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* "All" pill */}
      <button
        onClick={() => onChange('')}
        className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
        style={{
          background: !activeSubject ? meta.color : 'rgba(255,255,255,0.06)',
          color: !activeSubject ? '#fff' : 'rgba(255,255,255,0.5)',
          border: `1px solid ${!activeSubject ? meta.color : 'rgba(255,255,255,0.1)'}`,
        }}
      >All Subjects</button>

      {meta.subjects.map(sub => {
        const isActive = activeSubject === sub.key;
        return (
          <button
            key={sub.key}
            onClick={() => onChange(isActive ? '' : sub.key)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: isActive ? meta.color : 'rgba(255,255,255,0.06)',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${isActive ? meta.color : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <span>{sub.icon}</span>
            <span>{sub.label}</span>
          </button>
        );
      })}
    </div>
  );
};
