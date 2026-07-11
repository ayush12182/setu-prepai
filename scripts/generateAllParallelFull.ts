import { loadEnv } from 'vite';
import { 
  physicsChapters, 
  chemistryChapters, 
  mathsChapters 
} from '../src/data/syllabus';

const syllabus = [
  { name: 'Physics', chapters: physicsChapters },
  { name: 'Chemistry', chapters: chemistryChapters },
  { name: 'Mathematics', chapters: mathsChapters },
];

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL!;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const GEMINI_KEY = env.VITE_GEMINI_API_KEY!;

function buildPrompt(chapterName: string, subject: string, topics: string[]): string {
  const topicList = topics.join(", ");
  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE (COACHING GRADE)

You are an elite senior HOD at a premier Kota coaching institute (Allen/Resonance/PW). You are generating comprehensive, mathematically rigorous classroom notes of absolute premium quality for JEE Main + Advanced.

CRITICAL LANGUAGE INSTRUCTION:
- You must write in 100% professional, academic English.
- DO NOT use Hinglish, Hindi words, or conversational slang.

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
1-paragraph explanation. Bulleted list connecting to 4-5 later chapters. Include:
[TEACHER_SAYS]
Senior faculty strategic introduction (300-500 words) — where students fail, how toppers study this topic.
[/TEACHER_SAYS]

## 2. Learning Outcomes
10-15 concrete learning outcomes.

## 3. Complete Theory
Massive theory section. Each subtopic = 4-6 pages. Include formal definitions, derivations, real-life analogies, exam observations.
Use blocks: [CONCEPT]...[/CONCEPT], [NCERT_INSIGHT]...[/NCERT_INSIGHT], [DERIVATION]...[/DERIVATION]

## 4. Key Formulae & Derivations
Consolidated cheat sheet of all formulas. For the 3 most important formulas, show step-by-step mathematical derivations inside [DERIVATION]...[/DERIVATION] blocks.

## 5. JEE Main Core Concepts
Kota-shortcut methods, standard templates of questions that repeat in JEE Main.

## 6. JEE Advanced Rigor
High-rigor mathematical proofs, boundary conditions, edge cases, multi-concept linkages (e.g. combining Mechanics with Electrostatics).

## 7. Solved Examples (JEE Main Level)
Provide 5 high-yield solved examples. For each, show:
[QUESTION]...[/QUESTION], [CONCEPT_TESTED]...[/CONCEPT_TESTED], [THINKING_PROCESS]...[/THINKING_PROCESS], [DETAILED_SOLUTION]...[/DETAILED_SOLUTION]

## 8. Solved Examples (JEE Advanced Level)
Provide 5 extremely challenging solved examples (multiple options correct, integer type, matrix match). Use the same format: [QUESTION], [CONCEPT_TESTED], [THINKING_PROCESS], [DETAILED_SOLUTION]

## 9. Common Mistakes & Pitfalls
[WARNING_GATE]
5-8 common calculation mistakes, sign convention errors, misconceptions. Explain what not to do.
[/WARNING_GATE]

## 10. Memory Map / Mnemonics
Provide memory tricks, flowcharts in text, acronyms to remember complex order/values.

## 11. Practice Exercises (JEE Main)
10 practice questions with numerical answers (no full solutions, just final keys).

## 12. Practice Exercises (JEE Advanced)
10 practice questions (rigorous, subjective/multi-correct) with final answers.

## 13. Real-world / Industrial Applications
How this chapter applies to current technology, aerospace, chemical plants, or computing.

## 14. Quick Revision Summary
A 1-page condensed bulleted summary.

## 15. Reference Material & Books
Suggested books (HC Verma, Irodov, Morrison Boyd, JD Lee, Cengage) and specific exercises.

CRITICAL FORMATTING RULES:
1. NEVER output JSON. Only raw Markdown text.
2. Ensure every section ## 1 to ## 15 is explicitly present.
3. Write at least 12,000 to 15,000 words. Make it extremely exhaustive. Do NOT summarize or skip derivations.
4. Output LaTeX math expressions enclosed in $$...$$ for block equations, and $...$ for inline equations. Escape all backslashes inside LaTeX correctly.
`;
}

async function callGemini(prompt: string, chapterName: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  
  // Unlimited retries with backoff to handle rate limits
  let delay = 5000;
  while (true) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
          }
        })
      });

      if (res.status === 429 || res.status === 503) {
        console.warn(`  ⚠️ [${chapterName}] Rate limited (${res.status}). Waiting ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 1.5, 30000); // Exponential backoff up to 30s
        continue;
      }

      if (!res.ok) {
        throw new Error(`Gemini status ${res.status}`);
      }

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text || text.length < 2000) {
        throw new Error("Response too short or invalid");
      }
      return text;
    } catch (err: any) {
      console.warn(`  ⚠️ [${chapterName}] Error: ${err.message}. Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
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
      version: 2, // Increment version to overwrite the fast notes
      version_label: '2.0',
      status: 'published',
      raw_content: rawContent,
      word_count: wordCount,
      generation_model: 'gemini-2.5-flash',
    })
  });

  return res.ok;
}

function mungeSubject(s: string) {
  if (s.toLowerCase() === 'mathematics') return 'maths';
  return s.toLowerCase();
}

async function run() {
  console.log("Starting full-length note replacement for placeholder chapters...");
  
  // 1. Fetch current word counts to find placeholder notes
  const url = `${SUPABASE_URL}/rest/v1/chapter_content?select=chapter_id,word_count&status=eq.published`;
  const res = await fetch(url, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
  });
  const data = await res.json();
  
  const placeholders = new Set<string>();
  if (Array.isArray(data)) {
    for (const row of data) {
      if (row.word_count < 3000) {
        placeholders.add(row.chapter_id);
      }
    }
  }

  // 2. Identify target chapters
  const targets: any[] = [];
  for (const subj of syllabus) {
    for (const ch of subj.chapters) {
      if (placeholders.has(ch.id)) {
        targets.push({ subj: subj.name, ch: ch.name, id: ch.id, topics: ch.topics || [] });
      }
    }
  }

  console.log(`Found ${targets.length} placeholder chapters to upgrade to full-length Kota-grade notes.`);
  if (targets.length === 0) {
    console.log("All chapters already have full-length notes! Nothing to do.");
    return;
  }

  // 3. Process ALL target chapters in parallel
  // To avoid overloading the API completely, we run them in parallel but handle rate-limiting using the exponential backoff inside callGemini
  await Promise.all(targets.map(async (t) => {
    console.log(`⏳ Starting full-length generation for: ${t.ch}`);
    try {
      const prompt = buildPrompt(t.ch, t.subj, t.topics);
      const rawContent = await callGemini(prompt, t.ch);
      const wordCount = rawContent.split(/\s+/).length;
      console.log(`📝 Generated ${wordCount} words for ${t.ch}. Saving...`);
      
      const saved = await saveToDb(t.id, t.ch, t.subj, rawContent);
      if (saved) {
        console.log(`🎉 Upgrade COMPLETE & Published: ${t.ch} (${wordCount} words)`);
      } else {
        console.error(`❌ DB Save failed for ${t.ch}`);
      }
    } catch(e: any) {
      console.error(`❌ Fatal error for ${t.ch}: ${e.message}`);
    }
  }));

  console.log("All upgrades completed!");
}

run();
