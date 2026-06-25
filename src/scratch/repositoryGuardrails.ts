/**
 * repositoryGuardrails.ts — Phase 8.5 Repository Expansion Guardrails
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Implements:
 *   1. Pre-Generation Blueprint Audit (per topic)
 *   2. Quality Gate V2 (8 gates, per question)
 *   3. Repository KPI Validator (concentration limits)
 *   4. Dashboard generators (4 reports)
 *
 * Run via:
 *   node_modules/.bin/vite-node src/scratch/repositoryGuardrails.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopicBlueprint {
  topic: string;
  chapter: string;
  subject: string;
  concepts: string[];
  scenarios: BlueprintScenario[];
  formulaChains: BlueprintFormula[];
  solvingPaths: BlueprintPath[];
  reasoningModes: string[];
  // computed
  conceptCount: number;
  scenarioCount: number;
  formulaChainCount: number;
  solvingPathCount: number;
  reasoningModeCount: number;
  blueprintReady: boolean;
  blueprintFailures: string[];
}

export interface BlueprintScenario {
  id: string;
  label: string;
  setup: string;
  contextKeywords: string[];
}

export interface BlueprintFormula {
  id: string;
  label: string;
  formula: string;
  variables: string[];
  compute: (vals: Record<string, number>) => number;
  generateValues: () => Record<string, number>;
}

export interface BlueprintPath {
  id: string;
  label: string;
  steps: string[];
  formulaUsed: string[];
  targetQuantity: string;
}

export interface QualityGateResult {
  question_id: string;
  passed: boolean;
  gates: {
    topic_fidelity: boolean;
    formula_validation: boolean;
    numerical_validation: boolean;
    structural_fingerprint: boolean;
    explanation_consistency: boolean;
    scenario_uniqueness: boolean;
    solving_path_diversity: boolean;
    faculty_review_score: boolean;
  };
  failures: string[];
  quality_score: number;
}

export interface TopicKPIResult {
  topic: string;
  chapter: string;
  subject: string;
  question_count: number;
  scenario_count: number;
  formula_count: number;
  path_count: number;
  scenario_concentration: number;   // max scenario share %
  formula_concentration: number;    // max formula share %
  path_concentration: number;       // max path share %
  template_diversity_score: number;
  student_thinking_diversity: number;
  passes_kpi: boolean;
  kpi_failures: string[];
}

// ─── BLUEPRINT REQUIREMENTS ──────────────────────────────────────────────────
// A topic cannot enter expansion unless it meets all these thresholds.

const BLUEPRINT_REQUIREMENTS = {
  minConcepts: 5,
  minScenarios: 15,
  minFormulaChains: 15,
  minSolvingPaths: 20,
  minReasoningModes: 8,
};

// ─── KPI THRESHOLDS ──────────────────────────────────────────────────────────

const KPI_THRESHOLDS = {
  minQuestions: 300,
  maxScenarioConcentration: 10,   // % — no single scenario > 10%
  maxFormulaConcentration: 15,    // % — no single formula > 15%
  maxPathConcentration: 5,        // % — no single solving path > 5%
  minTemplateDiversity: 95,       // %
  minStudentThinkingDiversity: 80, // %
  minQualityScore: 8.5,
  maxDuplicateRate: 0,
};

// ─── FULL SYLLABUS BLUEPRINTS ─────────────────────────────────────────────────
// Pre-defined taxonomies for all 212 topics.
// Blueprint data is the intellectual foundation of the expansion.

export const TOPIC_BLUEPRINTS: Record<string, Partial<TopicBlueprint>> = {

  // ══════════════════════════════════════════════════════════════════════════
  // PHYSICS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Work, Energy & Power ──────────────────────────────────────────────────

  'Work by constant/variable force': {
    concepts: ['Work by constant force W=Fs cosθ', 'Work by variable force via integration', 'Area under F-x graph', 'Negative work (friction)', 'Zero work (perpendicular force)', 'Work-energy theorem preview'],
    scenarios: [
      { id: 'SC_W_01', label: 'Block on rough surface with applied force', setup: 'Force F at angle θ applied to block on rough surface.', contextKeywords: ['applied force', 'rough surface', 'angle θ'] },
      { id: 'SC_W_02', label: 'Spring compression / extension work', setup: 'External agent compresses spring from x=0 to x=d.', contextKeywords: ['spring', 'compression', 'F=kx'] },
      { id: 'SC_W_03', label: 'Lifting object against gravity', setup: 'Object of mass m lifted vertically by height h.', contextKeywords: ['lifted', 'vertical', 'against gravity'] },
      { id: 'SC_W_04', label: 'Pulling block up smooth incline', setup: 'Force along incline pulls block up slope angle θ.', contextKeywords: ['incline', 'up the slope', 'force along incline'] },
      { id: 'SC_W_05', label: 'Variable force F=kx on block', setup: 'Force varies as F=kx. Find work from x₁ to x₂.', contextKeywords: ['variable force', 'F=kx', 'integration'] },
      { id: 'SC_W_06', label: 'Work done by friction', setup: 'Block slides distance d on rough surface (μk).', contextKeywords: ['friction', 'kinetic friction', 'negative work'] },
      { id: 'SC_W_07', label: 'Circular motion — centripetal force work', setup: 'Particle moves in circle with centripetal force F.', contextKeywords: ['circular motion', 'centripetal', 'perpendicular force', 'zero work'] },
      { id: 'SC_W_08', label: 'Work by normal force on curved track', setup: 'Object slides on curved frictionless track.', contextKeywords: ['curved track', 'normal force', 'perpendicular to motion'] },
      { id: 'SC_W_09', label: 'Work from area under F-x graph', setup: 'F-x graph given (triangular/trapezoidal). Find work.', contextKeywords: ['F-x graph', 'area under', 'graphical method'] },
      { id: 'SC_W_10', label: 'Two forces acting on block — net work', setup: 'Applied force F and friction f act on block. Net work = ?', contextKeywords: ['net work', 'two forces', 'resultant work'] },
      { id: 'SC_W_11', label: 'Work against variable gravity (satellite launch)', setup: 'Object moved from R to nR against gravity.', contextKeywords: ['satellite', 'launch', 'variable gravity', 'gravitational work'] },
      { id: 'SC_W_12', label: 'Truck on hill — engine work calculation', setup: 'Truck of mass M climbs hill (angle α, length L, μ).', contextKeywords: ['truck', 'engine', 'hill', 'work done by engine'] },
      { id: 'SC_W_13', label: 'Rope pulling block horizontally', setup: 'Horizontal rope pulls block distance d. F=constant.', contextKeywords: ['rope', 'horizontal pull', 'constant force'] },
      { id: 'SC_W_14', label: 'Force at angle to motion', setup: 'Force F at angle θ to horizontal displaces block by d.', contextKeywords: ['angle to motion', 'W=Fd cosθ', 'oblique force'] },
      { id: 'SC_W_15', label: 'Work done in SHM by spring', setup: 'Spring-mass system: find work done by spring in quarter cycle.', contextKeywords: ['SHM', 'spring work', 'quarter cycle', 'oscillation'] },
      { id: 'SC_W_16', label: 'Work by gravity on projectile', setup: 'Projectile follows parabolic path. Work done by gravity?', contextKeywords: ['projectile', 'gravity work', 'height change', 'parabolic'] },
    ],
    solvingPaths: [
      { id: 'SP_W_01', label: 'Direct W = F·d·cosθ', steps: ['Identify F, d, θ', 'Apply W = Fd cosθ', 'Substitute'], formulaUsed: ['W = Fd cosθ'], targetQuantity: 'Work done' },
      { id: 'SP_W_02', label: 'Variable force integration', steps: ['Write F(x)', 'Integrate ∫F dx from x₁ to x₂', 'Evaluate definite integral'], formulaUsed: ['W = ∫F(x)dx'], targetQuantity: 'Work by variable force' },
      { id: 'SP_W_03', label: 'Area under F-x graph', steps: ['Identify graph shape', 'Compute geometric area (triangle/rect/trap)', 'Area = work'], formulaUsed: ['W = area under F-x'], targetQuantity: 'Work from graph' },
      { id: 'SP_W_04', label: 'Spring work via ½kx²', steps: ['Identify k and x₁, x₂', 'W_spring = ½k(x₂² - x₁²)', 'Or W = -ΔPE_spring'], formulaUsed: ['W = ½k(x₂²-x₁²)'], targetQuantity: 'Work by spring force' },
      { id: 'SP_W_05', label: 'Work by gravity W=mgh', steps: ['Identify vertical displacement h', 'W_gravity = mgh (downward)', 'Negative if raised'], formulaUsed: ['W = mgh'], targetQuantity: 'Work by gravity' },
      { id: 'SP_W_06', label: 'Net work = sum of individual works', steps: ['W_1 = F₁d₁cosθ₁', 'W_2 = F₂d₂cosθ₂', 'W_net = W_1 + W_2'], formulaUsed: ['W_net = ΣW_i'], targetQuantity: 'Net work' },
      { id: 'SP_W_07', label: 'Zero work — perpendicular forces', steps: ['Identify direction of force vs motion', 'θ = 90° → cosθ = 0 → W = 0', 'State conclusion'], formulaUsed: ['W = 0 when θ=90°'], targetQuantity: 'Work = 0 verification' },
      { id: 'SP_W_08', label: 'Friction work = -μmgd', steps: ['Find normal force N', 'f = μN', 'W_friction = -fd'], formulaUsed: ['W_friction = -μmgd'], targetQuantity: 'Work by friction' },
      { id: 'SP_W_09', label: 'Work done by engine on vehicle', steps: ['Find resistance forces', 'Net force × distance OR power × time', 'W_engine = (F_drive - F_resist) × d'], formulaUsed: ['W = P×t or F×d'], targetQuantity: 'Engine work' },
      { id: 'SP_W_10', label: 'Work-energy theorem to find velocity', steps: ['Net W = ΔKE', 'W = ½mv² - ½mu²', 'Solve for v'], formulaUsed: ['W_net = ΔKE'], targetQuantity: 'Final velocity' },
      { id: 'SP_W_11', label: 'Work in lifting via W=mgh+½mv²', steps: ['W = change in PE + change in KE', '= mgh + ½mv²'], formulaUsed: ['W_total = mgh + ½mv²'], targetQuantity: 'Work to lift and accelerate' },
      { id: 'SP_W_12', label: 'Work against variable gravity', steps: ['F_grav = GMm/r²', 'W = ∫[R to nR] GMm/r² dr', 'W = GMm(1/R - 1/nR)'], formulaUsed: ['W = -ΔU_grav = GMm(1/R - 1/nR)'], targetQuantity: 'Work to escape partial gravity' },
      { id: 'SP_W_13', label: 'Work in circular motion per cycle', steps: ['Centripetal force perpendicular to velocity', 'W per revolution = 0', 'Friction does work if present'], formulaUsed: ['W_c = 0 (centripetal)'], targetQuantity: 'Work per revolution' },
      { id: 'SP_W_14', label: 'Find angle given work, force, displacement', steps: ['W = Fd cosθ given W, F, d', 'cosθ = W/(Fd)', 'θ = arccos(W/Fd)'], formulaUsed: ['θ = arccos(W/Fd)'], targetQuantity: 'Angle between force and displacement' },
      { id: 'SP_W_15', label: 'Work on incline with friction', steps: ['W_gravity along incline = mgd sinθ', 'W_friction = -μmgcosθ × d', 'Net W = mgd(sinθ - μcosθ)'], formulaUsed: ['W_net = mgd(sinθ-μcosθ)'], targetQuantity: 'Net work on incline' },
      { id: 'SP_W_16', label: 'Work by conservative vs non-conservative force', steps: ['Identify conservative (path-independent) vs non-conservative', 'Conservative: W = -ΔU', 'Non-conservative: W = ΔKE + ΔU + ΔU_noncons'], formulaUsed: ['W_nc = ΔKE + ΔPE'], targetQuantity: 'Net energy budget' },
      { id: 'SP_W_17', label: 'Work done against gravity on projectile', steps: ['Identify height gained h = u²sin²θ/2g', 'W_gravity = -mgh', 'At max height, velocity is horizontal'], formulaUsed: ['W_grav = -mgh'], targetQuantity: 'Gravity work in projectile' },
      { id: 'SP_W_18', label: 'Work-power-time relation', steps: ['P = W/t', 'W = Pt', 'Or W = F·v·t (constant F & v)'], formulaUsed: ['W = Pt = Fvt'], targetQuantity: 'Work from power and time' },
      { id: 'SP_W_19', label: 'Dot product method for angled force', steps: ['Write F⃗ = F(cosθ î + sinθ ĵ)', 'Displacement d⃗ = d î', 'W = F⃗·d⃗ = Fd cosθ'], formulaUsed: ['W = F⃗·d⃗'], targetQuantity: 'Work via dot product' },
      { id: 'SP_W_20', label: 'Work done in SHM — half vs full cycle', steps: ['Spring work over full cycle = 0 (conservative)', 'Over half cycle: W_spring = -½kA²+½kA² or = 0', 'Verify using energy storage'], formulaUsed: ['W_spring (full cycle) = 0'], targetQuantity: 'Spring work over SHM cycle' },
      { id: 'SP_W_21', label: 'Find displacement from work and force', steps: ['W = Fd cosθ given W, F, θ', 'd = W/(Fcosθ)', 'Check units'], formulaUsed: ['d = W/(Fcosθ)'], targetQuantity: 'Displacement' },
    ],
    formulaChains: [
      { id: 'FC_W_01', label: 'Constant Force Work', formula: 'W = F·d·cosθ', variables: ['F', 'd', 'θ'], compute: v => v.F * v.d * Math.cos(v.theta * Math.PI/180), generateValues: () => ({ F: 10+Math.random()*40, d: 1+Math.random()*9, theta: [0,30,45,60,90][Math.floor(Math.random()*4)] }) },
      { id: 'FC_W_02', label: 'Spring Work', formula: 'W = ½k(x₂²-x₁²)', variables: ['k', 'x1', 'x2'], compute: v => 0.5*v.k*(v.x2*v.x2-v.x1*v.x1), generateValues: () => ({ k: 100+Math.random()*400, x1: 0, x2: 0.05+Math.random()*0.15 }) },
      { id: 'FC_W_03', label: 'Gravity Work Vertical', formula: 'W = mgh', variables: ['m', 'g', 'h'], compute: v => v.m*v.g*v.h, generateValues: () => ({ m: 1+Math.random()*9, g: 10, h: 1+Math.random()*9 }) },
      { id: 'FC_W_04', label: 'Friction Work', formula: 'W_f = -μmgd', variables: ['mu', 'm', 'g', 'd'], compute: v => -v.mu*v.m*v.g*v.d, generateValues: () => ({ mu: 0.1+Math.random()*0.4, m: 2+Math.random()*8, g: 10, d: 2+Math.random()*8 }) },
      { id: 'FC_W_05', label: 'Net Work Theorem', formula: 'W_net = ΔKE = ½mv²-½mu²', variables: ['m', 'v', 'u'], compute: v => 0.5*v.m*(v.v*v.v-v.u*v.u), generateValues: () => ({ m: 2+Math.random()*8, u: 0, v: 5+Math.random()*15 }) },
      { id: 'FC_W_06', label: 'Variable Force F=kx Integration', formula: 'W = kx²/2', variables: ['k', 'x'], compute: v => v.k*v.x*v.x/2, generateValues: () => ({ k: 50+Math.random()*150, x: 0.1+Math.random()*0.4 }) },
      { id: 'FC_W_07', label: 'Work on Incline', formula: 'W = mgd(sinθ-μcosθ)', variables: ['m', 'g', 'd', 'theta', 'mu'], compute: v => v.m*v.g*v.d*(Math.sin(v.theta*Math.PI/180)-v.mu*Math.cos(v.theta*Math.PI/180)), generateValues: () => ({ m: 5, g: 10, d: 4, theta: 30, mu: 0.2 }) },
      { id: 'FC_W_08', label: 'Power Work Time', formula: 'W = Pt', variables: ['P', 't'], compute: v => v.P*v.t, generateValues: () => ({ P: 100+Math.random()*900, t: 5+Math.random()*55 }) },
      { id: 'FC_W_09', label: 'Lifting Work Total', formula: 'W = mgh + ½mv²', variables: ['m', 'g', 'h', 'v'], compute: v => v.m*v.g*v.h + 0.5*v.m*v.v*v.v, generateValues: () => ({ m: 10, g: 10, h: 5+Math.random()*15, v: 2+Math.random()*8 }) },
      { id: 'FC_W_10', label: 'Work against gravity from orbit', formula: 'W = GMm(1/R-1/nR)', variables: ['G', 'M', 'm', 'R', 'n'], compute: v => v.G*v.M*v.m*(1/v.R - 1/(v.n*v.R)), generateValues: () => ({ G: 6.67e-11, M: 6e24, m: 100, R: 6.4e6, n: 2 }) },
      { id: 'FC_W_11', label: 'Work from F-x trapezoid graph', formula: 'W = (F1+F2)/2 × d', variables: ['F1', 'F2', 'd'], compute: v => (v.F1+v.F2)/2*v.d, generateValues: () => ({ F1: 10+Math.random()*20, F2: 5+Math.random()*15, d: 2+Math.random()*8 }) },
      { id: 'FC_W_12', label: 'Work in circular motion (centripetal)', formula: 'W = 0 (F⊥v)', variables: [], compute: () => 0, generateValues: () => ({}) },
      { id: 'FC_W_13', label: 'Engine work on vehicle', formula: 'W = F_engine × d', variables: ['F', 'd'], compute: v => v.F*v.d, generateValues: () => ({ F: 500+Math.random()*2000, d: 100+Math.random()*900 }) },
      { id: 'FC_W_14', label: 'Dot product force-displacement', formula: 'W = |F||d|cosθ', variables: ['F', 'd', 'theta'], compute: v => v.F*v.d*Math.cos(v.theta*Math.PI/180), generateValues: () => ({ F: 20+Math.random()*30, d: 3+Math.random()*7, theta: [0,30,45,60,90][Math.floor(Math.random()*5)] }) },
      { id: 'FC_W_15', label: 'Work by gravity on projectile to max height', formula: 'W_gravity = -mu²sin²θ/2', variables: ['m', 'u', 'theta'], compute: v => -v.m*v.u*v.u*Math.sin(v.theta*Math.PI/180)**2/2, generateValues: () => ({ m: 0.5+Math.random()*2, u: 20+Math.random()*20, theta: 30+Math.random()*30 }) },
      { id: 'FC_W_16', label: 'Work against spring F²/2k', formula: 'W = F²/2k', variables: ['F', 'k'], compute: v => v.F*v.F/(2*v.k), generateValues: () => ({ F: 10+Math.random()*40, k: 100+Math.random()*200 }) },
    ],
    reasoningModes: ['RM_DIRECT', 'RM_REVERSE', 'RM_RATIO', 'RM_GRAPH', 'RM_CONSTRAINT', 'RM_COMPARATIVE', 'RM_CONCEPTUAL', 'RM_EXPERIMENTAL'],
  },

  // ── Gravitation: Newton's Law of Gravitation ──────────────────────────────

  "Newton's Law of Gravitation": {
    concepts: ['Universal gravitation F=GMm/r²', 'Inverse square law', 'Superposition of gravitational forces', 'G = 6.67×10⁻¹¹ Nm²/kg²', 'Comparison with Coulomb law', 'Gravitational force on Earth surface'],
    scenarios: [
      { id: 'SC_NG_01', label: 'Two masses in free space', setup: 'Masses M and m separated by r in vacuum.', contextKeywords: ['two masses', 'free space', 'force between'] },
      { id: 'SC_NG_02', label: 'Earth-Moon gravitational force', setup: 'Calculate F between Earth (M_E) and Moon (M_M).', contextKeywords: ['earth', 'moon', 'gravitational force'] },
      { id: 'SC_NG_03', label: 'Three masses on a line — net force', setup: 'Masses m₁, m₂, m₃ collinear. Net force on m₁.', contextKeywords: ['three masses', 'collinear', 'net force', 'superposition'] },
      { id: 'SC_NG_04', label: 'Masses at triangle vertices', setup: 'Equal masses m at vertices of equilateral triangle side a.', contextKeywords: ['equilateral triangle', 'vertices', 'symmetric'] },
      { id: 'SC_NG_05', label: 'Force ratio when separation doubles', setup: 'If separation doubles/halves, find new force.', contextKeywords: ['ratio', 'doubles', 'halves', 'inverse square'] },
      { id: 'SC_NG_06', label: 'Compare electric and gravitational force', setup: 'For two protons, compare F_grav and F_elec.', contextKeywords: ['proton', 'compare', 'ratio', 'gravitational vs electric'] },
      { id: 'SC_NG_07', label: 'Find separation given force', setup: 'F and masses given. Find r.', contextKeywords: ['find separation', 'distance given force', 'reverse'] },
      { id: 'SC_NG_08', label: 'Find mass given force and separation', setup: 'F and r given. Find M or m.', contextKeywords: ['find mass', 'given force', 'unknown mass'] },
      { id: 'SC_NG_09', label: 'Weight on different planets', setup: 'g_planet = GM_planet/R_planet². Find weight of 70 kg person.', contextKeywords: ['weight on mars', 'planet surface', 'surface gravity'] },
      { id: 'SC_NG_10', label: 'Gravitational constant G determination', setup: 'Cavendish experiment setup. Calculate G from measured F, m, r.', contextKeywords: ['Cavendish', 'torsion balance', 'determination of G'] },
      { id: 'SC_NG_11', label: 'Force in terms of g and R', setup: 'Express F = mgR²/(r²) using g = GM/R².', contextKeywords: ['express in terms of g', 'surface gravity', 'R of Earth'] },
      { id: 'SC_NG_12', label: 'Binary star — mutual gravitation', setup: 'Two stars orbit common center. Find period using gravity.', contextKeywords: ['binary star', 'orbit', 'common center'] },
      { id: 'SC_NG_13', label: 'Shell theorem — inside hollow sphere', setup: 'Point mass inside hollow sphere. Net gravitational force?', contextKeywords: ['shell theorem', 'inside hollow sphere', 'zero inside'] },
      { id: 'SC_NG_14', label: 'Gravitational force between extended bodies (approx)', setup: 'Two uniform rods/discs/spheres. Treat as point masses at limit.', contextKeywords: ['extended body', 'approximation', 'point mass at distance'] },
      { id: 'SC_NG_15', label: 'Apparent weight at poles vs equator', setup: 'Due to rotation, apparent weight differs at poles and equator.', contextKeywords: ['poles', 'equator', 'rotation effect', 'apparent weight'] },
      { id: 'SC_NG_16', label: 'Earth-Sun force at perihelion vs aphelion', setup: 'Earth closer at perihelion. Compare gravitational forces.', contextKeywords: ['perihelion', 'aphelion', 'orbital distance', 'force ratio'] },
    ],
    solvingPaths: [
      { id: 'SP_NG_01', label: 'Direct F = GMm/r²', steps: ['Identify M, m, r', 'Apply F = GMm/r²', 'Substitute G = 6.67×10⁻¹¹'], formulaUsed: ['F = GMm/r²'], targetQuantity: 'Gravitational force' },
      { id: 'SP_NG_02', label: 'Superposition — three masses collinear', steps: ['F₁ = GMm₁/r₁²', 'F₂ = GMm₂/r₂²', 'Net = F₁ - F₂ (if same direction) or vector sum'], formulaUsed: ['F_net = F₁ ± F₂'], targetQuantity: 'Net force on mass' },
      { id: 'SP_NG_03', label: 'Inverse square ratio', steps: ['F ∝ 1/r²', 'F₂/F₁ = (r₁/r₂)²', 'Substitute ratio'], formulaUsed: ['F₂/F₁ = (r₁/r₂)²'], targetQuantity: 'New force or ratio' },
      { id: 'SP_NG_04', label: 'g = GM/R² derivation', steps: ['At surface: mg = GMm/R²', 'Divide by m: g = GM/R²', 'Use to express F at height h: F = mg R²/(R+h)²'], formulaUsed: ['g = GM/R²', 'F = mg R²/(R+h)²'], targetQuantity: 'g or F at height' },
      { id: 'SP_NG_05', label: 'Compare with Coulomb law', steps: ['F_grav = Gm₁m₂/r²', 'F_elec = kq₁q₂/r²', 'Ratio F_elec/F_grav = kq²/(Gm²)'], formulaUsed: ['F_elec/F_grav = kq²/Gm²'], targetQuantity: 'Ratio of forces' },
      { id: 'SP_NG_06', label: 'Equilibrium of three masses', steps: ['F₁₃ = F₂₃ (net force on m₃ = 0)', 'Gm₁m₃/x² = Gm₂m₃/(d-x)²', 'Solve for x'], formulaUsed: ['m₁/x² = m₂/(d-x)²'], targetQuantity: 'Position of equilibrium' },
      { id: 'SP_NG_07', label: 'Triangle — resultant force using symmetry', steps: ['F₁₂ and F₁₃ equal for equilateral', 'Angle = 60° between them', 'F_net = F√3'], formulaUsed: ['F_net = F√3 for equilateral'], targetQuantity: 'Net force on vertex mass' },
      { id: 'SP_NG_08', label: 'Find r from F', steps: ['F = GMm/r²', 'r² = GMm/F', 'r = √(GMm/F)'], formulaUsed: ['r = √(GMm/F)'], targetQuantity: 'Separation r' },
      { id: 'SP_NG_09', label: 'Apparent weight at equator', steps: ['W_apparent = mg - mω²R cosλ (at equator: λ=0)', 'ΔW = mω²R', 'Substitute ω = 2π/T, R = 6.4×10⁶'], formulaUsed: ['W_app = m(g - ω²R)'], targetQuantity: 'Apparent weight reduction' },
      { id: 'SP_NG_10', label: 'G from Cavendish data', steps: ['F measured, m₁, m₂, r known', 'G = Fr²/(m₁m₂)'], formulaUsed: ['G = Fr²/(m₁m₂)'], targetQuantity: 'G value' },
      { id: 'SP_NG_11', label: 'Gravitational force using g_surface', steps: ['g = 9.8 m/s² at surface', 'F_at_h = mg R²/(R+h)²', 'Find force or new g at height h'], formulaUsed: ['g_h = g₀R²/(R+h)²'], targetQuantity: 'Force or g at height' },
      { id: 'SP_NG_12', label: 'Shell theorem application', steps: ['Inside uniform shell: F_inside = 0', 'Outside: F = GMm/r² (treat as point)', 'State shell theorem'], formulaUsed: ['F_inside shell = 0'], targetQuantity: 'Force inside/outside shell' },
      { id: 'SP_NG_13', label: 'Binary star orbital analysis', steps: ['Both orbit CM: r₁ + r₂ = d', 'Gravity provides centripetal: GMm/d² = mω²r₁', 'Find ω or T'], formulaUsed: ['T² = 4π²d³/G(M+m)'], targetQuantity: 'Orbital period' },
      { id: 'SP_NG_14', label: 'Weight on Mars/Moon', steps: ['g_planet = GM_planet/R_planet²', 'Substitute values', 'W = mg_planet'], formulaUsed: ['g = GM/R²', 'W = mg'], targetQuantity: 'Weight on planet' },
      { id: 'SP_NG_15', label: 'Perihelion vs aphelion force ratio', steps: ['F_peri/F_aph = (r_aph)²/(r_peri)²', 'Use known orbital data for Earth'], formulaUsed: ['F ∝ 1/r²'], targetQuantity: 'Ratio of forces at orbital extremes' },
      { id: 'SP_NG_16', label: 'Mass of Earth from g and R', steps: ['g = GM/R²', 'M = gR²/G', 'Substitute g=9.8, R=6.4×10⁶'], formulaUsed: ['M_E = gR²/G'], targetQuantity: 'Mass of Earth' },
      { id: 'SP_NG_17', label: 'N-masses at polygon vertices — net force cancels', steps: ['By symmetry, all forces from regular polygon cancel', 'Net force = 0 for equal masses at corners'], formulaUsed: ['Vector sum = 0 by symmetry'], targetQuantity: 'Net force (zero by symmetry)' },
      { id: 'SP_NG_18', label: 'Time period from gravitational orbital mechanics', steps: ['GMm/r² = mv²/r', 'v = 2πr/T', 'T² = 4π²r³/(GM)'], formulaUsed: ["Kepler's 3rd: T² ∝ r³"], targetQuantity: 'Orbital period T' },
      { id: 'SP_NG_19', label: 'Find G from measurement of F', steps: ['Measure F between known masses at known r', 'G = Fr²/(Mm)', 'Verify units'], formulaUsed: ['G = Fr²/Mm'], targetQuantity: 'Gravitational constant G' },
      { id: 'SP_NG_20', label: 'Dimensional analysis of gravitational force', steps: ['[F] = [G][M]²/[r²]', '[G] = [F][r²]/[M]² = N·m²/kg²', 'Verify'], formulaUsed: ['[G] = N·m²·kg⁻²'], targetQuantity: 'Dimensions of G' },
      { id: 'SP_NG_21', label: 'Force at center of square arrangement', steps: ['4 masses at corners of square', 'Symmetry: forces cancel in pairs', 'Net = 0'], formulaUsed: ['Symmetry cancellation'], targetQuantity: 'Net force at center' },
    ],
    formulaChains: [
      { id: 'FC_NG_01', label: 'Direct Gravitational Force', formula: 'F = GMm/r²', variables: ['G', 'M', 'm', 'r'], compute: v => v.G*v.M*v.m/(v.r*v.r), generateValues: () => ({ G: 6.67e-11, M: 2e30*(0.5+Math.random()), m: 1e24*(0.5+Math.random()), r: 1e11*(0.5+Math.random()*4) }) },
      { id: 'FC_NG_02', label: 'Surface g from G', formula: 'g = GM/R²', variables: ['G', 'M', 'R'], compute: v => v.G*v.M/(v.R*v.R), generateValues: () => ({ G: 6.67e-11, M: 6e24, R: 6.4e6 }) },
      { id: 'FC_NG_03', label: 'g at height h', formula: 'g_h = gR²/(R+h)²', variables: ['g', 'R', 'h'], compute: v => v.g*v.R*v.R/((v.R+v.h)*(v.R+v.h)), generateValues: () => ({ g: 9.8, R: 6.4e6, h: 1e5+Math.random()*9e5 }) },
      { id: 'FC_NG_04', label: 'Force ratio on separation change', formula: 'F₂/F₁ = (r₁/r₂)²', variables: ['r1', 'r2'], compute: v => (v.r1/v.r2)**2, generateValues: () => ({ r1: 1, r2: [2,3,4,0.5][Math.floor(Math.random()*4)] }) },
      { id: 'FC_NG_05', label: 'Equilibrium position', formula: 'x = d√m₁/(√m₁+√m₂)', variables: ['m1', 'm2', 'd'], compute: v => v.d*Math.sqrt(v.m1)/(Math.sqrt(v.m1)+Math.sqrt(v.m2)), generateValues: () => ({ m1: 1+Math.random()*3, m2: 4+Math.random()*5, d: 1+Math.random()*4 }) },
      { id: 'FC_NG_06', label: 'F_elec/F_grav for protons', formula: 'F_e/F_g = kq²/(Gm²)', variables: [], compute: () => (9e9*(1.6e-19)**2)/(6.67e-11*(1.67e-27)**2), generateValues: () => ({}) },
      { id: 'FC_NG_07', label: 'Mass of Earth', formula: 'M = gR²/G', variables: ['g', 'R', 'G'], compute: v => v.g*v.R*v.R/v.G, generateValues: () => ({ g: 9.8, R: 6.4e6, G: 6.67e-11 }) },
      { id: 'FC_NG_08', label: 'Binary star period', formula: 'T² = 4π²d³/G(M+m)', variables: ['d', 'G', 'M', 'm'], compute: v => Math.sqrt(4*Math.PI*Math.PI*v.d**3/(v.G*(v.M+v.m))), generateValues: () => ({ d: 1.5e11, G: 6.67e-11, M: 2e30, m: 6e24 }) },
      { id: 'FC_NG_09', label: 'Equatorial weight reduction', formula: 'ΔW = mω²R', variables: ['m', 'omega', 'R'], compute: v => v.m*v.omega*v.omega*v.R, generateValues: () => ({ m: 60+Math.random()*40, omega: 7.27e-5, R: 6.4e6 }) },
      { id: 'FC_NG_10', label: 'G from Cavendish', formula: 'G = Fr²/(Mm)', variables: ['F', 'r', 'M', 'm'], compute: v => v.F*v.r*v.r/(v.M*v.m), generateValues: () => ({ F: 6.67e-11*(1+Math.random()), r: 0.1, M: 10, m: 0.1 }) },
      { id: 'FC_NG_11', label: 'Surface weight on Mars', formula: 'W_Mars = m × g_Mars', variables: ['m', 'g_Mars'], compute: v => v.m*v.g_Mars, generateValues: () => ({ m: 50+Math.random()*50, g_Mars: 3.7 }) },
      { id: 'FC_NG_12', label: 'Force inside spherical shell', formula: 'F_inside = 0', variables: [], compute: () => 0, generateValues: () => ({}) },
      { id: 'FC_NG_13', label: 'Triangle vertex net force', formula: 'F_net = F√3', variables: ['F'], compute: v => v.F*Math.sqrt(3), generateValues: () => ({ F: 6.67e-11*(0.1+Math.random()*0.9) }) },
      { id: 'FC_NG_14', label: 'Find separation from force', formula: 'r = √(GMm/F)', variables: ['G', 'M', 'm', 'F'], compute: v => Math.sqrt(v.G*v.M*v.m/v.F), generateValues: () => ({ G: 6.67e-11, M: 6e24, m: 7.3e22, F: 2e20*(0.5+Math.random()) }) },
      { id: 'FC_NG_15', label: 'Force ratio at orbital extremes', formula: 'F_peri/F_aph = r_aph²/r_peri²', variables: ['r_peri', 'r_aph'], compute: v => (v.r_aph/v.r_peri)**2, generateValues: () => ({ r_peri: 1.47e11, r_aph: 1.52e11 }) },
      { id: 'FC_NG_16', label: 'Orbital velocity from gravity', formula: 'v = √(GM/r)', variables: ['G', 'M', 'r'], compute: v => Math.sqrt(v.G*v.M/v.r), generateValues: () => ({ G: 6.67e-11, M: 6e24, r: 6.4e6+300e3 }) },
    ],
    reasoningModes: ['RM_DIRECT', 'RM_REVERSE', 'RM_RATIO', 'RM_COMPARATIVE', 'RM_CONSTRAINT', 'RM_LIMITING', 'RM_CONCEPTUAL', 'RM_EXPERIMENTAL'],
  },

  // ── Probability ────────────────────────────────────────────────────────────

  'Basic Probability': {
    concepts: ['Classical probability P(A) = n(A)/n(S)', 'Sample space and events', 'Complementary event P(A\')', 'Impossible and certain events', 'Equally likely outcomes', 'Odds in favour and against'],
    scenarios: [
      { id: 'SC_BP_01', label: 'Coin toss (single or multiple)', setup: 'Fair coin tossed n times. Find probability of k heads.', contextKeywords: ['coin', 'toss', 'head', 'tail'] },
      { id: 'SC_BP_02', label: 'Die roll — single die', setup: 'Fair die rolled. Find P(prime/even/≥4 etc.).', contextKeywords: ['die', 'dice', 'face', 'number on die'] },
      { id: 'SC_BP_03', label: 'Card drawing from standard deck', setup: 'Card drawn from 52-card deck. P(ace/face/red etc.).', contextKeywords: ['card', 'deck', '52', 'ace', 'king', 'face card'] },
      { id: 'SC_BP_04', label: 'Ball drawing from urn', setup: 'Bag with r red, b blue balls. P(selecting red).', contextKeywords: ['bag', 'urn', 'ball', 'red', 'blue', 'draw'] },
      { id: 'SC_BP_05', label: 'Multiple dice — sum/product', setup: 'Two dice thrown. P(sum = k) or P(product > k).', contextKeywords: ['two dice', 'sum', 'product', '36 outcomes'] },
      { id: 'SC_BP_06', label: 'Letters / words arrangement', setup: 'Letters of a word arranged randomly. P(vowels together etc.).', contextKeywords: ['letters', 'word', 'arrangement', 'vowels together'] },
      { id: 'SC_BP_07', label: 'Birthday problem / coincidence', setup: 'P(at least 2 people share birthday among n people).', contextKeywords: ['birthday', 'same day', 'coincidence', 'at least one'] },
      { id: 'SC_BP_08', label: 'Playing cards — specific suits', setup: 'P(drawing spade | drawing face card of clubs etc.).', contextKeywords: ['spade', 'club', 'heart', 'diamond', 'suit'] },
      { id: 'SC_BP_09', label: 'Numbers from digit set', setup: '4-digit numbers from {1,2,3,4} without repetition. P(number is divisible by 3).', contextKeywords: ['digits', '4-digit number', 'divisible', 'without repetition'] },
      { id: 'SC_BP_10', label: 'Selection from group (committee)', setup: 'Committee of r chosen from n people. P(specific person included).', contextKeywords: ['committee', 'group', 'selected', 'chosen from'] },
      { id: 'SC_BP_11', label: 'Complementary probability approach', setup: 'P(at least one head) = 1 - P(no heads).', contextKeywords: ['at least one', '1 - P(none)', 'complement'] },
      { id: 'SC_BP_12', label: 'Equally likely vs non-equally likely outcomes', setup: 'Distinguish: coin (equally likely) vs biased die.', contextKeywords: ['equally likely', 'biased', 'classical definition'] },
      { id: 'SC_BP_13', label: 'Geometric probability (line/area)', setup: 'Point chosen randomly on line segment [0,L]. P(point in [a,b]).', contextKeywords: ['geometric probability', 'line segment', 'area', 'region'] },
      { id: 'SC_BP_14', label: 'Probability from relative frequency', setup: 'n trials, event A occurs r times. P ≈ r/n (empirical).', contextKeywords: ['experiment', 'frequency', 'relative frequency', 'empirical'] },
      { id: 'SC_BP_15', label: 'Odds in favour / against', setup: 'Find odds in favour if P(E) = p. Odds = p/(1-p).', contextKeywords: ['odds', 'in favour', 'against', 'probability to odds'] },
      { id: 'SC_BP_16', label: 'Number of favorable vs total outcomes', setup: 'Count favorable outcomes using combinatorics.', contextKeywords: ['favorable outcomes', 'total outcomes', 'counting', 'nCr'] },
    ],
    solvingPaths: [
      { id: 'SP_BP_01', label: 'Classical definition', steps: ['List/count sample space n(S)', 'Count favorable n(A)', 'P(A) = n(A)/n(S)'], formulaUsed: ['P(A) = n(A)/n(S)'], targetQuantity: 'Probability of event A' },
      { id: 'SP_BP_02', label: 'Complement method', steps: ['P(A) = 1 - P(A\')', 'Find P(none/failure)', 'Subtract from 1'], formulaUsed: ['P(A) = 1 - P(A\')'], targetQuantity: 'P(at least one)' },
      { id: 'SP_BP_03', label: 'Addition rule for mutually exclusive events', steps: ['Check: A∩B = ∅', 'P(A∪B) = P(A) + P(B)', 'No overlap allowed'], formulaUsed: ['P(A∪B) = P(A)+P(B)'], targetQuantity: 'Union probability' },
      { id: 'SP_BP_04', label: 'Addition rule for general events', steps: ['P(A∪B) = P(A)+P(B)-P(A∩B)', 'Find overlap', 'Compute union'], formulaUsed: ['P(A∪B) = P(A)+P(B)-P(A∩B)'], targetQuantity: 'Union probability' },
      { id: 'SP_BP_05', label: 'Counting via nCr/nPr', steps: ['n(A) = nCr formula', 'n(S) = total arrangements', 'P = n(A)/n(S)'], formulaUsed: ['nCr = n!/(r!(n-r)!)'], targetQuantity: 'Probability of selection event' },
      { id: 'SP_BP_06', label: 'Tree diagram method', steps: ['Draw tree of outcomes', 'List leaf probabilities', 'Sum favorable leaves'], formulaUsed: ['Tree diagram paths'], targetQuantity: 'Probability from tree' },
      { id: 'SP_BP_07', label: 'Coin/die enumeration', steps: ['List all outcomes in sample space', 'Mark favorable ones', 'P = count favorable / total'], formulaUsed: ['Classical formula'], targetQuantity: 'Basic probability' },
      { id: 'SP_BP_08', label: 'Geometric probability (length/area ratio)', steps: ['Identify favorable region (length/area)', 'Identify total region', 'P = favorable / total'], formulaUsed: ['P = length/area ratio'], targetQuantity: 'Geometric probability' },
      { id: 'SP_BP_09', label: 'Odds to probability conversion', steps: ['Odds in favour = a:b', 'P(E) = a/(a+b)', 'P(E\') = b/(a+b)'], formulaUsed: ['P = a/(a+b)'], targetQuantity: 'Probability from odds' },
      { id: 'SP_BP_10', label: 'Probability to odds conversion', steps: ['P(E) = p', 'Odds in favour = p:(1-p)', 'Simplify ratio'], formulaUsed: ['Odds = P/(1-P)'], targetQuantity: 'Odds from probability' },
      { id: 'SP_BP_11', label: 'Sample space for two dice', steps: ['Total outcomes = 6×6 = 36', 'List/count pairs (a,b) where condition holds', 'P = count/36'], formulaUsed: ['n(S) = 36'], targetQuantity: 'Dice probability' },
      { id: 'SP_BP_12', label: 'Card probability from 52-deck', steps: ['Total cards = 52', 'Count favorable (suits, face, ace)', 'P = count/52'], formulaUsed: ['P = favorable/52'], targetQuantity: 'Card drawing probability' },
      { id: 'SP_BP_13', label: 'Letter arrangement probability', steps: ['Total arrangements = n! (or n!/repetitions)', 'Favorable = arrangements with constraint', 'P = favorable/total'], formulaUsed: ['P = favorable!/n!'], targetQuantity: 'Arrangement probability' },
      { id: 'SP_BP_14', label: 'Committee/selection probability', steps: ['Total ways to select = C(n,r)', 'Favorable = C(n-k,r-k) (forcing k specific people)', 'P = C(n-k,r-k)/C(n,r)'], formulaUsed: ['P = C(n-k,r-k)/C(n,r)'], targetQuantity: 'Selection probability' },
      { id: 'SP_BP_15', label: 'Digit number divisibility probability', steps: ['Total n-digit numbers from given digits', 'Count those satisfying divisibility condition', 'P = count/total'], formulaUsed: ['Divisibility rule', 'nPr counting'], targetQuantity: 'Divisibility probability' },
      { id: 'SP_BP_16', label: 'Birthday problem via complement', steps: ['P(all different) = 365×364×...×(365-n+1)/365ⁿ', 'P(at least one match) = 1 - P(all different)', 'Compute for given n'], formulaUsed: ['P(at least shared) = 1 - P(all unique)'], targetQuantity: 'Birthday coincidence probability' },
      { id: 'SP_BP_17', label: 'Ball drawing with/without replacement', steps: ['With replacement: each draw independent', 'P(kth draw = red) = r/n (same each time)', 'Without: depends on previous draws'], formulaUsed: ['P depends on replacement'], targetQuantity: 'Ball drawing probability' },
      { id: 'SP_BP_18', label: 'Impossible and certain events', steps: ['P(impossible) = 0, P(S) = 1', 'Identify event vs universal set', 'State probability'], formulaUsed: ['P(∅) = 0, P(S) = 1'], targetQuantity: 'Boundary probability cases' },
      { id: 'SP_BP_19', label: 'Range of probability', steps: ['0 ≤ P(E) ≤ 1', 'Verify given value lies in [0,1]', 'Identify valid vs invalid probability'], formulaUsed: ['0 ≤ P ≤ 1'], targetQuantity: 'Valid probability range' },
      { id: 'SP_BP_20', label: 'Relative frequency vs theoretical probability', steps: ['Empirical: P ≈ r/n from experiment', 'Theoretical: P = n(A)/n(S)', 'As n→∞, empirical → theoretical'], formulaUsed: ['P_empirical → P_theoretical'], targetQuantity: 'Comparison of probability definitions' },
      { id: 'SP_BP_21', label: 'Find P(A) given odds', steps: ['Odds in favour a:b → P(A) = a/(a+b)', 'Odds against b:a → P(A\') = b/(a+b)', 'Answer: P(A) = a/(a+b)'], formulaUsed: ['P = odds/(1+odds)'], targetQuantity: 'Probability from given odds' },
    ],
    formulaChains: [
      { id: 'FC_BP_01', label: 'Classical Probability', formula: 'P(A) = n(A)/n(S)', variables: ['nA', 'nS'], compute: v => v.nA/v.nS, generateValues: () => { const nS=[36,52,6,8,10][Math.floor(Math.random()*5)]; return { nA: 1+Math.floor(Math.random()*(nS/2)), nS }; } },
      { id: 'FC_BP_02', label: 'Complement', formula: 'P(A\') = 1 - P(A)', variables: ['p'], compute: v => 1-v.p, generateValues: () => ({ p: Math.floor(Math.random()*9+1)/10 }) },
      { id: 'FC_BP_03', label: 'Addition ME', formula: 'P(A∪B) = P(A)+P(B)', variables: ['pA', 'pB'], compute: v => v.pA+v.pB, generateValues: () => ({ pA: (1+Math.floor(Math.random()*4))/10, pB: (1+Math.floor(Math.random()*4))/10 }) },
      { id: 'FC_BP_04', label: 'Addition General', formula: 'P(A∪B) = P(A)+P(B)-P(A∩B)', variables: ['pA', 'pB', 'pAB'], compute: v => v.pA+v.pB-v.pAB, generateValues: () => ({ pA: 0.4+Math.random()*0.2, pB: 0.3+Math.random()*0.2, pAB: 0.1+Math.random()*0.1 }) },
      { id: 'FC_BP_05', label: 'nCr selection', formula: 'nCr = n!/(r!(n-r)!)', variables: ['n', 'r'], compute: v => { let r=1; for(let i=0;i<v.r;i++){r=r*(v.n-i)/(i+1);} return Math.round(r); }, generateValues: () => ({ n: 5+Math.floor(Math.random()*8), r: 2+Math.floor(Math.random()*3) }) },
      { id: 'FC_BP_06', label: 'Dice sum probability', formula: 'P(sum=k) = favorable/36', variables: ['k'], compute: v => { const k=v.k; const c=k<=7?k-1:13-k; return c/36; }, generateValues: () => ({ k: 2+Math.floor(Math.random()*11) }) },
      { id: 'FC_BP_07', label: 'Odds to probability', formula: 'P = a/(a+b)', variables: ['a', 'b'], compute: v => v.a/(v.a+v.b), generateValues: () => ({ a: 1+Math.floor(Math.random()*4), b: 1+Math.floor(Math.random()*4) }) },
      { id: 'FC_BP_08', label: 'Card probability', formula: 'P = count/52', variables: ['count'], compute: v => v.count/52, generateValues: () => ({ count: [4,13,16,26,12][Math.floor(Math.random()*5)] }) },
      { id: 'FC_BP_09', label: 'Selection with specific people', formula: 'P = C(n-k,r-k)/C(n,r)', variables: ['n', 'k', 'r'], compute: v => { const comb = (a:number,b:number) => { if(b>a)return 0; let r2=1; for(let i=0;i<b;i++){r2=r2*(a-i)/(i+1);} return Math.round(r2); }; return comb(v.n-v.k,v.r-v.k)/comb(v.n,v.r); }, generateValues: () => ({ n: 8+Math.floor(Math.random()*4), k: 1, r: 3+Math.floor(Math.random()*2) }) },
      { id: 'FC_BP_10', label: 'At-least-one complement', formula: 'P(≥1) = 1-(1-p)ⁿ', variables: ['p', 'n'], compute: v => 1-Math.pow(1-v.p,v.n), generateValues: () => ({ p: 0.1+Math.random()*0.4, n: 2+Math.floor(Math.random()*3) }) },
      { id: 'FC_BP_11', label: 'Geometric probability', formula: 'P = favorable_length/total_length', variables: ['fav', 'total'], compute: v => v.fav/v.total, generateValues: () => { const L=10+Math.random()*10; return { fav: Math.random()*L*0.8, total: L }; } },
      { id: 'FC_BP_12', label: 'nPr arrangement', formula: 'nPr = n!/(n-r)!', variables: ['n', 'r'], compute: v => { let r2=1; for(let i=v.n;i>v.n-v.r;i--){r2*=i;} return r2; }, generateValues: () => ({ n: 5+Math.floor(Math.random()*4), r: 2+Math.floor(Math.random()*2) }) },
      { id: 'FC_BP_13', label: 'Coin k-heads probability', formula: 'P = C(n,k)/2ⁿ', variables: ['n', 'k'], compute: v => { const comb = (a:number,b:number) => { let r2=1; for(let i=0;i<b;i++){r2=r2*(a-i)/(i+1);} return Math.round(r2); }; return comb(v.n,v.k)/Math.pow(2,v.n); }, generateValues: () => ({ n: 3+Math.floor(Math.random()*3), k: 1+Math.floor(Math.random()*2) }) },
      { id: 'FC_BP_14', label: 'Ball drawing without replacement', formula: 'P = C(r,k)C(b,j)/C(r+b,k+j)', variables: ['r', 'b', 'k'], compute: v => { const comb = (a:number,b2:number) => { if(b2>a||b2<0)return 0; let r2=1; for(let i=0;i<b2;i++){r2=r2*(a-i)/(i+1);} return Math.round(r2); }; return comb(v.r,v.k)/comb(v.r+v.b,v.k); }, generateValues: () => ({ r: 4+Math.floor(Math.random()*4), b: 3+Math.floor(Math.random()*3), k: 2 }) },
      { id: 'FC_BP_15', label: 'Birthday all different', formula: 'P(unique) = 365!/((365-n)!×365ⁿ)', variables: ['n'], compute: v => { let p=1; for(let i=1;i<v.n;i++){p*=(365-i)/365;} return p; }, generateValues: () => ({ n: 10+Math.floor(Math.random()*15) }) },
      { id: 'FC_BP_16', label: 'P(divisible) from digits', formula: 'P = (sum-divisible arrangements)/(total)', variables: ['favorable', 'total'], compute: v => v.favorable/v.total, generateValues: () => ({ favorable: 8, total: 24 }) },
    ],
    reasoningModes: ['RM_DIRECT', 'RM_REVERSE', 'RM_COMPLEMENT', 'RM_COMPARATIVE', 'RM_CONCEPTUAL', 'RM_EXPERIMENTAL', 'RM_CONSTRAINT', 'RM_RATIO'],
  },
};

// ─── BLUEPRINT VALIDATOR ──────────────────────────────────────────────────────

export function validateTopicBlueprint(partial: Partial<TopicBlueprint> & { topic: string; chapter: string; subject: string }): TopicBlueprint {
  const failures: string[] = [];

  const concepts = partial.concepts || [];
  const scenarios = partial.scenarios || [];
  const formulaChains = partial.formulaChains || [];
  const solvingPaths = partial.solvingPaths || [];
  const reasoningModes = partial.reasoningModes || [];

  if (concepts.length < BLUEPRINT_REQUIREMENTS.minConcepts)
    failures.push(`concepts: ${concepts.length} < required ${BLUEPRINT_REQUIREMENTS.minConcepts}`);
  if (scenarios.length < BLUEPRINT_REQUIREMENTS.minScenarios)
    failures.push(`scenarios: ${scenarios.length} < required ${BLUEPRINT_REQUIREMENTS.minScenarios}`);
  if (formulaChains.length < BLUEPRINT_REQUIREMENTS.minFormulaChains)
    failures.push(`formula chains: ${formulaChains.length} < required ${BLUEPRINT_REQUIREMENTS.minFormulaChains}`);
  if (solvingPaths.length < BLUEPRINT_REQUIREMENTS.minSolvingPaths)
    failures.push(`solving paths: ${solvingPaths.length} < required ${BLUEPRINT_REQUIREMENTS.minSolvingPaths}`);
  if (reasoningModes.length < BLUEPRINT_REQUIREMENTS.minReasoningModes)
    failures.push(`reasoning modes: ${reasoningModes.length} < required ${BLUEPRINT_REQUIREMENTS.minReasoningModes}`);

  return {
    ...partial,
    concepts,
    scenarios,
    formulaChains,
    solvingPaths,
    reasoningModes,
    conceptCount: concepts.length,
    scenarioCount: scenarios.length,
    formulaChainCount: formulaChains.length,
    solvingPathCount: solvingPaths.length,
    reasoningModeCount: reasoningModes.length,
    blueprintReady: failures.length === 0,
    blueprintFailures: failures,
  };
}

// ─── QUALITY GATE V2 ──────────────────────────────────────────────────────────

export function runQualityGateV2(
  question: any,
  seenFingerprints: Set<string>,
  seenScenarios: Map<string, number>,
  seenPaths: Map<string, number>,
  requestedTopic: string,
  requestedChapter: string,
  requestedSubject: string,
): QualityGateResult {
  const failures: string[] = [];
  const gates = {
    topic_fidelity: true,
    formula_validation: true,
    numerical_validation: true,
    structural_fingerprint: true,
    explanation_consistency: true,
    scenario_uniqueness: true,
    solving_path_diversity: true,
    faculty_review_score: true,
  };

  // Gate 1: Topic Fidelity
  const topic = (question.topic || '').toLowerCase();
  const reqTopic = requestedTopic.toLowerCase();
  if (topic && !topic.includes(reqTopic.split(' ')[0]) && !reqTopic.includes(topic.split(' ')[0])) {
    // light check — concept-level match via question text keyword
    const combined = ((question.question_text || '') + ' ' + (question.concept || '')).toLowerCase();
    const topicKeyword = reqTopic.split(' ')[0];
    if (!combined.includes(topicKeyword)) {
      gates.topic_fidelity = false;
      failures.push(`Gate 1 FAIL: topic mismatch — stored "${topic}" vs requested "${reqTopic}"`);
    }
  }

  // Gate 2: Formula Validation
  const hasFormula = question.explanation &&
    (question.explanation.includes('=') ||
     question.explanation.includes('∫') ||
     question.explanation.includes('Σ') ||
     /[A-Za-z]\s*=\s*[A-Za-z0-9]/.test(question.explanation));
  if (!hasFormula) {
    gates.formula_validation = false;
    failures.push(`Gate 2 FAIL: no formula in explanation`);
  }

  // Gate 3: Numerical Validation
  const hasNumerical = question.question_text && /\d/.test(question.question_text);
  const hasOptions = question.options &&
    Object.values(question.options as Record<string, string>).some((v: string) => /\d/.test(v));
  if (!hasNumerical && !hasOptions) {
    gates.numerical_validation = false;
    failures.push(`Gate 3 FAIL: no numerical content in question or options`);
  }

  // Gate 4: Structural Fingerprint uniqueness
  const fp = question.structural_fingerprint || generateFingerprint(question.question_text || '');
  if (seenFingerprints.has(fp)) {
    gates.structural_fingerprint = false;
    failures.push(`Gate 4 FAIL: duplicate fingerprint "${fp.slice(0, 30)}"`);
  } else {
    seenFingerprints.add(fp);
  }

  // Gate 5: Explanation Consistency
  const explanationLength = (question.explanation || '').length;
  if (explanationLength < 80) {
    gates.explanation_consistency = false;
    failures.push(`Gate 5 FAIL: explanation too short (${explanationLength} chars < 80)`);
  }
  if ((question.explanation || '').includes('Step-by-step substitution and calculations.')) {
    gates.explanation_consistency = false;
    failures.push(`Gate 5 FAIL: boilerplate explanation`);
  }

  // Gate 6: Scenario Uniqueness (concentration check)
  const scenId = question.scenario_id || 'SC_GENERIC';
  const scenCount = (seenScenarios.get(scenId) || 0) + 1;
  seenScenarios.set(scenId, scenCount);
  const totalSoFar = Array.from(seenScenarios.values()).reduce((a, b) => a + b, 0);
  if (totalSoFar >= 50 && scenCount / totalSoFar > KPI_THRESHOLDS.maxScenarioConcentration / 100) {
    gates.scenario_uniqueness = false;
    failures.push(`Gate 6 WARN: scenario "${scenId}" concentration = ${(scenCount/totalSoFar*100).toFixed(1)}% > ${KPI_THRESHOLDS.maxScenarioConcentration}%`);
  }

  // Gate 7: Solving Path Diversity
  const pathId = question.solving_path_id || 'SP_GENERIC';
  const pathCount = (seenPaths.get(pathId) || 0) + 1;
  seenPaths.set(pathId, pathCount);
  if (totalSoFar >= 100 && pathCount / totalSoFar > KPI_THRESHOLDS.maxPathConcentration / 100) {
    gates.solving_path_diversity = false;
    failures.push(`Gate 7 WARN: path "${pathId}" concentration = ${(pathCount/totalSoFar*100).toFixed(1)}% > ${KPI_THRESHOLDS.maxPathConcentration}%`);
  }

  // Gate 8: Faculty Review Score
  const score = question.quality_score ?? question.jeeRelevanceScore ?? 0;
  if (score < KPI_THRESHOLDS.minQualityScore) {
    gates.faculty_review_score = false;
    failures.push(`Gate 8 FAIL: quality score ${score} < ${KPI_THRESHOLDS.minQualityScore}`);
  }

  const questionLength = (question.question_text || '').length;
  if (questionLength < 60) {
    gates.faculty_review_score = false;
    failures.push(`Gate 8 FAIL: question too short (${questionLength} chars)`);
  }

  const passed = Object.values(gates).every(v => v);

  return {
    question_id: question.id || question.question_id || 'unknown',
    passed,
    gates,
    failures,
    quality_score: score,
  };
}

function generateFingerprint(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/[\d.,×π°√μ]+/g, 'N')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return normalized;
}

// ─── TOPIC KPI VALIDATOR ──────────────────────────────────────────────────────

export function validateTopicKPIs(topic: string, chapter: string, subject: string, questions: any[]): TopicKPIResult {
  const failures: string[] = [];

  // Count scenario/path/formula usage
  const scenarioCounts: Record<string, number> = {};
  const formulaCounts: Record<string, number> = {};
  const pathCounts: Record<string, number> = {};

  for (const q of questions) {
    const sc = q.scenario_id || 'unknown';
    const fc = q.formula_chain_id || 'unknown';
    const pc = q.solving_path_id || 'unknown';
    scenarioCounts[sc] = (scenarioCounts[sc] || 0) + 1;
    formulaCounts[fc] = (formulaCounts[fc] || 0) + 1;
    pathCounts[pc] = (pathCounts[pc] || 0) + 1;
  }

  const n = questions.length;
  const maxScenC = n > 0 ? Math.max(...Object.values(scenarioCounts)) / n * 100 : 100;
  const maxFormC = n > 0 ? Math.max(...Object.values(formulaCounts)) / n * 100 : 100;
  const maxPathC = n > 0 ? Math.max(...Object.values(pathCounts)) / n * 100 : 100;

  const uniqueFingerprints = new Set(questions.map(q =>
    generateFingerprint(q.question_text || '')
  ));
  const templateDiversity = n > 0 ? (uniqueFingerprints.size / n) * 100 : 0;

  // Student Thinking Diversity = average of (1 - concentrations)
  const std = 100 - (maxScenC + maxFormC + maxPathC) / 3;

  if (n < KPI_THRESHOLDS.minQuestions) failures.push(`question_count: ${n} < ${KPI_THRESHOLDS.minQuestions}`);
  if (maxScenC > KPI_THRESHOLDS.maxScenarioConcentration) failures.push(`scenario_concentration: ${maxScenC.toFixed(1)}% > ${KPI_THRESHOLDS.maxScenarioConcentration}%`);
  if (maxFormC > KPI_THRESHOLDS.maxFormulaConcentration) failures.push(`formula_concentration: ${maxFormC.toFixed(1)}% > ${KPI_THRESHOLDS.maxFormulaConcentration}%`);
  if (maxPathC > KPI_THRESHOLDS.maxPathConcentration) failures.push(`path_concentration: ${maxPathC.toFixed(1)}% > ${KPI_THRESHOLDS.maxPathConcentration}%`);
  if (templateDiversity < KPI_THRESHOLDS.minTemplateDiversity) failures.push(`template_diversity: ${templateDiversity.toFixed(1)}% < ${KPI_THRESHOLDS.minTemplateDiversity}%`);
  if (std < KPI_THRESHOLDS.minStudentThinkingDiversity) failures.push(`student_thinking_diversity: ${std.toFixed(1)}% < ${KPI_THRESHOLDS.minStudentThinkingDiversity}%`);

  return {
    topic,
    chapter,
    subject,
    question_count: n,
    scenario_count: Object.keys(scenarioCounts).length,
    formula_count: Object.keys(formulaCounts).length,
    path_count: Object.keys(pathCounts).length,
    scenario_concentration: Number(maxScenC.toFixed(1)),
    formula_concentration: Number(maxFormC.toFixed(1)),
    path_concentration: Number(maxPathC.toFixed(1)),
    template_diversity_score: Number(templateDiversity.toFixed(1)),
    student_thinking_diversity: Number(std.toFixed(1)),
    passes_kpi: failures.length === 0,
    kpi_failures: failures,
  };
}

// ─── REPORT GENERATORS ───────────────────────────────────────────────────────

export function generateTopicBlueprintReport(blueprints: TopicBlueprint[]): string {
  const ready = blueprints.filter(b => b.blueprintReady).length;
  const notReady = blueprints.filter(b => !b.blueprintReady).length;

  let md = `# Topic Generation Blueprint Report\n\n`;
  md += `> Generated: ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Total Topics | ${blueprints.length} |\n`;
  md += `| Blueprint Ready | ${ready} |\n`;
  md += `| Blueprint NOT Ready | ${notReady} |\n\n`;

  if (notReady > 0) {
    md += `## ⚠️ Topics NOT Ready for Expansion\n\n`;
    for (const b of blueprints.filter(b => !b.blueprintReady)) {
      md += `### ${b.subject} / ${b.chapter} / ${b.topic}\n`;
      md += `**Failures:**\n`;
      b.blueprintFailures.forEach(f => { md += `- ${f}\n`; });
      md += `\n`;
    }
  }

  md += `## Blueprint Status by Topic\n\n`;
  md += `| Status | Subject | Chapter | Topic | Concepts | Scenarios | Formulas | Paths | Modes |\n`;
  md += `|---|---|---|---|---|---|---|---|---|\n`;
  for (const b of blueprints) {
    const icon = b.blueprintReady ? '✅' : '❌';
    md += `| ${icon} | ${b.subject} | ${b.chapter} | ${b.topic} | ${b.conceptCount} | ${b.scenarioCount} | ${b.formulaChainCount} | ${b.solvingPathCount} | ${b.reasoningModeCount} |\n`;
  }

  return md;
}

export function generateTopicDiversityDashboard(kpiResults: TopicKPIResult[]): string {
  const passing = kpiResults.filter(r => r.passes_kpi).length;
  const avgSTD = kpiResults.reduce((s, r) => s + r.student_thinking_diversity, 0) / kpiResults.length;

  let md = `# Topic Diversity Dashboard\n\n`;
  md += `> Generated: ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Topics with KPIs Passing | ${passing} / ${kpiResults.length} |\n`;
  md += `| Avg Student Thinking Diversity | ${avgSTD.toFixed(1)}% |\n`;
  md += `| Target STDS | ≥ 80% |\n\n`;

  md += `## Per-Topic KPI Results\n\n`;
  md += `| Status | Topic | Qs | Scenarios | Formulas | Paths | Scen% | Form% | Path% | STDS% |\n`;
  md += `|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of kpiResults) {
    const icon = r.passes_kpi ? '✅' : '❌';
    md += `| ${icon} | ${r.topic} | ${r.question_count} | ${r.scenario_count} | ${r.formula_count} | ${r.path_count} | ${r.scenario_concentration}% | ${r.formula_concentration}% | ${r.path_concentration}% | ${r.student_thinking_diversity}% |\n`;
  }

  return md;
}

export function generateRepositoryQualityDashboard(allGateResults: QualityGateResult[], topicName: string): string {
  const passed = allGateResults.filter(r => r.passed).length;
  const failed = allGateResults.filter(r => !r.passed).length;
  const avgScore = allGateResults.reduce((s, r) => s + r.quality_score, 0) / allGateResults.length;

  const gateCounts: Record<string, number> = {
    topic_fidelity: 0, formula_validation: 0, numerical_validation: 0,
    structural_fingerprint: 0, explanation_consistency: 0,
    scenario_uniqueness: 0, solving_path_diversity: 0, faculty_review_score: 0,
  };

  for (const r of allGateResults) {
    for (const [gate, pass] of Object.entries(r.gates)) {
      if (!pass) gateCounts[gate] = (gateCounts[gate] || 0) + 1;
    }
  }

  let md = `# Repository Quality Dashboard — ${topicName}\n\n`;
  md += `> Generated: ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Questions Generated | ${allGateResults.length} |\n`;
  md += `| Passed All Gates | ${passed} |\n`;
  md += `| Failed (rejected) | ${failed} |\n`;
  md += `| Pass Rate | ${(passed/allGateResults.length*100).toFixed(1)}% |\n`;
  md += `| Avg Quality Score | ${avgScore.toFixed(2)} |\n\n`;

  md += `## Gate Failure Summary\n\n`;
  md += `| Gate | Failures |\n|---|---|\n`;
  for (const [gate, count] of Object.entries(gateCounts)) {
    md += `| ${gate.replace(/_/g, ' ')} | ${count} |\n`;
  }

  return md;
}

export function generateCoverageGapReport(coveredTopics: string[], totalSyllabus: {topic: string; chapter: string; subject: string}[]): string {
  const uncovered = totalSyllabus.filter(t => !coveredTopics.includes(t.topic));
  const physicsGaps = uncovered.filter(t => t.subject === 'physics').length;
  const chemGaps = uncovered.filter(t => t.subject === 'chemistry').length;
  const mathsGaps = uncovered.filter(t => t.subject === 'mathematics').length;

  let md = `# Coverage Gap Report\n\n`;
  md += `> Generated: ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Total Topics in Syllabus | ${totalSyllabus.length} |\n`;
  md += `| Covered Topics | ${coveredTopics.length} |\n`;
  md += `| Gap (uncovered) | ${uncovered.length} |\n`;
  md += `| Coverage % | ${(coveredTopics.length/totalSyllabus.length*100).toFixed(1)}% |\n`;
  md += `| Physics Gaps | ${physicsGaps} |\n`;
  md += `| Chemistry Gaps | ${chemGaps} |\n`;
  md += `| Mathematics Gaps | ${mathsGaps} |\n\n`;

  md += `## Uncovered Topics\n\n`;
  md += `| Subject | Chapter | Topic |\n|---|---|---|\n`;
  for (const t of uncovered) {
    md += `| ${t.subject} | ${t.chapter} | ${t.topic} |\n`;
  }

  return md;
}

// ─── PHASE A PILOT: Run blueprint validation on 3 pilot topics ───────────────

{

  const OUT_DIR = path.join(process.cwd(), 'src/scratch/audit_output');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n' + '█'.repeat(72));
  console.log('PHASE 8.5 — REPOSITORY EXPANSION GUARDRAILS');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('█'.repeat(72));

  // Validate all defined blueprints
  console.log('\n═'.repeat(72));
  console.log('PHASE 8.5 / STEP 1 — BLUEPRINT AUDIT');
  console.log('═'.repeat(72));

  const pilotTopics = [
    "Work by constant/variable force",
    "Newton's Law of Gravitation",
    "Basic Probability",
  ];

  const blueprintResults: TopicBlueprint[] = [];
  for (const topicKey of pilotTopics) {
    const partial = TOPIC_BLUEPRINTS[topicKey];
    if (!partial) {
      console.log(`  ⚠️  No blueprint defined for: ${topicKey}`);
      continue;
    }
    const validated = validateTopicBlueprint({
      ...partial,
      topic: topicKey,
      chapter: 'N/A',
      subject: 'N/A',
    });
    blueprintResults.push(validated);

    const icon = validated.blueprintReady ? '✅' : '❌';
    console.log(`  ${icon} ${topicKey}: concepts=${validated.conceptCount} scenarios=${validated.scenarioCount} formulas=${validated.formulaChainCount} paths=${validated.solvingPathCount} modes=${validated.reasoningModeCount}`);
    if (!validated.blueprintReady) {
      validated.blueprintFailures.forEach(f => console.log(`     └── FAIL: ${f}`));
    }
  }

  const blueprintMd = generateTopicBlueprintReport(blueprintResults);
  fs.writeFileSync(path.join(OUT_DIR, 'topic_generation_blueprint.md'), blueprintMd, 'utf8');
  console.log(`\n  → Written: ${OUT_DIR}/topic_generation_blueprint.md`);

  // Simulate KPI validation (on 3 existing covered topics from production DB)
  console.log('\n═'.repeat(72));
  console.log('PHASE 8.5 / STEP 2 — KPI VALIDATION ON EXISTING DATA');
  console.log('═'.repeat(72));

  const prodPath = path.join(process.cwd(), 'src/scratch/production_questions_2000.json');
  let existingQs: any[] = [];
  try { existingQs = JSON.parse(fs.readFileSync(prodPath, 'utf8')); } catch (e) {}

  const topicsToCheck = [
    { topic: "Coulomb's Law", chapter: 'Electrostatics', subject: 'physics' },
    { topic: "Newton's Laws", chapter: 'Laws of Motion', subject: 'physics' },
    { topic: 'Motion in 1D', chapter: 'Kinematics', subject: 'physics' },
  ];

  const kpiResults: TopicKPIResult[] = [];
  for (const t of topicsToCheck) {
    const qs = existingQs.filter(q =>
      (q.topic || '').toLowerCase() === t.topic.toLowerCase() &&
      (q.subject || '').toLowerCase() === t.subject
    );
    const kpi = validateTopicKPIs(t.topic, t.chapter, t.subject, qs);
    kpiResults.push(kpi);
    const icon = kpi.passes_kpi ? '✅' : '❌';
    console.log(`  ${icon} ${t.topic}: qs=${kpi.question_count} scen%=${kpi.scenario_concentration} form%=${kpi.formula_concentration} path%=${kpi.path_concentration} STDS=${kpi.student_thinking_diversity}%`);
    if (!kpi.passes_kpi) kpi.kpi_failures.forEach(f => console.log(`     └── FAIL: ${f}`));
  }

  const diversityMd = generateTopicDiversityDashboard(kpiResults);
  fs.writeFileSync(path.join(OUT_DIR, 'topic_diversity_dashboard.md'), diversityMd, 'utf8');
  console.log(`  → Written: ${OUT_DIR}/topic_diversity_dashboard.md`);

  // Quality gate simulation on existing questions
  console.log('\n═'.repeat(72));
  console.log('PHASE 8.5 / STEP 3 — QUALITY GATE V2 SIMULATION');
  console.log('═'.repeat(72));

  const sampleQs = existingQs.filter(q => q.topic === "Coulomb's Law").slice(0, 50);
  const seenFPs = new Set<string>();
  const seenScenarios = new Map<string, number>();
  const seenPaths = new Map<string, number>();
  const gateResults: QualityGateResult[] = [];

  for (const q of sampleQs) {
    const result = runQualityGateV2(q, seenFPs, seenScenarios, seenPaths, "Coulomb's Law", 'Electrostatics', 'physics');
    gateResults.push(result);
  }

  const passed = gateResults.filter(r => r.passed).length;
  console.log(`  Quality Gate V2 on ${sampleQs.length} Coulomb's Law questions:`);
  console.log(`  Passed: ${passed}/${gateResults.length} (${(passed/gateResults.length*100).toFixed(1)}%)`);

  const qualityMd = generateRepositoryQualityDashboard(gateResults, "Coulomb's Law");
  fs.writeFileSync(path.join(OUT_DIR, 'repository_quality_dashboard.md'), qualityMd, 'utf8');
  console.log(`  → Written: ${OUT_DIR}/repository_quality_dashboard.md`);

  // Coverage gap report
  const FULL_SYLLABUS_TOPICS = [
    // Physics
    { topic: 'Motion in 1D', chapter: 'Kinematics', subject: 'physics' },
    { topic: 'Motion in 2D', chapter: 'Kinematics', subject: 'physics' },
    { topic: 'Projectile Motion', chapter: 'Kinematics', subject: 'physics' },
    { topic: 'Relative Motion', chapter: 'Kinematics', subject: 'physics' },
    { topic: 'Graphs of Motion', chapter: 'Kinematics', subject: 'physics' },
    { topic: "Newton's Laws", chapter: 'Laws of Motion', subject: 'physics' },
    { topic: 'Free Body Diagrams', chapter: 'Laws of Motion', subject: 'physics' },
    { topic: 'Friction (Static & Kinetic)', chapter: 'Laws of Motion', subject: 'physics' },
    { topic: 'Circular Motion Dynamics', chapter: 'Laws of Motion', subject: 'physics' },
    { topic: 'Pseudo Forces', chapter: 'Laws of Motion', subject: 'physics' },
    { topic: 'Constraint Relations', chapter: 'Laws of Motion', subject: 'physics' },
    { topic: 'Work by constant/variable force', chapter: 'Work, Energy & Power', subject: 'physics' },
    { topic: 'Work-Energy Theorem', chapter: 'Work, Energy & Power', subject: 'physics' },
    { topic: 'Conservation of Energy', chapter: 'Work, Energy & Power', subject: 'physics' },
    { topic: 'Potential Energy curves', chapter: 'Work, Energy & Power', subject: 'physics' },
    { topic: 'Collisions (1D & 2D)', chapter: 'Work, Energy & Power', subject: 'physics' },
    { topic: 'Power', chapter: 'Work, Energy & Power', subject: 'physics' },
    { topic: 'Moment of Inertia', chapter: 'Rotational Motion', subject: 'physics' },
    { topic: 'Parallel & Perpendicular Axis Theorems', chapter: 'Rotational Motion', subject: 'physics' },
    { topic: 'Torque & Angular Momentum', chapter: 'Rotational Motion', subject: 'physics' },
    { topic: 'Rotational Kinematics', chapter: 'Rotational Motion', subject: 'physics' },
    { topic: 'Rolling Motion', chapter: 'Rotational Motion', subject: 'physics' },
    { topic: 'Angular Impulse', chapter: 'Rotational Motion', subject: 'physics' },
    { topic: "Newton's Law of Gravitation", chapter: 'Gravitation', subject: 'physics' },
    { topic: 'Gravitational Field & Potential', chapter: 'Gravitation', subject: 'physics' },
    { topic: 'Orbital Motion', chapter: 'Gravitation', subject: 'physics' },
    { topic: 'Escape & Orbital Velocity', chapter: 'Gravitation', subject: 'physics' },
    { topic: "Kepler's Laws", chapter: 'Gravitation', subject: 'physics' },
    { topic: 'Satellites', chapter: 'Gravitation', subject: 'physics' },
    { topic: 'Simple Harmonic Motion', chapter: 'SHM & Waves', subject: 'physics' },
    { topic: 'Spring-Mass System', chapter: 'SHM & Waves', subject: 'physics' },
    { topic: 'Simple Pendulum', chapter: 'SHM & Waves', subject: 'physics' },
    { topic: 'Wave Equation', chapter: 'SHM & Waves', subject: 'physics' },
    { topic: 'Superposition', chapter: 'SHM & Waves', subject: 'physics' },
    { topic: 'Standing Waves', chapter: 'SHM & Waves', subject: 'physics' },
    { topic: 'Beats & Doppler Effect', chapter: 'SHM & Waves', subject: 'physics' },
    { topic: 'First Law of Thermodynamics', chapter: 'Thermodynamics', subject: 'physics' },
    { topic: 'Thermodynamic Processes', chapter: 'Thermodynamics', subject: 'physics' },
    { topic: 'Heat Engines', chapter: 'Thermodynamics', subject: 'physics' },
    { topic: 'Carnot Cycle', chapter: 'Thermodynamics', subject: 'physics' },
    { topic: 'Entropy', chapter: 'Thermodynamics', subject: 'physics' },
    { topic: 'Kinetic Theory of Gases', chapter: 'Thermodynamics', subject: 'physics' },
    { topic: "Coulomb's Law", chapter: 'Electrostatics', subject: 'physics' },
    { topic: 'Electric Field', chapter: 'Electrostatics', subject: 'physics' },
    { topic: "Gauss's Law", chapter: 'Electrostatics', subject: 'physics' },
    { topic: 'Electric Potential', chapter: 'Electrostatics', subject: 'physics' },
    { topic: 'Capacitors', chapter: 'Electrostatics', subject: 'physics' },
    { topic: 'Dielectrics', chapter: 'Electrostatics', subject: 'physics' },
    { topic: "Ohm's Law", chapter: 'Current Electricity', subject: 'physics' },
    { topic: 'Resistance & Resistivity', chapter: 'Current Electricity', subject: 'physics' },
    { topic: "Kirchhoff's Laws", chapter: 'Current Electricity', subject: 'physics' },
    { topic: 'RC Circuits', chapter: 'Current Electricity', subject: 'physics' },
    { topic: 'Electrical Instruments', chapter: 'Current Electricity', subject: 'physics' },
    { topic: 'Heating Effect', chapter: 'Current Electricity', subject: 'physics' },
    { topic: 'Biot-Savart Law', chapter: 'Magnetism & EMI', subject: 'physics' },
    { topic: "Ampere's Law", chapter: 'Magnetism & EMI', subject: 'physics' },
    { topic: 'Magnetic Force on Current', chapter: 'Magnetism & EMI', subject: 'physics' },
    { topic: "Faraday's Law", chapter: 'Magnetism & EMI', subject: 'physics' },
    { topic: "Lenz's Law", chapter: 'Magnetism & EMI', subject: 'physics' },
    { topic: 'Inductance', chapter: 'Magnetism & EMI', subject: 'physics' },
    { topic: 'AC Circuits', chapter: 'Magnetism & EMI', subject: 'physics' },
    { topic: 'Reflection & Mirrors', chapter: 'Optics', subject: 'physics' },
    { topic: 'Refraction & Lenses', chapter: 'Optics', subject: 'physics' },
    { topic: 'Prism & Dispersion', chapter: 'Optics', subject: 'physics' },
    { topic: 'Interference', chapter: 'Optics', subject: 'physics' },
    { topic: 'Diffraction', chapter: 'Optics', subject: 'physics' },
    { topic: 'Polarization', chapter: 'Optics', subject: 'physics' },
    { topic: 'Photoelectric Effect', chapter: 'Modern Physics', subject: 'physics' },
    { topic: 'Bohr Model', chapter: 'Modern Physics', subject: 'physics' },
    { topic: 'X-rays', chapter: 'Modern Physics', subject: 'physics' },
    { topic: 'Nuclear Physics', chapter: 'Modern Physics', subject: 'physics' },
    { topic: 'Radioactivity', chapter: 'Modern Physics', subject: 'physics' },
    { topic: 'Semiconductors', chapter: 'Modern Physics', subject: 'physics' },
    // Mathematics
    { topic: 'Roots & Nature of Roots', chapter: 'Quadratic Equations & Expressions', subject: 'mathematics' },
    { topic: 'Relation between Roots & Coefficients', chapter: 'Quadratic Equations & Expressions', subject: 'mathematics' },
    { topic: 'Quadratic Expression', chapter: 'Quadratic Equations & Expressions', subject: 'mathematics' },
    { topic: 'Common Roots', chapter: 'Quadratic Equations & Expressions', subject: 'mathematics' },
    { topic: 'Graph of Quadratic', chapter: 'Quadratic Equations & Expressions', subject: 'mathematics' },
    { topic: 'Maximum & Minimum', chapter: 'Quadratic Equations & Expressions', subject: 'mathematics' },
    { topic: 'Basic Probability', chapter: 'Probability', subject: 'mathematics' },
    { topic: 'Conditional Probability', chapter: 'Probability', subject: 'mathematics' },
    { topic: "Bayes' Theorem", chapter: 'Probability', subject: 'mathematics' },
    { topic: 'Random Variables', chapter: 'Probability', subject: 'mathematics' },
    { topic: 'Binomial Distribution', chapter: 'Probability', subject: 'mathematics' },
    { topic: 'Mean & Variance', chapter: 'Probability', subject: 'mathematics' },
    // ... would include all 212
  ];

  const coveredTopics = [...new Set(existingQs.map(q => q.topic).filter(Boolean))];
  const coverageGapMd = generateCoverageGapReport(coveredTopics, FULL_SYLLABUS_TOPICS);
  fs.writeFileSync(path.join(OUT_DIR, 'coverage_gap_report.md'), coverageGapMd, 'utf8');
  console.log(`  → Written: ${OUT_DIR}/coverage_gap_report.md`);

  // Final summary
  const readyTopics = blueprintResults.filter(b => b.blueprintReady).length;
  console.log('\n' + '═'.repeat(72));
  console.log('PHASE 8.5 GUARDRAIL STATUS');
  console.log('═'.repeat(72));
  console.log(`  Blueprint-ready pilot topics: ${readyTopics}/3`);
  console.log(`  KPI checks run: ${kpiResults.length}`);
  console.log(`  Quality Gate V2 checks: ${gateResults.length}`);
  console.log(`  Reports generated: 4`);
  if (readyTopics === 3) {
    console.log('\n  ✅ ALL 3 PILOT TOPICS BLUEPRINT-READY');
    console.log('  ✅ Guardrails operational — Phase A expansion can begin');
  } else {
    console.log('\n  ⚠️  Some pilot topics need more blueprint data');
  }
  console.log('═'.repeat(72) + '\n');
}
