import { describe, it } from 'vitest';
import { runStructuralDiversityAuditV2 } from './structuralDiversityAudit';

describe('Structural Diversity Audit V2', () => {
  it('runs the full structural diversity audit and generates the report', () => {
    runStructuralDiversityAuditV2();
  }, 120_000);
});
