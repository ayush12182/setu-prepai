import { UnifiedQuestion } from '@/data/offlineQuestionBank';

interface CacheItem {
  timestamp: number;
  questions: UnifiedQuestion[];
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export function getCachedQuestions(key: string): UnifiedQuestion[] | null {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: CacheItem = JSON.parse(itemStr);
    const now = Date.now();

    if (now - item.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return item.questions;
  } catch (e) {
    console.error('Error reading from question cache:', e);
    return null;
  }
}

export function setCachedQuestions(key: string, questions: UnifiedQuestion[]): void {
  try {
    const item: CacheItem = {
      timestamp: Date.now(),
      questions,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.error('Error writing to question cache:', e);
  }
}

export function generateCacheKey(
  exam: string,
  subject: string,
  chapter: string,
  difficulty: string
): string {
  const normExam = exam.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normSubject = subject.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normChapter = chapter.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normDifficulty = difficulty.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `prepentrance-q-cache:${normExam}-${normSubject}-${normChapter}-${normDifficulty}`;
}
