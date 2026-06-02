import { useState, useCallback } from 'react';
import { Subchapter } from '@/data/subchapters';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface StructuredNotes {
  chapter: string;
  formulaCards: { name: string; formula: string; variables: string; usage: string }[];
  concepts: { title: string; description: string }[];
  graphs: { title: string; description: string }[];
  mistakes: { wrong: string; right: string; why: string }[];
  pyqTriggers: { pattern: string; action: string }[];
  quickRevision: string[];
}

interface UseSubchapterNotesResult {
  notes: StructuredNotes | null;
  isLoading: boolean;
  error: string | null;
  generateNotes: (subchapter: Subchapter, chapterName: string, subject: string, examMode?: string) => Promise<void>;
}

const getMockNotes = (subchapterName: string, chapterName: string, subject: string, examMode: string): StructuredNotes => {
  const normSubject = subject.toLowerCase();
  
  if (normSubject === 'chemistry') {
    return {
      chapter: chapterName,
      formulaCards: [
        {
          name: "Ideal Gas Equation",
          formula: "PV = nRT",
          variables: "P = Pressure, V = Volume, n = Moles, R = Gas constant (0.0821 L atm/mol K), T = Temp (Kelvin)",
          usage: "Apply for ideal gases under moderate temperature and low pressure conditions."
        },
        {
          name: "Molarity & Molality",
          formula: "M = \\frac{n_{solute}}{V_{solution}(L)} \\\\ m = \\frac{n_{solute}}{W_{solvent}(kg)}",
          variables: "M = Molarity, m = Molality, n = moles, V = volume in Liters, W = mass of solvent in kg",
          usage: "Molarity is temperature-dependent (volume changes); Molality is temperature-independent."
        }
      ],
      concepts: [
        {
          title: "Periodic Trends & Shielding Effect",
          description: "Effective Nuclear Charge (Z_eff) increases across a period, pulling outer shell electrons closer. Shielding (screening) by inner shell electrons offsets the nuclear pull down a group."
        },
        {
          title: "Chemical Bonding & VSEPR Theory",
          description: "Valence Shell Electron Pair Repulsion theory predicts molecular geometry by minimizing repulsion between bonding and lone electron pairs around the central atom."
        }
      ],
      graphs: [
        {
          title: "Maxwell-Boltzmann Speed Distribution",
          description: "Shows distribution of molecular speeds in a gas. As temperature increases, the peak shifts to higher speeds and flattens out, indicating a higher fraction of active molecules."
        }
      ],
      mistakes: [
        {
          wrong: "Using Celsius instead of Kelvin in thermodynamic calculations.",
          right: "Always add 273.15 to Celsius: T(K) = T(°C) + 273.15.",
          why: "Thermodynamic laws and ratios require absolute zero as their baseline reference."
        }
      ],
      pyqTriggers: [
        {
          pattern: "Question asks for bond order of diatomic species (like O2, N2, CO).",
          action: "Use Molecular Orbital (MO) electronic configuration. Fast shortcut: 14 electrons = Bond Order 3. Subtract/add 0.5 for each electron removed/added."
        }
      ],
      quickRevision: [
        "In redox reactions, oxidation is loss of electrons (increase in oxidation state) and reduction is gain.",
        "Equilibrium constant (K) only changes with temperature; catalysts speed up reaching equilibrium but do not shift the position.",
        "Strong electrolytes dissociate completely in water, while weak electrolytes exhibit partial dissociation."
      ]
    };
  } else if (normSubject === 'maths' || normSubject === 'mathematics') {
    return {
      chapter: chapterName,
      formulaCards: [
        {
          name: "Quadratic Formula & Discriminant",
          formula: "x = \\frac{-b \\pm \\sqrt{D}}{2a} \\\\ D = b^2 - 4ac",
          variables: "a, b, c = coefficients of ax^2 + bx + c = 0, D = discriminant",
          usage: "D > 0 gives real distinct roots; D = 0 gives equal real roots; D < 0 gives complex conjugate roots."
        },
        {
          name: "Derivative of Product & Quotient",
          formula: "\\frac{d}{dx}(uv) = u'v + uv' \\\\ \\frac{d}{dx}(\\frac{u}{v}) = \\frac{u'v - uv'}{v^2}",
          variables: "u, v = functions of x, u', v' = respective derivatives",
          usage: "Apply when calculating the rate of change of composite function products or fractions."
        }
      ],
      concepts: [
        {
          title: "Limits & L'Hôpital's Rule",
          description: "If a limit evaluates to an indeterminate form (0/0 or ∞/∞), differentiate the numerator and denominator separately before evaluating the limit again."
        },
        {
          title: "Definite Integration & Areas",
          description: "The definite integral ∫_a^b f(x) dx represents the net signed area bounded between the function f(x), x-axis, and vertical lines x = a and x = b."
        }
      ],
      graphs: [
        {
          title: "Parabolic Graph of ax^2 + bx + c",
          description: "Vertex at (-b/2a, -D/4a). Opens upwards if a > 0; opens downwards if a < 0. Intersects x-axis at real root locations."
        }
      ],
      mistakes: [
        {
          wrong: "Dividing by a variable in an equation without checking if it can be zero (e.g. x^2 = x -> x = 1).",
          right: "Factorize instead: x(x - 1) = 0, which yields both x = 0 and x = 1.",
          why: "Division by zero is undefined, and dividing by variable terms without care discards valid solution roots."
        }
      ],
      pyqTriggers: [
        {
          pattern: "Problem asks for maximum or minimum values of positive terms.",
          action: "Immediately think of the AM-GM Inequality: (a + b)/2 ≥ √(ab). Equality holds when a = b."
        }
      ],
      quickRevision: [
        "A function is continuous at x = a if left-hand limit equals right-hand limit, which equals the function value f(a).",
        "The dot product of two perpendicular vectors is zero, while the cross product of two parallel vectors is the zero vector.",
        "Always add the constant of integration 'C' in indefinite integral answers."
      ]
    };
  } else {
    // Default/Physics (like Kinematics, Motion in 1D)
    return {
      chapter: chapterName,
      formulaCards: [
        {
          name: "Equations of Motion (Constant Acceleration)",
          formula: "v = u + at \\\\ s = ut + \\frac{1}{2}at^2 \\\\ v^2 = u^2 + 2as",
          variables: "u = initial velocity, v = final velocity, a = constant acceleration, t = time, s = displacement",
          usage: "Only applicable when acceleration 'a' is uniform and constant."
        },
        {
          name: "Instantaneous Velocity & Acceleration",
          formula: "v = \\frac{dx}{dt} \\\\ a = \\frac{dv}{dt} = v\\frac{dv}{dx}",
          variables: "x = position, v = velocity, a = acceleration, t = time",
          usage: "Use differentiation when position or velocity is expressed as a function of time or displacement."
        }
      ],
      concepts: [
        {
          title: "Displacement vs Distance",
          description: "Distance is the actual path length traveled (scalar, always positive). Displacement is the shortest straight-line distance between initial and final points (vector, can be positive, negative, or zero)."
        },
        {
          title: "Relative Motion in 1D",
          description: "Velocity of object A relative to B is given by V_AB = V_A - V_B. Choose a consistent direction sign convention for all vectors."
        }
      ],
      graphs: [
        {
          title: "Velocity-Time (v-t) Graph",
          description: "The slope gives instantaneous acceleration. The area under the curve (with sign) gives displacement; the absolute area gives total distance."
        }
      ],
      mistakes: [
        {
          wrong: "Using standard equations of motion when acceleration is not constant (e.g. a = 3t).",
          right: "Use calculus: v = ∫a dt and s = ∫v dt.",
          why: "Derivation of constant acceleration equations assumes acceleration is constant over the time interval."
        },
        {
          wrong: "Confusing negative acceleration with deceleration.",
          right: "Deceleration means speed is decreasing. If velocity is negative and acceleration is negative, the object is speeding up in the negative direction.",
          why: "Speed increases when velocity and acceleration have the same sign, and decreases when they have opposite signs."
        }
      ],
      pyqTriggers: [
        {
          pattern: "A particle travels half the distance with speed v1 and the remaining half with speed v2.",
          action: "Use harmonic mean for average speed: v_avg = 2*v1*v2 / (v1 + v2)."
        }
      ],
      quickRevision: [
        "Always define a positive coordinate direction before starting any 1D motion problem.",
        "Average speed is always greater than or equal to the magnitude of average velocity.",
        "For a particle returning to its starting point, displacement is zero, but distance traveled is non-zero."
      ]
    };
  }
};

export const useSubchapterNotes = (): UseSubchapterNotesResult => {
  const [notes, setNotes] = useState<StructuredNotes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const { isNeet, jeeSubMode } = useExamMode();

  const generateNotes = useCallback(async (
    subchapter: Subchapter,
    chapterName: string,
    subject: string,
    examMode = 'JEE'
  ) => {
    setIsLoading(true);
    setError(null);
    setNotes(null);

    // Mock bypass mode / placeholder mode
    if (import.meta.env.VITE_DEV_BYPASS === 'true' || !SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1200)); // Premium micro-animation feel
        const mockData = getMockNotes(subchapter.name, chapterName, subject, examMode);
        setNotes(mockData);
      } catch (err) {
        setError('Error generating mock notes');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-subchapter-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          subchapterName: subchapter.name,
          chapterName,
          subject,
          jeeAsks: subchapter.jeeAsks,
          pyqFocus: subchapter.pyqFocus,
          commonMistakes: subchapter.commonMistakes,
          language,
          examMode,
          jeeSubMode: isNeet ? undefined : jeeSubMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate notes: ${response.status}`);
      }

      const rawJsonString = await response.text();
      try {
        // Strip out any potential markdown block backticks just in case the LLM ignored instructions
        const cleanJsonString = rawJsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const data = JSON.parse(cleanJsonString);
        setNotes(data as StructuredNotes);
      } catch (e) {
        console.error("Failed to parse JSON response:", rawJsonString);
        throw new Error("Failed to parse notes format from AI.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating notes';
      setError(errorMessage);
      console.error('Notes generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language, isNeet, jeeSubMode]);

  return { notes, isLoading, error, generateNotes };
};
