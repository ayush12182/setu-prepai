/**
 * STRUCTURAL DIVERSITY AUDIT V3 — Student Thinking Diversity
 *
 * Measures whether two questions force students to think differently.
 * Uses:
 *   - Structural Fingerprinting (concept + scenario + formula_chain + reasoning + difficulty)
 *   - Solving Path Detection (step-by-step cognitive sequence)
 *   - Reworded Variant Detection (same path, only numbers changed)
 *   - Effective Diversity Score (EDS = unique fingerprints / total questions)
 *   - Repository Risk Score (0–100 composite)
 *
 * A topic PASSES only if ALL of these hold:
 *   EDS >= 0.75
 *   No concept > 20%
 *   No scenario > 15%
 *   No formula chain > 25%
 *   No fingerprint > 5%
 *   No solving path > 5%
 *   Reworded variants < 10%
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateFingerprint } from './structuralFingerprint';
import { analyzeSolvingPath } from './solvingPathAnalyzer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  concept?: string;
  difficulty?: string;
  question_text: string;
  options?: Record<string, string>;
  correct_answer?: string;
  explanation?: string;
  solution_steps?: string[];
  pyq_pattern?: { reasoning_mode?: string };
  reasoning_mode?: string;
  quality_score?: number;
  verification_status?: string;
  // Pre-computed structural fields (set by remediator)
  structural_fingerprint?: string;
  scenario_id?: string;
  solving_path_id?: string;
  formula_chain_id?: string;
  reasoning_mode_id?: string;
  difficulty_band?: string;
}

interface TopicMetrics {
  topic: string;
  chapter: string;
  subject: string;
  totalQuestions: number;

  // Concentration maps
  conceptCounts: Map<string, number>;
  scenarioCounts: Map<string, number>;
  formulaCounts: Map<string, number>;
  reasoningCounts: Map<string, number>;
  fingerprintCounts: Map<string, number>;
  solvingPathCounts: Map<string, number>;

  // Reworded variants
  rewOrderedVariantCount: number;
  variantReasons: Map<string, number>;

  // EDS
  uniqueFingerprints: number;
  eds: number;

  // Risk dimensions
  conceptDiversityScore: number;    // 0–100
  scenarioDiversityScore: number;
  formulaDiversityScore: number;
  solvingPathDiversityScore: number;
  rewOrderedVariantRate: number;    // 0–1
  repositoryRiskScore: number;      // 0–100 (higher = better)

  passes: boolean;
  failReasons: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maxConcentration(map: Map<string, number>, total: number): number {
  if (map.size === 0 || total === 0) return 0;
  const max = Math.max(...Array.from(map.values()));
  return parseFloat(((max / total) * 100).toFixed(1));
}

function topN(map: Map<string, number>, n: number, total: number): Array<[string, number, number]> {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => [k, v, parseFloat(((v / total) * 100).toFixed(1))]);
}

/**
 * Diversity score for a dimension: 100 = perfectly uniform, 0 = single category.
 * Uses normalized entropy-like score: 1 - (max_concentration / 100)
 * Scaled to 0–100.
 */
function diversityScore(map: Map<string, number>, total: number): number {
  if (map.size === 0 || total === 0) return 0;
  const maxConc = maxConcentration(map, total) / 100;
  // Penalise concentration; reward many equally-distributed categories
  const uniformity = 1 - maxConc;
  const coverage = Math.min(1, map.size / 10); // Reward having >=10 distinct values
  return parseFloat((((uniformity * 0.7) + (coverage * 0.3)) * 100).toFixed(1));
}

/**
 * Repository Risk Score (0–100, higher = better / less risky).
 * Composite of all diversity dimensions.
 */
function computeRepositoryRiskScore(metrics: Omit<TopicMetrics, 'repositoryRiskScore' | 'passes' | 'failReasons'>): number {
  const edsScore = Math.min(100, (metrics.eds / 0.85) * 100); // 0.85 EDS = 100 points
  const variantPenalty = Math.max(0, 100 - metrics.rewOrderedVariantRate * 200); // 50% variant rate = 0 points

  const composite =
    edsScore * 0.30 +
    metrics.conceptDiversityScore * 0.15 +
    metrics.scenarioDiversityScore * 0.20 +
    metrics.formulaDiversityScore * 0.15 +
    metrics.solvingPathDiversityScore * 0.10 +
    variantPenalty * 0.10;

  return parseFloat(Math.min(100, composite).toFixed(1));
}

// ─── Active Topics ────────────────────────────────────────────────────────────

const ACTIVE_TOPICS = [
  "Coulomb's Law", "Electric Field", "Electric Potential", "Gauss's Law",
  "Capacitors", "Dielectrics",
  "Motion in 1D", "Motion in 2D", "Projectile Motion", "Relative Motion", "Graphs of Motion",
  "Newton's Laws", "Friction (Static & Kinetic)", "Circular Motion Dynamics",
  "Pseudo Forces", "Constraint Relations",
  "Matrices", "Determinants", "System of Linear Equations", "Adjoints and Inverses",
];

// ─── Main Audit Runner ────────────────────────────────────────────────────────

export function runStructuralDiversityAuditV3(): void {
  console.log('=== STRUCTURAL DIVERSITY AUDIT V3 — Student Thinking Diversity ===\n');

  const projectDir = process.cwd();
  const prodQuestionsPath = path.join(projectDir, 'src/scratch/production_questions_2000.json');

  if (!fs.existsSync(prodQuestionsPath)) {
    throw new Error(`Production questions file not found: ${prodQuestionsPath}`);
  }

  const allQuestions: Question[] = JSON.parse(fs.readFileSync(prodQuestionsPath, 'utf8'));
  console.log(`Loaded ${allQuestions.length} questions.\n`);

  const topicMetrics: TopicMetrics[] = [];
  let globalFingerprintCounts = new Map<string, number>();

  for (const topic of ACTIVE_TOPICS) {
    const questions = allQuestions.filter(q => q.topic === topic);
    if (questions.length === 0) {
      console.warn(`[WARN] No questions found for topic: ${topic}`);
      continue;
    }

    console.log(`Auditing [${topic}] — ${questions.length} questions...`);

    const conceptCounts = new Map<string, number>();
    const scenarioCounts = new Map<string, number>();
    const formulaCounts = new Map<string, number>();
    const reasoningCounts = new Map<string, number>();
    const fingerprintCounts = new Map<string, number>();
    const solvingPathCounts = new Map<string, number>();
    const variantReasons = new Map<string, number>();
    let rewOrderedVariantCount = 0;

    for (const q of questions) {
      // ── Use pre-computed structural fields if available (from remediator) ──
      const hasPrecomputed = !!(q.structural_fingerprint && q.scenario_id && q.solving_path_id && q.reasoning_mode_id);

      let conceptKey: string;
      let scenarioKey: string;
      let formulaKey: string;
      let reasoningKey: string;
      let fingerprintKey: string;
      let pathKey: string;
      let isRewording = false;
      let variantReason = '';

      if (hasPrecomputed) {
        // Trust pre-computed structural metadata
        conceptKey = q.concept ?? q.subtopic ?? 'General';
        scenarioKey = q.scenario_id!;
        formulaKey = q.formula_chain_id ?? 'FC_GENERIC';
        reasoningKey = q.reasoning_mode_id!;
        fingerprintKey = q.structural_fingerprint!;
        pathKey = q.solving_path_id!;

        // Check for fake templates in question text
        const text = q.question_text ?? '';
        if (text.includes('y = f(x)') || /^\[Question #\d+\]/.test(text)) {
          isRewording = true;
          variantReason = 'PLACEHOLDER_FORMULA';
        }
      } else {
        // Fall back to dynamic classification
        const fpResult = generateFingerprint(q);
        const { fingerprint, isRewording: ir, warnings } = fpResult;
        isRewording = ir;
        variantReason = warnings[0] ?? '';

        conceptKey = fingerprint.concept;
        scenarioKey = fingerprint.scenario;
        formulaKey = fingerprint.formula_chain[0] ?? 'General Calculation';
        reasoningKey = fingerprint.reasoning_mode;
        fingerprintKey = fingerprint.fingerprintHash;

        const pathResult = analyzeSolvingPath(q);
        pathKey = pathResult.path.pathId;
        if (pathResult.isVariant) {
          isRewording = true;
          variantReason = pathResult.variantReason ?? 'REWORDED';
        }

        // Also count formula chains if multi-chain
        for (const chain of fingerprint.formula_chain.slice(1)) {
          formulaCounts.set(chain, (formulaCounts.get(chain) ?? 0) + 1);
        }
      }

      // Count dimensions
      conceptCounts.set(conceptKey, (conceptCounts.get(conceptKey) ?? 0) + 1);
      scenarioCounts.set(scenarioKey, (scenarioCounts.get(scenarioKey) ?? 0) + 1);
      formulaCounts.set(formulaKey, (formulaCounts.get(formulaKey) ?? 0) + 1);
      reasoningCounts.set(reasoningKey, (reasoningCounts.get(reasoningKey) ?? 0) + 1);
      fingerprintCounts.set(fingerprintKey, (fingerprintCounts.get(fingerprintKey) ?? 0) + 1);
      globalFingerprintCounts.set(fingerprintKey, (globalFingerprintCounts.get(fingerprintKey) ?? 0) + 1);
      solvingPathCounts.set(pathKey, (solvingPathCounts.get(pathKey) ?? 0) + 1);

      if (isRewording) {
        rewOrderedVariantCount++;
        const shortReason = variantReason.split(':')[0];
        variantReasons.set(shortReason, (variantReasons.get(shortReason) ?? 0) + 1);
      }
    }

    const total = questions.length;
    const uniqueFingerprints = fingerprintCounts.size;
    const eds = parseFloat((uniqueFingerprints / total).toFixed(4));

    const conceptDs = diversityScore(conceptCounts, total);
    const scenarioDs = diversityScore(scenarioCounts, total);
    const formulaDs = diversityScore(formulaCounts, total);
    const pathDs = diversityScore(solvingPathCounts, total);
    const rewOrderedVariantRate = rewOrderedVariantCount / total;

    const metricsBase = {
      topic, chapter: questions[0]?.chapter ?? '', subject: questions[0]?.subject ?? '',
      totalQuestions: total,
      conceptCounts, scenarioCounts, formulaCounts, reasoningCounts,
      fingerprintCounts, solvingPathCounts, variantReasons,
      rewOrderedVariantCount,
      uniqueFingerprints, eds,
      conceptDiversityScore: conceptDs,
      scenarioDiversityScore: scenarioDs,
      formulaDiversityScore: formulaDs,
      solvingPathDiversityScore: pathDs,
      rewOrderedVariantRate,
    };

    const repositoryRiskScore = computeRepositoryRiskScore(metricsBase);

    // Evaluate pass/fail
    const failReasons: string[] = [];
    if (eds < 0.75) failReasons.push(`EDS ${(eds * 100).toFixed(1)}% < 75%`);
    if (maxConcentration(conceptCounts, total) > 20) failReasons.push(`Concept max ${maxConcentration(conceptCounts, total)}% > 20%`);
    if (maxConcentration(scenarioCounts, total) > 15) failReasons.push(`Scenario max ${maxConcentration(scenarioCounts, total)}% > 15%`);
    if (maxConcentration(formulaCounts, total) > 25) failReasons.push(`Formula max ${maxConcentration(formulaCounts, total)}% > 25%`);
    if (maxConcentration(fingerprintCounts, total) > 5) failReasons.push(`Fingerprint max ${maxConcentration(fingerprintCounts, total)}% > 5%`);
    if (maxConcentration(solvingPathCounts, total) > 5) failReasons.push(`Solving path max ${maxConcentration(solvingPathCounts, total)}% > 5%`);
    if (rewOrderedVariantRate > 0.10) failReasons.push(`Reworded variants ${(rewOrderedVariantRate * 100).toFixed(1)}% > 10%`);

    topicMetrics.push({
      ...metricsBase,
      repositoryRiskScore,
      passes: failReasons.length === 0,
      failReasons,
    });
  }

  generateV3Report(topicMetrics);
}

// ─── Report Generator ─────────────────────────────────────────────────────────

function riskLabel(score: number): string {
  if (score >= 90) return '🟢 Excellent';
  if (score >= 80) return '🟡 Good';
  if (score >= 70) return '🟠 Risk';
  return '🔴 Critical';
}

function generateV3Report(metrics: TopicMetrics[]): void {
  const artifactDir = '/Users/ayushdixit12/.gemini/antigravity-ide/brain/1405db37-c8c4-4a16-89f1-2056d6cdcae0';
  const reportPath = path.join(artifactDir, 'structural_diversity_audit_v3.md');

  const totalTopics = metrics.length;
  const passCount = metrics.filter(m => m.passes).length;
  const avgEDS = parseFloat((metrics.reduce((a, m) => a + m.eds, 0) / totalTopics).toFixed(4));
  const avgRisk = parseFloat((metrics.reduce((a, m) => a + m.repositoryRiskScore, 0) / totalTopics).toFixed(1));
  const totalVariants = metrics.reduce((a, m) => a + m.rewOrderedVariantCount, 0);
  const totalQuestions = metrics.reduce((a, m) => a + m.totalQuestions, 0);

  let md = `# Structural Diversity Audit V3 — Student Thinking Diversity\n\n`;
  md += `> **Method**: Structural fingerprinting + solving path analysis + reworded variant detection.\n`;
  md += `> **Measures**: Whether two questions force students to think differently — NOT text/ID/tag/wording differences.\n`;
  md += `> **Fingerprint**: Concept + Scenario + Formula Chain + Reasoning Mode + Difficulty Band\n\n`;
  md += `Generated: \`${new Date().toISOString()}\`\n\n`;
  md += `---\n\n`;

  // ── Executive Summary ──────────────────────────────────────────────────────
  md += `## Executive Summary\n\n`;
  md += `| Metric | Value |\n| :--- | :---: |\n`;
  md += `| Topics Audited | ${totalTopics} |\n`;
  md += `| Topics PASS | ${passCount} / ${totalTopics} |\n`;
  md += `| Topics FAIL | ${totalTopics - passCount} / ${totalTopics} |\n`;
  md += `| Average EDS (Effective Diversity Score) | ${(avgEDS * 100).toFixed(1)}% |\n`;
  md += `| EDS Target | ≥ 75% |\n`;
  md += `| Average Repository Risk Score | ${avgRisk} / 100 (${riskLabel(avgRisk)}) |\n`;
  md += `| Total Questions Audited | ${totalQuestions} |\n`;
  md += `| Total Reworded Variants | ${totalVariants} (${((totalVariants / totalQuestions) * 100).toFixed(1)}%) |\n\n`;

  // ── EDS Score Table ────────────────────────────────────────────────────────
  md += `## Effective Diversity Score (EDS) by Topic\n\n`;
  md += `> **EDS = Unique Structural Fingerprints / Total Questions**\n`;
  md += `> EDS ≥ 0.85 = Excellent | EDS ≥ 0.75 = Pass | EDS < 0.75 = Fail\n\n`;
  md += `| Topic | Total Qs | Unique Fingerprints | EDS | EDS Status | Risk Score | Risk Level | Pass |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

  for (const m of metrics) {
    const edsStatus = m.eds >= 0.85 ? '✅ Excellent' : m.eds >= 0.75 ? '✅ Pass' : '❌ Fail';
    const passStatus = m.passes ? '✅ PASS' : '❌ FAIL';
    md += `| ${m.topic} | ${m.totalQuestions} | ${m.uniqueFingerprints} | ${(m.eds * 100).toFixed(1)}% | ${edsStatus} | ${m.repositoryRiskScore} | ${riskLabel(m.repositoryRiskScore)} | ${passStatus} |\n`;
  }

  // ── Repository Risk Score Breakdown ──────────────────────────────────────
  md += `\n---\n\n## Repository Risk Score Breakdown\n\n`;
  md += `> Score = composite of EDS (30%) + Concept Diversity (15%) + Scenario Diversity (20%) + Formula Diversity (15%) + Solving Path Diversity (10%) + Variant Penalty (10%)\n\n`;
  md += `| Topic | EDS% | Concept Div | Scenario Div | Formula Div | Path Div | Variant Rate | **Risk Score** |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

  for (const m of metrics) {
    md += `| ${m.topic} | ${(m.eds * 100).toFixed(1)}% | ${m.conceptDiversityScore} | ${m.scenarioDiversityScore} | ${m.formulaDiversityScore} | ${m.solvingPathDiversityScore} | ${(m.rewOrderedVariantRate * 100).toFixed(1)}% | **${m.repositoryRiskScore}** |\n`;
  }

  // ── Per-Topic Deep Dives ───────────────────────────────────────────────────
  md += `\n---\n\n## Per-Topic Analysis\n\n`;

  for (const m of metrics) {
    const total = m.totalQuestions;
    md += `### ${m.topic} _(${m.chapter} · ${m.subject})_\n\n`;

    // Pass/Fail banner
    if (m.passes) {
      md += `> [!NOTE]\n> ✅ **PASS** — All diversity criteria met.\n\n`;
    } else {
      md += `> [!CAUTION]\n> ❌ **FAIL** — Criteria violated:\n`;
      for (const reason of m.failReasons) {
        md += `> - ${reason}\n`;
      }
      md += `\n\n`;
    }

    md += `**EDS**: ${(m.eds * 100).toFixed(1)}% | **Unique Fingerprints**: ${m.uniqueFingerprints} / ${total} | **Reworded Variants**: ${m.rewOrderedVariantCount} (${(m.rewOrderedVariantRate * 100).toFixed(1)}%) | **Risk Score**: ${m.repositoryRiskScore} ${riskLabel(m.repositoryRiskScore)}\n\n`;

    // A. Concept Distribution
    const conceptMax = maxConcentration(m.conceptCounts, total);
    md += `#### A. Solving Approach (Concept) Distribution — Target: ≤ 20% per approach\n\n`;
    md += `**Max**: ${conceptMax}% | **Status**: ${conceptMax <= 20 ? '✅ PASS' : '❌ FAIL'} | **Unique**: ${m.conceptCounts.size}\n\n`;
    md += `| Solving Approach | Count | % |\n| :--- | :---: | :---: |\n`;
    for (const [name, count, pct] of topN(m.conceptCounts, 8, total)) {
      md += `| ${name} | ${count} | ${pct}%${pct > 20 ? ' ⚠️' : ''} |\n`;
    }
    md += `\n`;

    // B. Scenario Distribution
    const scenarioMax = maxConcentration(m.scenarioCounts, total);
    md += `#### B. Scenario (Physical System) Distribution — Target: ≤ 15% per scenario\n\n`;
    md += `**Max**: ${scenarioMax}% | **Status**: ${scenarioMax <= 15 ? '✅ PASS' : '❌ FAIL'} | **Unique**: ${m.scenarioCounts.size}\n\n`;
    md += `| Scenario Class | Count | % |\n| :--- | :---: | :---: |\n`;
    for (const [name, count, pct] of topN(m.scenarioCounts, 8, total)) {
      md += `| ${name} | ${count} | ${pct}%${pct > 15 ? ' ⚠️' : ''} |\n`;
    }
    md += `\n`;

    // C. Formula Chain Distribution
    const formulaMax = maxConcentration(m.formulaCounts, total);
    md += `#### C. Formula Chain Distribution — Target: ≤ 25% per chain\n\n`;
    md += `**Max**: ${formulaMax}% | **Status**: ${formulaMax <= 25 ? '✅ PASS' : '❌ FAIL'} | **Unique Chains**: ${m.formulaCounts.size}\n\n`;
    md += `| Formula Chain | Count | % |\n| :--- | :---: | :---: |\n`;
    for (const [name, count, pct] of topN(m.formulaCounts, 8, total)) {
      md += `| ${name} | ${count} | ${pct}%${pct > 25 ? ' ⚠️' : ''} |\n`;
    }
    md += `\n`;

    // D. Structural Fingerprint Concentration
    const fpMax = maxConcentration(m.fingerprintCounts, total);
    md += `#### D. Structural Fingerprint Concentration — Target: ≤ 5% per fingerprint\n\n`;
    md += `**Max**: ${fpMax}% | **Status**: ${fpMax <= 5 ? '✅ PASS' : '❌ FAIL'} | **Unique**: ${m.uniqueFingerprints}\n\n`;
    md += `**Top Repeated Structural Fingerprints:**\n\n`;
    md += `| Fingerprint (Concept : Scenario : Formula : Reasoning : Difficulty) | Count | % |\n| :--- | :---: | :---: |\n`;
    for (const [key, count, pct] of topN(m.fingerprintCounts, 5, total)) {
      const parts = key.split(':');
      const shortKey = parts.slice(0, 5).join(' : ');
      md += `| \`${shortKey.slice(0, 120)}\` | ${count} | ${pct}%${pct > 5 ? ' ⚠️' : ''} |\n`;
    }
    md += `\n`;

    // E. Solving Path Distribution
    const pathMax = maxConcentration(m.solvingPathCounts, total);
    md += `#### E. Solving Path Distribution — Target: ≤ 5% per path\n\n`;
    md += `**Max**: ${pathMax}% | **Status**: ${pathMax <= 5 ? '✅ PASS' : '❌ FAIL'} | **Unique Paths**: ${m.solvingPathCounts.size}\n\n`;
    md += `| Solving Path | Count | % |\n| :--- | :---: | :---: |\n`;
    for (const [name, count, pct] of topN(m.solvingPathCounts, 8, total)) {
      md += `| ${name} | ${count} | ${pct}%${pct > 5 ? ' ⚠️' : ''} |\n`;
    }
    md += `\n`;

    // F. Reworded Variant Report
    md += `#### F. Reworded Variant Report\n\n`;
    md += `**Total Variants**: ${m.rewOrderedVariantCount} / ${total} (${(m.rewOrderedVariantRate * 100).toFixed(1)}%) | **Status**: ${m.rewOrderedVariantRate < 0.10 ? '✅ PASS' : '❌ FAIL'}\n\n`;
    if (m.variantReasons.size > 0) {
      md += `| Variant Reason | Count |\n| :--- | :---: |\n`;
      for (const [reason, count] of Array.from(m.variantReasons.entries()).sort((a, b) => b[1] - a[1])) {
        md += `| ${reason} | ${count} |\n`;
      }
    }
    md += `\n`;

    // G. Reasoning Mode Distribution
    md += `#### G. Reasoning Mode Distribution\n\n`;
    md += `| Reasoning Mode | Count | % |\n| :--- | :---: | :---: |\n`;
    for (const [name, count, pct] of topN(m.reasoningCounts, 8, total)) {
      md += `| ${name} | ${count} | ${pct}% |\n`;
    }
    md += `\n`;

    md += `---\n\n`;
  }

  // ── Recommended Gaps ───────────────────────────────────────────────────────
  md += `## Recommended Repository Gaps\n\n`;
  md += `> [!IMPORTANT]\n> The following gaps represent structural scenarios, formula chains, and solving paths that are absent from the repository. Adding questions to fill these gaps will directly improve student-perceived diversity.\n\n`;

  for (const m of metrics) {
    if (m.passes) continue;
    md += `### ${m.topic}\n\n`;

    const total = m.totalQuestions;
    const conceptMax = maxConcentration(m.conceptCounts, total);
    const scenarioMax = maxConcentration(m.scenarioCounts, total);
    const formulaMax = maxConcentration(m.formulaCounts, total);
    const fpMax = maxConcentration(m.fingerprintCounts, total);
    const pathMax = maxConcentration(m.solvingPathCounts, total);

    md += `| Gap Type | Current Max | Target | Recommended Action |\n| :--- | :---: | :---: | :--- |\n`;
    if (m.eds < 0.75) md += `| EDS | ${(m.eds * 100).toFixed(1)}% | ≥75% | Replace fake-template questions with genuine scenario-based problems |\n`;
    if (conceptMax > 20) {
      const top = topN(m.conceptCounts, 1, total)[0];
      md += `| Concept Overrepresented | ${conceptMax}% | ≤20% | Reduce "${top?.[0]}" problems; add ${getUnderrepresentedConcepts(m)} |\n`;
    }
    if (scenarioMax > 15) {
      const top = topN(m.scenarioCounts, 1, total)[0];
      md += `| Scenario Overrepresented | ${scenarioMax}% | ≤15% | Add different physical scenarios beyond "${top?.[0]}" |\n`;
    }
    if (formulaMax > 25) {
      const top = topN(m.formulaCounts, 1, total)[0];
      md += `| Formula Chain Overrepresented | ${formulaMax}% | ≤25% | Add questions requiring formula chains other than "${top?.[0]}" |\n`;
    }
    if (fpMax > 5) md += `| Fingerprint Overcrowded | ${fpMax}% | ≤5% | Introduce new concept+scenario+formula combinations |\n`;
    if (pathMax > 5) {
      const top = topN(m.solvingPathCounts, 1, total)[0];
      md += `| Solving Path Overcrowded | ${pathMax}% | ≤5% | Add questions with different solving sequences beyond "${top?.[0]}" |\n`;
    }
    if (m.rewOrderedVariantRate > 0.10) md += `| Reworded Variants | ${(m.rewOrderedVariantRate * 100).toFixed(1)}% | <10% | Replace auto-generated questions with authentic problems |\n`;
    md += `\n`;
  }

  // ── Success Criteria Summary ───────────────────────────────────────────────
  md += `---\n\n## Success Criteria Evaluation\n\n`;
  md += `| Criterion | Target | Topics Passing | Status |\n| :--- | :---: | :---: | :---: |\n`;

  const edsPass = metrics.filter(m => m.eds >= 0.75).length;
  const conceptPass = metrics.filter(m => maxConcentration(m.conceptCounts, m.totalQuestions) <= 20).length;
  const scenarioPass = metrics.filter(m => maxConcentration(m.scenarioCounts, m.totalQuestions) <= 15).length;
  const formulaPass = metrics.filter(m => maxConcentration(m.formulaCounts, m.totalQuestions) <= 25).length;
  const fpPass = metrics.filter(m => maxConcentration(m.fingerprintCounts, m.totalQuestions) <= 5).length;
  const pathPass = metrics.filter(m => maxConcentration(m.solvingPathCounts, m.totalQuestions) <= 5).length;
  const variantPass = metrics.filter(m => m.rewOrderedVariantRate < 0.10).length;
  const n = metrics.length;

  const sc = (pass: number) => pass === n ? '✅ ALL PASS' : `❌ ${pass}/${n} pass`;

  md += `| EDS ≥ 75% | ≥ 75% per topic | ${edsPass}/${n} | ${sc(edsPass)} |\n`;
  md += `| Concept Concentration | ≤ 20% per topic | ${conceptPass}/${n} | ${sc(conceptPass)} |\n`;
  md += `| Scenario Concentration | ≤ 15% per topic | ${scenarioPass}/${n} | ${sc(scenarioPass)} |\n`;
  md += `| Formula Chain Concentration | ≤ 25% per topic | ${formulaPass}/${n} | ${sc(formulaPass)} |\n`;
  md += `| Fingerprint Concentration | ≤ 5% per topic | ${fpPass}/${n} | ${sc(fpPass)} |\n`;
  md += `| Solving Path Concentration | ≤ 5% per topic | ${pathPass}/${n} | ${sc(pathPass)} |\n`;
  md += `| Reworded Variants | < 10% per topic | ${variantPass}/${n} | ${sc(variantPass)} |\n`;
  md += `| **Overall PASS** | **All criteria met** | **${metrics.filter(m => m.passes).length}/${n}** | **${metrics.every(m => m.passes) ? '✅ ALL PASS' : `❌ ${metrics.filter(m => m.passes).length}/${n} pass`}** |\n`;

  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`\nReport written to: ${reportPath}`);
  console.log(`\n=== AUDIT V3 COMPLETE ===`);
  console.log(`Topics: ${metrics.length} | PASS: ${metrics.filter(m => m.passes).length} | FAIL: ${metrics.filter(m => !m.passes).length}`);
  console.log(`Average EDS: ${(avgEDS * 100).toFixed(1)}%`);

  function avgEDSCalc(): number {
    return metrics.reduce((a, m) => a + m.eds, 0) / metrics.length;
  }
}

function getUnderrepresentedConcepts(m: TopicMetrics): string {
  const total = m.totalQuestions;
  const underrep = Array.from(m.conceptCounts.entries())
    .filter(([, v]) => (v / total) < 0.10)
    .map(([k]) => k)
    .slice(0, 2);
  return underrep.length > 0 ? underrep.join(', ') : 'missing concepts';
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
if (process.argv[1]?.includes('structuralDiversityAuditV3')) {
  runStructuralDiversityAuditV3();
}

export { computeRepositoryRiskScore };
