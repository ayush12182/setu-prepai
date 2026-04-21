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

export async function generateQuestionsGemini(
  topic: string,
  exam: string,
  difficulty: string,
  count: number,
  nodeId?: string
) {
  const data = await callGemini<{ questions: any[] }>(
    `You are an expert ${exam} exam question setter. Return ONLY a JSON object with a "questions" array. No markdown.`,
    `Generate exactly ${count} MCQs on "${topic}" for ${exam}. Difficulty: ${difficulty}. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.`,
    0.4
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
