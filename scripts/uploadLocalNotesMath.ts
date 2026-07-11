import { loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const NOTES_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Mathematics_Chapters_01_to_12_Master_Notes');

const CHAPTERS = [
  { file: '01_Quadratic_Equations_Expressions_Complete_Master_Notes.md', id: 'math-1', name: 'Quadratic Equations & Expressions' },
  { file: '02_Complex_Numbers_Complete_Master_Notes.md', id: 'math-2', name: 'Complex Numbers' },
  { file: '03_Matrices_Determinants_Complete_Master_Notes.md', id: 'math-3', name: 'Matrices & Determinants' },
  { file: '04_Permutations_Combinations_Complete_Master_Notes.md', id: 'math-4', name: 'Permutations & Combinations' },
  { file: '05_Probability_Complete_Master_Notes.md', id: 'math-5', name: 'Probability' },
  { file: '06_Limits_Continuity_Differentiability_Complete_Master_Notes.md', id: 'math-6', name: 'Limits, Continuity & Differentiability' },
  { file: '07_Differentiation_Complete_Master_Notes.md', id: 'math-7', name: 'Differentiation' },
  { file: '08_Application_of_Derivatives_Complete_Master_Notes.md', id: 'math-8', name: 'Application of Derivatives' },
  { file: '09_Integration_Complete_Master_Notes.md', id: 'math-9', name: 'Integration' },
  { file: '10_Coordinate_Geometry_Complete_Master_Notes.md', id: 'math-10', name: 'Coordinate Geometry' },
  { file: '11_Vectors_3D_Geometry_Complete_Master_Notes.md', id: 'math-11', name: 'Vectors & 3D Geometry' },
  { file: '12_Trigonometry_Complete_Master_Notes.md', id: 'math-12', name: 'Trigonometry' }
];

async function saveToDb(chapterId: string, chapterName: string, rawContent: string): Promise<boolean> {
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
      subject: 'maths',
      exam_type: 'JEE',
      language: 'english',
      version: 1,
      version_label: '1.0',
      status: 'published',
      raw_content: rawContent,
      word_count: wordCount,
      generation_model: 'manual-upload',
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`  DB Error for ${chapterName}: ${errText.slice(0, 200)}`);
    return false;
  }
  return true;
}

async function main() {
  for (const ch of CHAPTERS) {
    try {
      const filePath = path.join(NOTES_DIR, ch.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`Uploading ${ch.name}... (${content.length} chars)`);
        const success = await saveToDb(ch.id, ch.name, content);
        if (success) {
          console.log(`✅ Successfully uploaded ${ch.name}`);
        }
      } else {
        console.log(`❌ File not found: ${ch.file}`);
      }
    } catch (err) {
      console.error(`Failed to process ${ch.name}:`, err);
    }
  }
}

main();
