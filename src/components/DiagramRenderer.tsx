import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   DIAGRAM DATA TYPES
───────────────────────────────────────────────────────────────────────────── */
export type Force = {
  label: string;
  dir: 'up' | 'down' | 'left' | 'right' | 'upright' | 'upleft';
  color?: string;
  magnitude?: number; // relative 0-1, default 1
};

export type CurvePoint = [number, number]; // [x, y]
export type Curve = {
  label: string;
  color?: string;
  points: CurvePoint[];
  dashed?: boolean;
};

export type GeomSide = { label: string; value?: string };
export type GeomAngle = { vertex: number; label: string; color?: string };

export type ReactionStep = {
  formula: string;
  arrow?: string; // label on arrow (e.g. "heat", "→")
  color?: string;
};

export type EnergyBar = { label: string; value: number; color?: string };

export type DiagramData =
  | { type: 'fbd'; title?: string; forces: Force[]; bodyLabel?: string }
  | { type: 'graph'; title?: string; xLabel?: string; yLabel?: string; curves: Curve[] }
  | { type: 'geometry'; title?: string; vertices: [number, number][]; sides?: GeomSide[]; angles?: GeomAngle[] }
  | { type: 'reaction'; title?: string; steps: ReactionStep[] }
  | { type: 'energy'; title?: string; bars: EnergyBar[] };

/* ─────────────────────────────────────────────────────────────────────────────
   CHALK PALETTE
───────────────────────────────────────────────────────────────────────────── */
const CHALK_WHITE  = 'rgba(255,255,255,0.92)';
const CHALK_GREEN  = '#86EFAC';
const CHALK_YELLOW = '#FCD34D';
const CHALK_BLUE   = '#93C5FD';
const CHALK_RED    = '#FCA5A5';
const BG           = '#132a14';

const DEFAULT_FORCE_COLORS: Record<string, string> = {
  N:     CHALK_BLUE,
  up:    CHALK_BLUE,
  down:  CHALK_RED,
  left:  CHALK_YELLOW,
  right: CHALK_GREEN,
  upright: CHALK_GREEN,
  upleft:  CHALK_YELLOW,
};

/* ─────────────────────────────────────────────────────────────────────────────
   ARROW HELPER (SVG)
───────────────────────────────────────────────────────────────────────────── */
function Arrow({
  x1, y1, x2, y2, color, label, labelPos = 'end',
}: {
  x1: number; y1: number; x2: number; y2: number;
  color: string; label: string; labelPos?: 'end' | 'mid';
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;

  // arrowhead
  const hLen = 10;
  const hAngle = 0.4;
  const px1 = x2 - hLen * (ux * Math.cos(hAngle) - uy * Math.sin(hAngle));
  const py1 = y2 - hLen * (uy * Math.cos(hAngle) + ux * Math.sin(hAngle));
  const px2 = x2 - hLen * (ux * Math.cos(-hAngle) - uy * Math.sin(-hAngle));
  const py2 = y2 - hLen * (uy * Math.cos(-hAngle) + ux * Math.sin(-hAngle));

  const lx = labelPos === 'end' ? x2 + ux * 8 : (x1 + x2) / 2;
  const ly = labelPos === 'end' ? y2 + uy * 8 : (y1 + y2) / 2 - 6;

  const textAnchor = dx > 5 ? 'start' : dx < -5 ? 'end' : 'middle';

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${px1},${py1} ${px2},${py2}`} fill={color} />
      <text x={lx} y={ly} fill={color} fontSize={11} fontFamily="monospace" fontWeight="bold" textAnchor={textAnchor} dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FREE BODY DIAGRAM
───────────────────────────────────────────────────────────────────────────── */
function FBDDiagram({ data }: { data: Extract<DiagramData, { type: 'fbd' }> }) {
  const W = 260; const H = 260;
  const cx = W / 2; const cy = H / 2;
  const bSize = 36;
  const armLen = 70;

  const dirVec: Record<string, [number, number]> = {
    up:      [0, -1],
    down:    [0,  1],
    left:    [-1, 0],
    right:   [1,  0],
    upright: [0.707, -0.707],
    upleft:  [-0.707, -0.707],
  };

  const countByDir: Record<string, number> = {};
  data.forces.forEach(f => {
    countByDir[f.dir] = (countByDir[f.dir] || 0) + 1;
  });
  const offsetByDir: Record<string, number> = {};

  const forceArrows = data.forces.map((f, idx) => {
    const [vx, vy] = dirVec[f.dir] ?? [1, 0];
    const mag = (f.magnitude ?? 1) * armLen;
    const color = f.color ?? DEFAULT_FORCE_COLORS[f.dir] ?? CHALK_WHITE;

    // spread multiple arrows in same direction
    offsetByDir[f.dir] = (offsetByDir[f.dir] ?? 0);
    const offset = (offsetByDir[f.dir] - (countByDir[f.dir] - 1) / 2) * 14;
    offsetByDir[f.dir]++;

    const perp = f.dir === 'up' || f.dir === 'down' ? [offset, 0] : [0, offset];
    const sx = cx + perp[0];
    const sy = cy + perp[1];

    return (
      <Arrow
        key={idx}
        x1={sx} y1={sy}
        x2={sx + vx * mag} y2={sy + vy * mag}
        color={color} label={f.label}
      />
    );
  });

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Body */}
      <rect x={cx - bSize / 2} y={cy - bSize / 2} width={bSize} height={bSize}
        fill="rgba(25,70,30,0.8)" stroke={CHALK_WHITE} strokeWidth={2} rx={3} />
      <text x={cx} y={cy} fill={CHALK_WHITE} fontSize={11} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
        {data.bodyLabel ?? 'm'}
      </text>
      {/* Surface line */}
      <line x1={cx - 60} y1={cy + bSize / 2 + 2} x2={cx + 60} y2={cy + bSize / 2 + 2}
        stroke={CHALK_WHITE} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
      {forceArrows}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GRAPH (CARTESIAN)
───────────────────────────────────────────────────────────────────────────── */
function GraphDiagram({ data }: { data: Extract<DiagramData, { type: 'graph' }> }) {
  const W = 320; const H = 240;
  const pad = { l: 48, r: 20, t: 20, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  // Auto-scale from all curve points
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  data.curves.forEach(c => c.points.forEach(([x, y]) => {
    if (x < xMin) xMin = x; if (x > xMax) xMax = x;
    if (y < yMin) yMin = y; if (y > yMax) yMax = y;
  }));
  if (xMin === xMax) { xMin -= 1; xMax += 1; }
  if (yMin === yMax) { yMin -= 1; yMax += 1; }
  // Add 10% padding
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  xMin -= xRange * 0.05; xMax += xRange * 0.05;
  yMin -= yRange * 0.1;  yMax += yRange * 0.1;

  const toSvgX = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  // Grid lines
  const xTicks = 5; const yTicks = 4;
  const gridLines = [];
  for (let i = 0; i <= xTicks; i++) {
    const x = xMin + (xRange / xTicks) * i;
    const sx = toSvgX(x);
    gridLines.push(
      <line key={`gx${i}`} x1={sx} y1={pad.t} x2={sx} y2={pad.t + plotH}
        stroke="rgba(255,255,255,0.08)" strokeWidth={1} />,
      <text key={`tx${i}`} x={sx} y={pad.t + plotH + 14} fill="rgba(255,255,255,0.5)"
        fontSize={9} textAnchor="middle" fontFamily="monospace">
        {Number(x.toFixed(1))}
      </text>
    );
  }
  for (let i = 0; i <= yTicks; i++) {
    const y = yMin + (yRange / yTicks) * i;
    const sy = toSvgY(y);
    gridLines.push(
      <line key={`gy${i}`} x1={pad.l} y1={sy} x2={pad.l + plotW} y2={sy}
        stroke="rgba(255,255,255,0.08)" strokeWidth={1} />,
      <text key={`ty${i}`} x={pad.l - 6} y={sy} fill="rgba(255,255,255,0.5)"
        fontSize={9} textAnchor="end" dominantBaseline="middle" fontFamily="monospace">
        {Number(y.toFixed(1))}
      </text>
    );
  }

  const curveColors = [CHALK_BLUE, CHALK_GREEN, CHALK_YELLOW, CHALK_RED];

  const curvePaths = data.curves.map((c, ci) => {
    const color = c.color ?? curveColors[ci % curveColors.length];
    const d = c.points.map(([x, y], i) =>
      `${i === 0 ? 'M' : 'L'} ${toSvgX(x)} ${toSvgY(y)}`
    ).join(' ');
    // label at last point
    const [lx, ly] = c.points[c.points.length - 1];
    return (
      <g key={ci}>
        <path d={d} stroke={color} strokeWidth={2.2} fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={c.dashed ? '6,3' : undefined} />
        <text x={toSvgX(lx) + 5} y={toSvgY(ly)} fill={color}
          fontSize={10} fontFamily="monospace" fontWeight="bold" dominantBaseline="middle">
          {c.label}
        </text>
      </g>
    );
  });

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {gridLines}
      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + plotH + 6}
        stroke={CHALK_WHITE} strokeWidth={2} />
      <line x1={pad.l - 6} y1={pad.t + plotH} x2={pad.l + plotW} y2={pad.t + plotH}
        stroke={CHALK_WHITE} strokeWidth={2} />
      {/* Axis arrowheads */}
      <polygon points={`${pad.l},${pad.t - 2} ${pad.l - 4},${pad.t + 8} ${pad.l + 4},${pad.t + 8}`}
        fill={CHALK_WHITE} />
      <polygon points={`${pad.l + plotW + 2},${pad.t + plotH} ${pad.l + plotW - 8},${pad.t + plotH - 4} ${pad.l + plotW - 8},${pad.t + plotH + 4}`}
        fill={CHALK_WHITE} />
      {/* Axis labels */}
      <text x={pad.l - 10} y={pad.t - 6} fill={CHALK_WHITE} fontSize={11}
        fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        {data.yLabel ?? 'y'}
      </text>
      <text x={pad.l + plotW + 10} y={pad.t + plotH + 2} fill={CHALK_WHITE} fontSize={11}
        fontFamily="monospace" fontWeight="bold" dominantBaseline="middle">
        {data.xLabel ?? 'x'}
      </text>
      {curvePaths}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHEMISTRY REACTION FLOW
───────────────────────────────────────────────────────────────────────────── */
function ReactionDiagram({ data }: { data: Extract<DiagramData, { type: 'reaction' }> }) {
  const H = 90;
  const stepW = 110;
  const arrowW = 50;
  const totalW = data.steps.length * stepW + (data.steps.length - 1) * arrowW + 32;
  const cy = H / 2;

  const colors = [CHALK_BLUE, CHALK_GREEN, CHALK_YELLOW, CHALK_RED];

  return (
    <svg width={Math.max(totalW, 260)} height={H} viewBox={`0 0 ${Math.max(totalW, 260)} ${H}`}>
      {data.steps.map((step, i) => {
        const color = step.color ?? colors[i % colors.length];
        const boxX = 16 + i * (stepW + arrowW);
        const boxY = cy - 20;

        return (
          <g key={i}>
            {/* Box */}
            <rect x={boxX} y={boxY} width={stepW} height={40} rx={6}
              fill="rgba(20,50,25,0.9)" stroke={color} strokeWidth={1.8} />
            {/* Formula text — wrap if long */}
            <text x={boxX + stepW / 2} y={cy} fill={color} fontSize={12}
              fontFamily="monospace" fontWeight="bold"
              textAnchor="middle" dominantBaseline="middle">
              {step.formula}
            </text>
            {/* Arrow to next */}
            {i < data.steps.length - 1 && (
              <g>
                <line
                  x1={boxX + stepW} y1={cy}
                  x2={boxX + stepW + arrowW - 8} y2={cy}
                  stroke={CHALK_WHITE} strokeWidth={2} />
                <polygon
                  points={`${boxX + stepW + arrowW - 2},${cy} ${boxX + stepW + arrowW - 10},${cy - 4} ${boxX + stepW + arrowW - 10},${cy + 4}`}
                  fill={CHALK_WHITE} />
                {step.arrow && (
                  <text
                    x={boxX + stepW + arrowW / 2} y={cy - 10}
                    fill="rgba(255,255,255,0.7)" fontSize={9}
                    fontFamily="monospace" textAnchor="middle">
                    {step.arrow}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ENERGY BAR DIAGRAM
───────────────────────────────────────────────────────────────────────────── */
function EnergyDiagram({ data }: { data: Extract<DiagramData, { type: 'energy' }> }) {
  const W = 280; const H = 180;
  const maxVal = Math.max(...data.bars.map(b => b.value), 1);
  const barW = Math.min(50, (W - 48) / data.bars.length - 12);
  const plotH = 120;
  const baseY = H - 32;
  const colors = [CHALK_BLUE, CHALK_GREEN, CHALK_YELLOW, CHALK_RED];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* baseline */}
      <line x1={24} y1={baseY} x2={W - 8} y2={baseY} stroke={CHALK_WHITE} strokeWidth={1.5} />
      {data.bars.map((bar, i) => {
        const color = bar.color ?? colors[i % colors.length];
        const bh = (bar.value / maxVal) * plotH;
        const bx = 40 + i * ((W - 48) / data.bars.length);
        const by = baseY - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} fill={color} opacity={0.75} rx={3} />
            <text x={bx + barW / 2} y={by - 6} fill={color} fontSize={10}
              fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {bar.value}
            </text>
            <text x={bx + barW / 2} y={baseY + 14} fill="rgba(255,255,255,0.75)" fontSize={10}
              fontFamily="monospace" textAnchor="middle">
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GEOMETRY DIAGRAM
───────────────────────────────────────────────────────────────────────────── */
function GeometryDiagram({ data }: { data: Extract<DiagramData, { type: 'geometry' }> }) {
  const W = 260; const H = 220;
  // Normalize vertices to fit the SVG with padding
  const pad = 36;
  const xs = data.vertices.map(v => v[0]);
  const ys = data.vertices.map(v => v[1]);
  const vxMin = Math.min(...xs); const vxMax = Math.max(...xs);
  const vyMin = Math.min(...ys); const vyMax = Math.max(...ys);
  const vxRange = vxMax - vxMin || 1;
  const vyRange = vyMax - vyMin || 1;

  const toSX = (x: number) => pad + ((x - vxMin) / vxRange) * (W - 2 * pad);
  const toSY = (y: number) => H - pad - ((y - vyMin) / vyRange) * (H - 2 * pad);

  const pts = data.vertices.map(([x, y]) => `${toSX(x)},${toSY(y)}`).join(' ');

  const sideLabels = (data.sides ?? []).map((s, i) => {
    const v1 = data.vertices[i];
    const v2 = data.vertices[(i + 1) % data.vertices.length];
    const mx = (toSX(v1[0]) + toSX(v2[0])) / 2;
    const my = (toSY(v1[1]) + toSY(v2[1])) / 2;
    const nx = -(toSY(v2[1]) - toSY(v1[1]));
    const ny = toSX(v2[0]) - toSX(v1[0]);
    const nl = Math.sqrt(nx * nx + ny * ny) || 1;
    return (
      <text key={i} x={mx + (nx / nl) * 14} y={my + (ny / nl) * 14}
        fill={CHALK_YELLOW} fontSize={11} fontFamily="monospace" fontWeight="bold"
        textAnchor="middle" dominantBaseline="middle">
        {s.value ?? s.label}
      </text>
    );
  });

  const angleLabels = (data.angles ?? []).map((a, i) => {
    const vi = a.vertex;
    const [vx, vy] = [toSX(data.vertices[vi][0]), toSY(data.vertices[vi][1])];
    return (
      <text key={i} x={vx + (vx < W / 2 ? -20 : 10)} y={vy + (vy < H / 2 ? -10 : 18)}
        fill={a.color ?? CHALK_GREEN} fontSize={11} fontFamily="monospace" fontWeight="bold">
        {a.label}
      </text>
    );
  });

  // vertex dots + labels
  const vertexLabels = data.vertices.map(([x, y], i) => (
    <g key={i}>
      <circle cx={toSX(x)} cy={toSY(y)} r={3} fill={CHALK_WHITE} />
      <text x={toSX(x) + (toSX(x) < W / 2 ? -10 : 8)} y={toSY(y) + (toSY(y) < H / 2 ? -8 : 14)}
        fill={CHALK_WHITE} fontSize={11} fontFamily="monospace" fontWeight="bold">
        {String.fromCharCode(65 + i)}
      </text>
    </g>
  ));

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polygon points={pts} fill="rgba(20,60,25,0.5)" stroke={CHALK_WHITE} strokeWidth={2} strokeLinejoin="round" />
      {sideLabels}
      {angleLabels}
      {vertexLabels}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN RENDERER (exported)
───────────────────────────────────────────────────────────────────────────── */
export function DiagramRenderer({ raw }: { raw: string }) {
  let data: DiagramData | null = null;
  try {
    data = JSON.parse(raw) as DiagramData;
  } catch {
    return (
      <div className="text-xs text-red-400 font-mono p-2">
        [Diagram parse error]
      </div>
    );
  }

  const inner = (() => {
    switch (data.type) {
      case 'fbd':       return <FBDDiagram data={data} />;
      case 'graph':     return <GraphDiagram data={data} />;
      case 'reaction':  return <ReactionDiagram data={data} />;
      case 'energy':    return <EnergyDiagram data={data} />;
      case 'geometry':  return <GeometryDiagram data={data} />;
      default:          return null;
    }
  })();

  if (!inner) return null;

  return (
    <div
      className="my-4 rounded-xl overflow-hidden flex flex-col items-center gap-2"
      style={{
        background: BG,
        border: '1.5px solid rgba(134,239,172,0.25)',
        padding: '16px 12px 10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.4)',
      }}
    >
      {data.title && (
        <p className="text-xs font-bold tracking-wide mb-1" style={{ color: CHALK_GREEN }}>
          {data.title}
        </p>
      )}
      {inner}
    </div>
  );
}
