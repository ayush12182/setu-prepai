import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Trophy, Calendar, BarChart3, Send, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';

type TabType = 'ai' | 'tests' | 'planner' | 'analytics';

const StudyVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const [typedDoubt, setTypedDoubt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'user',
      text: 'Show me integration by parts for ∫ x cos(x) dx.',
      time: '12:40 PM',
    },
    {
      sender: 'ai',
      text: 'Using ∫ u dv = u v - ∫ v du:\n• Let u = x => du = dx\n• Let dv = cos(x) dx => v = sin(x)\n\n∫ x cos(x) dx = x sin(x) - ∫ sin(x) dx\n= x sin(x) + cos(x) + C ✓',
      time: '12:40 PM',
    },
  ]);

  const handleSendDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedDoubt.trim()) return;

    const userMsg = { sender: 'user', text: typedDoubt, time: 'Just now' };
    const aiResponse = {
      sender: 'ai',
      text: `Let me analyze that doubt instantly! Using our active AI vector index, the formula resolves as: \n\nE = mc² or applicable kinematics. We've unlocked step-by-step guidance. Let's solve!`,
      time: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg, aiResponse]);
    setTypedDoubt('');
  };

  return (
    <div className="relative w-full min-h-[460px] flex items-center justify-center overflow-visible font-sans px-2">
      {/* Background Radial Glow */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 60% 50%, rgba(255, 107, 0, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Floating Decorative Glass Card 1 (Bottom Left) */}
      <div className="absolute bottom-[20px] left-[-30px] hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-[#F0EDE6] shadow-[0_12px_32px_rgba(0,0,0,0.06)] z-30 animate-float-slow">
        <div className="w-10 h-10 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#FF6B00]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Concept Accuracy</p>
          <p className="text-sm font-black text-[#0D1117]">98.4% Mastery</p>
        </div>
      </div>

      {/* Floating Decorative Glass Card 2 (Top Right) */}
      <div className="absolute top-[40px] right-[-30px] hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-[#F0EDE6] shadow-[0_12px_32px_rgba(0,0,0,0.06)] z-30 animate-float">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Target predicted</p>
          <p className="text-sm font-black text-emerald-600">AIR 1,420 ✓</p>
        </div>
      </div>

      {/* Unified High-Fidelity Workspace Dashboard */}
      <div className="w-full max-w-[520px] bg-[#0B0F19] border-[1.5px] border-slate-800 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative z-20 hover:border-[#FF6B00]/40 transition-all duration-300">
        
        {/* Window Control Bar */}
        <div className="w-full h-12 bg-[#0D1322] px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4444] opacity-80" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] opacity-80" />
            <span className="w-3 h-3 rounded-full bg-[#10B981] opacity-80" />
          </div>
          <span className="text-[11px] font-sans font-extrabold tracking-wider text-slate-400">
            PREPENTRANCE WORKSPACE v2.0
          </span>
          <div className="w-14 h-1.5 bg-slate-800 rounded-full" />
        </div>

        {/* Workspace Layout: Left Sidebar + Right Workspace Panel */}
        <div className="flex flex-row h-[360px] w-full overflow-hidden">
          
          {/* Sidebar Navigation (Tabs) */}
          <div className="w-[72px] sm:w-[80px] bg-[#090C16] border-r border-slate-800/90 flex flex-col items-center py-4 justify-between shrink-0">
            <div className="flex flex-col gap-4 w-full px-2">
              {/* Tab 1: AI Mentor */}
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all gap-1 group cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                aria-label="AI Mentor tab"
              >
                <Bot className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span className="text-[8px] font-bold uppercase tracking-wider block text-center">AI Mentor</span>
              </button>

              {/* Tab 2: Mock Tests */}
              <button
                onClick={() => setActiveTab('tests')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all gap-1 group cursor-pointer ${
                  activeTab === 'tests'
                    ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                aria-label="Mock Tests tab"
              >
                <Trophy className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span className="text-[8px] font-bold uppercase tracking-wider block text-center">Mock Exam</span>
              </button>

              {/* Tab 3: Study Planner */}
              <button
                onClick={() => setActiveTab('planner')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all gap-1 group cursor-pointer ${
                  activeTab === 'planner'
                    ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                aria-label="Study Planner tab"
              >
                <Calendar className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span className="text-[8px] font-bold uppercase tracking-wider block text-center">Planner</span>
              </button>

              {/* Tab 4: Analytics */}
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all gap-1 group cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                aria-label="Analytics tab"
              >
                <BarChart3 className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span className="text-[8px] font-bold uppercase tracking-wider block text-center">Analytics</span>
              </button>
            </div>

            {/* Platform indicator */}
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white font-sans font-black text-xs shadow-md select-none">
              P
            </div>
          </div>

          {/* Active Workspace Viewport */}
          <div className="flex-1 h-full bg-[#0B0F19] overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between p-4"
                >
                  {/* Chat logs area */}
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-[11px] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#1E293B] text-slate-200 self-end rounded-br-none border border-slate-800'
                            : 'bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-white self-start rounded-bl-none'
                        }`}
                      >
                        <span className="text-[8px] font-sans font-black tracking-wider uppercase mb-1 block text-[#FF6B00]">
                          {msg.sender === 'user' ? 'QUESTION' : 'AI MENTOR'}
                        </span>
                        <p className="whitespace-pre-line font-medium">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Doubt Input form */}
                  <form onSubmit={handleSendDoubt} className="mt-3 pt-3 border-t border-slate-800/80 flex gap-2">
                    <input
                      type="text"
                      value={typedDoubt}
                      onChange={(e) => setTypedDoubt(e.target.value)}
                      placeholder="Ask organic chemistry, physics kinematics..."
                      className="flex-1 bg-[#090C16] border border-slate-800 rounded-xl px-3 py-2 text-[10px] sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                    />
                    <button
                      type="submit"
                      className="w-9 h-9 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors shadow-sm"
                      aria-label="Send doubt"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'tests' && (
                <motion.div
                  key="tests"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between p-4"
                >
                  {/* Timer Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[10px] font-bold text-slate-400">ACTIVE TIMED MOCK EXAM</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono text-[10px] font-bold border border-rose-500/20 animate-pulse">
                      02:44:59
                    </span>
                  </div>

                  {/* Multiple-choice block */}
                  <div className="flex-1 flex flex-col gap-3 justify-center">
                    <div className="text-[11.5px] font-bold text-slate-200 leading-snug">
                      Q12. A block of mass <span className="font-mono">m</span> moves in a circle of radius <span className="font-mono">R</span> with constant speed <span className="font-mono">v</span>. The normal acceleration of the block is:
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 cursor-pointer">
                        <span className="text-[10.5px] font-sans font-bold text-white">A) v² / R</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090C16] border border-slate-800/80 cursor-pointer opacity-70">
                        <span className="text-[10.5px] font-sans font-bold text-slate-400">B) v / R²</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-800" />
                      </div>
                    </div>
                  </div>

                  {/* Submission row */}
                  <button
                    className="w-full py-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white rounded-xl text-[11px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors shadow-sm mt-2"
                  >
                    Submit Answer & Next
                  </button>
                </motion.div>
              )}

              {activeTab === 'planner' && (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between p-4"
                >
                  {/* Planner header */}
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                    <span className="text-[10px] font-extrabold text-[#FF6B00] uppercase tracking-wider">
                      Today's Study Checklist
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 leading-none">
                      78% Complete
                    </span>
                  </div>

                  {/* Planner checklist items */}
                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
                    <div className="flex items-start gap-2.5 p-2 bg-[#090C16] border border-slate-800 rounded-xl">
                      <div className="w-4.5 h-4.5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-sans font-bold text-slate-400 line-through">Physics PYQs: Electrostatics Chapter 4</p>
                        <p className="text-[8.5px] text-slate-500 font-semibold mt-0.5">Completed at 10:15 AM</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-[#090C16] border border-slate-800 rounded-xl">
                      <div className="w-4.5 h-4.5 rounded-md bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center shrink-0 border border-[#FF6B00]/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-sans font-bold text-white">Active: Inorganic Chemistry Revison</p>
                        <p className="text-[8.5px] text-[#FF6B00] font-semibold mt-0.5">25 mins elapsed • Keep going!</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-[#090C16]/50 border border-slate-800/40 rounded-xl opacity-60">
                      <div className="w-4.5 h-4.5 rounded-md border border-slate-800 shrink-0" />
                      <div>
                        <p className="text-[10.5px] font-sans font-bold text-slate-500">Solve JEE Mathematics Coordinate Mock</p>
                        <p className="text-[8.5px] text-slate-500 font-semibold mt-0.5">Scheduled for 4:00 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 bg-[#FF6B00]/5 border border-[#FF6B00]/10 p-2.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                    <span className="text-[8.5px] text-slate-400 font-semibold leading-normal">
                      PrepEntrance adaptive algorithm dynamically optimized your planner to clear backlogs.
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between p-4 gap-3 overflow-y-auto"
                >
                  {/* predicted AIR and completion grid */}
                  <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="bg-[#090C16] border border-slate-800 rounded-xl p-2.5 text-center flex flex-col justify-center">
                      <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
                        Predicted AIR Rank
                      </span>
                      <span className="text-sm font-black text-[#FF6B00]">
                        AIR 1,420
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 mt-0.5">
                        JEE Target
                      </span>
                    </div>

                    <div className="bg-[#090C16] border border-slate-800 rounded-xl p-2.5 text-center flex flex-col justify-center">
                      <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
                        Concept Mastery
                      </span>
                      <span className="text-sm font-black text-emerald-400">
                        88%
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 mt-0.5">
                        Accuracy rate
                      </span>
                    </div>
                  </div>

                  {/* SVG score graph */}
                  <div className="flex-1 bg-[#090C16] border border-slate-800 rounded-xl p-3 flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                        MOCK SCORE OVER TIME
                      </span>
                      <span className="text-[10px] font-black text-emerald-400">
                        142 / 180
                      </span>
                    </div>

                    {/* Chart graphics */}
                    <div className="w-full h-12 relative mt-2">
                      <svg className="w-full h-full" viewBox="0 0 200 50">
                        <line x1="0" y1="45" x2="200" y2="45" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="25" x2="200" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="5" x2="200" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        
                        <path
                          d="M 5 45 L 50 35 L 100 22 L 150 18 L 195 5"
                          fill="none"
                          stroke="#FF6B00"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 5 45 L 50 35 L 100 22 L 150 18 L 195 5 L 195 50 L 5 50 Z"
                          fill="url(#analytics-grad)"
                          opacity="0.1"
                        />
                        
                        <circle cx="5" cy="45" r="2.5" fill="#3B82F6" />
                        <circle cx="50" cy="35" r="2.5" fill="#3B82F6" />
                        <circle cx="100" cy="22" r="2.5" fill="#3B82F6" />
                        <circle cx="150" cy="18" r="2.5" fill="#3B82F6" />
                        <circle cx="195" cy="5" r="3.5" fill="#FF6B00" stroke="white" strokeWidth="1" />

                        <defs>
                          <linearGradient id="analytics-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF6B00" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudyVisual;
