import { ConceptNode } from '../physics/index';

export const CHEMISTRY_CURRICULUM: Record<string, ConceptNode[]> = {
  "chemical bonding": [
    {
      id: "CHM-CB-001",
      name: "VSEPR Shape Prediction",
      chapter: "Chemical Bonding",
      topic: "VSEPR Theory",
      subtopic: "Molecular Geometries",
      prerequisites: ["CHM-CB-000"],
      formulas: [],
      commonMisconceptions: ["M006"],
      pyqClusters: [],
      difficultyBands: ["JEE_Main_Easy", "JEE_Main_Medium"],
      reasoningModes: ["Electron domain pair configuration analysis"]
    },
    {
      id: "CHM-CB-002",
      name: "Hydrogen bonding strength",
      chapter: "Chemical Bonding",
      topic: "Intermolecular Forces",
      subtopic: "Hydrogen Bonding",
      prerequisites: ["CHM-CB-000"],
      formulas: [],
      commonMisconceptions: ["M007"],
      pyqClusters: [],
      difficultyBands: ["JEE_Main_Medium"],
      reasoningModes: ["Boiling point physical trend deduction"]
    }
  ]
};
