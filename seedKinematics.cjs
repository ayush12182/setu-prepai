const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1];
const supabase = createClient(supabaseUrl, supabaseKey);

const kinematicsMarkdown = `
[METADATA]
chapter_slug: phy-1
chapter_name: Kinematics
subject: physics
topic_tree: Motion in 1D, Motion in 2D, Projectile Motion, Relative Motion
[/METADATA]

# Kinematics — Complete Master Notes

PrepEntrance physics | JEE | Class 11/12 • Droppers

[TEACHER_SAYS]
Students, this chapter is extremely critical for your JEE preparation. Focus on the core principles rather than just memorizing formulas.
[/TEACHER_SAYS]

## 1. Chapter Overview
Kinematics is the branch of mechanics that describes the motion of points, bodies, and systems of bodies without considering the forces that cause them to move. It is highly tested in JEE and forms the foundation for Laws of Motion, Work Energy Power, and Electromagnetism.

## 2. Learning Outcomes
- Analyze position, velocity, and acceleration vectors.
- Solve 1D and 2D kinematics equations.
- Analyze projectile motion on flat and inclined planes.
- Apply relative motion in 1D and 2D.

## 3. Complete Theory
### Motion in 1D
[CONCEPT]
Displacement is the shortest straight-line distance between initial and final positions. Distance is the actual path length traveled.
[/CONCEPT]

[NCERT_INSIGHT]
NCERT emphasizes that average speed over a time interval can be greater than the magnitude of average velocity.
[/NCERT_INSIGHT]

### Equations of Motion
[DERIVATION]
$$ v = u + at $$
$$ S = ut + \frac{1}{2}at^2 $$
$$ v^2 = u^2 + 2aS $$
[/DERIVATION]

## 4. Concept Visualization
[GRAPH]
{ "graphType": "projectile_path", "title": "Projectile Motion Path", "xAxis": "Distance (m)", "yAxis": "Height (m)", "equation": "y = x \\tan(\\theta) - \\frac{g x^2}{2 u^2 \\cos^2(\\theta)}", "sliders": { "u": { "min": 0, "max": 50, "step": 1, "default": 20, "label": "Initial Velocity", "unit": "m/s" } } }
[/GRAPH]

## 5. Formula Sheet
[FORMULA title="Time of Flight"]
$$ T = \frac{2u \sin \theta}{g} $$
**Variables:** u = initial velocity, \theta = angle of projection, g = acceleration due to gravity
**When to use:** For standard projectile motion on horizontal ground.
**Common Mistake:** Forgetting to double the time to reach maximum height.
**Memory Trick:** Two up and down.
[/FORMULA]

## 6. Important Graphs
The area under the velocity-time graph gives the displacement of the particle. The slope of the velocity-time graph gives the acceleration.

## 7. Solved Examples
[WORKED_EXAMPLE]
{
  "question": "A particle is projected at 30 degrees with 20 m/s. Find max height.",
  "hints": ["Use the vertical component of velocity."],
  "thinkTime": "What happens at the highest point?",
  "steps": ["$$H = \frac{u^2 \sin^2 \theta}{2g}$$", "$$H = \frac{20^2 \times (1/2)^2}{20} = 5m$$"],
  "finalAnswer": "$5\\text{ m}$",
  "alternativeMethod": "None",
  "commonMistakes": ["Using total velocity instead of vertical component."]
}
[/WORKED_EXAMPLE]

## 8. PYQ Analysis
Projectile on an inclined plane and relative velocity in 2D (Rain-Man, River-Boat) are the most heavily tested subtopics.

## 9. Common Mistakes
[COMMON_MISTAKE]
Conceptual Trap: Applying $v=u+at$ when acceleration is NOT constant.
[/COMMON_MISTAKE]

## 10. Shortcuts
[JEE_TRICK]
Shortcut Trick: If two projectiles have the same initial speed and ranges are equal, their angles are $\theta$ and $90-\theta$.
[/JEE_TRICK]

## 11. Revision Sheet
- Remember vector signs.
- Area of v-t is displacement.
- Slope of x-t is velocity.

## 12. Chapter Summary
Kinematics deals with the mathematical description of motion. The core ideas revolve around displacement, velocity, and acceleration, scaling from 1D to 2D.

## 13. Mind Map
Motion -> 1D (Constant a, Variable a) -> 2D (Projectile, Relative).

## 14. Exam Tips
Always draw a quick free-hand sketch of the trajectory before writing equations.

## 15. AI Insights
Students typically score well on basic 1D motion but lose accuracy on Relative Motion vectors. Pay special attention to sign conventions in 2D.
`;

async function seed() {
  const { error } = await supabase.from('chapter_content').insert({
    chapter_id: 'phy-1',
    chapter_slug: 'phy-1',
    chapter_name: 'Kinematics',
    subject: 'physics',
    exam_type: 'JEE',
    language: 'english',
    version: 1,
    version_label: '1.0',
    status: 'published',
    raw_content: kinematicsMarkdown,
    source: 'migration',
    generation_model: 'manual'
  });
  if (error) {
    console.error('Failed to insert phy-1:', error);
  } else {
    console.log('Inserted phy-1 successfully!');
  }
}
seed();
