export const UNIVERSAL_TOPIC_CATALOG: Record<string, { parentChapter: string; keywords: string[]; concepts: string[] }> = {
  // Physics
  "relative motion": {
    parentChapter: "kinematics",
    keywords: ["relative", "river", "boat", "rain", "man", "pursuit", "wind", "frame", "w.r.t", "with respect to", "approaches", "shortest distance", "escalator", "conveyor", "aircraft", "plane"],
    concepts: ["Relative Velocity", "Relative Motion", "River Boat Problems", "Rain Man Problems", "Pursuit Problems", "Frame of Reference", "Minimum Distance of Approach", "Aircraft Wind Problems", "Conveyor Belt Problems", "Escalator Problems", "Circular Relative Motion", "Vector Relative Motion"]
  },
  "graphs": {
    parentChapter: "kinematics",
    keywords: ["graph", "plot", "curve", "slope", "area under", "v-t", "x-t", "a-t", "v-x"],
    concepts: ["Velocity-Time Graph", "Position-Time Graph", "Acceleration-Time Graph", "Graph Interpretation"]
  },
  "velocity": {
    parentChapter: "kinematics",
    keywords: ["velocity", "speed", "displacement", "instantaneous velocity"],
    concepts: ["Instantaneous Velocity", "Speed", "Velocity"]
  },
  "acceleration": {
    parentChapter: "kinematics",
    keywords: ["acceleration", "deceleration", "accelerating"],
    concepts: ["Constant Acceleration", "Acceleration"]
  },
  "average velocity": {
    parentChapter: "kinematics",
    keywords: ["average velocity", "average speed"],
    concepts: ["Average Velocity", "Average Speed"]
  },
  "variable acceleration": {
    parentChapter: "kinematics",
    keywords: ["variable acceleration", "t^2", "t^3", "integral", "differentiation", "dx/dt", "dv/dt"],
    concepts: ["Variable Acceleration"]
  },
  "units & dimensions": {
    parentChapter: "units & dimensions",
    keywords: ["error", "measurement", "least count", "dimension", "vernier", "screw gauge", "percentage error"],
    concepts: ["Error propagation in density", "Vernier least count", "Units & Dimensions"]
  },
  "laws of motion": {
    parentChapter: "laws of motion",
    keywords: ["pulley", "friction", "incline", "mass", "string", "tension", "equilibrium", "fbd", "pseudo-force"],
    concepts: ["Pulley Incline Equilibrium", "Newton's Laws", "Laws of Motion"]
  },
  "wpe": {
    parentChapter: "wpe",
    keywords: ["work", "power", "energy", "spring", "kinetic energy", "potential energy"],
    concepts: ["Spring system variable force", "Spring potential energy", "Work-Energy theorem", "WPE"]
  },
  "electrostatics": {
    parentChapter: "electrostatics",
    keywords: ["charge", "shell", "potential", "field", "conducting", "electrostatic", "capacitor"],
    concepts: ["Earthing concentric shells", "Electrostatics", "Electric Field", "Electric Potential", "Coulomb's Law", "Capacitance"]
  },
  "rotational motion": {
    parentChapter: "rotational motion",
    keywords: ["torque", "moment of inertia", "cylinder", "wheel", "angular", "inertia", "rotation", "angular acceleration"],
    concepts: ["Moment of Inertia", "Torque and Angular Acceleration", "Rotational Kinematics"]
  },
  "moment of inertia": {
    parentChapter: "rotational motion",
    keywords: ["torque", "moment of inertia", "cylinder", "wheel", "angular", "inertia", "rotation", "angular acceleration"],
    concepts: ["Moment of Inertia", "Torque and Angular Acceleration", "Rotational Kinematics"]
  },
  // Chemistry
  "vsepr theory": {
    parentChapter: "chemical bonding",
    keywords: ["shape", "bond angle", "lone pair", "hybridization", "vsepr", "molecular geometry"],
    concepts: ["Shape Prediction", "Bond Angle", "Lone Pair Effects", "Hybridization", "VSEPR Theory"]
  },
  "chemical bonding": {
    parentChapter: "chemical bonding",
    keywords: ["dipole", "bonding", "hybridization", "lone pair", "geometry", "molecular orbital", "overlap", "covalent", "ionic", "bond", "angle", "formal", "charge", "vsepr", "structure", "lone", "pair", "ozone", "molecule"],
    concepts: [
      "Chemical Bonding & Dipole Moments", "Chemical Bonding", "Dipole Moments", "hybridization", "molecular geometry", "covalent bonding",
      "VSEPR Shape Prediction", "Bond Angle Comparisons", "Lone Pair Effects", "Hybridization states", "Molecular Orbital Theory",
      "Covalent bonding overlap", "Hydrogen bonding strength", "Fajans rules polarization", "Formal charge distribution"
    ]
  },
  "mole concept": {
    parentChapter: "mole concept",
    keywords: ["mole", "molarity", "molality", "fraction", "stoichiometry", "concentration", "solute"],
    concepts: ["Mole Concept", "Molarity", "Molality", "Mole Fraction", "Stoichiometry"]
  },
  // Mathematics
  "matrices": {
    parentChapter: "matrices",
    keywords: ["matrix", "matrices", "multiply", "inverse", "identity", "determinant", "transpose", "elementary", "adjoint", "addition", "product"],
    concepts: [
      "Addition", "Multiplication", "Identity Matrix", "Inverse Matrix", "Elementary Operations", "Determinants", "Matrices",
      "Matrix Addition algebra", "Multiplication properties", "Identity Matrix constraints", "Inverse Matrix verification",
      "Elementary row operations", "Determinant multiplication theorem", "Adjoint properties and inverses",
      "Symmetric and skew-symmetric matrices", "System of linear equations consistency", "Orthogonal matrices determinant"
    ]
  },
  "matrix operations": {
    parentChapter: "matrices",
    keywords: ["matrix", "matrices", "multiply", "inverse", "identity", "determinant", "transpose", "elementary", "adjoint", "addition", "product"],
    concepts: [
      "Addition", "Multiplication", "Identity Matrix", "Inverse Matrix", "Elementary Operations", "Determinants", "Matrices",
      "Matrix Addition algebra", "Multiplication properties", "Identity Matrix constraints", "Inverse Matrix verification",
      "Elementary row operations", "Determinant multiplication theorem", "Adjoint properties and inverses",
      "Symmetric and skew-symmetric matrices", "System of linear equations consistency", "Orthogonal matrices determinant"
    ]
  },
  "functions": {
    parentChapter: "functions",
    keywords: ["domain", "range", "function", "composite", "real solutions", "inject", "surject"],
    concepts: ["Functions & Real Solutions", "Domain of composite function", "Functions", "Composite Function", "One-to-One"]
  },
  "limits": {
    parentChapter: "calculus",
    keywords: ["limit", "calculus", "derivative", "integral", "lim", "indeterminate", "l'hopital"],
    concepts: ["Limits indeterminate 1^inf", "Calculus", "Limits", "Indeterminate Forms"]
  },
  // Biology
  "genetics": {
    parentChapter: "genetics",
    keywords: ["gene", "allele", "inheritance", "cross", "hybrid", "chromosome", "mendel", "genotype", "phenotype"],
    concepts: ["Mendelian Inheritance", "Monohybrid Cross", "Dihybrid Cross", "Sex Determination", "Mutation", "Genetics"]
  },
  "cell biology": {
    parentChapter: "cell biology",
    keywords: ["cell", "organelle", "mitosis", "meiosis", "membrane", "protein", "nucleus", "mitochondria"],
    concepts: ["Mitosis", "Meiosis", "Cell Wall", "Mitochondria", "Nucleus", "Cell Biology"]
  },
  "rolling motion": {
    parentChapter: "rotational motion",
    keywords: ["rolling", "slipping", "friction", "kinetic energy of rolling", "cylinder", "sphere", "incline"],
    concepts: ["Pure Rolling", "Rolling without slipping", "Rolling down an incline"]
  },
  "elasticity": {
    parentChapter: "properties of matter",
    keywords: ["stress", "strain", "young's modulus", "elasticity", "bulk modulus", "shear", "hooke's law"],
    concepts: ["Young's Modulus", "Stress-Strain Curve", "Elastic Potential Energy"]
  },
  "surface tension": {
    parentChapter: "properties of matter",
    keywords: ["surface tension", "capillary rise", "excess pressure", "bubble", "drop", "angle of contact"],
    concepts: ["Capillary Action", "Surface Energy", "Excess Pressure inside bubble"]
  },
  "semiconductors": {
    parentChapter: "modern physics",
    keywords: ["semiconductor", "pn junction", "diode", "transistor", "logic gates", "band gap", "doping", "extrinsic"],
    concepts: ["P-N Junction Diode", "Logic Gates", "Intrinsic vs Extrinsic Semiconductors"]
  },
  "wave optics": {
    parentChapter: "optics",
    keywords: ["interference", "diffraction", "polarization", "ydse", "coherent sources", "fringe width", "young's double slit"],
    concepts: ["Young's Double Slit Experiment", "Diffraction grating", "Polarization by reflection"]
  },
  "haloalkanes": {
    parentChapter: "organic chemistry",
    keywords: ["haloalkane", "haloarene", "nucleophilic substitution", "sn1", "sn2", "alkyl halide", "grignard"],
    concepts: ["SN1 and SN2 mechanism", "Nucleophilic Substitution", "Preparation of Alkyl Halides"]
  },
  "biomolecules": {
    parentChapter: "organic chemistry",
    keywords: ["biomolecules", "carbohydrate", "glucose", "protein", "amino acid", "peptide link", "dna", "rna", "enzyme"],
    concepts: ["Structure of Glucose", "Amino Acids and Proteins", "Nucleic Acids DNA RNA"]
  },
  "determinants": {
    parentChapter: "matrices",
    keywords: ["determinant", "cramer's rule", "minor", "cofactor", "determinant of product", "singular matrix"],
    concepts: ["Cramer's Rule", "Determinant Multiplication Theorem", "Properties of Determinants"]
  },
  "vector algebra": {
    parentChapter: "vectors",
    keywords: ["vector", "dot product", "cross product", "projection", "unit vector", "coplanar", "direction cosines"],
    concepts: ["Dot and Cross Product", "Vector Projection", "Scalar Triple Product"]
  },
  "probability": {
    parentChapter: "probability",
    keywords: ["probability", "conditional probability", "bayes theorem", "independent events", "bernoulli trials", "binomial distribution"],
    concepts: ["Bayes Theorem", "Conditional Probability", "Binomial Distribution"]
  }
};

export function resolveTopicCatalogEntry(topicName: string): { parentChapter: string; keywords: string[]; concepts: string[] } {
  const clean = topicName.toLowerCase().trim();
  const predefinedKey = Object.keys(UNIVERSAL_TOPIC_CATALOG).find(
    k => clean === k || clean.includes(k) || k.includes(clean)
  );
  if (predefinedKey) {
    return UNIVERSAL_TOPIC_CATALOG[predefinedKey];
  }

  const words = clean.split(/\s+/).filter(w => w.length > 2);
  const derivedConcepts = [
    topicName,
    ...words.map(w => w.charAt(0).toUpperCase() + w.slice(1))
  ];
  return {
    parentChapter: clean,
    keywords: words.length > 0 ? words : [clean],
    concepts: derivedConcepts
  };
}

export function validateTopicMatch(q: any, selectedTopic: string): { matches: boolean; relevanceScore: number } {
  const text = (q.question_text || '').toLowerCase();
  const concept = (q.concept_tested || '').toLowerCase();
  const explanation = (q.explanation || '').toLowerCase();

  const mapped = resolveTopicCatalogEntry(selectedTopic);
  const matchesConcept = mapped.concepts.some(c => concept.includes(c.toLowerCase()) || c.toLowerCase().includes(concept));
  const matchesKeyword = mapped.keywords.some(kw => text.includes(kw) || concept.includes(kw) || explanation.includes(kw));

  const isMatch = matchesConcept || matchesKeyword;
  return {
    matches: isMatch,
    relevanceScore: isMatch ? 1.0 : 0.0
  };
}

export interface ChapterBlueprint {
  concepts: string[];
  scenarios: string[];
  reasoningModes: string[];
  difficultyProgression: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
  pyqPatterns: string[];
  commonMistakes: string[];
}

export function getChapterBlueprint(topicName: string): ChapterBlueprint {
  const catalogEntry = resolveTopicCatalogEntry(topicName);
  
  // Custom scenario banks per subject area to look extremely professional
  const clean = topicName.toLowerCase().trim();
  let scenarios = [
    "calculating boundary limits and physical constraints",
    "finding optimization extrema and critical values",
    "analyzing dynamic parameter progression and variable values",
    "evaluating geometric alignment and system configurations"
  ];
  const reasoningModes = [
    "direct algebraic deduction and formula application",
    "multi-concept mapping and relational inference",
    "reverse verification from output results back to input states"
  ];
  const pyqs = [
    "JEE Main Standard single-correct MCQ pattern",
    "JEE Advanced multiple-correct selection structure",
    "Numerical/Integer decimal bounded response"
  ];
  let commonMistakes = [
    "Sign/arithmetic errors",
    "Incorrect formula choice",
    "Misinterpreting boundary values"
  ];

  if (clean.includes("motion") || clean.includes("kinematics") || clean.includes("physics")) {
    scenarios = [
      "evaluating relative trajectory intersections",
      "maximizing system performance and finding extremum values",
      "analyzing motion in non-inertial frames of reference",
      "determining equilibrium and constraint equations under tension/friction"
    ];
    commonMistakes = [
      "Wrong vector subtraction",
      "Sign convention errors",
      "Relative frame confusion"
    ];
  } else if (clean.includes("electro") || clean.includes("potential") || clean.includes("charge")) {
    scenarios = [
      "calculating charge flow and distribution in conducting geometries",
      "determining potential configuration on shell boundaries",
      "evaluating mechanical forces and field energy density shifts"
    ];
    commonMistakes = [
      "Concentric shell potential calculation errors",
      "Vector summation signs",
      "Capacitor dielectric field calculations"
    ];
  } else if (clean.includes("matrix") || clean.includes("matrices") || clean.includes("determinant")) {
    scenarios = [
      "verifying linear algebra summation and multiplication properties",
      "evaluating systems of linear equations for consistency conditions",
      "applying adjoint properties and elementary transformations to resolve matrices"
    ];
    commonMistakes = [
      "Matrix multiplication order non-commutativity",
      "Determinant multiplier scaling",
      "Adjoint transposition errors"
    ];
  }

  const difficultyProgression = {
    easy: ["Single-stage definition lookup", "Basic parameter substitution"],
    medium: ["Multi-step algebraic progression", "Two-concept combination check"],
    hard: ["Non-trivial boundary optimization", "Advanced structural JEE level deduction"]
  };

  return {
    concepts: catalogEntry.concepts,
    scenarios,
    reasoningModes,
    difficultyProgression,
    pyqPatterns: pyqs,
    commonMistakes
  };
}
