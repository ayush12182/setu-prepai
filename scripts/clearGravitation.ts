import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Deleting Gravitation notes from DB...");
  const { data, error } = await supabase
    .from('chapter_content')
    .delete()
    .eq('chapter_slug', 'gravitation');
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Successfully deleted Gravitation from chapter_content");
  }
}

run();
