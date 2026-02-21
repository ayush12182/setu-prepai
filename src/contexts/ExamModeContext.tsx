import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type ExamMode = 'jee' | 'neet';
export type JeeSubMode = 'main' | 'advanced' | 'both';

interface ExamModeConfig {
  examMode: ExamMode;
  label: string;
  fullLabel: string;
  emoji: string;
  subjects: { key: string; label: string; icon: string }[];
  mentorName: string;
  mentorTag: string;
  accentHue: number;
  quickDoubts: string[];
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
  mentorName: 'Jeetu Bhaiya',
  mentorTag: 'Your JEE Mentor',
  accentHue: 32,
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
  mentorName: 'NEET Mentor',
  mentorTag: 'Your NEET AI Mentor',
  accentHue: 145,
  quickDoubts: [
    'Human Physiology explain karo',
    'Genetics & Mendelian inheritance',
    'Plant Physiology concepts',
    'NCERT Biology important diagrams',
    'Cell Biology fundamentals',
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
  jeeSubMode: JeeSubMode;
  setJeeSubMode: (mode: JeeSubMode) => void;
  jeeSubModeLabel: string;
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

  const setExamMode = useCallback((mode: ExamMode) => {
    localStorage.setItem('examMode', mode);
    setExamModeState(mode);
    document.documentElement.classList.toggle('neet-mode', mode === 'neet');
  }, []);

  const setJeeSubMode = useCallback((mode: JeeSubMode) => {
    localStorage.setItem('jeeSubMode', mode);
    setJeeSubModeState(mode);
  }, []);

  useEffect(() => {
    if (profile?.target_exam) {
      const isNeetProfile = profile.target_exam === 'NEET';
      const newMode: ExamMode = isNeetProfile ? 'neet' : 'jee';
      if (newMode !== examMode) {
        setExamModeState(newMode);
        localStorage.setItem('examMode', newMode);
      }
    }
  }, [profile, examMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('neet-mode', examMode === 'neet');
  }, [examMode]);

  const config = examMode === 'neet' ? NEET_CONFIG : JEE_CONFIG;

  return (
    <ExamModeContext.Provider value={{
      examMode,
      config,
      setExamMode,
      isNeet: examMode === 'neet',
      isJee: examMode === 'jee',
      jeeSubMode,
      setJeeSubMode,
      jeeSubModeLabel: JEE_SUB_MODE_LABELS[jeeSubMode],
    }}>
      {children}
    </ExamModeContext.Provider>
  );
};
