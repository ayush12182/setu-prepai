import { readFileSync, writeFileSync } from 'fs';

const filePath = '/Users/ayushdixit12/setu-prepai/src/data/subchapters.ts';

const systemOfParticlesSubchaptersStr = `export const systemOfParticlesSubchapters: Subchapter[] = [
  {
    id: 'phy-4-1',
    chapterId: 'phy-4',
    name: 'Centre of Mass discrete system',
    jeeAsks: ['CM of two-particle system', 'Discrete mass coordinate calculations', 'Shifting origin coordinate impacts'],
    pyqFocus: { trends: ['Coordinates of composite systems', 'Finding third mass position'], patterns: ['Xcm = Σmx/Σm'], traps: ['Forgetting negative coordinates', 'Confusing area/volume distribution for mass'] },
    commonMistakes: ['Sign errors in coordinates', 'Not using symmetric simplifications'],
    setuLine: 'Discrete particles ka CM coordinate average hai weight ke proportional.'
  },
  {
    id: 'phy-4-2',
    chapterId: 'phy-4',
    name: 'Centre of Mass continuous bodies',
    jeeAsks: ['CM of rod with variable density', 'Semicircular ring and disc', 'Hemisphere and cone CM', 'Cavity problems'],
    pyqFocus: { trends: ['Removal of circle/disc cavity', 'Linear density functions integration'], patterns: ['Xcm = ∫x dm / M'], traps: ['Treating cavity area as positive instead of negative mass', 'Standard formula height of solid vs hollow cone'] },
    commonMistakes: ['Integrating without writing dm in terms of dx', 'Using hollow cone formula for solid cone (h/3 vs h/4)'],
    setuLine: 'Continuous bodies mein integration ya symmetric shapes ka direct values use karo.'
  },
  {
    id: 'phy-4-3',
    chapterId: 'phy-4',
    name: 'Motion of Centre of Mass',
    jeeAsks: ['Velocity and acceleration of CM', 'Linear momentum conservation', 'Fext = 0 implies Vcm constant', 'Man-plank boat motion problems'],
    pyqFocus: { trends: ['Internal explosions trajectory of CM', 'Plank walking displacement calculations'], patterns: ['ΔXcm = 0 when Fext = 0'], traps: ['Internal forces changing CM position (impossible)', 'Including friction between man and plank as external'] },
    commonMistakes: ['Thinking internal explosion changes CM trajectory', 'Incorrect coordinate setup for relative motion'],
    setuLine: 'Internal forces CM ko accelerate nahi kar sakte. Uski motion constant rahegi.'
  },
  {
    id: 'phy-4-4',
    chapterId: 'phy-4',
    name: 'Collisions (1D & 2D)',
    jeeAsks: ['Elastic vs inelastic collisions', 'Coefficient of restitution', 'Oblique collisions and line of impact', 'Loss of kinetic energy'],
    pyqFocus: { trends: ['Identical mass oblique elastic scattering', 'Finding kinetic energy loss fraction'], patterns: ['Momentum conserved along line of impact', 'e = relative separation speed / relative approach speed'], traps: ['Conserving KE in inelastic collisions', 'Conserving momentum perpendicular to line of impact for individual bodies'] },
    commonMistakes: ['Confusing e formula speed directions', 'Assuming velocities exchange for different masses in elastic collision'],
    setuLine: 'Collision mein momentum hamesha conserved. Energy sirf elastic mein.'
  },
  {
    id: 'phy-4-5',
    chapterId: 'phy-4',
    name: 'Impulse & Variable Mass Systems',
    jeeAsks: ['Force-time graph area', 'Impulse-momentum theorem', 'Rocket propulsion with variable mass', 'Thrust force calculations'],
    pyqFocus: { trends: ['Rocket climbing with fuel burn rate', 'Varying force impulse'], patterns: ['J = ∫F dt = ΔP', 'v = u + v_rel ln(m0/m)'], traps: ['Neglecting gravity in rocket equation if stated', 'Confusing thrust direction with gas eject direction'] },
    commonMistakes: ['Forgetting that impulse is vector', 'Sign error in rocket relative speed term'],
    setuLine: 'Impulse = change in momentum. Variable mass mein thrust force = v_rel * (dm/dt).'
  }
];`;

const solidsSubchaptersStr = `export const solidsSubchapters: Subchapter[] = [
  {
    id: 'phy-7-1',
    chapterId: 'phy-7',
    name: 'Stress, Strain & Hooke\'s Law',
    jeeAsks: ['Types of stress (tensile, shear, hydraulic)', 'Strain definitions', 'Hooke\'s law limits', 'Stress-strain curve regions'],
    pyqFocus: { trends: ['Identifying yield point and ultimate strength', 'Proportional limit applications'], patterns: ['Stress = Y × Strain'], traps: ['Assuming Hooke\'s law holds up to breaking point', 'Confusing restoring force with applied force'] },
    commonMistakes: ['Using original area instead of deformed area in high strain', 'Not distinguishing between elastic limit and proportional limit'],
    setuLine: 'Hooke\'s law proportional limit tak hi valid hai. Elastic range thoda bada hota hai.'
  },
  {
    id: 'phy-7-2',
    chapterId: 'phy-7',
    name: 'Elastic Moduli',
    jeeAsks: ['Young\'s modulus of composite wires', 'Bulk modulus and compressibility', 'Shear modulus calculations', 'Poisson\'s ratio constraints'],
    pyqFocus: { trends: ['Series/parallel wire combinations', 'Volume change under pressure'], patterns: ['Y = FL / AΔL', 'B = -VΔP/ΔV', 'Compressibility = 1/B'], traps: ['Poisson ratio range limit (-1 to 0.5)', 'Forgetting bulk modulus is negative by definition'] },
    commonMistakes: ['Ignoring cross-section differences in composite wires', 'Taking Poisson ratio larger than 0.5'],
    setuLine: 'Young\'s modulus length/area par depend nahi karta, material ki properties hai.'
  },
  {
    id: 'phy-7-3',
    chapterId: 'phy-7',
    name: 'Elastic Potential Energy & Thermal Stress',
    jeeAsks: ['Energy stored in stretched wire', 'Energy density', 'Thermal expansion restraint stress', 'Elongation under own weight'],
    pyqFocus: { trends: ['Energy lost in hysteresis loops', 'Self-weight elongation (ΔL = ρgL²/2Y)', 'Thermal force calculations'], patterns: ['U = ½ F ΔL', 'Energy density = ½ stress × strain', 'Thermal stress = Y α ΔT'], traps: ['Using ΔL = ρgL²/Y for self-weight (missing factor of 2)', 'Forgetting volume factor in total energy vs energy density'] },
    commonMistakes: ['Confusing total energy stored with energy density', 'Neglecting thermal expansion coefficient units'],
    setuLine: 'Self-weight se elongation aadhi hoti hai (½ ρgL²/Y) compared to point load at end.'
  }
];`;

const fluidsSubchaptersStr = `export const fluidsSubchapters: Subchapter[] = [
  {
    id: 'phy-8-1',
    chapterId: 'phy-8',
    name: 'Fluid Pressure & Pascal\'s Law',
    jeeAsks: ['Hydrostatic pressure with depth', 'Barometer & manometer', 'Pascal\'s law in hydraulic lift', 'Pressure in rotating containers'],
    pyqFocus: { trends: ['Pressure variations in accelerating liquids', 'U-tube liquid levels'], patterns: ['P = P0 + ρgh', 'dP/dx = ρa (horizontal acceleration)'], traps: ['Forgetting atmospheric pressure', 'Assuming fluid levels same in accelerating containers'] },
    commonMistakes: ['Not accounting for density variation with temperature', 'Wrong acceleration direction for relative height of liquid columns'],
    setuLine: 'Accelerating fluid container mein free surface effective g کے perpendicular hoti hai.'
  },
  {
    id: 'phy-8-2',
    chapterId: 'phy-8',
    name: 'Buoyancy & Archimedes Principle',
    jeeAsks: ['Buoyant force on fully/partially submerged bodies', 'Apparent weight in fluid', 'Floatation conditions & metacentre', 'Apparent weight in accelerating lift'],
    pyqFocus: { trends: ['Ice melting in water container level changes', 'Body suspended in two immiscible liquids'], patterns: ['Fb = V_submerged × ρ_liquid × g'], traps: ['Using body density instead of liquid density in buoyant force', 'Neglecting effective gravity in accelerating frames'] },
    commonMistakes: ['Thinking buoyant force changes when body moves deeper (constant if fully submerged)', 'Wrong volume submerged calculations'],
    setuLine: 'Buoyant force displaced fluid ka weight hai. Body ka weight nahi.'
  },
  {
    id: 'phy-8-3',
    chapterId: 'phy-8',
    name: 'Fluid Dynamics (Continuity & Bernoulli)',
    jeeAsks: ['Equation of Continuity', 'Bernoulli\'s Equation applications', 'Torricelli\'s Law of Efflux', 'Venturimeter and dynamic lift'],
    pyqFocus: { trends: ['Time to empty a tank through orifice', 'Horizontal projectile range of efflux', 'Velocity of efflux with pressurized tanks'], patterns: ['A1v1 = A2v2', 'P + ½ρv² + ρgh = constant', 'v = √(2gh)'], traps: ['Applying Bernoulli to turbulent flow', 'Forgetting velocity of fluid surface in continuity equation for wide tanks'] },
    commonMistakes: ['Using Torricelli formula when top of tank is closed and pressurized', 'Incorrect pressure signs at different sections'],
    setuLine: 'Continuity means volume flow rate conservation. Bernoulli is energy conservation.'
  },
  {
    id: 'phy-8-4',
    chapterId: 'phy-8',
    name: 'Viscosity & Stokes\' Law',
    jeeAsks: ['Newton\'s law of viscosity', 'Stokes\' drag force', 'Terminal velocity of sphere falling in liquid', 'Poiseuille\'s equation (flow rate)'],
    pyqFocus: { trends: ['Spherical bubble rising terminal speed', 'Ratio of terminal speeds for different radii'], patterns: ['F = 6π η r v', 'vt = 2r²(ρ - σ)g / (9η)'], traps: ['Bubble rising vs drop falling density signs', 'Forgetting terminal velocity depends on square of radius (vt ∝ r²)'] },
    commonMistakes: ['Confusing viscosity with density', 'Neglecting buoyant force of air/medium when calculating drop speed'],
    setuLine: 'Terminal velocity radius squared ke proportional hai. Bubble rise karegi kyunki air density < liquid density.'
  },
  {
    id: 'phy-8-5',
    chapterId: 'phy-8',
    name: 'Surface Tension & Capillarity',
    jeeAsks: ['Surface energy definition', 'Work done in blowing bubble/drop', 'Excess pressure in drop/bubble/air-bubble-in-liquid', 'Capillary rise (Jurin\'s Law)'],
    pyqFocus: { trends: ['Drops coalescing into larger drop heat change', 'Capillary rise in tilted tubes', 'Excess pressure in combined bubbles'], patterns: ['W = T ΔA', 'h = 2T cosθ / (ρ r g)', 'P_excess = 2T/R (drop/air bubble), 4T/R (soap bubble)'], traps: ['Using 2T/R for soap bubble instead of 4T/R', 'Forgetting soap bubble has two surfaces, so area change = 2 × 4πr²'] },
    commonMistakes: ['Not multiplying by 2 for soap bubble area changes', 'Taking negative height for capillary depression (θ > 90) as positive'],
    setuLine: 'Soap bubble has two free surfaces. Excess pressure 4T/R. Capillary rise cosθ pe depend karega.'
  }
];`;

function updateArrayContent(content: string, arrayName: string, fromCh: string, toCh: string): string {
  // Finds the start of the array block
  const pattern = new RegExp(`(export const ${arrayName}: Subchapter\\[\\] = \\[)([\\s\\S]*?)(^\\];)`, 'm');
  const match = content.match(pattern);
  if (!match) {
    console.error(`Could not find array ${arrayName}`);
    return content;
  }
  
  let innerContent = match[2];
  
  // Replace IDs: fromCh + '-' to toCh + '-'
  // e.g. 'phy-4-1' to 'phy-5-1'
  const idPattern = new RegExp(`'${fromCh}-(\\d+)(-\\d+)?'`, 'g');
  innerContent = innerContent.replace(idPattern, `'${toCh}-$1$2'`);
  
  // Replace chapterId: 'fromCh' to 'toCh'
  const chPattern = new RegExp(`chapterId: '${fromCh}'`, 'g');
  innerContent = innerContent.replace(chPattern, `chapterId: '${toCh}'`);
  
  const originalBlock = match[0];
  const newBlock = match[1] + innerContent + match[3];
  
  return content.replace(originalBlock, newBlock);
}

function main() {
  console.log("Reading subchapters.ts...");
  let content = readFileSync(filePath, 'utf8');
  
  // Shift existing chapters in reverse order to avoid collisions!
  // Modern Physics: phy-12 -> phy-15
  content = updateArrayContent(content, 'modernPhysicsSubchapters', 'phy-12', 'phy-15');
  // Optics: phy-11 -> phy-14
  content = updateArrayContent(content, 'opticsSubchapters', 'phy-11', 'phy-14');
  // Magnetism: phy-10 -> phy-13
  content = updateArrayContent(content, 'magnetismSubchapters', 'phy-10', 'phy-13');
  // Current Electricity: phy-9 -> phy-12
  content = updateArrayContent(content, 'currentElectricitySubchapters', 'phy-9', 'phy-12');
  // Electrostatics: phy-8 -> phy-11
  content = updateArrayContent(content, 'electrostaticsSubchapters', 'phy-8', 'phy-11');
  // Thermodynamics: phy-7 -> phy-10
  content = updateArrayContent(content, 'thermodynamicsSubchapters', 'phy-7', 'phy-10');
  // SHM & Waves: phy-6 -> phy-9
  content = updateArrayContent(content, 'shmWavesSubchapters', 'phy-6', 'phy-9');
  // Gravitation: phy-5 -> phy-6
  content = updateArrayContent(content, 'gravitationSubchapters', 'phy-5', 'phy-6');
  // Rotational Motion: phy-4 -> phy-5
  content = updateArrayContent(content, 'rotationalMotionSubchapters', 'phy-4', 'phy-5');
  
  // Insert the three new subchapters before the subchaptersByChapter map.
  // Let's locate the start of: export const subchaptersByChapter: Record<string, Subchapter[]> = {
  const insertMarker = 'export const subchaptersByChapter: Record<string, Subchapter[]> = {';
  const insertIndex = content.indexOf(insertMarker);
  if (insertIndex === -1) {
    console.error("Could not locate subchaptersByChapter insertion point!");
    return;
  }
  
  const beforeInsert = content.substring(0, insertIndex);
  const afterInsert = content.substring(insertIndex);
  
  const newSubchaptersBlock = `\n${systemOfParticlesSubchaptersStr}\n\n${solidsSubchaptersStr}\n\n${fluidsSubchaptersStr}\n\n`;
  
  let newContent = beforeInsert + newSubchaptersBlock + afterInsert;
  
  // Now we must update subchaptersByChapter map inside newContent
  // Let's replace the mappings
  const originalMappings = `  'phy-1': kinematicsSubchapters,
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
  'phy-12': modernPhysicsSubchapters,`;

  const newMappings = `  'phy-1': kinematicsSubchapters,
  'phy-2': lawsOfMotionSubchapters,
  'phy-3': workEnergySubchapters,
  'phy-4': systemOfParticlesSubchapters,
  'phy-5': rotationalMotionSubchapters,
  'phy-6': gravitationSubchapters,
  'phy-7': solidsSubchapters,
  'phy-8': fluidsSubchapters,
  'phy-9': shmWavesSubchapters,
  'phy-10': thermodynamicsSubchapters,
  'phy-11': electrostaticsSubchapters,
  'phy-12': currentElectricitySubchapters,
  'phy-13': magnetismSubchapters,
  'phy-14': opticsSubchapters,
  'phy-15': modernPhysicsSubchapters,`;

  newContent = newContent.replace(originalMappings, newMappings);
  
  writeFileSync(filePath, newContent);
  console.log("Success! Updated subchapters.ts completely.");
}

main();
