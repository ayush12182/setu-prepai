import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const GEMINI_KEY = env.VITE_GEMINI_API_KEY!;

const prompt = `
You are an expert JEE examiner for physics.
Generate 5 high-quality, strictly unique medium difficulty multiple-choice questions for the chapter: "Laws of Motion".
Return a JSON object containing an array of exactly 5 question objects.
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
        "B": "Why a student wrongly chose B",
        "C": "Why a student wrongly chose C",
        "D": "Why a student wrongly chose D"
      }
    }
  ]
}
Do NOT include markdown block markers like \`\`\`json. Output ONLY raw JSON.
`;

async function test() {
  const startTime = Date.now();
  console.log("Calling Gemini API directly...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    })
  });

  const duration = (Date.now() - startTime) / 1000;
  console.log(`Finished in ${duration}s. Status: ${res.status}`);
  
  const text = await res.text();
  console.log("Preview:", text.slice(0, 1000));
}

test();
