import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

const rawQuestions = [
  {
    topic: "Units & Dimensions",
    difficulty: "easy",
    question: "A physical quantity $P$ is given by $P = \\frac{Fv}{A}$ where $F$ is force, $v$ is velocity, and $A$ is area. The dimensions of $P$ are:",
    options: { A: "[M L^{-1} T^{-3}]", B: "[M L T^{-3}]", C: "[M T^{-3}]", D: "[M L^2 T^{-2}]" },
    answer: "C",
    explanation: "Dimensions of Force $[F] = [M L T^{-2}]$, Velocity $[v] = [L T^{-1}]$, and Area $[A] = [L^2]$. Therefore, $[P] = \\frac{[M L T^{-2}][L T^{-1}]}{[L^2]} = [M T^{-3}].",
    concept: "Dimensions of Physical Quantities"
  },
  {
    topic: "Relative Motion",
    difficulty: "easy",
    question: "Two trains move in the same direction along parallel tracks with speeds of 54 km/h and 72 km/h. The speed of the faster train relative to the slower train is:",
    options: { A: "5 m/s", B: "10 m/s", C: "15 m/s", D: "20 m/s" },
    answer: "A",
    explanation: "Relative speed in the same direction $v_{rel} = 72 - 54 = 18\\text{ km/h}$. Converting to m/s: $18 \\times \\frac{5}{18} = 5\\text{ m/s}$.",
    concept: "Relative Velocity in 1D"
  },
  {
    topic: "Average Velocity",
    difficulty: "medium",
    question: "A particle moves 30 m east in 6 s and then 40 m west in 4 s. The magnitude of its average velocity is:",
    options: { A: "1 m/s", B: "2 m/s", C: "7 m/s", D: "10 m/s" },
    answer: "A",
    explanation: "Taking East as positive direction: net displacement $S = +30 - 40 = -10\\text{ m}$ (10 m West). Total time $t = 6 + 4 = 10\\text{ s}$. Average velocity magnitude $= \\frac{|S|}{t} = \\frac{10\\text{ m}}{10\\text{ s}} = 1\\text{ m/s}$.",
    concept: "Average Velocity vs Speed"
  },
  {
    topic: "Uniform Acceleration",
    difficulty: "medium",
    question: "A particle starts from rest and moves with a uniform acceleration of $4\\text{ m/s}^2$. The distance travelled by the particle during the fifth second of its motion is:",
    options: { A: "18 m", B: "20 m", C: "22 m", D: "24 m" },
    answer: "A",
    explanation: "Using the formula for distance in the nth second: $S_n = u + \\frac{a}{2}(2n - 1)$. Here, $u = 0, a = 4\\text{ m/s}^2$, and $n = 5$. Thus, $S_5 = 0 + \\frac{4}{2}(2(5) - 1) = 2 \\times 9 = 18\\text{ m}$.",
    concept: "Distance in nth second of motion"
  },
  {
    topic: "Velocity-Time Graph",
    difficulty: "medium",
    question: "The velocity of a body increases uniformly from 10 m/s to 30 m/s in a time interval of 5 s. The distance travelled during this time equals:",
    options: { A: "75 m", B: "100 m", C: "125 m", D: "150 m" },
    answer: "B",
    explanation: "For constant acceleration, distance is average velocity multiplied by time: $S = \\left(\\frac{u + v}{2}\\right)t = \\left(\\frac{10 + 30}{2}\\right) \\times 5 = 20 \\times 5 = 100\\text{ m}$.",
    concept: "Equations of Motion under Constant Acceleration"
  },
  {
    topic: "Variable Acceleration",
    difficulty: "hard",
    question: "A particle starts from rest and moves in a straight line with an acceleration varying with time as $a = 6t$. The velocity of the particle after 4 seconds is:",
    options: { A: "24 m/s", B: "36 m/s", C: "48 m/s", D: "60 m/s" },
    answer: "C",
    explanation: "Since acceleration is variable, we integrate: $a = \\frac{dv}{dt} = 6t \\implies dv = 6t dt$. Integrating from rest: $v(t) = \\int_0^t 6t dt = [3t^2]_0^t = 3t^2$. At $t = 4\\text{ s}$, $v = 3(4)^2 = 48\\text{ m/s}$.",
    concept: "Variable Acceleration Integration"
  },
  {
    topic: "Free Fall",
    difficulty: "medium",
    question: "A stone is dropped from rest from the top of a cliff. Ignoring air resistance, its speed after falling for 3 s is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "20 m/s", B: "25 m/s", C: "30 m/s", D: "35 m/s" },
    answer: "C",
    explanation: "Under free fall, $v = u + gt$. Since $u = 0$ (dropped from rest), $v = 0 + 10 \\times 3 = 30\\text{ m/s}$.",
    concept: "Motion Under Gravity"
  },
  {
    topic: "Projectile Motion",
    difficulty: "hard",
    question: "A projectile is launched from ground level with a speed of 20 m/s at an angle of $30^\\circ$ above the horizontal. The maximum height reached by the projectile is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "2.5 m", B: "5 m", C: "10 m", D: "15 m" },
    answer: "B",
    explanation: "Formula for maximum height: $H_{max} = \\frac{u^2 \\sin^2\\theta}{2g} = \\frac{20^2 \\sin^2(30^\\circ)}{2 \\times 10} = \\frac{400 \\times 0.25}{20} = 5\\text{ m}$.",
    concept: "Projectile Maximum Height"
  },
  {
    topic: "Graph Interpretation",
    difficulty: "medium",
    question: "The area under a velocity-time graph for a particle in motion represents:",
    options: { A: "Velocity", B: "Acceleration", C: "Displacement/Distance", D: "Force" },
    answer: "C",
    explanation: "By definition, $v = \\frac{ds}{dt} \\implies ds = v dt$. Integrating gives $s = \\int v dt$, which is the area under the velocity-time graph.",
    concept: "Graphical Kinematics"
  },
  {
    topic: "River Boat",
    difficulty: "hard",
    question: "A river flows with a speed of 3 m/s. A boat can travel with a speed of 4 m/s in still water. The minimum time required to cross a 140 m wide river is:",
    options: { A: "28 s", B: "30 s", C: "35 s", D: "40 s" },
    answer: "C",
    explanation: "Minimum crossing time is achieved when the boat heads directly perpendicular to the river flow (zero angle with normal). $t_{min} = \\frac{d}{v_{boat}} = \\frac{140}{4} = 35\\text{ s}$.",
    concept: "River Crossing Mechanics"
  },
  {
    topic: "Equations of Motion",
    difficulty: "medium",
    question: "A car moving along a straight road at $10\\text{ m/s}$ accelerates uniformly at $2\\text{ m/s}^2$. The distance covered by the car in the next $5\\text{ s}$ is:",
    options: { A: "50 m", B: "75 m", C: "100 m", D: "125 m" },
    answer: "B",
    explanation: "Using $S = ut + \\frac{1}{2}at^2$: $S = 10(5) + \\frac{1}{2}(2)(5)^2 = 50 + 25 = 75\\text{ m}$.",
    concept: "Uniform Acceleration Equations"
  },
  {
    topic: "Motion Graphs",
    difficulty: "easy",
    question: "The slope of a displacement-time graph represents the:",
    options: { A: "Acceleration", B: "Speed", C: "Velocity", D: "Momentum" },
    answer: "C",
    explanation: "The slope of displacement-time graph is $\\frac{ds}{dt}$, which is defined as the velocity.",
    concept: "x-t Graph Slope"
  },
  {
    topic: "Relative Motion",
    difficulty: "medium",
    question: "Two cyclists move directly towards each other along a straight path with constant speeds of 8 m/s and 12 m/s. Their relative speed of approach is:",
    options: { A: "4 m/s", B: "12 m/s", C: "20 m/s", D: "96 m/s" },
    answer: "C",
    explanation: "When moving in opposite directions (towards each other), their relative speed is the sum of their individual speeds: $8 + 12 = 20\\text{ m/s}$.",
    concept: "Relative Speed of Approach"
  },
  {
    topic: "Free Fall",
    difficulty: "medium",
    question: "A ball is projected vertically upward from the ground with a speed of 30 m/s. The maximum height reached is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "30 m", B: "40 m", C: "45 m", D: "50 m" },
    answer: "C",
    explanation: "At maximum height, final velocity $v = 0$. Using $v^2 = u^2 - 2gH$: $0 = 30^2 - 2(10)H \\implies 20H = 900 \\implies H = 45\\text{ m}$.",
    concept: "Vertical Motion under Gravity"
  },
  {
    topic: "Variable Acceleration",
    difficulty: "hard",
    question: "The acceleration of a particle starting from rest is given by $a = 3t^2$. Its velocity after 2 s is:",
    options: { A: "4 m/s", B: "6 m/s", C: "8 m/s", D: "12 m/s" },
    answer: "C",
    explanation: "$v(t) = \\int_0^t a dt = \\int_0^t 3t^2 dt = t^3$. At $t = 2\\text{ s}$, $v = 2^3 = 8\\text{ m/s}$.",
    concept: "Integration of variable acceleration"
  },
  {
    topic: "Projectile Motion",
    difficulty: "easy",
    question: "A projectile is launched horizontally from a cliff. Ignoring air resistance, which component of its velocity remains constant during the flight?",
    options: { A: "Vertical component", B: "Horizontal component", C: "Both components", D: "Neither component" },
    answer: "B",
    explanation: "Since gravity acts vertically downward, vertical acceleration is $-g$. There is no force acting in the horizontal direction ($a_x = 0$), so the horizontal velocity component remains constant.",
    concept: "Horizontal Projectile Properties"
  },
  {
    topic: "Average Speed",
    difficulty: "medium",
    question: "A person travels 60 km at a constant speed of 30 km/h and immediately returns the same distance at a constant speed of 60 km/h. The average speed for the entire journey is:",
    options: { A: "40 km/h", B: "45 km/h", C: "48 km/h", D: "50 km/h" },
    answer: "A",
    explanation: "Average speed for equal distance intervals is given by the harmonic mean: $v_{avg} = \\frac{2v_1v_2}{v_1 + v_2} = \\frac{2 \\times 30 \\times 60}{30 + 60} = \\frac{3600}{90} = 40\\text{ km/h}$.",
    concept: "Average Speed calculation"
  },
  {
    topic: "River-Boat",
    difficulty: "hard",
    question: "A river flows with a velocity of 4 m/s. A swimmer can swim with a speed of 5 m/s relative to the water. To reach the point directly opposite the starting point on the other bank, the swimmer must swim at an angle $\\theta$ upstream. The sine of this angle ($\\sin\\theta$) must be:",
    options: { A: "3/5", B: "4/5", C: "1/5", D: "5/4" },
    answer: "B",
    explanation: "To reach directly opposite, the horizontal component of the swimmer's velocity must cancel the river's flow: $v_m \\sin\\theta = v_r \\implies 5 \\sin\\theta = 4 \\implies \\sin\\theta = 4/5$.",
    concept: "River-Crossing drift minimization"
  },
  {
    topic: "Equations of Motion",
    difficulty: "medium",
    question: "A train moving at a constant velocity of 20 m/s is brought to rest uniformly in 10 s. The distance travelled before coming to rest is:",
    options: { A: "50 m", B: "100 m", C: "150 m", D: "200 m" },
    answer: "B",
    explanation: "Distance $S = \\text{average velocity} \\times t = \\left(\\frac{u + v}{2}\\right)t = \\left(\\frac{20 + 0}{2}\\right) \\times 10 = 100\\text{ m}$.",
    concept: "Retardation distance"
  },
  {
    topic: "Motion Under Gravity",
    difficulty: "hard",
    question: "A stone is dropped from the top of a tower. During the last second of its motion, it covers a distance of 35 m. The height of the tower is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "80 m", B: "100 m", C: "125 m", D: "180 m" },
    answer: "A",
    explanation: "Distance in nth second: $S_n = u + \\frac{g}{2}(2n-1) \\implies 35 = 0 + 5(2n-1) \\implies 2n-1 = 7 \\implies n = 4\\text{ s}$. Total fall time is 4 s. Total height $H = \\frac{1}{2}g t^2 = 5 \\times 4^2 = 80\\text{ m}$.",
    concept: "Free fall under gravity analysis"
  },
  {
    topic: "Average Velocity",
    difficulty: "medium",
    question: "A particle moves 12 m east in 3 s and then 16 m north in 5 s. The magnitude of its average velocity for the entire motion is:",
    options: { A: "2 m/s", B: "2.5 m/s", C: "4 m/s", D: "5 m/s" },
    answer: "B",
    explanation: "Net displacement magnitude $= \\sqrt{12^2 + 16^2} = 20\\text{ m}$. Total time $t = 3 + 5 = 8\\text{ s}$. Magnitude of average velocity $= \\frac{20}{8} = 2.5\\text{ m/s}$.",
    concept: "Displacement vector in 2D"
  },
  {
    topic: "Uniform Acceleration",
    difficulty: "medium",
    question: "A particle moving with an initial velocity of 8 m/s accelerates uniformly at 3 m/s². Its velocity after covering a displacement of 32 m is:",
    options: { A: "12 m/s", B: "14 m/s", C: "16 m/s", D: "20 m/s" },
    answer: "C",
    explanation: "Using $v^2 = u^2 + 2aS$: $v^2 = 8^2 + 2(3)(32) = 64 + 192 = 256 \\implies v = 16\\text{ m/s}$.",
    concept: "Equations of Motion applications"
  },
  {
    topic: "Velocity-Time Graph",
    difficulty: "medium",
    question: "The velocity-time graph of a particle is a straight line passing through the coordinates (0, 4) and (6, 22). The acceleration of the particle is:",
    options: { A: "2 m/s²", B: "3 m/s²", C: "4 m/s²", D: "5 m/s²" },
    answer: "B",
    explanation: "Acceleration is the slope of the v-t graph: $a = \\frac{v_2 - v_1}{t_2 - t_1} = \\frac{22 - 4}{6 - 0} = \\frac{18}{6} = 3\\text{ m/s}^2$.",
    concept: "v-t graph slope meaning"
  },
  {
    topic: "Relative Motion",
    difficulty: "medium",
    question: "A man walks at 5 km/h in rain falling vertically at 12 km/h. The angle $\\theta$ that the rain appears to make with the vertical satisfies:",
    options: { A: "tan θ = 5/12", B: "tan θ = 12/5", C: "tan θ = 17/12", D: "tan θ = 5/17" },
    answer: "A",
    explanation: "Relative velocity of rain w.r.t man is $\\vec{v}_{rm} = \\vec{v}_r - \\vec{v}_m$. Since rain is vertical ($-12\\hat{j}$) and man is horizontal ($5\\hat{i}$), rain appears inclined. $\\tan\\theta = \\frac{v_m}{v_r} = \\frac{5}{12}$.",
    concept: "Relative rain inclination angle"
  },
  {
    topic: "Projectile Motion",
    difficulty: "hard",
    question: "A projectile is fired with an initial speed of 30 m/s at an angle of 45° to the horizontal. Its total time of flight is (Take g = 10 m/s²):",
    options: { A: "3√2 s", B: "4√2 s", C: "5√2 s", D: "6√2 s" },
    answer: "A",
    explanation: "$T = \\frac{2u\\sin\\theta}{g} = \\frac{2 \\times 30 \\times \\sin 45^\\circ}{10} = 6 \\times \\frac{1}{\\sqrt{2}} = 3\\sqrt{2}\\text{ s}$.",
    concept: "Time of flight of projectile"
  },
  {
    topic: "Equation of Motion",
    difficulty: "medium",
    question: "A body moving with uniform acceleration covers 24 m during the first 4 s of its motion. If it started from rest, the acceleration is:",
    options: { A: "2 m/s²", B: "3 m/s²", C: "4 m/s²", D: "5 m/s²" },
    answer: "B",
    explanation: "$S = ut + \\frac{1}{2}at^2 \\implies 24 = 0 + \\frac{1}{2}a(4)^2 \\implies 24 = 8a \\implies a = 3\\text{ m/s}^2$.",
    concept: "Solving uniform acceleration parameters"
  },
  {
    topic: "Motion in One Dimension",
    difficulty: "medium",
    question: "The position of a particle along the x-axis is given by $x = 2t^3 - 6t^2 + 9t + 4$. The instantaneous velocity at $t = 2\\text{ s}$ is:",
    options: { A: "6 m/s", B: "9 m/s", C: "12 m/s", D: "15 m/s" },
    answer: "B",
    explanation: "Instantaneous velocity is $v = \\frac{dx}{dt} = 6t^2 - 12t + 9$. At $t = 2\\text{ s}$, $v = 6(2)^2 - 12(2) + 9 = 24 - 24 + 9 = 9\\text{ m/s}$.",
    concept: "Differential calculus in kinematics"
  },
  {
    topic: "Acceleration-Time Graph",
    difficulty: "medium",
    question: "The area under an acceleration-time graph for a given time interval represents:",
    options: { A: "Force", B: "Velocity change", C: "Displacement", D: "Momentum" },
    answer: "B",
    explanation: "By definition, $a = \\frac{dv}{dt} \\implies dv = a dt \\implies \\Delta v = \\int a dt$, which is the area under the a-t graph.",
    concept: "a-t Graph Area"
  },
  {
    topic: "Projectile Motion",
    difficulty: "easy",
    question: "A projectile is launched such that its horizontal and vertical components of initial velocity are equal. The angle of projection is:",
    options: { A: "30°", B: "45°", C: "60°", D: "75°" },
    answer: "B",
    explanation: "Horizontal component $u_x = u\\cos\\theta$, Vertical component $u_y = u\\sin\\theta$. Given $u_x = u_y \\implies u\\cos\\theta = u\\sin\\theta \\implies \\tan\\theta = 1 \\implies \\theta = 45^\\circ$.",
    concept: "Angle of projection relationships"
  },
  {
    topic: "Relative Velocity",
    difficulty: "hard",
    question: "A boat can move with a speed of 8 m/s in still water. If the river flows with a speed of 6 m/s, the minimum possible time required for the boat to cross a river of width 160 m is:",
    options: { A: "16 s", B: "20 s", C: "24 s", D: "26.7 s" },
    answer: "B",
    explanation: "To cross the river in minimum time, the boat must head perpendicular to the banks. The velocity component along the perpendicular direction is $8\\text{ m/s}$. $t_{min} = \\frac{160\\text{ m}}{8\\text{ m/s}} = 20\\text{ s}$.",
    concept: "Minimum river crossing time"
  },
  {
    topic: "Units & Dimensions",
    difficulty: "easy",
    question: "The dimensional formula of impulse is equal to that of:",
    options: { A: "Linear Momentum", B: "Force", C: "Work", D: "Pressure" },
    answer: "A",
    explanation: "Impulse is Force $\\times$ Time, which has dimensions $[M L T^{-1}]$. This is identical to the dimensions of linear momentum ($m \\times v$).",
    concept: "Dimensional equivalence of physics terms"
  },
  {
    topic: "Significant Figures",
    difficulty: "easy",
    question: "The number of significant figures in the measurement 0.004560 is:",
    options: { A: "3", B: "4", C: "5", D: "6" },
    answer: "B",
    explanation: "Leading zeros are not significant. Trailing zeros after the decimal point are significant. Thus, the significant digits are 4, 5, 6, and 0 (4 digits total).",
    concept: "Rules for Significant Figures"
  },
  {
    topic: "Motion in One Dimension",
    difficulty: "easy",
    question: "A particle moves along a straight line according to the equation $x = 5 + 2t + 3t^2$. Its acceleration is:",
    options: { A: "3 m/s²", B: "5 m/s²", C: "6 m/s²", D: "12 m/s²" },
    answer: "C",
    explanation: "Velocity $v = \\frac{dx}{dt} = 2 + 6t$. Acceleration $a = \\frac{dv}{dt} = 6\\text{ m/s}^2$.",
    concept: "Constant acceleration derivation"
  },
  {
    topic: "Average Speed",
    difficulty: "easy",
    question: "A car covers a distance of 100 km in 2 h and then another 100 km in 4 h. The average speed of the car for the entire trip is:",
    options: { A: "25 km/h", B: "30 km/h", C: "33.3 km/h", D: "40 km/h" },
    answer: "C",
    explanation: "Average speed is total distance divided by total time: $v_{avg} = \\frac{100 + 100}{2 + 4} = \\frac{200}{6} = 33.3\\text{ km/h}$.",
    concept: "Average speed concept"
  },
  {
    topic: "Relative Motion",
    difficulty: "easy",
    question: "Two particles are moving in opposite directions along a straight track with speeds of 12 m/s and 18 m/s. The magnitude of their relative velocity is:",
    options: { A: "6 m/s", B: "18 m/s", C: "24 m/s", D: "30 m/s" },
    answer: "D",
    explanation: "When moving in opposite directions, the magnitude of relative velocity is the sum of their individual speeds: $12 + 18 = 30\\text{ m/s}$.",
    concept: "Relative 1D motion"
  },
  {
    topic: "Equation of Motion",
    difficulty: "medium",
    question: "A body starting from rest moves with a constant acceleration of $5\\text{ m/s}^2$. The distance travelled by it in $6\\text{ s}$ is:",
    options: { A: "60 m", B: "75 m", C: "90 m", D: "120 m" },
    answer: "C",
    explanation: "Using $S = ut + \\frac{1}{2}at^2$: $S = 0 + \\frac{1}{2}(5)(6)^2 = 2.5 \\times 36 = 90\\text{ m}$.",
    concept: "Constant acceleration distance"
  },
  {
    topic: "Nth Second",
    difficulty: "medium",
    question: "The distance covered during the 8th second of motion by a body starting from rest with a uniform acceleration of 2 m/s² is:",
    options: { A: "13 m", B: "15 m", C: "17 m", D: "19 m" },
    answer: "B",
    explanation: "$S_n = u + \\frac{a}{2}(2n-1) = 0 + \\frac{2}{2}(2(8)-1) = 15\\text{ m}$.",
    concept: "nth second displacement calculation"
  },
  {
    topic: "Velocity-Time Graph",
    difficulty: "easy",
    question: "The displacement of a moving body is determined from a velocity-time graph by calculating the:",
    options: { A: "Slope of the line", B: "Intercept on y-axis", C: "Area enclosed under the graph", D: "Length of the curve" },
    answer: "C",
    explanation: "Integrating velocity over time ($s = \\int v dt$) corresponds geometrically to the area under the velocity-time curve.",
    concept: "Graphical integration meaning"
  },
  {
    topic: "Projectile Motion",
    difficulty: "medium",
    question: "For a projectile launched from ground level, the maximum height reached is proportional to:",
    options: { A: "u (initial speed)", B: "u² (square of initial speed)", C: "u³", D: "1/u" },
    answer: "B",
    explanation: "From the maximum height formula $H_{max} = \\frac{u^2 \\sin^2\\theta}{2g}$, it is directly clear that $H_{max} \\propto u^2$.",
    concept: "Projectile parameter scaling"
  },
  {
    topic: "Projectile Motion",
    difficulty: "easy",
    question: "To achieve the maximum horizontal range for a projectile launched with a fixed speed on flat ground, the angle of projection should be:",
    options: { A: "30°", B: "45°", C: "60°", D: "90°" },
    answer: "B",
    explanation: "Range $R = \\frac{u^2\\sin 2\\theta}{g}$. $R$ is maximum when $\\sin 2\\theta = 1 \\implies 2\\theta = 90^\\circ \\implies \\theta = 45^\\circ$.",
    concept: "Horizontal Range optimization"
  },
  {
    topic: "Rain-Man Problem",
    difficulty: "medium",
    question: "Rain appears to fall vertically when a man is standing still. When he starts walking forward, the rain appears inclined to him. This is due to:",
    options: { A: "Gravitational effects", B: "Relative velocity", C: "Inertial frames", D: "Air resistance" },
    answer: "B",
    explanation: "As the man walks, his horizontal velocity vector is subtracted from the rain's vertical velocity vector, creating a relative velocity vector that is inclined at an angle to the vertical.",
    concept: "Rain inclination vector analysis"
  },
  {
    topic: "Free Fall",
    difficulty: "medium",
    question: "A body dropped from rest falls a distance of 45 m. The time taken is (Take g = 10 m/s²):",
    options: { A: "2 s", B: "3 s", C: "4 s", D: "5 s" },
    answer: "B",
    explanation: "$S = \\frac{1}{2}gt^2 \\implies 45 = 5t^2 \\implies t^2 = 9 \\implies t = 3\\text{ s}$.",
    concept: "Time of fall under gravity"
  },
  {
    topic: "Velocity",
    difficulty: "easy",
    question: "A particle moving at a constant speed can still have a non-zero acceleration vector when its:",
    options: { A: "Speed changes", B: "Direction of motion changes", C: "Mass changes", D: "Applied force is zero" },
    answer: "B",
    explanation: "Velocity is a vector quantity. Even if the speed (magnitude) is constant, changing the direction of motion changes the velocity vector, yielding acceleration (e.g., centripetal acceleration in circular motion).",
    concept: "Vector acceleration definition"
  },
  {
    topic: "Circular Motion",
    difficulty: "medium",
    question: "A particle moving in a uniform circular motion possesses:",
    options: { A: "Zero acceleration", B: "A constant acceleration vector", C: "Constant speed but changing velocity", D: "Constant velocity vector" },
    answer: "C",
    explanation: "In uniform circular motion, speed is constant. However, direction changes continuously, so velocity changes. The acceleration vector points towards the center and changes direction as the particle moves.",
    concept: "Uniform circular motion parameters"
  },
  {
    topic: "Graph",
    difficulty: "easy",
    question: "The slope of a velocity-time graph represents the:",
    options: { A: "Distance", B: "Velocity", C: "Acceleration", D: "Momentum" },
    answer: "C",
    explanation: "Slope of the v-t graph is $\\frac{dv}{dt}$, which represents the acceleration of the particle.",
    concept: "v-t graph derivatives"
  },
  {
    topic: "Equation of Motion",
    difficulty: "medium",
    question: "A train moving at an initial velocity of 25 m/s is brought to rest in 5 s. The magnitude of deceleration is:",
    options: { A: "2 m/s²", B: "3 m/s²", C: "5 m/s²", D: "10 m/s²" },
    answer: "C",
    explanation: "$v = u + at \\implies 0 = 25 + a(5) \\implies 5a = -25 \\implies a = -5\\text{ m/s}^2$ (magnitude is $5\\text{ m/s}^2$).",
    concept: "Retardation rate"
  },
  {
    topic: "Projectile Motion",
    difficulty: "easy",
    question: "The time of flight of a projectile becomes double if its initial velocity magnitude is:",
    options: { A: "Doubled", B: "Halved", C: "Quadrupled", D: "Unchanged" },
    answer: "A",
    explanation: "Since time of flight $T = \\frac{2u\\sin\\theta}{g}$, $T$ is directly proportional to $u$. Doubling $u$ doubles $T$.",
    concept: "Scaling laws in projectiles"
  },
  {
    topic: "Relative Motion",
    difficulty: "medium",
    question: "A swimmer swims with a speed of 6 m/s in still water. If the river width is 120 m, the minimum crossing time depends on:",
    options: { A: "The river speed only", B: "Swimmer's speed component perpendicular to banks", C: "River width only", D: "River width and swimmer's speed relative to water" },
    answer: "D",
    explanation: "$t_{min} = \\frac{\\text{width}}{\\text{swimmer speed}} = \\frac{d}{v_m}$. Thus, it depends on both the river width and the swimmer's speed relative to the water.",
    concept: "River crossing factors"
  },
  {
    topic: "Motion",
    difficulty: "easy",
    question: "If the displacement of a particle is zero, the total distance travelled by it:",
    options: { A: "Must be zero", B: "Must be positive", C: "Can be zero or positive", D: "Must be negative" },
    answer: "C",
    explanation: "If the particle does not move, both displacement and distance are zero. If it moves and returns to the starting point, displacement is zero while distance is positive. Hence, it can be zero or positive.",
    concept: "Distance vs displacement definitions"
  },
  {
    topic: "Conceptual",
    difficulty: "easy",
    question: "Which of the following physical quantities can never have a negative value?",
    options: { A: "Velocity", B: "Acceleration", C: "Speed", D: "Displacement" },
    answer: "C",
    explanation: "Speed is the magnitude of the velocity vector and cannot be negative. Velocity, acceleration, and displacement are vectors whose components can be negative.",
    concept: "Scalar vs vector parameters"
  },
  {
    topic: "Uniform Acceleration",
    difficulty: "medium",
    question: "A particle starts from rest and moves with an acceleration of $4\\text{ m/s}^2$. Its velocity after covering a distance of 32 m is:",
    options: { A: "8 m/s", B: "12 m/s", C: "16 m/s", D: "20 m/s" },
    answer: "C",
    explanation: "Using $v^2 = u^2 + 2aS$: $v^2 = 0 + 2(4)(32) = 256 \\implies v = 16\\text{ m/s}$.",
    concept: "Uniform Acceleration displacement equations"
  },
  {
    topic: "Relative Motion",
    difficulty: "easy",
    question: "A train 180 m long crosses a stationary pole in 12 s. The speed of the train is:",
    options: { A: "10 m/s", B: "12 m/s", C: "15 m/s", D: "18 m/s" },
    answer: "C",
    explanation: "Speed $= \\frac{\\text{length of train}}{\\text{time taken}} = \\frac{180\\text{ m}}{12\\text{ s}} = 15\\text{ m/s}$.",
    concept: "Linear speed calculation"
  },
  {
    topic: "Equation of Motion",
    difficulty: "medium",
    question: "A particle moving with an initial velocity of 15 m/s accelerates uniformly at 2 m/s². The distance covered by it in 6 s is:",
    options: { A: "96 m", B: "120 m", C: "126 m", D: "144 m" },
    answer: "C",
    explanation: "Using $S = ut + \\frac{1}{2}at^2$: $S = 15(6) + \\frac{1}{2}(2)(6)^2 = 90 + 36 = 126\\text{ m}$.",
    concept: "Uniform acceleration distance formulas"
  },
  {
    topic: "Free Fall",
    difficulty: "easy",
    question: "A ball is thrown vertically upward with a speed of 40 m/s. The time taken to reach the maximum height is (Take g = 10 m/s²):",
    options: { A: "2 s", B: "3 s", C: "4 s", D: "5 s" },
    answer: "C",
    explanation: "At maximum height, $v = 0$. Using $v = u - gt \\implies 0 = 40 - 10t \\implies t = 4\\text{ s}$.",
    concept: "Time to reach apex in free fall"
  },
  {
    topic: "Velocity-Time Graph",
    difficulty: "easy",
    question: "If a particle moves with a constant velocity, its acceleration is:",
    options: { A: "Positive", B: "Negative", C: "Zero", D: "Infinite" },
    answer: "C",
    explanation: "Constant velocity means $\\frac{dv}{dt} = 0$, so acceleration is zero.",
    concept: "Acceleration definition"
  },
  {
    topic: "Motion in One Dimension",
    difficulty: "medium",
    question: "The position of a particle along the x-axis varies as $x = t^2 - 4t + 7$. The velocity of the particle at $t = 3\\text{ s}$ is:",
    options: { A: "0 m/s", B: "2 m/s", C: "4 m/s", D: "6 m/s" },
    answer: "B",
    explanation: "Velocity is $v = \\frac{dx}{dt} = 2t - 4$. At $t = 3\\text{ s}$, $v = 2(3) - 4 = 2\\text{ m/s}$.",
    concept: "Derivative of displacement"
  },
  {
    topic: "Projectile Motion",
    difficulty: "medium",
    question: "A projectile is launched from flat ground with a speed of $10\\sqrt{2}\\text{ m/s}$ at an angle of 45° to the horizontal. Its horizontal range is (Take g = 10 m/s²):",
    options: { A: "10 m", B: "20 m", C: "30 m", D: "40 m" },
    answer: "B",
    explanation: "Range $R = \\frac{u^2\\sin 2\\theta}{g} = \\frac{(10\\sqrt{2})^2 \\sin(90^\\circ)}{10} = \\frac{200 \\times 1}{10} = 20\\text{ m}$.",
    concept: "Projectile Range calculations"
  },
  {
    topic: "Dimensions",
    difficulty: "easy",
    question: "The dimensional formula of power is:",
    options: { A: "[M L^2 T^{-2}]", B: "[M L^2 T^{-3}]", C: "[M L T^{-2}]", D: "[M L T^{-1}]" },
    answer: "B",
    explanation: "Power is Work / Time. $[W] = [M L^2 T^{-2}]$. $[P] = \\frac{[M L^2 T^{-2}]}{[T]} = [M L^2 T^{-3}]$.",
    concept: "Power dimensions derivation"
  },
  {
    topic: "Average Velocity",
    difficulty: "easy",
    question: "A runner completes one lap around a circular track and returns to the starting point. The runner's average velocity for the lap is:",
    options: { A: "Equal to radius", B: "Equal to circumference", C: "Zero", D: "Dependent on lap time" },
    answer: "C",
    explanation: "Since the starting and ending points are identical, the net displacement vector is zero. Average velocity is displacement divided by time, which is zero.",
    concept: "Displacement in circular motion"
  },
  {
    topic: "Relative Velocity",
    difficulty: "easy",
    question: "Two cars are moving along a straight road in the same direction with constant speeds of 20 m/s and 32 m/s. The relative velocity of the faster car with respect to the slower car is:",
    options: { A: "10 m/s", B: "12 m/s", C: "14 m/s", D: "52 m/s" },
    answer: "B",
    explanation: "Relative velocity in the same direction is the difference of their speeds: $32 - 20 = 12\\text{ m/s}$.",
    concept: "Relative 1D velocity magnitude"
  },
  {
    topic: "Nth Second",
    difficulty: "medium",
    question: "A body moves along a straight road with a constant velocity. The distance travelled by it during the 10th second of its motion is:",
    options: { A: "Zero", B: "Equal to the magnitude of its velocity", C: "Dependent on acceleration", D: "Infinite" },
    answer: "B",
    explanation: "Since velocity is constant, the body covers equal distances in equal time intervals. The distance travelled in any single second (including the 10th second) is equal to the magnitude of its constant velocity.",
    concept: "Constant velocity definition properties"
  },
  {
    topic: "Uniform Motion",
    difficulty: "easy",
    question: "A body moving with a constant speed in a straight line possesses:",
    options: { A: "Constant velocity vector", B: "Variable velocity vector", C: "Constant acceleration vector", D: "Variable speed" },
    answer: "A",
    explanation: "A straight line means direction does not change. Constant speed means magnitude does not change. Hence, the velocity vector is constant.",
    concept: "Linear motion components"
  },
  {
    topic: "Motion Graph",
    difficulty: "easy",
    question: "The area under an acceleration-time graph for a given time interval represents:",
    options: { A: "Total distance", B: "Change in velocity", C: "Average force", D: "Net momentum change" },
    answer: "B",
    explanation: "By definition, $a = \\frac{dv}{dt} \\implies \\int a dt = \\Delta v$. The area under the graph represents the change in velocity.",
    concept: "a-t graph properties"
  },
  {
    topic: "Rain-Man",
    difficulty: "medium",
    question: "Rain is falling vertically at 15 m/s. A man walks horizontally on the road at 8 m/s. The magnitude of the apparent velocity of the rain relative to the man is:",
    options: { A: "15 m/s", B: "17 m/s", C: "20 m/s", D: "23 m/s" },
    answer: "B",
    explanation: "The velocity of rain w.r.t. man is $\\vec{v}_{rm} = \\vec{v}_r - \\vec{v}_m$. Since they are perpendicular, magnitude is $\\sqrt{15^2 + 8^2} = \\sqrt{225 + 64} = \\sqrt{289} = 17\\text{ m/s}$.",
    concept: "Relative 2D velocity magnitude"
  },
  {
    topic: "River Boat",
    difficulty: "medium",
    question: "A boat moves with a speed of 10 m/s in still water. If the river flows with a speed of 6 m/s, the resultant speed of the boat when rowed perpendicular to the river flow is:",
    options: { A: "8 m/s", B: "10 m/s", C: "√136 m/s", D: "16 m/s" },
    answer: "C",
    explanation: "Resultant speed $v_{res} = \\sqrt{v_{boat}^2 + v_{river}^2} = \\sqrt{10^2 + 6^2} = \\sqrt{136}\\text{ m/s}$.",
    concept: "Vector addition in river-boat problems"
  },
  {
    topic: "Projectile Motion",
    difficulty: "easy",
    question: "For a projectile launched with a fixed speed, the maximum height is obtained when the angle of projection is:",
    options: { A: "30°", B: "45°", C: "60°", D: "90°" },
    answer: "D",
    explanation: "$H_{max} = \\frac{u^2\\sin^2\\theta}{2g}$. Height is maximum when $\\sin\\theta = 1 \\implies \\theta = 90^\\circ$ (vertical launch).",
    concept: "Apex height maximization"
  },
  {
    topic: "Kinematics",
    difficulty: "easy",
    question: "The velocity of a car changes from 5 m/s to 25 m/s in a time interval of 4 s. The average acceleration of the car is:",
    options: { A: "2 m/s²", B: "4 m/s²", C: "5 m/s²", D: "8 m/s²" },
    answer: "C",
    explanation: "Average acceleration $a = \\frac{v - u}{t} = \\frac{25 - 5}{4} = \\frac{20}{4} = 5\\text{ m/s}^2$.",
    concept: "Average acceleration calculations"
  },
  {
    topic: "Uniform Acceleration",
    difficulty: "easy",
    question: "A particle moves with an acceleration of 3 m/s². The increase in its velocity after 8 s is:",
    options: { A: "18 m/s", B: "21 m/s", C: "24 m/s", D: "27 m/s" },
    answer: "C",
    explanation: "Change in velocity $\\Delta v = a \\times t = 3 \\times 8 = 24\\text{ m/s}$.",
    concept: "Velocity changes under uniform acceleration"
  },
  {
    topic: "Motion",
    difficulty: "easy",
    question: "If the displacement-time graph of a moving body is a straight line parallel to the time axis, the velocity of the body is:",
    options: { A: "Accelerating", B: "Moving uniformly", C: "At rest (zero)", D: "Retarding" },
    answer: "C",
    explanation: "A line parallel to the time axis has a slope of zero. Since slope represents velocity, the velocity is zero (the body is at rest).",
    concept: "x-t graph slope interpretation"
  },
  {
    topic: "Conceptual",
    difficulty: "easy",
    question: "Which of the following graphs always has its slope equal to the instantaneous acceleration of a body?",
    options: { A: "Position-Time graph", B: "Velocity-Time graph", C: "Distance-Time graph", D: "Acceleration-Time graph" },
    answer: "B",
    explanation: "The derivative of velocity with respect to time (which is the slope of the v-t graph) is the instantaneous acceleration.",
    concept: "v-t graph derivative interpretation"
  },
  {
    topic: "Average Velocity",
    difficulty: "medium",
    question: "A particle moves along the x-axis according to the equation $x = 3t^2 - 2t + 5$ where $x$ is in meters and $t$ is in seconds. The average velocity during the interval $t = 1\\text{ s}$ to $t = 3\\text{ s}$ is:",
    options: { A: "10 m/s", B: "12 m/s", C: "14 m/s", D: "16 m/s" },
    answer: "A",
    explanation: "At $t = 1\\text{ s}$, position $x_1 = 3(1)^2 - 2(1) + 5 = 6\\text{ m}$. At $t = 3\\text{ s}$, position $x_2 = 3(3)^2 - 2(3) + 5 = 26\\text{ m}$. Average velocity $= \\frac{x_2 - x_1}{t_2 - t_1} = \\frac{26 - 6}{3 - 1} = \\frac{20}{2} = 10\\text{ m/s}$.",
    concept: "Average velocity coordinate formula"
  },
  {
    topic: "Constant Acceleration",
    difficulty: "hard",
    question: "A particle moves along a straight line with constant acceleration. It covers 18 m during the third second of its motion and 26 m during the fifth second. The initial velocity of the particle is:",
    options: { A: "8 m/s", B: "6 m/s", C: "4 m/s", D: "2 m/s" },
    answer: "A",
    explanation: "Using $S_n = u + \\frac{a}{2}(2n-1)$: $S_3 = u + 2.5a = 18$ and $S_5 = u + 4.5a = 26$. Subtracting the two equations: $2a = 8 \\implies a = 4\\text{ m/s}^2$. Substituting $a$: $u + 2.5(4) = 18 \\implies u + 10 = 18 \\implies u = 8\\text{ m/s}$.",
    concept: "Solving simultaneous equations of motion"
  },
  {
    topic: "Motion Under Gravity",
    difficulty: "medium",
    question: "A stone is projected vertically upward from ground level with an initial speed of 25 m/s. Ignoring air resistance, its speed after falling/moving for 2 s is (Take g = 10 m/s²):",
    options: { A: "5 m/s", B: "10 m/s", C: "15 m/s", D: "20 m/s" },
    answer: "A",
    explanation: "Using $v = u - gt$: $v = 25 - 10(2) = 25 - 20 = 5\\text{ m/s}$ (direction is upward).",
    concept: "Instantaneous velocity under gravity"
  },
  {
    topic: "Variable Acceleration",
    difficulty: "hard",
    question: "A particle moves along a straight line such that its velocity at any time $t$ is $v = 4 + 6t$. The displacement of the particle between $t = 1\\text{ s}$ and $t = 3\\text{ s}$ equals:",
    options: { A: "20 m", B: "24 m", C: "28 m", D: "32 m" },
    answer: "D",
    explanation: "Displacement $S = \\int_1^3 v dt = \\int_1^3 (4 + 6t) dt = [4t + 3t^2]_1^3 = (4(3) + 3(3)^2) - (4(1) + 3(1)^2) = (12 + 27) - (4 + 3) = 39 - 7 = 32\\text{ m}$.",
    concept: "Definite integration in kinematics"
  },
  {
    topic: "Relative Velocity",
    difficulty: "medium",
    question: "A train moving at a constant velocity of 20 m/s crosses a bridge in 20 s. If the train itself is 220 m long, the length of the bridge is:",
    options: { A: "120 m", B: "160 m", C: "180 m", D: "220 m" },
    answer: "C",
    explanation: "Total distance covered while crossing the bridge is $L_{train} + L_{bridge}$. Total distance $= v \\times t = 20 \\times 20 = 400\\text{ m}$. Thus, $220 + L_{bridge} = 400 \\implies L_{bridge} = 180\\text{ m}$.",
    concept: "Object crossing length addition"
  },
  {
    topic: "Projectile Motion",
    difficulty: "hard",
    question: "A projectile is fired from horizontal ground with a launch speed of 40 m/s. If the horizontal range of the projectile is $80\\sqrt{3}\\text{ m}$, the angle of projection with the horizontal is (Take g = 10 m/s²):",
    options: { A: "15°", B: "30°", C: "45°", D: "60°" },
    answer: "B",
    explanation: "Range $R = \\frac{u^2 \\sin 2\\theta}{g} \\implies 80\\sqrt{3} = \\frac{40^2 \\sin 2\\theta}{10} \\implies 80\\sqrt{3} = 160 \\sin 2\\theta \\implies \\sin 2\\theta = \\frac{\\sqrt{3}}{2} \\implies 2\\theta = 60^\\circ \\implies \\theta = 30^\\circ$.",
    concept: "Inversing range equations"
  },
  {
    topic: "Average Velocity",
    difficulty: "medium",
    question: "A particle moves east for 8 s with a speed of 5 m/s, and then north for 6 s with a speed of 5 m/s. The magnitude of its average velocity for the entire motion is:",
    options: { A: "2.5 m/s", B: "3.57 m/s", C: "4.1 m/s", D: "5.0 m/s" },
    answer: "B",
    explanation: "Distance East $= 5 \\times 8 = 40\\text{ m}$. Distance North $= 5 \\times 6 = 30\\text{ m}$. Displacement magnitude $= \\sqrt{40^2 + 30^2} = 50\\text{ m}$. Total time $= 8 + 6 = 14\\text{ s}$. Average velocity magnitude $= \\frac{50}{14} = 3.57\\text{ m/s}$.",
    concept: "Avg velocity magnitude vector addition"
  },
  {
    topic: "Variable Acceleration",
    difficulty: "hard",
    question: "The acceleration of a particle starting from rest varies with time as $a = 8 - 2t$. Its velocity after 3 s is:",
    options: { A: "12 m/s", B: "15 m/s", C: "18 m/s", D: "21 m/s" },
    answer: "B",
    explanation: "$v(t) = \\int_0^t a dt = \\int_0^t (8 - 2t) dt = [8t - t^2]_0^t = 8t - t^2$. At $t = 3\\text{ s}$, $v = 8(3) - 3^2 = 24 - 9 = 15\\text{ m/s}$.",
    concept: "Variable acceleration linear integration"
  },
  {
    topic: "Velocity-Time Graph",
    difficulty: "medium",
    question: "The velocity-time graph of a particle is a straight line passing through the points (0, 6) and (8, 22). The displacement of the particle during the first 8 seconds is:",
    options: { A: "96 m", B: "112 m", C: "128 m", D: "144 m" },
    answer: "B",
    explanation: "For a straight-line v-t graph, displacement is the area of the trapezoid: $S = \\frac{u + v}{2} \\times t = \\frac{6 + 22}{2} \\times 8 = 14 \\times 8 = 112\\text{ m}$.",
    concept: "Trapezoid area in graphical calculus"
  },
  {
    topic: "Conceptual",
    difficulty: "easy",
    question: "Which of the following statements is physically always true for motion along a straight line?",
    options: { 
      A: "Zero velocity implies zero acceleration.", 
      B: "Zero acceleration implies zero velocity.", 
      C: "Constant speed always implies constant velocity.", 
      D: "Zero displacement does not necessarily imply zero distance travelled." 
    },
    answer: "D",
    explanation: "If a body moves and returns to the starting point, displacement is zero but distance is positive. Hence, zero displacement does not necessarily imply zero distance travelled.",
    concept: "Comparing kinematic definitions"
  }
];

async function seed() {
  console.log(`Seeding ${rawQuestions.length} fine-tuned Kinematics questions...`);
  
  const dbInserts = rawQuestions.map((q, i) => {
    return {
      subchapter_id: 'phy-1',
      chapter_id: 'phy-1',
      subject: 'Physics',
      difficulty: q.difficulty,
      question_text: q.question,
      option_a: q.options.A,
      option_b: q.options.B,
      option_c: q.options.C,
      option_d: q.options.D,
      correct_option: q.answer,
      explanation: q.explanation,
      concept_tested: q.concept,
      verification_status: 'APPROVED',
      is_verified: true,
      exam_type: 'JEE_MAINS',
      question_type: 'MCQ',
      source: 'PrepEntrance Elite Repository v1.0'
    };
  });

  const { error } = await supabase.from('questions').insert(dbInserts);
  if (error) {
    console.error("Failed to seed questions:", error);
  } else {
    console.log("Successfully seeded Kinematics questions!");
  }
}

seed();
