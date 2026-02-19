// JEE Main & Advanced Syllabus - PCM Only (STRICT)
// Referenced from Allen, PW, Resonance structure

export type Subject = 'physics' | 'chemistry' | 'maths' | 'biology';
export type Weightage = 'High' | 'Medium' | 'Low';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ChemistryType = 'Physical' | 'Organic' | 'Inorganic';

export { biologyChapters } from './biologySyllabus';


export interface PYQData {
  total: number;
  postCovid: number; // 2020-2025 (HIGH PRIORITY)
  preCovid: number;  // 2010-2019
  legacy: number;    // Before 2010
  trendingConcepts: string[];
}

export interface Chapter {
  id: string;
  name: string;
  subject: Subject;
  chemistryType?: ChemistryType;
  weightage: Weightage;
  difficulty: Difficulty;
  prerequisites: string[];
  topics: string[];
  keyFormulas: string[];
  pyqData: PYQData;
  examTips: string[];
}

// ==================== PHYSICS ====================
export const physicsChapters: Chapter[] = [
  {
    id: 'phy-1',
    name: 'Kinematics',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Motion in 1D',
      'Motion in 2D',
      'Projectile Motion',
      'Relative Motion',
      'Graphs of Motion'
    ],
    keyFormulas: [
      'v = u + at',
      's = ut + ½at²',
      'v² = u² + 2as',
      'R = u²sin2θ/g (Range)',
      'H = u²sin²θ/2g (Max Height)',
      'T = 2usinθ/g (Time of Flight)'
    ],
    pyqData: {
      total: 45,
      postCovid: 18,
      preCovid: 20,
      legacy: 7,
      trendingConcepts: ['Projectile on incline', 'Relative velocity problems', 'Graph-based questions']
    },
    examTips: [
      'Direction of velocity changes but speed may not',
      'At highest point of projectile, vy = 0, not v',
      'Use components for 2D problems'
    ]
  },
  {
    id: 'phy-2',
    name: 'Laws of Motion',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['phy-1'],
    topics: [
      "Newton's Laws",
      'Free Body Diagrams',
      'Friction (Static & Kinetic)',
      'Circular Motion Dynamics',
      'Pseudo Forces',
      'Constraint Relations'
    ],
    keyFormulas: [
      'F = ma',
      'fs ≤ μsN',
      'fk = μkN',
      'ac = v²/r = ω²r',
      'Fpseudo = -ma (non-inertial frame)'
    ],
    pyqData: {
      total: 52,
      postCovid: 22,
      preCovid: 22,
      legacy: 8,
      trendingConcepts: ['Pulley constraint problems', 'Friction on incline', 'Banking of roads']
    },
    examTips: [
      'Always draw FBD first',
      'Check if friction is static or kinetic',
      'Constraint: acceleration relation via string length'
    ]
  },
  {
    id: 'phy-3',
    name: 'Work, Energy & Power',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['phy-1', 'phy-2'],
    topics: [
      'Work by constant/variable force',
      'Work-Energy Theorem',
      'Conservation of Energy',
      'Potential Energy curves',
      'Collisions (1D & 2D)',
      'Power'
    ],
    keyFormulas: [
      'W = F·s·cosθ',
      'W = ∫F·dx',
      'KE = ½mv²',
      'PE (spring) = ½kx²',
      'PE (gravity) = mgh',
      'e = (v2-v1)/(u1-u2)',
      'P = dW/dt = F·v'
    ],
    pyqData: {
      total: 48,
      postCovid: 20,
      preCovid: 20,
      legacy: 8,
      trendingConcepts: ['Collision problems', 'Variable force work', 'PE curve analysis']
    },
    examTips: [
      'Use energy conservation when forces are conservative',
      'In collision, momentum always conserved',
      'Check if collision is elastic (e=1) or inelastic'
    ]
  },
  {
    id: 'phy-4',
    name: 'Rotational Motion',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['phy-1', 'phy-2', 'phy-3'],
    topics: [
      'Moment of Inertia',
      'Parallel & Perpendicular Axis Theorems',
      'Torque & Angular Momentum',
      'Rotational Kinematics',
      'Rolling Motion',
      'Angular Impulse'
    ],
    keyFormulas: [
      'τ = r × F = Iα',
      'L = Iω = r × p',
      'I = Σmr² or ∫r²dm',
      'I∥ = Icm + Md²',
      'I⊥ = Ix + Iy (for lamina)',
      'KE(rolling) = ½mv² + ½Iω²',
      'v = ωr (pure rolling)'
    ],
    pyqData: {
      total: 55,
      postCovid: 24,
      preCovid: 23,
      legacy: 8,
      trendingConcepts: ['Pure rolling problems', 'Angular momentum conservation', 'Toppling vs sliding']
    },
    examTips: [
      'For rolling: v = ωr at contact point',
      'Use energy method for incline problems',
      'Angular momentum conserved if no external torque'
    ]
  },
  {
    id: 'phy-5',
    name: 'Gravitation',
    subject: 'physics',
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: ['phy-1', 'phy-2'],
    topics: [
      "Newton's Law of Gravitation",
      'Gravitational Field & Potential',
      'Orbital Motion',
      'Escape & Orbital Velocity',
      "Kepler's Laws",
      'Satellites'
    ],
    keyFormulas: [
      'F = GMm/r²',
      'g = GM/R²',
      've = √(2gR) = √(2GM/R)',
      'vo = √(gR) = √(GM/R)',
      'T² ∝ a³ (Kepler III)',
      'U = -GMm/r'
    ],
    pyqData: {
      total: 35,
      postCovid: 14,
      preCovid: 15,
      legacy: 6,
      trendingConcepts: ['Satellite problems', 'Variation of g', 'Energy in orbits']
    },
    examTips: [
      'Negative sign in potential energy is important',
      'At surface: use g, not G formula',
      'Geostationary orbit: T = 24 hrs'
    ]
  },
  {
    id: 'phy-6',
    name: 'SHM & Waves',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['phy-1'],
    topics: [
      'Simple Harmonic Motion',
      'Spring-Mass System',
      'Simple Pendulum',
      'Wave Equation',
      'Superposition',
      'Standing Waves',
      'Beats & Doppler Effect'
    ],
    keyFormulas: [
      'x = A sin(ωt + φ)',
      'v = Aω cos(ωt + φ)',
      'a = -ω²x',
      'T = 2π√(m/k) (spring)',
      'T = 2π√(l/g) (pendulum)',
      'v = √(T/μ) (wave on string)',
      "f' = f(v±vo)/(v∓vs) (Doppler)"
    ],
    pyqData: {
      total: 50,
      postCovid: 21,
      preCovid: 21,
      legacy: 8,
      trendingConcepts: ['Combination of SHMs', 'Standing wave problems', 'Doppler effect']
    },
    examTips: [
      'Energy in SHM oscillates between KE and PE',
      'Phase difference important in superposition',
      'For standing waves: nodes and antinodes fixed'
    ]
  },
  {
    id: 'phy-7',
    name: 'Thermodynamics',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'First Law of Thermodynamics',
      'Thermodynamic Processes',
      'Heat Engines',
      'Carnot Cycle',
      'Entropy',
      'Kinetic Theory of Gases'
    ],
    keyFormulas: [
      'dQ = dU + dW',
      'W = ∫PdV',
      'PV = nRT',
      'Cp - Cv = R',
      'η = 1 - T2/T1 (Carnot)',
      'vrms = √(3RT/M)'
    ],
    pyqData: {
      total: 42,
      postCovid: 18,
      preCovid: 18,
      legacy: 6,
      trendingConcepts: ['PV diagram analysis', 'Process identification', 'Engine efficiency']
    },
    examTips: [
      'For cyclic process: ΔU = 0',
      'Isothermal: ΔT = 0, ΔU = 0',
      'Adiabatic: Q = 0'
    ]
  },
  {
    id: 'phy-8',
    name: 'Electrostatics',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: [],
    topics: [
      "Coulomb's Law",
      'Electric Field',
      "Gauss's Law",
      'Electric Potential',
      'Capacitors',
      'Dielectrics'
    ],
    keyFormulas: [
      'F = kq1q2/r²',
      'E = kq/r²',
      'V = kq/r',
      'φ = ∫E·dA = qenc/ε0',
      'C = ε0A/d (parallel plate)',
      'U = ½CV² = ½QV = Q²/2C'
    ],
    pyqData: {
      total: 58,
      postCovid: 25,
      preCovid: 25,
      legacy: 8,
      trendingConcepts: ['Capacitor combinations', 'Gauss law applications', 'Conductor properties']
    },
    examTips: [
      'Inside conductor: E = 0',
      'Capacitors in series: 1/C = Σ(1/Ci)',
      'Energy stored changes when battery disconnected vs connected'
    ]
  },
  {
    id: 'phy-9',
    name: 'Current Electricity',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['phy-8'],
    topics: [
      "Ohm's Law",
      'Resistance & Resistivity',
      "Kirchhoff's Laws",
      'RC Circuits',
      'Electrical Instruments',
      'Heating Effect'
    ],
    keyFormulas: [
      'V = IR',
      'R = ρl/A',
      'P = I²R = V²/R = VI',
      'Rs = R1 + R2 + ...',
      '1/Rp = 1/R1 + 1/R2 + ...',
      'q = q0(1 - e^(-t/RC))'
    ],
    pyqData: {
      total: 55,
      postCovid: 23,
      preCovid: 24,
      legacy: 8,
      trendingConcepts: ['Meter bridge', 'Potentiometer', 'RC circuit charging/discharging']
    },
    examTips: [
      'Use Kirchhoff when circuit is complex',
      'Wheatstone bridge: no current through galvanometer when balanced',
      'Time constant τ = RC'
    ]
  },
  {
    id: 'phy-10',
    name: 'Magnetism & EMI',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['phy-9'],
    topics: [
      'Biot-Savart Law',
      "Ampere's Law",
      'Magnetic Force on Current',
      "Faraday's Law",
      "Lenz's Law",
      'Inductance',
      'AC Circuits'
    ],
    keyFormulas: [
      'dB = (μ0/4π)(Idl × r̂)/r²',
      'F = qv × B = BIL',
      'ε = -dφ/dt',
      'φ = LI',
      'XL = ωL, XC = 1/ωC',
      'Z = √(R² + (XL-XC)²)'
    ],
    pyqData: {
      total: 52,
      postCovid: 22,
      preCovid: 22,
      legacy: 8,
      trendingConcepts: ['LCR circuits', 'Motional EMF', 'Transformer problems']
    },
    examTips: [
      'Lenz law: induced current opposes change',
      'At resonance: XL = XC, Z = R',
      'Power factor = cosφ = R/Z'
    ]
  },
  {
    id: 'phy-11',
    name: 'Optics',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['phy-6'],
    topics: [
      'Reflection & Mirrors',
      'Refraction & Lenses',
      'Prism & Dispersion',
      'Interference',
      'Diffraction',
      'Polarization'
    ],
    keyFormulas: [
      '1/v + 1/u = 1/f (mirror/lens)',
      'n = sin i / sin r',
      'δ = (n-1)A (thin prism)',
      'Path diff = d sinθ',
      'β = λD/d (fringe width)',
      'I = I0 cos²θ (Malus law)'
    ],
    pyqData: {
      total: 48,
      postCovid: 20,
      preCovid: 20,
      legacy: 8,
      trendingConcepts: ['YDSE variations', 'Lens combinations', 'TIR applications']
    },
    examTips: [
      'Sign convention is crucial',
      'For thin lens: power = 1/f (in meters)',
      'YDSE: central fringe always bright'
    ]
  },
  {
    id: 'phy-12',
    name: 'Modern Physics',
    subject: 'physics',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Photoelectric Effect',
      'Bohr Model',
      'X-rays',
      'Nuclear Physics',
      'Radioactivity',
      'Semiconductors'
    ],
    keyFormulas: [
      'E = hν = hc/λ',
      'KEmax = hν - φ',
      'En = -13.6/n² eV (H-atom)',
      'λ = h/mv (de Broglie)',
      'N = N0 e^(-λt)',
      't½ = 0.693/λ'
    ],
    pyqData: {
      total: 52,
      postCovid: 22,
      preCovid: 22,
      legacy: 8,
      trendingConcepts: ['Photoelectric graphs', 'H-atom transitions', 'Radioactive decay chains']
    },
    examTips: [
      'Photoelectric: frequency matters, not intensity (for emission)',
      'Ground state n=1, first excited n=2',
      'Half-life problems: use N = N0/2^n'
    ]
  }
];

// ==================== CHEMISTRY ====================
export const chemistryChapters: Chapter[] = [
  // PHYSICAL CHEMISTRY
  {
    id: 'chem-1',
    name: 'Mole Concept & Stoichiometry',
    subject: 'chemistry',
    chemistryType: 'Physical',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Mole Concept',
      'Atomic & Molecular Mass',
      'Percentage Composition',
      'Empirical & Molecular Formula',
      'Limiting Reagent',
      'Reactions in Solutions'
    ],
    keyFormulas: [
      'n = mass/M = N/NA',
      'NA = 6.022 × 10²³',
      'M = molarity × volume(L)',
      'Molality = moles/kg solvent',
      '% yield = (actual/theoretical) × 100'
    ],
    pyqData: {
      total: 45,
      postCovid: 19,
      preCovid: 19,
      legacy: 7,
      trendingConcepts: ['Limiting reagent', 'Solution stoichiometry', 'Equivalent concept']
    },
    examTips: [
      'Always balance equation first',
      'Identify limiting reagent for yield problems',
      'Molarity changes with temperature, molality does not'
    ]
  },
  {
    id: 'chem-2',
    name: 'Atomic Structure',
    subject: 'chemistry',
    chemistryType: 'Physical',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Bohr Model',
      'Quantum Numbers',
      'Electronic Configuration',
      'Photoelectric Effect',
      'de Broglie Wavelength',
      'Heisenberg Uncertainty'
    ],
    keyFormulas: [
      'E = -13.6Z²/n² eV',
      'r = 0.529n²/Z Å',
      'λ = h/mv',
      'Δx·Δp ≥ h/4π',
      'n + l rule for filling'
    ],
    pyqData: {
      total: 42,
      postCovid: 18,
      preCovid: 17,
      legacy: 7,
      trendingConcepts: ['Quantum number sets', 'Electronic configuration exceptions', 'Orbital shapes']
    },
    examTips: [
      'Maximum electrons in shell = 2n²',
      'Half-filled and fully-filled are extra stable',
      'Aufbau exceptions: Cr, Cu configurations'
    ]
  },
  {
    id: 'chem-3',
    name: 'Chemical Bonding',
    subject: 'chemistry',
    chemistryType: 'Physical',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['chem-2'],
    topics: [
      'Lewis Structures',
      'VSEPR Theory',
      'Hybridization',
      'Molecular Orbital Theory',
      'Hydrogen Bonding',
      'Dipole Moment'
    ],
    keyFormulas: [
      'Bond Order = (Nb - Na)/2',
      'Hybridization = ½(V + M - C + A)',
      'μ = q × d (dipole moment)'
    ],
    pyqData: {
      total: 55,
      postCovid: 24,
      preCovid: 23,
      legacy: 8,
      trendingConcepts: ['MOT of O2, N2', 'Geometry prediction', 'Bond angle comparison']
    },
    examTips: [
      'Lone pairs reduce bond angle',
      'MOT: paramagnetic if unpaired electrons',
      'Back bonding shortens bond length'
    ]
  },
  {
    id: 'chem-4',
    name: 'Thermodynamics & Thermochemistry',
    subject: 'chemistry',
    chemistryType: 'Physical',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['chem-1'],
    topics: [
      'First Law',
      'Enthalpy',
      "Hess's Law",
      'Bond Enthalpy',
      'Entropy',
      'Gibbs Free Energy'
    ],
    keyFormulas: [
      'ΔU = q + w',
      'ΔH = ΔU + ΔngRT',
      'ΔG = ΔH - TΔS',
      'ΔG° = -RT ln K',
      'Cp - Cv = R'
    ],
    pyqData: {
      total: 45,
      postCovid: 19,
      preCovid: 19,
      legacy: 7,
      trendingConcepts: ["Hess's law applications", 'Spontaneity criteria', 'Entropy changes']
    },
    examTips: [
      'ΔG < 0 for spontaneous',
      'At equilibrium: ΔG = 0',
      'Standard state: 1 bar, 298 K'
    ]
  },
  {
    id: 'chem-5',
    name: 'Chemical Equilibrium',
    subject: 'chemistry',
    chemistryType: 'Physical',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['chem-4'],
    topics: [
      'Law of Mass Action',
      'Equilibrium Constant',
      "Le Chatelier's Principle",
      'Ionic Equilibrium',
      'Buffer Solutions',
      'Solubility Product'
    ],
    keyFormulas: [
      'Kp = Kc(RT)^Δn',
      'Ka × Kb = Kw = 10^-14',
      'pH = -log[H+]',
      'Henderson: pH = pKa + log([A-]/[HA])',
      'Ksp = [ions]^n'
    ],
    pyqData: {
      total: 52,
      postCovid: 22,
      preCovid: 22,
      legacy: 8,
      trendingConcepts: ['Buffer pH calculations', 'Common ion effect', 'Degree of dissociation']
    },
    examTips: [
      'Q < K: forward reaction',
      'Buffer capacity highest when [acid] = [salt]',
      'Precipitation if Q > Ksp'
    ]
  },
  {
    id: 'chem-6',
    name: 'Electrochemistry',
    subject: 'chemistry',
    chemistryType: 'Physical',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['chem-5'],
    topics: [
      'Conductance',
      'Galvanic Cells',
      'Nernst Equation',
      'Electrolysis',
      "Faraday's Laws",
      'Batteries & Corrosion'
    ],
    keyFormulas: [
      'E = E° - (RT/nF)ln Q',
      'ΔG° = -nFE°',
      'm = ZIt = (M × I × t)/(n × F)',
      'Λm = κ/c',
      'Λm° = λ°+ + λ°-'
    ],
    pyqData: {
      total: 48,
      postCovid: 20,
      preCovid: 20,
      legacy: 8,
      trendingConcepts: ['Nernst equation applications', 'Electrolysis calculations', 'Cell representation']
    },
    examTips: [
      'Anode: oxidation (electrons leave)',
      'At standard conditions, E = E°',
      'Kohlrausch law for weak electrolytes'
    ]
  },
  {
    id: 'chem-7',
    name: 'Chemical Kinetics',
    subject: 'chemistry',
    chemistryType: 'Physical',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Rate of Reaction',
      'Order & Molecularity',
      'Integrated Rate Laws',
      'Half-Life',
      'Arrhenius Equation',
      'Mechanism & RDS'
    ],
    keyFormulas: [
      'Rate = k[A]^n[B]^m',
      'k = Ae^(-Ea/RT)',
      't½ = 0.693/k (first order)',
      't½ = 1/(k[A]0) (second order)',
      'ln(k2/k1) = (Ea/R)(1/T1 - 1/T2)'
    ],
    pyqData: {
      total: 45,
      postCovid: 19,
      preCovid: 19,
      legacy: 7,
      trendingConcepts: ['Order determination', 'Arrhenius graph', 'Parallel reactions']
    },
    examTips: [
      'Order from experimental data, not equation',
      'RDS determines overall rate',
      'Catalyst lowers Ea, not ΔH'
    ]
  },
  // ORGANIC CHEMISTRY
  {
    id: 'chem-8',
    name: 'GOC & Isomerism',
    subject: 'chemistry',
    chemistryType: 'Organic',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['chem-3'],
    topics: [
      'Inductive Effect',
      'Resonance',
      'Hyperconjugation',
      'Carbocation/Carbanion Stability',
      'Structural Isomerism',
      'Stereoisomerism (E/Z, R/S)'
    ],
    keyFormulas: [
      'Stability: 3° > 2° > 1° (carbocation)',
      '+I groups: alkyl',
      '-I groups: halogens, -NO2, -CN'
    ],
    pyqData: {
      total: 55,
      postCovid: 24,
      preCovid: 23,
      legacy: 8,
      trendingConcepts: ['Stability order', 'Optical isomerism', 'Resonance structures']
    },
    examTips: [
      'More resonance = more stable',
      'Chiral center = 4 different groups',
      '+M groups donate electrons to ring'
    ]
  },
  {
    id: 'chem-9',
    name: 'Hydrocarbons',
    subject: 'chemistry',
    chemistryType: 'Organic',
    weightage: 'Medium',
    difficulty: 'Medium',
    prerequisites: ['chem-8'],
    topics: [
      'Alkanes',
      'Alkenes',
      'Alkynes',
      'Aromatic Compounds',
      'Reactions & Mechanisms'
    ],
    keyFormulas: [
      'Alkane: CnH2n+2',
      'Alkene: CnH2n',
      'Alkyne: CnH2n-2',
      'Benzene: C6H6'
    ],
    pyqData: {
      total: 38,
      postCovid: 16,
      preCovid: 16,
      legacy: 6,
      trendingConcepts: ['Electrophilic addition', 'Markovnikov rule', 'Aromatic substitution']
    },
    examTips: [
      'Markovnikov: H to C with more H',
      'Anti-Markovnikov with peroxide (alkenes)',
      'Benzene prefers substitution over addition'
    ]
  },
  {
    id: 'chem-10',
    name: 'Organic Reactions & Named Reactions',
    subject: 'chemistry',
    chemistryType: 'Organic',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['chem-8', 'chem-9'],
    topics: [
      'Substitution (SN1, SN2)',
      'Elimination (E1, E2)',
      'Addition Reactions',
      'Named Reactions',
      'Oxidation & Reduction',
      'Rearrangements'
    ],
    keyFormulas: [
      'SN2: rate = k[substrate][nucleophile]',
      'SN1: rate = k[substrate]',
      'E2: anti-periplanar required'
    ],
    pyqData: {
      total: 58,
      postCovid: 25,
      preCovid: 25,
      legacy: 8,
      trendingConcepts: ['SN1 vs SN2', 'Named reaction products', 'Mechanism writing']
    },
    examTips: [
      'Strong nucleophile + 1° substrate = SN2',
      'Weak nucleophile + 3° substrate = SN1',
      'Heat favors elimination'
    ]
  },
  // INORGANIC CHEMISTRY
  {
    id: 'chem-11',
    name: 'Periodic Table & Trends',
    subject: 'chemistry',
    chemistryType: 'Inorganic',
    weightage: 'High',
    difficulty: 'Easy',
    prerequisites: ['chem-2'],
    topics: [
      'Periodic Classification',
      'Atomic & Ionic Radii',
      'Ionization Energy',
      'Electron Affinity',
      'Electronegativity',
      'Oxidation States'
    ],
    keyFormulas: [
      'IE: increases across period, decreases down group',
      'Radius: decreases across, increases down',
      'EN (Pauling scale): F = 4.0 highest'
    ],
    pyqData: {
      total: 42,
      postCovid: 18,
      preCovid: 17,
      legacy: 7,
      trendingConcepts: ['Anomalous trends', 'Diagonal relationship', 'Lanthanoid contraction']
    },
    examTips: [
      'IE2 > IE1 always',
      'Exceptions: N > O in IE, S > Cl in EA',
      'd-block shows variable oxidation states'
    ]
  },
  {
    id: 'chem-12',
    name: 'Coordination Chemistry',
    subject: 'chemistry',
    chemistryType: 'Inorganic',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['chem-3', 'chem-11'],
    topics: [
      'Werner Theory',
      'IUPAC Nomenclature',
      'Isomerism',
      'Crystal Field Theory',
      'Color & Magnetism',
      'Stability of Complexes'
    ],
    keyFormulas: [
      'CFSE = -0.4Δo × t2g + 0.6Δo × eg',
      'μ = √(n(n+2)) BM',
      'Spectrochemical series: I- < Br- < Cl- < F- < OH- < H2O < NH3 < en < NO2- < CN- < CO'
    ],
    pyqData: {
      total: 52,
      postCovid: 22,
      preCovid: 22,
      legacy: 8,
      trendingConcepts: ['CFT splitting', 'Isomer counting', 'Nomenclature']
    },
    examTips: [
      'Strong field ligand = low spin',
      'Tetrahedral: always high spin',
      'd4-d7: check spin state carefully'
    ]
  }
];

// ==================== MATHEMATICS ====================
export const mathsChapters: Chapter[] = [
  {
    id: 'math-1',
    name: 'Quadratic Equations & Expressions',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Roots & Nature of Roots',
      'Relation between Roots & Coefficients',
      'Quadratic Expression',
      'Common Roots',
      'Graph of Quadratic',
      'Maximum & Minimum'
    ],
    keyFormulas: [
      'x = (-b ± √D) / 2a',
      'D = b² - 4ac',
      'Sum = -b/a, Product = c/a',
      'Vertex: (-b/2a, -D/4a)'
    ],
    pyqData: {
      total: 48,
      postCovid: 20,
      preCovid: 20,
      legacy: 8,
      trendingConcepts: ['Location of roots', 'Condition for common roots', 'Range of quadratic']
    },
    examTips: [
      'D > 0: real & distinct roots',
      'D = 0: real & equal roots',
      'For roots in interval, check f(a) × f(b) < 0'
    ]
  },
  {
    id: 'math-2',
    name: 'Complex Numbers',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['math-1'],
    topics: [
      'Algebra of Complex Numbers',
      'Modulus & Argument',
      'Argand Plane',
      "De Moivre's Theorem",
      'Roots of Unity',
      'Rotation'
    ],
    keyFormulas: [
      'i² = -1',
      '|z| = √(x² + y²)',
      'z = r(cosθ + isinθ) = re^(iθ)',
      '(cosθ + isinθ)^n = cos(nθ) + isin(nθ)',
      'Rotation: z\' = ze^(iα)'
    ],
    pyqData: {
      total: 45,
      postCovid: 19,
      preCovid: 19,
      legacy: 7,
      trendingConcepts: ['Geometry in complex plane', 'nth roots', 'Locus problems']
    },
    examTips: [
      'Cube roots of unity: 1 + ω + ω² = 0',
      'For locus, put z = x + iy',
      '|z1 + z2| ≤ |z1| + |z2|'
    ]
  },
  {
    id: 'math-3',
    name: 'Matrices & Determinants',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Matrix Operations',
      'Transpose & Types',
      'Determinants',
      'Properties of Determinants',
      'Inverse of Matrix',
      "Cramer's Rule"
    ],
    keyFormulas: [
      '(AB)^(-1) = B^(-1)A^(-1)',
      '|AB| = |A||B|',
      '|A^(-1)| = 1/|A|',
      '|adj A| = |A|^(n-1)',
      'A^(-1) = adj(A)/|A|'
    ],
    pyqData: {
      total: 52,
      postCovid: 22,
      preCovid: 22,
      legacy: 8,
      trendingConcepts: ['Properties of determinants', 'System of equations', 'Adjoint properties']
    },
    examTips: [
      'If |A| = 0, A is singular (no inverse)',
      'Row/column operations: R1 ↔ R2 changes sign',
      'For 3×3: use cofactor expansion'
    ]
  },
  {
    id: 'math-4',
    name: 'Permutations & Combinations',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: [],
    topics: [
      'Fundamental Principle',
      'Permutations',
      'Combinations',
      'Circular Arrangements',
      'Distribution',
      'Derangements'
    ],
    keyFormulas: [
      'nPr = n!/(n-r)!',
      'nCr = n!/[r!(n-r)!]',
      'Circular: (n-1)!',
      'With repetition: n^r (permutation), (n+r-1)Cr (combination)',
      'Derangement: D_n = n![1 - 1/1! + 1/2! - ...]'
    ],
    pyqData: {
      total: 48,
      postCovid: 20,
      preCovid: 20,
      legacy: 8,
      trendingConcepts: ['Distribution problems', 'Identical objects', 'Circular arrangements']
    },
    examTips: [
      'Arrangement = order matters = permutation',
      'Selection = order doesn\'t matter = combination',
      'nCr = nC(n-r)'
    ]
  },
  {
    id: 'math-5',
    name: 'Probability',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['math-4'],
    topics: [
      'Basic Probability',
      'Conditional Probability',
      "Bayes' Theorem",
      'Random Variables',
      'Binomial Distribution',
      'Mean & Variance'
    ],
    keyFormulas: [
      'P(A) = n(A)/n(S)',
      'P(A|B) = P(A∩B)/P(B)',
      "P(A|B) = P(B|A)P(A)/P(B) (Bayes')",
      'P(X=r) = nCr p^r q^(n-r) (Binomial)',
      'E(X) = np, Var(X) = npq'
    ],
    pyqData: {
      total: 55,
      postCovid: 23,
      preCovid: 24,
      legacy: 8,
      trendingConcepts: ['Conditional probability', "Bayes' theorem", 'Binomial distribution']
    },
    examTips: [
      'P(A∪B) = P(A) + P(B) - P(A∩B)',
      'Independent: P(A∩B) = P(A)P(B)',
      'Total probability before Bayes'
    ]
  },
  {
    id: 'math-6',
    name: 'Limits, Continuity & Differentiability',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Limits (Standard Forms)',
      "L'Hôpital's Rule",
      'Continuity',
      'Types of Discontinuity',
      'Differentiability'
    ],
    keyFormulas: [
      'lim(x→0) sinx/x = 1',
      'lim(x→0) (1+x)^(1/x) = e',
      'lim(x→0) (e^x-1)/x = 1',
      'lim(x→0) (a^x-1)/x = lna',
      "L'Hôpital: lim f/g = lim f'/g'"
    ],
    pyqData: {
      total: 52,
      postCovid: 22,
      preCovid: 22,
      legacy: 8,
      trendingConcepts: ['0/0 and ∞/∞ forms', 'Continuity at a point', 'Differentiability check']
    },
    examTips: [
      'Differentiable ⇒ Continuous (not converse)',
      'LHD ≠ RHD means not differentiable',
      'Check limit exists for continuity'
    ]
  },
  {
    id: 'math-7',
    name: 'Differentiation',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: ['math-6'],
    topics: [
      'First Principles',
      'Standard Derivatives',
      'Chain Rule',
      'Implicit Differentiation',
      'Parametric Differentiation',
      'Higher Order Derivatives'
    ],
    keyFormulas: [
      'd/dx(x^n) = nx^(n-1)',
      'd/dx(sinx) = cosx',
      'd/dx(e^x) = e^x',
      'd/dx(lnx) = 1/x',
      'Chain: dy/dx = (dy/du)(du/dx)'
    ],
    pyqData: {
      total: 48,
      postCovid: 20,
      preCovid: 20,
      legacy: 8,
      trendingConcepts: ['Implicit differentiation', 'Parametric derivatives', 'Higher order']
    },
    examTips: [
      'For parametric: dy/dx = (dy/dt)/(dx/dt)',
      'Product rule: (uv)\' = u\'v + uv\'',
      'Quotient rule: (u/v)\' = (u\'v - uv\')/v²'
    ]
  },
  {
    id: 'math-8',
    name: 'Application of Derivatives',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['math-7'],
    topics: [
      'Tangent & Normal',
      'Rate of Change',
      'Maxima & Minima',
      'Increasing/Decreasing',
      'Curve Sketching',
      "Rolle's & LMVT"
    ],
    keyFormulas: [
      'Slope of tangent = dy/dx at point',
      'Slope of normal = -1/(dy/dx)',
      'f\'(x) > 0: increasing',
      'f\'(c) = 0, f\'\'(c) > 0: local minima',
      'LMVT: f\'(c) = (f(b)-f(a))/(b-a)'
    ],
    pyqData: {
      total: 55,
      postCovid: 23,
      preCovid: 24,
      legacy: 8,
      trendingConcepts: ['Maxima-minima problems', 'Tangent/normal equations', 'Monotonicity']
    },
    examTips: [
      'Critical points: f\'(x) = 0 or undefined',
      'Second derivative test for max/min',
      'Global extrema: check critical + boundary'
    ]
  },
  {
    id: 'math-9',
    name: 'Integration',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['math-7'],
    topics: [
      'Indefinite Integrals',
      'Integration Techniques',
      'Definite Integrals',
      'Properties of Definite Integrals',
      'Area Under Curves',
      'Differential Equations'
    ],
    keyFormulas: [
      '∫x^n dx = x^(n+1)/(n+1) + C',
      '∫e^x dx = e^x + C',
      '∫dx/x = ln|x| + C',
      'By parts: ∫uv dx = u∫v - ∫(u\'∫v)dx',
      '∫[a,b] f(x)dx = F(b) - F(a)'
    ],
    pyqData: {
      total: 62,
      postCovid: 26,
      preCovid: 26,
      legacy: 10,
      trendingConcepts: ['Integration by parts', 'Partial fractions', 'Definite integral properties']
    },
    examTips: [
      'ILATE for by parts: Inverse, Log, Algebraic, Trig, Exponential',
      'Even function: ∫[-a,a] f = 2∫[0,a] f',
      'Odd function: ∫[-a,a] f = 0'
    ]
  },
  {
    id: 'math-10',
    name: 'Coordinate Geometry',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Straight Lines',
      'Circles',
      'Parabola',
      'Ellipse',
      'Hyperbola'
    ],
    keyFormulas: [
      'Line: y - y1 = m(x - x1)',
      'Circle: (x-h)² + (y-k)² = r²',
      'Parabola: y² = 4ax',
      'Ellipse: x²/a² + y²/b² = 1',
      'Hyperbola: x²/a² - y²/b² = 1'
    ],
    pyqData: {
      total: 65,
      postCovid: 27,
      preCovid: 28,
      legacy: 10,
      trendingConcepts: ['Tangent/normal to conics', 'Chord of contact', 'Parametric forms']
    },
    examTips: [
      'Distance from (x1,y1) to ax+by+c=0: |ax1+by1+c|/√(a²+b²)',
      'For ellipse: c² = a² - b² (a > b)',
      'For hyperbola: c² = a² + b²'
    ]
  },
  {
    id: 'math-11',
    name: 'Vectors & 3D Geometry',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Hard',
    prerequisites: ['math-10'],
    topics: [
      'Vector Algebra',
      'Scalar & Vector Product',
      'Triple Products',
      'Lines in 3D',
      'Planes',
      'Sphere'
    ],
    keyFormulas: [
      'a·b = |a||b|cosθ',
      '|a×b| = |a||b|sinθ',
      '[a b c] = a·(b×c) (scalar triple)',
      'Line: (r - a) = λb',
      'Plane: r·n = d'
    ],
    pyqData: {
      total: 58,
      postCovid: 24,
      preCovid: 25,
      legacy: 9,
      trendingConcepts: ['Distance between lines', 'Angle between planes', 'Image of point in plane']
    },
    examTips: [
      'Parallel lines: direction ratios proportional',
      'Perpendicular planes: n1·n2 = 0',
      'Shortest distance formula for skew lines'
    ]
  },
  {
    id: 'math-12',
    name: 'Trigonometry',
    subject: 'maths',
    weightage: 'High',
    difficulty: 'Medium',
    prerequisites: [],
    topics: [
      'Trigonometric Identities',
      'Trigonometric Equations',
      'Inverse Trigonometry',
      'Properties of Triangles',
      'Heights & Distances'
    ],
    keyFormulas: [
      'sin²x + cos²x = 1',
      'sin(A±B) = sinAcosB ± cosAsinB',
      'sin⁻¹x + cos⁻¹x = π/2',
      'tan⁻¹x + tan⁻¹y = tan⁻¹[(x+y)/(1-xy)]',
      'a/sinA = b/sinB = c/sinC (sine rule)'
    ],
    pyqData: {
      total: 50,
      postCovid: 21,
      preCovid: 21,
      legacy: 8,
      trendingConcepts: ['Inverse trig simplification', 'General solutions', 'Properties of triangles']
    },
    examTips: [
      'General solution of sinx = 0: x = nπ',
      'General solution of cosx = 0: x = (2n+1)π/2',
      'Always check domain for inverse trig'
    ]
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

export const getChaptersByChemistryType = (type: ChemistryType): Chapter[] => {
  return chemistryChapters.filter(ch => ch.chemistryType === type);
};

export const getHighWeightageChapters = (): Chapter[] => {
  return allChapters.filter(ch => ch.weightage === 'High');
};

export const getHighPYQChapters = (minPostCovid: number = 20): Chapter[] => {
  return allChapters.filter(ch => ch.pyqData.postCovid >= minPostCovid);
};
