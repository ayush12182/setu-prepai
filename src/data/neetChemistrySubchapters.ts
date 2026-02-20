import { Subchapter } from './subchapters';

export const neetChem1Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-1-1',
        chapterId: 'neet-chem-1',
        name: 'VSEPR Theory & Molecular Geometry',
        jeeAsks: ['Predict shape of molecules (BF3, SF6, XeF4)', 'Lone pair vs bond pair repulsion', 'Bond angles with lone pairs', 'Exceptions to VSEPR'],
        pyqFocus: { trends: ['Shape prediction directly asked', 'Bond angle comparisons'], patterns: ['Give formula, ask shape and angle'], traps: ['Lone pair reduces bond angle', 'VSEPR counts lone pairs on central atom only'] },
        commonMistakes: ['Forgetting lone pairs on central atom', 'CH4 vs NH3 angle difference reason', 'SF6 is octahedral not hexagonal'],
        jeetuLine: 'VSEPR = lone pairs push harder. Count them on central atom, predict shape.'
    },
    {
        id: 'neet-chem-1-2',
        chapterId: 'neet-chem-1',
        name: 'Hybridization',
        jeeAsks: ['sp, sp2, sp3, sp3d, sp3d2 hybridization', 'Hybridization of specific molecules (PCl5, SF6)', 'Relation to geometry', 'pi and sigma bonds'],
        pyqFocus: { trends: ['Match molecule with hybridization', 'Bond angle from hybridization'], patterns: ['Identify hybridization, then state shape'], traps: ['BeCl2 is sp linear, not sp2', 'C in CO2 is sp'] },
        commonMistakes: ['Counting pi bonds wrong', 'sp3d confusion with sp3', 'Hybridization number = sigma bonds + lone pairs'],
        jeetuLine: 'Formula: Hybridization = sigma bonds + lone pairs on central atom. Trust this always.'
    },
    {
        id: 'neet-chem-1-3',
        chapterId: 'neet-chem-1',
        name: 'Molecular Orbital Theory (MOT)',
        jeeAsks: ['Bond order calculation', 'Magnetic nature (paramagnetic/diamagnetic)', 'MOT diagrams for O2, N2, F2', 'Stability from bond order'],
        pyqFocus: { trends: ['Bond order = (Nb-Na)/2', 'O2 is paramagnetic — very repeated'], patterns: ['Fill MO diagram, calculate bond order, state magnetic nature'], traps: ['O2 has 2 unpaired electrons so it\'s paramagnetic', 'Higher bond order = more stable'] },
        commonMistakes: ['Filling antibonding orbitals wrong', 'N2 bond order = 3 not 2.5', 'Forgetting sigma* comes before pi* for period 2'],
        jeetuLine: 'O2 paramagnetic is NEET favourite. Fill like Aufbau, then count unpaired.'
    },
    {
        id: 'neet-chem-1-4',
        chapterId: 'neet-chem-1',
        name: 'Ionic & Covalent Bonds',
        jeeAsks: ['Electronegativity difference and bond type', 'Lattice energy factors', 'Fajan\'s rules', 'Properties of ionic compounds'],
        pyqFocus: { trends: ['Fajan\'s rules directly asked', 'Lattice energy order'], patterns: ['Identify bond type from electronegativity', 'Predict covalent character of ionic bonds'], traps: ['High charge density = high covalent character', 'Smaller cation = higher covalent character (Fajan)'] },
        commonMistakes: ['Fajan\'s rules conditions (high cation charge, high anion size)', 'Lattice energy bigger for higher charge smaller size', 'NaCl is ionic but has partial covalent character'],
        jeetuLine: 'Fajan\'s rules: small cation + large anion = more covalent. Simple logic.'
    },
    {
        id: 'neet-chem-1-5',
        chapterId: 'neet-chem-1',
        name: 'Hydrogen Bonding & Intermolecular Forces',
        jeeAsks: ['Which molecules form H-bonds?', 'Inter vs intramolecular H-bonding', 'Effect on boiling/melting point', 'Dipole-dipole vs London forces'],
        pyqFocus: { trends: ['Why water has high BP', 'o-nitrophenol vs p-nitrophenol BP'], patterns: ['Compare BP or solubility using intermolecular forces'], traps: ['Intramolecular H-bond reduces BP (o-nitrophenol)', 'H-bond: N, O, F only as donors'] },
        commonMistakes: ['H-bond only with N, O, F', 'Intramolecular = within molecule = lower BP', 'London forces in non-polar molecules too'],
        jeetuLine: 'H-bond between N/O/F only. Intramolecular H-bond means lower BP — tricky trap.'
    },
];

export const neetChem2Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-2-1',
        chapterId: 'neet-chem-2',
        name: 'General Organic Chemistry (GOC)',
        jeeAsks: ['Inductive, mesomeric, hyperconjugation effects', 'Stability of carbocations, carbanions, radicals', 'Electron withdrawal vs donation', 'IUPAC nomenclature'],
        pyqFocus: { trends: ['Stability order of carbocations', 'Effect of substituents on acidity/basicity'], patterns: ['Rank stability of intermediates', 'Identify effect type'], traps: ['3° carbocation most stable', 'NO2 is EWG, OH is EDG'] },
        commonMistakes: ['Hyperconjugation: more H = more stable for carbocation', 'Mesomeric effect operates through pi system', 'Resonance structures have same sigma framework'],
        jeetuLine: 'Stability of carbocation: 3° > 2° > 1° > methyl. Hyperconjugation makes 3° extra stable.'
    },
    {
        id: 'neet-chem-2-2',
        chapterId: 'neet-chem-2',
        name: 'Isomerism',
        jeeAsks: ['Structural isomers types', 'Geometric (cis-trans) isomerism conditions', 'Optical isomerism and chirality', 'Enantiomers vs diastereomers'],
        pyqFocus: { trends: ['Count isomers of a molecular formula', 'Identify chiral centers'], patterns: ['Draw all isomers for C4H10', 'Find chiral carbon in molecule'], traps: ['Geometric isomerism needs 2 different groups on each C', 'meso compound has chiral center but no optical activity'] },
        commonMistakes: ['Cis-trans needs restricted rotation', 'R/S at chiral center (priority rules)', 'meso compound: plane of symmetry makes it optically inactive'],
        jeetuLine: 'Chiral center = 4 different groups on C. meso = chiral centers cancel out.'
    },
    {
        id: 'neet-chem-2-3',
        chapterId: 'neet-chem-2',
        name: 'Hydrocarbons',
        jeeAsks: ['Alkane, alkene, alkyne properties', 'Reactions: addition, substitution, elimination', 'Markovnikov\'s rule', 'Ozonolysis products'],
        pyqFocus: { trends: ['Markovnikov addition products', 'Ozonolysis to find structure'], patterns: ['Give reaction, identify the product'], traps: ['Anti-Markovnikov: HBr with peroxide only', 'Ozonolysis of cyclic alkene gives one product'] },
        commonMistakes: ['Markovnikov: H adds to carbon with more H', 'Benzene undergoes substitution not addition', 'Cycloalkane ozonolysis gives dialdehyde/diketone'],
        jeetuLine: 'Markovnikov: H goes to carbon that already has more H. Peroxide reverses for HBr only.'
    },
    {
        id: 'neet-chem-2-4',
        chapterId: 'neet-chem-2',
        name: 'Named Reactions',
        jeeAsks: ['Aldol condensation', 'Cannizzaro reaction', 'Reimer-Tiemann reaction', 'Kolbe\'s reaction', 'Sandmeyer reaction'],
        pyqFocus: { trends: ['Match reaction name with product', 'Conditions for specific reactions'], patterns: ['Identify named reaction from reagent+product combo'], traps: ['Cannizzaro: aldehydes without alpha-H only', 'Aldol needs alpha-H'] },
        commonMistakes: ['Cross Cannizzaro uses HCHO as reducing agent', 'Reimer-Tiemann makes salicylaldehyde', 'Sandmeyer: diazonium salt + CuCl/CuBr'],
        jeetuLine: 'Named reactions table: reactant, reagent, product. Make flashcards. Direct marks.'
    },
];

export const neetChem3Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-3-1',
        chapterId: 'neet-chem-3',
        name: 'Thermodynamics (Laws & Functions)',
        jeeAsks: ['First law: dU = dQ - dW', 'Enthalpy H = U + PV', 'Hess\'s law calculations', 'Heat of combustion, formation, neutralization'],
        pyqFocus: { trends: ['Hess\'s law calculations directly asked', 'State function identification'], patterns: ['Calculate delta H using Hess\'s law', 'Is the process exo/endo?'], traps: ['Work done by gas = +PdV', 'Internal energy is state function; heat/work are not'] },
        commonMistakes: ['W = PextdeltaV for irreversible', 'Enthalpy of atomization is always positive', 'Bond dissociation energy always positive'],
        jeetuLine: 'Hess\'s law = adjust equations like algebra. Enthalpy is path-independent.'
    },
    {
        id: 'neet-chem-3-2',
        chapterId: 'neet-chem-3',
        name: 'Entropy, Gibbs Energy & Spontaneity',
        jeeAsks: ['ΔG = ΔH - TΔS', 'Spontaneity conditions from ΔG', 'Entropy changes in reactions', 'Standard free energy and Keq'],
        pyqFocus: { trends: ['Predict spontaneity from ΔH and ΔS signs', 'ΔG = -RT lnK relationship'], patterns: ['Given ΔH and ΔS, find temperature range for spontaneity'], traps: ['-ΔG = spontaneous', 'ΔG=0 means equilibrium, not no reaction'] },
        commonMistakes: ['4 combinations of signs of ΔH and ΔS', 'When ΔG = 0, reaction is at equilibrium', 'ΔG° = -RT lnK (standard conditions)'],
        jeetuLine: 'ΔG negative = spontaneous. Remember all 4 sign combinations of ΔH and ΔS.'
    },
    {
        id: 'neet-chem-3-3',
        chapterId: 'neet-chem-3',
        name: 'Chemical Equilibrium',
        jeeAsks: ['Kc, Kp expressions and relation', 'Le Chatelier\'s principle applications', 'Degree of dissociation', 'Factors affecting equilibrium'],
        pyqFocus: { trends: ['Effect of pressure, temperature on equilibrium', 'Kc expression writing'], patterns: ['Apply Le Chatelier to predict shift'], traps: ['Catalyst doesn\'t shift equilibrium, only speeds it up', 'Kp = Kc(RT)^Δn'] },
        commonMistakes: ['Adding inert gas at constant V: no shift', 'Adding inert gas at constant P: shifts backward (more moles side)', 'Solid/liquid not in K expression'],
        jeetuLine: 'Le Chatelier: stress → system shifts to relieve it. Catalyst only speeds reaching Keq.'
    },
];

export const neetChem4Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-4-1',
        chapterId: 'neet-chem-4',
        name: 'IUPAC Nomenclature of Complexes',
        jeeAsks: ['Naming coordination compounds', 'Oxidation state of central metal', 'Naming ligands (ambidentate, bridging)', 'Anionic vs cationic complexes'],
        pyqFocus: { trends: ['Name given, find formula or vice versa', 'Oxidation state calculation'], patterns: ['Work out name step by step: ligands alphabetically, then metal, then charge'], traps: ['Ligands named before metal', 'Anionic complex: metal gets -ate suffix'] },
        commonMistakes: ['NH3 = ammine (double m)', 'H2O = aqua, CO = carbonyl, CN = cyano', 'Name ligands alphabetically ignoring di/tri prefixes'],
        jeetuLine: 'IUPAC name: ligands first (alphabetically), then metal with oxidation state. Practice 10 names.'
    },
    {
        id: 'neet-chem-4-2',
        chapterId: 'neet-chem-4',
        name: 'Isomerism in Coordination Compounds',
        jeeAsks: ['Geometric (cis/trans) isomerism in square planar', 'Optical isomerism in octahedral', 'Ionization isomerism', 'Linkage isomerism (ambidentate ligands)'],
        pyqFocus: { trends: ['Ma2b2 square planar cis/trans', 'Identify type of isomerism'], patterns: ['Match compound with its isomer type'], traps: ['cis-[Pt(NH3)2Cl2] = cisplatin, anticancer', 'NO2 = nitro (through N) or nitrito (through O)'] },
        commonMistakes: ['Tetrahedral Ma2b2 has no geometric isomers', 'Square planar Ma2b2 has geometric isomers', 'Cisplatin vs transplatin activity'],
        jeetuLine: 'Square planar shows geometric isomerism. Tetrahedral does not. Cisplatin is cis-form.'
    },
    {
        id: 'neet-chem-4-3',
        chapterId: 'neet-chem-4',
        name: 'Crystal Field Theory (CFT)',
        jeeAsks: ['d-orbital splitting in octahedral vs tetrahedral', 'Strong vs weak field ligands', 'High spin vs low spin', 'Magnetic moment from unpaired electrons'],
        pyqFocus: { trends: ['Number of unpaired electrons in complex', 'Color from d-d transitions'], patterns: ['Fill d-orbitals using spectrochemical series'], traps: ['Tetrahedral splitting = 4/9 of octahedral', 'CN- is strong field (low spin), Cl- weak field'] },
        commonMistakes: ['Spectrochemical series: I < Br < Cl < F < OH < H2O < NH3 < en < CN < CO', 'More unpaired = paramagnetic', 'Color = complement of absorbed color'],
        jeetuLine: 'CFSE calculation: count unpaired electrons then calculate. Spectrochemical series = must memorize.'
    },
];

export const neetChem5Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-5-1',
        chapterId: 'neet-chem-5',
        name: 'Carbohydrates',
        jeeAsks: ['Classification: mono/di/polysaccharides', 'Glucose structure & reactions', 'Reducing vs non-reducing sugars', 'Starch vs glycogen vs cellulose'],
        pyqFocus: { trends: ['Reducing sugar identification', 'Structure of glucose opens ring'], patterns: ['Is X a reducing sugar? Why?'], traps: ['Sucrose is non-reducing (no free aldehyde/ketone)', 'Fructose is a ketose but reducing sugar'] },
        commonMistakes: ['Alpha and beta glucose differ at C1', 'Cellulose: beta-1,4 linkage (non-digestible)', 'Starch = amylose + amylopectin'],
        jeetuLine: 'Sucrose non-reducing, glucose+fructose reducing. Alpha/beta differ at anomeric C1.'
    },
    {
        id: 'neet-chem-5-2',
        chapterId: 'neet-chem-5',
        name: 'Amino Acids & Proteins',
        jeeAsks: ['Essential amino acids', 'Peptide bond formation', 'Primary/secondary/tertiary structure', 'Denaturation causes'],
        pyqFocus: { trends: ['Zwitterion form of amino acid', 'Number of peptide bonds in polypeptide'], patterns: ['Structure → name amino acid type'], traps: ['n amino acids → (n-1) peptide bonds', 'Denaturation doesn\'t break primary structure'] },
        commonMistakes: ['Zwitterion: both -NH3+ and -COO-', 'Glycine is only non-chiral amino acid', 'Secondary structure: alpha helix (H-bonds within chain), beta sheet (H-bonds between chains)'],
        jeetuLine: 'Peptide bond count = (n-1). Zwitterion has + and - in same molecule.'
    },
    {
        id: 'neet-chem-5-3',
        chapterId: 'neet-chem-5',
        name: 'Nucleic Acids, Vitamins & Polymers',
        jeeAsks: ['DNA vs RNA differences', 'Base pairing rules (A-T, G-C)', 'Water-soluble vs fat-soluble vitamins', 'Addition vs condensation polymers'],
        pyqFocus: { trends: ['Which vitamin for which deficiency', 'Polymer type identification'], patterns: ['Match vitamin with deficiency disease', 'Identify polymer: addition or condensation'], traps: ['RNA has uracil, DNA has thymine', 'Nylon is condensation, polythene is addition'] },
        commonMistakes: ['Vitamin B and C are water-soluble', 'Vitamin A, D, E, K are fat-soluble (ADEK)', 'Purine: A, G; Pyrimidine: C, T, U'],
        jeetuLine: 'ADEK fat-soluble. A-T (2 H-bonds), G-C (3 H-bonds). RNA has U instead of T.'
    },
];

export const neetChem6Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-6-1',
        chapterId: 'neet-chem-6',
        name: 'Electrochemical Cells',
        jeeAsks: ['Galvanic vs electrolytic cells', 'EMF calculation', 'Standard electrode potential', 'Daniel cell working'],
        pyqFocus: { trends: ['Calculate EMF from standard potentials', 'Identify anode and cathode'], patterns: ['Given half-reactions, find cell EMF and which is anode'], traps: ['Cathode: reduction (positive in galvanic)', 'Anode: oxidation (negative)'] },
        commonMistakes: ['EMF = cathode - anode (reduction potentials)', 'Salt bridge maintains electrical neutrality', 'Higher SRP = acts as cathode'],
        jeetuLine: 'EMF = Ecathode - Eanode. Higher SRP = cathode. Easy if you remember this.'
    },
    {
        id: 'neet-chem-6-2',
        chapterId: 'neet-chem-6',
        name: 'Nernst Equation & Conductance',
        jeeAsks: ['Nernst equation application', 'Molar conductivity trends', 'Kohlrausch\'s law', 'Conductance vs concentration'],
        pyqFocus: { trends: ['Nernst equation numericals', 'Molar conductivity at infinite dilution'], patterns: ['Calculate EMF at non-standard conditions using Nernst'], traps: ['Molar conductivity increases on dilution', 'Specific conductance decreases on dilution'] },
        commonMistakes: ['E = E° - (0.0591/n)logQ at 298K', 'Conductance = 1/Resistance', 'Lambda_m increases with dilution for both strong and weak electrolytes'],
        jeetuLine: 'Nernst: E = E° - 0.0591/n × logQ. Simple formula, must know when to use Q.'
    },
    {
        id: 'neet-chem-6-3',
        chapterId: 'neet-chem-6',
        name: 'Chemical Kinetics',
        jeeAsks: ['Order vs molecularity', 'Integrated rate equations', 'Half-life calculations', 'Arrhenius equation and activation energy'],
        pyqFocus: { trends: ['Calculate half-life from rate constant', 'Effect of temperature on rate'], patterns: ['Determine order from given data', 'Find Ea using Arrhenius equation'], traps: ['Order determined experimentally, molecularity from mechanism', 'Zero order: rate = k (constant)'] },
        commonMistakes: ['t1/2 = 0.693/k for first order only', 'Zero order: t1/2 = [A]0/2k', 'Rate constant k increases with temperature always'],
        jeetuLine: 'First order t1/2 = 0.693/k. Arrhenius: higher Ea = more temp sensitive.'
    },
];

export const neetChem7Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-7-1',
        chapterId: 'neet-chem-7',
        name: 'p-Block Elements (Group 15 & 16)',
        jeeAsks: ['Properties of N, P, As, Sb, Bi', 'Allotropes of phosphorus', 'Structures of oxoacids of P', 'Allotropes of sulphur, properties of H2SO4'],
        pyqFocus: { trends: ['Basicity of oxoacids', 'Match allotrope with property'], patterns: ['Compare properties across group'], traps: ['N2 extremely stable due to triple bond', 'H3PO3 is diprotic (one P-H bond)'] },
        commonMistakes: ['Phosphorus: white most reactive, red less, black least', 'H3PO3 diprotic not triprotic', 'Basicity decreases down group: NH3 > PH3'],
        jeetuLine: 'P-block: learn basicity trend and oxoacid structures from NCERT. Direct questions.'
    },
    {
        id: 'neet-chem-7-2',
        chapterId: 'neet-chem-7',
        name: 'p-Block Elements (Group 17 & 18)',
        jeeAsks: ['Halogens: trends in oxidising power', 'Compounds of Cl (bleaching powder, HCl)', 'Noble gas compounds (XeF2, XeF4, XeF6)', 'Interhalogen compounds'],
        pyqFocus: { trends: ['Oxidising power: F > Cl > Br > I', 'XeF2 structure and shape'], patterns: ['Predict shape using VSEPR', 'Compare properties of halogens'], traps: ['F has no d-orbitals so no +oxidation state', 'XeF2: linear (2 LP + 2 BP)'] },
        commonMistakes: ['F: most electronegative, strongest oxidizing agent', 'ClF3 shape is T-shaped', 'Bleaching powder is CaOCl2'],
        jeetuLine: 'Halogens oxidising power decreases down. F has no d-orbital so no hypervalency.'
    },
    {
        id: 'neet-chem-7-3',
        chapterId: 'neet-chem-7',
        name: 'd-Block Elements (Transition Metals)',
        jeeAsks: ['Variable oxidation states reason', 'Magnetic properties', 'Catalytic properties', 'Colour of transition metal compounds', 'Interstitial compounds'],
        pyqFocus: { trends: ['Why Cr and Cu have irregular configurations', 'KMnO4 acts as oxidizing agent'], patterns: ['State and explain properties of transition metals'], traps: ['Zn, Cd, Hg are NOT transition metals technically', 'Cu2+ is more stable than Cu+'] },
        commonMistakes: ['Cr: [Ar]3d5 4s1 (not 3d4 4s2)', 'Cu: [Ar]3d10 4s1 (not 3d9 4s2)', 'Mn has max oxidation states (+2 to +7)'],
        jeetuLine: 'Cr and Cu have exceptional configs. Learn them separately. Variable OS from (n-1)d electrons.'
    },
];

export const neetChem8Subchapters: Subchapter[] = [
    {
        id: 'neet-chem-8-1',
        chapterId: 'neet-chem-8',
        name: 'Solutions & Colligative Properties',
        jeeAsks: ['Raoult\'s law and vapour pressure lowering', 'Boiling point elevation, freezing point depression', 'Osmotic pressure', 'Van\'t Hoff factor'],
        pyqFocus: { trends: ['Numerical on delta Tf calculations', 'Osmotic pressure formula'], patterns: ['Calculate molality, then find colligative property'], traps: ['delta Tb = Kb × m × i', 'Van\'t Hoff factor i > 1 for dissociation, i < 1 for association'] },
        commonMistakes: ['All colligative properties depend on number of particles not nature', 'Acetic acid in benzene: associates (i < 1)', 'NaCl in water: dissociates (i = 2)'],
        jeetuLine: 'Colligative = depends on solute particles, not identity. Van\'t Hoff i = key.'
    },
    {
        id: 'neet-chem-8-2',
        chapterId: 'neet-chem-8',
        name: 'Solid State',
        jeeAsks: ['Unit cell types (SC, BCC, FCC)', 'Packing efficiency calculations', 'Coordination number', 'Crystal defects (Schottky, Frenkel)'],
        pyqFocus: { trends: ['Packing efficiency: FCC/HCP=74%, BCC=68%, SC=52%', 'Coordination number'], patterns: ['Calculate density from unit cell parameters'], traps: ['FCC has 4 atoms per unit cell', 'BCC has 2 atoms per unit cell'] },
        commonMistakes: ['SC: 1 atom/cell, BCC: 2, FCC: 4', 'Schottky: cation + anion both missing (ionic crystal)', 'Frenkel: smaller ion in interstitial site'],
        jeetuLine: 'FCC = 4 atoms, BCC = 2, SC = 1. Packing: FCC 74%, BCC 68%, SC 52%. Memorize.'
    },
];
