/**
 * useChapterContent — React Query hook for permanent chapter content
 *
 * DESIGN:
 *   1. Check React Query in-memory cache    → <1ms
 *   2. Check localStorage (offline support) → <5ms
 *   3. Fetch from get-chapter-content edge  → ~200ms (DB read, no AI)
 *   4. Cache result for 1 hour
 *
 * ZERO AI calls. Content comes from the permanent DB repository.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "pe_chapter_content_v1_";
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export interface ChapterContentData {
  id: string;
  chapter_id: string;
  chapter_slug: string;
  chapter_name: string;
  subject: string;
  exam_type: string;
  language: string;
  version: number;
  version_label: string;
  status: "draft" | "published" | "archived";
  overview: Record<string, unknown> | null;
  theory: string | null;
  formulas: unknown[] | null;
  graphs: unknown[] | null;
  diagrams: unknown[] | null;
  worked_examples: unknown[] | null;
  pyq_insights: Record<string, unknown> | null;
  common_mistakes: string[] | null;
  revision_notes: string | null;
  flashcards: unknown[] | null;
  mind_map: Record<string, unknown> | null;
  raw_content: string | null;
  word_count: number | null;
  generation_model: string | null;
  published_at: string | null;
  updated_at: string | null;
}

interface LocalStorageCacheEntry {
  data: ChapterContentData;
  cachedAt: number;
}

function getCacheKey(chapterId: string, examType: string, language: string): string {
  return `${CACHE_PREFIX}${chapterId}_${examType}_${language}`;
}

function getLocalStorageCache(
  chapterId: string,
  examType: string,
  language: string
): ChapterContentData | undefined {
  try {
    const key = getCacheKey(chapterId, examType, language);
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const entry: LocalStorageCacheEntry = JSON.parse(raw);
    // Respect TTL
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return undefined;
    }
    return entry.data;
  } catch {
    return undefined;
  }
}

function setLocalStorageCache(
  chapterId: string,
  examType: string,
  language: string,
  data: ChapterContentData
): void {
  try {
    const key = getCacheKey(chapterId, examType, language);
    const entry: LocalStorageCacheEntry = { data, cachedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full — silently ignore
  }
}

async function fetchChapterContent(
  chapterId: string,
  examType: string,
  language: string
): Promise<ChapterContentData> {
  const { data: { session } } = await supabase.auth.getSession();
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const token = session?.access_token || anonKey;

  const params = new URLSearchParams({ chapterId, examType, language });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-chapter-content?${params}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    if (response.status === 404) {
      // Return a sentinel value so the UI can show "Coming Soon"
      throw new ContentNotPublishedError(chapterId);
    }
    throw new Error(json.error || `HTTP ${response.status}`);
  }

  return json.data as ChapterContentData;
}

export class ContentNotPublishedError extends Error {
  readonly chapterId: string;
  constructor(chapterId: string) {
    super("CONTENT_NOT_PUBLISHED");
    this.name = "ContentNotPublishedError";
    this.chapterId = chapterId;
  }
}

/**
 * Primary hook — use this in ChapterNotesPage.
 *
 * @example
 * const { data, isLoading, isNotPublished } = useChapterContent('phy-1');
 */
export function useChapterContent(
  chapterId: string | null | undefined,
  examType = "JEE",
  language = "english"
) {
  // Pre-fetch from localStorage so React Query shows it instantly
  const localCached = chapterId
    ? getLocalStorageCache(chapterId, examType, language)
    : undefined;

  const query = useQuery<ChapterContentData, Error>({
    queryKey: ["chapter-content", chapterId, examType, language],
    queryFn: async () => {
      if (!chapterId) throw new Error("chapterId is required");
      const data = await fetchChapterContent(chapterId, examType, language);
      // Save to localStorage for offline / next visit
      setLocalStorageCache(chapterId, examType, language, data);
      return data;
    },
    enabled: !!chapterId,
    // Cache for 1 hour — chapter content rarely changes
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS * 24,
    // Show localStorage cache immediately while fetching
    placeholderData: localCached,
    retry: (failureCount, error) => {
      // Don't retry "not published" errors
      if (error instanceof ContentNotPublishedError) return false;
      return failureCount < 2;
    },
  });

  const isNotPublished =
    query.isError && query.error instanceof ContentNotPublishedError;

  return {
    ...query,
    isNotPublished,
    content: query.data ?? null,
  };
}
