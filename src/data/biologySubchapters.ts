
import { Subchapter } from './subchapters';

export const cellBiologySubchapters: Subchapter[] = [
    {
        id: 'neet-bio-1-1',
        chapterId: 'neet-bio-1',
        name: 'Cell Theory & Prokaryotic Cells',
        jeeAsks: ['Cell theory postulates', 'Prokaryotic vs Eukaryotic differences', 'Bacterial cell wall', 'Mesosomes'],
        pyqFocus: { trends: ['Cell envelope modifications', 'Ribosome types'], patterns: ['Match organelle with function'], traps: ['Mesosome functions', 'Plasmid definition'] },
        commonMistakes: ['Confusing gram +ve and -ve', 'Pili vs Fimbriae function', '70S vs 80S ribosomes'],
        jeetuLine: 'Prokaryotes simple hain par tricky. Cell envelope aur organelles pakka karo.'
    },
    {
        id: 'neet-bio-1-2',
        chapterId: 'neet-bio-1',
        name: 'Eukaryotic Organelles - I (Endomembrane)',
        jeeAsks: ['ER (RER/SER) functions', 'Golgi apparatus role', 'Lysosomes & Vacuoles'],
        pyqFocus: { trends: ['Golgi packaging role', 'Lysosomal enzymes'], patterns: ['Sequence of protein secretion'], traps: ['SER lipid synthesis vs RER protein synthesis'] },
        commonMistakes: ['Cis vs Trans face of Golgi', 'Lysosome pH', 'Vacuole tonoplast function'],
        jeetuLine: 'Endomembrane system connected hai. ER -> Golgi -> Lysosome/Vacuole sequence yaad rakho.'
    },
    {
        id: 'neet-bio-1-3',
        chapterId: 'neet-bio-1',
        name: 'Mitochondria & Plastids',
        jeeAsks: ['Double membrane structure', 'Matrix enzymes', 'Chloroplast pigments', 'Semi-autonomous nature'],
        pyqFocus: { trends: ['F0-F1 particles', 'Thylakoid arrangement'], patterns: ['Statement based questions on DNA presence'], traps: ['Mitochondria does not have cell wall', 'Ribosomes are 70S inside'] },
        commonMistakes: ['Inner membrane infoldings (Cristae)', 'Stroma vs Grana function', 'Own DNA and Ribosomes'],
        jeetuLine: 'Powerhouse aur Kitchen. Dono ke paas apna DNA hai. Important details.'
    },
    {
        id: 'neet-bio-1-4',
        chapterId: 'neet-bio-1',
        name: 'Nucleus & Chromosomes',
        jeeAsks: ['Nuclear pore complex', 'Chromatin structure', 'Chromosome types (Metacentric etc.)'],
        pyqFocus: { trends: ['Chromosome shape during anaphase', 'Satellite DNA'], patterns: ['Identify chromosome type by centromere position'], traps: ['Nucleolus is not membrane bound'] },
        commonMistakes: ['Heterochromatin vs Euchromatin', 'Acocentric vs Telocentric', 'Nucleosome structure'],
        jeetuLine: 'Nucleus controller hai. Chromosome types aur unki shapes anaphase mein yaad rakhna.'
    }
];

export const humanPhysiologySubchapters: Subchapter[] = [
    {
        id: 'neet-bio-2-1',
        chapterId: 'neet-bio-2',
        name: 'Digestion & Absorption',
        jeeAsks: ['Dental formula', 'Digestive enzymes', 'Absorption mechanisms', 'Disorders'],
        pyqFocus: { trends: ['Enzyme source and substrate', 'Hormonal control'], patterns: ['Match gland with secretion'], traps: ['Succus entericus composition', 'Chylomicron absorption'] },
        commonMistakes: ['Pepsin vs Trypsin pH', 'Bile contains no enzymes', 'Absorption of fats'],
        jeetuLine: 'Enzymes, source, aur pH. Ye table banalo, sab clear ho jayega.'
    },
    {
        id: 'neet-bio-2-2',
        chapterId: 'neet-bio-2',
        name: 'Breathing & Exchange',
        jeeAsks: ['Respiratory volumes/capacities', 'Transport of O2 and CO2', 'Regulation of respiration'],
        pyqFocus: { trends: ['Oxygen dissociation curve', 'Partial pressures'], patterns: ['Calculate vital capacity', 'Shift in curve'], traps: ['CO2 transport percentages', 'Role of medulla'] },
        commonMistakes: ['Residual volume cannot be measured by spirometer', 'Haldane vs Bohr effect', 'Pneumotaxic center function'],
        jeetuLine: 'Volumes aur Curve. Ye do topics se hi maximum questions aate hain.'
    },
    {
        id: 'neet-bio-2-3',
        chapterId: 'neet-bio-2',
        name: 'Body Fluids & Circulation',
        jeeAsks: ['Blood grouping', 'Cardiac cycle', 'ECG', 'Double circulation'],
        pyqFocus: { trends: ['ECG wave meaning', 'Blood clotting cascade'], patterns: ['Sequence of cardiac cycle', 'Identify heart sound'], traps: ['Role of Ca++ in clotting', 'Stroke volume calculation'] },
        commonMistakes: ['Arteries carry oxygenated (except Pulmonary)', 'Universal donor O-ve', 'Safety of Rh factor'],
        jeetuLine: 'ECG aur Cardiac Cycle ko visualise karo. Flow chart banao blood ka.'
    },
    {
        id: 'neet-bio-2-4',
        chapterId: 'neet-bio-2',
        name: 'Excretory Products',
        jeeAsks: ['Nephron structure', 'Urine formation', 'Counter current mechanism', 'RAAS'],
        pyqFocus: { trends: ['Concentration of urine', 'Hormonal regulation'], patterns: ['Function of PCT/DCT/Loop'], traps: ['Role of ADH vs Aldosterone', 'Descending limb permeability'] },
        commonMistakes: ['Counter current multiplier vs exchanger', 'Gfr regulation', 'Urea recycling'],
        jeetuLine: 'Counter current mechanism most logical topic hai. Diagram se samjho.'
    }
];

export const plantPhysiologySubchapters: Subchapter[] = [
    {
        id: 'neet-bio-3-1',
        chapterId: 'neet-bio-3',
        name: 'Photosynthesis',
        jeeAsks: ['Light reaction (Z-scheme)', 'C3 vs C4 cycle', 'Photorespiration', 'Factors affecting'],
        pyqFocus: { trends: ['C4 pathway anatomy', 'Chemiosmotic hypothesis'], patterns: ['ATP/NADPH count comparison'], traps: ['Rubisco dual nature', 'Kranz anatomy'] },
        commonMistakes: ['Location of light/dark reaction', 'First stable product of C3/C4', 'ATP yield'],
        jeetuLine: 'Z-scheme aur C3/C4 cycles. Steps aur location yaad honi chahiye.'
    },
    {
        id: 'neet-bio-3-2',
        chapterId: 'neet-bio-3',
        name: 'Respiration in Plants',
        jeeAsks: ['Glycolysis', 'Krebs cycle', 'ETS', 'RQ values'],
        pyqFocus: { trends: ['ATP calculation', 'Molecule fate'], patterns: ['Location of each step'], traps: ['Total ATP from 1 glucose', 'Role of Oxygen'] },
        commonMistakes: ['Substrate level phosphorylation', 'Complexes in ETS', 'Anaerobic products'],
        jeetuLine: 'Cycles hain, par energy (ATP) count karna mat bhoolna.'
    },
    {
        id: 'neet-bio-3-3',
        chapterId: 'neet-bio-3',
        name: 'Plant Growth & Development',
        jeeAsks: ['Plant hormones (Auxin, Gibberellin etc.)', 'Photoperiodism', 'Vernalization'],
        pyqFocus: { trends: ['Physiological effects of hormones', 'Bioassays'], patterns: ['Match hormone with function'], traps: ['Long day vs Short day plants', 'Ethylene roles'] },
        commonMistakes: ['Synthetic vs Natural auxins', 'Bolting definition', 'Seed dormancy causes'],
        jeetuLine: 'Hormones ki table banao - Discovery, Precursor, Function. Direct questions.'
    }
];

export const geneticsSubchapters: Subchapter[] = [
    {
        id: 'neet-bio-4-1',
        chapterId: 'neet-bio-4',
        name: 'Mendelian Principles',
        jeeAsks: ['Monohybrid/Dihybrid crosses', 'Test cross', 'Incomplete dominance', 'Co-dominance'],
        pyqFocus: { trends: ['Ratios calculation', 'Blood group genetics'], patterns: ['Pedigree analysis basics'], traps: ['Linkage deviation', 'Pleiotropy vs Polygenic'] },
        commonMistakes: ['Genotype vs Phenotype ratio', 'Independent assortment exceptions', 'Chromosomal theory'],
        jeetuLine: 'Ratios (3:1, 9:3:3:1) aur unke exceptions. Logic lagao, ratto mat.'
    },
    {
        id: 'neet-bio-4-2',
        chapterId: 'neet-bio-4',
        name: 'Molecular Basis',
        jeeAsks: ['DNA structure', 'Replication', 'Transcription', 'Translation', 'Lac Operon'],
        pyqFocus: { trends: ['Genetic code properties', 'Lac operon regulation'], patterns: ['Sequence direction (5->3)', 'Enzyme functions'], traps: ['Template vs Coding strand', 'Introns vs Exons'] },
        commonMistakes: ['Direction of polymerization', 'Splicing mechanism', 'Chargaff rule application'],
        jeetuLine: 'Central Dogma: DNA -> RNA -> Protein. Process aur enzymes critical hain.'
    }
];

export const ecologySubchapters: Subchapter[] = [
    {
        id: 'neet-bio-5-1',
        chapterId: 'neet-bio-5',
        name: 'Organisms and Populations',
        jeeAsks: ['Population attributes', 'Growth models (Exponential/Logistic)', 'Interactions'],
        pyqFocus: { trends: ['Population interaction examples', 'Age pyramids'], patterns: ['Match interaction type (+/-)'], traps: ['Logistic growth equation particulars', 'Niche concept'] },
        commonMistakes: ['Commensalism vs Amensalism examples', 'r-selected vs K-selected', 'Natality vs Mortality'],
        jeetuLine: 'Interactions (+, -, 0) aur Growth curves. Examples NCERT se bahar mat jaana.'
    },
    {
        id: 'neet-bio-5-2',
        chapterId: 'neet-bio-5',
        name: 'Ecosystem',
        jeeAsks: ['Structure and function', 'Energy flow', 'Ecological pyramids', 'Succession'],
        pyqFocus: { trends: ['10% law', 'Pyramid of biomass/number'], patterns: ['Identify trophic levels'], traps: ['Inverted pyramids', 'Phosphorus vs Carbon cycle'] },
        commonMistakes: ['Primary vs Secondary productivity', 'Pioneer species in succession', 'Detritus food chain'],
        jeetuLine: 'Energy flow unidirectional hai. 10% law simple hai par important.'
    }
];

export const reproductionSubchapters: Subchapter[] = [
    {
        id: 'neet-bio-6-1',
        chapterId: 'neet-bio-6',
        name: 'Human Reproduction',
        jeeAsks: ['Male/Female system Anatomy', 'Gametogenesis', 'Menstrual Cycle', 'Fertilization'],
        pyqFocus: { trends: ['Hormonal control of cycle', 'Embryo development'], patterns: ['Diagram labelling', 'Sequence of sperm path'], traps: ['Placenta hormones', 'Meiosis stages in oogenesis'] },
        commonMistakes: ['Spermiogenesis vs Spermiation', 'Menstrual cycle days', 'Parturition signals'],
        jeetuLine: 'Diagrams aur Hormonal control graph. Wahi se question banega.'
    },
    {
        id: 'neet-bio-6-2',
        chapterId: 'neet-bio-6',
        name: 'Reproductive Health',
        jeeAsks: ['Contraceptive methods', 'MTP', 'ART (IVF, ZIFT, etc.)', 'STIs'],
        pyqFocus: { trends: ['ART abbreviations and methods', 'IUD types'], patterns: ['Match contraceptive with mode of action'], traps: ['Saheli properties', 'Legal age of marriage'] },
        commonMistakes: ['GIFT vs ZIFT', 'CuT vs Hormone releasing IUD', 'Infertility causes'],
        jeetuLine: 'Contraceptives aur ART full forms. Chhota chapter, full marks.'
    }
];

export const biotechSubchapters: Subchapter[] = [
    {
        id: 'neet-bio-7-1',
        chapterId: 'neet-bio-7',
        name: 'Principles & Processes',
        jeeAsks: ['Restriction enzymes', 'Gel electrophoresis', 'PCR', 'Cloning vectors'],
        pyqFocus: { trends: ['Palindromic sequences', 'pBR322 diagram'], patterns: ['Steps of rDNA technology'], traps: ['Selectable markers', 'EcoRI naming'] },
        commonMistakes: ['Endonuclease vs Exonuclease', 'Elution definition', 'Taq polymerase source'],
        jeetuLine: 'Tools of biotechnology: Enzymes aur Vectors. pBR322 diagram ratt lo.'
    }
];

export const animalKingdomSubchapters: Subchapter[] = [
    {
        id: 'neet-bio-8-1',
        chapterId: 'neet-bio-8',
        name: 'Animal Classification',
        jeeAsks: ['Basis of classification', 'Phylum characteristic features', 'Examples'],
        pyqFocus: { trends: ['Match animal with phylum', 'Unique features (Comb plates, Radula)'], patterns: ['Identify symmetry/coelom'], traps: ['Examples (Scientific names)', 'Larval stages'] },
        commonMistakes: ['Open vs Closed circulation', 'Diploblastic vs Triploblastic', 'Exceptions in phyla'],
        jeetuLine: 'Examples aur distinctive features. "Exceptions" hi rules hain yahan.'
    }
];

export const plantKingdomSubchapters: Subchapter[] = [
    {
        id: 'neet-bio-9-1',
        chapterId: 'neet-bio-9',
        name: 'Plant Classification',
        jeeAsks: ['Algae types', 'Bryophytes vs Pteridophytes', 'Gymnosperms', 'Life cycles'],
        pyqFocus: { trends: ['Haplontic/Diplontic cycles', 'Economic importance'], patterns: ['Match features with group'], traps: ['Double fertilization in Angiosperms', 'Moss vs Liverwort'] },
        commonMistakes: ['Pigments in algae', 'Dominant phase (Gametophyte/Sporophyte)', 'Examples'],
        jeetuLine: 'Life cycles (Alternation of generation) aur Algae pigments table.'
    }
];

export const humanHealthSubchapters: Subchapter[] = [
    {
        id: 'neet-bio-10-1',
        chapterId: 'neet-bio-10',
        name: 'Health & Disease',
        jeeAsks: ['Pathogens (Typhoid, Malaria etc.)', 'Immunity (Innate/Acquired)', 'Cancer', 'Drugs'],
        pyqFocus: { trends: ['Malaria life cycle', 'Antibody structure'], patterns: ['Match disease with vector/Test'], traps: ['Active vs Passive immunity', 'Drug source plants'] },
        commonMistakes: ['HIV replication mechanism', 'Types of Cancer', 'Opioids vs Cannabinoids receptors'],
        jeetuLine: 'Diseases ki list: Cause, Symptom, Test. Aur Immunity ke types.'
    }
];
