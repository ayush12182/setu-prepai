import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Seeding Kinematics manually...");
  
  const { data: chapterRes, error: chapErr } = await supabase
    .from('revision_chapter_metadata')
    .upsert({
      subject: 'physics',
      chapter_name: 'Kinematics',
      formula_count: 3,
      high_priority_formula_count: 2,
      revision_time_mins: 5,
      updated_at: new Date().toISOString()
    }, { onConflict: 'subject,chapter_name' })
    .select()
    .single();

  if (chapErr) {
    console.error("Metadata err", chapErr);
    return;
  }
  
  const chapterId = chapterRes.id;
  await supabase.from('revision_formulas').delete().eq('chapter_id', chapterId);

  const formulas = [
    {
      chapter_id: chapterId,
      subject: 'physics',
      chapter_name: 'Kinematics',
      topic: '1D Motion with Constant Acceleration',
      title: 'Equation of Motion (Velocity-Time)',
      latex: 'v = u + at',
      variables: [
        { symbol: 'v', meaning: 'Final velocity', unit: 'm/s' },
        { symbol: 'u', meaning: 'Initial velocity', unit: 'm/s' },
        { symbol: 'a', meaning: 'Acceleration', unit: 'm/s^2' },
        { symbol: 't', meaning: 'Time', unit: 's' }
      ],
      used_for: 'Finding velocity at time t when acceleration is constant',
      difficulty: 'Easy',
      importance: 5,
      jee_frequency: 'High',
      shortcut: 'Vat equation',
      common_mistake: 'Using this when acceleration is not constant.',
      tags: ['1D Motion', 'Kinematics']
    },
    {
      chapter_id: chapterId,
      subject: 'physics',
      chapter_name: 'Kinematics',
      topic: '1D Motion with Constant Acceleration',
      title: 'Equation of Motion (Displacement-Time)',
      latex: 's = ut + \\frac{1}{2}at^2',
      variables: [
        { symbol: 's', meaning: 'Displacement', unit: 'm' },
        { symbol: 'u', meaning: 'Initial velocity', unit: 'm/s' },
        { symbol: 'a', meaning: 'Acceleration', unit: 'm/s^2' },
        { symbol: 't', meaning: 'Time', unit: 's' }
      ],
      used_for: 'Finding displacement over time t',
      difficulty: 'Easy',
      importance: 5,
      jee_frequency: 'High',
      shortcut: 'Sut half at square',
      common_mistake: 'Confusing displacement with distance traveled.',
      tags: ['1D Motion', 'Kinematics']
    },
    {
      chapter_id: chapterId,
      subject: 'physics',
      chapter_name: 'Kinematics',
      topic: '1D Motion with Constant Acceleration',
      title: 'Equation of Motion (Velocity-Displacement)',
      latex: 'v^2 = u^2 + 2as',
      variables: [
        { symbol: 'v', meaning: 'Final velocity', unit: 'm/s' },
        { symbol: 'u', meaning: 'Initial velocity', unit: 'm/s' },
        { symbol: 'a', meaning: 'Acceleration', unit: 'm/s^2' },
        { symbol: 's', meaning: 'Displacement', unit: 'm' }
      ],
      used_for: 'Finding velocity when displacement is known and time is unknown',
      difficulty: 'Medium',
      importance: 4,
      jee_frequency: 'High',
      shortcut: 'v square minus u square is 2as',
      common_mistake: 'Forgetting the square on velocities.',
      tags: ['1D Motion', 'Kinematics']
    }
  ];

  const { error: insertErr } = await supabase.from('revision_formulas').insert(formulas);
  if (insertErr) {
    console.error("Insert err", insertErr);
  } else {
    console.log("Successfully seeded Kinematics!");
  }
}

run();
