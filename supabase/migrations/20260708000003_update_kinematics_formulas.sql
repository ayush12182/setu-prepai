-- ============================================================
-- UPDATE KINEMATICS NOTES (COACHING GRADE HANDBOOK FORMULAS)
-- ============================================================

UPDATE public.chapter_content 
SET raw_content = $raw_content$[METADATA]
chapter_slug: phy-1
chapter_name: Kinematics
subject: physics
topic_tree: Motion in 1D, Motion in 2D, Projectile Motion, Relative Motion
[/METADATA]

# KINEMATICS — Complete Master Notes
PrepEntrance physics | JEE | Class 11/12 • Droppers

## 1. Teacher Insight
[TEACHER_SAYS]
Students, Kinematics is the absolute gateway to Mechanics. It is not just about memorizing the three equations of motion; it is about vector analysis, calculus integration limits, and coordinate geometry. Historically, JEE Main asks 1-2 direct questions (frequently on Relative Motion or Graphs), and JEE Advanced blends Kinematics with Electrostatics, Magnetism, or Rotational Mechanics. 

The single biggest pitfall where average students fail is **ignoring vector signs**. They treat velocity and acceleration as scalars and mess up the sign convention, especially in vertical motion under gravity and relative velocity. 

AIR 1-100 students do not rely on formula memorization. Instead, they master **vector projection** and **relative reference frames**. To master this chapter:
1. Always set up a clear coordinate axis (origin, +x, +y) before writing a single equation.
2. Master calculus-based variable acceleration problems where $a = f(v)$ or $a = f(x)$.
3. Do not blindly memorize formulas for projectile on an inclined plane; always project the components along and perpendicular to the incline.
Avoid: Calculating variables without setting up coordinate signs first. That is a guaranteed negative mark.
[/TEACHER_SAYS]

## 2. Learning Outcomes
- Set up 1D and 2D coordinate frames and apply sign conventions consistently.
- Mathematically define and differentiate between distance, displacement, speed, velocity, and acceleration vectors.
- Master the calculus derivation of kinematics equations under constant acceleration.
- Solve variable acceleration problems using differentiation and integration ($a = v \frac{dv}{dx}$).
- Model and analyze horizontal projectile motion, obtaining trajectories, maximum height, range, and time of flight.
- Analyze projectile motion on an inclined plane using axis-rotation techniques.
- Implement relative velocity vectors to solve River-Boat, Rain-Man, and Wind-Airplane problems.
- Interpret motion graphs (displacement-time, velocity-time, acceleration-time) and calculate slopes and areas.

## 3. Complete Theory

### Motion in One Dimension (1D)
[CONCEPT]
Motion in one dimension is linear motion along a straight line. Position is defined relative to an origin. Displacement ($\Delta x$) is the vector change in position ($x_f - x_i$), whereas Distance is the actual scalar path length traveled by the particle.
[/CONCEPT]

[NCERT_INSIGHT]
NCERT notes that the magnitude of displacement can be equal to or less than the distance traveled. They are only equal if the motion is strictly unidirectional without any change in direction.
[/NCERT_INSIGHT]

### Calculus Derivations of Equations of Motion
Here, we derive the three equations of motion under constant acceleration ($a = \text{const}$) starting from differential calculus.

[DERIVATION]
**Derivation of First Equation of Motion ($v = u + at$):**
Start with the definition of instantaneous acceleration:
$$a = \frac{dv}{dt}$$
Multiply both sides by $dt$:
$$dv = a \cdot dt$$
Integrate both sides with boundary conditions: at $t = 0$, velocity is $u$, and at $t = t$, velocity is $v$:
$$\int_{u}^{v} dv = \int_{0}^{t} a \cdot dt$$
Since acceleration $a$ is constant, pull it out of the integral:
$$[v]_u^v = a \int_0^t dt$$
$$v - u = a(t - 0)$$
$$v = u + at$$

**Derivation of Second Equation of Motion ($S = ut + \frac{1}{2}at^2$):**
Start with the definition of instantaneous velocity:
$$v = \frac{dx}{dt}$$
Substitute $v = u + at$:
$$\frac{dx}{dt} = u + at$$
$$dx = (u + at)dt$$
Integrate both sides with boundaries: at $t = 0$, position is $x_0$, and at $t = t$, position is $x$:
$$\int_{x_0}^{x} dx = \int_{0}^{t} (u + at)dt$$
$$x - x_0 = \int_0^t u \cdot dt + \int_0^t at \cdot dt$$
Since $u$ and $a$ are constants:
$$S = ut + a \left[ \frac{t^2}{2} \right]_0^t$$
$$S = ut + \frac{1}{2}at^2$$
Where displacement $S = x - x_0$.

**Derivation of Third Equation of Motion ($v^2 = u^2 + 2aS$):**
Using chain rule, express acceleration as:
$$a = \frac{dv}{dt} = \frac{dv}{dx} \cdot \frac{dx}{dt} = v \frac{dv}{dx}$$
$$a \cdot dx = v \cdot dv$$
Integrate both sides: at $x = x_0$, velocity is $u$, and at $x = x$, velocity is $v$:
$$\int_{x_0}^{x} a \cdot dx = \int_{u}^{v} v \cdot dv$$
Since $a$ is constant:
$$a [x]_{x_0}^x = \left[ \frac{v^2}{2} \right]_u^v$$
$$a(x - x_0) = \frac{v^2 - u^2}{2}$$
$$2aS = v^2 - u^2$$
$$v^2 = u^2 + 2aS$$
[/DERIVATION]

### Motion in Two Dimensions (2D) & Projectile Motion
When a particle moves in a plane, its position, velocity, and acceleration have components along both axes. Horizontal projectile motion is a classic example where a particle is projected with initial velocity $u$ at an angle $\theta$ to the horizontal. Since gravity acts vertically downward ($a_y = -g$) and there is no horizontal acceleration ($a_x = 0$), we treat the 2D motion as two independent 1D motions.

## 4. Concept Visualization
Here is an interactive projectile path simulator. Adjust the velocity slider to see how the trajectory dynamically changes based on kinematics equations.
[GRAPH]
{
  "graphType": "projectile_path",
  "title": "Interactive Projectile Path Simulator",
  "xAxis": "Horizontal Range (m)",
  "yAxis": "Vertical Height (m)",
  "equation": "y = x*tan(theta) - g*x^2/(2*u^2*cos(theta)^2)",
  "sliders": {
    "u": { "min": 10, "max": 50, "step": 1, "default": 25, "label": "Launch Speed (u)", "unit": "m/s" },
    "theta": { "min": 15, "max": 75, "step": 5, "default": 45, "label": "Launch Angle (theta)", "unit": "degrees" }
  }
}
[/GRAPH]

## 5. Formula Sheet

### Motion in 1D

[FORMULA title="Average Speed"]
v_{\text{avg}} = \frac{d_{\text{total}}}{t_{\text{total}}}
**Variables:** d_{\text{total}} = total distance traveled (m), t_{\text{total}} = total time taken (s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** The rate of distance covered over the entire journey duration.
**When to use:** Use when total path length and time are given.
**When NOT to use:** Do not use if only velocities at specific points are given.
**Memory Trick:** Simply total path divided by total clock time.
**Common Mistake:** Confusing it with the magnitude of average velocity.
**One Solved Example:** A car covers 60m in 3s and next 40m in 2s. Average speed = (60+40)/(3+2) = 20 m/s.
**Related Formula:** Instantaneous speed $v = |d\vec{r}/dt|$.
**Derivation:** Defined as fundamental quantity: total path length divided by duration.
[/FORMULA]

[FORMULA title="Average Velocity"]
\vec{v}_{\text{avg}} = \frac{\Delta\vec{r}}{\Delta t}
**Variables:** \Delta\vec{r} = net displacement vector (m), \Delta t = total time interval (s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** Overall rate of change of position in a specific direction.
**When to use:** Whenever displacement vector and time interval are known.
**When NOT to use:** Cannot represent the motion's variations during the interval.
**Memory Trick:** Displacement vector divided by time interval.
**Common Mistake:** Calculating as arithmetic mean of initial and final velocities.
**One Solved Example:** A particle goes from (0,0) to (3m, 4m) in 2s. $\vec{v}_{\text{avg}} = (3\hat{i} + 4\hat{j})/2 = 1.5\hat{i} + 2\hat{j}$ m/s.
**Related Formula:** Instantaneous velocity $\vec{v} = d\vec{r}/dt$.
**Derivation:** Defined directly as the ratio of displacement to time.
[/FORMULA]

[FORMULA title="Instantaneous Velocity"]
\vec{v} = \frac{d\vec{r}}{dt}
**Variables:** \vec{r} = position vector (m), t = time (s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** Rate of change of position at a specific instant.
**When to use:** Position is given as a continuous function of time.
**When NOT to use:** Cannot be calculated using simple division if velocity is varying.
**Memory Trick:** Derivative of position vector.
**Common Mistake:** Differentiating incorrectly or omitting unit vectors.
**One Solved Example:** $\vec{r}(t) = 3t^2\hat{i} + 4t\hat{j}$. At $t=2$s: $\vec{v} = 6t\hat{i} + 4\hat{j} = 12\hat{i} + 4\hat{j}$ m/s.
**Related Formula:** Instantaneous speed $v = |\vec{v}|$.
**Derivation:** Limit of average velocity as time interval approaches zero.
[/FORMULA]

[FORMULA title="Instantaneous Speed"]
v = \left|\frac{d\vec{r}}{dt}\right|
**Variables:** \vec{r} = position vector (m), t = time (s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** Magnitude of velocity at a specific instant.
**When to use:** Calculating speedometer readings or instantaneous rate of travel.
**When NOT to use:** Cannot be integrated to find displacement directly unless direction is constant.
**Memory Trick:** Magnitude of the velocity vector.
**Common Mistake:** Integrating speed to find displacement when direction changes.
**One Solved Example:** If $\vec{v} = 3\hat{i} + 4\hat{j}$, speed is $\sqrt{3^2+4^2} = 5$ m/s.
**Related Formula:** Velocity vector $\vec{v} = v\hat{u}$.
**Derivation:** Magnitude of instantaneous velocity vector.
[/FORMULA]

[FORMULA title="Average Acceleration"]
\vec{a}_{\text{avg}} = \frac{\Delta\vec{v}}{\Delta t}
**Variables:** \Delta\vec{v} = change in velocity vector (m/s), \Delta t = time interval (s)
**SI Units:** m/s² (meters per second squared)
**Physical Meaning:** Overall rate of change of velocity vector.
**When to use:** Initial and final velocity vectors are given.
**When NOT to use:** Does not capture intermediate acceleration changes.
**Memory Trick:** Change in velocity vector divided by time.
**Common Mistake:** Doing scalar subtraction of speeds instead of vector subtraction.
**One Solved Example:** Particle turns from $5\hat{i}$ to $5\hat{j}$ m/s in 2s. $\vec{a}_{\text{avg}} = (5\hat{j} - 5\hat{i})/2 = -2.5\hat{i} + 2.5\hat{j}$ m/s².
**Related Formula:** Instantaneous acceleration $\vec{a} = d\vec{v}/dt$.
**Derivation:** Directly defined as change in velocity per unit time.
[/FORMULA]

[FORMULA title="Instantaneous Acceleration"]
\vec{a} = \frac{d\vec{v}}{dt} = v\frac{dv}{dx}
**Variables:** v = velocity (m/s), t = time (s), x = position (m)
**SI Units:** m/s² (meters per second squared)
**Physical Meaning:** Rate of change of velocity at a specific instant.
**When to use:** Velocity is given as a function of time or position.
**When NOT to use:** Do not use for constant acceleration equations.
**Memory Trick:** Time derivative of velocity, or space derivative times velocity.
**Common Mistake:** Forgetting the $v$ term in $v \frac{dv}{dx}$.
**One Solved Example:** If $v = 3x$, then $a = (3x) \cdot \frac{d(3x)}{dx} = (3x)(3) = 9x$ m/s².
**Related Formula:** $\vec{a} = \frac{d^2\vec{r}}{dt^2}$.
**Derivation:** $\frac{dv}{dt} = \frac{dv}{dx} \cdot \frac{dx}{dt} = v\frac{dv}{dx}$ using calculus chain rule.
[/FORMULA]

[FORMULA title="First Equation of Motion"]
v = u + at
**Variables:** v = final velocity (m/s), u = initial velocity (m/s), a = constant acceleration (m/s²), t = time (s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** Velocity changes linearly with time under constant acceleration.
**When to use:** Constant acceleration situations where distance is not needed.
**When NOT to use:** Variable acceleration cases.
**Memory Trick:** Velocity starts at $u$ and gains $a$ units per second.
**Common Mistake:** Using incorrect vector sign for acceleration (e.g. gravity).
**One Solved Example:** Particle with $u=2$ m/s accelerates at $3$ m/s² for $4$s. $v = 2 + (3)(4) = 14$ m/s.
**Related Formula:** $s = \left(\frac{u+v}{2}\right)t$.
**Derivation:** Integrate $dv = a \cdot dt$ from $u$ to $v$ and $0$ to $t$.
[/FORMULA]

[FORMULA title="Second Equation of Motion"]
s = ut + \frac{1}{2}at^2
**Variables:** s = displacement (m), u = initial velocity (m/s), a = constant acceleration (m/s²), t = time (s)
**SI Units:** meters (m)
**Physical Meaning:** Net position shift under constant acceleration.
**When to use:** Constant acceleration where final velocity is unknown.
**When NOT to use:** Variable acceleration cases.
**Memory Trick:** Initial velocity contribution ($ut$) plus acceleration contribution ($\frac{1}{2}at^2$).
**Common Mistake:** Confusing displacement with total distance if particle reverses direction.
**One Solved Example:** Particle with $u=10$ m/s, $a=-2$ m/s², $t=3$s. Displacement $s = 10(3) + 0.5(-2)(9) = 21$ m.
**Related Formula:** $v^2 = u^2 + 2as$.
**Derivation:** Integrate $dx = v \cdot dt = (u + at)dt$.
[/FORMULA]

[FORMULA title="Third Equation of Motion"]
v^2 = u^2 + 2as
**Variables:** v = final velocity (m/s), u = initial velocity (m/s), a = constant acceleration (m/s²), s = displacement (m)
**SI Units:** m²/s² (square of velocity)
**Physical Meaning:** Velocity change related to spatial displacement rather than time.
**When to use:** Constant acceleration where time is not given.
**When NOT to use:** Variable acceleration.
**Memory Trick:** Square of velocity gains $2as$ over distance $s$.
**Common Mistake:** Using distance instead of displacement vector components.
**One Solved Example:** Bullet stops from $100$ m/s in $0.1$m. $0 = 100^2 + 2a(0.1) \implies a = -50,000$ m/s².
**Related Formula:** $s = vt - \frac{1}{2}at^2$.
**Derivation:** Integrate $v \cdot dv = a \cdot dx$.
[/FORMULA]

[FORMULA title="Fourth Equation of Motion"]
s = \frac{u + v}{2}t
**Variables:** s = displacement (m), u = initial velocity (m/s), v = final velocity (m/s), t = time (s)
**SI Units:** meters (m)
**Physical Meaning:** Displacement is the product of average velocity and time.
**When to use:** Constant acceleration when acceleration is not known.
**When NOT to use:** Variable acceleration.
**Memory Trick:** Mean velocity multiplied by time.
**Common Mistake:** Applying it to non-uniformly accelerating motion.
**One Solved Example:** Particle accelerates from $4$ m/s to $12$ m/s in $5$s. $s = (4+12)/2 \times 5 = 40$ m.
**Related Formula:** $s = ut + \frac{1}{2}at^2$.
**Derivation:** Average of $v = u+at$ and $u = v-at$ integrated over time.
[/FORMULA]

[FORMULA title="Displacement in nth Second"]
s_n = u + \frac{a}{2}(2n - 1)
**Variables:** s_n = displacement in nth second (m), u = initial velocity (m/s), a = acceleration (m/s²), n = second number (integer)
**SI Units:** meters (m)
**Physical Meaning:** The distance traveled specifically during the single second from $t = n-1$ to $t = n$.
**When to use:** Constant acceleration to find incremental displacement.
**When NOT to use:** Variable acceleration.
**Memory Trick:** Velocity at the midpoint of the nth second: $u + a(n - 0.5)$.
**Common Mistake:** Treating $s_n$ as a velocity because of the dimensions.
**One Solved Example:** Under gravity ($u=0, a=-10$), displacement in 3rd second is $0 + (-10/2)(2(3)-1) = -25$ m.
**Related Formula:** $s = ut + \frac{1}{2}at^2$.
**Derivation:** Subtract displacement at $t=n-1$ from displacement at $t=n$.
[/FORMULA]

### Free Fall

[FORMULA title="Time of Ascent"]
t_a = \frac{u}{g}
**Variables:** u = launch velocity (m/s), g = acceleration due to gravity (9.8 m/s²)
**SI Units:** seconds (s)
**Physical Meaning:** Time taken to reach the maximum height where velocity becomes zero.
**When to use:** Vertically upward projection under gravity.
**When NOT to use:** If launched at an angle, or if air resistance is present.
**Memory Trick:** Velocity divided by deceleration rate.
**Common Mistake:** Using total time of flight instead of ascent time.
**One Solved Example:** Projected at $30$ m/s upward. Ascent time = $30/10 = 3$ seconds.
**Related Formula:** Total Time of Flight $T = 2 t_a = 2u/g$.
**Derivation:** Set $v = 0$ in $v = u - gt \implies 0 = u - gt_a$.
[/FORMULA]

[FORMULA title="Maximum Height in Free Fall"]
H = \frac{u^2}{2g}
**Variables:** u = vertical launch velocity (m/s), g = gravity (9.8 m/s²)
**SI Units:** meters (m)
**Physical Meaning:** The peak altitude reached before descending.
**When to use:** Vertically projected bodies.
**When NOT to use:** Projectiles launched at an angle (use horizontal components).
**Memory Trick:** Square of velocity divided by double gravity.
**Common Mistake:** Forgetting to square $u$.
**One Solved Example:** Thrown upward at $20$ m/s. Peak height $H = 20^2 / 20 = 20$ m.
**Related Formula:** $v^2 = u^2 - 2gH$.
**Derivation:** Set $v=0$ in third equation of motion: $0 = u^2 - 2gH$.
[/FORMULA]

### Projectile Motion

[FORMULA title="Time of Flight"]
T = \frac{2u \sin\theta}{g}
**Variables:** u = projection speed (m/s), \theta = angle with horizontal (rad), g = gravity (9.8 m/s²)
**SI Units:** seconds (s)
**Physical Meaning:** Total duration the projectile remains in the air.
**When to use:** Ground-to-ground projections.
**When NOT to use:** Launching from heights, cliffs, or onto inclined planes.
**Memory Trick:** Double the vertical component time: $2 \times (u_y/g)$.
**Common Mistakes:** Using $\cos \theta$ instead of $\sin \theta$.
**One Solved Example:** Projected at $20$ m/s at $30^\circ$. $T = 2(20)(0.5)/10 = 2$ seconds.
**Related Formula:** $T = \frac{2u_y}{g}$.
**Derivation:** Set vertical displacement $y=0$ in $y = (u\sin\theta)t - \frac{1}{2}gt^2$.
[/FORMULA]

[FORMULA title="Maximum Height of Projectile"]
H = \frac{u^2 \sin^2\theta}{2g}
**Variables:** u = projection speed (m/s), \theta = angle (rad), g = gravity (9.8 m/s²)
**SI Units:** meters (m)
**Physical Meaning:** The peak vertical distance reached by the projectile.
**When to use:** Oblique projectile motion.
**When NOT to use:** Projections from heights.
**Memory Trick:** Square of the vertical velocity component divided by $2g$.
**Common Mistakes:** Writing $\sin(2\theta)$ instead of $\sin^2\theta$.
**One Solved Example:** For $u=20$ m/s, $\theta=30^\circ$: $H = (20^2 \times 0.5^2) / (2 \times 10) = 5$ meters.
**Related Formula:** $H = \frac{u_y^2}{2g}$.
**Derivation:** Set vertical velocity $v_y = 0$ in $v_y^2 = u_y^2 - 2gH$.
[/FORMULA]

[FORMULA title="Horizontal Range"]
R = \frac{u^2 \sin 2\theta}{g}
**Variables:** u = projection speed (m/s), \theta = angle (rad), g = gravity (9.8 m/s²)
**SI Units:** meters (m)
**Physical Meaning:** Total horizontal distance covered by the projectile.
**When to use:** Ground-to-ground trajectory.
**When NOT to use:** Landing height is different from launch height.
**Memory Trick:** Range is maximized at $45^\circ$ where $\sin 2\theta = 1$.
**Common Mistakes:** Writing $\sin^2\theta$ instead of $\sin 2\theta$.
**One Solved Example:** For $u=10$ m/s, $\theta=15^\circ$: $R = 10^2 \sin(30^\circ)/10 = 5$ meters.
**Related Formula:** $R = \frac{2u_x u_y}{g}$.
**Derivation:** Product of horizontal velocity and total time of flight: $u\cos\theta \times \frac{2u\sin\theta}{g}$.
[/FORMULA]

[FORMULA title="Projectile Trajectory Equation"]
y = x \tan\theta - \frac{g x^2}{2 u^2 \cos^2\theta}
**Variables:** x, y = coordinate positions (m), u = speed (m/s), \theta = angle (rad), g = gravity (9.8 m/s²)
**SI Units:** meters (m)
**Physical Meaning:** The parabolic path coordinate relationship of the projectile.
**When to use:** Finding height at a specific horizontal distance.
**When NOT to use:** When coordinate system is rotated (e.g. inclined plane).
**Memory Trick:** Alternative form: $y = x\tan\theta (1 - \frac{x}{R})$.
**Common Mistakes:** Forgetting the square on the $\cos\theta$ term.
**One Solved Example:** With $\theta=45^\circ$, $u=10$ m/s, at $x=2$m: $y = 2(1) - 10(4)/(2 \times 100 \times 0.5) = 2 - 0.4 = 1.6$m.
**Related Formula:** $y = x\tan\theta (1 - \frac{x}{R})$.
**Derivation:** Substitute time $t = \frac{x}{u\cos\theta}$ into vertical displacement equation $y = u\sin\theta \cdot t - \frac{1}{2}gt^2$.
[/FORMULA]

[FORMULA title="Velocity at any instant t"]
\vec{v}(t) = (u\cos\theta)\hat{i} + (u\sin\theta - gt)\hat{j}
**Variables:** u = projection speed (m/s), \theta = launch angle (rad), g = gravity (9.8 m/s²), t = elapsed time (s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** Vector velocity of the projectile during flight.
**When to use:** Finding speed or direction at any time $t$.
**When NOT to use:** After the projectile hits the ground.
**Memory Trick:** Horizontal velocity stays $u_x$, vertical decreases by $gt$.
**Common Mistakes:** Applying gravity deceleration to the horizontal component.
**One Solved Example:** For $u=20$ m/s, $\theta=30^\circ$, at $t=1$s: $\vec{v} = 17.3\hat{i} + (10 - 10(1))\hat{j} = 17.3\hat{i}$ m/s.
**Related Formula:** Speed $v = \sqrt{v_x^2 + v_y^2}$.
**Derivation:** Vector sum of constant horizontal velocity and vertical velocity under gravity.
[/FORMULA]

[FORMULA title="Complementary Angles Range"]
R(\theta) = R(90^\circ - \theta)
**Variables:** \theta = launch angle (degrees)
**SI Units:** dimensionless (angles)
**Physical Meaning:** Two complementary projection angles yield the exact same horizontal range for the same launch speed.
**When to use:** Optimization problems or alternative launch scenarios.
**When NOT to use:** If launch heights or launch speeds are different.
**Memory Trick:** $30^\circ$ and $60^\circ$ land at the same spot.
**Common Mistakes:** Thinking they have the same time of flight (higher angle takes longer).
**One Solved Example:** Projections at $15^\circ$ and $75^\circ$ both have range $u^2/2g$.
**Related Formula:** $T_1 T_2 = \frac{2R}{g}$.
**Derivation:** $\sin(2(90^\circ - \theta)) = \sin(180^\circ - 2\theta) = \sin 2\theta$.
[/FORMULA]

### Relative Motion

[FORMULA title="Relative Velocity"]
\vec{v}_{AB} = \vec{v}_A - \vec{v}_B
**Variables:** \vec{v}_A = velocity of A (m/s), \vec{v}_B = velocity of B (m/s), \vec{v}_{AB} = velocity of A relative to B (m/s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** Velocity observed by an observer who is moving with object B.
**When to use:** Frame transformations and chasing/intercept problems.
**When NOT to use:** Relativistic speeds (speeds close to speed of light).
**Memory Trick:** Velocity of object minus velocity of observer.
**Common Mistakes:** Doing simple scalar subtraction when motion is in 2D.
**One Solved Example:** Car A goes north at $10\hat{j}$ m/s, B goes east at $10\hat{i}$ m/s. $\vec{v}_{AB} = 10\hat{j} - 10\hat{i}$ m/s.
**Related Formula:** $\vec{a}_{AB} = \vec{a}_A - \vec{a}_B$.
**Derivation:** Time derivative of relative position vector: $\vec{r}_{AB} = \vec{r}_A - \vec{r}_B$.
[/FORMULA]

[FORMULA title="River Crossing Shortest Time"]
t_{\text{min}} = \frac{d}{v_m}
**Variables:** d = width of river (m), v_m = swimmer velocity in still water (m/s)
**SI Units:** seconds (s)
**Physical Meaning:** The minimum possible time to cross a river, achieved by heading directly perpendicular to the current.
**When to use:** Finding crossing times when heading straight across.
**When NOT to use:** Calculating drift unless river velocity is factored in.
**Memory Trick:** Cross as if river is stationary.
**Common Mistakes:** Heading upstream when shortest time is desired (that minimizes drift, not time).
**One Solved Example:** River width $100$m, swimmer speed $5$ m/s. Shortest time $t = 100/5 = 20$s.
**Related Formula:** Drift distance $x = v_r \cdot t_{\text{min}}$.
**Derivation:** Time $t = \frac{d}{v_m \cos\theta}$; minimized when $\cos\theta = 1 \implies \theta = 0^\circ$.
[/FORMULA]

[FORMULA title="River Crossing Shortest Path"]
\sin\theta = \frac{v_r}{v_m}
**Variables:** v_r = velocity of river flow (m/s), v_m = velocity of swimmer in still water (m/s), \theta = angle upstream (rad)
**SI Units:** dimensionless (sine ratio)
**Physical Meaning:** Angle upstream the swimmer must head to land directly opposite the starting point (zero drift).
**When to use:** Zero drift river crossing problems when $v_m > v_r$.
**When NOT to use:** If river speed is greater than swimmer speed ($v_r > v_m$), direct opposite landing is mathematically impossible.
**Memory Trick:** Sine is opposite over hypotenuse: river speed over swimmer speed.
**Common Mistakes:** Forgetting that if $v_r > v_m$, this formula has no real solution.
**One Solved Example:** River speed $3$ m/s, swimmer speed $5$ m/s. Heading angle $\sin\theta = 3/5 \implies \theta = 37^\circ$ upstream.
**Related Formula:** Time taken $t = \frac{d}{\sqrt{v_m^2 - v_r^2}}$.
**Derivation:** Resolve velocity along river: $v_m \sin\theta = v_r$ to cancel river speed.
[/FORMULA]

[FORMULA title="Rain-Man Umbrella Angle"]
\tan\theta = \frac{v_m}{v_r}
**Variables:** v_m = speed of walking man (m/s), v_r = speed of vertically falling rain (m/s), \theta = angle of umbrella with vertical (rad)
**SI Units:** dimensionless (tangent ratio)
**Physical Meaning:** The inclination angle to hold an umbrella to block relative rainfall.
**When to use:** Vertically falling rain and horizontally moving observer.
**When NOT to use:** If rain falls at a wind-driven angle (use general vector subtraction).
**Memory Trick:** Man's speed over rain's speed.
**Common Mistakes:** Finding angle with horizontal instead of vertical.
**One Solved Example:** Walking at $3$ m/s, rain falls vertically at $4$ m/s. Umbrella angle $\tan\theta = 3/4 \implies \theta = 37^\circ$ with vertical.
**Related Formula:** Relative speed of rain $v_{\text{rel}} = \sqrt{v_m^2 + v_r^2}$.
**Derivation:** $\vec{v}_{\text{rain/man}} = \vec{v}_r - \vec{v}_m = -v_r\hat{j} - v_m\hat{i}$. Angle with vertical is $\tan\theta = |v_{x}/v_{y}| = v_m/v_r$.
[/FORMULA]

### Graph Relations

[FORMULA title="Slope of Position-Time Graph"]
v = \frac{dx}{dt}
**Variables:** x = position (m), t = time (s), v = velocity (m/s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** The slope of the tangent to a position-time graph represents the instantaneous velocity.
**When to use:** Analyzing motion profiles visually.
**When NOT to use:** Do not use simple secant slope for instantaneous values if curve is non-linear.
**Memory Trick:** Change in position over change in time.
**Common Mistakes:** Confusing displacement slope with distance slope.
**One Solved Example:** Position graph is $x(t) = 5t^2$. Slope at $t=2$s is $10t = 20$ m/s.
**Related Formula:** $a = \frac{dv}{dt}$.
**Derivation:** Instantaneous rate of change definition.
[/FORMULA]

[FORMULA title="Slope of Velocity-Time Graph"]
a = \frac{dv}{dt}
**Variables:** v = velocity (m/s), t = time (s), a = acceleration (m/s²)
**SI Units:** m/s² (meters per second squared)
**Physical Meaning:** The slope of the tangent to a velocity-time graph represents the instantaneous acceleration.
**When to use:** Extracting acceleration values from velocity plots.
**When NOT to use:** If graph is displacement-time.
**Memory Trick:** Acceleration is rate of change of velocity.
**Common Mistakes:** Confusing slope with area.
**One Solved Example:** Velocity curve is $v(t) = 4t^3$. Slope at $t=1$s is $12t^2 = 12$ m/s².
**Related Formula:** $v = \frac{dx}{dt}$.
**Derivation:** Fundamental calculus derivative definition of acceleration.
[/FORMULA]

[FORMULA title="Area under Velocity-Time Graph"]
\text{Displacement} = \int v\,dt
**Variables:** v = velocity (m/s), t = time (s)
**SI Units:** meters (m)
**Physical Meaning:** Total area bounded by velocity curve and time axis represents net displacement.
**When to use:** Finding distance/displacement from velocity plots.
**When NOT to use:** For finding acceleration (use slope).
**Memory Trick:** Integrals accumulate; velocity accumulation over time is distance.
**Common Mistakes:** Forgetting that areas below the time axis are negative for displacement, but positive for total distance.
**One Solved Example:** A triangular VT graph of base $4$s and peak height $10$ m/s. Area (displacement) = $\frac{1}{2} \times 4 \times 10 = 20$m.
**Related Formula:** $\text{Distance} = \int |v|\,dt$.
**Derivation:** Reversing derivative: $dx = v\,dt \implies \int dx = \int v\,dt$.
[/FORMULA]

[FORMULA title="Area under Acceleration-Time Graph"]
\Delta v = \int a\,dt
**Variables:** a = acceleration (m/s²), t = time (s), \Delta v = change in velocity (m/s)
**SI Units:** m/s (meters per second)
**Physical Meaning:** The bounded area represents the net change in velocity ($v_f - v_i$).
**When to use:** Constant or varying acceleration graphs.
**When NOT to use:** Does not give absolute final velocity directly unless initial velocity is known.
**Memory Trick:** Area gives *change* in velocity, not velocity itself.
**Common Mistakes:** Equating area directly to final velocity instead of $v_f - u$.
**One Solved Example:** Rectangular AT graph of height $3$ m/s² and duration $5$s. Change in velocity $\Delta v = 3 \times 5 = 15$ m/s.
**Related Formula:** $\Delta x = \iint a\,dt^2$.
**Derivation:** Reversing derivative: $dv = a\,dt \implies \int dv = \int a\,dt$.
[/FORMULA]

### Special Cases

[FORMULA title="Inclined Projectile Time of Flight"]
T = \frac{2u \sin(\theta - \beta)}{g \cos\beta}
**Variables:** u = launch velocity (m/s), \theta = launch angle with horizontal (rad), \beta = incline angle (rad)
**SI Units:** seconds (s)
**Physical Meaning:** Flight duration of a projectile launched up an inclined surface.
**When to use:** Projectiles on hills or ramps.
**When NOT to use:** Horizontal projections.
**Memory Trick:** Replace vertical components with perpendicular-to-incline components.
**Common Mistakes:** Using horizontal formulas on incline scenarios.
**One Solved Example:** Launched at $u=10$ m/s, $\theta=60^\circ$ up a $\beta=30^\circ$ incline. $T = 2(10)\sin(30^\circ)/(10\cos 30^\circ) = 1.15$s.
**Related Formula:** Maximum range up incline: $R_{\text{max}} = \frac{u^2}{g(1 + \sin\beta)}$.
**Derivation:** Rotate coordinates by $\beta$: $y' = u\sin(\theta-\beta)t - \frac{1}{2}g\cos\beta \cdot t^2$; set $y'=0$.
[/FORMULA]

[FORMULA title="Inclined Projectile Range"]
R = \frac{u^2}{g \cos^2\beta}[\sin(2\theta - \beta) - \sin\beta]
**Variables:** u = launch speed (m/s), \theta = launch angle (rad), \beta = incline angle (rad)
**SI Units:** meters (m)
**Physical Meaning:** Total linear distance covered along the inclined surface.
**When to use:** Up-incline projections.
**When NOT to use:** Down-incline projections (change sign of $\beta$).
**Memory Trick:** Reduces to standard range formula $u^2\sin 2\theta/g$ when incline $\beta = 0$.
**Common Mistakes:** Confusing horizontal range component with range along the incline.
**One Solved Example:** Launched at $45^\circ$ up a $30^\circ$ incline with speed $10$ m/s. Incline Range $R = (100)/(10 \times 0.75) \times [\sin(60^\circ) - \sin(30^\circ)] = 13.33 \times (0.866 - 0.5) = 4.88$m.
**Related Formula:** Down-incline range uses $+\sin\beta$ in brackets.
**Derivation:** Horizontal range coordinate divided by incline slope geometry.
[/FORMULA]

## 6. Important Graphs
In kinematics, graphs are powerful tools for visualization:
- **Displacement-Time (x-t) Graph:** The slope of the tangent at any point gives the instantaneous velocity. Curvature indicates acceleration (concave up = positive acceleration, concave down = negative acceleration).
- **Velocity-Time (v-t) Graph:** The slope gives the instantaneous acceleration. The area under the curve (taking signs into account) gives the net displacement, while the absolute area gives the total distance traveled.
- **Acceleration-Time (a-t) Graph:** The area under the curve gives the change in velocity ($v_f - v_i$).

## 7. Solved Examples

[WORKED_EXAMPLE]
{
  "question": "A stone is thrown vertically upwards from the top of a tower of height 40m with an initial speed of 10m/s. Find the time taken by the stone to hit the ground. (Take g = 10 m/s²)",
  "hints": [
    "Set the top of the tower as the origin (0,0).",
    "Use the displacement equation S = ut + 1/2 a t^2 with signs: S = -40, u = +10, a = -10."
  ],
  "thinkTime": "What is the total distance traveled by the stone compared to its displacement?",
  "steps": [
    "Define coordinates: Upward direction is positive (+y).",
    "Displacement S = -40 m (downward from origin).",
    "Initial velocity u = +10 m/s (upward).",
    "Acceleration a = -10 m/s² (downward gravity).",
    "Write equation: -40 = 10t - 5t².",
    "Rearrange to standard quadratic: 5t² - 10t - 40 = 0 => t² - 2t - 8 = 0.",
    "Factorize: (t - 4)(t + 2) = 0.",
    "Since time cannot be negative, t = 4 seconds."
  ],
  "finalAnswer": "$$t = 4\\text{ s}$$",
  "alternativeMethod": "Calculate time to reach maximum height (1s), distance to top (5m), then time to fall 45m from rest (3s). Total = 1s + 3s = 4s.",
  "commonMistakes": [
    "Setting displacement S = -40m instead of -40m.",
    "Using positive acceleration for gravity."
  ]
}
[/WORKED_EXAMPLE]

[WORKED_EXAMPLE]
{
  "question": "A projectile is launched from horizontal ground with speed u at angle theta. Show that the path of the projectile is a parabola.",
  "hints": [
    "Express x and y as functions of time t.",
    "Eliminate t from the equations to find y in terms of x."
  ],
  "thinkTime": "How does air resistance change this mathematical trajectory?",
  "steps": [
    "Horizontal position: x = (u cos(theta)) * t => t = x / (u cos(theta)).",
    "Vertical position: y = (u sin(theta)) * t - 1/2 g t².",
    "Substitute t into y equation: y = u sin(theta) * [x / (u cos(theta))] - 1/2 g [x / (u cos(theta))]².",
    "Simplify terms: y = x tan(theta) - [g x²] / [2 u² cos²(theta)].",
    "This equation is of the form y = ax - bx², which is a downward-opening parabola."
  ],
  "finalAnswer": "$$y = x \\tan \\theta - \\frac{g x^2}{2 u^2 \\cos^2 \\theta}$$",
  "alternativeMethod": "None",
  "commonMistakes": [
    "Mixing horizontal and vertical components during substitution."
  ]
}
[/WORKED_EXAMPLE]

## 8. PYQ Analysis
- **Frequency:** Motion in 1D (Calculus) represents 40% of kinematics questions, Projectiles represent 35%, and Relative Motion (River-boat/Rain-man) represents 25%.
- **Trend:** Over the past 5 years in JEE Main, there is a clear trend towards graphical conversion questions (e.g., converting a displacement-time graph to an acceleration-time graph).
- **Advanced Focus:** JEE Advanced heavily focuses on constrained relative motion and projectile motion on inclined surfaces with variable incline angles.

## 9. Common Mistakes
[COMMON_MISTAKE]
Mistake: Using equations of motion $v = u + at$ for variables where acceleration depends on time (e.g. $a = 3t$).
Why: Students forget that these equations are ONLY valid for constant acceleration.
Correct: Integrate the definitions: $dv = a \cdot dt$ and $dx = v \cdot dt$.
[/COMMON_MISTAKE]

[COMMON_MISTAKE]
Mistake: Assuming relative velocity $v_{AB}$ is always $v_A - v_B$ in scalar math without vector directions.
Why: In 2D, relative velocity MUST be solved using vector subtraction: $\vec{v}_{AB} = \vec{v}_A - \vec{v}_B$.
Correct: Write the velocities in unit-vector form ($\hat{i}$, $\hat{j}$) before subtracting.
[/COMMON_MISTAKE]

## 10. Shortcuts
[JEE_TRICK]
**Shortcut for River-Boat Shortest Path:** To cross a river of width $d$ along the shortest path (directly opposite point), the swimmer must swim at an angle $\theta$ upstream such that $\sin \theta = v_r / v_m$, where $v_r$ is river speed and $v_m$ is swimmer speed relative to water.
[/JEE_TRICK]

## 11. Revision Sheet
- **Calculus Definitions:** $v = \frac{dx}{dt}$, $a = \frac{dv}{dt} = v\frac{dv}{dx}$.
- **Constant Acceleration:** $v = u+at$, $S = ut + \frac{1}{2}at^2$, $v^2 = u^2 + 2aS$, $S_n = u + \frac{a}{2}(2n-1)$.
- **Projectile Motion:** $T = \frac{2u\sin\theta}{g}$, $H = \frac{u^2\sin^2\theta}{2g}$, $R = \frac{u^2\sin 2\theta}{g}$.
- **Relative Motion:** $\vec{v}_{AB} = \vec{v}_A - \vec{v}_B$.

## 12. Chapter Summary
Kinematics builds the core language of motion. We analyze objects moving in straight lines (1D) or planes (2D, projectiles) under both constant and varying accelerations. Relative motion allows translation of these observations across moving reference frames.

## 13. Mind Map
Kinematics
├── Motion in 1D
│   ├── Uniform Motion (constant v)
│   └── Non-Uniform Motion (constant a vs variable a)
├── Motion in 2D
│   ├── Projectile Motion (Horizontal & Inclined)
│   └── Circular Motion (Kinematics components)
└── Relative Motion
    ├── River-Boat Problems (Shortest time vs path)
    └── Rain-Man Problems (Vector direction)

## 14. Exam Tips
- Draw a coordinate system explicitly on your rough sheet before starting a kinematics problem.
- If a problem mentions 'minimum distance' or 'collision', write equations for relative separation and set the derivative to zero or equate positions.
- In relative velocity, always label who is the observer and draw their vector reversed.

## 15. AI Insights
Analytics show that 85% of students lose marks on projectile motion on incline planes because they fail to rotate the coordinate system. Rotating the axes so that the x-axis lies along the incline simplifies the calculations significantly, making $a_x = -g \sin \beta$ and $a_y = -g \cos \beta$.$raw_content$,
ai_context = 'Kinematics: displacement, velocity, acceleration. Standard formulas, graphs, relative motion, and incline plane projectiles.'
WHERE chapter_id = 'phy-1' AND exam_type = 'JEE';
