import { Subchapter } from './subchapters';

export const neetPhy1Subchapters: Subchapter[] = [
    {
        id: 'neet-phy-1-1',
        chapterId: 'neet-phy-1',
        name: 'Kinematics',
        jeeAsks: ['Equations of motion (v = u + at, s = ut + ½at²)', 'Projectile motion: range, height, time of flight', 'Relative velocity problems', 'Graph interpretation (x-t, v-t)'],
        pyqFocus: { trends: ['Projectile motion most repeated', 'Graph-based questions increasing'], patterns: ['Find range, max height of projectile', 'Slope of v-t = acceleration'], traps: ['At max height, only vy = 0, not vx', 'Range formula only valid for ground-to-ground'] },
        commonMistakes: ['Horizontal velocity constant in projectile', 'v² = u² + 2as for constant acceleration only', 'Area under v-t graph = displacement (not distance)'],
        jeetuLine: 'Projectile: split into horizontal and vertical. Time same for both. Simple physics.'
    },
    {
        id: 'neet-phy-1-2',
        chapterId: 'neet-phy-1',
        name: 'Laws of Motion',
        jeeAsks: ['Newton\'s laws applications', 'Free body diagram problems', 'Friction (static and kinetic)', 'Circular motion and centripetal force'],
        pyqFocus: { trends: ['Pulleys and inclined planes', 'Maximum static friction vs applied force'], patterns: ['Draw FBD, apply F = ma', 'Find tension in strings, normal force'], traps: ['Centripetal force is not a separate force', 'fs ≤ μsN (self-adjusting)'] },
        commonMistakes: ['Action-reaction pairs on different bodies', 'At top of circular path: mg + N = mv²/r', 'Friction can act in direction of motion (rolling)'],
        jeetuLine: 'FBD first, equations later. Never skip drawing forces. Newton ka second law: net F = ma.'
    },
    {
        id: 'neet-phy-1-3',
        chapterId: 'neet-phy-1',
        name: 'Work, Energy & Power',
        jeeAsks: ['Work-energy theorem', 'Conservation of mechanical energy', 'Elastic and inelastic collisions', 'Power = rate of work'],
        pyqFocus: { trends: ['Energy conservation on incline/spring', 'Momentum in collisions'], patterns: ['Use energy conservation: KEi + PEi = KEf + PEf', 'Collision: momentum conserved always'], traps: ['Wnet = ΔKE (not just Wapplied)', 'Elastic: KE conserved. Inelastic: KE not conserved'] },
        commonMistakes: ['W by normal force = 0 (perpendicular to motion)', 'Power = Fv (when F and v are parallel)', 'e = 1 elastic, e = 0 perfectly inelastic'],
        jeetuLine: 'In collision: momentum always conserved. KE conserved only in elastic (e = 1).'
    },
    {
        id: 'neet-phy-1-4',
        chapterId: 'neet-phy-1',
        name: 'Gravitation',
        jeeAsks: ['Kepler\'s laws', 'Orbital velocity and escape velocity', 'Variation of g with height and depth', 'Satellite binding energy'],
        pyqFocus: { trends: ['Escape velocity vs orbital velocity', 'Kepler\'s T² ∝ r³'], patterns: ['Find period using Kepler\'s 3rd law', 've = √2 × v0'], traps: ['Inside shell g = 0', 'g decreases both above and below surface'] },
        commonMistakes: ['ve = √(2GM/R) = √2 × v0', 'Total satellite energy = -GMm/2r (negative)', 'g at depth d: g\' = g(1 - d/R)'],
        jeetuLine: 'Escape velocity = √2 × orbital velocity. This ratio is exam favourite.'
    },
    {
        id: 'neet-phy-1-5',
        chapterId: 'neet-phy-1',
        name: 'Properties of Matter',
        jeeAsks: ['Young\'s modulus, Bulk modulus, Shear modulus', 'Surface tension applications', 'Viscosity and Stokes\' law', 'Bernoulli\'s theorem'],
        pyqFocus: { trends: ['Surface tension excess pressure in bubble/drop', 'Stokes\' terminal velocity'], patterns: ['Excess pressure = 2T/r (drop), 4T/r (soap bubble)', 'Apply Bernoulli for pipe flow problems'], traps: ['Soap bubble has 2 surfaces so 4T/r', 'Terminal velocity ∝ r² (Stokes)'] },
        commonMistakes: ['Drop has 1 surface: P = 2T/r', 'Soap bubble has 2 surfaces: P = 4T/r', 'Steel is more elastic than rubber (higher Y)'],
        jeetuLine: 'Soap bubble: 4T/r (two surfaces). Liquid drop: 2T/r (one surface). Key difference.'
    },
];

export const neetPhy2Subchapters: Subchapter[] = [
    {
        id: 'neet-phy-2-1',
        chapterId: 'neet-phy-2',
        name: 'Laws of Thermodynamics',
        jeeAsks: ['First law: dU = dQ - dW', 'Processes: isothermal, adiabatic, isochoric, isobaric', 'Second law and entropy', 'Carnot engine efficiency'],
        pyqFocus: { trends: ['Work done in different processes from PV diagram', 'Carnot efficiency calculation'], patterns: ['Identify process from PV diagram, find work done'], traps: ['Adiabatic: no heat exchange (Q = 0)', 'Isothermal: T constant (dU = 0 for ideal gas)'] },
        commonMistakes: ['Efficiency of Carnot = 1 - T2/T1', 'Isochoric (constant V): W = 0, so dU = dQ', 'For adiabatic: TV^(γ-1) = constant'],
        jeetuLine: 'Carnot efficiency = 1 - TL/TH. Only depends on temperatures, not working substance.'
    },
    {
        id: 'neet-phy-2-2',
        chapterId: 'neet-phy-2',
        name: 'Kinetic Theory of Gases',
        jeeAsks: ['KTG assumptions', 'vrms, vavg, vmp expressions', 'Degrees of freedom and equipartition', 'Mean free path'],
        pyqFocus: { trends: ['vrms vs vavg vs vmp ratio', 'Internal energy of gas from equipartition'], patterns: ['Calculate vrms at given temperature', 'Find Cv from degrees of freedom'], traps: ['vrms > vavg > vmp order', 'Monatomic gas: f = 3, Cv = 3R/2'] },
        commonMistakes: ['vrms = √(3RT/M), vavg = √(8RT/πM), vmp = √(2RT/M)', 'Diatomic gas at room temp: f = 5, Cv = 5R/2', 'U = f/2 × nRT'],
        jeetuLine: 'vrms : vavg : vmp = 1.73 : 1.60 : 1.41. vrms is always the largest.'
    },
];

export const neetPhy3Subchapters: Subchapter[] = [
    {
        id: 'neet-phy-3-1',
        chapterId: 'neet-phy-3',
        name: 'Electrostatics',
        jeeAsks: ['Coulomb\'s law force calculations', 'Electric field due to charges and dipole', 'Gauss\'s law applications', 'Electric potential and potential energy'],
        pyqFocus: { trends: ['Three charge equilibrium', 'E field inside conductors and shells'], patterns: ['Find null point for two charges', 'Use Gauss\'s law with symmetry'], traps: ['Inside conductor: E = 0', 'Inside hollow shell: E = 0 (Gauss)'] },
        commonMistakes: ['V = kq/r (scalar), add algebraically', 'E field lines from +Q, toward -Q', 'Potential inside conductor = same as surface'],
        jeetuLine: 'E = 0 inside conductor but V is not zero. This distinction is very important.'
    },
    {
        id: 'neet-phy-3-2',
        chapterId: 'neet-phy-3',
        name: 'Current Electricity',
        jeeAsks: ['Ohm\'s law and resistance', 'Kirchhoff\'s laws (KCL, KVL)', 'Wheatstone bridge', 'Potentiometer and meter bridge'],
        pyqFocus: { trends: ['Balanced Wheatstone bridge', 'Potentiometer: comparing EMFs'], patterns: ['Apply KVL loop by loop, KCL at nodes', 'Find equivalent resistance of network'], traps: ['No current through galvanometer in balanced bridge', 'Internal resistance in EMF problems'] },
        commonMistakes: ['KCL: sum of currents into node = sum out', 'Balanced bridge: P/Q = R/S', 'Potentiometer is more accurate than voltmeter (infinite resistance)'],
        jeetuLine: 'Wheatstone balanced: P/Q = R/S, Ig = 0. Potentiometer uses zero deflection method.'
    },
    {
        id: 'neet-phy-3-3',
        chapterId: 'neet-phy-3',
        name: 'Capacitors',
        jeeAsks: ['Series and parallel combinations', 'Energy stored in capacitor', 'Effect of dielectric', 'Charge and voltage with battery/without battery'],
        pyqFocus: { trends: ['Energy U = ½CV² = Q²/2C', 'Dielectric effect on C, V, E, U'], patterns: ['Find equivalent C and total charge', 'When battery removed vs kept: different analysis'], traps: ['Battery removed: Q constant, V changes', 'Battery kept: V constant, Q changes'] },
        commonMistakes: ['Series C: 1/Ceq = Σ(1/Ci) (smaller)', 'Parallel C: Ceq = ΣCi (larger)', 'With dielectric k: C becomes kC'],
        jeetuLine: 'Battery removed = Q fixed. Battery connected = V fixed. This changes everything.'
    },
];

export const neetPhy4Subchapters: Subchapter[] = [
    {
        id: 'neet-phy-4-1',
        chapterId: 'neet-phy-4',
        name: 'Magnetism & Magnetic Effects',
        jeeAsks: ['Force on charge in magnetic field (F = qvBsinθ)', 'Biot-Savart law for circular loop', 'Ampere\'s law for solenoid', 'Magnetic properties of materials'],
        pyqFocus: { trends: ['Force on current-carrying conductor', 'B field at centre of circular loop'], patterns: ['Find force on charge moving in B field', 'Use right-hand rule / Fleming\'s rule'], traps: ['Force on charge parallel to B = zero', 'Magnetic field does no work on charge'] },
        commonMistakes: ['F = qvBsinθ; if v parallel to B then F = 0', 'Fleming\'s left hand: force on conductor', 'B at centre of loop = μ0I/2r'],
        jeetuLine: 'Magnetic force never does work (always perpendicular to v). Remember this always.'
    },
    {
        id: 'neet-phy-4-2',
        chapterId: 'neet-phy-4',
        name: 'Electromagnetic Induction & AC Circuits',
        jeeAsks: ['Faraday\'s law ε = -dφ/dt', 'Lenz\'s law direction', 'Self and mutual inductance', 'RLC circuits resonance'],
        pyqFocus: { trends: ['Motional EMF = Bvl', 'Resonance frequency in LC circuit'], patterns: ['Apply Lenz\'s law: induced current opposes change', 'Find impedance in AC circuit'], traps: ['XL = ωL, XC = 1/ωC: at resonance XL = XC', 'Lenz\'s law gives direction, Faraday gives magnitude'] },
        commonMistakes: ['Induced EMF = Bvl for conductor moving in B', 'At resonance: Z = R (minimum), I = max', 'Power factor = cos φ = R/Z'],
        jeetuLine: 'Lenz law: induced current opposes change. Resonance: XL = XC, Z minimum.'
    },
];

export const neetPhy5Subchapters: Subchapter[] = [
    {
        id: 'neet-phy-5-1',
        chapterId: 'neet-phy-5',
        name: 'Ray Optics',
        jeeAsks: ['Mirror formula 1/v + 1/u = 1/f', 'Lens formula 1/v - 1/u = 1/f', 'Refraction and Snell\'s law', 'Prism dispersion and deviation'],
        pyqFocus: { trends: ['Sign convention numericals', 'Total internal reflection applications'], patterns: ['Apply mirror or lens formula with sign convention', 'Find angle of deviation in prism'], traps: ['Mirror: same sign convention as lens (new Cartesian)', 'TIR: light goes from denser to rarer, angle > critical angle'] },
        commonMistakes: ['New Cartesian: distances from pole/center, along principal axis', 'Concave lens: always virtual, erect, diminished image', 'Power P = 1/f (in meters), unit Dioptre'],
        jeetuLine: 'Sign convention: incident light direction = +x. All distances from optical centre. Stick to it.'
    },
    {
        id: 'neet-phy-5-2',
        chapterId: 'neet-phy-5',
        name: 'Wave Optics',
        jeeAsks: ['YDSE: fringe width β = λD/d', 'Conditions for constructive/destructive interference', 'Diffraction and single slit', 'Polarization by reflection (Brewster\'s law)'],
        pyqFocus: { trends: ['Fringe width calculation', 'Young\'s double slit maximum/minimum positions'], patterns: ['Calculate fringe width given λ, D, d', 'Find position of nth bright/dark fringe'], traps: ['Bright fringes: path diff = nλ', 'Dark fringes: path diff = (2n-1)λ/2'] },
        commonMistakes: ['β = λD/d (both in same units)', 'Central fringe always bright (zeroth order)', 'Brewster\'s angle: tanθB = μ'],
        jeetuLine: 'YDSE fringe width = λD/d. Increase D or λ, fringes widen. Increase d, fringes narrow.'
    },
    {
        id: 'neet-phy-5-3',
        chapterId: 'neet-phy-5',
        name: 'Modern Physics (Atomic & Nuclear)',
        jeeAsks: ['Photoelectric effect', 'Bohr\'s model of hydrogen atom', 'Radioactive decay law', 'Nuclear fission and fusion'],
        pyqFocus: { trends: ['Energy levels in H atom', 'Half life and decay constant'], patterns: ['Calculate wavelength from energy difference using E = hf', 'N = N0 e^(-λt)'], traps: ['Threshold frequency: minimum for photoelectric effect', 'Binding energy per nucleon vs mass number graph'] },
        commonMistakes: ['Stopping potential = max KE of photoelectron / e', 'En = -13.6/n² eV for hydrogen', 't1/2 = 0.693/λ (decay constant λ, not wavelength)'],
        jeetuLine: 'Photoelectric: KE = hf - work function. Higher frequency = more energy. NOT intensity.'
    },
];

export const neetPhy6Subchapters: Subchapter[] = [
    {
        id: 'neet-phy-6-1',
        chapterId: 'neet-phy-6',
        name: 'Simple Harmonic Motion (SHM)',
        jeeAsks: ['SHM: x = A sin(ωt + φ)', 'Time period of spring-mass and pendulum', 'Energy in SHM', 'Velocity and acceleration in SHM'],
        pyqFocus: { trends: ['Spring combinations (series/parallel)', 'SHM energy at various positions'], patterns: ['Find T for given system', 'Velocity at x: v = ω√(A² - x²)'], traps: ['T of pendulum independent of mass and amplitude (small angle)', 'At mean: v max, a = 0; at extreme: v = 0, a max'] },
        commonMistakes: ['T = 2π√(m/k) spring; T = 2π√(l/g) pendulum', 'Springs in series: 1/k = Σ(1/ki)', 'Springs in parallel: k = Σki'],
        jeetuLine: 'SHM: v max at mean, a max at extreme. Energy alternates between KE and PE.'
    },
    {
        id: 'neet-phy-6-2',
        chapterId: 'neet-phy-6',
        name: 'Waves & Sound',
        jeeAsks: ['Wave speed v = fλ', 'Standing waves in strings and pipes', 'Doppler effect', 'Beats phenomenon'],
        pyqFocus: { trends: ['Open and closed pipe harmonics', 'Doppler formula for moving source/observer'], patterns: ['Find frequency of harmonics in pipe', 'Apply Doppler: f\' = f(v ± vo)/(v ∓ vs)'], traps: ['Closed pipe: odd harmonics only (f, 3f, 5f)', 'Open pipe: all harmonics (f, 2f, 3f)'] },
        commonMistakes: ['Beats = |f1 - f2|', 'String: v = √(T/μ), standing wave nodes at ends', 'Open pipe fundamental: L = λ/2'],
        jeetuLine: 'Closed pipe: odd harmonics. Open pipe: all harmonics. Doppler: source approaches → freq increases.'
    },
];
