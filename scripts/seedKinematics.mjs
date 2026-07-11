import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const rawContent = `[METADATA]
chapter_slug: kinematics
chapter_name: Kinematics
subject: physics
topic_tree: Kinematics
[/METADATA]

# KINEMATICS — Complete Master Notes
PrepEntrance Physics | JEE Main • JEE Advanced • NEET • Class 11 • Droppers

## 1. Chapter Overview

### Why Kinematics matters

Kinematics is the grammar of physics. Before you can analyze why something moves (dynamics, forces, energy), you must be fluent in describing how it moves — position, velocity, acceleration, and their relationships in time. Every later chapter borrows this language directly:

- **Laws of Motion:** F = ma requires you to already know what "a" means and how to extract it from a graph or equation.
- **Work, Energy, Power:** velocity appears inside every energy and power expression.
- **Circular Motion:** is kinematics wrapped around a curved path — same ideas, polar coordinates.
- **Rotational Mechanics:** angular kinematics is a direct copy-paste of linear kinematics with θ, ω, α replacing x, v, a.
- **SHM and Waves:** are kinematics of a very specific kind of accelerated motion (acceleration proportional to displacement).

[TEACHER_SAYS]
Mastering kinematics means mastering the art of setting up equations correctly. The sign conventions are the biggest trap. If you get comfortable with vectors and graphical analysis here, the rest of physics will feel significantly easier.
[/TEACHER_SAYS]
`;

async function main() {
  console.log("Seeding Kinematics content to chapter_content table...");

  const { data, error } = await supabase
    .from('chapter_content')
    .upsert({
      chapter_id: 'phy-1',
      chapter_slug: 'kinematics',
      chapter_name: 'Kinematics',
      subject: 'physics',
      exam_type: 'JEE',
      language: 'english',
      version: 1,
      version_label: '1.0',
      status: 'published',
      raw_content: rawContent,
      word_count: rawContent.split(/\s+/).length,
      generation_model: 'manual',
      source: 'manual',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'chapter_id,exam_type,language,version'
    });
    
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success! Kinematics seeded.");
  }
}

main();
