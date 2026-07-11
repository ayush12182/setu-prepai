import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function main() {
  const { data, error } = await supabase.from('chapter_content').select('chapter_id, chapter_slug, chapter_name').ilike('chapter_name', '%Units%');
  if (data) {
    console.log(data);
  } else {
    console.log("Error:", error);
  }
}
main();
