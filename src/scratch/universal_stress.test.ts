import { test, expect, beforeAll, afterAll } from 'vitest';
import { generateQuestions } from '../services/questionGenerator';
import { UNIVERSAL_TOPIC_CATALOG } from '../services/topicCatalog';
import { generateReadinessReport } from './productionReadinessReport';

const originalFetch = globalThis.fetch;

beforeAll(() => {
  import.meta.env.VITE_GEMINI_API_KEY = 'mock-api-key';

  // Globally mock fetch to resolve all topic requests instantly to support stress testing
  globalThis.fetch = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify({ questions: [] }) }] // Return empty questions to force fallback recovery padding
            }
          }
        ]
      })
    } as Response;
  };
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

test('Universal Syllabus Stress Test and Coverage Crawler', async () => {
  console.log('=== STARTING UNIVERSAL SYLLABUS STRESS TEST ===');
  
  const testTopics = Object.keys(UNIVERSAL_TOPIC_CATALOG);
  const testSizes = [10, 30, 50, 100];

  let sessionsAttempted = 0;
  let sessionsSucceeded = 0;
  let duplicateDetections = 0;
  const startTime = Date.now();

  // Sweep all predefined topics across different counts
  for (let i = 0; i < Math.min(100, testTopics.length); i++) {
    const topic = testTopics[i];
    const size = testSizes[i % testSizes.length];
    sessionsAttempted++;

    const startSessionTime = Date.now();
    try {
      const result = await generateQuestions({
        exam: 'JEE',
        subject: 'Physics', // resolver will auto-determine correct parent chapter
        chapter: topic,
        difficulty: 'medium',
        count: size
      });

      expect(result.questions.length).toBe(size);

      // Check for duplicate IDs
      const ids = result.questions.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);

      sessionsSucceeded++;
      const duration = Date.now() - startSessionTime;
      console.log(`  ✓ Topic "${topic}" (${size} Qs) resolved successfully in ${duration}ms.`);
    } catch (e: any) {
      console.error(`  × Topic "${topic}" failed to resolve:`, e.message);
    }
  }

  const totalTimeMs = Date.now() - startTime;
  const avgTimeMs = totalTimeMs / sessionsAttempted;
  
  console.log(`\n=== STRESS TEST SUMMARY ===`);
  console.log(`- Sessions Attempted: ${sessionsAttempted}`);
  console.log(`- Sessions Succeeded: ${sessionsSucceeded}`);
  console.log(`- Success Rate: ${((sessionsSucceeded / sessionsAttempted) * 100).toFixed(2)}%`);
  console.log(`- Average Resolution Time: ${avgTimeMs.toFixed(1)}ms`);

  expect(sessionsSucceeded).toBe(sessionsAttempted); // MUST be 100% success rate
  expect(avgTimeMs).toBeLessThan(5000); // Latency must be < 5 seconds

  // Generate final readiness report
  const report = generateReadinessReport({
    totalSessionsAttempted: sessionsAttempted,
    sessionsSucceeded,
    duplicateDetections,
    totalTimeMs
  });

  expect(report.scores.overallReadinessScore).toBeGreaterThanOrEqual(80.0);
});
