/** ─────────────────────────────────────────────────────────────────────────────
 *  SETU Circles — Static Data
 *  All data is simulated frontend-only. No real-time backend required.
 * ─────────────────────────────────────────────────────────────────────────── */

export type ExamType = 'jee' | 'neet' | 'cuet';
export type StudyMode = 'all' | 'doubts' | 'revision' | 'strategy' | 'motivation';
export type MessageCategory = 'Doubt' | 'Concept' | 'Strategy' | 'Motivation';
export type ReputationBadge = 'Beginner' | 'Contributor' | 'Doubt Solver' | 'Top Mentor';

// ─── Subject Config ────────────────────────────────────────────────────────

export interface CircleSubject {
    key: string;
    label: string;
    icon: string;
    color: string; // Tailwind gradient
}

export const JEE_SUBJECTS: CircleSubject[] = [
    { key: 'physics', label: 'Physics', icon: '⚛️', color: 'from-[hsl(213_60%_50%)] to-[hsl(200_70%_55%)]' },
    { key: 'chemistry', label: 'Chemistry', icon: '🧪', color: 'from-[hsl(145_50%_38%)] to-[hsl(160_50%_45%)]' },
    { key: 'maths', label: 'Mathematics', icon: '📐', color: 'from-[hsl(280_50%_55%)] to-[hsl(260_55%_60%)]' },
    { key: 'revision', label: 'Revision Zone', icon: '🔄', color: 'from-[hsl(32_79%_57%)] to-[hsl(25_85%_55%)]' },
    { key: 'droppers', label: 'Droppers', icon: '🎯', color: 'from-[hsl(350_65%_55%)] to-[hsl(330_60%_55%)]' },
];

export const NEET_SUBJECTS: CircleSubject[] = [
    { key: 'biology', label: 'Biology', icon: '🧬', color: 'from-[hsl(145_50%_38%)] to-[hsl(160_50%_45%)]' },
    { key: 'chemistry', label: 'Chemistry', icon: '🧪', color: 'from-[hsl(32_79%_57%)] to-[hsl(25_85%_55%)]' },
    { key: 'physics', label: 'Physics', icon: '⚛️', color: 'from-[hsl(213_60%_50%)] to-[hsl(200_70%_55%)]' },
    { key: 'ncert', label: 'NCERT Revision', icon: '📖', color: 'from-[hsl(280_50%_55%)] to-[hsl(260_55%_60%)]' },
    { key: 'strategy', label: '720 Strategy', icon: '🏆', color: 'from-[hsl(350_65%_55%)] to-[hsl(330_60%_55%)]' },
];

// ─── Study Modes ───────────────────────────────────────────────────────────

export interface StudyModeOption {
    key: StudyMode;
    label: string;
    icon: string;
}

export const STUDY_MODES: StudyModeOption[] = [
    { key: 'all', label: 'All', icon: '🔍' },
    { key: 'doubts', label: 'Doubts', icon: '❓' },
    { key: 'revision', label: 'Revision', icon: '🔄' },
    { key: 'strategy', label: 'Strategy', icon: '🎯' },
    { key: 'motivation', label: 'Motivation', icon: '🔥' },
];

// ─── Circle Room definition ────────────────────────────────────────────────

export interface CircleRoom {
    id: string;
    topic: string;
    subject: string;      // matches key in subjects
    studyMode: StudyMode;
    exam: ExamType;
    baseStudentCount: number;
    expiryMinutes: number; // countdown from when session started
    startedMinsAgo: number;
}

export const ALL_ROOMS: CircleRoom[] = [
    // ── JEE Rooms ─────────────────────────────────────────────────
    {
        id: 'jee-electrostatics',
        topic: 'Electrostatics — Gauss Law & Capacitors',
        subject: 'physics',
        studyMode: 'doubts',
        exam: 'jee',
        baseStudentCount: 24,
        expiryMinutes: 90,
        startedMinsAgo: 48,
    },
    {
        id: 'jee-organic',
        topic: 'Organic Revision — Named Reactions',
        subject: 'chemistry',
        studyMode: 'revision',
        exam: 'jee',
        baseStudentCount: 18,
        expiryMinutes: 60,
        startedMinsAgo: 18,
    },
    {
        id: 'jee-night',
        topic: 'Night Study Room — Final Push',
        subject: 'revision',
        studyMode: 'motivation',
        exam: 'jee',
        baseStudentCount: 51,
        expiryMinutes: 120,
        startedMinsAgo: 5,
    },
    {
        id: 'jee-integration',
        topic: 'Integration Techniques — JEE Advanced',
        subject: 'maths',
        studyMode: 'doubts',
        exam: 'jee',
        baseStudentCount: 30,
        expiryMinutes: 75,
        startedMinsAgo: 30,
    },
    {
        id: 'jee-pyq',
        topic: 'PYQ Strategy Session — 2024 Analysis',
        subject: 'droppers',
        studyMode: 'strategy',
        exam: 'jee',
        baseStudentCount: 43,
        expiryMinutes: 100,
        startedMinsAgo: 10,
    },
    {
        id: 'jee-optics',
        topic: 'Ray Optics & Wave Optics Doubts',
        subject: 'physics',
        studyMode: 'doubts',
        exam: 'jee',
        baseStudentCount: 12,
        expiryMinutes: 60,
        startedMinsAgo: 20,
    },
    {
        id: 'jee-coordination',
        topic: 'Coordination Compounds — d-block',
        subject: 'chemistry',
        studyMode: 'revision',
        exam: 'jee',
        baseStudentCount: 9,
        expiryMinutes: 45,
        startedMinsAgo: 5,
    },

    // ── NEET Rooms ────────────────────────────────────────────────
    {
        id: 'neet-genetics',
        topic: 'Genetics & Mendelian Inheritance',
        subject: 'biology',
        studyMode: 'doubts',
        exam: 'neet',
        baseStudentCount: 38,
        expiryMinutes: 90,
        startedMinsAgo: 25,
    },
    {
        id: 'neet-biomolecules',
        topic: 'Biomolecules — Enzymes & Proteins',
        subject: 'biology',
        studyMode: 'revision',
        exam: 'neet',
        baseStudentCount: 22,
        expiryMinutes: 60,
        startedMinsAgo: 15,
    },
    {
        id: 'neet-720',
        topic: '720 Strategy — Chapter Priority & Time Plan',
        subject: 'strategy',
        studyMode: 'strategy',
        exam: 'neet',
        baseStudentCount: 56,
        expiryMinutes: 120,
        startedMinsAgo: 8,
    },
    {
        id: 'neet-organic',
        topic: 'Organic Chemistry — NCERT Based MCQs',
        subject: 'chemistry',
        studyMode: 'doubts',
        exam: 'neet',
        baseStudentCount: 17,
        expiryMinutes: 60,
        startedMinsAgo: 40,
    },
    {
        id: 'neet-plant-physiology',
        topic: 'Plant Physiology — Photosynthesis Diagrams',
        subject: 'biology',
        studyMode: 'revision',
        exam: 'neet',
        baseStudentCount: 29,
        expiryMinutes: 75,
        startedMinsAgo: 12,
    },
    {
        id: 'neet-ncert-bio',
        topic: 'NCERT Biology Line-by-Line Revision',
        subject: 'ncert',
        studyMode: 'revision',
        exam: 'neet',
        baseStudentCount: 45,
        expiryMinutes: 110,
        startedMinsAgo: 30,
    },
    {
        id: 'neet-physics-mechanics',
        topic: 'Mechanics — Laws of Motion Doubts',
        subject: 'physics',
        studyMode: 'doubts',
        exam: 'neet',
        baseStudentCount: 11,
        expiryMinutes: 50,
        startedMinsAgo: 10,
    },
];

// ─── Message Category Styling ──────────────────────────────────────────────

export interface CategoryStyle {
    label: MessageCategory;
    icon: string;
    color: string;   // text color class
    bg: string;      // background class
    border: string;  // border class
}

export const CATEGORY_STYLES: CategoryStyle[] = [
    {
        label: 'Doubt',
        icon: '❓',
        color: 'text-[hsl(213_60%_50%)]',
        bg: 'bg-[hsl(213_60%_50%/0.08)]',
        border: 'border-[hsl(213_60%_50%/0.3)]',
    },
    {
        label: 'Concept',
        icon: '💡',
        color: 'text-[hsl(32_79%_57%)]',
        bg: 'bg-[hsl(32_79%_57%/0.08)]',
        border: 'border-[hsl(32_79%_57%/0.3)]',
    },
    {
        label: 'Strategy',
        icon: '🎯',
        color: 'text-[hsl(280_50%_55%)]',
        bg: 'bg-[hsl(280_50%_55%/0.08)]',
        border: 'border-[hsl(280_50%_55%/0.3)]',
    },
    {
        label: 'Motivation',
        icon: '🔥',
        color: 'text-[hsl(350_65%_55%)]',
        bg: 'bg-[hsl(350_65%_55%/0.08)]',
        border: 'border-[hsl(350_65%_55%/0.3)]',
    },
];

// ─── Reputation Badges ─────────────────────────────────────────────────────

export interface BadgeInfo {
    badge: ReputationBadge;
    icon: string;
    color: string;
    minPoints: number;
}

export const BADGES: BadgeInfo[] = [
    { badge: 'Beginner', icon: '🌱', color: 'text-[hsl(145_50%_38%)]', minPoints: 0 },
    { badge: 'Contributor', icon: '⭐', color: 'text-[hsl(32_79%_57%)]', minPoints: 10 },
    { badge: 'Doubt Solver', icon: '🏅', color: 'text-[hsl(213_60%_50%)]', minPoints: 30 },
    { badge: 'Top Mentor', icon: '🏆', color: 'text-[hsl(350_65%_55%)]', minPoints: 100 },
];

export function getBadgeForPoints(points: number): BadgeInfo {
    return [...BADGES].reverse().find(b => points >= b.minPoints) ?? BADGES[0];
}

// ─── Simulated Members ─────────────────────────────────────────────────────

export interface CircleMember {
    id: string;
    name: string;
    points: number;
    isOnline: boolean;
}

export const SIMULATED_MEMBERS: CircleMember[] = [
    { id: 'm1', name: 'Arjun S.', points: 142, isOnline: true },
    { id: 'm2', name: 'Priya M.', points: 67, isOnline: true },
    { id: 'm3', name: 'Rohit K.', points: 23, isOnline: true },
    { id: 'm4', name: 'Sneha T.', points: 8, isOnline: true },
    { id: 'm5', name: 'Ankit B.', points: 0, isOnline: true },
    { id: 'm6', name: 'Divya R.', points: 55, isOnline: false },
    { id: 'm7', name: 'Vikram N.', points: 11, isOnline: true },
    { id: 'm8', name: 'Meera J.', points: 89, isOnline: false },
    { id: 'm9', name: 'Harsh P.', points: 4, isOnline: true },
    { id: 'm10', name: 'Kavitha L.', points: 33, isOnline: true },
];

// ─── Simulated Messages ────────────────────────────────────────────────────

export interface CircleMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderPoints: number;
    category: MessageCategory | 'Mentor';
    text: string;
    timestamp: Date;
    upvotes: number;
    isMentor?: boolean;  // Jeetu Bhaiya AI
    isModeration?: boolean;
}

export function buildInitialMessages(exam: ExamType, topic: string): CircleMessage[] {
    const now = new Date();
    const min = (m: number) => new Date(now.getTime() - m * 60000);

    if (exam === 'jee') {
        return [
            {
                id: 'seed-1', senderId: 'm1', senderName: 'Jeetu Bhaiya AI', senderPoints: 999,
                category: 'Mentor', isMentor: true,
                text: 'Focus on revising formulas before attempting PYQs today. Consistency beats cramming. 💪',
                timestamp: min(20), upvotes: 12,
            },
            {
                id: 'seed-2', senderId: 'm1', senderName: 'Arjun S.', senderPoints: 142,
                category: 'Doubt',
                text: 'Can someone explain why electric flux through a closed surface is zero when charge is outside? Gauss law is confusing me.',
                timestamp: min(15), upvotes: 5,
            },
            {
                id: 'seed-3', senderId: 'm2', senderName: 'Priya M.', senderPoints: 67,
                category: 'Concept',
                text: 'Net flux = Q_enclosed / ε₀. If charge is outside, it contributes equally to inward and outward flux, so net = 0. Think of it as field lines entering = field lines exiting!',
                timestamp: min(12), upvotes: 9,
            },
            {
                id: 'seed-4', senderId: 'm5', senderName: 'Ankit B.', senderPoints: 0,
                category: 'Strategy',
                text: 'Should we do all PYQs for Electrostatics or just last 10 years?',
                timestamp: min(8), upvotes: 2,
            },
            {
                id: 'seed-5', senderId: 'm3', senderName: 'Rohit K.', senderPoints: 23,
                category: 'Motivation',
                text: 'Last month before JEE. Ab karna hai toh karna hai. Sab mila ke 90 din baad result aayega 🔥',
                timestamp: min(4), upvotes: 15,
            },
        ];
    }

    return [
        {
            id: 'seed-1', senderId: 'm1', senderName: 'NEET Mentor AI', senderPoints: 999,
            category: 'Mentor', isMentor: true,
            text: 'Today, focus on NCERT diagrams for Plant Physiology. Every diagram in NCERT has appeared in NEET at least once. 🌱',
            timestamp: min(20), upvotes: 18,
        },
        {
            id: 'seed-2', senderId: 'm2', senderName: 'Priya M.', senderPoints: 67,
            category: 'Doubt',
            text: 'In Mendelian genetics, when do we use test cross vs back cross? Are they the same?',
            timestamp: min(14), upvotes: 4,
        },
        {
            id: 'seed-3', senderId: 'm1', senderName: 'Arjun S.', senderPoints: 142,
            category: 'Concept',
            text: 'Test cross = cross with homozygous recessive (aa) to determine genotype. Back cross = cross with either parent. Test cross is a type of back cross, but not vice versa!',
            timestamp: min(11), upvotes: 11,
        },
        {
            id: 'seed-4', senderId: 'm10', senderName: 'Kavitha L.', senderPoints: 33,
            category: 'Strategy',
            text: 'For 720 target: Bio = 360, Chem = 180, Physics = 180. Spend 60% study time on Biology. NCERT is everything.',
            timestamp: min(6), upvotes: 20,
        },
        {
            id: 'seed-5', senderId: 'm9', senderName: 'Harsh P.', senderPoints: 4,
            category: 'Motivation',
            text: 'Doctors save lives. That\'s why we\'re doing this. Don\'t give up bhai/behen 🏥',
            timestamp: min(2), upvotes: 8,
        },
    ];
}

// ─── Mentor AI Messages (periodic injections) ─────────────────────────────

export const MENTOR_MESSAGES_JEE: string[] = [
    'Focus on revising formulas before attempting PYQs today. 💪',
    'A common mistake in rotational motion: torque ≠ force × displacement. Remember τ = r × F (cross product). Review vectors tonight.',
    'Speed tip: 30% of JEE questions come from just 20% of chapters. Identify your strong chapters and secure them first.',
    'Drink water. Take a 5 minute break every 45 minutes. Your brain retains more when rested.',
    'For every doubt you discuss here, explain it back to yourself in writing. That\'s how you lock it in. 📝',
    'PYQ strategy: Solve 2008–2024. Pattern recognition is a superpower in JEE. 🎯',
];

export const MENTOR_MESSAGES_NEET: string[] = [
    'Today, focus on NCERT diagrams. Every diagram has appeared in NEET at least once. 🌱',
    'Biology tip: For genetics problems, always draw the Punnett square first. Never skip steps in a time crunch.',
    'Remember: In NEET, Biology alone carries 360 marks. Secure Biology first, then support with Chemistry and Physics.',
    'If you don\'t understand a concept, read the NCERT line again — slowly. NEET questions are often word-for-word NCERT.',
    'Revision strategy: After reading a chapter, close the book and write 5 key points from memory. Gap = weak area.',
    '720 is achievable when you treat every NCERT line as a potential question. Stay consistent. 🏆',
];

// ─── Off-topic moderation response ────────────────────────────────────────

export const MODERATION_RESPONSE = "Let's keep this space focused on preparation 🙂";

// ─── Smart Suggestion Seeds ────────────────────────────────────────────────

export interface CircleSuggestion {
    chapterName: string;
    exam: ExamType;
    roomId: string;
    studentCount: number;
}

export const JEE_SUGGESTIONS: CircleSuggestion[] = [
    { chapterName: 'Inductance', exam: 'jee', roomId: 'jee-electrostatics', studentCount: 24 },
    { chapterName: 'Integration', exam: 'jee', roomId: 'jee-integration', studentCount: 30 },
    { chapterName: 'Ray Optics', exam: 'jee', roomId: 'jee-optics', studentCount: 12 },
];

export const NEET_SUGGESTIONS: CircleSuggestion[] = [
    { chapterName: 'Genetics', exam: 'neet', roomId: 'neet-genetics', studentCount: 38 },
    { chapterName: 'Biomolecules', exam: 'neet', roomId: 'neet-biomolecules', studentCount: 22 },
    { chapterName: 'Plant Physiology', exam: 'neet', roomId: 'neet-plant-physiology', studentCount: 29 },
];
