import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

export interface SimulationEngineProps {
  type: 'projectile' | 'relative_motion' | 'shm';
  title: string;
}

export const SimulationEngine: React.FC<SimulationEngineProps> = ({ type, title }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Simulation params
  const [u, setU] = useState(25); // Projectile launch velocity (m/s)
  const [theta, setTheta] = useState(45); // Launch angle (degrees)
  const [g, setG] = useState(9.8); // Gravity (m/s^2)

  // Relative motion params
  const [vBoat, setVBoat] = useState(6); // Boat speed relative to river (m/s)
  const [vRiver, setVRiver] = useState(3); // River current speed (m/s)
  const [thetaBoat, setThetaBoat] = useState(90); // Heading angle (degrees)

  // SHM params
  const [amplitude, setAmplitude] = useState(4); // Amplitude (m)
  const [springK, setSpringK] = useState(15); // Spring constant k (N/m)
  const [mass, setMass] = useState(2); // Mass m (kg)

  // Animation ticks / time
  const [time, setTime] = useState(0);

  // Reset helper
  const handleReset = () => {
    setTime(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const update = () => {
        setTime((prev) => prev + 0.03); // frame increment
        animId = requestAnimationFrame(update);
      };
      animId = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Draw simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid backgrounds
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (type === 'projectile') {
      const groundY = canvas.height - 45;
      // Draw ground
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      const scale = 5; // Pixels per meter
      const launchX = 50;
      const angleRad = (theta * Math.PI) / 180;
      const ux = u * Math.cos(angleRad);
      const uy = u * Math.sin(angleRad);

      // Trajectory path (static)
      ctx.strokeStyle = 'rgba(59,130,246,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(launchX, groundY);
      for (let t = 0; t < 10; t += 0.05) {
        const x = launchX + ux * t * scale;
        const y = groundY - (uy * t - 0.5 * g * t * t) * scale;
        if (y > groundY) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Current position
      const cx = launchX + ux * time * scale;
      const cy = groundY - (uy * time - 0.5 * g * time * time) * scale;

      // Stop condition
      if (cy > groundY && time > 0) {
        setIsPlaying(false);
      }

      const clampedX = Math.min(cx, canvas.width - 20);
      const clampedY = Math.min(cy, groundY);

      // Draw vector components at current point
      if (isPlaying || time > 0) {
        const curVy = uy - g * time;
        ctx.strokeStyle = '#ef4444'; // Red for velocity
        ctx.lineWidth = 2;
        // Vx arrow
        ctx.beginPath();
        ctx.moveTo(clampedX, clampedY);
        ctx.lineTo(clampedX + ux * 1.5, clampedY);
        ctx.stroke();
        // Vy arrow
        ctx.beginPath();
        ctx.moveTo(clampedX, clampedY);
        ctx.lineTo(clampedX, clampedY - curVy * 1.5);
        ctx.stroke();
      }

      // Draw particle
      ctx.fillStyle = '#f59e0b'; // Amber ball
      ctx.beginPath();
      ctx.arc(clampedX, clampedY, 8, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'relative_motion') {
      const riverTop = 60;
      const riverBottom = canvas.height - 80;
      const riverWidth = riverBottom - riverTop;

      // Draw river banks
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, riverTop); ctx.lineTo(canvas.width, riverTop);
      ctx.moveTo(0, riverBottom); ctx.lineTo(canvas.width, riverBottom);
      ctx.stroke();

      // Draw river current lines
      ctx.fillStyle = 'rgba(59,130,246,0.15)';
      ctx.fillRect(0, riverTop, canvas.width, riverWidth);
      ctx.strokeStyle = 'rgba(59,130,246,0.3)';
      ctx.lineWidth = 2;
      for (let y = riverTop + 20; y < riverBottom; y += 30) {
        ctx.beginPath();
        ctx.moveTo((time * 40) % 200 - 40, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Boat calculations
      const scale = 12; 
      const startX = 60;
      const angleRad = (thetaBoat * Math.PI) / 180;
      // Boat movement vector
      const vx = vBoat * Math.cos(angleRad) + vRiver;
      const vy = -vBoat * Math.sin(angleRad); // negative since y-axis points down

      const curX = startX + vx * time * scale;
      const curY = riverBottom + vy * time * scale;

      // Stop condition
      if (curY <= riverTop) {
        setIsPlaying(false);
      }

      // Draw boat path
      ctx.strokeStyle = 'rgba(245,158,11,0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, riverBottom);
      ctx.lineTo(curX, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw boat
      ctx.fillStyle = '#34d399'; // Emerald boat
      ctx.save();
      ctx.translate(curX, curY);
      ctx.rotate(-angleRad + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(7, 8);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

    } else if (type === 'shm') {
      const centerY = canvas.height / 2;
      const equilibriumX = canvas.width / 2;
      const omega = Math.sqrt(springK / mass);

      // Mass position: x = A * sin(omega * t)
      const scale = 20; 
      const curX = equilibriumX + amplitude * Math.sin(omega * time) * scale;

      // Draw Spring
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(20, centerY);
      const coils = 30;
      const springW = curX - 20;
      for (let i = 0; i <= coils; i++) {
        const sx = 20 + (springW / coils) * i;
        const sy = centerY + (i % 2 === 0 ? 12 : -12) * (i === 0 || i === coils ? 0 : 1);
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Support Wall
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(10, centerY - 40, 10, 80);

      // Equilibrium Line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(equilibriumX, centerY - 60);
      ctx.lineTo(equilibriumX, centerY + 60);
      ctx.stroke();

      // Draw Mass Box
      const boxSize = 36;
      ctx.fillStyle = '#818cf8'; // Indigo block
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1.5;
      ctx.fillRect(curX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);
      ctx.strokeRect(curX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${mass}kg`, curX, centerY);
    }
  }, [type, time, u, theta, g, vBoat, vRiver, thetaBoat, amplitude, springK, mass, isPlaying]);

  return (
    <Card className="my-8 overflow-hidden border border-border bg-card shadow-lg rounded-2xl">
      <CardHeader className="bg-secondary/40 border-b border-border/60 py-4 px-6 flex flex-row items-center justify-between">
        <CardTitle className="text-title-md font-bold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500 animate-pulse" /> {title}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)} className="h-9 px-3 rounded-lg flex items-center gap-1">
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-foreground" /> : <Play className="w-3.5 h-3.5 fill-foreground" />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid md:grid-cols-[1.5fr_1fr] gap-6 items-center">
        {/* Canvas area */}
        <div className="relative w-full aspect-[5/3] bg-slate-950 dark:bg-black rounded-xl p-2 border border-border/80 flex items-center justify-center">
          <canvas ref={canvasRef} width={500} height={300} className="w-full h-full object-contain" />
          {/* Live Data Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-white/10 rounded-lg p-2.5 font-mono text-[10px] text-emerald-400 space-y-0.5">
            <div>TIME: {time.toFixed(2)}s</div>
            {type === 'projectile' && (
              <>
                <div>X-DIST: {(u * Math.cos((theta * Math.PI) / 180) * time).toFixed(1)}m</div>
                <div>HEIGHT: {Math.max(0, u * Math.sin((theta * Math.PI) / 180) * time - 0.5 * g * time * time).toFixed(1)}m</div>
              </>
            )}
            {type === 'relative_motion' && (
              <>
                <div>CROSSING: {Math.min(100, Math.round(((time * vBoat * Math.sin((thetaBoat * Math.PI) / 180)) / 15) * 100))}%</div>
                <div>DRIFT: {( (vBoat * Math.cos((thetaBoat * Math.PI) / 180) + vRiver) * time ).toFixed(1)}m</div>
              </>
            )}
            {type === 'shm' && (
              <>
                <div>VELOCITY: {(amplitude * Math.sqrt(springK / mass) * Math.cos(Math.sqrt(springK / mass) * time)).toFixed(1)}m/s</div>
                <div>DISPL: {(amplitude * Math.sin(Math.sqrt(springK / mass) * time)).toFixed(1)}m</div>
              </>
            )}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6 text-left">
          <div className="space-y-1.5 border-b border-border/60 pb-3">
            <span className="text-caption font-bold text-muted-foreground uppercase tracking-widest">Tweak Parameters</span>
            <p className="text-body-sm font-semibold text-foreground">Interactive Simulation Controls</p>
          </div>
          
          {type === 'projectile' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Launch Speed (u)</Label>
                  <span className="font-mono text-accent">{u} m/s</span>
                </div>
                <Slider min={10} max={40} step={1} value={[u]} onValueChange={(val) => setU(val[0])} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Launch Angle (θ)</Label>
                  <span className="font-mono text-accent">{theta}°</span>
                </div>
                <Slider min={15} max={75} step={1} value={[theta]} onValueChange={(val) => setTheta(val[0])} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Gravity (g)</Label>
                  <span className="font-mono text-accent">{g} m/s²</span>
                </div>
                <Slider min={5} max={20} step={0.1} value={[g]} onValueChange={(val) => setG(val[0])} />
              </div>
            </div>
          )}

          {type === 'relative_motion' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Boat Velocity (v_b)</Label>
                  <span className="font-mono text-accent">{vBoat} m/s</span>
                </div>
                <Slider min={2} max={12} step={0.5} value={[vBoat]} onValueChange={(val) => setVBoat(val[0])} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>River Current (v_r)</Label>
                  <span className="font-mono text-accent">{vRiver} m/s</span>
                </div>
                <Slider min={0} max={8} step={0.5} value={[vRiver]} onValueChange={(val) => setVRiver(val[0])} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Boat Heading Angle</Label>
                  <span className="font-mono text-accent">{thetaBoat}°</span>
                </div>
                <Slider min={30} max={150} step={1} value={[thetaBoat]} onValueChange={(val) => setThetaBoat(val[0])} />
              </div>
            </div>
          )}

          {type === 'shm' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Amplitude (A)</Label>
                  <span className="font-mono text-accent">{amplitude} m</span>
                </div>
                <Slider min={1} max={6} step={0.2} value={[amplitude]} onValueChange={(val) => setAmplitude(val[0])} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Spring Constant (k)</Label>
                  <span className="font-mono text-accent">{springK} N/m</span>
                </div>
                <Slider min={5} max={30} step={1} value={[springK]} onValueChange={(val) => setSpringK(val[0])} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-bold">
                  <Label>Block Mass (m)</Label>
                  <span className="font-mono text-accent">{mass} kg</span>
                </div>
                <Slider min={0.5} max={5} step={0.1} value={[mass]} onValueChange={(val) => setMass(val[0])} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
