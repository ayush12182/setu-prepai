// Class-wise chapter organization for JEE Preparation
// Based on NCERT and JEE syllabus structure

export type ClassLevel = '11' | '12';

export interface ClassChapterMapping {
  chapterId: string;
  class: ClassLevel;
}

// Physics chapters mapped to class
export const physicsClassMapping: ClassChapterMapping[] = [
  // Class 11 Physics
  { chapterId: 'phy-1', class: '11' },  // Kinematics
  { chapterId: 'phy-2', class: '11' },  // Laws of Motion
  { chapterId: 'phy-3', class: '11' },  // Work, Energy & Power
  { chapterId: 'phy-4', class: '11' },  // Rotational Motion
  { chapterId: 'phy-5', class: '11' },  // Gravitation
  { chapterId: 'phy-6', class: '11' },  // SHM & Waves
  { chapterId: 'phy-7', class: '11' },  // Thermodynamics
  
  // Class 12 Physics
  { chapterId: 'phy-8', class: '12' },  // Electrostatics
  { chapterId: 'phy-9', class: '12' },  // Current Electricity
  { chapterId: 'phy-10', class: '12' }, // Magnetism & EMI
  { chapterId: 'phy-11', class: '12' }, // Optics
  { chapterId: 'phy-12', class: '12' }, // Modern Physics
];

// Chemistry chapters mapped to class
export const chemistryClassMapping: ClassChapterMapping[] = [
  // Class 11 Chemistry
  { chapterId: 'chem-1', class: '11' },  // Mole Concept
  { chapterId: 'chem-2', class: '11' },  // Atomic Structure
  { chapterId: 'chem-3', class: '11' },  // Chemical Bonding
  { chapterId: 'chem-4', class: '11' },  // Thermodynamics
  { chapterId: 'chem-5', class: '11' },  // Chemical Equilibrium
  { chapterId: 'chem-6', class: '11' },  // Ionic Equilibrium
  { chapterId: 'chem-7', class: '11' },  // Redox Reactions
  { chapterId: 'chem-10', class: '11' }, // s-Block Elements
  { chapterId: 'chem-13', class: '11' }, // GOC
  { chapterId: 'chem-14', class: '11' }, // Hydrocarbons
  
  // Class 12 Chemistry
  { chapterId: 'chem-8', class: '12' },  // Electrochemistry
  { chapterId: 'chem-9', class: '12' },  // Chemical Kinetics
  { chapterId: 'chem-11', class: '12' }, // p-Block Elements
  { chapterId: 'chem-12', class: '12' }, // Coordination Compounds
  { chapterId: 'chem-15', class: '12' }, // Alcohols & Ethers
  { chapterId: 'chem-16', class: '12' }, // Aldehydes & Ketones
  { chapterId: 'chem-17', class: '12' }, // Carboxylic Acids
  { chapterId: 'chem-18', class: '12' }, // Amines
  { chapterId: 'chem-19', class: '12' }, // Biomolecules
];

// Maths chapters mapped to class
export const mathsClassMapping: ClassChapterMapping[] = [
  // Class 11 Maths
  { chapterId: 'math-1', class: '11' },  // Quadratic Equations
  { chapterId: 'math-2', class: '11' },  // Complex Numbers
  { chapterId: 'math-3', class: '11' },  // Sequences & Series
  { chapterId: 'math-4', class: '11' },  // Permutations & Combinations
  { chapterId: 'math-5', class: '11' },  // Binomial Theorem
  { chapterId: 'math-6', class: '11' },  // Straight Lines
  { chapterId: 'math-11', class: '11' }, // Trigonometry
  { chapterId: 'math-12', class: '11' }, // Statistics & Probability
  
  // Class 12 Maths
  { chapterId: 'math-7', class: '12' },  // Conic Sections
  { chapterId: 'math-8', class: '12' },  // Limits & Continuity
  { chapterId: 'math-9', class: '12' },  // Differentiation
  { chapterId: 'math-10', class: '12' }, // Integration
  { chapterId: 'math-13', class: '12' }, // Vectors & 3D
  { chapterId: 'math-14', class: '12' }, // Matrices & Determinants
];

// Helper functions
export const getChapterClass = (chapterId: string): ClassLevel | null => {
  const allMappings = [...physicsClassMapping, ...chemistryClassMapping, ...mathsClassMapping];
  const mapping = allMappings.find(m => m.chapterId === chapterId);
  return mapping?.class || null;
};

export const getPhysicsChapterIdsByClass = (classLevel: ClassLevel): string[] => {
  return physicsClassMapping.filter(m => m.class === classLevel).map(m => m.chapterId);
};

export const getChemistryChapterIdsByClass = (classLevel: ClassLevel): string[] => {
  return chemistryClassMapping.filter(m => m.class === classLevel).map(m => m.chapterId);
};

export const getMathsChapterIdsByClass = (classLevel: ClassLevel): string[] => {
  return mathsClassMapping.filter(m => m.class === classLevel).map(m => m.chapterId);
};
