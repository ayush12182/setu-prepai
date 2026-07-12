import React from 'react';
import { Check } from 'lucide-react';

/* ─────────────────────────────────────────
   AARAMBH — JEE/NEET Study Planner + OMR + Timer + Pencil
   Exactly matching the reference screenshot layout
───────────────────────────────────────── */
export const AarambhIllustration = () => (
  <div className="relative w-full h-full" style={{ minHeight: 180 }}>

    {/* Very subtle background: faint atom line-art + formula */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04] select-none">
      <svg viewBox="0 0 200 200" className="absolute -top-4 -right-4 w-32 h-32 text-blue-900" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="100" cy="100" rx="80" ry="30" transform="rotate(0 100 100)" />
        <ellipse cx="100" cy="100" rx="80" ry="30" transform="rotate(60 100 100)" />
        <ellipse cx="100" cy="100" rx="80" ry="30" transform="rotate(120 100 100)" />
        <circle cx="100" cy="100" r="8" fill="currentColor" />
      </svg>
      <span className="absolute bottom-4 left-0 text-[18px] font-bold text-blue-900">E=mc²</span>
    </div>

    {/* OMR sheet — angled, slightly behind, left side */}
    <div
      className="absolute bg-white rounded border border-slate-200 shadow-md overflow-hidden"
      style={{ width: 120, height: 90, left: -4, bottom: 10, transform: 'rotate(-8deg)', zIndex: 1 }}
    >
      <div className="p-2 pt-1.5">
        <div className="h-1.5 bg-slate-100 rounded w-full mb-2" />
        <div className="grid grid-cols-5 gap-x-1.5 gap-y-1.5">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full border border-slate-300" />
          ))}
        </div>
      </div>
    </div>

    {/* Main Study Planner clipboard — slightly rotated, front-center-right */}
    <div
      className="absolute bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.13)] border border-slate-200 overflow-hidden"
      style={{ width: 128, height: 150, right: 8, top: 4, transform: 'rotate(-3deg)', zIndex: 2 }}
    >
      {/* Blue spiral top bar */}
      <div className="h-7 bg-blue-600 flex items-center justify-center gap-1">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
        ))}
      </div>
      <div className="px-3 pt-2 pb-1">
        <div className="text-center font-black text-blue-900 text-[10px] tracking-widest uppercase leading-tight">JEE / NEET</div>
        <div className="text-center font-bold text-slate-400 text-[8px] uppercase tracking-widest mb-2">STUDY PLAN</div>
        {/* Subject checklist rows */}
        {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map((sub, i) => (
          <div key={sub} className="flex items-center gap-1.5 mb-1.5">
            <div className={`w-3 h-3 rounded flex items-center justify-center shrink-0 ${i < 3 ? 'bg-blue-500' : 'border border-slate-300'}`}>
              {i < 3 && <Check className="w-2 h-2 text-white stroke-[4]" />}
            </div>
            <span className={`text-[9px] font-semibold ${i < 3 ? 'text-slate-700' : 'text-slate-400'}`}>{sub}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Stopwatch — bottom right, dark */}
    <div
      className="absolute bg-slate-800 rounded-full flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.35)] border-[3px] border-slate-700"
      style={{ width: 52, height: 52, right: 4, bottom: 8, zIndex: 3 }}
    >
      <div
        className="absolute bg-slate-500 rounded-sm"
        style={{ width: 12, height: 7, top: -6, left: '50%', transform: 'translateX(-50%)' }}
      />
      <div
        className="absolute bg-slate-500 rounded-sm"
        style={{ width: 8, height: 6, top: -5, right: 10, transform: 'rotate(40deg)' }}
      />
      <div className="text-emerald-400 font-mono text-[11px] font-black leading-none">00:45</div>
      <div className="text-slate-400 text-[7px] font-medium">TIMER</div>
    </div>

    {/* Pencil — diagonal, bottom */}
    <div
      className="absolute"
      style={{ left: 20, bottom: 2, zIndex: 3, transform: 'rotate(-18deg)' }}
    >
      <div className="flex items-stretch" style={{ width: 100, height: 10 }}>
        {/* Eraser */}
        <div className="w-5 bg-pink-300 rounded-l-sm border-r border-slate-300 flex-shrink-0" />
        {/* Body */}
        <div className="flex-1 bg-amber-400 border-b border-amber-500" />
        {/* Tip */}
        <div
          style={{
            width: 0, height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '10px solid #fcd34d',
            flexShrink: 0,
          }}
        />
        {/* Lead */}
        <div
          style={{
            width: 0, height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '5px solid #1e293b',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   AAROHAN — Mock Test Analysis dashboard + PYQ books + pen
   Exactly matching the reference screenshot
───────────────────────────────────────── */
export const AarohanIllustration = () => (
  <div className="relative w-full h-full" style={{ minHeight: 180 }}>

    {/* Very subtle grid background */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: 'linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    />

    {/* OMR answer sheet — behind, left */}
    <div
      className="absolute bg-white rounded border border-slate-200 shadow-sm overflow-hidden"
      style={{ width: 90, height: 80, left: 0, bottom: 16, transform: 'rotate(6deg)', zIndex: 1 }}
    >
      <div className="p-1.5">
        <div className="h-1 bg-slate-100 rounded mb-1.5 w-[80%]" />
        <div className="grid grid-cols-4 gap-x-1.5 gap-y-1.5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full border border-slate-300" />
          ))}
        </div>
      </div>
    </div>

    {/* Main Analytics Tablet */}
    <div
      className="absolute bg-slate-900 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.25)] overflow-hidden"
      style={{ width: 152, height: 138, right: 6, top: 2, transform: 'rotate(-2deg)', zIndex: 2, border: '4px solid #0f172a' }}
    >
      <div className="bg-white w-full h-full p-2.5 flex flex-col">
        <div className="text-[8.5px] font-black text-slate-800 mb-1.5 tracking-wide uppercase">Mock Test Analysis</div>

        {/* Metrics row */}
        <div className="flex items-end justify-between mb-1">
          <div>
            <div className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Percentile</div>
            <div className="text-[20px] font-black text-slate-900 leading-none">97.34</div>
          </div>
          <div className="text-right">
            <div className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Accuracy</div>
            <div className="text-[14px] font-black text-slate-800 leading-none">85%</div>
          </div>
          <div className="w-6 h-6 rounded-full border-[2px] border-purple-500 flex items-center justify-center text-purple-700 font-black text-[9px]">
            98
          </div>
        </div>

        {/* Rank improvement */}
        <div className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Rank Improvement</div>
        <div className="text-[11px] font-black text-emerald-500 mb-1">+15,842</div>

        {/* Area chart */}
        <div className="flex-1 relative mt-auto">
          <svg viewBox="0 0 120 32" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <path d="M0,28 C15,28 20,24 30,20 C40,16 48,22 60,15 C72,8 85,18 95,10 C105,4 112,6 120,2 L120,32 L0,32 Z" fill="url(#purpleGrad)" />
            <path d="M0,28 C15,28 20,24 30,20 C40,16 48,22 60,15 C72,8 85,18 95,10 C105,4 112,6 120,2" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="95" cy="10" r="2" fill="#a855f7" />
            <circle cx="120" cy="2" r="2" fill="#a855f7" />
          </svg>
        </div>
      </div>
    </div>

    {/* PYQ Books stack — bottom right */}
    <div
      className="absolute"
      style={{ right: 2, bottom: 2, zIndex: 3, transform: 'rotate(8deg)' }}
    >
      {[
        { color: '#1e1b4b', label: 'PHYSICS PYQs', offset: 0 },
        { color: '#1e3a5f', label: 'CHEMISTRY PYQs', offset: 3 },
        { color: '#1e293b', label: 'MATHS PYQs', offset: 6 },
      ].map((book, i) => (
        <div
          key={book.label}
          className="flex items-center px-1.5 mb-0.5 rounded-sm shadow-sm"
          style={{
            width: 100,
            height: 14,
            backgroundColor: book.color,
            marginLeft: book.offset,
          }}
        >
          <span className="text-[6.5px] text-white/80 font-black tracking-widest whitespace-nowrap">{book.label}</span>
        </div>
      ))}
    </div>

    {/* Pen — diagonal bottom-left */}
    <div
      className="absolute"
      style={{ left: 16, bottom: 0, transform: 'rotate(22deg)', zIndex: 3 }}
    >
      <div className="flex items-stretch" style={{ width: 76, height: 8 }}>
        <div className="flex-1 bg-slate-800 border-b border-slate-900" />
        <div className="w-3 bg-slate-500 border-b border-slate-600 flex-shrink-0" />
        <div
          style={{
            width: 0, height: 0,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: '6px solid #64748b',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   SHIKHAR — JEE Main Mock Test result + Trophy + Dream College
   Exactly matching the reference screenshot
───────────────────────────────────────── */
export const ShikharIllustration = () => (
  <div className="relative w-full h-full" style={{ minHeight: 180 }}>

    {/* Very subtle institution silhouette background */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06] select-none">
      <svg viewBox="0 0 200 200" className="w-full h-full fill-slate-700">
        <rect x="55" y="80" width="90" height="100" rx="2" />
        <polygon points="100,30 155,80 45,80" />
        <rect x="85" y="130" width="30" height="50" />
        <rect x="65" y="95" width="20" height="25" />
        <rect x="115" y="95" width="20" height="25" />
        <circle cx="100" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    </div>

    {/* JEE Main Result Sheet — angled, left-center */}
    <div
      className="absolute bg-white rounded-lg shadow-[0_10px_28px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden"
      style={{ width: 110, height: 148, left: 2, top: 8, transform: 'rotate(5deg)', zIndex: 2 }}
    >
      <div className="px-3 pt-2 pb-2 h-full flex flex-col">
        <div className="text-center font-black text-slate-500 text-[8px] uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-2 leading-tight">
          JEE MAIN<br />Mock Test
        </div>

        <div className="text-center mb-2.5">
          <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">PERCENTILE</div>
          <div className="text-[28px] font-black text-slate-900 leading-none tracking-tight">99.46</div>
        </div>

        <div className="text-center mb-2.5">
          <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">AIR</div>
          <div className="text-[18px] font-black text-orange-600 leading-none">1,243</div>
        </div>

        <div className="text-center border-t border-slate-100 pt-1.5 mt-auto">
          <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">SCORE</div>
          <div className="text-[13px] font-black text-slate-800">275 / 300</div>
        </div>
      </div>
    </div>

    {/* Trophy — right side */}
    <div
      className="absolute flex flex-col items-center"
      style={{ right: 4, top: 6, zIndex: 3 }}
    >
      {/* Trophy SVG */}
      <svg width="72" height="72" viewBox="0 0 100 100" className="drop-shadow-xl">
        <defs>
          <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id="goldHandle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
        {/* Handles */}
        <path d="M28,22 C10,22 10,52 28,55" fill="none" stroke="url(#goldHandle)" strokeWidth="7" strokeLinecap="round" />
        <path d="M72,22 C90,22 90,52 72,55" fill="none" stroke="url(#goldHandle)" strokeWidth="7" strokeLinecap="round" />
        {/* Cup body */}
        <path d="M28,16 L72,16 L72,58 C72,74 62,82 50,82 C38,82 28,74 28,58 Z" fill="url(#goldGrad2)" />
        {/* Shine highlights */}
        <path d="M36,20 L36,55 C36,66 40,74 46,78" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" />
        {/* Stem */}
        <rect x="44" y="82" width="12" height="12" fill="#b45309" rx="1" />
        {/* Base plate */}
        <rect x="34" y="94" width="32" height="5" fill="#92400e" rx="1" />
        {/* Star inside */}
        <polygon points="50,28 53,37 63,37 55,43 58,52 50,46 42,52 45,43 37,37 47,37" fill="#fef08a" opacity="0.9" />
      </svg>

      {/* "YOUR DREAM COLLEGE" base */}
      <div
        className="bg-slate-900 rounded flex flex-col items-center justify-center px-2 py-1 shadow-xl border-t-2 border-slate-700"
        style={{ width: 80, marginTop: -2 }}
      >
        <div className="text-[7px] text-orange-300 font-black tracking-widest text-center leading-tight uppercase">
          YOUR<br />DREAM COLLEGE
        </div>
      </div>
    </div>
  </div>
);
