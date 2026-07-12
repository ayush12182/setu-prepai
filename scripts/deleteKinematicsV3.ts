import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
// Need service role key to delete
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/chapter_content?chapter_id=eq.phy-1&version=eq.3`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    }
  });
  console.log(res.status, await res.text());
}
check();
