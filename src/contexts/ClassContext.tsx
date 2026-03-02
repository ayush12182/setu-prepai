import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

export type LearningMode = 'foundation' | 'competitive';

export type StudentClass = 6 | 7 | 8 | 9 | 10 | 11 | 12 | 0; // 0 = dropper

interface ClassContextType {
  studentClass: StudentClass;
  learningMode: LearningMode;
  isFoundation: boolean;
  isCompetitive: boolean;
  diagnosticCompleted: boolean;
  examGoal: string | null;
  classLabel: string;
  /** Payload for AI edge functions */
  aiContext: {
    student_class: number;
    learning_mode: LearningMode;
    syllabus_scope: 'strict_class_only';
  };
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const useClassContext = () => {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error('useClassContext must be used within ClassProvider');
  return ctx;
};

function parseStudentClass(raw: string | null | undefined): StudentClass {
  if (!raw) return 11; // default competitive
  const lower = raw.toLowerCase().trim();
  if (lower === 'dropper') return 0;
  const num = parseInt(lower);
  if (!isNaN(num) && num >= 6 && num <= 12) return num as StudentClass;
  return 11;
}

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  const value = useMemo<ClassContextType>(() => {
    const studentClass = parseStudentClass(profile?.class);
    const isFoundation = studentClass >= 6 && studentClass <= 10;
    const learningMode: LearningMode = isFoundation ? 'foundation' : 'competitive';
    
    // Read diagnostic_completed from profile (cast needed since types not yet regenerated)
    const profileAny = profile as any;
    const diagnosticCompleted = profileAny?.diagnostic_completed ?? false;
    const examGoal = profileAny?.exam_goal ?? profile?.target_exam ?? null;

    const classLabel = studentClass === 0 ? 'Dropper' : `Class ${studentClass}`;

    return {
      studentClass,
      learningMode,
      isFoundation,
      isCompetitive: !isFoundation,
      diagnosticCompleted,
      examGoal,
      classLabel,
      aiContext: {
        student_class: studentClass,
        learning_mode: learningMode,
        syllabus_scope: 'strict_class_only',
      },
    };
  }, [profile]);

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};
