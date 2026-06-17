import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osbpdjlywgydidzurpsb.supabase.co';
const supabaseKey = 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPYQ() {
  console.log("Invoking 'generate-pyq-questions'...");
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('generate-pyq-questions', {
      body: {
        subject: 'physics',
        chapterId: 'ch-rotational',
        yearRange: { start: 2020, end: 2024 },
        count: 5,
        examMode: 'JEE',
      }
    });
    console.log(`Finished 'generate-pyq-questions' in ${Date.now() - start}ms`);
    console.log("Error:", error);
    console.log("Data structure:", data ? Object.keys(data) : null);
    if (data?.questions) {
      console.log("Questions returned:", data.questions.length);
    }
  } catch (err) {
    console.error("Exception invoking 'generate-pyq-questions':", err);
  }
}

async function testAdaptive() {
  console.log("Invoking 'generate-adaptive-test'...");
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('generate-adaptive-test', {
      body: { count: 5 }
    });
    console.log(`Finished 'generate-adaptive-test' in ${Date.now() - start}ms`);
    console.log("Error:", error);
    console.log("Data structure:", data ? Object.keys(data) : null);
    if (data?.questions) {
      console.log("Questions returned:", data.questions.length);
    }
  } catch (err) {
    console.error("Exception invoking 'generate-adaptive-test':", err);
  }
}

async function run() {
  await testPYQ();
  console.log("---------------------------------------");
  await testAdaptive();
}

run();
