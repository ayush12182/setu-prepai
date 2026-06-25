/**
 * STRUCTURAL FINGERPRINT ENGINE
 *
 * Generates a fingerprint for each question based on what a student must
 * ACTUALLY THINK to solve it — not based on wording, numbers, or IDs.
 *
 * fingerprint = { concept, scenario, formula_chain[], reasoning_mode, difficulty_band }
 * fingerprintHash = SHA-like stable string key for grouping structurally identical questions.
 *
 * Classification is based on:
 *   - Physical system (what objects, forces, fields are involved)
 *   - Object interactions (what is acting on what)
 *   - Constraints (inextensible string, frictionless, isolated system)
 *   - Boundary conditions (top of loop, limiting case, equilibrium)
 *   - Problem environment (incline, elevator, river, capacitor network)
 *   - Solving sequence (what formula chain the student must traverse)
 */

export interface StructuralFingerprint {
  concept: string;               // The core physics/math approach
  scenario: string;              // Physical system + environment class
  formula_chain: string[];       // Ordered list of formulas/relations needed
  reasoning_mode: string;        // How the student reasons (graphical, algebraic, etc.)
  difficulty_band: string;       // easy | medium | hard
  fingerprintHash: string;       // Canonical key for deduplication
}

export interface FingerprintResult {
  fingerprint: StructuralFingerprint;
  isRewording: boolean;          // True if same fingerprint but only numbers/wording differ
  confidence: number;            // 0–1 how confident the classifier is
  warnings: string[];            // Any anomalies found
}

// ─── Physical System Taxonomy ─────────────────────────────────────────────────
// Scenarios are modeled as physical system classes, NOT keyword lists.
// Each class represents a student-recognisable problem type.

interface PhysicalSystemClass {
  id: string;
  label: string;
  topics: string[];              // Which topics this appears in
  systemIndicators: string[];    // Text patterns that identify the physical system
  objectIndicators: string[];    // Objects present in the system
  constraintIndicators: string[];// Physical constraints
  environmentIndicators: string[];// Problem environment
}

const PHYSICAL_SYSTEM_CLASSES: PhysicalSystemClass[] = [
  // ── Electrostatics ──────────────────────────────────────────────────────────
  {
    id: 'PS_TWO_POINT_CHARGES',
    label: 'Two-Point-Charge System',
    topics: ["Coulomb's Law"],
    systemIndicators: ['two charge', 'two point charge', 'pair of charge', 'two particle', 'q1 and q2', 'q₁ and q₂'],
    objectIndicators: ['point charge', 'particle', 'sphere'],
    constraintIndicators: ['fixed', 'held', 'placed'],
    environmentIndicators: ['vacuum', 'air', 'free space'],
  },
  {
    id: 'PS_THREE_CHARGE_SYSTEM',
    label: 'Three-or-More-Charge System',
    topics: ["Coulomb's Law", 'Electric Field'],
    systemIndicators: ['three charge', 'three point', 'at vertices', 'at corners', 'charges at', 'n charges'],
    objectIndicators: ['triangle', 'square', 'polygon', 'vertices', 'corners'],
    constraintIndicators: [],
    environmentIndicators: [],
  },
  {
    id: 'PS_CHARGE_EQUILIBRIUM',
    label: 'Charge Equilibrium',
    topics: ["Coulomb's Law"],
    systemIndicators: ['equilibrium', 'null force', 'zero net force', 'balanced', 'net force is zero', 'net force zero', 'third charge', 'charge placed between'],
    objectIndicators: ['charge between', 'placed between', 'midpoint'],
    constraintIndicators: ['net force = 0', 'equilibrium'],
    environmentIndicators: [],
  },
  {
    id: 'PS_SUSPENDED_CHARGE',
    label: 'Suspended / Hanging Charge',
    topics: ["Coulomb's Law"],
    systemIndicators: ['suspended', 'hanging', 'pendulum', 'string', 'thread', 'angle with vertical', 'angle made'],
    objectIndicators: ['ball', 'bob', 'sphere', 'particle hanging'],
    constraintIndicators: ['inextensible string', 'light string', 'massless string'],
    environmentIndicators: ['vertical', 'angle'],
  },
  {
    id: 'PS_DIPOLE_SYSTEM',
    label: 'Electric Dipole System',
    topics: ['Electric Field', 'Electric Potential'],
    systemIndicators: ['dipole', 'dipole moment', 'axial', 'equatorial', '+q and -q', 'electric dipole'],
    objectIndicators: ['dipole', 'dipole moment p'],
    constraintIndicators: [],
    environmentIndicators: ['axial line', 'equatorial line'],
  },
  {
    id: 'PS_CONTINUOUS_CHARGE_DISTRIBUTION',
    label: 'Continuous Charge Distribution',
    topics: ['Electric Field', 'Electric Potential', "Gauss's Law"],
    systemIndicators: ['ring', 'disk', 'rod', 'infinite line', 'wire', 'uniformly charged', 'surface charge', 'volume charge', 'shell', 'sphere with charge density'],
    objectIndicators: ['ring', 'disk', 'rod', 'wire', 'sphere', 'shell', 'cylinder'],
    constraintIndicators: ['uniform charge', 'surface charge density σ', 'volume charge density ρ', 'linear charge density λ'],
    environmentIndicators: ['axis', 'center', 'outside', 'inside'],
  },
  {
    id: 'PS_GAUSSIAN_SURFACE',
    label: 'Gauss\'s Law Surface Problem',
    topics: ["Gauss's Law"],
    systemIndicators: ['gaussian surface', 'flux through', 'electric flux', 'enclosed charge', 'gauss', 'symmetry', 'spherical symmetry', 'cylindrical symmetry', 'planar symmetry'],
    objectIndicators: ['closed surface', 'sphere', 'cylinder', 'plane'],
    constraintIndicators: ['symmetric', 'enclosed'],
    environmentIndicators: ['inside', 'outside', 'surface'],
  },
  {
    id: 'PS_CAPACITOR_SIMPLE',
    label: 'Single Capacitor',
    topics: ['Capacitors', 'Dielectrics'],
    systemIndicators: ['parallel plate capacitor', 'single capacitor', 'capacitance of', 'a capacitor of', 'charged capacitor'],
    objectIndicators: ['parallel plates', 'capacitor'],
    constraintIndicators: ['isolated', 'connected to battery', 'disconnected'],
    environmentIndicators: [],
  },
  {
    id: 'PS_CAPACITOR_NETWORK',
    label: 'Capacitor Network (Series/Parallel)',
    topics: ['Capacitors'],
    systemIndicators: ['series', 'parallel', 'combination', 'network', 'two capacitor', 'three capacitor', 'equivalent capacitance'],
    objectIndicators: ['capacitor network', 'combination'],
    constraintIndicators: ['series connection', 'parallel connection'],
    environmentIndicators: [],
  },
  {
    id: 'PS_DIELECTRIC_INSERTION',
    label: 'Dielectric Insertion Problem',
    topics: ['Dielectrics', 'Capacitors'],
    systemIndicators: ['dielectric', 'dielectric constant', 'dielectric slab', 'inserted', 'filled with', 'dielectric medium', 'polarisation', 'bound charge'],
    objectIndicators: ['dielectric', 'slab', 'medium'],
    constraintIndicators: ['partially filled', 'fully filled', 'inserted'],
    environmentIndicators: ['between plates', 'inside capacitor'],
  },

  // ── Kinematics ───────────────────────────────────────────────────────────────
  {
    id: 'PS_UNIFORM_MOTION_1D',
    label: 'Uniform / Constant-Acceleration 1D Motion',
    topics: ['Motion in 1D'],
    systemIndicators: ['uniform velocity', 'constant acceleration', 'moves with', 'travels at', 'a car', 'a train', 'a body', 'a particle', 'a bus', 'a truck'],
    objectIndicators: ['car', 'train', 'bus', 'body', 'particle', 'ball'],
    constraintIndicators: ['straight line', '1D', 'along a road', 'on a track'],
    environmentIndicators: ['horizontal', 'level road'],
  },
  {
    id: 'PS_FREE_FALL',
    label: 'Free-Fall / Vertical Throw',
    topics: ['Motion in 1D'],
    systemIndicators: ['free fall', 'dropped', 'falls from rest', 'thrown vertically', 'vertically upward', 'vertically downward', 'from a height', 'from a tower', 'from a cliff'],
    objectIndicators: ['stone', 'ball', 'object', 'body'],
    constraintIndicators: ['no air resistance', 'gravity only', 'under gravity'],
    environmentIndicators: ['height', 'tower', 'cliff', 'building'],
  },
  {
    id: 'PS_PROJECTILE',
    label: 'Projectile Motion',
    topics: ['Projectile Motion', 'Motion in 2D'],
    systemIndicators: ['projectile', 'thrown at angle', 'launched at angle', 'oblique projection', 'thrown horizontally', 'horizontal projection', 'range of projectile', 'time of flight', 'maximum height'],
    objectIndicators: ['projectile', 'ball', 'stone', 'bullet', 'shell'],
    constraintIndicators: ['no air resistance', 'uniform gravity'],
    environmentIndicators: ['ground level', 'cliff', 'incline', 'tower'],
  },
  {
    id: 'PS_RIVER_BOAT',
    label: 'River / Boat Crossing Problem',
    topics: ['Relative Motion', 'Motion in 2D'],
    systemIndicators: ['river', 'stream', 'current', 'boat', 'crosses', 'width of river', 'flowing river', 'swimmer'],
    objectIndicators: ['boat', 'swimmer', 'river'],
    constraintIndicators: ['river width', 'current speed'],
    environmentIndicators: ['river bank', 'perpendicular', 'shortest path'],
  },
  {
    id: 'PS_RAIN_MAN',
    label: 'Rain / Wind Drift Problem',
    topics: ['Relative Motion', 'Motion in 2D'],
    systemIndicators: ['rain', 'wind', 'umbrella', 'appears to fall', 'man walking in rain', 'rain appears'],
    objectIndicators: ['man', 'person', 'rain', 'umbrella'],
    constraintIndicators: [],
    environmentIndicators: [],
  },
  {
    id: 'PS_RELATIVE_VELOCITY_VEHICLES',
    label: 'Relative Velocity of Vehicles',
    topics: ['Relative Motion'],
    systemIndicators: ['overtake', 'meet', 'moving in same direction', 'opposite direction', 'train passes', 'car overtakes', 'two trains', 'two cars'],
    objectIndicators: ['car', 'train', 'bus', 'vehicle'],
    constraintIndicators: [],
    environmentIndicators: ['road', 'track'],
  },
  {
    id: 'PS_MOTION_GRAPH',
    label: 'Motion Graph Problem',
    topics: ['Graphs of Motion'],
    systemIndicators: ['graph', 'slope of', 'area under', 's-t graph', 'v-t graph', 'a-t graph', 'displacement-time', 'velocity-time', 'acceleration-time', 'from the graph'],
    objectIndicators: ['graph', 'curve'],
    constraintIndicators: [],
    environmentIndicators: [],
  },

  // ── Mechanics ────────────────────────────────────────────────────────────────
  {
    id: 'PS_SINGLE_BLOCK_SURFACE',
    label: 'Single Block on Surface',
    topics: ["Newton's Laws", 'Friction (Static & Kinetic)'],
    systemIndicators: ['block on', 'object on', 'box on', 'placed on', 'resting on', 'horizontal surface', 'friction between block'],
    objectIndicators: ['block', 'box', 'object', 'slab'],
    constraintIndicators: ['horizontal surface', 'rough surface', 'smooth surface'],
    environmentIndicators: [],
  },
  {
    id: 'PS_INCLINED_PLANE',
    label: 'Inclined Plane Problem',
    topics: ["Newton's Laws", 'Friction (Static & Kinetic)'],
    systemIndicators: ['incline', 'inclined plane', 'slope', 'ramp', 'angle of inclination', 'on an inclined', 'slides down'],
    objectIndicators: ['block', 'object', 'body'],
    constraintIndicators: ['smooth incline', 'rough incline', 'angle θ'],
    environmentIndicators: ['incline', 'slope'],
  },
  {
    id: 'PS_ATWOOD_MACHINE',
    label: 'Atwood Machine / Connected Masses',
    topics: ["Newton's Laws"],
    systemIndicators: ['atwood', 'connected by string', 'over a pulley', 'two masses connected', 'mass hanging', 'pulley system with two'],
    objectIndicators: ['mass m1', 'mass m2', 'pulley', 'string'],
    constraintIndicators: ['inextensible string', 'massless pulley', 'frictionless pulley'],
    environmentIndicators: [],
  },
  {
    id: 'PS_ELEVATOR',
    label: 'Elevator / Lift Problem',
    topics: ["Newton's Laws", 'Pseudo Forces'],
    systemIndicators: ['elevator', 'lift', 'accelerating upward', 'accelerating downward', 'apparent weight', 'weighs in lift'],
    objectIndicators: ['elevator', 'lift', 'person', 'mass', 'scale'],
    constraintIndicators: ['accelerating frame'],
    environmentIndicators: ['elevator', 'lift'],
  },
  {
    id: 'PS_STACKED_BLOCKS',
    label: 'Stacked Blocks System',
    topics: ['Friction (Static & Kinetic)', "Newton's Laws"],
    systemIndicators: ['stacked', 'one block on another', 'block placed on block', 'upper block', 'lower block'],
    objectIndicators: ['two blocks', 'upper block', 'lower block'],
    constraintIndicators: ['friction between blocks'],
    environmentIndicators: [],
  },
  {
    id: 'PS_CONVEYOR_BELT',
    label: 'Conveyor Belt Problem',
    topics: ['Friction (Static & Kinetic)'],
    systemIndicators: ['conveyor', 'belt', 'moving belt', 'placed on a moving surface'],
    objectIndicators: ['conveyor', 'belt'],
    constraintIndicators: ['relative sliding'],
    environmentIndicators: [],
  },
  {
    id: 'PS_VERTICAL_CIRCLE',
    label: 'Vertical Circular Motion',
    topics: ['Circular Motion Dynamics'],
    systemIndicators: ['vertical circle', 'loop', 'top of circle', 'bottom of circle', 'minimum speed', 'tension at top', 'tension at bottom', 'circular loop'],
    objectIndicators: ['ball', 'bead', 'object'],
    constraintIndicators: ['string', 'rod', 'track'],
    environmentIndicators: ['loop', 'vertical plane'],
  },
  {
    id: 'PS_HORIZONTAL_CIRCLE',
    label: 'Horizontal Circular Motion',
    topics: ['Circular Motion Dynamics'],
    systemIndicators: ['horizontal circle', 'conical pendulum', 'banked road', 'banking', 'circular track on horizontal', 'level curve', 'over bridge', 'dip'],
    objectIndicators: ['car', 'mass', 'object', 'particle'],
    constraintIndicators: ['centripetal force', 'banking angle'],
    environmentIndicators: ['horizontal plane', 'banked road', 'bridge'],
  },
  {
    id: 'PS_NON_INERTIAL_FRAME',
    label: 'Non-Inertial / Accelerating Frame',
    topics: ['Pseudo Forces'],
    systemIndicators: ['pseudo force', 'non-inertial', 'accelerating frame', 'inside a car', 'inside a bus', 'pendulum in accelerating', 'spring in elevator', 'apparent'],
    objectIndicators: ['pendulum', 'block', 'spring'],
    constraintIndicators: ['accelerating reference frame'],
    environmentIndicators: ['accelerating vehicle', 'elevator'],
  },
  {
    id: 'PS_PULLEY_CONSTRAINT',
    label: 'Pulley / String Constraint System',
    topics: ['Constraint Relations'],
    systemIndicators: ['pulley', 'string constraint', 'movable pulley', 'fixed pulley', 'multiple pulley', 'inextensible string', 'velocity constraint', 'acceleration constraint'],
    objectIndicators: ['pulley', 'string', 'block', 'mass'],
    constraintIndicators: ['string length constant', 'inextensible'],
    environmentIndicators: [],
  },
  {
    id: 'PS_WEDGE_BLOCK',
    label: 'Wedge-Block Constraint',
    topics: ['Constraint Relations', "Newton's Laws"],
    systemIndicators: ['wedge', 'block on wedge', 'wedge constraint', 'incline moves', 'wedge acceleration'],
    objectIndicators: ['wedge', 'block', 'inclined surface'],
    constraintIndicators: ['frictionless surface', 'contact constraint'],
    environmentIndicators: [],
  },

  // ── Mathematics ──────────────────────────────────────────────────────────────
  {
    id: 'PS_MATRIX_OPS',
    label: 'Matrix Operation',
    topics: ['Matrices'],
    systemIndicators: ['matrix', 'matrices', 'matrix multiplication', 'matrix addition', 'transpose', 'symmetric matrix', 'skew-symmetric', 'matrix equation'],
    objectIndicators: ['matrix A', 'matrix B', 'matrix'],
    constraintIndicators: ['order m×n', 'square matrix'],
    environmentIndicators: [],
  },
  {
    id: 'PS_DETERMINANT_EVAL',
    label: 'Determinant Evaluation',
    topics: ['Determinants'],
    systemIndicators: ['determinant', '|A|', 'det(', 'value of the determinant', 'expand along', 'cofactor', 'minor'],
    objectIndicators: ['determinant', 'matrix'],
    constraintIndicators: ['order', 'square matrix'],
    environmentIndicators: [],
  },
  {
    id: 'PS_DETERMINANT_PROPERTY',
    label: 'Determinant Property Application',
    topics: ['Determinants'],
    systemIndicators: ['property of determinant', 'row operation', 'column operation', 'singular', 'det(AB)', 'det(A^T)', 'area of triangle'],
    objectIndicators: [],
    constraintIndicators: [],
    environmentIndicators: [],
  },
  {
    id: 'PS_LINEAR_SYSTEM',
    label: 'System of Linear Equations',
    topics: ['System of Linear Equations'],
    systemIndicators: ['system of equation', 'simultaneous equation', 'linear equation', 'solution of the system', 'consistent', 'inconsistent', 'infinite solution', 'no solution', "cramer"],
    objectIndicators: [],
    constraintIndicators: [],
    environmentIndicators: [],
  },
  {
    id: 'PS_MATRIX_INVERSE',
    label: 'Matrix Inverse / Adjoint',
    topics: ['Adjoints and Inverses'],
    systemIndicators: ['adjoint', 'inverse', 'adj(A)', 'A^{-1}', 'a inverse', 'inverse of the matrix', 'find the inverse'],
    objectIndicators: ['adjoint', 'inverse'],
    constraintIndicators: [],
    environmentIndicators: [],
  },
  {
    id: 'PS_GENERIC',
    label: 'Generic / Unclassified',
    topics: [],
    systemIndicators: [],
    objectIndicators: [],
    constraintIndicators: [],
    environmentIndicators: [],
  },
];

// ─── Formula Chain Catalog ────────────────────────────────────────────────────
// Each formula chain is an ordered solving sequence — the path a student
// follows from problem setup to final answer.

export interface FormulaChainDef {
  id: string;
  label: string;
  steps: string[];              // Ordered formula steps
  topics: string[];
  triggers: string[];           // Text patterns that suggest this chain
}

export const FORMULA_CHAINS: FormulaChainDef[] = [
  // Coulomb's Law
  { id: 'FC_DIRECT_COULOMB', label: 'Direct Coulomb Force', steps: ['F = kq₁q₂/r²'], topics: ["Coulomb's Law"], triggers: ['force between', 'electrostatic force', 'force on charge'] },
  { id: 'FC_SUPERPOSITION_FORCE', label: 'Superposition of Forces', steps: ['F₁ = kq₁q₂/r₁²', 'F₂ = kq₁q₂/r₂²', 'F_net = F₁ + F₂ (vector)'], topics: ["Coulomb's Law", 'Electric Field'], triggers: ['net force', 'resultant force', 'superposition'] },
  { id: 'FC_EQUILIBRIUM_CHARGE', label: 'Charge Equilibrium', steps: ['F₁ = kq₁q₃/r₁²', 'F₂ = kq₂q₃/r₂²', 'F₁ = F₂ → solve r'], topics: ["Coulomb's Law"], triggers: ['equilibrium', 'null force', 'balance'] },
  { id: 'FC_DIELECTRIC_FORCE', label: 'Force in Medium', steps: ['F = kq₁q₂/(εᵣr²)', 'εᵣ = ε/ε₀'], topics: ["Coulomb's Law", 'Dielectrics'], triggers: ['medium', 'dielectric', 'relative permittivity', 'kerosene'] },

  // Electric Field
  { id: 'FC_POINT_FIELD', label: 'Field Due to Point Charge', steps: ['E = kq/r²'], topics: ['Electric Field'], triggers: ['electric field due to point', 'field at distance'] },
  { id: 'FC_SUPERPOSITION_FIELD', label: 'Field Superposition', steps: ['E₁ = kq₁/r₁²', 'E₂ = kq₂/r₂²', 'E_net = E₁ + E₂ (vector)'], topics: ['Electric Field'], triggers: ['net field', 'resultant field', 'field due to system'] },
  { id: 'FC_RING_FIELD', label: 'Field on Axis of Ring', steps: ['E = kqx/(x²+R²)^(3/2)', 'dE/dx = 0 → x = R/√2 (max)'], topics: ['Electric Field'], triggers: ['ring', 'axis of ring', 'on the axis'] },
  { id: 'FC_DIPOLE_AXIS_FIELD', label: 'Dipole Axial Field', steps: ['E_axial = 2kp/r³', 'p = qd'], topics: ['Electric Field'], triggers: ['axial', 'along the axis', 'dipole field axial'] },
  { id: 'FC_DIPOLE_EQUATORIAL_FIELD', label: 'Dipole Equatorial Field', steps: ['E_eq = kp/r³'], topics: ['Electric Field'], triggers: ['equatorial', 'perpendicular bisector', 'broadside'] },
  { id: 'FC_GAUSS_SPHERICAL', label: 'Gauss Law – Spherical', steps: ['∮E·dA = q_enc/ε₀', 'E·4πr² = q_enc/ε₀', 'E = kq/r²'], topics: ["Gauss's Law"], triggers: ['spherical', 'sphere', 'concentric'] },
  { id: 'FC_GAUSS_CYLINDRICAL', label: 'Gauss Law – Cylindrical', steps: ['∮E·dA = q_enc/ε₀', 'E·2πrL = λL/ε₀', 'E = λ/(2πε₀r)'], topics: ["Gauss's Law"], triggers: ['cylinder', 'line charge', 'wire', 'cylindrical'] },
  { id: 'FC_GAUSS_PLANAR', label: 'Gauss Law – Planar', steps: ['∮E·dA = q_enc/ε₀', 'E·2A = σA/ε₀', 'E = σ/(2ε₀)'], topics: ["Gauss's Law"], triggers: ['infinite plane', 'sheet', 'planar', 'uniform sheet'] },

  // Electric Potential
  { id: 'FC_POINT_POTENTIAL', label: 'Potential Due to Point Charge', steps: ['V = kq/r'], topics: ['Electric Potential'], triggers: ['potential due to', 'electric potential at'] },
  { id: 'FC_POTENTIAL_SUPERPOSITION', label: 'Potential Superposition', steps: ['V_net = Σkqᵢ/rᵢ'], topics: ['Electric Potential'], triggers: ['potential due to system', 'net potential', 'potential at centre'] },
  { id: 'FC_WORK_POTENTIAL', label: 'Work Done in Electric Field', steps: ['W = q(V₁ - V₂)', 'V = kq/r'], topics: ['Electric Potential'], triggers: ['work done', 'potential difference', 'from A to B'] },
  { id: 'FC_E_FROM_V', label: 'E-V Relation', steps: ['E = -dV/dr', 'E = -∇V'], topics: ['Electric Potential', 'Electric Field'], triggers: ['e = -dv/dr', 'gradient of potential', 'relation between e and v'] },

  // Capacitors
  { id: 'FC_BASIC_CAPACITANCE', label: 'Basic Capacitance', steps: ['C = Q/V', 'C = ε₀A/d'], topics: ['Capacitors'], triggers: ['capacitance of', 'c = q/v', 'parallel plate'] },
  { id: 'FC_SERIES_CAPACITORS', label: 'Series Capacitor Combination', steps: ['1/C_eq = 1/C₁ + 1/C₂ + ...', 'Q = C_eq · V'], topics: ['Capacitors'], triggers: ['series', 'in series'] },
  { id: 'FC_PARALLEL_CAPACITORS', label: 'Parallel Capacitor Combination', steps: ['C_eq = C₁ + C₂ + ...', 'V same across each'], topics: ['Capacitors'], triggers: ['parallel', 'in parallel'] },
  { id: 'FC_CAPACITOR_ENERGY', label: 'Energy Stored in Capacitor', steps: ['U = ½CV²', 'U = Q²/(2C)', 'U = ½QV'], topics: ['Capacitors'], triggers: ['energy stored', 'energy in capacitor', 'electrostatic energy'] },
  { id: 'FC_DIELECTRIC_CAP', label: 'Capacitor with Dielectric', steps: ['C = Kε₀A/d', 'K = C/C₀'], topics: ['Capacitors', 'Dielectrics'], triggers: ['dielectric', 'dielectric constant', 'k =', 'inserted between plates'] },

  // Kinematics
  { id: 'FC_SUVAT', label: 'SUVAT Equations', steps: ['v = u + at', 's = ut + ½at²', 'v² = u² + 2as'], topics: ['Motion in 1D'], triggers: ['constant acceleration', 'uniform acceleration', 'find velocity', 'find displacement'] },
  { id: 'FC_FREE_FALL', label: 'Free Fall', steps: ['v = gt', 'h = ½gt²', 'v² = 2gh'], topics: ['Motion in 1D'], triggers: ['free fall', 'dropped', 'falls from rest', 'under gravity'] },
  { id: 'FC_VERTICAL_THROW', label: 'Vertical Throw', steps: ['v = u - gt', 'h = ut - ½gt²', 'max height: v = 0 → H = u²/2g'], topics: ['Motion in 1D'], triggers: ['thrown upward', 'thrown vertically', 'maximum height reached', 'time to reach top'] },
  { id: 'FC_PROJECTILE_RANGE', label: 'Projectile Range Analysis', steps: ['T = 2u sinθ/g', 'R = u²sin2θ/g', 'H = u²sin²θ/2g'], topics: ['Projectile Motion', 'Motion in 2D'], triggers: ['range', 'time of flight', 'maximum height', 'angle of projection'] },
  { id: 'FC_PROJECTILE_AT_POINT', label: 'Projectile Velocity at Point', steps: ['vₓ = u cosθ', 'vy = u sinθ - gt', 'v = √(vₓ² + vy²)'], topics: ['Projectile Motion', 'Motion in 2D'], triggers: ['velocity at', 'speed at point', 'direction of velocity at'] },
  { id: 'FC_RELATIVE_VELOCITY', label: 'Relative Velocity', steps: ['v_rel = v_A - v_B', 's_rel = v_rel · t'], topics: ['Relative Motion'], triggers: ['relative velocity', 'velocity relative to', 'relative speed'] },
  { id: 'FC_RIVER_BOAT', label: 'River Boat Crossing', steps: ['resultant v = √(v_boat² + v_river²)', 'drift = (v_river / v_boat) · d', 'min time: cross directly'], topics: ['Relative Motion', 'Motion in 2D'], triggers: ['river', 'boat', 'stream', 'current', 'cross'] },
  { id: 'FC_GRAPH_SLOPE', label: 'Graph Slope Reading', steps: ['slope of s-t = velocity', 'slope of v-t = acceleration'], topics: ['Graphs of Motion'], triggers: ['slope', 'gradient', 'from the graph', 's-t graph', 'v-t graph'] },
  { id: 'FC_GRAPH_AREA', label: 'Graph Area Calculation', steps: ['area under v-t = displacement', 'area under a-t = velocity change'], topics: ['Graphs of Motion'], triggers: ['area under', 'enclosed area', 'area between'] },

  // Newton's Laws / Mechanics
  { id: 'FC_NEWTON_DIRECT', label: "Direct Newton's 2nd Law", steps: ['ΣF = ma', 'F_net = ma → a = F_net/m'], topics: ["Newton's Laws"], triggers: ["newton's law", 'f = ma', 'net force', 'find acceleration'] },
  { id: 'FC_ATWOOD', label: 'Atwood Machine Formula', steps: ['a = (m₁ - m₂)g/(m₁ + m₂)', 'T = 2m₁m₂g/(m₁ + m₂)'], topics: ["Newton's Laws"], triggers: ['atwood', 'two masses over pulley', 'connected masses pulley'] },
  { id: 'FC_INCLINE_NEWTON', label: 'Incline with Newton', steps: ['Component along incline: mg sinθ', 'Normal: N = mg cosθ', 'Net: F - mg sinθ - f = ma'], topics: ["Newton's Laws", 'Friction (Static & Kinetic)'], triggers: ['incline', 'slope', 'ramp', 'inclined surface'] },
  { id: 'FC_STATIC_FRICTION', label: 'Static Friction Limit', steps: ['f_s ≤ μₛN', 'f_s_max = μₛN', 'Check: applied F vs. f_s_max'], topics: ['Friction (Static & Kinetic)'], triggers: ['static friction', 'just about to slip', 'limiting friction', 'maximum static', 'coefficient of static'] },
  { id: 'FC_KINETIC_FRICTION', label: 'Kinetic Friction', steps: ['f_k = μₖN', 'a = (F - f_k)/m'], topics: ['Friction (Static & Kinetic)'], triggers: ['kinetic friction', 'sliding friction', 'coefficient of kinetic', 'sliding on surface'] },
  { id: 'FC_CIRCULAR_CENTRIPETAL', label: 'Centripetal Force Balance', steps: ['F_c = mv²/r = mω²r', 'Identify centripetal force source (T, N, friction)'], topics: ['Circular Motion Dynamics'], triggers: ['centripetal', 'circular motion', 'circular path', 'radius of circle'] },
  { id: 'FC_VERTICAL_CIRCLE', label: 'Vertical Circle Energy + Newton', steps: ['At top: mg + N = mv²/r', 'At bottom: N - mg = mv²/r', 'Energy: ½mv_top² + mg(2r) = ½mv_bottom²', 'Min speed at top: v = √(gr)'], topics: ['Circular Motion Dynamics'], triggers: ['top of loop', 'bottom of loop', 'vertical circle', 'minimum speed at top'] },
  { id: 'FC_PSEUDO_FORCE', label: 'Pseudo Force in Accelerating Frame', steps: ['F_pseudo = -ma_frame', 'Equilibrium in frame: ΣF + F_pseudo = 0'], topics: ['Pseudo Forces'], triggers: ['pseudo force', 'non-inertial', 'accelerating frame'] },
  { id: 'FC_CONSTRAINT_PULLEY', label: 'Pulley Constraint Equation', steps: ['Length of string constant: dl/dt = 0', 'Σ(velocities × direction) = 0', 'Differentiate for acceleration constraint'], topics: ['Constraint Relations'], triggers: ['pulley constraint', 'string constraint', 'length of string', 'constraint equation'] },

  // Mathematics
  { id: 'FC_MATRIX_MULTIPLY', label: 'Matrix Multiplication', steps: ['(AB)_ij = Σ A_ik × B_kj', 'Verify order: (m×n)(n×p) = (m×p)'], topics: ['Matrices'], triggers: ['matrix multiplication', 'product of matrices', 'ab ='] },
  { id: 'FC_MATRIX_TRANSPOSE', label: 'Transpose / Symmetry', steps: ['Aᵀ: swap rows and columns', 'Symmetric: A = Aᵀ', 'Skew: A = -Aᵀ'], topics: ['Matrices'], triggers: ['transpose', 'symmetric', 'skew-symmetric'] },
  { id: 'FC_DET_2X2', label: '2×2 Determinant', steps: ['|A| = ad - bc'], topics: ['Determinants'], triggers: ['2×2', '2x2', 'second order determinant'] },
  { id: 'FC_DET_3X3_COFACTOR', label: '3×3 Determinant via Cofactors', steps: ['Expand along row/column', '|A| = Σ aᵢⱼ × Cᵢⱼ'], topics: ['Determinants'], triggers: ['3×3', '3x3', 'expand along', 'cofactor expansion'] },
  { id: 'FC_DET_PROPERTIES', label: 'Determinant Properties', steps: ['Row/column operations', 'det(AB) = det(A)·det(B)', 'Singular: det = 0'], topics: ['Determinants'], triggers: ['property', 'row operation', 'det(ab)', 'singular'] },
  { id: 'FC_CRAMERS_RULE', label: "Cramer's Rule", steps: ['D = det(A)', 'Dₓ = det(A with b in x-col)', 'x = Dₓ/D'], topics: ['System of Linear Equations'], triggers: ["cramer's rule", 'dx/d', 'determinant method'] },
  { id: 'FC_RANK_CONSISTENCY', label: 'Rank-Based Consistency', steps: ['Find rank(A) and rank(A|b)', 'If rank(A) = rank(A|b) = n: unique', 'If rank(A) = rank(A|b) < n: infinite', 'If rank(A) ≠ rank(A|b): no solution'], topics: ['System of Linear Equations'], triggers: ['rank', 'consistent', 'inconsistent', 'infinite solution', 'no solution', 'augmented matrix'] },
  { id: 'FC_ADJOINT_INVERSE', label: 'Inverse via Adjoint', steps: ['Cofactor matrix C', 'adj(A) = Cᵀ', 'A⁻¹ = adj(A)/det(A)'], topics: ['Adjoints and Inverses'], triggers: ['adjoint', 'adj(a)', 'inverse using adjoint'] },
  { id: 'FC_INVERSE_VERIFY', label: 'Verify Inverse: A·A⁻¹ = I', steps: ['Compute A·A⁻¹', 'Verify result = I'], topics: ['Adjoints and Inverses'], triggers: ['verify inverse', 'a·a^{-1}', 'product = i'] },
  { id: 'FC_GENERIC', label: 'General Calculation', steps: ['Apply relevant formula'], topics: [], triggers: [] },
];

// ─── Reasoning Mode Classifier ────────────────────────────────────────────────

export type ReasoningMode =
  | 'Direct Formula Application'
  | 'Algebraic Manipulation'
  | 'Graphical / Visual Reasoning'
  | 'Dimensional Analysis / Unit Check'
  | 'Conceptual / Qualitative Reasoning'
  | 'Comparative / Ratio Analysis'
  | 'Energy Method'
  | 'Vector Decomposition'
  | 'Step-by-step Derivation'
  | 'Elimination / Substitution'
  | 'Unknown';

function detectReasoningMode(q: {
  question_text: string;
  pyq_pattern?: { reasoning_mode?: string };
  reasoning_mode?: string;
}): ReasoningMode {
  const text = (q.question_text ?? '').toLowerCase();
  const raw = (q.pyq_pattern?.reasoning_mode ?? q.reasoning_mode ?? '').toLowerCase();

  if (raw.includes('graph') || raw.includes('visual') || text.includes('from the graph') || text.includes('slope of') || text.includes('area under')) {
    return 'Graphical / Visual Reasoning';
  }
  if (raw.includes('dimension') || raw.includes('unit check') || text.includes('dimension') || text.includes('unit of')) {
    return 'Dimensional Analysis / Unit Check';
  }
  if (raw.includes('energy') || text.includes('energy method') || text.includes('conservation of energy') || text.includes('work-energy')) {
    return 'Energy Method';
  }
  if (raw.includes('vector') || raw.includes('component') || text.includes('vector component') || text.includes('resolve into')) {
    return 'Vector Decomposition';
  }
  if (raw.includes('ratio') || raw.includes('compare') || raw.includes('proportion') || text.includes('ratio of') || text.includes('compare')) {
    return 'Comparative / Ratio Analysis';
  }
  if (raw.includes('concept') || raw.includes('qualitative') || text.includes('explain') || text.includes('which of the following is correct')) {
    return 'Conceptual / Qualitative Reasoning';
  }
  if (raw.includes('algebraic') || raw.includes('manipul') || text.includes('simplify') || text.includes('expand')) {
    return 'Algebraic Manipulation';
  }
  if (raw.includes('eliminat') || raw.includes('substitut') || text.includes('eliminate') || text.includes('substitute')) {
    return 'Elimination / Substitution';
  }
  if (raw.includes('step') || raw.includes('derivat')) {
    return 'Step-by-step Derivation';
  }
  return 'Direct Formula Application';
}

// ─── Physical System Classifier ───────────────────────────────────────────────

function classifyPhysicalSystem(q: { question_text: string; topic: string; subtopic?: string }): PhysicalSystemClass {
  const text = (q.question_text ?? '').toLowerCase();
  const topic = q.topic;

  // Filter to topic-relevant classes first
  const topicClasses = PHYSICAL_SYSTEM_CLASSES.filter(cls => cls.topics.length === 0 || cls.topics.includes(topic));

  let bestMatch = PHYSICAL_SYSTEM_CLASSES.find(c => c.id === 'PS_GENERIC')!;
  let bestScore = 0;

  for (const cls of topicClasses) {
    if (cls.id === 'PS_GENERIC') continue;
    let score = 0;
    for (const indicator of cls.systemIndicators) {
      if (text.includes(indicator)) score += 3;
    }
    for (const indicator of cls.objectIndicators) {
      if (text.includes(indicator)) score += 2;
    }
    for (const indicator of cls.constraintIndicators) {
      if (text.includes(indicator)) score += 2;
    }
    for (const indicator of cls.environmentIndicators) {
      if (text.includes(indicator)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cls;
    }
  }

  return bestMatch;
}

// ─── Formula Chain Detector ───────────────────────────────────────────────────

function detectFormulaChains(q: { question_text: string; topic: string; solution_steps?: string[]; explanation?: string }): FormulaChainDef[] {
  const text = (q.question_text ?? '').toLowerCase();
  const steps = ((q.solution_steps ?? []).join(' ') + ' ' + (q.explanation ?? '')).toLowerCase();
  const combined = text + ' ' + steps;
  const topic = q.topic;

  // Filter to topic-relevant chains
  const topicChains = FORMULA_CHAINS.filter(fc => fc.topics.length === 0 || fc.topics.includes(topic));

  const matched: Array<{ chain: FormulaChainDef; score: number }> = [];

  for (const chain of topicChains) {
    if (chain.id === 'FC_GENERIC') continue;
    let score = 0;
    for (const trigger of chain.triggers) {
      if (combined.includes(trigger)) score += 1;
    }
    if (score > 0) {
      matched.push({ chain, score });
    }
  }

  if (matched.length === 0) {
    return [FORMULA_CHAINS.find(fc => fc.id === 'FC_GENERIC')!];
  }

  // Return top-scoring chains (could be multi-formula question)
  matched.sort((a, b) => b.score - a.score);
  return matched.slice(0, 3).map(m => m.chain); // Up to 3 formula chains per question
}

// ─── Concept Classifier ───────────────────────────────────────────────────────

function classifyConcept(q: { question_text: string; topic: string; concept?: string; subtopic?: string }): string {
  const text = (q.question_text ?? '').toLowerCase();
  const rawConcept = (q.concept ?? q.subtopic ?? '').replace(/ (Analysis|Electro|Equations|Components|Constraint)$/i, '').trim();

  // Use semantic groupings — map concept names to canonical solving approaches
  const conceptMap: Array<{ canonical: string; topics: string[]; patterns: string[] }> = [
    { canonical: 'Direct Force Calculation', topics: ["Coulomb's Law"], patterns: ['direct force', 'force between', 'electrostatic force', 'force on q', 'point charge interaction'] },
    { canonical: 'Superposition Principle', topics: ["Coulomb's Law", 'Electric Field'], patterns: ['superposition', 'net force', 'resultant force', 'multiple charge', 'net field', 'superposition principle electro'] },
    { canonical: 'Charge Equilibrium', topics: ["Coulomb's Law"], patterns: ['equilibrium', 'balanced', 'zero force', 'null force'] },
    { canonical: 'Force Ratio Analysis', topics: ["Coulomb's Law"], patterns: ['force ratio', 'ratio of force', 'compare force', 'twice the force'] },
    { canonical: 'Dielectric Effect on Force', topics: ["Coulomb's Law", 'Dielectrics'], patterns: ['dielectric', 'medium', 'relative permittivity', 'dielectric effect'] },
    { canonical: 'Single Charge Field', topics: ['Electric Field'], patterns: ['single charge', 'field due to point', 'point charge field', 'field intensity', 'acceleration of charge in field'] },
    { canonical: 'Dipole Field', topics: ['Electric Field'], patterns: ['dipole', 'axial field', 'equatorial field', 'dipole moment'] },
    { canonical: 'Continuous Distribution Field', topics: ['Electric Field'], patterns: ['ring', 'disk', 'rod', 'wire', 'sphere', 'distribution', 'continuous distribution', 'field of ring', 'field of plate'] },
    { canonical: 'Point Charge Potential', topics: ['Electric Potential'], patterns: ['potential due to point', 'point charge potential', 'potential of ring', 'potential of sphere'] },
    { canonical: 'Potential Superposition', topics: ['Electric Potential'], patterns: ['net potential', 'potential due to system', 'superposition potential'] },
    { canonical: 'Work Done in Field', topics: ['Electric Potential'], patterns: ['work done', 'work in electric', 'potential difference', 'electric potential energy systems'] },
    { canonical: 'E-V Relationship', topics: ['Electric Potential', 'Electric Field'], patterns: ['e = -dv/dr', 'gradient of potential', 'relation between e and v', 'e from v'] },
    { canonical: 'Gauss Spherical', topics: ["Gauss's Law"], patterns: ['spherical symmetry', 'spherical gaussian', 'sphere gauss', 'flux through sphere'] },
    { canonical: 'Gauss Cylindrical', topics: ["Gauss's Law"], patterns: ['cylindrical symmetry', 'cylindrical gaussian', 'cylinder gauss'] },
    { canonical: 'Gauss Planar', topics: ["Gauss's Law"], patterns: ['planar symmetry', 'planar gauss', 'plane gauss', 'sheet of charge'] },
    { canonical: 'Flux Calculation', topics: ["Gauss's Law"], patterns: ['flux through', 'electric flux', 'flux through closed', 'flux through closed surface'] },
    { canonical: 'Conductor Shielding', topics: ["Gauss's Law"], patterns: ['conductor shielding', 'field inside conductor', 'conductor gauss'] },
    { canonical: 'Capacitance Calculation', topics: ['Capacitors'], patterns: ['capacitance', 'c = q/v', 'basic capacitance', 'spherical and cylindrical capacitor'] },
    { canonical: 'Series-Parallel Combination', topics: ['Capacitors'], patterns: ['series', 'parallel', 'combination', 'series/parallel'] },
    { canonical: 'Energy in Capacitor', topics: ['Capacitors'], patterns: ['energy stored', 'energy of capacitor', 'capacitor energy storage'] },
    { canonical: 'Dielectric Polarisation', topics: ['Dielectrics'], patterns: ['polarisation', 'polar dielectric', 'dielectric constant', 'induced polarization', 'bound charge', 'boundary conditions electrostatic', 'k = c/c0'] },
    { canonical: 'Uniform Motion Analysis', topics: ['Motion in 1D'], patterns: ['uniform velocity', 'constant velocity', 'uniform motion'] },
    { canonical: 'Constant Acceleration', topics: ['Motion in 1D'], patterns: ['constant acceleration', 'uniform acceleration', 'constant acceleration equations'] },
    { canonical: 'Variable Acceleration', topics: ['Motion in 1D'], patterns: ['variable acceleration', 'a = f(t)', 'non-uniform acceleration'] },
    { canonical: 'Free Fall', topics: ['Motion in 1D'], patterns: ['free fall', 'falls from rest', 'dropped', 'motion under gravity'] },
    { canonical: 'Projectile Range & Height', topics: ['Projectile Motion', 'Motion in 2D'], patterns: ['range', 'maximum height', 'time of flight', 'ground to ground', 'horizontal range and complementary'] },
    { canonical: 'Projectile at a Point', topics: ['Projectile Motion'], patterns: ['velocity at point', 'speed at height', 'direction at point', 'trajectory equation of projectile'] },
    { canonical: 'River Boat Analysis', topics: ['Relative Motion', 'Motion in 2D'], patterns: ['river', 'boat', 'stream', 'current', 'river crossing'] },
    { canonical: 'Relative Velocity Vehicles', topics: ['Relative Motion'], patterns: ['relative velocity', 'overtake', 'same direction', 'opposite direction', 'angular relative velocity'] },
    { canonical: 'Rain / Wind Frame', topics: ['Relative Motion'], patterns: ['rain', 'wind', 'umbrella', 'rain man umbrella', 'aircraft wind drift'] },
    { canonical: 'Graph Reading', topics: ['Graphs of Motion'], patterns: ['slope of', 'from graph', 's-t graph', 'v-t graph', 'slope reading', 'non-linear graph tangent'] },
    { canonical: 'Graph Area Calculation', topics: ['Graphs of Motion'], patterns: ['area under', 'area under v-t', 'area under a-t', 'area under curve'] },
    { canonical: 'Free Body Diagram', topics: ["Newton's Laws"], patterns: ['free body', 'fbd', 'forces acting on'] },
    { canonical: 'Atwood Machine', topics: ["Newton's Laws"], patterns: ['atwood', 'two masses over pulley'] },
    { canonical: 'Inclined Plane', topics: ["Newton's Laws", 'Friction (Static & Kinetic)'], patterns: ['incline', 'slope', 'ramp', 'inclined surface'] },
    { canonical: 'Elevator Dynamics', topics: ["Newton's Laws", 'Pseudo Forces'], patterns: ['elevator', 'lift', 'apparent weight'] },
    { canonical: 'Limiting Static Friction', topics: ['Friction (Static & Kinetic)'], patterns: ['static friction', 'limiting friction', 'just about to slip', 'maximum static'] },
    { canonical: 'Kinetic Friction', topics: ['Friction (Static & Kinetic)'], patterns: ['kinetic friction', 'sliding friction', 'coefficient of kinetic'] },
    { canonical: 'Centripetal Dynamics', topics: ['Circular Motion Dynamics'], patterns: ['centripetal force', 'circular motion', 'circular path', 'horizontal circle'] },
    { canonical: 'Vertical Circle', topics: ['Circular Motion Dynamics'], patterns: ['vertical circle', 'loop', 'top of loop', 'bottom of loop', 'minimum speed at top'] },
    { canonical: 'Non-Inertial Frame', topics: ['Pseudo Forces'], patterns: ['pseudo force', 'non-inertial', 'accelerating frame', 'inside a car'] },
    { canonical: 'Pulley Constraint', topics: ['Constraint Relations'], patterns: ['pulley constraint', 'string constraint', 'movable pulley', 'fixed pulley'] },
    { canonical: 'Wedge Constraint', topics: ['Constraint Relations'], patterns: ['wedge', 'wedge block', 'block on wedge'] },
    { canonical: 'Matrix Operations', topics: ['Matrices'], patterns: ['matrix', 'matrices', 'matrix equation', 'matrix power', 'scalar multiplication'] },
    { canonical: '2×2 Determinant', topics: ['Determinants'], patterns: ['2×2', '2x2', 'second order'] },
    { canonical: '3×3 Determinant', topics: ['Determinants'], patterns: ['3×3', '3x3', 'third order', 'expand along'] },
    { canonical: 'Determinant Properties', topics: ['Determinants'], patterns: ['property of determinant', 'row operation', 'column operation'] },
    { canonical: 'System Solving (Cramer)', topics: ['System of Linear Equations'], patterns: ["cramer", 'determinant method', 'dx/d'] },
    { canonical: 'System Solving (Rank)', topics: ['System of Linear Equations'], patterns: ['rank', 'consistent', 'inconsistent', 'infinite solution', 'no solution', 'homogeneous'] },
    { canonical: 'Adjoint Calculation', topics: ['Adjoints and Inverses'], patterns: ['adjoint', 'adj(a)', 'cofactor matrix', 'adjoint formula'] },
    { canonical: 'Matrix Inverse', topics: ['Adjoints and Inverses'], patterns: ['inverse', 'a^{-1}', 'a inverse', 'inverse of matrix'] },
  ];

  const topic = q.topic;

  // Score each canonical concept
  const scored: Array<{ name: string; score: number }> = [];
  for (const cm of conceptMap) {
    if (!cm.topics.includes(topic)) continue;
    let score = 0;
    for (const p of cm.patterns) {
      if (text.includes(p)) score += 2;
      if (rawConcept.toLowerCase().includes(p)) score += 1;
    }
    if (score > 0) scored.push({ name: cm.canonical, score });
  }

  scored.sort((a, b) => b.score - a.score);
  if (scored.length > 0) return scored[0].name;

  // Fallback to raw concept name
  return rawConcept || 'General';
}

// ─── Difficulty Band Normaliser ───────────────────────────────────────────────

function normaliseDifficulty(raw?: string): string {
  const d = (raw ?? '').toLowerCase();
  if (d === 'easy' || d === 'simple' || d === 'basic') return 'easy';
  if (d === 'hard' || d === 'advanced' || d === 'difficult') return 'hard';
  return 'medium';
}

// ─── Fingerprint Hash Generator ───────────────────────────────────────────────

function buildFingerprintHash(concept: string, scenario: string, formulaIds: string[], reasoningMode: string, difficultyBand: string): string {
  const sortedFormulas = [...formulaIds].sort().join('|');
  return `${concept}:${scenario}:${sortedFormulas}:${reasoningMode}:${difficultyBand}`;
}

// ─── Main Fingerprint Generator ───────────────────────────────────────────────

export function generateFingerprint(q: {
  question_text: string;
  topic: string;
  subtopic?: string;
  concept?: string;
  difficulty?: string;
  pyq_pattern?: { reasoning_mode?: string };
  reasoning_mode?: string;
  solution_steps?: string[];
  explanation?: string;
  options?: Record<string, string>;
}): FingerprintResult {
  const warnings: string[] = [];

  // 1. Detect physical system / scenario
  const physicalSystem = classifyPhysicalSystem(q);
  const scenario = physicalSystem.label;

  // 2. Detect formula chains
  const formulaChains = detectFormulaChains(q);

  // 3. Detect concept
  const concept = classifyConcept(q);

  // 4. Detect reasoning mode
  const reasoningMode = detectReasoningMode(q);

  // 5. Normalise difficulty
  const difficultyBand = normaliseDifficulty(q.difficulty);

  // 6. Build fingerprint hash
  const formulaChainIds = formulaChains.map(fc => fc.id);
  const fingerprintHash = buildFingerprintHash(concept, scenario, formulaChainIds, reasoningMode, difficultyBand);

  // 7. Detect fake/reworded question
  const text = q.question_text ?? '';
  const isGenericTemplate =
    text.includes('y = f(x)') ||
    /^\[Question #\d+\]/.test(text) ||
    (q.options && Object.values(q.options).some((o: string) => o.startsWith('Correct evaluation matching')));
  
  const isRewording = isGenericTemplate; // All generic templates are rewordings of the same base

  if (isGenericTemplate) {
    warnings.push('FAKE_TEMPLATE: Auto-generated placeholder question — no real formula or scenario content');
  }

  // Confidence is low for generic templates, high for real questions
  const confidence = isGenericTemplate ? 0.3 : (physicalSystem.id !== 'PS_GENERIC' ? 0.85 : 0.5);

  return {
    fingerprint: {
      concept,
      scenario,
      formula_chain: formulaChains.map(fc => fc.label),
      reasoning_mode: reasoningMode,
      difficulty_band: difficultyBand,
      fingerprintHash,
    },
    isRewording,
    confidence,
    warnings,
  };
}

export { classifyPhysicalSystem, detectFormulaChains, classifyConcept, detectReasoningMode, normaliseDifficulty };
