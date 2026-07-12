# KINEMATICS — Complete Master Notes
### PrepEntrance Physics | JEE Main • JEE Advanced • NEET • Class 11 • Droppers

---

## 1. Chapter Overview

**Why Kinematics matters**

Kinematics is the grammar of physics. Before you can analyze *why* something moves (dynamics, forces, energy), you must be fluent in *describing* how it moves — position, velocity, acceleration, and their relationships in time. Every later chapter borrows this language directly:

- **Laws of Motion**: F = ma requires you to already know what "a" means and how to extract it from a graph or equation.
- **Work, Energy, Power**: velocity appears inside every energy and power expression.
- **Circular Motion**: is kinematics wrapped around a curved path — same ideas, polar coordinates.
- **Rotational Mechanics**: angular kinematics is a direct copy-paste of linear kinematics with θ, ω, α replacing x, v, a.
- **SHM and Waves**: are kinematics of a very specific kind of accelerated motion (acceleration proportional to displacement).
- **Electromagnetism (motion of charges)**: projectile-style analysis of charged particles in fields is identical in structure to projectile motion under gravity.

If your kinematics foundation is weak, every one of these chapters becomes harder than it needs to be. Strong kinematics is a force multiplier for the entire syllabus.

**Where it appears in JEE & NEET**

- Rarely tested as an isolated "pure" chapter in JEE Advanced at the top level — instead it is *embedded* inside Laws of Motion, Circular Motion, and Rotation problems as the tool used to set up the problem.
- In JEE Main and NEET, direct standalone questions are common: 1D motion with variable acceleration, graph interpretation, projectile motion, and relative motion (river-boat/rain-man) are near-guaranteed every year.
- NEET tends to test conceptual and graph-based questions more than heavy calculus-based variable acceleration problems.
- JEE Advanced tends to fuse kinematics with calculus (differentiation/integration of vectors) and with multi-body relative motion.

**Connection with future chapters**

Kinematics → Laws of Motion → Work-Energy → Circular Motion → Rotational Motion → SHM → Waves. It is also foundational for Electrostatics/Magnetism problems involving charged particle trajectories, and for Fluid Mechanics (Bernoulli/flow problems use velocity fields).

**Weightage (approximate, based on multi-year trends)**

| Exam | Direct Weightage | Embedded Weightage (used inside other chapters) |
|---|---|---|
| JEE Main | 2–3 questions (8–12 marks) | High — appears inside NLM, circular motion |
| JEE Advanced | 0–2 direct questions | Very high — almost every mechanics problem starts with a kinematics setup |
| NEET | 2–3 questions (8–12 marks) | Moderate |

**Estimated study time**

- First read-through (concepts + derivations): 6–8 hours
- Problem practice (Easy → Hard): 10–14 hours
- Revision cycles (this document, repeated): 1–1.5 hours per pass

**Difficulty**

Conceptually moderate, but a "silent killer" chapter — students underestimate it because the ideas sound simple in words, then lose marks on sign convention, frame-of-reference errors, and graph misreading. Calculus-based variable acceleration problems push this chapter to genuinely hard for JEE Advanced.

---

## 2. Learning Outcomes

By the end of this chapter you should be able to, without hesitation:

1. **Motion in 1D**: Set up position-time relations, differentiate/integrate to move between x, v, a, and solve variable-acceleration problems using calculus, not just the standard three equations.
2. **Motion in 2D**: Handle position, velocity, and acceleration as vectors with independent x- and y-components, and combine them correctly.
3. **Projectile Motion**: Solve ground-to-ground, projectile-from-height, and projectile-on-incline problems, including time of flight, range, maximum height, and trajectory equation.
4. **Relative Motion**: Convert any multi-body motion problem into a single-body problem using relative velocity, and solve river-boat and rain-man problems geometrically and algebraically.
5. **Graph-Based Questions**: Read slope and area correctly on x-t, v-t, and a-t graphs, and convert between them without re-deriving from scratch every time.

---

## 3. Complete Theory

### 3.1 Scalars and Vectors

**Intuition**: Some physical quantities are completely described by a single number ("how much"). Others need a number *and* a direction ("how much, which way"). If you ignore direction where it matters, your answer is not just imprecise — it can be flatly wrong (e.g., adding two velocities in opposite directions as if they pointed the same way).

**Definitions**:
- **Scalar**: has magnitude only. Examples: distance, speed, mass, time, energy, temperature.
- **Vector**: has magnitude and direction, and must obey the triangle/parallelogram law of vector addition. Examples: displacement, velocity, acceleration, force, momentum.

**Key test for "is this a vector?"**: A quantity is a vector only if it obeys vector addition rules. Electric current has direction but is *not* a vector (it doesn't add like vectors — it adds algebraically at a junction, per Kirchhoff's law), which is why it's classified as scalar despite having a "direction."

**Real-life analogy**: Telling a friend "drive 10 km" (scalar, distance) is useless for navigation. Telling them "drive 10 km north" (vector, displacement) actually gets them somewhere. GPS direction arrows are vectors; the odometer reading is a scalar.

**Important observations**:
- Vector addition is never simple arithmetic addition unless the vectors are collinear and same-direction.
- Two vectors of equal magnitude but opposite direction sum to a zero vector, but the corresponding scalars (magnitudes) simply add if you (incorrectly) treat them as scalars — this is the single most common source of sign errors in this chapter.

---

### 3.2 Distance vs Displacement

**Intuition**: Distance answers "how much ground did you cover?" Displacement answers "where did you end up, relative to where you started?" A round trip has real distance but zero displacement.

**Definitions**:
- **Distance**: total length of the actual path traveled. Scalar. Always ≥ 0, and always increases (or stays same) with time — never decreases.
- **Displacement**: the straight-line vector from initial position to final position. Vector. Can be positive, negative, or zero regardless of how much distance was covered.

**Derivation-style relation**:
$$|\text{Displacement}| \le \text{Distance}$$
Equality holds only for motion in a straight line without any reversal of direction.

**Real-life analogy**: You walk to a shop 500 m away and walk back home. Distance walked = 1000 m. Displacement = 0 m — you are exactly where you started, and your GPS pin hasn't moved.

**Important observations**:
- Distance is path-dependent; displacement is path-independent (depends only on endpoints).
- On a circular track, one full lap gives distance = circumference, displacement = 0.
- Half a lap gives distance = πr, displacement = 2r (diameter).

---

### 3.3 Speed vs Velocity

**Intuition**: Speed is "how fast," full stop. Velocity is "how fast, and in which direction." A car going around a roundabout at a constant 40 km/h has constant *speed* but *continuously changing velocity*, because direction keeps changing.

**Definitions**:
- **Speed** = distance / time (scalar), always ≥ 0.
- **Velocity** = displacement / time (vector), can be negative depending on chosen positive direction.

**Key relation**: Average speed ≥ |Average velocity|, with equality only for unidirectional straight-line motion.

**Real-life analogy**: A speedometer shows speed, never velocity — it has no idea which way you're pointed, only how fast the wheels are turning.

**Important observations**:
- "Speed is decreasing" does not necessarily mean "acceleration is negative" — it means acceleration is opposite to velocity direction (deceleration), which in 1D with a chosen sign convention can appear as either sign.
- Uniform circular motion is the classic example of constant speed, non-constant velocity — hence non-zero acceleration (centripetal) despite constant speed.

---

### 3.4 Average Speed

**Definition**: 
$$v_{avg} = \frac{\text{Total distance}}{\text{Total time}}$$

**Derivation — two equal-distance parts at different speeds** (a very common trap):
If a body covers a distance d at speed $v_1$ and the same distance d back (or onward) at speed $v_2$:
$$t_1 = \frac{d}{v_1}, \quad t_2 = \frac{d}{v_2}$$
$$v_{avg} = \frac{2d}{t_1+t_2} = \frac{2d}{\frac{d}{v_1}+\frac{d}{v_2}} = \frac{2 v_1 v_2}{v_1+v_2}$$

This is the **harmonic mean**, not the arithmetic mean. Students very frequently (and incorrectly) average as $(v_1+v_2)/2$ — that formula is only valid for **equal time intervals**, not equal distances.

**Derivation — two equal-time parts at different speeds**:
If a body travels at $v_1$ for time t and $v_2$ for the same time t:
$$v_{avg} = \frac{v_1 t + v_2 t}{2t} = \frac{v_1+v_2}{2}$$
Here the arithmetic mean is correct, because the weighting variable (time) is equal.

**Real-life analogy**: Driving 60 km/h for the first half of a road's *length* and 30 km/h for the second half of its *length* — you spend more time at the slower speed, so your average is pulled toward 30, not sitting exactly at 45. Harmonic mean captures this weighting.

**Memory trick**: "Equal DISTANCE → Harmonic mean; Equal TIME → Arithmetic mean." (D for Distance, D for "Different" formula — Harmonic.)

---

### 3.5 Average Velocity

**Definition**:
$$\vec{v}_{avg} = \frac{\Delta \vec{x}}{\Delta t} = \frac{\vec{x}_f - \vec{x}_i}{t_f - t_i}$$

**Intuition**: This is the *net* rate of position change — it doesn't care about the wiggles in between, only where you started and ended, and how long it took.

**Real-life analogy**: If a delivery rider ends up 3 km north of the depot after 30 minutes of zig-zagging through traffic, their average velocity is 6 km/h north, regardless of the actual distance covered weaving through lanes.

**Important observation**: Average velocity can be zero even while average speed is large and positive (round trip).

---

### 3.6 Instantaneous Velocity

**Intuition**: Average velocity smooths out an entire interval; sometimes you need to know the velocity *at this exact instant* — like a speedometer reading at one moment, not over the whole trip.

**Definition**:
$$v = \lim_{\Delta t \to 0} \frac{\Delta x}{\Delta t} = \frac{dx}{dt}$$

**Derivation intuition**: Instantaneous velocity is the average velocity computed over a vanishingly small time interval — shrink the interval until it collapses to a single point, and what remains is the slope of the tangent to the position-time curve at that point.

**Real-life analogy**: A radar gun measures your instantaneous velocity at the moment it's pointed at you — not your average speed over the whole highway stretch.

**Important observations**:
- Instantaneous velocity = slope of the x-t graph at that instant.
- Instantaneous speed = magnitude of instantaneous velocity, always.
- Average speed over an interval is NOT generally the average of instantaneous speeds; it requires proper time-weighted (or distance-weighted, as shown above) integration.

---

### 3.7 Acceleration

**Intuition**: Acceleration measures how fast *velocity itself* is changing — a "rate of a rate." It is the reason velocity-time graphs have slope, the way position-time graphs have slope for velocity.

**Definitions**:
$$a_{avg} = \frac{\Delta v}{\Delta t}, \qquad a = \lim_{\Delta t \to 0}\frac{\Delta v}{\Delta t} = \frac{dv}{dt} = \frac{d^2x}{dt^2}$$

**Derivation intuition**: Just as velocity is the slope of x-t, acceleration is the slope of v-t, and the second derivative of x-t.

**Real-life analogy**: Pressing the accelerator pedal harder doesn't just make you "go faster" — it increases the *rate* at which your speed increases. A sports car's selling point ("0 to 100 km/h in 3 seconds") is literally an acceleration specification.

**Important observations**:
- Acceleration can be positive while speed is decreasing (if acceleration is directed opposite to velocity in the chosen positive direction) — "positive acceleration" is not synonymous with "speeding up." Sign context matters.
- Zero velocity does NOT imply zero acceleration (ball thrown up has zero velocity at the top but acceleration = g, still acting downward).
- Zero acceleration does NOT imply zero velocity — it implies constant velocity.

---

### 3.8 Uniform Motion

**Definition**: Motion with constant velocity — equal displacements in equal time intervals, in a straight line, with zero acceleration.

**Equation**: $x = x_0 + vt$

**x-t graph**: straight line with constant slope = v.
**v-t graph**: horizontal line; area under it up to time t gives displacement = v·t.

**Real-life analogy**: Cruise control on a highway holding exactly 100 km/h — every second covers exactly 27.8 m, no more, no less.

---

### 3.9 Non-Uniform Motion

**Definition**: Velocity changes with time — acceleration is non-zero (and may itself vary with time).

**Cases**:
1. **Uniform (constant) acceleration** — the standard "equations of motion" apply directly.
2. **Non-uniform (variable) acceleration** — requires calculus (differentiation/integration); standard equations do NOT apply directly.

**Real-life analogy**: City traffic — your car speeds up, slows for a signal, speeds up again. Velocity is a messy, non-constant function of time; acceleration itself keeps changing.

**Important observation**: The single biggest jump in difficulty from Class 11 board-level kinematics to JEE Advanced-level kinematics is precisely this: variable acceleration problems where a = f(t), f(v), or f(x), each requiring a different calculus technique.

---

### 3.10 Equations of Motion (Constant Acceleration)

These apply ONLY when acceleration is constant in magnitude and direction.

**Derivation of v = u + at** (from definition of acceleration):
$$a = \frac{dv}{dt} \implies dv = a\,dt \implies \int_u^v dv = \int_0^t a\,dt \implies v - u = at \implies v = u + at$$

**Derivation of s = ut + ½at²** (from definition of velocity, using v = u + at):
$$v = \frac{dx}{dt} = u + at \implies dx = (u+at)\,dt \implies \int_0^s dx = \int_0^t (u+at)\,dt \implies s = ut + \frac{1}{2}at^2$$

**Derivation of v² = u² + 2as** (eliminate t between the two above):
From $v = u+at \Rightarrow t = \frac{v-u}{a}$. Substitute into $s = ut + \frac12 at^2$:
$$s = u\left(\frac{v-u}{a}\right) + \frac12 a \left(\frac{v-u}{a}\right)^2 = \frac{uv-u^2}{a} + \frac{(v-u)^2}{2a}$$
Multiply through by 2a and simplify:
$$2as = 2uv - 2u^2 + v^2 - 2uv + u^2 = v^2 - u^2 \implies v^2 = u^2+2as$$

**Derivation of $s_n$ (distance in nth second)**:
$$s_n = s_n - s_{n-1} = \left[un + \frac12 a n^2\right] - \left[u(n-1)+\frac12 a(n-1)^2\right] = u + \frac{a}{2}(2n-1)$$
$$\boxed{s_n = u + \frac{a}{2}(2n-1)}$$

**Real-life analogy**: A car braking from 20 m/s at −4 m/s² — these equations tell you exactly how far it travels before stopping (using v² = u² + 2as with v = 0), which is precisely what stopping-distance charts in driving manuals are built from.

**Important observations**:
- All three (v=u+at, s=ut+½at², v²=u²+2as) are NOT independent new physics — they are the same one definition (a = dv/dt) unpacked three different ways. Memorizing the derivation once means you never truly "forget" the formulas.
- Sign convention must be fixed *before* substituting numbers — pick one positive direction and stay consistent for u, a, and s throughout the entire problem.

---

### 3.11 Free Fall

**Intuition**: Free fall is 1D motion under constant acceleration g, directed toward Earth's center, with the classic equations of motion re-labeled: x → h, a → ±g.

**Definition**: A body falls freely when the only force acting is gravity (no air resistance). Near Earth's surface, g ≈ 9.8 m/s² (often taken as 10 m/s² for quick JEE/NEET calculation).

**Key equations (drop from rest, taking downward as positive)**:
$$v = gt, \qquad h = \frac12 gt^2, \qquad v^2 = 2gh$$

**Derivation of time to fall height h**: from $h = \frac12 g t^2 \Rightarrow t = \sqrt{\frac{2h}{g}}$.

**Real-life analogy**: Dropping a coin from a building — ignoring air resistance, it doesn't matter if it's a coin or a bowling ball (Galileo's famous insight): both hit the ground at the same time from the same height, because acceleration doesn't depend on mass.

**Important observations**:
- Free fall is NOT "zero air resistance in real life" — real falling objects (feathers, paper) deviate significantly; free-fall equations are an idealization, valid well for dense, compact objects over short heights.
- Velocity at any height during fall depends only on the height fallen, not on the mass — a frequently tested conceptual MCQ trap.

---

### 3.12 Vertical Motion (Upward Throw)

**Intuition**: Throwing a ball straight up is free fall in reverse initially — the ball decelerates under gravity, momentarily stops, then falls back exactly retracing its path (in absence of air resistance).

**Taking upward as positive, a = −g**:
$$v = u - gt, \qquad h = ut - \frac12 gt^2, \qquad v^2 = u^2 - 2gh$$

**Derivation of time to reach maximum height**: at max height v = 0:
$$0 = u - g t_{up} \implies t_{up} = \frac{u}{g}$$

**Derivation of maximum height**:
$$H_{max} = \frac{u^2}{2g}$$
(from v² = u² − 2gh with v = 0)

**Derivation of time of flight (back to same launch level)**: by symmetry, $t_{total} = 2t_{up} = \frac{2u}{g}$.

**Real-life analogy**: A cricket ball hit straight up takes exactly as long to come down as it took to go up (ignoring air drag), and returns to the fielder's hand with the same speed it left the bat — energy symmetry mirrored in time symmetry.

**Important observations**:
- At the topmost point: velocity = 0, but acceleration = −g (still acting) — a favorite conceptual trap.
- Speed at any given height is the same whether the ball is going up or coming down through that height (by v² = u² − 2gh symmetry).
- If thrown from a height (e.g., off a cliff or tower) and allowed to fall below the launch point, use the SAME single equation $h = ut - \frac12 gt^2$ with h taken negative when the object ends up below the starting point — no need for separate "up" and "down" equations.

---

### 3.13 Projectile Motion

**Intuition**: A projectile undergoes two completely independent 1D motions happening simultaneously — horizontal (uniform velocity, no horizontal force in the ideal case) and vertical (uniformly accelerated, due to gravity). The trick to mastering projectile motion is to treat it as two easy, independent 1D problems glued together by a shared time variable.

**Case A: Horizontal Projectile (launched horizontally from height H)**

- Horizontal: $x = ut$ (constant velocity u)
- Vertical: $y = \frac12 g t^2$ (starts from rest vertically)
- Time to hit ground: $t = \sqrt{\dfrac{2H}{g}}$
- Horizontal range: $R = u\sqrt{\dfrac{2H}{g}}$
- Trajectory (eliminate t): $y = \dfrac{g}{2u^2}x^2$ — a parabola.

**Case B: Angular Projectile (launched at angle θ with speed u, ground to ground)**

- Horizontal component: $u_x = u\cos\theta$ (constant throughout flight)
- Vertical component: $u_y = u\sin\theta$ (decelerates under −g, symmetric up/down)

**Derivation of Time of Flight**: Vertical displacement returns to zero at landing:
$$0 = u\sin\theta \cdot T - \frac12 g T^2 \implies T = \frac{2u\sin\theta}{g}$$

**Derivation of Maximum Height**:
$$H = \frac{u^2\sin^2\theta}{2g}$$

**Derivation of Range**:
$$R = u_x \cdot T = u\cos\theta \cdot \frac{2u\sin\theta}{g} = \frac{u^2\sin2\theta}{g}$$

**Derivation of Trajectory Equation** (eliminate t):
$$t = \frac{x}{u\cos\theta} \implies y = x\tan\theta - \frac{gx^2}{2u^2\cos^2\theta}$$
A downward-opening parabola in x.

**Key relationships**:
- Range is maximum at θ = 45°.
- θ and (90° − θ) give the SAME range (complementary angles), though different times of flight and heights.
- $H_{max}/R = \dfrac{\tan\theta}{4}$.

**Case C: Projectile on an Incline**

Resolve along and perpendicular to the incline instead of horizontal/vertical, turning g into components $g\sin\alpha$ (along incline) and $g\cos\alpha$ (perpendicular).

- Time of flight (up incline): $T = \dfrac{2u\sin(\theta-\alpha)}{g\cos\alpha}$
- Range along incline: $R = \dfrac{2u^2\sin(\theta-\alpha)\cos\theta}{g\cos^2\alpha}$

**Real-life analogy**: A basketball free throw is a ground-to-hoop angular projectile problem; a bomb released from a horizontally-flying plane is a horizontal projectile problem; a golf shot up a sloped fairway is a projectile-on-incline problem.

**Important observations**:
- Horizontal velocity never changes during flight — the single most powerful simplifying fact in this topic.
- At the highest point of an angular projectile, velocity is NOT zero — only the vertical component is zero; horizontal component u cosθ persists.
- Speed is minimum at the top of the trajectory, equal to $u\cos\theta$, never zero (unless θ = 90°).

---

### 3.14 Relative Velocity

**Intuition**: "Relative velocity of A with respect to B" answers: if you were sitting on B watching A, how would A appear to move? This turns multi-body problems into a single effective 1-body problem.

**Definition**:
$$\vec{v}_{AB} = \vec{v}_A - \vec{v}_B$$

**Derivation intuition**: Position of A relative to B is $\vec{r}_{AB} = \vec{r}_A - \vec{r}_B$. Differentiating with respect to time gives $\vec{v}_{AB} = \vec{v}_A - \vec{v}_B$, and further, $\vec{a}_{AB} = \vec{a}_A - \vec{a}_B$.

**Real-life analogy**: Sitting in a train moving at 60 km/h, another train alongside also at 60 km/h in the same direction appears stationary — their relative velocity is zero, even though both move fast relative to the ground.

**Important observations**:
- Relative velocity is vector subtraction — always draw a vector diagram for 2D cases, don't reason purely verbally.
- $\vec{v}_{AB} = -\vec{v}_{BA}$.

---

### 3.15 River-Boat Problems

**Intuition**: A boat's velocity relative to ground is the vector sum of its velocity relative to water (engine/rowing) and the water's velocity relative to ground (current). This is relative velocity applied to a specific, heavily-tested geometry.

**Setup**: River width d, current speed $v_r$, boat speed relative to water $v_b$.

**Case 1 — Shortest time to cross** (boat pointed straight across):
$$t_{min} = \frac{d}{v_b}$$
Drift downstream = $\dfrac{v_r d}{v_b}$.

**Case 2 — Shortest path (zero drift, lands directly opposite)**:
$$\sin\theta = \frac{v_r}{v_b} \quad (\text{requires } v_b > v_r)$$
$$t = \frac{d}{v_b\cos\theta} = \frac{d}{\sqrt{v_b^2-v_r^2}}$$

**Important observation**: If $v_r \ge v_b$, the boat can NEVER land directly opposite, no matter the angle — a classic condition-check JEE loves to test.

**Real-life analogy**: A ferry crossing a fast river points its bow upstream to compensate for how far the current would push it downstream, exactly as this model predicts.

---

### 3.16 Rain-Man Problems

**Intuition**: The rain you experience while moving is the rain's velocity relative to you — that's why running through vertical rain makes it feel slanted, even though a stationary observer sees it fall straight down.

**Setup**: Rain velocity relative to ground $\vec{v}_r$ (vertical), man's velocity relative to ground $\vec{v}_m$ (horizontal).

**Key relation**:
$$\vec{v}_{rain,man} = \vec{v}_r - \vec{v}_m$$

**Angle at which rain appears to fall (from vertical)**:
$$\tan\phi = \frac{v_m}{v_r}$$

**Real-life analogy**: Running to catch a bus in vertical rain, you feel it hitting your face — the rain's velocity relative to you tilts forward due to your own motion.

**Important observation**: To make rain appear vertical to a moving observer, an umbrella must tilt forward at angle φ = arctan(v_m/v_r), not straight up.

---

### 3.17 Graphs in Kinematics

Covered in depth in Section 6. Core principle:
- **Slope of x-t graph = velocity.**
- **Slope of v-t graph = acceleration.**
- **Area under v-t graph = displacement.**
- **Area under a-t graph = change in velocity.**

This "slope down, area up" relationship between x → v → a is the single most exam-relevant conceptual thread of the chapter.

---

### 3.18 Motion Under Constraints (Connected Bodies / String Constraint)

**Intuition**: When bodies are connected by an inextensible string over a pulley, their velocities/accelerations are not independent — the geometry ties them together. Core tool: the component of velocity along the string must match at both ends.

**Classic method**: If $l_1 + l_2 = L$ (constant total string length), differentiate:
$$\frac{dl_1}{dt} + \frac{dl_2}{dt} = 0$$
giving the relation between the speeds of the two ends.

**Real-life analogy**: A window-cleaning platform on a pulley system — pulling rope on one side at 1 m/s moves the platform at a speed set purely by pulley geometry.

**Important observation**: For bodies not moving along the string's direction, always resolve velocity along the string at the point of contact — the step most students skip.

---

## 4. Concept Visualization

**Uniform Motion (constant velocity)**
```
Position (x)
20m |                              ●
15m |                        ●
10m |                  ●
 5m |            ●
 0m |______●_____________________________
     0s    1s    2s    3s    4s    5s   Time
Straight line → constant slope → constant velocity (5 m/s here)
```

**Uniformly Accelerated Motion**
```
Velocity (m/s)
20 |                              ●
15 |                        ●
10 |                  ●
 5 |            ●
 0 |______●_____________________________
     0s    1s    2s    3s    4s    5s   Time
Straight line (not flat) → constant slope → constant acceleration (5 m/s² here)
Area under this line (triangle + rectangle) = displacement
```

**Ball Thrown Upward — Velocity Timeline**
```
t = 0s ---- t = 1s ---- t = 2s (top) ---- t = 3s ---- t = 4s
u = 20 m/s   v = 10      v = 0             v = -10     v = -20
(taking g = 10 m/s², upward positive)
Notice: velocity decreases steadily, crosses zero at the top,
then becomes equally negative on the way down — perfect symmetry.
```

**Projectile Motion — Two Independent Motions Overlaid**
```
Horizontal (constant velocity):     ●----●----●----●----●
                                     equal spacing every equal time

Vertical (accelerated, then decelerated by symmetry):
   ●
        ●
              ●        ●
                    ●        ●
                                   ●
Combine both simultaneously → the classic parabolic path:

      *
   *     *
 *          *
*             *
ground -----------●----------- ground
        (range R)
```

**River-Boat: Shortest Time vs Shortest Path**
```
Bank A                                    Bank B
  |------------------ d (width) --------------|
  |                                            |
  |  Straight-across heading:                  |
  |  boat -----------------------------→  lands downstream (drift)
  |                                            |
  |  Upstream-angled heading:                  |
  |  boat ↗ ----------------------------→  lands directly opposite
  |                                            |
  →→→→→→→→ current direction →→→→→→→→→→→→
```

**Rain-Man: Apparent Rain Direction**
```
Stationary observer sees:      Walking observer sees:
        |                              \
        |  (straight down)              \  (slanted forward)
        |                                \
       (o) man standing                  (o) man walking →
The faster you walk, the more the rain "leans" toward you.
```

**Relative Velocity Vector Subtraction**
```
v_A  →→→→→→ (6 m/s east)
v_B  →→→ (3 m/s east)

v_AB = v_A - v_B = →→→ (3 m/s east)
"A appears to move east at 3 m/s, as seen by B"
```

---

## 5. Formula Sheet

### 5.1 First Equation of Motion
- **Formula**: $v = u + at$
- **Variables**: v = final velocity, u = initial velocity, a = acceleration, t = time
- **Units (SI)**: v, u in m/s; a in m/s²; t in s
- **Conditions**: acceleration must be constant throughout the interval
- **Derivation**: integrate $a = dv/dt$ with constant a from 0 to t
- **Shortcut**: for quick mental math, memorize a as "velocity gained per second"
- **Memory Trick**: "Very Useful At Time" (V = U + AT)
- **Common Mistakes**: using this when acceleration varies with time; forgetting sign of a when decelerating
- **Example**: u = 10 m/s, a = 2 m/s², t = 5 s → v = 10 + 2(5) = 20 m/s

### 5.2 Second Equation of Motion
- **Formula**: $s = ut + \frac12 at^2$
- **Variables**: s = displacement, u = initial velocity, a = acceleration, t = time
- **Units**: s in m; rest as above
- **Conditions**: constant acceleration only
- **Derivation**: integrate v = u + at with respect to t from 0 to t
- **Shortcut**: if u = 0 (starts from rest), s ∝ t² — doubling time quadruples distance
- **Memory Trick**: "You Two Half A Tea-Square" (s = ut + ½at²)
- **Common Mistakes**: forgetting the ½; sign error on a for deceleration problems
- **Example**: u = 0, a = 4 m/s², t = 3 s → s = 0 + ½(4)(9) = 18 m

### 5.3 Third Equation of Motion
- **Formula**: $v^2 = u^2 + 2as$
- **Variables**: same as above
- **Units**: consistent SI throughout
- **Conditions**: constant acceleration; does NOT involve time explicitly — use this when time is not given/needed
- **Derivation**: eliminate t between the first two equations of motion
- **Shortcut**: fastest formula when a problem gives u, v, and s or a, and asks for the fourth, without mentioning time at all
- **Memory Trick**: "V-Square, U-Square, 2AS" — note there's no "t" in this one, unlike the other two
- **Common Mistakes**: sign errors when the body decelerates (a negative) and s should also be checked for sign
- **Example**: u = 20 m/s, a = −4 m/s² (braking), v = 0 → 0 = 400 − 8s → s = 50 m

### 5.4 Distance in nth Second
- **Formula**: $s_n = u + \frac{a}{2}(2n-1)$
- **Variables**: $s_n$ = distance covered in the nth second (not total distance up to n seconds)
- **Units**: m
- **Conditions**: constant acceleration; n must be a positive integer (this is inherently a discrete, per-second quantity)
- **Derivation**: $s_n = s(n) - s(n-1)$ using the second equation of motion
- **Shortcut**: for u = 0, $s_n \propto (2n-1)$, giving ratio 1:3:5:7… for consecutive seconds — a famous JEE/NEET pattern-recognition shortcut
- **Memory Trick**: "u plus half a, times (two-n-minus-one)"
- **Common Mistakes**: confusing $s_n$ (distance IN the nth second) with $s$ up to time n (total distance)
- **Example**: u = 5, a = 2, n = 3 → $s_3 = 5 + 1(5) = 10$ m

### 5.5 Average Speed (Equal Distances)
- **Formula**: $v_{avg} = \dfrac{2v_1v_2}{v_1+v_2}$
- **Variables**: $v_1, v_2$ = speeds over two equal-distance legs
- **Units**: m/s or km/h (consistent)
- **Conditions**: the two legs must cover EQUAL distance, not equal time
- **Derivation**: total distance / total time, with $t_1 = d/v_1$, $t_2 = d/v_2$
- **Shortcut**: this is the harmonic mean — always less than the arithmetic mean of $v_1,v_2$
- **Memory Trick**: "Equal distance → Harmonic; product-over-sum, doubled"
- **Common Mistakes**: using $(v_1+v_2)/2$ here by default — only valid for equal TIME legs
- **Example**: 40 km/h then 60 km/h over equal distances → $v_{avg} = \frac{2(40)(60)}{100} = 48$ km/h (not 50)

### 5.6 Maximum Height (Projectile / Vertical Throw)
- **Formula**: $H = \dfrac{u^2\sin^2\theta}{2g}$ (angular); $H=\dfrac{u^2}{2g}$ (vertical, θ=90°)
- **Variables**: u = launch speed, θ = launch angle from horizontal, g = gravitational acceleration
- **Units**: H in m
- **Conditions**: no air resistance; g constant
- **Derivation**: apply $v^2=u^2-2gh$ to the vertical component only, with v=0 at max height
- **Shortcut**: H depends only on the vertical component $u\sin\theta$ — horizontal speed is irrelevant to height
- **Memory Trick**: "u-sine-squared over two-g"
- **Common Mistakes**: using full u instead of $u\sin\theta$
- **Example**: u = 20 m/s, θ = 30°, g = 10 → $H = \frac{400 \times 0.25}{20} = 5$ m

### 5.7 Time of Flight
- **Formula**: $T = \dfrac{2u\sin\theta}{g}$
- **Variables**: as above
- **Units**: T in s
- **Conditions**: ground-to-ground projectile (launch and landing at same height)
- **Derivation**: total time = 2 × (time to reach max height), by symmetry
- **Shortcut**: T depends only on vertical component; doubling launch height (from same level) is irrelevant unless it changes θ or u
- **Memory Trick**: "Two-u-sine over g"
- **Common Mistakes**: applying this formula when launch and landing heights differ (must re-derive with y=0 boundary condition instead)
- **Example**: u=20, θ=30°, g=10 → T = 2(20)(0.5)/10 = 2s

### 5.8 Range of Projectile
- **Formula**: $R = \dfrac{u^2\sin2\theta}{g}$
- **Variables**: as above
- **Units**: R in m
- **Conditions**: ground-to-ground; flat horizontal terrain
- **Derivation**: R = (horizontal velocity) × (time of flight)
- **Shortcut**: maximum R occurs at θ=45°; complementary angles (θ, 90°−θ) give equal R
- **Memory Trick**: "u-squared sine-two-theta over g"
- **Common Mistakes**: assuming maximum range angle is always 45° even on inclined or elevated launches (it is NOT, in those cases)
- **Example**: u=20, θ=45°, g=10 → R = 400(1)/10 = 40 m

### 5.9 Relative Velocity
- **Formula**: $\vec{v}_{AB} = \vec{v}_A - \vec{v}_B$
- **Variables**: velocities of A and B relative to a common (usually ground) frame
- **Units**: m/s, vector
- **Conditions**: both velocities measured in the same reference frame before subtracting
- **Derivation**: differentiate $\vec{r}_{AB} = \vec{r}_A - \vec{r}_B$
- **Shortcut**: draw a vector triangle; never subtract magnitudes directly unless collinear
- **Memory Trick**: "Mine minus Yours" (relative to B = A's velocity minus B's velocity)
- **Common Mistakes**: adding instead of subtracting; ignoring direction in 2D cases
- **Example**: Car A at 20 m/s east, Car B at 15 m/s east → $v_{AB}$ = 5 m/s east

### 5.10 River-Boat Drift
- **Formula**: Drift $= \dfrac{v_r d}{v_b}$ (straight-across heading)
- **Variables**: $v_r$ = river current speed, d = river width, $v_b$ = boat speed relative to water
- **Units**: m
- **Conditions**: boat heading kept perpendicular to bank
- **Derivation**: drift = (current speed) × (time to cross) = $v_r \times (d/v_b)$
- **Shortcut**: drift is directly proportional to current speed and river width, inversely to boat speed
- **Memory Trick**: "current times width, over boat speed"
- **Common Mistakes**: using resultant speed instead of $v_b$ in the time calculation
- **Example**: d=100m, $v_b$=5 m/s, $v_r$=2 m/s → drift = 2(100)/5 = 40 m

---

## 6. Important Graphs

### 6.1 Displacement-Time (x-t) Graphs

```
Case 1: At rest              Case 2: Uniform velocity        Case 3: Accelerating
x                             x                                x
|________                    |        ●                       |            ●
|                             |     ●                          |        ●
|                             |  ●                              |    ●
|___________t                |___________t                    |●__________t
Flat line, slope=0            Straight line, slope=v            Curving upward,
No motion                     Constant velocity                 increasing slope
                                                                 = increasing velocity
```

- **Slope of x-t graph = instantaneous velocity.** Steeper slope = higher speed. Negative slope = moving in negative direction.
- A x-t graph can NEVER be vertical (would imply infinite velocity) and typically should not fold back on itself for a single particle's motion along one axis at one time — a single x-t curve gives one x-value per t.

### 6.2 Velocity-Time (v-t) Graphs

```
Case 1: Constant velocity      Case 2: Uniform acceleration   Case 3: Uniform deceleration
v                               v                                v
|________                      |            ●                   |●
|                               |        ●                       |    ●
|                               |    ●                            |        ●
|___________t                  |●__________t                    |____________●___t
Area = displacement             Slope = acceleration              Line hits v=0 then
(rectangle)                     Area (triangle+rect) = displacement  may go negative (reversal)
```

- **Slope of v-t graph = acceleration.**
- **Area under v-t graph (with sign) = displacement.** Area above the time-axis is positive displacement; area below is negative displacement — these must be added algebraically, not just summed as magnitudes, when finding NET displacement (though summed as magnitudes when finding total DISTANCE).

### 6.3 Acceleration-Time (a-t) Graphs

```
Case 1: Constant acceleration     Case 2: Increasing acceleration (jerk)
a                                  a
|________                         |            ●
|                                  |        ●
|                                  |    ●
|___________t                     |●__________t
Area = change in velocity          Area (under curve) = change in velocity
(rectangle)                        Non-linear v-t results
```

- **Area under a-t graph = change in velocity (Δv), not velocity itself** — you must add the initial velocity to get final velocity.

### 6.4 Area and Slope Interpretation — Master Table

| Graph | Slope gives | Area under curve gives |
|---|---|---|
| x–t | velocity | (not meaningful) |
| v–t | acceleration | displacement |
| a–t | rate of change of acceleration (jerk) | change in velocity |

### 6.5 Graph Transformations

- If a v-t graph is a straight line through the origin with positive slope → uniformly accelerated motion starting from rest.
- If a v-t graph is a straight line NOT through the origin → non-zero initial velocity with constant acceleration; y-intercept = u.
- A parabola on an x-t graph → uniformly accelerated motion (since x ∝ t² relationship, when u=0).
- A straight line on a v-t graph crossing the time axis → the body decelerates, momentarily stops, then reverses direction; area before and after the crossing represent displacement in opposite directions.

### 6.6 Typical Graph-Based Question Patterns

1. "Given an x-t graph, find velocity at time t" → read the slope (tangent) at that point.
2. "Given a v-t graph, find distance traveled in interval [t1,t2]" → sum the magnitudes of all areas (positive and negative treated as positive for distance).
3. "Given a v-t graph, find displacement in interval [t1,t2]" → sum areas algebraically (respecting sign).
4. "Two graphs are given, which one is physically impossible?" → check for verticals in x-t/v-t (infinite velocity/acceleration) or discontinuous jumps in x-t (teleportation).
5. "Convert this a-t graph into a v-t graph" → integrate step by step, area segment by area segment, carrying over the running total of v.

---

## 7. Solved Examples

### Example 1 (Easy — Foundation)
**Problem**: A car starts from rest and accelerates uniformly at 2 m/s² for 10 s. Find the distance covered.

**Solution**: u = 0, a = 2 m/s², t = 10 s. Using $s = ut + \frac12 at^2$: $s = 0 + \frac12(2)(100) = 100$ m.

**WHY this approach**: Time is given directly and displacement is asked with no mention of final velocity being needed independently — the second equation of motion is the direct, single-step route. Reaching for v = u+at first, then a separate distance formula, is unnecessary extra work.

---

### Example 2 (Easy — Foundation)
**Problem**: A stone is dropped from a height of 45 m. Find the time taken to reach the ground (g = 10 m/s²).

**Solution**: $h = \frac12 g t^2 \Rightarrow 45 = \frac12(10)t^2 \Rightarrow t^2 = 9 \Rightarrow t = 3$ s.

**WHY this approach**: "Dropped" means u = 0 — this single word is the entire setup of the problem. Missing this keyword is the most common reason students unnecessarily complicate free-fall problems.

---

### Example 3 (Medium — JEE Main Level)
**Problem**: A ball is thrown upward with speed 30 m/s from the ground. Find its velocity and height at t = 4 s (g = 10 m/s²).

**Solution**: Taking upward positive, u = 30, a = −10.
$v = u + at = 30 - 10(4) = -10$ m/s (negative → moving downward already)
$h = ut + \frac12 at^2 = 30(4) - \frac12(10)(16) = 120 - 80 = 40$ m

**WHY this approach**: Time to reach max height is $u/g = 3$s, so at t=4s the ball has already crossed the peak and is descending — the negative velocity is not an error, it's physically expected and confirms the ball is on its way down, 40 m above ground (not at its peak of 45 m, since t=4 is past the peak).

---

### Example 4 (Medium — NEET Level)
**Problem**: Two trains, each 100 m long, moving in opposite directions, cross each other in 8 seconds. If their speeds are in the ratio 2:3, find their individual speeds.

**Solution**: Combined length to cross = 100+100 = 200 m. Relative velocity (opposite directions → speeds ADD) = 200/8 = 25 m/s.
Let speeds be 2x and 3x: $2x+3x = 25 \Rightarrow x=5$. Speeds = 10 m/s and 15 m/s.

**WHY this approach**: "Crossing each other" always means covering the sum of both lengths, and opposite-direction relative velocity is the sum of individual speeds (not the difference) — this is the standard relative-velocity trap that separates a 10-second solve from a wrong answer.

---

### Example 5 (Medium — JEE Main Level)
**Problem**: A particle moves such that its position is $x(t) = 3t^2 - 2t + 1$ (SI units). Find velocity and acceleration at t = 2 s.

**Solution**: $v(t) = dx/dt = 6t - 2 \Rightarrow v(2) = 10$ m/s.
$a(t) = dv/dt = 6$ m/s² (constant, independent of t).

**WHY this approach**: The position function is a polynomial in t, signaling immediately that calculus (differentiation), not the standard equations of motion, is the intended tool — recognizing "x as an explicit function of t" as the trigger for differentiation is the key exam skill here.

---

### Example 6 (Hard — JEE Advanced Level)
**Problem**: A particle moves in a straight line with acceleration $a = -kv$ (k constant), starting with velocity $u$ at t=0. Find v as a function of t, and find the total distance traveled before the particle stops.

**Solution**: $\dfrac{dv}{dt} = -kv \Rightarrow \int_u^v \dfrac{dv}{v} = -k\int_0^t dt \Rightarrow \ln(v/u) = -kt \Rightarrow v = u\,e^{-kt}$

For distance: $v = dx/dt \Rightarrow dx = u e^{-kt}dt$. Integrate from 0 to ∞ (since v→0 only as t→∞ for this exponential decay):
$$s = \int_0^\infty u e^{-kt}dt = \frac{u}{k}\left[-e^{-kt}\right]_0^\infty = \frac{u}{k}$$

**WHY this approach**: Acceleration is given as a function of velocity (not time), which is the signal to separate variables (v and t) rather than integrate directly — a common JEE Advanced technique. The particle mathematically never fully "stops" in finite time (velocity decays exponentially but never hits exactly zero), yet the total distance converges to a finite value $u/k$ — this apparent paradox (infinite time, finite distance) is exactly the kind of subtlety JEE Advanced tests to separate top scorers.

---

### Example 7 (Hard — JEE Advanced Level)
**Problem**: A projectile is launched from the ground with speed u at angle θ. Find the angle θ for which the range equals the maximum height.

**Solution**: $R = H \Rightarrow \dfrac{u^2\sin2\theta}{g} = \dfrac{u^2\sin^2\theta}{2g}$
$$2\sin\theta\cos\theta = \frac{\sin^2\theta}{2} \implies 4\cos\theta = \sin\theta \implies \tan\theta = 4 \implies \theta = \tan^{-1}(4)$$

**WHY this approach**: Setting two known formulas equal to each other and simplifying trigonometrically is the standard technique whenever a question links two projectile quantities — always express both sides in terms of the same trig functions of θ before cross-multiplying, rather than trying to reason about angles intuitively.

---

### Example 8 (Hard — River-Boat, JEE Main/Advanced boundary)
**Problem**: A river 400 m wide flows at 4 km/h. A boat, whose speed in still water is 8 km/h, is to cross the river in the shortest possible time. Find the time taken and the drift.

**Solution**: Shortest time is achieved by heading straight across (perpendicular to bank), regardless of current — current only causes drift, doesn't affect crossing time.
$t = d/v_b = 0.4\text{ km} / 8\text{ km/h} = 0.05$ h = 3 minutes.
Drift $= v_r \times t = 4 \times 0.05 = 0.2$ km = 200 m.

**WHY this approach**: The phrase "shortest possible time" is the exact trigger for the straight-across heading — many students incorrectly try to angle the boat upstream (which is the strategy for "shortest path," a DIFFERENT question), increasing the crossing time by wasting some of the boat's speed fighting the current instead of contributing to the crossing. Recognizing which of the two river-boat objectives is being asked is the entire difficulty of this problem.

---

### Example 9 (Medium — NEET Graph-Based)
**Problem**: The v-t graph of a particle is a straight line from (0, 20 m/s) to (10s, 0). Find total distance and displacement in this interval, and the acceleration.

**Solution**: This is a straight line — uniform deceleration. Acceleration = slope = (0−20)/10 = −2 m/s².
Since velocity never goes negative (touches zero exactly at t=10s and the graph ends there), area = distance = displacement (no sign reversal within the interval):
$$s = \frac12 \times 10 \times 20 = 100 \text{ m (both distance and displacement)}$$

**WHY this approach**: Whenever a v-t graph doesn't cross the time-axis within the interval of interest, distance and displacement are numerically identical — checking for a zero-crossing BEFORE calculating is the step that prevents unnecessary extra work (and prevents wrongly assuming they'd differ).

---