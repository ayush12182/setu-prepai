import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';

const StudyVisual: React.FC = () => {
  return (
    <div className="relative w-full h-[520px] select-none flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0F1C2C] to-[#07111F] rounded-3xl border border-white/[0.06] shadow-2xl">
      
      {/* Soft warm sunburst/desk-lamp glow overlay */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full bg-amber-500/[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-blue-500/[0.03] blur-[90px] pointer-events-none" />

      {/* Grid overlay for a neat planner canvas */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50 pointer-events-none" />

      {/* Aspirational Vector Scene (SVG + CSS illustrations) */}
      <div className="relative w-full max-w-lg h-full flex items-center justify-center">
        
        {/* Floating thought bubbles & milestones around the study scene */}
        {/* Thought Cloud 1: Lightbulb / Concept */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute top-20 left-6 z-20 px-3.5 py-2 rounded-2xl bg-black/80 border border-amber-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg shadow-amber-500/5"
        >
          <span className="text-base">💡</span>
          <div className="text-left">
            <p className="text-[10px] font-black text-white leading-none">Concept Clear</p>
            <p className="text-[8px] text-white/45 mt-0.5 leading-none">Formula Triggers</p>
          </div>
        </motion.div>

        {/* Thought Cloud 2: Mock Tests */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute top-36 right-8 z-20 px-3.5 py-2 rounded-2xl bg-black/80 border border-blue-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg shadow-blue-500/5"
        >
          <span className="text-base">📝</span>
          <div className="text-left">
            <p className="text-[10px] font-black text-white leading-none">National Mocks</p>
            <p className="text-[8px] text-white/45 mt-0.5 leading-none">All India Rank</p>
          </div>
        </motion.div>

        {/* Thought Cloud 3: Daily Plan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute bottom-24 right-4 z-20 px-3.5 py-2 rounded-2xl bg-black/80 border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg shadow-emerald-500/5"
        >
          <span className="text-base">📅</span>
          <div className="text-left">
            <p className="text-[10px] font-black text-white leading-none">Daily Plan</p>
            <p className="text-[8px] text-white/45 mt-0.5 leading-none">Lectures & Mocks</p>
          </div>
        </motion.div>

        {/* Peak Target Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-[#FF9B54]/10 to-blue-500/10 border border-white/15 backdrop-blur-md text-center shadow-xl">
            <span className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-1.5 justify-center">
              🎓 Goal: IIT · AIIMS · DU
            </span>
          </div>
        </motion.div>

        {/* Handcrafted Vector Scene inside SVG */}
        <svg className="w-[380px] h-[380px] z-10" viewBox="0 0 320 320" fill="none">
          {/* Floor / Desk base line */}
          <line x1="20" y1="280" x2="300" y2="280" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" />
          
          {/* Warm Study Lamp */}
          <g>
            {/* Lamp base */}
            <path d="M 60 280 L 90 280 L 85 274 L 65 274 Z" fill="rgba(255, 155, 84, 0.2)" stroke="#FF9B54" strokeWidth="1.5" />
            {/* Lamp stem */}
            <path d="M 75 274 C 75 220, 110 200, 110 190" stroke="#FF9B54" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Lamp head shade */}
            <path d="M 98 182 L 122 188 L 126 198 L 102 192 Z" fill="#FF9B54" />
            {/* Lamp light glow beam cone */}
            <polygon points="112,192 70,280 180,280" fill="url(#lampLightBeam)" opacity="0.45" />
          </g>

          {/* Alarm Clock */}
          <g transform="translate(148, 255)">
            <circle cx="12" cy="12" r="10" stroke="#FF9B54" strokeWidth="1.5" fill="#0C1825" />
            <path d="M 12 6 L 12 12 L 17 12" stroke="#FF9B54" strokeWidth="1.5" strokeLinecap="round" />
            {/* Alarm bells */}
            <path d="M 4 4 C 4 2, 7 1, 9 3" stroke="#FF9B54" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 20 4 C 20 2, 17 1, 15 3" stroke="#FF9B54" strokeWidth="1.5" strokeLinecap="round" />
            {/* Clock stand legs */}
            <line x1="5" y1="22" x2="2" y2="25" stroke="#FF9B54" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="19" y1="22" x2="22" y2="25" stroke="#FF9B54" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Flying Paper Plane (Aspirational journey element) */}
          <motion.g
            animate={{
              x: [0, 10, 0],
              y: [0, -8, 0],
              rotate: [0, 4, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            transform="translate(180, 100)"
          >
            {/* Connecting dashed trail */}
            <path d="M -40 50 C -20 20, -10 10, 0 0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 3" />
            {/* Paper plane body */}
            <polygon points="0,0 20,-5 12,12 8,5" fill="none" stroke="#FF9B54" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="8,5 20,-5 10,4" fill="none" stroke="#FF9B54" strokeWidth="1" />
          </motion.g>

          {/* Student 1 (Left student studying - Boy with glasses) */}
          <g transform="translate(68, 195)">
            {/* Hair */}
            <path d="M 12 25 C 10 15, 20 8, 30 12 C 35 15, 38 22, 38 28 C 30 26, 20 28, 12 25 Z" fill="#FF9B54" opacity="0.3" />
            <path d="M 12 25 C 10 15, 20 8, 30 12 C 35 15, 38 22, 38 28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Head profile */}
            <circle cx="25" cy="30" r="12" stroke="#3b82f6" strokeWidth="2" fill="#0C1825" />
            {/* Glasses */}
            <circle cx="21" cy="28" r="4" stroke="#FF9B54" strokeWidth="1.5" fill="none" />
            <circle cx="29" cy="28" r="4" stroke="#FF9B54" strokeWidth="1.5" fill="none" />
            <line x1="25" y1="28" x2="25" y2="28" stroke="#FF9B54" strokeWidth="1.5" />
            {/* Body / Sweater */}
            <path d="M 10 52 C 10 42, 40 42, 40 52 L 40 85 L 10 85 Z" stroke="#3b82f6" strokeWidth="2" fill="#0C1825" />
            {/* Hands holding book */}
            <path d="M 14 62 L 24 72 L 32 64" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Book */}
            <path d="M 20 74 L 28 65 L 36 74 Z" stroke="#FF9B54" strokeWidth="1.5" fill="#0C1825" />
          </g>

          {/* Student 2 (Right student studying - Girl with bow) */}
          <g transform="translate(192, 192)">
            {/* Hair */}
            <path d="M 10 25 C 8 10, 32 10, 30 25" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 12 10 C 12 5, 28 5, 28 10" stroke="#FF9B54" strokeWidth="1.5" strokeLinecap="round" fill="none" /> {/* Bow tie */}
            {/* Head profile */}
            <circle cx="20" cy="30" r="12" stroke="#10b981" strokeWidth="2" fill="#0C1825" />
            {/* Smile / Eye */}
            <path d="M 16 32 C 18 35, 22 35, 24 32" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="22" cy="27" r="1" fill="#10b981" />
            {/* Body */}
            <path d="M 5 52 C 5 42, 35 42, 35 52 L 35 88 L 5 88 Z" stroke="#10b981" strokeWidth="2" fill="#0C1825" />
            {/* Hands holding open book */}
            <path d="M 8 64 C 15 72, 25 72, 32 64" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Open book */}
            <path d="M 12 66 L 20 72 L 28 66 L 28 80 L 20 86 L 12 80 Z" stroke="#FF9B54" strokeWidth="1.5" fill="#0C1825" />
            <line x1="20" y1="72" x2="20" y2="86" stroke="#FF9B54" strokeWidth="1.5" />
          </g>

          <defs>
            {/* Gradients */}
            <linearGradient id="lampLightBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9B54" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF9B54" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle AI Assistant Dost Bubble (Matches the DOST/helper bubble concept) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="absolute bottom-5 right-5 max-w-[210px] z-30 group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF9B54] to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-35 transition-opacity" />
          <div className="relative p-3.5 rounded-xl bg-[#0D1520]/95 border border-white/10 flex items-start gap-2.5 backdrop-blur-md shadow-lg shadow-black/40">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none flex items-center gap-1">
                <span>PrepEntrance AI Mentor</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
              </p>
              <p className="text-white/70 text-[9px] leading-relaxed font-semibold">
                "Kinematics doubt solved. Snapped formula checklist loaded for quick boards revision."
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default StudyVisual;
