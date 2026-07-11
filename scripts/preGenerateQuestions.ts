import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GEMINI_KEY = env.VITE_GEMINI_API_KEY;

const highPriority = [
  { subj: 'Physics', ch: 'Units & Dimensions' },
  { subj: 'Physics', ch: 'Kinematics' },
  { subj: 'Physics', ch: 'Laws of Motion' },
  { subj: 'Physics', ch: 'Work, Energy & Power' },
  { subj: 'Physics', ch: 'Rotational Motion' },
  { subj: 'Physics', ch: 'Gravitation' },
  { subj: 'Physics', ch: 'SHM & Waves' },
  { subj: 'Physics', ch: 'Thermodynamics' },
  { subj: 'Physics', ch: 'Electrostatics' },
  { subj: 'Physics', ch: 'Current Electricity' },
  { subj: 'Chemistry', ch: 'Mole Concept & Stoichiometry' },
  { subj: 'Chemistry', ch: 'Atomic Structure' },
  { subj: 'Chemistry', ch: 'Chemical Bonding' },
  { subj: 'Chemistry', ch: 'Thermodynamics & Thermochemistry' },
  { subj: 'Chemistry', ch: 'Chemical Equilibrium' },
  { subj: 'Chemistry', ch: 'Electrochemistry' },
  { subj: 'Chemistry', ch: 'GOC & Isomerism' },
  { subj: 'Maths', ch: 'Sets, Relations & Functions' },
  { subj: 'Maths', ch: 'Limits, Continuity & Differentiability' },
  { subj: 'Maths', ch: 'Differentiation' },
  { subj: 'Maths', ch: 'Integration' },
  { subj: 'Maths', ch: 'Coordinate Geometry' },
  { subj: 'Maths', ch: 'Probability' }
];

async function run() {
  console.log("Starting aggressive pre-generation for launch...");
  
  // Launch them sequentially so we don't overload Gemini instantly and get 503s
  for (const target of highPriority) {
    console.log(`⏳ Pre-generating 20 questions for: ${target.subj} -> ${target.ch}`);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({
          exam: 'JEE',
          subject: target.subj,
          chapter: target.ch,
          difficulty: 'mixed',
          count: 20 // Let's do 20 per request initially to get some base questions seeded fast
        })
      });
      
      if (!res.ok) {
        console.error(`❌ Failed for ${target.ch}: ${res.status}`);
      } else {
        console.log(`✅ Success for ${target.ch}`);
      }
    } catch (e) {
      console.error(`❌ Error for ${target.ch}: ${e}`);
    }
  }
  console.log("Pre-generation complete!");
}

run();
