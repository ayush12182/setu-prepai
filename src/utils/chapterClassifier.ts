/**
 * Centralized Chapter Classifier for JEE PrepEntrance
 * Validates, filters, and classifies physics/chemistry/math questions based on key concepts, keywords, and equations.
 */

export interface ClassificationResult {
  detectedChapterId: string;
  confidence: number; // 0.0 to 1.0
  reason: string;
}

// Map of keywords per chapter
const PHYSICS_RULES: Record<string, { name: string; keywords: string[]; exclusions?: string[] }> = {
  'phy-0': {
    name: 'Units, Dimensions & Errors',
    keywords: [
      'dimensional formula', 'dimension of', 'dimensions of', 'si unit', 'si units',
      'significant figure', 'significant digit', 'least count', 'screw gauge',
      'vernier caliper', 'vernier calliper', 'percentage error', 'propagation of error',
      'dimensional analysis', 'measurement of', 'standard error', 'significant digits',
      'vernier constant', 'dimensions are'
    ]
  },
  'phy-1': {
    name: 'Kinematics',
    keywords: [
      'speed', 'velocity', 'acceleration', 'displacement', 'projectile', 'trajectory',
      'velocity-time', 'displacement-time', 'v-t graph', 'x-t graph', 'a-t graph',
      'relative velocity', 'average velocity', 'uniform acceleration', 'motion in a straight line',
      'motion in 1d', 'motion in 2d', 'horizontal range', 'time of flight', 'maximum height',
      'river-boat', 'swimmer', 'rain-man', 'kinematics', 'uniformly accelerated', 'distance covered',
      'distance travelled', 'equation of motion', 'particle moves'
    ]
  },
  'phy-2': {
    name: 'Laws of Motion',
    keywords: [
      'friction', 'pulley', 'tension', 'normal force', "newton's law", "newton's second law",
      'free body diagram', 'fbd', 'pseudo force', 'constraint relation', 'block on incline',
      'atwood machine', 'static friction', 'kinetic friction', 'inertial frame', 'limiting friction',
      'angle of friction', 'banking of road', 'centripetal force'
    ]
  },
  'phy-3': {
    name: 'Work, Energy & Power',
    keywords: [
      'work done', 'work-energy theorem', 'potential energy', 'kinetic energy', 'conservative force',
      'non-conservative force', 'elastic collision', 'inelastic collision', 'coefficient of restitution',
      'spring-block work', 'power', 'work done by', 'mechanical energy'
    ]
  },
  'phy-4': {
    name: 'Center of Mass & Collisions',
    keywords: [
      'center of mass', 'centre of mass', 'impulse', 'momentum conservation', 'conservation of momentum',
      'com', 'collision', 'perfectly inelastic', 'explosion of a shell'
    ]
  },
  'phy-5': {
    name: 'Rotational Motion',
    keywords: [
      'moment of inertia', 'torque', 'angular acceleration', 'rolling without slipping', 'pure rolling',
      'angular momentum', 'angular velocity', 'toppling', 'rotational kinetic energy', 'radius of gyration',
      'angular speed', 'rotational inertia'
    ]
  },
  'phy-6': {
    name: 'Gravitation',
    keywords: [
      'gravitational field', 'escape velocity', 'orbital velocity', 'kepler', 'geostationary',
      'satellite', 'gravitational force', 'gravitational potential', 'universal law of gravitation',
      'gravitation'
    ]
  },
  'phy-7': {
    name: 'Solids',
    keywords: [
      'stress', 'strain', 'young\'s modulus', 'bulk modulus', 'hooke\'s law', 'shear modulus',
      'elasticity', 'modulus of rigidity', 'longitudinal stress'
    ]
  },
  'phy-8': {
    name: 'Fluids',
    keywords: [
      'gauge pressure', 'buoyant force', 'terminal velocity', 'viscosity', 'viscous', 'bernoulli',
      'capillary', 'surface tension', 'excess pressure', 'equation of continuity', 'archimedes',
      'stokes\' law', 'streamline flow'
    ]
  },
  'phy-9': {
    name: 'SHM & Waves',
    keywords: [
      'simple harmonic', 'shm', 'pendulum', 'spring-mass', 'transverse wave', 'longitudinal wave',
      'doppler effect', 'beats', 'standing wave', 'organ pipe', 'wave velocity', 'tuning fork',
      'resonance', 'oscillation'
    ]
  },
  'phy-10': {
    name: 'Thermodynamics & KTG',
    keywords: [
      'entropy', 'reversible engine', 'isothermal', 'adiabatic', 'heat engine', 'carnot',
      'internal energy', 'first law of thermodynamics', 'pv diagram', 'kinetic theory of gases',
      'vrms', 'degrees of freedom', 'mean free path', 'boyle\'s law', 'charles\'s law'
    ]
  },
  'phy-11': {
    name: 'Electrostatics & Capacitors',
    keywords: [
      'electric field', 'electric flux', 'electric potential', 'coulomb\'s law', 'capacitance',
      'capacitor', 'gaussian', 'dielectric', 'gauss\'s law', 'electric dipole', 'equipotential'
    ]
  },
  'phy-12': {
    name: 'Current Electricity',
    keywords: [
      'resistor', 'resistance', 'kirchhoff', 'drift velocity', 'resistivity', 'meter bridge',
      'potentiometer', 'wheatstone', 'rc circuit', 'ohm\'s law', 'emf', 'internal resistance',
      'equivalent resistance'
    ]
  },
  'phy-13': {
    name: 'Magnetism & EMI',
    keywords: [
      'solenoid', 'magnetic field', 'magnetic force', 'galvanometer', 'ammeter', 'voltmeter',
      'faraday', 'lenz', 'motional emf', 'inductance', 'ac', 'lcr', 'resonant frequency',
      'alternating current', 'transformer', 'biot-savart', 'ampere\'s law'
    ]
  },
  'phy-14': {
    name: 'Optics',
    keywords: [
      'lens', 'refractive index', 'prism', 'slit', 'polarizer', 'mirror', 'snell',
      'fringe width', 'ydse', 'diffraction', 'interference', 'polarization', 'optics',
      'focal length', 'magnification'
    ]
  },
  'phy-15': {
    name: 'Modern Physics & Semiconductors',
    keywords: [
      'bohr', 'de broglie', 'wavelength', 'x-ray', 'radioactive', 'half-life', 'semiconductor',
      'intrinsic', 'diode', 'transistor', 'photoelectric', 'nuclear fission', 'nuclear fusion',
      'mass defect', 'logic gate', 'work function'
    ]
  }
};

/**
 * Classifies a Physics question based on text matching.
 */
export function classifyQuestion(
  subject: string,
  questionText: string,
  options: string[] = [],
  explanation: string = ''
): ClassificationResult {
  const normSubject = subject ? subject.toLowerCase() : '';
  const fullText = [
    questionText,
    ...options,
    explanation
  ].join(' ').toLowerCase();

  // If not Physics, return general/no-op classification for now
  if (!normSubject.includes('phys')) {
    return {
      detectedChapterId: 'unknown',
      confidence: 1.0,
      reason: 'Non-physics question bypassed keyword classification'
    };
  }

  // 1. SPECIAL EXCEPTION RULE FOR UNITS & DIMENSIONS (phy-0)
  // Even if a question contains kinematics, force, or gravity terms, if it asks for
  // units, dimensions, significant figures, screw gauge, or errors, it MUST classify as phy-0.
  const phy0Rules = PHYSICS_RULES['phy-0'];
  const hasPhy0Keyword = phy0Rules.keywords.some(kw => fullText.includes(kw));
  if (hasPhy0Keyword) {
    return {
      detectedChapterId: 'phy-0',
      confidence: 0.98,
      reason: `Matches Units/Dimensions/Errors keyword`
    };
  }

  // 2. Count keyword hits for each Physics chapter
  const hits: Record<string, number> = {};
  Object.keys(PHYSICS_RULES).forEach(chId => {
    if (chId === 'phy-0') return; // Handled as priority exception above
    let count = 0;
    PHYSICS_RULES[chId].keywords.forEach(kw => {
      // Use boundary-matching regex or simple index checking
      let idx = fullText.indexOf(kw);
      while (idx !== -1) {
        count++;
        idx = fullText.indexOf(kw, idx + 1);
      }
    });
    hits[chId] = count;
  });

  // Find chapter with maximum hits
  let bestChId = 'phy-1'; // Default fallback
  let maxHits = 0;
  Object.keys(hits).forEach(chId => {
    if (hits[chId] > maxHits) {
      maxHits = hits[chId];
      bestChId = chId;
    }
  });

  // Calculate confidence based on keyword margins
  const totalHits = Object.values(hits).reduce((a, b) => a + b, 0);
  const confidence = totalHits > 0 ? maxHits / totalHits : 0.5;

  return {
    detectedChapterId: bestChId,
    confidence: Math.min(confidence + 0.1, 1.0),
    reason: `Keyword classification hit count: ${maxHits} in ${PHYSICS_RULES[bestChId]?.name || bestChId}`
  };
}

/**
 * Maps frontend mock chapter IDs to database-compliant chapter IDs.
 */
export function mapMockChapterIdToReal(id: string): string {
  const mapping: Record<string, string> = {
    // Physics
    'ph-units': 'phy-0',
    'ph-kin1d': 'phy-1',
    'ph-proj': 'phy-1',
    'ph-nlm': 'phy-2',
    'ph-wep': 'phy-3',
    'ph-com': 'phy-4',
    'ph-rot': 'phy-5',
    'ph-grav': 'phy-6',
    'ph-solids': 'phy-7',
    'ph-fluids': 'phy-8',
    'ph-shm': 'phy-9',
    'ph-waves': 'phy-9',
    'ph-thermo': 'phy-10',
    'ph-estatic': 'phy-11',
    'ph-cap': 'phy-11',
    'ph-cur': 'phy-12',
    'ph-mag': 'phy-13',
    'ph-emi': 'phy-13',
    'ph-optics': 'phy-14',
    'ph-modern': 'phy-15',
    'ph-semi': 'phy-15',

    // Chemistry
    'ch-mole': 'chem-1',
    'ch-atom': 'chem-2',
    'ch-bond': 'chem-3',
    'ch-thermo': 'chem-4',
    'ch-equil': 'chem-5',
    'ch-electro': 'chem-6',
    'ch-kinetic': 'chem-7',
    'ch-goc': 'chem-8',
    'ch-carbo': 'chem-10',
    'ch-biomol': 'chem-10',
    'ch-periodic': 'chem-11',
    'ch-pblock': 'chem-12',

    // Mathematics
    'ma-sets': 'math-1',
    'ma-trig': 'math-12',
    'ma-cplx': 'math-2',
    'ma-quad': 'math-1',
    'ma-seq': 'math-4',
    'ma-perm': 'math-4',
    'ma-binom': 'math-3',
    'ma-mat': 'math-3',
    'ma-coor': 'math-10',
    'ma-calc': 'math-6',
    'ma-integ': 'math-9',
    'ma-prob': 'math-5',
  };

  return mapping[id] || id;
}

