// JEE Main & Advanced Syllabus - PCM Only

export type Subject = 'physics' | 'chemistry' | 'maths';
export type Weightage = 'High' | 'Medium' | 'Low';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Chapter {
  id: string;
  name: string;
  subject: Subject;
  weightage: Weightage;
  pyqFrequency: number; // 1-10 scale
  difficulty: Difficulty;
  prerequisites: string[];
  topics: string[];
}

export const physicsChapters: Chapter[] = [
  {
    id: 'phy-1',
    name: 'Mechanics - Kinematics',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Motion in 1D', 'Motion in 2D', 'Projectile Motion', 'Relative Motion']
  },
  {
    id: 'phy-2',
    name: 'Laws of Motion',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: ['phy-1'],
    topics: ['Newton\'s Laws', 'Friction', 'Circular Motion', 'Pseudo Forces']
  },
  {
    id: 'phy-3',
    name: 'Work, Energy & Power',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: ['phy-1', 'phy-2'],
    topics: ['Work-Energy Theorem', 'Conservation of Energy', 'Collisions', 'Power']
  },
  {
    id: 'phy-4',
    name: 'Rotational Motion',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['phy-1', 'phy-2', 'phy-3'],
    topics: ['Moment of Inertia', 'Torque', 'Angular Momentum', 'Rolling Motion']
  },
  {
    id: 'phy-5',
    name: 'Gravitation',
    subject: 'physics',
    weightage: 'Medium',
    pyqFrequency: 6,
    difficulty: 'Medium',
    prerequisites: ['phy-1', 'phy-2'],
    topics: ['Newton\'s Law of Gravitation', 'Orbital Motion', 'Escape Velocity', 'Satellites']
  },
  {
    id: 'phy-6',
    name: 'Waves & Oscillations',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Hard',
    prerequisites: ['phy-1'],
    topics: ['SHM', 'Damped Oscillations', 'Wave Equation', 'Superposition', 'Standing Waves']
  },
  {
    id: 'phy-7',
    name: 'Thermodynamics',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Laws of Thermodynamics', 'Heat Engines', 'Entropy', 'Carnot Cycle']
  },
  {
    id: 'phy-8',
    name: 'Electrostatics',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: [],
    topics: ['Coulomb\'s Law', 'Electric Field', 'Gauss\'s Law', 'Capacitors']
  },
  {
    id: 'phy-9',
    name: 'Current Electricity',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: ['phy-8'],
    topics: ['Ohm\'s Law', 'Kirchhoff\'s Laws', 'RC Circuits', 'Electrical Instruments']
  },
  {
    id: 'phy-10',
    name: 'Magnetism & EMI',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Hard',
    prerequisites: ['phy-9'],
    topics: ['Biot-Savart Law', 'Ampere\'s Law', 'Faraday\'s Law', 'Inductance', 'AC Circuits']
  },
  {
    id: 'phy-11',
    name: 'Optics',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: ['phy-6'],
    topics: ['Reflection', 'Refraction', 'Interference', 'Diffraction', 'Polarization']
  },
  {
    id: 'phy-12',
    name: 'Modern Physics',
    subject: 'physics',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Photoelectric Effect', 'Atomic Structure', 'Nuclear Physics', 'Semiconductors']
  }
];

export const chemistryChapters: Chapter[] = [
  // Physical Chemistry
  {
    id: 'chem-1',
    name: 'Mole Concept & Stoichiometry',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Mole Concept', 'Limiting Reagent', 'Percentage Composition', 'Empirical Formula']
  },
  {
    id: 'chem-2',
    name: 'Atomic Structure',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Bohr Model', 'Quantum Numbers', 'Electronic Configuration', 'Photoelectric Effect']
  },
  {
    id: 'chem-3',
    name: 'Chemical Bonding',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['chem-2'],
    topics: ['VSEPR Theory', 'Hybridization', 'MOT', 'Hydrogen Bonding']
  },
  {
    id: 'chem-4',
    name: 'Thermodynamics & Thermochemistry',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: ['chem-1'],
    topics: ['Enthalpy', 'Entropy', 'Gibbs Free Energy', 'Hess\'s Law']
  },
  {
    id: 'chem-5',
    name: 'Chemical Equilibrium',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['chem-4'],
    topics: ['Le Chatelier Principle', 'Equilibrium Constant', 'Ionic Equilibrium', 'Buffer Solutions']
  },
  {
    id: 'chem-6',
    name: 'Electrochemistry',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Hard',
    prerequisites: ['chem-5'],
    topics: ['Nernst Equation', 'Electrolysis', 'Galvanic Cells', 'Conductance']
  },
  {
    id: 'chem-7',
    name: 'Chemical Kinetics',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Rate Laws', 'Order of Reaction', 'Arrhenius Equation', 'Reaction Mechanisms']
  },
  // Organic Chemistry
  {
    id: 'chem-8',
    name: 'GOC & Isomerism',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['chem-3'],
    topics: ['Inductive Effect', 'Resonance', 'Hyperconjugation', 'Stereoisomerism']
  },
  {
    id: 'chem-9',
    name: 'Hydrocarbons',
    subject: 'chemistry',
    weightage: 'Medium',
    pyqFrequency: 7,
    difficulty: 'Medium',
    prerequisites: ['chem-8'],
    topics: ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic Compounds']
  },
  {
    id: 'chem-10',
    name: 'Organic Reactions & Mechanisms',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['chem-8', 'chem-9'],
    topics: ['Substitution', 'Elimination', 'Addition', 'Rearrangements']
  },
  // Inorganic Chemistry
  {
    id: 'chem-11',
    name: 'Periodic Table & Properties',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Easy',
    prerequisites: ['chem-2'],
    topics: ['Periodic Trends', 'Ionization Energy', 'Electronegativity', 'Atomic Radius']
  },
  {
    id: 'chem-12',
    name: 'Coordination Chemistry',
    subject: 'chemistry',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['chem-3', 'chem-11'],
    topics: ['Werner Theory', 'CFT', 'Isomerism', 'Nomenclature']
  }
];

export const mathsChapters: Chapter[] = [
  {
    id: 'math-1',
    name: 'Algebra - Quadratic Equations',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Roots', 'Discriminant', 'Nature of Roots', 'Graph of Quadratic']
  },
  {
    id: 'math-2',
    name: 'Complex Numbers',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: ['math-1'],
    topics: ['Algebra of Complex Numbers', 'Argand Plane', 'De Moivre\'s Theorem', 'Roots of Unity']
  },
  {
    id: 'math-3',
    name: 'Matrices & Determinants',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Matrix Operations', 'Inverse', 'Cramer\'s Rule', 'Properties of Determinants']
  },
  {
    id: 'math-4',
    name: 'Permutations & Combinations',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Hard',
    prerequisites: [],
    topics: ['Fundamental Principle', 'Arrangements', 'Selections', 'Distributions']
  },
  {
    id: 'math-5',
    name: 'Probability',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['math-4'],
    topics: ['Conditional Probability', 'Bayes\' Theorem', 'Random Variables', 'Distributions']
  },
  {
    id: 'math-6',
    name: 'Calculus - Limits & Continuity',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Limits', 'L\'Hopital Rule', 'Continuity', 'Types of Discontinuity']
  },
  {
    id: 'math-7',
    name: 'Differentiation',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: ['math-6'],
    topics: ['First Principles', 'Chain Rule', 'Implicit Differentiation', 'Parametric']
  },
  {
    id: 'math-8',
    name: 'Application of Derivatives',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['math-7'],
    topics: ['Maxima & Minima', 'Rate of Change', 'Tangent & Normal', 'Curve Sketching']
  },
  {
    id: 'math-9',
    name: 'Integration',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['math-7'],
    topics: ['Indefinite Integrals', 'Definite Integrals', 'Integration Techniques', 'Properties']
  },
  {
    id: 'math-10',
    name: 'Coordinate Geometry',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Straight Lines', 'Circles', 'Parabola', 'Ellipse', 'Hyperbola']
  },
  {
    id: 'math-11',
    name: 'Vectors & 3D Geometry',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 9,
    difficulty: 'Hard',
    prerequisites: ['math-10'],
    topics: ['Vector Algebra', 'Scalar & Vector Products', 'Lines in 3D', 'Planes']
  },
  {
    id: 'math-12',
    name: 'Trigonometry',
    subject: 'maths',
    weightage: 'High',
    pyqFrequency: 8,
    difficulty: 'Medium',
    prerequisites: [],
    topics: ['Identities', 'Equations', 'Inverse Trig', 'Heights & Distances']
  }
];

export const allChapters = [...physicsChapters, ...chemistryChapters, ...mathsChapters];

export const getChaptersBySubject = (subject: Subject): Chapter[] => {
  switch (subject) {
    case 'physics': return physicsChapters;
    case 'chemistry': return chemistryChapters;
    case 'maths': return mathsChapters;
  }
};

export const getChapterById = (id: string): Chapter | undefined => {
  return allChapters.find(ch => ch.id === id);
};
