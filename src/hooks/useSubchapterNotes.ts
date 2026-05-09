import { useState, useCallback } from 'react';
import { Subchapter } from '@/data/subchapters';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface StructuredNotes {
  chapter: string;
  formulaCards: { name: string; formula: string; variables: string; usage: string }[];
  concepts: { title: string; description: string }[];
  graphs: { title: string; description: string }[];
  mistakes: { wrong: string; right: string; why: string }[];
  pyqTriggers: { pattern: string; action: string }[];
  quickRevision: string[];
}

interface UseSubchapterNotesResult {
  notes: StructuredNotes | null;
  isLoading: boolean;
  error: string | null;
  generateNotes: (subchapter: Subchapter, chapterName: string, subject: string, examMode?: string) => Promise<void>;
}

export const useSubchapterNotes = (): UseSubchapterNotesResult => {
  const [notes, setNotes] = useState<StructuredNotes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const { isNeet, jeeSubMode } = useExamMode();

  const generateNotes = useCallback(async (
    subchapter: Subchapter,
    chapterName: string,
    subject: string,
    examMode = 'JEE'
  ) => {
    setIsLoading(true);
    setError(null);
    setNotes(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-subchapter-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          subchapterName: subchapter.name,
          chapterName,
          subject,
          jeeAsks: subchapter.jeeAsks,
          pyqFocus: subchapter.pyqFocus,
          commonMistakes: subchapter.commonMistakes,
          language,
          examMode,
          jeeSubMode: isNeet ? undefined : jeeSubMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate notes: ${response.status}`);
      }

      const rawJsonString = await response.text();
      try {
        // Strip out any potential markdown block backticks just in case the LLM ignored instructions
        const cleanJsonString = rawJsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const data = JSON.parse(cleanJsonString);
        setNotes(data as StructuredNotes);
      } catch (e) {
        console.error("Failed to parse JSON response:", rawJsonString);
        throw new Error("Failed to parse notes format from AI.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating notes';
      setError(errorMessage);
      console.error('Notes generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language, isNeet, jeeSubMode]);

  return { notes, isLoading, error, generateNotes };
};
