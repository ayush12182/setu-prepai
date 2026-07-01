export type VariableConstraint = {
  expression: string; // e.g. "velocity > 0"
  errorMessage?: string;
};

export type VariableConfig = {
  name: string;
  minimum: number;
  maximum: number;
  increment: number;
  precision: number;
  unit: string;
};

export type DistractorAlgorithm = {
  type: 'sign_error' | 'unit_error' | 'calculation_error' | 'wrong_formula' | 'common_misconception';
  formula?: string; // If applicable, how to calculate the distractor
  description: string;
};

export type TemplateFamily = {
  id: string;
  chapter: string;
  topic: string;
  subtopic: string;
  concept: string;
  difficultyBase: 'EASY' | 'MEDIUM' | 'HARD';
  
  // The variables that get randomized
  variables: VariableConfig[];
  
  // Rules that must pass before we attempt to solve
  constraints: VariableConstraint[];
  
  // The natural language structure to feed to the AI generator
  promptTemplate: string;
  
  // Deterministic solving logic
  solutionAlgorithm: {
    formulas: Record<string, string>; // e.g. { force: "mass * acceleration" }
    finalAnswer: string; // The key in formulas that holds the final answer
  };
  
  // Deterministic distractors
  distractors: DistractorAlgorithm[];
};
