import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_PUBLISHABLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("Calling generate-questions Edge Function...");
  const { data, error } = await supabase.functions.invoke('generate-questions', {
    body: {
      exam: 'JEE',
      subject: 'Physics',
      chapter: 'Kinematics',
      subtopic: 'Motion in 1D',
      difficulty: 'Medium',
      count: 2,
      excludeQuestionIds: []
    }
  });

  if (error) {
    console.error("Function error:", error);
  } else {
    console.log("Success! Received payload:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
