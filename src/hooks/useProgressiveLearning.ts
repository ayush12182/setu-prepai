import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClassContext, LearningStage, ContentTag } from '@/contexts/ClassContext';

export interface StudentSkills {
  logical_reasoning: number;
  numerical_speed: number;
  abstraction_level: number;
  multi_step_problem_solving: number;
}

export interface ProgressiveState {
  skills: StudentSkills;
  isReadyForTransition: boolean;
  transitionMessage: string | null;
  allowedContentTags: ContentTag[];
  /** Effective difficulty multiplier (1.0 = base, increases as student improves) */
  difficultyMultiplier: number;
  isLoading: boolean;
}

const DEFAULT_SKILLS: StudentSkills = {
  logical_reasoning: 30,
  numerical_speed: 30,
  abstraction_level: 25,
  multi_step_problem_solving: 20,
};

const TRANSITION_THRESHOLDS = {
  logical_reasoning: 70,
  abstraction_level: 65,
};

/**
 * Derives hidden skill scores from practice & diagnostic data.
 * These scores drive content difficulty without being shown to foundation students.
 */
function deriveSkillsFromStats(
  totalQuestions: number,
  totalCorrect: number,
  totalTime: number,
  diagnosticScores: { concept: number; accuracy: number; speed: number; confidence: number } | null
): StudentSkills {
  if (totalQuestions === 0 && !diagnosticScores) return DEFAULT_SKILLS;

  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 30;
  const avgTime = totalQuestions > 0 ? totalTime / totalQuestions : 60;

  // Base from practice accuracy
  let logical = Math.min(100, accuracy * 0.8 + (totalQuestions > 20 ? 15 : totalQuestions * 0.75));
  let speed = Math.min(100, avgTime < 30 ? 80 : avgTime < 60 ? 60 : avgTime < 120 ? 40 : 25);
  let abstraction = Math.min(100, accuracy * 0.6 + (totalQuestions > 50 ? 20 : totalQuestions * 0.4));
  let multiStep = Math.min(100, accuracy * 0.5 + (totalQuestions > 30 ? 15 : totalQuestions * 0.5));

  // Blend diagnostic scores if available
  if (diagnosticScores) {
    logical = logical * 0.6 + diagnosticScores.concept * 0.4;
    speed = speed * 0.5 + diagnosticScores.speed * 0.5;
    abstraction = abstraction * 0.5 + diagnosticScores.accuracy * 0.3 + diagnosticScores.confidence * 0.2;
    multiStep = multiStep * 0.6 + diagnosticScores.concept * 0.2 + diagnosticScores.accuracy * 0.2;
  }

  return {
    logical_reasoning: Math.round(Math.max(0, Math.min(100, logical))),
    numerical_speed: Math.round(Math.max(0, Math.min(100, speed))),
    abstraction_level: Math.round(Math.max(0, Math.min(100, abstraction))),
    multi_step_problem_solving: Math.round(Math.max(0, Math.min(100, multiStep))),
  };
}

/**
 * Computes a gradual difficulty multiplier based on skill levels.
 * Foundation students get a gentle ramp; competitive students get full range.
 */
function computeDifficultyMultiplier(skills: StudentSkills, stage: LearningStage): number {
  const avg = (skills.logical_reasoning + skills.abstraction_level + skills.multi_step_problem_solving) / 3;

  switch (stage) {
    case 'curiosity_stage':
      // Gentle: 1.0 – 1.3
      return 1.0 + (avg / 100) * 0.3;
    case 'concept_stage':
      // Moderate: 1.0 – 1.6
      return 1.0 + (avg / 100) * 0.6;
    case 'analytical_stage':
      // Expanding: 1.0 – 2.0
      return 1.0 + (avg / 100) * 1.0;
    case 'competitive_stage':
      // Full range: 1.0 – 2.5
      return 1.0 + (avg / 100) * 1.5;
  }
}

export const useProgressiveLearning = (): ProgressiveState => {
  const { user } = useAuth();
  const { learningStage, allowedContentTags, studentClass } = useClassContext();
  const [skills, setSkills] = useState<StudentSkills>(DEFAULT_SKILLS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const fetchData = async () => {
      try {
        // Fetch practice stats and learning profile in parallel
        const [statsResult, profileResult] = await Promise.all([
          supabase
            .from('user_practice_stats')
            .select('total_questions_solved, total_correct, total_time_seconds')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('learning_profiles')
            .select('concept_score, accuracy_score, speed_score, confidence_score')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        const stats = statsResult.data;
        const lp = profileResult.data;

        const diagnosticScores = lp
          ? {
              concept: Number(lp.concept_score) || 0,
              accuracy: Number(lp.accuracy_score) || 0,
              speed: Number(lp.speed_score) || 0,
              confidence: Number(lp.confidence_score) || 0,
            }
          : null;

        const derived = deriveSkillsFromStats(
          stats?.total_questions_solved ?? 0,
          stats?.total_correct ?? 0,
          stats?.total_time_seconds ?? 0,
          diagnosticScores
        );

        setSkills(derived);
      } catch (err) {
        console.error('Error computing progressive skills:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isReadyForTransition = useMemo(() => {
    if (studentClass !== 10) return false;
    return (
      skills.logical_reasoning >= TRANSITION_THRESHOLDS.logical_reasoning &&
      skills.abstraction_level >= TRANSITION_THRESHOLDS.abstraction_level
    );
  }, [skills, studentClass]);

  const transitionMessage = useMemo(() => {
    if (!isReadyForTransition) return null;
    return "🎯 You're ready for Advanced Learning Mode! Your analytical thinking has reached competitive level.";
  }, [isReadyForTransition]);

  const difficultyMultiplier = useMemo(
    () => computeDifficultyMultiplier(skills, learningStage),
    [skills, learningStage]
  );

  return {
    skills,
    isReadyForTransition,
    transitionMessage,
    allowedContentTags,
    difficultyMultiplier,
    isLoading,
  };
};
