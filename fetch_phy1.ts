import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchNotes() {
  const { data, error } = await supabase.from('chapter_content').select('raw_content').eq('chapter_id', 'phy-1').eq('exam_type', 'JEE').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log(data?.[0]?.raw_content?.substring(0, 4000));
  }
}
fetchNotes();
