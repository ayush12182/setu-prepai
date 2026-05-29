import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Resource, HubFilters, Bookmark } from '@/types/hub';

// ─── useResources ─────────────────────────────────────────────────────────────
export function useResources(filters: HubFilters) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = (supabase as any)
        .from('resources')
        .select('*')
        .eq('exam', filters.exam)
        .eq('class', filters.class)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (filters.resourceType) q = q.eq('resource_type', filters.resourceType);
      if (filters.subject)      q = q.eq('subject', filters.subject);
      if (filters.difficulty)   q = q.eq('difficulty', filters.difficulty);
      if (filters.language)     q = q.eq('language', filters.language);
      if (filters.search)       q = q.ilike('title', `%${filters.search}%`);

      const { data, error: err } = await q;
      if (err) throw err;
      setResources((data as Resource[]) ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [
    filters.exam, filters.class, filters.resourceType,
    filters.subject, filters.difficulty, filters.language, filters.search,
  ]);

  useEffect(() => { fetch(); }, [fetch]);

  return { resources, loading, error, refetch: fetch };
}

// ─── useResourceSearch ────────────────────────────────────────────────────────
export function useResourceSearch(query: string) {
  const [results, setResults] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from('resources')
        .select('id, title, exam, class, subject, resource_type, sub_type')
        .ilike('title', `%${query}%`)
        .eq('is_published', true)
        .limit(8);
      setResults((data as Resource[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return { results, loading };
}

// ─── useBookmarks ─────────────────────────────────────────────────────────────
export function useBookmarks(userId: string | null) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (supabase as any)
      .from('bookmarks')
      .select('resource_id')
      .eq('user_id', userId)
      .then(({ data }: { data: Bookmark[] | null }) => {
        setBookmarks(new Set((data ?? []).map(b => b.resource_id)));
        setLoading(false);
      });
  }, [userId]);

  const toggle = useCallback(async (resourceId: string) => {
    if (!userId) return;
    if (bookmarks.has(resourceId)) {
      await (supabase as any).from('bookmarks').delete()
        .eq('user_id', userId).eq('resource_id', resourceId);
      setBookmarks(prev => { const s = new Set(prev); s.delete(resourceId); return s; });
    } else {
      await (supabase as any).from('bookmarks').insert({ user_id: userId, resource_id: resourceId });
      setBookmarks(prev => new Set(prev).add(resourceId));
    }
  }, [userId, bookmarks]);

  return { bookmarks, loading, toggle };
}

// ─── useRecentlyViewed ────────────────────────────────────────────────────────
export function useRecentlyViewed(userId: string | null) {
  const [recent, setRecent] = useState<Resource[]>([]);

  useEffect(() => {
    if (!userId) return;
    (supabase as any)
      .from('user_progress')
      .select('resource_id, resources(*)')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(6)
      .then(({ data }: any) => {
        setRecent((data ?? []).map((d: any) => d.resources).filter(Boolean));
      });
  }, [userId]);

  return recent;
}

// ─── trackView ────────────────────────────────────────────────────────────────
export async function trackView(userId: string | null, resourceId: string) {
  if (!userId) {
    // increment view_count publicly
    await (supabase as any).rpc('increment_resource_view', { rid: resourceId }).catch(() => {});
    return;
  }
  await (supabase as any).from('user_progress').upsert({
    user_id: userId,
    resource_id: resourceId,
    viewed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,resource_id' });
}
