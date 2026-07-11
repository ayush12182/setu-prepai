import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function main() {
  console.log("Invoking generate-test...");
  const { data, error } = await supabase.functions.invoke('generate-test', {
    body: {
      exam: 'JEE',
      subject: 'Physics',
      chapter: 'Kinematics',
      difficulty: 'medium',
      count: 3
    }
  });
  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
main();
