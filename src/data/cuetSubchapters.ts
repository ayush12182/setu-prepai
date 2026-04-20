// CUET UG Subchapters — Topic-level breakdown for all CUET subjects
// Each subchapter maps to a chapter in cuetSyllabus.ts

import type { Subchapter } from './subchapters';

// ==================== GENERAL TEST ====================

export const cuetGT1Subchapters: Subchapter[] = [
  {
    id: 'cuet-gt-1-1', chapterId: 'cuet-gt-1', name: 'Syllogisms',
    jeeAsks: ['All/Some/No type statements', 'Venn diagram approach', 'Conclusion validity'],
    pyqFocus: { trends: ['2+ statement questions increasing'], patterns: ['Identify valid conclusions'], traps: ['Assuming converse is true'] },
    commonMistakes: ['Confusing "Some" with "All"', 'Not checking all possibilities'],
    jeetuLine: 'Syllogisms are about logic, not language. Draw the Venn diagram every time.'
  },
  {
    id: 'cuet-gt-1-2', chapterId: 'cuet-gt-1', name: 'Coding-Decoding',
    jeeAsks: ['Letter shifting patterns', 'Number coding', 'Mixed coding schemes'],
    pyqFocus: { trends: ['Complex multi-step coding'], patterns: ['Find the rule, apply it'], traps: ['Reverse vs forward coding'] },
    commonMistakes: ['Miscounting letter positions', 'Ignoring case sensitivity'],
    jeetuLine: 'Write the alphabet with numbers 1-26. It saves time every single time.'
  },
  {
    id: 'cuet-gt-1-3', chapterId: 'cuet-gt-1', name: 'Blood Relations',
    jeeAsks: ['Family tree construction', 'Generation identification', 'Complex relationship chains'],
    pyqFocus: { trends: ['3-4 generation problems'], patterns: ['Draw the family tree first'], traps: ['Gender assumptions'] },
    commonMistakes: ['Not drawing the tree', 'Confusing maternal/paternal sides'],
    jeetuLine: 'Always draw the family tree. No shortcuts here.'
  },
  {
    id: 'cuet-gt-1-4', chapterId: 'cuet-gt-1', name: 'Direction Sense & Puzzles',
    jeeAsks: ['Direction tracking problems', 'Seating arrangement', 'Linear/circular puzzles'],
    pyqFocus: { trends: ['Seating arrangement dominates'], patterns: ['Fix one person, build around'], traps: ['Clockwise vs anticlockwise'] },
    commonMistakes: ['Not using diagrams', 'Losing track of turns'],
    jeetuLine: 'Puzzles are about elimination. Start with the most constrained condition.'
  },
];

export const cuetGT2Subchapters: Subchapter[] = [
  {
    id: 'cuet-gt-2-1', chapterId: 'cuet-gt-2', name: 'Percentages & Profit-Loss',
    jeeAsks: ['Successive percentage change', 'Cost price vs selling price', 'Discount calculations'],
    pyqFocus: { trends: ['Application-based questions'], patterns: ['Convert to fractions for speed'], traps: ['Percentage on different bases'] },
    commonMistakes: ['Calculating % on wrong base', 'Forgetting successive discount formula'],
    jeetuLine: 'Learn fraction equivalents: 1/4 = 25%, 1/3 = 33.3%. Speed increases dramatically.'
  },
  {
    id: 'cuet-gt-2-2', chapterId: 'cuet-gt-2', name: 'Time, Speed & Work',
    jeeAsks: ['Relative speed problems', 'Work efficiency', 'Pipes and cisterns'],
    pyqFocus: { trends: ['Combined work problems'], patterns: ['Use per-unit work method'], traps: ['Units mismatch (km/hr vs m/s)'] },
    commonMistakes: ['Not converting units', 'Forgetting relative speed concept'],
    jeetuLine: 'Convert speed: multiply by 5/18 for m/s, 18/5 for km/hr. Memorize this.'
  },
  {
    id: 'cuet-gt-2-3', chapterId: 'cuet-gt-2', name: 'Ratio, Proportion & Averages',
    jeeAsks: ['Mixture problems', 'Alligation method', 'Weighted averages'],
    pyqFocus: { trends: ['Data-based ratio problems'], patterns: ['Cross multiplication'], traps: ['Ratio vs proportion confusion'] },
    commonMistakes: ['Not simplifying ratios', 'Mixing up parts with wholes'],
    jeetuLine: 'Alligation is the fastest method for mixture problems. Learn it well.'
  },
];

export const cuetGT3Subchapters: Subchapter[] = [
  {
    id: 'cuet-gt-3-1', chapterId: 'cuet-gt-3', name: 'Indian Polity & Constitution',
    jeeAsks: ['Fundamental Rights', 'Directive Principles', 'Key constitutional articles', 'Amendment process'],
    pyqFocus: { trends: ['Recent amendments asked frequently'], patterns: ['Article numbers with features'], traps: ['Confusing FR with DPSP'] },
    commonMistakes: ['Mixing up Article numbers', 'Confusing state vs central lists'],
    jeetuLine: 'Learn Articles 12-35 (FR) and 36-51 (DPSP) thoroughly. They repeat every year.'
  },
  {
    id: 'cuet-gt-3-2', chapterId: 'cuet-gt-3', name: 'Indian & World Geography',
    jeeAsks: ['Major rivers & dams', 'Climate zones', 'World organizations', 'Important straits'],
    pyqFocus: { trends: ['Map-based factual questions'], patterns: ['Location + feature matching'], traps: ['Similar sounding places'] },
    commonMistakes: ['Confusing tributaries', 'Wrong country-capital pairs'],
    jeetuLine: 'Use maps actively while studying. Visual memory is strongest for geography.'
  },
  {
    id: 'cuet-gt-3-3', chapterId: 'cuet-gt-3', name: 'Current Affairs & GK',
    jeeAsks: ['Government schemes', 'Awards & honours', 'International summits', 'Sports events'],
    pyqFocus: { trends: ['Last 6 months events dominate'], patterns: ['Who-What-When format'], traps: ['Outdated information'] },
    commonMistakes: ['Not updating regularly', 'Confusing similar scheme names'],
    jeetuLine: 'Read a monthly current affairs PDF. 30 minutes daily is enough.'
  },
];

export const cuetGT4Subchapters: Subchapter[] = [
  {
    id: 'cuet-gt-4-1', chapterId: 'cuet-gt-4', name: 'Data Interpretation',
    jeeAsks: ['Bar chart analysis', 'Pie chart calculations', 'Table-based questions', 'Line graph trends'],
    pyqFocus: { trends: ['Multi-data-set questions'], patterns: ['Calculate percentages from charts'], traps: ['Scale misreading'] },
    commonMistakes: ['Not reading axis labels', 'Rounding errors in calculations'],
    jeetuLine: 'DI is the easiest scoring area. Practice reading charts quickly.'
  },
  {
    id: 'cuet-gt-4-2', chapterId: 'cuet-gt-4', name: 'Number Series & Simplification',
    jeeAsks: ['Pattern recognition', 'Missing number in series', 'BODMAS simplification'],
    pyqFocus: { trends: ['Complex multi-operation series'], patterns: ['Check differences, then differences of differences'], traps: ['Alternate patterns'] },
    commonMistakes: ['Not checking all pattern types', 'Arithmetic errors in simplification'],
    jeetuLine: 'For series: first check +/-, then ×/÷, then squares/cubes. Systematic approach wins.'
  },
];

// ==================== ENGLISH LANGUAGE ====================

export const cuetEng1Subchapters: Subchapter[] = [
  {
    id: 'cuet-eng-1-1', chapterId: 'cuet-eng-1', name: 'Passage Comprehension',
    jeeAsks: ['Main idea identification', 'Inference questions', 'Author tone & purpose'],
    pyqFocus: { trends: ['Longer passages with multiple questions'], patterns: ['Read questions first, then passage'], traps: ['Options that are true but not answering the question'] },
    commonMistakes: ['Choosing literally correct but contextually wrong answers', 'Spending too much time on one passage'],
    jeetuLine: 'Read the questions first. Then scan the passage for answers. Never read word by word.'
  },
  {
    id: 'cuet-eng-1-2', chapterId: 'cuet-eng-1', name: 'Vocabulary in Context',
    jeeAsks: ['Word meaning from context', 'Synonym/Antonym in passage', 'Idiomatic usage'],
    pyqFocus: { trends: ['Contextual meaning over dictionary meaning'], patterns: ['Replace the word and check if meaning holds'], traps: ['Multiple meanings of same word'] },
    commonMistakes: ['Using dictionary meaning instead of contextual', 'Ignoring surrounding sentences'],
    jeetuLine: 'Context is king. The same word means different things in different sentences.'
  },
];

export const cuetEng2Subchapters: Subchapter[] = [
  {
    id: 'cuet-eng-2-1', chapterId: 'cuet-eng-2', name: 'Grammar Rules',
    jeeAsks: ['Tense usage', 'Subject-verb agreement', 'Articles & prepositions', 'Error spotting'],
    pyqFocus: { trends: ['Error spotting dominates'], patterns: ['Check subject-verb first, then tense'], traps: ['Collective nouns with singular verbs'] },
    commonMistakes: ['Wrong preposition usage', 'Tense inconsistency in sentences'],
    jeetuLine: 'Error spotting has patterns. Learn the 20 most common grammar rules and you cover 90% of questions.'
  },
  {
    id: 'cuet-eng-2-2', chapterId: 'cuet-eng-2', name: 'Synonyms, Antonyms & Idioms',
    jeeAsks: ['Direct synonym/antonym', 'Idiom meanings', 'One-word substitution'],
    pyqFocus: { trends: ['Idiom-based MCQs increasing'], patterns: ['Memorize common idiom sets'], traps: ['Similar sounding but different meaning words'] },
    commonMistakes: ['Confusing similar words (affect/effect)', 'Guessing idiom meaning literally'],
    jeetuLine: 'Learn 10 new words daily with usage. In 3 months you will cover everything CUET asks.'
  },
];

export const cuetEng3Subchapters: Subchapter[] = [
  {
    id: 'cuet-eng-3-1', chapterId: 'cuet-eng-3', name: 'Sentence Rearrangement',
    jeeAsks: ['Para jumbles', 'Sentence ordering', 'Logical flow identification'],
    pyqFocus: { trends: ['5-sentence jumbles common'], patterns: ['Find opening and closing sentences first'], traps: ['Pronoun reference errors'] },
    commonMistakes: ['Not identifying the topic sentence', 'Ignoring transition words'],
    jeetuLine: 'Find the first and last sentence. The middle falls into place automatically.'
  },
  {
    id: 'cuet-eng-3-2', chapterId: 'cuet-eng-3', name: 'Cloze Test & Sentence Correction',
    jeeAsks: ['Fill in blanks', 'Contextual word choice', 'Active-passive conversion'],
    pyqFocus: { trends: ['Context-based cloze tests'], patterns: ['Read full passage before filling'], traps: ['Grammatically correct but contextually wrong'] },
    commonMistakes: ['Filling blanks without reading full passage', 'Ignoring tone consistency'],
    jeetuLine: 'Read the entire cloze passage once. The theme tells you which words fit.'
  },
];

// ==================== ECONOMICS ====================

export const cuetEco1Subchapters: Subchapter[] = [
  {
    id: 'cuet-eco-1-1', chapterId: 'cuet-eco-1', name: 'Demand, Supply & Elasticity',
    jeeAsks: ['Law of demand/supply', 'Elasticity types', 'Shifts vs movements along curve'],
    pyqFocus: { trends: ['Graph-based questions'], patterns: ['Identify shift factors'], traps: ['Movement along vs shift of curve'] },
    commonMistakes: ['Confusing change in demand vs change in quantity demanded'],
    jeetuLine: 'If price changes → movement. If anything else changes → shift. This one rule solves 80% of questions.'
  },
  {
    id: 'cuet-eco-1-2', chapterId: 'cuet-eco-1', name: 'Consumer & Producer Equilibrium',
    jeeAsks: ['Utility maximization', 'MR = MC condition', 'Break-even point'],
    pyqFocus: { trends: ['Numerical problems on equilibrium'], patterns: ['Equate marginal values'], traps: ['Total vs marginal confusion'] },
    commonMistakes: ['Not distinguishing TR from MR', 'Forgetting units'],
    jeetuLine: 'Equilibrium = where marginal values meet. This applies everywhere in economics.'
  },
  {
    id: 'cuet-eco-1-3', chapterId: 'cuet-eco-1', name: 'Market Forms',
    jeeAsks: ['Perfect competition features', 'Monopoly vs oligopoly', 'Price determination'],
    pyqFocus: { trends: ['Comparison-based MCQs'], patterns: ['Feature matching across market types'], traps: ['Monopolistic vs monopoly'] },
    commonMistakes: ['Confusing monopolistic competition with monopoly'],
    jeetuLine: 'Make a comparison table of all 4 market forms. One table covers 15+ possible questions.'
  },
];

export const cuetEco2Subchapters: Subchapter[] = [
  {
    id: 'cuet-eco-2-1', chapterId: 'cuet-eco-2', name: 'National Income Accounting',
    jeeAsks: ['GDP/GNP/NNP calculations', 'Value added method', 'Income vs expenditure method'],
    pyqFocus: { trends: ['Numerical GDP calculations'], patterns: ['Identify which method to use'], traps: ['Double counting'] },
    commonMistakes: ['Including intermediate goods', 'Confusing GDP at market price vs factor cost'],
    jeetuLine: 'GDP = C + I + G + (X-M). This formula appears in almost every CUET economics paper.'
  },
  {
    id: 'cuet-eco-2-2', chapterId: 'cuet-eco-2', name: 'Money, Banking & Government Budget',
    jeeAsks: ['Money creation process', 'CRR/SLR/Repo rate', 'Revenue vs capital budget'],
    pyqFocus: { trends: ['RBI policy questions'], patterns: ['Link tools to objectives'], traps: ['Reverse repo vs repo'] },
    commonMistakes: ['Confusing fiscal vs monetary policy tools'],
    jeetuLine: 'RBI controls money supply. Government controls fiscal policy. Never mix these two.'
  },
];

export const cuetEco3Subchapters: Subchapter[] = [
  {
    id: 'cuet-eco-3-1', chapterId: 'cuet-eco-3', name: 'Indian Economy: Reforms & Development',
    jeeAsks: ['LPG reforms 1991', 'Five Year Plans', 'NITI Aayog', 'Poverty measurement'],
    pyqFocus: { trends: ['Post-1991 reforms focus'], patterns: ['Before vs after liberalization'], traps: ['Outdated poverty line figures'] },
    commonMistakes: ['Using old data', 'Confusing Planning Commission with NITI Aayog'],
    jeetuLine: '1991 is the turning point. Know what changed and why. Half the questions come from this era.'
  },
];

// ==================== POLITICAL SCIENCE ====================

export const cuetPS1Subchapters: Subchapter[] = [
  {
    id: 'cuet-ps-1-1', chapterId: 'cuet-ps-1', name: 'Fundamental Rights & Duties',
    jeeAsks: ['Article 14-32 coverage', 'FR vs DPSP', 'Writs', 'Recent amendments'],
    pyqFocus: { trends: ['Application-based questions on rights'], patterns: ['Match rights with articles'], traps: ['Right to Property is no longer FR'] },
    commonMistakes: ['Confusing FR with DPSP', 'Not knowing which rights are absolute'],
    jeetuLine: 'Learn all 6 fundamental rights with their article numbers. Direct questions guaranteed.'
  },
  {
    id: 'cuet-ps-1-2', chapterId: 'cuet-ps-1', name: 'Federal Structure & Judiciary',
    jeeAsks: ['Centre-State relations', 'Three lists', 'Supreme Court powers', 'Judicial review'],
    pyqFocus: { trends: ['Federalism case studies'], patterns: ['Which list → which government'], traps: ['Concurrent list jurisdiction'] },
    commonMistakes: ['Confusing residuary powers', 'Wrong court hierarchy'],
    jeetuLine: 'Union List, State List, Concurrent List. Know 10 items from each. That is enough for CUET.'
  },
];

export const cuetPS2Subchapters: Subchapter[] = [
  {
    id: 'cuet-ps-2-1', chapterId: 'cuet-ps-2', name: 'Cold War & International Politics',
    jeeAsks: ['NATO vs Warsaw Pact', 'NAM movement', 'UN structure', 'Post-Cold War world'],
    pyqFocus: { trends: ['Post-1991 world order'], patterns: ['Timeline-based questions'], traps: ['Dates of key events'] },
    commonMistakes: ['Confusing Cold War events', 'Wrong UN body functions'],
    jeetuLine: 'Make a timeline from 1945 to 1991. Cold War is all about chronology.'
  },
];

// ==================== HISTORY ====================

export const cuetHist1Subchapters: Subchapter[] = [
  {
    id: 'cuet-hist-1-1', chapterId: 'cuet-hist-1', name: 'Ancient India: Harappan to Gupta',
    jeeAsks: ['Harappan civilization features', 'Vedic period society', 'Maurya administration', 'Gupta achievements'],
    pyqFocus: { trends: ['Source-based questions'], patterns: ['Feature identification'], traps: ['Period mixing'] },
    commonMistakes: ['Confusing Maurya and Gupta periods', 'Wrong Ashoka inscription locations'],
    jeetuLine: 'Ancient India = know the key features of each dynasty. Tables work best here.'
  },
  {
    id: 'cuet-hist-1-2', chapterId: 'cuet-hist-1', name: 'Medieval India: Sultanate to Mughals',
    jeeAsks: ['Delhi Sultanate rulers', 'Mughal administration', 'Bhakti-Sufi movements'],
    pyqFocus: { trends: ['Administrative system comparison'], patterns: ['Ruler → reform matching'], traps: ['Similar sounding ruler names'] },
    commonMistakes: ['Mixing up sultanate dynasties', 'Wrong Mughal emperor achievements'],
    jeetuLine: 'Medieval India = rulers and their contributions. Make flashcards for each ruler.'
  },
];

export const cuetHist2Subchapters: Subchapter[] = [
  {
    id: 'cuet-hist-2-1', chapterId: 'cuet-hist-2', name: 'British Rule & National Movement',
    jeeAsks: ['Revolt of 1857', 'Congress sessions', 'Gandhi movements', 'Partition events'],
    pyqFocus: { trends: ['Chronological order questions'], patterns: ['Year → event matching'], traps: ['Similar movement names'] },
    commonMistakes: ['Wrong chronological order of movements', 'Confusing moderate vs extremist leaders'],
    jeetuLine: 'Learn the timeline: 1857 → 1885 → 1905 → 1919 → 1920 → 1930 → 1942 → 1947. Each year is a turning point.'
  },
  {
    id: 'cuet-hist-2-2', chapterId: 'cuet-hist-2', name: 'World History: Wars & Revolutions',
    jeeAsks: ['French Revolution', 'Industrial Revolution', 'World Wars', 'Nationalism'],
    pyqFocus: { trends: ['Cause-effect questions'], patterns: ['Revolution → outcome matching'], traps: ['Confusing WWI and WWII events'] },
    commonMistakes: ['Wrong treaty names', 'Confusing revolution causes'],
    jeetuLine: 'World History = causes and consequences. Every revolution has a pattern: oppression → uprising → change.'
  },
];

// ==================== GEOGRAPHY ====================

export const cuetGeo1Subchapters: Subchapter[] = [
  {
    id: 'cuet-geo-1-1', chapterId: 'cuet-geo-1', name: 'Physical Geography Fundamentals',
    jeeAsks: ['Plate tectonics', 'Weathering & erosion', 'Atmospheric circulation', 'Ocean currents'],
    pyqFocus: { trends: ['Diagram-based questions'], patterns: ['Process identification'], traps: ['Confusing wind patterns'] },
    commonMistakes: ['Wrong plate boundary types', 'Confusing weather vs climate'],
    jeetuLine: 'Physical Geography is about processes. Understand WHY things happen, not just WHAT.'
  },
  {
    id: 'cuet-geo-1-2', chapterId: 'cuet-geo-1', name: 'Human Geography & Population',
    jeeAsks: ['Population theories', 'Migration types', 'Settlement patterns', 'HDI factors'],
    pyqFocus: { trends: ['Data interpretation on population'], patterns: ['Theory → application'], traps: ['Outdated population data'] },
    commonMistakes: ['Using old census data', 'Confusing push vs pull factors'],
    jeetuLine: 'Human Geography = people and patterns. Focus on WHY people do what they do.'
  },
];

export const cuetGeo2Subchapters: Subchapter[] = [
  {
    id: 'cuet-geo-2-1', chapterId: 'cuet-geo-2', name: 'India: Resources & Industries',
    jeeAsks: ['Mineral distribution', 'Industrial regions', 'Agriculture types', 'Transport networks'],
    pyqFocus: { trends: ['Map-based location questions'], patterns: ['Resource → location matching'], traps: ['Similar mineral locations'] },
    commonMistakes: ['Wrong mineral belt locations', 'Confusing kharif vs rabi crops'],
    jeetuLine: 'Study with the map open. Geography without maps is like maths without formulas.'
  },
];

// ==================== PSYCHOLOGY ====================

export const cuetPsy1Subchapters: Subchapter[] = [
  {
    id: 'cuet-psy-1-1', chapterId: 'cuet-psy-1', name: 'Schools & Methods of Psychology',
    jeeAsks: ['Behaviorism vs Cognitive', 'Research methods', 'Experimental design basics'],
    pyqFocus: { trends: ['Matching psychologist with school'], patterns: ['School → key principle'], traps: ['Confusing similar schools'] },
    commonMistakes: ['Mixing up psychologists', 'Confusing observation vs experiment'],
    jeetuLine: 'Learn each school with its founder and key idea. One table covers everything.'
  },
  {
    id: 'cuet-psy-1-2', chapterId: 'cuet-psy-1', name: 'Learning, Memory & Cognition',
    jeeAsks: ['Classical vs operant conditioning', 'Memory models', 'Problem solving strategies'],
    pyqFocus: { trends: ['Application-based scenarios'], patterns: ['Identify which learning type'], traps: ['Positive vs negative reinforcement'] },
    commonMistakes: ['Confusing negative reinforcement with punishment', 'Wrong memory model stages'],
    jeetuLine: 'Negative reinforcement ≠ punishment. This is the most common trap in psychology exams.'
  },
];

export const cuetPsy2Subchapters: Subchapter[] = [
  {
    id: 'cuet-psy-2-1', chapterId: 'cuet-psy-2', name: 'Intelligence & Personality',
    jeeAsks: ['IQ tests & types', 'Personality theories (Freud, Jung, Big 5)', 'Assessment methods'],
    pyqFocus: { trends: ['Theory comparison questions'], patterns: ['Match theory with psychologist'], traps: ['Similar theory names'] },
    commonMistakes: ['Mixing up Freud stages', 'Confusing trait vs type theories'],
    jeetuLine: 'Freud, Jung, Rogers, Maslow, Allport — learn their ONE key contribution each.'
  },
  {
    id: 'cuet-psy-2-2', chapterId: 'cuet-psy-2', name: 'Psychological Disorders & Therapy',
    jeeAsks: ['Disorder classifications', 'Therapy types', 'Symptoms matching', 'DSM categories'],
    pyqFocus: { trends: ['Symptom → disorder matching'], patterns: ['Therapy → approach matching'], traps: ['Similar disorder symptoms'] },
    commonMistakes: ['Confusing anxiety vs mood disorders', 'Wrong therapy for disorder'],
    jeetuLine: 'Disorders = know the symptoms. Therapy = know the approach. Keep them separate.'
  },
];

// ==================== SOCIOLOGY ====================

export const cuetSoc1Subchapters: Subchapter[] = [
  {
    id: 'cuet-soc-1-1', chapterId: 'cuet-soc-1', name: 'Caste, Class & Social Institutions',
    jeeAsks: ['Caste system features', 'Social stratification', 'Family types', 'Marriage forms'],
    pyqFocus: { trends: ['Case-based questions'], patterns: ['Institution → feature matching'], traps: ['Modern vs traditional institutions'] },
    commonMistakes: ['Confusing caste with class', 'Wrong family type classifications'],
    jeetuLine: 'Caste is ascribed, class is achieved. This distinction is fundamental.'
  },
  {
    id: 'cuet-soc-1-2', chapterId: 'cuet-soc-1', name: 'Social Change & Movements',
    jeeAsks: ['Urbanization effects', 'Social movements in India', 'Globalization impact', 'Modernization theory'],
    pyqFocus: { trends: ['Contemporary social issues'], patterns: ['Cause → effect analysis'], traps: ['Outdated examples'] },
    commonMistakes: ['Confusing reform vs revolutionary movements', 'Wrong movement leaders'],
    jeetuLine: 'Social movements = know the leader, the cause, and the outcome. Three things per movement.'
  },
];

// ==================== ACCOUNTANCY ====================

export const cuetAcc1Subchapters: Subchapter[] = [
  {
    id: 'cuet-acc-1-1', chapterId: 'cuet-acc-1', name: 'Partnership Fundamentals & Goodwill',
    jeeAsks: ['Profit sharing ratio', 'Goodwill valuation methods', 'Admission/Retirement entries'],
    pyqFocus: { trends: ['Numerical problems dominate'], patterns: ['Journal entry format'], traps: ['Sacrificing vs gaining ratio'] },
    commonMistakes: ['Wrong goodwill method', 'Incorrect ratio calculations'],
    jeetuLine: 'Partnership = ratios and journal entries. Practice 10 problems and you will see the pattern.'
  },
  {
    id: 'cuet-acc-1-2', chapterId: 'cuet-acc-1', name: 'Dissolution of Partnership',
    jeeAsks: ['Realization account', 'Settlement of accounts', 'Treatment of unrecorded assets'],
    pyqFocus: { trends: ['Step-by-step dissolution problems'], patterns: ['Follow the standard format'], traps: ['Unrecorded assets/liabilities'] },
    commonMistakes: ['Missing entries for unrecorded items', 'Wrong order of settlement'],
    jeetuLine: 'Dissolution has a fixed format. Learn it once, apply everywhere.'
  },
];

export const cuetAcc2Subchapters: Subchapter[] = [
  {
    id: 'cuet-acc-2-1', chapterId: 'cuet-acc-2', name: 'Share & Debenture Issue',
    jeeAsks: ['Issue at par/premium/discount', 'Forfeiture & reissue', 'Debenture types'],
    pyqFocus: { trends: ['Journal entry problems'], patterns: ['Step-by-step share issue'], traps: ['Securities premium usage'] },
    commonMistakes: ['Wrong forfeiture entries', 'Confusing share vs debenture treatment'],
    jeetuLine: 'Shares and Debentures = know the journal entries for each scenario. They are fixed.'
  },
  {
    id: 'cuet-acc-2-2', chapterId: 'cuet-acc-2', name: 'Financial Statements & Ratio Analysis',
    jeeAsks: ['Balance sheet format', 'Ratio formulas', 'Cash flow statement preparation'],
    pyqFocus: { trends: ['Ratio calculation problems'], patterns: ['Formula → application'], traps: ['Which items go where in BS'] },
    commonMistakes: ['Wrong ratio formula', 'Missing items in cash flow'],
    jeetuLine: 'Learn 12 key ratios with formulas. CUET repeats the same ratios every year.'
  },
];

// ==================== BUSINESS STUDIES ====================

export const cuetBS1Subchapters: Subchapter[] = [
  {
    id: 'cuet-bs-1-1', chapterId: 'cuet-bs-1', name: 'Management Principles & Functions',
    jeeAsks: ['Fayol 14 principles', 'Taylor scientific management', 'Management functions', 'Delegation vs Decentralization'],
    pyqFocus: { trends: ['Case-based application'], patterns: ['Identify which principle applies'], traps: ['Similar sounding principles'] },
    commonMistakes: ['Confusing Fayol and Taylor', 'Mixing up management functions'],
    jeetuLine: 'Fayol = 14 principles (administrative). Taylor = scientific management (shop floor). Never mix them.'
  },
  {
    id: 'cuet-bs-1-2', chapterId: 'cuet-bs-1', name: 'Planning, Organizing & Staffing',
    jeeAsks: ['Planning process', 'Organizational structures', 'Recruitment vs selection', 'Training methods'],
    pyqFocus: { trends: ['Process-based questions'], patterns: ['Steps in order'], traps: ['Formal vs informal organization'] },
    commonMistakes: ['Wrong planning steps order', 'Confusing recruitment with selection'],
    jeetuLine: 'Business Studies is about processes. Learn the steps, apply to case studies.'
  },
];

export const cuetBS2Subchapters: Subchapter[] = [
  {
    id: 'cuet-bs-2-1', chapterId: 'cuet-bs-2', name: 'Financial Management & Markets',
    jeeAsks: ['Capital structure', 'Working capital factors', 'Money vs capital market', 'Stock exchange functions'],
    pyqFocus: { trends: ['Comparison questions'], patterns: ['Feature matching'], traps: ['Primary vs secondary market'] },
    commonMistakes: ['Confusing money and capital market instruments', 'Wrong factor affecting capital structure'],
    jeetuLine: 'Money market = short term. Capital market = long term. Everything else follows from this.'
  },
  {
    id: 'cuet-bs-2-2', chapterId: 'cuet-bs-2', name: 'Marketing & Consumer Protection',
    jeeAsks: ['4Ps/7Ps of marketing', 'Consumer rights', 'Branding vs packaging', 'Consumer forums'],
    pyqFocus: { trends: ['Consumer Protection Act 2019'], patterns: ['Right → situation matching'], traps: ['Old vs new consumer protection act'] },
    commonMistakes: ['Using old Act provisions', 'Confusing branding with trademark'],
    jeetuLine: 'Consumer Protection Act 2019 replaced the 1986 Act. Know the new provisions — they are always asked.'
  },
];
