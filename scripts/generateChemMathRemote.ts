import { chemistryChapters, mathsChapters } from '../src/data/syllabus';

const SUPABASE_EDGE_FUNCTION_URL = "https://osbpdjlywgydidzurpsb.supabase.co/functions/v1/generate-notes";
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function run() {
  const allChapters = [...chemistryChapters, ...mathsChapters];
  
  console.log(`🚀 Starting remote generation for ${allChapters.length} chapters (Chemistry + Maths)...`);
  
  for (const chapter of allChapters) {
    // Skip chem-2 because it's hardcoded as a demo in the edge function already
    if (chapter.id === 'chem-2') continue;
    
    console.log(`\n⏳ Triggering generation for ${chapter.name} (${chapter.id})...`);
    
    try {
      const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          chapterName: chapter.name,
          subject: chapter.subject.charAt(0).toUpperCase() + chapter.subject.slice(1),
          topics: chapter.topics || [],
          examType: "JEE",
          examMode: "JEE",
          language: "english"
        })
      });

      const text = await response.text();
      
      if (response.ok) {
        console.log(`✅ Success for ${chapter.name}!`);
      } else {
        if (text.includes("Chapter already exists")) {
            console.log(`ℹ️ Chapter already exists: ${chapter.name}`);
        } else {
            console.log(`❌ Failed for ${chapter.name}. Status: ${response.status}. Error: ${text.substring(0, 100)}`);
        }
      }
    } catch (e: any) {
      console.log(`❌ Network Error for ${chapter.name}: ${e.message}`);
    }
    
    // Pause for 1 second to avoid overwhelming the server
    await sleep(1000);
  }
  
  console.log("\n🎉 Chemistry and Maths generation trigger script complete!");
}

run();
