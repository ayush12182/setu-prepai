import { loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const NOTES_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Chemistry_Chapters_01_to_12_Master_Notes');

const CHAPTERS = [
  { file: '01_Mole_Concept_Stoichiometry_Complete_Master_Notes.md', id: 'chem-1', name: 'Mole Concept & Stoichiometry' },
  { file: '02_Atomic_Structure_Complete_Master_Notes.md', id: 'chem-2', name: 'Atomic Structure' },
  { file: '03_Chemical_Bonding_Complete_Master_Notes.md', id: 'chem-3', name: 'Chemical Bonding' },
  { file: '04_Thermodynamics_Thermochemistry_Complete_Master_Notes.md', id: 'chem-4', name: 'Thermodynamics & Thermochemistry' },
  { file: '05_Chemical_Equilibrium_Complete_Master_Notes.md', id: 'chem-5', name: 'Chemical Equilibrium' },
  { file: '06_Electrochemistry_Complete_Master_Notes.md', id: 'chem-6', name: 'Electrochemistry' },
  { file: '07_Chemical_Kinetics_Complete_Master_Notes.md', id: 'chem-7', name: 'Chemical Kinetics' },
  { file: '08_GOC_Isomerism_Complete_Master_Notes.md', id: 'chem-8', name: 'GOC & Isomerism' },
  { file: '09_Hydrocarbons_Complete_Master_Notes.md', id: 'chem-9', name: 'Hydrocarbons' },
  { file: '10_Organic_Reactions_Named_Reactions_Complete_Master_Notes.md', id: 'chem-10', name: 'Organic Reactions & Named Reactions' },
  { file: '11_Periodic_Table_Trends_Complete_Master_Notes.md', id: 'chem-11', name: 'Periodic Table & Trends' },
  { file: '12_Coordination_Chemistry_Complete_Master_Notes.md', id: 'chem-12', name: 'Coordination Chemistry' }
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
      subject: 'chemistry',
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
