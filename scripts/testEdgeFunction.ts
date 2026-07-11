const baseUrl = "https://osbpdjlywgydidzurpsb.supabase.co/functions/v1/generate-notes";

async function test(chapterId, examType) {
  console.log(`Testing ${chapterId}...`);
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-student-auth": "true",
      "x-admin-key": "admin_test_123" // we can pass anything, it triggers hasAdminKey = !!req.headers.get('x-admin-key')
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
  const data = await response.json();
  console.log(`${chapterId} response:`, data);
}

async function run() {
  await test('chem-2', 'JEE');
  await test('math-custom-functions', 'JEE');
}

run();
