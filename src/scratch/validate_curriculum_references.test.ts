import { test, expect } from 'vitest';
import { UNIVERSAL_CURRICULUM_GRAPH } from '../data/curriculum';
import { FORMULA_REGISTRY } from '../data/formulas';
import { UNIVERSAL_MISCONCEPTION_REGISTRY } from '../data/misconceptions';
import { PYQ_DNA_REGISTRY } from '../data/pyq-dna';

test('Verify Curriculum Graph Reference Integrity', () => {
  console.log('=== STARTING INTEGRITY VERIFICATION ===');
  
  let chaptersMappedCount = 0;
  let conceptsMappedCount = 0;
  let formulasIndexedCount = Object.keys(FORMULA_REGISTRY).length;
  let misconceptionsIndexedCount = Object.keys(UNIVERSAL_MISCONCEPTION_REGISTRY).length;
  let pyqDnaIndexedCount = Object.keys(PYQ_DNA_REGISTRY).length;

  Object.entries(UNIVERSAL_CURRICULUM_GRAPH).forEach(([subj, chapters]) => {
    console.log(`Auditing Subject: ${subj}`);
    Object.entries(chapters).forEach(([chapterName, concepts]) => {
      chaptersMappedCount++;
      console.log(`  Chapter: ${chapterName} (${concepts.length} concepts)`);
      
      concepts.forEach(concept => {
        conceptsMappedCount++;
        console.log(`    Concept: ${concept.name}`);
        
        // 1. Verify formula references
        concept.formulas.forEach(formId => {
          expect(FORMULA_REGISTRY[formId]).toBeDefined();
          console.log(`      ✓ Formula matched: ${formId}`);
        });

        // 2. Verify misconception references
        concept.commonMisconceptions?.forEach(miscId => {
          expect(UNIVERSAL_MISCONCEPTION_REGISTRY[miscId]).toBeDefined();
          console.log(`      ✓ Misconception matched: ${miscId}`);
        });

        // 3. Verify PYQ references
        concept.pyqClusters?.forEach(pyqId => {
          expect(PYQ_DNA_REGISTRY[pyqId]).toBeDefined();
          console.log(`      ✓ PYQ DNA matched: ${pyqId}`);
        });
      });
    });
  });

  console.log('\n=== INTEGRITY AUDIT REPORT ===');
  console.log(`- Chapters covered: ${chaptersMappedCount}`);
  console.log(`- Concepts mapped: ${conceptsMappedCount}`);
  console.log(`- Formulas indexed: ${formulasIndexedCount}`);
  console.log(`- Misconceptions indexed: ${misconceptionsIndexedCount}`);
  console.log(`- PYQ DNA entries created: ${pyqDnaIndexedCount}`);
  console.log('=============================');
});
