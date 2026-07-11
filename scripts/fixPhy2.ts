
async function fixPhy2() {
  const supabaseUrl = 'https://osbpdjlywgydidzurpsb.supabase.co';
  const supabaseKey = 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';
  const bulkKey = 'bulk-gen-override-secret-9912';

  const res = await fetch(`${supabaseUrl}/functions/v1/generate-notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'X-Bulk-Generate-Key': bulkKey
    },
    body: JSON.stringify({
      chapterId: 'phy-2',
      chapterName: 'Laws of Motion',
      subject: 'Physics',
      action: 'clearCache'
    })
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);
}

fixPhy2().catch(console.error);
