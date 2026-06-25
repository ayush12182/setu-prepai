export interface ConceptNode {
  id: string;
  name: string;
  chapter: string;
  topic: string;
  subtopic: string;
  prerequisites: string[];
  formulas: string[];
  commonMisconceptions: string[];
  pyqClusters: string[];
  difficultyBands: ("Foundation" | "JEE_Main_Easy" | "JEE_Main_Medium" | "JEE_Main_Hard")[];
  reasoningModes: string[];
}

export const PHYSICS_CURRICULUM: Record<string, ConceptNode[]> = {
  "relative motion": [
    {
      id: "PHY-RM-001",
      name: "River Boat Problems",
      chapter: "Relative Motion",
      topic: "Relative Motion in 2D",
      subtopic: "River Crossing Dynamics",
      prerequisites: ["PHY-KIN-001"],
      formulas: ["F001"],
      commonMisconceptions: ["M001", "M002"],
      pyqClusters: ["PYQ-001"],
      difficultyBands: ["JEE_Main_Medium", "JEE_Main_Hard"],
      reasoningModes: ["Vector Component Decomposition", "Optimization under constraints"]
    },
    {
      id: "PHY-RM-002",
      name: "Rain Man Problems",
      chapter: "Relative Motion",
      topic: "Relative Motion in 2D",
      subtopic: "Umbrella Orientation",
      prerequisites: ["PHY-KIN-001"],
      formulas: ["F001"],
      commonMisconceptions: ["M001", "M002"],
      pyqClusters: ["PYQ-002"],
      difficultyBands: ["JEE_Main_Easy", "JEE_Main_Medium"],
      reasoningModes: ["Geometric vector triangles", "Algebraic frame transformations"]
    }
  ],
  "laws of motion": [
    {
      id: "PHY-NLM-001",
      name: "Wedge-Block Pseudo Force",
      chapter: "Laws of Motion",
      topic: "Newton's Second Law",
      subtopic: "Non-Inertial Frames",
      prerequisites: ["PHY-NLM-000"],
      formulas: ["F002"],
      commonMisconceptions: ["M004"],
      pyqClusters: ["PYQ-003"],
      difficultyBands: ["JEE_Main_Medium", "JEE_Main_Hard"],
      reasoningModes: ["Free Body Diagram Analysis", "Constraint coordinate mapping"]
    },
    {
      id: "PHY-NLM-002",
      name: "Friction Coefficients",
      chapter: "Laws of Motion",
      topic: "Friction",
      subtopic: "Static vs Kinetic Slipping",
      prerequisites: ["PHY-NLM-000"],
      formulas: ["F003"],
      commonMistakes: ["M003"],
      pyqClusters: [],
      difficultyBands: ["Foundation", "JEE_Main_Easy"],
      reasoningModes: ["Limiting condition boundary resolution"]
    }
  ],
  "electrostatics": [
    {
      id: "PHY-EL-001",
      name: "Earthing concentric shells",
      chapter: "Electrostatics",
      topic: "Electric Potential",
      subtopic: "Concentric Conducting Spheres",
      prerequisites: ["PHY-EL-000"],
      formulas: ["F004"],
      commonMisconceptions: ["M005"],
      pyqClusters: ["PYQ-004"],
      difficultyBands: ["JEE_Main_Hard"],
      reasoningModes: ["Superposition principle integration", "Potential boundary limits"]
    }
  ]
};
