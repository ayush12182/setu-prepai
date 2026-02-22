import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Users, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALL_ROOMS } from '@/data/circlesData';
import { useExamMode } from '@/contexts/ExamModeContext';

export const CirclesDashboardCard: React.FC = () => {
    const navigate = useNavigate();
    const { examMode } = useExamMode();

    const examRooms = ALL_ROOMS.filter(r => r.exam === examMode);
    const baseTotal = examRooms.reduce((sum, r) => sum + r.baseStudentCount, 0);

    const [liveCount, setLiveCount] = useState(baseTotal);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount(prev => Math.max(50, prev + Math.floor(Math.random() * 11) - 5));
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Pick the top 3 most active rooms for this exam
    const topRooms = [...examRooms]
        .sort((a, b) => b.baseStudentCount - a.baseStudentCount)
        .slice(0, 3);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.06)] group">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[hsl(32_79%_57%)] via-[hsl(350_65%_55%)] to-[hsl(280_50%_55%)]" />

            {/* Background glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="p-5 sm:p-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(32_79%_57%)] to-[hsl(350_65%_55%)] flex items-center justify-center shadow-md flex-shrink-0">
                            <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-foreground leading-tight">SETU Commune</h3>
                            <p className="text-xs text-muted-foreground">Study together with students preparing like you.</p>
                        </div>
                    </div>

                    {/* Live counter badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-600">{liveCount.toLocaleString()}</span>
                        <Users className="w-3 h-3 text-emerald-600" />
                    </div>
                </div>

                {/* Live room previews */}
                <div className="space-y-1.5 mb-4">
                    {topRooms.map(room => (
                        <div
                            key={room.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                            onClick={() => navigate(`/circles/${room.id}`)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs font-medium text-foreground truncate">{room.topic}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                {room.baseStudentCount} students
                            </span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <Button
                    className="w-full gap-2 bg-gradient-to-r from-[hsl(32_79%_57%)] to-[hsl(25_85%_55%)] text-white hover:opacity-90 transition-opacity shadow-md"
                    onClick={() => navigate('/circles')}
                >
                    <Flame className="w-4 h-4" />
                    Join a Focus Room
                    <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
            </div>
        </div>
    );
};
