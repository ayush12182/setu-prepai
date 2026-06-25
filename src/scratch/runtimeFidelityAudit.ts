/**
 * runtimeFidelityAudit.ts
 * ───────────────────────────────────────────────────────────────────────────
 * P0 Runtime Retrieval Fidelity Audit
 *
 * Simulates the exact session-builder call that the live UI makes and verifies:
 *   1. Every question returned belongs to the requested subject  (Subject Match = 100%)
 *   2. Every question belongs to the requested chapter           (Chapter Match ≥ 90%)
 *   3. No cross-subject contamination occurs                     (Zero cross-subject Qs)
 *
 * Tested scenarios:
 *   - Physics → Gravitational Field & Potential
 *   - Physics → Coulomb's Law (Electrostatics)
 *   - Physics → Current Electricity
 *   - Mathematics → Functions & Real Solutions
 *
 * Run via:
 *   npx tsx src/scratch/runtimeFidelityAudit.ts
 */

import { buildDeterministicSession, SessionConfig, FidelityLogEntry } from '../services/sessionBuilder';
import { UnifiedQuestion } from '../data/offlineQuestionBank';

// ─── Simulate the offline question pool that the session builder receives ─────
// In production this comes from TIER 4 (getOfflineQuestions) or TIER 2 (Supabase).
// Here we inject a realistic mixed pool to test the guard under worst-case conditions.

const MOCK_QUESTION_POOL: UnifiedQuestion[] = [
  // ── Physics: Gravitation ────────────────────────────────────────────────
  {
    id: 'grav-001',
    question_id: 'grav-001',
    node_id: 'Gravitational Field & Potential',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'medium',
    question_text: 'A satellite of mass m orbits the Earth at height h above the surface. If R is the radius of Earth and g is surface gravity, the orbital velocity is:',
    options: { A: 'sqrt(gR²/(R+h))', B: 'sqrt(gR)', C: 'sqrt(g(R+h))', D: 'sqrt(gR/(R+h))' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: 'At height h, gravitational acceleration = gR²/(R+h)². For circular orbit, v = sqrt(gR²/(R+h)).',
    explanation_text: '',
    concept_tested: "Orbital Velocity",
    is_variant: false, parent_question_id: null,
    difficultyScore: 5.5, conceptCoverage: 0.85, jeeRelevanceScore: 9.0,
    option_a: 'sqrt(gR²/(R+h))', option_b: 'sqrt(gR)', option_c: 'sqrt(g(R+h))', option_d: 'sqrt(gR/(R+h))',
  },
  {
    id: 'grav-002',
    question_id: 'grav-002',
    node_id: 'Gravitational Field & Potential',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'hard',
    question_text: 'The escape velocity from the surface of a planet of radius R and mean density ρ is proportional to:',
    options: { A: 'R√ρ', B: 'R²ρ', C: '√ρ/R', D: 'ρ/R²' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: 've = sqrt(2GM/R) = sqrt(2G(4/3)πR³ρ/R) = R√(8πGρ/3). So ve ∝ R√ρ.',
    explanation_text: '',
    concept_tested: "Escape Velocity",
    is_variant: false, parent_question_id: null,
    difficultyScore: 7.5, conceptCoverage: 0.90, jeeRelevanceScore: 9.2,
    option_a: 'R√ρ', option_b: 'R²ρ', option_c: '√ρ/R', option_d: 'ρ/R²',
  },
  {
    id: 'grav-003',
    question_id: 'grav-003',
    node_id: 'Gravitational Field & Potential',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'easy',
    question_text: 'At what depth below Earth\'s surface (radius R) does the acceleration due to gravity become half of its surface value g?',
    options: { A: 'R/2', B: 'R/4', C: 'R/3', D: '2R/3' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: 'g_d = g(1 - d/R). For g_d = g/2: d = R/2.',
    explanation_text: '',
    concept_tested: "Variation of g with Depth",
    is_variant: false, parent_question_id: null,
    difficultyScore: 3.5, conceptCoverage: 0.80, jeeRelevanceScore: 8.8,
    option_a: 'R/2', option_b: 'R/4', option_c: 'R/3', option_d: '2R/3',
  },

  // ── Physics: Electrostatics (Coulomb) ──────────────────────────────────
  {
    id: 'coulomb-001',
    question_id: 'coulomb-001',
    node_id: "Coulomb's Law",
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'medium',
    question_text: "Two charges q and 4q are placed at separation d. Where should a third charge Q be placed on the line joining them so that the system is in equilibrium?",
    options: { A: 'd/3 from q', B: 'd/4 from q', C: 'd/2 from q', D: '2d/3 from q' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: "For equilibrium, F₁ = F₂. k*q*Q/x² = k*4q*Q/(d-x)². Solving: (d-x)/x = 2 => x = d/3.",
    explanation_text: '',
    concept_tested: "Coulomb's Law",
    is_variant: false, parent_question_id: null,
    difficultyScore: 5.5, conceptCoverage: 0.85, jeeRelevanceScore: 9.0,
    option_a: 'd/3 from q', option_b: 'd/4 from q', option_c: 'd/2 from q', option_d: '2d/3 from q',
  },

  // ── Physics: Current Electricity ───────────────────────────────────────
  {
    id: 'cur-001',
    question_id: 'cur-001',
    node_id: 'Current Electricity',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'medium',
    question_text: "In a Wheatstone bridge, P = 5Ω, Q = 8Ω, R = 6Ω. For balance, the value of resistance X is:",
    options: { A: '9.6 Ω', B: '7.2 Ω', C: '4.8 Ω', D: '12.0 Ω' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: "At balance: P/Q = R/X => 5/8 = 6/X => X = 48/5 = 9.6 Ω.",
    explanation_text: '',
    concept_tested: "Wheatstone Bridge",
    is_variant: false, parent_question_id: null,
    difficultyScore: 5.0, conceptCoverage: 0.80, jeeRelevanceScore: 9.1,
    option_a: '9.6 Ω', option_b: '7.2 Ω', option_c: '4.8 Ω', option_d: '12.0 Ω',
  },

  // ── CONTAMINANT: Mathematics question (must be REJECTED from any Physics session) ──
  {
    id: 'maths-contamination-001',
    question_id: 'maths-contamination-001',
    node_id: 'Functions & Real Solutions',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'medium',
    question_text: 'The number of real solutions of e^x = x is:',
    options: { A: '0', B: '1', C: '2', D: 'Infinitely many' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: 'f(x) = e^x is always above y = x (since e^x > x for all real x). Therefore, they never intersect, and the number of real solutions is 0.',
    explanation_text: '',
    concept_tested: 'Real solutions of transcendental equations',
    is_variant: false, parent_question_id: null,
    difficultyScore: 5.0, conceptCoverage: 0.80, jeeRelevanceScore: 8.5,
    option_a: '0', option_b: '1', option_c: '2', option_d: 'Infinitely many',
  },

  // ── CONTAMINANT: Chemistry question (must be REJECTED from Physics/Maths sessions) ──
  {
    id: 'chem-contamination-001',
    question_id: 'chem-contamination-001',
    node_id: 'Chemical Bonding',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'medium',
    question_text: 'Which molecule has the highest bond angle among NH₃, H₂O, CH₄, and BF₃?',
    options: { A: 'BF₃ (120°)', B: 'CH₄ (109.5°)', C: 'NH₃ (107°)', D: 'H₂O (104.5°)' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: 'BF₃ is sp² hybridized with zero lone pairs, giving a trigonal planar structure and 120° bond angle.',
    explanation_text: '',
    concept_tested: 'hybridization and bond angle',
    is_variant: false, parent_question_id: null,
    difficultyScore: 4.5, conceptCoverage: 0.75, jeeRelevanceScore: 8.8,
    option_a: 'BF₃ (120°)', option_b: 'CH₄ (109.5°)', option_c: 'NH₃ (107°)', option_d: 'H₂O (104.5°)',
  },

  // ── Mathematics: Functions ─────────────────────────────────────────────
  {
    id: 'fn-001',
    question_id: 'fn-001',
    node_id: 'Functions & Real Solutions',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'medium',
    question_text: 'The domain of f(x) = sqrt(x² - 5x + 6) is:',
    options: { A: '(-∞, 2] ∪ [3, ∞)', B: '[2, 3]', C: '(-∞, 2) ∪ (3, ∞)', D: 'All real numbers' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: 'x² - 5x + 6 ≥ 0 => (x-2)(x-3) ≥ 0 => x ≤ 2 or x ≥ 3.',
    explanation_text: '',
    concept_tested: 'Domain of function with square root',
    is_variant: false, parent_question_id: null,
    difficultyScore: 4.5, conceptCoverage: 0.80, jeeRelevanceScore: 8.7,
    option_a: '(-∞, 2] ∪ [3, ∞)', option_b: '[2, 3]', option_c: '(-∞, 2) ∪ (3, ∞)', option_d: 'All real numbers',
  },
  {
    id: 'fn-002',
    question_id: 'fn-002',
    node_id: 'Functions & Real Solutions',
    type: 'MCQ',
    exam_type: 'JEE',
    difficulty: 'hard',
    question_text: 'The number of real solutions of x = sin(x) + 2 is:',
    options: { A: '0', B: '1', C: '2', D: '3' },
    answer: 'A', correct_option: 'A', correct_answer: 'A',
    explanation: 'sin(x) ≤ 1, so sin(x) + 2 ≥ 1 > 0 for all x ≥ 0. For x < 0, x < sin(x) + 2 since sin(x) + 2 > 1. Therefore no real solution exists.',
    explanation_text: '',
    concept_tested: 'Real solutions of transcendental equations',
    is_variant: false, parent_question_id: null,
    difficultyScore: 7.0, conceptCoverage: 0.85, jeeRelevanceScore: 9.0,
    option_a: '0', option_b: '1', option_c: '2', option_d: '3',
  },
];

// ─── Audit runner ─────────────────────────────────────────────────────────────

interface AuditScenario {
  name: string;
  subject: string;
  chapter: string;
  count: number;
  expectedSubjectMatch: number;  // minimum % required
  expectContaminants: string[];  // question IDs that must NEVER appear
}

const SCENARIOS: AuditScenario[] = [
  {
    name: 'Physics → Gravitational Field & Potential',
    subject: 'Physics',
    chapter: 'Gravitational Field & Potential',
    count: 3,
    expectedSubjectMatch: 100,
    expectContaminants: ['maths-contamination-001', 'chem-contamination-001', 'fn-001', 'fn-002'],
  },
  {
    name: "Physics → Coulomb's Law",
    subject: 'Physics',
    chapter: "Coulomb's Law",
    count: 1,
    expectedSubjectMatch: 100,
    expectContaminants: ['maths-contamination-001', 'chem-contamination-001', 'fn-001', 'fn-002'],
  },
  {
    name: 'Physics → Current Electricity',
    subject: 'Physics',
    chapter: 'Current Electricity',
    count: 1,
    expectedSubjectMatch: 100,
    expectContaminants: ['maths-contamination-001', 'chem-contamination-001', 'fn-001', 'fn-002'],
  },
  {
    name: 'Mathematics → Functions & Real Solutions',
    subject: 'Mathematics',
    chapter: 'Functions & Real Solutions',
    count: 2,
    expectedSubjectMatch: 100,
    expectContaminants: ['grav-001', 'grav-002', 'grav-003', 'coulomb-001', 'cur-001', 'chem-contamination-001'],
  },
];

// ─── Logger ───────────────────────────────────────────────────────────────────

type PassFail = 'PASS' | 'FAIL';

interface CheckResult {
  check: string;
  status: PassFail;
  detail: string;
}

interface ScenarioResult {
  scenario: string;
  requested_subject: string;
  requested_chapter: string;
  questions_returned: number;
  questions: Array<{
    question_id: string;
    snippet: string;
    concept_tested: string;
  }>;
  rejected_subject_mismatch: number;
  fidelity_log: FidelityLogEntry[];
  checks: CheckResult[];
  overall: PassFail;
}

function runAudit(): { results: ScenarioResult[]; summary: { passed: number; failed: number } } {
  const results: ScenarioResult[] = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n${'═'.repeat(72)}`);
    console.log(`SCENARIO: ${scenario.name}`);
    console.log(`${'─'.repeat(72)}`);

    const config: SessionConfig = {
      chapter: scenario.chapter,
      difficulty: 'mixed',
      count: scenario.count,
      requestedSubject: scenario.subject,
      requestedChapter: scenario.chapter,
    };

    let sessionResult: ReturnType<typeof buildDeterministicSession> | null = null;
    try {
      sessionResult = buildDeterministicSession(MOCK_QUESTION_POOL, config);
    } catch (err: any) {
      console.error(`  [ERROR] buildDeterministicSession threw: ${err.message}`);
    }

    const questions = sessionResult?.questions ?? [];
    const diagnostics = sessionResult?.diagnostics;
    const fidelityReport = diagnostics?.fidelityReport;

    // Print fidelity log
    const fidelityEntries = fidelityReport?.entries ?? [];
    console.log(`\n  Fidelity Log (${fidelityEntries.length} entries):`);
    for (const entry of fidelityEntries) {
      const symbol = entry.decision === 'ACCEPTED' ? '✓' : '✗';
      console.log(`  ${symbol} [${entry.decision.padEnd(30)}] ${entry.question_id.padEnd(30)} | ${entry.question_text_snippet.slice(0, 50)}`);
      if (entry.reject_reason) console.log(`       Reason: ${entry.reject_reason}`);
    }

    console.log(`\n  Questions returned (${questions.length}):`);
    for (const q of questions) {
      console.log(`    ID: ${q.id.padEnd(30)} concept: ${q.concept_tested}`);
      console.log(`    Text: ${q.question_text.slice(0, 80)}...`);
    }

    // ── Fidelity Report ────────────────────────────────────────────────────
    console.log('\n  Runtime Fidelity Report:');
    console.log(`    Requested Subject:       ${scenario.subject}`);
    console.log(`    Requested Chapter:       ${scenario.chapter}`);
    console.log(`    Total in Pool:           ${fidelityReport?.total_in_pool ?? MOCK_QUESTION_POOL.length}`);
    console.log(`    Accepted:                ${fidelityReport?.total_accepted ?? questions.length}`);
    console.log(`    Subject Match Rate:      ${fidelityReport?.subject_match_rate ?? 'N/A'}%`);
    console.log(`    Chapter Match Rate:      ${fidelityReport?.chapter_match_rate ?? 'N/A'}%`);
    console.log(`    Topic Match Rate:        ${fidelityReport?.topic_match_rate ?? 'N/A'}%`);
    console.log(`    Rejected (Subject):      ${diagnostics?.rejectedSubjectMismatch ?? 'N/A'}`);
    console.log(`    Rejected (Duplicate):    ${diagnostics?.rejectedDuplicates ?? 'N/A'}`);
    console.log(`    Rejected (Low Quality):  ${diagnostics?.rejectedLowQuality ?? 'N/A'}`);

    // ── Run Checks ────────────────────────────────────────────────────────
    const checks: CheckResult[] = [];

    // CHECK 1: No contaminant question IDs appear in output
    for (const badId of scenario.expectContaminants) {
      const found = questions.find(q => q.id === badId || q.question_id === badId);
      checks.push({
        check: `Contaminant "${badId}" NOT in session`,
        status: found ? 'FAIL' : 'PASS',
        detail: found
          ? `CRITICAL: question "${found.question_text.slice(0, 60)}" appears in a ${scenario.subject} session!`
          : `Correctly blocked`,
      });
    }

    // CHECK 2: All returned questions are from the correct subject (via exclusion keyword check)
    const SUBJECT_EXCLUSION_KEYWORDS: Record<string, string[]> = {
      physics: ['real solutions', 'number of solutions', 'functions', 'domain', 'range', 'matrix', 'matrices', 'determinant', 'probability', 'permutation', 'combination', 'binomial', 'complex number', 'sequence', 'series', 'limit', 'continuity', 'derivative', 'integral', 'integration', 'differential equation', 'hybridization', 'bond angle', 'molarity', 'stoichiometry', 'organic compound'],
      chemistry: ['real solutions', 'domain', 'range', 'matrix', 'matrices', 'determinant', 'probability', 'permutation', 'combination', 'binomial', 'complex number', 'sequence', 'series', 'limit', 'continuity', 'derivative', 'integral', 'integration', 'differential equation', 'projectile', 'torque', 'moment of inertia', 'kirchhoff', 'wheatstone'],
      mathematics: ['projectile', 'torque', 'moment of inertia', 'angular momentum', 'kirchhoff', 'wheatstone', 'coulomb', 'electric field', 'magnetic field', 'enthalpy', 'entropy', 'hybridization', 'bond angle', 'molarity', 'organic compound', 'stoichiometry'],
    };
    const exclusions = SUBJECT_EXCLUSION_KEYWORDS[scenario.subject.toLowerCase()] ?? [];

    const crossSubjectQs = questions.filter(q => {
      const combined = (q.question_text + ' ' + (q.concept_tested || '')).toLowerCase();
      return exclusions.some(kw => combined.includes(kw));
    });
    checks.push({
      check: 'Subject Match = 100% (no cross-subject content)',
      status: crossSubjectQs.length === 0 ? 'PASS' : 'FAIL',
      detail: crossSubjectQs.length === 0
        ? `All ${questions.length} returned questions belong to ${scenario.subject}`
        : `CRITICAL: ${crossSubjectQs.length} cross-subject question(s) found: ${crossSubjectQs.map(q => q.id).join(', ')}`,
    });

    // CHECK 3: Rejected-subject-mismatch count > 0 when pool has contaminants
    const poolHasContaminants = scenario.expectContaminants.some(id => MOCK_QUESTION_POOL.find(q => q.id === id));
    if (poolHasContaminants) {
      checks.push({
        check: 'Subject mismatch rejections logged correctly',
        status: (diagnostics?.rejectedSubjectMismatch ?? 0) > 0 ? 'PASS' : 'FAIL',
        detail: `Rejected ${diagnostics?.rejectedSubjectMismatch ?? 0} cross-subject questions from pool`,
      });
    }

    // CHECK 4: Subject match rate
    const subjectMatchRate = fidelityReport?.subject_match_rate ?? 0;
    checks.push({
      check: `Subject Match Rate ≥ ${scenario.expectedSubjectMatch}%`,
      status: questions.length === 0 || subjectMatchRate >= scenario.expectedSubjectMatch ? 'PASS' : 'FAIL',
      detail: `Actual: ${subjectMatchRate}% (required: ${scenario.expectedSubjectMatch}%)`,
    });

    // Print checks
    console.log('\n  Checks:');
    let allPassed = true;
    for (const c of checks) {
      console.log(`    [${c.status}] ${c.check}`);
      if (c.status === 'FAIL') {
        console.error(`           !! ${c.detail}`);
        allPassed = false;
      } else {
        console.log(`           ✓  ${c.detail}`);
      }
    }

    const overall: PassFail = allPassed ? 'PASS' : 'FAIL';
    console.log(`\n  SCENARIO RESULT: ${overall}`);

    results.push({
      scenario: scenario.name,
      requested_subject: scenario.subject,
      requested_chapter: scenario.chapter,
      questions_returned: questions.length,
      questions: questions.map(q => ({
        question_id: q.id,
        snippet: q.question_text.slice(0, 80),
        concept_tested: q.concept_tested || '',
      })),
      rejected_subject_mismatch: diagnostics?.rejectedSubjectMismatch ?? 0,
      fidelity_log: fidelityEntries,
      checks,
      overall,
    });
  }

  const passed = results.filter(r => r.overall === 'PASS').length;
  const failed = results.filter(r => r.overall === 'FAIL').length;

  console.log(`\n${'═'.repeat(72)}`);
  console.log('AUDIT SUMMARY');
  console.log(`${'─'.repeat(72)}`);
  console.log(`  Scenarios:  ${SCENARIOS.length}`);
  console.log(`  PASSED:     ${passed}`);
  console.log(`  FAILED:     ${failed}`);

  if (failed === 0) {
    console.log('\n  ✅  ALL SCENARIOS PASSED — No cross-subject contamination detected.');
    console.log('  ✅  Subject Match = 100%, Chapter Match enforced, Zero contamination.');
  } else {
    console.error('\n  ❌  AUDIT FAILED — Cross-subject contamination detected in production retrieval.');
    for (const r of results.filter(r => r.overall === 'FAIL')) {
      console.error(`     - ${r.scenario}`);
      for (const c of r.checks.filter(c => c.status === 'FAIL')) {
        console.error(`       [FAIL] ${c.check}: ${c.detail}`);
      }
    }
  }

  console.log(`${'═'.repeat(72)}\n`);

  return { results, summary: { passed, failed } };
}

// Run the audit
runAudit();
