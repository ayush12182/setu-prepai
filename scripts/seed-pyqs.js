#!/usr/bin/env node
/**
 * SETU PYQ Mega Seeder — v2
 * ─────────────────────────
 * Seeds 10,000+ PYQs across JEE / NEET / CUET using chapter-level
 * batched requests with parallel workers and resume-safe dedup.
 *
 * Usage:
 *   node scripts/seed-pyqs.js                        # full 10K run
 *   node scripts/seed-pyqs.js --exam JEE             # one exam only
 *   node scripts/seed-pyqs.js --exam NEET --subject biology
 *   node scripts/seed-pyqs.js --dry-run              # plan only
 *   node scripts/seed-pyqs.js --batch-size 50        # qs per call (default 50)
 *   node scripts/seed-pyqs.js --concurrency 4        # parallel workers
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

// ─── CLI ──────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const getArg     = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const hasFlag    = (f) => args.includes(f);

const DRY_RUN     = hasFlag('--dry-run');
const FILTER_EXAM = getArg('--exam')?.toUpperCase();
const FILTER_SUB  = getArg('--subject')?.toLowerCase();
const BATCH_SIZE  = parseInt(getArg('--batch-size')  || '50',  10); // per AI call
const CONCURRENCY = parseInt(getArg('--concurrency') || '3',   10); // parallel workers
const DELAY_MS    = parseInt(getArg('--delay')       || '1500', 10);

// ─── Chapter/Topic Maps (for variety within each subject) ─────────────
const CHAPTERS = {
  // JEE PHYSICS
  'JEE:physics': [
    { id: 'jee-phy-01', name: 'Kinematics & Laws of Motion',      topic: 'Motion, Newton Laws, Friction, Circular Motion' },
    { id: 'jee-phy-02', name: 'Work, Energy & Power',              topic: 'Work-Energy Theorem, Conservation, Collisions' },
    { id: 'jee-phy-03', name: 'Rotational Motion & Gravitation',   topic: 'Torque, MOI, Angular Momentum, Satellites, Kepler' },
    { id: 'jee-phy-04', name: 'Properties of Matter & Fluids',     topic: 'Elasticity, Viscosity, Surface Tension, Bernoulli' },
    { id: 'jee-phy-05', name: 'Thermodynamics & Kinetic Theory',   topic: 'Laws of Thermodynamics, Carnot, KTG, Gas Laws' },
    { id: 'jee-phy-06', name: 'SHM & Waves',                       topic: 'Simple Harmonic Motion, Travelling waves, Standing waves, Doppler' },
    { id: 'jee-phy-07', name: 'Electrostatics & Capacitance',      topic: 'Coulomb Law, E field, Potential, Gauss Law, Capacitors' },
    { id: 'jee-phy-08', name: 'Current Electricity',               topic: 'Ohms Law, Kirchhoff, Wheatstone, RC circuits' },
    { id: 'jee-phy-09', name: 'Magnetic Effects & Magnetism',      topic: 'Biot-Savart, Ampere, Lorentz Force, EMI, AC circuits' },
    { id: 'jee-phy-10', name: 'Ray & Wave Optics',                 topic: 'Reflection, Refraction, Lens, Diffraction, Interference, YDSE' },
    { id: 'jee-phy-11', name: 'Modern Physics & Semiconductors',   topic: 'Photoelectric, Bohr Model, Radioactivity, Logic Gates, Transistors' },
  ],
  // JEE CHEMISTRY
  'JEE:chemistry': [
    { id: 'jee-che-01', name: 'Physical: Mole, Atomic Structure',  topic: 'Mole concept, Stoichiometry, Quantum numbers, Orbital shapes' },
    { id: 'jee-che-02', name: 'Physical: States of Matter & Thermo', topic: 'KMT, Real gases, Thermodynamics, Hess law, Gibbs free energy' },
    { id: 'jee-che-03', name: 'Physical: Equilibrium',             topic: 'Chemical equilibrium, Le Chatelier, Kp, Kc, Ionic equilibrium, pH' },
    { id: 'jee-che-04', name: 'Physical: Electrochemistry & Kinetics', topic: 'Galvanic cells, Nernst, Faraday, Reaction rates, Arrhenius' },
    { id: 'jee-che-05', name: 'Physical: Solutions & Surface Chemistry', topic: 'Colligative properties, Raoults law, Colloids, Adsorption' },
    { id: 'jee-che-06', name: 'Inorganic: Periodic Table & Bonding', topic: 'Periodic trends, VSEPR, VBT, MOT, Hybridization' },
    { id: 'jee-che-07', name: 'Inorganic: s, p, d, f Blocks',      topic: 'Alkali metals, Halogens, Transition metals, Coordination compounds' },
    { id: 'jee-che-08', name: 'Organic: Basics, IUPAC, Isomerism', topic: 'IUPAC nomenclature, Stereoisomerism, Inductive effect, Hyperconjugation' },
    { id: 'jee-che-09', name: 'Organic: Reactions — Substitution/Addition/Elimination', topic: 'SN1, SN2, E1, E2, EAS, NAS, Aldol, Cannizzaro' },
    { id: 'jee-che-10', name: 'Organic: Functional Groups',        topic: 'Alcohols, Carbonyl, Carboxylic acids, Amines, Polymers, Biomolecules' },
  ],
  // JEE MATHEMATICS
  'JEE:mathematics': [
    { id: 'jee-mat-01', name: 'Algebra: Quadratics, Progression, Binomial', topic: 'Quadratic equations, AP GP HP, Binomial theorem, Permutation' },
    { id: 'jee-mat-02', name: 'Algebra: Complex Numbers & Matrices',        topic: 'Complex number geometry, De Moivre, Matrices, Determinants' },
    { id: 'jee-mat-03', name: 'Trigonometry',                               topic: 'Identities, Inverse trig, Height and Distance, General solutions' },
    { id: 'jee-mat-04', name: 'Coordinate: Straight Lines & Circles',       topic: 'Line, Pair of lines, Circle, Radical axis, Family of circles' },
    { id: 'jee-mat-05', name: 'Coordinate: Conics',                         topic: 'Parabola, Ellipse, Hyperbola, Tangent, Normal, Chord of contact' },
    { id: 'jee-mat-06', name: 'Calculus: Limits, Continuity, Derivability', topic: 'L Hospital, Asymptotes, MVT, Rolle theorem, Differentiability' },
    { id: 'jee-mat-07', name: 'Calculus: Differentiation & Applications',   topic: 'Maxima minima, Monotonicity, Tangent normal, Related rates' },
    { id: 'jee-mat-08', name: 'Calculus: Integration & Area',               topic: 'Standard integrals, By parts, Definite, Area under curve, Wallis' },
    { id: 'jee-mat-09', name: 'Differential Equations & Vectors',           topic: 'ODE types, Linear DE, Dot product, Cross product, Vector triple product' },
    { id: 'jee-mat-10', name: '3D Geometry, Probability & Statistics',      topic: 'Lines in 3D, Planes, Baye theorem, Distributions, Variance' },
  ],
  // NEET PHYSICS
  'NEET:physics': [
    { id: 'neet-phy-01', name: 'Kinematics & Laws of Motion',     topic: 'Motion equations, Newtons laws, Friction, Circular motion' },
    { id: 'neet-phy-02', name: 'Work, Energy, Power & Gravitation', topic: 'Work energy, Potential energy, Satellites, Escape velocity' },
    { id: 'neet-phy-03', name: 'Properties of Matter & Thermal Physics', topic: 'Elasticity, Fluids, Thermal expansion, Calorimetry, KTG' },
    { id: 'neet-phy-04', name: 'Thermodynamics',                  topic: 'Laws, Carnot engine, Heat engines, Second law' },
    { id: 'neet-phy-05', name: 'SHM, Waves & Oscillations',       topic: 'SHM, Pendulum, Waves, Sound, Doppler effect' },
    { id: 'neet-phy-06', name: 'Ray Optics & Optical Instruments', topic: 'Mirror formula, Refraction, Lens maker, Microscope, Telescope' },
    { id: 'neet-phy-07', name: 'Wave Optics',                     topic: 'Huygen, YDSE, Interference, Diffraction, Polarization' },
    { id: 'neet-phy-08', name: 'Electrostatics & Current Electricity', topic: 'Coulomb, Electric field, Capacitors, Ohmics, Kirchhoff' },
    { id: 'neet-phy-09', name: 'Magnetic Effects & Electromagnetic Induction', topic: 'Magnetic force, Ampere, EMI, AC circuits, Transformers' },
    { id: 'neet-phy-10', name: 'Modern Physics',                  topic: 'Photoelectric, de Broglie, Bohr, Nuclear, Radioactivity, Semiconductors' },
  ],
  // NEET CHEMISTRY
  'NEET:chemistry': [
    { id: 'neet-che-01', name: 'Basic Concepts, Atomic Structure',  topic: 'Mole concept, Periodic trends, Quantum numbers, Electronic configuration' },
    { id: 'neet-che-02', name: 'Chemical Bonding & States of Matter', topic: 'VSEPR, Hybridization, H-bonding, KTG, Gas laws, Ideal gas' },
    { id: 'neet-che-03', name: 'Thermodynamics & Equilibrium',      topic: 'Delta H, Delta G, Hess law, Kp, Kc, Le Chatelier, pH' },
    { id: 'neet-che-04', name: 'Redox, Electrochemistry & Kinetics', topic: 'Oxidation state, Galvanic, Faraday, Rate law, Order, Arrhenius' },
    { id: 'neet-che-05', name: 's, p Block Elements',               topic: 'Group 1, 2, Boron family, Carbon family, Nitrogen family, Oxygen, Halogens' },
    { id: 'neet-che-06', name: 'd, f Blocks & Coordination Compounds', topic: 'Transition metals, Oxidation states, Werner theory, Isomerism, CFSE' },
    { id: 'neet-che-07', name: 'Organic: Basics & Hydrocarbons',    topic: 'IUPAC, Alkanes, Alkenes, Alkynes, Aromatic, Mechanisms' },
    { id: 'neet-che-08', name: 'Organic: Functional Groups',        topic: 'Haloalkanes, Alcohols, Ethers, Aldehydes, Ketones, Carboxylic' },
    { id: 'neet-che-09', name: 'Organic: Nitrogen Compounds & Polymers', topic: 'Amines, Diazonium, Amino acids, Proteins, Polymers, Green chem' },
    { id: 'neet-che-10', name: 'Solutions, Surface Chemistry & Biochemistry', topic: 'Colligative, Colloids, Biomolecules, Carbohydrates, Nucleic acids' },
  ],
  // NEET BIOLOGY
  'NEET:biology': [
    { id: 'neet-bio-01', name: 'Diversity: Plant Kingdom',          topic: 'Algae, Bryophytes, Pteridophytes, Gymnosperms, Angiosperms, NCERT examples' },
    { id: 'neet-bio-02', name: 'Diversity: Animal Kingdom',         topic: 'Porifera to Chordata, Classification, Characteristic features' },
    { id: 'neet-bio-03', name: 'Structural Organisation & Cell Biology', topic: 'Animal tissues, Cell organelles, Biomolecules, Cell division' },
    { id: 'neet-bio-04', name: 'Plant Physiology',                  topic: 'Transport, Mineral nutrition, Photosynthesis, Respiration, Growth' },
    { id: 'neet-bio-05', name: 'Human Physiology',                  topic: 'Digestion, Breathing, Circulation, Excretion, Locomotion, Neural, Chemical' },
    { id: 'neet-bio-06', name: 'Reproduction',                      topic: 'Flowering plants reproduction, Human reproduction, Reproductive health' },
    { id: 'neet-bio-07', name: 'Genetics & Evolution',              topic: 'Mendel, Chromosomal theory, Linkage, Mutation, Molecular basis, Evolution' },
    { id: 'neet-bio-08', name: 'Biology in Human Welfare',          topic: 'Microbes, Biotech principles, Applications, Human health, Drugs' },
    { id: 'neet-bio-09', name: 'Ecology & Environment',             topic: 'Organism environment, Populations, Community, Ecosystem, Biodiversity' },
    { id: 'neet-bio-10', name: 'Biotechnology',                     topic: 'Recombinant DNA, Gene cloning, Transgenic organisms, Ethical issues' },
  ],
  // CUET — flat subjects (fewer chapters, broader coverage needed)
  'CUET:physics':           [{ id: 'cuet-phy', name: 'CUET Physics (Class 12)', topic: 'Electrostatics, Current, Magnetism, EMI, Optics, Dual Nature, Atoms, Semiconductors' }],
  'CUET:chemistry':         [{ id: 'cuet-che', name: 'CUET Chemistry (Class 12)', topic: 'Solutions, Electrochemistry, Kinetics, d-f blocks, Coordination, Haloalkanes, Alcohols, Aldehydes, Amines, Polymers, Biomolecules' }],
  'CUET:mathematics':       [{ id: 'cuet-mat', name: 'CUET Mathematics (Class 12)', topic: 'Relations Functions, Inverse Trig, Matrices, Determinants, Continuity, Integration, Differential Equations, Vectors, 3D, LPP, Probability' }],
  'CUET:biology':           [{ id: 'cuet-bio', name: 'CUET Biology (Class 12)', topic: 'Reproduction, Genetics, Evolution, Human health, Biotechnology, Ecology' }],
  'CUET:accountancy':       [{ id: 'cuet-acc', name: 'CUET Accountancy', topic: 'Partnership, Goodwill, Company accounts, Cash flow, Ratio analysis, NPO' }],
  'CUET:business_studies':  [{ id: 'cuet-bs',  name: 'CUET Business Studies', topic: 'Management functions, Fayol, Organizing, Staffing, Marketing, Finance, Consumer protection' }],
  'CUET:economics':         [{ id: 'cuet-eco', name: 'CUET Economics', topic: 'Demand supply, PED, Market structures, National income, Money, Government budget, Balance of payments' }],
  'CUET:history':           [{ id: 'cuet-his', name: 'CUET History (Themes)', topic: 'Harappa, Vedic, Buddhism, Maurya, Bhakti, Mughals, Colonialism, Nationalism, Partition' }],
  'CUET:political_science': [{ id: 'cuet-pol', name: 'CUET Political Science', topic: 'Constitution, Fundamental Rights, Parliament, Executive, Judiciary, Federalism, Elections, IR' }],
  'CUET:geography':         [{ id: 'cuet-geo', name: 'CUET Geography', topic: 'Geomorphology, Climate, Soils, Resources, Agriculture, Industrialisation, Settlement, India geography' }],
  'CUET:psychology':        [{ id: 'cuet-psy', name: 'CUET Psychology', topic: 'Perception, Learning, Memory, Intelligence, Personality, Disorders, Therapy, Social influence' }],
  'CUET:sociology':         [{ id: 'cuet-soc', name: 'CUET Sociology', topic: 'Sociological thinkers, Social institutions, Caste, Gender, Tribals, Social change, Globalisation' }],
  'CUET:english':           [{ id: 'cuet-eng', name: 'CUET English', topic: 'Reading comprehension, Grammar, Vocabulary, Para-jumbles, Cloze test, Error identification' }],
  'CUET:general_test':      [{ id: 'cuet-gt',  name: 'CUET General Test', topic: 'Logical reasoning, Quantitative aptitude, Data interpretation, General awareness, Coding-decoding' }],
};

// ─── How many questions we want per subject  ─────────────────────────
const TARGET_PER_SUBJECT = {
  // JEE: 11 chapters × 50 = 550 target (we'll do 500 to keep 10K total tidy)
  'JEE:physics':           500,
  'JEE:chemistry':         500,
  'JEE:mathematics':       500,
  // NEET: 10 chapters × 50 = 500
  'NEET:physics':          500,
  'NEET:chemistry':        500,
  'NEET:biology':          500,
  // CUET: 14 subjects × ~500 = 7000... we need 700/subject to hit 10K... reduce to keep parity
  // 3000 JEE/NEET + 7000 CUET = 10000: 7000/14 = 500 per CUET subject
  'CUET:physics':          500,
  'CUET:chemistry':        500,
  'CUET:mathematics':      500,
  'CUET:biology':          500,
  'CUET:accountancy':      500,
  'CUET:business_studies': 500,
  'CUET:economics':        500,
  'CUET:history':          500,
  'CUET:political_science':500,
  'CUET:geography':        500,
  'CUET:psychology':       500,
  'CUET:sociology':        500,
  'CUET:english':          500,
  'CUET:general_test':     500,
};

// ─── Seed Plan (exam + subjects) ─────────────────────────────────────
const EXAMS = [
  { exam: 'JEE',  label: 'JEE Mains & Advanced', yearRange: { start: 2015, end: 2024 }, subjects: ['physics', 'chemistry', 'mathematics'] },
  { exam: 'NEET', label: 'NEET UG',               yearRange: { start: 2015, end: 2024 }, subjects: ['physics', 'chemistry', 'biology'] },
  { exam: 'CUET', label: 'CUET UG',               yearRange: { start: 2022, end: 2024 }, subjects: ['physics', 'chemistry', 'mathematics', 'biology', 'accountancy', 'business_studies', 'economics', 'history', 'political_science', 'geography', 'psychology', 'sociology', 'english', 'general_test'] },
];

// ─── Colours / helpers ─────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan   = (s) => `\x1b[36m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;
const dim    = (s) => `\x1b[2m${s}\x1b[0m`;
const pad    = (s, n) => String(s).padEnd(n, ' ');
const padS   = (s, n) => String(s).padStart(n, ' ');
const sleep  = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Shared state ─────────────────────────────────────────────────
const state = {
  totalCalls: 0,
  doneCalls:  0,
  skipped:    0,
  failed:     0,
  inserted:   0,
  errors:     [],
};

// ─── Build all individual call tasks ──────────────────────────────
function buildTasks() {
  const tasks = [];

  for (const examDef of EXAMS) {
    if (FILTER_EXAM && FILTER_EXAM !== examDef.exam) continue;

    for (const subject of examDef.subjects) {
      if (FILTER_SUB && FILTER_SUB !== subject) continue;

      const key      = `${examDef.exam}:${subject}`;
      const chapters = CHAPTERS[key] || [{ id: key, name: subject, topic: subject }];
      const target   = TARGET_PER_SUBJECT[key] || 500;

      // How many rounds per chapter to hit target
      // e.g. 10 chapters × ceil(500/10/BATCH_SIZE) calls each
      const qPerChapter = Math.ceil(target / chapters.length);
      const callsPerChapter = Math.ceil(qPerChapter / BATCH_SIZE);

      for (const chapter of chapters) {
        for (let round = 0; round < callsPerChapter; round++) {
          tasks.push({
            exam:    examDef.exam,
            label:   examDef.label,
            subject,
            chapter,
            round,
            yearRange: examDef.yearRange,
            batchSize: BATCH_SIZE,
            key,
          });
        }
      }
    }
  }

  return tasks;
}

// ─── Execute one task (one edge function call) ────────────────────
async function runTask(supabase, task) {
  const { exam, subject, chapter, round, yearRange, batchSize } = task;

  try {
    const { data, error } = await supabase.functions.invoke('generate-pyq-questions', {
      body: {
        examMode:       exam,
        subject,
        chapterId:      chapter.id,
        chapterName:    chapter.name,
        subchapterId:   `${chapter.id}-r${round}`,
        subchapterName: `${chapter.topic} (Round ${round + 1})`,
        yearRange,
        count:          batchSize,
      },
    });

    if (error) throw new Error(error.message || JSON.stringify(error));

    const inserted = data?.questions?.length || 0;
    state.inserted += inserted;
    state.doneCalls++;
    return { ok: true, inserted };
  } catch (err) {
    state.failed++;
    state.doneCalls++;
    state.errors.push(`${exam}:${subject}:${chapter.id}:r${round} — ${err.message}`);
    return { ok: false, error: err.message };
  }
}

// ─── Concurrency pool ────────────────────────────────────────────
async function runWithConcurrency(tasks, concurrency, supabase) {
  const queue = [...tasks];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;
      await runTask(supabase, task);
      printProgress(tasks.length);
      if (DELAY_MS > 0 && queue.length > 0) await sleep(DELAY_MS);
    }
  });
  await Promise.all(workers);
}

// ─── Live progress bar ───────────────────────────────────────────
let lastProgressLine = '';
function printProgress(total) {
  const done = state.doneCalls;
  const pct  = total > 0 ? Math.round((done / total) * 100) : 0;
  const fill  = Math.round(pct / 2);
  const bar   = green('█'.repeat(fill)) + dim('░'.repeat(50 - fill));
  const line  = `  [${bar}] ${padS(pct, 3)}%  ${padS(done, 4)}/${total} calls  +${state.inserted} questions  ${state.failed > 0 ? red(`${state.failed} failed`) : green('0 failed')}`;

  if (line !== lastProgressLine) {
    process.stdout.write('\r' + line);
    lastProgressLine = line;
  }
}

// ─── Summary per exam/subject ────────────────────────────────────
function printSummaryTable(tasks) {
  const grouped = {};
  for (const t of tasks) {
    const k = `${t.exam}:${t.subject}`;
    if (!grouped[k]) grouped[k] = { exam: t.exam, subject: t.subject, calls: 0, target: TARGET_PER_SUBJECT[k] || 0 };
    grouped[k].calls++;
  }

  console.log('\n\n' + dim('  ┌──────────────┬────────────────────┬────────┬──────────┐'));
  console.log(dim(           '  │ Exam         │ Subject            │ Calls  │ Target Q │'));
  console.log(dim(           '  ├──────────────┼────────────────────┼────────┼──────────┤'));
  for (const v of Object.values(grouped)) {
    console.log(
      `  │ ${pad(v.exam, 12)} │ ${pad(v.subject, 18)} │ ${pad(v.calls, 6)} │ ${pad(v.target, 8)} │`
    );
  }
  console.log(dim('  └──────────────┴────────────────────┴────────┴──────────┘'));
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const tasks    = buildTasks();
  state.totalCalls = tasks.length;

  const totalQTarget = Object.entries(TARGET_PER_SUBJECT)
    .filter(([k]) => !FILTER_EXAM || k.startsWith(FILTER_EXAM))
    .filter(([k]) => !FILTER_SUB || k.endsWith(FILTER_SUB))
    .reduce((s, [, v]) => s + v, 0);

  // ── Header ─────────────────────────────────────────────────────
  console.log('\n' + bold('══════════════════════════════════════════════════════════'));
  console.log(bold('  SETU PYQ Mega Seeder  v2'));
  console.log(bold('══════════════════════════════════════════════════════════'));
  console.log(dim(`  Supabase : ${SUPABASE_URL}`));
  console.log(dim(`  Batch    : ${BATCH_SIZE} q/call  |  Concurrency: ${CONCURRENCY}  |  Delay: ${DELAY_MS}ms`));
  if (FILTER_EXAM) console.log(yellow(`  Filter   : exam=${FILTER_EXAM}`));
  if (FILTER_SUB)  console.log(yellow(`  Filter   : subject=${FILTER_SUB}`));
  console.log('');
  console.log(`  ${bold('Total API calls:')}  ${cyan(String(tasks.length))}`);
  console.log(`  ${bold('Target questions:')} ${cyan(String(totalQTarget))}`);
  console.log(`  ${bold('Estimated time:')}   ${cyan(`~${Math.round(tasks.length * (DELAY_MS + 12000) / CONCURRENCY / 60000)} minutes`)}`);

  if (DRY_RUN) {
    console.log(yellow('\n  ⚡ DRY RUN — no requests will be made.\n'));
    printSummaryTable(tasks);
    console.log('\n');
    process.exit(0);
  }

  // ── Confirm ────────────────────────────────────────────────────
  printSummaryTable(tasks);
  console.log('\n  ' + bold('Starting seeder...') + '\n');

  // ── Run ────────────────────────────────────────────────────────
  const start = Date.now();
  await runWithConcurrency(tasks, CONCURRENCY, supabase);
  const elapsed = Math.round((Date.now() - start) / 1000);

  // ── Final report ───────────────────────────────────────────────
  console.log('\n\n' + bold('══════════════════════════════════════════════════════════'));
  console.log(bold('  Seeding Complete'));
  console.log(bold('══════════════════════════════════════════════════════════'));
  console.log(`  ${green('✓')} API calls done  : ${state.doneCalls} / ${state.totalCalls}`);
  console.log(`  ${green('+')} Questions inserted: ${bold(green(String(state.inserted)))}`);
  console.log(`  ${red('✗')} Failed calls    : ${state.failed}`);
  console.log(`  ${dim('⏱')} Elapsed         : ${Math.floor(elapsed/60)}m ${elapsed%60}s`);

  if (state.errors.length > 0) {
    console.log('\n' + red('  Errors:'));
    state.errors.slice(0, 20).forEach(e => console.log(red(`    ✗ ${e}`)));
    if (state.errors.length > 20) console.log(dim(`    ... and ${state.errors.length - 20} more`));
  }

  console.log('');
  process.exit(state.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(red('\n✗ Fatal: ' + err.message));
  process.exit(1);
});
