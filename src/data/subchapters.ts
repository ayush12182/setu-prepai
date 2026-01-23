// JEE Subchapter (Topic) Structure - Coaching Grade
// Each subchapter is the smallest clickable learning unit

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

// Export all subchapters in a map
export const subchaptersByChapter: Record<string, Subchapter[]> = {
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
  'chem-1': moleConceptSubchapters,
  'chem-2': atomicStructureSubchapters,
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
