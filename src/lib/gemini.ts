const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export function getGeminiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set. Add it to Vercel Environment Variables.');
  return key;
}

export async function callGemini<T = any>(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.4
): Promise<T> {
  const key = getGeminiKey();
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { temperature, response_mime_type: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const raw = await res.json();
  const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text) as T;
}

export const JEE_PROMPT_CONSTRAINTS = `
=== JEE ASPIRANT 99TH PERCENTILE GENERATION RULES ===
Target Student: JEE Main & Advanced Aspirants aiming for a 99+ Percentile.
Source Pattern Hierarchy (MUST strictly resemble or draw inspiration from):
1. JEE Main PYQs (2019-2026)
2. JEE Advanced PYQs
3. Allen Exercises (Multi-concept, Sheet Exercises)
4. Resonance Sheets
5. FIITJEE GMP (Grand Masters Package)
6. Mathongo Pattern Analysis
7. NTA Abhyas Mock Papers
8. NCERT Exemplar

NEVER GENERATE:
- Direct Formula Substitution questions (e.g., given speed and time, find distance).
- Simple one-step textbook/NCERT examples.
- ChatGPT-generated generic/verbose/vague questions.
- Banned AI terminology: "zero-state outcome", "practical run", "open-loop process", "dynamic state prediction", "academic simulation language".
- School-level theoretical questions (e.g., "Which of the following is true?", "Who discovered benzene?").

SUBJECT SPECIFIC ENGINES:
1. PHYSICS ENGINE:
   - Kinematics: Must involve Relative Velocity (River Boat, Rain-Man, short-distance approach), Projectile (on inclined plane, oblique projectile), Velocity-Time & Position-Time Graphs (slope, area, non-uniform acceleration), Piecewise/Multi-particle motion.
   - NLM: Must involve Pulleys (massless/movable, constraint relations), Inclined planes with friction, Pseudo forces (accelerating frames), Friction (limiting friction, multi-block systems).
   - WPE: Must involve Energy Conservation, Variable forces (integral-based work), Spring-Block systems (max compression, extensions), Power optimization.
   - Electrostatics: Must involve Field Mapping, Potential, Conductors (earthing, charge distribution on concentric shells), Capacitors (dielectric insertion, RC circuits, charge sharing), Mixed concepts.

2. MATHS ENGINE:
   - Functions: Questions must feel like compositions f(g(x)), finding Domain/Range of complex algebraic/transcendental functions, Injective/Surjective/Bijective checks. Never simple definitions.
   - Calculus: Must cover Limits (L'Hopital, series expansion, 1^infinity form), Continuity & Differentiability (piecewise functions, checking differentiability at points), AOD (maxima-minima, tangent & normal, rate measure), Integration (definite integral properties, Leibniz rule, area bounded by curves).
   - Coordinate Geometry: Must cover Tangent, Normal, Chord of contact, Director circle, combined conics geometry (intersection of parabola and ellipse/hyperbola).

3. CHEMISTRY ENGINE:
   - Physical Chemistry: Must be calculation-heavy (Mole Concept with limiting reagents, Thermodynamics with path integrals/state functions, chemical/ionic Equilibrium, Electrochemistry Nernst equation).
   - Organic Chemistry: Reaction-based. Major product prediction, detailed stereochemistry, reaction mechanisms (SN1, SN2, E1, E2, electrophilic addition, named rearrangements). No history trivia.
   - Inorganic Chemistry: PYQ style. Assertion-Reason questions, coordination chemistry (CFT, isomerism, magnetic moments), exceptions in chemical bonding, periodic trends.

DIFFICULTY CALIBRATION:
- "easy" -> Foundation (NCERT Level / JEE Main 2024 Easy Shift)
- "medium" -> JEE Main Standard (Typical JEE Main PYQ)
- "hard" -> JEE Main Hard (Top 10-15% hardest questions from JEE Main or typical JEE Advanced/Olympiad style multi-step thinking).

MANDATORY EXPLANATION FORMAT:
Every solution/explanation must contain exactly these five steps labeled:
Step 1: Concept used - Explain the underlying concept.
Step 2: Formula used - Show the formula(s).
Step 3: Mathematical substitution - Substitute the actual values.
Step 4: Simplification - Show step-by-step simplification.
Step 5: Final answer - State the final numerical/conceptual answer.

MOST IMPORTANT TEST:
Before emitting the question, pass it through this test: "Could this realistically appear in JEE Main or JEE Advanced? Reject any question that can be solved instantly without conceptual reasoning." If the answer is NO, discard the question and generate a new one. All questions must feel authentic, mathematical, numerical, and challenging.
`;

export async function generateQuestionsGemini(
  topic: string,
  exam: string,
  difficulty: string,
  count: number,
  nodeId?: string
) {
  const isJee = exam.toUpperCase().includes('JEE');
  const systemPrompt = isJee
    ? `You are an expert JEE exam question setter. Generate questions indistinguishable from authentic JEE Main and JEE Advanced questions. Avoid school-level, textbook-level, and direct formula-substitution questions. Reject any question that can be solved instantly without conceptual reasoning. Return ONLY a JSON object with a "questions" array. No markdown.

${JEE_PROMPT_CONSTRAINTS}`
    : `You are an expert ${exam} exam question setter. Return ONLY a JSON object with a "questions" array. No markdown.`;

  const userPrompt = `Generate exactly ${count} MCQs on "${topic}" for ${exam}. Difficulty: ${difficulty}. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.`;

  const data = await callGemini<{ questions: any[] }>(
    systemPrompt,
    userPrompt,
    0.3
  );
  return (data.questions || []).map((q: any, i: number) => ({
    id: `gemini-${Date.now()}-${i}`,
    node_id: nodeId || topic,
    type: 'MCQ' as const,
    exam_type: exam,
    difficulty: ((q.difficulty || difficulty) as string).toLowerCase() as 'easy' | 'medium' | 'hard',
    question_text: q.question_text,
    options: { A: q.option_a || '', B: q.option_b || '', C: q.option_c || '', D: q.option_d || '' },
    answer: q.correct_option,
    explanation: q.explanation || '',
    concept_tested: q.concept_tested || topic,
    option_a: q.option_a || '',
    option_b: q.option_b || '',
    option_c: q.option_c || '',
    option_d: q.option_d || '',
    correct_option: q.correct_option,
  }));
}

