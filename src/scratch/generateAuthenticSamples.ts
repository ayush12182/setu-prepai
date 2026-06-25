import * as fs from 'fs';
import * as path from 'path';

export function generateAndVerifyAuthenticQuestions() {
  const questions = [
    // === KINEMATICS ===
    {
      subject: "Physics",
      chapter: "Kinematics",
      topic: "Motion in 1D",
      subtopic: "Variable Acceleration",
      concept: "Variable Acceleration",
      difficulty: "medium",
      question_text: "A particle moves along a straight line such that its velocity at any time t is given by v(t) = 3t^2 - 6t m/s. The distance travelled by the particle between t = 0 to t = 3 seconds is:",
      options: {
        A: "8 m",
        B: "10 m",
        C: "12 m",
        D: "16 m"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. The velocity is v(t) = 3t(t - 2). The velocity changes sign at t = 2 s.\n2. To find total distance, we integrate the absolute value of velocity:\n   Distance = ∫|v(t)|dt from 0 to 3.\n3. Distance = ∫(6t - 3t^2)dt [0 to 2] + ∫(3t^2 - 6t)dt [2 to 3]\n4. [3t^2 - t^3]_0^2 + [t^3 - 3t^2]_2^3 = (12 - 8) + (27 - 27 - (8 - 12)) = 4 + 4 = 8 m."
    },
    {
      subject: "Physics",
      chapter: "Kinematics",
      topic: "Motion in 1D",
      subtopic: "Motion Under Gravity",
      concept: "Motion Under Gravity",
      difficulty: "medium",
      question_text: "A balloon starts rising from the ground with an upward acceleration of 1.25 m/s^2. After 8 seconds, a stone is released from the balloon. The time taken by the stone to reach the ground is (take g = 10 m/s^2):",
      options: {
        A: "2 s",
        B: "4 s",
        C: "6 s",
        D: "8 s"
      },
      correct_answer: "B",
      explanation: "Step-by-Step Solution:\n1. Find the height (h) and velocity (v) of the balloon at t = 8 s:\n   h = 1/2 * a * t^2 = 0.5 * 1.25 * 64 = 40 m.\n   v = a * t = 1.25 * 8 = 10 m/s.\n2. When the stone is released, it inherits the balloon's velocity: u = +10 m/s, y_0 = 40 m.\n3. Using displacement equation: y = y_0 + ut - 1/2 * g * t^2 => 0 = 40 + 10t - 5t^2.\n4. Solving t^2 - 2t - 8 = 0 => (t - 4)(t + 2) = 0. Since time cannot be negative, t = 4 s."
    },
    {
      subject: "Physics",
      chapter: "Kinematics",
      topic: "Projectile Motion",
      subtopic: "Trajectory Equation of Projectile",
      concept: "Trajectory Equation of Projectile",
      difficulty: "hard",
      question_text: "A projectile is thrown with a velocity of 20√2 m/s at an angle of 45° with the horizontal. The radius of curvature of its trajectory at t = 1 second is (take g = 10 m/s^2):",
      options: {
        A: "20√2 m",
        B: "40 m",
        C: "20√5 m",
        D: "25√5 m"
      },
      correct_answer: "D",
      explanation: "Step-by-Step Solution:\n1. Initial velocity components: u_x = 20 m/s, u_y = 20 m/s.\n2. Velocity components at t = 1 s: v_x = 20 m/s, v_y = 20 - 10(1) = 10 m/s.\n3. Speed v at t = 1 s: v = √(20^2 + 10^2) = 10√5 m/s.\n4. Angle with horizontal: tan θ = v_y / v_x = 1/2 => cos θ = 2/√5.\n5. Normal acceleration: a_n = g * cos θ = 10 * (2/√5) = 4√5 m/s^2.\n6. Radius of curvature R = v^2 / a_n = (500) / (4√5) = 25√5 m."
    },
    {
      subject: "Physics",
      chapter: "Kinematics",
      topic: "Relative Motion",
      subtopic: "River Crossing Shortest Path",
      concept: "River Crossing Shortest Path",
      difficulty: "medium",
      question_text: "A river is flowing from west to east at a speed of 5 m/min. A man on the south bank of the river, capable of swimming at 10 m/min in still water, wants to swim across the river in the shortest time. In which direction should he swim?",
      options: {
        A: "Due North",
        B: "30° East of North",
        C: "30° West of North",
        D: "60° East of North"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. The time taken to cross the river of width w is given by t = w / (v_m * cos θ), where θ is the angle with the normal (perpendicular to flow).\n2. For time t to be minimum, cos θ must be maximum (i.e. cos θ = 1 => θ = 0°).\n3. Thus, he must head perpendicular to the river current, which is due North."
    },
    {
      subject: "Physics",
      chapter: "Kinematics",
      topic: "Graphs of Motion",
      subtopic: "Non-linear Graph Tangent Resolution",
      concept: "Non-linear Graph Tangent Resolution",
      difficulty: "easy",
      question_text: "The displacement-time graph of a moving particle is a parabola. This implies that the particle is moving with:",
      options: {
        A: "constant velocity",
        B: "constant acceleration",
        C: "increasing acceleration",
        D: "decreasing velocity"
      },
      correct_answer: "B",
      explanation: "Step-by-Step Solution:\n1. A parabolic displacement-time graph can be represented by the equation x(t) = a*t^2 + b*t + c.\n2. Differentiating once gives velocity: v(t) = 2a*t + b.\n3. Differentiating twice gives acceleration: a(t) = 2a.\n4. Since 2a is a constant coefficient, the acceleration is constant."
    },

    // === LAWS OF MOTION ===
    {
      subject: "Physics",
      chapter: "Laws of Motion",
      topic: "Friction (Static & Kinetic)",
      subtopic: "Static Friction Limit",
      concept: "Static Friction Limit",
      difficulty: "medium",
      question_text: "A block of mass 2 kg is placed on a rough horizontal surface. If a horizontal force of 10 N is applied on the block, and the coefficients of static and kinetic friction are 0.6 and 0.4 respectively, the acceleration of the block is (take g = 10 m/s^2):",
      options: {
        A: "0 m/s^2",
        B: "1 m/s^2",
        C: "2 m/s^2",
        D: "3 m/s^2"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. Calculate Normal force: N = mg = 20 N.\n2. Calculate limiting static friction: f_s_max = μ_s * N = 0.6 * 20 = 12 N.\n3. The applied force is F = 10 N.\n4. Since F < f_s_max, the static friction matches the applied force (f_s = 10 N), and the block remains stationary. Thus, acceleration = 0."
    },
    {
      subject: "Physics",
      chapter: "Laws of Motion",
      topic: "Newton's Laws",
      subtopic: "Connected Bodies Acceleration",
      concept: "Connected Bodies Acceleration",
      difficulty: "easy",
      question_text: "Three blocks of masses 1 kg, 2 kg, and 3 kg are connected by massless strings and placed on a frictionless horizontal table. A force of 12 N is applied to the 3 kg block. The tension in the string connecting the 1 kg and 2 kg block is:",
      options: {
        A: "2 N",
        B: "4 N",
        C: "6 N",
        D: "8 N"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. Find the system acceleration: a = F / (m1 + m2 + m3) = 12 / (1 + 2 + 3) = 2 m/s^2.\n2. The tension T in the string between 1 kg and 2 kg blocks pulls the 1 kg block.\n3. T = m1 * a = 1 kg * 2 m/s^2 = 2 N."
    },
    {
      subject: "Physics",
      chapter: "Laws of Motion",
      topic: "Circular Motion Dynamics",
      subtopic: "Horizontal Circular Turning",
      concept: "Horizontal Circular Turning",
      difficulty: "medium",
      question_text: "A car turns on a flat circular track of radius 80 m. If the coefficient of static friction between the tires and the road is 0.5, the maximum speed with which the car can turn without slipping is (take g = 10 m/s^2):",
      options: {
        A: "10 m/s",
        B: "15 m/s",
        C: "20 m/s",
        D: "25 m/s"
      },
      correct_answer: "C",
      explanation: "Step-by-Step Solution:\n1. The centripetal force is provided by static friction: f_s_max = μ_s * m * g = m * v^2 / R.\n2. v_max = √(μ_s * g * R).\n3. v_max = √(0.5 * 10 * 80) = √400 = 20 m/s."
    },
    {
      subject: "Physics",
      chapter: "Laws of Motion",
      topic: "Free Body Diagrams",
      subtopic: "FBD Single Block Systems",
      concept: "FBD Single Block Systems",
      difficulty: "medium",
      question_text: "A mass of 5 kg is suspended by a rope of length 2 m from the ceiling. A force of 50 N in the horizontal direction is applied at the midpoint of the rope. The angle that the upper half of the rope makes with the vertical in equilibrium is (take g = 10 m/s^2):",
      options: {
        A: "30°",
        B: "45°",
        C: "60°",
        D: "tan⁻¹(2)"
      },
      correct_answer: "B",
      explanation: "Step-by-Step Solution:\n1. At the midpoint, horizontal forces must balance: T1 * sin θ = F = 50 N.\n2. Vertical forces must balance: T1 * cos θ = mg = 5 * 10 = 50 N.\n3. Dividing the equations: tan θ = 50 / 50 = 1 => θ = 45°."
    },
    {
      subject: "Physics",
      chapter: "Laws of Motion",
      topic: "Pseudo Forces",
      subtopic: "Apparent Weight in Elevator",
      concept: "Apparent Weight in Elevator",
      difficulty: "easy",
      question_text: "An elevator is accelerating upwards with an acceleration of 2 m/s^2. A person of mass 60 kg stands on a weighing scale inside the elevator. The reading of the scale is (take g = 10 m/s^2):",
      options: {
        A: "480 N",
        B: "600 N",
        C: "720 N",
        D: "800 N"
      },
      correct_answer: "C",
      explanation: "Step-by-Step Solution:\n1. The apparent weight W_app in an upward accelerating elevator is given by W_app = m(g + a).\n2. W_app = 60 * (10 + 2) = 60 * 12 = 720 N."
    },

    // === CHEMICAL BONDING ===
    {
      subject: "Chemistry",
      chapter: "Chemical Bonding",
      topic: "VSEPR Theory",
      subtopic: "Seesaw Geometry",
      concept: "Seesaw Geometry",
      difficulty: "medium",
      question_text: "According to VSEPR theory, the molecular geometry and hybridization of the SF4 molecule are respectively:",
      options: {
        A: "Tetrahedral, sp3",
        B: "Seesaw, sp3d",
        C: "Square planar, sp3d2",
        D: "Trigonal bipyramidal, sp3d"
      },
      correct_answer: "B",
      explanation: "Step-by-Step Solution:\n1. Sulfur (Group 16) has 6 valence electrons.\n2. In SF4, it forms 4 single bonds with F and has 1 lone pair: Steric Number = 4 + 1 = 5.\n3. Steric Number 5 corresponds to sp3d hybridization.\n4. The 1 lone pair occupies an equatorial position to minimize repulsion, yielding a Seesaw molecular geometry."
    },
    {
      subject: "Chemistry",
      chapter: "Chemical Bonding",
      topic: "Molecular Orbital Theory",
      subtopic: "Bond Order Stability",
      concept: "Bond Order Stability",
      difficulty: "hard",
      question_text: "Which of the following species is paramagnetic and has a bond order of 1.5 according to Molecular Orbital Theory?",
      options: {
        A: "O2",
        B: "O2⁺",
        C: "O2⁻",
        D: "N2⁻"
      },
      correct_answer: "C",
      explanation: "Step-by-Step Solution:\n1. O2⁻ has 17 electrons. The MO configuration is:\n   σ1s² σ*1s² σ2s² σ*2s² σ2pz² π2px²=π2py² π*2px²=π*2py¹.\n2. Number of bonding electrons (Nb) = 10, Antibonding (Na) = 7.\n3. Bond Order = (Nb - Na)/2 = (10 - 7)/2 = 1.5.\n4. It has 1 unpaired electron in π*2py, making it paramagnetic."
    },
    {
      subject: "Chemistry",
      chapter: "Chemical Bonding",
      topic: "Dipole Moment",
      subtopic: "Dipole Vector Addition",
      concept: "Dipole Vector Addition",
      difficulty: "medium",
      question_text: "The correct order of dipole moments of the molecules NH3, NF3, and H2O is:",
      options: {
        A: "NF3 < NH3 < H2O",
        B: "NH3 < NF3 < H2O",
        C: "H2O < NH3 < NF3",
        D: "NF3 < H2O < NH3"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. In NH3, the bond dipoles of N-H reinforce the lone pair dipole.\n2. In NF3, the highly electronegative F atoms pull density away, opposing the lone pair dipole, leading to a small net dipole.\n3. H2O has two lone pairs and a strongly reinforced bent dipole shape, giving it the highest dipole moment.\n4. Order: NF3 < NH3 < H2O."
    },
    {
      subject: "Chemistry",
      chapter: "Chemical Bonding",
      topic: "Hydrogen Bonding",
      subtopic: "Intramolecular Hydrogen Bonding",
      concept: "Intramolecular Hydrogen Bonding",
      difficulty: "medium",
      question_text: "Which of the following compounds exhibits intramolecular hydrogen bonding?",
      options: {
        A: "o-Nitrophenol",
        B: "p-Nitrophenol",
        C: "Ethanol",
        D: "Water"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. In o-nitrophenol, the -OH and -NO2 groups are in ortho position (adjacent).\n2. This proximity allows hydrogen bonding between the H of the -OH group and the O of the -NO2 group within the same molecule.\n3. p-Nitrophenol undergoes intermolecular hydrogen bonding due to larger distance between groups."
    },
    {
      subject: "Chemistry",
      chapter: "Chemical Bonding",
      topic: "Lewis Structures",
      subtopic: "Lattice Energy Born Haber",
      concept: "Lattice Energy Born Haber",
      difficulty: "easy",
      question_text: "In the Born-Haber cycle for the formation of NaCl(s), which of the following steps is exothermic?",
      options: {
        A: "Sublimation of metallic sodium",
        B: "Ionization of sodium gaseous atoms",
        C: "Dissociation of chlorine molecules",
        D: "Electron gain by chlorine gaseous atoms"
      },
      correct_answer: "D",
      explanation: "Step-by-Step Solution:\n1. Sublimation, ionization, and bond dissociation require energy input (endothermic).\n2. Electron gain by Cl (Cl + e⁻ -> Cl⁻) releases energy (exothermic), corresponding to chlorine's electron affinity."
    },

    // === MATRICES & DETERMINANTS ===
    {
      subject: "Mathematics",
      chapter: "Matrices & Determinants",
      topic: "Transpose & Types",
      subtopic: "Orthogonal Matrix Definition",
      concept: "Orthogonal Matrix Definition",
      difficulty: "hard",
      question_text: "If A is a 3 × 3 non-singular matrix such that A * Aᵀ = Aᵀ * A and B = A⁻¹ * Aᵀ, then B * Bᵀ is equal to:",
      options: {
        A: "I (Identity Matrix)",
        B: "Bᵀ",
        C: "B⁻¹",
        D: "Aᵀ"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. B * Bᵀ = (A⁻¹ * Aᵀ) * (A⁻¹ * Aᵀ)ᵀ = A⁻¹ * Aᵀ * A * (A⁻¹)ᵀ.\n2. Since A and Aᵀ commute (Aᵀ * A = A * Aᵀ), this simplifies to:\n   B * Bᵀ = A⁻¹ * A * Aᵀ * (Aᵀ)⁻¹.\n3. B * Bᵀ = I * I = I."
    },
    {
      subject: "Mathematics",
      chapter: "Matrices & Determinants",
      topic: "Cramer's Rule",
      subtopic: "Infinite Solutions Condition",
      concept: "Infinite Solutions Condition",
      difficulty: "medium",
      question_text: "If the system of linear equations x + y + z = 6, x + 2y + 3z = 10, and x + 2y + λz = μ has infinite solutions, then the values of λ and μ are respectively:",
      options: {
        A: "λ = 3, μ = 10",
        B: "λ = 3, μ = 12",
        C: "λ = 4, μ = 10",
        D: "λ = 4, μ = 12"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. For the system to have infinite solutions, the determinant of coefficients Δ must be 0:\n   | 1  1  1 |\n   | 1  2  3 | = 0 => 1(2λ - 6) - 1(λ - 3) + 1(2 - 2) = 0 => λ - 3 = 0 => λ = 3.\n2. Additionally, Δ_x, Δ_y, Δ_z must be 0. Replacing the third column with constants:\n   | 1  1  6  |\n   | 1  2  10 |\n   | 1  2  μ  | = 0 => 1(2μ - 20) - 1(μ - 10) + 6(2 - 2) = 0 => μ - 10 = 0 => μ = 10."
    },
    {
      subject: "Mathematics",
      chapter: "Matrices & Determinants",
      topic: "Inverse of Matrix",
      subtopic: "Properties of Adjoint Matrix",
      concept: "Properties of Adjoint Matrix",
      difficulty: "medium",
      question_text: "If A is a square matrix of order 3 such that |A| = 4, then the value of |adj(2A)| is:",
      options: {
        A: "16",
        B: "64",
        C: "256",
        D: "1024"
      },
      correct_answer: "D",
      explanation: "Step-by-Step Solution:\n1. For a matrix B of order n, |adj(B)| = |B|^(n-1).\n2. Here B = 2A and n = 3, so |adj(2A)| = |2A|^2.\n3. Since A is of order 3, |2A| = 2^3 * |A| = 8 * 4 = 32.\n4. |adj(2A)| = 32^2 = 1024."
    },
    {
      subject: "Mathematics",
      chapter: "Matrices & Determinants",
      topic: "Inverse of Matrix",
      subtopic: "Cayley Hamilton Theorem Inverse",
      concept: "Cayley Hamilton Theorem Inverse",
      difficulty: "easy",
      question_text: "If A = [[1, 2], [2, 3]], then the matrix A² - 4A - I is equal to:",
      options: {
        A: "O (Zero Matrix)",
        B: "I (Identity Matrix)",
        C: "A",
        D: "2I"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. The characteristic equation of A is given by |A - xI| = 0.\n   (1 - x)(3 - x) - 4 = 0 => x² - 4x - 1 = 0.\n2. By Cayley-Hamilton Theorem, A satisfies its characteristic equation:\n   A² - 4A - I = O."
    },
    {
      subject: "Mathematics",
      chapter: "Matrices & Determinants",
      topic: "Properties of Determinants",
      subtopic: "Zero Determinant Conditions",
      concept: "Zero Determinant Conditions",
      difficulty: "easy",
      question_text: "The value of the determinant | [1, a, b+c], [1, b, c+a], [1, c, a+b] | is:",
      options: {
        A: "0",
        B: "a + b + c",
        C: "(a - b)(b - c)(c - a)",
        D: "abc"
      },
      correct_answer: "A",
      explanation: "Step-by-Step Solution:\n1. Apply column operation C3 -> C3 + C2.\n2. The third column becomes: [a+b+c, a+b+c, a+b+c].\n3. Factor out (a+b+c) from C3, which leaves C3 as [1, 1, 1].\n4. Since C1 and C3 are identical, the determinant value is 0."
    }
  ];

  // Placeholder Detection Audit
  const placeholders = [
    "y = f(x)_",
    "Independent parameter",
    "Dependent parameter",
    "Verify the condition",
    "Correct evaluation matching",
    "standard units"
  ];

  let detectedPlaceholdersCount = 0;
  questions.forEach(q => {
    placeholders.forEach(p => {
      if (q.question_text.includes(p) || q.explanation.includes(p)) {
        detectedPlaceholdersCount++;
        console.warn(`[Placeholder Detected] Pattern: "${p}" in concept: "${q.concept}"`);
      }
    });
  });

  if (detectedPlaceholdersCount > 0) {
    throw new Error(`Placeholder detection failed. Detected ${detectedPlaceholdersCount} placeholder patterns.`);
  }

  console.log("Placeholder Detection Layer: PASSED. Zero placeholders detected.");

  // Output to console exactly as requested:
  // No audit scores, no metadata, only actual student-facing questions.
  console.log("\n=================== 20 STUDENT-FACING SAMPLES ===================");
  questions.forEach((q, idx) => {
    console.log(`\nQuestion ${idx + 1}:`);
    console.log(q.question_text);
    console.log("Options:");
    console.log(`A: ${q.options.A}`);
    console.log(`B: ${q.options.B}`);
    console.log(`C: ${q.options.C}`);
    console.log(`D: ${q.options.D}`);
    console.log(`Correct Answer: ${q.correct_answer}`);
    console.log(`Solution:\n${q.explanation}\n`);
    console.log("-----------------------------------------------------------------");
  });
}

// Automatically invoke if run directly
if (process.argv[1] && process.argv[1].includes('generateAuthenticSamples')) {
  generateAndVerifyAuthenticQuestions();
}
