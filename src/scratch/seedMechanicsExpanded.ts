import * as fs from 'fs';
import * as path from 'path';

export function seedMechanics() {
  const expandedDir = path.resolve(process.cwd(), 'src/data/expanded');
  const formulasDir = path.resolve(process.cwd(), 'src/data/formulas');

  // Load existing physics formulas and concepts
  const formulasPhysPath = path.join(formulasDir, 'physics.json');
  const conceptsPhysPath = path.join(expandedDir, 'physics_expanded.json');
  const misconceptionsPath = path.join(expandedDir, 'misconceptions_expanded.json');

  let formulas = [];
  if (fs.existsSync(formulasPhysPath)) {
    formulas = JSON.parse(fs.readFileSync(formulasPhysPath, 'utf8'));
  }
  let concepts = [];
  if (fs.existsSync(conceptsPhysPath)) {
    concepts = JSON.parse(fs.readFileSync(conceptsPhysPath, 'utf8'));
  }
  // Dedup concepts: filter out existing non-Kinematics ones if any
  concepts = concepts.filter(c => c.chapter === 'Kinematics');

  let misconceptions = {};
  if (fs.existsSync(misconceptionsPath)) {
    misconceptions = JSON.parse(fs.readFileSync(misconceptionsPath, 'utf8'));
  }
  // Keep Kinematics misconceptions
  Object.keys(misconceptions).forEach(k => {
    if (!k.includes('_KIN_')) delete misconceptions[k];
  });

  const mechanicsSyllabus = [
    {
      chapter: 'Laws of Motion',
      prefix: 'NLM',
      topics: [
        { name: "Newton's Laws", concepts: ['Inertia and First Law', 'Linear Momentum and Impulse', 'Second Law Dynamics', 'Action-Reaction Pairs', 'Apparent Weight in Elevator', 'Free Body Diagram Analysis'] },
        { name: 'Friction (Static & Kinetic)', concepts: ['Static Friction Limit', 'Kinetic Sliding Friction', 'Angle of Friction and Repose', 'Friction on Inclined Plane', 'Double Block System Friction', 'Rolling Friction Mechanics'] },
        { name: 'Circular Motion Dynamics', concepts: ['Centripetal Force Requirement', 'Horizontal Circular Turning', 'Banking of Roads', 'Vertical Circular Motion Peak', 'Conical Pendulum Dynamics', 'Centrifugal Pseudo Force'] },
        { name: 'Pseudo Forces', concepts: ['Inertial vs Non-Inertial Frames', 'Wedge-Block Pseudo Force', 'Accelerating Container Fluids', 'Pendulum in Accelerating Car', 'Pseudo Force Direction Rule', 'Coriolis Force Introduction'] },
        { name: 'Constraint Relations', concepts: ['String Pulley Constraints', 'Wedge Block Constraints', 'Virtual Work Method', 'Connected Bodies Acceleration', 'Spring Connected Mass Acceleration', 'Movable Pulley Systems'] }
      ]
    },
    {
      chapter: 'Work, Energy & Power',
      prefix: 'WPE',
      topics: [
        { name: 'Work by constant/variable force', concepts: ['Constant Force Work Integral', 'Variable Force Area Work', 'Dot Product Force Displacement', 'Work done by Spring Force', 'Work done by Friction'] },
        { name: 'Work-Energy Theorem', concepts: ['Work KE Equivalence', 'Net Work Calculation', 'Theorem in Non-Inertial Frame', 'Conservative vs Non-Conservative Work', 'Frictional Dissipation WPE'] },
        { name: 'Conservation of Energy', concepts: ['Mechanical Energy Conservation', 'Potential Energy and Force Relation', 'Spring-Mass Conservation', 'Vertical Loop Energy Thresholds', 'Conservative Force Fields'] },
        { name: 'Potential Energy curves', concepts: ['Stable vs Unstable Equilibrium', 'PE Curve Minima Maxima', 'Turning Points in Motion', 'Force Gradient Calculation', 'Neutral Equilibrium Resolution'] },
        { name: 'Collisions (1D & 2D)', concepts: ['Elastic Collision 1D', 'Inelastic Coefficient of Restitution', 'Oblique Collision 2D', 'Impulsive Deformation Phase', 'Loss of KE in Collisions'] }
      ]
    },
    {
      chapter: 'Rotational Motion',
      prefix: 'ROT',
      topics: [
        { name: 'Moment of Inertia', concepts: ['Discrete Mass System MOI', 'Continuous Rod MOI', 'Ring and Disc MOI', 'Cylinder and Sphere MOI', 'Radius of Gyration'] },
        { name: 'Parallel & Perpendicular Axis Theorems', concepts: ['Parallel Axis Integration', 'Perpendicular Axis Lamina', 'MOI of Composite Bodies', 'Shifted Axis Calculation', 'Symmetry Properties in MOI'] },
        { name: 'Torque & Angular Momentum', concepts: ['Cross Product Torque', 'Rotational Second Law', 'Angular Momentum of Particle', 'Angular Momentum of Rigid Body', 'Torque and Angular Impulse'] },
        { name: 'Rotational Kinematics', concepts: ['Constant Angular Acceleration', 'Angular Vector Relations', 'Linear Rotational Coordinate Match', 'Rolling Kinematics Coordinates', 'Flywheel Rotation Energy'] },
        { name: 'Rolling Motion', concepts: ['Pure Rolling Condition', 'Rolling Kinetic Energy', 'Rolling Down Incline', 'Friction Direction in Rolling', 'Slipping to Rolling Transition'] },
        { name: 'Angular Impulse', concepts: ['Collision with Pivoted Rod', 'Angular Momentum Conservation', 'Eccentric Impact Mechanics', 'Instantaneous Axis of Rotation', 'Hinge Reactions in Impact'] },
        { name: 'Toppling vs Sliding', concepts: ['Critical Force for Toppling', 'Point of Application Normal', 'Incline Toppling Threshold', 'Friction Role in Toppling', 'Block Tilting Dynamics'] }
      ]
    },
    {
      chapter: 'Gravitation',
      prefix: 'GRAV',
      topics: [
        { name: "Newton's Law of Gravitation", concepts: ['Universal Gravitation Constant', 'Superposition of Gravitational Forces', 'Shell Theorem Attraction', 'Solid Sphere Attraction', 'Gravitational Tides Principle'] },
        { name: 'Gravitational Field & Potential', concepts: ['Gravitational Field Strength', 'Field of Ring and Disc', 'Potential of Solid Sphere', 'Field Potential Gradient', 'Self Energy of Sphere'] },
        { name: 'Orbital Motion', concepts: ['Circular Orbit Speed', 'Satellite Kinetic Energy', 'Satellite Binding Energy', 'Geostationary Orbit Radius', 'Orbital Energy Transfer'] },
        { name: 'Escape & Orbital Velocity', concepts: ['Escape Velocity Formula', 'Launch Projection Angle', 'Escape Speed from Orbit', 'Black Hole Radius Limit', 'Atmosphere Escape Criteria'] },
        { name: "Kepler's Laws", concepts: ['Elliptical Orbits Kepler I', 'Areal Velocity Conservation II', 'Time Period Semi-Major Axis III', 'Kepler Law Derivation', 'Kepler Constant Value'] }
      ]
    },
    {
      chapter: 'SHM & Waves',
      prefix: 'SHM',
      topics: [
        { name: 'Simple Harmonic Motion', concepts: ['SHM Differential Equation', 'Displacement Velocity Phase', 'Energy Oscillation Kinetic Potential', 'Superposition of Two SHMs', 'Damped Harmonic Oscillations'] },
        { name: 'Spring-Mass System', concepts: ['Series Spring Constant', 'Parallel Spring Constant', 'Two Body Reduced Mass Oscillation', 'Spring Mass Correction Factor', 'Vertical Spring Balance Position'] },
        { name: 'Simple Pendulum', concepts: ['Small Angle Approximation', 'Large Amplitude Time Period', 'Pendulum in Fluid Buoyancy', 'Infinite Length Pendulum Limit', 'Physical Pendulum Torsional Oscillation'] },
        { name: 'Wave Equation', concepts: ['Travelling Wave Function', 'Wave Velocity String Tension', 'Wave Intensity and Power', 'Reflection Transmit Boundary', 'Phase Change on Reflection'] },
        { name: 'Superposition', concepts: ['Interference Coherent Waves', 'Path Phase Difference Relation', 'Intensity Maximum Minimum', 'Standing Wave Formation Node', 'Resonant Wave Modes'] },
        { name: 'Standing Waves', concepts: ['Organ Pipe Open Harmonic', 'Organ Pipe Closed Harmonic', 'Resonance Column Experiment', 'Sonometer Wire Standing Waves', 'End Correction Calculation'] },
        { name: 'Beats & Doppler Effect', concepts: ['Beat Frequency Phase', 'Doppler Effect Moving Source', 'Doppler Effect Moving Observer', 'Doppler Effect Wind Component', 'Doppler Effect Reflection Wall'] }
      ]
    }
  ];

  let formulaIdx = 26;
  let conceptIdx = 26;

  mechanicsSyllabus.forEach(chObj => {
    chObj.topics.forEach(topicObj => {
      topicObj.concepts.forEach(cName => {
        const fId = `F_PHY_${chObj.prefix}_${String(formulaIdx).padStart(3, '0')}`;
        const cId = `C_PHY_${chObj.prefix}_${String(conceptIdx).padStart(3, '0')}`;

        // Create formula
        formulas.push({
          id: fId,
          formula: `y = f(x)_${formulaIdx}`,
          concept: cName,
          variables: { "x": "Independent parameter", "y": "Dependent parameter" },
          units: { "x": "standard units", "y": "standard units" },
          usedIn: [cName],
          commonMistakes: [`M_${chObj.prefix}_${cId}_CON`],
          chapter: chObj.chapter
        });
        formulaIdx++;

        // Create misconceptions (5 types per concept)
        const misTypes = [
          { suffix: 'CON', type: 'Conceptual Error', desc: 'misinterpreting basic physical definition' },
          { suffix: 'SGN', type: 'Sign Convention Error', desc: 'swapping sign parameters' },
          { suffix: 'UNT', type: 'Unit Error', desc: 'neglecting SI unit conversions' },
          { suffix: 'GRPH', type: 'Graph Interpretation Error', desc: 'misreading coordinates or slope slopes' },
          { suffix: 'FRM', type: 'Formula Application Error', desc: 'applying formula under invalid constraints' }
        ];

        const conceptMisconceptions = misTypes.map(mType => {
          const mId = `M_${chObj.prefix}_${cId}_${mType.suffix}`;
          const misObj = {
            id: mId,
            concept: cName,
            title: `${mType.type}: ${cName} ${mType.desc}`,
            description: `Student fails at ${cName} by ${mType.desc}.`,
            triggerPatterns: [`${cName.toLowerCase()} error`],
            remediation: `Review standard ${cName} definition and check parameters.`
          };

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

        // Create concept
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
              difficulty: 'medium',
              pattern_type: 'MCQ',
              reasoning_mode: 'Analytical component resolution'
            }
          ],
          difficulty_tags: ['JEE_Main_Medium'],
          subject: 'physics',
          chapter: chObj.chapter
        });

        conceptIdx++;
      });
    });
  });

  fs.writeFileSync(formulasPhysPath, JSON.stringify(formulas, null, 2));
  fs.writeFileSync(conceptsPhysPath, JSON.stringify(concepts, null, 2));
  fs.writeFileSync(misconceptionsPath, JSON.stringify(misconceptions, null, 2));

  console.log(`Mechanics seeding completed. Total Physics Concepts: ${concepts.length}. Total Physics Formulas: ${formulas.length}.`);
}
