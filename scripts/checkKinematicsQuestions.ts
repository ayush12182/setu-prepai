import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function main() {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('chapter_id', 'phy-1');

  console.log(`Kinematics (questions table) count: ${count}`, error);

  const { count: bankCount, error: bankErr } = await supabase
    .from('questions_bank')
    .select('*', { count: 'exact', head: true })
    .eq('ncert_chapter', 'Kinematics');

  console.log(`Kinematics (questions_bank table) count: ${bankCount}`, bankErr);
}

main();
