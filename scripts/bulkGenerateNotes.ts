import { allChapters } from '../src/data/syllabus';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function bulkGenerate() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

  console.log(`Starting bulk generation for ${allChapters.length} chapters...`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < allChapters.length; i++) {
    const chapter = allChapters[i];
    console.log(`\n[${i+1}/${allChapters.length}] Processing ${chapter.id} (${chapter.name})...`);

    // Step 1: Wipe the legacy JSON for this chapter to ensure a clean slate
    try {
      await fetch(`${supabaseUrl}/functions/v1/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'X-Bulk-Generate-Key': 'bulk-gen-override-secret-9912'
        },
        body: JSON.stringify({
          chapterId: chapter.id,
          action: 'clearCache'
        })
      });
      console.log(`🧹 Wiped legacy data for ${chapter.name}`);
    } catch (e) {
      console.error(`❌ Failed to wipe ${chapter.name}:`, e);
    }

    // Step 2: Generate the new markdown notes
    let attempt = 0;
    const maxRetries = 5;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/generate-notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'X-Bulk-Generate-Key': 'bulk-gen-override-secret-9912'
          },
          body: JSON.stringify({
            chapterId: chapter.id,
            chapterName: chapter.name,
            subject: chapter.subject,
            topics: chapter.topics || [],
            examType: 'JEE',
            language: 'english',
            forceRegenerate: true
          })
        });

        if (res.status === 400) {
          console.log(`⏭️  Skipped (Already Published): ${chapter.name}`);
          skipCount++;
          success = true;
        } else if (res.status === 409) {
          console.log(`⚠️  Skipped (Lock Active / Generating): ${chapter.name}`);
          skipCount++;
          success = true;
        } else if (!res.ok) {
          console.error(`❌ Failed (Attempt ${attempt}): HTTP ${res.status}`);
          const text = await res.text();
          console.error(text);
          if (res.status === 500 && text.includes('429')) {
            console.log(`⏳ Rate limited! Waiting 60 seconds before retrying...`);
            await delay(60000);
          } else {
            // Unrecoverable error
            break;
          }
        } else {
          console.log(`✅ Success: Generated ${chapter.name}`);
          successCount++;
          success = true;
          // Wait 25 seconds after a successful generation to stay well under 20 RPM
          await delay(25000);
        }
      } catch (e) {
        console.error(`❌ Error triggering ${chapter.name} (Attempt ${attempt}):`, e);
        await delay(10000);
      }
    }

    if (!success) {
      failCount++;
      console.error(`💀 Exhausted all retries for ${chapter.name}. Skipping.`);
    }

    // Baseline delay to prevent spamming the edge function
    await delay(3000);
  }

  console.log(`\n\n🎉 Bulk Generation Complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

bulkGenerate().catch(console.error);
