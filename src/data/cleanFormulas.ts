// Clean JEE Formulas - No LaTeX, No Special Characters
// Format: Formula | Explanation | When to use

export interface CleanFormula {
  formula: string;
  explanation: string;
  examTip: string;
}

export interface ChapterFormulas {
  chapter: string;
  subject: 'physics' | 'chemistry' | 'maths' | 'biology';
  formulas: CleanFormula[];
}

// ==================== PHYSICS ====================

export const physicsFormulas: ChapterFormulas[] = [
  {
    chapter: 'Modern Physics',
    subject: 'physics',
    formulas: [
      {
        formula: 'E = h times nu = h times c / lambda',
        explanation: 'Photon energy equals Planck constant times frequency. Shortcut: E (in eV) = 12400 / lambda (in Angstrom)',
        examTip: 'Use 12400 shortcut for quick calculation in numericals'
      },
      {
        formula: 'KE max = h times nu minus work function',
        explanation: 'Maximum kinetic energy of ejected electron equals photon energy minus threshold energy',
        examTip: 'If nu is less than threshold frequency, no electron comes out regardless of intensity'
      },
      {
        formula: 'lambda = h / p = h / (m times v)',
        explanation: 'de Broglie wavelength equals Planck constant divided by momentum',
        examTip: 'For electron accelerated through V volts: lambda = 12.27 / root(V) Angstrom'
      },
      {
        formula: 'lambda = h / root(2 times m times KE)',
        explanation: 'de Broglie wavelength using kinetic energy instead of velocity',
        examTip: 'Use this form when KE is given directly in the problem'
      },
      {
        formula: 'E(n) = -13.6 times Z squared / n squared eV',
        explanation: 'Energy of electron in nth orbit. Negative sign means bound state',
        examTip: 'Ground state n=1, first excited n=2. Energy increases (becomes less negative) as n increases'
      },
      {
        formula: 'r(n) = 0.529 times n squared / Z Angstrom',
        explanation: 'Radius of nth Bohr orbit. Increases with n squared',
        examTip: 'For hydrogen Z=1, ground state radius = 0.529 Angstrom'
      },
      {
        formula: 'N = N0 times e power(-lambda times t)',
        explanation: 'Number of undecayed nuclei at time t. N0 is initial count, lambda is decay constant',
        examTip: 'After one half-life, exactly half nuclei remain'
      },
      {
        formula: 't half = 0.693 / lambda',
        explanation: 'Half-life equals 0.693 divided by decay constant',
        examTip: 'After n half-lives: N = N0 / 2 power n. Use this for quick calculation'
      },
      {
        formula: 'Activity A = lambda times N = A0 times e power(-lambda times t)',
        explanation: 'Rate of decay. Also decreases exponentially with time',
        examTip: 'Activity is measured in Becquerel (decays per second) or Curie'
      }
    ]
  },
  {
    chapter: 'Kinematics',
    subject: 'physics',
    formulas: [
      {
        formula: 'v = u + a times t',
        explanation: 'Final velocity equals initial velocity plus acceleration times time',
        examTip: 'Use when time is given and displacement is not asked'
      },
      {
        formula: 's = u times t + half times a times t squared',
        explanation: 'Displacement equals initial velocity times time plus half acceleration times time squared',
        examTip: 'Use when final velocity is not given'
      },
      {
        formula: 'v squared = u squared + 2 times a times s',
        explanation: 'Final velocity squared equals initial velocity squared plus 2 times acceleration times displacement',
        examTip: 'Use when time is not given. Most useful equation for numericals'
      },
      {
        formula: 'Range R = u squared times sin(2 theta) / g',
        explanation: 'Horizontal range of projectile on level ground',
        examTip: 'Maximum range at theta = 45 degrees. Same range for theta and (90 - theta)'
      },
      {
        formula: 'Max Height H = u squared times sin squared(theta) / (2 times g)',
        explanation: 'Maximum height reached by projectile',
        examTip: 'At highest point, vertical velocity = 0, horizontal velocity = u cos(theta)'
      },
      {
        formula: 'Time of Flight T = 2 times u times sin(theta) / g',
        explanation: 'Total time projectile stays in air',
        examTip: 'Time to reach max height = T/2'
      }
    ]
  },
  {
    chapter: 'Laws of Motion',
    subject: 'physics',
    formulas: [
      {
        formula: 'F = m times a',
        explanation: 'Net force equals mass times acceleration',
        examTip: 'Always draw Free Body Diagram first. This is the foundation of mechanics'
      },
      {
        formula: 'f static max = mu(s) times N',
        explanation: 'Maximum static friction equals coefficient of static friction times normal force',
        examTip: 'Static friction can be less than this value. It adjusts to prevent motion'
      },
      {
        formula: 'f kinetic = mu(k) times N',
        explanation: 'Kinetic friction equals coefficient of kinetic friction times normal force',
        examTip: 'Kinetic friction is constant once motion starts. Usually mu(k) is less than mu(s)'
      },
      {
        formula: 'a centripetal = v squared / r = omega squared times r',
        explanation: 'Centripetal acceleration always points towards center',
        examTip: 'In circular motion, speed may be constant but velocity is always changing direction'
      },
      {
        formula: 'F pseudo = negative m times a (frame)',
        explanation: 'Pseudo force in non-inertial frame equals mass times acceleration of frame, opposite direction',
        examTip: 'Apply pseudo force only when analyzing from accelerating reference frame'
      }
    ]
  },
  {
    chapter: 'Work Energy Power',
    subject: 'physics',
    formulas: [
      {
        formula: 'W = F times s times cos(theta)',
        explanation: 'Work equals force times displacement times cosine of angle between them',
        examTip: 'Work is zero when force is perpendicular to displacement (theta = 90)'
      },
      {
        formula: 'KE = half times m times v squared',
        explanation: 'Kinetic energy equals half times mass times velocity squared',
        examTip: 'KE is always positive. It depends on speed, not velocity'
      },
      {
        formula: 'PE spring = half times k times x squared',
        explanation: 'Elastic potential energy equals half times spring constant times extension squared',
        examTip: 'Same formula for compression. Energy stored is always positive'
      },
      {
        formula: 'PE gravity = m times g times h',
        explanation: 'Gravitational potential energy equals mass times g times height',
        examTip: 'Choose reference point wisely. PE can be negative if below reference'
      },
      {
        formula: 'e = (v2 - v1) / (u1 - u2)',
        explanation: 'Coefficient of restitution equals relative velocity of separation divided by relative velocity of approach',
        examTip: 'e = 1 for elastic collision, e = 0 for perfectly inelastic (bodies stick)'
      },
      {
        formula: 'P = W / t = F times v',
        explanation: 'Power equals work done per unit time, or force times velocity',
        examTip: 'For maximum power of vehicle on incline, use P = F times v'
      }
    ]
  },
  {
    chapter: 'Rotational Motion',
    subject: 'physics',
    formulas: [
      {
        formula: 'Torque = r times F times sin(theta) = I times alpha',
        explanation: 'Torque equals perpendicular distance times force, or moment of inertia times angular acceleration',
        examTip: 'Torque causes angular acceleration, just like force causes linear acceleration'
      },
      {
        formula: 'L = I times omega = r times p',
        explanation: 'Angular momentum equals moment of inertia times angular velocity',
        examTip: 'If no external torque, angular momentum is conserved. Ice skater spins faster when arms pulled in'
      },
      {
        formula: 'I = sum of (m times r squared)',
        explanation: 'Moment of inertia equals sum of mass times distance squared from axis',
        examTip: 'Different for different axes. Use standard results for common shapes'
      },
      {
        formula: 'I parallel = I cm + M times d squared',
        explanation: 'Parallel axis theorem: MOI about any axis equals MOI about parallel axis through CM plus mass times distance squared',
        examTip: 'Use this to shift axis parallel to original. Very common in JEE'
      },
      {
        formula: 'KE rolling = half times m times v squared + half times I times omega squared',
        explanation: 'Total KE of rolling body equals translational KE plus rotational KE',
        examTip: 'For pure rolling: v = omega times r. Solid sphere reaches bottom first on incline'
      }
    ]
  },
  {
    chapter: 'Gravitation',
    subject: 'physics',
    formulas: [
      {
        formula: 'F = G times M times m / r squared',
        explanation: 'Gravitational force between two masses, inversely proportional to distance squared',
        examTip: 'G = 6.67 times 10 power(-11). Use this for planet-satellite problems'
      },
      {
        formula: 'g = G times M / R squared',
        explanation: 'Acceleration due to gravity at surface equals G times mass of planet divided by radius squared',
        examTip: 'g at height h: g(h) = g times (R / (R+h)) squared'
      },
      {
        formula: 'v escape = root(2 times g times R) = root(2 times G times M / R)',
        explanation: 'Minimum velocity to escape planet gravity permanently',
        examTip: 'Escape velocity is root 2 times orbital velocity. For Earth, v escape = 11.2 km/s'
      },
      {
        formula: 'v orbital = root(g times R) = root(G times M / R)',
        explanation: 'Velocity needed to orbit at surface level',
        examTip: 'Orbital velocity decreases as altitude increases'
      },
      {
        formula: 'T squared proportional to a cubed',
        explanation: 'Kepler third law: square of time period proportional to cube of semi-major axis',
        examTip: 'Use for comparing orbits: (T1/T2) squared = (a1/a2) cubed'
      },
      {
        formula: 'U = negative G times M times m / r',
        explanation: 'Gravitational potential energy is always negative (bound system)',
        examTip: 'Total energy in orbit = negative KE = U/2. Negative total energy means bound orbit'
      }
    ]
  },
  {
    chapter: 'SHM and Waves',
    subject: 'physics',
    formulas: [
      {
        formula: 'x = A times sin(omega times t + phi)',
        explanation: 'Displacement in SHM. A is amplitude, omega is angular frequency, phi is initial phase',
        examTip: 'At t=0, if x=0 and moving positive, phi=0. If at extreme, phi = 90 degrees'
      },
      {
        formula: 'v = A times omega times cos(omega times t + phi)',
        explanation: 'Velocity in SHM. Maximum velocity = A times omega at mean position',
        examTip: 'Velocity is maximum at mean position, zero at extremes'
      },
      {
        formula: 'a = negative omega squared times x',
        explanation: 'Acceleration in SHM is proportional to displacement and opposite in direction',
        examTip: 'This negative sign is the signature of SHM. Acceleration points towards mean position'
      },
      {
        formula: 'T spring = 2 times pi times root(m / k)',
        explanation: 'Time period of spring-mass system. Does not depend on amplitude',
        examTip: 'Springs in series: add reciprocals. Springs in parallel: add directly'
      },
      {
        formula: 'T pendulum = 2 times pi times root(l / g)',
        explanation: 'Time period of simple pendulum for small angles',
        examTip: 'Valid only for small angles (less than 15 degrees). T increases in elevator going down'
      },
      {
        formula: 'v wave = root(T / mu)',
        explanation: 'Wave speed on string equals root of tension divided by linear mass density',
        examTip: 'v = frequency times wavelength. This relation always holds for any wave'
      },
      {
        formula: 'f observed = f source times (v plus/minus v observer) / (v minus/plus v source)',
        explanation: 'Doppler effect formula. Use plus when approaching, minus when receding',
        examTip: 'Approaching increases frequency (higher pitch), receding decreases frequency'
      }
    ]
  },
  {
    chapter: 'Thermodynamics',
    subject: 'physics',
    formulas: [
      {
        formula: 'dQ = dU + dW',
        explanation: 'First law: Heat added equals increase in internal energy plus work done by system',
        examTip: 'Sign convention matters. Work by system is positive, work on system is negative'
      },
      {
        formula: 'W = integral of P dV',
        explanation: 'Work done equals area under PV curve',
        examTip: 'Clockwise cycle on PV diagram: net work is positive (engine). Anticlockwise: refrigerator'
      },
      {
        formula: 'PV = nRT',
        explanation: 'Ideal gas equation. P in Pascal, V in cubic meters, T in Kelvin',
        examTip: 'R = 8.314 J per mol K. For calculations, sometimes use R = 2 cal per mol K'
      },
      {
        formula: 'Cp minus Cv = R',
        explanation: 'Difference of molar specific heats equals gas constant',
        examTip: 'gamma = Cp/Cv. For monoatomic = 5/3, diatomic = 7/5, triatomic = 4/3'
      },
      {
        formula: 'Efficiency = 1 minus T cold / T hot',
        explanation: 'Carnot engine efficiency depends only on temperatures (in Kelvin)',
        examTip: 'This is maximum possible efficiency. Real engines have lower efficiency'
      },
      {
        formula: 'v rms = root(3RT / M)',
        explanation: 'Root mean square velocity of gas molecules. M is molar mass',
        examTip: 'v rms is greater than v average is greater than v most probable'
      }
    ]
  },
  {
    chapter: 'Electrostatics',
    subject: 'physics',
    formulas: [
      {
        formula: 'F = k times q1 times q2 / r squared',
        explanation: 'Coulomb force between charges. k = 9 times 10 power 9',
        examTip: 'Like charges repel, unlike attract. Force is along the line joining charges'
      },
      {
        formula: 'E = k times q / r squared',
        explanation: 'Electric field due to point charge. Direction: away from positive, towards negative',
        examTip: 'Field inside conductor is zero. Charges reside on surface'
      },
      {
        formula: 'V = k times q / r',
        explanation: 'Electric potential due to point charge. Scalar quantity',
        examTip: 'Potential is work done per unit positive charge. Can be positive or negative'
      },
      {
        formula: 'Flux = integral of E dot dA = q enclosed / epsilon0',
        explanation: 'Gauss law: total flux through closed surface equals enclosed charge divided by epsilon0',
        examTip: 'Use for symmetric charge distributions: sphere, cylinder, infinite plane'
      },
      {
        formula: 'C = epsilon0 times A / d',
        explanation: 'Capacitance of parallel plate capacitor. A is area, d is separation',
        examTip: 'With dielectric: C becomes K times original. K is dielectric constant'
      },
      {
        formula: 'U = half times C times V squared = half times Q times V = Q squared / (2C)',
        explanation: 'Energy stored in capacitor. Three equivalent forms',
        examTip: 'When battery disconnected, Q is constant. When battery connected, V is constant'
      }
    ]
  },
  {
    chapter: 'Current Electricity',
    subject: 'physics',
    formulas: [
      {
        formula: 'V = I times R',
        explanation: 'Ohm law: Voltage equals current times resistance',
        examTip: 'R = rho times l / A. Resistance increases with length, decreases with area'
      },
      {
        formula: 'P = I squared times R = V squared / R = V times I',
        explanation: 'Power dissipated in resistor. Three equivalent forms',
        examTip: 'For series: current same, so P = I squared R. For parallel: voltage same, so P = V squared / R'
      },
      {
        formula: 'R series = R1 + R2 + R3 + ...',
        explanation: 'Resistors in series add directly',
        examTip: 'Current is same through all. Total voltage = sum of individual voltages'
      },
      {
        formula: '1/R parallel = 1/R1 + 1/R2 + 1/R3 + ...',
        explanation: 'Reciprocals add for parallel combination',
        examTip: 'Voltage is same across all. Total current = sum of individual currents'
      },
      {
        formula: 'q = q0 times (1 minus e power(-t/RC))',
        explanation: 'Charging of capacitor through resistor. RC is time constant',
        examTip: 'After time = RC, capacitor charges to 63% of final value'
      },
      {
        formula: 'Time constant = R times C',
        explanation: 'Time constant of RC circuit in seconds',
        examTip: 'After 5 time constants, capacitor is practically fully charged (99%)'
      }
    ]
  },
  {
    chapter: 'Magnetism and EMI',
    subject: 'physics',
    formulas: [
      {
        formula: 'F = q times v times B times sin(theta)',
        explanation: 'Magnetic force on moving charge. Direction by right hand rule',
        examTip: 'Force is zero when velocity is parallel to field'
      },
      {
        formula: 'F = B times I times L times sin(theta)',
        explanation: 'Force on current carrying wire in magnetic field',
        examTip: 'Use for motor problems. Force is perpendicular to both B and I'
      },
      {
        formula: 'EMF = negative d(flux) / dt',
        explanation: 'Faraday law: Induced EMF equals negative rate of change of magnetic flux',
        examTip: 'Negative sign from Lenz law: induced current opposes the change causing it'
      },
      {
        formula: 'Flux = L times I',
        explanation: 'Self inductance: flux through coil equals inductance times current',
        examTip: 'Inductance is like electrical inertia. Opposes change in current'
      },
      {
        formula: 'XL = omega times L, XC = 1 / (omega times C)',
        explanation: 'Inductive and capacitive reactance. Depend on frequency',
        examTip: 'XL increases with frequency, XC decreases with frequency'
      },
      {
        formula: 'Z = root(R squared + (XL minus XC) squared)',
        explanation: 'Impedance in AC circuit. Like total resistance',
        examTip: 'At resonance, XL = XC, so Z = R (minimum). Current is maximum'
      }
    ]
  },
  {
    chapter: 'Optics',
    subject: 'physics',
    formulas: [
      {
        formula: '1/v + 1/u = 1/f',
        explanation: 'Mirror and lens formula. Use sign convention carefully',
        examTip: 'For mirror: real is negative side, virtual is positive. For lens: opposite convention'
      },
      {
        formula: 'n = sin(i) / sin(r)',
        explanation: 'Snell law: refractive index equals ratio of sines of angles',
        examTip: 'Light bends towards normal when entering denser medium'
      },
      {
        formula: 'sin(critical) = 1/n',
        explanation: 'Critical angle for total internal reflection',
        examTip: 'TIR happens only when going from denser to rarer medium, angle greater than critical'
      },
      {
        formula: 'deviation = (n minus 1) times A',
        explanation: 'Deviation by thin prism. A is prism angle',
        examTip: 'For minimum deviation in prism: ray passes symmetrically'
      },
      {
        formula: 'Fringe width beta = lambda times D / d',
        explanation: 'In Young double slit: fringe width equals wavelength times screen distance divided by slit separation',
        examTip: 'Central fringe is always bright. Path difference = 0 at center'
      },
      {
        formula: 'I = I0 times cos squared(theta)',
        explanation: 'Malus law for polarized light through polarizer',
        examTip: 'After two crossed polarizers, intensity = 0. After one polarizer, intensity = I0/2'
      }
    ]
  }
];

// ==================== CHEMISTRY ====================

export const chemistryFormulas: ChapterFormulas[] = [
  {
    chapter: 'Mole Concept',
    subject: 'chemistry',
    formulas: [
      {
        formula: 'n = mass / molar mass = N / Avogadro number',
        explanation: 'Number of moles from mass or from number of particles',
        examTip: 'Avogadro number = 6.022 times 10 power 23. Always convert to moles first'
      },
      {
        formula: 'M = n / V (in liters)',
        explanation: 'Molarity equals moles of solute per liter of solution',
        examTip: 'M1V1 = M2V2 for dilution. Most used formula in solution chemistry'
      },
      {
        formula: 'molality = moles of solute / kg of solvent',
        explanation: 'Moles per kg of solvent, not solution',
        examTip: 'Molality does not change with temperature because mass does not change'
      },
      {
        formula: 'At STP: 1 mole of gas = 22.4 liters',
        explanation: 'Molar volume of ideal gas at standard conditions',
        examTip: 'STP means 273 K and 1 atm. At room temp use 24.5 liters'
      },
      {
        formula: 'Equivalent weight = Molar mass / n factor',
        explanation: 'n factor depends on reaction type: acid-base, redox, etc.',
        examTip: 'For acids, n = basicity. For bases, n = acidity. For redox, n = electrons transferred'
      }
    ]
  },
  {
    chapter: 'Atomic Structure',
    subject: 'chemistry',
    formulas: [
      {
        formula: 'E = negative 13.6 times Z squared / n squared eV',
        explanation: 'Energy of electron in hydrogen-like atom',
        examTip: 'Same as physics formula. For ionization energy, calculate E1 (n=1)'
      },
      {
        formula: '1/lambda = R times Z squared times (1/n1 squared minus 1/n2 squared)',
        explanation: 'Rydberg formula for spectral lines. R = 1.097 times 10 power 7 per meter',
        examTip: 'For emission: n2 greater than n1. Lyman series: n1=1, Balmer: n1=2'
      },
      {
        formula: 'Number of radial nodes = n minus l minus 1',
        explanation: 'Radial nodes where probability of finding electron is zero',
        examTip: 'Total nodes = n minus 1. Angular nodes = l. Radial = n minus l minus 1'
      },
      {
        formula: 'Orbital angular momentum = root(l times (l+1)) times h bar',
        explanation: 'Angular momentum depends on azimuthal quantum number l',
        examTip: 'For s orbital l=0, so angular momentum = 0'
      }
    ]
  },
  {
    chapter: 'Chemical Equilibrium',
    subject: 'chemistry',
    formulas: [
      {
        formula: 'Kc = products concentration / reactants concentration (at equilibrium)',
        explanation: 'Equilibrium constant in terms of concentrations',
        examTip: 'Pure solids and liquids are not included in expression. Their activity = 1'
      },
      {
        formula: 'Kp = Kc times (RT) power delta n',
        explanation: 'Relation between Kp and Kc. delta n = moles of product gases minus reactant gases',
        examTip: 'If delta n = 0, then Kp = Kc'
      },
      {
        formula: 'delta G = negative RT times ln(K)',
        explanation: 'Gibbs energy related to equilibrium constant',
        examTip: 'If K greater than 1, reaction is spontaneous. If K less than 1, reverse is spontaneous'
      },
      {
        formula: 'Q vs K: Q less than K means forward, Q greater than K means reverse',
        explanation: 'Reaction quotient Q tells direction of reaction to reach equilibrium',
        examTip: 'Calculate Q with current concentrations, compare with K to predict direction'
      }
    ]
  },
  {
    chapter: 'Electrochemistry',
    subject: 'chemistry',
    formulas: [
      {
        formula: 'E cell = E cathode minus E anode',
        explanation: 'Cell potential equals reduction potential of cathode minus anode',
        examTip: 'Spontaneous cell has positive E. Remember: Cat Red An Ox (Cathode Reduction, Anode Oxidation)'
      },
      {
        formula: 'E = E standard minus (0.059/n) times log Q at 25 C',
        explanation: 'Nernst equation relates cell potential to concentrations',
        examTip: 'At equilibrium, E = 0 and Q = K. Use this to find K from E standard'
      },
      {
        formula: 'delta G = negative n times F times E',
        explanation: 'Gibbs energy equals negative of n times Faraday times cell potential',
        examTip: 'F = 96500 C per mol. Negative delta G means spontaneous'
      },
      {
        formula: 'W = n times F (for electrolysis)',
        explanation: 'Mass deposited = equivalent weight times current times time / 96500',
        examTip: 'Same charge deposits same number of equivalents of different substances'
      }
    ]
  },
  {
    chapter: 'Chemical Kinetics',
    subject: 'chemistry',
    formulas: [
      {
        formula: 'Rate = k times concentration power order',
        explanation: 'Rate law expression. k is rate constant, order determined experimentally',
        examTip: 'Order can be zero, fraction, or negative. Cannot be predicted from equation'
      },
      {
        formula: 't half (first order) = 0.693 / k',
        explanation: 'Half-life of first order reaction is independent of initial concentration',
        examTip: 'If half-life is constant, reaction is first order. Most radioactive decays are first order'
      },
      {
        formula: 'k = A times e power(-Ea/RT)',
        explanation: 'Arrhenius equation. A is pre-exponential factor, Ea is activation energy',
        examTip: 'Higher temperature means faster reaction. Every 10 degree rise roughly doubles rate'
      },
      {
        formula: 'ln(k2/k1) = (Ea/R) times (1/T1 minus 1/T2)',
        explanation: 'Two-point Arrhenius equation to find Ea from rate constants at two temperatures',
        examTip: 'Plot ln(k) vs 1/T gives straight line with slope = negative Ea/R'
      }
    ]
  },
  {
    chapter: 'Solutions',
    subject: 'chemistry',
    formulas: [
      {
        formula: 'P = P0 times x solvent (Raoult law)',
        explanation: 'Vapor pressure of solution equals vapor pressure of pure solvent times mole fraction',
        examTip: 'Valid for ideal solutions. Negative deviation: A-B attraction greater than A-A and B-B'
      },
      {
        formula: 'delta Tb = Kb times m',
        explanation: 'Elevation in boiling point equals ebullioscopic constant times molality',
        examTip: 'Use for molecular mass determination. i factor for electrolytes: i = 1 + alpha(n-1)'
      },
      {
        formula: 'delta Tf = Kf times m',
        explanation: 'Depression in freezing point equals cryoscopic constant times molality',
        examTip: 'Antifreeze works by lowering freezing point. Salt on roads same principle'
      },
      {
        formula: 'Pi = i times C times R times T',
        explanation: 'Osmotic pressure equals van t Hoff factor times molarity times R times T',
        examTip: 'Most sensitive method for molecular mass. Used for polymers'
      }
    ]
  }
];

// ==================== MATHS ====================

export const mathsFormulas: ChapterFormulas[] = [
  {
    chapter: 'Quadratic Equations',
    subject: 'maths',
    formulas: [
      {
        formula: 'x = (negative b plus/minus root(b squared minus 4ac)) / 2a',
        explanation: 'Quadratic formula for roots of ax squared + bx + c = 0',
        examTip: 'Discriminant D = b squared minus 4ac. D greater than 0: real roots, D = 0: equal roots, D less than 0: complex'
      },
      {
        formula: 'Sum of roots = negative b/a, Product of roots = c/a',
        explanation: 'Vieta formulas relating coefficients to roots',
        examTip: 'If roots are alpha and beta, then equation is x squared minus (alpha+beta)x + alpha times beta = 0'
      },
      {
        formula: 'For roots to be real and distinct: D greater than 0',
        explanation: 'Condition for two different real solutions',
        examTip: 'For roots of same sign: product greater than 0. For roots of opposite sign: product less than 0'
      }
    ]
  },
  {
    chapter: 'Sequences and Series',
    subject: 'maths',
    formulas: [
      {
        formula: 'AP: nth term = a + (n-1) times d',
        explanation: 'General term of arithmetic progression. a = first term, d = common difference',
        examTip: 'Sum of n terms = n/2 times (first term + last term) = n/2 times (2a + (n-1)d)'
      },
      {
        formula: 'GP: nth term = a times r power(n-1)',
        explanation: 'General term of geometric progression. r = common ratio',
        examTip: 'Sum of n terms = a(r power n minus 1)/(r minus 1). For infinite GP with |r| less than 1: S = a/(1-r)'
      },
      {
        formula: 'AM greater than or equal to GM greater than or equal to HM',
        explanation: 'Arithmetic mean is always greater than or equal to geometric mean',
        examTip: 'Equality holds when all numbers are equal. Use for proving inequalities'
      },
      {
        formula: 'Sum of first n natural numbers = n(n+1)/2',
        explanation: 'Standard result for 1 + 2 + 3 + ... + n',
        examTip: 'Sum of squares = n(n+1)(2n+1)/6. Sum of cubes = (n(n+1)/2) squared'
      }
    ]
  },
  {
    chapter: 'Permutations and Combinations',
    subject: 'maths',
    formulas: [
      {
        formula: 'nPr = n! / (n-r)!',
        explanation: 'Number of permutations (arrangements) of r things from n things',
        examTip: 'Use when order matters. Arranging 3 books from 5: 5P3 = 60'
      },
      {
        formula: 'nCr = n! / (r! times (n-r)!)',
        explanation: 'Number of combinations (selections) of r things from n things',
        examTip: 'Use when order does not matter. Choosing 3 books from 5: 5C3 = 10'
      },
      {
        formula: 'nCr = nC(n-r)',
        explanation: 'Choosing r is same as leaving out n minus r',
        examTip: 'Use to simplify: 100C98 = 100C2 = 4950. Much easier to calculate'
      },
      {
        formula: 'Arrangements with repetition: n! / (p! times q! times ...)',
        explanation: 'When some objects are identical, divide by factorial of repeated counts',
        examTip: 'MISSISSIPPI has 11 letters with M=1, I=4, S=4, P=2. Answer = 11!/(4!4!2!)'
      }
    ]
  },
  {
    chapter: 'Binomial Theorem',
    subject: 'maths',
    formulas: [
      {
        formula: '(a+b) power n = sum of nCr times a power(n-r) times b power r',
        explanation: 'Expansion of binomial. r goes from 0 to n',
        examTip: 'Total terms = n+1. General term Tr+1 = nCr times a power(n-r) times b power r'
      },
      {
        formula: 'Middle term: if n even, term at (n/2 + 1). If n odd, two middle terms',
        explanation: 'Position of middle term in expansion',
        examTip: 'For (1+x) power n, middle term coefficient is largest'
      },
      {
        formula: 'Sum of coefficients = 2 power n (put x=1)',
        explanation: 'Substituting x=1 gives sum of all coefficients',
        examTip: 'Sum of odd position coefficients = sum of even position coefficients = 2 power(n-1)'
      }
    ]
  },
  {
    chapter: 'Matrices and Determinants',
    subject: 'maths',
    formulas: [
      {
        formula: 'det(A times B) = det(A) times det(B)',
        explanation: 'Determinant of product equals product of determinants',
        examTip: 'det(A inverse) = 1/det(A). det(kA) = k power n times det(A) for n by n matrix'
      },
      {
        formula: 'A inverse = adj(A) / det(A)',
        explanation: 'Inverse matrix equals adjoint divided by determinant',
        examTip: 'Inverse exists only if det(A) not equal to 0. For 2x2: swap diagonal, negate off-diagonal'
      },
      {
        formula: 'A times A inverse = I (identity)',
        explanation: 'Product of matrix and its inverse is identity matrix',
        examTip: 'For solving AX = B, we get X = A inverse times B'
      },
      {
        formula: '(AB) transpose = B transpose times A transpose',
        explanation: 'Transpose of product reverses order',
        examTip: 'Symmetric matrix: A = A transpose. Skew-symmetric: A = negative A transpose'
      }
    ]
  },
  {
    chapter: 'Limits and Continuity',
    subject: 'maths',
    formulas: [
      {
        formula: 'lim (x approaches 0) sin(x)/x = 1',
        explanation: 'Most important standard limit. x must be in radians',
        examTip: 'Similarly: lim tan(x)/x = 1, lim (1-cos(x))/x squared = 1/2'
      },
      {
        formula: 'lim (x approaches 0) (1 + x) power(1/x) = e',
        explanation: 'Definition of e through limit',
        examTip: 'Also: lim (1 + 1/n) power n = e as n approaches infinity'
      },
      {
        formula: 'lim (x approaches 0) (e power x minus 1)/x = 1',
        explanation: 'Standard exponential limit',
        examTip: 'Also: lim (a power x minus 1)/x = ln(a)'
      },
      {
        formula: 'L Hospital: lim f/g = lim f prime / g prime (for 0/0 or infinity/infinity)',
        explanation: 'Differentiate numerator and denominator separately',
        examTip: 'Apply only for indeterminate forms. May need to apply multiple times'
      }
    ]
  },
  {
    chapter: 'Differentiation',
    subject: 'maths',
    formulas: [
      {
        formula: 'd/dx (x power n) = n times x power(n-1)',
        explanation: 'Power rule for differentiation',
        examTip: 'Works for any real n, including fractions and negatives'
      },
      {
        formula: 'd/dx (sin x) = cos x, d/dx (cos x) = negative sin x',
        explanation: 'Derivatives of basic trig functions',
        examTip: 'd/dx (tan x) = sec squared x. d/dx (cot x) = negative cosec squared x'
      },
      {
        formula: 'd/dx (e power x) = e power x, d/dx (ln x) = 1/x',
        explanation: 'Exponential and logarithmic derivatives',
        examTip: 'd/dx (a power x) = a power x times ln(a)'
      },
      {
        formula: 'Chain rule: d/dx f(g(x)) = f prime(g(x)) times g prime(x)',
        explanation: 'Derivative of composite function',
        examTip: 'Outer derivative times inner derivative. Most used rule in calculus'
      },
      {
        formula: 'Product rule: d/dx (uv) = u times dv/dx + v times du/dx',
        explanation: 'Derivative of product of two functions',
        examTip: 'Remember as: first times derivative of second + second times derivative of first'
      }
    ]
  },
  {
    chapter: 'Integration',
    subject: 'maths',
    formulas: [
      {
        formula: 'integral of x power n dx = x power(n+1) / (n+1) + C (n not equal to -1)',
        explanation: 'Power rule for integration. Reverse of differentiation',
        examTip: 'For n = -1, integral of 1/x dx = ln|x| + C'
      },
      {
        formula: 'integral of sin x dx = negative cos x + C',
        explanation: 'Basic trig integral',
        examTip: 'integral of cos x = sin x. integral of sec squared x = tan x'
      },
      {
        formula: 'integral of e power x dx = e power x + C',
        explanation: 'Exponential integral',
        examTip: 'integral of a power x = a power x / ln(a) + C'
      },
      {
        formula: 'Integration by parts: integral of u dv = uv minus integral of v du',
        explanation: 'For product of functions. Choose u using ILATE',
        examTip: 'ILATE order: Inverse trig, Log, Algebraic, Trig, Exponential. First in list = u'
      },
      {
        formula: 'integral from a to b of f dx = F(b) minus F(a)',
        explanation: 'Definite integral equals antiderivative evaluated at limits',
        examTip: 'Properties: integral from a to a = 0. integral from a to b = negative integral from b to a'
      }
    ]
  },
  {
    chapter: 'Coordinate Geometry',
    subject: 'maths',
    formulas: [
      {
        formula: 'Distance = root((x2-x1) squared + (y2-y1) squared)',
        explanation: 'Distance between two points in plane',
        examTip: 'For 3D, add (z2-z1) squared inside the root'
      },
      {
        formula: 'Section formula: ((m times x2 + n times x1)/(m+n), (m times y2 + n times y1)/(m+n))',
        explanation: 'Point dividing line segment in ratio m:n internally',
        examTip: 'For external division, use m and negative n. Midpoint: m = n = 1'
      },
      {
        formula: 'Slope m = (y2 - y1)/(x2 - x1) = tan(theta)',
        explanation: 'Slope of line through two points',
        examTip: 'Parallel lines: same slope. Perpendicular lines: m1 times m2 = -1'
      },
      {
        formula: 'Line: y minus y1 = m(x minus x1)',
        explanation: 'Point-slope form of line equation',
        examTip: 'General form: ax + by + c = 0. Slope = -a/b. y-intercept = -c/b'
      },
      {
        formula: 'Distance of point from line = |ax1 + by1 + c| / root(a squared + b squared)',
        explanation: 'Perpendicular distance from point to line ax + by + c = 0',
        examTip: 'Remove modulus to get signed distance (which side of line)'
      }
    ]
  },
  {
    chapter: 'Conic Sections',
    subject: 'maths',
    formulas: [
      {
        formula: 'Circle: (x-h) squared + (y-k) squared = r squared',
        explanation: 'Circle with center (h,k) and radius r',
        examTip: 'General form: x squared + y squared + 2gx + 2fy + c = 0. Center = (-g,-f), radius = root(g squared + f squared - c)'
      },
      {
        formula: 'Ellipse: x squared/a squared + y squared/b squared = 1',
        explanation: 'Standard ellipse with a greater than b',
        examTip: 'Foci at (plus/minus ae, 0) where e = root(1 - b squared/a squared). Sum of focal distances = 2a'
      },
      {
        formula: 'Hyperbola: x squared/a squared minus y squared/b squared = 1',
        explanation: 'Standard hyperbola opening left-right',
        examTip: 'Asymptotes: y = plus/minus (b/a) times x. Difference of focal distances = 2a'
      },
      {
        formula: 'Parabola: y squared = 4ax',
        explanation: 'Standard parabola opening right. Focus at (a,0)',
        examTip: 'Directrix: x = -a. Any point on parabola is equidistant from focus and directrix'
      }
    ]
  },
  {
    chapter: 'Vectors',
    subject: 'maths',
    formulas: [
      {
        formula: 'Dot product: a dot b = |a| times |b| times cos(theta)',
        explanation: 'Scalar product. Result is a number',
        examTip: 'If dot product = 0, vectors are perpendicular'
      },
      {
        formula: 'Cross product: |a cross b| = |a| times |b| times sin(theta)',
        explanation: 'Vector product. Result is a vector perpendicular to both',
        examTip: 'Direction by right hand rule. If cross product = 0, vectors are parallel'
      },
      {
        formula: 'a dot b = a1 times b1 + a2 times b2 + a3 times b3',
        explanation: 'Component form of dot product',
        examTip: 'Quick way to find angle: cos(theta) = (a dot b)/(|a| times |b|)'
      },
      {
        formula: 'Projection of a on b = (a dot b) / |b|',
        explanation: 'Scalar projection of vector a onto vector b',
        examTip: 'Vector projection = ((a dot b) / |b| squared) times b'
      }
    ]
  },
  {
    chapter: 'Probability',
    subject: 'maths',
    formulas: [
      {
        formula: 'P(A) = favorable outcomes / total outcomes',
        explanation: 'Basic probability definition. Value between 0 and 1',
        examTip: 'P(A) + P(not A) = 1. P(impossible) = 0, P(certain) = 1'
      },
      {
        formula: 'P(A or B) = P(A) + P(B) minus P(A and B)',
        explanation: 'Addition rule for probability',
        examTip: 'For mutually exclusive events: P(A and B) = 0, so P(A or B) = P(A) + P(B)'
      },
      {
        formula: 'P(A and B) = P(A) times P(B|A)',
        explanation: 'Multiplication rule. P(B|A) is conditional probability',
        examTip: 'For independent events: P(A and B) = P(A) times P(B)'
      },
      {
        formula: 'Bayes theorem: P(A|B) = P(B|A) times P(A) / P(B)',
        explanation: 'Finding reverse conditional probability',
        examTip: 'Useful when you know P(effect|cause) and want P(cause|effect)'
      },
      {
        formula: 'nCr times p power r times q power(n-r)',
        explanation: 'Binomial probability for exactly r successes in n trials',
        examTip: 'p = success probability, q = 1-p. Mean = np, variance = npq'
      }
    ]
  }
];

// ==================== BIOLOGY (NEET) ====================

export const biologyFormulas: ChapterFormulas[] = [
  {
    chapter: 'Cell Biology',
    subject: 'biology',
    formulas: [
      {
        formula: 'Size: Mycoplasma = 0.3 micron, Bacteria = 3-5 micron',
        explanation: 'Relative sizes of cells',
        examTip: 'Human RBC = 7.0 diameter. Ostrich egg = largest isolated single cell'
      },
      {
        formula: 'Ribosomes: Prokaryotic = 70S (50S + 30S)',
        explanation: 'S = Svedberg unit (sedimentation coefficient)',
        examTip: 'Eukaryotic = 80S (60S + 40S). Chloroplast/Mitochondria have 70S'
      },
      {
        formula: 'Mitosis: Interphase (G1 -> S -> G2) -> M Phase',
        explanation: 'Cell cycle sequence. DNA replication in S phase',
        examTip: 'G0 phase is quiescent stage'
      }
    ]
  },
  {
    chapter: 'Plant Physiology',
    subject: 'biology',
    formulas: [
      {
        formula: 'Water Potential = Solute Potential + Pressure Potential',
        explanation: 'Psi(w) = Psi(s) + Psi(p)',
        examTip: 'Pure water Psi(w) = 0 (max)'
      },
      {
        formula: 'RQ = Vol CO2 evolved / Vol O2 consumed',
        explanation: 'Respiratory Quotient',
        examTip: 'Carbs = 1, Fats = 0.7, Proteins = 0.9'
      }
    ]
  },
  {
    chapter: 'Genetics',
    subject: 'biology',
    formulas: [
      {
        formula: 'Phenotype Ratio (Monohybrid) = 3:1',
        explanation: 'F2 generation dominant:recessive',
        examTip: 'Genotype = 1:2:1'
      },
      {
        formula: 'Dihybrid Ratio = 9:3:3:1',
        explanation: 'Independent assortment',
        examTip: 'Test cross = 1:1:1:1'
      },
      {
        formula: 'Hardy-Weinberg: p^2 + 2pq + q^2 = 1',
        explanation: 'Allele equilibrium',
        examTip: 'p+q=1'
      }
    ]
  }
];

// Get all formulas for a subject
export const getFormulasBySubject = (subject: 'physics' | 'chemistry' | 'maths' | 'biology'): ChapterFormulas[] => {
  switch (subject) {
    case 'physics': return physicsFormulas;
    case 'chemistry': return chemistryFormulas;
    case 'maths': return mathsFormulas;
    case 'biology': return biologyFormulas;
    default: return [];
  }
};

// Get all formulas
export const getAllFormulas = (): ChapterFormulas[] => {
  return [...physicsFormulas, ...chemistryFormulas, ...mathsFormulas, ...biologyFormulas];
};
