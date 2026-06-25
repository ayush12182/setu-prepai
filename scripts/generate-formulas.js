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

const FILTER_SUBJECT = getArg('--subject');
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

async function generateFormulasForChapter(subject, chapterName, topics, targetCount) {
  const prompt = `You are a professional JEE textbook editor and physicist.
Generate exactly ${targetCount} unique formulas for the chapter "${chapterName}" (Subject: ${subject}) covering these topics: ${topics.join(', ')}.

Return ONLY a JSON object matching this structure:
{
  "formulas": [
    {
      "id": "string", // unique alphanumeric id, e.g. "F_PHY_KIN_001"
      "formula": "string", // LaTeX notation, e.g. "\\vec{v} = \\vec{u} + \\vec{a}t"
      "concept": "string", // name of concept the formula tests, e.g. "Relative Velocity"
      "variables": {
        "v": "description of v",
        "u": "description of u"
      },
      "units": {
        "v": "m/s",
        "u": "m/s"
      },
      "usedIn": ["concept name 1", "concept name 2"],
      "commonMistakes": ["misconception id 1", "misconception id 2"]
    }
  ]
}`;

  console.log(`Calling Gemini to generate ${targetCount} formulas for ${chapterName}...`);
  try {
    const data = await callGemini(prompt, 0.3);
    return data.formulas || [];
  } catch (err) {
    console.error(`Failed to generate formulas for ${chapterName}:`, err.message);
    return [];
  }
}

async function run() {
  const subjects = ['physics', 'chemistry', 'mathematics'];
  
  for (const sub of subjects) {
    if (FILTER_SUBJECT && sub !== FILTER_SUBJECT.toLowerCase()) continue;
    
    console.log(`\nProcessing formulas for ${sub}...`);
    const syllabusPath = path.resolve(process.cwd(), `src/data/syllabus/${sub}.json`);
    if (!fs.existsSync(syllabusPath)) {
      console.error(`Syllabus JSON for ${sub} not found at ${syllabusPath}`);
      continue;
    }
    
    const chapters = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
    
    // Determine targets
    let totalTarget = 0;
    let targetPerChapter = 40;
    if (sub === 'physics') {
      totalTarget = 500;
      targetPerChapter = Math.ceil(totalTarget / chapters.length); // ~42
    } else if (sub === 'chemistry') {
      totalTarget = 400;
      targetPerChapter = Math.ceil(totalTarget / chapters.length); // ~30
    } else if (sub === 'mathematics') {
      totalTarget = 600;
      targetPerChapter = Math.ceil(totalTarget / chapters.length); // ~50
    }
    
    const outputDir = path.resolve(process.cwd(), 'src/data/formulas');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, `${sub}.json`);
    
    let allFormulas = [];
    if (fs.existsSync(outputPath)) {
      try {
        allFormulas = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        console.log(`Loaded ${allFormulas.length} existing formulas for ${sub}.`);
      } catch (e) {
        allFormulas = [];
      }
    }
    
    for (const ch of chapters) {
      if (FILTER_CHAPTER && ch.name.toLowerCase() !== FILTER_CHAPTER.toLowerCase()) continue;
      // Check if we already have enough formulas for this chapter
      const existingCount = allFormulas.filter(f => f.id.includes(ch.name.toUpperCase().replace(/\s+/g, '_').slice(0, 8))).length;
      if (existingCount >= targetPerChapter) {
        console.log(`Skipping ${ch.name} - already has ${existingCount} formulas.`);
        continue;
      }
      
      if (DRY_RUN) {
        console.log(`[DRY-RUN] Will generate ${targetPerChapter} formulas for chapter "${ch.name}"`);
        continue;
      }
      
      const newFormulas = await generateFormulasForChapter(sub, ch.name, ch.topics, targetPerChapter);
      
      // Map to ensure proper ID formatting and tracing
      const formatted = newFormulas.map((f, idx) => ({
        ...f,
        id: `F_${sub.toUpperCase().slice(0,3)}_${ch.name.toUpperCase().replace(/\s+/g, '_').slice(0, 8)}_${String(idx + 1).padStart(3, '0')}`,
        chapter: ch.name
      }));
      
      allFormulas.push(...formatted);
      
      // Write progressively to avoid data loss
      fs.writeFileSync(outputPath, JSON.stringify(allFormulas, null, 2));
      console.log(`Saved ${formatted.length} formulas. Total for ${sub}: ${allFormulas.length}`);
      
      // Small pause to prevent rate limits
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`Formula seeding completed for ${sub}. Total formulas: ${allFormulas.length}`);
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
