import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subchapter } from '@/data/subchapters';

interface UseSubchapterNotesResult {
  notes: string;
  isLoading: boolean;
  error: string | null;
  generateNotes: (subchapter: Subchapter, chapterName: string, subject: string) => Promise<void>;
}

export const useSubchapterNotes = (): UseSubchapterNotesResult => {
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNotes = useCallback(async (
    subchapter: Subchapter,
    chapterName: string,
    subject: string
  ) => {
    setIsLoading(true);
    setError(null);
    setNotes('');

    try {
      const response = await supabase.functions.invoke('generate-subchapter-notes', {
        body: {
          subchapterName: subchapter.name,
          chapterName,
          subject,
          jeeAsks: subchapter.jeeAsks,
          pyqFocus: subchapter.pyqFocus,
          commonMistakes: subchapter.commonMistakes,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate notes');
      }

      // Handle streaming response
      const reader = response.data.getReader();
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
  }, []);

  return { notes, isLoading, error, generateNotes };
};
