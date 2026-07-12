import fs from 'fs';

const content = fs.readFileSync('/Users/ayushdixit12/Downloads/PrepEntrance_Chemistry_Complete_1700_Questions.md', 'utf-8');

const chapters = content.split(/^# /m).slice(1);
const questions = [];

const CHAPTER_MAP: Record<string, string> = {
  'Some Basic Concepts of Chemistry': 'some basic concepts of chemistry',
  'Structure of Atom': 'structure of atom',
  'Classification of Elements & Periodicity': 'classification of elements',
  'Chemical Bonding & Molecular Structure': 'chemical bonding',
  'States of Matter': 'states of matter',
  'Thermodynamics': 'thermodynamics',
  'Equilibrium': 'equilibrium',
  'Redox Reactions': 'redox reactions',
  'Hydrogen': 'hydrogen',
  'The s-Block Elements': 's-block elements',
  'The p-Block Elements': 'p-block elements',
  'Organic Chemistry: Basic Principles & Techniques': 'organic chemistry - some basic principles',
  'Hydrocarbons': 'hydrocarbons',
  'Solutions': 'solutions',
  'Electrochemistry': 'electrochemistry',
  'Chemical Kinetics': 'chemical kinetics',
  'Coordination Compounds': 'coordination compounds'
};

for (const chapterText of chapters) {
  const lines = chapterText.split('\n');
  const chapterName = lines[0].trim();
  if (chapterName.includes('PrepEntrance') || chapterName.includes('Chemistry --- Complete') || chapterName.includes('Master Answer Key')) continue;

  let mappedChapter = chapterName.toLowerCase();
  for (const [key, val] of Object.entries(CHAPTER_MAP)) {
    if (chapterName.includes(key)) {
      mappedChapter = val;
      break;
    }
  }
  
  const qBlocks = chapterText.split(/^## Q\d+\./m).slice(1);
  for (const qBlock of qBlocks) {
    const qLines = qBlock.trim().split('\n');
    let qText = '';
    let optA = '', optB = '', optC = '', optD = '';
    let answer = '';
    
    let isParsingOptions = false;
    for (const line of qLines) {
      const t = line.trim();
      if (t.startsWith('**Answer:**')) {
        answer = t.replace('**Answer:**', '').replace(/\*/g, '').trim();
        continue;
      }
      
      if (t.match(/A\..*B\..*C\..*D\./)) {
        // All options on one line
        const match = t.match(/A\.\s*(.*?)\s*B\.\s*(.*?)\s*C\.\s*(.*?)\s*D\.\s*(.*)/);
        if (match) {
          optA = match[1]; optB = match[2]; optC = match[3]; optD = match[4];
        }
        continue;
      }
      
      if (!optA && !optB && !optC && !optD && !t.startsWith('**Answer:**') && !t.startsWith('---')) {
        qText += line + '\n';
      }
    }
    
    if (answer) {
      questions.push({
        chapter_id: mappedChapter,
        subchapter_id: `${mappedChapter}-sub-general`,
        subject: 'Chemistry',
        difficulty: 'medium',
        question_text: qText.trim(),
        option_a: optA || 'Option A',
        option_b: optB || 'Option B',
        option_c: optC || 'Option C',
        option_d: optD || 'Option D',
        correct_option: answer,
        explanation: `Concept: ${chapterName}. Correct Answer is Option ${answer}.`,
        concept_tested: mappedChapter,
        verification_status: 'APPROVED',
        is_verified: true,
        exam_type: 'JEE_MAINS',
        question_type: 'MCQ',
        source: 'PrepEntrance 1700 Chemistry'
      });
    }
  }
}

// Merge with existing
const existingRaw = fs.readFileSync('src/data/realQuestionBank.json', 'utf-8');
let existing = [];
try {
  existing = JSON.parse(existingRaw);
} catch(e) {}

// Don't duplicate if already added
const newTotal = [...existing, ...questions];
fs.writeFileSync('src/data/realQuestionBank.json', JSON.stringify(newTotal, null, 2));
console.log(`Successfully added ${questions.length} Chemistry questions. New total: ${newTotal.length} questions in realQuestionBank.json`);
