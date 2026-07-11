import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export type ExamMode = 'jee' | 'neet' | 'cuet';
export type JeeSubMode = 'main' | 'advanced' | 'both';

interface ExamModeConfig {
  examMode: ExamMode;
  label: string;
  fullLabel: string;
  emoji: string;
  subjects: { key: string; label: string; icon: string }[];
  teacherName: string;
  teacherTag: string;
  accentHue: number;
  quickDoubts: string[];
  learningFlow: string;
  notesStyle: string;
}

const JEE_CONFIG: ExamModeConfig = {
  examMode: 'jee',
  label: 'JEE',
  fullLabel: 'JEE Preparation Mode',
  emoji: '⚡',
  subjects: [
    { key: 'physics', label: 'Physics', icon: '⚛️' },
    { key: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { key: 'maths', label: 'Mathematics', icon: '📐' },
  ],
  teacherName: 'PrepEntrance Mentor',
  teacherTag: 'Your JEE Mentor',
  accentHue: 32,
  learningFlow: 'Concept → Practice → Advanced → Analysis',
  notesStyle: 'deep-theory',
  quickDoubts: [
    'Rotation vs Revolution explain karo',
    'Integration by Parts kaise kare?',
    'Organic reaction mechanism samjhao',
    'SHM ka concept clear karo',
    'Electrostatics ka Gauss Law',
  ],
};

const NEET_CONFIG: ExamModeConfig = {
  examMode: 'neet',
  label: 'NEET',
  fullLabel: 'NEET Preparation Mode',
  emoji: '🧬',
  subjects: [
    { key: 'biology', label: 'Biology', icon: '🧬' },
    { key: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { key: 'physics', label: 'Physics', icon: '⚛️' },
  ],
  teacherName: 'NEET Mentor',
  teacherTag: 'Your NEET AI Mentor',
  accentHue: 145,
  learningFlow: 'Concept → Practice → NCERT Review → Analysis',
  notesStyle: 'ncert-focus',
  quickDoubts: [
    'Human Physiology explain karo',
    'Genetics & Mendelian inheritance',
    'Plant Physiology concepts',
    'NCERT Biology important diagrams',
    'Cell Biology fundamentals',
  ],
};

const CUET_CONFIG: ExamModeConfig = {
  examMode: 'cuet',
  label: 'CUET',
  fullLabel: 'CUET Preparation Mode',
  emoji: '🎯',
  subjects: [
    { key: 'english', label: 'English', icon: '📝' },
    { key: 'general_test', label: 'General Test', icon: '🎯' },
    { key: 'economics', label: 'Economics', icon: '📈' },
    { key: 'political_science', label: 'Political Science', icon: '🏛️' },
    { key: 'history', label: 'History', icon: '📜' },
    { key: 'psychology', label: 'Psychology', icon: '🧠' },
  ],
  teacherName: 'CUET Mentor',
  teacherTag: 'Your CUET AI Mentor',
  accentHue: 260,
  learningFlow: 'Concept Summary → Quick MCQs → Revision Loop → Speed Test',
  notesStyle: 'ncert-concise',
  quickDoubts: [
    'Explain Demand & Supply curve',
    'Reading comprehension strategies',
    'Logical Reasoning shortcuts',
    'Indian Constitution key articles',
    'Current affairs last 6 months',
  ],
};

export const JEE_SUB_MODE_LABELS: Record<JeeSubMode, string> = {
  main: 'JEE Main',
  advanced: 'JEE Advanced',
  both: 'Main + Advanced',
};

interface ExamModeContextType {
  examMode: ExamMode;
  config: ExamModeConfig;
  setExamMode: (mode: ExamMode) => void;
  isNeet: boolean;
  isJee: boolean;
  isCuet: boolean;
  jeeSubMode: JeeSubMode;
  setJeeSubMode: (mode: JeeSubMode) => void;
  jeeSubModeLabel: string;
  isLocked: boolean;
}

const ExamModeContext = createContext<ExamModeContextType | undefined>(undefined);

export const useExamMode = () => {
  const ctx = useContext(ExamModeContext);
  if (!ctx) throw new Error('useExamMode must be used within ExamModeProvider');
  return ctx;
};

export const ExamModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [examMode, setExamModeState] = useState<ExamMode>(() => {
    return (localStorage.getItem('examMode') as ExamMode) || 'jee';
  });

  const [jeeSubMode, setJeeSubModeState] = useState<JeeSubMode>(() => {
    return (localStorage.getItem('jeeSubMode') as JeeSubMode) || 'both';
  });

  const { profile } = useAuth();
  const isLocked = !!profile?.teacher_id;

  const setExamMode = useCallback((mode: ExamMode) => {
    if (isLocked) {
      toast.info("Exam selection is managed by your mentor");
      return;
    }
    localStorage.setItem('examMode', mode);
    setExamModeState(mode);
    document.documentElement.classList.toggle('neet-mode', mode === 'neet');
    document.documentElement.classList.toggle('cuet-mode', mode === 'cuet');
  }, [isLocked]);

  const setJeeSubMode = useCallback((mode: JeeSubMode) => {
    localStorage.setItem('jeeSubMode', mode);
    setJeeSubModeState(mode);
  }, []);

  useEffect(() => {
    if (profile?.target_exam) {
      let newMode: ExamMode = 'jee';
      if (profile.target_exam === 'NEET') newMode = 'neet';
      else if (profile.target_exam === 'CUET') newMode = 'cuet';
      if (newMode !== examMode) {
        setExamModeState(newMode);
        localStorage.setItem('examMode', newMode);
      }
    }
  }, [profile, examMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('neet-mode', examMode === 'neet');
    document.documentElement.classList.toggle('cuet-mode', examMode === 'cuet');
  }, [examMode]);

  const config = examMode === 'neet' ? NEET_CONFIG : examMode === 'cuet' ? CUET_CONFIG : JEE_CONFIG;

  return (
    <ExamModeContext.Provider value={{
      examMode,
      config,
      setExamMode,
      isNeet: examMode === 'neet',
      isJee: examMode === 'jee',
      isCuet: examMode === 'cuet',
      jeeSubMode,
      setJeeSubMode,
      jeeSubModeLabel: JEE_SUB_MODE_LABELS[jeeSubMode],
      isLocked,
    }}>
      {children}
    </ExamModeContext.Provider>
  );
};
