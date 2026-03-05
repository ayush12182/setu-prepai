import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { getChapterById } from '@/data/syllabus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Quote, Download, Copy, CheckCircle2, FlaskConical, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Mock data generator for Foundation notes based on subject and chapter
const generateMockNotes = (chapterName: string, subject: string) => {
    return {
        introduction: `Welcome to the ${chapterName} notes. This structured revision material is designed to help you quickly review key concepts before an exam or practice session. Let's make learning simple and effective!`,
        definitions: [
            { term: "Core Concept", definition: `The main underlying principle governing ${chapterName}.` },
            { term: "Key Terminology", definition: "A specific word or phrase used extensively in this topic." }
        ],
        formulas: [
            "Formula A = x * y",
            "Concept Rule: Always check the base variables before evaluating."
        ],
        summary: "In conclusion, mastering this chapter requires understanding the core concept, memorizing the key terminology, and applying the formulas in practical scenarios. Regular practice will solidify your foundation.",
        subjectAccent: subject === 'mathematics' ? 'text-violet-500 bg-violet-500/10' :
            subject === 'science' ? 'text-emerald-500 bg-emerald-500/10' :
                subject === 'social_science' ? 'text-amber-500 bg-amber-500/10' :
                    'text-sky-500 bg-sky-500/10'
    };
};

const ChapterNotesPage: React.FC = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const chapter = chapterId ? getChapterById(chapterId) : null;

    if (!chapter) {
        return (
            <MainLayout title="Notes Not Found">
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-muted-foreground mb-4">Chapter not found</p>
                    <Button onClick={() => navigate('/learn')}>Back to Learn</Button>
                </div>
            </MainLayout>
        );
    }

    const notes = generateMockNotes(chapter.name, chapter.subject);

    const handleCopy = () => {
        navigator.clipboard.writeText(`Notes for ${chapter.name}\n\n${notes.summary}`);
        setCopied(true);
        toast.success('Notes copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        toast.success('Downloading PDF... (Mock)');
    };

    return (
        <MainLayout title={`Notes: ${chapter.name}`}>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">

                {/* Breadcrumb & Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/chapter/${chapter.id}`)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            {chapter.name}
                        </h1>
                        <p className="text-sm text-muted-foreground capitalize flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${notes.subjectAccent}`}>
                                {chapter.subject.replace('_', ' ')}
                            </span>
                            • Quick Revision Notes
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy} className="hidden sm:flex">
                            {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="default" size="sm" onClick={handleDownload} className="hidden sm:flex">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* 1. Introduction */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-0 shadow-sm bg-primary/5">
                        <CardContent className="pt-6">
                            <p className="text-foreground leading-relaxed">
                                {notes.introduction}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 2. Key Definitions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-amber-500" />
                                <CardTitle className="text-lg">Key Terms & Definitions</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {notes.definitions.map((def, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 rounded-xl bg-secondary/30">
                                    <div className="font-semibold text-foreground min-w-[150px] shrink-0">
                                        {def.term}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {def.definition}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. Formulas & Rules */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-emerald-500" />
                                <CardTitle className="text-lg">{chapter.subject === 'mathematics' || chapter.subject === 'physics' ? 'Important Formulas' : 'Key Rules / Dates'}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notes.formulas.map((form, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-border/50 bg-card font-mono text-sm text-foreground shadow-sm flex items-center justify-center text-center">
                                        {form}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 4. Exam Summary & Tip */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border border-border shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <Quote className="w-8 h-8 text-primary/40 shrink-0" />
                                <div>
                                    <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-rose-500" /> Jeetu Bhaiya's Summary
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {notes.summary}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Call */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="flex justify-center pt-8 gap-4"
                >
                    <Button variant="outline" size="lg" onClick={() => navigate(`/practice?chapter=${chapter.id}`)}>
                        Practice Questions
                    </Button>
                    <Button variant="default" size="lg" onClick={() => navigate(`/test?chapter=${chapter.id}`)}>
                        Take Chapter Test
                    </Button>
                </motion.div>

            </div>
        </MainLayout>
    );
};

export default ChapterNotesPage;
