export interface PYQNode {
  id: string;
  year: number;
  exam: "JEE_MAIN" | "JEE_ADVANCED" | "NEET" | "CUET";
  shift?: string;
  chapter: string;
  concept: string;
  difficulty: number; // 1-10 scale
  reasoningPattern: string;
  misconceptionPatterns: string[];
}

export const PYQ_DNA_REGISTRY: Record<string, PYQNode> = {
  "PYQ-001": {
    id: "PYQ-001",
    year: 2024,
    exam: "JEE_MAIN",
    shift: "Jan 27 Shift 1",
    chapter: "Relative Motion",
    concept: "River Boat Problems",
    difficulty: 6,
    reasoningPattern: "Vector Resolution and Drift Minimization",
    misconceptionPatterns: ["M001", "M002"]
  },
  "PYQ-002": {
    id: "PYQ-002",
    year: 2023,
    exam: "JEE_MAIN",
    shift: "April 15 Shift 2",
    chapter: "Relative Motion",
    concept: "Rain Man Problems",
    difficulty: 5,
    reasoningPattern: "Relative Velocity Subtraction in 2D",
    misconceptionPatterns: ["M001", "M002"]
  },
  "PYQ-003": {
    id: "PYQ-003",
    year: 2024,
    exam: "JEE_MAIN",
    shift: "Jan 29 Shift 2",
    chapter: "Laws of Motion",
    concept: "Wedge-Block Pseudo Force",
    difficulty: 7,
    reasoningPattern: "Non-inertial Frame Force Resolution",
    misconceptionPatterns: ["M004"]
  },
  "PYQ-004": {
    id: "PYQ-004",
    year: 2022,
    exam: "JEE_MAIN",
    shift: "June 25 Shift 1",
    chapter: "Electrostatics",
    concept: "Earthing concentric shells",
    difficulty: 8,
    reasoningPattern: "Electrostatic Potential Integration and Earthing Boundary Conditions",
    misconceptionPatterns: ["M005"]
  },
  "PYQ-005": {
    id: "PYQ-005",
    year: 2024,
    exam: "JEE_MAIN",
    shift: "Feb 1 Shift 1",
    chapter: "Matrices",
    concept: "Adjoint properties and inverses",
    difficulty: 7,
    reasoningPattern: "Determinant Scaling and Adjoint Transposition Matrix Properties",
    misconceptionPatterns: ["M008", "M009"]
  }
};
