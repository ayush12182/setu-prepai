import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GEMINI_KEY = env.VITE_GEMINI_API_KEY;

if (!SUPABASE_URL || !ANON_KEY || !GEMINI_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const ch = { id: 'phy-0', name: 'Units & Dimensions', subject: 'Physics', topics: ['Dimensional Analysis', 'Significant Figures', 'Error Analysis', 'Measuring Instruments (Vernier, Screw Gauge)'] };

function buildPrompt(chapterName: string, subject: string, topics: string[]): string {
  const topicList = topics.join(", ");
  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE (COACHING GRADE)

You are an elite senior HOD at a premier Kota coaching institute (Allen/Resonance/PW). You are generating comprehensive, mathematically rigorous classroom notes of absolute premium quality for JEE Main + Advanced.

CRITICAL INSTRUCTIONS:
1. You must write in 100% professional, academic English.
2. DO NOT wrap the output in JSON or markdown code blocks (like \`\`\`markdown).
3. YOU MUST EXACTLY start with the metadata block, followed IMMEDIATELY by the Main Title and Subtitle. Do NOT skip them!
4. You must strictly use the custom markdown block formats: [TEACHER_SAYS]...[/TEACHER_SAYS], [CONCEPT]...[/CONCEPT], [NCERT_INSIGHT]...[/NCERT_INSIGHT], etc.

YOUR OUTPUT MUST BEGIN EXACTLY LIKE THIS:
[METADATA]
chapter_slug: ${chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
chapter_name: ${chapterName}
subject: ${subject}
topic_tree: ${topicList}
[/METADATA]

# ${chapterName} — Complete Master Notes
PrepEntrance ${subject} | JEE Main + Advanced | Class 11/12 • Droppers

## 1. Chapter Overview
### Why ${chapterName} matters
[TEACHER_SAYS]
Write 300 words of senior faculty strategic introduction here — where students fail, how toppers study this topic.
[/TEACHER_SAYS]

Then proceed to generate the remaining 14 sections in EXACT order:
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
`;
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.1,
        maxOutputTokens: 65536,
      }
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
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
      version: 1,
      version_label: '1.0',
      status: 'published',
      raw_content: rawContent,
      word_count: wordCount,
      generation_model: 'gemini-2.5-flash',
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
  console.log(`Generating notes for ${ch.name}...`);
  try {
    const prompt = buildPrompt(ch.name, ch.subject, ch.topics);
    const rawContent = await callGemini(prompt);
    console.log(`Generated ${rawContent.split(/\s+/).length} words. Saving to DB...`);
    const saved = await saveToDb(ch.id, ch.name, ch.subject, rawContent);
    if (saved) {
      console.log(`Successfully published ${ch.name}!`);
    } else {
      console.log(`Failed to save ${ch.name} to DB.`);
    }
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
  }
}

main();
