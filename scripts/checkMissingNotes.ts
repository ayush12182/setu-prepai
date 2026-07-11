import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
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
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function run() {
  const { data: existing } = await supabase.from('chapter_content').select('chapter_id').eq('status', 'published');
  const existingSet = new Set(existing?.map(x => x.chapter_id) || []);

  const totalChapters = physicsChapters.length + chemistryChapters.length + mathsChapters.length;
  const missing = [];
  for (const subj of syllabus) {
    for (const ch of subj.chapters) {
      if (!existingSet.has(ch.id)) {
        missing.push({ subj: subj.name, ch: ch.name, id: ch.id });
      }
    }
  }

  console.log(`Total Chapters: ${totalChapters}`);
  console.log(`Published Notes: ${existingSet.size}`);
  console.log(`Missing Chapters: ${missing.length}`);
  if (missing.length > 0) {
    console.log("Missing:", missing.map(m => m.ch).join(", "));
  }
}

run();
