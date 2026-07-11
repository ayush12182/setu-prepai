import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const promptFile = path.join(process.cwd(), 'scripts/pasted_prompt.txt');
const content = fs.readFileSync(promptFile, 'utf8');

// Match either physics chapter 4 or chapter 5 blocks.
// Let's divide the text into sections to know which chapter we are parsing.
const sections = content.split(/PrepEntrance Elite Question Repository \(PEQR\)/i);

interface RawQuestion {
  chapterId: string;
  qNum: number;
  topic: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}

const parsedQuestions: RawQuestion[] = [];

for (const section of sections) {
  if (!section.trim()) continue;
  
  // Detect chapter
  let chapterId = '';
  if (section.includes("Chapter 4") || section.includes("Centre of Mass")) {
    chapterId = 'phy-4';
  } else if (section.includes("Chapter 5") || section.includes("Rotational Motion")) {
    chapterId = 'phy-5';
  } else {
    continue;
  }

  // Regex to extract questions
  const qRegex = /Q(\d+)\.\s*([^\n\r]+)([\s\S]*?)Answer:\s*([A-D])/gi;
  let match;
  while ((match = qRegex.exec(section)) !== null) {
    const qNum = parseInt(match[1], 10);
    const topic = match[2].trim();
    const bodyAndOptions = match[3].trim();
    const answer = match[4].trim().toUpperCase();

    // Parse options
    // Find A., B., C., D.
    const optARegex = /A\.\s*([\s\S]*?)(?=B\.\s*)/i;
    const optBRegex = /B\.\s*([\s\S]*?)(?=C\.\s*)/i;
    const optCRegex = /C\.\s*([\s\S]*?)(?=D\.\s*)/i;
    const optDRegex = /D\.\s*([\s\S]*?)$/i;

    const matchA = optARegex.exec(bodyAndOptions);
    const matchB = optBRegex.exec(bodyAndOptions);
    const matchC = optCRegex.exec(bodyAndOptions);
    const matchD = optDRegex.exec(bodyAndOptions);

    if (!matchA || !matchB || !matchC || !matchD) {
      console.warn(`Skipping Q${qNum} in ${chapterId} because options could not be parsed:`, bodyAndOptions);
      continue;
    }

    const optionA = matchA[1].trim();
    const optionB = matchB[1].trim();
    const optionC = matchC[1].trim();
    const optionD = matchD[1].trim();

    // The question text is everything before option A
    const beforeA = bodyAndOptions.split(/A\.\s*/i)[0].trim();
    const questionText = beforeA;

    parsedQuestions.push({
      chapterId,
      qNum,
      topic,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      answer
    });
  }
}

console.log(`Successfully parsed ${parsedQuestions.length} questions.`);

// Map of chapter subchapters to distribute them
// Since these are already generated, we can look up which subchapter fits.
// Or we can just assign subchapter_id to chapterId if no specific mapping is needed,
// or we can map them dynamically based on topic keywords.
function getSubchapterId(chapterId: string, topic: string, text: string): string {
  const combined = (topic + ' ' + text).toLowerCase();
  if (chapterId === 'phy-4') {
    // subchapters for phy-4:
    // phy-4-sub-1: Centre of Mass
    // phy-4-sub-2: Momentum Conservation & Recoil
    // phy-4-sub-3: Impulse
    // phy-4-sub-4: Collisions
    // phy-4-sub-5: Variable Mass
    if (combined.includes('collision') || combined.includes('impact') || combined.includes('elastic') || combined.includes('inelastic')) return 'phy-4-sub-4';
    if (combined.includes('impulse') || combined.includes('force-time') || combined.includes('change velocity')) return 'phy-4-sub-3';
    if (combined.includes('recoil') || combined.includes('recoils') || combined.includes('fire') || combined.includes('explosion') || combined.includes('explodes') || combined.includes('rocket')) return 'phy-4-sub-2';
    return 'phy-4-sub-1'; // Default Centre of Mass
  } else if (chapterId === 'phy-5') {
    // subchapters for phy-5:
    // phy-5-sub-1: Moment of Inertia
    // phy-5-sub-2: Torque & Angular Acceleration
    // phy-5-sub-3: Rotational Work, Energy & Power
    // phy-5-sub-4: Angular Momentum & Conservation
    // phy-5-sub-5: Rolling Motion
    if (combined.includes('rolling') || combined.includes('rolls') || combined.includes('pure rolling') || combined.includes('slipping')) return 'phy-5-sub-5';
    if (combined.includes('angular momentum') || combined.includes('skater') || combined.includes('conservation') || combined.includes('platform')) return 'phy-5-sub-4';
    if (combined.includes('work') || combined.includes('kinetic energy') || combined.includes('ke') || combined.includes('power') || combined.includes('flywheel')) return 'phy-5-sub-3';
    if (combined.includes('torque') || combined.includes('equilibrium') || combined.includes('spanner') || combined.includes('acceleration') || combined.includes('alpha') || combined.includes('rpm') || combined.includes('velocity')) return 'phy-5-sub-2';
    return 'phy-5-sub-1'; // Default Moment of Inertia
  }
  return chapterId;
}

// Generate SQL Insert script
let sqlContent = '';

for (const q of parsedQuestions) {
  const subchapterId = getSubchapterId(q.chapterId, q.topic, q.questionText);
  
  // Escape single quotes for SQL
  const escapeSql = (str: string) => str.replace(/'/g, "''");
  
  const questionTextEscaped = escapeSql(q.questionText);
  const optionAEscaped = escapeSql(q.optionA);
  const optionBEscaped = escapeSql(q.optionB);
  const optionCEscaped = escapeSql(q.optionC);
  const optionDEscaped = escapeSql(q.optionD);
  const explanation = `Concept: ${q.topic}. Correct Answer is Option ${q.answer}.`;

  sqlContent += `INSERT INTO questions (
    chapter_id,
    subchapter_id,
    subject,
    difficulty,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
    explanation,
    concept_tested,
    verification_status,
    is_verified,
    exam_type,
    question_type,
    source
  ) VALUES (
    '${q.chapterId}',
    '${subchapterId}',
    'Physics',
    'medium',
    '${questionTextEscaped}',
    '${optionAEscaped}',
    '${optionBEscaped}',
    '${optionCEscaped}',
    '${optionDEscaped}',
    '${q.answer}',
    '${escapeSql(explanation)}',
    '${escapeSql(q.topic)}',
    'APPROVED',
    true,
    'JEE_MAINS',
    'MCQ',
    'PrepEntrance Elite Pasted'
  );\n`;
}

const sqlFile = path.join(process.cwd(), 'scripts/seed_pasted.sql');
fs.writeFileSync(sqlFile, sqlContent);
console.log(`Wrote SQL to ${sqlFile}`);
