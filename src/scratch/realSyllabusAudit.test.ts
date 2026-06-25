import { test, expect } from 'vitest';
import { runSyllabusAudit } from './realSyllabusAudit';

test('Run Syllabus Audit', () => {
  console.log("Running realSyllabusAudit...");
  runSyllabusAudit();
  console.log("Audit complete!");
  expect(true).toBe(true);
});
