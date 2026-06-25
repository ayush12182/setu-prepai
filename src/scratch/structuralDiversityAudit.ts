/**
 * STRUCTURAL DIVERSITY AUDIT V2
 *
 * Measures student-perceived diversity — NOT text uniqueness, ID uniqueness,
 * or tag/wording differences.
 *
 * Template = Concept + Formula Chain + Scenario Type + Reasoning Mode
 *
 * A repository is genuinely diverse only when students encounter meaningfully
 * different problem-solving experiences across sessions.
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  concept?: string;
  difficulty?: string;
  question_text: string;
  options?: Record<string, string>;
  correct_answer?: string;
  explanation?: string;
  solution_steps?: string[];
  pyq_pattern?: {
    reasoning_mode?: string;
    exam?: string;
    difficulty?: string;
    pattern_type?: string;
  };
  reasoning_mode?: string;
  quality_score?: number;
  verification_status?: string;
  status?: string;
}

interface StructuralTemplate {
  concept: string;
  formulaChain: string;
  scenarioType: string;
  reasoningMode: string;
  templateKey: string;
}

interface TopicAuditResult {
  topic: string;
  chapter: string;
  subject: string;
  totalQuestions: number;
  uniqueConcepts: Map<string, number>;
  uniqueFormulaChains: Map<string, number>;
  uniqueScenarios: Map<string, number>;
  uniqueReasoningModes: Map<string, number>;
  uniqueStructuralTemplates: Map<string, number>;
  fakeDiversityCount: number;
  fakeDiversityExamples: string[];
}

// ─── Scenario Taxonomy ────────────────────────────────────────────────────────
// Student-perceived scenario buckets for each active topic.
// These are the REAL scenario types a student would recognise as different.

const SCENARIO_TAXONOMY: Record<string, string[]> = {
  "Coulomb's Law": [
    "Two Point Charges",
    "Three Charge System",
    "Equilibrium Position",
    "Distance Variation",
    "Medium / Dielectric Variation",
    "Vector Force Direction",
    "Force Ratio Comparison",
    "Suspended / Hanging Charge",
    "Mixed Electrostatics",
    "Multi-Concept Application",
  ],
  "Electric Field": [
    "Single Charge Field",
    "Dipole Field",
    "Superposition Field",
    "Field on Axis",
    "Field on Equatorial Line",
    "Ring / Disk Charge Distribution",
    "Infinite Line Charge",
    "Infinite Plane Sheet",
    "Field Between Plates",
    "Field Mapping & Visualization",
  ],
  "Electric Potential": [
    "Point Charge Potential",
    "Potential Due to System of Charges",
    "Equipotential Surfaces",
    "Work Done in Field",
    "Potential Energy of Charge",
    "Relation Between E and V",
    "Potential of Conducting Sphere",
    "Potential Inside a Conductor",
    "Potential Gradient",
    "Mixed Potential Problems",
  ],
  "Gauss's Law": [
    "Spherical Symmetry",
    "Cylindrical Symmetry",
    "Planar Symmetry",
    "Enclosed Charge Calculation",
    "Field Inside / Outside Conductor",
    "Insulator with Uniform Charge",
    "Hollow Sphere",
    "Concentric Shells",
    "Mixed Geometry",
    "Application to Real Devices",
  ],
  "Capacitors": [
    "Parallel Plate Capacitor",
    "Series Combination",
    "Parallel Combination",
    "Energy Stored",
    "Charging / Discharging",
    "Effect of Dielectric Insertion",
    "Capacitor with Conductor Slab",
    "Variable Plate Separation",
    "Mixed Network",
    "Real-World Circuit Application",
  ],
  "Dielectrics": [
    "Dielectric in Uniform Field",
    "Polarisation Calculation",
    "Bound Charge Density",
    "Dielectric Constant Measurement",
    "Energy Change on Insertion",
    "Partial Dielectric Fill",
    "Dielectric Breakdown",
    "Dielectric vs Conductor Comparison",
    "Susceptibility and Permittivity",
    "Mixed Dielectric Problem",
  ],
  "Motion in 1D": [
    "Uniform Velocity",
    "Uniform Acceleration",
    "Variable Acceleration",
    "Free Fall",
    "Vertical Throw Upward",
    "Vertical Throw Downward",
    "Deceleration to Rest",
    "Multiple Phase Motion",
    "Average vs Instantaneous Speed",
    "Collision on Straight Track",
  ],
  "Motion in 2D": [
    "Horizontal Projectile",
    "Oblique Projectile",
    "Range Calculation",
    "Maximum Height",
    "Time of Flight",
    "Projectile on Incline",
    "Relative Velocity in 2D",
    "River Boat Problem",
    "Rain Man Problem",
    "Aircraft Drift",
  ],
  "Projectile Motion": [
    "Standard Launch",
    "Range Maximum",
    "Height Comparison",
    "Time Symmetry",
    "Oblique Throw",
    "Projectile on Incline",
    "Two Projectiles Meeting",
    "Velocity at Arbitrary Point",
    "Angle of Elevation at Landing",
    "Mixed Projectile",
  ],
  "Relative Motion": [
    "Two Cars / Trains Same Direction",
    "Two Cars Opposite Direction",
    "Overtaking Problem",
    "River Boat Crossing",
    "Minimum Distance Problems",
    "Relative Velocity at Angle",
    "Rain Man Frame",
    "Elevator Frame",
    "Aircraft and Wind",
    "Mixed Relative Motion",
  ],
  "Graphs of Motion": [
    "s-t Graph Interpretation",
    "v-t Graph Interpretation",
    "a-t Graph Interpretation",
    "Slope Calculation",
    "Area Under Curve",
    "Velocity from Displacement Graph",
    "Acceleration from Velocity Graph",
    "Graph Matching",
    "Non-uniform Motion Graph",
    "Multi-Phase Graph",
  ],
  "Newton's Laws": [
    "Single Body on Surface",
    "Atwood Machine",
    "Connected Blocks",
    "Inclined Plane",
    "Elevator / Pseudo Force",
    "Pulley System",
    "Normal Force Variation",
    "Tension Calculation",
    "Newton's Third Law Pairs",
    "Multi-Body System",
  ],
  "Friction (Static & Kinetic)": [
    "Block on Surface",
    "Block on Incline",
    "Stacking Blocks",
    "Conveyor Belt",
    "Ladder Problem",
    "Maximum Static Friction",
    "Kinetic Friction",
    "Self-Locking",
    "Friction on Circular Track",
    "Mixed Friction System",
  ],
  "Circular Motion Dynamics": [
    "Horizontal Circular Motion",
    "Vertical Circular Motion",
    "Conical Pendulum",
    "Banked Road",
    "Car on Level Road",
    "Bead on Circular Wire",
    "Minimum Speed at Top",
    "Tension at Different Points",
    "Over Bridge / Dip",
    "Combined Circular Problem",
  ],
  "Pseudo Forces": [
    "Accelerating Car Frame",
    "Elevator Frame",
    "Rotating Frame",
    "Accelerating Lift Apparent Weight",
    "Pendulum in Accelerating Frame",
    "Block on Accelerating Wedge",
    "Object Slipping Inside Vehicle",
    "Spring in Accelerating Frame",
    "Train Frame Problems",
    "Mixed Non-Inertial Frame",
  ],
  "Constraint Relations": [
    "Simple Pulley",
    "Multiple Pulleys",
    "Wedge and Block",
    "String and Pulley",
    "Movable Pulley",
    "Fixed Pulley with Friction",
    "Velocity Constraint Equation",
    "Acceleration Constraint",
    "Mixed Constraint System",
    "Rigid Body Constraint",
  ],
  "Matrices": [
    "Matrix Addition / Subtraction",
    "Matrix Multiplication",
    "Transpose",
    "Symmetric Matrix",
    "Skew-Symmetric Matrix",
    "Null and Identity Matrix",
    "Scalar Multiplication",
    "Matrix Equation Solving",
    "Matrix Power",
    "Mixed Matrix Operations",
  ],
  "Determinants": [
    "2x2 Determinant",
    "3x3 Determinant",
    "Cofactor Expansion",
    "Properties of Determinants",
    "Singular Matrix Check",
    "Area of Triangle using Determinant",
    "Solving for Unknown using Determinant",
    "Row / Column Operations",
    "Vandermonde Determinant",
    "Mixed Determinant Problem",
  ],
  "System of Linear Equations": [
    "Two Equation System",
    "Three Equation System",
    "Cramer's Rule Application",
    "Consistent / Inconsistent",
    "Infinitely Many Solutions",
    "No Solution Case",
    "Homogeneous System",
    "Word Problem (Age / Speed / Coins)",
    "Geometric Interpretation",
    "Mixed Linear System",
  ],
  "Adjoints and Inverses": [
    "Adjoint of 2x2",
    "Adjoint of 3x3",
    "Inverse of 2x2",
    "Inverse of 3x3",
    "Verify Inverse Relation",
    "Inverse Using Adjoint Formula",
    "Properties of Inverse",
    "Product Inverse",
    "Inverse of Transpose",
    "Mixed Adjoint / Inverse",
  ],
};

// ─── Formula Chain Taxonomy ───────────────────────────────────────────────────
// Real formula chains a student would use when solving. Groups questions by
// which equations they actually apply.

const FORMULA_CHAIN_TAXONOMY: Record<string, string[]> = {
  "Coulomb's Law": [
    "F = kq1q2/r²",
    "F_net via superposition",
    "Equilibrium: F1 = F2",
    "Force ratio: F1/F2 = r2²/r1²",
    "Field from Coulomb: E = F/q",
    "Dielectric: F = kq1q2/(εr·r²)",
    "Vector form: F⃗ = kq1q2/r² · r̂",
    "Energy: U = kq1q2/r",
  ],
  "Electric Field": [
    "E = kq/r²",
    "E_net via superposition",
    "Dipole: E_axis = 2kp/r³",
    "Dipole: E_equatorial = kp/r³",
    "Ring: E = kqx/(x²+R²)^(3/2)",
    "Infinite line: E = λ/(2πε₀r)",
    "Infinite plane: E = σ/(2ε₀)",
    "E = -dV/dr",
  ],
  "Electric Potential": [
    "V = kq/r",
    "V_net = ΣkqᵢΝrᵢ (superposition)",
    "W = q(V1-V2)",
    "U = kq1q2/r",
    "E = -dV/dr",
    "V = constant (equipotential)",
    "V_sphere = kQ/R",
    "V_inside conductor = V_surface",
  ],
  "Gauss's Law": [
    "ΦE = q_enc/ε₀",
    "E·4πr² = q_enc/ε₀ (spherical)",
    "E·2πrL = q_enc/ε₀ (cylindrical)",
    "E·A = σ/ε₀ (planar)",
    "E_inside conductor = 0",
    "E outside shell = kQ/r²",
    "E inside solid sphere = kQr/R³",
    "ΦE through closed surface",
  ],
  "Capacitors": [
    "C = Q/V",
    "C = ε₀A/d",
    "Series: 1/C = 1/C1 + 1/C2",
    "Parallel: C = C1 + C2",
    "U = ½CV²",
    "U = Q²/2C",
    "C_dielectric = KC₀",
    "Q = CV (charging equation)",
  ],
  "Dielectrics": [
    "C = Kε₀A/d",
    "P = ε₀χeE",
    "D = ε₀E + P",
    "σ_bound = P·n̂",
    "ΔU = U_final - U_initial",
    "K = C/C₀",
    "E_inside = E₀/K",
    "χe = K - 1",
  ],
  "Motion in 1D": [
    "v = u + at",
    "s = ut + ½at²",
    "v² = u² + 2as",
    "s = (u+v)/2 · t",
    "s_nth = u + a(2n-1)/2",
    "Free fall: v = gt",
    "Average velocity = Δs/Δt",
    "Average acceleration = Δv/Δt",
  ],
  "Motion in 2D": [
    "R = u²sin2θ/g",
    "H = u²sin²θ/2g",
    "T = 2usinθ/g",
    "vₓ = ucosθ, vy = usinθ - gt",
    "x = ucosθ·t, y = usinθ·t - ½gt²",
    "River: resultant = √(v²+u²)",
    "Rain: relative velocity addition",
    "Vector decomposition of velocity",
  ],
  "Projectile Motion": [
    "R = u²sin2θ/g",
    "H_max = u²sin²θ/2g",
    "T = 2usinθ/g",
    "Velocity at point: v = √(vx²+vy²)",
    "Angle at point: tanα = vy/vx",
    "Range on incline",
    "Time of ascent = time of descent",
    "Two angles same range: θ + φ = 90°",
  ],
  "Relative Motion": [
    "v_rel = v_A - v_B",
    "s_rel = v_rel · t",
    "River: drift = (v_river/v_boat)·d",
    "Minimum crossing time",
    "Minimum distance problems",
    "Relative acceleration",
    "Closing / Opening speed",
    "Interception time calculation",
  ],
  "Graphs of Motion": [
    "slope of s-t = velocity",
    "slope of v-t = acceleration",
    "area under v-t = displacement",
    "area under a-t = velocity change",
    "v-t to s-t transformation",
    "a-t to v-t transformation",
    "Instantaneous vs average",
    "Graph matching: real to equation",
  ],
  "Newton's Laws": [
    "F = ma",
    "ΣF = 0 (equilibrium)",
    "Newton's 3rd: F_AB = -F_BA",
    "T - mg = ma (elevator up)",
    "mg - T = ma (elevator down)",
    "Atwood: a = (m1-m2)g/(m1+m2)",
    "Normal N = mgcosθ (incline)",
    "Friction + Newton combined",
  ],
  "Friction (Static & Kinetic)": [
    "f_s ≤ μsN",
    "f_k = μkN",
    "Limiting friction = μsN",
    "Net force = F_applied - f_k",
    "Self-locking: tanθ ≤ μs",
    "Stacking: shared friction",
    "Conveyor: relative slip condition",
    "Ladder equilibrium with friction",
  ],
  "Circular Motion Dynamics": [
    "Fc = mv²/r",
    "Fc = mω²r",
    "T_bottom = mg + mv²/r",
    "T_top = mg - mv²/r",
    "v_min_top = √(gR)",
    "Conical pendulum: Tcosθ = mg",
    "Banked road: tanθ = v²/rg",
    "Normal force at dip/over-bridge",
  ],
  "Pseudo Forces": [
    "F_pseudo = -ma_frame",
    "T_eff in accelerating frame",
    "Apparent weight = m(g ± a)",
    "Pendulum deflection: tanθ = a/g",
    "Block on wedge: pseudo analysis",
    "Equilibrium in non-inertial frame",
    "Object motion relative to vehicle",
    "Spring stretch in accelerating frame",
  ],
  "Constraint Relations": [
    "Length constraint: l = const",
    "Velocity constraint: Σv·dt = 0",
    "Acceleration constraint",
    "Pulley: a1 = a2 (single fixed)",
    "Movable pulley: a_block = 2a_pulley",
    "Wedge constraint: geometry",
    "String inextensible condition",
    "Relative velocity = 0 for rigid body",
  ],
  "Matrices": [
    "A + B (element-wise)",
    "A × B (row-column product)",
    "Aᵀ (transpose rule)",
    "A = Aᵀ (symmetric check)",
    "A = -Aᵀ (skew-symmetric check)",
    "kA (scalar multiplication)",
    "A² = A·A",
    "Solving AX = B",
  ],
  "Determinants": [
    "|A| = ad - bc (2×2)",
    "Cofactor expansion (3×3)",
    "Row operations preserve det (up to sign)",
    "det(AB) = det(A)·det(B)",
    "det(Aᵀ) = det(A)",
    "Area = ½|det| (triangle)",
    "Singular: det = 0",
    "Vandermonde form",
  ],
  "System of Linear Equations": [
    "Cramer's Rule: x = Dx/D",
    "Substitution method",
    "Elimination method",
    "Matrix form: AX = B",
    "Rank condition for consistency",
    "Infinite solutions: rank(A) = rank(A|B) < n",
    "No solution: rank(A) ≠ rank(A|B)",
    "Homogeneous: trivial vs non-trivial",
  ],
  "Adjoints and Inverses": [
    "adj(A) = Cᵀ (cofactor matrix transpose)",
    "A⁻¹ = adj(A)/det(A)",
    "A·A⁻¹ = I",
    "(AB)⁻¹ = B⁻¹A⁻¹",
    "(Aᵀ)⁻¹ = (A⁻¹)ᵀ",
    "det(A⁻¹) = 1/det(A)",
    "Inverse of 2×2 shortcut",
    "Verification: A·adj(A) = det(A)·I",
  ],
};

// ─── Concept Taxonomy ─────────────────────────────────────────────────────────
// Maps each topic to its core solving approaches (concepts).
// A student recognises "Superposition" and "Equilibrium" as fundamentally
// different approaches even if the formula superficially overlaps.

const CONCEPT_TAXONOMY: Record<string, string[]> = {
  "Coulomb's Law": ["Direct Force", "Superposition", "Equilibrium", "Force Ratio", "Vector Resolution", "Energy Approach", "Dielectric Effect", "Multi-Charge System"],
  "Electric Field": ["Single Charge Field", "Superposition", "Dipole Field", "Continuous Distribution", "Field-Potential Relation", "Symmetry Argument"],
  "Electric Potential": ["Point Charge Potential", "Superposition", "Work-Energy", "Equipotential", "E-V Relation", "Conducting Surface"],
  "Gauss's Law": ["Spherical Gauss", "Cylindrical Gauss", "Planar Gauss", "Enclosed Charge", "Conductor Shielding", "Non-uniform Distribution"],
  "Capacitors": ["Basic Capacitance", "Series/Parallel", "Energy Storage", "Charging/Discharging", "Dielectric Effect", "Variable Geometry"],
  "Dielectrics": ["Polarisation", "Bound Charge", "Energy Change", "Dielectric Constant", "Mixed Dielectric", "Molecular Model"],
  "Motion in 1D": ["Uniform Motion", "Uniform Acceleration", "Variable Acceleration", "Free Fall", "Multi-Phase Motion", "Average Quantities"],
  "Motion in 2D": ["Projectile Launch", "Range & Height", "Relative 2D Velocity", "River Boat", "Rain Man", "Vector Addition"],
  "Projectile Motion": ["Standard Projectile", "Range Optimisation", "Height Analysis", "Two Projectile Meeting", "Incline Projectile", "Velocity at Point"],
  "Relative Motion": ["Same Direction", "Opposite Direction", "River Crossing", "Minimum Distance", "Interception", "Angular Relative Velocity"],
  "Graphs of Motion": ["Slope Reading", "Area Under Curve", "Graph Matching", "Phase Identification", "Transformation", "Non-uniform Graph"],
  "Newton's Laws": ["Free Body Diagram", "Equilibrium", "Atwood Machine", "Inclined Plane", "Elevator", "Multi-body System"],
  "Friction (Static & Kinetic)": ["Limiting Friction", "Kinetic Friction", "Self-locking", "Stacking", "Conveyor Belt", "Ladder Equilibrium"],
  "Circular Motion Dynamics": ["Horizontal Circle", "Vertical Circle", "Conical Pendulum", "Banked Road", "Over-Bridge/Dip", "Minimum Speed"],
  "Pseudo Forces": ["Elevator Frame", "Accelerating Car", "Rotating Frame", "Pendulum in Frame", "Wedge-Block Frame", "Spring in Frame"],
  "Constraint Relations": ["Single Pulley", "Multiple Pulley", "Wedge Constraint", "Movable Pulley", "Velocity Constraint", "Acceleration Constraint"],
  "Matrices": ["Addition/Subtraction", "Multiplication", "Transpose", "Symmetry Check", "Scalar Multiplication", "Matrix Equation"],
  "Determinants": ["2×2 Direct", "3×3 Cofactor", "Row Operations", "Properties", "Area Application", "Singular Check"],
  "System of Linear Equations": ["Cramer's Rule", "Substitution/Elimination", "Matrix Method", "Consistency Analysis", "Homogeneous System", "Word Problem"],
  "Adjoints and Inverses": ["Cofactor Matrix", "Adjoint Formula", "Inverse Formula", "Verification", "Product Inverse", "Transpose Inverse"],
};

// ─── Reasoning Mode Taxonomy ──────────────────────────────────────────────────
const REASONING_MODES = [
  "Direct Formula Application",
  "Algebraic Manipulation",
  "Graphical / Visual Reasoning",
  "Dimensional Analysis",
  "Conceptual Argument",
  "Numerical Substitution",
  "Comparative / Ratio Analysis",
  "Step-by-step Derivation",
];

// ─── Core Structural Classifier ───────────────────────────────────────────────

function classifyStructuralTemplate(q: Question): StructuralTemplate {
  const topic = q.topic;
  const text = q.question_text?.toLowerCase() ?? '';
  const subtopic = (q.subtopic ?? '').toLowerCase();
  const concept = (q.concept ?? '').toLowerCase();
  const reasoningModeRaw = q.pyq_pattern?.reasoning_mode ?? q.reasoning_mode ?? '';

  // ── 1. Classify Concept (Solving Approach) ──────────────────────────────────
  const conceptList = CONCEPT_TAXONOMY[topic] ?? ['General'];
  let detectedConcept = conceptList[0]; // default

  // Keyword mapping for concept detection
  const conceptKeywords: Record<string, string[]> = {
    "Superposition": ["superposition", "multiple charge", "net force", "resultant", "superpose"],
    "Equilibrium": ["equilibrium", "balanced", "zero force", "equal and opposite", "null force", "rest"],
    "Force Ratio": ["ratio", "compare", "fraction", "proportion", "twice", "half the force"],
    "Vector Resolution": ["vector", "component", "direction", "angle between", "resultant direction"],
    "Energy Approach": ["energy", "potential energy", "work done", "joule", "erg"],
    "Dielectric Effect": ["dielectric", "medium", "permittivity", "relative permittivity", "insulating"],
    "Multi-Charge System": ["three charge", "four charge", "system of charges", "charges at vertices"],
    "Dipole Field": ["dipole", "axial", "equatorial"],
    "Continuous Distribution": ["ring", "disk", "rod", "sphere", "distribution", "uniform charge"],
    "Symmetry Argument": ["symmetry", "symmetric", "by symmetry"],
    "Free Fall": ["free fall", "drops from", "falls from", "gravity only", "no air"],
    "Multi-Phase Motion": ["phase", "two stages", "brakes", "first", "then"],
    "River Crossing": ["river", "stream", "current", "boat", "width"],
    "Range Optimisation": ["maximum range", "45 degree", "optimal angle"],
    "Height Analysis": ["maximum height", "highest point"],
    "Slope Reading": ["slope", "gradient", "tangent to"],
    "Area Under Curve": ["area", "under the graph", "enclosed"],
    "Atwood Machine": ["atwood", "two masses", "over a pulley", "connected by string"],
    "Inclined Plane": ["incline", "slope", "ramp", "angle of inclination"],
    "Limiting Friction": ["maximum static", "just about to slip", "limiting", "impending"],
    "Conical Pendulum": ["conical pendulum", "horizontal circle", "string makes angle"],
    "Banked Road": ["banked", "banking angle", "road banked"],
    "Over-Bridge/Dip": ["bridge", "dip", "over a hill"],
    "Elevator Frame": ["elevator", "lift", "accelerating upward", "accelerating downward"],
    "Cramer's Rule": ["cramer", "determinant method"],
    "Homogeneous System": ["homogeneous", "trivial solution", "non-trivial"],
    "Cofactor Matrix": ["cofactor", "minor"],
    "Adjoint Formula": ["adjoint", "adj("],
  };

  for (const [cname, keywords] of Object.entries(conceptKeywords)) {
    if (keywords.some(kw => text.includes(kw) || subtopic.includes(kw) || concept.includes(kw))) {
      // Check this concept exists in this topic's taxonomy
      const topicConcepts = CONCEPT_TAXONOMY[topic] ?? [];
      const matched = topicConcepts.find(tc => tc.toLowerCase().includes(cname.toLowerCase()) || cname.toLowerCase().includes(tc.toLowerCase()));
      if (matched) {
        detectedConcept = matched;
        break;
      }
    }
  }

  // Fallback: use the concept field or subtopic field as concept name
  if (detectedConcept === conceptList[0] && q.concept) {
    const rawConcept = q.concept.replace(/ Analysis$/, '').replace(/ Electro$/, '').trim();
    const matched = conceptList.find(c => c.toLowerCase().includes(rawConcept.toLowerCase().split(' ')[0]));
    if (matched) detectedConcept = matched;
    else detectedConcept = rawConcept;
  }

  // ── 2. Classify Formula Chain ───────────────────────────────────────────────
  const formulaChains = FORMULA_CHAIN_TAXONOMY[topic] ?? ['General Formula'];
  let detectedFormula = formulaChains[0]; // default

  const formulaKeywords: Record<string, string[]> = {
    "F = kq1q2/r²": ["coulomb", "kq1q2", "force between charges", "electrostatic force"],
    "F_net via superposition": ["net force", "resultant force", "total force", "superposition of force"],
    "Equilibrium: F1 = F2": ["equilibrium", "balanced force", "third charge equilibrium"],
    "Force ratio: F1/F2 = r2²/r1²": ["force ratio", "ratio of forces", "compare force"],
    "E = kq/r²": ["electric field due to", "field intensity", "field strength"],
    "E_net via superposition": ["net electric field", "resultant field"],
    "V = kq/r": ["potential due to", "electric potential"],
    "W = q(V1-V2)": ["work done", "potential difference"],
    "ΦE = q_enc/ε₀": ["gauss", "flux", "enclosed charge", "gaussian surface"],
    "C = Q/V": ["capacitance", "charge stored", "c = q"],
    "Series: 1/C = 1/C1 + 1/C2": ["series combination", "in series"],
    "Parallel: C = C1 + C2": ["parallel combination", "in parallel"],
    "U = ½CV²": ["energy stored", "energy of capacitor"],
    "v = u + at": ["v = u + at", "final velocity", "kinematics equation"],
    "s = ut + ½at²": ["displacement", "s = ut", "distance traveled"],
    "v² = u² + 2as": ["v² = u²", "third equation"],
    "R = u²sin2θ/g": ["range", "horizontal range", "sin2θ"],
    "H_max = u²sin²θ/2g": ["maximum height", "highest point"],
    "T = 2usinθ/g": ["time of flight", "total time"],
    "v_rel = v_A - v_B": ["relative velocity", "velocity relative to"],
    "slope of s-t = velocity": ["s-t graph", "displacement-time"],
    "slope of v-t = acceleration": ["v-t graph", "velocity-time"],
    "area under v-t = displacement": ["area under v-t", "area under velocity"],
    "F = ma": ["f = ma", "net force", "newton", "acceleration of block"],
    "Atwood: a = (m1-m2)g/(m1+m2)": ["atwood", "m1-m2"],
    "Normal N = mgcosθ (incline)": ["normal force on incline", "mgcos"],
    "f_s ≤ μsN": ["static friction", "coefficient of static"],
    "f_k = μkN": ["kinetic friction", "coefficient of kinetic", "μk"],
    "Fc = mv²/r": ["centripetal force", "mv²/r"],
    "v_min_top = √(gR)": ["minimum speed", "top of circle", "minimum velocity"],
    "Banked road: tanθ = v²/rg": ["banked road", "banking"],
    "F_pseudo = -ma_frame": ["pseudo force", "non-inertial"],
    "A + B (element-wise)": ["addition of matrix", "sum of matrices", "matrix addition"],
    "A × B (row-column product)": ["product of matrix", "matrix multiplication", "ab ="],
    "|A| = ad - bc (2×2)": ["determinant of 2x2", "ad - bc"],
    "Cofactor expansion (3×3)": ["expand along", "cofactor", "3x3 determinant"],
    "Cramer's Rule: x = Dx/D": ["cramer", "dx/d"],
    "A⁻¹ = adj(A)/det(A)": ["inverse using adjoint", "a inverse"],
    "adj(A) = Cᵀ (cofactor matrix transpose)": ["adjoint", "cofactor transpose"],
  };

  for (const [fname, keywords] of Object.entries(formulaKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      const topicFormulas = FORMULA_CHAIN_TAXONOMY[topic] ?? [];
      const matched = topicFormulas.find(f => f.toLowerCase().startsWith(fname.split(':')[0].toLowerCase().trim()) || f === fname);
      if (matched) {
        detectedFormula = matched;
        break;
      }
    }
  }

  // ── 3. Classify Scenario Type ───────────────────────────────────────────────
  const scenariosForTopic = SCENARIO_TAXONOMY[topic] ?? ['General Scenario'];
  let detectedScenario = scenariosForTopic[0]; // default

  const scenarioKeywords: Record<string, string[]> = {
    "Two Point Charges": ["two point charge", "two charges", "between two charges", "pair of charges"],
    "Three Charge System": ["three charge", "three point charge", "third charge", "three particles"],
    "Equilibrium Position": ["equilibrium", "balanced", "null force", "net force zero"],
    "Distance Variation": ["distance between", "separation", "distance varies", "when r is"],
    "Medium / Dielectric Variation": ["medium", "dielectric medium", "relative permittivity", "kerosene", "water", "oil"],
    "Vector Force Direction": ["direction of force", "angle", "resultant direction", "vector component"],
    "Force Ratio Comparison": ["ratio", "compare", "fraction of force"],
    "Suspended / Hanging Charge": ["suspended", "hanging", "pendulum", "string"],
    "Two Point Charges - Simple": ["two identical charges", "two equal charges"],
    "Multi-Concept Application": ["combined", "both electric and", "multiple concepts"],
    "Single Charge Field": ["single charge", "point charge field"],
    "Dipole Field": ["dipole", "axial", "equatorial"],
    "Superposition Field": ["superposition", "net field", "resultant field"],
    "Parallel Plate Capacitor": ["parallel plate", "plate capacitor"],
    "Series Combination": ["series", "in series connection"],
    "Parallel Combination": ["parallel connection", "in parallel"],
    "Horizontal Projectile": ["horizontal", "thrown horizontally", "horizontal velocity"],
    "Oblique Projectile": ["at angle", "oblique", "inclined throw"],
    "Two Cars / Trains Same Direction": ["same direction", "overtake", "same side"],
    "Two Cars Opposite Direction": ["opposite direction", "toward each other", "head-on"],
    "River Boat Problem": ["river", "stream", "boat", "current"],
    "Rain Man Problem": ["rain", "man walking", "umbrella"],
    "s-t Graph Interpretation": ["displacement-time graph", "s-t graph", "position-time"],
    "v-t Graph Interpretation": ["velocity-time graph", "v-t graph", "speed-time"],
    "a-t Graph Interpretation": ["acceleration-time graph", "a-t graph"],
    "Atwood Machine": ["atwood", "pulley system with two masses"],
    "Inclined Plane": ["incline", "slope", "ramp"],
    "Elevator / Pseudo Force": ["elevator", "lift", "accelerating lift"],
    "Block on Surface": ["block on floor", "block on horizontal", "horizontal surface"],
    "Block on Incline": ["block on slope", "block on inclined"],
    "Conveyor Belt": ["conveyor", "belt"],
    "Horizontal Circular Motion": ["horizontal circle", "circular track"],
    "Vertical Circular Motion": ["vertical circle", "loop"],
    "Conical Pendulum": ["conical pendulum"],
    "Banked Road": ["banked", "banking"],
    "Accelerating Car Frame": ["car accelerates", "inside a car", "vehicle accelerates"],
    "Simple Pulley": ["simple pulley", "single pulley"],
    "Multiple Pulleys": ["multiple pulley", "compound pulley"],
    "Matrix Addition / Subtraction": ["matrix a + b", "sum of", "addition of two matrices"],
    "Matrix Multiplication": ["product ab", "matrix product", "multiply matrices"],
    "2x2 Determinant": ["2×2", "2x2", "second order determinant"],
    "3x3 Determinant": ["3×3", "3x3", "third order determinant"],
    "Two Equation System": ["two equations", "two variables", "simultaneous equations"],
    "Three Equation System": ["three equations", "three variables"],
    "Adjoint of 2x2": ["adjoint of 2×2", "adj of 2x2"],
    "Adjoint of 3x3": ["adjoint of 3×3", "adj of 3x3"],
    "Inverse of 2x2": ["inverse of 2×2", "2x2 inverse"],
    "Inverse of 3x3": ["inverse of 3×3", "3x3 inverse"],
  };

  for (const [sname, keywords] of Object.entries(scenarioKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      const topicScenarios = SCENARIO_TAXONOMY[topic] ?? [];
      const matched = topicScenarios.find(s => s.toLowerCase().includes(sname.toLowerCase().split(' ')[0]) || sname.toLowerCase().includes(s.toLowerCase().split(' ')[0]));
      if (matched) {
        detectedScenario = matched;
        break;
      }
    }
  }

  // ── 4. Classify Reasoning Mode ──────────────────────────────────────────────
  const rawMode = reasoningModeRaw.toLowerCase();
  let detectedReasoning = 'Direct Formula Application';

  if (rawMode.includes('graph') || rawMode.includes('visual') || rawMode.includes('slope') || rawMode.includes('area')) {
    detectedReasoning = 'Graphical / Visual Reasoning';
  } else if (rawMode.includes('dimension') || rawMode.includes('unit')) {
    detectedReasoning = 'Dimensional Analysis';
  } else if (rawMode.includes('ratio') || rawMode.includes('compare') || rawMode.includes('proportion')) {
    detectedReasoning = 'Comparative / Ratio Analysis';
  } else if (rawMode.includes('concept') || rawMode.includes('argument') || rawMode.includes('qualitative')) {
    detectedReasoning = 'Conceptual Argument';
  } else if (rawMode.includes('numerical') || rawMode.includes('substitut') || rawMode.includes('calculation')) {
    detectedReasoning = 'Numerical Substitution';
  } else if (rawMode.includes('algebraic') || rawMode.includes('manipulat') || rawMode.includes('derivation')) {
    detectedReasoning = 'Algebraic Manipulation';
  } else if (rawMode.includes('step') || rawMode.includes('derivat')) {
    detectedReasoning = 'Step-by-step Derivation';
  } else if (rawMode.includes('superposition') || rawMode.includes('boundary') || rawMode.includes('component') || rawMode.includes('analytical')) {
    // These are from the old taxonomy — map them
    detectedReasoning = 'Direct Formula Application';
  }

  // ── 5. Detect Fake Diversity ─────────────────────────────────────────────────
  // A template is "fake diverse" if its question_text still contains the generic
  // placeholder marker "y = f(x)" or "[Question #N]" which was the autogenerated
  // template from the previous run — meaning it has NO real scenario content.
  // Also flag if sentence structure is from the generic sentence templates.

  const templateKey = `${detectedConcept}||${detectedFormula}||${detectedScenario}||${detectedReasoning}`;

  return {
    concept: detectedConcept,
    formulaChain: detectedFormula,
    scenarioType: detectedScenario,
    reasoningMode: detectedReasoning,
    templateKey,
  };
}

// ─── Fake Diversity Detection ─────────────────────────────────────────────────

function isFakeDiversity(q: Question): { fake: boolean; reason: string } {
  const text = q.question_text ?? '';

  // Generic placeholder formulas — the real formula is never rendered
  if (text.includes('y = f(x)')) {
    return { fake: true, reason: 'Generic placeholder formula y = f(x) — no real physics/math formula' };
  }
  // Auto-generated question number prefix
  if (/^\[Question #\d+\]/.test(text)) {
    return { fake: true, reason: 'Auto-generated [Question #N] prefix — template-based generation detected' };
  }
  // Options are generic evaluation statements, not real answer choices
  if (q.options && Object.values(q.options).some((opt: string) => opt.startsWith('Correct evaluation matching'))) {
    return { fake: true, reason: 'Generic option text "Correct evaluation matching..." — no real answer choices' };
  }
  // Explanation is entirely generic
  if (q.explanation && q.explanation.includes('Step-by-step substitution and calculations.') && q.explanation.includes('Dimensional analysis.')) {
    return { fake: true, reason: 'Generic explanation with no actual solution steps' };
  }
  // Alpha-tag only difference: pure wording change with no conceptual change
  const alphaTagOnly = /\[[a-z]{1,4}\]/.test(text) && text.includes('[[AlphaTag]]'.replace('[[AlphaTag]]', ''));

  return { fake: false, reason: '' };
}

// ─── Main Audit Runner ────────────────────────────────────────────────────────

function runStructuralDiversityAuditV2(): void {
  console.log('=== STRUCTURAL DIVERSITY AUDIT V2 ===');
  console.log('Measuring student-perceived structural diversity.\n');

  const projectDir = process.cwd();
  const prodQuestionsPath = path.join(projectDir, 'src/scratch/production_questions_2000.json');

  if (!fs.existsSync(prodQuestionsPath)) {
    throw new Error(`Production questions file not found: ${prodQuestionsPath}`);
  }

  const allQuestions: Question[] = JSON.parse(fs.readFileSync(prodQuestionsPath, 'utf8'));
  console.log(`Loaded ${allQuestions.length} questions from repository.\n`);

  const activeTopics = Object.keys(SCENARIO_TAXONOMY);

  const auditResults: TopicAuditResult[] = [];

  // ── Per-topic audit ──────────────────────────────────────────────────────────
  for (const topic of activeTopics) {
    const topicQuestions = allQuestions.filter(q => q.topic === topic);
    if (topicQuestions.length === 0) continue;

    const result: TopicAuditResult = {
      topic,
      chapter: topicQuestions[0]?.chapter ?? '',
      subject: topicQuestions[0]?.subject ?? '',
      totalQuestions: topicQuestions.length,
      uniqueConcepts: new Map(),
      uniqueFormulaChains: new Map(),
      uniqueScenarios: new Map(),
      uniqueReasoningModes: new Map(),
      uniqueStructuralTemplates: new Map(),
      fakeDiversityCount: 0,
      fakeDiversityExamples: [],
    };

    for (const q of topicQuestions) {
      // Fake diversity check
      const fakeCheck = isFakeDiversity(q);
      if (fakeCheck.fake) {
        result.fakeDiversityCount++;
        if (result.fakeDiversityExamples.length < 3) {
          result.fakeDiversityExamples.push(`"${q.question_text.slice(0, 80)}..." → ${fakeCheck.reason}`);
        }
        // For fake questions, still classify to understand the structural damage
      }

      // Structural classification
      const tmpl = classifyStructuralTemplate(q);

      result.uniqueConcepts.set(tmpl.concept, (result.uniqueConcepts.get(tmpl.concept) ?? 0) + 1);
      result.uniqueFormulaChains.set(tmpl.formulaChain, (result.uniqueFormulaChains.get(tmpl.formulaChain) ?? 0) + 1);
      result.uniqueScenarios.set(tmpl.scenarioType, (result.uniqueScenarios.get(tmpl.scenarioType) ?? 0) + 1);
      result.uniqueReasoningModes.set(tmpl.reasoningMode, (result.uniqueReasoningModes.get(tmpl.reasoningMode) ?? 0) + 1);
      result.uniqueStructuralTemplates.set(tmpl.templateKey, (result.uniqueStructuralTemplates.get(tmpl.templateKey) ?? 0) + 1);
    }

    auditResults.push(result);
  }

  // ── Generate Report ───────────────────────────────────────────────────────────
  generateReport(auditResults);
}

function getDistributionStatus(maxPct: number, threshold: number): string {
  return maxPct <= threshold ? '✅ PASS' : '❌ FAIL';
}

function topN(map: Map<string, number>, n: number): Array<[string, number, number]> {
  const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => [k, v, parseFloat(((v / total) * 100).toFixed(1))]);
}

function maxConcentration(map: Map<string, number>): number {
  const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
  const max = Math.max(...Array.from(map.values()));
  return parseFloat(((max / total) * 100).toFixed(1));
}

function generateReport(results: TopicAuditResult[]): void {
  const artifactDir = '/Users/ayushdixit12/.gemini/antigravity-ide/brain/1405db37-c8c4-4a16-89f1-2056d6cdcae0';
  const reportPath = path.join(artifactDir, 'structural_diversity_audit_v2.md');

  let md = `# Structural Diversity Audit V2\n\n`;
  md += `> **Measurement Method**: Student-perceived diversity via structural template analysis.\n`;
  md += `> **Template Definition**: Concept + Formula Chain + Scenario Type + Reasoning Mode\n`;
  md += `> **NOT measured by**: text uniqueness, IDs, alpha-tags, wording differences, or hashes.\n\n`;
  md += `Generated: \`${new Date().toISOString()}\`\n\n`;
  md += `---\n\n`;

  // Summary table
  md += `## Executive Summary\n\n`;
  md += `| Topic | Total Qs | Unique Templates | Fake Diversity % | Approach Max% | Scenario Max% | Formula Max% | Template Max% | Overall |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

  const overallResults: { topic: string; pass: boolean; fakePct: number }[] = [];

  for (const r of results) {
    const total = r.totalQuestions;
    const fakePct = parseFloat(((r.fakeDiversityCount / total) * 100).toFixed(1));
    const approachMax = maxConcentration(r.uniqueConcepts);
    const scenarioMax = maxConcentration(r.uniqueScenarios);
    const formulaMax = maxConcentration(r.uniqueFormulaChains);
    const templateMax = maxConcentration(r.uniqueStructuralTemplates);

    const passes = approachMax <= 20 && scenarioMax <= 15 && formulaMax <= 25 && templateMax <= 5 && fakePct < 5;
    const status = passes ? '✅ PASS' : '❌ FAIL';

    overallResults.push({ topic: r.topic, pass: passes, fakePct });
    md += `| ${r.topic} | ${total} | ${r.uniqueStructuralTemplates.size} | ${fakePct}% | ${approachMax}% | ${scenarioMax}% | ${formulaMax}% | ${templateMax}% | ${status} |\n`;
  }

  const totalTopics = results.length;
  const passCount = overallResults.filter(r => r.pass).length;
  const failCount = totalTopics - passCount;

  md += `\n`;
  md += `**Topics Audited**: ${totalTopics} | **PASS**: ${passCount} | **FAIL**: ${failCount}\n\n`;
  md += `---\n\n`;

  // Per-topic deep dive
  md += `## Per-Topic Analysis\n\n`;

  for (const r of results) {
    const total = r.totalQuestions;
    const fakePct = parseFloat(((r.fakeDiversityCount / total) * 100).toFixed(1));

    md += `### ${r.topic} _(${r.chapter} · ${r.subject})_\n\n`;
    md += `**Total Questions**: ${total} | **Fake Diversity**: ${r.fakeDiversityCount} (${fakePct}%)\n\n`;

    // A. Solving Approach Distribution
    const approachMax = maxConcentration(r.uniqueConcepts);
    md += `#### A. Solving Approach Distribution (Target: no approach > 20%)\n\n`;
    md += `**Status**: ${getDistributionStatus(approachMax, 20)} | **Max Concentration**: ${approachMax}%\n\n`;
    md += `| Solving Approach | Count | % |\n| :--- | :---: | :---: |\n`;
    const topApproaches = topN(r.uniqueConcepts, 10);
    for (const [name, count, pct] of topApproaches) {
      const flag = pct > 20 ? ' ⚠️' : '';
      md += `| ${name} | ${count} | ${pct}%${flag} |\n`;
    }
    md += `\n`;

    // B. Scenario Distribution
    const scenarioMax = maxConcentration(r.uniqueScenarios);
    md += `#### B. Scenario Distribution (Target: no scenario > 15%)\n\n`;
    md += `**Status**: ${getDistributionStatus(scenarioMax, 15)} | **Max Concentration**: ${scenarioMax}%\n\n`;
    md += `| Scenario Type | Count | % |\n| :--- | :---: | :---: |\n`;
    const topScenarios = topN(r.uniqueScenarios, 10);
    for (const [name, count, pct] of topScenarios) {
      const flag = pct > 15 ? ' ⚠️' : '';
      md += `| ${name} | ${count} | ${pct}%${flag} |\n`;
    }
    md += `\n`;

    // C. Formula Chain Distribution
    const formulaMax = maxConcentration(r.uniqueFormulaChains);
    md += `#### C. Formula Chain Distribution (Target: no chain > 25%)\n\n`;
    md += `**Status**: ${getDistributionStatus(formulaMax, 25)} | **Max Concentration**: ${formulaMax}%\n\n`;
    md += `| Formula Chain | Count | % |\n| :--- | :---: | :---: |\n`;
    const topFormulas = topN(r.uniqueFormulaChains, 10);
    for (const [name, count, pct] of topFormulas) {
      const flag = pct > 25 ? ' ⚠️' : '';
      md += `| ${name} | ${count} | ${pct}%${flag} |\n`;
    }
    md += `\n`;

    // D. Structural Template Distribution
    const templateMax = maxConcentration(r.uniqueStructuralTemplates);
    md += `#### D. Structural Template Distribution (Target: no template > 5%)\n\n`;
    md += `**Status**: ${getDistributionStatus(templateMax, 5)} | **Max Concentration**: ${templateMax}% | **Unique Templates**: ${r.uniqueStructuralTemplates.size}\n\n`;
    md += `**Top Repeated Structural Templates:**\n\n`;
    md += `| Template (Concept‖Formula‖Scenario‖Reasoning) | Count | % |\n| :--- | :---: | :---: |\n`;
    const topTemplates = topN(r.uniqueStructuralTemplates, 5);
    for (const [key, count, pct] of topTemplates) {
      const parts = key.split('||');
      const flag = pct > 5 ? ' ⚠️' : '';
      md += `| **${parts[0]}** ‖ ${parts[1]} ‖ ${parts[2]} ‖ ${parts[3]} | ${count} | ${pct}%${flag} |\n`;
    }
    md += `\n`;

    // E. Reasoning Mode Distribution
    md += `#### E. Reasoning Mode Distribution\n\n`;
    md += `| Reasoning Mode | Count | % |\n| :--- | :---: | :---: |\n`;
    const topReasoning = topN(r.uniqueReasoningModes, 8);
    for (const [name, count, pct] of topReasoning) {
      md += `| ${name} | ${count} | ${pct}% |\n`;
    }
    md += `\n`;

    // F. Fake Diversity Examples
    if (r.fakeDiversityCount > 0) {
      md += `#### F. Fake Diversity Findings (${r.fakeDiversityCount} questions flagged)\n\n`;
      md += `> [!CAUTION]\n> ${r.fakeDiversityCount} of ${total} questions (${fakePct}%) use generic auto-generated templates.\n> These questions look different on the surface but are structurally identical from a student's perspective.\n\n`;
      for (const ex of r.fakeDiversityExamples) {
        md += `- ${ex}\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  // Recommended Repository Gaps
  md += `## Recommended Repository Gaps\n\n`;
  md += `> [!IMPORTANT]\n> The following represent genuine gaps where students experience repeated problem-solving patterns.\n\n`;

  const failedTopics = results.filter(r => {
    const approachMax = maxConcentration(r.uniqueConcepts);
    const scenarioMax = maxConcentration(r.uniqueScenarios);
    const formulaMax = maxConcentration(r.uniqueFormulaChains);
    const templateMax = maxConcentration(r.uniqueStructuralTemplates);
    const fakePct = (r.fakeDiversityCount / r.totalQuestions) * 100;
    return approachMax > 20 || scenarioMax > 15 || formulaMax > 25 || templateMax > 5 || fakePct >= 5;
  });

  if (failedTopics.length === 0) {
    md += `✅ All topics meet structural diversity requirements.\n\n`;
  } else {
    md += `| Topic | Gap Type | Recommended Action |\n| :--- | :--- | :--- |\n`;
    for (const r of failedTopics) {
      const approachMax = maxConcentration(r.uniqueConcepts);
      const scenarioMax = maxConcentration(r.uniqueScenarios);
      const formulaMax = maxConcentration(r.uniqueFormulaChains);
      const templateMax = maxConcentration(r.uniqueStructuralTemplates);
      const fakePct = (r.fakeDiversityCount / r.totalQuestions) * 100;

      if (fakePct >= 5) {
        md += `| ${r.topic} | Fake Diversity (${fakePct.toFixed(0)}%) | Replace auto-generated questions with real scenario-based problems |\n`;
      }
      if (approachMax > 20) {
        const dominant = topN(r.uniqueConcepts, 1)[0];
        md += `| ${r.topic} | Approach Overrepresented (${dominant?.[0]}: ${dominant?.[2]}%) | Add questions for underrepresented solving approaches |\n`;
      }
      if (scenarioMax > 15) {
        const dominant = topN(r.uniqueScenarios, 1)[0];
        md += `| ${r.topic} | Scenario Overrepresented (${dominant?.[0]}: ${dominant?.[2]}%) | Add questions with different scenario contexts |\n`;
      }
      if (formulaMax > 25) {
        const dominant = topN(r.uniqueFormulaChains, 1)[0];
        md += `| ${r.topic} | Formula Overrepresented (${dominant?.[0]}: ${dominant?.[2]}%) | Add questions using alternative formula chains |\n`;
      }
      if (templateMax > 5) {
        md += `| ${r.topic} | Template Overcrowded (max ${templateMax}%) | Introduce new concept-scenario-formula-reasoning combinations |\n`;
      }
    }
  }

  md += `\n---\n\n`;
  md += `## Success Criteria Evaluation\n\n`;
  md += `| Criterion | Target | Status |\n| :--- | :---: | :---: |\n`;
  md += `| Solving Approach Max Concentration | ≤ 20% per topic | ${results.every(r => maxConcentration(r.uniqueConcepts) <= 20) ? '✅ ALL PASS' : '❌ SOME FAIL'} |\n`;
  md += `| Scenario Max Concentration | ≤ 15% per topic | ${results.every(r => maxConcentration(r.uniqueScenarios) <= 15) ? '✅ ALL PASS' : '❌ SOME FAIL'} |\n`;
  md += `| Formula Chain Max Concentration | ≤ 25% per topic | ${results.every(r => maxConcentration(r.uniqueFormulaChains) <= 25) ? '✅ ALL PASS' : '❌ SOME FAIL'} |\n`;
  md += `| Structural Template Max Concentration | ≤ 5% per topic | ${results.every(r => maxConcentration(r.uniqueStructuralTemplates) <= 5) ? '✅ ALL PASS' : '❌ SOME FAIL'} |\n`;
  md += `| Fake Diversity | < 5% per topic | ${results.every(r => (r.fakeDiversityCount / r.totalQuestions) * 100 < 5) ? '✅ ALL PASS' : '❌ SOME FAIL'} |\n`;

  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`\nReport written to: ${reportPath}`);
  console.log(`\n=== AUDIT COMPLETE ===`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────
if (process.argv[1]?.includes('structuralDiversityAudit')) {
  runStructuralDiversityAuditV2();
}

export { runStructuralDiversityAuditV2, classifyStructuralTemplate, isFakeDiversity };
