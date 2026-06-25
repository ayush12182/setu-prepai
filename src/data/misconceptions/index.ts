export interface Misconception {
  id: string;
  concept: string;
  title: string;
  description: string;
  triggerPatterns: string[];
  remediationStrategy: {
    revisionBlock: string;
    targetedPracticeCount: number;
    visualExplanation: string;
  };
}

export const UNIVERSAL_MISCONCEPTION_REGISTRY: Record<string, Misconception> = {
  // Physics
  "M001": {
    id: "M001",
    concept: "Relative Velocity",
    title: "Direct Algebraic Summation Error",
    description: "Adding vector velocities directly as scalar values without considering their vector directions or angle components.",
    triggerPatterns: ["added magnitudes directly", "neglected angle components"],
    remediationStrategy: {
      revisionBlock: "Recall that relative velocity is a vector subtraction operation: $\\vec{v}_{rel} = \\vec{v}_A - \\vec{v}_B$. You must resolve both velocities into unit vectors $\\hat{i}$ and $\\hat{j}$ before subtraction.",
      targetedPracticeCount: 3,
      visualExplanation: "A vector subtraction triangle demonstrating $\\vec{v}_{A/B}$ resolution."
    }
  },
  "M002": {
    id: "M002",
    concept: "Relative Velocity",
    title: "Wrong Sign Convention",
    description: "Incorrect sign selection during relative velocity subtraction (e.g. using $\\vec{v}_A + \\vec{v}_B$ instead of $\\vec{v}_A - \\vec{v}_B$).",
    triggerPatterns: ["relative velocity sign mistake", "sign convention error"],
    remediationStrategy: {
      revisionBlock: "Always write $\\vec{v}_{A/B} = \\vec{v}_A - \\vec{v}_B$. If object B is moving in the negative direction, its velocity vector carries a negative sign, making the subtraction positive.",
      targetedPracticeCount: 3,
      visualExplanation: "A 1D coordinate axis showing velocity vectors pointing in opposite directions."
    }
  },
  "M003": {
    id: "M003",
    concept: "Laws of Motion",
    title: "Normal Force Coordinate Error",
    description: "Assuming normal force is always equal to $mg$ regardless of inclination angles or external vertical forces.",
    triggerPatterns: ["neglected normal component", "normal force error"],
    remediationStrategy: {
      revisionBlock: "Draw a Free Body Diagram (FBD). Resolve the weight vector $mg$ perpendicular to the incline surface. The normal force is $N = mg\\cos\\theta$.",
      targetedPracticeCount: 3,
      visualExplanation: "An inclined plane FBD showing weight components $mg\\sin\\theta$ and $mg\\cos\\theta$ perpendicular to the surface."
    }
  },
  "M004": {
    id: "M004",
    concept: "Laws of Motion",
    title: "Pseudo Force Direction Error",
    description: "Applying the pseudo force in the direction of the frame's acceleration instead of opposite to it.",
    triggerPatterns: ["pseudo force direction error", "incorrect pseudo force"],
    remediationStrategy: {
      revisionBlock: "Pseudo force $\\vec{F}_p = -m\\vec{a}_f$ is always directed opposite to the acceleration of the non-inertial reference frame.",
      targetedPracticeCount: 3,
      visualExplanation: "An accelerating elevator or cart with a pseudo force vector pointing downwards/backwards."
    }
  },
  "M005": {
    id: "M005",
    concept: "Electrostatics",
    title: "Concentric Shell Earthing Potential Confusion",
    description: "Incorrectly setting the charge of an earthed shell to zero instead of setting its electric potential to zero.",
    triggerPatterns: ["concentric shell potential calculation error", "earthing charge confusion"],
    remediationStrategy: {
      revisionBlock: "Earthing guarantees that the potential at that shell is zero ($V_{earthed} = 0$). Solve for the unknown charge $q'$ by setting the potential equation to zero.",
      targetedPracticeCount: 3,
      visualExplanation: "Three concentric conducting spheres showing potential contribution equations summing to zero at the earthed boundary."
    }
  },

  // Chemistry
  "M006": {
    id: "M006",
    concept: "Chemical Bonding",
    title: "Lone Pair Geometry Distortion Ignored",
    description: "Predicting molecular geometry based on perfect electronic geometry, neglecting lone-pair repulsion distortions.",
    triggerPatterns: ["ignored lone pair repulsions", "vsepr shape error"],
    remediationStrategy: {
      revisionBlock: "Lone pair-lone pair (lp-lp) repulsion is stronger than lone pair-bond pair (lp-bp), which is stronger than bond pair-bond pair (bp-bp). This compresses the bond angles below ideal values (e.g. 104.5 degrees for water).",
      targetedPracticeCount: 3,
      visualExplanation: "VSEPR repulsion hierarchy diagram showing lone pairs squeezing bond pairs."
    }
  },
  "M007": {
    id: "M007",
    concept: "Chemical Bonding",
    title: "Intramolecular vs Intermolecular Bonding Confusion",
    description: "Confusing intramolecular hydrogen bonding (within a single molecule) with intermolecular hydrogen bonding (between separate molecules) when comparing boiling points.",
    triggerPatterns: ["confused intermolecular with intramolecular bonding"],
    remediationStrategy: {
      revisionBlock: "Intermolecular hydrogen bonding increases boiling points because it associates molecules together. Intramolecular hydrogen bonding decreases boiling points because it prevents molecules from associating with others.",
      targetedPracticeCount: 3,
      visualExplanation: "Comparison of ortho-nitrophenol (intramolecular) vs para-nitrophenol (intermolecular) bonding links."
    }
  },

  // Mathematics
  "M008": {
    id: "M008",
    concept: "Matrices",
    title: "Matrix Multiplication Commutativity Assumption",
    description: "Assuming $AB = BA$ for square matrices, leading to incorrect binomial expansions or algebraic simplifications.",
    triggerPatterns: ["assumed commutativity", "incorrect matrix product expansions"],
    remediationStrategy: {
      revisionBlock: "Matrix multiplication is non-commutative in general ($AB \\neq BA$). Therefore, $(A+B)^2 = A^2 + AB + BA + B^2$, not $A^2 + 2AB + B^2$.",
      targetedPracticeCount: 3,
      visualExplanation: "Step-by-step expansion of matrix products showing side-by-side matrices."
    }
  },
  "M009": {
    id: "M009",
    concept: "Matrices",
    title: "Adjoint Determinant Scalar Scaling Error",
    description: "Failing to apply correct scaling factors when computing the determinant of an adjoint (e.g. $|\\text{adj}(kA)|$).",
    triggerPatterns: ["incorrect adjoint determinant factor scaling"],
    remediationStrategy: {
      revisionBlock: "For a matrix of order $n$, $\\text{det}(\\text{adj}(A)) = \\text{det}(A)^{n-1}$ and $\\text{det}(kA) = k^n \\text{det}(A)$. Use these properties systematically.",
      targetedPracticeCount: 3,
      visualExplanation: "Adjoint property tree demonstrating determinant scaling rules."
    }
  },

  // Biology
  "M010": {
    id: "M010",
    concept: "Genetics",
    title: "Phenotypic vs Genotypic Ratio Confusion",
    description: "Confusing the ratio of physical characteristics (phenotype) with the ratio of gene configurations (genotype) in a dihybrid cross.",
    triggerPatterns: ["dihybrid cross ratio confusion", "genotype phenotype mixup"],
    remediationStrategy: {
      revisionBlock: "In a standard Mendelian dihybrid cross of heterozygous parents, the phenotypic ratio is 9:3:3:1, whereas the genotypic ratio is 1:2:1:2:4:2:1:2:1.",
      targetedPracticeCount: 3,
      visualExplanation: "A Punnett square highlighting phenotype groups in color vs genotype counts."
    }
  }
};
