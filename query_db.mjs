import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'abc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('chapter_content').select('*').eq('chapter_slug', 'phy-3').limit(1);
  if (error) {
    console.error("DB ERROR", error);
    return;
  }
  if (data && data.length) {
    const keys = Object.keys(data[0]);
    console.log("DB KEYS:", keys);
    console.log("has revision_notes?", !!data[0].revision_notes);
    console.log("has raw_content?", !!data[0].raw_content);
    if (data[0].revision_notes) {
      console.log("typeof revision_notes:", typeof data[0].revision_notes);
      const rnStr = typeof data[0].revision_notes === 'string' ? data[0].revision_notes : JSON.stringify(data[0].revision_notes);
      console.log("revision_notes slice:", rnStr.slice(0, 200));
    }
  } else {
    console.log("NO DATA for phy-3");
  }
}
run();
