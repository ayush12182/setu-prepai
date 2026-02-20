import { useState, useCallback } from 'react';
import { Subchapter } from '@/data/subchapters';
import { useLanguage } from '@/contexts/LanguageContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface UseSubchapterNotesResult {
  notes: string;
  isLoading: boolean;
  error: string | null;
  generateNotes: (subchapter: Subchapter, chapterName: string, subject: string, examMode?: string) => Promise<void>;
}

export const useSubchapterNotes = (): UseSubchapterNotesResult => {
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const generateNotes = useCallback(async (
    subchapter: Subchapter,
    chapterName: string,
    subject: string,
    examMode = 'JEE'
  ) => {
    setIsLoading(true);
    setError(null);
    setNotes('');

    console.log('Generating notes with language:', language);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-subchapter-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate notes: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedNotes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulatedNotes += content;
                setNotes(accumulatedNotes);
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating notes';
      setError(errorMessage);
      console.error('Notes generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  return { notes, isLoading, error, generateNotes };
};
