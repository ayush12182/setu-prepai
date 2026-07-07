import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, HelpCircle } from 'lucide-react';

export interface InteractiveDiagramProps {
  type: 'projectile_motion' | 'free_body_diagram' | 'ray_optics' | 'pulley_system' | 'dna_helix';
  title: string;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ type, title }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const W = 500;
  const H = 300;

  // Custom metadata about components for tooltips
  const diagramParts: Record<string, string> = {
    'theta': 'Launch Angle (θ): Determines the split between horizontal and vertical velocity components.',
    'trajectory': 'Parabolic Trajectory: The path of the projectile in 2D space under uniform gravity (g).',
    'u_x': 'Horizontal Velocity (u_x = u cosθ): Remains constant throughout the flight since there is no horizontal acceleration.',
    'u_y': 'Vertical Velocity (u_y = u sinθ): Decreases under gravity, reaches zero at maximum height, then increases in negative direction.',
    'max_h': 'Maximum Height (H_max): The point where vertical velocity becomes zero (v_y = 0).',
    'range': 'Range (R): Total horizontal displacement covered during the time of flight.',
    // FBD
    'normal': 'Normal Force (N): The perpendicular contact force exerted by a surface on an object.',
    'gravity': 'Gravitational Force (mg): The force of attraction acting vertically downward toward Earth.',
    'friction': 'Friction Force (f): Resists relative motion or tendency of motion, acting parallel to the surface.',
    'tension': 'Tension Force (T): Pulling force transmitted through a string, cable, or chain.',
    // Ray Optics
    'incident': 'Incident Ray: The incoming ray of light that strikes the optical surface.',
    'refracted': 'Refracted Ray: The ray of light that bends as it passes from one medium to another with a different refractive index.',
    'normal_line': 'Normal Line: The imaginary line perpendicular to the optical interface at the point of incidence.',
    'theta_i': 'Angle of Incidence (i): Angle between the incident ray and the normal line.',
    'theta_r': 'Angle of Refraction (r): Angle between the refracted ray and the normal line.',
    // Pulley
    'pulley': 'Pulley: A wheel on an axle that supports movement and changes the direction of tension force.',
    'mass_a': 'Mass A: Suspended mass experiencing upward tension T and downward gravity m_A * g.',
    'mass_b': 'Mass B: Suspended mass experiencing upward tension T and downward gravity m_B * g.',
  };

  return (
    <Card className="my-8 overflow-hidden border border-border bg-card shadow-lg rounded-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Left: SVG Canvas */}
          <div className="relative w-full aspect-[5/3] bg-slate-950 dark:bg-black rounded-xl p-2 border border-border/80 flex items-center justify-center select-none">
            <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`}>
              {/* Ground-to-ground Projectile Diagram */}
              {type === 'projectile_motion' && (
                <g>
                  {/* Ground */}
                  <line x1={40} y1={250} x2={460} y2={250} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
                  
                  {/* Trajectory Parabola */}
                  <path
                    d="M 60,250 Q 250,50 440,250"
                    stroke={hoveredPart === 'trajectory' ? '#3b82f6' : 'rgba(59,130,246,0.5)'}
                    strokeWidth={hoveredPart === 'trajectory' ? 4 : 2}
                    fill="none"
                    onMouseEnter={() => setHoveredPart('trajectory')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer transition-all"
                  />

                  {/* Launch Vector (u) */}
                  <line x1={60} y1={250} x2={130} y2={170} stroke="#f59e0b" strokeWidth={3.5} markerEnd="url(#arrow-yellow)" />
                  <text x={140} y={165} fill="#f59e0b" fontSize={12} fontWeight="bold" fontFamily="monospace">u</text>

                  {/* Horizontal component (u_x) */}
                  <line
                    x1={60}
                    y1={250}
                    x2={130}
                    y2={250}
                    stroke={hoveredPart === 'u_x' ? '#ef4444' : '#ef4444/70'}
                    strokeWidth={hoveredPart === 'u_x' ? 3.5 : 2}
                    onMouseEnter={() => setHoveredPart('u_x')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer transition-all"
                  />
                  <text x={95} y={265} fill="#ef4444" fontSize={11} fontWeight="bold">u cosθ</text>

                  {/* Vertical component (u_y) */}
                  <line
                    x1={60}
                    y1={250}
                    x2={60}
                    y2={170}
                    stroke={hoveredPart === 'u_y' ? '#10b981' : '#10b981/70'}
                    strokeWidth={hoveredPart === 'u_y' ? 3.5 : 2}
                    onMouseEnter={() => setHoveredPart('u_y')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer transition-all"
                  />
                  <text x={15} y={205} fill="#10b981" fontSize={11} fontWeight="bold">u sinθ</text>

                  {/* Angle Arc (theta) */}
                  <path
                    d="M 90,250 A 30,30 0 0,0 80,227"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPart('theta')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={100} y={235} fill="#fbbf24" fontSize={12} fontWeight="bold">θ</text>

                  {/* Max Height indicator */}
                  <line
                    x1={250}
                    y1={150}
                    x2={250}
                    y2={250}
                    stroke={hoveredPart === 'max_h' ? '#a78bfa' : 'rgba(167,139,250,0.4)'}
                    strokeWidth={hoveredPart === 'max_h' ? 3.5 : 2}
                    strokeDasharray="4,4"
                    onMouseEnter={() => setHoveredPart('max_h')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <circle cx={250} cy={150} r={4} fill="#a78bfa" />
                  <text x={255} y={145} fill="#a78bfa" fontSize={11} fontWeight="bold">H_max</text>

                  {/* Range indicator */}
                  <line
                    x1={60}
                    y1={280}
                    x2={440}
                    y2={280}
                    stroke={hoveredPart === 'range' ? '#22c55e' : 'rgba(34,197,94,0.4)'}
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPart('range')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={250} y={295} fill="#22c55e" fontSize={11} fontWeight="bold" textAnchor="middle">Range (R)</text>
                </g>
              )}

              {/* Free Body Diagram */}
              {type === 'free_body_diagram' && (
                <g>
                  {/* Block body */}
                  <rect x={200} y={110} width={100} height={80} fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth={2} rx={6} />
                  <text x={250} y={150} fill="white" fontSize={14} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">Mass m</text>

                  {/* Normal Force vector */}
                  <line
                    x1={250} y1={110} x2={250} y2={40}
                    stroke={hoveredPart === 'normal' ? '#3b82f6' : 'rgba(59,130,246,0.7)'}
                    strokeWidth={4}
                    onMouseEnter={() => setHoveredPart('normal')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={250} y={25} fill="#3b82f6" fontSize={12} fontWeight="bold" textAnchor="middle">Normal Force (N)</text>

                  {/* Gravity Force vector */}
                  <line
                    x1={250} y1={190} x2={250} y2={270}
                    stroke={hoveredPart === 'gravity' ? '#ef4444' : 'rgba(239,68,68,0.7)'}
                    strokeWidth={4}
                    onMouseEnter={() => setHoveredPart('gravity')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={250} y={285} fill="#ef4444" fontSize={12} fontWeight="bold" textAnchor="middle">Gravity (mg)</text>

                  {/* Tension vector */}
                  <line
                    x1={300} y1={150} x2={380} y2={150}
                    stroke={hoveredPart === 'tension' ? '#f59e0b' : 'rgba(245,158,11,0.7)'}
                    strokeWidth={4}
                    onMouseEnter={() => setHoveredPart('tension')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={395} y={154} fill="#f59e0b" fontSize={12} fontWeight="bold">Tension (T)</text>

                  {/* Friction vector */}
                  <line
                    x1={200} y1={150} x2={120} y2={150}
                    stroke={hoveredPart === 'friction' ? '#10b981' : 'rgba(16,185,129,0.7)'}
                    strokeWidth={4}
                    onMouseEnter={() => setHoveredPart('friction')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={105} y={154} fill="#10b981" fontSize={12} fontWeight="bold" textAnchor="end">Friction (f)</text>
                </g>
              )}

              {/* Ray Optics Diagram */}
              {type === 'ray_optics' && (
                <g>
                  {/* Interface line */}
                  <line x1={20} y1={150} x2={480} y2={150} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
                  <text x={40} y={140} fill="white" fontSize={10} opacity={0.6}>Medium 1 (Air)</text>
                  <text x={40} y={170} fill="white" fontSize={10} opacity={0.6}>Medium 2 (Glass)</text>

                  {/* Normal line */}
                  <line
                    x1={250} y1={30} x2={250} y2={270}
                    stroke={hoveredPart === 'normal_line' ? '#a78bfa' : 'rgba(167,139,250,0.5)'}
                    strokeWidth={2}
                    strokeDasharray="4,4"
                    onMouseEnter={() => setHoveredPart('normal_line')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />

                  {/* Incident Ray */}
                  <line
                    x1={90} y1={50} x2={250} y2={150}
                    stroke={hoveredPart === 'incident' ? '#ef4444' : '#ef4444/80'}
                    strokeWidth={3}
                    onMouseEnter={() => setHoveredPart('incident')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={100} y={40} fill="#ef4444" fontSize={11} fontWeight="bold">Incident Ray</text>

                  {/* Refracted Ray */}
                  <line
                    x1={250} y1={150} x2={340} y2={260}
                    stroke={hoveredPart === 'refracted' ? '#3b82f6' : '#3b82f6/80'}
                    strokeWidth={3}
                    onMouseEnter={() => setHoveredPart('refracted')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={350} y={270} fill="#3b82f6" fontSize={11} fontWeight="bold">Refracted Ray</text>

                  {/* Angle of incidence (i) */}
                  <path
                    d="M 230,137 A 25,25 0 0,1 250,125"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPart('theta_i')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={235} y={115} fill="#f59e0b" fontSize={11} fontWeight="bold">i</text>

                  {/* Angle of refraction (r) */}
                  <path
                    d="M 250,175 A 25,25 0 0,1 267,171"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPart('theta_r')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={262} y={190} fill="#f59e0b" fontSize={11} fontWeight="bold">r</text>
                </g>
              )}

              {/* Pulley System */}
              {type === 'pulley_system' && (
                <g>
                  {/* Ceiling */}
                  <line x1={150} y1={30} x2={350} y2={30} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
                  {/* Hanger */}
                  <line x1={250} y1={30} x2={250} y2={80} stroke="white" strokeWidth={2} />

                  {/* Pulley Wheel */}
                  <circle
                    cx={250} cy={100} r={24}
                    fill="none"
                    stroke={hoveredPart === 'pulley' ? '#3b82f6' : 'white'}
                    strokeWidth={3}
                    onMouseEnter={() => setHoveredPart('pulley')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <circle cx={250} cy={100} r={4} fill="white" />

                  {/* Strings and masses */}
                  <line x1={226} y1={100} x2={226} y2={180} stroke="white" strokeWidth={1.5} />
                  <rect
                    x={211} y={180} width={30} height={30}
                    fill="rgba(239,68,68,0.2)"
                    stroke={hoveredPart === 'mass_a' ? '#ef4444' : '#ef4444/70'}
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPart('mass_a')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={226} y={195} fill="white" fontSize={10} textAnchor="middle">m_A</text>

                  <line x1={274} y1={100} x2={274} y2={210} stroke="white" strokeWidth={1.5} />
                  <rect
                    x={259} y={210} width={30} height={30}
                    fill="rgba(16,185,129,0.2)"
                    stroke={hoveredPart === 'mass_b' ? '#10b981' : '#10b981/70'}
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPart('mass_b')}
                    onMouseLeave={() => setHoveredPart(null)}
                    className="cursor-pointer"
                  />
                  <text x={274} y={225} fill="white" fontSize={10} textAnchor="middle">m_B</text>
                </g>
              )}

              {/* Default fallback definitions/markers */}
              <defs>
                <marker id="arrow-yellow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 Z" fill="#f59e0b" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Right: Info / Description panel */}
          <div className="w-full md:w-[180px] text-left space-y-4">
            <span className="text-caption font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-2">
              Inspect Diagram
            </span>
            <div className="p-3 bg-secondary/40 border border-border/80 rounded-xl min-h-[140px] flex items-center justify-center">
              {hoveredPart ? (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold text-accent flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Concept Detail
                  </span>
                  <p className="text-body-sm font-semibold text-foreground leading-relaxed">
                    {diagramParts[hoveredPart]}
                  </p>
                </div>
              ) : (
                <p className="text-body-sm italic text-muted-foreground text-center flex flex-col items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 opacity-40" />
                  Hover over the vectors and labels in the diagram to inspect their physical significance.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
