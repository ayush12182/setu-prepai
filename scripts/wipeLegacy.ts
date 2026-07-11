import { createClient } from '@supabase/supabase-js';

async function wipeLegacy() {
  const supabaseUrl = 'https://osbpdjlywgydidzurpsb.supabase.co';
  const supabaseKey = 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Since phy-2 was generated beautifully, let's keep it!
  const { error } = await supabase
    .from('chapter_content')
    .delete()
    .neq('chapter_id', 'phy-2');

  if (error) {
    console.error('Failed to wipe legacy JSON:', error);
  } else {
    console.log('Successfully wiped legacy JSON for all chapters except phy-2.');
  }
}

wipeLegacy().catch(console.error);
