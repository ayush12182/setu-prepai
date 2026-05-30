/**
 * PrepEntrance Exam Configuration — Single Source of Truth
 * 
 * All exam-specific metadata lives here.
 * To add a new exam: add one entry to EXAM_CONFIG. Zero code changes needed elsewhere.
 * 
 * Dashboard and onboarding UI are config-driven — they read from this file.
 */

export interface ExamConfig {
  /** Internal key stored in DB as target_exam */
  key: string;
  /** DB value used in teacher_codes.exam_type */
  dbKey: string;
  /** Human-readable label shown in UI */
  label: string;
  /** Short description of subjects */
  subjects: string[];
  /** UI accent color (Tailwind class suffix) */
  color: 'amber' | 'green' | 'violet' | 'blue' | 'orange' | 'emerald' | 'rose';
  /** Emoji icon */
  emoji: string;
  /** Badge text (e.g. "Class 11-12") */
  badge?: string;
}

export const EXAM_CONFIG: ExamConfig[] = [
  {
    key: 'JEE Main',
    dbKey: 'JEE_MAINS',
    label: 'JEE Main & Advanced',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    color: 'amber',
    emoji: '🚀',
    badge: 'Class 11–12',
  },
  {
    key: 'NEET',
    dbKey: 'NEET',
    label: 'NEET',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    color: 'green',
    emoji: '🔬',
    badge: 'Class 11–12',
  },
  {
    key: 'CUET',
    dbKey: 'CUET',
    label: 'CUET',
    subjects: ['English', 'Domain Subject', 'General Test'],
    color: 'violet',
    emoji: '🏛️',
    badge: 'Class 12',
  },
  {
    key: 'Foundation',
    dbKey: 'OTHER',
    label: 'CBSE / Foundation',
    subjects: ['Mathematics', 'Science', 'English'],
    color: 'emerald',
    emoji: '🧠',
    badge: 'Class 6–10',
  },
  {
    key: 'CA Foundation',
    dbKey: 'OTHER',
    label: 'CA Foundation / Commerce',
    subjects: ['Accounts', 'Economics', 'Business Studies'],
    color: 'blue',
    emoji: '📊',
    badge: 'Class 11–12',
  },
];

/** Get config for a given target_exam value (from profile) */
export function getExamConfig(targetExam: string | null | undefined): ExamConfig {
  if (!targetExam) return EXAM_CONFIG[0]; // Default to JEE
  const match = EXAM_CONFIG.find(
    (e) =>
      e.key.toLowerCase() === targetExam.toLowerCase() ||
      e.dbKey.toLowerCase() === targetExam.toLowerCase() ||
      e.label.toLowerCase().includes(targetExam.toLowerCase())
  );
  return match ?? EXAM_CONFIG[0];
}

/** Get subjects array for a given target_exam value */
export function getExamSubjects(targetExam: string | null | undefined): string[] {
  return getExamConfig(targetExam).subjects;
}

/** Get DB key (used in teacher_codes.exam_type) for a given target_exam */
export function getExamDbKey(targetExam: string | null | undefined): string {
  return getExamConfig(targetExam).dbKey;
}

/** Map from stream value (onboarding) to target_exam key (DB) */
export const STREAM_TO_EXAM: Record<string, string> = {
  jee: 'JEE Main',
  neet: 'NEET',
  cuet: 'CUET',
  foundation: 'Foundation',
  commerce: 'CA Foundation',
};
