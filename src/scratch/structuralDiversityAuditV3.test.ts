import { describe, it } from 'vitest';
import { runStructuralDiversityAuditV3 } from './structuralDiversityAuditV3';

describe('Structural Diversity Audit V3 — Student Thinking Diversity', () => {
  it('runs full structural fingerprint + solving path audit and generates report', () => {
    runStructuralDiversityAuditV3();
  }, 300_000);
});
