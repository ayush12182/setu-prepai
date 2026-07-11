import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from('chapter_content')
    .select('chapter_id, exam_type, status, version_label')
    .eq('chapter_id', 'phy-1');

  if (error) console.error("Error:", error);
  else console.log("Data for phy-1:", data);
}

check();
