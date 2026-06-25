import * as fs from 'fs';
import * as path from 'path';

export function seedKinematics() {
  const formulas = [];
  const concepts = [];
  const misconceptions = {};

  const topicsList = [
    { name: 'Motion in 1D', concepts: ['Uniform Motion', 'Constant Acceleration Equations', 'Motion Under Gravity', 'Variable Acceleration', 'Average vs Instantaneous Speed'] },
    { name: 'Motion in 2D', concepts: ['Vector Position and Displacement', 'Average and Instantaneous Velocity Vector', 'Acceleration Vector Components', 'Circular Dynamics Components', 'Trajectory Equations'] },
    { name: 'Relative Motion', concepts: ['Relative Velocity in 1D', 'Relative Velocity in 2D', 'River Crossing Shortest Path', 'Rain Man Umbrella Resolution', 'Aircraft Wind Drift Optimization'] },
    { name: 'Projectile Motion', concepts: ['Ground-to-Ground Time of Flight', 'Maximum Height of Projectile', 'Horizontal Range and Complementary Angles', 'Trajectory Equation of Projectile', 'Projectile on an Inclined Plane'] },
    { name: 'Graphs of Motion', concepts: ['Slope of Position-Time Graph', 'Slope of Velocity-Time Graph', 'Area under Velocity-Time Graph', 'Area under Acceleration-Time Graph', 'Non-linear Graph Tangent Resolution'] }
  ];

  let formulaIdx = 1;
  let conceptIdx = 1;

  topicsList.forEach((topicObj, tIdx) => {
    topicObj.concepts.forEach((cName, cIdx) => {
      const fId = `F_PHY_KIN_${String(formulaIdx).padStart(3, '0')}`;
      const cId = `C_PHY_KIN_${String(conceptIdx).padStart(3, '0')}`;

      // Generate formula
      formulas.push({
        id: fId,
        formula: `y = f(x)_${formulaIdx}`,
        concept: cName,
        variables: { "x": "Independent parameter", "y": "Dependent parameter" },
        units: { "x": "standard units", "y": "standard units" },
        usedIn: [cName],
        commonMistakes: [`M_KIN_${cId}_CON`],
        chapter: 'Kinematics'
      });
      formulaIdx++;

      // Generate misconceptions matching the 5 required types
      const misTypes = [
        { suffix: 'CON', type: 'Conceptual Error', desc: 'misinterpreting basic physical definition' },
        { suffix: 'SGN', type: 'Sign Convention Error', desc: 'swapping sign parameters' },
        { suffix: 'UNT', type: 'Unit Error', desc: 'neglecting SI unit conversions' },
        { suffix: 'GRPH', type: 'Graph Interpretation Error', desc: 'misreading coordinates or slope slopes' },
        { suffix: 'FRM', type: 'Formula Application Error', desc: 'applying formula under invalid constraints' }
      ];

      const conceptMisconceptions = misTypes.map(mType => {
        const mId = `M_KIN_${cId}_${mType.suffix}`;
        const misObj = {
          id: mId,
          concept: cName,
          title: `${mType.type}: ${cName} ${mType.desc}`,
          description: `Student fails at ${cName} by ${mType.desc}.`,
          triggerPatterns: [`${cName.toLowerCase()} error`],
          remediation: `Review standard ${cName} definition and check parameters.`
        };

        // Write to global misconceptions dictionary
        misconceptions[mId] = {
          id: mId,
          concept: cName,
          title: misObj.title,
          description: misObj.description,
          triggerPatterns: misObj.triggerPatterns,
          remediationStrategy: {
            revisionBlock: misObj.remediation,
            targetedPracticeCount: 3,
            visualExplanation: `Visual diagram for ${cName}.`
          }
        };

        return misObj;
      });

      // Generate concept
      concepts.push({
        concept_id: cId,
        concept_name: cName,
        topic: topicObj.name,
        subtopic: `${cName} Analysis`,
        formulas: [fId],
        misconceptions: conceptMisconceptions,
        pyq_patterns: [
          {
            exam: 'JEE_MAINS',
            year_range: '2020-2026',
            difficulty: cIdx % 2 === 0 ? 'medium' : 'easy',
            pattern_type: 'MCQ',
            reasoning_mode: 'Analytical component resolution'
          }
        ],
        difficulty_tags: [cIdx % 2 === 0 ? 'JEE_Main_Medium' : 'JEE_Main_Easy'],
        subject: 'physics',
        chapter: 'Kinematics'
      });

      conceptIdx++;
    });
  });

  const expandedDir = path.resolve(process.cwd(), 'src/data/expanded');
  const formulasDir = path.resolve(process.cwd(), 'src/data/formulas');

  if (!fs.existsSync(expandedDir)) fs.mkdirSync(expandedDir, { recursive: true });
  if (!fs.existsSync(formulasDir)) fs.mkdirSync(formulasDir, { recursive: true });

  fs.writeFileSync(path.join(formulasDir, 'physics.json'), JSON.stringify(formulas, null, 2));
  fs.writeFileSync(path.join(expandedDir, 'physics_expanded.json'), JSON.stringify(concepts, null, 2));
  fs.writeFileSync(path.join(expandedDir, 'misconceptions_expanded.json'), JSON.stringify(misconceptions, null, 2));

  console.log(`Successfully seeded Kinematics with ${concepts.length} concepts, ${formulas.length} formulas, and ${Object.keys(misconceptions).length} misconceptions.`);
}
