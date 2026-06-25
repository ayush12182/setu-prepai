import { ConceptNode } from '../physics/index';

export const BIOLOGY_CURRICULUM: Record<string, ConceptNode[]> = {
  "genetics": [
    {
      id: "BIO-GE-001",
      name: "Mendelian Inheritance",
      chapter: "Genetics",
      topic: "Principles of Inheritance",
      subtopic: "Dihybrid Crosses",
      prerequisites: ["BIO-GE-000"],
      formulas: [],
      commonMisconceptions: ["M010"],
      pyqClusters: [],
      difficultyBands: ["Foundation", "JEE_Main_Easy"],
      reasoningModes: ["Punnett square phenotypic and genotypic resolution"]
    }
  ]
};
