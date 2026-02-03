import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LectureNote {
  id: string;
  video_url: string;
  video_title: string | null;
  thumbnail_url: string | null;
  structured_notes: string | null;
  key_timestamps: Array<{ time: string; topic: string; importance: string }>;
  formulas: Array<{ formula: string; name: string; usage: string }>;
  flashcards: Array<{ front: string; back: string }>;
  pyq_connections: Array<{ year: string; exam: string; topic: string }>;
  one_page_summary: string | null;
  subject: string | null;
  chapter: string | null;
  processing_status: string;
  created_at: string;
}

export function useLectureNotes() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentNote, setCurrentNote] = useState<LectureNote | null>(null);
  const [notes, setNotes] = useState<LectureNote[]>([]);
  const { toast } = useToast();

  const processLecture = async (videoUrl: string): Promise<LectureNote | null> => {
    setIsProcessing(true);
    setCurrentNote(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to process lectures",
          variant: "destructive",
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-lecture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ videoUrl, userId: user.id }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        toast({
          title: "Processing Failed",
          description: result.error || "Failed to process lecture",
          variant: "destructive",
        });
        return null;
      }

      const lectureNote = result.data as LectureNote;
      setCurrentNote(lectureNote);
      
      toast({
        title: "Lecture Processed!",
        description: "Your study materials are ready",
      });

      return lectureNote;
    } catch (error) {
      console.error('Error processing lecture:', error);
      toast({
        title: "Error",
        description: "Failed to process lecture. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchUserNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Using any type to handle dynamic table access
      const { data, error } = await (supabase as any)
        .from('lecture_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  return {
    isProcessing,
    currentNote,
    notes,
    processLecture,
    fetchUserNotes,
    setCurrentNote,
  };
}
