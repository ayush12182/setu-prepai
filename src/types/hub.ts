// ─── PrepEntrance Hub — TypeScript Types ─────────────────────────────────────────────

export type Exam = 'jee' | 'neet' | 'cuet';
export type ClassLevel = '11' | '12' | 'dropper';
export type ResourceType = 'notes' | 'pyq' | 'test' | 'revision' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'english' | 'hindi' | 'hinglish';

export type SubType =
  | 'chapter-notes' | 'short-notes' | 'ncert' | 'handwritten'
  | 'formula-sheet' | 'mind-map' | 'one-shot' | 'quick-revision'
  | 'chapterwise' | 'yearwise' | 'topicwise'
  | 'chapter-test' | 'subject-test' | 'mock-test';

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  exam: Exam;
  class: ClassLevel;
  subject: string;
  chapter: string;
  resource_type: ResourceType;
  sub_type: SubType | null;
  difficulty: Difficulty | null;
  language: Language;
  content_url: string | null;
  thumbnail_url: string | null;
  file_size: string | null;
  pages: number | null;
  is_premium: boolean;
  is_published: boolean;
  view_count: number;
  download_count: number;
  updated_at: string;
  created_at: string;
}

export interface ResourceCategory {
  id: string;
  key: string;
  label: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface ResourceSubject {
  id: string;
  key: string;
  label: string;
  exam: Exam;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  resource_id: string;
  viewed_at: string;
  completed: boolean;
  progress_percent: number;
}

// ─── Filter state for the hub ────────────────────────────────────────────────

export interface HubFilters {
  exam: Exam;
  class: ClassLevel;
  resourceType?: ResourceType;
  subject?: string;
  difficulty?: Difficulty;
  language?: Language;
  search?: string;
}

// ─── Static config — exam meta ───────────────────────────────────────────────

export const EXAM_META: Record<Exam, {
  label: string;
  color: string;
  bg: string;
  border: string;
  emoji: string;
  classes: { key: ClassLevel; label: string }[];
  subjects: { key: string; label: string; icon: string }[];
}> = {
  jee: {
    label: 'JEE',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.3)',
    emoji: '⚡',
    classes: [
      { key: '11', label: 'Class 11' },
      { key: '12', label: 'Class 12' },
      { key: 'dropper', label: 'Droppers' },
    ],
    subjects: [
      { key: 'physics', label: 'Physics', icon: '⚛️' },
      { key: 'chemistry', label: 'Chemistry', icon: '🧪' },
      { key: 'maths', label: 'Mathematics', icon: '📐' },
    ],
  },
  neet: {
    label: 'NEET',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    emoji: '🩺',
    classes: [
      { key: '11', label: 'Class 11' },
      { key: '12', label: 'Class 12' },
      { key: 'dropper', label: 'Droppers' },
    ],
    subjects: [
      { key: 'physics', label: 'Physics', icon: '⚛️' },
      { key: 'chemistry', label: 'Chemistry', icon: '🧪' },
      { key: 'botany', label: 'Botany', icon: '🌿' },
      { key: 'zoology', label: 'Zoology', icon: '🦁' },
    ],
  },
  cuet: {
    label: 'CUET',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
    emoji: '🎓',
    classes: [
      { key: '12', label: 'Class 12' },
      { key: 'dropper', label: 'Droppers' },
    ],
    subjects: [
      { key: 'english', label: 'English', icon: '📖' },
      { key: 'general', label: 'General Test', icon: '🧠' },
      { key: 'domain', label: 'Domain Subjects', icon: '📚' },
    ],
  },
};

export const RESOURCE_TYPE_META: Record<ResourceType, {
  label: string;
  color: string;
  bg: string;
  icon: string;
  description: string;
}> = {
  notes: {
    label: 'Notes',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.15)',
    icon: '📘',
    description: 'Chapter Notes, Short Notes, NCERT, Handwritten',
  },
  pyq: {
    label: 'PYQs',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    icon: '📑',
    description: 'Previous Year Questions with solutions',
  },
  test: {
    label: 'Tests',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.15)',
    icon: '📝',
    description: 'Chapter Tests, Subject Tests, Full Mocks',
  },
  revision: {
    label: 'Revision',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.15)',
    icon: '⚡',
    description: 'Formula Sheets, Mind Maps, One-Shots',
  },
  ai: {
    label: 'AI',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.15)',
    icon: '🤖',
    description: 'AI-generated practice and explanations',
  },
};

export const SUB_TYPE_META: Partial<Record<SubType, { label: string; icon: string }>> = {
  'chapter-notes': { label: 'Chapter Notes', icon: '📘' },
  'short-notes':   { label: 'Short Notes',   icon: '📄' },
  'ncert':         { label: 'NCERT Notes',   icon: '📗' },
  'handwritten':   { label: 'Handwritten',   icon: '✏️' },
  'formula-sheet': { label: 'Formula Sheet', icon: '🔢' },
  'mind-map':      { label: 'Mind Map',      icon: '🗺️' },
  'one-shot':      { label: 'One Shot',      icon: '🎯' },
  'quick-revision':{ label: 'Quick Revision',icon: '⚡' },
  'chapterwise':   { label: 'Chapterwise',   icon: '📑' },
  'yearwise':      { label: 'Yearwise',      icon: '📅' },
  'topicwise':     { label: 'Topicwise',     icon: '🎯' },
  'chapter-test':  { label: 'Chapter Test',  icon: '🧪' },
  'subject-test':  { label: 'Subject Test',  icon: '📝' },
  'mock-test':     { label: 'Mock Test',     icon: '🏆' },
};
