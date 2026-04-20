/**
 * Simulated vision engine bypassing real Claude Opus calls to preserve API keys in development
 */

export interface ParsedQuestionResult {
  question_text: string;
  subject: string;
  chapter: string;
  subtopic: string;
  concept_tag: string;
  difficulty: number;
  avg_time_seconds: number;
  solution_steps: { step: string; explanation: string }[];
  correct_answer: string;
  common_mistake: string;
  mistake_type: string;
  confidence: number;
}

export const processSnapWithClaude = async (base64Image: string): Promise<ParsedQuestionResult> => {
  // Simulate network latency (3 seconds) to show "Reading..." -> "Solving..." UI transitions
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Randomize a little bit of failure to simulate error handlers (5% chance)
  if (Math.random() < 0.05) {
     throw new Error("Could not read this question clearly. Please retake the photo with better lighting.");
  }

  // Pre-configured payload simulating a successfully extracted Physics question from HC Verma or similar
  return {
    question_text: "A particle is projected with velocity 20 m/s at an angle of 30° with the horizontal. What is the maximum height reached by the particle? (Take g = 10 m/s²)",
    subject: "Physics",
    chapter: "Motion in a Plane",
    subtopic: "Projectile Motion",
    concept_tag: "Maximum Height Calculation",
    difficulty: 3,
    avg_time_seconds: 45,
    solution_steps: [
      {
        step: "Identify the given parameters",
        explanation: "Initial velocity (u) = 20 m/s, Angle of projection (θ) = 30°, Acceleration due to gravity (g) = 10 m/s²"
      },
      {
        step: "Recall the maximum height formula",
        explanation: "H_max = (u² sin²θ) / (2g)"
      },
      {
        step: "Substitute values into the formula",
        explanation: "H_max = ((20)² * (sin 30°)²) / (2 * 10)"
      },
      {
        step: "Simplify the calculation",
        explanation: "H_max = (400 * (1/2)²) / 20 \n= (400 * 1/4) / 20 \n= 100 / 20 \n= 5 meters"
      }
    ],
    correct_answer: "5 meters",
    common_mistake: "Using sin(2θ) instead of sin²θ in the formula, calculating Range instead of Height.",
    mistake_type: "Conceptual",
    confidence: 0.98
  };
};
