import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function main() {
  const { data, error } = await supabase.from('chapter_content').select('chapter_id, chapter_slug, chapter_name').ilike('chapter_name', '%unit%');
  if (data) {
    console.log("By Name:", data);
  }
  const { data: data2 } = await supabase.from('chapter_content').select('chapter_id, chapter_slug, chapter_name').ilike('chapter_slug', '%unit%');
  if (data2) {
    console.log("By Slug:", data2);
  }
  const { data: data3 } = await supabase.from('chapter_content').select('chapter_id, chapter_slug, chapter_name').ilike('chapter_id', '%unit%');
  if (data3) {
    console.log("By ID:", data3);
  }
}
main();
