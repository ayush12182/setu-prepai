import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function wipeCache() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Wiping chapter_standardized_notes cache...');
  
  const { data, error } = await supabase
    .from('chapter_standardized_notes')
    .delete()
    .neq('chapter_id', 'invalid-id-to-force-delete-all');
    
  if (error) {
    console.error('Failed to wipe cache:', error);
  } else {
    console.log('Cache successfully wiped!');
  }
}

wipeCache();
