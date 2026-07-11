import { loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const NOTES_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Physics_Chapters_15_to_16_Master_Notes');

const CHAPTERS = [
  { file: '15_Optics_Complete_Master_Notes.md', id: 'phy-14', name: 'Optics' },
  { file: '16_Modern_Physics_Complete_Master_Notes.md', id: 'phy-15', name: 'Modern Physics' }
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
      subject: 'physics',
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
