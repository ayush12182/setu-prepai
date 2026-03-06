import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { getChapterById } from '@/data/syllabus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Copy, CheckCircle2, Loader2, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useClassContext } from '@/contexts/ClassContext';


const ChapterNotesPage: React.FC = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    // AI States
    const [notes, setNotes] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasAttemptedGen, setHasAttemptedGen] = useState(false);

    const { language } = useLanguage();
    const { isNeet, isCuet } = useExamMode();
    const { isFoundation, classLabel } = useClassContext();

    const chapter = chapterId ? getChapterById(chapterId) : null;

    useEffect(() => {
        if (chapter && !hasAttemptedGen) {
            generateNotes();
        }
    }, [chapter, hasAttemptedGen]);

    const generateNotes = async () => {
        if (!chapter) return;
        setIsGenerating(true);
        setHasAttemptedGen(true);
        setNotes('');

        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                    chapterName: chapter.name,
                    subject: chapter.subject,
                    topics: chapter.topics || [],
                    formulas: chapter.keyFormulas || [],
                    examTips: chapter.examTips || [],
                    language,
                    examMode: isFoundation ? `Class ${classLabel} (Foundation)` : isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE'
                }),
            });

            if (!response.ok) throw new Error('Failed to generate notes');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullNotes = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const json = JSON.parse(line.slice(6));
                            const content = json.choices?.[0]?.delta?.content;
                            if (content) { fullNotes += content; setNotes(fullNotes); }
                        } catch { /* Skip invalid JSON */ }
                    }
                }
            }
        } catch (error) {
            console.error('Error generating notes:', error);
            toast.error('Failed to generate AI notes. Please try again.');
            setNotes(`## Error Generation\nFailed to generate notes for ${chapter.name}. Please verify your connectivity or try again later.`);
        } finally {
            setIsGenerating(false);
        }
    };

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

    const subjectStr = chapter.subject as string;
    const subjectAccent = subjectStr === 'mathematics' ? 'text-violet-500 bg-violet-500/10 border-violet-500/20' :
        subjectStr === 'science' || subjectStr === 'physics' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
            subjectStr === 'social_science' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                'text-sky-500 bg-sky-500/10 border-sky-500/20';

    const handleCopy = () => {
        navigator.clipboard.writeText(`Notes for ${chapter.name}\n\n${notes}`);
        setCopied(true);
        toast.success('Notes copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        toast.success('Downloading PDF... (To be implemented)');
    };

    const renderNotes = (content: string) => {
        return content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-2 mb-4 text-foreground">{line.slice(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className={`text-xl font-bold mt-8 mb-4 flex items-center gap-2 text-foreground`}>
                <Layers className="w-5 h-5 text-accent" />
                {line.slice(3)}
            </h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground/90">{line.slice(4)}</h3>;
            if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 my-1.5 text-muted-foreground list-disc marker:text-accent/50">{line.slice(2).replace(/\*\*/g, '')}</li>;
            if (line.startsWith('⚡') || line.startsWith('💡')) return <p key={i} className="ml-4 my-3 text-setu-saffron font-medium bg-accent/5 p-3 rounded-lg border border-accent/10">{line.replace(/\*\*/g, '')}</p>;
            if (line.startsWith('---')) return <hr key={i} className="my-6 border-border/50" />;
            if (line.match(/^\d+\./)) return <p key={i} className="ml-4 my-2 font-medium text-foreground/80">{line.replace(/\*\*/g, '')}</p>;
            if (line.trim()) {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return <p key={i} className="my-3 text-muted-foreground leading-relaxed">
                    {parts.map((p, x) => p.startsWith('**') && p.endsWith('**') ? <strong key={x} className="font-semibold text-foreground/90">{p.slice(2, -2)}</strong> : p)}
                </p>;
            }
            return <br key={i} />;
        });
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
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${subjectAccent}`}>
                                {chapter.subject.replace('_', ' ')}
                            </span>
                            • AI Accelerated Notes
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

                {/* Generated AI Notes Area */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border border-border shadow-sm min-h-[400px]">
                        <CardContent className="pt-6 relative">
                            {isGenerating && notes === '' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mb-6 shadow-lg shadow-accent/20 animate-pulse">
                                        <BookOpen className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Crafting your AI Notes</h3>
                                    <p className="text-muted-foreground text-center max-w-sm">
                                        Analyzing {chapter.topics?.length || 0} topics and pulling targeted exam patterns...
                                    </p>
                                    <div className="flex gap-1 mt-6">
                                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                    {renderNotes(notes)}
                                    {isGenerating && <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1 align-middle" />}
                                </div>
                            )}
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
