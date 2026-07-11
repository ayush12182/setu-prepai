import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://osbpdjlywgydidzurpsb.supabase.co', 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a')
async function run() {
  const { data, error } = await supabase.from('chapter_content').select('chapter_id, chapter_slug, status');
  console.log(data, error);
}
run();
