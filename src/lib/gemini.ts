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
=== PrepEntrance JEE V3 EXAM ENGINE RULES ===
Target Student: JEE Main & Advanced Aspirants aiming for a 99+ Percentile.
Inspiration Sources: JEE Main PYQs (2019-2026), JEE Advanced PYQs, Allen/Resonance Module Sheet Exercises, FIITJEE GMP.

MANDATORY QUESTION QUALITY CRITERIA:
1. CONCEPT-DRIVEN OVER MEMORY:
   - Generate questions checking deep conceptual understanding, multi-step derivation, and multi-concept integration.
   - Absolutely NO direct formula substitution or simple theoretical recognition.

2. NUMERIC REALISM:
   - Use realistic experimental values, non-integer parameters, and authentic JEE-style numbers.
   - Bad: m = 10 kg, r = 2 m, v = 5 m/s.
   - Good: m = 3.5 kg, r = 0.75 m, v = 4.2 m/s, or expressions using variables (g, L, theta).

3. DIFFICULTY BUCKETS:
   - Easy: Single-stage direct application of a core concept in an unfamiliar scenario.
   - Medium: Integration of 2 distinct concepts (e.g., Conservation of Momentum + Spring Potential Energy).
   - Hard: Multi-concept integration with subtle physical or mathematical traps (typical JEE Advanced or top 10% JEE Main).

4. CHAPTER-AWARE SPECIFIC TOPICS:
   - Kinematics: Must target Relative motion (river-boat, short-distance approach), Graph interpretation (v-t, a-x slopes/areas), Projectile motion on an incline, or Variable acceleration (differentiation/integration).
   - Laws of Motion: Must involve Free Body Diagrams (FBD), limiting/static friction, constraint relations (pulley constraints), or pseudo-forces in accelerating frames.
   - Electrostatics: Must involve Field/Potential mapping, conductor behavior (earthing concentric conducting shells), dielectric insertion in capacitors, or RC circuits.

5. AUTHENTIC JEE MAIN FORMAT PATTERNS:
   - Generate standard single-correct MCQs, numeric integer type, concept matching matrices, or Assertion-Reasoning (Statement 1 and Statement 2) depending on the chapter.

MANDATORY EXPLANATION FORMAT:
Every generated solution MUST contain exactly the following four sections, using exactly these markdown headings:
### Concept Used
(Short explanation of the concept being tested).
### Step-by-Step Solution
(Detailed derivation. Use **Step 1:**, **Step 2:** etc.)
### Final Answer
(The final numeric or algebraic answer, inside a \\boxed{} in a block equation)
### Mentor Tip
(A short JEE-focused shortcut or mistake warning)

CRITICAL LATEX AND FORMATTING RULES:
1. NO RAW LATEX STRINGS. You MUST use standard markdown math delimiters.
2. For inline math, use exactly one dollar sign: $x^2 + y^2$. NEVER use \\(.
3. For block math, use exactly two dollar signs on their own lines: 
$$
T_{r+1} = \\binom{n}{r}a^{n-r}b^r
$$
NEVER use \\[, \\], \\$$, or a single standalone $.
4. Do NOT generate question ranges (e.g., "Q41-Q50"). The solution must ONLY explain the CURRENT question.
5. Do NOT include multiple solutions or alternate methods in one answer. Keep it singular and focused.
6. Use standard KaTeX syntax for fractions (\\frac{a}{b}), binomials (\\binom{n}{r}), integrals, etc.

MOST IMPORTANT VALIDATION TEST:
"Could this question realistically appear in an actual JEE Main or Advanced paper?" If the answer is NO, discard it and generate a new one.
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
    ? `You are an expert JEE exam question setter. Generate questions indistinguishable from authentic JEE Main and JEE Advanced questions. Return ONLY a JSON object with a "questions" array. No markdown.
    
    ${JEE_PROMPT_CONSTRAINTS}`
    : `You are an expert ${exam} exam question setter. Return ONLY a JSON object with a "questions" array. No markdown.`;

  const userPrompt = `Generate exactly ${count} MCQs on "${topic}" for ${exam}. Difficulty: ${difficulty}. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.`;

  let attempt = 0;
  while (attempt < 2) {
    try {
      const data = await callGemini<{ questions: any[] }>(
        systemPrompt,
        userPrompt,
        0.3
      );
      
      const parsedQuestions = (data.questions || []).map((q: any, i: number) => {
        const expl = q.explanation || '';
        // Output Validation: Check for forbidden patterns
        if (
          expl.includes('\\$$') || 
          expl.includes('Q41') || // heuristic for range generation
          expl.includes('\\(') || 
          expl.includes('\\[')
        ) {
          throw new Error('Validation failed: Malformed LaTeX or forbidden patterns detected in AI output.');
        }

        return {
          id: `gemini-${Date.now()}-${i}`,
          node_id: nodeId || topic,
          type: 'MCQ' as const,
          exam_type: exam,
          difficulty: ((q.difficulty || difficulty) as string).toLowerCase() as 'easy' | 'medium' | 'hard',
          question_text: q.question_text,
          options: { A: q.option_a || '', B: q.option_b || '', C: q.option_c || '', D: q.option_d || '' },
          answer: q.correct_option,
          explanation: expl,
          concept_tested: q.concept_tested || topic,
          option_a: q.option_a || '',
          option_b: q.option_b || '',
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          correct_option: q.correct_option,
        };
      });
      return parsedQuestions;
    } catch (error) {
      console.warn(`Gemini generation attempt ${attempt + 1} failed or validation failed:`, error);
      attempt++;
      if (attempt >= 2) {
        console.error('All Gemini generation attempts failed.');
        return []; // Fallback gracefully if validation fails repeatedly
      }
    }
  }
  return [];
}
