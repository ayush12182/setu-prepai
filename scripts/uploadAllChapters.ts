import { loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 1. Physics Batch 1
const BATCH_1_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Physics_Chapters_01_to_07_Master_Notes');
const BATCH_1_CHAPTERS = [
  { file: '01_Units_and_Dimensions_Complete_Master_Notes.md', id: 'phy-0', name: 'Units & Dimensions' },
  { file: '02_Kinematics_Complete_Master_Notes.md', id: 'phy-1', name: 'Kinematics' },
  { file: '03_Laws_of_Motion_Complete_Master_Notes.md', id: 'phy-2', name: 'Laws of Motion' },
  { file: '04_Work_Energy_and_Power_Complete_Master_Notes.md', id: 'phy-3', name: 'Work, Energy & Power' },
  { file: '05_System_of_Particles_and_Centre_of_Mass_Complete_Master_Notes.md', id: 'phy-4', name: 'System of Particles & Centre of Mass' },
  { file: '06_Rotational_Motion_Complete_Master_Notes.md', id: 'phy-5', name: 'Rotational Motion' },
  { file: '07_Gravitation_Complete_Master_Notes.md', id: 'phy-6', name: 'Gravitation' }
];

// 2. Physics Batch 2
const BATCH_2_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Physics_Chapters_08_to_14_Master_Notes');
const BATCH_2_CHAPTERS = [
  { file: '08_Mechanical_Properties_of_Solids_Complete_Master_Notes.md', id: 'phy-7', name: 'Mechanical Properties of Solids' },
  { file: '09_Mechanical_Properties_of_Fluids_Complete_Master_Notes.md', id: 'phy-8', name: 'Mechanical Properties of Fluids' },
  { file: '10_SHM_and_Waves_Complete_Master_Notes.md', id: 'phy-9', name: 'SHM & Waves' },
  { file: '11_Thermodynamics_Complete_Master_Notes.md', id: 'phy-10', name: 'Thermodynamics' },
  { file: '12_Electrostatics_Complete_Master_Notes.md', id: 'phy-11', name: 'Electrostatics' },
  { file: '13_Current_Electricity_Complete_Master_Notes.md', id: 'phy-12', name: 'Current Electricity' },
  { file: '14_Magnetism_and_EMI_Complete_Master_Notes.md', id: 'phy-13', name: 'Magnetism & EMI' }
];

// 3. Physics Batch 3
const BATCH_3_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Physics_Chapters_15_to_16_Master_Notes');
const BATCH_3_CHAPTERS = [
  { file: '15_Optics_Complete_Master_Notes.md', id: 'phy-14', name: 'Optics' },
  { file: '16_Modern_Physics_Complete_Master_Notes.md', id: 'phy-15', name: 'Modern Physics' }
];

// 4. Chemistry
const CHEM_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Chemistry_Chapters_01_to_12_Master_Notes');
const CHEM_CHAPTERS = [
  { file: '01_Mole_Concept_Stoichiometry_Complete_Master_Notes.md', id: 'chem-1', name: 'Mole Concept & Stoichiometry' },
  { file: '02_Atomic_Structure_Complete_Master_Notes.md', id: 'chem-2', name: 'Atomic Structure' },
  { file: '03_Chemical_Bonding_Complete_Master_Notes.md', id: 'chem-3', name: 'Chemical Bonding' },
  { file: '04_Thermodynamics_Thermochemistry_Complete_Master_Notes.md', id: 'chem-4', name: 'Thermodynamics & Thermochemistry' },
  { file: '05_Chemical_Equilibrium_Complete_Master_Notes.md', id: 'chem-5', name: 'Chemical Equilibrium' },
  { file: '06_Electrochemistry_Complete_Master_Notes.md', id: 'chem-6', name: 'Electrochemistry' },
  { file: '07_Chemical_Kinetics_Complete_Master_Notes.md', id: 'chem-7', name: 'Chemical Kinetics' },
  { file: '08_GOC_Isomerism_Complete_Master_Notes.md', id: 'chem-8', name: 'GOC & Isomerism' },
  { file: '09_Hydrocarbons_Complete_Master_Notes.md', id: 'chem-9', name: 'Hydrocarbons' },
  { file: '10_Organic_Reactions_Named_Reactions_Complete_Master_Notes.md', id: 'chem-10', name: 'Organic Reactions & Named Reactions' },
  { file: '11_Periodic_Table_Trends_Complete_Master_Notes.md', id: 'chem-11', name: 'Periodic Table & Trends' },
  { file: '12_Coordination_Chemistry_Complete_Master_Notes.md', id: 'chem-12', name: 'Coordination Chemistry' }
];

// 5. Maths
const MATH_DIR = path.join(os.homedir(), 'Downloads', 'PrepEntrance_Mathematics_Chapters_01_to_12_Master_Notes');
const MATH_CHAPTERS = [
  { file: '01_Quadratic_Equations_Expressions_Complete_Master_Notes.md', id: 'math-1', name: 'Quadratic Equations & Expressions' },
  { file: '02_Complex_Numbers_Complete_Master_Notes.md', id: 'math-2', name: 'Complex Numbers' },
  { file: '03_Matrices_Determinants_Complete_Master_Notes.md', id: 'math-3', name: 'Matrices & Determinants' },
  { file: '04_Permutations_Combinations_Complete_Master_Notes.md', id: 'math-4', name: 'Permutations & Combinations' },
  { file: '05_Probability_Complete_Master_Notes.md', id: 'math-5', name: 'Probability' },
  { file: '06_Limits_Continuity_Differentiability_Complete_Master_Notes.md', id: 'math-6', name: 'Limits, Continuity & Differentiability' },
  { file: '07_Differentiation_Complete_Master_Notes.md', id: 'math-7', name: 'Differentiation' },
  { file: '08_Application_of_Derivatives_Complete_Master_Notes.md', id: 'math-8', name: 'Application of Derivatives' },
  { file: '09_Integration_Complete_Master_Notes.md', id: 'math-9', name: 'Integration' },
  { file: '10_Coordinate_Geometry_Complete_Master_Notes.md', id: 'math-10', name: 'Coordinate Geometry' },
  { file: '11_Vectors_3D_Geometry_Complete_Master_Notes.md', id: 'math-11', name: 'Vectors & 3D Geometry' },
  { file: '12_Trigonometry_Complete_Master_Notes.md', id: 'math-12', name: 'Trigonometry' }
];

const ALL_TASKS = [
  { dir: BATCH_1_DIR, chapters: BATCH_1_CHAPTERS, subject: 'physics' },
  { dir: BATCH_2_DIR, chapters: BATCH_2_CHAPTERS, subject: 'physics' },
  { dir: BATCH_3_DIR, chapters: BATCH_3_CHAPTERS, subject: 'physics' },
  { dir: CHEM_DIR, chapters: CHEM_CHAPTERS, subject: 'chemistry' },
  { dir: MATH_DIR, chapters: MATH_CHAPTERS, subject: 'maths' },
];

async function saveToDb(chapterId: string, chapterName: string, rawContent: string, subject: string): Promise<boolean> {
  const slug = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const wordCount = rawContent.split(/\s+/).length;

  const url = `${SUPABASE_URL}/functions/v1/save-local-notes`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: "LOCAL_BULK_SCRIPT",
      chapter_id: chapterId,
      chapter_slug: slug,
      chapter_name: chapterName,
      subject: subject,
      exam_type: 'JEE',
      language: 'english',
      version: 3, // Force version 3 to bypass any existing versions
      version_label: '3.0',
      status: 'published',
      raw_content: rawContent,
      word_count: wordCount,
      generation_model: 'manual-upload-v3',
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`  DB Error for ${chapterName}: ${errText.slice(0, 200)}`);
    return false;
  }
  return true;
}

async function main() {
  console.log("Starting bulk upload of 40 chapters...");
  let successCount = 0;
  let failCount = 0;

  for (const task of ALL_TASKS) {
    for (const ch of task.chapters) {
      try {
        const filePath = path.join(task.dir, ch.file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          console.log(`Uploading ${ch.name}...`);
          const success = await saveToDb(ch.id, ch.name, content, task.subject);
          if (success) {
            console.log(`  ✅ Successfully uploaded ${ch.name}`);
            successCount++;
          } else {
            failCount++;
          }
        } else {
          console.log(`  ❌ File not found: ${filePath}`);
          failCount++;
        }
      } catch (err) {
        console.error(`  Failed to process ${ch.name}:`, err);
        failCount++;
      }
    }
  }

  console.log(`\nUpload complete. Success: ${successCount}, Failed: ${failCount}`);
}

main();
