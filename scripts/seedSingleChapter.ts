import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GEMINI_KEY = env.VITE_GEMINI_API_KEY;

const targetChapter = { id: 'chem-4', name: 'Thermodynamics & Thermochemistry', subject: 'Chemistry', topics: ['First Law','Enthalpy',"Hess's Law",'Bond Enthalpy','Entropy','Gibbs Free Energy'] };

function buildPrompt(chapterName: string, subject: string, topics: string[]) {
  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE (COACHING GRADE)
You are an elite senior HOD generating mathematically rigorous classroom notes. 
Output raw markdown text. The very first line MUST be exactly [METADATA].

[METADATA]
chapter_slug: ${chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
chapter_name: ${chapterName}
subject: ${subject}
topic_tree: ${topics.join(", ")}
[/METADATA]

# ${chapterName} — Complete Master Notes
PrepEntrance ${subject} | JEE Main + Advanced

Generate the following sections with exact ## headings. Make the content extremely detailed, comprehensive, and rich—this should feel like a full textbook chapter.

## 1. Chapter Overview
### Why ${chapterName} matters
1-paragraph explanation.
[TEACHER_SAYS]
Senior faculty strategic introduction.
[/TEACHER_SAYS]

## 2. Learning Outcomes
10 concrete learning outcomes.

## 3. Complete Theory
Massive theory section. Each subtopic = 1 page.
Use blocks: [CONCEPT]...[/CONCEPT], [NCERT_INSIGHT]...[/NCERT_INSIGHT], [DERIVATION]...[/DERIVATION]

## 4. Key Formulas & Equations
Structured with variables explained.

## 5. Worked Examples
At least 2 detailed solved examples.

## 6. Previous Year Question Insights
Breakdown of PYQ trends.

## 7. Common Mistakes & Misconceptions
List of common errors.

## 8. Revision Notes
Short bullet summary.

## 9. Mind Map Structure
Textual representation of a mind map.

## 10. Flashcards
List of flashcard pairs.
`;
}

async function callGemini(prompt: string, retries = 100) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 65536 }
        })
      });

      if (res.status === 429 || res.status === 503) {
        console.warn(`  ⚠️  Rate limited (${res.status}). Waiting 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
      
      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty text from Gemini");
      return text;
    } catch (err: any) {
      console.error(`  ❌ Gemini error on attempt ${attempt}:`, err.message);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  return "";
}

async function saveToDb(chapterId: string, chapterName: string, subject: string, rawContent: string) {
  const slug = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const wordCount = rawContent.split(/\s+/).length;

  const url = `${SUPABASE_URL}/functions/v1/save-local-notes`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY!,
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

async function run() {
  console.log(`⏳ Generating specific chapter: ${targetChapter.name}...`);
  const prompt = buildPrompt(targetChapter.name, targetChapter.subject, targetChapter.topics);
  const rawContent = await callGemini(prompt);
  console.log(`📝 Generated ${rawContent.split(/\s+/).length} words. Saving...`);
  const success = await saveToDb(targetChapter.id, targetChapter.name, targetChapter.subject, rawContent);
  if (success) {
    console.log(`🎉 ${targetChapter.name} — PUBLISHED!`);
  } else {
    console.log(`❌ Failed to save ${targetChapter.name}`);
  }
}

run();
