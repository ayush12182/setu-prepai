// CUET UG Syllabus — Domain Subjects, Language, General Test
// Referenced from NTA CUET UG syllabus structure

import type { Chapter, Subject, Weightage, Difficulty, PYQData } from './syllabus';

export type CuetSubjectCategory = 'domain' | 'language' | 'general';

export interface CuetSubjectMeta {
  key: string;
  label: string;
  icon: string;
  category: CuetSubjectCategory;
}

export const CUET_SUBJECTS: CuetSubjectMeta[] = [
  // Domain Subjects
  { key: 'physics', label: 'Physics', icon: '⚛️', category: 'domain' },
  { key: 'chemistry', label: 'Chemistry', icon: '🧪', category: 'domain' },
  { key: 'mathematics', label: 'Mathematics', icon: '📐', category: 'domain' },
  { key: 'biology', label: 'Biology', icon: '🧬', category: 'domain' },
  { key: 'accountancy', label: 'Accountancy', icon: '📒', category: 'domain' },
  { key: 'economics', label: 'Economics', icon: '📈', category: 'domain' },
  { key: 'business_studies', label: 'Business Studies', icon: '💼', category: 'domain' },
  { key: 'political_science', label: 'Political Science', icon: '🏛️', category: 'domain' },
  { key: 'history', label: 'History', icon: '📜', category: 'domain' },
  { key: 'geography', label: 'Geography', icon: '🌍', category: 'domain' },
  { key: 'psychology', label: 'Psychology', icon: '🧠', category: 'domain' },
  { key: 'sociology', label: 'Sociology', icon: '👥', category: 'domain' },
  // Language
  { key: 'english', label: 'English', icon: '📝', category: 'language' },
  { key: 'hindi', label: 'Hindi', icon: '🔤', category: 'language' },
  // General Test
  { key: 'general_test', label: 'General Test', icon: '🎯', category: 'general' },
];

// ==================== GENERAL TEST ====================
export const cuetGeneralTestChapters: Chapter[] = [
  {
    id: 'cuet-gt-1',
    name: 'Logical Reasoning',
    subject: 'general_test' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Syllogisms', 'Blood Relations', 'Coding-Decoding', 'Direction Sense', 'Puzzles', 'Analogies', 'Series'],
    keyFormulas: [],
    pyqData: { total: 30, postCovid: 15, preCovid: 10, legacy: 5, trendingConcepts: ['Syllogisms', 'Coding-Decoding', 'Seating Arrangement'] },
    examTips: ['Practice speed — 1 question per minute target', 'Learn shortcut methods for syllogisms', 'Focus on NCERT-level reasoning']
  },
  {
    id: 'cuet-gt-2',
    name: 'Quantitative Aptitude',
    subject: 'general_test' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Number System', 'Percentages', 'Profit & Loss', 'Time & Work', 'Averages', 'Ratio & Proportion', 'Simple & Compound Interest'],
    keyFormulas: ['SI = PRT/100', 'CI = P(1+R/100)^T - P', 'Speed = Distance/Time'],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Percentage calculations', 'Ratio problems', 'Time-Work shortcuts'] },
    examTips: ['NCERT Class 8-10 level math', 'Speed matters more than difficulty', 'Memorize multiplication tables up to 30']
  },
  {
    id: 'cuet-gt-3',
    name: 'General Knowledge & Current Affairs',
    subject: 'general_test' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Indian History', 'Indian Polity', 'Geography', 'Economy', 'Science & Tech', 'Current Affairs', 'Awards & Honours'],
    keyFormulas: [],
    pyqData: { total: 30, postCovid: 15, preCovid: 10, legacy: 5, trendingConcepts: ['Constitutional amendments', 'Recent government schemes', 'International organizations'] },
    examTips: ['Read NCERT Class 6-10 for static GK', 'Follow monthly current affairs compilations', 'Focus on last 6 months events']
  },
  {
    id: 'cuet-gt-4',
    name: 'Numerical Ability',
    subject: 'general_test' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Data Interpretation', 'Number Series', 'Simplification', 'Mensuration Basics', 'Algebra Basics'],
    keyFormulas: [],
    pyqData: { total: 15, postCovid: 8, preCovid: 5, legacy: 2, trendingConcepts: ['Bar/Pie chart interpretation', 'Number patterns', 'Quick calculations'] },
    examTips: ['Focus on calculation speed', 'Learn mental math tricks', 'DI is easiest scoring area']
  },
];

// ==================== ENGLISH LANGUAGE ====================
export const cuetEnglishChapters: Chapter[] = [
  {
    id: 'cuet-eng-1',
    name: 'Reading Comprehension',
    subject: 'english' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Passage-based MCQs', 'Inference Questions', 'Vocabulary in Context', 'Main Idea', 'Tone & Purpose'],
    keyFormulas: [],
    pyqData: { total: 30, postCovid: 15, preCovid: 10, legacy: 5, trendingConcepts: ['Inference-based questions', 'Vocabulary in context', 'Author tone'] },
    examTips: ['Read the questions first, then the passage', 'Eliminate obviously wrong options', 'Practice 2 passages daily']
  },
  {
    id: 'cuet-eng-2',
    name: 'Grammar & Vocabulary',
    subject: 'english' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Tenses', 'Subject-Verb Agreement', 'Articles', 'Prepositions', 'Synonyms & Antonyms', 'Idioms', 'One-word Substitution'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Error spotting', 'Fill in the blanks', 'Idiom meanings'] },
    examTips: ['Learn 10 new words daily', 'Practice error spotting exercises', 'NCERT English textbooks are good base']
  },
  {
    id: 'cuet-eng-3',
    name: 'Verbal Ability',
    subject: 'english' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Sentence Rearrangement', 'Cloze Test', 'Para Jumbles', 'Sentence Correction', 'Active-Passive Voice'],
    keyFormulas: [],
    pyqData: { total: 20, postCovid: 10, preCovid: 8, legacy: 2, trendingConcepts: ['Para jumbles', 'Cloze test', 'Sentence rearrangement'] },
    examTips: ['Focus on logical flow of sentences', 'Practice cloze tests daily', 'Learn transition words']
  },
];

// ==================== ECONOMICS (Domain) ====================
export const cuetEconomicsChapters: Chapter[] = [
  {
    id: 'cuet-eco-1',
    name: 'Microeconomics',
    subject: 'economics' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Demand & Supply', 'Elasticity', 'Consumer Equilibrium', 'Production & Costs', 'Market Forms'],
    keyFormulas: ['Ed = %ΔQd / %ΔP', 'MR = ΔTR/ΔQ'],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Demand curves', 'Consumer equilibrium', 'Perfect competition'] },
    examTips: ['NCERT Class 12 is the source', 'Focus on diagrams', 'Definitions are directly tested']
  },
  {
    id: 'cuet-eco-2',
    name: 'Macroeconomics',
    subject: 'economics' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['National Income', 'Money & Banking', 'Government Budget', 'Balance of Payments', 'AD-AS Model'],
    keyFormulas: ['GDP = C + I + G + (X-M)', 'Money Multiplier = 1/CRR'],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['GDP calculation', 'Fiscal policy', 'Balance of Payments'] },
    examTips: ['Learn all national income formulas', 'NCERT solved examples', 'Government budget components']
  },
  {
    id: 'cuet-eco-3',
    name: 'Indian Economic Development',
    subject: 'economics' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Indian Economy 1950-90', 'Liberalization', 'Poverty', 'Human Capital', 'Rural Development', 'Infrastructure'],
    keyFormulas: [],
    pyqData: { total: 15, postCovid: 8, preCovid: 5, legacy: 2, trendingConcepts: ['LPG reforms', 'Poverty alleviation', 'NITI Aayog schemes'] },
    examTips: ['NCERT Class 11 Indian Economy', 'Learn key years and policies', 'Current economic data']
  },
];

// ==================== ACCOUNTANCY (Domain) ====================
export const cuetAccountancyChapters: Chapter[] = [
  {
    id: 'cuet-acc-1',
    name: 'Partnership Accounts',
    subject: 'accountancy' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Fundamentals', 'Goodwill', 'Admission of Partner', 'Retirement/Death', 'Dissolution'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Goodwill valuation', 'Profit sharing ratio', 'Dissolution entries'] },
    examTips: ['NCERT Class 12 Part 1', 'Practice journal entries', 'Goodwill methods are key']
  },
  {
    id: 'cuet-acc-2',
    name: 'Company Accounts',
    subject: 'accountancy' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Issue of Shares', 'Issue of Debentures', 'Financial Statements of Company', 'Ratio Analysis', 'Cash Flow Statement'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Share issue entries', 'Ratio analysis', 'Cash flow from operations'] },
    examTips: ['Practice numerical problems', 'Learn all ratios with formulas', 'Cash flow statement format']
  },
];

// ==================== BUSINESS STUDIES (Domain) ====================
export const cuetBusinessStudiesChapters: Chapter[] = [
  {
    id: 'cuet-bs-1',
    name: 'Principles of Management',
    subject: 'business_studies' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Nature of Management', 'Principles of Management', 'Business Environment', 'Planning', 'Organizing', 'Staffing', 'Directing', 'Controlling'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Fayol vs Taylor', 'Planning process', 'Delegation vs Decentralization'] },
    examTips: ['Case-based questions from NCERT', '14 Principles of Fayol', 'Difference tables score well']
  },
  {
    id: 'cuet-bs-2',
    name: 'Business Finance & Marketing',
    subject: 'business_studies' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Financial Management', 'Financial Markets', 'Marketing Management', 'Consumer Protection'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Capital structure', 'Money vs Capital market', '4Ps of Marketing'] },
    examTips: ['NCERT Class 12', 'Learn difference tables', 'Marketing mix is always asked']
  },
];

// ==================== POLITICAL SCIENCE (Domain) ====================
export const cuetPoliticalScienceChapters: Chapter[] = [
  {
    id: 'cuet-ps-1',
    name: 'Indian Constitution & Political Process',
    subject: 'political_science' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Constitution Making', 'Fundamental Rights', 'Directive Principles', 'Federal Structure', 'Judiciary', 'Election & Representation'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Fundamental Rights', 'Emergency provisions', 'Amendment process'] },
    examTips: ['NCERT Class 11 & 12 Political Science', 'Learn Articles with numbers', 'Case studies from NCERT']
  },
  {
    id: 'cuet-ps-2',
    name: 'Contemporary World Politics',
    subject: 'political_science' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Cold War Era', 'US Hegemony', 'Globalization', 'International Organizations', 'India\'s Foreign Policy'],
    keyFormulas: [],
    pyqData: { total: 15, postCovid: 8, preCovid: 5, legacy: 2, trendingConcepts: ['NAM movement', 'UN reforms', 'India-neighbor relations'] },
    examTips: ['Focus on NCERT events and dates', 'Learn key international organizations', 'India foreign policy milestones']
  },
];

// ==================== HISTORY (Domain) ====================
export const cuetHistoryChapters: Chapter[] = [
  {
    id: 'cuet-hist-1',
    name: 'Ancient & Medieval India',
    subject: 'history' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Indus Valley', 'Vedic Period', 'Maurya & Gupta Empire', 'Delhi Sultanate', 'Mughal Empire', 'Bhakti & Sufi Movements'],
    keyFormulas: [],
    pyqData: { total: 20, postCovid: 10, preCovid: 8, legacy: 2, trendingConcepts: ['Harappan features', 'Ashoka inscriptions', 'Mughal administration'] },
    examTips: ['NCERT Themes in Indian History', 'Source-based questions', 'Timeline is important']
  },
  {
    id: 'cuet-hist-2',
    name: 'Modern India & World History',
    subject: 'history' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['British Rule', 'National Movement', 'Gandhi Era', 'Independence', 'World Wars', 'Cold War', 'Nationalism Worldwide'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Salt March', 'Partition', 'French Revolution', 'Industrial Revolution'] },
    examTips: ['NCERT Class 12 History', 'Learn key dates and movements', 'Source-based questions practice']
  },
];

// ==================== GEOGRAPHY (Domain) ====================
export const cuetGeographyChapters: Chapter[] = [
  {
    id: 'cuet-geo-1',
    name: 'Physical & Human Geography',
    subject: 'geography' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Geomorphology', 'Climatology', 'Oceanography', 'Population', 'Migration', 'Human Development', 'Settlements'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Plate tectonics', 'Climate classification', 'Population theories'] },
    examTips: ['NCERT Class 11 & 12', 'Map-based questions', 'Learn diagrams']
  },
  {
    id: 'cuet-geo-2',
    name: 'India: Resources & Planning',
    subject: 'geography' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Land Resources', 'Water Resources', 'Mineral Resources', 'Industries', 'Transport', 'International Trade'],
    keyFormulas: [],
    pyqData: { total: 20, postCovid: 10, preCovid: 8, legacy: 2, trendingConcepts: ['Resource planning', 'Industrial regions', 'Transport networks'] },
    examTips: ['NCERT maps are key', 'Learn industrial locations', 'Resource distribution patterns']
  },
];

// ==================== PSYCHOLOGY (Domain) ====================
export const cuetPsychologyChapters: Chapter[] = [
  {
    id: 'cuet-psy-1',
    name: 'Foundations of Psychology',
    subject: 'psychology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['What is Psychology', 'Methods of Enquiry', 'Human Development', 'Sensory Processes', 'Learning', 'Memory', 'Thinking'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Schools of psychology', 'Learning theories', 'Memory models'] },
    examTips: ['NCERT Class 11 Psychology', 'Learn all theories with psychologist names', 'Definition-based MCQs']
  },
  {
    id: 'cuet-psy-2',
    name: 'Applied Psychology',
    subject: 'psychology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: ['cuet-psy-1'],
    topics: ['Intelligence', 'Personality', 'Attitudes', 'Psychological Disorders', 'Therapeutic Approaches', 'Social Influence'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['IQ tests', 'Personality theories', 'Therapy types'] },
    examTips: ['NCERT Class 12 Psychology', 'Learn disorder classifications', 'Freud, Rogers, Maslow theories']
  },
];

// ==================== SOCIOLOGY (Domain) ====================
export const cuetSociologyChapters: Chapter[] = [
  {
    id: 'cuet-soc-1',
    name: 'Indian Society & Social Change',
    subject: 'sociology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Caste System', 'Tribal Communities', 'Family & Kinship', 'Market as Social Institution', 'Social Movements', 'Social Change'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Caste dynamics', 'Urbanization', 'Globalization impact'] },
    examTips: ['NCERT Class 12 Sociology', 'Case-based questions', 'Learn key sociologists']
  },
];

// ==================== HELPER FUNCTIONS ====================

export const getCuetChaptersBySubject = (subjectKey: string): Chapter[] => {
  const map: Record<string, Chapter[]> = {
    general_test: cuetGeneralTestChapters,
    english: cuetEnglishChapters,
    economics: cuetEconomicsChapters,
    accountancy: cuetAccountancyChapters,
    business_studies: cuetBusinessStudiesChapters,
    political_science: cuetPoliticalScienceChapters,
    history: cuetHistoryChapters,
    geography: cuetGeographyChapters,
    psychology: cuetPsychologyChapters,
    sociology: cuetSociologyChapters,
    // Physics/Chemistry/Math/Biology reuse NEET syllabus (NCERT-level)
  };
  return map[subjectKey] || [];
};

export const getCuetChapterById = (id: string): Chapter | undefined => {
  const allChapters = [
    ...cuetGeneralTestChapters,
    ...cuetEnglishChapters,
    ...cuetEconomicsChapters,
    ...cuetAccountancyChapters,
    ...cuetBusinessStudiesChapters,
    ...cuetPoliticalScienceChapters,
    ...cuetHistoryChapters,
    ...cuetGeographyChapters,
    ...cuetPsychologyChapters,
    ...cuetSociologyChapters,
  ];
  return allChapters.find(c => c.id === id);
};

export const getCuetSubjectsByCategory = (category: CuetSubjectCategory) => {
  return CUET_SUBJECTS.filter(s => s.category === category);
};
