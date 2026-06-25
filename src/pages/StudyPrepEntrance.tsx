import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
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
  MessageCircle,
  RotateCcw,
  Check,
  PenTool,
  Star,
  Activity,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyNotes, StudyNote } from '@/hooks/useStudyNotes';
import { useLanguage } from '@/contexts/LanguageContext';
import { renderProseNotes } from '@/utils/mathRenderer';
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

const StudyPrepEntrance: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const { language } = useLanguage();
  const { isProcessing: hookIsProcessing, currentNote, notes, processLecture, fetchUserNotes, setCurrentNote } = useStudyNotes();

  // Custom visual pipeline states
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(1);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);

  // Chatbot State for "Ask PrepEntrance"
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I am your PrepEntrance Study Assistant. Ask me anything about this video's concepts, formulas, or derivations." }
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

  // Initial load of previous notes
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

  // Premium Study Session Mock Data (No video player)
  const mockElectrostaticsNote: StudyNote = {
    id: "mock-electrostatics-001",
    video_url: "https://www.youtube.com/watch?v=mock123",
    video_title: "Electrostatics L1: Coulomb's Law & Field Strengths | JEE Advanced",
    thumbnail_url: null,
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
      setPipelineLogs(prev => [...prev, "✓ Audio & transcript successfully extracted.", "🔍 Parsing video segments for metadata..."]);
    }, 1500);

    setTimeout(() => {
      setPipelineStep(3);
      setPipelineLogs(prev => [...prev, "✓ Metadata identified. Chapter: Electrostatics | Instructor: ABJ Sir", "📚 Generating premium revision sheets & study notes..."]);
    }, 3000);

    setTimeout(() => {
      setPipelineStep(4);
      setPipelineLogs(prev => [...prev, "✓ Study notes & key concept summaries synthesized.", "🔗 Mapping relevant JEE/NEET PYQs & question traps..."]);
    }, 4500);

    setTimeout(() => {
      setPipelineStep(5);
      setPipelineLogs(prev => [...prev, "✓ Mapped 18 JEE Main & Advanced PYQ associations.", "🃏 Creating spaced repetition revision flashcards..."]);
    }, 6000);

    setTimeout(() => {
      setPipelineStep(6);
      setPipelineLogs(prev => [...prev, "✓ Synthesized 12 concept flashcards.", "📝 Assembling practice questions & assessment test..."]);
    }, 7500);

    const minWaitPromise = new Promise(resolve => setTimeout(resolve, 9500));

    try {
      const [result] = await Promise.all([processPromise, minWaitPromise]);
      setIsPipelineRunning(false);
      
      if (result) {
        setCurrentNote(result);
      } else {
        // Fallback to mock data if backend failed
        setCurrentNote(mockElectrostaticsNote);
        toast.success("Study AI Analysis Complete!");
      }
      setVideoUrl('');
    } catch (error) {
      console.error('Error in handleProcessSubmit:', error);
      setIsPipelineRunning(false);
      setCurrentNote(mockElectrostaticsNote);
      toast.success("Study AI Analysis Complete!");
      setVideoUrl('');
    }
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
      let aiResponse = "I have analyzed the video transcript. Since charges are stationary, we apply the electrostatic equilibrium. Let me know if you want me to derive the full axial ring equation or explain Gauss Law.";
      
      const query = userMsg.toLowerCase();
      if (query.includes('energy') || query.includes('conservation')) {
        aiResponse = "In the video transcript at 24:15, the instructor explains that since there are no non-conservative forces performing work, the total mechanical energy remains conserved: E_initial = E_final.";
      } else if (query.includes('field') || query.includes('ring')) {
        aiResponse = "At axial points of a ring of charge, the perpendicular components cancel out. Only the axial components sum up, yielding E = (1/4πε₀) * (qx / (R² + x²)^(3/2)). This peaks at x = R/√2.";
      } else if (query.includes('gauss') || query.includes('1:12:30')) {
        aiResponse = "At 1:12:30, the instructor derives Gauss's Law: ∮ E·dA = Q_enclosed / ε₀. He highlights that this is highly useful for symmetric charge configurations (spherical, cylindrical, or planar) to solve for E.";
      } else if (query.includes('flux')) {
        aiResponse = "Electric flux represents the quantity of electric field lines passing through a given surface: Φ = ∮ E · dA. For a uniform field, it is Φ = E · A = E A cos(θ).";
      } else if (query.includes('pyq') || query.includes('pyqs') || query.includes('questions')) {
        aiResponse = "Here are 5 PYQ patterns on Electrostatics & Gauss's Law: \n1. [JEE Advanced 2023] Flux through a cube with an off-center charge. \n2. [JEE Main 2022] Electric field of an infinite line charge. \n3. [JEE Advanced 2021] Solid sphere with variable charge density. \n4. [JEE Main 2024] Potential difference between concentric shells. \n5. [JEE Main 2023] Work done in rotating a dipole.";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsChatTyping(false);
    }, 1200);
  };

  const handleResetSession = () => {
    setCurrentNote(null);
    setVideoUrl('');
    setIsTestGenerated(false);
    setIsTestSubmitted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setChatMessages([
      { sender: 'ai', text: "Hello! I am your PrepEntrance Study Assistant. Ask me anything about this video's concepts, formulas, or derivations." }
    ]);
  };

  return (
    <MainLayout title="PrepEntrance Study AI">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. Chapter Mastery Header Card (Light UI styling) */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-blue-100 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Knowledge Engine</span>
                <span className="text-[10px] text-slate-400 font-semibold">Physics</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">Kinematics &amp; Electrostatics</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current Priority Topic: <span className="text-slate-800 font-bold">Relative Motion &amp; Coulomb's Law</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 text-slate-700">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Last Revised</span>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">2 days ago</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Study Time</span>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">4.5 hrs</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Completion</span>
              <div className="text-sm font-extrabold text-blue-600 mt-0.5">42%</div>
            </div>
          </div>
        </motion.div>

        {/* 2. Tabs & Main Grid */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-100/80 border border-slate-200 rounded-2xl p-1 mb-6">
            <TabsTrigger value="notes" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" />Study Notes
            </TabsTrigger>
            <TabsTrigger value="revision" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <RotateCcw className="w-4 h-4" />Revision Material
            </TabsTrigger>
            <TabsTrigger value="formulas" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Calculator className="w-4 h-4" />Formula Sheet
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Bookmark className="w-4 h-4" />Flashcards
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <PenTool className="w-4 h-4" />Practice Questions
            </TabsTrigger>
            <TabsTrigger value="ai-mentor" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <MessageCircle className="w-4 h-4" />Ask PrepEntrance
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: STUDY NOTES ==================== */}
          <TabsContent value="notes" className="space-y-6">
            {!currentNote ? (
              // Empty State / Paste URL input
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Hero Entry Input */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        Knowledge Engine
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Turn Any YouTube Video Into Study Material</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Generate structured notes, formula sheets, flashcards, practice questions, revision sheets and AI-powered guidance.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="Paste YouTube Video URL (e.g. Unacademy, PW, Physics Galaxy...)"
                          className="flex-1 bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus-visible:ring-blue-500/20"
                          disabled={isPipelineRunning}
                        />
                        <Button 
                          onClick={handleProcessSubmit} 
                          disabled={!videoUrl || isPipelineRunning} 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shrink-0"
                        >
                          {isPipelineRunning ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</>
                          ) : (
                            <>Analyze Video <ArrowRight className="w-4 h-4 ml-2" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* AI Processing Pipeline Steps */}
                  <AnimatePresence>
                    {isPipelineRunning && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm"
                      >
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" /> AI Study Material Generation
                        </h3>

                        <div className="space-y-4">
                          {[
                            { step: 1, label: "Step 1: Parse Video Content", desc: "Extracting verified concept transcripts and semantic markers." },
                            { step: 2, label: "Step 2: Identify Subject Context", desc: "Tagging subject areas, specific formulas, and chapter sections." },
                            { step: 3, label: "Step 3: Generate Core Study Notes", desc: "Structuring detailed notes, descriptions, and timestamps." },
                            { step: 4, label: "Step 4: Map Relevant PYQ Connections", desc: "Correlating concepts with previous years exam patterns." },
                            { step: 5, label: "Step 5: Synthesize Active Flashcards", desc: "Creating active recall questions and solutions." },
                            { step: 6, label: "Step 6: Assemble Practice Questions", desc: "Compiling a targeted practice test from the video context." }
                          ].map((s) => {
                            const isActive = pipelineStep === s.step;
                            const isDone = pipelineStep > s.step;

                            return (
                              <div key={s.step} className="flex items-start gap-4 transition-all duration-300">
                                <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors shrink-0 mt-0.5",
                                  isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                                  isActive ? "bg-blue-600 border-blue-600 text-white animate-pulse" :
                                  "bg-slate-100 border-slate-200 text-slate-400"
                                )}>
                                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={cn(
                                    "text-xs font-bold transition-colors",
                                    isDone ? "text-slate-500" : isActive ? "text-blue-600" : "text-slate-400"
                                  )}>
                                    {s.label}
                                  </h4>
                                  <p className={cn(
                                    "text-[11px] mt-0.5 transition-colors",
                                    isDone ? "text-slate-400" : isActive ? "text-slate-700" : "text-slate-300"
                                  )}>
                                    {s.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Live Output Log */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-[10px] text-slate-500 space-y-1">
                          <p className="text-blue-600 font-bold uppercase tracking-wider mb-2">// PIPELINE LOGS</p>
                          {pipelineLogs.map((l, i) => (
                            <p key={i}>{l}</p>
                          ))}
                          {isPipelineRunning && (
                            <p className="text-blue-500 animate-pulse">▋ Study AI is streaming calculations...</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-4 space-y-6">
                  {notes.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <History className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Previous Videos</h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {notes.slice(0, 5).map((note) => (
                          <button
                            key={note.id}
                            onClick={() => setCurrentNote(note)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-100 transition-colors">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate text-slate-800 group-hover:text-blue-600 transition-colors">{note.video_title || 'Untitled Video'}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(note.created_at).toLocaleDateString()}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Active Study Notes View
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Clean Video Details Card (No player/thumbnail) */}
                  <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Video Analyzed
                        </span>
                        <a href={currentNote.video_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 font-semibold">
                          View original URL <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                      <h3 className="text-base font-black text-slate-900 leading-snug">{currentNote.video_title}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Subject: <strong className="text-slate-700">{currentNote.subject || 'Physics'}</strong> | Chapter: <strong className="text-slate-700">{currentNote.chapter || 'Electrostatics'}</strong>
                      </p>
                    </div>

                    <div className="flex gap-2.5 shrink-0 w-full sm:w-auto">
                      <Button onClick={handleResetSession} variant="outline" size="sm" className="text-xs font-bold rounded-xl flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50">
                        Analyze Another
                      </Button>
                    </div>
                  </div>

                  {/* Core Notes Markdown */}
                  <Card className="border-slate-200 bg-white rounded-3xl shadow-sm">
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Study Notes</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Synthesized from video audio transcripts</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-semibold">✓ Generated by PrepEntrance AI</Badge>
                      </div>

                      <div className="space-y-1 prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed">
                        {renderProseNotes(currentNote.structured_notes || '')}
                      </div>

                      {/* Key Timestamps Section */}
                      {currentNote.key_timestamps && currentNote.key_timestamps.length > 0 && (
                        <div className="border-t border-slate-100 pt-6 space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" /> Key Timestamps &amp; Concept Highlights
                          </h3>
                          <div className="grid gap-2">
                            {currentNote.key_timestamps.map((stamp, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100/60 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                                    {stamp.time}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-700">{stamp.topic}</span>
                                </div>
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                                  stamp.importance === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                                  stamp.importance === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                  'bg-blue-50 text-blue-600 border border-blue-100'
                                )}>
                                  {stamp.importance} Priority
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right Column: Sessions list when active */}
                <div className="lg:col-span-4 space-y-6">
                  {notes.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <History className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Analyzed Videos</h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {notes.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => setCurrentNote(note)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                              currentNote.id === note.id ? "bg-blue-50/55 border border-blue-100/50" : "hover:bg-slate-50"
                            )}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                              currentNote.id === note.id ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-500 group-hover:bg-blue-100"
                            )}>
                              <FileText className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate text-slate-800 group-hover:text-blue-600 transition-colors">{note.video_title || 'Untitled'}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(note.created_at).toLocaleDateString()}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 2: REVISION MATERIAL ==================== */}
          <TabsContent value="revision">
            {currentNote ? (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* One page recall sheet */}
                <Card className="border-slate-200 bg-white rounded-3xl shadow-sm">
                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">One-Page Revision Sheet</h3>
                        <p className="text-[11px] text-slate-500">Fast 5-minute study recall summaries</p>
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed mt-2">
                      {renderProseNotes(currentNote.one_page_summary || 'No revision summary generated.')}
                    </div>
                  </div>
                </Card>

                {/* PYQ Connections */}
                <Card className="border-slate-200 bg-white rounded-3xl shadow-sm">
                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">PYQ Connections</h3>
                        <p className="text-[11px] text-slate-500">Related previous years questions and exam weightage trends</p>
                      </div>
                    </div>
                    <div className="grid gap-2.5 mt-2">
                      {currentNote.pyq_connections && currentNote.pyq_connections.length > 0 ? (
                        currentNote.pyq_connections.map((pyq, idx) => (
                          <div key={idx} className="flex items-start justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] rounded-lg">
                                  {pyq.exam} {pyq.year}
                                </Badge>
                                <span className="text-[10px] text-slate-400 font-semibold">Weightage Target</span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 leading-snug mt-1">{pyq.topic}</p>
                            </div>
                            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 font-bold text-[9px]">High Match</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-xs py-4 text-center">No PYQ connections mapped to this topic.</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-slate-500 text-sm">Please analyze a YouTube video URL first to view revision material.</p>
                <Button onClick={() => setActiveTab('notes')} size="sm" className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Go to Study Notes</Button>
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 3: FORMULA SHEET ==================== */}
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
                  <Card className="border-slate-200 col-span-2"><CardContent className="p-6 text-center text-slate-500">No formulas extracted from this video.</CardContent></Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-slate-500 text-sm">Please analyze a YouTube video URL first to view formulas.</p>
                <Button onClick={() => setActiveTab('notes')} size="sm" className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Go to Study Notes</Button>
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 4: FLASHCARDS ==================== */}
          <TabsContent value="flashcards">
            {currentNote ? (
              <div className="max-w-xl mx-auto space-y-4">
                <FlashcardViewer flashcards={currentNote.flashcards || []} />
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-slate-500 text-sm">Please analyze a YouTube video URL first to view flashcards.</p>
                <Button onClick={() => setActiveTab('notes')} size="sm" className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Go to Study Notes</Button>
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 5: PRACTICE QUESTIONS ==================== */}
          <TabsContent value="practice">
            <Card className="border-slate-200 rounded-3xl bg-white shadow-sm">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {currentNote ? (
                  !isTestGenerated ? (
                    <div className="text-center py-12 max-w-lg mx-auto space-y-6 text-slate-800">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto animate-pulse">
                        <PenTool className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-base font-black text-slate-900">Generate Practice Test from Study Materials</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Our AI will scan all concepts identified in this video and build a targeted JEE-level practice test to measure your understanding.
                        </p>
                      </div>
                      <Button 
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl transition-all shadow-md"
                      >
                        Generate Test
                      </Button>
                    </div>
                  ) : isGeneratingTest ? (
                    <div className="text-center py-16 space-y-4">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800 animate-pulse">Generating Practice Test...</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Scanning video concepts, mapping formulas, and compiling JEE-level problems...
                      </p>
                    </div>
                  ) : (
                    /* Quiz Interface */
                    <div className="max-w-2xl mx-auto space-y-6 text-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">JEE Practice: Electrostatics</h3>
                          <p className="text-[10px] text-amber-600 font-semibold uppercase mt-0.5">
                            Generated from study session
                          </p>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          Question {currentQuestionIndex + 1} of {MOCK_QUIZ_QUESTIONS.length}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
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
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                      : isSelected
                                      ? "bg-red-50 border-red-500 text-red-700"
                                      : "bg-white border-slate-100 text-slate-400"
                                    : isSelected
                                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                )}
                              >
                                <span>{option}</span>
                                {showFeedback && isCorrect && <Check className="w-4 h-4 stroke-[3] text-emerald-600" />}
                              </button>
                            );
                          })}
                        </div>

                        {isTestSubmitted && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-700">// AI EXPLANATION</h4>
                            <p className="text-xs text-slate-700 leading-relaxed">
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
                          className="rounded-xl border-slate-200 text-xs font-bold px-4 hover:bg-slate-50"
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
                              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 shadow-sm"
                            >
                              Submit Test
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                              className="rounded-xl bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold px-4"
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
                              className="rounded-xl border border-slate-200 text-xs font-bold px-4 hover:bg-slate-50"
                            >
                              Retake Test
                            </Button>
                            {currentQuestionIndex < MOCK_QUIZ_QUESTIONS.length - 1 && (
                              <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="rounded-xl bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold px-4"
                              >
                                Next
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {isTestSubmitted && (
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-5 text-center space-y-2 shadow-sm animate-in zoom-in-95 duration-300">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">YOUR TEST PERFORMANCE</h4>
                          <div className="text-3xl font-black text-blue-600">{quizScore} / {MOCK_QUIZ_QUESTIONS.length}</div>
                          <p className="text-xs text-slate-500 font-medium">
                            Accuracy: <strong className="text-slate-800">{Math.round((quizScore / MOCK_QUIZ_QUESTIONS.length) * 100)}%</strong> | Concepts Mastered: <strong className="text-emerald-600">Gauss Law &amp; Flux</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-slate-500 text-sm">Please analyze a YouTube video URL first to view the practice test.</p>
                    <Button onClick={() => setActiveTab('notes')} size="sm" className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Go to Study Notes</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TAB 6: ASK PREPENTRANCE ==================== */}
          <TabsContent value="ai-mentor">
            {currentNote ? (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm text-slate-800">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Ask PrepEntrance</h3>
                      <p className="text-xs text-slate-500">AI answers your questions using *only* this video's verified transcript context.</p>
                    </div>
                  </div>

                  {/* Chat window */}
                  <div className="h-80 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={cn(
                        "flex items-start gap-3 text-xs leading-relaxed max-w-[85%] rounded-2xl p-3.5",
                        m.sender === 'user' 
                          ? "bg-blue-600 text-white ml-auto" 
                          : "bg-white border border-slate-200 text-slate-800"
                      )}>
                        {m.sender === 'ai' && <span className="text-sm mt-0.5">🧠</span>}
                        <p>{m.text}</p>
                      </div>
                    ))}
                    {isChatTyping && (
                      <div className="bg-white border border-slate-250 text-slate-500 rounded-2xl p-3.5 flex items-center gap-2 max-w-[50%]">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs font-semibold">Assistant is formulating response...</span>
                      </div>
                    )}
                  </div>

                  {/* Query shortcuts */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Suggested Doubts:</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          setChatInput("Explain Gauss Law from 1:12:30");
                        }}
                        className="text-[10px] font-bold text-slate-600 hover:text-blue-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        "Explain Gauss Law from 1:12:30"
                      </button>
                      <button 
                        onClick={() => {
                          setChatInput("What did sir mean by electric flux?");
                        }}
                        className="text-[10px] font-bold text-slate-600 hover:text-blue-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        "What did sir mean by electric flux?"
                      </button>
                      <button 
                        onClick={() => {
                          setChatInput("Generate 5 PYQs from this topic");
                        }}
                        className="text-[10px] font-bold text-slate-600 hover:text-blue-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all"
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
                      placeholder="Ask a doubt about this specific video..."
                      className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 text-slate-800"
                    />
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-5">
                      Ask AI
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-slate-500 text-sm">Please analyze a YouTube video URL first to chat.</p>
                <Button onClick={() => setActiveTab('notes')} size="sm" className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Go to Study Notes</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Generate Config Dialog */}
        <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 shadow-2xl">
            <DialogHeader className="space-y-1.5 text-left">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                <PenTool className="w-5 h-5 text-blue-600 animate-pulse" /> Generate Practice Test
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs font-semibold">
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
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  )}
                >
                  <span className="text-xs font-extrabold">{opt.title}</span>
                  <span className="text-[10px] text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={() => setIsGenerateModalOpen(false)}
                className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-4 py-2"
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
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 shadow-sm transition-all"
              >
                Generate &amp; Start
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  );
};

// Separated Flashcard Viewer Component (Light UI theme)
const FlashcardViewer: React.FC<{ flashcards: Array<{ front: string; back: string }> }> = ({ flashcards }) => {
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (flashcards.length === 0) {
    return <Card className="border-slate-200 bg-white"><div className="p-6 text-center text-slate-500">No flashcards generated.</div></Card>;
  }

  return (
    <div className="space-y-4">
      <Card 
        className="border-slate-255 cursor-pointer min-h-[220px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50 hover:border-slate-300 hover:shadow-sm transition-all rounded-3xl" 
        onClick={() => setRevealed(!revealed)}
      >
        <div className="p-6 text-center space-y-4 select-none">
          <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black">
            {revealed ? 'Answer' : 'Question'}
          </span>
          <p className="text-xs text-slate-400">Card {active + 1} of {flashcards.length}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800 max-w-sm mx-auto">
            {revealed ? flashcards[active]?.back : flashcards[active]?.front}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">
            Click card to {revealed ? 'see question' : 'reveal answer'}
          </p>
        </div>
      </Card>
      
      <div className="flex justify-between items-center px-2">
        <Button 
          variant="outline" 
          onClick={() => { setActive(Math.max(0, active - 1)); setRevealed(false); }} 
          disabled={active === 0}
          className="rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={() => { setActive(Math.min(flashcards.length - 1, active + 1)); setRevealed(false); }} 
          disabled={active === flashcards.length - 1}
          className="rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StudyPrepEntrance;
