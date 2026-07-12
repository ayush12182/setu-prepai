import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('chapter_content')
    .select('version, version_label, updated_at')
    .eq('chapter_id', 'phy-1')
    .order('version', { ascending: false });
  console.log(data);
}
check();
