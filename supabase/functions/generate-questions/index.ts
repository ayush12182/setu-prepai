import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const PHYSICS_RULES: Record<string, { name: string; keywords: string[] }> = {
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

function getChapterFocusPrompt(chapterId: string): string {
  const cleanId = chapterId ? chapterId.toLowerCase().trim() : '';
  if (cleanId === 'phy-0') {
    return `
CHAPTER FOCUS: Units, Dimensions & Errors
- ALLOWED: SI units, derived units, dimensional formula, dimensional analysis, homogeneity principle, errors in measurement, absolute/relative/percentage error propagation, significant figures, rounding rules, least count, Vernier calipers, Screw gauge.
- STRICTLY FORBIDDEN: Do NOT generate questions testing actual motion, kinematics trajectory calculations, friction force coefficients, work-energy theorem, torque, gravitation orbits, or electrostatics. The question MUST test the *dimension/unit/measurement/error* aspect of a quantity or device, NOT the actual calculation of physical motion/dynamics.
`;
  }
  if (cleanId === 'phy-1') {
    return `
CHAPTER FOCUS: Kinematics (Motion in 1D & 2D)
- ALLOWED: Uniform and non-uniform motion, equations of motion, free fall, projectile motion, relative velocity in 1D/2D, river-boat/swimmer drift, rain-man umbrella angle, velocity-time graphs, position-time graphs, acceleration-time graphs.
- STRICTLY FORBIDDEN: Do NOT include forces, normal force, tension, friction, pulleys, work done, potential energy, momentum conservation, or torque. All motion must be pure kinematics (relationships between position, velocity, acceleration, time).
`;
  }
  if (cleanId === 'phy-2') {
    return `
CHAPTER FOCUS: Laws of Motion (NLM)
- ALLOWED: Newton's three laws of motion, free body diagrams (FBD), static and kinetic friction, pulleys, Atwood machine, block on inclined plane, pseudo forces in non-inertial frames, constraint relations, circular motion dynamics (banking of roads, centripetal force).
- STRICTLY FORBIDDEN: Do NOT generate questions testing work done, kinetic/potential energy, spring potential energy, or center of mass.
`;
  }
  if (cleanId === 'phy-3') {
    return `
CHAPTER FOCUS: Work, Energy & Power (WEP)
- ALLOWED: Work done by constant/variable force, kinetic energy, potential energy, work-energy theorem, conservative and non-conservative forces, potential energy curves (stable/unstable equilibrium), conservation of mechanical energy, elastic and inelastic collisions in 1D/2D, coefficient of restitution, power.
- STRICTLY FORBIDDEN: Do NOT test torque, angular momentum, center of mass coordinates, or rolling motion.
`;
  }
  return '';
}

function classifyQuestion(
  subject: string,
  questionText: string,
  options: string[] = [],
  explanation: string = ''
): string {
  const normSubject = subject ? subject.toLowerCase() : '';
  const fullText = [questionText, ...options, explanation].join(' ').toLowerCase();

  if (!normSubject.includes('phys')) {
    return 'unknown';
  }

  // Units check first
  const hasPhy0Keyword = PHYSICS_RULES['phy-0'].keywords.some(kw => fullText.includes(kw));
  if (hasPhy0Keyword) return 'phy-0';

  const hits: Record<string, number> = {};
  Object.keys(PHYSICS_RULES).forEach(chId => {
    if (chId === 'phy-0') return;
    let count = 0;
    PHYSICS_RULES[chId].keywords.forEach(kw => {
      let idx = fullText.indexOf(kw);
      while (idx !== -1) {
        count++;
        idx = fullText.indexOf(kw, idx + 1);
      }
    });
    hits[chId] = count;
  });

  let bestChId = 'phy-1';
  let maxHits = 0;
  Object.keys(hits).forEach(chId => {
    if (hits[chId] > maxHits) {
      maxHits = hits[chId];
      bestChId = chId;
    }
  });

  return bestChId;
}


async function generateWithGemini(prompt: string, timeoutMs: number = 8000): Promise<any[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          responseMimeType: 'application/json'
        },
      }),
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Gemini Error: ${res.status}`);
      return [];
    }

    const raw = await res.json();
    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    let cleanedText = text.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleanedText);
    return parsed.questions || [];
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[Timeout] Gemini call aborted after ${timeoutMs}ms`);
    } else {
      console.error("Gemini call failed:", err.message);
    }
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Destructure standard parameters passed by useAssessmentEngine.ts & usePracticeQuestions.ts
    const { 
      examMode,
      subject,
      chapterId,
      chapterName,
      subchapterId,
      subchapterName,
      difficulty,
      count = 10,
      excludeIds = [],
      excludeQuestionIds = []
    } = body;

    const examStr = examMode || "JEE";
    const chapterCode = chapterId || "phy-1";
    const difficultyStr = difficulty || "medium";
    const finalExcludeIds = [...excludeIds, ...excludeQuestionIds];

    if (!examStr || !subject || !chapterCode || !difficultyStr) {
      return new Response(JSON.stringify({ error: "Missing required parameters", body }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const examUpper = examStr.toUpperCase();
    let examTypes = [examUpper];
    if (examUpper === 'JEE') {
      examTypes = ['JEE_MAINS', 'JEE_ADVANCED'];
    }

    // 1. Fetch Cached Questions from Database (Cache Read: ~100ms)
    // Matches by chapter_id (code like 'phy-1') and status
    const { data: cachedQuestions, error: dbError } = await supabase
      .from('questions')
      .select('*')
      .eq('verification_status', 'APPROVED')
      .in('exam_type', examTypes)
      .eq('chapter_id', chapterCode)
      .eq('difficulty', difficultyStr.toLowerCase())
      .limit(Math.max(count * 5, 150));


    if (dbError) {
      console.warn("Error fetching from cache:", dbError.message);
    }

    let usableCache = [];
    if (cachedQuestions) {
       usableCache = cachedQuestions.filter(q => !finalExcludeIds.includes(q.question_id) && !finalExcludeIds.includes(q.id));
    }

    // Cache hit: If we have enough questions, return immediately!
    if (usableCache.length >= count) {
      const shuffled = usableCache.sort(() => 0.5 - Math.random());
      const mapped = shuffled.slice(0, count).map(q => ({
        id: q.id,
        subchapter_id: q.subchapter_id,
        chapter_id: q.chapter_id,
        subject: q.subject,
        difficulty: q.difficulty,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation,
        concept_tested: q.concept_tested,
        common_mistake: q.common_mistake,
        is_verified: q.is_verified,
        verification_status: q.verification_status,
        exam_type: q.exam_type,
        question_type: q.question_type,
        source: q.source
      }));
      
      return new Response(JSON.stringify({ questions: mapped, source: 'cache', generationMode: 'offline' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Generate Missing Questions via Gemini (No timeout if cache is empty, 8s if partial)
    const missingCount = count - usableCache.length;
    console.log(`Cache hit: ${usableCache.length}. Generating ${missingCount} new questions for ${chapterCode} (${difficultyStr})`);

    const prompt = `You are a legendary JEE/NEET exam question setter at a premium institute like Allen or Resonance in Kota.
Generate EXACTLY ${missingCount} brand new, highly rigorous multiple-choice questions for ${examStr} ${subject}.
Chapter: ${chapterName || chapterCode}
Topic/Subtopic: ${subchapterName || 'General'}
Difficulty Level: ${difficultyStr} (Easy=NCERT, Medium=Coaching Sheet, Hard=JEE Main Difficult, Very Hard=JEE Advanced/Olympiad)

${getChapterFocusPrompt(chapterCode)}

CRITICAL RULES:
1. Do not repeat standard textbook questions. Generate fresh, application-based questions.
2. Ensure mathematical rigor. Use LaTeX notation ($...$ or $$...$$) for equations.
3. Distractors (wrong options) must be realistic common mistakes made by students.

You MUST return a valid JSON object EXACTLY matching this schema. DO NOT wrap the JSON in Markdown code blocks. 
{
  "questions": [
    {
      "question": "Question text here...",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctOption": "A",
      "solution": "Step by step solution... Concept -> Approach -> Solution -> Shortcut -> Common Mistake",
      "hint": "Level 1 Hint...",
      "concept": "Specific concept tested",
      "estimatedTime": "120"
    }
  ]
}`;

    const inlineTimeout = usableCache.length === 0 ? 0 : 8000;
    const generated = await generateWithGemini(prompt, inlineTimeout);

    // 3. Transform and Insert into Supabase Cache with Classification Validation
    const validatedGenerated = generated.filter((q: any) => {
      const detected = classifyQuestion(subject, q.question, q.options, q.solution);
      if (detected !== chapterCode && subject.toLowerCase().includes('phys')) {
        console.warn(`[EDGE REJECT] Question: "${q.question.slice(0, 50)}..." | Requested Chapter: ${chapterCode} | Classified: ${detected}`);
        return false; // Reject mismatched chapter question
      }
      return true;
    });

    const dbInserts = validatedGenerated.map((q: any) => {
      return {
        subchapter_id: subchapterId || chapterCode,
        chapter_id: chapterCode,
        subject: subject,
        difficulty: difficultyStr.toLowerCase(),
        question_text: q.question,
        option_a: q.options[0] || "",
        option_b: q.options[1] || "",
        option_c: q.options[2] || "",
        option_d: q.options[3] || "",
        correct_option: q.correctOption,
        explanation: q.solution,
        concept_tested: q.concept || "General",
        verification_status: 'APPROVED',
        is_verified: true,
        exam_type: examUpper === 'JEE' ? 'JEE_MAINS' : examUpper,
        question_type: 'MCQ',
        source: 'Live AI Generator'
      };
    });

    let insertedRows = [];
    if (dbInserts.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('questions')
        .insert(dbInserts)
        .select('*');
        
      if (insertError) {
        console.error("Failed to cache questions:", insertError);
      } else if (inserted) {
        console.log(`Successfully cached ${inserted.length} new questions.`);
        insertedRows = inserted;
      }
    }

    // Combine cache and newly generated (mapped to frontend interface format)
    const formattedCache = usableCache.map(q => ({
      id: q.id,
      subchapter_id: q.subchapter_id,
      chapter_id: q.chapter_id,
      subject: q.subject,
      difficulty: q.difficulty,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake,
      is_verified: q.is_verified,
      verification_status: q.verification_status,
      exam_type: q.exam_type,
      question_type: q.question_type,
      source: q.source
    }));

    const formattedInserts = insertedRows.map(q => ({
      id: q.id,
      subchapter_id: q.subchapter_id,
      chapter_id: q.chapter_id,
      subject: q.subject,
      difficulty: q.difficulty,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake,
      is_verified: q.is_verified,
      verification_status: q.verification_status,
      exam_type: q.exam_type,
      question_type: q.question_type,
      source: q.source
    }));

    const finalQuestions = [...formattedCache, ...formattedInserts];

    return new Response(JSON.stringify({ 
      questions: finalQuestions, 
      source: formattedInserts.length > 0 ? 'ai_hybrid' : 'partial_fallback',
      generationMode: formattedInserts.length > 0 ? 'ai' : 'offline'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
