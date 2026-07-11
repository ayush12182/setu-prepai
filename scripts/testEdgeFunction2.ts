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
        chapterName: chapterId === 'chem-2' ? 'Atomic Structure' : 'Functions & Relations',
        subject: chapterId === 'chem-2' ? 'Chemistry' : 'Mathematics',
        topics: [],
        examType: examType,
        language: "english"
      })
    });
    const text = await response.text();
    console.log(`${chapterId} response:`, text);
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await test('chem-2', 'JEE');
}

run();
