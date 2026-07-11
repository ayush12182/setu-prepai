import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function main() {
  const { data, error } = await supabase.from('chapter_content').select('chapter_id, chapter_slug, chapter_name');
  if (data) {
    console.log(data.map(d => `${d.chapter_id} | ${d.chapter_slug} | ${d.chapter_name}`).join('\n'));
  } else {
    console.log("Error:", error);
  }
}
main();
