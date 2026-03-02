// School syllabus data for Class 6-10 (Foundation Mode)
// Subjects: Mathematics, Science (no Physics/Chemistry separation for 6-8)

export interface SchoolChapter {
  id: string;
  name: string;
  subject: string;
  classLevel: number;
  weightage?: 'High' | 'Medium' | 'Low';
}

export interface SchoolSubject {
  key: string;
  label: string;
  emoji: string;
  gradient: string;
  dotColor: string;
}

// Foundation subjects by class range
export const getSchoolSubjects = (studentClass: number): SchoolSubject[] => {
  if (studentClass <= 8) {
    return [
      { key: 'mathematics', label: 'Mathematics', emoji: '📐', gradient: 'from-violet-500 to-purple-500', dotColor: 'bg-violet-500' },
      { key: 'science', label: 'Science', emoji: '🔬', gradient: 'from-emerald-500 to-green-500', dotColor: 'bg-emerald-500' },
    ];
  }
  // Class 9-10: Science splits into Physics, Chemistry, Biology
  return [
    { key: 'mathematics', label: 'Mathematics', emoji: '📐', gradient: 'from-violet-500 to-purple-500', dotColor: 'bg-violet-500' },
    { key: 'physics', label: 'Physics', emoji: '⚛️', gradient: 'from-blue-500 to-cyan-500', dotColor: 'bg-blue-500' },
    { key: 'chemistry', label: 'Chemistry', emoji: '🧪', gradient: 'from-emerald-500 to-green-500', dotColor: 'bg-emerald-500' },
    { key: 'biology', label: 'Biology', emoji: '🧬', gradient: 'from-green-500 to-emerald-600', dotColor: 'bg-green-500' },
  ];
};

// School chapters organized by class and subject
const schoolChapters: Record<number, SchoolChapter[]> = {
  6: [
    // Mathematics
    { id: 'sch-6-math-1', name: 'Knowing Our Numbers', subject: 'mathematics', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-math-2', name: 'Whole Numbers', subject: 'mathematics', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-math-3', name: 'Playing with Numbers', subject: 'mathematics', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-math-4', name: 'Basic Geometrical Ideas', subject: 'mathematics', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-math-5', name: 'Understanding Elementary Shapes', subject: 'mathematics', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-math-6', name: 'Integers', subject: 'mathematics', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-math-7', name: 'Fractions', subject: 'mathematics', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-math-8', name: 'Decimals', subject: 'mathematics', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-math-9', name: 'Data Handling', subject: 'mathematics', classLevel: 6, weightage: 'Low' },
    { id: 'sch-6-math-10', name: 'Mensuration', subject: 'mathematics', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-math-11', name: 'Algebra', subject: 'mathematics', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-math-12', name: 'Ratio and Proportion', subject: 'mathematics', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-math-13', name: 'Symmetry', subject: 'mathematics', classLevel: 6, weightage: 'Low' },
    // Science
    { id: 'sch-6-sci-1', name: 'Food: Where Does It Come From?', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-2', name: 'Components of Food', subject: 'science', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-sci-3', name: 'Fibre to Fabric', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-4', name: 'Sorting Materials into Groups', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-5', name: 'Changes Around Us', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-6', name: 'Getting to Know Plants', subject: 'science', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-sci-7', name: 'Body Movements', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-8', name: 'The Living Organisms', subject: 'science', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-sci-9', name: 'Motion and Measurement of Distances', subject: 'science', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-sci-10', name: 'Light, Shadows and Reflections', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-11', name: 'Electricity and Circuits', subject: 'science', classLevel: 6, weightage: 'High' },
    { id: 'sch-6-sci-12', name: 'Fun with Magnets', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-13', name: 'Water', subject: 'science', classLevel: 6, weightage: 'Medium' },
    { id: 'sch-6-sci-14', name: 'Air Around Us', subject: 'science', classLevel: 6, weightage: 'Medium' },
  ],
  7: [
    // Mathematics
    { id: 'sch-7-math-1', name: 'Integers', subject: 'mathematics', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-math-2', name: 'Fractions and Decimals', subject: 'mathematics', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-math-3', name: 'Data Handling', subject: 'mathematics', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-math-4', name: 'Simple Equations', subject: 'mathematics', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-math-5', name: 'Lines and Angles', subject: 'mathematics', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-math-6', name: 'The Triangle and Its Properties', subject: 'mathematics', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-math-7', name: 'Comparing Quantities', subject: 'mathematics', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-math-8', name: 'Rational Numbers', subject: 'mathematics', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-math-9', name: 'Perimeter and Area', subject: 'mathematics', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-math-10', name: 'Algebraic Expressions', subject: 'mathematics', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-math-11', name: 'Exponents and Powers', subject: 'mathematics', classLevel: 7, weightage: 'Medium' },
    // Science
    { id: 'sch-7-sci-1', name: 'Nutrition in Plants', subject: 'science', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-sci-2', name: 'Nutrition in Animals', subject: 'science', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-sci-3', name: 'Heat', subject: 'science', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-sci-4', name: 'Acids, Bases and Salts', subject: 'science', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-sci-5', name: 'Physical and Chemical Changes', subject: 'science', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-sci-6', name: 'Respiration in Organisms', subject: 'science', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-sci-7', name: 'Transportation in Animals and Plants', subject: 'science', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-sci-8', name: 'Reproduction in Plants', subject: 'science', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-sci-9', name: 'Motion and Time', subject: 'science', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-sci-10', name: 'Electric Current and Its Effects', subject: 'science', classLevel: 7, weightage: 'High' },
    { id: 'sch-7-sci-11', name: 'Light', subject: 'science', classLevel: 7, weightage: 'Medium' },
    { id: 'sch-7-sci-12', name: 'Water: A Precious Resource', subject: 'science', classLevel: 7, weightage: 'Low' },
  ],
  8: [
    // Mathematics
    { id: 'sch-8-math-1', name: 'Rational Numbers', subject: 'mathematics', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-math-2', name: 'Linear Equations in One Variable', subject: 'mathematics', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-math-3', name: 'Understanding Quadrilaterals', subject: 'mathematics', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-math-4', name: 'Data Handling', subject: 'mathematics', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-math-5', name: 'Squares and Square Roots', subject: 'mathematics', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-math-6', name: 'Cubes and Cube Roots', subject: 'mathematics', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-math-7', name: 'Comparing Quantities', subject: 'mathematics', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-math-8', name: 'Algebraic Expressions and Identities', subject: 'mathematics', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-math-9', name: 'Mensuration', subject: 'mathematics', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-math-10', name: 'Exponents and Powers', subject: 'mathematics', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-math-11', name: 'Direct and Inverse Proportions', subject: 'mathematics', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-math-12', name: 'Factorisation', subject: 'mathematics', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-math-13', name: 'Introduction to Graphs', subject: 'mathematics', classLevel: 8, weightage: 'Medium' },
    // Science
    { id: 'sch-8-sci-1', name: 'Crop Production and Management', subject: 'science', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-sci-2', name: 'Microorganisms: Friend and Foe', subject: 'science', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-sci-3', name: 'Coal and Petroleum', subject: 'science', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-sci-4', name: 'Combustion and Flame', subject: 'science', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-sci-5', name: 'Conservation of Plants and Animals', subject: 'science', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-sci-6', name: 'Cell — Structure and Functions', subject: 'science', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-sci-7', name: 'Reproduction in Animals', subject: 'science', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-sci-8', name: 'Force and Pressure', subject: 'science', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-sci-9', name: 'Friction', subject: 'science', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-sci-10', name: 'Sound', subject: 'science', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-sci-11', name: 'Chemical Effects of Electric Current', subject: 'science', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-sci-12', name: 'Some Natural Phenomena', subject: 'science', classLevel: 8, weightage: 'Medium' },
    { id: 'sch-8-sci-13', name: 'Light', subject: 'science', classLevel: 8, weightage: 'High' },
    { id: 'sch-8-sci-14', name: 'Stars and the Solar System', subject: 'science', classLevel: 8, weightage: 'Low' },
  ],
  9: [
    // Mathematics
    { id: 'sch-9-math-1', name: 'Number Systems', subject: 'mathematics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-math-2', name: 'Polynomials', subject: 'mathematics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-math-3', name: 'Coordinate Geometry', subject: 'mathematics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-math-4', name: 'Linear Equations in Two Variables', subject: 'mathematics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-math-5', name: 'Introduction to Euclid\'s Geometry', subject: 'mathematics', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-math-6', name: 'Lines and Angles', subject: 'mathematics', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-math-7', name: 'Triangles', subject: 'mathematics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-math-8', name: 'Quadrilaterals', subject: 'mathematics', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-math-9', name: 'Circles', subject: 'mathematics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-math-10', name: 'Heron\'s Formula', subject: 'mathematics', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-math-11', name: 'Surface Areas and Volumes', subject: 'mathematics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-math-12', name: 'Statistics', subject: 'mathematics', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-math-13', name: 'Probability', subject: 'mathematics', classLevel: 9, weightage: 'Medium' },
    // Physics
    { id: 'sch-9-phy-1', name: 'Motion', subject: 'physics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-phy-2', name: 'Force and Laws of Motion', subject: 'physics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-phy-3', name: 'Gravitation', subject: 'physics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-phy-4', name: 'Work and Energy', subject: 'physics', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-phy-5', name: 'Sound', subject: 'physics', classLevel: 9, weightage: 'Medium' },
    // Chemistry
    { id: 'sch-9-chem-1', name: 'Matter in Our Surroundings', subject: 'chemistry', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-chem-2', name: 'Is Matter Around Us Pure?', subject: 'chemistry', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-chem-3', name: 'Atoms and Molecules', subject: 'chemistry', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-chem-4', name: 'Structure of the Atom', subject: 'chemistry', classLevel: 9, weightage: 'High' },
    // Biology
    { id: 'sch-9-bio-1', name: 'The Fundamental Unit of Life', subject: 'biology', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-bio-2', name: 'Tissues', subject: 'biology', classLevel: 9, weightage: 'High' },
    { id: 'sch-9-bio-3', name: 'Diversity in Living Organisms', subject: 'biology', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-bio-4', name: 'Why Do We Fall Ill?', subject: 'biology', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-bio-5', name: 'Natural Resources', subject: 'biology', classLevel: 9, weightage: 'Medium' },
    { id: 'sch-9-bio-6', name: 'Improvement in Food Resources', subject: 'biology', classLevel: 9, weightage: 'Low' },
  ],
  10: [
    // Mathematics
    { id: 'sch-10-math-1', name: 'Real Numbers', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-2', name: 'Polynomials', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-3', name: 'Pair of Linear Equations', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-4', name: 'Quadratic Equations', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-5', name: 'Arithmetic Progressions', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-6', name: 'Triangles', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-7', name: 'Coordinate Geometry', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-8', name: 'Introduction to Trigonometry', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-9', name: 'Applications of Trigonometry', subject: 'mathematics', classLevel: 10, weightage: 'Medium' },
    { id: 'sch-10-math-10', name: 'Circles', subject: 'mathematics', classLevel: 10, weightage: 'Medium' },
    { id: 'sch-10-math-11', name: 'Areas Related to Circles', subject: 'mathematics', classLevel: 10, weightage: 'Medium' },
    { id: 'sch-10-math-12', name: 'Surface Areas and Volumes', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-math-13', name: 'Statistics', subject: 'mathematics', classLevel: 10, weightage: 'Medium' },
    { id: 'sch-10-math-14', name: 'Probability', subject: 'mathematics', classLevel: 10, weightage: 'High' },
    // Physics
    { id: 'sch-10-phy-1', name: 'Light — Reflection and Refraction', subject: 'physics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-phy-2', name: 'Human Eye and the Colourful World', subject: 'physics', classLevel: 10, weightage: 'Medium' },
    { id: 'sch-10-phy-3', name: 'Electricity', subject: 'physics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-phy-4', name: 'Magnetic Effects of Electric Current', subject: 'physics', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-phy-5', name: 'Sources of Energy', subject: 'physics', classLevel: 10, weightage: 'Medium' },
    // Chemistry
    { id: 'sch-10-chem-1', name: 'Chemical Reactions and Equations', subject: 'chemistry', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-chem-2', name: 'Acids, Bases and Salts', subject: 'chemistry', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-chem-3', name: 'Metals and Non-metals', subject: 'chemistry', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-chem-4', name: 'Carbon and Its Compounds', subject: 'chemistry', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-chem-5', name: 'Periodic Classification of Elements', subject: 'chemistry', classLevel: 10, weightage: 'Medium' },
    // Biology
    { id: 'sch-10-bio-1', name: 'Life Processes', subject: 'biology', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-bio-2', name: 'Control and Coordination', subject: 'biology', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-bio-3', name: 'How do Organisms Reproduce?', subject: 'biology', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-bio-4', name: 'Heredity and Evolution', subject: 'biology', classLevel: 10, weightage: 'High' },
    { id: 'sch-10-bio-5', name: 'Our Environment', subject: 'biology', classLevel: 10, weightage: 'Medium' },
  ],
};

export const getSchoolChapters = (studentClass: number, subject?: string): SchoolChapter[] => {
  const chapters = schoolChapters[studentClass] || [];
  if (subject) return chapters.filter(c => c.subject === subject);
  return chapters;
};

export const getSchoolChapterById = (id: string): SchoolChapter | undefined => {
  for (const cls of Object.values(schoolChapters)) {
    const found = cls.find(c => c.id === id);
    if (found) return found;
  }
  return undefined;
};
