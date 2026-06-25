import { ConceptNode } from '../physics/index';

export const MATHEMATICS_CURRICULUM: Record<string, ConceptNode[]> = {
  "matrices": [
    {
      id: "MAT-MX-001",
      name: "Multiplication properties",
      chapter: "Matrices",
      topic: "Matrix Operations",
      subtopic: "Multiplication algebra",
      prerequisites: ["MAT-MX-000"],
      formulas: [],
      commonMisconceptions: ["M008"],
      pyqClusters: [],
      difficultyBands: ["Foundation", "JEE_Main_Easy"],
      reasoningModes: ["Non-commutative property checks"]
    },
    {
      id: "MAT-MX-002",
      name: "Adjoint properties and inverses",
      chapter: "Matrices",
      topic: "Adjoint and Inverses",
      subtopic: "Determinant rules of adjoints",
      prerequisites: ["MAT-MX-001"],
      formulas: ["F005"],
      commonMisconceptions: ["M009"],
      pyqClusters: ["PYQ-005"],
      difficultyBands: ["JEE_Main_Medium", "JEE_Main_Hard"],
      reasoningModes: ["Properties reduction and multiplication theorem application"]
    }
  ]
};
