import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("Deleting dirty 'laws-of-motion' row from chapter_content...");
  const { data, error } = await supabase
    .from('chapter_content')
    .delete()
    .eq('chapter_slug', 'laws-of-motion');
    
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success! Deleted laws-of-motion from chapter_content.");
  }
}

main();
