import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Hardcode the user's provided API key for this run
const OPENAI_KEY = "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";

// ─── ALL CHAPTERS ───────────────────────────────────────
const ALL_CHAPTERS = [
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

function buildPrompt(chapterName: string, subject: string, topics: string[]): string {
  const topicList = topics.join(", ");
  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE (COACHING GRADE)

You are an elite senior HOD at a premier Kota coaching institute (Allen/Resonance/PW). You are generating comprehensive, mathematically rigorous classroom notes of absolute premium quality for JEE Main + Advanced.

CRITICAL LANGUAGE INSTRUCTION:
- You must write in 100% professional, academic English.
- DO NOT use Hinglish, Hindi words, or conversational slang.

Your output MUST be a continuous text document using custom markdown block formats. Do NOT wrap the entire output in JSON or markdown code blocks.
CRITICAL RULE: YOU MUST OUTPUT RAW MARKDOWN TEXT. DO NOT OUTPUT A JSON OBJECT AT THE ROOT LEVEL. The very first line of your output MUST be exactly [METADATA].

REQUIRED METADATA BLOCK (Must be the very first thing):
[METADATA]
chapter_slug: ${chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
chapter_name: ${chapterName}
subject: ${subject}
topic_tree: ${topicList}
[/METADATA]

# ${chapterName} — Complete Master Notes
PrepEntrance ${subject} | JEE Main + Advanced | Class 11/12 • Droppers

Generate the following 15 sections in this EXACT order with exact ## headings. Make the content extremely detailed, comprehensive, and rich—this should feel like a full 40-page textbook chapter.

## 1. Chapter Overview
### Why ${chapterName} matters
1-paragraph explanation. Bulleted list connecting to 4-5 later chapters. Include:
[TEACHER_SAYS]
Senior faculty strategic introduction (300-500 words) — where students fail, how toppers study this topic.
[/TEACHER_SAYS]

## 2. Learning Outcomes
10-15 concrete learning outcomes.

## 3. Complete Theory
Massive theory section. Each subtopic = 4-6 pages. Include formal definitions, derivations, real-life analogies, exam observations.
Use blocks: [CONCEPT]...[/CONCEPT], [NCERT_INSIGHT]...[/NCERT_INSIGHT], [DERIVATION]...[/DERIVATION]

## 4. Concept Visualization
Interactive graph configs:
[GRAPH]
{ "graphType": "...", "title": "...", "xAxis": "...", "yAxis": "...", "equation": "...", "sliders": {...} }
[/GRAPH]

## 5. Formula Sheet
Complete formula repository. Every formula as:
[FORMULA title="Name"]
Equation
**Variables:** ...
**SI Units:** ...
**Physical Meaning:** ...
**When to use:** ...
**When NOT to use:** ...
**Memory Trick:** ...
**Common Mistake:** ...
**One Solved Example:** ...
**Related Formula:** ...
**Derivation:** ...
[/FORMULA]

## 6. Important Graphs
All critical graphs. Explain slope, area, intercepts physically.

## 7. Solved Examples
15-25 solved examples (Easy/Medium/Hard, JEE Main/Advanced/NEET).
[WORKED_EXAMPLE]
{ "question": "...", "hints": [...], "thinkTime": "...", "steps": [...], "finalAnswer": "...", "alternativeMethod": "...", "commonMistakes": [...] }
[/WORKED_EXAMPLE]

## 8. PYQ Analysis
Topic-wise frequency, difficulty distribution, repeated archetypes.

## 9. Common Mistakes
30-50 mistakes with:
[COMMON_MISTAKE]
Mistake: ...
Why: ...
Correct: ...
[/COMMON_MISTAKE]

## 10. Shortcuts
5-10 elite coaching shortcuts:
[JEE_TRICK]
Trick: ...
[/JEE_TRICK]

## 11. Revision Sheet
Ultra-condensed 2-page revision.

## 12. Chapter Summary
Bulleted high-level summary.

## 13. Mind Map
Text-based nested hierarchy.

## 14. Exam Tips
20-30 tactical tips.

## 15. AI Insights
Cognitive insights from student analytics.

INPUT:
  Chapter: ${chapterName}
  Subject: ${subject}
  Topics: ${topicList}
  Target Exam: JEE Main + Advanced
`;
}

async function callOpenAI(prompt: string): Promise<string> {
  const url = `https://api.openai.com/v1/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a senior HOD physics/chemistry/maths teacher." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API Error: ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text || text.length < 500) throw new Error("Response too short");
  return text;
}

async function saveToDb(chapterId: string, chapterName: string, subject: string, rawContent: string): Promise<boolean> {
  const slug = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const wordCount = rawContent.split(/\s+/).length;

  const url = `${SUPABASE_URL}/functions/v1/save-local-notes`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: "LOCAL_BULK_SCRIPT",
      chapter_id: chapterId,
      chapter_slug: slug,
      chapter_name: chapterName,
      subject: subject.toLowerCase(),
      exam_type: 'JEE',
      language: 'english',
      version: 4, // Incrementing version to override existing ones
      version_label: '4.0',
      status: 'published',
      raw_content: rawContent,
      word_count: wordCount,
      generation_model: 'gpt-4o',
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`  DB Error: ${errText.slice(0, 200)}`);
    return false;
  }
  return true;
}

async function main() {
  console.log(`\n🚀 STARTING MASSIVE GPT-4O GENERATION BATCH`);
  
  // To avoid hitting rate limits instantly or waiting 20 minutes, we run in chunks of 5
  const chunkSize = 5;
  for (let i = 0; i < ALL_CHAPTERS.length; i += chunkSize) {
    const chunk = ALL_CHAPTERS.slice(i, i + chunkSize);
    console.log(`\n== Processing batch ${i/chunkSize + 1} of ${Math.ceil(ALL_CHAPTERS.length/chunkSize)} ==`);
    
    await Promise.all(chunk.map(async (ch) => {
      // Skipping Kinematics because it's already perfect, no need to burn tokens!
      if (ch.id === 'phy-1') {
        console.log(`[SKIP] ${ch.name} (Already perfect)`);
        return;
      }
      
      console.log(`⏳ ${ch.id}: Generating ${ch.name}...`);
      try {
        const prompt = buildPrompt(ch.name, ch.subject, ch.topics);
        const rawContent = await callOpenAI(prompt);
        console.log(`📝 ${ch.id}: Generated ${rawContent.split(/\s+/).length} words. Saving to DB...`);
        
        const saved = await saveToDb(ch.id, ch.name, ch.subject, rawContent);
        if (saved) {
          console.log(`✅ ${ch.id}: ${ch.name} PUBLISHED as Version 4.0!`);
        } else {
          console.log(`❌ ${ch.id}: ${ch.name} DB SAVE FAILED`);
        }
      } catch (err: any) {
        console.error(`🚨 ${ch.id}: ${ch.name} FAILED - ${err.message}`);
      }
    }));
  }
  
  console.log(`\n🎉 BATCH GENERATION COMPLETE!`);
}

main();
