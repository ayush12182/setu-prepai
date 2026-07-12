import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GEMINI_KEY = env.VITE_GEMINI_API_KEY;

const chapter = { id: 'phy-0', name: 'Units and Dimensions', subject: 'Physics', topics: ['Physical Quantities','SI Units','Dimensions','Dimensional Analysis','Significant Figures','Error Analysis'] };

function buildPrompt(chapterName: string, subject: string, topics: string[]): string {
  const topicList = topics.join(", ");
  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE (COACHING GRADE)

You are an elite senior HOD at a premier Kota coaching institute (Allen/Resonance/PW). You are generating comprehensive, mathematically rigorous classroom notes of absolute premium quality for JEE Main + Advanced.

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
1-paragraph explanation. Include:
[TEACHER_SAYS]
Senior faculty strategic introduction (300-500 words) — where students fail, how toppers study this topic.
[/TEACHER_SAYS]

## 2. Learning Outcomes
10-15 concrete learning outcomes.

## 3. Complete Theory
Massive theory section. Each subtopic = 4-6 pages.
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

async function run() {
  console.log(`Starting generation for ${chapter.name}...`);
  const prompt = buildPrompt(chapter.name, chapter.subject, chapter.topics);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 65536 }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Gemini Error:`, errText);
    return;
  }
  const json = await res.json();
  const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) { console.error("No content generated"); return; }
  
  console.log("Saving to DB...");
  const saveUrl = `${SUPABASE_URL}/functions/v1/save-local-notes`;
  const saveRes = await fetch(saveUrl, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: "LOCAL_BULK_SCRIPT",
      chapter_id: chapter.id,
      chapter_slug: chapter.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      chapter_name: chapter.name,
      subject: chapter.subject.toLowerCase(),
      exam_type: 'JEE',
      language: 'english',
      version: 5,
      version_label: '5.0',
      status: 'published',
      raw_content: rawContent,
      word_count: rawContent.split(/\s+/).length,
      generation_model: 'gemini-flash-latest',
    })
  });

  if (saveRes.ok) console.log(`Successfully generated and saved ${chapter.name}!`);
  else console.error(`DB Save Error:`, await saveRes.text());
}
run();
