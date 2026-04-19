/**
 * Stream-aware subject configuration for the B2B teacher + student portals.
 * The `target_exam` from the user's profile determines which subject set to use.
 */

export interface SubjectConfig {
  id: string;
  label: string;
  color: string;
  bg: string;
  emoji: string;
  chapters: { title: string; pages: number }[];
}

export const STREAM_SUBJECTS: Record<string, SubjectConfig[]> = {
  // ─── JEE ───────────────────────────────────────────────────────────
  'JEE Main': [
    {
      id: 'physics', label: 'Physics', color: 'text-blue-400', bg: 'from-blue-500/20 to-indigo-500/10', emoji: '⚡',
      chapters: [
        { title: 'Kinematics', pages: 18 },
        { title: 'Laws of Motion', pages: 14 },
        { title: 'Work, Energy & Power', pages: 12 },
        { title: 'Gravitation', pages: 10 },
        { title: 'Electrostatics', pages: 20 },
        { title: 'Current Electricity', pages: 16 },
        { title: 'Optics', pages: 14 },
        { title: 'Modern Physics', pages: 12 },
      ],
    },
    {
      id: 'chemistry', label: 'Chemistry', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10', emoji: '🧪',
      chapters: [
        { title: 'Atomic Structure', pages: 14 },
        { title: 'Chemical Bonding', pages: 16 },
        { title: 'Thermodynamics', pages: 12 },
        { title: 'Equilibrium', pages: 14 },
        { title: 'Electrochemistry', pages: 10 },
        { title: 'Organic Reactions', pages: 20 },
        { title: 'Biomolecules', pages: 8 },
      ],
    },
    {
      id: 'mathematics', label: 'Mathematics', color: 'text-amber-400', bg: 'from-amber-500/20 to-yellow-500/10', emoji: '📐',
      chapters: [
        { title: 'Sets, Relations & Functions', pages: 12 },
        { title: 'Complex Numbers', pages: 10 },
        { title: 'Matrices & Determinants', pages: 14 },
        { title: 'Calculus – Limits', pages: 16 },
        { title: 'Differentiation', pages: 18 },
        { title: 'Integration', pages: 20 },
        { title: 'Probability', pages: 12 },
        { title: 'Vectors & 3D', pages: 14 },
      ],
    },
  ],

  // ─── NEET ──────────────────────────────────────────────────────────
  'NEET': [
    {
      id: 'biology', label: 'Biology', color: 'text-rose-400', bg: 'from-rose-500/20 to-pink-500/10', emoji: '🌿',
      chapters: [
        { title: 'Cell: The Unit of Life', pages: 14 },
        { title: 'Biomolecules', pages: 12 },
        { title: 'Cell Division', pages: 10 },
        { title: 'Human Physiology', pages: 22 },
        { title: 'Plant Physiology', pages: 16 },
        { title: 'Genetics & Evolution', pages: 18 },
        { title: 'Ecology', pages: 12 },
      ],
    },
    {
      id: 'physics-neet', label: 'Physics', color: 'text-blue-400', bg: 'from-blue-500/20 to-indigo-500/10', emoji: '⚡',
      chapters: [
        { title: 'Mechanics', pages: 18 },
        { title: 'Thermodynamics', pages: 12 },
        { title: 'Optics', pages: 14 },
        { title: 'Electrostatics', pages: 16 },
        { title: 'Modern Physics', pages: 12 },
      ],
    },
    {
      id: 'chemistry-neet', label: 'Chemistry', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10', emoji: '🧪',
      chapters: [
        { title: 'Atomic Structure', pages: 14 },
        { title: 'Chemical Bonding', pages: 16 },
        { title: 'Organic Chemistry Basics', pages: 20 },
        { title: 'Biomolecules', pages: 10 },
        { title: 'Electrochemistry', pages: 10 },
      ],
    },
  ],

  // ─── CUET ──────────────────────────────────────────────────────────
  'CUET': [
    {
      id: 'accounts', label: 'Accounts', color: 'text-violet-400', bg: 'from-violet-500/20 to-purple-500/10', emoji: '📒',
      chapters: [
        { title: 'Introduction to Accounting', pages: 12 },
        { title: 'Accounting Equation', pages: 8 },
        { title: 'Journal Entries', pages: 18 },
        { title: 'Ledger', pages: 14 },
        { title: 'Trial Balance', pages: 10 },
      ],
    },
    {
      id: 'economics', label: 'Economics', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-sky-500/10', emoji: '📊',
      chapters: [
        { title: 'Introduction to Economics', pages: 9 },
        { title: 'Consumer Behaviour', pages: 16 },
        { title: 'Demand Analysis', pages: 14 },
        { title: 'Supply Analysis', pages: 12 },
        { title: 'National Income', pages: 14 },
      ],
    },
    {
      id: 'bst', label: 'Business Studies', color: 'text-pink-400', bg: 'from-pink-500/20 to-rose-500/10', emoji: '💼',
      chapters: [
        { title: 'Nature of Business', pages: 10 },
        { title: 'Forms of Organisation', pages: 20 },
        { title: 'Planning', pages: 14 },
        { title: 'Financial Markets', pages: 16 },
      ],
    },
    {
      id: 'english', label: 'English', color: 'text-orange-400', bg: 'from-orange-500/20 to-amber-500/10', emoji: '📝',
      chapters: [
        { title: 'Reading Comprehension', pages: 8 },
        { title: 'Verbal Ability', pages: 10 },
        { title: 'Writing Skills', pages: 12 },
      ],
    },
  ],

  // ─── Commerce / CA Foundation ────────────────────────────────────
  'CA Foundation': [
    {
      id: 'ca-accounts', label: 'Accounts', color: 'text-violet-400', bg: 'from-violet-500/20 to-purple-500/10', emoji: '📒',
      chapters: [
        { title: 'Accounting Process', pages: 14 },
        { title: 'Financial Statements', pages: 18 },
        { title: 'Partnership Accounts', pages: 16 },
        { title: 'Company Accounts', pages: 20 },
      ],
    },
    {
      id: 'ca-law', label: 'Business Laws', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/10', emoji: '⚖️',
      chapters: [
        { title: 'Indian Contract Act', pages: 16 },
        { title: 'Sale of Goods Act', pages: 12 },
        { title: 'Companies Act', pages: 18 },
      ],
    },
    {
      id: 'ca-maths', label: 'Maths & Stats', color: 'text-amber-400', bg: 'from-amber-500/20 to-yellow-500/10', emoji: '📐',
      chapters: [
        { title: 'Ratio & Proportion', pages: 10 },
        { title: 'Equations', pages: 12 },
        { title: 'Statistics Basics', pages: 14 },
      ],
    },
  ],
};

/**
 * Get subjects for a given target_exam string.
 * Falls back to CUET if unknown.
 */
  // If no target exam, do not default to Commerce (CUET). 
  // This prevents NEET students from seeing Accounts/Economics during loading states.
  if (!targetExam) return [];
  
  // Clean the input
  const examKey = targetExam.trim();
  
  // Direct match
  if (STREAM_SUBJECTS[examKey]) return STREAM_SUBJECTS[examKey];
  
  // Fuzzy match
  const lowerExam = examKey.toLowerCase();
  if (lowerExam.includes('jee')) return STREAM_SUBJECTS['JEE Main'];
  if (lowerExam.includes('neet')) return STREAM_SUBJECTS['NEET'];
  if (lowerExam.includes('cuet')) return STREAM_SUBJECTS['CUET'];
  if (lowerExam.includes('ca') || lowerExam.includes('commerce') || lowerExam.includes('foundation')) return STREAM_SUBJECTS['CA Foundation'];
  
  return [];

/**
 * Get flat list of subject labels for use in dropdowns.
 */
export function getSubjectLabels(targetExam: string | null | undefined): string[] {
  return getSubjectsForExam(targetExam).map(s => s.label);
}
