import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL || "https://osbpdjlywgydidzurpsb.supabase.co";
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function main() {
  console.log("Checking question counts in Supabase...");
  for (let i = 1; i <= 12; i++) {
    const chapterId = `phy-${i}`;
    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('chapter_id', chapterId);
    
    console.log(`${chapterId}: ${count} questions (error: ${error?.message || 'none'})`);
  }
}

main();
