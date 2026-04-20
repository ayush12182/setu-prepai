import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

export type LearningMode = 'foundation' | 'competitive';

export type StudentClass = 6 | 7 | 8 | 9 | 10 | 11 | 12 | 0; // 0 = dropper

export type LearningStage = 'curiosity_stage' | 'concept_stage' | 'analytical_stage' | 'competitive_stage';

export type ContentTag = 'conceptual' | 'applied' | 'analytical' | 'competitive';

export type TeachingTone = 'school_teacher' | 'advanced_teacher' | 'competitive_teacher';

function deriveLearningStage(studentClass: StudentClass): LearningStage {
  if (studentClass >= 6 && studentClass <= 7) return 'curiosity_stage';
  if (studentClass >= 8 && studentClass <= 9) return 'concept_stage';
  if (studentClass === 10) return 'analytical_stage';
  return 'competitive_stage'; // 11, 12, 0 (dropper)
}

function getAllowedContentTags(stage: LearningStage): ContentTag[] {
  switch (stage) {
    case 'curiosity_stage': return ['conceptual'];
    case 'concept_stage': return ['conceptual', 'applied'];
    case 'analytical_stage': return ['applied', 'analytical'];
    case 'competitive_stage': return ['analytical', 'competitive'];
  }
}

function getTeachingTone(stage: LearningStage): TeachingTone {
  if (stage === 'curiosity_stage' || stage === 'concept_stage') return 'school_teacher';
  if (stage === 'analytical_stage') return 'advanced_teacher';
  return 'competitive_teacher';
}

interface ClassContextType {
  studentClass: StudentClass;
  learningMode: LearningMode;
  learningStage: LearningStage;
  allowedContentTags: ContentTag[];
  teachingTone: TeachingTone;
  isFoundation: boolean;
  isCompetitive: boolean;
  diagnosticCompleted: boolean;
  examGoal: string | null;
  classLabel: string;
  /** Payload for AI edge functions */
  aiContext: {
    student_class: number;
    learning_mode: LearningMode;
    learning_stage: LearningStage;
    allowed_content_tags: ContentTag[];
    teaching_tone: TeachingTone;
    syllabus_scope: 'strict_class_only';
    strict_stage_control: true;
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

  // Extract number using regex, e.g., "Class 8" -> 8
  const match = lower.match(/(\d+)/);
  const num = match ? parseInt(match[0]) : NaN;

  if (!isNaN(num) && num >= 6 && num <= 12) return num as StudentClass;
  return 11;
}

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  const value = useMemo<ClassContextType>(() => {
    const studentClass = parseStudentClass(profile?.class);
    const isFoundation = studentClass >= 6 && studentClass <= 10;
    const learningMode: LearningMode = isFoundation ? 'foundation' : 'competitive';
    const learningStage = deriveLearningStage(studentClass);
    const allowedContentTags = getAllowedContentTags(learningStage);
    const teachingTone = getTeachingTone(learningStage);

    const profileAny = profile as any;
    const diagnosticCompleted = profileAny?.diagnostic_completed ?? false;
    const examGoal = profileAny?.exam_goal ?? profile?.target_exam ?? null;

    const classLabel = studentClass === 0 ? 'Dropper' : `Class ${studentClass}`;

    return {
      studentClass,
      learningMode,
      learningStage,
      allowedContentTags,
      teachingTone,
      isFoundation,
      isCompetitive: !isFoundation,
      diagnosticCompleted,
      examGoal,
      classLabel,
      aiContext: {
        student_class: studentClass,
        learning_mode: learningMode,
        learning_stage: learningStage,
        allowed_content_tags: allowedContentTags,
        teaching_tone: teachingTone,
        syllabus_scope: 'strict_class_only',
        strict_stage_control: true,
      },
    };
  }, [profile]);

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};
