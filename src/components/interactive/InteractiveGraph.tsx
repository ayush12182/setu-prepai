import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export interface GraphSlider {
  min: number;
  max: number;
  step: number;
  default: number;
  label: string;
  unit?: string;
}

export interface InteractiveGraphProps {
  graphType: 'velocity_time' | 'displacement_time' | 'projectile_path' | 'shm';
  title: string;
  xAxis: string;
  yAxis: string;
  equation: string;
  sliders: Record<string, GraphSlider>;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  graphType,
  title,
  xAxis,
  yAxis,
  equation,
  sliders
}) => {
  // Initialize slider states dynamically
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    Object.entries(sliders).forEach(([key, config]) => {
      initial[key] = config.default;
    });
    return initial;
  });

  const handleSliderChange = (key: string, value: number[]) => {
    setParams((prev) => ({ ...prev, [key]: value[0] }));
  };

  // Generate points for the graph based on parameters
  const points = useMemo(() => {
    const pts: [number, number][] = [];
    const steps = 100;

    const tType = graphType?.toLowerCase() || '';
    const tTitle = title?.toLowerCase() || '';
    const tX = xAxis?.toLowerCase() || '';
    const tY = yAxis?.toLowerCase() || '';

    // Helper to get param safely
    const getP = (names: string[], def: number) => {
      for (const n of names) {
        if (params[n] !== undefined) return params[n];
      }
      return def;
    };

    // ─── STAGE 1: TRY SAFE DYNAMIC EVALUATION ────────────────────────
    let evalSuccess = false;
    try {
      let expr = equation.includes('=') ? equation.split('=')[1] : equation;
      expr = expr.trim();

      // Only proceed if it looks like a formula and not a description
      if (expr && !expr.toLowerCase().includes('empirical') && !expr.toLowerCase().includes('curve')) {
        // 1. Replace Greek letters and LaTeX symbols
        expr = expr.replace(/\\lambda|λ/g, 'lambda');
        expr = expr.replace(/\\phi|Φ|ϕ/g, 'phi');
        expr = expr.replace(/\\theta|θ/g, 'theta');
        expr = expr.replace(/\\omega|ω/g, 'omega');
        expr = expr.replace(/\\nu|ν/g, 'nu');
        expr = expr.replace(/\\pi|π/g, 'pi');
        
        // 2. Replace e^ with 2.71828**
        expr = expr.replace(/e\^/g, '2.71828**');
        // Replace ^ with **
        expr = expr.replace(/\^/g, '**');
        
        // 3. Convert standard math functions
        expr = expr.replace(/exp\(/g, 'Math.exp(');
        expr = expr.replace(/sin\(/g, 'Math.sin(');
        expr = expr.replace(/cos\(/g, 'Math.cos(');
        expr = expr.replace(/tan\(/g, 'Math.tan(');
        expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');

        // 4. Identify the independent variable (xVar)
        // Find whichever variable in the equation is NOT in the sliders (params)
        const possibleVars = ['x', 't', 'v', 'V', 'f', 'r', 'd', 'A'];
        let xVar = 'x';
        for (const v of possibleVars) {
          if (expr.includes(v) && params[v] === undefined) {
            xVar = v;
            break;
          }
        }

        // Setup bounds
        const xMin = tX.includes('voltage') ? -5 : 0;
        const xMax = 10;

        // Build substitution map (sorted by length desc to avoid partial collisions)
        const scopeValues: Record<string, number> = {
          ...params,
          pi: Math.PI,
          kT: 1,
          h: 1.2,
          e: 1,
          k: 1
        };

        for (let i = 0; i <= steps; i++) {
          const xVal = xMin + (xMax - xMin) * (i / steps);
          scopeValues[xVar] = xVal;

          let evalExpr = expr;
          const sortedKeys = Object.keys(scopeValues).sort((a, b) => b.length - a.length);
          sortedKeys.forEach(key => {
            if (key.trim() === '') return;
            const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
            evalExpr = evalExpr.replace(regex, String(scopeValues[key]));
          });

          // Strict safety filter: only allow numbers, math operators, decimals, spaces, and 'Math.'
          const safeExpr = evalExpr.replace(/Math\.(exp|sin|cos|tan|sqrt|pow|log|abs)/g, '');
          if (/[^0-9.+\-*\/()\s]/.test(safeExpr)) {
            throw new Error("Unsafe characters detected: " + evalExpr);
          }

          const yVal = new Function(`return (${evalExpr})`)();
          if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
            pts.push([xVal, yVal]);
          }
        }

        if (pts.length > 5) {
          evalSuccess = true;
        }
      }
    } catch (err) {
      // Quietly fall back to dictionary if evaluation fails
      pts.length = 0; // Clear partial points
    }

    // ─── STAGE 2: FALLBACK TO DETERMINISTIC DICTIONARY ───────────────
    if (!evalSuccess) {
      // 1. KINEMATICS: Velocity-Time Graph
      if (tType === 'velocity_time' || (tY.includes('velocity') && tX.includes('time'))) {
        const u = getP(['u', 'initial_velocity', 'v0'], 0);
        const a = getP(['a', 'acceleration'], 2);
        const tMax = 10;
        for (let i = 0; i <= steps; i++) {
          const t = (tMax / steps) * i;
          pts.push([t, u + a * t]);
        }
      }
      // 2. KINEMATICS: Displacement-Time Graph
      else if (tType === 'displacement_time' || ((tY.includes('displacement') || tY.includes('position')) && tX.includes('time'))) {
        const u = getP(['u', 'initial_velocity', 'v0'], 0);
        const a = getP(['a', 'acceleration'], 2);
        const tMax = 10;
        for (let i = 0; i <= steps; i++) {
          const t = (tMax / steps) * i;
          pts.push([t, u * t + 0.5 * a * t * t]);
        }
      }
      // 3. KINEMATICS: Acceleration-Time Graph
      else if (tY.includes('acceleration') && tX.includes('time')) {
        const a = getP(['a', 'acceleration'], 2);
        const tMax = 10;
        for (let i = 0; i <= steps; i++) {
          const t = (tMax / steps) * i;
          pts.push([t, a]);
        }
      }
      // 4. PROJECTILE PATH
      else if (tType === 'projectile_path' || tTitle.includes('projectile') || tTitle.includes('trajectory')) {
        const u = getP(['u', 'velocity', 'speed'], 20);
        const thetaDeg = getP(['theta', 'angle'], 45);
        const theta = (thetaDeg * Math.PI) / 180;
        const g = 9.8;
        const range = (u * u * Math.sin(2 * theta)) / g;
        const xMax = range > 0 ? range * 1.1 : 50;
        const cosT = Math.cos(theta);
        for (let i = 0; i <= steps; i++) {
          const x = (xMax / steps) * i;
          const y = x * Math.tan(theta) - (g * x * x) / (2 * u * u * cosT * cosT);
          if (y >= -2) {
            pts.push([x, Math.max(0, y)]);
          }
        }
      }
      // 5. SIMPLE HARMONIC MOTION (SHM)
      else if (tType === 'shm' || tTitle.includes('shm') || tTitle.includes('harmonic') || tTitle.includes('oscillation')) {
        const A = getP(['A', 'amplitude'], 5);
        const omega = getP(['omega', 'frequency', 'w'], 1.5);
        const phi = getP(['phi', 'phase'], 0) * Math.PI / 180;
        const tMax = 10;
        for (let i = 0; i <= steps; i++) {
          const t = (tMax / steps) * i;
          pts.push([t, A * Math.sin(omega * t + phi)]);
        }
      }
      // 6. SPRING POTENTIAL ENERGY (WPE)
      else if (tTitle.includes('spring') || (tTitle.includes('potential energy') && tTitle.includes('spring')) || tY.includes('spring potential')) {
        const k = getP(['k', 'spring_constant'], 5);
        const xMin = -5;
        const xMax = 5;
        for (let i = 0; i <= steps; i++) {
          const x = xMin + ((xMax - xMin) / steps) * i;
          pts.push([x, 0.5 * k * x * x]);
        }
      }
      // 7. GRAVITATION / ELECTROSTATICS: Field or Potential vs Distance
      else if (tTitle.includes('field') || tTitle.includes('gravitational') || tTitle.includes('electrostatic') || tY.includes('electric field') || tY.includes('gravitational field')) {
        const Q_M = getP(['Q', 'M', 'charge', 'mass'], 5);
        const R = getP(['R', 'radius'], 3); // surface radius
        const rMax = 10;
        for (let i = 0; i <= steps; i++) {
          const r = (rMax / steps) * i;
          let value = 0;
          if (r < R) {
            value = (Q_M * r) / (R * R * R);
          } else {
            value = Q_M / (r * r || 0.1);
          }
          pts.push([r, value]);
        }
      }
      // 8. THERMODYNAMICS: P-V Curves
      else if (tTitle.includes('isothermal') || tTitle.includes('adiabatic') || tTitle.includes('thermodynamic') || (tY.includes('pressure') && tX.includes('volume'))) {
        const nRT = getP(['nRT', 'temperature', 'T', 'c'], 20);
        const gamma = tTitle.includes('adiabatic') ? 1.4 : 1.0;
        const vMin = 2;
        const vMax = 12;
        for (let i = 0; i <= steps; i++) {
          const V = vMin + ((vMax - vMin) / steps) * i;
          const P = nRT / Math.pow(V, gamma);
          pts.push([V, P]);
        }
      }
      // 9. CAPACITOR / INDUCTOR: Charging & Discharging (LR / RC)
      else if (tTitle.includes('capacitor') || tTitle.includes('charging') || tTitle.includes('discharging') || tTitle.includes('inductor')) {
        const maxVal = getP(['V0', 'I0', 'q0', 'max_value'], 10);
        const tau = getP(['tau', 'time_constant', 'RC', 'L_R'], 2);
        const isDecay = tTitle.includes('discharging') || tTitle.includes('decay');
        const tMax = 10;
        for (let i = 0; i <= steps; i++) {
          const t = (tMax / steps) * i;
          const val = isDecay ? maxVal * Math.exp(-t / tau) : maxVal * (1 - Math.exp(-t / tau));
          pts.push([t, val]);
        }
      }
      // 10. AC CIRCUITS: LCR Resonance Curve
      else if (tTitle.includes('resonance') || tTitle.includes('lcr') || tTitle.includes('impedance')) {
        const V0 = getP(['V0', 'amplitude'], 10);
        const R = getP(['R', 'resistance'], 2);
        const L = getP(['L', 'inductance'], 1);
        const C = getP(['C', 'capacitance'], 0.5);
        const wMin = 0.1;
        const wMax = 5.0;
        for (let i = 0; i <= steps; i++) {
          const w = wMin + ((wMax - wMin) / steps) * i;
          const XC = 1 / (w * C);
          const XL = w * L;
          const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));
          const I = V0 / Z;
          pts.push([w, I]);
        }
      }
      // 11. PHOTOELECTRIC: Photocurrent vs Voltage
      else if (tType === 'photoelectric_iv' || tTitle.includes('photocurrent') || tY.includes('photocurrent')) {
        const I_sat = getP(['intensity', 'I', 'I_sat'], 5);
        const freq = getP(['frequency', 'nu', 'v', 'f'], 5);
        const V0 = freq * 0.8;
        const xMin = -5;
        const xMax = 10;
        for (let i = 0; i <= steps; i++) {
          const V = xMin + (xMax - xMin) * (i / steps);
          let I = 0;
          if (V >= -V0) {
            I = I_sat * (1 - Math.exp(-(V + V0)));
          }
          pts.push([V, I]);
        }
      }
      // 12. PHOTOELECTRIC: Stopping Potential vs Frequency
      else if (tType === 'photoelectric_svsf' || tTitle.includes('stopping potential') || tY.includes('stopping potential')) {
        const phi = getP(['phi', 'work_function', 'W'], 2);
        const h_e = 1.2;
        const vMin = 0;
        const vMax = 10;
        for (let i = 0; i <= steps; i++) {
          const v = vMin + (vMax - vMin) * (i / steps);
          const V0 = h_e * v - phi;
          pts.push([v, V0]);
        }
      }
      // 13. NUCLEAR: Radioactive Decay
      else if (tType === 'radioactive_decay' || tTitle.includes('nuclei') || tTitle.includes('decay') || tY.includes('nuclei')) {
        const N0 = getP(['N0', 'initial_nuclei', 'N_0'], 400);
        const lambda = getP(['lambda', 'decay_constant'], 0.5);
        const tMin = 0;
        const tMax = 10;
        for (let i = 0; i <= steps; i++) {
          const t = tMin + (tMax - tMin) * (i / steps);
          pts.push([t, N0 * Math.exp(-lambda * t)]);
        }
      }
      // 14. NUCLEAR: Binding Energy per Nucleon
      else if (tType === 'binding_energy' || tTitle.includes('binding energy') || tY.includes('binding energy')) {
        const aMin = 1;
        const aMax = 240;
        for (let i = 0; i <= steps; i++) {
          const A = aMin + (aMax - aMin) * (i / steps);
          const be = 8.8 * (1 - Math.exp(-0.05 * A)) - 0.004 * A;
          pts.push([A, be]);
        }
      }
      // 15. WAVE OPTICS / YDSE Intensity
      else if (tTitle.includes('ydse') || tTitle.includes('interference') || tTitle.includes('fringe') || tY.includes('intensity')) {
        const I0 = getP(['I0', 'intensity', 'I_max'], 8);
        const d = getP(['d', 'slit_width'], 2);
        const xMin = -5;
        const xMax = 5;
        for (let i = 0; i <= steps; i++) {
          const x = xMin + ((xMax - xMin) / steps) * i;
          const beta = d * x;
          const I = I0 * Math.pow(Math.cos(beta), 2);
          pts.push([x, I]);
        }
      }
      // 16. FRICTION: Static & Kinetic
      else if (tTitle.includes('friction') || tY.includes('friction')) {
        const mu_s = getP(['mu_s', 'static_friction'], 0.6);
        const mu_k = getP(['mu_k', 'kinetic_friction'], 0.4);
        const N = getP(['N', 'normal_force'], 10);
        const f_max_s = mu_s * N;
        const f_k = mu_k * N;
        const fMax = 10;
        for (let i = 0; i <= steps; i++) {
          const F = (fMax / steps) * i;
          let f = 0;
          if (F <= f_max_s) {
            f = F;
          } else {
            f = f_k;
          }
          pts.push([F, f]);
        }
      }
      // 🚀 17. FINAL GENERAL DUMMY FALLBACK
      else {
        const firstParam = Object.values(params)[0] ?? 5;
        const xMin = 0;
        const xMax = 10;
        for (let i = 0; i <= steps; i++) {
          const x = xMin + (xMax - xMin) * (i / steps);
          pts.push([x, (firstParam / 5) * x]);
        }
      }
    }

    return pts;
  }, [graphType, params, equation, title]);

  // Compute graph bounds
  const xVals = points.map(([x]) => x);
  const yVals = points.map(([, y]) => y);
  const xMin = xVals.length ? Math.min(...xVals, 0) : 0;
  const xMax = xVals.length ? Math.max(...xVals, 10) : 10;
  const yMin = yVals.length ? Math.min(...yVals, -5) : -5;
  const yMax = yVals.length ? Math.max(...yVals, 10) : 10;

  // Render SVG properties
  const W = 500;
  const H = 300;
  const pad = { top: 20, bottom: 40, left: 50, right: 20 };
  const graphW = W - pad.left - pad.right;
  const graphH = H - pad.top - pad.bottom;

  const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin || 1)) * graphW;
  const toSvgY = (y: number) => pad.top + graphH - ((y - yMin) / (yMax - yMin || 1)) * graphH;

  const pathD = useMemo(() => {
    if (!points.length) return '';
    return points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(x)} ${toSvgY(y)}`)
      .join(' ');
  }, [points, xMin, xMax, yMin, yMax]);

  return (
    <Card className="my-8 overflow-hidden border border-border bg-card shadow-lg rounded-2xl">
      <CardHeader className="bg-secondary/40 border-b border-border/60 py-4 px-6">
        <CardTitle className="text-title-md font-bold text-foreground flex items-center gap-2">
          📈 {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 grid md:grid-cols-[1.5fr_1fr] gap-6 items-center">
        {/* Left: SVG Plot */}
        <div className="relative w-full aspect-[5/3] bg-slate-950 dark:bg-black rounded-xl p-2 border border-border/80 flex items-center justify-center">
          <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`}>
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const xVal = xMin + ratio * (xMax - xMin);
              const yVal = yMin + ratio * (yMax - yMin);
              const sx = toSvgX(xVal);
              const sy = toSvgY(yVal);
              return (
                <React.Fragment key={i}>
                  {/* Vertical grid line */}
                  <line x1={sx} y1={pad.top} x2={sx} y2={pad.top + graphH} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3,3" />
                  <text x={sx} y={pad.top + graphH + 15} fill="rgba(255,255,255,0.4)" fontSize={9} textAnchor="middle" fontFamily="monospace">
                    {xVal.toFixed(1)}
                  </text>
                  {/* Horizontal grid line */}
                  <line x1={pad.left} y1={sy} x2={pad.left + graphW} y2={sy} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3,3" />
                  <text x={pad.left - 8} y={sy} fill="rgba(255,255,255,0.4)" fontSize={9} textAnchor="end" dominantBaseline="middle" fontFamily="monospace">
                    {yVal.toFixed(1)}
                  </text>
                </React.Fragment>
              );
            })}

            {/* Plotted Line */}
            <path d={pathD} stroke="#2563eb" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" />

            {/* Axes */}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + graphH} stroke="white" strokeWidth={2} />
            <line x1={pad.left} y1={pad.top + graphH} x2={pad.left + graphW} y2={pad.top + graphH} stroke="white" strokeWidth={2} />

            {/* Axis Titles */}
            <text x={pad.left + graphW / 2} y={H - 5} fill="white" fontSize={11} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
              {xAxis}
            </text>
            <text x={12} y={pad.top + graphH / 2} fill="white" fontSize={11} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 12 ${pad.top + graphH / 2})`}>
              {yAxis}
            </text>
          </svg>
        </div>

        {/* Right: Parameter Sliders */}
        <div className="space-y-6">
          <div className="space-y-1.5 border-b border-border/60 pb-3">
            <span className="text-caption font-bold text-muted-foreground uppercase tracking-widest">Tweak Parameters</span>
            <p className="text-body-sm font-semibold text-foreground">Formula: <code className="bg-secondary px-1.5 py-0.5 rounded font-mono text-xs">{equation}</code></p>
          </div>
          <div className="space-y-5">
            {Object.entries(sliders).map(([key, config]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center text-body-sm font-bold text-foreground">
                  <Label htmlFor={`slider-${key}`}>{config.label}</Label>
                  <span className="font-mono text-accent">
                    {params[key]?.toFixed(1)} {config.unit}
                  </span>
                </div>
                <Slider
                  id={`slider-${key}`}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={[params[key] ?? config.default]}
                  onValueChange={(val) => handleSliderChange(key, val)}
                  className="py-1"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
