// JEE Subchapter (Topic) Structure - Coaching Grade
// Each subchapter is the smallest clickable learning unit

import {
  cellBiologySubchapters,
  humanPhysiologySubchapters,
  plantPhysiologySubchapters,
  geneticsSubchapters,
  ecologySubchapters,
  reproductionSubchapters,
  biotechSubchapters,
  animalKingdomSubchapters,
  plantKingdomSubchapters,
  humanHealthSubchapters
} from './biologySubchapters';

import {
  neetChem1Subchapters, neetChem2Subchapters, neetChem3Subchapters,
  neetChem4Subchapters, neetChem5Subchapters, neetChem6Subchapters,
  neetChem7Subchapters, neetChem8Subchapters
} from './neetChemistrySubchapters';

import {
  neetPhy1Subchapters, neetPhy2Subchapters, neetPhy3Subchapters,
  neetPhy4Subchapters, neetPhy5Subchapters, neetPhy6Subchapters
} from './neetPhysicsSubchapters';

export interface Subchapter {
  id: string;
  chapterId: string;
  name: string;
  jeeAsks: string[];        // What JEE asks - short mentor bullets
  pyqFocus: {
    trends: string[];
    patterns: string[];
    traps: string[];
  };
  commonMistakes: string[];
  jeetuLine: string;        // One calm mentor line
}

// ==================== PHYSICS SUBCHAPTERS ====================

export const kinematicsSubchapters: Subchapter[] = [
  {
    id: 'phy-1-1',
    chapterId: 'phy-1',
    name: 'Motion in 1D',
    jeeAsks: [
      'Average vs instantaneous velocity',
      'Sign of displacement vs distance',
      'Equations of motion application',
      'Stopping distance problems'
    ],
    pyqFocus: {
      trends: ['Graph-based questions increasing', 'Conceptual MCQs dominating'],
      patterns: ['Calculate time for given conditions', 'Find displacement when acceleration varies'],
      traps: ['Confusing speed with velocity', 'Missing negative signs in deceleration']
    },
    commonMistakes: [
      'Using v² = u² + 2as when acceleration is not constant',
      'Ignoring direction in vector quantities',
      'Mixing up total distance and displacement'
    ],
    jeetuLine: 'Beta, 1D motion is your foundation. Master signs and directions first.'
  },
  {
    id: 'phy-1-2',
    chapterId: 'phy-1',
    name: 'Motion in 2D',
    jeeAsks: [
      'Component-wise analysis',
      'Resultant velocity/acceleration',
      'Time of flight with components',
      'Vector addition in motion'
    ],
    pyqFocus: {
      trends: ['Questions combining x and y components', 'Inclined plane projections'],
      patterns: ['Split motion into components, solve separately'],
      traps: ['Forgetting to combine components at end', 'Wrong angle reference']
    },
    commonMistakes: [
      'Not treating x and y motion independently',
      'Forgetting that time is same for both components',
      'Wrong resolution of vectors'
    ],
    jeetuLine: 'X alag, Y alag. Time same. Bas itna yaad rakho.'
  },
  {
    id: 'phy-1-3',
    chapterId: 'phy-1',
    name: 'Graphs (x-t, v-t, a-t)',
    jeeAsks: [
      'Slope interpretation',
      'Area under curve meaning',
      'Graph transformations',
      'Reading initial conditions from graph'
    ],
    pyqFocus: {
      trends: ['Post-COVID: 40% questions are graph-based', 'Multi-graph matching'],
      patterns: ['Given one graph, draw another', 'Match graph with motion description'],
      traps: ['Confusing slope with value', 'Missing negative area']
    },
    commonMistakes: [
      'x-t graph slope ≠ acceleration',
      'Area under a-t curve = change in velocity, not velocity',
      'Not checking if graph crosses axis'
    ],
    jeetuLine: 'Graph padho jaise kahani padh rahe ho. Slope aur area tumhare dost hain.'
  },
  {
    id: 'phy-1-4',
    chapterId: 'phy-1',
    name: 'Projectile Motion',
    jeeAsks: [
      'Range, max height, time of flight',
      'Projectile on inclined plane',
      'Horizontal vs oblique projection',
      'Velocity at any point'
    ],
    pyqFocus: {
      trends: ['Incline projectiles are favorite', 'Collision mid-air questions'],
      patterns: ['Find angle for max range', 'Two projectiles meeting in air'],
      traps: ['At max height v ≠ 0, only vy = 0', 'Range formula only for ground-to-ground']
    },
    commonMistakes: [
      'Using range formula for inclined plane',
      'Forgetting horizontal velocity is constant',
      'Wrong sign for g in upward motion'
    ],
    jeetuLine: 'Projectile mein horizontal motion free hai, vertical mein gravity ka drama.'
  },
  {
    id: 'phy-1-5',
    chapterId: 'phy-1',
    name: 'Relative Motion',
    jeeAsks: [
      'Rain-man problems',
      'River-boat crossing',
      'Minimum time vs shortest path',
      'Relative velocity in 2D'
    ],
    pyqFocus: {
      trends: ['Boat-river with current direction', 'Rain appearing vertical'],
      patterns: ['Find angle for shortest path', 'Time to cross with drift'],
      traps: ['Confusing velocity relative to ground vs medium', 'Wrong vector subtraction']
    },
    commonMistakes: [
      'VAB = VA - VB, not VA + VB',
      'Drift calculation errors',
      'Shortest time ≠ shortest path'
    ],
    jeetuLine: 'Apni speed minus uski speed. Simple vector subtraction. Tension mat lo.'
  },
  {
    id: 'phy-1-6',
    chapterId: 'phy-1',
    name: 'Motion Under Gravity',
    jeeAsks: [
      'Free fall from height',
      'Throwing up and catching',
      'Objects dropped from moving bodies',
      'Meeting point of two objects'
    ],
    pyqFocus: {
      trends: ['Two objects released at different times', 'Projectile from tower'],
      patterns: ['Find time when they meet', 'Maximum height reached'],
      traps: ['Direction of g changes sign convention', 'Air resistance ignored unless stated']
    },
    commonMistakes: [
      'Forgetting initial velocity direction',
      'Using g = 10 when g = 9.8 is given',
      'Not setting proper origin point'
    ],
    jeetuLine: 'Gravity hamesha neeche kheenchti hai. Upar jaao ya neeche, g = 9.8 m/s².'
  }
];

export const lawsOfMotionSubchapters: Subchapter[] = [
  {
    id: 'phy-2-1',
    chapterId: 'phy-2',
    name: "Newton's Laws",
    jeeAsks: [
      'First law: inertia examples',
      'Second law: F = ma applications',
      'Third law: action-reaction pairs',
      'Non-inertial frame problems'
    ],
    pyqFocus: {
      trends: ['Conceptual questions on law identification', 'Multi-body systems'],
      patterns: ['Find acceleration of system', 'Identify force pairs'],
      traps: ['Action-reaction on same body confusion', 'Mass vs weight']
    },
    commonMistakes: [
      'Action-reaction pairs act on DIFFERENT bodies',
      'F = ma only in inertial frames',
      'Net force = 0 means constant velocity, not rest'
    ],
    jeetuLine: 'Newton ke teen rules hi poora mechanics hai. Isko pakka karo.'
  },
  {
    id: 'phy-2-2',
    chapterId: 'phy-2',
    name: 'Free Body Diagrams',
    jeeAsks: [
      'Identifying all forces',
      'Normal force direction',
      'Tension in strings',
      'Multiple body FBD'
    ],
    pyqFocus: {
      trends: ['Complex pulley systems', 'Inclined plane with friction'],
      patterns: ['Draw FBD, apply F=ma in each direction'],
      traps: ['Missing a force', 'Wrong direction of friction']
    },
    commonMistakes: [
      'Forgetting normal force on incline',
      'Drawing mg along incline instead of vertically down',
      'Not showing all contact forces'
    ],
    jeetuLine: 'FBD sahi bana, aadha problem solve. Galat FBD = guaranteed wrong answer.'
  },
  {
    id: 'phy-2-3',
    chapterId: 'phy-2',
    name: 'Friction (Static & Kinetic)',
    jeeAsks: [
      'When does block start moving',
      'Friction on incline',
      'Self-adjusting nature of static friction',
      'Friction with applied force at angle'
    ],
    pyqFocus: {
      trends: ['Block on block problems', 'Minimum force to move'],
      patterns: ['Find range of force for equilibrium', 'Acceleration with friction'],
      traps: ['Using μN for static when fs < μsN', 'Friction direction assumption']
    },
    commonMistakes: [
      'fs ≤ μsN, not always equal',
      'Kinetic friction is constant, static adjusts',
      'Friction can act in direction of motion too'
    ],
    jeetuLine: 'Static friction adjust karti hai. Kinetic fix rehti hai. Yahi fark hai.'
  },
  {
    id: 'phy-2-4',
    chapterId: 'phy-2',
    name: 'Circular Motion Dynamics',
    jeeAsks: [
      'Centripetal force source',
      'Banking of roads',
      'Conical pendulum',
      'Death well / rotor problems'
    ],
    pyqFocus: {
      trends: ['Vertical circular motion', 'Minimum speed at top'],
      patterns: ['Find normal force at different points', 'Safe speed range on banked road'],
      traps: ['Centrifugal is pseudo force', 'Speed at top ≠ speed at bottom']
    },
    commonMistakes: [
      'Centripetal force is effect, not a separate force',
      'At top of vertical circle: N + mg = mv²/r',
      'Banking angle independent of mass'
    ],
    jeetuLine: 'Circle mein koi force center ki taraf lagti hai. Usse pehchano, kaam ban jayega.'
  },
  {
    id: 'phy-2-5',
    chapterId: 'phy-2',
    name: 'Pseudo Forces',
    jeeAsks: [
      'When to use pseudo force',
      'Direction of pseudo force',
      'Lift problems',
      'Accelerating vehicle problems'
    ],
    pyqFocus: {
      trends: ['Apparent weight in lift', 'Pendulum in accelerating car'],
      patterns: ['Find effective g in non-inertial frame'],
      traps: ['Pseudo force only in non-inertial frame', 'Direction opposite to acceleration']
    },
    commonMistakes: [
      'Adding pseudo force in inertial frame',
      'Pseudo force = ma, acts opposite to frame acceleration',
      'Forgetting pseudo force on all bodies in frame'
    ],
    jeetuLine: 'Jab frame accelerate kare, pseudo force lagao. Warna Newton naraz.'
  },
  {
    id: 'phy-2-6',
    chapterId: 'phy-2',
    name: 'Constraint Relations',
    jeeAsks: [
      'String constraint',
      'Pulley acceleration relation',
      'Wedge-block constraints',
      'Multiple pulley systems'
    ],
    pyqFocus: {
      trends: ['Complex pulley systems very common', 'Movable pulleys'],
      patterns: ['String length = constant → derive acceleration relation'],
      traps: ['Pulley mass ignored unless stated', 'Direction of acceleration assumption']
    },
    commonMistakes: [
      'For movable pulley: a_load = a_pulley/2',
      'Total string length constant, not just visible part',
      'Assuming all accelerations same in system'
    ],
    jeetuLine: 'String ka total length constant. Isse equation banao, constraint mil jayega.'
  }
];

export const workEnergySubchapters: Subchapter[] = [
  {
    id: 'phy-3-1',
    chapterId: 'phy-3',
    name: 'Work by Constant & Variable Force',
    jeeAsks: [
      'Work = F.s.cosθ applications',
      'Work by gravity, friction, spring',
      'Work from F-x graph',
      'Work in pulling/pushing'
    ],
    pyqFocus: {
      trends: ['Area under F-x curve', 'Work by multiple forces'],
      patterns: ['Find work done in moving from A to B'],
      traps: ['Work can be negative', 'Work by N is usually zero']
    },
    commonMistakes: [
      'Work by friction on system can be positive',
      'Normal force work = 0 only when perpendicular to motion',
      'For variable force: W = ∫F.dx'
    ],
    jeetuLine: 'Work = Force × displacement × cos(angle). Angle 90° ho toh work zero.'
  },
  {
    id: 'phy-3-2',
    chapterId: 'phy-3',
    name: 'Work-Energy Theorem',
    jeeAsks: [
      'Net work = change in KE',
      'Finding final velocity',
      'Work by all forces',
      'Application with friction'
    ],
    pyqFocus: {
      trends: ['Combined with friction problems', 'Multiple forces acting'],
      patterns: ['Find speed after given displacement'],
      traps: ['Use NET work, not just applied force work']
    },
    commonMistakes: [
      'Wnet = ΔKE, not just Wapplied',
      'Forgetting work by friction (negative)',
      'KE is always positive'
    ],
    jeetuLine: 'Total work = kinetic energy ka change. Simple hai, complicate mat karo.'
  },
  {
    id: 'phy-3-3',
    chapterId: 'phy-3',
    name: 'Conservation of Energy',
    jeeAsks: [
      'When to apply energy conservation',
      'PE + KE = constant cases',
      'Non-conservative force effect',
      'Spring-mass energy exchange'
    ],
    pyqFocus: {
      trends: ['Roller coaster type problems', 'Spring on incline'],
      patterns: ['Find velocity at different heights'],
      traps: ['Only for conservative forces', 'Include ALL forms of PE']
    },
    commonMistakes: [
      'Energy conservation fails when friction present',
      'Spring PE + Gravity PE both needed on incline',
      'Reference point for PE matters'
    ],
    jeetuLine: 'Conservative forces mein energy conservation lagao. Friction ho toh nahi.'
  },
  {
    id: 'phy-3-4',
    chapterId: 'phy-3',
    name: 'Potential Energy Curves',
    jeeAsks: [
      'Equilibrium from PE curve',
      'Force from F = -dU/dx',
      'Stable vs unstable equilibrium',
      'Turning points'
    ],
    pyqFocus: {
      trends: ['Graph-based questions', 'Finding equilibrium type'],
      patterns: ['Identify stable, unstable, neutral from curve'],
      traps: ['Minimum PE = stable, Maximum PE = unstable']
    },
    commonMistakes: [
      'F = -dU/dx, not +dU/dx',
      'Turning point where KE = 0',
      'Total mechanical energy line intersects curve at turning points'
    ],
    jeetuLine: 'PE curve ka slope = negative force. Minima stable, maxima unstable.'
  },
  {
    id: 'phy-3-5',
    chapterId: 'phy-3',
    name: 'Collisions (1D & 2D)',
    jeeAsks: [
      'Elastic vs inelastic',
      'Coefficient of restitution',
      'Momentum conservation',
      'Oblique collision'
    ],
    pyqFocus: {
      trends: ['Ball hitting wall at angle', 'Perfectly inelastic collision'],
      patterns: ['Find velocities after collision using e and momentum'],
      traps: ['Momentum conserved always, KE only in elastic']
    },
    commonMistakes: [
      'e = 1 (elastic), e = 0 (perfectly inelastic)',
      'In 2D, apply momentum conservation separately in x and y',
      'Collision along line of impact only'
    ],
    jeetuLine: 'Collision mein momentum hamesha conserved. Energy sirf elastic mein.'
  },
  {
    id: 'phy-3-6',
    chapterId: 'phy-3',
    name: 'Power',
    jeeAsks: [
      'P = dW/dt = F.v',
      'Power vs time graphs',
      'Maximum velocity with power',
      'Average vs instantaneous power'
    ],
    pyqFocus: {
      trends: ['Vehicle climbing with constant power', 'Engine power problems'],
      patterns: ['Find terminal velocity when P = constant'],
      traps: ['At max velocity, a = 0, so P = Fv = fv']
    },
    commonMistakes: [
      'Power = force × velocity (both are vectors, dot product)',
      'Average power = total work / total time',
      'At terminal velocity: driving force = resistance'
    ],
    jeetuLine: 'Power = rate of doing work. Vehicle problems mein P = F.v use karo.'
  }
];

export const rotationalMotionSubchapters: Subchapter[] = [
  {
    id: 'phy-4-1',
    chapterId: 'phy-4',
    name: 'Moment of Inertia',
    jeeAsks: [
      'I for standard shapes',
      'Radius of gyration',
      'Composite body MI',
      'Parallel and perpendicular axis theorems'
    ],
    pyqFocus: {
      trends: ['Composite shapes', 'Cut-out problems'],
      patterns: ['Find MI using integration or theorems'],
      traps: ['Axis location matters', 'Parallel axis: I = Icm + Md²']
    },
    commonMistakes: [
      'Perpendicular axis only for flat bodies',
      'Using wrong standard formula for axis',
      'Forgetting to add/subtract MI for cut shapes'
    ],
    jeetuLine: 'MI = mass distribution from axis. Door ho mass, zyada MI.'
  },
  {
    id: 'phy-4-2',
    chapterId: 'phy-4',
    name: 'Torque & Angular Momentum',
    jeeAsks: [
      'τ = r × F calculations',
      'L = Iω and L = r × p',
      'Conservation of angular momentum',
      'Angular impulse'
    ],
    pyqFocus: {
      trends: ['Ice skater spinning', 'Rotating platform problems'],
      patterns: ['Find final angular velocity when I changes'],
      traps: ['L conserved only when net torque = 0']
    },
    commonMistakes: [
      'Torque about point vs about axis',
      'L = mvr only for point mass at distance r',
      'Direction of L using right hand rule'
    ],
    jeetuLine: 'Angular momentum tabhi conserved jab external torque zero ho.'
  },
  {
    id: 'phy-4-3',
    chapterId: 'phy-4',
    name: 'Rotational Kinematics',
    jeeAsks: [
      'ω, α, θ relations',
      'Angular acceleration problems',
      'Combined rotation and translation',
      'Relating linear and angular quantities'
    ],
    pyqFocus: {
      trends: ['Disc speeding up or slowing down', 'Pulley rotation'],
      patterns: ['Find revolutions before stopping'],
      traps: ['v = rω, a_t = rα for point on rim']
    },
    commonMistakes: [
      'θ = ωt + ½αt² (same as linear)',
      'ω² = ω₀² + 2αθ for constant α',
      'Direction of α matters for speeding up vs slowing down'
    ],
    jeetuLine: 'Linear equations ki tarah hi hai. s → θ, v → ω, a → α.'
  },
  {
    id: 'phy-4-4',
    chapterId: 'phy-4',
    name: 'Rolling Motion',
    jeeAsks: [
      'Pure rolling condition v = ωr',
      'Rolling on incline',
      'Energy in rolling',
      'Friction role in rolling'
    ],
    pyqFocus: {
      trends: ['Race down incline (solid vs hollow)', 'Rolling with slipping'],
      patterns: ['Find acceleration, friction for rolling on incline'],
      traps: ['Pure rolling: friction may be zero', 'KEtotal = KE_trans + KE_rot']
    },
    commonMistakes: [
      'At contact point, v = 0 for pure rolling',
      'Friction provides torque for rolling',
      'Lower MI → faster roll down incline'
    ],
    jeetuLine: 'Rolling = translation + rotation. v = ωr yaad rakho, baaki follow karega.'
  },
  {
    id: 'phy-4-5',
    chapterId: 'phy-4',
    name: 'Toppling vs Sliding',
    jeeAsks: [
      'Critical angle for toppling',
      'When does block slide vs topple',
      'Torque balance for equilibrium',
      'Force application height effect'
    ],
    pyqFocus: {
      trends: ['Block on incline - slide or topple first', 'Force at different heights'],
      patterns: ['Compare limiting friction with toppling torque'],
      traps: ['Narrow base → topples easily', 'Higher force application → more likely to topple']
    },
    commonMistakes: [
      'Toppling when torque about edge > restoring torque',
      'Sliding when F > μN',
      'Check which condition is reached first'
    ],
    jeetuLine: 'Slide ya topple - dono conditions check karo, jo pehle ho wahi answer.'
  }
];

// More subchapters for other physics chapters...
export const gravitationSubchapters: Subchapter[] = [
  {
    id: 'phy-5-1',
    chapterId: 'phy-5',
    name: "Newton's Law of Gravitation",
    jeeAsks: [
      'F = GMm/r² applications',
      'Superposition of gravitational forces',
      'Gravitational force inside shell',
      'Variation of g with height and depth'
    ],
    pyqFocus: {
      trends: ['Force between multiple masses', 'Null point problems'],
      patterns: ['Find point where net gravitational force is zero'],
      traps: ['Inside shell: g = 0', 'Inside Earth: g ∝ r']
    },
    commonMistakes: [
      'G is universal constant, g is acceleration',
      'Inside solid sphere: g = g₀(1 - d/R)',
      'Force is always attractive'
    ],
    jeetuLine: 'G aur g mein confusion mat karo. G constant hai, g jagah ke saath badalta hai.'
  },
  {
    id: 'phy-5-2',
    chapterId: 'phy-5',
    name: 'Gravitational Field & Potential',
    jeeAsks: [
      'E = -dV/dr relation',
      'Potential at a point',
      'Field due to different shapes',
      'Potential energy of system'
    ],
    pyqFocus: {
      trends: ['Graph-based questions', 'Potential inside sphere'],
      patterns: ['Find work done to move mass from A to B'],
      traps: ['V is scalar, E is vector', 'PE of system = sum of all pairs']
    },
    commonMistakes: [
      'V = -GM/r (negative)',
      'E = -dV/dr, not +dV/dr',
      'Work = -ΔPE or Δ(-GMm/r)'
    ],
    jeetuLine: 'Potential negative hai, energy bhi. Isse infinity reference point se samjho.'
  },
  {
    id: 'phy-5-3',
    chapterId: 'phy-5',
    name: 'Orbital Motion & Satellites',
    jeeAsks: [
      'Orbital velocity and period',
      'Geostationary satellite conditions',
      'Satellite energy',
      'Change in orbit problems'
    ],
    pyqFocus: {
      trends: ['Geostationary height calculation', 'Energy to change orbit'],
      patterns: ['Find new period when orbit radius changes'],
      traps: ['E_total = -GMm/2r (negative)', 'T² ∝ r³']
    },
    commonMistakes: [
      'Geostationary: T = 24 hrs, equatorial plane',
      'To go to higher orbit: fire rocket in direction of motion',
      'Total energy = KE + PE = -KE'
    ],
    jeetuLine: 'Satellite problems mein T² ∝ r³ yaad rakho. Baaki formulas isse derive hote hain.'
  },
  {
    id: 'phy-5-4',
    chapterId: 'phy-5',
    name: 'Escape & Orbital Velocity',
    jeeAsks: [
      'Escape velocity derivation',
      'Relation between ve and vo',
      'Escape from different heights',
      'Minimum velocity to reach certain height'
    ],
    pyqFocus: {
      trends: ['ve from Moon vs Earth', 'Escape at angle to surface'],
      patterns: ['Find velocity to reach given height'],
      traps: ['ve = √2 × vo', 'Escape velocity independent of mass']
    },
    commonMistakes: [
      've = √(2gR) = √(2GM/R)',
      'Escape velocity same for all masses',
      'To just escape: KE = |PE|'
    ],
    jeetuLine: 'Escape velocity = √2 × orbital velocity. Yahi relation yaad rakho.'
  },
  {
    id: 'phy-5-5',
    chapterId: 'phy-5',
    name: "Kepler's Laws",
    jeeAsks: [
      'Law of areas (L conservation)',
      'T² ∝ a³ applications',
      'Speed at perihelion vs aphelion',
      'Elliptical orbit problems'
    ],
    pyqFocus: {
      trends: ['Speed ratio at different points', 'Time for half orbit'],
      patterns: ['Apply L = mvr = constant for speed ratio'],
      traps: ['a is semi-major axis', 'Speed maximum at perihelion']
    },
    commonMistakes: [
      'Equal areas in equal times → L conserved',
      'v₁r₁ = v₂r₂ for any two points',
      'T² ∝ a³ works for different planets around same sun'
    ],
    jeetuLine: 'Kepler ke laws angular momentum conservation se aate hain. Physics beautiful hai.'
  }
];

// Electrostatics subchapters
export const electrostaticsSubchapters: Subchapter[] = [
  {
    id: 'phy-8-1',
    chapterId: 'phy-8',
    name: "Coulomb's Law",
    jeeAsks: [
      'Force between charges',
      'Superposition principle',
      'Force in medium',
      'Equilibrium of charges'
    ],
    pyqFocus: {
      trends: ['Three charge equilibrium', 'Force in different media'],
      patterns: ['Find position of third charge for equilibrium'],
      traps: ['Force in medium: F = kq₁q₂/εr²', 'Vector addition for net force']
    },
    commonMistakes: [
      'Force is vector - direction matters',
      'Like charges repel, unlike attract',
      'Equilibrium: net force = 0, check stability'
    ],
    jeetuLine: 'Coulomb = Gravitational wala hi formula hai. Bas charges hain, masses nahi.'
  },
  {
    id: 'phy-8-2',
    chapterId: 'phy-8',
    name: 'Electric Field',
    jeeAsks: [
      'Field due to point charge',
      'Field on axis of dipole, ring, disc',
      'Electric field lines',
      'Motion of charge in field'
    ],
    pyqFocus: {
      trends: ['Field due to combinations', 'Charged particle motion'],
      patterns: ['Superposition to find net field'],
      traps: ['Field lines never cross', 'Field inside conductor = 0']
    },
    commonMistakes: [
      'E is force per unit positive charge',
      'For continuous distribution: integrate',
      'Dipole field: different on axis vs equatorial'
    ],
    jeetuLine: 'Electric field = imaginary force on +1C charge. Simple concept.'
  },
  {
    id: 'phy-8-3',
    chapterId: 'phy-8',
    name: "Gauss's Law",
    jeeAsks: [
      'Flux calculation',
      'Field using Gauss law',
      'Symmetry identification',
      'Field due to infinite line, plane, sphere'
    ],
    pyqFocus: {
      trends: ['Charge distribution with symmetry', 'Flux through surfaces'],
      patterns: ['Choose Gaussian surface wisely'],
      traps: ['Gauss law always valid, but only useful with symmetry']
    },
    commonMistakes: [
      'Flux = ∫E.dA = q_enclosed/ε₀',
      'E ≠ 0 inside Gaussian surface does not mean field is uniform',
      'Gauss surface is imaginary'
    ],
    jeetuLine: 'Symmetry dekho, Gaussian surface choose karo, integration avoid karo.'
  },
  {
    id: 'phy-8-4',
    chapterId: 'phy-8',
    name: 'Electric Potential',
    jeeAsks: [
      'V = kq/r for point charge',
      'Potential due to system of charges',
      'Equipotential surfaces',
      'E = -dV/dr relation'
    ],
    pyqFocus: {
      trends: ['Work done in moving charge', 'Potential inside conductor'],
      patterns: ['Calculate potential at a point, then work = qΔV'],
      traps: ['V is scalar - add algebraically', 'Inside conductor V = constant']
    },
    commonMistakes: [
      'V = work done per unit charge from ∞',
      'Equipotential ⊥ field lines',
      'E points from high V to low V'
    ],
    jeetuLine: 'Potential scalar hai, add karo directly. Field se kaam mushkil ho toh potential use karo.'
  },
  {
    id: 'phy-8-5',
    chapterId: 'phy-8',
    name: 'Capacitors',
    jeeAsks: [
      'C = εA/d for parallel plate',
      'Series and parallel combinations',
      'Energy stored in capacitor',
      'Force between plates'
    ],
    pyqFocus: {
      trends: ['Capacitor networks', 'Energy before/after connection'],
      patterns: ['Equivalent capacitance + energy calculation'],
      traps: ['Series: 1/C = Σ(1/Cᵢ)', 'Charge redistributes when connected']
    },
    commonMistakes: [
      'Parallel: C_eq = ΣCᵢ (opposite of resistance)',
      'U = ½CV² = ½QV = Q²/2C',
      'Battery connected: V constant, Battery removed: Q constant'
    ],
    jeetuLine: 'Capacitor = charge store karta hai. Series mein kam, parallel mein zyada.'
  },
  {
    id: 'phy-8-6',
    chapterId: 'phy-8',
    name: 'Dielectrics',
    jeeAsks: [
      'Capacitance with dielectric',
      'Polarization',
      'Field inside dielectric',
      'Partial dielectric insertion'
    ],
    pyqFocus: {
      trends: ['Dielectric slab insertion', 'Force on dielectric'],
      patterns: ['C with dielectric = KC₀'],
      traps: ['K reduces field inside', 'Partial insertion: treat as series/parallel']
    },
    commonMistakes: [
      'C increases K times with dielectric',
      'E_inside = E_0/K',
      'For partial insertion, use equivalent capacitor method'
    ],
    jeetuLine: 'Dielectric daalo, capacitance badho. K = dielectric constant yaad rakho.'
  }
];

// SHM & Waves subchapters
export const shmWavesSubchapters: Subchapter[] = [
  {
    id: 'phy-6-1',
    chapterId: 'phy-6',
    name: 'Simple Harmonic Motion',
    jeeAsks: [
      'SHM equation and parameters',
      'Phase, amplitude, frequency',
      'Energy in SHM',
      'SHM condition: a ∝ -x'
    ],
    pyqFocus: {
      trends: ['Energy graphs', 'Combination of SHMs'],
      patterns: ['Find amplitude, phase from initial conditions'],
      traps: ['Max velocity at mean position', 'Max acceleration at extremes']
    },
    commonMistakes: [
      'x = A sin(ωt + φ) or A cos(ωt + φ)',
      'v_max = Aω, a_max = Aω²',
      'Total energy = ½kA² = constant'
    ],
    jeetuLine: 'SHM = oscillation jahan acceleration displacement ke opposite aur proportional ho.'
  },
  {
    id: 'phy-6-2',
    chapterId: 'phy-6',
    name: 'Spring-Mass System',
    jeeAsks: [
      'Time period of spring oscillation',
      'Springs in series and parallel',
      'Spring cut into parts',
      'Vertical spring oscillation'
    ],
    pyqFocus: {
      trends: ['Spring combinations', 'Spring on incline'],
      patterns: ['Find equivalent k, then T = 2π√(m/k)'],
      traps: ['Series: 1/k_eq = Σ(1/kᵢ)', 'Cutting spring increases k']
    },
    commonMistakes: [
      'For vertical spring: equilibrium shifts but T unchanged',
      'Spring cut in ratio 1:n → k becomes (n+1)k',
      'Two springs attached to same mass: add forces'
    ],
    jeetuLine: 'T = 2π√(m/k). Spring combinations mein k nikalo, baaki same formula.'
  },
  {
    id: 'phy-6-3',
    chapterId: 'phy-6',
    name: 'Simple Pendulum',
    jeeAsks: [
      'T = 2π√(l/g)',
      'Effective g in different situations',
      'Pendulum in lift, on incline',
      'Second pendulum'
    ],
    pyqFocus: {
      trends: ['Pendulum in accelerating frame', 'Effective length problems'],
      patterns: ['Find g_eff, then use T formula'],
      traps: ['Small angle approximation required', 'Length to CM for physical pendulum']
    },
    commonMistakes: [
      'l is length to CM of bob',
      'In lift going up: g_eff = g + a → T decreases',
      'For large angles, SHM approximation fails'
    ],
    jeetuLine: 'Pendulum mein g badlo toh T badalta hai. Lift mein sochne wale questions aate hain.'
  },
  {
    id: 'phy-6-4',
    chapterId: 'phy-6',
    name: 'Wave Equation & Properties',
    jeeAsks: [
      'y = A sin(kx - ωt) interpretation',
      'Wave velocity v = fλ = ω/k',
      'Particle velocity vs wave velocity',
      'Phase difference'
    ],
    pyqFocus: {
      trends: ['Wave equation analysis', 'Direction of wave'],
      patterns: ['Find speed, direction, particle velocity from equation'],
      traps: ['Particle velocity = ∂y/∂t', 'Phase (kx - ωt) constant for wave front']
    },
    commonMistakes: [
      '(kx - ωt): wave moves +x direction',
      '(kx + ωt): wave moves -x direction',
      'Wave speed ≠ particle speed'
    ],
    jeetuLine: 'Wave equation mein sign dekho - minus means positive direction.'
  },
  {
    id: 'phy-6-5',
    chapterId: 'phy-6',
    name: 'Standing Waves',
    jeeAsks: [
      'Nodes and antinodes positions',
      'Harmonics in strings and pipes',
      'Resonance conditions',
      'End correction'
    ],
    pyqFocus: {
      trends: ['Organ pipe harmonics', 'Sonometer problems'],
      patterns: ['Find frequency of nth harmonic'],
      traps: ['Open pipe: all harmonics', 'Closed pipe: odd harmonics only']
    },
    commonMistakes: [
      'String fixed at both ends: nλ/2 = L',
      'Open pipe: nλ/2 = L (n = 1,2,3...)',
      'Closed pipe: (2n-1)λ/4 = L (n = 1,2,3...)'
    ],
    jeetuLine: 'Standing wave = superposition of two travelling waves. Nodes mein zero displacement.'
  },
  {
    id: 'phy-6-6',
    chapterId: 'phy-6',
    name: 'Beats & Doppler Effect',
    jeeAsks: [
      'Beat frequency = |f₁ - f₂|',
      'Doppler formula',
      'Source/observer moving towards/away',
      'Apparent frequency calculations'
    ],
    pyqFocus: {
      trends: ['Source and observer both moving', 'Reflection Doppler'],
      patterns: ['Use f\' = f(v ± v_o)/(v ∓ v_s)'],
      traps: ['Signs depend on direction', 'For echo: Doppler twice']
    },
    commonMistakes: [
      'Towards: frequency increases',
      'Away: frequency decreases',
      'Beat frequency = difference of frequencies'
    ],
    jeetuLine: 'Doppler mein approach = frequency badho, recede = frequency giro.'
  }
];

// Current Electricity subchapters
export const currentElectricitySubchapters: Subchapter[] = [
  {
    id: 'phy-9-1',
    chapterId: 'phy-9',
    name: "Ohm's Law & Resistance",
    jeeAsks: [
      'V = IR applications',
      'R = ρl/A',
      'Temperature dependence',
      'Resistivity of materials'
    ],
    pyqFocus: {
      trends: ['Temperature coefficient problems', 'Wire stretching'],
      patterns: ['How R changes when wire is stretched/compressed'],
      traps: ['When wire stretched: l increases, A decreases', 'R ∝ l²/V for constant volume']
    },
    commonMistakes: [
      'When wire stretched n times: R becomes n²R',
      'Resistivity is material property, resistance depends on dimensions',
      'R = R₀(1 + αΔT) for temperature change'
    ],
    jeetuLine: 'Ohm ka law basic hai. Wire stretch karo, resistance n² ho jaata hai.'
  },
  {
    id: 'phy-9-2',
    chapterId: 'phy-9',
    name: "Kirchhoff's Laws",
    jeeAsks: [
      'Current law (junction rule)',
      'Voltage law (loop rule)',
      'Multi-loop circuits',
      'Potential at different points'
    ],
    pyqFocus: {
      trends: ['Complex circuits with multiple batteries', 'Finding current direction'],
      patterns: ['Write KCL for junctions, KVL for loops, solve'],
      traps: ['Follow sign convention strictly', 'Assume current directions, signs will correct']
    },
    commonMistakes: [
      'ΣI_in = ΣI_out at junction',
      'ΣV around loop = 0',
      'Going against current: V = +IR, with current: V = -IR'
    ],
    jeetuLine: 'Kirchhoff = charge conservation + energy conservation. Loop likho, solve karo.'
  },
  {
    id: 'phy-9-3',
    chapterId: 'phy-9',
    name: 'Series & Parallel Combinations',
    jeeAsks: [
      'Equivalent resistance',
      'Current distribution in parallel',
      'Voltage division in series',
      'Power dissipation'
    ],
    pyqFocus: {
      trends: ['Complex resistance networks', 'Wheatstone bridge'],
      patterns: ['Simplify step by step, find R_eq'],
      traps: ['Identify balanced Wheatstone bridge', 'Delta-star conversion']
    },
    commonMistakes: [
      'Series: R_eq = ΣRᵢ',
      'Parallel: 1/R_eq = Σ(1/Rᵢ)',
      'In parallel, current divides inversely as R'
    ],
    jeetuLine: 'Complex circuit ko simple banao. Step by step equivalent nikalo.'
  },
  {
    id: 'phy-9-4',
    chapterId: 'phy-9',
    name: 'RC Circuits',
    jeeAsks: [
      'Charging and discharging equations',
      'Time constant τ = RC',
      'Current during charging/discharging',
      'Energy stored vs energy supplied'
    ],
    pyqFocus: {
      trends: ['Charge at given time', 'Current vs time graphs'],
      patterns: ['Use q = q₀(1-e^(-t/τ)) for charging, q = q₀e^(-t/τ) for discharging'],
      traps: ['At t = τ: charge = 63% of final', 'At t = 5τ: charge ≈ 99%']
    },
    commonMistakes: [
      'Initial current = V/R (capacitor acts as short)',
      'Final current = 0 (capacitor fully charged)',
      'Energy lost in resistance = ½CV² during charging'
    ],
    jeetuLine: 'RC circuit mein τ = RC. 5τ ke baad almost fully charged.'
  },
  {
    id: 'phy-9-5',
    chapterId: 'phy-9',
    name: 'Electrical Instruments',
    jeeAsks: [
      'Meter bridge working',
      'Potentiometer applications',
      'Galvanometer conversion',
      'Internal resistance of cell'
    ],
    pyqFocus: {
      trends: ['Potentiometer for EMF comparison', 'Meter bridge errors'],
      patterns: ['Find unknown resistance or EMF using null point'],
      traps: ['Potentiometer: no current at null point', 'End corrections in meter bridge']
    },
    commonMistakes: [
      'Meter bridge: R₁/R₂ = l/(100-l)',
      'Potentiometer: E₁/E₂ = l₁/l₂',
      'Potentiometer is more accurate than voltmeter'
    ],
    jeetuLine: 'Potentiometer null method use karta hai - current zero par measurement.'
  },
  {
    id: 'phy-9-6',
    chapterId: 'phy-9',
    name: 'Heating Effect & Power',
    jeeAsks: [
      'P = I²R = V²/R = VI',
      'Power in series vs parallel',
      'Maximum power transfer',
      'Fuse and safety'
    ],
    pyqFocus: {
      trends: ['Bulb brightness comparison', 'Power dissipation in network'],
      patterns: ['Use appropriate power formula based on what is constant'],
      traps: ['Series: P ∝ R', 'Parallel: P ∝ 1/R (for same V)']
    },
    commonMistakes: [
      'In series (same I): P = I²R, more R → more power',
      'In parallel (same V): P = V²/R, less R → more power',
      'Max power when load R = internal R'
    ],
    jeetuLine: 'Power formula choose karo based on kya constant hai - I ya V.'
  }
];

// Modern Physics subchapters
export const modernPhysicsSubchapters: Subchapter[] = [
  {
    id: 'phy-12-1',
    chapterId: 'phy-12',
    name: 'Photoelectric Effect',
    jeeAsks: [
      'Einstein equation: hν = φ + KEmax',
      'Threshold frequency',
      'Stopping potential',
      'Graph interpretations'
    ],
    pyqFocus: {
      trends: ['Graph-based questions dominant', 'Effect of intensity vs frequency'],
      patterns: ['Find threshold frequency, work function, stopping potential'],
      traps: ['Intensity affects current, not KEmax', 'Below threshold: no emission regardless of intensity']
    },
    commonMistakes: [
      'hν = φ + eV₀ (stopping potential)',
      'Threshold frequency: ν₀ = φ/h',
      'Intensity ∝ number of photons, not energy per photon'
    ],
    jeetuLine: 'Frequency badao → electrons nikle. Intensity badao → zyada electrons nikle.'
  },
  {
    id: 'phy-12-2',
    chapterId: 'phy-12',
    name: 'Bohr Model of Hydrogen',
    jeeAsks: [
      'Energy levels: En = -13.6/n² eV',
      'Transition wavelengths',
      'Radius and velocity in orbit',
      'Series: Lyman, Balmer, etc.'
    ],
    pyqFocus: {
      trends: ['Maximum wavelength in series', 'Ionization energy'],
      patterns: ['Use 1/λ = R(1/n₁² - 1/n₂²)'],
      traps: ['Longest wavelength = smallest energy transition', 'Ionization = n→∞']
    },
    commonMistakes: [
      'Ground state n=1, first excited n=2',
      'Lyman (UV): n→1, Balmer (visible): n→2',
      'rₙ ∝ n², vₙ ∝ 1/n'
    ],
    jeetuLine: 'Bohr model = quantized orbits. Energy -13.6/n² yaad rakho, baaki derive karo.'
  },
  {
    id: 'phy-12-3',
    chapterId: 'phy-12',
    name: 'de Broglie & Wave-Particle Duality',
    jeeAsks: [
      'λ = h/mv = h/p',
      'Wavelength for electron, proton, etc.',
      'Accelerated particle wavelength',
      'Davisson-Germer experiment'
    ],
    pyqFocus: {
      trends: ['Compare wavelengths of different particles', 'Electron accelerated through V'],
      patterns: ['For electron: λ = 12.27/√V Å'],
      traps: ['Heavier particle → shorter wavelength', 'λ = h/√(2mKE)']
    },
    commonMistakes: [
      'Same KE: λ ∝ 1/√m',
      'Same momentum: λ same for all particles',
      'Accelerated electron: λ = h/√(2meV)'
    ],
    jeetuLine: 'Matter bhi wave hai. λ = h/p. Chota particle, bada λ.'
  },
  {
    id: 'phy-12-4',
    chapterId: 'phy-12',
    name: 'X-rays',
    jeeAsks: [
      'Continuous and characteristic X-rays',
      'Minimum wavelength λmin = hc/eV',
      "Moseley's law",
      'X-ray absorption'
    ],
    pyqFocus: {
      trends: ['λmin calculation', 'Effect of target material'],
      patterns: ['Find cutoff wavelength for given voltage'],
      traps: ['λmin depends on V, not target', 'Characteristic depends on target']
    },
    commonMistakes: [
      'Cutoff wavelength: λmin = hc/eV',
      'Increasing V decreases λmin',
      'Characteristic X-ray: specific to element'
    ],
    jeetuLine: 'X-ray mein λmin = hc/eV. Target change karo, characteristic change hoga.'
  },
  {
    id: 'phy-12-5',
    chapterId: 'phy-12',
    name: 'Nuclear Physics & Radioactivity',
    jeeAsks: [
      'Binding energy and stability',
      'α, β, γ decay',
      'Half-life and decay constant',
      'Mass defect'
    ],
    pyqFocus: {
      trends: ['Decay chain problems', 'Age determination'],
      patterns: ['N = N₀e^(-λt) or N = N₀(½)^(t/T₁/₂)'],
      traps: ['After n half-lives: N = N₀/2ⁿ', 'λ = 0.693/T₁/₂']
    },
    commonMistakes: [
      'In α decay: A decreases by 4, Z by 2',
      'In β⁻ decay: Z increases by 1, A unchanged',
      'Binding energy per nucleon highest around Fe'
    ],
    jeetuLine: 'Radioactivity mein half-life formula yaad rakho. N = N₀/2ⁿ for n half-lives.'
  },
  {
    id: 'phy-12-6',
    chapterId: 'phy-12',
    name: 'Semiconductors',
    jeeAsks: [
      'Intrinsic and extrinsic semiconductors',
      'n-type and p-type',
      'p-n junction diode',
      'Transistor basics'
    ],
    pyqFocus: {
      trends: ['Diode characteristics', 'Forward/reverse bias'],
      patterns: ['Identify majority/minority carriers'],
      traps: ['Forward bias: low resistance', 'Reverse bias: high resistance']
    },
    commonMistakes: [
      'n-type: extra electrons (P, As)',
      'p-type: extra holes (B, Al)',
      'Depletion region has no free charges'
    ],
    jeetuLine: 'n-type mein electron majority, p-type mein hole. Diode ek taraf conduct karta hai.'
  }
];

// Optics subchapters
export const opticsSubchapters: Subchapter[] = [
  {
    id: 'phy-11-1',
    chapterId: 'phy-11',
    name: 'Reflection & Mirrors',
    jeeAsks: [
      'Mirror formula: 1/v + 1/u = 1/f',
      'Magnification',
      'Image characteristics',
      'Spherical aberration'
    ],
    pyqFocus: {
      trends: ['Image velocity problems', 'Mirror combinations'],
      patterns: ['Apply mirror formula with sign convention'],
      traps: ['Real image: v negative (concave mirror)', 'Virtual image: v positive']
    },
    commonMistakes: [
      'Sign convention: always from pole',
      'For plane mirror: v = -u',
      'Image velocity = -v²/u² × object velocity'
    ],
    jeetuLine: 'Mirror problems mein sign convention pakka karo. Real = negative, virtual = positive.'
  },
  {
    id: 'phy-11-2',
    chapterId: 'phy-11',
    name: 'Refraction & Lenses',
    jeeAsks: [
      'Snell\'s law: n₁sinθ₁ = n₂sinθ₂',
      'Lens formula: 1/v - 1/u = 1/f',
      'Power of lens',
      'Lens combination'
    ],
    pyqFocus: {
      trends: ['Lens combinations', 'Apparent depth'],
      patterns: ['Apply lens formula with correct signs'],
      traps: ['Converging: f positive', 'Diverging: f negative']
    },
    commonMistakes: [
      'Power = 1/f (f in meters)',
      'Two lenses in contact: P = P₁ + P₂',
      'Apparent depth = real depth / n'
    ],
    jeetuLine: 'Lens mein power = 1/f. Dioptre mein answer chahiye toh f metres mein.'
  },
  {
    id: 'phy-11-3',
    chapterId: 'phy-11',
    name: 'Total Internal Reflection',
    jeeAsks: [
      'Critical angle',
      'Conditions for TIR',
      'Optical fiber',
      'Prism using TIR'
    ],
    pyqFocus: {
      trends: ['Critical angle calculation', 'Light trapped in medium'],
      patterns: ['Find critical angle using sin θc = 1/n'],
      traps: ['TIR only from denser to rarer', 'Angle > critical angle required']
    },
    commonMistakes: [
      'sin θc = n₂/n₁ (n₁ > n₂)',
      'TIR: light must go from denser to rarer',
      'At critical angle, refracted ray grazes surface'
    ],
    jeetuLine: 'TIR = light gets reflected instead of refracted. Dense se rare mein hi hota hai.'
  },
  {
    id: 'phy-11-4',
    chapterId: 'phy-11',
    name: 'Prism & Dispersion',
    jeeAsks: [
      'Prism formula',
      'Minimum deviation',
      'Angular dispersion',
      'Combination of prisms'
    ],
    pyqFocus: {
      trends: ['Minimum deviation condition', 'Achromatic prism'],
      patterns: ['At minimum deviation: r = A/2, δm = 2i - A'],
      traps: ['At δmin, ray passes symmetrically', 'Dispersion depends on wavelength']
    },
    commonMistakes: [
      'For thin prism: δ = (n-1)A',
      'n = sin((A+δm)/2) / sin(A/2)',
      'Violet deviates most (higher n)'
    ],
    jeetuLine: 'Prism mein violet zyada mudta hai kyunki n violet ke liye highest hai.'
  },
  {
    id: 'phy-11-5',
    chapterId: 'phy-11',
    name: 'Interference (YDSE)',
    jeeAsks: [
      'Path difference and phase difference',
      'Fringe width β = λD/d',
      'Maxima and minima positions',
      'Effect of medium, source shift'
    ],
    pyqFocus: {
      trends: ['YDSE variations dominate', 'White light interference'],
      patterns: ['Find fringe width, position of nth bright/dark'],
      traps: ['Central fringe always bright', 'In medium, λ decreases']
    },
    commonMistakes: [
      'Bright: path diff = nλ',
      'Dark: path diff = (2n-1)λ/2',
      'β = λD/d, fringe width ∝ λ'
    ],
    jeetuLine: 'YDSE = constructive and destructive interference. Path difference dekho.'
  },
  {
    id: 'phy-11-6',
    chapterId: 'phy-11',
    name: 'Diffraction & Polarization',
    jeeAsks: [
      'Single slit diffraction',
      'Angular width of central maximum',
      'Malus law for polarization',
      'Brewster angle'
    ],
    pyqFocus: {
      trends: ['Central maximum width', 'Polarization intensity'],
      patterns: ['Apply diffraction formula, Malus law'],
      traps: ['First minimum at sinθ = λ/a', 'Central max is double width']
    },
    commonMistakes: [
      'Angular width of central max = 2λ/a',
      'I = I₀cos²θ (Malus law)',
      'Brewster angle: tan θB = n'
    ],
    jeetuLine: 'Diffraction single slit se, interference double slit se. Dono alag hain.'
  }
];

// Thermodynamics subchapters
export const thermodynamicsSubchapters: Subchapter[] = [
  {
    id: 'phy-7-1',
    chapterId: 'phy-7',
    name: 'First Law of Thermodynamics',
    jeeAsks: [
      'dQ = dU + dW',
      'Work done by/on gas',
      'Sign conventions',
      'Process-wise analysis'
    ],
    pyqFocus: {
      trends: ['PV diagram work calculation', 'Heat absorbed/released'],
      patterns: ['Find W from area under PV curve, then use first law'],
      traps: ['dW = PdV (work by gas)', 'dW positive means expansion']
    },
    commonMistakes: [
      'Work done BY gas = +ve for expansion',
      'Work done ON gas = -ve (compression)',
      'dU depends only on temperature change'
    ],
    jeetuLine: 'First law = energy conservation. Heat = internal energy change + work done.'
  },
  {
    id: 'phy-7-2',
    chapterId: 'phy-7',
    name: 'Thermodynamic Processes',
    jeeAsks: [
      'Isothermal: T constant',
      'Adiabatic: Q = 0',
      'Isobaric: P constant',
      'Isochoric: V constant'
    ],
    pyqFocus: {
      trends: ['PV diagram analysis', 'Slope comparison'],
      patterns: ['Identify process from PV curve, apply specific formula'],
      traps: ['Adiabatic slope > isothermal slope', 'Polytropic process']
    },
    commonMistakes: [
      'Isothermal: W = nRT ln(V₂/V₁)',
      'Adiabatic: TV^(γ-1) = constant',
      'PV^γ = constant for adiabatic'
    ],
    jeetuLine: 'Process identify karo PV curve se. Each has different formula.'
  },
  {
    id: 'phy-7-3',
    chapterId: 'phy-7',
    name: 'Carnot Cycle & Heat Engines',
    jeeAsks: [
      'Carnot efficiency: η = 1 - T₂/T₁',
      'Engine cycle analysis',
      'Work from area of cycle',
      'Refrigerator COP'
    ],
    pyqFocus: {
      trends: ['Efficiency calculations', 'Cycle area = work'],
      patterns: ['Find efficiency, heat absorbed, work done per cycle'],
      traps: ['Use absolute temperatures', 'Carnot is maximum possible efficiency']
    },
    commonMistakes: [
      'η = W/Q₁ = 1 - Q₂/Q₁ = 1 - T₂/T₁',
      'No engine can exceed Carnot efficiency',
      'COP of refrigerator = Q₂/W'
    ],
    jeetuLine: 'Carnot = ideal engine. Real engines have lower efficiency.'
  },
  {
    id: 'phy-7-4',
    chapterId: 'phy-7',
    name: 'Kinetic Theory of Gases',
    jeeAsks: [
      'RMS, average, most probable speeds',
      'Degrees of freedom',
      'Internal energy of ideal gas',
      'Pressure from kinetic theory'
    ],
    pyqFocus: {
      trends: ['Speed ratios at different temperatures', 'Maxwell distribution'],
      patterns: ['Compare speeds of different gases'],
      traps: ['v_rms > v_avg > v_mp', 'P = (1/3)ρv²_rms']
    },
    commonMistakes: [
      'v_rms = √(3RT/M)',
      'v_avg = √(8RT/πM)',
      'v_mp = √(2RT/M)'
    ],
    jeetuLine: 'Gas molecules har direction mein move karte hain. RMS speed use karo mostly.'
  },
  {
    id: 'phy-7-5',
    chapterId: 'phy-7',
    name: 'Specific Heat Capacities',
    jeeAsks: [
      'Cp - Cv = R',
      'γ = Cp/Cv',
      'Molar heat capacities',
      'Heat capacity for processes'
    ],
    pyqFocus: {
      trends: ['γ for different gases', 'Heat capacity in different processes'],
      patterns: ['Use γ to find Cp, Cv'],
      traps: ['For monoatomic: γ = 5/3', 'For diatomic: γ = 7/5']
    },
    commonMistakes: [
      'Monoatomic: Cv = 3R/2, Cp = 5R/2',
      'Diatomic: Cv = 5R/2, Cp = 7R/2',
      'For polytropic process: C = Cv(γ-n)/(1-n)'
    ],
    jeetuLine: 'γ = Cp/Cv. Gas type se γ pata chalta hai. Formulas yaad rakho.'
  }
];

// Magnetism subchapters
export const magnetismSubchapters: Subchapter[] = [
  {
    id: 'phy-10-1',
    chapterId: 'phy-10',
    name: 'Biot-Savart Law',
    jeeAsks: [
      'Magnetic field due to current element',
      'Field due to straight wire',
      'Field at center of loop',
      'Field on axis of coil'
    ],
    pyqFocus: {
      trends: ['Combination of wires', 'Semi-circular current'],
      patterns: ['Use dB = (μ₀/4π)(Idl×r̂)/r²'],
      traps: ['Direction using right-hand rule', 'For infinite wire: B = μ₀I/2πr']
    },
    commonMistakes: [
      'At center of circular loop: B = μ₀I/2R',
      'For semi-circle: half the full loop value',
      'Field direction: curl fingers in current direction, thumb shows B'
    ],
    jeetuLine: 'Biot-Savart = current element se magnetic field. Right hand rule for direction.'
  },
  {
    id: 'phy-10-2',
    chapterId: 'phy-10',
    name: "Ampere's Law",
    jeeAsks: [
      '∮B.dl = μ₀I_enclosed',
      'Field inside/outside solenoid',
      'Field of toroid',
      'Coaxial cable'
    ],
    pyqFocus: {
      trends: ['Solenoid and toroid problems', 'Field variation'],
      patterns: ['Choose Amperian loop wisely'],
      traps: ['Inside solenoid: B = μ₀nI', 'Outside ideal solenoid: B = 0']
    },
    commonMistakes: [
      'Ampere law useful only with symmetry',
      'n = N/L for solenoid',
      'Toroid field only inside, zero outside'
    ],
    jeetuLine: 'Ampere law = magnetic Gauss law. Symmetry mein use karo.'
  },
  {
    id: 'phy-10-3',
    chapterId: 'phy-10',
    name: 'Force on Current & Moving Charge',
    jeeAsks: [
      'F = qv×B for moving charge',
      'F = BIL for current',
      'Circular motion in B field',
      'Cyclotron'
    ],
    pyqFocus: {
      trends: ['Charged particle in magnetic field', 'Combined E and B fields'],
      patterns: ['Find radius of circular path: r = mv/qB'],
      traps: ['Magnetic force does no work', 'Time period independent of speed']
    },
    commonMistakes: [
      'F ⊥ v always, so no work done',
      'T = 2πm/qB (independent of v)',
      'Helical path when v has component along B'
    ],
    jeetuLine: 'Magnetic force velocity ke perpendicular. Work zero, speed constant.'
  },
  {
    id: 'phy-10-4',
    chapterId: 'phy-10',
    name: "Faraday's & Lenz's Laws (EMI)",
    jeeAsks: [
      'ε = -dφ/dt',
      "Lenz's law applications",
      'Motional EMF',
      'Rotating coil in B field'
    ],
    pyqFocus: {
      trends: ['Rod moving in B field', 'Flux change calculations'],
      patterns: ['Find rate of change of flux'],
      traps: ['Lenz: induced current opposes change', 'For rotating coil: ε = NABω sin(ωt)']
    },
    commonMistakes: [
      'Motional EMF = BLv (rod perpendicular to B and v)',
      'Change in area or B or angle causes EMF',
      'Lenz law gives direction, Faraday gives magnitude'
    ],
    jeetuLine: 'EMI = changing flux induces EMF. Lenz law se direction pata chalta hai.'
  },
  {
    id: 'phy-10-5',
    chapterId: 'phy-10',
    name: 'Inductance',
    jeeAsks: [
      'Self inductance L',
      'Mutual inductance M',
      'Energy stored: U = ½LI²',
      'LR circuit time constant'
    ],
    pyqFocus: {
      trends: ['Energy in inductor', 'Growth/decay of current'],
      patterns: ['Find L for given geometry, then use τ = L/R'],
      traps: ['L = Nφ/I', 'At t = τ, current = 63% of final']
    },
    commonMistakes: [
      'For solenoid: L = μ₀n²V',
      'Energy = ½LI² stored in magnetic field',
      'In LR circuit: I = I₀(1 - e^(-t/τ))'
    ],
    jeetuLine: 'Inductor opposes change in current. τ = L/R for LR circuit.'
  },
  {
    id: 'phy-10-6',
    chapterId: 'phy-10',
    name: 'AC Circuits',
    jeeAsks: [
      'Impedance in LCR circuit',
      'Resonance condition',
      'Power factor',
      'Transformer'
    ],
    pyqFocus: {
      trends: ['Series LCR analysis', 'Resonance frequency'],
      patterns: ['Find Z, phase angle, power'],
      traps: ['At resonance: Z = R minimum', 'Power = I²R (average)']
    },
    commonMistakes: [
      'Z = √(R² + (XL - XC)²)',
      'Resonance: XL = XC, ω₀ = 1/√(LC)',
      'Power factor = R/Z = cos φ'
    ],
    jeetuLine: 'AC mein impedance, DC mein resistance. Resonance pe power maximum.'
  }
];

// ==================== CHEMISTRY SUBCHAPTERS ====================

export const moleConceptSubchapters: Subchapter[] = [
  {
    id: 'chem-1-1',
    chapterId: 'chem-1',
    name: 'Mole Concept Basics',
    jeeAsks: [
      'n = mass/M = N/NA',
      'Number of atoms/molecules',
      'At STP volume relations',
      'Molar mass calculations'
    ],
    pyqFocus: {
      trends: ['Direct formula application', 'Multi-step calculations'],
      patterns: ['Convert between mass, moles, number of particles'],
      traps: ['STP: 22.4 L/mol for ideal gas', 'NA = 6.022 × 10²³']
    },
    commonMistakes: [
      'Molecular mass ≠ atomic mass',
      'At STP, all ideal gases occupy 22.4 L/mol',
      '1 mole = NA particles'
    ],
    jeetuLine: 'Mole = Avogadro number particles. Mass se mole, mole se number.'
  },
  {
    id: 'chem-1-2',
    chapterId: 'chem-1',
    name: 'Percentage Composition',
    jeeAsks: [
      '% composition from formula',
      'Empirical formula from %',
      'Molecular formula from empirical',
      'Combustion analysis'
    ],
    pyqFocus: {
      trends: ['Organic compound analysis', 'Determining formulas'],
      patterns: ['% → divide by atomic mass → simplest ratio'],
      traps: ['Molecular formula = n × empirical', 'Check for oxygen by difference']
    },
    commonMistakes: [
      '% of element = (n × atomic mass / molecular mass) × 100',
      'Empirical gives simplest ratio',
      'Need molecular mass for molecular formula'
    ],
    jeetuLine: 'Percentage se empirical formula nikalo. Molecular weight se n nikalo.'
  },
  {
    id: 'chem-1-3',
    chapterId: 'chem-1',
    name: 'Limiting Reagent',
    jeeAsks: [
      'Identify limiting reagent',
      'Calculate product amount',
      'Excess reagent left',
      'Sequential reactions'
    ],
    pyqFocus: {
      trends: ['Multi-step reactions', 'Excess calculation'],
      patterns: ['Find moles of each reactant, compare with stoichiometry'],
      traps: ['Limiting reagent decides product amount', 'Not always the one with less mass']
    },
    commonMistakes: [
      'Divide moles by coefficient to compare',
      'Limiting = smallest ratio',
      'Calculate product from limiting reagent only'
    ],
    jeetuLine: 'Jo pehle khatam ho, wo limiting. Product usse nikalo.'
  },
  {
    id: 'chem-1-4',
    chapterId: 'chem-1',
    name: 'Molarity & Molality',
    jeeAsks: [
      'M = moles/L solution',
      'm = moles/kg solvent',
      'Dilution: M₁V₁ = M₂V₂',
      'Normality and equivalents'
    ],
    pyqFocus: {
      trends: ['Dilution problems', 'Mixing solutions'],
      patterns: ['Apply concentration definitions correctly'],
      traps: ['Molarity changes with temperature', 'Molality doesn\'t']
    },
    commonMistakes: [
      'Molarity = mol/L of solution',
      'Molality = mol/kg of solvent',
      'N = n-factor × M'
    ],
    jeetuLine: 'Molarity mein solution volume, molality mein solvent mass. Fark yaad rakho.'
  },
  {
    id: 'chem-1-5',
    chapterId: 'chem-1',
    name: 'Stoichiometry in Solutions',
    jeeAsks: [
      'Titration calculations',
      'Back titration',
      'Redox stoichiometry',
      'Double indicators'
    ],
    pyqFocus: {
      trends: ['Acid-base titrations', 'Redox titrations'],
      patterns: ['N₁V₁ = N₂V₂ at equivalence'],
      traps: ['n-factor depends on reaction', 'Back titration has two reactions']
    },
    commonMistakes: [
      'At equivalence: equivalents of acid = equivalents of base',
      'n-factor for redox = electrons transferred',
      'Consider all steps in back titration'
    ],
    jeetuLine: 'Titration mein equivalents equal hote hain at end point. N₁V₁ = N₂V₂.'
  }
];

// Atomic Structure subchapters
export const atomicStructureSubchapters: Subchapter[] = [
  {
    id: 'chem-2-1',
    chapterId: 'chem-2',
    name: 'Bohr Model & Hydrogen Spectrum',
    jeeAsks: [
      'Energy of nth orbit',
      'Radius and velocity',
      'Spectral series',
      'Ionization energy'
    ],
    pyqFocus: {
      trends: ['Transition calculations', 'Spectral lines'],
      patterns: ['Use En = -13.6Z²/n² eV'],
      traps: ['Number of lines = n(n-1)/2', 'For H-like: multiply by Z²']
    },
    commonMistakes: [
      'Ground state n=1',
      'rn ∝ n²/Z, En ∝ Z²/n²',
      'Higher n means higher energy (less negative)'
    ],
    jeetuLine: 'Bohr model = quantized orbits. Energy -13.6/n² for hydrogen.'
  },
  {
    id: 'chem-2-2',
    chapterId: 'chem-2',
    name: 'Quantum Numbers',
    jeeAsks: [
      'n, l, m, s values',
      'Shape of orbitals',
      'Maximum electrons in orbital/subshell',
      'Allowed combinations'
    ],
    pyqFocus: {
      trends: ['Valid/invalid quantum sets', 'Orbital identification'],
      patterns: ['Check: l < n, -l ≤ m ≤ +l'],
      traps: ['l = 0,1,2,3 → s,p,d,f', 'Max electrons in subshell = 4l+2']
    },
    commonMistakes: [
      'n = shell, l = subshell shape',
      'm = orientation, s = spin',
      'Each orbital holds max 2 electrons (opposite spin)'
    ],
    jeetuLine: 'Four quantum numbers = complete address of electron. Valid combinations check karo.'
  },
  {
    id: 'chem-2-3',
    chapterId: 'chem-2',
    name: 'Electronic Configuration',
    jeeAsks: [
      'Aufbau principle order',
      'Half-filled stability',
      'Exceptions (Cr, Cu)',
      'Configuration of ions'
    ],
    pyqFocus: {
      trends: ['Exception elements', 'Ion configurations'],
      patterns: ['Fill lowest energy first, check exceptions'],
      traps: ['4s fills before 3d but empties first', 'Cr = [Ar]3d⁵4s¹']
    },
    commonMistakes: [
      'Aufbau: 1s→2s→2p→3s→3p→4s→3d...',
      'Cr, Mo: d⁵s¹ (half-filled stability)',
      'Cu, Ag: d¹⁰s¹ (full d stability)'
    ],
    jeetuLine: 'Configuration mein Cr aur Cu yaad rakho. Half aur full filled stable hai.'
  },
  {
    id: 'chem-2-4',
    chapterId: 'chem-2',
    name: 'Photoelectric Effect & Dual Nature',
    jeeAsks: [
      'Einstein equation',
      'de Broglie wavelength',
      'Threshold frequency',
      'Stopping potential'
    ],
    pyqFocus: {
      trends: ['Graph interpretations', 'Wavelength calculations'],
      patterns: ['hν = φ + KEmax, λ = h/mv'],
      traps: ['Threshold depends on metal', 'λ = h/√(2mKE)']
    },
    commonMistakes: [
      'Below threshold frequency: no emission',
      'Intensity affects number, not energy of electrons',
      'λ ∝ 1/√KE'
    ],
    jeetuLine: 'Photoelectric = particle nature. de Broglie = wave nature. Duality hai.'
  }
];

// ==================== CHEMISTRY SUBCHAPTERS (CONTINUED) ====================

// Chemical Bonding subchapters
export const chemicalBondingSubchapters: Subchapter[] = [
  {
    id: 'chem-3-1',
    chapterId: 'chem-3',
    name: 'Lewis Structures & VSEPR',
    jeeAsks: ['Formal charge calculation', 'Geometry prediction', 'Lone pair effects', 'Hybridization from structure'],
    pyqFocus: { trends: ['Shape prediction', 'Bond angle comparison'], patterns: ['Count electron domains, predict geometry'], traps: ['Lone pairs reduce bond angle', 'VSEPR counts bonding + lone pairs'] },
    commonMistakes: ['Formal charge = V - N - B/2', 'VSEPR uses electron pairs not atoms', 'Lone pairs occupy more space'],
    jeetuLine: 'VSEPR = electron pair repulsion. Lone pairs ka dabav zyada.'
  },
  {
    id: 'chem-3-2',
    chapterId: 'chem-3',
    name: 'Hybridization',
    jeeAsks: ['sp, sp², sp³, sp³d, sp³d² identification', 'Geometry from hybridization', 'Steric number calculation'],
    pyqFocus: { trends: ['Mixed hybridization molecules', 'Exceptions like SF6'], patterns: ['Steric number = atoms + lone pairs'], traps: ['Hybridization ≠ geometry always'] },
    commonMistakes: ['sp³ = tetrahedral geometry', 'sp² = trigonal planar', 'sp = linear'],
    jeetuLine: 'Steric number se hybridization. Geometry shape pe depend karta hai.'
  },
  {
    id: 'chem-3-3',
    chapterId: 'chem-3',
    name: 'Molecular Orbital Theory',
    jeeAsks: ['Bond order calculation', 'Paramagnetic vs diamagnetic', 'MO diagram for O2, N2', 'Stability comparison'],
    pyqFocus: { trends: ['Bond order = (Nb-Na)/2', 'Magnetic properties'], patterns: ['Draw MO diagram, count electrons'], traps: ['O2 has different MO order', 'Higher bond order = more stable'] },
    commonMistakes: ['For O2: σ2p after π2p', 'Unpaired electrons = paramagnetic', 'Bond order 0 = molecule doesnt exist'],
    jeetuLine: 'MOT mein bond order nikalo. Unpaired electrons = paramagnetic.'
  },
  {
    id: 'chem-3-4',
    chapterId: 'chem-3',
    name: 'Dipole Moment & Polarity',
    jeeAsks: ['μ = q × d', 'Vector addition of dipoles', 'Zero dipole symmetric molecules', 'Polar vs nonpolar'],
    pyqFocus: { trends: ['Why CO2 nonpolar, H2O polar', 'Comparing dipole moments'], patterns: ['Check symmetry for net dipole'], traps: ['Symmetric = zero net dipole', 'Lone pairs contribute to dipole'] },
    commonMistakes: ['μ in Debye units', 'Cancel out in symmetric molecules', 'Bond polarity ≠ molecular polarity'],
    jeetuLine: 'Dipole moment vector hai. Symmetric molecules mein cancel ho jata hai.'
  }
];

// Thermodynamics & Thermochemistry subchapters
export const chemThermodynamicsSubchapters: Subchapter[] = [
  {
    id: 'chem-4-1',
    chapterId: 'chem-4',
    name: 'First Law & Enthalpy',
    jeeAsks: ['ΔU = q + w', 'ΔH = ΔU + ΔngRT', 'Heat capacity at constant P and V', 'Work in expansion'],
    pyqFocus: { trends: ['Process identification', 'Work calculation'], patterns: ['Identify state function vs path function'], traps: ['w = -PΔV for expansion', 'ΔH = qp, ΔU = qv'] },
    commonMistakes: ['Sign of work depends on convention', 'ΔH for constant pressure', 'ΔU for constant volume'],
    jeetuLine: 'First law = energy conservation. ΔU = q + w yaad rakho.'
  },
  {
    id: 'chem-4-2',
    chapterId: 'chem-4',
    name: "Hess's Law & Bond Enthalpy",
    jeeAsks: ['Enthalpy from bond energies', "Hess's law application", 'Formation enthalpy', 'Combustion enthalpy'],
    pyqFocus: { trends: ['Using Hess cycle', 'Bond enthalpy calculations'], patterns: ['ΔH = Σ(bonds broken) - Σ(bonds formed)'], traps: ['Standard state matters', 'Formation enthalpy of elements = 0'] },
    commonMistakes: ['Breaking bonds = positive energy', 'Forming bonds = negative energy', 'Use average bond enthalpies'],
    jeetuLine: "Hess law = state function. Kisi bhi path se jao, ΔH same."
  },
  {
    id: 'chem-4-3',
    chapterId: 'chem-4',
    name: 'Entropy & Gibbs Energy',
    jeeAsks: ['ΔS for processes', 'ΔG = ΔH - TΔS', 'Spontaneity criteria', 'ΔG° = -RT ln K'],
    pyqFocus: { trends: ['Spontaneity at different T', 'Equilibrium constant from ΔG'], patterns: ['ΔG < 0 = spontaneous'], traps: ['Entropy increases = +ve ΔS', 'At equilibrium ΔG = 0'] },
    commonMistakes: ['ΔG° ≠ ΔG', 'Temperature in Kelvin', 'Both ΔH and ΔS determine spontaneity'],
    jeetuLine: 'ΔG negative = spontaneous. Temperature ka role check karo.'
  }
];

// Chemical Equilibrium subchapters
export const chemicalEquilibriumSubchapters: Subchapter[] = [
  {
    id: 'chem-5-1',
    chapterId: 'chem-5',
    name: 'Law of Mass Action & Equilibrium Constant',
    jeeAsks: ['Kc and Kp expressions', 'Kp = Kc(RT)^Δn', 'Relation between K and concentration', 'Q vs K comparison'],
    pyqFocus: { trends: ['Calculating K from concentrations', 'Predicting direction'], patterns: ['Q < K: forward, Q > K: backward'], traps: ['Pure solids and liquids not in K expression', 'K changes only with temperature'] },
    commonMistakes: ['K has no units conceptually', 'Include only gases and solutions', 'Coefficients become powers'],
    jeetuLine: 'Q < K = forward. Q > K = backward. Q = K = equilibrium.'
  },
  {
    id: 'chem-5-2',
    chapterId: 'chem-5',
    name: "Le Chatelier's Principle",
    jeeAsks: ['Effect of concentration change', 'Effect of pressure/volume', 'Effect of temperature', 'Catalyst effect'],
    pyqFocus: { trends: ['Predicting shift direction', 'Industrial applications'], patterns: ['System opposes the change'], traps: ['Catalyst doesnt shift equilibrium', 'Inert gas at constant V = no effect'] },
    commonMistakes: ['Pressure affects only when Δn ≠ 0', 'Temperature changes K value', 'Concentration changes Q not K'],
    jeetuLine: 'System change ka oppose karta hai. Le Chatelier simple hai.'
  },
  {
    id: 'chem-5-3',
    chapterId: 'chem-5',
    name: 'Ionic Equilibrium & pH',
    jeeAsks: ['pH = -log[H+]', 'Degree of dissociation', 'Ka × Kb = Kw', 'Common ion effect'],
    pyqFocus: { trends: ['pH calculations', 'Weak acid/base equilibrium'], patterns: ['Use quadratic for concentrated weak electrolytes'], traps: ['At 25°C, Kw = 10^-14', 'pH + pOH = 14'] },
    commonMistakes: ['Strong acids: [H+] = concentration', 'Weak acids: use Ka', 'α = √(Ka/C) for weak acids'],
    jeetuLine: 'pH calculation mein pehle strong ya weak check karo.'
  },
  {
    id: 'chem-5-4',
    chapterId: 'chem-5',
    name: 'Buffer Solutions',
    jeeAsks: ['Henderson equation', 'Buffer capacity', 'pH of buffer', 'Preparation of buffer'],
    pyqFocus: { trends: ['Buffer pH calculations', 'Adding acid/base to buffer'], patterns: ['pH = pKa + log([salt]/[acid])'], traps: ['Buffer capacity max when [acid] = [salt]', 'Buffer resists pH change'] },
    commonMistakes: ['Use Henderson for buffer only', 'Adding strong acid converts weak acid', 'Buffer range = pKa ± 1'],
    jeetuLine: 'Buffer = weak acid + salt. Henderson equation master karo.'
  },
  {
    id: 'chem-5-5',
    chapterId: 'chem-5',
    name: 'Solubility Product',
    jeeAsks: ['Ksp expression', 'Precipitation condition', 'Common ion effect on solubility', 'Selective precipitation'],
    pyqFocus: { trends: ['Ksp calculations', 'Will precipitation occur'], patterns: ['If Q > Ksp, precipitation occurs'], traps: ['Solubility ≠ Ksp', 'Temperature affects Ksp'] },
    commonMistakes: ['Ksp = [ions]^stoichiometry', 'Solubility = s, relate to Ksp', 'Common ion decreases solubility'],
    jeetuLine: 'Q > Ksp = precipitation. Simple comparison hai.'
  }
];

// Electrochemistry subchapters
export const electrochemistrySubchapters: Subchapter[] = [
  {
    id: 'chem-6-1',
    chapterId: 'chem-6',
    name: 'Galvanic Cells & EMF',
    jeeAsks: ['Cell notation', 'Standard electrode potential', 'E°cell = E°cathode - E°anode', 'Spontaneity from E°'],
    pyqFocus: { trends: ['Cell representation', 'Calculating E°cell'], patterns: ['Higher reduction potential = cathode'], traps: ['E° doesnt change with stoichiometry', 'Salt bridge completes circuit'] },
    commonMistakes: ['Anode = oxidation = negative terminal', 'E°cell > 0 = spontaneous', 'Dont multiply E° by n'],
    jeetuLine: 'E°cell positive = spontaneous. Cathode mein reduction.'
  },
  {
    id: 'chem-6-2',
    chapterId: 'chem-6',
    name: 'Nernst Equation',
    jeeAsks: ['E = E° - (RT/nF)ln Q', 'Concentration cell', 'Effect of concentration on E', 'At equilibrium E = 0'],
    pyqFocus: { trends: ['Calculating E at non-standard', 'Concentration cells'], patterns: ['At 25°C: E = E° - (0.059/n)log Q'], traps: ['n = electrons transferred', 'At equilibrium E = 0, Q = K'] },
    commonMistakes: ['Use ln for RT/nF or log for 0.059/n', 'Concentration in mol/L', 'Temperature in Kelvin for RT'],
    jeetuLine: 'Nernst equation se non-standard E nikalo. 0.059/n yaad rakho.'
  },
  {
    id: 'chem-6-3',
    chapterId: 'chem-6',
    name: "Electrolysis & Faraday's Laws",
    jeeAsks: ['m = ZIt', 'Equivalent weight concept', 'Faraday = 96500 C/mol', 'Products of electrolysis'],
    pyqFocus: { trends: ['Mass deposited calculations', 'Time for deposition'], patterns: ['m = (M × I × t)/(n × F)'], traps: ['n = n-factor or electrons', 'Discharge potential matters'] },
    commonMistakes: ['1 Faraday deposits 1 equivalent', 'At cathode: lower reduction potential discharges first', 'Current in Amperes, time in seconds'],
    jeetuLine: 'Faraday laws se mass nikalo. m = ZIt formula use karo.'
  },
  {
    id: 'chem-6-4',
    chapterId: 'chem-6',
    name: 'Conductance & Kohlrausch',
    jeeAsks: ['Λm = κ/c', 'Kohlrausch law', 'Variation with dilution', 'Cell constant'],
    pyqFocus: { trends: ['Limiting molar conductivity', 'Weak electrolyte Λm'], patterns: ['Λm° = λ°+ + λ°-'], traps: ['For weak: use Kohlrausch to find Λm°', 'Conductivity vs conductance'] },
    commonMistakes: ['κ = conductivity, Λ = molar conductivity', 'Weak electrolyte Λm increases sharply on dilution', 'Cell constant = l/A'],
    jeetuLine: 'Kohlrausch law se weak electrolyte ka Λm° nikalo.'
  }
];

// Chemical Kinetics subchapters
export const chemicalKineticsSubchapters: Subchapter[] = [
  {
    id: 'chem-7-1',
    chapterId: 'chem-7',
    name: 'Rate of Reaction & Order',
    jeeAsks: ['Rate = k[A]^n', 'Order from experimental data', 'Molecularity vs order', 'Units of k'],
    pyqFocus: { trends: ['Finding order experimentally', 'Integrated rate laws'], patterns: ['Compare initial rates with concentrations'], traps: ['Order from experiments not equation', 'Molecularity always whole number'] },
    commonMistakes: ['Order can be zero, negative, fraction', 'Molecularity = reactant molecules in RDS', 'Units of k depend on order'],
    jeetuLine: 'Order experimental se, molecularity theoretical. Fark yaad rakho.'
  },
  {
    id: 'chem-7-2',
    chapterId: 'chem-7',
    name: 'Integrated Rate Laws',
    jeeAsks: ['Zero order: [A] = [A]0 - kt', 'First order: ln[A] = ln[A]0 - kt', 'Second order: 1/[A] = 1/[A]0 + kt', 'Half-life expressions'],
    pyqFocus: { trends: ['Graphical determination of order', 'Half-life calculations'], patterns: ['Plot appropriate graph for straight line'], traps: ['First order: t½ independent of concentration', 'Second order: t½ ∝ 1/[A]0'] },
    commonMistakes: ['t½ = 0.693/k for first order', 't½ = 1/(k[A]0) for second order', 'Graph slope gives k'],
    jeetuLine: 'First order ka half-life concentration pe depend nahi karta.'
  },
  {
    id: 'chem-7-3',
    chapterId: 'chem-7',
    name: 'Arrhenius Equation',
    jeeAsks: ['k = Ae^(-Ea/RT)', 'Effect of temperature', 'Activation energy from graph', 'Catalyst effect on Ea'],
    pyqFocus: { trends: ['Calculating Ea from two temperatures', 'ln k vs 1/T graph'], patterns: ['Slope = -Ea/R'], traps: ['Catalyst lowers Ea not ΔH', 'Both forward and reverse Ea lowered'] },
    commonMistakes: ['ln(k2/k1) = (Ea/R)(1/T1 - 1/T2)', 'Higher T = higher k', 'Ea from graph intercept wrong'],
    jeetuLine: 'Arrhenius se Ea nikalo. Temperature badhao, k badhega.'
  }
];

// GOC & Isomerism subchapters
export const gocIsomerismSubchapters: Subchapter[] = [
  {
    id: 'chem-8-1',
    chapterId: 'chem-8',
    name: 'Electronic Effects (I, R, H)',
    jeeAsks: ['+I/-I groups', 'Resonance effect', 'Hyperconjugation', 'Inductive vs resonance'],
    pyqFocus: { trends: ['Stability ordering', 'Acidity/basicity comparison'], patterns: ['Electron donating = +I/+R, withdrawing = -I/-R'], traps: ['+R wins over -I at ortho/para', 'Hyperconjugation = no bond resonance'] },
    commonMistakes: ['+I: alkyl groups', '-I: halogens, NO2, CN', 'Resonance through π system only'],
    jeetuLine: 'I effect through sigma, R effect through pi. Simple hai.'
  },
  {
    id: 'chem-8-2',
    chapterId: 'chem-8',
    name: 'Carbocation & Carbanion Stability',
    jeeAsks: ['Stability order', 'Rearrangements', 'Effect of substituents', 'Resonance stabilization'],
    pyqFocus: { trends: ['Comparing stability', 'Predicting rearrangements'], patterns: ['3° > 2° > 1° for carbocations'], traps: ['Opposite for carbanions', 'Allylic/benzylic extra stable'] },
    commonMistakes: ['Carbocation: +I stabilizes', 'Carbanion: -I stabilizes', 'Resonance > inductive effect'],
    jeetuLine: 'Carbocation mein electron chahiye. Carbanion mein electron hatana hai.'
  },
  {
    id: 'chem-8-3',
    chapterId: 'chem-8',
    name: 'Structural Isomerism',
    jeeAsks: ['Chain isomerism', 'Position isomerism', 'Functional group isomerism', 'Metamerism', 'Tautomerism'],
    pyqFocus: { trends: ['Counting isomers', 'Identifying isomer types'], patterns: ['Draw all possibilities systematically'], traps: ['Tautomers are in equilibrium', 'Metamers have same functional group'] },
    commonMistakes: ['Chain = different carbon skeleton', 'Position = same group different location', 'Functional = different functional group'],
    jeetuLine: 'Structural isomers = same formula, different structure. Count carefully.'
  },
  {
    id: 'chem-8-4',
    chapterId: 'chem-8',
    name: 'Stereoisomerism (E/Z, R/S)',
    jeeAsks: ['Chiral center identification', 'R/S configuration', 'E/Z nomenclature', 'Optical activity'],
    pyqFocus: { trends: ['Assigning configurations', 'Number of stereoisomers'], patterns: ['CIP priority rules'], traps: ['Meso = achiral despite chiral centers', 'E = higher priority groups opposite'] },
    commonMistakes: ['Chiral = 4 different groups', 'R = clockwise with lowest priority back', '2^n stereoisomers for n chiral centers'],
    jeetuLine: 'R/S mein priority assign karo. Lowest priority peeche rakho.'
  }
];

// Hydrocarbons subchapters
export const hydrocarbonsSubchapters: Subchapter[] = [
  {
    id: 'chem-9-1',
    chapterId: 'chem-9',
    name: 'Alkanes',
    jeeAsks: ['Free radical halogenation', 'Combustion', 'Isomerism in alkanes', 'Stability of radicals'],
    pyqFocus: { trends: ['Mechanism of halogenation', 'Product distribution'], patterns: ['3° > 2° > 1° radical stability'], traps: ['Cl2 less selective than Br2', 'Light or heat initiates'] },
    commonMistakes: ['Initiation, propagation, termination', 'Reactivity ≠ selectivity', 'Br2 more selective'],
    jeetuLine: 'Alkane mein free radical mechanism. 3° radical sabse stable.'
  },
  {
    id: 'chem-9-2',
    chapterId: 'chem-9',
    name: 'Alkenes',
    jeeAsks: ['Electrophilic addition', 'Markovnikov rule', 'Anti-Markovnikov', 'Ozonolysis'],
    pyqFocus: { trends: ['Addition mechanism', 'Predicting products'], patterns: ['H adds to C with more H (Markovnikov)'], traps: ['Peroxide effect for HBr only', 'Syn vs anti addition'] },
    commonMistakes: ['Markovnikov = more stable carbocation', 'Anti-Markovnikov with peroxide + HBr', 'Ozonolysis gives carbonyl compounds'],
    jeetuLine: 'Markovnikov = H goes to more H. Simple rule.'
  },
  {
    id: 'chem-9-3',
    chapterId: 'chem-9',
    name: 'Alkynes',
    jeeAsks: ['Acidity of terminal alkynes', 'Addition reactions', 'Reduction to alkene/alkane', 'Metal acetylide formation'],
    pyqFocus: { trends: ['Acidic hydrogen', 'Hydrogenation'], patterns: ['Terminal alkyne + Na/NaNH2'], traps: ['Lindlar catalyst for cis alkene', 'Na/liq NH3 for trans alkene'] },
    commonMistakes: ['Only terminal alkynes are acidic', 'Pd/BaSO4 = Lindlar', 'Complete reduction with excess H2'],
    jeetuLine: 'Terminal alkyne acidic. Lindlar se cis, Birch se trans.'
  },
  {
    id: 'chem-9-4',
    chapterId: 'chem-9',
    name: 'Aromatic Compounds',
    jeeAsks: ['Electrophilic substitution', 'Directing effects', "Huckel's rule", 'Halogenation, nitration, Friedel-Crafts'],
    pyqFocus: { trends: ['ortho/para vs meta directors', 'Reactivity comparison'], patterns: ['+R activators = o/p, -R deactivators = meta'], traps: ['Halogens: deactivating but o/p', 'FC fails with deactivated rings'] },
    commonMistakes: ['-NH2 is strong activator', '-NO2 is strong deactivator', 'Catalyst needed for substitution'],
    jeetuLine: 'Benzene = substitution over addition. Directing effects master karo.'
  }
];

// Organic Reactions subchapters
export const organicReactionsSubchapters: Subchapter[] = [
  {
    id: 'chem-10-1',
    chapterId: 'chem-10',
    name: 'SN1 vs SN2 Reactions',
    jeeAsks: ['Mechanism differences', 'Rate law', 'Stereochemistry', 'Substrate and nucleophile effect'],
    pyqFocus: { trends: ['Predicting mechanism', 'Product stereochemistry'], patterns: ['SN2: 1° + strong Nu, SN1: 3° + weak Nu'], traps: ['SN2 = inversion', 'SN1 = racemization'] },
    commonMistakes: ['SN2 rate = k[substrate][Nu]', 'SN1 rate = k[substrate]', 'Polar aprotic for SN2'],
    jeetuLine: 'SN2 = one step inversion. SN1 = two steps racemization.'
  },
  {
    id: 'chem-10-2',
    chapterId: 'chem-10',
    name: 'E1 vs E2 Reactions',
    jeeAsks: ['Saytzeff vs Hoffman', 'Anti-periplanar requirement', 'Competition with SN', 'Base strength effect'],
    pyqFocus: { trends: ['E2 stereochemistry', 'Saytzeff product'], patterns: ['Strong base + heat = elimination'], traps: ['E2 needs anti arrangement', 'Bulky base gives Hoffman'] },
    commonMistakes: ['E2 = one step, E1 = two steps', 'Saytzeff = more substituted alkene', 'E2 with strong base, E1 with weak'],
    jeetuLine: 'E2 = anti-periplanar compulsory. Saytzeff = more stable alkene.'
  },
  {
    id: 'chem-10-3',
    chapterId: 'chem-10',
    name: 'Named Reactions',
    jeeAsks: ['Aldol, Cannizzaro, Claisen', 'Sandmeyer, Gattermann', 'Wurtz, Kolbe, Reimer-Tiemann', 'Hofmann, Curtius rearrangements'],
    pyqFocus: { trends: ['Product identification', 'Reaction conditions'], patterns: ['Learn reagents and products for each'], traps: ['Crossed aldol with different aldehydes', 'Cannizzaro needs no α-H'] },
    commonMistakes: ['Aldol = α-H required', 'Cannizzaro = no α-H', 'Reagent-specific conditions'],
    jeetuLine: 'Named reactions yaad karo. Reagents aur conditions important.'
  },
  {
    id: 'chem-10-4',
    chapterId: 'chem-10',
    name: 'Oxidation & Reduction',
    jeeAsks: ['Oxidation levels', 'Reagent selection', 'Selective oxidation', 'Clemmensen vs Wolff-Kishner'],
    pyqFocus: { trends: ['Correct reagent for transformation', 'Chemoselective reduction'], patterns: ['Alcohol → aldehyde: PCC, aldehyde → acid: KMnO4'], traps: ['NaBH4 selective for C=O over C=C', 'LiAlH4 reduces almost everything'] },
    commonMistakes: ['PCC = mild oxidation', 'KMnO4 = strong oxidation', 'Clemmensen = acidic, WK = basic'],
    jeetuLine: 'Reagent selection important. Mild ya strong oxidation decide karo.'
  }
];

// Periodic Table subchapters
export const periodicTableSubchapters: Subchapter[] = [
  {
    id: 'chem-11-1',
    chapterId: 'chem-11',
    name: 'Periodic Trends',
    jeeAsks: ['Atomic/ionic radii', 'IE, EA, EN trends', 'Exceptions to trends', 'Diagonal relationship'],
    pyqFocus: { trends: ['Comparing properties', 'Anomalous behavior'], patterns: ['Across period: size ↓, IE ↑, EN ↑'], traps: ['IE: N > O exception', 'EA: Cl > F exception'] },
    commonMistakes: ['Radius decreases across period', 'IE2 > IE1 always', 'Lanthanoid contraction affects post-La elements'],
    jeetuLine: 'Trends yaad karo with exceptions. Exceptions zyada poochte hain.'
  },
  {
    id: 'chem-11-2',
    chapterId: 'chem-11',
    name: 's-Block Elements',
    jeeAsks: ['Alkali and alkaline earth properties', 'Anomalous behavior of Li, Be', 'Compounds of Na, Ca', 'Flame colors'],
    pyqFocus: { trends: ['Diagonal relationships', 'Reactivity order'], patterns: ['Li-Mg, Be-Al diagonal pairs'], traps: ['Li forms nitride directly', 'Be compounds covalent'] },
    commonMistakes: ['Reactivity increases down group', 'Na yellow, K violet flame', 'CaO = quicklite, Ca(OH)2 = slaked lime'],
    jeetuLine: 's-block = reactive metals. Diagonal relationship Li-Mg, Be-Al.'
  },
  {
    id: 'chem-11-3',
    chapterId: 'chem-11',
    name: 'p-Block Elements',
    jeeAsks: ['Group 13-18 properties', 'Oxides, hydrides, halides', 'Allotropy', 'Industrial processes'],
    pyqFocus: { trends: ['Inert pair effect', 'Oxidation state stability'], patterns: ['Down group: lower O.S. more stable'], traps: ['Tl+3 less stable than Tl+', 'Pb4+ less stable than Pb2+'] },
    commonMistakes: ['Inert pair effect = 6s² reluctance', 'Noble gases mostly inert', 'Halogens form interhalogen compounds'],
    jeetuLine: 'Inert pair effect = heavy elements prefer +2 over +4.'
  },
  {
    id: 'chem-11-4',
    chapterId: 'chem-11',
    name: 'd-Block & f-Block',
    jeeAsks: ['Variable oxidation states', 'Color of compounds', 'Magnetic properties', 'Catalytic activity'],
    pyqFocus: { trends: ['Common oxidation states', 'Magnetic moment calculation'], patterns: ['μ = √n(n+2) BM'], traps: ['Zn, Cd, Hg not typical transition', 'Cu+2 more stable than Cu+'] },
    commonMistakes: ['Color due to d-d transitions', 'Paramagnetic = unpaired electrons', 'Lanthanoid contraction = size decrease'],
    jeetuLine: 'd-block = variable oxidation. Color due to d-d transition.'
  }
];

// Coordination Chemistry subchapters
export const coordinationChemSubchapters: Subchapter[] = [
  {
    id: 'chem-12-1',
    chapterId: 'chem-12',
    name: 'Werner Theory & Nomenclature',
    jeeAsks: ['Primary and secondary valency', 'IUPAC naming', 'Coordination number', 'Ligand types'],
    pyqFocus: { trends: ['Naming complexes', 'Identifying structure from name'], patterns: ['Cation before anion, ligands alphabetically'], traps: ['Ligand names: aqua, ammine, cyano', 'Metal oxidation state in Roman numerals'] },
    commonMistakes: ['Primary valency = oxidation state', 'Secondary valency = coordination number', 'Neutral ligands: aqua, ammine'],
    jeetuLine: 'IUPAC nomenclature practice karo. Ligand names important.'
  },
  {
    id: 'chem-12-2',
    chapterId: 'chem-12',
    name: 'Isomerism in Complexes',
    jeeAsks: ['Geometrical isomerism', 'Optical isomerism', 'Linkage isomerism', 'Ionization isomerism'],
    pyqFocus: { trends: ['cis-trans identification', 'Counting isomers'], patterns: ['Square planar: Ma2b2 has cis-trans'], traps: ['Tetrahedral rarely shows GI', 'Octahedral with 3 pairs can show'] },
    commonMistakes: ['cis = same side, trans = opposite', 'Optical activity needs non-superimposable mirror', 'Count all possible arrangements'],
    jeetuLine: 'Coordination isomerism types yaad karo. Geometry se isomer count karo.'
  },
  {
    id: 'chem-12-3',
    chapterId: 'chem-12',
    name: 'Crystal Field Theory',
    jeeAsks: ['Splitting in octahedral/tetrahedral', 'CFSE calculation', 'Color explanation', 'Spectrochemical series'],
    pyqFocus: { trends: ['Δo vs Δt', 'High spin vs low spin'], patterns: ['Strong field = low spin = paired electrons'], traps: ['Δt = 4/9 Δo', 'Tetrahedral always high spin'] },
    commonMistakes: ['Octahedral: t2g lower than eg', 'Tetrahedral: e lower than t2', 'CFSE = (-0.4n₁ + 0.6n₂)Δo'],
    jeetuLine: 'CFT = electrostatic splitting. Strong field ligand = low spin.'
  },
  {
    id: 'chem-12-4',
    chapterId: 'chem-12',
    name: 'Magnetic & Spectral Properties',
    jeeAsks: ['Spin-only magnetic moment', 'Color and d-d transitions', 'Diamagnetic vs paramagnetic', 'Stability of complexes'],
    pyqFocus: { trends: ['Calculating μ from unpaired electrons', 'Predicting color'], patterns: ['μ = √n(n+2) BM'], traps: ['Color observed = complementary absorbed', 'All paired = diamagnetic'] },
    commonMistakes: ['μ for Cu2+ (1 unpaired) = 1.73 BM', 'Fe3+ high spin = 5 unpaired', 'Strong field changes spin state'],
    jeetuLine: 'Magnetic moment se unpaired electrons nikalo. Formula simple hai.'
  }
];

// ==================== MATHEMATICS SUBCHAPTERS ====================

// Quadratic Equations subchapters
export const quadraticSubchapters: Subchapter[] = [
  {
    id: 'math-1-1',
    chapterId: 'math-1',
    name: 'Nature of Roots',
    jeeAsks: ['Discriminant D = b²-4ac', 'Real, equal, imaginary roots', 'Condition for common roots', 'Graph of quadratic'],
    pyqFocus: { trends: ['D based questions', 'Root conditions'], patterns: ['D > 0 real distinct, D = 0 equal, D < 0 imaginary'], traps: ['D = 0 means touching x-axis', 'Complex roots in conjugate pairs'] },
    commonMistakes: ['D for nature, not value of roots', 'a > 0 opens upward', 'Roots real ≠ roots positive'],
    jeetuLine: 'D se nature, -b/a se sum, c/a se product. Basic formula.'
  },
  {
    id: 'math-1-2',
    chapterId: 'math-1',
    name: 'Relation Between Roots & Coefficients',
    jeeAsks: ['Sum = -b/a, Product = c/a', 'Forming equation from roots', 'Symmetric functions of roots', 'Transform equations'],
    pyqFocus: { trends: ['Finding expressions in α, β', 'New equation with modified roots'], patterns: ['α + β = -b/a, αβ = c/a'], traps: ['For α², β² use (α+β)² - 2αβ', 'Equation: x² - (sum)x + product = 0'] },
    commonMistakes: ['Know identities: α² + β², α³ + β³', 'If roots are 1/α, 1/β reverse coefficients', 'Signs matter in -b/a'],
    jeetuLine: 'α + β = -b/a yaad rakho. Baki sab derive ho jayega.'
  },
  {
    id: 'math-1-3',
    chapterId: 'math-1',
    name: 'Location of Roots',
    jeeAsks: ['Roots in interval', 'Both roots positive/negative', 'Roots on either side', 'Exactly one root in interval'],
    pyqFocus: { trends: ['Conditions for roots in range', 'Sign analysis'], patterns: ['f(a)·f(b) < 0 for root between a, b'], traps: ['Need D ≥ 0 as well', 'Sum and product conditions together'] },
    commonMistakes: ['Both positive: sum > 0, product > 0, D ≥ 0', 'Both negative: sum < 0, product > 0, D ≥ 0', 'Check vertex position too'],
    jeetuLine: 'Location problems mein conditions dhyan se check karo.'
  },
  {
    id: 'math-1-4',
    chapterId: 'math-1',
    name: 'Maximum & Minimum of Quadratic',
    jeeAsks: ['Vertex = (-b/2a, -D/4a)', 'Range of quadratic', 'Maximum/minimum value', 'Quadratic inequalities'],
    pyqFocus: { trends: ['Range finding', 'Optimization'], patterns: ['a > 0: min at vertex, a < 0: max at vertex'], traps: ['Range depends on domain', 'Completing square helps'] },
    commonMistakes: ['Vertex at x = -b/2a', 'Value at vertex = -D/4a', 'For closed interval check endpoints too'],
    jeetuLine: 'Vertex pe extreme value. a positive = minima, negative = maxima.'
  }
];

// Complex Numbers subchapters
export const complexSubchapters: Subchapter[] = [
  {
    id: 'math-2-1',
    chapterId: 'math-2',
    name: 'Algebra of Complex Numbers',
    jeeAsks: ['Addition, multiplication', 'Conjugate properties', 'Division', 'Powers of i'],
    pyqFocus: { trends: ['Simplification', 'Conjugate in denominator'], patterns: ['i² = -1, i³ = -i, i⁴ = 1'], traps: ['Multiply by conjugate to rationalize', '|z|² = z·z̄'] },
    commonMistakes: ['i⁴ⁿ = 1', 'Conjugate of sum = sum of conjugates', 'Real part: (z + z̄)/2'],
    jeetuLine: 'i ke powers cyclic hain. i⁴ = 1 yaad rakho.'
  },
  {
    id: 'math-2-2',
    chapterId: 'math-2',
    name: 'Modulus & Argument',
    jeeAsks: ['|z| = √(x² + y²)', 'arg(z) = tan⁻¹(y/x)', 'Polar form', 'Triangle inequality'],
    pyqFocus: { trends: ['Argument calculation', 'Modulus properties'], patterns: ['|z₁z₂| = |z₁||z₂|, arg(z₁z₂) = arg z₁ + arg z₂'], traps: ['Argument depends on quadrant', '|z₁ + z₂| ≤ |z₁| + |z₂|'] },
    commonMistakes: ['Principal argument ∈ (-π, π]', 'arg(z̄) = -arg(z)', '|z| = 0 iff z = 0'],
    jeetuLine: 'Modulus = distance from origin. Argument = angle with positive x-axis.'
  },
  {
    id: 'math-2-3',
    chapterId: 'math-2',
    name: "De Moivre's Theorem & Roots",
    jeeAsks: ['(cos θ + i sin θ)ⁿ', 'nth roots of unity', 'Cube roots of unity properties', 'Roots on unit circle'],
    pyqFocus: { trends: ['Finding nth roots', 'Roots of unity sum'], patterns: ['ω = e^(2πi/n), 1 + ω + ω² + ... = 0'], traps: ['Cube roots: 1, ω, ω² where 1 + ω + ω² = 0', 'Roots equally spaced on circle'] },
    commonMistakes: ['Roots have modulus 1', 'Sum of nth roots = 0', 'ω³ = 1, ω² = ω̄'],
    jeetuLine: 'De Moivre = (r∠θ)ⁿ = rⁿ∠nθ. Roots of unity symmetric on circle.'
  },
  {
    id: 'math-2-4',
    chapterId: 'math-2',
    name: 'Geometry in Complex Plane',
    jeeAsks: ['Locus problems', 'Rotation', 'Distance and angle', 'Circle and line equations'],
    pyqFocus: { trends: ['Locus of |z - a| = r', 'Transformation z → f(z)'], patterns: ['|z - a| = r is circle center a, radius r'], traps: ['Rotation by α: z\' = z·e^(iα)', 'arg(z - a) = θ is ray'] },
    commonMistakes: ['|z - z₁| = |z - z₂| is perpendicular bisector', '|z - a|/|z - b| = k is circle (k ≠ 1)', 'Put z = x + iy for locus'],
    jeetuLine: 'Complex plane mein geometry easy hai. Modulus = distance, argument = angle.'
  }
];

// Matrices & Determinants subchapters
export const matricesSubchapters: Subchapter[] = [
  {
    id: 'math-3-1',
    chapterId: 'math-3',
    name: 'Matrix Operations',
    jeeAsks: ['Addition, multiplication', 'Transpose properties', 'Matrix types', 'Powers of matrix'],
    pyqFocus: { trends: ['Finding A² or Aⁿ', 'Symmetric/skew-symmetric'], patterns: ['(AB)ᵀ = BᵀAᵀ', '(AB)⁻¹ = B⁻¹A⁻¹'], traps: ['AB ≠ BA in general', 'Multiplication needs compatible dimensions'] },
    commonMistakes: ['Order matters in multiplication', 'Any matrix = symmetric + skew-symmetric parts', 'Null matrix: A·0 = 0, but AB = 0 doesnt mean A = 0 or B = 0'],
    jeetuLine: 'Matrix multiplication mein order change mat karo. AB ≠ BA mostly.'
  },
  {
    id: 'math-3-2',
    chapterId: 'math-3',
    name: 'Determinants',
    jeeAsks: ['Expansion by row/column', 'Properties of determinants', 'Area using determinants', 'Cofactor expansion'],
    pyqFocus: { trends: ['Using properties to simplify', 'Row/column operations'], patterns: ['R₁ ↔ R₂ changes sign', 'kR₁ multiplies det by k'], traps: ['|AB| = |A||B|', 'Row operations: R₁ + kR₂ doesnt change det'] },
    commonMistakes: ['det of transpose = det of original', 'If row/column zero, det = 0', 'For upper/lower triangular: product of diagonal'],
    jeetuLine: 'Determinant = signed volume concept. Properties use karke simplify karo.'
  },
  {
    id: 'math-3-3',
    chapterId: 'math-3',
    name: 'Inverse of Matrix',
    jeeAsks: ['A⁻¹ = adj(A)/|A|', 'Adjoint properties', 'Inverse of product', 'Finding inverse'],
    pyqFocus: { trends: ['Calculating inverse', '|adj A| = |A|ⁿ⁻¹'], patterns: ['A·adj(A) = |A|I'], traps: ['Inverse exists iff |A| ≠ 0', 'adj(AB) = adj(B)·adj(A)'] },
    commonMistakes: ['(A⁻¹)⁻¹ = A', '|A⁻¹| = 1/|A|', 'For 2×2: swap diagonal, negate off-diagonal, divide by det'],
    jeetuLine: 'Inverse = adjoint / determinant. |A| = 0 means no inverse.'
  },
  {
    id: 'math-3-4',
    chapterId: 'math-3',
    name: 'System of Linear Equations',
    jeeAsks: ['Cramer\'s rule', 'Consistency conditions', 'Homogeneous systems', 'Rank method'],
    pyqFocus: { trends: ['Finding consistency', 'Infinite solutions condition'], patterns: ['|A| = 0 for non-trivial solution in homogeneous'], traps: ['Consistent: at least one solution', 'Homogeneous always has trivial solution'] },
    commonMistakes: ['Unique solution: |A| ≠ 0', 'Infinite solutions: |A| = 0 and all Dᵢ = 0 (for non-homogeneous)', 'No solution: |A| = 0 and some Dᵢ ≠ 0'],
    jeetuLine: 'System of equations mein pehle |A| check karo.'
  }
];

// Permutations & Combinations subchapters
export const permutationsSubchapters: Subchapter[] = [
  {
    id: 'math-4-1',
    chapterId: 'math-4',
    name: 'Fundamental Principles',
    jeeAsks: ['Addition principle', 'Multiplication principle', 'Counting with restrictions', 'Complementary counting'],
    pyqFocus: { trends: ['Multi-stage counting', 'OR = add, AND = multiply'], patterns: ['Independent choices multiply'], traps: ['Subtract overcounted cases', 'Sometimes complementary counting easier'] },
    commonMistakes: ['Either-or = add', 'And-then = multiply', 'Total - unwanted = wanted'],
    jeetuLine: 'OR = add, AND = multiply. Basic counting principle.'
  },
  {
    id: 'math-4-2',
    chapterId: 'math-4',
    name: 'Permutations',
    jeeAsks: ['nPr = n!/(n-r)!', 'Arrangements with repetition', 'Arrangements of identical objects', 'Circular arrangements'],
    pyqFocus: { trends: ['Word arrangements', 'Restricted arrangements'], patterns: ['With repetition: n!/p!q!...'], traps: ['Circular = (n-1)!', 'Identical objects reduce count'] },
    commonMistakes: ['Linear ≠ circular', 'MISSISSIPPI = 11!/(4!4!2!)', 'Beads on necklace = (n-1)!/2 (flip symmetry)'],
    jeetuLine: 'Permutation = order matters. Identical objects mein divide karo.'
  },
  {
    id: 'math-4-3',
    chapterId: 'math-4',
    name: 'Combinations',
    jeeAsks: ['nCr = n!/r!(n-r)!', 'Selection problems', 'Committee formation', 'Distribution into groups'],
    pyqFocus: { trends: ['Selection with conditions', 'At least one type'], patterns: ['nCr = nC(n-r)'], traps: ['Groups of equal size divide further', 'With restrictions: casework'] },
    commonMistakes: ['Selection order doesnt matter', 'Identical groups: divide by k!', 'At least 1 = total - none'],
    jeetuLine: 'Combination = selection. Order matter nahi karta.'
  },
  {
    id: 'math-4-4',
    chapterId: 'math-4',
    name: 'Distribution & Derangements',
    jeeAsks: ['Distinct to distinct boxes', 'Identical to distinct boxes', 'Derangement formula', 'Partition problems'],
    pyqFocus: { trends: ['Distribution problems', 'No one gets their own'], patterns: ['Identical to distinct = stars and bars'], traps: ['Dn = n!(1 - 1/1! + 1/2! - ...)', 'At least one empty uses inclusion-exclusion'] },
    commonMistakes: ['n identical → k distinct (each ≥0): (n+k-1)C(k-1)', 'n distinct → k distinct: k^n', 'Derangement = permutation with no fixed points'],
    jeetuLine: 'Distribution problems mein identical vs distinct dhyan do.'
  }
];

// Probability subchapters
export const probabilitySubchapters: Subchapter[] = [
  {
    id: 'math-5-1',
    chapterId: 'math-5',
    name: 'Basic Probability',
    jeeAsks: ['P(A) = n(A)/n(S)', 'Addition theorem', 'Complementary events', 'Sample space'],
    pyqFocus: { trends: ['Card, dice, coin problems', 'Venn diagram based'], patterns: ['P(A∪B) = P(A) + P(B) - P(A∩B)'], traps: ['Mutually exclusive: P(A∩B) = 0', 'Sample space must be exhaustive'] },
    commonMistakes: ['0 ≤ P(A) ≤ 1', 'P(A\') = 1 - P(A)', 'Equally likely outcomes assumption'],
    jeetuLine: 'Basic probability = favorable/total. Equally likely check karo.'
  },
  {
    id: 'math-5-2',
    chapterId: 'math-5',
    name: 'Conditional Probability',
    jeeAsks: ['P(A|B) = P(A∩B)/P(B)', 'Multiplication theorem', 'Independent events', 'Tree diagrams'],
    pyqFocus: { trends: ['Multi-stage experiments', 'Bag problems'], patterns: ['P(A∩B) = P(A)·P(B|A)'], traps: ['Independent: P(A|B) = P(A)', 'Conditional changes sample space'] },
    commonMistakes: ['P(A|B) ≠ P(B|A)', 'Independent ≠ mutually exclusive', 'Total probability before Bayes'],
    jeetuLine: 'Conditional probability = reduced sample space. P(A|B) mein B pehle ho chuka.'
  },
  {
    id: 'math-5-3',
    chapterId: 'math-5',
    name: "Bayes' Theorem",
    jeeAsks: ['P(A|B) = P(B|A)P(A)/P(B)', 'Reversing conditional', 'Total probability theorem', 'Updating probability'],
    pyqFocus: { trends: ['Disease testing', 'Quality control'], patterns: ['First find P(B) using total probability'], traps: ['Denominator = sum over all cases', 'Prior vs posterior probability'] },
    commonMistakes: ['Total probability: P(B) = ΣP(B|Aᵢ)P(Aᵢ)', 'Bayes reverses given and target', 'Partition of sample space needed'],
    jeetuLine: 'Bayes = reverse probability. Total probability pehle, Bayes baad mein.'
  },
  {
    id: 'math-5-4',
    chapterId: 'math-5',
    name: 'Binomial Distribution',
    jeeAsks: ['P(X=r) = nCr p^r q^(n-r)', 'Mean = np', 'Variance = npq', 'Most probable value'],
    pyqFocus: { trends: ['Exactly r successes', 'At least/at most'], patterns: ['n fixed independent trials'], traps: ['Only two outcomes per trial', 'Most probable where P(X=r) max'] },
    commonMistakes: ['q = 1-p', 'E(X) = np, Var(X) = npq', 'For maximum P(X=r): compare consecutive terms'],
    jeetuLine: 'Binomial = n independent trials. Mean = np yaad rakho.'
  }
];

// Limits, Continuity & Differentiability subchapters  
export const limitsSubchapters: Subchapter[] = [
  {
    id: 'math-6-1',
    chapterId: 'math-6',
    name: 'Standard Limits',
    jeeAsks: ['lim(x→0) sinx/x', 'lim(x→0) (1+x)^(1/x)', 'lim(x→0) (e^x-1)/x', '0/0, ∞/∞ forms'],
    pyqFocus: { trends: ['Evaluating limits', 'Standard forms'], patterns: ['sin x/x → 1, (1+1/n)^n → e'], traps: ['Check form before applying rule', 'lim x→0 tanx/x = 1'] },
    commonMistakes: ['sin x ≈ x for small x', 'ln(1+x) ≈ x for small x', 'e^x - 1 ≈ x for small x'],
    jeetuLine: 'Standard limits yaad karo. sinx/x = 1 most important.'
  },
  {
    id: 'math-6-2',
    chapterId: 'math-6',
    name: "L'Hôpital's Rule",
    jeeAsks: ['0/0 and ∞/∞ forms', 'When to apply', 'Multiple applications', 'Converting to 0/0'],
    pyqFocus: { trends: ['Indeterminate forms', 'Complex limits'], patterns: ['Differentiate numerator and denominator separately'], traps: ['Only for 0/0 or ∞/∞', 'May need to apply multiple times'] },
    commonMistakes: ['Not quotient rule, differentiate separately', 'Convert 0·∞, ∞-∞ to quotient form', 'Check form exists after each application'],
    jeetuLine: "L'Hôpital = 0/0 ya ∞/∞ mein upar neeche separately differentiate."
  },
  {
    id: 'math-6-3',
    chapterId: 'math-6',
    name: 'Continuity',
    jeeAsks: ['LHL = RHL = f(a)', 'Types of discontinuity', 'Continuity in interval', 'Intermediate value theorem'],
    pyqFocus: { trends: ['Finding value for continuity', 'Discontinuity type'], patterns: ['Check limit exists and equals function value'], traps: ['Removable if limit exists but ≠ f(a)', 'Jump if LHL ≠ RHL'] },
    commonMistakes: ['Continuous at a: limit at a = f(a)', 'Jump discontinuity: LHL ≠ RHL', 'Essential: limit doesnt exist'],
    jeetuLine: 'Continuous = no break. LHL = RHL = f(a) check karo.'
  },
  {
    id: 'math-6-4',
    chapterId: 'math-6',
    name: 'Differentiability',
    jeeAsks: ['LHD = RHD', 'Differentiable ⇒ continuous', 'Points of non-differentiability', 'Corner and cusp'],
    pyqFocus: { trends: ['Finding points of non-diff', 'Graphical identification'], patterns: ['Check f\'(a⁻) = f\'(a⁺)'], traps: ['Differentiable ⇒ continuous (not converse)', '|x| not diff at 0'] },
    commonMistakes: ['Continuous at corner but not differentiable', 'Cusp: infinite derivative', 'Vertical tangent = not differentiable'],
    jeetuLine: 'Differentiable means smooth curve. Sharp corner = not differentiable.'
  }
];

// Differentiation subchapters
export const differentiationSubchapters: Subchapter[] = [
  {
    id: 'math-7-1',
    chapterId: 'math-7',
    name: 'Standard Derivatives',
    jeeAsks: ['Power rule', 'Trig derivatives', 'Exponential/log derivatives', 'Chain rule'],
    pyqFocus: { trends: ['Composite function derivatives', 'Inverse trig derivatives'], patterns: ['d/dx(xⁿ) = nxⁿ⁻¹'], traps: ['Chain rule for composition', 'd/dx(ln u) = (1/u)(du/dx)'] },
    commonMistakes: ['d/dx(sin x) = cos x', 'd/dx(cos x) = -sin x', 'd/dx(tan x) = sec²x'],
    jeetuLine: 'Standard derivatives table yaad karo. Chain rule important.'
  },
  {
    id: 'math-7-2',
    chapterId: 'math-7',
    name: 'Implicit & Parametric Differentiation',
    jeeAsks: ['dy/dx from F(x,y) = 0', 'Parametric: dy/dx = (dy/dt)/(dx/dt)', 'Second derivatives', 'Applications'],
    pyqFocus: { trends: ['Finding dy/dx', 'Curve problems'], patterns: ['Differentiate both sides, solve for dy/dx'], traps: ['y is function of x in implicit', 'd²y/dx² needs quotient rule'] },
    commonMistakes: ['Implicit: d(y²)/dx = 2y(dy/dx)', 'Parametric: divide dy/dt by dx/dt', 'For d²y/dx², differentiate dy/dx w.r.t. x'],
    jeetuLine: 'Implicit mein y ko x ka function maan ke differentiate karo.'
  },
  {
    id: 'math-7-3',
    chapterId: 'math-7',
    name: 'Logarithmic Differentiation',
    jeeAsks: ['When to use', 'y = f(x)^g(x)', 'Products/quotients', 'Simplifying complex functions'],
    pyqFocus: { trends: ['Variable base and exponent', 'Long products'], patterns: ['Take ln, differentiate, multiply by y'], traps: ['Remember to multiply by y at end', 'Useful for y = u·v·w type'] },
    commonMistakes: ['ln(y) = g(x)·ln(f(x))', 'y\'/y = derivative of ln(y)', 'Works for any complicated product/quotient'],
    jeetuLine: 'Variable power mein log le lo. Baaki easy ho jayega.'
  },
  {
    id: 'math-7-4',
    chapterId: 'math-7',
    name: 'Higher Order Derivatives',
    jeeAsks: ['Second derivative', 'd²y/dx² interpretation', 'nth derivative patterns', 'Leibniz formula'],
    pyqFocus: { trends: ['Finding y\'\'', 'Pattern in nth derivative'], patterns: ['Differentiate again and again'], traps: ['Parametric d²y/dx² is not (d²y/dt²)/(d²x/dt²)', 'Look for pattern in repeated diff'] },
    commonMistakes: ['d²y/dx² = d/dx(dy/dx)', 'For parametric: use quotient of first derivative', 'nth derivative of sin x cycles every 4'],
    jeetuLine: 'Higher derivatives mein pattern dhundo. Cycle repeat hoti hai.'
  }
];

// Application of Derivatives subchapters
export const applicationDerivativesSubchapters: Subchapter[] = [
  {
    id: 'math-8-1',
    chapterId: 'math-8',
    name: 'Tangent & Normal',
    jeeAsks: ['Slope = dy/dx at point', 'Equation of tangent', 'Equation of normal', 'Length of tangent/normal'],
    pyqFocus: { trends: ['Finding equations', 'Tangent from external point'], patterns: ['Tangent: y - y₁ = m(x - x₁)'], traps: ['Normal slope = -1/m', 'Parametric point on curve'] },
    commonMistakes: ['Tangent parallel to x-axis: dy/dx = 0', 'Tangent parallel to y-axis: dx/dy = 0', 'Normal perpendicular to tangent'],
    jeetuLine: 'Tangent slope = dy/dx. Normal slope = negative reciprocal.'
  },
  {
    id: 'math-8-2',
    chapterId: 'math-8',
    name: 'Maxima & Minima',
    jeeAsks: ['Critical points', 'First derivative test', 'Second derivative test', 'Absolute extrema'],
    pyqFocus: { trends: ['Optimization problems', 'Word problems'], patterns: ['Set f\'(x) = 0, check sign change'], traps: ['Critical point ≠ always extremum', 'Check boundary for closed interval'] },
    commonMistakes: ['f\'(c) = 0 or undefined = critical', 'f\'\'(c) > 0 = local min', 'f\'\'(c) < 0 = local max'],
    jeetuLine: 'Maxima-minima mein pehle f\' = 0 solve karo, phir check karo.'
  },
  {
    id: 'math-8-3',
    chapterId: 'math-8',
    name: 'Monotonicity',
    jeeAsks: ['Increasing/decreasing intervals', 'Strictly monotonic', 'Proving inequalities', 'Using derivatives for bounds'],
    pyqFocus: { trends: ['Finding intervals', 'Proving f(x) > g(x)'], patterns: ['f\' > 0 = increasing', 'f\' < 0 = decreasing'], traps: ['Strictly: f\' ≠ 0 except isolated points', 'For comparison, study f - g'] },
    commonMistakes: ['f\'(x) ≥ 0 for non-decreasing', 'Critical points divide into intervals', 'Test one point in each interval'],
    jeetuLine: 'f\' > 0 = increasing. Interval find karo where f\' positive.'
  },
  {
    id: 'math-8-4',
    chapterId: 'math-8',
    name: "Mean Value Theorems",
    jeeAsks: ["Rolle's theorem", 'LMVT', 'Applications', 'Cauchy MVT'],
    pyqFocus: { trends: ['Finding c in (a,b)', 'Proving existence'], patterns: ["Rolle: f(a) = f(b) implies f'(c) = 0"], traps: ['Conditions: continuous on [a,b], diff on (a,b)', "LMVT: f'(c) = (f(b)-f(a))/(b-a)"] },
    commonMistakes: ["Rolle is special case of LMVT", "Check all conditions before applying", "c guaranteed to exist but may not be unique"],
    jeetuLine: "MVT = average slope = instantaneous slope somewhere. Existence theorem hai."
  }
];

// Integration subchapters
export const integrationSubchapters: Subchapter[] = [
  {
    id: 'math-9-1',
    chapterId: 'math-9',
    name: 'Indefinite Integrals',
    jeeAsks: ['Standard integrals', 'Substitution', 'By parts', 'Partial fractions'],
    pyqFocus: { trends: ['Choosing method', 'Complex integrands'], patterns: ['∫x^n dx = x^(n+1)/(n+1) + C'], traps: ['Dont forget + C', 'Check by differentiating'] },
    commonMistakes: ['∫1/x dx = ln|x| + C', '∫e^x dx = e^x + C', 'ILATE for by parts: Inverse, Log, Algebraic, Trig, Exp'],
    jeetuLine: 'Integration mein method selection important. Practice se aata hai.'
  },
  {
    id: 'math-9-2',
    chapterId: 'math-9',
    name: 'Definite Integrals',
    jeeAsks: ['Fundamental theorem', 'Limit properties', 'Even/odd functions', 'Periodic functions'],
    pyqFocus: { trends: ['Using properties to simplify', 'Leibniz rule'], patterns: ['∫[a,b] f = F(b) - F(a)'], traps: ['∫[-a,a] odd = 0', '∫[-a,a] even = 2∫[0,a]'] },
    commonMistakes: ['No + C in definite integral', 'Property: ∫[a,b] = ∫[a,c] + ∫[c,b]', 'King property: ∫[a,b] f(x) = ∫[a,b] f(a+b-x)'],
    jeetuLine: 'Definite integral mein properties use karo. Calculation reduce hoti hai.'
  },
  {
    id: 'math-9-3',
    chapterId: 'math-9',
    name: 'Area Under Curves',
    jeeAsks: ['Area between curve and axis', 'Area between two curves', 'Signed area', 'Using integration'],
    pyqFocus: { trends: ['Between curves', 'Bounded regions'], patterns: ['A = ∫[a,b] |f(x)| dx'], traps: ['Subtract lower from upper', 'Find intersection points first'] },
    commonMistakes: ['Area is positive, integrate |f(x)| or split intervals', 'Between curves: ∫(upper - lower)', 'Sketch helps identify limits'],
    jeetuLine: 'Area mein upper minus lower integrate karo. Limits intersection se.'
  },
  {
    id: 'math-9-4',
    chapterId: 'math-9',
    name: 'Differential Equations',
    jeeAsks: ['Order and degree', 'Variable separable', 'Homogeneous', 'Linear first order'],
    pyqFocus: { trends: ['Solving first order', 'Formation of DE'], patterns: ['Separate and integrate', 'IF = e^∫P dx for linear'], traps: ['Degree defined only if polynomial in derivatives', 'Homogeneous: y = vx substitution'] },
    commonMistakes: ['Order = highest derivative', 'Linear: dy/dx + Py = Q', 'Solution contains arbitrary constants = order'],
    jeetuLine: 'DE mein method identify karo. Variable separable sabse easy.'
  }
];

// Coordinate Geometry subchapters
export const coordinateGeomSubchapters: Subchapter[] = [
  {
    id: 'math-10-1',
    chapterId: 'math-10',
    name: 'Straight Lines',
    jeeAsks: ['Slope forms', 'Distance formulas', 'Angle between lines', 'Family of lines'],
    pyqFocus: { trends: ['Concurrent lines', 'Distance problems'], patterns: ['Point-slope: y - y₁ = m(x - x₁)'], traps: ['Parallel: same slope', 'Perpendicular: m₁m₂ = -1'] },
    commonMistakes: ['Distance from point to line = |ax₁+by₁+c|/√(a²+b²)', 'Angle: tan θ = |(m₁-m₂)/(1+m₁m₂)|', 'Family through intersection: L₁ + λL₂ = 0'],
    jeetuLine: 'Straight line = first form, then apply formula. Basic geometry hai.'
  },
  {
    id: 'math-10-2',
    chapterId: 'math-10',
    name: 'Circles',
    jeeAsks: ['Standard and general forms', 'Tangent conditions', 'Chord of contact', 'Radical axis'],
    pyqFocus: { trends: ['Tangent from external point', 'Common tangents'], patterns: ['S: x² + y² + 2gx + 2fy + c = 0'], traps: ['Center: (-g, -f), radius: √(g² + f² - c)', 'S₁ = 0 for tangent at point on circle'] },
    commonMistakes: ['Tangent: length = √S₁', 'Chord of contact from (x₁,y₁): T = 0', 'Radical axis: S₁ - S₂ = 0'],
    jeetuLine: 'Circle mein center aur radius nikalo. Tangent length formula yaad karo.'
  },
  {
    id: 'math-10-3',
    chapterId: 'math-10',
    name: 'Parabola',
    jeeAsks: ['Standard forms', 'Focus, directrix, LR', 'Tangent, normal', 'Focal chord properties'],
    pyqFocus: { trends: ['Tangent from point', 'Focal chord'], patterns: ['y² = 4ax: focus (a,0), directrix x = -a'], traps: ['Parametric: (at², 2at)', 'Focal chord: t₁t₂ = -1'] },
    commonMistakes: ['LR = 4a', 'Tangent at t: ty = x + at²', 'Reflection property: ray from focus reflects parallel to axis'],
    jeetuLine: 'Parabola mein 4a important. Focal chord property use karo.'
  },
  {
    id: 'math-10-4',
    chapterId: 'math-10',
    name: 'Ellipse & Hyperbola',
    jeeAsks: ['Standard forms', 'Eccentricity', 'Foci, directrices', 'Tangent conditions'],
    pyqFocus: { trends: ['Finding e', 'Tangent/normal equations'], patterns: ['Ellipse: x²/a² + y²/b² = 1, e = √(1-b²/a²)'], traps: ['Hyperbola: e > 1', 'Asymptotes: y = ±(b/a)x for hyperbola'] },
    commonMistakes: ['Ellipse: c² = a² - b²', 'Hyperbola: c² = a² + b²', 'Rectangular hyperbola: a = b, e = √2'],
    jeetuLine: 'Conics mein eccentricity focus distance/directrix distance. e < 1 ellipse, e > 1 hyperbola.'
  }
];

// Vectors & 3D subchapters
export const vectors3DSubchapters: Subchapter[] = [
  {
    id: 'math-11-1',
    chapterId: 'math-11',
    name: 'Vector Algebra',
    jeeAsks: ['Addition, scalar multiplication', 'Position vectors', 'Section formula', 'Collinearity'],
    pyqFocus: { trends: ['Finding position vector', 'Proving collinear'], patterns: ['Section: (mB + nA)/(m+n) for internal'], traps: ['External division: opposite signs', 'Collinear: a = λb'] },
    commonMistakes: ['Unit vector = a/|a|', 'Collinear points: one is linear combination of others', 'Centroid: (A+B+C)/3'],
    jeetuLine: 'Vectors mein direction aur magnitude dono matter karte hain.'
  },
  {
    id: 'math-11-2',
    chapterId: 'math-11',
    name: 'Dot & Cross Products',
    jeeAsks: ['a·b = |a||b|cos θ', 'a×b = |a||b|sin θ n̂', 'Perpendicularity', 'Area using cross product'],
    pyqFocus: { trends: ['Finding angle', 'Proving perpendicular'], patterns: ['Perpendicular: a·b = 0', 'Parallel: a×b = 0'], traps: ['Cross product gives vector', 'Dot product gives scalar'] },
    commonMistakes: ['a·b = a₁b₁ + a₂b₂ + a₃b₃', '|a×b| = area of parallelogram', 'a×b = -b×a (anti-commutative)'],
    jeetuLine: 'Dot = projection, Cross = area. Angle finding mein use karo.'
  },
  {
    id: 'math-11-3',
    chapterId: 'math-11',
    name: 'Lines in 3D',
    jeeAsks: ['Vector equation of line', 'Cartesian form', 'Shortest distance between lines', 'Coplanar lines'],
    pyqFocus: { trends: ['Shortest distance', 'Intersection of lines'], patterns: ['r = a + λb (point + direction)'], traps: ['Skew lines: not parallel and dont intersect', 'SD = |[b₁ b₂ (a₂-a₁)]|/|b₁×b₂|'] },
    commonMistakes: ['Direction ratios from coefficients of λ', 'Parallel lines: b₁ || b₂', 'Intersecting: solve for λ, μ and check consistency'],
    jeetuLine: 'Line = point + direction. Shortest distance box product use karo.'
  },
  {
    id: 'math-11-4',
    chapterId: 'math-11',
    name: 'Planes',
    jeeAsks: ['Equation of plane', 'Distance from point', 'Angle between planes', 'Line-plane intersection'],
    pyqFocus: { trends: ['Finding equation through points', 'Distance formulas'], patterns: ['r·n = d (normal form)'], traps: ['Angle between planes = angle between normals', 'Line parallel to plane if b·n = 0'] },
    commonMistakes: ['Distance = |d₁ - d₂|/|n| for parallel planes', 'Foot of perpendicular: project point onto plane', 'Image: twice the foot minus original'],
    jeetuLine: 'Plane = normal vector defines orientation. r·n = d form useful.'
  }
];

// Trigonometry subchapters
export const trigonometrySubchapters: Subchapter[] = [
  {
    id: 'math-12-1',
    chapterId: 'math-12',
    name: 'Trigonometric Identities',
    jeeAsks: ['Pythagorean identities', 'Sum/difference formulas', 'Double/half angle', 'Product-to-sum'],
    pyqFocus: { trends: ['Simplification', 'Proving identities'], patterns: ['sin²x + cos²x = 1'], traps: ['Sign depends on quadrant', 'Half angle: cos(x/2) can be ±'] },
    commonMistakes: ['sin 2x = 2 sin x cos x', 'cos 2x = cos²x - sin²x = 1 - 2sin²x = 2cos²x - 1', 'tan(A+B) = (tan A + tan B)/(1 - tan A tan B)'],
    jeetuLine: 'Trig identities yaad karo. Simplification mein help karte hain.'
  },
  {
    id: 'math-12-2',
    chapterId: 'math-12',
    name: 'Trigonometric Equations',
    jeeAsks: ['General solutions', 'Principal solutions', 'Quadratic in trig', 'Multiple angle equations'],
    pyqFocus: { trends: ['Finding all solutions', 'Range constraints'], patterns: ['sin x = 0: x = nπ', 'cos x = 0: x = (2n+1)π/2'], traps: ['Check domain when squaring', 'tan x = 0: x = nπ'] },
    commonMistakes: ['sin x = sin α: x = nπ + (-1)ⁿα', 'cos x = cos α: x = 2nπ ± α', 'tan x = tan α: x = nπ + α'],
    jeetuLine: 'General solution mein n integer. Domain check karna mat bhoolna.'
  },
  {
    id: 'math-12-3',
    chapterId: 'math-12',
    name: 'Inverse Trigonometry',
    jeeAsks: ['Principal value ranges', 'Properties', 'Simplification', 'Composition'],
    pyqFocus: { trends: ['Simplifying expressions', 'Proving equations'], patterns: ['sin⁻¹x + cos⁻¹x = π/2'], traps: ['Domain restrictions for each function', 'sin(sin⁻¹x) = x only if |x| ≤ 1'] },
    commonMistakes: ['tan⁻¹x + tan⁻¹y = tan⁻¹((x+y)/(1-xy)) when xy < 1', 'sin⁻¹x ∈ [-π/2, π/2]', 'cos⁻¹x ∈ [0, π]'],
    jeetuLine: 'Inverse trig mein domain-range important. Principal value range yaad karo.'
  },
  {
    id: 'math-12-4',
    chapterId: 'math-12',
    name: 'Properties of Triangles',
    jeeAsks: ['Sine rule', 'Cosine rule', 'Area formulas', 'Circumradius, inradius'],
    pyqFocus: { trends: ['Finding sides/angles', 'R and r calculations'], patterns: ['a/sin A = b/sin B = c/sin C = 2R'], traps: ['Cosine rule for included angle', 'Area = (1/2)ab sin C'] },
    commonMistakes: ['cos A = (b² + c² - a²)/(2bc)', 'R = abc/(4Δ)', 'r = Δ/s where s = (a+b+c)/2'],
    jeetuLine: 'Triangle mein sine rule side ke opposite angle. Cosine rule 3 sides se angle.'
  }
];

// Export all subchapters in a map
export const subchaptersByChapter: Record<string, Subchapter[]> = {
  // Physics
  'phy-1': kinematicsSubchapters,
  'phy-2': lawsOfMotionSubchapters,
  'phy-3': workEnergySubchapters,
  'phy-4': rotationalMotionSubchapters,
  'phy-5': gravitationSubchapters,
  'phy-6': shmWavesSubchapters,
  'phy-7': thermodynamicsSubchapters,
  'phy-8': electrostaticsSubchapters,
  'phy-9': currentElectricitySubchapters,
  'phy-10': magnetismSubchapters,
  'phy-11': opticsSubchapters,
  'phy-12': modernPhysicsSubchapters,
  // Chemistry
  'chem-1': moleConceptSubchapters,
  'chem-2': atomicStructureSubchapters,
  'chem-3': chemicalBondingSubchapters,
  'chem-4': chemThermodynamicsSubchapters,
  'chem-5': chemicalEquilibriumSubchapters,
  'chem-6': electrochemistrySubchapters,
  'chem-7': chemicalKineticsSubchapters,
  'chem-8': gocIsomerismSubchapters,
  'chem-9': hydrocarbonsSubchapters,
  'chem-10': organicReactionsSubchapters,
  'chem-11': periodicTableSubchapters,
  'chem-12': coordinationChemSubchapters,
  // Maths
  'math-1': quadraticSubchapters,
  'math-2': complexSubchapters,
  'math-3': matricesSubchapters,
  'math-4': permutationsSubchapters,
  'math-5': probabilitySubchapters,
  'math-6': limitsSubchapters,
  'math-7': differentiationSubchapters,
  'math-8': applicationDerivativesSubchapters,
  'math-9': integrationSubchapters,
  'math-10': coordinateGeomSubchapters,
  'math-11': vectors3DSubchapters,
  'math-12': trigonometrySubchapters,
  // Biology
  'neet-bio-1': cellBiologySubchapters,
  'neet-bio-2': humanPhysiologySubchapters,
  'neet-bio-3': plantPhysiologySubchapters,
  'neet-bio-4': geneticsSubchapters,
  'neet-bio-5': ecologySubchapters,
  'neet-bio-6': reproductionSubchapters,
  'neet-bio-7': biotechSubchapters,
  'neet-bio-8': animalKingdomSubchapters,
  'neet-bio-9': plantKingdomSubchapters,
  'neet-bio-10': humanHealthSubchapters,
  // NEET Chemistry
  'neet-chem-1': neetChem1Subchapters,
  'neet-chem-2': neetChem2Subchapters,
  'neet-chem-3': neetChem3Subchapters,
  'neet-chem-4': neetChem4Subchapters,
  'neet-chem-5': neetChem5Subchapters,
  'neet-chem-6': neetChem6Subchapters,
  'neet-chem-7': neetChem7Subchapters,
  'neet-chem-8': neetChem8Subchapters,
  // NEET Physics
  'neet-phy-1': neetPhy1Subchapters,
  'neet-phy-2': neetPhy2Subchapters,
  'neet-phy-3': neetPhy3Subchapters,
  'neet-phy-4': neetPhy4Subchapters,
  'neet-phy-5': neetPhy5Subchapters,
  'neet-phy-6': neetPhy6Subchapters,
};

// Helper function to get subchapters by chapter ID
export function getSubchaptersByChapterId(chapterId: string): Subchapter[] {
  return subchaptersByChapter[chapterId] || [];
}

// Helper function to get a specific subchapter
export function getSubchapterById(subchapterId: string): Subchapter | undefined {
  for (const subchapters of Object.values(subchaptersByChapter)) {
    const found = subchapters.find(s => s.id === subchapterId);
    if (found) return found;
  }
  return undefined;
}

// Get all subchapters
export function getAllSubchapters(): Subchapter[] {
  return Object.values(subchaptersByChapter).flat();
}
