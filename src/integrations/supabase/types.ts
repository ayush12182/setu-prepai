export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      lecture_notes: {
        Row: {
          chapter: string | null
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          flashcards: Json | null
          formulas: Json | null
          id: string
          key_timestamps: Json | null
          one_page_summary: string | null
          processing_status: string | null
          pyq_connections: Json | null
          structured_notes: string | null
          subject: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          video_title: string | null
          video_url: string
        }
        Insert: {
          chapter?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          flashcards?: Json | null
          formulas?: Json | null
          id?: string
          key_timestamps?: Json | null
          one_page_summary?: string | null
          processing_status?: string | null
          pyq_connections?: Json | null
          structured_notes?: string | null
          subject?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          video_title?: string | null
          video_url: string
        }
        Update: {
          chapter?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          flashcards?: Json | null
          formulas?: Json | null
          id?: string
          key_timestamps?: Json | null
          one_page_summary?: string | null
          processing_status?: string | null
          pyq_connections?: Json | null
          structured_notes?: string | null
          subject?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          video_title?: string | null
          video_url?: string
        }
        Relationships: []
      }
      major_test_answers: {
        Row: {
          answered_at: string | null
          attempt_id: string
          correct_option: string
          created_at: string
          id: string
          is_correct: boolean | null
          is_marked_review: boolean | null
          question_id: string
          question_number: number
          selected_option: string | null
          subject: string
          time_spent_seconds: number
        }
        Insert: {
          answered_at?: string | null
          attempt_id: string
          correct_option: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          is_marked_review?: boolean | null
          question_id: string
          question_number: number
          selected_option?: string | null
          subject: string
          time_spent_seconds?: number
        }
        Update: {
          answered_at?: string | null
          attempt_id?: string
          correct_option?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          is_marked_review?: boolean | null
          question_id?: string
          question_number?: number
          selected_option?: string | null
          subject?: string
          time_spent_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "major_test_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "major_test_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      major_test_attempts: {
        Row: {
          chemistry_correct: number | null
          chemistry_incorrect: number | null
          chemistry_score: number | null
          chemistry_unattempted: number | null
          completed_at: string | null
          created_at: string
          cycle_id: string | null
          id: string
          maths_correct: number | null
          maths_incorrect: number | null
          maths_score: number | null
          maths_unattempted: number | null
          max_score: number | null
          percentile_estimate: number | null
          physics_correct: number | null
          physics_incorrect: number | null
          physics_score: number | null
          physics_unattempted: number | null
          score: number | null
          started_at: string
          status: string
          tab_switch_count: number
          total_time_seconds: number
          user_id: string
        }
        Insert: {
          chemistry_correct?: number | null
          chemistry_incorrect?: number | null
          chemistry_score?: number | null
          chemistry_unattempted?: number | null
          completed_at?: string | null
          created_at?: string
          cycle_id?: string | null
          id?: string
          maths_correct?: number | null
          maths_incorrect?: number | null
          maths_score?: number | null
          maths_unattempted?: number | null
          max_score?: number | null
          percentile_estimate?: number | null
          physics_correct?: number | null
          physics_incorrect?: number | null
          physics_score?: number | null
          physics_unattempted?: number | null
          score?: number | null
          started_at?: string
          status?: string
          tab_switch_count?: number
          total_time_seconds?: number
          user_id: string
        }
        Update: {
          chemistry_correct?: number | null
          chemistry_incorrect?: number | null
          chemistry_score?: number | null
          chemistry_unattempted?: number | null
          completed_at?: string | null
          created_at?: string
          cycle_id?: string | null
          id?: string
          maths_correct?: number | null
          maths_incorrect?: number | null
          maths_score?: number | null
          maths_unattempted?: number | null
          max_score?: number | null
          percentile_estimate?: number | null
          physics_correct?: number | null
          physics_incorrect?: number | null
          physics_score?: number | null
          physics_unattempted?: number | null
          score?: number | null
          started_at?: string
          status?: string
          tab_switch_count?: number
          total_time_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "major_test_attempts_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "major_test_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      major_test_chapter_analysis: {
        Row: {
          accuracy: number | null
          attempt_id: string
          avg_time_seconds: number | null
          chapter_id: string
          chapter_name: string
          correct: number
          created_at: string
          id: string
          incorrect: number
          strength_level: string | null
          subject: string
          total_questions: number
          unattempted: number
        }
        Insert: {
          accuracy?: number | null
          attempt_id: string
          avg_time_seconds?: number | null
          chapter_id: string
          chapter_name: string
          correct?: number
          created_at?: string
          id?: string
          incorrect?: number
          strength_level?: string | null
          subject: string
          total_questions?: number
          unattempted?: number
        }
        Update: {
          accuracy?: number | null
          attempt_id?: string
          avg_time_seconds?: number | null
          chapter_id?: string
          chapter_name?: string
          correct?: number
          created_at?: string
          id?: string
          incorrect?: number
          strength_level?: string | null
          subject?: string
          total_questions?: number
          unattempted?: number
        }
        Relationships: [
          {
            foreignKeyName: "major_test_chapter_analysis_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "major_test_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      major_test_cycles: {
        Row: {
          created_at: string
          cycle_number: number
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          test_date: string
        }
        Insert: {
          created_at?: string
          cycle_number: number
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          test_date: string
        }
        Update: {
          created_at?: string
          cycle_number?: number
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          test_date?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          difficulty: string
          id: string
          started_at: string
          subchapter_id: string
          total_questions: number
          total_time_seconds: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number
          difficulty: string
          id?: string
          started_at?: string
          subchapter_id: string
          total_questions?: number
          total_time_seconds?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          difficulty?: string
          id?: string
          started_at?: string
          subchapter_id?: string
          total_questions?: number
          total_time_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          target_exam: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          target_exam?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          target_exam?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          attempted_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option: string
          time_taken_seconds: number
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_option: string
          time_taken_seconds?: number
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option?: string
          time_taken_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          chapter_id: string
          common_mistake: string | null
          concept_tested: string
          correct_option: string
          created_at: string
          difficulty: string
          explanation: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          pyq_year: number | null
          question_text: string
          source: string | null
          subchapter_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          common_mistake?: string | null
          concept_tested: string
          correct_option: string
          created_at?: string
          difficulty: string
          explanation: string
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          pyq_year?: number | null
          question_text: string
          source?: string | null
          subchapter_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          common_mistake?: string | null
          concept_tested?: string
          correct_option?: string
          created_at?: string
          difficulty?: string
          explanation?: string
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          pyq_year?: number | null
          question_text?: string
          source?: string | null
          subchapter_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_practice_stats: {
        Row: {
          chapters_practiced: string[] | null
          id: string
          total_correct: number
          total_questions_solved: number
          total_time_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chapters_practiced?: string[] | null
          id?: string
          total_correct?: number
          total_questions_solved?: number
          total_time_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chapters_practiced?: string[] | null
          id?: string
          total_correct?: number
          total_questions_solved?: number
          total_time_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
