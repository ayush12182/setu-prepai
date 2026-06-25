import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudyNote {
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

export function useStudyNotes() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentNote, setCurrentNote] = useState<StudyNote | null>(null);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const { toast } = useToast();

  const processLecture = async (videoUrl: string, language: string = 'english'): Promise<StudyNote | null> => {
    setIsProcessing(true);
    setCurrentNote(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to analyze videos",
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
          body: JSON.stringify({ videoUrl, userId: user.id, language }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        toast({
          title: "Analysis Failed",
          description: result.error || "Failed to analyze video",
          variant: "destructive",
        });
        return null;
      }

      const studyNote = result.data as StudyNote;
      setCurrentNote(studyNote);
      
      toast({
        title: "Video Analyzed!",
        description: "Your study materials are ready",
      });

      return studyNote;
    } catch (error) {
      console.error('Error processing video:', error);
      toast({
        title: "Error",
        description: "Failed to analyze video. Please try again.",
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

      // Using legacy 'lecture_notes' database table internally
      const { data, error } = await (supabase as any)
        .from('lecture_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching study notes:', error);
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
