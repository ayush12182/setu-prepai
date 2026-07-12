import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('chapter_content')
    .select('raw_content')
    .eq('chapter_id', 'phy-6')
    .eq('version', 1)
    .single();
  console.log(data?.raw_content?.substring(0, 500));
}
check();
