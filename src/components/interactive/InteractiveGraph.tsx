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

    if (graphType === 'velocity_time') {
      const u = params.u ?? 0;
      const a = params.a ?? 0;
      const tMax = 10;
      for (let i = 0; i <= steps; i++) {
        const t = (tMax / steps) * i;
        const v = u + a * t;
        pts.push([t, v]);
      }
    } else if (graphType === 'displacement_time') {
      const u = params.u ?? 0;
      const a = params.a ?? 0;
      const tMax = 10;
      for (let i = 0; i <= steps; i++) {
        const t = (tMax / steps) * i;
        const s = u * t + 0.5 * a * t * t;
        pts.push([t, s]);
      }
    } else if (graphType === 'projectile_path') {
      const u = params.u ?? 20;
      const thetaDeg = params.theta ?? 45;
      const theta = (thetaDeg * Math.PI) / 180;
      const g = 9.8;
      
      // Calculate max range to fit graph
      const range = (u * u * Math.sin(2 * theta)) / g;
      const xMax = range > 0 ? range * 1.1 : 50;

      for (let i = 0; i <= steps; i++) {
        const x = (xMax / steps) * i;
        // y = x*tan(theta) - g*x^2/(2*u^2*cos(theta)^2)
        const cosT = Math.cos(theta);
        const y = x * Math.tan(theta) - (g * x * x) / (2 * u * u * cosT * cosT);
        if (y >= -2) { // Allow slight overshoot for visual clean boundary
          pts.push([x, Math.max(0, y)]);
        }
      }
    } else if (graphType === 'shm') {
      const A = params.A ?? 5;
      const omega = params.omega ?? 1.5;
      const phi = (params.phi ?? 0) * Math.PI / 180;
      const tMax = 10;
      for (let i = 0; i <= steps; i++) {
        const t = (tMax / steps) * i;
        const x = A * Math.sin(omega * t + phi);
        pts.push([t, x]);
      }
    }
    return pts;
  }, [graphType, params]);

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
