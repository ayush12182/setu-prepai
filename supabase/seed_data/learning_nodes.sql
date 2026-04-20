-- Subject: Physics
INSERT INTO public.learning_nodes (id, name, type, exam_type, sort_order) 
VALUES ('physics-root-uuid', 'Physics', 'root', 'NEET', 0) ON CONFLICT DO NOTHING;

-- Chapter: Kinematics
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-1', 'physics-root-uuid', 'physics-root-uuid', 'Kinematics', 'chapter', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-1-topic-0', 'phy-1', 'physics-root-uuid', 'Motion in 1D', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-1-topic-1', 'phy-1', 'physics-root-uuid', 'Motion in 2D', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-1-topic-2', 'phy-1', 'physics-root-uuid', 'Projectile Motion', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-1-topic-3', 'phy-1', 'physics-root-uuid', 'Relative Motion', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-1-topic-4', 'phy-1', 'physics-root-uuid', 'Graphs of Motion', 'topic', 'NEET', 4);

-- Chapter: Laws of Motion
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-2', 'physics-root-uuid', 'physics-root-uuid', 'Laws of Motion', 'chapter', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-2-topic-0', 'phy-2', 'physics-root-uuid', 'Newton''s Laws', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-2-topic-1', 'phy-2', 'physics-root-uuid', 'Free Body Diagrams', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-2-topic-2', 'phy-2', 'physics-root-uuid', 'Friction (Static & Kinetic)', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-2-topic-3', 'phy-2', 'physics-root-uuid', 'Circular Motion Dynamics', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-2-topic-4', 'phy-2', 'physics-root-uuid', 'Pseudo Forces', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-2-topic-5', 'phy-2', 'physics-root-uuid', 'Constraint Relations', 'topic', 'NEET', 5);

-- Chapter: Work, Energy & Power
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-3', 'physics-root-uuid', 'physics-root-uuid', 'Work, Energy & Power', 'chapter', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-3-topic-0', 'phy-3', 'physics-root-uuid', 'Work by constant/variable force', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-3-topic-1', 'phy-3', 'physics-root-uuid', 'Work-Energy Theorem', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-3-topic-2', 'phy-3', 'physics-root-uuid', 'Conservation of Energy', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-3-topic-3', 'phy-3', 'physics-root-uuid', 'Potential Energy curves', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-3-topic-4', 'phy-3', 'physics-root-uuid', 'Collisions (1D & 2D)', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-3-topic-5', 'phy-3', 'physics-root-uuid', 'Power', 'topic', 'NEET', 5);

-- Chapter: Rotational Motion
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-4', 'physics-root-uuid', 'physics-root-uuid', 'Rotational Motion', 'chapter', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-4-topic-0', 'phy-4', 'physics-root-uuid', 'Moment of Inertia', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-4-topic-1', 'phy-4', 'physics-root-uuid', 'Parallel & Perpendicular Axis Theorems', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-4-topic-2', 'phy-4', 'physics-root-uuid', 'Torque & Angular Momentum', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-4-topic-3', 'phy-4', 'physics-root-uuid', 'Rotational Kinematics', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-4-topic-4', 'phy-4', 'physics-root-uuid', 'Rolling Motion', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-4-topic-5', 'phy-4', 'physics-root-uuid', 'Angular Impulse', 'topic', 'NEET', 5);

-- Chapter: Gravitation
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-5', 'physics-root-uuid', 'physics-root-uuid', 'Gravitation', 'chapter', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-5-topic-0', 'phy-5', 'physics-root-uuid', 'Newton''s Law of Gravitation', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-5-topic-1', 'phy-5', 'physics-root-uuid', 'Gravitational Field & Potential', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-5-topic-2', 'phy-5', 'physics-root-uuid', 'Orbital Motion', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-5-topic-3', 'phy-5', 'physics-root-uuid', 'Escape & Orbital Velocity', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-5-topic-4', 'phy-5', 'physics-root-uuid', 'Kepler''s Laws', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-5-topic-5', 'phy-5', 'physics-root-uuid', 'Satellites', 'topic', 'NEET', 5);

-- Chapter: SHM & Waves
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-6', 'physics-root-uuid', 'physics-root-uuid', 'SHM & Waves', 'chapter', 'NEET', 5);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-6-topic-0', 'phy-6', 'physics-root-uuid', 'Simple Harmonic Motion', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-6-topic-1', 'phy-6', 'physics-root-uuid', 'Spring-Mass System', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-6-topic-2', 'phy-6', 'physics-root-uuid', 'Simple Pendulum', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-6-topic-3', 'phy-6', 'physics-root-uuid', 'Wave Equation', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-6-topic-4', 'phy-6', 'physics-root-uuid', 'Superposition', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-6-topic-5', 'phy-6', 'physics-root-uuid', 'Standing Waves', 'topic', 'NEET', 5);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-6-topic-6', 'phy-6', 'physics-root-uuid', 'Beats & Doppler Effect', 'topic', 'NEET', 6);

-- Chapter: Thermodynamics
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-7', 'physics-root-uuid', 'physics-root-uuid', 'Thermodynamics', 'chapter', 'NEET', 6);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-7-topic-0', 'phy-7', 'physics-root-uuid', 'First Law of Thermodynamics', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-7-topic-1', 'phy-7', 'physics-root-uuid', 'Thermodynamic Processes', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-7-topic-2', 'phy-7', 'physics-root-uuid', 'Heat Engines', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-7-topic-3', 'phy-7', 'physics-root-uuid', 'Carnot Cycle', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-7-topic-4', 'phy-7', 'physics-root-uuid', 'Entropy', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-7-topic-5', 'phy-7', 'physics-root-uuid', 'Kinetic Theory of Gases', 'topic', 'NEET', 5);

-- Chapter: Electrostatics
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-8', 'physics-root-uuid', 'physics-root-uuid', 'Electrostatics', 'chapter', 'NEET', 7);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-8-topic-0', 'phy-8', 'physics-root-uuid', 'Coulomb''s Law', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-8-topic-1', 'phy-8', 'physics-root-uuid', 'Electric Field', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-8-topic-2', 'phy-8', 'physics-root-uuid', 'Gauss''s Law', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-8-topic-3', 'phy-8', 'physics-root-uuid', 'Electric Potential', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-8-topic-4', 'phy-8', 'physics-root-uuid', 'Capacitors', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-8-topic-5', 'phy-8', 'physics-root-uuid', 'Dielectrics', 'topic', 'NEET', 5);

-- Chapter: Current Electricity
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-9', 'physics-root-uuid', 'physics-root-uuid', 'Current Electricity', 'chapter', 'NEET', 8);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-9-topic-0', 'phy-9', 'physics-root-uuid', 'Ohm''s Law', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-9-topic-1', 'phy-9', 'physics-root-uuid', 'Resistance & Resistivity', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-9-topic-2', 'phy-9', 'physics-root-uuid', 'Kirchhoff''s Laws', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-9-topic-3', 'phy-9', 'physics-root-uuid', 'RC Circuits', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-9-topic-4', 'phy-9', 'physics-root-uuid', 'Electrical Instruments', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-9-topic-5', 'phy-9', 'physics-root-uuid', 'Heating Effect', 'topic', 'NEET', 5);

-- Chapter: Magnetism & EMI
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-10', 'physics-root-uuid', 'physics-root-uuid', 'Magnetism & EMI', 'chapter', 'NEET', 9);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-10-topic-0', 'phy-10', 'physics-root-uuid', 'Biot-Savart Law', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-10-topic-1', 'phy-10', 'physics-root-uuid', 'Ampere''s Law', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-10-topic-2', 'phy-10', 'physics-root-uuid', 'Magnetic Force on Current', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-10-topic-3', 'phy-10', 'physics-root-uuid', 'Faraday''s Law', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-10-topic-4', 'phy-10', 'physics-root-uuid', 'Lenz''s Law', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-10-topic-5', 'phy-10', 'physics-root-uuid', 'Inductance', 'topic', 'NEET', 5);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-10-topic-6', 'phy-10', 'physics-root-uuid', 'AC Circuits', 'topic', 'NEET', 6);

-- Chapter: Optics
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-11', 'physics-root-uuid', 'physics-root-uuid', 'Optics', 'chapter', 'NEET', 10);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-11-topic-0', 'phy-11', 'physics-root-uuid', 'Reflection & Mirrors', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-11-topic-1', 'phy-11', 'physics-root-uuid', 'Refraction & Lenses', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-11-topic-2', 'phy-11', 'physics-root-uuid', 'Prism & Dispersion', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-11-topic-3', 'phy-11', 'physics-root-uuid', 'Interference', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-11-topic-4', 'phy-11', 'physics-root-uuid', 'Diffraction', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-11-topic-5', 'phy-11', 'physics-root-uuid', 'Polarization', 'topic', 'NEET', 5);

-- Chapter: Modern Physics
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('phy-12', 'physics-root-uuid', 'physics-root-uuid', 'Modern Physics', 'chapter', 'NEET', 11);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-12-topic-0', 'phy-12', 'physics-root-uuid', 'Photoelectric Effect', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-12-topic-1', 'phy-12', 'physics-root-uuid', 'Bohr Model', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-12-topic-2', 'phy-12', 'physics-root-uuid', 'X-rays', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-12-topic-3', 'phy-12', 'physics-root-uuid', 'Nuclear Physics', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-12-topic-4', 'phy-12', 'physics-root-uuid', 'Radioactivity', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('phy-12-topic-5', 'phy-12', 'physics-root-uuid', 'Semiconductors', 'topic', 'NEET', 5);

-- Subject: Chemistry
INSERT INTO public.learning_nodes (id, name, type, exam_type, sort_order) 
VALUES ('chemistry-root-uuid', 'Chemistry', 'root', 'NEET', 1) ON CONFLICT DO NOTHING;

-- Chapter: Mole Concept & Stoichiometry
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-1', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Mole Concept & Stoichiometry', 'chapter', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-1-topic-0', 'chem-1', 'chemistry-root-uuid', 'Mole Concept', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-1-topic-1', 'chem-1', 'chemistry-root-uuid', 'Atomic & Molecular Mass', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-1-topic-2', 'chem-1', 'chemistry-root-uuid', 'Percentage Composition', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-1-topic-3', 'chem-1', 'chemistry-root-uuid', 'Empirical & Molecular Formula', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-1-topic-4', 'chem-1', 'chemistry-root-uuid', 'Limiting Reagent', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-1-topic-5', 'chem-1', 'chemistry-root-uuid', 'Reactions in Solutions', 'topic', 'NEET', 5);

-- Chapter: Atomic Structure
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-2', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Atomic Structure', 'chapter', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-2-topic-0', 'chem-2', 'chemistry-root-uuid', 'Bohr Model', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-2-topic-1', 'chem-2', 'chemistry-root-uuid', 'Quantum Numbers', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-2-topic-2', 'chem-2', 'chemistry-root-uuid', 'Electronic Configuration', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-2-topic-3', 'chem-2', 'chemistry-root-uuid', 'Photoelectric Effect', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-2-topic-4', 'chem-2', 'chemistry-root-uuid', 'de Broglie Wavelength', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-2-topic-5', 'chem-2', 'chemistry-root-uuid', 'Heisenberg Uncertainty', 'topic', 'NEET', 5);

-- Chapter: Chemical Bonding
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-3', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Chemical Bonding', 'chapter', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-3-topic-0', 'chem-3', 'chemistry-root-uuid', 'Lewis Structures', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-3-topic-1', 'chem-3', 'chemistry-root-uuid', 'VSEPR Theory', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-3-topic-2', 'chem-3', 'chemistry-root-uuid', 'Hybridization', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-3-topic-3', 'chem-3', 'chemistry-root-uuid', 'Molecular Orbital Theory', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-3-topic-4', 'chem-3', 'chemistry-root-uuid', 'Hydrogen Bonding', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-3-topic-5', 'chem-3', 'chemistry-root-uuid', 'Dipole Moment', 'topic', 'NEET', 5);

-- Chapter: Thermodynamics & Thermochemistry
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-4', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Thermodynamics & Thermochemistry', 'chapter', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-4-topic-0', 'chem-4', 'chemistry-root-uuid', 'First Law', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-4-topic-1', 'chem-4', 'chemistry-root-uuid', 'Enthalpy', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-4-topic-2', 'chem-4', 'chemistry-root-uuid', 'Hess''s Law', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-4-topic-3', 'chem-4', 'chemistry-root-uuid', 'Bond Enthalpy', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-4-topic-4', 'chem-4', 'chemistry-root-uuid', 'Entropy', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-4-topic-5', 'chem-4', 'chemistry-root-uuid', 'Gibbs Free Energy', 'topic', 'NEET', 5);

-- Chapter: Chemical Equilibrium
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-5', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Chemical Equilibrium', 'chapter', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-5-topic-0', 'chem-5', 'chemistry-root-uuid', 'Law of Mass Action', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-5-topic-1', 'chem-5', 'chemistry-root-uuid', 'Equilibrium Constant', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-5-topic-2', 'chem-5', 'chemistry-root-uuid', 'Le Chatelier''s Principle', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-5-topic-3', 'chem-5', 'chemistry-root-uuid', 'Ionic Equilibrium', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-5-topic-4', 'chem-5', 'chemistry-root-uuid', 'Buffer Solutions', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-5-topic-5', 'chem-5', 'chemistry-root-uuid', 'Solubility Product', 'topic', 'NEET', 5);

-- Chapter: Electrochemistry
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-6', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Electrochemistry', 'chapter', 'NEET', 5);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-6-topic-0', 'chem-6', 'chemistry-root-uuid', 'Conductance', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-6-topic-1', 'chem-6', 'chemistry-root-uuid', 'Galvanic Cells', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-6-topic-2', 'chem-6', 'chemistry-root-uuid', 'Nernst Equation', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-6-topic-3', 'chem-6', 'chemistry-root-uuid', 'Electrolysis', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-6-topic-4', 'chem-6', 'chemistry-root-uuid', 'Faraday''s Laws', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-6-topic-5', 'chem-6', 'chemistry-root-uuid', 'Batteries & Corrosion', 'topic', 'NEET', 5);

-- Chapter: Chemical Kinetics
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-7', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Chemical Kinetics', 'chapter', 'NEET', 6);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-7-topic-0', 'chem-7', 'chemistry-root-uuid', 'Rate of Reaction', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-7-topic-1', 'chem-7', 'chemistry-root-uuid', 'Order & Molecularity', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-7-topic-2', 'chem-7', 'chemistry-root-uuid', 'Integrated Rate Laws', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-7-topic-3', 'chem-7', 'chemistry-root-uuid', 'Half-Life', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-7-topic-4', 'chem-7', 'chemistry-root-uuid', 'Arrhenius Equation', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-7-topic-5', 'chem-7', 'chemistry-root-uuid', 'Mechanism & RDS', 'topic', 'NEET', 5);

-- Chapter: GOC & Isomerism
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-8', 'chemistry-root-uuid', 'chemistry-root-uuid', 'GOC & Isomerism', 'chapter', 'NEET', 7);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-8-topic-0', 'chem-8', 'chemistry-root-uuid', 'Inductive Effect', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-8-topic-1', 'chem-8', 'chemistry-root-uuid', 'Resonance', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-8-topic-2', 'chem-8', 'chemistry-root-uuid', 'Hyperconjugation', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-8-topic-3', 'chem-8', 'chemistry-root-uuid', 'Carbocation/Carbanion Stability', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-8-topic-4', 'chem-8', 'chemistry-root-uuid', 'Structural Isomerism', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-8-topic-5', 'chem-8', 'chemistry-root-uuid', 'Stereoisomerism (E/Z, R/S)', 'topic', 'NEET', 5);

-- Chapter: Hydrocarbons
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-9', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Hydrocarbons', 'chapter', 'NEET', 8);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-9-topic-0', 'chem-9', 'chemistry-root-uuid', 'Alkanes', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-9-topic-1', 'chem-9', 'chemistry-root-uuid', 'Alkenes', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-9-topic-2', 'chem-9', 'chemistry-root-uuid', 'Alkynes', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-9-topic-3', 'chem-9', 'chemistry-root-uuid', 'Aromatic Compounds', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-9-topic-4', 'chem-9', 'chemistry-root-uuid', 'Reactions & Mechanisms', 'topic', 'NEET', 4);

-- Chapter: Organic Reactions & Named Reactions
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-10', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Organic Reactions & Named Reactions', 'chapter', 'NEET', 9);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-10-topic-0', 'chem-10', 'chemistry-root-uuid', 'Substitution (SN1, SN2)', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-10-topic-1', 'chem-10', 'chemistry-root-uuid', 'Elimination (E1, E2)', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-10-topic-2', 'chem-10', 'chemistry-root-uuid', 'Addition Reactions', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-10-topic-3', 'chem-10', 'chemistry-root-uuid', 'Named Reactions', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-10-topic-4', 'chem-10', 'chemistry-root-uuid', 'Oxidation & Reduction', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-10-topic-5', 'chem-10', 'chemistry-root-uuid', 'Rearrangements', 'topic', 'NEET', 5);

-- Chapter: Periodic Table & Trends
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-11', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Periodic Table & Trends', 'chapter', 'NEET', 10);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-11-topic-0', 'chem-11', 'chemistry-root-uuid', 'Periodic Classification', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-11-topic-1', 'chem-11', 'chemistry-root-uuid', 'Atomic & Ionic Radii', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-11-topic-2', 'chem-11', 'chemistry-root-uuid', 'Ionization Energy', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-11-topic-3', 'chem-11', 'chemistry-root-uuid', 'Electron Affinity', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-11-topic-4', 'chem-11', 'chemistry-root-uuid', 'Electronegativity', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-11-topic-5', 'chem-11', 'chemistry-root-uuid', 'Oxidation States', 'topic', 'NEET', 5);

-- Chapter: Coordination Chemistry
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('chem-12', 'chemistry-root-uuid', 'chemistry-root-uuid', 'Coordination Chemistry', 'chapter', 'NEET', 11);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-12-topic-0', 'chem-12', 'chemistry-root-uuid', 'Werner Theory', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-12-topic-1', 'chem-12', 'chemistry-root-uuid', 'IUPAC Nomenclature', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-12-topic-2', 'chem-12', 'chemistry-root-uuid', 'Isomerism', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-12-topic-3', 'chem-12', 'chemistry-root-uuid', 'Crystal Field Theory', 'topic', 'NEET', 3);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-12-topic-4', 'chem-12', 'chemistry-root-uuid', 'Color & Magnetism', 'topic', 'NEET', 4);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('chem-12-topic-5', 'chem-12', 'chemistry-root-uuid', 'Stability of Complexes', 'topic', 'NEET', 5);

-- Subject: Biology
INSERT INTO public.learning_nodes (id, name, type, exam_type, sort_order) 
VALUES ('biology-root-uuid', 'Biology', 'root', 'NEET', 2) ON CONFLICT DO NOTHING;

-- Chapter: The Living World
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('bio-1', 'biology-root-uuid', 'biology-root-uuid', 'The Living World', 'chapter', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-1-topic-0', 'bio-1', 'biology-root-uuid', 'Diversity in Living World', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-1-topic-1', 'bio-1', 'biology-root-uuid', 'Taxonomic Categories', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-1-topic-2', 'bio-1', 'biology-root-uuid', 'Taxonomical Aids', 'topic', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-1-topic-3', 'bio-1', 'biology-root-uuid', 'Binomial Nomenclature', 'topic', 'NEET', 3);

-- Chapter: Biological Classification
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('bio-2', 'biology-root-uuid', 'biology-root-uuid', 'Biological Classification', 'chapter', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-2-topic-0', 'bio-2', 'biology-root-uuid', 'Five Kingdom Classification', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-2-topic-1', 'bio-2', 'biology-root-uuid', 'Monera, Protista, Fungi', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-2-topic-2', 'bio-2', 'biology-root-uuid', 'Viruses, Viroids, Lichens', 'topic', 'NEET', 2);

-- Chapter: Plant Kingdom
INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
VALUES ('bio-3', 'biology-root-uuid', 'biology-root-uuid', 'Plant Kingdom', 'chapter', 'NEET', 2);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-3-topic-0', 'bio-3', 'biology-root-uuid', 'Algae, Bryophytes, Pteridophytes', 'topic', 'NEET', 0);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-3-topic-1', 'bio-3', 'biology-root-uuid', 'Gymnosperms, Angiosperms', 'topic', 'NEET', 1);
  INSERT INTO public.learning_nodes (id, parent_id, subject_node_id, name, type, exam_type, sort_order) 
  VALUES ('bio-3-topic-2', 'bio-3', 'biology-root-uuid', 'Plant Life Cycles', 'topic', 'NEET', 2);


