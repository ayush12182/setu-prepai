#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

const args = process.argv.slice(2);
const getArg = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const hasFlag = (f) => args.includes(f);

const FILTER_CHAPTER = getArg('--chapter');
const DRY_RUN = hasFlag('--dry-run');

async function callGemini(prompt, temperature = 0.4) {
  if (!GEMINI_KEY) {
    throw new Error('GEMINI_API_KEY / VITE_GEMINI_API_KEY is not configured.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, response_mime_type: 'application/json' }
    })
  });
  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
  }
  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text.trim());
}

async function expandChapterAI(subject, chapterName, topics, formulasList) {
  const prompt = `You are a curriculum design specialist for JEE.
We are expanding the chapter "${chapterName}" (Subject: ${subject}) covering topics: ${topics.join(', ')}.
We have pre-loaded these formulas for this chapter:
${JSON.stringify(formulasList, null, 2)}

For each topic, identify its subtopics and concepts.
For each concept, you must:
1. Link to at least one formula ID from the pre-loaded formulas above.
2. Generate exactly 5 unique, common student misconceptions (e.g. M_xxx_001). Include title, description, triggerPatterns, and remediationStrategy.
3. Map to at least one PYQ DNA reference (Exam: "JEE_MAINS" or "JEE_ADVANCED", Year: 2019-2026, Difficulty: "easy" | "medium" | "hard", Pattern: "MCQ" | "Integer", Reasoning Mode).

Return ONLY a JSON object matching this structure:
{
  "concepts": [
    {
      "concept_id": "string", // unique alphanumeric concept id
      "concept_name": "string",
      "topic": "string", // must match one of: ${topics.join(', ')}
      "subtopic": "string",
      "formulas": ["string"], // array of formula IDs from the pre-loaded list above
      "misconceptions": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "triggerPatterns": ["string"],
          "remediation": "string"
        }
      ],
      "pyq_patterns": [
        {
          "exam": "JEE_MAINS" | "JEE_ADVANCED",
          "year": number,
          "difficulty": "easy" | "medium" | "hard",
          "pattern": "MCQ" | "Integer",
          "reasoning_mode": "string"
        }
      ],
      "difficulty_tags": ["JEE_Main_Easy" | "JEE_Main_Medium" | "JEE_Main_Hard" | "JEE_Advanced_Hard"]
    }
  ]
}`;

  console.log(`Calling Gemini to expand chapter "${chapterName}"...`);
  try {
    const data = await callGemini(prompt, 0.4);
    return data.concepts || [];
  } catch (err) {
    console.error(`AI expansion failed for ${chapterName}:`, err.message);
    return [];
  }
}

async function run() {
  if (!FILTER_CHAPTER) {
    console.error('Error: Please specify the chapter to expand using --chapter "<chapterName>"');
    process.exit(1);
  }

  const subjects = ['physics', 'chemistry', 'mathematics'];
  let matchedChapter = null;
  let matchedSubject = null;

  // Find the chapter in syllabus JSON files
  for (const sub of subjects) {
    const syllabusPath = path.resolve(process.cwd(), `src/data/syllabus/${sub}.json`);
    if (!fs.existsSync(syllabusPath)) continue;
    const chapters = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
    const found = chapters.find(c => c.name.toLowerCase() === FILTER_CHAPTER.toLowerCase());
    if (found) {
      matchedChapter = found;
      matchedSubject = sub;
      break;
    }
  }

  if (!matchedChapter) {
    console.error(`Error: Chapter "${FILTER_CHAPTER}" not found in syllabus.`);
    process.exit(1);
  }

  console.log(`Found chapter "${matchedChapter.name}" in ${matchedSubject}.`);

  // Load formulas
  const formulaPath = path.resolve(process.cwd(), `src/data/formulas/${matchedSubject}.json`);
  let formulas = [];
  if (fs.existsSync(formulaPath)) {
    const allFormulas = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));
    formulas = allFormulas.filter(f => f.chapter.toLowerCase() === matchedChapter.name.toLowerCase());
  }
  console.log(`Loaded ${formulas.length} formulas for chapter "${matchedChapter.name}".`);

  if (formulas.length === 0) {
    console.warn(`Warning: No formulas found for chapter "${matchedChapter.name}". Seed formulas first using scripts/generate-formulas.js.`);
  }

  if (DRY_RUN) {
    console.log(`[DRY-RUN] Will expand chapter "${matchedChapter.name}" with its ${matchedChapter.topics.length} topics and ${formulas.length} formulas.`);
    return;
  }

  const concepts = await expandChapterAI(matchedSubject, matchedChapter.name, matchedChapter.topics, formulas);
  console.log(`Expanded ${concepts.length} concepts.`);

  // Setup expanded folder
  const expandedDir = path.resolve(process.cwd(), 'src/data/expanded');
  if (!fs.existsSync(expandedDir)) {
    fs.mkdirSync(expandedDir, { recursive: true });
  }

  // 1. Write expanded concepts
  const conceptPath = path.join(expandedDir, `${matchedSubject}_expanded.json`);
  let allConcepts = [];
  if (fs.existsSync(conceptPath)) {
    try {
      allConcepts = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));
    } catch (e) {
      allConcepts = [];
    }
  }
  // Dedup and merge
  concepts.forEach(newC => {
    const idx = allConcepts.findIndex(c => c.concept_id === newC.concept_id || c.concept_name.toLowerCase() === newC.concept_name.toLowerCase());
    if (idx !== -1) {
      allConcepts[idx] = { ...allConcepts[idx], ...newC, subject: matchedSubject, chapter: matchedChapter.name };
    } else {
      allConcepts.push({ ...newC, subject: matchedSubject, chapter: matchedChapter.name });
    }
  });
  fs.writeFileSync(conceptPath, JSON.stringify(allConcepts, null, 2));

  // 2. Write expanded misconceptions
  const misconceptionsPath = path.join(expandedDir, `misconceptions_expanded.json`);
  let allMisconceptions = {};
  if (fs.existsSync(misconceptionsPath)) {
    try {
      allMisconceptions = JSON.parse(fs.readFileSync(misconceptionsPath, 'utf8'));
    } catch (e) {
      allMisconceptions = {};
    }
  }
  concepts.forEach(c => {
    if (c.misconceptions) {
      c.misconceptions.forEach(m => {
        allMisconceptions[m.id] = {
          id: m.id,
          concept: c.concept_name,
          title: m.title,
          description: m.description,
          triggerPatterns: m.triggerPatterns,
          remediationStrategy: {
            revisionBlock: m.remediation,
            targetedPracticeCount: 3,
            visualExplanation: `Diagram for ${m.title}`
          }
        };
      });
    }
  });
  fs.writeFileSync(misconceptionsPath, JSON.stringify(allMisconceptions, null, 2));

  console.log(`Expansion complete. Mapped concepts written to ${conceptPath}. Misconceptions written to ${misconceptionsPath}.`);
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
