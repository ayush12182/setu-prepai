export interface StaticTopic {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weightage: 'low' | 'medium' | 'high';
}

export const STATIC_CHAPTER_TOPICS: Record<string, StaticTopic[]> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // NEET / JEE BIOLOGY
  // ═══════════════════════════════════════════════════════════════════════════

  'The Living World': [
    { name: 'Defining Life & Characteristics of Living Organisms', difficulty: 'easy', weightage: 'high' },
    { name: 'Taxonomy vs Systematics', difficulty: 'easy', weightage: 'medium' },
    { name: 'Taxonomic Hierarchy (Kingdom → Species)', difficulty: 'easy', weightage: 'high' },
    { name: 'Binomial Nomenclature Rules (ICBN / ICZN)', difficulty: 'easy', weightage: 'high' },
    { name: 'Tools of Taxonomy: Herbaria, Keys, Museums', difficulty: 'medium', weightage: 'medium' },
    { name: 'Species Concept & Global Biodiversity Numbers', difficulty: 'medium', weightage: 'medium' },
    { name: 'NEET Assertion-Reason Traps (Mules, Crystals, In Vitro)', difficulty: 'hard', weightage: 'high' },
  ],
  'Biological Classification': [
    { name: 'Two Kingdom vs Five Kingdom System', difficulty: 'easy', weightage: 'high' },
    { name: 'Kingdom Monera: Bacteria & Archaebacteria', difficulty: 'medium', weightage: 'high' },
    { name: 'Kingdom Protista: Chrysophytes, Dinoflagellates, Protozoans', difficulty: 'medium', weightage: 'high' },
    { name: 'Kingdom Fungi: Types, Reproduction & Economic Importance', difficulty: 'medium', weightage: 'high' },
    { name: 'Kingdom Plantae & Kingdom Animalia Overview', difficulty: 'easy', weightage: 'medium' },
    { name: 'Viruses, Viroids, Prions & Lichens', difficulty: 'hard', weightage: 'high' },
  ],
  'Plant Kingdom': [
    { name: 'Algae: Chlorophyta, Phaeophyta, Rhodophyta', difficulty: 'medium', weightage: 'high' },
    { name: 'Bryophytes: Liverworts & Mosses', difficulty: 'medium', weightage: 'medium' },
    { name: 'Pteridophytes: Ferns & Horsetails', difficulty: 'medium', weightage: 'medium' },
    { name: 'Gymnosperms: Cycas & Pinus', difficulty: 'medium', weightage: 'high' },
    { name: 'Angiosperms & Classification', difficulty: 'easy', weightage: 'medium' },
    { name: 'Alternation of Generations (Haplontic, Diplontic, Haplo-diplontic)', difficulty: 'hard', weightage: 'high' },
    { name: 'Plant Life Cycles & PYQ Classification Traps', difficulty: 'hard', weightage: 'high' },
  ],
  'Animal Kingdom': [
    { name: 'Basis of Classification: Symmetry, Coelom, Segmentation', difficulty: 'easy', weightage: 'high' },
    { name: 'Phylum Porifera & Coelenterata', difficulty: 'medium', weightage: 'high' },
    { name: 'Phylum Platyhelminthes & Aschelminthes (Nematoda)', difficulty: 'medium', weightage: 'high' },
    { name: 'Phylum Annelida, Arthropoda & Mollusca', difficulty: 'medium', weightage: 'high' },
    { name: 'Phylum Echinodermata & Hemichordata', difficulty: 'medium', weightage: 'medium' },
    { name: 'Phylum Chordata: Classes of Vertebrates', difficulty: 'medium', weightage: 'high' },
    { name: 'Key Distinguishing Features & PYQ Traps', difficulty: 'hard', weightage: 'high' },
  ],
  'Morphology of Flowering Plants': [
    { name: 'Root: Types, Regions & Modifications', difficulty: 'easy', weightage: 'high' },
    { name: 'Stem: Types, Modifications & Functions', difficulty: 'easy', weightage: 'high' },
    { name: 'Leaf: Parts, Venation, Phyllotaxy & Modifications', difficulty: 'easy', weightage: 'high' },
    { name: 'Inflorescence Types', difficulty: 'medium', weightage: 'medium' },
    { name: 'Flower: Parts, Symmetry & Aestivation', difficulty: 'medium', weightage: 'high' },
    { name: 'Fruit & Seed Types', difficulty: 'medium', weightage: 'medium' },
    { name: 'Floral Formulae: Fabaceae, Solanaceae, Liliaceae', difficulty: 'hard', weightage: 'high' },
  ],
  'Anatomy of Flowering Plants': [
    { name: 'Tissues: Meristematic & Permanent', difficulty: 'easy', weightage: 'high' },
    { name: 'Simple Tissues: Parenchyma, Collenchyma, Sclerenchyma', difficulty: 'medium', weightage: 'high' },
    { name: 'Complex Tissues: Xylem & Phloem', difficulty: 'medium', weightage: 'high' },
    { name: 'Anatomy of Root, Stem & Leaf (Dicot & Monocot)', difficulty: 'hard', weightage: 'high' },
    { name: 'Secondary Growth in Dicots', difficulty: 'hard', weightage: 'medium' },
  ],
  'Cell: The Unit of Life': [
    { name: 'Prokaryotic vs Eukaryotic Cell Structure', difficulty: 'easy', weightage: 'high' },
    { name: 'Endomembrane System: ER, Golgi, Lysosomes', difficulty: 'medium', weightage: 'high' },
    { name: 'Mitochondria & Chloroplast: Semi-Autonomous Organelles', difficulty: 'medium', weightage: 'high' },
    { name: 'Nucleus: Nuclear Envelope, Chromatin & Nucleolus', difficulty: 'medium', weightage: 'high' },
    { name: 'Cell Membrane: Fluid Mosaic Model & Transport', difficulty: 'medium', weightage: 'medium' },
    { name: 'Ribosomes, Centrosome, Cytoskeleton & Vacuoles', difficulty: 'medium', weightage: 'medium' },
  ],
  'Cell Cycle and Cell Division': [
    { name: 'Cell Cycle: G1, S, G2, M Phases', difficulty: 'easy', weightage: 'high' },
    { name: 'Mitosis: Stages, Events & Significance', difficulty: 'medium', weightage: 'high' },
    { name: 'Meiosis I: Prophase I Sub-stages & Crossing Over', difficulty: 'hard', weightage: 'high' },
    { name: 'Meiosis II & Significance of Meiosis', difficulty: 'medium', weightage: 'high' },
    { name: 'Cytokinesis: Plant vs Animal Cell', difficulty: 'medium', weightage: 'medium' },
    { name: 'Checkpoints, Cyclins & Cancer', difficulty: 'hard', weightage: 'medium' },
  ],
  'Transport in Plants': [
    { name: 'Diffusion, Osmosis & Water Potential', difficulty: 'medium', weightage: 'high' },
    { name: 'Plasmolysis & Imbibition', difficulty: 'easy', weightage: 'medium' },
    { name: 'Ascent of Sap: Cohesion-Tension Theory', difficulty: 'medium', weightage: 'high' },
    { name: 'Mineral Transport & Translocation in Phloem', difficulty: 'medium', weightage: 'high' },
    { name: 'Active vs Passive Transport Mechanisms', difficulty: 'easy', weightage: 'medium' },
  ],
  'Mineral Nutrition': [
    { name: 'Essential Mineral Elements & Classification', difficulty: 'easy', weightage: 'medium' },
    { name: 'Deficiency Symptoms of Key Elements', difficulty: 'medium', weightage: 'high' },
    { name: 'Nitrogen Fixation: Biological & Industrial', difficulty: 'medium', weightage: 'high' },
    { name: 'Nitrogen Cycle & Mineral Absorption Mechanisms', difficulty: 'hard', weightage: 'medium' },
  ],
  'Photosynthesis in Higher Plants': [
    { name: 'Chloroplast Structure & Photosynthetic Pigments', difficulty: 'easy', weightage: 'high' },
    { name: 'Light Reactions: Z-Scheme & Photophosphorylation', difficulty: 'hard', weightage: 'high' },
    { name: 'Dark Reactions: Calvin Cycle (C3 Pathway)', difficulty: 'medium', weightage: 'high' },
    { name: 'C4 Pathway (Hatch-Slack) & Kranz Anatomy', difficulty: 'medium', weightage: 'high' },
    { name: 'Photorespiration & CAM Plants', difficulty: 'hard', weightage: 'high' },
    { name: 'Factors Affecting Photosynthesis & Law of Limiting Factors', difficulty: 'medium', weightage: 'medium' },
  ],
  'Respiration in Plants': [
    { name: 'Glycolysis (EMP Pathway): Steps & ATP Yield', difficulty: 'medium', weightage: 'high' },
    { name: 'Krebs Cycle (TCA): Steps & Products', difficulty: 'hard', weightage: 'high' },
    { name: 'Electron Transport Chain & Oxidative Phosphorylation', difficulty: 'hard', weightage: 'high' },
    { name: 'Fermentation: Alcoholic & Lactic Acid', difficulty: 'easy', weightage: 'medium' },
    { name: 'Respiratory Quotient (RQ) & Energy Budget', difficulty: 'medium', weightage: 'high' },
  ],
  'Plant Growth and Development': [
    { name: 'Phases of Growth & Growth Rate', difficulty: 'easy', weightage: 'medium' },
    { name: 'Plant Growth Regulators: Auxins & Gibberellins', difficulty: 'medium', weightage: 'high' },
    { name: 'Cytokinins, Abscisic Acid & Ethylene', difficulty: 'medium', weightage: 'high' },
    { name: 'Photoperiodism & Vernalisation', difficulty: 'hard', weightage: 'high' },
    { name: 'Seed Dormancy & Germination', difficulty: 'medium', weightage: 'medium' },
  ],
  'Digestion and Absorption': [
    { name: 'Human Alimentary Canal: Structure & Histology', difficulty: 'easy', weightage: 'high' },
    { name: 'Digestive Enzymes: Sources, Substrates & Products', difficulty: 'medium', weightage: 'high' },
    { name: 'Absorption: Mechanisms & Sites', difficulty: 'medium', weightage: 'high' },
    { name: 'Hormonal Control of Digestion (Secretin, CCK)', difficulty: 'hard', weightage: 'high' },
    { name: 'Disorders: Jaundice, Vomiting, Constipation, PEM', difficulty: 'easy', weightage: 'medium' },
  ],
  'Breathing and Exchange of Gases': [
    { name: 'Respiratory Organs & Mechanism of Breathing', difficulty: 'easy', weightage: 'high' },
    { name: 'Respiratory Volumes & Capacities', difficulty: 'medium', weightage: 'high' },
    { name: 'Transport of Oxygen: Oxyhaemoglobin Dissociation Curve', difficulty: 'hard', weightage: 'high' },
    { name: 'CO2 Transport: Bicarbonate & Carbamino', difficulty: 'medium', weightage: 'high' },
    { name: 'Regulation of Respiration (Neural & Chemical)', difficulty: 'medium', weightage: 'medium' },
    { name: 'Respiratory Disorders: Asthma, Emphysema, Occupational', difficulty: 'easy', weightage: 'medium' },
  ],
  'Body Fluids and Circulation': [
    { name: 'Blood Composition: Plasma, RBC, WBC, Platelets', difficulty: 'easy', weightage: 'high' },
    { name: 'Blood Groups (ABO & Rh) & Coagulation', difficulty: 'medium', weightage: 'high' },
    { name: 'Cardiac Cycle, Heart Rate & Stroke Volume', difficulty: 'hard', weightage: 'high' },
    { name: 'ECG: Waves & Clinical Significance', difficulty: 'hard', weightage: 'high' },
    { name: 'Double Circulation: Systemic & Pulmonary', difficulty: 'medium', weightage: 'high' },
    { name: 'Lymphatic System & Disorders (CHD, Angina, Heart Failure)', difficulty: 'medium', weightage: 'medium' },
  ],
  'Excretory Products and their Elimination': [
    { name: 'Excretory Organs & Modes of Excretion', difficulty: 'easy', weightage: 'medium' },
    { name: 'Nephron Structure: Types & Functions', difficulty: 'medium', weightage: 'high' },
    { name: 'Urine Formation: Filtration, Reabsorption, Secretion', difficulty: 'medium', weightage: 'high' },
    { name: 'Counter-Current Mechanism & Concentration of Urine', difficulty: 'hard', weightage: 'high' },
    { name: 'Hormonal Regulation: ADH, RAAS, ANF', difficulty: 'hard', weightage: 'high' },
    { name: 'Micturition & Kidney Disorders (Renal Failure, Kidney Stones)', difficulty: 'medium', weightage: 'medium' },
  ],
  'Locomotion and Movement': [
    { name: 'Types of Movement: Amoeboid, Ciliary, Muscular', difficulty: 'easy', weightage: 'medium' },
    { name: 'Skeletal Muscle Structure: Sarcomere & Sliding Filament Theory', difficulty: 'hard', weightage: 'high' },
    { name: 'Mechanism of Muscle Contraction', difficulty: 'hard', weightage: 'high' },
    { name: 'Skeletal System: Types of Joints & Disorders', difficulty: 'medium', weightage: 'medium' },
  ],
  'Neural Control and Coordination': [
    { name: 'Neuron Structure & Types', difficulty: 'easy', weightage: 'high' },
    { name: 'Nerve Impulse: Resting & Action Potential', difficulty: 'hard', weightage: 'high' },
    { name: 'Synapse & Neurotransmitters', difficulty: 'medium', weightage: 'high' },
    { name: 'CNS: Brain Structure & Functions', difficulty: 'medium', weightage: 'high' },
    { name: 'Reflex Action & Spinal Cord', difficulty: 'medium', weightage: 'medium' },
    { name: 'Sense Organs: Eye & Ear', difficulty: 'medium', weightage: 'high' },
  ],
  'Chemical Coordination and Integration': [
    { name: 'Endocrine Glands & Their Hormones', difficulty: 'medium', weightage: 'high' },
    { name: 'Hypothalamus-Pituitary Axis (Tropic Hormones)', difficulty: 'hard', weightage: 'high' },
    { name: 'Thyroid, Parathyroid & Adrenal Hormones', difficulty: 'medium', weightage: 'high' },
    { name: 'Pancreas: Insulin & Glucagon', difficulty: 'medium', weightage: 'high' },
    { name: 'Mechanism of Hormone Action (Second Messenger)', difficulty: 'hard', weightage: 'medium' },
    { name: 'Hormonal Disorders & Common PYQ Traps', difficulty: 'hard', weightage: 'high' },
  ],
  'Reproduction in Organisms': [
    { name: 'Asexual Reproduction: Types & Significance', difficulty: 'easy', weightage: 'medium' },
    { name: 'Sexual Reproduction: Events & Phases', difficulty: 'easy', weightage: 'medium' },
    { name: 'Juvenile vs Reproductive Phase & Senescence', difficulty: 'easy', weightage: 'medium' },
  ],
  'Sexual Reproduction in Flowering Plants': [
    { name: 'Flower Structure & Development of Anther', difficulty: 'medium', weightage: 'high' },
    { name: 'Microsporogenesis & Pollen Grain Structure', difficulty: 'hard', weightage: 'high' },
    { name: 'Megasporogenesis & Female Gametophyte', difficulty: 'hard', weightage: 'high' },
    { name: 'Pollination: Types & Adaptations', difficulty: 'easy', weightage: 'high' },
    { name: 'Double Fertilisation & Triple Fusion', difficulty: 'medium', weightage: 'high' },
    { name: 'Post-Fertilisation: Endosperm, Embryo, Seed & Fruit', difficulty: 'medium', weightage: 'high' },
    { name: 'Apomixis, Polyembryony & Parthenocarpy', difficulty: 'hard', weightage: 'high' },
  ],
  'Human Reproduction': [
    { name: 'Male Reproductive System & Spermatogenesis', difficulty: 'medium', weightage: 'high' },
    { name: 'Female Reproductive System & Oogenesis', difficulty: 'medium', weightage: 'high' },
    { name: 'Menstrual Cycle: Phases & Hormonal Control', difficulty: 'hard', weightage: 'high' },
    { name: 'Fertilisation, Implantation & Placenta', difficulty: 'medium', weightage: 'high' },
    { name: 'Parturition & Lactation', difficulty: 'easy', weightage: 'medium' },
  ],
  'Reproductive Health': [
    { name: 'Contraceptive Methods: Types & Mechanisms', difficulty: 'easy', weightage: 'high' },
    { name: 'STIs: Types, Transmission & Prevention', difficulty: 'easy', weightage: 'medium' },
    { name: 'Infertility: ART (IVF, ZIFT, GIFT)', difficulty: 'medium', weightage: 'high' },
    { name: 'MTP, Amniocentesis & Population Control', difficulty: 'medium', weightage: 'medium' },
  ],
  'Principles of Inheritance and Variation': [
    { name: 'Mendel\'s Laws: Dominance, Segregation, Independent Assortment', difficulty: 'medium', weightage: 'high' },
    { name: 'Deviations: Incomplete Dominance, Codominance, Epistasis', difficulty: 'medium', weightage: 'high' },
    { name: 'Chromosomal Theory & Linkage', difficulty: 'hard', weightage: 'high' },
    { name: 'Sex Determination & Sex-Linked Inheritance', difficulty: 'medium', weightage: 'high' },
    { name: 'Mutation & Chromosomal Disorders (Down, Turner, Klinefelter)', difficulty: 'medium', weightage: 'high' },
    { name: 'Pedigree Analysis & Blood Group Inheritance', difficulty: 'hard', weightage: 'high' },
  ],
  'Molecular Basis of Inheritance': [
    { name: 'DNA Structure: Watson-Crick Model & B-DNA', difficulty: 'medium', weightage: 'high' },
    { name: 'DNA Replication: Mechanism & Enzymes', difficulty: 'hard', weightage: 'high' },
    { name: 'Transcription: in Prokaryotes & Eukaryotes', difficulty: 'hard', weightage: 'high' },
    { name: 'Translation: Ribosomes, tRNA & Codons', difficulty: 'hard', weightage: 'high' },
    { name: 'Genetic Code: Properties & Codon Table', difficulty: 'medium', weightage: 'high' },
    { name: 'Regulation of Gene Expression: lac Operon', difficulty: 'hard', weightage: 'high' },
    { name: 'Human Genome Project & DNA Fingerprinting', difficulty: 'medium', weightage: 'medium' },
  ],
  'Evolution': [
    { name: 'Origin of Life: Chemical & Biological Evolution', difficulty: 'medium', weightage: 'high' },
    { name: 'Theories of Evolution: Lamarck, Darwin, Modern Synthesis', difficulty: 'easy', weightage: 'high' },
    { name: 'Hardy-Weinberg Equilibrium & Gene Flow', difficulty: 'hard', weightage: 'high' },
    { name: 'Natural Selection: Types & Evidences', difficulty: 'medium', weightage: 'high' },
    { name: 'Speciation & Adaptive Radiation', difficulty: 'medium', weightage: 'medium' },
    { name: 'Human Evolution: Chronological & Fossil Evidence', difficulty: 'medium', weightage: 'high' },
  ],
  'Human Health and Disease': [
    { name: 'Common Diseases: Typhoid, Pneumonia, Malaria, Amoebiasis', difficulty: 'easy', weightage: 'high' },
    { name: 'Immunity: Innate & Acquired', difficulty: 'medium', weightage: 'high' },
    { name: 'Antibodies, Vaccines & Active vs Passive Immunity', difficulty: 'medium', weightage: 'high' },
    { name: 'AIDS: HIV, Transmission & Prevention', difficulty: 'easy', weightage: 'high' },
    { name: 'Cancer: Types, Causes & Treatment', difficulty: 'medium', weightage: 'medium' },
    { name: 'Drugs & Alcohol: Effects & Addiction', difficulty: 'easy', weightage: 'medium' },
  ],
  'Biotechnology: Principles and Processes': [
    { name: 'Recombinant DNA Technology: Tools & Steps', difficulty: 'hard', weightage: 'high' },
    { name: 'Restriction Enzymes, Vectors & Cloning', difficulty: 'hard', weightage: 'high' },
    { name: 'PCR: Principle & Applications', difficulty: 'medium', weightage: 'high' },
    { name: 'Gel Electrophoresis & Blotting Techniques', difficulty: 'medium', weightage: 'high' },
    { name: 'Bioreactors & Downstream Processing', difficulty: 'medium', weightage: 'medium' },
  ],
  'Biotechnology and its Applications': [
    { name: 'Bt Crops & Transgenic Plants', difficulty: 'medium', weightage: 'high' },
    { name: 'Gene Therapy & Molecular Diagnosis', difficulty: 'medium', weightage: 'high' },
    { name: 'Biopiracy, IPR & Ethical Issues', difficulty: 'easy', weightage: 'medium' },
  ],
  'Organisms and Populations': [
    { name: 'Ecology: Levels & Habitat vs Niche', difficulty: 'easy', weightage: 'medium' },
    { name: 'Adaptations: Temperature, Water, Light', difficulty: 'easy', weightage: 'medium' },
    { name: 'Population: Growth Models (J vs S Curve)', difficulty: 'medium', weightage: 'high' },
    { name: 'Population Interactions: Types & Examples', difficulty: 'medium', weightage: 'high' },
  ],
  'Ecosystem': [
    { name: 'Ecosystem Structure: Biotic & Abiotic Components', difficulty: 'easy', weightage: 'medium' },
    { name: 'Productivity, Decomposition & Detritus', difficulty: 'medium', weightage: 'high' },
    { name: 'Energy Flow & Ecological Pyramids', difficulty: 'medium', weightage: 'high' },
    { name: 'Biogeochemical Cycles: Carbon & Nitrogen', difficulty: 'hard', weightage: 'high' },
    { name: 'Ecosystem Services & Stability', difficulty: 'easy', weightage: 'medium' },
  ],
  'Biodiversity and Conservation': [
    { name: 'Levels & Patterns of Biodiversity', difficulty: 'easy', weightage: 'high' },
    { name: 'Loss of Biodiversity: Causes & Hotspots', difficulty: 'medium', weightage: 'high' },
    { name: 'In Situ & Ex Situ Conservation', difficulty: 'medium', weightage: 'high' },
    { name: 'Sacred Groves, Biosphere Reserves & Wildlife Sanctuaries', difficulty: 'easy', weightage: 'medium' },
  ],
  'Environmental Issues': [
    { name: 'Air Pollution: Causes, Effects & Control', difficulty: 'easy', weightage: 'high' },
    { name: 'Water Pollution: BOD, Eutrophication', difficulty: 'medium', weightage: 'high' },
    { name: 'Soil Pollution & Solid Waste Management', difficulty: 'easy', weightage: 'medium' },
    { name: 'Global Warming, Ozone Depletion & Greenhouse Effect', difficulty: 'medium', weightage: 'high' },
    { name: 'Radioactive Waste & Electronic Waste', difficulty: 'easy', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // JEE / NEET PHYSICS
  // ═══════════════════════════════════════════════════════════════════════════

  'Kinematics': [
    { name: 'Motion in 1D: Uniform & Non-Uniform', difficulty: 'easy', weightage: 'high' },
    { name: 'Equations of Motion & Free Fall', difficulty: 'easy', weightage: 'high' },
    { name: 'Projectile Motion: Range, Height, Time', difficulty: 'medium', weightage: 'high' },
    { name: 'Relative Motion in 1D & 2D', difficulty: 'hard', weightage: 'high' },
    { name: 'River-Boat & Rain-Man Problems', difficulty: 'hard', weightage: 'high' },
    { name: 'v-t and x-t Graph Interpretation', difficulty: 'medium', weightage: 'high' },
  ],
  'Laws of Motion': [
    { name: 'Newton\'s Three Laws & Applications', difficulty: 'easy', weightage: 'high' },
    { name: 'Free Body Diagrams & Constraint Equations', difficulty: 'hard', weightage: 'high' },
    { name: 'Friction: Static, Kinetic & Rolling', difficulty: 'medium', weightage: 'high' },
    { name: 'Circular Motion: Centripetal Force & Conical Pendulum', difficulty: 'medium', weightage: 'high' },
    { name: 'Pulleys, Wedge & Atwood Machine Problems', difficulty: 'hard', weightage: 'high' },
    { name: 'Pseudo Force in Non-Inertial Frames', difficulty: 'hard', weightage: 'medium' },
  ],
  'Work, Energy & Power': [
    { name: 'Work Done by Constant & Variable Force', difficulty: 'easy', weightage: 'high' },
    { name: 'Work-Energy Theorem', difficulty: 'medium', weightage: 'high' },
    { name: 'Conservative Forces & Potential Energy', difficulty: 'medium', weightage: 'high' },
    { name: 'Conservation of Mechanical Energy', difficulty: 'medium', weightage: 'high' },
    { name: 'Elastic & Inelastic Collisions (1D & 2D)', difficulty: 'hard', weightage: 'high' },
    { name: 'Power, Efficiency & Spring Problems', difficulty: 'medium', weightage: 'high' },
  ],
  'Work, Energy and Power': [
    { name: 'Work Done by Constant & Variable Force', difficulty: 'easy', weightage: 'high' },
    { name: 'Work-Energy Theorem', difficulty: 'medium', weightage: 'high' },
    { name: 'Conservative Forces & Potential Energy', difficulty: 'medium', weightage: 'high' },
    { name: 'Conservation of Mechanical Energy', difficulty: 'medium', weightage: 'high' },
    { name: 'Elastic & Inelastic Collisions (1D & 2D)', difficulty: 'hard', weightage: 'high' },
    { name: 'Power, Efficiency & Spring Problems', difficulty: 'medium', weightage: 'high' },
  ],
  'Rotational Motion': [
    { name: 'Torque, Angular Momentum & Newton\'s 2nd Law (Rotation)', difficulty: 'medium', weightage: 'high' },
    { name: 'Moment of Inertia: Standard Bodies & Parallel-Perpendicular Axes', difficulty: 'hard', weightage: 'high' },
    { name: 'Rolling Motion Without Slipping', difficulty: 'hard', weightage: 'high' },
    { name: 'Conservation of Angular Momentum', difficulty: 'medium', weightage: 'high' },
    { name: 'Centre of Mass & Translational-Rotational Analogy', difficulty: 'medium', weightage: 'high' },
    { name: 'Equilibrium of Rigid Body', difficulty: 'medium', weightage: 'medium' },
  ],
  'Gravitation': [
    { name: 'Universal Law of Gravitation & Gravitational Field', difficulty: 'easy', weightage: 'high' },
    { name: 'Gravitational Potential Energy & Escape Velocity', difficulty: 'medium', weightage: 'high' },
    { name: 'Orbital Velocity & Satellites', difficulty: 'medium', weightage: 'high' },
    { name: 'Kepler\'s Three Laws', difficulty: 'medium', weightage: 'high' },
    { name: 'Geostationary Orbit & Variation of g', difficulty: 'hard', weightage: 'high' },
  ],
  'SHM & Waves': [
    { name: 'Simple Harmonic Motion: Equation, Energy & Phase', difficulty: 'medium', weightage: 'high' },
    { name: 'Spring-Mass System & Simple Pendulum', difficulty: 'medium', weightage: 'high' },
    { name: 'Damped & Forced Oscillations, Resonance', difficulty: 'hard', weightage: 'medium' },
    { name: 'Wave Motion: Transverse & Longitudinal', difficulty: 'easy', weightage: 'high' },
    { name: 'Superposition, Standing Waves & Beats', difficulty: 'hard', weightage: 'high' },
    { name: 'Doppler Effect', difficulty: 'medium', weightage: 'high' },
  ],
  'Thermodynamics': [
    { name: 'Zeroth & First Law of Thermodynamics', difficulty: 'easy', weightage: 'high' },
    { name: 'Isothermal, Adiabatic, Isobaric & Isochoric Processes', difficulty: 'medium', weightage: 'high' },
    { name: 'Second Law: Heat Engines & Carnot Cycle', difficulty: 'hard', weightage: 'high' },
    { name: 'Entropy & Refrigerators', difficulty: 'hard', weightage: 'medium' },
    { name: 'Kinetic Theory of Gases: vrms, vavg, vmp', difficulty: 'medium', weightage: 'high' },
    { name: 'Degrees of Freedom & Equipartition Theorem', difficulty: 'hard', weightage: 'medium' },
  ],
  'Electrostatics': [
    { name: 'Coulomb\'s Law & Superposition Principle', difficulty: 'easy', weightage: 'high' },
    { name: 'Electric Field: Point Charge, Dipole & Continuous Distribution', difficulty: 'medium', weightage: 'high' },
    { name: 'Gauss\'s Law & Applications (Sphere, Cylinder, Plane)', difficulty: 'hard', weightage: 'high' },
    { name: 'Electric Potential & Potential Difference', difficulty: 'medium', weightage: 'high' },
    { name: 'Capacitors: Series, Parallel, Energy & Dielectrics', difficulty: 'hard', weightage: 'high' },
    { name: 'Conductors, Earthing & Van de Graaff Generator', difficulty: 'medium', weightage: 'medium' },
  ],
  'Current Electricity': [
    { name: 'Ohm\'s Law, Drift Velocity & Resistivity', difficulty: 'easy', weightage: 'high' },
    { name: 'Kirchhoff\'s Voltage & Current Laws', difficulty: 'medium', weightage: 'high' },
    { name: 'Wheatstone Bridge, Metre Bridge & Potentiometer', difficulty: 'hard', weightage: 'high' },
    { name: 'EMF, Internal Resistance & Cell Combinations', difficulty: 'medium', weightage: 'high' },
    { name: 'Heating Effect (Joule\'s Law) & Power', difficulty: 'easy', weightage: 'high' },
    { name: 'Colour Code, Temperature Coefficient & Semiconductors', difficulty: 'medium', weightage: 'medium' },
  ],
  'Magnetism & EMI': [
    { name: 'Biot-Savart Law & Ampere\'s Circuital Law', difficulty: 'hard', weightage: 'high' },
    { name: 'Force on Moving Charge & Current-Carrying Conductor', difficulty: 'medium', weightage: 'high' },
    { name: 'Moving Coil Galvanometer, Ammeter & Voltmeter', difficulty: 'medium', weightage: 'medium' },
    { name: 'Electromagnetic Induction: Faraday & Lenz\'s Law', difficulty: 'medium', weightage: 'high' },
    { name: 'Motional EMF, Eddy Currents & Self-Inductance', difficulty: 'hard', weightage: 'high' },
    { name: 'Alternating Current: LC, LCR Circuits & Resonance', difficulty: 'hard', weightage: 'high' },
    { name: 'Transformers & Power Transmission', difficulty: 'medium', weightage: 'medium' },
  ],
  'Optics': [
    { name: 'Reflection: Plane & Spherical Mirrors (Mirror Formula)', difficulty: 'easy', weightage: 'high' },
    { name: 'Refraction: Snell\'s Law, TIR & Prism', difficulty: 'medium', weightage: 'high' },
    { name: 'Lenses: Thin Lens Formula, Power & Combinations', difficulty: 'medium', weightage: 'high' },
    { name: 'Optical Instruments: Microscope, Telescope, Eye', difficulty: 'medium', weightage: 'high' },
    { name: 'Wave Optics: Interference (YDSE)', difficulty: 'hard', weightage: 'high' },
    { name: 'Diffraction, Polarisation & Brewster\'s Angle', difficulty: 'hard', weightage: 'medium' },
  ],
  'Modern Physics': [
    { name: 'Photoelectric Effect & De Broglie Hypothesis', difficulty: 'medium', weightage: 'high' },
    { name: 'Bohr\'s Model of Hydrogen Atom & Spectral Series', difficulty: 'medium', weightage: 'high' },
    { name: 'X-Rays: Production & Moseley\'s Law', difficulty: 'medium', weightage: 'medium' },
    { name: 'Nuclear Physics: Binding Energy & Mass Defect', difficulty: 'hard', weightage: 'high' },
    { name: 'Radioactivity: Decay Law, Half-Life & Carbon Dating', difficulty: 'hard', weightage: 'high' },
    { name: 'Nuclear Fission, Fusion & Reactors', difficulty: 'medium', weightage: 'medium' },
    { name: 'Semiconductors: P-N Junction, Diode & Transistor', difficulty: 'medium', weightage: 'high' },
  ],
  'Units and Measurements': [
    { name: 'SI Units & Fundamental Quantities', difficulty: 'easy', weightage: 'medium' },
    { name: 'Dimensional Analysis & Applications', difficulty: 'medium', weightage: 'high' },
    { name: 'Significant Figures & Rounding Rules', difficulty: 'easy', weightage: 'medium' },
    { name: 'Errors: Absolute, Relative, Propagation', difficulty: 'medium', weightage: 'high' },
    { name: 'Vernier Callipers & Screw Gauge Least Count', difficulty: 'medium', weightage: 'medium' },
  ],
  'Motion in a Straight Line': [
    { name: 'Speed vs Velocity, Distance vs Displacement', difficulty: 'easy', weightage: 'high' },
    { name: 'Equations of Uniformly Accelerated Motion', difficulty: 'easy', weightage: 'high' },
    { name: 'Free Fall & Vertical Motion Under Gravity', difficulty: 'medium', weightage: 'high' },
    { name: 'x-t, v-t, a-t Graphs & Area Interpretation', difficulty: 'medium', weightage: 'high' },
    { name: 'Relative Motion in 1D', difficulty: 'medium', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // JEE / NEET CHEMISTRY
  // ═══════════════════════════════════════════════════════════════════════════

  'Mole Concept & Stoichiometry': [
    { name: 'Mole Concept & Avogadro\'s Number', difficulty: 'easy', weightage: 'high' },
    { name: 'Empirical & Molecular Formulae', difficulty: 'medium', weightage: 'high' },
    { name: 'Stoichiometric Calculations & Limiting Reagent', difficulty: 'medium', weightage: 'high' },
    { name: 'Concentration Terms: Molarity, Molality, Mole Fraction', difficulty: 'medium', weightage: 'high' },
    { name: 'Percent Composition & Equivalent Concept', difficulty: 'hard', weightage: 'medium' },
  ],
  'Some Basic Concepts of Chemistry': [
    { name: 'Mole Concept & Avogadro\'s Number', difficulty: 'easy', weightage: 'high' },
    { name: 'Empirical & Molecular Formulae', difficulty: 'medium', weightage: 'high' },
    { name: 'Stoichiometry & Limiting Reagent', difficulty: 'medium', weightage: 'high' },
    { name: 'Concentration Terms: Molarity, Molality, Mole Fraction', difficulty: 'medium', weightage: 'high' },
    { name: 'Laws of Chemical Combination', difficulty: 'easy', weightage: 'medium' },
  ],
  'Atomic Structure': [
    { name: 'Bohr\'s Model & Hydrogen Spectrum', difficulty: 'easy', weightage: 'high' },
    { name: 'Quantum Numbers & Electronic Configuration', difficulty: 'medium', weightage: 'high' },
    { name: 'Dual Nature: de Broglie & Heisenberg Uncertainty', difficulty: 'hard', weightage: 'high' },
    { name: 'Photoelectric Effect & Planck\'s Quantum Theory', difficulty: 'medium', weightage: 'medium' },
    { name: 'Orbitals: Shapes, Energies & Aufbau-Hund-Pauli Rules', difficulty: 'medium', weightage: 'high' },
  ],
  'Structure of Atom': [
    { name: 'Bohr\'s Model & Hydrogen Spectrum', difficulty: 'easy', weightage: 'high' },
    { name: 'Quantum Numbers & Electronic Configuration', difficulty: 'medium', weightage: 'high' },
    { name: 'Dual Nature: de Broglie & Heisenberg Uncertainty', difficulty: 'hard', weightage: 'high' },
    { name: 'Photoelectric Effect & Planck\'s Quantum Theory', difficulty: 'medium', weightage: 'medium' },
    { name: 'Orbitals: Shapes & Energies', difficulty: 'medium', weightage: 'high' },
  ],
  'Chemical Bonding': [
    { name: 'Ionic Bond: Lattice Energy & Born-Haber Cycle', difficulty: 'hard', weightage: 'high' },
    { name: 'Covalent Bond: Lewis Structure & Octet Rule', difficulty: 'easy', weightage: 'high' },
    { name: 'VSEPR Theory & Molecular Geometry', difficulty: 'medium', weightage: 'high' },
    { name: 'Hybridization: sp, sp², sp³, sp³d, sp³d²', difficulty: 'medium', weightage: 'high' },
    { name: 'Molecular Orbital Theory (MOT): Bond Order', difficulty: 'hard', weightage: 'high' },
    { name: 'Hydrogen Bonding, Dipole Moment & Intermolecular Forces', difficulty: 'medium', weightage: 'high' },
    { name: 'Resonance, Formal Charge & Exceptions to Octet Rule', difficulty: 'hard', weightage: 'medium' },
  ],
  'Thermodynamics & Thermochemistry': [
    { name: 'System, Surroundings & State Functions', difficulty: 'easy', weightage: 'medium' },
    { name: 'First Law: Internal Energy, Enthalpy & Heat Capacity', difficulty: 'medium', weightage: 'high' },
    { name: 'Hess\'s Law & Standard Enthalpies', difficulty: 'medium', weightage: 'high' },
    { name: 'Bond Enthalpy & Lattice Energy', difficulty: 'hard', weightage: 'high' },
    { name: 'Second Law: Entropy, Gibbs Free Energy & Spontaneity', difficulty: 'hard', weightage: 'high' },
    { name: 'Third Law & Standard Entropy', difficulty: 'medium', weightage: 'medium' },
  ],
  'Chemical Equilibrium': [
    { name: 'Law of Mass Action & Equilibrium Constant (Kc, Kp)', difficulty: 'medium', weightage: 'high' },
    { name: 'Relationship Between Kc & Kp', difficulty: 'hard', weightage: 'high' },
    { name: 'Le Chatelier\'s Principle & Factors Affecting Equilibrium', difficulty: 'medium', weightage: 'high' },
    { name: 'Ionic Equilibrium: Acids, Bases & pH Calculations', difficulty: 'hard', weightage: 'high' },
    { name: 'Buffer Solutions & Henderson-Hasselbalch Equation', difficulty: 'hard', weightage: 'high' },
    { name: 'Solubility Product (Ksp) & Common Ion Effect', difficulty: 'hard', weightage: 'high' },
  ],
  'Electrochemistry': [
    { name: 'Electrolytic Conduction: Molar & Equivalent Conductance', difficulty: 'hard', weightage: 'high' },
    { name: 'Galvanic Cells, EMF & Standard Electrode Potential', difficulty: 'medium', weightage: 'high' },
    { name: 'Nernst Equation & Gibbs Energy', difficulty: 'hard', weightage: 'high' },
    { name: 'Faraday\'s Laws of Electrolysis', difficulty: 'medium', weightage: 'high' },
    { name: 'Batteries (Dry Cell, Lead Storage, Fuel Cells)', difficulty: 'medium', weightage: 'medium' },
    { name: 'Corrosion: Types & Prevention', difficulty: 'easy', weightage: 'medium' },
  ],
  'Chemical Kinetics': [
    { name: 'Rate of Reaction & Rate Law', difficulty: 'medium', weightage: 'high' },
    { name: 'Order of Reaction & Half-Life Calculations', difficulty: 'hard', weightage: 'high' },
    { name: 'Integrated Rate Equations (0, 1st, 2nd Order)', difficulty: 'hard', weightage: 'high' },
    { name: 'Arrhenius Equation & Activation Energy', difficulty: 'medium', weightage: 'high' },
    { name: 'Collision Theory & Transition State Theory', difficulty: 'hard', weightage: 'medium' },
  ],
  'GOC & Isomerism': [
    { name: 'IUPAC Nomenclature: Chains, Rings, Functional Groups', difficulty: 'medium', weightage: 'high' },
    { name: 'Structural Isomerism: Chain, Position, Functional, Tautomerism', difficulty: 'medium', weightage: 'high' },
    { name: 'Stereoisomerism: Geometric (cis-trans) & Optical (R/S)', difficulty: 'hard', weightage: 'high' },
    { name: 'Inductive Effect (±I), Resonance & Hyperconjugation', difficulty: 'hard', weightage: 'high' },
    { name: 'Electrophiles, Nucleophiles & Reaction Intermediates', difficulty: 'medium', weightage: 'high' },
  ],
  'Organic Chemistry Basics': [
    { name: 'IUPAC Nomenclature: Alkanes, Alkenes, Alkynes', difficulty: 'medium', weightage: 'high' },
    { name: 'Structural & Stereoisomerism', difficulty: 'hard', weightage: 'high' },
    { name: 'Inductive, Resonance & Hyperconjugation Effects', difficulty: 'hard', weightage: 'high' },
    { name: 'Reaction Intermediates: Carbocations, Carbanions, Radicals', difficulty: 'medium', weightage: 'high' },
    { name: 'Types of Organic Reactions: SN1, SN2, E1, E2', difficulty: 'hard', weightage: 'high' },
  ],
  'Hydrocarbons': [
    { name: 'Alkanes: Preparation, Properties & Conformations', difficulty: 'easy', weightage: 'medium' },
    { name: 'Alkenes: Preparation, Markovnikov\'s Rule & Electrophilic Addition', difficulty: 'medium', weightage: 'high' },
    { name: 'Alkynes: Preparation & Reactions', difficulty: 'medium', weightage: 'medium' },
    { name: 'Benzene: Structure, Aromaticity & EAS Reactions', difficulty: 'hard', weightage: 'high' },
    { name: 'Directive Effects & Activating/Deactivating Groups', difficulty: 'hard', weightage: 'high' },
    { name: 'Petroleum & Cracking', difficulty: 'easy', weightage: 'low' },
  ],
  'Organic Reactions & Named Reactions': [
    { name: 'Alcohols & Phenols: Properties & Reactions', difficulty: 'medium', weightage: 'high' },
    { name: 'Ethers, Aldehydes & Ketones: Nucleophilic Addition', difficulty: 'hard', weightage: 'high' },
    { name: 'Carboxylic Acids & Derivatives (Acyl Substitution)', difficulty: 'hard', weightage: 'high' },
    { name: 'Amines: Basicity, Diazonium & Coupling Reactions', difficulty: 'hard', weightage: 'high' },
    { name: 'Named Reactions: Aldol, Cannizzaro, Reimer-Tiemann, Williamson', difficulty: 'hard', weightage: 'high' },
    { name: 'Biomolecules: Carbohydrates, Proteins, Vitamins, Nucleic Acids', difficulty: 'medium', weightage: 'high' },
  ],
  'Periodic Table & Trends': [
    { name: 'Long Form Periodic Table & Classification of Elements', difficulty: 'easy', weightage: 'high' },
    { name: 'Atomic Radius, Ionic Radius & Isoelectronic Series', difficulty: 'medium', weightage: 'high' },
    { name: 'Ionisation Enthalpy & Exceptions', difficulty: 'hard', weightage: 'high' },
    { name: 'Electron Gain Enthalpy & Electronegativity', difficulty: 'medium', weightage: 'high' },
    { name: 'Oxidation States & Valency Trends', difficulty: 'medium', weightage: 'medium' },
    { name: 's, p, d, f Block Properties & Anomalies', difficulty: 'hard', weightage: 'high' },
  ],
  'Coordination Chemistry': [
    { name: 'Nomenclature of Coordination Compounds', difficulty: 'medium', weightage: 'high' },
    { name: 'Werner\'s Theory & Effective Atomic Number', difficulty: 'medium', weightage: 'medium' },
    { name: 'Isomerism: Structural & Stereo (Geometric, Optical)', difficulty: 'hard', weightage: 'high' },
    { name: 'VBT & Crystal Field Theory (CFT)', difficulty: 'hard', weightage: 'high' },
    { name: 'Stability Constants & Chelate Effect', difficulty: 'hard', weightage: 'medium' },
    { name: 'Organometallic Compounds & Applications', difficulty: 'hard', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // JEE MATHEMATICS
  // ═══════════════════════════════════════════════════════════════════════════

  'Quadratic Equations & Expressions': [
    { name: 'Nature of Roots: Discriminant Analysis', difficulty: 'easy', weightage: 'high' },
    { name: 'Sum & Product of Roots (Vieta\'s Formulas)', difficulty: 'easy', weightage: 'high' },
    { name: 'Formation of Equations with Given Roots', difficulty: 'medium', weightage: 'high' },
    { name: 'Range of Quadratic Expressions & Wavy Curve Method', difficulty: 'hard', weightage: 'high' },
    { name: 'Location of Roots: Both Roots, One Root in Interval', difficulty: 'hard', weightage: 'high' },
    { name: 'Common Roots & Maximum/Minimum Value', difficulty: 'hard', weightage: 'medium' },
  ],
  'Quadratic Equations': [
    { name: 'Nature of Roots: Discriminant Analysis', difficulty: 'easy', weightage: 'high' },
    { name: 'Sum & Product of Roots (Vieta\'s Formulas)', difficulty: 'easy', weightage: 'high' },
    { name: 'Range of Quadratic Expressions & Wavy Curve Method', difficulty: 'hard', weightage: 'high' },
    { name: 'Location of Roots & Common Roots', difficulty: 'hard', weightage: 'high' },
  ],
  'Complex Numbers': [
    { name: 'Algebra of Complex Numbers (Addition, Multiplication)', difficulty: 'easy', weightage: 'high' },
    { name: 'Modulus, Argument & Polar Form', difficulty: 'medium', weightage: 'high' },
    { name: 'De Moivre\'s Theorem & nth Roots of Unity', difficulty: 'hard', weightage: 'high' },
    { name: 'Geometry of Complex Numbers: Locus Problems', difficulty: 'hard', weightage: 'high' },
    { name: 'Complex Conjugate & Properties', difficulty: 'medium', weightage: 'medium' },
  ],
  'Complex Numbers and Quadratic Equations': [
    { name: 'Algebra of Complex Numbers & Conjugate', difficulty: 'easy', weightage: 'high' },
    { name: 'Modulus, Argument & Polar Form', difficulty: 'medium', weightage: 'high' },
    { name: 'De Moivre\'s Theorem & Roots of Unity', difficulty: 'hard', weightage: 'high' },
    { name: 'Locus in Complex Plane', difficulty: 'hard', weightage: 'high' },
    { name: 'Quadratic Equations: Nature of Roots & Vieta\'s', difficulty: 'medium', weightage: 'high' },
    { name: 'Location of Roots & Wavy Curve Method', difficulty: 'hard', weightage: 'high' },
  ],
  'Matrices & Determinants': [
    { name: 'Types of Matrices & Basic Operations', difficulty: 'easy', weightage: 'high' },
    { name: 'Determinants: Expansion & Properties', difficulty: 'medium', weightage: 'high' },
    { name: 'Adjoint & Inverse of a Matrix', difficulty: 'medium', weightage: 'high' },
    { name: 'System of Linear Equations: Cramer\'s Rule', difficulty: 'hard', weightage: 'high' },
    { name: 'Eigenvalues, Cayley-Hamilton Theorem', difficulty: 'hard', weightage: 'medium' },
  ],
  'Permutations & Combinations': [
    { name: 'Fundamental Counting Principle & Factorial', difficulty: 'easy', weightage: 'high' },
    { name: 'Permutations: nPr, Arrangements with Conditions', difficulty: 'medium', weightage: 'high' },
    { name: 'Combinations: nCr & Properties', difficulty: 'medium', weightage: 'high' },
    { name: 'Circular Permutations & Necklace Problems', difficulty: 'hard', weightage: 'high' },
    { name: 'Distribution Problems: Identical & Distinct Objects', difficulty: 'hard', weightage: 'high' },
    { name: 'Binomial Theorem: Expansion & General Term', difficulty: 'hard', weightage: 'high' },
  ],
  'Probability': [
    { name: 'Classical Definition & Sample Space', difficulty: 'easy', weightage: 'high' },
    { name: 'Addition & Multiplication Theorems', difficulty: 'medium', weightage: 'high' },
    { name: 'Conditional Probability & Bayes\' Theorem', difficulty: 'hard', weightage: 'high' },
    { name: 'Binomial Distribution & Expected Value', difficulty: 'hard', weightage: 'high' },
    { name: 'Independent Events & Repeated Trials', difficulty: 'medium', weightage: 'high' },
  ],
  'Limits, Continuity & Differentiability': [
    { name: 'Limits: Standard Forms & Algebraic Simplification', difficulty: 'medium', weightage: 'high' },
    { name: 'Trigonometric & Exponential Limits', difficulty: 'medium', weightage: 'high' },
    { name: 'L\'Hôpital\'s Rule & Indeterminate Forms', difficulty: 'hard', weightage: 'high' },
    { name: 'Continuity: Definition, Types of Discontinuity', difficulty: 'medium', weightage: 'high' },
    { name: 'Differentiability & Relation with Continuity', difficulty: 'hard', weightage: 'high' },
  ],
  'Differentiation': [
    { name: 'Standard Derivatives & Chain Rule', difficulty: 'easy', weightage: 'high' },
    { name: 'Product Rule, Quotient Rule', difficulty: 'easy', weightage: 'high' },
    { name: 'Implicit & Parametric Differentiation', difficulty: 'medium', weightage: 'high' },
    { name: 'Higher Order Derivatives & Leibniz\'s Theorem', difficulty: 'hard', weightage: 'medium' },
    { name: 'Logarithmic Differentiation', difficulty: 'medium', weightage: 'high' },
  ],
  'Application of Derivatives': [
    { name: 'Tangent & Normal to a Curve', difficulty: 'medium', weightage: 'high' },
    { name: 'Monotonicity: Increasing & Decreasing Functions', difficulty: 'medium', weightage: 'high' },
    { name: 'Maxima & Minima: Local & Global', difficulty: 'hard', weightage: 'high' },
    { name: 'Mean Value Theorems: Rolle\'s & Lagrange\'s', difficulty: 'hard', weightage: 'medium' },
    { name: 'Curve Sketching & Concavity', difficulty: 'hard', weightage: 'medium' },
    { name: 'Rate of Change & Approximation', difficulty: 'easy', weightage: 'medium' },
  ],
  'Integration': [
    { name: 'Standard Integrals & Basic Rules', difficulty: 'easy', weightage: 'high' },
    { name: 'Integration by Substitution', difficulty: 'medium', weightage: 'high' },
    { name: 'Integration by Parts (ILATE Rule)', difficulty: 'medium', weightage: 'high' },
    { name: 'Partial Fractions & Rational Functions', difficulty: 'hard', weightage: 'high' },
    { name: 'Definite Integrals: Properties & King\'s Rule', difficulty: 'hard', weightage: 'high' },
    { name: 'Area Under Curves & Between Curves', difficulty: 'hard', weightage: 'high' },
    { name: 'Differential Equations: Variable Separable & Linear', difficulty: 'hard', weightage: 'high' },
  ],
  'Coordinate Geometry': [
    { name: 'Straight Lines: Slopes, Forms & Angles Between Lines', difficulty: 'easy', weightage: 'high' },
    { name: 'Distance of a Point from a Line & Foot of Perpendicular', difficulty: 'medium', weightage: 'high' },
    { name: 'Circle: Standard & General Equations, Tangent, Normal', difficulty: 'medium', weightage: 'high' },
    { name: 'Parabola: Standard Forms, Focus, Directrix', difficulty: 'medium', weightage: 'high' },
    { name: 'Ellipse & Hyperbola: Standard Equations & Properties', difficulty: 'hard', weightage: 'high' },
    { name: 'Pair of Straight Lines & Family of Lines', difficulty: 'hard', weightage: 'medium' },
  ],
  'Vectors & 3D Geometry': [
    { name: 'Vector Algebra: Addition, Scalar & Vector Triple Product', difficulty: 'medium', weightage: 'high' },
    { name: 'Dot Product, Cross Product & Applications', difficulty: 'medium', weightage: 'high' },
    { name: '3D Coordinates: Distance, Section Formula', difficulty: 'easy', weightage: 'high' },
    { name: 'Direction Cosines & Direction Ratios', difficulty: 'medium', weightage: 'high' },
    { name: 'Lines in 3D: Vector & Cartesian Forms', difficulty: 'hard', weightage: 'high' },
    { name: 'Planes in 3D: Equation, Distance & Angle', difficulty: 'hard', weightage: 'high' },
  ],
  'Trigonometry': [
    { name: 'Trigonometric Ratios & Identities', difficulty: 'easy', weightage: 'high' },
    { name: 'Compound, Multiple & Sub-Multiple Angles', difficulty: 'medium', weightage: 'high' },
    { name: 'Trigonometric Equations: General Solution', difficulty: 'hard', weightage: 'high' },
    { name: 'Inverse Trigonometric Functions: Domain, Range & Properties', difficulty: 'hard', weightage: 'high' },
    { name: 'Properties of Triangles: Sine Rule, Cosine Rule', difficulty: 'medium', weightage: 'high' },
    { name: 'Heights & Distances (Application Problems)', difficulty: 'medium', weightage: 'medium' },
  ],
  'Sets, Relations and Functions': [
    { name: 'Sets: Union, Intersection, Complement & Venn Diagrams', difficulty: 'easy', weightage: 'medium' },
    { name: 'Relations: Domain, Range, Types (Reflexive, Symmetric, Transitive)', difficulty: 'medium', weightage: 'high' },
    { name: 'Functions: Definition, Domain, Range & Types', difficulty: 'medium', weightage: 'high' },
    { name: 'Composite & Inverse Functions', difficulty: 'hard', weightage: 'high' },
    { name: 'Even/Odd Functions, Periodic Functions & Transformations', difficulty: 'hard', weightage: 'high' },
  ],
  'Calculus': [
    { name: 'Limits: Standard Forms & L\'Hôpital\'s Rule', difficulty: 'medium', weightage: 'high' },
    { name: 'Continuity & Differentiability', difficulty: 'medium', weightage: 'high' },
    { name: 'Differentiation: Chain, Product, Quotient & Implicit', difficulty: 'medium', weightage: 'high' },
    { name: 'Applications of Derivatives: Maxima, Minima, Tangents', difficulty: 'hard', weightage: 'high' },
    { name: 'Integration: Substitution, Parts & Partial Fractions', difficulty: 'hard', weightage: 'high' },
    { name: 'Definite Integrals, Area & Differential Equations', difficulty: 'hard', weightage: 'high' },
  ],
  'Mathematical Induction': [
    { name: 'Principle of Mathematical Induction: Steps', difficulty: 'easy', weightage: 'medium' },
    { name: 'Divisibility Problems via Induction', difficulty: 'medium', weightage: 'medium' },
    { name: 'Sum Series & Inequality Proofs', difficulty: 'medium', weightage: 'medium' },
  ],
  'Sequences and Series': [
    { name: 'AP: nth Term, Sum & Properties', difficulty: 'easy', weightage: 'high' },
    { name: 'GP: nth Term, Sum, Infinite GP', difficulty: 'easy', weightage: 'high' },
    { name: 'HP & Relation Between AM, GM, HM', difficulty: 'medium', weightage: 'high' },
    { name: 'Summation of Special Series: Σn, Σn², Σn³', difficulty: 'medium', weightage: 'high' },
    { name: 'Telescoping Series & AGP', difficulty: 'hard', weightage: 'medium' },
  ],
  'Statistics': [
    { name: 'Measures of Central Tendency: Mean, Median, Mode', difficulty: 'easy', weightage: 'medium' },
    { name: 'Measures of Dispersion: Variance & Standard Deviation', difficulty: 'medium', weightage: 'high' },
    { name: 'Correlation & Regression', difficulty: 'hard', weightage: 'medium' },
    { name: 'Normal Distribution & Z-Scores', difficulty: 'hard', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — GENERAL TEST
  // ═══════════════════════════════════════════════════════════════════════════

  'Logical Reasoning': [
    { name: 'Syllogisms: Venn Diagram Method', difficulty: 'medium', weightage: 'high' },
    { name: 'Blood Relations & Family Tree', difficulty: 'easy', weightage: 'high' },
    { name: 'Coding-Decoding: Letter, Number & Symbol', difficulty: 'easy', weightage: 'high' },
    { name: 'Direction Sense & Distance Calculation', difficulty: 'medium', weightage: 'high' },
    { name: 'Seating Arrangement (Linear & Circular)', difficulty: 'hard', weightage: 'high' },
    { name: 'Analogies, Series Completion & Odd-One-Out', difficulty: 'easy', weightage: 'high' },
    { name: 'Puzzles, Ranking & Scheduling', difficulty: 'hard', weightage: 'high' },
  ],
  'Quantitative Aptitude': [
    { name: 'Number System: HCF, LCM & Divisibility', difficulty: 'easy', weightage: 'high' },
    { name: 'Percentages, Profit & Loss', difficulty: 'easy', weightage: 'high' },
    { name: 'Time & Work, Pipes & Cisterns', difficulty: 'medium', weightage: 'high' },
    { name: 'Speed, Distance & Time', difficulty: 'medium', weightage: 'high' },
    { name: 'Simple & Compound Interest', difficulty: 'easy', weightage: 'high' },
    { name: 'Ratio, Proportion & Averages', difficulty: 'easy', weightage: 'high' },
    { name: 'Mensuration: Areas & Volumes', difficulty: 'medium', weightage: 'medium' },
  ],
  'General Knowledge & Current Affairs': [
    { name: 'Indian History: Ancient, Medieval & Modern', difficulty: 'medium', weightage: 'high' },
    { name: 'Indian Polity & Constitution', difficulty: 'medium', weightage: 'high' },
    { name: 'Geography: India & World', difficulty: 'easy', weightage: 'high' },
    { name: 'Science & Technology: Inventions & Discoveries', difficulty: 'easy', weightage: 'medium' },
    { name: 'Economy: Budget, GDP, RBI & Schemes', difficulty: 'medium', weightage: 'high' },
    { name: 'Current Affairs: National & International (Last 6 Months)', difficulty: 'easy', weightage: 'high' },
    { name: 'Sports, Awards & Books-Authors', difficulty: 'easy', weightage: 'medium' },
  ],
  'Numerical Ability': [
    { name: 'Data Interpretation: Tables, Bar, Pie & Line Charts', difficulty: 'medium', weightage: 'high' },
    { name: 'Simplification & BODMAS', difficulty: 'easy', weightage: 'high' },
    { name: 'Number Patterns & Missing Number Series', difficulty: 'medium', weightage: 'high' },
    { name: 'Algebra: Linear & Quadratic Equations', difficulty: 'medium', weightage: 'medium' },
    { name: 'Square Roots, Cube Roots & Surds', difficulty: 'easy', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — ENGLISH LANGUAGE
  // ═══════════════════════════════════════════════════════════════════════════

  'Reading Comprehension': [
    { name: 'Factual & Inferential Questions Strategy', difficulty: 'medium', weightage: 'high' },
    { name: 'Identifying Main Idea & Title', difficulty: 'easy', weightage: 'high' },
    { name: 'Tone, Attitude & Author\'s Purpose', difficulty: 'medium', weightage: 'high' },
    { name: 'Vocabulary in Context', difficulty: 'medium', weightage: 'high' },
    { name: 'Passage Types: Literary, Scientific, Social', difficulty: 'easy', weightage: 'medium' },
  ],
  'Grammar & Vocabulary': [
    { name: 'Tenses: All 12 Forms & Usage', difficulty: 'medium', weightage: 'high' },
    { name: 'Articles (a/an/the), Prepositions & Conjunctions', difficulty: 'easy', weightage: 'high' },
    { name: 'Subject-Verb Agreement & Voice (Active/Passive)', difficulty: 'medium', weightage: 'high' },
    { name: 'Reported Speech & Narration', difficulty: 'medium', weightage: 'high' },
    { name: 'Synonyms, Antonyms & Confusing Words', difficulty: 'easy', weightage: 'high' },
    { name: 'Idioms, Phrases & One-Word Substitution', difficulty: 'hard', weightage: 'high' },
    { name: 'Error Detection & Sentence Correction', difficulty: 'medium', weightage: 'high' },
  ],
  'Verbal Ability': [
    { name: 'Para Jumbles: Sentence Rearrangement', difficulty: 'hard', weightage: 'high' },
    { name: 'Fill in the Blanks: Single & Double', difficulty: 'easy', weightage: 'high' },
    { name: 'Sentence Completion & Cloze Test', difficulty: 'medium', weightage: 'high' },
    { name: 'Word Analogy & Odd-One-Out', difficulty: 'medium', weightage: 'medium' },
    { name: 'Inference & Assumption-Based Questions', difficulty: 'hard', weightage: 'high' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: ECONOMICS
  // ═══════════════════════════════════════════════════════════════════════════

  'Microeconomics': [
    { name: 'Demand, Supply & Market Equilibrium', difficulty: 'easy', weightage: 'high' },
    { name: 'Elasticity of Demand & Supply', difficulty: 'medium', weightage: 'high' },
    { name: 'Consumer Theory: Indifference Curves & Budget Line', difficulty: 'hard', weightage: 'high' },
    { name: 'Production Function & Laws of Returns', difficulty: 'medium', weightage: 'high' },
    { name: 'Market Structures: Perfect, Monopoly, Oligopoly', difficulty: 'hard', weightage: 'high' },
    { name: 'Revenue, Costs & Profit Maximisation', difficulty: 'medium', weightage: 'high' },
  ],
  'Macroeconomics': [
    { name: 'National Income: GDP, GNP, NNP & Methods', difficulty: 'medium', weightage: 'high' },
    { name: 'Money: Functions, Demand & Supply', difficulty: 'easy', weightage: 'high' },
    { name: 'Banking System: RBI, Credit Creation', difficulty: 'medium', weightage: 'high' },
    { name: 'Fiscal Policy: Budget, Deficit & Public Debt', difficulty: 'medium', weightage: 'high' },
    { name: 'Balance of Payments & Exchange Rate', difficulty: 'hard', weightage: 'high' },
    { name: 'Inflation: Types, Causes & Measures', difficulty: 'medium', weightage: 'high' },
  ],
  'Indian Economic Development': [
    { name: 'Indian Economy at Independence: Features & Challenges', difficulty: 'easy', weightage: 'high' },
    { name: 'Five Year Plans & NITI Aayog', difficulty: 'medium', weightage: 'high' },
    { name: 'Agriculture: Green Revolution & Land Reforms', difficulty: 'medium', weightage: 'high' },
    { name: 'Liberalisation, Privatisation & Globalisation (1991)', difficulty: 'medium', weightage: 'high' },
    { name: 'Poverty, Employment & Human Capital Formation', difficulty: 'medium', weightage: 'high' },
    { name: 'Environment, Sustainable Development & Rural Development', difficulty: 'easy', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: HISTORY
  // ═══════════════════════════════════════════════════════════════════════════

  'Ancient & Medieval India': [
    { name: 'Harappan Civilisation: Features & Decline', difficulty: 'easy', weightage: 'high' },
    { name: 'Vedic Period, Buddhism & Jainism', difficulty: 'easy', weightage: 'high' },
    { name: 'Mauryan Empire: Ashoka & His Dhamma', difficulty: 'medium', weightage: 'high' },
    { name: 'Gupta Age: Art, Science & Administration', difficulty: 'medium', weightage: 'high' },
    { name: 'Delhi Sultanate: Rulers & Administration', difficulty: 'medium', weightage: 'high' },
    { name: 'Mughal Empire: Akbar to Aurangzeb', difficulty: 'medium', weightage: 'high' },
    { name: 'Bhakti & Sufi Movements', difficulty: 'easy', weightage: 'medium' },
  ],
  'Modern India & World History': [
    { name: 'Rise of British Power & Revenue Systems', difficulty: 'medium', weightage: 'high' },
    { name: 'Revolts: 1857 & Its Impact', difficulty: 'medium', weightage: 'high' },
    { name: 'Indian National Congress & Freedom Movement Phases', difficulty: 'medium', weightage: 'high' },
    { name: 'Gandhi & Mass Movements (Non-Cooperation, CDM, Quit India)', difficulty: 'medium', weightage: 'high' },
    { name: 'Partition & Independence (1947)', difficulty: 'easy', weightage: 'high' },
    { name: 'World History: French Revolution, WW I & WW II', difficulty: 'medium', weightage: 'medium' },
    { name: 'Cold War & Decolonisation', difficulty: 'medium', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: POLITICAL SCIENCE
  // ═══════════════════════════════════════════════════════════════════════════

  'Indian Constitution & Political Process': [
    { name: 'Framing of Constitution: Constituent Assembly & Preamble', difficulty: 'easy', weightage: 'high' },
    { name: 'Fundamental Rights & Duties', difficulty: 'medium', weightage: 'high' },
    { name: 'Directive Principles of State Policy', difficulty: 'medium', weightage: 'high' },
    { name: 'Parliament: Structure, Powers & Functions', difficulty: 'medium', weightage: 'high' },
    { name: 'President, PM, Council of Ministers & Cabinet', difficulty: 'medium', weightage: 'high' },
    { name: 'Judiciary: Supreme Court, Judicial Review & PILs', difficulty: 'hard', weightage: 'high' },
    { name: 'Federalism, Panchayati Raj & Local Governance', difficulty: 'medium', weightage: 'medium' },
  ],
  'Contemporary World Politics': [
    { name: 'Bipolar World: Cold War Origins & End', difficulty: 'medium', weightage: 'high' },
    { name: 'US Hegemony & New World Order Post-1991', difficulty: 'medium', weightage: 'high' },
    { name: 'Rise of China, EU & Regional Organisations', difficulty: 'medium', weightage: 'high' },
    { name: 'India\'s Foreign Policy & Non-Alignment', difficulty: 'medium', weightage: 'high' },
    { name: 'Environment & Global Commons (Climate Change, UNFCCC)', difficulty: 'easy', weightage: 'medium' },
    { name: 'Terrorism, Human Rights & Globalisation', difficulty: 'easy', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: GEOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════════

  'Physical & Human Geography': [
    { name: 'Interior of the Earth, Earthquakes & Volcanoes', difficulty: 'easy', weightage: 'high' },
    { name: 'Landforms: Fluvial, Aeolian, Glacial Processes', difficulty: 'medium', weightage: 'high' },
    { name: 'Climate: Factors, Types & Koppen Classification', difficulty: 'medium', weightage: 'high' },
    { name: 'Oceans: Currents, Tides & Marine Resources', difficulty: 'medium', weightage: 'medium' },
    { name: 'Population: Distribution, Growth & Density', difficulty: 'easy', weightage: 'high' },
    { name: 'Human Development Index & World Urbanisation', difficulty: 'easy', weightage: 'medium' },
  ],
  'India: Resources & Planning': [
    { name: 'Land Resources & Land Use Classification', difficulty: 'easy', weightage: 'medium' },
    { name: 'Water Resources: Rivers, Irrigation & Conservation', difficulty: 'medium', weightage: 'high' },
    { name: 'Mineral & Energy Resources: Types & Distribution', difficulty: 'medium', weightage: 'high' },
    { name: 'Forest Resources & Biodiversity Hotspots', difficulty: 'easy', weightage: 'medium' },
    { name: 'Agriculture: Cropping Patterns & Food Security', difficulty: 'medium', weightage: 'high' },
    { name: 'Industries: Location, Distribution & SEZs', difficulty: 'medium', weightage: 'high' },
    { name: 'Transport & Communication Networks in India', difficulty: 'easy', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: BUSINESS STUDIES
  // ═══════════════════════════════════════════════════════════════════════════

  'Principles of Management': [
    { name: 'Nature & Importance of Management', difficulty: 'easy', weightage: 'high' },
    { name: 'Principles of Management: Taylor & Fayol', difficulty: 'medium', weightage: 'high' },
    { name: 'Planning: Types, Steps & Importance', difficulty: 'easy', weightage: 'high' },
    { name: 'Organising: Delegation, Decentralisation', difficulty: 'medium', weightage: 'high' },
    { name: 'Staffing, Directing & Controlling', difficulty: 'medium', weightage: 'high' },
    { name: 'Leadership, Motivation Theories (Maslow, Herzberg)', difficulty: 'hard', weightage: 'high' },
  ],
  'Business Finance & Marketing': [
    { name: 'Financial Markets: Money Market & Capital Market', difficulty: 'medium', weightage: 'high' },
    { name: 'Stock Exchange: BSE, NSE & SEBI', difficulty: 'medium', weightage: 'high' },
    { name: 'Marketing: Concepts, Mix (4P\'s) & STP', difficulty: 'easy', weightage: 'high' },
    { name: 'Consumer Protection Act & Rights', difficulty: 'easy', weightage: 'medium' },
    { name: 'Entrepreneurship & Forms of Business Organisation', difficulty: 'easy', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: ACCOUNTANCY
  // ═══════════════════════════════════════════════════════════════════════════

  'Partnership Accounts': [
    { name: 'Partnership Deed & Fixed/Fluctuating Capital', difficulty: 'easy', weightage: 'high' },
    { name: 'Profit & Loss Appropriation Account', difficulty: 'medium', weightage: 'high' },
    { name: 'Admission of a Partner: Goodwill & Revaluation', difficulty: 'hard', weightage: 'high' },
    { name: 'Retirement & Death of a Partner', difficulty: 'hard', weightage: 'high' },
    { name: 'Dissolution of Partnership Firm', difficulty: 'hard', weightage: 'high' },
  ],
  'Company Accounts': [
    { name: 'Issue of Shares: At Par, Premium & Discount', difficulty: 'medium', weightage: 'high' },
    { name: 'Calls-in-Arrears, Forfeiture & Reissue', difficulty: 'hard', weightage: 'high' },
    { name: 'Issue & Redemption of Debentures', difficulty: 'hard', weightage: 'high' },
    { name: 'Financial Statements: Balance Sheet & P&L', difficulty: 'medium', weightage: 'high' },
    { name: 'Cash Flow Statement: Operating, Investing, Financing', difficulty: 'hard', weightage: 'high' },
    { name: 'Ratio Analysis: Liquidity, Profitability & Solvency', difficulty: 'medium', weightage: 'high' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: PSYCHOLOGY
  // ═══════════════════════════════════════════════════════════════════════════

  'Foundations of Psychology': [
    { name: 'What is Psychology? Methods & Perspectives', difficulty: 'easy', weightage: 'high' },
    { name: 'Biological Basis: Brain, Nervous System & Behaviour', difficulty: 'medium', weightage: 'high' },
    { name: 'Sensation, Perception & Attention', difficulty: 'medium', weightage: 'high' },
    { name: 'Learning: Classical, Operant & Observational', difficulty: 'medium', weightage: 'high' },
    { name: 'Memory: Types, Models & Forgetting', difficulty: 'medium', weightage: 'high' },
    { name: 'Thinking, Problem Solving & Creativity', difficulty: 'medium', weightage: 'medium' },
  ],
  'Applied Psychology': [
    { name: 'Intelligence: Theories & Measurement (IQ, EQ)', difficulty: 'medium', weightage: 'high' },
    { name: 'Personality: Trait, Type & Psychodynamic Theories', difficulty: 'medium', weightage: 'high' },
    { name: 'Motivation & Emotion: Theories & Types', difficulty: 'easy', weightage: 'high' },
    { name: 'Psychological Disorders: Types & Symptoms', difficulty: 'medium', weightage: 'high' },
    { name: 'Therapeutic Approaches & Counselling', difficulty: 'medium', weightage: 'medium' },
    { name: 'Stress, Coping & Well-Being', difficulty: 'easy', weightage: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CUET — DOMAIN: SOCIOLOGY
  // ═══════════════════════════════════════════════════════════════════════════

  'Indian Society & Social Change': [
    { name: 'Indian Society: Unity in Diversity', difficulty: 'easy', weightage: 'high' },
    { name: 'Social Institutions: Family, Marriage & Kinship', difficulty: 'easy', weightage: 'high' },
    { name: 'Caste System: Features, Changes & Scheduled Castes', difficulty: 'medium', weightage: 'high' },
    { name: 'Tribal Communities: Issues & Policies', difficulty: 'medium', weightage: 'medium' },
    { name: 'Social Change: Modernisation, Westernisation', difficulty: 'medium', weightage: 'high' },
    { name: 'Social Movements: Women\'s Movement & Environmental Movement', difficulty: 'medium', weightage: 'medium' },
    { name: 'Globalisation & Its Social Impact on India', difficulty: 'easy', weightage: 'medium' },
  ],

};
