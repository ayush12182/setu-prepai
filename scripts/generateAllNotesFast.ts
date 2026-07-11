/**
 * generateAllNotesFast.ts
 * 
 * Calls the DEPLOYED generate-notes Edge Function for every chapter.
 * No local Gemini key needed — the Edge Function already has it.
 * Uses the publishable key from .env.local for auth.
 */
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}

// ─── ALL CHAPTERS ───────────────────────────────────────
const ALL_CHAPTERS = [
  // PHYSICS (12)
  { id: 'phy-1', name: 'Kinematics', subject: 'Physics', topics: ['Motion in 1D','Motion in 2D','Projectile Motion','Relative Motion','Graphs of Motion'] },
  { id: 'phy-2', name: 'Laws of Motion', subject: 'Physics', topics: ["Newton's Laws",'Free Body Diagrams','Friction','Circular Motion Dynamics','Pseudo Forces','Constraint Relations'] },
  { id: 'phy-3', name: 'Work, Energy & Power', subject: 'Physics', topics: ['Work by constant/variable force','Work-Energy Theorem','Conservation of Energy','Potential Energy curves','Collisions','Power'] },
  { id: 'phy-4', name: 'Rotational Motion', subject: 'Physics', topics: ['Moment of Inertia','Parallel & Perpendicular Axis Theorems','Torque & Angular Momentum','Rolling Motion','Angular Impulse'] },
  { id: 'phy-5', name: 'Gravitation', subject: 'Physics', topics: ["Newton's Law of Gravitation",'Gravitational Field & Potential','Orbital Motion','Escape & Orbital Velocity',"Kepler's Laws",'Satellites'] },
  { id: 'phy-6', name: 'SHM & Waves', subject: 'Physics', topics: ['Simple Harmonic Motion','Spring-Mass System','Simple Pendulum','Wave Equation','Superposition','Standing Waves','Beats & Doppler Effect'] },
  { id: 'phy-7', name: 'Thermodynamics', subject: 'Physics', topics: ['First Law of Thermodynamics','Thermodynamic Processes','Heat Engines','Carnot Cycle','Entropy','Kinetic Theory of Gases'] },
  { id: 'phy-8', name: 'Electrostatics', subject: 'Physics', topics: ["Coulomb's Law",'Electric Field',"Gauss's Law",'Electric Potential','Capacitors','Dielectrics'] },
  { id: 'phy-9', name: 'Current Electricity', subject: 'Physics', topics: ["Ohm's Law",'Resistance & Resistivity',"Kirchhoff's Laws",'RC Circuits','Electrical Instruments','Heating Effect'] },
  { id: 'phy-10', name: 'Magnetism & EMI', subject: 'Physics', topics: ['Biot-Savart Law',"Ampere's Law",'Magnetic Force on Current',"Faraday's Law","Lenz's Law",'Inductance','AC Circuits'] },
  { id: 'phy-11', name: 'Optics', subject: 'Physics', topics: ['Reflection & Mirrors','Refraction & Lenses','Prism & Dispersion','Interference','Diffraction','Polarization'] },
  { id: 'phy-12', name: 'Modern Physics', subject: 'Physics', topics: ['Photoelectric Effect','Bohr Model','X-rays','Nuclear Physics','Radioactivity','Semiconductors'] },

  // CHEMISTRY (12)
  { id: 'chem-1', name: 'Mole Concept & Stoichiometry', subject: 'Chemistry', topics: ['Mole Concept','Atomic & Molecular Mass','Percentage Composition','Empirical & Molecular Formula','Limiting Reagent','Reactions in Solutions'] },
  { id: 'chem-2', name: 'Atomic Structure', subject: 'Chemistry', topics: ['Bohr Model','Quantum Numbers','Electronic Configuration','Photoelectric Effect','de Broglie Wavelength','Heisenberg Uncertainty'] },
  { id: 'chem-3', name: 'Chemical Bonding', subject: 'Chemistry', topics: ['Lewis Structures','VSEPR Theory','Hybridization','Molecular Orbital Theory','Hydrogen Bonding','Dipole Moment'] },
  { id: 'chem-4', name: 'Thermodynamics & Thermochemistry', subject: 'Chemistry', topics: ['First Law','Enthalpy',"Hess's Law",'Bond Enthalpy','Entropy','Gibbs Free Energy'] },
  { id: 'chem-5', name: 'Chemical Equilibrium', subject: 'Chemistry', topics: ['Law of Mass Action','Equilibrium Constant',"Le Chatelier's Principle",'Ionic Equilibrium','Buffer Solutions','Solubility Product'] },
  { id: 'chem-6', name: 'Electrochemistry', subject: 'Chemistry', topics: ['Conductance','Galvanic Cells','Nernst Equation','Electrolysis',"Faraday's Laws",'Batteries & Corrosion'] },
  { id: 'chem-7', name: 'Chemical Kinetics', subject: 'Chemistry', topics: ['Rate of Reaction','Order & Molecularity','Integrated Rate Laws','Half-Life','Arrhenius Equation','Mechanism & RDS'] },
  { id: 'chem-8', name: 'GOC & Isomerism', subject: 'Chemistry', topics: ['Inductive Effect','Resonance','Hyperconjugation','Carbocation/Carbanion Stability','Structural Isomerism','Stereoisomerism'] },
  { id: 'chem-9', name: 'Hydrocarbons', subject: 'Chemistry', topics: ['Alkanes','Alkenes','Alkynes','Aromatic Compounds','Reactions & Mechanisms'] },
  { id: 'chem-10', name: 'Organic Reactions & Named Reactions', subject: 'Chemistry', topics: ['Substitution (SN1, SN2)','Elimination (E1, E2)','Addition Reactions','Named Reactions','Oxidation & Reduction','Rearrangements'] },
  { id: 'chem-11', name: 'Periodic Table & Trends', subject: 'Chemistry', topics: ['Periodic Classification','Atomic & Ionic Radii','Ionization Energy','Electron Affinity','Electronegativity','Oxidation States'] },
  { id: 'chem-12', name: 'Coordination Chemistry', subject: 'Chemistry', topics: ['Werner Theory','IUPAC Nomenclature','Isomerism','Crystal Field Theory','Color & Magnetism','Stability of Complexes'] },

  // MATHEMATICS (12)
  { id: 'math-1', name: 'Quadratic Equations & Expressions', subject: 'Maths', topics: ['Roots & Nature of Roots','Relation between Roots & Coefficients','Quadratic Expression','Common Roots','Graph of Quadratic','Maximum & Minimum'] },
  { id: 'math-2', name: 'Complex Numbers', subject: 'Maths', topics: ['Algebra of Complex Numbers','Modulus & Argument','Argand Plane',"De Moivre's Theorem",'Roots of Unity','Rotation'] },
  { id: 'math-3', name: 'Matrices & Determinants', subject: 'Maths', topics: ['Matrix Operations','Transpose & Types','Determinants','Properties of Determinants','Inverse of Matrix',"Cramer's Rule"] },
  { id: 'math-4', name: 'Permutations & Combinations', subject: 'Maths', topics: ['Fundamental Principle','Permutations','Combinations','Circular Arrangements','Distribution','Derangements'] },
  { id: 'math-5', name: 'Probability', subject: 'Maths', topics: ['Basic Probability','Conditional Probability',"Bayes' Theorem",'Random Variables','Binomial Distribution','Mean & Variance'] },
  { id: 'math-6', name: 'Limits, Continuity & Differentiability', subject: 'Maths', topics: ['Limits (Standard Forms)',"L'Hôpital's Rule",'Continuity','Types of Discontinuity','Differentiability'] },
  { id: 'math-7', name: 'Differentiation', subject: 'Maths', topics: ['First Principles','Standard Derivatives','Chain Rule','Implicit Differentiation','Parametric Differentiation','Higher Order Derivatives'] },
  { id: 'math-8', name: 'Application of Derivatives', subject: 'Maths', topics: ['Tangent & Normal','Rate of Change','Maxima & Minima','Increasing/Decreasing','Curve Sketching',"Rolle's & LMVT"] },
  { id: 'math-9', name: 'Integration', subject: 'Maths', topics: ['Indefinite Integrals','Integration Techniques','Definite Integrals','Properties of Definite Integrals','Area Under Curves','Differential Equations'] },
  { id: 'math-10', name: 'Coordinate Geometry', subject: 'Maths', topics: ['Straight Lines','Circles','Parabola','Ellipse','Hyperbola'] },
  { id: 'math-11', name: 'Vectors & 3D Geometry', subject: 'Maths', topics: ['Vector Algebra','Scalar & Vector Product','Triple Products','Lines in 3D','Planes','Sphere'] },
  { id: 'math-12', name: 'Trigonometry', subject: 'Maths', topics: ['Trigonometric Identities','Trigonometric Equations','Inverse Trigonometry','Properties of Triangles','Heights & Distances'] },
];

// ─── GENERATE ONE CHAPTER ───────────────────────────────
async function generateOneChapter(ch: typeof ALL_CHAPTERS[0]): Promise<boolean> {
  const edgeFnUrl = `${SUPABASE_URL}/functions/v1/generate-notes`;
  
  try {
    const res = await fetch(edgeFnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        chapterName: ch.name,
        chapterId: ch.id,
        subject: ch.subject,
        topics: ch.topics,
        examType: 'JEE',
        language: 'english',
      }),
    });

    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!res.ok) {
      // 409 = generation already in progress, 400 = already exists
      if (res.status === 409) {
        console.log(`⏳ [IN PROGRESS] ${ch.name} — generation already running`);
        return false;
      }
      if (res.status === 400 && json.error?.includes('already exists')) {
        console.log(`✅ [SKIP] ${ch.name} — already published`);
        return true;
      }
      console.error(`❌ [FAILED] ${ch.name} — HTTP ${res.status}: ${json.error || text.slice(0, 200)}`);
      return false;
    }

    console.log(`🎉 [SUCCESS] ${ch.name} — generated and saved!`);
    return true;
  } catch (err: any) {
    console.error(`❌ [ERROR] ${ch.name}:`, err.message);
    return false;
  }
}

// ─── MAIN ───────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 PREPENTRANCE MASS NOTES GENERATION`);
  console.log(`📚 Total chapters: ${ALL_CHAPTERS.length}`);
  console.log(`🔗 Supabase: ${SUPABASE_URL}`);
  console.log(`⏰ Started: ${new Date().toLocaleTimeString()}\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  // Process ONE at a time — Edge Function calls Gemini which is slow (~60-120s per chapter)
  for (let i = 0; i < ALL_CHAPTERS.length; i++) {
    const ch = ALL_CHAPTERS[i];
    console.log(`\n[${i + 1}/${ALL_CHAPTERS.length}] 📖 ${ch.subject} → ${ch.name}`);
    
    const ok = await generateOneChapter(ch);
    if (ok) success++;
    else failed++;

    // Small delay between requests to be safe
    if (i < ALL_CHAPTERS.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`🏁 GENERATION COMPLETE!`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⏰ Finished: ${new Date().toLocaleTimeString()}`);
  console.log(`${'═'.repeat(50)}\n`);
}

main();
