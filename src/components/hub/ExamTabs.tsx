import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EXAM_META, type Exam, type ClassLevel } from '@/types/hub';
import { cn } from '@/lib/utils';

interface ExamTabsProps {
  activeExam: Exam;
  activeClass: ClassLevel;
}

export const ExamTabs: React.FC<ExamTabsProps> = ({ activeExam, activeClass }) => {
  const navigate = useNavigate();
  const exams: Exam[] = ['jee', 'neet', 'cuet'];

  const handleExamChange = (exam: Exam) => {
    // pick the first valid class for that exam
    const firstClass = EXAM_META[exam].classes[0].key;
    navigate(`/${exam}/${firstClass === '11' ? 'class-11' : firstClass === '12' ? 'class-12' : 'droppers'}`);
  };

  return (
    <div className="flex gap-2 sm:gap-3 mb-2">
      {exams.map(exam => {
        const meta = EXAM_META[exam];
        const isActive = exam === activeExam;
        return (
          <button
            key={exam}
            onClick={() => handleExamChange(exam)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
            style={{
              background: isActive ? meta.bg : 'rgba(255,255,255,0.04)',
              color: isActive ? meta.color : 'rgba(255,255,255,0.5)',
              border: `1.5px solid ${isActive ? meta.border : 'rgba(255,255,255,0.08)'}`,
              boxShadow: isActive ? `0 0 24px ${meta.color}25` : 'none',
              transform: isActive ? 'translateY(-1px)' : 'none',
            }}
          >
            <span className="text-base">{meta.emoji}</span>
            <span>{meta.label}</span>
            {isActive && (
              <span
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: meta.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
