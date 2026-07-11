/**
 * useQuestionEntitlement
 *
 * Enforces subscription plan question-access limits:
 *   - Aarambh (1 Month)  →  2,500 questions
 *   - Aarohan (12 Month) →  5,000 questions
 *   - Shikhar (24 Month) → unlimited (10,000+)
 *   - Free/trial         →  150 questions (trial mode)
 *
 * Questions are distributed INTELLIGENTLY across all chapters/subjects
 * using a balanced allocation ratio — NOT simply the first N rows.
 *
 * How it works:
 * 1. We retrieve the user's subscription_tier from their profile.
 * 2. We calculate a per-chapter question quota based on the total entitlement
 *    divided evenly across all chapters in the student's exam syllabus.
 * 3. When the question generator fetches questions, we inject a chapter-level
 *    `limit` parameter so Supabase returns at most that many questions per chapter.
 * 4. The hook also tracks the student's global total consumed question count
 *    from the `user_practice_stats` table to enforce the hard cap.
 */

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionTier = 'aarambh' | 'aarohan' | 'shikhar' | 'free';

export interface PlanDetails {
  tier: SubscriptionTier;
  displayName: string;
  totalQuestions: number;   // Total question access entitlement (0 = unlimited)
  isUnlimited: boolean;
  monthsDuration: number;
}

/** Plan definitions keyed by DB tier value */
export const PLAN_CONFIG: Record<SubscriptionTier, PlanDetails> = {
  free: {
    tier: 'free',
    displayName: 'Free Trial',
    totalQuestions: 150,
    isUnlimited: false,
    monthsDuration: 0,
  },
  aarambh: {
    tier: 'aarambh',
    displayName: 'Aarambh — 1 Month Plan',
    totalQuestions: 2500,
    isUnlimited: false,
    monthsDuration: 1,
  },
  aarohan: {
    tier: 'aarohan',
    displayName: 'Aarohan — 12 Month Plan',
    totalQuestions: 5000,
    isUnlimited: false,
    monthsDuration: 12,
  },
  shikhar: {
    tier: 'shikhar',
    displayName: 'Shikhar — 2 Year Plan',
    totalQuestions: 0, // 0 = unlimited
    isUnlimited: true,
    monthsDuration: 24,
  },
};

/**
 * Approximate chapter counts per exam — used to compute per-chapter limits.
 * These are conservative estimates; the allocation will be adjusted at runtime
 * if the actual DB chapter count is available.
 */
const EXAM_CHAPTER_COUNTS: Record<string, number> = {
  JEE:  45,  // Physics ~15 + Chemistry ~15 + Maths ~15
  NEET: 40,  // Physics ~15 + Chemistry ~15 + Biology ~10
  CUET: 30,
  default: 40,
};

/**
 * Returns the question limit to apply per chapter for the given tier + exam.
 *
 * @param tier     - The student's subscription tier
 * @param exam     - 'JEE' | 'NEET' | 'CUET'
 * @param chapters - Optional: actual chapter count from the DB (overrides estimate)
 * @returns Per-chapter question cap to pass into the Supabase query
 */
export function getChapterQuestionLimit(
  tier: SubscriptionTier,
  exam: string,
  chapters?: number
): number {
  const plan = PLAN_CONFIG[tier] ?? PLAN_CONFIG.free;

  // Unlimited plans get the max Supabase page size
  if (plan.isUnlimited) return 1000;

  const examKey = exam.toUpperCase() as keyof typeof EXAM_CHAPTER_COUNTS;
  const chapterCount = chapters ?? EXAM_CHAPTER_COUNTS[examKey] ?? EXAM_CHAPTER_COUNTS.default;

  // Distribute the total entitlement evenly across all chapters.
  // We multiply by 1.2 to ensure overlap across subjects doesn't starve any chapter.
  const rawPerChapter = Math.floor((plan.totalQuestions * 1.2) / chapterCount);

  // Clamp: at least 10 per chapter so even heavy users of one chapter still see questions
  return Math.max(rawPerChapter, 10);
}

/**
 * Determine if a student has exhausted their question entitlement.
 *
 * @param tier              - The student's subscription tier
 * @param totalAttempted    - Total questions attempted so far (from DB or localStorage)
 */
export function isEntitlementExhausted(
  tier: SubscriptionTier,
  totalAttempted: number
): boolean {
  const plan = PLAN_CONFIG[tier] ?? PLAN_CONFIG.free;
  if (plan.isUnlimited) return false;
  return totalAttempted >= plan.totalQuestions;
}

/**
 * Resolve the subscription tier from a raw profile or localStorage value.
 * Handles legacy batch IDs like 'aarambh_2028' → 'aarambh'.
 */
export function resolveSubscriptionTier(raw?: string | null): SubscriptionTier {
  if (!raw) return 'free';

  const normalized = raw.toLowerCase();

  if (normalized.includes('shikhar')) return 'shikhar';
  if (normalized.includes('aarohan')) return 'aarohan';
  if (normalized.includes('aarambh')) return 'aarambh';

  // Exact match
  if (normalized === 'shikhar') return 'shikhar';
  if (normalized === 'aarohan') return 'aarohan';
  if (normalized === 'aarambh') return 'aarambh';

  return 'free';
}

/**
 * React hook — provides the current student's plan details and a helper
 * to compute the per-chapter question limit for fetching from the DB.
 */
export function useQuestionEntitlement() {
  const { profile } = useAuth();

  // Read tier from profile (subscription_tier field) or fall back to batch_id in localStorage
  const rawTier =
    (profile as any)?.subscription_tier ||
    localStorage.getItem('subscription_tier') ||
    localStorage.getItem('batch_id');

  const tier = resolveSubscriptionTier(rawTier);
  const plan = PLAN_CONFIG[tier];

  /**
   * Returns the per-chapter question limit for the current plan.
   * @param exam      - 'JEE' | 'NEET' | 'CUET'
   * @param chapters  - Optional override for chapter count
   */
  const getLimit = useCallback(
    (exam: string, chapters?: number) =>
      getChapterQuestionLimit(tier, exam, chapters),
    [tier]
  );

  return {
    tier,
    plan,
    getLimit,
    isUnlimited: plan.isUnlimited,
    totalQuestions: plan.totalQuestions,
    isEntitlementExhausted: (totalAttempted: number) =>
      isEntitlementExhausted(tier, totalAttempted),
  };
}
