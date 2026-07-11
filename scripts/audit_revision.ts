import fs from 'fs';
import path from 'path';
import { physicsChapters, chemistryChapters, mathsChapters } from '../src/data/syllabus';

const jsonDir = path.join(process.cwd(), 'src/data/revision_json');
const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));

console.log(`Total JSON files discovered: ${files.length}`);

let totalMapped = 0;
let unmappedFiles = [...files];
const missingFieldsLog: string[] = [];
let totalErrors = 0;

const validateFields = (chapterId: string, data: any) => {
  const requiredFields = [
    'chapterTitle',
    'whyChapterMatters',
    'conceptMap',
    'keyFormulas',
    'pyqTrends',
    'highYieldTopics',
    'commonMistakes',
    'kotaFacultyTricks',
    'quickFormulaBox'
  ];
  let errCount = 0;
  for (const field of requiredFields) {
    if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
      if (field === 'conceptMap' && (!data.conceptMap || !data.conceptMap.nodes || data.conceptMap.nodes.length === 0)) {
         missingFieldsLog.push(`[RevisionData] ${chapterId} missing or empty conceptMap.nodes`);
         errCount++;
      } else if (field !== 'conceptMap') {
         missingFieldsLog.push(`[RevisionData] ${chapterId} missing or empty ${field}`);
         errCount++;
      }
    }
  }
  return errCount;
};

const mapChapters = (chapters: any[], subject: string) => {
  for (const chapter of chapters) {
    const idParts = chapter.id.split('-');
    const num = parseInt(idParts[1], 10);
    
    let fileIndex = num;
    if (subject === 'physics') {
      fileIndex = num + 1;
    }
    
    const filePrefix = `${subject}_${fileIndex.toString().padStart(2, '0')}`;
    const matchingFile = unmappedFiles.find(f => f.startsWith(filePrefix));
    
    if (matchingFile) {
      totalMapped++;
      unmappedFiles = unmappedFiles.filter(f => f !== matchingFile);
      
      const data = JSON.parse(fs.readFileSync(path.join(jsonDir, matchingFile), 'utf8'));
      const errs = validateFields(chapter.id, data);
      totalErrors += errs;
    } else {
      console.log(`[Missing JSON] ${chapter.id} (${chapter.name}) could not find file starting with ${filePrefix}`);
    }
  }
}

mapChapters(physicsChapters, 'physics');
mapChapters(chemistryChapters, 'chemistry');
mapChapters(mathsChapters, 'mathematics');

console.log(`Total chapters mapped: ${totalMapped}`);
console.log(`Unmapped files: ${unmappedFiles.length > 0 ? unmappedFiles.join(', ') : 'None'}`);
console.log(`Chapters with missing fields: ${missingFieldsLog.length > 0 ? missingFieldsLog.length : 'None'}`);

if (missingFieldsLog.length > 0) {
  missingFieldsLog.forEach(log => console.log(log));
}

if (totalErrors === 0 && unmappedFiles.length === 0 && totalMapped === 40) {
  console.log('✅ Audit Passed Successfully!');
} else {
  console.log('❌ Audit Failed!');
}
