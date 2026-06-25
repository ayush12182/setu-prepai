export interface FormulaNode {
  id: string;
  formula: string;
  chapter: string;
  concept: string;
  variables: Record<string, string>;
  units: Record<string, string>;
  derivedFrom?: string[];
  usedIn: string[];
  commonMistakes: string[];
}

export const FORMULA_REGISTRY: Record<string, FormulaNode> = {
  "F001": {
    id: "F001",
    formula: "\\vec{v}_{A/B} = \\vec{v}_A - \\vec{v}_B",
    chapter: "Relative Motion",
    concept: "Relative Velocity",
    variables: {
      "v_A": "Velocity vector of object A",
      "v_B": "Velocity vector of object B",
      "v_{A/B}": "Velocity vector of A relative to B"
    },
    units: {
      "v_A": "m/s",
      "v_B": "m/s",
      "v_{A/B}": "m/s"
    },
    usedIn: ["Relative Velocity", "River Boat Problems", "Rain Man Problems", "Pursuit Problems"],
    commonMistakes: ["M001", "M002"]
  },
  "F002": {
    id: "F002",
    formula: "\\vec{F}_{pseudo} = -m \\vec{a}_{frame}",
    chapter: "Laws of Motion",
    concept: "Frame of Reference",
    variables: {
      "m": "Mass of the particle",
      "a_{frame}": "Acceleration vector of the reference frame",
      "F_{pseudo}": "Pseudo force vector acting on the particle"
    },
    units: {
      "m": "kg",
      "a_{frame}": "m/s^2",
      "F_{pseudo}": "N"
    },
    usedIn: ["Frame of Reference", "Wedge-Block Pseudo Force", "Pulley Incline Equilibrium"],
    commonMistakes: ["M004"]
  },
  "F003": {
    id: "F003",
    formula: "f_{max} = \\mu_s N",
    chapter: "Laws of Motion",
    concept: "Friction Coefficients",
    variables: {
      "f_{max}": "Limiting static friction force",
      "\\mu_s": "Coefficient of static friction",
      "N": "Normal force vector magnitude"
    },
    units: {
      "f_{max}": "N",
      "\\mu_s": "dimensionless",
      "N": "N"
    },
    usedIn: ["Friction Coefficients", "Circular Turning Friction"],
    commonMistakes: ["M003"]
  },
  "F004": {
    id: "F004",
    formula: "V = \\sum \\frac{k q_i}{r_i}",
    chapter: "Electrostatics",
    concept: "Electric Potential",
    variables: {
      "V": "Electrostatic potential",
      "k": "Coulomb constant (1 / (4 \\pi \\epsilon_0))",
      "q_i": "Charges of concentric shells or points",
      "r_i": "Radii or distances"
    },
    units: {
      "V": "V",
      "k": "N m^2/C^2",
      "q_i": "C",
      "r_i": "m"
    },
    usedIn: ["Earthing concentric shells", "Electric Potential Energy"],
    commonMistakes: ["M005"]
  },
  "F005": {
    id: "F005",
    formula: "|\\text{adj}(A)| = |A|^{n-1}",
    chapter: "Matrices",
    concept: "Inverse Matrix",
    variables: {
      "A": "Square matrix of order n",
      "|A|": "Determinant of matrix A",
      "|\\text{adj}(A)|": "Determinant of the adjoint of A",
      "n": "Order of the matrix"
    },
    units: {
      "n": "dimensionless"
    },
    usedIn: ["Adjoint properties and inverses", "Determinant multiplication theorem"],
    commonMistakes: ["M009"]
  }
};
