import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_THRESHOLD = 50; 
const TARGET_GENERATE = 200;

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
  options: Record<string, string> | string[] = [],
  explanation: string = ''
): string {
  const normSubject = subject ? subject.toLowerCase() : '';
  const optsList = Array.isArray(options) ? options : Object.values(options);
  const fullText = [questionText, ...optsList, explanation].join(' ').toLowerCase();

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


async function generateWithGemini(geminiKey: string, prompt: string, count: number, timeoutMs: number = 0): Promise<any[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const abortController = new AbortController();
  let timeoutId: number | undefined;

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      }),
      signal: abortController.signal
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Gemini Error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);
    return parsed.questions || [];
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`Gemini call timed out after ${timeoutMs}ms`);
      return [];
    }
    console.error("Gemini fetch error:", err);
    return [];
  }
}

function buildPrompt(exam: string, subject: string, chapter: string, difficulty: string, count: number, chapterId: string) {
  return `
You are an expert ${exam} examiner for ${subject}.
Generate ${count} high-quality, strictly unique ${difficulty || "medium"} difficulty multiple-choice questions for the chapter: "${chapter}".

${getChapterFocusPrompt(chapterId)}

These must be premium, coaching-level questions (like Allen/Resonance/Physics Galaxy) that test conceptual understanding and mathematical rigor, NOT just factual recall.

Return a JSON object containing an array of exactly ${count} question objects.
Each question object MUST strictly follow this JSON schema:
{
  "questions": [
    {
      "question_text": "The actual question...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_option": "A", 
      "explanation": "Detailed step-by-step solution...",
      "topic": "The specific topic within the chapter",
      "concept": "The core concept tested",
      "distractor_logic": {
        "B": "Why a student might wrongly choose B",
        "C": "Why a student might wrongly choose C",
        "D": "Why a student might wrongly choose D"
      }
    }
  ]
}

Make sure LaTeX is properly escaped (e.g., \\\\frac, \\\\sqrt, etc).
Do NOT include markdown block markers like \`\`\`json. Output ONLY raw JSON.
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { exam, subject, chapter, chapterId, difficulty, count, isBackgroundJob } = await req.json();

    if (!exam || !subject || !chapter || !count) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");

    // Capitalize subject to match Database representation (e.g., 'physics' -> 'Physics')
    const formattedSubject = subject ? (subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()) : '';

    // ==========================================
    // BACKGROUND WORKER PATH
    // ==========================================
    if (isBackgroundJob) {
      console.log(`[BACKGROUND] Generating ${count} questions for ${formattedSubject} -> ${chapter}`);
      const numWorkers = 4;
      const qsPerWorker = Math.ceil(count / numWorkers);
      const prompt = buildPrompt(exam, formattedSubject, chapter, difficulty, qsPerWorker, chapterId || "phy-1");
      
      const promises = [];
      for(let i=0; i<numWorkers; i++) {
        promises.push(generateWithGemini(geminiKey, prompt, qsPerWorker, 120000));
      }
      
      const results = await Promise.all(promises);
      const generatedQs = results.flat();
      
      console.log(`[BACKGROUND] Generated ${generatedQs.length} questions successfully.`);

      const validatedQs = generatedQs.filter((q: any) => {
        const detected = classifyQuestion(formattedSubject, q.question_text, [q.options?.A || '', q.options?.B || '', q.options?.C || '', q.options?.D || ''], q.explanation);
        if (detected !== (chapterId || "phy-1") && formattedSubject.toLowerCase().includes('phys')) {
          console.warn(`[BG REJECT] Question: "${q.question_text.slice(0, 50)}..." | Requested Chapter: ${chapterId} | Classified: ${detected}`);
          return false;
        }
        return true;
      });

      const dbInserts = validatedQs.map((q: any) => ({
        id: crypto.randomUUID(),
        exam_type: exam === 'JEE' ? 'JEE_MAINS' : exam,
        subject: formattedSubject,
        chapter_id: chapterId || "phy-1",
        chapter: chapter,
        topic: q.topic || "General",
        concept: q.concept || "",
        difficulty: (difficulty || "medium").toLowerCase(),
        question_type: "MCQ",
        question_text: q.question_text,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_option: q.correct_option,
        explanation: q.explanation,
        is_verified: false,
        verification_status: 'PENDING',
        source: "ai_generated",
        generation_model: "gemini-2.5-flash-parallel"
      }));

      if (dbInserts.length > 0) {
        await supabase.from("questions").insert(dbInserts);
      }
      return new Response(JSON.stringify({ success: true, count: generatedQs.length }), { headers: corsHeaders });
    }

    // ==========================================
    // FRONTEND REQUEST PATH
    // ==========================================
    
    // 1. Check existing questions in consolidated 'questions' table
    const examTypes = exam.toUpperCase() === 'JEE' || exam.toUpperCase() === 'JEE_MAINS'
      ? ['JEE_MAINS', 'JEE_ADVANCED', 'JEE']
      : [exam.toUpperCase()];

    let dbQuery = supabase
      .from("questions")
      .select("*")
      .in("exam_type", examTypes)
      .eq("subject", formattedSubject)
      .eq("difficulty", (difficulty || "medium").toLowerCase());

    if (chapterId) {
      dbQuery = dbQuery.eq("chapter_id", chapterId);
    } else {
      dbQuery = dbQuery.eq("chapter", chapter);
    }

    const { data: cachedQuestions, error: fetchError } = await dbQuery.limit(TARGET_GENERATE);

    if (fetchError) throw fetchError;

    // Shuffle the pool so every test run gets different questions
    const shuffledPool = (cachedQuestions || []).sort(() => Math.random() - 0.5);

    const availableCount = shuffledPool.length;
    let questionsToReturn = shuffledPool.slice(0, count);
    let generationMode = "cache";
    let message = "Loaded from cache";

    // 2. If we don't have enough questions:
    if (availableCount < count) {
      console.log(`[INLINE] Cache miss for ${chapter}. Need ${count}, have ${availableCount}. Generating inline...`);
      generationMode = "ai_inline";
      const deficit = count - availableCount;
      const prompt = buildPrompt(exam, formattedSubject, chapter, difficulty, deficit, chapterId || "phy-1");
      
      // OPTIMIZATION: If cache is completely empty, disable timeout (0) to guarantee
      // that the student gets a test. If we have some questions cached, cap at 8s.
      const inlineTimeout = availableCount === 0 ? 0 : 8000;
      
      const generatedQs = await generateWithGemini(geminiKey, prompt, deficit, inlineTimeout);
      
      if (generatedQs.length > 0) {
        const validatedQs = generatedQs.filter((q: any) => {
          const detected = classifyQuestion(formattedSubject, q.question_text, [q.options?.A || '', q.options?.B || '', q.options?.C || '', q.options?.D || ''], q.explanation);
          if (detected !== (chapterId || "phy-1") && formattedSubject.toLowerCase().includes('phys')) {
            console.warn(`[INLINE REJECT] Question: "${q.question_text.slice(0, 50)}..." | Requested Chapter: ${chapterId} | Classified: ${detected}`);
            return false;
          }
          return true;
        });

        const dbInserts = validatedQs.map((q: any) => ({
          id: crypto.randomUUID(),
          exam_type: exam === 'JEE' ? 'JEE_MAINS' : exam,
          subject: formattedSubject,
          chapter_id: chapterId || "phy-1",
          chapter: chapter,
          topic: q.topic || "General",
          concept: q.concept || "",
          difficulty: (difficulty || "medium").toLowerCase(),
          question_type: "MCQ",
          question_text: q.question_text,
          option_a: q.options.A,
          option_b: q.options.B,
          option_c: q.options.C,
          option_d: q.options.D,
          correct_option: q.correct_option,
          explanation: q.explanation,
          is_verified: false,
          verification_status: 'PENDING',
          source: "ai_generated",
          generation_model: "gemini-2.5-flash-inline"
        }));
        
        await supabase.from("questions").insert(dbInserts);
        questionsToReturn = [...questionsToReturn, ...dbInserts];
        message = "Generated inline successfully";
      } else {
        message = "Inline generation timed out or failed. Returning partial cache.";
      }
    }

    const shouldTriggerBackground = availableCount < CACHE_THRESHOLD;

    return new Response(JSON.stringify({ 
      questions: questionsToReturn.slice(0, count), 
      generationMode,
      message,
      triggerBackground: shouldTriggerBackground,
      backgroundCount: TARGET_GENERATE
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Test generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
