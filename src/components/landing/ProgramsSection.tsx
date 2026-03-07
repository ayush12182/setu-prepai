import React from 'react';
import { Brain, Rocket, Zap, ArrowRight, BookOpen, FlaskConical, Calculator, Globe, Languages, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const programs = [
    {
        id: 'foundation',
        name: 'SETU Foundation',
        tagline: 'Build unshakeable fundamentals',
        classes: 'Classes 6 – 10',
        icon: Brain,
        gradient: 'from-emerald-500 to-teal-600',
        borderColor: 'border-emerald-500/30',
        glowColor: 'bg-emerald-500',
        accentText: 'text-emerald-400',
        subjects: [
            { icon: Calculator, name: 'Mathematics' },
            { icon: FlaskConical, name: 'Science (Phy + Chem + Bio)' },
            { icon: Globe, name: 'Social Science' },
            { icon: Languages, name: 'English' },
            { icon: Lightbulb, name: 'Logical Reasoning' },
        ],
        features: [
            'Full NCERT Syllabus Coverage',
            'Concept → Practice → Test flow',
            'AI-generated notes in simple language',
            'Diagnostic test + personal learning path',
            'Prepares naturally for JEE, NEET & Olympiads',
        ],
        purpose: 'Conceptual learning without competitive pressure. Master fundamentals that naturally prepare you for any future exam.',
    },
    {
        id: 'jee_core',
        name: 'SETU JEE Core',
        tagline: 'Master the JEE foundation',
        classes: 'Class 11',
        icon: Rocket,
        gradient: 'from-amber-500 to-orange-600',
        borderColor: 'border-amber-500/30',
        glowColor: 'bg-amber-500',
        accentText: 'text-amber-400',
        subjects: [
            { icon: FlaskConical, name: 'Physics' },
            { icon: FlaskConical, name: 'Chemistry' },
            { icon: Calculator, name: 'Mathematics' },
        ],
        features: [
            'JEE Main + Advanced syllabus',
            '21-day structured learning cycles',
            'PYQ-focused practice sessions',
            'Adaptive weak-area detection',
            'Full JEE simulation mock tests',
        ],
        purpose: 'Build strong JEE fundamentals through structured cycles, daily practice, and AI-powered gap analysis.',
    },
    {
        id: 'jee_advanced',
        name: 'SETU JEE Advanced',
        tagline: 'Crack the toughest exam',
        classes: 'Class 12',
        icon: Zap,
        gradient: 'from-violet-500 to-purple-600',
        borderColor: 'border-violet-500/30',
        glowColor: 'bg-violet-500',
        accentText: 'text-violet-400',
        subjects: [
            { icon: FlaskConical, name: 'Physics' },
            { icon: FlaskConical, name: 'Chemistry' },
            { icon: Calculator, name: 'Mathematics' },
        ],
        features: [
            'Advanced problem-solving techniques',
            'Full-length mock tests every 21 days',
            'Targeted weak‑area elimination',
            'Time management & exam strategy',
            'Rank prediction & performance analytics',
        ],
        purpose: 'Advanced-level preparation with intensive mock testing, strategic revision, and top-tier rank targeting.',
    },
];

const journeySteps = [
    { step: '01', label: 'Program', desc: 'Choose your learning level' },
    { step: '02', label: 'Class', desc: 'We load your exact syllabus' },
    { step: '03', label: 'Subject', desc: 'Maths, Science, English & more' },
    { step: '04', label: 'Chapter', desc: 'NCERT-mapped chapters' },
    { step: '05', label: 'Concept', desc: 'Bite-sized learning units' },
    { step: '06', label: 'Practice', desc: '3-level difficulty system' },
    { step: '07', label: 'Test', desc: 'Assess, track & improve' },
];

export const ProgramsSection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section id="programs" className="relative py-28 px-6 sm:px-12 overflow-hidden bg-primary">
            {/* Background */}
            <div className="absolute inset-0 opacity-15">
                <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-accent rounded-full blur-[200px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-500 rounded-full blur-[180px]" />
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-5 tracking-wide">
                        Programs
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                        One platform,{' '}
                        <span className="text-accent">three powerful programs</span>
                    </h2>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto">
                        From building fundamentals in Class 6 to cracking JEE Advanced in Class 12 — SETU adapts to your exact level.
                    </p>
                </motion.div>

                {/* Learning Hierarchy Path */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-20"
                >
                    <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 sm:p-8 overflow-x-auto">
                        <p className="text-xs font-bold uppercase tracking-widest text-accent mb-6 text-center">
                            Your Learning Journey
                        </p>
                        <div className="flex items-center justify-between min-w-[700px] gap-1">
                            {journeySteps.map((item, i) => (
                                <React.Fragment key={item.step}>
                                    <div className="flex flex-col items-center text-center w-24 shrink-0">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center mb-2">
                                            <span className="text-xs font-black text-accent">{item.step}</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">{item.label}</span>
                                        <span className="text-[10px] text-white/40 mt-0.5 leading-tight">{item.desc}</span>
                                    </div>
                                    {i < journeySteps.length - 1 && (
                                        <ArrowRight className="w-4 h-4 text-accent/40 shrink-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Program Cards */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {programs.map((prog, i) => (
                        <motion.div
                            key={prog.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`group relative bg-white/[0.04] backdrop-blur-sm border ${prog.borderColor} rounded-2xl p-7 hover:bg-white/[0.08] transition-all duration-500 overflow-hidden`}
                        >
                            {/* Hover Glow */}
                            <div className={`absolute -bottom-20 -right-20 w-40 h-40 ${prog.glowColor} rounded-full opacity-0 group-hover:opacity-[0.08] blur-3xl transition-all duration-500`} />

                            {/* Header */}
                            <div className="relative flex items-center gap-4 mb-5">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${prog.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <prog.icon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors duration-300">{prog.name}</h3>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${prog.accentText}`}>{prog.classes}</p>
                                </div>
                            </div>

                            {/* Tagline */}
                            <p className="relative text-white/70 text-sm mb-5 leading-relaxed">{prog.purpose}</p>

                            {/* Subjects */}
                            <div className="relative mb-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Subjects</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {prog.subjects.map((sub) => (
                                        <span key={sub.name} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[11px] text-white/60">
                                            <sub.icon className="w-3 h-3" />
                                            {sub.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="relative space-y-2 mb-6">
                                {prog.features.map((feat) => (
                                    <div key={feat} className="flex items-start gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${prog.glowColor} mt-1.5 shrink-0`} />
                                        <span className="text-xs text-white/50">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => navigate('/auth')}
                                className={`relative w-full py-3 rounded-xl bg-gradient-to-r ${prog.gradient} text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]`}
                            >
                                Start {prog.name}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
