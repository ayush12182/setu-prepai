const baseUrl = "https://osbpdjlywgydidzurpsb.supabase.co/functions/v1/generate-notes";

async function test(chapterId, examType) {
  console.log(`Testing ${chapterId}...`);
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-student-auth": "true",
        "x-admin-key": "admin_test_123"
      },
      body: JSON.stringify({
        chapterId: chapterId,
        chapterName: 'Functions & Relations',
        subject: 'Mathematics',
        topics: [],
        examType: examType,
        language: "english"
      })
    });
    const text = await response.text();
    console.log(`${chapterId} response:`, text.substring(0, 100) + "...");
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await test('math-custom-functions', 'JEE');
}

run();
