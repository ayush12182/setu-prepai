import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const rawQuestions = [
  {
    topic: "Work by Normal Force",
    difficulty: "medium",
    question: "A block of mass $m$ is placed on a smooth wedge of inclination $\\theta$. The wedge is accelerated horizontally with an acceleration $a = g \\tan\\theta$ so that the block remains stationary relative to the wedge. During a displacement $d$ of the wedge along the horizontal direction, the work done by the normal force on the block is:",
    options: { A: "$mgd \\sin^2\\theta$", B: "$mgd \\cos^2\\theta$", C: "$mgd \\tan\\theta$", D: "Zero" },
    answer: "C",
    explanation: "Since the block is stationary relative to the wedge, vertical force balance gives $N \\cos\\theta = mg \\implies N = \\frac{mg}{\\cos\\theta}$. The angle between the normal force vector $\\vec{N}$ (perpendicular to incline) and the horizontal displacement vector $\\vec{d}$ is $90^\\circ - \\theta$. Thus, work done is $W_N = N d \\cos(90^\\circ - \\theta) = N d \\sin\\theta = \\left(\\frac{mg}{\\cos\\theta}\\right) d \\sin\\theta = mgd \\tan\\theta$.",
    concept: "Work done by normal force in accelerated frames"
  },
  {
    topic: "Spring-Block Motion",
    difficulty: "hard",
    question: "A block of mass $m$ is attached to a horizontal spring of spring constant $k$. Initially, the spring is at its natural length. A constant horizontal force $F$ starts acting on the block. The maximum speed of the block during its subsequent motion is:",
    options: { A: "$\\frac{F}{\\sqrt{mk}}$", B: "$\\frac{F}{2\\sqrt{mk}}$", C: "$\\frac{2F}{\\sqrt{mk}}$", D: "$\\frac{F^2}{k\\sqrt{m}}$" },
    answer: "A",
    explanation: "Maximum speed occurs at the equilibrium position where net force is zero: $F - kx_0 = 0 \\implies x_0 = \\frac{F}{k}$. Applying the Work-Energy Theorem between the initial position and the equilibrium position: $W_{net} = \\Delta KE \\implies F x_0 - \\frac{1}{2} k x_0^2 = \\frac{1}{2} m v_{max}^2 \\implies F \\left(\\frac{F}{k}\\right) - \\frac{1}{2} k \\left(\\frac{F}{k}\\right)^2 = \\frac{1}{2} m v_{max}^2 \\implies \\frac{F^2}{2k} = \\frac{1}{2} m v_{max}^2 \\implies v_{max} = \\frac{F}{\\sqrt{mk}}$.",
    concept: "Work-Energy Theorem at equilibrium position"
  },
  {
    topic: "Collisions",
    difficulty: "medium",
    question: "A ball of mass $m$ collides head-on with an identical stationary ball of mass $m$. If the coefficient of restitution is $e$, the ratio of the total kinetic energy of the system after collision to that before collision is:",
    options: { A: "$\\frac{1+e^2}{2}$", B: "$\\frac{1-e^2}{2}$", C: "$\\frac{1+e}{2}$", D: "$\\frac{1-e}{2}$" },
    answer: "A",
    explanation: "Let initial velocity of the moving ball be $u$. Initial Kinetic Energy $KE_i = \\frac{1}{2} m u^2$. By conservation of momentum and coefficient of restitution: $v_1 = \\frac{1-e}{2}u$ and $v_2 = \\frac{1+e}{2}u$. Final Kinetic Energy $KE_f = \\frac{1}{2}m v_1^2 + \\frac{1}{2}m v_2^2 = \\frac{1}{2}m u^2 \\left( \\left(\\frac{1-e}{2}\\right)^2 + \\left(\\frac{1+e}{2}\\right)^2 \\right) = \\frac{1}{2}m u^2 \\left( \\frac{1 - 2e + e^2 + 1 + 2e + e^2}{4} \\right) = \\frac{1}{2}m u^2 \\left( \\frac{1+e^2}{2} \\right)$. Ratio $\\frac{KE_f}{KE_i} = \\frac{1+e^2}{2}$.",
    concept: "Kinetic energy loss in head-on inelastic collisions"
  },
  {
    topic: "Vertical Circle",
    difficulty: "hard",
    question: "A particle of mass $m$ moves in a vertical circle of radius $R$ under gravity. Let $T_1$ and $T_2$ be the tensions in the string when the particle is at the lowest and highest points of its trajectory respectively. The difference $T_1 - T_2$ equals:",
    options: { A: "6mg", B: "5mg", C: "4mg", D: "Depends on initial velocity" },
    answer: "A",
    explanation: "At the lowest point: $T_1 - mg = \\frac{m v_1^2}{R}$. At the highest point: $T_2 + mg = \\frac{m v_2^2}{R}$. Thus, $T_1 - T_2 = \\frac{m(v_1^2 - v_2^2)}{R} + 2mg$. By conservation of mechanical energy: $\\frac{1}{2} m v_1^2 = \\frac{1}{2} m v_2^2 + mg(2R) \\implies v_1^2 - v_2^2 = 4gR$. Substituting this: $T_1 - T_2 = \\frac{m(4gR)}{R} + 2mg = 6mg$.",
    concept: "Vertical circular motion tension difference derivation"
  },
  {
    topic: "Variable Force",
    difficulty: "medium",
    question: "A particle of mass $m$ moving horizontally with speed $v_0$ enters a resistive medium where it experiences a retarding force $F = -k v^2$, where $k$ is a constant. The distance travelled by the particle before its speed drops to $\\frac{v_0}{2}$ is:",
    options: { A: "$\\frac{m}{k} \\ln 2$", B: "$\\frac{m}{2k} \\ln 2$", C: "$\\frac{m}{k}$", D: "$\\frac{2m}{k}$" },
    answer: "A",
    explanation: "Using $F = m v \\frac{dv}{dx} = -k v^2 \\implies \\frac{dv}{v} = -\\frac{k}{m} dx$. Integrating: $\\int_{v_0}^{v_0/2} \\frac{dv}{v} = -\\frac{k}{m} \\int_0^s dx \\implies \\ln\\left(\\frac{1}{2}\\right) = -\\frac{k}{m} s \\implies s = \\frac{m}{k} \\ln 2$.",
    concept: "Variable resistance integration"
  },
  {
    topic: "Collisions",
    difficulty: "hard",
    question: "A pendulum bob of mass $m$ is suspended by a string of length $L$. It is pulled to a horizontal position and released from rest. At the lowest point, it collides head-on elastically with a block of mass $m$ resting on a frictionless table. The speed of the block immediately after collision is:",
    options: { A: "$\\sqrt{2gL}$", B: "$\\sqrt{gL}$", C: "$2\\sqrt{gL}$", D: "Zero" },
    answer: "A",
    explanation: "Bob speed before collision $u = \\sqrt{2gL}$ (using mechanical energy conservation). Since identical masses ($m$ and $m$) collide head-on elastically, their velocities swap. The bob comes to rest, and the block moves with the bob's initial speed: $v = \\sqrt{2gL}$.",
    concept: "Velocity swap in identical elastic collisions"
  },
  {
    topic: "Static Friction Work",
    difficulty: "easy",
    question: "A box of mass $m$ is placed on the flatbed of a truck accelerating horizontally at $a$. If the box does not slide relative to the truck, the work done by static friction on the box during a displacement $d$ of the truck is:",
    options: { A: "$mad$", B: "$-mad$", C: "Zero", D: "$\\mu_s mg d$" },
    answer: "A",
    explanation: "Static friction is the only horizontal force accelerating the box, so $f_s = ma$ in the direction of motion. The angle between force and displacement is $0^\\circ$, hence $W = f_s \\cdot d = mad$.",
    concept: "Static friction work done definition"
  },
  {
    topic: "Conservative Force Work",
    difficulty: "medium",
    question: "If a conservative force does 50 J of work on a particle in an isolated system, the potential energy of the particle:",
    options: { A: "Increases by 50 J", B: "Decreases by 50 J", C: "Remains constant", D: "Decreases by 25 J" },
    answer: "B",
    explanation: "By definition, the work done by a conservative force is equal to the negative change in potential energy: $W_{cons} = -\\Delta U$. Since $W_{cons} = 50\\text{ J}$, $\\Delta U = -50\\text{ J}$, meaning potential energy decreases by 50 J.",
    concept: "Conservative force and potential energy relation"
  },
  {
    topic: "Collisions",
    difficulty: "medium",
    question: "A ball of mass 0.2 kg moving at 10 m/s hits a rigid vertical wall normally and rebounds with the same speed. If the duration of contact is 0.01 s, the average force exerted by the wall on the ball is:",
    options: { A: "200 N", B: "400 N", C: "80 N", D: "100 N" },
    answer: "B",
    explanation: "Taking the incoming direction as positive: $\\Delta p = m(v_f - v_i) = 0.2(-10 - 10) = -4\\text{ kg}\\cdot\\text{m/s}$. The average force is $F_{avg} = \\frac{|\\Delta p|}{\\Delta t} = \\frac{4\\text{ N}\\cdot\\text{s}}{0.01\\text{ s}} = 400\\text{ N}$.",
    concept: "Impulse-momentum equation application"
  },
  {
    topic: "Mechanical Energy Conservation",
    difficulty: "hard",
    question: "A block of mass $m$ is suspended vertically from a light spring of force constant $k$ passing over a smooth massless pulley. The other end of the spring is fixed to the ground. If the block is released from rest when the spring is at its natural length, the maximum extension of the spring is:",
    options: { A: "$\\frac{mg}{k}$", B: "$\\frac{2mg}{k}$", C: "$\\frac{mg}{2k}$", D: "$\\frac{4mg}{k}$" },
    answer: "B",
    explanation: "Let maximum extension be $x$. Loss in gravitational potential energy of the block = $mgx$. Gain in spring potential energy = $\\frac{1}{2}kx^2$. Since the block is at rest at the maximum extension, energy conservation gives: $mgx = \\frac{1}{2}kx^2 \\implies x = \\frac{2mg}{k}$.",
    concept: "Spring-pulley energy balancing"
  },
  {
    topic: "Potential Energy Graph",
    difficulty: "medium",
    question: "The potential energy of a spring-mass system undergoing Simple Harmonic Motion is maximum when the displacement of the block from its equilibrium position is:",
    options: { A: "Equal to the amplitude", B: "Zero", C: "Half the amplitude", D: "Independent of amplitude" },
    answer: "A",
    explanation: "Spring potential energy is given by $U = \\frac{1}{2}kx^2$. This is maximum when displacement $x$ is at its maximum value, which corresponds to the amplitude of oscillation ($x = A$).",
    concept: "Oscillation extreme energy levels"
  },
  {
    topic: "Work done by Centripetal Force",
    difficulty: "easy",
    question: "A particle of mass $m$ moves in a circle of radius $R$ with a constant speed $v$. The work done by the centripetal force during one-quarter of a revolution is:",
    options: { A: "$\\frac{1}{4} m v^2$", B: "$\\frac{1}{2} \\pi m v^2$", C: "Zero", D: "$m v^2$" },
    answer: "C",
    explanation: "The centripetal force is always perpendicular to the instantaneous velocity (and displacement) vector of the particle. Hence, $\\vec{F} \\cdot d\\vec{s} = 0$ at all times, making the net work done zero.",
    concept: "Orthogonal force vector work done"
  },
  {
    topic: "Work with Friction",
    difficulty: "medium",
    question: "A block of mass 2 kg is projected up a rough inclined plane of inclination $30^\\circ$ and coefficient of friction $\\mu = 0.1$ with an initial speed of 10 m/s. The work done by friction during the upward motion until the block stops is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "-14.8 J", B: "-17.3 J", C: "-20 J", D: "-30 J" },
    answer: "A",
    explanation: "Friction force $f_k = \\mu mg \\cos 30^\\circ = 0.1(2)(10)(0.866) = 1.732\\text{ N}$. Deceleration $a = g\\sin 30^\\circ + \\mu g \\cos 30^\\circ = 5 + 0.866 = 5.866\\text{ m/s}^2$. Distance covered $s = \\frac{u^2}{2a} = \\frac{100}{2(5.866)} = 8.523\\text{ m}$. Work done by friction $W_f = -f_k s = -1.732 \\times 8.523 = -14.76\\text{ J} \\approx -14.8\\text{ J}$.",
    concept: "Energy loss on inclined planes with friction"
  },
  {
    topic: "Resistive Forces Work",
    difficulty: "hard",
    question: "A block of mass 1 kg slides down a curved track from a height of 2 m. If its speed at the bottom is 4 m/s, the work done by the resistive forces (friction and air resistance) is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "-12 J", B: "-8 J", C: "-4 J", D: "-20 J" },
    answer: "A",
    explanation: "Initial energy $E_i = mgh = 1(10)(2) = 20\\text{ J}$. Final energy $E_f = \\frac{1}{2}mv^2 = \\frac{1}{2}(1)4^2 = 8\\text{ J}$. The work done by non-conservative forces is $W_{res} = E_f - E_i = 8 - 20 = -12\\text{ J}$.",
    concept: "Non-conservative energy loss equation"
  },
  {
    topic: "Instantaneous Power",
    difficulty: "medium",
    question: "A body of mass 2 kg starts from rest and is accelerated such that its speed varies as $v = 3 t^2$, where $t$ is in seconds. The power delivered to the body at $t = 2\\text{ s}$ is:",
    options: { A: "72 W", B: "144 W", C: "288 W", D: "36 W" },
    answer: "C",
    explanation: "Acceleration $a = \\frac{dv}{dt} = 6t$. Force $F = ma = 2(6t) = 12t$. Instantaneous power $P = F v = 12t \\times 3t^2 = 36t^3$. At $t = 2\\text{ s}$: $P = 36(2)^3 = 36(8) = 288\\text{ W}$.",
    concept: "Power relation using variable speed profiles"
  },
  {
    topic: "Spring-Block Motion",
    difficulty: "hard",
    question: "A block of mass 1 kg is attached to a vertical spring of force constant 100 N/m. The spring is compressed by 20 cm and the block is released from rest. The maximum height reached by the block from the release point is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "20 cm", B: "10 cm", C: "30 cm", D: "40 cm" },
    answer: "A",
    explanation: "Let the height be $h$. Total energy at release (compression 20 cm): $E_i = \\frac{1}{2}k(0.2)^2 = 2\\text{ J}$. At maximum height, $v=0$, and the spring is extended by $(h - 0.2)$ m. Total energy $E_f = \\frac{1}{2}k(h - 0.2)^2 + mgh = 50(h - 0.2)^2 + 10h$. Equating: $50(h^2 - 0.4h + 0.04) + 10h = 2 \\implies 50h^2 - 10h = 0 \\implies h = 0.2\\text{ m} = 20\\text{ cm}$.",
    concept: "Spring elastic energy vertical conversion"
  },
  {
    topic: "Conservative Forces",
    difficulty: "medium",
    question: "Which of the following force vectors $\\vec{F}$ is conservative?",
    options: { A: "$(y\\hat{i} + x\\hat{j})$", B: "$(y\\hat{i} - x\\hat{j})$", C: "$(x^2y\\hat{i} + xy^2\\hat{j})$", D: "$(y^2\\hat{i} + x^2\\hat{j})$" },
    answer: "A",
    explanation: "Check the curl condition $\\frac{\\partial F_y}{\\partial x} = \\frac{\\partial F_x}{\\partial y}$. For option A, $\\frac{\\partial F_y}{\\partial x} = 1$ and $\\frac{\\partial F_x}{\\partial y} = 1$. Since they are equal, the force is conservative.",
    concept: "Conservative field curl criteria"
  },
  {
    topic: "Work-Energy Theorem",
    difficulty: "medium",
    question: "A body of mass 1 kg falls from rest through a height of 10 m under gravity. If it experiences a constant air resistance of 2 N during its fall, its kinetic energy just before hitting the ground is (Take $g = 10\\text{ m/s}^2$):",
    options: { A: "100 J", B: "80 J", C: "60 J", D: "120 J" },
    answer: "B",
    explanation: "Net force acting downward is $F_{net} = mg - F_{air} = 1(10) - 2 = 8\\text{ N}$. Net work done on the body is $W_{net} = F_{net} \\times h = 8 \\times 10 = 80\\text{ J}$. By the Work-Energy Theorem, $\\Delta KE = W_{net} = 80\\text{ J}$.",
    concept: "Air resistance damping work-energy equation"
  },
  {
    topic: "Collisions",
    difficulty: "hard",
    question: "A body of mass $m$ moving with speed $u$ collides elastically with a stationary body of mass $M$. The fraction of kinetic energy transferred from the moving body to the stationary body is maximum when:",
    options: { A: "$m = M$", B: "$m = 2M$", C: "$m = \\frac{M}{2}$", D: "$m \\gg M$" },
    answer: "A",
    explanation: "The fraction of kinetic energy transferred is $f = \\frac{4mM}{(m+M)^2}$. Taking derivative w.r.t $M$ (or using AM-GM), it achieves its maximum value of $1$ (100% transfer) when the masses are equal ($m = M$).",
    concept: "Kinetic energy transfer optimization constraints"
  },
  {
    topic: "Spring Compression",
    difficulty: "hard",
    question: "A block of mass 1 kg moving at 10 m/s on a frictionless horizontal surface collides with a spring of force constant $k = 400\\text{ N/m}$ attached to a wall. The duration of contact between the block and the spring is:",
    options: { A: "$\\frac{\\pi}{20}\\text{ s}$", B: "$\\frac{\\pi}{10}\\text{ s}$", C: "$\\frac{\\pi}{40}\\text{ s}$", D: "$\\frac{\\pi}{5}\\text{ s}$" },
    answer: "A",
    explanation: "The compression and recoil of the spring represents a half-cycle of Simple Harmonic Motion. The time period is $T = 2\\pi \\sqrt{\\frac{m}{k}}$. The contact time is $t = \\frac{T}{2} = \\pi \\sqrt{\\frac{m}{k}} = \\pi \\sqrt{\\frac{1}{400}} = \\frac{\\pi}{20}\\text{ s}$.",
    concept: "Half-cycle period SHM spring compression duration"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { secret } = await req.json();
    if (secret !== "SEED_WEP_FINAL_SECRET_987") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert these 20 final questions (do not delete the previous 20 to keep a total of 40 cached questions for WEP)
    const dbInserts = rawQuestions.map((q) => ({
      subchapter_id: 'phy-3',
      chapter_id: 'phy-3',
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
    }));

    const { error } = await supabase.from('questions').insert(dbInserts);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, count: dbInserts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
