/**
 * SOLVING PATH ANALYZER
 *
 * Extracts and normalizes the solving path a student must follow to
 * answer a question. Two questions sharing the same solving path require
 * the same thinking — they are structurally identical regardless of wording.
 *
 * A solving path is defined as an ordered sequence of cognitive operations:
 *   Step 1 → Step 2 → Step 3 → Final Formula
 *
 * Example:
 *   "Three-charge equilibrium" →
 *     [Identify charges & positions] → [Write force on third charge from each]
 *     → [Set net force = 0] → [Solve for position/charge]
 */

import type { FormulaChainDef } from './structuralFingerprint';
import { FORMULA_CHAINS } from './structuralFingerprint';

export interface SolvingStep {
  order: number;
  operation: string;     // What cognitive operation is performed
  formula?: string;      // Formula applied (if any)
  requires?: string[];   // Prerequisites (concepts needed)
}

export interface SolvingPath {
  pathId: string;        // Canonical identifier for this solving sequence
  steps: SolvingStep[];  // Ordered solving steps
  entryPoint: string;    // What the student reads first
  finalTarget: string;   // What they're ultimately finding
  complexity: number;    // Number of non-trivial steps (1 = trivial, 3+ = complex)
}

export interface SolvingPathResult {
  path: SolvingPath;
  pathHash: string;      // Stable key for grouping identical paths
  isVariant: boolean;    // True if same path, only numbers changed
  variantReason?: string;
}

// ─── Canonical Solving Path Templates ────────────────────────────────────────
// Each template defines the cognitive sequence for a class of problems.
// Questions matching the same template require identical thinking.

interface SolvingPathTemplate {
  id: string;
  label: string;
  topics: string[];
  entryTriggers: string[];    // Text clues that identify this path
  steps: Omit<SolvingStep, 'order'>[];
  finalTarget: string;
  complexity: number;
}

const SOLVING_PATH_TEMPLATES: SolvingPathTemplate[] = [
  // ── Coulomb's Law ──────────────────────────────────────────────────────────
  {
    id: 'SP_COULOMB_DIRECT',
    label: 'Direct Coulomb Force',
    topics: ["Coulomb's Law"],
    entryTriggers: ['find the force', 'calculate the force', 'force between', 'electrostatic force'],
    steps: [
      { operation: 'Identify charges q₁, q₂ and separation r', formula: 'Given' },
      { operation: 'Apply Coulomb\'s law', formula: 'F = kq₁q₂/r²' },
      { operation: 'Substitute and compute', requires: ['k = 9×10⁹ Nm²/C²'] },
    ],
    finalTarget: 'Force magnitude',
    complexity: 1,
  },
  {
    id: 'SP_COULOMB_SUPERPOSITION',
    label: 'Superposition of Coulomb Forces',
    topics: ["Coulomb's Law", 'Electric Field'],
    entryTriggers: ['net force', 'resultant force', 'three charges', 'force on charge due to'],
    steps: [
      { operation: 'Find force F₁ from charge 1', formula: 'F₁ = kq₁q₃/r₁²' },
      { operation: 'Find force F₂ from charge 2', formula: 'F₂ = kq₂q₃/r₂²' },
      { operation: 'Vector addition of forces', formula: 'F_net = √(F₁² + F₂² + 2F₁F₂cosθ)' },
    ],
    finalTarget: 'Net force (magnitude and direction)',
    complexity: 3,
  },
  {
    id: 'SP_EQUILIBRIUM_CHARGE',
    label: 'Charge Equilibrium Position',
    topics: ["Coulomb's Law"],
    entryTriggers: ['equilibrium', 'zero net force', 'position where force is zero', 'placed between'],
    steps: [
      { operation: 'Let unknown position be x from one charge', formula: 'Assume position' },
      { operation: 'Write force on third charge from each', formula: 'F₁ = kq₁q₃/x², F₂ = kq₂q₃/(d-x)²' },
      { operation: 'Set F₁ = F₂ and solve for x', formula: 'q₁/x² = q₂/(d-x)²' },
    ],
    finalTarget: 'Equilibrium position',
    complexity: 3,
  },
  {
    id: 'SP_SUSPENDED_CHARGE',
    label: 'Suspended Charge in Electric Field',
    topics: ["Coulomb's Law", 'Electric Field'],
    entryTriggers: ['suspended', 'hanging', 'string makes angle', 'pendulum of charges'],
    steps: [
      { operation: 'Draw FBD: tension T, weight mg, electric force qE', formula: 'FBD' },
      { operation: 'Resolve forces along and perpendicular to string', formula: 'Tcosθ = mg, Tsinθ = qE' },
      { operation: 'Divide to find tanθ = qE/mg', formula: 'tanθ = F_elec/mg' },
    ],
    finalTarget: 'Angle / Tension',
    complexity: 3,
  },
  {
    id: 'SP_FORCE_IN_MEDIUM',
    label: 'Coulomb Force in a Medium',
    topics: ["Coulomb's Law"],
    entryTriggers: ['medium', 'dielectric', 'relative permittivity', 'kerosene', 'water', 'oil'],
    steps: [
      { operation: 'Identify dielectric constant K or εᵣ', formula: 'K = εᵣ' },
      { operation: 'Apply modified Coulomb law', formula: 'F_medium = kq₁q₂/(Kr²)' },
      { operation: 'Compare with force in vacuum', formula: 'F_medium = F_vacuum/K' },
    ],
    finalTarget: 'Force in medium / ratio of forces',
    complexity: 2,
  },

  // ── Electric Field ──────────────────────────────────────────────────────────
  {
    id: 'SP_FIELD_POINT_CHARGE',
    label: 'Electric Field at a Point',
    topics: ['Electric Field'],
    entryTriggers: ['electric field at', 'field intensity', 'find the field', 'field due to'],
    steps: [
      { operation: 'Identify source charge q and distance r', formula: 'Given' },
      { operation: 'Apply E = kq/r²', formula: 'E = kq/r²' },
    ],
    finalTarget: 'Electric field magnitude',
    complexity: 1,
  },
  {
    id: 'SP_FIELD_ON_RING_AXIS',
    label: 'Field on Axis of Ring',
    topics: ['Electric Field'],
    entryTriggers: ['ring', 'axis of ring', 'on the axis', 'ring of charge'],
    steps: [
      { operation: 'Write E component along axis from ring element', formula: 'dE_axial = dE·x/√(x²+R²)' },
      { operation: 'Integrate over ring (symmetric perpendicular components cancel)', formula: 'E = kQx/(x²+R²)^(3/2)' },
      { operation: 'Find maximum if asked: dE/dx = 0 → x = R/√2', formula: 'dE/dx = 0' },
    ],
    finalTarget: 'Field on axis / position of maximum field',
    complexity: 3,
  },
  {
    id: 'SP_DIPOLE_FIELD',
    label: 'Dipole Field Calculation',
    topics: ['Electric Field'],
    entryTriggers: ['dipole', 'axial', 'equatorial', 'dipole moment'],
    steps: [
      { operation: 'Identify axial vs equatorial position', formula: 'Position relative to dipole' },
      { operation: 'Apply axial formula: E = 2kp/r³ OR equatorial: E = kp/r³', formula: 'E_axis = 2kp/r³, E_eq = kp/r³' },
    ],
    finalTarget: 'Field due to dipole',
    complexity: 2,
  },

  // ── Gauss's Law ──────────────────────────────────────────────────────────────
  {
    id: 'SP_GAUSS_FIELD',
    label: "Gauss's Law Field Calculation",
    topics: ["Gauss's Law"],
    entryTriggers: ['gauss', 'gaussian surface', 'flux', 'enclosed charge', 'symmetry'],
    steps: [
      { operation: 'Choose appropriate Gaussian surface by symmetry', formula: 'Spherical / Cylindrical / Planar' },
      { operation: 'Calculate enclosed charge q_enc', formula: 'q_enc = ρ·V or given' },
      { operation: 'Apply Gauss: ΦE = q_enc/ε₀ → E·A = q_enc/ε₀', formula: '∮E·dA = q_enc/ε₀' },
      { operation: 'Solve for E', formula: 'E = q_enc/(ε₀·A)' },
    ],
    finalTarget: 'Electric field / Flux',
    complexity: 3,
  },

  // ── Electric Potential ───────────────────────────────────────────────────────
  {
    id: 'SP_POTENTIAL_POINT',
    label: 'Potential Due to Point Charge',
    topics: ['Electric Potential'],
    entryTriggers: ['potential at', 'electric potential due to', 'find v at'],
    steps: [
      { operation: 'Identify charge q and distance r', formula: 'Given' },
      { operation: 'Apply V = kq/r', formula: 'V = kq/r' },
    ],
    finalTarget: 'Electric potential',
    complexity: 1,
  },
  {
    id: 'SP_WORK_IN_FIELD',
    label: 'Work Done Moving Charge in Field',
    topics: ['Electric Potential'],
    entryTriggers: ['work done', 'potential difference', 'move from a to b', 'brought from', 'work done to move'],
    steps: [
      { operation: 'Find V₁ at initial position', formula: 'V₁ = kq/r₁' },
      { operation: 'Find V₂ at final position', formula: 'V₂ = kq/r₂' },
      { operation: 'Calculate work W = q(V₁ - V₂)', formula: 'W = q(V₁ - V₂)' },
    ],
    finalTarget: 'Work done',
    complexity: 2,
  },

  // ── Capacitors ───────────────────────────────────────────────────────────────
  {
    id: 'SP_CAPACITOR_BASIC',
    label: 'Basic Capacitance Calculation',
    topics: ['Capacitors'],
    entryTriggers: ['capacitance', 'find c', 'capacitor of area', 'parallel plate capacitor'],
    steps: [
      { operation: 'Identify plate area A and separation d', formula: 'Given' },
      { operation: 'Apply C = ε₀A/d (or C = Kε₀A/d with dielectric)', formula: 'C = ε₀A/d' },
    ],
    finalTarget: 'Capacitance',
    complexity: 1,
  },
  {
    id: 'SP_CAPACITOR_NETWORK',
    label: 'Capacitor Network Analysis',
    topics: ['Capacitors'],
    entryTriggers: ['series', 'parallel', 'combination', 'equivalent capacitance'],
    steps: [
      { operation: 'Identify series vs parallel groupings', formula: 'Circuit analysis' },
      { operation: 'Apply: 1/C_s = Σ(1/Cᵢ) for series; C_p = ΣCᵢ for parallel', formula: 'Series/Parallel formula' },
      { operation: 'Reduce network step by step to find C_eq', formula: 'Iterative reduction' },
    ],
    finalTarget: 'Equivalent capacitance',
    complexity: 2,
  },
  {
    id: 'SP_ENERGY_CAPACITOR',
    label: 'Energy Stored in Capacitor',
    topics: ['Capacitors'],
    entryTriggers: ['energy stored', 'energy of capacitor', 'electrostatic energy'],
    steps: [
      { operation: 'Identify C and V (or Q)', formula: 'Given' },
      { operation: 'Apply U = ½CV² = Q²/2C', formula: 'U = ½CV²' },
    ],
    finalTarget: 'Energy stored',
    complexity: 1,
  },

  // ── Kinematics ───────────────────────────────────────────────────────────────
  {
    id: 'SP_SUVAT_FIND_V',
    label: 'Find Final Velocity (SUVAT)',
    topics: ['Motion in 1D'],
    entryTriggers: ['find final velocity', 'what is the velocity', 'speed after', 'velocity after time'],
    steps: [
      { operation: 'Identify u, a, t (or s)', formula: 'Given' },
      { operation: 'Select v = u + at or v² = u² + 2as', formula: 'v = u + at' },
      { operation: 'Substitute and compute', formula: 'Arithmetic' },
    ],
    finalTarget: 'Final velocity',
    complexity: 1,
  },
  {
    id: 'SP_SUVAT_FIND_S',
    label: 'Find Displacement (SUVAT)',
    topics: ['Motion in 1D'],
    entryTriggers: ['find displacement', 'distance traveled', 'how far', 'distance covered in'],
    steps: [
      { operation: 'Identify u, a, t', formula: 'Given' },
      { operation: 'Apply s = ut + ½at²', formula: 's = ut + ½at²' },
    ],
    finalTarget: 'Displacement',
    complexity: 1,
  },
  {
    id: 'SP_FREE_FALL',
    label: 'Free Fall / Vertical Throw',
    topics: ['Motion in 1D'],
    entryTriggers: ['dropped', 'free fall', 'falls from', 'thrown vertically', 'max height', 'time to reach top'],
    steps: [
      { operation: 'Set u = 0 (free fall) or u = initial speed (throw)', formula: 'u given' },
      { operation: 'Apply kinematic equations with a = ±g', formula: 'v = u ± gt, h = ut ± ½gt²' },
      { operation: 'For max height: set v = 0', formula: 'H = u²/2g' },
    ],
    finalTarget: 'Height / Time / Velocity',
    complexity: 2,
  },
  {
    id: 'SP_PROJECTILE_RANGE',
    label: 'Projectile Range & Height',
    topics: ['Projectile Motion', 'Motion in 2D'],
    entryTriggers: ['range', 'maximum height of projectile', 'time of flight', 'horizontal range'],
    steps: [
      { operation: 'Separate horizontal (x) and vertical (y) motion', formula: 'vₓ = ucosθ, vy = usinθ' },
      { operation: 'Apply T = 2usinθ/g (time of flight)', formula: 'T = 2usinθ/g' },
      { operation: 'Apply R = u²sin2θ/g (range) or H = u²sin²θ/2g', formula: 'R = u²sin2θ/g' },
    ],
    finalTarget: 'Range / Height / Time of flight',
    complexity: 2,
  },
  {
    id: 'SP_PROJECTILE_AT_POINT',
    label: 'Velocity at a Point in Projectile',
    topics: ['Projectile Motion', 'Motion in 2D'],
    entryTriggers: ['velocity at point', 'speed at height h', 'velocity when', 'direction of motion at'],
    steps: [
      { operation: 'Find t when projectile is at given height using y = usinθ·t - ½gt²', formula: 'y equation' },
      { operation: 'Find vₓ = ucosθ (constant) and vy = usinθ - gt', formula: 'velocity components' },
      { operation: 'Compute speed v = √(vₓ² + vy²) and direction tanα = vy/vₓ', formula: 'resultant' },
    ],
    finalTarget: 'Speed and direction at a point',
    complexity: 3,
  },
  {
    id: 'SP_RIVER_BOAT',
    label: 'River Boat Crossing',
    topics: ['Relative Motion', 'Motion in 2D'],
    entryTriggers: ['river', 'boat crosses', 'width of river', 'swimmer in river'],
    steps: [
      { operation: 'Identify v_boat (perpendicular) and v_river (along stream)', formula: 'Given' },
      { operation: 'Find resultant speed and direction', formula: 'v_res = √(v_boat² + v_river²)' },
      { operation: 'Find drift: drift = (v_river/v_boat) × width', formula: 'Drift formula' },
    ],
    finalTarget: 'Time / Drift / Direction',
    complexity: 2,
  },
  {
    id: 'SP_RELATIVE_VELOCITY',
    label: 'Relative Velocity of Objects',
    topics: ['Relative Motion'],
    entryTriggers: ['relative velocity', 'velocity relative to', 'relative speed', 'overtake time'],
    steps: [
      { operation: 'Write v_A and v_B (with direction signs)', formula: 'Given' },
      { operation: 'v_rel = v_A - v_B', formula: 'v_rel = v_A - v_B' },
      { operation: 'If asked for time: t = separation / v_rel', formula: 't = d/v_rel' },
    ],
    finalTarget: 'Relative velocity / Time to meet/overtake',
    complexity: 2,
  },
  {
    id: 'SP_GRAPH_SLOPE',
    label: 'Read Quantity from Graph Slope',
    topics: ['Graphs of Motion'],
    entryTriggers: ['from the graph', 'slope of', 's-t graph', 'v-t graph', 'what does the slope represent'],
    steps: [
      { operation: 'Identify graph type (s-t, v-t, a-t)', formula: 'Graph type' },
      { operation: 'Compute slope = Δy/Δx', formula: 'slope = Δy/Δx' },
      { operation: 'Interpret: slope of s-t = v, slope of v-t = a', formula: 'Physical meaning' },
    ],
    finalTarget: 'Velocity / Acceleration from graph',
    complexity: 2,
  },
  {
    id: 'SP_GRAPH_AREA',
    label: 'Read Quantity from Graph Area',
    topics: ['Graphs of Motion'],
    entryTriggers: ['area under v-t', 'area enclosed', 'displacement from graph', 'area under a-t'],
    steps: [
      { operation: 'Identify the enclosed region in graph', formula: 'Geometry' },
      { operation: 'Compute area (triangle/rectangle/trapezoid)', formula: 'Area formula' },
      { operation: 'Interpret: area under v-t = s, area under a-t = Δv', formula: 'Physical meaning' },
    ],
    finalTarget: 'Displacement / Velocity change',
    complexity: 2,
  },

  // ── Newton's Laws ─────────────────────────────────────────────────────────────
  {
    id: 'SP_NEWTON_DIRECT',
    label: "Direct Application of Newton's 2nd Law",
    topics: ["Newton's Laws"],
    entryTriggers: ['acceleration of', 'net force', 'force required', 'find the acceleration'],
    steps: [
      { operation: 'Draw FBD — identify all forces', formula: 'FBD' },
      { operation: 'Apply ΣF = ma along each direction', formula: 'ΣF = ma' },
      { operation: 'Solve for unknown (F or a)', formula: 'Arithmetic' },
    ],
    finalTarget: 'Acceleration / Force',
    complexity: 2,
  },
  {
    id: 'SP_ATWOOD',
    label: 'Atwood Machine Analysis',
    topics: ["Newton's Laws"],
    entryTriggers: ['atwood', 'two masses connected', 'pulley system with two'],
    steps: [
      { operation: 'Write equation for m₁: m₁g - T = m₁a', formula: 'm₁g - T = m₁a' },
      { operation: 'Write equation for m₂: T - m₂g = m₂a', formula: 'T - m₂g = m₂a' },
      { operation: 'Solve simultaneously: a = (m₁-m₂)g/(m₁+m₂)', formula: 'a = (m₁-m₂)g/(m₁+m₂)' },
    ],
    finalTarget: 'Acceleration and Tension',
    complexity: 3,
  },
  {
    id: 'SP_INCLINE_BLOCK',
    label: 'Block on Incline',
    topics: ["Newton's Laws", 'Friction (Static & Kinetic)'],
    entryTriggers: ['incline', 'slope', 'ramp', 'block on inclined'],
    steps: [
      { operation: 'Resolve weight along incline: mg sinθ (down) and perpendicular: mg cosθ', formula: 'mg sinθ, mg cosθ' },
      { operation: 'Normal force N = mg cosθ', formula: 'N = mg cosθ' },
      { operation: 'Apply Newton along incline: F_net = ma', formula: 'F_net = mg sinθ ± f' },
    ],
    finalTarget: 'Acceleration / Normal / Friction',
    complexity: 2,
  },
  {
    id: 'SP_FRICTION_CHECK',
    label: 'Static/Kinetic Friction Analysis',
    topics: ['Friction (Static & Kinetic)'],
    entryTriggers: ['just about to slip', 'limiting friction', 'maximum static friction', 'will it slip', 'static friction'],
    steps: [
      { operation: 'Find normal force N', formula: 'N = mg or N = mg cosθ' },
      { operation: 'Find maximum static friction f_s_max = μₛN', formula: 'f_s_max = μₛN' },
      { operation: 'Compare applied force with f_s_max to determine if slipping occurs', formula: 'Compare F vs f_s_max' },
    ],
    finalTarget: 'Whether slipping occurs / friction force',
    complexity: 2,
  },
  {
    id: 'SP_VERTICAL_CIRCLE',
    label: 'Vertical Circle (Energy + Newton)',
    topics: ['Circular Motion Dynamics'],
    entryTriggers: ['vertical circle', 'top of loop', 'bottom of loop', 'minimum speed at top'],
    steps: [
      { operation: 'At top: T + mg = mv²_top/r → T_min = 0 → v_min = √(gr)', formula: 'mg = mv²/r at top' },
      { operation: 'Apply energy conservation from bottom to top', formula: '½mv_b² = ½mv_t² + mg(2r)' },
      { operation: 'Find tension at any point using N = mv²/r ± mg', formula: 'Newton at point' },
    ],
    finalTarget: 'Min speed / Tension at various points',
    complexity: 3,
  },
  {
    id: 'SP_CENTRIPETAL_BASIC',
    label: 'Centripetal Force Identification',
    topics: ['Circular Motion Dynamics'],
    entryTriggers: ['circular motion', 'centripetal force', 'moving in circle', 'circular path'],
    steps: [
      { operation: 'Identify centripetal force source (T, N, friction, gravity)', formula: 'FBD' },
      { operation: 'Set F_c = mv²/r', formula: 'F_c = mv²/r' },
      { operation: 'Solve for velocity or radius or force', formula: 'Arithmetic' },
    ],
    finalTarget: 'Speed / Radius / Force in circular motion',
    complexity: 2,
  },
  {
    id: 'SP_PSEUDO_FORCE',
    label: 'Analysis in Non-Inertial Frame',
    topics: ['Pseudo Forces'],
    entryTriggers: ['pseudo force', 'non-inertial', 'inside a vehicle', 'accelerating frame', 'pendulum in accelerating'],
    steps: [
      { operation: 'Add pseudo force F_pseudo = ma (opposite to frame acceleration)', formula: 'F_pseudo = -ma_frame' },
      { operation: 'Apply equilibrium/Newton in non-inertial frame', formula: 'ΣF_real + F_pseudo = 0' },
      { operation: 'Solve for unknown (angle, acceleration, tension)', formula: 'Arithmetic' },
    ],
    finalTarget: 'Angle / Apparent weight / Motion in frame',
    complexity: 3,
  },
  {
    id: 'SP_PULLEY_CONSTRAINT',
    label: 'Pulley Constraint Analysis',
    topics: ['Constraint Relations'],
    entryTriggers: ['pulley', 'inextensible string', 'length of string constant', 'constraint relation'],
    steps: [
      { operation: 'Write string length equation: l = const', formula: 'l = l₁ + l₂ + ... = const' },
      { operation: 'Differentiate: dl/dt = 0 → Σvᵢ = 0', formula: 'Velocity constraint' },
      { operation: 'Differentiate again for acceleration constraint', formula: 'Acceleration constraint' },
    ],
    finalTarget: 'Velocity/acceleration relationships',
    complexity: 3,
  },

  // ── Mathematics ───────────────────────────────────────────────────────────────
  {
    id: 'SP_MATRIX_MULTIPLY',
    label: 'Matrix Multiplication',
    topics: ['Matrices'],
    entryTriggers: ['product of matrices', 'matrix multiplication', 'find ab', 'compute ab'],
    steps: [
      { operation: 'Verify compatibility of orders', formula: '(m×n)(n×p) = m×p' },
      { operation: 'Compute each element (AB)_ij = Σ A_ik · B_kj', formula: 'Row × Column' },
    ],
    finalTarget: 'Product matrix',
    complexity: 2,
  },
  {
    id: 'SP_MATRIX_SYMMETRY',
    label: 'Matrix Symmetry Classification',
    topics: ['Matrices'],
    entryTriggers: ['symmetric', 'skew-symmetric', 'transpose', 'is the matrix symmetric'],
    steps: [
      { operation: 'Compute Aᵀ', formula: 'Aᵀ: swap rows and columns' },
      { operation: 'Check A = Aᵀ (symmetric) or A = -Aᵀ (skew-symmetric)', formula: 'Comparison' },
    ],
    finalTarget: 'Symmetry classification',
    complexity: 1,
  },
  {
    id: 'SP_DET_EVALUATE',
    label: 'Evaluate a Determinant',
    topics: ['Determinants'],
    entryTriggers: ['find the determinant', 'evaluate |a|', 'value of det', 'expand along'],
    steps: [
      { operation: 'Choose 2×2 formula or cofactor expansion for 3×3', formula: '|A| = ad-bc or cofactor expansion' },
      { operation: 'Compute cofactors if 3×3', formula: 'Cᵢⱼ = (-1)^(i+j) Mᵢⱼ' },
      { operation: 'Sum: |A| = Σ aᵢⱼ · Cᵢⱼ', formula: 'Expansion' },
    ],
    finalTarget: 'Determinant value',
    complexity: 2,
  },
  {
    id: 'SP_DET_PROPERTY',
    label: 'Apply Determinant Property',
    topics: ['Determinants'],
    entryTriggers: ['property', 'row operation', 'column operation', 'det(ab)', 'area using determinant'],
    steps: [
      { operation: 'Identify which property applies (row swap, scalar, product)', formula: 'Property identification' },
      { operation: 'Apply property to simplify', formula: 'det(AB) = det(A)·det(B), etc.' },
      { operation: 'Compute final value', formula: 'Arithmetic' },
    ],
    finalTarget: 'Simplified determinant / area',
    complexity: 2,
  },
  {
    id: 'SP_CRAMERS_RULE',
    label: "Cramer's Rule Solution",
    topics: ['System of Linear Equations'],
    entryTriggers: ["cramer's rule", 'system of equations', 'solve using determinant'],
    steps: [
      { operation: 'Write coefficient matrix A and compute D = det(A)', formula: 'D = det(A)' },
      { operation: 'Replace columns with b to get Dₓ, Dy, Dz', formula: 'Dₓ = det(Aₓ)' },
      { operation: 'x = Dₓ/D, y = Dy/D, etc.', formula: "Cramer's formula" },
    ],
    finalTarget: 'Solution of linear system',
    complexity: 3,
  },
  {
    id: 'SP_CONSISTENCY_ANALYSIS',
    label: 'Consistency of Linear System',
    topics: ['System of Linear Equations'],
    entryTriggers: ['consistent', 'inconsistent', 'infinite solution', 'no solution', 'unique solution', 'rank of matrix'],
    steps: [
      { operation: 'Form augmented matrix [A|b]', formula: 'Augmented matrix' },
      { operation: 'Row reduce to find rank(A) and rank(A|b)', formula: 'Row reduction (REF)' },
      { operation: 'Apply rank conditions: unique/infinite/no solution', formula: 'Rank theorem' },
    ],
    finalTarget: 'Consistency / number of solutions',
    complexity: 3,
  },
  {
    id: 'SP_MATRIX_INVERSE',
    label: 'Find Matrix Inverse via Adjoint',
    topics: ['Adjoints and Inverses'],
    entryTriggers: ['find the inverse', 'inverse of', 'a inverse', 'find a^{-1}'],
    steps: [
      { operation: 'Compute det(A) — check non-zero', formula: 'det(A) ≠ 0' },
      { operation: 'Find cofactor matrix C and adj(A) = Cᵀ', formula: 'adj(A) = Cᵀ' },
      { operation: 'A⁻¹ = adj(A)/det(A)', formula: 'A⁻¹ = adj(A)/det(A)' },
    ],
    finalTarget: 'Inverse matrix',
    complexity: 3,
  },
  {
    id: 'SP_GENERIC',
    label: 'General Calculation',
    topics: [],
    entryTriggers: [],
    steps: [{ operation: 'Apply relevant method', formula: 'Context-dependent' }],
    finalTarget: 'Required quantity',
    complexity: 1,
  },
];

// ─── Solving Path Classifier ──────────────────────────────────────────────────

function findSolvingPath(q: {
  question_text: string;
  topic: string;
  solution_steps?: string[];
  explanation?: string;
}): SolvingPathTemplate {
  const text = (q.question_text ?? '').toLowerCase();
  const steps = ((q.solution_steps ?? []).join(' ') + ' ' + (q.explanation ?? '')).toLowerCase();
  const combined = text + ' ' + steps;
  const topic = q.topic;

  const topicPaths = SOLVING_PATH_TEMPLATES.filter(t => t.topics.length === 0 || t.topics.includes(topic));

  let bestPath = SOLVING_PATH_TEMPLATES.find(t => t.id === 'SP_GENERIC')!;
  let bestScore = 0;

  for (const template of topicPaths) {
    if (template.id === 'SP_GENERIC') continue;
    let score = 0;
    for (const trigger of template.entryTriggers) {
      if (combined.includes(trigger)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPath = template;
    }
  }

  return bestPath;
}

// ─── Reworded Variant Detector ────────────────────────────────────────────────

function detectRewording(q: {
  question_text: string;
  options?: Record<string, string>;
  explanation?: string;
  solution_steps?: string[];
}): { isVariant: boolean; reason: string } {
  const text = q.question_text ?? '';
  const options = q.options ?? {};
  const explanation = q.explanation ?? '';

  // Pattern 1: Auto-generated template with placeholder formula
  if (text.includes('y = f(x)') || /y = f\(x\)_\d+/.test(text)) {
    return { isVariant: true, reason: 'PLACEHOLDER_FORMULA: y = f(x) — no real formula content' };
  }

  // Pattern 2: Question number prefix from auto-generation
  if (/^\[Question #\d+\]/.test(text)) {
    return { isVariant: true, reason: 'AUTO_GENERATED_PREFIX: [Question #N] — template factory output' };
  }

  // Pattern 3: Generic option text
  const genericOptions = Object.values(options).filter((o: string) =>
    o.startsWith('Correct evaluation matching') ||
    o.startsWith('Incorrect evaluation due to')
  );
  if (genericOptions.length >= 3) {
    return { isVariant: true, reason: 'GENERIC_OPTIONS: Template-generated answer choices, not real options' };
  }

  // Pattern 4: Generic explanation
  if (explanation.includes('Step-by-step substitution and calculations.') || explanation.includes('Dimensional analysis.')) {
    return { isVariant: true, reason: 'GENERIC_EXPLANATION: Boilerplate explanation, no actual solution' };
  }

  // Pattern 5: Alpha tag forced uniqueness
  if (/\[[a-z]{1,4}\]/.test(text) && (text.includes('[Concept]') || text.includes('[Formula]') || text.includes('[Scenario]'))) {
    return { isVariant: true, reason: 'UNFILLED_TEMPLATE: Template placeholders not replaced' };
  }

  // Pattern 6: Numerical-only variation (same question, different numbers)
  // Detect by stripping numbers and checking if question stems match
  const stemA = text.replace(/[\d.,×π°√]+/g, 'N').replace(/\s+/g, ' ').trim();
  // We can't detect this for a single question alone — needs comparison
  // Flag as potential variant if extremely short or formulaic
  if (text.length < 100 && text.split(' ').length < 20) {
    return { isVariant: true, reason: 'TRIVIAL_LENGTH: Suspiciously short question — likely numeric substitution only' };
  }

  return { isVariant: false, reason: '' };
}

// ─── Main Solving Path Analyzer ───────────────────────────────────────────────

export function analyzeSolvingPath(q: {
  question_text: string;
  topic: string;
  subtopic?: string;
  concept?: string;
  difficulty?: string;
  solution_steps?: string[];
  explanation?: string;
  options?: Record<string, string>;
}): SolvingPathResult {
  const template = findSolvingPath(q);
  const rewording = detectRewording(q);

  const steps: SolvingStep[] = template.steps.map((s, i) => ({ order: i + 1, ...s }));

  const path: SolvingPath = {
    pathId: template.id,
    steps,
    entryPoint: template.entryTriggers[0] ?? 'general',
    finalTarget: template.finalTarget,
    complexity: template.complexity,
  };

  // Build a stable path hash from the template id + difficulty band
  const diffBand = (['easy', 'medium', 'hard'].includes((q.difficulty ?? '').toLowerCase()))
    ? q.difficulty!.toLowerCase()
    : 'medium';

  const pathHash = `${template.id}:${diffBand}`;

  return {
    path,
    pathHash,
    isVariant: rewording.isVariant,
    variantReason: rewording.reason,
  };
}

export { SOLVING_PATH_TEMPLATES, findSolvingPath, detectRewording };
