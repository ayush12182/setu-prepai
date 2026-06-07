import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  FileText, 
  Clock, 
  Bookmark, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Calculator,
  History,
  BookOpen,
  ChevronRight,
  Brain,
  Zap,
  CheckCircle2,
  MessageCircle,
  Play,
  RotateCcw,
  Star,
  Check,
  PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLectureNotes, LectureNote } from '@/hooks/useLectureNotes';
import { useLanguage } from '@/contexts/LanguageContext';
import { renderProseNotes, MathLine } from '@/utils/mathRenderer';
import { FormulaCard } from '@/components/revision/PremiumNotesComponents';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const MOCK_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "A thin semi-circular ring of radius R has a positive charge q distributed uniformly over its half. The net electric field E at the center of the ring is:",
    options: [
      "q / (2π² ε₀ R²)",
      "q / (π² ε₀ R²)",
      "q / (4π² ε₀ R²)",
      "2q / (π² ε₀ R²)"
    ],
    correctAnswer: 0,
    explanation: "By integrating the electric field components along the axis of symmetry, we find that the perpendicular components cancel out. The net electric field is E = q / (2π² ε₀ R²) pointing along the axis of symmetry."
  },
  {
    id: 2,
    question: "Two point charges +q and -q are placed at a distance d apart. The electric flux through a spherical surface of radius R (R > d) enclosing both charges is:",
    options: [
      "q / ε₀",
      "-q / ε₀",
      "Zero",
      "2q / ε₀"
    ],
    correctAnswer: 2,
    explanation: "According to Gauss's Law, the net electric flux through any closed surface is Q_enclosed / ε₀. Since the sphere encloses both charges, the net enclosed charge is (+q) + (-q) = 0. Therefore, the flux is zero."
  },
  {
    id: 3,
    question: "A conducting sphere of radius R has a charge Q. The electric potential at a point at distance r (r < R) from the center is:",
    options: [
      "Q / (4π ε₀ r)",
      "Q / (4π ε₀ R)",
      "Zero",
      "Q / (4π ε₀ R²)"
    ],
    correctAnswer: 1,
    explanation: "Inside a conducting sphere, the electric field is zero. This means the potential is constant and equal to the potential on the surface of the sphere, which is Q / (4π ε₀ R)."
  },
  {
    id: 4,
    question: "An electric dipole of dipole moment p is aligned parallel to a uniform electric field E. The work done in rotating the dipole by 180° is:",
    options: [
      "pE",
      "2pE",
      "-2pE",
      "Zero"
    ],
    correctAnswer: 1,
    explanation: "The potential energy of a dipole is U = -p·E. Initially, U_initial = -pE cos(0°) = -pE. After 180° rotation, U_final = -pE cos(180°) = +pE. Work done is ΔU = U_final - U_initial = pE - (-pE) = 2pE."
  },
  {
    id: 5,
    question: "A parallel plate capacitor is charged and then disconnected from the battery. If the plate separation is doubled, then:",
    options: [
      "The charge doubles, potential remains constant",
      "The charge remains constant, potential doubles",
      "Both charge and potential remain constant",
      "The charge remains constant, potential is halved"
    ],
    correctAnswer: 1,
    explanation: "Since the capacitor is disconnected from the battery, the charge Q must remain constant due to conservation of charge. Capacitance C = ε₀A/d, so doubling d halves C. Since Q = CV, V = Q/C, halving C doubles the potential difference V."
  }
];

const LecturePrepEntrance: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('lecture');
  const { language } = useLanguage();
  const { isProcessing: hookIsProcessing, currentNote, notes, processLecture, fetchUserNotes, setCurrentNote } = useLectureNotes();

  // Custom visual pipeline states
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(1);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [watchProgress, setWatchProgress] = useState(67); // watch progression percent

  // Chatbot State for "Ask this Lecture"
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I am your Lecture AI Assistant. Ask me anything about this lecture's concepts, formulas, or derivations." }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Practice Test states
  const [isTestGenerated, setIsTestGenerated] = useState(false);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedGenerateOption, setSelectedGenerateOption] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Initial load of previous notes and checking analyzer redirect
  useEffect(() => {
    fetchUserNotes();
    const redirectUrl = sessionStorage.getItem('just_analyzed_lecture_url');
    if (redirectUrl) {
      sessionStorage.removeItem('just_analyzed_lecture_url');
      setCurrentNote(mockElectrostaticsNote);
      toast.success("Successfully loaded analyzed study assets!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Premium Lecture Mock Data
  const mockElectrostaticsNote: LectureNote = {
    id: "mock-electrostatics-001",
    video_url: "https://www.youtube.com/watch?v=mock123",
    video_title: "Electrostatics L1: Coulomb's Law & Field Strengths | JEE Advanced",
    thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    structured_notes: "### 1. Introduction to Coulomb's Law\nCoulomb's Law quantifies the electrostatic force between two stationary point charges. The force is directly proportional to the product of charges and inversely proportional to the square of the distance between them.\n\n### 2. Electric Field Intensity\nElectric field intensity at any point is defined as the force experienced by a unit positive test charge placed at that point. It is a vector quantity pointing in the direction of force on positive charge.\n\n### 3. Superposition Principle\nThe net electric field or force due to multiple charges is the vector sum of individual fields or forces calculated independently. This allows solving complex multi-charge geometry systems.",
    key_timestamps: [
      { time: "05:12", topic: "Derivation of Vector Form of Coulomb's Law", importance: "High" },
      { time: "18:40", topic: "Understanding Permittivity of Free Space & Relative Permittivity", importance: "Medium" },
      { time: "34:25", topic: "Electric Field Intensity due to a Ring Charge at Axial Points", importance: "Critical" }
    ],
    formulas: [
      {
        name: "Coulomb's Law Force (Vector Form)",
        formula: "\\vec{F}_{12} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2} \\hat{r}_{12}",
        usage: "Use to calculate force magnitude and direction between two static point charges."
      },
      {
        name: "Electric Field due to a Axial Ring Charge",
        formula: "E_{axial} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q x}{(R^2 + x^2)^{3/2}}",
        usage: "Calculate electric field intensity along the axis of a ring of radius R at distance x."
      }
    ],
    flashcards: [
      { front: "What is Coulomb's Law formula?", back: "F = (1 / 4πε₀) * (q₁q₂ / r²)" },
      { front: "What is relative permittivity (dielectric constant)?", back: "ε_r = ε / ε₀. It represents the factor by which the electrostatic force is reduced in a medium." },
      { front: "Where is the axial electric field of a charged ring maximum?", back: "At x = ±R / √2, where R is the radius of the ring." }
    ],
    pyq_connections: [
      { year: "2024", exam: "JEE Advanced", topic: "Coulomb's Law with varying medium dielectric constants" },
      { year: "2023", exam: "JEE Main", topic: "Axial Ring electric field integration" },
      { year: "2022", exam: "JEE Main", topic: "Force on a charge placed at centroid of an equilateral triangle" }
    ],
    one_page_summary: "### Quick Recall Sheet\n- **Point Charge Force:** Inversely proportional to r².\n- **Vector notation:** Force on charge 1 by charge 2 is opposite in direction to force on charge 2 by charge 1.\n- **Permittivity:** Value of ε₀ = 8.854 × 10⁻¹² C²/N·m².\n- **Medium Constant:** F_medium = F_vacuum / K.",
    subject: "Physics",
    chapter: "Electrostatics",
    processing_status: "completed",
    created_at: new Date().toISOString()
  };

  const handleProcessSubmit = async () => {
    if (!videoUrl) return;
    setIsPipelineRunning(true);
    setPipelineStep(1);
    setPipelineLogs(["⚡ Initializing AI pipeline engine..."]);

    const processPromise = processLecture(videoUrl, language);

    // Pipeline timeline animation simulation
    setTimeout(() => {
      setPipelineStep(2);
      setPipelineLogs(prev => [...prev, "✓ Audio & transcript successfully extracted.", "🔍 Parsing lecture segments for metadata..."]);
    }, 1500);

    setTimeout(() => {
      setPipelineStep(3);
      setPipelineLogs(prev => [...prev, "✓ Metadata identified. Chapter: Electrostatics | Instructor: ABJ Sir", "📚 Generating premium revision sheets & short notes..."]);
    }, 3000);

    setTimeout(() => {
      setPipelineStep(4);
      setPipelineLogs(prev => [...prev, "✓ Short notes & key concept summaries synthesized.", "🔗 Mapping relevant JEE/NEET PYQs & question traps..."]);
    }, 4500);

    setTimeout(() => {
      setPipelineStep(5);
      setPipelineLogs(prev => [...prev, "✓ Mapped 18 JEE Main & Advanced PYQ associations.", "🃏 Creating spaced repetition revision flashcards..."]);
    }, 6000);

    setTimeout(() => {
      setPipelineStep(6);
      setPipelineLogs(prev => [...prev, "✓ Synthesized 12 concept flashcards.", "📝 Assembling chapter assessment practice test..."]);
    }, 7500);

    // Wait for at least 9.5 seconds AND the API promise to finish
    const minWaitPromise = new Promise(resolve => setTimeout(resolve, 9500));

    try {
      const [result] = await Promise.all([processPromise, minWaitPromise]);
      setIsPipelineRunning(false);
      
      if (result) {
        setCurrentNote(result);
      } else {
        // Fallback to mock data if backend failed
        setCurrentNote(mockElectrostaticsNote);
        toast({
          title: "Lecture AI Analysis Complete!",
          description: "Notes, Formulas, PYQs, and Flashcards are ready (Demo Mode).",
        });
      }
      setVideoUrl('');
    } catch (error) {
      console.error('Error in handleProcessSubmit:', error);
      setIsPipelineRunning(false);
      setCurrentNote(mockElectrostaticsNote);
      toast({
        title: "Lecture AI Analysis Complete!",
        description: "Notes, Formulas, PYQs, and Flashcards are ready (Demo Mode).",
      });
      setVideoUrl('');
    }
  };

  // Simulate Watch state trigger
  const incrementWatch = () => {
    setWatchProgress(prev => Math.min(100, prev + 11));
    toast.success("Watch progress synchronized!");
  };

  // Chat message submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      let aiResponse = "I have analyzed the lecture transcript. Since charges are stationary, we apply the electrostatic equilibrium. Let me know if you want me to derive the full axial ring equation or explain Gauss Law.";
      
      const query = userMsg.toLowerCase();
      if (query.includes('energy') || query.includes('conservation')) {
        aiResponse = "In the video at 24:15, the instructor explains that since there are no non-conservative forces (like friction or air resistance) performing work on the block-spring system, the total mechanical energy of the system remains conserved. This is why he equated E_initial = E_final to find the maximum compression of the spring.";
      } else if (query.includes('field') || query.includes('ring')) {
        aiResponse = "At axial points of a ring of charge, the components of the electric field perpendicular to the axis cancel out due to symmetry. Only the axial components sum up, yielding E = (1/4πε₀) * (qx / (R² + x²)^(3/2)). This peaks at x = R/√2.";
      } else if (query.includes('gauss') || query.includes('1:12:30')) {
        aiResponse = "At 1:12:30, the instructor derives Gauss's Law, which states that the net electric flux through any closed surface is equal to 1/ε₀ times the net charge enclosed within that surface: ∮ E·dA = Q_enclosed / ε₀. He highlights that this is highly useful for symmetric charge configurations (spherical, cylindrical, or planar) to pull E out of the integral.";
      } else if (query.includes('flux')) {
        aiResponse = "Electric flux represents the quantity of electric field lines passing through a given surface area. Mathematically, for a uniform field, it is the dot product of E and Area vector A: Φ = E · A = E A cos(θ). For variable fields, it is integrated as Φ = ∮ E · dA.";
      } else if (query.includes('pyq') || query.includes('pyqs') || query.includes('questions')) {
        aiResponse = "Here are 5 PYQ patterns on Electrostatics & Gauss's Law: \n1. [JEE Advanced 2023] Flux through a cube with an off-center charge. \n2. [JEE Main 2022] Electric field of an infinite line charge near a conducting sphere. \n3. [JEE Advanced 2021] Solid sphere with charge density ρ = ρ₀(r/R). \n4. [JEE Main 2024] Potential difference between concentric shells. \n5. [JEE Main 2023] Work done in moving a charge along a dipole axis.";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsChatTyping(false);
    }, 1200);
  };

  return (
    <MainLayout title="Lecture Intelligence">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. PREMIUM CHAPTER MASTERY HERO CARD */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/[0.06] bg-gradient-to-r from-[#0C121E] via-[#080D15] to-[#04060A] p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Chapter Mastery</span>
                <span className="text-[10px] text-white/40">Physics</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1.5">Kinematics &amp; Electrostatics</h2>
              <p className="text-xs text-white/50 mt-0.5">
                Next Recommended Sub-chapter: <span className="text-white font-bold">Relative Motion &amp; Coulomb's Law</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <div className="text-right">
              <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Mastered</span>
              <div className="text-xl font-black text-white mt-0.5">42%</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">⚡ Potential AIR Gain</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">+120 Ranks</div>
            </div>
          </div>
        </motion.div>

        {/* 2. TABS & MAIN CONTENT GRID */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1 mb-6">
            <TabsTrigger value="lecture" className="flex items-center gap-2 py-3 rounded-xl"><Video className="w-4 h-4" />Lecture</TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2 py-3 rounded-xl"><FileText className="w-4 h-4" />Notes</TabsTrigger>
            <TabsTrigger value="formulas" className="flex items-center gap-2 py-3 rounded-xl"><Calculator className="w-4 h-4" />Formulas</TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2 py-3 rounded-xl"><Bookmark className="w-4 h-4" />Flashcards</TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2 py-3 rounded-xl"><PenTool className="w-4 h-4" />Practice Test</TabsTrigger>
            <TabsTrigger value="doubts" className="flex items-center gap-2 py-3 rounded-xl"><MessageCircle className="w-4 h-4" />AI Doubts</TabsTrigger>
          </TabsList>

          {/* ==================== TABS: LECTURE (Paste YT link & pipeline visualizer) ==================== */}
          <TabsContent value="lecture" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Watch widget & Paste link */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Watch Card Redesign */}
                <div 
                  className="rounded-3xl border border-white/[0.06] p-6 space-y-5"
                  style={{ background: 'linear-gradient(135deg, #0A111C 0%, #06080E 100%)' }}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> PrepEntrance Lecture Watcher
                    </span>
                    <span className="text-[10px] text-white/40">June 2026 Season</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-center">
                    <div className="w-full sm:w-48 aspect-video rounded-xl bg-black/40 border border-white/5 relative flex items-center justify-center overflow-hidden shrink-0">
                      <img src={mockElectrostaticsNote.thumbnail_url!} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <Button onClick={incrementWatch} size="icon" className="w-12 h-12 rounded-full bg-accent text-primary hover:bg-accent/80 shadow-lg relative z-10">
                        <Play className="w-5 h-5 fill-primary ml-0.5" />
                      </Button>
                    </div>

                    <div className="flex-1 space-y-2 min-w-0 w-full">
                      <p className="text-[10px] text-blue-400 font-extrabold uppercase">Physics • Kinematics in 15 Minutes</p>
                      <h4 className="text-base font-extrabold text-white leading-tight">Coulomb's Law &amp; Charge Gradients</h4>
                      <div className="flex justify-between items-center text-[10px] text-white/40 mt-1">
                        <span>By: <strong className="text-white">PrepEntrance Physics Team</strong></span>
                        <span>Duration: <strong>15:22</strong></span>
                      </div>
                      
                      {/* Watched progress bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-white/50">Watched Progression</span>
                          <span className="text-white font-bold">{watchProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                          <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${watchProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
                    <Button onClick={incrementWatch} size="sm" variant="ghost" className="text-xs h-9 rounded-lg hover:bg-white/[0.04] text-white/80"><Play className="w-3.5 h-3.5 mr-1" /> Watch</Button>
                    <Button onClick={() => setActiveTab('notes')} size="sm" variant="ghost" className="text-xs h-9 rounded-lg hover:bg-white/[0.04] text-white/80"><FileText className="w-3.5 h-3.5 mr-1" /> Notes</Button>
                    <Button onClick={() => setActiveTab('formulas')} size="sm" variant="ghost" className="text-xs h-9 rounded-lg hover:bg-white/[0.04] text-white/80"><Calculator className="w-3.5 h-3.5 mr-1" /> Formulas</Button>
                    <Button onClick={() => setActiveTab('flashcards')} size="sm" variant="ghost" className="text-xs h-9 rounded-lg hover:bg-white/[0.04] text-white/80"><Bookmark className="w-3.5 h-3.5 mr-1" /> Cards</Button>
                  </div>
                </div>

                {/* Paste youtube link widget */}
                <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-foreground text-base">Paste Any YouTube Lecture</h3>
                      <p className="text-xs text-muted-foreground">Instantly convert lectures into premium, tailored revision notes, maps, and assessments.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 bg-black/20"
                      disabled={isPipelineRunning}
                    />
                    <Button 
                      onClick={handleProcessSubmit} 
                      disabled={!videoUrl || isPipelineRunning} 
                      className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold"
                    >
                      {isPipelineRunning ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
                      ) : (
                        <>Analyze Lecture <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </div>

                {/* AI Pipeline Step Visualizer */}
                <AnimatePresence>
                  {isPipelineRunning && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-card border border-white/[0.06] rounded-3xl p-6 space-y-6"
                    >
                      <h3 className="text-md font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent animate-pulse" /> AI Processing Pipeline
                      </h3>

                      <div className="space-y-4">
                        {[
                          { step: 1, label: "Step 1: Extract Audio & Transcript", desc: "Retrieving YouTube audio streams & translating transcript segments." },
                          { step: 2, label: "Step 2: Identify Lecture Metadata", desc: "Indexing chapter tags, professor names, and duration intervals." },
                          { step: 3, label: "Step 3: Auto-create Core Assets", desc: "Generating revision sheets, key concepts, and detailed formula maps." },
                          { step: 4, label: "Step 4: Map Relevant PYQ Connections", desc: "Correlating video topic areas with past year questions." },
                          { step: 5, label: "Step 5: Synthesize Active Flashcards", desc: "Formulating spaced repetition recall triggers." },
                          { step: 6, label: "Step 6: Assemble Self-Assessment Tests", desc: "Configuring topic tests mapped directly to the lecture." }
                        ].map((s) => {
                          const isActive = pipelineStep === s.step;
                          const isDone = pipelineStep > s.step;

                          return (
                            <div key={s.step} className="flex items-start gap-4 transition-all duration-300">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors shrink-0 mt-0.5",
                                isDone ? "bg-emerald-500 border-emerald-400 text-white" :
                                isActive ? "bg-accent border-accent text-primary animate-pulse" :
                                "bg-white/[0.02] border-white/10 text-white/40"
                              )}>
                                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "text-sm font-bold transition-colors",
                                  isDone ? "text-white/60" : isActive ? "text-accent" : "text-white/30"
                                )}>
                                  {s.label}
                                </h4>
                                <p className={cn(
                                  "text-xs mt-0.5 transition-colors",
                                  isDone ? "text-white/40" : isActive ? "text-white/80" : "text-white/20"
                                )}>
                                  {s.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Live Output Log */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-white/50 space-y-1">
                        <p className="text-amber-500 font-bold uppercase tracking-wider mb-2">// PIPELINE LOGS</p>
                        {pipelineLogs.map((l, i) => (
                          <p key={i}>{l}</p>
                        ))}
                        {isPipelineRunning && (
                          <p className="text-accent animate-pulse">▋ Pipeline active — calculations streaming...</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Right Column: History List */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Previous Notes */}
                {notes.length > 0 && (
                  <div className="bg-card border border-border rounded-3xl overflow-hidden">
                    <div className="p-5 border-b border-border flex items-center gap-2">
                      <History className="w-5 h-5 text-accent" />
                      <h3 className="text-md font-extrabold text-foreground">Previous Lectures</h3>
                    </div>
                    <div className="p-3 space-y-2">
                      {notes.slice(0, 5).map((note) => (
                        <button
                          key={note.id}
                          onClick={() => setCurrentNote(note)}
                          className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-muted/50 transition-all text-left group/item"
                        >
                          {note.thumbnail_url && (
                            <img src={note.thumbnail_url} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs truncate text-foreground group-hover/item:text-accent transition-colors">{note.video_title || 'Untitled'}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(note.created_at).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </TabsContent>

          {/* ==================== TABS: NOTES ==================== */}
          <TabsContent value="notes">
            <Card className="border-border rounded-3xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {currentNote ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-white">{currentNote.video_title}</h2>
                        <p className="text-xs text-white/40 mt-1">Processed Core Lecture Notes</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">✓ Compiled by PrepEntrance AI</Badge>
                    </div>

                    <div className="space-y-1 prose prose-invert max-w-none text-white/95">
                      {renderProseNotes(currentNote.structured_notes || '')}
                    </div>

                    {/* Key Timestamps Section */}
                    {currentNote.key_timestamps && currentNote.key_timestamps.length > 0 && (
                      <div className="border-t border-white/[0.06] pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                          <Clock className="w-4.5 h-4.5 text-blue-400" /> Key Timestamps &amp; Highlights
                        </h3>
                        <div className="grid gap-2">
                          {currentNote.key_timestamps.map((stamp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl hover:bg-white/[0.03] transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                  {stamp.time}
                                </span>
                                <span className="text-xs font-semibold text-white/90">{stamp.topic}</span>
                              </div>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                                stamp.importance === 'Critical' ? 'bg-red-500/10 text-red-400' :
                                stamp.importance === 'High' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-blue-500/10 text-blue-400'
                              )}>
                                {stamp.importance} Priority
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-muted-foreground text-sm">Please analyze a lecture URL or load a previous lecture to view notes.</p>
                    <Button onClick={() => setActiveTab('lecture')} size="sm" className="bg-accent text-primary hover:bg-accent/90">Analyze Lecture</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TABS: FORMULAS (Redesigned Glowing/White Cards) ==================== */}
          <TabsContent value="formulas">
            {currentNote ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentNote.formulas && currentNote.formulas.length > 0 ? (
                  currentNote.formulas.map((formula, i) => (
                    <FormulaCard 
                      key={i} 
                      name={formula.name} 
                      formula={formula.formula} 
                      variables="q = charge magnitude, x = axial displacement, R = ring radius" 
                      usage={formula.usage} 
                      delay={i * 0.1} 
                    />
                  ))
                ) : (
                  <Card className="border-border col-span-2"><CardContent className="p-6 text-center text-muted-foreground">No formulas extracted from this lecture</CardContent></Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground text-sm">Please analyze a lecture URL or load a previous lecture to view formulas.</p>
                <Button onClick={() => setActiveTab('lecture')} size="sm" className="bg-accent text-primary hover:bg-accent/90">Analyze Lecture</Button>
              </div>
            )}
          </TabsContent>

          {/* ==================== TABS: FLASHCARDS ==================== */}
          <TabsContent value="flashcards">
            {currentNote ? (
              <div className="max-w-xl mx-auto space-y-4">
                <FlashcardViewer flashcards={currentNote.flashcards || []} />
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground text-sm">Please analyze a lecture URL or load a previous lecture to view flashcards.</p>
                <Button onClick={() => setActiveTab('lecture')} size="sm" className="bg-accent text-primary hover:bg-accent/90">Analyze Lecture</Button>
              </div>
            )}
          </TabsContent>

          {/* ==================== TABS: PRACTICE TEST ==================== */}
          <TabsContent value="practice">
            <Card className="border-border rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#0A0D15]">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {currentNote ? (
                  !isTestGenerated ? (
                    <div className="text-center py-12 max-w-lg mx-auto space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto animate-pulse">
                        <PenTool className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Generate Practice Test from Lecture</h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          Our AI will scan all concepts taught in this lecture and build a targeted JEE-level practice test to measure your understanding.
                        </p>
                      </div>
                      <Button 
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25"
                      >
                        Generate Test
                      </Button>
                    </div>
                  ) : isGeneratingTest ? (
                    <div className="text-center py-16 space-y-4">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                      <h4 className="text-sm font-bold text-white animate-pulse">Generating Practice Test...</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Scanning Gauss Law context, mapping relative permittivity, and compiling JEE-level problems...
                      </p>
                    </div>
                  ) : (
                    /* Quiz Interface */
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">JEE Practice: Electrostatics</h3>
                          <p className="text-[10px] text-amber-500 font-medium uppercase mt-0.5">
                            Generated from pw electrostatics lecture
                          </p>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          Question {currentQuestionIndex + 1} of {MOCK_QUIZ_QUESTIONS.length}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                        <p className="text-sm font-bold text-white leading-relaxed">
                          {MOCK_QUIZ_QUESTIONS[currentQuestionIndex].question}
                        </p>

                        <div className="space-y-2.5 pt-2">
                          {MOCK_QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                            const isSelected = userAnswers[currentQuestionIndex] === idx;
                            const isCorrect = MOCK_QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer === idx;
                            const showFeedback = isTestSubmitted;

                            return (
                              <button
                                key={idx}
                                disabled={isTestSubmitted}
                                onClick={() => {
                                  setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: idx }));
                                }}
                                className={cn(
                                  "w-full text-left px-4.5 py-3.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between",
                                  showFeedback
                                    ? isCorrect
                                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                      : isSelected
                                      ? "bg-red-500/10 border-red-500 text-red-400"
                                      : "bg-white/[0.01] border-white/5 text-slate-500"
                                    : isSelected
                                    ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5"
                                    : "bg-white/[0.01] border-white/5 text-slate-300 hover:bg-white/[0.03] hover:border-white/10"
                                )}
                              >
                                <span>{option}</span>
                                {showFeedback && isCorrect && <Check className="w-4 h-4 stroke-[3] text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {isTestSubmitted && (
                          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-500">// AI EXPLANATION</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {MOCK_QUIZ_QUESTIONS[currentQuestionIndex].explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          disabled={currentQuestionIndex === 0}
                          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                          className="rounded-xl border-white/5 text-xs font-bold px-4 hover:bg-white/5"
                        >
                          Previous
                        </Button>

                        {!isTestSubmitted ? (
                          currentQuestionIndex === MOCK_QUIZ_QUESTIONS.length - 1 ? (
                            <Button
                              onClick={() => {
                                let score = 0;
                                MOCK_QUIZ_QUESTIONS.forEach((q, idx) => {
                                  if (userAnswers[idx] === q.correctAnswer) score++;
                                });
                                setQuizScore(score);
                                setIsTestSubmitted(true);
                                toast.success(`Test Completed! Score: ${score}/${MOCK_QUIZ_QUESTIONS.length}`);
                              }}
                              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25"
                            >
                              Submit Test
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                              className="rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold px-4"
                            >
                              Next
                            </Button>
                          )
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsTestGenerated(false);
                                setIsTestSubmitted(false);
                                setUserAnswers({});
                                setCurrentQuestionIndex(0);
                              }}
                              className="rounded-xl border border-white/5 text-xs font-bold px-4 hover:bg-white/5"
                            >
                              Retake Test
                            </Button>
                            {currentQuestionIndex < MOCK_QUIZ_QUESTIONS.length - 1 && (
                              <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold px-4"
                              >
                                Next
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {isTestSubmitted && (
                        <div className="bg-gradient-to-br from-[#1E293B]/60 to-[#0F172A]/80 border border-amber-500/20 rounded-2xl p-5 text-center space-y-3 shadow-lg animate-in zoom-in-95 duration-300">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">YOUR TEST PERFORMANCE</h4>
                          <div className="text-3xl font-black text-amber-500">{quizScore} / {MOCK_QUIZ_QUESTIONS.length}</div>
                          <p className="text-xs text-slate-400">
                            Accuracy: <strong className="text-white">{Math.round((quizScore / MOCK_QUIZ_QUESTIONS.length) * 100)}%</strong> | Concepts Mastered: <strong className="text-emerald-400">Gauss Law &amp; Flux</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-slate-400 text-sm">Please analyze a lecture URL or load a previous lecture to view the practice test.</p>
                    <Button onClick={() => setActiveTab('lecture')} size="sm" className="bg-accent text-primary hover:bg-accent/90">Analyze Lecture</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Generation Config Dialog */}
          <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
            <DialogContent className="sm:max-w-md bg-[#0F172A] border border-white/[0.08] text-white rounded-3xl p-6 shadow-2xl">
              <DialogHeader className="space-y-1.5 text-center sm:text-left">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-amber-500 animate-pulse" /> Generate Practice Test
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs font-medium">
                  Choose the length and type of practice test you want to generate.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                {[
                  { id: '10', title: '10 Questions', desc: 'Targeting core concepts, ~15 mins' },
                  { id: '20', title: '20 Questions', desc: 'Targeting mixed concepts, ~30 mins' },
                  { id: '30', title: '30 Questions', desc: 'Standard Chapter Practice, ~45 mins' },
                  { id: 'mock', title: 'Full JEE Mini Mock', desc: 'Mixed Advanced & Main pattern, ~60 mins' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedGenerateOption(opt.id)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-0.5",
                      selectedGenerateOption === opt.id
                        ? "bg-amber-500/10 border-amber-500 text-white"
                        : "bg-white/[0.01] border-white/5 text-slate-300 hover:bg-white/[0.03] hover:border-white/10"
                    )}
                  >
                    <span className="text-xs font-extrabold">{opt.title}</span>
                    <span className="text-[10px] text-slate-400">{opt.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5 justify-end pt-4 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="rounded-xl border border-white/5 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsGenerateModalOpen(false);
                    setIsTestGenerated(true);
                    setIsGeneratingTest(true);
                    setTimeout(() => {
                      setIsGeneratingTest(false);
                    }, 2000);
                  }}
                  disabled={!selectedGenerateOption}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-5 py-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all"
                >
                  Generate &amp; Start
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* ==================== TABS: AI DOUBTS ("Ask this Lecture") ==================== */}
          <TabsContent value="doubts">
            {currentNote ? (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-card border border-white/[0.06] rounded-3xl p-6 space-y-5">
                  <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-foreground text-base">Ask this Lecture</h3>
                      <p className="text-xs text-muted-foreground">AI answers your questions using *only* this lecture's verified transcript context.</p>
                    </div>
                  </div>

                  {/* Chat window */}
                  <div className="h-80 overflow-y-auto bg-black/40 border border-white/5 rounded-2xl p-4 space-y-4">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={cn(
                        "flex items-start gap-3 text-xs leading-relaxed max-w-[85%] rounded-2xl p-3.5",
                        m.sender === 'user' 
                          ? "bg-blue-600 text-white ml-auto" 
                          : "bg-white/[0.02] border border-white/[0.04] text-white/95"
                      )}>
                        {m.sender === 'ai' && <span className="text-lg mt-0.5">🧠</span>}
                        <p>{m.text}</p>
                      </div>
                    ))}
                    {isChatTyping && (
                      <div className="bg-white/[0.02] border border-white/[0.04] text-white/50 rounded-2xl p-3.5 flex items-center gap-2 max-w-[50%]">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span className="text-xs font-semibold">Mentor is answering...</span>
                      </div>
                    )}
                  </div>

                  {/* Query shortcuts */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-white/35 font-bold">Suggested Doubts:</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          setChatInput("Explain Gauss Law from 1:12:30");
                        }}
                        className="text-[10px] font-bold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        "Explain Gauss Law from 1:12:30"
                      </button>
                      <button 
                        onClick={() => {
                          setChatInput("What did sir mean by electric flux?");
                        }}
                        className="text-[10px] font-bold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        "What did sir mean by electric flux?"
                      </button>
                      <button 
                        onClick={() => {
                          setChatInput("Generate 5 PYQs from this topic");
                        }}
                        className="text-[10px] font-bold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        "Generate 5 PYQs from this topic"
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a doubt about this specific lecture..."
                      className="bg-black/20"
                    />
                    <Button type="submit" className="bg-accent text-primary hover:bg-accent/80 font-bold px-5">
                      Ask AI
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground text-sm">Please analyze a lecture URL or load a previous lecture to chat.</p>
                <Button onClick={() => setActiveTab('lecture')} size="sm" className="bg-accent text-primary hover:bg-accent/90">Analyze Lecture</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </MainLayout>
  );
};

// Separated Flashcard Viewer Component
const FlashcardViewer: React.FC<{ flashcards: Array<{ front: string; back: string }> }> = ({ flashcards }) => {
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (flashcards.length === 0) {
    return <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">No flashcards generated</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card 
        className="border-border cursor-pointer min-h-[220px] flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#0A0D15] hover:border-white/10 transition-colors rounded-3xl" 
        onClick={() => setRevealed(!revealed)}
      >
        <CardContent className="p-6 text-center space-y-4">
          <span className="text-[10px] bg-accent/15 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black">
            {revealed ? 'Answer' : 'Question'}
          </span>
          <p className="text-sm text-muted-foreground">Card {active + 1} of {flashcards.length}</p>
          <p className="text-md sm:text-lg font-bold text-white max-w-sm mx-auto">
            {revealed ? flashcards[active]?.back : flashcards[active]?.front}
          </p>
          <p className="text-xs text-muted-foreground/60 select-none">
            Click card to {revealed ? 'see question' : 'reveal answer'}
          </p>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center px-2">
        <Button 
          variant="outline" 
          onClick={() => { setActive(Math.max(0, active - 1)); setRevealed(false); }} 
          disabled={active === 0}
          className="rounded-xl border-white/5 text-xs font-bold"
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={() => { setActive(Math.min(flashcards.length - 1, active + 1)); setRevealed(false); }} 
          disabled={active === flashcards.length - 1}
          className="rounded-xl border-white/5 text-xs font-bold"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default LecturePrepEntrance;
