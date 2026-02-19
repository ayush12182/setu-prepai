import { Chapter, physicsChapters, chemistryChapters } from './syllabus';

// ==================== BIOLOGY (NEET ONLY) ====================
export const biologyChapters: Chapter[] = [
    {
        id: 'bio-1',
        name: 'The Living World',
        subject: 'biology',
        weightage: 'Low',
        difficulty: 'Easy',
        prerequisites: [],
        topics: [
            'Diversity in Living World',
            'Taxonomic Categories',
            'Taxonomical Aids',
            'Binomial Nomenclature'
        ],
        keyFormulas: [],
        pyqData: {
            total: 12,
            postCovid: 5,
            preCovid: 5,
            legacy: 2,
            trendingConcepts: ['Taxonomic hierarchy', 'Herbarium vs Museum']
        },
        examTips: [
            'Learn examples of each category',
            'Order: Kingdom -> Phylum -> Class -> Order -> Family -> Genus -> Species'
        ]
    },
    {
        id: 'bio-2',
        name: 'Biological Classification',
        subject: 'biology',
        weightage: 'High',
        difficulty: 'Medium',
        prerequisites: ['bio-1'],
        topics: [
            'Five Kingdom Classification',
            'Monera, Protista, Fungi',
            'Viruses, Viroids, Lichens'
        ],
        keyFormulas: [],
        pyqData: {
            total: 25,
            postCovid: 12,
            preCovid: 10,
            legacy: 3,
            trendingConcepts: ['Features of Monera', 'Virus structure', 'Fungi classes']
        },
        examTips: [
            'Memorize examples of fungi classes',
            'Viruses are exception to cell theory'
        ]
    },
    {
        id: 'bio-3',
        name: 'Plant Kingdom',
        subject: 'biology',
        weightage: 'Medium',
        difficulty: 'Medium',
        prerequisites: ['bio-2'],
        topics: [
            'Algae, Bryophytes, Pteridophytes',
            'Gymnosperms, Angiosperms',
            'Plant Life Cycles'
        ],
        keyFormulas: [],
        pyqData: {
            total: 20,
            postCovid: 8,
            preCovid: 10,
            legacy: 2,
            trendingConcepts: ['Alternation of generation', 'Algae pigmentation', 'Gymnosperm features']
        },
        examTips: [
            'Haplontic vs Diplontic cycles',
            'Examples of Algae are frequently asked'
        ]
    }
];

// Named re-exports for NEET subject arrays
// Physics & Chemistry chapters are the same for NEET (overlapping syllabus)
export const neetPhysicsChapters = physicsChapters;
export const neetChemistryChapters = chemistryChapters;
export const neetBiologyChapters = biologyChapters;
