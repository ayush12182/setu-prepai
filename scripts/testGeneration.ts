const SUPABASE_EDGE_FUNCTION_URL = "https://osbpdjlywgydidzurpsb.supabase.co/functions/v1/generate-notes";

async function testGeneration() {
  console.log("Triggering generation for 'Work, Energy and Power' (phy-3)...");
  
  const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chapterId: "phy-3",
      chapterName: "Work, Energy and Power",
      subject: "Physics",
      topics: [],
      examType: "JEE",
      examMode: "JEE",
      language: "english"
    })
  });

  const status = response.status;
  const text = await response.text();
  
  console.log(`Response Status: ${status}`);
  console.log(`Response Body:`, text.substring(0, 500));
}

testGeneration();
