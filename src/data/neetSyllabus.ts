// NEET UG Syllabus - Biology, Chemistry, Physics
// Referenced from NTA NEET syllabus structure

import type { Chapter, Subject, Weightage, Difficulty, PYQData } from './syllabus';

export type NeetSubject = 'biology' | 'chemistry' | 'physics';

// ==================== BIOLOGY ====================
export const neetBiologyChapters: Chapter[] = [
  {
    id: 'neet-bio-1',
    name: 'Cell Biology',
    subject: 'biology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Cell Structure', 'Cell Organelles', 'Cell Division', 'Biomolecules', 'Cell Cycle'],
    keyFormulas: [],
    pyqData: { total: 40, postCovid: 18, preCovid: 16, legacy: 6, trendingConcepts: ['Mitosis vs Meiosis', 'Cell organelle functions', 'Biomolecule classification'] },
    examTips: ['NCERT diagrams are directly asked', 'Learn cell organelle functions by comparison tables', 'Meiosis stages are high-yield']
  },
  {
    id: 'neet-bio-2',
    name: 'Human Physiology',
    subject: 'biology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['neet-bio-1'],
    topics: ['Digestion', 'Respiration', 'Circulation', 'Excretion', 'Nervous System', 'Endocrine System', 'Locomotion'],
    keyFormulas: [],
    pyqData: { total: 60, postCovid: 28, preCovid: 24, legacy: 8, trendingConcepts: ['Cardiac cycle', 'Nephron structure', 'Neural signaling', 'Hormonal regulation'] },
    examTips: ['Highest weightage chapter in NEET', 'Focus on NCERT diagrams', 'Learn enzyme names and their functions']
  },
  {
    id: 'neet-bio-3',
    name: 'Plant Physiology',
    subject: 'biology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['neet-bio-1'],
    topics: ['Photosynthesis', 'Respiration in Plants', 'Plant Growth', 'Mineral Nutrition', 'Transport in Plants'],
    keyFormulas: [],
    pyqData: { total: 35, postCovid: 16, preCovid: 14, legacy: 5, trendingConcepts: ['C3 vs C4 plants', 'Krebs cycle', 'Photorespiration', 'Auxin functions'] },
    examTips: ['C3 vs C4 comparison is asked every year', 'Learn all cycles with diagrams', 'Know all plant hormones and their effects']
  },
  {
    id: 'neet-bio-4',
    name: 'Genetics & Evolution',
    subject: 'biology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['neet-bio-1'],
    topics: ['Mendelian Genetics', 'Molecular Basis of Inheritance', 'DNA Replication', 'Transcription', 'Translation', 'Evolution'],
    keyFormulas: [],
    pyqData: { total: 50, postCovid: 22, preCovid: 20, legacy: 8, trendingConcepts: ['Punnett squares', 'DNA replication enzymes', 'Hardy-Weinberg principle', 'Operon model'] },
    examTips: ['Mendel crosses are directly asked', 'Learn all enzymes in replication/transcription', 'Lac operon is a favourite']
  },
  {
    id: 'neet-bio-5',
    name: 'Ecology & Environment',
    subject: 'biology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Ecosystem', 'Biodiversity', 'Environmental Issues', 'Population Ecology', 'Ecological Succession'],
    keyFormulas: [],
    pyqData: { total: 35, postCovid: 16, preCovid: 14, legacy: 5, trendingConcepts: ['Energy flow', 'Ecological pyramids', 'Biodiversity hotspots', 'Ozone depletion'] },
    examTips: ['Easiest scoring chapter', 'Pure NCERT — read line by line', '5-6 questions guaranteed']
  },
  {
    id: 'neet-bio-6',
    name: 'Reproduction',
    subject: 'biology' as unknown as Subject,
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['neet-bio-1'],
    topics: ['Reproduction in Organisms', 'Human Reproduction', 'Reproductive Health', 'Sexual Reproduction in Plants'],
    keyFormulas: [],
    pyqData: { total: 40, postCovid: 18, preCovid: 16, legacy: 6, trendingConcepts: ['Gametogenesis', 'Embryo development', 'Contraception methods', 'Pollination types'] },
    examTips: ['Diagrams of human reproductive system', 'Learn all stages of embryo development', 'Contraception methods table']
  },
  {
    id: 'neet-bio-7',
    name: 'Biotechnology',
    subject: 'biology' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: ['neet-bio-4'],
    topics: ['Recombinant DNA Technology', 'PCR', 'Gene Cloning', 'Applications of Biotechnology', 'GMOs', 'Gene Therapy'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Restriction enzymes', 'PCR steps', 'Bt crops', 'Gene therapy'] },
    examTips: ['Learn all restriction enzymes', 'PCR steps are directly asked', 'Bt cotton and Golden Rice']
  },
  {
    id: 'neet-bio-8',
    name: 'Animal Kingdom & Morphology',
    subject: 'biology' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Animal Classification', 'Structural Organization', 'Animal Tissues', 'Morphology of Animals'],
    keyFormulas: [],
    pyqData: { total: 30, postCovid: 14, preCovid: 12, legacy: 4, trendingConcepts: ['Phylum characteristics', 'Tissue types', 'Organ systems'] },
    examTips: ['Learn phylum examples', 'Comparison tables work best', 'NCERT examples are asked directly']
  },
  {
    id: 'neet-bio-9',
    name: 'Plant Kingdom & Morphology',
    subject: 'biology' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Plant Classification', 'Plant Morphology', 'Plant Anatomy', 'Plant Tissues'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Root/stem/leaf modifications', 'Flower parts', 'Tissue types'] },
    examTips: ['Diagrams are key', 'NCERT examples and figures', 'Learn modifications with examples']
  },
  {
    id: 'neet-bio-10',
    name: 'Human Health & Disease',
    subject: 'biology' as unknown as Subject,
    weightage: 'Medium',
    difficulty: 'Easy',
    prerequisites: ['neet-bio-2'],
    topics: ['Immunity', 'Common Diseases', 'Cancer', 'AIDS', 'Drug Abuse', 'Vaccines'],
    keyFormulas: [],
    pyqData: { total: 20, postCovid: 10, preCovid: 8, legacy: 2, trendingConcepts: ['Types of immunity', 'Disease pathogens', 'Cancer types', 'Vaccine types'] },
    examTips: ['Learn disease-pathogen table', 'Types of immunity comparison', 'NCERT only']
  },
];

// ==================== NEET CHEMISTRY ====================
export const neetChemistryChapters: Chapter[] = [
  {
    id: 'neet-chem-1',
    name: 'Chemical Bonding',
    subject: 'chemistry',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['VSEPR Theory', 'Hybridization', 'MOT', 'Ionic & Covalent Bonds', 'Hydrogen Bonding'],
    keyFormulas: ['Bond order = (Nb - Na)/2'],
    pyqData: { total: 35, postCovid: 16, preCovid: 14, legacy: 5, trendingConcepts: ['Hybridization', 'MOT diagrams', 'VSEPR shapes'] },
    examTips: ['Learn hybridization for common molecules', 'MOT bond order calculation', 'VSEPR geometry table']
  },
  {
    id: 'neet-chem-2',
    name: 'Organic Chemistry Basics',
    subject: 'chemistry',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['GOC', 'Isomerism', 'Hydrocarbons', 'Reaction Mechanisms', 'Named Reactions'],
    keyFormulas: [],
    pyqData: { total: 45, postCovid: 20, preCovid: 18, legacy: 7, trendingConcepts: ['IUPAC naming', 'Reaction mechanisms', 'Isomerism types'] },
    examTips: ['IUPAC naming is directly asked', 'Learn named reactions', 'Focus on NCERT reactions']
  },
  {
    id: 'neet-chem-3',
    name: 'Thermodynamics & Equilibrium',
    subject: 'chemistry',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['First Law', 'Enthalpy', 'Entropy', 'Free Energy', 'Chemical Equilibrium', 'Le Chatelier'],
    keyFormulas: ['ΔG = ΔH - TΔS', 'Kp = Kc(RT)^Δn'],
    pyqData: { total: 35, postCovid: 16, preCovid: 14, legacy: 5, trendingConcepts: ['Gibbs energy', 'Equilibrium calculations', 'Le Chatelier principle'] },
    examTips: ['Hess law problems', 'Relationship between Kp and Kc', 'Spontaneity conditions']
  },
  {
    id: 'neet-chem-4',
    name: 'Coordination Compounds',
    subject: 'chemistry',
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Werner Theory', 'IUPAC Nomenclature', 'Isomerism', 'CFT', 'Bonding in Complexes'],
    keyFormulas: [],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['IUPAC naming', 'Isomerism', 'CFT splitting'] },
    examTips: ['Naming is directly asked', 'Learn common complex ions', 'CFT d-orbital splitting']
  },
  {
    id: 'neet-chem-5',
    name: 'Biomolecules & Polymers',
    subject: 'chemistry',
    weightage: 'Medium',
    difficulty: 'Easy',
    prerequisites: [],
    topics: ['Carbohydrates', 'Proteins', 'Nucleic Acids', 'Vitamins', 'Polymers'],
    keyFormulas: [],
    pyqData: { total: 20, postCovid: 10, preCovid: 8, legacy: 2, trendingConcepts: ['Amino acids', 'Polymer types', 'DNA vs RNA'] },
    examTips: ['Pure NCERT', 'Classification tables', 'Easy scoring chapter']
  },
  {
    id: 'neet-chem-6',
    name: 'Electrochemistry & Kinetics',
    subject: 'chemistry',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Electrochemical Cells', 'Nernst Equation', 'Conductance', 'Rate of Reaction', 'Order of Reaction'],
    keyFormulas: ['E = E° - (RT/nF)lnQ', 'k = Ae^(-Ea/RT)', 't½ = 0.693/k'],
    pyqData: { total: 30, postCovid: 14, preCovid: 12, legacy: 4, trendingConcepts: ['Nernst equation', 'Rate law', 'Half-life calculations'] },
    examTips: ['Nernst equation numericals', 'First order kinetics', 'Conductance vs concentration']
  },
  {
    id: 'neet-chem-7',
    name: 'p-Block & d-Block Elements',
    subject: 'chemistry',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Group 15-18 Elements', 'Transition Elements', 'Lanthanides', 'Important Compounds'],
    keyFormulas: [],
    pyqData: { total: 40, postCovid: 18, preCovid: 16, legacy: 6, trendingConcepts: ['Group properties', 'Transition metal properties', 'Important compounds'] },
    examTips: ['NCERT line by line', 'Learn trends', 'Important compounds and their uses']
  },
  {
    id: 'neet-chem-8',
    name: 'Solutions & Solid State',
    subject: 'chemistry',
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Colligative Properties', 'Raoult Law', 'Crystal Structures', 'Packing Efficiency', 'Defects'],
    keyFormulas: ['ΔTb = Kb.m', 'ΔTf = Kf.m', 'π = CRT'],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Colligative properties', 'Unit cell calculations', 'Crystal defects'] },
    examTips: ['Numericals on colligative properties', 'Packing efficiency values', 'Types of crystal defects']
  },
];

// ==================== NEET PHYSICS ====================
export const neetPhysicsChapters: Chapter[] = [
  {
    id: 'neet-phy-1',
    name: 'Mechanics',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Gravitation', 'Properties of Matter'],
    keyFormulas: ['v = u + at', 's = ut + ½at²', 'F = ma', 'W = Fd cosθ', 'KE = ½mv²'],
    pyqData: { total: 40, postCovid: 18, preCovid: 16, legacy: 6, trendingConcepts: ['Projectile motion', 'Friction problems', 'Energy conservation'] },
    examTips: ['NEET physics is conceptual, not very mathematical', 'Focus on NCERT problems', 'FBD is essential']
  },
  {
    id: 'neet-phy-2',
    name: 'Thermodynamics & Kinetic Theory',
    subject: 'physics',
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Laws of Thermodynamics', 'Heat Transfer', 'Kinetic Theory of Gases', 'Thermal Properties'],
    keyFormulas: ['PV = nRT', 'dQ = dU + dW', 'vrms = √(3RT/M)'],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Thermodynamic processes', 'KTG formulas', 'Thermal expansion'] },
    examTips: ['Conceptual questions from NCERT', 'PV diagram analysis', 'Gas law applications']
  },
  {
    id: 'neet-phy-3',
    name: 'Electrostatics & Current Electricity',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Coulomb Law', 'Electric Field', 'Potential', 'Capacitors', 'Ohm Law', 'Kirchhoff Laws', 'Electrical Instruments'],
    keyFormulas: ['F = kq1q2/r²', 'V = IR', 'C = ε0A/d', 'P = VI'],
    pyqData: { total: 35, postCovid: 16, preCovid: 14, legacy: 5, trendingConcepts: ['Capacitor combinations', 'Kirchhoff problems', 'Wheatstone bridge'] },
    examTips: ['Conceptual + numerical mix', 'NCERT solved examples', 'Circuit analysis']
  },
  {
    id: 'neet-phy-4',
    name: 'Magnetism & EMI',
    subject: 'physics',
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: ['neet-phy-3'],
    topics: ['Magnetic Force', 'Biot-Savart', 'Ampere Law', 'Faraday Law', 'AC Circuits', 'EM Waves'],
    keyFormulas: ['F = qvBsinθ', 'ε = -dφ/dt', 'Z = √(R²+(XL-XC)²)'],
    pyqData: { total: 25, postCovid: 12, preCovid: 10, legacy: 3, trendingConcepts: ['Magnetic force on charge', 'Motional EMF', 'AC circuits'] },
    examTips: ['Direction rules (Fleming)', 'Lenz law applications', 'Transformer problems']
  },
  {
    id: 'neet-phy-5',
    name: 'Optics & Modern Physics',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Ray Optics', 'Wave Optics', 'Photoelectric Effect', 'Atomic Models', 'Nuclear Physics', 'Semiconductors'],
    keyFormulas: ['1/v - 1/u = 1/f', 'E = hν', 'λ = h/mv', 'N = N0e^(-λt)'],
    pyqData: { total: 35, postCovid: 16, preCovid: 14, legacy: 5, trendingConcepts: ['Mirror/lens formula', 'Photoelectric effect', 'Bohr model', 'Radioactivity'] },
    examTips: ['Sign convention', 'YDSE fringe width', 'Bohr model energy levels', 'Half-life calculations']
  },
  {
    id: 'neet-phy-6',
    name: 'Waves & Oscillations',
    subject: 'physics',
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['SHM', 'Wave Motion', 'Sound Waves', 'Standing Waves', 'Doppler Effect'],
    keyFormulas: ['T = 2π√(m/k)', 'v = fλ', 'f = f0(v±vo)/(v∓vs)'],
    pyqData: { total: 20, postCovid: 10, preCovid: 8, legacy: 2, trendingConcepts: ['SHM basics', 'Standing waves', 'Doppler effect'] },
    examTips: ['SHM energy concepts', 'Open/closed pipe frequencies', 'Doppler formula']
  },
];

// Helper functions for NEET
export const getNeetBiologyChapters = () => neetBiologyChapters;
export const getNeetChemistryChapters = () => neetChemistryChapters;
export const getNeetPhysicsChapters = () => neetPhysicsChapters;

export const getNeetChapterById = (id: string) => {
  return [...neetBiologyChapters, ...neetChemistryChapters, ...neetPhysicsChapters].find(c => c.id === id);
};
