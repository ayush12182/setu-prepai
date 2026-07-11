import fs from 'fs';
import path from 'path';

// --- Configuration ---
const SUPABASE_EDGE_FUNCTION_URL = "https://osbpdjlywgydidzurpsb.supabase.co/functions/v1/generate-notes";
const ADMIN_SECRET = "admin_test_123";

// Physics chapters (adjust according to syllabus)
const PHYSICS_CHAPTERS = [
  // 1 and 2 are already generated, start from 3
  { id: 'phy-3', name: 'Work, Energy and Power' },
  { id: 'phy-4', name: 'Rotational Motion' },
  { id: 'phy-5', name: 'Gravitation' },
  { id: 'phy-6', name: 'Mechanical Properties of Solids' },
  { id: 'phy-7', name: 'Mechanical Properties of Fluids' },
  { id: 'phy-8', name: 'Thermal Properties of Matter' },
  { id: 'phy-9', name: 'Thermodynamics' },
  { id: 'phy-10', name: 'Kinetic Theory' },
  { id: 'phy-11', name: 'Oscillations' },
  { id: 'phy-12', name: 'Waves' },
  { id: 'phy-13', name: 'Electric Charges and Fields' },
  { id: 'phy-14', name: 'Electrostatic Potential and Capacitance' },
  { id: 'phy-15', name: 'Current Electricity' },
  { id: 'phy-16', name: 'Moving Charges and Magnetism' },
  { id: 'phy-17', name: 'Magnetism and Matter' },
  { id: 'phy-18', name: 'Electromagnetic Induction' },
  { id: 'phy-19', name: 'Alternating Current' },
  { id: 'phy-20', name: 'Electromagnetic Waves' },
  { id: 'phy-21', name: 'Ray Optics and Optical Instruments' },
  { id: 'phy-22', name: 'Wave Optics' },
  { id: 'phy-23', name: 'Dual Nature of Radiation and Matter' },
  { id: 'phy-24', name: 'Atoms' },
  { id: 'phy-25', name: 'Nuclei' },
  { id: 'phy-26', name: 'Semiconductor Electronics' },
  { id: 'phy-27', name: 'Experimental Physics' }
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithOpenAI(apiKey: string, chapterName: string): Promise<string> {
  const prompt = `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE (COACHING GRADE)

You are an elite senior HOD at a premier Kota coaching institute (Allen/Resonance/PW). You are generating comprehensive, mathematically rigorous classroom notes of absolute premium quality (comparable to a ₹50,000 coaching module) for JEE Main + Advanced.

Your output MUST be a continuous text document using the following exact custom markdown block formats. Do NOT wrap the entire output in JSON or markdown code blocks.

REQUIRED METADATA BLOCK:
[METADATA]
chapter_slug: ${chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
chapter_name: ${chapterName}
subject: Physics
topic_tree: ${chapterName}
[/METADATA]

# ${chapterName} — Complete Master Notes
PrepEntrance Physics | JEE | Class 11/12 • Droppers

You MUST generate the following 15 sections in this EXACT order:
1. Chapter Overview
2. Learning Outcomes
3. Complete Theory (Include [CONCEPT], [NCERT_INSIGHT], [DERIVATION] blocks)
4. Concept Visualization (Include [GRAPH] JSON blocks)
5. Formula Sheet (Include [FORMULA] blocks)
6. Important Graphs
7. Solved Examples (Include [WORKED_EXAMPLE] blocks)
8. PYQ Analysis
9. Common Mistakes (Include [COMMON_MISTAKE] blocks)
10. Shortcuts (Include [JEE_TRICK] blocks)
11. Revision Sheet
12. Chapter Summary
13. Mind Map
14. Exam Tips
15. AI Insights

Generate high-quality content similar to the 'Kinematics' and 'Laws of Motion' templates.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o", // Use gpt-4o or gpt-4o-mini
      messages: [{ role: "system", content: prompt }, { role: "user", content: `Generate the full chapter notes for ${chapterName}` }],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function uploadToSupabase(chapter: any, markdownContent: string) {
  const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_SECRET
    },
    body: JSON.stringify({
      chapterId: chapter.id,
      chapterName: chapter.name,
      subject: "Physics",
      topics: [chapter.name],
      examType: "JEE",
      examMode: "JEE",
      language: "english",
      forceRegenerate: true, // we use forceRegenerate so the admin edge function overrides
      preGeneratedMarkdown: markdownContent
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Upload Error: ${text}`);
  }
  return text;
}

async function run() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ Please provide an OPENAI_API_KEY environment variable.");
    console.error("Usage: OPENAI_API_KEY='sk-...' npx tsx scripts/generatePhysicsBatch.ts");
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), "scripts", "generated_notes");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("🚀 Starting PrepEntrance Batch Notes Generation...");

  for (const chapter of PHYSICS_CHAPTERS) {
    console.log(`\n==========================================`);
    console.log(`📝 Processing Chapter: ${chapter.name} (${chapter.id})`);
    
    const filePath = path.join(outputDir, `${chapter.id}.md`);
    let markdown = "";

    // 1. Generate or Read Cache
    if (fs.existsSync(filePath)) {
      console.log(`✓ Found cached markdown for ${chapter.id}, skipping OpenAI generation.`);
      markdown = fs.readFileSync(filePath, "utf-8");
    } else {
      console.log(`⏳ Generating content using OpenAI... (This takes 30-60 seconds)`);
      try {
        markdown = await generateWithOpenAI(apiKey, chapter.name);
        fs.writeFileSync(filePath, markdown);
        console.log(`✓ Saved generated content to ${filePath}`);
      } catch (e: any) {
        console.error(`❌ Generation failed for ${chapter.name}:`, e.message);
        continue; // Skip to next chapter
      }
    }

    // 2. Upload to Supabase via Edge Function
    console.log(`☁️ Uploading to Supabase via Edge Function...`);
    try {
      await uploadToSupabase(chapter, markdown);
      console.log(`✅ Successfully published ${chapter.name}!`);
    } catch (e: any) {
      console.error(`❌ Upload failed for ${chapter.name}:`, e.message);
    }

    console.log(`⏳ Pausing for 5 seconds to respect rate limits...`);
    await sleep(5000);
  }

  console.log("\n🎉 Batch generation complete!");
}

run();
