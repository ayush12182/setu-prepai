import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data } = await supabase.from('chapter_content').select('raw_content').limit(10);
  if (!data) return;
  for (const row of data) {
    const content = row.raw_content;
    const blockRe = /\[(INTERACTIVE_GRAPH)(?:\s+title="([^"]+)")?\]([\s\S]*?)\[\/\1\]/g;
    let match;
    while ((match = blockRe.exec(content)) !== null) {
      console.log('---');
      console.log('Title:', match[2]);
      console.log('Config:', match[3]);
    }
  }
}
main();
